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
    'history-empire-crisis','history-empire-dominate','history-empire-constantine','history-empire-theodosius','history-empire-west-fall']);
   assert.deepEqual(report.eraIds,['empire-principate','empire-crisis','empire-west']);
   assert.deepEqual(report.eraItems,report.ids);
   assert.equal(report.scenes,38);assert.equal(report.paras.length,38);
   assert.ok(report.paras.every(p=>p.chars<=300),'Empire prose budget: '+JSON.stringify(report.paras.filter(p=>p.chars>300)));
   assert.ok(report.bold);assert.equal(report.moments,35);assert.equal(report.people,33);
   assert.equal(report.romeEnd,395);assert.deepEqual(report.future,['东罗马','中世纪西欧','中世纪教会']);
   assert.ok(await page.evaluate(()=>{const w=HISTORY_BRANCHES.find(b=>b.id==='west');return w.name==='西罗马'&&w.parent==='rome'&&w.from===395&&w.to===476&&w.c===HC.rome;}));
   // The user's own reading of Augustus and of the empire, and the Praetorian Guard as a thread through the chapter.
   for(const [scene,phrase] of [['history-empire-principate/0','权力的合法性'],['history-empire-principate/0','大政奉还'],['history-empire-principate/0','纯属演戏'],['history-empire-principate/0','释奴'],['history-empire-principate/0','温和'],['history-empire-principate/1','禁卫军（Praetorian Guard）'],['history-empire-principate/1','决定谁当皇帝'],['history-empire-principate/2','外孙'],['history-empire-principate/2','抬元老院'],['history-empire-principate/2','压一块石头'],['history-empire-principate/2','日耳曼总督瓦卢斯'],['history-empire-julio-claudian/0','imperator'],['history-empire-julio-claudian/0','莉薇娅和前夫的儿子'],['history-empire-julio-claudian/0','共和的花架子'],['history-empire-julio-claudian/0','懒得讨好平民'],['history-empire-julio-claudian/0','叛国罪'],['history-empire-julio-claudian/0','不胜其烦'],['history-empire-julio-claudian/1','禁卫军长官塞扬努斯'],['history-empire-julio-claudian/1','接任禁卫军长官'],['history-empire-julio-claudian/1','押在卡利古拉身上'],['history-empire-julio-claudian/2','禁卫军长官马克罗'],['history-empire-julio-claudian/2','军官凯瑞亚'],['history-empire-julio-claudian/1','米塞努姆'],['history-empire-julio-claudian/1','遗嘱'],['history-empire-julio-claudian/2','曾外孙'],['history-empire-julio-claudian/2','禁卫军'],['history-empire-julio-claudian/3','帘子后面'],['history-empire-julio-claudian/3','卡利古拉的叔叔'],['history-empire-julio-claudian/3','蘑菇'],['history-empire-julio-claudian/4','血脉断了'],['history-empire-flavian/0','西班牙总督加尔巴'],['history-empire-crisis/2','塞维鲁的长子'],['history-empire-constantine/0','西部副皇帝'],['history-empire-constantine/4','临终受洗'],['history-empire-theodosius/0','瓦伦提尼安'],['history-empire-crisis/3','骑兵统帅出身'],['history-empire-west-fall/3','俄瑞斯忒斯'],['history-empire-flavian/0','帝国的秘密'],['history-empire-flavian/1','神迹'],['history-empire-crisis/0','拍卖'],['history-empire-crisis/1','让士兵发财'],['history-empire-crisis/1','维斯塔'],['history-empire-crisis/1','地母'],['history-empire-crisis/1','分布式'],['history-empire-crisis/3','无敌太阳神'],['history-empire-constantine/1','到此为止'],['history-empire-constantine/2','天上'],['history-empire-theodosius/0','五胡'],['history-empire-theodosius/1','维斯塔圣火'],['history-empire-west-fall/2','北魏'],['history-empire-west-fall/3','奥多亚克'],['history-empire-flavian/1','两年后也病死'],['history-empire-antonine/5','莱图斯'],['history-empire-antonine/5','纳尔西索斯'],['history-empire-crisis/0','城市长官佩蒂纳克斯'],['history-empire-crisis/0','中央自己乱了'],['history-empire-crisis/0','世袭诸侯'],['history-empire-crisis/0','董卓'],['history-empire-crisis/3','王朝一亡'],['history-empire-crisis/3','瓦勒良被拥立'],['history-empire-crisis/3','伽利埃努斯'],['history-empire-dominate/0','卡里努斯'],['history-empire-dominate/1','伽列里乌斯'],['history-empire-dominate/1','君士坦提乌斯'],['history-empire-dominate/1','收养'],['history-empire-dominate/1','退位'],['history-empire-constantine/0','女婿'],['history-empire-constantine/1','李锡尼'],['history-empire-constantine/3','帝国并没分家'],['history-empire-theodosius/1','分治早有先例'],['history-empire-constantine/4','君士坦提乌斯二世'],['history-empire-constantine/4','约维安'],['history-empire-theodosius/1','阿尔博加斯特'],['history-empire-west-fall/1','斯提里科'],['history-empire-west-fall/2','埃提乌斯'],['history-empire-antonine/0','提格利努斯'],['history-empire-antonine/0','收养'],['history-empire-antonine/1','汉武帝'],['history-empire-antonine/1','亏本的买卖'],['history-empire-antonine/1','秦朝统一后匈奴'],['history-empire-antonine/1','三世纪危机埋下伏笔'],['history-empire-antonine/1','达契亚是例外'],['history-empire-antonine/2','文艺爱好者'],['history-empire-antonine/2','万神殿'],['history-empire-antonine/2','凝聚力'],['history-empire-antonine/2','巴尔·科赫巴'],['history-empire-antonine/2','叙利亚大军'],['history-empire-antonine/3','草皮长城'],['history-empire-antonine/4','学会了罗马的军事技术'],['history-empire-antonine/4','坏了规矩'],['history-empire-antonine/4','阿米尼乌斯'],['history-empire-antonine/5','大力士'],['history-empire-antonine/5','没有什么野心'],['history-empire-antonine/6','吉本'],['history-empire-antonine/6','另一本账'],['history-empire-antonine/7','脆弱的平衡'],['history-empire-antonine/7','每个人都有希望上位'],['history-empire-antonine/7','康茂德必须死'],['history-empire-antonine/7','禅让式'],['history-empire-antonine/7','卡西乌斯'],['history-empire-crisis/0','七十来个'],['history-empire-crisis/0','里外两条线'],['history-empire-crisis/3','两个皇帝一东一西'],['history-empire-crisis/0','禅让式'],['history-empire-crisis/2','罗马公民'],['history-empire-crisis/2','同盟者'],['history-empire-crisis/2','遗产税'],['history-empire-crisis/4','萨珊'],['history-empire-crisis/4','阿勒曼尼'],['history-empire-crisis/4','缓冲地带'],['history-empire-crisis/4','瞭望塔'],['history-empire-crisis/4','三次攻破安息都城泰西封'],['history-empire-crisis/3','稳成了三块'],['history-empire-crisis/3','一东一西'],['history-empire-crisis/5','内附'],['history-empire-crisis/5','五胡乱华'],['history-empire-crisis/5','衣冠东渡'],['history-empire-crisis/5','衣冠南渡'],['history-empire-crisis/5','江统'],['history-empire-dominate/2','领饷的人比交税的人还多'],['history-empire-dominate/2','意大利本土'],['history-empire-dominate/2','三样都没管住'],['history-empire-constantine/0','反人性'],['history-empire-constantine/0','而不是女婿'],['history-empire-constantine/0','失败的起因'],['history-empire-constantine/1','联姻绑不住人'],['history-empire-constantine/1','一家一姓'],['history-empire-constantine/2','少数派'],['history-empire-constantine/2','同质'],['history-empire-constantine/2','异端从此成了国法上的罪'],['history-empire-constantine/3','特洛伊'],['history-empire-constantine/4','兵只认他的亲儿子'],['history-empire-constantine/4','自家人的四帝共治'],['history-empire-constantine/3','衣冠东渡'],['history-empire-constantine/3','索利都斯'],['history-empire-crisis/2','合法性不足'],['history-empire-crisis/2','讨好行省人'],['history-empire-crisis/2','两亿八千万'],['history-empire-west-fall/0','军事集团'],['history-empire-west-fall/0','匈人驱赶日耳曼人'],['history-empire-west-fall/0','三世纪就结成'],['history-empire-theodosius/0','约维安一死']]){
    await page.evaluate(s=>go(s),scene);
    assert.ok(await page.$eval('#sceneContext>p',(e,w)=>e.textContent.includes(w),phrase),scene+' lacks '+phrase);
   }
   await page.evaluate(()=>go('history-empire-principate'));
   assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),'罗马帝国：元首制 · 第六章');
   assert.equal(await page.$eval('.active-era',e=>e.dataset.era),'empire-principate');
   assert.ok(await page.$$eval('#toc .chip[data-era^="empire-"] small i',es=>es.length===9&&es.every(e=>e.textContent.startsWith('Ⅵ'))));
   assert.match(await page.$eval('#indexCaption',e=>e.textContent),/Ⅵ 帝国/);
   if(label==='desktop')assert.ok(await page.$$eval('#toc .tree-tick',es=>['公元','100','300','500'].every(y=>es.some(e=>e.textContent===y))));
   await page.evaluate(()=>go('history-empire-principate/1'));
   assert.match(await page.$eval('[data-person="sejanus"]',e=>e.textContent),/禁卫军长官/);
   assert.match(await page.$eval('[data-person="sejanus"]',e=>e.textContent),/让别人看着害怕/);
   await page.evaluate(()=>go('history-empire-crisis/1'));assert.match(await page.$eval('[data-person="septimius-severus"]',e=>e.textContent),/一百罗马里/);
   await page.evaluate(()=>go('history-empire-constantine/1'));assert.match(await page.$eval('.scene-passage[data-scene-text="1"]',e=>e.textContent),/以此必胜/);
   await page.evaluate(()=>go('history-empire-constantine/0'));assert.match(await page.$eval('[data-person="galerius"]',e=>e.textContent),/怕我/);
   await page.evaluate(()=>go('history-empire-constantine/4'));assert.match(await page.$eval('[data-person="crispus"]',e=>e.textContent),/波拉/);
   await page.evaluate(()=>go('history-empire-west-fall/3'));assert.match(await page.$eval('[data-person="odoacer"]',e=>e.textContent),/两头应付.*尼波斯/);assert.match(await page.$eval('[data-person="odoacer"]',e=>e.textContent),/狄奥多里克/);assert.match(await page.$eval('[data-person="odoacer"]',e=>e.textContent),/奥多亚克年轻时.*塞维里努斯/);
   await page.evaluate(()=>go('history-empire-antonine/2'));assert.match(await page.$eval('[data-person="hadrian"]',e=>e.textContent),/哭得像个女人/);
   await page.evaluate(()=>go('history-empire-crisis/2'));assert.match(await page.$eval('[data-person="caracalla"]',e=>e.textContent),/洁净礼/);
   await page.evaluate(()=>go('history-empire-antonine/5'));assert.match(await page.$eval('[data-person="commodus"]',e=>e.textContent),/赫拉克勒斯/);
   await page.evaluate(()=>go('history-empire-crisis/0'));assert.match(await page.$eval('[data-person="pertinax"]',e=>e.textContent),/让我们当兵吧/);
   // Every scene draws real geometry, keeps its pins inside the fitted view, and does not overflow.
   for(const e of report.ids)for(let i=0;i<await page.evaluate(id=>HISTORY_ENTRIES.find(x=>x.id===id).scenes.length,e);i++){
    const r=await page.evaluate(({e,i})=>{go(e,{scene:i});const s=activeScene(ENTRIES[cur]);
     return {pins:Object.keys(pinIndex).length,layers:group.getLayers().length,legend:legend.children.length,fits:map.getBounds().contains(L.latLngBounds(s.view)),overflow:document.documentElement.scrollWidth>innerWidth};},{e,i});
    await wait(60);
    assert.ok(r.layers>0&&r.legend>0&&!r.overflow,e+'/'+i+' '+JSON.stringify(r));
    if(label==='desktop')assert.ok(r.pins>0&&r.fits,e+'/'+i+' '+JSON.stringify(r));
   }
   for(const [scene,file] of [['history-empire-principate/1','guard'],['history-empire-crisis/3','split'],['history-empire-west-fall/3','476'],['history-empire-constantine/1','307-324'],['history-empire-west-fall/0','huns']]){
    await page.evaluate(s=>go(s),scene);await wait(300);
    if(label==='390')await page.evaluate(()=>scrollSceneText(false));
    await page.screenshot({path:path.join(shots,`empire-${file}-${label}.png`)});
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: Empire chapter Ⅵ — 9 sections in 3 eras (戴克里先 and 君士坦丁 apart; the Constantinian section runs 305—363) (Rome line forks at 395: 西罗马 to 476 with a 中世纪西欧 shoot, 东罗马 shoot on the Rome line), 38 map scenes (军营元首时期 cut to 6, 君士坦丁 to 5), ≤300 chars per scene, the user’s readings (legitimacy, 大政奉还, freedmen, heirs, Senate as a check, distributed Vesta cult) and the Praetorian Guard thread in 142 scene checks (incl. 反人性/起因, 受命于神, 新罗马, 卡拉卡拉 courting the provinces, the Huns and the Germanic war bands), 35 iconic-event tags, 33 dated person cards; eyebrow/numerals/AD ticks; desktop and 390px without overflow; offline; no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();}
})();
