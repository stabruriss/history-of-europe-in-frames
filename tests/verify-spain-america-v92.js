const puppeteer=require('puppeteer-core');require('./legacy_sidebar.cjs');require('./chrome_guard.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));

// 老无 2026-11-08 (v92): 西班牙 (1714—1931) and 美洲 (1648—1920), 13 new sections (78 scenes),
// plus 七年战争, 赢了美国，输了钱袋, 拿破仑帝国, 拉美独立 and 美西战争 as interchanges.
const SECTIONS={
 'history-spain-bourbon':['波旁改革',5,6],
 'history-spain-cadiz':['加的斯宪法',5,6],
 'history-spain-carlist':['卡洛斯战争与第一共和国',5,6],
 'history-spain-1898':['美西战争',5,6],
 'history-america-colonies':['十三殖民地',14,6],
 'history-america-independence':['无代表不纳税',14,6],
 'history-america-constitution':['费城制宪',14,6],
 'history-america-westward':['西进运动与美墨战争',14,6],
 'history-america-latam':['拉美独立',14,6],
 'history-america-cotton':['棉花王国与南北裂痕',14,6],
 'history-america-civilwar':['美国内战',14,6],
 'history-america-gilded':['镀金时代',14,6],
 'history-america-wilson':['威尔逊与一战',14,6],
};
const SPAIN_ORDER=[
 'history-france-spanish-succession/0','history-spain-bourbon/0','history-france-seven-years/0',
 'history-france-american-war/0','history-france-empire/0','history-spain-cadiz/0',
 'history-america-latam/0','history-spain-carlist/0','history-spain-1898/0',
];
const AMERICA_ORDER=[
 'history-america-hill/0','history-america-colonies/0','history-france-seven-years/0',
 'history-america-independence/0','history-france-american-war/0','history-america-constitution/0',
 'history-america-westward/0','history-america-latam/0','history-america-cotton/0',
 'history-america-civilwar/0','history-america-gilded/0','history-spain-1898/0',
 'history-america-wilson/0',
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
  await page.goto(pathToFileURL(target).href+'#history-spain-bourbon/0',{waitUntil:'load'});
  await page.waitForFunction(()=>window.metroUI&&document.querySelector('#map .pin'));
  const r=await page.evaluate(ids=>{
   const by=id=>HISTORY_ENTRIES.find(e=>e.id===id);
   const para=(e,i)=>(e.html.match(new RegExp(`<p data-scene-text="${i}">([\\s\\S]*?)</p>`))||[])[1]||'';
   const sStops=metroUI.data.lineStops.get('spain').map(s=>s.key);
   const aStops=metroUI.data.lineStops.get('america').map(s=>s.key);
   const si=sStops.indexOf('history-france-spanish-succession/0');
   const ai=aStops.indexOf('history-america-hill/0');
   return {
    spainLine:(({name,parent,from,to})=>({name,parent,from,to}))(HISTORY_BRANCHES.find(b=>b.id==='spain')),
    americaLine:(({name,from,to})=>({name,from,to}))(HISTORY_BRANCHES.find(b=>b.id==='america')),
    spainStretch:si>=0?sStops.slice(si,si+9):[],
    americaStretch:ai>=0?aStops.slice(ai,ai+13):[],
    report:metroUI.layoutReport(),
    shared:{
     sevenYears:TREE_ROWS['history-france-seven-years/0'][0],
     americanWar:TREE_ROWS['history-france-american-war/0'][0],
     empire:TREE_ROWS['history-france-empire/0'][0],
     latam:TREE_ROWS['history-america-latam/0'][0],
     war1898:TREE_ROWS['history-spain-1898/0'][0],
    },
    sections:Object.fromEntries(ids.map(id=>{const e=by(id);return [id,{short:e.short,period:e.period,ch:e.ch,scenes:e.scenes.length,sources:e.sources.length,
     urls:e.sources.map(s=>s[1]||s.url),html:e.html,paras:e.scenes.map((_,i)=>para(e,i))}];})),
   };
  },Object.keys(SECTIONS));
  assert.equal(r.spainLine.name,'西班牙');assert.ok(r.spainLine.to>=1931);
  assert.equal(r.americaLine.name,'美洲');assert.ok(r.americaLine.to>=1920);
  assert.deepEqual(r.spainStretch,SPAIN_ORDER,'Spain runs through its 1714—1931 stretch in order');
  assert.deepEqual(r.americaStretch,AMERICA_ORDER,'The Americas run through their 1648—1920 stretch in order');
  assert.deepEqual(r.report.unresolvedLabels,[]);
  assert.deepEqual(r.report.linkThroughStations,[]);
  for(const l of ['france','britain','spain','america'])assert.ok(r.shared.sevenYears.includes(l),'Seven Years War includes '+l);
  for(const l of ['france','spain','america'])assert.ok(r.shared.americanWar.includes(l),'American War includes '+l);
  for(const l of ['france','spain'])assert.ok(r.shared.empire.includes(l),'Napoleonic Empire includes '+l);
  for(const l of ['america','spain'])assert.ok(r.shared.latam.includes(l),'LatAm Independence includes '+l);
  for(const l of ['spain','america'])assert.ok(r.shared.war1898.includes(l),'1898 War includes '+l);
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
  console.log('PASS: 西班牙 & 美洲 v92 — 13 new sections (78 scenes) bringing Spain to 1931 and the Americas to 1920, 5 interchanges verified.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})();
