const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'))).href;
const shots=path.join(__dirname,'shots-v38');fs.mkdirSync(shots,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// 老无 2026-10-28 夜, two requests:
// 1. A new 东欧 line: the forest farmers, the steppe nomads and the Greek ports of the north Pontic trading for centuries; under Rome the
//    grain lost its buyer and slaves paid the bill; new masters on the steppe, the Slavs going south with them; Heraclius won in the east
//    and let the Slavs in through the north; the Vikings came ashore in the east as the Rus, could not take Constantinople, traded with it,
//    fought Bulgaria for it and guarded its emperor. It forks off 希腊 at the Black Sea colonies; its last section is shared with 东罗马.
// 2. From 前1000年, a line across the whole tree every five hundred years, with a short account of where each line stands.
const S=JSON.parse(fs.readFileSync(path.join(__dirname,'v38-spec.json'),'utf8'));
const SLICE_YEARS=[-1000,-500,0,500,1000];
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const errors=[];
 try{
  for(const [label,w,h] of [['desktop',1440,960],['390',390,844]]){
   const page=await browser.newPage();await page.setViewport({width:w,height:h,deviceScaleFactor:1});
   await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
   await page.setRequestInterception(true);page.on('request',r=>/^https?:/.test(r.url())?r.abort():r.continue());
   page.on('pageerror',e=>errors.push(label+': '+e.message));
   await page.goto(url,{waitUntil:'domcontentloaded'});await wait(400);
   const r=await page.evaluate(S=>{
    const E=id=>HISTORY_ENTRIES.find(e=>e.id===id),stripEn=s=>s.replace(/（[A-Za-z][^）]*）/g,'');
    const para=(id,i)=>{const d=document.createElement('div');d.innerHTML=E(id).html;return [...d.querySelectorAll('[data-scene-text]')][+i];};
    const all=e=>[e.html,...e.moments.map(m=>m.text),...e.boxes.map(b=>b.text)].join(' ');
    const B=Object.fromEntries(HISTORY_BRANCHES.map(b=>[b.id,b]));
    const ids=Object.keys(S.sections),shorts=new Set(HISTORY_ENTRIES.map(e=>e.short)),names=new Set(HISTORY_BRANCHES.map(b=>b.name));
    return {
     heads:ids.map(id=>{const e=E(id);return e&&[e.short,e.period,e.scenes.length,e.ch];}),
     chars:ids.filter(E).flatMap(id=>{const d=document.createElement('div');d.innerHTML=E(id).html;return [...d.querySelectorAll('[data-scene-text]')].map((p,i)=>[id+'/'+i,stripEn(p.textContent).replace(/\s/g,'').length]);}),
     rows:Object.fromEntries(Object.keys(S.rows).map(k=>[k,TREE_ROWS[k]&&[[].concat(TREE_ROWS[k][0]),TREE_ROWS[k][1],TREE_ROWS[k][2]]])),
     branch:B.eeurope&&[B.eeurope.name,B.eeurope.parent,B.eeurope.from,B.eeurope.to,B.eeurope.lane,B.eeurope.c===HC.eeurope],
     china:B.china.lane,lanes:Math.max(...HISTORY_BRANCHES.map(b=>b.lane)),
     chapter:[HISTORY_CH[10],NUMERALS[10],TREE_CH_COLORS[10]===HC.eeurope],
     eras:HISTORY_ERAS.filter(e=>/^eeurope-/.test(e.id)).map(e=>[e.id,e.name,e.items.map(i=>i[0])]),
     future:TREE_FUTURE.filter(f=>f[0]==='eeurope').map(f=>[f[0],f[1],f[2]]),
     bold:S.bold.map(([k,w])=>{const [id,i]=k.split('/');return [k,!!E(id)&&[...para(id,i).querySelectorAll('strong')].some(st=>stripEn(st.textContent).includes(w))];}),
     fixes:S.fixes.map(([k,w])=>{const [id,i]=k.split('/');const p=E(id)&&para(id,i);return [k,!!p&&stripEn(p.textContent).includes(w)&&!stripEn(p.innerHTML).includes('<strong>'+w)];}),
     slips:ids.filter(E).flatMap(id=>S.slips.filter(w=>stripEn(all(E(id))).includes(w)).map(w=>id+': '+w)),
     moments:Object.fromEntries(Object.keys(S.moments).map(id=>[id,E(id)?E(id).moments.map(m=>[m.scene,m.name]):null])),
     momentsPerScene:ids.filter(E).map(id=>[id,Math.max(0,...Object.values(E(id).moments.reduce((a,m)=>(a[m.scene]=(a[m.scene]||0)+1,a),{})))]),
     sources:ids.filter(E).map(id=>[id,E(id).sources.length,E(id).sources.filter(s=>!/^https:\/\//.test(s.url)).length,E(id).sources.length-new Set(E(id).sources.map(s=>s.url)).size]),
     xsec:ids.filter(E).flatMap(id=>[...stripEn(all(E(id))).matchAll(/见“([^”]+)”一节/g)].map(m=>m[1]).filter(x=>!shorts.has(x)).map(x=>id+': '+x)),
     xline:ids.filter(E).flatMap(id=>[...stripEn(all(E(id))).matchAll(/另见“([^”]+)”主线/g)].map(m=>m[1]).filter(x=>!names.has(x)).map(x=>id+': '+x)),
     regions:S.regions.filter(k=>!GEO.regions[k]),
     // 拜占庭 is the Greek city's own name in the two ancient sections; from the Slavs on the empire is 东罗马.
     byz:ids.slice(2).filter(E).filter(id=>/拜占庭/.test(stripEn(all(E(id))))),pope:ids.filter(E).filter(id=>/教皇/.test(all(E(id)))),
     pills:[...document.querySelectorAll('#toc .tree-line')].map(b=>b.textContent),
     caption:document.getElementById('indexCaption')?.textContent||'',
     slices:TREE_SLICES.map(s=>[s[0],s[1],s[2].length>0,s[3].length]),
     // Time slices are not stations: no line gains or loses a stop by them.
     stationsBySlices:treeStations().some(s=>!s.key),
    };
   },S);
   if(label==='desktop'){
    // The 东欧 sections: names, periods, scenes, chapter Ⅺ; prose within 230 characters a scene.
    for(const [i,[id,[short,period,n,ch]]] of Object.entries(S.sections).entries()){
     assert.ok(r.heads[i],id+' missing');assert.deepEqual(r.heads[i],[short,period,n,ch],id);
    }
    assert.deepEqual(r.chars.filter(([,n])=>n>230),[],'prose budgets');
    for(const [k,spec] of Object.entries(S.rows))assert.deepEqual(r.rows[k],spec,k);
    assert.deepEqual(r.branch,['东欧','trunk',-700,1054,7,true],'东欧 off 希腊 on lane 7');
    assert.equal(r.china,8,'中国 keeps the outermost lane');assert.equal(r.lanes,8);
    assert.deepEqual(r.chapter,['东欧','Ⅺ',true],'chapter Ⅺ 东欧');
    assert.deepEqual(r.eras,S.eras);
    assert.deepEqual(r.future,[['eeurope',1054,'基辅罗斯以后']]);
    for(const [k,ok] of r.bold)assert.ok(ok,k+' lacks 老无’s point in bold');
    for(const [k,ok] of r.fixes)assert.ok(ok,k+' lacks the plain-text correction');
    assert.deepEqual(r.slips,[],'readings set right, copied into the prose');
    for(const [id,list] of Object.entries(S.moments))assert.deepEqual(r.moments[id],list,id+' moments');
    for(const [id,n] of r.momentsPerScene)assert.ok(n<=2,id+' has more than two moments in one scene');
    for(const [id,n,bad,dup] of r.sources)assert.ok(n>=6&&!bad&&!dup,id+' reading links '+JSON.stringify([n,bad,dup]));
    assert.deepEqual(r.xsec,[],'pointers to missing sections');assert.deepEqual(r.xline,[],'pointers to missing lines');
    assert.deepEqual(r.regions,[],'map areas');assert.deepEqual(r.byz,[],'东罗马, not 拜占庭');assert.deepEqual(r.pope,[],'教宗, not 教皇');
    assert.deepEqual(r.pills,S.pills,'line pills');
    assert.match(r.caption,/Ⅸ 埃及 Ⅹ 波斯—阿拉伯 Ⅺ 东欧/);
    assert.deepEqual(r.slices.map(s=>s[0]),SLICE_YEARS,'five time slices');
    assert.ok(r.slices.every(s=>s[2]&&s[3]>=120&&s[3]<=320),'each slice has a headline and a short paragraph '+JSON.stringify(r.slices));
    assert.equal(r.stationsBySlices,false);
   }
   // The tree: the fork of 东欧 out of 希腊, one node per line for its shared station, and the time slices in their places.
   const sel=label==='desktop'?'#toc .htree':'#treeSheet .htree';
   if(label!=='desktop'){await page.click('#treeOpen');await wait(300);}
   const t=await page.evaluate(sel=>{
    const tree=document.querySelector(sel),top=el=>+el.style.top.replace('px','');
    const items=[...tree.querySelectorAll('.tree-item')].map(b=>({t:TREE_ROWS[b.dataset.key][1],top:top(b),bottom:top(b)+b.offsetHeight}));
    const slices=[...tree.querySelectorAll('.tree-slice')].map(s=>({t:+s.dataset.t,top:top(s),h:s.offsetHeight,open:s.open,off:s.classList.contains('off-line')}));
    const lines=[...tree.querySelectorAll('.slice-line')].map(p=>+p.getAttribute('d').match(/^M[-\d.]+ ([-\d.]+)H/)[1]);
    const nodes=k=>{const ns=[...tree.querySelectorAll(`.tree-node[data-key="${k}"]`)];return [new Set(ns.map(n=>n.getAttribute('cx'))).size,new Set(ns.map(n=>n.getAttribute('cy'))).size];};
    return {forks:[...tree.querySelectorAll('.fork')].map(p=>p.dataset.branch),slices,lines,items,
     shared:nodes('history-eeurope-byzantium/0'),overflow:document.documentElement.scrollWidth>innerWidth};
   },sel);
   assert.ok(t.forks.includes('eeurope'),label+' 东欧 forks off');
   assert.deepEqual(t.shared,[2,1],label+' 罗斯与东罗马: one node on 东欧 and one on 东罗马, level');
   assert.deepEqual(t.slices.map(s=>s.t),SLICE_YEARS,label+' slices');
   assert.equal(t.lines.length,5,label+' one line across the tree per slice');
   for(const [i,s] of t.slices.entries()){
    // Everything earlier sits above the slice, everything later below it.
    assert.ok(t.items.filter(x=>x.t<s.t).every(x=>x.bottom<=s.top+1),label+' rows before '+s.t+' sit above it');
    assert.ok(t.items.filter(x=>x.t>s.t).every(x=>x.top>=s.top+s.h-1),label+' rows after '+s.t+' sit below it');
    assert.ok(Math.abs(t.lines[i]-s.top)<16,label+' the line of '+s.t+' runs at its heading');
    assert.equal(s.off,false,label+' a slice belongs to every line');
   }
   assert.ok(t.slices.every(s=>s.open===(label!=='desktop')),label+' open in the expanded tree, closed in the sidebar');
   assert.equal(t.overflow,false,label+' no overflow');
   if(label==='desktop'){
    // Opening a slice in the sidebar pushes the rows below it down, and they still do not overlap.
    const o=await page.evaluate(()=>{const tree=document.querySelector('#toc .htree'),s=[...tree.querySelectorAll('.tree-slice')][1];
     const below=()=>Math.min(...[...tree.querySelectorAll('.tree-item')].filter(b=>TREE_ROWS[b.dataset.key][1]>-500).map(b=>+b.style.top.replace('px','')));
     const before=below();s.open=true;return new Promise(res=>setTimeout(()=>{const after=below();const top=+s.style.top.replace('px','');
      res({grew:after-before,clear:after>=top+s.offsetHeight-1,text:s.querySelector('p').textContent.length});},150));});
    assert.ok(o.grew>40&&o.clear&&o.text>100,JSON.stringify(o));
    await page.evaluate(()=>[...document.querySelectorAll('#toc .tree-slice')][1].scrollIntoView({block:'center'}));await wait(150);
    await page.screenshot({path:path.join(shots,'slice-sidebar.png'),clip:{x:0,y:0,width:520,height:960}});
    await page.click('#treeOpen');await wait(300);
    await page.evaluate(()=>[...document.querySelectorAll('#treeSheet .tree-slice')][3].scrollIntoView({block:'center'}));await wait(150);
    await page.screenshot({path:path.join(shots,'slice-sheet-1440.png')});await page.keyboard.press('Escape');await wait(150);
   }else{
    await page.evaluate(()=>[...document.querySelectorAll('#treeSheet .tree-slice')][2].scrollIntoView({block:'center'}));await wait(150);
    await page.screenshot({path:path.join(shots,'slice-sheet-390.png')});await page.keyboard.press('Escape');await wait(150);
   }
   // Every new scene draws, fits its view on the desktop, and leaves no horizontal overflow.
   for(const id of Object.keys(S.sections)){
    const n=await page.evaluate(id=>HISTORY_ENTRIES.find(e=>e.id===id).scenes.length,id);
    for(let i=0;i<n;i++){
     const s=await page.evaluate(({id,i})=>{go(id,{scene:i});const sc=activeScene(ENTRIES[cur]);
      return {pins:Object.keys(pinIndex).length,layers:group.getLayers().length,fits:map.getBounds().contains(L.latLngBounds(sc.view)),overflow:document.documentElement.scrollWidth>innerWidth};},{id,i});
     await wait(90);
     assert.ok(s.layers>0&&!s.overflow,id+'/'+i+' '+JSON.stringify(s));
     if(label==='desktop'){assert.ok(s.pins>0&&s.fits,id+'/'+i+' '+JSON.stringify(s));await page.screenshot({path:path.join(shots,`${id.replace('history-','')}_${i}-desktop.png`)});}
    }
   }
   // 老无 2026-10-28 夜: “见‘X’一节” jumps to that section; “另见‘X’主线” switches to that line at the station of the year its
   // sentence names (860: the Rus and Byzantium), or, with no year, at the scene's start (750: 西法兰克王国, the line's first station).
   for(const [from,scene,sel,to,line] of [['history-eeurope-slavs',0,'a.xref[data-go="history-eeurope-roman"]','history-eeurope-roman',null],
     ['history-france-west-francia',1,'a.xref[data-line="east"]','history-eeurope-byzantium','east'],
     ['history-eeurope-rus',0,'a.xref[data-line="france"]','history-france-west-francia','france'],
     ['history-eeurope-pontic',3,'a.xref[data-line="china"]','history-china-western-han','china']]){
    await page.evaluate(({from,scene})=>go(from,{scene}),{from,scene});await wait(80);
    const text=await page.$eval('#sceneContext',e=>e.textContent);
    assert.ok(await page.$(`#sceneContext ${sel}`),from+'/'+scene+' has the link '+sel);
    await page.evaluate(sel=>document.querySelector(`#sceneContext ${sel}`).click(),sel);await wait(120);
    const at=await page.evaluate(()=>[ENTRIES[cur].id,treeLine,currentStation()?.t]);
    if(to)assert.equal(at[0],to,from+' → '+to);
    if(line)assert.equal(at[1],line,from+' → on '+line);
    assert.ok(text.includes('见“'),'the pointer text itself stays as written');
   }
   // Every pointer in the atlas — prose, moments, boxes, people — names a section (by short name or title) or a line that exists.
   const pointers=await page.evaluate(()=>{
    const all=[...HISTORY_ENTRIES.flatMap(e=>[e.html,...e.moments.map(m=>m.text),...e.boxes.map(b=>b.text)]),
      ...Object.values(FIGURES).flatMap(f=>[f.bio,f.relation]),...Object.values(FIGURE_SCENES).flat().map(c=>c.note)].join(' ');
    const found=[...all.matchAll(/(另)?见“([^”]+)”(一节|主线)/g)];
    return {n:found.length,bad:[...new Set(found.filter(m=>m[3]==='一节'?!SHORT_ID.has(m[2]):!LINE_ID.has(m[2])).map(m=>m[0]))]};
   });
   assert.ok(pointers.n>200,'pointers found: '+pointers.n);
   assert.deepEqual(pointers.bad,[],'every pointer resolves');
   // “见上一节”“见下一节”: the section before or after on the section's own line (checked by hand against what each one cites).
   for(const [id,want] of [['history-empire-west-fall',['history-empire-theodosius','history-empire-west-end']],
     ['history-empire-west-end',['history-empire-west-fall']],['history-empire-leo',['history-empire-theodosius']],
     ['history-west-ostrogoths',['history-west-kingdoms']],['history-faith-gregory',['history-faith-three-chapters']],
     ['history-persia-elam',['history-persia-achaemenid']],['history-persia-parthia',['history-eastern-kingdoms']]]){
    await page.evaluate(id=>go(id),id);await wait(60);
    const got=await page.$$eval('#card a.xref',as=>as.filter(a=>/^见[上下]一节$/.test(a.textContent)).map(a=>a.dataset.go));
    assert.deepEqual(got,want,id+' 见上/下一节');
   }
   const relative=await page.evaluate(()=>HISTORY_ENTRIES.reduce((n,e)=>n+(e.html.match(/见[上下]一节/g)||[]).length,0));
   assert.equal(relative,8,'eight relative pointers, all checked above');
   // The eyebrow names the era and chapter Ⅺ (第十一章), on 东欧 and on the shared station alike.
   for(const [id,era] of [['history-eeurope-pontic','东欧：草原、森林与港口'],['history-eeurope-byzantium','东欧：斯拉夫人与罗斯']]){
    await page.evaluate(id=>go(id),id);await wait(60);
    assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),era+' · 第十一章',id+' eyebrow');
   }
   // The shared station opens on both of its lines; ↑↓ along 东欧 walks its six sections in order.
   for(const line of ['eeurope','east'])assert.ok(await page.evaluate(line=>lineStations(line).some(s=>s.key==='history-eeurope-byzantium/0'),line),'罗斯与东罗马 on '+line);
   const walk=await page.evaluate(ids=>{selectTreeLine('eeurope');return lineStations('eeurope').map(s=>s.id).filter(id=>ids.includes(id));},Object.keys(S.sections));
   assert.deepEqual(walk,Object.keys(S.sections),'东欧 in reading order');
   await page.close();
  }
  assert.deepEqual(errors,[],'page errors');
  console.log('PASS: v38 — '+S.pass);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
