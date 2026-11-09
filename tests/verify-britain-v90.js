const puppeteer=require('puppeteer-core');require('./legacy_sidebar.cjs');require('./chrome_guard.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));

// 老无 2026-11-08: 不列颠普选篇 from the Anglo-Scottish Union (1703) to Universal Suffrage (1928),
// 13 new sections (74 scenes), plus two interchanges with 法兰西 (西班牙王位继承战争 and 七年战争).
const SECTIONS={
 'history-britain-union':['英苏合并与汉诺威','1703—1716年',6],
 'history-britain-walpole':['南海泡沫与沃波尔','1711—1746年',6],
 'history-britain-america':['丢掉北美，换来印度','1760—1793年',5],
 'history-britain-industry-1':['工业革命（上）','约1700—1830年',6],
 'history-britain-industry-2':['工业革命（下）','约1760—1832年',5],
 'history-britain-napoleon':['拿破仑战争与谷物法','1789—1829年',6],
 'history-britain-reform-1832':['1832年议会改革','1830—1834年',6],
 'history-britain-chartism':['宪章运动与废除谷物法','1836—1851年',6],
 'history-britain-victoria':['维多利亚的帝国账本','1837—1877年',5],
 'history-britain-reform-1867':['1867年与1884年扩权','1865—1885年',6],
 'history-britain-lords':['爱尔兰自治与议会法','1885—1914年',6],
 'history-britain-suffrage-1918':['妇女参政与一战','1897—1918年',6],
 'history-britain-suffrage-1928':['1928年普选','1918—1928年',6],
};

const FACTS=[
 ['history-britain-union',2,'398085'],
 ['history-britain-union',5,'哈顿'],
 ['history-britain-walpole',1,'两万镑'],
 ['history-britain-walpole',3,'那几个人各有价码'],
 ['history-britain-america',4,'二十五分之一'],
 ['history-britain-industry-1',0,'工钱'],['history-britain-industry-1',4,'镗床'],
 ['history-britain-industry-2',2,'46%'],
 ['history-britain-industry-2',2,'12%'],
 ['history-britain-industry-2',3,'卢德'],
 ['history-britain-napoleon',2,'8.648亿'],
 ['history-britain-napoleon',3,'李嘉图'],
 ['history-britain-reform-1832',1,'格雷'],
 ['history-britain-reform-1832',3,'提光黄金'],
 ['history-britain-chartism',3,'科布登'],
 ['history-britain-victoria',4,'戴维斯与赫滕巴克'],
 ['history-britain-reform-1867',1,'边际收益'],
 ['history-britain-lords',3,'篱笆派'],
 ['history-britain-lords',3,'壕沟派'],
 ['history-britain-suffrage-1918',4,'2139万'],
 ['history-britain-suffrage-1918',5,'30岁'],
 ['history-britain-suffrage-1928',1,'英爱条约'],
 ['history-britain-suffrage-1928',2,'麦克唐纳'],
 ['history-britain-suffrage-1928',4,'2885万'],
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
  await page.goto(pathToFileURL(target).href+'#history-britain-union/0',{waitUntil:'load'});
  await page.waitForFunction(()=>window.metroUI&&document.querySelector('#map .pin'));
  const r=await page.evaluate(ids=>{
   const by=id=>HISTORY_ENTRIES.find(e=>e.id===id);
   const para=(e,i)=>(e.html.match(new RegExp(`<p data-scene-text="${i}">([\\s\\S]*?)</p>`))||[])[1]||'';
   return {
    line:(({name,parent,from,to})=>({name,parent,from,to}))(HISTORY_BRANCHES.find(b=>b.id==='britain')),
    future:TREE_FUTURE.find(f=>f[0]==='britain').slice(0,3),
    report:metroUI.layoutReport(),
    sharedSpanSucc:TREE_ROWS['history-france-spanish-succession/0'][0],
    sharedSevenYears:TREE_ROWS['history-france-seven-years/0'][0],
    hanoverTree:by('history-britain-victoria').boxes.some(b=>b.text.includes('<svg class="kin-tree"')),
    newtonBox:by('history-britain-walpole').boxes.some(b=>b.name.includes('牛顿')),
    allenBox:by('history-britain-industry-1').boxes.some(b=>b.text.includes('<table')),
    sarumBox:by('history-britain-industry-2').boxes.some(b=>b.name.includes('腐败选区')&&b.text.includes('老萨勒姆')),
    chartistBox:by('history-britain-chartism').boxes.some(b=>b.name.includes('人民宪章')),
    ledgerBox:by('history-britain-suffrage-1928').boxes.some(b=>b.text.includes('<table')&&b.text.includes('2885万')),
    sections:Object.fromEntries(ids.map(id=>{const e=by(id);return [id,{short:e.short,period:e.period,ch:e.ch,scenes:e.scenes.length,sources:e.sources.length,
     urls:e.sources.map(s=>s[1]||s.url),html:e.html,paras:e.scenes.map((_,i)=>para(e,i))}];})),
   };
  },Object.keys(SECTIONS));
  assert.deepEqual(r.line,{name:'不列颠',parent:'trunk',from:-55,to:1928});
  assert.deepEqual(r.future,['britain',1928,'大萧条、二战与福利国家']);
  assert.deepEqual(r.report.unresolvedLabels,[]);
  assert.deepEqual(r.report.linkThroughStations,[]);
  assert.deepEqual(r.sharedSpanSucc,['france','spain','britain']);
  assert.deepEqual(r.sharedSevenYears,['france','britain','spain','america','germany']);
  assert.equal(r.hanoverTree,true,'Hanover to Windsor SVG family tree present');
  assert.ok(r.newtonBox&&r.allenBox&&r.sarumBox&&r.chartistBox&&r.ledgerBox,'all 5 key boxes present');
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
  console.log('PASS: 不列颠 v90 — 13 new sections (74 scenes) from Anglo-Scottish Union (1703) to Universal Suffrage (1928), 2 interchanges with France, Hanover-Windsor family tree & 5-step franchise ledger verified.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})();
