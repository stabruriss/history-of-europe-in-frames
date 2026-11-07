const puppeteer=require('puppeteer-core');require('./legacy_sidebar.cjs');
const assert=require('node:assert/strict');

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
  await page.setOfflineMode(true);await page.evaluateOnNewDocument(full=>{window.addEventListener('DOMContentLoaded',()=>{const n=document.getElementById('mapnote');if(n)n.hidden=false;if(typeof map!=='undefined'){if(typeof tiles!=='undefined')map.removeLayer(tiles);if(typeof closeTerrain!=='undefined')map.removeLayer(closeTerrain);if(!full)for(const l of Object.values(map._layers)){const kp=l.options?.pane;if(kp==='fallbackPane'||kp==='baseLabelPane'||(kp==='riverPane'&&!group.hasLayer(l))){l._project=()=>{};l._update=()=>{};l._setPos=()=>{};}}}});},false);
  await page.goto(url+'#history-spartan-decline',{waitUntil:'domcontentloaded'});return page;
 }
 try{
  const page=await pageAt();
  const occurrences=await page.evaluate(()=>Object.entries(FIGURE_SCENES).flatMap(([scene,items])=>items.map(item=>({scene,...item}))));
  assert.equal(occurrences.length,909);assert.equal(new Set(occurrences.map(p=>p.id)).size,491);
  assert.equal(await page.evaluate(()=>Object.keys(FIGURES).length),491);
  await page.evaluate(occurrences=>{for(const item of occurrences){
   go(item.scene);
   const [entry,index]=item.scene.split('/'),p=FIGURES[item.id];
   if(!(ENTRIES[cur].id===entry&&sceneIndex===+index&&p.name&&p.en&&p.life&&p.bio&&p.sources.length>0))throw new Error('meta '+item.id);
   const card=document.querySelector(`.person-card[data-person="${item.id}"]`);
   if(!card||card.open!==false)throw new Error('closed '+item.id);
   card.querySelector('summary').click();
   if(card.open!==true||document.querySelectorAll('.person-card[open]').length!==1)throw new Error('open '+item.id);
   if(![...card.querySelectorAll('a:not(.xref)')].every(a=>a.href.startsWith('https://')&&a.rel.includes('noopener')&&a.rel.includes('noreferrer')&&a.checkVisibility()))throw new Error('links '+item.id);
   card.querySelector('.person-map').click();
   const where=FIGURE_PLACES[item.place||p.place];
   if(!(map._popup?.isOpen()&&map._popup.getLatLng().equals(where.ll)&&map._popup.getContent().includes(p.name)))throw new Error('popup '+item.id);
   document.getElementById('tFit').click();
   if(map._popup?.isOpen()||!map.getBounds().contains(L.latLngBounds(activeScene(ENTRIES[cur]).view)))throw new Error('fit '+item.id);
  }},occurrences);
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
   await p.$eval('[data-person="socrates"] .person-map',e=>e.click());if(false)await wait(400);
   const layout=await p.evaluate(()=>{
    const c=document.querySelector('[data-person="socrates"]'),r=reader.getBoundingClientRect(),popup=document.querySelector('.leaflet-popup').getBoundingClientRect(),zoom=document.querySelector('.leaflet-control-zoom').getBoundingClientRect();
    return {pageFits:document.documentElement.scrollWidth<=innerWidth,bodyFits:readerBody.scrollWidth<=readerBody.clientWidth+1,
     cardFits:c.scrollWidth<=c.clientWidth+1,popupVisible:popup.left>=0&&popup.right<=innerWidth&&popup.top>=0&&popup.bottom<=innerHeight,
     noReaderOverlap:popup.right<=r.left||popup.left>=r.right||popup.bottom<=r.top||popup.top>=r.bottom,
     noZoomOverlap:popup.right<=zoom.left||popup.left>=zoom.right||popup.bottom<=zoom.top||popup.top>=zoom.bottom,
     debug:{popup:{left:popup.left,right:popup.right,top:popup.top,bottom:popup.bottom},reader:{left:r.left,right:r.right,top:r.top,bottom:r.bottom}}};
   });
   assert.ok(layout.pageFits&&layout.bodyFits&&layout.cardFits&&layout.popupVisible&&layout.noReaderOverlap&&layout.noZoomOverlap,width+'x'+height+': '+JSON.stringify(layout));
   
   await p.evaluate(()=>go('history-macedonian-rise'));
   assert.equal(await p.$$eval('#peopleCards .person-card',es=>es.length),5);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&readerBody.scrollWidth<=readerBody.clientWidth+1),true);
   await p.close();
  }
  const animated=await pageAt(1440,960,false);
  await animated.waitForFunction(()=>pending===null);
  await animated.evaluate(()=>{focusFigure(FIGURE_SCENES['history-spartan-decline/0'][0]);go('history-migration');});
  await animated.waitForFunction(()=>pending===null);await wait(250);assert.equal(await animated.evaluate(()=>Boolean(map._popup?.isOpen())),false);
  await animated.close();assert.deepEqual(errors,[]);
  console.log('PASS: 491 people / events across 909 dated cards; expandable sources; one-open-card behavior; keyboard; restored fold state; city map popups; return to scene; stage switching; phones and landscape; offline; stale popup cancellation; no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})().catch(e=>{console.error(e);process.exitCode=1;});
