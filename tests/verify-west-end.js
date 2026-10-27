const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const shots=path.join(__dirname,'shots-west-end');require('node:fs').mkdirSync(shots,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// 老无 2026-10-25: on past the Vandal sack of 455 — the empress and her two daughters taken to Africa; the emperors after Maximus;
// why Leo I sent a general who threatened his own throne to rule the West; the war plan (Visigoths against the Suebi, a fleet against
// the Vandals), the joint fleet of 468, the Visigoths spreading at once, the last defeat, the regalia sent to Zeno; then a short summary
// set beside the Sixteen Kingdoms (Romans ruling Romans for the barbarians; taxes kept in the East, land handed out in the West).
const ID='history-empire-west-end';
// 老无's theses, woven in where they belong in time and bolded.
const BOLD=[[ID+'/0','盖萨里克把先皇瓦伦提尼安三世的皇后莉基尼娅·欧多克西娅和两个女儿都掳到了北非'],
 [ID+'/0','大女儿欧多基娅嫁给了盖萨里克的长子胡内里克'],
 [ID+'/0','过了七年，462年东罗马皇帝利奥一世出钱赎人，她才和母亲被送到君士坦丁堡'],
 [ID+'/1','北边与西哥特人结盟，用以夷制夷的办法让西哥特人去打苏维汇人，自己则南征北非的汪达尔人'],
 [ID+'/2','西罗马的蛮族和地主都还奉东罗马为宗主、为正统'],
 [ID+'/3','利奥把这个在国内能威胁自己皇位的军头派到西罗马当皇帝'],[ID+'/3','来了之后很快稳住了局面'],
 [ID+'/3','468年他和利奥一世联合组成一支大舰队，在北非被汪达尔人打败'],
 [ID+'/4','舰队一败，北边的西哥特人马上就开始扩张'],[ID+'/4','471年安提米乌斯组织起意大利的一支军队，再与西哥特人作战，又败了'],
 [ID+'/5','这位蛮族首领没有称帝，而是把皇帝的衣冠和仪仗送到东罗马，当时东罗马的皇帝已经是芝诺，这标志着西罗马的灭亡'],
 [ID+'/6','蛮族入主西部，学罗马人的活法，用罗马人治罗马人'],[ID+'/6','这就像五胡十六国时汉人士人帮胡人君主治理北方'],
 [ID+'/6','财政上，东罗马还保持着完整的税收制度；西部在蛮族割据中变成了“土地财政”，像中国先秦封建那样分土地，而不是收税'],
 [ID+'/6','这为后来中世纪西欧的封建制打下了基础']];
// Facts set straight in plain text beside them: the war plan was Majorian's (457—461), Leo's man was Anthemius (467—472);
// the army beaten in 471 was led by his son, and he himself was killed by Ricimer in 472, four emperors before 476;
// the younger daughter was already promised to Olybrius; Nepos traded the Auvergne for Provence; the equal-field law is 485.
const FIXES=[[ID+'/1','457年马约里安称帝'],[ID+'/1','460年盖萨里克买通内奸，把船烧在港里'],[ID+'/3','利奥挑中安提米乌斯'],
 [ID+'/4','儿子安提米奥卢斯'],[ID+'/4','皇帝本人没死在这一仗'],[ID+'/4','472年李希梅尔带蛮族兵围罗马五个月'],
 [ID+'/5','473年扶禁卫军长格利凯里乌斯'],[ID+'/5','474年把格利凯里乌斯废去当萨洛纳主教'],[ID+'/5','俄瑞斯忒斯立十来岁的儿子罗慕路斯'],
 [ID+'/0','已许配（一说已嫁）罗马元老奥利布里乌斯'],[ID+'/2','跟东边的阿斯帕尔一样当不了皇帝'],
 ['history-west-kingdoms/1','拿克莱蒙所在的奥弗涅向他换回普罗旺斯'],['history-china-sixteen-kingdoms/0','485年起冯太后与孝文帝颁均田']];
const GONE=[['history-west-kingdoms/1','把普罗旺斯也让给了他'],['history-china-sixteen-kingdoms/0','471年起孝文帝推行汉化'],
 ['history-empire-west-fall/7','476年奥多亚克废掉罗慕路斯']];
const SCENES=[['455—462年','两位公主：一嫁汪达尔，一嫁元老'],['455—461年','北联西哥特、南征汪达尔'],['461—467年','傀儡与正统：请东边派皇帝'],
 ['467—468年','利奥送来的皇帝与联合舰队'],['468—472年','西哥特扩张与拥立者的内战'],['472—476年','走马灯与冠服东归'],['476年以后','以罗马人治罗马人，从收税到分地']];
const MOMENTS=[[0,'“汪达尔主义”'],[1,'染黑金发进敌营'],[2,'图尔奈墓里的金蜜蜂'],[4,'穿皮袄的哥特人与爱激动的加拉太人'],[5,'十八骑破围'],[5,'末代皇帝的名字']];
const CARDS=[[ID+'/0','gaiseric',/上帝发怒/],[ID+'/1','majorian',/五十磅黄金/],[ID+'/2','ricimer',/两个王国/],[ID+'/2','childeric-i',/金币掰成两半/],[ID+'/3','anthemius',/携手/],
 [ID+'/5','odoacer',/两头应付.*尼波斯/],[ID+'/6','sidonius',/乐得输给他/],['history-empire-west-fall/7','augustine',/上帝之城/]];
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 try{
  for(const [width,height,label] of [[1440,960,'desktop'],[390,844,'390']]){
   const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height});
   await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
   await page.setRequestInterception(true);page.on('request',r=>/^https?:/.test(r.url())?r.abort():r.continue());
   await page.goto(pathToFileURL(target).href+'#'+ID,{waitUntil:'domcontentloaded'});await page.evaluate(()=>document.fonts.ready);await wait(150);
   const r=await page.evaluate(({ID,BOLD,FIXES,GONE})=>{
    const E=id=>HISTORY_ENTRIES.find(e=>e.id===id),para=(id,i)=>{const d=document.createElement('div');d.innerHTML=E(id).html;return [...d.querySelectorAll('[data-scene-text]')].at(+i);};
    const stripEn=s=>s.replace(/（[A-Za-z][^）]*）/g,'');
    const e=E(ID),wf=E('history-empire-west-fall'),all=x=>[x.html,...x.moments.map(m=>m.text),...x.boxes.map(b=>b.text)].join(' ');
    const ids=HISTORY_ENTRIES.map(x=>x.id);
    return {head:[e.ch,e.title,e.short,e.period,e.c===HC.rome],scenes:e.scenes.map(s=>[s.date,s.title]),
     order:ids.slice(ids.indexOf('history-empire-west-fall'),ids.indexOf('history-empire-west-fall')+3),
     wf:[wf.period,wf.scenes.length,wf.scenes.at(-1).date,wf.scenes.at(-1).title,wf.moments.map(m=>m.name)],
     rows:[TREE_ROWS['history-empire-west-fall/0'],TREE_ROWS[ID+'/0']],
     romeLine:lineStations('rome').map(s=>s.id).slice(-3),
     era:HISTORY_ERAS.find(x=>x.id==='empire-west').items.map(i=>i[0]),
     bold:BOLD.map(([k,w])=>{const [id,i]=k.split('/');return [k,stripEn(para(id,i).innerHTML).includes('<strong>'+w)];}),
     fixes:FIXES.map(([k,w])=>{const [id,i]=k.split('/');const p=para(id,i);return [k,stripEn(p.textContent).includes(w)&&!stripEn(p.innerHTML).includes('<strong>'+w)];}),
     gone:GONE.filter(([k,w])=>{const [id,i]=k.split('/');return stripEn(para(id,i).textContent).includes(w);}).map(x=>x[0]),
     filler:/新皇帝叫什么|叫什么来的|满族|黄袍|不对，应该是|嗯，|说一下原因|简单交代一下/.test(all(e)),
     china:['萧道成','君子营','张宾','王猛','均田','刘渊'].filter(w=>!stripEn(all(e)).includes(w)),
     moments:e.moments.map(m=>[m.scene,m.name]),
     box:e.boxes.map(b=>[b.scene,b.name,b.text.split('<br>').length,['用谁治理','两套规矩','借谁的名分','收税还是分地','结局不同'].every(w=>b.text.includes(w))]),
     chars:[...[ID,'history-empire-west-fall','history-west-kingdoms'].flatMap(id=>{const d=document.createElement('div');d.innerHTML=E(id).html;
      return [...d.querySelectorAll('[data-scene-text]')].map((p,i)=>[id+'/'+i,stripEn(p.textContent).replace(/\s/g,'').length,300]);}),
      ...(()=>{const d=document.createElement('div');d.innerHTML=E('history-china-sixteen-kingdoms').html;return [...d.querySelectorAll('[data-scene-text]')].map((p,i)=>['history-china-sixteen-kingdoms/'+i,stripEn(p.textContent).replace(/\s/g,'').length,230]);})()],
     en:['盖萨里克','李希梅尔（Ricimer）','马约里安（Majorian）','阿维图斯（Avitus）','安提米乌斯（Anthemius）','奥多亚克（Odoacer）','尼波斯（Julius Nepos）','皮亚琴察（Placentia）','托尔托纳（Dertona）'].filter(s=>!all(e).includes(s)),
     links:e.sources.map(s=>s.url).filter(u=>!/^https:\/\//.test(u)),dupLinks:e.sources.length-new Set(e.sources.map(s=>s.url)).size,
     regions:['eWest460','eVisigoths460','eDalmatia460'].filter(k=>!GEO.regions[k]),
     topic:TOPIC_ENTRIES.filter(x=>(x.html||'').includes('data-go="'+ID+'/6"')).map(x=>x.id),
     sourcesN:e.sources.length};
   },{ID,BOLD,FIXES,GONE});
   assert.deepEqual(r.head,[5,'西罗马的终结（下）：二十一年八个皇帝','西罗马的终结（下）','455—476年',true]);
   assert.deepEqual(r.scenes,SCENES);
   assert.deepEqual(r.order,['history-empire-west-fall',ID,'history-empire-leo'],'reading order: after 西罗马的终结, before 利奥王朝');
   assert.deepEqual(r.wf,['395—455年',8,'454—455年','手刃权臣、汪达尔劫城与道统衰落',['不译《列王纪》','替罗马守河的法兰克人','名叫罗马的鸡','金发王子与卡塔隆前夜','左手砍了右手：手刃权臣的皇帝']]);
   assert.deepEqual(r.rows,[['rome',395,455],['rome',455,476]]);
   assert.deepEqual(r.romeLine,['history-empire-theodosius','history-empire-west-fall',ID],'the last station of 罗马 before the fork at 476');
   assert.deepEqual(r.era,['history-empire-valentinian','history-empire-theodosius','history-empire-west-fall',ID]);
   for(const [k,ok] of r.bold)assert.ok(ok,k+' lacks 老无’s thesis in bold');
   for(const [k,ok] of r.fixes)assert.ok(ok,k+' lacks the plain-text correction');
   assert.deepEqual(r.gone,[],'old wording left');assert.equal(r.filler,false,'conversational filler copied into the prose');
   assert.deepEqual(r.china,[],'Chinese parallels missing');
   assert.deepEqual(r.moments,MOMENTS);
   assert.deepEqual(r.box,[[6,'蛮族王国与五胡十六国',5,true]]);
   for(const [k,n,max] of r.chars)assert.ok(n<=max,k+' '+n+' > '+max);
   assert.deepEqual(r.en,[],'English names on first appearance');
   assert.deepEqual(r.links,[]);assert.equal(r.dupLinks,0);assert.ok(r.sourcesN>=15);
   assert.deepEqual(r.regions,[]);
   // The topic on why China had no plebeian–patrician tug-of-war cites the West turning feudal: it now points at the summary scene.
   assert.deepEqual(r.topic,['topic-china-arithmetic']);
   // The reader: cards, the box, the eyebrow, every scene drawn inside its view, no overflow.
   for(const [hash,id,re] of CARDS){
    await page.evaluate(h=>{const [id,s]=h.split('/');go(id,{scene:+s});},hash);await wait(60);
    assert.match(await page.$eval(`[data-person="${id}"]`,e=>e.textContent),re,hash+' '+id);
   }
   await page.evaluate(id=>go(id,{scene:6}),ID);await wait(80);
   const box=await page.evaluate(()=>{const b=document.querySelector('#sceneContext .box');return b&&{tag:b.querySelector('.box-tag').firstChild.textContent,text:b.textContent};});
   assert.equal(box.tag,'蛮族王国与五胡十六国');for(const w of ['君子营','国人','刘渊','均田','589年'])assert.ok(box.text.includes(w),'box lacks '+w);
   assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),'罗马帝国：分治与西部的终结 · 第六章');
   for(let i=0;i<SCENES.length;i++){
    const s=await page.evaluate(({ID,i})=>{go(ID,{scene:i});const sc=activeScene(ENTRIES[cur]);
     return {pins:Object.keys(pinIndex).length,layers:group.getLayers().length,legend:legend.children.length,fits:map.getBounds().contains(L.latLngBounds(sc.view)),overflow:document.documentElement.scrollWidth>innerWidth};},{ID,i});
    await wait(120);
    assert.ok(s.layers>0&&s.legend>0&&!s.overflow,ID+'/'+i+' '+JSON.stringify(s));
    if(label==='desktop')assert.ok(s.pins>0&&s.fits,ID+'/'+i+' '+JSON.stringify(s));
    if(label==='390')await page.evaluate(()=>scrollSceneText(false));
    await page.screenshot({path:path.join(shots,`west-end_${i}-${label}.png`)});
   }
   // ↑↓ along 罗马: 西罗马的终结 → its sequel, which is the end of the line.
   await page.evaluate(()=>{selectTreeLine('rome');go('history-empire-west-fall');});
   await page.click('#next');assert.deepEqual(await page.evaluate(()=>[ENTRIES[cur].id,sceneIndex]),[ID,0]);
   assert.ok(await page.$eval('#next',e=>e.disabled),'end of the 罗马 line');
   if(label==='desktop'){
    await page.evaluate(id=>{selectTreeLine('rome');go(id);},ID);await page.click('#treeOpen');await wait(250);
    await page.evaluate(()=>treeSheet.querySelector('.tree-item.on')?.scrollIntoView({block:'center'}));await wait(150);
    await page.screenshot({path:path.join(shots,'tree-rome-1440.png')});await page.keyboard.press('Escape');
    const row=await page.$eval(`#toc .tree-item[data-key="${ID}/0"]`,e=>e.textContent);assert.match(row,/^西罗马的终结（下）Ⅵ · 455—476年$/);
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: 西罗马的终结（下） 455—476 — seven scenes after 西罗马的终结 (now 395—455) on 罗马, the last station before the fork; '
   +BOLD.length+' of 老无’s theses in bold where they belong in time, '+FIXES.length+' corrections in plain text (Majorian’s war plan, Anthemius’s son at Arles and Ricimer’s siege, the four emperors before 476, Placidia already promised, the Auvergne for Provence, the equal-field law in 485); '
   +'萧道成 and the Sixteen Kingdoms (box: 用谁治理, 两套规矩, 借谁的名分, 收税还是分地, 结局不同); five iconic moments; Odoacer’s card moved to 476 and five new people; three new teaching areas; ≤300 chars per scene; desktop and 390px; no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();}
})();
