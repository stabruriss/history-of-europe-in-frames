const puppeteer=require('puppeteer-core');require('./legacy_sidebar.cjs');require('./chrome_guard.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));

// 老无 2026-11-08: 中国 runs on from 845 to 1919 in the ten stations he set (五代十国 … 辛亥民初), 拎重点;
// it also rides 蒙古西征 (with 中东 and 东欧) and 大交换 (with 美洲).
const SECTIONS={
 'history-china-five-dynasties':['五代十国','845—960年'],
 'history-china-northern-song':['北宋','960—1127年'],
 'history-china-liao-jin-xia':['辽金西夏','907—1234年'],
 'history-china-southern-song':['南宋','1127—1279年'],
 'history-china-mongols':['蒙古崛起','1206—1368年'],
 'history-china-ming':['明','1368—1582年'],
 'history-china-ming-qing':['明清易代','1582—1683年'],
 'history-china-early-qing':['清前期','1683—1796年'],
 'history-china-qing-decline':['清中晚期','1796—1895年'],
 'history-china-republic':['辛亥民初','1895—1919年'],
};
const ORDER=Object.keys(SECTIONS);

// Facts that the fact checks settled; famous sayings stay in with their credibility notes (rule 3, 老无 2026-11-08).
const FACTS=[
 ['history-china-five-dynasties',0,'黄巢'],
 ['history-china-five-dynasties',2,'石敬瑭'],
 ['history-china-northern-song',0,'杯酒释兵权'],
 ['history-china-northern-song',0,'真假今有争论'],
 ['history-china-northern-song',1,'澶渊'],
 ['history-china-northern-song',4,'王安石'],
 ['history-china-liao-jin-xia',0,'阿保机'],
 ['history-china-liao-jin-xia',3,'卡特万'],
 ['history-china-liao-jin-xia',4,'猛安谋克'],
 ['history-china-southern-song',0,'岳飞'],
 ['history-china-southern-song',4,'崖山'],
 ['history-china-mongols',0,'千户'],
 ['history-china-mongols',4,'中统钞'],
 ['history-china-mongols',5,'石人'],
 ['history-china-ming',2,'土木堡'],
 ['history-china-ming',4,'一条鞭'],
 ['history-china-ming-qing',3,'冲冠一怒为红颜'],
 ['history-china-ming-qing',4,'剃发'],
 ['history-china-ming-qing',5,'台湾府'],
 ['history-china-early-qing',0,'尼布楚'],
 ['history-china-early-qing',0,'台湾府'],
 ['history-china-early-qing',4,'天朝物产丰盈'],
 ['history-china-qing-decline',1,'南京条约'],
 ['history-china-qing-decline',3,'圆明园'],
 ['history-china-qing-decline',5,'马关'],
 ['history-china-republic',1,'辛丑'],
 ['history-china-republic',3,'武昌'],
 ['history-china-republic',4,'二十一条'],
 ['history-china-republic',5,'五四'],
];
// The maps that came with v110: each section draws at least one of the new teaching regions.
const REGIONS=['zhSong1000','zhLiao1000','zhXixia1100','zhDali1100','zhSouthernSong1142','zhJin1142','zhYuan1294','zhMing1580','zhMing1626',
 'zhQing1820','zhQing1880','zhQing1895','zhQaraKhitai1141','zhKorea1592','zhLaterJin1626','zhSanfan1673','zhZhengTaiwan1662','zhQing1683',
 'zhJapan1895','zhJapan1910','zhMongolia1911'];

const chars=s=>s.replace(/<[^>]+>/g,'').replace(/（[A-Za-z][^）]*）/g,'').replace(/\s/g,'').length;

(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 try{
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:1440,height:960});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.setOfflineMode(true);
  await page.goto(pathToFileURL(target).href+'#history-china-five-dynasties/0',{waitUntil:'load'});
  await page.waitForFunction(()=>window.metroUI&&document.querySelector('#map .pin'));
  const r=await page.evaluate((ids,regions)=>{
   const by=id=>HISTORY_ENTRIES.find(e=>e.id===id);
   const para=(e,i)=>(e.html.match(new RegExp(`<p data-scene-text="${i}">([\\s\\S]*?)</p>`))||[])[1]||'';
   const b=HISTORY_BRANCHES.find(x=>x.id==='china');
   const others=new Set(HISTORY_ENTRIES.filter(e=>e.ch!==7).map(e=>e.short));
   return {
    line:{name:b.name,from:b.from??null,to:b.to},
    ch7:HISTORY_CH[7],
    future:TREE_FUTURE.find(f=>f[0]==='china').slice(0,3),
    stations:lineStations('china').map(s=>s.id),
    eras:HISTORY_ERAS.filter(e=>e.id.startsWith('china-')).map(e=>[e.id,e.items.map(i=>i[0])]),
    report:metroUI.layoutReport(),
    sharedMongols:TREE_ROWS['history-persia-mongols/0'][0],
    sharedExchange:TREE_ROWS['history-america-exchange/0'][0],
    regions:regions.filter(k=>!GEO.regions[k]),
    sections:Object.fromEntries(ids.map(id=>{const e=by(id);const maps=e.scenes.map(s=>String(s.draw||''));return [id,{short:e.short,period:e.period,ch:e.ch,scenes:e.scenes.length,
     sources:e.sources.length,urls:e.sources.map(s=>s[1]||s.url),boxes:e.boxes.length,paras:e.scenes.map((_,i)=>para(e,i)),
     europe:[...e.html.matchAll(/见“([^”]+)”一节/g)].map(m=>m[1]).filter(s=>others.has(s)),
     drawsRegion:maps.some(m=>regions.some(k=>m.includes(`'${k}'`)))}];})),
   };
  },ORDER,REGIONS);
  assert.deepEqual(r.line,{name:'中国',from:-68000,to:1919});
  assert.equal(r.ch7,'中国对照');
  assert.deepEqual(r.future,['china',1919,'国民革命、抗战与内战']);
  // The ten stations in 老无's order after 隋唐, with 蒙古西征 and 大交换 ridden on the way.
  const tail=r.stations.slice(r.stations.indexOf('history-china-tang'));
  assert.deepEqual(tail.filter(id=>id.startsWith('history-china-')),['history-china-tang',...ORDER]);
  assert.ok(tail.includes('history-persia-mongols')&&tail.includes('history-america-exchange'),JSON.stringify(tail));
  assert.equal(tail.at(-1),'history-china-republic');
  assert.deepEqual(r.eras.slice(-3),[['china-song',ORDER.slice(0,4)],['china-yuan-ming',ORDER.slice(4,7)],['china-qing',ORDER.slice(7)]]);
  assert.deepEqual(r.sharedMongols,['persia','eeurope','china']);
  assert.deepEqual(r.sharedExchange,['america','china']);
  assert.deepEqual(r.report.unresolvedLabels,[]);
  assert.deepEqual(r.report.linkThroughStations,[]);
  assert.deepEqual(r.regions,[],'every teaching region is in GEO.regions');
  for(const [id,[short,period]] of Object.entries(SECTIONS)){
   const s=r.sections[id];
   assert.deepEqual([s.short,s.period,s.ch],[short,period,7],id);
   assert.ok(s.scenes>=5&&s.scenes<=6,id+' scenes: '+s.scenes);
   assert.ok(s.sources>=8&&new Set(s.urls).size===s.urls.length&&s.urls.every(u=>u.startsWith('https://')),id+' reading links');
   assert.ok(s.europe.length>=1,id+' points to at least one section off the 中国 line');
   assert.ok(s.drawsRegion,id+' draws one of the v110 teaching regions');
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
  console.log('PASS: 中国 v110 — 845 to 1919 in 10 sections (五代十国 … 辛亥民初), 3 eras, rides 蒙古西征 and 大交换, teaching regions drawn, one bold opening per scene, facts pinned.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})();
