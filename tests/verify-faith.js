const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const shots=path.join(__dirname,'shots-v19');require('node:fs').mkdirSync(shots,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const IDS=['history-faith-israel','history-faith-first-temple','history-faith-second-temple','history-faith-jesus','history-faith-church','history-faith-empire-church'];
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 try{
  for(const [width,height,label] of [[1440,960,'desktop'],[390,844,'390']]){
   const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height});
   await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
   await page.setRequestInterception(true);page.on('request',r=>/^https?:/.test(r.url())?r.abort():r.continue());
   await page.goto(pathToFileURL(target).href+'#history-faith-israel',{waitUntil:'domcontentloaded'});
   const report=await page.evaluate(IDS=>{
    const faith=HISTORY_ENTRIES.filter(e=>e.ch===6);
    const chars=html=>{const d=document.createElement('div');d.innerHTML=html;return d.textContent.replace(/\s/g,'').length;};
    const paras=faith.flatMap(e=>{const d=document.createElement('div');d.innerHTML=e.html;return [...d.querySelectorAll('[data-scene-text]')].map(p=>({id:e.id+'/'+p.dataset.sceneText,chars:chars(p.innerHTML)}));});
    const b=HISTORY_BRANCHES.find(b=>b.id==='faith');
    return {chapter:HISTORY_CH[6],ids:faith.map(e=>e.id),scenes:faith.map(e=>e.scenes.length),paras,bold:faith.every(e=>/<strong>/.test(e.html)),
     moments:faith.reduce((n,e)=>n+e.moments.length,0),branch:b&&[b.name,b.lane,b.parent,b.from,b.to,b.c===HC.faith],levant:HISTORY_BRANCHES.some(b=>b.id==='levant'),
     eras:HISTORY_ERAS.filter(e=>e.id.startsWith('faith-')).map(e=>[e.id,e.name,e.items.map(([id])=>id)]),
     line:lineStations('faith').map(s=>s.key),shoot:TREE_FUTURE.find(f=>f[0]==='faith'),
     dark:HISTORY_ENTRIES.find(e=>e.id==='history-dark-age').scenes.length,
     pompeyHoly:HISTORY_ENTRIES.find(e=>e.id==='history-rome-pompey').moments.some(m=>m.name==='至圣所'),
     holy:HISTORY_ENTRIES.find(e=>e.id==='history-faith-second-temple').moments.find(m=>m.name==='至圣所')?.scene,
     exodus:HISTORY_ENTRIES.find(e=>e.id==='history-faith-israel').moments.map(m=>[m.scene,m.name]),
     people:Object.entries(FIGURE_SCENES).filter(([k])=>k.startsWith('history-faith-')).reduce((n,[,v])=>n+v.length,0)};
   },IDS);
   assert.equal(report.chapter,'犹太教与基督教');
   assert.deepEqual(report.ids,IDS);assert.deepEqual(report.scenes,[3,2,3,3,2,3]);
   assert.ok(report.paras.every(p=>p.chars<=230),'Concise: '+JSON.stringify(report.paras.filter(p=>p.chars>230)));
   assert.ok(report.bold);assert.equal(report.moments,13);assert.equal(report.people,7);
   assert.deepEqual(report.branch,['基督教',5,'trunk',-1208,451,true]);assert.equal(report.levant,false);
   assert.deepEqual(report.eras,[['faith-israel','古代以色列',IDS.slice(0,2)],['faith-temple','第二圣殿时期',IDS.slice(2,4)],['faith-church','早期教会',IDS.slice(4)]]);
   assert.deepEqual(report.line,['history-migration/0','history-farming/0','history-farming/1','history-palaces/0','history-collapse/0',...IDS.map(id=>id+'/0')]);
   assert.equal(report.shoot[1],451);assert.match(report.shoot[2],/中世纪教会/);
   // Exodus and the Temple, once scattered, now sit on this line.
   assert.equal(report.dark,1);assert.equal(report.pompeyHoly,false);assert.equal(report.holy,2);
   assert.deepEqual(report.exodus,[[1,'分开红海'],[2,'大卫与歌利亚']]);
   for(const [scene,phrase] of [['history-faith-israel/0','以色列'],['history-faith-israel/1','出埃及'],['history-faith-israel/1','立约'],['history-faith-israel/2','第一圣殿'],
     ['history-faith-first-temple/0','亚述'],['history-faith-first-temple/1','约西亚'],['history-faith-first-temple/1','巴比伦'],['history-faith-first-temple/1','离开土地和国家'],
     ['history-faith-second-temple/0','第二圣殿'],['history-faith-second-temple/0','以斯拉'],['history-faith-second-temple/0','孔子'],['history-faith-second-temple/1','七十士'],['history-faith-second-temple/1','马加比'],
     ['history-faith-second-temple/2','希律'],['history-faith-second-temple/2','弥赛亚'],['history-faith-jesus/0','彼拉多'],['history-faith-jesus/1','保罗'],['history-faith-jesus/1','外邦人'],
     ['history-faith-jesus/1','尼禄'],['history-faith-jesus/2','提图斯'],['history-faith-jesus/2','雅夫内'],['history-faith-jesus/2','分道'],['history-faith-church/0','巴尔·科赫巴'],
     ['history-faith-church/0','主教'],['history-faith-church/0','一成'],['history-faith-church/1','德基乌斯'],['history-faith-church/1','伽列里乌斯'],['history-faith-church/1','亚美尼亚'],
     ['history-faith-empire-church/0','米尔维安桥'],['history-faith-empire-church/0','一张遍布帝国的网'],['history-faith-empire-church/1','同质'],['history-faith-empire-church/1','阿里乌派'],
     ['history-faith-empire-church/1','异端成了国法上的罪'],['history-faith-empire-church/2','上帝之城'],['history-faith-empire-church/2','卡尔西顿'],['history-faith-empire-church/2','景教'],
     ['history-empire-constantine/2','“基督教”主线']]){
    await page.evaluate(s=>go(s),scene);
    assert.ok(await page.$eval('#sceneContext>p',(e,w)=>e.textContent.includes(w),phrase),scene+' lacks '+phrase);
   }
   for(const [scene,id,re] of [['history-faith-jesus/1','paul',/上告于恺撒/],['history-faith-jesus/2','josephus',/石头/],['history-faith-empire-church/2','leo',/彼得借利奥/],
     ['history-faith-empire-church/0','eusebius',/教会外面/],['history-faith-empire-church/0','helena',/六十多年后/],['history-faith-empire-church/1','arius',/小曲/],['history-faith-empire-church/1','athanasius',/粮船/]]){
    await page.evaluate(s=>go(s),scene);assert.match(await page.$eval(`[data-person="${id}"]`,e=>e.textContent),re,scene+' '+id);
   }
   await page.evaluate(()=>go('history-faith-israel'));
   assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),'古代以色列 · 第七章');
   await page.evaluate(()=>go('history-faith-empire-church'));
   assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),'早期教会 · 第七章');
   if(label==='desktop'){
    assert.ok(await page.$$eval('#toc .tree-item[data-branch="faith"] small',es=>es.length===6&&es.every(e=>e.textContent.startsWith('基督教 · '))));
    assert.match(await page.$eval('#indexCaption',e=>e.textContent),/Ⅶ 基督教/);
   }
   for(const e of IDS)for(let i=0;i<await page.evaluate(id=>HISTORY_ENTRIES.find(x=>x.id===id).scenes.length,e);i++){
    const r=await page.evaluate(({e,i})=>{go(e,{scene:i});const s=activeScene(ENTRIES[cur]);
     return {pins:Object.keys(pinIndex).length,layers:group.getLayers().length,legend:legend.children.length,fits:map.getBounds().contains(L.latLngBounds(s.view)),overflow:document.documentElement.scrollWidth>innerWidth};},{e,i});
    await wait(60);
    assert.ok(r.layers>0&&r.legend>0&&!r.overflow,e+'/'+i+' '+JSON.stringify(r));
    if(label==='desktop')assert.ok(r.pins>0&&r.fits,e+'/'+i+' '+JSON.stringify(r));
   }
   for(const [scene,file] of [['history-faith-first-temple/0','temple'],['history-faith-jesus/1','paul'],['history-faith-empire-church/2','451']]){
    await page.evaluate(s=>go(s),scene);await wait(300);
    if(label==='390')await page.evaluate(()=>scrollSceneText(false));
    await page.screenshot({path:path.join(shots,`faith-${file}-${label}.png`)});
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: chapter Ⅶ 犹太教与基督教 — the 基督教 line (outermost lane, 前1208—451, shoot 中世纪教会) in 6 sections / 16 scenes, ≤230 chars each; it takes over the Levant spur (以色列、出埃及、大卫所罗门) and the 至圣所 tag; 37 phrase checks from the Exodus to Chalcedon; 7 person cards (保罗、约瑟夫斯、利奥、优西比乌、海伦娜、阿里乌、阿塔纳修斯); eyebrows and tree rows; desktop and 390px without overflow; offline; no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();}
})();
