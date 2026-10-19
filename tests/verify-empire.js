const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const shots=path.join(__dirname,'shots-v15');require('node:fs').mkdirSync(shots,{recursive:true});
const wait=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 try{
  for(const [width,height,label] of [[1440,960,'desktop'],[390,844,'390']]){
   const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
   await page.setViewport({width,height});
   await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
   await page.setRequestInterception(true);page.on('request',r=>/^https?:/.test(r.url())?r.abort():r.continue());
   await page.goto(pathToFileURL(target).href+'#history-empire-principate',{waitUntil:'domcontentloaded'});
   const report=await page.evaluate(()=>{
    const empire=HISTORY_ENTRIES.filter(e=>e.ch===5),eras=HISTORY_ERAS.filter(e=>e.id.startsWith('empire-'));
    const chars=html=>{const d=document.createElement('div');d.innerHTML=html;return d.textContent.replace(/\s/g,'').length;};
    const paras=empire.flatMap(e=>{const d=document.createElement('div');d.innerHTML=e.html;return [...d.querySelectorAll('[data-scene-text]')].map(p=>({id:e.id+'/'+p.dataset.sceneText,chars:chars(p.innerHTML)}));});
    return {chapter:HISTORY_CH[5],ids:empire.map(e=>e.id),eraIds:eras.map(e=>e.id),eraItems:eras.flatMap(era=>era.items.map(([id])=>id)),
     scenes:empire.reduce((n,e)=>n+e.scenes.length,0),paras,bold:empire.every(e=>/<strong>/.test(e.html)),
     moments:empire.reduce((n,e)=>n+e.moments.length,0),
     people:Object.entries(FIGURE_SCENES).filter(([k])=>k.startsWith('history-empire-')).reduce((n,[,v])=>n+v.length,0),
     romeEnd:HISTORY_BRANCHES.find(b=>b.id==='rome').to,future:TREE_FUTURE.map(f=>f[2])};
   });
   assert.equal(report.chapter,'罗马帝国');
   assert.deepEqual(report.ids,['history-empire-principate','history-empire-julio-claudian','history-empire-flavian','history-empire-antonine',
    'history-empire-crisis','history-empire-dominate','history-empire-constantine','history-empire-theodosius','history-empire-west-fall','history-empire-arcadius','history-empire-theodosius-ii']);
   assert.deepEqual(report.eraIds,['empire-principate','empire-crisis','empire-west','empire-east']);
   assert.deepEqual(report.eraItems,report.ids);
   assert.equal(report.scenes,51);assert.equal(report.paras.length,51);
   assert.ok(report.paras.every(p=>p.chars<=300),'Empire prose budget: '+JSON.stringify(report.paras.filter(p=>p.chars>300)));
   assert.ok(report.bold);assert.equal(report.moments,40);assert.equal(report.people,36);
   assert.equal(report.romeEnd,450);assert.deepEqual(report.future,['东罗马','中世纪西欧','中世纪教会','隋唐']);
   assert.ok(await page.evaluate(()=>{const w=HISTORY_BRANCHES.find(b=>b.id==='west');return w.name==='西罗马'&&w.parent==='rome'&&w.from===395&&w.to===476&&w.c===HC.rome;}));
   // The user's own reading of Augustus and of the empire, and the Praetorian Guard as a thread through the chapter.
   for(const [scene,phrase] of [['history-empire-principate/0','权力的合法性'],['history-empire-principate/0','大政奉还'],['history-empire-principate/0','纯属演戏'],['history-empire-principate/0','释奴'],['history-empire-principate/0','温和'],['history-empire-principate/1','禁卫军（Praetorian Guard）'],['history-empire-principate/1','决定谁当皇帝'],['history-empire-principate/2','外孙'],['history-empire-principate/2','抬元老院'],['history-empire-principate/2','压一块石头'],['history-empire-principate/2','日耳曼总督瓦卢斯'],['history-empire-julio-claudian/0','imperator'],['history-empire-julio-claudian/0','莉薇娅和前夫的儿子'],['history-empire-julio-claudian/0','共和的花架子'],['history-empire-julio-claudian/0','懒得讨好平民'],['history-empire-julio-claudian/0','叛国罪'],['history-empire-julio-claudian/0','不胜其烦'],['history-empire-julio-claudian/1','禁卫军长官塞扬努斯'],['history-empire-julio-claudian/1','接任禁卫军长官'],['history-empire-julio-claudian/1','押在卡利古拉身上'],['history-empire-julio-claudian/2','禁卫军长官马克罗'],['history-empire-julio-claudian/2','军官凯瑞亚'],['history-empire-julio-claudian/1','米塞努姆'],['history-empire-julio-claudian/1','遗嘱'],['history-empire-julio-claudian/2','曾外孙'],['history-empire-julio-claudian/2','禁卫军'],['history-empire-julio-claudian/3','帘子后面'],['history-empire-julio-claudian/3','卡利古拉的叔叔'],['history-empire-julio-claudian/3','蘑菇'],['history-empire-julio-claudian/4','血脉断了'],['history-empire-flavian/0','西班牙总督加尔巴'],['history-empire-crisis/2','塞维鲁的长子'],['history-empire-constantine/0','西部副皇帝'],['history-empire-constantine/4','临终受洗'],['history-empire-theodosius/0','瓦伦提尼安'],['history-empire-crisis/3','骑兵统帅出身'],['history-empire-west-fall/4','俄瑞斯忒斯'],['history-empire-flavian/0','帝国的秘密'],['history-empire-flavian/1','神迹'],['history-empire-crisis/0','拍卖'],['history-empire-crisis/1','让士兵发财'],['history-empire-crisis/1','维斯塔'],['history-empire-crisis/1','地母'],['history-empire-crisis/1','分布式'],['history-empire-crisis/3','无敌太阳神'],['history-empire-constantine/1','到此为止'],['history-empire-constantine/2','天上'],['history-empire-theodosius/3','五胡'],['history-empire-theodosius/4','维斯塔神庙'],['history-empire-west-fall/3','北魏'],['history-empire-west-fall/4','奥多亚克'],['history-empire-flavian/1','两年后也病死'],['history-empire-antonine/5','莱图斯'],['history-empire-antonine/5','纳尔西索斯'],['history-empire-crisis/0','城市长官佩蒂纳克斯'],['history-empire-crisis/0','中央自己乱了'],['history-empire-crisis/0','世袭诸侯'],['history-empire-crisis/0','董卓'],['history-empire-crisis/3','王朝一亡'],['history-empire-crisis/3','瓦勒良被拥立'],['history-empire-crisis/3','伽利埃努斯'],['history-empire-dominate/0','卡里努斯'],['history-empire-dominate/1','伽列里乌斯'],['history-empire-dominate/1','君士坦提乌斯'],['history-empire-dominate/1','收养'],['history-empire-dominate/1','退位'],['history-empire-constantine/0','女婿'],['history-empire-constantine/1','李锡尼'],['history-empire-constantine/3','帝国并没分家'],['history-empire-theodosius/5','分治早有先例'],['history-empire-constantine/4','君士坦提乌斯二世'],['history-empire-constantine/4','约维安'],['history-empire-theodosius/4','阿尔博加斯特'],['history-empire-west-fall/1','斯提里科'],['history-empire-west-fall/3','埃提乌斯'],['history-empire-antonine/0','提格利努斯'],['history-empire-antonine/0','收养'],['history-empire-antonine/1','汉武帝'],['history-empire-antonine/1','亏本的买卖'],['history-empire-antonine/1','秦朝统一后匈奴'],['history-empire-antonine/1','三世纪危机埋下伏笔'],['history-empire-antonine/1','达契亚是例外'],['history-empire-antonine/2','文艺爱好者'],['history-empire-antonine/2','万神殿'],['history-empire-antonine/2','凝聚力'],['history-empire-antonine/2','巴尔·科赫巴'],['history-empire-antonine/2','叙利亚大军'],['history-empire-antonine/3','草皮长城'],['history-empire-antonine/4','学会了罗马的军事技术'],['history-empire-antonine/4','坏了规矩'],['history-empire-antonine/4','阿米尼乌斯'],['history-empire-antonine/5','大力士'],['history-empire-antonine/5','没有什么野心'],['history-empire-antonine/6','吉本'],['history-empire-antonine/6','另一本账'],['history-empire-antonine/7','脆弱的平衡'],['history-empire-antonine/7','每个人都有希望上位'],['history-empire-antonine/7','康茂德必须死'],['history-empire-antonine/7','禅让式'],['history-empire-antonine/7','卡西乌斯'],['history-empire-crisis/0','七十来个'],['history-empire-crisis/0','里外两条线'],['history-empire-crisis/3','两个皇帝一东一西'],['history-empire-crisis/0','禅让式'],['history-empire-crisis/2','罗马公民'],['history-empire-crisis/2','同盟者'],['history-empire-crisis/2','遗产税'],['history-empire-crisis/4','萨珊'],['history-empire-crisis/4','阿勒曼尼'],['history-empire-crisis/4','缓冲地带'],['history-empire-crisis/4','瞭望塔'],['history-empire-crisis/4','三次攻破安息都城泰西封'],['history-empire-crisis/3','稳成了三块'],['history-empire-crisis/3','一东一西'],['history-empire-crisis/5','内附'],['history-empire-crisis/5','五胡乱华'],['history-empire-crisis/5','衣冠东渡'],['history-empire-crisis/5','衣冠南渡'],['history-empire-crisis/5','江统'],['history-empire-dominate/2','领饷的人比交税的人还多'],['history-empire-dominate/2','意大利本土'],['history-empire-dominate/2','三样都没管住'],['history-empire-constantine/0','反人性'],['history-empire-constantine/0','而不是女婿'],['history-empire-constantine/0','失败的起因'],['history-empire-constantine/1','联姻绑不住人'],['history-empire-constantine/1','一家一姓'],['history-empire-constantine/2','少数派'],['history-empire-constantine/2','同质'],['history-empire-constantine/2','异端从此成了国法上的罪'],['history-empire-constantine/3','特洛伊'],['history-empire-constantine/4','兵只认他的亲儿子'],['history-empire-constantine/4','自家人的四帝共治'],['history-empire-constantine/3','衣冠东渡'],['history-empire-constantine/3','索利都斯'],['history-empire-crisis/2','合法性不足'],['history-empire-crisis/2','讨好行省人'],['history-empire-crisis/2','两亿八千万'],['history-empire-west-fall/0','军事集团'],['history-empire-west-fall/0','匈人驱赶日耳曼人'],['history-empire-west-fall/0','三世纪就结成'],['history-empire-theodosius/0','约维安一死'],
     // 老无 2026-10-19: the Goths' crossing retold from the Huns on, and the Vestal fire as the end of the fire scene.
     ['history-empire-theodosius/0','匈人'],['history-empire-theodosius/0','以夷制夷'],['history-empire-theodosius/0','五贤帝'],['history-empire-theodosius/0','马可·奥勒留'],
     ['history-empire-theodosius/0','戈尔迪安三世'],['history-empire-theodosius/0','折成金子'],['history-empire-theodosius/0','当人质'],
     ['history-empire-theodosius/1','物理上可能就养不起'],['history-empire-theodosius/1','人太多了'],['history-empire-theodosius/1','不盘剥也一样乱'],['history-empire-theodosius/1','九万人'],
     ['history-empire-theodosius/1','格鲁森尼人'],['history-empire-theodosius/1','如入无人之境'],['history-empire-theodosius/1','金矿工'],
     ['history-empire-theodosius/2','夸迪人'],['history-empire-theodosius/2','比哥特人过河还早一年'],['history-empire-theodosius/2','御驾亲征'],['history-empire-theodosius/2','三分之一'],
     ['history-empire-theodosius/3','捞了出来'],['history-empire-theodosius/3','险些被擒'],['history-empire-theodosius/3','国中之国'],['history-empire-theodosius/3','瓜分亚美尼亚'],['history-empire-theodosius/3','侍子'],['history-empire-theodosius/3','刘渊'],
     ['history-empire-theodosius/4','旧神一步步退出罗马'],['history-empire-theodosius/4','胜利女神的祭坛又搬了回去'],['history-empire-theodosius/4','冷河'],['history-empire-theodosius/4','见证了从王政到共和'],['history-empire-theodosius/4','在新神崛起的浪潮中熄灭'],
     ['history-empire-theodosius/5','1453年'],['history-empire-west-fall/0','见上一节'],
     // 老无 2026-10-19: three lines past 395 — the brothers, Chrysostom, Theodosius II, the regent killed in the West.
     ['history-empire-arcadius/0','大儿子在东，小儿子带着托孤大臣向西'],['history-empire-arcadius/0','城里信三一派'],['history-empire-arcadius/0','军队里信阿里乌派的蛮族多'],['history-empire-arcadius/0','和稀泥'],['history-empire-arcadius/0','金口约翰'],
     ['history-empire-arcadius/1','金口也说不动'],['history-empire-arcadius/1','煽动底层民众'],['history-empire-arcadius/1','哥特语'],['history-empire-arcadius/1','盖纳斯'],
     ['history-empire-arcadius/2','奢侈糜烂'],['history-empire-arcadius/2','打土豪分田地'],['history-empire-arcadius/2','骑虎难下'],['history-empire-arcadius/2','治外法权'],['history-empire-arcadius/2','孙恩'],
     ['history-empire-arcadius/3','两次流放'],['history-empire-arcadius/3','流放造成底层闹事'],['history-empire-arcadius/3','派个使团来给金口约翰撑腰，被哥哥打回去'],['history-empire-arcadius/3','“基督教”主线'],
     ['history-empire-theodosius-ii/0','哥哥死，儿子狄奥多西二世继位'],['history-empire-theodosius-ii/0','保护人'],['history-empire-theodosius-ii/0','伊嗣俟'],['history-empire-theodosius-ii/0','姐姐掌权'],['history-empire-theodosius-ii/0','普尔喀丽娅'],
     ['history-empire-theodosius-ii/1','苹果的八卦'],['history-empire-theodosius-ii/1','马拉拉斯'],['history-empire-theodosius-ii/1','欧迪奇'],['history-empire-theodosius-ii/1','“基督教”主线'],
     ['history-empire-theodosius-ii/2','狄奥多西法典'],['history-empire-theodosius-ii/2','三十一个教席'],['history-empire-theodosius-ii/2','崔浩'],
     ['history-empire-theodosius-ii/3','六十天'],['history-empire-theodosius-ii/3','东边撑住了'],['history-empire-theodosius-ii/3','“西罗马”主线'],
     ['history-empire-west-fall/1','托孤大臣'],['history-empire-west-fall/1','一个霍光式的人物'],['history-empire-west-fall/1','吉尔多'],
     ['history-empire-west-fall/2','西边小弟弟皇上大了之后杀了托孤大臣'],['history-empire-west-fall/2','三万人'],['history-empire-west-fall/2','威震主者不畜']]){
    await page.evaluate(s=>go(s),scene);
    assert.ok(await page.$eval('#sceneContext>p',(e,w)=>e.textContent.includes(w),phrase),scene+' lacks '+phrase);
   }
   await page.evaluate(()=>go('history-empire-principate'));
   assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),'罗马帝国：元首制 · 第六章');
   assert.equal(await page.$eval('.active-era',e=>e.dataset.era),'empire-principate');
   assert.ok(await page.$$eval('#toc .chip[data-era^="empire-"] small i',es=>es.length===11&&es.every(e=>e.textContent.startsWith('Ⅵ'))));
   assert.equal(await page.$eval('#toc .chip[data-id="history-empire-dominate"] span',e=>e.textContent),'戴克里先：四帝共治');
   for(const [scene,phrase] of [['history-empire-crisis/3','军权'],['history-empire-crisis/3','元老院和平民授权'],['history-empire-crisis/3','不再住在罗马'],['history-empire-crisis/3','共治皇帝'],
     ['history-empire-dominate/1','不是突然冒出来的'],['history-empire-dominate/1','基于禅让的平衡记忆'],['history-empire-dominate/1','为后来君士坦丁迁都打下伏笔'],
     ['history-empire-dominate/2','从地方自治向中央集权转型'],['history-empire-dominate/2','加派官吏'],['history-empire-dominate/2','财政支出剧增']]){
    await page.evaluate(s=>go(s),scene);
    assert.ok(await page.$eval('#sceneContext>p',(e,w)=>e.textContent.includes(w),phrase),scene+' lacks '+phrase);
   }
   await page.evaluate(()=>go('history-empire-principate'));
   assert.match(await page.$eval('#indexCaption',e=>e.textContent),/Ⅵ 帝国/);
   if(label==='desktop')assert.ok(await page.$$eval('#toc .tree-tick',es=>['公元','100','300','500'].every(y=>es.some(e=>e.textContent===y))));
   await page.evaluate(()=>go('history-empire-principate/1'));
   assert.match(await page.$eval('[data-person="sejanus"]',e=>e.textContent),/禁卫军长官/);
   assert.match(await page.$eval('[data-person="sejanus"]',e=>e.textContent),/让别人看着害怕/);
   await page.evaluate(()=>go('history-empire-crisis/1'));assert.match(await page.$eval('[data-person="septimius-severus"]',e=>e.textContent),/一百罗马里/);
   await page.evaluate(()=>go('history-empire-constantine/1'));assert.match(await page.$eval('.scene-passage[data-scene-text="1"]',e=>e.textContent),/以此必胜/);
   await page.evaluate(()=>go('history-empire-constantine/0'));assert.match(await page.$eval('[data-person="galerius"]',e=>e.textContent),/怕我/);
   await page.evaluate(()=>go('history-empire-constantine/4'));assert.match(await page.$eval('[data-person="crispus"]',e=>e.textContent),/波拉/);
   await page.evaluate(()=>go('history-empire-west-fall/4'));assert.match(await page.$eval('[data-person="odoacer"]',e=>e.textContent),/两头应付.*尼波斯/);assert.match(await page.$eval('[data-person="odoacer"]',e=>e.textContent),/狄奥多里克/);assert.match(await page.$eval('[data-person="odoacer"]',e=>e.textContent),/奥多亚克年轻时.*塞维里努斯/);
   await page.evaluate(()=>go('history-empire-antonine/2'));assert.match(await page.$eval('[data-person="hadrian"]',e=>e.textContent),/哭得像个女人/);
   await page.evaluate(()=>go('history-empire-crisis/2'));assert.match(await page.$eval('[data-person="caracalla"]',e=>e.textContent),/洁净礼/);
   await page.evaluate(()=>go('history-empire-antonine/5'));assert.match(await page.$eval('[data-person="commodus"]',e=>e.textContent),/赫拉克勒斯/);
   await page.evaluate(()=>go('history-empire-crisis/0'));assert.match(await page.$eval('[data-person="pertinax"]',e=>e.textContent),/让我们当兵吧/);
   // The 豆腐块: a boxed explainer in the Adrianople scene, styled apart from the 名场面.
   await page.evaluate(()=>go('history-empire-theodosius/2'));
   const box=await page.evaluate(()=>{const b=document.querySelector('#sceneContext .box');return b&&{tag:b.querySelector('.box-tag').firstChild.textContent,text:b.textContent,
    moment:b.classList.contains('moment'),bg:getComputedStyle(b.querySelector('.box-tag')).backgroundColor,momentBg:getComputedStyle(document.querySelector('#sceneContext .moment-tag')).backgroundColor};});
   assert.ok(box&&box.tag==='哥特人怎么打仗'&&!box.moment&&box.bg!==box.momentBg,JSON.stringify(box));
   for(const w of ['火烤硬的大木棒','车营','像霹雳从高山上劈下','马镫','没有老家可烧'])assert.ok(box.text.includes(w),'box lacks '+w);
   // The second 豆腐块: what became of the flame.
   await page.evaluate(()=>go('history-empire-theodosius/4'));
   const fire=await page.evaluate(()=>{const b=document.querySelector('#sceneContext .box');return b&&{tag:b.querySelector('.box-tag').firstChild.textContent,text:b.textContent};});
   assert.ok(fire&&fire.tag==='圣火灭了以后',JSON.stringify(fire));
   for(const w of ['左西莫斯','斑岩柱','1993年','1936年','1930年'])assert.ok(fire.text.includes(w),'fire box lacks '+w);
   for(const [scene,id,re] of [['history-empire-arcadius/3','john-chrysostom',/凡事荣耀归于上帝/],['history-empire-theodosius-ii/0','pulcheria',/祭台/],['history-empire-west-fall/2','stilicho',/伸出了脖子/]]){
    await page.evaluate(s=>go(s),scene);assert.match(await page.$eval(`[data-person="${id}"]`,e=>e.textContent),re,scene+' '+id);
   }
   // Every scene draws real geometry, keeps its pins inside the fitted view, and does not overflow.
   for(const e of report.ids)for(let i=0;i<await page.evaluate(id=>HISTORY_ENTRIES.find(x=>x.id===id).scenes.length,e);i++){
    const r=await page.evaluate(({e,i})=>{go(e,{scene:i});const s=activeScene(ENTRIES[cur]);
     return {pins:Object.keys(pinIndex).length,layers:group.getLayers().length,legend:legend.children.length,fits:map.getBounds().contains(L.latLngBounds(s.view)),overflow:document.documentElement.scrollWidth>innerWidth};},{e,i});
    await wait(60);
    assert.ok(r.layers>0&&r.legend>0&&!r.overflow,e+'/'+i+' '+JSON.stringify(r));
    if(label==='desktop')assert.ok(r.pins>0&&r.fits,e+'/'+i+' '+JSON.stringify(r));
   }
   for(const [scene,file] of [['history-empire-principate/1','guard'],['history-empire-crisis/3','split'],['history-empire-west-fall/4','476'],['history-empire-arcadius/3','exiles'],['history-empire-theodosius-ii/3','walls'],['history-empire-constantine/1','307-324'],['history-empire-west-fall/0','huns'],['history-empire-theodosius/2','adrianople-box'],['history-empire-theodosius/4','vesta']]){
    await page.evaluate(s=>go(s),scene);await wait(300);
    if(label==='390')await page.evaluate(()=>scrollSceneText(false));
    await page.screenshot({path:path.join(shots,`empire-${file}-${label}.png`)});
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: Empire chapter Ⅵ — 11 sections in 4 eras (戴克里先 and 君士坦丁 apart; the Constantinian section runs 305—363) (Rome line forks at 395: 西罗马 to 476 with a 中世纪西欧 shoot, 东罗马 shoot on the Rome line), 51 map scenes (军营元首时期 cut to 6, 君士坦丁 to 5, 狄奥多西 grown to 6: 匈人压境, 收不住, 阿德里安堡, 国中之国, 圣火熄灭, 分治; 西罗马 5 with 托孤大臣; East Rome to 450 in 阿卡狄乌斯与金口约翰 and 狄奥多西二世), ≤300 chars per scene, the user’s readings (legitimacy, 大政奉还, freedmen, heirs, Senate as a check, distributed Vesta cult) and the Praetorian Guard thread in 220 scene checks (incl. 反人性/起因, 受命于神, 新罗马, 卡拉卡拉 courting the provinces, the Huns and the Germanic war bands), 40 iconic-event tags, two 豆腐块 (how the Goths fought; after the flame), 36 dated person cards; eyebrow/numerals/AD ticks; desktop and 390px without overflow; offline; no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();}
})();
