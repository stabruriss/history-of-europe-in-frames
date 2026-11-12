// After editing the text: checks only the scenes that changed, on the page as readers see it, and gives a link to open the first of them.
// The whole book is also scanned for broken references, without drawing anything. Before publishing, run the full set: python3 tests/run_tests.py
// Usage: node tests/check_changed.js [index.html] [--since <git-ref>] [--all] [--shots] [--pending]
//   Compares with the last check that passed (tests/.check_baseline.json), or with origin/main if there is none.
//   --all checks every scene. --shots also photographs the changed scenes, for an agent that needs to look: people check the real page.
//   --pending leaves the new baseline for run_tests.py to confirm once the suites it picked have passed too.
// Writes tests/shots-changed/, emptied on each run: changed.json, and any photographs.
require('./chrome_guard.cjs');
const puppeteer=require('puppeteer-core'),path=require('node:path'),fs=require('node:fs'),crypto=require('node:crypto');
const {pathToFileURL}=require('node:url'),{execFileSync}=require('node:child_process');
const argv=process.argv.slice(2),flag=name=>argv.includes(name);
const since=argv.includes('--since')?argv[argv.indexOf('--since')+1]:null;
const html=path.resolve(argv.find(a=>a.endsWith('.html'))||path.join(__dirname,'..','index.html'));
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'shots-changed'),BASELINE=path.join(__dirname,'.check_baseline.json');
const VIEWS=[['desktop',1440,960,false],['phone',390,844,true]];
// The page's own code, as against its content: when this changes, a change anywhere can show up everywhere.
const ENGINE=['src/template.html','src/assemble.py','src/atlas_ui.js','src/layout.css','src/metro_ui.js','src/metro.css','src/metro_layout.js','src/metro_design.js','src/audio_player.js','src/audio_player.css','src/audio_gap_notice.json'];
const git=(...a)=>execFileSync('git',['-C',root,...a],{maxBuffer:64*1024*1024});
const sha=parts=>{const h=crypto.createHash('sha256');for(const p of parts)h.update(p);return h.digest('hex').slice(0,16)};
const engineNow=()=>sha(ENGINE.map(f=>fs.readFileSync(path.join(root,f))));
const engineAt=ref=>{
 const present=new Set(git('ls-tree','-r','--name-only',ref,'--',...ENGINE).toString().trim().split('\n'));
 // New modules did not exist in older baselines; that is a code change, not an invalid Git ref.
 return sha(ENGINE.map(f=>present.has(f)?git('show',`${ref}:${f}`):`absent:${f}`));
};

// Runs in the page: a fingerprint of each scene's own content, so that one changed scene does not count as its whole section.
function fingerprint(){
 const hash=s=>{let h=0x811c9dc5;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return (h>>>0).toString(36)+'.'+s.length.toString(36);};
 const text=x=>JSON.stringify(x,(k,v)=>typeof v==='function'?String(v):v);
 const scenes={},sections={},maps={},places={};
 // Where each section stands on its lines: moving a station changes the order that some suites pin, without changing a word.
 const rows=typeof TREE_ROWS==='undefined'?{}:TREE_ROWS;
 for(const e of ENTRIES){
  const box=document.createElement('template');box.innerHTML=e.html||'';
  const own=new Map([...box.content.querySelectorAll('[data-scene-text]')].map(p=>[+p.dataset.sceneText,p.outerHTML]));
  if(e.scenes){
   e.scenes.forEach((s,i)=>{
    const key=e.id+'/'+i,people=(FIGURE_SCENES[key]||[]).map(item=>[item,FIGURES[item.id]]);
    scenes[key]=hash(text([s,own.get(i),e.moments.filter(m=>m.scene===i),e.boxes.filter(b=>b.scene===i),people]));
    maps[key]=hash(text([s.draw,s.view,s.legend]));
   });
   sections[e.id]=hash(text([e.title,e.en,e.period,e.ch,e.sources]));
   places[e.id]=hash(text(Object.entries(rows).filter(([k])=>k.startsWith(e.id+'/'))));
  }else{
   scenes[e.id+'/0']=hash(text(e));sections[e.id]=hash(e.title||e.id);
  }
 }
 // Which stations each line has, and how the lines themselves are defined: parents, spans, how each one ends.
 const lines=[metroUI.data.lines.map(l=>[l.id,metroUI.data.lineStops.get(l.id).map(s=>s.key)]),
  typeof HISTORY_BRANCHES==='undefined'?null:HISTORY_BRANCHES,typeof TREE_ENDS==='undefined'?null:TREE_ENDS];
 return {scenes,sections,maps,places,lines:hash(JSON.stringify(lines))};
}

// Runs in the page: references across the whole book. Nothing is drawn, so this takes moments.
function scanBook(){
 const problems=[],note=(where,what)=>problems.push(where+': '+what);
 // Stands in for anything a scene's draw function asks the map for.
 const any=new Proxy(function(){},{get:(_,k)=>k===Symbol.toPrimitive?()=>0:k===Symbol.iterator?function*(){}:any,apply:()=>any,construct:()=>any});
 let scenes=0;
 for(const e of ENTRIES)(e.scenes||[e]).forEach((s,i)=>{
  const where=e.id+(e.scenes?'/'+i:'');scenes++;
  const ctx=new Proxy({},{get:(_,k)=>k==='region'?key=>{if(!GEO.regions[key])note(where,'map region '+key+' does not exist');return any}
   :k==='river'?key=>{if(!GEO.rivers[key])note(where,'river '+key+' does not exist');return any}:any});
  // Some draw functions reach for buttons in their own open card, which this scan does not render. checkScenes draws for real.
  try{s.draw(ctx);}catch{}
  if(!s.view)note(where,'no map view');
  if(e.scenes&&!s.legend?.length)note(where,'no map legend');
 });
 const byId=new Map(ENTRIES.map(e=>[e.id,e]));
 const target=t=>{const [id,sc]=String(t).split('/'),e=byId.get(id);return e&&(sc===undefined||(e.scenes&&e.scenes[+sc]))};
 for(const e of ENTRIES){
  const parts=[e.html||'',...(e.moments||[]).map(m=>m.text),...(e.boxes||[]).map(b=>b.text)].join(' ');
  for(const m of parts.matchAll(/data-go="([^"]+)"/g))if(!target(m[1]))note(e.id,'link to '+m[1]+' goes nowhere');
  for(const m of parts.matchAll(/data-go="([^"]+)"[^>]*data-person-target="([^"]+)"/g))if(!(FIGURE_SCENES[m[1].includes('/')?m[1]:m[1]+'/0']||[]).some(item=>item.id===m[2]))note(e.id,'link to '+m[2]+' finds no card at '+m[1]);
  for(const s of e.sources||[])if(!/^https:\/\//.test(s.url))note(e.id,'source is not https: '+s.url);
 }
 for(const [key,items] of Object.entries(FIGURE_SCENES)){
  if(!target(key))note(key,'person cards for a scene that does not exist');
  for(const item of items){
   const p=FIGURES[item.id];
   if(!p)note(key,'no such person '+item.id);else if(!FIGURE_PLACES[item.place||p.place])note(key,item.id+' has no place on the map');
  }
 }
 // "见“X”一节" and "见“X”主线" only become links if the page knows X; otherwise they stay plain words.
 const pointers=[...ENTRIES.flatMap(e=>[[e.id,e.html||''],...(e.moments||[]).map(m=>[e.id,m.text]),...(e.boxes||[]).map(b=>[e.id,b.text])]),
  ...Object.entries(FIGURE_SCENES).flatMap(([key,items])=>items.flatMap(item=>[[key,item.note],[key,FIGURES[item.id]?.bio],[key,FIGURES[item.id]?.relation]]))];
 for(const [where,text] of pointers)for(const m of String(text||'').matchAll(/见“([^”]+)”(一节|主线|专题)/g))
  if(!(m[2]==='一节'?SHORT_ID.get(m[1]):m[2]==='专题'?TOPIC_ID.get(m[1]):LINE_ID.get(m[1])))note(where,`pointer to “${m[1]}”${m[2]} leads nowhere`);
 const onLines=new Set(metroUI.data.lines.flatMap(l=>metroUI.data.lineStops.get(l.id).map(s=>s.key)));
 for(const s of metroUI.data.stations)if(!onLines.has(s.key))note(s.key,'station on no line');
 return {problems,scenes};
}

// Runs in the page: each changed scene, drawn for real in the layout readers see. Where the map itself changed (labelKeys),
// its labels are measured rather than looked at: one running over another or over another's pin, or off the map.
function checkScenes({keys,labelKeys}){
 const measureLabels=new Set(labelKeys);
 const problems=[];
 const labelTrouble=()=>{
  const M=document.getElementById('map').getBoundingClientRect(),hit=(a,b)=>Math.min(a.right,b.right)-Math.max(a.left,b.left)>1&&Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top)>1;
  const pins=[...document.querySelectorAll('#map .pin')].map(el=>{const t=el.querySelector('span'),d=el.querySelector('i');return t&&d&&getComputedStyle(el).display!=='none'&&getComputedStyle(t).display!=='none'?{name:(t.firstChild||t).textContent.trim(),label:t.getBoundingClientRect(),dot:d.getBoundingClientRect()}:null}).filter(x=>x&&x.label.right>x.label.left);
  const out=new Set();
  pins.forEach((a,x)=>{
   pins.forEach((b,y)=>{if(x<y&&hit(a.label,b.label))out.add(`labels overlap: ${a.name} / ${b.name}`);if(x!==y&&hit(a.label,b.dot))out.add(`label over a pin: ${a.name} on ${b.name}`);});
   if(a.label.left<M.left+2||a.label.right>M.right-2||a.label.top<M.top+2||a.label.bottom>M.bottom-2)out.add(`label off the map: ${a.name}`);
  });
  return [...out];
 };
 for(const key of keys){
  const [id,sc]=key.split('/'),index=+sc;go(id,{scene:index});
  const e=ENTRIES[cur],s=e.scenes?.[index]||e,note=what=>problems.push(key+': '+what);
  if(e.id!==id||(e.scenes&&sceneIndex!==index)){note('did not open');continue;}
  if(!group.getLayers().length)note('nothing on the map');
  if(measureLabels.has(key))for(const trouble of labelTrouble())note(trouble);
  if(s.view&&!map.getBounds().contains(L.latLngBounds(s.view)))note('map does not fit the scene');
  if(document.documentElement.scrollWidth>innerWidth)note('page overflows sideways');
  if(readerBody.scrollWidth>readerBody.clientWidth+1)note('text overflows sideways');
  if(e.scenes){
   const here=document.getElementById('sceneContext');
   if(!here||+here.dataset.sceneText!==index){note('text is not on this scene');continue;}
   if(!here.textContent.includes(s.date))note('date missing from the text');
   const title=here.querySelector('.passage-title').getBoundingClientRect(),body=readerBody.getBoundingClientRect();
   if(!(title.top>=body.top-1&&title.top<body.bottom))note('scene title is out of view');
   const count=(selector,want,what)=>{const got=here.querySelectorAll(selector).length;if(got!==want)note(`${what}: ${got}, should be ${want}`);};
   count('.moment',e.moments.filter(m=>m.scene===index).length,'moments');
   count('.box',e.boxes.filter(b=>b.scene===index).length,'boxes');
   count('.person-card',(FIGURE_SCENES[key]||[]).length,'person cards');
   if(isHistory(e)&&!metroUI.state().station)note('no station on the route strip');
  }
 }
 return problems;
}

(async()=>{
 fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 const open=async(file,hash,[,width,height,touch])=>{
  const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));await p.setViewport({width,height,hasTouch:touch,isMobile:touch});
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.setOfflineMode(true);
  await p.goto(pathToFileURL(file).href+hash,{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);return p;
 };
 const fail=async lines=>{console.error(lines.join('\n'));await browser.close();process.exit(1);};
 try{
  // What changed, and since when.
  const page=await open(html,'',VIEWS[0]),now=await page.evaluate(fingerprint),engine=engineNow();
  let base=null,from=null;
  if(since||!fs.existsSync(BASELINE)){
   const ref=since||'origin/main',file=path.join(out,'base.html');from=ref;
   fs.writeFileSync(file,git('show',`${ref}:index.html`));
   const old=await open(file,'',VIEWS[0]);base={...await old.evaluate(fingerprint),engine:engineAt(ref)};await old.close();fs.rmSync(file);
   errors.length=0;  // an older version's errors are not this one's
  }else{
   base=JSON.parse(fs.readFileSync(BASELINE,'utf8'));from='the last check that passed';
  }
  const all=Object.keys(now.scenes);
  const changed=flag('--all')?all:all.filter(k=>now.scenes[k]!==base.scenes[k]);
  // A section's own title or sources appear above its first scene.
  for(const id of Object.keys(now.sections))if(now.sections[id]!==base.sections[id]&&!changed.includes(id+'/0')&&now.scenes[id+'/0'])changed.push(id+'/0');
  const removed=Object.keys(base.scenes).filter(k=>!(k in now.scenes));
  const linesChanged=now.lines!==base.lines,engineChanged=engine!==base.engine;
  // A baseline from before places were recorded cannot say what moved.
  const moved=base.places?Object.keys(now.places).filter(id=>now.places[id]!==base.places[id]):[];
  const sections=[...new Set(changed.map(k=>k.split('/')[0]))];
  console.log(`Since ${from}: ${changed.length} scenes in ${sections.length} sections changed, ${removed.length} removed${moved.length?`; ${moved.length} sections moved on their lines`:''}${linesChanged?'; the lines changed':''}${engineChanged?'; the page code changed':''}.`);

  // The whole book's references.
  const book=await page.evaluate(scanBook);
  if(book.problems.length)await fail([`FAIL: ${book.problems.length} broken references in the book:`,...book.problems.slice(0,40)]);
  console.log(`Book: ${book.scenes} scenes, all references resolve.`);
  await page.close();

  // The changed scenes, on desktop and on a phone.
  const shots=[],failures=[];
  if(changed.length){
   for(const view of VIEWS){
    const p=await open(html,'#'+changed[0],view);
    // Many older maps have labels that touch, and phones have many more: a change to the text should not have to answer for those.
    const labelKeys=view[0]==='desktop'?changed.filter(k=>now.maps[k]&&now.maps[k]!==base.maps?.[k]):[];
    const problems=await p.evaluate(checkScenes,{keys:changed,labelKeys});
    if(problems.length){failures.push(`FAIL: ${problems.length} problems on ${view[0]}:`,...problems.slice(0,60));await p.close();continue;}
    if(flag('--shots')&&!flag('--all')){
     // Every changed scene on desktop; the first of each section on a phone.
     const seen=new Set();
     for(const key of changed){
      const id=key.split('/')[0];if(view[0]==='phone'&&seen.has(id))continue;seen.add(id);
      await p.evaluate(k=>{const [id,sc]=k.split('/');go(id,{scene:+sc});return new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));},key);
      await new Promise(r=>setTimeout(r,120));
      const file=`${key.replace('history-','').replace('/','_')}-${view[0]}.png`;await p.screenshot({path:path.join(out,file)});shots.push(file);
     }
    }
    await p.close();
   }
   if(failures.length)await fail(failures);
   console.log(`Scenes: ${changed.length} checked on ${VIEWS.map(v=>v[0]).join(' and ')}.`);
  }
  if(linesChanged&&flag('--shots')&&!flag('--all')){
   const wide=await open(html,'',['network',2200,1100,false]);await wide.evaluate(()=>metroUI.setMode('network'));await new Promise(r=>setTimeout(r,300));
   await wide.screenshot({path:path.join(out,'network.png')});shots.push('network.png');await wide.close();
  }
  if(errors.length)await fail(['FAIL: JavaScript errors:',...[...new Set(errors)].slice(0,10)]);

  // Passed: this is now what the next check compares with.
  const next={...now,engine};
  fs.writeFileSync(path.join(out,'changed.json'),JSON.stringify({from,changed,sections,moved,removed,linesChanged,engineChanged,shots},null,1));
  if(flag('--pending'))fs.writeFileSync(path.join(out,'baseline.next.json'),JSON.stringify(next));
  else if(!flag('--all')&&!since)fs.writeFileSync(BASELINE,JSON.stringify(next));
  if(shots.length)console.log(`${shots.length} photographs in ${path.relative(process.cwd(),out)||out}/`);
  if(changed.length&&!flag('--all'))console.log(`Open the page: ${pathToFileURL(html).href}#${changed[0]}`);
  console.log('PASS: changed scenes');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})().catch(e=>{console.error(e);process.exit(1);});
