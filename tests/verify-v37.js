const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'))).href;
const shots=path.join(__dirname,'shots-v37');fs.mkdirSync(shots,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// 老无 2026-10-28, four requests in one day:
// 1. 意大利 rebuilt on 老无’s chain (the eldest son takes Middle Francia → his three sons split it again → none leaves a lawful heir →
//    Middle Francia is fought over → the uncles split Lotharingia north of the Alps → Otto takes Italy), Otto’s Italy a station shared by
//    德意志, 意大利 and 基督教; 基督教 pushed on to 1054 (the papacy as a prize, the emperors’ church beside Cluny, the reformers, the legates).
// 2. A new line 西班牙 forks off 中世纪西欧 where the Visigoths take Spain; Tariq’s crossing (711) is one station on it and on 波斯—阿拉伯.
// 3. 波斯 becomes 波斯—阿拉伯: the Sasanians end in 651, then the Arabs from their rise; the sieges of Constantinople are one
//    station on 东罗马 and 波斯—阿拉伯.
// 4. How the Arabs ruled what they took, to the dozen states of 945; and in Spain the Umayyads of Córdoba, so 西班牙 runs on to 1031
//    and grows a shoot there for the Christian kingdoms coming south, instead of ending in 711.
// And from now on every section is a chain of causes, one link a scene, the link stated first and in bold (老无’s standing rule).
const SECTIONS=JSON.parse(fs.readFileSync(path.join(__dirname,'v37-spec.json'),'utf8'));
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const errors=[];
 const S=SECTIONS;
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
    const B=Object.fromEntries(HISTORY_BRANCHES.map(b=>[b.id,b]));
    const ids=Object.keys(S.sections),all=e=>[e.html,...e.moments.map(m=>m.text),...e.boxes.map(b=>b.text)].join(' ');
    const shorts=new Set(HISTORY_ENTRIES.map(e=>e.short)),names=new Set(HISTORY_BRANCHES.map(b=>b.name));
    return {
     heads:ids.map(id=>{const e=E(id);return e&&[e.short,e.period,e.scenes.length,e.ch];}),
     chars:ids.filter(E).flatMap(id=>{const d=document.createElement('div');d.innerHTML=E(id).html;return [...d.querySelectorAll('[data-scene-text]')].map((p,i)=>[id+'/'+i,stripEn(p.textContent).replace(/\s/g,'').length,S.sections[id][4]]);}),
     rows:Object.fromEntries(Object.keys(S.rows).map(k=>[k,TREE_ROWS[k]&&[[].concat(TREE_ROWS[k][0]),TREE_ROWS[k][1],TREE_ROWS[k][2]]])),
     branches:Object.keys(S.branches).map(id=>B[id]&&[id,B[id].name,B[id].parent||null,B[id].from??null,B[id].to??null,B[id].lane]),
     ends:TREE_ENDS.map(e=>[e[0],e[1],e[2]]),futures:TREE_FUTURE.map(f=>[f[0],f[1],f[2]]),
     parallel:TREE_PARALLEL.map(p=>[p[0],...p[1]]),
     bold:S.bold.map(([k,w])=>{const [id,i]=k.split('/');return [k,!!E(id)&&[...para(id,i).querySelectorAll('strong')].some(st=>stripEn(st.textContent).includes(w))];}),
     fixes:S.fixes.map(([k,w])=>{const [id,i]=k.split('/');const p=E(id)&&para(id,i);return [k,!!p&&stripEn(p.textContent).includes(w)&&!stripEn(p.innerHTML).includes('<strong>'+w)];}),
     gone:S.gone.map(([id,w])=>[id,!!E(id)&&stripEn(all(E(id))).includes(w)]),
     momentFixes:S.moment_fixes.map(([id,name,w])=>{const m=E(id)&&E(id).moments.find(x=>x.name===name);return [id+' '+name,!!m&&stripEn(m.text).includes(w)];}),
     slips:ids.filter(E).flatMap(id=>S.slips.filter(w=>stripEn(all(E(id))).includes(w)).map(w=>id+': '+w)),
     moments:Object.fromEntries(Object.keys(S.moments).map(id=>[id,E(id)?E(id).moments.map(m=>[m.scene,m.name]):null])),
     boxes:Object.fromEntries(Object.keys(S.boxes).map(id=>[id,E(id)?E(id).boxes.map(b=>[b.scene,b.name]):null])),
     momentsPerScene:ids.filter(E).map(id=>[id,Math.max(0,...Object.values(E(id).moments.reduce((a,m)=>(a[m.scene]=(a[m.scene]||0)+1,a),{})))]),
     sources:ids.filter(E).map(id=>[id,E(id).sources.length,E(id).sources.filter(s=>!/^https:\/\//.test(s.url)).length,E(id).sources.length-new Set(E(id).sources.map(s=>s.url)).size]),
     xsec:ids.filter(E).flatMap(id=>[...stripEn(E(id).html+E(id).moments.map(m=>m.text).join('')).matchAll(/见“([^”]+)”一节/g)].map(m=>m[1]).filter(x=>!shorts.has(x)).map(x=>id+': '+x)),
     xline:ids.filter(E).flatMap(id=>[...stripEn(E(id).html).matchAll(/另见“([^”]+)”主线/g)].map(m=>m[1]).filter(x=>!names.has(x)).map(x=>id+': '+x)),
     regions:S.regions.filter(k=>!GEO.regions[k]),
     byz:ids.filter(E).filter(id=>/拜占庭/.test(stripEn(E(id).html))),
     pope:ids.filter(E).filter(id=>/教皇/.test(E(id).html)),
     pills:[...document.querySelectorAll('#toc .tree-line')].map(b=>b.textContent),
    };
   },S);
   // Sections: short names, periods, scene counts, chapters; prose budgets without the English names.
   for(const [i,[id,[short,period,n,ch]]] of Object.entries(S.sections).entries()){
    assert.ok(r.heads[i],id+' missing');assert.equal(r.heads[i][0],short,id);assert.equal(r.heads[i][1],period,id);assert.equal(r.heads[i][3],ch,id);
    assert.equal(r.heads[i][2],n,id+' scenes');
   }
   assert.deepEqual(r.chars.filter(([,n,cap])=>n>cap),[],'prose budgets');
   // The tree: rows (shared stations list every line), lines, ends, shoots, passing loops, line pills.
   for(const [k,spec] of Object.entries(S.rows))assert.deepEqual(r.rows[k],spec,k);
   for(const [i,[id,spec]] of Object.entries(S.branches).entries())assert.deepEqual(r.branches[i],[id,...spec],id);
   assert.deepEqual(r.ends,S.ends);
   for(const f of S.futures)assert.ok(r.futures.some(x=>JSON.stringify(x)===JSON.stringify(f)),'shoot '+JSON.stringify(f));
   assert.deepEqual(r.parallel,S.parallel);
   assert.deepEqual(r.pills,S.pills,label+' line pills');
   // 老无’s chain links in bold where they belong; corrections in plain text; what moved away is gone from its old place.
   for(const [k,ok] of r.bold)assert.ok(ok,k+' lacks 老无’s thesis in bold');
   for(const [k,ok] of r.fixes)assert.ok(ok,k+' lacks the plain-text correction');
   for(const [id,still] of r.gone)assert.ok(!still,id+' still carries what moved away');
   for(const [k,ok] of r.momentFixes)assert.ok(ok,k+' lacks its correction');
   assert.deepEqual(r.slips,[],'dictation slips or readings set right, copied into the prose');
   for(const [id,list] of Object.entries(S.moments))assert.deepEqual(r.moments[id],list,id+' moments');
   for(const [id,list] of Object.entries(S.boxes))assert.deepEqual(r.boxes[id],list,id+' boxes');
   for(const [id,n] of r.momentsPerScene)assert.ok(n<=2,id+' has more than two moments in one scene');
   for(const [id,n,bad,dup] of r.sources)assert.ok(n>=6&&!bad&&!dup,id+' reading links '+JSON.stringify([n,bad,dup]));
   assert.deepEqual(r.xsec,[],'pointers to missing sections');assert.deepEqual(r.xline,[],'pointers to missing lines');
   assert.deepEqual(r.regions,[],'map areas');assert.deepEqual(r.byz,[],'东罗马, not 拜占庭');assert.deepEqual(r.pope,[],'教宗, not 教皇');
   // The drawn tree: one node per line for each shared station, level; the fork of 西班牙 out of 中世纪西欧 and its shoot at 1031.
   if(label==='desktop'){
    const t=await page.evaluate(keys=>{const tree=document.querySelector('#toc .htree');
     return {forks:[...tree.querySelectorAll('.fork')].map(p=>p.dataset.branch).sort(),loops:tree.querySelectorAll('.lane.loop').length,
      nodes:Object.fromEntries(keys.map(k=>{const ns=[...tree.querySelectorAll(`.tree-node[data-key="${k}"]`)];return [k,[new Set(ns.map(n=>n.getAttribute('cx'))).size,new Set(ns.map(n=>n.getAttribute('cy'))).size]];})),
      ends:[...tree.querySelectorAll('.tree-end')].map(e=>e.textContent),futures:[...tree.querySelectorAll('.tree-future')].map(e=>[e.dataset.branch,e.textContent])};},Object.keys(S.shared));
    assert.ok(t.forks.includes('spain'),'西班牙 forks off '+JSON.stringify(t.forks));
    assert.equal(t.loops,S.parallel.length,'loops');
    for(const [k,lines] of Object.entries(S.shared))assert.deepEqual(t.nodes[k],[lines.length,1],k+' one node on each of its lines, level');
    assert.ok(!t.ends.some(e=>/并入阿拉伯/.test(e)),'西班牙 runs on past 711');
    assert.ok(t.futures.some(([b,x])=>b==='spain'&&/收复失地运动/.test(x)),'西班牙 grows its shoot at 1031 '+JSON.stringify(t.futures));
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
   // Shared stations open their section on every line they sit on.
   for(const [k,lines] of Object.entries(S.shared)){
    for(const line of lines){
     const ok=await page.evaluate(({k,line})=>{selectTreeLine(line,{jump:false});const st=lineStations(line).find(s=>s.key===k);return !!st;},{k,line});
     assert.ok(ok,k+' is a station on '+line);
    }
   }
   if(label==='390'){await page.evaluate(()=>go('history-italy-middle-francia',{scene:3}));await wait(150);await page.screenshot({path:path.join(shots,'meerssen-390.png')});}
   await page.close();
  }
  assert.deepEqual(errors,[],'page errors');
  console.log('PASS: v37 — '+S.pass);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
