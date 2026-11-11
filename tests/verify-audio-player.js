// Run only through tests/run_tests.py. Private builds/fixtures are removed; index and release manifest stay untouched.
'use strict';
require('./chrome_guard.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const {execFileSync} = require('node:child_process');
const {createHash} = require('node:crypto');
const {gunzipSync} = require('node:zlib');
const {pathToFileURL} = require('node:url');
const puppeteer = require('puppeteer-core');
const root = path.resolve(__dirname, '..'), src = path.join(root, 'src');
// run_tests.py owns TMPDIR: its cleanup also removes these fixture builds after SIGKILL.
const scratch = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-audio-player-'));
const sha = b => createHash('sha256').update(b).digest('hex');
const protectedFiles = ['index.html', 'src/audio_manifest.json'].map(p => [path.join(root, p), sha(fs.readFileSync(path.join(root, p)))]);
// A silent, valid MPEG-2 Layer III stream, generated once offline (24 kHz mono, 32 kbps).
// Concatenating complete CBR frames gives a long test clip; no ffmpeg, TTS, network or extra test dependency.
const chunk = gunzipSync(Buffer.from('H4sIAAAAAAAC//v/2eUIAwMDsweQYPBx9HU10TMIpQqAGPYfaH4wzHwqmYxu/jIam79m1PxR80fNHzV/1PxR80fNHzV/1PxR80fNHzV/1PxR8wfMfAhAMT906JkPALxI46aAEAAA', 'base64'));
const mp3 = Buffer.concat(Array(90).fill(chunk));
const failedMedia = new Set(), requests = [], errors = [], checks = [];
let browser, server;
const pass = name => { checks.push(name); console.log('OK ' + name); };
function audioPython(script, input) {
  // Offline helpers only; -B avoids writing module caches into tools/audio.
  const code = `import json, sys\nfrom pathlib import Path\nroot = Path(sys.argv[1])\nsys.path.insert(0, str(root / 'tools' / 'audio'))\n${script}`;
  return JSON.parse(execFileSync(process.env.PYTHON || 'python3', ['-B', '-c', code, root], {
    cwd:root, input:JSON.stringify(input), encoding:'utf8'
  }));
}
function assemble(name, manifest) {
  const output = path.join(scratch, 'pages', name + '.html');
  fs.mkdirSync(path.dirname(output), {recursive:true});
  const args = ['assemble.py', output];
  if (manifest) {
    const manifestPath = path.join(scratch, 'fixtures', name + '.json');
    fs.mkdirSync(path.dirname(manifestPath), {recursive:true});
    fs.writeFileSync(manifestPath, JSON.stringify(manifest));
    args.push('--audio-manifest', manifestPath);
  }
  execFileSync(process.env.PYTHON || 'python3', args, {cwd:src, stdio:'pipe'});
  return output;
}
async function serve() {
  server = http.createServer((req, res) => {
    const url = new URL(req.url, 'http://localhost');
    if (url.pathname.startsWith('/media/')) {
      const key = decodeURIComponent(url.pathname.slice('/media/'.length, -4));
      if (failedMedia.has(key)) { res.writeHead(404); res.end('Fixture deliberately missing'); return; }
      const range = /bytes=(\d+)-(\d*)/.exec(req.headers.range || '');
      const start = range ? Number(range[1]) : 0, end = range?.[2] ? Math.min(Number(range[2]), mp3.length - 1) : mp3.length - 1;
      res.writeHead(range ? 206 : 200, {'Content-Type':'audio/mpeg', 'Accept-Ranges':'bytes', 'Cache-Control':'no-store', 'Content-Length':end - start + 1,
        ...(range ? {'Content-Range':`bytes ${start}-${end}/${mp3.length}`} : {})});
      res.end(mp3.subarray(start, end + 1)); return;
    }
    const file = path.resolve(scratch, '.' + url.pathname);
    if (file.startsWith(scratch + path.sep) && fs.existsSync(file) && fs.statSync(file).isFile()) {
      res.writeHead(200, {'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-store'}); res.end(fs.readFileSync(file));
    } else { res.writeHead(404); res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return 'http://127.0.0.1:' + server.address().port;
}
const state = p => p.evaluate(() => atlasAudio.state());
const browseState = p => p.evaluate(() => ({id:ENTRIES[cur].id, scene:sceneIndex, hash:location.hash, line:metroUI.state().line, metro:metroUI.state().mode}));
const ready = p => p.waitForFunction(() => window.atlasAudio && window.metroUI);
const playing = p => p.waitForFunction(() => atlasAudio.state().playing && document.getElementById('atlasAudioElement').readyState >= 2);
const stage = (p, index, phase) => p.waitForFunction((index, phase) => atlasAudio.state().index === index && atlasAudio.state().phase === phase && atlasAudio.state().playing && document.getElementById('atlasAudioElement').readyState >= 2, {}, index, phase);
const partReady = (p, id, paused = false) => p.waitForFunction((id, paused) => {
  const s = atlasAudio.state(), a = document.getElementById('atlasAudioElement');
  return s.partId === id && !s.error && a.readyState >= (paused ? 1 : 2) && (paused ? a.paused && !s.wantsPlay : s.playing);
}, {}, id, paused);
async function setOptions(p, extras, people) {
  const open = await p.$eval('#audioPlayer', e => !e.hidden);
  const pairs = open ? [['audioIncludeExtras',extras], ['audioIncludePeople',people]]
                     : [['audioReadIncludeExtras',extras], ['audioReadIncludePeople',people]];
  for (const [id, checked] of pairs) {
    if (await p.$eval('#' + id, e => e.checked) !== checked) await p.click('#' + id);
  }
  const synced = await p.evaluate(() => ({
    e1:document.getElementById('audioIncludeExtras').checked,
    e2:document.getElementById('audioReadIncludeExtras').checked,
    p1:document.getElementById('audioIncludePeople').checked,
    p2:document.getElementById('audioReadIncludePeople').checked
  }));
  assert.equal(synced.e1, extras); assert.equal(synced.e2, extras);
  assert.equal(synced.p1, people); assert.equal(synced.p2, people);
}
const mediaIds = urls => urls.filter(u => new URL(u).pathname.startsWith('/media/')).map(u => decodeURIComponent(new URL(u).pathname.slice('/media/'.length, -4)));
async function finishClip(p) {
  await playing(p);
  await p.$eval('#atlasAudioElement', a => { a.currentTime = a.duration - .08; });
}
async function board(p, line, key) {
  await p.evaluate((line, key) => {
    const [id, scene] = key.split('/');
    const station = metroUI.data.lineStops.get(line).find(s => s.id === id && +scene >= s.from && +scene <= s.to);
    // Re-enter the reader first: board()'s same-station shortcut assumes a history entry is open.
    go(key); metroUI.board(line, {key:station.key});
  }, line, key);
  // Unvoiced scenes intentionally have no action bar; boarding readiness is navigation, not audio availability.
  await p.waitForFunction((line, key) => {
    const [id, scene] = key.split('/');
    return ENTRIES[cur].id === id && sceneIndex === Number(scene) && metroUI.state().line === line;
  }, {}, line, key);
}
async function readerActions(p, visible) {
  const bar = await p.$eval('#readerAudioActions', e => ({hidden:e.hidden, height:e.getBoundingClientRect().height}));
  assert.equal(bar.hidden, !visible);
  assert(visible ? bar.height > 0 : bar.height === 0, 'Reader action bar must occupy space only when visible: ' + JSON.stringify(bar));
}
async function geometry(p, width) {
  const g = await p.evaluate(() => {
    const box = id => document.getElementById(id).getBoundingClientRect().toJSON();
    const controls = ['audioPrevious','audioToggle','audioNext','audioTitle','audioSeek','audioSpeed','audioQueueToggle','audioIncludeExtras','audioIncludePeople','audioReadIncludeExtras','audioReadIncludePeople'];
    return {width:innerWidth, scroll:document.documentElement.scrollWidth, player:box('audioPlayer'), masthead:box('masthead'),
      reader:box('readerBody'), actions:box('readerAudioActions'),
      controls:controls.map(id => { const el = document.getElementById(id), b = el.getBoundingClientRect(), hit = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2); return {id, hit:hit === el || el.contains(hit), left:b.left, right:b.right, height:b.height}; })};
  });
  assert(g.scroll <= width, JSON.stringify(g));
  assert(g.player.height < (width === 390 ? 155 : 112), JSON.stringify(g));
  assert(g.masthead.top >= g.player.bottom - 1, JSON.stringify(g));
  assert(g.reader.height > 230 && g.actions.top >= g.player.bottom, JSON.stringify(g));
  for (const c of g.controls) assert(c.hit && c.left >= 0 && c.right <= width, JSON.stringify(c));
  return g;
}
(async () => {
  const official = JSON.parse(fs.readFileSync(path.join(src, 'audio_manifest.json'), 'utf8'));
  const scope = JSON.parse(fs.readFileSync(path.join(src, 'audio_scope.json'), 'utf8'));
  assert.equal(official.schema, 2); assert.equal(official.policy, 3);
  assert.deepEqual(official.profile, {voice:'zh-CN-YunjianNeural', pitch:'+0Hz', rate:'+0%', volume:'+0%'});
  assert.equal(scope.schema, 1); assert.equal(scope.policy, 3);
  assert.deepEqual(scope.profile, official.profile);
  const officialResolution = audioPython(`
from release import resolve_manifest
manifest, report = resolve_manifest(root, root / 'src/audio_manifest.json', root / 'src/audio_scope.json')
print(json.dumps({'manifest':manifest,'report':report}, ensure_ascii=False))
`);
  const expectedOfficial = officialResolution.manifest;
  const defaultPage = assemble('default');
  browser = await puppeteer.launch({executablePath:process.env.CHROME_PATH || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless:true});
  const p = await browser.newPage();
  p.setDefaultTimeout(15000);
  p.on('pageerror', e => errors.push(String(e)));
  let realSmoke = false;
  await p.setRequestInterception(true);
  p.on('request', r => {
    if (/\.mp3(?:[?#]|$)/.test(r.url())) requests.push(r.url());
    const actualBlob = realSmoke && /^https:\/\/([a-z0-9-]+\.public\.blob\.vercel-storage\.com|pub-[a-f0-9]+\.r2\.dev)\/audio\//.test(r.url());
    if (/^https?:/.test(r.url()) && !r.url().startsWith('http://127.0.0.1:') && !actualBlob) return r.abort(); // Map tiles are unrelated.
    return r.continue();
  });
  await p.setViewport({width:1440, height:960});
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion', value:'reduce'}]);
  await p.goto(pathToFileURL(defaultPage).href + '#history-migration/1', {waitUntil:'load'});
  await ready(p);
  assert.equal(await p.$$eval('audio', a => a.length), 1);
  assert.equal(await p.$eval('#audioPlayer', e => e.hidden), true);
  assert.equal(await p.$eval('#atlasAudioElement', e => e.getAttribute('src')), null);
  assert.equal(await p.$eval('#atlasAudioElement', e => e.preload), 'none');
  assert.deepEqual(await p.evaluate(() => AUDIO_MANIFEST), expectedOfficial, 'Default assembly must embed the resolved official manifest, excluding stale audio');
  const defaultHasBody = Boolean(expectedOfficial.tracks['history-migration/1'] && expectedOfficial.assets['history-migration/1']);
  await readerActions(p, defaultHasBody);
  assert.equal(await p.$eval('#audioRead', e => e.disabled), !defaultHasBody);
  if (!defaultHasBody) assert.equal(await p.$eval('#audioReadLine', e => e.disabled), true);
  assert.deepEqual((await state(p)).queue, []);
  assert.equal(requests.length, 0);
  assert.equal((await state(p)).speed, 1);
  for (const id of ['audioIncludeExtras','audioIncludePeople','audioReadIncludeExtras','audioReadIncludePeople']) assert.equal(await p.$eval('#' + id, e => e.checked), false);
  assert.equal((await state(p)).includeExtras, false); assert.equal((await state(p)).includePeople, false);
  pass('Default schema2/policy3 build and file:// opening: one native audio, hidden player, 1×, both options off, no MP3 before a click');

  const data = await p.evaluate(() => ({
    routes:Object.fromEntries(metroUI.data.lines.map(l => [l.id, metroUI.data.lineStops.get(l.id).flatMap(s => Array.from({length:s.to - s.from + 1}, (_, i) => s.id + '/' + (s.from + i)))])),
    topics:TOPIC_ENTRIES.map(t => t.id),
    scenes:HISTORY_ENTRIES.flatMap(e => e.scenes.map((_, i) => e.id + '/' + i))
  }));
  const outOfPlan = data.scenes.find(key => !expectedOfficial.tracks[key]);
  const defaultIdle = await state(p);
  if (outOfPlan) {
    await p.evaluate(key => go(key), outOfPlan); await readerActions(p, false);
    for (const id of ['audioRead','audioReadLine']) assert.equal(await p.$eval('#' + id, e => e.disabled), true);
    assert.deepEqual(await state(p), defaultIdle); assert.equal(requests.length, 0);
  }
  pass('Default reader actions follow resolved body availability; out-of-plan scenes have no action strip, media request or queue change');
  // Replaces fixed route lengths/topic count with exact live-source membership plus scope totals.
  // This catches missing, extra, duplicate and invalid IDs, not merely a change in cardinality.
  const sorted = ids => [...ids].sort(), sourceScenes = new Set(data.scenes);
  assert(scope.lines.length > 0, 'Scope must select lines');
  assert.equal(new Set(scope.lines).size, scope.lines.length, 'Duplicate scope lines');
  const scopedRoutes = {};
  for (const id of scope.lines) {
    const route = data.routes[id];
    assert(route?.length, 'Unknown or empty scoped line: ' + id);
    assert.equal(new Set(route).size, route.length, 'Duplicate scene within line: ' + id);
    for (const key of route) assert(sourceScenes.has(key), 'Line references a nonexistent scene: ' + key);
    // The audio plan stops at its editorial cutoff, even if the real Rome line later grows.
    const end = id === 'rome' ? route.indexOf(scope.romanLastScene) : route.length - 1;
    assert(end >= 0, 'Scoped cutoff disappeared from line: ' + id);
    scopedRoutes[id] = route.slice(0, end + 1);
  }
  const scenes = new Set([...Object.values(scopedRoutes).flat(), ...(scope.extraIds || []).filter(id => sourceScenes.has(id))]);
  const titles = new Set([...scenes].map(key => key.split('/')[0] + '/title'));
  for (const id of scope.extraIds || []) if (id.endsWith('/title')) titles.add(id);
  const topics = new Set(data.topics);
  assert.notEqual(scope.includeTopics, false, 'The official plan remains broad; narrow generation uses a separate scope');
  assert.equal(topics.size, data.topics.length, 'Duplicate source topic IDs');
  assert.equal(new Set(scope.ids).size, scope.ids.length, 'Duplicate scope asset IDs');
  // Backend canonical helpers enumerate split assets; no competing JS naming or part-plan builder.
  // Return hashes/metadata only, not speech text. Silence remains a UI fixture, never a TTS-content check.
  const material = audioPython(`
from collections import Counter
import release, text, pipeline
snapshot = release.current_source(root)
scope = json.load(sys.stdin)
catalog = text.asset_ids(snapshot)
wanted = release.required_ids(snapshot, scope)
assert wanted <= set(catalog)
ids = [asset_id for asset_id in catalog if asset_id in wanted]
entries = {entry['id']: entry for entry in snapshot['entries']}
config = pipeline.config_for('+0Hz')
hashes, kinds, characters = {}, {}, 0
for asset_id in ids:
    record = text.render(entries[asset_id.split('/')[0]], asset_id)
    assert record['policy'] == 3
    hashes[asset_id] = {'textHash': record['textHash'], 'inputHash': pipeline.input_hash(record, config)}
    kinds[asset_id] = record['kind']
    characters += record['characters']
counts = Counter(kinds.values())
names = {'scenes':'scene', 'titles':'title', 'topics':'topic', 'moments':'moment', 'boxes':'box', 'people':'person'}
print(json.dumps({'ids':ids, 'hashes':hashes, 'kinds':kinds,
    'counts':{**{name:counts[kind] for name,kind in names.items()}, 'assets':len(ids), 'characters':characters}}, ensure_ascii=False))
`, scope);
  const expectedIds = new Set(material.ids), hashes = material.hashes, plans = expectedOfficial.tracks;
  const kindIds = kind => material.ids.filter(id => material.kinds[id] === kind);
  assert.deepEqual(sorted(kindIds('scene')), sorted(scenes), 'Canonical bodies must match real metro line ranges');
  assert.deepEqual(sorted(kindIds('topic')), sorted(topics), 'Canonical topics must cover complete source topics');
  for (const id of scope.extraIds || []) if (id.startsWith('history-')) titles.add(id.split('/')[0] + '/title');
  assert.deepEqual(sorted(kindIds('title')), sorted(titles), 'Every scoped section needs its own title');
  assert.deepEqual(sorted(Object.keys(plans)), sorted([...scenes, ...topics]), 'Canonical tracks remain present even when assets are missing');
  const plannedIds = new Set([...titles, ...(scope.extraIds || [])]);
  for (const [key, plan] of Object.entries(plans)) {
    assert.equal(plan.bodyId, key);
    assert.equal(plan.titleId, key.startsWith('history-') ? key.split('/')[0] + '/title' : null);
    plannedIds.add(plan.bodyId); if (plan.titleId) plannedIds.add(plan.titleId);
    const partIds = [...plan.extras, ...plan.people].map(part => part.id);
    assert.equal(new Set(partIds).size, partIds.length, 'Duplicate optional ID within canonical track ' + key);
    for (const group of ['extras','people']) for (const part of plan[group]) {
      assert(group === 'people' ? part.kind === 'person' : ['moment','box'].includes(part.kind));
      assert.equal(material.kinds[part.id], part.kind);
      assert.equal(typeof part.label, 'string'); assert(part.label && !/<[^>]*>/.test(part.label), 'Plain source-derived part label');
      plannedIds.add(part.id);
    }
  }
  assert.deepEqual(sorted(plannedIds), sorted(expectedIds), 'The canonical track plan must cover every expected split asset');
  const {characters, ...assetCounts} = material.counts;
  if (JSON.stringify(sorted(scope.ids)) === JSON.stringify(sorted(expectedIds))) {
    for (const [kind, count] of Object.entries(assetCounts)) assert.equal(scope.counts[kind], count, 'Scope count differs from current source ' + kind);
  } else {
    // New topics/scenes can publish before audio preparation. Do not reintroduce a whole-site TTS gate in CI.
    assert(officialResolution.report.scopeWarning, 'A changed scope must be reported, not silently ignored');
    console.log('NOTE audio scope needs refresh; UI fixture follows current canonical covered lines/topics and split parts.');
  }
  // Characters are an estimate, not a publication gate: ordinary prose edits need no scope refresh/TTS.
  if (scope.counts.characters !== characters) console.log(`NOTE audio character estimate: scope ${scope.counts.characters}, current source ${characters}; diagnostic only.`);
  assert.deepEqual(sorted(Object.keys(hashes)), sorted(expectedIds), 'Every current scoped asset needs its own text/input hashes');
  pass(`Policy3 canonical scope/plan: ${scenes.size} bodies, ${titles.size} titles, ${topics.size} topics, ${expectedIds.size} total split assets`);
  const fixtureHasBody = key => Boolean(plans[key] && expectedIds.has(key) && (!plans[key].titleId || expectedIds.has(plans[key].titleId)));
  const completeLines = scope.lines.filter(id => data.routes[id].every(fixtureHasBody));
  const fixture = {schema:2, policy:3, profile:official.profile, assets:{}};
  const silentFile = path.join(scratch, 'silent-ui-fixture.mp3'), audioHash = sha(mp3);
  fs.writeFileSync(silentFile, mp3);
  for (const key of expectedIds) {
    const file = path.join(scratch, 'media', key + '.mp3');
    fs.mkdirSync(path.dirname(file), {recursive:true});
    fs.linkSync(silentFile, file); // Real checksum-readable files, with one copy of the MP3 bytes.
    fixture.assets[key] = {url:'../media/' + key + '.mp3', duration:mp3.length / 4000, bytes:mp3.length,
      ...hashes[key], audioHash}; // 32 kbps CBR = 4000 bytes/s; this is deliberately silence, not TTS.
  }
  const preview = assemble('fixture', fixture);
  const candidates = Object.entries(plans).filter(([id, t]) => id.startsWith('history-') && t.extras.some(p => p.kind === 'moment') && t.people.length && completeLines.some(line => data.routes[line].indexOf(id) >= 0 && data.routes[line].indexOf(id) < data.routes[line].length - 1))
    .sort((a, b) => (a[1].extras.length + a[1].people.length) - (b[1].extras.length + b[1].people.length));
  assert(candidates.length, 'Need a real nonterminal scene with both extras and people');
  const [optionalKey, optionalPlan] = candidates[0];
  const optionalLine = completeLines.find(line => data.routes[line].indexOf(optionalKey) >= 0 && data.routes[line].indexOf(optionalKey) < data.routes[line].length - 1);
  const optionalIndex = data.routes[optionalLine].indexOf(optionalKey), followingKey = data.routes[optionalLine][optionalIndex + 1];
  const boxCase = Object.entries(plans).filter(([, t]) => t.extras.some(p => p.kind === 'box')).sort((a, b) => a[1].extras.length - b[1].extras.length)[0];
  const peopleCase = Object.entries(plans).filter(([, t]) => t.people.length > 1).sort((a, b) => a[1].people.length - b[1].people.length)[0];
  assert(boxCase && peopleCase, 'Need real box and multiple-person tracks for independent-part coverage');
  for (const [name, id, stale] of [['missing-extra',optionalPlan.extras[0].id,false], ['missing-person',optionalPlan.people[0].id,false], ['stale-person',optionalPlan.people[0].id,true]]) {
    const partial = structuredClone(fixture);
    if (stale) partial.assets[id].textHash = '0'.repeat(64); else delete partial.assets[id];
    assemble(name, partial);
  }
  const earlier = structuredClone(fixture); delete earlier.assets['history-migration/0']; assemble('missing-earlier', earlier);
  const later = structuredClone(fixture); delete later.assets['history-farming/1']; assemble('missing-later', later);
  const titleMissing = structuredClone(fixture); delete titleMissing.assets['history-migration/title']; assemble('missing-title', titleMissing);
  const base = await serve(), url = name => base + '/pages/' + name + '.html';
  await p.goto(url('fixture') + '#history-migration/1', {waitUntil:'load'}); await ready(p);
  assert.deepEqual(await p.evaluate(() => Object.keys(AUDIO_MANIFEST.assets).sort()), sorted(expectedIds), 'Fresh split fixtures must survive real resolver checks');
  assert.deepEqual(await p.evaluate(() => AUDIO_MANIFEST.tracks), plans);
  assert.equal(requests.length, 0);
  await readerActions(p, true);
  assert.equal(await p.$eval('#audioReadLine', e => e.disabled), false);
  await p.click('#audioRead'); await stage(p, 0, 'title');
  assert.deepEqual((await state(p)).queue, ['history-migration/1']);
  for (const id of ['audioPrevious','audioNext']) assert.equal(await p.$eval('#' + id, e => e.disabled), true);
  assert.match(await p.$eval('#audioPhase', e => e.textContent), /前奏/);
  await finishClip(p); await stage(p, 0, 'body');
  assert.equal((await state(p)).finished, false);
  assert.match(await p.$eval('#audioSeek', e => e.getAttribute('aria-label')), /正文/);
  await finishClip(p); await p.waitForFunction(() => atlasAudio.state().finished);
  assert.equal((await state(p)).queue.length, 1);
  await p.click('#audioToggle'); await stage(p, 0, 'title');
  pass('Single middle scene plays its section title first; real MP3 ended enters body, then stops; replay includes title');

  await p.click('#audioReadLine'); await stage(p, 1, 'title');
  let before = await state(p);
  assert.deepEqual(before.queue, data.routes.prehistory); assert(before.frozen);
  await board(p, 'trunk', 'history-farming/1');
  assert.deepEqual((await state(p)).queue, before.queue);
  await p.evaluate(() => go('topic-energy'));
  assert.equal(await p.$eval('#audioReadLine', e => e.hidden), true);
  await p.evaluate(() => go('overview'));
  assert.equal(await p.$eval('#readerAudioActions', e => e.hidden), true);
  if (outOfPlan) {
    const beforeUnvoiced = requests.length;
    await p.evaluate(key => go(key), outOfPlan); await readerActions(p, false);
    for (const id of ['audioRead','audioReadLine']) assert.equal(await p.$eval('#' + id, e => e.disabled), true);
    assert.deepEqual((await state(p)).queue, before.queue); assert.equal(requests.length, beforeUnvoiced);
  }
  await board(p, 'trunk', 'history-farming/1');
  await p.evaluate(() => metroUI.setMode('network'));
  let after = await state(p);
  assert.equal(after.src, before.src); assert.equal(after.index, before.index); assert(after.playing); assert(after.currentTime >= before.currentTime);
  await p.click('#audioTitle');
  assert.equal((await browseState(p)).id, 'history-migration'); assert.equal((await browseState(p)).scene, 1);
  assert.equal((await state(p)).src, before.src);
  pass('Line snapshot includes earlier scenes; browsing lines/topics/geography/network never changes sound; title explicitly locates text');

  for (let i = 0; i < 7; i++) {
    await p.$eval('#audioSpeed', (e, i) => { e.value = String(i); e.dispatchEvent(new Event('input', {bubbles:true})); }, i);
    assert.equal(await p.$eval('#atlasAudioElement', a => a.playbackRate), [1,1.25,1.5,1.75,2,2.5,3][i]);
  }
  await p.click('#audioToggle'); assert.equal(await p.$eval('#atlasAudioElement', a => a.paused), true);
  await p.click('#audioToggle'); await playing(p);
  const browsing = await browseState(p);
  await p.click('#audioPrevious'); await stage(p, 0, 'title');
  await p.click('#audioNext'); await stage(p, 1, 'title');
  await p.click('#audioQueueToggle');
  assert.equal(await p.$$eval('#audioQueue button', a => a.length), data.routes.prehistory.length);
  await p.click('[data-audio-index="2"]'); await stage(p, 2, 'title');
  assert.deepEqual(await browseState(p), browsing);
  assert.equal(await p.$eval('#atlasAudioElement', a => a.playbackRate), 3);
  await p.keyboard.press('Escape');
  assert.equal((await browseState(p)).metro, 'ride');
  assert.equal(await p.$eval('#audioQueuePanel', e => e.hidden), true);
  pass('Pause/resume, all seven speeds, prev/next and queue selection use the same audio and never turn the page');

  await p.click('#audioPrevious'); await p.click('#audioPrevious'); await stage(p, 0, 'title');
  // Keep the natural-EOF/title assertions for every scene, without assuming a four-scene terminus.
  const prehistory = data.routes.prehistory, lastPrehistory = prehistory.length - 1;
  for (let i = 0; i < prehistory.length; i++) {
    if (i === 0 || prehistory[i].split('/')[0] !== prehistory[i - 1].split('/')[0]) {
      await stage(p, i, 'title'); await finishClip(p); // First scene or a new section: title first.
    }
    await stage(p, i, 'body'); // Same section's next scene must enter body without another title.
    await finishClip(p);
  }
  await p.waitForFunction(() => atlasAudio.state().finished);
  after = await state(p); assert.equal(after.index, lastPrehistory); assert(!after.playing); assert.deepEqual(after.queue, prehistory);
  assert.deepEqual(await browseState(p), browsing);
  await p.click('#audioToggle'); await stage(p, lastPrehistory, 'title');
  await p.click('#audioToggle');
  await p.$eval('#audioSeek', e => { e.value = '500'; e.dispatchEvent(new Event('input', {bubbles:true})); });
  assert(Math.abs(await p.$eval('#atlasAudioElement', a => a.currentTime / a.duration) - .5) < .02);
  assert.equal((await state(p)).phase, 'title'); assert.equal((await state(p)).index, lastPrehistory);
  await p.focus('#audioSpeed'); await p.keyboard.press('PageDown');
  assert.equal((await state(p)).speed, 2.5);
  await p.focus('#audioSeek'); await p.keyboard.press('PageUp');
  assert(Math.abs(await p.$eval('#atlasAudioElement', a => a.currentTime / a.duration) - .6) < .02);
  assert.deepEqual(await browseState(p), browsing);
  pass('Native EOF skips no scenes, titles only on section entry, stops at line end, retains queue; phase seek and native Page keys do not navigate');

  // Complete lines keep the entire real queue; an audio-plan prefix must never masquerade as a full line.
  for (const id of scope.lines) {
    const keys = data.routes[id], index = Math.floor(keys.length / 2);
    if (completeLines.includes(id)) {
      await board(p, id, keys[index]); await readerActions(p, true);
      assert.equal(await p.$eval('#audioReadLine', e => e.disabled), false);
      await p.click('#audioReadLine'); await playing(p);
      const s = await state(p); assert.deepEqual(s.queue, keys); assert.equal(s.index, index); assert.equal(s.line, id); assert(s.frozen);
      assert.equal(await p.$eval('#atlasAudioElement', a => a.playbackRate), 2.5);
    } else {
      if ((await state(p)).wantsPlay) await p.click('#audioToggle');
      const held = await state(p), from = requests.length, prefix = scopedRoutes[id];
      const covered = prefix[Math.floor(prefix.length / 2)], uncovered = keys.find(key => !fixtureHasBody(key));
      assert(uncovered, 'An incomplete line must have an unavailable body/title');
      for (const key of [covered, uncovered]) {
        await board(p, id, key); await readerActions(p, fixtureHasBody(key));
        assert.equal(await p.$eval('#audioRead', e => e.disabled), !fixtureHasBody(key));
        assert.equal(await p.$eval('#audioReadLine', e => e.disabled), true, 'Scoped prefix is not the whole ' + id + ' route');
        if (fixtureHasBody(key)) await p.$eval('#audioReadLine', e => e.click());
        assert.deepEqual(await state(p), held, 'Unavailable continuous reading must not replace/shorten the queue');
        assert.equal(requests.length, from, 'Unavailable continuous reading must not fetch MP3s');
      }
      console.log(`NOTE ${id}: planned prefix ${prefix.length}/${keys.length} real scenes; whole-line reading correctly unavailable.`);
    }
  }
  assert.equal(data.routes.prehistory.filter(k => k === 'history-farming/1').length, 1);
  assert.equal(data.routes.trunk.filter(k => k === 'history-farming/1').length, 1);
  pass('Complete scoped lines exactly match real ordered queues; incomplete prefixes visibly disable continuous reading without replacing audio');

  const incompleteShared = Object.entries(data.routes).filter(([id]) => !completeLines.includes(id))
    .flatMap(([id, keys]) => keys.filter(k => completeLines.some(c => data.routes[c].includes(k))).map(key => ({
      incomplete:id, key, complete:completeLines.find(c => data.routes[c].includes(key))
    })))[0];
  await board(p, incompleteShared ? incompleteShared.complete : 'trunk', incompleteShared ? incompleteShared.key : 'history-farming/1');
  await p.click('#audioReadLine'); await playing(p);
  before = await state(p);
  if (incompleteShared) {
    await p.evaluate(({incomplete, key}) => {
      const st = metroUI.data.lineStops.get(incomplete).find(s => key.startsWith(s.id + '/') && +key.split('/')[1] >= s.from && +key.split('/')[1] <= s.to);
      metroUI.board(incomplete, {key:st.key});
    }, incompleteShared);
    assert.equal(await p.$eval('#audioRead', e => e.disabled), false);
    assert.equal(await p.$eval('#audioReadLine', e => e.disabled), true);
    assert.equal((await state(p)).src, before.src); assert.deepEqual((await state(p)).queue, before.queue);
    await p.evaluate(({complete, key}) => {
      const st = metroUI.data.lineStops.get(complete).find(s => key.startsWith(s.id + '/') && +key.split('/')[1] >= s.from && +key.split('/')[1] <= s.to);
      metroUI.board(complete, {key:st.key});
    }, incompleteShared);
    assert.equal(await p.$eval('#audioReadLine', e => e.disabled), false);
    await board(p, incompleteShared.incomplete, incompleteShared.key);
    assert.equal(await p.$eval('#audioReadLine', e => e.disabled), true);
    await p.click('#audioRead'); await playing(p); assert.deepEqual((await state(p)).queue, [incompleteShared.key]);
  } else {
    await p.evaluate(() => metroUI.board('egypt', {key:'history-farming/1'}));
    assert.equal(await p.$eval('#audioReadLine', e => e.disabled), false);
    assert.equal((await state(p)).src, before.src); assert.deepEqual((await state(p)).queue, before.queue);
  }
  pass('Shared scenes play on incomplete lines when present; same-station transfers refresh availability, not the frozen queue');

  for (const id of data.topics) {
    await p.evaluate(id => go(id), id); await readerActions(p, true);
    assert.equal(await p.$eval('#audioReadLine', e => e.hidden), true);
    assert.equal(await p.$eval('#audioRead', e => e.disabled), false);
  }
  await p.click('#audioRead'); await stage(p, 0, 'body');
  assert.deepEqual((await state(p)).queue, [data.topics.at(-1)]);
  await p.$eval('#audioSeek', e => { e.value = '500'; e.dispatchEvent(new Event('input', {bubbles:true})); });
  assert(Math.abs(await p.$eval('#atlasAudioElement', a => a.currentTime / a.duration) - .5) < .02);
  await finishClip(p); await p.waitForFunction(() => atlasAudio.state().finished);
  assert.equal((await state(p)).queue.length, 1);
  pass(`All ${data.topics.length} source topics expose only single reading; whole-topic MP3 seeks and ends without advancing`);

  assert(!mediaIds(requests).some(id => material.kinds[id] === 'moment' || material.kinds[id] === 'box' || material.kinds[id] === 'person'), 'Default-off options must never fetch optional clips');
  const readBody = async key => {
    await p.evaluate(key => go(key), key); await readerActions(p, true); await p.click('#audioRead');
    if (plans[key].titleId) { await partReady(p, plans[key].titleId); await finishClip(p); }
    await partReady(p, key);
  };
  const samePosition = async (before, label) => {
    const after = await state(p);
    for (const field of ['queue','index','partId','partIndex','phase','src','currentTime','wantsPlay','playing']) assert.deepEqual(after[field], before[field], label + ': changed ' + field);
  };
  // The optional groups must be selectable before any queue/media exists, not only after Play.
  for (const width of [1440, 390]) {
    await p.setViewport({width, height:width === 390 ? 844 : 960});
    await p.goto(url('fixture') + '?preflight=' + width + '#topic-energy', {waitUntil:'load'}); await ready(p);
    const from = requests.length, idle = await state(p);
    for (const [id, mirror, field] of [['audioReadIncludeExtras','audioIncludeExtras','includeExtras'], ['audioReadIncludePeople','audioIncludePeople','includePeople']]) {
      await p.focus('#' + id); await p.keyboard.press('Space');
      assert.equal((await state(p))[field], true);
      assert.equal(await p.$eval('#' + mirror, e => e.checked), true);
      await p.keyboard.press('Space'); assert.equal((await state(p))[field], false);
      assert.equal(await p.$eval('#' + mirror, e => e.checked), false);
      assert.equal(await p.evaluate(() => document.activeElement.id), id);
      for (const [key, scene] of [['ArrowRight',1], ['ArrowLeft',0]]) {
        await p.keyboard.press(key); assert.equal((await browseState(p)).scene, scene);
        assert.deepEqual(await state(p), idle, 'Preflight arrows must not load/change audio or options');
      }
      await p.keyboard.press('ArrowDown'); assert.notEqual((await browseState(p)).id, 'topic-energy');
      await p.keyboard.press('ArrowUp'); assert.equal((await browseState(p)).id, 'topic-energy');
      assert.deepEqual(await state(p), idle);
    }
    await p.focus('#audioRead'); await p.keyboard.press('Tab');
    assert.equal(await p.evaluate(() => document.activeElement.id), 'audioReadIncludeExtras');
    await p.keyboard.press('Tab'); assert.equal(await p.evaluate(() => document.activeElement.id), 'audioReadIncludePeople');
    assert.equal(requests.length, from);
    assert.equal(await p.$eval('#audioPlayer', e => e.hidden), true);
  }
  pass('Desktop/390px preflight: visible reader checkboxes sync with player, keep native Space/Tab and reader arrows without a queue, player or MP3 request');

  let freshCase = 0;
  const verifyParts = async (key, extras, people, {fresh = false} = {}) => {
    if (fresh) {
      await p.goto(url('fixture') + `?fresh=${++freshCase}#` + key, {waitUntil:'load'}); await ready(p);
      await readerActions(p, true);
    } else {
      await p.evaluate(key => go(key), key); await readerActions(p, true);
    }
    const from = requests.length, plan = plans[key];
    const preflight = await p.evaluate(() => {
      const ids = ['audioReadIncludeExtras','audioReadIncludePeople'];
      return {width:innerWidth, scroll:document.documentElement.scrollWidth,
        availability:document.getElementById('audioAvailability').textContent,
        controls:ids.map(id => { const el=document.getElementById(id), b=el.getBoundingClientRect(); return {id,checked:el.checked,left:b.left,right:b.right,hit:document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)===el}; })};
    });
    assert.equal(preflight.availability, '', 'Ready reading bar should not show filler prose');
    assert(preflight.scroll <= preflight.width);
    for (const c of preflight.controls) assert((!fresh || !c.checked) && c.hit && c.left >= 0 && c.right <= preflight.width, JSON.stringify(preflight));
    if (fresh) await setOptions(p, extras, people);
    else {
      for (const [id, checked] of [['audioReadIncludeExtras',extras], ['audioReadIncludePeople',people]]) {
        if (await p.$eval('#' + id, e => e.checked) !== checked) await p.click('#' + id);
      }
    }
    assert.equal((await state(p)).includeExtras, extras); assert.equal((await state(p)).includePeople, people);
    if (fresh) {
      assert.deepEqual((await state(p)).queue, []);
      assert.equal(await p.$eval('#audioPlayer', e => e.hidden), true);
      assert.equal(await p.$eval('#atlasAudioElement', e => e.getAttribute('src')), null);
      assert.equal(await p.$eval('#atlasAudioElement', e => e.preload), 'none');
      assert.equal(requests.length, from, 'Choosing options before Play must not fetch even metadata');
    }
    await readBody(key);
    assert.equal((await state(p)).includeExtras, extras); assert.equal((await state(p)).includePeople, people);
    const steps = [{id:key, kind:'body'}, ...(extras ? plan.extras : []), ...(people ? plan.people : [])];
    const duration = steps.reduce((n, s) => n + fixture.assets[s.id].duration, 0);
    assert.equal((await state(p)).selectedDuration, duration);
    assert.deepEqual((await state(p)).playlist, steps.map(s => s.id));
    assert.equal(await p.$eval('#audioCount', e => Number(e.textContent)), steps.length);
    assert.equal(await p.$$eval('#audioQueuePanel > p:not([hidden])', es => es.length), (extras && !plan.extras.length) || (people && !plan.people.length) ? 1 : 0, 'No boilerplate paragraphs in playlist');
    const rowData = await p.$$eval('#audioQueue button', bs => bs.map(b => ({kind:b.dataset.audioKind, text:b.textContent, seconds:Number(b.querySelector('time').dataset.seconds)})));
    assert.equal(rowData.length, steps.length, 'Every selected anecdote/person bio must appear as its own playlist entry');
    steps.forEach((step, idx) => {
      assert.equal(rowData[idx].kind, step.kind);
      assert.equal(rowData[idx].seconds, fixture.assets[step.id].duration);
      if (step.label) assert(rowData[idx].text.includes(step.label), 'Playlist row must show item label: ' + step.label);
    });
    assert.match(await p.$eval('#audioContext', e => e.textContent), new RegExp(`1/${steps.length}`));
    assert(!mediaIds(requests.slice(from)).some(id => ['moment','box','person'].includes(material.kinds[id])), 'No optional prefetch during title/body');
    for (let idx = 0; idx < steps.length; idx++) {
      const step = steps[idx];
      await partReady(p, step.id);
      assert.equal((await state(p)).phase, step.kind);
      assert.equal(await p.$eval(`[data-audio-item="${idx}"]`, e => e.getAttribute('aria-current')), 'true');
      if (step.label) assert((await p.$eval('#audioPhase', e => e.textContent)).includes(step.label));
      assert.deepEqual((await state(p)).queue, [key]);
      await p.click('#audioToggle');
      await p.$eval('#audioSeek', e => { e.value = '400'; e.dispatchEvent(new Event('input', {bubbles:true})); });
      await p.waitForFunction(() => !document.getElementById('atlasAudioElement').seeking);
      assert(Math.abs(await p.$eval('#atlasAudioElement', a => a.currentTime / a.duration) - .4) < .02);
      assert.equal((await state(p)).partId, step.id);
      await p.click('#audioToggle'); await finishClip(p);
    }
    await p.waitForFunction(() => atlasAudio.state().finished);
    assert.equal((await state(p)).partId, steps.at(-1).id);
    assert.deepEqual((await state(p)).queue, [key]);
    assert.equal(await p.$eval('#audioNext', e => e.disabled), true);
    assert.equal(await p.$eval('#audioPrevious', e => e.disabled), steps.length <= 1);
    assert.deepEqual(sorted(new Set(mediaIds(requests.slice(from)))), sorted([...(plan.titleId ? [plan.titleId] : []), ...steps.map(s => s.id)]), 'Only selected canonical clips may be fetched');
  };
  for (const width of [1440, 390]) {
    await p.setViewport({width, height:width === 390 ? 844 : 960});
    await verifyParts(optionalKey, true, true, {fresh:true});
  }
  await p.setViewport({width:1440, height:960});
  for (const [extras, people] of [[false,false],[true,false],[false,true],[true,true]]) await verifyParts(optionalKey, extras, people);
  await verifyParts(boxCase[0], true, false);
  await verifyParts(peopleCase[0], false, true);
  const topicParts = Object.entries(plans).find(([id, t]) => id.startsWith('topic-') && (t.extras.length || t.people.length));
  if (topicParts) await verifyParts(topicParts[0], true, true);
  // Direct playlist click + Prev/Next across body, anecdote and person bio entries.
  await p.goto(url('fixture') + '?direct=1#' + optionalKey, {waitUntil:'load'}); await ready(p);
  await setOptions(p, true, true);
  await p.click('#audioRead'); await partReady(p, optionalPlan.titleId);
  await p.click('#audioQueueToggle');
  const personRowIndex = 1 + optionalPlan.extras.length;
  await p.click(`[data-audio-item="${personRowIndex}"]`);
  await partReady(p, optionalPlan.people[0].id);
  assert.equal(await p.$eval(`[data-audio-item="${personRowIndex}"]`, e => e.getAttribute('aria-current')), 'true');
  await p.click('#audioPrevious');
  await partReady(p, optionalPlan.extras.at(-1).id);
  await p.click('#audioNext');
  await partReady(p, optionalPlan.people[0].id);
  await p.click('#audioQueueClose'); await p.click('#audioToggle');
  pass('Desktop/390px select-before-Play & separate playlist items: all four combinations, direct anecdote/person click, Prev/Next across parts, zero boilerplate, no unselected fetch');

  await setOptions(p, false, false);
  await p.evaluate(key => go(key), optionalKey); await p.click('#audioRead'); await partReady(p, optionalPlan.titleId);
  before = await state(p); const duringTitleRequests = requests.length;
  await setOptions(p, true, true);
  after = await state(p); assert.equal(after.src, before.src); assert.equal(after.partId, before.partId); assert(after.currentTime >= before.currentTime);
  assert.equal(requests.length, duringTitleRequests, 'Options must not restart or prefetch during a title');
  await finishClip(p); await partReady(p, optionalKey); await p.click('#audioToggle');
  await p.$eval('#audioSeek', e => { e.value = '350'; e.dispatchEvent(new Event('input', {bubbles:true})); });
  await p.waitForFunction(() => !document.getElementById('atlasAudioElement').seeking);
  before = await state(p); const duringBodyRequests = requests.length, optionalBrowse = await browseState(p);
  await setOptions(p, false, false); await samePosition(before, 'Disable during paused body');
  await setOptions(p, true, true); await samePosition(before, 'Enable during paused body');
  assert.equal(requests.length, duringBodyRequests);
  await p.click('#audioToggle'); await finishClip(p); await partReady(p, optionalPlan.extras[0].id);
  await p.click('#audioToggle');
  await setOptions(p, false, true); await partReady(p, optionalPlan.people[0].id, true);
  assert.deepEqual(await browseState(p), optionalBrowse);
  before = await state(p); const passedExtrasRequests = requests.length;
  await setOptions(p, true, true); await samePosition(before, 'Re-enable already-passed extras');
  assert.equal(requests.length, passedExtrasRequests, 'Earlier parts must not be replayed');
  await setOptions(p, true, false);
  assert((await state(p)).finished && !(await state(p)).wantsPlay);
  const finishedRequests = requests.length;
  await setOptions(p, true, true);
  assert((await state(p)).finished); assert.equal(requests.length, finishedRequests, 'Checking after completion does not rewind');
  await readBody(optionalKey); await finishClip(p); await partReady(p, optionalPlan.extras[0].id);
  await setOptions(p, false, true); await partReady(p, optionalPlan.people[0].id);
  await setOptions(p, false, false); assert((await state(p)).finished);
  assert.deepEqual(await browseState(p), optionalBrowse);
  pass('Live switches never restart title/body or rewind passed parts; disabling the current group skips forward, preserves pause, and stops when no selected parts remain');

  await setOptions(p, true, true); await readBody(optionalKey);
  await p.evaluate(() => {
    const a = document.getElementById('atlasAudioElement'), native = a.play.bind(a);
    window.pendingPartRejects = [];
    a.play = function () { native().catch(() => {}); return new Promise((resolve, reject) => window.pendingPartRejects.push(reject)); };
  });
  await finishClip(p); await partReady(p, optionalPlan.extras[0].id);
  await setOptions(p, false, true); await partReady(p, optionalPlan.people[0].id);
  await p.evaluate(() => window.pendingPartRejects[0](new DOMException('Old optional part', 'NotAllowedError')));
  assert.equal((await state(p)).error, ''); assert((await state(p)).playing);
  await setOptions(p, false, false);
  await p.evaluate(() => { delete document.getElementById('atlasAudioElement').play; window.pendingPartRejects[1](new DOMException('Disabled final part', 'NotAllowedError')); });
  after = await state(p); assert(after.finished && !after.wantsPlay && !after.playing); assert.equal(after.error, '');
  assert.equal(await p.$eval('#atlasAudioElement', a => a.getAttribute('src')), null);
  pass('Live optional skips and final cancellation ignore late play rejections; no stale error or restart');

  const skipCandidates = completeLines.flatMap(line => data.routes[line].slice(0, -1).map((key, index) => ({line, key, index, next:data.routes[line][index + 1]}))).filter(s => plans[s.key].people.length);
  const sameSectionSkip = skipCandidates.find(s => plans[s.key].titleId === plans[s.next].titleId);
  const newSectionSkip = skipCandidates.find(s => plans[s.key].titleId !== plans[s.next].titleId);
  assert(sameSectionSkip && newSectionSkip, 'Real line scenes must exercise paused skips to a body and to a section prelude');
  for (const skip of [sameSectionSkip, newSectionSkip]) {
    await setOptions(p, false, true); await board(p, skip.line, skip.key);
    await p.click('#audioReadLine'); await partReady(p, plans[skip.key].titleId); await finishClip(p); await partReady(p, skip.key);
    await finishClip(p); await partReady(p, plans[skip.key].people[0].id); await p.click('#audioToggle');
    before = await state(p); const lineBrowse = await browseState(p);
    await setOptions(p, false, false);
    const nextPart = plans[skip.key].titleId === plans[skip.next].titleId ? skip.next : plans[skip.next].titleId;
    await partReady(p, nextPart, true);
    after = await state(p); assert.equal(after.index, skip.index + 1); assert.deepEqual(after.queue, before.queue);
    assert.deepEqual(await browseState(p), lineBrowse); assert.equal(after.wantsPlay, false);
    await p.click('#audioToggle'); await partReady(p, nextPart); await p.click('#audioToggle');
  }
  pass('Skipping the final selected person advances within the frozen line, preserves pause at both a same-section body and a new-section prelude, and never moves the reader');

  for (const [name, group, id] of [['missing-extra','extras',optionalPlan.extras[0].id], ['missing-person','people',optionalPlan.people[0].id], ['stale-person','people',optionalPlan.people[0].id]]) {
    await p.goto(url(name) + '#' + optionalKey, {waitUntil:'load'}); await ready(p); await board(p, optionalLine, optionalKey);
    assert.equal(await p.evaluate(id => Boolean(AUDIO_MANIFEST.assets[id]), id), false);
    assert(await p.evaluate((key, group, id) => AUDIO_MANIFEST.tracks[key][group].some(p => p.id === id), optionalKey, group, id), 'Missing/stale optional IDs stay in the canonical plan');
    assert.equal(await p.$eval('#audioRead', e => e.disabled), false);
    assert.equal(await p.$eval('#audioReadLine', e => e.disabled), false);
    const beforeSelection = requests.length;
    await setOptions(p, group === 'extras', group === 'people');
    assert.equal(await p.$eval('#audioRead', e => e.disabled), true);
    assert.equal(await p.$eval('#audioReadLine', e => e.disabled), true);
    assert.equal(await p.$eval('#audioPlayer', e => e.hidden), true);
    assert.deepEqual((await state(p)).queue, []);
    assert.equal(requests.length, beforeSelection);
    await setOptions(p, false, false);
    assert.equal(await p.$eval('#audioRead', e => e.disabled), false);
    await readBody(optionalKey);
    if (name === 'missing-extra') {
      before = await state(p); assert(before.playing);
      await setOptions(p, true, false);
      after = await state(p); assert(after.error && !after.wantsPlay && !after.playing); assert.equal(after.partId, before.partId); assert(after.currentTime >= before.currentTime);
      await setOptions(p, false, false); assert(!(await state(p)).wantsPlay);
      await p.click('#audioToggle'); await partReady(p, optionalKey);
    }
    await p.click('#audioToggle');
    before = await state(p); const from = requests.length;
    await setOptions(p, group === 'extras', group === 'people');
    after = await state(p); assert(after.error && !after.wantsPlay); assert.equal(after.partId, before.partId); assert.equal(after.currentTime, before.currentTime);
    assert.match(await p.$eval('#audioError', e => e.textContent), /不会跳过/);
    await readerActions(p, true); // The resolved body survives: selected optional loss must remain explainable.
    assert(await p.evaluate(key => Boolean(AUDIO_MANIFEST.assets[key]), optionalKey));
    assert.match(await p.$eval('#audioAvailability', e => e.textContent), /所选内容待补齐/);
    assert.equal(await p.$eval('#audioRead', e => e.disabled), true); assert.equal(await p.$eval('#audioReadLine', e => e.disabled), true);
    assert.equal((await state(p)).selectedDuration, null);
    assert((await p.$$eval('#audioQueue time', es => es.map(e => e.textContent))).includes('待补'), 'Missing optional row must show 待补 in playlist');
    assert.equal(requests.length, from, 'Missing selected parts must not trigger fallback/skip requests');
    await setOptions(p, false, false);
    assert.equal((await state(p)).error, ''); await samePosition(before, 'Clear optional availability error without auto-resume');
    await p.click('#audioToggle'); await partReady(p, optionalKey); await finishClip(p); await p.waitForFunction(() => atlasAudio.state().finished);
  }
  // Full-line readiness includes an earlier missing optional part; an already-running suffix does not rewind it.
  await p.goto(url('missing-extra') + '#' + followingKey, {waitUntil:'load'}); await ready(p);
  await board(p, optionalLine, followingKey); await p.click('#audioReadLine'); await playing(p); await p.click('#audioToggle');
  before = await state(p); await setOptions(p, true, false); await samePosition(before, 'Enable a group whose missing part is already passed');
  assert.equal((await state(p)).error, ''); assert.equal(await p.$eval('#audioReadLine', e => e.disabled), true);
  pass('Missing/stale optional parts do not block body-only reading; selecting them visibly blocks/stops without loss of position, while passed parts are never revisited');

  await p.goto(url('fixture') + '#' + optionalKey, {waitUntil:'load'}); await ready(p);
  await p.click('#audioRead'); await playing(p); await p.click('#audioToggle');
  for (const [key, target] of [[optionalKey, optionalPlan.extras.find(p => p.kind === 'moment')], [boxCase[0], boxCase[1].extras.find(p => p.kind === 'box')], [optionalKey, optionalPlan.people[0]]]) {
    await setOptions(p, target.kind !== 'person', target.kind === 'person');
    failedMedia.add(target.id);
    await readBody(key);
    const prior = target.kind === 'person' ? plans[key].people : plans[key].extras;
    await finishClip(p);
    for (const piece of prior) {
      if (piece.id === target.id) break;
      await partReady(p, piece.id); await finishClip(p);
    }
    await p.waitForFunction(() => Boolean(atlasAudio.state().error));
    after = await state(p); assert.equal(after.partId, target.id); assert.equal(after.phase, target.kind); assert(!after.wantsPlay && !after.playing);
    assert.deepEqual(after.queue, [key]); assert.match(await p.$eval('#audioError', e => e.textContent), /不会跳过/);
    failedMedia.delete(target.id); await p.click('#audioToggle'); await partReady(p, target.id);
    await p.click('#audioToggle');
  }
  pass('Moment, box and person HTTP failures stop on their own part; explicit retry resumes that part, never a later item');

  for (const [name, key, singleDisabled] of [['missing-earlier','history-migration/1',false], ['missing-later','history-migration/0',false], ['missing-earlier','history-migration/0',true], ['missing-title','history-migration/1',true]]) {
    const count = requests.length;
    await p.goto(url(name) + '#' + key, {waitUntil:'load'}); await ready(p);
    const held = await state(p); assert.deepEqual(held.queue, []);
    await readerActions(p, !singleDisabled);
    assert.equal(await p.$eval('#audioReadLine', e => e.disabled), true);
    assert.equal(await p.$eval('#audioRead', e => e.disabled), singleDisabled);
    if (singleDisabled) {
      assert(await p.evaluate(key => Boolean(AUDIO_MANIFEST.tracks[key]) && !AUDIO_MANIFEST.assets[key], key), 'Missing body/title leaves a plan, not a resolved body');
      if (name === 'missing-title') assert.equal(await p.evaluate(() => Boolean(AUDIO_MANIFEST.assets['history-migration/title'])), false);
      // No click on hidden controls: title filtering removes the dependent body, so the whole strip is absent.
    } else await p.$eval('#audioReadLine', e => e.click());
    assert.deepEqual(await state(p), held, 'Unavailable reading must leave the queue/transport untouched');
    assert.equal(await p.$eval('#audioPlayer', e => e.hidden), true);
    assert.equal(await p.$eval('#atlasAudioElement', a => a.getAttribute('src')), null); assert.equal(requests.length, count);
  }
  pass('Missing body/title hides the reader strip; missing earlier/later scenes still disable whole-line reading without media requests or queue changes');

  await p.goto(url('fixture') + '#history-migration', {waitUntil:'load'}); await ready(p);
  failedMedia.add('history-migration/1');
  await p.click('#audioReadLine'); await stage(p, 0, 'title');
  await finishClip(p); await stage(p, 0, 'body');
  await finishClip(p); await p.waitForFunction(() => Boolean(atlasAudio.state().error));
  after = await state(p); assert.equal(after.index, 1); assert.equal(after.phase, 'body'); assert(!after.playing); assert(!after.wantsPlay);
  assert.match(await p.$eval('#audioError', e => e.textContent), /不会跳过/);
  assert.deepEqual(after.queue, data.routes.prehistory);
  failedMedia.delete('history-migration/1');
  await p.click('#audioToggle'); await stage(p, 1, 'body');
  failedMedia.add('history-farming/title');
  await p.click('#audioNext'); await p.waitForFunction(() => Boolean(atlasAudio.state().error));
  assert.equal((await state(p)).index, 2); assert.equal((await state(p)).phase, 'title');
  failedMedia.delete('history-farming/title');
  await p.click('#audioToggle'); await stage(p, 2, 'title');
  pass('404 in either body or title stops on that phase, gives an explicit error, never skips; retry uses same track and phase');

  // Delay an old play promise until after replacement, then reject it. The stale rejection must not stop the latest request.
  await p.evaluate(() => {
    const a = document.getElementById('atlasAudioElement'), native = a.play.bind(a);
    let first = true;
    a.play = function () {
      if (!first) return native();
      first = false; native().catch(() => {});
      return new Promise((resolve, reject) => { window.rejectOldPlay = reject; });
    };
    go('history-migration/1'); document.getElementById('audioRead').click();
    go('topic-energy'); document.getElementById('audioRead').click();
    go('topic-grail-sword'); document.getElementById('audioRead').click();
    delete a.play;
  });
  await playing(p);
  await p.evaluate(() => window.rejectOldPlay(new DOMException('Stale request', 'NotAllowedError')));
  assert.deepEqual((await state(p)).queue, ['topic-grail-sword']); assert.equal((await state(p)).error, '');
  await p.evaluate(() => {
    const a = document.getElementById('atlasAudioElement'), native = a.play.bind(a);
    a.play = function () { native().catch(() => {}); return new Promise(resolve => { window.resolveOldPlay = resolve; }); };
    document.getElementById('audioRead').click(); document.getElementById('audioToggle').click();
    delete a.play; window.resolveOldPlay();
  });
  assert.equal(await p.$eval('#atlasAudioElement', a => a.paused), true); assert.equal((await state(p)).wantsPlay, false); assert.equal((await state(p)).error, '');
  pass('Rapid replacements and pause during pending play ignore stale promises; no stale error, restart or lost speed');

  await board(p, 'prehistory', 'history-migration/1'); await p.click('#audioReadLine'); await playing(p); await p.click('#audioToggle');
  const desktop = await geometry(p, 1440);
  await p.setViewport({width:390, height:844});
  await p.waitForFunction(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--audio-height')) === document.getElementById('audioPlayer').offsetHeight);
  const mobile = await geometry(p, 390);
  await p.click('#audioQueueToggle');
  let panel = await p.$eval('#audioQueuePanel', e => e.getBoundingClientRect().toJSON());
  assert(panel.left >= 0 && panel.right <= 390 && panel.bottom <= 844 && panel.height <= 844 * .35);
  await p.click('#audioQueueClose');
  await p.evaluate(() => metroUI.setMode('network'));
  assert(await p.$eval('#networkMode', e => e.getBoundingClientRect().top) >= mobile.player.bottom);
  await p.evaluate(() => go('topic-energy'));
  await geometry(p, 390);
  pass(`Desktop and 390px: controls hit-test, no horizontal overflow/covered masthead, usable reader, bounded queue (ribbon ${desktop.player.height}/${mobile.player.height}px)`);

  await setOptions(p, true, true);
  assert((await state(p)).includeExtras && (await state(p)).includePeople);
  const savedSpeed = (await state(p)).speed, count = requests.length;
  await p.reload({waitUntil:'load'}); await ready(p);
  assert.equal((await state(p)).speed, savedSpeed);
  assert.equal((await state(p)).includeExtras, false); assert.equal((await state(p)).includePeople, false);
  assert.equal(await p.$eval('#atlasAudioElement', a => a.playbackRate), savedSpeed);
  assert.equal(await p.$eval('#audioPlayer', e => e.hidden), true);
  assert.equal(await p.$eval('#atlasAudioElement', a => a.getAttribute('src')), null);
  assert.equal(requests.length, count);
  pass('Reload retains user speed, resets both optional groups off, and restores neither playback nor an unsolicited media download');

  // All local MP3s already existed at assembly/validation time; also exercise playback via file://.
  await p.goto(pathToFileURL(preview).href + '#history-migration/1', {waitUntil:'load'}); await ready(p);
  await p.click('#audioRead'); await stage(p, 0, 'title');
  await finishClip(p); await stage(p, 0, 'body');
  pass('Preview --audio-manifest rebases local URLs correctly; a standalone file:// HTML plays the real local MP3 fixture');

  // Reading-entry buttons belong to the reader: arrow keys must still navigate chapters after a click.
  const keyStops = await p.evaluate(() => {
    const stops = metroUI.data.lineStops.get('trunk'), at = stops.findIndex((s, i) => i > 0 && i < stops.length - 1 && s.to > s.from);
    return stops.slice(at - 1, at + 2).map(s => ({id:s.id, from:s.from, to:s.to}));
  });
  assert.equal(keyStops.length, 3);
  for (const width of [1440, 390]) {
    await p.setViewport({width, height:width === 390 ? 844 : 960});
    await p.goto(url('fixture') + '#history-migration/1', {waitUntil:'load'}); await ready(p);
    for (const button of ['audioRead', 'audioReadLine']) {
      await board(p, 'trunk', keyStops[1].id + '/' + keyStops[1].from);
      await p.click('#' + button); await playing(p);
      assert.equal(await p.evaluate(() => document.activeElement.id), button);
      const sound = await state(p);
      for (const [key, station] of [['ArrowRight', keyStops[2]], ['ArrowLeft', keyStops[1]], ['ArrowLeft', keyStops[0]], ['ArrowRight', keyStops[1]]]) {
        await p.focus('#' + button); await p.keyboard.press(key);
        await p.waitForFunction((id, scene) => ENTRIES[cur].id === id && sceneIndex === scene, {}, station.id, station.from);
        const now = await state(p);
        for (const field of ['queue', 'index', 'phase', 'partId', 'partIndex', 'includeExtras', 'includePeople', 'selectedDuration', 'src', 'speed', 'wantsPlay']) assert.deepEqual(now[field], sound[field], button + ': navigation changed audio ' + field);
        assert(now.playing && now.currentTime >= sound.currentTime);
      }
    }
  }
  pass('Desktop/390px: focused 朗读 and 连续朗读 buttons pass left/right to chapter navigation without changing audio');

  const arrowKeys = ['ArrowRight', 'ArrowLeft', 'ArrowDown', 'ArrowUp'];
  const anchorKey = keyStops[1].id + '/' + keyStops[1].from;
  const unchangedAudio = async (expected, label) => {
    const actual = await state(p);
    for (const field of ['queue', 'index', 'phase', 'partId', 'partIndex', 'includeExtras', 'includePeople', 'selectedDuration', 'src', 'speed', 'wantsPlay', 'playing', 'currentTime']) {
      assert.deepEqual(actual[field], expected[field], label + ': changed audio ' + field);
    }
  };
  const settledSeek = () => p.waitForFunction(() => !document.getElementById('atlasAudioElement').seeking);
  const focusControl = async selector => {
    await p.focus(selector);
    assert(await p.$eval(selector, e => document.activeElement === e && !e.disabled), 'Must really focus ' + selector);
  };
  const kinKey = await p.evaluate(() => {
    for (const e of HISTORY_ENTRIES) for (const b of e.boxes || []) if (/kin-tree/.test(b.text)) return e.id + '/' + b.scene;
  });
  assert(kinKey, 'Need a real genealogy sheet for the focus-priority regression');
  for (const width of [1440, 390]) {
    await p.setViewport({width, height:width === 390 ? 844 : 960});
    await p.goto(url('fixture') + '#history-migration/1', {waitUntil:'load'}); await ready(p);
    await p.click('#audioReadLine'); await playing(p); await p.click('#audioToggle');
    await p.$eval('#audioSeek', e => { e.value = '500'; e.dispatchEvent(new Event('input', {bubbles:true})); });
    await settledSeek();
    await board(p, 'trunk', anchorKey); await p.click('#audioQueueToggle');
    // Enumerate every enabled audio control, including every row in the frozen queue.
    const controls = await p.$$eval('#audioPlayer button,#audioPlayer input[type="range"],#audioPlayer input[type="checkbox"],#readerAudioActions button,#readerAudioActions input[type="checkbox"]', es => es.map(e => {
      if (e.id) return '#' + e.id;
      if (e.dataset.audioItem !== undefined) return '[data-audio-item="' + e.dataset.audioItem + '"]';
      throw new Error('Audio control has no test selector');
    }));
    const playerControls = controls.filter(s => !['#audioRead', '#audioReadLine', '#audioReadIncludeExtras', '#audioReadIncludePeople'].includes(s));
    const frozen = await state(p); assert.equal(frozen.playing, false);
    for (const selector of controls) {
      await board(p, 'trunk', anchorKey);
      for (const [key, stop] of [
        ['ArrowRight', keyStops[2]], ['ArrowLeft', keyStops[1]], ['ArrowLeft', keyStops[0]], ['ArrowRight', keyStops[1]],
        ['ArrowDown', {...keyStops[1], from:keyStops[1].from + 1}], ['ArrowUp', keyStops[1]]
      ]) {
        await focusControl(selector); await p.keyboard.press(key);
        const b = await browseState(p), label = `${width} ${selector} ${key}`;
        assert.equal(b.id, stop.id, label); assert.equal(b.scene, stop.from, label);
        assert.equal(b.line, 'trunk', label); assert.equal(b.metro, 'ride', label);
        await unchangedAudio(frozen, label);
        assert.equal(await p.$eval('#audioQueuePanel', e => e.hidden), false, 'Navigation must not close the queue');
      }
    }
    // At line boundaries the keys are still consumed by navigation, not by a range's native value step.
    for (const selector of ['#audioSpeed', '#audioSeek', '#audioIncludeExtras', '#audioIncludePeople', '#audioReadIncludeExtras', '#audioReadIncludePeople']) {
      for (const [key, scene] of [['ArrowLeft', data.routes.trunk[0]], ['ArrowRight', data.routes.trunk.at(-1)]]) {
        await board(p, 'trunk', scene); const edge = await browseState(p);
        await focusControl(selector); await p.keyboard.press(key);
        assert.deepEqual(await browseState(p), edge); await unchangedAudio(frozen, 'Line edge ' + selector);
      }
    }
    await p.evaluate(() => metroUI.setMode('network'));
    const wholeMap = await browseState(p);
    for (const selector of playerControls) for (const key of arrowKeys) {
      await focusControl(selector); await p.keyboard.press(key);
      assert.deepEqual(await browseState(p), wholeMap, `${width} network ${selector} ${key}`);
      await unchangedAudio(frozen, 'Network ' + selector);
    }
    // Outside history, use the atlas's existing keys. No-scene geography is the range fallback case.
    for (const selector of playerControls) for (const id of ['topic-energy', 'overview']) {
      await p.evaluate(id => go(id), id); const start = await browseState(p);
      await focusControl(selector); await p.keyboard.press('ArrowRight');
      let b = await browseState(p);
      assert.equal(b.id, id); assert.equal(b.scene, id === 'topic-energy' ? 1 : start.scene);
      await unchangedAudio(frozen, selector + ' off/right');
      await focusControl(selector); await p.keyboard.press('ArrowLeft');
      assert.equal((await browseState(p)).scene, start.scene); await unchangedAudio(frozen, selector + ' off/left');
      await focusControl(selector); await p.keyboard.press('ArrowDown');
      b = await browseState(p); assert.notEqual(b.id, id); assert.equal(b.metro, 'off');
      await unchangedAudio(frozen, selector + ' off/down');
      await focusControl(selector); await p.keyboard.press('ArrowUp');
      assert.equal((await browseState(p)).id, id); await unchangedAudio(frozen, selector + ' off/up');
    }
    pass(`${width}px: all ${controls.length} audio controls yield four arrows; line edges/network/off modes and open queue preserve paused audio exactly`);

    await board(p, 'trunk', anchorKey); await p.click('#audioQueueClose');
    const readingBeforeDrag = await browseState(p);
    for (const id of ['audioSpeed', 'audioSeek']) {
      const r = await p.$eval('#' + id, e => { const b = e.getBoundingClientRect(); return {x:b.x, y:b.y, width:b.width, height:b.height}; });
      await p.mouse.move(r.x + r.width * .15, r.y + r.height / 2); await p.mouse.down();
      await p.mouse.move(r.x + r.width * .5, r.y + r.height / 2, {steps:4}); await p.mouse.up();
      await settledSeek();
      assert.equal(await p.evaluate(() => document.activeElement.id), id, 'Drag really leaves focus on the range');
      if (id === 'audioSpeed') assert.equal((await state(p)).speed, 1.75);
      else assert(Math.abs(await p.$eval('#atlasAudioElement', a => a.currentTime / a.duration) - .5) < .03);
      assert.deepEqual(await browseState(p), readingBeforeDrag);
      const afterDrag = await state(p);
      await p.keyboard.press('ArrowRight'); assert.equal((await browseState(p)).id, keyStops[2].id);
      await p.keyboard.press('ArrowLeft'); assert.equal((await browseState(p)).id, keyStops[1].id);
      await unchangedAudio(afterDrag, 'Arrows after real drag');
    }
    await focusControl('#audioSpeed');
    for (const [key, value] of [['Home',1], ['PageUp',1.25], ['PageDown',1], ['End',3], ['PageDown',2.5]]) {
      await p.keyboard.press(key); assert.equal((await state(p)).speed, value, 'Native speed ' + key);
      assert.equal(await p.$eval('#atlasAudioElement', a => a.playbackRate), value);
    }
    await focusControl('#audioSeek');
    for (const [key, fraction] of [['Home',0], ['PageUp',.1], ['PageDown',0], ['End',1], ['Home',0]]) {
      await p.keyboard.press(key); await settledSeek();
      assert(Math.abs(await p.$eval('#atlasAudioElement', a => a.currentTime / a.duration) - fraction) < .02, 'Native seek ' + key);
    }
    assert.deepEqual(await browseState(p), readingBeforeDrag);
    // Enter/Space/Tab keep native button activation/focus; no forced blur or tabindex=-1 escape hatch.
    await focusControl('#audioToggle'); await p.keyboard.press('Enter'); await playing(p);
    await p.keyboard.press('Space'); assert.equal((await state(p)).playing, false);
    await focusControl('#audioSeek'); await p.keyboard.press('Tab');
    assert.equal(await p.evaluate(() => document.activeElement.id), 'audioSpeed');
    const beforeCheckbox = await state(p), beforeCheckboxBrowse = await browseState(p);
    for (const [id, field] of [['audioIncludeExtras','includeExtras'], ['audioIncludePeople','includePeople']]) {
      await focusControl('#' + id); await p.keyboard.press('Space'); assert.equal((await state(p))[field], true);
      await p.keyboard.press('Space'); assert.equal((await state(p))[field], false);
      assert.equal(await p.evaluate(() => document.activeElement.id), id, 'Checkbox keeps native focus/Space');
    }
    await unchangedAudio(beforeCheckbox, 'Native checkbox Space round trip'); assert.deepEqual(await browseState(p), beforeCheckboxBrowse);
    await focusControl('#audioQueueToggle'); await p.keyboard.press('Tab'); assert.equal(await p.evaluate(() => document.activeElement.id), 'audioIncludeExtras');
    await p.keyboard.press('Tab'); assert.equal(await p.evaluate(() => document.activeElement.id), 'audioIncludePeople');
    const guardedAudio = await state(p), guardedBrowse = await browseState(p);
    const untouchedModifiers = await p.evaluate(() => {
      const results = [];
      for (const id of ['audioSpeed','audioSeek','audioIncludeExtras','audioIncludePeople','audioReadIncludeExtras','audioReadIncludePeople']) for (const flag of ['altKey','ctrlKey','metaKey','shiftKey','isComposing']) {
        const ev = new KeyboardEvent('keydown', {key:'ArrowRight', bubbles:true, cancelable:true, [flag]:true});
        document.getElementById(id).dispatchEvent(ev); results.push({id, flag, untouched:!ev.defaultPrevented});
      }
      return results;
    });
    assert(untouchedModifiers.every(x => x.untouched), JSON.stringify(untouchedModifiers));
    assert.deepEqual(await browseState(p), guardedBrowse); await unchangedAudio(guardedAudio, 'Modifiers/composition');
    // End while playing is still a real seek to EOF: title -> body -> next item, not a disabled keyboard control.
    // Source replacement can disable the range and drop native focus; reacquire it only when ready.
    const readyEndSeek = () => p.waitForFunction(() => {
      const a = document.getElementById('atlasAudioElement');
      return !document.getElementById('audioSeek').disabled && a.readyState >= 2 && !a.seeking;
    });
    await board(p, 'prehistory', data.routes.prehistory[1]); await p.click('#audioReadLine'); await stage(p, 1, 'title');
    await readyEndSeek(); await focusControl('#audioSeek'); await p.keyboard.press('End'); await stage(p, 1, 'body');
    await readyEndSeek();
    console.log(`NOTE ${width}px native End before body refocus: ` + JSON.stringify(await p.evaluate(() => {
      const s = atlasAudio.state();
      return {activeElement:document.activeElement.id || document.activeElement.tagName,
        seekDisabled:document.getElementById('audioSeek').disabled, readyState:document.getElementById('atlasAudioElement').readyState,
        index:s.index, phase:s.phase, partId:s.partId, playing:s.playing, currentTime:s.currentTime};
    })));
    await focusControl('#audioSeek'); await p.keyboard.press('End');
    await stage(p, 2, data.routes.prehistory[1].split('/')[0] === data.routes.prehistory[2].split('/')[0] ? 'body' : 'title');
    await p.click('#audioToggle');
    pass(`${width}px: real drag retains focus but not arrow ownership; native Page/Home/End, Enter/Space/Tab, modifiers and EOF remain usable`);

    // A true modal outranks both the queue and the two navigation handlers.
    await board(p, 'eeurope', 'history-empire-fall-1453/0'); await p.click('#audioQueueToggle');
    await p.focus('#map');
    await p.$eval('#transferBar [data-transfer="east"]', e => e.click());
    assert.equal(await p.evaluate(() => document.activeElement.id), 'transferConfirm');
    const behindModal = await browseState(p), modalAudio = await state(p);
    for (const key of arrowKeys) {
      await p.keyboard.press(key); assert.deepEqual(await browseState(p), behindModal);
      await unchangedAudio(modalAudio, 'Modal ' + key);
    }
    await p.keyboard.press('Escape');
    assert.equal(await p.$eval('#transferDialog', e => e.open), false);
    assert.equal(await p.$eval('#audioQueuePanel', e => e.hidden), false);
    assert.equal(await p.evaluate(() => document.activeElement.id), 'map');
    assert.deepEqual(await browseState(p), behindModal);
    // Escape outside the queue must not steal focus, even while the queue remains open.
    await p.keyboard.press('Escape');
    assert.equal((await browseState(p)).metro, 'network');
    assert.equal(await p.$eval('#audioQueuePanel', e => e.hidden), false);
    assert.equal(await p.evaluate(() => document.activeElement.id), 'map');

    for (const escapeFocus of ['#kinClose', '#audioSeek', '#audioIncludeExtras', '#audioIncludePeople']) {
      await p.evaluate(key => go(key), kinKey);
      await p.$eval('.scene-passage.current svg.kin-tree', e => e.dispatchEvent(new MouseEvent('click', {bubbles:true})));
      assert.equal(await p.$eval('#kinSheet', e => e.hidden), false);
      const behindKin = await browseState(p), kinAudio = await state(p);
      for (const selector of ['#kinClose', '#audioSpeed', '#audioSeek', '#audioIncludeExtras', '#audioIncludePeople']) for (const key of arrowKeys) {
        await focusControl(selector); await p.keyboard.press(key);
        assert.deepEqual(await browseState(p), behindKin); await unchangedAudio(kinAudio, 'Genealogy ' + selector + key);
      }
      await focusControl(escapeFocus); await p.keyboard.press('Escape');
      assert.equal(await p.$eval('#kinSheet', e => e.hidden), true);
      assert.equal(await p.$eval('#audioQueuePanel', e => e.hidden), false);
      assert.notEqual(await p.evaluate(() => document.activeElement.id), 'audioQueueToggle', 'Closing genealogy must not steal focus for the queue');
      assert.deepEqual(await browseState(p), behindKin);
    }
    await focusControl('#audioQueueToggle'); await p.keyboard.press('Escape');
    assert.equal(await p.$eval('#audioQueuePanel', e => e.hidden), true);
    assert.equal((await browseState(p)).metro, 'ride');
    await p.keyboard.press('Escape'); assert.equal((await browseState(p)).metro, 'network');
    pass(`${width}px: dialog/genealogy block all underlying arrows; Escape respects the focused layer and never traps focus in the player`);
  }

  // Native editors and the keyboard-resizable separator retain their exceptions.
  await p.setViewport({width:1440, height:960}); await board(p, 'trunk', anchorKey);
  await p.evaluate(() => {
    const box = document.createElement('div'); box.id = 'nativeKeyControls';
    box.style.cssText = 'position:fixed;bottom:4px;left:4px;z-index:5000';
    box.innerHTML = '<input id="keyInput" value="abc"><textarea id="keyTextarea">abc</textarea><div id="keyEditable" contenteditable="true">abc</div><select id="keySelect"><option>A</option><option>B</option></select>';
    document.body.append(box);
    document.getElementById('keySelect').addEventListener('keydown', e => { window.selectKeyUntouched = !e.defaultPrevented; });
  });
  const editorBrowse = await browseState(p), editorAudio = await state(p);
  for (const selector of ['#keyInput','#keyTextarea','#keyEditable']) {
    await p.$eval(selector, e => { e.focus(); if (e.isContentEditable) getSelection().collapse(e.firstChild, 3); else e.setSelectionRange(3, 3); });
    await p.keyboard.press('ArrowLeft');
    assert.equal(await p.$eval(selector, e => e.isContentEditable ? getSelection().anchorOffset : e.selectionStart), 2);
    assert.deepEqual(await browseState(p), editorBrowse); await unchangedAudio(editorAudio, 'Editor ' + selector);
  }
  await focusControl('#keySelect'); await p.keyboard.press('ArrowDown');
  assert.equal(await p.evaluate(() => window.selectKeyUntouched), true); await p.keyboard.press('Escape');
  assert.deepEqual(await browseState(p), editorBrowse); await unchangedAudio(editorAudio, 'Select');
  await p.$eval('#nativeKeyControls', e => e.remove());
  await focusControl('#readerGrip'); // Focus refreshes aria-valuenow after the mobile -> desktop resize.
  const gripWidth = await p.$eval('#readerGrip', e => Number(e.getAttribute('aria-valuenow')));
  await p.keyboard.press('ArrowRight');
  assert.equal(await p.$eval('#readerGrip', e => Number(e.getAttribute('aria-valuenow'))), gripWidth + 16);
  await p.keyboard.press('ArrowLeft');
  assert.equal(await p.$eval('#readerGrip', e => Number(e.getAttribute('aria-valuenow'))), gripWidth);
  assert.deepEqual(await browseState(p), editorBrowse); await unchangedAudio(editorAudio, 'Separator');
  pass('Text input, textarea, contentEditable, select and explicitly focused separator keep native editing keys');

  // Optional handoff smoke: run with AUDIO_PLAYER_SMOKE_MANIFEST=/absolute/local-or-Blob-manifest.json.
  // It is a separate preview, never the fixture or release manifest. No promise of real-device lock-screen coverage.
  if (process.env.AUDIO_PLAYER_SMOKE_MANIFEST) {
    const real = path.join(scratch, 'pages', 'real.html');
    const realManifest = JSON.parse(fs.readFileSync(path.resolve(process.env.AUDIO_PLAYER_SMOKE_MANIFEST), 'utf8'));
    assert.equal(realManifest.schema, 2); assert.equal(realManifest.policy, 3);
    const historyIds = ['history-migration/title','history-migration/1'];
    const hasHistory = historyIds.every(key => realManifest.assets[key]);
    const preferredTopics = ['topic-energy','topic-china-cycles'];
    const realTopics = preferredTopics.filter(key => realManifest.assets[key]);
    if (!realTopics.length) {
      const availableTopic = data.topics.find(key => realManifest.assets[key]);
      if (availableTopic) realTopics.push(availableTopic);
    }
    const realStart = hasHistory ? 'history-migration/1' : realTopics[0];
    assert(realStart, 'Real smoke needs a supplied migration title/body pair or a supplied topic body');
    if (!hasHistory) console.log('NOTE supplied real selection lacks ' + historyIds.filter(key => !realManifest.assets[key]).join(', ') + '; migration playback not tested, starting at ' + realStart + '.');
    execFileSync(process.env.PYTHON || 'python3', ['assemble.py', real, '--audio-manifest', path.resolve(process.env.AUDIO_PLAYER_SMOKE_MANIFEST)], {cwd:src, stdio:'pipe'});
    const realDuration = async key => {
      const expected = realManifest.assets[key], actual = await p.$eval('#atlasAudioElement', a => ({duration:a.duration, src:a.currentSrc}));
      assert(actual.src.endsWith(expected.audioHash + '.mp3'), 'Wrong real clip: ' + key);
      assert(Math.abs(actual.duration - expected.duration) <= Math.max(.5, expected.duration * .001), JSON.stringify({key,actual:actual.duration,expected:expected.duration}));
    };
    realSmoke = true;
    const beforeReal = requests.length;
    await p.setViewport({width:1440, height:960});
    await p.goto(pathToFileURL(real).href + '#' + realStart, {waitUntil:'load'}); await ready(p);
    assert.equal(requests.length, beforeReal, 'Real MP3s must not download before a reading click');
    await readerActions(p, true);
    assert.equal(await p.$eval('#audioRead', e => e.disabled), false);
    if (hasHistory) {
      await p.click('#audioRead'); await stage(p, 0, 'title'); await realDuration('history-migration/title');
      await finishClip(p); await stage(p, 0, 'body'); await realDuration('history-migration/1');
      await geometry(p, 1440);
    }
    const omittedTopics = preferredTopics.filter(key => !realManifest.assets[key]);
    if (omittedTopics.length) console.log('NOTE supplied real selection has no ' + omittedTopics.join(', ') + '; complete topic playback is still covered by the native MP3 fixture.');
    for (const key of realTopics) {
      await p.evaluate(key => go(key), key); await p.click('#audioRead'); await stage(p, 0, 'body');
      await realDuration(key);
      await p.$eval('#audioSeek', e => { e.value = '850'; e.dispatchEvent(new Event('input', {bubbles:true})); });
      await p.waitForFunction(() => {
        const a = document.getElementById('atlasAudioElement');
        return !a.seeking && a.readyState >= 2 && Math.abs(a.currentTime / a.duration - .85) < .02;
      });
      assert.deepEqual((await state(p)).queue, [key]);
    }
    if (!hasHistory) await geometry(p, 1440);
    const realPlans = await p.evaluate(() => AUDIO_MANIFEST.tracks), sampledKinds = [];
    for (const kind of ['moment','box','person']) {
      const sample = Object.entries(realPlans).flatMap(([key, plan]) => [...plan.extras, ...plan.people].filter(part => part.kind === kind && realManifest.assets[part.id] && realManifest.assets[key] && (!plan.titleId || realManifest.assets[plan.titleId])).map(part => ({key, plan, part})))[0];
      if (!sample) { console.log('NOTE supplied real selection has no ' + kind + ' clip; fixture retains this branch coverage.'); continue; }
      if ((await state(p)).wantsPlay) await p.click('#audioToggle');
      await setOptions(p, kind !== 'person', kind === 'person');
      await readBody(sample.key); await finishClip(p);
      for (const part of kind === 'person' ? sample.plan.people : sample.plan.extras) {
        await partReady(p, part.id);
        if (part.id === sample.part.id) break;
        await finishClip(p);
      }
      await realDuration(sample.part.id);
      await p.$eval('#audioSeek', e => { e.value = '500'; e.dispatchEvent(new Event('input', {bubbles:true})); });
      await p.waitForFunction(() => { const a = document.getElementById('atlasAudioElement'); return !a.seeking && Math.abs(a.currentTime / a.duration - .5) < .03; });
      await p.click('#audioToggle'); sampledKinds.push(kind);
    }
    await p.setViewport({width:390, height:844});
    await p.waitForFunction(() => parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--audio-height')) === document.getElementById('audioPlayer').offsetHeight);
    await geometry(p, 390);
    pass(`Real Yunjian ${hasHistory ? 'migration title/body' : 'topic-led smoke (migration pair absent)'}, ${realTopics.length} supplied topics and ${sampledKinds.join('/') || 'no supplied optional kinds'}: receipt hashes/durations/seek, desktop/390px, zero pre-click MP3`);
  }
  assert.deepEqual(errors, []);
  for (const [file, hash] of protectedFiles) assert.equal(sha(fs.readFileSync(file)), hash, 'Test changed ' + file);
  pass('No page JavaScript errors; official index and manifest unchanged');
  console.log(`PASS: ${checks.length} audio-player checks; real native MP3 decoding/events, route snapshots, availability/errors/races, desktop + 390px. Media Session device/lock-screen behavior not tested.`);
})().catch(e => { console.error(e); process.exitCode = 1; }).finally(async () => {
  if (browser) await browser.close();
  if (server) { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
  fs.rmSync(scratch, {recursive:true, force:true});
});
