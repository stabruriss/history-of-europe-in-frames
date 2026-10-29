const toc=document.getElementById('toc');
const mobileToc=document.getElementById('mobileToc');
const card=document.getElementById('card');
const legend=document.getElementById('legend');
const reader=document.getElementById('reader');
const readerBody=document.getElementById('readerBody');
const readerToggle=document.getElementById('readerToggle');
const sceneRail=document.getElementById('sceneRail');
let cur=-1,sceneIndex=0,viewMode='history',pending=null;
const lastEntry={geography:'overview',history:'history-migration',topics:'topic-grail-sword'};
const isHistory=e=>e.kind==='history',isTopic=e=>e.kind==='topic',hasScenes=e=>Boolean(e?.scenes?.length);
const entryMode=e=>isHistory(e)?'history':isTopic(e)?'topics':'geography';
const activeScene=e=>hasScenes(e)?e.scenes[sceneIndex]:e;
const activeEntries=()=>ENTRIES.filter(e=>entryMode(e)===viewMode);
const navigationRows=()=>[...toc.querySelectorAll('.chip')];

function renderToc(){
  toc.replaceChildren();mobileToc.replaceChildren();
  const historical=viewMode==='history';
  document.body.classList.toggle('history-mode',historical);
  if(historical){
    renderHistoryTree(toc);
    HISTORY_ERAS.forEach(era=>{
      const optgroup=document.createElement('optgroup');optgroup.label=era.name+' · '+era.date;
      era.items.forEach(([id,from=0,to,label])=>{
        const e=HISTORY_ENTRIES.find(e=>e.id===id);to??=e.scenes.length-1;
        const option=document.createElement('option');option.value=id+'/'+from;option.dataset.id=id;option.dataset.from=from;option.dataset.to=to;
        option.textContent=(label||e.short)+' · '+e.period;optgroup.appendChild(option);
      });
      mobileToc.appendChild(optgroup);
    });
  }else if(viewMode==='topics'){
    const optgroup=document.createElement('optgroup');optgroup.label='动力专题';
    const row=document.createElement('section');row.className='ch history-ch';
    row.innerHTML='<h3 class="chapter-heading"><small>DYNAMICS & MECHANISMS</small>动力专题</h3><div class="chips"></div>';
    TOPIC_ENTRIES.forEach(e=>{
      const i=ENTRIES.indexOf(e);
      const option=document.createElement('option');option.value=e.id;option.dataset.id=e.id;
      option.textContent=e.num+' · '+e.title;optgroup.appendChild(option);
      const b=document.createElement('button');b.className='chip';b.dataset.i=i;b.dataset.id=e.id;b.style.setProperty('--c',e.c);
      b.innerHTML=`<i>${e.num}</i><span>${e.short}<small>${e.sub}</small></span>`;
      b.title=e.title+' · '+e.en;b.setAttribute('aria-label',b.title);b.onclick=()=>go(e.id);
      row.querySelector('.chips').appendChild(b);
    });
    mobileToc.appendChild(optgroup);toc.appendChild(row);
    if(TOPIC_FUTURE.length){
      const fut=document.createElement('div');fut.className='era-future';
      fut.innerHTML='<span>待定稿 · 逐篇审订</span>'+TOPIC_FUTURE.map(([n,t,s])=>`<b>${n} · ${t}</b><small>${s}</small>`).join('');
      toc.appendChild(fut);
    }
  }else CH.forEach((name,ci)=>{
    const items=ENTRIES.map((e,i)=>[e,i]).filter(([e])=>entryMode(e)===viewMode&&e.ch===ci);
    if(!items.length)return;
    const optgroup=document.createElement('optgroup');optgroup.label=name;
    const row=document.createElement('section');row.className='ch'+(historical?' history-ch':'');
    row.innerHTML=historical?`<h3 class="chapter-heading"><small>SECTOR ${String(ci+1).padStart(2,'0')}</small>${name}</h3><div class="chips"></div>`:`<b>${name}</b><div class="chips"></div>`;
    items.forEach(([e,i],n)=>{
      const option=document.createElement('option');option.value=e.id;
      option.textContent=(historical?e.period+' · ':'')+e.title+' · '+e.en;optgroup.appendChild(option);
      const b=document.createElement('button');b.className='chip';b.dataset.i=i;b.dataset.id=e.id;b.style.setProperty('--c',e.c);
      b.innerHTML=historical?`<i>${String(n+1).padStart(2,'0')}</i><span>${e.short}<small>${e.period}</small></span>`:`<i></i>${e.short}`;
      b.title=e.title+' · '+e.en;b.setAttribute('aria-label',b.title);b.onclick=()=>go(e.id);
      row.querySelector('.chips').appendChild(b);
    });
    mobileToc.appendChild(optgroup);toc.appendChild(row);
  });
  for(const [id,mode] of [['tHistory','history'],['tGeography','geography'],['tTopics','topics']]){
    const b=document.getElementById(id);b.classList.toggle('on',viewMode===mode);b.setAttribute('aria-pressed',String(viewMode===mode));
  }
  document.getElementById('indexCaption').textContent=historical?'历史树：自上而下是时间，枝杈是主题\n先选主线，↑↓ 沿线走 · ←→ 切换地图事件\nⅠ 上古 Ⅱ 城邦 Ⅲ 马其顿 Ⅳ 希腊化 Ⅴ 罗马 Ⅵ 帝国 Ⅶ 基督教 Ⅷ 中国 Ⅸ 埃及 Ⅹ 波斯—阿拉伯 Ⅺ 东欧 · 右缘可拖宽':viewMode==='topics'?'主线讲事情怎么发生，专题讲事情为什么总这样发生。\n每个专题拆成若干豆腐块呈现，可点链接跳回主线。':'从山海、河流与地区名认识历史的舞台。\n↑↓ 切换条目';
  toc.setAttribute('aria-label',historical?'历史树：按时间与主题浏览':viewMode==='topics'?'动力专题':'地理概念');
  mobileToc.setAttribute('aria-label',historical?'选择历史时期与章节':viewMode==='topics'?'选择动力专题':'选择地理概念');
}
document.getElementById('tGeography').onclick=()=>go(lastEntry.geography);
document.getElementById('tHistory').onclick=()=>go(lastEntry.history);
document.getElementById('tTopics').onclick=()=>go(lastEntry.topics);
mobileToc.onchange=()=>go(mobileToc.value);

/* History tree: branches are topics, distance from the root is time.
   Deep prehistory is compressed; where events crowd, rows push later ones down, so height stays in time order. */
const SVGNS='http://www.w3.org/2000/svg';
const NUMERALS=['Ⅰ','Ⅱ','Ⅲ','Ⅳ','Ⅴ','Ⅵ','Ⅶ','Ⅷ','Ⅸ','Ⅹ','Ⅺ'];
const TREE_SCALE=[[-68000,0],[-10000,44],[-3000,92],[-1300,150],[0,1216]];
function treeBase(t){
  let i=1;while(i<TREE_SCALE.length-1&&t>TREE_SCALE[i][0])i++;
  const [t0,y0]=TREE_SCALE[i-1],[t1,y1]=TREE_SCALE[i];return y0+(t-t0)*(y1-y0)/(t1-t0);
}
const treeYear=t=>t<=-10000?`前${-t/10000}万`:t<0?`前${-t}`:t?String(t):'公元';

function historyTreeRows(){
  const branches=Object.fromEntries(HISTORY_BRANCHES.map(b=>[b.id,b])),rows=[];let order=0;
  for(const era of HISTORY_ERAS){
    const items=era.items.map(([id,from=0,to,label])=>{
      const e=HISTORY_ENTRIES.find(x=>x.id===id),key=id+'/'+from,spec=TREE_ROWS[key];to??=e.scenes.length-1;
      if(!spec)throw new Error('History tree has no place for '+key);
      // One event can sit on several lines at once (one set of scenes); the first line is its home.
      const [branch,t,end,period]=spec,lines=[].concat(branch),b=branches[lines[0]];
      return {kind:'item',key,id,from,to,era,e,branch:b,lines,t,end,order:order++,c:b.c||TREE_CH_COLORS[e.ch],label:label||e.short,
        period:period||(from===0&&to===e.scenes.length-1?e.period:e.scenes[from].date)};
    });
    const first=items.reduce((a,b)=>b.t<a.t?b:a);
    rows.push({kind:'head',era,t:first.t,order:items[0].order-.5,c:TREE_CH_COLORS[items[0].e.ch]},...items);
  }
  TREE_FUTURE.forEach(([branch,t,label,note],i)=>rows.push({kind:'future',branch:branches[branch],t,label,note,order:1e4+i,c:branches[branch].c}));
  // A line that stops says why: the event that ends it, and the line it runs into, if any.
  const lastOn=id=>rows.filter(r=>r.kind==='item'&&r.lines.includes(id)).reduce((a,r)=>!a||r.t>=a.t?r:a,null);
  TREE_ENDS.forEach(([branch,t,label,note,into],i)=>rows.push({kind:'end',branch:branches[branch],t,label,note,into:into?branches[into]:null,order:2e4+i,
    c:branches[branch].c||lastOn(branch).c}));
  // 老无 2026-10-28: every five hundred years a line across the whole tree, with a short account of where each line stands.
  (typeof TREE_SLICES==='undefined'?[]:TREE_SLICES).forEach(([t,label,head,text],i)=>rows.push({kind:'slice',t,label,head,text,order:3e4+i}));
  return rows;
}

/* Metro lines: a line runs from the root down the trunk to its fork, then along its own branch.
   ↑↓ and 上一条/下一条 move between the stations of the chosen line, in time order. */
let treeLine='trunk',treeStationList=null,lastStationKey=null,keepTreeScroll=false;
const lineCache={},BRANCH=Object.fromEntries(HISTORY_BRANCHES.map(b=>[b.id,b]));
const lineColor=b=>b.c||TREE_CH_COLORS[1];
const treeStations=()=>treeStationList??=historyTreeRows().filter(r=>r.kind==='item')
  .map(r=>({key:r.key,id:r.id,from:r.from,to:r.to,t:r.t,order:r.order,branch:r.branch.id,lines:r.lines,era:r.era.id}));
function lineStations(id){
  if(lineCache[id])return lineCache[id];
  const b=BRANCH[id],before=b.parent?lineStations(b.parent).filter(s=>s.t<b.from):[];
  return lineCache[id]=[...before,...treeStations().filter(s=>s.lines.includes(id))].sort((a,b)=>a.t-b.t||a.order-b.order);
}
function currentStation(){
  const e=ENTRIES[cur];if(!e||!isHistory(e))return null;
  return treeStations().find(s=>s.id===e.id&&sceneIndex>=s.from&&sceneIndex<=s.to)||null;
}
// Stay on the chosen line while its stations are visited; a station off the line switches to that station's own branch.
function syncTreeLine(){const s=currentStation();if(s&&!lineStations(treeLine).some(x=>x.key===s.key))treeLine=s.branch;}
function scrollTreeToKey(key){
  document.querySelectorAll('.htree').forEach(tree=>{
    const scroller=tree.parentElement,item=tree.querySelector(`.tree-item[data-key="${key}"]`);
    if(!scroller||!item||!item.getClientRects().length)return;
    const head=tree.querySelector(`.tree-head[data-era="${item.dataset.era}"]`);
    const anchor=head&&item.offsetTop-head.offsetTop<56?head:item;
    const bar=scroller.querySelector('.tree-lines');
    const topEdge=bar?bar.getBoundingClientRect().bottom+6:scroller.getBoundingClientRect().top+6;
    scroller.scrollTop=Math.max(0,scroller.scrollTop+anchor.getBoundingClientRect().top-topEdge);
  });
}
// Top header pills jump to that line's start time; clicking in the tree below switches in place without moving the timeline.
function selectTreeLine(id,{jump=false}={}){
  treeLine=id;
  keepTreeScroll=true;
  try{
    if(jump){
      const first=treeStations().find(s=>s.lines.includes(id))||lineStations(id)[0];
      if(first){
        lastStationKey=first.key;
        go(first.id,{scene:first.from});
        treeLine=id;updateNavigation();
        scrollTreeToKey(first.key);
        return;
      }
    }
    updateNavigation();
  }finally{keepTreeScroll=false;}
}
// The previous/next station on the chosen line; from a section off the line, the nearest ones before/after it in time.
function lineNeighbor(delta){
  const line=lineStations(treeLine),s=currentStation();if(!s)return null;
  const i=line.findIndex(x=>x.key===s.key);if(i>=0)return line[i+delta]||null;
  const later=x=>x.t>s.t||(x.t===s.t&&x.order>s.order);
  return (delta>0?line.find(later):line.findLast(x=>!later(x)))||null;
}

function renderHistoryTree(host,{sheet=false}={}){
  const rows=historyTreeRows(),tree=document.createElement('div');tree.className='htree';
  tree.innerHTML=`<svg class="htree-svg" aria-hidden="true"></svg><div class="htree-ticks" aria-hidden="true"></div>`;
  for(const r of rows.filter(r=>r.kind==='head')){
    r.el=document.createElement('div');r.el.className='tree-head era';r.el.dataset.era=r.era.id;r.el.style.setProperty('--c',r.c);
    r.el.innerHTML=`<b>${r.era.name}</b><em>${r.era.date}</em>`;tree.appendChild(r.el);
  }
  // Rows sit in time order in the DOM too, so ↑↓ and 上一条/下一条 walk the tree top to bottom.
  for(const r of rows.filter(r=>r.kind==='item').sort((a,b)=>a.t-b.t||a.order-b.order)){
    const b=r.el=document.createElement('button');b.type='button';b.className='chip tree-item';
    Object.assign(b.dataset,{id:r.id,from:r.from,to:r.to,era:r.era.id,branch:r.branch.id,lines:r.lines.join(' '),key:r.key});b.style.setProperty('--c',r.c);
    // A shared station names all its lines; 罗马 rows name their chapter (Ⅴ 罗马, Ⅵ 帝国); other lines name themselves.
    const where=r.lines.length>1?r.lines.map(id=>BRANCH[id].name).join('、'):r.branch.c&&r.branch.id!=='rome'?r.branch.name:NUMERALS[r.e.ch];
    b.innerHTML=`<span>${r.label}</span><small><i>${where} · </i>${r.period}</small>`;
    b.title=HISTORY_CH[r.e.ch]+' · '+r.e.title;b.setAttribute('aria-label',`${b.title} · ${r.era.name} · ${r.period}`);
    b.onclick=()=>{keepTreeScroll=true;try{go(r.id,{scene:r.from});}finally{keepTreeScroll=false;}if(sheet)closeTreeSheet(false);};
    tree.appendChild(b);
  }
  for(const r of rows.filter(r=>r.kind==='future')){
    r.el=document.createElement('div');r.el.className='tree-future era-future';r.el.dataset.branch=r.branch.id;r.el.style.setProperty('--c',r.c);
    r.el.innerHTML=`<b>${r.label}</b><small>${r.note}</small>`;tree.appendChild(r.el);
  }
  for(const r of rows.filter(r=>r.kind==='end')){
    r.el=document.createElement('div');r.el.className='tree-end';r.el.dataset.branch=r.branch.id;r.el.style.setProperty('--c',r.c);
    r.el.innerHTML=`<b>${r.label}</b><small>${r.note}</small>`;tree.appendChild(r.el);
  }
  // A time slice opens to its paragraph; the expanded tree shows them open, the sidebar shows the headline only.
  for(const r of rows.filter(r=>r.kind==='slice')){
    r.el=document.createElement('details');r.el.className='tree-slice';r.el.dataset.t=r.t;r.el.open=sheet;
    r.el.innerHTML=`<summary><b>${r.label}</b><span>${r.head}</span></summary><p>${r.text}</p>`;
    r.el.addEventListener('toggle',()=>layoutHistoryTree(tree));tree.appendChild(r.el);
  }
  // Branch names run along their branches in the wide view; clicking them in the tree below switches in place without moving the timeline.
  tree._names=HISTORY_BRANCHES.filter(b=>b.c).map(b=>{
    const el=document.createElement('span');el.className='tree-branch-name';el.setAttribute('aria-hidden','true');
    el.dataset.branch=b.id;el.style.setProperty('--c',b.c);el.textContent=b.name;
    el.title=`切换到“${b.name}”（原地）`;el.onclick=()=>selectTreeLine(b.id,{jump:false});
    tree.appendChild(el);return {b,el};
  });
  tree.querySelector('.htree-svg').addEventListener('click',ev=>{const hit=ev.target.closest('.lane-hit');if(hit)selectTreeLine(hit.dataset.line,{jump:false});});
  const bar=document.createElement('div');bar.className='tree-lines';bar.setAttribute('role','group');bar.setAttribute('aria-label','选择主线');
  bar.innerHTML='<span>主线</span>';
  for(const b of HISTORY_BRANCHES){
    const btn=document.createElement('button');btn.type='button';btn.className='tree-line';btn.dataset.line=b.id;
    btn.style.setProperty('--c',lineColor(b));btn.innerHTML=`<i></i>${b.name}`;btn.title=`跳到“${b.name}”的起点`;
    btn.onclick=()=>selectTreeLine(b.id,{jump:true});bar.appendChild(btn);
  }
  tree._rows=rows;host.replaceChildren(bar,tree);layoutHistoryTree(tree);
  return tree;
}

function layoutHistoryTree(tree){
  const W=tree?.isConnected?tree.clientWidth:0;if(!W)return;
  // Sidebar: tight lanes, two-line rows. Phone sheet: a wider fan with branch names. Desktop sheet: one-line rows too.
  const mode=W>=480?'wide':W>=300?'medium':'compact',wide=mode==='wide';
  tree.classList.toggle('wide',wide);tree.classList.toggle('compact',mode==='compact');tree.classList.toggle('narrow',W<200);
  const rows=tree._rows,gap={wide:30,medium:20,compact:W>=220?10:9}[mode],axis={wide:44,medium:30,compact:W>=220?26:22}[mode];
  const k={wide:1.15,medium:1.05,compact:1}[mode],fork={wide:44,medium:32,compact:22}[mode];
  const lanes=Math.max(...HISTORY_BRANCHES.map(b=>b.lane))+1,laneX=l=>axis+(mode==='compact'?7:12)+l*gap,labelX=laneX(lanes-1)+(mode==='compact'?gap:21);
  for(const r of rows){r.el.style.left=labelX+'px';r.el.style.width=(W-labelX)+'px';}
  // At one moment: a time slice first, then a line's end, then what grows out of it; unwritten shoots come last.
  const rank=r=>r.kind==='slice'?-2:r.kind==='end'?-1:r.kind==='future'?1:0;
  const sorted=[...rows].sort((a,b)=>a.t-b.t||rank(a)-rank(b)||a.order-b.order);
  let bottom=0;
  for(const r of sorted){
    r.h=r.el.offsetHeight||30;r.y=Math.max(4+treeBase(r.t)*k,bottom+(r.kind==='head'?9:3));
    r.el.style.top=r.y+'px';bottom=r.y+r.h;r.ny=r.y+Math.min(wide?12:10,r.h/2);
  }
  const H=Math.ceil(bottom+22);tree.style.height=H+'px';
  // Time → height through the placed rows; the same mapping draws forks, ends, ticks and breaks.
  const pts=[];for(const r of sorted)if(r.kind!=='head'&&(!pts.length||r.t>pts.at(-1)[0]))pts.push([r.t,r.ny]);
  const Y=t=>{
    if(t<=pts[0][0])return pts[0][1];
    for(let i=1;i<pts.length;i++)if(t<=pts[i][0]){const [t0,y0]=pts[i-1],[t1,y1]=pts[i];return y0+(t-t0)*(y1-y0)/(t1-t0);}
    const [t1,y1]=pts.at(-1);return y1+(treeBase(t)-treeBase(t1))*k;
  };
  const grid=[],ties=[],lanesSvg=[],marks=[],nodes=[],copies=[],swaps=[],hits=[],ticks=tree.querySelector('.htree-ticks');ticks.replaceChildren();
  let lastTick=-1e9;
  for(const t of [-10000,-3000,-2000,-1500,-1200,-1000,-800,-600,-500,-400,-300,-200,-100,0,100,200,300,400,500,600,700,800,900,1000]){
    const y=Y(t);if(y-lastTick<26||y>H-8)continue;lastTick=y;
    grid.push(`<path class="grid" d="M${axis-2} ${y}H${labelX-4}"/>`);
    const label=document.createElement('span');label.className='tree-tick';label.style.cssText=`top:${y}px;width:${axis-4}px`;label.textContent=treeYear(t);ticks.appendChild(label);
  }
  // Each time slice cuts across every lane at its own height.
  for(const r of sorted.filter(r=>r.kind==='slice'))grid.push(`<path class="slice-line" data-t="${r.t}" d="M${axis-2} ${r.ny}H${labelX-4}"/>`);
  const byId=BRANCH,stationsOf=b=>sorted.filter(r=>r.kind==='item'&&r.lines.includes(b.id));
  const ends=Object.fromEntries(sorted.filter(r=>r.kind==='end').map(r=>[r.branch.id,r]));
  // Sections of one line that run almost the same years (老无 2026-10-27): the later ones ride a passing loop beside the line.
  const side=new Map(),loops=[];
  for(const [line,keys,dir=1] of (typeof TREE_PARALLEL==='undefined'?[]:TREE_PARALLEL)){
    const rs=keys.map(k=>sorted.find(r=>r.kind==='item'&&r.key===k)).filter(r=>r&&r.lines.includes(line));
    if(rs.length<2||!byId[line])continue;
    const off=dir*Math.min(gap*.45,12);rs.slice(1).forEach(r=>side.set(line+'|'+r.key,off));loops.push({line,rs,off});
  }
  // Where each branch leaves its parent; parent segments are cut there so a line can light up root-to-fork.
  // A branch that carries on where its parent stops (罗马 → 东罗马 and 中世纪西欧) leaves from that end.
  tree._forkY={};tree._endY=Object.fromEntries(Object.entries(ends).map(([id,r])=>[id,r.ny]));const forkLen={};
  for(const b of HISTORY_BRANCHES)if(b.parent){
    const items=stationsOf(b),pe=ends[b.parent];if(!items.length)continue;
    if(pe&&pe.t<=b.from){tree._forkY[b.id]=pe.ny;forkLen[b.id]=Math.max(6,Math.min(fork,items[0].ny-pe.ny));}
    else{tree._forkY[b.id]=Math.min(Y(b.from),items[0].ny-fork);forkLen[b.id]=fork;}
  }
  for(const b of HISTORY_BRANCHES){
    const items=stationsOf(b);if(!items.length)continue;
    const x=laneX(b.lane),w=(b.id==='trunk'?3.4:b.id==='rome'?3.1:2.3)*(wide?1.25:1),col=r=>b.c||r.c;
    const cuts=HISTORY_BRANCHES.filter(c=>c.parent===b.id&&tree._forkY[c.id]!==undefined).map(c=>tree._forkY[c.id]);
    const seg=(y0,y1,c)=>{
      for(const y of [...cuts.filter(y=>y>y0+.5&&y<y1-.5).sort((a,b)=>a-b),y1]){
        if(y>y0+.5)lanesSvg.push(`<path class="lane" data-branch="${b.id}" data-y1="${y}" d="M${x} ${y0}V${y}" stroke="${c}" stroke-width="${w}"/>`);y0=y;
      }
    };
    const px=b.parent?laneX(byId[b.parent].lane):x,yf=tree._forkY[b.id],fl=forkLen[b.id];
    if(b.parent){
      // On the parent's own lane the line simply carries on; elsewhere it curves out.
      if(px!==x)lanesSvg.push(`<path class="lane fork" data-branch="${b.id}" d="M${px} ${yf}C${px} ${yf+fl*.6} ${x} ${yf+fl*.4} ${x} ${yf+fl}" stroke="${col(items[0])}" stroke-width="${w}"/>`);
      seg(px!==x?yf+fl:yf,items[0].ny,col(items[0]));
    }
    const last=items.at(-1),stop=ends[b.id],end=stop?stop.ny:Math.max(last.ny,Y(b.to??last.end));
    const future=sorted.filter(r=>r.kind==='future'&&r.branch===b);
    // Name the branch in the first free stretch that can hold it.
    const name=tree._names.find(n=>n.b===b);
    if(name&&mode!=='compact'){
      name.el.hidden=false;const h=name.el.offsetHeight;
      // A branch's dashed shoot counts as room too, so a short branch (one section, then a shoot) can still be named.
      const stops=[...(b.parent?[px!==x?yf+fl:yf]:[]),...items.map(r=>r.ny),end,...future.map(r=>r.ny+16)];
      let best=[0,0];for(let i=1;i<stops.length;i++){
        if(stops[i]-stops[i-1]>=h+14){best=[stops[i-1],stops[i]];break;}
        if(stops[i]-stops[i-1]>best[1]-best[0])best=[stops[i-1],stops[i]];
      }
      name.el.hidden=best[1]-best[0]<h+14;
      name.el.style.left=x+7+'px';name.el.style.top=(best[0]+best[1]-h)/2+'px';
    }else if(name)name.el.hidden=true;
    items.forEach((r,i)=>{if(i)seg(items[i-1].ny,r.ny,col(r));});
    seg(last.ny,end,col(last));
    if(future.length)lanesSvg.push(`<path class="future-lane" data-branch="${b.id}" d="M${x} ${end}V${future.at(-1).ny+16}" stroke="${b.c}"/>`);
    else if(stop?.into&&stop.into.lane!==b.lane){
      // Running into another line: the curve joins that line's lane just below the end.
      const ix=laneX(stop.into.lane);
      lanesSvg.push(`<path class="lane merge" data-branch="${b.id}" data-y1="${end+fork}" d="M${x} ${end}C${x} ${end+fork*.6} ${ix} ${end+fork*.4} ${ix} ${end+fork}" stroke="${col(last)}" stroke-width="${w}"/>`);
    }else if(!stop)lanesSvg.push(`<path class="lane-end" data-branch="${b.id}" d="M${x-4} ${end}H${x+4}" stroke="${last.c}"/>`);
    // A wide transparent stroke over the whole line: clicking the line itself picks it, in place.
    const start=b.parent&&px!==x?`M${px} ${yf}C${px} ${yf+fl*.6} ${x} ${yf+fl*.4} ${x} ${yf+fl}`:`M${x} ${b.parent?yf:items[0].ny}`;
    hits.push(`<path class="lane-hit" data-line="${b.id}" d="${start}V${future.length?future.at(-1).ny+16:end}" stroke-width="${Math.min(14,gap-2)}"><title>切换到“${b.name}”（原地）</title></path>`);
    for(const r of [...items,...future]){
      const tag=r.kind==='item'?`data-key="${r.key}"`:`data-branch="${b.id}"`,shared=r.kind==='item'&&r.lines.length>1;
      const nx=x+(r.kind==='item'&&side.get(b.id+'|'+r.key)||0);
      // A shared station: one node on each of its lanes, one tie from the rightmost.
      if(!shared||b.lane===Math.max(...r.lines.map(id=>byId[id].lane)))ties.push(`<path class="tie" ${tag} d="M${Math.max(x,nx)+6} ${r.ny}H${labelX-3}"/>`);
      (shared&&r.branch!==b?copies:nodes).push(r.kind==='item'?`<circle class="tree-node" ${tag} cx="${nx}" cy="${r.ny}" r="4" data-lx="${x}" stroke="${col(r)}" style="--node:${col(r)}"/>`
        :`<circle class="tree-node future" ${tag} cx="${x}" cy="${r.ny}" r="3.5" stroke="${r.c}"/>`);
    }
    if(stop){
      ties.push(`<path class="tie" data-end="${b.id}" d="M${x+6} ${stop.ny}H${labelX-3}"/>`);
      nodes.push(`<rect class="tree-stop" data-end="${b.id}" x="${x-4}" y="${stop.ny-1.6}" width="8" height="3.2" rx="1" fill="${col(last)}"/>`);
    }
  }
  // The passing loops: a second track leaves the line just above the first section of the group and rejoins just below the last.
  for(const {line,rs,off} of loops){
    const b=byId[line],x=laneX(b.lane),y0=rs[0].ny-8,y1=rs.at(-1).ny+8,k=Math.min(6,(y1-y0)/4);
    lanesSvg.push(`<path class="lane loop" data-branch="${line}" data-y1="${y1}" d="M${x} ${y0}C${x} ${y0+k} ${x+off} ${y0+k*.4} ${x+off} ${y0+k*1.6}V${y1-k*1.6}C${x+off} ${y1-k*.4} ${x} ${y1-k} ${x} ${y1}" fill="none" stroke="${b.c||rs[1].c}" stroke-width="${(wide?1.25:1)*1.9}"/>`);
  }
  // Interchanges: the lanes of a shared station joined at its height.
  for(const r of sorted.filter(r=>r.kind==='item'&&r.lines.length>1)){
    const xs=r.lines.map(id=>laneX(byId[id].lane)),x0=Math.min(...xs),x1=Math.max(...xs);
    swaps.push(`<path class="interchange" data-key="${r.key}" d="M${x0} ${r.ny}H${x1}"/><path class="interchange in" data-key="${r.key}" d="M${x0} ${r.ny}H${x1}"/>`);
  }
  // Breaks on the trunk where long stretches of prehistory are compressed.
  const tx=laneX(byId.trunk.lane);
  for(const t of [-24000,-5000,-2500]){const y=Y(t);marks.push(`<g class="break"><rect x="${tx-6}" y="${y-4}" width="12" height="8"/><path d="M${tx-6} ${y-1}L${tx+6} ${y-5}M${tx-6} ${y+5}L${tx+6} ${y+1}"/></g>`);}
  const svg=tree.querySelector('.htree-svg');
  svg.setAttribute('width',W);svg.setAttribute('height',H);svg.setAttribute('viewBox',`0 0 ${W} ${H}`);
  svg.innerHTML=grid.join('')+ties.join('')+lanesSvg.join('')+marks.join('')+swaps.join('')+nodes.join('')+copies.join('')+hits.join('');
  markTreeCurrent();
}

function markTreeCurrent(){
  const e=ENTRIES[cur];if(!e||!isHistory(e))return;
  document.querySelectorAll('.htree').forEach(tree=>{
    let current=null;
    tree.querySelectorAll('.tree-item').forEach(b=>{
      const on=b.dataset.id===e.id&&sceneIndex>=+b.dataset.from&&sceneIndex<=+b.dataset.to;
      b.classList.toggle('on',on);if(on){b.setAttribute('aria-current','page');current=b;}else b.removeAttribute('aria-current');
    });
    // Light the chosen line: its own branch, plus each ancestor down to where the line forks off.
    const keys=new Set(lineStations(treeLine).map(s=>s.key)),reach=new Map();
    for(let b=BRANCH[treeLine],until=Infinity;b;until=tree._forkY?.[b.id]??-Infinity,b=BRANCH[b.parent])reach.set(b.id,until);
    tree.dataset.line=treeLine;tree.dataset.branch=current?.dataset.branch||'';
    // Everything off the chosen line greys out: rows, nodes, ties, era headings, branch names, unwritten shoots.
    const eras=new Set(lineStations(treeLine).map(s=>s.era));
    tree.querySelectorAll('.tree-item,.tie[data-key],.interchange').forEach(b=>b.classList.toggle('off-line',!keys.has(b.dataset.key)));
    tree.querySelectorAll('.tree-head').forEach(h=>h.classList.toggle('off-line',!eras.has(h.dataset.era)));
    tree.querySelectorAll('.tree-branch-name,.era-future,.future-lane,.tree-node.future,.tie[data-branch]').forEach(el=>el.classList.toggle('off-line',el.dataset.branch!==treeLine));
    // A line's end is on the chosen line when the line runs through it (its own end, or the end it carries on from).
    const endOn=id=>reach.has(id)&&reach.get(id)>=(tree._endY?.[id]??Infinity)-.5;
    tree.querySelectorAll('.tree-end').forEach(el=>el.classList.toggle('off-line',!endOn(el.dataset.branch)));
    tree.querySelectorAll('.tree-stop,.tie[data-end]').forEach(el=>el.classList.toggle('off-line',!endOn(el.dataset.end)));
    tree.querySelectorAll('.tree-node[data-key]').forEach(n=>{
      // Every copy of a shared station lights up together.
      const on=n.dataset.key===current?.dataset.key;n.classList.toggle('on',on);n.setAttribute('r',on?5.5:4);n.classList.toggle('off-line',!keys.has(n.dataset.key));
    });
    tree.querySelectorAll('.lane,.lane-end').forEach(l=>{
      const until=reach.get(l.dataset.branch);
      l.classList.toggle('current',until!==undefined&&(l.classList.contains('fork')||l.classList.contains('lane-end')?until===Infinity||l.classList.contains('fork'):+l.dataset.y1<=until+.5));
    });
    tree.parentElement?.querySelectorAll('.tree-line').forEach(p=>{const on=p.dataset.line===treeLine;p.classList.toggle('on',on);p.setAttribute('aria-pressed',String(on));});
    tree.querySelectorAll('.era').forEach(h=>h.classList.toggle('active-era',h.dataset.era===current?.dataset.era));
  });
  if(!keepTreeScroll&&!treeSheet.hidden)treeSheet.querySelector('.tree-item.on')?.scrollIntoView({block:'nearest'});
}

// The same tree opens full-size on phones (where the sidebar is a menu) and on request on desktop.
const tocRow=document.createElement('div');tocRow.className='toc-row';
const treeOpen=document.createElement('button');treeOpen.type='button';treeOpen.id='treeOpen';
treeOpen.innerHTML='<span class="wide-only">展开大图 ↗</span><span class="narrow-only">树状图</span>';treeOpen.title='展开历史树：自上而下是时间，枝杈是主题';treeOpen.setAttribute('aria-label','展开历史树状图');treeOpen.setAttribute('aria-haspopup','dialog');
toc.before(tocRow);tocRow.append(mobileToc,treeOpen);
const treeSheet=document.createElement('div');treeSheet.id='treeSheet';treeSheet.hidden=true;
treeSheet.innerHTML=`<div class="tree-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="treeSheetTitle">
  <header><div><b id="treeSheetTitle">历史树</b><span>自上而下是时间 · 每个枝杈是一个主题</span></div><button type="button" id="treeClose">关闭 ×</button></header>
  <div class="tree-sheet-body"></div></div>`;
document.body.appendChild(treeSheet);
function openTreeSheet(){
  treeSheet.hidden=false;
  const tree=renderHistoryTree(treeSheet.querySelector('.tree-sheet-body'),{sheet:true});
  const on=tree.querySelector('.tree-item.on');on?.scrollIntoView({block:'center'});
  (on||document.getElementById('treeClose')).focus({preventScroll:true});
}
function closeTreeSheet(restoreFocus=true){
  if(treeSheet.hidden)return;
  treeSheet.hidden=true;treeSheet.querySelector('.tree-sheet-body').replaceChildren();
  if(restoreFocus)treeOpen.focus({preventScroll:true});
}
treeOpen.onclick=openTreeSheet;
document.getElementById('treeClose').onclick=()=>closeTreeSheet();
treeSheet.onclick=ev=>{if(ev.target===treeSheet)closeTreeSheet();};
document.addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!treeSheet.hidden){ev.preventDefault();closeTreeSheet();}});
document.fonts?.ready.then(()=>document.querySelectorAll('.htree').forEach(layoutHistoryTree));

function updateNavigation(){
  const e=ENTRIES[cur];
  if(isHistory(e)){
    const option=[...mobileToc.options].find(o=>o.dataset.id===e.id&&sceneIndex>=+o.dataset.from&&sceneIndex<=+o.dataset.to);
    if(option)mobileToc.value=option.value;
    const era=historyEra(e,sceneIndex);
    document.getElementById('entryEyebrow').textContent=`${era.name} · 第${['一','二','三','四','五','六','七','八','九','十'][e.ch]}章`;
    toc.querySelectorAll('.era').forEach(row=>row.classList.toggle('active-era',row.dataset.era===era.id));
    // A newly reached section off the chosen line brings its own line along; switching lines in place does not.
    const s=currentStation();if(s&&s.key!==lastStationKey){lastStationKey=s.key;syncTreeLine();}
  }else mobileToc.value=e.id;
  toc.querySelectorAll('.chip').forEach(b=>{
    const on=b.dataset.id===e.id&&(!isHistory(e)||(sceneIndex>=+b.dataset.from&&sceneIndex<=+b.dataset.to));b.classList.toggle('on',on);
    if(on)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');
    if(on&&!keepTreeScroll&&b.getClientRects().length)b.scrollIntoView({block:'nearest'});
  });
  markTreeCurrent();
  // History steps along the chosen line; geography steps through the list.
  const posEl=document.getElementById('pos');
  if(isHistory(e)){
    const line=lineStations(treeLine),pos=line.findIndex(s=>s.key===currentStation()?.key),name=BRANCH[treeLine].name;
    document.getElementById('prev').disabled=!lineNeighbor(-1);document.getElementById('next').disabled=!lineNeighbor(1);
    posEl.textContent=pos>=0?`${pos+1} / ${line.length}`:`– / ${line.length}`;
    posEl.title=pos>=0?`${name}：第 ${pos+1} 站，共 ${line.length} 站`:`当前条目不在“${name}”上；↑↓ 沿这条线前后移动`;
    return;
  }
  const items=navigationRows(),pos=items.findIndex(b=>b.classList.contains('on'));
  document.getElementById('prev').disabled=pos<=0;
  document.getElementById('next').disabled=pos===items.length-1;
  posEl.textContent=`${pos+1} / ${items.length}`;posEl.title='';
}

function legendHTML(e){
  if(!e.legend)return '';
  return e.legend.map(([kind,c,t])=>{
    if(kind==='seal')return `<div><s class="seal">老</s>${t}</div>`;
    if(kind==='site')return `<div><s class="dot" style="--c:${c};border-radius:1px;transform:rotate(45deg);width:9px;height:9px"></s>${t}</div>`;
    if(kind==='mdot')return `<div><s class="dot" style="background:#f6eedd;box-shadow:0 0 0 1.5px #6b6b6b;width:8px;height:8px"></s>${t}</div>`;
    if(kind==='cat')return `<div><s style="width:auto;padding:0 3px;background:#235f93;color:#fff;font-size:10px;line-height:14px;font-family:var(--latin);margin:0 2px">Ⅰ</s>${t}</div>`;
    return `<div><s class="${kind}" style="--c:${c}"></s>${t}</div>`;
  }).join('');
}

function viewportPadding(){
  const small=matchMedia('(max-width:820px)').matches;
  const shortLandscape=matchMedia('(max-width:820px) and (max-height:520px) and (orientation:landscape)').matches;
  const folded=reader.classList.contains('collapsed');
  const hasScenes=!sceneRail.hidden;
  if(shortLandscape)return {paddingTopLeft:[18,48],paddingBottomRight:[folded?18:reader.getBoundingClientRect().width+22,hasScenes?98:30]};
  if(small){
    return {paddingTopLeft:[18,65],paddingBottomRight:[18,reader.getBoundingClientRect().height+(hasScenes?115:38)]};
  }
  return {paddingTopLeft:[28,58],paddingBottomRight:[folded?28:reader.getBoundingClientRect().width+42,hasScenes?119:60]};
}
function focusBounds(bounds,animate=true,maxZoom=8){
  const opts={...viewportPadding(),maxZoom};
  if(animate&&!reduceMotion)map.flyToBounds(L.latLngBounds(bounds),{...opts,duration:.8});
  else map.fitBounds(L.latLngBounds(bounds),{...opts,animate:false});
}
function fit(e,animate){const s=activeScene(e);focusBounds(s.view||e.view,animate,s.fitZoom||e.fitZoom||8);}

function setReaderCollapsed(collapsed,{save=true,refit=true}={}){
  reader.classList.toggle('collapsed',collapsed);readerBody.hidden=collapsed;
  readerToggle.setAttribute('aria-expanded',String(!collapsed));
  readerToggle.textContent=collapsed?'展开 ＋':'收起 −';
  readerToggle.title=collapsed?'展开完整说明与参考链接':'收起说明，留出更多地图空间';
  if(save){try{localStorage.setItem('agora-atlas-reader-collapsed',String(collapsed));}catch{}}
  if(!collapsed&&cur>=0)scrollSceneText(false);
  if(refit&&cur>=0)fit(ENTRIES[cur],true);
}
readerToggle.onclick=()=>setReaderCollapsed(!reader.classList.contains('collapsed'));
let initialCollapsed=false;
try{initialCollapsed=localStorage.getItem('agora-atlas-reader-collapsed')==='true';}catch{}
setReaderCollapsed(initialCollapsed,{save:false,refit:false});
document.getElementById('legendBox').open=!matchMedia('(max-width:820px)').matches;

function renderScenes(e){
  const multi=hasScenes(e);sceneRail.hidden=!multi;
  document.body.classList.toggle('has-scenes',multi);
  if(!multi){sceneRail.replaceChildren();return;}
  sceneRail.innerHTML='<span class="scene-rail-label" title="左右方向键切换地图事件">地图<br>事件 ↔</span><div class="scene-buttons" aria-label="切换历史地图事件"></div>';
  const buttons=sceneRail.querySelector('.scene-buttons');
  e.scenes.forEach((s,i)=>{
    const b=document.createElement('button');b.dataset.scene=i;b.className=i===sceneIndex?'on':'';
    b.setAttribute('aria-pressed',String(i===sceneIndex));b.title=s.note;
    b.innerHTML=`<small>${s.date}</small>${s.title}`;b.onclick=()=>{keepTreeScroll=true;try{go(e.id,{scene:i});}finally{keepTreeScroll=false;}};buttons.appendChild(b);
  });
  const on=buttons.children[sceneIndex];
  if(on)buttons.scrollLeft=Math.max(0,on.offsetLeft-buttons.offsetLeft-(buttons.clientWidth-on.offsetWidth)/2);
  card.querySelectorAll('.scene-passage').forEach(p=>{
    const on=+p.dataset.sceneText===sceneIndex;p.classList.toggle('current',on);
    if(on){p.id='sceneContext';p.setAttribute('aria-current','step');}
    else{p.removeAttribute('id');p.removeAttribute('aria-current');}
  });
  document.getElementById('sceneContext')?.appendChild(document.getElementById('peopleCards'));
  renderFigures(e);
}

function scrollReaderTo(element,animate=true){
  if(!element||readerBody.hidden)return;
  const top=readerBody.scrollTop+element.getBoundingClientRect().top-readerBody.getBoundingClientRect().top-12;
  readerBody.scrollTo({top:Math.max(0,top),behavior:animate&&!reduceMotion?'smooth':'instant'});
}
function scrollSceneText(animate=true){scrollReaderTo(document.getElementById('sceneContext'),animate);}

function renderFigures(e){
  const host=document.getElementById('peopleCards');if(!host)return;
  const people=FIGURE_SCENES[e.id+'/'+sceneIndex]||[];
  host.hidden=!people.length;
  if(!people.length){host.replaceChildren();return;}
  host.innerHTML=`<div class="people-heading"><h3>此时的人物与小事</h3><span>点开阅读 · ${people.length}</span></div><div class="people-grid"></div>`;
  const grid=host.querySelector('.people-grid');
  for(const item of people){
    const p=FIGURES[item.id],place=FIGURE_PLACES[item.place||p.place];
    const card=document.createElement('details');card.className='person-card'+(p.main?' main-line':'');card.dataset.person=item.id;card.setAttribute('name','atlas-figures');
    card.innerHTML=`<summary><span class="person-when">${item.when}</span><strong>${p.name}</strong><span class="person-en">${p.en}</span><span class="person-life">${p.life}</span><span class="person-event">${item.event}</span><span class="person-expand" aria-hidden="true"></span></summary>
      <div class="person-detail"><p class="person-relation">${p.relation}</p><p>${item.note}</p><p>${p.bio}</p>
      <button type="button" class="person-map">定位：${place.name} ↗</button>
      <div class="person-sources">${p.sources.map(([label,url])=>`<a href="${url}" target="_blank" rel="noopener noreferrer">${label} ↗</a>`).join('')}</div></div>`;
    card.querySelector('.person-map').onclick=()=>focusFigure(item);
    grid.appendChild(card);
  }
}

function focusFigure(item){
  const p=FIGURES[item.id],place=FIGURE_PLACES[item.place||p.place];
  const selectedEntry=cur,selectedScene=sceneIndex;
  const open=()=>{
    if(cur!==selectedEntry||sceneIndex!==selectedScene)return;
    const padding=viewportPadding();
    if(matchMedia('(max-width:820px) and (max-height:520px) and (orientation:landscape)').matches)padding.paddingTopLeft[0]=52;
    const availableHeight=map.getSize().y-padding.paddingTopLeft[1]-padding.paddingBottomRight[1];
    const availableWidth=map.getSize().x-padding.paddingTopLeft[0]-padding.paddingBottomRight[0];
    L.popup({className:'parch',maxWidth:Math.max(130,Math.min(240,availableWidth-42)),maxHeight:Math.max(70,Math.min(220,availableHeight-35)),closeButton:true,
      autoPanPaddingTopLeft:padding.paddingTopLeft,autoPanPaddingBottomRight:padding.paddingBottomRight})
      .setLatLng(place.ll).setContent(`<b>${item.event}</b><span class="popup-en">${p.name} · ${p.en}</span><em>${item.when} · ${place.name} / ${place.en}</em>${place.note}`).openOn(map);
  };
  const bounds=place.view||L.latLng(place.ll).toBounds(100000);
  map.closePopup();
  if(reduceMotion){focusBounds(bounds,false,7);open();}
  else{map.once('moveend',open);focusBounds(bounds,true,7);}
}

function renderCard(e){
  const historical=isHistory(e),multi=hasScenes(e);
  reader.style.setProperty('--c',e.c);
  document.getElementById('entryEyebrow').textContent=historical?`SECTOR ${e.ch+1} · ${e.period}`:isTopic(e)?`动力专题 · 第 ${e.num} 题`:CH[e.ch]+' · 地理概念';
  document.getElementById('entryTitle').textContent=e.title;
  document.getElementById('entryEnglish').textContent=e.en;
  const refs=(e.sources||[]).map(s=>`<a href="${s.url}" target="_blank" rel="noopener noreferrer">${s.label}</a>`).join('');
  card.innerHTML=(multi?'':`<div class="orig">${e.sub}</div>`)+e.html+(multi?'<section id="peopleCards" aria-label="本阶段人物与小事" hidden></section>':'')+(refs?`<details class="sources"><summary>史料与延伸阅读 <span>＋</span></summary>${refs}</details>`:'');
  if(multi)card.querySelectorAll('[data-scene-text]').forEach(p=>{
    const index=+p.dataset.sceneText,s=e.scenes[index];
    const block=document.createElement('section');block.className='scene-passage';block.dataset.sceneText=index;
    const title=document.createElement('h3');title.className='passage-title';title.id=`${e.id}-text-${index}`;
    title.innerHTML=`<small>${s.date}</small>${s.title}`;block.setAttribute('aria-labelledby',title.id);
    p.replaceWith(block);p.removeAttribute('data-scene-text');block.append(title,p);
    for(const m of e.moments.filter(m=>m.scene===index)){
      const aside=document.createElement('aside');aside.className='moment';aside.setAttribute('aria-label','名场面：'+m.name);
      aside.innerHTML=`<span class="moment-tag">${m.name}<i>${m.en}</i></span>${m.text}`;block.append(aside);
    }
    for(const b of e.boxes.filter(b=>b.scene===index)){
      const aside=document.createElement('aside');aside.className='box';aside.setAttribute('aria-label','小专栏：'+b.name);
      aside.innerHTML=`<span class="box-tag">${b.name}<i>${b.en}</i></span>${b.text}`;block.append(aside);
    }
  });
  readerBody.scrollTo({top:0,behavior:'instant'});
  card.querySelectorAll('[data-go]').forEach(a=>{
    a.setAttribute('href','#'+a.dataset.go);a.onclick=ev=>{
      ev.preventDefault();go(a.dataset.go);
      if(a.dataset.personTarget){
        const person=document.querySelector(`[data-person="${a.dataset.personTarget}"]`);
        if(person){person.open=true;scrollReaderTo(person);}
      }
    };
  });
  card.querySelectorAll('[data-bounds]').forEach(b=>b.onclick=()=>focusBounds(JSON.parse(b.dataset.bounds)));
  card.querySelectorAll('a[target="_blank"]').forEach(a=>a.rel='noopener noreferrer');
  if(e.id==='alexander')buildTimeline();
}

function go(id,opts={}){
  if(typeof id==='string'&&id.includes('/')){
    const bits=id.split('/');id=bits[0];opts={...opts,scene:Number(bits[1])};
  }
  const i=typeof id==='number'?id:ENTRIES.findIndex(e=>e.id===id);
  if(i<0||i>=ENTRIES.length)return;
  const e=ENTRIES[i];
  const selected=hasScenes(e)&&Number.isInteger(opts.scene)&&opts.scene>=0&&opts.scene<e.scenes.length?opts.scene:0;
  if(i===cur&&selected===sceneIndex){if(hasScenes(e))scrollSceneText();return;}
  const first=cur<0,entryChanged=cur!==i;
  cur=i;sceneIndex=selected;
  const mode=entryMode(e);
  if(mode!==viewMode||!toc.childElementCount){viewMode=mode;renderToc();}
  lastEntry[mode]=e.id+(selected?'/'+selected:'');
  if(pending){map.off('moveend',pending);clearTimeout(pending.t);pending=null;}
  map.stop();map.closePopup();
  map.removeLayer(group);group=L.featureGroup().addTo(map);pinIndex={};narrativeLayer=null;
  forced.forEach(id=>baseMarkers[id]?.getElement()?.firstChild.classList.remove('force'));forced=[];
  if(entryChanged)renderCard(e);
  renderScenes(e);
  if(hasScenes(e))scrollSceneText(!entryChanged);
  const scene=activeScene(e);
  legend.innerHTML=legendHTML(scene.legend?scene:e);
  document.getElementById('legendBox').hidden=!legend.innerHTML;
  updateNavigation();
  fit(e,!first);
  Object.entries(baseMarkers).forEach(([id,m])=>m.getElement()?.firstChild.classList.toggle('hidden',(e.hide||[]).includes(id)));
  Object.entries(islandMarkers).forEach(([id,m])=>m.getElement()?.firstChild.classList.toggle('hidden',(e.hideIslands||[]).includes(id)));
  riverMarkers.forEach(({t,m})=>{
    const el=m.getElement()?.firstChild;if(!el)return;
    el.classList.toggle('force',e.id==='nile'&&/尼罗河|阿特巴拉/.test(t));
    el.classList.toggle('hidden',e.id==='jordan'&&t==='约旦河');
  });
  let drawn=false;
  const drawNow=()=>{
    if(drawn||cur!==i||sceneIndex!==selected)return;drawn=true;
    if(pending===drawNow){map.off('moveend',drawNow);clearTimeout(drawNow.t);pending=null;}
    scene.draw(makeCtx(e));
    forced=e.show||[];forced.forEach(id=>baseMarkers[id]?.getElement()?.firstChild.classList.add('force'));
  };
  if(first||reduceMotion)drawNow();
  else{pending=drawNow;map.once('moveend',drawNow);drawNow.t=setTimeout(drawNow,1200);}
  if(!opts.noHash)history.replaceState(null,'','#'+e.id+(selected?'/'+selected:''));
}

function buildTimeline(){
  const ol=document.getElementById('tl');
  const rows=ALEX_STOPS.map((s,i)=>({i,name:s[0],when:s[1],note:s[4],battle:s[5]==='battle',ll:[s[2],s[3]]}));
  ALEX_LATE.forEach(x=>rows.push({i:x[2],name:x[0],when:x[1],note:x[3],battle:false,ll:[ALEX_STOPS[x[2]][2],ALEX_STOPS[x[2]][3]],late:true}));
  ol.innerHTML=rows.map((r,k)=>`<li data-k="${k}" tabindex="0" role="button"><span class="n${r.battle?' b':''}">${r.i+1}</span><em>${r.when}</em><b>${r.name}</b>　${r.note}</li>`).join('');
  ol.querySelectorAll('li').forEach(li=>li.onclick=()=>{
    const r=rows[+li.dataset.k];ol.querySelectorAll('li').forEach(x=>x.classList.toggle('on',x===li));
    const open=()=>pinIndex['a'+r.i]?.openPopup();
    const bounds=L.latLng(r.ll).toBounds(180000);
    if(reduceMotion){focusBounds(bounds,false,6.5);open();}
    else{map.once('moveend',open);focusBounds(bounds,true,6.5);}
  });
  ol.onkeydown=ev=>{if(ev.key==='Enter'||ev.key===' '){ev.preventDefault();ev.target.closest('li')?.click();}};
}

function stepEntry(delta){
  if(isHistory(ENTRIES[cur])){const target=lineNeighbor(delta);if(target)go(target.id,{scene:target.from});return;}
  const items=navigationRows(),target=items[items.findIndex(b=>b.classList.contains('on'))+delta];
  if(target)go(target.dataset.id,{scene:Number(target.dataset.from)||0});
}
function stepScene(delta){
  const e=ENTRIES[cur];
  if(hasScenes(e)){
    const next=sceneIndex+delta;
    if(next>=0&&next<e.scenes.length)go(e.id,{scene:next});
  }else if(e.id==='alexander'){
    const rows=[...document.querySelectorAll('#tl li')],current=rows.findIndex(li=>li.classList.contains('on'));
    const next=current<0?0:Math.max(0,Math.min(rows.length-1,current+delta));
    rows[next]?.click();scrollReaderTo(rows[next]);
  }
}
document.getElementById('prev').onclick=()=>stepEntry(-1);
document.getElementById('next').onclick=()=>stepEntry(1);
document.getElementById('tFit').onclick=()=>{map.closePopup();fit(ENTRIES[cur],true);};
document.addEventListener('keydown',ev=>{
  if(ev.defaultPrevented||ev.isComposing||ev.altKey||ev.ctrlKey||ev.metaKey||ev.shiftKey)return;
  if(ev.target.isContentEditable||ev.target.closest('input,textarea,select,[role="textbox"],[role="separator"]'))return;
  const vertical=ev.key==='ArrowUp'||ev.key==='ArrowDown';
  const horizontal=ev.key==='ArrowLeft'||ev.key==='ArrowRight';
  if(!vertical&&!horizontal)return;
  if(horizontal&&!hasScenes(ENTRIES[cur])&&ENTRIES[cur].id!=='alexander')return;
  const focusToc=ev.target.closest('#toc'),focusScenes=ev.target.closest('#sceneRail');
  ev.preventDefault();ev.stopPropagation();
  if(vertical)stepEntry(ev.key==='ArrowDown'?1:-1);else stepScene(ev.key==='ArrowRight'?1:-1);
  if(focusToc)toc.querySelector('.chip.on')?.focus({preventScroll:true});
  if(ev.target.closest('#treeSheet'))treeSheet.querySelector('.tree-item.on')?.focus({preventScroll:true});
  if(focusScenes)sceneRail.querySelector('button.on')?.focus({preventScroll:true});
},true);
window.addEventListener('hashchange',()=>{
  const raw=location.hash.slice(1)||'history-migration';
  go(ENTRIES.some(e=>e.id===raw.split('/')[0])?raw:'history-migration',{noHash:true});
});
/* The left column can be dragged wider (or narrower); the tree re-lays itself out and the map takes the rest.
   Double-click the edge to restore; the width is remembered per browser. */
const side=document.getElementById('side'),SIDE_KEY='agora-atlas-side-width';
const sideGrip=document.createElement('div');sideGrip.id='sideGrip';sideGrip.tabIndex=0;
for(const [k,v] of Object.entries({role:'separator','aria-orientation':'vertical','aria-controls':'side','aria-label':'拖动调整左栏宽度（双击复原）',title:'拖动调整宽度 · 双击复原','aria-valuemin':200}))sideGrip.setAttribute(k,v);
side.appendChild(sideGrip);
const sideMax=()=>Math.round(Math.max(260,Math.min(640,innerWidth*.5)));
function applySideWidth(w){
  if(w===null)document.documentElement.style.removeProperty('--side');
  else document.documentElement.style.setProperty('--side',Math.round(Math.max(200,Math.min(sideMax(),w)))+'px');
  sideGrip.setAttribute('aria-valuemax',sideMax());sideGrip.setAttribute('aria-valuenow',Math.round(side.getBoundingClientRect().width));
}
function setSideWidth(w,{save=true,final=true}={}){
  applySideWidth(w);
  toc.querySelectorAll('.htree').forEach(layoutHistoryTree);map.invalidateSize({pan:false});
  if(final&&cur>=0){fit(ENTRIES[cur],false);toc.querySelector('.chip.on')?.scrollIntoView({block:'nearest'});}
  if(save){try{if(w===null)localStorage.removeItem(SIDE_KEY);else localStorage.setItem(SIDE_KEY,String(Math.round(side.getBoundingClientRect().width)));}catch{}}
}
sideGrip.addEventListener('pointerdown',ev=>{
  if(ev.button!==0)return;ev.preventDefault();sideGrip.setPointerCapture(ev.pointerId);document.body.classList.add('resizing-side');
  const left=side.getBoundingClientRect().left;let frame=0,x=ev.clientX;
  const move=e=>{x=e.clientX;if(!frame)frame=requestAnimationFrame(()=>{frame=0;setSideWidth(x-left,{save:false,final:false});});};
  const up=e=>{
    sideGrip.removeEventListener('pointermove',move);sideGrip.removeEventListener('pointerup',up);sideGrip.removeEventListener('pointercancel',up);
    cancelAnimationFrame(frame);document.body.classList.remove('resizing-side');setSideWidth(e.clientX-left);
  };
  sideGrip.addEventListener('pointermove',move);sideGrip.addEventListener('pointerup',up);sideGrip.addEventListener('pointercancel',up);
});
sideGrip.ondblclick=()=>setSideWidth(null);
sideGrip.onkeydown=ev=>{
  const w=side.getBoundingClientRect().width,step=ev.shiftKey?64:16;
  const target={ArrowLeft:w-step,ArrowRight:w+step,Home:200,End:sideMax()}[ev.key];
  if(target!==undefined){ev.preventDefault();setSideWidth(target);}
  else if(ev.key==='Enter'){ev.preventDefault();setSideWidth(null);}
};
try{const saved=Number(localStorage.getItem(SIDE_KEY));if(saved>0)applySideWidth(saved);}catch{}
applySideWidth(document.documentElement.style.getPropertyValue('--side')?parseFloat(document.documentElement.style.getPropertyValue('--side')):null);
map.invalidateSize({pan:false});

let resizeTimer;
window.addEventListener('resize',()=>{
  clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{
    const custom=document.documentElement.style.getPropertyValue('--side');if(custom)applySideWidth(parseFloat(custom));
    map.invalidateSize({pan:false});document.querySelectorAll('.htree').forEach(layoutHistoryTree);
    if(cur>=0){fit(ENTRIES[cur],false);scrollSceneText(false);}
  },150);
});
zoomClasses();
go(location.hash.slice(1)||'history-migration');
if(cur<0)go('history-migration');

// Full-size dynasty family/succession sheet overlaid on the map stage when a .kin-open button or svg.kin-tree is clicked.
const kinSheet=document.createElement('div');kinSheet.id='kinSheet';kinSheet.hidden=true;
kinSheet.innerHTML=`<div class="kin-sheet-panel" role="dialog" aria-modal="true" aria-labelledby="kinSheetTitle">
  <header><div><b id="kinSheetTitle">王朝世系表</b><span id="kinSheetSub"></span></div><button type="button" id="kinClose">关闭 ×</button></header>
  <div class="kin-sheet-body"></div></div>`;
document.body.appendChild(kinSheet);
function openKinSheet(box){
  const btn=box.querySelector('.kin-open'),svg=box.querySelector('svg.kin-tree');if(!svg)return;
  document.getElementById('kinSheetTitle').textContent=btn?.dataset.kinTitle||box.querySelector('.box-tag')?.firstChild?.textContent||'王朝世系表';
  document.getElementById('kinSheetSub').textContent=btn?.dataset.kinSub||'当前王朝及以前全彩显示 · 后续王朝灰显';
  const body=kinSheet.querySelector('.kin-sheet-body');
  body.innerHTML=svg.outerHTML;
  const bAfter=box.querySelector('b:last-of-type');
  if(bAfter&&bAfter.nextSibling){
    const note=document.createElement('p');note.className='kin-sheet-note';
    note.innerHTML='<b>'+bAfter.textContent+'</b>'+bAfter.nextSibling.textContent;
    body.appendChild(note);
  }
  kinSheet.hidden=false;
}
document.getElementById('kinClose').onclick=()=>{kinSheet.hidden=true;};
kinSheet.onclick=ev=>{if(ev.target===kinSheet)kinSheet.hidden=true;};
addEventListener('keydown',ev=>{if(ev.key==='Escape'&&!kinSheet.hidden)kinSheet.hidden=true;});
card.addEventListener('click',ev=>{
  const trigger=ev.target.closest('.kin-open,svg.kin-tree');
  if(trigger){const box=trigger.closest('.box');if(box)openKinSheet(box);}
});
