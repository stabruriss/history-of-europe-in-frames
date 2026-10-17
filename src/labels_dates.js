/* English names for the geographical directory. */
const META = {
  overview:{en:'Mediterranean & Near East Atlas'},
  crescent:{en:'Fertile Crescent'},
  mesopotamia:{en:'Mesopotamia'},
  nile:{en:'Nile River'},
  egypt:{en:'Egypt'},
  canaan:{en:'Canaan'},
  aegean:{en:'Aegean Sea'},
  anatolia:{en:'Anatolia (Asia Minor)'},
  exodus:{en:'Exodus'},
  unitedMonarchy:{en:'United Monarchy (David & Solomon)'},
  jerusalem:{en:'Jerusalem'},
  phoenicia:{en:'Phoenicia'},
  israel:{en:'Israel'},
  iranPlateau:{en:'Iranian Plateau'},
  persia:{en:'Persia'},
  greek:{en:'Greek World'},
  macedon:{en:'Macedonia'},
  alexander:{en:"Alexander the Great's Campaigns"},
  apennine:{en:'Italian Peninsula'},
  rome:{en:'Rome'},
  adriatic:{en:'Adriatic Sea'},
  syria:{en:'Syria'},
  empire:{en:'Roman Empire'},
  orient:{en:'Near East / Middle East / Far East'},
  balkans:{en:'Balkans'},
  jordan:{en:'Jordan / Jordan River'},
  italia:{en:'Regions of Italy'},
  cisalpine:{en:'Cisalpine Gaul & the Rubicon'},
  africa:{en:'Carthage & Roman Africa'},
  hispania:{en:'Hispania'},
  gallia:{en:'Gaul'},
  britannia:{en:'Britannia'},
  provinces:{en:'Provinces of the Republic'}
};
const ENGLISH_LABELS = {
  '近东':'Near East','中东':'Middle East','今日“中东”':'Middle East today','远东':'Far East','东南亚':'Southeast Asia','印度次大陆':'Indian Subcontinent','中亚':'Central Asia',
  '地中海':'Mediterranean Sea','黑海':'Black Sea','里海':'Caspian Sea','红海':'Red Sea','波斯湾':'Persian Gulf','阿拉伯海':'Arabian Sea','大西洋':'Atlantic Ocean','北海':'North Sea',
  '爱琴海':'Aegean Sea','亚得里亚海':'Adriatic Sea','伊奥尼亚海':'Ionian Sea','第勒尼安海':'Tyrrhenian Sea','马尔马拉海':'Sea of Marmara',
  '托罗斯山脉':'Taurus Mountains','本都山脉':'Pontic Mountains','扎格罗斯山脉':'Zagros Mountains','厄尔布尔士山脉':'Alborz Mountains','兴都库什山脉':'Hindu Kush','高加索山脉':'Caucasus Mountains',
  '阿尔卑斯山脉':'Alps','亚平宁山脉':'Apennines','品都斯山脉':'Pindus Mountains','巴尔干山脉':'Balkan Mountains','迪纳拉山脉':'Dinaric Alps','罗多彼山脉':'Rhodope Mountains',
  '喀尔巴阡山脉':'Carpathian Mountains','阿特拉斯山脉':'Atlas Mountains','亚美尼亚高原':'Armenian Highlands','科佩特山':'Kopet Dag','苏莱曼山脉':'Sulaiman Mountains','黎巴嫩山':'Mount Lebanon',
  '撒哈拉沙漠':'Sahara Desert','阿拉伯半岛':'Arabian Peninsula','叙利亚沙漠':'Syrian Desert','利比亚沙漠':'Libyan Desert','卡维尔盐漠':'Dasht-e Kavir','卢特沙漠':'Dasht-e Lut','西奈':'Sinai',
  '尼罗河':'Nile River','白尼罗河':'White Nile','青尼罗河':'Blue Nile','阿特巴拉河':'Atbara River','幼发拉底河':'Euphrates River','底格里斯河':'Tigris River','多瑙河':'Danube River','萨瓦河':'Sava River','波河':'Po River','台伯河':'Tiber River','莱茵河':'Rhine River','印度河':'Indus River','约旦河':'Jordan River',
  '迦南':'Canaan','腓尼基':'Phoenicia','黎凡特':'Levant','以色列':'Israel','犹大':'Judah','耶路撒冷':'Jerusalem','提尔':'Tyre','西顿':'Sidon','比布鲁斯':'Byblos','夏琐':'Hazor','米吉多':'Megiddo','示剑':'Shechem','耶利哥':'Jericho','迦萨':'Gaza','希伯仑':'Hebron','伯利恒':'Bethlehem','但':'Dan','别是巴':'Beersheba','撒马利亚':'Samaria','耶斯列':'Jezreel','拉吉':'Lachish','尼波山':'Mount Nebo','加低斯巴尼亚':'Kadesh-barnea','比兰塞':'Pi-Ramesses','安曼':'Amman','佩特拉':'Petra','亚喀巴':'Aqaba','迦太基':'Carthage','加的斯':'Gadir / Cádiz','基提翁':'Kition','约旦':'Jordan','死海':'Dead Sea','加利利海':'Sea of Galilee',
  '埃及':'Egypt','安纳托利亚':'Anatolia','安纳托利亚高原':'Anatolian Plateau','伊朗高原':'Iranian Plateau','波斯':'Persia','希腊世界':'Greek World','巴尔干':'Balkans','马其顿':'Macedonia','亚平宁':'Italian Peninsula','罗马':'Rome','罗马帝国':'Roman Empire','新月沃地':'Fertile Crescent','美索不达米亚':'Mesopotamia','叙利亚':'Syria / Levant','阿契美尼德帝国':'Achaemenid Empire','波斯帝国':'Persian Empire','统一王国':'United Monarchy',
  '雅典':'Athens','斯巴达':'Sparta','科林斯':'Corinth','底比斯':'Thebes','德尔斐':'Delphi','奥林匹亚':'Olympia','米利都':'Miletus','特洛伊':'Troy','萨迪斯':'Sardis','以弗所':'Ephesus','阿索斯':'Assos','佩拉':'Pella','米埃扎':'Mieza','斯塔基拉':'Stagira','腓立比':'Philippi','安菲波利斯':'Amphipolis','奥林匹斯山':'Mount Olympus',
  '亚历山大里亚':'Alexandria','孟菲斯':'Memphis','阿斯旺':'Aswan','锡瓦绿洲':'Siwa Oasis','吉萨金字塔':'Pyramids of Giza','法尤姆':'Faiyum','开罗':'Cairo','喀土穆':'Khartoum','维多利亚湖':'Lake Victoria','塔纳湖':'Lake Tana','苏萨':'Susa','巴比伦':'Babylon','乌鲁克':'Uruk','乌尔':'Ur','尼尼微':'Nineveh','亚述城':'Assur','尼普尔':'Nippur','埃利都':'Eridu','马里':'Mari','巴格达':'Baghdad','泰西封':'Ctesiphon',
  '安条克':'Antioch','阿勒颇':'Aleppo','大马士革':'Damascus','乌加里特':'Ugarit','巴尔米拉':'Palmyra','卡迭石':'Kadesh','哈图沙':'Hattusa','戈尔迪乌姆':'Gordium','恰塔霍裕克':'Çatalhöyük','波斯波利斯':'Persepolis','帕萨尔加德':'Pasargadae','埃克巴坦那':'Ecbatana','德黑兰':'Tehran','喀布尔':'Kabul','达马万德峰':'Mount Damavand','巴克特拉':'Bactra','塔克西拉':'Taxila',
  '马拉松':'Marathon','萨拉米斯':'Salamis','伊苏斯':'Issus','高加米拉':'Gaugamela','格拉尼库斯河':'Granicus River','哈利卡那索斯':'Halicarnassus','赫拉特':'Herat','坎大哈':'Kandahar','马拉坎达':'Maracanda / Samarkand','极远的亚历山大里亚':'Alexandria Eschate','希达斯皮斯河':'Hydaspes River','希发西斯河':'Hyphasis River','帕塔拉':'Patala','格德罗西亚沙漠':'Gedrosian Desert','卡尔马尼亚':'Carmania',
  '克诺索斯':'Knossos','迈锡尼':'Mycenae','提洛岛':'Delos','萨摩斯':'Samos','基克拉泽斯群岛':'Cyclades','多德卡尼斯群岛':'Dodecanese','克里特岛':'Crete','大希腊':'Magna Graecia','叙拉古':'Syracuse','阿克拉加斯':'Akragas','塔拉斯':'Taras','克罗顿':'Croton','埃利亚':'Elea','库迈':'Cumae','马萨利亚':'Massalia','恩波里翁':'Emporion','昔兰尼':'Cyrene','瑙克拉提斯':'Naucratis','拜占庭':'Byzantium','锡诺普':'Sinope','特拉佩祖斯':'Trapezus','奥尔比亚':'Olbia','潘提卡彭':'Panticapaeum','法西斯':'Phasis',
  '贝尔格莱德':'Belgrade','萨拉热窝':'Sarajevo','塞萨洛尼基':'Thessaloniki','威尼斯':'Venice','拉文纳':'Ravenna','斯普利特':'Split','阿奎莱亚':'Aquileia','阿德里亚':'Adria','布伦迪西乌姆':'Brundisium','都拉基乌姆':'Dyrrhachium','卢比孔河':'Rubicon River','西西里':'Sicily','撒丁岛':'Sardinia','科西嘉':'Corsica','奥斯蒂亚':'Ostia','维爱':'Veii','卡普阿':'Capua','塔伦图姆':'Tarentum','阿里米努姆':'Ariminum','比萨':'Pisa','君士坦丁堡':'Constantinople','伦迪尼乌姆':'Londinium','哈德良长城':'Hadrian’s Wall',
  '我 们 的 海':'Mare Nostrum','犹大山地':'Judean Highlands','上埃及':'Upper Egypt','下埃及':'Lower Egypt','努比亚':'Nubia','爱奥尼亚':'Ionia','卡帕多奇亚':'Cappadocia','吕底亚':'Lydia','弗里吉亚':'Phrygia','米底':'Media','呼罗珊':'Khorasan','俾路支':'Balochistan'
};
function englishLabel(t){
  return ENGLISH_LABELS[t] || ENGLISH_LABELS[t.replace(/\s+/g,'')] || ENGLISH_LABELS[t.replace(/（[^）]*）/g,'').trim()] || '';
}
function levantWater(d){
  d.label(LB('加利利海',32.87,35.95,'sea',{en:'Sea of Galilee'}));
  d.label(LB('死海',31.3,35.65,'sea',{en:'Dead Sea'}));
}
const EXODUS_PATH=[[30.80,31.83],[30.6,32.2],[30.05,32.5],[29.6,32.6],[28.9,33.2],[28.539,33.975],[29.1,34.0],[30.65,34.43],[30.25,35.4],[31.2,35.8],[31.768,35.726],[31.95,35.65]];
let narrativeLayer=null;
