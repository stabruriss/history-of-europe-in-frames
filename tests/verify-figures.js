const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
require('node:fs').mkdirSync(require('node:path').join(__dirname,'shots'),{recursive:true});
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'))).href;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 async function pageAt(width=1440,height=960,reduced=true){
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width,height});
  if(reduced)await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.setRequestInterception(true);page.on('request',r=>/^https?:/.test(r.url())?r.abort():r.continue());
  await page.goto(url+'#history-spartan-decline',{waitUntil:'domcontentloaded'});return page;
 }
 try{
  const page=await pageAt();
  const occurrences=await page.evaluate(()=>Object.entries(FIGURE_SCENES).flatMap(([scene,items])=>items.map(item=>({scene,...item}))));
  assert.equal(occurrences.length,233);assert.equal(new Set(occurrences.map(p=>p.id)).size,176);
  assert.equal(await page.evaluate(()=>Object.keys(FIGURES).length),176);
  for(const item of occurrences){
   await page.evaluate(scene=>go(scene),item.scene);
   assert.equal(await page.evaluate(({scene,id})=>{
    const [entry,index]=scene.split('/'),p=FIGURES[id];
    return ENTRIES[cur].id===entry&&sceneIndex===+index&&p.name&&p.en&&p.life&&p.bio&&p.sources.length>0;
   },item),true);
   const selector=`.person-card[data-person="${item.id}"]`;
   assert.equal(await page.$eval(selector,e=>e.open),false);
   await page.$eval(selector+' summary',e=>e.click());
   assert.equal(await page.$eval(selector,e=>e.open),true);
   assert.equal(await page.$$eval('.person-card[open]',es=>es.length),1);
   assert.equal(await page.$$eval(selector+' a',es=>es.every(a=>a.href.startsWith('https://')&&a.rel.includes('noopener')&&a.rel.includes('noreferrer')&&a.checkVisibility())),true);
   await page.$eval(selector+' .person-map',e=>e.click());
   await page.waitForFunction(()=>map._popup?.isOpen());
   assert.equal(await page.evaluate(item=>{
    const p=FIGURES[item.id],where=FIGURE_PLACES[item.place||p.place];
    return map._popup.getLatLng().equals(where.ll)&&map._popup.getContent().includes(p.name);
   },item),true);
   await page.click('#tFit');assert.equal(await page.evaluate(()=>Boolean(map._popup?.isOpen())),false);
   assert.ok(await page.evaluate(()=>map.getBounds().contains(L.latLngBounds(activeScene(ENTRIES[cur]).view))));
  }
  await page.evaluate(()=>go('history-spartan-decline'));
  assert.match(await page.$eval('[data-person="socrates"]',e=>e.textContent),/前399年/);
  assert.match(await page.$eval('[data-person="socrates"]',e=>e.textContent),/前403年民主恢复/);
  await page.focus('[data-person="socrates"] summary');await page.keyboard.press('Enter');
  assert.equal(await page.$eval('[data-person="socrates"]',e=>e.open),true);
  await page.click('[data-person="plato"] summary');
  assert.equal(await page.$eval('[data-person="socrates"]',e=>e.open),false);
  await page.click('#readerToggle');await page.click('#readerToggle');
  assert.equal(await page.$eval('[data-person="plato"]',e=>e.open),true);
  await page.evaluate(()=>{readerBody.scrollTop=400;go('history-spartan-decline',{scene:3});});
  assert.ok(await page.$eval('#sceneContext',e=>e.dataset.sceneText==='3'));
  assert.ok(await page.evaluate(()=>{const b=readerBody.getBoundingClientRect(),t=document.querySelector('#sceneContext .passage-title').getBoundingClientRect();return t.top>=b.top-1&&t.top<b.bottom;}));
  assert.equal(await page.$('[data-person="socrates"]'),null);
  assert.ok(await page.$('[data-person="aristippus"]'));
  await page.evaluate(()=>go('history-migration'));assert.equal(await page.$eval('#peopleCards',e=>e.hidden),true);
  await page.evaluate(()=>go('overview'));assert.equal(await page.$('#peopleCards'),null);
  await page.close();
  for(const [width,height] of [[390,844],[360,667],[740,390]]){
   const p=await pageAt(width,height);
   await p.click('[data-person="socrates"] summary');
   await p.$eval('[data-person="socrates"] .person-map',e=>e.click());await wait(400);
   const layout=await p.evaluate(()=>{
    const c=document.querySelector('[data-person="socrates"]'),r=reader.getBoundingClientRect(),popup=document.querySelector('.leaflet-popup').getBoundingClientRect(),zoom=document.querySelector('.leaflet-control-zoom').getBoundingClientRect();
    return {pageFits:document.documentElement.scrollWidth<=innerWidth,bodyFits:readerBody.scrollWidth<=readerBody.clientWidth+1,
     cardFits:c.scrollWidth<=c.clientWidth+1,popupVisible:popup.left>=0&&popup.right<=innerWidth&&popup.top>=0&&popup.bottom<=innerHeight,
     noReaderOverlap:popup.right<=r.left||popup.left>=r.right||popup.bottom<=r.top||popup.top>=r.bottom,
     noZoomOverlap:popup.right<=zoom.left||popup.left>=zoom.right||popup.bottom<=zoom.top||popup.top>=zoom.bottom,
     debug:{popup:{left:popup.left,right:popup.right,top:popup.top,bottom:popup.bottom},reader:{left:r.left,right:r.right,top:r.top,bottom:r.bottom}}};
   });
   assert.ok(layout.pageFits&&layout.bodyFits&&layout.cardFits&&layout.popupVisible&&layout.noReaderOverlap&&layout.noZoomOverlap,width+'x'+height+': '+JSON.stringify(layout));
   await p.screenshot({path:path.join(__dirname,'shots',`figures-${width}x${height}.png`)});
   await p.evaluate(()=>go('history-macedonian-rise'));
   assert.equal(await p.$$eval('.person-card',es=>es.length),5);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&readerBody.scrollWidth<=readerBody.clientWidth+1),true);
   await p.close();
  }
  const animated=await pageAt(1440,960,false);
  await animated.waitForFunction(()=>pending===null);
  await animated.evaluate(()=>{focusFigure(FIGURE_SCENES['history-spartan-decline/0'][0]);go('history-migration');});
  await wait(1600);assert.equal(await animated.evaluate(()=>Boolean(map._popup?.isOpen())),false);
  await animated.close();assert.deepEqual(errors,[]);
  console.log('PASS: 176 people / events across 233 dated cards; expandable sources; one-open-card behavior; keyboard; restored fold state; city map popups; return to scene; stage switching; phones and landscape; offline; stale popup cancellation; no page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
