const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'))).href;
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 try{
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:1440,height:960});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.setRequestInterception(true);page.on('request',r=>/^https?:/.test(r.url())?r.abort():r.continue());
  await page.goto(url+'#history-migration',{waitUntil:'domcontentloaded'});
  const report=await page.evaluate(()=>{
   const oldIDs=['migration','farming','palaces','collapse','dark-age','poleis','sparta','athens','persian-wars','leagues','peloponnesian-war','spartan-decline','macedonian-rise'].map(s=>'history-'+s);
   const chars=html=>{const div=document.createElement('div');div.innerHTML=html;return div.textContent.replace(/\s/g,'').length;};
   let coverage=0;
   for(const e of HISTORY_ENTRIES)for(let i=0;i<e.scenes.length;i++){
    const matches=HISTORY_ERAS.flatMap(era=>era.items.filter(([id,from=0,to=Infinity])=>id===e.id&&i>=from&&i<=to));
    if(matches.length!==1)throw new Error('Era coverage: '+e.id+'/'+i);
    go(e.id,{scene:i});
    if(document.querySelectorAll('#toc .chip.on').length!==1)throw new Error('Selected period: '+e.id+'/'+i);
    if(document.querySelector('#toc .active-era')?.dataset.era!==document.querySelector('#toc .chip.on')?.dataset.era)throw new Error('Current era does not contain active scene');
    if(mobileToc.selectedOptions[0].dataset.id!==e.id)throw new Error('Mobile period mismatch');
    coverage++;
   }
   return {oldChars:8419,newChars:HISTORY_ENTRIES.filter(e=>oldIDs.includes(e.id)).reduce((n,e)=>n+chars(e.html),0),coverage,eras:HISTORY_ERAS.length};
  });
  assert.ok(report.newChars<=report.oldChars/3,'Existing prose exceeds one-third: '+JSON.stringify(report));
  assert.equal(report.coverage,193);assert.equal(report.eras,18);
  const concise = await page.evaluate(() => {
   const entries=HISTORY_ENTRIES.filter(e=>e.ch===3);
   return entries.map(e=>{const p=document.createElement('div');p.innerHTML=e.html;return {id:e.id,chars:p.textContent.replace(/\s/g,'').length};});
  });
  assert.equal(concise.length,7);
  assert.ok(concise.every(e=>e.chars<=200),JSON.stringify(concise));
  await page.evaluate(()=>go('history-celts',{scene:1}));
  assert.match(await page.$eval('#sceneContext',e=>e.textContent),/278／277/);
  assert.match(await page.$eval('#card',e=>e.textContent),/加拉太/);
  assert.equal(await page.$$eval('#toc .chip small',es=>es.length===67&&es.every(e=>!e.textContent.includes('undefined'))),true);
  assert.equal(await page.$eval('details.sources',e=>e.open),false);
  assert.equal(await page.$eval('.active-era',e=>e.dataset.era),'hellenistic');
  assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),'希腊化时期 · 第四章');

  // A single chapter crosses an era boundary in both navigation surfaces.
  for(const [era,id,scene] of [['archaic','history-persian-wars',0],['classical','history-persian-wars',3],['prehistory','history-farming',0],['bronze','history-farming',1]]){
   await page.$eval(`#toc .chip[data-era="${era}"][data-id="${id}"]`,el=>el.click());
   assert.equal(await page.evaluate(()=>sceneIndex),scene);
   assert.equal(await page.$eval('.active-era',el=>el.dataset.era),era);
  }
  await page.evaluate(()=>go('history-alexander-rule'));
  assert.equal(await page.$eval('details.sources',e=>e.open),false);
  await page.$eval('details.sources summary',e=>e.click());
  assert.ok(await page.$$eval('details.sources a',es=>es.length===5&&es.every(e=>e.checkVisibility())));
  await page.$eval('[data-person-target="callisthenes"]',e=>e.click());
  assert.equal(await page.evaluate(()=>sceneIndex),1);
  assert.equal(await page.$eval('[data-person="callisthenes"]',e=>e.open),true);
  assert.match(await page.$eval('[data-person="callisthenes"]',e=>e.textContent),/外甥孙/);
  assert.match(await page.$eval('[data-person="callisthenes"]',e=>e.textContent),/少一个吻/);
  await page.setViewport({width:390,height:844});
  await page.select('#mobileToc','history-persian-wars/3');
  assert.equal(await page.evaluate(()=>sceneIndex),3);
  await page.select('#mobileToc','history-successors/0');
  for(let scene=0;scene<3;scene++){
   await page.evaluate(scene=>go('history-successors',{scene}),scene);
   assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&readerBody.scrollWidth<=readerBody.clientWidth+1));
   assert.ok(await page.evaluate(()=>map.getBounds().contains(L.latLngBounds(activeScene(ENTRIES[cur]).view))));
  }

  for (const [width,height] of [[1440,960],[390,844],[740,390]]) {
   await page.setViewport({width,height});
   // Wait for Leaflet and the existing 150 ms resize handler to settle.
   await page.waitForFunction(()=>map.getSize().x===map.getContainer().clientWidth&&map.getSize().y===map.getContainer().clientHeight&&map.getBounds().contains(L.latLngBounds(activeScene(ENTRIES[cur]).view)));
   for(const id of await page.evaluate(()=>HISTORY_ENTRIES.filter(e=>e.ch===3).map(e=>e.id))) {
    const sceneCount=await page.evaluate(id=>HISTORY_ENTRIES.find(e=>e.id===id).scenes.length,id);
    for(let scene=0;scene<sceneCount;scene++) {
     await page.evaluate(({id,scene})=>go(id,{scene}),{id,scene});
     assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&readerBody.scrollWidth<=readerBody.clientWidth+1),id+'/'+scene);
     assert.ok(await page.evaluate(()=>map.getBounds().contains(L.latLngBounds(activeScene(ENTRIES[cur]).view))),id+'/'+scene+' map');
     assert.equal(await page.$$eval('.person-card[open]',es=>es.length),0);
    }
   }
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: '+JSON.stringify(report)+'; all scene-to-era mappings; chapter splits; mobile optgroups; folded references; Callisthenes deep link; new map stages; offline; no page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
