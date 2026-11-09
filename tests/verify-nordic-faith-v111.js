const puppeteer=require('puppeteer-core');require('./legacy_sidebar.cjs');require('./chrome_guard.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));

// 老无 2026-11-08: “剩下几条改落后的线也推进下”. 北欧 runs on from 1648 to 1920 in four stations; 基督教 runs on from 1689 in three,
// rides 执政府 (the Concordat of 1801) and ends at the shared Lateran station (1929); 埃及 and 十字军 end instead of waiting.
const SECTIONS={
 'history-nordic-ice':['踏冰渡海','1648—1697年',13],
 'history-nordic-great-northern':['大北方战争','1697—1772年',13],
 'history-nordic-napoleon':['芬兰与挪威易手','1772—1815年',13],
 'history-nordic-modern':['北欧小国的现代路','1815—1920年',13],
 'history-faith-toleration':['宽容与启蒙','1689—1789年',6],
 'history-faith-revolution':['革命与教会','1789—1846年',6],
 'history-faith-pius9':['庇护九世与文化斗争','1846—1914年',6],
};
const NORDIC=Object.keys(SECTIONS).slice(0,4),FAITH=Object.keys(SECTIONS).slice(4);
// Facts the fact checks settled; famous sayings stay in with their credibility notes (rule 3, 老无 2026-11-08).
const FACTS=[
 ['history-nordic-ice',1,'罗斯基勒'],['history-nordic-ice',2,'王法'],['history-nordic-ice',4,'分田'],
 ['history-nordic-great-northern',0,'纳尔瓦'],['history-nordic-great-northern',1,'波尔塔瓦'],['history-nordic-great-northern',3,'尼斯塔德'],['history-nordic-great-northern',4,'礼帽'],
 ['history-nordic-napoleon',0,'古斯塔夫三世'],['history-nordic-napoleon',3,'贝尔纳多特'],['history-nordic-napoleon',4,'埃兹沃尔'],
 ['history-nordic-modern',0,'艾德河'],['history-nordic-modern',1,'民众高中'],['history-nordic-modern',3,'1906'],['history-nordic-modern',5,'公投'],
 ['history-faith-toleration',0,'宽容法'],['history-faith-toleration',1,'卫斯理'],['history-faith-toleration',2,'败类'],['history-faith-toleration',3,'耶稣会'],
 ['history-faith-revolution',0,'教士公民组织法'],['history-faith-revolution',1,'最高主宰'],['history-faith-revolution',2,'教务专约'],['history-faith-revolution',3,'威尔伯福斯'],
 ['history-faith-pius9',0,'谬论要录'],['history-faith-pius9',1,'533票对2票'],['history-faith-pius9',2,'卡诺莎'],['history-faith-pius9',3,'达尔文'],['history-faith-pius9',4,'新事'],
];
// The regions drawn for v111 (build_nordic_geo.py), and the Papal States of 柏拉图's v101.
const REGIONS=['nDenmarkNorway1660','nSweden1660','nSweden1721','nBohuslan','nTrondelag','nBornholm','nAland','nOldFinland1721','nOldFinland1743',
 'nNorway1814','nSweden1815','nDenmark1864','nSchleswig','nHolstein','nNorthSchleswig1920','nSaxony1700','itPapal1815','itLazio1870'];

const chars=s=>s.replace(/<[^>]+>/g,'').replace(/（[A-Za-z][^）]*）/g,'').replace(/\s/g,'').length;

(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 try{
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:1440,height:960});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.setOfflineMode(true);
  await page.goto(pathToFileURL(target).href+'#history-nordic-ice/0',{waitUntil:'load'});
  await page.waitForFunction(()=>window.metroUI&&document.querySelector('#map .pin'));
  const r=await page.evaluate((ids,regions)=>{
   const by=id=>HISTORY_ENTRIES.find(e=>e.id===id);
   const para=(e,i)=>(e.html.match(new RegExp(`<p data-scene-text="${i}">([\\s\\S]*?)</p>`))||[])[1]||'';
   const line=id=>(({to})=>({to}))(HISTORY_BRANCHES.find(b=>b.id===id));
   const own=new Set(ids);
   return {
    nordic:line('nordic'),faith:line('faith'),
    futures:Object.fromEntries(TREE_FUTURE.filter(f=>['nordic','faith','egypt','crusade'].includes(f[0])).map(f=>[f[0],f.slice(1,3)])),
    ends:TREE_ENDS.filter(e=>['egypt','crusade'].includes(e[0])).map(e=>e.slice(0,3)),
    nordicStations:lineStations('nordic').map(s=>s.id),faithStations:lineStations('faith').map(s=>s.id),
    eras:Object.fromEntries(HISTORY_ERAS.filter(e=>['nordic-sweden','nordic-modern','faith-modern'].includes(e.id)).map(e=>[e.id,e.items.map(i=>i[0])])),
    consulate:TREE_ROWS['history-france-consulate/0'][0],lateran:TREE_ROWS['history-italy-lateran/0'][0],
    report:metroUI.layoutReport(),
    regions:regions.filter(k=>!GEO.regions[k]),
    sections:Object.fromEntries(ids.map(id=>{const e=by(id);const maps=e.scenes.map(s=>String(s.draw||''));return [id,{short:e.short,period:e.period,ch:e.ch,scenes:e.scenes.length,
     sources:e.sources.length,urls:e.sources.map(s=>s[1]||s.url),paras:e.scenes.map((_,i)=>para(e,i)),
     china:e.html.includes('另见“中国”主线'),
     elsewhere:[...e.html.matchAll(/见“([^”]+)”一节/g)].map(m=>m[1]).filter(s=>!ids.some(i=>by(i).short===s)),
     drawsRegion:maps.some(m=>regions.some(k=>m.includes(`'${k}'`)))}];})),
   };
  },Object.keys(SECTIONS),REGIONS);
  assert.deepEqual(r.nordic,{to:1920});
  assert.deepEqual(r.faith,{to:1929});
  assert.deepEqual(r.futures,{nordic:[1920,'冬季战争与北欧模式'],faith:[1929,'二战与梵二会议']},'futures of 北欧 and 基督教; 埃及 and 十字军 have none');
  assert.deepEqual(r.ends,[['egypt',642,'并入中东'],['crusade',1312,'十字军落幕']]);
  // 北欧: the four new stations follow 从登陆到和约 and close the line.
  assert.deepEqual(r.nordicStations.slice(-5),['history-nordic-peace',...NORDIC]);
  // 基督教: 废除南特敕令, the three new stations with 执政府 between the second and third, then the Lateran station.
  const f=r.faithStations,at=f.indexOf('history-france-revocation');
  assert.deepEqual(f.slice(at),['history-france-revocation',FAITH[0],FAITH[1],'history-france-consulate',FAITH[2],'history-italy-lateran']);
  assert.deepEqual(r.eras,{'nordic-sweden':NORDIC.slice(0,2),'nordic-modern':NORDIC.slice(2),'faith-modern':FAITH});
  assert.deepEqual(r.consulate,['france','faith']);
  assert.deepEqual(r.lateran,['italy','faith']);
  assert.deepEqual(r.report.unresolvedLabels,[]);
  assert.deepEqual(r.report.linkThroughStations,[]);
  assert.deepEqual(r.regions,[],'every region is in GEO.regions');
  for(const [id,[short,period,ch]] of Object.entries(SECTIONS)){
   const s=r.sections[id];
   assert.deepEqual([s.short,s.period,s.ch],[short,period,ch],id);
   assert.ok(s.scenes>=5&&s.scenes<=6,id+' scenes: '+s.scenes);
   assert.ok(s.sources>=8&&new Set(s.urls).size===s.urls.length&&s.urls.every(u=>u.startsWith('https://')),id+' reading links');
   assert.ok(s.china,id+' a Chinese comparison');
   assert.ok(s.elsewhere.length>=1,id+' points to a section of another line');
   assert.ok(s.drawsRegion,id+' draws one of the v111 regions');
   assert.equal(s.paras.filter(Boolean).length,s.scenes,id+' prose for every scene');
   s.paras.forEach((p,i)=>{
    const bold=p.match(/<strong>(.*?)<\/strong>/g)||[];
    assert.equal(bold.length,1,`${id}/${i} one bold sentence`);assert.ok(p.startsWith('<strong>'),`${id}/${i} bold comes first`);
    assert.ok(chars(bold[0])<=40,`${id}/${i} bold ${chars(bold[0])}`);assert.ok(chars(p)<=300,`${id}/${i} ${chars(p)} chars`);
    const plain=p.replace(/<[^>]+>/g,'');
    assert.ok(!/[！!]/.test(plain),`${id}/${i} no exclamation marks`);
    assert.ok(!/[？?]/.test(plain.replace(/“[^”]*”/g,'')),`${id}/${i} questions only inside quotations`);
   });
  }
  for(const [id,i,text] of FACTS){
   assert.ok(r.sections[id].paras[i].replace(/（[A-Za-z][^）]*）/g,'').includes(text),`${id}/${i}: ${text}`);
  }
  await page.close();
  assert.deepEqual(errors,[],'no page errors');
  console.log('PASS: 北欧 & 基督教 v111 — 北欧 1648—1920 in 4 sections, 基督教 1689 on in 3 via 执政府 to the Lateran station, 埃及 and 十字军 end, regions drawn, one bold opening per scene, facts pinned.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})();
