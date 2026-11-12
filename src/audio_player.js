/* Playback is independent of the reader. Only a reading button replaces the frozen queue.
   Load before metro_ui.js so Escape can close the focused queue before leaving the reader. */
(() => {
'use strict';
const $ = id => document.getElementById(id);
const audio = $('atlasAudioElement'), player = $('audioPlayer');
const rates = [1, 1.25, 1.5, 1.75, 2, 2.5, 3];
const SPEED_KEY = 'atlas-audio-speed-v1';
const entries = new Map(ENTRIES.map(e => [e.id, e]));
const supported = AUDIO_MANIFEST.schema === 2 && AUDIO_MANIFEST.policy === 3;
const assets = supported ? AUDIO_MANIFEST.assets : {}, plans = supported ? AUDIO_MANIFEST.tracks : {};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const time = n => { n = Math.max(0, Math.floor(Number.isFinite(n) ? n : 0)); return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0'); };
const extrasControls = ['audioIncludeExtras', 'audioReadIncludeExtras'];
const peopleControls = ['audioIncludePeople', 'audioReadIncludePeople'];
// 老无 2026-11-12: a part with no published audio is not a dead end. The fixed notice
// “此处音频文件暂缺，为您继续朗读下一段。” plays in its place and reading carries on with the next part;
// a run of missing parts gets one notice. Once the recording is published it simply plays instead.
const NOTICE = typeof AUDIO_GAP_NOTICE === 'object' && AUDIO_GAP_NOTICE && typeof AUDIO_GAP_NOTICE.url === 'string' &&
  AUDIO_GAP_NOTICE.url.startsWith('data:audio/mpeg;base64,') ? Object.freeze({...AUDIO_GAP_NOTICE}) : null;
const ICON = {play:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.2v13.6L19 12z"/></svg>',
  pause:'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 5h4v14h-4zM13.5 5h4v14h-4z"/></svg>'};
const FALLBACK_TITLE = '简明欧洲史图册 · 朗读';
const phoneLayout = () => matchMedia('(max-width:820px)').matches;
let queue = Object.freeze([]), at = -1, mode = 'single', line = null;
let phase = 'body', partIndex = 0, finished = false, error = '', errorKind = '', speed = 1, gap = false;
// What the OS media session is told: the listener's intent, kept through clip switches (a locked phone sleeps on 'paused').
let sessionPlaying = false;
let includeExtras = false, includePeople = false;
let loadToken = 0, playToken = 0, wantsPlay = false, waiting = false, expectedURL = '', pendingOffset = null;
try { const saved = Number(localStorage.getItem(SPEED_KEY)); if (rates.includes(saved)) speed = saved; } catch {}
const current = () => queue[at];
// -1 is the separate title prelude; nonnegative positions follow the frozen canonical part order.
const part = () => partIndex < 0 ? current()?.titlePart : current()?.parts[partIndex];
const clip = () => part()?.asset;
const enabled = p => p?.group === 'extras' ? includeExtras : p?.group === 'people' ? includePeople : true;
const isCurrentSource = () => Boolean(expectedURL) && audio.currentSrc === expectedURL;
// 老无 2026-11-12: a locked Android phone must read on from clip to clip. Switching the element's src at every boundary
// (ended → pause → load → play) lets Chrome's media session go idle while the page is hidden; the notification goes
// and the page is frozen before the next clip starts. On Chromium the clips are therefore fed through Media Source
// Extensions into one continuous stream: the next clip's bytes are appended ahead, and a boundary is only the playhead
// moving on (no ended, no pause, no new src). Other browsers, file: previews, a stream that cannot go on (e.g. a fetch
// that failed: it ends, and the element path retries and stops with a retry message) and suites that ask for it
// (window.ATLAS_AUDIO_ENGINE = 'element') switch the element's src as before.
const STREAMING = window.ATLAS_AUDIO_ENGINE !== 'element' && typeof MediaSource === 'function' &&
  Boolean(navigator.userAgentData?.brands?.some(b => /Chromium/.test(b.brand))) && MediaSource.isTypeSupported('audio/mpeg');
const streamable = url => STREAMING && /^(https?:|data:audio\/mpeg;)/.test(url);
let stream = null;
// The current clip's span on the element's timeline: [0, duration] for a plain src, its place in the stream otherwise.
function clipSpan() {
  if (stream) {
    const c = stream.cur;
    return c && !stream.switching && audio.currentSrc === stream.url && c.ti === at && c.pi === partIndex ? c : null;
  }
  return isCurrentSource() && Number.isFinite(audio.duration) && audio.duration > 0 ? {start:0, end:audio.duration} : null;
}
const clipPosition = () => { const s = clipSpan(); return s ? Math.min(s.end - s.start, Math.max(0, audio.currentTime - s.start)) : 0; };

function syncOptionInputs() {
  for (const id of extrasControls) $(id).checked = includeExtras;
  for (const id of peopleControls) $(id).checked = includePeople;
}
function assetFor(key) {
  const a = assets?.[key];
  if (!a || typeof a.url !== 'string' || !a.url.trim() || !(Number.isFinite(a.duration) && a.duration > 0)) return null;
  try {
    const url = new URL(a.url, location.href);
    // Published recordings use HTTPS; a preview may use a relative file/localhost URL.
    if ((/^[a-z][\w+.-]*:/i.test(a.url) || a.url.startsWith('//')) && url.protocol !== 'https:') return null;
    if (!['https:', 'http:', 'file:'].includes(url.protocol)) return null;
    return Object.freeze({...a, url: url.href});
  } catch { return null; }
}
function track(id, scene = 0) {
  const e = entries.get(id);
  if (!e || !['history', 'topic'].includes(e.kind)) return null;
  const historical = e.kind === 'history';
  if (historical && !e.scenes[scene]) return null;
  const key = historical ? `${id}/${scene}` : id;
  const plan = plans?.[key], title = historical ? e.scenes[scene].title : e.title;
  const planned = plan?.bodyId === key && Array.isArray(plan.extras) && Array.isArray(plan.people) &&
    (historical ? plan.titleId === id + '/title' : plan.titleId === null);
  const makePart = (id, kind, label, group) => Object.freeze({id, kind, label, group, asset:assetFor(id)});
  // Canonical IDs, order and labels come only from the resolved source plan, never reconstructed in the UI.
  const parts = planned ? [makePart(plan.bodyId, 'body', title, 'body'),
    ...plan.extras.map(p => makePart(p.id, p.kind, p.label, 'extras')),
    ...plan.people.map(p => makePart(p.id, p.kind, p.label, 'people'))] : [];
  return Object.freeze({key, entryId:id, scene, kind:e.kind, title, chapter:e.title, planned,
    parts:Object.freeze(parts), titlePart:planned && plan.titleId ? makePart(plan.titleId, 'title', e.title, 'title') : null});
}
function lineSnapshot(id) {
  const metro = window.metroUI, source = metro?.data.lines.find(l => l.id === id), stops = metro?.data.lineStops.get(id);
  if (!source || !stops?.length) return null;
  const tracks = [];
  // These are the actual metro stations, including split sections. No ancestor lines or inferred route.
  for (const s of stops) for (let i = s.from; i <= s.to; i++) tracks.push(track(s.id, i));
  return {line:Object.freeze({id:source.id, name:source.name}), tracks};
}
function requiredParts(t) {
  if (!t?.planned) return [{id:t?.key || '无效幕', asset:null}];
  return [...(t.titlePart ? [t.titlePart] : []), ...t.parts.filter(enabled)];
}
const countMissing = parts => new Set(parts.filter(p => !p.asset).map(p => p.id)).size;
// Informational only: missing parts are announced and passed over, never a reason to refuse reading.
const missing = tracks => countMissing(tracks.flatMap(requiredParts));
function selectedDuration(t) {
  if (!t?.planned) return null;
  return t.parts.filter(enabled).reduce((total, p) => total + (p.asset ? p.asset.duration : 0), 0);
}
function playlistItems() {
  const items = [];
  queue.forEach((t, trackIndex) => {
    if (!t) return;
    t.parts.forEach((p, pi) => {
      if (enabled(p)) items.push({trackIndex, partIndex:pi, track:t, part:p});
    });
  });
  return items;
}
function currentPlaylistIndex(items = playlistItems()) {
  if (at < 0 || !items.length) return -1;
  const activePart = partIndex < 0 ? 0 : partIndex;
  const exact = items.findIndex(x => x.trackIndex === at && x.partIndex === activePart);
  if (exact >= 0) return exact;
  for (let i = items.length - 1; i >= 0; i--) if (items[i].trackIndex === at) return i;
  return -1;
}
function partLabel() {
  const p = part();
  const label = phase === 'title' ? '节标题前奏：' + current().chapter :
    phase === 'body' ? (current()?.kind === 'topic' ? '专题正文' : '本幕正文 · ' + current().chapter) :
    ({moment:'补充趣事', box:'补充趣事', person:'人物小传'}[phase] || '附加内容') + '：' + (p?.label || '');
  return gap ? '音频暂缺，提示后接着读 · ' + label : label;
}
function displayTitle() {
  const t = current(), p = part();
  if (!t) return FALLBACK_TITLE;
  const title = String((partIndex < 0 ? t.chapter : p?.kind === 'body' ? t.title : p?.label) || '').trim() || t.title || FALLBACK_TITLE;
  return gap ? title + '（音频暂缺）' : title;
}
// The line above the title: the section being read. While its own title is the prelude, say so instead of repeating it.
function kickerText() {
  const t = current(); if (!t) return '';
  // Reading a whole line, the line and where one is in it say more than the section (老无 2026-11-12).
  if (mode === 'line' && line) { const items = playlistItems(), pos = currentPlaylistIndex(items); return `${line.name}线 · ${Math.max(1, pos + 1)}/${items.length}`; }
  if (partIndex < 0) return '节题';
  return t.kind === 'topic' ? '专题' : String(t.chapter || '').trim();
}
// What natural playback reaches next, mirroring advance(): the next enabled part here, else (on a line) the next
// station, whose section title comes first when it opens a new section. Null at the end of the playlist.
function nextStep() {
  const t = current(); if (!t || finished) return null;
  const parts = queue[at].parts;
  for (let i = partIndex + 1; i < parts.length; i++) if (enabled(parts[i])) return {track:t, partIndex:i, part:parts[i]};
  if (mode !== 'line' || at >= queue.length - 1) return null;
  const n = queue[at + 1];
  if (n.kind === 'history' && n.entryId !== t.entryId && n.titlePart) return {track:n, partIndex:-1, part:n.titlePart};
  return {track:n, partIndex:0, part:n.parts[0] || null};
}
function nextText() {
  const s = nextStep(); if (!s) return '';
  const title = s.partIndex < 0 ? '下一节 · ' + s.track.chapter : !s.part || s.part.kind === 'body' ? s.track.title : s.part.label;
  return String(title || '').trim() + (s.part && !s.part.asset ? '（暂缺）' : '');
}
// Exact remaining listening time from here, mirroring advance(): preludes on entering a section, one notice per run of gaps.
function remainingSeconds() {
  const t = current(); if (!t || finished) return 0;
  const p = part(), whole = p?.asset ? p.asset.duration : gap ? NOTICE?.duration || 0 : 0, span = clipSpan();
  let total = span ? Math.max(0, span.end - span.start - clipPosition()) : whole;
  let ti = at, pi = partIndex, afterGap = gap;
  for (;;) {
    const parts = queue[ti].parts; let next = -1;
    for (let i = pi + 1; i < parts.length; i++) if (enabled(parts[i])) { next = i; break; }
    if (next >= 0) pi = next;
    else if (mode === 'line' && ti < queue.length - 1) { const was = queue[ti].entryId; ti++; pi = queue[ti].kind === 'history' && queue[ti].entryId !== was && queue[ti].titlePart ? -1 : 0; }
    else break;
    const q = pi < 0 ? queue[ti].titlePart : queue[ti].parts[pi];
    if (q?.asset) { afterGap = false; total += q.asset.duration; }
    else if (!afterGap && NOTICE) { afterGap = true; total += NOTICE.duration; }
  }
  return total / speed;
}
// The next clip the player would load, used only to warm the browser cache while this one plays.
function upcomingURL() {
  const t = current(); if (!t || finished) return '';
  let ti = at, pi = partIndex;
  for (let guard = 0; guard < 2000; guard++) {
    const parts = queue[ti].parts; let next = -1;
    for (let i = pi + 1; i < parts.length; i++) if (enabled(parts[i])) { next = i; break; }
    if (next >= 0) pi = next;
    else if (mode === 'line' && ti < queue.length - 1) { const was = queue[ti].entryId; ti++; pi = queue[ti].kind === 'history' && queue[ti].entryId !== was && queue[ti].titlePart ? -1 : 0; }
    else return '';
    const q = pi < 0 ? queue[ti].titlePart : queue[ti].parts[pi];
    if (q?.asset) return q.asset.url;
  }
  return '';
}
const hms = s => { s = Math.max(0, Math.round(s || 0)); return [Math.floor(s / 3600), Math.floor(s % 3600 / 60), s % 60].map(n => String(n).padStart(2, '0')).join(':'); };
function reading() {
  const e = ENTRIES[cur];
  return e ? track(e.id, sceneIndex) : null;
}
function refreshReading() {
  const t = reading(), actions = $('readerAudioActions');
  // No resolved body/plan means no dead action strip; optional gaps still show their readiness message.
  actions.hidden = !t?.planned || !t.parts[0]?.asset;
  if (!t) return;
  const historical = t.kind === 'history', singleMissing = missing([t]);
  const route = historical ? lineSnapshot(window.metroUI?.state().line) : null;
  const count = route ? missing(route.tracks) : 0;
  const onLine = route?.tracks.some(x => x?.key === t.key);
  const gapNote = n => `所选内容有 ${n} 段音频暂缺，读到时提示并接着读`, hasBody = Boolean(t.planned && t.parts[0]?.asset);
  // A strip is only shown for a published body; the controls stay disabled behind a hidden strip.
  $('audioRead').disabled = !hasBody;
  $('audioRead').title = '朗读：' + t.title + (singleMissing ? '（' + gapNote(singleMissing) + '）' : '');
  $('audioRead').setAttribute('aria-label', '朗读：' + t.title);
  $('audioReadLine').hidden = !historical;
  $('audioReadLine').disabled = !hasBody || !onLine;
  $('audioReadLine').title = !route ? '当前线路尚不可用' : `载入${route.line.name}线全部 ${route.tracks.length} 幕，从本幕开始` + (count ? '；' + gapNote(count) : '');
  $('audioAvailability').textContent = singleMissing ? '本幕' + gapNote(singleMissing) : historical && count ? '此线' + gapNote(count) : '';
  // Only reader-button readiness; never mutates the queue, part cursor or transport.
}
// go() notifies after any kind of navigation. Boarding another line at the same shared station
// does not call go(), but does repaint #ridingLine. Coalesce both after metro finishes its work.
let refreshPending = false;
function scheduleRefresh() {
  if (refreshPending) return;
  refreshPending = true;
  queueMicrotask(() => { refreshPending = false; refreshReading(); });
}
document.addEventListener('atlas:navigate', scheduleRefresh);
new MutationObserver(scheduleRefresh).observe($('ridingLine'), {childList:true});
scheduleRefresh();

function renderQueue() {
  const items = playlistItems(), active = currentPlaylistIndex(items);
  $('audioQueueName').textContent = mode === 'line' ? line.name + '线 · 播放列表' : '播放列表';
  const kindTag = {moment:'补充趣事', box:'补充趣事', person:'人物小传'};
  $('audioQueue').innerHTML = items.map((item, i) => {
    const {track:t, part:p, trackIndex:ti, partIndex:pi} = item;
    const isSub = pi > 0, tag = kindTag[p.kind] || '';
    const title = isSub ? `<em class="audio-part-tag">${tag}</em>${esc(p.label)}` : esc(t.title);
    const sub = isSub ? (queue.length > 1 ? `<small>${esc(t.title)}</small>` : '') : (t.kind === 'history' ? `<small>${esc(t.chapter)}</small>` : '');
    const dur = p.asset ? p.asset.duration : null;
    const cls = [isSub ? 'audio-subitem' : '', dur === null ? 'audio-missing' : ''].filter(Boolean).join(' ');
    return `<li${cls ? ` class="${cls}"` : ''}><button type="button" data-audio-item="${i}" data-audio-index="${ti}" data-audio-part="${pi}" data-audio-kind="${esc(p.kind)}" aria-current="${i === active}"><span class="audio-number">${i + 1}</span><span>${title}${sub}</span><time data-seconds="${dur === null ? '' : dur}"${dur === null ? ' title="音频暂缺：读到时提示并接着读"' : ''}>${dur === null ? '暂缺' : time(dur)}</time></button></li>`;
  }).join('');
  const emptyGroups = [];
  if (includeExtras && queue.length && !queue.some(t => t?.parts.some(p => p.group === 'extras'))) emptyGroups.push('补充趣事');
  if (includePeople && queue.length && !queue.some(t => t?.parts.some(p => p.group === 'people'))) emptyGroups.push('人物小传');
  $('audioQueueEmptyNote').hidden = !emptyGroups.length;
  $('audioQueueEmptyNote').textContent = emptyGroups.length ? `当前内容无${emptyGroups.join('、')}` : '';
}
function markQueue(items = playlistItems()) {
  const active = currentPlaylistIndex(items);
  $('audioQueue').querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-current', String(i === active)));
}
function progress() {
  const span = clipSpan();
  const duration = span ? span.end - span.start : (clip()?.duration || (gap ? NOTICE?.duration : 0) || 0);
  const position = span ? clipPosition() : 0;
  const label = partLabel(), fraction = duration ? Math.min(1, position / duration) : 0;
  $('audioElapsed').textContent = time(position);
  $('audioDuration').textContent = time(duration);
  $('audioSeek').value = String(Math.round(fraction * 1000));
  $('audioSeek').style.setProperty('--p', (fraction * 100).toFixed(2) + '%');
  $('audioMiniProgress').style.width = (fraction * 100).toFixed(2) + '%';
  const left = current() ? '-' + hms(remainingSeconds()) : '';
  $('audioRemaining').textContent = left;
  if (current()) {
    const items = playlistItems(), pos = currentPlaylistIndex(items);
    $('audioQueueMeta').textContent = `${Math.max(1, pos + 1)}/${items.length} · 剩余 ${left}`;
  }
  if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession && span && duration > 0) {
    try { navigator.mediaSession.setPositionState({duration, playbackRate:speed, position:Math.min(position, duration)}); } catch {}
  }
  $('audioSeek').disabled = Boolean(error) || gap || !enabled(part()) || !isCurrentSource() || audio.readyState < 1 || !span || duration <= 0;
  $('audioSeek').setAttribute('aria-label', label + '进度');
  $('audioSeek').setAttribute('aria-valuetext', `${label} ${time(position)}，共 ${time(duration)}`);
}
function status() {
  const t = current(); if (!t) return;
  const items = playlistItems(), pos = currentPlaylistIndex(items);
  const state = error ? '已停住' : finished ? '已播完' : wantsPlay ? waiting ? '载入中' : '正在朗读' : '已暂停';
  const gaps = items.filter(x => !x.part.asset).length, total = items.reduce((n, x) => n + (x.part.asset ? x.part.asset.duration : 0), 0);
  $('audioContext').textContent = `${state} · ${mode === 'line' ? line.name + '线' : t.kind === 'topic' ? '专题' : '本幕'} · ${Math.max(1, pos + 1)}/${items.length} · 共 ${time(total)}${gaps ? `（${gaps} 段暂缺）` : ''}`;
  const title = displayTitle();
  $('audioTitle').textContent = title; $('audioMiniTitle').textContent = title;
  const kicker = kickerText(), next = nextText();
  for (const id of ['audioKicker', 'audioMiniKicker']) { $(id).textContent = kicker; $(id).hidden = !kicker; }
  for (const id of ['audioUpNext', 'audioMiniUpNext']) { $(id).innerHTML = next ? '<b>NEXT:</b> ' + esc(next) : ''; $(id).hidden = !next; }
  $('audioTitle').setAttribute('aria-label', '定位朗读正文：' + t.title);
  $('audioPhase').textContent = partLabel();
  $('audioCount').textContent = `${Math.max(1, pos + 1)}/${items.length}`;
  $('audioQueueToggle').setAttribute('aria-label', `播放列表，第 ${Math.max(1, pos + 1)} 项，共 ${items.length} 项`);
  const toggleLabel = wantsPlay ? '暂停' : error ? '重试播放' : finished ? '重新播放当前项' : '继续播放';
  for (const id of ['audioToggle', 'audioMiniToggle']) {
    $(id).innerHTML = wantsPlay ? ICON.pause : ICON.play;
    $(id).setAttribute('aria-label', toggleLabel); $(id).title = toggleLabel;
  }
  $('audioPrevious').disabled = $('audioMiniPrevious').disabled = pos <= 0;
  $('audioNext').disabled = $('audioMiniNext').disabled = pos < 0 || (partIndex >= 0 && pos >= items.length - 1);
  $('audioError').hidden = !error;
  $('audioError').textContent = error;
  markQueue(items);
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = sessionPlaying && !error && !finished ? 'playing' : 'paused';
  progress();
}
function applyRate() {
  audio.defaultPlaybackRate = speed;
  audio.playbackRate = speed;
  audio.preservesPitch = true;
}
function setSpeed(value) {
  if (!rates.includes(value)) return;
  speed = value; applyRate();
  $('audioSpeed').value = String(rates.indexOf(speed));
  $('audioSpeed').setAttribute('aria-valuetext', speed + '倍');
  $('audioSpeedButton').textContent = speed + '×';
  $('audioSpeedButton').setAttribute('aria-label', `语速 ${speed} 倍`);
  document.querySelectorAll('.audio-rates [data-rate]').forEach(b => b.setAttribute('aria-pressed', String(Number(b.dataset.rate) === speed)));
  if (current()) progress();
  try { localStorage.setItem(SPEED_KEY, String(speed)); } catch {}
}
function fail(message, kind = 'media') {
  ++playToken; wantsPlay = false; sessionPlaying = false; waiting = false; error = message; errorKind = kind;
  audio.pause(); status();
}
async function play() {
  const token = ++playToken, generation = loadToken;
  wantsPlay = true; sessionPlaying = true; error = ''; errorKind = ''; applyRate(); status();
  try {
    await audio.play();
    if (token !== playToken || generation !== loadToken) return;
    waiting = false; status();
  } catch (e) {
    if (token !== playToken || generation !== loadToken) return;
    fail(e.name === 'NotAllowedError' ? '浏览器阻止了播放。请按播放键继续；不会跳过本段。' : '播放中断或音频不可用。请按播放键重试；不会跳过本段。');
  }
}
function pause() {
  ++playToken; wantsPlay = false; sessionPlaying = false; audio.pause(); status();
}
function loadClip(index, {autoplay = true, offset = 0, afterGap = false} = {}) {
  ++loadToken; ++playToken; wantsPlay = false; if (!autoplay) sessionPlaying = false; audio.pause();
  partIndex = index; phase = part()?.kind || 'body';
  finished = false; error = ''; errorKind = ''; waiting = true; expectedURL = ''; pendingOffset = offset; gap = false;
  const a = clip();
  if (!a) {
    // No published audio here. Right after a notice (a run of gaps) or without a notice clip, pass on silently.
    if (afterGap || !NOTICE) { advance({autoplay, afterGap:true}); return; }
    gap = true; pendingOffset = null;
  }
  const url = a ? a.url : NOTICE.url;
  updateMetadata();
  if (streamable(url)) {
    pendingOffset = null;
    streamLoad(url, offset);
    applyRate(); status();
    if (autoplay) play();
    return;
  }
  dropStream();
  expectedURL = url;
  // Only this selected part is loaded, also allowing a paused skip to expose its seek range.
  audio.preload = 'metadata';
  audio.src = expectedURL;
  audio.load();
  applyRate(); // load() resets playbackRate in some browsers, even with the same element.
  status();
  if (autoplay) play();
}
// ---- the continuous stream (see STREAMING) ----
// What natural playback reaches after (ti, pi), mirroring advance() and loadClip(): the next enabled part, else the
// next station of a line (its section title first when it opens a new section); a missing part becomes the notice,
// and the rest of a run of missing parts is passed over. Null at the end of the playlist.
function planNext(ti, pi, afterGap) {
  for (let guard = 0; guard < 20000; guard++) {
    const t = queue[ti]; if (!t) return null;
    let next = -1;
    for (let i = pi + 1; i < t.parts.length; i++) if (enabled(t.parts[i])) { next = i; break; }
    if (next >= 0) pi = next;
    else if (mode === 'line' && ti < queue.length - 1) { ti++; pi = queue[ti].kind === 'history' && queue[ti].entryId !== t.entryId ? -1 : 0; }
    else return null;
    const a = (pi < 0 ? queue[ti].titlePart : queue[ti].parts[pi])?.asset;
    if (a) return {ti, pi, gap:false, url:a.url};
    if (afterGap || !NOTICE) { afterGap = true; continue; }
    return {ti, pi, gap:true, url:NOTICE.url};
  }
  return null;
}
async function clipBytes(url, signal) {
  let r = await fetch(url, {credentials:'omit', signal});
  // A failure the HTTP cache kept (a 404 without cache headers is reusable) must not outlive a retry.
  if (!r.ok) r = await fetch(url, {cache:'reload', credentials:'omit', signal});
  if (!r.ok) throw new Error('HTTP ' + r.status);
  return r.arrayBuffer();
}
// SourceBuffer work runs one operation at a time, in order.
function streamTask(s, fn) { const run = s.chain.catch(() => {}).then(fn); s.chain = run.catch(() => {}); return run; }
function sbRun(s, op) {
  return new Promise((resolve, reject) => {
    const off = () => { s.sb.removeEventListener('updateend', done); s.sb.removeEventListener('error', bad); };
    const done = () => { off(); resolve(); }, bad = () => { off(); reject(new Error('SourceBuffer error')); };
    s.sb.addEventListener('updateend', done); s.sb.addEventListener('error', bad);
    try { op(); } catch (e) { off(); reject(e); }
  });
}
async function appendSeg(s, seg, bytes) {
  // Sequence mode: each clip is placed right after the previous one, whatever its own timestamps.
  const start = s.top;
  await sbRun(s, () => s.sb.appendBuffer(bytes));
  const b = s.sb.buffered;
  seg.start = start; seg.end = b.length ? b.end(b.length - 1) : start; s.top = seg.end;
  s.segs.push(seg);
}
function openStream() {
  const ms = new MediaSource(), url = URL.createObjectURL(ms), old = stream;
  const s = {ms, url, sb:null, segs:[], cur:null, top:0, gen:0, ended:false, switching:false, filling:false, fetchAbort:null};
  s.chain = new Promise((resolve, reject) => ms.addEventListener('sourceopen', () => {
    try { s.sb = ms.addSourceBuffer('audio/mpeg'); s.sb.mode = 'sequence'; resolve(); } catch (e) { reject(e); }
  }, {once:true}));
  stream = s;
  audio.preload = 'auto';
  audio.src = url;
  if (old) { old.gen++; old.fetchAbort?.abort(); URL.revokeObjectURL(old.url); }
  return s;
}
function dropStream() {
  const s = stream; if (!s) return;
  stream = null; s.gen++; s.fetchAbort?.abort();
  setTimeout(() => URL.revokeObjectURL(s.url), 0);
}
// A selected clip: the first of a new stream, or a jump inside the current one (same element, same player, so a
// lock-screen skip keeps the session too).
function streamLoad(url, offset) {
  const reuse = stream && audio.currentSrc === stream.url && stream.ms.readyState !== 'closed' && !audio.error;
  const s = reuse ? stream : openStream();
  const gen = ++s.gen, token = loadToken, seg = {ti:at, pi:partIndex, gap, url};
  s.fetchAbort?.abort(); s.fetchAbort = new AbortController();
  s.switching = true; s.cur = null; s.filling = false;
  expectedURL = s.url;
  const bytes = clipBytes(url, s.fetchAbort.signal);
  bytes.catch(() => {});
  streamTask(s, async () => {
    if (s.sb.updating) s.sb.abort();
    if (s.sb.buffered.length) await sbRun(s, () => s.sb.remove(0, Infinity));
    s.sb.timestampOffset = s.top; s.segs = []; s.ended = false;
    const data = await bytes;
    if (gen !== s.gen || token !== loadToken) return;
    await appendSeg(s, seg, data);
  }).then(() => {
    if (gen !== s.gen || token !== loadToken || s !== stream) return;
    s.cur = seg; s.switching = false;
    audio.currentTime = seg.start + Math.min(offset || 0, Math.max(0, seg.end - seg.start - .1));
    status();
    streamFill(s);
  }, () => {
    if (gen !== s.gen || token !== loadToken || s !== stream) return;
    s.switching = false;
    if (gap) advance({afterGap:true});
    else fail(`无法加载${partLabel()}，已停住。请检查网络后按播放键重试；不会跳过本段。`);
  });
}
// Keep up to two clips appended beyond the one playing. At the end of the playlist, or when the next clip cannot be
// streamed (a file: preview) or fetched, the stream is ended: the element then fires ended after the current clip and
// advance() takes over as before.
function streamFill(s) {
  if (s !== stream || s.switching || s.ended || s.filling || !s.cur) return;
  if (s.segs.length - 1 - s.segs.indexOf(s.cur) >= 2) return;
  const last = s.segs[s.segs.length - 1], n = planNext(last.ti, last.pi, last.gap), gen = s.gen;
  const end = () => streamTask(s, () => {
    if (gen === s.gen && s === stream && s.ms.readyState === 'open' && !s.sb.updating) { s.ms.endOfStream(); s.ended = true; }
  });
  if (!n || !streamable(n.url)) { end(); return; }
  s.filling = true;
  clipBytes(n.url, s.fetchAbort?.signal)
    .then(data => streamTask(s, () => gen === s.gen && s === stream ? appendSeg(s, {ti:n.ti, pi:n.pi, gap:n.gap, url:n.url}, data) : null))
    .then(() => { if (gen !== s.gen) return; s.filling = false; status(); streamFill(s); },
          () => { if (gen !== s.gen) return; s.filling = false; end(); });
}
// The playhead has passed the end of the current clip: the next appended one becomes current, as advance() would.
function streamCommit() {
  const s = stream;
  if (!s || s.switching || !s.cur || audio.currentSrc !== s.url) return;
  let moved = false;
  for (;;) {
    const next = s.segs[s.segs.indexOf(s.cur) + 1];
    if (!next || audio.currentTime < s.cur.end - .03) break;
    s.cur = next; moved = true;
  }
  if (!moved) return;
  const c = s.cur;
  at = c.ti; partIndex = c.pi; phase = part()?.kind || 'body'; gap = c.gap; finished = false; error = ''; errorKind = '';
  updateMetadata(); status();
  // Played clips leave the buffer; the playing one and those appended ahead stay.
  const before = s.segs.indexOf(c);
  if (before > 0) {
    s.segs.splice(0, before);
    // remove() reopens an ended MediaSource: end it again, or the element would wait at the end instead of ending.
    if (c.start > .1) streamTask(s, async () => {
      if (s !== stream || s.switching) return;
      await sbRun(s, () => s.sb.remove(0, c.start - .05));
      if (s.ended && s.ms.readyState === 'open' && !s.sb.updating) s.ms.endOfStream();
    }).catch(() => {});
  }
  streamFill(s);
}
// The options changed: what was appended ahead may no longer follow. Drop it and append afresh after the current clip.
function streamRetrim() {
  const s = stream;
  if (!s || s.switching || !s.cur) return;
  streamCommit();
  const cur = s.cur, gen = ++s.gen;
  s.fetchAbort?.abort(); s.fetchAbort = new AbortController(); s.filling = false;
  s.segs.length = s.segs.indexOf(cur) + 1;
  streamTask(s, async () => {
    if (gen !== s.gen) return;
    if (s.sb.updating) s.sb.abort();
    s.segs.length = s.segs.indexOf(cur) + 1;
    await sbRun(s, () => s.sb.remove(cur.end, Infinity));
    s.sb.timestampOffset = cur.end; s.top = cur.end; s.ended = false;
  }).then(() => { if (gen === s.gen) streamFill(s); }, () => {});
}
function updateMetadata() {
  const t = current();
  if (!t || !('mediaSession' in navigator) || !('MediaMetadata' in window)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({title:displayTitle(), artist:t.kind === 'topic' ? '动力专题 · 云健朗读' : t.chapter + ' · 云健朗读',
      album:(mode === 'line' ? line.name + '线 · ' : '') + '简明欧洲史图册'});
  } catch {}
}
// While a clip plays, fetch the next one into the HTTP cache: a phone that sleeps between clips then starts it
// without waiting on the network. Same no-cors credentialed request shape as the audio element, so the entry is reused.
const warmed = new Set();
function warmNext() {
  const url = upcomingURL();
  if (!url || warmed.has(url) || !/^https:/.test(url) || warmed.size > 400) return;
  warmed.add(url);
  try { fetch(url, {mode:'no-cors', credentials:'include', cache:'force-cache'}).catch(() => warmed.delete(url)); } catch { warmed.delete(url); }
}
function selectTrack(index, {automatic = false, autoplay = true, withTitle = true, afterGap = false} = {}) {
  if (index < 0 || index >= queue.length) return;
  const previous = current();
  at = index;
  const t = current(), prelude = withTitle && t.kind === 'history' && (!automatic || previous?.entryId !== t.entryId);
  loadClip(prelude ? -1 : 0, {autoplay, afterGap});
  // Never go(), board(), scroll, or change location here.
}
function selectPlaylistItem(itemIndex, {autoplay = true} = {}) {
  const item = playlistItems()[itemIndex];
  if (!item) return;
  // Explicit skips (buttons, playlist or Media Session) go straight to the selected body.
  if (item.partIndex === 0) { selectTrack(item.trackIndex, {autoplay, withTitle:false}); return; }
  at = item.trackIndex;
  loadClip(item.partIndex, {autoplay});
}
function finishSelection() {
  ++loadToken; ++playToken; wantsPlay = false; sessionPlaying = false; waiting = false; finished = true; error = ''; errorKind = '';
  audio.pause();
  if (!enabled(part())) {
    // A disabled final part may still have metadata/play/error events in flight.
    dropStream(); expectedURL = ''; pendingOffset = null; audio.removeAttribute('src'); audio.load();
  }
  status();
}
function advance({autoplay = wantsPlay, afterGap = false} = {}) {
  const next = current().parts.findIndex((p, i) => i > partIndex && enabled(p));
  if (next >= 0) loadClip(next, {autoplay, afterGap});
  else if (mode === 'line' && at < queue.length - 1) selectTrack(at + 1, {automatic:true, autoplay, afterGap});
  else finishSelection();
}
function changeOptions(ev) {
  if (extrasControls.includes(ev.currentTarget.id)) includeExtras = ev.currentTarget.checked;
  else includePeople = ev.currentTarget.checked;
  syncOptionInputs();
  refreshReading();
  if (!current()) { renderQueue(); return; }
  if (finished) { renderQueue(); status(); return; }
  const autoplay = wantsPlay;
  if (!enabled(part())) { advance({autoplay}); renderQueue(); status(); }
  else { streamRetrim(); renderQueue(); status(); } // Never reload the title/body or rewind already-passed groups.
}
function start(continuous) {
  const t = reading(); if (!t) return;
  const route = continuous && t.kind === 'history' ? lineSnapshot(window.metroUI?.state().line) : null;
  const tracks = route ? route.tracks : [t], index = tracks.findIndex(x => x?.key === t.key);
  if ((continuous && !route) || index < 0) { refreshReading(); return; }
  queue = Object.freeze([...tracks]); mode = route ? 'line' : 'single'; line = route?.line || null;
  if (player.hidden) setExpanded(false); // A phone starts with the strip; the card opens on request.
  player.hidden = false; measurePlayer();
  renderQueue();
  selectTrack(index);
}
function resume() {
  if (!current()) return;
  if (finished) { selectTrack(at); return; }
  if (error || audio.error || !expectedURL) loadClip(partIndex, {offset:audio.error || !expectedURL ? 0 : clipPosition()});
  else play();
}
function syncScrim() {
  // Only the two bottom sheets dim the page; the open card leaves the text above it readable and usable.
  const open = phoneLayout() && (!$('audioQueuePanel').hidden || !$('audioSpeedPanel').hidden);
  $('audioScrim').hidden = !open;
}
function setExpanded(open) {
  player.classList.toggle('audio-expanded', open);
  $('audioExpand').setAttribute('aria-expanded', String(open));
  syncScrim(); measurePlayer();
}
function setSpeedOpen(open, {focus = false} = {}) {
  if (open && phoneLayout() && !$('audioQueuePanel').hidden) setQueueOpen(false); // one bottom sheet at a time
  $('audioSpeedPanel').hidden = !open;
  $('audioSpeedButton').setAttribute('aria-expanded', String(open));
  if (focus) $('audioSpeedButton').focus({preventScroll:true});
  syncScrim();
}
function setQueueOpen(open, {focus = false} = {}) {
  if (open && phoneLayout() && !$('audioSpeedPanel').hidden) setSpeedOpen(false);
  $('audioQueuePanel').hidden = !open;
  $('audioQueueToggle').setAttribute('aria-expanded', String(open));
  syncScrim();
  if (open) $('audioQueue').querySelector('[aria-current="true"]')?.scrollIntoView({block:'nearest'});
  if (focus) $('audioQueueToggle').focus({preventScroll:true});
}
function seek(fraction) {
  if ($('audioSeek').disabled) return;
  const span = clipSpan(); if (!span) return;
  finished = false;
  audio.currentTime = span.start + (span.end - span.start) * Math.max(0, Math.min(1, fraction));
  progress(); status();
}
$('audioRead').onclick = () => start(false);
$('audioReadLine').onclick = () => start(true);
$('audioPrevious').onclick = $('audioMiniPrevious').onclick = () => selectPlaylistItem(currentPlaylistIndex() - 1);
// While the section title plays, the scene's own body has not started: 下一项 goes to it, as NEXT says.
const forwardIndex = () => currentPlaylistIndex() + (partIndex < 0 ? 0 : 1);
$('audioNext').onclick = $('audioMiniNext').onclick = () => selectPlaylistItem(forwardIndex());
$('audioToggle').onclick = $('audioMiniToggle').onclick = () => wantsPlay ? pause() : resume();
$('audioQueueToggle').onclick = () => setQueueOpen($('audioQueuePanel').hidden);
$('audioSpeedButton').onclick = () => setSpeedOpen($('audioSpeedPanel').hidden);
$('audioSpeedClose').onclick = () => setSpeedOpen(false, {focus:true});
// Like any popover, the speed panel closes when one presses anywhere outside it (focus stays where it lands).
document.addEventListener('pointerdown', ev => {
  if (!$('audioSpeedPanel').hidden && !ev.target.closest?.('#audioSpeedPanel,#audioSpeedButton')) setSpeedOpen(false);
}, true);
document.querySelectorAll('.audio-rates [data-rate]').forEach(b => b.onclick = () => setSpeed(Number(b.dataset.rate)));
$('audioExpand').onclick = () => setExpanded(true);
// The open card is not modal: a tap anywhere outside the player folds it back, and that tap still does its own job.
// Dialogs and the genealogy sheet sit above it and keep their own taps.
document.addEventListener('click', ev => {
  if (!player.classList.contains('audio-expanded') || !phoneLayout()) return;
  if (ev.target.closest?.('#audioPlayer,dialog,#kinSheet')) return;
  setExpanded(false);
}, true);
$('audioCollapse').onclick = () => { setExpanded(false); $('audioExpand').focus({preventScroll:true}); };
$('audioScrim').onclick = () => { if (!$('audioSpeedPanel').hidden) setSpeedOpen(false); else setQueueOpen(false); };
$('audioQueueClose').onclick = () => setQueueOpen(false, {focus:true});
$('audioQueue').onclick = ev => { const b = ev.target.closest('[data-audio-item]'); if (b) selectPlaylistItem(Number(b.dataset.audioItem)); };
$('audioTitle').onclick = () => {
  const t = current(); if (!t) return;
  setQueueOpen(false);
  go(t.kind === 'history' ? t.key : t.entryId);
  if (t.kind === 'topic') readerBody.scrollTo({top:0, behavior:'instant'});
};
$('audioSpeed').oninput = ev => setSpeed(rates[Number(ev.target.value)]);
$('audioSeek').oninput = ev => seek(Number(ev.target.value) / 1000);
for (const id of [...extrasControls, ...peopleControls]) {
  $(id).checked = false;
  $(id).onchange = changeOptions;
}
for (const id of ['audioSpeed', 'audioSeek', ...extrasControls, ...peopleControls]) $(id).addEventListener('keydown', ev => {
  // Navigation gets the capture phase first. If it has no action (or a modal owns the page),
  // arrows still must not change sound. Keep native PageUp/PageDown/Home/End and pointer input.
  if (!ev.defaultPrevented && !ev.isComposing && !ev.altKey && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey &&
      ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(ev.key)) ev.preventDefault();
});
window.addEventListener('keydown', ev => {
  if (ev.defaultPrevented || ev.isComposing || ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
  if (ev.key !== 'Escape' || !ev.target.closest?.('#audioPlayer') || document.querySelector('dialog[open],#kinSheet:not([hidden])')) return;
  // The panel holding focus closes first; otherwise the open playlist. Elsewhere Escape keeps its own meaning.
  if (!$('audioSpeedPanel').hidden && (ev.target.closest('#audioSpeedPanel') || $('audioQueuePanel').hidden)) {
    ev.preventDefault(); ev.stopImmediatePropagation(); setSpeedOpen(false, {focus:true});
  } else if (!$('audioQueuePanel').hidden) {
    ev.preventDefault(); ev.stopImmediatePropagation(); setQueueOpen(false, {focus:true});
  }
}, true);
audio.addEventListener('loadedmetadata', () => {
  if (!isCurrentSource()) return;
  applyRate();
  if (pendingOffset !== null) { audio.currentTime = Math.min(pendingOffset, Number.isFinite(audio.duration) ? audio.duration : pendingOffset); pendingOffset = null; }
  status();
});
audio.addEventListener('playing', () => { if (isCurrentSource()) { waiting = false; status(); if (!stream) warmNext(); } });
audio.addEventListener('waiting', () => { if (isCurrentSource()) { waiting = true; status(); } });
for (const event of ['pause', 'durationchange']) audio.addEventListener(event, status);
audio.addEventListener('timeupdate', () => { streamCommit(); progress(); });
audio.addEventListener('error', () => {
  if (finished || !isCurrentSource() || !audio.error) return;
  dropStream(); // A failed stream is not reused; the next load starts afresh.
  // A published recording that fails to load is a network/server fault: stop and offer a retry.
  // The inline notice itself cannot be missing; should a browser still refuse it, carry on reading.
  if (gap) advance({afterGap:true});
  else if (enabled(part())) fail(`无法加载${partLabel()}，已停住。请检查网络后按播放键重试；不会跳过本段。`);
});
audio.addEventListener('ended', () => {
  if (!isCurrentSource() || !audio.ended || !wantsPlay || error || stream?.switching) return;
  streamCommit(); // A stream only ends after its last clip, or when it cannot go on: advance() takes over from there.
  advance({afterGap:gap});
});
// Desktop: the bar sits at the bottom and the page reserves its height there (老无 2026-11-12). Phone: the strip's own
// height is reserved in CSS; the open card overlays.
function measurePlayer() { document.documentElement.style.setProperty('--audio-bottom', player.hidden || phoneLayout() ? '0px' : player.offsetHeight + 'px'); }
new ResizeObserver(measurePlayer).observe(player);
matchMedia('(max-width:820px)').addEventListener('change', () => { syncScrim(); measurePlayer(); });
setSpeed(speed);
if ('mediaSession' in navigator) {
  for (const [action, handler] of Object.entries({play:resume, pause, previoustrack:() => selectPlaylistItem(currentPlaylistIndex() - 1), nexttrack:() => selectPlaylistItem(forwardIndex()), seekto:details => { const span = clipSpan(); if (span) seek(details.seekTime / (span.end - span.start)); }})) {
    try { navigator.mediaSession.setActionHandler(action, handler); } catch {} // Optional browser/OS support.
  }
}
// Read-only diagnostics; the live queue, manifest and navigation are never exposed for mutation.
window.atlasAudio = Object.freeze({state:() => ({queue:queue.map(t => t.key), playlist:playlistItems().map(x => x.part.id), index:at, mode, line:line?.id || null, phase, gap,
  partId:part()?.id || '', partIndex, partLabel:part()?.label || '', includeExtras, includePeople, selectedDuration:selectedDuration(current()),
  title:current()?.title || '', playing:wantsPlay && !audio.paused && !audio.ended, wantsPlay, finished, speed,
  src:audio.currentSrc, currentTime:audio.currentTime, error, engine:stream ? 'stream' : 'element', streaming:STREAMING,
  clip:(span => span ? {start:span.start, end:span.end} : null)(clipSpan()), ahead:stream?.cur ? stream.segs.length - 1 - stream.segs.indexOf(stream.cur) : 0, streamEnded:Boolean(stream?.ended), frozen:Object.isFrozen(queue) && queue.every(t => Object.isFrozen(t) && Object.isFrozen(t.parts) && t.parts.every(Object.isFrozen))})});
})();
