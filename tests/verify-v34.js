const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const shots=path.join(__dirname,'shots-v34');require('node:fs').mkdirSync(shots,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// 老无 2026-10-21 (evening): 罗马 runs to the end of the West; 东罗马 carries on from there (kept as 东罗马, with the sentence on
// Latin no longer being the official language in bold); 西罗马 is now 中世纪西欧, forking off at the same point; 希腊 ends by running
// into 罗马; a big event that hits several lines at once is one station on each of them, lit together, with one set of scenes.
// v35 (老无 2026-10-22 晚): 东罗马 runs on by dynasty to 1056; the sixth and seventh councils moved onto its dynasties (see verify-v35.js).
const NAMES=['希腊','罗马','东罗马','中世纪西欧','基督教','埃及','波斯','中国'];
const OWN={east:['history-empire-leo','history-empire-justinian','history-empire-heraclius','history-arab-conquest','history-empire-constans','history-empire-anarchy',
  'history-empire-isaurian','history-empire-amorian','history-empire-macedonian','history-empire-macedonian'],
 west:['history-west-kingdoms','history-west-merovingians','history-west-lombards','history-west-charlemagne']};
const SHARED={'history-empire-heraclius/0':['east','persia','egypt'],'history-arab-conquest/0':['persia','east','egypt']};
const BOLD=[['history-faith-three-chapters/1','教义之争背后的权力格局之斗争，不一定是阴谋论，只是人类组织内群体对抗外群体和组织扩张，权力自我膨胀的自然结果'],
 ['history-empire-constans/0','吃马肉不吃马肝，不算你傻；谁再讨论什么几性几位几志就弄谁'],
 ['history-empire-constans/0','这是很聪明的策略：虽然有帝国动员能力不足导致底层宗教势大的原因，但君士坦丁以来跟着教义之争翻大饼，也的确弱化了皇权，如果早早就铁腕把这些争论都压下去，本是更聪明的办法。实际上查士丁尼在暴乱后下决心屠杀了三万人，的确让蓝绿党争消停了'],
 ['history-empire-constans/3','教义本身不那么重要'],['history-empire-amorian/2','人类可以以任意画一条线分为两派互相斗争。这是人类组织的自然属性'],
 ['history-empire-leo/5','也有要拉拢埃及、叙利亚的意思，让他们别太离心'],
 ['history-empire-justinian/4','大瘟疫也直接导致了波斯退兵'],
 ['history-empire-justinian/5','查士丁尼折腾了一辈子，拿回了意大利，但只撑了十几年就又丢了'],
 ['history-empire-justinian/5','内部宗教派系争夺也没停下，晚年就很颓'],
 ['history-empire-heraclius/0','叙利亚和埃及开始是怎么丢的？'],
 ['history-empire-heraclius/1','查士丁尼死后，继任者搞了个一致对外的圣战和萨珊打，用的是换家的打法'],
 ['history-empire-heraclius/1','最后君士坦丁堡靠天险和牧首打鸡血撑了六年'],
 ['history-empire-heraclius/2','撑到皇帝赢了，收回了叙利亚和埃及'],
 ['history-empire-heraclius/2','拜占庭帝国取代东罗马名号（以拉丁语不再作为官方语言为标志）'],
 ['history-empire-heraclius/3','在此期间，东罗马还又抓紧时间搞了一次宗教纷争'],
 ['history-empire-heraclius/4','五年后穆斯林就兴起了，很丝滑地就夺回了已经很离心的这些地区'],
 ['history-empire-heraclius/4','叙利亚和埃及丢了之后，停发免费粮食，君士坦丁堡的人口骤减'],
 ['history-west-merovingians/*','权力自我膨胀'],['history-west-lombards/*','组织扩张'],['history-arab-conquest/*','几次战争征服和领土变迁']];
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 try{
  for(const [width,height,label] of [[1440,960,'desktop'],[390,844,'390']]){
   const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height});
   await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
   await page.setRequestInterception(true);page.on('request',r=>/^https?:/.test(r.url())?r.abort():r.continue());
   await page.goto(pathToFileURL(target).href+'#history-empire-heraclius',{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);await wait(150);
   const r=await page.evaluate(({OWN,SHARED,BOLD})=>{
    const B=Object.fromEntries(HISTORY_BRANCHES.map(b=>[b.id,b])),own=id=>lineStations(id).filter(s=>s.lines.includes(id)).map(s=>s.id);
    const text=(id,i)=>{const e=HISTORY_ENTRIES.find(x=>x.id===id),d=document.createElement('div');d.innerHTML=e.html;const ps=[...d.querySelectorAll('[data-scene-text]')];
     return (i==='*'?ps:[ps.at(+i)]).map(p=>p.innerHTML).join(' ');};
    const all=HISTORY_ENTRIES.map(e=>[e.html,...e.moments.map(m=>m.text),...e.boxes.map(b=>b.text)].join(' ')).join(' ')+JSON.stringify(FIGURE_SCENES);
    const titles=new Set(HISTORY_ENTRIES.flatMap(e=>[e.title,e.short]));
    return {branches:HISTORY_BRANCHES.map(b=>[b.id,b.name,b.parent||null,b.from??null,b.to??null,b.lane]),
     ends:TREE_ENDS.map(e=>[e[0],e[1],e[4]||null]),futures:TREE_FUTURE.map(f=>[f[0],f[1]]),
     own:Object.fromEntries(Object.keys(OWN).map(id=>[id,own(id)])),
     romeLast:lineStations('rome').at(-1).id,eastHas:lineStations('east').map(s=>s.id),westHas:lineStations('west').map(s=>s.id),
     shared:Object.fromEntries(Object.keys(SHARED).map(k=>[k,{lines:[].concat(TREE_ROWS[k][0]),on:HISTORY_BRANCHES.filter(b=>lineStations(b.id).some(s=>s.key===k)).map(b=>b.id),
      entries:HISTORY_ENTRIES.filter(e=>e.id===k.split('/')[0]).length}])),
     bold:BOLD.map(([k,w])=>{const [id,i]=k.split('/');return [k,text(id,i).includes('<strong>'+w)];}),
     xrefs:[...new Set([...all.matchAll(/（(?:另)?见“([^”]+)”主线）/g)].map(m=>m[1]))],
     sections:[...all.matchAll(/（(?:另)?见“([^”]+)”一节）/g)].map(m=>m[1]).filter(t=>!titles.has(t)),
     old:/希腊主线|“西罗马”主线|“拜占庭”主线/.test(all),
     chars:HISTORY_ENTRIES.filter(e=>/^history-(empire-heraclius|west-(merovingians|lombards|charlemagne))$/.test(e.id)||/^history-(faith-three-chapters|arab-conquest|persia-khosrow-ii|china-tang)$/.test(e.id))
      .map(e=>{const d=document.createElement('div');d.innerHTML=e.html;return [e.id,e.ch,Math.max(...[...d.querySelectorAll('[data-scene-text]')].map(p=>p.textContent.replace(/\s/g,'').length))];})};
   },{OWN,SHARED,BOLD});
   // The lines and where they end.
   const br=Object.fromEntries(r.branches.map(b=>[b[0],b]));
   assert.deepEqual(r.branches.map(b=>b[1]).sort(),[...NAMES].sort(),'eight lines by name');
   assert.deepEqual(br.rome.slice(2,5),['trunk',-1000,476],'罗马 ends with the West');
   assert.deepEqual(br.east.slice(2,6),['rome',476,1056,br.trunk[5]],'东罗马 off 罗马 at 476, on the Greek lane, to 1056');
   assert.deepEqual(br.west.slice(1,4),['中世纪西欧','rome',476],'中世纪西欧 forks off 罗马 with 东罗马');
   assert.equal(r.romeLast,'history-empire-west-fall');assert.ok(r.eastHas.includes('history-empire-west-fall')&&r.westHas.includes('history-empire-west-fall'));
   assert.ok(!r.westHas.includes('history-empire-leo')&&!r.eastHas.includes('history-west-kingdoms'));
   for(const [id,list] of Object.entries(OWN))assert.deepEqual(r.own[id],list,id+' stations');
   assert.deepEqual(r.ends,[['trunk',-30,'rome'],['rome',476,null]]);
   // Every line either grows a shoot or ends with an event.
   for(const b of r.branches)assert.ok(r.futures.some(f=>f[0]===b[0])||r.ends.some(e=>e[0]===b[0]),b[0]+' ends without an event');
   assert.deepEqual(r.futures.sort(),[['china',845],['east',1056],['egypt',642],['faith',1056],['persia',651],['west',814]]);
   // Shared stations: one section, on each of its lines.
   for(const [k,lines] of Object.entries(SHARED)){assert.deepEqual(r.shared[k].lines,lines);assert.deepEqual(r.shared[k].on.sort(),[...lines].sort());assert.equal(r.shared[k].entries,1);}
   // 老无's own words, verbatim and bold.
   for(const [k,ok] of r.bold)assert.ok(ok,k+' lacks 老无’s words in bold');
   // Cross-line pointers use the line names; “X”一节 points at real sections.
   assert.ok(r.xrefs.every(x=>NAMES.includes(x)),JSON.stringify(r.xrefs));assert.equal(r.old,false,'old line names left');
   assert.deepEqual(r.sections,[],'pointers to missing sections');
   for(const [id,ch,n] of r.chars)assert.ok(n<=(ch===5?300:230),id+' '+n);
   // The drawn tree: ends, the merge into Rome, the split at 476, interchanges.
   const sel=label==='desktop'?'#toc .htree':'#treeSheet .htree';
   if(label!=='desktop'){await page.click('#treeOpen');await wait(200);}
   const t=await page.evaluate(sel=>{
    const tree=document.querySelector(sel),cx=(k,lane)=>[...tree.querySelectorAll(`.tree-node[data-key="${k}"]`)].map(n=>[+n.getAttribute('cx'),+n.getAttribute('cy')]);
    return {ends:[...tree.querySelectorAll('.tree-end')].map(e=>[e.dataset.branch,e.textContent]),stops:tree.querySelectorAll('.tree-stop').length,
     merge:!!tree.querySelector('.lane.merge[data-branch="trunk"]'),forks:[...tree.querySelectorAll('.fork')].map(f=>f.dataset.branch).sort(),
     forkY:tree._forkY,endY:tree._endY,war:cx('history-empire-heraclius/0'),arab:cx('history-arab-conquest/0'),swaps:tree.querySelectorAll('.interchange:not(.in)').length,
     on:[...tree.querySelectorAll('.tree-node.on')].map(n=>n.dataset.key),rows:tree.querySelectorAll('.tree-item[data-key="history-empire-heraclius/0"]').length,
     where:tree.querySelector('.tree-item[data-key="history-empire-heraclius/0"] small i')?.textContent};
   },sel);
   assert.deepEqual(t.ends.map(e=>e[0]),['trunk','rome']);assert.match(t.ends[0][1],/并入罗马/);assert.match(t.ends[1][1],/西罗马终结/);
   assert.equal(t.stops,2);assert.ok(t.merge,'希腊 runs into 罗马');
   assert.deepEqual(t.forks,['east','egypt','faith','persia','rome','west']);
   assert.equal(t.forkY.east,t.endY.rome);assert.equal(t.forkY.west,t.endY.rome);
   for(const k of ['war','arab']){assert.equal(t[k].length,3,k+' node on each line');assert.equal(new Set(t[k].map(p=>p[1])).size,1,k+' copies level');assert.equal(new Set(t[k].map(p=>p[0])).size,3);}
   assert.equal(t.swaps,6,'interchanges: the Persian war, the Arab conquests, and four East Roman stations shared with 基督教');assert.equal(t.rows,1,'one row for the shared station');assert.match(t.where,/东罗马、波斯、埃及/);
   assert.deepEqual(t.on,['history-empire-heraclius/0','history-empire-heraclius/0','history-empire-heraclius/0'],'a shared station lights up on all its lines');
   // Lighting: the chosen line, its ends and merges.
   const light=await page.evaluate((sel)=>{
    const out={};
    for(const line of ['trunk','rome','east','west','persia']){
     selectTreeLine(line);const tree=document.querySelector(sel);
     out[line]={ends:[...tree.querySelectorAll('.tree-end:not(.off-line)')].map(e=>e.dataset.branch),merge:tree.querySelector('.lane.merge').classList.contains('current'),
      war:!tree.querySelector('.tree-item[data-key="history-empire-heraclius/0"]').classList.contains('off-line'),
      lanes:[...new Set([...tree.querySelectorAll('.lane.current')].map(l=>l.dataset.branch))].sort()};
    }
    return out;
   },sel);
   assert.deepEqual(light.trunk,{ends:['trunk'],merge:true,war:false,lanes:['trunk']});
   assert.deepEqual(light.rome,{ends:['rome'],merge:false,war:false,lanes:['rome','trunk']});
   assert.deepEqual(light.east,{ends:['rome'],merge:false,war:true,lanes:['east','rome','trunk']});
   assert.deepEqual(light.west,{ends:['rome'],merge:false,war:false,lanes:['rome','trunk','west']});
   assert.deepEqual(light.persia,{ends:[],merge:false,war:true,lanes:['persia','trunk']});
   // Stepping along 波斯 from the shared war goes on to the Arab conquest; along 埃及 too.
   if(label!=='desktop'){await page.keyboard.press('Escape');await wait(100);}
   await page.evaluate(()=>{selectTreeLine('egypt');go('history-empire-heraclius');});await page.click('#next');
   assert.equal(await page.evaluate(()=>ENTRIES[cur].id),'history-arab-conquest');assert.equal(await page.evaluate(()=>treeLine),'egypt','stays on 埃及 through shared stations');
   await page.evaluate(()=>go('history-empire-heraclius',{scene:1}));await wait(250);
   await page.screenshot({path:path.join(shots,`heraclius_1-${label}.png`)});
   if(label==='desktop'){
    // Top header pills jump to that line's start time; clicking in the tree below keeps the timeline where it is.
    await page.evaluate(()=>{go('history-migration');toc.scrollTop=0;});
    await page.click('#toc .tree-line[data-line="east"]');
    const jumped=await page.evaluate(()=>{
     const bar=toc.querySelector('.tree-lines').getBoundingClientRect(),item=toc.querySelector('.tree-item.on').getBoundingClientRect();
     return {id:ENTRIES[cur].id,line:treeLine,scroll:toc.scrollTop,visible:item.top>=bar.bottom-2&&item.bottom<=toc.getBoundingClientRect().bottom};
    });
    assert.equal(jumped.id,'history-empire-leo');assert.equal(jumped.line,'east');assert.ok(jumped.scroll>500&&jumped.visible,JSON.stringify(jumped));
    const beforeClick=await page.evaluate(()=>toc.scrollTop);
    await page.click('#toc .tree-item[data-key="history-west-kingdoms/0"]');
    const afterItem=await page.evaluate(()=>({id:ENTRIES[cur].id,line:treeLine,scroll:toc.scrollTop}));
    assert.deepEqual(afterItem,{id:'history-west-kingdoms',line:'west',scroll:beforeClick},'clicking a tree item below does not move the timeline');
    await page.evaluate(()=>{selectTreeLine('east');go('history-empire-heraclius');});await page.click('#treeOpen');await wait(250);
    await page.evaluate(()=>treeSheet.querySelector('.tree-item.on')?.scrollIntoView({block:'center'}));await wait(150);
    await page.screenshot({path:path.join(shots,'tree-shared-1440.png')});
    await page.keyboard.press('Escape');
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: v34 tree — eight lines (希腊 ends by running into 罗马; 罗马 ends with the West in 476 and splits into 东罗马 and 中世纪西欧; 东罗马 stays 东罗马, now to 1056); every line ends with an event or a shoot; 希拉克略王朝 and 阿拉伯征服 are shared stations on 东罗马, 波斯 and 埃及, one row and one set of scenes, lit together; 老无’s words verbatim and bold (the 一志论 and 圣像之争 ones now on the East Roman dynasties); cross-line pointers by the new names; desktop and 390px; no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();}
})();
