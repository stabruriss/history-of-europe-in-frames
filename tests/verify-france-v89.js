const puppeteer=require('puppeteer-core');require('./legacy_sidebar.cjs');require('./chrome_guard.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));

// 老无 2026-11-07/08: 法兰西 from the Fronde (1643) to Brumaire (1799), 21 new sections (124 scenes),
// plus 光荣革命 shared with 不列颠, 比利牛斯和约 and 西班牙王位继承战争 shared with 西班牙, 废除南特敕令 shared with 基督教.
const SECTIONS={
 'history-france-fronde':['投石党','1643—1653年',6],
 'history-france-pyrenees':['比利牛斯和约','1648—1660年',5],
 'history-france-louis14':['太阳王亲政','1653—1715年',6],
 'history-france-dutch-war':['荷兰战争与沃邦','1665—1684年',6],
 'history-france-revocation':['废除南特敕令','1629—1689年',6],
 'history-france-nine-years':['九年战争与大饥荒','1688—1697年',6],
 'history-france-spanish-succession':['西班牙王位继承战争','1665—1714年',6],
 'history-france-law':['太阳落山与约翰·劳','1711—1729年',6],
 'history-france-louis15':['路易十五','1723—1757年',6],
 'history-france-enlightenment':['启蒙','1721—1784年',6],
 'history-france-seven-years':['七年战争','1754—1763年',6],
 'history-france-parlements':['高等法院','1761—1776年',6],
 'history-france-american-war':['赢了美国，输了钱袋','1776—1786年',6],
 'history-france-bankruptcy':['国库见底','1786—1789年',6],
 'history-france-bastille':['网球场与巴士底','1789年',6],
 'history-france-august':['拆掉旧制度','1789年',6],
 'history-france-varennes':['新法国与国王出逃','1790—1791年',6],
 'history-france-regicide':['战争与弑君','1791—1793年',6],
 'history-france-terror':['恐怖与热月','1793—1794年',6],
 'history-france-directory':['督政府','1794—1799年',6],
 'history-france-brumaire':['雾月政变','1799年',5],
 'history-france-consulate':['执政府','1800—1804年',6],
 'history-france-empire':['拿破仑帝国','1805—1811年',6],
 'history-france-waterloo':['从莫斯科到滑铁卢','1810—1815年',6],
 'history-france-restoration':['复辟与七月革命','1815—1830年',6],
 'history-france-july-monarchy':['七月王朝','1830—1848年',6],
 'history-france-1848':['1848年革命','1848年',6],
 'history-france-louis-bonaparte':['路易·波拿巴的雾月十八','1848—1852年',6],
};
const ORDER=['history-france-fronde/0','history-france-pyrenees/0','history-france-louis14/0','history-france-dutch-war/0',
 'history-france-revocation/0','history-britain-glorious/0','history-france-nine-years/0','history-france-spanish-succession/0',
 'history-france-law/0','history-france-louis15/0','history-france-enlightenment/0','history-france-seven-years/0',
 'history-france-parlements/0','history-france-american-war/0','history-france-bankruptcy/0','history-france-bastille/0',
 'history-france-august/0','history-france-varennes/0','history-france-regicide/0','history-france-terror/0',
 'history-france-directory/0','history-france-brumaire/0','history-france-consulate/0','history-france-empire/0',
 'history-france-waterloo/0','history-france-restoration/0','history-france-july-monarchy/0','history-france-1848/0',
 'history-france-louis-bonaparte/0'];
const FACTS=[
 ['history-france-fronde',1,'卖官鬻爵'],['history-france-fronde',2,'老法官布鲁塞尔'],['history-france-fronde',3,'所查当时记载未见'],
 ['history-france-pyrenees',2,'五百万里弗尔'],['history-france-pyrenees',4,'五十万金埃居'],
 ['history-france-louis14',1,'嘚瑟'],['history-france-louis14',2,'大禹style'],['history-france-louis14',3,'后人附会'],['history-france-louis14',4,'架空'],
 ['history-france-dutch-war',3,'下苦工打呆仗'],['history-france-revocation',3,'撕毁承诺'],['history-france-revocation',4,'十五到二十万'],
 ['history-france-nine-years',3,'一百三十万'],['history-france-nine-years',4,'二十二等'],
 ['history-france-spanish-succession',1,'四面包抄'],['history-france-spanish-succession',2,'一个人占两个茅坑'],['history-france-spanish-succession',3,'索尔兹伯里'],['history-france-spanish-succession',5,'阿西恩托'],
 ['history-france-law',0,'溺爱'],['history-france-law',3,'二十八亿'],['history-france-law',4,'银子做期货'],
 ['history-france-louis15',2,'替普鲁士国王干活'],['history-france-louis15',3,'新钱想更像老钱'],
 ['history-france-enlightenment',2,'马勒泽布'],['history-france-enlightenment',5,'大V'],
 ['history-france-seven-years',0,'4.0%'.slice(0,0)+'哈布斯堡'],['history-france-seven-years',2,'3.1%'],['history-france-seven-years',2,'4.0%'],['history-france-seven-years',4,'普拉西'],
 ['history-france-parlements',2,'科西嘉'],['history-france-parlements',3,'莫普'],['history-france-parlements',5,'开始改革的时候'],
 ['history-france-american-war',3,'切萨皮克湾'],['history-france-american-war',5,'神棍'],
 ['history-france-bankruptcy',3,'五分之二'],['history-france-bankruptcy',4,'面瓜'],['history-france-bankruptcy',5,'第三等级是什么'],
 ['history-france-bastille',4,'七个人'],['history-france-bastille',5,'附会'],
 ['history-france-august',1,'赎'],['history-france-august',4,'面包师'],['history-france-august',5,'指券'],
 ['history-france-varennes',0,'八十三个省'],['history-france-varennes',3,'德鲁埃'],
 ['history-france-regicide',3,'瓦尔密'],['history-france-regicide',5,'361'],
 ['history-france-terror',2,'二十四岁'],['history-france-terror',4,'屠龙少年终成恶龙'],['history-france-terror',5,'吃鸡'],
 ['history-france-directory',1,'霰弹'],['history-france-directory',4,'三分之二'],['history-france-directory',5,'罗塞塔'],
 ['history-france-brumaire',0,'一把剑'],['history-france-brumaire',2,'吕西安'],['history-france-brumaire',4,'它结束了'],
 ['history-france-consulate',1,'法兰西银行'],['history-france-consulate',3,'奶牛'],['history-france-consulate',4,'这是错误'],['history-france-consulate',5,'当什么假齐王'],
 ['history-france-empire',2,'世界精神'],['history-france-empire',3,'荷兰国王路易'],['history-france-empire',3,'路易-拿破仑'],['history-france-empire',3,'路易·波拿巴'],['history-france-empire',5,'新钱'],
 ['history-france-waterloo',1,'米纳德'],['history-france-waterloo',2,'眉来眼去'],['history-france-waterloo',5,'睡狮'],
 ['history-france-restoration',3,'苍蝇拍'],['history-france-restoration',5,'桃子'],
 ['history-france-july-monarchy',2,'路易·波拿巴'],['history-france-july-monarchy',4,'发财'],['history-france-july-monarchy',5,'火山'],
 ['history-france-1848',1,'三色旗'],['history-france-1848',3,'四十五生丁'],['history-france-1848',3,'下沉市场'],
 ['history-france-louis-bonaparte',0,'傻瓜'],['history-france-louis-bonaparte',2,'三百万'],['history-france-louis-bonaparte',5,'第一次是悲剧，第二次是笑剧'],
];
const BOXES={'history-france-pyrenees':'婚约原文怎么写','history-france-louis14':'凡尔赛的一天','history-france-revocation':'国王数学家',
 'history-france-spanish-succession':'三位候选人的血缘','history-france-enlightenment':'《百科全书》与《四库全书》',
 'history-france-seven-years':'英法借钱的价钱（1755—1798年）','history-france-varennes':'瓦伦路上的一天一夜',
 'history-france-regicide':'断头台：为平等发明的死法','history-france-terror':'恐怖统治死了多少人',
 'history-france-waterloo':'米纳德的那张图：四十二万人怎样缩成一万','history-france-louis-bonaparte':'1789—1852年法国政体轮换表'};
const chars=s=>s.replace(/<[^>]+>/g,'').replace(/（[A-Za-z][^）]*）/g,'').replace(/\s/g,'').length;

(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 try{
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:1440,height:960});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.setOfflineMode(true);
  await page.goto(pathToFileURL(target).href+'#history-france-fronde/0',{waitUntil:'load'});
  await page.waitForFunction(()=>window.metroUI&&document.querySelector('#map .pin'));
  const r=await page.evaluate(ids=>{
   const by=id=>HISTORY_ENTRIES.find(e=>e.id===id);
   const para=(e,i)=>(e.html.match(new RegExp(`<p data-scene-text="${i}">([\\s\\S]*?)</p>`))||[])[1]||'';
   const fStops=metroUI.data.lineStops.get('france').map(s=>s.key);
   const idx=fStops.indexOf('history-france-fronde/0');
   return {
    line:(({name,parent,from,to})=>({name,parent,from,to}))(HISTORY_BRANCHES.find(b=>b.id==='france')),
    spainTo:HISTORY_BRANCHES.find(b=>b.id==='spain').to,
    faithTo:HISTORY_BRANCHES.find(b=>b.id==='faith').to,
    stretch:idx>=0?fStops.slice(idx,idx+29):[],
    report:metroUI.layoutReport(),
    shared:{
     pyrenees:TREE_ROWS['history-france-pyrenees/0'][0],
     revocation:TREE_ROWS['history-france-revocation/0'][0],
     glorious:TREE_ROWS['history-britain-glorious/0'][0],
     succession:TREE_ROWS['history-france-spanish-succession/0'][0],
    },
    glorious0:para(by('history-britain-glorious'),0).replace(/（[A-Za-z][^）]*）/g,''),
    rateBox:by('history-france-seven-years').boxes[0]?.text||'',
    sections:Object.fromEntries(ids.map(id=>{const e=by(id);return [id,{short:e.short,period:e.period,ch:e.ch,scenes:e.scenes.length,sources:e.sources.length,
     urls:e.sources.map(s=>s[1]||s.url),html:e.html,paras:e.scenes.map((_,i)=>para(e,i)),boxes:e.boxes.map(b=>b.name||b.title)}];})),
   };
  },Object.keys(SECTIONS));
  assert.equal(r.line.name,'法兰西');assert.equal(r.line.parent,'west');assert.equal(r.line.from,843);assert.ok(r.line.to>=1852);
  assert.ok(r.spainTo>=1714);assert.ok(r.faithTo>=1689);
  assert.deepEqual(r.stretch,ORDER,'France runs through the 29 stations from Fronde to Louis-Napoléon Bonaparte (including Glorious Revolution) in order');
  assert.deepEqual(r.report.unresolvedLabels,[]);
  assert.deepEqual(r.report.linkThroughStations,[]);
  assert.ok(r.shared.pyrenees.includes('france')&&r.shared.pyrenees.includes('spain'));
  assert.ok(r.shared.revocation.includes('france')&&r.shared.revocation.includes('faith'));
  assert.ok(r.shared.glorious.includes('britain')&&r.shared.glorious.includes('france'));
  assert.ok(r.shared.succession.includes('france')&&r.shared.succession.includes('spain'));
  assert.ok(r.glorious0.includes('南特敕令'),'Glorious Revolution scene 0 connects from Revocation of the Edict of Nantes');
  for(const num of ['7460万镑','1.327亿镑','103%','2.429亿镑','136%','3.1%','4.0%','5.2%','5.9%','终身年金']){
   assert.ok(r.rateBox.includes(num),'rate box has unified BoE figure '+num);
  }
  for(const [id,[short,period,n]] of Object.entries(SECTIONS)){
   const s=r.sections[id];
   assert.deepEqual([s.short,s.period,s.ch,s.scenes],[short,period,5,n],id);
   assert.ok(s.sources>=8&&new Set(s.urls).size===s.urls.length&&s.urls.every(u=>u.startsWith('https://')),id+' reading links');
   assert.ok(s.html.includes('另见“中国”主线'),id+' Chinese comparison');
   assert.equal(s.paras.filter(Boolean).length,n,id+' prose for every scene');
   // Broussel must not be annotated as Brussels.
   assert.ok(!s.html.includes('老法官布鲁塞尔（Brussels）'),id+' Broussel not Brussels');
   s.paras.forEach((p,i)=>{
    const bold=p.match(/<strong>(.*?)<\/strong>/g)||[];
    assert.equal(bold.length,1,`${id}/${i} one bold sentence`);assert.ok(p.startsWith('<strong>'),`${id}/${i} bold comes first`);
    assert.ok(chars(bold[0])<=40,`${id}/${i} bold ${chars(bold[0])}`);assert.ok(chars(p)<=300,`${id}/${i} ${chars(p)} chars`);
    assert.ok(!/[！？!?]/.test(p.replace(/<[^>]+>/g,'')),`${id}/${i} no question or exclamation marks`);
   });
   if(BOXES[id])assert.ok(s.boxes.includes(BOXES[id]),id+' box '+BOXES[id]);
  }
  for(const [id,i,text] of FACTS){
   assert.ok(r.sections[id].paras[i].replace(/（[A-Za-z][^）]*）/g,'').includes(text),`${id}/${i}: ${text}`);
  }
  await page.close();
  assert.deepEqual(errors,[],'no page errors');
  console.log('PASS: 法兰西 v89/v91 — 28 new sections (166 scenes) from the Fronde (1643) to Louis-Napoléon Bonaparte (1852), interchanges, BoE interest-rate box & source checks verified.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})();
