const puppeteer=require('puppeteer-core');require('./legacy_sidebar.cjs');require('./chrome_guard.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));

// 老无 2026-11-08: “第一次世界大战竟然不是单独的一节么……应该是多放换乘站”. 亚里士多德's v95 made 《第一次世界大战（上）（中）（下）》
// and 《十一月革命与凡尔赛》 the hubs; v102 fits 柏拉图's lines around them: 《奥斯曼的最后一战》 (was 《第一次世界大战》) on 中东 only,
// 《妇女参政与一战》 between 中 and 下, and every hand-over and pointer moved to the hub that comes next on its line.
const ORDER={
 persia:['history-ottoman-berlin','history-germany-ww1-west','history-ottoman-ww1','history-ww1-end','history-ottoman-kemal'],
 eeurope:['history-eeurope-reform','history-germany-ww1-west','history-ww1-middle','history-eeurope-october'],
 britain:['history-britain-lords','history-germany-ww1-west','history-ww1-middle','history-britain-suffrage-1918','history-ww1-end',
  'history-germany-versailles','history-britain-suffrage-1928'],
 italy:['history-italy-rome','history-germany-ww1-west','history-ww1-middle','history-ww1-end','history-germany-versailles','history-italy-lateran'],
 lowlands:['history-lowlands-congo','history-germany-ww1-west','history-ww1-middle','history-ww1-end'],
};
// Each hand-over names the station that now comes next (or came before) on its line.
const HANDOVERS=[
 ['history-ottoman-berlin',5,'第一次世界大战（上）'],['history-ottoman-berlin',5,'奥斯曼的最后一战'],
 ['history-ottoman-ww1',0,'第一次世界大战（上）'],['history-ottoman-ww1',5,'第一次世界大战（下）'],
 ['history-ottoman-kemal',0,'第一次世界大战（下）'],
 ['history-eeurope-reform',5,'第一次世界大战（上）'],['history-eeurope-october',0,'第一次世界大战（中）'],
 ['history-italy-rome',5,'第一次世界大战（上）'],['history-italy-lateran',0,'十一月革命与凡尔赛'],['history-italy-lateran',0,'庇护九世与文化斗争'],
 ['history-britain-lords',5,'第一次世界大战（上）'],['history-britain-suffrage-1918',0,'第一次世界大战（中）'],
 ['history-lowlands-congo',5,'第一次世界大战（上）'],
];
// What the rewritten sections turn on, so that a later edit cannot quietly drop it.
const FACTS=[
 ['history-ottoman-ww1',0,'恩维尔'],['history-ottoman-ww1',1,'萨勒卡默什'],['history-ottoman-ww1',2,'达达尼尔'],['history-ottoman-ww1',3,'代尔祖尔'],
 ['history-ottoman-ww1',4,'麦克马洪'],['history-ottoman-ww1',5,'库特'],
 ['history-italy-lateran',0,'残缺的胜利'],['history-italy-lateran',1,'阜姆'],['history-italy-lateran',2,'人民党'],
];
const REWRITTEN=['history-ottoman-ww1','history-italy-lateran'];
const chars=s=>s.replace(/<[^>]+>/g,'').replace(/（[A-Za-z][^）]*）/g,'').replace(/\s/g,'').length;

(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 try{
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:1440,height:960});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.setOfflineMode(true);
  await page.goto(pathToFileURL(target).href+'#history-ottoman-ww1/0',{waitUntil:'load'});
  await page.waitForFunction(()=>window.metroUI&&document.querySelector('#map .pin'));
  const r=await page.evaluate(lines=>{
   const by=id=>HISTORY_ENTRIES.find(e=>e.id===id);
   const para=(e,i)=>(e.html.match(new RegExp(`<p data-scene-text="${i}">([\\s\\S]*?)</p>`))||[])[1]||'';
   const stations=lid=>Object.entries(TREE_ROWS).filter(([k,v])=>k.endsWith('/0')&&(Array.isArray(v[0])?v[0]:[v[0]]).includes(lid))
    .sort((a,b)=>a[1][1]-b[1][1]).map(([k])=>k.slice(0,-2));
   const osm=by('history-ottoman-ww1');
   return {
    osm:{short:osm.short,period:osm.period,scenes:osm.scenes.length,row:TREE_ROWS['history-ottoman-ww1/0']},
    suffrageRow:TREE_ROWS['history-britain-suffrage-1918/0'],
    stations:Object.fromEntries(lines.map(l=>[l,stations(l)])),
    oldPointers:HISTORY_ENTRIES.filter(e=>/见“(第一次世界大战|一战西线)”一节/.test(e.html)).map(e=>e.id),
    paras:Object.fromEntries(HISTORY_ENTRIES.map(e=>[e.id,e.scenes.map((_,i)=>para(e,i))])),
    report:metroUI.layoutReport(),
   };
  },Object.keys(ORDER));
  assert.deepEqual([r.osm.short,r.osm.period,r.osm.scenes],['奥斯曼的最后一战','1908—1917年',6]);
  assert.deepEqual(r.osm.row,['persia',1917,1917,'1908—1917年'],'奥斯曼的最后一战 rides 中东 alone');
  assert.deepEqual(r.suffrageRow.slice(0,3),['britain',1918,1920],'妇女参政与一战 between 中 and 下');
  for(const [line,order] of Object.entries(ORDER)){
   const s=r.stations[line];
   assert.deepEqual(s.slice(s.indexOf(order[0]),s.indexOf(order[0])+order.length),order,line+' station order around the hubs');
  }
  assert.deepEqual(r.oldPointers,[],'no pointer to the old names 第一次世界大战 / 一战西线');
  for(const [id,i,text] of HANDOVERS)assert.ok(r.paras[id][i].includes(text),`${id}/${i} hands over to ${text}`);
  for(const [id,i,text] of FACTS)assert.ok(r.paras[id][i].replace(/（[A-Za-z][^）]*）/g,'').includes(text),`${id}/${i}: ${text}`);
  for(const id of REWRITTEN)r.paras[id].forEach((p,i)=>{
   const bold=p.match(/<strong>(.*?)<\/strong>/g)||[];
   assert.equal(bold.length,1,`${id}/${i} one bold sentence`);assert.ok(p.startsWith('<strong>'),`${id}/${i} bold comes first`);
   assert.ok(chars(bold[0])<=40,`${id}/${i} bold ${chars(bold[0])}`);assert.ok(chars(p)<=300,`${id}/${i} ${chars(p)} chars`);
   assert.ok(!/[！？!?]/.test(p.replace(/<[^>]+>/g,'')),`${id}/${i} no question or exclamation marks`);
  });
  assert.deepEqual(r.report.unresolvedLabels,[]);
  assert.deepEqual(r.report.linkThroughStations,[]);
  assert.deepEqual(r.report.flagsWithoutRoom,[]);
  await page.close();
  assert.deepEqual(errors,[],'no page errors');
  console.log('PASS: 一战 v102 — 奥斯曼的最后一战 on 中东 only, 东欧/不列颠/意大利/低地诸国 around the three hubs and 凡尔赛, hand-overs and pointers moved, no old names left.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})();
