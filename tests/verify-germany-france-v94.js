const puppeteer=require('puppeteer-core');require('./legacy_sidebar.cjs');require('./chrome_guard.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));

// 老无 2026-11-08 (v94): 德意志 (1648—1923) and 法兰西收尾 (1852—1923), 11 new sections (66 scenes),
// plus 七年战争, 拿破仑帝国, 从莫斯科到滑铁卢, 普法战争与德意志帝国, 一战西线 and 十一月革命与凡尔赛 as interchanges.
const SECTIONS={
 'history-germany-prussia-rise':['大选帝侯与士兵王',5,6],
 'history-germany-frederick-great':['腓特烈大帝',5,6],
 'history-germany-reform':['施泰因与哈登堡改革',5,6],
 'history-germany-1848':['关税同盟与法兰克福议会',5,6],
 'history-germany-bismarck':['俾斯麦与普奥战争',5,6],
 'history-germany-franco-prussian':['普法战争与德意志帝国',5,6],
 'history-germany-wilhelm2':['威廉二世与世界政策',5,6],
 'history-germany-ww1-west':['一战西线',5,6],
 'history-germany-versailles':['十一月革命与凡尔赛',5,6],
 'history-france-second-empire':['拿破仑三世与第二帝国',5,6],
 'history-france-commune':['巴黎公社与第三共和国',5,6],
};
const GERMANY_ORDER=[
 'history-germany-thirty-years-3/0','history-germany-prussia-rise/0','history-germany-frederick-great/0',
 'history-france-seven-years/0','history-france-empire/0','history-germany-reform/0',
 'history-france-waterloo/0','history-germany-1848/0','history-germany-bismarck/0',
 'history-germany-franco-prussian/0','history-germany-wilhelm2/0','history-germany-ww1-west/0',
 'history-germany-versailles/0',
];
const FRANCE_ORDER=[
 'history-france-louis-bonaparte/0','history-france-second-empire/0','history-germany-franco-prussian/0',
 'history-france-commune/0','history-germany-ww1-west/0','history-germany-versailles/0',
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
  await page.goto(pathToFileURL(target).href+'#history-germany-prussia-rise/0',{waitUntil:'load'});
  await page.waitForFunction(()=>window.metroUI&&document.querySelector('#map .pin'));
  const r=await page.evaluate(ids=>{
   const by=id=>HISTORY_ENTRIES.find(e=>e.id===id);
   const para=(e,i)=>(e.html.match(new RegExp(`<p data-scene-text="${i}">([\\s\\S]*?)</p>`))||[])[1]||'';
   const gStops=metroUI.data.lineStops.get('germany').map(s=>s.key);
   const fStops=metroUI.data.lineStops.get('france').map(s=>s.key);
   const gi=gStops.indexOf('history-germany-thirty-years-3/0');
   const fi=fStops.indexOf('history-france-louis-bonaparte/0');
   return {
    germanyLine:(({name,parent,from,to})=>({name,parent,from,to}))(HISTORY_BRANCHES.find(b=>b.id==='germany')),
    franceLine:(({name,parent,from,to})=>({name,parent,from,to}))(HISTORY_BRANCHES.find(b=>b.id==='france')),
    germanyStretch:gi>=0?gStops.slice(gi,gi+13):[],
    franceStretch:fi>=0?fStops.slice(fi,fi+6):[],
    report:metroUI.layoutReport(),
    shared:{
     sevenYears:TREE_ROWS['history-france-seven-years/0'][0],
     empire:TREE_ROWS['history-france-empire/0'][0],
     waterloo:TREE_ROWS['history-france-waterloo/0'][0],
     francoPrussian:TREE_ROWS['history-germany-franco-prussian/0'][0],
     ww1West:TREE_ROWS['history-germany-ww1-west/0'][0],
     versailles:TREE_ROWS['history-germany-versailles/0'][0],
    },
    sections:Object.fromEntries(ids.map(id=>{const e=by(id);return [id,{short:e.short,period:e.period,ch:e.ch,scenes:e.scenes.length,sources:e.sources.length,
     urls:e.sources.map(s=>s[1]||s.url),html:e.html,paras:e.scenes.map((_,i)=>para(e,i))}];})),
   };
  },Object.keys(SECTIONS));
  assert.equal(r.germanyLine.name,'德意志');assert.ok(r.germanyLine.to>=1923);
  assert.equal(r.franceLine.name,'法兰西');assert.ok(r.franceLine.to>=1923);
  assert.deepEqual(r.germanyStretch,GERMANY_ORDER,'Germany runs through its 1648—1923 stretch in order');
  assert.deepEqual(r.franceStretch,FRANCE_ORDER,'France runs through its 1852—1923 stretch in order');
  assert.deepEqual(r.report.unresolvedLabels,[]);
  assert.deepEqual(r.report.linkThroughStations,[]);
  for(const l of ['france','britain','spain','america','germany'])assert.ok(r.shared.sevenYears.includes(l),'Seven Years War includes '+l);
  for(const l of ['france','spain','germany'])assert.ok(r.shared.empire.includes(l),'Napoleonic Empire includes '+l);
  for(const l of ['france','eeurope','germany'])assert.ok(r.shared.waterloo.includes(l),'Waterloo includes '+l);
  for(const l of ['germany','france'])assert.ok(r.shared.francoPrussian.includes(l),'Franco-Prussian War includes '+l);
  for(const l of ['germany','france','lowlands'])assert.ok(r.shared.ww1West.includes(l),'WW1 Western Front includes '+l);
  for(const l of ['germany','france'])assert.ok(r.shared.versailles.includes(l),'Versailles 1919 includes '+l);
  for(const [id,[short,ch,n]] of Object.entries(SECTIONS)){
   const s=r.sections[id];
   assert.deepEqual([s.short,s.ch,s.scenes],[short,ch,n],id);
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
  await page.close();
  assert.deepEqual(errors,[],'no page errors');
  console.log('PASS: 德意志 & 法兰西 v94 — 11 new sections (66 scenes) bringing Germany and France to 1923, 6 interchanges verified.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})();
