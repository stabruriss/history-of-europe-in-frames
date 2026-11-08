const puppeteer=require('puppeteer-core');require('./legacy_sidebar.cjs');require('./chrome_guard.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));

// 老无 2026-11-06: 美洲 is a line of its own that does not fork. It starts with one section on the Americas before the voyages, joins the
// voyages at 1492, and runs on to the Mayflower and the Puritans' city upon a hill. It is there to explain Europe, so what touches Europe is shared.
const LINE=[['history-america-before/0',['america']],['history-spain-1492/0',['spain','america']],['history-america-exchange/0',['america','china']],
 ['history-america-france/0',['america','france']],['history-spain-armada/0',['spain','lowlands','america','britain']],['history-america-virginia/0',['america']],
 ['history-america-dutch/0',['america','lowlands']],['history-america-mayflower/0',['america','faith']],['history-america-hill/0',['america','faith']]];
const SECTIONS={'history-america-before':['大航海之前的美洲','约前13000—1492年',6],'history-america-exchange':['大交换','1492—约1650年',6],
 'history-america-france':['法国人的美洲','1522—1635年',5],'history-america-virginia':['弗吉尼亚','1584—1624年',6],'history-america-dutch':['荷兰人的美洲','1609—1654年',4],
 'history-america-mayflower':['五月花号','1534—1621年',6],'history-america-hill':['山巅之城','1629—1648年',6]};
// What the sources made us set straight, and the two links back to Europe that come from the original texts.
const FACTS=[['history-america-mayflower',2,'十二年休战到头了'],['history-america-hill',0,'筑起堡垒，抵挡耶稣会士'],['history-america-hill',0,'欧洲其他教会都已沦为荒场'],
 ['history-america-mayflower',3,'信徒约四十人，连家属仆人约六十人'],['history-america-mayflower',4,'41名男子签字'],['history-america-mayflower',4,'后人奉为民主的起点，当时是救急'],
 ['history-america-mayflower',5,'用英语说“欢迎”'],['history-america-mayflower',5,'年年过的全国感恩节要到1863年'],['history-america-hill',4,'康涅狄格民兵'],
 ['history-america-hill',5,'1642年哈佛首届毕业生'],['history-america-virginia',3,'二百四十人饿到只剩六十'],['history-america-virginia',5,'法院撤销特许状'],
 ['history-america-france',2,'美国国家公园局算245人'],['history-america-dutch',2,'“60盾”只见于一封信'],['history-america-exchange',1,'1503到1660年'],
 // v83 said more than the sources do.
 ['history-spain-armada',2,'1586年5月玛丽·斯图亚特密信西班牙大使门多萨'],['history-spain-philips',4,'被荷兰打垮'],['history-spain-philips',3,'截获新西班牙银船队'],
 ['history-spain-netherlands-2',1,'在布鲁塞尔突然病逝'],['history-spain-netherlands-2',2,'在军营发热病死']];
const GONE=[['history-spain-philips','全歼'],['history-spain-netherlands-2','忧愤'],['history-spain-netherlands-2','逼得暴病'],['history-spain-armada','传位遗嘱'],
 ['history-america-mayflower','环球旅行']];
const MOMENTS={'history-america-before':['马尼的火','能喝的钱'],'history-america-exchange':['阿科斯塔笑亚里士多德'],'history-america-france':['“请把亚当的遗嘱拿来看看”','两块牌子'],
 'history-america-virginia':['木桩上的 CROATOAN','海难变成《暴风雨》','罗利最后的黄金梦'],'history-america-dutch':['一封报账信'],
 'history-america-mayflower':['枕头下的钥匙','斯宽托绕大西洋一圈'],'history-america-hill':['“山巅之城”']};
const BOXES={'history-america-exchange':'大交换账本','history-america-dutch':'战与和的节拍表','history-america-hill':'六种殖民模式'};
const chars=s=>s.replace(/<[^>]+>/g,'').replace(/（[A-Za-z][^）]*）/g,'').replace(/\s/g,'').length;

(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 try{
  for(const [width,height,label] of [[1440,960,'desktop'],[390,844,'390']]){
   const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height});
   await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
   await page.setOfflineMode(true);
   await page.goto(pathToFileURL(target).href+'#history-america-before/0',{waitUntil:'load'});
   await page.waitForFunction(()=>window.metroUI&&document.querySelector('#map .pin'));
   const r=await page.evaluate(()=>{
    const by=id=>HISTORY_ENTRIES.find(e=>e.id===id);
    const para=(e,i)=>(e.html.match(new RegExp(`<p data-scene-text="${i}">([\\s\\S]*?)</p>`))||[])[1]||'';
    return {
     line:(({name,parent,from,to})=>({name,parent,from,to}))(HISTORY_BRANCHES.find(b=>b.id==='america')),
     stops:metroUI.data.stations.filter(s=>s.lines.includes('america')).sort((a,b)=>a.t-b.t).map(s=>[s.key,s.lines]),
     future:TREE_FUTURE.find(f=>f[0]==='america').slice(0,3),
     report:metroUI.layoutReport().linkThroughStations||[],
     renamed:by('history-spain-1492').short,
     oldName:HISTORY_ENTRIES.filter(e=>[e.short,e.html,...e.moments.map(m=>m.text),...e.boxes.map(b=>b.text)].join(' ').includes('天主教双王与1492')).map(e=>e.id),
     sections:Object.fromEntries(HISTORY_ENTRIES.filter(e=>e.id.startsWith('history-america-')).map(e=>[e.id,{short:e.short,period:e.period,ch:e.ch,scenes:e.scenes.length,sources:e.sources.length,
      urls:e.sources.map(s=>s[1]||s.url),html:e.html,paras:e.scenes.map((_,i)=>para(e,i)),moments:e.moments.map(m=>m.name||m.title),boxes:e.boxes.map(b=>b.name||b.title)}])),
     texts:Object.fromEntries(['history-spain-armada','history-spain-philips','history-spain-netherlands-2','history-america-mayflower','history-america-hill','history-america-virginia','history-america-france','history-america-dutch','history-america-exchange']
      .map(id=>{const e=by(id);return [id,{paras:e.scenes.map((_,i)=>para(e,i)),all:[e.html,...e.moments.map(m=>(m.name||m.title)+m.text),...e.boxes.map(b=>(b.name||b.title)+b.text)].join(' ')}];})),
    };
   });
   assert.deepEqual(r.line,{name:'美洲',from:1430,to:1920},'starts by itself, no fork: there is no parent');
   assert.deepEqual(r.stops.slice(0,LINE.length),LINE,'the initial stations in order, with what they share');
   assert.deepEqual(r.future,['america',1920,'大萧条、罗斯福新政与二战']);
   assert.deepEqual(r.report,[],'no dashed link runs through a station');
   assert.equal(r.renamed,'大航海与美洲征服');assert.deepEqual(r.oldName,[],'the old station name is gone from the text');
   assert.ok(Object.keys(SECTIONS).every(k=>k in r.sections));
   for(const [id,[short,period,n]] of Object.entries(SECTIONS)){
    const s=r.sections[id];
    assert.deepEqual([s.short,s.period,s.ch,s.scenes],[short,period,14,n],id);
    assert.ok(s.sources>=8&&new Set(s.urls).size===s.urls.length&&s.urls.every(u=>u.startsWith('https://')),id+' reading links');
    assert.ok(s.html.includes('另见“中国”主线'),id+' Chinese comparison');
    assert.equal(s.paras.filter(Boolean).length,n,id+' prose for every scene');
    s.paras.forEach((p,i)=>{
     const bold=p.match(/<strong>(.*?)<\/strong>/g)||[];
     assert.equal(bold.length,1,`${id}/${i} one bold sentence`);assert.ok(p.startsWith('<strong>'),`${id}/${i} bold comes first`);
     assert.ok(chars(bold[0])<=40,`${id}/${i} bold ${chars(bold[0])}`);assert.ok(chars(p)<=300,`${id}/${i} ${chars(p)} chars`);
     assert.ok(!/[！？!?]/.test(p.replace(/<[^>]+>/g,'')),`${id}/${i} no question or exclamation marks`);
    });
    assert.deepEqual(s.moments,MOMENTS[id],id+' moments');
    if(BOXES[id])assert.ok(s.boxes.includes(BOXES[id]),id+' box');
   }
   for(const [id,i,text] of FACTS)assert.ok(r.texts[id].paras[i].replace(/（[A-Za-z][^）]*）/g,'').includes(text),`${id}/${i}: ${text}`);
   for(const [id,text] of GONE)assert.ok(!r.texts[id].all.includes(text),`${id} no longer says ${text}`);
   // The reader: every new section opens on the line, with a map, nothing wider than the screen.
   for(const id of Object.keys(SECTIONS)){
    await page.evaluate(i=>go(i,{scene:0}),id);
    await page.waitForFunction(()=>document.querySelector('#map .pin'));
    const v=await page.evaluate(()=>({pins:document.querySelectorAll('#map .pin').length,over:document.documentElement.scrollWidth-innerWidth}));
    assert.ok(v.pins>0,`${label} ${id} has pins`);assert.ok(v.over<=1,`${label} ${id} overflows by ${v.over}`);
   }
   await page.close();
  }
  assert.deepEqual(errors,[],'no page errors');
  console.log('PASS: 美洲 — a line of its own, no fork: 9 stations (7 new sections, 39 scenes; 大航海与美洲征服 and 英西海战与无敌舰队 shared), 5 new interchanges, '
   +'future 十三殖民地与美国独立; one bold sentence ≤40 chars and ≤300 chars a scene, no question or exclamation marks; the corrections from the sources and v83 in plain text; '
   +'desktop and 390px offline; no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})();
