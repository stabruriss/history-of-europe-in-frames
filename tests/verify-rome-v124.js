const puppeteer=require('puppeteer-core');require('./legacy_sidebar.cjs');require('./chrome_guard.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));

// 老无 2026-11-27: Early Rome & Mediterranean Hegemony upgrade (8 stations, 27 scenes, 28 moments, 5 boxes)
// + 1 Gracchi street-purge box on history-rome-gracchi/1.
const SECTIONS={
 'history-rome-site':['罗马起源','约前1000—前6世纪',4,2,2,0],
 'history-rome-kings':['王政时代','前753—前509年',4,3,1,0],
 'history-rome-republic':['共和初年','前509—前493年',4,2,3,0],
 'history-rome-plebs':['等级斗争：平民撤离','前494—前449年',4,3,3,1],
 'history-rome-orders':['等级斗争：执政官开放','前445—前326年',4,3,2,0],
 'history-rome-mature':['征服意大利','前340—前264年',4,4,3,1],
 'history-rome-punic':['布匿战争','前264—前201年',4,6,9,2],
 'history-rome-east':['罗马东进','前200—前133年',4,4,5,1],
};
const ORDER=Object.keys(SECTIONS);

const FACTS=[
 ['history-rome-site',0,'盐路'],
 ['history-rome-site',1,'避难所'],
 ['history-rome-kings',0,'海盗岛'],
 ['history-rome-kings',0,'兄终弟及'],
 ['history-rome-kings',1,'大下水道'],
 ['history-rome-kings',2,'百人团'],
 ['history-rome-republic',0,'三方牌桌'],
 ['history-rome-republic',1,'卡西乌斯条约'],
 ['history-rome-plebs',0,'辛辛纳图斯'],
 ['history-rome-plebs',1,'刑不可知，则威不可测'],
 ['history-rome-plebs',2,'瓦勒里乌斯'],
 ['history-rome-orders',0,'维爱'],
 ['history-rome-orders',1,'阿里亚河'],
 ['history-rome-orders',2,'波提利乌斯法'],
 ['history-rome-mature',0,'分层会员制'],
 ['history-rome-mature',1,'三线中队制'],
 ['history-rome-mature',2,'潘多拉魔盒'],
 ['history-rome-mature',3,'贝内文图姆'],
 ['history-rome-punic',0,'埃加迪群岛'],
 ['history-rome-punic',1,'哈米尔卡·巴卡'],
 ['history-rome-punic',2,'八千奴隶'],
 ['history-rome-punic',3,'梅陶罗河'],
 ['history-rome-punic',4,'扎马'],
 ['history-rome-punic',5,'克劳狄法'],
 ['history-rome-east',0,'库诺斯克法莱'],
 ['history-rome-east',1,'皮德纳'],
 ['history-rome-east',2,'第三次布匿战争'],
 ['history-rome-east',3,'努曼提亚'],
];

const BOX_FACTS=[
 ['history-rome-plebs',0,'迈利乌斯'],
 ['history-rome-plebs',0,'权威'],
 ['history-rome-mature',1,'三线中队制'],
 ['history-rome-punic',2,'费边社'],
 ['history-rome-punic',2,'光脚的不怕穿鞋的'],
 ['history-rome-east',3,'自己小，敌人富'],
 ['history-rome-east',3,'整包充值给了军头'],
];

const PEOPLE=[
 ['history-rome-site/1','romulus',/罗慕路斯/],
 ['history-rome-plebs/0','cincinnatus',/迈利乌斯/],
 ['history-rome-orders/1','aristotle',/卢基乌斯/],
 ['history-rome-orders/2','licinius-stolo',/李锡尼/],
 ['history-rome-mature/3','pyrrhus',/皮洛士/],
 ['history-rome-punic/1','hamilcar-barca',/哈米尔卡/],
 ['history-rome-punic/2','hannibal',/利用胜利/],
 ['history-rome-punic/2','fabius-maximus',/跟班/],
 ['history-rome-punic/3','archimedes',/叙拉古/],
 ['history-rome-punic/4','scipio-africanus',/新迦太基/],
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
  await page.goto(pathToFileURL(target).href+'#history-rome-site/0',{waitUntil:'load'});
  await page.waitForFunction(()=>window.metroUI&&document.querySelector('#map'));
  const r=await page.evaluate(ids=>{
   const by=id=>HISTORY_ENTRIES.find(e=>e.id===id);
   const para=(e,i)=>(e.html.match(new RegExp(`<p data-scene-text="${i}">([\\s\\S]*?)</p>`))||[])[1]||'';
   const gr=by('history-rome-gracchi');
   return {
    report:metroUI.layoutReport(),
    gracchiBoxes:gr.boxes,
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

  assert.deepEqual(r.report.unresolvedLabels,[]);
  assert.deepEqual(r.report.linkThroughStations,[]);

  // Verify old automatic gloss bugs in Rome 1-8 are gone
  const allText=ORDER.map(id=>JSON.stringify(r.sections[id])).join('\n');
  for(const bad of ['Sextus Pompey','科克（Cork）','辛辛纳图斯（Tus）','昆图斯（Tus）','萨莫（Samo）','卡米卢斯（Mulhouse）','裂岩（Split Rock）','约翰（John, King']){
   assert.ok(!allText.includes(bad),'bad gloss left: '+bad);
  }

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

  // Verify Laowu verbatim final box 《公民兵制度的极限》 has 8 paragraphs and zero auto-inserted Latin glosses
  const limitBox=r.sections['history-rome-east'].boxes.find(b=>b.name==='公民兵制度的极限');
  assert.ok(limitBox,'《公民兵制度的极限》 present');
  assert.equal((limitBox.text.match(/<p>/g)||[]).length,8,'8 paragraphs verbatim');
  assert.ok(!/（[A-Za-z][^）]*）/.test(limitBox.text),'verbatim box untouched by annotate_en');

  // Verify new Gracchi street-purge box on history-rome-gracchi/1
  assert.equal(r.gracchiBoxes.length,1,'history-rome-gracchi has 1 new box');
  assert.equal(r.gracchiBoxes[0].scene,1);
  assert.ok(/凳腿私刑/.test(r.gracchiBoxes[0].text)&&/最后决议/.test(r.gracchiBoxes[0].text),'gracchi box content');

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
  console.log('PASS: Early Rome upgrade + Gracchi purge box (v124) — 8 stations, 27 scenes, 28 moments, 6 boxes (incl. verbatim 《公民兵制度的极限》 & Gracchi purge), 3 new + 2 reused figures.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})();
