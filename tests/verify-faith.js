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
   assert.deepEqual(report.ids,IDS);assert.deepEqual(report.scenes,[5,5,4,6,4,4]);
   assert.ok(report.paras.every(p=>p.chars<=230),'Concise: '+JSON.stringify(report.paras.filter(p=>p.chars>230)));
   assert.ok(report.bold);assert.equal(report.moments,22);assert.equal(report.people,14);
   assert.deepEqual(report.branch,['基督教',5,'trunk',-1400,451,true]);assert.equal(report.levant,false);
   assert.deepEqual(report.eras,[['faith-israel','古代以色列',IDS.slice(0,2)],['faith-temple','第二圣殿时期',IDS.slice(2,4)],['faith-church','早期教会',IDS.slice(4)]]);
   // The line now forks off before 卡迭石: the Hebrews' nomadic origins come first.
   assert.deepEqual(report.line,['history-migration/0','history-farming/0','history-farming/1','history-palaces/0',...IDS.map(id=>id+'/0')]);
   assert.equal(report.shoot[1],451);assert.match(report.shoot[2],/中世纪教会/);
   // Exodus and the Temple, once scattered, now sit on this line.
   assert.equal(report.dark,1);assert.equal(report.pompeyHoly,false);assert.equal(report.holy,3);
   assert.deepEqual(report.exodus,[[2,'两份战报'],[4,'分开红海']]);
   // 老无's outline of 2026-10-17, point by point: a secular reading from the Hebrews to the Senate condemning Jupiter.
   for(const [scene,phrase] of [['history-faith-israel/0','教外'],['history-faith-israel/0','大河那边'],['history-faith-israel/0','哈比鲁'],['history-faith-israel/1','由牧转农'],
     ['history-faith-israel/1','耶和华'],['history-faith-israel/2','卡迭石'],['history-faith-israel/2','押了赫梯'],['history-faith-israel/2','押回埃及'],['history-faith-israel/3','摩西'],
     ['history-faith-israel/3','埃及名'],['history-faith-israel/3','兰塞'],['history-faith-israel/4','顾不过来'],['history-faith-israel/4','十灾'],
     ['history-faith-first-temple/0','种地的以色列人'],['history-faith-first-temple/1','第一圣殿'],['history-faith-first-temple/1','大卫家'],['history-faith-first-temple/2','亚述'],
     ['history-faith-first-temple/3','约西亚'],['history-faith-first-temple/3','只许拜他一个'],['history-faith-first-temple/4','巴比伦'],['history-faith-first-temple/4','离开土地和国家'],
     ['history-faith-second-temple/0','一神'],['history-faith-second-temple/0','两说'],['history-faith-second-temple/0','阿赫那吞'],['history-faith-second-temple/0','第二圣殿'],
     ['history-faith-second-temple/1','排他'],['history-faith-second-temple/1','拣选'],['history-faith-second-temple/1','大国'],['history-faith-second-temple/1','流奶与蜜'],['history-faith-second-temple/1','以斯拉'],
     ['history-faith-second-temple/2','末世'],['history-faith-second-temple/2','马加比'],['history-faith-second-temple/2','弥赛亚'],
     ['history-faith-second-temple/3','由它去'],['history-faith-second-temple/3','不出去拉人'],['history-faith-second-temple/3','希律'],
     ['history-faith-jesus/0','七百多年'],['history-faith-jesus/0','选神本身成了负担'],['history-faith-jesus/0','运营成本'],['history-faith-jesus/0','胜者'],
     ['history-faith-jesus/1','唯一的上帝'],['history-faith-jesus/1','永生'],['history-faith-jesus/2','神之子'],['history-faith-jesus/2','秘密结社'],['history-faith-jesus/2','彼拉多'],
     ['history-faith-jesus/3','彼得'],['history-faith-jesus/3','外邦人'],['history-faith-jesus/3','保罗'],['history-faith-jesus/3','七十士'],
     ['history-faith-jesus/4','三十多年'],['history-faith-jesus/4','尼禄'],['history-faith-jesus/4','顶罪'],['history-faith-jesus/5','提图斯'],['history-faith-jesus/5','圣殿山大平台'],['history-faith-jesus/5','哭墙'],['history-faith-jesus/5','雅夫内'],['history-faith-jesus/5','分道'],
     ['history-faith-church/0','不必搜捕'],['history-faith-church/0','为什么松'],['history-faith-church/0','巴尔·科赫巴'],['history-faith-church/1','顾不上'],['history-faith-church/1','德基乌斯'],
     ['history-faith-church/1','一千五百多个寡妇'],['history-faith-church/2','朱庇特之子'],['history-faith-church/2','伽列里乌斯'],['history-faith-church/3','羽翼丰满'],['history-faith-church/3','一成'],
     ['history-faith-church/3','过半'],['history-faith-church/3','亚美尼亚'],['history-faith-empire-church/0','米尔维安桥'],['history-faith-empire-church/0','风口'],
     ['history-faith-empire-church/0','一张遍布帝国的网'],['history-faith-empire-church/1','同质'],['history-faith-empire-church/1','阿里乌派'],['history-faith-empire-church/1','异端成了国法上的罪'],
     ['history-faith-empire-church/2','朱庇特有罪'],['history-faith-empire-church/2','普鲁登提乌斯'],['history-faith-empire-church/3','上帝之城'],['history-faith-empire-church/3','卡尔西顿'],
     ['history-faith-empire-church/3','景教'],['history-empire-constantine/2','“基督教”主线'],
     // 老无 2026-10-18: what were the Israelites doing in the Greek dark age? One line in the Greek scene, pointing here.
     ['history-dark-age/0','以色列人'],['history-dark-age/0','爱琴海一带'],['history-dark-age/0','“基督教”主线']]){
    await page.evaluate(s=>go(s),scene);
    assert.ok(await page.$eval('#sceneContext>p',(e,w)=>e.textContent.includes(w),phrase),scene+' lacks '+phrase);
   }
   for(const [scene,id,re] of [['history-faith-israel/3','moses',/自有永有/],['history-faith-second-temple/0','akhenaten',/唯一的神/],['history-faith-second-temple/3','caesar',/焚尸/],
     ['history-faith-jesus/3','peter',/不偏待人/],['history-faith-jesus/3','paul',/上告于恺撒/],['history-faith-jesus/5','josephus',/石头/],['history-faith-church/0','pliny-younger',/不合我们这个时代/],
     ['history-faith-church/1','cyprian',/迫害我们的人/],['history-faith-church/2','galerius',/山神/],['history-faith-empire-church/3','leo',/彼得借利奥/],
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
   for(const [scene,file] of [['history-faith-israel/2','kadesh'],['history-faith-jesus/0','gods'],['history-faith-jesus/3','peter-paul'],['history-faith-church/2','jupiter'],['history-faith-empire-church/2','jupiter-condemned']]){
    await page.evaluate(s=>go(s),scene);await wait(300);
    if(label==='390')await page.evaluate(()=>scrollSceneText(false));
    await page.screenshot({path:path.join(shots,`faith-${file}-${label}.png`)});
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: chapter Ⅶ 犹太教与基督教 — the 基督教 line (outermost lane, 前1400—451, shoot 中世纪教会) rebuilt on 老无’s secular outline in 6 sections / 28 scenes, ≤230 chars each: Hebrews from beyond the River, Kadesh, Egypt and Moses, the Exodus, the kingdoms and Babylon, monotheism / exclusivity / the end of days, Rome not caring, too many gods, Jesus’ product and Peter’s channel, the cross, Nero, why persecution eased, Diocletian son of Jupiter, a wave Constantine rode, Jupiter condemned; 83 phrase checks (incl. the pointer from the Greek dark age, and the Western Wall as the Temple Mount’s retaining wall); 22 iconic-event tags; 14 person cards (摩西、阿赫那吞、恺撒、彼得、保罗、约瑟夫斯、小普林尼、居普良、伽列里乌斯、优西比乌、海伦娜、阿里乌、阿塔纳修斯、利奥); eyebrows and tree rows; desktop and 390px without overflow; offline; no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();}
})();
