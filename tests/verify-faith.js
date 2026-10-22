const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const shots=path.join(__dirname,'shots-v19');require('node:fs').mkdirSync(shots,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
const IDS=['history-faith-israel','history-faith-first-temple','history-faith-second-temple','history-faith-jesus','history-faith-church','history-faith-empire-church','history-faith-councils','history-faith-ephesus','history-faith-two-cities','history-faith-papacy','history-faith-three-chapters','history-faith-monothelites','history-faith-icons'];
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
   assert.deepEqual(report.ids,IDS);assert.deepEqual(report.scenes,[5,5,4,6,4,4,3,3,3,6,5,6,6]);
   assert.ok(report.paras.every(p=>p.chars<=230),'Concise: '+JSON.stringify(report.paras.filter(p=>p.chars>230)));
   assert.ok(report.bold);assert.equal(report.moments,42);assert.equal(report.people,28);
   assert.deepEqual(report.branch,['基督教',5,'trunk',-1400,843,true]);assert.equal(report.levant,false);
   assert.deepEqual(report.eras,[['faith-israel','古代以色列',IDS.slice(0,2)],['faith-temple','第二圣殿时期',IDS.slice(2,4)],['faith-church','早期教会',IDS.slice(4,9)],['faith-medieval','中世纪早期的教会',IDS.slice(9)]]);
   // The line now forks off before 卡迭石: the Hebrews' nomadic origins come first.
   assert.deepEqual(report.line,['history-migration/0','history-farming/0','history-farming/1','history-palaces/0',...IDS.map(id=>id+'/0')]);
   assert.equal(report.shoot[1],843);assert.match(report.shoot[2],/走向东西分裂/);
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
     ['history-faith-empire-church/0','一张遍布帝国的网'],['history-faith-councils/2','朱庇特有罪'],['history-faith-councils/2','普鲁登提乌斯'],
     ['history-faith-ephesus/0','上帝之城'],['history-faith-two-cities/0','卡尔西顿'],['history-faith-two-cities/0','帝国在西部倒下'],['history-empire-constantine/2','“基督教”主线'],
     // 老无 2026-10-18: the councils, point by point — background, the two repairs, the ascetics, Nicaea and the buried mine, the pancake flips, then councils II–IV.
     ['history-faith-empire-church/1','书接上回'],['history-faith-empire-church/1','草根宗教'],['history-faith-empire-church/1','新柏拉图主义'],['history-faith-empire-church/1','科层化、上层化、体制化'],
     ['history-faith-empire-church/1','强行发明一个新逻辑'],['history-faith-empire-church/1','本质相同'],['history-faith-empire-church/1','三位一体派的祖师'],['history-faith-empire-church/1','低一级'],
     ['history-faith-empire-church/2','表演苦修'],['history-faith-empire-church/2','安东尼'],['history-faith-empire-church/2','帕科米乌'],['history-faith-empire-church/2','主教手里的拳头'],
     ['history-faith-empire-church/3','不太感兴趣'],['history-faith-empire-church/3','撕碎'],['history-faith-empire-church/3','支持多数成本低'],['history-faith-empire-church/3','同质'],
     ['history-faith-empire-church/3','异端成了国法上的罪'],['history-faith-empire-church/3','埋了雷'],['history-faith-empire-church/3','穆斯林'],['history-faith-empire-church/3','使者'],
     ['history-faith-councils/0','后悔了'],['history-faith-councils/0','老二君士坦提乌斯二世'],['history-faith-councils/0','偏阿里乌派'],['history-faith-councils/0','干脆掀桌'],['history-faith-councils/0','“罗马”主线'],
     ['history-faith-councils/1','把大饼翻了回来'],['history-faith-councils/1','哥特人'],['history-faith-councils/1','本质是一个，位格是三个'],['history-faith-councils/1','新罗马'],
     ['history-faith-ephesus/2','生神者'],['history-faith-ephesus/2','聂斯托利'],['history-faith-ephesus/2','西里尔'],['history-faith-ephesus/2','金口约翰'],
     ['history-faith-two-cities/1','狄奥斯库若'],['history-faith-two-cities/1','两个本性'],['history-faith-two-cities/1','一性论'],['history-faith-two-cities/1','离了心'],
     ['history-empire-constantine/4','偏阿里乌派'],['history-empire-constantine/4','“基督教”主线'],
     // 老无 2026-10-18 (Telegram): why the quarrels never ended — his theory as the councils' closing scene; the 罗马 and 基督教 lines point at each other; China's ever stronger throne.
     ['history-faith-two-cities/2','吃精英阶层'],['history-faith-two-cities/2','智识含量'],['history-faith-two-cities/2','争权的战场'],['history-faith-two-cities/2','皇权是放大器'],
     ['history-faith-two-cities/2','化繁为简'],['history-faith-two-cities/2','归于一尊'],['history-faith-two-cities/2','各归一尊'],['history-faith-two-cities/2','“中世纪西欧”主线'],['history-faith-two-cities/2','“中国”主线'],
     ['history-faith-councils/1','“罗马”主线'],['history-faith-ephesus/2','“罗马”主线'],['history-empire-theodosius/1','“基督教”主线'],['history-empire-west-fall/3','“基督教”主线'],
     ['history-china-sixteen-kingdoms/1','皇权强，而且越来越强'],['history-china-sixteen-kingdoms/1','人口密度和反抗成本'],['history-china-sixteen-kingdoms/1','王与马，共天下'],
     ['history-china-sixteen-kingdoms/1','沙门不敬王者论'],['history-china-sixteen-kingdoms/1','当今如来'],['history-china-sixteen-kingdoms/1','与我抗衡'],
     ['history-china-sixteen-kingdoms/1','“罗马”主线'],['history-china-sixteen-kingdoms/1','“基督教”主线'],
     // 老无 2026-10-19: the councils split; Augustine and Leo; Nestorians and one-nature; the summary last; cross-line pointers.
     ['history-faith-ephesus/0','地上之城'],['history-faith-ephesus/0','政治影响'],['history-faith-ephesus/0','多纳图派'],['history-faith-ephesus/0','正义战争'],['history-faith-ephesus/0','两个国度'],['history-faith-ephesus/0','慧远'],
     ['history-faith-ephesus/1','三一派主导之后'],['history-faith-ephesus/1','从阿里乌派里衍生出来的两个异端分支'],['history-faith-ephesus/1','安条克学派'],['history-faith-ephesus/1','亚历山大里亚学派'],['history-faith-ephesus/2','普尔喀丽娅'],['history-faith-two-cities/0','利奥一世'],['history-faith-two-cities/0','阿提拉'],['history-faith-two-cities/0','“罗马”主线'],
     ['history-faith-two-cities/1','欧迪奇'],['history-faith-two-cities/1','穆斯林横扫'],['history-faith-israel/2','押了赫梯'],
     // 老无 2026-10-18: what were the Israelites doing in the Greek dark age? One line in the Greek scene, pointing here.
     ['history-dark-age/0','以色列人'],['history-dark-age/0','爱琴海一带'],['history-dark-age/0','“基督教”主线'],
     // 老无 2026-10-21: recap the split (Jewish tradition, the crowd's “Christ above all”), Arius’s two offshoots, the throne dragged along, the Pope and the first East–West schism.
     ['history-faith-papacy/0','三一派守的是犹太传统'],['history-faith-papacy/0','必须基督至大，其他逻辑无所谓'],['history-faith-papacy/0','希腊哲学的台阶'],['history-faith-papacy/1','阿里乌后来有两个变种'],
     ['history-faith-papacy/1','聂斯托利派'],['history-faith-papacy/1','景教'],['history-faith-papacy/1','“埃及”主线'],['history-faith-papacy/2','君士坦丁之后皇权左右摇摆'],['history-faith-papacy/2','反而变成了独立势力'],
     ['history-faith-papacy/2','宫殿归皇帝，教堂归主教'],['history-faith-papacy/3','磐石'],['history-faith-papacy/3','爸爸'],['history-faith-papacy/3','西利修'],['history-faith-papacy/4','断交三十五年'],
     ['history-faith-papacy/4','两样'],['history-faith-papacy/5','四百金币'],['history-faith-papacy/5','“东罗马”主线'],
     // v34 (老无 2026-10-21 晚): the power struggle behind doctrine — the fifth, sixth and seventh councils.
     ['history-faith-three-chapters/0','霍尔米斯达斯宫'],['history-faith-three-chapters/1','雅各派'],['history-faith-three-chapters/1','皇帝的人'],['history-faith-three-chapters/2','死人的东西'],['history-faith-three-chapters/3','一百五十二位主教'],['history-faith-three-chapters/4','众仆之仆'],
     ['history-faith-monothelites/0','卡尔西顿来找我们'],['history-faith-monothelites/1','罚则按身份开列'],['history-faith-monothelites/2','私通撒拉森人'],['history-faith-monothelites/3','既不能说也不能写'],['history-faith-monothelites/4','地盘一丢，教义就翻案'],['history-faith-monothelites/5','上帝的羔羊']]){
    await page.evaluate(s=>go(s),scene);
    assert.ok(await page.$eval('#sceneContext>p',(e,w)=>e.textContent.includes(w),phrase),scene+' lacks '+phrase);
   }
   for(const [scene,id,re] of [['history-faith-israel/3','moses',/自有永有/],['history-faith-second-temple/0','akhenaten',/唯一的神/],['history-faith-second-temple/3','caesar',/焚尸/],
     ['history-faith-jesus/3','peter',/不偏待人/],['history-faith-jesus/3','paul',/上告于恺撒/],['history-faith-jesus/5','josephus',/石头/],['history-faith-church/0','pliny-younger',/不合我们这个时代/],
     ['history-faith-church/1','cyprian',/迫害我们的人/],['history-faith-church/2','galerius',/山神/],['history-faith-two-cities/0','leo',/彼得借利奥/],
     ['history-faith-empire-church/0','eusebius',/教会外面/],['history-faith-empire-church/0','helena',/六十多年后/],['history-faith-councils/0','arius',/小曲/],['history-faith-councils/0','athanasius',/粮船/],
     ['history-faith-empire-church/2','anthony-great',/神人/],['history-faith-empire-church/3','constantine',/饶恕/],['history-faith-councils/1','gregory-nazianzus',/约拿/],['history-faith-ephesus/2','nestorius',/绿洲/],['history-faith-papacy/2','ambrose',/宫殿归皇帝/],['history-faith-papacy/4','gelasius-i',/两样/]]){
    await page.evaluate(s=>go(s),scene);assert.match(await page.$eval(`[data-person="${id}"]`,e=>e.textContent),re,scene+' '+id);
   }
   // 豆腐块 on the three churches that came out of Ephesus and Chalcedon; and no hedging tone left anywhere in the text (老无 2026-10-19).
   await page.evaluate(()=>go('history-faith-two-cities/1'));
   const churches=await page.evaluate(()=>{const b=document.querySelector('#sceneContext .box');return b&&{tag:b.querySelector('.box-tag').firstChild.textContent,text:b.textContent};});
   assert.ok(churches&&churches.tag==='三家教会',JSON.stringify(churches));
   for(const w of ['聂斯托利一家','景教','合一性论','雅各派','卡尔西顿一家','合一诏'])assert.ok(churches.text.includes(w),'churches box lacks '+w);
   assert.ok(await page.evaluate(()=>HISTORY_ENTRIES.every(e=>!e.html.includes('这条线的读法'))),'hedging tone left in the text');
   await page.evaluate(()=>go('history-faith-israel'));
   assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),'古代以色列 · 第七章');
   for(const id of ['history-faith-empire-church','history-faith-councils','history-faith-ephesus','history-faith-two-cities']){
    await page.evaluate(id=>go(id),id);
    assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),'早期教会 · 第七章');
   }
   for(const id of ['history-faith-papacy','history-faith-three-chapters','history-faith-monothelites','history-faith-icons']){await page.evaluate(id=>go(id),id);assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),'中世纪早期的教会 · 第七章');}
   if(label==='desktop'){
    assert.ok(await page.$$eval('#toc .tree-item[data-branch="faith"] small',es=>es.length===13&&es.every(e=>e.textContent.startsWith('基督教 · '))));
    assert.match(await page.$eval('#indexCaption',e=>e.textContent),/Ⅶ 基督教/);
   }
   for(const e of IDS)for(let i=0;i<await page.evaluate(id=>HISTORY_ENTRIES.find(x=>x.id===id).scenes.length,e);i++){
    const r=await page.evaluate(({e,i})=>{go(e,{scene:i});const s=activeScene(ENTRIES[cur]);
     return {pins:Object.keys(pinIndex).length,layers:group.getLayers().length,legend:legend.children.length,fits:map.getBounds().contains(L.latLngBounds(s.view)),overflow:document.documentElement.scrollWidth>innerWidth};},{e,i});
    await wait(60);
    assert.ok(r.layers>0&&r.legend>0&&!r.overflow,e+'/'+i+' '+JSON.stringify(r));
    if(label==='desktop')assert.ok(r.pins>0&&r.fits,e+'/'+i+' '+JSON.stringify(r));
   }
   for(const [scene,file] of [['history-faith-israel/2','kadesh'],['history-faith-jesus/0','gods'],['history-faith-jesus/3','peter-paul'],['history-faith-church/2','jupiter'],['history-faith-councils/2','jupiter-condemned'],['history-faith-empire-church/3','nicaea'],['history-faith-councils/0','pancake'],['history-faith-two-cities/1','chalcedon'],['history-faith-two-cities/2','why'],['history-faith-ephesus/0','city-of-god'],['history-faith-papacy/1','offshoots'],['history-faith-papacy/4','schism']]){
    await page.evaluate(s=>go(s),scene);await wait(300);
    if(label==='390')await page.evaluate(()=>scrollSceneText(false));
    await page.screenshot({path:path.join(shots,`faith-${file}-${label}.png`)});
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: chapter Ⅶ 犹太教与基督教 — the 基督教 line (outermost lane, 前1400—843, shoot 走向东西分裂; v34: 三章案, 一志论, 圣像之争) in 10 sections / 43 scenes (v33: 教宗与第一次东西分裂 — the recap, Arius’s two offshoots, the throne dragged along, how Rome’s bishop became the Pope, the Acacian schism), earlier: rebuilt on 老无’s secular outline in 9 sections / 37 scenes, ≤230 chars each: Hebrews from beyond the River, Kadesh, Egypt and Moses, the Exodus, the kingdoms and Babylon, monotheism / exclusivity / the end of days, Rome not caring, too many gods, Jesus’ product and Peter’s channel, the cross, Nero, why persecution eased, Diocletian son of Jupiter, a wave Constantine rode, Jupiter condemned, and the four councils (one God made to add up, desert saints, Nicaea, the pancake flips, Constantinople, Ephesus, Chalcedon and the mine it laid, and 老无’s theory of why the quarrels never ended); 157 phrase checks (incl. the pointer from the Greek dark age, and the Western Wall as the Temple Mount’s retaining wall); 32 iconic-event tags; a 豆腐块 on the three churches; 18 person cards (摩西、阿赫那吞、恺撒、彼得、保罗、约瑟夫斯、小普林尼、居普良、伽列里乌斯、优西比乌、海伦娜、安东尼、君士坦丁、阿里乌、阿塔纳修斯、纳齐安的格列高利、聂斯托利、利奥); eyebrows and tree rows; desktop and 390px without overflow; offline; no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();}
})();
