const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const shots=path.join(__dirname,'shots-gregory');require('node:fs').mkdirSync(shots,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// 老无 2026-10-25 (night): on the 基督教 line, the rise of the Roman church after the Lombards. Big picture: the Franks to the north, the
// Lombards all round and nothing like the Ostrogoths with Constantinople, the emperor too far off; small picture: an able pope, a former
// official and a practical man. Inside: no children for the clergy so the estates stay together; the monks brought in; no hair-splitting.
// Outside: grain and plague when the government fails; new markets (pictures, old customs left standing at the frontier); the old market
// deepened (Alleluia, hope and salvation). Hence the church's growing hold. The church's half of 伦巴第人与教宗 scene 3 moves here.
const ID='history-faith-gregory';
const BOLD=[[ID+'/0','北边有法兰克'],[ID+'/0','周围是伦巴第人，跟东边远不像东哥特那么好'],[ID+'/0','东边的皇帝对剩下的几块地方鞭长莫及'],
 [ID+'/1','小背景是出了能干的教宗'],[ID+'/1','出身官员'],[ID+'/1','他是务实派'],
 [ID+'/2','对内先管资源：禁止教士生子，防止教产外流，形成资源池'],
 [ID+'/3','招安内部不服不忿的修道院势力'],[ID+'/3','好好学习就能进体制'],
 [ID+'/4','不钻语义的牛角尖，减少内耗'],
 [ID+'/5','政府失能，教会接过一部分政府职能'],
 [ID+'/6','锐意开发新市场'],[ID+'/6','画像传教效果好，就对画像开放'],[ID+'/6','传教前沿不硬禁旧俗'],
 [ID+'/7','深耕已有市场：多加哈利路亚这样的仪式，把希望和救赎做成凡人够得着的产品，多些互动，体验更好'],[ID+'/7','因此教会的控制力越来越大']];
// Set straight in plain text: in Gregory's day the rule was continence after ordination, and clerical marriage was declared void only in 1139;
// no examination, the pope picked his men; as a deacon he had argued the Three Chapters at length, and the shortcut later cost Honorius;
// the idols were smashed while the temples and feasts stayed; the Alleluia went into the Mass, and the chant named after him is Frankish.
const FIXES=[[ID+'/2','受职后不再同房'],[ID+'/2','教士结婚被宣布无效，要到1139年'],[ID+'/3','只是不考试，看读经和操守，由教宗挑人'],
 [ID+'/4','当执事时他替教宗写过长文'],[ID+'/4','681年第六次大公会议把他革除'],[ID+'/6','神庙不拆，只砸偶像'],[ID+'/6','拜可以禁，像不许砸'],
 [ID+'/7','他让弥撒里的哈利路亚唱到复活节期以外'],[ID+'/7','是750年前后法兰克人整理的']];
const SCENES=[['568—590年','大背景：皇帝鞭长莫及'],['573—590年','小背景：出身官员的教宗'],['590—604年','对内：不生孩子，攒成资源池'],['590—628年','对内：修士进了体制'],
 ['591—681年','对内：不钻牛角尖'],['590—604年','对外：城里的出纳'],['596—601年','对外：开发新市场'],['590—604年','对外：深耕老市场']];
const MOMENTS=[[2,'一匹劣马和五头好驴'],[3,'看门的人'],[5,'一小时倒下八十人'],[6,'不是盎格鲁人，是天使'],[6,'露天召见'],[7,'三十台弥撒']];
const CARDS=[[ID+'/1','gregory-great',/截了下来/],[ID+'/3','columbanus',/十七位/],[ID+'/6','augustine-canterbury',/回罗马/]];
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
   const r=await page.evaluate(({ID,BOLD,FIXES})=>{
    const E=id=>HISTORY_ENTRIES.find(e=>e.id===id),para=(id,i)=>{const d=document.createElement('div');d.innerHTML=E(id).html;return [...d.querySelectorAll('[data-scene-text]')].at(+i);};
    const stripEn=s=>s.replace(/（[A-Za-z][^）]*）/g,'');
    const e=E(ID),lb=E('history-west-lombards'),all=x=>[x.html,...x.moments.map(m=>m.text),...x.boxes.map(b=>b.text)].join(' ');
    const ids=HISTORY_ENTRIES.map(x=>x.id),at=ids.indexOf('history-faith-three-chapters');
    const chars=id=>{const d=document.createElement('div');d.innerHTML=E(id).html;return [...d.querySelectorAll('[data-scene-text]')].map((p,i)=>[id+'/'+i,stripEn(p.textContent).replace(/\s/g,'').length]);};
    const lb2=stripEn(para('history-west-lombards',2).textContent);
    return {head:[e.ch,e.title,e.short,e.period,e.c===HC.faith],scenes:e.scenes.map(s=>[s.date,s.title]),order:ids.slice(at,at+2),
     row:TREE_ROWS[ID+'/0'],faith:lineStations('faith').map(s=>s.key),
     era:HISTORY_ERAS.find(x=>x.id==='faith-medieval').items.map(i=>i[0]),
     // 伦巴第人与教宗 keeps the Lombards at the gates and points across; the letter, the mission, the angels and Gregory's card moved here.
     lombards:[lb2.includes('另见“基督教”主线'),/出纳|奥古斯丁|神庙|肯特/.test(lb2),lb2.includes('阿里乌尔夫'),lb2.includes('以西结书'),lb2.includes('省了两边多少血'),
      lb.moments.map(m=>[m.scene,m.name]),!!FIGURE_SCENES['history-west-lombards/2'],lb.sources.some(s=>/梅利图斯|君士坦蒂娜|盎格鲁男孩|传教团/.test(s.label))],
     bold:BOLD.map(([k,w])=>{const [id,i]=k.split('/');return [k,stripEn(para(id,i).innerHTML).includes('<strong>'+w)];}),
     fixes:FIXES.map(([k,w])=>{const [id,i]=k.split('/');const p=para(id,i);return [k,stripEn(p.textContent).includes(w)&&!stripEn(p.innerHTML).includes('<strong>'+w)];}),
     filler:/罗素|大格里高利|教皇|幡祭|行程资源池|诏安|布道的时候|which/.test(all(e)),
     china:['隋文帝','义仓','科举','进士科'].filter(w=>!stripEn(all(e)).includes(w)),
     moments:e.moments.map(m=>[m.scene,m.name]),
     xrefs:[[ID,0,'（见上一节）'],[ID,0,'（另见“中世纪西欧”主线）'],[ID,1,'（见“教宗与第一次东西分裂”一节）'],[ID,4,'（另见“东罗马”主线）'],[ID,7,'（另见“中世纪西欧”主线）']]
      .filter(([id,i,w])=>!stripEn(para(id,i).textContent).includes(w)).map(x=>x[0]+'/'+x[1]),
     chars:[...chars(ID),...chars('history-faith-three-chapters')],lbChars:chars('history-west-lombards'),
     en:['卡西诺山（Monte Cassino）','本笃（Benedict of Nursia）','高隆邦（Columbanus）','博比奥（Bobbio）','奥古斯丁（Augustine of Canterbury）','霍诺留（Pope Honorius I）',
      '伯里（J. B. Bury）','伊斯特拉（Istria）','奥斯维（Oswiu）','埃塞尔伯特（Æthelberht）','犹斯图斯（Justus）'].filter(s=>!all(e).includes(s)),
     badEn:/（[A-Za-z][^）]*）（[A-Za-z]|）一世（|阿里乌（Arius）尔/.test(all(e)+all(lb)),
     links:e.sources.map(s=>s.url).filter(u=>!/^https:\/\//.test(u)),dupLinks:e.sources.length-new Set(e.sources.map(s=>s.url)).size,sourcesN:e.sources.length};
   },{ID,BOLD,FIXES});
   assert.deepEqual(r.head,[6,'罗马教会的崛起：格雷戈里一世','罗马教会的崛起','568—604年',true]);
   assert.deepEqual(r.scenes,SCENES);
   assert.deepEqual(r.order,['history-faith-three-chapters',ID],'reading order on 基督教');
   assert.deepEqual(r.row,['faith',568,604]);
   const k=r.faith.indexOf('history-faith-three-chapters/0');
   assert.deepEqual(r.faith.slice(k,k+3),['history-faith-three-chapters/0',ID+'/0','history-empire-constans/0'],'between 三章案 and the shared 一志论 station');
   assert.deepEqual(r.era,['history-faith-papacy','history-faith-three-chapters',ID]);
   assert.deepEqual(r.lombards,[true,false,true,true,true,[[0,'阿尔博因的头骨杯'],[4,'伪造的《君士坦丁赠礼》']],false,false],JSON.stringify(r.lombards));
   for(const [k,ok] of r.bold)assert.ok(ok,k+' lacks 老无’s thesis in bold');
   for(const [k,ok] of r.fixes)assert.ok(ok,k+' lacks the plain-text correction');
   assert.equal(r.filler,false,'conversational filler, slips or the wrong title copied into the prose');
   assert.deepEqual(r.china,[],'Chinese parallels missing');
   assert.deepEqual(r.moments,MOMENTS);
   assert.deepEqual(r.xrefs,[],'pointers back and across');
   for(const [k,n] of r.chars)assert.ok(n<=230,k+' '+n);
   for(const [k,n] of r.lbChars)assert.ok(n<=300,k+' '+n);
   assert.deepEqual(r.en,[],'English names on first appearance');
   assert.equal(r.badEn,false,'doubled or misplaced English names');
   assert.deepEqual(r.links,[]);assert.equal(r.dupLinks,0);assert.ok(r.sourcesN>=25,r.sourcesN);
   for(const [hash,id,re] of CARDS){
    await page.evaluate(h=>{const [id,s]=h.split('/');go(id,{scene:+s});},hash);await wait(60);
    assert.match(await page.$eval(`[data-person="${id}"]`,e=>e.textContent),re,hash+' '+id);
   }
   await page.evaluate(id=>go(id,{scene:0}),ID);await wait(80);
   assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),'中世纪早期的教会 · 第七章');
   for(let i=0;i<SCENES.length;i++){
    const s=await page.evaluate(({ID,i})=>{go(ID,{scene:i});const sc=activeScene(ENTRIES[cur]);
     return {pins:Object.keys(pinIndex).length,layers:group.getLayers().length,legend:legend.children.length,fits:map.getBounds().contains(L.latLngBounds(sc.view)),overflow:document.documentElement.scrollWidth>innerWidth};},{ID,i});
    await wait(120);
    assert.ok(s.layers>0&&s.legend>0&&!s.overflow,ID+'/'+i+' '+JSON.stringify(s));
    if(label==='desktop')assert.ok(s.pins>0&&s.fits,ID+'/'+i+' '+JSON.stringify(s));
    if(label==='390')await page.evaluate(()=>scrollSceneText(false));
    await page.screenshot({path:path.join(shots,`gregory_${i}-${label}.png`)});
   }
   // ↑↓ along 基督教: 三章案 → 罗马教会的崛起 → 希拉克略王朝（下）.
   await page.evaluate(()=>{selectTreeLine('faith');go('history-faith-three-chapters',{scene:4});});
   await page.click('#next');assert.deepEqual(await page.evaluate(()=>[ENTRIES[cur].id,sceneIndex]),[ID,0]);
   await page.evaluate(id=>go(id,{scene:7}),ID);
   await page.click('#next');assert.deepEqual(await page.evaluate(()=>[ENTRIES[cur].id,sceneIndex]),['history-empire-constans',0]);
   // The west line's scene 3 still reads on its own and points across.
   await page.evaluate(()=>{selectTreeLine('west');go('history-west-lombards',{scene:2});});await wait(120);
   if(label==='desktop'){
    await page.screenshot({path:path.join(shots,'lombards_2-desktop.png')});
    const row=await page.$eval(`#toc .tree-item[data-key="${ID}/0"]`,e=>e.textContent);assert.match(row,/^罗马教会的崛起基督教 · 568—604年$/);
    await page.evaluate(id=>{selectTreeLine('faith');go(id);},ID);await page.click('#treeOpen');await wait(250);
    await page.evaluate(()=>treeSheet.querySelector('.tree-item.on')?.scrollIntoView({block:'center'}));await wait(150);
    await page.screenshot({path:path.join(shots,'tree-faith-1440.png')});await page.keyboard.press('Escape');
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: 罗马教会的崛起 568—604 on 基督教, between 三章案 and the shared 一志论 station — eight scenes on 老无’s frame (the big picture, an able pope, '
   +'the clergy’s children and the estates, the monks brought in, no hair-splitting, the city’s paymaster, new markets, the old market deepened); '
   +BOLD.length+' of 老无’s theses in bold, '+FIXES.length+' corrections in plain text; 隋文帝’s granaries and the first examinations beside them; '
   +'six iconic moments and three cards (Gregory’s moved over from 伦巴第人与教宗, whose scene 3 now keeps the Lombards at the gates and points across); '
   +'≤230 chars per scene; English names on first appearance; desktop and 390px offline; no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();}
})();
