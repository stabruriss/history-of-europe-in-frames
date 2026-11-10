/* The historical metro: a network map of the main lines, and an on-train view for reading along one.
   It sits on top of atlas_ui.js, which still owns navigation (go), the text, the map drawing, figures and family trees,
   and takes over from that file's sidebar tree for 历史进程. Stations are read live from the atlas's own tree rows,
   so new sections appear here without touching this file; where a line runs is drawn in metro_design.js. */
(() => {
'use strict';
const NS='http://www.w3.org/2000/svg';
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const narrowScreen=()=>matchMedia('(max-width:820px)').matches;

/* ---------- Data, live from the atlas ---------- */
const branches=HISTORY_BRANCHES.map(b=>({...b,c:lineColor(b)}));
const branchById=new Map(branches.map(b=>[b.id,b]));
const stations=historyTreeRows().filter(r=>r.kind==='item').map((r,i)=>({key:r.key,id:r.id,from:r.from,to:r.to,t:r.t,end:r.end,lines:r.lines,title:r.label,period:r.period,sourceOrder:i,count:r.to-r.from+1}));
const stationByKey=new Map(stations.map(s=>[s.key,s]));
const firstYear=id=>Math.min(...stations.filter(s=>s.lines.includes(id)).map(s=>s.t));
const lines=[...branches].sort((a,b)=>firstYear(a.id)-firstYear(b.id));
const lineStops=new Map(lines.map(l=>[l.id,stations.filter(s=>s.lines.includes(l.id)).sort((a,b)=>a.t-b.t||a.sourceOrder-b.sourceOrder)]));
const color=id=>branchById.get(id)?.c||'#26738a';
const lineName=id=>branchById.get(id)?.name||id;
const lineCode=id=>String(HISTORY_BRANCHES.findIndex(b=>b.id===id)+1).padStart(2,'0');
const LINE_MARK={prehistory:'史',trunk:'希',rome:'罗',east:'东',west:'西欧',spain:'西',france:'法',lowlands:'低',germany:'德',italy:'意',britain:'不',faith:'基',egypt:'埃',persia:'波',eeurope:'欧',crusade:'十',china:'中',nordic:'北',america:'美'};
const periodFor=(id,t)=>{const a=ROUTE_PERIODS[id]||[];return a.find(([s,e])=>t>=s&&t<e)?.[2]||a.findLast(([s])=>t>=s)?.[2]||a[0]?.[2]||''};
const SLICES=typeof TREE_SLICES==='undefined'?[]:TREE_SLICES;

// The line being ridden counts only its own stops; the atlas's treeLine also runs back through its ancestors.
let mode='network',station=null,selectedKey=stations[0].key,rideLine=treeLine;
const network=$('#networkCanvas'),viewport=$('#viewport'),yearRuler=$('#yearRuler');
let camera={x:0,y:0,z:.84},NET=null,pointByKey=new Map();
const createSVG=(name,attrs,parent)=>{const e=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs||{}))e.setAttribute(k,v);parent?.appendChild(e);return e};
const textSVG=(parent,content,attrs)=>{const e=createSVG('text',attrs,parent);e.textContent=content;return e};

/* ---------- Network map ---------- */
const round2=n=>Math.round(n*100)/100;
function roundedPath(points){
 if(points.length<2)return'';let d=`M ${round2(points[0].x)} ${round2(points[0].y)}`;
 for(let i=1;i<points.length-1;i++){
  const a=points[i-1],b=points[i],c=points[i+1],ab=Math.hypot(b.x-a.x,b.y-a.y),bc=Math.hypot(c.x-b.x,c.y-b.y),r=Math.min(13,ab/2,bc/2);
  const p={x:b.x-(b.x-a.x)/ab*r,y:b.y-(b.y-a.y)/ab*r},q={x:b.x+(c.x-b.x)/bc*r,y:b.y+(c.y-b.y)/bc*r};
  d+=` L ${round2(p.x)} ${round2(p.y)} Q ${round2(b.x)} ${round2(b.y)} ${round2(q.x)} ${round2(q.y)}`;
 }
 const p=points[points.length-1];return d+` L ${round2(p.x)} ${round2(p.y)}`;
}
const labelScale=z=>z>=.8?1:Math.min(1.75,.8/z);
// The ruler's marks: the atlas's time slices, each opening its paragraph, plus a few years for orientation.
function renderZones(){
 const zones=$('#zones'),w=NET.world,top=w.minY-900,h=w.maxY-w.minY+1800;
 const marks=[...SLICES.map((s,i)=>({t:s[0],name:s[1],slice:i})),...[[-3000,'前3000'],[1200,'1200'],[1400,'1400']].map(([t,name])=>({t,name}))].sort((a,b)=>a.t-b.t);
 const edges=[w.minX-1500,...marks.map(m=>NET.X(m.t)),w.maxX+1500];
 for(let i=0;i<edges.length-1;i++)if(i%2)createSVG('rect',{x:edges[i],y:top,width:edges[i+1]-edges[i],height:h,class:'year-zone'},zones);
 for(const m of marks)if(m.slice!==undefined)createSVG('line',{x1:NET.X(m.t),x2:NET.X(m.t),y1:top,y2:top+h,class:'slice-line'},zones);
 yearRuler.innerHTML=marks.map(m=>m.slice!==undefined?`<button type="button" data-x="${NET.X(m.t)}" data-slice="${m.slice}" title="${esc(SLICES[m.slice][2])}">${esc(m.name)} ▸</button>`:`<span data-x="${NET.X(m.t)}">${esc(m.name)}</span>`).join('');
 yearRuler.querySelectorAll('button').forEach(b=>b.onclick=()=>showSlice(+b.dataset.slice));
}
function showSlice(i){
 const [,label,head,text]=SLICES[i];
 $('#sliceTitle').textContent=`${label} · ${head}`;$('#sliceText').textContent=text;$('#slicePanel').hidden=false;
}
function renderNetwork(){
 NET=window.buildNetworkLayout({stations,lines,lineStops,design:window.NETWORK_DESIGN,periods:window.ROUTE_PERIODS,ends:TREE_ENDS});
 pointByKey=NET.nodes;
 renderZones();
 const paths=$('#networkLines'),nodes=$('#networkNodes'),periods=$('#periodLabels'),ticks=$('#periodTicks'),flags=$('#lineFlags'),hubs=$('#hubNames');
 for(const l of lines){
  const pts=NET.routes.get(l.id);if(!pts?.length)continue;
  const d=roundedPath(pts);
  createSVG('path',{d,class:'rail-casing'},paths);
  createSVG('path',{d,class:'rail-path',style:`--c:${l.c}`,'data-line':l.id},paths);
  const hit=createSVG('path',{d,class:'rail-hit','data-line':l.id,'aria-label':`乘坐${l.name}线`},paths);
  hit.addEventListener('click',e=>{e.stopPropagation();if(!skipGraphClick)board(l.id)});
 }
 for(const t of NET.ticks)createSVG('line',{x1:t.x,x2:t.x,y1:t.y-8,y2:t.y+8,class:'period-tick','data-line':t.line,style:`--c:${color(t.line)}`},ticks);
 for(const p of NET.periodMarks)if(p.placed)textSVG(periods,p.name,{x:p.x,y:p.y,'text-anchor':'middle',class:'period-annotation'+(p.strict?'':' mid-only'),style:`--c:${color(p.line)}`,'data-line':p.line});
 for(const n of NET.notes){const t=textSVG(periods,n.name,{x:n.x,y:n.y,class:'junction-note','data-line':n.line,style:`--c:${color(n.line)}`});if(n.note)createSVG('title',{},t).textContent=n.note}
 for(const f of NET.flags){
  // Signposts: the start flag points right at the line's first stop, the end flag left at its last.
  const g=createSVG('g',{class:`line-flag flag-${f.end}`+(f.free?'':' no-room'),'data-line':f.line,role:'button','aria-label':`${f.name}线${f.end==='start'?'起点':'终点'}，点击上车`,transform:`translate(${f.tipX} ${f.tipY})`},flags),inner=createSVG('g',{class:'flag-scale'},g);
  const dir=f.end==='start'?-1:1,half=f.h/2,point=8;
  createSVG('path',{d:`M0 0 L${dir*point} ${-half} L${dir*f.w} ${-half} L${dir*f.w} ${half} L${dir*point} ${half} Z`,fill:f.c,class:'flag-shape'},inner);
  textSVG(inner,f.name,{x:dir*(f.w+point)/2,y:4,'text-anchor':'middle'});
  g.addEventListener('click',e=>{e.stopPropagation();if(!skipGraphClick)board(f.line)});
 }
 for(const n of pointByKey.values()){
  const s=n.s,transfer=s.lines.length>1,g=createSVG('g',{class:'metro-node'+(transfer?' transfer':'')+(s.lines.length>2?' hub':''),'data-key':s.key,'data-lines':s.lines.join(' '),role:'button',tabindex:s.key===selectedKey?'0':'-1','aria-label':`${s.title}，${s.period}，${s.count}幕${transfer?'，换乘'+s.lines.map(lineName).join('、'):''}`,style:`--c:${color(s.lines[0])}`},nodes);
  createSVG('title',{},g).textContent=`${s.title} · ${s.period}\n${s.lines.map(lineName).join(' / ')} · ${s.count}幕`;
  if(n.link){createSVG('rect',{x:n.x-6,y:n.link.y0,width:12,height:n.link.y1-n.link.y0,fill:'transparent',class:'station-hit'},g);createSVG('line',{x1:n.x,x2:n.x,y1:n.link.y0,y2:n.link.y1,class:'transfer-link'},g)}
  for(const c of n.clusters){
   createSVG('rect',{x:n.x-15,y:c.y0-15,width:30,height:c.y1-c.y0+30,fill:'transparent',class:'station-hit'},g);
   if(transfer)createSVG('rect',{x:n.x-c.r,y:c.y0-c.r,width:c.r*2,height:c.y1-c.y0+c.r*2,rx:c.r,class:'station-circle'},g);
   else createSVG('circle',{cx:n.x,cy:c.y0,r:c.r,class:'station-circle'},g);
  }
  const L_=n.label;
  if(L_.far){const above=L_.side==='above';createSVG('line',{x1:n.x,x2:n.x,y1:L_.leaderFrom,y2:above?L_.box.y1+1:L_.box.y0-1,class:'label-leader'},g)}
  textSVG(g,s.title,{x:L_.x,y:L_.y,'text-anchor':L_.anchor,class:'node-name'});
  if(L_.withDate)textSVG(g,s.period,{x:L_.x,y:L_.y+12.5,'text-anchor':L_.anchor,class:'node-date'});
  g.addEventListener('click',e=>{e.stopPropagation();if(!skipGraphClick)inspect(s.key)});
  g.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();inspect(s.key)}});
  if(s.lines.length>2){const h=createSVG('g',{class:'hub-name','data-lines':s.lines.join(' '),transform:`translate(${n.x} ${n.y0})`},hubs),i=createSVG('g',{class:'flag-scale'},h);textSVG(i,s.title,{x:0,y:-11,'text-anchor':'middle'});h.addEventListener('click',e=>{e.stopPropagation();if(!skipGraphClick)inspect(s.key)})}
 }
 buildDeclutter();
 $('#lineList').innerHTML=lines.map(l=>`<button class="line-choice" data-line="${l.id}" style="--c:${l.c}" title="乘坐${esc(l.name)}线"><i class="line-swatch"></i><span>${esc(l.name)}</span><span class="line-count">${lineStops.get(l.id).length}</span></button>`).join('');
 $$('#lineList button').forEach(b=>{b.onclick=()=>board(b.dataset.line);b.onmouseenter=()=>highlightLine(b.dataset.line);b.onmouseleave=()=>highlightLine(null)});
 markNetwork();
}
// Below full zoom, names are drawn larger than their world size, so keep only those that fit on screen.
let declutterItems=[],declutterZ=0;
function declutter(){
 const z=camera.z,level=network.dataset.lod,taken=[];
 const free=b=>!taken.some(o=>b.x0<o.x1&&b.x1>o.x0&&b.y0<o.y1&&b.y1>o.y0);
 for(const it of declutterItems){
  if(!it.levels.includes(level)){it.el.classList.remove('culled');continue}
  const scale=it.scale(z),w=it.w*scale,h=it.h*scale,cx=it.x*z,cy=it.y*z;
  const b=it.anchor==='tipStart'?{x0:cx-w,x1:cx,y0:cy-h/2,y1:cy+h/2}:it.anchor==='tipEnd'?{x0:cx,x1:cx+w,y0:cy-h/2,y1:cy+h/2}:it.anchor==='start'?{x0:cx,x1:cx+w,y0:cy-h,y1:cy+h*.3}:{x0:cx-w/2,x1:cx+w/2,y0:cy-h,y1:cy+h*.3};
  const ok=free(b);it.el.classList.toggle('culled',!ok);if(ok)taken.push(b);
 }
}
function buildDeclutter(){
 const constant=z=>Math.max(1,z),flagSize=z=>z<.36?.8:Math.max(1,z),world=z=>labelScale(z)*z,items=[];
 const flagEls=$$('.line-flag');
 NET.flags.forEach((f,i)=>items.push({el:flagEls[i],x:f.tipX,y:f.tipY,w:f.w+4,h:f.h+2,anchor:f.end==='start'?'tipStart':'tipEnd',levels:['1','2'],scale:flagSize,rank:f.end==='start'?1:2}));
 const biggest=[...pointByKey.values()].filter(n=>n.s.lines.length>2).sort((a,b)=>b.s.lines.length-a.s.lines.length);
 // A hub where a line starts gives way to that line's signpost (城市与早期王权, the first station of 希腊, 埃及 and 中东).
 const starts=new Set(lines.map(l=>lineStops.get(l.id)[0]?.key));
 for(const el of $$('.hub-name')){const n=biggest.find(p=>p.s.title===el.textContent);items.push({el,x:n.x,y:n.y0,w:n.s.title.length*12+8,h:17,anchor:'middle',levels:['1'],scale:constant,rank:n.s.lines.length>=4&&!starts.has(n.s.key)?0:3})}
 for(const g of $$('.metro-node.transfer')){const n=pointByKey.get(g.dataset.key),el=g.querySelector('.node-name');items.push({el,x:n.label.x,y:n.label.y,w:n.s.title.length*12.5+4,h:15,anchor:n.label.anchor==='start'?'start':'middle',levels:['2'],scale:world,rank:n.s.lines.length>2?0:3})}
 for(const el of $$('.period-annotation'))items.push({el,x:+el.getAttribute('x'),y:+el.getAttribute('y'),w:el.textContent.length*10.5+6,h:13,anchor:'middle',levels:['2'],scale:world,rank:4});
 declutterItems=items.sort((a,b)=>a.rank-b.rank);
}
// Hovering any label highlights its line, or all the lines of an interchange.
let highlightKey=null;
function highlightLine(ids){
 const set=ids?new Set([].concat(ids)):null,key=set?[...set].sort().join(' '):'@'+rideLine;
 if(key===highlightKey)return;highlightKey=key;
 $$('.rail-path').forEach(p=>{p.classList.toggle('muted',Boolean(set&&!set.has(p.dataset.line)));p.classList.toggle('on',set?set.has(p.dataset.line):p.dataset.line===rideLine)});
 const touches=el=>(el.dataset.lines||el.dataset.line||'').split(' ').some(l=>set.has(l));
 $$('.metro-node,.line-flag,.period-annotation,.period-tick,.junction-note,.hub-name').forEach(el=>el.classList.toggle('dim',Boolean(set)&&!touches(el)));
}
$('#networkSvg').addEventListener('mouseover',e=>{const t=e.target.closest('[data-lines],[data-line]');highlightLine(t?(t.dataset.lines||t.dataset.line).split(' '):null)});
$('#networkSvg').addEventListener('mouseleave',()=>highlightLine(null));
function markNetwork(){
 $$('.metro-node').forEach(g=>{const on=g.dataset.key===selectedKey;g.classList.toggle('selected',on);g.setAttribute('tabindex',on?'0':'-1');g.querySelectorAll('.current-halo').forEach(h=>h.remove());if(on){const n=pointByKey.get(selectedKey);for(const c of n.clusters){const r=c.r+7;createSVG('rect',{x:n.x-r,y:c.y0-r,width:r*2,height:c.y1-c.y0+r*2,rx:r,class:'current-halo'},g)}}});
 $$('.line-choice').forEach(b=>b.classList.toggle('on',b.dataset.line===rideLine));highlightLine(null);
}
const futureOf=id=>TREE_FUTURE.find(f=>f[0]===id);
function inspect(key){
 selectedKey=key;const s=stationByKey.get(key),entry=HISTORY_ENTRIES.find(e=>e.id===s.id);
 $('#stationInspector').hidden=false;
 $('#inspectorKicker').textContent=s.lines.length>1?`贯通事件 · ${s.lines.length}线换乘`:`事件站 · ${lineName(s.lines[0])}线`;
 $('#inspectorTitle').textContent=s.title;$('#inspectorPeriod').textContent=`${s.period} · ${s.count}幕`;
 $('#inspectorSummary').textContent=entry.scenes[s.from]?.title||entry.title;
 $('#inspectorLines').innerHTML=s.lines.map(id=>`<button class="board-line" data-line="${id}" style="--c:${color(id)}"><i></i>乘坐${esc(lineName(id))}线<span>→</span></button>`).join('');
 $$('#inspectorLines button').forEach(b=>b.onclick=()=>board(b.dataset.line,{key}));
 $('#inspectorHint').hidden=s.lines.length<2;
 const future=s.lines.map(futureOf).find((f,i)=>f&&lineStops.get(s.lines[i]).at(-1).key===key);
 $('#inspectorFuture').hidden=!future;$('#inspectorFuture').textContent=future?`待展开：${future[2]} · ${future[3]}`:'';
 updateModeToggle();markNetwork();
}
function applyCamera(){
 viewport.setAttribute('transform',`translate(${camera.x} ${camera.y}) scale(${camera.z})`);
 $('#zoomLevel').textContent=Math.round(camera.z*100)+'%';
 const z=camera.z,level=z<.36?1:z<.8?2:3;
 network.dataset.lod=level;network.classList.toggle('show-dates',z>=1.15);
 network.style.setProperty('--inv',(1/Math.min(1,Math.max(z,.16))).toFixed(3));
 network.style.setProperty('--label-scale',labelScale(z).toFixed(3));
 network.style.setProperty('--flag-k',z<.36?.8:1);
 network.style.setProperty('--rail-w',Math.max(5,2.7/z).toFixed(2));
 network.style.setProperty('--link-w',Math.max(1.6,1/z).toFixed(2));
 const w=network.clientWidth;let lastYearX=-999;
 for(const mark of yearRuler.children){const x=camera.x+(+mark.dataset.x)*z;mark.style.transform=`translateX(${x.toFixed(1)}px)`;mark.hidden=x<0||x>w||x-lastYearX<58;if(!mark.hidden)lastYearX=x}
 if(Math.abs(z-declutterZ)>.001){declutterZ=z;declutter()}
}
function zoomAt(factor,x=network.clientWidth/2,y=network.clientHeight/2){const z=clamp(camera.z*factor,.12,2.3),ratio=z/camera.z;camera.x=x-(x-camera.x)*ratio;camera.y=y-(y-camera.y)*ratio;camera.z=z;applyCamera()}
function focusBox(minX,maxX,minY,maxY,maxZ=1.05){
 const w=network.clientWidth,h=network.clientHeight,z=clamp(Math.min((w-60)/(maxX-minX),(h-70)/(maxY-minY)),.12,maxZ);
 camera={x:(w-(maxX-minX)*z)/2-minX*z,y:(h-(maxY-minY)*z)/2-minY*z,z};applyCamera();
}
function focusKeys(keys){
 const p=keys.map(k=>pointByKey.get(k)).filter(Boolean);if(!p.length)return;
 focusBox(Math.min(...p.map(n=>n.x))-130,Math.max(...p.map(n=>n.x))+170,Math.min(...p.map(n=>n.y0))-85,Math.max(...p.map(n=>n.y1))+75,1);
}
function fitWhole(){const w=NET.world;focusBox(w.minX-90,w.maxX+90,w.minY-30,w.maxY+30)}
function focusStation(key=selectedKey){const n=pointByKey.get(key);if(!n)return;const small=narrowScreen(),z=small?.83:.95;camera={z,x:network.clientWidth*(small?.5:.44)-n.x*z,y:network.clientHeight*(small?.38:.45)-n.y*z};applyCamera()}
function updateModeToggle(){
 const s=stationByKey.get(selectedKey);
 $('#modeToggle').textContent=mode==='ride'?'展开地铁全图 ↗':`乘坐${lineName(s.lines.includes(rideLine)?rideLine:s.lines[0])}线 →`;
}
function setMode(next,{whole=false}={}){
 mode=next;document.body.dataset.metro=next;$('#networkLegend').classList.remove('open');$('#slicePanel').hidden=true;
 if(next==='network'){
  if(station)selectedKey=station.key;
  if(whole)$('#stationInspector').hidden=true;else inspect(selectedKey);
  updateModeToggle();
  requestAnimationFrame(()=>whole?fitWhole():focusStation(selectedKey));
 }else{
  updateModeToggle();
  requestAnimationFrame(()=>{centerRoute();map.invalidateSize({animate:false,pan:false})});
 }
}
const nearestOnLine=(id,key)=>{const s=stationByKey.get(key)||station,seq=lineStops.get(id);return seq.find(x=>x.key===s.key)||[...seq].sort((a,b)=>Math.abs(a.t-s.t)-Math.abs(b.t-s.t))[0]};
// Boarding at a shared station keeps both the event and the scene; boarding elsewhere starts that station.
function board(id,{key=selectedKey}={}){
 const next=nearestOnLine(id,key);if(!next)return;
 rideLine=id;treeLine=id;
 // Same station: nothing else moves, so the route strip has to find the stop on the new line itself.
 if(next.key===station?.key){renderRide();updateSceneUI();routeAt=id;requestAnimationFrame(centerRoute);}
 else go(next.id,{scene:next.from});
 setMode('ride');
}
function goStation(key){const s=stationByKey.get(key);if(s)go(s.id,{scene:s.from})}
function stepStation(delta){const seq=lineStops.get(rideLine),next=seq[seq.findIndex(s=>s.key===station.key)+delta];if(next)goStation(next.key)}
function stepScene(delta){const next=sceneIndex+delta;if(station&&next>=station.from&&next<=station.to)go(station.id,{scene:next})}

/* ---------- Changing line asks first ---------- */
const transferDialog=document.createElement('dialog');transferDialog.id='transferDialog';
transferDialog.innerHTML='<form method="dialog"><p id="transferQuestion"></p><small id="transferNote"></small><div class="transfer-actions"><button value="cancel">取消</button><button id="transferConfirm" value="ok"></button></div></form>';
document.body.append(transferDialog);
let transferTo=null;
$('#transferConfirm').onclick=ev=>{ev.preventDefault();const to=transferTo;transferDialog.close();if(to)board(to.id,{key:to.key})};
transferDialog.addEventListener('click',ev=>{if(ev.target===transferDialog)transferDialog.close()});  // the backdrop
function askTransfer(id,key){
 const s=stationByKey.get(key),name=lineName(id);transferTo={id,key};
 $('#transferQuestion').textContent=`是否从这里切换到${name}线？`;
 $('#transferNote').textContent=key===station?.key?`还在“${s.title}”这一幕，之后沿${name}线往前走。`:`会跳到“${s.title}”，之后沿${name}线往前走。`;
 $('#transferConfirm').textContent=`切换到${name}线`;transferDialog.style.setProperty('--c',color(id));
 transferDialog.showModal();$('#transferConfirm').focus();
}

/* ---------- On-train line diagram ---------- */
let routeSkipClick=false;
function renderRide(){
 document.body.classList.remove('strip-open');$('#stripToggle').setAttribute('aria-expanded','false');$('#stripToggle i').textContent='▾';
 const seq=lineStops.get(rideLine),idx=seq.findIndex(s=>s.key===station.key),narrow=narrowScreen();
 document.documentElement.style.setProperty('--line',color(rideLine));
 $('#ridingLine').innerHTML=`<span class="line-number">${lineCode(rideLine)}</span>${esc(lineName(rideLine))}<small>主线 · ${seq.length}站</small>`;
 $('#stationPosition').textContent=`${idx+1} / ${seq.length}`;$('#prevStation').disabled=idx<=0;$('#nextStation').disabled=idx>=seq.length-1;
 $('#routePeriod').textContent=periodFor(rideLine,station.t);
 const future=futureOf(rideLine),step=narrow?128:150,offset=narrow?72:88,span=(seq.length-1)*step,width=Math.max($('#routeScroller').clientWidth,offset*2+span+(future?step:0));
 const track=$('#routeTrack');track.style.width=width+'px';
 track.innerHTML=`<i class="route-rail" style="left:${offset}px;width:${span}px"></i><i class="route-rail past" style="left:${offset}px;width:${Math.max(0,idx*step)}px"></i>`;
 // Section marks group contiguous stations; the name stays in view while its section does.
 const groups=[];seq.forEach((s,i)=>{const title=periodFor(rideLine,s.t),last=groups.at(-1);if(last?.title===title)last.end=i;else groups.push({title,start:i,end:i})});
 for(const g of groups){const left=offset+(g.start-.47)*step,w=(g.end-g.start+.94)*step;track.insertAdjacentHTML('beforeend',`<div class="route-period-band" title="${esc(g.title)} · 路段标记，章节可能跨越多个时段" style="left:${left}px;width:${w}px"><span>${esc(g.title)}</span></div>`)}
 seq.forEach((s,i)=>{
  const others=s.lines.filter(id=>id!==rideLine),b=document.createElement('button');b.className='route-stop'+(others.length?' shared':'')+(s.key===station.key?' active':'')+(i<idx?' past':'');b.style.left=offset+i*step+'px';b.dataset.key=s.key;b.title=`${s.title} · ${s.period} · ${s.count}幕${others.length?'；可换乘'+others.map(lineName).join('、'):''}`;b.setAttribute('aria-label',b.title);b.setAttribute('aria-current',s.key===station.key?'step':'false');
  b.innerHTML=`<i class="dot"></i><span class="stop-text"><span class="stop-name">${esc(s.title)}</span><span class="stop-date">${esc(s.period)}</span></span>`;
  b.onclick=()=>{if(!routeSkipClick)goStation(s.key)};track.appendChild(b);
 });
 // The badges above a stop change line there. They sit beside the stop buttons, after all of them: a button cannot hold buttons.
 seq.forEach((s,i)=>{
  const others=s.lines.filter(id=>id!==rideLine);if(!others.length)return;
  const row=document.createElement('div');row.className='route-transfers';row.style.left=offset+i*step+'px';
  for(const id of others){
   const t=document.createElement('button');t.type='button';t.dataset.switchLine=id;t.dataset.key=s.key;t.style.setProperty('--c',color(id));t.textContent=LINE_MARK[id]||lineName(id)[0];
   t.title=`在“${s.title}”换乘${lineName(id)}线`;t.setAttribute('aria-label',t.title);t.onclick=()=>{if(!routeSkipClick)askTransfer(id,s.key)};row.appendChild(t);
  }
  track.appendChild(row);
 });
 if(future)track.insertAdjacentHTML('beforeend',`<i class="route-rail upcoming" style="left:${offset+span}px;width:${step}px"></i><div class="route-future" title="${esc(future[3])}" style="left:${offset+span+step}px"><i class="dot"></i><span class="stop-text"><span class="stop-name">${esc(future[2])}</span><span class="stop-date">待展开</span></span></div>`);
 const transfers=station.lines.filter(id=>id!==rideLine);$('#transferBar').innerHTML=transfers.length?'<span>⇄ 本站可换乘</span>'+transfers.map(id=>`<button data-transfer="${id}" style="--c:${color(id)}"><i></i>${esc(lineName(id))}</button>`).join(''):'';
 $$('#transferBar button').forEach(b=>b.onclick=()=>askTransfer(b.dataset.transfer,station.key));
}
let routeAt=null;
function centerRoute(){const s=$('#routeScroller'),b=$('.route-stop.active');if(b)s.scrollLeft=b.offsetLeft-s.clientWidth/2}
// Scrolling moves this at once; the map follows when the scrolling pauses.
function showSceneName(i){
 const data=ENTRIES[cur].scenes[i];if(!data||!station)return;
 $('#scenePosition').textContent=`${i-station.from+1} / ${station.count} 幕`;
 $('#sceneHeading').textContent=data.title;
 $('#prevScene').disabled=i<=station.from;$('#nextScene').disabled=i>=station.to;
}
function updateSceneUI(){
 const data=ENTRIES[cur].scenes[sceneIndex];if(!data||!station)return;
 showSceneName(sceneIndex);$('#stripToggle span').textContent=station.title;
 $('#mapSceneDate').textContent=data.date;$('#mapSceneTitle').textContent=data.title;
}

/* ---------- Hooks on the atlas's own navigation ---------- */
// Landing on a scene frames its marks: the authored view clipped to what the scene draws, widened to take in every place and route.
const focusedScenes=new WeakSet();
function focusScene(e,scene){
 if(focusedScenes.has(scene))return;focusedScenes.add(scene);
 const liveGroup=group,livePins=pinIndex;group=L.featureGroup();pinIndex={};
 const points=[];let drawn=null;
 try{
  scene.draw(makeCtx(e));
  group.eachLayer(l=>{if(l.getLatLng)points.push(l.getLatLng());else if(l.getLatLngs&&!l.eachLayer)points.push(...l.getLatLngs().flat(3))});
  drawn=group.getBounds();
 }catch{drawn=null}finally{group=liveGroup;pinIndex=livePins}
 const view=L.latLngBounds(scene.view||e.view);
 if(!drawn?.isValid()||!view.intersects(drawn))return;
 const focus=L.latLngBounds([Math.max(view.getSouth(),drawn.getSouth()),Math.max(view.getWest(),drawn.getWest())],[Math.min(view.getNorth(),drawn.getNorth()),Math.min(view.getEast(),drawn.getEast())]);
 if(points.length)focus.extend(L.latLngBounds(points));
 const c=focus.getCenter(),lat=Math.max(2.2,focus.getNorth()-focus.getSouth())/2,lon=Math.max(3,focus.getEast()-focus.getWest())/2;
 scene.view=[[c.lat-lat,c.lng-lon],[c.lat+lat,c.lng+lon]];
}
const targetOf=(id,opts)=>{
 const [ref,part]=typeof id==='string'&&id.includes('/')?id.split('/'):[id,opts.scene];
 const e=typeof ref==='number'?ENTRIES[ref]:ENTRIES.find(x=>x.id===ref),i=Number(part);
 return e&&isHistory(e)?[e,e.scenes[Number.isInteger(i)?i:0]||e.scenes[0]]:null;
};
function afterNavigation(){
 const e=ENTRIES[cur];
 if(!isHistory(e)){document.body.dataset.metro='off';mode='off';return}
 const current=currentStation();if(!current)return;
 const before=station?.key;station=stationByKey.get(current.key);selectedKey=station.key;
 // A cross-reference may have just chosen a line for the atlas; otherwise stay on this one if the station is on it.
 if(station.lines.includes(treeLine))rideLine=treeLine;else if(!station.lines.includes(rideLine))rideLine=station.lines[0];
 renderRide();updateSceneUI();markNetwork();
 if(mode!=='ride')setMode('ride');else if(before!==station.key||routeAt!==rideLine)requestAnimationFrame(centerRoute);
 routeAt=rideLine;
}
const atlasGo=go;
go=function(id,opts={}){
 const target=targetOf(id,opts);if(target)focusScene(...target);
 if(!readerFollows){clearTimeout(sceneTimer);cancelAnimationFrame(scrollFrame);scrollFrame=0;wantedScene=null;readerScrolledUntil=0}
 atlasGo(id,opts);afterNavigation();
};
// Only this station's scenes are on the page; the rest of the section belongs to other stops.
const atlasRenderScenes=renderScenes;
renderScenes=e=>{
 atlasRenderScenes(e);
 const s=isHistory(e)?currentStation():null;
 card.querySelectorAll('.scene-passage').forEach(p=>{const i=+p.dataset.sceneText;p.classList.toggle('off-station',Boolean(s)&&(i<s.from||i>s.to))});
};
// Reading on down the text moves to the next scene and its map; a scene chosen elsewhere brings the text along.
// Only the reader's own scrolling counts: a short scene jumped to by code must not read as having scrolled past it.
let readerFollows=false,readerScrolledUntil=0,scrollFrame=0,sceneTimer=0,wantedScene=null;
const atlasScrollSceneText=scrollSceneText;
scrollSceneText=animate=>{
 if(readerFollows)return;
 atlasScrollSceneText(isHistory(ENTRIES[cur])?false:animate);
 // The first scene opens on the section title too, unless the title would fill a short reader.
 const first=card.querySelector('.scene-passage:not(.off-station)');
 if(first?.classList.contains('current')&&first.getBoundingClientRect().top-readerBody.getBoundingClientRect().top+readerBody.scrollTop<readerBody.clientHeight*.5)readerBody.scrollTo({top:0,behavior:'instant'});
};
// Each scene keeps its own cards in place, so changing scene changes no heights. #peopleCards marks the current scene's block.
const atlasRenderFigures=renderFigures;
renderFigures=e=>{
 if(!isHistory(e)){atlasRenderFigures(e);return}
 const passages=[...card.querySelectorAll('.scene-passage')];
 const host=$('#peopleCards');
 if(host&&!passages.some(p=>p.querySelector(':scope>.scene-people'))){
  const keep=sceneIndex;
  for(const p of passages){
   sceneIndex=+p.dataset.sceneText;atlasRenderFigures(e);
   const block=document.createElement('section');block.className='scene-people';block.dataset.peopleOf=sceneIndex;block.hidden=host.hidden;block.append(...host.childNodes);p.append(block);
   // Opening a card closes others in its own scene only: closing one further up would move the text being read.
   for(const c of block.querySelectorAll('.person-card')){c.dataset.who=c.dataset.person;c.setAttribute('name','atlas-figures-'+sceneIndex)}
  }
  sceneIndex=keep;host.remove();
 }
 // Going to a scene closes any card left open; scrolling past one leaves it alone, because closing it would move the text.
 if(!readerFollows)card.querySelectorAll('.person-card[open]').forEach(d=>{d.open=false});
 // renderScenes has just carried the marked block into the new scene: put it back.
 for(const p of passages){
  const block=card.querySelector(`.scene-people[data-people-of="${p.dataset.sceneText}"]`);if(!block)continue;
  if(block.parentNode!==p)p.append(block);
  const here=+p.dataset.sceneText===sceneIndex;
  if(here)block.id='peopleCards';else block.removeAttribute('id');
  // A person can appear in several scenes: only the current scene's card answers to [data-person].
  for(const c of block.querySelectorAll('.person-card')){if(here)c.dataset.person=c.dataset.who;else delete c.dataset.person}
 }
 // renderScenes moves whatever carries this id, and cannot do without one.
 if(!$('#peopleCards'))card.querySelector('.scene-people')?.setAttribute('id','peopleCards');
};
// The section open at load was drawn before this layer existed: lay out its cards now, not on the first scroll, when the text would jump.
if(cur>=0&&isHistory(ENTRIES[cur])){renderFigures(ENTRIES[cur]);scrollSceneText(false)}
// Only real scrolling changes the scene, and it never writes the scroll position, which would stop a phone's inertia.
const readerIsScrolling=()=>{readerScrolledUntil=performance.now()+400};
for(const type of ['wheel','touchmove','pointerdown'])readerBody.addEventListener(type,readerIsScrolling,{passive:true});
readerBody.addEventListener('keydown',ev=>{if(['PageUp','PageDown','Home','End',' '].includes(ev.key))readerIsScrolling()});
const settleScene=()=>{
 sceneTimer=0;const i=wantedScene;wantedScene=null;
 if(i===null||i===sceneIndex||mode!=='ride')return;
 readerFollows=true;try{go(ENTRIES[cur].id,{scene:i})}finally{readerFollows=false}
};
const highlightScene=()=>{
 scrollFrame=0;
 const box=readerBody.getBoundingClientRect(),line=box.top+box.height*.3,passages=[...card.querySelectorAll('.scene-passage:not(.off-station)')];
 if(!passages.length)return;
 let active=passages[0];for(const p of passages)if(p.getBoundingClientRect().top<=line)active=p;
 if(readerBody.scrollTop+readerBody.clientHeight>=readerBody.scrollHeight-2)active=passages.at(-1);
 const i=+active.dataset.sceneText;if(i===(wantedScene??sceneIndex))return;
 wantedScene=i;for(const p of passages)p.classList.toggle('current',p===active);
 showSceneName(i);
};
readerBody.addEventListener('scroll',()=>{
 const now=performance.now();
 if(mode!=='ride'||now>readerScrolledUntil)return;
 readerScrolledUntil=now+250;  // inertia carries on after the finger lifts
 if(!scrollFrame)scrollFrame=requestAnimationFrame(highlightScene);
 clearTimeout(sceneTimer);sceneTimer=setTimeout(settleScene,180);
},{passive:true});
// On desktop the reader rises beside the route strip, by exactly the strip's height.
const ridePanel=$('#ridePanel'),measureRide=()=>document.documentElement.style.setProperty('--ride-h',ridePanel.offsetHeight+'px');
new ResizeObserver(measureRide).observe(ridePanel);measureRide();
// Phones: the route strip opens on demand, and the map can fold away.
$('#stripToggle').onclick=()=>{
 const open=document.body.classList.toggle('strip-open');$('#stripToggle').setAttribute('aria-expanded',String(open));$('#stripToggle i').textContent=open?'▴':'▾';
 if(open)centerRoute();
};
$('#mapFold').onclick=()=>{
 const folded=document.body.classList.toggle('map-min');$('#mapFold').textContent=folded?'地图 ▾':'地图 ▴';$('#mapFold').setAttribute('aria-expanded',String(!folded));
 requestAnimationFrame(()=>{map.invalidateSize({animate:false});if(!folded)fit(ENTRIES[cur],false)});
};
// The map now fills the space beside the text, so nothing overlaps it but the scene strip outside 历史进程.
viewportPadding=()=>{
 map.invalidateSize({animate:false,pan:false});
 const small=narrowScreen(),strip=!sceneRail.hidden&&!document.body.classList.contains('history-mode');
 return small?{paddingTopLeft:[16,50],paddingBottomRight:[16,strip?104:24]}:{paddingTopLeft:[34,66],paddingBottomRight:[34,strip?112:44]};
};
// ← → change station and ↑ ↓ change scene on the train; other modes keep the atlas's own keys.
window.addEventListener('keydown',ev=>{
 if(transferDialog.open||mode==='off'||ev.defaultPrevented||ev.isComposing||ev.altKey||ev.ctrlKey||ev.metaKey||ev.shiftKey)return;
 if(ev.target.isContentEditable||ev.target.closest('input:not(#audioSpeed):not(#audioSeek):not(#audioIncludeExtras):not(#audioIncludePeople),textarea,select,[role="textbox"],[role="separator"],#toc,#treeSheet')||!$('#kinSheet')?.hidden)return;
 if(ev.key==='Escape'&&mode==='ride'){ev.preventDefault();setMode('network');return}
 if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(ev.key))return;
 ev.preventDefault();ev.stopImmediatePropagation();
 if(mode!=='ride')return;
 if(ev.key==='ArrowLeft')stepStation(-1);if(ev.key==='ArrowRight')stepStation(1);
 if(ev.key==='ArrowUp')stepScene(-1);if(ev.key==='ArrowDown')stepScene(1);
},true);

/* ---------- Pan and zoom the network like a map ---------- */
const pointers=new Map();let graphDrag=null,pinch=null,skipGraphClick=false;
network.addEventListener('pointerdown',e=>{
 if(e.target.closest('.station-inspector,.slice-panel,#yearRuler button'))return;
 pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});skipGraphClick=false;
 if(pointers.size===2){const[a,b]=[...pointers.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)};graphDrag=null}
 else graphDrag={id:e.pointerId,x:e.clientX,y:e.clientY,cx:camera.x,cy:camera.y,moved:false};
});
network.addEventListener('pointermove',e=>{
 if(!pointers.has(e.pointerId))return;pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});
 if(pointers.size===2){const[a,b]=[...pointers.values()],d=Math.hypot(a.x-b.x,a.y-b.y),r=network.getBoundingClientRect();if(pinch?.d)zoomAt(d/pinch.d,(a.x+b.x)/2-r.left,(a.y+b.y)/2-r.top);pinch={d};skipGraphClick=true;return}
 if(!graphDrag)return;const dx=e.clientX-graphDrag.x,dy=e.clientY-graphDrag.y;
 if(!graphDrag.moved&&Math.hypot(dx,dy)>5){graphDrag.moved=true;network.setPointerCapture(e.pointerId);network.classList.add('dragging')}
 if(graphDrag.moved){e.preventDefault();camera.x=graphDrag.cx+dx;camera.y=graphDrag.cy+dy;skipGraphClick=true;applyCamera()}
});
function endGraphPointer(e){pointers.delete(e.pointerId);graphDrag=null;pinch=null;network.classList.remove('dragging');setTimeout(()=>{skipGraphClick=false},0)}
network.addEventListener('pointerup',endGraphPointer);network.addEventListener('pointercancel',endGraphPointer);
network.addEventListener('wheel',e=>{if(e.target.closest('.station-inspector,.slice-panel'))return;e.preventDefault();const r=network.getBoundingClientRect();if(e.shiftKey){camera.x-=e.deltaY;camera.y-=e.deltaX;applyCamera()}else zoomAt(Math.exp(-e.deltaY*.0015),e.clientX-r.left,e.clientY-r.top)},{passive:false});
network.addEventListener('dblclick',e=>{if(e.target.closest('.station-inspector,.slice-panel,.metro-node,.rail-hit'))return;const r=network.getBoundingClientRect();zoomAt(1.35,e.clientX-r.left,e.clientY-r.top)});

/* The on-train line can be dragged too. */
let routeDrag=null;const routeScroller=$('#routeScroller');
routeScroller.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||e.button!==0)return;routeDrag={x:e.clientX,left:routeScroller.scrollLeft,moved:false};routeSkipClick=false});
routeScroller.addEventListener('pointermove',e=>{if(!routeDrag)return;const dx=e.clientX-routeDrag.x;if(Math.abs(dx)>5&&!routeDrag.moved){routeDrag.moved=true;routeScroller.setPointerCapture(e.pointerId);routeScroller.classList.add('dragging')}if(routeDrag.moved){routeScroller.scrollLeft=routeDrag.left-dx;routeSkipClick=true}});
routeScroller.addEventListener('pointerup',()=>{routeDrag=null;routeScroller.classList.remove('dragging');setTimeout(()=>{routeSkipClick=false},0)});
routeScroller.addEventListener('pointercancel',()=>{routeDrag=null;routeScroller.classList.remove('dragging')});
routeScroller.addEventListener('wheel',e=>{if(Math.abs(e.deltaY)>Math.abs(e.deltaX)){e.preventDefault();routeScroller.scrollLeft+=e.deltaY}},{passive:false});

/* ---------- Controls ---------- */
$('#modeToggle').onclick=()=>{
 if(mode==='ride'){setMode('network');return}
 const s=stationByKey.get(selectedKey);board(s.lines.includes(rideLine)?rideLine:s.lines[0],{key:selectedKey});
};
$('#tHistory').onclick=()=>{if(mode==='ride')setMode('network');else if(mode==='off')go(lastEntry.history)};
$('#prevStation').onclick=()=>stepStation(-1);$('#nextStation').onclick=()=>stepStation(1);
$('#prevScene').onclick=()=>stepScene(-1);$('#nextScene').onclick=()=>stepScene(1);
$('#zoomIn').onclick=()=>zoomAt(1.2);$('#zoomOut').onclick=()=>zoomAt(1/1.2);$('#focusCurrent').onclick=()=>focusStation();$('#fitNetwork').onclick=fitWhole;
$('#inspectorClose').onclick=()=>{$('#stationInspector').hidden=true};
$('#sliceClose').onclick=()=>{$('#slicePanel').hidden=true};
$('#legendToggle').onclick=()=>$('#networkLegend').classList.toggle('open');
$$('.network-presets [data-era]').forEach(b=>b.onclick=()=>{const ranges={ancient:[-550,476],medieval:[900,1285],late:[1270,1505]},[a,z]=ranges[b.dataset.era];focusKeys(stations.filter(s=>s.t<=z&&s.end>=a).map(s=>s.key))});
window.addEventListener('resize',()=>{if(mode!=='off'&&station){renderRide();centerRoute()}if(mode==='network')applyCamera()});
new ResizeObserver(()=>map.invalidateSize({animate:false,pan:false})).observe($('#map'));

/* ---------- Start ---------- */
$('#brandMark').src=$('link[rel="icon"]').href;
const syncMasthead=()=>document.documentElement.style.setProperty('--masthead-h',$('#masthead').offsetHeight+'px');
new ResizeObserver(syncMasthead).observe($('#masthead'));syncMasthead();
$('#datasetStats').textContent=`${lines.length}条主线 · ${stations.length}个事件站 · ${ENTRIES.filter(isHistory).reduce((n,e)=>n+e.scenes.length,0)}幕`;
setReaderCollapsed(false,{save:false,refit:false});
$('#legendBox').open=false;
renderNetwork();
map.invalidateSize({animate:false,pan:false});
const opening=ENTRIES[cur];
// A link to a scene opens on the train; the bare address opens on the whole map.
if(isHistory(opening)){
 const deepLink=!window.atlasOpenedBare;
 mode=deepLink?'ride':'network';document.body.dataset.metro=mode;
 station=stationByKey.get(currentStation().key);selectedKey=station.key;
 if(station.lines.includes(treeLine))rideLine=treeLine;else rideLine=station.lines[0];
 card.querySelectorAll('.scene-passage').forEach(p=>{const i=+p.dataset.sceneText;p.classList.toggle('off-station',i<station.from||i>station.to)});
 renderRide();updateSceneUI();
 focusScene(opening,activeScene(opening));fit(opening,false);
 setMode(mode,{whole:!deepLink&&!narrowScreen()});
 if(!deepLink)$('#stationInspector').hidden=true;
 scrollSceneText(false);
}else{document.body.dataset.metro='off';mode='off';fit(opening,false)}
routeAt=rideLine;
window.metroUI={board,inspect,goStation,stepStation,stepScene,setMode,focusStation,focusKeys,fitWhole,zoomAt,setCamera:c=>{camera={...c};applyCamera()},
 state:()=>({mode,line:rideLine,station:station?.key,scene:station?sceneIndex-station.from:0,globalScene:sceneIndex,sceneCount:station?.count,camera:{...camera}}),
 data:{stations,lines,lineStops},get pointByKey(){return pointByKey},layoutReport:()=>NET.report,layoutBounds:()=>NET.world};
})();
