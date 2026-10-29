const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const shots=path.join(__dirname,'shots-ostrogoths');require('node:fs').mkdirSync(shots,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
// 老无 2026-10-25 (later the same day): 中世纪西欧 on to the Lombards in Italy — Odoacer under Zeno and the lie of the land; Zeno setting
// the two Gothic bands on each other and getting it wrong; the Liu Yuan of the Goths sent west; the Hongmen banquet; Theodoric deferring
// to Constantinople; Ostrogothic help against the Vandals (Sicily); the Gothic War and Italian hearts; held a dozen years, then the Lombards,
// until Charlemagne two centuries on. Where this overlaps the East Roman line the two point at each other instead of telling it twice.
const ID='history-west-ostrogoths';
const BOLD=[[ID+'/0','对芝诺称臣，自己统治意大利'],[ID+'/0','当时的大势'],[ID+'/0','东边是匈人散去之后，从前附庸匈人的东哥特人'],[ID+'/0','西边诸国大多讨好东罗马皇帝'],
 [ID+'/1','一个刘渊式的人物'],[ID+'/1','芝诺玩阴的，让两支东哥特人内斗'],[ID+'/1','结果玩砸了'],
 [ID+'/2','摆了一场鸿门宴，把奥多亚克杀了，从此占领了意大利'],
 [ID+'/3','狄奥多里克占了意大利，跟东罗马的关系还很好，一直对东罗马称臣'],
 [ID+'/4','查士丁尼打汪达尔人时还得到东哥特的援助'],[ID+'/4','查士丁尼打完北非，转身就拿这个由头打东哥特'],
 [ID+'/5','可意大利的民心很快就不向着东罗马了'],[ID+'/5','所以这仗一打就是近二十年'],
 [ID+'/6','拿回来的意大利只守住了十几年'],[ID+'/6','查士丁尼死后，意大利很快被伦巴第人占了大半'],[ID+'/6','直到两百年后']];
// Set straight in plain text: the Visigoths sat to the north-west and were the one court that did not defer; who proposed the march on
// Italy is told both ways; the banquet went further than Hongmen; the deference cooled at the end; Italians turned only after 540; Charlemagne
// took the Lombard kingdom in 774 rather than driving the Lombards out.
const FIXES=[[ID+'/0','西北是坐大的西哥特'],[ID+'/0','唯独西哥特的尤里克自居独立'],[ID+'/1','一说是他自己请的命'],[ID+'/1','481年斯特拉波坠马死，484年阿马尔杀了他的儿子'],
 [ID+'/2','鸿门宴上项羽放走了刘邦'],[ID+'/3','两边交情也就冷了'],[ID+'/5','540年拿下拉文纳以后'],[ID+'/5','罗马人看在眼里，开门迎他进城'],
 [ID+'/6','774年查理曼攻下帕维亚，灭了伦巴第王国'],[ID+'/6','552年纳尔塞斯雇来打托提拉的五千多伦巴第兵']];
const SCENES=[['476—488年','西边称臣，东边哥特'],['473—488年','两个狄奥多里克：芝诺玩砸的阴招'],['489—493年','鸿门宴'],['493—526年','哥特人当兵，罗马人办事'],
 ['526—535年','阿玛拉逊莎：借出西西里'],['535—554年','哥特战争：意大利的人心'],['554—568年','只守了十几年：伦巴第人南下']];
const MOMENTS=[[1,'山下的喊话'],[2,'“连根骨头都没有”'],[3,'鱼头里的西马库斯'],[5,'空城罗马']];
const CARDS=[[ID+'/1','theodoric-great',/人质/],[ID+'/3','theodoric-great',/会堂/],[ID+'/4','amalasuntha',/戒尺/],[ID+'/5','totila',/撑死/],[ID+'/6','narses',/金纺锤/],
 ['history-west-kingdoms/1','clovis',/看不下去/],['history-spain-visigoths/3','leovigild',/三万金币/]];
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
    const e=E(ID),wk=E('history-west-kingdoms'),all=x=>[x.html,...x.moments.map(m=>m.text),...x.boxes.map(b=>b.text)].join(' ');
    const ids=HISTORY_ENTRIES.map(x=>x.id),at=ids.indexOf('history-west-kingdoms');
    const chars=id=>{const d=document.createElement('div');d.innerHTML=E(id).html;return [...d.querySelectorAll('[data-scene-text]')].map((p,i)=>[id+'/'+i,stripEn(p.textContent).replace(/\s/g,'').length]);};
    return {head:[e.ch,e.title,e.short,e.period,e.c===HC.celt],scenes:e.scenes.map(s=>[s.date,s.title]),order:ids.slice(at,at+3),
     row:TREE_ROWS[ID+'/0'],west:lineStations('west').map(s=>s.id).filter((x,i,a)=>a.indexOf(x)===i),
     era:HISTORY_ERAS.find(x=>x.id==='empire-kingdoms').items.map(i=>i[0]),
     wk:[wk.scenes.length,wk.scenes.map(s=>s.date),wk.moments.map(m=>[m.scene,m.name]),wk.html.includes('两层的国'),wk.sources.some(s=>/狄奥多里克大王|波爱修斯|魏书/.test(s.label))],
     bold:BOLD.map(([k,w])=>{const [id,i]=k.split('/');return [k,stripEn(para(id,i).innerHTML).includes('<strong>'+w)];}),
     fixes:FIXES.map(([k,w])=>{const [id,i]=k.split('/');const p=para(id,i);return [k,stripEn(p.textContent).includes(w)&&!stripEn(p.innerHTML).includes('<strong>'+w)];}),
     filler:/不知道怎么的|有什么错漏|可以补充|前面有提到过|之类的|奥多亚赛|匂人|伦巴底|贝利撒留|东哥人/.test(all(e)),
     china:['刘渊','任子','鸿门宴','项羽','孝文帝','侯景之乱'].filter(w=>!stripEn(all(e)).includes(w)),
     moments:e.moments.map(m=>[m.scene,m.name]),
     xrefs:[['history-empire-justinian',2,'在东哥特人治下的西西里买粮买马（另见“中世纪西欧”主线）'],['history-empire-justinian',3,'借口出兵（另见“中世纪西欧”主线）'],
      [ID,1,'（另见“东罗马”主线）'],[ID,4,'（另见“东罗马”主线）'],[ID,5,'（另见“东罗马”主线）']].filter(([id,i,w])=>!stripEn(para(id,i).textContent).includes(w)).map(x=>x[0]+'/'+x[1]),
     chars:[...chars(ID),...chars('history-west-kingdoms'),...chars('history-empire-justinian')],
     en:['斯特拉波（Theodoric Strabo）','阿塔拉里克（Athalaric）','阿玛拉逊莎（Amalasuntha）','托提拉（Totila）','伊松佐河（Isonzo）','阿达河（Adda）','博尔塞纳湖（Lake Bolsena）','西马库斯（Symmachus）'].filter(s=>!all(e).includes(s)),
     links:e.sources.map(s=>s.url).filter(u=>!/^https:\/\//.test(u)),dupLinks:e.sources.length-new Set(e.sources.map(s=>s.url)).size,sourcesN:e.sources.length};
   },{ID,BOLD,FIXES});
   assert.deepEqual(r.head,[5,'东哥特王国：从奥多亚克到伦巴第人','东哥特王国','476—568年',true]);
   assert.deepEqual(r.scenes,SCENES);
   assert.deepEqual(r.order,['history-west-kingdoms',ID,'history-west-merovingians'],'reading order on 中世纪西欧');
   assert.deepEqual(r.row,['west',480,568,'476—568年']);
   assert.deepEqual(r.west.slice(r.west.indexOf('history-west-kingdoms')),['history-west-kingdoms',ID,'history-west-merovingians','history-west-lombards','history-west-charlemagne','history-west-charlemagne-rule','history-west-louis-pious']);
   assert.deepEqual(r.era,['history-west-kingdoms',ID]);
   // 蛮族诸王国 handed over its Theodoric scene, with its links; its later scenes and moments moved up one, and Clovis's scene gained the Vase of Soissons.
   // 老无 2026-10-28: and its Visigothic scenes to the new 西班牙 line (剃了发的国王 with them, now 西哥特的覆亡); Clovis's scene is its second.
   assert.deepEqual(r.wk,[2,['476—507年','486—511年'],[[1,'苏瓦松花瓶'],[1,'圣马丁堂里的紫袍']],false,false]);
   for(const [k,ok] of r.bold)assert.ok(ok,k+' lacks 老无’s thesis in bold');
   for(const [k,ok] of r.fixes)assert.ok(ok,k+' lacks the plain-text correction');
   assert.equal(r.filler,false,'conversational filler or misspelt names copied into the prose');
   assert.deepEqual(r.china,[],'Chinese parallels missing');
   assert.deepEqual(r.moments,MOMENTS);
   assert.deepEqual(r.xrefs,[],'the East and West lines point at each other');
   for(const [k,n] of r.chars)assert.ok(n<=300,k+' '+n);
   assert.deepEqual(r.en,[],'English names on first appearance');
   assert.deepEqual(r.links,[]);assert.equal(r.dupLinks,0);assert.ok(r.sourcesN>=15);
   for(const [hash,id,re] of CARDS){
    await page.evaluate(h=>{const [id,s]=h.split('/');go(id,{scene:+s});},hash);await wait(60);
    assert.match(await page.$eval(`[data-person="${id}"]`,e=>e.textContent),re,hash+' '+id);
   }
   await page.evaluate(id=>go(id,{scene:2}),ID);await wait(80);
   assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),'中世纪早期：蛮族诸王国 · 第六章');
   // 老无 2026-10-25: 法兰克人的分家账 drawn as a family tree; the names that repeat carry an identifying tag, in the drawing and in the prose.
   // 老无 2026-10-27: the full account closes the Carolingians in the West, at Verdun (虔诚者路易, last scene).
   await page.evaluate(()=>go('history-west-louis-pious',{scene:5}));await wait(120);
   const tree=await page.evaluate(()=>{const b=[...document.querySelectorAll('#sceneContext .box')].find(x=>x.querySelector('.box-tag').firstChild.textContent==='法兰克人的分家账');
    const s=b&&b.querySelector('svg.kin-tree');if(!s)return null;const r=s.getBoundingClientRect(),br=b.getBoundingClientRect();
    return {text:s.textContent,fits:r.width<=br.width&&r.width>250,overflow:document.documentElement.scrollWidth>innerWidth,after:b.textContent.includes('算账')};});
   assert.ok(tree&&tree.fits&&!tree.overflow&&tree.after,JSON.stringify(tree&&{fits:tree.fits,overflow:tree.overflow}));
   for(const w of ['丕平二世（宫相）','查理·马特（铁锤）','丕平三世（献土）','查理曼（大帝）','卡洛曼（出家）','卡洛曼（早死）','路易（虔诚者）','路易（日耳曼人）','查理（秃头）','克洛泰尔一世（收齐）','希尔德里克三世（末代）','511年','843年'])
    assert.ok(tree.text.includes(w),'tree lacks '+w);
   const tags=await page.evaluate(()=>{const E=id=>HISTORY_ENTRIES.find(e=>e.id===id),p=(id,i)=>{const d=document.createElement('div');d.innerHTML=E(id).html;return [...d.querySelectorAll('[data-scene-text]')][i].textContent.replace(/（[A-Za-z][^）]*）/g,'');};
    const b=(id,i)=>{const d=document.createElement('div');d.innerHTML=E(id).html;return [...d.querySelectorAll('[data-scene-text]')][i].innerHTML.replace(/（[A-Za-z][^）]*）/g,'');};
    return [p('history-west-merovingians',3).includes('查理·马特（铁锤）'),p('history-west-merovingians',4).includes('丕平（矮子丕平）'),p('history-west-lombards',4).includes('“丕平献土”'),
     p('history-west-charlemagne',1).includes('查理（即查理曼大帝）'),p('history-west-charlemagne-rule',5).includes('“虔诚者”路易'),
     // 老无 2026-10-25 夜: 法兰克崛起的要点 woven chronologically across seven sections (not dumped into a standalone section).
     b('history-empire-crisis',4).includes('<strong>法兰克由莱茵河中下游的卡马维、布鲁克特里等小部族合流而成，“法兰克”在日耳曼语里意为“凶悍、勇猛”，后世又演成免税的“自由人”'),
     b('history-empire-constantine',4).includes('<strong>358年尤利安打服渡过莱茵河的萨利克法兰克人，没按老规矩拆散，而是准其整支留在托克桑德利亚当同盟兵'),
     b('history-empire-theodosius',4).includes('<strong>四世纪末法兰克将领接连掌管西罗马兵权，连东边的皇后欧多克西娅也是法兰克大将鲍托之女'),
     b('history-empire-west-fall',0).includes('<strong>唯独法兰克人（三角洲的萨利克部与科隆河岸的里普利安部）从来没被拆散，也没像哥特、汪达尔那样整族背井离乡，而是背靠莱茵河老家步步南下蚕食'),
     b('history-empire-west-fall',2).includes('<strong>替罗马守河的法兰克同盟兵迎头截击，阵斩汪达尔王、杀两万人，直到阿兰人赶来救场才被冲垮'),
     b('history-empire-west-fall',6).includes('<strong>恰逢法兰克王死后两子争位，各投阿提拉与埃提乌斯。451年埃提乌斯合西哥特与墨洛维的法兰克人在卡塔隆平原挡住阿提拉'),
     b('history-empire-west-end',2).includes('<strong>埃吉迪乌斯联手图尔奈的萨利克法兰克王希尔德里克一世（，克洛维之父），463年在奥尔良打退西哥特')||p('history-empire-west-end',2).includes('埃吉迪乌斯联手图尔奈的萨利克法兰克王希尔德里克一世'),
     b('history-empire-west-end',4).includes('<strong>一路推到卢瓦尔河、打到法兰克地盘，希尔德里克一世与罗马残军并肩死守，外患促进了法兰克诸部更好地组织联合起来'),
     b('history-empire-leo',4).includes('<strong>东边同波斯打仗，他在西边只能搞制衡，拉法兰克王克洛维对付西哥特、授他执政官'),
     b('history-west-kingdoms',0).includes('<strong>高卢北部归从未背井离乡、也未被拆散的法兰克')&&p('history-west-kingdoms',0).includes('不列颠早在410年前后被罗马放弃'),
     b('history-west-kingdoms',1).includes('<strong>468年后西哥特北扩打到法兰克地盘，促进了法兰克诸部组织联合起来')&&b('history-west-kingdoms',1).includes('<strong>那时东罗马同波斯打仗，在西边只能搞“搅屎棍”式的制衡策略，拉法兰克对付西哥特。507年克洛维在武耶打垮西哥特、亲手杀了阿拉里克二世；他从东帝阿纳斯塔修斯拿到执政官称号，披紫袍自称“奥古斯都”')&&b('history-west-kingdoms',1).includes('<strong>他又设计除掉萨利克与科隆各小王，一统诸部、定都巴黎'),
     b('history-west-ostrogoths',3).includes('<strong>508年发兵打退南下武耶的克洛维，收下普罗旺斯、替外孙保住西哥特残部'),
     b('history-west-merovingians',4).includes('<strong>751年，法兰克贵族在苏瓦松推丕平为王、涂了圣油，开创加洛林王朝')&&E('history-west-charlemagne').short==='加洛林王朝',
     E('history-empire-west-end').boxes[0].text.includes('<svg class="kin-tree"')&&E('history-empire-macedonian').boxes[0].text.includes('<svg class="kin-tree"'),
     // 老无 2026-10-26: 法兰克内部四大块、分家混战难维集权、教会分裂两头、像三国权相把持、加洛林与教宗土地换合法性交易及伪造《君士坦丁赠礼》; progressive dynasty trees at each dynasty end.
     b('history-west-merovingians',0).includes('<strong>法兰克内部版图定成四大块：东边日耳曼老家奥斯特拉西亚、西边纽斯特里亚、东南勃艮第，外加西南常半独立的阿基坦；分家导致兄弟叔侄频繁混战，中央集权难以维持')&&['mAustrasia','mNeustria','mBurgundy','mAquitaine'].every(k=>!!GEO.regions[k]),
     b('history-west-merovingians',1).includes('<strong>教会也是一盘散沙：国王与城里的主教是一头，地方贵族与从爱尔兰引入的高隆邦等修士是另一头，贵族在自家庄园建修道院、不归主教管'),
     b('history-west-merovingians',2).includes('<strong>法兰克演成活像中国三国的局面：外头几大块各地偏割据，里头中央朝政被权相“宫相”把持，“懒王”成了汉献帝式的摆设'),
     b('history-west-charlemagne',0).includes('<strong>篡位缺王族血统，要靠罗马教宗加持合法性；教宗跟东罗马为圣像越闹越僵')&&E('history-west-merovingians').boxes[0].text.includes('class="dim-stage"'),
     b('history-west-charlemagne',0).includes('<strong>地是法兰克人打下来送的，东罗马怎么讲理也要不回去</strong>')&&p('history-west-charlemagne',0).includes('《君士坦丁赠礼》')&&E('history-west-lombards').moments.some(m=>m.name==='伪造的《君士坦丁赠礼》'),
     ['history-empire-julio-claudian','history-empire-flavian','history-empire-antonine','history-empire-crisis','history-empire-constantine','history-empire-west-fall','history-empire-theodosius','history-empire-leo','history-empire-justinian','history-empire-constans','history-empire-anarchy','history-empire-isaurian','history-empire-amorian'].every(id=>E(id).boxes.some(x=>x.text.includes('class="dim-stage"')))];});
   assert.deepEqual(tags,Array(25).fill(true),'identifying tags, Carolingian naming, Frankish dynamics, and progressive dynasty trees: '+JSON.stringify(tags));
   // Clicking the expand button opens the wide dynasty sheet overlaid on the map stage.
   await page.click('#sceneContext .box .kin-open');await wait(80);
   const sheet=await page.evaluate(()=>{const s=document.getElementById('kinSheet'),svg=s&&s.querySelector('svg.kin-tree');return {open:s&&!s.hidden,w:svg?Math.round(svg.getBoundingClientRect().width):0};});
   assert.ok(sheet.open&&sheet.w>(label==='desktop'?600:300),JSON.stringify(sheet));
   if(label==='desktop')await page.screenshot({path:path.join(shots,'frank-tree-sheet-desktop.png')});
   await page.click('#kinClose');await wait(40);
   if(label==='desktop')await page.evaluate(()=>[...document.querySelectorAll('#sceneContext .box')].at(-1).scrollIntoView({block:'start'}));
   await page.screenshot({path:path.join(shots,`frank-tree-${label}.png`)});
   for(let i=0;i<SCENES.length;i++){
    const s=await page.evaluate(({ID,i})=>{go(ID,{scene:i});const sc=activeScene(ENTRIES[cur]);
     return {pins:Object.keys(pinIndex).length,layers:group.getLayers().length,legend:legend.children.length,fits:map.getBounds().contains(L.latLngBounds(sc.view)),overflow:document.documentElement.scrollWidth>innerWidth};},{ID,i});
    await wait(120);
    assert.ok(s.layers>0&&s.legend>0&&!s.overflow,ID+'/'+i+' '+JSON.stringify(s));
    if(label==='desktop')assert.ok(s.pins>0&&s.fits,ID+'/'+i+' '+JSON.stringify(s));
    if(label==='390')await page.evaluate(()=>scrollSceneText(false));
    await page.screenshot({path:path.join(shots,`ostrogoths_${i}-${label}.png`)});
   }
   // ↑↓ along 中世纪西欧: 蛮族诸王国 → 东哥特王国 → 墨洛温王朝.
   await page.evaluate(()=>{selectTreeLine('west');go('history-west-kingdoms');});
   await page.click('#next');assert.deepEqual(await page.evaluate(()=>[ENTRIES[cur].id,sceneIndex]),[ID,0]);
   await page.click('#next');assert.deepEqual(await page.evaluate(()=>[ENTRIES[cur].id,sceneIndex]),['history-west-merovingians',0]);
   if(label==='desktop'){
    const row=await page.$eval(`#toc .tree-item[data-key="${ID}/0"]`,e=>e.textContent);assert.match(row,/^东哥特王国中世纪西欧 · 476—568年$/);
    await page.evaluate(id=>{selectTreeLine('west');go(id);},ID);await page.click('#treeOpen');await wait(250);
    await page.evaluate(()=>treeSheet.querySelector('.tree-item.on')?.scrollIntoView({block:'center'}));await wait(150);
    await page.screenshot({path:path.join(shots,'tree-west-1440.png')});await page.keyboard.press('Escape');
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: 东哥特王国 476—568 on 中世纪西欧, between 蛮族诸王国 and 墨洛温王朝 — seven scenes (Odoacer and the lie of the land, Zeno’s two Theodorics, the Hongmen banquet, Goths under arms and Romans at the desks, Amalasuntha lending Sicily, the Gothic War and Italian hearts, the Lombards); '
   +BOLD.length+' of 老无’s theses in bold, '+FIXES.length+' corrections in plain text; 刘渊, 鸿门宴, 孝文帝 and 侯景之乱 beside them; four iconic moments and five cards; 蛮族诸王国 down to two scenes, its Visigothic ones on the 西班牙 line, with its moments and cards moved; '
   +'the Justinian section and this one point at each other; 法兰克人的分家账 drawn as a family tree with identifying tags (铁锤, 宫相, 献土, 大帝 …), and the same tags in the prose; ≤300 chars per scene; desktop and 390px; no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();}
})();
