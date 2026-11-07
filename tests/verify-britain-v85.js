const puppeteer=require('puppeteer-core');require('./legacy_sidebar.cjs');require('./chrome_guard.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));

// 老无 2026-11-07: 不列颠 from Henry VII (1485) to the Glorious Revolution (1694), 21 new sections (129 scenes),
// plus two interchanges (亨利八世（中） shared with 基督教, 英西海战与无敌舰队 shared with 西班牙, 低地诸国 and 美洲).
const SECTIONS={
 'history-britain-henry7':['亨利七世','1485—1509年',7],
 'history-britain-henry8-1':['亨利八世（上）','1509—1529年',7],
 'history-britain-henry8-2':['亨利八世（中）','1529—1536年',7],
 'history-britain-henry8-3':['亨利八世（下）','1536—1547年',7],
 'history-britain-enclosure':['圈地运动','约1485—1640年',6],
 'history-britain-mary1':['九日女王与血腥玛丽','1547—1558年',6],
 'history-britain-elizabeth-rise':['伊丽莎白怎么当上女王','1533—1558年',6],
 'history-britain-elizabeth-1':['伊丽莎白一世（上）','1558—1572年',6],
 'history-britain-elizabeth-faith':['伊丽莎白的宗教','1559—1603年',6],
 'history-britain-elizabeth-2':['伊丽莎白一世（中）','1568—1587年',6],
 'history-britain-armada-after':['无敌舰队之后的账单','1588—1603年',5],
 'history-britain-elizabeth-3':['伊丽莎白一世（下）','1590—1603年',5],
 'history-britain-james1':['詹姆士一世','1603—1625年',6],
 'history-britain-charles1':['查理一世','1625—1640年',6],
 'history-britain-civil-war':['英国内战','1640—1646年',6],
 'history-britain-regicide':['军事政变与处死查理一世','1647—1649年',6],
 'history-britain-commonwealth':['英格兰共和国','1649—1653年',6],
 'history-britain-cromwell':['第二个克伦威尔','1599—1660年',6],
 'history-britain-charles2':['查理二世复辟','1660—1685年',6],
 'history-britain-james2':['詹姆士二世','1685—1688年',6],
 'history-britain-glorious':['光荣革命','1688—1694年',7],
};

const FACTS=[
 ['history-britain-henry7',5,'保证金契约'],
 ['history-britain-henry8-1',4,'什么也不欠英国'],
 ['history-britain-henry8-2',0,'无声的中国'],
 ['history-britain-henry8-2',0,'把罗马教廷的屋顶掀掉'],
 ['history-britain-henry8-2',3,'晚办三个多月'],
 ['history-britain-enclosure',0,'宗族祠堂'],
 ['history-britain-enclosure',0,'公地悲剧'],
 ['history-britain-enclosure',2,'不服就干你'],
 ['history-britain-enclosure',3,'一鲸落，但并非万物生'],
 ['history-britain-enclosure',3,'市镇精英'],
 ['history-britain-enclosure',4,'社会相对地位'],
 ['history-britain-enclosure',5,'土地用途并不是圈地运动的主要矛盾，土地归属才是'],
 ['history-britain-elizabeth-rise',5,'不能作为历史动力采信'],
 ['history-britain-elizabeth-1',0,'简单的博弈问题'],
 ['history-britain-elizabeth-1',0,'最优选项是谁的也不欠就当独立国王'],
 ['history-britain-elizabeth-1',1,'边际效益'],
 ['history-britain-elizabeth-1',1,'腓力的最优解边际收益较小'],
 ['history-britain-regicide',3,'英国史上唯一的军事政变'],
 ['history-britain-charles2',0,'对国王的敌人是赦免，对国王的朋友是遗忘'],
 ['history-britain-glorious',3,'双王共治'],
 ['history-britain-glorious',4,'英格兰银行'],
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
  await page.goto(pathToFileURL(target).href+'#history-britain-henry7/0',{waitUntil:'load'});
  await page.waitForFunction(()=>window.metroUI&&document.querySelector('#map .pin'));
  const r=await page.evaluate(ids=>{
   const by=id=>HISTORY_ENTRIES.find(e=>e.id===id);
   const para=(e,i)=>(e.html.match(new RegExp(`<p data-scene-text="${i}">([\\s\\S]*?)</p>`))||[])[1]||'';
   return {
    line:(({name,parent,from,to})=>({name,parent,from,to}))(HISTORY_BRANCHES.find(b=>b.id==='britain')),
    future:TREE_FUTURE.find(f=>f[0]==='britain').slice(0,3),
    report:metroUI.layoutReport(),
    sharedH8:TREE_ROWS['history-britain-henry8-2/0'][0],
    sharedArmada:TREE_ROWS['history-spain-armada/0'][0],
    kinTrees:['history-britain-elizabeth-3','history-britain-glorious'].map(id=>by(id).boxes.some(b=>b.text.includes('<svg class="kin-tree"'))),
    virginBox:by('history-britain-henry8-1').boxes.some(b=>b.name.includes('处女')&&b.text.includes('西班牙正中间')),
    abductBox:by('history-britain-elizabeth-1').boxes.some(b=>b.name.includes('被绑架的女王')&&b.text.includes('邓巴城堡')),
    sections:Object.fromEntries(ids.map(id=>{const e=by(id);return [id,{short:e.short,period:e.period,ch:e.ch,scenes:e.scenes.length,sources:e.sources.length,
     urls:e.sources.map(s=>s[1]||s.url),html:e.html,paras:e.scenes.map((_,i)=>para(e,i))}];})),
   };
  },Object.keys(SECTIONS));
  assert.deepEqual(r.line,{name:'不列颠',parent:'trunk',from:-55,to:1694});
  assert.deepEqual(r.future,['britain',1694,'英苏合并与日不落帝国']);
  assert.deepEqual(r.report.unresolvedLabels,[]);
  assert.deepEqual(r.report.linkThroughStations,[]);
  assert.deepEqual(r.sharedH8,['britain','faith']);
  assert.deepEqual(r.sharedArmada,['spain','lowlands','america','britain']);
  assert.deepEqual(r.kinTrees,[true,true],'both Tudor and Stuart SVG family trees present');
  assert.ok(r.virginBox,'Catherine of Aragon virginity box present');
  assert.ok(r.abductBox,'Mary Stuart abduction box present');
  for(const [id,[short,period,n]] of Object.entries(SECTIONS)){
   const s=r.sections[id];
   assert.deepEqual([s.short,s.period,s.ch,s.scenes],[short,period,12,n],id);
   assert.ok(s.sources>=8&&new Set(s.urls).size===s.urls.length&&s.urls.every(u=>u.startsWith('https://')),id+' reading links');
   assert.ok(s.html.includes('另见“中国”主线'),id+' Chinese comparison');
   assert.equal(s.paras.filter(Boolean).length,n,id+' prose for every scene');
   s.paras.forEach((p,i)=>{
    const bold=p.match(/<strong>(.*?)<\/strong>/g)||[];
    assert.equal(bold.length,1,`${id}/${i} one bold sentence`);assert.ok(p.startsWith('<strong>'),`${id}/${i} bold comes first`);
    assert.ok(chars(bold[0])<=40,`${id}/${i} bold ${chars(bold[0])}`);assert.ok(chars(p)<=300,`${id}/${i} ${chars(p)} chars`);
    assert.ok(!/[！？!?]/.test(p.replace(/<[^>]+>/g,'')),`${id}/${i} no question or exclamation marks`);
   });
  }
  for(const [id,i,text] of FACTS){
   assert.ok(r.sections[id].paras[i].replace(/（[A-Za-z][^）]*）/g,'').includes(text),`${id}/${i}: ${text}`);
  }
  await page.close();
  assert.deepEqual(errors,[],'no page errors');
  console.log('PASS: 不列颠 v85 — 21 new sections (129 scenes) from Henry VII (1485) to the Glorious Revolution (1694), 2 interchanges, Tudor & Stuart family trees, Enclosure & Elizabeth-Philip game theory verified.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})();
