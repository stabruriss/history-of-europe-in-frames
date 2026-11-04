// The reader (main text panel) can be dragged wider or narrower from its left edge. Run with FULL_SHOTS=1 to write screenshots.
const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'))).href;
const shots=path.join(__dirname,'shots-reader-width');
const shot=async(p,name)=>{if(process.env.FULL_SHOTS==='1'){fs.mkdirSync(shots,{recursive:true});if(process.env.FULL_SHOTS==='1')await p.screenshot({path:path.join(shots,name+'.png')});}};
const KEY='agora-atlas-reader-width',TABLE='#history-britain-jeanne/6',MIN=280,MAP_KEPT=332;
const report=p=>p.evaluate(()=>{
 const r=reader.getBoundingClientRect(),stage=document.getElementById('mapwrap').getBoundingClientRect(),g=document.getElementById('readerGrip'),gr=g.getBoundingClientRect(),legend=document.getElementById('legendBox').getBoundingClientRect();
 return {width:Math.round(r.width),left:r.left,rightGap:Math.round(stage.right-r.right),stage:Math.round(stage.width),gripLeftGap:gr.left-r.left,gripVisible:g.checkVisibility(),legendRight:legend.right,
  saved:localStorage.getItem('agora-atlas-reader-width'),now:+g.getAttribute('aria-valuenow'),max:+g.getAttribute('aria-valuemax'),padRight:viewportPadding().paddingBottomRight[0],
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
  // The default: 366px, with a reachable grip on the left edge and an accurate separator role.
  let a=await report(p);const stage=a.stage,max=stage-MAP_KEPT;
  assert.equal(a.width,366);assert.equal(a.rightGap,16);assert.equal(a.gripLeftGap,-6);assert.equal(a.saved,null);assert.equal(a.now,366);assert.equal(a.max,max);
  const g0=await gripAt(p);
  assert.ok(await p.evaluate(({x,y})=>{const e=document.elementFromPoint(x,y),g=document.getElementById('readerGrip');return e===g&&g.getAttribute('role')==='separator'&&g.getAttribute('aria-valuemin')==='280'&&getComputedStyle(g).cursor==='col-resize';},g0));
  await shot(p,'default');
  // A click that does not move changes nothing: not the width, not the store, not a map the reader has panned.
  await p.evaluate(()=>{window.__panned=map.containerPointToLatLng([10,10]);map.panBy([140,60],{animate:false});window.__panned=map.getCenter();});
  await p.mouse.click(g0.x,g0.y);
  a=await report(p);assert.equal(a.width,366);assert.equal(a.saved,null);
  assert.ok(await p.evaluate(()=>map.getCenter().equals(window.__panned)),'a still click leaves the map alone');
  // Drag wider: the right edge stays put, the text and its table fill the panel, the map re-fits to what is left, the width is remembered.
  await p.evaluate(()=>fit(ENTRIES[cur],false));await dragGrip(p,-200);
  a=await report(p);
  assert.equal(a.width,566);assert.equal(a.rightGap,16);assert.equal(a.saved,'566');assert.equal(a.now,566);assert.equal(a.padRight,566+42);assert.ok(a.sees&&a.fits&&!a.dragging,JSON.stringify(a));
  assert.ok(await p.evaluate(()=>{const t=card.querySelector('.scene-passage.current table')||card.querySelector('table');return !!t&&t.getBoundingClientRect().right<=reader.getBoundingClientRect().right;}),'the table stays inside the panel');
  await shot(p,'wide-566');
  // Mid-drag the panel follows the pointer and nothing is saved until release.
  const g1=await gripAt(p);await p.mouse.move(g1.x,g1.y);await p.mouse.down();await p.mouse.move(g1.x-60,g1.y,{steps:3});
  await p.waitForFunction(()=>Math.round(reader.getBoundingClientRect().width)===626);
  a=await report(p);assert.ok(a.dragging);assert.equal(a.saved,'566');await p.mouse.up();
  a=await report(p);assert.equal(a.width,626);assert.equal(a.saved,'626');assert.ok(!a.dragging);
  // Reading position: the text at the top of the panel is still there after the width changes, both ways, in prose and in the table.
  for(const [selector,index] of [['.scene-passage.current tr',3],['.scene-passage p',2],['.scene-passage p',0]]){
   assert.ok(await pinTop(p,selector,index),selector+' can be scrolled to the top');
   await dragGrip(p,120);let held=await pinnedAtTop(p);assert.ok(held.holds,selector+' narrower '+JSON.stringify(held));
   await dragGrip(p,-120);held=await pinnedAtTop(p);assert.ok(held.holds,selector+' wider '+JSON.stringify(held));
  }
  // The limits: the map keeps its share and the legend stays uncovered; the text stays readable.
  await dragGrip(p,-2000);a=await report(p);
  assert.equal(a.width,max,'widest');assert.equal(+a.saved,max);assert.ok(a.left>=a.legendRight,JSON.stringify(a));assert.ok(a.fits&&a.padRight<stage,JSON.stringify(a));
  await shot(p,'widest');
  await dragGrip(p,2000);a=await report(p);
  assert.equal(a.width,MIN,'narrowest');assert.equal(+a.saved,MIN);assert.equal(a.rightGap,16);assert.ok(a.fits,JSON.stringify(a));
  await shot(p,'narrowest');
  // Keys: left widens because the edge is on the left; they do not change scenes. Enter restores.
  const scene=a.scene;await p.focus('#readerGrip');
  await p.keyboard.press('ArrowLeft');a=await report(p);assert.equal(a.width,MIN+16);assert.equal(a.scene,scene,'grip keys do not change scenes');
  await p.keyboard.press('ArrowRight');a=await report(p);assert.equal(a.width,MIN);
  await p.keyboard.down('Shift');await p.keyboard.press('ArrowLeft');await p.keyboard.up('Shift');a=await report(p);assert.equal(a.width,MIN+64);
  await p.keyboard.press('End');a=await report(p);assert.equal(a.width,max);assert.equal(a.now,max);
  await p.keyboard.press('Home');a=await report(p);assert.equal(a.width,MIN);
  await p.keyboard.press('Enter');a=await report(p);assert.equal(a.width,366);assert.equal(a.saved,null);assert.equal(a.id,'history-britain-jeanne');assert.equal(a.scene,scene);
  // Double-click restores too.
  await dragGrip(p,-150);a=await report(p);assert.equal(a.width,516);
  const g2=await gripAt(p);await p.mouse.click(g2.x,g2.y,{count:2});a=await report(p);assert.equal(a.width,366);assert.equal(a.saved,null);
  // Remembered across scenes, entries and reloads; the first fit after a reload already knows the width.
  await dragGrip(p,-230);
  await p.evaluate(()=>go('history-rome-punic',{scene:1}));a=await report(p);assert.equal(a.width,596);assert.ok(a.sees&&a.fits,JSON.stringify(a));
  await p.reload({waitUntil:'domcontentloaded'});await p.evaluate(()=>document.fonts.ready);
  a=await report(p);assert.equal(a.width,596);assert.equal(a.padRight,596+42);assert.ok(a.sees,JSON.stringify(a));
  // Collapsing folds to the usual small header and hides the grip; expanding brings the chosen width back.
  await p.click('#readerToggle');a=await report(p);assert.equal(a.width,MIN);assert.ok(!a.gripVisible);
  await p.click('#readerToggle');a=await report(p);assert.equal(a.width,596);assert.ok(a.gripVisible);
  // A wider sidebar squeezes a wide reader only for as long as it needs the room, and the map fit knows.
  await dragGrip(p,-2000);a=await report(p);assert.equal(a.width,max);
  const sg=await p.$eval('#sideGrip',e=>{const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
  await p.mouse.move(sg.x,sg.y);await p.mouse.down();await p.mouse.move(sg.x+150,sg.y,{steps:4});await p.mouse.up();
  a=await report(p);assert.equal(a.width,a.stage-MAP_KEPT);assert.equal(a.padRight,a.width+42);assert.ok(a.width<max&&a.left>=a.legendRight,JSON.stringify(a));
  await p.focus('#readerGrip');assert.equal(await p.$eval('#readerGrip',e=>+e.getAttribute('aria-valuemax')),a.stage-MAP_KEPT,'aria follows the room there is');
  await p.$eval('#sideGrip',e=>e.dispatchEvent(new MouseEvent('dblclick',{bubbles:true})));
  a=await report(p);assert.equal(a.width,max,'sidebar back, reader back');
  // Same for the window: smaller squeezes it, larger gives it back, and neither touches what is saved.
  await p.setViewport({width:1000,height:760});await p.waitForFunction(()=>innerWidth===1000);
  a=await report(p);assert.equal(a.width,a.stage-MAP_KEPT);assert.equal(+a.saved,max);assert.ok(a.left>=a.legendRight&&a.fits,JSON.stringify(a));
  await shot(p,'squeezed-1000');
  await p.setViewport({width:1440,height:900});await p.waitForFunction(()=>innerWidth===1440);
  a=await report(p);assert.equal(a.width,max);
  // The phone layouts lay the panel out by themselves, and ignore a saved width.
  for(const [w,h,label,expected] of [[390,844,'phone',370],[812,375,'short landscape',240]]){
   const m=await pageAt(w,h);
   assert.ok(await m.evaluate(k=>{localStorage.setItem(k,'700');return true;},KEY));
   await m.reload({waitUntil:'domcontentloaded'});await m.evaluate(()=>document.fonts.ready);
   a=await report(m);assert.ok(!a.gripVisible,label);assert.equal(a.width,expected,label);assert.ok(a.fits,label+JSON.stringify(a));
   await shot(m,label.replace(' ','-'));
   await m.evaluate(k=>localStorage.removeItem(k),KEY);await m.close();
  }
  await p.close();
  // The small desktop default (320px) comes back on restore.
  const small=await pageAt(1024,768);
  a=await report(small);assert.equal(a.width,320);assert.ok(a.gripVisible);
  await dragGrip(small,-100);a=await report(small);assert.equal(a.width,420);assert.ok(a.fits);
  const g3=await gripAt(small);await small.mouse.click(g3.x,g3.y,{count:2});a=await report(small);assert.equal(a.width,320);assert.equal(a.saved,null);
  await small.close();
  assert.deepEqual(errors,[]);
  console.log('PASS: reader width — drag, keys, double-click, limits, reading position, memory, sidebar and window squeeze, collapsed and phone layouts');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');}
})();
