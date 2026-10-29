const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const url=pathToFileURL(target).href;
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const html=fs.readFileSync(target,'utf8');
[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].forEach((s,i)=>new vm.Script(s[1],{filename:'inline-'+i}));
assert.ok(!/tChrono|peakTimeline|高光年代|TIME_CH/.test(html));
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 async function newPage({width=1440,height=960,hash='',reduced=true,offline=true}={}){
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width,height});
  if(reduced)await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  if(offline){await page.setRequestInterception(true);page.on('request',r=>/^https?:/.test(r.url())?r.abort():r.continue());}
  await page.goto(url+hash,{waitUntil:'domcontentloaded'});
  return page;
 }
 async function checkLayout(page,label){
  const result=await page.evaluate(()=>{
   const r=reader.getBoundingClientRect(),b=readerBody.getBoundingClientRect(),m=map.getSize(),p=viewportPadding();
   const bounds=L.latLngBounds(activeScene(ENTRIES[cur]).view);
   const sw=map.latLngToContainerPoint(bounds.getSouthWest()),ne=map.latLngToContainerPoint(bounds.getNorthEast());
   const [l,t]=p.paddingTopLeft,[rr,bb]=p.paddingBottomRight;
   return {overflow:document.documentElement.scrollWidth>innerWidth,readerVisible:r.left>=0&&r.right<=innerWidth&&r.top>=0&&r.bottom<=innerHeight,
    contentHeight:b.height,freeWidth:m.x-l-rr,freeHeight:m.y-t-bb,
    fitted:sw.x>=l-2&&ne.x<=m.x-rr+2&&ne.y>=t-2&&sw.y<=m.y-bb+2,
    detail:{size:m,p,sw,ne},
    mapCentreTarget:document.elementFromPoint(document.getElementById('map').getBoundingClientRect().left+l+(m.x-l-rr)/2,document.getElementById('map').getBoundingClientRect().top+t+(m.y-t-bb)/2)?.closest('#reader,#side,#sceneRail')===null};
  });
  assert.ok(!result.overflow&&result.readerVisible,label+' viewport: '+JSON.stringify(result));
  assert.ok(result.freeWidth>100&&result.freeHeight>75,label+' usable map area: '+JSON.stringify(result));
  assert.ok(result.contentHeight>55,label+' scrollable reader: '+JSON.stringify(result));
  assert.ok(result.fitted,label+' map fitted away from reader: '+JSON.stringify(result));
 }
 try{
  const page=await newPage();
  const data=await page.evaluate(()=>({geo:ENTRIES.filter(e=>!isHistory(e)&&!isTopic(e)).length,topics:TOPIC_ENTRIES.length,history:HISTORY_ENTRIES.length,
   scenes:HISTORY_ENTRIES.reduce((n,e)=>n+e.scenes.length,0),refs:HISTORY_ENTRIES.reduce((n,e)=>n+e.sources.length,0),
   seas:Object.keys(MEDITERRANEAN_SEAS).length,islands:MEDITERRANEAN_ISLANDS.length,mode:viewMode,
   buttons:[...document.querySelectorAll('#modebar button')].map(b=>b.id),
   banner:document.getElementById('ghBanner')?.textContent.trim().replace(/\s+/g,' ')||'',
   bannerHref:document.getElementById('ghBanner')?.href||'',
   bannerIcon:!!document.querySelector('#ghBanner svg.gh-icon'),
   title:document.title,
   h1:document.querySelector('#side h1')?.firstChild.textContent||''}));
  assert.deepEqual(data,{geo:33,topics:8,history:122,scenes:462,refs:1105,seas:18,islands:35,mode:'history',
   buttons:['tHistory','tGeography','tTopics'],banner:'开源项目·欧洲历史笔记',
   bannerHref:'https://github.com/stabruriss/history-of-europe-in-frames',bannerIcon:true,
   title:'简明欧洲史图册',h1:'简明欧洲史图册'});
  assert.equal(await page.$eval('#prev',e=>e.disabled),true);
  assert.ok(await page.$$eval('.leaflet-fallback-pane path',e=>e.length)>0);
  // Every scene draws real, valid, named geometry; a missing region may not fail silently.
  const sceneReport=await page.evaluate(()=>{
   const report=[];
   for(const e of ENTRIES){
    const scenes=e.scenes||[e];
    scenes.forEach((s,i)=>{
     go(e.id,{scene:i});
     const ctx=makeCtx(e),reg=ctx.region,river=ctx.river;
     ctx.region=(key,...args)=>{if(!GEO.regions[key])throw new Error('Missing region '+key+' in '+e.id);return reg(key,...args);};
     ctx.river=(key,...args)=>{if(!GEO.rivers[key])throw new Error('Missing river '+key+' in '+e.id);return river(key,...args);};
     group.clearLayers();s.draw(ctx);
     if(!group.getLayers().length)throw new Error('Empty scene '+e.id+'/'+i);
     if(!map.getBounds().contains(L.latLngBounds(s.view)))throw new Error('View not fitted '+e.id+'/'+i);
     if(e.scenes&&!s.legend?.length)throw new Error('Missing legend '+e.id+'/'+i);
     if(e.scenes&&!document.getElementById('sceneContext').textContent.includes(s.date))throw new Error('Scene caption mismatch');
     report.push(e.id+'/'+i);
    });
   }
   return report;
  });
  assert.equal(sceneReport.length,527);
  await page.evaluate(()=>go('history-migration'));
  assert.equal(await page.$$eval('#toc .chip',es=>es.length),127);
  assert.equal(await page.$eval('#prev',e=>e.disabled),true);
  for(const id of await page.evaluate(()=>HISTORY_ENTRIES.map(e=>e.id))){
   await page.evaluate(id=>go(id),id);
   assert.equal(await page.evaluate(()=>document.querySelectorAll('#readerBody .sources a').length===ENTRIES[cur].sources.length),true);
   assert.equal(await page.$$eval('#readerBody .sources a',es=>es.every(a=>a.href.startsWith('https://')&&a.target==='_blank'&&a.rel.includes('noopener')&&a.rel.includes('noreferrer'))),true);
   assert.ok((await page.$eval('#card',e=>e.textContent.length))>100);
  }
  assert.equal(await page.$eval('#next',e=>e.disabled),true);
  await page.click('#prev');assert.equal(await page.evaluate(()=>ENTRIES[cur].id),'history-spain-fall');
  await page.click('#next');assert.equal(await page.evaluate(()=>ENTRIES[cur].id),'history-arab-abbasid');
  await page.evaluate(()=>go('history-persian-wars'));
  await page.click('[data-scene="3"]');
  assert.equal(await page.evaluate(()=>location.hash),'#history-persian-wars/3');
  assert.equal(await page.$eval('[data-scene="3"]',e=>e.getAttribute('aria-pressed')),'true');
  await checkLayout(page,'desktop');
  await page.click('#readerToggle');
  assert.equal(await page.$eval('#readerBody',e=>e.hidden),true);
  assert.equal(await page.$eval('#readerToggle',e=>e.getAttribute('aria-expanded')),'false');
  await page.click('#tGeography');assert.equal(await page.evaluate(()=>viewMode),'geography');
  assert.equal(await page.$$eval('#toc .chip',es=>es.length),33);
  assert.equal(await page.$eval('#readerBody',e=>e.hidden),true);
  await page.click('#tTopics');assert.equal(await page.evaluate(()=>viewMode),'topics');
  assert.equal(await page.evaluate(()=>ENTRIES[cur].id),'topic-no-garrison');
  await page.evaluate(()=>go('topic-grail-sword'));assert.equal(await page.evaluate(()=>ENTRIES[cur].id),'topic-grail-sword');
  assert.equal(await page.$$eval('#sceneRail .scene-buttons button',es=>es.length),4);
  await page.click('#sceneRail [data-scene="1"]');assert.equal(await page.evaluate(()=>location.hash),'#topic-grail-sword/1');
  await page.click('#tHistory');assert.equal(await page.evaluate(()=>sceneIndex),3);
  await page.click('#readerToggle');await checkLayout(page,'desktop re-expanded');
  await page.evaluate(()=>go('alexander'));
  assert.equal(await page.$$eval('#tl li',es=>es.length),33);
  await page.$eval('#tl li[data-k="25"]',e=>e.click());
  assert.match(await page.$eval('.leaflet-popup-content',e=>e.textContent),/希发西斯河/);
  await page.evaluate(()=>go('unitedMonarchy'));
  await page.$eval('#royalClaim',e=>e.click());assert.equal(await page.evaluate(()=>group.hasLayer(narrativeLayer)),true);
  await page.$eval('#royalClaim',e=>e.click());assert.equal(await page.evaluate(()=>narrativeLayer),null);
  await page.evaluate(()=>go('phoenicia'));await page.$eval('[data-bounds]',e=>e.click());
  assert.ok(await page.evaluate(()=>map.getBounds().contains([36.53,-6.29])));
  await page.click('#tModern');assert.ok(await page.evaluate(()=>map.hasLayer(modern)));
  await page.click('#tModern');assert.equal(await page.evaluate(()=>map.hasLayer(modern)),false);
  await page.click('#tMarine');
  await page.evaluate(()=>go('adriatic'));
  assert.equal(await page.evaluate(()=>getComputedStyle(baseMarkers.adriatic.getElement().firstChild).display),'none');
  await page.click('#tMarine');
  assert.notEqual(await page.evaluate(()=>getComputedStyle(baseMarkers.adriatic.getElement().firstChild).display),'none');
  assert.equal(await page.evaluate(()=>MEDITERRANEAN_ISLANDS.every(([id,t,en,la,lo])=>islandMarkers[id].getLatLng().equals([la,lo])&&islandMarkers[id].getElement().textContent.includes(en))),true);
  await page.evaluate(()=>{location.hash='history-faith-israel/2';});
  await page.waitForFunction(()=>ENTRIES[cur].id==='history-faith-israel'&&sceneIndex===2);
  const direct=await newPage({hash:'#history-peloponnesian-war/2'});
  assert.equal(await direct.evaluate(()=>sceneIndex),2);await direct.close();
  const invalid=await newPage({hash:'#not-a-section'});
  assert.equal(await invalid.evaluate(()=>ENTRIES[cur].id),'history-migration');await invalid.close();
  // Exercise map/reader fitting at several viewport shapes, including short landscape.
  for(const [width,height] of [[390,844],[360,667],[768,1024],[1280,720],[740,390]]){
   const responsive=await newPage({width,height,hash:'#history-persian-wars/3'});
   await checkLayout(responsive,width+'x'+height);
   await responsive.click('#readerToggle');assert.equal(await responsive.$eval('#readerBody',e=>e.hidden),true);
   await responsive.click('#readerToggle');await checkLayout(responsive,width+'x'+height+' expanded');
   if(width<=820){
    await responsive.select('#mobileToc','history-migration/0');await checkLayout(responsive,width+'x'+height+' wide migration');
    await responsive.click('#tGeography');await responsive.select('#mobileToc','orient');await checkLayout(responsive,width+'x'+height+' wide geography');
   }
   await responsive.close();
  }
  // The animated path must cancel stale draws when users change their mind quickly.
  const animated=await newPage({reduced:false});
  await animated.evaluate(()=>{go('history-persian-wars',{scene:1});go('history-palaces',{scene:2});go('history-spartan-decline',{scene:4});});
  await animated.waitForFunction(()=>pending===null&&group.getLayers().length>0,{timeout:6000});
  assert.equal(await animated.evaluate(()=>ENTRIES[cur].id),'history-spartan-decline');
  assert.ok(await animated.evaluate(()=>Boolean(pinIndex['h-leuctra'])));
  assert.equal(await animated.evaluate(()=>Boolean(pinIndex['h-knossos'])),false);
  await animated.click('#readerToggle');await wait(900);
  await animated.click('#readerToggle');await wait(900);await checkLayout(animated,'animated expanded');
  await animated.close();
  await wait(200);assert.equal(await page.$eval('#mapnote',e=>e.hidden),false);
  assert.deepEqual(errors,[]);
  console.log('PASS: 33 geographic entries; 122 history sections; 462 scenes; all geometry references; 1105 reading links; foldable reader; overlay-aware map fitting; desktop, phone, tablet and short landscape; stage hash links; mode memory; navigation; rapid animated switching; 33 Alexander events; royal extent; 18 seas and 35 islands; offline rendering; no JavaScript errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
