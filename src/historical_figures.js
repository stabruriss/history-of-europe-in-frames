/* Brief lives; dated appearances carry the story forward. */
const FIGURE_PLACES={
  "athens": {
    "name": "雅典",
    "en": "Athens",
    "ll": [
      37.975,
      23.727
    ],
    "view": [
      [
        37.55,
        23.23
      ],
      [
        38.45,
        24.3
      ]
    ],
    "note": "雅典：公民政治与哲学活动汇集之地。"
  },
  "cyrene": {
    "name": "昔兰尼",
    "en": "Cyrene",
    "ll": [
      32.82,
      21.86
    ],
    "note": "阿里斯提卜的家乡与昔兰尼学派的地理背景。"
  },
  "corinth": {
    "name": "科林斯",
    "en": "Corinth",
    "ll": [
      37.906,
      22.879
    ],
    "note": "科林斯：第欧根尼生平传统中的活动城市。"
  },
  "lesbos": {
    "name": "莱斯博斯岛",
    "en": "Lesbos",
    "ll": [
      39.15,
      26.15
    ],
    "note": "亚里士多德与泰奥弗拉斯托斯开展自然研究的岛屿背景。"
  },
  "mieza": {
    "name": "米埃扎",
    "en": "Mieza",
    "ll": [
      40.643,
      22.12
    ],
    "note": "米埃扎：马其顿王子的受教地点。"
  },
  "trapezus": {
    "name": "特拉佩祖斯",
    "en": "Trapezus / Trabzon",
    "ll": [
      41.005,
      39.726
    ],
    "note": "万人军撤退抵达的黑海港口。"
  },
  "bactra": {
    "name": "巴克特里亚",
    "en": "Bactria",
    "ll": [
      36.75,
      66.9
    ],
    "view": [
      [
        34.5,
        64
      ],
      [
        40,
        70
      ]
    ],
    "note": "前327年宫廷冲突发生的区域背景；定位巴克特拉一带。"
  },
  "opis": {
    "name": "奥皮斯附近",
    "en": "Opis",
    "ll": [
      33.19,
      44.54
    ],
    "note": "底格里斯河畔，前324年军队抗议与和解的地点；位置为概略标注。"
  },
  "chalcis": {
    "name": "卡尔基斯",
    "en": "Chalcis",
    "ll": [
      38.463,
      23.593
    ],
    "note": "优卑亚岛上的城市，亚里士多德前322年在此去世。"
  },
  "alexandria": {
    "name": "亚历山大里亚",
    "en": "Alexandria",
    "ll": [
      31.2,
      29.92
    ],
    "note": "托勒密都城：王室资助学术，港口汇集人口、物资与知识。"
  },
  "delphi": {
    "name": "德尔斐",
    "en": "Delphi",
    "ll": [
      38.48,
      22.5
    ],
    "note": "前279年凯尔特军队深入希腊，布伦努斯在德尔斐附近受挫。"
  },
  "pergamon": {
    "name": "帕加马",
    "en": "Pergamon",
    "ll": [
      39.12,
      27.18
    ],
    "note": "阿塔罗斯王朝把战争胜利与纪念建筑结合，经营保护者形象。"
  },
  "sparta": {
    "name": "斯巴达",
    "en": "Sparta",
    "ll": [
      37.074,
      22.43
    ],
    "note": "重新分地、取消债务与扩充公民军，在这里成为同一场权力斗争。"
  },
  "sellasia": {
    "name": "塞拉西亚",
    "en": "Sellasia",
    "ll": [
      37.23,
      22.42
    ],
    "note": "前222年斯巴达战败，克里昂米尼逃往埃及。"
  },
  "memphis": {
    "name": "孟菲斯",
    "en": "Memphis",
    "ll": [
      29.85,
      31.25
    ],
    "note": "前196年祭司会议颁布诏令；罗塞塔石碑保存了其中一份。"
  },
  "syracuse": {
    "name": "叙拉古",
    "en": "Syracuse",
    "ll": [
      37.06,
      15.29
    ],
    "note": "阿基米德在这里研究并参与守城，前212年城破时被杀。"
  },
  "seleucia": {
    "name": "塞琉西亚",
    "en": "Seleucia on the Tigris",
    "ll": [
      33.1,
      44.52
    ],
    "note": "前141年进入帕提亚控制，两河税源与城市网络转入新王朝。"
  },
  "rome": {
    "name": "罗马",
    "en": "Rome",
    "ll": [
      41.893,
      12.483
    ],
    "view": [
      [
        41.7,
        12.25
      ],
      [
        42.05,
        12.75
      ]
    ],
    "note": "罗马城：七丘、广场与台伯岛渡口。"
  },
  "gabii": {
    "name": "加比伊",
    "en": "Gabii",
    "ll": [
      41.886,
      12.718
    ],
    "note": "罗马以东的拉丁城市；傲慢者塔克文的儿子在此夺权。"
  },
  "cumae": {
    "name": "库迈",
    "en": "Cumae",
    "ll": [
      40.848,
      14.054
    ],
    "note": "坎帕尼亚的希腊城市；傲慢者塔克文流亡至死的地方。"
  },
  "veii": {
    "name": "维爱",
    "en": "Veii",
    "ll": [
      42.024,
      12.401
    ],
    "note": "伊特鲁里亚大城，前396年被卡米卢斯攻破。"
  },
  "carthage": {
    "name": "迦太基",
    "en": "Carthage",
    "ll": [
      36.853,
      10.323
    ],
    "note": "迦太基：提尔人建立的海上强国，前146年被罗马焚毁。"
  },
  "liternum": {
    "name": "利特尔农",
    "en": "Liternum",
    "ll": [
      40.92,
      14.03
    ],
    "note": "坎帕尼亚海边的小殖民地，大西庇阿晚年隐居、死后葬在这里。"
  },
  "cirta": {
    "name": "锡尔塔",
    "en": "Cirta",
    "ll": [
      36.365,
      6.614
    ],
    "note": "努米底亚的都城，今阿尔及利亚君士坦丁。"
  },
  "sinope": {
    "name": "锡诺普",
    "en": "Sinope",
    "ll": [
      42.03,
      35.15
    ],
    "note": "本都王国的都城，黑海南岸的港口。"
  },
  "capua": {
    "name": "卡普阿",
    "en": "Capua",
    "ll": [
      41.08,
      14.25
    ],
    "note": "坎帕尼亚大城，城里有罗马最有名的角斗士学校。"
  },
  "puteoli": {
    "name": "普特奥利",
    "en": "Puteoli",
    "ll": [
      40.823,
      14.122
    ],
    "note": "坎帕尼亚海边的港城，苏拉晚年隐居在附近。"
  },
  "utica": {
    "name": "乌提卡",
    "en": "Utica",
    "ll": [
      37.057,
      10.06
    ],
    "note": "阿非利加行省的首府，小加图自尽之地。"
  },
  "pelusium": {
    "name": "佩卢西乌姆",
    "en": "Pelusium",
    "ll": [
      31.04,
      32.55
    ],
    "note": "埃及东北门户；前48年庞培在附近海滩被杀。"
  },
  "carrhae": {
    "name": "卡莱",
    "en": "Carrhae",
    "ll": [
      36.87,
      39.03
    ],
    "note": "两河北部的城，前53年克拉苏兵败身死之地。"
  },
  "formiae": {
    "name": "福尔米亚",
    "en": "Formiae",
    "ll": [
      41.256,
      13.606
    ],
    "note": "拉丁姆海边的别墅区，西塞罗遇害之地。"
  },
  "philippi": {
    "name": "腓立比",
    "en": "Philippi",
    "ll": [
      41.01,
      24.285
    ],
    "note": "马其顿东部的城，前42年布鲁图斯、卡西乌斯兵败自尽之地。"
  },
  "circeii": {
    "name": "基尔凯伊",
    "en": "Circeii",
    "ll": [
      41.235,
      13.09
    ],
    "note": "拉丁姆海角上的小城，雷必达被软禁终老之地。"
  },
  "panticapaeum": {
    "name": "潘提卡彭",
    "en": "Panticapaeum",
    "ll": [
      45.35,
      36.47
    ],
    "note": "刻赤海峡边的城，米特拉达梯六世死在这里。"
  },
  "actium": {
    "name": "阿克提乌姆",
    "en": "Actium",
    "ll": [
      38.94,
      20.77
    ],
    "note": "希腊西海岸的海角，前31年海战之地。"
  },
  "pandateria": {
    "name": "潘达特里亚",
    "en": "Pandateria",
    "ll": [
      40.79,
      13.43
    ],
    "note": "第勒尼安海上的小岛，今文托泰内；奥古斯都的女儿尤利娅流放于此。"
  },
  "rhodes": {
    "name": "罗得岛",
    "en": "Rhodes",
    "ll": [
      36.44,
      28.22
    ],
    "note": "提比略负气闲居七年的岛。"
  },
  "lugdunum": {
    "name": "卢格杜努姆",
    "en": "Lugdunum",
    "ll": [
      45.76,
      4.83
    ],
    "note": "高卢的首府，今里昂。"
  },
  "colonia": {
    "name": "科隆",
    "en": "Colonia Agrippinensis",
    "ll": [
      50.94,
      6.96
    ],
    "note": "莱茵河边的大城。"
  },
  "carnuntum": {
    "name": "卡农图姆",
    "en": "Carnuntum",
    "ll": [
      48.11,
      16.86
    ],
    "note": "多瑙河边的军团大营，在今维也纳以东。"
  },
  "leptis": {
    "name": "大莱普提斯",
    "en": "Leptis Magna",
    "ll": [
      32.64,
      14.29
    ],
    "note": "北非的海港城市，在今利比亚。"
  },
  "emesa": {
    "name": "埃米萨",
    "en": "Emesa",
    "ll": [
      34.73,
      36.71
    ],
    "note": "叙利亚城市，太阳神埃拉伽巴尔的圣城，今霍姆斯。"
  },
  "palmyra": {
    "name": "帕尔米拉",
    "en": "Palmyra",
    "ll": [
      34.55,
      38.27
    ],
    "note": "叙利亚沙漠里的绿洲商城。"
  },
  "salona": {
    "name": "萨洛纳",
    "en": "Salona",
    "ll": [
      43.54,
      16.48
    ],
    "note": "达尔马提亚首府；附近海边的戴克里先宫，就是今天的斯普利特老城。"
  },
  "nicomedeia": {
    "name": "尼科米底亚",
    "en": "Nicomedia",
    "ll": [
      40.77,
      29.92
    ],
    "note": "马尔马拉海东头的城市，戴克里先的驻地。"
  },
  "constantinople": {
    "name": "君士坦丁堡",
    "en": "Constantinople",
    "ll": [
      41.01,
      28.98
    ],
    "note": "原名拜占庭，330年起为新都。"
  },
  "mediolanum": {
    "name": "米兰",
    "en": "Mediolanum",
    "ll": [
      45.46,
      9.19
    ],
    "note": "四世纪西部皇帝常驻的城市。"
  },
  "hippo": {
    "name": "希波",
    "en": "Hippo Regius",
    "ll": [
      36.88,
      7.75
    ],
    "note": "北非港口城市，今阿尔及利亚安纳巴。"
  },
  "ravenna": {
    "name": "拉文纳",
    "en": "Ravenna",
    "ll": [
      44.42,
      12.2
    ],
    "note": "沼泽环绕的港城，402年起西罗马皇帝驻此。"
  },
  "nola": {
    "name": "诺拉",
    "en": "Nola",
    "ll": [
      40.93,
      14.53
    ],
    "note": "坎帕尼亚的小城，奥古斯都和他父亲都死在这里。"
  },
  "teutoburg": {
    "name": "条顿堡森林",
    "en": "Teutoburg Forest",
    "ll": [
      52.41,
      8.13
    ],
    "note": "战场定在今德国奥斯纳布吕克以北的卡尔克里泽一带，1987年起陆续出土罗马钱币和兵器。"
  },
  "albapompeia": {
    "name": "阿尔巴·庞培亚",
    "en": "Alba Pompeia",
    "ll": [
      44.7,
      8.03
    ],
    "note": "利古里亚的小城，今皮埃蒙特的阿尔巴。"
  },
  "italica": {
    "name": "意大利卡",
    "en": "Italica",
    "ll": [
      37.44,
      -6.05
    ],
    "note": "西班牙南部的罗马殖民城，今塞维利亚附近。"
  },
  "antinoopolis": {
    "name": "安提诺波利斯",
    "en": "Antinoopolis",
    "ll": [
      27.81,
      30.88
    ],
    "note": "尼罗河中游东岸，130年哈德良为纪念安提诺乌斯所建。"
  },
  "thessalonica": {
    "name": "帖撒罗尼迦",
    "en": "Thessalonica",
    "ll": [
      40.64,
      22.94
    ],
    "note": "马其顿的海港大城，伽列里乌斯的驻地，留有他的凯旋门。"
  },
  "jerusalem": {
    "name": "耶路撒冷",
    "en": "Jerusalem",
    "ll": [
      31.778,
      35.235
    ],
    "note": "135年后改建为罗马城埃利亚·卡皮托利纳；君士坦丁时修起圣墓教堂。"
  },
  "caesarea": {
    "name": "凯撒里亚",
    "en": "Caesarea Maritima",
    "ll": [
      32.5,
      34.89
    ],
    "note": "巴勒斯坦行省的首府，希律王修的海港。"
  },
  "treveri": {
    "name": "特里尔",
    "en": "Augusta Treverorum",
    "ll": [
      49.75,
      6.64
    ],
    "note": "莱茵河防线后方的皇城，君士坦丁早年的驻地。"
  },
  "pola": {
    "name": "波拉",
    "en": "Pola",
    "ll": [
      44.87,
      13.85
    ],
    "note": "伊斯特里亚半岛南端的港城，今克罗地亚普拉。"
  },
  "tarsus": {
    "name": "塔尔苏斯",
    "en": "Tarsus",
    "ll": [
      36.918,
      34.892
    ],
    "note": "小亚细亚南部的大城，保罗的家乡。"
  },
  "horeb": {
    "name": "传统西奈山（何烈山）",
    "en": "Traditional Mount Sinai (Horeb)",
    "ll": [
      28.539,
      33.975
    ],
    "note": "杰贝勒穆萨，传统定为摩西领受十诫的山；不是已证实的地点。"
  },
  "amarna": {
    "name": "阿玛尔纳",
    "en": "Amarna (Akhetaten)",
    "ll": [
      27.65,
      30.9
    ],
    "note": "阿赫那吞在中埃及新建的都城“阿顿的地平线”，他死后不久就被放弃。"
  },
  "capernaum": {
    "name": "迦百农",
    "en": "Capernaum",
    "ll": [
      32.881,
      35.575
    ],
    "note": "加利利海北岸的渔村，彼得的家在这里。"
  },
  "nicaea": {
    "name": "尼西亚",
    "en": "Nicaea",
    "ll": [
      40.43,
      29.72
    ],
    "note": "比提尼亚的湖边城市，今土耳其伊兹尼克；325年第一次大公会议在此召开。"
  },
  "colzim": {
    "name": "安东尼山",
    "en": "Mount Colzim",
    "ll": [
      28.925,
      32.348
    ],
    "note": "红海边的山，安东尼晚年在此隐修四十多年，山脚的圣安东尼修道院至今还在。"
  },
  "kharga": {
    "name": "大绿洲",
    "en": "Great Oasis",
    "ll": [
      25.44,
      30.56
    ],
    "note": "埃及西部沙漠里的绿洲，今哈里杰；聂斯托利435年被流放到这里。"
  },
  "nazianzus": {
    "name": "纳齐安",
    "en": "Nazianzus",
    "ll": [
      38.4,
      34.35
    ],
    "note": "卡帕多西亚的小城，格列高利的父亲在此任主教。"
  },
  "comana": {
    "name": "科马纳",
    "en": "Comana Pontica",
    "ll": [
      40.36,
      36.62
    ],
    "note": "本都的小城，今土耳其托卡特附近；407年金口约翰死在城外一座殉道者小堂里。"
  },
  "toletum": {
    "name": "托莱多",
    "en": "Toledo",
    "ll": [
      39.857,
      -4.024
    ],
    "note": "西哥特王国后期的都城。"
  },
  "tours": {
    "name": "图尔",
    "en": "Tours",
    "ll": [
      47.394,
      0.685
    ],
    "note": "圣马丁的城；格雷戈里在此当主教，写《法兰克人史》。"
  },
  "giza": {
    "name": "吉萨",
    "en": "Giza",
    "ll": [
      29.979,
      31.134
    ],
    "note": "胡夫的大金字塔和工人村所在。"
  },
  "saqqara": {
    "name": "萨卡拉",
    "en": "Saqqara",
    "ll": [
      29.871,
      31.216
    ],
    "note": "孟菲斯的王家墓地，左塞尔的阶梯金字塔在这里。"
  },
  "semna": {
    "name": "塞姆纳",
    "en": "Semna",
    "ll": [
      21.49,
      30.96
    ],
    "note": "第二瀑布以南的要塞，森沃斯雷特三世的界碑立在这里。"
  },
  "avaris": {
    "name": "阿瓦里斯",
    "en": "Avaris",
    "ll": [
      30.787,
      31.821
    ],
    "note": "喜克索斯人的都城；雅赫摩斯攻下后在此修王宫。"
  },
  "deirelbahari": {
    "name": "代尔拜赫里",
    "en": "Deir el-Bahari",
    "ll": [
      25.738,
      32.607
    ],
    "note": "底比斯西岸的山崖下，哈特谢普苏特的神殿在这里。"
  },
  "piramesses": {
    "name": "培尔-拉美西斯",
    "en": "Pi-Ramesses",
    "ll": [
      30.8,
      31.83
    ],
    "note": "拉美西斯二世在东三角洲建的新都，靠近旧日的阿瓦里斯。"
  },
  "napata": {
    "name": "纳帕塔",
    "en": "Napata",
    "ll": [
      18.535,
      31.828
    ],
    "note": "第四瀑布下游巴卡尔山脚的阿蒙圣地，库施王国的都城。"
  },
  "susa": {
    "name": "苏萨",
    "en": "Susa",
    "ll": [
      32.19,
      48.25
    ],
    "note": "埃兰的都城，后来是阿契美尼德的王都之一。"
  },
  "ecbatana": {
    "name": "埃克巴坦那",
    "en": "Ecbatana",
    "ll": [
      34.8,
      48.52
    ],
    "note": "米底的都城，今伊朗哈马丹。"
  },
  "nineveh": {
    "name": "尼尼微",
    "en": "Nineveh",
    "ll": [
      36.36,
      43.15
    ],
    "note": "亚述的都城，前612年被米底与巴比伦攻破。"
  },
  "pasargadae": {
    "name": "帕萨尔加德",
    "en": "Pasargadae",
    "ll": [
      30.194,
      53.167
    ],
    "note": "居鲁士在法尔斯新建的都城，他的陵墓在此。"
  },
  "babylon": {
    "name": "巴比伦",
    "en": "Babylon",
    "ll": [
      32.54,
      44.42
    ],
    "note": "两河的大城，前539年归波斯。"
  },
  "persepolis": {
    "name": "波斯波利斯",
    "en": "Persepolis",
    "ll": [
      29.93,
      52.89
    ],
    "note": "大流士在法尔斯兴建的王宫与库房。"
  },
  "behistun": {
    "name": "贝希斯敦",
    "en": "Behistun",
    "ll": [
      34.39,
      47.44
    ],
    "note": "大流士刻下三语铭文的山崖。"
  },
  "euphrates": {
    "name": "幼发拉底河上游",
    "en": "Upper Euphrates",
    "ll": [
      37.4,
      38.4
    ],
    "note": "安息与罗马的界河一带。"
  },
  "bishapur": {
    "name": "比沙普尔",
    "en": "Bishapur",
    "ll": [
      29.78,
      51.57
    ],
    "note": "沙普尔一世在法尔斯新建的城，270年他病死于此。"
  },
  "gundeshapur": {
    "name": "贡德沙普尔",
    "en": "Gundeshapur",
    "ll": [
      32.28,
      48.52
    ],
    "note": "沙普尔一世安置罗马战俘的新城，在胡齐斯坦。"
  },
  "ctesiphon": {
    "name": "泰西封",
    "en": "Ctesiphon",
    "ll": [
      33.09,
      44.58
    ],
    "note": "安息和萨珊的王都，在底格里斯河东岸。"
  },
  "chalcedon": {
    "name": "卡尔西顿",
    "en": "Chalcedon",
    "ll": [
      40.984,
      29.027
    ],
    "note": "博斯普鲁斯海峡东岸，与君士坦丁堡隔水相望。"
  },
  "edessa": {
    "name": "埃德萨",
    "en": "Edessa",
    "ll": [
      37.16,
      38.79
    ],
    "note": "上美索不达米亚的叙利亚语大城，今土耳其尚勒乌尔法。"
  },
  "i_amorion": {
    "name": "阿莫里翁",
    "en": "Amorion",
    "ll": [
      39.02,
      31.29
    ],
    "note": "安纳托利亚军区的重镇；741年君士坦丁五世逃到这里。"
  },
  "v_dara": {
    "name": "达拉",
    "en": "Dara",
    "ll": [
      37.18,
      40.95
    ],
    "note": "罗马在两河边境的要塞，正对波斯的尼西比斯。"
  },
  "v_tiflis": {
    "name": "第比利斯",
    "en": "Tiflis",
    "ll": [
      41.69,
      44.8
    ],
    "note": "格鲁吉亚（伊比利亚）的中心城市，今格鲁吉亚首都。"
  },
  "v_arabissus": {
    "name": "阿拉比苏斯",
    "en": "Arabissus",
    "ll": [
      38.205,
      36.92
    ],
    "note": "卡帕多西亚小城，莫里斯的出生地，今土耳其阿夫辛。"
  },
  "w_metz": {
    "name": "梅斯",
    "en": "Metz",
    "ll": [
      49.12,
      6.177
    ],
    "note": "奥斯特拉西亚的都城，布伦希尔德在此成婚、掌权。"
  },
  "w_saintdenis": {
    "name": "圣但尼",
    "en": "Saint-Denis",
    "ll": [
      48.936,
      2.36
    ],
    "note": "巴黎北郊的修道院，法兰克国王的葬地；丕平在此受教育、受教宗涂油。"
  },
  "w_soissons": {
    "name": "苏瓦松",
    "en": "Soissons",
    "ll": [
      49.381,
      3.323
    ],
    "note": "751年丕平在此被推举为王、涂油。"
  },
  "w_ponthion": {
    "name": "蓬蒂翁",
    "en": "Ponthion",
    "ll": [
      48.765,
      4.73
    ],
    "note": "马恩河畔的王室庄园；754年丕平在此迎接翻山而来的教宗。"
  },
  "w_aachen": {
    "name": "亚琛",
    "en": "Aachen",
    "ll": [
      50.776,
      6.084
    ],
    "note": "有温泉的王宫，查理曼晚年常住，死后葬在宫中礼拜堂。"
  },
  "merv": {
    "name": "木鹿",
    "en": "Merv",
    "ll": [
      37.66,
      62.19
    ],
    "note": "呼罗珊的绿洲大城；651年伊嗣俟三世死在城外。"
  },
  "changan": {
    "name": "长安",
    "en": "Chang’an",
    "ll": [
      34.31,
      108.9
    ],
    "note": "隋唐的都城，今陕西西安。"
  }
};
const FIGURES={
  "socrates": {
    "name": "苏格拉底",
    "en": "Socrates",
    "life": "约前469—前399年",
    "relation": "柏拉图的老师",
    "main": true,
    "place": "athens",
    "bio": "以问答追问德性与正义，不著书。",
    "sources": [
      [
        "斯坦福哲学百科 · 苏格拉底",
        "https://plato.stanford.edu/entries/socrates/"
      ],
      [
        "柏拉图《申辩篇》· Apology",
        "https://classics.mit.edu/Plato/apology.html"
      ],
      [
        "柏拉图《斐多篇》· Phaedo",
        "https://classics.mit.edu/Plato/phaedo.html"
      ]
    ]
  },
  "plato": {
    "name": "柏拉图",
    "en": "Plato",
    "life": "约前427—前347年",
    "relation": "苏格拉底的学生 · 亚里士多德的老师",
    "main": true,
    "place": "athens",
    "bio": "以对话录探索知识与政治，著有《理想国》（Republic）。",
    "sources": [
      [
        "哲学网络百科 · 柏拉图",
        "https://iep.utm.edu/plato/"
      ],
      [
        "哲学网络百科 · 柏拉图学园",
        "https://iep.utm.edu/plato-academy/"
      ]
    ]
  },
  "aristotle": {
    "name": "亚里士多德",
    "en": "Aristotle",
    "life": "前384—前322年",
    "relation": "柏拉图的学生 · 吕刻昂创办者",
    "main": true,
    "place": "athens",
    "bio": "研究逻辑、生命与政体，把比较和分类带进哲学。",
    "sources": [
      [
        "斯坦福哲学百科 · 亚里士多德",
        "https://plato.stanford.edu/entries/aristotle/"
      ]
    ]
  },
  "protagoras": {
    "name": "普罗泰戈拉",
    "en": "Protagoras",
    "life": "约前490—前420年",
    "relation": "同代思想人物 · 智者",
    "place": "athens",
    "bio": "智者（Sophist），教授论辩，提出“人是万物的尺度”。",
    "sources": [
      [
        "哲学网络百科 · 普罗泰戈拉",
        "https://iep.utm.edu/protagor/"
      ]
    ]
  },
  "gorgias": {
    "name": "高尔吉亚",
    "en": "Gorgias",
    "life": "约前483—前375年",
    "relation": "同代思想人物 · 修辞家",
    "place": "athens",
    "bio": "来自莱昂蒂尼（Leontini），以语言的说服力著称。",
    "sources": [
      [
        "哲学网络百科 · 高尔吉亚",
        "https://iep.utm.edu/gorgias/"
      ]
    ]
  },
  "xenophon": {
    "name": "色诺芬",
    "en": "Xenophon",
    "life": "约前430—前354年",
    "relation": "苏格拉底的追随者 · 军人、作家",
    "place": "athens",
    "bio": "军人兼作家，记录战争，也记录苏格拉底。",
    "sources": [
      [
        "哲学网络百科 · 色诺芬",
        "https://iep.utm.edu/xenophon/"
      ]
    ]
  },
  "antisthenes": {
    "name": "安提斯泰尼",
    "en": "Antisthenes",
    "life": "约前446—前366年",
    "relation": "苏格拉底的追随者 · 犬儒传统先驱",
    "place": "athens",
    "bio": "重视德性与自足，成为犬儒传统的先驱。",
    "sources": [
      [
        "哲学网络百科 · 安提斯泰尼",
        "https://iep.utm.edu/antisthenes/"
      ]
    ]
  },
  "aristippus": {
    "name": "阿里斯提卜",
    "en": "Aristippus of Cyrene",
    "life": "约前435—前356年",
    "relation": "苏格拉底的追随者 · 昔兰尼学派先驱",
    "place": "cyrene",
    "bio": "昔兰尼学派（Cyrenaics）先驱，重愉悦与自制。",
    "sources": [
      [
        "哲学网络百科 · 阿里斯提卜",
        "https://iep.utm.edu/aristippus/"
      ]
    ]
  },
  "diogenes": {
    "name": "第欧根尼",
    "en": "Diogenes of Sinope",
    "life": "约前404—前323年",
    "relation": "犬儒哲学家 · 与柏拉图同代",
    "place": "corinth",
    "bio": "以极简生活和尖锐言行挑战财富、身份与习俗。",
    "sources": [
      [
        "哲学网络百科 · 锡诺普的第欧根尼",
        "https://iep.utm.edu/diogenes-of-sinope/"
      ]
    ]
  },
  "speusippus": {
    "name": "斯彪西波",
    "en": "Speusippus",
    "life": "约前410—前339/338年",
    "relation": "柏拉图的外甥 · 学园继任者",
    "place": "athens",
    "bio": "继承学园，却发展了不同于柏拉图的学说。",
    "sources": [
      [
        "斯坦福哲学百科 · 斯彪西波",
        "https://plato.stanford.edu/entries/speusippus/"
      ]
    ]
  },
  "xenocrates": {
    "name": "色诺克拉底",
    "en": "Xenocrates",
    "life": "约前396/395—前314/313年",
    "relation": "柏拉图的学生 · 学园第三任主持者",
    "place": "athens",
    "bio": "柏拉图的学生，将学园延续到马其顿霸权时代。",
    "sources": [
      [
        "斯坦福哲学百科 · 色诺克拉底",
        "https://plato.stanford.edu/entries/xenocrates/"
      ]
    ]
  },
  "theophrastus": {
    "name": "泰奥弗拉斯托斯",
    "en": "Theophrastus",
    "life": "约前371—前287年",
    "relation": "亚里士多德的同事 · 吕刻昂继任者",
    "place": "lesbos",
    "bio": "长期与亚里士多德合作，以植物研究著称。",
    "sources": [
      [
        "斯坦福哲学百科 · 泰奥弗拉斯托斯",
        "https://plato.stanford.edu/entries/theophrastus/"
      ]
    ]
  },
  "alexander": {
    "name": "亚历山大",
    "en": "Alexander III / Alexander the Great",
    "life": "前356—前323年",
    "relation": "亚里士多德的学生 · 马其顿国王",
    "place": "mieza",
    "bio": "腓力二世之子，前336年继位，随后东征。",
    "sources": [
      [
        "斯坦福哲学百科 · 亚里士多德与亚历山大",
        "https://plato.stanford.edu/entries/aristotle/"
      ]
    ]
  },
  "callisthenes": {
    "name": "卡利斯提尼",
    "en": "Callisthenes of Olynthus",
    "life": "约前370—前327年",
    "relation": "亚里士多德的外甥孙 · 随军史家",
    "place": "bactra",
    "bio": "随军史官，替征服者写史：颂扬可以，下跪不行。",
    "sources": [
      [
        "阿里安 · 酒席上的俯拜礼争执",
        "https://www.livius.org/sources/content/arrian/anabasis/the-introduction-of-proskynesis/"
      ],
      [
        "普鲁塔克《亚历山大传》55节 · 师门关系与侍童案",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Alexander*/8.html#55"
      ]
    ]
  },
  "brennus": {
    "name": "布伦努斯",
    "en": "Brennus",
    "life": "卒于前279年",
    "relation": "南下希腊的凯尔特军事领袖",
    "place": "delphi",
    "bio": "南下希腊的凯尔特首领。前390年攻陷罗马的高卢首领也叫布伦努斯，是另一个人。",
    "sources": [
      [
        "保萨尼亚斯 · 凯尔特人入侵",
        "https://www.livius.org/sources/content/pausanias-periegete/the-invasion-of-the-gauls/"
      ]
    ]
  },
  "attalus": {
    "name": "阿塔罗斯一世",
    "en": "Attalus I",
    "life": "前269—前197年",
    "relation": "帕加马国王 · 军事胜利与王权声望",
    "place": "pergamon",
    "bio": "帕加马第一位称王的君主，把一座山城经营成王国，又把战胜加拉太人做成王朝招牌。",
    "sources": [
      [
        "阿塔罗斯胜利献辞 · OGIS 273—279",
        "https://www.attalus.org/docs/ogis/s273.html"
      ],
      [
        "胜利雕塑与《垂死的高卢人》",
        "https://www.attalus.org/gaul_1.html"
      ]
    ]
  },
  "agis-iv": {
    "name": "阿吉斯四世",
    "en": "Agis IV",
    "life": "约前265—前241年",
    "relation": "斯巴达国王 · 土地与债务改革者",
    "place": "sparta",
    "bio": "二十岁上下即位的年轻国王，想靠免债分地，让斯巴达重新养得起足够的公民兵。",
    "sources": [
      [
        "普鲁塔克《阿吉斯传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Agis*.html"
      ]
    ]
  },
  "cleomenes-iii": {
    "name": "克里昂米尼三世",
    "en": "Cleomenes III",
    "life": "约前260—前219年",
    "relation": "斯巴达国王 · 改革与军事扩张",
    "place": "sparta",
    "bio": "接过阿吉斯未竟的改革，先用兵削平监察官，再分地扩军。",
    "sources": [
      [
        "普鲁塔克《克里昂米尼传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Cleomenes*.html"
      ]
    ]
  },
  "rosetta-decree": {
    "name": "罗塞塔石碑",
    "en": "Rosetta Stone",
    "life": "铭刻于前196年",
    "relation": "孟菲斯祭司会议 · 王室与神庙的交换",
    "place": "memphis",
    "bio": "同一道诏令刻成圣书体、世俗体和希腊文三种文字，后来成了破译古埃及文字的钥匙。",
    "sources": [
      [
        "大英博物馆 · 罗塞塔石碑",
        "https://www.britishmuseum.org/collection/object/Y_EA24"
      ]
    ]
  },
  "epicurus": {
    "name": "伊壁鸠鲁",
    "en": "Epicurus",
    "life": "前341—前270年",
    "relation": "花园学园创办者",
    "place": "athens",
    "bio": "把免于痛苦与恐惧视为幸福的关键，主张节制欲望、重视友谊。",
    "sources": [
      [
        "斯坦福哲学百科 · 伊壁鸠鲁",
        "https://plato.stanford.edu/entries/epicurus/"
      ],
      [
        "哲学网络百科 · 花园学园",
        "https://iep.utm.edu/garden/"
      ]
    ]
  },
  "zeno": {
    "name": "基提翁的芝诺",
    "en": "Zeno of Citium",
    "life": "约前334—前262年",
    "relation": "斯多亚学派（Stoicism）创始人",
    "place": "athens",
    "bio": "把德性、理性与履行责任置于幸福的中心，强调更广泛的人类共同体。",
    "sources": [
      [
        "斯坦福哲学百科 · 斯多亚学派",
        "https://plato.stanford.edu/entries/stoicism/"
      ]
    ]
  },
  "euclid": {
    "name": "欧几里得",
    "en": "Euclid",
    "life": "约前300年活跃",
    "relation": "亚历山大里亚的数学家",
    "place": "alexandria",
    "bio": "《几何原本》（Elements）将大量既有成果组织成由定义、公设和证明联结的体系。",
    "sources": [
      [
        "圣安德鲁斯大学 MacTutor · 欧几里得",
        "https://mathshistory.st-andrews.ac.uk/Biographies/Euclid/"
      ]
    ]
  },
  "eratosthenes": {
    "name": "埃拉托色尼",
    "en": "Eratosthenes",
    "life": "约前276—前194年",
    "relation": "昔兰尼出生 · 亚历山大里亚学者",
    "place": "alexandria",
    "bio": "主持图书馆工作，研究年代、地理与数学，把多地资料纳入相互比较。",
    "sources": [
      [
        "圣安德鲁斯大学 MacTutor · 埃拉托色尼",
        "https://mathshistory.st-andrews.ac.uk/Biographies/Eratosthenes/"
      ]
    ]
  },
  "archimedes": {
    "name": "阿基米德",
    "en": "Archimedes",
    "life": "约前287—前212年",
    "relation": "叙拉古的数学家与力学研究者",
    "place": "syracuse",
    "bio": "研究面积、体积、杠杆与浮力，并与亚历山大里亚的学者通信。",
    "sources": [
      [
        "圣安德鲁斯大学 MacTutor · 阿基米德",
        "https://mathshistory.st-andrews.ac.uk/Biographies/Archimedes/"
      ],
      [
        "波利比乌斯《历史》卷八 · 叙拉古守城",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Polybius/8*.html"
      ]
    ]
  },
  "mithridates-i": {
    "name": "米特里达梯一世",
    "en": "Mithridates I",
    "life": "前2世纪 · 安息国王",
    "relation": "帕提亚由边缘进入两河的扩张者",
    "place": "seleucia",
    "bio": "把安息从伊朗高原东北的边地王国，带进两河平原的城市与粮仓。",
    "sources": [
      [
        "《伊朗百科》· 安息王朝史",
        "https://www.iranicaonline.org/articles/arsacids-ii/"
      ]
    ]
  },
  "cleopatra-vii": {
    "name": "克娄巴特拉七世",
    "en": "Cleopatra VII",
    "life": "前69—前30年",
    "relation": "托勒密女王 · 罗马内战中的埃及统治者",
    "place": "alexandria",
    "bio": "托勒密王朝末代女王，凭埃及的粮食与财富，在罗马强人之间周旋求存。",
    "sources": [
      [
        "大都会博物馆 · 托勒密埃及的终结",
        "https://www.metmuseum.org/essays/egypt-in-the-ptolemaic-period"
      ],
      [
        "普鲁塔克《安东尼传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Antony*.html"
      ]
    ]
  },
  "servius-tullius": {
    "name": "塞尔维乌斯·图利乌斯",
    "en": "Servius Tullius",
    "life": "传统在位前578—前535年",
    "relation": "罗马第六王 · 老塔克文的女婿",
    "place": "rome",
    "bio": "传说生母是宫中女奴，靠王后塔娜奎尔扶持继位，后被女婿傲慢者塔克文所杀。",
    "sources": [
      [
        "李维《建城以来史》1.42 · 普查与财产等级",
        "https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0026:book=1:chapter=42"
      ],
      [
        "克劳狄皇帝的里昂铜板 · 马斯塔尔纳",
        "https://en.wikipedia.org/wiki/Lyon_Tablet"
      ]
    ]
  },
  "tarquinius-superbus": {
    "name": "傲慢者塔克文",
    "en": "Tarquinius Superbus",
    "life": "？—前495年",
    "relation": "罗马第七王 · 塞尔维乌斯的女婿",
    "place": "rome",
    "bio": "杀岳父夺位，不经元老与人民认可。被逐后四处借兵复辟，客死库迈。",
    "sources": [
      [
        "李维《建城以来史》1.54 · 打落罂粟花",
        "https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0026:book=1:chapter=54"
      ],
      [
        "希罗多德《历史》5.92 · 希腊僭主的同款故事",
        "https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.01.0126:book=5:chapter=92"
      ]
    ]
  },
  "lucius-brutus": {
    "name": "卢基乌斯·尤尼乌斯·布鲁图斯",
    "en": "Lucius Junius Brutus",
    "life": "活跃于前509年前后",
    "relation": "傲慢者塔克文的外甥 · 首任执政官",
    "place": "rome",
    "bio": "传说他装傻躲过舅舅的猜忌，“布鲁图斯”本意就是“呆子”。刺杀恺撒的马库斯·布鲁图斯自称是他的后人。",
    "sources": [
      [
        "李维《建城以来史》2.5 · 布鲁图斯审子",
        "https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0026:book=2:chapter=5"
      ],
      [
        "普鲁塔克《普布利科拉传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Publicola*.html"
      ]
    ]
  },
  "spurius-cassius": {
    "name": "斯普里乌斯·卡西乌斯",
    "en": "Spurius Cassius Vecellinus",
    "life": "？—前485年",
    "relation": "三任执政官 · 前493年与拉丁同盟立约",
    "place": "rome",
    "bio": "早期共和的重臣，因提分地法被指图谋称王，遭处死。",
    "sources": [
      [
        "李维《建城以来史》2.41 · 第一部分地法",
        "https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0026:book=2:chapter=41"
      ]
    ]
  },
  "appius-decemvir": {
    "name": "阿庇乌斯·克劳狄",
    "en": "Appius Claudius (decemvir)",
    "life": "？—前449年",
    "relation": "十人委员会首领",
    "place": "rome",
    "bio": "贵族克劳狄家族出身，主持编订十二铜表法，因维吉尼娅案倒台。",
    "sources": [
      [
        "李维《建城以来史》3.44 · 维吉尼娅案",
        "https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0026:book=3:chapter=44"
      ],
      [
        "十二铜表法英译 · 耶鲁 Avalon 项目",
        "https://avalon.law.yale.edu/ancient/twelve_tables.asp"
      ]
    ]
  },
  "camillus": {
    "name": "马库斯·福里乌斯·卡米卢斯",
    "en": "Marcus Furius Camillus",
    "life": "约前446—前365年",
    "relation": "五任独裁官 · “第二个建城者”",
    "place": "veii",
    "bio": "贵族将领，攻灭维爱、赶走高卢人；晚年主持贵族与平民和解。",
    "sources": [
      [
        "普鲁塔克《卡米卢斯传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Camillus*.html"
      ],
      [
        "Livius · 维爱",
        "https://www.livius.org/articles/place/veii/"
      ]
    ]
  },
  "manlius-capitolinus": {
    "name": "马库斯·曼利乌斯·卡皮托利努斯",
    "en": "Marcus Manlius Capitolinus",
    "life": "？—前384年",
    "relation": "前392年执政官 · 卡匹托尔山的守卫者",
    "place": "rome",
    "bio": "贵族出身，高卢人夜袭时救下卡匹托尔山；后替欠债平民出头，以图谋称王罪被处死。",
    "sources": [
      [
        "李维《建城以来史》5.47 · 圣鹅之夜",
        "https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0026:book=5:chapter=47"
      ],
      [
        "李维《建城以来史》6.20 · 审判与处死",
        "https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0026:book=6:chapter=20"
      ]
    ]
  },
  "licinius-stolo": {
    "name": "盖约·李锡尼·斯托洛",
    "en": "Gaius Licinius Stolo",
    "life": "活跃于前376—前357年",
    "relation": "平民保民官 · 后任执政官",
    "place": "rome",
    "bio": "与同僚绥克斯图（Lucius Sextius）连任保民官十年，推动执政官向平民开放。",
    "sources": [
      [
        "李维《建城以来史》6.34 · 法比娅姐妹与李锡尼法",
        "https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0026:book=6:chapter=34"
      ]
    ]
  },
  "appius-caecus": {
    "name": "阿庇乌斯·克劳狄·凯库斯",
    "en": "Appius Claudius Caecus",
    "life": "约前340—前273年",
    "relation": "前312年监察官 · 两任执政官",
    "place": "rome",
    "bio": "“凯库斯”意为“瞎子”。修了罗马第一条大道和第一条引水渠，晚年失明。",
    "sources": [
      [
        "李维《建城以来史》9.46 · 阿庇乌斯与城市平民",
        "https://www.perseus.tufts.edu/hopper/text?doc=Perseus:text:1999.02.0026:book=9:chapter=46"
      ],
      [
        "普鲁塔克《皮洛士传》第19节",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Pyrrhus*.html"
      ]
    ]
  },
  "manlius-torquatus": {
    "name": "提图斯·曼利乌斯·托夸图斯",
    "en": "Titus Manlius Torquatus",
    "life": "前4世纪",
    "relation": "三任执政官 · 前340年执政官",
    "place": "rome",
    "bio": "贵族将领。年轻时与一个高卢巨人单挑，取下对方的金项圈（torques），由此得名“托夸图斯”。",
    "sources": [
      [
        "李维《建城以来史》8.7 · 处死儿子",
        "https://en.wikisource.org/wiki/From_the_Founding_of_the_City/Book_8#7"
      ],
      [
        "李维《建城以来史》7.10 · 金项圈",
        "https://en.wikisource.org/wiki/From_the_Founding_of_the_City/Book_7#10"
      ]
    ]
  },
  "decius-mus": {
    "name": "普布利乌斯·德基乌斯·穆斯",
    "en": "Publius Decius Mus",
    "life": "？—前295年",
    "relation": "四任执政官 · 平民显贵",
    "place": "rome",
    "bio": "父子同名，都是平民出身的执政官。前300年他力主让平民进入祭司团。",
    "sources": [
      [
        "李维《建城以来史》10.28 · 森提努姆献身",
        "https://en.wikisource.org/wiki/From_the_Founding_of_the_City/Book_10#28"
      ],
      [
        "李维《建城以来史》8.9 · 父亲献身",
        "https://en.wikisource.org/wiki/From_the_Founding_of_the_City/Book_8#9"
      ]
    ]
  },
  "curius-dentatus": {
    "name": "马尼乌斯·库里乌斯·登塔图斯",
    "en": "Manius Curius Dentatus",
    "life": "？—前270年",
    "relation": "三任执政官 · 平民“新人”",
    "place": "rome",
    "bio": "没有显赫祖先的平民，打赢了萨莫奈人、萨宾人和皮洛士，一辈子以清贫出名。",
    "sources": [
      [
        "普鲁塔克《老加图传》第2节 · 煮萝卜",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Cato_Major*.html"
      ]
    ]
  },
  "hannibal": {
    "name": "汉尼拔·巴卡",
    "en": "Hannibal Barca",
    "life": "前247—约前183年",
    "relation": "迦太基统帅 · 哈米尔卡之子",
    "place": "carthage",
    "bio": "在西班牙军营里长大的迦太基将门之子，在意大利转战十五年，最后输在扎马；晚年流亡东方。",
    "sources": [
      [
        "Livius · 汉尼拔",
        "https://www.livius.org/articles/person/hannibal-3-barca/"
      ],
      [
        "波利比乌斯《通史》第3卷",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Polybius/3*.html"
      ]
    ]
  },
  "fabius-maximus": {
    "name": "昆图斯·费边·马克西穆斯",
    "en": "Quintus Fabius Maximus Cunctator",
    "life": "约前280—前203年",
    "relation": "五任执政官 · 两任独裁官 · “拖延者”",
    "place": "rome",
    "bio": "老派贵族元老。特拉西梅诺惨败后出任独裁官，避开会战，跟着汉尼拔耗。",
    "sources": [
      [
        "普鲁塔克《费边传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Fabius_Maximus*.html"
      ],
      [
        "李维《建城以来史》22.25—22.30 · 两个独裁官",
        "https://en.wikisource.org/wiki/From_the_Founding_of_the_City/Book_22#25"
      ]
    ]
  },
  "scipio-africanus": {
    "name": "普布利乌斯·科尔内利乌斯·西庇阿",
    "en": "Publius Cornelius Scipio Africanus",
    "life": "前236—前183年",
    "relation": "大西庇阿 · 格拉古兄弟的外祖父",
    "place": "rome",
    "bio": "贵族世家，父亲和伯父都战死在西班牙。二十多岁领兵，十年里拿下西班牙，在扎马赢了汉尼拔。",
    "sources": [
      [
        "李维《建城以来史》26.18 · 受命去西班牙",
        "https://en.wikisource.org/wiki/From_the_Founding_of_the_City/Book_26#18"
      ],
      [
        "波利比乌斯《通史》第10卷 · 新迦太基",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Polybius/10*.html"
      ],
      [
        "波利比乌斯《通史》第23卷 · 撕账本（23.14）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Polybius/23*.html"
      ]
    ]
  },
  "cato-elder": {
    "name": "马库斯·波尔基乌斯·加图",
    "en": "Marcus Porcius Cato (the Elder)",
    "life": "前234—前149年",
    "relation": "老加图 · 前184年监察官 · 小加图的曾祖父",
    "place": "rome",
    "bio": "图斯库鲁姆的农家子弟，没有显赫祖先，一路做到执政官和监察官。节俭、刻薄，一生被起诉四十多次，也告倒过不少人。",
    "sources": [
      [
        "普鲁塔克《老加图传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Cato_Major*.html"
      ],
      [
        "李维《建城以来史》39.42 · 监察官开除元老",
        "https://en.wikisource.org/wiki/From_the_Founding_of_the_City/Book_39#42"
      ]
    ]
  },
  "aemilius-paullus": {
    "name": "卢基乌斯·埃米利乌斯·保卢斯",
    "en": "Lucius Aemilius Paullus Macedonicus",
    "life": "约前229—前160年",
    "relation": "两任执政官 · 小西庇阿的生父",
    "place": "rome",
    "bio": "父亲是在坎尼战死的执政官。他灭了马其顿，自己一文不取，只让儿子们挑走了马其顿国王的藏书。",
    "sources": [
      [
        "普鲁塔克《保卢斯传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Aemilius*.html"
      ]
    ]
  },
  "polybius": {
    "name": "波利比乌斯",
    "en": "Polybius",
    "life": "约前200—约前118年",
    "relation": "亚该亚人质 · 史家",
    "place": "rome",
    "bio": "亚该亚同盟的贵族子弟，作为人质到罗马，成了小西庇阿的良师益友。写《通史》，要回答罗马凭什么不到五十三年就统治了已知世界。",
    "sources": [
      [
        "波利比乌斯《通史》第6卷",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Polybius/6*.html"
      ],
      [
        "波利比乌斯《通史》第31卷 · 与小西庇阿结交（31.23—31.25）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Polybius/31*.html"
      ]
    ]
  },
  "scipio-aemilianus": {
    "name": "普布利乌斯·科尔内利乌斯·西庇阿·埃米利亚努斯",
    "en": "Publius Cornelius Scipio Aemilianus",
    "life": "前185—前129年",
    "relation": "小西庇阿 · 保卢斯之子、大西庇阿的养孙",
    "place": "carthage",
    "bio": "生在保卢斯家，过继给大西庇阿的儿子。两任执政官，毁了迦太基，攻下努曼提亚。他娶了格拉古兄弟的姐妹森普罗尼娅。",
    "sources": [
      [
        "波利比乌斯《通史》第38卷 · 迦太基陷落",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Polybius/38*.html"
      ],
      [
        "Livius · 李维《摘要》第46—50卷",
        "https://www.livius.org/sources/content/livy/livy-periochae-46-50/"
      ]
    ]
  },
  "tiberius-gracchus": {
    "name": "提比略·森普罗尼乌斯·格拉古",
    "en": "Tiberius Sempronius Gracchus",
    "life": "前163—前133年",
    "relation": "前133年保民官 · 大西庇阿的外孙 · 小西庇阿的妻舅",
    "place": "rome",
    "bio": "名门之后，母亲是大西庇阿的女儿科尔内利娅。年轻时随小西庇阿攻迦太基，第一个登上城墙。",
    "sources": [
      [
        "普鲁塔克《提比略·格拉古传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Tiberius_Gracchus*.html"
      ]
    ]
  },
  "gaius-gracchus": {
    "name": "盖约·森普罗尼乌斯·格拉古",
    "en": "Gaius Sempronius Gracchus",
    "life": "前154—前121年",
    "relation": "前123—前122年保民官 · 提比略之弟",
    "place": "rome",
    "bio": "罗马最出色的演说家之一，讲到激动处会来回走动、把托加扯下肩头；身后站着个奴隶，用笛子替他把调子定住。",
    "sources": [
      [
        "普鲁塔克《盖约·格拉古传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Caius_Gracchus*.html"
      ]
    ]
  },
  "cornelia": {
    "name": "科尔内利娅",
    "en": "Cornelia",
    "life": "约前190—约前115年",
    "relation": "大西庇阿之女 · 格拉古兄弟之母",
    "place": "rome",
    "bio": "丈夫死后谢绝了埃及国王托勒密八世的求婚，亲自教养活下来的三个孩子。",
    "sources": [
      [
        "普鲁塔克《提比略·格拉古传》第1节",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Tiberius_Gracchus*.html"
      ],
      [
        "普鲁塔克《盖约·格拉古传》第19节",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Caius_Gracchus*.html"
      ]
    ]
  },
  "jugurtha": {
    "name": "朱古达",
    "en": "Jugurtha",
    "life": "约前160—前104年",
    "relation": "努米底亚王 · 马西尼萨之孙 · 当年在小西庇阿军中",
    "place": "cirta",
    "bio": "庶出的王孙，在努曼提亚城下给小西庇阿带过努米底亚骑兵，从此看透了罗马：什么都买得到。",
    "sources": [
      [
        "撒路斯提乌斯《朱古达战争》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Sallust/Bellum_Jugurthinum/1*.html"
      ]
    ]
  },
  "marius": {
    "name": "盖约·马略",
    "en": "Gaius Marius",
    "life": "前157—前86年",
    "relation": "七任执政官 · 新人 · 恺撒的姑父",
    "place": "rome",
    "bio": "阿尔皮农的骑士家庭出身，家族原是梅特卢斯家的门客。不肯学希腊文，打仗是一把好手。",
    "sources": [
      [
        "普鲁塔克《马略传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Marius*.html"
      ],
      [
        "撒路斯提乌斯《朱古达战争》第86节",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Sallust/Bellum_Jugurthinum/1*.html"
      ]
    ]
  },
  "sulla": {
    "name": "卢基乌斯·科尔内利乌斯·苏拉",
    "en": "Lucius Cornelius Sulla Felix",
    "life": "前138—前78年",
    "relation": "马略的财务官和部将 · 没落贵族 · 前82—前79年独裁官",
    "place": "rome",
    "bio": "古老贵族却家道中落，年轻时混在演员和乐师堆里；一位富有的情妇和继母先后把遗产留给他，才有钱走上仕途。自号“幸运者”（Felix）。",
    "sources": [
      [
        "普鲁塔克《苏拉传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Sulla*.html"
      ],
      [
        "阿庇安《内战史》第1卷",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Appian/Civil_Wars/1*.html"
      ]
    ]
  },
  "cinna": {
    "name": "卢基乌斯·科尔内利乌斯·秦纳",
    "en": "Lucius Cornelius Cinna",
    "life": "？—前84年",
    "relation": "前87—前84年连任执政官 · 恺撒的岳父",
    "place": "rome",
    "bio": "苏拉东征期间把持罗马四年，四度出任执政官。",
    "sources": [
      [
        "阿庇安《内战史》第1卷（1.64—78）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Appian/Civil_Wars/1*.html"
      ]
    ]
  },
  "mithridates-vi": {
    "name": "米特拉达梯六世",
    "en": "Mithridates VI Eupator",
    "life": "前135—前63年",
    "relation": "本都王 · 罗马的头号外敌",
    "place": "sinope",
    "bio": "据说自幼每天服少量毒药练出抗毒体质，会说治下二十二种语言。和罗马前后打了二十五年。",
    "sources": [
      [
        "普鲁塔克《苏拉传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Sulla*.html"
      ],
      [
        "普鲁塔克《庞培传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Pompey*.html"
      ]
    ]
  },
  "pompey": {
    "name": "格奈乌斯·庞培（伟大者）",
    "en": "Gnaeus Pompeius Magnus",
    "life": "前106—前48年",
    "relation": "苏拉的副手 · 恺撒的女婿（前59—前54年）",
    "place": "rome",
    "bio": "将军庞培·斯特拉波之子。一生三次凯旋，分别庆祝在非洲、欧洲、亚洲的胜利。",
    "sources": [
      [
        "普鲁塔克《庞培传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Pompey*.html"
      ]
    ]
  },
  "crassus": {
    "name": "马库斯·李锡尼·克拉苏",
    "en": "Marcus Licinius Crassus",
    "life": "约前115—前53年",
    "relation": "苏拉的副手 · 罗马首富",
    "place": "rome",
    "bio": "父亲和哥哥死于马略、秦纳的清洗，他在西班牙的山洞里躲了八个月。他说过：养不起一支军队的人，算不上富人。",
    "sources": [
      [
        "普鲁塔克《克拉苏传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Crassus*.html"
      ]
    ]
  },
  "spartacus": {
    "name": "斯巴达克斯",
    "en": "Spartacus",
    "life": "？—前71年",
    "relation": "色雷斯人 · 角斗士",
    "place": "capua",
    "bio": "普鲁塔克说他力气大、有头脑，性情温和，“比他的出身更像希腊人”。",
    "sources": [
      [
        "普鲁塔克《克拉苏传》第8—11节",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Crassus*.html"
      ],
      [
        "阿庇安《内战史》第1卷（1.116—120）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Appian/Civil_Wars/1*.html"
      ]
    ]
  },
  "caesar": {
    "name": "盖约·尤利乌斯·恺撒",
    "en": "Gaius Julius Caesar",
    "life": "前100—前44年",
    "relation": "马略的内侄 · 秦纳的女婿 · 庞培的岳父",
    "place": "rome",
    "bio": "古老贵族世家，自称维纳斯的后裔。欠债欠出了名：去西班牙上任前债主拦路，靠克拉苏担保了八百三十塔兰特才走成。",
    "sources": [
      [
        "苏埃托尼乌斯《神圣的尤利乌斯传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Julius*.html"
      ],
      [
        "普鲁塔克《恺撒传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Caesar*.html"
      ]
    ]
  },
  "cato-younger": {
    "name": "马库斯·波尔基乌斯·加图（小加图）",
    "en": "Marcus Porcius Cato the Younger",
    "life": "前95—前46年",
    "relation": "老加图的曾孙 · 布鲁图斯的舅舅兼岳父 · 元老院强硬派的旗手",
    "place": "rome",
    "bio": "斯多亚派，衣着寒酸，常常赤脚上街，从不收礼。竞选执政官落败，却是元老院里最难缠的人。",
    "sources": [
      [
        "普鲁塔克《小加图传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Cato_Minor*.html"
      ]
    ]
  },
  "cicero": {
    "name": "马库斯·图利乌斯·西塞罗",
    "en": "Marcus Tullius Cicero",
    "life": "前106—前43年",
    "relation": "新人 · 前63年执政官 · 马略的同乡",
    "place": "rome",
    "bio": "和马略同是阿尔皮农出身的“新人”，靠辩才做到执政官。留下九百多封书信，是这段历史最贴身的见证。",
    "sources": [
      [
        "普鲁塔克《西塞罗传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Cicero*.html"
      ]
    ]
  },
  "clodius": {
    "name": "普布利乌斯·克洛狄乌斯",
    "en": "Publius Clodius Pulcher",
    "life": "约前93—前52年",
    "relation": "贵族改籍平民的保民官 · 平民派的打手头子",
    "place": "rome",
    "bio": "为了当保民官，他让一个比自己还年轻的平民收养自己。前58年任保民官，推行免费发粮，组织街头帮派。",
    "sources": [
      [
        "普鲁塔克《恺撒传》第9—10节",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Caesar*.html"
      ],
      [
        "普鲁塔克《西塞罗传》第28—35节",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Cicero*.html"
      ]
    ]
  },
  "brutus": {
    "name": "马库斯·尤尼乌斯·布鲁图斯",
    "en": "Marcus Junius Brutus",
    "life": "前85—前42年",
    "relation": "小加图的外甥兼女婿 · 母亲塞尔维利娅是恺撒的情人",
    "place": "rome",
    "bio": "自认是当年赶走国王的布鲁图斯的后人。内战中投奔庞培，法萨卢斯之后被恺撒赦免、重用。",
    "sources": [
      [
        "普鲁塔克《布鲁图斯传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Brutus*.html"
      ]
    ]
  },
  "antony": {
    "name": "马克·安东尼",
    "en": "Marcus Antonius",
    "life": "前83—前30年",
    "relation": "恺撒的部将和同僚执政官 · 屋大维的姐夫",
    "place": "rome",
    "bio": "恺撒在高卢和内战中最得力的将领之一；豪饮好色，深得士兵爱戴。",
    "sources": [
      [
        "普鲁塔克《安东尼传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Antony*.html"
      ]
    ]
  },
  "octavian": {
    "name": "盖约·屋大维（奥古斯都）",
    "en": "Gaius Octavius (Augustus)",
    "life": "前63—公元14年",
    "relation": "恺撒的甥孙和养子",
    "place": "rome",
    "bio": "体弱多病，打仗多靠阿格里帕，治国靠自己的耐心。独掌罗马四十多年，留下自述功业的《神圣的奥古斯都功业录》。",
    "sources": [
      [
        "苏埃托尼乌斯《神圣的奥古斯都传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Augustus*.html"
      ],
      [
        "《神圣的奥古斯都功业录》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Augustus/Res_Gestae/6*.html"
      ]
    ]
  },
  "lepidus": {
    "name": "马库斯·埃米利乌斯·雷必达",
    "en": "Marcus Aemilius Lepidus",
    "life": "约前89—前13年",
    "relation": "恺撒的骑兵长官 · 后三头里打酱油的一位",
    "place": "rome",
    "bio": "恺撒遇刺前一晚还在他家吃饭。席间聊到什么死法最好，恺撒答：“出其不意的。”",
    "sources": [
      [
        "普鲁塔克《恺撒传》第63节",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Caesar*.html"
      ],
      [
        "阿庇安《内战史》第4卷（后三头）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Appian/Civil_Wars/4*.html"
      ]
    ]
  },
  "agrippa": {
    "name": "马库斯·维普萨尼乌斯·阿格里帕",
    "en": "Marcus Vipsanius Agrippa",
    "life": "约前63—前12年",
    "relation": "屋大维的同学和大将 · 后来的女婿",
    "place": "rome",
    "bio": "出身平平，屋大维的大仗多半由他指挥；还修了万神殿的前身和罗马的公共浴场、引水渠。",
    "sources": [
      [
        "维莱伊乌斯《罗马史》第2卷",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Velleius_Paterculus/2B*.html"
      ]
    ]
  },
  "julia": {
    "name": "尤利娅",
    "en": "Julia the Elder",
    "life": "前39—公元14年",
    "relation": "奥古斯都的独女 · 马塞卢斯、阿格里帕、提比略的妻子",
    "place": "rome",
    "bio": "父亲拿她的婚事安排接班，她三次出嫁，生了五个孩子。机智爱热闹，和父亲提倡的俭朴家风格格不入。",
    "sources": [
      [
        "苏埃托尼乌斯《神圣的奥古斯都传》第63—65节",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Augustus*.html"
      ],
      [
        "卡西乌斯·狄奥《罗马史》第55卷第10节",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/55*.html"
      ]
    ]
  },
  "sejanus": {
    "name": "卢基乌斯·埃利乌斯·塞扬努斯",
    "en": "Lucius Aelius Sejanus",
    "life": "约前20—公元31年",
    "relation": "提比略的禁卫军长官",
    "place": "rome",
    "bio": "骑士出身，替提比略管着京城和禁卫军，被皇帝称作“我的劳作伙伴”；想当接班人，31年被处死。",
    "sources": [
      [
        "塔西佗《编年史》第4卷（第1—3节）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Tacitus/Annals/4A*.html"
      ],
      [
        "卡西乌斯·狄奥《罗马史》第58卷",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/58*.html"
      ]
    ]
  },
  "tiberius": {
    "name": "提比略",
    "en": "Tiberius",
    "life": "前42—公元37年",
    "relation": "奥古斯都的继子和养子 · 尤利娅的第三任丈夫",
    "place": "rome",
    "bio": "能打仗的贵族，讨厌奉承。塔西佗说，他每次走出元老院，都要用希腊语念叨一句：“这些人，多么甘心当奴才！”",
    "sources": [
      [
        "苏埃托尼乌斯《提比略传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Tiberius*.html"
      ],
      [
        "塔西佗《编年史》第3卷（第65节）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Tacitus/Annals/3D*.html"
      ]
    ]
  },
  "claudius": {
    "name": "克劳狄乌斯",
    "en": "Claudius",
    "life": "前10—公元54年",
    "relation": "提比略的侄子 · 卡利古拉的叔叔",
    "place": "lugdunum",
    "bio": "生在卢格杜努姆，从小跛足口吃，被家里当成笑话，躲进书房写史书；五十岁被禁卫军抬上皇位。",
    "sources": [
      [
        "苏埃托尼乌斯《神圣的克劳狄乌斯传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Claudius*.html"
      ]
    ]
  },
  "nero": {
    "name": "尼禄",
    "en": "Nero",
    "life": "37—68年",
    "relation": "奥古斯都的后代 · 克劳狄乌斯的继子",
    "place": "rome",
    "bio": "古人说，母亲小阿格里皮娜为他毒死了克劳狄乌斯；他后来又杀了母亲。爱唱歌、赛车，在希腊巡回比赛拿了一千八百多顶桂冠。",
    "sources": [
      [
        "苏埃托尼乌斯《尼禄传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Nero*.html"
      ],
      [
        "塔西佗《编年史》第15卷（第38—44节 大火）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Tacitus/Annals/15B*.html"
      ],
      [
        "卡西乌斯·狄奥《罗马史》第63卷",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/63*.html"
      ]
    ]
  },
  "vespasian": {
    "name": "韦斯巴芗",
    "en": "Vespasian",
    "life": "9—79年",
    "relation": "弗拉维王朝的开创者",
    "place": "rome",
    "bio": "收税人的儿子，跟尼禄巡演时在台下打瞌睡，差点丢了命。当皇帝后节俭、爱开玩笑，十年里把内战掏空的国库补了起来。",
    "sources": [
      [
        "苏埃托尼乌斯《神圣的韦斯巴芗传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Vespasian*.html"
      ]
    ]
  },
  "trajan": {
    "name": "图拉真",
    "en": "Trajan",
    "life": "53—117年",
    "relation": "涅尔瓦的养子 · 头一个生在意大利以外的皇帝",
    "place": "rome",
    "bio": "出身西班牙的罗马移民家庭，好酒好战。后世新皇帝登基，元老院祝他“比奥古斯都更幸运，比图拉真更好”。",
    "sources": [
      [
        "卡西乌斯·狄奥《罗马史》第68卷",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/68*.html"
      ]
    ]
  },
  "marcus-aurelius": {
    "name": "马可·奥勒留",
    "en": "Marcus Aurelius",
    "life": "121—180年",
    "relation": "安东尼·庇护的养子 · 康茂德的父亲",
    "place": "rome",
    "bio": "十二岁就穿起哲学家的粗布斗篷、睡在地上，母亲再三劝说才肯睡床。当了十九年皇帝，多半时间在打仗。",
    "sources": [
      [
        "《罗马皇帝传·马可·奥勒留传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Historia_Augusta/Marcus_Aurelius/1*.html"
      ],
      [
        "马可·奥勒留《沉思录》（英译本）",
        "https://www.gutenberg.org/ebooks/2680"
      ]
    ]
  },
  "septimius-severus": {
    "name": "塞普蒂米乌斯·塞维鲁",
    "en": "Septimius Severus",
    "life": "145—211年",
    "relation": "生在北非大莱普提斯 · 塞维鲁王朝的开创者",
    "place": "leptis",
    "bio": "说拉丁语带着非洲口音；妻子尤利娅·多姆娜是叙利亚埃米萨太阳神大祭司的女儿。",
    "sources": [
      [
        "《罗马皇帝传·塞维鲁传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Historia_Augusta/Septimius_Severus*.html"
      ],
      [
        "卡西乌斯·狄奥《罗马史》第75卷",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/75*.html"
      ]
    ]
  },
  "elagabalus": {
    "name": "埃拉伽巴路斯",
    "en": "Elagabalus",
    "life": "约204—222年",
    "relation": "尤利娅·多姆娜的甥孙 · 埃米萨太阳神的祭司",
    "place": "emesa",
    "bio": "本名瓦里乌斯·阿维图斯·巴西亚努斯，称号来自他侍奉的太阳神埃拉伽巴尔。十四岁当皇帝，十八岁被杀。",
    "sources": [
      [
        "《罗马皇帝传·埃拉伽巴路斯传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Historia_Augusta/Elagabalus/1*.html"
      ],
      [
        "希罗狄安《罗马史》第5卷第6节",
        "https://www.livius.org/sources/content/herodian-s-roman-history/herodian-5.6/"
      ]
    ]
  },
  "zenobia": {
    "name": "芝诺比娅",
    "en": "Zenobia",
    "life": "约240—274年以后",
    "relation": "帕尔米拉的女王 · 奥登纳图斯的遗孀",
    "place": "palmyra",
    "bio": "自称是克娄巴特拉的后人，通希腊语和埃及语，常和步兵一起步行几里路。",
    "sources": [
      [
        "《罗马皇帝传·三十僭主传》第30节",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Historia_Augusta/Tyranni_XXX*.html"
      ],
      [
        "左西莫斯《新史》第1卷（第50—59节）",
        "https://www.tertullian.org/fathers/zosimus01_book1.htm"
      ]
    ]
  },
  "aurelian": {
    "name": "奥勒良",
    "en": "Aurelian",
    "life": "214—275年",
    "relation": "多瑙河边农家出身的军人皇帝",
    "place": "rome",
    "bio": "外号“手按剑柄”，治军极严；五年里收回东西两块，钱币上称他“世界的光复者”。",
    "sources": [
      [
        "《罗马皇帝传·奥勒良传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Historia_Augusta/Aurelian/1*.html"
      ]
    ]
  },
  "diocletian": {
    "name": "戴克里先",
    "en": "Diocletian",
    "life": "约244—311年",
    "relation": "达尔马提亚的平民之子 · 四帝共治的设计者",
    "place": "salona",
    "bio": "据说出身释奴之家，从小兵做到皇帝；在位二十一年，是头一个主动退位的皇帝，也是三世纪以来少有的善终者。",
    "sources": [
      [
        "拉克坦提乌斯《论迫害者之死》",
        "https://www.newadvent.org/fathers/0705.htm"
      ],
      [
        "《罗马皇帝传·卡鲁斯等传》（野猪的预言）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Historia_Augusta/Carus_et_al*.html"
      ]
    ]
  },
  "constantine": {
    "name": "君士坦丁",
    "en": "Constantine the Great",
    "life": "约272—337年",
    "relation": "君士坦提乌斯的儿子 · 头一个信基督教的罗马皇帝",
    "place": "constantinople",
    "bio": "一手扶持教会，一手照旧当着罗马多神教的大祭司长；临终前才受洗。",
    "sources": [
      [
        "优西比乌《君士坦丁传》",
        "https://www.newadvent.org/fathers/25021.htm"
      ],
      [
        "菲洛斯托尔吉乌斯《教会史》摘要（第2卷第9节）",
        "https://www.tertullian.org/fathers/philostorgius.htm"
      ]
    ]
  },
  "theodosius": {
    "name": "狄奥多西一世",
    "en": "Theodosius I",
    "life": "347—395年",
    "relation": "西班牙将门之子 · 最后一位统治全帝国的皇帝",
    "place": "mediolanum",
    "bio": "阿德里安堡惨败后被召来收拾东部；一辈子奔忙在内战、安置蛮族和定教义之间。",
    "sources": [
      [
        "狄奥多勒《教会史》第5卷",
        "https://www.newadvent.org/fathers/27025.htm"
      ]
    ]
  },
  "ambrose": {
    "name": "安布罗斯",
    "en": "Ambrose",
    "life": "约340—397年",
    "relation": "米兰主教 · 奥古斯丁的施洗人",
    "place": "mediolanum",
    "bio": "原是米兰一带的总督。374年主教出缺，他去会场维持秩序，人群喊“让安布罗斯当主教”，他一周之内受洗、祝圣。",
    "sources": [
      [
        "安布罗斯《书信》第18封（驳辛马库斯）",
        "https://www.newadvent.org/fathers/340918.htm"
      ],
      [
        "狄奥多勒《教会史》第5卷",
        "https://www.newadvent.org/fathers/27025.htm"
      ]
    ]
  },
  "augustine": {
    "name": "奥古斯丁",
    "en": "Augustine of Hippo",
    "life": "354—430年",
    "relation": "北非希波的主教",
    "place": "hippo",
    "bio": "年轻时放荡，信过摩尼教，在米兰听安布罗斯讲道后受洗。《忏悔录》里有一句祷告：“主啊，赐我贞洁，但不是现在。”",
    "sources": [
      [
        "奥古斯丁《忏悔录》第8卷",
        "https://www.newadvent.org/fathers/110108.htm"
      ],
      [
        "奥古斯丁《上帝之城》",
        "https://www.newadvent.org/fathers/1201.htm"
      ]
    ]
  },
  "odoacer": {
    "name": "奥多亚克",
    "en": "Odoacer",
    "life": "约433—493年",
    "relation": "日耳曼雇佣军首领 · 意大利国王",
    "place": "ravenna",
    "bio": "父亲叫埃迪科，多半就是阿提拉手下的埃德科：449年他和俄瑞斯忒斯一同替阿提拉出使君士坦丁堡；二十七年后，他的儿子杀了俄瑞斯忒斯，废了俄瑞斯忒斯的儿子。奥多亚克年轻时随一伙蛮族去意大利，路过多瑙河边的诺里库姆，去拜见圣徒塞维里努斯。他个子高、衣衫褴褛，低着头才进得了那间矮小的修道小屋；临别时圣徒对他说：往意大利去吧，你如今穿着破皮袄，不久就要拿许多东西赏人。488年芝诺打发东哥特王狄奥多里克带族人去意大利，既送走巴尔干的麻烦，又收拾奥多亚克；493年狄奥多里克在拉文纳的宴会上亲手杀了他。",
    "sources": [
      [
        "《瓦莱西乌斯佚名作者》第2部分（第45—46节 父亲埃迪科与圣徒塞维里努斯）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Excerpta_Valesiana/2*.html"
      ]
    ]
  },
  "varus": {
    "name": "普布利乌斯·昆克提利乌斯·瓦卢斯",
    "en": "Publius Quinctilius Varus",
    "life": "约前46—公元9年",
    "relation": "奥古斯都的甥孙女婿 · 日耳曼总督",
    "place": "teutoburg",
    "bio": "没落贵族出身，前13年与提比略同任执政官，后任叙利亚总督，希律王死后犹太人起事，他钉死了两千人。史家维莱伊乌斯说他“穷着进了富省，富着离开穷省”。",
    "sources": [
      [
        "维莱伊乌斯《罗马史》第2卷（第117—119节）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Velleius_Paterculus/2D*.html"
      ],
      [
        "塔西佗《编年史》第1卷（第55、60—62节）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Tacitus/Annals/1D*.html"
      ],
      [
        "卡西乌斯·狄奥《罗马史》第56卷（第18—24节）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/56*.html"
      ]
    ]
  },
  "caligula": {
    "name": "卡利古拉（盖乌斯）",
    "en": "Caligula (Gaius)",
    "life": "12—41年",
    "relation": "日耳曼尼库斯的儿子 · 提比略的侄孙和继承人",
    "place": "rome",
    "bio": "本名盖乌斯·恺撒。“卡利古拉”意为“小军靴”，是他幼年在莱茵河军营里穿小号军靴，士兵给起的外号。",
    "sources": [
      [
        "苏埃托尼乌斯《卡利古拉传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Suetonius/12Caesars/Caligula*.html"
      ],
      [
        "卡西乌斯·狄奥《罗马史》第59卷",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/59*.html"
      ]
    ]
  },
  "agrippina-minor": {
    "name": "小阿格里皮娜",
    "en": "Agrippina the Younger",
    "life": "15—59年",
    "relation": "日耳曼尼库斯的女儿 · 卡利古拉的妹妹 · 克劳狄乌斯的侄女和妻子 · 尼禄的母亲",
    "place": "rome",
    "bio": "奥古斯都的曾外孙女。她把儿子推上皇位，尼禄即位那年的钱币上，母子两人的头像面对面铸在一起。",
    "sources": [
      [
        "塔西佗《编年史》第12卷（第64—69节）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Tacitus/Annals/12B*.html"
      ],
      [
        "塔西佗《编年史》第14卷（第1—13节 弑母）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Tacitus/Annals/14A*.html"
      ]
    ]
  },
  "seneca": {
    "name": "卢基乌斯·安奈乌斯·塞涅卡",
    "en": "Seneca the Younger",
    "life": "约前4—公元65年",
    "relation": "尼禄的老师和谋臣 · 斯多葛派哲学家",
    "place": "rome",
    "bio": "生在西班牙的科尔杜巴，道德文章和书信流传至今；当谋臣时攒下巨富，常被人讥为言行不一。",
    "sources": [
      [
        "塔西佗《编年史》第15卷（第60—64节 赐死）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Tacitus/Annals/15C*.html"
      ]
    ]
  },
  "commodus": {
    "name": "康茂德",
    "en": "Commodus",
    "life": "161—192年",
    "relation": "马可·奥勒留的儿子 · 头一个父亲在位时出生的皇帝",
    "place": "rome",
    "bio": "十五岁被父亲立为共治皇帝。狄奥说他生性并不坏，只是头脑简单又胆小，被身边的人牵着走；力气大、箭法准，在斗兽场里一天射死一百头熊。",
    "sources": [
      [
        "《罗马皇帝传·康茂德传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Historia_Augusta/Commodus*.html"
      ],
      [
        "卡西乌斯·狄奥《罗马史》第73卷",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/73*.html"
      ]
    ]
  },
  "pertinax": {
    "name": "佩蒂纳克斯",
    "en": "Pertinax",
    "life": "126—193年",
    "relation": "释奴之子 · 马可·奥勒留提拔的将领",
    "place": "albapompeia",
    "bio": "父亲是做木材生意的释奴，说自己做买卖“顽强”（pertinacia），就给儿子取名佩蒂纳克斯。他先当文法教师，嫌挣得少才去从军。",
    "sources": [
      [
        "《罗马皇帝传·佩蒂纳克斯传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Historia_Augusta/Pertinax*.html"
      ],
      [
        "卡西乌斯·狄奥《罗马史》第74卷",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/74*.html"
      ]
    ]
  },
  "hadrian": {
    "name": "哈德良",
    "en": "Hadrian",
    "life": "76—138年",
    "relation": "图拉真的表侄、养子 · 萨比娜的丈夫",
    "place": "italica",
    "bio": "留全脸胡子的头一个皇帝，人称“小希腊人”。临终写了一首小诗：“小灵魂，飘忽的，可爱的，身体的客人和伙伴，如今你要往哪里去？”",
    "sources": [
      [
        "《罗马皇帝传·哈德良传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Historia_Augusta/Hadrian/1*.html"
      ],
      [
        "卡西乌斯·狄奥《罗马史》第69卷",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/69*.html"
      ]
    ]
  },
  "caracalla": {
    "name": "卡拉卡拉",
    "en": "Caracalla",
    "life": "188—217年",
    "relation": "塞维鲁的长子 · 尤利娅·多姆娜的儿子",
    "place": "lugdunum",
    "bio": "本名巴西亚努斯，“卡拉卡拉”是他爱穿的一种高卢连帽长袍。他崇拜亚历山大，用据说是亚历山大用过的兵器和杯子，还编了一支一万六千人的“亚历山大方阵”。",
    "sources": [
      [
        "卡西乌斯·狄奥《罗马史》第78卷",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/78*.html"
      ],
      [
        "《罗马皇帝传·卡拉卡拉传》",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Historia_Augusta/Caracalla*.html"
      ]
    ]
  },
  "galerius": {
    "name": "伽列里乌斯",
    "en": "Galerius",
    "life": "约250—311年",
    "relation": "戴克里先的女婿、养子 · 东部的副皇帝、正皇帝",
    "place": "thessalonica",
    "bio": "多瑙河边牧人出身，外号“放牛的”；自称是母亲梦中与蛇交合所生，像亚历山大的母亲那样。298年他大败波斯王，在帖撒罗尼迦修了凯旋门。拉克坦提乌斯说他想把罗马帝国改名叫达契亚帝国。",
    "sources": [
      [
        "拉克坦提乌斯《论迫害者之死》",
        "https://www.newadvent.org/fathers/0705.htm"
      ],
      [
        "《罗马皇帝摘要》第40节",
        "https://roman-emperors.sites.luc.edu/epitome.htm"
      ]
    ]
  },
  "maxentius": {
    "name": "马克森提乌斯",
    "en": "Maxentius",
    "life": "约278—312年",
    "relation": "马克西米安的儿子 · 伽列里乌斯的女婿",
    "place": "rome",
    "bio": "四帝共治以来唯一常住罗马的皇帝。他重修被火烧毁的维纳斯与罗马神庙，在广场边起了一座大会堂，在阿庇亚大道边修了竞技场；他治下基督徒不受迫害。大会堂后来由君士坦丁完工，挂上了君士坦丁的名字。",
    "sources": [
      [
        "左西莫斯《新史》第2卷",
        "https://www.tertullian.org/fathers/zosimus02_book2.htm"
      ],
      [
        "拉克坦提乌斯《论迫害者之死》（第26—28、44节）",
        "https://www.newadvent.org/fathers/0705.htm"
      ]
    ]
  },
  "licinius": {
    "name": "李锡尼",
    "en": "Licinius",
    "life": "约265—325年",
    "relation": "伽列里乌斯的老战友 · 君士坦丁的妹夫",
    "place": "nicomedeia",
    "bio": "达契亚农家出身，没当过副皇帝就直接立为正皇帝。拉丁史家说他贪财、粗暴，看不起读书，管文学叫“毒药和公害”；也说他护着种地的人，管兵很严，骂宫里的宦官是“宫中的蛀虫”。",
    "sources": [
      [
        "《罗马皇帝摘要》第41节",
        "https://roman-emperors.sites.luc.edu/epitome.htm"
      ],
      [
        "《瓦莱西乌斯佚名作者》第1部分",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Excerpta_Valesiana/1*.html"
      ]
    ]
  },
  "helena": {
    "name": "海伦娜",
    "en": "Helena",
    "life": "约248—329年",
    "relation": "君士坦丁的母亲 · 君士坦提乌斯的前妻",
    "place": "jerusalem",
    "bio": "比提尼亚人，米兰主教安布罗斯说她原是驿站客栈的女佣。君士坦提乌斯当副皇帝时把她休了；儿子即位后尊她为“奥古斯塔”，金币上铸她的像。优西比乌说，她是被儿子领进基督教的。",
    "sources": [
      [
        "优西比乌《君士坦丁传》第3卷（第41—47节）",
        "https://www.newadvent.org/fathers/25023.htm"
      ]
    ]
  },
  "eusebius": {
    "name": "优西比乌",
    "en": "Eusebius of Caesarea",
    "life": "约260—339年",
    "relation": "凯撒里亚主教 · 《教会史》《君士坦丁传》的作者",
    "place": "caesarea",
    "bio": "教会史的开山之人。尼西亚会上他起初同情阿里乌，后来签了信经。336年君士坦丁在位三十年，他上殿致辞：地上的帝国照着天上的样子，一个上帝，一个皇帝。",
    "sources": [
      [
        "优西比乌《君士坦丁传》第4卷",
        "https://www.newadvent.org/fathers/25024.htm"
      ],
      [
        "优西比乌《教会史》第10卷",
        "https://www.newadvent.org/fathers/250110.htm"
      ]
    ]
  },
  "arius": {
    "name": "阿里乌",
    "en": "Arius",
    "life": "约256—336年",
    "relation": "亚历山大里亚的长老",
    "place": "alexandria",
    "bio": "利比亚人，讲道有名。他说圣子是被造的，“曾有一时没有他”；还把道理编成小曲，给水手、磨坊工和赶路的人唱。",
    "sources": [
      [
        "苏格拉底《教会史》第1卷（第5—9、38节）",
        "https://www.newadvent.org/fathers/26011.htm"
      ],
      [
        "菲洛斯托尔吉乌斯《教会史》摘要（第2卷第2节）",
        "https://www.tertullian.org/fathers/philostorgius.htm"
      ]
    ]
  },
  "athanasius": {
    "name": "阿塔纳修斯",
    "en": "Athanasius",
    "life": "约296—373年",
    "relation": "亚历山大里亚主教 · 尼西亚信经的旗手",
    "place": "alexandria",
    "bio": "尼西亚会上还是主教亚历山大的执事，328年接任主教。一生五次被流放，后人说他是“阿塔纳修斯对抗全世界”。",
    "sources": [
      [
        "阿塔纳修斯《驳阿里乌派的辩护》（第86—87节）",
        "https://www.newadvent.org/fathers/28082.htm"
      ]
    ]
  },
  "crispus": {
    "name": "克里斯普斯",
    "en": "Crispus",
    "life": "约300—326年",
    "relation": "君士坦丁的长子 · 拉克坦提乌斯的学生",
    "place": "treveri",
    "bio": "母亲米涅尔维娜，拉丁史书说是君士坦丁的情人。317年立为副皇帝，驻特里尔守莱茵河，老师是写《论迫害者之死》的拉克坦提乌斯。",
    "sources": [
      [
        "阿米安努斯《历史》第14卷（第11节）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Ammian/14*.html"
      ],
      [
        "哲罗姆《编年史》",
        "https://www.tertullian.org/fathers/jerome_chronicle_03_part2.htm"
      ]
    ]
  },
  "paul": {
    "name": "保罗",
    "en": "Paul",
    "life": "约5—约64年",
    "relation": "塔尔苏斯人 · 外邦人的使徒",
    "place": "tarsus",
    "bio": "生在小亚细亚的塔尔苏斯，以织帐篷为业，有罗马公民权；原是法利赛人，迫害过基督徒，自称在去大马士革的路上见到了复活的耶稣。",
    "sources": [
      [
        "《使徒行传》（和合本）",
        "https://zh.wikisource.org/wiki/%E8%81%96%E7%B6%93_(%E5%92%8C%E5%90%88%E6%9C%AC)/%E4%BD%BF%E5%BE%92%E8%A1%8C%E5%82%B3"
      ]
    ]
  },
  "josephus": {
    "name": "约瑟夫斯",
    "en": "Flavius Josephus",
    "life": "37—约100年",
    "relation": "犹太祭司 · 《犹太战争》的作者",
    "place": "rome",
    "bio": "祭司出身，66年起事时任加利利守将，兵败投降，预言韦斯巴芗要当皇帝，后来成了弗拉维家的门客，在罗马写下《犹太战争》和《犹太古史》。",
    "sources": [
      [
        "约瑟夫斯《犹太战争》第5卷",
        "https://penelope.uchicago.edu/josephus/war-5.html"
      ],
      [
        "约瑟夫斯《犹太古史》第14卷",
        "https://penelope.uchicago.edu/josephus/ant-14.html"
      ]
    ]
  },
  "leo": {
    "name": "利奥一世",
    "en": "Leo I",
    "life": "约400—461年",
    "relation": "罗马主教（教宗）",
    "place": "rome",
    "bio": "440年起任罗马主教，自认是彼得的继承人，要西方各地的主教都听罗马的。",
    "sources": [
      [
        "利奥一世《书信》第28封（致弗拉维安）",
        "https://www.newadvent.org/fathers/3604028.htm"
      ]
    ]
  },
  "moses": {
    "name": "摩西",
    "en": "Moses",
    "life": "传说人物",
    "relation": "利未人 · 出埃及的领袖（据经书）",
    "place": "horeb",
    "bio": "经书说他生在埃及，法老下令杀希伯来男婴，母亲把他放进蒲草箱漂在尼罗河上，被法老的女儿捡去养大。埃及文献里没有他；“摩西”是埃及名，利未人里的非尼哈等名字也出自埃及语。",
    "sources": [
      [
        "《出埃及记》（第2—3章，和合本）",
        "https://zh.wikisource.org/wiki/%E8%81%96%E7%B6%93_(%E5%92%8C%E5%90%88%E6%9C%AC)/%E5%87%BA%E5%9F%83%E5%8F%8A%E8%A8%98"
      ]
    ]
  },
  "akhenaten": {
    "name": "阿赫那吞",
    "en": "Akhenaten",
    "life": "在位约前1353—前1336年",
    "relation": "埃及第十八王朝法老 · 多数学者认为是图坦卡蒙的父亲",
    "place": "amarna",
    "bio": "原名阿蒙霍特普四世，即位后改名“对阿顿有益的人”，另建新都，把阿蒙神的名字从各处碑铭上凿掉。他一死新都被弃，旧神全部请回，后世提起他只说“那个罪人”。",
    "sources": [
      [
        "《阿顿颂》（英文资料）",
        "https://en.wikipedia.org/wiki/Great_Hymn_to_the_Aten"
      ]
    ]
  },
  "peter": {
    "name": "彼得",
    "en": "Peter",
    "life": "生年不详—约64年",
    "relation": "加利利的渔夫 · 十二门徒之首",
    "place": "capernaum",
    "bio": "原名西门，在加利利海打鱼，耶稣给他起名“磐石”（希腊语彼得）。耶稣被捕那夜，他三次说不认得耶稣；后来成了耶路撒冷门徒的头。传说他死在罗马，罗马主教后来自称他的继承人。",
    "sources": [
      [
        "《使徒行传》（第10—11、15章，和合本）",
        "https://zh.wikisource.org/wiki/%E8%81%96%E7%B6%93_(%E5%92%8C%E5%90%88%E6%9C%AC)/%E4%BD%BF%E5%BE%92%E8%A1%8C%E5%82%B3"
      ],
      [
        "《马可福音》（第14章 三次不认主，和合本）",
        "https://zh.wikisource.org/wiki/%E8%81%96%E7%B6%93_(%E5%92%8C%E5%90%88%E6%9C%AC)/%E9%A6%AC%E5%8F%AF%E7%A6%8F%E9%9F%B3"
      ]
    ]
  },
  "pliny-younger": {
    "name": "小普林尼",
    "en": "Pliny the Younger",
    "life": "约61—约113年",
    "relation": "图拉真派去比提尼亚的总督 · 老普林尼的外甥",
    "place": "nicomedeia",
    "bio": "科莫湖边的富家子，舅舅老普林尼在遗嘱里收他为养子。79年维苏威火山爆发，十七岁的他在海湾对岸看着舅舅驾船去救人、死在那里，后来写信给塔西佗细说经过。他的十卷书信，是了解图拉真时代的上好材料。",
    "sources": [
      [
        "小普林尼《书信》第10卷（第96—97封）",
        "https://www.attalus.org/old/pliny10b.html"
      ]
    ]
  },
  "cyprian": {
    "name": "居普良",
    "en": "Cyprian",
    "life": "约200—258年",
    "relation": "迦太基主教",
    "place": "carthage",
    "bio": "富家出身的修辞学教师，中年受洗，两年后就当上主教。德基乌斯迫害时他躲出城去，写信遥控教会，事后主张让献过祭的“跌倒者”悔罪回来；258年瓦勒良迫害时被斩首。",
    "sources": [
      [
        "蓬提乌斯《居普良传》",
        "https://www.newadvent.org/fathers/0505.htm"
      ],
      [
        "优西比乌《教会史》第6卷（第43节）",
        "https://www.newadvent.org/fathers/250106.htm"
      ]
    ]
  },
  "anthony-great": {
    "name": "安东尼",
    "en": "Anthony the Great",
    "life": "约251—356年",
    "relation": "埃及隐修士 · 修道运动之父",
    "place": "colzim",
    "bio": "下埃及富农之子，二十来岁父母双亡，听到经上说“变卖你所有的，分给穷人”，就散了家产，独居沙漠，活到一百零五岁。阿塔纳修斯为他写的传记传遍东西方，各地都有人学他进旷野。",
    "sources": [
      [
        "阿塔纳修斯《安东尼传》",
        "https://www.newadvent.org/fathers/2811.htm"
      ],
      [
        "安东尼（英文资料）",
        "https://en.wikipedia.org/wiki/Anthony_the_Great"
      ]
    ]
  },
  "gregory-nazianzus": {
    "name": "纳齐安的格列高利",
    "en": "Gregory of Nazianzus",
    "life": "约329—390年",
    "relation": "卡帕多西亚三教父之一 · 381年的君士坦丁堡主教",
    "place": "nazianzus",
    "bio": "纳齐安主教之子，在雅典和巴西尔同学，还认识日后的皇帝尤利安。379年他到教堂全归阿里乌派的君士坦丁堡，把亲戚的宅子改成一座小礼拜堂，在里面讲了五篇三位一体的道，听的人越来越多，东方教会尊他为“神学家”。",
    "sources": [
      [
        "纳齐安的格列高利《第42篇演说》（告别辞）",
        "https://www.newadvent.org/fathers/310242.htm"
      ],
      [
        "纳齐安的格列高利《书信》（第131封题记：辞谢382年的会议）",
        "https://www.newadvent.org/fathers/3103c.htm"
      ],
      [
        "纳齐安的格列高利（英文资料）",
        "https://en.wikipedia.org/wiki/Gregory_of_Nazianzus"
      ]
    ]
  },
  "nestorius": {
    "name": "聂斯托利",
    "en": "Nestorius",
    "life": "约386—约451年",
    "relation": "君士坦丁堡主教（428—431年）",
    "place": "constantinople",
    "bio": "生在叙利亚的日耳曼尼基亚，在安条克做修士，嗓子好、口才好。428年被请去当君士坦丁堡主教，头一回讲道就对皇帝说：给我一个清除了异端的天下，我还你一个天国；帮我除掉异端，我帮你打败波斯人。",
    "sources": [
      [
        "苏格拉底《教会史》第7卷（第29节 上任；第32、34节 “生神者”之争与以弗所会议）",
        "https://www.newadvent.org/fathers/26017.htm"
      ],
      [
        "聂斯托利（英文资料）",
        "https://en.wikipedia.org/wiki/Nestorius"
      ]
    ]
  },
  "john-chrysostom": {
    "name": "金口约翰",
    "en": "John Chrysostom",
    "life": "约347—407年",
    "relation": "君士坦丁堡主教（398—404年）",
    "place": "constantinople",
    "bio": "安条克人，跟异教的修辞名师利巴尼乌斯学过；利巴尼乌斯临终，有人问谁来接班，他说本该是约翰，可惜被基督徒抢走了。约翰进山苦修六年，最后两年不躺下睡觉，熬坏了胃和肾，才回城当长老，讲道出了名。",
    "sources": [
      [
        "索佐门《教会史》第8卷（第2节 利巴尼乌斯的话）",
        "https://www.newadvent.org/fathers/26028.htm"
      ],
      [
        "帕拉狄乌斯《金口约翰传》（第5节 进山苦修；第11节 死在科马纳）",
        "https://www.tertullian.org/fathers/palladius_dialogus_02_text.htm"
      ]
    ]
  },
  "pulcheria": {
    "name": "普尔喀丽娅",
    "en": "Pulcheria",
    "life": "398或399—453年",
    "relation": "阿卡狄乌斯的长女 · 狄奥多西二世的姐姐",
    "place": "constantinople",
    "bio": "十五岁当上奥古斯塔，替弟弟理政多年，在宫里先后跟皇后、宦官争权。450年弟弟死后，她嫁给老将马尔西安，扶他称帝，自己照旧守贞，一手促成了卡尔西顿会议。",
    "sources": [
      [
        "索佐门《教会史》第9卷（第1节 普尔喀丽娅）",
        "https://www.newadvent.org/fathers/26029.htm"
      ],
      [
        "普尔喀丽娅（英文资料）",
        "https://en.wikipedia.org/wiki/Pulcheria"
      ]
    ]
  },
  "stilicho": {
    "name": "斯提里科",
    "en": "Stilicho",
    "life": "约359—408年",
    "relation": "西罗马统帅 · 霍诺留的岳父",
    "place": "ravenna",
    "bio": "父亲是汪达尔骑兵军官，母亲是罗马人。383年随使团出使波斯，回来娶了狄奥多西的侄女塞雷娜，带兵二十多年；左西莫斯说，他是那个时代掌大权的人里最有分寸的一个。",
    "sources": [
      [
        "左西莫斯《新史》第5卷（第34节 斯提里科之死）",
        "https://www.tertullian.org/fathers/zosimus05_book5.htm"
      ],
      [
        "斯提里科（英文资料）",
        "https://en.wikipedia.org/wiki/Stilicho"
      ]
    ]
  },
  "aspar": {
    "name": "阿斯帕尔",
    "en": "Flavius Ardabur Aspar",
    "life": "约400—471年",
    "relation": "东罗马统帅 · 拥立马尔西安和利奥一世",
    "place": "constantinople",
    "bio": "阿兰与哥特血统的将门之子，424年随父亲出兵意大利，打掉西部的篡位者，把小皇帝瓦伦提尼安三世送上皇位。他在君士坦丁堡带兵近半个世纪，信阿里乌派，当不了皇帝，就当拥立皇帝的人；伊斯坦布尔至今有一座归在他名下的蓄水池。",
    "sources": [
      [
        "阿斯帕尔（英文资料）",
        "https://en.wikipedia.org/wiki/Aspar"
      ]
    ]
  },
  "anastasius-i": {
    "name": "阿纳斯塔修斯一世",
    "en": "Anastasius I Dicorus",
    "life": "约431—518年",
    "relation": "东罗马皇帝（491—518年）· 芝诺遗孀阿里阿德涅的丈夫",
    "place": "constantinople",
    "bio": "生在亚得里亚海边的都拉基乌姆，一只眼黑、一只眼蓝，外号“两色眼”。他原是宫里的侍从官，六十岁上被寡居的皇后选中当皇帝。他会算账，减税还攒下巨款；偏一性论，晚年被教派之争逼得摘冠示弱，八十多岁去世。",
    "sources": [
      [
        "阿纳斯塔修斯一世（英文资料）",
        "https://en.wikipedia.org/wiki/Anastasius_I_Dicorus"
      ]
    ]
  },
  "justin-i": {
    "name": "查士丁一世",
    "en": "Justin I",
    "life": "约450—527年",
    "relation": "东罗马皇帝（518—527年）· 查士丁尼的舅舅",
    "place": "constantinople",
    "bio": "伊利里亚贝德里亚纳的农家子，说拉丁语，希腊语只会一点。年轻时步行进京当兵，打过伊苏里亚人和波斯人，升到警卫军统领。妻子原是他买来的蛮族女奴，登基后改名欧菲米娅。",
    "sources": [
      [
        "查士丁一世（英文资料）",
        "https://en.wikipedia.org/wiki/Justin_I"
      ]
    ]
  },
  "theodora": {
    "name": "狄奥多拉",
    "en": "Theodora",
    "life": "约497—548年",
    "relation": "查士丁尼的皇后",
    "place": "constantinople",
    "bio": "父亲在赛车场给绿党驯熊，早亡；她少年登台当演员。查士丁尼为娶她，请舅舅改了不许元老级人物娶女演员的法律。她站在一性论一边，常替他们说话，皇帝对一性论派也因此时紧时松。",
    "sources": [
      [
        "狄奥多拉（英文资料）",
        "https://en.wikipedia.org/wiki/Theodora_(wife_of_Justinian_I)"
      ]
    ]
  },
  "belisarius": {
    "name": "贝利萨留",
    "en": "Belisarius",
    "life": "约500—565年",
    "relation": "查士丁尼的大将",
    "place": "constantinople",
    "bio": "生在今保加利亚西南的小城日耳曼尼亚，年轻时是查士丁尼的卫士，二十多岁就领兵对波斯。他打仗爱用计，自养一支多达七千人的私兵。后世说他被皇帝刺瞎、沦为乞丐，是几百年后才有的传说。",
    "sources": [
      [
        "贝利萨留（英文资料）",
        "https://en.wikipedia.org/wiki/Belisarius"
      ]
    ]
  },
  "theodoric-great": {
    "name": "狄奥多里克",
    "en": "Theodoric the Great",
    "life": "约454—526年",
    "relation": "东哥特王 · 意大利的统治者（493—526年）",
    "place": "ravenna",
    "bio": "东哥特王族之子，七八岁起在君士坦丁堡当了八九年人质，在那里学会读写算。回去后带着族人在巴尔干勒索东罗马，488年被芝诺打发去意大利，493年杀了奥多亚克，统治意大利三十三年。",
    "sources": [
      [
        "狄奥多里克大王（英文资料）",
        "https://en.wikipedia.org/wiki/Theodoric_the_Great"
      ]
    ]
  },
  "clovis": {
    "name": "克洛维",
    "en": "Clovis I",
    "life": "约466—511年",
    "relation": "法兰克王（481—511年）",
    "place": "tours",
    "bio": "十五岁继承父亲在高卢北部的一小块法兰克王位，三十年里打掉罗马残部、阿勒曼尼人和西哥特人，把各支法兰克王一个个除掉，死时几乎占了整个高卢。他娶的克洛蒂尔德信天主教，他自己后来也受了洗。",
    "sources": [
      [
        "克洛维一世（英文资料）",
        "https://en.wikipedia.org/wiki/Clovis_I"
      ]
    ]
  },
  "leovigild": {
    "name": "莱奥维吉尔德",
    "en": "Liuvigild",
    "life": "约519—586年",
    "relation": "西哥特王（568—586年）· 雷卡雷德的父亲",
    "place": "toletum",
    "bio": "先跟哥哥共治，哥哥死后独掌王国，几乎年年出征，吞了苏维汇，又从拜占庭手里夺回科尔多瓦。他想让哥特人和罗马人合成一个国，可自己到死仍守阿里乌派。",
    "sources": [
      [
        "莱奥维吉尔德（英文资料）",
        "https://en.wikipedia.org/wiki/Liuvigild"
      ]
    ]
  },
  "gelasius-i": {
    "name": "格拉修一世",
    "en": "Pope Gelasius I",
    "life": "？—496年",
    "relation": "罗马教宗（492—496年）",
    "place": "rome",
    "bio": "生在北非的罗马行省，给皇帝写信自称“生来是罗马人”。他坚持要把已故牧首阿卡奇乌的名字从东方的代祷名单上划掉，寸步不让；在罗马城里，他终于禁掉了从建城传说流传下来的牧神节。",
    "sources": [
      [
        "教宗格拉修一世（英文资料）",
        "https://en.wikipedia.org/wiki/Pope_Gelasius_I"
      ]
    ]
  },
  "imhotep": {
    "name": "伊姆霍特普",
    "en": "Imhotep",
    "life": "约前27世纪",
    "relation": "左塞尔的掌印大臣 · 赫利奥波利斯太阳神的大祭司",
    "place": "saqqara",
    "bio": "名字意为“平安到来的人”。他死后一千二百年里没有文字再提他；新王国起有人给他奠酒，再往后成了医神，祭祀中心在孟菲斯，希腊人把他认作阿斯克勒庇俄斯。他的墓至今没找到。",
    "sources": [
      [
        "伊姆霍特普（英文资料）",
        "https://en.wikipedia.org/wiki/Imhotep"
      ]
    ]
  },
  "khufu": {
    "name": "胡夫",
    "en": "Khufu (Cheops)",
    "life": "在位约前2589—前2566年",
    "relation": "古王国第四王朝国王 · 斯尼夫鲁之子",
    "place": "giza",
    "bio": "大金字塔的主人，希腊人叫他基奥普斯，留下的唯一一尊近乎完整的雕像是个象牙小像。他死后有专门划出的庄园供养祭司，到第六王朝末侍奉他的祭司已有六十七个，这份祭祀一直延续到波斯时代。把他写成暴君的，是两千年后的希腊作家。",
    "sources": [
      [
        "胡夫（英文资料）",
        "https://en.wikipedia.org/wiki/Khufu"
      ]
    ]
  },
  "senusret-iii": {
    "name": "森沃斯雷特三世",
    "en": "Senusret III (Sesostris III)",
    "life": "在位约前1878—前1839年",
    "relation": "中王国第十二王朝国王 · 森沃斯雷特二世之子",
    "place": "semna",
    "bio": "第十二王朝的第五位王，在位三十多年。他是少数活着就被当作神来祭祀的埃及国王，死后在阿拜多斯又被祭祀了约三百年；希腊人传说里征服四方的“塞索斯特里斯”，有他的影子。",
    "sources": [
      [
        "森沃斯雷特三世（英文资料）",
        "https://en.wikipedia.org/wiki/Senusret_III"
      ]
    ]
  },
  "ahmose-i": {
    "name": "雅赫摩斯一世",
    "en": "Ahmose I",
    "life": "在位约前1550—前1525年",
    "relation": "新王国第十八王朝的开创者 · 塞肯内拉·陶之子、卡摩斯之弟",
    "place": "avaris",
    "bio": "七岁丧父，十岁即位，母亲阿赫霍特普摄政。他赶走喜克索斯人，重新统一埃及，以底比斯为都；在位约二十五年，三十五岁上下去世，在阿拜多斯修了埃及本土国王的最后一座金字塔。",
    "sources": [
      [
        "雅赫摩斯一世（英文资料）",
        "https://en.wikipedia.org/wiki/Ahmose_I"
      ]
    ]
  },
  "hatshepsut": {
    "name": "哈特谢普苏特",
    "en": "Hatshepsut",
    "life": "约前1505—前1458年",
    "relation": "新王国第十八王朝的女王 · 图特摩斯三世的姑母兼继母",
    "place": "deirelbahari",
    "bio": "图特摩斯一世的长女，嫁给异母兄弟图特摩斯二世。称王以后，她的雕像和浮雕多照男王的样子，戴假胡须、穿短裙。她在位约二十年，修了代尔拜赫里的神殿。各地凿掉她的名字和像，是她死后二十来年、图特摩斯三世晚年才开始的。",
    "sources": [
      [
        "哈特谢普苏特（英文资料）",
        "https://en.wikipedia.org/wiki/Hatshepsut"
      ]
    ]
  },
  "ramesses-ii": {
    "name": "拉美西斯二世",
    "en": "Ramesses II",
    "life": "约前1303—前1213年",
    "relation": "新王国第十九王朝国王（前1279—前1213年在位）· 塞提一世之子",
    "place": "piramesses",
    "bio": "二十五岁即位，在位六十六年，九十岁上下去世，办过十三四次登基周年大典，比哪位法老都多。希腊人叫他奥西曼迪亚斯，十九世纪雪莱的诗《奥西曼迪亚斯》，写的就是他倒在沙漠里的巨像。他的木乃伊1881年在王家木乃伊窖藏里找到。",
    "sources": [
      [
        "拉美西斯二世（英文资料）",
        "https://en.wikipedia.org/wiki/Ramesses_II"
      ]
    ]
  },
  "piye": {
    "name": "皮耶",
    "en": "Piye (Piankhi)",
    "life": "在位约前744—前714年",
    "relation": "库施国王、第二十五王朝的开创者 · 卡什塔之子",
    "place": "napata",
    "bio": "以纳帕塔为都，在位约三十年。他把北伐当成圣战，令士兵开战前沐浴洁身；得胜以后回了努比亚，再没回过埃及。他是五百多年来头一个葬进金字塔的法老，墓在库鲁。",
    "sources": [
      [
        "皮耶（英文资料）",
        "https://en.wikipedia.org/wiki/Piye"
      ]
    ]
  },
  "nectanebo-ii": {
    "name": "内克塔内布二世",
    "en": "Nectanebo II",
    "life": "在位约前358—前340年",
    "relation": "第三十王朝末代国王 · 最后一位埃及本土出身的法老",
    "place": "memphis",
    "bio": "他在全国大修神庙、厚待祭司，百姓奉他为“神鹰”。兵败后逃往上埃及、再到努比亚，下落不明。后来流传的《亚历山大传奇》，说他逃到马其顿，成了亚历山大的生父。",
    "sources": [
      [
        "内克塔内布二世（英文资料）",
        "https://en.wikipedia.org/wiki/Nectanebo_II"
      ],
      [
        "亚历山大传奇（英文资料）",
        "https://en.wikipedia.org/wiki/Alexander_Romance"
      ]
    ]
  },
  "cornelius-gallus": {
    "name": "科尔内利乌斯·伽卢斯",
    "en": "Gaius Cornelius Gallus",
    "life": "约前70—前26年",
    "relation": "罗马诗人 · 屋大维派驻埃及的首任长官",
    "place": "alexandria",
    "bio": "出身寒微，和维吉尔拜过同一位老师，写过四卷情诗，奥维德把他排在罗马哀歌诗人的头一位。他追随屋大维，前30年在利比亚边上挡住安东尼，随即当上第一任埃及长官。他的诗几乎全部失传，1978年努比亚的伊布里姆堡出土了九行。",
    "sources": [
      [
        "科尔内利乌斯·伽卢斯（英文资料）",
        "https://en.wikipedia.org/wiki/Gaius_Cornelius_Gallus"
      ],
      [
        "卡西乌斯·狄奥《罗马史》第53卷（第23节）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Cassius_Dio/53*.html"
      ]
    ]
  },
  "dioscorus": {
    "name": "狄奥斯库若",
    "en": "Dioscorus I of Alexandria",
    "life": "生年不详—454年",
    "relation": "亚历山大里亚宗主教（444—451年）· 西里尔的接班人",
    "place": "alexandria",
    "bio": "西里尔的秘书和指定接班人，444年接任亚历山大里亚宗主教，不是本地埃及人。他收回被侵占的教产和船只；卡尔西顿会上有人告他把朝廷运往利比亚的小麦收购后高价倒卖。451年被革职，454年死在流放地冈格拉，科普特人奉他为圣人。",
    "sources": [
      [
        "狄奥斯库若一世（英文资料）",
        "https://en.wikipedia.org/wiki/Pope_Dioscorus_I_of_Alexandria"
      ]
    ]
  },
  "shutruk-nakhunte": {
    "name": "舒特鲁克-纳洪特",
    "en": "Shutruk-Nakhunte",
    "life": "？—约前1155年",
    "relation": "埃兰国王（约前1184—前1155年在位）",
    "place": "susa",
    "bio": "埃兰中期最强的国王，自称“安善与苏萨之王”。他打进巴比伦尼亚，把一批古碑运回苏萨献给城神因舒希纳克；三千年后，法国考古队在苏萨卫城把这些碑挖了出来，汉谟拉比法典碑和纳拉姆-辛胜利碑如今都在卢浮宫。",
    "sources": [
      [
        "舒特鲁克-纳洪特（英文资料）",
        "https://en.wikipedia.org/wiki/Shutruk-Nakhunte"
      ]
    ]
  },
  "cyaxares": {
    "name": "基亚克萨雷斯",
    "en": "Cyaxares",
    "life": "？—前585年",
    "relation": "米底国王（前625—前585年）",
    "place": "ecbatana",
    "bio": "据希罗多德，他是米底王弗拉欧尔特斯之子，父亲死于和亚述的战争。他把扎格罗斯山里的米底部落拢成一国，联合巴比伦灭了亚述，与吕底亚打成平手，前585年讲和后不久去世，王位传给儿子阿斯提阿格斯。",
    "sources": [
      [
        "基亚克萨雷斯（英文资料）",
        "https://en.wikipedia.org/wiki/Cyaxares"
      ]
    ]
  },
  "cyrus-ii": {
    "name": "居鲁士二世",
    "en": "Cyrus the Great",
    "life": "约前600—前530年",
    "relation": "波斯国王（前559—前530年）· 阿契美尼德帝国的开创者",
    "place": "pasargadae",
    "bio": "安善王冈比西斯一世之子，据希罗多德，母亲是米底王阿斯提阿格斯的女儿。他十一年间吞并米底、吕底亚和巴比伦，在故乡新建都城帕萨尔加德，前530年在中亚征战时死去，葬在帕萨尔加德一座石砌的小屋形陵墓里。",
    "sources": [
      [
        "居鲁士大帝（英文资料）",
        "https://en.wikipedia.org/wiki/Cyrus_the_Great"
      ]
    ]
  },
  "darius-i": {
    "name": "大流士一世",
    "en": "Darius I",
    "life": "约前550—前486年",
    "relation": "波斯国王（前522—前486年）· 居鲁士的女婿",
    "place": "persepolis",
    "bio": "希斯塔斯佩斯之子，曾在冈比西斯身边当持矛侍卫。他杀了居鲁士的小儿子夺位，又娶了居鲁士的两个女儿；定省、定税、修路、铸币，在波斯波利斯修起新宫，前490年派兵渡海征希腊，在马拉松受挫。",
    "sources": [
      [
        "大流士一世（英文资料）",
        "https://en.wikipedia.org/wiki/Darius_the_Great"
      ]
    ]
  },
  "mithridates-ii": {
    "name": "米特拉达梯二世",
    "en": "Mithridates II",
    "life": "？—前91年",
    "relation": "安息国王（前124—前91年）",
    "place": "seleucia",
    "bio": "安息国王，后世称“大王”。他打退东边的草原部落，把锡斯坦封给苏伦家族；往西扣下亚美尼亚王子提格兰做人质，后来扶他回国当王，把边界推到幼发拉底河。汉使到安息，正是在他这一朝。",
    "sources": [
      [
        "米特拉达梯二世（英文资料）",
        "https://en.wikipedia.org/wiki/Mithridates_II_of_Parthia"
      ]
    ]
  },
  "surena": {
    "name": "苏雷那",
    "en": "Surena",
    "life": "？—约前52年",
    "relation": "安息大将 · 苏伦家族的家主",
    "place": "carrhae",
    "bio": "苏伦家族的家主，世代有为安息王加冕的特权。据普鲁塔克，他是安息人里最高大俊美的，却照米底人的打扮涂脸、分头发；不到三十岁就帮奥罗德斯二世复位，带头登城攻下塞琉西亚。卡莱大胜后不久被国王处死。",
    "sources": [
      [
        "普鲁塔克《克拉苏传》（第21、24、33节）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Plutarch/Lives/Crassus*.html"
      ],
      [
        "苏雷那（英文资料）",
        "https://en.wikipedia.org/wiki/Surena"
      ]
    ]
  },
  "shapur-i": {
    "name": "沙普尔一世",
    "en": "Shapur I",
    "life": "？—270年",
    "relation": "萨珊国王（240—270年）· 阿尔达希尔一世之子",
    "place": "bishapur",
    "bio": "阿尔达希尔一世之子，240年起与父亲共治。他三败罗马，把掳来的罗马人安置在伊朗各地，王号也加成“伊朗与非伊朗的王中之王”；在法尔斯新建比沙普尔城。他让摩尼随驾，又为王室成员的灵魂设火坛，天天献羊。",
    "sources": [
      [
        "沙普尔一世（英文资料）",
        "https://en.wikipedia.org/wiki/Shapur_I"
      ]
    ]
  },
  "mani": {
    "name": "摩尼",
    "en": "Mani",
    "life": "216—274年前后",
    "relation": "摩尼教的创立者 · 沙普尔一世的座上客",
    "place": "gundeshapur",
    "bio": "生在泰西封附近，母亲出自安息王族的一支。他自称“耶稣基督的使徒”，信徒说他是琐罗亚斯德、佛陀、耶稣的再来；他也是有名的画师。教团分“选民”和“听者”：选民守全部戒律，听者供养选民。",
    "sources": [
      [
        "摩尼（英文资料）",
        "https://en.wikipedia.org/wiki/Mani_(prophet)"
      ]
    ]
  },
  "kavad-i": {
    "name": "卡瓦德一世",
    "en": "Kavad I",
    "life": "约473—531年",
    "relation": "萨珊国王（488—496年、498—531年在位）· 卑路斯之子",
    "place": "ctesiphon",
    "bio": "卑路斯之子，少年时在嚈哒宫廷当过人质。十五岁被大贵族扶上台，借马兹达克派压贵族和祭司，被废后越狱逃往嚈哒，又带嚈哒兵复位。他两度同东罗马开战，晚年清算马兹达克派，临终立第三子库思老为嗣。",
    "sources": [
      [
        "卡瓦德一世（英文资料）",
        "https://en.wikipedia.org/wiki/Kavad_I"
      ],
      [
        "普罗柯比《战史》第1卷（第11节 请查士丁收养库思老）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Procopius/Wars/1B*.html"
      ]
    ]
  },
  "khosrow-i": {
    "name": "库思老一世",
    "en": "Khosrow I",
    "life": "？—579年",
    "relation": "萨珊国王（531—579年）· 卡瓦德一世的第三子",
    "place": "ctesiphon",
    "bio": "死后得名“不朽的灵魂”（阿努希尔万），生前号称“主持公道者”，伊斯兰时代称“公正者”。他丈量土地、定额收税，扶植德赫干，把全国兵权一分为四；东边联合突厥灭了嚈哒。他一死，大贵族又很快把权力夺了回去。",
    "sources": [
      [
        "库思老一世（英文资料）",
        "https://en.wikipedia.org/wiki/Khosrow_I"
      ],
      [
        "普罗柯比《战史》第2卷（第28节 545年停战，点名要医生特里布努斯）",
        "https://penelope.uchicago.edu/Thayer/E/Roman/Texts/Procopius/Wars/2I*.html"
      ]
    ]
  },
  "justin-ii": {
    "name": "查士丁二世",
    "en": "Justin II",
    "life": "约520—578年",
    "relation": "东罗马皇帝（565—578年）· 查士丁尼的外甥",
    "place": "constantinople",
    "bio": "查士丁尼的妹妹维吉兰提娅之子，娶了狄奥多拉的外甥女索菲娅。即位时许诺还清国债，停了给阿瓦尔人和波斯的钱，结果两头开战。573年达拉失守后精神失常，此后的朝政由皇后和提比略掌管。",
    "sources": [
      [
        "查士丁二世（英文资料）",
        "https://en.wikipedia.org/wiki/Justin_II"
      ]
    ]
  },
  "tiberius-ii": {
    "name": "提比略二世",
    "en": "Tiberius II Constantine",
    "life": "约535—582年",
    "relation": "东罗马皇帝（578—582年）· 查士丁二世的养子",
    "place": "constantinople",
    "bio": "由牧首尤提基乌斯荐给查士丁当文书，后任禁卫统领；574年被立为恺撒，578年即位。出手阔绰，减税散金，花钱分化伦巴第人；把国库花空后停付阿瓦尔人岁赐，丢了西尔米乌姆。临终立女婿莫里斯。",
    "sources": [
      [
        "提比略二世（英文资料）",
        "https://en.wikipedia.org/wiki/Tiberius_II_Constantine"
      ]
    ]
  },
  "maurice": {
    "name": "莫里斯",
    "en": "Maurice",
    "life": "539—602年",
    "relation": "东罗马皇帝（582—602年）· 提比略二世的女婿",
    "place": "constantinople",
    "bio": "生在卡帕多西亚的阿拉比苏斯，母语希腊语。帮库思老二世复位，换来亚美尼亚西部；设意大利、非洲两个总督区；传世兵书《战略》托在他名下。理财极省，减饷、不赎俘虏，602年被哗变的军队推翻，是查士丁尼王朝最后一位皇帝。",
    "sources": [
      [
        "莫里斯（英文资料）",
        "https://en.wikipedia.org/wiki/Maurice_(emperor)"
      ]
    ]
  },
  "phocas": {
    "name": "福卡斯",
    "en": "Phocas",
    "life": "约547—610年",
    "relation": "东罗马皇帝（602—610年）· 推翻莫里斯的百夫长",
    "place": "constantinople",
    "bio": "色雷斯多瑙河军中的百夫长，602年被哗变的士兵推举进京，杀了莫里斯一家称帝。在位八年靠清洗坐稳，东线连连失守；对罗马教会出手大方。他是头一个在钱币上留胡子的皇帝，此后的皇帝几乎都留胡子。610年被希拉克略斩首。",
    "sources": [
      [
        "福卡斯（英文资料）",
        "https://en.wikipedia.org/wiki/Phocas"
      ]
    ]
  },
  "heraclius": {
    "name": "希拉克略",
    "en": "Heraclius",
    "life": "约575—641年",
    "relation": "拜占庭皇帝（610—641年）· 非洲总督老希拉克略之子",
    "place": "constantinople",
    "bio": "610年从迦太基带舰队推翻福卡斯。在位三十一年，先丢了叙利亚、埃及，又亲征打进波斯腹地，628年逼和波斯；随后叙利亚、埃及又归了阿拉伯人。在他手里，帝国的官方语言由拉丁语换成希腊语，皇帝改称巴西琉斯。",
    "sources": [
      [
        "希拉克略（英文资料）",
        "https://en.wikipedia.org/wiki/Heraclius"
      ]
    ]
  },
  "jacob-baradaeus": {
    "name": "雅各·巴拉代",
    "en": "Jacob Baradaeus",
    "life": "约500—578年",
    "relation": "埃德萨主教（543—578年）· 一性论派叙利亚教会的组织者",
    "place": "edessa",
    "bio": "生在叙利亚北部，在修道院长大，约527年进京，在君士坦丁堡的修道院住了十五年，得到皇后狄奥多拉和加萨尼王哈里斯的信任。543年被祝圣为主教后乔装四处奔走，为一性论派另立了一整套主教，叙利亚正教会因此又叫“雅各派”。",
    "sources": [
      [
        "雅各·巴拉代（英文资料）",
        "https://en.wikipedia.org/wiki/Jacob_Baradaeus"
      ]
    ]
  },
  "vigilius": {
    "name": "维吉利乌斯",
    "en": "Pope Vigilius",
    "life": "?—555年",
    "relation": "罗马教宗（537—555年）· 由贝利萨留扶上位",
    "place": "rome",
    "bio": "罗马贵族子弟，曾任教宗驻君士坦丁堡的使节，与皇后狄奥多拉往来。537年贝利萨留废了教宗西尔维留，扶他继任。545年被押往新都，在三章案上反复多次，最终签字，回国途中死在西西里。",
    "sources": [
      [
        "维吉利乌斯（英文资料）",
        "https://en.wikipedia.org/wiki/Pope_Vigilius"
      ]
    ]
  },
  "sergius-cp": {
    "name": "塞尔吉乌斯一世",
    "en": "Sergius I of Constantinople",
    "life": "?—638年",
    "relation": "君士坦丁堡牧首（610—638年）· 希拉克略的牧首",
    "place": "constantinople",
    "bio": "父母是叙利亚的一性论信徒，原在圣索菲亚做执事、管济贫。610年为希拉克略加冕、主婚；618年劝住要迁都迦太基的皇帝，626年与大臣博努斯守城；提出“一个能力”“一个意志”的折中，681年被会议革除。",
    "sources": [
      [
        "君士坦丁堡的塞尔吉乌斯一世（英文资料）",
        "https://en.wikipedia.org/wiki/Sergius_I_of_Constantinople"
      ]
    ]
  },
  "maximus-confessor": {
    "name": "马克西姆斯",
    "en": "Maximus the Confessor",
    "life": "约580—662年",
    "relation": "修士、神学家 · 两个意志说的主将",
    "place": "carthage",
    "bio": "早年在希拉克略的宫中任职，后来出家；波斯人打进小亚细亚时逃到迦太基，跟随索弗罗尼乌斯。他主张基督有神、人两个意志，645年辩倒皮洛士，653年在罗马被捕，662年被割舌断手，流放高加索而死；681年会议定的正是他的主张。",
    "sources": [
      [
        "马克西姆斯（英文资料）",
        "https://en.wikipedia.org/wiki/Maximus_the_Confessor"
      ]
    ]
  },
  "constantine-v": {
    "name": "君士坦丁五世",
    "en": "Constantine V",
    "life": "718—775年",
    "relation": "拜占庭皇帝（741—775年）· 利奥三世的儿子",
    "place": "constantinople",
    "bio": "利奥三世的独子，两岁就被立为共治皇帝，娶了可萨汗的女儿。他九次出征保加尔，亲自写过十几篇反圣像的论文，把京城的近卫团练成职业兵，死后给儿子留下满满的国库。他死在征保加尔的路上；圣像派得胜后，他的遗骨被移出了皇陵。",
    "sources": [
      [
        "君士坦丁五世（英文资料）",
        "https://en.wikipedia.org/wiki/Constantine_V"
      ]
    ]
  },
  "irene-athens": {
    "name": "伊琳娜",
    "en": "Irene of Athens",
    "life": "约752—803年",
    "relation": "利奥四世的皇后 · 君士坦丁六世的母亲，797—802年独自称帝",
    "place": "constantinople",
    "bio": "雅典萨兰塔佩霍斯家族的孤女，769年嫁给君士坦丁五世的儿子利奥。丈夫死后她摄政、恢复圣像，797年弄瞎儿子，成了罗马帝国头一个独自当政的女人；文书和钱币上多称“女皇”，偶尔自称“皇帝”。",
    "sources": [
      [
        "伊琳娜（英文资料）",
        "https://en.wikipedia.org/wiki/Irene_of_Athens"
      ]
    ]
  },
  "shahrbaraz": {
    "name": "沙赫巴拉兹",
    "en": "Shahrbaraz",
    "life": "？—630年",
    "relation": "萨珊大将，米赫兰家族 · 630年篡位称王四十天",
    "place": "alexandria",
    "bio": "“沙赫巴拉兹”是称号，意为“国家的野猪”。他出自安息旧族米赫兰家，娶了库思老二世的姐妹，先后攻下耶路撒冷和亚历山大里亚；后与库思老翻脸，按兵不动。630年夺了王位，四十天后被杀。儿子尼基塔斯信基督教，后来做了罗马的将领。",
    "sources": [
      [
        "沙赫巴拉兹（英文资料）",
        "https://en.wikipedia.org/wiki/Shahrbaraz"
      ],
      [
        "塞贝奥斯《亚美尼亚史》（第24、28章，贝德罗西安英译）",
        "https://archive.org/details/SebeosHistoryOfArmenia"
      ]
    ]
  },
  "bonus-magister": {
    "name": "博努斯",
    "en": "Bonus (patrician)",
    "life": "？—627年",
    "relation": "拜占庭贵族、大臣 · 622—626年留守京城",
    "place": "constantinople",
    "bio": "希拉克略的亲信，诗人乔治·皮西迪亚称他是皇帝的“战友”。皇帝亲征那几年，他和牧首塞尔吉乌斯一同辅佐少年皇子、主持京城，史料多称他“大臣”。626年阿瓦尔人围城，由他统兵守御。他在城里修过一座大蓄水池，627年5月去世。",
    "sources": [
      [
        "博努斯（英文资料）",
        "https://en.wikipedia.org/wiki/Bonus_(patrician)"
      ],
      [
        "《复活节编年史》（626年守城、627年5月下葬，丁多夫校本）",
        "https://archive.org/details/chroniconpascha01dindgoog"
      ]
    ]
  },
  "brunhild": {
    "name": "布伦希尔德",
    "en": "Brunhild (Brunhilda)",
    "life": "约543—613年",
    "relation": "奥斯特拉西亚王后 · 西吉贝尔特一世的妻子",
    "place": "w_metz",
    "bio": "西哥特王阿塔纳吉尔德的小女儿，在西班牙长大，嫁到法兰克时由阿里乌派改信天主教。丈夫遇刺后，她先后替儿子、孙子、曾孙掌权，修路建堡、整顿财政，和教宗格雷戈里一世书信往来，也和贵族、主教一再交恶。",
    "sources": [
      [
        "布伦希尔德（英文资料）",
        "https://en.wikipedia.org/wiki/Brunhilda_of_Austrasia"
      ]
    ]
  },
  "charles-martel": {
    "name": "查理·马特",
    "en": "Charles Martel",
    "life": "约688—741年",
    "relation": "法兰克宫相 · 丕平二世的儿子、丕平三世的父亲",
    "place": "w_saintdenis",
    "bio": "丕平二世和情妇阿尔派达的儿子。父亲死后被继母关押，逃出来打败继母和纽斯特里亚人，718年起掌握全法兰克。他几乎年年出征，打弗里西亚人、萨克森人、巴伐利亚人、阿基坦和普罗旺斯；“马特”（铁锤）是后来编年史给的外号。",
    "sources": [
      [
        "查理·马特（英文资料）",
        "https://en.wikipedia.org/wiki/Charles_Martel"
      ]
    ]
  },
  "pepin-short": {
    "name": "丕平三世（矮子丕平）",
    "en": "Pepin the Short",
    "life": "约714—768年",
    "relation": "法兰克王（751—768年）· 查理·马特的儿子、查理曼的父亲",
    "place": "w_saintdenis",
    "bio": "查理·马特的次子，在圣但尼修道院跟修士读过书。741年和哥哥卡洛曼分任宫相，747年哥哥出家后独掌大权，751年废末代墨洛温王自立。他两次出兵意大利替教宗打伦巴第人，又从阿拉伯人手里收回纳博讷，768年死后葬在圣但尼。",
    "sources": [
      [
        "矮子丕平（英文资料）",
        "https://en.wikipedia.org/wiki/Pepin_the_Short"
      ]
    ]
  },
  "gregory-great": {
    "name": "格雷戈里一世（大格雷戈里）",
    "en": "Pope Gregory I (the Great)",
    "life": "约540—604年",
    "relation": "教宗（590—604年）",
    "place": "rome",
    "bio": "罗马元老之子，三十出头任罗马城长官。父亲死后，他把罗马的家宅改成修道院，自己当了修士；后被教宗派到君士坦丁堡当了六年驻京代表。590年当选教宗。五到十一世纪的教宗里，只有他的书信和著作留存得足以成套。",
    "sources": [
      [
        "格雷戈里一世（英文资料）",
        "https://en.wikipedia.org/wiki/Pope_Gregory_I"
      ]
    ]
  },
  "charlemagne": {
    "name": "查理曼（查理大帝）",
    "en": "Charlemagne",
    "life": "748—814年",
    "relation": "法兰克王（768—814年）、伦巴第王、皇帝（800—814年）· 丕平三世的儿子",
    "place": "w_aachen",
    "bio": "丕平三世的长子。据艾因哈德，他身高是自己脚长的七倍，拉丁语说得和母语一样好，希腊语听得懂、说不好；晚年在枕头下放写字板练字，起步太晚，终究没学成。他几乎年年出征，晚年住在亚琛，常邀上百人一起泡温泉。",
    "sources": [
      [
        "查理曼（英文资料）",
        "https://en.wikipedia.org/wiki/Charlemagne"
      ],
      [
        "艾因哈德《查理曼传》（第22—25节 相貌、温泉、学问）",
        "https://sourcebooks.fordham.edu/basis/einhard.asp"
      ]
    ]
  },
  "pope-leo-iii": {
    "name": "利奥三世",
    "en": "Pope Leo III",
    "life": "生年不详—816年",
    "relation": "教宗（795—816年）· 给查理曼加冕的人",
    "place": "rome",
    "bio": "罗马本地人，不是贵族出身，前任教宗哈德良任他为圣苏珊娜堂的枢机司铎。795年哈德良下葬当天他就被选为教宗，随即把圣彼得墓的钥匙和罗马城的旗帜送给查理，表示认他做保护人。他在位二十多年，816年去世。",
    "sources": [
      [
        "教宗利奥三世（英文资料）",
        "https://en.wikipedia.org/wiki/Pope_Leo_III"
      ]
    ]
  },
  "bahram-chobin": {
    "name": "巴赫拉姆·楚宾",
    "en": "Bahram Chobin",
    "life": "？—591年",
    "relation": "萨珊大将，米赫兰家族 · 590—591年自立为王（巴赫拉姆六世）",
    "place": "bactra",
    "bio": "安息旧族米赫兰家出身，当过雷伊的总督，绰号“楚宾”意为“标枪”，因为人又高又瘦。他在罗马战线立过功，588年大败突厥。称王失败后投奔突厥，还替可汗平过内乱，最后被库思老收买突厥王族刺杀。后来中亚的萨曼王朝自称是他的后代。",
    "sources": [
      [
        "巴赫拉姆·楚宾（英文资料）",
        "https://en.wikipedia.org/wiki/Bahram_Chobin"
      ],
      [
        "塞贝奥斯《亚美尼亚史》（第2章，贝德罗西安英译）",
        "https://archive.org/details/SebeosHistoryOfArmenia"
      ]
    ]
  },
  "khosrow-ii": {
    "name": "库思老二世",
    "en": "Khosrow II",
    "life": "约570—628年",
    "relation": "萨珊国王（590—628年）· 霍尔木兹四世之子、库思老一世之孙",
    "place": "ctesiphon",
    "bio": "霍尔木兹四世之子，母亲出自安息旧族伊斯帕赫布丹家。即位前当过高加索阿尔巴尼亚的总督，把格鲁吉亚并成波斯的行省。他号称“得胜者”，娶基督徒希琳为后，偏向一性论派；打到埃及和君士坦丁堡对岸，最后被儿子推翻处死。",
    "sources": [
      [
        "库思老二世（英文资料）",
        "https://en.wikipedia.org/wiki/Khosrow_II"
      ],
      [
        "巴拉祖里《列国征服记》下册（默戈腾英译：熏香的账本）",
        "https://archive.org/details/originsoftheisla032520mbp"
      ]
    ]
  },
  "yazdegerd-iii": {
    "name": "伊嗣俟三世",
    "en": "Yazdegerd III",
    "life": "约624—651年",
    "relation": "萨珊末代国王（632—651年）· 库思老二世之孙",
    "place": "merv",
    "bio": "库思老二世之孙，父亲沙赫里亚尔被叔父卡瓦德二世所杀，他躲在伊斯塔赫尔才活下来，八岁被大族抬上王位，实权在鲁斯塔姆等人手里。他几次遣使到长安求援，唐太宗没有出兵。至今琐罗亚斯德教的历法仍从他即位那年起算。",
    "sources": [
      [
        "伊嗣俟三世（英文资料）",
        "https://en.wikipedia.org/wiki/Yazdegerd_III"
      ],
      [
        "巴拉祖里《列国征服记》上册（希蒂英译：伊嗣俟之死）",
        "https://archive.org/details/originsofislamic01albauoft"
      ]
    ]
  },
  "peroz-iii": {
    "name": "卑路斯三世",
    "en": "Peroz III",
    "life": "636—约679年",
    "relation": "伊嗣俟三世之子 · 唐朝的波斯都督、右武卫将军",
    "place": "changan",
    "bio": "伊嗣俟三世之子。父亲死后投奔吐火罗，屡次遣使向唐求援；661年唐在疾陵城设波斯都督府，以他为都督，次年又封他为波斯王。地盘失守后，他在670年代来到长安，授右武卫将军，此后再没回到伊朗。",
    "sources": [
      [
        "卑路斯三世（英文资料）",
        "https://en.wikipedia.org/wiki/Peroz_III"
      ],
      [
        "《新唐书·西域传下》（波斯）",
        "https://zh.wikisource.org/wiki/%E6%96%B0%E5%94%90%E6%9B%B8/%E5%8D%B7221%E4%B8%8B"
      ],
      [
        "乾陵（英文资料：684年建成，神道旁有六十一尊外国使臣石像）",
        "https://en.wikipedia.org/wiki/Qianling_Mausoleum"
      ]
    ]
  },
  "tang-taizong": {
    "name": "唐太宗",
    "en": "Emperor Taizong of Tang",
    "life": "598—649年",
    "relation": "唐朝皇帝（626—649年）· 唐高祖李渊次子",
    "place": "changan",
    "bio": "名李世民，唐高祖李渊的次子。隋末随父起兵，带兵削平各路割据。626年发动玄武门之变登上皇位，年号贞观。他灭了东突厥，被西北各部尊为“天可汗”；晚年亲征高句丽，没能取胜。",
    "sources": [
      [
        "唐太宗（英文资料）",
        "https://en.wikipedia.org/wiki/Emperor_Taizong_of_Tang"
      ],
      [
        "《资治通鉴》卷193（天可汗）",
        "https://zh.wikisource.org/wiki/%E8%B3%87%E6%B2%BB%E9%80%9A%E9%91%91/%E5%8D%B7193"
      ]
    ]
  }
};
const FIGURE_SCENES={
  "history-leagues/1": [
    {
      "id": "socrates",
      "when": "前5世纪中后期",
      "event": "在雅典追问德性与正义",
      "note": "公民大会天天争论该怎么做，他偏要追问：你们凭什么认定自己是对的？"
    },
    {
      "id": "protagoras",
      "when": "前5世纪中叶",
      "event": "智者与公民教育",
      "note": "人人都能上台发言，会说话就成了本事。智者开班教辩论，学费不菲。"
    }
  ],
  "history-peloponnesian-war/1": [
    {
      "id": "socrates",
      "when": "前432—前429年间",
      "event": "哲学家也参加城邦战争",
      "note": "以重装步兵身份参加波提狄亚（Potidaea）之战，据说还救过年轻的亚西比德一命。"
    },
    {
      "id": "gorgias",
      "when": "前427年",
      "event": "出使雅典",
      "note": "替家乡莱昂蒂尼向雅典求援、对付叙拉古，一场演说轰动全城。修辞直接为联盟政治服务。"
    }
  ],
  "history-peloponnesian-war/3": [
    {
      "id": "socrates",
      "when": "前406年",
      "event": "顶着众怒反对集体审判",
      "note": "前406年阿吉纽西海战打赢了，将领们却因没救起落水士兵被一并审判。轮值主持议事的苏格拉底，拒绝把违法的提案付诸表决。"
    },
    {
      "id": "plato",
      "when": "前5世纪末",
      "event": "在战争与政变中成长",
      "note": "战败、寡头政变、民主复辟，他都亲眼看见；母亲的堂兄克里提亚（Critias）正是“三十僭主”的首领。权力能否带来正义，成了他一生的问题。"
    },
    {
      "id": "xenophon",
      "when": "前5世纪末",
      "event": "苏格拉底圈子中的另一位作者",
      "note": "日后写下《回忆苏格拉底》（Memorabilia），留下一个和柏拉图笔下不太一样的老师。"
    }
  ],
  "history-spartan-decline/0": [
    {
      "id": "socrates",
      "when": "前399年",
      "event": "苏格拉底之死",
      "note": "前403年民主恢复，四年后雅典却以不敬神、败坏青年为名判他死刑。他的学生里出过投敌的亚西比德和僭主克里提亚，这笔账也算到了老师头上。他本可出逃，据《斐多篇》，却平静地饮下了毒药。"
    },
    {
      "id": "plato",
      "when": "前399年以后",
      "event": "写下苏格拉底的形象",
      "note": "老师死后，他把老师写进一部部对话录；哲学与城邦的冲突，成了他思想的中心。"
    }
  ],
  "history-macedonian-rise/0": [
    {
      "id": "aristotle",
      "when": "前347—前343/342年",
      "event": "从学园到马其顿宫廷",
      "place": "mieza",
      "note": "柏拉图一死，老夫便离开雅典，先后在阿索斯和莱斯博斯岛研究海洋生物；约前343／342年，应腓力之邀去马其顿教王子。"
    },
    {
      "id": "theophrastus",
      "when": "前340年代中期",
      "event": "莱斯博斯岛上的共同研究",
      "note": "莱斯博斯岛本地人，与老夫一起观察、解剖、分类动植物，后世称他为“植物学之父”。"
    },
    {
      "id": "alexander",
      "when": "约前343/342年起",
      "event": "王子的教育",
      "note": "在米埃扎（Mieza）读荷马、学政治，同窗里有日后的亲信赫费斯提翁（Hephaestion）。据说他东征时把老夫校订的《伊利亚特》和匕首一起压在枕下。"
    },
    {
      "id": "plato",
      "when": "前347年",
      "event": "柏拉图去世",
      "note": "约八十岁去世。学园没有散，换了主人接着办。"
    },
    {
      "id": "speusippus",
      "when": "前347年起",
      "event": "接掌柏拉图学园",
      "note": "柏拉图的外甥，主持学园约八年；同一师门的思路，也在继承中分道扬镳。"
    }
  ],
  "history-macedonian-rise/1": [
    {
      "id": "xenocrates",
      "when": "前339/338年起",
      "event": "学园第三任主持者",
      "note": "继斯彪西波主持学园，一做就是二十五年。"
    },
    {
      "id": "diogenes",
      "when": "前4世纪中后期",
      "event": "别挡住我的阳光",
      "note": "住在大陶瓮里，把体面和财富都当作枷锁。据说亚历山大在科林斯来访，问他想要什么，他答：请让一让，别挡住我的阳光。"
    }
  ],
  "history-spartan-decline/3": [
    {
      "id": "plato",
      "when": "传统约前387年",
      "event": "雅典学园形成",
      "note": "在城外阿卡德摩斯（Academus）的园林里讲学，“学园”（Academy）一词由此而来。"
    },
    {
      "id": "antisthenes",
      "when": "前4世纪初",
      "event": "从苏格拉底走向犬儒传统",
      "note": "把老师的克己推到极致：财富、名声都是累赘，有德性就够了。"
    },
    {
      "id": "aristippus",
      "when": "前4世纪初",
      "event": "另一条道路：愉悦与自制",
      "note": "同出苏格拉底门下，却主张享受愉悦，前提是做愉悦的主人，而不是它的奴隶。"
    }
  ],
  "history-spartan-decline/5": [
    {
      "id": "plato",
      "when": "前4世纪上半叶",
      "event": "学园与对话录",
      "note": "雅典丢了霸权，却没丢吸引人才的本事，各地学生照旧往学园来。"
    },
    {
      "id": "aristotle",
      "when": "约前367年起",
      "event": "进入柏拉图学园",
      "note": "老夫十七岁从北方的斯塔基拉（Stagira）来到学园，一待就是二十年。"
    }
  ],
  "history-spartan-decline/1": [
    {
      "id": "xenophon",
      "when": "前401年起",
      "event": "远征、撤退与《远征记》",
      "note": "将领们被波斯人诱杀后，他被推举出来，带着万人军翻越亚美尼亚雪山；望见黑海时，士兵齐声高呼：“海！海！”他的《远征记》（Anabasis）让希腊人相信，波斯腹地并非不可穿越。",
      "place": "trapezus"
    }
  ],
  "history-macedonian-rise/3": [
    {
      "id": "aristotle",
      "when": "前335年",
      "event": "吕刻昂开始讲学",
      "note": "前335年老夫回到雅典，在吕刻昂（Lyceum）办学，常边散步边讲课，后人称“逍遥学派”。学生在东征，老师在雅典收集各邦的政制。"
    }
  ],
  "history-alexander-rule/1": [
    {
      "id": "callisthenes",
      "when": "前327年",
      "event": "少一个吻，也不俯拜",
      "note": "阿里安记载：宴会上众人依次俯拜、领吻，他喝完酒径直走向国王，不拜。国王不肯吻他，他说：“那我就少得一个吻走了。”同年被牵入侍童谋反案，拘押后死去。老夫早说过，这孩子口才极好，就是少了点分寸。"
    }
  ],
  "history-alexander-rule/2": [
    {
      "id": "alexander",
      "place": "opis",
      "when": "前324年",
      "event": "谁有资格成为国王的亲人",
      "note": "老兵抱怨：波斯人能被称作国王的“亲人”，能吻国王，我们却不行。亚历山大当场说：你们全是我的亲人。和解宴上，马其顿人与波斯人同席，共祈“和睦”。"
    }
  ],
  "history-successors/0": [
    {
      "id": "aristotle",
      "when": "前323—前322年",
      "event": "帝国的死讯传回雅典",
      "place": "chalcis",
      "note": "雅典反马其顿情绪高涨，有人告老夫不敬神。老夫说，不能让雅典人第二次对哲学犯罪，便去了卡尔基斯，次年在那里去世。"
    },
    {
      "id": "theophrastus",
      "when": "前323年起",
      "event": "吕刻昂继续研究",
      "place": "athens",
      "note": "接掌吕刻昂三十多年，据说学生多达两千。共同体比创办者活得更久。"
    }
  ],
  "history-celts/0": [
    {
      "id": "brennus",
      "when": "前279年",
      "event": "兵临德尔斐",
      "note": "率军突破温泉关，直扑德尔斐。希腊人说，雷电、地震和山崩替他们赶走了敌人；布伦努斯负伤撤退，据说自尽而死。一场抵抗，就这样被讲成了神迹。"
    }
  ],
  "history-celts/2": [
    {
      "id": "attalus",
      "when": "前3世纪后半叶",
      "event": "胜利怎样变成雕像",
      "note": "击败加拉太人后，帕加马立起纪念群像，《垂死的高卢人》（Dying Gaul）就出自这一传统。敌人塑得越悲壮勇武，胜者越光彩。"
    }
  ],
  "history-spartan-reforms/0": [
    {
      "id": "agis-iv",
      "when": "前245—前241年",
      "event": "免债之后，分地受阻",
      "note": "他带头交出家产，债券在广场上一把火烧了。可分地被他舅舅拖着不办——舅舅欠债多，田产也多。政敌反扑，阿吉斯连同母亲、祖母一起被处死。"
    },
    {
      "id": "cleomenes-iii",
      "when": "约前227年",
      "event": "从土地改革重建军队",
      "note": "趁出征之机杀回城内，处死监察官、废除这一职位；随后免债分地，把公民扩充到约四千人，改用马其顿式长枪。斯巴达又能打了。"
    }
  ],
  "history-spartan-reforms/1": [
    {
      "id": "cleomenes-iii",
      "when": "前222年",
      "event": "改革政权的战场终点",
      "note": "塞拉西亚兵败后，他逃往埃及投靠托勒密，前219年在亚历山大里亚起事失败，自尽而死。斯巴达最后一位改革者，死在了异国。",
      "place": "sellasia"
    }
  ],
  "history-ptolemaic-bargain/1": [
    {
      "id": "rosetta-decree",
      "when": "前196年",
      "event": "祭司为国王确认地位",
      "note": "诏令列举托勒密五世（Ptolemy V）给神庙的恩惠和减免的税负，祭司则授予他神圣荣誉。国王借神庙取得合法性，神庙借国王保住资源。"
    }
  ],
  "history-hellenistic-knowledge/0": [
    {
      "id": "epicurus",
      "when": "约前306年起",
      "event": "朋友共同体中的安宁",
      "note": "在雅典的“花园”里和朋友同住共食。他说：死亡与我们无关——我们在时它不在，它来时我们已不在。"
    },
    {
      "id": "zeno",
      "when": "约前300年起",
      "event": "彩绘柱廊里的哲学",
      "note": "来自塞浦路斯基提翁（Citium）的商人，据说船难后流落雅典，在书摊读到写苏格拉底的书，从此改行学哲学。“斯多亚”之名来自他讲学的柱廊（stoa）。"
    }
  ],
  "history-hellenistic-knowledge/1": [
    {
      "id": "euclid",
      "when": "约前300年",
      "event": "把几何组织成体系",
      "note": "在亚历山大里亚写成《几何原本》（Elements），从几条公设一步步推出整套几何。传说国王嫌太难，问有没有捷径，他答：几何学里没有王者之路。"
    },
    {
      "id": "eratosthenes",
      "when": "前3世纪后半叶",
      "event": "用两地太阳高度估算地球",
      "note": "夏至正午，赛伊尼（Syene，今阿斯旺）的太阳几乎直射，亚历山大里亚的日影却偏了约七度。他用这个角度和两地距离，算出了相当接近的地球周长。"
    }
  ],
  "history-hellenistic-knowledge/2": [
    {
      "id": "archimedes",
      "when": "前214—前212年",
      "event": "研究者与守城器械",
      "note": "传说他的起重爪能把罗马战船吊起摔翻。罗马主将马塞卢斯（Marcellus）下令留他性命，他还是死在一名士兵手里；据说临死前还在地上画图：“别弄乱我的圆。”"
    }
  ],
  "history-eastern-kingdoms/1": [
    {
      "id": "mithridates-i",
      "when": "前141年",
      "event": "接管两河的税源与城市",
      "note": "拿下巴比伦尼亚后，他在钱币上自称“爱希腊者”（Philhellene），拉拢希腊语城市。留着城市制度收税，比毁掉它们划算。"
    }
  ],
  "history-hellenistic-end/2": [
    {
      "id": "cleopatra-vii",
      "when": "前31—前30年",
      "event": "埃及的命运进入罗马内战",
      "note": "先后与恺撒、安东尼（Mark Antony）结盟，想借罗马强人保住埃及。阿克提乌姆失利后，屋大维（Octavian）攻入埃及，安东尼与她相继自杀，托勒密王朝终结。"
    }
  ],
  "history-rome-kings/1": [
    {
      "id": "servius-tullius",
      "when": "前6世纪中叶",
      "event": "按家产给人民分等",
      "note": "他做了全民普查，按财产把男子分成几等、编成百人团：出什么装备、在哪一等投票，都看家产。克劳狄皇帝说他原名马斯塔尔纳（Mastarna），是伊特鲁里亚的军事冒险家。"
    },
    {
      "id": "tarquinius-superbus",
      "when": "前6世纪末",
      "event": "打落最高的罂粟花",
      "note": "儿子塞克斯图斯混进加比伊城，派人回来请示。他一言不发，在花园里用手杖把最高的罂粟花一朵朵打落；儿子会意，除掉了加比伊的头面人物。希罗多德讲过希腊僭主的同款故事。",
      "place": "gabii"
    }
  ],
  "history-rome-republic/0": [
    {
      "id": "lucius-brutus",
      "when": "前509年",
      "event": "亲自监斩两个儿子",
      "note": "共和刚立，他的两个儿子卷入迎回塔克文的密谋。身为执政官，他坐在审判席上看着儿子被鞭打、斩首，始终没有回避。"
    }
  ],
  "history-rome-republic/1": [
    {
      "id": "tarquinius-superbus",
      "when": "前509—前495年",
      "event": "借兵复辟，客死库迈",
      "note": "先求伊特鲁里亚诸城，再求拉丁诸城，雷吉卢斯湖一败，只好投奔库迈的僭主阿里斯托德穆斯（Aristodemus），前495年死在那里。",
      "place": "cumae"
    }
  ],
  "history-rome-plebs/0": [
    {
      "id": "spurius-cassius",
      "when": "前486—前485年",
      "event": "分地法与“图谋称王”",
      "note": "他第三次任执政官时，提议把公地分给平民和拉丁盟友。元老院指他收买人心、图谋称王，不少平民也嫌他把地分给外人。卸任次年，他被处死。官员想拉着平民单干，元老院就拉上另一部分平民来对付他。"
    }
  ],
  "history-rome-plebs/1": [
    {
      "id": "appius-decemvir",
      "when": "前451—前449年",
      "event": "讨好平民，连任专权",
      "note": "第一届十人团编法有功。他四处讨好平民，带着一批新人连任第二届，掌权后却不再改选、随意判罚。倒台后被关进监狱，死在狱中。"
    }
  ],
  "history-rome-orders/0": [
    {
      "id": "camillus",
      "when": "前396—前390年",
      "event": "攻灭维爱，又被流放",
      "note": "围城多年后，他挖地道攻破维爱，凯旋时坐四匹白马拉的战车，被指僭越神明；又被控私吞战利品，自请流放。高卢人破城后，他被召回任独裁官。"
    },
    {
      "id": "aristotle",
      "when": "前4世纪中后期",
      "event": "在雅典听说罗马失陷",
      "note": "老夫在雅典也听说过：一支凯尔特人攻破了一座叫罗马的城。可惜老夫把救城的人记成了“卢基乌斯”，几百年后普鲁塔克还专门挑过这个错。",
      "place": "athens"
    }
  ],
  "history-rome-orders/1": [
    {
      "id": "manlius-capitolinus",
      "when": "前385—前384年",
      "event": "从救城英雄到塔佩亚岩下",
      "note": "他变卖家产替欠债人赎身，在家门口聚起一大群拥护者。元老院说他想当王，保民官出面起诉，人民判他死刑。他从卡匹托尔山的塔佩亚岩被推下，离他当年救下的地方只有几步。"
    },
    {
      "id": "licinius-stolo",
      "when": "前376—前367年",
      "event": "十年否决，逼开执政官",
      "note": "传说起因是家事：他的妻子是贵族之女，看见姐夫当高官、侍从用权棒敲门的排场，回家郁郁不乐。法案通过十年后，他自己因占公地超过五百尤格被罚，犯的正是自己定的法。"
    },
    {
      "id": "camillus",
      "when": "前367年",
      "event": "许愿修建和谐女神庙",
      "note": "他第五次任独裁官，起初替元老院挡李锡尼法，最后转而调停，许愿修建和谐女神庙，纪念贵族与平民和解。",
      "place": "rome"
    }
  ],
  "history-rome-mature/1": [
    {
      "id": "appius-caecus",
      "when": "前312年",
      "event": "修大道、开水渠、改名册",
      "note": "他任监察官，修了阿庇亚大道和第一条引水渠，花光国库也不跟元老院商量；又把被释奴的儿子列进元老名册，把城里的穷人分进各个部落、摊开票力。元老院不认他的名单。"
    },
    {
      "id": "decius-mus",
      "when": "前295年",
      "event": "学父亲以身献祭",
      "note": "森提努姆一战，他指挥的一翼被高卢战车冲乱。他照父亲前340年的做法念完祷词，把自己连同敌军一起献给冥神，单骑冲进敌阵战死，罗马军随即稳住。平民家族也有了贵族式的荣耀。"
    }
  ],
  "history-rome-mature/3": [
    {
      "id": "appius-caecus",
      "when": "前279年",
      "event": "失明后被抬进元老院",
      "note": "皮洛士派使者基尼阿斯（Cineas）来议和，元老们开始动摇。年老失明的阿庇乌斯让儿子们把他抬进元老院，说敌军一天不离开意大利，罗马就一天不谈和。议和作罢。"
    },
    {
      "id": "curius-dentatus",
      "when": "前275年",
      "event": "煮萝卜的执政官",
      "note": "前275年他在贝内文图姆击败皮洛士。萨莫奈使者曾带着金子上门，看见他坐在炉边煮萝卜。他回绝说：吃这种饭的人用不着金子；征服有金子的人，比自己有金子更体面。"
    }
  ],
  "history-rome-mature/0": [
    {
      "id": "manlius-torquatus",
      "when": "前340年",
      "event": "斩了违令出战的儿子",
      "note": "拉丁战争开打前，他下令任何人不得擅自出阵。儿子受敌将挑衅出战，赢了，提着战利品回营。他当着全军把儿子斩首。“曼利乌斯式的命令”从此指冷酷到底的军令。"
    }
  ],
  "history-rome-punic/1": [
    {
      "id": "hannibal",
      "when": "前216年",
      "event": "“你会取胜，却不会利用胜利”",
      "note": "坎尼战后，骑兵统帅马哈巴尔劝他五天内直扑罗马，他没有答应。马哈巴尔叹道：“你会取胜，却不会利用胜利。”他手里没有攻城器械，真正的打算是拆散罗马的同盟。"
    },
    {
      "id": "fabius-maximus",
      "when": "前217年",
      "event": "人民另立一个独裁官",
      "note": "他只跟不打，被讥为“汉尼拔的跟班”。人民大会一气之下，让他的副手米努基乌斯与他平起平坐，罗马头一回有两个独裁官。米努基乌斯冒进中伏，被费边救出，回营后自愿再听他的。坎尼之后，罗马又回到他的打法。"
    }
  ],
  "history-rome-punic/2": [
    {
      "id": "scipio-africanus",
      "when": "前210—前202年",
      "event": "没当过执政官就领兵",
      "note": "前210年没人敢接西班牙的烂摊子，二十四岁的他站出来报名，人民大会一致授他兵权，次年奇袭新迦太基。当上执政官后他要打非洲，费边在元老院反对，他放话要去找人民；元老院让步，他从西西里渡海，在扎马赢了汉尼拔。"
    }
  ],
  "history-rome-east/0": [
    {
      "id": "hannibal",
      "when": "前196—约前183年",
      "event": "改革、出逃、服毒",
      "note": "战后他当选迦太基的最高长官苏菲特，清查财政，得罪了把持国库的寡头。对头们向罗马告发他私通安条克三世，他连夜出逃，投奔安条克，后来辗转到比提尼亚。罗马人追来索人，他服毒自尽。"
    }
  ],
  "history-rome-east/1": [
    {
      "id": "scipio-africanus",
      "when": "前187—前183年",
      "event": "“忘恩的祖国”",
      "place": "liternum",
      "note": "他的兄弟被控私吞安条克的赔款，他当众撕掉账本。轮到他自己受审，他提醒人民这天是扎马大捷的纪念日，带着众人上卡匹托尔山谢神，审判不了了之。之后他退居利特尔农，死在那里；据说墓碑上写着：“忘恩的祖国，你连我的骨头都得不到。”"
    },
    {
      "id": "cato-elder",
      "when": "前184年",
      "event": "监察官：盯住冒尖的人",
      "note": "他当上监察官，把奢侈品按十倍估价征税，开除了七名元老，其中一个是前执政官。西庇阿兄弟的案子背后也有他。在他看来，共和最怕一个人比所有人都大。"
    },
    {
      "id": "aemilius-paullus",
      "when": "前168—前167年",
      "event": "凯旋前后丧二子",
      "note": "他的凯旋游行走了三天。凯旋前五天，一个儿子病死；凯旋后三天，另一个也死了。另外两个儿子早已过继给别家，其中一个就是后来的小西庇阿。他对人民说：命运把福气给了国家，把灾祸留给了我家，这样很好。"
    },
    {
      "id": "polybius",
      "when": "前167年",
      "event": "一千名人质之一",
      "note": "皮德纳战后，罗马把亚该亚同盟一千名头面人物押到意大利，不审不放，十六年后只剩约三百人回乡。他被留在罗马，和十八岁的小西庇阿从借书开始交往，成了一辈子的朋友。"
    }
  ],
  "history-rome-east/2": [
    {
      "id": "scipio-aemilianus",
      "when": "前147—前133年",
      "event": "破格当选，连下两城",
      "note": "前147年他还不够当执政官的年龄，人民大会破格选他，派去攻迦太基。前134年他再任执政官，去围努曼提亚，营中有两个年轻人：后来的马略，和努米底亚王子朱古达。前133年城破时，他的妻舅提比略·格拉古正在罗马推土地法。"
    },
    {
      "id": "cato-elder",
      "when": "前168—前149年",
      "event": "写史不写将军名字",
      "note": "晚年他写了第一部拉丁文罗马史《起源》，只记战事，不记将军的名字；倒记下了布匿战争里最勇敢的一头战象，叫苏鲁斯（Surus）。"
    }
  ],
  "history-rome-gracchi/0": [
    {
      "id": "tiberius-gracchus",
      "when": "前137—前133年",
      "event": "一路走过伊特鲁里亚",
      "note": "弟弟盖约后来写道：哥哥去西班牙上任，路过伊特鲁里亚，只见放牧耕田的全是外来奴隶，看不到一个自由农民，分地的念头由此而起。在西班牙，他谈和救下两万罗马兵，元老院却不认账。"
    }
  ],
  "history-rome-gracchi/1": [
    {
      "id": "gaius-gracchus",
      "when": "前124—前123年",
      "event": "哥哥托梦",
      "note": "西塞罗记载：盖约竞选保民官前梦见哥哥对他说，不管怎样推辞，你都得走我的路、死我的死。"
    },
    {
      "id": "cornelia",
      "when": "前121年以后",
      "event": "“格拉古兄弟之母”",
      "note": "两个儿子都死于非命后，她退居米塞努姆，照常待客，讲起儿子从不落泪。罗马人给她立像，题字只写：“格拉古兄弟之母科尔内利娅”。"
    }
  ],
  "history-rome-marius/0": [
    {
      "id": "jugurtha",
      "when": "前111—前104年",
      "event": "被罗马买下，又被罗马处死",
      "note": "他被传唤到罗马作证，买通一位保民官当众不准他开口，还在城里派人杀了一个争王位的堂兄弟。前104年他跟在马略的凯旋车后游街，然后被扔进地牢饿死。"
    },
    {
      "id": "marius",
      "when": "前107年",
      "event": "征兵不看家产",
      "note": "征兵的财产门槛其实早已一降再降，从一万一千阿斯降到一千五百；马略这年干脆不看家产，公开招募无产者，罗马从此有了以当兵为业的人。"
    },
    {
      "id": "sulla",
      "when": "前105年",
      "event": "戒指上的功劳",
      "note": "他亲自涉险去见毛里塔尼亚王，把朱古达骗到手。此后他的印章戒指上刻着朱古达被交出的场面，马略看了一辈子不舒服。"
    }
  ],
  "history-rome-social/1": [
    {
      "id": "pompey",
      "when": "前89年",
      "event": "十七岁的新兵",
      "note": "他在父亲庞培·斯特拉波的军中攻打阿斯库路姆，同营的还有同岁的西塞罗。"
    }
  ],
  "history-rome-sulla/0": [
    {
      "id": "mithridates-vi",
      "when": "前88年",
      "event": "一天杀八万",
      "note": "他密令亚细亚各城在同一天动手，把城里的罗马人和意大利人连同妻儿奴仆一起杀掉。许多城邦恨透了罗马包税人，照办了。"
    },
    {
      "id": "sulla",
      "when": "前88年",
      "event": "躲进马略家，再带兵进城",
      "note": "普鲁塔克说，苏拉被追杀时一头冲进马略家，马略从后门放走了他；苏拉在回忆录里却说自己是去找马略商量。几天后他就带着军队回来了。"
    }
  ],
  "history-rome-sulla/1": [
    {
      "id": "cinna",
      "when": "前87—前84年",
      "event": "把大哥请回来",
      "note": "被元老院撤职后，他拉起意大利新公民和奴隶组成的军队，召回马略。马略死后他独掌罗马，前84年整军准备迎击苏拉，在安科纳被自己的士兵哗变打死。"
    },
    {
      "id": "marius",
      "when": "前86年",
      "event": "第七次执政官",
      "note": "七十岁的他第七次就任执政官，夜里噩梦连连，白天酗酒，十七天后病死。据说他小时候接住过一个掉落的鹰巢，里面有七只雏鹰，占卜说他将七任执政官。"
    }
  ],
  "history-rome-sulla/2": [
    {
      "id": "crassus",
      "when": "前82年",
      "event": "科林门与公敌财产",
      "note": "科林门一战苏拉亲领的一翼被冲垮，是克拉苏的右翼赢了。战后他低价买进公敌的家产，据说还为了一处产业把无辜的人添进名单，苏拉从此不再重用他。"
    },
    {
      "id": "caesar",
      "when": "前82—前81年",
      "event": "“这孩子身上有好多个马略”",
      "note": "苏拉命他休掉秦纳的女儿，十八岁的他不从，被夺了祭司职位和妻子的嫁妆，病中还四处躲藏。亲友求情，苏拉松了口，叹道：你们会后悔的，这孩子身上有好多个马略。"
    },
    {
      "id": "sulla",
      "when": "前79—前78年",
      "event": "交权与回忆录",
      "note": "他辞去独裁官，遣散侍从，在广场上散步，说谁要问他的罪都可以来。隐居后写了二十二卷回忆录，写到临死前两天。",
      "place": "puteoli"
    }
  ],
  "history-rome-pompey/0": [
    {
      "id": "spartacus",
      "when": "前73—前71年",
      "event": "杀马决战",
      "note": "最后一战前，他当众杀了自己的战马：赢了，敌人的好马有的是；输了，也用不着马了。他冲向克拉苏，砍倒两名百夫长，战死在阵中。"
    },
    {
      "id": "pompey",
      "when": "前81年",
      "event": "“伟大者”",
      "note": "他从非洲回来，苏拉出城迎接，称他“伟大者”（Magnus）；他过了好些年，才把这个称号正式用进自己的名字。"
    }
  ],
  "history-rome-pompey/1": [
    {
      "id": "pompey",
      "when": "前62年",
      "event": "解散军队",
      "note": "人人以为他会学苏拉带兵进城，他却在布伦迪西乌姆把大军遣散回家，只带随从进了罗马。"
    },
    {
      "id": "mithridates-vi",
      "when": "前63年",
      "event": "毒药毒不死自己",
      "note": "儿子法纳西斯叛变，他在潘提卡彭服毒，可多年服毒练出的抗性让毒药不起作用，只好命一名高卢卫士刺死自己。",
      "place": "panticapaeum"
    },
    {
      "id": "cato-younger",
      "when": "前61—前60年",
      "event": "晾着庞培",
      "note": "他和庞培的老对头卢库卢斯联手，在元老院逐条审议庞培的东方安排、卡住老兵分地，一拖就是一年多。"
    }
  ],
  "history-rome-triumvirate/0": [
    {
      "id": "caesar",
      "when": "前75年",
      "event": "被海盗绑架",
      "note": "海盗要二十塔兰特赎金，他嫌少，主动开价五十。等赎金期间他跟海盗一起写诗练讲演，笑说出去后要把他们钉上十字架。获释后他果然带船抓回海盗，全部钉死，只是先割断了喉咙，算是宽大。"
    },
    {
      "id": "cicero",
      "when": "前63年",
      "event": "“国父”",
      "note": "他当着喀提林的面在元老院开口就问：“喀提林，你还要滥用我们的耐心到几时？”事后未经审判处死同谋，被尊为“国父”；五年后又因此被克洛狄乌斯赶去流亡。"
    },
    {
      "id": "cato-younger",
      "when": "前60—前59年",
      "event": "用嘴拖死对手",
      "note": "他最拿手的是发言拖时间，一直讲到天黑散会，好让表决泡汤；前60年就这样逼恺撒在凯旋和竞选之间二选一。前59年他又说个不停，恺撒命人把他拖进监狱，元老们跟着离席，恺撒只好放人。"
    }
  ],
  "history-rome-triumvirate/2": [
    {
      "id": "crassus",
      "when": "前53年",
      "event": "卡莱",
      "note": "儿子普布利乌斯率骑兵出击，被诱进敌阵阵亡，首级挑在枪尖上示众。克拉苏被逼去和谈，死在混乱中。",
      "place": "carrhae"
    },
    {
      "id": "clodius",
      "when": "前62—前52年",
      "event": "从善德女神到阿庇亚大道",
      "note": "前62年他男扮女装混进善德女神祭祀，引出恺撒休妻；前58年他把西塞罗赶去流亡。前52年1月，他在阿庇亚大道上撞见米洛的人马，被杀死在路边客栈；支持者把尸体抬进元老院焚化，连议事厅一起烧掉。"
    },
    {
      "id": "pompey",
      "when": "前52年",
      "event": "唯一的执政官",
      "note": "元老派一向防着他，这年却请他一个人当执政官，连小加图也点了头：有个政府总比没有强。他从强人变成了元老院的盾牌。"
    },
    {
      "id": "cato-younger",
      "when": "前52—前49年",
      "event": "从反庞培到抱紧庞培",
      "note": "他一辈子跟庞培作对，这时却站到庞培一边，力主恺撒任满交兵、回国受审；内战一开就随庞培渡海。"
    }
  ],
  "history-rome-caesar/0": [
    {
      "id": "pompey",
      "when": "前48年9月",
      "event": "死在埃及海滩",
      "note": "他换乘小船上岸，来接他的是当年的部下塞普提米乌斯；刚踏上沙滩就被从背后刺死，妻子在船上眼睁睁看着。首级被割下献给恺撒，尸身由一个被释奴拿破船板火化。",
      "place": "pelusium"
    }
  ],
  "history-rome-caesar/1": [
    {
      "id": "cato-younger",
      "when": "前47—前46年",
      "event": "徒步穿越利比亚",
      "note": "法萨卢斯之后，他带残部从昔兰尼加徒步穿过利比亚沙漠去和非洲的元老派会合，一路和士兵一样走路，不坐车马。",
      "place": "utica"
    },
    {
      "id": "cleopatra-vii",
      "when": "前48—前47年",
      "event": "借恺撒坐稳王位",
      "note": "她被弟弟托勒密十三世赶出王宫，靠恺撒的兵打赢了亚历山大里亚之战，弟弟兵败淹死在尼罗河里。"
    }
  ],
  "history-rome-caesar/2": [
    {
      "id": "antony",
      "when": "前44年2月15日",
      "event": "牧神节的王冠",
      "note": "他只系着兽皮跑完牧神节的赛跑，登上讲坛给恺撒献王冠；恺撒推开，群众欢呼；他再献，恺撒再推，欢呼更响。"
    },
    {
      "id": "brutus",
      "when": "前44年3月15日",
      "event": "“你不是真布鲁图斯”",
      "note": "他自称是前509年赶走国王的那位布鲁图斯的后人。有人在老布鲁图斯的雕像下写“你要是还活着就好了”，又在他的司法官座位上留字条：“布鲁图斯，你睡着了吗？”“你不是真布鲁图斯。”意思是：祖宗赶走了国王，如今又有人要称王，你却睡着，配不上这个姓。他最终加入刺杀，据说那一刀刺在恺撒的腹股沟。"
    }
  ],
  "history-rome-augustus/0": [
    {
      "id": "antony",
      "when": "前44年3月20日",
      "event": "葬礼演说",
      "note": "他没有长篇大论，只念了元老院给恺撒的种种荣誉和元老们护卫恺撒的誓言，然后举起被刀刺破、满是血迹的长袍。"
    },
    {
      "id": "octavian",
      "when": "前44年",
      "event": "接下名字",
      "note": "母亲和继父劝他别接这份遗产，太危险。他偏要接，从此自称恺撒。安东尼骂他：“你这个一切都靠一个名字的孩子。”"
    }
  ],
  "history-rome-augustus/1": [
    {
      "id": "cicero",
      "when": "前44—前43年",
      "event": "最后的战斗",
      "note": "六十出头的他连发十四篇《反腓力辞》，像当年德摩斯梯尼骂马其顿王腓力那样骂安东尼。",
      "place": "formiae"
    },
    {
      "id": "octavian",
      "when": "前43年",
      "event": "十九岁的执政官",
      "note": "元老院不许他破格竞选执政官，他派百夫长进元老院讨要。一个百夫长掀开斗篷、拍着剑柄说：“你们不给，它给。”"
    }
  ],
  "history-rome-augustus/2": [
    {
      "id": "brutus",
      "when": "前42年10月",
      "event": "腓立比",
      "note": "第二战败后他扑在剑上自尽。据说他死前念了一句诗：美德啊，你只是一个空名。",
      "place": "philippi"
    },
    {
      "id": "lepidus",
      "when": "前36年",
      "event": "被兵抛弃",
      "note": "他带十几个军团登上西西里，想把岛收归自己。屋大维只带几名随从走进他的军营，士兵一队队倒戈。他披上丧服求饶，保住了性命和大祭司的头衔，在基尔凯伊软禁了二十多年。",
      "place": "circeii"
    },
    {
      "id": "agrippa",
      "when": "前36年",
      "event": "瑙洛库斯",
      "note": "他给战船装上一种带钩的抛射器，钩住敌船拖近接舷，在西西里北岸打垮了塞克斯图斯·庞培的舰队。"
    }
  ],
  "history-rome-augustus/3": [
    {
      "id": "agrippa",
      "when": "前31年9月2日",
      "event": "阿克提乌姆",
      "note": "他先夺下安东尼的补给港，把对方的大军困在海湾里饿着；决战时用轻快的战船围住安东尼笨重的大船。",
      "place": "actium"
    },
    {
      "id": "antony",
      "when": "前30年8月",
      "event": "伏剑",
      "note": "听说克娄巴特拉已死，他让奴隶厄洛斯杀他，厄洛斯却刺死了自己；他扑剑未死，得知女王还活着，被人用绳子吊进女王藏身的陵墓，死在她怀里。",
      "place": "alexandria"
    },
    {
      "id": "cleopatra-vii",
      "when": "前30年8月",
      "event": "最后的托勒密",
      "note": "屋大维想把她带回罗马游街。她骗过看守，在陵墓里自尽；普鲁塔克说，没人确知是毒蛇还是毒针。"
    }
  ],
  "history-rome-augustus/4": [
    {
      "id": "octavian",
      "when": "前27年",
      "event": "奥古斯都",
      "note": "元老院本想称他“罗慕路斯”，他嫌那是杀弟的国王，选了“奥古斯都”。他住在帕拉丁山上一座普通的房子里，四十年睡同一间卧室。"
    }
  ],
  "history-empire-principate/1": [
    {
      "id": "sejanus",
      "when": "公元23年",
      "event": "禁卫军大营",
      "note": "他的理由是：兵散住在城里会学坏，集中起来才好管，有急事也来得快。塔西佗说，真正的用意是让禁卫军看清自己有多少人、多大力量，也让别人看着害怕。",
      "place": "rome"
    }
  ],
  "history-empire-principate/2": [
    {
      "id": "julia",
      "when": "前2年",
      "event": "流放",
      "note": "父亲在元老院亲口揭发她通奸，把她流放到潘达特里亚小岛：不许喝酒，男人要来探视，得先报上身高、肤色和身上的疤痕。",
      "place": "pandateria"
    },
    {
      "id": "tiberius",
      "when": "前6年",
      "event": "罗得岛",
      "note": "他被逼休掉心爱的维普萨尼娅、娶了尤利娅，在仕途正旺时负气出走罗得岛。后来在街上偶遇前妻，他目送她远去、眼里含泪；奥古斯都从此派人看着，不让两人再见面。",
      "place": "rhodes"
    },
    {
      "id": "varus",
      "when": "公元9年9月",
      "event": "条顿堡",
      "note": "他把莱茵河以东当成已经平定的行省，派人收税、按罗马法断案。手下的辅军军官阿米尼乌斯是切鲁西人的贵族，也是罗马公民和骑士，谎报附近部落造反，引他带着三个军团绕进林间沼地。前一晚另一位日耳曼首领塞格斯特斯还警告过他，他没信。全军覆没，他伏剑自尽，首级后来送到了奥古斯都手里。",
      "place": "teutoburg"
    },
    {
      "id": "octavian",
      "when": "公元14年8月19日",
      "event": "死在诺拉",
      "note": "他死在父亲当年去世的同一间屋子里。最后一句话是对妻子说的：“莉薇娅，记住我们的婚姻，活下去，永别了。”",
      "place": "nola"
    }
  ],
  "history-empire-julio-claudian/0": [
    {
      "id": "tiberius",
      "when": "公元14年",
      "event": "推让",
      "note": "奥古斯都死后，他在元老院里推三阻四，说自己担不起全部重任。有元老不耐烦地喊：“要么接，要么走！”"
    }
  ],
  "history-empire-julio-claudian/2": [
    {
      "id": "caligula",
      "when": "39年",
      "event": "拜伊船桥",
      "note": "他把商船连成一座从拜伊到普特奥利的浮桥，铺土成路，穿着据说是亚历山大的胸甲骑马走过，第二天又驾战车走了一趟。据说是因为有占卜师说过：他当皇帝的可能，不比骑马渡过拜伊海湾大。",
      "place": "puteoli"
    }
  ],
  "history-empire-julio-claudian/3": [
    {
      "id": "claudius",
      "when": "41年1月",
      "event": "帘子后面",
      "note": "卡利古拉被刺后，他吓得躲到一处阳台的帘子后面。路过的士兵看见帘下露出两只脚，把他拽出来；他跪下求饶，士兵却向他欢呼“皇帝”。",
      "place": "rome"
    },
    {
      "id": "agrippina-minor",
      "when": "54年10月",
      "event": "一盘蘑菇",
      "note": "塔西佗说，她请来有名的下毒女洛库斯塔配药，让试吃的宦官把毒蘑菇送到丈夫嘴边；见药力不够，又让御医用沾毒的羽毛探他的喉咙。"
    }
  ],
  "history-empire-julio-claudian/4": [
    {
      "id": "agrippina-minor",
      "when": "59年",
      "event": "沉船",
      "note": "尼禄给她安排了一条会散架的船。船在那不勒斯湾里塌了，她游上了岸；尼禄随即派兵上门。据说她指着腹部说：“往这儿刺。”"
    },
    {
      "id": "nero",
      "when": "64年7月",
      "event": "大火",
      "note": "大火烧了六天，罗马十四个区毁了三个、残了七个。他从安提乌姆赶回，开放自家园林收容灾民；城里却传他在火光中登台唱特洛伊的陷落。他把罪名推给了基督徒。"
    },
    {
      "id": "seneca",
      "when": "65年",
      "event": "赐死",
      "note": "谋刺尼禄的案子败露后，尼禄派人命他自尽。他割开手腕，血流太慢，又服毒、泡进热水，最后在蒸汽浴室里窒息而死。"
    }
  ],
  "history-empire-flavian/1": [
    {
      "id": "vespasian",
      "when": "69年",
      "event": "亚历山大里亚",
      "note": "一个盲人、一个手残的人跪求他，一个要他往眼睛上吐唾沫，一个要他用脚跟碰一碰，说是神托梦指点的。他起初不肯，被朋友劝着试了，据说两人都好了。",
      "place": "alexandria"
    }
  ],
  "history-empire-antonine/1": [
    {
      "id": "trajan",
      "when": "98年1月",
      "event": "在科隆得知继位",
      "note": "涅尔瓦的死讯传来时他在莱茵河边。他没急着回罗马，先把边防安排妥当，一年多以后才进城。",
      "place": "colonia"
    }
  ],
  "history-empire-antonine/4": [
    {
      "id": "marcus-aurelius",
      "when": "约172年",
      "event": "卡农图姆",
      "note": "多瑙河前线的大营里，他白天打仗、审案，夜里用希腊文写笔记，提醒自己：当心别被紫袍染成了“恺撒”。",
      "place": "carnuntum"
    }
  ],
  "history-empire-antonine/5": [
    {
      "id": "commodus",
      "when": "约191年",
      "event": "罗马的赫拉克勒斯",
      "note": "他披狮皮、执大棒出现在人前，自称罗马的赫拉克勒斯；把罗马改名“康茂德殖民城”，军团也改叫“康茂德军团”，一年十二个月换成他自己的十二个名号。",
      "place": "rome"
    }
  ],
  "history-empire-crisis/0": [
    {
      "id": "pertinax",
      "when": "193年1月1日",
      "event": "让我们当兵吧",
      "note": "登基头一天，他给禁卫军的口令是“让我们当兵吧”。他从前带兵就用这句话，禁卫军却听出了弦外之音：康茂德时代的好日子到头了。",
      "place": "rome"
    }
  ],
  "history-empire-crisis/1": [
    {
      "id": "septimius-severus",
      "when": "193年6月",
      "event": "解散禁卫军",
      "note": "他让禁卫军不带兵器、穿着礼服出城迎接，再命自己的兵团团围住，当众数落他们杀主卖位，剥去军服，赶到离罗马一百罗马里以外。",
      "place": "rome"
    },
    {
      "id": "elagabalus",
      "when": "219年",
      "event": "黑石进城",
      "note": "他让太阳神的黑石坐上金银宝石装饰的车，六匹白马拉着，自己倒退着走在车前，攥着缰绳，眼睛一直望着神。",
      "place": "rome"
    }
  ],
  "history-empire-crisis/3": [
    {
      "id": "zenobia",
      "when": "272年",
      "event": "被擒",
      "note": "帕尔米拉被围，她骑骆驼出城想去搬波斯救兵，在幼发拉底河边被追兵拿住。",
      "place": "palmyra"
    },
    {
      "id": "aurelian",
      "when": "274年",
      "event": "无敌太阳神",
      "note": "他在罗马为太阳神修了一座大庙，设专门的祭司团，与罗马的老祭司团并列。据说他母亲就是家乡太阳神庙的女祭司。",
      "place": "rome"
    }
  ],
  "history-empire-dominate/0": [
    {
      "id": "diocletian",
      "when": "284年",
      "event": "野猪",
      "note": "传说他年轻时，一位德鲁伊女先知对他说：等你杀了一头野猪，就能当皇帝。禁卫军长官阿佩尔（Aper）的名字，在拉丁语里正是“野猪”。",
      "place": "nicomedeia"
    }
  ],
  "history-empire-constantine/3": [
    {
      "id": "constantine",
      "when": "330年",
      "event": "给新都划界",
      "note": "他手持长矛步行划定新都的城界，走了很远还不停。随从问：主上，还要走多远？他答：走到走在我前面的那一位停下为止。",
      "place": "constantinople"
    }
  ],
  "history-empire-theodosius/1": [
    {
      "id": "theodosius",
      "when": "390年",
      "event": "悔罪",
      "note": "安布罗斯在教堂门口拦住他：你学大卫犯了罪，也该学大卫悔罪。他闭门八个月，圣诞节才脱下皇袍，当众伏地认罪。",
      "place": "mediolanum"
    },
    {
      "id": "ambrose",
      "when": "384年",
      "event": "胜利女神祭坛",
      "note": "元老辛马库斯请求把胜利女神的祭坛搬回元老院：“通向这样大的奥秘，不会只有一条路。”安布罗斯写信驳斥，皇帝没有答应。",
      "place": "rome"
    }
  ],
  "history-empire-west-fall/3": [
    {
      "id": "augustine",
      "when": "410—426年",
      "event": "上帝之城",
      "note": "异教徒说罗马被攻破，是因为抛弃了老神。他写了二十二卷书回答：罗马拜老神时也一再遭难；人间的城都会倒，人该盼的是上帝之城。",
      "place": "hippo"
    }
  ],
  "history-empire-west-fall/4": [
    {
      "id": "odoacer",
      "when": "476年",
      "event": "冠服送回",
      "note": "他没有自立为皇帝，让元老院出面致信君士坦丁堡：西方不需要单独的皇帝了，一位皇帝足以照管东西两半，请封奥多亚克为“贵族”，把意大利交给他治理。名义上称臣，实则是请东罗马给一个没经任命的军阀盖章。东罗马皇帝芝诺两头应付：回信叫元老院迎回被赶到达尔马提亚的尼波斯，那才是东罗马认的西部皇帝；给奥多亚克的信里却称他“贵族”，默认了既成事实。芝诺自己刚从篡位者手里夺回皇位，顾不上西边。",
      "place": "ravenna"
    }
  ],
  "history-empire-antonine/2": [
    {
      "id": "hadrian",
      "when": "130年10月",
      "event": "安提诺乌斯",
      "note": "宠爱的比提尼亚少年安提诺乌斯在尼罗河里淹死，哈德良“哭得像个女人”，在出事的地方建城，封他为神。",
      "place": "antinoopolis"
    }
  ],
  "history-empire-crisis/2": [
    {
      "id": "caracalla",
      "when": "215年",
      "event": "亚历山大里亚",
      "note": "亚历山大里亚人编段子挖苦他杀弟。他住进塞拉皮斯神庙，纵兵屠城，自己在神庙里看着，还写信告诉元老院说他在行洁净礼。",
      "place": "alexandria"
    }
  ],
  "history-empire-constantine/0": [
    {
      "id": "galerius",
      "when": "305年",
      "event": "挑人",
      "note": "戴克里先说要选两家的儿子，他不肯：马克森提乌斯连对他都不行礼，君士坦丁又太得人心；他要的是“怕我、凡事听我吩咐的人”。戴克里先叹道：你挑的这些人担不起国事。",
      "place": "nicomedeia"
    }
  ],
  "history-empire-constantine/1": [
    {
      "id": "maxentius",
      "when": "312年10月28日",
      "event": "落水",
      "note": "出城前他查了西卜林神谕，得到的是“这一天罗马的敌人要灭亡”。败兵挤上浮桥，他落进台伯河淹死；尸体捞上来，人头插在长矛上挑进城。",
      "place": "rome"
    },
    {
      "id": "licinius",
      "when": "324年9月",
      "event": "投降",
      "note": "克里索波利斯败后退到尼科米底亚，由妻子君士坦提娅出面说情，他亲手献上紫袍。君士坦丁答应饶他一命，送去帖撒罗尼迦；次年说他还在谋划，下令处死。",
      "place": "thessalonica"
    }
  ],
  "history-faith-empire-church/0": [
    {
      "id": "eusebius",
      "when": "330年代",
      "event": "教外的主教",
      "note": "一次宴请主教，君士坦丁当着他的面说：你们是管教会里面的主教，我也是主教，是上帝立来管教会外面的。",
      "place": "constantinople"
    },
    {
      "id": "helena",
      "when": "326—328年",
      "event": "朝圣",
      "note": "年近八十去巴勒斯坦，在伯利恒基督降生的山洞和橄榄山顶各修了一座教堂，一路赏兵士、周济穷人、放出囚犯。她找到耶稣十字架的故事，六十多年后才见于记载。",
      "place": "jerusalem"
    }
  ],
  "history-faith-empire-church/2": [
    {
      "id": "anthony-great",
      "when": "338年",
      "event": "下山驳阿里乌派",
      "note": "阿里乌派到处说安东尼跟他们一个看法。主教和弟兄们请他出山，年近九十的他进了亚历山大里亚，当众说圣子不是被造的。满城的人跑来看他，连异教的祭司也进了教堂，说：“我们要看看神人。”",
      "place": "alexandria"
    }
  ],
  "history-faith-empire-church/3": [
    {
      "id": "constantine",
      "when": "325年",
      "event": "烧状子",
      "note": "开会前一天，不少主教递状子互相告发。他把状子统统烧了，只说：基督吩咐，想求饶恕的人先要饶恕弟兄。开幕那天他穿着紫袍金饰进场，等主教们示意，才在一张矮金椅上坐下。",
      "place": "nicaea"
    }
  ],
  "history-faith-councils/0": [
    {
      "id": "arius",
      "when": "336年",
      "event": "死在新都",
      "note": "皇帝让他发誓认了尼西亚信经，下令第二天接他领圣餐。前一天他走到君士坦丁广场，忽然腹痛，在广场后面的公厕里暴死。正统派说这是天罚。",
      "place": "constantinople"
    },
    {
      "id": "athanasius",
      "when": "335年",
      "event": "流放特里尔",
      "note": "提尔会议定了他的罪，他赶到君士坦丁堡，在大街上拦住皇帝的马。对头们随即告他扬言要扣下亚历山大里亚运往新都的粮船，皇帝大怒，不再听他分辩，把他流放到高卢的特里尔。",
      "place": "treveri"
    }
  ],
  "history-faith-councils/1": [
    {
      "id": "gregory-nazianzus",
      "when": "381年",
      "event": "约拿",
      "note": "他主持会议，在安条克主教的人选上落了下风，又不肯跟“本质相似派”（介于两派之间、说圣子与圣父本质相似的人）妥协，便当众请辞：“就让我做先知约拿吧！风暴因我而起，我愿舍了自己救这条船。”第二年再请他赴会，他回信说从没见过主教开会开出什么好结果。",
      "place": "constantinople"
    }
  ],
  "history-faith-ephesus/2": [
    {
      "id": "nestorius",
      "when": "435—约451年",
      "event": "流放绿洲",
      "note": "435年皇帝下诏把他流放到埃及的大绿洲，正在对头西里尔的辖区里。他在那里遭过沙漠强盗的劫掠，受了伤；晚年写书替自己辩护，约451年死去。波斯的教会始终不认他是异端。",
      "place": "kharga"
    }
  ],
  "history-faith-two-cities/0": [
    {
      "id": "leo",
      "when": "451—452年",
      "event": "彼得借利奥开了口",
      "note": "451年他写给卡尔西顿大公会议的书信当众宣读，与会主教齐声喊：“彼得借利奥开了口！”次年他出城见阿提拉，阿提拉随即退兵。",
      "place": "rome"
    }
  ],
  "history-empire-constantine/4": [
    {
      "id": "crispus",
      "when": "326年",
      "event": "波拉",
      "note": "两年前他还率舰队在赫勒斯滂海峡打垮李锡尼的水师。326年他在伊斯特里亚的波拉被处死，罪名不详；优西比乌后来改订《教会史》，把称赞他的话删掉了。",
      "place": "pola"
    }
  ],
  "history-faith-jesus/3": [
    {
      "id": "peter",
      "when": "约40年",
      "event": "给百夫长施洗",
      "note": "哥尼流是驻凯撒里亚的罗马百夫长，敬畏上帝，却没受割礼。彼得进了他的家，说“神是不偏待人的”，给他全家施洗；回到耶路撒冷，奉割礼的门徒责问他为什么跟没受割礼的人一起吃饭。",
      "place": "caesarea"
    },
    {
      "id": "paul",
      "when": "约57—60年",
      "event": "上告恺撒",
      "note": "他在耶路撒冷圣殿被人围打，罗马军官把他关押；他亮出罗马公民的身份，说“我要上告于恺撒”，被押解到罗马受审。",
      "place": "jerusalem"
    }
  ],
  "history-faith-jesus/5": [
    {
      "id": "josephus",
      "when": "70年",
      "event": "城下喊话",
      "note": "他跟着提图斯围攻耶路撒冷，绕着城墙劝守军投降，被城上飞下的石头打伤了头。",
      "place": "jerusalem"
    }
  ],
  "history-faith-israel/3": [
    {
      "id": "moses",
      "when": "约前13世纪（传说）",
      "event": "燃烧的荆棘",
      "note": "他在米甸替岳父放羊，到了何烈山，看见荆棘着火却烧不毁，耶和华从火中叫他回埃及领人出来。他问神叫什么名字，神说：“我是自有永有的。”",
      "place": "horeb"
    }
  ],
  "history-faith-second-temple/0": [
    {
      "id": "akhenaten",
      "when": "约前1346年",
      "event": "迁都阿玛尔纳",
      "note": "他把朝廷搬到中埃及荒地上新建的“阿顿的地平线”，只许拜太阳圆盘阿顿，而能直接拜阿顿的只有国王一家，百姓拜的是国王。他写的《阿顿颂》说：“你是唯一的神，没有别的神像你。”",
      "place": "amarna"
    }
  ],
  "history-faith-second-temple/3": [
    {
      "id": "caesar",
      "when": "前44年3月",
      "event": "犹太人守灵",
      "note": "苏埃托尼乌斯说，恺撒火化后，各国侨民轮着来哀悼，最上心的是犹太人，一连几夜守在焚尸的地方。他在亚历山大里亚被围时，犹太人派兵来援；他回头准各地犹太人照旧聚会、往耶路撒冷送钱。",
      "place": "rome"
    }
  ],
  "history-faith-church/0": [
    {
      "id": "pliny-younger",
      "when": "约112年",
      "event": "写信问皇帝",
      "note": "他问的是：光凭“基督徒”这个名号就该罚，还是要有罪行才罚？告发的越来越多，还来了匿名揭帖。图拉真回信：匿名告发一概不收，“那是最坏的先例，也不合我们这个时代”。",
      "place": "nicomedeia"
    }
  ],
  "history-faith-church/1": [
    {
      "id": "cyprian",
      "when": "252年前后",
      "event": "瘟疫里的教会",
      "note": "迦太基闹瘟疫，路边的尸体没人收。他召集信徒说：只照顾自家人算不得什么，连迫害我们的人也要照顾。富人出钱，穷人出力，不分信不信，一律收治。",
      "place": "carthage"
    }
  ],
  "history-faith-church/2": [
    {
      "id": "galerius",
      "when": "303年",
      "event": "撺掇迫害",
      "note": "拉克坦提乌斯说，他母亲是拜山神的乡下女人，几乎天天设祭请邻居吃祭肉，最恨不来吃的基督徒，是她挑唆儿子动手。303年尼科米底亚皇宫两回起火，他咬定是基督徒放的。",
      "place": "nicomedeia"
    }
  ],
  "history-empire-theodosius/6": [
    {
      "id": "john-chrysostom",
      "when": "407年9月",
      "event": "凡事荣耀归于上帝",
      "note": "押送的兵催着他往黑海东岸的皮提乌斯赶，走了三个月。到科马纳城外一座殉道者小堂，他要来一身白衣换上，把旧衣分给旁人，领了圣餐，念完他常说的那句“凡事荣耀归于上帝”，就断了气。",
      "place": "comana"
    }
  ],
  "history-empire-theodosius/7": [
    {
      "id": "pulcheria",
      "when": "414年",
      "event": "金祭台",
      "note": "她和两个妹妹阿尔卡迪娅、玛丽娜发誓终身不嫁，在大教堂献了一张金子和宝石打的祭台，把守贞的誓言和弟弟的帝位一起刻在正面，让人人看得见。她不让男人进她的宫。",
      "place": "constantinople"
    }
  ],
  "history-empire-west-fall/2": [
    {
      "id": "stilicho",
      "when": "408年8月",
      "event": "伸出脖子",
      "note": "他夜里躲进拉文纳的教堂。天亮兵来了，当着主教发誓只是看押；他一出门，第二道诏书就到了：斩首。跟着他的蛮族兵要动手救人，他喝住了，自己伸出了脖子。",
      "place": "ravenna"
    }
  ],
  "history-empire-leo/0": [
    {
      "id": "aspar",
      "when": "457年2月",
      "event": "同车进城",
      "note": "利奥在城外称帝后进城游行，阿斯帕尔和他同坐一辆车；到了君士坦丁广场，又是阿斯帕尔献上金冠。皇帝是他扶的，他要全城看见。",
      "place": "constantinople"
    }
  ],
  "history-empire-leo/4": [
    {
      "id": "anastasius-i",
      "when": "491年4月",
      "event": "要不回来的保证书",
      "note": "皇后选定他以后，牧首欧菲米乌斯要他先亲笔签一份信仰保证，才让他登基。几年后皇帝想把这份保证书要回来，牧首不给；495年皇帝召集京城的主教开会，把牧首革了职。",
      "place": "constantinople"
    }
  ],
  "history-empire-justinian/0": [
    {
      "id": "justin-i",
      "when": "约470年",
      "event": "三个背干粮的同乡",
      "note": "查士丁和同乡齐马尔库斯、狄提比斯图斯为了逃离家乡的穷苦，背着山羊毛口袋步行到京城，口袋里只有家里带来的几块干粮。三人都长得好，被皇帝利奥挑进了宫廷卫队。",
      "place": "constantinople"
    }
  ],
  "history-empire-justinian/1": [
    {
      "id": "theodora",
      "when": "532年1月",
      "event": "帝位是上好的裹尸布",
      "note": "尼卡暴动最凶时，大臣们劝皇帝坐船逃走。狄奥多拉说：钱有的是，海就在那里，船也备好了；可逃出去以后，你会不会宁愿当初死了？“我赞成一句古话：帝位是上好的裹尸布。”",
      "place": "constantinople"
    }
  ],
  "history-empire-justinian/3": [
    {
      "id": "belisarius",
      "when": "540年5月",
      "event": "进了拉文纳",
      "note": "哥特人秘密派人请他做西部皇帝。他极厌恶“僭主”这个名头，也早对皇帝发过重誓终身不造反，却假装答应，带着私兵从沼泽中唯一的堤道进了城，运粮船跟着就到。",
      "place": "ravenna"
    }
  ],
  "history-west-kingdoms/1": [
    {
      "id": "theodoric-great",
      "when": "519年",
      "event": "烧了会堂就得赔",
      "note": "拉文纳的一伙人放火烧了城里的犹太会堂。信阿里乌派的国王下令：全城出钱把会堂重修起来，出不起的挨鞭子。他要的是各守各的法、谁也别闹事。",
      "place": "ravenna"
    }
  ],
  "history-west-kingdoms/3": [
    {
      "id": "clovis",
      "when": "507年",
      "event": "看不下去的阿里乌派",
      "note": "据图尔的格雷戈里，克洛维对部下说：“这些阿里乌派占着高卢一块地，我看不下去。靠上帝帮忙，去把他们打下来，地归我们。”打完仗，他把战利品送进了图尔的圣马丁教堂。",
      "place": "tours"
    }
  ],
  "history-west-kingdoms/4": [
    {
      "id": "leovigild",
      "when": "584年",
      "event": "三万金币",
      "note": "长子赫尔梅内吉尔德在塞维利亚造反，靠的是拜占庭兵。父亲没跟拜占庭硬打，付了三万金币，拜占庭人就撤了，还把儿媳和孙子一并带走。儿子逃进教堂，父亲派次子进去劝降。",
      "place": "toletum"
    }
  ],
  "history-faith-papacy/2": [
    {
      "id": "ambrose",
      "when": "386年",
      "event": "宫殿归皇帝，教堂归主教",
      "note": "朝廷的伯爵、军官来催他交出教堂，说皇帝的东西样样归皇帝管。他答：我的地、我的钱，要就拿去；属上帝的东西不归皇帝管。又说：“宫殿归皇帝，教堂归主教。”",
      "place": "mediolanum"
    }
  ],
  "history-faith-papacy/4": [
    {
      "id": "gelasius-i",
      "when": "494年",
      "event": "两样东西",
      "note": "他写信给阿纳斯塔修斯：治理世界的有两样，主教的神圣权威和君王的权力；主教的担子更重，因为到了上帝面前，他们连君王也要替着交账。这封信后来成了西方讲教权和王权的老本。",
      "place": "rome"
    }
  ],
  "history-egypt-old/1": [
    {
      "id": "imhotep",
      "when": "约前2650年",
      "event": "未完工的金字塔",
      "note": "左塞尔死后，他接着替下一任国王塞汉姆赫特修阶梯金字塔，那座塔的围墙上留有他的名字。这位国王在位太短，金字塔只修了几层就丢下了。",
      "place": "saqqara"
    }
  ],
  "history-egypt-old/2": [
    {
      "id": "khufu",
      "when": "约前2560年",
      "event": "梅雷尔的船队",
      "note": "他在位末年，督察梅雷尔带着四十来个船工，十天两三趟，把图拉的白石灰石运到吉萨，交给胡夫的异母兄弟、大臣安赫哈夫验收。日志里，大金字塔叫“胡夫的地平线”。",
      "place": "giza"
    }
  ],
  "history-egypt-middle/1": [
    {
      "id": "senusret-iii",
      "when": "约前1862年",
      "event": "塞姆纳界碑",
      "note": "他在塞姆纳立碑，说自己把边界推得比父辈更往南；又说努比亚人“不是值得尊重的人”，你进他就退，你退他就进。谁守住这条边界，才是他的儿子；丢了边界、不肯为它打仗的，不是他生的。碑旁立着他的像。",
      "place": "semna"
    }
  ],
  "history-egypt-middle/3": [
    {
      "id": "ahmose-i",
      "when": "约前1530年",
      "event": "在敌都上盖王宫",
      "note": "他拿下阿瓦里斯，没有毁掉这座港城，而是在喜克索斯人的城防旧址上修起自己的王宫，宫墙上画着克里特风格的壁画。城里的迦南居民，不少留了下来。",
      "place": "avaris"
    }
  ],
  "history-egypt-new/0": [
    {
      "id": "hatshepsut",
      "when": "约前1471年",
      "event": "蓬特的没药树",
      "note": "她在位第九年派船队去蓬特，运回三十一棵活没药树和乳香。这趟远航刻在代尔拜赫里神殿的墙上，蓬特的王后也画在上面。据说她把烧过的乳香磨成粉，当眼线涂。",
      "place": "deirelbahari"
    }
  ],
  "history-egypt-new/2": [
    {
      "id": "ramesses-ii",
      "when": "约前1246年",
      "event": "赫梯公主的嫁妆",
      "note": "赫梯王后普杜赫帕写信解释：嫁妆一时凑不齐，请他别催。这年秋天，公主由两国军队护送，带着满载金银铜器的车队、牛羊和奴仆从哈图沙动身，到了埃及改名玛特霍尔奈弗鲁拉，当上正宫王后。",
      "place": "piramesses"
    }
  ],
  "history-egypt-late/1": [
    {
      "id": "piye",
      "when": "约前725年",
      "event": "吃鱼的王不得进宫",
      "note": "南北四个王来向他称臣，只放进王宫一个：另外三个吃鱼，在宫里算不洁；赫尔莫波利斯王尼姆罗特不吃鱼，才进了门。站在宫门外的三个，用碑上的话说，“腿软得像女人”。",
      "place": "napata"
    }
  ],
  "history-egypt-late/3": [
    {
      "id": "nectanebo-ii",
      "when": "前343年",
      "event": "门托尔倒戈",
      "note": "他派四千希腊雇佣兵去帮西顿反波斯，领兵的罗得人门托尔暗中投了波斯。这年冬天波斯大军压境，他手下有六万埃及兵、两万利比亚兵、两万希腊雇佣兵；门托尔熟悉埃及东边的防线，带着人马投到波斯军中。次年夏天波斯人进了孟菲斯。",
      "place": "memphis"
    }
  ],
  "history-egypt-roman/0": [
    {
      "id": "cornelius-gallus",
      "when": "前27—前26年",
      "event": "刻在金字塔上的战功",
      "note": "据卡西乌斯·狄奥，他在埃及到处给自己立像，还把战功刻上了金字塔。好友告发他，奥古斯都不许他再住在皇帝的行省，元老院跟着定罪、抄家，他在判决生效前自杀。",
      "place": "alexandria"
    }
  ],
  "history-egypt-roman/3": [
    {
      "id": "diocletian",
      "when": "298年",
      "event": "烧掉点金术的书",
      "note": "平定埃及以后，他下令把讲怎样把贱金属变成金银的书统统烧掉；吉本说，这是炼金术史上头一件确凿可考的事。他又南下上埃及，跟努比亚的部落讲和，把边界退到第一瀑布边的菲莱。",
      "place": "alexandria"
    }
  ],
  "history-egypt-byzantine/0": [
    {
      "id": "dioscorus",
      "when": "451年",
      "event": "一盒牙和胡子",
      "note": "卡尔西顿会议第三次开会起他不再到场，会议以抗命为由革了他的职，并没有定他异端。科普特人的传说是：皇姐普尔喀丽娅一巴掌打掉了他几颗牙，卫兵揪下他的胡子，他把牙和胡子装盒寄回亚历山大里亚：“这是我信仰的果实。”",
      "place": "alexandria"
    }
  ],
  "history-egypt-byzantine/2": [
    {
      "id": "theodora",
      "when": "536年起",
      "event": "宫里的流亡宗主教",
      "note": "536年查士丁尼撤了不肯认卡尔西顿的亚历山大里亚宗主教提奥多西，她把人接到君士坦丁堡供养起来。提奥多西在京城照样替自己一派祝圣神父和主教，后来派去诺巴德当主教的朗吉努斯，就是他祝圣的。",
      "place": "constantinople"
    }
  ],
  "history-persia-elam/1": [
    {
      "id": "shutruk-nakhunte",
      "when": "约前1158年",
      "event": "把古碑搬回苏萨",
      "note": "他在阿卡德王纳拉姆-辛的胜利碑上补刻了一段埃兰文：城神因舒希纳克命我出兵，我攻破西帕尔，拿走纳拉姆-辛的碑，带回埃兰，献给我的神。",
      "place": "susa"
    }
  ],
  "history-persia-elam/3": [
    {
      "id": "cyaxares",
      "when": "前612年",
      "event": "合围尼尼微",
      "note": "巴比伦编年史记：这年夏天，巴比伦王和米底王基亚克萨雷斯合围尼尼微，三个月后破城，亚述王死，两军抢走城中和神庙的大批财宝。9月14日，基亚克萨雷斯班师回国。",
      "place": "nineveh"
    }
  ],
  "history-persia-achaemenid/0": [
    {
      "id": "cyrus-ii",
      "when": "前539年10月",
      "event": "进巴比伦",
      "note": "据巴比伦编年史，10月12日他的部将乌格巴鲁不战而入巴比伦，神庙的祭礼一天也没停；17天后居鲁士入城，向全城致意，城中太平。他的人随即任命巴比伦各区的官。",
      "place": "babylon"
    }
  ],
  "history-persia-achaemenid/1": [
    {
      "id": "darius-i",
      "when": "前520年前后",
      "event": "贝希斯敦崖刻",
      "note": "他在巴比伦通往埃克巴坦那的大路边、离地约一百米的崖上刻下浮雕和三种文字：他一脚踩着仰面倒地的高墨达，九个被擒的“说谎王”脖子上拴着绳子排在面前。一百年后，埃及还有人抄录这篇铭文的阿拉米文译本。",
      "place": "behistun"
    }
  ],
  "history-persia-parthia/0": [
    {
      "id": "mithridates-ii",
      "when": "前96年",
      "event": "三把椅子",
      "note": "他的使者奥罗巴佐斯在幼发拉底河边见罗马将领苏拉，这是两国头一回打交道。苏拉摆了三把椅子，自己坐中间，一边是卡帕多西亚王，一边是安息使者。据普鲁塔克，安息王事后处死了奥罗巴佐斯。",
      "place": "euphrates"
    }
  ],
  "history-persia-parthia/2": [
    {
      "id": "surena",
      "when": "前53年",
      "event": "掀开毡皮",
      "note": "他把重甲骑兵藏在前队后面，用袍子和兽皮盖住盔甲。罗马人走近时，蒙皮挂铃的战鼓一齐擂响，骑兵掀开遮盖，头盔胸甲闪闪发亮，马也披着铜甲铁甲。",
      "place": "carrhae"
    }
  ],
  "history-persia-sasanian/1": [
    {
      "id": "shapur-i",
      "when": "260年",
      "event": "“亲手”擒住瓦勒良",
      "note": "他在铭文里列出瓦勒良从哪些行省调来七万大军，接着说：瓦勒良皇帝，我们亲手擒获；其余禁卫军长官、元老、将领，全都俘虏，押往波斯。",
      "place": "carrhae"
    }
  ],
  "history-persia-sasanian/2": [
    {
      "id": "mani",
      "when": "274年前后",
      "event": "死在狱中",
      "note": "巴赫拉姆一世听了卡提尔等祭司的话，把摩尼关进贡德沙普尔的监狱，不到一个月他就死了。信徒把他的死比作耶稣受难；几百年后的伊斯兰史书说他被剥了皮，皮里塞草挂在城门上。",
      "place": "gundeshapur"
    }
  ],
  "history-persia-khosrow/2": [
    {
      "id": "kavad-i",
      "when": "约520年",
      "event": "请罗马皇帝收养库思老",
      "note": "他怕诸子争位，写信请东罗马皇帝查士丁收养库思老，给小儿子撑腰。查士丁和外甥查士丁尼都很高兴，正要立文书，财务官普罗克卢斯劝阻：儿子按例继承父亲的家业，收养了，波斯王子日后就能来争罗马。事情就此告吹。",
      "place": "ctesiphon"
    }
  ],
  "history-persia-khosrow/4": [
    {
      "id": "khosrow-i",
      "when": "545年",
      "event": "点名要一位医生",
      "note": "这年两国议定五年停战。库思老的条件除了两千磅黄金，还点名要罗马医生特里布努斯来陪他住一阵：此人从前治好过他的重病。查士丁尼当即把人和钱一起送了过去。",
      "place": "ctesiphon"
    }
  ],
  "history-empire-maurice/1": [
    {
      "id": "justin-ii",
      "when": "574年12月",
      "event": "别被这身袍子骗了",
      "note": "据埃瓦格里乌斯所记，查士丁给提比略披上袍服时大声说：别被这身袍服、这场排场迷了眼，我就是被它骗了，才落得这般下场；你要宽厚治国，补我的过错。又指着大臣们说：就是这些人把我弄成这样的。在场的人都哭了。",
      "place": "constantinople"
    }
  ],
  "history-empire-maurice/2": [
    {
      "id": "tiberius-ii",
      "when": "578年9月",
      "event": "不娶前朝皇后",
      "note": "提比略加冕为奥古斯都后，寡居的索菲娅想嫁给他保住权势。他早有妻子伊诺，拒绝了，还把伊诺和孩子接进宫，给她改名阿纳斯塔西娅。索菲娅转而联络一位将军谋废他，事败后只领一份不多的年俸。",
      "place": "constantinople"
    }
  ],
  "history-empire-maurice/3": [
    {
      "id": "maurice",
      "when": "591年",
      "event": "收了个波斯儿子",
      "note": "库思老二世逃到罗马境内，请莫里斯出兵，答应复位后归还达拉、马尔蒂罗波利斯。莫里斯借兵，库思老复位后称他为父，又多割让了亚美尼亚西部大片土地。十一年后莫里斯被杀，库思老以替父报仇为名开战。",
      "place": "constantinople"
    }
  ],
  "history-empire-heraclius/0": [
    {
      "id": "phocas",
      "when": "约600年",
      "event": "被揪了胡子",
      "note": "多瑙河的士兵不满将领科门提奥卢斯，推百夫长福卡斯进京向莫里斯告状。他在御前同皇帝争吵，一位贵族气得当场揪他的胡子。两年后，正是这支军队拥他为帝。",
      "place": "constantinople"
    }
  ],
  "history-empire-heraclius/3": [
    {
      "id": "heraclius",
      "when": "629年3月21日",
      "event": "在基督里忠信的巴西琉斯",
      "note": "这天颁布的一道法令里，皇帝的称号不再写拉丁文的恺撒、奥古斯都，只写“在基督里忠信的巴西琉斯”。巴西琉斯本是希腊语的“王”，从前只用来称波斯王；此后拜占庭皇帝用了八百多年。",
      "place": "constantinople"
    }
  ],
  "history-faith-three-chapters/0": [
    {
      "id": "theodora",
      "when": "约535—548年",
      "event": "宫里藏着的牧首",
      "note": "536年牧首安提姆被教宗和皇帝一同革职，从此不见了踪影。他其实就藏在狄奥多拉的寝宫里，一藏十年，直到548年皇后去世，人们才知道他一直在宫中。",
      "place": "constantinople"
    }
  ],
  "history-faith-three-chapters/1": [
    {
      "id": "jacob-baradaeus",
      "when": "543—578年",
      "event": "穿破马衣的主教",
      "note": "朝廷要抓他，他就换上破烂的马衣，装成乞丐，一城一城地走，暗中按立神父和主教。叙利亚语里“破马衣”叫“布尔达阿纳”，“巴拉代”这个外号就是这么来的；他死时，一性论派已经有了自己完整的一套教会。",
      "place": "edessa"
    }
  ],
  "history-faith-monothelites/0": [
    {
      "id": "sergius-cp",
      "when": "633年",
      "event": "一个“能力”",
      "note": "塞尔吉乌斯想出的说法是：基督有神、人两性，可行事只凭一个“能力”。卡尔西顿派听着还是两性，一性论派听着像是一性，亚历山大里亚因此合了一回。耶路撒冷的索弗罗尼乌斯不认，他就改口说一个“意志”，并请教宗霍诺留表态。",
      "place": "constantinople"
    }
  ],
  "history-faith-monothelites/3": [
    {
      "id": "maximus-confessor",
      "when": "662年",
      "event": "不能说，也不能写",
      "note": "第二次受审后，他和两个弟子被割了舌头、砍了右手，叫他们再也不能讲、不能写，然后游街示众，流放到高加索西部的拉齐卡，分开关押。他死于这年8月13日。十九年后，第六次大公会议定的正是他坚持的两个意志。",
      "place": "constantinople"
    }
  ],
  "history-faith-three-chapters/3": [
    {
      "id": "vigilius",
      "when": "553年5月",
      "event": "不出席的教宗",
      "note": "会议在君士坦丁堡开幕，教宗就在城里，却拒不到场，另发一份文件替“三章”里的部分人说话。会议不予理会，照样谴责“三章”，还把他的名字从礼拜时代祷的名单上划掉。半年后他认了会议的决定。",
      "place": "constantinople"
    }
  ],
  "history-faith-icons/2": [
    {
      "id": "constantine-v",
      "when": "741年6月",
      "event": "逃到阿莫里翁",
      "note": "他带兵东征阿拉伯人，姐夫阿塔巴斯多斯在半路突袭，亲随被杀，他逃到阿莫里翁。那里的兵当年归他父亲统领，收留了他；安纳托利亚和小亚细亚西部的军区跟着站到他这边，两年后他打回京城。",
      "place": "i_amorion"
    }
  ],
  "history-faith-icons/4": [
    {
      "id": "irene-athens",
      "when": "780—790年",
      "event": "金币上的名字",
      "note": "她摄政时铸的金币，母子像都在正面，手持宝球的是她，正面也只印她的名字，儿子的名字挪到背面；诏令和效忠誓词里，她排在儿子前头。790年她要军队只向她一人宣誓，亚美尼亚军区不干，各军区跟着倒向了儿子。",
      "place": "constantinople"
    }
  ],
  "history-faith-icons/5": [
    {
      "id": "irene-athens",
      "when": "802—803年",
      "event": "岛上纺羊毛",
      "note": "802年10月，她的财政大臣尼基弗鲁斯带着官员废了她。她先被送到京城外的王子岛，后来流放到莱斯沃斯岛，靠纺羊毛过活，次年8月死在岛上；遗骨后来迁回京城的圣使徒教堂。",
      "place": "lesbos"
    }
  ],
  "history-war-602/0": [
    {
      "id": "khosrow-ii",
      "when": "604—605年",
      "event": "最后一次上前线",
      "note": "据塞贝奥斯所记，库思老亲自围攻达拉，挖地道掏空城基，破城后把城里的人杀尽，掠走财物，因兵马疲惫回了泰西封。此后的仗都交给沙赫巴拉兹、沙欣等大将去打，他自己不再上前线。",
      "place": "v_dara"
    }
  ],
  "history-war-602/1": [
    {
      "id": "shahrbaraz",
      "when": "614年5月",
      "event": "按手艺挑人",
      "note": "破城后杀戮稍停，他让传令官满城喊：躲着的都出来，刀已经收起。据修士安条克所记，从水窖、地洞里爬出来的人被挨个问会什么手艺，懂营造的挑出来押往波斯，其余的关进城外的马米拉水池。",
      "place": "jerusalem"
    }
  ],
  "history-war-602/2": [
    {
      "id": "sergius-cp",
      "when": "618—619年",
      "event": "圣坛前的誓言",
      "note": "饥荒加上瘟疫，皇帝想退回非洲，先装船运走的金银遇上风暴，沉了不少。据牧首尼基弗鲁斯所记，京城百姓想尽办法拦他，牧首把他叫进大教堂，当着圣坛让他起誓，决不离开京城。",
      "place": "constantinople"
    }
  ],
  "history-war-602/3": [
    {
      "id": "bonus-magister",
      "when": "626年7—8月",
      "event": "城下的讨价还价",
      "note": "围城头几天，他一次次派人带礼物去劝可汗退兵。据《复活节编年史》，可汗只回一句：把城让出来，财物留给我，你们带着家小保命走人。据尼基弗鲁斯，他的私生子约翰这时还在可汗手里当人质。",
      "place": "constantinople"
    }
  ],
  "history-war-602/4": [
    {
      "id": "heraclius",
      "when": "627年",
      "event": "画像里的公主",
      "note": "据牧首尼基弗鲁斯所记，突厥首领见了他，下马伏地便拜。他称对方“我的孩子”，摘下自己的冠冕给他戴上，又拿出女儿埃皮法尼娅（又名欧多基娅）的画像说：这是我的女儿、罗马人的奥古斯塔，你帮我打敌人，我就把她嫁给你。",
      "place": "v_tiflis"
    },
    {
      "id": "khosrow-ii",
      "when": "628年2月",
      "event": "马厩是空的",
      "note": "据塞贝奥斯所记，将领们夜里过桥占了王都旁的一座城，拥立西罗埃，还悄悄牵走了库思老的坐骑。消息传进宫，库思老惊慌中要马，马厩里却没有。他换了装束溜进御花园，躲在密密的灌木丛下，还是被搜了出来。",
      "place": "ctesiphon"
    }
  ],
  "history-war-602/5": [
    {
      "id": "shahrbaraz",
      "when": "629年",
      "event": "三封信",
      "note": "据塔巴里所记，库思老先要他献上弟弟法鲁罕的人头，他不肯；国王转把兵权给了弟弟，附一道杀他的密令。刀已举起，他求写遗嘱，拿出三封信，都是替弟弟求情的。弟弟交还兵权，他随即写信约罗马皇帝各带五十人见面。",
      "place": "v_arabissus"
    }
  ],
  "history-west-merovingians/1": [
    {
      "id": "brunhild",
      "when": "613年",
      "event": "被自家贵族交了出去",
      "note": "她替孙子掌权时，扶起的宫相被不愿打仗的士兵杀死，她就把下令的公爵抓来处死。613年两国宫相和丕平、梅斯主教阿努尔夫等贵族一起倒向克洛泰尔二世；后来篡位的加洛林家，正是丕平和阿努尔夫的后人。",
      "place": "w_metz"
    }
  ],
  "history-west-merovingians/3": [
    {
      "id": "charles-martel",
      "when": "737—741年",
      "event": "没有国王的宫相",
      "note": "737年国王死后，他不立新王，也没人拥立，自己照旧只称宫相、“法兰克人的公爵”。去世前一年，他像国王一样把国家分给两个儿子；741年死后葬进圣但尼修道院，跟墨洛温的国王们葬在一处。",
      "place": "w_saintdenis"
    }
  ],
  "history-west-merovingians/4": [
    {
      "id": "pepin-short",
      "when": "751年",
      "event": "受膏称王",
      "note": "法兰克贵族按老规矩在苏瓦松推他为王，又给他抹了圣油；据说是爱尔兰修士维尔吉利乌斯翻出一部爱尔兰教会法集，劝他受膏。墨洛温王靠血统和长发，他多了教会给的名分；754年教宗又给他父子涂了一回，不许法兰克人另立别家。",
      "place": "w_soissons"
    }
  ],
  "history-west-lombards/2": [
    {
      "id": "gregory-great",
      "when": "590年",
      "event": "不想当的教宗",
      "note": "罗马人推他当教宗，他写信请皇帝莫里斯不要批准，信却被罗马城的长官截了下来，皇帝的批文照样到了。他在任头一年的信里满是诉苦：担子太重，想念修道院里的清静日子。",
      "place": "rome"
    }
  ],
  "history-west-lombards/4": [
    {
      "id": "pepin-short",
      "when": "754年1月",
      "event": "蓬蒂翁的见面",
      "note": "教宗司提反二世翻过大圣伯纳德山口来到蓬蒂翁。丕平下马替教宗牵马走了一程；教宗则披麻蒙灰，俯伏在国王面前，求他替圣彼得和罗马人出头。半年后，教宗在圣但尼给丕平父子涂油。",
      "place": "w_ponthion"
    }
  ],
  "history-west-charlemagne/4": [
    {
      "id": "pope-leo-iii",
      "when": "799—800年",
      "event": "游行路上的伏击",
      "note": "前任教宗哈德良的侄子们看不起出身平常的他。大游行那天，一伙人在路上把他打翻在地，要割他的舌头、挖他的眼睛，他昏死过去，被法兰克使节救走。仇家又告他通奸、发伪誓；800年12月23日，他当众手捧福音书发誓自证清白。",
      "place": "rome"
    },
    {
      "id": "charlemagne",
      "when": "801年起",
      "event": "“治理罗马帝国的皇帝”",
      "note": "加冕后，他的公文开头改成：“查理，至尊的奥古斯都，上帝加冕的伟大而和平的皇帝，治理罗马帝国，蒙上帝怜悯为法兰克人和伦巴第人的王。”罗马人喊的是“罗马人的皇帝”，他自己从不这么写。",
      "place": "w_aachen"
    }
  ],
  "history-persia-khosrow-ii/0": [
    {
      "id": "bahram-chobin",
      "when": "589年",
      "event": "可汗的金宝座",
      "note": "他攻进巴尔赫，缴获突厥可汗的金库和金宝座。据塞贝奥斯，他只把王权信物等一小份送进宫，其余按功分给士兵。霍尔木兹表面嘉奖来使，心里冒火：饭是丰盛，可攒了那么多财宝，只送来这一点，不成体统。",
      "place": "bactra"
    }
  ],
  "history-persia-khosrow-ii/2": [
    {
      "id": "khosrow-ii",
      "when": "591—628年间",
      "event": "熏香的账本",
      "note": "萨珊的规矩：管税的官每年把一年的收入、开支和库存写在羊皮纸上，念给国王听，国王盖印批准。据巴拉祖里引伊本·穆加法，库思老二世嫌羊皮纸有膻味，下令账本一律改用番红花、玫瑰水熏过的羊皮纸。",
      "place": "ctesiphon"
    }
  ],
  "history-arab-conquest/5": [
    {
      "id": "yazdegerd-iii",
      "when": "651年",
      "event": "“你不过是我的奴仆”",
      "note": "据巴拉祖里，他逃到木鹿，总督和嚈哒首领尼扎克殷勤款待。尼扎克来信求娶他的女儿，他回话：你不过是我的一个奴仆，也配？又命总督交代收了多少钱。两人随即合谋除掉他。",
      "place": "merv"
    }
  ],
  "history-arab-conquest/6": [
    {
      "id": "peroz-iii",
      "when": "684年",
      "event": "乾陵前的石像",
      "note": "唐高宗死后第二年葬进乾陵，神道旁立着六十一尊外国使臣与君长的石像，其中有卑路斯，另一尊据考是他的弟弟。卑路斯这时已经去世，石像替他在唐朝皇帝的陵前站班。",
      "place": "changan"
    }
  ],
  "history-china-tang/1": [
    {
      "id": "tang-taizong",
      "when": "630年",
      "event": "天可汗",
      "note": "据《资治通鉴》，各族君长到长安请他做“天可汗”。他说：我是大唐天子，还要下去兼办可汗的事吗？群臣和四夷齐呼万岁。此后给西北各部首领的诏书，他都署名“天可汗”。",
      "place": "changan"
    }
  ]
};
