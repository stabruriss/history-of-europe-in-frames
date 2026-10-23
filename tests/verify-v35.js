const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const shots=path.join(__dirname,'shots-v35');require('node:fs').mkdirSync(shots,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// 老无 2026-10-22 晚: the imperial line after Justinian, by dynasty and with its logic up front —
// Justinian's bills beside Emperor Wu of Han; Constans II's Typos and the pope and monk punished for breaking it; what came after
// his death; doctrine flaring up again when the outside pressure eased; four "藩镇" and emperors taking turns; Leo III and the icons;
// the empress turning the pancake over, Charlemagne and the two Leos; then turmoil again, and the Macedonians to the schism of 1054.
const ERAS=[['empire-east','东罗马：利奥王朝与查士丁尼王朝',[['history-empire-leo'],['history-empire-justinian']]],
 ['empire-heraclian','东罗马：希拉克略王朝与二十年无政府',[['history-empire-heraclius'],['history-empire-constans'],['history-empire-anarchy']]],
 ['empire-iconoclasm','东罗马：圣像之争时代',[['history-empire-isaurian'],['history-empire-amorian']]],
 ['empire-macedonian','东罗马：马其顿王朝',[['history-empire-macedonian',0,2],['history-empire-macedonian',3,3,'东西教会大分裂']]]];
const SHORTS={'history-empire-justinian':['查士丁尼王朝','518—602年',7],'history-empire-heraclius':['希拉克略王朝','602—641年',5],
 'history-empire-constans':['希拉克略王朝（下）','641—711年',6],'history-empire-anarchy':['二十年无政府','695—717年',2],
 'history-empire-isaurian':['伊苏里亚王朝','717—802年',6],'history-empire-amorian':['阿莫里亚王朝','802—867年',4],'history-empire-macedonian':['马其顿王朝','867—1056年',4]};
const EAST_TAIL=['history-empire-leo/0','history-empire-justinian/0','history-empire-heraclius/0','history-arab-conquest/0','history-empire-constans/0',
 'history-empire-anarchy/0','history-empire-isaurian/0','history-empire-amorian/0','history-empire-macedonian/0','history-empire-macedonian/3'];
const FAITH_TAIL=['history-faith-papacy/0','history-faith-three-chapters/0','history-empire-constans/0','history-empire-isaurian/0','history-empire-amorian/0','history-empire-macedonian/3'];
const SHARED=['history-empire-constans/0','history-empire-isaurian/0','history-empire-amorian/0','history-empire-macedonian/3'];
// 老无's own words, verbatim and bold (教皇 → 教宗, leo → 利奥, 伊苏利亚 → 伊苏里亚, as everywhere in the atlas).
const BOLD=[['history-empire-justinian/6','查士丁尼身后和汉武帝一样'],['history-empire-justinian/6','土地：征服后又很快失去'],['history-empire-justinian/6','军队：损失惨重'],
 ['history-empire-justinian/6','内政：教义暴乱，民变'],['history-empire-justinian/6','财政：崩溃'],
 ['history-empire-constans/1','被抓流放的教宗和被砍手割舌的“教宗小弟”，都是因为违反《谕令》'],['history-empire-constans/2','他死之后事情怎么样了？'],
 ['history-empire-constans/4','后来又开始教义纷争是因为外敌的压力减小了，所以教士团体内部就开始争权，皇帝就镇不住了。这个前面说的一开始皇权强大的时候没有定于一尊，后来导致教士坐大，开始互相争，还和皇帝叫板的逻辑一脉相承'],
 ['history-empire-constans/5','一开始还能把教宗抓到君士坦丁堡，后来都抓不来了，只能请来之后皇帝给教宗下跪。是后来皇帝对西部发现武力不行了，又开始怀柔'],
 ['history-empire-anarchy/0','后来因为东部财政问题，只能建了类似四个藩镇'],['history-empire-anarchy/1','导致类似五代的局面，皇帝轮流做'],
 ['history-empire-isaurian/0','利奥三世为了讨好一性论（耶稣是神就不能画像），加上老百姓觉得老被阿拉伯欺负是因为违反戒律'],
 ['history-empire-isaurian/1','和西部（西边觉得画像是OK的）分歧更大'],
 ['history-empire-isaurian/2','也有一部分东边的老百姓和欧洲军队不乐意，但是硬推了60年，基本稳定了新局面'],
 ['history-empire-isaurian/3','结果皇太后上去又翻大饼，导致亚洲的军队和另一部分老百姓不乐意'],
 ['history-empire-isaurian/4','她就只能撒币安抚，结果财政崩溃'],['history-empire-isaurian/4','因为宗教偏好和儿子皇上又不和'],
 ['history-empire-isaurian/4','结果把儿子弄死，孙子夭折，自己的合法性也没了'],
 ['history-empire-isaurian/5','那时候教宗利奥三世加冕查理曼，查理曼需要全罗马的合法性，就要娶皇太后，皇太后同意未遂，被不愿意当嫁妆被送给蛮族的其他贵族给干掉'],
 ['history-empire-isaurian/5','成也利奥，败也利奥'],
 ['history-empire-amorian/0','然后又乱'],['history-empire-macedonian/1','对阿拉伯的反攻'],['history-empire-macedonian/3','东西教会大分裂'],
 ['history-empire-macedonian/3','查理曼之后东罗马自己内部教士不太打了，开始一致对外反对罗马教宗']];
// Where a claim leans on a mechanism the sources do not bear out, the right one sits in the same scene (not in bold).
const FIXES=[['history-empire-constans/1','要治的还是拒签《谕令》这一条'],['history-empire-constans/2','抄起水桶把他砸死（坊间常说成“肥皂盒”）'],
 ['history-empire-constans/5','下旨召教宗君士坦丁东来'],['history-empire-isaurian/0','一性论派的大本营这时已归哈里发'],['history-empire-isaurian/0','只画人性是拆开两性'],
 ['history-empire-isaurian/4','儿子本人不反圣像'],['history-empire-isaurian/4','孙子那年5月已夭折'],['history-empire-isaurian/5','宠臣埃提奥斯想扶自己的弟弟'],['history-empire-isaurian/5','她没被杀'],
 ['history-empire-macedonian/0','只比末代的巴列奥略王朝（1259—1453）短几年'],['history-empire-macedonian/3','牧首的位子还常有派系之争'],
 ['history-empire-justinian/4','据普罗柯比，库思老怕染上'],['history-empire-justinian/4','据《秘史》']];
// One Chinese parallel per new section.
const CHINA=[['history-empire-constans','汉景帝'],['history-empire-anarchy','安重荣'],['history-empire-isaurian','武则天'],['history-empire-amorian','唐文宗'],['history-empire-macedonian','宋太祖']];
const REGIONS=['mThemeOpsikion','mThemeThrakesion','mThemeAnatolikon','mThemeArmeniakon','mBulgars681','mByz842','mByz1025','mSamuel1000','mRus1000'];
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 try{
  for(const [width,height,label] of [[1440,960,'desktop'],[390,844,'390']]){
   const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height});
   await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
   await page.setRequestInterception(true);page.on('request',r=>/^https?:/.test(r.url())?r.abort():r.continue());
   await page.goto(pathToFileURL(target).href+'#history-empire-justinian/6',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);await wait(150);
   const r=await page.evaluate(({ERAS,SHORTS,SHARED,BOLD,FIXES,CHINA,REGIONS})=>{
    const E=id=>HISTORY_ENTRIES.find(e=>e.id===id),para=(id,i)=>{const d=document.createElement('div');d.innerHTML=E(id).html;return [...d.querySelectorAll('[data-scene-text]')].at(+i);};
    const all=e=>[e.html,...e.moments.map(m=>m.text),...e.boxes.map(b=>b.text)].join(' ');
    return {eras:ERAS.map(([id])=>{const x=HISTORY_ERAS.find(e=>e.id===id);return x&&[x.id,x.name,x.items];}),
     eraOrder:HISTORY_ERAS.map(e=>e.id).filter(id=>/^empire-(east|heraclian|iconoclasm|macedonian|kingdoms)$/.test(id)),
     shorts:Object.fromEntries(Object.keys(SHORTS).map(id=>[id,[E(id).short,E(id).period,E(id).scenes.length,E(id).ch,E(id).title]])),
     gone:['history-faith-monothelites','history-faith-icons'].filter(id=>E(id)),
     shared:SHARED.map(k=>[k,[].concat(TREE_ROWS[k][0]),HISTORY_BRANCHES.filter(b=>lineStations(b.id).some(s=>s.key===k)).map(b=>b.id).sort()]),
     east:lineStations('east').map(s=>s.key),faith:lineStations('faith').map(s=>s.key),
     branches:Object.fromEntries(HISTORY_BRANCHES.map(b=>[b.id,[b.from??null,b.to??null]])),futures:TREE_FUTURE.map(f=>[f[0],f[1],f[2]]),
     bold:BOLD.map(([k,w])=>{const [id,i]=k.split('/');return [k,para(id,i).innerHTML.includes('<strong>'+w)];}),
     fixes:FIXES.map(([k,w])=>{const [id,i]=k.split('/');const p=para(id,i);return [k,p.textContent.includes(w)&&!p.innerHTML.includes('<strong>'+w)];}),
     china:CHINA.map(([id,w])=>[id,all(E(id)).includes(w)]),
     wu:E('history-empire-justinian').boxes.map(b=>[b.scene,b.name,b.text.split('<br>').length]),
     nurse:E('history-empire-justinian').moments.filter(m=>m.name==='乳母换子').map(m=>m.scene),
     chars:Object.keys(SHORTS).flatMap(id=>{const d=document.createElement('div');d.innerHTML=E(id).html;return [...d.querySelectorAll('[data-scene-text]')].map(p=>[id,p.textContent.replace(/\s/g,'').length]);}),
     byzName:HISTORY_ENTRIES.flatMap(e=>[...all(e).matchAll(/拜占庭(?!帝国取代东罗马名号)(?!人讲)/g)].map(()=>e.id)).filter(id=>!/^history-(empire-constantine|empire-theodosius|rome-|hellenistic|persian|poleis|peloponnesian)/.test(id)),
     egypt:[HISTORY_ENTRIES.find(e=>e.id==='history-egypt-byzantine').short,HISTORY_ERAS.find(e=>e.id==='egypt-roman').name],
     regions:REGIONS.filter(k=>!GEO.regions[k]),
     links:Object.keys(SHORTS).flatMap(id=>E(id).sources.map(s=>s.url)).filter(u=>!/^https:\/\//.test(u)),
     cards:['history-empire-justinian/6','history-empire-constans/0','history-empire-constans/1','history-empire-constans/5','history-empire-isaurian/0','history-empire-isaurian/2',
      'history-empire-isaurian/3','history-empire-isaurian/5','history-empire-amorian/3','history-empire-macedonian/2'].filter(k=>!FIGURE_SCENES[k])};
   },{ERAS,SHORTS,SHARED,BOLD,FIXES,CHINA,REGIONS});
   // Dynasties as eras and sections, like the Rome chapter before them.
   for(const [i,[id,name,items]] of ERAS.entries())assert.deepEqual(r.eras[i],[id,name,items],id);
   assert.deepEqual(r.eraOrder,['empire-east','empire-heraclian','empire-iconoclasm','empire-macedonian','empire-kingdoms']);
   for(const [id,[short,period,n]] of Object.entries(SHORTS)){assert.deepEqual(r.shorts[id].slice(0,4),[short,period,n,5],id);assert.ok(r.shorts[id][4].includes(short.replace('（下）','')),id);}
   assert.deepEqual(r.gone,[],'the council sections now live on the dynasties');
   // One story told once: the councils after 641 are shared stations on 东罗马 and 基督教.
   for(const [k,lines,on] of r.shared){assert.deepEqual(lines,['east','faith'],k);assert.deepEqual(on,['east','faith'],k);}
   assert.deepEqual(r.east.slice(-EAST_TAIL.length),EAST_TAIL);assert.deepEqual(r.faith.slice(-FAITH_TAIL.length),FAITH_TAIL);
   assert.deepEqual(r.branches.east,[476,1056]);assert.deepEqual(r.branches.faith,[-1400,1056]);
   assert.deepEqual(r.futures.filter(f=>['east','faith'].includes(f[0])),[['east',1056,'东罗马（晚期）'],['faith',1056,'大分裂以后']]);
   for(const [k,ok] of r.bold)assert.ok(ok,k+' lacks 老无’s words in bold');
   for(const [k,ok] of r.fixes)assert.ok(ok,k+' lacks the corrected mechanism (plain text)');
   for(const [id,ok] of r.china)assert.ok(ok,id+' lacks its Chinese parallel');
   assert.deepEqual(r.wu,[[6,'查士丁尼身后与汉武帝',5]],'the Wu box moved to the bills left behind, five rows');assert.deepEqual(r.nurse,[6]);
   for(const [id,n] of r.chars)assert.ok(n<=300,id+' '+n);
   assert.deepEqual(r.byzName,[],'东罗马, not 拜占庭');assert.deepEqual(r.egypt,['东罗马治下的埃及','罗马与东罗马治下的埃及']);
   assert.deepEqual(r.regions,[]);assert.deepEqual(r.links,[]);assert.deepEqual(r.cards,[]);
   // The reader: the Wu box in the last Justinian scene; eyebrows name the dynasty eras.
   const box=await page.evaluate(()=>{const b=document.querySelector('#sceneContext .box');return b&&{tag:b.querySelector('.box-tag').firstChild.textContent,text:b.textContent};});
   assert.equal(box.tag,'查士丁尼身后与汉武帝');for(const w of ['土地','军队','内政','财政','收尾不同','轮台诏'])assert.ok(box.text.includes(w),'box lacks '+w);
   for(const [hash,era] of [['history-empire-justinian/6','东罗马：利奥王朝与查士丁尼王朝'],['history-empire-constans/2','东罗马：希拉克略王朝与二十年无政府'],['history-empire-anarchy','东罗马：希拉克略王朝与二十年无政府'],
     ['history-empire-isaurian/5','东罗马：圣像之争时代'],['history-empire-amorian/2','东罗马：圣像之争时代'],['history-empire-macedonian/3','东罗马：马其顿王朝']]){
    await page.evaluate(h=>{const [id,s]=h.split('/');go(id,{scene:+(s||0)});},hash);await wait(60);
    assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),era+' · 第六章',hash);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),true,hash+' overflows');
   }
   // Stepping along 基督教 from the fifth council runs through the East Roman stations to the schism; along 东罗马 the Macedonians come in two stops.
   await page.evaluate(()=>{selectTreeLine('faith');go('history-faith-three-chapters');});
   const walk=[];for(let i=0;i<4;i++){await page.click('#next');walk.push(await page.evaluate(()=>[ENTRIES[cur].id,sceneIndex,treeLine]));}
   assert.deepEqual(walk,[['history-empire-constans',0,'faith'],['history-empire-isaurian',0,'faith'],['history-empire-amorian',0,'faith'],['history-empire-macedonian',3,'faith']]);
   assert.ok(await page.$eval('#next',e=>e.disabled),'end of the 基督教 line');
   await page.evaluate(()=>{selectTreeLine('east');go('history-empire-amorian');});
   await page.click('#next');assert.deepEqual(await page.evaluate(()=>[ENTRIES[cur].id,sceneIndex]),['history-empire-macedonian',0]);
   await page.click('#next');assert.deepEqual(await page.evaluate(()=>[ENTRIES[cur].id,sceneIndex]),['history-empire-macedonian',3]);
   assert.ok(await page.$eval('#next',e=>e.disabled),'end of the 东罗马 line');
   // The tree: the schism row is labelled on its own, both copies of a shared station light up together.
   const sel=label==='desktop'?'#toc .htree':'#treeSheet .htree';
   if(label!=='desktop'){await page.click('#treeOpen');await wait(200);}
   const t=await page.evaluate(sel=>{
    const tree=document.querySelector(sel),row=k=>tree.querySelector(`.tree-item[data-key="${k}"]`);
    return {mace:[row('history-empire-macedonian/0').textContent,row('history-empire-macedonian/3').textContent],
     on:[...tree.querySelectorAll('.tree-node.on')].map(n=>[n.dataset.key,+n.getAttribute('cy')]),swaps:tree.querySelectorAll('.interchange:not(.in)').length};
   },sel);
   assert.match(t.mace[0],/^马其顿王朝东罗马 · 867—1025年$/);assert.match(t.mace[1],/^东西教会大分裂东罗马、基督教 · 1025—1056年$/);
   assert.equal(t.on.length,2);assert.ok(t.on.every(n=>n[0]==='history-empire-macedonian/3')&&t.on[0][1]===t.on[1][1],JSON.stringify(t.on));
   assert.equal(t.swaps,6);
   if(label!=='desktop'){await page.keyboard.press('Escape');await wait(100);}
   for(const hash of ['history-empire-justinian/6','history-empire-constans/2','history-empire-anarchy/0','history-empire-isaurian/5','history-empire-macedonian/2']){
    await page.evaluate(h=>{const [id,s]=h.split('/');go(id,{scene:+s});},hash);await wait(250);
    await page.screenshot({path:path.join(shots,`${hash.replace('/','_').replace('history-empire-','')}-${label}.png`)});
   }
   if(label==='desktop'){
    await page.evaluate(()=>{selectTreeLine('east');go('history-empire-isaurian');});await page.click('#treeOpen');await wait(250);
    await page.evaluate(()=>treeSheet.querySelector('.tree-item.on')?.scrollIntoView({block:'center'}));await wait(150);
    await page.screenshot({path:path.join(shots,'tree-east-1440.png')});await page.keyboard.press('Escape');
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: v35 东罗马 by dynasty — four eras (利奥与查士丁尼, 希拉克略与二十年无政府, 圣像之争时代, 马其顿) and seven dynasty sections to 1056; 查士丁尼王朝 ends with the bills beside Emperor Wu (five-row box); the councils after 641 are shared stations on 东罗马 and 基督教 (the old council sections gone, one story told once); '
   +BOLD.length+' of 老无’s sentences verbatim and bold, '+FIXES.length+' corrected mechanisms in plain text beside them; one Chinese parallel per section; ≤300 chars per scene; 东罗马 not 拜占庭; nine new teaching areas; https links; cards; eyebrows; ↑↓ along 基督教 and 东罗马 to their ends; the schism row lit on both lines; desktop and 390px; no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();}
})();
