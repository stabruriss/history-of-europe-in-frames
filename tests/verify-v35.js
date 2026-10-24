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
const SHORTS={'history-empire-west-fall':['西罗马的终结','395—476年',6],'history-empire-justinian':['查士丁尼王朝','518—602年',7],'history-empire-heraclius':['希拉克略王朝','602—641年',5],
 'history-empire-constans':['希拉克略王朝（下）','641—711年',6],'history-empire-anarchy':['二十年无政府','695—717年',2],
 'history-empire-isaurian':['伊苏里亚王朝','717—802年',6],'history-empire-amorian':['阿莫里亚王朝','802—867年',4],'history-empire-macedonian':['马其顿王朝','867—1056年',4]};
const EAST_TAIL=['history-empire-leo/0','history-empire-justinian/0','history-empire-heraclius/0','history-arab-conquest/0','history-empire-constans/0',
 'history-empire-anarchy/0','history-empire-isaurian/0','history-empire-amorian/0','history-empire-macedonian/0','history-empire-macedonian/3'];
const FAITH_TAIL=['history-faith-papacy/0','history-faith-three-chapters/0','history-empire-constans/0','history-empire-isaurian/0','history-empire-amorian/0','history-empire-macedonian/3'];
const SHARED=['history-empire-constans/0','history-empire-isaurian/0','history-empire-amorian/0','history-empire-macedonian/3'];
// 老无's core theses and hooks, woven into the right historical places and bolded (no conversational "后来/结果/他死之后事情怎么样了" copied verbatim).
const BOLD=[['history-empire-theodosius/2','394年9月冷河之战，狄奥多西征调两万西哥特同盟兵讨伐西部篡位者，首领阿拉里克率部履行义务顶在最前线，一战死伤过半'],
 ['history-empire-west-fall/0','董卓式的军阀统帅阿拉里克'],['history-empire-west-fall/1','一个霍光式的人物'],
 ['history-empire-west-fall/1','西哥特头子阿拉里克则是董卓式的人物：手握能战的蛮族私兵，在帝国腹地要官、要粮、要地'],
 ['history-empire-west-fall/2','为救意大利，斯提里科从莱茵河与不列颠抽回兵员回防'],['history-empire-west-fall/2','与这位“董卓”密谋：封阿拉里克为大将，约好合兵攻打东罗马、夺取马其顿'],
 ['history-empire-west-fall/2','斯提里科被北方战局死死拖住，把苦等在伊庇鲁斯的阿拉里克放了鸽子'],
 ['history-empire-west-fall/3','因为皇权猜忌与宗教矛盾，西边小弟弟皇上大了之后杀了托孤大臣'],
 ['history-empire-west-fall/3','三万人投奔阿拉里克；霍诺留躲在拉文纳，厌恶阿里乌派西哥特人，拒不谈判'],
 ['history-empire-west-fall/3','410年8月攻进罗马，这是八百年来罗马头一回被外敌攻破。西哥特人洗劫三天，掳走财宝与皇妹加拉·普拉西提阿，但未屠城'],
 ['history-empire-west-fall/4','北非是西罗马最富的粮仓和税源，西班牙与北非相继丢失后，赋税与漕粮断绝，罗马常备军急剧缩水，对日耳曼人失去了长期优势。'],
 ['history-empire-justinian/6','查士丁尼身后留下的困局，与汉武帝如出一辙：收复的土地得而复失，大军损耗殆尽，财政破产，教派冲突与兵变交织'],
 ['history-empire-constans/1','教宗马丁一世被抓流放、他的主要神学助手修士马克西姆斯被割舌断手，根子都是因为带头违反《谕令》'],
 ['history-empire-constans/3','东方外敌压力骤减，被《谕令》强行按住的教会纷争再度抬头'],
 ['history-empire-constans/3','教义本身不那么重要，地盘一丢，教义就翻案'],
 ['history-empire-constans/4','当年皇权强盛时没有铁腕定于一尊，纵容教士集团坐大；如今外敌稍缓，教会内部便争权夺利、同皇帝叫板，皇权已经镇不住了'],
 ['history-empire-constans/4','从前皇帝还能把教宗抓到君士坦丁堡，如今连抓都抓不来了'],
 ['history-empire-constans/5','皇帝发现对意大利动武已经行不通，只能改用怀柔'],
 ['history-empire-constans/5','戴着皇冠的皇帝当众向教宗伏地行礼、亲吻他的脚'],
 ['history-empire-anarchy/0','失去叙利亚和埃及后，帝国丧失了大半赋税与漕粮，东部财政枯竭，朝廷再养不起领全饷的常备军，只能在小亚细亚建立起类似唐朝藩镇的四大“军区”'],
 ['history-empire-anarchy/1','四大军区坐大之后，帝国演成类似中国五代的局面，军区兵马轮番拥立新君，二十二年换了七个皇帝'],
 ['history-empire-isaurian/0','当时百姓和军队觉得屡受严禁偶像的阿拉伯人欺负、又逢火山天灾，是因为拜圣像违反了十诫；而小亚细亚东部军民本就受东方一性论与反偶像风气影响，反圣像派主张基督既是神，无形的神性就不可画成图像'],
 ['history-empire-isaurian/1','禁毁圣像使东罗马与西方的分歧进一步加深'],
 ['history-empire-isaurian/2','帝国欧洲军区与部分东方百姓起初并不服从，但两代皇帝硬推近六十年，强行稳住了新局面'],
 ['history-empire-isaurian/3','皇太后上台后再次“翻大饼”恢复圣像，引发小亚细亚军队和反圣像派百姓的强烈不满'],
 ['history-empire-isaurian/4','围绕军权与宗教路线，皇太后与儿子矛盾激化，最终弄死亲生儿子，皇孙又已夭折，她自己的合法性也彻底丧失'],
 ['history-empire-isaurian/4','失去合法性与亚洲军心后，她只能靠撒币和减税安抚各方，结果导致财政崩溃'],
 ['history-empire-isaurian/5','800年圣诞节，教宗利奥三世在罗马为查理曼加冕；查理曼为了取得全罗马的合法性，于802年派使节赴君士坦丁堡向伊琳娜求婚。伊琳娜有意应允，但宠臣埃提奥斯从中作梗，满朝贵族官员既不满她挥霍国库，更不愿连人带帝国当成嫁妆送给法兰克“蛮族”，遂由财政大臣尼基弗鲁斯领头发动政变将她推翻'],
 ['history-empire-isaurian/5','伊苏里亚王朝起于皇帝利奥三世，亡于教宗利奥三世加冕引发的政变——可谓“成也利奥，败也利奥”'],
 ['history-empire-amorian/0','伊琳娜被废之后，帝国政局再度陷入动荡'],
 ['history-empire-amorian/2','人类可以以任意画一条线分为两派互相斗争。这是人类组织的自然属性。'],
 ['history-empire-amorian/3','查理曼在西方称帝、843年圣像之争收场之后，东罗马教会内部不再爆发大规模教义混战；虽仍有争夺牧首之位的派系倾轧，但已转为一致对外，联手抵制罗马教宗的管辖'],
 ['history-empire-macedonian/0','宗教上使出两手：对内打压君士坦丁堡牧首、立定皇上才是老大；对外拉拢加震慑罗马教宗，让教宗跟东罗马皇帝闹不起来'],
 ['history-empire-macedonian/1','内政重在对付小亚细亚的军事世家（形同北周隋唐的关陇集团）：分化瓦解、扩充中央军、抑制兼并三管齐下'],
 ['history-empire-macedonian/1','导致中间贵族阶层坐大，重演了中国历代土地兼并的戏码'],
 ['history-empire-macedonian/2','对外战争以巴西尔二世攻灭宿敌保加利亚为主轴，同时趁阿拉伯帝国衰落展开百年反攻'],
 ['history-empire-macedonian/3','东罗马教会自圣像之争结束后不再爆发内部教义混战，而是同罗马教廷一致对外争权，最终在1054年酿成东西教会大分裂']];
// Factual corrections woven in place (no self-contradicting bold-then-refute).
const FIXES=[['history-empire-constans/1','实则治的就是抗旨议论教义这一条'],['history-empire-constans/2','抄起沉重的铜水桶将他猛击致死（俗传为肥皂盒打死）'],
 ['history-empire-constans/5','下旨礼请教宗君士坦丁东来商议'],['history-empire-isaurian/0','若只画人性是割裂两性，若连神性同画又混同两性'],
 ['history-empire-isaurian/4','小亚细亚反圣像派军团拥护君士坦丁六世'],['history-empire-isaurian/4','797年春幼孙利奥夭折，8月伊琳娜便勾结将领把亲生儿子抓回他出生的紫色寝宫残忍刺瞎'],
 ['history-empire-isaurian/5','流放莱斯沃斯岛，次年病死'],['history-empire-macedonian/0','（仅次于末代巴列奥略王朝的长寿王朝）'],
 ['history-empire-macedonian/0','马其顿文艺复兴'],['history-empire-macedonian/1','折兵钱'],['history-empire-macedonian/1','瓦良格卫队'],['history-empire-macedonian/1','连保代税法'],
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
    const stripEn=s=>s.replace(/（[A-Za-z][^）]*）/g,'');
    const all=e=>[e.html,...e.moments.map(m=>m.text),...e.boxes.map(b=>b.text)].join(' ');
    const fullBlob=HISTORY_ENTRIES.map(all).join(' ');
    return {eras:ERAS.map(([id])=>{const x=HISTORY_ERAS.find(e=>e.id===id);return x&&[x.id,x.name,x.items];}),
     eraOrder:HISTORY_ERAS.map(e=>e.id).filter(id=>/^empire-(east|heraclian|iconoclasm|macedonian|kingdoms)$/.test(id)),
     shorts:Object.fromEntries(Object.keys(SHORTS).map(id=>[id,[E(id).short,E(id).period,E(id).scenes.length,E(id).ch,E(id).title]])),
     gone:['history-faith-monothelites','history-faith-icons'].filter(id=>E(id)),
     shared:SHARED.map(k=>[k,[].concat(TREE_ROWS[k][0]),HISTORY_BRANCHES.filter(b=>lineStations(b.id).some(s=>s.key===k)).map(b=>b.id).sort()]),
     east:lineStations('east').map(s=>s.key),faith:lineStations('faith').map(s=>s.key),
     branches:Object.fromEntries(HISTORY_BRANCHES.map(b=>[b.id,[b.from??null,b.to??null]])),futures:TREE_FUTURE.map(f=>[f[0],f[1],f[2]]),
     bold:BOLD.map(([k,w])=>{const [id,i]=k.split('/');return [k,stripEn(para(id,i).innerHTML).includes('<strong>'+w)];}),
     fixes:FIXES.map(([k,w])=>{const [id,i]=k.split('/');const p=para(id,i);return [k,stripEn(p.textContent).includes(w)&&!stripEn(p.innerHTML).includes('<strong>'+w)];}),
     chatFiller:/后来又开始教义纷争|这个前面说的|他死之后事情怎么样了|叙利亚和埃及开始是怎么丢的|然后又乱|画像是OK的|教宗小弟|为了讨好一性论/.test(Object.keys(SHORTS).map(id=>all(E(id))).join(' ')),
     china:CHINA.map(([id,w])=>[id,stripEn(all(E(id))).includes(w)]),
     wu:E('history-empire-justinian').boxes.map(b=>[b.scene,b.name,b.text.split('<br>').length]),
     nurse:E('history-empire-justinian').moments.filter(m=>m.name==='乳母换子').map(m=>m.scene),
     chars:Object.keys(SHORTS).flatMap(id=>{const d=document.createElement('div');d.innerHTML=E(id).html;return [...d.querySelectorAll('[data-scene-text]')].map(p=>[id,stripEn(p.textContent).replace(/\s/g,'').length]);}),
     enTags:[...fullBlob.matchAll(/[\u4e00-\u9fa5·]{2,12}（[A-Za-z][^）]*）/g)].length,
     enSpots:['梭伦（Solon','马拉松（Marathon）','汉尼拔（Hannibal）','恺撒（Caesar）','查士丁尼（Justinian I）','希拉克略（Heraclius）','君士坦斯二世（Constans II）','利奥三世（Leo III）','教宗利奥三世（Pope Leo III）','查理曼（Charlemagne）','巴西尔二世（Basil II）','拉美西斯二世（Ramesses II）','库思老一世（Khosrow I）','穆罕默德（Muhammad）'].filter(s=>!fullBlob.includes(s)),
     byzName:HISTORY_ENTRIES.flatMap(e=>[...stripEn(all(e)).matchAll(/拜占庭(?!帝国取代东罗马名号)(?!人讲)/g)].map(()=>e.id)).filter(id=>!/^history-(empire-constantine|empire-theodosius|rome-|hellenistic|persian|poleis|peloponnesian)/.test(id)),
     egypt:[HISTORY_ENTRIES.find(e=>e.id==='history-egypt-byzantine').short,HISTORY_ERAS.find(e=>e.id==='egypt-roman').name],
     regions:REGIONS.filter(k=>!GEO.regions[k]),
     links:Object.keys(SHORTS).flatMap(id=>E(id).sources.map(s=>s.url)).filter(u=>!/^https:\/\//.test(u)),
     cards:['history-empire-west-fall/1','history-empire-west-fall/3','history-empire-west-fall/4','history-empire-west-fall/5','history-empire-justinian/6','history-empire-constans/0','history-empire-constans/1','history-empire-constans/5','history-empire-isaurian/0','history-empire-isaurian/2',
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
   for(const [k,ok] of r.bold)assert.ok(ok,k+' lacks 老无’s thesis in bold');
   for(const [k,ok] of r.fixes)assert.ok(ok,k+' lacks the in-place factual correction');
   assert.equal(r.chatFiller,false,'conversational filler or uncorrected wording left in prose');
   for(const [id,ok] of r.china)assert.ok(ok,id+' lacks its Chinese parallel');
   assert.deepEqual(r.wu,[[6,'查士丁尼身后与汉武帝',5]],'the Wu box moved to the bills left behind, five rows');assert.deepEqual(r.nurse,[6]);
   for(const [id,n] of r.chars)assert.ok(n<=300,id+' '+n);
   assert.deepEqual(r.byzName,[],'东罗马, not 拜占庭');assert.deepEqual(r.egypt,['东罗马治下的埃及','罗马与东罗马治下的埃及']);
   assert.ok(r.enTags>1000,'English parentheticals on first appearances: '+r.enTags);assert.deepEqual(r.enSpots,[],'missing English spot checks');
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
