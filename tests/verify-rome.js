const puppeteer=require('puppeteer-core');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));
const shots=path.join(__dirname,'shots-v13');require('node:fs').mkdirSync(shots,{recursive:true});
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
   await page.goto(pathToFileURL(target).href+'#history-rome-site',{waitUntil:'domcontentloaded'});
   const report=await page.evaluate(()=>{
    const rome=HISTORY_ENTRIES.filter(e=>e.ch===4),eras=HISTORY_ERAS.filter(e=>e.id.startsWith('rome-'));
    const chars=html=>{const d=document.createElement('div');d.innerHTML=html;return d.textContent.replace(/\s/g,'').length;};
    const paras=rome.flatMap(e=>{const d=document.createElement('div');d.innerHTML=e.html;return [...d.querySelectorAll('[data-scene-text]')].map(p=>({id:e.id+'/'+p.dataset.sceneText,chars:chars(p.innerHTML),bold:!!p.querySelector('strong')}));});
    return {chapter:HISTORY_CH[4],ids:rome.map(e=>e.id),eraItems:eras.flatMap(era=>era.items.map(([id])=>id)),eraIds:eras.map(e=>e.id),scenes:rome.reduce((n,e)=>n+e.scenes.length,0),paras,
     sectionsBold:rome.every(e=>/<strong>/.test(e.html)),moments:rome.reduce((n,e)=>n+e.moments.length,0),
     people:Object.entries(FIGURE_SCENES).filter(([k])=>k.startsWith('history-rome-')).reduce((n,[,v])=>n+v.length,0)};
   });
   assert.equal(report.chapter,'罗马');
   assert.deepEqual(report.ids,['history-rome-site','history-rome-kings','history-rome-republic','history-rome-plebs','history-rome-orders','history-rome-mature','history-rome-punic','history-rome-east',
    'history-rome-gracchi','history-rome-marius','history-rome-social','history-rome-sulla','history-rome-pompey','history-rome-triumvirate','history-rome-caesar','history-rome-augustus']);
   assert.deepEqual(report.eraIds,['rome-rise','rome-med','rome-fall']);
   assert.deepEqual(report.eraItems,report.ids);
   assert.equal(report.scenes,42);assert.equal(report.paras.length,42);
   assert.ok(report.paras.every(p=>p.chars<=300),'Rome prose budget: '+JSON.stringify(report.paras.filter(p=>p.chars>300)));
   assert.ok(report.sectionsBold);assert.equal(report.moments,49);assert.equal(report.people,68);
   // The three-force reading (平民·元老院·官员, two against one) is visible in the decisive scenes.
   for(const [scene,phrase] of [['history-rome-kings/0','元老、王、人民三方'],['history-rome-republic/0','元老和人民一起赶走了王'],['history-rome-plebs/0','平民从此有了自己的官'],
     ['history-rome-plebs/1','元老和平民联手，推倒专权的官员'],['history-rome-orders/1','元老与平民的官联手'],['history-rome-mature/1','官员拉着城市平民，跟元老院对着干'],
     ['history-rome-mature/2','保民官进了体制'],['history-rome-mature/3','另两方都卡得住它'],
     ['history-rome-punic/0','人民盼着战利品，投票开战'],['history-rome-punic/1','大难临头就拧成一股'],['history-rome-punic/2','将军拉着人民，顶住元老院'],
     ['history-rome-east/0','元老院和执政官拉着人民出征'],['history-rome-east/1','元老院要防谁冒尖'],['history-rome-east/2','保民官带着不愿当兵的平民'],
     ['history-rome-gracchi/0','贵族里的黑羊'],['history-rome-gracchi/1','好处一断'],['history-rome-marius/1','潘多拉魔盒'],['history-rome-social/1','绿卡'],
     ['history-rome-sulla/0','你的小弟打死了我的人'],['history-rome-sulla/2','借一个强人打另一个强人'],['history-rome-caesar/0','基本盘早已散了'],
     ['history-rome-augustus/1','把两个强人推到了一起'],['history-rome-augustus/2','打酱油的雷必达'],['history-rome-augustus/4','共和的壳子里，住进了一个人'],
     ['history-rome-site/0','罗马起步晚'],['history-rome-site/1','边缘人和流窜犯的避难所'],['history-rome-kings/0','三百人'],['history-rome-kings/1','重装步兵方阵'],['history-rome-orders/0','平民的武器就是出走']]){
    await page.evaluate(s=>go(s),scene);
    assert.ok(await page.$eval('#sceneContext>p',(e,w)=>e.textContent.includes(w),phrase),scene+' lacks '+phrase);
   }
   await page.evaluate(()=>go('history-rome-site'));
   assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),'罗马：王政与共和 · 第五章');
   assert.equal(await page.$eval('.active-era',e=>e.dataset.era),'rome-rise');
   assert.ok(await page.$$eval('#toc .chip[data-era="rome-rise"] small i',es=>es.length===6&&es.every(e=>e.textContent.startsWith('Ⅴ'))));
   assert.ok(await page.$$eval('#toc .chip[data-era="rome-med"] small i',es=>es.length===2&&es.every(e=>e.textContent.startsWith('Ⅴ'))));
   assert.match(await page.$$eval('.era-future',es=>es.map(e=>e.textContent).join(' ')),/中世纪/);
   assert.ok(await page.$$eval('#toc .chip[data-era="rome-fall"] small i',es=>es.length===8&&es.every(e=>e.textContent.startsWith('Ⅴ'))));
   assert.match(await page.$eval('#indexCaption',e=>e.textContent),/Ⅴ 罗马/);
   const ids=await page.evaluate(()=>HISTORY_ENTRIES.filter(e=>e.ch===4).flatMap(e=>e.scenes.map((s,i)=>e.id+'/'+i)));
   for(const id of ids){
    await page.evaluate(id=>go(id),id);
    const r=await page.evaluate(()=>({pins:Object.keys(pinIndex).length,layers:group.getLayers().length,legend:legend.children.length,
      fits:document.documentElement.scrollWidth<=innerWidth&&readerBody.scrollWidth<=readerBody.clientWidth+1,
      moments:document.querySelectorAll('#sceneContext .moment').length,expected:ENTRIES[cur].moments.filter(m=>m.scene===sceneIndex).length}));
    assert.ok(r.pins>0&&r.layers>0&&r.legend>0&&r.fits,id+' '+JSON.stringify(r));
    assert.equal(r.moments,r.expected,id);
   }
   // Dated person cards, including 老夫's own Rome anecdote.
   await page.evaluate(()=>go('history-rome-orders/0'));
   assert.match(await page.$eval('[data-person="aristotle"]',e=>e.textContent),/卢基乌斯/);
   await page.evaluate(()=>go('history-rome-kings/1'));
   assert.match(await page.$eval('[data-person="tarquinius-superbus"]',e=>e.textContent),/罂粟花/);
   await page.evaluate(()=>go('history-rome-mature/3'));
   assert.match(await page.$eval('[data-person="appius-caecus"]',e=>e.textContent),/抬进元老院/);
   assert.match(await page.$eval('[data-person="curius-dentatus"]',e=>e.textContent),/萝卜/);
   await page.evaluate(()=>go('history-rome-punic/1'));
   assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),'罗马：称霸地中海 · 第五章');
   assert.equal(await page.$eval('.active-era',e=>e.dataset.era),'rome-med');
   assert.match(await page.$eval('[data-person="hannibal"]',e=>e.textContent),/利用胜利/);
   await page.evaluate(()=>go('history-rome-east/1'));
   assert.match(await page.$eval('[data-person="scipio-africanus"]',e=>e.textContent),/忘恩的祖国/);
   await page.evaluate(()=>go('history-rome-sulla/0'));
   assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),'罗马：共和崩解 · 第五章');
   assert.match(await page.$eval('[data-person="sulla"]',e=>e.textContent),/马略的财务官和部将/);
   await page.evaluate(()=>go('history-rome-sulla/2'));assert.match(await page.$eval('[data-person="caesar"]',e=>e.textContent),/马略的内侄/);
   await page.evaluate(()=>go('history-rome-pompey/0'));assert.match(await page.$eval('[data-person="crassus"],[data-person="pompey"]',e=>e.textContent),/苏拉的副手/);
   for(const [scene,file] of [['history-rome-site/0','site'],['history-rome-gracchi/0','gracchi'],['history-rome-marius/1','cimbri'],['history-rome-social/0','social'],['history-rome-sulla/1','sulla'],['history-rome-pompey/1','pompey-east'],['history-rome-triumvirate/1','gaul'],['history-rome-caesar/0','rubicon'],['history-rome-augustus/2','philippi'],['history-rome-augustus/4','princeps']]){
    await page.evaluate(s=>go(s),scene);await wait(300);
    if(label==='390')await page.evaluate(()=>scrollSceneText(false));
    await page.screenshot({path:path.join(shots,`rome-${file}-${label}.png`)});
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: Rome chapter Ⅴ — 16 sections in 3 eras, 42 map scenes, ≤300 chars per scene, three-force theses and the user’s own points in 33 scenes, 49 iconic-event tags (至圣所 moved to the 基督教 line), 68 dated person cards with relationship labels; era/eyebrow/numerals/roadmap; desktop and 390px without overflow; offline; no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();}
})();
