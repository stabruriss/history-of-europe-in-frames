const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'))).href;
const shots=path.join(__dirname,'shots-v42');fs.mkdirSync(shots,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// 老无 2026-10-30, “回头去把意大利，基督教和德意志往前推推。这三个基本是搅和在一起，所以必要的地方可以用贯通事件”:
// the second half of the investiture fight (Henry V, Sutri, the excommunication that weighed this time, Worms 1122), shared by 德意志
//   and 基督教; the popes' new protectors and the split college that elected two popes at once until the two-thirds rule of 1179 (基督教);
//   the cities of the north and the kingdom of Sicily (意大利); Saxony rising and the Hohenstaufen putting it down (德意志); Barbarossa
//   in Italy, the Lombard League and the Peace of Venice (all three lines); Henry VI's Sicily and the pope caught between (德意志,
//   意大利); and Innocent III with the two kings of Germany, a 豆腐块 on how he came to hold sway (all three lines).
const S=JSON.parse(fs.readFileSync(path.join(__dirname,'v42-spec.json'),'utf8'));
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
     chars:ids.filter(E).flatMap(id=>{const d=document.createElement('div');d.innerHTML=E(id).html;
      return [...d.querySelectorAll('[data-scene-text]')].map((p,i)=>[id+'/'+i,stripEn(p.textContent).replace(/\s/g,'').length,S.budget[id]]);}),
     rows:Object.fromEntries(Object.keys(S.rows).map(k=>[k,TREE_ROWS[k]&&[[].concat(TREE_ROWS[k][0]),TREE_ROWS[k][1],TREE_ROWS[k][2]]])),
     branches:Object.fromEntries(Object.keys(S.branches).map(id=>[id,B[id]&&[B[id].name,B[id].parent,B[id].from,B[id].to,B[id].lane]])),
     eras:HISTORY_ERAS.filter(e=>S.eras.some(x=>x[0]===e.id)).map(e=>[e.id,e.name,e.items.map(i=>i[0])]),
     futures:TREE_FUTURE.filter(f=>Object.keys(S.branches).includes(f[0])).map(f=>[f[0],f[1],f[2]]),
     tails:Object.fromEntries(Object.entries(S.tails).map(([l,keys])=>{const st=lineStations(l).map(s=>s.key);return [l,st.slice(st.indexOf(keys[0]))];})),
     bold:S.bold.map(([k,w])=>{const [id,i]=k.split('/');return [k,!!E(id)&&[...para(id,i).querySelectorAll('strong')].some(st=>stripEn(st.textContent).includes(w))];}),
     fixes:S.fixes.map(([k,w])=>{const [id,i]=k.split('/');const p=E(id)&&para(id,i);return [k,w,!!p&&stripEn(p.textContent).includes(w)&&!stripEn(p.innerHTML).includes('<strong>'+w)];}),
     slips:ids.filter(E).flatMap(id=>S.slips.filter(w=>stripEn(all(E(id))).includes(w)).map(w=>id+': '+w)),
     boxes:Object.entries(S.boxes).flatMap(([id,bs])=>bs.map(([sc,name])=>[id,sc,name,!!E(id)&&E(id).boxes.some(b=>b.scene===sc&&b.name===name)])),
     boxfixes:(S.boxfixes||[]).map(([id,name,w])=>{const b=E(id)&&E(id).boxes.find(x=>x.name===name);return [id,name,w,!!b&&stripEn(b.text.replace(/<[^>]+>/g,'')).includes(w)&&!/<strong>/.test(b.text)];}),
     moments:Object.fromEntries(Object.keys(S.moments).map(id=>[id,E(id)?E(id).moments.map(m=>[m.scene,m.name]):null])),
     momentsPerScene:ids.filter(E).map(id=>[id,Math.max(0,...Object.values(E(id).moments.reduce((a,m)=>(a[m.scene]=(a[m.scene]||0)+1,a),{})))]),
     sources:ids.filter(E).map(id=>[id,E(id).sources.length,E(id).sources.filter(s=>!/^https:\/\//.test(s.url)).length,E(id).sources.length-new Set(E(id).sources.map(s=>s.url)).size]),
     xsec:ids.filter(E).flatMap(id=>[...stripEn(all(E(id))).matchAll(/见“([^”]+)”一节/g)].map(m=>m[1]).filter(x=>!shorts.has(x)).map(x=>id+': '+x)),
     xline:ids.filter(E).flatMap(id=>[...stripEn(all(E(id))).matchAll(/另见“([^”]+)”主线/g)].map(m=>m[1]).filter(x=>!names.has(x)).map(x=>id+': '+x)),
     china:ids.filter(E).filter(id=>!/另见“中国”主线/.test(E(id).html)),
     regions:S.regions.filter(k=>!GEO.regions[k]),
     byz:ids.filter(E).filter(id=>/拜占庭/.test(stripEn(all(E(id))))),pope:ids.filter(E).filter(id=>/教皇/.test(all(E(id)))),
     colours:ids.filter(E).map(id=>[id,E(id).c===B[[].concat(TREE_ROWS[id+'/0'][0])[0]].c]),
    };
   },S);
   if(label==='desktop'){
    for(const [i,[id,[short,period,n,ch]]] of Object.entries(S.sections).entries()){
     assert.ok(r.heads[i],id+' missing');assert.deepEqual(r.heads[i],[short,period,n,ch],id);
    }
    assert.deepEqual(r.chars.filter(([,n,max])=>n>max),[],'prose budgets (300 a scene, 230 on 基督教)');
    for(const [k,spec] of Object.entries(S.rows))assert.deepEqual(r.rows[k],spec,k);
    for(const [id,spec] of Object.entries(S.branches))assert.deepEqual(r.branches[id],spec,id+' runs on to its new end');
    assert.deepEqual(r.eras.sort(),S.eras.slice().sort());
    assert.deepEqual(r.futures.sort(),S.futures.slice().sort(),'new shoots at the new ends');
    for(const [l,keys] of Object.entries(S.tails))assert.deepEqual(r.tails[l],keys,l+' stations from its old end on, in order');
    for(const [k,ok] of r.bold)assert.ok(ok,k+' lacks 老无’s point in bold');
    for(const [k,w,ok] of r.fixes)assert.ok(ok,k+' lacks the plain-text correction: '+w);
    assert.deepEqual(r.slips,[],'readings set right, not copied into the prose');
    for(const [id,sc,name,ok] of r.boxes)assert.ok(ok,id+' lacks the 豆腐块 '+name+' at scene '+sc);
    for(const [id,name,w,ok] of r.boxfixes)assert.ok(ok,id+' 豆腐块 '+name+' lacks the plain-text correction: '+w);
    for(const [id,list] of Object.entries(S.moments))assert.deepEqual(r.moments[id],list,id+' moments');
    for(const [id,n] of r.momentsPerScene)assert.ok(n<=2,id+' has more than two moments in one scene');
    for(const [id,n,bad,dup] of r.sources)assert.ok(n>=8&&!bad&&!dup,id+' reading links '+JSON.stringify([n,bad,dup]));
    assert.deepEqual(r.xsec,[],'pointers to missing sections');assert.deepEqual(r.xline,[],'pointers to missing lines');
    assert.deepEqual(r.china,[],'one comparison with China in each section');
    assert.deepEqual(r.regions,[],'map areas');assert.deepEqual(r.byz,[],'东罗马, not 拜占庭');assert.deepEqual(r.pope,[],'教宗, not 教皇');
    for(const [id,ok] of r.colours)assert.ok(ok,id+' takes the colour of its home line');
   }
   // The drawn tree: one node per line for each shared station, level; the shoots at the new ends.
   const sel=label==='desktop'?'#toc .htree':'#treeSheet .htree';
   if(label!=='desktop'){await page.click('#treeOpen');await wait(300);}
   const t=await page.evaluate(({sel,keys})=>{
    const tree=document.querySelector(sel);
    return {nodes:Object.fromEntries(keys.map(k=>{const ns=[...tree.querySelectorAll(`.tree-node[data-key="${k}"]`)];
      return [k,[new Set(ns.map(n=>n.getAttribute('cx'))).size,new Set(ns.map(n=>n.getAttribute('cy'))).size]];})),
     futures:[...tree.querySelectorAll('.tree-future')].map(e=>[e.dataset.branch,e.textContent]),overflow:document.documentElement.scrollWidth>innerWidth};
   },{sel,keys:Object.keys(S.shared)});
   for(const [k,lines] of Object.entries(S.shared))assert.deepEqual(t.nodes[k],[lines.length,1],label+' '+k+' one node on each of its lines, level');
   for(const [b,,name] of S.futures)assert.ok(t.futures.some(([x,text])=>x===b&&text.includes(name)),label+' '+b+' shoot '+name);
   assert.equal(t.overflow,false,label+' no overflow');
   if(label!=='desktop'){
    await page.evaluate(()=>document.querySelector('#treeSheet .tree-item[data-key="history-germany-innocent/0"]').scrollIntoView({block:'center'}));await wait(150);
    await page.screenshot({path:path.join(shots,'tree-sheet-390.png')});await page.keyboard.press('Escape');await wait(150);
   }else{
    await page.evaluate(()=>document.querySelector('#toc .tree-item[data-key="history-germany-innocent/0"]').scrollIntoView({block:'center'}));await wait(150);
    await page.screenshot({path:path.join(shots,'tree-sidebar.png'),clip:{x:0,y:0,width:520,height:960}});
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
   if(label==='desktop'){
    // The shared stations open on each of their lines; riding a line with ↑↓ passes them in time order.
    for(const [k,lines] of Object.entries(S.shared))for(const line of lines)
     assert.ok(await page.evaluate(({line,k})=>lineStations(line).some(s=>s.key===k),{line,k}),k+' on '+line);
    for(const [line,keys] of Object.entries(S.tails)){
     const walked=await page.evaluate(({line,keys})=>{selectTreeLine(line);const [id,from]=keys[0].split('/');go(id,{scene:+from});const out=[currentStation().key];
      for(let i=1;i<keys.length;i++){const n=lineNeighbor(1);if(!n)break;go(n.id,{scene:n.from});treeLine=line;out.push(currentStation().key);}return out;},{line,keys});
     assert.deepEqual(walked,keys,line+' walked down from its old end');
    }
    // Pointers in the new sections are links that land where they say.
    const links=await page.evaluate(ids=>{const out=[];for(const id of ids){go(id);
      for(const a of document.querySelectorAll('#card a.xref[data-go]'))out.push([id,a.textContent,!!HISTORY_ENTRIES.find(e=>e.id===a.dataset.go)]);}return out;},Object.keys(S.sections));
    assert.ok(links.length>=10&&links.every(x=>x[2]),'section links in the new sections '+JSON.stringify(links.filter(x=>!x[2])));
    // The eyebrow names the era; the shared stations keep their home chapter.
    for(const [id,era] of S.eras.flatMap(([,name,items])=>items.map(i=>[i,name]))){
     await page.evaluate(id=>go(id),id);await wait(40);
     assert.ok((await page.$eval('#entryEyebrow',e=>e.textContent)).startsWith(era+' · '),id+' eyebrow');
    }
   }
   await page.close();
  }
  assert.deepEqual(errors,[],'page errors');
  console.log('PASS: v42 — '+S.pass);
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
