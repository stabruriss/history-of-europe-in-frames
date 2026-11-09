const puppeteer=require('puppeteer-core');require('./legacy_sidebar.cjs');require('./chrome_guard.cjs');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const target=path.resolve(process.argv[2]||path.join(__dirname,'..','index.html'));

// 老无 2026-11-08: “剩下几条改落后的线也推进下”. 意大利 from 1563 to 1929 (7 sections; the last one shared with 基督教),
// 低地诸国 from 1648 to 1914 (4 sections, riding 荷兰战争与沃邦 and 光荣革命, ending at 一战西线).
const SECTIONS={
 'history-italy-spanish':'西班牙治下的意大利',
 'history-italy-savoy':'萨伏伊与奥地利',
 'history-italy-napoleon':'拿破仑与意大利',
 'history-italy-mazzini':'马志尼与1848年',
 'history-italy-cavour':'加富尔与加里波第',
 'history-italy-rome':'罗马城破与南方问题',
 'history-italy-lateran':'墨索里尼与拉特兰条约',
 'history-lowlands-golden-age':'荷兰黄金时代',
 'history-lowlands-batavian':'从联省到联合王国',
 'history-lowlands-belgium':'比利时独立',
 'history-lowlands-congo':'煤铁与刚果',
};
const ITALY=['history-germany-charles5','history-italy-spanish','history-italy-savoy','history-italy-napoleon','history-italy-mazzini',
 'history-italy-cavour','history-italy-rome','history-germany-ww1-west','history-ww1-middle','history-ww1-end','history-germany-versailles','history-italy-lateran'];
const LOWLANDS=['history-germany-thirty-years-3','history-lowlands-golden-age','history-france-dutch-war','history-britain-glorious',
 'history-lowlands-batavian','history-lowlands-belgium','history-lowlands-congo','history-germany-ww1-west','history-ww1-middle','history-ww1-end'];
const CHINA=/见“(五代十国|北宋|辽金西夏|南宋|蒙古崛起|明|明清易代|清前期|清中晚期|辛亥民初)”一节/;

// One fact per scene that the section turns on, so that a later rewrite cannot quietly drop it.
const FACTS=[
 ['history-italy-spanish',3,'伽利略'],
 ['history-italy-spanish',4,'马萨涅洛'],
 ['history-italy-savoy',1,'撒丁'],
 ['history-italy-savoy',3,'贝卡里亚'],
 ['history-italy-napoleon',4,'缪拉'],
 ['history-italy-mazzini',1,'青年意大利'],
 ['history-italy-mazzini',3,'库斯托扎'],
 ['history-italy-cavour',1,'普隆比耶尔'],
 ['history-italy-cavour',4,'马尔萨拉'],
 ['history-italy-rome',2,'庇亚门'],
 ['history-italy-rome',4,'阿杜瓦'],
 ['history-italy-lateran',3,'戒严令'],
 ['history-italy-lateran',5,'拉特兰'],
 ['history-lowlands-golden-age',2,'福禄特'],
 ['history-lowlands-golden-age',5,'梅德韦'],
 ['history-lowlands-batavian',4,'巴达维亚共和国'],
 ['history-lowlands-belgium',1,'哑女'],
 ['history-lowlands-belgium',5,'永久中立'],
 ['history-lowlands-congo',3,'橡胶'],
 ['history-lowlands-congo',4,'莫雷尔'],
];

const chars=s=>s.replace(/<[^>]+>/g,'').replace(/（[A-Za-z][^）]*）/g,'').replace(/\s/g,'').length;

(async()=>{
 const browser=await puppeteer.launch({executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const errors=[];
 try{
  const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
  await page.setViewport({width:1440,height:960});
  await page.emulateMediaFeatures([{name:'prefers-reduced-motion',value:'reduce'}]);
  await page.setOfflineMode(true);
  await page.goto(pathToFileURL(target).href+'#history-italy-cavour/0',{waitUntil:'load'});
  await page.waitForFunction(()=>window.metroUI&&document.querySelector('#map .pin'));
  const r=await page.evaluate(ids=>{
   const by=id=>HISTORY_ENTRIES.find(e=>e.id===id);
   const para=(e,i)=>(e.html.match(new RegExp(`<p data-scene-text="${i}">([\\s\\S]*?)</p>`))||[])[1]||'';
   const line=id=>(({name,from,to})=>({name,from,to}))(HISTORY_BRANCHES.find(b=>b.id===id));
   // Stations of a line in time order, as the tree draws them.
   const stations=lid=>Object.entries(TREE_ROWS).filter(([k,v])=>k.endsWith('/0')&&(Array.isArray(v[0])?v[0]:[v[0]]).includes(lid))
    .sort((a,b)=>a[1][1]-b[1][1]).map(([k])=>k.slice(0,-2));
   return {
    italy:line('italy'),lowlands:line('lowlands'),
    futureItaly:TREE_FUTURE.find(f=>f[0]==='italy').slice(0,3),
    futureLowlands:TREE_FUTURE.find(f=>f[0]==='lowlands').slice(0,3),
    futureFaith:TREE_FUTURE.find(f=>f[0]==='faith').slice(0,2),
    italyStations:stations('italy'),lowlandsStations:stations('lowlands'),
    rows:Object.fromEntries(['history-italy-lateran','history-france-dutch-war','history-britain-glorious','history-germany-ww1-west']
     .map(id=>[id,(TREE_ROWS[id+'/0']||[])[0]])),
    report:metroUI.layoutReport(),
    sections:Object.fromEntries(ids.map(id=>{const e=by(id);return [id,{short:e.short,period:e.period,ch:e.ch,scenes:e.scenes.length,sources:e.sources.length,
     urls:e.sources.map(s=>s[1]||s.url),html:e.html,paras:e.scenes.map((_,i)=>para(e,i))}];})),
   };
  },Object.keys(SECTIONS));
  assert.deepEqual(r.italy,{name:'意大利',from:843,to:1929});
  assert.equal(r.lowlands.to,1918);
  assert.deepEqual(r.futureItaly,['italy',1929,'法西斯意大利与二战']);
  assert.deepEqual(r.futureLowlands,['lowlands',1918,'比荷卢联盟与欧洲一体化']);
  assert.equal(r.futureFaith[1],1929);
  assert.deepEqual(r.italyStations.slice(-ITALY.length),ITALY,'意大利 stations in order');
  assert.deepEqual(r.lowlandsStations.slice(-LOWLANDS.length),LOWLANDS,'低地诸国 stations in order');
  assert.deepEqual(r.rows['history-italy-lateran'],['italy','faith']);
  assert.ok(r.rows['history-france-dutch-war'].includes('lowlands')&&r.rows['history-britain-glorious'].includes('lowlands')
   &&r.rows['history-germany-ww1-west'].includes('lowlands'),'低地诸国 rides its three shared stations');
  assert.deepEqual(r.report.unresolvedLabels,[]);
  assert.deepEqual(r.report.linkThroughStations,[]);
  for(const [id,short] of Object.entries(SECTIONS)){
   const s=r.sections[id];
   assert.deepEqual([s.short,s.ch],[short,5],id);
   assert.ok(s.scenes>=5&&s.scenes<=6,id+' scenes: '+s.scenes);
   assert.ok(s.sources>=8&&new Set(s.urls).size===s.urls.length&&s.urls.every(u=>u.startsWith('https://')),id+' reading links');
   assert.ok(CHINA.test(s.html),id+' points to a section of the 中国 line');
   assert.equal(s.paras.filter(Boolean).length,s.scenes,id+' prose for every scene');
   s.paras.forEach((p,i)=>{
    const bold=p.match(/<strong>(.*?)<\/strong>/g)||[];
    assert.equal(bold.length,1,`${id}/${i} one bold sentence`);assert.ok(p.startsWith('<strong>'),`${id}/${i} bold comes first`);
    assert.ok(chars(bold[0])<=40,`${id}/${i} bold ${chars(bold[0])}`);assert.ok(chars(p)<=300,`${id}/${i} ${chars(p)} chars`);
    assert.ok(!/[！？!?]/.test(p.replace(/<[^>]+>/g,'')),`${id}/${i} no question or exclamation marks`);
   });
  }
  for(const [id,i,text] of FACTS){
   assert.ok(r.sections[id].paras[i].replace(/（[A-Za-z][^）]*）/g,'').includes(text),`${id}/${i}: ${text}`);
  }
  await page.close();
  assert.deepEqual(errors,[],'no page errors');
  console.log('PASS: 意大利 & 低地诸国 v101 — 意大利 extended to 1929 (Lateran shared with 基督教), 低地诸国 to 1914 via 荷兰战争与沃邦, 光荣革命 and 一战西线, 11 new sections verified.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await Promise.race([browser.close(),new Promise(r=>setTimeout(r,200))]);browser.process()?.kill('SIGKILL');process.exit(process.exitCode||0);}
})();
