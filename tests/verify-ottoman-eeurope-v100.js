const puppeteer=require('puppeteer-core');require('./legacy_sidebar.cjs');require('./chrome_guard.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));

// 老无 2026-11-08: 波斯—阿拉伯 renamed to 中东 and extended from 1501 to 1923 (7 Ottoman sections),
// 东欧 extended from 1505 to 1922 (6 Russian/Polish sections + 从莫斯科到滑铁卢, 克里米亚战争, 第一次世界大战 shared).
const SECTIONS={
 'history-ottoman-suleiman':['塞利姆与苏莱曼',9],
 'history-ottoman-lepanto':['勒班陀之后',9],
 'history-ottoman-eastern-question':['东方问题',9],
 'history-ottoman-crimea':['克里米亚战争',9],
 'history-ottoman-berlin':['改革、外债与柏林会议',9],
 'history-ottoman-ww1':['奥斯曼的最后一战',9],
 'history-ottoman-kemal':['凯末尔与土耳其共和国',9],
 'history-eeurope-ivan4':['伊凡雷帝',10],
 'history-eeurope-romanov':['混乱时代与罗曼诺夫',10],
 'history-eeurope-peter':['彼得大帝',10],
 'history-eeurope-catherine':['叶卡捷琳娜与瓜分波兰',10],
 'history-eeurope-reform':['农奴解放到1905年',10],
 'history-eeurope-october':['十月革命与苏联',10],
};

const FACTS=[
 ['history-ottoman-suleiman',0,'查尔迪兰'],
 ['history-ottoman-suleiman',3,'维也纳'],
 ['history-ottoman-lepanto',2,'泰兹詹'],
 ['history-ottoman-lepanto',5,'卡尔洛维茨'],
 ['history-ottoman-eastern-question',0,'库楚克开纳吉'],
 ['history-ottoman-eastern-question',3,'1826'],
 ['history-ottoman-crimea',3,'塞瓦斯托波尔'],
 ['history-ottoman-berlin',1,'1881'],
 ['history-ottoman-berlin',4,'俾斯麦'],
 ['history-ottoman-ww1',2,'达达尼尔'],
 ['history-ottoman-kemal',3,'洛桑'],
 ['history-eeurope-ivan4',2,'卢布林'],
 ['history-eeurope-ivan4',3,'特辖'],
 ['history-eeurope-romanov',2,'会议法典'],
 ['history-eeurope-romanov',5,'尼布楚'],
 ['history-eeurope-peter',1,'纳尔瓦'],
 ['history-eeurope-peter',3,'波尔塔瓦'],
 ['history-eeurope-catherine',4,'否决'],
 ['history-eeurope-reform',0,'49年'],
 ['history-eeurope-october',2,'立宪会议'],
 ['history-eeurope-october',3,'布列斯特'],
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
  await page.goto(pathToFileURL(target).href+'#history-ottoman-suleiman/0',{waitUntil:'load'});
  await page.waitForFunction(()=>window.metroUI&&document.querySelector('#map .pin'));
  const r=await page.evaluate(ids=>{
   const by=id=>HISTORY_ENTRIES.find(e=>e.id===id);
   const para=(e,i)=>(e.html.match(new RegExp(`<p data-scene-text="${i}">([\\s\\S]*?)</p>`))||[])[1]||'';
   const line=id=>(({name,parent,from,to})=>({name,parent,from,to}))(HISTORY_BRANCHES.find(b=>b.id===id));
   return {
    persia:line('persia'),
    eeurope:line('eeurope'),
    ch9:HISTORY_CH[9],
    ch10:HISTORY_CH[10],
    futurePersia:TREE_FUTURE.find(f=>f[0]==='persia').slice(0,3),
    futureEeurope:TREE_FUTURE.find(f=>f[0]==='eeurope').slice(0,3),
    report:metroUI.layoutReport(),
    sharedWaterloo:TREE_ROWS['history-france-waterloo/0'][0],
    sharedCrimea:TREE_ROWS['history-ottoman-crimea/0'][0],
    sharedWw1:TREE_ROWS['history-ottoman-ww1/0'][0],
    sections:Object.fromEntries(ids.map(id=>{const e=by(id);return [id,{short:e.short,period:e.period,ch:e.ch,scenes:e.scenes.length,sources:e.sources.length,
     urls:e.sources.map(s=>s[1]||s.url),html:e.html,boxes:e.boxes.length,paras:e.scenes.map((_,i)=>para(e,i))}];})),
   };
  },Object.keys(SECTIONS));
  assert.deepEqual(r.persia,{name:'中东',parent:'prehistory',from:-4000,to:1923});
  assert.deepEqual(r.eeurope,{name:'东欧',parent:'trunk',from:-700,to:1922});
  assert.equal(r.ch9,'中东');
  assert.equal(r.ch10,'东欧');
  assert.deepEqual(r.futurePersia,['persia',1923,'土耳其共和国与现代中东']);
  assert.deepEqual(r.futureEeurope,['eeurope',1922,'斯大林与冷战']);
  assert.deepEqual(r.report.unresolvedLabels,[]);
  assert.deepEqual(r.report.linkThroughStations,[]);
  assert.deepEqual(r.sharedWaterloo,['france','eeurope','germany']);
  assert.deepEqual(r.sharedCrimea,['persia','eeurope']);
  assert.equal(r.sharedWw1,'persia');
  for(const [id,[short,ch]] of Object.entries(SECTIONS)){
   const s=r.sections[id];
   assert.deepEqual([s.short,s.ch],[short,ch],id);
   assert.ok(s.scenes>=5&&s.scenes<=6,id+' scenes: '+s.scenes);
   assert.ok(s.sources>=8&&new Set(s.urls).size===s.urls.length&&s.urls.every(u=>u.startsWith('https://')),id+' reading links');
   assert.ok(s.html.includes('另见“中国”主线'),id+' Chinese comparison');
   assert.equal(s.paras.filter(Boolean).length,s.scenes,id+' prose for every scene');
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
  console.log('PASS: 中东 (奥斯曼) & 东欧 v100 — 波斯—阿拉伯 renamed to 中东 and extended to 1923, 东欧 extended to 1922, 13 new sections, 3 interchanges verified.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})();
