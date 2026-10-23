const puppeteer=require('puppeteer-core'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'))).href;
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 async function pageAt(width=1440,height=960,reduced=true){
  const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));await p.setViewport({width,height});
  if(reduced)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await p.evaluateOnNewDocument(()=>localStorage.removeItem('agora-atlas-reader-collapsed'));
  await p.setRequestInterception(true);p.on('request',r=>/^https?:/.test(r.url())?r.abort():r.continue());
  await p.goto(url+'#history-migration',{waitUntil:'domcontentloaded'});return p;
 }
 async function state(p){return p.evaluate(()=>({id:ENTRIES[cur].id,scene:sceneIndex,row:[...toc.querySelectorAll('.chip')].findIndex(b=>b.classList.contains('on')),textScene:+document.getElementById('sceneContext')?.dataset.sceneText}));}
 async function visible(p,label){
  const d=await p.evaluate(()=>{
   const title=document.querySelector('#sceneContext .passage-title'),body=readerBody.getBoundingClientRect(),r=title.getBoundingClientRect();
   return {top:r.top,bottom:r.bottom,bodyTop:body.top,bodyBottom:body.bottom,scroll:readerBody.scrollTop,active:document.querySelectorAll('.scene-passage[aria-current="step"]').length,
    fits:document.documentElement.scrollWidth<=innerWidth&&readerBody.scrollWidth<=readerBody.clientWidth+1};
  });
  assert.ok(d.top>=d.bodyTop-1&&d.top<d.bodyBottom&&d.active===1&&d.fits,label+': '+JSON.stringify(d));
 }
 try{
  const p=await pageAt();
  assert.equal(await p.$$eval('#toc .chip',es=>es.length),100);
  // Metro lines: pick a line, then ↑↓ walk its stations in time order and stop at both ends.
  const lines=await p.evaluate(()=>HISTORY_BRANCHES.map(b=>({id:b.id,keys:lineStations(b.id).map(s=>s.key)})));
  assert.deepEqual(lines.map(l=>[l.id,l.keys.length]),[['trunk',23],['rome',32],['east',42],['west',36],['faith',19],['egypt',12],['persia',12],['china',12]]);
  const onKey=()=>p.evaluate(()=>({key:toc.querySelector('.chip.on').dataset.key,line:treeLine,focus:document.activeElement===toc.querySelector('.chip.on')}));
  const walked=new Set();
  for(const line of lines){
   await p.click(`#toc .tree-line[data-line="${line.id}"]`);
   const [id,from]=line.keys[0].split('/');await p.evaluate(({id,from})=>go(id,{scene:+from}),{id,from});
   await p.focus('#toc .chip.on');await p.keyboard.press('ArrowUp');assert.equal((await onKey()).key,line.keys[0]);walked.add(line.keys[0]);
   for(let i=1;i<line.keys.length;i++){
    await p.keyboard.press('ArrowDown');const s=await onKey();
    assert.deepEqual(s,{key:line.keys[i],line:line.id,focus:true},line.id+' '+i);walked.add(s.key);
   }
   await p.keyboard.press('ArrowDown');assert.equal((await onKey()).key,line.keys.at(-1));
   for(let i=line.keys.length-2;i>=0;i--){await p.keyboard.press('ArrowUp');assert.equal((await onKey()).key,line.keys[i]);}
  }
  assert.equal(walked.size,100,'every row lies on some line');
  // The same chapter has separate sidebar rows on either side of two era boundaries.
  await p.evaluate(()=>go('history-farming'));await p.focus('#map');await p.keyboard.press('ArrowDown');
  assert.equal((await state(p)).scene,1);assert.equal(await p.$eval('.active-era',e=>e.dataset.era),'bronze');
  await p.evaluate(()=>go('history-persian-wars',{scene:2}));await p.keyboard.press('ArrowRight');
  assert.equal((await state(p)).scene,3);assert.equal(await p.$eval('.active-era',e=>e.dataset.era),'classical');
  // Still on a Greek line, ↑ goes back to 马拉松 rather than across to Rome.
  await p.keyboard.press('ArrowUp');assert.equal((await state(p)).scene,0);assert.equal(await p.$eval('.active-era',e=>e.dataset.era),'archaic');
  const entries=await p.evaluate(()=>HISTORY_ENTRIES.map(e=>({id:e.id,count:e.scenes.length})));
  let count=0;
  for(const e of entries){
   await p.evaluate(id=>go(id),e.id);await p.focus('#map');
   assert.equal(await p.$$eval('.scene-passage',es=>es.length),e.count);
   for(let i=0;i<e.count;i++){
    if(i)await p.keyboard.press('ArrowRight');const s=await state(p);
    assert.equal(s.id,e.id);assert.equal(s.scene,i);assert.equal(s.textScene,i);await visible(p,e.id+'/'+i);count++;
   }
   await p.keyboard.press('ArrowRight');assert.equal((await state(p)).scene,e.count-1);assert.equal((await state(p)).id,e.id);
   for(let i=e.count-2;i>=0;i--){await p.keyboard.press('ArrowLeft');assert.equal((await state(p)).textScene,i);}
   await p.keyboard.press('ArrowLeft');assert.equal((await state(p)).scene,0);
  }
  assert.equal(count,343);
  // Meaningful correspondence, rather than several events sharing one summary paragraph.
  for(const [scene,word] of [['history-persian-wars/2','马拉松'],['history-persian-wars/3','萨拉米斯'],['history-celts/1','加拉太'],['history-celts/2','帕加马']]){
   await p.evaluate(scene=>go(scene),scene);assert.ok(await p.$eval('#sceneContext>p',(e,word)=>e.textContent.replace(/（[A-Za-z][^）]*）/g,'').includes(word),word));
  }
  await p.evaluate(()=>go('history-celts'));await p.focus('[data-person="brennus"] summary');await p.keyboard.press('ArrowRight');assert.equal((await state(p)).scene,1);
  await p.focus('#sceneRail button.on');await p.keyboard.press('ArrowRight');assert.equal((await state(p)).scene,2);
  assert.ok(await p.evaluate(()=>document.activeElement===sceneRail.querySelector('button.on')));
  // Editable controls keep their own keys; modifiers remain available for selection/browser actions.
  await p.evaluate(()=>{const input=document.createElement('input');input.id='typing-test';input.value='abc';document.body.append(input);input.focus();input.setSelectionRange(3,3);});
  await p.keyboard.press('ArrowLeft');assert.equal(await p.$eval('#typing-test',e=>e.selectionStart),2);assert.equal((await state(p)).scene,2);
  await p.$eval('#typing-test',e=>e.remove());await p.focus('#map');await p.keyboard.down('Shift');await p.keyboard.press('ArrowUp');await p.keyboard.up('Shift');assert.equal((await state(p)).scene,2);
  await p.evaluate(()=>go('alexander'));await p.focus('#map');await p.keyboard.press('ArrowRight');assert.equal(await p.$eval('#tl li.on',e=>e.dataset.k),'0');
  await p.keyboard.press('ArrowRight');assert.equal(await p.$eval('#tl li.on',e=>e.dataset.k),'1');
  await p.keyboard.press('ArrowLeft');assert.equal(await p.$eval('#tl li.on',e=>e.dataset.k),'0');
  assert.equal(await p.evaluate(()=>viewMode),'geography');
  await p.close();
  fs.mkdirSync(path.join(__dirname,'shots-v6'),{recursive:true});
  for(const [w,h] of [[390,844],[740,390]]){
   const mobile=await pageAt(w,h);await mobile.evaluate(()=>go('history-spartan-decline'));await mobile.focus('#map');
   for(let scene=1;scene<6;scene++){await mobile.keyboard.press('ArrowRight');await visible(mobile,w+' scene '+scene);}
   await mobile.evaluate(()=>readerBody.scrollTo({top:0,behavior:'instant'}));await mobile.keyboard.press('ArrowLeft');await visible(mobile,w+' reversed');
   await mobile.click('#readerToggle');await mobile.keyboard.press('ArrowRight');assert.equal(await mobile.$eval('#readerBody',e=>e.hidden),true);
   await mobile.click('#readerToggle');await visible(mobile,w+' re-expanded');
   await mobile.screenshot({path:path.join(__dirname,'shots-v6','keyboard-'+w+'.png')});await mobile.close();
  }
  const animated=await pageAt(1440,960,false);await animated.evaluate(()=>go('history-spartan-decline'));await animated.focus('#map');
  for(let n=0;n<5;n++)await animated.keyboard.press('ArrowRight');
  await animated.waitForFunction(()=>pending===null&&document.querySelector('#sceneContext')?.dataset.sceneText==='5',{timeout:6000});
  await animated.waitForFunction(()=>{const t=document.querySelector('#sceneContext .passage-title').getBoundingClientRect(),b=readerBody.getBoundingClientRect();return t.top>=b.top-1&&t.top<b.bottom;});
  assert.equal((await state(animated)).scene,5);await visible(animated,'rapid animated switching');
  await animated.screenshot({path:path.join(__dirname,'shots-v6','keyboard-desktop.png')});await animated.close();
  assert.deepEqual(errors,[]);console.log('PASS: 8 metro lines (23/32/42/36/19/12/12/12 stations, all 100 rows; 罗马 to 476, then 东罗马 and 中世纪西欧; 东罗马 by dynasty to 1056; shared stations walked on every line they sit on) walked up/down in time order; 343 scene-to-text passages with real arrow keys; era boundaries; map/reader/rail focus; input and modifiers; 33-stop geography timeline; mobile scrolling and fold restoration; rapid animated changes; offline; no page errors.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
