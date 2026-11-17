// The text sits left of the map; its right edge can be dragged wider or narrower.
require('./chrome_guard.cjs');
const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'))).href;
const KEY='agora-atlas-reader-width',TABLE='#history-britain-jeanne/6',MIN=280,MAP_KEPT=332,DEFAULT=560;
const report=p=>p.evaluate(()=>{
 const r=reader.getBoundingClientRect(),stage=document.getElementById('mapwrap').getBoundingClientRect(),g=document.getElementById('readerGrip'),gr=g.getBoundingClientRect(),m=document.getElementById('map').getBoundingClientRect(),legend=document.getElementById('legendBox').getBoundingClientRect();
 return {width:Math.round(r.width),leftGap:Math.round(r.left-stage.left),stage:Math.round(stage.width),gripRightGap:gr.right-r.right,gripVisible:g.checkVisibility(),mapLeft:Math.round(m.left),readerRight:Math.round(r.right),mapWidth:Math.round(m.width),leafletWidth:map.getSize().x,legendLeft:legend.left,
  saved:localStorage.getItem('agora-atlas-reader-width'),now:+g.getAttribute('aria-valuenow'),max:+g.getAttribute('aria-valuemax'),
  fits:document.documentElement.scrollWidth<=innerWidth&&readerBody.scrollWidth<=readerBody.clientWidth+1,
  sees:map.getBounds().contains(L.latLngBounds(activeScene(ENTRIES[cur]).view)),dragging:document.body.classList.contains('resizing-reader'),id:ENTRIES[cur].id,scene:sceneIndex};
});
const gripAt=p=>p.$eval('#readerGrip',e=>{const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
async function dragGrip(p,dx){
 const g=await gripAt(p);await p.mouse.move(g.x,g.y);await p.mouse.down();
 await p.mouse.move(g.x+dx/2,g.y,{steps:4});await p.mouse.move(g.x+dx,g.y,{steps:4});await p.mouse.up();
}
// What is at the top of the panel, so that it can be looked for again after the text reflows.
const pinTop=(p,selector,index)=>p.evaluate((selector,index)=>{
 const el=card.querySelectorAll(selector)[index],edge=readerBody.getBoundingClientRect();
 el.scrollIntoView({block:'start',behavior:'instant'});readerBody.scrollBy({top:Math.round(el.getBoundingClientRect().height/2),behavior:'instant'});
 window.__pinned=el;return readerBody.scrollTop>0&&edge.height>0;
},selector,index);
const pinnedAtTop=p=>p.evaluate(()=>{const r=window.__pinned.getBoundingClientRect(),top=readerBody.getBoundingClientRect().top;return {holds:r.top<=top+2&&r.bottom>=top-2,top:r.top,bottom:r.bottom,edge:top};});
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 async function pageAt(width,height,hash=TABLE){
  const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));await p.setViewport({width,height});
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.setOfflineMode(true);
  await p.goto(url+hash,{waitUntil:'domcontentloaded'});await p.evaluate(()=>document.fonts.ready);return p;
 }
 try{
  const p=await pageAt(1440,900);
  // The default: text against the left edge, a reachable grip on its right edge, an accurate separator role, the map beside it.
  let a=await report(p);const stage=a.stage,max=stage-MAP_KEPT;
  assert.equal(a.width,DEFAULT);assert.equal(a.leftGap,0);assert.equal(a.saved,null);assert.equal(a.mapLeft,a.readerRight);assert.equal(a.leafletWidth,a.mapWidth);
  await p.focus('#readerGrip');a=await report(p);assert.equal(a.now,DEFAULT);assert.equal(a.max,max);
  const g0=await gripAt(p);
  assert.ok(await p.evaluate(({x,y})=>{const e=document.elementFromPoint(x,y),g=document.getElementById('readerGrip');return e===g&&g.getAttribute('role')==='separator'&&g.getAttribute('aria-valuemin')==='280'&&getComputedStyle(g).cursor==='col-resize';},g0));
  
  // A click that does not move changes nothing: not the width, not the store, not a map the reader has panned.
  await p.evaluate(()=>{map.panBy([140,60],{animate:false});window.__panned=map.getCenter();});
  await p.mouse.click(g0.x,g0.y);
  a=await report(p);assert.equal(a.width,DEFAULT);assert.equal(a.saved,null);
  assert.ok(await p.evaluate(()=>map.getCenter().equals(window.__panned)),'a still click leaves the map alone');
  // Drag wider: the left edge stays put, the text and its table fill the panel, the map re-fits to what is left, the width is remembered.
  await p.evaluate(()=>fit(ENTRIES[cur],false));await dragGrip(p,150);
  a=await report(p);
  assert.equal(a.width,710);assert.equal(a.leftGap,0);assert.equal(a.saved,'710');assert.equal(a.now,710);assert.equal(a.leafletWidth,a.mapWidth);assert.ok(a.sees&&a.fits&&!a.dragging,JSON.stringify(a));
  assert.ok(await p.evaluate(()=>{const t=card.querySelector('.scene-passage.current table')||card.querySelector('table');return !!t&&t.getBoundingClientRect().right<=reader.getBoundingClientRect().right;}),'the table stays inside the panel');
  
  // Mid-drag the panel follows the pointer and nothing is saved until release.
  const g1=await gripAt(p);await p.mouse.move(g1.x,g1.y);await p.mouse.down();await p.mouse.move(g1.x+60,g1.y,{steps:3});
  await p.waitForFunction(()=>Math.round(reader.getBoundingClientRect().width)===770);
  a=await report(p);assert.ok(a.dragging);assert.equal(a.saved,'710');await p.mouse.up();
  a=await report(p);assert.equal(a.width,770);assert.equal(a.saved,'770');assert.ok(!a.dragging);
  // Reading position: the text at the top of the panel is still there after the width changes, both ways, in prose and in the table.
  for(const [selector,index] of [['.scene-passage.current tr',3],['.scene-passage:not(.off-station)>p',2],['.scene-passage:not(.off-station)>p',0]]){
   assert.ok(await pinTop(p,selector,index),selector+' can be scrolled to the top');
   await dragGrip(p,-120);let held=await pinnedAtTop(p);assert.ok(held.holds,selector+' narrower '+JSON.stringify(held));
   await dragGrip(p,120);held=await pinnedAtTop(p);assert.ok(held.holds,selector+' wider '+JSON.stringify(held));
  }
  // The limits: the map keeps its share and the legend stays uncovered; the text stays readable.
  await dragGrip(p,2000);a=await report(p);
  assert.equal(a.width,max,'widest');assert.equal(+a.saved,max);assert.ok(a.legendLeft>=a.readerRight,JSON.stringify(a));assert.ok(a.fits,JSON.stringify(a));
  
  await dragGrip(p,-2000);a=await report(p);
  assert.equal(a.width,MIN,'narrowest');assert.equal(+a.saved,MIN);assert.equal(a.leftGap,0);assert.ok(a.fits,JSON.stringify(a));
  
  // Keys: right widens because the edge is on the right; they do not change scenes or stations. Enter restores.
  const scene=a.scene,id=a.id;await p.focus('#readerGrip');
  await p.keyboard.press('ArrowRight');a=await report(p);assert.equal(a.width,MIN+16);assert.equal(a.scene,scene,'grip keys do not change scenes');assert.equal(a.id,id);
  await p.keyboard.press('ArrowLeft');a=await report(p);assert.equal(a.width,MIN);
  await p.keyboard.down('Shift');await p.keyboard.press('ArrowRight');await p.keyboard.up('Shift');a=await report(p);assert.equal(a.width,MIN+64);
  await p.keyboard.press('End');a=await report(p);assert.equal(a.width,max);assert.equal(a.now,max);
  await p.keyboard.press('Home');a=await report(p);assert.equal(a.width,MIN);
  await p.keyboard.press('Enter');a=await report(p);assert.equal(a.width,DEFAULT);assert.equal(a.saved,null);assert.equal(a.id,'history-britain-jeanne');assert.equal(a.scene,scene);
  // Double-click restores too.
  await dragGrip(p,100);a=await report(p);assert.equal(a.width,DEFAULT+100);
  const g2=await gripAt(p);await p.mouse.click(g2.x,g2.y,{count:2});a=await report(p);assert.equal(a.width,DEFAULT);assert.equal(a.saved,null);
  // Remembered across scenes, entries and reloads; the first fit after a reload already knows the width.
  await dragGrip(p,136);
  await p.evaluate(()=>go('history-rome-punic',{scene:1}));a=await report(p);assert.equal(a.width,DEFAULT+136);assert.ok(a.sees&&a.fits,JSON.stringify(a));
  await p.reload({waitUntil:'domcontentloaded'});await p.evaluate(()=>document.fonts.ready);
  a=await report(p);assert.equal(a.width,DEFAULT+136);assert.ok(a.sees,JSON.stringify(a));assert.equal(a.leafletWidth,a.mapWidth);
  // Outside 历史进程 the index column takes room from the same stage; a wide reader gives way only for as long as it must.
  await dragGrip(p,2000);a=await report(p);const widest=a.width;
  await p.evaluate(()=>go('overview'));a=await report(p);assert.equal(a.width,a.stage-MAP_KEPT);assert.ok(a.width<widest,JSON.stringify(a));assert.ok(a.fits,JSON.stringify(a));
  const sg=await p.$eval('#sideGrip',e=>{const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
  await p.mouse.move(sg.x,sg.y);await p.mouse.down();await p.mouse.move(sg.x+150,sg.y,{steps:4});await p.mouse.up();
  a=await report(p);assert.equal(a.width,a.stage-MAP_KEPT);assert.equal(a.leafletWidth,a.mapWidth);
  await p.$eval('#sideGrip',e=>e.dispatchEvent(new MouseEvent('dblclick',{bubbles:true})));
  await p.evaluate(()=>go('history-rome-punic',{scene:1}));a=await report(p);assert.equal(a.width,widest,'back in 历史进程, back to full width');
  // Same for the window: smaller squeezes it, larger gives it back, and neither touches what is saved.
  await p.setViewport({width:1000,height:760});await p.waitForFunction(()=>innerWidth===1000);
  a=await report(p);assert.equal(a.width,a.stage-MAP_KEPT);assert.equal(+a.saved,widest);assert.ok(a.legendLeft>=a.readerRight&&a.fits,JSON.stringify(a));
  
  await p.setViewport({width:1440,height:900});await p.waitForFunction(()=>innerWidth===1440);
  a=await report(p);assert.equal(a.width,widest);
  // The phone layouts lay the panel out by themselves, and ignore a saved width.
  for(const [w,h,label,expected] of [[390,844,'phone',390],[812,375,'short landscape',357]]){
   const m=await pageAt(w,h);
   assert.ok(await m.evaluate(k=>{localStorage.setItem(k,'700');return true;},KEY));
   await m.reload({waitUntil:'domcontentloaded'});await m.evaluate(()=>document.fonts.ready);
   a=await report(m);assert.ok(!a.gripVisible,label);assert.equal(a.width,expected,label);assert.ok(a.fits,label+JSON.stringify(a));
   
   await m.evaluate(k=>localStorage.removeItem(k),KEY);await m.close();
  }
  await p.close();
  // A small desktop starts narrower, and comes back to that on restore.
  const small=await pageAt(1024,768);
  a=await report(small);assert.equal(a.width,400);assert.ok(a.gripVisible);
  await dragGrip(small,100);a=await report(small);assert.equal(a.width,500);assert.ok(a.fits);
  const g3=await gripAt(small);await small.mouse.click(g3.x,g3.y,{count:2});a=await report(small);assert.equal(a.width,400);assert.equal(a.saved,null);
  await small.close();
  // Page zoom (老无 2026-11-16): desktop only and kept per viewer; the zoomed page still fills the window,
  // every grip and drag follows the pointer, widths come back after a reload, a trackpad pinch follows the fingers.
  {
   const z=await pageAt(1411,651,'#history-farming/1');await z.waitForFunction(()=>window.metroUI);
   const zs=()=>z.evaluate(()=>({z:window.atlasUiZoom,value:document.getElementById('uiZoomValue').textContent,body:Math.round(document.body.getBoundingClientRect().height),inner:innerHeight,
    scroll:document.documentElement.scrollWidth,saved:localStorage.getItem('atlas-ui-zoom-v1'),footer:!!document.querySelector('.network-footer,#datasetStats'),shown:document.getElementById('uiZoom').checkVisibility()}));
   let s=await zs();assert.equal(s.z,1);assert.ok(s.shown,'the zoom control shows on a desktop');assert.equal(s.footer,false,'no stats strip under the network map');
   await z.click('#uiZoomOut');await z.click('#uiZoomOut');s=await zs();
   assert.equal(s.z,.8);assert.equal(s.value,'80%');assert.equal(s.saved,'0.8');assert.ok(Math.abs(s.body-s.inner)<=1,'the zoomed page fills the window '+JSON.stringify(s));assert.ok(s.scroll<=1411,'no sideways scroll');
   let g=await gripAt(z);await dragGrip(z,60);let g2=await gripAt(z);assert.ok(Math.abs(g2.x-g.x-60)<=2,'the reader grip follows the pointer at 80%: '+(g2.x-g.x));
   const readerW=(await report(z)).width;
   await z.click('#tGeography');await z.waitForFunction(()=>document.getElementById('sideGrip').checkVisibility());
   const sideAt=()=>z.$eval('#sideGrip',e=>{const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2,w:Math.round(document.getElementById('side').getBoundingClientRect().width)};});
   let sg=await sideAt();await z.mouse.move(sg.x,sg.y);await z.mouse.down();await z.mouse.move(sg.x+20,sg.y,{steps:4});await z.mouse.move(sg.x+40,sg.y,{steps:4});await z.mouse.up();
   let sg2=await sideAt();assert.ok(Math.abs(sg2.x-sg.x-40)<=2,'the index grip follows the pointer at 80%: '+(sg2.x-sg.x));
   await z.reload({waitUntil:'domcontentloaded'});await z.waitForFunction(()=>window.metroUI);s=await zs();assert.equal(s.z,.8,'the zoom is kept');
   assert.ok(Math.abs((await report(z)).width-readerW)<=2,'the reader width is kept at 80%');
   await z.click('#tGeography');await z.waitForFunction(()=>document.getElementById('sideGrip').checkVisibility());assert.ok(Math.abs((await sideAt()).w-sg2.w)<=2,'the index width is kept at 80%');
   await z.click('#tHistory');await z.evaluate(()=>metroUI.setMode('network'));await new Promise(r=>setTimeout(r,500));
   const pct=()=>z.$eval('.zoom-tools output',e=>parseFloat(e.textContent));
   const node=()=>z.evaluate(()=>{const b=document.querySelector('.metro-node[data-key="history-faith-crusade/0"]').getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}});
   const cv=await z.$eval('#networkCanvas',e=>{const b=e.getBoundingClientRect();return {x:b.left+b.width*.45,y:b.top+b.height*.5}});
   let n0=await node();await z.mouse.move(cv.x,cv.y);await z.mouse.down();await z.mouse.move(cv.x+60,cv.y+20,{steps:4});await z.mouse.move(cv.x+120,cv.y+40,{steps:4});await z.mouse.up();
   let n1=await node();assert.ok(Math.abs(n1.x-n0.x-120)<=3&&Math.abs(n1.y-n0.y-40)<=3,'the network map follows the pointer at 80%: '+JSON.stringify([n1.x-n0.x,n1.y-n0.y]));
   const open=await z.evaluate(()=>{const c=document.getElementById('networkCanvas').getBoundingClientRect();for(const n of document.querySelectorAll('.metro-node')){const b=n.getBoundingClientRect(),x=b.left+b.width/2,y=b.top+b.height/2;if(x>c.left+80&&x<c.right-80&&y>c.top+60&&y<c.bottom-60&&document.elementFromPoint(x,y)?.closest('.metro-node')===n)return n.dataset.key}});
   assert.ok(open,'an uncovered station');const at=()=>z.evaluate(k=>{const b=document.querySelector(`.metro-node[data-key="${k}"]`).getBoundingClientRect();return {x:b.left+b.width/2,y:b.top+b.height/2}},open);
   n0=await at();let q0=await pct();await z.mouse.move(n0.x+1,n0.y+1);await z.mouse.wheel({deltaY:-100});await new Promise(r=>setTimeout(r,300));n1=await at();
   assert.ok(await pct()>q0,'the wheel zooms in');assert.ok(Math.hypot(n1.x-n0.x,n1.y-n0.y)<=4,'wheel zoom keeps the point under the pointer at 80%');
   // A trackpad pinch is ctrl + wheel with deltaY = −100·ln(scale): the map scales by exactly that; a plain wheel notch keeps its old step.
   await z.evaluate(()=>{window.__dy=0;document.getElementById('networkCanvas').addEventListener('wheel',e=>{window.__dy+=e.deltaY},{capture:true})});
   await z.mouse.move(cv.x,cv.y);let p0=await pct();await z.keyboard.down('Control');for(let i=0;i<10;i++)await z.mouse.wheel({deltaY:-5});await z.keyboard.up('Control');await new Promise(r=>setTimeout(r,300));
   let p1=await pct(),dy=await z.evaluate(()=>window.__dy);assert.ok(dy<0);assert.ok(Math.abs(p1/p0/Math.exp(-dy*.01)-1)<.03,'pinch follows the fingers: '+p0+'% → '+p1+'% for deltaY '+dy);
   await z.evaluate(()=>{window.__dy=0});p0=await pct();await z.mouse.wheel({deltaY:100});await new Promise(r=>setTimeout(r,300));
   p1=await pct();dy=await z.evaluate(()=>window.__dy);assert.ok(Math.abs(p1/p0/Math.exp(-dy*.0015)-1)<.03,'a wheel notch keeps its step: '+p0+'% → '+p1+'%');
   await z.click('#uiZoomReset');s=await zs();assert.equal(s.z,1);assert.equal(s.value,'100%');assert.equal(s.saved,null,'100% is the default, nothing kept');
   await z.click('#uiZoomIn');await z.setViewport({width:390,height:844});await new Promise(r=>setTimeout(r,400));s=await zs();
   assert.equal(s.z,1,'phones are never zoomed');assert.equal(s.shown,false,'no zoom control on a phone');assert.equal(s.footer,false);
   await z.evaluate(()=>localStorage.clear());await z.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: reader width — text left of the map; drag, keys, double-click, limits, reading position, memory, index column and window squeeze, phone layouts; desktop page zoom (grips, network drag, wheel and pinch, memory, phones unzoomed), no network stats strip');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');}
})();
