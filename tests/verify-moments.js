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
  await page.setRequestInterception(true);page.on('request',r=>/^https?:/.test(r.url())?r.abort():r.continue());
  await page.goto(pathToFileURL(target).href+'#history-migration',{waitUntil:'domcontentloaded'});
  const list=await page.evaluate(()=>HISTORY_ENTRIES.flatMap(e=>e.moments.map(m=>({id:e.id,scene:m.scene,name:m.name}))));
  assert.equal(list.length,210);
  for(const m of list){
   const r=await page.evaluate(m=>{go(m.id,{scene:m.scene});
    const ctx=document.getElementById('sceneContext');const tags=[...ctx.querySelectorAll('.moment-tag')].map(t=>t.firstChild.textContent);
    return {tags,total:document.querySelectorAll('#card .moment').length,expected:ENTRIES[cur].moments.length,overflow:document.documentElement.scrollWidth>innerWidth};},m);
   assert.ok(r.tags.includes(m.name),JSON.stringify({m,r}));
   assert.equal(r.total,r.expected);assert.equal(r.overflow,false);
  }
  // 豆腐块: boxed explainers render inside their own scene passage, apart from the 名场面.
  const boxes=await page.evaluate(()=>HISTORY_ENTRIES.flatMap(e=>e.boxes.map(b=>({id:e.id,scene:b.scene,name:b.name}))));
  assert.equal(boxes.length,14);
  for(const b of boxes){
   const r=await page.evaluate(b=>{go(b.id,{scene:b.scene});
    const ctx=document.getElementById('sceneContext');
    return {tags:[...ctx.querySelectorAll('.box-tag')].map(t=>t.firstChild.textContent),total:document.querySelectorAll('#card .box').length,expected:ENTRIES[cur].boxes.length,
     moments:document.querySelectorAll('#card .moment').length,expectedMoments:ENTRIES[cur].moments.length,overflow:document.documentElement.scrollWidth>innerWidth};},b);
   assert.ok(r.tags.includes(b.name),JSON.stringify({b,r}));
   assert.equal(r.total,r.expected);assert.equal(r.moments,r.expectedMoments);assert.equal(r.overflow,false);
  }
  await page.evaluate(()=>go('history-persian-wars',{scene:3}));
  await new Promise(r=>setTimeout(r,800));
  if(label==='390')await page.evaluate(()=>scrollSceneText(false));
  await page.screenshot({path:path.join(shots,`moments-${label}.png`)});
  await page.close();
 }
 await browser.close();
 assert.deepEqual(errors,[]);
 console.log('PASS: 210 iconic-event tags and 14 豆腐块 (boxed explainers) render inside their scene passages; desktop and 390px; no overflow; offline; no page errors.');
})().catch(e=>{console.error(e);process.exit(1);});
