const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const shots=path.join(__dirname,'shots-v33');require('node:fs').mkdirSync(shots,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// 老无 2026-10-21: 埃及 and 波斯 are lines of their own, leaving the trunk at the early states; the Ptolemies, the Seleucids,
// Rome and Byzantium are passing rulers of these lands. The old Ptolemaic and Seleucid sections now sit on these lines.
const EGYPT=["history-egypt-old", "history-egypt-middle", "history-egypt-new", "history-egypt-late", "history-egypt-roman", "history-egypt-byzantine"],PERSIA=["history-persia-elam", "history-persia-achaemenid", "history-persia-parthia", "history-persia-sasanian", "history-persia-khosrow", "history-persia-khosrow-ii", "history-arab-rise", "history-arab-muhammad", "history-arab-conquest", "history-arab-expansion", "history-arab-caliphs", "history-arab-constantinople", "history-arab-abbasid"];
const PHRASES=[["history-egypt-roman/0", "托勒密只是亚历山大之后的统治者"], ["history-egypt-roman/0", "临时统治者"], ["history-egypt-old/0", "两土地"], ["history-egypt-old/0", "纳尔迈"], ["history-egypt-old/2", "工人村"], ["history-egypt-old/2", "梅雷尔"], ["history-egypt-old/3", "第一中间期"], ["history-egypt-middle/1", "塞姆纳"], ["history-egypt-middle/2", "喜克索斯"], ["history-egypt-middle/2", "没有证据"], ["history-egypt-middle/3", "雅赫摩斯"], ["history-egypt-new/0", "哈特谢普苏特"], ["history-egypt-new/1", "阿赫那吞"], ["history-egypt-new/2", "卡迭石"], ["history-egypt-new/3", "罢工"], ["history-egypt-late/0", "舍顺克"], ["history-egypt-late/1", "皮耶"], ["history-egypt-late/2", "瑙克拉提斯"], ["history-egypt-late/3", "冈比西斯"], ["history-egypt-late/3", "“波斯—阿拉伯”主线"], ["history-egypt-new/1", "“基督教”主线"], ["history-egypt-roman/1", "人头税"], ["history-egypt-roman/2", "犹太"], ["history-egypt-roman/3", "庞培柱"], ["history-egypt-byzantine/0", "科普特"], ["history-egypt-byzantine/1", "阿皮翁"], ["history-egypt-byzantine/2", "菲莱"], ["history-persia-parthia/0", "所谓的“东方”也是一个道理"], ["history-persia-parthia/0", "过客"], ["history-persia-elam/0", "原始埃兰文"], ["history-persia-elam/1", "汉谟拉比"], ["history-persia-elam/2", "亚述巴尼拔"], ["history-persia-elam/3", "米底"], ["history-persia-achaemenid/0", "居鲁士"], ["history-persia-achaemenid/1", "贝希斯敦"], ["history-persia-achaemenid/2", "二十个省"], ["history-persia-achaemenid/2", "书同文"], ["history-persia-achaemenid/3", "高加米拉"], ["history-persia-parthia/1", "大宛列传"], ["history-persia-parthia/2", "苏雷那"], ["history-persia-parthia/3", "甘英"], ["history-persia-parthia/4", "阿尔达希尔"], ["history-persia-sasanian/1", "瓦勒良"], ["history-persia-sasanian/2", "卡提尔"], ["history-persia-sasanian/3", "尼西比斯"], ["history-persia-khosrow/0", "东方教会"], ["history-persia-khosrow/1", "嚈哒"], ["history-persia-khosrow/2", "马兹达克"], ["history-persia-khosrow/3", "德赫干"], ["history-persia-khosrow/4", "“东罗马”主线"]];
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 try{
  for(const [width,height,label] of [[1440,960,'desktop'],[390,844,'390']]){
   const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height});
   await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
   await page.setRequestInterception(true);page.on('request',r=>/^https?:/.test(r.url())?r.abort():r.continue());
   await page.goto(pathToFileURL(target).href+'#'+EGYPT[0],{waitUntil:'domcontentloaded'});
   const report=await page.evaluate(()=>{
    const chars=html=>{const d=document.createElement('div');d.innerHTML=html;return d.textContent.replace(/（[A-Za-z][^）]*）/g,'').replace(/\s/g,'').length;};
    const paras=es=>es.flatMap(e=>{const d=document.createElement('div');d.innerHTML=e.html;return [...d.querySelectorAll('[data-scene-text]')].map(p=>({id:e.id+'/'+p.dataset.sceneText,chars:chars(p.innerHTML)}));});
    const line=id=>{const b=HISTORY_BRANCHES.find(b=>b.id===id);return [b.name,b.lane,b.parent,b.from,b.to];};
    const eg=HISTORY_ENTRIES.filter(e=>e.ch===8),pe=HISTORY_ENTRIES.filter(e=>e.ch===9);
    return {chapters:[HISTORY_CH[8],HISTORY_CH[9]],egypt:eg.map(e=>e.id),persia:pe.map(e=>e.id),paras:paras([...eg,...pe]),
     bold:[...eg,...pe].map(e=>[e.id,/<strong>/.test(e.html)]),strong:[...eg,...pe].map(e=>e.html.match(/<strong>[^<]*<\/strong>/g)||[]).flat().join(' '),
     lines:[line('egypt'),line('persia')],old:HISTORY_BRANCHES.some(b=>['ptolemaic','seleucid'].includes(b.id)),
     egyptLine:lineStations('egypt').map(s=>s.id),persiaLine:lineStations('persia').map(s=>s.id),
     rows:{ptolemaic:TREE_ROWS['history-ptolemaic-bargain/0'][0],eastern:TREE_ROWS['history-eastern-kingdoms/0'][0]},
     eras:HISTORY_ERAS.filter(e=>/^(egypt|persia)-/.test(e.id)).map(e=>[e.id,e.items.map(([id])=>id)]),
     shoots:TREE_FUTURE.filter(f=>['egypt','persia'].includes(f[0])).map(f=>[f[0],f[1]])};
   });
   assert.deepEqual(report.chapters,['埃及','波斯—阿拉伯']);
   assert.deepEqual(report.egypt,EGYPT);assert.deepEqual(report.persia,PERSIA);
   assert.ok(report.paras.every(p=>p.chars<=230),'Concise: '+JSON.stringify(report.paras.filter(p=>p.chars>230)));
   assert.match(report.strong,/临时统治者/,'老无’s reading of Egypt in bold');assert.match(report.strong,/东方/,'老无’s reading of the East in bold');
   assert.deepEqual(report.lines,[['埃及',1,'trunk',-3100,642],['波斯—阿拉伯',0,'trunk',-3200,945]]);assert.equal(report.old,false);
   assert.deepEqual(report.rows,{ptolemaic:'egypt',eastern:'persia'});
   // Each line leaves the trunk at the early states, then runs through its own dynasties; the Hellenistic sections sit in the middle.
   assert.deepEqual(report.egyptLine.slice(0,3),['history-migration','history-farming','history-farming']);
   // The shared stations (the last Roman–Persian war, the Arab conquests) sit on 埃及 and 波斯 too.
   assert.deepEqual(report.egyptLine.slice(3),['history-egypt-old','history-egypt-middle','history-egypt-new','history-egypt-late','history-ptolemaic-bargain','history-egypt-roman','history-egypt-byzantine','history-empire-heraclius','history-arab-conquest']);
   assert.deepEqual(report.persiaLine.slice(3),['history-persia-elam','history-persia-achaemenid','history-eastern-kingdoms','history-persia-parthia','history-persia-sasanian','history-persia-khosrow','history-persia-khosrow-ii','history-empire-heraclius','history-arab-rise','history-arab-muhammad','history-arab-conquest','history-arab-expansion','history-arab-caliphs','history-arab-constantinople','history-spain-fall','history-arab-abbasid']);
   assert.deepEqual(report.shoots,[['egypt',642],['persia',945]]);
   for(const [scene,phrase] of PHRASES){
    await page.evaluate(s=>go(s),scene);
    assert.ok(await page.$eval('#sceneContext>p',(e,w)=>e.textContent.replace(/（[A-Za-z][^）]*）/g,'').includes(w),phrase),scene+' lacks '+phrase);
   }
   await page.evaluate(id=>go(id),EGYPT[0]);assert.match(await page.$eval('#entryEyebrow',e=>e.textContent),/ · 第九章$/);
   await page.evaluate(id=>go(id),PERSIA[0]);assert.match(await page.$eval('#entryEyebrow',e=>e.textContent),/ · 第十章$/);
   if(label==='desktop'){
    assert.match(await page.$eval('#indexCaption',e=>e.textContent),/Ⅸ 埃及 Ⅹ 波斯—阿拉伯 Ⅺ 东欧/);
    assert.ok(await page.$$eval('#toc .tree-item[data-branch="egypt"] small',(es,n)=>es.length===n&&es.every(e=>e.textContent.startsWith('埃及 · ')),EGYPT.length+1));
    assert.ok(await page.$$eval('#toc .tree-item[data-branch="persia"] small',(es,n)=>es.length===n&&es.every(e=>/^波斯—阿拉伯(、[^ ]+)? · /.test(e.textContent)),PERSIA.length));
   }
   for(const e of [...EGYPT,...PERSIA])for(let i=0;i<await page.evaluate(id=>HISTORY_ENTRIES.find(x=>x.id===id).scenes.length,e);i++){
    const r=await page.evaluate(({e,i})=>{go(e,{scene:i});const s=activeScene(ENTRIES[cur]);
     return {pins:Object.keys(pinIndex).length,layers:group.getLayers().length,legend:legend.children.length,fits:map.getBounds().contains(L.latLngBounds(s.view)),overflow:document.documentElement.scrollWidth>innerWidth};},{e,i});
    await wait(60);
    assert.ok(r.layers>0&&r.legend>0&&!r.overflow,e+'/'+i+' '+JSON.stringify(r));
    if(label==='desktop')assert.ok(r.pins>0&&r.fits,e+'/'+i+' '+JSON.stringify(r));
   }
   for(const scene of [EGYPT[0]+'/0',EGYPT[2]+'/0',EGYPT[4]+'/0',PERSIA[1]+'/0',PERSIA[2]+'/0',PERSIA[4]+'/0']){
    await page.evaluate(s=>go(s),scene);await wait(300);
    if(label==='390')await page.evaluate(()=>scrollSceneText(false));
    await page.screenshot({path:path.join(shots,`${scene.replace('/','_')}-${label}.png`)});
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: chapters Ⅸ 埃及 and Ⅹ 波斯—阿拉伯 — two lines of their own off the trunk at the early states ('+EGYPT.length+' + '+PERSIA.length+' new sections; the Ptolemaic and Seleucid sections now on these lines), ≤230 chars per scene, 老无’s readings in bold, '+PHRASES.length+' phrase checks, eyebrows, tree labels, shoots to 642 and 945, every scene drawn and fitted, desktop and 390px, offline, no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();}
})();
