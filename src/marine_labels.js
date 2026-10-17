/* Mediterranean geography: label positions, not territorial boundaries.
   Major features appear from z3/4; local straits and small islands from z6/8. */
const MEDITERRANEAN_SEAS = {
  aegean:[38.55,25.2,'爱琴海','sea',3,0,0,'Aegean Sea'],
  adriatic:[42.75,15.6,'亚得里亚海','sea',3,38,0,'Adriatic Sea'],
  ionian:[36.95,19.0,'伊奥尼亚海','sea',4,0,0,'Ionian Sea'],
  tyrrhenian:[39.3,11.3,'第勒尼安海','sea',4,0,0,'Tyrrhenian Sea'],
  ligurian:[43.45,8.3,'利古里亚海','sea',4,0,0,'Ligurian Sea'],
  balearic:[41.05,3.2,'巴利阿里海','sea',4,0,0,'Balearic Sea'],
  alboran:[35.85,-2.7,'阿尔沃兰海','sea',4,0,0,'Alboran Sea'],
  cretan:[35.95,24.55,'克里特海','sea',6,0,0,'Sea of Crete'],
  libyan:[33.2,24.1,'利比亚海','sea',4,0,0,'Libyan Sea'],
  levantine:[33.4,31.0,'黎凡特海','sea',4,0,0,'Levantine Sea'],
  gulfLion:[42.25,4.7,'狮子湾','sea',6,0,0,'Gulf of Lion'],
  gulfGabes:[34.4,11.6,'加贝斯湾','sea',7,0,0,'Gulf of Gabès'],
  sicilyChannel:[36.7,12.6,'西西里海峡','sea',6,25,0,'Strait of Sicily'],
  gibraltar:[35.96,-5.62,'直布罗陀海峡','sea',6,0,0,'Strait of Gibraltar'],
  messina:[38.18,15.63,'墨西拿海峡','sea',7,62,0,'Strait of Messina'],
  otranto:[40.05,18.95,'奥特朗托海峡','sea',7,-35,0,'Strait of Otranto'],
  dardanelles:[40.22,26.47,'达达尼尔海峡','sea',7,-35,0,'Dardanelles'],
  marmara:[40.72,28.15,'马尔马拉海','sea',7,0,0,'Sea of Marmara']
};
Object.assign(BASE,MEDITERRANEAN_SEAS);
const MARITIME_SEA_IDS=new Set(['med',...Object.keys(MEDITERRANEAN_SEAS)]);
const BASE_LINKS={aegean:'aegean',adriatic:'adriatic'};
// id, Chinese, English, latitude, longitude, minimum zoom, [rotation], [archipelago]
const MEDITERRANEAN_ISLANDS=[
  ['cyprus','塞浦路斯','Cyprus',35.05,33.2,3],
  ['sardinia','萨丁岛','Sardinia',40.0,9.0,3],
  ['sicily','西西里岛','Sicily',37.55,14.05,3],
  ['corsica','科西嘉岛','Corsica',42.15,9.1,3],
  ['crete','克里特岛','Crete',35.17,24.5,3],
  ['balearicIslands','巴利阿里群岛','Balearic Islands',38.05,3.2,4,0,1],
  ['malta','马耳他','Malta',35.91,14.4,4],
  ['euboea','埃维亚岛','Euboea',38.6,23.9,5,-40],
  ['rhodes','罗得岛','Rhodes',36.13,27.97,6],
  ['lesbos','莱斯博斯岛','Lesbos',39.22,26.22,6],
  ['chios','希俄斯岛','Chios',38.38,26.0,6],
  ['samos','萨摩斯岛','Samos',37.75,26.82,7],
  ['mallorca','马略卡岛','Mallorca',39.68,2.99,4],
  ['menorca','梅诺卡岛','Menorca',39.99,4.05,7],
  ['ibiza','伊维萨岛','Ibiza',39.04,1.4,7],
  ['formentera','福门特拉岛','Formentera',38.7,1.48,8],
  ['ionianIslands','伊奥尼亚群岛','Ionian Islands',38.85,19.15,6,0,1],
  ['corfu','科孚岛','Corfu',39.63,19.83,7],
  ['kefalonia','凯法利尼亚岛','Kefalonia',38.2,20.57,7],
  ['zakynthos','扎金索斯岛','Zakynthos',37.78,20.78,7],
  ['lefkada','莱夫卡扎岛','Lefkada',38.72,20.65,8],
  ['cyclades','基克拉泽斯群岛','Cyclades',36.85,24.65,6,0,1],
  ['dodecanese','多德卡尼斯群岛','Dodecanese',36.8,27.55,6,0,1],
  ['sporades','斯波拉泽斯群岛','Sporades',39.6,23.8,6,0,1],
  ['santorini','圣托里尼岛','Santorini / Thera',36.4,25.43,7],
  ['naxos','纳克索斯岛','Naxos',37.05,25.48,8],
  ['paros','帕罗斯岛','Paros',37.05,25.15,8],
  ['kos','科斯岛','Kos',36.85,27.12,8],
  ['lemnos','利姆诺斯岛','Lemnos',39.92,25.24,7],
  ['elba','厄尔巴岛','Elba',42.78,10.25,7],
  ['capri','卡普里岛','Capri',40.55,14.24,8],
  ['djerba','杰尔巴岛','Djerba',33.8,10.88,7],
  ['pantelleria','潘泰莱里亚岛','Pantelleria',36.78,11.99,8],
  ['lampedusa','兰佩杜萨岛','Lampedusa',35.5,12.58,8],
  ['gozo','戈佐岛','Gozo',36.05,14.25,8]
];
