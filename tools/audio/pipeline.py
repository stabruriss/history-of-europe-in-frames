#!/usr/bin/env python3
"""Offline-first audio materials and an explicitly gated, resumable Edge TTS adapter."""
import argparse
import asyncio
from collections import Counter
from contextlib import contextmanager
import fcntl
import hashlib
import html
import importlib.metadata
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import unicodedata

from text import POLICY, ENTRY_ID, asset_ids, entry_records, parse_asset_id, render

HERE = Path(__file__).resolve().parent
PROJECT = HERE.parents[1]
EDGE_VERSION = '7.3.1'
OMISSIONS_PATH = HERE / 'approved_omissions.json'


def encoded(value):
    return json.dumps(value, ensure_ascii=False, sort_keys=True, separators=(',', ':')).encode('utf-8')


def digest(value):
    return hashlib.sha256(value).hexdigest()


def read_json(path):
    try:
        return json.loads(path.read_text(encoding='utf-8'))
    except (ValueError, OSError) as error:
        raise ValueError(str(path)+': '+repr(error)) from error


def atomic(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    temporary = path.with_name(path.name+'.pending-'+str(os.getpid()))
    try:
        temporary.write_bytes(data)
        temporary.replace(path)
    finally:
        temporary.unlink(missing_ok=True)


def save_json(path, value):
    atomic(path, json.dumps(value, ensure_ascii=False, indent=2).encode('utf-8')+b'\n')


@contextmanager
def lock(folder):
    folder.mkdir(parents=True, exist_ok=True)
    with (folder/'.lock').open('a') as handle:
        try:
            fcntl.flock(handle, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise ValueError('Another audio process owns '+str(folder))
        try:
            yield
        finally:
            fcntl.flock(handle, fcntl.LOCK_UN)


def within(folder, name):
    path = (folder/name).resolve()
    if not path.is_relative_to(folder.resolve()):
        raise ValueError('Path outside library/cache: '+str(name))
    return path


def slug(asset_id):
    parse_asset_id(asset_id)
    return asset_id.replace('/', '__')


def inspect_snapshot(snapshot, require_clean=True):
    if snapshot['schema'] != 1:
        raise ValueError('Unknown snapshot schema')
    if require_clean and snapshot['source']['dirty']:
        raise ValueError('Source files have uncommitted changes: '+str(snapshot['source']['dirty']))
    ids = [e['id'] for e in snapshot['entries']]
    if len(set(ids)) != len(ids) or not ids:
        raise ValueError('Empty/duplicate entry IDs')
    history_scenes = set()
    for e in snapshot['entries']:
        if not isinstance(e['id'],str) or not re.fullmatch(ENTRY_ID,e['id']):
            raise ValueError('Unsafe entry ID: '+str(e['id']))
        if e['kind'] not in ('history','topic') or not e['id'].startswith(e['kind']+'-') or not e['scenes']:
            raise ValueError('Invalid kind or empty entry: '+e['id'])
        for field in ('moments','boxes'):
            for item in e[field]:
                i = item['scene']
                if type(i) is not int or not 0 <= i < len(e['scenes']):
                    raise ValueError('Unassigned supplement: '+e['id'])
        # A narrow material selection never conceals malformed/unassigned source elsewhere.
        for record in entry_records(e):
            slug(record['id'])
        if e['kind'] == 'history':
            history_scenes.update(e['id']+'/'+str(i) for i in range(len(e['scenes'])))
    routes = snapshot['routes']
    if len({r['id'] for r in routes}) != len(routes):
        raise ValueError('Duplicate routes')
    covered = set()
    for r in routes:
        scenes = r['scenes']
        if len(set(scenes)) != len(scenes) or not set(scenes) <= history_scenes:
            raise ValueError('Duplicate/unknown scene in route '+r['id'])
        covered.update(scenes)
    if covered != history_scenes:
        raise ValueError('Unrouted historical scenes: '+str(sorted(history_scenes-covered)))
    all_ids = asset_ids(snapshot)
    if len(set(all_ids)) != len(all_ids):
        raise ValueError('Duplicate asset IDs')
    return all_ids


def catalog_for(snapshot):
    ids = inspect_snapshot(snapshot)
    return {'schema':1, 'policy':POLICY, 'sourceHash':digest(encoded(snapshot)),
            'tools':{name:digest((HERE/name).read_bytes()) for name in ('extract.cjs','text.py')},
            'source':snapshot['source'], 'ids':ids,
            # Audit the full source, including labels in material not selected/prepared this round.
            'retainedMetadata':[{'id':record['id'], **label}
                                for entry in snapshot['entries'] for record in entry_records(entry)
                                for label in record.get('retainedMetadata',[])],
            'counts':{'historySections':sum(e['kind']=='history' for e in snapshot['entries']),
                      'scenes':sum(len(e['scenes']) for e in snapshot['entries'] if e['kind']=='history'),
                      'topics':sum(e['kind']=='topic' for e in snapshot['entries']),
                      'moments':sum(len(e['moments']) for e in snapshot['entries']),
                      'boxes':sum(len(e['boxes']) for e in snapshot['entries']),
                      'people':sum(len(s['people']) for e in snapshot['entries'] for s in e['scenes']),
                      'assets':len(ids)}}


def check_source(snapshot, source):
    expected = {'src/history_entries.js','src/history_content.json','src/historical_figures.js'}
    if set(snapshot['source']['files']) != expected:
        raise ValueError('Unexpected source file inventory')
    for name, sha in snapshot['source']['files'].items():
        if digest(within(source,name).read_bytes()) != sha:
            raise ValueError('Source changed: '+name+'; prepare a new library directory')


def load_library(folder, source):
    snapshot, catalog = read_json(folder/'source.json'), read_json(folder/'catalog.json')
    expected = catalog_for(snapshot)
    if catalog.get('tools') != expected['tools']:
        raise ValueError('Extraction tools changed; prepare a new library directory')
    if catalog != expected:
        raise ValueError('Catalog/snapshot mismatch')
    check_source(snapshot, source)
    return snapshot, catalog


def item_paths(folder, asset_id):
    name = slug(asset_id)
    return folder/'items'/(name+'.json'), folder/'text'/(name+'.txt')


def clear_abandoned_writes(folder, catalog):
    # Called under the CLI's library lock. Only our exact, known temporary filenames.
    known = {'': {'source.json','catalog.json','validation.json','audio-state.json'},
             'items': {slug(i)+'.json' for i in catalog['ids']},
             'text': {slug(i)+'.txt' for i in catalog['ids']}}
    for sub, names in known.items():
        for path in (folder/sub).glob('*.pending-*'):
            match = re.fullmatch(r'(.+)\.pending-[0-9]+',path.name)
            if match and match[1] in names and path.is_file():
                path.unlink()


def entry_for(snapshot, asset_id):
    entry_id = asset_id.split('/')[0]
    return next(e for e in snapshot['entries'] if e['id'] == entry_id)


def prepare(folder, source, limit=25, only=None, selection=None):
    if only is not None and selection is not None:
        raise ValueError('Choose --only or --selection, not both')
    if not (folder/'catalog.json').exists():
        raw = subprocess.check_output(['node', str(HERE/'extract.cjs'), str(source)], timeout=40)
        snapshot = json.loads(raw)
        catalog = catalog_for(snapshot)
        save_json(folder/'source.json', snapshot)
        save_json(folder/'catalog.json', catalog)
    snapshot, catalog = load_library(folder, source)
    clear_abandoned_writes(folder,catalog)
    selected = select_ids(catalog['ids'], only if only is not None else selection)
    candidates = selected
    if only is None:
        candidates = [i for i in candidates if not item_paths(folder,i)[0].exists()]
    chosen = candidates[:limit]
    for asset_id in chosen:
        record = render(entry_for(snapshot,asset_id), asset_id)
        text = record.pop('text')
        meta, script = item_paths(folder,asset_id)
        atomic(script, text.encode('utf-8'))
        save_json(meta, record)
    report = validate(folder, source, selection=selected)
    report['preparedThisBatch'] = chosen
    return report


def select_ids(all_ids, only):
    if only is None:
        return all_ids
    if (not isinstance(only,(list,tuple)) or not only or not all(isinstance(i,str) for i in only) or
        len(set(only)) != len(only) or not set(only) <= set(all_ids)):
        raise ValueError('Unknown/duplicate/empty selection ID (--only or --selection)')
    return list(only)


def validate(folder, source, complete=False, selection=None):
    snapshot, catalog = load_library(folder, source)
    selected = select_ids(catalog['ids'],selection)
    records, catalog_missing = [], []
    expected_meta = {slug(i)+'.json' for i in catalog['ids']}
    expected_text = {slug(i)+'.txt' for i in catalog['ids']}
    for sub, expected in [('items',expected_meta),('text',expected_text)]:
        unexpected = [p.name for p in (folder/sub).glob('*') if p.is_file() and p.name not in expected]
        if unexpected:
            raise ValueError('Unexpected material files: '+str(unexpected))
    for asset_id in catalog['ids']:
        meta, script = item_paths(folder,asset_id)
        if not meta.exists():
            catalog_missing.append(asset_id)
            continue
        actual = read_json(meta)
        wanted = render(entry_for(snapshot,asset_id),asset_id)
        text = wanted.pop('text')
        if actual != wanted or script.read_bytes() != text.encode('utf-8'):
            raise ValueError('Material failed source round-trip: '+asset_id)
        records.append(actual)
    prepared_total = len(records)
    selected_set, missing_set = set(selected), set(catalog_missing)
    missing = [i for i in selected if i in missing_set]
    records = [r for r in records if r['id'] in selected_set]
    excluded = Counter()
    for record in records:
        excluded.update(record['excluded'])
    if complete and missing:
        raise ValueError('Incomplete library selection: %d missing assets' % len(missing))
    report = {'status':'complete' if not missing else 'partial', 'source':catalog['source'],
              'sourceHash':catalog['sourceHash'], 'expected':catalog['counts'], 'selected':len(selected),
              'preparedTotal':prepared_total, 'catalogMissing':len(catalog_missing),
              'prepared':len(records), 'missing':len(missing), 'next':missing[:25],
              'kinds':dict(Counter(r['kind'] for r in records)),
              'characters':sum(r['characters'] for r in records),
              'blocks':sum(len(r['blocks']) for r in records), 'excluded':dict(excluded),
              'retainedMetadata':[{**label, 'selected':label['id'] in selected_set}
                                  for label in catalog['retainedMetadata']],
              'longItems':[{'id':r['id'],'characters':r['characters']} for r in records if r['characters']>8000],
              'networkRequests':0, 'audioGenerated':False}
    save_json(folder/'validation.json',report)
    return report


def config_for(pitch):
    if pitch not in ('+0Hz','-5Hz'):
        raise ValueError('Choose --pitch=+0Hz or --pitch=-5Hz explicitly; production currently uses +0Hz')
    return {'provider':'edge-tts', 'package':EDGE_VERSION, 'voice':'zh-CN-YunjianNeural',
            'rate':'+0%', 'pitch':pitch, 'volume':'+0%', 'boundary':'WordBoundary'}


def input_hash(record, config):
    return digest(encoded({'textHash':record['textHash'],'config':config}))


def spoken_characters(s):
    # Service metadata may escape XML entities or format whitespace/punctuation differently.
    # U+02BE/U+02BF (ʾ/ʿ) are silent Arabic transliteration half-rings tokenized like apostrophes.
    return ''.join(c for c in unicodedata.normalize('NFKC',html.unescape(s))
                   if unicodedata.category(c)[0] in 'LN' and c not in '\u02be\u02bf')


def check_boundaries(script, boundaries, duration, approved_omission=None):
    wanted = spoken_characters(script)
    if approved_omission is not None:
        at, text = approved_omission.get('index'), approved_omission.get('text')
        if (type(at) is not int or not isinstance(text,str) or len(text) != 1 or
                not 0 <= at < len(wanted) or wanted[at] != text):
            raise ValueError('Invalid approved single-character omission')
        wanted = wanted[:at] + wanted[at+1:]
    actual = spoken_characters(''.join(b['text'] for b in boundaries))
    if not boundaries or actual != wanted:
        at = next((i for i,(a,b) in enumerate(zip(wanted,actual)) if a != b),min(len(wanted),len(actual)))
        raise ValueError('WordBoundary coverage differs at %d; expected %r, got %r; lengths %d/%d' %
                         (at,wanted[max(0,at-12):at+24],actual[max(0,at-12):at+24],len(wanted),len(actual)))
    previous = -1
    for b in boundaries:
        if b['offset'] < previous or b['duration'] < 0:
            raise ValueError('Non-monotonic word boundaries')
        previous = b['offset']
    end = (boundaries[-1]['offset']+boundaries[-1]['duration'])/10_000_000
    if end <= 0 or end > duration+0.5 or duration-end > 5:
        raise ValueError('Word boundary/audio duration mismatch')


def probe_audio(path):
    result = json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries',
        'format=duration,size:stream=codec_name,sample_rate,channels','-of','json',str(path)], timeout=60))
    if len(result['streams']) != 1:
        raise ValueError('Expected one audio stream')
    stream = result['streams'][0]
    duration = float(result['format']['duration'])
    if stream != {'codec_name':'mp3','sample_rate':'24000','channels':1} or duration <= 0:
        raise ValueError('Unexpected/empty Edge audio format')
    subprocess.run(['ffmpeg','-nostdin','-v','error','-xerror','-i',str(path),'-f','null','-'],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.PIPE, timeout=120)
    return {'duration':duration,'bytes':path.stat().st_size,**stream}


def check_receipt(cache, receipt, record, config, script):
    if receipt['inputHash'] != input_hash(record,config) or receipt['textHash'] != record['textHash'] or receipt['config'] != config:
        raise ValueError(record['id']+': cached audio input mismatch')
    path = within(cache,receipt['file'])
    if digest(path.read_bytes()) != receipt['audioHash']:
        raise ValueError(record['id']+': cached audio checksum mismatch')
    info = probe_audio(path)
    if info != receipt['audio']:
        raise ValueError(record['id']+': cached audio metadata mismatch')
    omission = receipt.get('approvedOmission')
    if omission is not None:
        # Approval applies to these exact input AND MP3 bytes, never to all short mismatches.
        approved = read_json(OMISSIONS_PATH).get(receipt['inputHash']+'/'+receipt['audioHash'])
        if (not approved or omission != approved or
                receipt.get('acceptance') != 'machine-checked-with-approved-omission'):
            raise ValueError(record['id']+': unapproved audio omission')
    elif receipt.get('acceptance') == 'machine-checked-with-approved-omission':
        raise ValueError(record['id']+': missing omission approval')
    check_boundaries(script,receipt['boundaries'],info['duration'],omission)


async def edge_stream(script, config):
    # This is the only network-capable path. Import is deliberately inside --execute.
    import edge_tts
    if importlib.metadata.version('edge-tts') != EDGE_VERSION:
        raise ValueError('Install the pinned tools/audio/requirements-tts.txt')
    client = edge_tts.Communicate(script,config['voice'],rate=config['rate'],pitch=config['pitch'],
                                  volume=config['volume'],boundary=config['boundary'])
    async for part in client.stream():
        yield part


async def make_audio(cache, record, script, config, timeout, stream_factory=edge_stream):
    key = input_hash(record,config)
    receipt_path = cache/'receipts'/(key+'.json')
    if receipt_path.exists():
        receipt = read_json(receipt_path)
        check_receipt(cache,receipt,record,config,script)
        return receipt, True
    pending = cache/'audio'/(key+'.partial.mp3')
    pending.parent.mkdir(parents=True,exist_ok=True)
    boundaries = []

    async def receive():
        with pending.open('wb') as audio:
            async for part in stream_factory(script,config):
                if part['type'] == 'audio':
                    audio.write(part['data'])
                elif part['type'] == 'WordBoundary':
                    boundaries.append({k:part[k] for k in ('text','offset','duration')})

    try:
        await asyncio.wait_for(receive(),timeout=timeout)
        info = probe_audio(pending)
        check_boundaries(script,boundaries,info['duration'])
        sha = digest(pending.read_bytes())
        final = cache/'audio'/(sha+'.mp3')
        pending.replace(final)
        receipt = {'inputHash':key,'textHash':record['textHash'],'config':config,'audioHash':sha,
                   'file':'audio/'+sha+'.mp3','audio':info,'boundaries':boundaries,
                   'acceptance':'machine-checked','listeningReview':'pending'}
        save_json(receipt_path,receipt)
        return receipt, False
    except Exception as error:
        # Retain failed evidence for diagnosis, never as an accepted cache entry or release input.
        failed = cache/'failed'/key
        failed.parent.mkdir(parents=True,exist_ok=True)
        if pending.exists():
            pending.replace(failed.with_suffix('.mp3'))
        save_json(failed.with_suffix('.json'),{'id':record['id'],'inputHash':key,'config':config,
                  'error':repr(error),'boundaries':boundaries,'acceptance':'failed'})
        raise
    finally:
        pending.unlink(missing_ok=True)


def receipt_path(cache, key):
    if not re.fullmatch(r'[0-9a-f]{64}',key):
        raise ValueError('Invalid receipt hash: '+str(key))
    return cache/'receipts'/(key+'.json')


def compact_receipt(receipt):
    # The potentially large boundary transcript lives only in its immutable receipt.
    return {**{k:receipt[k] for k in ('inputHash','textHash','audioHash','file','acceptance','listeningReview')},
            'duration':receipt['audio']['duration']}


def synthesize(folder, source, cache, pitch, limit=10, only=None, execute=False, timeout=300, selection=None):
    if only is not None and selection is not None:
        raise ValueError('Choose --only or --selection, not both')
    if execute and only is None and selection is None:
        raise ValueError('Execution requires an explicit --selection or --only authorization')
    selected_input = only if only is not None else selection
    validate(folder,source,selection=selected_input)
    snapshot, catalog = load_library(folder,source)
    config = config_for(pitch)
    state_file = folder/'audio-state.json'
    state = read_json(state_file) if state_file.exists() else {'schema':2,'cache':str(cache.resolve()),'items':{}}
    if state['schema'] != 2:
        raise ValueError('Old audio state schema; archive audio-state.json, keep the receipt cache, and rebuild state')
    if state['cache'] != str(cache.resolve()):
        raise ValueError('Use the same cache for this library')
    selected = select_ids(catalog['ids'],selected_input)
    jobs = []
    for asset_id in selected:
        meta, script_path = item_paths(folder,asset_id)
        if not meta.exists():
            if only or selection:
                raise ValueError('Prepare this item first: '+asset_id)
            continue
        record = read_json(meta)
        old = state['items'].get(asset_id)
        if not only and old and old['inputHash'] == input_hash(record,config):
            # Never silently trust old state: reuse also rechecks bytes, decode and coverage.
            receipt = read_json(receipt_path(cache,old['inputHash']))
            check_receipt(cache,receipt,record,config,script_path.read_text(encoding='utf-8'))
            if old != compact_receipt(receipt):
                raise ValueError(asset_id+': audio state/receipt mismatch')
            continue
        jobs.append((record,script_path))
        if len(jobs) == limit:
            break
    result = {'mode':'execute' if execute else 'dry-run','config':config,
              'jobs':[{'id':r['id'],'characters':r['characters'],'inputHash':input_hash(r,config),
                       'cachedReceipt':receipt_path(cache,input_hash(r,config)).exists()} for r,_ in jobs],
              'networkRequests':0,'saved':0,'reused':0}
    if not execute:
        return result
    with lock(cache):
        for abandoned in (cache/'audio').glob('*.partial.mp3'):
            if re.fullmatch(r'[0-9a-f]{64}\.partial\.mp3',abandoned.name):
                abandoned.unlink()
        for record, script_path in jobs:
            try:
                receipt, reused = asyncio.run(make_audio(cache,record,script_path.read_text(encoding='utf-8'),config,timeout))
                state['items'][record['id']] = compact_receipt(receipt)
                save_json(state_file,state)  # Commit each success, not the whole batch at the end.
                result['reused' if reused else 'saved'] += 1
                # A logical job may contain multiple Edge websocket chunks internally.
                result['networkRequests'] += 0 if reused else 1
                print(('REUSED ' if reused else 'SAVED ')+record['id'],file=sys.stderr,flush=True)
            except Exception as error:
                with (folder/'failures.jsonl').open('a',encoding='utf-8') as log:
                    log.write(json.dumps({'id':record['id'],'inputHash':input_hash(record,config),'error':repr(error)},ensure_ascii=False)+'\n')
                raise ValueError(record['id']+': '+repr(error)) from error  # No script-level retry or silent skip.
    return result


def verify_audio(folder, source, cache, pitch, selection=None):
    validate(folder,source,complete=True,selection=selection)
    _,catalog = load_library(folder,source)
    ids = select_ids(catalog['ids'],selection)
    config = config_for(pitch)
    state = read_json(folder/'audio-state.json')
    if state['schema'] != 2 or state['cache'] != str(cache.resolve()):
        raise ValueError('Wrong audio state schema/cache')
    duration, size = 0, 0
    omissions = []
    for asset_id in ids:
        meta,script = item_paths(folder,asset_id)
        record = read_json(meta)
        key = input_hash(record,config)
        receipt = read_json(receipt_path(cache,key))
        check_receipt(cache,receipt,record,config,script.read_text(encoding='utf-8'))
        if state['items'].get(asset_id) != compact_receipt(receipt):
            raise ValueError(asset_id+': audio state/receipt mismatch or missing audio')
        duration += receipt['audio']['duration']
        size += receipt['audio']['bytes']
        if receipt.get('approvedOmission'):
            omissions.append({'id':asset_id,'inputHash':key,'audioHash':receipt['audioHash'],
                              'approval':receipt['approvedOmission']})
    return {'status':'machine-checked-with-approved-omission' if omissions else 'machine-checked',
            'items':len(ids),'duration':duration,'bytes':size,
            'profile':config,'networkRequests':0,'listeningReview':'pending',
            **({'approvedOmissions':omissions} if omissions else {})}


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command',choices=['prepare','validate','synthesize','verify-audio'])
    parser.add_argument('--library',type=Path,required=True)
    parser.add_argument('--source',type=Path,default=PROJECT)
    parser.add_argument('--limit',type=int,default=25)
    choice = parser.add_mutually_exclusive_group()
    choice.add_argument('--only',action='append')
    choice.add_argument('--selection',type=Path,help='JSON ID list or scope: bound prepare/validate/synthesis/verification')
    parser.add_argument('--complete',action='store_true',help='Require every selected material (whole catalog without selection)')
    parser.add_argument('--cache',type=Path)
    parser.add_argument('--pitch',choices=['+0Hz','-5Hz'])
    parser.add_argument('--execute',action='store_true',help='Actually send text to Edge; synthesize only')
    parser.add_argument('--timeout',type=float,default=300)
    args = parser.parse_args(argv)
    if args.limit < 1 or args.timeout <= 0:
        parser.error('--limit and --timeout must be positive')
    if args.execute and args.command != 'synthesize':
        parser.error('--execute is only allowed with synthesize')
    selection = None
    if args.selection:
        scope = read_json(args.selection)
        selection = scope.get('ids') if isinstance(scope,dict) else scope
        if not isinstance(selection,list) or not selection:
            parser.error('Selection must be a nonempty ID list')
        if isinstance(scope,dict):
            if ('policy' in scope and (type(scope['policy']) is not int or scope['policy'] != POLICY) or
                'schema' in scope and (type(scope['schema']) is not int or scope['schema'] != 1)):
                parser.error('Selection schema/policy mismatch')
            if scope.get('profile'):
                config = config_for((args.pitch or '+0Hz') if args.command in ('prepare','validate') else args.pitch)
                if any(config.get(k) != v for k,v in scope['profile'].items()):
                    parser.error('Selected voice settings differ from the authorized scope profile')
    folder, source = args.library.resolve(), args.source.resolve()
    if folder == source or folder.is_relative_to(source):
        parser.error('Keep generated materials/audio outside the source worktree')
    if args.command != 'prepare' and not (folder/'catalog.json').exists():
        parser.error('Prepare a library first')
    with lock(folder):
        if args.command == 'prepare':
            result = prepare(folder,source,args.limit,args.only,selection)
        elif args.command == 'validate':
            result = validate(folder,source,args.complete,selection if selection is not None else args.only)
        else:
            cache = (args.cache or folder.parent/'audio-cache').resolve()
            if cache == source or cache.is_relative_to(source):
                parser.error('Keep audio cache outside the source worktree')
            if args.command == 'verify-audio':
                result = verify_audio(folder,source,cache,args.pitch,selection or args.only)
            else:
                result = synthesize(folder,source,cache,args.pitch,args.limit,args.only,args.execute,args.timeout,selection)
    print(json.dumps(result,ensure_ascii=False,indent=2))


if __name__ == '__main__':
    try:
        main()
    except (ValueError,KeyError,OSError,asyncio.TimeoutError,subprocess.SubprocessError) as error:
        print('ERROR: '+str(error),file=sys.stderr)
        sys.exit(1)
