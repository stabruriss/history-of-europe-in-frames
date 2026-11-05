// The layout readers actually see: the whole-map view, the on-train view, and the other two modes. Run with FULL_SHOTS=1 to write screenshots.
const puppeteer=require('puppeteer-core'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
const {pathToFileURL}=require('node:url');
const url=pathToFileURL(path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'))).href;
const shots=path.join(__dirname,'shots-metro');
const shot=async(tab,name)=>{if(process.env.FULL_SHOTS==='1'){fs.mkdirSync(shots,{recursive:true});await tab.screenshot({path:path.join(shots,name+'.png')});}};
const settle=p=>p.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 async function pageAt(width,height,hash='',touch=false){
  const p=await browser.newPage();p.on('pageerror',e=>errors.push(e.message));await p.setViewport({width,height,hasTouch:touch,isMobile:touch});
  await p.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);await p.setOfflineMode(true);
  await p.goto(url+hash,{waitUntil:'load'});await p.evaluate(()=>document.fonts.ready);await settle(p);return p;
 }
 const on=(p,sel)=>p.$eval(sel,e=>e.checkVisibility());
 try{
  /* ---------- The site's identity stays ---------- */
  const p=await pageAt(1440,900);
  const shell=await p.evaluate(()=>({
   icon:document.getElementById('brandMark').src===document.querySelector('link[rel="icon"]').href,
   h1:document.querySelector('#masthead h1').firstChild.textContent,tagline:document.querySelector('#masthead h1 span').textContent,
   github:document.getElementById('ghBanner').href,banner:document.getElementById('ghBanner').textContent.replace(/\s/g,''),ghIcon:!!document.querySelector('#ghBanner svg.gh-icon'),title:document.title,
   tabs:[...document.querySelectorAll('#modebar button')].map(b=>b.textContent),cornerButtons:document.getElementById('tools').checkVisibility()}));
  assert.deepEqual(shell,{icon:true,h1:'简明欧洲史图册',tagline:'历史进程 · 地理图册 · 动力专题',github:'https://github.com/stabruriss/history-of-europe-in-frames',banner:'开源项目·欧洲历史笔记',ghIcon:true,title:'简明欧洲史图册',tabs:['历史进程','地理概念','动力专题'],cornerButtons:false});

  /* ---------- Whole map ---------- */
  assert.equal(await p.evaluate(()=>document.body.dataset.metro),'network');
  assert.ok(await on(p,'#networkMode'));assert.ok(!(await on(p,'#stationInspector')),'opens uncluttered');assert.equal(await p.$eval('#networkCanvas',e=>e.dataset.lod),'1');
  await shot(p,'network');
  const counts=await p.evaluate(()=>({nodes:document.querySelectorAll('.metro-node').length,stations:metroUI.data.stations.length,rails:document.querySelectorAll('.rail-path').length,lines:HISTORY_BRANCHES.length,
   shared:metroUI.data.stations.filter(s=>s.lines.length>1).length,transfers:document.querySelectorAll('.metro-node.transfer').length,starts:document.querySelectorAll('.line-flag.flag-start').length,ends:document.querySelectorAll('.line-flag.flag-end').length,
   rows:historyTreeRows().filter(r=>r.kind==='item').length,slices:document.querySelectorAll('#yearRuler button').length,sliceData:TREE_SLICES.length,visibleFlags:new Set([...document.querySelectorAll('.line-flag:not(.culled)')].map(e=>e.dataset.line)).size}));
  assert.equal(counts.nodes,counts.rows,'every section row is a station');assert.equal(counts.stations,counts.rows);assert.equal(counts.rails,counts.lines);assert.equal(counts.transfers,counts.shared);
  assert.equal(counts.starts,counts.lines);assert.equal(counts.ends,counts.lines);assert.equal(counts.slices,counts.sliceData,'every time slice is on the ruler');assert.equal(counts.visibleFlags,counts.lines,'every line has a signpost at whole-map zoom');
  const layout=await p.evaluate(()=>metroUI.layoutReport());
  assert.deepEqual(layout.undrawnLines,[],'a new line needs its route drawn in src/metro_design.js');
  assert.deepEqual(layout.unresolvedLabels,[],'station names collide');assert.deepEqual(layout.foreignStations,[],'a rail runs through a station it does not serve');assert.deepEqual(layout.railOverlaps,[],'lines overlap along a rail');
  assert.deepEqual(layout.routeOrderViolations,[],'a line runs backward in time');assert.deepEqual(layout.periodsUnplaced,[],'a period mark has no place');assert.deepEqual(layout.tightBends,[],'a lane change is not a clean 45 degree run');
  assert.ok(layout.bends<=40,'too many bends: '+layout.bends);assert.deepEqual(layout.linkThroughStations,[],'a dashed link runs through a station');assert.deepEqual(layout.linkOnRail,[],'a dashed link runs along a rail');assert.deepEqual(layout.flagsWithoutRoom,[],'a signpost has no room');
  // Pan and zoom.
  const cam0=await p.evaluate(()=>metroUI.state().camera);await p.click('#zoomIn');const cam1=await p.evaluate(()=>metroUI.state().camera);assert.ok(cam1.z>cam0.z);
  await p.mouse.move(700,600);await p.mouse.down();await p.mouse.move(790,650,{steps:5});await p.mouse.up();const cam2=await p.evaluate(()=>metroUI.state().camera);assert.ok(Math.abs(cam2.x-cam1.x)>60);
  await p.mouse.move(700,500);await p.mouse.wheel({deltaY:-300});await settle(p);assert.ok((await p.evaluate(()=>metroUI.state().camera)).z>cam2.z);
  // Year ruler: the atlas's time slices open their paragraphs.
  await p.evaluate(()=>metroUI.fitWhole());await settle(p);await p.click('#yearRuler button[data-slice="1"]');
  assert.equal(await p.$eval('#sliceText',e=>e.textContent),await p.evaluate(()=>TREE_SLICES[1][3]));await p.click('#sliceClose');assert.ok(!(await on(p,'#slicePanel')));
  // Hover: a signpost, a station name or a period mark lights its line; a shared station lights all of its lines; leaving clears it.
  const hoverOn=async sel=>{const b=await p.$eval(sel,e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2}});await p.mouse.move(b.x,b.y);return p.evaluate(()=>({on:[...document.querySelectorAll('.rail-path.on')].map(e=>e.dataset.line).sort(),muted:document.querySelectorAll('.rail-path.muted').length,dimmed:document.querySelectorAll('.metro-node.dim').length}))};
  let hover=await hoverOn('.line-flag.flag-start[data-line="china"]');assert.deepEqual(hover.on,['china']);assert.equal(hover.muted,counts.lines-1);
  const endLine=await p.$eval('.line-flag.flag-end:not(.culled)',e=>e.dataset.line);hover=await hoverOn(`.line-flag.flag-end[data-line="${endLine}"]`);assert.deepEqual(hover.on,[endLine]);
  await p.mouse.move(700,40);assert.equal(await p.$$eval('.rail-path.muted',e=>e.length),0,'leaving clears the highlight');
  await p.evaluate(()=>metroUI.focusStation('history-crusade-fourth/0'));await settle(p);
  hover=await hoverOn('.metro-node[data-key="history-crusade-fourth/0"] .node-name');assert.deepEqual(hover.on,['crusade','east']);assert.ok(hover.dimmed>0);
  hover=await hoverOn('.period-annotation[data-line="crusade"]:not(.culled):not(.mid-only)');assert.deepEqual(hover.on,['crusade']);
  await p.hover('#lineList [data-line="rome"]');assert.deepEqual(await p.$$eval('.rail-path.on',e=>e.map(x=>x.dataset.line)),['rome']);
  await p.mouse.move(700,40);
  // Clicks: a station previews; a shared station offers each of its lines; a rail or signpost boards.
  const screenOf=(x,y)=>p.evaluate((x,y)=>{const c=metroUI.state().camera,r=document.querySelector('#networkCanvas').getBoundingClientRect();return{x:r.left+c.x+x*c.z,y:r.top+c.y+y*c.z}},x,y);
  const plain=await p.evaluate(()=>{const n=[...metroUI.pointByKey.values()].find(x=>x.s.title==='大宪章与议会');metroUI.focusStation(n.s.key);return{x:n.x,y:n.y}});
  let at=await screenOf(plain.x,plain.y);await p.mouse.click(at.x,at.y);assert.equal(await p.$eval('#inspectorTitle',e=>e.textContent),'大宪章与议会');assert.ok(await on(p,'#stationInspector'));
  const plague=await p.evaluate(()=>{const n=[...metroUI.pointByKey.values()].find(x=>x.s.title==='黑死病');metroUI.inspect(n.s.key);metroUI.focusStation(n.s.key);return{key:n.s.key,lines:n.s.lines.length,links:!!n.link,nodes:document.querySelectorAll(`.metro-node[data-key="${n.s.key}"]`).length,offers:document.querySelectorAll('#inspectorLines button').length}});
  assert.equal(plague.lines,7);assert.equal(plague.nodes,1,'one station');assert.equal(plague.offers,7);assert.ok(plague.links,'far-apart rails are joined by a dashed link');
  await shot(p,'plague');
  const rail=await p.evaluate(()=>{const a=metroUI.data.lineStops.get('china'),m=metroUI.pointByKey.get(a[8].key),n=metroUI.pointByKey.get(a[9].key);metroUI.focusStation(m.s.key);document.querySelector('#stationInspector').hidden=true;return{x:(m.x+n.x)/2,y:m.y}});
  at=await screenOf(rail.x,rail.y);await p.mouse.click(at.x,at.y);await settle(p);let st=await p.evaluate(()=>metroUI.state());assert.equal(st.mode,'ride');assert.equal(st.line,'china');
  await p.evaluate(()=>metroUI.setMode('network'));await settle(p);

  /* ---------- On the train ---------- */
  await p.evaluate(()=>metroUI.board('east',{key:'history-crusade-fourth/0'}));await settle(p);await shot(p,'ride');
  assert.equal(await p.evaluate(()=>document.body.dataset.metro),'ride');assert.ok(!(await on(p,'#networkMode')));assert.ok(await on(p,'#ridePanel'));assert.ok(!(await on(p,'#sceneRail')),'the scene strip gives way to the text');
  const ride=await p.evaluate(()=>{const r=document.getElementById('reader').getBoundingClientRect(),m=document.getElementById('map').getBoundingClientRect();return{textLeftOfMap:r.right<=m.left+1,stops:document.querySelectorAll('.route-stop').length,line:metroUI.data.lineStops.get('east').length,active:document.querySelector('.route-stop.active').dataset.key,inView:(()=>{const a=document.querySelector('.route-stop.active').getBoundingClientRect(),s=document.getElementById('routeScroller').getBoundingClientRect();return a.left>=s.left&&a.right<=s.right})(),chips:[...document.querySelectorAll(`.route-transfers [data-key="${document.querySelector('.route-stop.active').dataset.key}"]`)].map(e=>e.textContent),transfer:[...document.querySelectorAll('#transferBar button')].map(b=>b.dataset.transfer),scenes:card.querySelectorAll('.scene-passage:not(.off-station)').length,count:metroUI.state().sceneCount,position:document.getElementById('scenePosition').textContent,chip:document.getElementById('mapSceneTitle').textContent,scene:activeScene(ENTRIES[cur]).title}});
  assert.ok(ride.textLeftOfMap);assert.equal(ride.stops,ride.line);assert.equal(ride.active,'history-crusade-fourth/0');assert.ok(ride.inView,'the current station is in view');assert.deepEqual(ride.chips,['十']);assert.deepEqual(ride.transfer,['crusade']);assert.equal(ride.scenes,ride.count);assert.equal(ride.position,`1 / ${ride.count} 幕`);assert.equal(ride.chip,ride.scene);
  // Scene buttons, station buttons and the line itself.
  await p.click('#nextScene');st=await p.evaluate(()=>metroUI.state());assert.equal(st.scene,1);assert.ok(await p.evaluate(()=>location.hash==='#history-crusade-fourth/1'));
  await p.click('#prevScene');assert.equal((await p.evaluate(()=>metroUI.state())).scene,0);assert.ok(await p.$eval('#prevScene',e=>e.disabled),'no scene before the first');
  // The badges above a stop change line, after asking: on the current stop in place, with the strip finding that stop on the new line; on another stop, there.
  await p.evaluate(()=>metroUI.board('eeurope',{key:'history-empire-fall-1453/0'}));await settle(p);
  const eastBadge='.route-transfers [data-switch-line="east"][data-key="history-empire-fall-1453/0"]',dialog=()=>p.$eval('#transferDialog',e=>({open:e.open,text:e.textContent,focus:document.activeElement.id}));
  await p.click(eastBadge);const asked=await dialog();assert.ok(asked.open&&asked.text.includes('是否从这里切换到东罗马线')&&asked.text.includes('君士坦丁堡陷落'),JSON.stringify(asked));assert.equal(asked.focus,'transferConfirm');
  assert.equal((await p.evaluate(()=>metroUI.state())).line,'eeurope','nothing changes before the answer');
  await p.keyboard.press('ArrowRight');assert.equal((await p.evaluate(()=>metroUI.state())).station,'history-empire-fall-1453/0','the arrows wait for the answer');
  await p.keyboard.press('Escape');assert.equal((await dialog()).open,false);const kept=await p.evaluate(()=>metroUI.state());assert.equal(kept.line,'eeurope');assert.equal(kept.mode,'ride','Esc closes the question, not the train');
  await p.click(eastBadge);await p.click('#transferDialog button[value="cancel"]');assert.equal((await p.evaluate(()=>metroUI.state())).line,'eeurope','cancel stays');
  await p.click(eastBadge);await p.mouse.click(4,4);assert.equal((await dialog()).open,false,'the backdrop cancels');assert.equal((await p.evaluate(()=>metroUI.state())).line,'eeurope');
  await p.click(eastBadge);await p.click('#transferConfirm');await new Promise(r=>setTimeout(r,60));
  let switched=await p.evaluate(()=>{const b=document.querySelector('.route-stop.active').getBoundingClientRect(),s=document.getElementById('routeScroller').getBoundingClientRect();return {...metroUI.state(),inView:b.left>=s.left&&b.right<=s.right}});
  assert.equal(switched.line,'east');assert.equal(switched.station,'history-empire-fall-1453/0');assert.ok(switched.inView,'the strip shows the stop on the new line');
  await p.evaluate(()=>metroUI.board('crusade',{key:'history-crusade-fourth/0'}));await settle(p);
  const away=await p.$eval('.route-transfers [data-switch-line]',e=>[e.dataset.switchLine,e.dataset.key]);await p.$eval(`.route-transfers [data-switch-line="${away[0]}"][data-key="${away[1]}"]`,e=>e.click());await p.click('#transferConfirm');await new Promise(r=>setTimeout(r,60));
  switched=await p.evaluate(()=>metroUI.state());assert.equal(switched.line,away[0]);assert.equal(switched.station,away[1]);
  await p.evaluate(()=>metroUI.board('crusade',{key:'history-crusade-fourth/0'}));
  const stop=await p.$eval('.route-stop.active',e=>e.nextElementSibling.dataset.key);await p.click(`.route-stop[data-key="${stop}"]`);assert.equal((await p.evaluate(()=>metroUI.state())).station,stop);
  await p.click('#prevStation');assert.equal((await p.evaluate(()=>metroUI.state())).station,'history-crusade-fourth/0');
  // Scrolling the text moves the scene and its map; a scene chosen elsewhere brings the text along, and a short one stays put.
  const card3=await p.$eval('.scene-passage[data-scene-text="3"]',e=>e.getBoundingClientRect().top);const box=await p.$eval('#readerBody',e=>{const r=e.getBoundingClientRect();return{x:r.x+r.width/2,y:r.y+r.height/2,top:r.top}});
  await p.mouse.move(box.x,box.y);await p.mouse.wheel({deltaY:card3-box.top+4});await p.waitForFunction(()=>sceneIndex===3,{timeout:4000});
  assert.equal(await p.$eval('#mapSceneTitle',e=>e.textContent),await p.evaluate(()=>activeScene(ENTRIES[cur]).title));
  await p.evaluate(()=>go('history-crusade-fourth',{scene:1}));await settle(p);await settle(p);assert.equal(await p.evaluate(()=>sceneIndex),1,'code-driven scrolling does not move the scene');
  // A deep link opens on the train, in the right place.
  const deep=await pageAt(1440,900,'#history-crusade-fourth/2');st=await deep.evaluate(()=>metroUI.state());assert.equal(st.mode,'ride');assert.equal(st.scene,2);
  assert.ok(await deep.evaluate(()=>{const t=document.querySelector('#sceneContext .passage-title').getBoundingClientRect(),b=readerBody.getBoundingClientRect();return t.top>=b.top-1&&t.top<b.bottom}));await deep.close();
  // Back to the map, on the station just read.
  await p.click('#modeToggle');await settle(p);assert.equal(await p.evaluate(()=>metroUI.state().mode),'network');assert.equal(await p.$eval('#inspectorTitle',e=>e.textContent),'第四次十字军');
  await p.click('#tHistory');assert.equal(await p.evaluate(()=>metroUI.state().mode),'network');
  await p.click('#modeToggle');await settle(p);await p.click('#tHistory');await settle(p);assert.equal(await p.evaluate(()=>metroUI.state().mode),'network','历史进程 returns to the whole map');

  /* ---------- What the old layout could do still works ---------- */
  // Person cards, their map button and family trees.
  const figureAt=await p.evaluate(()=>{const [k,people]=Object.entries(FIGURE_SCENES).find(([,v])=>v.length);go(k);return people[0].id});await settle(p);
  const person=await p.$(`.scene-passage.current [data-person="${figureAt}"] summary`);assert.ok(person,'person cards render in the current scene');await person.click();
  assert.equal(await p.$eval(`[data-person="${figureAt}"]`,e=>e.open),true);await p.click(`[data-person="${figureAt}"] .person-map`);await settle(p);assert.ok(await p.$('.leaflet-popup'),'the map button opens its place');
  const kin=await p.evaluate(()=>{for(const e of HISTORY_ENTRIES)for(const b of e.boxes||[])if(/kin-tree/.test(b.text))return e.id+'/'+b.scene;return null});
  if(kin){await p.evaluate(k=>go(k),kin);await settle(p);await p.$eval('.scene-passage.current svg.kin-tree',e=>e.dispatchEvent(new MouseEvent('click',{bubbles:true})));assert.ok(await on(p,'#kinSheet'));await p.keyboard.press('Escape');assert.ok(!(await on(p,'#kinSheet')));assert.equal(await p.evaluate(()=>metroUI.state().mode),'ride','Esc closes the sheet, not the train');}
  // Cross-references move along the lines.
  await p.evaluate(()=>{const a=[...document.querySelectorAll('#card a.xref[data-go]')][0];if(a)a.click()});await settle(p);assert.equal(await p.evaluate(()=>metroUI.state().mode),'ride');

  /* ---------- The other two modes ---------- */
  await p.click('#tGeography');await settle(p);await shot(p,'geography');
  let m=await p.evaluate(()=>({mode:metroUI.state().mode,metro:document.body.dataset.metro,viewMode,hasIndex:document.getElementById('toc').checkVisibility(),chips:document.querySelectorAll('#toc .chip').length,net:document.getElementById('networkMode').checkVisibility(),line:document.getElementById('ridePanel').checkVisibility(),toggle:document.getElementById('modeToggle').checkVisibility(),legendOK:document.getElementById('map').getBoundingClientRect().left>=document.getElementById('reader').getBoundingClientRect().right-1,size:map.getSize().x===Math.round(document.getElementById('map').getBoundingClientRect().width)}));
  assert.deepEqual(m,{mode:'off',metro:'off',viewMode:'geography',hasIndex:true,chips:33,net:false,line:false,toggle:false,legendOK:true,size:true});
  await p.click('#next');assert.equal(await p.evaluate(()=>viewMode),'geography');assert.notEqual(await p.evaluate(()=>ENTRIES[cur].id),'overview');
  await p.click('#tTopics');await settle(p);await shot(p,'topics');assert.equal(await p.evaluate(()=>viewMode),'topics');assert.ok(await on(p,'#toc'));assert.equal(await p.evaluate(()=>document.body.dataset.metro),'off');
  await p.click('#tHistory');await settle(p);m=await p.evaluate(()=>({viewMode,metro:document.body.dataset.metro,side:document.getElementById('side').checkVisibility(),size:map.getSize().x===Math.round(document.getElementById('map').getBoundingClientRect().width)}));assert.deepEqual(m,{viewMode:'history',metro:'ride',side:false,size:true});
  await p.close();

  /* ---------- Every scene lands on its own marks ---------- */
  const sweep=await pageAt(1440,900,'#history-migration');
  const landed=await sweep.evaluate(()=>{
   const out={scenes:0,noMarks:[],marksOut:[],textWrong:[],overflow:[],chipWrong:[]};
   for(const s of metroUI.data.stations)for(let i=s.from;i<=s.to;i++){
    metroUI.board(s.lines[0],{key:s.key});go(s.id,{scene:i});out.scenes++;const name=s.id+'/'+i,view=map.getBounds();
    const points=[];group.eachLayer(l=>{if(l.getLatLng)points.push(l.getLatLng())});
    if(!group.getLayers().length)out.noMarks.push(name);
    if(!points.every(q=>view.contains(q)))out.marksOut.push(name);
    if(+document.getElementById('sceneContext')?.dataset.sceneText!==i)out.textWrong.push(name);
    if(document.getElementById('mapSceneTitle').textContent!==activeScene(ENTRIES[cur]).title)out.chipWrong.push(name);
    if(document.documentElement.scrollWidth>innerWidth||readerBody.scrollWidth>readerBody.clientWidth+1)out.overflow.push(name);
   }
   return out;
  });
  assert.equal(landed.scenes,await sweep.evaluate(()=>ENTRIES.filter(isHistory).reduce((n,e)=>n+e.scenes.length,0)));
  assert.deepEqual(landed.noMarks,[],'a scene draws nothing');assert.deepEqual(landed.marksOut,[],'a scene left a mark outside the map');assert.deepEqual(landed.textWrong,[]);assert.deepEqual(landed.chipWrong,[]);assert.deepEqual(landed.overflow,[],'a scene overflows');
  await sweep.close();

  /* ---------- Other screens ---------- */
  for(const [w,h,hash,label] of [[1280,720,'#history-crusade-fourth/2','laptop'],[1024,768,'#history-empire-fall-1453','small-desktop'],[812,375,'#history-crusade-fourth','short-landscape']]){
   const q=await pageAt(w,h,hash);await shot(q,label);
   const d=await q.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth,marks:(()=>{const v=map.getBounds(),pts=[];group.eachLayer(l=>{if(l.getLatLng)pts.push(l.getLatLng())});return pts.every(p=>v.contains(p))})(),map:map.getSize().y,text:readerBody.clientHeight}));
   assert.ok(!d.overflow&&d.marks&&d.map>=150&&d.text>=120,label+JSON.stringify(d));await q.close();
  }
  const phone=await pageAt(390,844,'#history-crusade-fourth',true);await shot(phone,'phone-ride');
  const ph=await phone.evaluate(()=>{const t=document.getElementById('reader').getBoundingClientRect(),q=document.getElementById('map').getBoundingClientRect();return{overflow:document.documentElement.scrollWidth>innerWidth,stacked:t.top>=q.bottom-1,mapH:q.height,textH:readerBody.clientHeight,grip:document.getElementById('readerGrip').checkVisibility(),gh:document.getElementById('ghBanner').checkVisibility(),tabs:document.getElementById('modebar').checkVisibility()}});
  assert.ok(!ph.overflow&&ph.stacked&&ph.mapH>=150&&ph.textH>=120&&!ph.grip&&ph.gh&&ph.tabs,JSON.stringify(ph));
  await phone.click('#modeToggle');await settle(phone);await shot(phone,'phone-network');assert.equal(await phone.evaluate(()=>metroUI.state().mode),'network');
  await phone.click('#legendToggle');assert.ok(await phone.$eval('#networkLegend',e=>e.classList.contains('open')));await phone.click('#lineList [data-line="crusade"]');await settle(phone);assert.equal(await phone.evaluate(()=>metroUI.state().line),'crusade');
  await phone.close();
  const phoneGeo=await pageAt(390,844,'#overview',true);assert.ok(await phoneGeo.evaluate(()=>document.documentElement.scrollWidth<=innerWidth&&document.getElementById('mobileToc').checkVisibility()));await shot(phoneGeo,'phone-geography');await phoneGeo.close();
  // Touch: one finger pans the map, two zoom it. Chrome's touch emulation, not a physical device.
  const touch=await pageAt(390,844,'',true),cdp=await touch.createCDPSession(),finger=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map(([id,x,y])=>({id,x,y,radiusX:5,radiusY:5,force:1}))});
  const t0=await touch.evaluate(()=>metroUI.state().camera);await finger('touchStart',[[0,120,420]]);for(let i=1;i<=7;i++)await finger('touchMove',[[0,120+i*10,420+i*6]]);await finger('touchEnd',[]);
  const t1=await touch.evaluate(()=>metroUI.state().camera);assert.ok(t1.x-t0.x>=60,'one finger pans');
  await finger('touchStart',[[0,130,440],[1,230,440]]);for(let i=1;i<=7;i++)await finger('touchMove',[[0,130-i*5,440],[1,230+i*5,440]]);await finger('touchEnd',[]);
  assert.ok((await touch.evaluate(()=>metroUI.state().camera)).z>t1.z*1.4,'two fingers zoom');await touch.close();
  /* ---------- Reading: the text has the room, and scrolling never moves it by itself ---------- */
  const READ='#history-germany-charles5';
  const desk=await pageAt(1280,720,READ);
  const deskRoom=await desk.evaluate(()=>({text:readerBody.clientHeight,top:document.getElementById('reader').getBoundingClientRect().top}));
  assert.ok(deskRoom.text>=560,'desktop text height '+deskRoom.text);assert.ok(deskRoom.top<=60,'the reader rises beside the route strip');await desk.close();
  const reading=await pageAt(390,844,READ,true);
  const room=await reading.evaluate(()=>({text:readerBody.clientHeight,map:map.getSize().y}));
  assert.ok(room.text>=440&&room.text>room.map*1.5,'phone text height '+JSON.stringify(room));
  // The route strip opens on demand and closes on leaving; the map folds away and gives its room to the text.
  assert.equal(await on(reading,'.route-panel'),false);await reading.click('#stripToggle');assert.equal(await on(reading,'.route-panel'),true);await reading.click('#stripToggle');assert.equal(await on(reading,'.route-panel'),false);
  await reading.click('#mapFold');await settle(reading);assert.ok((await reading.evaluate(()=>readerBody.clientHeight))>room.text+100,'folding the map gives the text its room');await reading.click('#mapFold');await settle(reading);
  // Every scene keeps its own cards in place; a person lookup finds the current scene's.
  const cards=await reading.evaluate(()=>{const here=document.querySelector('#peopleCards');return {blocks:document.querySelectorAll('.scene-people').length,marked:document.querySelectorAll('#peopleCards').length,inScene:here?.closest('.scene-passage')?.dataset.sceneText,scene:sceneIndex,outside:document.querySelectorAll('.scene-people:not(#peopleCards) [data-person]').length}});
  assert.equal(cards.marked,1);assert.equal(+cards.inScene,cards.scene);assert.ok(cards.blocks>1);assert.equal(cards.outside,0);
  // A reader's scroll, down and back up: the scene follows, and no visible paragraph moves further than the scroll asked.
  for(const [dir,name] of [[1,'down'],[-1,'up']]){
   const r=await reading.evaluate(async dir=>{
    const body=readerBody,frame=()=>new Promise(r=>requestAnimationFrame(r)),visible=()=>{const b=body.getBoundingClientRect();return [...body.querySelectorAll('.scene-passage:not(.off-station)>p')].filter(e=>{const r=e.getBoundingClientRect();return r.bottom>b.top&&r.top<b.bottom}).map(e=>[e,e.getBoundingClientRect().top])};
    if(dir>0)body.scrollTop=0;else body.scrollTop=body.scrollHeight;await frame();
    let worst=0,changes=0,scene=sceneIndex;
    const check=(seen,asked)=>{for(const [e,top] of seen)if(e.isConnected)worst=Math.max(worst,Math.abs(e.getBoundingClientRect().top-top+asked))};
    for(let i=0;i<400;i++){
     const seen=visible(),before=body.scrollTop;
     body.dispatchEvent(new Event('touchmove',{bubbles:true}));body.scrollTop=before+dir*48;const asked=body.scrollTop-before;
     await frame();await frame();check(seen,asked);
     if(i%10===9){const held=visible();await new Promise(r=>setTimeout(r,260));check(held,0)}  // long enough for the map to catch up
     if(sceneIndex!==scene){changes++;scene=sceneIndex}
     if(dir>0?body.scrollTop+body.clientHeight>=body.scrollHeight-1:body.scrollTop<=0)break;
    }
    return {worst:Math.round(worst),changes};
   },dir);
   assert.ok(r.changes>=2,name+': the scene follows the text '+JSON.stringify(r));assert.ok(r.worst<=3,name+': the text stays put '+JSON.stringify(r));
  }
  await reading.close();
  // Going to a short scene stays there, even just after touching the text: that scroll is the page's own, not the reader's.
  const tall=await pageAt(1440,1600,READ);
  const short=await tall.evaluate(async()=>{
   const line=readerBody.clientHeight*.3,rows=[...document.querySelectorAll('.scene-passage:not(.off-station)')];
   const k=rows.findIndex((p,i)=>i>0&&i<rows.length-1&&p.getBoundingClientRect().height<line);if(k<0)return null;
   const want=+rows[k].dataset.sceneText;readerBody.dispatchEvent(new PointerEvent('pointerdown',{bubbles:true}));go(ENTRIES[cur].id,{scene:want});
   const moved=readerBody.scrollTop;await new Promise(r=>setTimeout(r,400));
   return {want,moved,now:sceneIndex};
  });
  assert.ok(short&&short.moved>0,'a short scene to test with '+JSON.stringify(short));assert.equal(short.now,short.want,'stays on the scene it went to');await tall.close();
  assert.deepEqual(errors,[]);
  console.log(`PASS: metro layout — site identity kept; ${counts.stations} stations, ${counts.lines} lines, ${counts.shared} shared on the whole map with clean rails and names; hover, pan, zoom, time slices; on-train view, scene and station navigation, text scrolling, deep links; person cards and family trees; geography and topics; all ${landed.scenes} scenes land on their own marks; laptop, phone, touch emulation; offline; no page errors.`);
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})().catch(e=>{console.error(e);process.exitCode=1;});
