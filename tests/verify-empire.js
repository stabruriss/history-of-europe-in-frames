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
    const chars=html=>{const d=document.createElement('div');d.innerHTML=html;return d.textContent.replace(/（[A-Za-z][^）]*）/g,'').replace(/\s/g,'').length;};
    const paras=empire.flatMap(e=>{const d=document.createElement('div');d.innerHTML=e.html;return [...d.querySelectorAll('[data-scene-text]')].map(p=>({id:e.id+'/'+p.dataset.sceneText,chars:chars(p.innerHTML)}));});
    return {chapter:HISTORY_CH[5],ids:empire.map(e=>e.id),eraIds:eras.map(e=>e.id),eraItems:eras.flatMap(era=>era.items.map(([id])=>id)),
     scenes:empire.reduce((n,e)=>n+e.scenes.length,0),paras,bold:empire.filter(e=>![].includes(e.id)).every(e=>/<strong>/.test(e.html)),
     nobold:empire.filter(e=>!/<strong>/.test(e.html)).map(e=>e.id),
     moments:empire.reduce((n,e)=>n+e.moments.length,0),
     people:Object.entries(FIGURE_SCENES).filter(([k])=>k.startsWith('history-empire-')).reduce((n,[,v])=>n+v.length,0),
     romeEnd:HISTORY_BRANCHES.find(b=>b.id==='rome').to,future:TREE_FUTURE.map(f=>f[2])};
   });
   assert.equal(report.chapter,'罗马帝国');
   assert.deepEqual(report.ids,['history-empire-principate','history-empire-julio-claudian','history-empire-flavian','history-empire-antonine','history-empire-crisis','history-empire-dominate','history-empire-constantine','history-empire-valentinian','history-empire-theodosius','history-empire-west-fall','history-empire-west-end','history-empire-leo','history-empire-justinian','history-empire-heraclius','history-empire-constans','history-empire-anarchy','history-empire-isaurian','history-empire-amorian','history-empire-macedonian','history-west-kingdoms','history-west-ostrogoths','history-west-merovingians','history-west-lombards','history-west-charlemagne','history-west-charlemagne-rule','history-west-louis-pious','history-france-west-francia','history-germany-east-francia','history-italy-middle-francia']);
   assert.deepEqual(report.eraIds,['empire-principate','empire-crisis','empire-west','empire-east','empire-heraclian','empire-iconoclasm','empire-macedonian','empire-kingdoms','empire-franks','empire-verdun']);
   assert.deepEqual([...new Set(report.eraItems)],report.ids);
   assert.equal(report.scenes,158);assert.equal(report.paras.length,158);
   assert.ok(report.paras.every(p=>p.chars<=300),'Empire prose budget: '+JSON.stringify(report.paras.filter(p=>p.chars>300)));
   assert.ok(report.bold);assert.deepEqual(report.nobold,[]);assert.equal(report.moments,108);assert.equal(report.people,62);
   assert.equal(report.romeEnd,476);assert.deepEqual(report.future,['东罗马（晚期）','卡佩王朝','神圣罗马帝国','帝国治下的意大利','大分裂以后','伊斯兰时代的埃及','伊斯兰时代的伊朗','晚唐五代与宋']);
   assert.ok(await page.evaluate(()=>{const w=HISTORY_BRANCHES.find(b=>b.id==='west');return w.name==='中世纪西欧'&&w.parent==='rome'&&w.from===476&&w.to===843&&w.c===HC.celt;}));
   // The user's own reading of Augustus and of the empire, and the Praetorian Guard as a thread through the chapter.
   for(const [scene,phrase] of [['history-empire-principate/0','权力的合法性'],['history-empire-principate/0','大政奉还'],['history-empire-principate/0','纯属演戏'],['history-empire-principate/0','释奴'],['history-empire-principate/0','温和'],['history-empire-principate/1','禁卫军（Praetorian Guard）'],['history-empire-principate/1','决定谁当皇帝'],['history-empire-principate/2','外孙'],['history-empire-principate/2','抬元老院'],['history-empire-principate/2','压一块石头'],['history-empire-principate/2','日耳曼总督瓦卢斯'],['history-empire-julio-claudian/0','imperator'],['history-empire-julio-claudian/0','莉薇娅和前夫的儿子'],['history-empire-julio-claudian/0','共和的花架子'],['history-empire-julio-claudian/0','懒得讨好平民'],['history-empire-julio-claudian/0','叛国罪'],['history-empire-julio-claudian/0','不胜其烦'],['history-empire-julio-claudian/1','禁卫军长官塞扬努斯'],['history-empire-julio-claudian/1','接任禁卫军长官'],['history-empire-julio-claudian/1','押在卡利古拉身上'],['history-empire-julio-claudian/2','禁卫军长官马克罗'],['history-empire-julio-claudian/2','军官凯瑞亚'],['history-empire-julio-claudian/1','米塞努姆'],['history-empire-julio-claudian/1','遗嘱'],['history-empire-julio-claudian/2','曾外孙'],['history-empire-julio-claudian/2','禁卫军'],['history-empire-julio-claudian/3','帘子后面'],['history-empire-julio-claudian/3','卡利古拉的叔叔'],['history-empire-julio-claudian/3','蘑菇'],['history-empire-julio-claudian/4','血脉断了'],['history-empire-flavian/0','西班牙总督加尔巴'],['history-empire-crisis/2','塞维鲁的长子'],['history-empire-constantine/0','西部副皇帝'],['history-empire-constantine/4','临终受洗'],['history-empire-valentinian/0','瓦伦提尼安'],['history-empire-crisis/3','骑兵统帅出身'],['history-empire-west-end/5','俄瑞斯忒斯'],['history-empire-flavian/0','帝国的秘密'],['history-empire-flavian/1','神迹'],['history-empire-crisis/0','拍卖'],['history-empire-crisis/1','让士兵发财'],['history-empire-crisis/1','维斯塔'],['history-empire-crisis/1','地母'],['history-empire-crisis/1','分布式'],['history-empire-crisis/3','无敌太阳神'],['history-empire-constantine/1','到此为止'],['history-empire-constantine/2','天上'],['history-empire-theodosius/0','五胡'],['history-empire-theodosius/1','维斯塔神庙'],['history-empire-west-fall/5','北魏'],['history-empire-west-end/5','奥多亚克'],['history-empire-flavian/1','两年后也病死'],['history-empire-antonine/5','莱图斯'],['history-empire-antonine/5','纳尔西索斯'],['history-empire-crisis/0','城市长官佩蒂纳克斯'],['history-empire-crisis/0','中央自己乱了'],['history-empire-crisis/0','世袭诸侯'],['history-empire-crisis/0','董卓'],['history-empire-crisis/3','王朝一亡'],['history-empire-crisis/3','瓦勒良被拥立'],['history-empire-crisis/3','伽利埃努斯'],['history-empire-dominate/0','卡里努斯'],['history-empire-dominate/1','伽列里乌斯'],['history-empire-dominate/1','君士坦提乌斯'],['history-empire-dominate/1','收养'],['history-empire-dominate/1','退位'],['history-empire-constantine/0','女婿'],['history-empire-constantine/1','李锡尼'],['history-empire-constantine/3','帝国并没分家'],['history-empire-theodosius/2','分治早有先例'],['history-empire-constantine/4','君士坦提乌斯二世'],['history-empire-constantine/4','约维安'],['history-empire-theodosius/1','阿尔博加斯特'],['history-empire-west-fall/1','斯提里科'],['history-empire-west-fall/7','埃提乌斯'],['history-empire-antonine/0','提格利努斯'],['history-empire-antonine/0','收养'],['history-empire-antonine/1','汉武帝'],['history-empire-antonine/1','亏本的买卖'],['history-empire-antonine/1','秦朝统一后匈奴'],['history-empire-antonine/1','三世纪危机埋下伏笔'],['history-empire-antonine/1','达契亚是例外'],['history-empire-antonine/2','文艺爱好者'],['history-empire-antonine/2','万神殿'],['history-empire-antonine/2','凝聚力'],['history-empire-antonine/2','巴尔·科赫巴'],['history-empire-antonine/2','叙利亚大军'],['history-empire-antonine/3','草皮长城'],['history-empire-antonine/4','学会了罗马的军事技术'],['history-empire-antonine/4','坏了规矩'],['history-empire-antonine/4','阿米尼乌斯'],['history-empire-antonine/5','大力士'],['history-empire-antonine/5','没有什么野心'],['history-empire-antonine/6','吉本'],['history-empire-antonine/6','另一本账'],['history-empire-antonine/7','脆弱的平衡'],['history-empire-antonine/7','每个人都有希望上位'],['history-empire-antonine/7','康茂德必须死'],['history-empire-antonine/7','禅让式'],['history-empire-antonine/7','卡西乌斯'],['history-empire-crisis/0','七十来个'],['history-empire-crisis/0','里外两条线'],['history-empire-crisis/3','两个皇帝一东一西'],['history-empire-crisis/0','禅让式'],['history-empire-crisis/2','罗马公民'],['history-empire-crisis/2','同盟者'],['history-empire-crisis/2','遗产税'],['history-empire-crisis/4','萨珊'],['history-empire-crisis/4','阿勒曼尼'],['history-empire-crisis/4','缓冲地带'],['history-empire-crisis/4','瞭望塔'],['history-empire-crisis/4','三次攻破安息都城泰西封'],['history-empire-crisis/3','稳成了三块'],['history-empire-crisis/3','一东一西'],['history-empire-crisis/5','内附'],['history-empire-crisis/5','五胡乱华'],['history-empire-crisis/5','衣冠东渡'],['history-empire-crisis/5','衣冠南渡'],['history-empire-crisis/5','江统'],['history-empire-dominate/2','领饷的人比交税的人还多'],['history-empire-dominate/2','意大利本土'],['history-empire-dominate/2','三样都没管住'],['history-empire-constantine/0','反人性'],['history-empire-constantine/0','而不是女婿'],['history-empire-constantine/0','失败的起因'],['history-empire-constantine/1','联姻绑不住人'],['history-empire-constantine/1','一家一姓'],['history-empire-constantine/2','少数派'],['history-empire-constantine/2','同质'],['history-empire-constantine/2','异端从此成了国法上的罪'],['history-empire-constantine/3','特洛伊'],['history-empire-constantine/4','兵只认他的亲儿子'],['history-empire-constantine/4','自家人的四帝共治'],['history-empire-constantine/3','衣冠东渡'],['history-empire-constantine/3','索利都斯'],['history-empire-crisis/2','合法性不足'],['history-empire-crisis/2','讨好行省人'],['history-empire-crisis/2','两亿八千万'],['history-empire-west-fall/0','军事集团'],['history-empire-west-fall/0','匈人驱赶日耳曼人'],['history-empire-west-fall/0','三世纪就结成'],['history-empire-valentinian/0','约维安一死'],
     // 老无 2026-10-19: the Goths' crossing retold from the Huns on, and the Vestal fire as the end of the fire scene.
     ['history-empire-valentinian/0','匈人'],['history-empire-valentinian/0','以夷制夷'],['history-empire-valentinian/0','五贤帝'],['history-empire-valentinian/0','马可·奥勒留'],
     ['history-empire-valentinian/0','戈尔迪安三世'],['history-empire-valentinian/0','折成金子'],['history-empire-valentinian/0','当人质'],
     ['history-empire-valentinian/1','物理上可能就养不起'],['history-empire-valentinian/1','人太多了'],['history-empire-valentinian/1','不盘剥也一样乱'],['history-empire-valentinian/1','九万人'],
     ['history-empire-valentinian/1','格鲁森尼人'],['history-empire-valentinian/1','如入无人之境'],['history-empire-valentinian/1','金矿工'],
     ['history-empire-valentinian/2','夸迪人'],['history-empire-valentinian/2','比哥特人过河还早一年'],['history-empire-valentinian/2','御驾亲征'],['history-empire-valentinian/2','三分之一'],
     ['history-empire-theodosius/0','捞了出来'],['history-empire-theodosius/0','险些被擒'],['history-empire-theodosius/0','国中之国'],['history-empire-theodosius/0','瓜分亚美尼亚'],['history-empire-theodosius/0','侍子'],['history-empire-theodosius/0','刘渊'],
     ['history-empire-theodosius/1','旧神一步步退出罗马'],['history-empire-theodosius/1','胜利女神的祭坛又搬了回去'],['history-empire-theodosius/1','冷河'],['history-empire-theodosius/1','见证了从王政到共和'],['history-empire-theodosius/1','在新神崛起的浪潮中熄灭'],
     ['history-empire-theodosius/2','1453年'],['history-empire-west-fall/0','见上一节'],
     // 老无 2026-10-19: three lines past 395 — the brothers, Chrysostom, Theodosius II, the regent killed in the West.
     ['history-empire-theodosius/3','大儿子在东，小儿子带着托孤大臣向西'],['history-empire-theodosius/3','城里信三一派'],['history-empire-theodosius/3','军队里信阿里乌派的蛮族多'],['history-empire-theodosius/3','和稀泥'],['history-empire-theodosius/3','金口约翰'],
     ['history-empire-theodosius/4','金口也说不动'],['history-empire-theodosius/4','煽动底层民众'],['history-empire-theodosius/4','哥特语'],['history-empire-theodosius/4','盖纳斯'],
     ['history-empire-theodosius/5','奢侈糜烂'],['history-empire-theodosius/5','打土豪分田地'],['history-empire-theodosius/5','骑虎难下'],['history-empire-theodosius/5','治外法权'],['history-empire-theodosius/5','孙恩'],
     ['history-empire-theodosius/6','两次流放'],['history-empire-theodosius/6','流放造成底层闹事'],['history-empire-theodosius/6','派个使团来给金口约翰撑腰，被哥哥打回去'],['history-empire-theodosius/6','“基督教”主线'],
     ['history-empire-theodosius/7','哥哥死，儿子狄奥多西二世继位'],['history-empire-theodosius/7','保护人'],['history-empire-theodosius/7','伊嗣俟'],['history-empire-theodosius/7','姐姐掌权'],['history-empire-theodosius/7','普尔喀丽娅'],
     ['history-empire-theodosius/8','苹果的八卦'],['history-empire-theodosius/8','马拉拉斯'],['history-empire-theodosius/8','欧迪奇'],['history-empire-theodosius/8','“基督教”主线'],
     ['history-empire-theodosius/9','狄奥多西法典'],['history-empire-theodosius/9','三十一个教席'],['history-empire-theodosius/9','崔浩'],['history-empire-theodosius/9','重新统一帝国的机会'],['history-empire-theodosius/9','莉基尼娅·欧多克西娅'],['history-empire-theodosius/9','没生出儿子'],
     ['history-empire-theodosius/10','六十天'],['history-empire-theodosius/10','王朝绝嗣'],['history-empire-theodosius/10','阿斯帕尔'],['history-empire-theodosius/10','利奥一世'],['history-empire-theodosius/10','东边撑住了'],['history-empire-theodosius/10','“西罗马的终结”一节'],
     ['history-empire-west-fall/1','托孤大臣'],['history-empire-west-fall/1','一个霍光式的人物'],['history-empire-west-fall/1','吉尔多'],
     ['history-empire-west-fall/3','西边小弟弟皇上大了之后杀了托孤大臣'],['history-empire-west-fall/3','三万人'],['history-empire-west-fall/3','威震主者不畜'],
     // v34 (老无 2026-10-21 晚): Blues and Greens, Justinian’s end, the Heraclian war (holy war, base-trading, religious dispute, Muslim conquest).
     ['history-empire-leo/5','也有要拉拢埃及、叙利亚的意思，让他们别太离心'],['history-empire-justinian/1','四马战车赛'],['history-empire-justinian/5','查士丁尼折腾了一辈子，拿回了意大利，但只撑了十几年就又丢了'],['history-empire-justinian/5','内部宗教派系争夺也没停下，晚年就很颓'],
     ['history-empire-justinian/4','大瘟疫也直接导致了波斯退兵'],['history-empire-justinian/4','据《秘史》'],
     ['history-empire-heraclius/0','叙利亚和埃及在与波斯的内外夹击中接连失守'],['history-empire-heraclius/1','希拉克略打出一致对外的“圣战”旗号同萨珊波斯决战，用的是“换家”的打法'],['history-empire-heraclius/1','苦撑了整整六年'],['history-empire-heraclius/2','一举收回叙利亚和埃及'],['history-empire-heraclius/2','以拉丁语不再作为官方语言为标志'],['history-empire-heraclius/3','挑起新一轮宗教纷争'],['history-empire-heraclius/4','很丝滑地夺走了早已离心的叙利亚和埃及'],
     // v35 (老无 2026-10-22 晚): 东罗马 after Justinian by dynasty, each scene built on his own logic (and cleaned of conversational filler).
     ['history-empire-justinian/6','与汉武帝如出一辙'],['history-empire-justinian/6','收复的土地得而复失'],['history-empire-justinian/6','大军损耗殆尽'],['history-empire-justinian/6','教派冲突与兵变交织'],['history-empire-justinian/6','财政破产'],['history-empire-justinian/6','查士丁尼王朝终结'],
     ['history-empire-constans/0','吃马肉不吃马肝'],['history-empire-constans/1','根子都是因为带头违反《谕令》'],['history-empire-constans/1','实则治的就是抗旨议论教义这一条'],['history-empire-constans/2','铜水桶'],['history-empire-constans/2','希腊火'],['history-empire-constans/3','东方外敌压力骤减'],['history-empire-constans/3','教义本身不那么重要'],['history-empire-constans/4','当年皇权强盛时没有铁腕定于一尊'],['history-empire-constans/4','从前皇帝还能把教宗抓到君士坦丁堡，如今连抓都抓不来了'],['history-empire-constans/5','对意大利动武已经行不通，只能改用怀柔'],['history-empire-constans/5','戴着皇冠的皇帝当众向教宗伏地行礼、亲吻他的脚'],['history-empire-constans/5','希拉克略王朝绝嗣'],
     ['history-empire-anarchy/0','类似唐朝藩镇的四大“军区”'],['history-empire-anarchy/0','奥普西金'],['history-empire-anarchy/1','类似中国五代的局面，军区兵马轮番拥立新君'],['history-empire-anarchy/1','兵强马壮者为之尔'],
     ['history-empire-isaurian/0','基督既是神，无形的神性就不可画成图像'],['history-empire-isaurian/0','只画人性是割裂两性'],['history-empire-isaurian/1','禁毁圣像使东罗马与西方的分歧进一步加深'],['history-empire-isaurian/2','硬推近六十年，强行稳住了新局面'],['history-empire-isaurian/3','皇太后上台后再次“翻大饼”恢复圣像'],['history-empire-isaurian/4','她只能靠撒币和减税安抚各方，结果导致财政崩溃'],['history-empire-isaurian/4','武则天'],['history-empire-isaurian/5','当成嫁妆送给法兰克“蛮族”'],['history-empire-isaurian/5','成也利奥，败也利奥'],
     ['history-empire-amorian/0','再度陷入动荡'],['history-empire-amorian/1','阿莫里翁'],['history-empire-amorian/2','人类可以以任意画一条线分为两派互相斗争'],['history-empire-amorian/2','去朝中朋党难'],['history-empire-amorian/3','转为一致对外，联手抵制罗马教宗的管辖'],['history-empire-amorian/3','和子'],
     ['history-empire-macedonian/0','189年'],['history-empire-macedonian/0','巴列奥略王朝'],['history-empire-macedonian/0','皇上才是老大'],['history-empire-macedonian/0','马其顿文艺复兴'],['history-empire-macedonian/1','关陇集团'],['history-empire-macedonian/1','折兵钱'],['history-empire-macedonian/1','瓦良格卫队'],['history-empire-macedonian/1','连保代税法'],['history-empire-macedonian/2','保加尔屠夫'],['history-empire-macedonian/2','宋太祖'],['history-empire-macedonian/3','酿成东西教会大分裂'],['history-empire-macedonian/3','马其顿王朝绝嗣'],
     ['history-empire-theodosius/2','一战死伤过半'],['history-empire-west-fall/1','董卓式的人物'],['history-empire-west-fall/1','马其顿方案'],['history-empire-west-fall/1','方案烂尾'],['history-empire-west-fall/2','从莱茵河与不列颠抽回兵员回防'],['history-empire-west-fall/2','夺取马其顿'],['history-empire-west-fall/2','放了鸽子'],['history-empire-west-fall/3','三位一体正统'],['history-empire-west-fall/3','当时首都已在拉文纳'],['history-empire-west-fall/3','但未屠城'],['history-empire-west-fall/4','六十万斛小麦'],['history-empire-west-fall/4','娃娃亲'],['history-empire-west-fall/5','无可奈何'],['history-empire-west-fall/5','胡内里克'],['history-empire-west-fall/5','常备军急剧缩水'],['history-empire-west-fall/6','攻城技术'],['history-empire-west-fall/6','霍诺莉娅'],['history-empire-west-fall/6','大出血暴毙'],['history-empire-west-fall/6','作鸟兽散'],['history-empire-west-fall/7','亲手拔剑将他砍死'],['history-empire-west-fall/7','保卫儿媳'],['history-empire-west-fall/7','世俗道统'],
     // 老无 2026-10-21: East Rome from Leo to Justinian, the barbarian kingdoms and the Visigoths.
     ['history-empire-leo/0','阿斯帕尔为啥自己不上'],['history-empire-leo/0','利奥一世和他什么关系'],['history-empire-leo/0','护民官'],['history-empire-leo/0','马尔西安'],['history-empire-leo/0','石勒'],
     ['history-empire-leo/1','伊苏里亚人'],['history-empire-leo/1','邦角'],['history-empire-leo/1','屠夫'],['history-empire-leo/2','女婿'],['history-empire-leo/2','巴西利斯库斯'],['history-empire-leo/2','“罗马”主线'],
     ['history-empire-leo/3','合一诏'],['history-empire-leo/3','“基督教”主线'],['history-empire-leo/3','狄奥多里克'],['history-empire-leo/4','金银税'],['history-empire-leo/4','三十二万磅'],['history-empire-leo/4','达拉'],
     ['history-empire-leo/5','三圣颂'],['history-empire-leo/5','裹挟了皇帝'],
     ['history-empire-justinian/0','舅舅'],['history-empire-justinian/0','干粮'],['history-empire-justinian/0','狄奥多拉'],['history-empire-justinian/1','汉武帝式的雄才大略'],['history-empire-justinian/1','尼卡'],['history-empire-justinian/1','裹尸布'],
     ['history-empire-justinian/2','东抚波斯'],['history-empire-justinian/2','永久和平'],['history-empire-justinian/2','六百年'],['history-empire-justinian/3','西征意大利，名将出征'],['history-empire-justinian/3','名将因为假装接受敌人称帝邀请遭猜忌'],
     ['history-empire-justinian/3','毫无根据'],['history-empire-justinian/3','没有凯旋式'],['history-empire-justinian/4','波斯安抚失败，两线作战'],['history-empire-justinian/4','安条克'],['history-empire-justinian/4','瘟疫'],['history-empire-justinian/4','四千'],
     ['history-empire-justinian/5','纳尔塞斯'],['history-empire-justinian/5','五十年和约'],['history-empire-justinian/5','伦巴第人'],
     ['history-west-kingdoms/0','蛮族怎么分势力范围'],['history-west-kingdoms/0','三分之一'],['history-west-kingdoms/0','拿刀吃饭'],['history-west-ostrogoths/3','孝文帝'],['history-west-ostrogoths/3','“中国”主线'],
     ['history-west-kingdoms/1','西哥特的统治'],['history-west-kingdoms/1','两套法'],['history-west-kingdoms/2','克洛维'],['history-west-kingdoms/2','武耶'],['history-west-kingdoms/3','三万金币'],['history-west-kingdoms/3','589年'],
     ['history-west-kingdoms/4','七十九岁'],['history-west-kingdoms/4','瓜达莱特']]){
    await page.evaluate(s=>go(s),scene);
    assert.ok(await page.$eval('#sceneContext>p',(e,w)=>e.textContent.includes(w)||e.textContent.replace(/（[A-Za-z][^）]*）/g,'').includes(w),phrase),scene+' lacks '+phrase);
   }
   await page.evaluate(()=>go('history-empire-principate'));
   assert.equal(await page.$eval('#entryEyebrow',e=>e.textContent),'罗马帝国：元首制 · 第六章');
   assert.equal(await page.$eval('.active-era',e=>e.dataset.era),'empire-principate');
   // 罗马 rows name their chapter; the rows of 东罗马, 拜占庭 and 中世纪西欧 name their line; a shared station names all its lines.
   assert.deepEqual(await page.$$eval('#toc .chip[data-era^="empire-"]',es=>es.map(b=>[b.dataset.key,b.querySelector('small i').textContent])),[['history-empire-principate/0','Ⅵ · '],['history-empire-julio-claudian/0','Ⅵ · '],['history-empire-flavian/0','Ⅵ · '],['history-empire-antonine/0','Ⅵ · '],['history-empire-crisis/0','Ⅵ · '],['history-empire-dominate/0','Ⅵ · '],['history-empire-constantine/0','Ⅵ · '],['history-empire-valentinian/0','Ⅵ · '],['history-empire-theodosius/0','Ⅵ · '],['history-empire-theodosius/3','东罗马 · '],['history-empire-west-fall/0','Ⅵ · '],['history-empire-west-end/0','Ⅵ · '],['history-empire-leo/0','东罗马 · '],['history-west-kingdoms/0','中世纪西欧 · '],['history-west-ostrogoths/0','中世纪西欧 · '],['history-empire-justinian/0','东罗马 · '],['history-west-merovingians/0','中世纪西欧 · '],['history-west-lombards/0','中世纪西欧 · '],['history-empire-heraclius/0','东罗马、波斯、埃及 · '],['history-empire-constans/0','东罗马、基督教 · '],['history-empire-anarchy/0','东罗马 · '],['history-empire-isaurian/0','东罗马、基督教 · '],['history-west-charlemagne/0','中世纪西欧 · '],['history-west-charlemagne-rule/0','中世纪西欧 · '],['history-empire-amorian/0','东罗马、基督教 · '],['history-west-louis-pious/0','中世纪西欧 · '],['history-france-west-francia/0','法兰西 · '],['history-germany-east-francia/0','德意志 · '],['history-italy-middle-francia/0','意大利 · '],['history-empire-macedonian/0','东罗马 · '],['history-empire-macedonian/3','东罗马、基督教 · ']]);
   assert.equal(await page.$eval('#toc .chip[data-id="history-empire-dominate"] span',e=>e.textContent),'戴克里先：四帝共治');
   for(const [scene,phrase] of [['history-empire-crisis/3','军权'],['history-empire-crisis/3','元老院和平民授权'],['history-empire-crisis/3','不再住在罗马'],['history-empire-crisis/3','共治皇帝'],
     ['history-empire-dominate/1','不是突然冒出来的'],['history-empire-dominate/1','基于禅让的平衡记忆'],['history-empire-dominate/1','为后来君士坦丁迁都打下伏笔'],
     ['history-empire-dominate/2','从地方自治向中央集权转型'],['history-empire-dominate/2','加派官吏'],['history-empire-dominate/2','财政支出剧增']]){
    await page.evaluate(s=>go(s),scene);
    assert.ok(await page.$eval('#sceneContext>p',(e,w)=>e.textContent.includes(w)||e.textContent.replace(/（[A-Za-z][^）]*）/g,'').includes(w),phrase),scene+' lacks '+phrase);
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
   await page.evaluate(()=>go('history-empire-west-end/5'));assert.match(await page.$eval('[data-person="odoacer"]',e=>e.textContent),/两头应付.*尼波斯/);assert.match(await page.$eval('[data-person="odoacer"]',e=>e.textContent),/狄奥多里克/);assert.match(await page.$eval('[data-person="odoacer"]',e=>e.textContent),/奥多亚克年轻时.*塞维里努斯/);
   await page.evaluate(()=>go('history-empire-antonine/2'));assert.match(await page.$eval('[data-person="hadrian"]',e=>e.textContent),/哭得像个女人/);
   await page.evaluate(()=>go('history-empire-crisis/2'));assert.match(await page.$eval('[data-person="caracalla"]',e=>e.textContent),/洁净礼/);
   await page.evaluate(()=>go('history-empire-antonine/5'));assert.match(await page.$eval('[data-person="commodus"]',e=>e.textContent),/赫拉克勒斯/);
   await page.evaluate(()=>go('history-empire-crisis/0'));assert.match(await page.$eval('[data-person="pertinax"]',e=>e.textContent),/让我们当兵吧/);
   // The 豆腐块: a boxed explainer in the Adrianople scene, styled apart from the 名场面.
   await page.evaluate(()=>go('history-empire-valentinian/2'));
   const box=await page.evaluate(()=>{const b=document.querySelector('#sceneContext .box');return b&&{tag:b.querySelector('.box-tag').firstChild.textContent,text:b.textContent,
    moment:b.classList.contains('moment'),bg:getComputedStyle(b.querySelector('.box-tag')).backgroundColor,momentBg:getComputedStyle(document.querySelector('#sceneContext .moment-tag')).backgroundColor};});
   assert.ok(box&&box.tag==='哥特人怎么打仗'&&!box.moment&&box.bg!==box.momentBg,JSON.stringify(box));
   for(const w of ['火烤硬的大木棒','车营','像霹雳从高山上劈下','马镫','没有老家可烧'])assert.ok(box.text.includes(w),'box lacks '+w);
   // The second 豆腐块: what became of the flame.
   await page.evaluate(()=>go('history-empire-theodosius/1'));
   const fire=await page.evaluate(()=>{const b=document.querySelector('#sceneContext .box');return b&&{tag:b.querySelector('.box-tag').firstChild.textContent,text:b.textContent};});
   assert.ok(fire&&fire.tag==='圣火灭了以后',JSON.stringify(fire));
   for(const w of ['左西莫斯','斑岩柱','1549年','1930年'])assert.ok(fire.text.includes(w),'fire box lacks '+w);
   // 老无 2026-10-20: the Olympic flame and Vesta, a small box of its own in the same scene.
   const olympic=await page.evaluate(()=>{const b=document.querySelectorAll('#sceneContext .box')[1];return b&&{tag:b.querySelector('.box-tag').firstChild.textContent,text:b.textContent};});
   assert.ok(olympic&&olympic.tag==='奥运圣火与维斯塔',JSON.stringify(olympic));
   for(const w of ['赫斯提亚','1936年','普鲁塔克','凹面','维斯塔贞女','君士坦丁凯旋门'])assert.ok(olympic.text.includes(w),'Olympic box lacks '+w);
   // The third 豆腐块: after Justinian, beside Emperor Wu of Han — land, army, home affairs, money.
   await page.evaluate(()=>go('history-empire-justinian/6'));
   const wu=await page.evaluate(()=>{const b=document.querySelector('#sceneContext .box');return b&&{tag:b.querySelector('.box-tag').firstChild.textContent,text:b.textContent};});
   assert.ok(wu&&wu.tag==='查士丁尼身后与汉武帝',JSON.stringify(wu));
   for(const w of ['儋耳、真番','无以复往','合战五日','户口减半','轮台诏','查士丁二世'])assert.ok(wu.text.includes(w),'Wu box lacks '+w);
   for(const [scene,id,re] of [['history-empire-theodosius/6','john-chrysostom',/凡事荣耀归于上帝/],['history-empire-theodosius/7','pulcheria',/祭台/],['history-empire-west-fall/3','stilicho',/伸出了脖子/],
     ['history-empire-leo/0','aspar',/金冠/],['history-empire-leo/4','anastasius-i',/保证/],['history-empire-justinian/0','justin-i',/干粮/],['history-empire-justinian/1','theodora',/裹尸布/],['history-empire-justinian/3','belisarius',/堤道/],
     ['history-west-ostrogoths/3','theodoric-great',/会堂/],['history-west-kingdoms/2','clovis',/看不下去/],['history-west-kingdoms/3','leovigild',/三万金币/]]){
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
   for(const [scene,file] of [['history-empire-principate/1','guard'],['history-empire-crisis/3','split'],['history-empire-west-fall/7','455'],['history-empire-west-end/5','476'],['history-empire-west-end/6','kingdoms-476'],['history-empire-theodosius/6','exiles'],['history-empire-theodosius/10','walls'],['history-empire-constantine/1','307-324'],['history-empire-west-fall/0','huns'],['history-empire-valentinian/2','adrianople-box'],['history-empire-theodosius/1','vesta'],['history-empire-leo/0','aspar'],['history-empire-justinian/3','ravenna'],['history-empire-justinian/5','565'],['history-west-kingdoms/0','kingdoms'],['history-west-kingdoms/4','711']]){
    await page.evaluate(s=>go(s),scene);await wait(300);
    if(label==='390')await page.evaluate(()=>scrollSceneText(false));
    await page.screenshot({path:path.join(shots,`empire-${file}-${label}.png`)});
   }
   await page.close();
  }
  assert.deepEqual(errors,[]);
  console.log('PASS: Empire chapter Ⅵ — 29 sections in 10 eras (v35: 东罗马 by dynasty — 查士丁尼王朝 to 602 beside Emperor Wu, 希拉克略王朝 and 希拉克略王朝（下）, 二十年无政府, 伊苏里亚王朝, 阿莫里亚王朝, 马其顿王朝 to 1056; v34: 墨洛温, 伦巴第, 查理曼); before: 13 sections in 5 eras (v33: 利奥王朝 457—518, 查士丁尼 518—565, 蛮族诸王国与西哥特 476—711, a 豆腐块 on Justinian and Emperor Wu of Han); earlier: 10 sections in 3 eras (戴克里先 and 君士坦丁 apart; the Constantinian section runs 305—363) (Rome line forks at 395: 西罗马 to 476 with a 中世纪西欧 shoot, 东罗马 shoot on the Rome line), 51 map scenes (军营元首时期 cut to 6, 君士坦丁 to 5, 狄奥多西 grown to 6: 匈人压境, 收不住, 阿德里安堡, 国中之国, 圣火熄灭, 分治; 西罗马 5 with 托孤大臣; East Rome to 450 in 阿卡狄乌斯与金口约翰 and 狄奥多西二世), ≤300 chars per scene, the user’s readings (legitimacy, 大政奉还, freedmen, heirs, Senate as a check, distributed Vesta cult) and the Praetorian Guard thread in 226 scene checks (incl. 反人性/起因, 受命于神, 新罗马, 卡拉卡拉 courting the provinces, the Huns and the Germanic war bands), 40 iconic-event tags, two 豆腐块 (how the Goths fought; after the flame), 36 dated person cards; eyebrow/numerals/AD ticks; desktop and 390px without overflow; offline; no page errors.');
 }catch(e){console.error(e);process.exitCode=1;}finally{await browser.close();}
})();
