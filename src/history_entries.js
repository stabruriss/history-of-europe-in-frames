/* Chapters organize the argument; eras independently group dated map scenes. */
const HISTORY_CONTENT=/*__HISTORY_CONTENT__*/;
const HISTORY_CH=['上古与黑暗时代','希腊城邦时代','马其顿与帝国','希腊化世界','罗马','罗马帝国','犹太教与基督教','中国对照'];
const HC={athens:'#276582',sparta:'#99462e',mino:'#ad7c25',myc:'#637541',hittite:'#866347',
  persia:'#8b644c',thebes:'#387568',macedon:'#6b4d72',war:'#a03327',neutral:'#887b65',route:'#2a7182',celt:'#64763f',parthia:'#765b78',rome:'#a34f36',faith:'#41508c',china:'#2e6b4e'};
const HV={aegean:[[34.3,20.2],[41.3,29.6]],greece:[[35.6,20.4],[39.8,25.1]],
  eastern:[[24.3,19.4],[42.6,49.8]],attica:[[37.55,23.23],[38.45,24.3]],levant:[[27.4,30.2],[35.9,37.2]]};
const HS={
  aigai:['埃盖','Aigai',40.485,22.321,'前336年，腓力二世在此被卫士保萨尼亚斯（Pausanias）刺杀。'],
  philippi:['腓立比','Philippi',41.01,24.285,'腓力扩张到这里，控制附近矿产与交通，扩大军费来源。'],
  cunaxa:['库纳克萨','Cunaxa',33.33,44.13,'前401年小居鲁士争位战死；战场概略定位于巴比伦以北。'],
  trapezus:['特拉佩祖斯','Trapezus',41.005,39.726,'万人军历经山地撤退，抵达黑海。今特拉布宗（Trabzon）。'],
  granicus:['格拉尼库斯','Granicus',40.22,27.25,'前334年击败小亚细亚的波斯总督联军。'],
  issus:['伊苏斯','Issus',36.84,36.20,'前333年击败大流士三世（Darius III）。'],
  alexandria:['亚历山大里亚','Alexandria',31.20,29.92,'前331年建立的新城，后来成为托勒密王朝都城与学术中心。'],
  siwa:['锡瓦绿洲','Siwa Oasis',29.20,25.52,'前331年求问阿蒙（Ammon）神谕，强化神圣王权的形象。'],
  gaugamela:['高加米拉','Gaugamela',36.57,43.43,'前331年击败波斯王军，通往帝国核心的道路打开。'],
  susa:['苏萨','Susa',32.19,48.25,'波斯行政中心与国库所在；前324年亚历山大组织马其顿人与波斯贵族联姻。'],
  persepolis:['波斯波利斯','Persepolis',29.93,52.89,'前330年被占领，宫殿遭焚毁；王室财富转入征服者手中。'],
  ecbatana:['埃克巴坦那','Ecbatana',34.8,48.52,'米底中心。前330年，菲洛塔斯（Philotas）案后，其父帕曼尼翁（Parmenion）在此被杀。'],
  bactra:['巴克特拉','Bactra',36.76,66.90,'巴克特里亚（Bactria）的中心；亚历山大在中亚反复作战，并吸纳地方贵族。'],
  maracanda:['马拉坎达','Maracanda',39.65,66.96,'今撒马尔罕。前328年，国王酒后杀死近臣克利图斯（Cleitus）。'],
  hydaspes:['希达斯皮斯河','Hydaspes',32.93,73.73,'前326年击败波罗斯（Porus），后仍任用他统治当地。'],
  hyphasis:['希法西斯河','Hyphasis',31.55,75.25,'今比亚斯河；前326年军队拒绝继续东进。'],
  opis:['奥皮斯附近','Opis',33.19,44.54,'前324年老兵抗议与和解的地点，位于底格里斯河畔，位置概略。'],
  ipsus:['伊普苏斯','Ipsus',38.86,30.69,'前301年安提柯一世（Antigonus I）战败身亡，重建统一帝国的机会大为缩小。'],
  corupedium:['库鲁佩迪翁','Corupedium',38.59,28.08,'前281年塞琉古击败利西马科斯；塞琉古不久也遇刺，分配继续变化。'],
  antioch:['安条克','Antioch',36.20,36.16,'约前300年建立，成为塞琉古王朝的主要中心之一。'],
  seleucia:['塞琉西亚','Seleucia on the Tigris',33.1,44.52,'底格里斯河畔的塞琉古大城，联系两河与伊朗腹地。'],
  pergamon:['帕加马','Pergamon',39.12,27.18,'安纳托利亚地方权力中心，后来发展为阿塔罗斯王朝。'],
  taxila:['塔克西拉','Taxila',33.75,72.83,'前4世纪末纳入孔雀王朝的南亚西北部网络。'],
  athens:['雅典','Athens',37.975,23.727,'阿提卡的政治中心；古典时代的海军与民主城邦。'],
  sparta:['斯巴达','Sparta',37.074,22.43,'拉科尼亚的军事公民共同体，长期控制西侧的美塞尼亚。'],
  corinth:['科林斯','Corinth',37.906,22.879,'连接伯罗奔尼撒与希腊中部的地峡城邦。'],
  argos:['阿尔戈斯','Argos',37.635,22.727,'伯罗奔尼撒的重要城邦；并非斯巴达同盟的固定成员。'],
  thebes:['底比斯','Thebes',38.322,23.318,'彼奥提亚的主要城邦，前4世纪一度取得军事优势。'],
  pella:['佩拉','Pella',40.76,22.52,'马其顿王国的重要都城。'],
  knossos:['克诺索斯','Knossos',35.298,25.163,'克里特的大型宫殿中心；前1450年后出现希腊语的线形文字B行政记录。'],
  phaistos:['斐斯托斯','Phaistos',35.051,24.813,'克里特南部的重要米诺斯宫殿遗址。'],
  mycenae:['迈锡尼','Mycenae',37.731,22.757,'希腊大陆多个宫殿与要塞中心之一。'],
  pylos:['皮洛斯','Pylos',37.027,21.696,'迈锡尼宫殿遗址，出土大量线形文字B行政档案。'],
  tiryns:['梯林斯','Tiryns',37.599,22.8,'阿尔戈利斯地区的重要迈锡尼要塞。'],
  hattusa:['哈图沙','Hattusa',40.02,34.616,'赫梯帝国的都城，中央统治在前1200年前后瓦解。'],
  ugarit:['乌加里特','Ugarit',35.602,35.782,'黎凡特北部港口，晚期青铜时代贸易与文字材料的重要来源。'],
  kadesh:['卡迭石','Kadesh',34.556,36.518,'约前1274年埃及与赫梯交战之地；约前1259年的和约属于其后外交进程。'],
  memphis:['孟菲斯','Memphis',29.85,31.25,'尼罗河下游的重要政治与宗教中心。'],
  luxor:['埃及底比斯','Thebes / Luxor',25.72,32.61,'尼罗河上游的重要中心；与希腊底比斯是两个地方。'],
  medinet:['麦地那哈布','Medinet Habu',25.72,32.60,'拉美西斯三世神庙浮雕与铭文保存了海上民族战争叙述。'],
  babylon:['巴比伦','Babylon',32.54,44.42,'美索不达米亚南部的重要城市；晚期青铜时代处于卡西特王朝统治下。'],
  uruk:['乌鲁克','Uruk',31.32,45.64,'前四千纪城市化与早期文字发展的重要中心。'],
  ur:['乌尔','Ur',30.96,46.10,'美索不达米亚南部城市。'],
  jericho:['耶利哥','Jericho',31.871,35.444,'约旦谷地的早期定居中心，聚落历史远早于铁器时代。'],
  jerusalem:['耶路撒冷','Jerusalem',31.778,35.235,'犹大山地城市，大卫—所罗门传统中的王都。'],
  tyre:['提尔','Tyre',33.271,35.196,'腓尼基沿海城市与海上贸易节点。'],
  gaza:['迦萨','Gaza',31.503,34.466,'非利士沿海城市之一，位于通往埃及的交通走廊。'],
  shechem:['示剑','Shechem',32.213,35.282,'迦南中央山地的重要聚落。'],
  lefkandi:['莱夫坎迪','Lefkandi',38.412,23.678,'优卑亚岛遗址，说明早期铁器时代仍存在财富积累和远距离联系。'],
  miletus:['米利都','Miletus',37.53,27.28,'伊奥尼亚重要城邦；前494年被波斯攻陷。'],
  sardis:['萨迪斯','Sardis',38.49,28.04,'吕底亚旧都，后来成为波斯在小亚细亚的重要中心。'],
  delos:['提洛岛','Delos',37.396,25.268,'提洛同盟最初的金库所在地；前454年金库迁往雅典。'],
  syracuse:['叙拉古','Syracuse',37.06,15.29,'西西里强大的希腊城邦，雅典在前415—前413年远征中试图击败它。'],
  taras:['塔拉斯','Taras / Tarentum',40.46,17.24,'南意大利希腊城邦，今塔兰托。'],
  byzantium:['拜占庭','Byzantium',41.01,28.98,'博斯普鲁斯海峡上的希腊城市，控制通往黑海的重要通道。'],
  sinope:['锡诺普','Sinope',42.03,35.15,'黑海南岸的希腊城邦与港口。'],
  marathon:['马拉松','Marathon',38.12,23.973,'前490年，雅典与普拉提亚军队在此击败波斯军队。'],
  eretria:['埃雷特里亚','Eretria',38.40,23.79,'参与援助伊奥尼亚起义，前490年遭波斯攻陷。'],
  athos:['阿索斯山','Mount Athos',40.158,24.326,'前492年，波斯舰队在附近遭风暴重创。'],
  thermopylae:['温泉关','Thermopylae',38.796,22.536,'前480年，列奥尼达与斯巴达及其他希腊守军抵抗波斯入侵。'],
  salamis:['萨拉米斯','Salamis',37.956,23.563,'前480年，希腊联合舰队利用海峡条件击败波斯舰队。'],
  plataea:['普拉提亚','Plataea',38.212,23.268,'前479年，希腊联军击败马尔多尼奥斯指挥的波斯主力。'],
  mycale:['米卡勒','Mycale',37.666,27.06,'前479年，希腊军队攻击波斯舰队及其海岸营地。'],
  piraeus:['比雷埃夫斯','Piraeus',37.941,23.643,'雅典的主要港口，与城市通过长墙体系相连。'],
  decelea:['德凯利亚','Decelea',38.164,23.786,'前413年起斯巴达长期驻军，持续压迫雅典腹地。'],
  aegospotami:['羊河','Aegospotami',40.35,26.51,'前405年吕山德在此摧毁雅典主力舰队，切断重要补给通道。'],
  cnidus:['克尼多斯','Cnidus',36.685,27.375,'前394年，斯巴达舰队在波斯支持的海军进攻下遭到重创。'],
  leuctra:['留克特拉','Leuctra',38.262,23.183,'前371年，底比斯军队重创斯巴达，国王克列奥姆布罗托斯一世战死。'],
  messene:['美塞涅','Messene',37.178,21.919,'前369年建立的新城，象征美塞尼亚摆脱斯巴达统治。'],
  mantinea:['曼丁尼亚','Mantinea',37.617,22.391,'前362年交战，伊巴密浓达战死，底比斯未能维持稳定霸权。'],
  chaeronea:['喀罗尼亚','Chaeronea',38.494,22.844,'前338年，腓力二世击败以雅典与底比斯为核心的联军。']
};

Object.assign(HS,{
  delphi:['德尔斐','Delphi',38.48,22.5,'阿波罗圣所；前279年凯尔特军队在附近遭抵抗而撤退。'],
  lysimachia:['利西马基亚','Lysimachia',40.60,26.85,'前277年，安提柯二世（Antigonus II Gonatas）击败另一支凯尔特军队，借胜利巩固马其顿王位。'],
  nicomedia:['比提尼亚海岸','Bithynian coast',40.76,29.94,'尼科美德一世（Nicomedes I）在前278／277年招凯尔特人跨海助战；标注比提尼亚海岸的地理位置。'],
  ancyra:['安居拉','Ancyra',39.93,32.86,'今安卡拉，加拉太地区的重要城市。'],
  pessinus:['佩西努斯','Pessinus',39.35,31.58,'安纳托利亚的宗教与聚落中心，处于加拉太人定居活动地带。'],
  sellasia:['塞拉西亚','Sellasia',37.23,22.42,'前222年，安提柯三世（Antigonus III Doson）与盟军击败克里昂米尼三世；战场概略定位。'],
  nisa:['尼萨','Nisa',37.95,58.21,'帕提亚早期的重要王室中心，位于科佩特山北麓。'],
  raphia:['拉菲亚','Raphia',31.29,34.24,'前217年，托勒密四世（Ptolemy IV）击败安条克三世（Antiochus III），保住南黎凡特。'],
  rosetta:['罗塞塔','Rosetta / Rashid',31.40,30.42,'石碑发现地；前196年的诏令出自孟菲斯祭司会议，并在不同神庙立碑。'],
  syene:['赛伊尼','Syene',24.09,32.9,'今阿斯旺；埃拉托色尼比较这里与亚历山大里亚的太阳高度，估算地球周长。'],
  cynoscephalae:['库诺斯克法莱','Cynoscephalae',39.35,22.55,'前197年，罗马击败腓力五世（Philip V）；战场概略定位于色萨利。'],
  magnesia:['马格尼西亚','Magnesia',38.65,27.45,'前190年，罗马及盟军击败安条克三世；战场概略定位。'],
  apamea:['阿帕米亚','Apamea',38.07,30.17,'前188年和约迫使塞琉古退出托罗斯山以西大片地区，并支付赔款。'],
  pydna:['皮德纳','Pydna',40.36,22.61,'前168年罗马击败珀尔修斯（Perseus），安提柯王朝覆亡。'],
  actium:['阿克提乌姆','Actium',38.94,20.77,'前31年，屋大维一方击败安东尼与克娄巴特拉的舰队。'],
  rome:['罗马','Rome',41.893,12.483,'七丘与台伯岛渡口所在；城中广场谷地原是沼泽。'],
  ostia:['奥斯蒂亚','Ostia',41.756,12.292,'台伯河口，附近的盐场是罗马早期的财源；传说第四王安库斯·马基乌斯在此建城。'],
  veii:['维爱','Veii',42.024,12.401,'伊特鲁里亚大城，离罗马不到二十公里；前396年被罗马攻灭。'],
  albalonga:['阿尔巴隆伽','Alba Longa',41.75,12.65,'传说中罗马人祖先的城，在阿尔班山上；位置概略。'],
  cures:['库雷斯','Cures',42.21,12.72,'萨宾人的城；传说萨宾王提图斯·塔提乌斯和第二王努马都出自这里。'],
  tarquinii:['塔尔奎尼','Tarquinii',42.25,11.76,'伊特鲁里亚大城；传说老塔克文出身于此。'],
  pyrgi:['皮尔吉','Pyrgi',42.016,11.958,'伊特鲁里亚城市卡厄瑞的港口；约前500年的金箔铭文用伊特鲁里亚文和腓尼基文写成，迦太基商人常来。'],
  cumae:['库迈','Cumae',40.848,14.054,'意大利最早的希腊殖民城之一；希腊字母经此传给伊特鲁里亚人，再传给罗马人。'],
  clusium:['克卢西乌姆','Clusium',43.017,11.949,'伊特鲁里亚内陆大城，今丘西；国王波尔塞纳的都城。'],
  capua:['卡普阿','Capua',41.08,14.25,'坎帕尼亚平原的大城，早期受伊特鲁里亚人控制；前338年后成为没有投票权的罗马公民。'],
  ardea:['阿尔代亚','Ardea',41.61,12.54,'拉丁沿海城市；前509年傲慢者塔克文正在围攻此城，罗马城中起事。'],
  antium:['安提乌姆','Antium',41.45,12.63,'沿海城市，前5世纪落入沃尔斯基人之手；前338年被罗马收服。今安齐奥。'],
  circeii:['基尔凯伊','Circeii',41.235,13.09,'拉丁海岸南端；前509年罗马与迦太基的条约点名的城市之一。'],
  tarracina:['塔拉奇纳','Tarracina',41.29,13.25,'拉丁海岸南端，今泰拉奇纳；也见于前509年的罗马—迦太基条约。'],
  aricia:['阿里恰','Aricia',41.72,12.67,'约前504年，库迈援军在此击败伊特鲁里亚军。'],
  regillus:['雷吉卢斯湖','Lake Regillus',41.81,12.70,'约前496年罗马在此击败支持塔克文的拉丁诸城；湖已干涸，位置概略。'],
  monssacer:['圣山','Mons Sacer',41.94,12.53,'阿尼奥河畔的小山。前494年、前449年平民两度撤离到此。'],
  algidus:['阿尔吉杜斯山口','Mount Algidus',41.745,12.77,'阿尔班山东侧的山口，埃奎人南下的通道；前458年辛辛纳图斯在此解围。'],
  allia:['阿里亚河','Allia',42.03,12.54,'台伯河支流，在罗马以北约十六公里；前390年（传统纪年）罗马军在此惨败。'],
  sutrium:['苏特里乌姆','Sutrium',42.24,12.22,'前4世纪初设立的拉丁殖民地，守住原维爱地界的北缘。'],
  nepet:['奈佩特','Nepet',42.23,12.35,'与苏特里乌姆并称“伊特鲁里亚的门户”。'],
  tibur:['提布尔','Tibur',41.96,12.80,'拉丁大城，今蒂沃利；前338年后保留独立盟邦地位。'],
  praeneste:['普雷内斯特','Praeneste',41.84,12.89,'拉丁大城，今帕莱斯特里纳；前338年后保留独立盟邦地位。'],
  caudium:['卡夫丁峡谷','Caudine Forks',41.06,14.62,'前321年罗马军在此被萨莫奈人围困投降；位置概略。'],
  sentinum:['森提努姆','Sentinum',43.42,12.86,'前295年罗马击败萨莫奈人与高卢人等的联军。'],
  janiculum:['雅尼库鲁姆山','Janiculum',41.889,12.462,'台伯河西岸的山；前287年平民最后一次撤离到此。'],
  heraclea:['赫拉克莱亚','Heraclea',40.21,16.68,'前280年皮洛士在此击败罗马军。'],
  asculum:['阿斯库路姆','Asculum',41.21,15.56,'前279年皮洛士再胜一仗，代价惨重。'],
  beneventum:['贝内文图姆','Beneventum',41.13,14.78,'前275年皮洛士在此战败。此地原名马莱文图姆（Maleventum，“恶事”），罗马人改称贝内文图姆（“好事”）。'],
  messana:['墨西拿','Messana',38.19,15.55,'西西里东北角，扼守海峡。前264年城中的意大利雇佣兵马麦丁人同时向罗马和迦太基求援。'],
  mylae:['迈莱','Mylae',38.23,15.24,'前260年罗马舰队在此首次大胜迦太基海军。今米拉佐。'],
  aegates:['埃加迪群岛','Aegates Islands',37.97,12.25,'西西里西端外海；前241年罗马舰队在此决胜，第一次布匿战争结束。'],
  carthage:['迦太基','Carthage',36.853,10.323,'提尔人建立的殖民城，西地中海的海上强国；前146年被罗马焚毁。'],
  cartnova:['新迦太基','Carthago Nova',37.6,-0.98,'巴卡家族在西班牙的都城，附近有银矿；前209年被大西庇阿奇袭攻下。今卡塔赫纳。'],
  saguntum:['萨贡托','Saguntum',39.68,-0.27,'罗马在西班牙的盟友；前219年被汉尼拔围攻八个月后攻破，成了第二次布匿战争的导火索。'],
  trebia:['特雷比亚河','Trebia',45.0,9.6,'波河支流；前218年冬汉尼拔在此首次大败罗马军。位置概略。'],
  trasimene:['特拉西梅诺湖','Lake Trasimene',43.19,12.03,'前217年汉尼拔在湖北岸设伏，罗马执政官弗拉米尼乌斯（Flaminius）战死。'],
  cannae:['坎尼','Cannae',41.31,16.13,'前216年汉尼拔在此两翼合围罗马大军，罗马阵亡五万以上。'],
  zama:['扎马','Zama',36.2,9.2,'前202年大西庇阿在此击败汉尼拔；确切战场不明，位置概略。'],
  numantia:['努曼提亚','Numantia',41.81,-2.44,'西班牙内陆的凯尔特伊比利亚人城市，抵抗罗马二十年；前133年被小西庇阿围困攻破。'],
  epirus:['伊庇鲁斯','Epirus',39.55,20.75,'希腊西北山地；前167年元老院下令洗劫这里七十座城，十五万人被卖为奴。'],
  scolacium:['斯科拉基乌姆','Scolacium',38.81,16.60,'前122年盖约·格拉古设的殖民地“密涅瓦”，今斯奎拉切附近。'],
  cirta:['锡尔塔','Cirta',36.365,6.614,'努米底亚的都城；前112年朱古达攻破此城，屠杀城中的意大利商人。今君士坦丁。'],
  noreia:['诺雷亚','Noreia',46.9,14.4,'前113年辛布里人在此附近击败罗马军；确切位置不明。'],
  arausio:['阿劳西奥','Arausio',44.138,4.807,'前105年罗马两支大军在此被辛布里人歼灭，两位统帅不和。今奥朗日。'],
  aquaesextiae:['阿奎塞克斯提埃','Aquae Sextiae',43.529,5.447,'前102年马略在此全歼条顿人。今普罗旺斯地区艾克斯。'],
  vercellae:['韦尔切莱','Vercellae',45.32,8.42,'前101年马略与卡图卢斯在此附近全歼辛布里人；战场位置有争议。'],
  corfinium:['科尔菲尼乌姆','Corfinium',42.12,13.84,'前91年起兵的盟邦以此为都，改名“意大利”（Italia），设元老院和两位执政官。'],
  asculumpicenum:['阿斯库路姆（皮切努姆）','Asculum Picenum',42.854,13.575,'前91年起事之地：城里杀了罗马司法官和所有罗马人。与皮洛士打过仗的阿斯库路姆不是一地。今阿斯科利皮切诺。'],
  teanum:['泰阿努姆','Teanum Sidicinum',41.25,14.07,'盖约·格拉古讲过：执政官夫人嫌这里的男浴室腾得慢，当地长官就被扒衣绑在广场上鞭打。'],
  nola:['诺拉','Nola',40.926,14.527,'前88年苏拉的军队在此围城，他从这里带兵进军罗马。公元14年奥古斯都死在这里。'],
  minturnae:['明图尔奈','Minturnae',41.24,13.766,'前88年逃亡的马略躲在附近沼泽里被抓；奉命杀他的奴隶下不了手。'],
  brundisium:['布伦迪西乌姆','Brundisium',40.638,17.946,'渡海去希腊的大港。前83年苏拉在此登陆回国，前62年庞培在此解散军队。今布林迪西。'],
  puteoli:['普特奥利','Puteoli',40.823,14.122,'苏拉交权后隐居此地附近写回忆录，前78年病死。今波佐利。'],
  osca:['奥斯卡','Osca',42.14,-0.41,'塞多留在西班牙的根据地，他在这里给当地贵族子弟办罗马式学校。今韦斯卡。'],
  vesuvius:['维苏威火山','Vesuvius',40.821,14.426,'前73年斯巴达克斯的人马据守山顶，顺着野葡萄藤编的绳梯下悬崖，突袭围山的罗马军。'],
  coracesium:['科拉凯西乌姆','Coracesium',36.54,32.0,'奇里乞亚海盗的最后据点，前67年向庞培投降。今阿拉尼亚。'],
  panticapaeum:['潘提卡彭','Panticapaeum',45.35,36.47,'前63年米特拉达梯六世在此自尽。今刻赤。'],
  luca:['卢卡','Luca',43.84,10.50,'前56年恺撒在此会见庞培、克拉苏，续订三人同盟；据说来了两百多位元老。'],
  alesia:['阿莱西亚','Alesia',47.537,4.50,'前52年维钦托利据守的山城；恺撒筑内外两道围墙，里困守军，外挡援军。'],
  carrhae:['卡莱','Carrhae',36.87,39.03,'前53年克拉苏的七个军团在此被安息骑射手围歼。今土耳其哈兰。'],
  rubicon:['卢比孔河','Rubicon',44.10,12.40,'山南高卢与意大利本土的界河；前49年1月恺撒带第十三军团渡河。'],
  ilerda:['伊莱尔达','Ilerda',41.617,0.62,'前49年恺撒在此逼降庞培在西班牙的两员大将。今莱里达。'],
  dyrrachium:['迪拉基乌姆','Dyrrachium',41.32,19.45,'前48年恺撒围困庞培未果，反吃败仗。今都拉斯。'],
  pharsalus:['法萨卢斯','Pharsalus',39.296,22.383,'前48年8月恺撒以两万多人击败庞培的四万多人。'],
  pelusium:['佩卢西乌姆','Pelusium',31.04,32.55,'前48年9月庞培在附近海滩登岸时被刺死。'],
  zela:['泽拉','Zela',40.30,35.89,'前47年恺撒在此击败本都王子法纳西斯。'],
  thapsus:['塔普苏斯','Thapsus',35.62,11.05,'前46年4月恺撒在此击溃元老派和努米底亚王的联军。'],
  utica:['乌提卡','Utica',37.057,10.06,'前46年小加图守在此城，安排部众出海后自尽。'],
  munda:['蒙达','Munda',37.42,-4.85,'前45年恺撒在此击败庞培的两个儿子；具体战场不确定。'],
  apollonia:['阿波罗尼亚','Apollonia',40.72,19.47,'前44年十八岁的屋大维在此读书练兵，听到恺撒遇刺后渡海回国。'],
  mutina:['穆提那','Mutina',44.647,10.925,'前43年4月元老院的军队在此打败安东尼，两位执政官却都战死。今摩德纳。'],
  bononia:['博诺尼亚','Bononia',44.494,11.343,'前43年秋屋大维、安东尼、雷必达在附近河洲上会面，结成后三头。今博洛尼亚。'],
  formiae:['福尔米亚','Formiae',41.256,13.606,'前43年12月7日西塞罗在海边别墅附近被杀。'],
  perusia:['佩鲁西亚','Perusia',43.11,12.39,'前41—前40年屋大维在此围困安东尼的弟弟和妻子富尔维娅。今佩鲁贾。'],
  naulochus:['瑙洛库斯','Naulochus',38.27,15.42,'前36年阿格里帕在此海战击败庞培之子塞克斯图斯。'],
  massilia:['马西利亚','Massilia',43.296,5.37,'公元2年，奥古斯都的外孙卢基乌斯去西班牙途中病死在这里。今马赛。'],
  limyra:['利米拉','Limyra',36.34,30.17,'公元4年，奥古斯都的外孙盖乌斯带着在亚美尼亚受的伤，死在吕基亚的这座小城。'],
  rhodes:['罗得岛','Rhodes',36.44,28.22,'前6年至公元2年，提比略负气在此闲居。'],
  teutoburg:['条顿堡森林','Teutoburg Forest',52.41,8.13,'公元9年瓦卢斯的三个军团在此全军覆没；战场定在今卡尔克里泽一带。'],
  ravenna:['拉文纳','Ravenna',44.42,12.2,'奥古斯都在此设舰队；402年起成为西罗马皇帝的驻地。'],
  misenum:['米塞努姆','Misenum',40.78,14.08,'奥古斯都在此设舰队；公元37年提比略死在这里的别墅。'],
  capreae:['卡普里岛','Capreae',40.55,14.24,'提比略晚年长住岛上，十年没回罗马。'],
  camulodunum:['卡姆洛杜努姆','Camulodunum',51.89,0.9,'43年克劳狄乌斯亲临，接受不列颠诸王投降。今科尔切斯特。'],
  lugdunum:['卢格杜努姆','Lugdunum',45.76,4.83,'高卢的首府，克劳狄乌斯生在这里；197年塞维鲁在此打败阿尔比努斯。今里昂。'],
  colonia:['科隆','Colonia Agrippinensis',50.94,6.96,'莱茵河边的大城；69年维特里乌斯在此被拥立，98年图拉真在此得知自己继位。'],
  bedriacum:['贝德里亚库姆','Bedriacum',45.13,10.44,'克雷莫纳附近；69年的两场内战决战都打在这里。'],
  sarmizegetusa:['萨尔米泽杰图萨','Sarmizegetusa Regia',45.62,23.31,'达契亚王国的都城，106年被图拉真攻破。'],
  ctesiphon:['泰西封','Ctesiphon',33.09,44.58,'安息和萨珊波斯的都城，在底格里斯河边；116年被图拉真攻下。'],
  carnuntum:['卡农图姆','Carnuntum',48.11,16.86,'多瑙河边的军团大营；马可·奥勒留在此写下部分《沉思录》，193年塞维鲁在此被拥立。'],
  aquileia:['阿奎莱亚','Aquileia',45.77,13.37,'意大利的东北门户；约170年被马科曼尼人围攻。'],
  leptis:['大莱普提斯','Leptis Magna',32.64,14.29,'塞普蒂米乌斯·塞维鲁的家乡，他当皇帝后在这里大兴土木。'],
  eboracum:['埃波拉库姆','Eboracum',53.96,-1.08,'不列颠北部的军团大营，今约克；211年塞维鲁死在这里，306年君士坦丁在这里被拥立。'],
  emesa:['埃米萨','Emesa',34.73,36.71,'叙利亚城市，太阳神埃拉伽巴尔的圣城；今霍姆斯。'],
  mogontiacum:['摩贡提亚库姆','Mogontiacum',50.0,8.27,'莱茵河边的军团大营，今美因茨；235年塞维鲁·亚历山大在附近被自己的兵杀死。'],
  abritus:['阿布里图斯','Abritus',43.52,26.53,'251年德基乌斯在此死于哥特人之手。'],
  edessa:['埃德萨','Edessa',37.16,38.79,'260年瓦勒良在附近被沙普尔一世俘虏。'],
  palmyra:['帕尔米拉','Palmyra',34.55,38.27,'沙漠商路上的绿洲城市；芝诺比娅的都城，272年被奥勒良攻下。'],
  treveri:['特里尔','Augusta Treverorum',49.75,6.64,'高卢帝国后期的都城，四帝共治时西部副皇帝的驻地。'],
  nicomedeia:['尼科米底亚','Nicomedia',40.77,29.92,'戴克里先的驻地；303年大迫害从这里开始。'],
  sirmium:['西尔米乌姆','Sirmium',44.97,19.61,'多瑙河防线上的大城，四帝共治时东部副皇帝的驻地。'],
  mediolanum:['米兰','Mediolanum',45.46,9.19,'四帝共治时西部正皇帝的驻地；313年两位皇帝在此商定宽容基督教。'],
  salona:['萨洛纳','Salona',43.54,16.48,'达尔马提亚首府；戴克里先退位后住在附近海边的宫殿里，即今斯普利特老城。'],
  constantinople:['君士坦丁堡','Constantinople',41.01,28.98,'原名拜占庭，330年君士坦丁迁都于此；东罗马延续到1453年。'],
  nicaea:['尼西亚','Nicaea',40.43,29.72,'325年君士坦丁在此召开第一次大公会议。'],
  adrianople:['阿德里安堡','Adrianople',41.68,26.56,'378年哥特人在此大败罗马军，皇帝瓦伦斯战死。今埃迪尔内。'],
  marcianopolis:['马尔西亚诺波利斯','Marcianopolis',43.225,27.585,'下默西亚的大城，今保加利亚代夫尼亚；376至377年间渡河的哥特人在此反了。'],
  brigetio:['布里盖提奥','Brigetio',47.733,18.167,'潘诺尼亚的多瑙河军团大营，今匈牙利瑟尼；375年瓦伦提尼安一世在此接见夸迪人使节，气得中风而死。'],
  vienne:['维埃纳','Vienna (Vienne)',45.524,4.878,'罗讷河边的城市，今法国维埃纳；392年5月瓦伦提尼安二世被发现吊死在这里的寝宫。'],
  cucusus:['库库苏斯','Cucusus',38.02,36.49,'托罗斯山里的小镇，今土耳其戈克孙；404—407年金口约翰的流放地。'],
  comana:['科马纳','Comana Pontica',40.36,36.62,'本都的小城，今托卡特附近；407年金口约翰死在城外。'],
  pityus:['皮提乌斯','Pityus',43.17,40.33,'黑海东岸的边镇，今皮聪达；金口约翰最后的流放地，他没走到。'],
  ticinum:['提契努姆','Ticinum',45.185,9.154,'今帕维亚；408年8月驻军在此哗变，杀了一批大臣。'],
  viminacium:['维米纳基乌姆','Viminacium',44.74,21.21,'多瑙河边的军团大营；约441年被匈人攻破。'],
  mincio:['明乔河口','Mincio',45.10,10.95,'曼图亚附近，明乔河入波河处；452年教宗利奥在这一带见阿提拉。'],
  durostorum:['杜罗斯托鲁姆','Durostorum',44.12,27.26,'下多瑙河的要塞；376年哥特人大约在这一段渡河。今锡利斯特拉。'],
  thessalonica:['帖撒罗尼迦','Thessalonica',40.64,22.94,'380年狄奥多西在此颁诏定基督教为国教；390年在此屠城。'],
  frigidus:['冷河','Frigidus',45.89,13.9,'394年狄奥多西在此打败西部的篡位者。今斯洛文尼亚的维帕瓦河谷。'],
  tolosa:['图卢兹','Tolosa',43.6,1.44,'418年起西哥特王国的都城。'],
  hippo:['希波','Hippo Regius',36.88,7.75,'奥古斯丁任主教的城市；430年他死在汪达尔人围城之中。今阿尔及利亚安纳巴。'],
  gesoriacum:['格索里亚库姆','Gesoriacum',50.73,1.6,'40年卡利古拉在此列阵，让士兵捡贝壳当“大洋的战利品”，还修了一座灯塔。今布洛涅。'],
  catalaunian:['卡塔隆平原','Catalaunian Plains',48.95,4.36,'451年罗马与西哥特联军在此挡住阿提拉；具体战场不确定。'],
  albapompeia:['阿尔巴·庞培亚','Alba Pompeia',44.70,8.03,'利古里亚的小城，今皮埃蒙特的阿尔巴；126年佩蒂纳克斯生在这里，父亲是做木材生意的释奴。'],
  londinium:['伦迪尼乌姆','Londinium',51.51,-0.09,'不列颠行省的首府，今伦敦。'],
  shahba:['菲利普波利斯','Philippopolis',32.85,36.63,'阿拉伯人菲利普的家乡，他当皇帝后把家乡的村镇改建成城。今叙利亚沙赫巴。'],
  circesium:['基尔克西乌姆','Circesium',35.16,40.43,'幼发拉底河与哈布尔河交汇处的边城；244年戈尔迪安三世死在这一带的军中，后人在附近的扎伊塔给他立了坟。'],
  naissus:['纳伊苏斯','Naissus',43.32,21.9,'今塞尔维亚尼什；269年克劳狄二世在此大败哥特人，君士坦丁也生在这里。'],
  nisibis:['尼西比斯','Nisibis',37.07,41.22,'美索不达米亚北部的边防重镇；363年约维安把它割给了波斯。'],
  lutetia:['卢泰提亚','Lutetia',48.85,2.35,'今巴黎；360年高卢军团在此拥立尤利安。'],
  italica:['意大利卡','Italica',37.44,-6.05,'西班牙南部的罗马殖民城，今塞维利亚附近；图拉真、哈德良的家族都出自这里。'],
  antinoopolis:['安提诺波利斯','Antinoopolis',27.81,30.88,'130年安提诺乌斯在附近的尼罗河里淹死，哈德良在此建城纪念他。'],
  nemausus:['尼莫苏斯','Nemausus',43.84,4.36,'高卢南部的城市，今尼姆；安东尼·庇护的家族出自这里。'],
  selinus:['塞利努斯','Selinus',36.27,32.3,'小亚细亚南岸的港城；117年8月图拉真病死在这里。'],
  serdica:['塞尔迪卡','Serdica',42.70,23.32,'多瑙河防线后方的大城，今索非亚；311年伽列里乌斯死在这一带，君士坦丁迁都前常住这里。'],
  ilium:['伊利昂','Ilium',39.957,26.239,'特洛伊故城；罗马人自称特洛伊人的后代，君士坦丁先在这一带为新都打地基。'],
  arelate:['阿雷拉特','Arelate',43.677,4.631,'罗讷河口的城市，今阿尔勒；314年西部主教在此开会。'],
  verona:['维罗纳','Verona',45.438,10.993,'波河平原东北的要冲；312年君士坦丁在此围城破敌。'],
  cibalae:['基巴莱','Cibalae',45.29,18.80,'萨瓦河、多瑙河之间的城市，今克罗地亚温科夫齐；316年君士坦丁在此打败李锡尼。'],
  pola:['波拉','Pola',44.87,13.85,'伊斯特里亚半岛南端的港城，今克罗地亚普拉；326年克里斯普斯在此被处死。'],
  samaria:['撒马利亚','Samaria',32.276,35.197,'北国以色列的都城，前722年被亚述攻破。'],
  nineveh:['尼尼微','Nineveh',36.36,43.15,'亚述帝国的都城，今伊拉克摩苏尔对岸。'],
  caesarea:['凯撒里亚','Caesarea Maritima',32.50,34.89,'希律修的海港，罗马总督驻在这里。'],
  qumran:['库姆兰','Qumran',31.741,35.459,'死海西北岸的遗址；1947年起附近山洞里出土死海古卷。'],
  nazareth:['拿撒勒','Nazareth',32.70,35.30,'加利利的小村，耶稣在这里长大。'],
  tarsus:['塔尔苏斯','Tarsus',36.918,34.892,'小亚细亚南部的大城，保罗的家乡。'],
  ephesus:['以弗所','Ephesus',37.941,27.342,'亚细亚行省的大城；保罗在此传道两年多。'],
  masada:['马萨达','Masada',31.316,35.354,'死海边的山顶要塞，希律修的行宫；73年守军全体自尽。'],
  yavneh:['雅夫内','Yavneh',31.877,34.739,'70年后拉比们在这里重整犹太教。'],
  vagharshapat:['瓦加尔沙帕特','Vagharshapat',40.16,44.29,'亚美尼亚的王城，今埃奇米阿津。'],
  haran:['哈兰','Harran',36.87,39.03,'幼发拉底河支流边的商城；经书说亚伯拉罕一家从乌尔北上，在这里住过。罗马时代叫卡莱。'],
  amarna:['阿玛尔纳','Amarna',27.65,30.90,'法老阿赫那吞新建的都城；这里出土的外交泥板里，迦南诸王向法老告“哈比鲁人”的状。'],
  piramesses:['培尔-拉美西斯','Pi-Ramesses',30.80,31.83,'拉美西斯二世在尼罗河三角洲东部新建的都城，今坎提尔一带；经书里的“兰塞”。'],
  dan:['但城','Tel Dan',33.249,35.652,'以色列北界的城；1993—1994年在这里出土的石碑刻着“大卫家”。'],
  lachish:['拉吉','Lachish',31.565,34.849,'犹大的第二大城；前701年被亚述攻破，亚述王在尼尼微宫中刻下了攻城的浮雕。'],
  megiddo:['米吉多','Megiddo',32.585,35.185,'扼守沿海大道的要塞；前609年约西亚在此阵亡。“哈米吉多顿”（末日决战之地）一名由此而来。'],
  elephantine:['象岛','Elephantine',24.085,32.887,'尼罗河第一瀑布前的岛；波斯时代驻着一支犹太雇佣兵，有自己的耶和华神庙。'],
  capernaum:['迦百农','Capernaum',32.881,35.575,'加利利海北岸的渔村；福音书说耶稣在这里住过，彼得的家也在这里。'],
  chalcedon:['卡尔西顿','Chalcedon',40.984,29.027,'博斯普鲁斯海峡亚洲一侧，与君士坦丁堡隔水相望，今伊斯坦布尔卡德柯伊。'],
  colzim:['安东尼山','Mount Colzim',28.925,32.348,'红海边的山，安东尼晚年在此隐修四十多年，山脚的圣安东尼修道院至今还在。'],
  tabennisi:['塔本尼西','Tabennisi',26.06,32.30,'上埃及尼罗河边的荒村，帕科米乌在此办起第一座修院。'],
  telanissos:['圣西门堡','Qal’at Sim’an',36.334,36.844,'阿勒颇西北的山上，西门站柱之地；他死后围着石柱修起大教堂，废墟至今还在。'],
  mazaca:['凯撒里亚（卡帕多西亚）','Caesarea Mazaca',38.72,35.49,'卡帕多西亚的首府，今土耳其开塞利；370年起巴西尔在此任主教。'],
  nazianzus:['纳齐安','Nazianzus',38.40,34.35,'卡帕多西亚的小城，格列高利的父亲在此任主教。'],
  kharga:['大绿洲','Great Oasis',25.44,30.56,'埃及西部沙漠里的绿洲，今哈里杰；聂斯托利435年被流放到这里。'],
  ariminum:['里米尼','Ariminum',44.06,12.57,'亚得里亚海边的城市；359年西部四百来位主教在此被扣着开会。'],
  lushan:['庐山东林寺','Donglin Temple, Mount Lu',29.604,115.956,'慧远在此建寺讲经，404年写《沙门不敬王者论》，主张出家人不拜王者。'],
  yangshao:['仰韶村','Yangshao',34.76,111.77,'黄河中游新石器彩陶文化遗址（今河南渑池）。'],
  liangzhu:['良渚','Liangzhu',30.39,119.99,'约前3300—前2300年的大型古城与外围水利系统（今杭州余杭）。'],
  erlitou:['二里头','Erlitou',34.69,112.69,'洛阳盆地的夏商之际都邑遗址，发现中轴宫城基址与早期青铜礼器作坊。'],
  yinxu:['殷墟（安阳）','Yinxu / Anyang',36.12,114.32,'商朝晚期都城；出土甲骨卜辞十余万片与大批青铜礼器。'],
  haojing:['镐京','Haojing',34.22,108.79,'西周都城（今西安西南）；前771年被犬戎攻破。'],
  luoyi:['洛阳（洛邑）','Luoyang',34.62,112.45,'周公营建成周，前770年周平王东迁于此；后为东汉、曹魏、西晋、北魏都城。'],
  qufu:['曲阜','Qufu',35.60,116.99,'鲁国都城；孔子故里。'],
  linzi:['临淄','Linzi',36.82,118.30,'齐国都城，春秋战国时的东方大邑与稷下学宫所在。'],
  xianyang:['咸阳','Xianyang',34.35,108.71,'商鞅变法后秦国迁都于此，前221年为秦朝都城。'],
  changping:['长平','Changping',35.80,112.92,'今山西高平一带；前260年秦军在此击败赵军，坑杀降卒四十万。'],
  changan:['长安','Chang’an',34.31,108.90,'西汉都城，丝绸之路东端起点；后为前秦、北周、隋唐都城。'],
  dunhuang:['敦煌','Dunhuang',40.14,94.66,'汉武帝所设河西四郡最西一郡，扼守西域门户（玉门关、阳关）。'],
  guandu:['官渡','Guandu',34.73,113.98,'今河南中牟东北；200年曹操在此击败袁绍主力。'],
  chibi:['赤壁','Chibi',29.90,113.62,'长江中游要冲；208年孙刘联军在此击败曹操，奠定三分格局。'],
  jiankang:['建康（建业）','Jiankang / Nanjing',32.06,118.78,'今南京；孙吴称建业，东晋与南朝宋、齐、梁、陈以此为都，称建康。'],
  pingcheng:['平城','Pingcheng / Datong',40.09,113.30,'今山西大同；398年北魏迁都于此，493年孝文帝再南迁洛阳。'],
});
function hp(d,key,opt={}){
  const [n,en,la,lo,note]=HS[key];
  return d.pin(P(n,la,lo,opt.note||note,opt.kind||'city',{en,key:'h-'+key,...opt}));
}
function ha(d,key,c,st={}){return d.region(key,c,{fillOpacity:.21,weight:1.3,...st});}
function hl(d,t,en,la,lo,c=HC.neutral,opt={}){d.label(LB(t,la,lo,'region sm',{en,c,...opt}));}
function hr(d,points,color=HC.route,{dash=true,width=2.5,band=false}={}){
  if(band)d.line(points,{color,weight:15,opacity:.10});
  d.line(points,{color,weight:width,opacity:.9,dashArray:dash?'6 7':undefined});
  const a=map.project(points[points.length-2]),b=map.project(points.at(-1));
  const angle=Math.atan2(b.y-a.y,b.x-a.x)*180/Math.PI;
  L.marker(points.at(-1),{pane:'linePane',interactive:false,keyboard:false,
    icon:L.divIcon({className:'',iconSize:[0,0],html:`<span class="map-arrow" style="display:block;color:${color};transform:translate(-50%,-50%) rotate(${angle}deg)">➤</span>`})}).addTo(group);
}
function homeCities(d){hp(d,'athens');hp(d,'sparta',{left:1});}
function aegeanPowers(d){
  ha(d,'hAttica',HC.athens,{fillOpacity:.32});ha(d,'hSpartaCore',HC.sparta,{fillOpacity:.27});
  ha(d,'hPeloponnesianAllies',HC.sparta,{fillOpacity:.13,dashArray:'4 3'});
}
function bronzeNetwork(d){
  ha(d,'hCrete',HC.mino,{fillOpacity:.32});ha(d,'hPalaceAreas',HC.myc,{fillOpacity:.4});
  ha(d,'hHittite',HC.hittite);ha(d,'egypt',COL.egypt,{fillOpacity:.45});ha(d,'canaan',COL.egypt,{fillOpacity:.12,dashArray:'4 4'});
  ha(d,'hBabylonia',HC.neutral);hp(d,'knossos',{left:1});hp(d,'mycenae',{left:1});hp(d,'hattusa');
  hp(d,'ugarit');hp(d,'memphis');hp(d,'babylon');
  hr(d,[[35.4,25.3],[34.5,28.3],[34.7,33.0],[35.5,35.7]],HC.route);
  hr(d,[[35.3,25.0],[33.1,27.0],[31.2,30.1]],HC.route);
}
function leagues(d){
  aegeanPowers(d);ha(d,'hDelianCoasts',HC.athens,{fillOpacity:.35});ha(d,'hBoeotia',HC.sparta,{fillOpacity:.12,dashArray:'5 4'});
  homeCities(d);hp(d,'corinth',{left:1,labelZ:6});hp(d,'delos');hp(d,'miletus');
  hp(d,'argos',{labelZ:7,note:'约前431年，阿尔戈斯保持独立；不能把整个伯罗奔尼撒都画成斯巴达的领土。'});
  hr(d,[[37.94,23.64],[37.4,25.26],[37.7,26.7]],HC.athens);
  hr(d,[[37.4,25.26],[39.4,25.0],[40.6,25.0]],HC.athens);
  hl(d,'海上同盟','Delian League',38.9,25.0,HC.athens);
}
const leg={bronze:[['fill',HC.mino,'克里特宫殿文明'],['fill',HC.myc,'大陆宫殿中心周边'],['dline',HC.route,'跨海联系示意']],
  leagues:[['fill',HC.athens,'雅典及主要海上盟邦'],['fill',HC.sparta,'斯巴达直接控制区'],['dash',HC.sparta,'斯巴达一方主要盟邦（非领土）'],['dline',HC.athens,'海上联络示意']],
  war:[['fill',HC.athens,'雅典及盟邦活动地区'],['fill',HC.sparta,'斯巴达及盟邦活动地区'],['dline',HC.war,'军事行动方向'],['dot',HC.war,'可点击地标与战场']]};
const hs=(date,title,note,view,draw,legend,fitZoom)=>({date,title,note,view,draw,legend,fitZoom});
const HISTORY_ENTRIES=[
{id:'history-migration',ch:0,title:'走出非洲',short:'走出非洲',en:'Out of Africa',period:'距今约 7万—4万年',c:HC.route,
 scenes:[
  hs('距今约 7万—4万年','欧亚扩散','几条宽带示意扩散方向；沿途人群持续分化与混合。',[[4,12],[57,128]],d=>{
    ha(d,'iranPlateau',HC.mino,{fillOpacity:.17,dashArray:'6 5'});
    hr(d,[[9,37],[20,33],[30,32],[35,36],[39,30],[44,20]],HC.route,{band:true});
    hr(d,[[12,42],[14,45],[23,51],[27,63],[18,73],[12,81],[14,98],[24,111]],HC.mino,{band:true});
    hr(d,[[34,53],[40,65],[44,82],[43,102],[40,117]],HC.myc,{band:true});
    hl(d,'非洲东北部','Northeast Africa',6,33,HC.route);hl(d,'西亚','Southwest Asia',36,45,HC.route);
    hl(d,'欧洲','Europe',48,18,HC.route);hl(d,'南亚','South Asia',22,78,HC.mino);
    hl(d,'东亚','East Asia',32,116,HC.myc);hl(d,'东南亚','Southeast Asia',9,105,HC.mino);
   },[['dline',HC.route,'西亚与欧洲方向（概略）'],['dline',HC.mino,'南亚—东南亚方向（概略）'],['dline',HC.myc,'内陆扩散方向（概略）']],3.5),
  hs('距今约 6万—4万年','伊朗高原假说','伊朗高原：早期人群停驻与再扩散的一种研究模型。',[[19,29],[43,72]],d=>{
    ha(d,'iranPlateau',HC.mino,{dashArray:'6 5',fillOpacity:.18});
    hr(d,[[32,35],[34,43],[32,53]],HC.route,{band:true});hl(d,'伊朗高原','Iranian Plateau',33,57,HC.mino);
    hl(d,'黎凡特','Levant',34,36,HC.route);
   },[['dash',HC.mino,'可能的停驻区域：研究模型'],['dline',HC.route,'区域间联系方向']])
 ]},
{id:'history-farming',ch:0,title:'农业与早期国家',short:'农业、定居与国家',en:'Farming & Early States',period:'约前 10000—前 3000年',c:COL.crescent,
 scenes:[
  hs('约前 10000—前 6000年','农业与定居','农业从新月沃地经安纳托利亚传播，进入爱琴海。',[[26,20],[41.6,49]],d=>{
    ha(d,'crescent',COL.crescent,{fillOpacity:.32});ha(d,'anatolia',COL.crescent,{fillOpacity:.10,dashArray:'4 4'});
    hp(d,'jericho');hr(d,[[35,39],[38,35],[38,29],[38,24]],COL.crescent);
    hl(d,'新月沃地','Fertile Crescent',36.9,43,COL.crescent);hl(d,'爱琴海农业聚落','Aegean farming communities',39.7,24,COL.crescent);
   },[['fill',COL.crescent,'农业形成与传播涉及的地区'],['dline',COL.crescent,'传播方向示意']]),
  hs('前 4千纪—约前 3100年','城市与王权','仓储、灌溉与征收，在两河和尼罗河流域支撑城市及王权。',[[23.5,28],[38,49]],d=>{
    ha(d,'hBabylonia',COL.meso);ha(d,'egypt',COL.egypt,{fillOpacity:.45});
    hp(d,'uruk');hp(d,'ur',{left:1});hp(d,'memphis');hp(d,'luxor',{left:1});
    hl(d,'苏美尔城市地带','Sumer',33.4,46.3,COL.meso);hl(d,'尼罗河流域','Nile Valley',27,29.6,COL.egypt);
   },[['fill',COL.meso,'南部两河城市地带'],['fill',COL.egypt,'尼罗河农业与国家形成区域']])
 ]},
{id:'history-palaces',ch:0,title:'克里特与迈锡尼',short:'爱琴海宫殿文明',en:'Minoan & Mycenaean Worlds',period:'约前 1900—前 1100年',c:HC.mino,hideIslands:['crete','cyclades'],
 scenes:[
  hs('约前 1900—前 1450年','克里特宫殿','克里特宫殿集中物资、组织生产，也联系海外。',[[34.3,22.6],[36.6,27.4]],d=>{
    ha(d,'hCrete',HC.mino,{fillOpacity:.35});hp(d,'knossos');hp(d,'phaistos',{left:1});
    hl(d,'克里特岛','Crete',35.85,24.6,HC.mino);hl(d,'线形文字 A','Linear A',34.65,25.5,HC.mino);
   },[['fill',HC.mino,'米诺斯宫殿文明活动区'],['dot',HC.mino,'宫殿中心']],7),
  hs('约前 1600—前 1200年','大陆宫殿中心','各色块是大陆宫殿中心；前1450年后迈锡尼势力进入克里特。',[[34.5,20.8],[39.0,27]],d=>{
    ha(d,'hPalaceAreas',HC.myc,{fillOpacity:.40});ha(d,'hCrete',HC.mino,{fillOpacity:.17,dashArray:'4 4'});
    hp(d,'mycenae');hp(d,'pylos',{left:1});hp(d,'thebes');hp(d,'tiryns',{left:1,labelZ:7});hp(d,'knossos');
    hl(d,'线形文字 B · 早期希腊语','Linear B · early Greek',36.5,25.4,HC.myc);
   },leg.bronze,7),
  hs('尤其前 14—前 13世纪','东地中海网络','铜、锡与奢侈品沿海路流动，把宫殿精英绑进共同网络。',HV.eastern,bronzeNetwork,
   [['fill',HC.mino,'克里特'],['fill',HC.myc,'迈锡尼宫殿中心'],['fill',HC.hittite,'赫梯核心及影响区'],['dline',HC.route,'贸易联系示意']])
 ]},
{id:'history-collapse',ch:0,title:'青铜时代的危机',short:'晚期青铜时代崩溃',en:'Late Bronze Age Collapse',period:'约前 1274—前 1100年',c:HC.war,
 scenes:[
  hs('约前 1274 / 前 1259年','战争与后来的和约','约前1274年交战，前1259年议和；宫殿危机随后才全面爆发。',[[27.5,29],[42,41]],d=>{
    ha(d,'hHittite',HC.hittite);ha(d,'egypt',COL.egypt,{fillOpacity:.4});ha(d,'canaan',COL.egypt,{fillOpacity:.15});
    hp(d,'hattusa');hp(d,'memphis');hp(d,'kadesh',{kind:'battle'});
    hr(d,[[30,31.3],[31.4,34.3],[33,35.4],[34.556,36.518]],COL.egypt);
    hr(d,[[40,34.6],[37,36],[34.556,36.518]],HC.hittite);
   },[['fill',HC.hittite,'赫梯核心与势力区域'],['fill',COL.egypt,'埃及核心与南黎凡特影响'],['dline',COL.egypt,'埃及北上方向'],['dline',HC.hittite,'赫梯南下方向']]),
  hs('约前 1200年','多个中心瓦解','战争、粮荒与供应中断互相放大，多个中心先后瓦解。',HV.eastern,d=>{
    ha(d,'hPalaceAreas',HC.war,{fillOpacity:.28,dashArray:'4 4'});ha(d,'hHittite',HC.war,{fillOpacity:.12,dashArray:'6 4'});
    ha(d,'egypt',COL.egypt,{fillOpacity:.3});hp(d,'mycenae',{kind:'battle',left:1});hp(d,'pylos',{kind:'battle',labelZ:6,left:1});
    hp(d,'hattusa',{kind:'battle'});hp(d,'ugarit',{kind:'battle'});hl(d,'旧有宫殿网络受冲击','Palatial networks disrupted',33.7,26.2,HC.war);
   },[['dash',HC.war,'受冲击的旧有宫殿与国家核心'],['fill',COL.egypt,'埃及王权继续存在']]),
  hs('约前 1177年','埃及抵抗海上民族','埃及挡住进攻；箭头示东地中海武装活动方向。',[[24,27.8],[36.8,37.8]],d=>{
    ha(d,'egypt',COL.egypt,{fillOpacity:.4});ha(d,'canaan',HC.war,{fillOpacity:.13,dashArray:'4 4'});
    hr(d,[[35.5,33],[33.5,32.8],[31.4,31.6]],HC.war,{band:true});hp(d,'medinet',{left:1});
    hp(d,'memphis');hl(d,'埃及存续，海外优势减弱','Egypt survives',28,30, COL.egypt);
   },[['fill',COL.egypt,'埃及核心区'],['dline',HC.war,'武装与人口活动方向（不确定）']])
 ]},
{id:'history-dark-age',ch:0,title:'希腊的黑暗时代',short:'希腊的延续与复苏',en:'The Greek Dark Age',period:'约前 1200／1100—前 800年',c:HC.myc,
 scenes:[
  hs('约前 1100—前 800年','希腊的延续与复苏','宫殿消失，社群延续；海上往来为恢复与重组提供条件。',HV.aegean,d=>{
    ha(d,'greekCore',HC.myc,{fillOpacity:.12,dashArray:'5 4'});hp(d,'athens');hp(d,'lefkandi');hp(d,'knossos',{labelZ:6});
    hr(d,[[34,35.4],[35.5,29],[37.5,25],[38.41,23.68]],HC.route);
    hl(d,'与东方的联系仍在','Contacts continue',35.3,27,HC.route);
   },[['dash',HC.myc,'爱琴海聚落活动的概略范围'],['dline',HC.route,'与黎凡特的交流方向']])
 ]},
{id:'history-poleis',ch:1,title:'城邦世界的形成',short:'城邦与海外聚落',en:'The Rise of the Polis',period:'约前 800—前 600年',c:HC.athens,
 scenes:[
  hs('约前 800—前 600年','城邦共同体','城邦以乡村土地养活公民军，公共事务集中在城市。',HV.aegean,d=>{
    ha(d,'greekCore',HC.athens,{fillOpacity:.1,dashArray:'4 4'});homeCities(d);hp(d,'corinth',{left:1});hp(d,'argos',{labelZ:7});hp(d,'miletus');hp(d,'thebes',{labelZ:7});
   },[['dash',HC.athens,'希腊城邦文化活动范围'],['dot',HC.athens,'彼此独立的城邦']]),
  hs('前 8—前 6世纪','地中海与黑海网络','聚落沿海扩展，贸易把独立城邦织成网络。',[[31,11],[47,39]],d=>{
    ha(d,'greekCore',HC.athens,{fillOpacity:.1});ha(d,'hColonyCoasts',HC.athens,{fillOpacity:.4});
    hp(d,'athens');hp(d,'syracuse',{left:1});hp(d,'taras');hp(d,'miletus');hp(d,'byzantium');hp(d,'sinope');
    hr(d,[[37.9,23],[36,22],[37.06,15.29]],HC.athens);hr(d,[[37.5,27.3],[40,26.3],[41,29],[42.03,35.15]],HC.athens);
   },[['fill',HC.athens,'主要希腊活动区与部分沿海聚落'],['dline',HC.athens,'跨海联系方向']])
 ]},
{id:'history-sparta',ch:1,title:'斯巴达的制度',short:'斯巴达：土地与政体',en:'Sparta: Land & Constitution',period:'前 8—前 6世纪起',c:HC.sparta,
 scenes:[
  hs('古风时代','拉科尼亚核心','拉科尼亚是军事公民共同体的核心。',[[35.9,20.6],[38.6,24.4]],d=>{
    ha(d,'hLaconia',HC.sparta,{fillOpacity:.34});hp(d,'sparta');hp(d,'argos',{left:1});
    hl(d,'拉科尼亚','Laconia',36.55,23.5,HC.sparta);
   },[['fill',HC.sparta,'拉科尼亚核心地区']]),
  hs('征服后至前 4世纪','美塞尼亚与公民军','美塞尼亚土地与希洛人劳动，供养斯巴达公民军。',[[35.9,20.6],[38.6,24.4]],d=>{
    ha(d,'hLaconia',HC.sparta,{fillOpacity:.34});ha(d,'hMessenia',HC.mino,{fillOpacity:.34});hp(d,'sparta');
    hl(d,'美塞尼亚','Messenia',37.3,21.3,HC.mino);hl(d,'拉科尼亚','Laconia',36.6,23.5,HC.sparta);
    hr(d,[[37.0,21.8],[37.074,22.43]],HC.mino);
   },[['fill',HC.sparta,'拉科尼亚'],['fill',HC.mino,'被斯巴达控制的美塞尼亚'],['dline',HC.mino,'农业资源支撑关系（示意）']])
 ]},
{id:'history-athens',ch:1,title:'雅典的权力重组',short:'雅典：改革与僭主',en:'Athens: Reform & Democracy',period:'约前 621—前 508／507年',c:HC.athens,
 scenes:[
  hs('约前 621—前 594／593年','法律与解负','德拉古成文法、梭伦解负令，先后回应贵族统治下的社会危机。',HV.attica,d=>{
    ha(d,'hAttica',HC.athens,{fillOpacity:.23});hp(d,'athens');hl(d,'阿提卡','Attica',38.21,23.87,HC.athens);
   },[['fill',HC.athens,'雅典公民共同体所在的阿提卡']],8),
  hs('前 561／560—前 510年','僭主与被逐','庇西特拉图约前546年稳住统治；希庇亚斯前510年被逐。',HV.attica,d=>{
    ha(d,'hAttica',HC.mino,{fillOpacity:.22});hp(d,'athens');hp(d,'marathon',{note:'庇西特拉图最后一次返回雅典时的重要登陆与集结地区；并非此处所有箭头都指前490年的希波战争。'});
    hr(d,[[38.12,23.973],[38.04,23.9],[37.975,23.727]],HC.mino);
   },[['fill',HC.mino,'僭主统治下的阿提卡'],['dline',HC.mino,'返回雅典的方向示意']],8),
  hs('前 508／507年','克里斯提尼改革','城市、沿海、内陆混编，削弱旧贵族的地方动员网络。',HV.attica,d=>{
    ha(d,'hAttica',HC.athens,{fillOpacity:.18});hp(d,'athens');
    d.pin(P('内陆地区',38.10,23.74,'地域组织改革打破旧有地方网络；此点仅示意内陆。','site',{en:'Inland',left:1}));
    d.pin(P('沿海地区',37.89,24.02,'城市、沿海与内陆单位混编；此点仅示意沿海。','site',{en:'Coast'}));
    d.line([[37.975,23.727],[38.10,23.74],[37.89,24.02],[37.975,23.727]],{color:HC.athens,weight:2,dashArray:'4 5',opacity:.75});
   },[['fill',HC.athens,'阿提卡'],['dline',HC.athens,'地域混编原则（非实际行政界）']],8)
 ]},
{id:'history-persian-wars',ch:1,title:'希波战争',short:'希波战争与海军',en:'The Greco-Persian Wars',period:'约前 499—前 449年',c:HC.war,
 scenes:[
  hs('前 499—前 494年','伊奥尼亚起义','前499年起义，前494年米利都陷落；雅典援助将冲突推向爱琴海。',[[35.1,22.1],[40.2,30.3]],d=>{
    ha(d,'achaemenid',HC.persia,{fillOpacity:.17});ha(d,'hIonia',HC.war,{fillOpacity:.3,dashArray:'4 4'});hp(d,'miletus',{kind:'battle'});hp(d,'sardis');hp(d,'athens');
    hr(d,[[37.95,23.7],[37.5,25.4],[37.53,27.28]],HC.athens);
   },[['fill',HC.persia,'波斯控制的亚洲背景'],['dash',HC.war,'伊奥尼亚起义涉及地区'],['dline',HC.athens,'援助方向']]),
  hs('前 492年','北方远征','前492年，波斯巩固北线控制，舰队在阿索斯附近遇风暴。',[[37.4,21.8],[42.1,28.9]],d=>{
    ha(d,'achaemenid',HC.persia,{fillOpacity:.17});hp(d,'athos',{kind:'battle'});hp(d,'athens');
    hr(d,[[38.5,27],[40.2,26.4],[40.85,25.1],[40.9,24],[40.158,24.326]],HC.war);
   },[['fill',HC.persia,'波斯帝国背景（概略）'],['dline',HC.war,'北方远征方向']]),
  hs('前 490年','横渡爱琴海','前490年，波斯渡海攻埃雷特里亚，在马拉松受挫。',[[36.3,22.8],[39.25,28.9]],d=>{
    ha(d,'hAttica',HC.athens,{fillOpacity:.3});ha(d,'hIonia',HC.persia);hp(d,'athens',{left:1});hp(d,'eretria',{left:1});hp(d,'marathon',{kind:'battle'});
    hr(d,[[37.3,27.3],[37.09,25.38],[38.0,24.5],[38.40,23.79],[38.12,23.973]],HC.war);
   },[['fill',HC.athens,'阿提卡'],['dline',HC.war,'波斯舰队的进攻方向']]),
  hs('前 480年','温泉关与萨拉米斯','温泉关失守、雅典被占；萨拉米斯海战扭转局势。',[[36.6,21.2],[41.5,27.4]],d=>{
    ha(d,'hAttica',HC.athens);ha(d,'hLaconia',HC.sparta);hp(d,'thermopylae',{kind:'battle',left:1});hp(d,'salamis',{kind:'battle',left:1});hp(d,'athens',{labelZ:7});
    hr(d,[[40.2,26.4],[40.9,24.5],[40.5,23.2],[39.5,22.7],[38.796,22.536],[37.975,23.727]],HC.war);
   },[['fill',HC.athens,'雅典所在地'],['fill',HC.sparta,'斯巴达所在地'],['dline',HC.war,'波斯进军方向']]),
  hs('前 479年','普拉提亚与米卡勒','普拉提亚与米卡勒胜利后，雅典把战线推回海上。',[[36.2,21.8],[39.6,29]],d=>{
    ha(d,'hAttica',HC.athens);ha(d,'hIonia',HC.persia,{fillOpacity:.17,dashArray:'4 4'});hp(d,'plataea',{kind:'battle',left:1});hp(d,'mycale',{kind:'battle'});hp(d,'athens',{labelZ:7});
    hr(d,[[37.8,24],[37.3,25.4],[37.666,27.06]],HC.athens);
   },[['dash',HC.persia,'小亚细亚沿岸争夺区'],['dline',HC.athens,'希腊海上行动方向']]),
  hs('前 478—约前 449年','战争继续','雅典同盟继续对波作战，海军与征收能力同步增长。',HV.aegean,d=>{
    ha(d,'hDelianCoasts',HC.athens,{fillOpacity:.35});ha(d,'hAttica',HC.athens,{fillOpacity:.28});hp(d,'athens');hp(d,'delos');hp(d,'miletus');
    hr(d,[[37.95,23.7],[37.4,25.26],[37.53,27.28]],HC.athens);
   },[['fill',HC.athens,'海上同盟的主要活动节点'],['dline',HC.athens,'持续对波作战的联系方向']])
 ]},
{id:'history-leagues',ch:1,title:'同盟与伯利克里',short:'两大同盟与民主深化',en:'Leagues & Periclean Athens',period:'约前 478—前 431年',c:HC.athens,
 scenes:[
  hs('前 478／477—前 454年','从同盟走向帝国','盟邦交贡，军力集中；前454年金库由提洛迁往雅典。',HV.aegean,d=>{
    ha(d,'hAttica',HC.athens,{fillOpacity:.3});ha(d,'hDelianCoasts',HC.athens,{fillOpacity:.3});hp(d,'athens');hp(d,'delos');hp(d,'miletus');
    hr(d,[[37.396,25.268],[37.94,23.64]],HC.mino,{width:3});
    hl(d,'金库迁往雅典','Treasury transferred · 454 BCE',36.5,24.7,HC.mino);
   },[['fill',HC.athens,'形成期主要海上网络（成员有变化）'],['dline',HC.mino,'金库由提洛迁往雅典']]),
  hs('约前 431年','两大阵营','雅典的海上贡赋网络，与斯巴达的陆上盟约体系对峙。',HV.aegean,leagues,leg.leagues)
 ]},
{id:'history-peloponnesian-war',ch:1,title:'伯罗奔尼撒战争',short:'争霸、远征与投降',en:'The Peloponnesian Wars',period:'约前 460—前 404年',c:HC.war,
 scenes:[
  hs('约前 460—前 446／445年','第一轮冲突','争夺中部希腊与地峡；内战与对波作战同时进行。',HV.greece,d=>{
    aegeanPowers(d);ha(d,'hBoeotia',HC.neutral,{dashArray:'4 4'});homeCities(d);hp(d,'corinth');hp(d,'thebes');
    hr(d,[[37.074,22.43],[37.91,22.88],[38.32,23.32]],HC.war);
   },[['fill',HC.athens,'雅典核心'],['fill',HC.sparta,'斯巴达及主要盟邦'],['dash',HC.neutral,'反复争夺的希腊中部']]),
  hs('前 431—前 421年','阿基达马斯战争','陆军入侵迫使人口集中长墙内，海运续命，瘟疫扩散。',[[36.3,21.1],[38.7,25.0]],d=>{
    aegeanPowers(d);homeCities(d);hp(d,'corinth',{left:1});hp(d,'piraeus',{left:1,labelZ:7});
    hr(d,[[37.07,22.43],[37.9,22.9],[38.05,23.5],[38.0,23.75]],HC.war);
    hr(d,[[37.6,24.7],[37.7,24.0],[37.94,23.64]],HC.athens);
   },leg.war),
  hs('前 415—前 413年','西西里远征','雅典远征叙拉古，前413年舰队与陆军惨败。',[[35.2,12.1],[40.5,25.6]],d=>{
    ha(d,'hAttica',HC.athens);ha(d,'hSicily',HC.neutral,{fillOpacity:.12});ha(d,'hSyracuse',HC.war,{fillOpacity:.3});hp(d,'athens');hp(d,'syracuse',{kind:'battle',left:1});
    hr(d,[[37.94,23.64],[37.4,23.7],[36.0,22.7],[37,20.5],[39.6,19.9],[38,16],[37.06,15.29]],HC.athens);
   },[['fill',HC.neutral,'西西里：地理背景'],['fill',HC.war,'叙拉古及周边战区'],['dline',HC.athens,'雅典远征的大致方向']]),
  hs('前 413—前 404年','海峡、粮道与投降','波斯金钱支持斯巴达海军；羊河战败后，雅典粮道被切断。',[[36.3,21.2],[44.6,34.9]],d=>{
    aegeanPowers(d);ha(d,'hIonia',HC.persia,{fillOpacity:.15});homeCities(d);hp(d,'aegospotami',{kind:'battle',left:1});hp(d,'byzantium');hp(d,'decelea',{labelZ:7});
    hr(d,[[44,33],[42,30.5],[41.01,28.98],[40.35,26.51],[38.0,24.3],[37.94,23.64]],HC.athens);
    hl(d,'黑海粮食通道','Black Sea grain route',42.6,32.6,HC.athens);
   },[['fill',HC.sparta,'斯巴达及盟邦'],['fill',HC.athens,'雅典核心'],['dline',HC.athens,'雅典重要粮运通道']])
 ]},
{id:'history-spartan-decline',ch:1,title:'波斯调停与霸权轮替',short:'波斯调停与霸权轮替',en:'Persian Arbitration & Greek Hegemonies',period:'前 404—前 362年',c:HC.thebes,
 scenes:[
  hs('前 404—前 399年','胜利者接管秩序','斯巴达以驻军与寡头政权巩固胜利，雅典前403年恢复民主。',HV.aegean,d=>{
    ha(d,'hSpartaCore',HC.sparta,{fillOpacity:.3});ha(d,'hPeloponnesianAllies',HC.sparta,{dashArray:'4 3',fillOpacity:.13});
    homeCities(d);hp(d,'miletus');hr(d,[[37.07,22.43],[37.975,23.727]],HC.sparta);hr(d,[[37.07,22.43],[36.8,25.2],[37.53,27.28]],HC.sparta);
   },[['fill',HC.sparta,'斯巴达直接控制区'],['dash',HC.sparta,'主要盟邦'],['dline',HC.sparta,'对外干预与影响']]),
  hs('前 401—前 400年','小居鲁士与万人军','小居鲁士争位战死；多城邦雇佣军经两河与山地艰难撤至黑海。',[[30,25],[43,47]],d=>{
    ha(d,'anatolia',HC.persia,{fillOpacity:.10});ha(d,'hBabylonia',HC.persia,{fillOpacity:.18});
    hp(d,'sardis');hp(d,'cunaxa',{kind:'battle'});hp(d,'trapezus');
    hr(d,[[38.49,28.04],[38.3,31.5],[37,35],[36.5,38.1],[33.33,44.13]],HC.macedon);
    hr(d,[[33.33,44.13],[35,44],[37,42.5],[38.6,42],[40,41.4],[41.005,39.726]],HC.route);
   },[['fill',HC.persia,'波斯帝国内的行动背景'],['dline',HC.macedon,'小居鲁士进军方向'],['dline',HC.route,'雇佣军撤退方向']]),
  hs('前 399—前 394年','霸权引来反联盟','斯巴达出兵亚洲；波斯资助希腊反对者，前394年克尼多斯海战重创斯巴达。',HV.aegean,d=>{
    ha(d,'hSpartaCore',HC.sparta);['hAttica','hBoeotia','hCorinth','hArgolis'].forEach(k=>ha(d,k,HC.thebes,{fillOpacity:.32}));
    ha(d,'hIonia',HC.persia,{fillOpacity:.18});homeCities(d);hp(d,'thebes');hp(d,'cnidus',{kind:'battle'});hp(d,'sardis');
    hr(d,[[37.07,22.43],[36.685,27.375],[38.49,28.04]],HC.sparta);
   },[['fill',HC.thebes,'反斯巴达联盟主要城邦'],['fill',HC.sparta,'斯巴达核心'],['dline',HC.sparta,'斯巴达在亚洲的军事干预']]),
  hs('前 387／386年','大王和约','亚洲希腊城市归波斯；城邦“自治”拆解联合体，波斯定规则，斯巴达执行。',[[34,20],[41.7,36.2]],d=>{
    ha(d,'anatolia',HC.persia,{fillOpacity:.15});ha(d,'hIonia',HC.persia,{fillOpacity:.35});
    ['hAttica','hBoeotia','hCorinth','hArgolis'].forEach(k=>ha(d,k,HC.thebes,{fillOpacity:.23,dashArray:'3 4'}));
    ha(d,'hSpartaCore',HC.sparta);homeCities(d);hp(d,'thebes');hp(d,'sardis');hp(d,'miletus');
    hl(d,'裁判权在波斯','King’s Peace',38.8,32.4,HC.persia);
   },[['fill',HC.persia,'波斯亚洲领地与希腊城市'],['dash',HC.thebes,'被要求自治的城邦'],['fill',HC.sparta,'和约执行者斯巴达']]),
  hs('前 371—前 369年','留克特拉与美塞尼亚','留克特拉重创公民军，美塞尼亚独立抽走农业基础。',[[35.9,20.6],[39.1,24.4]],d=>{
    ha(d,'hLaconia',HC.sparta,{fillOpacity:.3});ha(d,'hMessenia',HC.thebes,{fillOpacity:.35});ha(d,'hBoeotia',HC.thebes,{fillOpacity:.25});
    hp(d,'sparta');hp(d,'leuctra',{kind:'battle',left:1});hp(d,'messene',{left:1});hp(d,'thebes',{labelZ:7});
    hr(d,[[38.32,23.32],[37.9,22.88],[37.5,22.3],[37.178,21.919]],HC.thebes);
    hl(d,'脱离斯巴达控制','Messenia liberated',36.45,21.0,HC.thebes);
   },[['fill',HC.sparta,'斯巴达留下的拉科尼亚核心'],['fill',HC.thebes,'底比斯与新独立的美塞尼亚'],['dline',HC.thebes,'底比斯南下方向']]),
  hs('前 362年','优势未能稳定','伊巴密浓达（Epaminondas）战死；胜利仍未换来持久领导权。',HV.greece,d=>{
    ha(d,'hLaconia',HC.sparta);ha(d,'hMessenia',HC.mino);ha(d,'hAttica',HC.athens);ha(d,'hBoeotia',HC.thebes);
    homeCities(d);hp(d,'thebes');hp(d,'mantinea',{kind:'battle',left:1});
   },[['fill',HC.sparta,'斯巴达'],['fill',HC.thebes,'底比斯'],['fill',HC.athens,'雅典'],['fill',HC.mino,'独立的美塞尼亚']])
 ]},
{id:'history-macedonian-rise',ch:2,title:'腓力的军队与王位',short:'腓力：扩张与继承危机',en:'Philip II: Army & Succession',period:'前 359—前 335年',c:HC.macedon,
 scenes:[
  hs('前 359—前 340年代','北方王国的扩张','矿山收入、军事训练与南下扩张相互支撑。',[[37.8,19.6],[43.6,29.3]],d=>{
    ha(d,'hMacedonEarly',HC.macedon,{fillOpacity:.32});ha(d,'hThessaly',HC.macedon,{fillOpacity:.13,dashArray:'5 4'});hp(d,'pella');hp(d,'philippi');hp(d,'thebes',{labelZ:6});hp(d,'athens');
    hr(d,[[40.76,22.52],[39.8,22.4],[39.1,22.5]],HC.macedon);hl(d,'色萨利','Thessaly',39.5,21.4,HC.macedon);
   },[['fill',HC.macedon,'早期马其顿核心'],['dash',HC.macedon,'逐步取得优势的色萨利'],['dline',HC.macedon,'向南发展的方向']]),
  hs('前 338—前 337年','喀罗尼亚与同盟','喀罗尼亚战胜雅典—底比斯，科林斯同盟确立马其顿军事领导权。',[[35.7,19.5],[43.5,29.4]],d=>{
    ha(d,'hMacedonPhilip',HC.macedon,{fillOpacity:.26});ha(d,'hCorinthianLeague',HC.thebes,{fillOpacity:.14,dashArray:'5 4'});ha(d,'hLaconia',HC.neutral,{fillOpacity:.12});
    hp(d,'pella');hp(d,'chaeronea',{kind:'battle',left:1});hp(d,'athens');hp(d,'corinth',{left:1,labelZ:6});hp(d,'sparta',{note:'斯巴达没有加入腓力组织的科林斯同盟。'});
   },[['fill',HC.macedon,'马其顿直接统治区（概略）'],['dash',HC.thebes,'科林斯同盟的本土主要范围'],['fill',HC.neutral,'斯巴达：未加入']]),
  hs('前 337—前 336年','婚姻联盟与刺杀','新婚姻威胁亚历山大母子的地位；腓力遇刺后，继承争夺迅速收束到新王手中。',[[38.7,20],[42.0,25.8]],d=>{
    ha(d,'hMacedonEarly',HC.macedon,{fillOpacity:.3});hp(d,'pella');hp(d,'aigai',{kind:'battle',left:1});
   },[['fill',HC.macedon,'马其顿王权核心'],['dot',HC.war,'埃盖：刺杀与权力交接']]),
  hs('前 335年','压服后方','亚历山大毁灭反叛的底比斯；雅典保留自治，马其顿重申军事领导权。',HV.greece,d=>{
    ha(d,'hCorinthianLeague',HC.macedon,{fillOpacity:.12,dashArray:'4 4'});ha(d,'hBoeotia',HC.war,{fillOpacity:.27});
    hp(d,'thebes',{kind:'battle'});hp(d,'athens');hp(d,'corinth',{left:1});
    hr(d,[[39.6,22.4],[38.8,22.8],[38.322,23.318]],HC.macedon);
   },[['dash',HC.macedon,'马其顿主导的同盟范围'],['fill',HC.war,'底比斯受毁与彼奥提亚重组']])
 ]},
{id:'history-alexander-conquest',ch:2,title:'东征：接管一座帝国',short:'东征与扩张的极限',en:'Conquest & Its Limits',period:'前 334—前 325年',c:HC.macedon,
 scenes:[
  hs('前 334—前 332年','从海峡到埃及','先取小亚细亚，再拿下黎凡特港口与埃及，拆掉波斯的海上支点。',[[24.5,21.5],[42,39]],d=>{
    ha(d,'hWestAnatolia',HC.macedon);ha(d,'hLevantCorridor',HC.macedon);ha(d,'egypt',HC.mino,{fillOpacity:.35});
    hr(d,ALEX_PATH.slice(3,29),HC.macedon);
    hp(d,'granicus',{kind:'battle',left:1});hp(d,'issus',{kind:'battle'});hp(d,'tyre');hp(d,'memphis');
   },[['fill',HC.macedon,'西部战事与接管所涉地区'],['fill',HC.mino,'埃及核心'],['dline',HC.macedon,'主要行军方向']]),
  hs('前 331—前 330年','王都、国库与新王','高加米拉后，波斯王室资源转入征服者手中；中央决战结束，地方战争继续。',[[25.5,32],[40,58]],d=>{
    ha(d,'hRoyalHeartlands',HC.macedon,{fillOpacity:.22});hr(d,ALEX_PATH.slice(39,60),HC.macedon);
    hp(d,'gaugamela',{kind:'battle',left:1});hp(d,'babylon',{note:'前331年亚历山大接管这座两河重镇。'});hp(d,'susa');hp(d,'persepolis');hp(d,'ecbatana',{left:1});
   },[['fill',HC.macedon,'两河—伊朗王权核心地带'],['dline',HC.macedon,'接管都城与追击方向']]),
  hs('前 329—前 325年','远征的边界','中亚反抗拖长战争；军队在印度拒绝再进，归途沙漠吞噬兵员。',[[22,54],[43,78]],d=>{
    ha(d,'hBactriaSogdiana',HC.macedon,{fillOpacity:.24});ha(d,'hIndusCampaign',HC.thebes,{fillOpacity:.24});ha(d,'hGedrosia',HC.war,{fillOpacity:.13,dashArray:'5 4'});
    hr(d,ALEX_PATH.slice(68,89),HC.macedon);hr(d,ALEX_PATH.slice(89,105),HC.war);
    hp(d,'bactra',{left:1});hp(d,'maracanda');hp(d,'hydaspes',{kind:'battle',left:1});hp(d,'hyphasis');
    hl(d,'格德罗西亚','Gedrosia',26.6,61,HC.war);
   },[['fill',HC.macedon,'中亚长期战区'],['fill',HC.thebes,'印度河与旁遮普战区'],['dash',HC.war,'格德罗西亚归程地带'],['dline',HC.war,'回师方向']])
 ]},
{id:'history-alexander-rule',ch:2,title:'旧伙伴与新臣民',short:'帝国怎样重组权力',en:'Companions, Subjects & Kingship',period:'前 332—前 324年',c:HC.mino,
 scenes:[
  hs('前 332—前 331年','祭司与合法性','尊奉埃及神祇、求问锡瓦神谕，把征服者嵌入当地王权传统。',[[24,23.4],[33.4,34.5]],d=>{
    ha(d,'egypt',HC.mino,{fillOpacity:.38});hp(d,'memphis');hp(d,'siwa',{left:1});hp(d,'alexandria');
    hr(d,[[29.85,31.25],[31.2,29.92],[31.35,27.23],[29.2,25.52]],HC.mino);
   },[['fill',HC.mino,'尼罗河国家与神庙网络'],['dline',HC.mino,'沿海新城与锡瓦神谕之行']]),
  hs('前 330—前 327年','近臣冲突与俯拜礼','旧功臣接连死去；宫廷礼仪之争把国王与伙伴之间的新等级显露出来。',[[29,44],[43,73]],d=>{
    ha(d,'hRoyalHeartlands',HC.neutral,{fillOpacity:.10});ha(d,'hBactriaSogdiana',HC.macedon,{fillOpacity:.24});
    hp(d,'ecbatana',{left:1});hp(d,'maracanda');hp(d,'bactra',{left:1});
    hl(d,'新王权向东扎根','New bases of royal power',32.5,59,HC.macedon);
   },[['fill',HC.macedon,'中亚驻军与宫廷活动区域'],['fill',HC.neutral,'旧帝国行政背景']]),
  hs('前 324年','新军、联姻与兵变','苏萨联姻与亚洲军人晋升拓宽基本盘；奥皮斯老兵抗议逼出新的权力妥协。',[[26,40],[42,71]],d=>{
    ha(d,'iranPlateau',HC.mino,{fillOpacity:.16});ha(d,'hBactriaSogdiana',HC.thebes,{fillOpacity:.2});ha(d,'hBabylonia',HC.macedon);
    hp(d,'susa');hp(d,'opis',{left:1});hp(d,'bactra');
    hr(d,[[36.76,66.9],[34,59],[32.19,48.25],[33.19,44.54]],HC.thebes);
   },[['fill',HC.thebes,'亚洲征募与精英联合的部分来源'],['fill',HC.macedon,'帝国驻军与政治中心'],['dline',HC.thebes,'新力量进入核心的方向']])
 ]},
{id:'history-successors',ch:2,title:'帝国裂开，网络延续',short:'继业者战争与三大王朝',en:'Successors & the Hellenistic World',period:'前 323—约前 270年',c:HC.thebes,
 scenes:[
  hs('前 323—前 321年','王位悬空，分省争权','国王留下巨大疆域，却没有稳定的继承安排；总督与军队迅速形成多个权力中心。',[[20,18],[44,79]],d=>{
    ha(d,'hAlexEmpire',HC.neutral,{fillOpacity:.08,dashArray:'5 5'});
    ha(d,'egypt',HC.mino,{fillOpacity:.34});ha(d,'hBabylonia',HC.thebes,{fillOpacity:.3});ha(d,'hMacedonEarly',HC.macedon,{fillOpacity:.3});ha(d,'hWestAnatolia',HC.sparta,{fillOpacity:.23});
    hp(d,'babylon',{note:'前323年亚历山大病逝；将领争夺摄政、军队与总督职位。'});hp(d,'pella');hp(d,'memphis');hp(d,'sardis');
   },[['dash',HC.neutral,'亚历山大统治与同盟所及范围（概略）'],['fill',HC.mino,'埃及总督基地'],['fill',HC.thebes,'巴比伦中枢'],['fill',HC.macedon,'马其顿基地'],['fill',HC.sparta,'小亚细亚将领基地']]),
  hs('前 301—前 281年','统一机会逐次消失','伊普苏斯打破安提柯的统一尝试；库鲁佩迪翁后仍有王朝更替与新的分配。',[[26,20],[42.7,52]],d=>{
    ha(d,'hWestAnatolia',HC.war,{fillOpacity:.17,dashArray:'4 4'});ha(d,'hRoyalHeartlands',HC.thebes,{fillOpacity:.15});ha(d,'egypt',HC.mino,{fillOpacity:.3});
    hp(d,'ipsus',{kind:'battle'});hp(d,'corupedium',{kind:'battle',left:1});hp(d,'alexandria');hp(d,'seleucia');
    hl(d,'争夺中的安纳托利亚','Contested Anatolia',40.8,33.4,HC.war);
   },[['dash',HC.war,'关键战争与反复分配地带'],['fill',HC.thebes,'塞琉古的两河—伊朗基础'],['fill',HC.mino,'托勒密的埃及基础']]),
  hs('约前 270年','三大王朝，多种力量','三大王朝并立；南亚有孔雀王朝，安纳托利亚与希腊仍有地方王国、独立城邦和联盟。',[[20,18],[44,81]],d=>{
    ha(d,'hSeleucidCore',HC.thebes,{fillOpacity:.25});ha(d,'hPtolemaicCore',HC.mino,{fillOpacity:.38});ha(d,'hAntigonidCore',HC.macedon,{fillOpacity:.35});ha(d,'hMauryaNorthwest',HC.neutral,{fillOpacity:.17,dashArray:'5 4'});
    hp(d,'alexandria');hp(d,'antioch',{left:1});hp(d,'seleucia');hp(d,'pella');hp(d,'pergamon',{labelZ:5});hp(d,'taxila');
    hl(d,'塞琉古王朝','Seleucid',34,55,HC.thebes);hl(d,'托勒密王朝','Ptolemaic',26.1,30.1,HC.mino);hl(d,'孔雀王朝西北部','Maurya',29.5,74,HC.neutral);
   },[['fill',HC.macedon,'安提柯核心与控制地带'],['fill',HC.mino,'托勒密核心与部分属地'],['fill',HC.thebes,'塞琉古主要控制地带'],['dash',HC.neutral,'孔雀王朝西北部（局部）']])
 ]},{
 id:'history-hellenistic-states',ch:3,title:'王国靠什么运转',short:'税收、城市与军队',en:'Revenue, Cities & Armies',period:'前 3世纪',c:HC.thebes,
 scenes:[
  hs('前 3世纪','尼罗河与神庙','埃及粮税支撑王室；神庙与地方行政连接征服者和本地社会。',[[23,27],[33.4,34.5]],d=>{
    ha(d,'egypt',HC.mino,{fillOpacity:.35});hp(d,'alexandria');hp(d,'memphis');hp(d,'luxor',{left:1});
    hr(d,[[25.72,32.61],[29.85,31.25],[31.2,29.92]],HC.mino);
   },[['fill',HC.mino,'尼罗河农业与征收核心'],['dline',HC.mino,'粮食与资源向北汇集']]),
  hs('前 3世纪','城市与地方精英','塞琉古以城市、驻军和地方合作连接远方；安置移民也为征税、征兵建立支点。',[[26,33],[43,73]],d=>{
    ha(d,'hSeleucidCore',HC.thebes,{fillOpacity:.15});hp(d,'antioch',{left:1});hp(d,'seleucia');hp(d,'ecbatana',{note:'米底重镇，连接两河、伊朗高原与东方交通。'});hp(d,'bactra',{note:'巴克特里亚的城市中心；既有灌溉农业与移民驻军相互结合。'});
    hr(d,[[36.2,36.16],[33.1,44.52],[34.8,48.52],[36.76,66.9]],HC.thebes);
   },[['fill',HC.thebes,'塞琉古主要经营地区（概略）'],['dline',HC.thebes,'城市与行政联系示意']]),
  hs('前 3世纪','马其顿与城邦联盟','马其顿依靠本土兵源和希腊据点；城邦以联邦结集，也在王国之间寻找支援。',[[36,19.4],[42.2,26]],d=>{
    ha(d,'hAntigonidCore',HC.macedon,{fillOpacity:.28});ha(d,'hAetolia',HC.thebes,{fillOpacity:.3,dashArray:'4 3'});ha(d,'hAchaeanLeague',HC.athens,{fillOpacity:.3,dashArray:'4 3'});
    hp(d,'pella');hp(d,'corinth',{note:'科林斯山堡控制地峡；城邦联盟与马其顿反复争夺。'});hp(d,'athens');
    hl(d,'埃托利亚','Aetolian League',39.05,20.6,HC.thebes);hl(d,'亚该亚','Achaean League',37.45,20.7,HC.athens);
   },[['fill',HC.macedon,'安提柯王朝本土核心'],['dash',HC.thebes,'埃托利亚联盟核心'],['dash',HC.athens,'亚该亚联盟部分成员地区']])
 ]},
{id:'history-hellenistic-knowledge',ch:3,title:'王室养学者，个人求安顿',short:'知识网络与生活哲学',en:'Knowledge & Ways of Living',period:'约前 300—前 212年',c:HC.route,
 scenes:[
  hs('约前 300年','雅典的新学派','伊壁鸠鲁的花园与芝诺的柱廊，给动荡时代提供不同的生活方式。',HV.attica,d=>{
    ha(d,'hAttica',HC.route,{fillOpacity:.2});hp(d,'athens',{note:'约前306年伊壁鸠鲁在雅典建立花园学园；约前300年芝诺在彩绘柱廊讲学。'});
    hl(d,'花园与柱廊','Garden & Stoa',38.15,23.74,HC.route);
   },[['fill',HC.route,'雅典与阿提卡：学派活动背景']],9),
  hs('前 3世纪','跨海的知识网络','亚历山大里亚汇集学者，帕加马的王室文化事业也逐步成长；海路连接各地研究者。',[[23,12],[42,34]],d=>{
    ha(d,'egypt',HC.mino,{fillOpacity:.2});ha(d,'hPergamonCore',HC.thebes,{fillOpacity:.18});
    hp(d,'alexandria');hp(d,'pergamon');hp(d,'athens');hp(d,'syracuse');hp(d,'syene');
    hr(d,[[37.06,15.29],[34.8,23.8],[31.2,29.92]],HC.route);hr(d,[[31.2,29.92],[35.2,27],[39.12,27.18]],HC.route);
   },[['fill',HC.mino,'托勒密埃及：研究与资料的依托'],['dline',HC.route,'学者与知识的交流示意']]),
  hs('前 214—前 212年','学者卷入战争','罗马围攻叙拉古，阿基米德参与守城，城破时被杀；知识网络也承受战争的断裂。',[[36.5,12.3],[38.5,16.2]],d=>{
    ha(d,'hSicily',HC.neutral,{fillOpacity:.12});ha(d,'hSyracuse',HC.route,{fillOpacity:.35});hp(d,'syracuse',{kind:'battle',note:'前212年罗马攻陷叙拉古，阿基米德死于城破后的暴力。'});
    hr(d,[[38.2,15.6],[37.6,15.5],[37.06,15.29]],HC.rome);
   },[['fill',HC.route,'叙拉古及周边'],['dline',HC.rome,'罗马围攻方向示意']])
 ]},
{id:'history-celts',ch:3,title:'凯尔特人来到爱琴海',short:'凯尔特南下与加拉太',en:'Celts & Galatia',period:'前 279—前 230年代',c:HC.celt,
 scenes:[
  hs('前 279年','南下马其顿与德尔斐','多瑙河地区诸部向南进军：马其顿国王战死，布伦努斯的一军在德尔斐附近受挫。',[[37.2,19],[46.3,29]],d=>{
    ha(d,'hCelticBalkans',HC.celt,{fillOpacity:.14,dashArray:'5 4'});ha(d,'hAntigonidCore',HC.macedon,{fillOpacity:.15});ha(d,'hAetolia',HC.thebes,{fillOpacity:.22});
    hp(d,'pella',{note:'前279年，国王托勒密·克劳诺斯（Ptolemy Ceraunus）迎击凯尔特军队战死，马其顿陷入动荡。'});hp(d,'thermopylae',{note:'前279年，希腊联军再次利用温泉关阻击北来的军队。'});hp(d,'delphi',{kind:'battle',left:1});
    hr(d,[[45.1,22],[42.5,22.2],[40.76,22.52],[39.65,22.5],[38.796,22.536],[38.48,22.5]],HC.celt,{band:true});
    hl(d,'多瑙河地区','Danube region',45.7,23.6,HC.celt);
   },[['dash',HC.celt,'凯尔特诸部活动走廊'],['dline',HC.celt,'不同军队南下的方向示意'],['fill',HC.thebes,'参与抵抗的埃托利亚核心']]),
  hs('前 278／277年起','受邀跨海，落脚加拉太','一支应邀跨海，逐步扎根加拉太；安提柯二世则在前277年击败另一支，借此巩固马其顿王位。',[[37.4,25],[43,36.3]],d=>{
    ha(d,'hBithynia',HC.macedon,{fillOpacity:.24});ha(d,'hGalatia',HC.celt,{fillOpacity:.27,dashArray:'4 3'});
    hp(d,'byzantium');hp(d,'nicomedia');hp(d,'ancyra');hp(d,'pessinus',{left:1});hp(d,'lysimachia',{kind:'battle',left:1});
    hr(d,[[42.1,26.6],[41.01,28.98],[40.76,29.94],[40.2,31.4],[39.93,32.86]],HC.celt,{band:true});
    hl(d,'加拉太','Galatia',38.6,33.4,HC.celt);hl(d,'比提尼亚','Bithynia',41.5,31.3,HC.macedon);
   },[['fill',HC.macedon,'比提尼亚的核心地区'],['dash',HC.celt,'后来形成的加拉太聚居区'],['dline',HC.celt,'跨海与内陆迁移方向（概略）']]),
  hs('前 3世纪后半叶','帕加马的胜利与声望','阿塔罗斯一世击败加拉太军队；纪念雕像把战场胜利转成王朝的保护者形象。',[[37.7,25],[41.1,35.7]],d=>{
    ha(d,'hPergamonCore',HC.thebes,{fillOpacity:.3});ha(d,'hGalatia',HC.celt,{fillOpacity:.2,dashArray:'4 3'});hp(d,'pergamon');hp(d,'ancyra');
    hr(d,[[39.4,31.4],[39.2,29.2],[39.12,27.18]],HC.celt);
    hl(d,'帕加马核心','Pergamon',40.3,27.8,HC.thebes);hl(d,'加拉太','Galatia',38.5,33.5,HC.celt);
   },[['fill',HC.thebes,'帕加马王国早期核心'],['dash',HC.celt,'加拉太聚居区'],['dline',HC.celt,'向西活动与交战方向示意']])
 ]},
{id:'history-eastern-kingdoms',ch:3,title:'东方边缘长出新中心',short:'巴克特里亚与帕提亚',en:'Bactria & Parthia',period:'约前 250—前 141年',c:HC.parthia,
 scenes:[
  hs('前 3世纪中叶起','东方走向自主','巴克特里亚与帕提亚逐步脱离塞琉古；地方集团利用既有农业、城镇与兵员建立政权。',[[29,49],[43,75]],d=>{
    ha(d,'hParthiaEarly',HC.parthia,{fillOpacity:.3});ha(d,'hBactriaSogdiana',HC.thebes,{fillOpacity:.24,dashArray:'5 4'});
    hp(d,'nisa');hp(d,'bactra',{note:'巴克特里亚王国的中心；希腊统治集团与本地农业、城市网络结合。'});hp(d,'taxila',{note:'南亚西北部的城市节点，连接印度河与中亚交流。'});
    hr(d,[[36.76,66.9],[34.5,69.2],[33.75,72.83]],HC.route);
    hl(d,'帕提亚','Parthia',35.5,56,HC.parthia);hl(d,'巴克特里亚','Bactria',40.3,66,HC.thebes);
   },[['fill',HC.parthia,'早期帕提亚势力核心'],['dash',HC.thebes,'巴克特里亚及邻近活动区'],['dline',HC.route,'中亚与南亚的交流方向']]),
  hs('前 2世纪中叶—前 141年','向两河扩张','米特里达梯一世取得米底与巴比伦尼亚；原帝国的核心资源转入新王朝。',[[28,40],[41,62]],d=>{
    ha(d,'hParthiaWest',HC.parthia,{fillOpacity:.23});ha(d,'hBabylonia',HC.parthia,{fillOpacity:.38});hp(d,'nisa');hp(d,'ecbatana',{note:'米底中心，在前2世纪中叶进入安息王朝控制。'});hp(d,'seleucia');hp(d,'babylon',{note:'前141年，巴比伦尼亚进入帕提亚控制，成为新王朝的重要税源。'});
    hr(d,[[37.95,58.21],[34.8,48.52],[33.1,44.52]],HC.parthia);
   },[['fill',HC.parthia,'帕提亚向西扩张所及核心（概略）'],['dline',HC.parthia,'向米底、两河发展的方向']])
 ]},
{id:'history-spartan-reforms',ch:3,title:'斯巴达最后的改革',short:'重新分地与城邦联邦',en:'Spartan Reform & Greek Leagues',period:'前 245—前 222年',c:HC.sparta,
 scenes:[
  hs('前 245—约前 227年','从财产重分到公民扩充','阿吉斯四世失败后，克里昂米尼三世以军队打破监察官权力，重新组织土地和公民兵。',[[36.1,20.5],[38.6,24.1]],d=>{
    ha(d,'hLaconia',HC.sparta,{fillOpacity:.32});ha(d,'hMessenia',HC.neutral,{fillOpacity:.15,dashArray:'5 4'});ha(d,'hAchaeanLeague',HC.athens,{fillOpacity:.19,dashArray:'4 3'});
    hp(d,'sparta',{note:'公民人数与土地分配决定军队规模；约前227年改革试图重建这套基础。'});hp(d,'messene',{left:1,note:'美塞尼亚此时已独立，斯巴达无法恢复过去全部农业基础。'});hp(d,'corinth');
   },[['fill',HC.sparta,'斯巴达的拉科尼亚核心'],['dash',HC.neutral,'已脱离斯巴达的美塞尼亚'],['dash',HC.athens,'亚该亚联盟部分成员地区']]),
  hs('前 224—前 222年','请来马其顿，败于塞拉西亚','阿拉托斯接受马其顿援助；前222年安提柯三世击败斯巴达，改革政权终结。',[[36.2,20],[42,25.5]],d=>{
    ha(d,'hAntigonidCore',HC.macedon,{fillOpacity:.22});ha(d,'hAchaeanLeague',HC.athens,{fillOpacity:.25,dashArray:'4 3'});ha(d,'hLaconia',HC.sparta,{fillOpacity:.32});
    hp(d,'pella');hp(d,'corinth',{left:1,note:'阿拉托斯让出科林斯山堡，换取马其顿军事援助。'});hp(d,'sellasia',{kind:'battle'});hp(d,'sparta',{left:1});
    hr(d,[[40.76,22.52],[39.5,22.5],[37.906,22.879],[37.3,22.6],[37.23,22.42]],HC.macedon);
   },[['fill',HC.sparta,'斯巴达核心'],['dash',HC.athens,'亚该亚联盟部分成员地区'],['dline',HC.macedon,'马其顿援军南下方向']])
 ]},
{id:'history-ptolemaic-bargain',ch:3,title:'埃及：征兵、反叛与神庙',short:'埃及的兵员与祭司',en:'Soldiers, Revolt & Temples',period:'前 217—前 186年',c:HC.mino,
 scenes:[
  hs('前 217年','拉菲亚与本地兵员','托勒密大量征募埃及步兵；拉菲亚获胜，暂时保住南黎凡特。',[[27,29],[37.5,39]],d=>{
    ha(d,'egypt',HC.mino,{fillOpacity:.3});ha(d,'hPtolemaicLevant',HC.mino,{fillOpacity:.25});ha(d,'hSeleucidSyria',HC.thebes,{fillOpacity:.25});
    hp(d,'alexandria');hp(d,'raphia',{kind:'battle'});hp(d,'antioch');hr(d,[[31.2,29.92],[31.2,32.5],[31.29,34.24]],HC.mino);hr(d,[[36.2,36.16],[33.5,35.6],[31.29,34.24]],HC.thebes);
   },[['fill',HC.mino,'托勒密的埃及与南黎凡特基础'],['fill',HC.thebes,'塞琉古的叙利亚基础'],['dline',HC.thebes,'双方争夺黎凡特走廊']]),
  hs('约前 206—前 186年','反叛与王室让利','上埃及独立王权持续约二十年；前196年祭司颁布罗塞塔诏令时，统一尚未恢复。',[[22,27],[33.2,35]],d=>{
    ha(d,'egypt',HC.mino,{fillOpacity:.22});ha(d,'hUpperEgypt',HC.war,{fillOpacity:.28,dashArray:'5 4'});
    hp(d,'luxor',{note:'埃及底比斯是上埃及反叛王权的中心之一，约前206—前186年反复争夺。'});hp(d,'memphis',{note:'前196年祭司会议在孟菲斯颁布诏令，确认托勒密五世的王室崇拜；罗塞塔石碑保存了其中一份。'});hp(d,'rosetta',{left:1});
   },[['fill',HC.mino,'尼罗河王朝基础'],['dash',HC.war,'上埃及反叛主要活动区（非固定疆界）']])
 ]},
{id:'history-hellenistic-end',ch:3,title:'罗马与帕提亚改变格局',short:'两端推进与王国落幕',en:'Rome, Parthia & a New Order',period:'前 200—前 30年',c:HC.rome,
 scenes:[
  hs('前 200—前 188年','从盟友到裁判','罗马前197年击败马其顿，前190年击败塞琉古；阿帕米亚和约把小亚细亚资源重新分配给罗马盟友。',[[35,11],[42.8,34]],d=>{
    ha(d,'hAntigonidCore',HC.macedon,{fillOpacity:.2});ha(d,'hWestAnatolia',HC.thebes,{fillOpacity:.12,dashArray:'5 4'});ha(d,'hPergamonCore',HC.mino,{fillOpacity:.28});
    hp(d,'cynoscephalae',{kind:'battle',left:1});hp(d,'magnesia',{kind:'battle'});hp(d,'apamea',{left:1});hp(d,'pergamon');
    hr(d,[[40.64,17.95],[39.5,20.2],[39.35,22.55]],HC.rome);hr(d,[[40.5,23],[40.5,26],[38.65,27.45]],HC.rome);
   },[['fill',HC.macedon,'马其顿核心'],['dash',HC.thebes,'和约重分配的小亚细亚地区'],['fill',HC.mino,'罗马盟友帕加马的早期核心'],['dline',HC.rome,'罗马干预与进军方向']]),
  hs('前 168—前 64年','王朝失去核心资源','马其顿王朝覆亡、科林斯遭毁；东方帕提亚取得两河，塞琉古残余最终在前64年被罗马吞并。',[[28,19],[43,61]],d=>{
    ha(d,'hGreekMainland',HC.rome,{fillOpacity:.2});ha(d,'hAntigonidCore',HC.rome,{fillOpacity:.22});ha(d,'hSeleucidSyria',HC.rome,{fillOpacity:.24,dashArray:'5 4'});ha(d,'hParthiaWest',HC.parthia,{fillOpacity:.23});
    hp(d,'pydna',{kind:'battle'});hp(d,'corinth',{kind:'battle',left:1,note:'前146年罗马摧毁科林斯，亚该亚同盟的抵抗失败。'});hp(d,'antioch',{note:'前64年，庞培（Pompey）将叙利亚纳入罗马统治。'});hp(d,'seleucia',{note:'前141年进入帕提亚控制，两河成为安息王朝的重要基础。'});
    hl(d,'帕提亚','Parthia',36.7,54,HC.parthia);
   },[['fill',HC.rome,'先后落入罗马控制的希腊核心'],['dash',HC.rome,'前64年吞并的叙利亚核心'],['fill',HC.parthia,'帕提亚的伊朗—两河核心（概略）']]),
  hs('前 31—前 30年','埃及卷入罗马内战','克娄巴特拉与安东尼依靠埃及资源对抗屋大维；阿克提乌姆失败后，埃及被吞并。',[[23.5,18.5],[40.3,35]],d=>{
    ha(d,'egypt',HC.rome,{fillOpacity:.32});ha(d,'hGreekMainland',HC.rome,{fillOpacity:.13});hp(d,'actium',{kind:'battle',left:1});hp(d,'alexandria',{note:'前30年屋大维进入亚历山大里亚；克娄巴特拉七世与安东尼死去，托勒密王朝终结。'});
    hr(d,[[38.94,20.77],[35.5,24.4],[31.2,29.92]],HC.rome);
   },[['fill',HC.rome,'罗马控制继续扩展至埃及'],['dline',HC.rome,'从希腊战场转向埃及的行动方向']])
 ]},
{id:'history-rome-site',ch:4,title:'台伯河边的十字路口',short:'罗马起源',en:'A Crossroads on the Tiber',period:'约前1000—前6世纪',c:HC.rome,
 scenes:[
  hs('约前10—前8世纪','渡口、盐与三方边界','台伯河入海前最后的好渡口：盐路由此入山，南北商道在此过河，三个族群在此交界。',[[41.5,11.9],[42.4,13.05]],d=>{
    ha(d,'hEtruria',HC.mino,{fillOpacity:.16});ha(d,'hLatium',HC.myc,{fillOpacity:.2});ha(d,'hSabina',HC.hittite,{fillOpacity:.16,dashArray:'5 4'});
    hp(d,'rome');hp(d,'ostia',{left:1});hp(d,'veii',{left:1});hp(d,'albalonga');
    hr(d,[[41.77,12.3],[41.86,12.42],[41.893,12.483],[42.0,12.56],[42.2,12.72],[42.36,12.85]],HC.route);
    hr(d,[[42.25,11.82],[42.02,12.15],[41.93,12.42],[41.88,12.52],[41.72,12.72],[41.55,12.95]],HC.macedon);
    hl(d,'伊特鲁里亚','Etruria',42.3,11.98,HC.mino);hl(d,'拉丁姆','Latium',41.62,12.8,HC.myc);hl(d,'萨宾','Sabines',42.3,12.85,HC.hittite);
   },[['fill',HC.mino,'伊特鲁里亚人'],['fill',HC.myc,'拉丁人'],['dash',HC.hittite,'萨宾人'],['dline',HC.route,'盐路（Via Salaria，示意）'],['dline',HC.macedon,'伊特鲁里亚—坎帕尼亚商道（示意）']],9),
  hs('约前8—前6世纪','谁来了罗马','拉丁人、萨宾人、伊特鲁里亚人、希腊和腓尼基商人，还有传说中的逃亡者。',[[40.75,11.4],[42.55,14.25]],d=>{
    ha(d,'hEtruria',HC.mino,{fillOpacity:.1});ha(d,'hLatium',HC.myc,{fillOpacity:.12});ha(d,'hSabina',HC.hittite,{fillOpacity:.1,dashArray:'5 4'});
    hp(d,'rome');hp(d,'albalonga');hp(d,'cures');hp(d,'tarquinii',{left:1});hp(d,'pyrgi',{left:1});hp(d,'cumae');
    hr(d,[[41.75,12.65],[41.86,12.53]],HC.myc);hr(d,[[42.21,12.72],[41.95,12.52]],HC.hittite);
    hr(d,[[42.25,11.76],[42.0,12.2],[41.92,12.44]],HC.mino);hr(d,[[42.016,11.958],[41.85,12.2],[41.87,12.43]],HC.athens);
    hr(d,[[40.848,14.054],[41.3,13.3],[41.83,12.55]],HC.athens);
   },[['dline',HC.myc,'拉丁人'],['dline',HC.hittite,'萨宾人'],['dline',HC.mino,'伊特鲁里亚人'],['dline',HC.athens,'希腊与腓尼基商人']])
 ]},
{id:'history-rome-kings',ch:4,title:'王、元老与人民',short:'王政时代',en:'The Kings of Rome',period:'前753—前509年',c:HC.rome,
 scenes:[
  hs('前753—前616年','元老推举的王','王不世袭：元老提名，库里亚大会认可；早期罗马吞并阿尔巴隆伽，伸手到河口盐场。',[[41.55,12.1],[42.08,12.95]],d=>{
    ha(d,'hLatium',HC.myc,{fillOpacity:.14});ha(d,'hRomeEarly',HC.rome,{fillOpacity:.32});
    hp(d,'rome');hp(d,'albalonga',{note:'传说第三王图卢斯·霍斯提利乌斯毁了阿尔巴隆伽，把居民迁进罗马。'});hp(d,'ostia',{left:1,note:'传说第四王安库斯·马基乌斯在河口建奥斯蒂亚，控制盐场。'});
    hr(d,[[41.75,12.65],[41.86,12.53]],HC.rome);hr(d,[[41.88,12.45],[41.77,12.31]],HC.rome);
   },[['fill',HC.rome,'罗马早期领地（概略）'],['fill',HC.myc,'拉丁诸城'],['dline',HC.rome,'吞并与扩张方向']],10),
  hs('前616—前509年','伊特鲁里亚系的王','后三王倚重新兵和大工程，撇开元老；罗马成为意大利中部的大城。',[[40.75,11.0],[43.15,14.35]],d=>{
    ha(d,'hEtruria',HC.mino,{fillOpacity:.22});ha(d,'hCampania',HC.mino,{fillOpacity:.1,dashArray:'5 4'});ha(d,'hRomeEarly',HC.rome,{fillOpacity:.32});
    hp(d,'rome');hp(d,'tarquinii',{left:1});hp(d,'veii',{left:1});hp(d,'clusium');hp(d,'capua');hp(d,'cumae',{left:1});
   },[['fill',HC.mino,'伊特鲁里亚城邦'],['dash',HC.mino,'伊特鲁里亚势力伸入坎帕尼亚'],['fill',HC.rome,'罗马']])
 ]},
{id:'history-rome-republic',ch:4,title:'赶走国王',short:'共和初年',en:'The Kings Expelled',period:'前509—前493年',c:HC.rome,
 scenes:[
  hs('前509年','元老和人民联手','傲慢者塔克文被逐，王权一分为二，交给每年改选的两位执政官。',[[41.15,12.05],[42.1,13.4]],d=>{
    ha(d,'hLatium',HC.myc,{fillOpacity:.16});ha(d,'hRomeEarly',HC.rome,{fillOpacity:.32});
    hp(d,'rome',{note:'前509年两位执政官取代国王；波利比乌斯说，同年罗马与迦太基立约。'});hp(d,'ardea',{left:1});hp(d,'antium',{left:1});hp(d,'circeii',{left:1});hp(d,'tarracina');
    hl(d,'条约承认的拉丁海岸','Latin coast in the treaty',41.32,12.62,HC.myc);
   },[['fill',HC.rome,'罗马'],['fill',HC.myc,'拉丁地区'],['dot',HC.myc,'罗马—迦太基条约点名的拉丁海岸城市']]),
  hs('前508—前493年','国王的反扑','被逐的王四处借兵：波尔塞纳兵临城下，拉丁诸城在雷吉卢斯湖一战；前493年罗马与拉丁同盟立约。',[[40.75,11.3],[43.2,14.25]],d=>{
    ha(d,'hEtruria',HC.mino,{fillOpacity:.12});ha(d,'hLatium',HC.myc,{fillOpacity:.16});
    hp(d,'clusium',{kind:'battle',note:'克卢西乌姆王波尔塞纳（Porsenna）进兵罗马；塔西佗说罗马一度向他投降。'});hp(d,'rome');
    hp(d,'aricia',{kind:'battle',left:1});hp(d,'regillus',{kind:'battle'});hp(d,'cumae',{left:1,note:'傲慢者塔克文投奔库迈的僭主阿里斯托德穆斯，前495年死在这里。'});
    hr(d,[[43.0,11.95],[42.5,12.15],[41.95,12.45]],HC.mino);hr(d,[[40.85,14.05],[41.3,13.3],[41.7,12.72]],HC.athens);
   },[['dline',HC.mino,'波尔塞纳进军'],['dline',HC.athens,'库迈援军'],['fill',HC.myc,'拉丁诸城'],['dot',HC.war,'战场']])
 ]},
{id:'history-rome-plebs',ch:4,title:'平民有了自己的官',short:'等级斗争：平民撤离',en:'The Plebs Walk Out',period:'前494—前449年',c:HC.rome,
 scenes:[
  hs('前494—前458年','第一次撤离','山民年年下山劫掠，罗马离不开平民步兵；平民撤到圣山，换来保民官。',[[41.35,12.15],[42.25,13.85]],d=>{
    ha(d,'hLatium',HC.myc,{fillOpacity:.12});ha(d,'hVolsci',HC.hittite,{fillOpacity:.24});ha(d,'hAequi',HC.hittite,{fillOpacity:.24,dashArray:'5 4'});ha(d,'hRomeEarly',HC.rome,{fillOpacity:.3});
    hp(d,'rome',{left:1});hp(d,'monssacer');hp(d,'algidus',{kind:'battle'});
    hr(d,[[41.5,13.4],[41.62,13.05],[41.72,12.82]],HC.war);hr(d,[[42.0,13.25],[41.9,12.95],[41.8,12.8]],HC.war);
    hl(d,'沃尔斯基人','Volsci',41.47,13.48,HC.hittite);hl(d,'埃奎人','Aequi',42.08,13.22,HC.hittite);
   },[['fill',HC.hittite,'南下的山地族群'],['dline',HC.war,'劫掠方向（示意）'],['fill',HC.rome,'罗马'],['fill',HC.myc,'拉丁诸城']]),
  hs('前451—前449年','十二铜表与十人团','十人团编成十二铜表后赖着不走；元老与平民联手把它推倒。',[[41.55,12.15],[42.25,13.1]],d=>{
    ha(d,'hRomeEarly',HC.rome,{fillOpacity:.3});ha(d,'hSabina',HC.hittite,{fillOpacity:.12,dashArray:'5 4'});
    hp(d,'rome',{left:1,note:'前451—前450年，十二铜表在广场公布。'});hp(d,'monssacer',{note:'前449年平民第二次撤离：先上阿文丁山，再到圣山。'});hp(d,'algidus',{kind:'battle',note:'前449年，前线士兵听说维吉尼娅之死，倒戈回城。'});
   },[['fill',HC.rome,'罗马领地（概略）'],['dash',HC.hittite,'萨宾人'],['dot',HC.war,'前线']],10)
 ]},
{id:'history-rome-orders',ch:4,title:'切香肠与十年否决',short:'等级斗争：执政官开放',en:'The Struggle of the Orders',period:'前445—前367年',c:HC.rome,
 scenes:[
  hs('前445—前390年','维爱与高卢人','贵族边打边退；攻灭维爱后分地给平民；前390年高卢人攻破罗马。',[[41.65,11.6],[43.2,12.95]],d=>{
    ha(d,'hEtruria',HC.mino,{fillOpacity:.1});ha(d,'hVeii',HC.rome,{fillOpacity:.22,dashArray:'5 4'});ha(d,'hRomeEarly',HC.rome,{fillOpacity:.32});
    hp(d,'veii',{kind:'battle',left:1,note:'前396年，卡米卢斯攻灭维爱，罗马领土大增。'});hp(d,'allia',{kind:'battle'});hp(d,'rome',{kind:'battle',note:'前390年高卢人攻入城中，只有卡匹托尔山没有失守。'});hp(d,'clusium');
    hr(d,[[43.3,11.85],[43.017,11.949],[42.5,12.25],[42.1,12.52],[41.93,12.5]],HC.celt,{band:true});
   },[['fill',HC.rome,'罗马领地'],['dash',HC.rome,'新得的维爱土地'],['dline',HC.celt,'高卢人南下路线（概略）'],['dot',HC.war,'战场']]),
  hs('前384—前367年','十年否决','曼利乌斯以“图谋称王”被处死；保民官连年否决选举，前367年执政官向平民开放。',[[41.65,12.05],[42.35,12.95]],d=>{
    ha(d,'hVeii',HC.rome,{fillOpacity:.2});ha(d,'hRomeEarly',HC.rome,{fillOpacity:.32});
    hp(d,'rome',{note:'前384年曼利乌斯从卡匹托尔山的塔佩亚岩被推下；前367年卡米卢斯许愿修建和谐女神庙。'});hp(d,'sutrium',{left:1});hp(d,'nepet');
   },[['fill',HC.rome,'罗马领地（含原维爱土地）'],['site',HC.rome,'新设的拉丁殖民地']])
 ]},
{id:'history-rome-mature',ch:4,title:'征服意大利',short:'征服意大利',en:'Conquering Italy',period:'前340—前264年',c:HC.rome,
 scenes:[
  hs('前340—前338年','分级吸纳','拉丁同盟解散，战败者按等级吸纳：全权公民、无投票权公民、拉丁权、同盟者。',[[40.75,12.0],[42.25,14.45]],d=>{
    ha(d,'hLatium',HC.rome,{fillOpacity:.26});ha(d,'hCampania',HC.rome,{fillOpacity:.12,dashArray:'5 4'});ha(d,'hVolsci',HC.rome,{fillOpacity:.12,dashArray:'5 4'});
    hp(d,'rome');hp(d,'antium',{left:1,note:'前338年罗马收服安提乌姆，缴获其战船。'});hp(d,'capua');hp(d,'tibur');hp(d,'praeneste',{left:1});
   },[['fill',HC.rome,'并入罗马公民体（概略）'],['dash',HC.rome,'无投票权公民等附属地区（概略）'],['dot',HC.myc,'保留拉丁权的盟邦（如提布尔、普雷内斯特）']]),
  hs('前326—前290年','萨莫奈战争与大道','卡夫丁之辱后，罗马修路、设殖民地，把山民围起来；前295年森提努姆一战定局。',[[40.4,11.9],[43.7,16.0]],d=>{
    ha(d,'hSamnium',HC.hittite,{fillOpacity:.24});ha(d,'hLatium',HC.rome,{fillOpacity:.2});ha(d,'hCampania',HC.rome,{fillOpacity:.14});ha(d,'hColonies290',HC.rome,{fillOpacity:.6,weight:.8});
    hp(d,'rome');hp(d,'capua',{left:1});hp(d,'caudium',{kind:'battle'});hp(d,'sentinum',{kind:'battle'});
    d.line([[41.893,12.483],[41.75,12.65],[41.56,12.95],[41.29,13.25],[41.26,13.6],[41.17,13.9],[41.08,14.25]],{color:HC.rome,weight:2.8,opacity:.95});
    hl(d,'萨莫奈人','Samnites',41.55,14.62,HC.hittite);
   },[['fill',HC.hittite,'萨莫奈人'],['line',HC.rome,'阿庇亚大道（前312年起）'],['site',HC.rome,'拉丁殖民地（概略）'],['dot',HC.war,'战场']]),
  hs('前287年','最后一次撤离','平民退到雅尼库鲁姆山；霍腾西乌斯法规定平民会议的决议约束全体公民。',[[41.62,12.1],[42.15,12.9]],d=>{
    ha(d,'hLatium',HC.rome,{fillOpacity:.18});ha(d,'hVeii',HC.rome,{fillOpacity:.18});hp(d,'rome');hp(d,'janiculum',{left:1});hp(d,'monssacer');
   },[['fill',HC.rome,'罗马公民地区（概略）'],['dot',HC.war,'历次撤离地：圣山（前494、前449）、雅尼库鲁姆山（前287）']],10),
  hs('前280—前264年','“一群国王”','皮洛士赢了战役、输了战争；前264年罗马控制阿尔诺河—卢比孔河以南的半岛。',[[37.7,9.0],[44.4,21.3]],d=>{
    ha(d,'romanItaly264',HC.rome,{fillOpacity:.2});ha(d,'hColonies264',HC.rome,{fillOpacity:.65,weight:.8});
    hp(d,'rome');hp(d,'heraclea',{kind:'battle'});hp(d,'asculum',{kind:'battle'});hp(d,'beneventum',{kind:'battle',left:1});hp(d,'taras',{note:'南意大利最富的希腊城市，请皮洛士来对付罗马；前272年投降。'});
    hr(d,[[39.16,20.98],[39.8,19.6],[40.3,18.1],[40.45,17.3]],HC.macedon);
   },[['fill',HC.rome,'约前264年罗马控制的意大利'],['site',HC.rome,'拉丁殖民地（概略）'],['dline',HC.macedon,'皮洛士渡海'],['dot',HC.war,'战场']])
 ]},
{id:'history-rome-punic',ch:4,title:'布匿战争',short:'布匿战争',en:'The Punic Wars',period:'前264—前201年',c:HC.rome,
 scenes:[
  hs('前264—前241年','第一次布匿战争','为墨西拿开战，罗马头一回造舰队；前241年在埃加迪群岛决胜，西西里成了第一个行省。',[[33.0,5.4],[42.0,17.4]],d=>{
    ha(d,'romanItaly264',HC.rome,{fillOpacity:.2});ha(d,'hCarthageAfrica',HC.mino,{fillOpacity:.26});ha(d,'hPunicSicily',HC.mino,{fillOpacity:.3});
    ha(d,'hSardCorsica',HC.mino,{fillOpacity:.14,dashArray:'5 4'});ha(d,'hSyracuse',HC.route,{fillOpacity:.3});
    hp(d,'rome');hp(d,'carthage',{left:1});hp(d,'messana');hp(d,'mylae',{kind:'battle',left:1});hp(d,'aegates',{kind:'battle',left:1});
    hp(d,'syracuse',{note:'国王希伦二世（Hiero II）前263年改投罗马，此后半个世纪是罗马的粮仓和盟友。'});
    hr(d,[[37.1,13.9],[36.95,12.5],[36.85,11.1]],HC.rome);
   },[['fill',HC.rome,'罗马及意大利同盟'],['fill',HC.mino,'迦太基领地'],['dash',HC.mino,'迦太基的撒丁岛与科西嘉（前238年被罗马夺走）'],['fill',HC.route,'叙拉古王国（罗马盟友）'],['dline',HC.rome,'前256年雷古卢斯登陆非洲'],['dot',HC.war,'海战']]),
  hs('前218—前216年','汉尼拔翻山','汉尼拔从新迦太基出发，翻比利牛斯山和阿尔卑斯山，在特雷比亚、特拉西梅诺、坎尼三战连胜。',[[36.2,-3.5],[46.6,17.5]],d=>{
    ha(d,'hBarcidSpain',HC.mino,{fillOpacity:.24});ha(d,'hCarthageAfrica',HC.mino,{fillOpacity:.2});ha(d,'romanItaly264',HC.rome,{fillOpacity:.2});
    hp(d,'cartnova',{left:1});hp(d,'saguntum');hp(d,'trebia',{kind:'battle'});hp(d,'trasimene',{kind:'battle',left:1});hp(d,'cannae',{kind:'battle'});hp(d,'rome',{left:1});
    hr(d,[[37.6,-0.98],[39.68,-0.27],[41.0,0.9],[42.45,2.9],[43.8,4.6],[44.7,6.2],[45.2,6.95],[45.07,7.68],[45.0,9.6],[43.8,11.2],[43.19,12.03],[43.0,13.6],[42.0,14.8],[41.31,16.13]],HC.mino,{band:true});
   },[['fill',HC.mino,'迦太基与巴卡家族的西班牙'],['fill',HC.rome,'罗马及意大利同盟'],['dline',HC.mino,'汉尼拔进军路线（概略）'],['dot',HC.war,'战场']]),
  hs('前215—前201年','拆同盟与扎马','卡普阿、南意大利与叙拉古倒向汉尼拔，拉丁殖民地守住；大西庇阿先取西班牙，再渡海打到扎马。',[[33.8,-3.0],[44.0,19.0]],d=>{
    ha(d,'romanItaly264',HC.rome,{fillOpacity:.18});ha(d,'hHannibalItaly',HC.mino,{fillOpacity:.22,dashArray:'5 4'});ha(d,'hColonies264',HC.rome,{fillOpacity:.65,weight:.8});
    ha(d,'hBarcidSpain',HC.mino,{fillOpacity:.12,dashArray:'5 4'});ha(d,'hCarthageAfrica',HC.mino,{fillOpacity:.22});
    hp(d,'capua',{kind:'battle',note:'前216年倒向汉尼拔，前211年被罗马攻回：城中头面人物被处死，土地充公。'});
    hp(d,'syracuse',{kind:'battle',note:'前214年改投迦太基，前212年被罗马攻破，阿基米德死于城破。'});
    hp(d,'cartnova',{kind:'battle',left:1});hp(d,'zama',{kind:'battle'});hp(d,'carthage');hp(d,'rome',{left:1});
    hr(d,[[37.8,12.43],[37.4,11.3],[37.06,10.06]],HC.rome);
   },[['fill',HC.rome,'罗马及意大利同盟'],['dash',HC.mino,'倒向汉尼拔的地区（前216—前211年，概略）'],['site',HC.rome,'拉丁殖民地（无一倒戈）'],['fill',HC.mino,'迦太基'],['dline',HC.rome,'前204年大西庇阿从西西里渡海'],['dot',HC.war,'战场']])
 ]},
{id:'history-rome-east',ch:4,title:'东进',short:'罗马东进',en:'Rome Turns East',period:'前200—前133年',c:HC.rome,
 scenes:[
  hs('前200—前188年','先当裁判','人民大会先否决对马其顿开战；罗马击败腓力五世和安条克三世，宣布“希腊人自由”，撤军不设行省。',[[35.2,12.0],[43.3,31.5]],d=>{
    ha(d,'romanItaly264',HC.rome,{fillOpacity:.18});ha(d,'hAntigonidCore',HC.macedon,{fillOpacity:.24});ha(d,'hSeleucidAnatolia',HC.thebes,{fillOpacity:.16,dashArray:'5 4'});
    ha(d,'hPergamonCore',HC.mino,{fillOpacity:.28});ha(d,'hAetolia',HC.athens,{fillOpacity:.2});ha(d,'hAchaeanLeague',HC.athens,{fillOpacity:.16,dashArray:'4 3'});
    hp(d,'cynoscephalae',{kind:'battle',left:1});hp(d,'corinth',{left:1,note:'前196年地峡运动会上，弗拉米尼努斯（Flamininus）宣布希腊人自由。'});
    hp(d,'thermopylae',{kind:'battle',note:'前191年安条克三世据守温泉关，老加图带兵绕山路抄了后路。'});hp(d,'magnesia',{kind:'battle'});hp(d,'apamea',{left:1});hp(d,'pergamon');
    hr(d,[[40.64,17.95],[40.6,19.4],[39.9,21.0],[39.35,22.55]],HC.rome);hr(d,[[40.5,23],[40.5,26],[38.65,27.45]],HC.rome);
   },[['fill',HC.macedon,'安提柯马其顿'],['dash',HC.thebes,'塞琉古在小亚细亚的势力（前188年退出）'],['fill',HC.mino,'帕加马（罗马盟友）'],['fill',HC.athens,'埃托利亚同盟'],['dash',HC.athens,'亚该亚同盟'],['dline',HC.rome,'罗马进军方向']]),
  hs('前187—前167年','战利品与凯旋','西庇阿兄弟被告上法庭；前168年保卢斯在皮德纳灭了马其顿，带回的财宝让罗马公民从此不交直接税。',[[37.2,17.6],[42.4,26.2]],d=>{
    ha(d,'hAntigonidCore',HC.rome,{fillOpacity:.2,dashArray:'5 4'});ha(d,'hGreekMainland',HC.neutral,{fillOpacity:.08});
    hp(d,'pydna',{kind:'battle'});hp(d,'pella',{note:'前167年马其顿王国被拆成四个共和国，彼此不得通婚、通商。'});hp(d,'epirus',{kind:'battle',left:1});
    hp(d,'corinth',{left:1,note:'前167年亚该亚同盟一千名头面人物被押往意大利作人质，波利比乌斯在其中。'});
    hp(d,'delos',{note:'前166年罗马把提洛岛设为免税港，盟友罗得岛的港税收入一落千丈。'});
    hr(d,[[40.36,22.61],[40.6,20.9],[40.72,19.47],[40.64,17.95]],HC.rome,{band:true});
   },[['dash',HC.rome,'前167年被拆成四国的马其顿'],['dot',HC.war,'战场与被洗劫的伊庇鲁斯'],['dline',HC.rome,'战利品、奴隶与人质运往意大利']]),
  hs('前149—前133年','毁城与征兵难','前146年迦太基、科林斯同年被毁；西班牙越打越难，征兵受阻；前133年小西庇阿攻下努曼提亚。',[[32.6,-9.6],[46.2,30.2]],d=>{
    ha(d,'romanItaly264',HC.rome,{fillOpacity:.24});ha(d,'poValley',HC.rome,{fillOpacity:.12,dashArray:'5 4'});ha(d,'hSicily',HC.rome,{fillOpacity:.24});ha(d,'hSardCorsica',HC.rome,{fillOpacity:.2});
    ha(d,'hHispania133',HC.rome,{fillOpacity:.2});ha(d,'hAfrica146',HC.rome,{fillOpacity:.28});ha(d,'hAntigonidCore',HC.rome,{fillOpacity:.24});
    ha(d,'hGreekMainland',HC.rome,{fillOpacity:.1,dashArray:'5 4'});ha(d,'hPergamonCore',HC.rome,{fillOpacity:.14,dashArray:'5 4'});
    hp(d,'rome');hp(d,'carthage',{kind:'battle'});hp(d,'corinth',{kind:'battle',left:1,note:'前146年被罗马攻破焚毁，亚该亚同盟解散。'});hp(d,'numantia',{kind:'battle'});
    hp(d,'pergamon',{note:'前133年国王阿塔罗斯三世立遗嘱把王国赠给罗马，后来成了亚细亚行省。'});
   },[['fill',HC.rome,'罗马的意大利与行省（约前133年）'],['dash',HC.rome,'受罗马控制的波河流域、希腊与刚遗赠的帕加马'],['dot',HC.war,'被攻毁的城市']])
 ]},
{id:'history-rome-gracchi',ch:4,title:'格拉古兄弟',short:'格拉古兄弟',en:'The Gracchi',period:'前133—前121年',c:HC.rome,
 scenes:[
  hs('前133年','提比略的土地法','提比略绕开元老院把分地法直接交人民表决，罢免投否决票的同僚，又要挪用帕加马的遗产；选举日被元老们用凳腿打死。',[[36.4,7.6],[46.2,29.6]],d=>{
    ha(d,'romanItaly264',HC.rome,{fillOpacity:.16});ha(d,'hEtruria',HC.war,{fillOpacity:.16,dashArray:'5 4'});ha(d,'hPergamonCore',HC.mino,{fillOpacity:.3});
    hp(d,'rome',{kind:'battle',note:'前133年选举日，提比略和三百个追随者在卡匹托尔山被打死，尸体扔进台伯河。'});
    hp(d,'pergamon',{note:'前133年国王阿塔罗斯三世立遗嘱把王国赠给罗马；提比略要拿这笔钱给新农户买农具。'});
    hr(d,[[39.12,27.18],[38.3,22.5],[39.8,19.0],[41.6,13.6],[41.85,12.6]],HC.mino);
    hl(d,'奴隶耕种的大庄园','Slave-worked estates',42.75,11.55,HC.war);
   },[['fill',HC.rome,'罗马与意大利同盟'],['dash',HC.war,'伊特鲁里亚：提比略路过时只见奴隶不见农民'],['fill',HC.mino,'帕加马王国（遗赠罗马）'],['dline',HC.mino,'遗产运往罗马（示意）']]),
  hs('前123—前121年','盖约：好处与反噬','盖约平价卖粮、把法庭交给骑士、在海外设殖民地；元老院让另一位保民官开出更高价码，民众转身，他死于“最后决议”。',[[35.8,8.0],[43.4,19.4]],d=>{
    ha(d,'romanItaly264',HC.rome,{fillOpacity:.18});ha(d,'hAfrica146',HC.rome,{fillOpacity:.22,dashArray:'5 4'});
    hp(d,'rome',{kind:'battle',note:'前121年执政官奥皮米乌斯攻上阿文丁山；盖约逃过台伯河，在弗丽娜女神的小树林里让奴隶杀了自己。'});
    hp(d,'carthage',{note:'盖约在迦太基旧址设殖民地“尤诺尼亚”；元老派说那块地被诅咒过，殖民地后来作罢。'});
    hp(d,'taras',{note:'前122年盖约在此设殖民地“尼普顿尼亚”。'});hp(d,'scolacium',{left:1});
    hr(d,[[41.85,12.4],[39.5,11.6],[37.1,10.5]],HC.rome);
   },[['fill',HC.rome,'罗马与意大利同盟'],['dash',HC.rome,'阿非利加行省'],['dline',HC.rome,'海外殖民（示意）']])
 ]},
{id:'history-rome-marius',ch:4,title:'马略的兵',short:'马略军改',en:'Marius and His Army',period:'前112—前100年',c:HC.rome,
 scenes:[
  hs('前112—前105年','朱古达与无产者','朱古达靠行贿拖住罗马；新人马略借人民夺得兵权，招无产者入伍；他的财务官苏拉设计擒获朱古达。',[[31.8,-3.5],[38.6,12.6]],d=>{
    ha(d,'hNumidia',HC.mino,{fillOpacity:.26});ha(d,'hAfrica146',HC.rome,{fillOpacity:.28});
    hp(d,'cirta',{kind:'battle'});hp(d,'carthage',{left:1});hp(d,'zama',{kind:'battle',note:'前109年梅特卢斯围攻努米底亚的扎马未下；和前202年汉尼拔战败的扎马未必是同一地点。'});
    hl(d,'努米底亚','Numidia',35.3,4.2,HC.mino);hl(d,'毛里塔尼亚','Mauretania',34.6,-2.2,HC.neutral);
   },[['fill',HC.mino,'朱古达的努米底亚'],['fill',HC.rome,'阿非利加行省'],['dot',HC.war,'战场']]),
  hs('前113—前100年','北方来敌与马略的骡子','辛布里人和条顿人屡败罗马军；马略连任五届执政官，把公民兵练成职业兵，两战全歼来敌；退伍兵要地，他又亲手镇压了自己的盟友。',[[40.6,-2.0],[49.6,16.0]],d=>{
    ha(d,'romanItaly264',HC.rome,{fillOpacity:.18});ha(d,'poValley',HC.rome,{fillOpacity:.12,dashArray:'5 4'});ha(d,'hNarbonensis',HC.rome,{fillOpacity:.2});
    hp(d,'noreia',{kind:'battle'});hp(d,'arausio',{kind:'battle',left:1});hp(d,'aquaesextiae',{kind:'battle'});hp(d,'vercellae',{kind:'battle'});
    hp(d,'rome',{note:'前100年保民官萨图尔尼努斯一伙被困在元老院议事厅，人群掀了屋瓦把他们砸死。'});
    hr(d,[[46.9,14.4],[47.6,10.5],[47.8,6.5],[45.5,3.0],[43.2,0.0]],HC.celt,{band:true});
    hr(d,[[45.5,3.0],[44.6,4.8],[43.53,5.45]],HC.celt);hr(d,[[47.6,10.5],[46.6,11.3],[45.32,8.42]],HC.celt);
   },[['fill',HC.rome,'罗马的意大利与山外高卢行省'],['dline',HC.celt,'辛布里人、条顿人的迁徙与南下（概略）'],['dot',HC.war,'战场']])
 ]},
{id:'history-rome-social',ch:4,title:'同盟者战争',short:'同盟者战争',en:'The Social War',period:'前91—前88年',c:HC.rome,
 scenes:[
  hs('前91—前90年','盟友揭竿','盟友出兵多、分得少，还常受罗马官员欺辱；为他们争公民权的德鲁苏斯遇刺，马尔西人、萨莫奈人等起兵，另立“意大利”。',[[39.6,10.8],[44.4,18.4]],d=>{
    ha(d,'romanItaly264',HC.rome,{fillOpacity:.14});ha(d,'hSocialRebels',HC.war,{fillOpacity:.26});
    hp(d,'rome');hp(d,'corfinium');hp(d,'asculumpicenum',{kind:'battle'});hp(d,'teanum',{left:1});
    hl(d,'马尔西人','Marsi',42.2,13.2,HC.war);hl(d,'萨莫奈人','Samnites',41.45,14.75,HC.war);
   },[['fill',HC.rome,'罗马、拉丁殖民地与未起兵的盟邦'],['fill',HC.war,'起兵的盟邦（概略）']]),
  hs('前90—前88年','发公民权收场','罗马一边打，一边发公民权：先给没反的，再给放下武器的，波河以北给拉丁权；起兵者很快瓦解，只剩萨莫奈人死扛。',[[39.6,6.8],[46.8,18.4]],d=>{
    ha(d,'romanItaly264',HC.rome,{fillOpacity:.28});ha(d,'hTranspadana',HC.rome,{fillOpacity:.14,dashArray:'5 4'});ha(d,'hSamnium',HC.war,{fillOpacity:.3});
    hp(d,'rome');hp(d,'asculumpicenum',{kind:'battle',note:'前89年执政官庞培·斯特拉波攻陷阿斯库路姆；他十七岁的儿子庞培和同岁的西塞罗都在军中。'});
   },[['fill',HC.rome,'获得罗马公民权的意大利（前90—前89年）'],['dash',HC.rome,'波河以北：先给拉丁权（前89年）'],['fill',HC.war,'坚持到最后的萨莫奈人']])
 ]},
{id:'history-rome-sulla',ch:4,title:'马略与苏拉',short:'马略与苏拉',en:'Marius and Sulla',period:'前88—前78年',c:HC.rome,
 scenes:[
  hs('前88年','苏拉进军罗马','为争东征兵权，马略一派的保民官带打手闹出人命；苏拉从诺拉军营带兵杀进罗马，马略出逃非洲。',[[35.9,8.4],[42.6,16.6]],d=>{
    ha(d,'romanItaly264',HC.rome,{fillOpacity:.14});
    hp(d,'rome',{kind:'battle',note:'前88年苏拉带六个军团攻入罗马：罗马军队第一次占领罗马城。'});hp(d,'nola',{left:1});hp(d,'minturnae',{left:1});
    hp(d,'carthage',{note:'逃亡的马略在迦太基废墟上落脚，总督派人赶他走。'});
    hr(d,[[40.93,14.53],[41.3,13.6],[41.85,12.6]],HC.rome);hr(d,[[41.2,13.7],[39.0,11.8],[37.2,10.4]],HC.war);
   },[['dline',HC.rome,'苏拉从诺拉进军罗马'],['dline',HC.war,'马略逃亡非洲'],['dot',HC.war,'战事']]),
  hs('前87—前85年','大哥杀回来','秦纳被逐后召回马略，两人攻破罗马大杀苏拉一派；马略第七次当执政官，十七天后病死。苏拉在东方攻破雅典，与本都王速和。',[[35.6,10.6],[45.8,38.2]],d=>{
    ha(d,'hPontus',HC.thebes,{fillOpacity:.26});ha(d,'hWestAnatolia',HC.war,{fillOpacity:.14,dashArray:'5 4'});ha(d,'romanItaly264',HC.rome,{fillOpacity:.14});
    hp(d,'rome',{kind:'battle',note:'前87年马略与秦纳攻破罗马：执政官屋大维乌斯坐在官椅上被砍头，人头挂上讲坛。'});
    hp(d,'athens',{kind:'battle',note:'前86年3月1日苏拉攻破倒向本都的雅典。'});hp(d,'chaeronea',{kind:'battle',left:1,note:'前86年苏拉在此大败本都军。'});
    hp(d,'sinope',{note:'本都王国的都城。'});
    hr(d,[[40.64,17.95],[40.7,19.5],[39.3,21.6],[38.5,22.8]],HC.rome);
   },[['fill',HC.thebes,'本都王国'],['dash',HC.war,'前88年本都占领的亚细亚'],['dline',HC.rome,'苏拉东征'],['dot',HC.war,'战场']]),
  hs('前83—前78年','独裁与辞职','苏拉回师，科林门一战定局；当上没有期限的独裁官，贴出公敌名单，削保民官、扩元老院；前79年交权隐退，次年病死。',[[39.9,11.6],[43.8,18.4]],d=>{
    ha(d,'romanItaly264',HC.rome,{fillOpacity:.16});ha(d,'hSamnium',HC.war,{fillOpacity:.2,dashArray:'5 4'});
    hp(d,'brundisium');hp(d,'rome',{kind:'battle',note:'前82年11月1日苏拉在城北科林门险胜萨莫奈人和马略派；数千俘虏随后被屠，惨叫声传进了开会的元老院。'});
    hp(d,'praeneste',{kind:'battle',left:1,note:'前82年小马略被围于此，城破前自尽。'});hp(d,'puteoli',{left:1});
    hl(d,'皮切努姆：庞培自募三军团','Picenum',43.0,13.6,HC.rome);
    hr(d,[[40.64,17.95],[41.1,15.6],[41.3,14.0],[41.85,12.6]],HC.rome);
   },[['fill',HC.rome,'意大利'],['dash',HC.war,'站在马略派一边的萨莫奈人'],['dline',HC.rome,'苏拉回师（前83—前82年）'],['dot',HC.war,'战场']])
 ]},
{id:'history-rome-pompey',ch:4,title:'庞培与克拉苏',short:'庞培与克拉苏',en:'Pompey and Crassus',period:'前83—前62年',c:HC.rome,
 scenes:[
  hs('前83—前70年','两个副手上位','庞培以私人身份带兵连打西西里、非洲和西班牙；克拉苏靠公敌家产成为首富，又镇压斯巴达克斯；前70年两人同任执政官，恢复保民官的权力。',[[35.4,-9.4],[45.6,19.4]],d=>{
    ha(d,'hHispania133',HC.war,{fillOpacity:.16,dashArray:'5 4'});ha(d,'romanItaly264',HC.rome,{fillOpacity:.16});
    hp(d,'osca');hp(d,'rome');hp(d,'capua',{note:'前73年角斗士斯巴达克斯从这里的角斗士学校逃出。'});hp(d,'vesuvius',{left:1});
    d.line([[41.08,14.25],[41.29,13.25],[41.56,12.95],[41.893,12.483]],{color:HC.war,weight:2.6,opacity:.9,dashArray:'1 5'});
    hr(d,[[40.82,14.43],[42.5,13.2],[44.6,10.95],[42.2,14.9],[38.2,15.7],[40.5,15.4]],HC.war);
   },[['dash',HC.war,'塞多留割据的西班牙（前80—前72年，概略）'],['dline',HC.war,'斯巴达克斯的转战（概略）'],['line',HC.war,'前71年阿庇亚大道两旁的六千个十字架']]),
  hs('前67—前62年','庞培的东方','保民官为庞培争来剿海盗、打本都的非常任命；他三个月扫平海盗，击溃米特拉达梯，并叙利亚、入耶路撒冷；回国解散军队，元老院却晾着他。',[[30.6,24.0],[46.2,45.2]],d=>{
    ha(d,'hPontus',HC.thebes,{fillOpacity:.22,dashArray:'5 4'});ha(d,'hSeleucidSyria',HC.rome,{fillOpacity:.26});ha(d,'hWestAnatolia',HC.rome,{fillOpacity:.12});
    hp(d,'coracesium',{kind:'battle',left:1});hp(d,'sinope');hp(d,'panticapaeum');hp(d,'antioch',{note:'前64年庞培把塞琉古王国的残余并为叙利亚行省。'});
    hp(d,'jerusalem',{kind:'battle',note:'前63年庞培攻下圣殿山，走进至圣所，什么也没拿。'});
    hr(d,[[36.54,32.0],[39.2,34.5],[40.3,38.0],[40.6,41.5],[37.5,40.0],[36.25,36.3]],HC.rome);hr(d,[[36.2,36.16],[33.9,35.6],[31.85,35.25]],HC.rome);
   },[['dash',HC.thebes,'本都王国（被击溃）'],['fill',HC.rome,'罗马行省：亚细亚与前64年新设的叙利亚'],['dline',HC.rome,'庞培的东征（概略）']])
 ]},
{id:'history-rome-triumvirate',ch:4,title:'前三头',short:'前三头',en:'The First Triumvirate',period:'前63—前50年',c:HC.rome,
 scenes:[
  hs('前63—前59年','三个人分权','恺撒把被元老院卡住的庞培和克拉苏撮合起来，三人私下结盟；前59年恺撒任执政官，强推法案，拿下高卢兵权。',[[34.6,-6.0],[49.2,41.0]],d=>{
    ha(d,'poValley',HC.rome,{fillOpacity:.3});ha(d,'hNarbonensis',HC.rome,{fillOpacity:.3});
    ha(d,'hSeleucidSyria',HC.athens,{fillOpacity:.26});ha(d,'hPontus',HC.athens,{fillOpacity:.16,dashArray:'5 4'});ha(d,'hWestAnatolia',HC.mino,{fillOpacity:.28});
    hp(d,'rome',{note:'前63年执政官西塞罗未经审判处死喀提林的同谋；恺撒反对，小加图力主处死。'});
    hl(d,'恺撒：高卢兵权','Caesar: the Gauls',46.4,5.5,HC.rome);hl(d,'庞培：东方安排','Pompey: the East',38.6,37.0,HC.athens);hl(d,'克拉苏：亚细亚包税','Crassus: Asian tax farms',38.0,28.6,HC.mino);
   },[['fill',HC.rome,'恺撒拿到的高卢兵权（前59年起）'],['fill',HC.athens,'庞培要元老院承认的东方安排'],['fill',HC.mino,'克拉苏替包税商争的亚细亚']]),
  hs('前58—前50年','征服高卢','恺撒八年打下整个高卢，前52年在阿莱西亚围降维钦托利；前56年三人在卢卡续约。',[[41.6,-5.4],[52.4,12.6]],d=>{
    ha(d,'hNarbonensis',HC.rome,{fillOpacity:.3});ha(d,'hGaulComata',HC.celt,{fillOpacity:.22});ha(d,'poValley',HC.rome,{fillOpacity:.22});
    hp(d,'alesia',{kind:'battle'});hp(d,'luca',{left:1});
    hr(d,[[45.5,6.0],[46.9,4.8],[48.5,3.5],[50.2,3.0]],HC.rome);hr(d,[[49.0,6.0],[50.4,7.1]],HC.rome);hr(d,[[50.6,1.7],[51.1,1.2]],HC.rome);
    hl(d,'高卢','Gallia Comata',47.6,1.4,HC.celt);
   },[['fill',HC.celt,'前58—前50年恺撒征服的高卢'],['fill',HC.rome,'原有的山外、山南高卢'],['dline',HC.rome,'恺撒的进军（概略），含渡莱茵河、渡海峡'],['dot',HC.war,'战场']]),
  hs('前54—前50年','卡莱与破局','尤利娅难产死，克拉苏在卡莱死于安息骑射；城里帮派火并，庞培成了唯一执政官，和元老院强硬派联手逼恺撒交兵。',[[30.6,30.6],[40.6,47.0]],d=>{
    ha(d,'hSeleucidSyria',HC.rome,{fillOpacity:.26});ha(d,'hParthiaWest',HC.parthia,{fillOpacity:.24});
    hp(d,'antioch');hp(d,'carrhae',{kind:'battle'});hp(d,'seleucia',{note:'两河的大城，对岸就是安息的冬都泰西封。'});
    hr(d,[[36.2,36.16],[36.6,37.6],[36.9,38.6],[36.87,39.03]],HC.rome);
   },[['fill',HC.rome,'叙利亚行省'],['fill',HC.parthia,'安息（帕提亚）'],['dline',HC.rome,'前53年克拉苏东征'],['dot',HC.war,'战场']])
 ]},
{id:'history-rome-caesar',ch:4,title:'恺撒',short:'恺撒内战与独裁',en:'Caesar',period:'前49—前44年',c:HC.rome,
 scenes:[
  hs('前49—前48年','渡过卢比孔河','元老院要恺撒交兵，他带一个军团渡过卢比孔河；庞培弃守意大利，法萨卢斯一战败北，逃到埃及被杀。',[[30.4,-1.0],[46.2,33.6]],d=>{
    ha(d,'hGaulComata',HC.rome,{fillOpacity:.16});ha(d,'hNarbonensis',HC.rome,{fillOpacity:.16});ha(d,'poValley',HC.rome,{fillOpacity:.2});
    ha(d,'hHispania133',HC.athens,{fillOpacity:.2,dashArray:'5 4'});ha(d,'hGreekMainland',HC.athens,{fillOpacity:.14,dashArray:'5 4'});
    hp(d,'rubicon');hp(d,'ilerda',{kind:'battle'});hp(d,'dyrrachium',{kind:'battle',left:1});hp(d,'pharsalus',{kind:'battle'});hp(d,'pelusium',{kind:'battle'});
    hr(d,[[44.1,12.4],[42.3,13.6],[40.64,17.95]],HC.rome);hr(d,[[40.64,17.95],[41.32,19.45],[39.3,22.38]],HC.rome);hr(d,[[39.3,22.38],[36.5,27.5],[31.04,32.55]],HC.athens);
   },[['fill',HC.rome,'恺撒的高卢与意大利'],['dash',HC.athens,'庞培派的根据地：西班牙与东方'],['dline',HC.rome,'恺撒南下、渡海'],['dline',HC.athens,'庞培逃往埃及'],['dot',HC.war,'战场与死地']]),
  hs('前48—前45年','扫平残局','恺撒在亚历山大里亚扶克娄巴特拉为王，五天击败本都王子；前46年塔普苏斯一战，小加图在乌提卡自尽；前45年蒙达击败庞培的儿子。',[[30.2,-7.6],[42.6,37.2]],d=>{
    ha(d,'egypt',HC.mino,{fillOpacity:.22});ha(d,'hAfrica146',HC.athens,{fillOpacity:.2,dashArray:'5 4'});
    hp(d,'alexandria',{kind:'battle',note:'前48—前47年恺撒在城中被围半年，大图书馆的一部分藏书在战火中焚毁。'});hp(d,'zela',{kind:'battle'});hp(d,'thapsus',{kind:'battle'});hp(d,'utica',{left:1});hp(d,'munda',{kind:'battle',left:1});
   },[['fill',HC.mino,'托勒密埃及（克娄巴特拉）'],['dash',HC.athens,'元老派残部的阿非利加'],['dot',HC.war,'战场']]),
  hs('前46—前44年','独裁与三月十五','恺撒一面宽赦政敌，一面把终身独裁官、保民官的人身神圣、监察风化之权揽于一身；前44年3月15日，出征安息前三天被刺。',[[31.0,8.0],[44.8,47.2]],d=>{
    ha(d,'hParthiaWest',HC.parthia,{fillOpacity:.18,dashArray:'5 4'});
    hp(d,'rome',{kind:'battle',note:'前44年3月15日，恺撒在庞培剧场旁的议事厅被刺二十三刀，倒在庞培雕像脚下。'});
    hp(d,'carthage',{note:'前44年恺撒下令在废墟上重建迦太基，作为罗马殖民地。'});hp(d,'corinth',{left:1,note:'前44年恺撒下令重建科林斯，安置老兵和被释奴。'});
    hr(d,[[41.85,12.6],[40.64,17.95],[38.5,27.0],[36.6,37.6],[35.0,41.5]],HC.rome);
   },[['dash',HC.parthia,'恺撒准备出征的安息'],['dline',HC.rome,'计划中的安息远征（未成行）'],['dot',HC.war,'遇刺地']])
 ]},
{id:'history-rome-augustus',ch:4,title:'后三头与奥古斯都',short:'后三头',en:'The Second Triumvirate and Augustus',period:'前44—前27年',c:HC.rome,
 scenes:[
  hs('前44年','恺撒的遗产','安东尼借葬礼煽动民众，接管恺撒的文书和国库；遗嘱却收养了十八岁的屋大维，他自掏腰包招募老兵，还把安东尼的两个军团拉了过去。',[[39.8,10.6],[45.6,20.6]],d=>{
    ha(d,'romanItaly264',HC.rome,{fillOpacity:.14});ha(d,'poValley',HC.rome,{fillOpacity:.1,dashArray:'5 4'});
    hp(d,'rome',{note:'前44年3月20日恺撒葬礼：民众在广场上焚化遗体，冲向刺客的家。'});hp(d,'apollonia',{left:1});hp(d,'brundisium');
    hp(d,'capua',{note:'屋大维在坎帕尼亚每人出五百狄纳里，招募恺撒的老兵。'});
    hr(d,[[40.72,19.47],[40.64,17.95],[41.08,14.25],[41.85,12.6]],HC.macedon);
   },[['fill',HC.rome,'意大利'],['dash',HC.rome,'安东尼索要的山南高卢'],['dline',HC.macedon,'屋大维从阿波罗尼亚回国（概略）']]),
  hs('前43年','西塞罗的赌局','西塞罗想借屋大维打安东尼；两位执政官在穆提那战死，元老院冷落屋大维，他带兵进城当上执政官，转身与安东尼、雷必达结成后三头；西塞罗上了公敌名单。',[[40.6,9.6],[45.4,14.6]],d=>{
    ha(d,'poValley',HC.rome,{fillOpacity:.14});
    hp(d,'mutina',{kind:'battle'});hp(d,'bononia');hp(d,'rome',{note:'前43年8月屋大维带八个军团进城，十九岁当上执政官。'});hp(d,'formiae',{kind:'battle',left:1});
    hr(d,[[44.65,10.92],[43.6,12.1],[42.3,12.6],[41.95,12.5]],HC.macedon);
   },[['dash',HC.rome,'山南高卢'],['dline',HC.macedon,'屋大维进军罗马'],['dot',HC.war,'战场与西塞罗遇害地']]),
  hs('前42—前36年','腓立比与分赃','后三头在腓立比击败布鲁图斯和卡西乌斯；三人分地盘，安东尼拿东方，屋大维管意大利和西方；前36年雷必达想吞西西里，兵却倒向屋大维。',[[33.2,-6.0],[47.6,40.0]],d=>{
    ha(d,'hGaulComata',HC.macedon,{fillOpacity:.14});ha(d,'hNarbonensis',HC.macedon,{fillOpacity:.14});ha(d,'romanItaly264',HC.macedon,{fillOpacity:.2});ha(d,'hHispania133',HC.macedon,{fillOpacity:.14});
    ha(d,'hGreekMainland',HC.athens,{fillOpacity:.16});ha(d,'hAntigonidCore',HC.athens,{fillOpacity:.16});ha(d,'hWestAnatolia',HC.athens,{fillOpacity:.16});ha(d,'hSeleucidSyria',HC.athens,{fillOpacity:.16});
    ha(d,'hAfrica146',HC.mino,{fillOpacity:.22});ha(d,'hNumidia',HC.mino,{fillOpacity:.12,dashArray:'5 4'});
    hp(d,'philippi',{kind:'battle',note:'前42年10月两战，卡西乌斯、布鲁图斯先后自尽。'});hp(d,'naulochus',{kind:'battle'});hp(d,'perusia',{kind:'battle',left:1});
   },[['fill',HC.macedon,'屋大维：意大利与西方'],['fill',HC.athens,'安东尼：东方'],['fill',HC.mino,'雷必达：阿非利加（前36年被夺）'],['dot',HC.war,'战场']]),
  hs('前34—前30年','阿克提乌姆','安东尼把东方领土分封给克娄巴特拉和她的孩子；屋大维公开他的遗嘱，罗马对埃及女王宣战；前31年阿克提乌姆海战，次年两人在亚历山大里亚自尽。',[[29.6,17.0],[42.4,36.6]],d=>{
    ha(d,'egypt',HC.mino,{fillOpacity:.3});ha(d,'hSeleucidSyria',HC.athens,{fillOpacity:.14,dashArray:'5 4'});ha(d,'hGreekMainland',HC.athens,{fillOpacity:.12,dashArray:'5 4'});
    hp(d,'actium',{kind:'battle'});hp(d,'alexandria',{kind:'battle',note:'前30年8月屋大维入城：安东尼伏剑，克娄巴特拉自尽，恺撒里昂被杀，埃及并入罗马。'});
    hr(d,[[38.94,20.77],[36.2,23.0],[31.2,29.92]],HC.mino);hr(d,[[39.1,20.4],[34.5,24.5],[31.25,29.7]],HC.macedon);
   },[['fill',HC.mino,'克娄巴特拉的埃及'],['dash',HC.athens,'安东尼的东方'],['dline',HC.mino,'前31年女王与安东尼退回埃及'],['dline',HC.macedon,'前30年屋大维追击'],['dot',HC.war,'战场']]),
  hs('前29—前27年','第一公民','屋大维三次凯旋、关上雅努斯神庙的门，裁军并出钱安置老兵；前27年把国家“交还”元老院和人民，换来“奥古斯都”的称号，自称第一公民。',[[34.4,-9.6],[50.8,40.6]],d=>{
    ha(d,'hHispania133',HC.rome,{fillOpacity:.22});ha(d,'hGaulComata',HC.rome,{fillOpacity:.22});ha(d,'hNarbonensis',HC.rome,{fillOpacity:.18});ha(d,'hSeleucidSyria',HC.rome,{fillOpacity:.22});ha(d,'egypt',HC.rome,{fillOpacity:.28});
    ha(d,'romanItaly264',HC.thebes,{fillOpacity:.16});ha(d,'hGreekMainland',HC.thebes,{fillOpacity:.14});ha(d,'hWestAnatolia',HC.thebes,{fillOpacity:.14});ha(d,'hAfrica146',HC.thebes,{fillOpacity:.16});
    hp(d,'rome',{note:'前27年1月13日屋大维在元老院宣布交还权力；三天后元老院授他“奥古斯都”称号。'});
   },[['fill',HC.rome,'奥古斯都亲管的带兵行省（概略）'],['fill',HC.thebes,'交给元老院的意大利与和平行省（概略）']])
 ]},
{id:'history-empire-principate',ch:5,title:'奥古斯都：一个人的共和',short:'奥古斯都时代',en:'Augustus and the Principate',period:'前27—公元14年',c:HC.rome,hideIslands:['rhodes'],hideBase:['adriatic'],
 scenes:[
  hs('前27—公元6年','大政奉还','“交还共和”是演戏：带兵的行省、埃及和钱袋都在他手里；粮、钱和竞技收买民众，退役金收买军队，账本交给自家的释奴。',[[29.0,-6.5],[46.6,37.0]],d=>{
    ha(d,'eEmpire14',HC.rome,{fillOpacity:.14});ha(d,'egypt',HC.mino,{fillOpacity:.34});
    ha(d,'hAfrica146',HC.thebes,{fillOpacity:.3});ha(d,'gAfricaNova',HC.thebes,{fillOpacity:.3});
    hp(d,'rome',{note:'前2年，城里领救济粮的平民二十多万人。'});hp(d,'puteoli',{left:1,note:'亚历山大里亚的运粮船队在此卸货，再转运罗马。'});
    hp(d,'alexandria',{note:'埃及由奥古斯都派的骑士长官治理，元老不经许可不得入境；它的粮食养活罗马城。'});hp(d,'carthage',{note:'阿非利加是罗马的另一个大粮仓。'});
    hr(d,[[31.3,29.9],[33.6,26.0],[35.0,22.5],[37.0,17.5],[38.25,15.62],[39.6,14.9],[40.7,14.15]],HC.mino);hr(d,[[37.0,10.4],[38.5,11.4],[40.5,11.8],[41.68,12.2]],HC.thebes);
   },[['fill',HC.rome,'奥古斯都身后的帝国（公元14年，概略）'],['fill',HC.mino,'埃及：归他私管，元老不得擅入'],['fill',HC.thebes,'阿非利加：另一个粮仓'],['dline',HC.mino,'运粮船队（概略）']]),
  hs('前27—公元23年','禁卫军','前27年起京城有了常驻的禁卫军：九个大队，双饷，骑士出身的长官统领，公元23年收进城边大营；二十五个军团都在边疆。',[[28.5,-10.5],[53.5,42.5]],d=>{
    ha(d,'eEmpire14',HC.rome,{fillOpacity:.14});
    hp(d,'rome',{note:'禁卫军九个大队、城市大队三个驻在京城；公元23年塞扬努斯把禁卫军收进城东北角的大营。'});
    hp(d,'ravenna',{note:'奥古斯都在此设亚得里亚海舰队。'});hp(d,'misenum',{note:'奥古斯都在此设第勒尼安海舰队。'});
    [['莱茵河：8个军团','Rhine: 8 legions',50.6,5.4],['西班牙：3个','Spain: 3',41.4,-5.0],['阿非利加：2个','Africa: 2',33.9,7.2],['埃及：2个','Egypt: 2',27.6,30.2],
     ['叙利亚：4个','Syria: 4',34.4,38.8],['潘诺尼亚：2个','Pannonia: 2',47.0,17.2],['达尔马提亚：2个','Dalmatia: 2',43.3,18.6],['默西亚：2个','Moesia: 2',43.4,25.2]]
     .forEach(([t,en,la,lo])=>hl(d,t,en,la,lo,HC.war));
   },[['fill',HC.rome,'帝国（公元23年，概略）'],['dot','#2a2018','京城与两处舰队基地'],['dot',HC.war,'红字：各地军团数（塔西佗记公元23年）']]),
  hs('前23—公元14年','接班人','外甥、女婿、两个外孙先后死去，只剩继子提比略；晚年他抬高元老院，压住接班人。公元9年丢了莱茵河以东，公元14年死在诺拉。',[[34.0,-1.5],[54.0,38.5]],d=>{
    ha(d,'eEmpire14',HC.rome,{fillOpacity:.14});ha(d,'eGermania9',HC.war,{fillOpacity:.18,dashArray:'5 4'});
    hp(d,'rome');hp(d,'nola',{note:'公元14年8月19日奥古斯都死在这里，和他父亲死在同一间屋子。'});
    hp(d,'massilia');hp(d,'rhodes',{left:1});hp(d,'limyra');hp(d,'teutoburg',{kind:'battle'});
   },[['fill',HC.rome,'帝国（公元14年，概略）'],['dash',HC.war,'公元9年后放弃的莱茵河—易北河之间'],['dot','#2a2018','接班人死去、隐居的地方'],['dot',HC.war,'条顿堡']])
 ]},
{id:'history-empire-julio-claudian',ch:5,title:'尤利乌斯—克劳狄王朝',short:'尤利乌斯—克劳狄王朝',en:'The Julio-Claudians',period:'14—68年',c:HC.rome,hideIslands:['capri','corsica'],
 scenes:[
  hs('14—26年','共和的花架子','提比略事事交元老院议，却让叛国罪放开了办，告密成风，元老院越来越谄媚；民望最高的侄子日耳曼尼库斯19年死在安条克。',[[33.5,-1.5],[54.0,40.0]],d=>{
    ha(d,'eEmpire14',HC.rome,{fillOpacity:.14});ha(d,'eGermania9',HC.war,{fillOpacity:.16,dashArray:'5 4'});
    hp(d,'rome',{note:'15年起，叛国罪案件在元老院里一桩接一桩。'});
    hp(d,'colonia',{note:'14年奥古斯都死讯传来，莱茵河军团在此哗变，日耳曼尼库斯把他们压了下去。'});
    hp(d,'teutoburg',{kind:'battle',note:'15年日耳曼尼库斯率军来到瓦卢斯战败的旧战场，收葬遗骨。'});
    hp(d,'antioch',{note:'19年日耳曼尼库斯病死在附近，临终说是叙利亚总督皮索毒害了他。'});
    hr(d,[[41.85,12.6],[40.6,17.9],[39.0,21.5],[37.5,26.5],[36.5,31.0],[36.25,36.0]],HC.macedon);
   },[['fill',HC.rome,'帝国（概略）'],['dash',HC.war,'日耳曼尼库斯14—16年征战的莱茵河以东'],['dline',HC.macedon,'17年他被调往东方（概略）']]),
  hs('26—37年','卡普里岛','提比略躲出罗马，长住卡普里岛，京城交给禁卫军长官塞扬努斯；31年新任禁卫军长官马克罗带信扳倒他；37年提比略死在米塞努姆，马克罗作废遗嘱，拥立卡利古拉。',[[40.3,11.9],[42.3,14.9]],d=>{
    ha(d,'gLatium',HC.rome,{fillOpacity:.16});ha(d,'gCampania',HC.rome,{fillOpacity:.12});
    hp(d,'rome',{kind:'battle',note:'31年10月18日，塞扬努斯在元老院被拿下，当天处死。'});
    hp(d,'capreae');hp(d,'misenum',{left:1,note:'37年3月16日提比略死在这里的别墅，传说是被马克罗闷死的。'});
    hr(d,[[41.85,12.6],[41.3,13.2],[40.95,13.85],[40.62,14.2]],HC.macedon);
   },[['fill',HC.rome,'拉丁姆与坎帕尼亚'],['dline',HC.macedon,'提比略离开罗马（26年起）'],['dot',HC.war,'塞扬努斯伏诛（31年）']]),
  hs('37—41年','卡利古拉','卡利古拉开头深得人心，一场大病后变了样：杀格梅卢斯、逼死扶他上台的马克罗，挥霍光提比略的积蓄，自称为神；41年1月被禁卫军军官刺死。',[[39.8,-0.5],[52.2,15.6]],d=>{
    hp(d,'rome',{kind:'battle',note:'41年1月24日，卡利古拉在帕拉丁山宫中的通道里被刺。'});
    hp(d,'puteoli',{left:1,note:'39年卡利古拉用商船从拜伊到这里连起一座五公里长的浮桥，骑马走了一趟。'});
    hp(d,'mogontiacum',{note:'39年卡利古拉北巡到此，处死了被指谋反的上日耳曼尼亚总督。'});
    hp(d,'gesoriacum');hp(d,'lugdunum',{note:'39—40年冬卡利古拉在此过冬，拍卖宫中旧物筹钱。'});
    hr(d,[[41.95,12.4],[44.4,9.0],[46.4,7.4],[48.6,7.8],[49.95,8.2]],HC.macedon);hr(d,[[50.0,8.0],[50.2,5.0],[50.6,1.9]],HC.macedon);
   },[['dline',HC.macedon,'39—40年北巡（概略）'],['dot','#2a2018','城市'],['dot',HC.war,'遇刺地']]),
  hs('41—54年','帘子后面的皇帝','禁卫军从帘子后面拥立克劳狄乌斯；他征服不列颠，在奥斯蒂亚挖新港，让长发高卢的贵族进元老院；54年吃了一盘蘑菇死去，继子尼禄接位。',[[35.6,-9.8],[55.8,15.6]],d=>{
    ha(d,'gBritannia',HC.rome,{fillOpacity:.28});ha(d,'hGaulComata',HC.thebes,{fillOpacity:.2});
    hp(d,'rome',{note:'41年禁卫军在宫中拥立克劳狄乌斯；54年10月13日他在宫中死去。'});
    hp(d,'ostia',{left:1,note:'克劳狄乌斯在北边另挖新港（后称波尔图斯），罗马的运粮船从此有了避风港。'});hp(d,'camulodunum');
    hp(d,'lugdunum',{note:'克劳狄乌斯生在这里；他48年替高卢贵族进元老院的演说刻在铜板上，1528年在此出土。'});
    hr(d,[[50.75,1.55],[51.1,1.4],[51.3,1.3],[51.6,1.0],[51.85,0.92]],HC.rome);
   },[['fill',HC.rome,'43年起征服的不列颠'],['fill',HC.thebes,'长发高卢：48年起贵族可进元老院'],['dline',HC.rome,'43年渡海']]),
  hs('54—68年','尼禄','尼禄头五年有塞涅卡和布鲁斯掌舵，后来毒死异母弟、杀母、杀妻；64年大火后修金宫；68年高卢、西班牙起兵，禁卫军倒戈，他自尽。',[[29.5,-9.8],[55.8,38.0]],d=>{
    ha(d,'eEmpire96',HC.rome,{fillOpacity:.1});ha(d,'gCeltae',HC.war,{fillOpacity:.14,dashArray:'5 4'});ha(d,'gIberia',HC.war,{fillOpacity:.14,dashArray:'5 4'});
    hp(d,'rome',{note:'64年7月大火烧了六天；68年6月尼禄在城外释奴的别墅里自尽。'});
    hp(d,'camulodunum',{kind:'battle',note:'60或61年布狄卡起义，焚毁此城。'});
    hp(d,'corinth',{note:'67年尼禄在此亲手挖下运河的第一筐土，工程随他一死而停。'});
    hp(d,'jerusalem',{kind:'battle',note:'66年犹太人起义，尼禄派韦斯巴芗去平定。'});
    hp(d,'cartnova',{note:'68年4月加尔巴在此宣布自己是“元老院和罗马人民的将军”，起兵反尼禄。'});
   },[['fill',HC.rome,'帝国（概略）'],['dash',HC.war,'68年起兵反尼禄的高卢与西班牙（概略）'],['dot',HC.war,'起义']])
 ]},
{id:'history-empire-flavian',ch:5,title:'四帝之年与弗拉维王朝',short:'四帝之年与弗拉维王朝',en:'The Year of Four Emperors and the Flavians',period:'68—96年',c:HC.rome,
 scenes:[
  hs('68—69年','四帝之年','加尔巴被禁卫军砍死，奥托、维特里乌斯相继败亡；东方军团拥立的韦斯巴芗笑到最后：皇帝可以不在罗马产生。',[[29.5,-1.0],[52.5,38.0]],d=>{
    ha(d,'eEmpire96',HC.rome,{fillOpacity:.1});
    hp(d,'rome',{kind:'battle',note:'69年1月加尔巴在广场被禁卫军砍死；12月韦斯巴芗的军队攻进罗马，卡比托利欧山上的朱庇特神庙在巷战中被焚。'});
    hp(d,'colonia');hp(d,'bedriacum',{kind:'battle'});hp(d,'alexandria',{note:'69年7月1日，埃及长官率军团拥立韦斯巴芗为帝。'});
    hp(d,'jerusalem',{note:'韦斯巴芗父子正在打犹太战争；70年提图斯攻陷耶路撒冷。'});
    hr(d,[[50.9,6.9],[48.5,7.6],[46.5,8.8],[45.5,10.0],[45.2,10.4]],HC.celt);hr(d,[[46.0,18.5],[45.9,15.0],[45.7,13.0],[45.2,10.6]],HC.athens);
   },[['dline',HC.celt,'莱茵河军团拥立维特里乌斯，南下意大利'],['dline',HC.athens,'多瑙河军团倒向韦斯巴芗'],['dot',HC.war,'战场']]),
  hs('69—96年','韦斯巴芗父子','出身平平的韦斯巴芗拿神迹、法律和斗兽场补足合法性；弗拉维王朝三个皇帝，止于图密善遇刺。',[[29.6,10.5],[43.6,37.6]],d=>{
    ha(d,'eEmpire96',HC.rome,{fillOpacity:.1});
    hp(d,'rome',{note:'大斗兽场修在尼禄金宫的人工湖上，80年开场，连办一百天竞技；96年图密善在宫中被刺。'});
    hp(d,'alexandria',{note:'69年，韦斯巴芗在此“治好”一个盲人和一个瘸子。'});
    hp(d,'jerusalem',{kind:'battle',note:'70年提图斯攻陷耶路撒冷，焚毁圣殿；战利品后来刻在罗马的提图斯凯旋门上。'});
    hp(d,'vesuvius',{left:1,note:'79年8月维苏威火山喷发，庞贝、赫库兰尼姆被埋。'});
   },[['fill',HC.rome,'帝国（概略）'],['dot',HC.war,'战场']])
 ]},
{id:'history-empire-antonine',ch:5,title:'五贤帝',short:'五贤帝',en:'The Five Good Emperors',period:'96—192年',c:HC.rome,
 scenes:[
  hs('96—98年','老元老涅尔瓦','图密善被刺，元老院推出无子的老元老涅尔瓦；禁卫军围宫逼他低头，他收养了统兵上日耳曼尼亚的图拉真。',[[40.5,2.5],[53.0,17.5]],d=>{
    ha(d,'eEmpire96',HC.rome,{fillOpacity:.14});
    hp(d,'rome',{note:'96年9月18日图密善在宫中被刺，元老院当天推涅尔瓦为帝；97年禁卫军围宫。'});
    hp(d,'mogontiacum',{note:'上日耳曼尼亚的军团大营；97年图拉真以这里的总督身份被收养。'});
    hp(d,'colonia',{note:'98年1月，涅尔瓦的死讯传到这里，图拉真在莱茵河边接位。'});
   },[['fill',HC.rome,'96年的帝国（概略）'],['dot','#2a2018','涅尔瓦与图拉真所在']]),
  hs('98—117年','最好的元首','图拉真征服达契亚、东征安息，117年版图最大；东方新省四处起事，犹太人暴动，他死后东方新省全部放弃。',[[22.5,-10.5],[56.5,50.5]],d=>{
    ha(d,'romanEmpire',HC.rome,{fillOpacity:.2});ha(d,'trajanEast',HC.war,{fillOpacity:.26,dashArray:'5 4'});
    ha(d,'gCyrenaica',HC.war,{fillOpacity:.32});ha(d,'gCyprus',HC.war,{fillOpacity:.38});
    hp(d,'rome',{note:'图拉真广场和记功柱，用达契亚战争的战利品修成。'});hp(d,'italica');
    hp(d,'sarmizegetusa',{kind:'battle'});hp(d,'ctesiphon',{kind:'battle'});hp(d,'selinus',{left:1});
    hl(d,'116年：打到波斯湾','Trajan at the Gulf, 116',29.2,48.9,HC.war);
   },[['fill',HC.rome,'117年的帝国'],['dash',HC.war,'图拉真东扩（114—117），哈德良放弃'],['fill',HC.war,'115—117年犹太人起事（昔兰尼加、塞浦路斯；埃及未画出）'],['dot',HC.war,'图拉真攻下的两座都城']]),
  hs('117—138年','小希腊人','哈德良放弃东方新省、修长城收紧边界；他重修万神殿、入希腊秘仪、把宠儿封神；在耶路撒冷建罗马城，逼出巴尔·科赫巴起义。',[[24.5,-8.0],[56.5,40.0]],d=>{
    ha(d,'romanEmpire',HC.rome,{fillOpacity:.16});
    d.line(HADRIAN,{color:'#2a2018',weight:4,opacity:.9});
    hp(d,'rome',{note:'重修万神殿，自己设计维纳斯与罗马神庙；城东的提布尔修了一座占地上百公顷的别墅；死后葬在台伯河边的陵墓，今圣天使堡。'});
    hp(d,'athens',{note:'他入了附近厄琉息斯秘仪的最高一级，在雅典修成奥林匹亚宙斯神庙。'});
    hp(d,'jerusalem',{kind:'battle',note:'130年前后在此建埃利亚·卡皮托利纳城、立朱庇特庙；132—135年巴尔·科赫巴起义。'});
    hp(d,'antinoopolis');hp(d,'italica');
   },[['fill',HC.rome,'帝国（放弃东方新省后）'],['line','#2a2018','哈德良长城（122年起）'],['dot',HC.war,'巴尔·科赫巴起义']]),
  hs('138—161年','庇护','安东尼在位二十三年没离开过意大利；在苏格兰往北推了一道草皮长城，二十来年后又放弃。',[[41.0,-9.0],[58.2,15.5]],d=>{
    ha(d,'romanEmpire',HC.rome,{fillOpacity:.14});
    d.line(HADRIAN,{color:'#2a2018',weight:4,opacity:.9});d.line([[55.927,-4.453],[55.92,-4.33],[55.94,-4.15],[55.955,-4.04],[55.999,-3.79],[56.0,-3.56]],{color:HC.macedon,weight:4,opacity:.9});
    hp(d,'rome',{note:'安东尼在位二十三年，没离开过意大利。'});hp(d,'nemausus',{left:1});
   },[['fill',HC.rome,'帝国'],['line','#2a2018','哈德良长城'],['line',HC.macedon,'安东尼长城（142年起，二十来年后放弃）']]),
  hs('161—180年','哲学家皇帝','瘟疫横扫帝国，马科曼尼战争打了十几年；马可雇日耳曼人打日耳曼人、把降服的蛮族安置进帝国，177年立亲生儿子康茂德为共治皇帝。',[[31.0,8.5],[51.0,46.0]],d=>{
    ha(d,'romanEmpire',HC.rome,{fillOpacity:.12});
    hp(d,'carnuntum');hp(d,'aquileia',{kind:'battle'});hp(d,'seleucia',{note:'165年罗马军攻破此城，瘟疫据说随回师的大军传开。'});
    hp(d,'rome');hp(d,'ravenna',{note:'马可安置的一批蛮族在此起事，占了城；此后蛮族一律迁出意大利。'});
    hr(d,[[33.1,44.4],[35.5,40.5],[36.2,36.4],[37.4,30.0],[39.4,24.0],[41.0,18.4],[41.8,12.9]],HC.war);
    hl(d,'马科曼尼人','Marcomanni',49.5,14.6,HC.war);hl(d,'夸迪人','Quadi',49.0,18.6,HC.war);
   },[['fill',HC.rome,'帝国'],['dline',HC.war,'瘟疫随东征大军西传（概略）'],['dot',HC.war,'被围的阿奎莱亚']]),
  hs('180—192年','角斗士皇帝','康茂德是个没什么政治野心的大力士：同马科曼尼人议和、回京不再出征，朝政交给宠臣；192年最后一夜被身边人勒死。',[[36.0,-6.5],[56.0,24.5]],d=>{
    ha(d,'romanEmpire',HC.rome,{fillOpacity:.12});
    hp(d,'carnuntum',{note:'180年马可死后，康茂德在多瑙河前线同马科曼尼人、夸迪人议和，回了罗马。'});
    hp(d,'londinium',{note:'185年，不列颠军团派一千五百名投枪兵进京，告禁卫军长官佩伦尼斯谋反。'});
    hp(d,'rome',{kind:'battle',note:'190年粮荒，民众围宫，康茂德杀了克林德；192年最后一夜，他在宫中浴室被勒死。'});
    hr(d,[[48.11,16.86],[46.2,14.8],[45.6,12.6],[43.8,12.6],[42.1,12.5]],HC.macedon);
    hr(d,[[51.51,-0.09],[50.7,1.6],[47.3,5.0],[45.07,7.68],[43.9,10.5],[42.2,12.3]],HC.war);
    hl(d,'马科曼尼人','Marcomanni',49.5,14.6,HC.war);hl(d,'夸迪人','Quadi',49.0,18.6,HC.war);
   },[['fill',HC.rome,'帝国'],['dline',HC.macedon,'180年议和回京'],['dline',HC.war,'185年不列颠来的一千五百人（概略）'],['dot',HC.war,'192年最后一夜']]),
  hs('96—192年','另一本账','吉本眼里人类最幸福的八十多年；另一本账上是亏本的扩张、被冲淡的本地宗教、进了军队的日耳曼人、坏了的规矩。',[[22.5,-10.5],[57.5,50.5]],d=>{
    ha(d,'romanEmpire',HC.rome,{fillOpacity:.14});ha(d,'trajanEast',HC.war,{fillOpacity:.22,dashArray:'5 4'});
    d.line([[55.927,-4.453],[55.92,-4.33],[55.94,-4.15],[55.955,-4.04],[55.999,-3.79],[56.0,-3.56]],{color:HC.macedon,weight:4,opacity:.9});
    hp(d,'sarmizegetusa',{note:'达契亚：金矿开到马可时代，270年代被奥勒良放弃。'});
    hp(d,'jerusalem',{kind:'battle',note:'132—135年巴尔·科赫巴战争。'});
    hp(d,'carnuntum',{note:'166年起马科曼尼战争的前线。'});
    hp(d,'seleucia',{note:'165年瘟疫据说从这里随回师的大军西传。'});
    hp(d,'ravenna',{note:'马可安置的蛮族在此起事。'});
    hl(d,'马科曼尼等部落联盟','Marcomannic coalition',49.7,15.2,HC.war);
   },[['fill',HC.rome,'帝国（117年）'],['dash',HC.war,'图拉真打下、哈德良放弃'],['line',HC.macedon,'安东尼长城（筑而复弃）'],['dot','#2a2018','账上的窟窿']]),
  hs('96—193年','为什么都是收养的','二十八个军团分驻几大块，每块的统帅都可能被拥立；收养维系着军头之间的平衡，传给亲儿子就打破了它。',[[24.0,-9.0],[57.0,46.0]],d=>{
    ha(d,'romanEmpire',HC.rome,{fillOpacity:.1});
    hp(d,'mogontiacum',{note:'97年，上日耳曼尼亚总督图拉真被收养。'});
    hp(d,'antioch',{note:'117年叙利亚总督哈德良接位；175年叙利亚总督卡西乌斯称帝；193年叙利亚总督尼格尔称帝。'});
    hp(d,'carnuntum',{note:'193年上潘诺尼亚总督塞维鲁称帝。'});
    hp(d,'londinium',{note:'193年不列颠总督阿尔比努斯称帝。'});hp(d,'rome');
    [['不列颠：3个军团','Britain: 3 legions',53.6,-3.6],['莱茵河：4个军团','Rhine: 4 legions',52.6,9.8],['多瑙河：10个军团','Danube: 10 legions',45.4,25.2],
     ['东方：8个军团','East: 8 legions',37.6,41.5],['埃及：1个','Egypt: 1',26.0,31.0],['北非：1个','Africa: 1',33.2,6.0],['西班牙：1个','Spain: 1',39.6,-4.6]].forEach(([t,en,la,lo])=>hl(d,t,en,la,lo,HC.rome));
   },[['fill',HC.rome,'帝国（军团数为二世纪中叶的约数）'],['dot','#2a2018','收养与称帝的军头驻地']])
 ]},
{id:'history-empire-crisis',ch:5,title:'军营元首时期：百年七十帝',short:'军营元首时期',en:'The Barracks Emperors: Seventy in a Century',period:'193—284年',c:HC.rome,hideIslands:['cyprus'],hideBase:['zagros'],
 scenes:[
  hs('193—197年','秩序崩溃','康茂德死后秩序崩溃：禁卫军杀了佩蒂纳克斯、拍卖皇位，三个边疆总督各被拥立，塞维鲁抢先进京，四年重归一统；此后不到一百年，称帝的有七十来个。',[[30.4,-6.5],[56.2,39.5]],d=>{
    ha(d,'romanEmpire',HC.rome,{fillOpacity:.1});
    hp(d,'rome',{kind:'battle',note:'193年3月禁卫军在营墙上拍卖皇位；6月元老院倒向塞维鲁，判尤利安努斯死刑。'});hp(d,'carnuntum');
    hp(d,'issus',{kind:'battle',left:1,note:'194年塞维鲁在此打败叙利亚总督尼格尔。'});hp(d,'lugdunum',{kind:'battle',note:'197年2月塞维鲁在此打败不列颠总督阿尔比努斯，城被洗劫。'});
    hr(d,[[48.11,16.86],[46.2,14.8],[45.6,12.6],[43.8,12.6],[42.1,12.5]],HC.macedon);
    hl(d,'尼格尔：叙利亚军团','Niger: the Syrian legions',35.0,38.3,HC.war);hl(d,'阿尔比努斯：不列颠军团','Albinus: the British legions',51.0,-2.0,HC.war);
   },[['fill',HC.rome,'帝国'],['dline',HC.macedon,'193年塞维鲁从卡农图姆进军罗马'],['dot',HC.war,'进京与内战的战场']]),
  hs('193—235年','塞维鲁王朝','塞维鲁靠军队起家，临终嘱咐“让士兵发财”；卡拉卡拉杀弟；太阳神祭司埃拉伽巴路斯想拿外来大神统摄罗马众神；235年士兵杀了末代的塞维鲁·亚历山大。',[[29.5,-6.5],[56.2,46.5]],d=>{
    ha(d,'romanEmpire',HC.rome,{fillOpacity:.1});
    hp(d,'rome',{note:'禁卫军改从各军团挑人；城外阿尔巴山驻下第二帕提卡军团，离城约二十公里。'});
    hp(d,'ctesiphon',{kind:'battle',note:'197—198年之交塞维鲁攻下安息都城泰西封，纵兵劫掠，掳走十万人。'});
    hp(d,'leptis',{note:'塞维鲁和禁卫军长官普劳蒂亚努斯的家乡；塞维鲁当皇帝后在这里大兴土木。'});
    hp(d,'eboracum',{note:'208年塞维鲁带两个儿子来不列颠打仗，211年2月4日死在这里。'});
    hp(d,'emesa',{note:'218年，这里的太阳神世袭祭司埃拉伽巴路斯被推上皇位；他把太阳神的黑石运进罗马。'});
    hp(d,'mogontiacum',{kind:'battle',note:'235年3月，塞维鲁·亚历山大和母亲在这附近被士兵杀死，塞维鲁王朝亡。'});
    hr(d,[[41.9,12.5],[44.4,8.9],[45.76,4.83],[48.85,2.35],[50.73,1.6],[53.96,-1.08]],HC.macedon);
   },[['fill',HC.rome,'帝国'],['dline',HC.macedon,'208年北上不列颠（概略）'],['dot',HC.war,'攻下的安息都城与王朝的终点'],['dot','#2a2018','塞维鲁一家的城市']]),
  hs('211—217年','卡拉卡拉与公民权','卡拉卡拉杀弟，212年让帝国境内的自由人都成了罗马公民；215年在亚历山大里亚屠城，217年被刺。',[[22.0,-10.0],[56.0,45.5]],d=>{
    ha(d,'romanEmpire',HC.rome,{fillOpacity:.24});
    hp(d,'rome',{note:'211年12月盖塔在宫中被杀；216年卡拉卡拉浴场落成。'});
    hp(d,'alexandria',{kind:'battle',note:'215年卡拉卡拉在此纵兵屠城，起因是市民编段子挖苦他杀弟。'});
    hp(d,'carrhae',{kind:'battle',note:'217年4月，卡拉卡拉在附近下马方便时被刺。'});
   },[['fill',HC.rome,'212年起：帝国境内的自由人都是罗马公民'],['dot',HC.war,'屠城与遇刺之地']]),
  hs('235—284年','军头混战与共治','王朝亡后皇帝靠军权由前线拥立，不再常驻罗马；为应付东西两线外敌，常由两帝共治；260年裂成三块，奥勒良打回统一。',[[22.5,-11.0],[57.5,46.0]],d=>{
    ha(d,'eGallic271',HC.celt,{fillOpacity:.3});ha(d,'ePalmyra271',HC.mino,{fillOpacity:.32});ha(d,'eCentral271',HC.rome,{fillOpacity:.2});
    hp(d,'treveri');hp(d,'palmyra');
    hp(d,'mediolanum',{kind:'battle',note:'268年伽利埃努斯在此围攻叛将，被自己的将领合谋杀死；他组建的机动骑兵也驻在这里。'});
    hp(d,'rome',{note:'271年起修奥勒良城墙，长约十九公里；274年在城里为无敌太阳神立庙。'});hp(d,'nicomedeia',{note:'284年11月，戴克里先在此附近被东方军团拥立。'});
   },[['fill',HC.celt,'高卢帝国（260—274）'],['fill',HC.mino,'帕尔米拉（芝诺比娅，约271年）'],['fill',HC.rome,'中间一块'],['dot',HC.war,'战场与皇帝的死地']]),
  hs('224—260年','东、北两面','东边萨珊崛起，北边日耳曼人结成大联盟；长城把边境钉成一条线，缓冲地带没了，两位皇帝死在外敌手里。',[[28.5,-6.0],[56.5,57.0]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.12});ha(d,'hParthiaWest',HC.parthia,{fillOpacity:.22});ha(d,'iranPlateau',HC.parthia,{fillOpacity:.14});
    d.line(HADRIAN,{color:'#2a2018',weight:4,opacity:.9});
    hp(d,'abritus',{kind:'battle',left:1});hp(d,'edessa',{kind:'battle'});
    hp(d,'ctesiphon',{note:'从图拉真起，罗马三次攻破这座安息都城：116、165、198年。'});
    hp(d,'sarmizegetusa',{note:'达契亚行省（106年至270年代）把罗马推到喀尔巴阡山外。'});
    hr(d,[[46.5,30.0],[45.0,28.6],[43.8,27.2]],HC.war);hr(d,[[49.6,9.8],[48.3,9.6],[46.9,9.9]],HC.war);hr(d,[[52.0,6.6],[50.6,4.6],[49.2,3.4]],HC.war);
    hl(d,'哥特人（238年起渡多瑙河）','Goths',47.4,30.8,HC.war);hl(d,'阿勒曼尼人（213年起）','Alamanni',50.3,12.6,HC.war);
    hl(d,'法兰克人（250年代起）','Franks',53.1,5.4,HC.war);hl(d,'萨珊波斯','Sasanian Persia',35.0,51.5,HC.parthia);
   },[['fill',HC.rome,'帝国（概略）'],['fill',HC.parthia,'萨珊波斯'],['dline',HC.war,'北方各族南下（概略）'],['line','#2a2018','哈德良长城'],['dot',HC.war,'两位皇帝的败亡之地']]),
  hs('50—476年','内附与五胡','同时期的中国从接纳胡人内附走到五胡乱华；罗马从安置降服的蛮族走到日耳曼各族入侵。中国衣冠南渡，罗马衣冠东渡。',[[33.5,-8.0],[54.5,34.0]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.12});
    hp(d,'ravenna',{note:'马可安置的蛮族在此起事，占了城；此后蛮族一律迁出意大利。'});
    hp(d,'constantinople',{note:'衣冠东渡：330年起，罗马的重心移到这里。'});hp(d,'rome');
    hl(d,'170年代：马可安置降服的蛮族','Marcus settles barbarians, 170s',47.6,21.0,HC.war);
    hl(d,'约280年：十万巴斯塔奈人落户色雷斯','Bastarnae settled in Thrace, c. 280',43.4,24.5,HC.war);hl(d,'382年：哥特人整族落户','Goths settled as allies, 382',41.4,22.0,HC.war);
    hr(d,[[50.0,8.0],[48.0,3.5],[44.0,0.0],[41.0,-3.5]],HC.war);
   },[['fill',HC.rome,'帝国（概略）'],['dot','#2a2018','蛮族内附与衣冠东渡'],['dline',HC.war,'五世纪的入侵（概略）']])
 ]},
{id:'history-empire-dominate',ch:5,title:'戴克里先：四帝共治',short:'戴克里先：四帝共治',en:'Diocletian and the Tetrarchy',period:'284—305年',c:HC.rome,
 scenes:[
  hs('284—293年','主上与两帝共治','戴克里先把自己变成受人跪拜的“主上”；286年立老战友马克西米安为共治的正皇帝，分驻尼科米底亚与米兰，罗马退居旧都。',[[33.5,-3.0],[50.5,34.5]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.14});
    hp(d,'nicomedeia',{note:'284年戴克里先在此附近被拥立，后来以此为驻地。'});hp(d,'mediolanum',{note:'马克西米安在西部的驻地。'});
    hp(d,'salona',{left:1,note:'戴克里先生在这一带，退位后又回到这里。'});
    hp(d,'rome',{note:'罗马成了不住皇帝的旧都；303年戴克里先来过一次，办在位二十年的庆典。'});
   },[['fill',HC.rome,'帝国（约300年，概略）'],['dot','#2a2018','两位正皇帝的驻地与戴克里先的家乡']]),
  hs('293—305年','四帝共治','延续三世纪共治传统与五贤帝收养禅让的记忆，两正两副四位皇帝分守四方防线，四座驻地都不在罗马。',[[33.5,-6.0],[55.5,40.5]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.16});
    hp(d,'nicomedeia',{note:'正皇帝戴克里先的驻地，管东方。'});hp(d,'sirmium',{note:'副皇帝伽列里乌斯的驻地，管多瑙河一线。'});
    hp(d,'mediolanum',{note:'正皇帝马克西米安的驻地，管意大利、非洲和西班牙。'});hp(d,'treveri',{note:'副皇帝君士坦提乌斯的驻地，管高卢和不列颠。'});
    [['戴克里先 · 东方','Diocletian: the East',36.0,37.5],['伽列里乌斯 · 多瑙河','Galerius: the Danube',43.0,24.5],['马克西米安 · 意大利与非洲','Maximian: Italy and Africa',35.0,11.0],['君士坦提乌斯 · 高卢与不列颠','Constantius: Gaul and Britain',45.2,0.3]].forEach(([t,en,la,lo])=>hl(d,t,en,la,lo,HC.rome));
   },[['fill',HC.rome,'帝国（约300年，概略）'],['dot','#2a2018','四位皇帝的驻地']]),
  hs('294—305年','集权、重税与限价','从地方自治转向中央集权，细分行省、加派官吏，财政支出剧增；意大利首交地税，地方活力被重税压垮；301年限价，303年大迫害。',[[33.5,-3.0],[50.5,40.5]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.12});ha(d,'italyModern',HC.war,{fillOpacity:.22});
    hp(d,'nicomedeia',{kind:'battle',note:'303年2月23日，宫里望得见的大教堂被拆平，大迫害从这里开始；305年5月1日戴克里先在城外退位。'});
    hp(d,'mediolanum',{note:'305年5月1日，马克西米安在此同日退位。'});
    hp(d,'salona',{note:'戴克里先退位后回到这里的海边宫殿，即今斯普利特老城。'});
    hl(d,'意大利：头一回交地税','Italy taxed',40.7,15.9,HC.war);
   },[['fill',HC.rome,'帝国（约300年，概略）'],['fill',HC.war,'意大利本土：四百多年来头一回交地税'],['dot',HC.war,'大迫害从尼科米底亚开始'],['dot','#2a2018','两位正皇帝退位之地']])
 ]},
{id:'history-empire-constantine',ch:5,title:'君士坦丁：儿子、上帝与新都',short:'君士坦丁王朝',en:'Constantine: Sons, God and a New Rome',period:'305—363年',c:HC.rome,
 scenes:[
  hs('305—306年','儿子与女婿','305年戴克里先退位，两位皇子都被撇开；306年君士坦丁在埃波拉库姆被父亲的军队拥立，三个月后禁卫军在罗马拥立马克森提乌斯。',[[36.5,-6.5],[56.2,34.0]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.08});ha(d,'eConst306',HC.rome,{fillOpacity:.26});ha(d,'eMaxent306',HC.mino,{fillOpacity:.2});
    hr(d,[[40.77,29.92],[41.68,26.56],[42.70,23.32],[43.32,21.90],[44.97,19.61],[46.4,16.0],[47.8,13.0],[48.37,10.9],[49.0,8.4],[49.75,6.64],[50.73,1.6],[51.3,1.2],[52.6,0.1],[53.96,-1.08]],HC.macedon);
    hp(d,'nicomedeia',{note:'305年5月1日，戴克里先在城外退位；306年初，君士坦丁趁伽列里乌斯睡下，连夜从这里出逃。'});
    hp(d,'gesoriacum',{note:'君士坦丁在这里追上父亲，随他渡海去不列颠。今布洛涅。'});
    hp(d,'eboracum',{note:'306年7月25日君士坦提乌斯死在这里，军队当场拥立君士坦丁。今约克。'});
    hp(d,'rome',{note:'306年10月28日，禁卫军和罗马民众拥立马克森提乌斯。'});
   },[['fill',HC.rome,'君士坦丁的地盘（306—312，概略）'],['fill',HC.mino,'马克森提乌斯的地盘（概略）'],['dline',HC.macedon,'306年君士坦丁出逃（概略）'],['dot','#2a2018','退位、出逃与两处拥立']]),
  hs('307—324年','从六帝到一帝','岳父、女婿、父子你争我夺，308年一度六人称帝；312年米尔维安桥一战，禁卫军被解散；324年打败李锡尼，帝国重归一人。',[[33.0,-6.5],[52.0,32.0]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.08});ha(d,'eConst306',HC.rome,{fillOpacity:.22});ha(d,'eMaxent306',HC.mino,{fillOpacity:.18});
    hp(d,'treveri',{note:'君士坦丁早年的驻地；312年他从这里出兵。'});
    hp(d,'arelate',{left:1,note:'310年马克西米安趁女婿北上，在此又穿上紫袍，兵败被擒，不久自缢。'});
    hp(d,'rome',{kind:'battle',note:'312年10月28日米尔维安桥之战，马克森提乌斯落水淹死；禁卫军随后被解散，大营的围墙拆掉。'});
    hp(d,'mediolanum',{note:'313年初，君士坦丁和李锡尼在此议定宽容基督教。'});
    hp(d,'adrianople',{kind:'battle',note:'324年7月3日君士坦丁在此大败李锡尼。'});
    hp(d,'byzantium',{kind:'battle',note:'李锡尼退守拜占庭；324年9月在海峡对岸的克里索波利斯再败，随后投降。六年后这里成了新都君士坦丁堡。'});
    hr(d,[[49.75,6.64],[47.3,5.4],[45.6,6.6],[45.07,7.69],[45.44,10.99],[44.2,12.0],[42.1,12.45]],HC.macedon);
    hr(d,[[40.64,22.94],[40.9,24.4],[41.0,25.8],[41.6,26.5]],HC.macedon);
   },[['fill',HC.rome,'君士坦丁（306—312）'],['fill',HC.mino,'马克森提乌斯'],['dline',HC.macedon,'312年进军罗马、324年东进（概略）'],['dot',HC.war,'决战之地']]),
  hs('312—337年','受命于神','君士坦丁押的是少数派：给教会钱和特权，召集尼西亚大公会议、拍板信经；合法性从军营和广场挪到了天上。',[[28.5,-7.5],[50.5,42.5]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.1});ha(d,'eChrist300',HC.mino,{fillOpacity:.3,weight:.8});
    hp(d,'rome',{note:'拉特兰大教堂建在被解散的近卫骑兵营房上。'});
    hp(d,'nicaea',{left:1,note:'325年第一次大公会议在此召开，皇帝亲自出场。'});
    hp(d,'nicomedeia',{note:'337年5月，君士坦丁在城郊临终受洗。'});
   },[['fill',HC.rome,'帝国'],['fill',HC.mino,'基督徒较多的地方（约300年，概略）'],['dot','#2a2018','君士坦丁与教会']]),
  hs('324—330年','新罗马','先在特洛伊故地动工，又改到拜占庭；330年5月11日新都落成，埃及的粮船改驶新都。',[[29.5,17.5],[46.8,42.5]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.12});
    hp(d,'constantinople',{left:1,note:'324年君士坦丁划定新城界，330年5月11日落成；此后一千一百多年一直是都城。'});
    hp(d,'ilium',{left:1,note:'君士坦丁先在特洛伊故地动工，城门没修完就改了主意；一百年后，过海峡的船上还望得见那座城门。'});
    hp(d,'serdica',{note:'迁都前君士坦丁常住这里。今索非亚。'});
    hp(d,'nicomedeia',{note:'戴克里先的都城，就在新都东南。'});
    hp(d,'alexandria',{note:'332年起，埃及的粮船不再去罗马，改驶新都。'});
    hr(d,[[31.25,29.9],[33.4,28.3],[35.7,27.2],[37.6,26.4],[39.4,25.9],[40.1,26.3],[40.5,26.8],[40.9,28.4],[41.0,28.95]],HC.mino,{width:3.2});
    hl(d,'多瑙河防线','Danube frontier',44.5,24.6,HC.war);hl(d,'幼发拉底河防线','Euphrates frontier',36.4,39.9,HC.war);
   },[['fill',HC.rome,'帝国'],['dline',HC.mino,'埃及的粮船改驶新都（概略）'],['dot','#2a2018','新都与它的几个备选']]),
  hs('326—363年','身后','326年杀子杀妻；晚年把天下分给三子两侄；337年临终受洗后去世，军队杀尽旁支；诸子相残，尤利安想请回旧神，363年死在波斯。',[[29.0,-8.5],[56.0,47.0]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.12});
    hp(d,'pola',{note:'326年长子克里斯普斯在此被处死。'});
    hp(d,'nicomedeia',{note:'337年5月，君士坦丁在城郊临终受洗，22日去世。'});
    hp(d,'constantinople',{left:1,note:'葬在圣使徒教堂；337年夏，军队在此杀尽他的异母兄弟和侄子。'});
    hp(d,'lutetia',{note:'360年高卢军团在此拥立尤利安。'});hp(d,'ctesiphon',{kind:'battle',note:'363年尤利安兵临城下，没能攻下，回师途中中矛身亡。'});
    [['君士坦丁二世 · 阿尔卑斯以西','Constantine II',47.0,1.0],['君士坦斯 · 意大利、阿非利加','Constans',35.0,8.0],
     ['达尔马提乌斯 · 色雷斯、希腊','Dalmatius',42.0,24.2],['君士坦提乌斯二世 · 东方','Constantius II',34.0,38.6],
     ['汉尼拔良 · 亚美尼亚','Hannibalianus',39.7,42.3]].forEach(([t,en,la,lo])=>hl(d,t,en,la,lo,HC.rome));
   },[['fill',HC.rome,'帝国'],['dot','#2a2018','家事与身后'],['dot',HC.war,'尤利安的死地']])
 ]},
{id:'history-empire-theodosius',ch:5,title:'狄奥多西：国教与分治',short:'瓦伦提尼安与狄奥多西',en:'Theodosius: One Faith, Two Halves',period:'364—395年',c:HC.rome,
 scenes:[
  hs('364—376年','匈人压境','匈人西来，压垮黑海北岸的哥特人；哥特人求渡多瑙河，瓦伦斯照以夷制夷的老套路收容，想多一批兵打波斯。',[[35.0,19.0],[50.0,46.5]],d=>{
    ha(d,'eEast395',HC.athens,{fillOpacity:.18});
    hp(d,'durostorum',{note:'376年哥特人在这一段求渡，坐船、扎筏、划独木舟，渡了好几天几夜。'});
    hp(d,'antioch',{note:'瓦伦斯这时坐镇安条克，正跟波斯争亚美尼亚。'});hp(d,'constantinople');
    hr(d,[[48.6,46.0],[47.9,40.5],[47.2,35.5],[46.7,31.0]],HC.war);hr(d,[[46.3,29.6],[45.3,28.3],[44.4,27.4]],HC.celt);
    hl(d,'匈人','Huns',48.9,38.2,HC.war);hl(d,'哥特人','Goths',47.4,27.6,HC.celt);hl(d,'亚美尼亚：罗马与波斯相争','Armenia, contested',39.8,44.6,HC.athens);
   },[['fill',HC.athens,'帝国东部（瓦伦斯）'],['dline',HC.war,'匈人西进（概略）'],['dline',HC.celt,'376年哥特人渡河'],['dot','#2a2018','渡河处与瓦伦斯的驻地']]),
  hs('376—377年','收不住','人太多、来得太急，又没先打服、拆散；将领倒卖口粮，哥特人在马尔西亚诺波利斯反了，逃奴和矿工带路，在色雷斯四处抢掠。',[[40.4,22.0],[46.0,30.5]],d=>{
    ha(d,'eEast395',HC.athens,{fillOpacity:.14});
    hp(d,'durostorum');hp(d,'marcianopolis',{kind:'battle'});hp(d,'adrianople',{left:1});hp(d,'constantinople');
    hr(d,[[44.0,27.3],[43.35,27.45],[42.75,26.75],[42.25,25.5],[41.95,24.4]],HC.celt);
    hl(d,'色雷斯','Thrace',42.55,24.15,HC.war);
   },[['fill',HC.athens,'帝国东部'],['dline',HC.celt,'哥特人南下抢掠（概略）'],['dot',HC.war,'起事之地'],['dot','#2a2018','渡河处与城市']]),
  hs('378年','阿德里安堡','瓦伦提尼安375年已气死，西部归儿子格拉提安；瓦伦斯不等侄子会师，抢先开战，兵败身死，东部野战军只逃出三分之一。',[[40.2,13.5],[48.8,30.0]],d=>{
    ha(d,'eWest395',HC.rome,{fillOpacity:.1});ha(d,'eEast395',HC.athens,{fillOpacity:.14});
    hp(d,'brigetio',{left:1});hp(d,'adrianople',{kind:'battle',note:'378年8月9日，瓦伦斯在此战死，东部野战军只逃出三分之一。'});
    hp(d,'constantinople',{note:'378年5月瓦伦斯从安条克赶到这里，再北上阿德里安堡。'});
    hr(d,[[48.2,14.3],[47.9,17.0],[45.0,19.6],[43.9,22.5]],HC.rome);hr(d,[[41.01,28.98],[41.4,27.7],[41.62,26.75]],HC.athens);
   },[['fill',HC.rome,'西部（格拉提安，概略）'],['fill',HC.athens,'东部（瓦伦斯，概略）'],['dline',HC.rome,'格拉提安东来，没等到会师'],['dline',HC.athens,'瓦伦斯出兵'],['dot',HC.war,'阿德里安堡'],['dot','#2a2018','375年瓦伦提尼安死处与新都']]),
  hs('379—382年','国中之国','狄奥多西从西班牙被请回来，也打不赢；382年哥特人以同盟者身份落户色雷斯，自带首领，不归罗马官员管；东边跟波斯瓜分亚美尼亚。',[[36.5,18.5],[47.5,46.5]],d=>{
    ha(d,'eEast395',HC.athens,{fillOpacity:.2});
    hp(d,'sirmium',{note:'379年1月19日狄奥多西在此称帝。'});
    hp(d,'thessalonica',{note:'狄奥多西的大本营；380年他在马其顿被夜袭，险些被擒，秋天病重受洗。'});
    hp(d,'constantinople',{note:'380年11月狄奥多西进驻；382年10月3日与哥特人议和。'});
    hl(d,'382年：哥特人落户（概略）','Goths settled as allies, 382',43.3,24.6,HC.celt);
    hl(d,'亚美尼亚：与波斯瓜分','Armenia partitioned, 384/387',39.8,44.0,HC.athens);
   },[['fill',HC.athens,'帝国东部（狄奥多西）'],['dot','#2a2018','称帝、大本营与议和之地']]),
  hs('380—394年','圣火熄灭','国教诏书、胜利女神祭坛、帖撒罗尼迦屠城与悔罪、禁绝献祭、冷河之战；维斯塔圣火熄灭。',[[38.0,2.5],[48.3,25.0]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.1});
    hp(d,'rome',{note:'维斯塔神庙在广场东头；382年胜利女神祭坛搬出元老院，393年又搬回来；394年前后圣火熄灭，贞女解散。'});
    hp(d,'mediolanum',{note:'390年狄奥多西在此向主教安布罗斯悔罪。'});
    hp(d,'thessalonica',{left:1,note:'380年2月狄奥多西在此颁诏；390年在此屠城。'});
    hp(d,'vienne',{left:1});hp(d,'frigidus',{kind:'battle'});
   },[['fill',HC.rome,'帝国（概略）'],['dot',HC.war,'冷河之战'],['dot','#2a2018','诏书、悔罪、圣火与吊死的皇帝']]),
  hs('395年','分治','狄奥多西死在米兰，长子阿卡狄乌斯管东部，次子霍诺留管西部；分治早有先例，这一回却再没合拢。',[[28.5,-10.5],[55.5,42.5]],d=>{
    ha(d,'eWest395',HC.rome,{fillOpacity:.22});ha(d,'eEast395',HC.athens,{fillOpacity:.22});
    d.line(SPLIT_395,{color:'#2a2018',weight:2.2,opacity:.85,dashArray:'3 6'});
    hp(d,'mediolanum',{note:'395年1月17日狄奥多西死在这里；十岁的霍诺留留在西部。'});
    hp(d,'constantinople',{note:'十七八岁的阿卡狄乌斯坐镇东部。'});hp(d,'rome');
   },[['fill',HC.rome,'西部：霍诺留'],['fill',HC.athens,'东部：阿卡狄乌斯'],['dline','#2a2018','395年东西分界'],['dot','#2a2018','米兰、罗马与君士坦丁堡']])
 ]},
{id:'history-empire-west-fall',ch:5,title:'西罗马的终结',short:'西罗马的终结',en:'The End of the Western Empire',period:'395—476年',c:HC.rome,hideBase:['alps'],
 scenes:[
  hs('370—454年','匈人西来','匈人从草原西来，赶得哥特人逃过多瑙河；日耳曼人在逃难、投靠和被征服中捏成几大军事集团；453年阿提拉死，匈人的天下散了。',[[38.5,-6.5],[56.5,48.5]],d=>{
    ha(d,'eWest395',HC.rome,{fillOpacity:.1});ha(d,'eEast395',HC.athens,{fillOpacity:.1});ha(d,'eHuns450',HC.war,{fillOpacity:.2});
    hr(d,[[48.6,46.5],[47.6,41.0],[47.0,35.5],[46.9,30.5],[47.2,25.5],[47.0,21.0]],HC.war,{width:3.5});
    hr(d,[[47.4,29.6],[45.8,28.6],[44.4,27.4],[43.4,26.8]],HC.celt);
    hr(d,[[49.2,19.0],[49.9,15.0],[50.2,11.0],[50.0,8.4]],HC.mino);
    hr(d,[[50.1,10.2],[49.63,8.36],[47.6,6.9],[46.0,6.1]],HC.thebes);
    hp(d,'durostorum',{note:'376年哥特人大约在这一段求渡多瑙河。'});
    hp(d,'mogontiacum',{note:'406年最后一天，汪达尔人、阿兰人、苏维汇人在这一带渡过莱茵河。'});
    hp(d,'catalaunian',{kind:'battle',left:1});
    [['匈人','Huns',49.6,40.5,HC.war],['东哥特','Ostrogoths',48.9,31.0,HC.celt],['西哥特','Visigoths',42.9,24.0,HC.celt],
     ['汪达尔等','Vandals, Alans, Suebi',51.5,15.8,HC.mino],['勃艮第','Burgundians',46.5,2.4,HC.thebes],
     ['法兰克','Franks',51.9,4.2,HC.macedon],['阿勒曼尼','Alamanni',48.0,9.8,HC.neutral],['撒克逊','Saxons',54.3,9.6,HC.neutral]].forEach(([t,en,la,lo,c])=>hl(d,t,en,la,lo,c));
   },[['fill',HC.war,'匈人的天下（约450年，概略）'],['dline',HC.war,'匈人西进（约370—420，概略）'],['dline',HC.celt,'哥特人渡多瑙河（376）'],['dline',HC.mino,'汪达尔等渡莱茵河（406）'],['dline',HC.thebes,'勃艮第人迁徙（概略）'],['dot','#2a2018','渡河处与卡塔隆平原']]),
  hs('395—408年','托孤大臣','十岁的霍诺留由托孤大臣斯提里科带去西边，一个霍光式的人物；东边不认这个托孤，宣布他是公敌、策动北非断粮；阿拉里克边打边谈，406年蛮族渡过莱茵河。',[[31.5,-6.0],[51.0,31.5]],d=>{
    ha(d,'eWest395',HC.rome,{fillOpacity:.14});ha(d,'eEast395',HC.athens,{fillOpacity:.12});
    hp(d,'mediolanum',{note:'395年起霍诺留的朝廷先在这里。'});
    hp(d,'ravenna',{note:'402年起西罗马皇帝躲进这座沼泽环绕的城。'});
    hp(d,'carthage',{note:'397年北非统帅吉尔多改投东边，断了运往罗马的粮；次年兵败自尽。'});
    hp(d,'constantinople',{note:'397年东边的元老院宣布斯提里科为国家公敌。'});
    hp(d,'mogontiacum',{note:'406年最后一天，汪达尔人、阿兰人、苏维汇人在这一带渡过莱茵河。'});
    hr(d,[[50.0,8.0],[48.6,4.0],[46.0,1.0],[43.4,-1.2],[40.5,-4.0]],HC.war);
    hr(d,[[42.5,22.0],[44.5,18.5],[46.0,16.5],[45.7,13.5],[45.2,10.0]],HC.celt);
   },[['fill',HC.rome,'西罗马'],['fill',HC.athens,'东罗马'],['dline',HC.war,'406年蛮族渡莱茵河，409年进西班牙（概略）'],['dline',HC.celt,'阿拉里克：401年起进犯意大利（概略）'],['dot','#2a2018','两个朝廷、北非粮仓与渡河处']]),
  hs('408—410年','罗马被破','霍诺留长大了，杀了托孤大臣斯提里科；意大利各城屠杀蛮族士兵家眷，三万人投奔阿拉里克；三围罗马，410年攻破，洗劫三天。',[[38.5,6.5],[47.0,19.0]],d=>{
    ha(d,'eWest395',HC.rome,{fillOpacity:.14});
    hp(d,'ticinum',{note:'408年8月13日驻军在此哗变，杀了一批大臣。'});
    hp(d,'ravenna',{note:'408年8月22日斯提里科在此被斩首。'});
    hp(d,'rome',{kind:'battle',note:'408、409年两次被围，410年8月24日被攻破，洗劫三天。'});
    hr(d,[[46.3,14.0],[45.7,13.4],[44.4,12.3],[43.2,12.6],[42.1,12.55]],HC.celt);
   },[['fill',HC.rome,'西罗马'],['dline',HC.celt,'阿拉里克南下罗马（概略）'],['dot',HC.war,'被攻破的罗马'],['dot','#2a2018','哗变与斩首之地']]),
  hs('410—439年','丢了粮仓','西哥特人落户阿基坦；六岁的瓦伦提尼安三世被扶上西部皇位，兵权归埃提乌斯；汪达尔人渡海进非洲，439年夺下迦太基。',[[31.0,-10.5],[47.5,16.5]],d=>{
    ha(d,'eWest395',HC.rome,{fillOpacity:.14});ha(d,'hAfrica146',HC.mino,{fillOpacity:.3});ha(d,'gAfricaNova',HC.mino,{fillOpacity:.3});
    hp(d,'ravenna',{note:'425年东罗马出兵，把六岁的瓦伦提尼安三世送上皇位，母亲加拉·普拉西提阿听政。'});
    hp(d,'tolosa');hp(d,'hippo',{kind:'battle'});
    hp(d,'carthage',{kind:'battle',note:'439年10月汪达尔人夺下迦太基。'});
    hr(d,[[40.5,-4.0],[37.2,-5.6],[35.6,-3.5],[36.5,2.0],[36.9,7.0],[36.85,10.1]],HC.war);
    hr(d,[[41.95,12.3],[43.8,10.2],[44.0,8.0],[43.5,5.0],[43.3,2.6],[43.55,1.6]],HC.celt);
   },[['fill',HC.rome,'西罗马'],['fill',HC.mino,'阿非利加：西罗马的粮仓与钱袋'],['dline',HC.war,'汪达尔人：429年渡海入非洲（概略）'],['dline',HC.celt,'西哥特人：418年落户阿基坦（概略）'],['dot',HC.war,'被攻破的城市']]),
  hs('439—476年','末代皇帝','卡塔隆平原挡住阿提拉；455年汪达尔人洗劫罗马；476年奥多亚克废掉末代皇帝，把冠服送回君士坦丁堡。',[[29.5,-11.0],[56.0,30.5]],d=>{
    ha(d,'e476Visigoths',HC.celt,{fillOpacity:.32});ha(d,'e476Suebi',HC.myc,{fillOpacity:.32});ha(d,'e476Franks',HC.macedon,{fillOpacity:.3});
    ha(d,'e476Soissons',HC.rome,{fillOpacity:.3});ha(d,'e476Burgundians',HC.thebes,{fillOpacity:.32});ha(d,'e476Vandals',HC.mino,{fillOpacity:.32});
    ha(d,'e476Odoacer',HC.war,{fillOpacity:.22});ha(d,'eEast395',HC.athens,{fillOpacity:.2});
    hp(d,'catalaunian',{kind:'battle'});hp(d,'ravenna',{note:'476年9月4日，奥多亚克在此废掉罗慕路斯·奥古斯都路斯。'});
    hp(d,'rome',{note:'455年6月，汪达尔人洗劫罗马两个星期。'});hp(d,'constantinople');
    [['西哥特王国','Visigoths',40.6,-3.6,HC.celt],['苏维汇人','Suebi',42.4,-7.9,HC.myc],['法兰克人','Franks',51.4,5.4,HC.macedon],['苏瓦松','Soissons',49.4,0.9,HC.rome],
     ['勃艮第人','Burgundians',46.2,5.5,HC.thebes],['汪达尔王国','Vandals',34.4,8.6,HC.mino],['奥多亚克的意大利','Odoacer\'s Italy',40.3,16.4,HC.war],['东罗马','Eastern Empire',42.0,23.4,HC.athens],
     ['阿勒曼尼人','Alamanni',47.6,9.7,HC.neutral],['不列颠：410年罗马撤走','Britain: abandoned 410',52.7,-1.6,HC.neutral]].forEach(([t,en,la,lo,c])=>hl(d,t,en,la,lo,c));
   },[['fill',HC.celt,'西哥特'],['fill',HC.mino,'汪达尔'],['fill',HC.macedon,'法兰克'],['fill',HC.thebes,'勃艮第'],['fill',HC.myc,'苏维汇'],['fill',HC.rome,'苏瓦松（罗马残部，到486年）'],['fill',HC.war,'奥多亚克的意大利'],['fill',HC.athens,'东罗马']])
 ]},
{id:'history-empire-arcadius',ch:5,title:'阿卡狄乌斯与金口约翰',short:'阿卡狄乌斯与金口约翰',en:'Arcadius and John Chrysostom',period:'395—408年',c:HC.rome,
 scenes:[
  hs('395—398年','兄弟分家','帝国分给两个儿子；东边朝政先后落在鲁菲努斯和宦官手里；城里多是三一派，兵营里多是信阿里乌派的哥特兵；398年金口约翰被接来当主教。',[[32.5,19.5],[46.0,40.5]],d=>{
    ha(d,'eEast395',HC.athens,{fillOpacity:.2});
    hp(d,'constantinople',{note:'395年11月鲁菲努斯在城外阅兵场被砍死；398年约翰被送来当主教。'});
    hp(d,'antioch',{note:'约翰在这里当长老，讲道出了名；398年被哄上马车，连夜送走。'});
    hl(d,'城里：三一派','Cities: Nicene',39.0,30.5,HC.athens);hl(d,'兵营：信阿里乌派的哥特兵','Army: Arian Goths',43.6,25.2,HC.war);
   },[['fill',HC.athens,'东罗马（阿卡狄乌斯）'],['dot','#2a2018','新都与安条克']]),
  hs('398—400年','说不动哥特人','约翰开哥特语教堂、组织夜里唱诗跟阿里乌派对着干；400年不肯给哥特统帅盖纳斯一座教堂；城里人群起杀哥特人，盖纳斯北逃，被匈人所杀。',[[39.5,22.0],[46.0,31.5]],d=>{
    ha(d,'eEast395',HC.athens,{fillOpacity:.2});
    hp(d,'constantinople',{kind:'battle',note:'400年7月城里人群起杀哥特人，七千多人躲进一座教堂，被揭了屋顶烧死。'});
    hr(d,[[41.01,28.98],[40.9,27.6],[40.45,26.7],[41.6,26.4],[43.0,26.8],[44.5,27.4]],HC.war);
    hl(d,'盖纳斯北逃，被匈人砍了头','Gainas flees, killed by the Huns',45.3,27.2,HC.war);
   },[['fill',HC.athens,'东罗马'],['dline',HC.war,'400年盖纳斯北逃（概略）'],['dot',HC.war,'杀哥特人的新都']]),
  hs('398—403年','打土豪','约翰砍主教府的开销办医院，讲道骂富人；399年失势的权宦躲进大教堂，约翰拦着不交：教会成了皇帝的手伸不进去的地方。',[[33.0,24.5],[43.0,36.0]],d=>{
    ha(d,'eEast395',HC.athens,{fillOpacity:.18});
    hp(d,'constantinople',{note:'399年欧特罗皮乌斯躲进大教堂；约翰在这里讲道骂富人、办医院。'});
    hp(d,'chalcedon',{left:1,labelZ:8,note:'欧特罗皮乌斯后来还是被哄出教堂，先流放塞浦路斯，又被押回这里杀了。'});
    hr(d,[[41.0,28.9],[39.0,27.5],[36.5,29.5],[35.2,33.0]],HC.war);
   },[['fill',HC.athens,'东罗马'],['dline',HC.war,'欧特罗皮乌斯被流放塞浦路斯（概略）'],['dot','#2a2018','大教堂所在的新都']]),
  hs('403—407年','两次流放','皇后和亚历山大里亚主教合力扳倒约翰，两次流放，引来闹事与大火；西边派使团撑腰，被扣下送回；407年约翰死在流放路上。',[[37.0,10.5],[46.5,42.0]],d=>{
    ha(d,'eWest395',HC.rome,{fillOpacity:.1});ha(d,'eEast395',HC.athens,{fillOpacity:.16});
    hp(d,'constantinople',{kind:'battle',note:'403年在对岸卡尔西顿郊外被定罪；404年6月20日再被押走，当天大教堂起火，烧到元老院。'});
    hp(d,'cucusus',{note:'404—407年约翰的流放地。'});hp(d,'comana');hp(d,'pityus');
    hp(d,'rome',{note:'罗马主教英诺森和霍诺留替约翰出头，派使团东去。'});
    hr(d,[[41.01,28.98],[40.0,31.5],[39.0,34.5],[38.05,36.45]],HC.war);hr(d,[[38.05,36.45],[39.3,36.5],[40.35,36.6]],HC.war);
    hr(d,[[40.6,17.9],[39.4,20.2],[38.0,23.6],[40.3,26.6],[41.0,28.4]],HC.rome);
    hl(d,'西边的使团：被扣下，送回','Western envoys turned back',38.6,18.6,HC.rome);
   },[['fill',HC.rome,'西罗马'],['fill',HC.athens,'东罗马'],['dline',HC.war,'约翰的流放路（概略）'],['dline',HC.rome,'西边的使团（概略）'],['dot',HC.war,'大火'],['dot','#2a2018','流放地与死处']])
 ]},
{id:'history-empire-theodosius-ii',ch:5,title:'狄奥多西二世：法典、苹果与姐姐',short:'狄奥多西二世',en:'Theodosius II: the Code, the Apple and the Sister',period:'408—450年',c:HC.rome,
 scenes:[
  hs('408—414年','七岁的皇帝','阿卡狄乌斯死，七岁的狄奥多西二世继位；据说遗嘱托波斯王当保护人；禁卫军长官修起陆墙；十五岁的姐姐普尔喀丽娅当上奥古斯塔，掌了权。',[[29.0,20.0],[44.5,51.5]],d=>{
    ha(d,'eEast395',HC.athens,{fillOpacity:.2});
    hp(d,'constantinople',{note:'413年安提米乌斯在城外修成陆墙；414年普尔喀丽娅当上奥古斯塔。'});
    hp(d,'ctesiphon',{note:'波斯王伊嗣俟一世的都城；据说他当了七岁罗马皇帝的保护人。'});
    hl(d,'波斯（萨珊王朝）','Sasanian Persia',33.5,51.0,HC.parthia);
   },[['fill',HC.athens,'东罗马（狄奥多西二世）'],['dot','#2a2018','新都与波斯王的都城']]),
  hs('421—443年','苹果','姐姐给弟弟挑了个雅典姑娘当皇后；一个苹果送掉了皇帝老友的命，皇后出走耶路撒冷；宫里姐姐、皇后、宦官三股势力，教义之争跟着站队。',[[29.5,21.0],[42.5,38.0]],d=>{
    ha(d,'eEast395',HC.athens,{fillOpacity:.18});
    hp(d,'athens',{note:'欧多基娅生在这里，父亲是教修辞的异教先生。'});hp(d,'constantinople');
    hp(d,'antioch',{note:'438年欧多基娅路过这里，用荷马的诗句讲演，城里给她立了金像。'});
    hp(d,'jerusalem',{left:1,note:'欧多基娅约443年出走到这里，修教堂、写诗，460年死在这里。'});
   },[['fill',HC.athens,'东罗马'],['dot','#2a2018','皇后的一生：雅典、新都、安条克、耶路撒冷']]),
  hs('425—438年','法典','425年设官办学堂；438年颁行《狄奥多西法典》，十六卷，东西两边同时生效；西罗马亡后，西哥特国王照着它给治下的罗马人定法。',[[35.5,-3.0],[47.5,31.0]],d=>{
    ha(d,'eWest395',HC.rome,{fillOpacity:.12});ha(d,'eEast395',HC.athens,{fillOpacity:.16});
    hp(d,'constantinople',{left:1,note:'425年设官办学堂，三十一个教席；438年颁行法典。'});
    hp(d,'rome',{note:'法典439年1月1日起在西边同时生效。'});
    hp(d,'tolosa',{note:'西哥特王国的都城；506年国王阿拉里克二世照法典删编出一部法，给治下的罗马人用。'});
   },[['fill',HC.rome,'西罗马'],['fill',HC.athens,'东罗马'],['dot','#2a2018','颁行、生效与传下去的地方']]),
  hs('441—450年','城墙与匈人','东罗马一边修墙一边给阿提拉进贡；447年地震后六十天修好城墙；450年皇帝坠马而死，新帝马尔西安不再进贡，阿提拉转头向西。',[[38.5,13.5],[49.0,31.5]],d=>{
    ha(d,'eHuns450',HC.war,{fillOpacity:.18});ha(d,'eEast395',HC.athens,{fillOpacity:.18});
    hp(d,'constantinople',{note:'447年地震震塌城墙，赛车场两派一万六千人六十天修好。'});
    hp(d,'naissus',{kind:'battle',note:'被匈人攻破；449年使团路过，城里空了，只剩几个病人躺在教堂里。'});
    hp(d,'viminacium',{kind:'battle',note:'约441年被匈人攻破；普利斯库斯在匈人营地碰见的希腊商人，就是在这里被掳的。'});
    hl(d,'阿提拉的营地（约449年，概略）','Attila’s camp, c. 449',46.9,20.6,HC.war);
   },[['fill',HC.war,'匈人的天下（约450年，概略）'],['fill',HC.athens,'东罗马'],['dot',HC.war,'被匈人攻破的城'],['dot','#2a2018','新都']])
 ]},
{id:'history-faith-israel',ch:6,title:'从大河那边来：希伯来人与出埃及',short:'族长与出埃及',en:'From Beyond the River: the Hebrews and the Exodus',period:'约前1400—前1200年',c:HC.faith,
 scenes:[
  hs('传说时代—前14世纪','大河那边来的人','经书说祖先从幼发拉底河下游的乌尔经哈兰来到迦南；前14世纪的泥板里，迦南诸王向法老告“哈比鲁人”的状。',[[25.5,29.5],[38.6,48.5]],d=>{
    ha(d,'crescent',COL.crescent,{fillOpacity:.12});ha(d,'canaan',COL.canaan,{fillOpacity:.22});
    hp(d,'ur',{note:'经书里的“迦勒底的吾珥”，亚伯拉罕一家从这里出发。'});hp(d,'haran');
    hp(d,'shechem',{note:'经书说亚伯拉罕进了迦南，先到示剑。'});hp(d,'amarna',{left:1});
    hr(d,[[30.96,46.10],[32.4,44.6],[33.9,42.4],[35.3,40.2],[36.87,39.03]],HC.route);
    hr(d,[[36.87,39.03],[35.6,37.4],[34.0,36.4],[32.21,35.28]],HC.route);
   },[['fill',COL.crescent,'新月沃地'],['fill',COL.canaan,'迦南'],['dline',HC.route,'经书里亚伯拉罕的路线（传说）'],['dot','#2a2018','乌尔、哈兰、示剑与阿玛尔纳']]),
  hs('约前14—前13世纪','在迦南放羊、学种地','平原城邦向埃及纳贡，牧人散在山坡上，半牧半农；“耶和华”这个名字最早见于埃及铭文，指的是南方旷野。',HV.levant,d=>{
    ha(d,'canaan',COL.canaan,{fillOpacity:.16});ha(d,'centralHighlands',COL.israel,{fillOpacity:.3});ha(d,'egypt',COL.egypt,{fillOpacity:.22});
    hp(d,'shechem');hp(d,'jerusalem',{left:1,note:'前14世纪的耶路撒冷王阿布迪-赫巴写信给法老，抱怨哈比鲁人抢了王的地。'});
    hp(d,'gaza',{left:1,note:'埃及管迦南的据点，通往埃及的大道从这里走。'});
    hl(d,'中央山地','Central Highlands',32.4,36.3,COL.israel);hl(d,'沙苏牧民（耶和华的旷野）','Shasu of Yhw',30.2,35.85,HC.war);
   },[['fill',COL.canaan,'迦南城邦（向埃及纳贡）'],['fill',COL.israel,'中央山地：牧人半牧半农，慢慢开地'],['fill',COL.egypt,'埃及'],['dot','#2a2018','城邦与埃及据点']]),
  hs('约前1274年','卡迭石：站错了队','埃及和赫梯大战卡迭石，打成平手；两强之间的小邦和山地人群各自押宝，仗后拉美西斯二世年年北上清算。',[[27.5,29],[42,41]],d=>{
    ha(d,'hHittite',HC.hittite);ha(d,'egypt',COL.egypt,{fillOpacity:.4});ha(d,'canaan',COL.egypt,{fillOpacity:.15});
    hp(d,'hattusa');hp(d,'piramesses',{left:1,note:'拉美西斯二世的新都，大军从这里出发北上。'});hp(d,'kadesh',{kind:'battle'});
    hr(d,[[30.8,31.83],[31.4,34.3],[33,35.4],[34.556,36.518]],COL.egypt);
    hr(d,[[40,34.6],[37,36],[34.556,36.518]],HC.hittite);
    hr(d,[[32.1,35.9],[31.5,34.5],[31.1,33.0],[30.9,32.1]],HC.war);
    hl(d,'倒向赫梯的山地人群','Highland groups on the Hittite side',32.6,38.6,HC.hittite);
   },[['fill',HC.hittite,'赫梯'],['fill',COL.egypt,'埃及与它管的迦南'],['dline',COL.egypt,'埃及北上'],['dline',HC.hittite,'赫梯南下'],['dline',HC.war,'战后俘虏押回埃及（概略）']]),
  hs('约前1270—前1213年','埃及的苦工：摩西是谁','俘虏去修拉美西斯的新都；摩西的名字是埃及名，故事说他在法老宫中长大，逃到米甸，在何烈山遇见耶和华。',[[24.6,29.4],[32.6,37.4]],d=>{
    ha(d,'egypt',COL.egypt,{fillOpacity:.3});
    hp(d,'piramesses',{left:1});hp(d,'memphis',{left:1});
    d.pin(P('传统西奈山（何烈山）',28.539,33.975,'杰贝勒穆萨，传统定为摩西遇见耶和华、领受十诫的山；不是已证实的历史地点。','peak',{en:'Traditional Mount Sinai'}));
    hr(d,[[30.80,31.83],[30.1,32.6],[29.5,33.5],[28.9,34.6],[28.3,35.3]],COL.exodus);
    hl(d,'米甸','Midian',27.9,36.0,COL.exodus);
   },[['fill',COL.egypt,'埃及'],['dline',COL.exodus,'摩西逃往米甸（传说，概略）'],['dot','#2a2018','拉美西斯的新都与古都孟菲斯']]),
  hs('约前1213—前1200年','出埃及：为什么放人','拉美西斯二世死后，埃及西挡利比亚人和海上民族、内有王族争位，看管一松，这批人走了；后人写成十灾逼法老放人。',HV.levant,d=>{
    ha(d,'canaan',COL.canaan,{fillOpacity:.16});hr(d,EXODUS_PATH,COL.exodus);
    d.pin(P('传统西奈山',28.539,33.975,'杰贝勒穆萨的传统定位；不是已证实的历史地点。','peak',{en:'Traditional Mount Sinai'}));
    hp(d,'jericho');hp(d,'piramesses',{left:1});hl(d,'西奈半岛','Sinai Peninsula',29.65,34,COL.exodus);
   },[['dline',COL.exodus,'未经证实的一种传统路线'],['fill',COL.canaan,'迦南：叙事中的目的地']])
 ]},
{id:'history-faith-first-temple',ch:6,title:'迦南的王国：从山地村落到巴比伦之囚',short:'王国与巴比伦之囚',en:'Kingdoms in Canaan: from Hill Villages to the Babylonian Exile',period:'约前1200—前538年',c:HC.faith,
 scenes:[
  hs('约前1200—前1000年','山地村落','埃及撤走、沿海城邦衰落，中央山地的村落从三十来个涨到两百多个；还没有王，有事由士师领头。',[[30.5,33.7],[35.5,37]],d=>{
    ha(d,'centralHighlands',COL.israel,{fillOpacity:.35});ha(d,'phoenicia',COL.phoenicia,{fillOpacity:.3});ha(d,'hPhilistia',HC.mino,{fillOpacity:.35});
    hp(d,'jerusalem',{left:1});hp(d,'shechem');hp(d,'tyre');hp(d,'gaza',{left:1});
    hl(d,'中央山地','Central Highlands',32.4,36.3,COL.israel);
   },[['fill',COL.israel,'以色列村落集中的中央山地'],['fill',COL.phoenicia,'腓尼基沿海'],['fill',HC.mino,'非利士人的沿海城市']],8),
  hs('约前1000—前930年','大卫与所罗门','非利士人压得紧，各支派要了一个王；大卫定都耶路撒冷，所罗门修起第一圣殿。',[[30.6,34.0],[33.8,37.1]],d=>{
    ha(d,'centralHighlands',COL.united,{fillOpacity:.2,dashArray:'5 5'});hp(d,'jerusalem');hp(d,'shechem');hp(d,'tyre',{left:1});hp(d,'dan');
    hl(d,'王权核心的参考地区','Approximate highland setting',32.7,36.1,COL.united);
   },[['dash',COL.united,'山地参考区域，非已证实国境'],['dot',COL.united,'城市与地理锚点']],8),
  hs('前930—前722年','南北两国','所罗门死后王国一分为二：北国以色列、南国犹大；前722年亚述灭了以色列。',[[29.5,31.0],[38.0,45.5]],d=>{
    ha(d,'israelKingdom',COL.israel,{fillOpacity:.32});ha(d,'judahKingdom',COL.jerusalem,{fillOpacity:.32});
    hp(d,'samaria');hp(d,'jerusalem',{left:1,note:'犹大国的都城，所罗门修的圣殿在这里。'});hp(d,'nineveh');
    hr(d,[[36.36,43.15],[36.6,40.0],[35.5,37.5],[33.6,36.3],[32.4,35.4]],HC.war);
    hl(d,'以色列（北国）','Kingdom of Israel',33.2,37.0,COL.israel);hl(d,'犹大（南国）','Kingdom of Judah',30.8,36.6,COL.jerusalem);hl(d,'亚述','Assyria',35.4,44.2,HC.war);
   },[['fill',COL.israel,'以色列（北国）'],['fill',COL.jerusalem,'犹大（南国）'],['dline',HC.war,'前722年亚述灭以色列（概略）']]),
  hs('前701—前609年','只拜一个神','亚述攻破拉吉、围耶路撒冷不下；约西亚只许在耶路撒冷献祭，捣毁各地神坛；前609年他战死在米吉多。',[[30.6,33.7],[33.5,36.5]],d=>{
    ha(d,'judahKingdom',COL.jerusalem,{fillOpacity:.32});
    hp(d,'jerusalem',{left:1,note:'前701年亚述大军围城未下；前622年约西亚在此改革，只许在圣殿献祭。'});
    hp(d,'lachish',{kind:'battle',left:1});hp(d,'megiddo',{kind:'battle'});
    hr(d,[[33.3,35.6],[32.7,35.0],[32.0,34.85],[31.62,34.88]],HC.war);
   },[['fill',COL.jerusalem,'犹大国'],['dline',HC.war,'前701年亚述大军南下（概略）'],['dot',HC.war,'拉吉陷落（前701）与约西亚阵亡（前609）']],8),
  hs('前597—前538年','巴比伦之囚','巴比伦两破耶路撒冷，前586年烧了圣殿，把上层人掳走；前538年波斯王居鲁士准他们回乡。',[[28.5,31.0],[37.5,49.0]],d=>{
    ha(d,'judahKingdom',COL.jerusalem,{fillOpacity:.32});ha(d,'hBabylonia',HC.neutral,{fillOpacity:.2});
    hp(d,'jerusalem',{kind:'battle',left:1,note:'前586年被巴比伦攻破，圣殿被烧。'});
    hp(d,'babylon',{note:'被掳的犹大上层住在这一带；前539年居鲁士攻下巴比伦，次年准他们回乡。'});
    hr(d,[[31.78,35.24],[33.5,36.6],[35.5,38.8],[34.5,42.0],[32.55,44.42]],HC.war);
   },[['fill',COL.jerusalem,'犹大国'],['fill',HC.neutral,'巴比伦尼亚'],['dline',HC.war,'被掳到巴比伦（概略）'],['dot',HC.war,'被攻破的耶路撒冷']])
 ]},
{id:'history-faith-second-temple',ch:6,title:'颠沛中长出来的宗教',short:'第二圣殿时期',en:'A Faith Forged in Exile: the Second Temple',period:'前538—前4年',c:HC.faith,
 scenes:[
  hs('前550—前515年','只有一个神','被掳的先知喊出“在我以外并没有别神”；一神教一说是以色列首创，一说学自埃及法老阿赫那吞。',[[24.6,29.0],[37.5,48.5]],d=>{
    ha(d,'egypt',COL.egypt,{fillOpacity:.18});ha(d,'hBabylonia',HC.neutral,{fillOpacity:.2});
    hp(d,'amarna',{left:1,note:'前14世纪阿赫那吞在此建新都，独尊太阳圆盘阿顿；他一死，新都就被放弃。'});
    hp(d,'babylon',{note:'被掳的先知在这里喊出“在我以外并没有别神”。'});
    hp(d,'jerusalem',{left:1,note:'前515年，回乡的人在这里修成第二圣殿。'});
    hr(d,[[32.54,44.42],[34.5,42.0],[35.5,38.8],[33.5,36.6],[31.9,35.4]],HC.route);
   },[['fill',COL.egypt,'埃及'],['fill',HC.neutral,'巴比伦尼亚'],['dline',HC.route,'从巴比伦回乡（概略）'],['dot','#2a2018','阿顿的都城、被掳之地与重修的圣殿']]),
  hs('约前458—前400年','选民与约','耶和华是以色列的神，以色列是他拣选的子民；以斯拉把摩西律法立为全民的法，不许跟外族通婚。',[[23.0,27.0],[38.5,50.5]],d=>{
    ha(d,'achaemenid',HC.persia,{fillOpacity:.12});
    hp(d,'jerusalem',{left:1,note:'以斯拉在这里当众宣读摩西律法。'});hp(d,'babylon');
    hp(d,'susa',{note:'波斯王的都城之一；以斯拉、尼希米都是从波斯宫廷领了命回耶路撒冷的。'});
    hp(d,'elephantine',{left:1});
   },[['fill',HC.persia,'波斯帝国（概略）'],['dot','#2a2018','犹太人聚居的几个地方']]),
  hs('前332—前63年','盼一个救世主','犹地亚先归托勒密，后归塞琉古；前167年马加比起兵；《但以理书》盼列国倒下、死人复活、受膏者到来。',[[28.8,26.5],[38.2,40.5]],d=>{
    ha(d,'hPtolemaicCore',HC.mino,{fillOpacity:.18});ha(d,'hSeleucidSyria',HC.parthia,{fillOpacity:.18});
    hp(d,'alexandria',{note:'城里有大批说希腊语的犹太人；经书在这里译成希腊文，即《七十士译本》。'});
    hp(d,'jerusalem',{kind:'battle',left:1,note:'前167年安条克四世在圣殿里祭宙斯；前164年马加比夺回圣殿，重新献殿。'});
    hp(d,'antioch',{note:'塞琉古王朝的都城。'});
   },[['fill',HC.mino,'托勒密埃及'],['fill',HC.parthia,'塞琉古叙利亚'],['dot',HC.war,'马加比夺回的圣殿']]),
  hs('前63—前4年','罗马不在乎','庞培进了至圣所；罗马准犹太人照旧聚会、往圣殿送钱，由它去；希律扩建圣殿，民间越来越盼弥赛亚。',[[29.9,33.4],[33.9,37.0]],d=>{
    ha(d,'centralHighlands',COL.united,{fillOpacity:.14,dashArray:'5 5'});
    hp(d,'jerusalem',{left:1,note:'前63年庞培攻进城；希律从前20年前后扩建圣殿，用四道挡土墙把圣殿山垫成大平台，西面那道就是今天的哭墙。'});
    hp(d,'caesarea',{left:1});hp(d,'qumran');hp(d,'masada');
    hl(d,'加利利','Galilee',32.85,35.42,COL.israel);hl(d,'犹地亚','Judaea',31.55,34.95,COL.jerusalem);
   },[['dash',COL.united,'犹太人聚居的山地（概略）'],['dot','#2a2018','希律时代的城市与要塞']],8)
 ]},
{id:'history-faith-jesus',ch:6,title:'神太多了：耶稣与使徒',short:'耶稣与使徒',en:'Too Many Gods: Jesus and the Apostles',period:'约前4—公元73年',c:HC.faith,
 scenes:[
  hs('公元前后','神太多了','罗马七百多年来对外来的神来者不拒，选神本身成了负担；基督教是这场筛选里的胜者。',[[27.0,8.0],[44.5,40.0]],d=>{
    ha(d,'romanEmpire',HC.rome,{fillOpacity:.07});
    hp(d,'rome',{note:'万神殿：前27年前后阿格里帕始建，名字的意思是“所有的神”；今天的穹顶是哈德良重修的。'});
    hp(d,'pessinus',{note:'大地母库柏勒的圣地；前204年汉尼拔还在意大利，罗马照神谕把她的黑色神石迎进城。'});
    hp(d,'alexandria',{note:'伊西斯和塞拉皮斯的大庙在这里；这两位埃及神的信徒遍及地中海。'});
    hp(d,'emesa',{note:'太阳神埃拉伽巴尔的圣城；218年他的世袭祭司当上了罗马皇帝。'});
    hp(d,'jerusalem',{left:1,note:'犹太人只拜一位神，不进罗马的万神殿。'});
    hr(d,[[39.35,31.58],[39.4,26.0],[39.6,19.6],[41.3,14.2],[41.8,12.8]],HC.mino);
    hr(d,[[31.2,29.92],[33.6,23.0],[37.0,16.4],[41.5,12.9]],HC.mino);
    hr(d,[[34.73,36.71],[35.2,30.0],[36.4,22.0],[38.6,16.0],[41.6,13.0]],HC.mino);
   },[['fill',HC.rome,'罗马帝国（概略）'],['dline',HC.mino,'外来的神进罗马（示意）'],['dot','#2a2018','几位外来大神的老家与不进万神殿的耶路撒冷']]),
  hs('约前4—约30年','耶稣：一个神，换永生','耶稣用的还是犹太教那位唯一的上帝，交换的条件却改了：信从他，换个人的永生。',[[31.4,34.5],[33.3,36.2]],d=>{
    hp(d,'nazareth',{left:1,note:'加利利的小村，耶稣在这里长大。'});hp(d,'capernaum');hp(d,'jerusalem',{left:1});
    hr(d,[[32.70,35.30],[32.2,35.55],[31.87,35.44],[31.78,35.24]],COL.israel);
    hl(d,'加利利','Galilee',32.95,35.1,COL.israel);hl(d,'犹地亚','Judaea',31.55,34.85,COL.jerusalem);
   },[['dline',COL.israel,'从加利利上耶路撒冷（概略，循约旦河谷）'],['dot','#2a2018','耶稣传道的地方']],8),
  hs('约30年','钉十字架','跟的人一多就招忌：大祭司嫉妒他抢人，罗马看他像谋反，门徒的聚会又像秘密结社；总督彼拉多把他钉了十字架。',[[29.5,10.5],[44.0,37.5]],d=>{
    ha(d,'eEmpire14',HC.rome,{fillOpacity:.08});
    hp(d,'rome',{note:'奥古斯都死后由元老院封神；提比略的银币上铸着“神圣奥古斯都之子”，“恺撒的归恺撒”里那枚银币多半就是它。'});
    hp(d,'jerusalem',{kind:'battle',left:1,note:'约30年逾越节，耶稣在此被罗马总督彼拉多钉十字架。'});
    hp(d,'caesarea',{note:'罗马总督的驻地；1961年这里出土了刻着彼拉多名字的石碑。'});
   },[['fill',HC.rome,'罗马帝国（奥古斯都死时，概略）'],['dot',HC.war,'受难的耶路撒冷'],['dot','#2a2018','皇帝的城与总督的驻地']]),
  hs('约33—64年','彼得与保罗：门向外邦人打开','彼得给罗马百夫长施洗，使徒议定外邦人入教不必行割礼；保罗沿罗马大道把教会开进说希腊语的城市。',[[30.5,10.5],[43.5,37.5]],d=>{
    ha(d,'romanEmpire',HC.rome,{fillOpacity:.08});
    hp(d,'jerusalem',{left:1,note:'约49年使徒在此议定，外邦人入教不必行割礼。'});
    hp(d,'caesarea',{left:1,note:'彼得在此给罗马百夫长哥尼流一家施洗。'});
    hp(d,'antioch',{note:'信耶稣的人在这里头一回被叫作“基督徒”；保罗从这里出发传教。'});hp(d,'tarsus');
    hp(d,'ephesus');hp(d,'corinth',{note:'保罗在此住了一年半，写信给各地教会；东边不远就是雅典。'});
    hp(d,'rome',{note:'保罗以罗马公民的身份上告恺撒，被押到这里受审。'});
    hr(d,[[36.2,36.16],[36.92,34.89],[37.94,27.34],[37.98,23.73],[37.9,22.9],[40.6,19.8],[41.9,12.5]],HC.route);
   },[['fill',HC.rome,'罗马帝国'],['dline',HC.route,'保罗走过的主要城市（概略）'],['dot','#2a2018','早期教会的城市']]),
  hs('49—64年','尼禄大火','耶稣死后三十多年，基督徒在罗马已多到人人知道；64年大火，尼禄拿他们顶罪，第一次大迫害。',[[30.5,10.5],[43.5,37.5]],d=>{
    ha(d,'romanEmpire',HC.rome,{fillOpacity:.08});
    hp(d,'rome',{kind:'battle',note:'64年7月大火，十四个城区只剩四个完好；尼禄拿基督徒顶罪。'});
    hp(d,'puteoli',{note:'约60年保罗被押往罗马，在这里上岸，当地已有“弟兄”接待。'});
    hp(d,'thessalonica',{note:'保罗在此建教会，后来写了《帖撒罗尼迦前书》，是《新约》里最早的一篇。'});
    hp(d,'corinth');hp(d,'ephesus');hp(d,'antioch');hp(d,'jerusalem',{left:1});
    hp(d,'alexandria',{note:'传说马可在此建立教会。'});
   },[['fill',HC.rome,'罗马帝国（概略）'],['dot','#2a2018','64年前已有基督徒的城市（据《使徒行传》和保罗书信）'],['dot',HC.war,'大火中的罗马']]),
  hs('66—73年','圣殿被毁','提图斯攻破耶路撒冷，烧了第二圣殿；马萨达陷落；拉比在雅夫内重整，基督徒与犹太教分道。',[[30.0,33.4],[33.2,36.9]],d=>{
    hp(d,'jerusalem',{kind:'battle',left:1,note:'70年8月，第二圣殿被烧。'});hp(d,'masada',{kind:'battle'});hp(d,'yavneh');hp(d,'caesarea',{left:1});
   },[['dot',HC.war,'被攻破的耶路撒冷与马萨达'],['dot','#2a2018','拉比重整之地与罗马总督的驻地']],8)
 ]},
{id:'history-faith-church',ch:6,title:'迫害为什么时紧时松',short:'迫害时期',en:'Persecution, Loose and Tight',period:'73—311年',c:HC.faith,
 scenes:[
  hs('96—192年','不必搜捕','图拉真定下规矩：不搜捕，不收匿名告发，告到了又不肯献祭才罚；五贤帝要太平，殉道零星发生。',[[30.0,-2.0],[48.5,40.0]],d=>{
    ha(d,'romanEmpire',HC.rome,{fillOpacity:.1});
    hp(d,'nicomedeia',{note:'小普林尼任比提尼亚总督（约110—112年），从这一带写信问图拉真怎么处置基督徒。'});
    hp(d,'rome',{note:'图拉真在这里回信：不必搜捕，匿名告发一概不收。'});
    hp(d,'lugdunum',{kind:'battle',note:'177年这里的基督徒被百姓围攻、官府处死，记下他们殉道的书信流传各地。'});
    hp(d,'jerusalem',{left:1,note:'135年巴尔·科赫巴起义失败后，改建为罗马城埃利亚·卡皮托利纳，不许犹太人进城。'});
   },[['fill',HC.rome,'帝国（117年，概略）'],['dot',HC.war,'零星的殉道'],['dot','#2a2018','总督的信与皇帝的回信']]),
  hs('193—284年','乱世里的网','皇帝忙着内战外患，顾不上管人信什么；乱世里教会是靠得住的网；德基乌斯、瓦勒良的迫害都没撑过三年。',[[28.5,-7.0],[50.5,47.5]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.1});
    hp(d,'rome',{note:'251年罗马一城的教会有四十六个长老，养着一千五百多个寡妇和穷人。'});
    hp(d,'carthage',{note:'252年瘟疫中，主教居普良召集信徒收治病人；258年他被斩首。'});
    hp(d,'alexandria',{note:'主教狄奥尼修斯写道：瘟疫来时，别人把病人推出门外，弟兄们却留下照料，自己也染病死去。'});
    hp(d,'abritus',{kind:'battle',left:1});hp(d,'edessa',{kind:'battle'});
   },[['fill',HC.rome,'帝国（约300年，概略）'],['dot',HC.war,'两位迫害者的败亡之地'],['dot','#2a2018','乱世里的教会']]),
  hs('303—311年','朱庇特之子','戴克里先号称朱庇特之子，四帝的合法性挂在老神身上；基督徒不肯献祭，就是不认这几位皇帝。',[[33.5,-6.0],[55.5,40.5]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.14});
    hp(d,'nicomedeia',{kind:'battle',note:'303年2月，皇宫望得见的大教堂被拆平，大迫害从这里开始。'});
    hp(d,'sirmium',{note:'副皇帝伽列里乌斯的驻地。'});hp(d,'mediolanum',{note:'正皇帝马克西米安的驻地，他号称赫拉克勒斯之子。'});
    hp(d,'treveri',{note:'西部副皇帝君士坦提乌斯驻在这里，只拆了几座教堂的房子，没有杀人。'});
    hl(d,'东部：迫害到311年','East: persecution until 311',37.6,33.4,HC.war);hl(d,'西部：拆了几座房子','West: a few churches pulled down',46.3,0.6,HC.rome);
   },[['fill',HC.rome,'帝国（约300年，概略）'],['dot',HC.war,'大迫害的起点'],['dot','#2a2018','四帝的驻地']]),
  hs('约300—311年','羽翼已成','全帝国约一成，却扎堆在城里、军中和宫里，长得又快；迫害八年拆不散，311年伽列里乌斯下诏认输。',[[28.5,-7.0],[50.5,47.5]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.1});ha(d,'eChrist300',HC.mino,{fillOpacity:.32,weight:.8});
    hp(d,'rome');hp(d,'carthage');hp(d,'alexandria');hp(d,'antioch');
    hp(d,'nicomedeia',{note:'311年4月，伽列里乌斯的宽容诏书在这里张贴。'});
    hp(d,'vagharshapat',{note:'301年前后，亚美尼亚国王梯里达底三世在这里受洗，亚美尼亚成了头一个奉基督教为国教的国家。'});
    hl(d,'弗里吉亚','Phrygia',38.6,30.6,HC.war);
   },[['fill',HC.rome,'帝国'],['fill',HC.mino,'基督徒较多的地方（约300年，概略）'],['dot','#2a2018','教会的大城与亚美尼亚的王城']])
 ]},
{id:'history-faith-empire-church',ch:6,title:'借风口：帝国的教会',short:'帝国的教会',en:'Riding the Wind: the Church of the Empire',period:'312—394年',c:HC.faith,
 scenes:[
  hs('312—337年','借风口','拆不散的网不如拿来用：君士坦丁发还教产、给钱给特权、修大教堂；风口不是他造的，是他借的。',[[28.5,-7.5],[50.5,42.5]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.1});
    ha(d,'eChrist300',HC.mino,{fillOpacity:.32,weight:.8});
    hp(d,'rome',{note:'拉特兰大教堂建在被解散的近卫骑兵营房上；梵蒂冈山坡上又修起圣彼得大教堂。'});
    hp(d,'jerusalem',{note:'326年起在传说的耶稣墓上修圣墓教堂，335年落成。'});
    hp(d,'antioch',{note:'327年君士坦丁在此动工修八角形的“金教堂”。'});
    hp(d,'carthage',{note:'迫害时交出过经书的人能不能当主教，北非教会为此分裂，313年起双方都去找皇帝裁决。'});
    hp(d,'arelate',{left:1,note:'314年皇帝召集西部主教在此开会，裁决北非的分裂。'});
    hp(d,'nicomedeia',{note:'大迫害从这里开始（303年），君士坦丁也在这里临终受洗（337年）。'});
   },[['fill',HC.rome,'帝国'],['fill',HC.mino,'基督徒较多的地方（约300年，概略）'],['dot','#2a2018','大教堂与教会大事']]),
  hs('380—394年','朱庇特有罪','狄奥多西定尼西亚派为国教，禁绝献祭，塞拉皮斯神庙被拆；据诗人记载，元老院表决判了朱庇特有罪。',[[29.0,2.0],[47.5,33.0]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.1});
    hp(d,'rome',{note:'382年胜利女神祭坛被搬出元老院议事厅；后来狄奥多西让元老院表决，判了朱庇特。'});
    hp(d,'thessalonica',{note:'380年2月狄奥多西在此颁诏：臣民一律信尼西亚派。'});
    hp(d,'alexandria',{kind:'battle',note:'391年主教提奥菲卢斯带人拆了塞拉皮斯神庙。'});
    hp(d,'frigidus',{kind:'battle',note:'394年狄奥多西在此打败西部的篡位者，那是最后一支打着旧神旗号的军队。'});
    hp(d,'mediolanum',{left:1,note:'米兰主教安布罗斯力阻胜利女神祭坛搬回元老院；395年狄奥多西死在这里。'});
   },[['fill',HC.rome,'帝国'],['dot',HC.war,'拆庙与旧神的最后一战'],['dot','#2a2018','颁诏、表决与主教']])
 ]},
{id:'history-faith-councils',ch:6,title:'把一个神讲圆：尼西亚与君士坦丁堡',short:'尼西亚与君士坦丁堡',en:'Squaring One God: Nicaea and Constantinople',period:'318—381年',c:HC.faith,
 scenes:[
  hs('318—325年','讲不圆的一个神','要替皇权服务，教义得先讲圆：神只有一个，父、子、灵却都有神性；主教亚历山大说圣子与父本质相同，长老阿里乌说圣子低一级。',[[29.0,24.0],[42.0,40.5]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.1});
    hp(d,'alexandria',{note:'318年前后主教亚历山大与长老阿里乌在此吵开，亚历山大召集主教，革了阿里乌的教籍。'});
    hp(d,'nicomedeia',{note:'皇帝常驻的地方；主教优西比乌是阿里乌的同门，替他四处写信撑腰。'});
    hp(d,'antioch',{note:'阿里乌和优西比乌都出自安条克的卢西安门下，阿里乌写信称优西比乌“同门”。'});
    hp(d,'tyre',{left:1,note:'新柏拉图派哲人波菲利的家乡；他写书驳斥基督徒，君士坦丁下令把书毁了。'});
   },[['fill',HC.rome,'帝国（约300年，概略）'],['dot','#2a2018','阿里乌之争的几座城']]),
  hs('313—约450年','旷野圣人','迫害停了，殉道的路断了，极端的信徒进旷野苦修，也有人表演苦修；他们在信众中一呼百应，主教们离不开他们。',[[24.5,28.0],[37.5,39.0]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.1});
    hp(d,'colzim',{note:'安东尼晚年在此隐修四十多年；338年他下山进城，驳斥阿里乌派。'});
    hp(d,'tabennisi',{note:'318—323年间帕科米乌在此办起第一座修院，不久就有一百多名修士。'});
    hp(d,'alexandria',{note:'356年阿塔纳修斯第三次被逐，躲进上埃及的旷野，跟修士一起过了六年。'});
    hp(d,'telanissos',{note:'西门在此站柱三十六年，459年死在柱顶；各地朝圣的人赶来看他。'});
   },[['fill',HC.rome,'帝国（概略）'],['dot','#2a2018','隐修士与修院']]),
  hs('325年','尼西亚','君士坦丁对教义不感兴趣，支持多数成本低：阿里乌派的信经当场撕碎，“同质”写进信经，阿里乌被流放。',[[30.0,8.0],[45.0,37.0]],d=>{
    ha(d,'eEmpire300',HC.rome,{fillOpacity:.1});
    hp(d,'nicaea',{kind:'battle',left:1,note:'325年5—7月，二百五十多位主教在此开会，皇帝亲自出场。'});
    hp(d,'nicomedeia',{note:'皇帝的驻地；主教优西比乌签了信经，却不肯签字革除阿里乌，会后不久也被流放。'});
    hp(d,'alexandria',{note:'主教亚历山大带着执事阿塔纳修斯到会。'});
    hp(d,'rome',{note:'罗马主教没来，派了两名长老代表。'});
   },[['fill',HC.rome,'帝国（约300年，概略）'],['dot',HC.war,'会场'],['dot','#2a2018','几位要角的来处']]),
  hs('327—363年','翻大饼','君士坦丁晚年召回阿里乌派、流放阿塔纳修斯；老二君士坦提乌斯二世偏阿里乌派；堂弟尤利安干脆掀桌，复兴旧神。',[[30.5,-2.0],[52.0,42.0]],d=>{
    ha(d,'eConst317',HC.rome,{fillOpacity:.12});ha(d,'eLic317',HC.athens,{fillOpacity:.12});
    hp(d,'treveri',{note:'335年阿塔纳修斯被流放到这里。'});
    hp(d,'constantinople',{left:1,labelZ:4,note:'336年阿里乌在此暴死，就在要恢复他教籍的前一天。'});
    hp(d,'ariminum',{note:'359年西部四百来位主教在此被扣着开会，最后签了“圣子像圣父”的信经。'});
    hp(d,'alexandria',{note:'阿塔纳修斯的主教座；他一生五次被逐，又五次回来。'});
    hr(d,[[41.01,28.98],[42.70,23.32],[44.97,19.61],[46.5,15.6],[48.3,11.0],[49.75,6.64]],HC.war);
    hl(d,'君士坦斯：挺尼西亚派','Constans: Nicene',46.0,3.0,HC.rome);hl(d,'君士坦提乌斯二世：偏阿里乌派','Constantius II: leaning Arian',38.5,34.5,HC.athens);
   },[['fill',HC.rome,'君士坦斯的西部（340—350年，概略）'],['fill',HC.athens,'君士坦提乌斯二世的东部'],['dline',HC.war,'335年阿塔纳修斯被流放到特里尔（概略）'],['dot','#2a2018','翻来覆去的几处']]),
  hs('363—381年','君士坦丁堡','瓦伦斯又扶阿里乌派，哥特人跟着信了；狄奥多西把大饼翻回来，381年第二次大公会议：本质一个、位格三个，君士坦丁堡排到第二。',[[35.0,20.0],[45.5,37.5]],d=>{
    ha(d,'eEast395',HC.athens,{fillOpacity:.1});
    hp(d,'constantinople',{note:'381年5—7月，东方一百五十位主教在此开会；狄奥多西进城前，城里的教堂都在阿里乌派手里。'});
    hp(d,'adrianople',{kind:'battle',note:'378年瓦伦斯在此被哥特人打死。'});
    hp(d,'thessalonica',{note:'380年2月狄奥多西在此颁诏：臣民一律信尼西亚派。'});
    hp(d,'mazaca',{labelZ:5,note:'370年起巴西尔在此任主教；他和弟弟尼撒的格列高利、好友纳齐安的格列高利，合称卡帕多西亚三教父。'});hp(d,'nazianzus',{left:1});
    hl(d,'哥特人：信了阿里乌派','Goths: Arian',44.4,25.6,HC.war);
   },[['fill',HC.athens,'帝国东部（概略）'],['dot',HC.war,'瓦伦斯战死之地'],['dot','#2a2018','颁诏、开会与卡帕多西亚教父的家乡']])
 ]},
{id:'history-faith-two-cities',ch:6,title:'两座城：分家以后的教会',short:'分家以后的教会',en:'Two Cities: the Church after the Split',period:'410—451年',c:HC.faith,
 scenes:[
  hs('410—430年','上帝之城','罗马城破，异教徒说是抛弃旧神的报应；奥古斯丁写《上帝之城》：两种爱造出两座城，罗马会倒，上帝之城不倒；教会从此不必跟帝国同生死。',[[30.0,-6.0],[46.5,20.0]],d=>{
    ha(d,'eWest395',HC.rome,{fillOpacity:.14});
    hp(d,'rome',{kind:'battle',note:'410年8月被西哥特人攻破。'});
    hp(d,'hippo',{left:1,note:'奥古斯丁在此任主教，413—426年写成《上帝之城》；430年死在汪达尔人的围城之中。'});
    hp(d,'carthage',{note:'皇帝派来的大员在这里判北非的多纳图派为异端，令他们交出教堂。'});
   },[['fill',HC.rome,'西罗马'],['dot',HC.war,'被攻破的罗马'],['dot','#2a2018','奥古斯丁的北非']]),
  hs('428—435年','以弗所','这回争耶稣的神性与人性：聂斯托利不许叫马利亚“生神者”，西里尔拉上罗马抢先开会革了他；聂斯托利派东走波斯，传到长安。',[[23.5,24.0],[42.5,52.5]],d=>{
    ha(d,'eEast395',HC.athens,{fillOpacity:.1});
    hp(d,'ephesus',{kind:'battle',note:'431年6月第三次大公会议在此召开；本城主教带着五十多位主教站在西里尔一边。'});
    hp(d,'constantinople',{left:1,note:'聂斯托利428年起在此任主教。'});
    hp(d,'alexandria',{note:'西里尔的主教座；他的舅舅提奥菲卢斯403年扳倒过君士坦丁堡主教金口约翰。'});
    hp(d,'antioch',{note:'安条克主教约翰带着东方主教晚到几天，另开一会，反过来革了西里尔。'});
    hp(d,'kharga',{note:'435年聂斯托利被流放到这里，约451年死去。'});
    hp(d,'ctesiphon',{note:'波斯境内教会的中心；不认以弗所决定的人在波斯落脚，再往东传。'});
    hr(d,[[33.1,44.6],[34.5,48.5],[36.0,51.5]],HC.faith);hl(d,'635年传到长安（景教）','To Chang’an, 635',37.4,48.6,HC.faith);
   },[['fill',HC.athens,'帝国东部（概略）'],['dline',HC.faith,'聂斯托利派东传（方向示意）'],['dot',HC.war,'会场'],['dot','#2a2018','对垒的几座城与流放地']]),
  hs('440—452年','教宗','利奥一世自称彼得的继承人，皇帝下诏要西方主教都听罗马的；他不认君士坦丁堡与罗马同等，又出城见阿提拉。',[[36.0,-3.0],[48.0,31.0]],d=>{
    ha(d,'eWest395',HC.rome,{fillOpacity:.14});ha(d,'eEast395',HC.athens,{fillOpacity:.1});
    hp(d,'rome',{note:'440年起利奥一世任罗马主教。'});
    hp(d,'arelate',{left:1,note:'445年阿尔勒主教希拉里不服罗马，皇帝下诏替利奥撑腰。'});
    hp(d,'mincio',{kind:'battle',note:'452年利奥随使团在这一带见阿提拉，阿提拉退了兵。'});
    hp(d,'chalcedon',{left:1,note:'451年会上把君士坦丁堡抬到跟罗马平起平坐，利奥不认这一条。'});
   },[['fill',HC.rome,'西罗马'],['fill',HC.athens,'东罗马'],['dot',HC.war,'见阿提拉之处'],['dot','#2a2018','罗马、阿尔勒与卡尔西顿']]),
  hs('449—451年','卡尔西顿','449年“强盗会议”打死君士坦丁堡主教；451年卡尔西顿奉利奥的书信为正统：一个位格、两个本性；埃及、叙利亚另立门户。',[[24.0,8.0],[44.0,46.5]],d=>{
    ha(d,'eWest395',HC.rome,{fillOpacity:.1});ha(d,'eEast395',HC.athens,{fillOpacity:.1});
    hp(d,'chalcedon',{note:'451年10月，五百二十多位主教在此开会，皇帝的大臣坐镇。'});
    hp(d,'ephesus',{kind:'battle',note:'449年第二次以弗所会议，利奥叫它“强盗会议”。'});
    hp(d,'rome',{note:'利奥一世440年起任教宗，他的书信在卡尔西顿奉为正统。'});
    hp(d,'alexandria',{note:'主教狄奥斯库若在卡尔西顿被革；埃及教会不服，另立门户，就是今天的科普特教会。'});
    hp(d,'antioch',{note:'叙利亚的教会多半不服，后来另立门户，就是叙利亚正教会。'});
    hp(d,'vagharshapat',{left:1,note:'亚美尼亚教会后来也不认卡尔西顿。'});
   },[['fill',HC.rome,'帝国西部'],['fill',HC.athens,'帝国东部'],['dot',HC.war,'强盗会议'],['dot','#2a2018','会场与另立门户的教会']]),
  hs('318—451年','为什么吵不完','一神教要吃精英就得跟皇权合作、改造得更有智识含量；不同改造方法成了派系争权的战场，纷争又伤了化繁为简的竞争力；最后不是天下归于一尊，而是各归一尊。',[[24.0,-3.0],[50.0,52.0]],d=>{
    ha(d,'eWest395',HC.rome,{fillOpacity:.12});ha(d,'eEast395',HC.athens,{fillOpacity:.12});
    hp(d,'rome',{note:'西方的一尊：罗马主教；440年起利奥一世自称彼得的继承人。'});
    hp(d,'mediolanum',{labelZ:4,note:'390年米兰主教安布罗斯让狄奥多西当众悔罪（另见“罗马”主线）。'});
    hp(d,'constantinople',{left:1,note:'东方的一尊：皇帝，和他眼皮底下的牧首。'});
    hp(d,'alexandria',{note:'埃及不服卡尔西顿，另立科普特教会，自有教宗。'});
    hp(d,'antioch',{note:'叙利亚的教会多半不服，后来另立门户。'});
    hp(d,'vagharshapat',{left:1,labelZ:4,note:'亚美尼亚教会后来也不认卡尔西顿，自成一系。'});
    hp(d,'ctesiphon',{labelZ:4,note:'波斯境内的东方教会自有宗主教，不归罗马、君士坦丁堡管。'});
   },[['fill',HC.rome,'帝国西部'],['fill',HC.athens,'帝国东部'],['dot','#2a2018','各归一尊：教宗、皇帝与牧首、自立的教会']])
 ]},
{id:'history-china-neolithic',ch:7,title:'新石器聚落与万邦时代',short:'仰韶与良渚',en:'Neolithic China: Yangshao to Liangzhu',period:'约前7000—前1900年',c:HC.china,
 scenes:[
  hs('约前7000—前1900年','南稻北粟与良渚古城','黄河流域种粟、长江流域种稻；前3300年起良渚筑起古城与大型水利，龙山时代城址林立。',[[27.0,104.0],[40.0,122.5]],d=>{
    ha(d,'farCore',HC.china,{fillOpacity:.10});
    hp(d,'yangshao',{left:1});hp(d,'liangzhu');
    hl(d,'黄河中游粟作区','Millet zone',36.2,111.0,HC.china);hl(d,'长江下游稻作区','Rice zone',31.2,118.0,HC.china);
   },[['fill',HC.china,'东亚文明区（示意）'],['dot','#2a2018','代表性新石器遗址']])
 ]},
{id:'history-china-bronze',ch:7,title:'二里头与商朝青铜礼制',short:'二里头与商朝',en:'Erlitou and the Shang Dynasty',period:'约前1900—前1046年',c:HC.china,
 scenes:[
  hs('约前1900—前1046年','二里头宫城与殷墟甲骨','洛阳盆地出现二里头宫城与青铜爵；商王盘庚迁殷，甲骨文与大型青铜礼器成熟。',[[31.0,106.0],[39.5,119.5]],d=>{
    ha(d,'farCore',HC.china,{fillOpacity:.10});
    hp(d,'erlitou',{left:1});hp(d,'yinxu');
   },[['fill',HC.china,'东亚文明区（示意）'],['dot','#2a2018','二里头与晚商殷墟']])
 ]},
{id:'history-china-western-zhou',ch:7,title:'西周分封与宗法秩序',short:'西周分封与宗法',en:'The Western Zhou',period:'前1046—前771年',c:HC.china,
 scenes:[
  hs('前1046—前771年','武王克商、共和行政与犬戎破镐','前1046年牧野克商，周公东征分封诸侯；前841年共和行政开启确切纪年；前771年镐京陷落。',[[31.0,105.5],[39.5,120.5]],d=>{
    ha(d,'farCore',HC.china,{fillOpacity:.10});
    hp(d,'haojing',{kind:'battle',left:1,note:'西周王都；前841年国人暴动、共和行政，前771年被犬戎攻破。'});
    hp(d,'luoyi',{note:'周公东征后营建成周洛邑，镇抚东方。'});hp(d,'qufu');hp(d,'linzi');
   },[['fill',HC.china,'西周分封格局（示意）'],['dot',HC.war,'镐京（前771年陷落）'],['dot','#2a2018','成周与东方主要封国']])
 ]},
{id:'history-china-spring-autumn',ch:7,title:'春秋争霸与孔子时代',short:'春秋争霸与孔子',en:'Spring and Autumn Period',period:'前770—前453年',c:HC.china,
 scenes:[
  hs('前770—前453年','平王东迁、五霸迭兴与孔子讲学','周平王东迁洛邑，齐、晋、楚、吴、越先后争霸；孔子创私学、订六经；前453年三家分晋。',[[29.0,106.5],[39.5,121.0]],d=>{
    ha(d,'farCore',HC.china,{fillOpacity:.10});
    hp(d,'luoyi',{left:1,note:'前770年周平王东迁洛邑，东周开始。'});
    hp(d,'qufu',{left:1,note:'孔子（前551—前479年）在此创私学、整理古籍，与释迦牟尼、苏格拉底同处轴心时代。'});
    hp(d,'linzi',{note:'齐桓公任管仲改革，九合诸侯，首霸中原。'});
   },[['fill',HC.china,'春秋列国舞台（示意）'],['dot','#2a2018','王城、齐鲁重镇与孔子故里']])
 ]},
{id:'history-china-warring-states',ch:7,title:'战国变法与百家争鸣',short:'战国变法与百家争鸣',en:'Warring States Period',period:'前453—前221年',c:HC.china,
 scenes:[
  hs('前453—前221年','商鞅变法、百家争鸣与长平之战','七雄兼并，各国变法行郡县；前356年商鞅在秦变法，前260年长平之战；儒道墨法诸子争鸣。',[[30.0,105.5],[39.5,120.5]],d=>{
    ha(d,'farCore',HC.china,{fillOpacity:.10});
    hp(d,'xianyang',{left:1,note:'前350年秦迁都咸阳，商鞅废井田、行县制、立军功爵。'});
    hp(d,'changping',{kind:'battle',note:'前260年秦军在此击败赵军，坑赵卒四十万。'});
    hp(d,'linzi',{note:'齐都临淄稷下学宫汇聚孟子、荀子、邹衍等诸子学者。'});
   },[['fill',HC.china,'战国兼并舞台（示意）'],['dot',HC.war,'长平之战（前260年）'],['dot','#2a2018','变法与百家争鸣重镇']])
 ]},
{id:'history-china-qin',ch:7,title:'秦统一六国与楚汉相争',short:'秦统一与楚汉之际',en:'Qin Unification and Chu–Han Contention',period:'前221—前202年',c:HC.china,
 scenes:[
  hs('前221—前202年','书同文车同轨、陈胜起义与楚汉决战','前221年秦始皇灭六国称皇帝，全面推行郡县；前209年大泽乡起义，前202年刘邦击败项羽建汉。',[[29.5,105.5],[40.0,120.5]],d=>{
    ha(d,'farCore',HC.china,{fillOpacity:.12});
    hp(d,'xianyang',{kind:'battle',left:1,note:'前221年秦始皇定都于此，废分封、设郡县；前207年刘邦入关、项羽焚咸阳。'});
    hp(d,'changan',{note:'前202年刘邦击败项羽称帝，不久定都长安（同一年罗马在扎马击败汉尼拔）。'});
   },[['fill',HC.china,'秦与汉初版图核心（示意）'],['dot',HC.war,'咸阳（秦都）'],['dot','#2a2018','长安（西汉都城）']])
 ]},
{id:'history-china-western-han',ch:7,title:'西汉盛世与丝绸之路',short:'西汉与丝绸之路',en:'The Western Han',period:'前202—公元8年',c:HC.china,
 scenes:[
  hs('前202—公元8年','文景之治、汉武帝北伐与张骞凿空','汉初休养生息；汉武帝推恩削藩、独尊儒术、北击匈奴，张骞通西域；公元8年王莽代汉。',[[30.0,91.0],[42.5,118.0]],d=>{
    ha(d,'farCore',HC.china,{fillOpacity:.12});
    hp(d,'changan',{note:'西汉都城；汉武帝在此独尊儒术、主持北击匈奴，前138年派张骞出使西域。'});
    hp(d,'dunhuang',{left:1,note:'河西四郡最西端，丝绸之路通往西域与大夏（巴克特里亚）、安息的门户。'});
    hr(d,[[34.31,108.90],[36.0,103.8],[38.9,100.4],[40.14,94.66]],HC.route);
   },[['fill',HC.china,'西汉与河西走廊（示意）'],['dline',HC.route,'丝绸之路河西段（概略）'],['dot','#2a2018','都城与西域门户']])
 ]},
{id:'history-china-eastern-han',ch:7,title:'东汉王朝与豪族社会',short:'东汉与豪族社会',en:'The Eastern Han',period:'25—189年',c:HC.china,
 scenes:[
  hs('25—189年','光武中兴、班超通西域与黄巾起义','刘秀定都洛阳；窦宪北击北匈奴，班超派甘英出使大秦；后期外戚宦官交替专权，184年黄巾起义。',[[30.0,91.0],[42.5,118.5]],d=>{
    ha(d,'farCore',HC.china,{fillOpacity:.12});
    hp(d,'luoyi',{note:'25年刘秀定都洛阳；184年黄巾起义后州牧坐大，189年边帅董卓带兵进洛阳。'});
    hp(d,'dunhuang',{left:1,note:'班超由此经略西域三十余年，97年派甘英远赴大秦（罗马），抵达波斯湾。'});
   },[['fill',HC.china,'东汉核心区（示意）'],['dot','#2a2018','东汉都城洛阳与西域门户']])
 ]},
{id:'history-china-three-kingdoms',ch:7,title:'三国鼎立、西晋统一与永嘉之乱',short:'三国、西晋与永嘉之乱',en:'Three Kingdoms and Western Jin',period:'190—316年',c:HC.china,
 scenes:[
  hs('190—316年','官渡赤壁、三分归晋与永嘉南渡','200年官渡、208年赤壁定下魏蜀吴三分；280年西晋灭吴统一；八王之乱后五胡起兵，311年洛阳陷落。',[[28.0,106.5],[39.5,121.5]],d=>{
    ha(d,'farCore',HC.china,{fillOpacity:.12});
    hp(d,'guandu',{kind:'battle',note:'200年曹操在此击败袁绍。'});
    hp(d,'chibi',{kind:'battle',left:1,note:'208年孙刘联军在此击败曹操，形成三分之势。'});
    hp(d,'luoyi',{left:1,note:'曹魏与西晋都城；八王之乱后，311年永嘉之乱洛阳被匈奴汉国攻破。'});
    hp(d,'jiankang',{note:'孙吴都城建业；280年西晋灭吴于此。'});
   },[['fill',HC.china,'三国至西晋舞台（示意）'],['dot',HC.war,'官渡与赤壁古战场'],['dot','#2a2018','洛阳与建业']])
 ]},
{id:'history-china-sixteen-kingdoms',ch:7,title:'东晋十六国与南北朝对峙',short:'东晋十六国与南北朝',en:'Eastern Jin and Northern & Southern Dynasties',period:'317—476年',c:HC.china,
 scenes:[
  hs('317—476年','衣冠南渡、淝水之战与北魏统一北方','317年东晋建都建康；383年淝水之战东晋击退前秦；420年进入南北朝，439年北魏统一北方。',[[28.5,106.5],[42.0,121.5]],d=>{
    ha(d,'farCore',HC.china,{fillOpacity:.12});
    hp(d,'jiankang',{note:'317年衣冠南渡，东晋与南朝宋、齐、梁、陈相继定都于此（同时期罗马330年迁都君士坦丁堡）。'});
    hp(d,'pingcheng',{left:1,note:'北魏都城；439年太武帝灭北凉统一北方（同年汪达尔人攻占迦太基），471年起孝文帝改革。'});
    hp(d,'luoyi',{left:1,note:'北方混战的中心，493年北魏孝文帝自平城南迁于此。'});
   },[['fill',HC.china,'南北朝对峙格局（示意）'],['dot','#2a2018','北朝平城、洛阳与南朝建康']]),
  hs('404—446年','沙门拜不拜皇帝','东晋皇权弱，慧远主张沙门不拜王者；北魏皇权强，道人统拜皇帝为“当今如来”，太武帝下诏毁佛；中国皇权越来越强，宗教长不成跟皇帝讨价还价的力量。',[[26.5,104.0],[42.0,121.5]],d=>{
    ha(d,'farCore',HC.china,{fillOpacity:.12});
    hp(d,'pingcheng',{left:1,note:'北魏都城；道人统法果说太祖就是“当今如来”，见了皇帝就拜。'});
    hp(d,'changan',{kind:'battle',note:'446年太武帝在此一座寺里搜出兵器，随即下诏毁佛、坑杀沙门。'});
    hp(d,'jiankang',{note:'东晋都城；“王与马，共天下”，皇权弱，门阀强。'});
    hp(d,'lushan');
   },[['fill',HC.china,'南北朝对峙格局（示意）'],['dot',HC.war,'446年毁佛的起点'],['dot','#2a2018','北魏都城、东晋都城与慧远的庐山']])
 ]}

];
HISTORY_ENTRIES.forEach(e=>{
  const content=HISTORY_CONTENT[e.id];
  Object.assign(e,{kind:'history',html:content.html,sources:content.sources,moments:content.moments||[],boxes:content.boxes||[],view:e.scenes[0].view,
    hide:['med',...(e.hideBase||[])],sub:e.period});
});

const HISTORY_ERAS=[
 {id:'prehistory',name:'史前时期',en:'Prehistory',date:'距今约7万年—前4000年',c:HC.route,items:[['history-migration',0,1],['history-farming',0,0,'农业与定居']]},
 {id:'bronze',name:'早期国家与青铜时代',en:'Early States & Bronze Age',date:'约前4000—前1200年',c:HC.mino,items:[['history-farming',1,1,'城市与早期王权'],['history-palaces'],['history-collapse']]},
 {id:'iron',name:'早期铁器时代',en:'Early Iron Age',date:'约前1200—前800年',c:HC.myc,items:[['history-dark-age',0,0,'希腊的延续与复苏']]},
 {id:'archaic',name:'古风时期',en:'Archaic Greece',date:'约前800—前480年',c:HC.sparta,items:[['history-poleis'],['history-sparta'],['history-athens'],['history-persian-wars',0,2,'从起义到马拉松']]},
 {id:'classical',name:'古典时期',en:'Classical Greece',date:'前480—前323年',c:HC.athens,items:[['history-persian-wars',3,5,'萨拉米斯与战后转折'],['history-leagues'],['history-peloponnesian-war'],['history-spartan-decline'],['history-macedonian-rise'],['history-alexander-conquest'],['history-alexander-rule']]},
 {id:'hellenistic',name:'希腊化时期',en:'Hellenistic World',date:'前323—前30年',c:HC.thebes,items:[['history-successors'],['history-hellenistic-states'],['history-hellenistic-knowledge'],['history-celts'],['history-eastern-kingdoms'],['history-spartan-reforms'],['history-ptolemaic-bargain'],['history-hellenistic-end']]},
 {id:'rome-rise',name:'罗马：王政与共和',en:'Early Rome',date:'约前1000—前264年',c:HC.rome,items:[['history-rome-site'],['history-rome-kings'],['history-rome-republic'],['history-rome-plebs'],['history-rome-orders'],['history-rome-mature']]},
 {id:'rome-med',name:'罗马：称霸地中海',en:'Rome & the Mediterranean',date:'前264—前133年',c:HC.rome,items:[['history-rome-punic'],['history-rome-east']]},
 {id:'rome-fall',name:'罗马：共和崩解',en:'The Fall of the Republic',date:'前133—前27年',c:HC.rome,items:[['history-rome-gracchi'],['history-rome-marius'],['history-rome-social'],['history-rome-sulla'],['history-rome-pompey'],['history-rome-triumvirate'],['history-rome-caesar'],['history-rome-augustus']]},
 {id:'empire-principate',name:'罗马帝国：元首制',en:'The Principate',date:'前27—192年',c:HC.rome,items:[['history-empire-principate'],['history-empire-julio-claudian'],['history-empire-flavian'],['history-empire-antonine']]},
 {id:'empire-crisis',name:'罗马帝国：危机与重铸',en:'Crisis and Reinvention',date:'193—363年',c:HC.rome,items:[['history-empire-crisis'],['history-empire-dominate'],['history-empire-constantine']]},
 {id:'empire-west',name:'罗马帝国：西部的终结',en:'The End in the West',date:'364—476年',c:HC.rome,items:[['history-empire-theodosius'],['history-empire-west-fall']]},
 {id:'empire-east',name:'罗马帝国：东部撑住了',en:'The East Holds',date:'395—450年',c:HC.rome,items:[['history-empire-arcadius'],['history-empire-theodosius-ii']]},
 {id:'faith-israel',name:'古代以色列',en:'Ancient Israel',date:'约前1400—前538年',c:HC.faith,items:[['history-faith-israel'],['history-faith-first-temple']]},
 {id:'faith-temple',name:'第二圣殿时期',en:'The Second Temple',date:'前538—公元73年',c:HC.faith,items:[['history-faith-second-temple'],['history-faith-jesus']]},
 {id:'faith-church',name:'早期教会',en:'The Early Church',date:'73—451年',c:HC.faith,items:[['history-faith-church'],['history-faith-empire-church'],['history-faith-councils'],['history-faith-two-cities']]},
 {id:'china-early',name:'先秦：三代与春秋战国',en:'Pre-Imperial China',date:'约前7000—前221年',c:HC.china,items:[['history-china-neolithic'],['history-china-bronze'],['history-china-western-zhou'],['history-china-spring-autumn'],['history-china-warring-states']]},
 {id:'china-qin-han',name:'秦汉帝国',en:'Qin and Han Empires',date:'前221—公元189年',c:HC.china,items:[['history-china-qin'],['history-china-western-han'],['history-china-eastern-han']]},
 {id:'china-six-dynasties',name:'三国两晋南北朝',en:'Six Dynasties',date:'190—476年',c:HC.china,items:[['history-china-three-kingdoms'],['history-china-sixteen-kingdoms']]}
];
/* History as a tree: each branch is a topic; distance from the root is time (years, negative = BCE).
   Reading order stays with HISTORY_ERAS; TREE_ROWS puts each era row on a branch at its start and end. */
const HISTORY_BRANCHES=[
 {id:'trunk',name:'希腊主线',en:'Greek world',lane:2},
 // The 基督教 line: from the Hebrews' nomadic origins (the old Levant branch) to the church of the empire; on its own lane, right of the West.
 {id:'faith',name:'基督教',en:'Judaism & Christianity',lane:5,parent:'trunk',from:-1400,to:451,c:HC.faith},
 {id:'rome',name:'罗马',en:'Rome',lane:3,parent:'trunk',from:-1000,to:450,c:HC.rome},
 {id:'ptolemaic',name:'托勒密埃及',en:'Ptolemaic Egypt',lane:1,parent:'trunk',from:-305,to:-30,c:HC.mino},
 {id:'seleucid',name:'塞琉古与东方',en:'Seleucids & the East',lane:0,parent:'trunk',from:-305,to:-64,c:HC.parthia},
 // 395: the empire splits for good; the West forks off and ends in 476, the Roman line itself goes on in the East.
 {id:'west',name:'西罗马',en:'Western Empire',lane:4,parent:'rome',from:395,to:476,c:HC.rome},
 // Parallel timeline of China for cross-civilizational comparison.
 {id:'china',name:'中国',en:'China',lane:6,from:-7000,to:476,c:HC.china}
];
// Trunk colour follows the chapter: 上古, 城邦, 马其顿与帝国, 希腊化世界, 罗马, 罗马帝国, 基督教, 中国对照.
const TREE_CH_COLORS=['#7d6b50',HC.athens,HC.macedon,HC.thebes,HC.rome,HC.rome,HC.faith,HC.china];
const TREE_ROWS={
 'history-migration/0':['trunk',-68000,-38000],
 'history-farming/0':['trunk',-10000,-6000],
 'history-farming/1':['trunk',-4000,-3100],
 'history-palaces/0':['trunk',-1900,-1100],
 'history-collapse/0':['trunk',-1274,-1100],
 'history-dark-age/0':['trunk',-1100,-800],
 'history-poleis/0':['trunk',-800,-600],
 'history-sparta/0':['trunk',-730,-500],
 'history-athens/0':['trunk',-621,-508],
 'history-persian-wars/0':['trunk',-499,-490],
 'history-persian-wars/3':['trunk',-480,-449],
 'history-leagues/0':['trunk',-478,-431],
 'history-peloponnesian-war/0':['trunk',-460,-404],
 'history-spartan-decline/0':['trunk',-404,-362],
 'history-macedonian-rise/0':['trunk',-359,-335],
 'history-alexander-conquest/0':['trunk',-334,-325],
 'history-alexander-rule/0':['trunk',-332,-324],
 'history-successors/0':['trunk',-323,-270],
 'history-hellenistic-states/0':['trunk',-300,-201],
 'history-hellenistic-knowledge/0':['trunk',-300,-212],
 'history-celts/0':['trunk',-279,-230],
 'history-eastern-kingdoms/0':['seleucid',-250,-141],
 'history-spartan-reforms/0':['trunk',-245,-222],
 'history-ptolemaic-bargain/0':['ptolemaic',-217,-186],
 'history-hellenistic-end/0':['trunk',-200,-30],
 'history-rome-site/0':['rome',-1000,-600],
 'history-rome-kings/0':['rome',-753,-509],
 'history-rome-republic/0':['rome',-509,-493],
 'history-rome-plebs/0':['rome',-494,-449],
 'history-rome-orders/0':['rome',-445,-367],
 'history-rome-mature/0':['rome',-340,-264],
 'history-rome-punic/0':['rome',-264,-201],
 'history-rome-east/0':['rome',-200,-133],
 'history-rome-gracchi/0':['rome',-133,-121],
 'history-rome-marius/0':['rome',-112,-100],
 'history-rome-social/0':['rome',-91,-88],
 'history-rome-sulla/0':['rome',-88,-78],
 'history-rome-pompey/0':['rome',-83,-62],
 'history-rome-triumvirate/0':['rome',-63,-50],
 'history-rome-caesar/0':['rome',-49,-44],
 'history-rome-augustus/0':['rome',-44,-27],
 'history-empire-principate/0':['rome',-27,14],
 'history-empire-julio-claudian/0':['rome',14,68],
 'history-empire-flavian/0':['rome',68,96],
 'history-empire-antonine/0':['rome',96,192],
 'history-empire-crisis/0':['rome',193,284],
 'history-empire-dominate/0':['rome',284,305],
 'history-empire-constantine/0':['rome',305,363],
 'history-empire-theodosius/0':['rome',364,395],
 'history-empire-west-fall/0':['west',395,476],
 'history-empire-arcadius/0':['rome',395,408],
 'history-empire-theodosius-ii/0':['rome',408,450],
 'history-faith-israel/0':['faith',-1400,-1200],
 'history-faith-first-temple/0':['faith',-1200,-538],
 'history-faith-second-temple/0':['faith',-538,-4],
 'history-faith-jesus/0':['faith',-4,73],
 'history-faith-church/0':['faith',73,311],
 'history-faith-empire-church/0':['faith',312,394],
 'history-faith-councils/0':['faith',318,381],
 'history-faith-two-cities/0':['faith',410,451],
 'history-china-neolithic/0':['china',-7000,-1900],
 'history-china-bronze/0':['china',-1850,-1046],
 'history-china-western-zhou/0':['china',-1046,-771],
 'history-china-spring-autumn/0':['china',-770,-453],
 'history-china-warring-states/0':['china',-453,-221],
 'history-china-qin/0':['china',-221,-202],
 'history-china-western-han/0':['china',-195,8],
 'history-china-eastern-han/0':['china',25,189],
 'history-china-three-kingdoms/0':['china',190,316],
 'history-china-sixteen-kingdoms/0':['china',317,476]
};
// Topics still to be written grow the tree as dashed shoots.
const TREE_FUTURE=[['rome',450,'东罗马','450年起 · 马尔西安以后 · 到1453年 · 待展开'],['west',476,'中世纪西欧','476年起 · 待展开'],['faith',451,'中世纪教会','451年起 · 待展开'],['china',476,'隋唐','476年起 · 南北朝至隋唐 · 待展开']];
function historyEra(e,scene=0){return HISTORY_ERAS.find(era=>era.items.some(([id,from=0,to=Infinity])=>id===e.id&&scene>=from&&scene<=to));}
