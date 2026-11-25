const puppeteer=require('puppeteer-core');require('./legacy_sidebar.cjs');require('./chrome_guard.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));

// 老无 2026-11-24: Prehistory & Ancient Greece upgrade Batch 1 (8 stations, 24 scenes, 6 moments, 8 boxes, 4 new people).
const SECTIONS={
 'history-migration':['走出非洲','距今约 7万—4万年',0,2,0,1],
 'history-farming':['农业、定居与国家','约前 10000—前 3000年',0,2,0,1],
 'history-palaces':['爱琴海宫殿文明','约前 1900—前 1100年',0,3,1,1],
 'history-collapse':['晚期青铜时代崩溃','约前 1274—前 1100年',0,3,1,0],
 'history-dark-age':['希腊的延续与复苏','约前 1200／1100—前 800年',0,3,1,2],
 'history-poleis':['城邦与海外聚落','约前 800—前 600年',1,3,1,1],
 'history-sparta':['斯巴达：土地与政体','前 8—前 6世纪起',1,3,1,1],
 'history-athens':['雅典：改革与僭主','约前 621—前 508／507年',1,5,1,1],
};
const ORDER=Object.keys(SECTIONS);

const FACTS=[
 ['history-migration',0,'尼安德特人'],
 ['history-migration',1,'伊朗高原'],
 ['history-farming',0,'新月沃地'],
 ['history-farming',1,'管事的人成了管人的人'],
 ['history-palaces',0,'巴西琉斯'],
 ['history-palaces',1,'文特里斯'],
 ['history-palaces',2,'乌鲁布伦'],
 ['history-collapse',0,'哈图西里三世'],
 ['history-collapse',1,'乌加里特'],
 ['history-collapse',2,'拉美西斯三世'],
 ['history-dark-age',0,'块炼铁'],
 ['history-dark-age',0,'以色列人'],
 ['history-dark-age',1,'元音'],
 ['history-dark-age',2,'赫楞人'],
 ['history-dark-age',2,'吧啦吧啦'],
 ['history-poleis',0,'成年男性公民共同体'],
 ['history-poleis',1,'重装步兵'],
 ['history-poleis',2,'吕底亚'],
 ['history-sparta',0,'美塞尼亚'],
 ['history-sparta',1,'黑汤'],
 ['history-sparta',2,'长老会议'],
 ['history-athens',0,'六一汉'],
 ['history-athens',1,'解负令'],
 ['history-athens',2,'山地派'],
 ['history-athens',3,'帕罗斯大理石'],
 ['history-athens',4,'黑羊'],
];

const BOX_FACTS=[
 ['history-migration',0,'昴宿星团'],
 ['history-migration',0,'搜神记'],
 ['history-migration',0,'雷·诺里斯'],
 ['history-farming',1,'内部比较优势'],
 ['history-farming',1,'祭司与武士'],
 ['history-palaces',1,'威尔萨'],
 ['history-dark-age',1,'西里尔字母'],
 ['history-dark-age',2,'近邻同盟'],
 ['history-poleis',1,'技术决定战斗方式'],
 ['history-sparta',2,'保萨尼亚斯'],
 ['history-athens',4,'十将军'],
];

const PEOPLE=[
 ['history-dark-age/1','homer',/荷马问题/],
 ['history-athens/1','solon',/七贤/],
 ['history-athens/2','peisistratus',/山地派/],
 ['history-athens/4','cleisthenes',/伯里克利/],
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
      moments:e.moments.length,boxes:e.boxes,
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

  for(const [id,[short,period,ch,sc,mom,bx]] of Object.entries(SECTIONS)){
   const s=r.sections[id];
   assert.deepEqual([s.short,s.period,s.ch,s.scenes,s.moments,s.boxes.length],[short,period,ch,sc,mom,bx],id);
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
  console.log('PASS: Greece & Prehistory Batch 1 (v123) — 8 stations, 24 scenes, 6 moments, 8 boxes, 4 new figures, <=300 chars & <=40-char bold openings, zero untouched-section drift.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})();
