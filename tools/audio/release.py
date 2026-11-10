#!/usr/bin/env python3
"""Publish checks and immutable Blob manifests. Upload is explicit; builds never synthesize/upload."""
import argparse
import json
import math
import os
from pathlib import Path
import re
import subprocess
import sys
from urllib.parse import quote, unquote, urlsplit
from urllib.request import Request, urlopen

import pipeline as p
from text import POLICY, asset_ids, parse_asset_id, render, tracks_for

PROJECT = p.PROJECT


def current_source(source):
    snapshot = json.loads(subprocess.check_output(['node',str(p.HERE/'extract.cjs'),str(source)],timeout=40))
    # Builds use current content, including edits; material libraries still require frozen sources.
    p.inspect_snapshot(snapshot,require_clean=False)
    return snapshot


def expanded_ids(snapshot, ids):
    wanted = set(ids)
    for track in tracks_for(snapshot,wanted).values():
        wanted.update(part['id'] for group in ('extras','people') for part in track[group])
        if track['titleId']:
            wanted.add(track['titleId'])
    wanted.update({i.split('/')[0]+'/title' for i in wanted if i.startswith('history-')})
    return wanted


def required_ids(snapshot, scope):
    """Selected lines/topics, their independent parts/titles, and explicit extra IDs."""
    if (not isinstance(scope.get('lines'),list) or not all(isinstance(i,str) for i in scope['lines']) or
        len(set(scope['lines'])) != len(scope['lines']) or type(scope.get('includeTopics',True)) is not bool):
        raise ValueError('Invalid scope lines/includeTopics')
    extra = scope.get('extraIds',[])
    if (not isinstance(extra,list) or not all(isinstance(i,str) for i in extra) or
        len(set(extra)) != len(extra) or not set(extra) <= set(asset_ids(snapshot))):
        raise ValueError('Unknown/duplicate extra audio IDs')
    routes = {r['id']:r['scenes'] for r in snapshot['routes']}
    wanted = {e['id'] for e in snapshot['entries'] if e['kind']=='topic' and scope.get('includeTopics',True)}
    for line in scope['lines']:
        if line not in routes:
            raise ValueError('Unknown covered line: '+line)
        scenes = routes[line]
        if line == 'rome':
            end = scope['romanLastScene']
            if end not in scenes:
                raise ValueError('Roman cutoff scene disappeared: '+end)
            scenes = scenes[:scenes.index(end)+1]
        wanted.update(scenes)
        wanted.update(i.split('/')[0]+'/title' for i in scenes)
    wanted.update(extra)
    return expanded_ids(snapshot,wanted)


def scope_contract(scope):
    authorized = {k:p.config_for('+0Hz')[k] for k in ('voice','pitch','rate','volume')}
    if (type(scope.get('schema')) is not int or scope['schema'] != 1 or
        type(scope.get('policy')) is not int or scope['policy'] != POLICY or scope.get('profile') != authorized):
        raise ValueError('Audio scope schema/profile/policy mismatch; authorized YunJian profile is required')
    if type(scope.get('includeTopics',True)) is not bool:
        raise ValueError('Invalid scope includeTopics')


def checked_scope(snapshot, scope):
    scope_contract(scope)
    ids = scope.get('ids')
    valid = set(asset_ids(snapshot))
    if (not isinstance(ids,list) or not all(isinstance(i,str) for i in ids) or
        len(set(ids)) != len(ids) or not set(ids) <= valid):
        raise ValueError('Audio scope contains duplicate/obsolete IDs; refresh scope')
    if set(ids) != required_ids(snapshot,scope):
        raise ValueError('Covered lines/topics changed; refresh scope and prepare the added audio')
    return ids


def public_url(url, audio_hash, host=None):
    u = urlsplit(url)
    if (u.scheme != 'https' or u.username or u.password or u.port or u.query or u.fragment or
        not re.fullmatch(r'[a-z0-9-]+\.public\.blob\.vercel-storage\.com',u.hostname or '') or
        u.path != '/audio/v1/'+audio_hash+'.mp3' or (host and u.hostname != host)):
        raise ValueError('Expected immutable public Blob URL (invalid host/path/query)')
    return u.hostname


def resolve_manifest(source, manifest_path, scope_path, allow_local=False, strict=False):
    """Deterministic offline input: no receipts, credentials, ledger, clock or network.
    Explicit local previews additionally verify the named MP3 bytes, not any cache index.
    """
    manifest_path = manifest_path.resolve()
    snapshot = current_source(source)
    scope, manifest = p.read_json(scope_path), p.read_json(manifest_path)
    if not isinstance(scope,dict) or not isinstance(manifest,dict):
        raise ValueError('Audio manifest and scope must be JSON objects')
    config = p.config_for('+0Hz')
    authorized = {k:config[k] for k in ('voice','pitch','rate','volume')}
    scope_contract(scope)
    if (type(manifest.get('schema')) is not int or manifest['schema'] != 2 or
        type(manifest.get('policy')) is not int or manifest['policy'] != POLICY or
        manifest.get('profile') != authorized):
        raise ValueError('Audio manifest/scope schema/profile/policy mismatch')
    assets = manifest.get('assets')
    if not isinstance(assets,dict):
        raise ValueError('Audio manifest assets must be an object')
    all_ids = asset_ids(snapshot); valid = set(all_ids)
    scope_warning = ''
    try:
        checked_scope(snapshot,scope)
    except ValueError as error:
        if strict:raise
        scope_warning = str(error)
    try:
        wanted = required_ids(snapshot,scope)
    except ValueError as error:
        if strict:raise
        # A renamed/removed route/cutoff also needs an editorial scope update, not a whole-site outage.
        scope_warning = str(error)
        wanted = expanded_ids(snapshot,set(scope['ids']) & valid)
    approved_host = scope.get('blobHost')
    if approved_host:host_value(approved_host)
    if (assets or strict) and not allow_local and not approved_host:
        raise ValueError('Set the approved blobHost in audio_scope.json before publishing public Blob assets')
    entries = {e['id']:e for e in snapshot['entries']}
    hosts, active, stale, obsolete = set(), {}, [], []
    for asset_id,item in assets.items():
        parse_asset_id(asset_id)
        if not isinstance(item,dict):raise ValueError(asset_id+': asset must be an object')
        # Invalid metadata/URLs are never softened into a missing-audio warning, even for obsolete IDs.
        for key in ('textHash','inputHash','audioHash'):
            if not isinstance(item.get(key),str) or not re.fullmatch(r'[a-f0-9]{64}',item[key]):
                raise ValueError(asset_id+': invalid '+key)
        if type(item.get('duration')) not in (int,float) or not math.isfinite(item['duration']) or item['duration']<=0:
            raise ValueError(asset_id+': invalid duration')
        if type(item.get('bytes')) is not int or item['bytes']<=0:
            raise ValueError(asset_id+': invalid bytes')
        url = item.get('url')
        if not isinstance(url,str):raise ValueError(asset_id+': invalid URL')
        parsed = urlsplit(url)
        if allow_local and not parsed.scheme and not parsed.netloc:
            if not parsed.path or parsed.query or parsed.fragment:
                raise ValueError(asset_id+': invalid local MP3 URL')
            local = (manifest_path.parent/unquote(parsed.path)).resolve()
            data = local.read_bytes()
            if p.digest(data) != item['audioHash'] or len(data) != item['bytes']:
                raise ValueError(asset_id+': local MP3 differs from manifest')
        else:
            if not approved_host:
                raise ValueError('Set the approved blobHost before using public Blob assets, including previews')
            hosts.add(public_url(url,item['audioHash'],approved_host))
        if asset_id not in valid or asset_id not in wanted:
            obsolete.append(asset_id);continue
        record = render(entries[asset_id.split('/')[0]],asset_id)
        if item['textHash'] != record['textHash'] or item['inputHash'] != p.input_hash(record,config):
            stale.append(asset_id);continue
        active[asset_id] = item
    if len(hosts)>1:
        raise ValueError('Do not mix stores in one release')
    # Optional loss never disables a body. Title loss disables historical bodies and their parts.
    missing_title = []
    for asset_id in list(active):
        if asset_id.startswith('history-') and not asset_id.endswith('/title'):
            if asset_id.split('/')[0]+'/title' not in active:
                missing_title.append(asset_id);del active[asset_id]
    pending = [i for i in all_ids if i in wanted and i not in active]
    if strict and (pending or obsolete):
        raise ValueError('Audio incomplete/outdated; text changed: '+str(stale)+'; missing: '+str(pending)+
                         '; obsolete: '+str(obsolete))
    report = {'status':'valid' if not pending and not obsolete and not scope_warning else 'partial',
              'assets':len(active),'required':len(wanted),'pending':pending,'stale':stale,
              'missingTitle':missing_title,'obsolete':obsolete,'scopeWarning':scope_warning,
              'public':not allow_local,'networkRequests':0}
    return {**manifest,'assets':active,'tracks':tracks_for(snapshot,wanted)},report


def check_manifest(source, manifest_path, scope_path, allow_local=False, remote=False, strict=False):
    manifest,report = resolve_manifest(source,manifest_path,scope_path,allow_local,strict or remote)
    urls = {a['url']:a['bytes'] for a in manifest['assets'].values()}
    if remote:
        if allow_local:raise ValueError('Remote checks require a public-only manifest')
        for url,size in urls.items():
            with urlopen(Request(url,headers={'Range':'bytes=0-0'}),timeout=30) as response:
                if (response.status!=206 or response.headers.get('Content-Range')!='bytes 0-0/'+str(size) or
                    response.headers.get_content_type()!='audio/mpeg' or len(response.read(1))!=1):
                    raise ValueError('Public MP3 range/MIME/size check failed: '+url)
    return {**report,'remoteChecked':len(urls) if remote else 0,'networkRequests':len(urls) if remote else 0}


def accepted(folder, source, cache, scope):
    snapshot,catalog = p.load_library(folder,source)
    ids = checked_scope(snapshot,scope)
    p.verify_audio(folder,source,cache,scope['profile']['pitch'],ids)
    state = p.read_json(folder/'audio-state.json')
    result = {}
    for asset_id in ids:
        key = state['items'][asset_id]['inputHash']
        result[asset_id] = p.read_json(p.receipt_path(cache,key))
    return snapshot,result


def host_value(host):
    if not isinstance(host,str) or not re.fullmatch(r'[a-z0-9-]+\.public\.blob\.vercel-storage\.com',host):
        raise ValueError('An approved project-specific --host is required, without https:// or a path')
    return host


def ledger_path(cache, host):
    return cache/'uploads'/(host_value(host)+'.json')


def upload(folder, source, cache, scope_path, host, execute=False, limit=25):
    scope = p.read_json(scope_path)
    _, receipts = accepted(folder,source,cache,scope)
    host = host or scope.get('blobHost')
    if host and scope.get('blobHost') and host != scope['blobHost']:
        raise ValueError('Upload host differs from the approved scope store')
    if execute:
        host_value(host)
        if host != scope.get('blobHost'):
            raise ValueError('Record the approved blobHost in audio_scope.json before uploading')
        if not os.environ.get('BLOB_READ_WRITE_TOKEN'):
            raise ValueError('No Blob write credential; authorize/connect the store first')
    ledger_file = ledger_path(cache,host) if host else None
    ledger = p.read_json(ledger_file) if ledger_file and ledger_file.exists() else {'schema':1,'host':host,'files':{}}
    if ledger['host'] != host:
        raise ValueError('Blob upload ledger belongs to another store')
    unique = {r['audioHash']:r for r in receipts.values()}
    pending = []
    for sha,r in unique.items():
        old = ledger['files'].get(sha)
        if old:
            public_url(old['url'],sha,host)
            if old['bytes'] != r['audio']['bytes']:
                raise ValueError('Upload ledger size mismatch: '+sha)
        else:
            pending.append(r)
    jobs = pending[:limit]
    report = {'mode':'upload' if execute else 'dry-run','assets':len(receipts),'uniqueFiles':len(unique),
              'pending':len(pending),'batch':len(jobs),'totalBytes':sum(r['audio']['bytes'] for r in unique.values()),
              'uploaded':0,'reusedRemote':0,'networkRequests':None if execute else 0,'host':host}
    if not execute:
        return report
    with p.lock(cache):
        for r in jobs:
            request = {'expectedHost':host,'file':str(p.within(cache,r['file'])),
                       'pathname':'audio/v1/'+r['audioHash']+'.mp3'}
            # Token is inherited in the environment, never passed in argv or returned in the manifest.
            child = subprocess.run(['node',str(p.HERE/'blob.cjs')],input=json.dumps(request),
                text=True,capture_output=True,timeout=300)
            if child.returncode:
                raise ValueError('Blob upload stopped: '+child.stderr.strip())
            result = json.loads(child.stdout)
            public_url(result['url'],r['audioHash'],host)
            ledger['files'][r['audioHash']] = {'url':result['url'],'bytes':r['audio']['bytes']}
            p.save_json(ledger_file,ledger)
            report['reusedRemote' if result['reused'] else 'uploaded'] += 1
            # SDK HEAD/PUT/retries are not instrumented; do not report logical jobs as HTTP request counts.
    return report


def make_manifest(folder, source, cache, scope_path, output, local=False, host=None):
    output = output.resolve()
    scope = p.read_json(scope_path)
    snapshot, receipts = accepted(folder,source,cache,scope)
    if not local:
        host = host or scope.get('blobHost')
        if not host or host != scope.get('blobHost'):
            raise ValueError('Public manifest requires the approved scope blobHost')
    uploads = {} if local else p.read_json(ledger_path(cache,host))['files']
    assets = {}
    for asset_id,r in receipts.items():
        if local:
            url = quote(Path(os.path.relpath(p.within(cache,r['file']),output.parent)).as_posix(),safe='/')
        else:
            uploaded = uploads.get(r['audioHash'])
            if not uploaded or uploaded['bytes'] != r['audio']['bytes']:
                raise ValueError(asset_id+': upload first; leaving the previous manifest unchanged')
            url = uploaded['url'];public_url(url,r['audioHash'],host)
        assets[asset_id] = {'url':url,'duration':r['audio']['duration'],'bytes':r['audio']['bytes'],
                           **{k:r[k] for k in ('textHash','inputHash','audioHash')}}
    manifest = {'schema':2,'policy':POLICY,'profile':scope['profile'],'source':snapshot['source'],'assets':assets}
    if local and output.resolve().is_relative_to(source.resolve()):
        raise ValueError('Local preview manifests must stay outside the source worktree')
    p.save_json(output,manifest)
    return {'status':'written','path':str(output),'assets':len(assets),'local':local,'networkRequests':0}


def refresh_scope(source, scope_path):
    snapshot = current_source(source)
    scope = p.read_json(scope_path)
    scope['policy'] = POLICY
    scope_contract(scope)
    wanted = required_ids(snapshot,scope)
    ids = [i for i in asset_ids(snapshot) if i in wanted]
    if set(ids) != wanted:
        raise ValueError('Unknown extra audio IDs')
    scope['ids'] = ids
    scope['sourceCommit'] = snapshot['source']['commit']
    entries = {e['id']:e for e in snapshot['entries']}
    records = [render(entries[i.split('/')[0]],i) for i in ids]
    scope['counts'] = {'scenes':sum(r['kind']=='scene' for r in records),'titles':sum(r['kind']=='title' for r in records),
                       'topics':sum(r['kind']=='topic' for r in records),
                       'moments':sum(r['kind']=='moment' for r in records),'boxes':sum(r['kind']=='box' for r in records),
                       'people':sum(r['kind']=='person' for r in records),'assets':len(ids),
                       'characters':sum(r['characters'] for r in records)}
    p.save_json(scope_path,scope)
    return scope['counts']


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=['check','upload','manifest','scope'])
    parser.add_argument('--source',type=Path,default=PROJECT)
    parser.add_argument('--scope',type=Path,default=PROJECT/'src/audio_scope.json')
    parser.add_argument('--manifest',type=Path,default=PROJECT/'src/audio_manifest.json')
    parser.add_argument('--library',type=Path)
    parser.add_argument('--cache',type=Path)
    parser.add_argument('--output',type=Path)
    parser.add_argument('--host',help='Approved public Blob hostname; verifies the write token belongs to this store')
    parser.add_argument('--local',action='store_true',help='Generate a preview-only manifest, outside source')
    parser.add_argument('--allow-local',action='store_true',help='Validate a preview; never used by builds')
    parser.add_argument('--remote',action='store_true',help='Explicit public Range check; implies --strict; not used by builds')
    parser.add_argument('--strict',action='store_true',help='Audio release gate: all scoped audio must be fresh and complete')
    parser.add_argument('--execute',action='store_true',help='Upload only: writes public Blob objects')
    parser.add_argument('--limit',type=int,default=25)
    a=parser.parse_args(argv)
    if a.execute and a.command!='upload':parser.error('--execute is only for upload')
    if a.limit<1:parser.error('--limit must be positive')
    source=a.source.resolve()
    if a.command=='check':
        result=check_manifest(source,a.manifest.resolve(),a.scope.resolve(),a.allow_local,a.remote,a.strict)
    elif a.command=='scope':
        result=refresh_scope(source,a.scope.resolve())
    else:
        if not a.library:parser.error('--library is required')
        folder=a.library.resolve();cache=(a.cache or folder.parent/'audio-cache').resolve()
        if cache==source or cache.is_relative_to(source):parser.error('Keep MP3 cache outside source')
        with p.lock(folder):
            if a.command=='upload':
                result=upload(folder,source,cache,a.scope,a.host,a.execute,a.limit)
            else:
                result=make_manifest(folder,source,cache,a.scope,(a.output or a.manifest).resolve(),a.local,a.host)
    print(json.dumps(result,ensure_ascii=False,indent=2))


if __name__=='__main__':
    try:main()
    except (ValueError,KeyError,OSError,subprocess.SubprocessError) as error:
        print('ERROR: '+str(error),file=sys.stderr);sys.exit(1)
