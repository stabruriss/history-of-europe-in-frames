// On the train: ← → change station, ↑ ↓ change scene. Other modes keep the atlas's own keys.
const puppeteer=require('puppeteer-core'),assert=require('node:assert/strict'),path=require('node:path');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'))).href;
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 async function pageAt(width=1440,height=960,reduced=true,hash='#history-migration'){
  const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));await p.setViewport({width,height});
  if(reduced)await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await p.setOfflineMode(true);
  await p.goto(url+hash,{waitUntil:'domcontentloaded'});await p.evaluate(()=>document.fonts.ready);return p;
 }
 const state=p=>p.evaluate(()=>({id:ENTRIES[cur].id,scene:sceneIndex,textScene:+document.getElementById('sceneContext')?.dataset.sceneText,...metroUI.state()}));
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
  const total=await p.evaluate(()=>metroUI.data.stations.length);
  // Every line, every station: → walks it in time order, ← walks it back, and both stop at the ends without leaving the line.
  const walked=await p.evaluate(()=>{
   const _rc=renderCard,_f=fit,_c=makeCtx;renderCard=()=>{};fit=()=>{};makeCtx=()=>new Proxy({},{get:()=>()=>{}});
   try{
    const seen=new Set(),press=key=>document.body.dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true})),st=()=>metroUI.state();
    for(const l of metroUI.data.lines){
     const keys=metroUI.data.lineStops.get(l.id).map(s=>s.key);
     metroUI.board(l.id,{key:keys[0]});press('ArrowLeft');if(st().station!==keys[0]||st().line!==l.id)throw new Error(l.id+' start');seen.add(keys[0]);
     for(let i=1;i<keys.length;i++){press('ArrowRight');const s=st();if(s.station!==keys[i]||s.line!==l.id||s.scene!==0)throw new Error(l.id+' '+i+' '+JSON.stringify(s));seen.add(s.station);}
     press('ArrowRight');if(st().station!==keys.at(-1))throw new Error(l.id+' end');
     for(let i=keys.length-2;i>=0;i--){press('ArrowLeft');if(st().station!==keys[i])throw new Error(l.id+' back '+i);}
    }
    return seen.size;
   }finally{renderCard=_rc;fit=_f;makeCtx=_c;}
  });
  assert.equal(walked,total,'every station lies on some line');
  // Every scene: ↓ walks a station's scenes with its text and its alone on the page, and stops at the station's edges.
  const count=await p.evaluate(()=>{
   const _f=fit,_c=makeCtx;fit=()=>{};makeCtx=()=>new Proxy({},{get:()=>()=>{}});
   try{
    let count=0;const mapEl=document.getElementById('map'),press=key=>(document.activeElement||document.body).dispatchEvent(new KeyboardEvent('keydown',{key,bubbles:true,cancelable:true}));
    const textScene=()=>+document.getElementById('sceneContext')?.dataset.sceneText;
    const checkVis=label=>{const title=document.querySelector('#sceneContext .passage-title'),body=readerBody.getBoundingClientRect(),r=title.getBoundingClientRect();
     const active=document.querySelectorAll('.scene-passage[aria-current="step"]').length,fits=document.documentElement.scrollWidth<=innerWidth&&readerBody.scrollWidth<=readerBody.clientWidth+1;
     if(!(r.top>=body.top-1&&r.top<body.bottom&&active===1&&fits))throw new Error(label);};
    for(const s of metroUI.data.stations){
     metroUI.board(s.lines[0],{key:s.key});mapEl.focus();
     if(card.querySelectorAll('.scene-passage:not(.off-station)').length!==s.count)throw new Error(s.key+' shows the wrong scenes');
     for(let i=0;i<s.count;i++){
      if(i)press('ArrowDown');
      if(metroUI.state().station!==s.key||sceneIndex!==s.from+i||textScene()!==s.from+i)throw new Error(s.key+' scene '+i);
      checkVis(s.key+'/'+i);count++;
     }
     press('ArrowDown');if(sceneIndex!==s.to||metroUI.state().station!==s.key)throw new Error(s.key+' bottom edge');
     for(let i=s.count-2;i>=0;i--){press('ArrowUp');if(textScene()!==s.from+i)throw new Error(s.key+' up '+i);}
     press('ArrowUp');if(sceneIndex!==s.from||metroUI.state().station!==s.key)throw new Error(s.key+' top edge');
    }
    return count;
   }finally{fit=_f;makeCtx=_c;}
  });
  assert.equal(count,await p.evaluate(()=>ENTRIES.filter(isHistory).reduce((n,e)=>n+e.scenes.length,0)));
  // A chapter that crosses an era is two stations: ↓ stays in one, → moves to the next.
  await p.evaluate(()=>metroUI.board('trunk',{key:'history-farming/0'}));await p.focus('#map');
  const farming=await state(p);await p.keyboard.press('ArrowDown');let s=await state(p);assert.equal(s.station,farming.station);assert.equal(s.scene,farming.scene);
  await p.keyboard.press('ArrowRight');s=await state(p);assert.notEqual(s.station,farming.station);assert.equal(s.id,'history-farming');assert.equal(s.scene,0);
  // Changing line at a shared station keeps the event and the scene; → then follows the new line.
  await p.evaluate(()=>metroUI.board('east',{key:'history-crusade-fourth/0'}));await p.focus('#map');await p.keyboard.press('ArrowDown');await p.keyboard.press('ArrowDown');
  await p.click('[data-transfer="crusade"]');assert.equal((await state(p)).line,'east','asks first');await p.click('#transferConfirm');s=await state(p);assert.equal(s.line,'crusade');assert.equal(s.station,'history-crusade-fourth/0');assert.equal(s.scene,2);
  await p.keyboard.press('ArrowRight');s=await state(p);assert.equal(s.line,'crusade');assert.equal(s.station,'history-crusade-fifth/0');assert.equal(s.scene,0);
  // Meaningful correspondence, rather than several events sharing one summary paragraph.
  for(const [scene,word] of [['history-persian-wars/2','马拉松'],['history-persian-wars/3','萨拉米斯'],['history-celts/1','加拉太'],['history-celts/2','帕加马']]){
   await p.evaluate(scene=>go(scene),scene);assert.ok(await p.$eval('#sceneContext>p',(e,word)=>e.textContent.replace(/（[A-Za-z][^）]*）/g,'').includes(word),word));
  }
  // Keys work with focus on a person card in the text.
  await p.evaluate(()=>go('history-celts'));await p.focus('[data-person="brennus"] summary');await p.keyboard.press('ArrowDown');assert.equal((await state(p)).scene,1);
  // Editable controls keep their own keys; modifiers remain available for selection/browser actions.
  await p.evaluate(()=>{const input=document.createElement('input');input.id='typing-test';input.value='abc';document.body.append(input);input.focus();input.setSelectionRange(3,3);});
  await p.keyboard.press('ArrowLeft');assert.equal(await p.$eval('#typing-test',e=>e.selectionStart),2);assert.equal((await state(p)).scene,1);
  await p.$eval('#typing-test',e=>e.remove());await p.focus('#map');await p.keyboard.down('Shift');await p.keyboard.press('ArrowUp');await p.keyboard.up('Shift');assert.equal((await state(p)).scene,1);
  // Esc leaves the train; on the whole map the arrows change nothing.
  const before=await state(p);await p.keyboard.press('Escape');assert.equal((await state(p)).mode,'network');
  await p.keyboard.press('ArrowRight');await p.keyboard.press('ArrowDown');s=await state(p);assert.equal(s.station,before.station);assert.equal(s.scene,before.scene);
  // Outside 历史进程 the atlas's own keys still work: ↑↓ through the list, ←→ along Alexander's timeline.
  await p.evaluate(()=>go('alexander'));assert.equal((await state(p)).mode,'off');await p.focus('#map');await p.keyboard.press('ArrowRight');assert.equal(await p.$eval('#tl li.on',e=>e.dataset.k),'0');
  await p.keyboard.press('ArrowRight');assert.equal(await p.$eval('#tl li.on',e=>e.dataset.k),'1');
  await p.keyboard.press('ArrowLeft');assert.equal(await p.$eval('#tl li.on',e=>e.dataset.k),'0');
  assert.equal(await p.evaluate(()=>viewMode),'geography');
  const place=await p.evaluate(()=>cur);await p.keyboard.press('ArrowDown');assert.equal(await p.evaluate(()=>cur),place+1);
  await p.close();
  
  for(const [w,h] of [[390,844],[740,390]]){
   const mobile=await pageAt(w,h);await mobile.evaluate(()=>go('history-spartan-decline'));await mobile.focus('#map');
   for(let scene=1;scene<6;scene++){await mobile.keyboard.press('ArrowDown');await visible(mobile,w+' scene '+scene);}
   await mobile.evaluate(()=>readerBody.scrollTo({top:0,behavior:'instant'}));await mobile.keyboard.press('ArrowUp');await visible(mobile,w+' reversed');
   await mobile.close();
  }
  const animated=await pageAt(1440,960,false);await animated.evaluate(()=>go('history-spartan-decline'));await animated.focus('#map');
  for(let n=0;n<5;n++)await animated.keyboard.press('ArrowDown');
  await animated.waitForFunction(()=>pending===null&&document.querySelector('#sceneContext')?.dataset.sceneText==='5',{timeout:6000});
  await animated.waitForFunction(()=>{const t=document.querySelector('#sceneContext .passage-title').getBoundingClientRect(),b=readerBody.getBoundingClientRect();return t.top>=b.top-1&&t.top<b.bottom;});
  assert.equal((await state(animated)).scene,5);await visible(animated,'rapid animated switching');
  await animated.close();
  assert.deepEqual(errors,[]);console.log(`PASS: on the train, ← → walked all ${total} stations along every line they sit on and ↑ ↓ walked ${count} scenes with their text, stopping at the edges; line changes keep the scene; focus on the map and in the text; inputs and modifiers; Esc and the whole map; the atlas's own keys outside 历史进程; phones and rapid animated changes; offline; no page errors.`);
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})().catch(e=>{console.error(e);process.exitCode=1;});
