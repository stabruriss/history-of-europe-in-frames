const puppeteer=require('puppeteer-core');require('./legacy_sidebar.cjs');require('./chrome_guard.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));

// 老无 2026-11-24: Prehistory & Ancient Greece full upgrade (23 stations, 83 scenes, 37 moments, 21 boxes, 23 new figures).
const SECTIONS={
 'history-migration':['走出非洲','距今约 7万—4万年',0,2,0,1],
 'history-farming':['农业、定居与国家','约前 10000—前 3000年',0,2,0,1],
 'history-palaces':['爱琴海宫殿文明','约前 1900—前 1100年',0,3,1,1],
 'history-collapse':['晚期青铜时代崩溃','约前 1274—前 1100年',0,3,2,0],
 'history-dark-age':['希腊的延续与复苏','约前 1200／1100—前 800年',0,3,1,2],
 'history-poleis':['城邦与海外聚落','约前 800—前 600年',1,3,1,1],
 'history-sparta':['斯巴达：土地与政体','前 8—前 6世纪起',1,3,1,1],
 'history-athens':['雅典：改革与僭主','约前 621—前 508／507年',1,5,1,1],
 'history-persian-wars':['希波战争与海军','约前 499—前 449年',1,6,4,2],
 'history-leagues':['两大同盟与民主深化','约前 478—前 431年',1,4,1,1],
 'history-peloponnesian-war':['争霸、远征与投降','约前 460—前 404年',1,6,4,2],
 'history-spartan-decline':['波斯调停与霸权轮替','前 404—前 362年',1,6,2,2],
 'history-macedonian-rise':['腓力：扩张与继承危机','前 359—前 335年',2,4,2,1],
 'history-alexander-conquest':['东征与扩张的极限','前 334—前 325年',2,5,4,2],
 'history-alexander-rule':['帝国怎样重组权力','前 332—前 324年',2,3,2,0],
 'history-successors':['继业者战争与三大王朝','前 323—约前 270年',2,4,1,1],
 'history-hellenistic-states':['税收、城市与军队','前 3世纪',3,4,2,0],
 'history-hellenistic-knowledge':['知识网络与生活哲学','约前 300—前 212年',3,4,2,1],
 'history-celts':['凯尔特南下与加拉太','前 279—前 230年代',3,3,1,0],
 'history-eastern-kingdoms':['巴克特里亚与帕提亚','约前 250—前 141年',3,3,1,0],
 'history-spartan-reforms':['重新分地与城邦联邦','前 245—前 222年',3,2,1,0],
 'history-ptolemaic-bargain':['埃及的兵员与祭司','前 217—前 186年',3,2,1,0],
 'history-hellenistic-end':['两端推进与王国落幕','前 200—前 30年',3,3,2,1],
};
const ORDER=Object.keys(SECTIONS);

const FACTS=[
 ['history-migration',0,'北京田园洞'],
 ['history-migration',1,'伊朗高原'],
 ['history-farming',0,'安纳托利亚农人'],
 ['history-farming',1,'乌鲁克'],
 ['history-palaces',0,'巴西琉斯'],
 ['history-palaces',1,'线形文字B'],
 ['history-palaces',2,'乌鲁布伦沉船'],
 ['history-collapse',0,'现存最早'],
 ['history-collapse',1,'哈图沙'],
 ['history-collapse',2,'海上民族'],
 ['history-dark-age',0,'块炼铁'],
 ['history-dark-age',1,'涅斯托尔之杯'],
 ['history-dark-age',2,'巴尔巴洛伊'],
 ['history-poleis',0,'雅典人'],
 ['history-poleis',1,'重装步兵'],
 ['history-poleis',2,'吕底亚'],
 ['history-sparta',0,'美塞尼亚'],
 ['history-sparta',1,'黑汤'],
 ['history-sparta',2,'长老会议'],
 ['history-athens',0,'六一汉'],
 ['history-athens',1,'解负令'],
 ['history-athens',2,'三起两落'],
 ['history-athens',3,'帕罗斯大理石'],
 ['history-athens',4,'黑羊'],
 ['history-persian-wars',0,'萨迪斯'],
 ['history-persian-wars',2,'马拉松'],
 ['history-persian-wars',3,'三列桨战舰'],
 ['history-persian-wars',4,'保萨尼亚斯'],
 ['history-persian-wars',5,'提洛同盟'],
 ['history-leagues',1,'伯利克里'],
 ['history-leagues',1,'帕特农神庙'],
 ['history-leagues',2,'三十年和约'],
 ['history-peloponnesian-war',0,'修昔底德'],
 ['history-peloponnesian-war',2,'斯法克特里亚'],
 ['history-peloponnesian-war',3,'米洛斯'],
 ['history-peloponnesian-war',4,'亚西比德'],
 ['history-peloponnesian-war',5,'阿吉努塞'],
 ['history-spartan-decline',0,'三十僭主'],
 ['history-spartan-decline',1,'《长征记》'],
 ['history-spartan-decline',3,'二鬼子'],
 ['history-spartan-decline',4,'留克特拉'],
 ['history-spartan-decline',5,'曼丁尼亚'],
 ['history-macedonian-rise',0,'萨里萨长矛'],
 ['history-macedonian-rise',1,'喀罗尼亚'],
 ['history-macedonian-rise',2,'奥林匹娅丝'],
 ['history-macedonian-rise',3,'底比斯'],
 ['history-alexander-conquest',0,'格拉尼库斯河'],
 ['history-alexander-conquest',1,'亚历山大里亚'],
 ['history-alexander-conquest',2,'高加米拉'],
 ['history-alexander-conquest',3,'罗克珊娜'],
 ['history-alexander-conquest',4,'格德罗西亚'],
 ['history-alexander-rule',0,'锡瓦绿洲'],
 ['history-alexander-rule',1,'俯拜礼'],
 ['history-alexander-rule',2,'奥皮斯'],
 ['history-successors',0,'黄金灵车'],
 ['history-successors',1,'银盾兵'],
 ['history-successors',2,'伊普苏斯'],
 ['history-successors',3,'共通希腊语'],
 ['history-hellenistic-states',0,'托拉斯'],
 ['history-hellenistic-states',1,'钉子户'],
 ['history-hellenistic-states',2,'希腊三镣铐'],
 ['history-hellenistic-states',3,'皮洛士'],
 ['history-hellenistic-knowledge',0,'独善其身'],
 ['history-hellenistic-knowledge',1,'羊皮纸'],
 ['history-hellenistic-knowledge',2,'埃拉托色尼'],
 ['history-hellenistic-knowledge',3,'阿基米德'],
 ['history-celts',0,'布伦努斯'],
 ['history-celts',1,'加拉太'],
 ['history-celts',2,'历史复调'],
 ['history-eastern-kingdoms',0,'阿伊哈努姆'],
 ['history-eastern-kingdoms',1,'犍陀罗'],
 ['history-eastern-kingdoms',2,'爱希腊者'],
 ['history-spartan-reforms',0,'克里昂米尼三世'],
 ['history-spartan-reforms',1,'塞拉西亚'],
 ['history-ptolemaic-bargain',0,'拉菲亚'],
 ['history-ptolemaic-bargain',1,'罗塞塔石碑'],
 ['history-hellenistic-end',0,'库诺斯克法莱'],
 ['history-hellenistic-end',1,'沙地上绕安条克四世画圈'],
 ['history-hellenistic-end',2,'被征服的希腊俘虏了野蛮的征服者'],
];

const BOX_FACTS=[
 ['history-migration',0,'昴宿星团'],
 ['history-migration',0,'搜神记'],
 ['history-farming',1,'内部比较优势'],
 ['history-palaces',1,'威尔萨'],
 ['history-dark-age',1,'西里尔字母'],
 ['history-dark-age',2,'近邻同盟'],
 ['history-poleis',1,'左盾护左邻'],
 ['history-sparta',2,'倒立金字塔'],
 ['history-athens',4,'十将军'],
 ['history-persian-wars',3,'温泉关'],
 ['history-persian-wars',5,'三列桨战舰'],
 ['history-leagues',1,'帕特农神庙'],
 ['history-peloponnesian-war',4,'亚西比德'],
 ['history-peloponnesian-war',5,'伯利克里'],
 ['history-spartan-decline',4,'留克特拉'],
 ['history-spartan-decline',5,'苏格拉底'],
 ['history-macedonian-rise',0,'萨里萨长矛'],
 ['history-alexander-conquest',1,'亚历山大里亚'],
 ['history-alexander-conquest',3,'五千公里'],
 ['history-successors',3,'托勒密埃及'],
 ['history-hellenistic-knowledge',2,'汽转球'],
 ['history-hellenistic-end',0,'中队'],
];

const PEOPLE=[
 ['history-dark-age/1','homer',/荷马问题/],
 ['history-athens/1','solon',/七贤/],
 ['history-athens/2','peisistratus',/山地派/],
 ['history-athens/4','cleisthenes',/伯里克利/],
 ['history-persian-wars/2','miltiades',/马拉松/],
 ['history-persian-wars/3','themistocles',/萨拉米斯/],
 ['history-persian-wars/3','leonidas-i',/温泉关/],
 ['history-leagues/1','pericles',/雅典/],
 ['history-leagues/3','socrates',/苏格拉底/],
 ['history-leagues/3','herodotus',/希罗多德/],
 ['history-peloponnesian-war/0','thucydides',/伯罗奔尼撒战争史/],
 ['history-peloponnesian-war/2','cleon',/斯法克特里亚/],
 ['history-peloponnesian-war/4','alcibiades',/叙拉古/],
 ['history-peloponnesian-war/5','lysander',/羊河/],
 ['history-peloponnesian-war/5','plato',/柏拉图/],
 ['history-spartan-decline/2','agesilaus-ii',/阿格西劳斯/],
 ['history-spartan-decline/4','epaminondas',/留克特拉/],
 ['history-macedonian-rise/1','philip-ii',/腓力/],
 ['history-macedonian-rise/1','demosthenes',/反腓力辞/],
 ['history-macedonian-rise/2','olympias',/奥林匹娅丝/],
 ['history-alexander-conquest/2','parmenion',/帕曼尼翁/],
 ['history-alexander-conquest/2','darius-iii',/大流士/],
 ['history-alexander-rule/1','callisthenes',/外甥孙/],
 ['history-successors/0','ptolemy-i',/托勒密/],
 ['history-successors/1','antigonus-i',/安提柯/],
 ['history-successors/2','seleucus-i',/塞琉古/],
 ['history-hellenistic-states/3','pyrrhus',/皮洛士/],
 ['history-hellenistic-knowledge/2','euclid',/欧几里得/],
 ['history-hellenistic-knowledge/3','archimedes',/阿基米德/],
 ['history-eastern-kingdoms/2','mithridates-i',/米特里达梯/],
];

const chars=s=>s.replace(/<[^>]+>/g,'').replace(/（[A-Za-z][^）]*）/g,'').replace(/\s/g,'').length;

(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 try{
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:1440,height:960});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.setOfflineMode(true);
  await page.goto(pathToFileURL(target).href+'#history-migration/0',{waitUntil:'load'});
  await page.waitForFunction(()=>window.metroUI&&document.querySelector('#map'));
  const r=await page.evaluate(ids=>{
   const by=id=>HISTORY_ENTRIES.find(e=>e.id===id);
   const para=(e,i)=>(e.html.match(new RegExp(`<p data-scene-text="${i}">([\\s\\S]*?)</p>`))||[])[1]||'';
   const iron=HISTORY_ERAS.find(e=>e.id==='iron');
   return {
    ironItems:iron.items,
    report:metroUI.layoutReport(),
    sections:Object.fromEntries(ids.map(id=>{
     const e=by(id);
     return [id,{
      short:e.short,period:e.period,ch:e.ch,scenes:e.scenes.length,
      sources:e.sources.length,urls:e.sources.map(s=>s[1]||s.url),
      moments:e.moments,boxes:e.boxes,
      paras:e.scenes.map((_,i)=>para(e,i)),
      hasChina:e.html.includes('另见“中国”主线'),
      hasSelfBoxRef:/见本幕豆腐块/.test(e.html),
     }];
    })),
   };
  },ORDER);

  assert.deepEqual(r.ironItems,[['history-dark-age',0,2,'希腊的延续与复苏']]);
  assert.deepEqual(r.report.unresolvedLabels,[]);
  assert.deepEqual(r.report.linkThroughStations,[]);
  // Verify Trojan Horse moment restored on history-collapse/1
  assert.ok(r.sections['history-collapse'].moments.some(m=>m.scene===1&&/木马计/.test(m.text)),'Trojan Horse moment present');

  for(const [id,[short,period,ch,sc,mom,bx]] of Object.entries(SECTIONS)){
   const s=r.sections[id];
   assert.deepEqual([s.short,s.period,s.ch,s.scenes,s.moments.length,s.boxes.length],[short,period,ch,sc,mom,bx],id);
   assert.ok(s.sources>=8&&new Set(s.urls).size===s.urls.length&&s.urls.every(u=>u.startsWith('https://')),id+' reading links');
   assert.ok(s.hasChina,id+' points to 中国 line');
   assert.equal(s.hasSelfBoxRef,false,id+' must not say 见本幕豆腐块');
   assert.equal(s.paras.filter(Boolean).length,sc,id+' prose for every scene');
   s.paras.forEach((p,i)=>{
    const bold=p.match(/<strong>(.*?)<\/strong>/g)||[];
    assert.equal(bold.length,1,`${id}/${i} one bold sentence`);
    assert.ok(p.startsWith('<strong>'),`${id}/${i} bold comes first`);
    assert.ok(chars(bold[0])<=40,`${id}/${i} bold ${chars(bold[0])}`);
    assert.ok(chars(p)<=300,`${id}/${i} ${chars(p)} chars`);
    const plain=p.replace(/<[^>]+>/g,'');
    assert.ok(!/[！!？?]/.test(plain),`${id}/${i} no exclamation or question marks in prose`);
   });
   for(const b of s.boxes){
    assert.ok(!/[！!]/.test(b.text.replace(/<[^>]+>/g,'')),`${id} box ${b.name} no exclamation marks`);
   }
  }

  for(const [id,i,text] of FACTS){
   assert.ok(r.sections[id].paras[i].replace(/（[A-Za-z][^）]*）/g,'').includes(text),`${id}/${i} lacks ${text}`);
  }
  for(const [id,sc,text] of BOX_FACTS){
   const hit=r.sections[id].boxes.filter(b=>b.scene===sc).some(b=>b.text.replace(/<[^>]+>/g,'').replace(/（[A-Za-z][^）]*）/g,'').includes(text));
   assert.ok(hit,`${id}/${sc} box lacks ${text}`);
  }
  for(const [sceneKey,pid,re] of PEOPLE){
   await page.evaluate(k=>{const [id,sc]=k.split('/');go(id,{scene:+sc});},sceneKey);
   const txt=await page.$eval(`[data-person="${pid}"]`,e=>e.textContent);
   assert.match(txt,re,`${sceneKey} ${pid}`);
  }

  await page.close();
  assert.deepEqual(errors,[],'no page errors');
  console.log('PASS: Prehistory & Ancient Greece full upgrade (v123) — 23 stations, 83 scenes, 37 moments, 21 boxes, 23 new figures + moved cards, <=300 chars & <=40-char bold openings.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})();
