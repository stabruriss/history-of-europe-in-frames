const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'))).href;
const shots=path.join(__dirname,'shots-carolingian');fs.mkdirSync(shots,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// 老无 2026-10-27: the big rule of arrangement (shared scenes may repeat; near-simultaneous sections of one line run side by side on a
// passing loop; a region that goes its own way forks off as a line of its own), applied: 东罗马 leaves 罗马 at 395, 中世纪西欧 splits at
// Verdun (843) into 法兰西, 德意志 and 意大利. The Carolingians rebuilt in three sections, the three heirs of Verdun, and 基督教 pushed on
// to predestination.
const SECTIONS={
 'history-west-charlemagne':['加洛林王朝','751—800年',5,5,300],
 'history-west-charlemagne-rule':['查理曼的治理','781—814年',6,5,300],
 'history-west-louis-pious':['虔诚者路易','814—843年',6,5,300],
 'history-france-west-francia':['西法兰克王国','843—987年',6,5,300],
 'history-germany-east-francia':['东法兰克王国','843—962年',6,5,300],
 'history-italy-middle-francia':['意大利王国','843—962年',6,5,300],
 'history-faith-carolingian':['加洛林神学之争','787—870年',null,6,230],
};
const ROWS={'history-west-charlemagne/0':['west',751,800],'history-west-charlemagne-rule/0':['west',800,814],'history-west-louis-pious/0':['west',814,843],
 'history-france-west-francia/0':['france',843,987],'history-germany-east-francia/0':['germany',843,962],'history-italy-middle-francia/0':['italy',843,962],
 'history-faith-carolingian/0':['faith',787,870],'history-empire-theodosius/0':['rome',379,395],'history-empire-theodosius/3':['east',395,457],'history-empire-leo/0':['east',457,518]};
// 老无’s own points, refined into bold theses.
const BOLD=[
 ['history-west-charlemagne/0','篡位缺王族血统，要靠罗马教宗加持合法性；教宗跟东罗马为圣像越闹越僵'],
 ['history-west-charlemagne/0','两边一拍即合'],
 ['history-west-charlemagne/0','地是法兰克人打下来送的，东罗马怎么讲理也要不回去'],
 ['history-west-charlemagne/1','虽是双向奔赴，交易里显然是教廷赚了'],
 ['history-west-charlemagne/2','查理曼继位后看出这笔账吃了亏，开始从教廷往回收权'],
 ['history-west-charlemagne/3','对外征战让底下的贵族团结在国王周围，也分到了好处，没工夫搞事，国王的权力基础跟着扩大'],
 // 老无 2026-10-27 晚：他特意用的对照（世袭罔替、巡抚刺史、罪己诏、希特勒、拿破仑、天皇）照用，事实另写在明处。
 ['history-west-charlemagne/3','结果是欧洲历史上统治范围最大的人之一'],
 ['history-france-west-francia/0','最明显的是头衔和封地走向世袭罔替，给封建制又打了一层地基'],
 ['history-france-west-francia/1','对西欧来说，这是日耳曼人的第二次大入侵'],
 ['history-france-west-francia/5','至今仍在位的王族里论古老仅次于日本天皇家'],
 ['history-west-charlemagne-rule/0','法兰克人原本没什么文化，读写几乎全在教士手里；为了不让教廷独占文墨，查理曼大力提倡读书识字'],
 ['history-west-charlemagne-rule/0','他自己也学，只是学得不怎么样'],
 ['history-west-charlemagne-rule/1','查理曼爱亲自裁决，故意显得和教廷不同，从教廷手里拿话语权'],
 ['history-west-charlemagne-rule/2','内政走的是古今中外加强中央集权的老路'],
 ['history-west-charlemagne-rule/2','等于把他爹让给教廷的权收回了一部分'],
 ['history-west-charlemagne-rule/3','可他漏掉了几处最要紧的根本，收权的效果并不好'],
 ['history-west-charlemagne-rule/3','中央对地方始终没有压倒性的优势，日后皇室一内斗，各方就只能向地方贵族让出更多的权来争胜'],
 ['history-west-charlemagne-rule/4','收息成了罪，借贷生意萎缩，大宗远程买卖更难做，各地自给自足的本地经济相对占了上风'],
 ['history-west-charlemagne-rule/4','日后皇帝一弱，或者自己特别信教，教会就把什么案子都说成和宗教有关，逐渐拿到更多司法权'],
 ['history-west-charlemagne-rule/5','他活得长，最后只剩一个儿子，躲过了分家造成的内乱'],
 ['history-west-louis-pious/0','他太虔诚，几乎把父亲埋下的雷都引爆了'],
 ['history-west-louis-pious/0','把查理曼从教会收回的神职任命权又交还教会'],
 ['history-west-louis-pious/1','一闹灾就下罪己诏、开宗教大会'],
 ['history-west-louis-pious/2','路易给贵族分地，却不再像父祖那样动教会的地，改拿王室自己的庄园去赏'],
 ['history-west-louis-pious/2','教会不许教士成家生子，地只进不出'],
 ['history-west-louis-pious/3','父亲靠对外打仗凝聚贵族的那一招，到他手里也不灵了'],
 ['history-west-louis-pious/3','仗没打成，反倒闹出宫廷绯闻'],
 ['history-west-louis-pious/4','地早分给了三个哥哥，老爹又想刮一块给弟弟'],
 ['history-west-louis-pious/4','这像赵武灵王，只是更复杂'],
 ['history-west-louis-pious/5','三个儿子互相就打起来了'],
 ['history-west-louis-pious/5','这三块日后分别接上法国、德国和意大利，这些国名都是很晚才有的'],
];
// Facts set right in plain text, never in bold.
const FIXES=[
 ['history-west-charlemagne/1','747年法兰克主教具文宣誓服从罗马'],['history-west-charlemagne/1','主教仍由国王任命，规矩却由罗马来定'],
 // 老无 2026-10-27 晚：“圆环”是啥——正文就地注明是可汗的王庭兼宝库。
 ['history-west-charlemagne/2','可汗的王庭兼宝库“圆环”（环形土木墙围着的大营）'],
 ['history-west-charlemagne/3','约一百二十万平方公里，不及图拉真时的罗马（约五百万）、亚历山大（约五百二十万），也不及拿破仑（约二百一十万）和希特勒占领下的欧洲，却是西罗马亡后西方最大的一片'],
 ['history-west-charlemagne-rule/2','一是派中央巡视官，像汉朝的刺史、明清的巡抚'],['history-west-charlemagne-rule/2','二是启用寒门'],['history-west-charlemagne-rule/2','不承诺世袭罔替'],
 ['history-west-charlemagne-rule/0','希腊文却没几个人懂'],['history-west-charlemagne-rule/2','多用教士和王室家臣，他们的位子传不给儿子'],
 ['history-west-charlemagne-rule/4','到11、12世纪国王缺钱常找犹太人借'],
 // 老无 2026-10-27 晚：认罪到复位之间“是不是有点突然”——补上洛泰尔压弟弟、拖着老父示众、众人倒戈的经过。
 ['history-west-louis-pious/4','可洛泰尔一得势就压弟弟，又拖着老父示众，弟弟们和贵族掉头帮老父'],
 ['history-west-louis-pious/0','侄子意大利王伯纳德不服起兵'],['history-west-louis-pious/4','838年老二丕平死'],
];
const MOMENTS={'history-west-charlemagne':[[0,'为了圣彼得'],[2,'阿瓦尔人的宝库'],[3,'龙塞斯瓦列斯'],[3,'哈伦的大象'],[4,'事先不知道']],
 'history-west-louis-pious':[[4,'谎言之野'],[5,'斯特拉斯堡誓言']]};
const PARALLEL=[['trunk','history-alexander-conquest/0','history-alexander-rule/0'],['trunk','history-hellenistic-states/0','history-hellenistic-knowledge/0'],
 ['west','history-west-kingdoms/0','history-west-ostrogoths/0'],['west','history-west-merovingians/0','history-west-lombards/0'],['faith','history-empire-amorian/0','history-faith-carolingian/0']];
(async()=>{
 const browser=await puppeteer.launch({headless:true,executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'});
 const errors=[];
 try{
  for(const [label,w,h] of [['desktop',1440,960],['390',390,844]]){
   const page=await browser.newPage();await page.setViewport({width:w,height:h,deviceScaleFactor:1});
   await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
   await page.setRequestInterception(true);page.on('request',r=>/^https?:/.test(r.url())?r.abort():r.continue());
   page.on('pageerror',e=>errors.push(label+': '+e.message));
   await page.goto(url,{waitUntil:'domcontentloaded'});await wait(400);
   const r=await page.evaluate(({SECTIONS,ROWS,BOLD,FIXES,MOMENTS,PARALLEL})=>{
    const E=id=>HISTORY_ENTRIES.find(e=>e.id===id),stripEn=s=>s.replace(/（[A-Za-z][^）]*）/g,'');
    const para=(id,i)=>{const d=document.createElement('div');d.innerHTML=E(id).html;return [...d.querySelectorAll('[data-scene-text]')][+i];};
    const B=Object.fromEntries(HISTORY_BRANCHES.map(b=>[b.id,b]));
    return {
     heads:Object.keys(SECTIONS).map(id=>{const e=E(id);return e&&[e.short,e.period,e.scenes.length,e.ch];}),
     chars:Object.keys(SECTIONS).filter(E).flatMap(id=>{const d=document.createElement('div');d.innerHTML=E(id).html;return [...d.querySelectorAll('[data-scene-text]')].map((p,i)=>[id+'/'+i,stripEn(p.textContent).replace(/\s/g,'').length,SECTIONS[id][4]]);}),
     rows:Object.fromEntries(Object.keys(ROWS).map(k=>[k,TREE_ROWS[k]&&[].concat(TREE_ROWS[k][0]).concat(TREE_ROWS[k].slice(1,3))])),
     branches:['east','west','france','germany','italy','faith','china'].map(id=>B[id]&&[id,B[id].parent||null,B[id].from??null,B[id].to??null,B[id].lane]),
     ends:TREE_ENDS.map(e=>[e[0],e[1],e[2]]),futures:TREE_FUTURE.map(f=>[f[0],f[1],f[2]]),
     parallel:TREE_PARALLEL.map(p=>[p[0],...p[1]]),
     bold:BOLD.map(([k,w])=>{const [id,i]=k.split('/');return [k,!!E(id)&&[...para(id,i).querySelectorAll('strong')].some(st=>stripEn(st.textContent).includes(w))];}),
     fixes:FIXES.map(([k,w])=>{const [id,i]=k.split('/');const p=para(id,i);return [k,stripEn(p.textContent).includes(w)&&!stripEn(p.innerHTML).includes('<strong>'+w)];}),
     moments:Object.fromEntries(Object.keys(MOMENTS).map(id=>[id,E(id).moments.map(m=>[m.scene,m.name])])),
     momentsPerScene:Object.keys(SECTIONS).filter(E).map(id=>[id,Math.max(0,...Object.values(E(id).moments.reduce((a,m)=>(a[m.scene]=(a[m.scene]||0)+1,a),{})))]),
     sources:Object.keys(SECTIONS).filter(E).map(id=>[id,E(id).sources.length,E(id).sources.filter(s=>!/^https:\/\//.test(s.url)).length,E(id).sources.length-new Set(E(id).sources.map(s=>s.url)).size]),
     verdunBox:E('history-west-louis-pious').boxes.map(b=>[b.scene,b.name,b.text.includes('<svg class="kin-tree"')]),
     charlesTag:stripEn(para('history-west-charlemagne',1).textContent).includes('查理（即查理曼大帝）'),
     lorraine:Object.keys(SECTIONS).filter(E).some(id=>stripEn(E(id).html).includes('洛林')),
     regions:['mFrancia843W','mFrancia843M','mFrancia843E','mCarolingian814','mSaxony772','mDenmark800','mSlavs800','mOtto962'].filter(k=>!GEO.regions[k]),
     byz:Object.keys(SECTIONS).filter(E).filter(id=>/拜占庭/.test(stripEn(E(id).html))),
     pope:Object.keys(SECTIONS).filter(E).filter(id=>/教皇/.test(E(id).html)),
    };
   },{SECTIONS,ROWS,BOLD,FIXES,MOMENTS,PARALLEL});
   // Sections: short names, periods, scene counts, chapters; prose budgets without the English names.
   for(const [i,[id,[short,period,n,ch]]] of Object.entries(SECTIONS).entries()){
    assert.ok(r.heads[i],id+' missing');assert.equal(r.heads[i][0],short,id);assert.equal(r.heads[i][1],period,id);assert.equal(r.heads[i][3],ch,id);
    if(n)assert.equal(r.heads[i][2],n,id+' scenes');else assert.ok(r.heads[i][2]>=5&&r.heads[i][2]<=6,id+' scenes');
   }
   const over=r.chars.filter(([,n,cap])=>n>cap);assert.deepEqual(over,[],'prose budgets');
   // The tree: forks at 395 and 843, the new lines and their lanes, the West's end, the shoots after the forks, the passing loops.
   for(const [k,spec] of Object.entries(ROWS))assert.deepEqual(r.rows[k],spec,k);
   assert.deepEqual(r.branches,[['east','rome',395,1056,2],['west','rome',476,843,4],['france','west',843,987,5],['germany','west',843,962,4],['italy','west',843,962,3],['faith','trunk',-1400,1056,6],['china',null,-7000,845,7]]);
   assert.deepEqual(r.ends,[['trunk',-30,'并入罗马'],['rome',476,'西罗马终结'],['west',843,'凡尔登三分']]);
   for(const f of [['france',987,'卡佩王朝'],['germany',962,'神圣罗马帝国'],['italy',962,'帝国治下的意大利']])assert.ok(r.futures.some(x=>JSON.stringify(x)===JSON.stringify(f)),f[0]+' shoot');
   assert.ok(!r.futures.some(f=>f[0]==='west'),'中世纪西欧 ends at Verdun instead of growing a shoot');
   assert.deepEqual(r.parallel,PARALLEL);
   // 老无’s theses in bold; corrections in plain text; one or two moments a scene; the reading links.
   for(const [k,ok] of r.bold)assert.ok(ok,k+' lacks 老无’s thesis in bold');
   for(const [k,ok] of r.fixes)assert.ok(ok,k+' lacks the plain-text correction');
   for(const [id,list] of Object.entries(MOMENTS))assert.deepEqual(r.moments[id],list,id+' moments');
   for(const [id,n] of r.momentsPerScene)assert.ok(n<=2,id+' has more than two moments in one scene');
   for(const [id,n,bad,dup] of r.sources)assert.ok(n>=6&&!bad&&!dup,id+' reading links '+JSON.stringify([n,bad,dup]));
   assert.deepEqual(r.verdunBox,[[5,'法兰克人的分家账',true]]);
   assert.ok(r.charlesTag,'查理（即查理曼大帝） keeps its tag');
   assert.ok(r.lorraine,'the north of Middle Francia (洛林) is accounted for');
   assert.deepEqual(r.regions,[]);assert.deepEqual(r.byz,[],'东罗马, not 拜占庭');assert.deepEqual(r.pope,[],'教宗, not 教皇');
   // The rendered tree: one loop per parallel pair, the later section's node beside its lane; three forks out of the West at 843.
   if(label==='desktop'){
   const t=await page.evaluate(()=>{const tree=document.querySelector('#toc .htree');return {loops:tree.querySelectorAll('.lane.loop').length,
     side:[...tree.querySelectorAll('.tree-node[data-key]')].filter(n=>Math.abs(+n.getAttribute('cx')-+n.dataset.lx)>.5).map(n=>n.dataset.key).sort(),
     forks:[...tree.querySelectorAll('.fork')].map(p=>p.dataset.branch).sort(),pills:[...document.querySelectorAll('#toc .tree-line')].map(b=>b.textContent)};});
   assert.equal(t.loops,PARALLEL.length,label+' loops');
   assert.deepEqual(t.side,PARALLEL.map(p=>p[2]).sort(),label+' the later section of each pair rides the loop');
   assert.ok(['east','france','italy'].every(f=>t.forks.includes(f))&&!t.forks.includes('germany'),label+' forks '+JSON.stringify(t.forks));
   assert.deepEqual(t.pills,['希腊','罗马','东罗马','中世纪西欧','法兰西','德意志','意大利','基督教','埃及','波斯','中国'],label+' line pills');
   }
   // Every new scene draws, fits its view on the desktop, and leaves no horizontal overflow.
   for(const id of Object.keys(SECTIONS)){
    const n=await page.evaluate(id=>HISTORY_ENTRIES.find(e=>e.id===id).scenes.length,id);
    for(let i=0;i<n;i++){
     const s=await page.evaluate(({id,i})=>{go(id,{scene:i});const sc=activeScene(ENTRIES[cur]);
      return {pins:Object.keys(pinIndex).length,layers:group.getLayers().length,fits:map.getBounds().contains(L.latLngBounds(sc.view)),overflow:document.documentElement.scrollWidth>innerWidth};},{id,i});
     await wait(90);
     assert.ok(s.layers>0&&!s.overflow,id+'/'+i+' '+JSON.stringify(s));
     if(label==='desktop'){assert.ok(s.pins>0&&s.fits,id+'/'+i+' '+JSON.stringify(s));await page.screenshot({path:path.join(shots,`${id.replace('history-','')}_${i}-desktop.png`)});}
    }
   }
   if(label==='390'){await page.evaluate(()=>go('history-west-louis-pious',{scene:5}));await wait(150);await page.screenshot({path:path.join(shots,'verdun-390.png')});}
   await page.close();
  }
  assert.deepEqual(errors,[],'page errors');
  console.log('PASS: Carolingians and Verdun — 东罗马 forks off 罗马 at 395; 中世纪西欧 ends at Verdun (843) and forks into 法兰西, 德意志 and 意大利; five passing loops for near-simultaneous sections; 加洛林王朝 (751—800), 查理曼的治理 (781—814) and 虔诚者路易 (814—843) carry 老无’s theses in bold with the facts set right in plain text; the three heirs of Verdun and 加洛林神学之争 within budget; maps fit, offline, no overflow at 1440 and 390');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exit(1);});
