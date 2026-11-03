const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const shots=path.join(__dirname,'shots-v7');require('node:fs').mkdirSync(shots,{recursive:true});
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 for(const [width,height,label] of [[1440,960,'desktop'],[390,844,'390']]){
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width,height});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.setOfflineMode(true);await page.evaluateOnNewDocument(full=>{window.addEventListener('DOMContentLoaded',()=>{const n=document.getElementById('mapnote');if(n)n.hidden=false;if(typeof map!=='undefined'){if(typeof tiles!=='undefined')map.removeLayer(tiles);if(typeof closeTerrain!=='undefined')map.removeLayer(closeTerrain);if(!full)for(const l of Object.values(map._layers)){const kp=l.options?.pane;if(kp==='fallbackPane'||kp==='baseLabelPane'||(kp==='riverPane'&&!group.hasLayer(l))){l._project=()=>{};l._update=()=>{};l._setPos=()=>{};}}}});},process.env.FULL_SHOTS==='1');
  await page.goto(pathToFileURL(target).href+'#history-migration',{waitUntil:'domcontentloaded'});
  const list=await page.evaluate(()=>HISTORY_ENTRIES.flatMap(e=>e.moments.map(m=>({id:e.id,scene:m.scene,name:m.name}))));
  assert.equal(list.length,577);
  await page.evaluate(list=>{const _f=fit,_m=markTreeCurrent,_c=makeCtx;fit=()=>{};markTreeCurrent=()=>{};makeCtx=()=>new Proxy({},{get:()=>()=>{}});try{
   for(const m of list){if(ENTRIES[cur]?.id!==m.id||sceneIndex!==m.scene)go(m.id,{scene:m.scene});
   const ctx=document.getElementById('sceneContext');const tags=[...ctx.querySelectorAll('.moment-tag')].map(t=>t.firstChild.textContent);
   const r={tags,total:document.querySelectorAll('#card .moment').length,expected:ENTRIES[cur].moments.length,overflow:document.documentElement.scrollWidth>innerWidth};
   if(!r.tags.includes(m.name)||r.total!==r.expected||r.overflow)throw new Error(JSON.stringify({m,r}));}}finally{fit=_f;markTreeCurrent=_m;makeCtx=_c;}},list);
  // 豆腐块: boxed explainers render inside their own scene passage, apart from the 名场面.
  const boxes=await page.evaluate(()=>HISTORY_ENTRIES.flatMap(e=>e.boxes.map(b=>({id:e.id,scene:b.scene,name:b.name}))));
  assert.equal(boxes.length,56);
  await page.evaluate(boxes=>{const _f=fit,_m=markTreeCurrent,_c=makeCtx;fit=()=>{};markTreeCurrent=()=>{};makeCtx=()=>new Proxy({},{get:()=>()=>{}});try{
   for(const b of boxes){if(ENTRIES[cur]?.id!==b.id||sceneIndex!==b.scene)go(b.id,{scene:b.scene});
   const ctx=document.getElementById('sceneContext');
   const r={tags:[...ctx.querySelectorAll('.box-tag')].map(t=>t.firstChild.textContent),total:document.querySelectorAll('#card .box').length,expected:ENTRIES[cur].boxes.length,
    moments:document.querySelectorAll('#card .moment').length,expectedMoments:ENTRIES[cur].moments.length,overflow:document.documentElement.scrollWidth>innerWidth};
   if(!r.tags.includes(b.name)||r.total!==r.expected||r.moments!==r.expectedMoments||r.overflow)throw new Error(JSON.stringify({b,r}));}}finally{fit=_f;markTreeCurrent=_m;makeCtx=_c;}},boxes);
  await page.evaluate(()=>go('history-persian-wars',{scene:3}));
  if(process.env.FULL_SHOTS==='1')await new Promise(r=>setTimeout(r,800));
  if(label==='390')await page.evaluate(()=>scrollSceneText(false));
  if(process.env.FULL_SHOTS==='1')await page.screenshot({path:path.join(shots,`moments-${label}.png`)});
  await page.close();
 }
 assert.deepEqual(errors,[]);
 console.log('PASS: 577 iconic-event tags and 56 豆腐块 (boxed explainers) render inside their scene passages; desktop and 390px; no overflow; offline; no page errors.');
 await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);
})().catch(e=>{console.error(e);process.exit(1);});
