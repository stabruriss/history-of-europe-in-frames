'use strict';
// Trusted local atlas sources only. No browser, requests, map drawing or source writes.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {createHash} = require('node:crypto');
const {execFileSync} = require('node:child_process');
const root = path.resolve(process.argv[2] || path.join(__dirname, '../..'));
const names = ['history_entries.js', 'history_content.json', 'historical_figures.js'];
const sources = Object.fromEntries(names.map(n => [n, fs.readFileSync(path.join(root, 'src', n), 'utf8')]));
const hash = s => createHash('sha256').update(s).digest('hex');
if (sources['history_entries.js'].split('/*__HISTORY_CONTENT__*/').length !== 2) throw Error('Expected one HISTORY_CONTENT placeholder');
const ctx = vm.createContext({COL: new Proxy({}, {get: () => ''})});
vm.runInContext(sources['history_entries.js'].replace('/*__HISTORY_CONTENT__*/', () => sources['history_content.json']) +
  ';globalThis.book={history:HISTORY_ENTRIES,topics:TOPIC_ENTRIES,eras:HISTORY_ERAS,rows:TREE_ROWS,branches:HISTORY_BRANCHES};', ctx, {timeout:10000});
vm.runInContext(sources['historical_figures.js'] + ';globalThis.people={figures:FIGURES,cards:FIGURE_SCENES};', ctx, {timeout:10000});
const b = ctx.book, p = ctx.people;
const entries = [...b.history, ...b.topics].map(e => ({
  id:e.id, kind:b.history.includes(e)?'history':'topic', title:e.title, en:e.en, period:e.period,
  html:e.html, sources:e.sources || [], moments:e.moments || [], boxes:e.boxes || [],
  scenes:e.scenes.map((s,i) => ({title:s.title,date:s.date,people:(p.cards[e.id+'/'+i] || []).map(c => {
    const f = p.figures[c.id];
    if (!f) throw Error('Missing figure ' + c.id + ' at ' + e.id + '/' + i);
    return {id:c.id, when:c.when, name:f.name, en:f.en, life:f.life, event:c.event,
      relation:f.relation, note:c.note, bio:f.bio, sources:f.sources || []};
  })}))
}));
// Same membership/range and ordering as metro_ui.js's lineStops, not ancestor lines.
const stations = b.eras.flatMap(era => era.items.map(([id,from=0,to]) => {
  const e = entries.find(e => e.id === id), spec = b.rows[id+'/'+from];
  if (!e || !spec) throw Error('Missing station ' + id + '/' + from);
  return {id,from,to:to??e.scenes.length-1,lines:[].concat(spec[0]),t:spec[1]};
}));
const routes = b.branches.map(line => ({id:line.id,name:line.name,scenes:stations
  .map((s,order) => ({...s,order})).filter(s => s.lines.includes(line.id))
  .sort((a,b) => a.t-b.t || a.order-b.order).flatMap(s => {
    const e = entries.find(e => e.id === s.id);
    if (!Number.isInteger(s.from) || !Number.isInteger(s.to) || s.from<0 || s.to<s.from || s.to>=e.scenes.length) throw Error('Bad station range: ' + s.id);
    return Array.from({length:s.to-s.from+1},(_,i) => s.id+'/'+(s.from+i));
  })}));
let commit = null, dirty = [];
try {
  commit = execFileSync('git',['-C',root,'rev-parse','HEAD'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();
  dirty = execFileSync('git',['--no-optional-locks','-C',root,'status','--porcelain','--',...names.map(n=>'src/'+n)],{encoding:'utf8'}).trim().split('\n').filter(Boolean);
} catch {} // Fixtures need not be Git repositories; file hashes are always authoritative.
// Detect concurrent source edits; a snapshot must never silently mix revisions.
for (const name of names) if (fs.readFileSync(path.join(root,'src',name),'utf8') !== sources[name]) throw Error('Source changed during extraction: '+name);
process.stdout.write(JSON.stringify({schema:1,source:{commit,dirty,files:Object.fromEntries(names.map(n=>['src/'+n,hash(sources[n])]))},entries,routes})+'\n');
