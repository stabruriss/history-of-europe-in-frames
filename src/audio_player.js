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
let queue = Object.freeze([]), at = -1, mode = 'single', line = null;
let phase = 'body', partIndex = 0, finished = false, error = '', errorKind = '', speed = 1;
let includeExtras = false, includePeople = false;
let loadToken = 0, playToken = 0, wantsPlay = false, waiting = false, expectedURL = '', pendingOffset = null;
try { const saved = Number(localStorage.getItem(SPEED_KEY)); if (rates.includes(saved)) speed = saved; } catch {}
const current = () => queue[at];
// -1 is the separate title prelude; nonnegative positions follow the frozen canonical part order.
const part = () => partIndex < 0 ? current()?.titlePart : current()?.parts[partIndex];
const clip = () => part()?.asset;
const enabled = p => p?.group === 'extras' ? includeExtras : p?.group === 'people' ? includePeople : true;
const isCurrentSource = () => Boolean(expectedURL) && audio.currentSrc === expectedURL;

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
const missing = tracks => countMissing(tracks.flatMap(requiredParts));
function remainingMissing() {
  const t = current();
  if (!t || finished) return 0;
  if (!t.planned) return 1;
  // Passed parts (including an earlier, unselected group) stay passed when a checkbox changes.
  return countMissing([...(partIndex < 0 && t.titlePart ? [t.titlePart] : []),
    ...t.parts.slice(Math.max(0, partIndex)).filter(enabled), ...queue.slice(at + 1).flatMap(requiredParts)]);
}
function selectedDuration(t) {
  if (!t?.planned) return null;
  const selected = t.parts.filter(enabled);
  return selected.some(p => !p.asset) ? null : selected.reduce((total, p) => total + p.asset.duration, 0);
}
function partLabel() {
  const p = part();
  if (phase === 'title') return '节标题前奏：' + current().chapter;
  if (phase === 'body') return current()?.kind === 'topic' ? '专题正文' : '本幕正文';
  return ({moment:'补充趣事 · 名场面', box:'补充趣事 · 豆腐块', person:'人物小传'}[phase] || '独立片段') + '：' + (p?.label || '');
}
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
  $('audioRead').disabled = Boolean(singleMissing);
  $('audioRead').title = singleMissing ? '本幕／专题的所选内容或节标题尚未齐全；不会跳过缺段' : '朗读：' + t.title;
  $('audioRead').setAttribute('aria-label', '朗读：' + t.title);
  $('audioReadLine').hidden = !historical;
  $('audioReadLine').disabled = !onLine || count > 0;
  $('audioReadLine').title = !route ? '当前线路尚不可用' : count ? `${route.line.name}线所选内容缺 ${count} 段音频（含节标题），不跳过缺段` : `载入${route.line.name}线全部 ${route.tracks.length} 幕，从本幕开始`;
  $('audioAvailability').textContent = singleMissing ? '所选内容待补齐' : historical && count ? '此线所选未齐 · 可单幕读' : historical && onLine ? `${route.line.name}线 · ${route.tracks.length} 幕所选齐全` : '专题正文及所选部分 · 云健';
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
  $('audioCount').textContent = String(queue.length);
  $('audioQueueName').textContent = mode === 'line' ? line.name + '线 · 完整队列' : queue[0]?.kind === 'topic' ? '专题朗读' : '单幕朗读';
  $('audioQueueNote').textContent = '到尾停止，不循环；队列保留，可选曲重播。所选时长含正文及勾选的独立片段；节标题另作前奏，不计入此时长。';
  $('audioQueue').innerHTML = queue.map((t, i) => `<li><button type="button" data-audio-index="${i}" aria-current="${i === at}"><span class="audio-number">${i + 1}</span><span>${esc(t.title)}${t.kind === 'history' ? `<small>${esc(t.chapter)}</small>` : ''}</span><time></time></button></li>`).join('');
  updateQueueDurations();
}
function updateQueueDurations() {
  $('audioQueue').querySelectorAll('time').forEach((el, i) => {
    const duration = selectedDuration(queue[i]);
    el.textContent = duration === null ? '待补' : time(duration);
    el.dataset.seconds = duration === null ? '' : String(duration);
    el.title = duration === null ? '所选内容缺音频，不会跳过' : '所选时长（不含节标题前奏）';
  });
}
function markQueue() {
  for (const b of $('audioQueue').querySelectorAll('button')) b.setAttribute('aria-current', String(Number(b.dataset.audioIndex) === at));
}
function progress() {
  const duration = isCurrentSource() && Number.isFinite(audio.duration) ? audio.duration : (clip()?.duration || 0);
  const position = isCurrentSource() ? audio.currentTime : 0;
  const label = partLabel();
  $('audioElapsed').textContent = time(position);
  $('audioDuration').textContent = time(duration);
  $('audioSeek').value = String(duration ? Math.round(position / duration * 1000) : 0);
  $('audioSeek').disabled = Boolean(error) || !enabled(part()) || !isCurrentSource() || audio.readyState < 1 || !Number.isFinite(audio.duration) || audio.duration <= 0;
  $('audioSeek').setAttribute('aria-label', label + '进度');
  $('audioSeek').setAttribute('aria-valuetext', `${label} ${time(position)}，共 ${time(duration)}`);
}
function status() {
  const t = current(); if (!t) return;
  const playing = wantsPlay && !audio.paused && !audio.ended;
  const state = error ? '已停住' : finished ? '已播完' : wantsPlay ? waiting ? '载入中' : '正在朗读' : '已暂停';
  const duration = selectedDuration(t);
  $('audioContext').textContent = `${state} · ${mode === 'line' ? line.name + '线' : t.kind === 'topic' ? '专题' : '单幕'} · ${at + 1}/${queue.length} · ${duration === null ? '所选待补齐' : '所选 ' + time(duration)}`;
  $('audioContext').title = '所选时长含正文及勾选的片段，不含节标题前奏';
  $('audioTitle').textContent = t.title;
  $('audioTitle').setAttribute('aria-label', '定位朗读正文：' + t.title);
  $('audioPhase').textContent = finished && !enabled(part()) ? '所选内容已结束 · 未选部分不播放' : partLabel() + (phase === 'title' ? ' · 播完接正文' : ' · 进度仅计本段');
  $('audioPhase').title = $('audioPhase').textContent;
  $('audioToggle').textContent = wantsPlay ? 'Ⅱ' : '▶';
  $('audioToggle').setAttribute('aria-label', wantsPlay ? '暂停' : error ? '重试播放' : finished ? '重新播放当前项' : '继续播放');
  $('audioToggle').title = $('audioToggle').getAttribute('aria-label');
  $('audioPrevious').disabled = at <= 0;
  $('audioNext').disabled = at >= queue.length - 1;
  $('audioError').hidden = !error;
  $('audioError').textContent = error;
  if ('mediaSession' in navigator) navigator.mediaSession.playbackState = playing ? 'playing' : 'paused';
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
  $('audioSpeedValue').textContent = speed + '×';
  $('audioSpeed').setAttribute('aria-valuetext', speed + '倍');
  try { localStorage.setItem(SPEED_KEY, String(speed)); } catch {}
}
function fail(message, kind = 'media') {
  ++playToken; wantsPlay = false; waiting = false; error = message; errorKind = kind;
  audio.pause(); status();
}
function failMissing(count) {
  fail(`队列余下所选内容缺 ${count} 段音频，已停住。可取消对应选项后继续；不会跳过缺段。`, 'availability');
}
async function play() {
  const count = remainingMissing(); if (count) { failMissing(count); return; }
  const token = ++playToken, generation = loadToken;
  wantsPlay = true; error = ''; errorKind = ''; applyRate(); status();
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
  ++playToken; wantsPlay = false; audio.pause(); status();
}
function loadClip(index, {autoplay = true, offset = 0} = {}) {
  ++loadToken; ++playToken; wantsPlay = false; audio.pause();
  partIndex = index; phase = part()?.kind || 'body';
  finished = false; error = ''; errorKind = ''; waiting = true; expectedURL = ''; pendingOffset = offset;
  const a = clip(), count = remainingMissing();
  if (!a || count) {
    audio.removeAttribute('src'); audio.load();
    failMissing(count || 1); return;
  }
  expectedURL = a.url;
  // Only this selected part is loaded, also allowing a paused skip to expose its seek range.
  audio.preload = 'metadata';
  audio.src = expectedURL;
  audio.load();
  applyRate(); // load() resets playbackRate in some browsers, even with the same element.
  status();
  if (autoplay) play();
}
function selectTrack(index, {automatic = false, autoplay = true} = {}) {
  if (index < 0 || index >= queue.length) return;
  const previous = current();
  at = index;
  const t = current(), prelude = t.kind === 'history' && (!automatic || previous?.entryId !== t.entryId);
  markQueue();
  if ('mediaSession' in navigator && 'MediaMetadata' in window) {
    navigator.mediaSession.metadata = new MediaMetadata({title:t.title, artist:'云健 · AI 合成语音', album:mode === 'line' ? line.name + '线 · 简明欧洲史图册' : '简明欧洲史图册'});
  }
  loadClip(prelude ? -1 : 0, {autoplay});
  // Never go(), board(), scroll, or change location here.
}
function finishSelection() {
  ++loadToken; ++playToken; wantsPlay = false; waiting = false; finished = true; error = ''; errorKind = '';
  audio.pause();
  if (!enabled(part())) {
    // A disabled final part may still have metadata/play/error events in flight.
    expectedURL = ''; pendingOffset = null; audio.removeAttribute('src'); audio.load();
  }
  status();
}
function advance({autoplay = wantsPlay} = {}) {
  const next = current().parts.findIndex((p, i) => i > partIndex && enabled(p));
  if (next >= 0) loadClip(next, {autoplay});
  else if (mode === 'line' && at < queue.length - 1) selectTrack(at + 1, {automatic:true, autoplay});
  else finishSelection();
}
function changeOptions() {
  includeExtras = $('audioIncludeExtras').checked; includePeople = $('audioIncludePeople').checked;
  refreshReading(); updateQueueDurations();
  if (!current() || finished) { status(); return; }
  const autoplay = wantsPlay, count = remainingMissing();
  if (count) { failMissing(count); return; }
  if (errorKind === 'availability') { error = ''; errorKind = ''; }
  if (!enabled(part())) advance({autoplay});
  else status(); // Never reload the title/body or rewind already-passed groups.
}
function start(continuous) {
  const t = reading(); if (!t) return;
  const route = continuous && t.kind === 'history' ? lineSnapshot(window.metroUI?.state().line) : null;
  const tracks = route ? route.tracks : [t], index = tracks.findIndex(x => x?.key === t.key);
  if ((continuous && !route) || index < 0 || missing(tracks)) { refreshReading(); return; }
  queue = Object.freeze([...tracks]); mode = route ? 'line' : 'single'; line = route?.line || null;
  player.hidden = false; measurePlayer();
  renderQueue();
  selectTrack(index);
}
function resume() {
  if (!current()) return;
  if (finished) { selectTrack(at); return; }
  const count = remainingMissing(); if (count) { failMissing(count); return; }
  if (errorKind === 'availability') { error = ''; errorKind = ''; }
  if (error || audio.error || !expectedURL) loadClip(partIndex, {offset:audio.error || !expectedURL ? 0 : audio.currentTime});
  else play();
}
function setQueueOpen(open, {focus = false} = {}) {
  $('audioQueuePanel').hidden = !open;
  $('audioQueueToggle').setAttribute('aria-expanded', String(open));
  if (open) $('audioQueue').querySelector('[aria-current="true"]')?.scrollIntoView({block:'nearest'});
  if (focus) $('audioQueueToggle').focus({preventScroll:true});
}
function seek(fraction) {
  if ($('audioSeek').disabled) return;
  finished = false;
  audio.currentTime = Math.max(0, Math.min(audio.duration, audio.duration * fraction));
  progress(); status();
}
$('audioRead').onclick = () => start(false);
$('audioReadLine').onclick = () => start(true);
$('audioPrevious').onclick = () => selectTrack(at - 1);
$('audioNext').onclick = () => selectTrack(at + 1);
$('audioToggle').onclick = () => wantsPlay ? pause() : resume();
$('audioQueueToggle').onclick = () => setQueueOpen($('audioQueuePanel').hidden);
$('audioQueueClose').onclick = () => setQueueOpen(false, {focus:true});
$('audioQueue').onclick = ev => { const b = ev.target.closest('[data-audio-index]'); if (b) selectTrack(Number(b.dataset.audioIndex)); };
$('audioTitle').onclick = () => {
  const t = current(); if (!t) return;
  setQueueOpen(false);
  go(t.kind === 'history' ? t.key : t.entryId);
  if (t.kind === 'topic') readerBody.scrollTo({top:0, behavior:'instant'});
};
$('audioSpeed').oninput = ev => setSpeed(rates[Number(ev.target.value)]);
$('audioSeek').oninput = ev => seek(Number(ev.target.value) / 1000);
for (const id of ['audioIncludeExtras', 'audioIncludePeople']) {
  $(id).checked = false;
  $(id).onchange = changeOptions;
}
for (const id of ['audioSpeed', 'audioSeek', 'audioIncludeExtras', 'audioIncludePeople']) $(id).addEventListener('keydown', ev => {
  // Navigation gets the capture phase first. If it has no action (or a modal owns the page),
  // arrows still must not change sound. Keep native PageUp/PageDown/Home/End and pointer input.
  if (!ev.defaultPrevented && !ev.isComposing && !ev.altKey && !ev.ctrlKey && !ev.metaKey && !ev.shiftKey &&
      ['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(ev.key)) ev.preventDefault();
});
window.addEventListener('keydown', ev => {
  if (ev.defaultPrevented || ev.isComposing || ev.altKey || ev.ctrlKey || ev.metaKey || ev.shiftKey) return;
  if (ev.key === 'Escape' && !$('audioQueuePanel').hidden && ev.target.closest?.('#audioPlayer') &&
      !document.querySelector('dialog[open],#kinSheet:not([hidden])')) {
    ev.preventDefault(); ev.stopImmediatePropagation(); setQueueOpen(false, {focus:true});
  }
}, true);
audio.addEventListener('loadedmetadata', () => {
  if (!isCurrentSource()) return;
  applyRate();
  if (pendingOffset !== null) { audio.currentTime = Math.min(pendingOffset, Number.isFinite(audio.duration) ? audio.duration : pendingOffset); pendingOffset = null; }
  status();
});
audio.addEventListener('playing', () => { if (isCurrentSource()) { waiting = false; status(); } });
audio.addEventListener('waiting', () => { if (isCurrentSource()) { waiting = true; status(); } });
for (const event of ['pause', 'durationchange']) audio.addEventListener(event, status);
audio.addEventListener('timeupdate', progress);
audio.addEventListener('error', () => {
  if (!finished && enabled(part()) && isCurrentSource() && audio.error) fail(`无法加载${partLabel()}，已停住。请检查网络后按播放键重试；不会跳过本段。`);
});
audio.addEventListener('ended', () => {
  if (!isCurrentSource() || !audio.ended || !wantsPlay || error) return;
  advance();
});
function measurePlayer() { document.documentElement.style.setProperty('--audio-height', player.hidden ? '0px' : player.offsetHeight + 'px'); }
new ResizeObserver(measurePlayer).observe(player);
setSpeed(speed);
if ('mediaSession' in navigator) {
  for (const [action, handler] of Object.entries({play:resume, pause, previoustrack:() => selectTrack(at - 1), nexttrack:() => selectTrack(at + 1), seekto:details => { if (Number.isFinite(audio.duration)) seek(details.seekTime / audio.duration); }})) {
    try { navigator.mediaSession.setActionHandler(action, handler); } catch {} // Optional browser/OS support.
  }
}
// Read-only diagnostics; the live queue, manifest and navigation are never exposed for mutation.
window.atlasAudio = Object.freeze({state:() => ({queue:queue.map(t => t.key), index:at, mode, line:line?.id || null, phase,
  partId:part()?.id || '', partIndex, partLabel:part()?.label || '', includeExtras, includePeople, selectedDuration:selectedDuration(current()),
  title:current()?.title || '', playing:wantsPlay && !audio.paused && !audio.ended, wantsPlay, finished, speed,
  src:audio.currentSrc, currentTime:audio.currentTime, error, frozen:Object.isFrozen(queue) && queue.every(t => Object.isFrozen(t) && Object.isFrozen(t.parts) && t.parts.every(Object.isFrozen))})});
})();
