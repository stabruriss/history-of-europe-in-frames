import argparse
import json
import os
import sys
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit, urlunsplit

parser = argparse.ArgumentParser(description='Assemble the offline atlas from its source files.')
parser.add_argument('output', nargs='?', default='out.html')
parser.add_argument('--audio-manifest', type=Path, help='Preview manifest; relative audio URLs are relative to this manifest.')
args = parser.parse_args()
out = args.output
manifest_path = args.audio_manifest or Path('audio_manifest.json')
source = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(source / 'tools' / 'audio'))
from release import resolve_manifest
try:
    manifest, availability = resolve_manifest(source, manifest_path, source / 'src' / 'audio_scope.json',
                                               allow_local=bool(args.audio_manifest))
except (ValueError, KeyError, OSError) as error:
    parser.error('Audio manifest rejected: ' + str(error))
# Compact build log; release.py check prints the full pending list when needed.
summary = {k:({'count':len(v),'first':v[:10]} if isinstance(v,list) else v) for k,v in availability.items()}
print('Audio: ' + json.dumps(summary, ensure_ascii=False, separators=(',', ':')), file=sys.stderr)
if manifest.get('schema') != 2 or manifest.get('policy') != 3 or not isinstance(manifest.get('assets'), dict):
    parser.error('Audio manifest must have schema: 2, policy: 3 and an assets object')
# Inline the manifest, not the recordings. A preview can live anywhere without moving its MP3s.
for asset in manifest['assets'].values():
    url = urlsplit(asset['url'])
    if not url.scheme and not url.netloc and url.path and not url.path.startswith('/'):
        local = manifest_path.resolve().parent / unquote(url.path)
        relative = Path(os.path.relpath(local, Path(out).resolve().parent)).as_posix()
        asset['url'] = urlunsplit(('', '', quote(relative, safe='/'), url.query, url.fragment))
audio_json = json.dumps(manifest, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c').replace('\u2028', '\\u2028').replace('\u2029', '\\u2029')
# The player's one fixed notice for a part with no published audio, voiced with the approved profile and
# inlined so that it plays even when a recording is missing from the store.
import base64, hashlib
import pipeline
notice = json.loads(open('audio_gap_notice.json', encoding='utf-8').read())
approved = {k: v for k, v in pipeline.config_for('+0Hz').items() if k in ('voice', 'pitch', 'rate', 'volume')}
prefix = 'data:audio/mpeg;base64,'
clip = base64.b64decode(notice['url'][len(prefix):], validate=True) if str(notice.get('url', '')).startswith(prefix) else b''
if (notice.get('schema') != 1 or notice.get('profile') != approved or not clip or len(clip) != notice.get('bytes') or
        hashlib.sha256(clip).hexdigest() != notice.get('audioHash') or not notice.get('duration', 0) > 0):
    parser.error('audio_gap_notice.json must be the approved-voice MP3 data URI with matching bytes and audioHash')
notice_json = json.dumps({k: notice[k] for k in ('text', 'duration', 'url')}, ensure_ascii=False, separators=(',', ':')).replace('<', '\\u003c')
t = open('template.html', encoding='utf-8').read()
t = t.replace('/*__LEAFLET_CSS__*/', open('leaflet.css', encoding='utf-8').read())
t = t.replace('/*__LEAFLET_JS__*/', open('leaflet.js', encoding='utf-8').read())
t = t.replace('/*__GEO__*/', open('data.json', encoding='utf-8').read())
t = t.replace('/*__LABELS_DATES__*/', open('labels_dates.js', encoding='utf-8').read())
t = t.replace('/*__LEVANT_ENTRIES__*/', open('levante_entries.js', encoding='utf-8').read())
t = t.replace('/*__MARINE_LABELS__*/', open('marine_labels.js', encoding='utf-8').read())
t = t.replace('/*__LAYOUT_CSS__*/', open('layout.css', encoding='utf-8').read())
t = t.replace('/*__HISTORY_GEO__*/', open('history_geo.json', encoding='utf-8').read())
t = t.replace('/*__HISTORY_ENTRIES__*/', open('history_entries.js', encoding='utf-8').read())
t = t.replace('/*__HISTORY_CONTENT__*/', open('history_content.json', encoding='utf-8').read())
t = t.replace('/*__HISTORICAL_FIGURES__*/', open('historical_figures.js', encoding='utf-8').read())
t = t.replace('/*__ATLAS_UI__*/', open('atlas_ui.js', encoding='utf-8').read())
t = t.replace('/*__AUDIO_CSS__*/', open('audio_player.css', encoding='utf-8').read())
t = t.replace('/*__AUDIO_MANIFEST__*/', audio_json)
t = t.replace('/*__AUDIO_GAP_NOTICE__*/', notice_json)
t = t.replace('/*__AUDIO_PLAYER__*/', open('audio_player.js', encoding='utf-8').read())
t = t.replace('/*__METRO_CSS__*/', open('metro.css', encoding='utf-8').read())
t = t.replace('/*__METRO_PERIODS__*/', open('metro_periods.js', encoding='utf-8').read())
t = t.replace('/*__METRO_DESIGN__*/', open('metro_design.js', encoding='utf-8').read())
t = t.replace('/*__METRO_LAYOUT__*/', open('metro_layout.js', encoding='utf-8').read())
t = t.replace('/*__METRO_UI__*/', open('metro_ui.js', encoding='utf-8').read())
assert '/*__' not in t, 'Unresolved template placeholder'
open(out, 'w', encoding='utf-8').write(t)
print(out, len(t.encode()) // 1024, 'KB')
