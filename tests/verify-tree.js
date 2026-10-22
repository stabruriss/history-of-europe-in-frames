const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'))).href;
const shots=path.join(__dirname,'shots-v10');fs.mkdirSync(shots,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// Geometry of one rendered tree: rows, nodes, forks, ticks, names; positions relative to the tree box.
const treeReport=sel=>{
 const tree=document.querySelector(sel),box=tree.getBoundingClientRect();
 const rel=el=>{const r=el.getBoundingClientRect();return {top:r.top-box.top,bottom:r.bottom-box.top,left:r.left,right:r.right};};
 const items=[...tree.querySelectorAll('.tree-item')].map(b=>{
  const node=tree.querySelector(`.tree-node[data-key="${b.dataset.key}"]`);
  return {key:b.dataset.key,branch:b.dataset.branch,t:TREE_ROWS[b.dataset.key][1],...rel(b),cx:node?+node.getAttribute('cx'):null,cy:node?+node.getAttribute('cy'):null};
 });
 const rows=[...tree.querySelectorAll('.tree-item,.tree-head,.tree-future,.tree-end')].map(el=>({text:el.textContent.slice(0,14),...rel(el)}));
 const names=[...tree.querySelectorAll('.tree-branch-name')].filter(n=>!n.hidden&&n.checkVisibility()).map(n=>({text:n.textContent,...rel(n)}));
 return {wide:tree.classList.contains('wide'),compact:tree.classList.contains('compact'),items,rows,names,
  forks:[...tree.querySelectorAll('.fork')].map(p=>p.dataset.branch).sort(),breaks:tree.querySelectorAll('.break').length,
  futures:[...tree.querySelectorAll('.tree-future')].map(el=>({text:el.textContent,...rel(el)})),futureLane:!!tree.querySelector('.future-lane'),
  ticks:[...tree.querySelectorAll('.tree-tick')].map(t=>({text:t.textContent,top:parseFloat(t.style.top)})),
  timeOrder:HISTORY_ERAS.flatMap(era=>era.items.map(([id,from=0])=>id+'/'+from)).map((k,i)=>[k,TREE_ROWS[k][1],i]).sort((a,b)=>a[1]-b[1]||a[2]-b[2]).map(x=>x[0])};
};
function checkTree(r,label){
 assert.equal(r.items.length,98,label);
 // Navigation order (DOM order) is the time order, and it reads top to bottom.
 assert.deepEqual(r.items.map(i=>i.key),r.timeOrder,label+' rows follow the time order');
 for(let i=1;i<r.items.length;i++)assert.ok(r.items[i].top>r.items[i-1].top,label+' row order runs top to bottom at '+r.items[i].key);
 // Distance from the root is time: an earlier start is always higher.
 for(const a of r.items)for(const b of r.items)if(a.t<b.t)assert.ok(a.top<b.top,`${label}: ${a.key} (${a.t}) should sit above ${b.key} (${b.t})`);
 const byTop=[...r.rows].sort((a,b)=>a.top-b.top);
 for(let i=1;i<byTop.length;i++)assert.ok(byTop[i].top>=byTop[i-1].bottom-.5,`${label}: rows overlap: ${byTop[i-1].text} / ${byTop[i].text}`);
 // Each branch is one lane; each row's node sits on its lane, level with its label.
 const lanes={};for(const i of r.items){assert.ok(i.cx!==null&&i.cy>=i.top&&i.cy<=i.bottom,label+' node '+i.key);(lanes[i.branch]??=new Set()).add(i.cx);}
 assert.deepEqual(Object.keys(lanes).sort(),['byz','china','east','egypt','faith','persia','rome','trunk','west'],label);
 assert.ok(Object.values(lanes).every(s=>s.size===1),label+' one lane per branch');
 // 东罗马 and 拜占庭 take the Greek lane, free since 希腊 ran into 罗马; China sits on its own parallel lane on the far right.
 assert.ok([...lanes.east][0]===[...lanes.trunk][0]&&[...lanes.byz][0]===[...lanes.trunk][0],label+' 东罗马 and 拜占庭 on the Greek lane');
 assert.equal(new Set(Object.values(lanes).map(s=>[...s][0])).size,7,label+' distinct lanes');
 // Left to right: 波斯, 埃及, the Greek trunk, Rome, West Rome, 基督教, then the parallel 中国 line on the outermost lane.
 assert.ok([...lanes.persia][0]<[...lanes.egypt][0]&&[...lanes.egypt][0]<[...lanes.trunk][0],label+' 波斯 and 埃及 left of the trunk');
 assert.ok([...lanes.rome][0]<[...lanes.west][0]&&[...lanes.west][0]<[...lanes.faith][0]&&[...lanes.faith][0]<[...lanes.china][0],label+' the 中国 line outermost');
 assert.deepEqual(r.forks,['east','egypt','faith','persia','rome','west'],label+' forks');
 assert.equal(r.breaks,3,label+' compressed prehistory is marked');
 // Overlapping topics read side by side at the same height.
 const top=k=>r.items.find(i=>i.key===k).top;
 assert.ok(top('history-poleis/0')<top('history-rome-kings/0')&&top('history-rome-kings/0')<top('history-sparta/0'),label+' Rome kings beside archaic Greece');
 assert.ok(top('history-celts/0')<top('history-rome-punic/0')&&top('history-rome-punic/0')<top('history-eastern-kingdoms/0'),label+' Punic Wars beside the Hellenistic kingdoms');
 assert.equal(r.futures.length,6,label);assert.match(r.futures.map(f=>f.text).join(' '),/走向东西分裂/,label);assert.match(r.futures.map(f=>f.text).join(' '),/希拉克略以后/,label);assert.match(r.futures.map(f=>f.text).join(' '),/晚唐五代与宋/,label);assert.ok(r.futureLane,label);
 assert.ok(r.futures.every(f=>f.top>top('history-rome-augustus/0')),label+' unwritten topics grow below');
 assert.match(r.futures.map(f=>f.text).join(' '),/加洛林以后/,label);
 assert.ok(r.futures.every(f=>f.top>top('history-empire-west-fall/0')),label+' the medieval shoot grows below 476');
 const years=r.ticks.map(t=>t.text);
 assert.ok(years.includes('前1000')&&years.includes('前500'),label+' ticks '+years);
 for(let i=1;i<r.ticks.length;i++)assert.ok(r.ticks[i].top>r.ticks[i-1].top,label+' tick order');
}
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 async function pageAt(width,height,hash='#history-rome-punic/1'){
  const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));await p.setViewport({width,height});
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await p.setRequestInterception(true);p.on('request',r=>/^https?:/.test(r.url())?r.abort():r.continue());
  await p.goto(url+hash,{waitUntil:'domcontentloaded'});await p.evaluate(()=>document.fonts.ready);await wait(150);return p;
 }
 const state=p=>p.evaluate(()=>({id:ENTRIES[cur].id,scene:sceneIndex,eyebrow:document.getElementById('entryEyebrow').textContent,
  on:[...document.querySelectorAll('#toc .tree-item.on')].map(b=>b.dataset.key),era:document.querySelector('#toc .active-era')?.dataset.era,
  sheet:!treeSheet.hidden,sheetOn:[...treeSheet.querySelectorAll('.tree-item.on')].map(b=>b.dataset.key)}));
 try{
  // Desktop sidebar: the whole history-process index is the tree.
  const p=await pageAt(1440,960);
  checkTree(await p.evaluate(treeReport,'#toc .htree'),'sidebar');
  const side=await p.evaluate(()=>{
   const t=toc.getBoundingClientRect(),on=toc.querySelector('.tree-item.on').getBoundingClientRect(),tree=toc.querySelector('.htree');
   return {fits:toc.scrollWidth<=toc.clientWidth&&[...toc.querySelectorAll('.tree-item,.tree-head,.tree-future')].every(e=>e.getBoundingClientRect().right<=t.right+.5),
    visible:on.top>=t.top-1&&on.bottom<=t.bottom+1,branch:tree.dataset.branch,
    lanes:[...tree.querySelectorAll('.lane.current')].map(l=>({branch:l.dataset.branch,y1:+l.dataset.y1,fork:l.classList.contains('fork')})),forkY:tree._forkY,
    dimTrunk:[...tree.querySelectorAll('.lane[data-branch="trunk"]:not(.current)')].length,offLine:[...tree.querySelectorAll('.tree-item.off-line')].map(b=>b.dataset.key),
    pills:[...toc.querySelectorAll('.tree-line')].map(b=>[b.dataset.line,b.classList.contains('on')]),pos:document.getElementById('pos').textContent,
    node:tree.querySelector('.tree-node.on')?.dataset.key,r:tree.querySelector('.tree-node.on')?.getAttribute('r'),
    compact:tree.classList.contains('compact'),open:treeOpen.checkVisibility()};
  });
  assert.ok(side.fits&&side.visible&&side.compact&&side.open,JSON.stringify(side));
  // The Rome line lights the trunk down to its fork, then its own branch; the rest of the tree dims.
  assert.equal(side.branch,'rome');
  assert.ok(side.lanes.some(l=>l.branch==='rome'&&l.fork)&&side.lanes.some(l=>l.branch==='trunk'),JSON.stringify(side.lanes));
  assert.ok(side.lanes.every(l=>l.branch==='rome'||(l.branch==='trunk'&&l.y1<=side.forkY.rome+.5)),JSON.stringify(side.lanes));
  assert.ok(side.dimTrunk>0);
  assert.deepEqual(side.pills,[['trunk',false],['rome',true],['east',false],['byz',false],['west',false],['faith',false],['egypt',false],['persia',false],['china',false]]);
  assert.equal(side.pos,'13 / 32');assert.ok(side.offLine.includes('history-poleis/0')&&!side.offLine.includes('history-palaces/0')&&!side.offLine.includes('history-rome-site/0'));
  assert.equal(side.node,'history-rome-punic/0');assert.equal(side.r,'5.5');
  let s=await state(p);assert.deepEqual(s.on,['history-rome-punic/0']);assert.equal(s.era,'rome-med');
  // Clicking a branch row picks its line; ↑↓ then stay on that line (metro style) and stop at its ends.
  await p.click('#toc .tree-item[data-key="history-faith-israel/0"]');
  s=await state(p);assert.equal(s.id,'history-faith-israel');assert.equal(s.scene,0);assert.equal(s.era,'faith-israel');assert.equal(s.eyebrow,'古代以色列 · 第七章');
  assert.equal(await p.evaluate(()=>toc.querySelector('.htree').dataset.branch),'faith');
  await p.keyboard.press('ArrowUp');s=await state(p);assert.deepEqual([s.id,s.on[0]],['history-palaces','history-palaces/0']);
  assert.equal(await p.evaluate(()=>treeLine),'faith');
  await p.keyboard.press('ArrowDown');await p.keyboard.press('ArrowDown');s=await state(p);assert.deepEqual([s.id,s.scene],['history-faith-first-temple',0],'the 基督教 line goes on to the First Temple');
  for(let i=0;i<7;i++)await p.keyboard.press('ArrowDown');
  s=await state(p);assert.deepEqual([s.id,s.scene],['history-faith-two-cities',0]);
  await p.keyboard.press('ArrowDown');s=await state(p);assert.deepEqual([s.id,s.scene],['history-faith-papacy',0]);
  await p.keyboard.press('ArrowDown');s=await state(p);assert.deepEqual([s.id,s.scene],['history-faith-three-chapters',0]);
  await p.keyboard.press('ArrowDown');s=await state(p);assert.deepEqual([s.id,s.scene],['history-faith-monothelites',0]);
  await p.keyboard.press('ArrowDown');s=await state(p);assert.deepEqual([s.id,s.scene],['history-faith-icons',0]);
  assert.ok(await p.$eval('#next',e=>e.disabled),'end of the 基督教 line');
  await p.click('#toc .tree-item[data-key="history-faith-israel/0"]');
  // Switching lines is in place: the section stays and the sidebar does not move; ↑↓ then follow the new line by time.
  const scroll0=await p.evaluate(()=>toc.scrollTop);
  await p.click('#toc .tree-line[data-line="trunk"]');s=await state(p);
  assert.deepEqual([s.id,s.scene],['history-faith-israel',0],'in place');assert.equal(await p.evaluate(()=>toc.scrollTop),scroll0,'no jump');
  assert.equal(await p.$eval('#pos',e=>e.textContent),'– / 23');
  await p.keyboard.press('ArrowDown');s=await state(p);assert.deepEqual([s.id,s.scene],['history-collapse',0],'next Greek station after 前1400');
  await p.keyboard.press('ArrowDown');s=await state(p);assert.deepEqual([s.id,s.scene],['history-dark-age',0]);
  await p.keyboard.press('ArrowDown');s=await state(p);assert.equal(s.id,'history-poleis','the Greek line skips Rome');
  await p.click('#toc .tree-line[data-line="rome"]');s=await state(p);assert.equal(s.id,'history-poleis','in place');
  await p.keyboard.press('ArrowUp');s=await state(p);assert.equal(s.id,'history-rome-site','previous Rome station before 前800');
  await p.keyboard.press('ArrowDown');s=await state(p);assert.equal(s.id,'history-rome-kings');
  await p.keyboard.press('ArrowDown');s=await state(p);assert.equal(s.id,'history-rome-republic');
  await p.keyboard.press('ArrowDown');s=await state(p);assert.equal(s.id,'history-rome-plebs');
  await p.click('#prev');await p.click('#prev');s=await state(p);assert.equal(s.id,'history-rome-kings');
  // Clicking the drawn line itself also switches in place.
  await p.evaluate(()=>go('history-celts'));assert.equal(await p.evaluate(()=>treeLine),'trunk');
  const clickLine=async line=>{
   const pt=await p.evaluate(line=>{
    const tree=toc.querySelector('.htree'),svg=tree.querySelector('.htree-svg').getBoundingClientRect(),cy=+tree.querySelector('.tree-node.on').getAttribute('cy');
    const any=tree.querySelector(`.tree-item[data-branch="${line}"]`),cx=+tree.querySelector(`.tree-node[data-key="${any.dataset.key}"]`).getAttribute('cx');
    return {x:svg.left+cx,y:svg.top+cy-8};
   },line);
   const before=await p.evaluate(()=>toc.scrollTop);await p.mouse.click(pt.x,pt.y);
   assert.equal(await p.evaluate(()=>toc.scrollTop),before,'line click does not scroll');
  };
  await clickLine('rome');s=await state(p);assert.equal(s.id,'history-celts');assert.equal(await p.evaluate(()=>treeLine),'rome');
  assert.equal(await p.$eval('#pos',e=>e.textContent),'– / 32');
  await p.keyboard.press('ArrowDown');s=await state(p);assert.equal(s.id,'history-rome-punic','next Rome station after 前279');
  await clickLine('trunk');s=await state(p);assert.equal(s.id,'history-rome-punic');assert.equal(await p.evaluate(()=>treeLine),'trunk');
  await p.keyboard.press('ArrowUp');s=await state(p);assert.equal(s.id,'history-celts','previous Greek station before 前264');
  // Off the chosen line everything greys out: rows, nodes, era headings.
  await p.evaluate(()=>go('history-rome-punic'));
  const grey=await p.evaluate(()=>{
   const tree=toc.querySelector('.htree'),st=el=>getComputedStyle(el);
   const row=k=>tree.querySelector(`.tree-item[data-key="${k}"]`),head=e=>tree.querySelector(`.tree-head[data-era="${e}"]`);
   return {line:treeLine,greekRow:[st(row('history-celts/0')).filter,+st(row('history-celts/0')).opacity],romeRow:[st(row('history-rome-kings/0')).filter,+st(row('history-rome-kings/0')).opacity],
    shared:+st(row('history-palaces/0')).opacity,greekHead:[head('hellenistic').classList.contains('off-line'),st(head('hellenistic')).filter],romeHead:head('rome-med').classList.contains('off-line'),
    node:st(tree.querySelector('.tree-node[data-key="history-celts/0"]')).filter,future:tree.querySelector('.tree-end[data-branch="rome"]').classList.contains('off-line')};
  });
  assert.equal(grey.line,'rome');
  assert.ok(/grayscale/.test(grey.greekRow[0])&&grey.greekRow[1]<.5,JSON.stringify(grey));
  assert.ok(grey.romeRow[0]==='none'&&grey.romeRow[1]===1&&grey.shared===1,JSON.stringify(grey));
  assert.ok(grey.greekHead[0]&&/grayscale/.test(grey.greekHead[1])&&!grey.romeHead&&/grayscale/.test(grey.node)&&!grey.future,JSON.stringify(grey));
  await p.click('#toc .tree-line[data-line="trunk"]');
  assert.ok(await p.evaluate(()=>toc.querySelector('.era-future').classList.contains('off-line')&&!toc.querySelector('.tree-item[data-key="history-celts/0"]').classList.contains('off-line')));
  await p.click('#toc .tree-line[data-line="rome"]');
  // Picking a line whose track already passes the current station keeps the station.
  await p.evaluate(()=>go('history-palaces'));await p.click('#toc .tree-line[data-line="rome"]');s=await state(p);
  assert.equal(s.id,'history-palaces');await p.keyboard.press('ArrowDown');await p.keyboard.press('ArrowDown');await p.keyboard.press('ArrowDown');
  s=await state(p);assert.equal(s.id,'history-rome-site');
  // A full ride on each line from the root: every ↓ lands lower in the tree, and the footer counts stations.
  for(const [line,startId,count,last] of [['trunk','history-migration',23,'history-hellenistic-end'],['rome','history-migration',32,'history-empire-west-fall'],['east','history-migration',35,'history-empire-maurice'],['byz','history-migration',38,'history-arab-conquest'],['west','history-migration',36,'history-west-charlemagne'],['faith','history-migration',17,'history-faith-icons'],['egypt','history-migration',12,'history-arab-conquest'],['persia','history-migration',12,'history-arab-conquest'],['china','history-china-neolithic',12,'history-china-tang']]){
   await p.evaluate(id=>go(id),startId);await p.click(`#toc .tree-line[data-line="${line}"]`);await p.focus('#toc .tree-item.on');
   let lastTop=-1;
   for(let i=0;i<count;i++){
    const w=await p.evaluate(()=>{const b=toc.querySelector('.tree-item.on');return {top:b.offsetTop,pos:document.getElementById('pos').textContent,focus:document.activeElement===b};});
    assert.ok(w.top>lastTop&&w.pos===`${i+1} / ${count}`&&w.focus,line+' walk '+i+' '+JSON.stringify(w));lastTop=w.top;
    await p.keyboard.press('ArrowDown');
   }
   s=await state(p);assert.equal(s.id,last);
  }
  // The column grip: drag wider, the tree opens up (branch names), the map shrinks; remembered; double-click restores.
  await p.evaluate(()=>go('history-rome-punic',{scene:1}));
  const before=await p.evaluate(()=>({side:side.getBoundingClientRect().width,map:map.getSize().x}));
  const grip=await p.$eval('#sideGrip',e=>{const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
  await p.mouse.move(grip.x,grip.y);await p.mouse.down();await p.mouse.move(grip.x+90,grip.y,{steps:4});await p.mouse.move(grip.x+176,grip.y,{steps:4});await p.mouse.up();
  const after=await p.evaluate(()=>({side:side.getBoundingClientRect().width,map:map.getSize().x,saved:+localStorage.getItem('agora-atlas-side-width'),
    compact:toc.querySelector('.htree').classList.contains('compact'),names:[...toc.querySelectorAll('.tree-branch-name')].filter(n=>!n.hidden&&n.checkVisibility()).length,
    fits:toc.scrollWidth<=toc.clientWidth,valuenow:+sideGrip.getAttribute('aria-valuenow'),fitted:map.getBounds().contains(L.latLngBounds(activeScene(ENTRIES[cur]).view))}));
  assert.ok(Math.abs(after.side-(before.side+176))<=2&&after.map<before.map-150&&Math.abs(after.saved-after.side)<=1,JSON.stringify({before,after}));
  assert.ok(!after.compact&&after.names>=6&&after.fits&&after.fitted&&Math.abs(after.valuenow-after.side)<=1,JSON.stringify(after));
  checkTree(await p.evaluate(treeReport,'#toc .htree'),'sidebar dragged wider');
  await p.focus('#sideGrip');const sc=await p.evaluate(()=>sceneIndex);await p.keyboard.press('ArrowRight');
  assert.equal(await p.evaluate(()=>Math.round(side.getBoundingClientRect().width)),Math.round(after.side)+16);assert.equal(await p.evaluate(()=>sceneIndex),sc,'grip keys do not change scenes');
  const grip2=await p.$eval('#sideGrip',e=>{const r=e.getBoundingClientRect();return {x:r.left+r.width/2,y:r.top+r.height/2};});
  await p.mouse.move(grip2.x,grip2.y);await p.mouse.down();await p.mouse.move(1400,grip2.y,{steps:5});await p.mouse.up();
  assert.equal(await p.evaluate(()=>Math.round(side.getBoundingClientRect().width)),640,'clamped');
  assert.ok(await p.evaluate(()=>toc.querySelector('.htree').classList.contains('wide')));
  await p.reload({waitUntil:'domcontentloaded'});await p.evaluate(()=>document.fonts.ready);await wait(150);
  assert.equal(await p.evaluate(()=>Math.round(side.getBoundingClientRect().width)),640,'width remembered');
  assert.ok(await p.evaluate(()=>map.getBounds().contains(L.latLngBounds(activeScene(ENTRIES[cur]).view))));
  await p.screenshot({path:path.join(shots,'tree-sidebar-wide.png')});
  await p.$eval('#sideGrip',e=>e.dispatchEvent(new MouseEvent('dblclick',{bubbles:true})));
  assert.equal(await p.evaluate(()=>Math.round(side.getBoundingClientRect().width)),244);
  assert.equal(await p.evaluate(()=>localStorage.getItem('agora-atlas-side-width')),null);
  await p.close();
  const tall=await pageAt(1440,2000);await tall.screenshot({path:path.join(shots,'tree-sidebar-desktop.png')});await tall.close();
  // Narrower desktop sidebar keeps the same tree inside its width.
  const narrow=await pageAt(1024,768);
  checkTree(await narrow.evaluate(treeReport,'#toc .htree'),'sidebar 1024');
  assert.ok(await narrow.evaluate(()=>toc.scrollWidth<=toc.clientWidth&&toc.querySelector('.htree').classList.contains('narrow')));
  await narrow.close();
  // Expanded view on desktop: a wider fan with branch names written along the branches.
  const d=await pageAt(1440,960);
  assert.equal(await d.$eval('#treeOpen',e=>e.innerText.trim()),'展开大图 ↗');
  await d.click('#treeOpen');s=await state(d);assert.ok(s.sheet);assert.deepEqual(s.sheetOn,['history-rome-punic/0']);
  const wide=await d.evaluate(treeReport,'#treeSheet .htree');checkTree(wide,'expanded');assert.ok(wide.wide);
  // Short lines still get their names where a stretch below the fork can hold them (sidebar dragged wide, phone sheet).
  assert.ok(['波斯','埃及','罗马','基督教','中国'].every(t=>wide.names.some(n=>n.text===t))&&wide.names.every(n=>['罗马','东罗马','拜占庭','中世纪西欧','基督教','埃及','波斯','中国'].includes(n.text)),JSON.stringify(wide.names.map(n=>n.text)));
  for(const n of wide.names)for(const i of wide.items)assert.ok(n.right<=i.left||n.left>=i.right||n.bottom<=i.top||n.top>=i.bottom,'name '+n.text+' over '+i.key);
  assert.ok(await d.evaluate(()=>{const b=treeSheet.querySelector('.tree-sheet-body').getBoundingClientRect(),r=treeSheet.querySelector('.tree-item.on').getBoundingClientRect();return r.top>=b.top&&r.bottom<=b.bottom;}));
  assert.ok(await d.evaluate(()=>document.activeElement===treeSheet.querySelector('.tree-item.on')));
  await d.screenshot({path:path.join(shots,'tree-sheet-desktop.png')});
  await d.keyboard.press('ArrowDown');s=await state(d);assert.equal(s.id,'history-rome-east','still on the Rome line in the big tree');assert.deepEqual(s.sheetOn,['history-rome-east/0']);
  assert.ok(await d.$eval('#treeSheet .tree-line[data-line="rome"]',e=>e.classList.contains('on')));
  assert.ok(await d.evaluate(()=>document.activeElement===treeSheet.querySelector('.tree-item.on')));
  await d.click('#treeSheet .tree-item[data-key="history-rome-kings/0"]');s=await state(d);
  assert.equal(s.id,'history-rome-kings');assert.equal(s.sheet,false);
  await d.click('#treeOpen');await d.keyboard.press('Escape');s=await state(d);assert.equal(s.sheet,false);
  assert.ok(await d.evaluate(()=>document.activeElement===treeOpen));
  await d.click('#tGeography');
  assert.ok(await d.evaluate(()=>!treeOpen.checkVisibility()&&!toc.querySelector('.htree')));
  await d.close();
  // Phones: the sidebar is a menu, so the tree opens as a full-screen sheet.
  for(const [w,h] of [[390,844],[740,390]]){
   const m=await pageAt(w,h);
   assert.ok(await m.evaluate(()=>getComputedStyle(toc).display==='none'&&treeOpen.checkVisibility()&&treeOpen.innerText.trim()==='树状图'&&!sideGrip.checkVisibility()));
   await m.click('#treeOpen');s=await state(m);assert.ok(s.sheet);
   const r=await m.evaluate(treeReport,'#treeSheet .htree');checkTree(r,'phone '+w);assert.equal(r.wide,w>=480);
   if(w===390){assert.ok(!r.compact&&r.names.length>=6,JSON.stringify(r.names.map(n=>n.text)));await m.screenshot({path:path.join(shots,'tree-sheet-390.png')});}
   assert.ok(await m.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
   await m.click('#treeSheet .tree-item[data-key="history-ptolemaic-bargain/0"]');s=await state(m);
   assert.equal(s.id,'history-ptolemaic-bargain');assert.equal(s.sheet,false);
   assert.equal(await m.evaluate(()=>mobileToc.value),'history-ptolemaic-bargain/0');
   await m.click('#treeOpen');await m.keyboard.press('Escape');assert.equal((await state(m)).sheet,false);
   await m.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: history tree — 98 rows on 9 branches (希腊, 罗马, 东罗马, 拜占庭, 中世纪西欧, 基督教, 埃及, 波斯, 中国) with 6 forks (埃及 and 波斯 off the trunk at the early states, 基督教 at 前1400 on the outermost lane, 东罗马 and 中世纪西欧 off 罗马 at 476; 拜占庭 carries on in 东罗马’s lane); every earlier start sits higher; no overlapping rows; nodes on their lanes; Rome beside Greece and the Hellenistic kingdoms; unwritten topics as dashed shoots; time ticks and compressed-prehistory breaks; metro lines: pick a line (button or the drawn line itself) in place, ↑↓ / 上一条 / 下一条 ride only that line in time order, line lit root-to-fork, everything else greyed; draggable, remembered, clamped column; sidebar at 1440 and 1024; expanded view with branch names; phone and short-landscape sheets; geography mode untouched; offline; no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();}
})();
