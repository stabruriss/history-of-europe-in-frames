
{ id:'canaan', ch:6, title:'迦南', short:'迦南', c:COL.canaan,
  sub:'青铜时代的城邦地带，不是一个统一国家',
  view:[[30.4,33.6],[35.7,37.0]],
  legend:[['fill',COL.canaan,'迦南：南黎凡特—黎巴嫩海岸，范围浮动'],['dot','#2a2018','青铜时代城邦与地标']],
  html:`<p class="lede"><b>迦南（Canaan）</b>是古代南黎凡特的地区名，大致对应今天以色列、巴勒斯坦及黎巴嫩一带，有时延伸到约旦和叙利亚部分地区。它不是一个统一的“迦南帝国”。</p>
  <ul>
  <li><b>历史背景</b>：前二千纪，城邦、港口和国际贸易网络兴盛。前 14 世纪的阿马尔纳书信，留下了这些地方统治者与埃及法老往来的实物记录。</li>
  <li><b>地理结构</b>：西边是沿海平原，中间是丘陵，东边是约旦裂谷。米吉多扼守沿海通往耶斯列平原的交通口，夏琐控制北部通道。</li>
  <li><b>与埃及</b>：尤其在晚青铜时代，许多城邦受埃及支配。这里是埃及、赫梯及两河诸强国之间的走廊。</li>
  <li><b>与后来的名字</b>：铁器时代的腓尼基城市、以色列与犹大，都在这片较早的迦南文化背景上发展，不能简单看成凭空替换的一批民族。</li>
  <li><b>圣经中的迦南</b>：作为“应许之地”的目的地，是宗教叙事中的用法。考古学对以色列人的形成，更强调本地人口和社会变化；不能把《约书亚记》直接画成已证实的征服地图。</li>
  </ul>
  <p class="see"><a class="go" data-go="exodus">出埃及 Exodus</a><a class="go" data-go="phoenicia">腓尼基 Phoenicia</a><a class="go" data-go="israel">以色列 Israel</a></p>`,
  draw(d){
    d.region('canaan',COL.canaan,{weight:2,fillOpacity:.26});
    d.river('jordan',{color:COL.nile,weight:2.4,opacity:.95});
    d.pin(P('比布鲁斯',34.121,35.648,'青铜时代已与埃及密切贸易，后来成为腓尼基城市。','city',{left:1}));
    d.pin(P('提尔',33.271,35.196,'迦南沿海城市，后来成为腓尼基的海上强邦。','city',{left:1}));
    d.pin(P('夏琐',33.018,35.569,'北部重要的青铜时代城邦。','site',{labelZ:7}));
    d.pin(P('米吉多',32.585,35.184,'交通要冲；前 15 世纪图特摩斯三世在此作战。','site',{left:1}));
    d.pin(P('示剑',32.213,35.282,'中部山地的古城，今纳布卢斯附近。'));
    d.pin(P('耶路撒冷',31.778,35.235,'青铜时代已见于埃及相关文献，远早于大卫。','city',{left:1}));
    d.pin(P('耶利哥',31.871,35.444,'约旦谷地古城。聚落和城墙远早于铁器时代。'));
    d.pin(P('迦萨',31.503,34.466,'通往埃及的沿海门户。','city',{left:1}));
    d.label(LB('迦南',34.35,36.4,'region',{en:'Canaan',c:COL.canaan}));
    levantWater(d);
  }},

{ id:'exodus', ch:6, title:'出埃及', short:'出埃及', c:COL.exodus,
  sub:'宗教叙事与历史问题，不能当作已确定的行军记录', hide:['sinai'],
  view:[[27.2,30.0],[33.0,36.6]],
  legend:[['dline',COL.exodus,'一条传统南线的故事定位（未经证实）'],['fill',COL.canaan,'迦南：叙事中的目的地']],
  html:`<p class="lede"><b>出埃及（Exodus）</b>讲的是摩西带领以色列人离开埃及，经过旷野，走向迦南。它是犹太教的核心救赎记忆，也深刻影响基督教与伊斯兰教。</p>
  <div class="caution"><b>虚线不是“考古确认的路线”。</b>事件规模、年代、过海地点、西奈山位置都没有定论。图中只呈现一种传统南线，帮助理解故事中的地理关系。</div>
  <ul>
  <li><b>何时</b>：按不同的圣经年代推算，常被放在前 15 世纪或前 13 世纪。前者由《列王纪上》6:1 的“480 年”推得；后者与拉美西斯时代的背景联系。事件的年代、规模与具体路线均未确定。</li>
  <li><b>如何读证据</b>：现有考古材料不能确认圣经描述的整段大规模迁徙。有学者讨论其中是否保存了较小群体离开埃及的历史记忆；没有公认的完整事件重建。</li>
  <li><b>故事的几个空间</b>：尼罗河三角洲东部 → 过海 → 西奈旷野与立约 → 加低斯巴尼亚 → 约旦河东的摩押平原。摩西在进入迦南之前去世；渡约旦河属于接下来的约书亚叙事。</li>
  <li><b>“红海”还是“芦苇海”</b>：希伯来语 Yam Suph 常译作 Sea of Reeds，也传统译作 Red Sea；不能仅凭这个译名就确定今天地图上的过海点。</li>
  <li><b>西奈山</b>：图上标的是传统所认的杰贝勒穆萨（Jebel Musa），不表示这一认定已经被考古证明。</li>
  </ul>
  <p class="hint">故事依据：《出埃及记》《民数记》《申命记》。历史问题参考 <a href="https://www.britannica.com/event/Exodus-Old-Testament" target="_blank" rel="noopener">Britannica：Exodus</a>。</p>
  <p class="see"><a class="go" data-go="canaan">迦南 Canaan</a><a class="go" data-go="jordan">约旦河 Jordan River</a></p>`,
  draw(d){
    d.region('canaan',COL.canaan,{weight:1,fillOpacity:.16});
    d.line(EXODUS_PATH,{color:COL.exodus,weight:3,opacity:.85,dashArray:'5 7'});
    d.pin(P('比兰塞',30.80,31.83,'Pi-Ramesses，埃及拉美西斯时代的都城。名字见于出埃及叙事，不等于它证实了该事件。','site',{left:1}));
    d.label(LB('过海地点未定',30.2,32.7,'note',{en:'Sea of Reeds?'}));
    d.pin(P('传统西奈山',28.539,33.975,'杰贝勒穆萨；传统认定，缺乏决定性历史证明。','peak',{en:'Traditional Mount Sinai',left:1}));
    d.pin(P('加低斯巴尼亚',30.65,34.43,'传统定位于艾因古代拉特一带。故事中的旷野驻地。','site'));
    d.pin(P('尼波山',31.768,35.726,'传统中摩西在这里眺望应许之地。','peak'));
    d.label(LB('摩押平原',31.95,35.9,'people',{en:'Plains of Moab'}));
    d.label(LB('西奈半岛',29.35,34.0,'people',{en:'Sinai Peninsula'}));
    d.label(LB('出埃及',29.45,30.8,'region sm',{en:'Exodus',c:COL.exodus}));
  }},

{ id:'unitedMonarchy', ch:6, title:'大卫与所罗门的王国', short:'统一王国', c:COL.united,
  sub:'United Monarchy：传统王国与广域王权叙述分层看',
  view:[[30.5,34.1],[33.6,37.1]],
  legend:[['fill',COL.united,'中部山地：核心地理参照，并非已证实国界'],['dash',COL.united,'“从但到别是巴”的传统定位范围']],
  html:`<p class="lede">大卫与所罗门通常被放在<b>前 10 世纪</b>，圣经传统认为他们从耶路撒冷统治一个“统一王国”（<b>United Monarchy</b>）。究竟统一到什么程度、实际统治多大，仍有重要争论。</p>
  <div class="caution">请区分：<b>实际行政统治、战争获胜、受贡或势力范围、宗教文本的理想王权</b>。它们不能全涂成同一块确定国土。</div>
  <ul>
  <li><b>大卫</b>：按传统先以希伯仑为中心，后取耶路撒冷为都。《撒母耳记下》8 章描述他对非利士、摩押、以东及亚兰的战争和支配；这些叙述不能直接等同于可测绘的行政边界。</li>
  <li><b>所罗门</b>：传统中建造第一圣殿，与提尔的希兰合作。《列王纪上》4:21、4:24 描述其王权及受贡关系，广至“那河”（通常理解为幼发拉底河）、迦萨与埃及边界。</li>
  <li><b>默认图</b>：只给中部山地和“从但到别是巴”的故事定位。这个虚线框也不是考古确认的统一王国国界。</li>
  <li><b>若看广域叙述</b>：下面的按钮可叠加所罗门王权的<b>文本示意</b>。腓尼基的提尔是合作伙伴，不应据此就说整个腓尼基被吞并。</li>
  <li><b>实物证据与争议</b>：前 9 世纪的特尔丹石碑通常被解释为提到“大卫之家”，支持当时存在以大卫命名的王朝记忆；它不能证明圣经所述帝国的规模。大型建筑的年代归属、耶路撒冷当时的规模和所罗门王国的组织程度，学界仍有分歧。</li>
  </ul>
  <button class="map-jump" id="royalClaim" aria-pressed="false">叠加所罗门的广域王权叙述 · 非考古国界</button>
  <p class="hint" id="royalStatus">当前：核心地理参照；未叠加广域叙述。</p>
  <p class="hint">文本依据：《撒母耳记下》8；《列王纪上》4:21–24。人物参考：<a href="https://www.britannica.com/biography/David-king-of-Israel" target="_blank" rel="noopener">David</a> · <a href="https://www.britannica.com/biography/Solomon" target="_blank" rel="noopener">Solomon</a>。</p>
  <p class="see"><a class="go" data-go="israel">后来的南北两国</a><a class="go" data-go="jerusalem">耶路撒冷 Jerusalem</a></p>`,
  draw(d){
    d.region('centralHighlands',COL.united,{weight:1,fillOpacity:.28});
    d.region('danBeersheba',COL.united,{fill:false,weight:2,dashArray:'6 5'});
    d.river('jordan',{color:COL.nile,weight:2.4,opacity:.9});
    d.pin(P('耶路撒冷',31.778,35.235,'传统中大卫与所罗门的王都。','big',{left:1}));
    d.pin(P('希伯仑',31.532,35.095,'传统中大卫早期的王都。','city',{left:1}));
    d.pin(P('但',33.249,35.652,'“从但到别是巴”的北端。','site'));
    d.pin(P('别是巴',31.244,34.841,'“从但到别是巴”的南端。','site',{left:1}));
    d.pin(P('提尔',33.271,35.196,'所罗门的合作伙伴希兰所在的腓尼基城邦。','city',{left:1}));
    d.pin(P('迦萨',31.503,34.466,'《列王纪上》广域王权叙述的西南参照点。','city',{left:1}));
    d.label(LB('统一王国',32.55,36.4,'region sm',{en:'United Monarchy',c:COL.united}));
    const button=document.getElementById('royalClaim');
    button.onclick=()=>{
      const on=button.getAttribute('aria-pressed')!=='true';
      button.setAttribute('aria-pressed',String(on));
      if(on){
        narrativeLayer=d.region('solomonNarrative',COL.united,{weight:2,fillOpacity:.055,dashArray:'3 7'});
        focusBounds([[29.8,33.5],[36.7,41.4]]);
      } else {
        if(narrativeLayer){group.removeLayer(narrativeLayer);narrativeLayer=null;}
        fit(ENTRIES[cur],true);
      }
      document.getElementById('royalStatus').textContent=on?'当前：虚线为《列王纪》广域王权的文本示意，不是已证实的实际国土。':'当前：核心地理参照；未叠加广域叙述。';
      legend.innerHTML=legendHTML(ENTRIES[cur])+(on?'<div><s class="dash" style="--c:'+COL.united+'"></s>所罗门广域王权：仅文本示意</div>':'');
    };
    levantWater(d);
  }},

{ id:'jerusalem', ch:6, title:'耶路撒冷', short:'耶路撒冷', c:COL.jerusalem,
  sub:'一座城市，多次成为王都、圣城与冲突中心', fitZoom:9.5,
  view:[[31.1,34.7],[32.15,35.8]],
  legend:[['dot',COL.jerusalem,'耶路撒冷与周边地标'],['line',COL.nile,'约旦河：位于城市以东']],
  html:`<p class="lede"><b>耶路撒冷（Jerusalem）</b>位于犹大山地，海拔约 750 米：不是海港，也不在约旦河边，而是在地中海与死海之间的高地。</p>
  <ul>
  <li><b>起点比大卫早</b>：前二千纪已见于埃及相关文献。圣经传统中，大卫约在前 1000 年取城为都，所罗门建立第一圣殿；这段史事的具体规模和年代不能全部视为已获考古证明。</li>
  <li><b>前 586 年</b>：新巴比伦攻陷犹大，第一圣殿被毁；后来的第二圣殿时期使它成为犹太宗教生活的核心。</li>
  <li><b>约前 20 年—公元 70 年</b>：希律扩建圣殿建筑群；罗马在公元 70 年毁掉第二圣殿。西墙（Western Wall）是圣殿山平台挡土结构的遗存，不是圣殿主体的一面墙。</li>
  <li><b>基督教与伊斯兰教</b>：圣墓教堂联系耶稣受难与复活传统；圆顶清真寺与阿克萨清真寺所在的尊贵禁地（Haram al-Sharif），也就是犹太传统所称圣殿山（Temple Mount）。</li>
  <li><b>近现代</b>：1948 年后城市分治，1967 年以色列控制东耶路撒冷。其地位与主权归属属于以巴冲突的核心争议，不能由任何古代地图直接推出。</li>
  </ul>
  <div class="lao">一座山城，先后被王权、圣殿、教堂和清真寺赋予意义。这里保留从传统王都到后世宗教中心的时间线，帮助区分不同年代的意义。</div>
  <p class="hint">参考：<a href="https://www.britannica.com/place/Jerusalem" target="_blank" rel="noopener">Britannica：Jerusalem</a>。</p>
  <p class="see"><a class="go" data-go="unitedMonarchy">大卫与所罗门</a><a class="go" data-go="israel">以色列与犹大</a></p>`,
  draw(d){
    d.pin(P('耶路撒冷',31.778,35.235,'犹大山地的城市；王都与圣城。','big',{c:COL.jerusalem}));
    d.pin(P('伯利恒',31.704,35.207,'位于耶路撒冷以南；大卫与耶稣诞生传统关联此地。','city',{left:1}));
    d.pin(P('希伯仑',31.532,35.095,'耶路撒冷以南的山地古城。','city',{left:1}));
    d.pin(P('耶利哥',31.871,35.444,'下到约旦裂谷，就是耶利哥；与耶路撒冷有显著高差。'));
    d.label(LB('犹大山地',31.91,35.09,'people',{en:'Judean Highlands'}));
    d.label(LB('死海',31.37,35.49,'sea',{en:'Dead Sea'}));
    d.river('jordan',{color:COL.nile,weight:2.5,opacity:.95});
  }},

{ id:'phoenicia', ch:6, title:'腓尼基', short:'腓尼基', c:COL.phoenicia,
  sub:'迦南沿海传统的延续；城邦和贸易网，不是统一帝国', hide:['lebanon'],
  view:[[32.6,34.4],[35.2,37.0]],
  legend:[['fill',COL.phoenicia,'腓尼基海岸核心（概略）'],['dline',COL.phoenicia,'海上联系示意，不是精确航线']],
  html:`<p class="lede"><b>腓尼基（Phoenicia）</b>主要是今天黎巴嫩及其附近的狭长海岸：提尔、西顿、比布鲁斯等城邦。背后是山，前面是海，于是向海上找出路。</p>
  <ul>
  <li><b>历史背景</b>：约前 1200–前 600 年，尤其前 9–前 7 世纪的航海、殖民与商业网络。城市本身在青铜时代就已存在。</li>
  <li><b>不是一个国家</b>：各城有自己的统治者，语言和贸易文化相近。“腓尼基”是希腊人的总称，常与紫红染料联系；当地人的认同也常以城市为单位。</li>
  <li><b>字母的传播</b>：腓尼基文字继承更早的字母书写传统。希腊人借用它并系统表示元音，后来经意大利的中介传到拉丁字母。</li>
  <li><b>海上世界</b>：塞浦路斯、北非的迦太基、西西里与西地中海港口，都进入这张贸易网。迦太基传统建城年代是前 814 年，后来成为独立的海上强国。</li>
  <li><b>与希腊、以色列</b>：既贸易也竞争。圣经中的希兰与所罗门合作，提供木材和工匠；这不等于腓尼基属于所罗门的行政领土。</li>
  </ul>
  <button class="map-jump" data-bounds="[[28,-9],[39,38]]">展开地中海贸易网 · Mediterranean network</button>
  <button class="map-jump" data-bounds="[[32.6,34.4],[35.2,37.0]]">回到腓尼基海岸 · Phoenician coast</button>
  <p class="hint">参考：<a href="https://www.metmuseum.org/essays/the-phoenicians-1500-300-b-c" target="_blank" rel="noopener">The Met：The Phoenicians</a>。</p>`,
  draw(d){
    d.region('phoenicia',COL.phoenicia,{weight:2,fillOpacity:.38});
    const trade={color:COL.phoenicia,weight:2,opacity:.7,dashArray:'4 7'};
    d.line([[33.27,35.20],[34.2,33.3],[34.7,27.5],[34.4,20],[35.89,14.5],[36.85,10.32]],trade);
    d.line([[36.85,10.32],[38.4,7.7],[38.9,1.4],[36.2,-2.5],[36.53,-6.29]],trade);
    d.pin(P('提尔',33.271,35.196,'重要的航海和殖民城邦；迦太基的传统母邦。','big',{left:1}));
    d.pin(P('西顿',33.563,35.371,'腓尼基重要港城。','city',{left:1,labelZ:6}));
    d.pin(P('比布鲁斯',34.121,35.648,'与埃及贸易纸草和木材的古港。','city',{left:1,labelZ:6}));
    d.pin(P('基提翁',34.917,33.635,'今塞浦路斯拉纳卡的古城。','colony'));
    d.pin(P('迦太基',36.85,10.32,'传统建于前 814 年，后来发展为独立的海上强国。','colony'));
    d.pin(P('加的斯',36.53,-6.29,'古称 Gadir，西地中海的腓尼基商站。','colony'));
    d.label(LB('腓尼基',34.55,36.55,'region',{en:'Phoenicia',c:COL.phoenicia}));
    d.label(LB('黎巴嫩山',33.75,36.10,'mtn',{en:'Mount Lebanon',rot:65}));
  }},

{ id:'israel', ch:6, title:'以色列', short:'以色列', c:COL.israel,
  sub:'古代族群、北方王国，与现代国家要分开',
  view:[[30.6,34.0],[33.65,37.2]],
  legend:[['fill',COL.israel,'北方以色列王国：前 9–前 8 世纪概略'],['fill','#a66a36','南方犹大王国：同时期概略']],
  html:`<p class="lede"><b>以色列（Israel）</b>至少有三层意思：古代以色列人；铁器时代的以色列王国；1948 年建立的现代以色列国。它们不是同一张地图。</p>
  <ul>
  <li><b>最早的外部记载</b>：约前 1208 年的埃及麦伦普塔赫石碑提到“以色列”，当时写法指向一个人群，不是在证明后来王国已存在。</li>
  <li><b>北方王国</b>：前 9–前 8 世纪，北方王国在暗利及其后继王朝时期发展，耶罗波安二世时代扩张。这里比把统一王国涂成确定帝国更适合讨论有较丰富证据的政治体。</li>
  <li><b>地图上分成两国</b>：北方以色列（Israel），都城撒马利亚；南方犹大（Judah），都城耶路撒冷。按圣经传统，分裂发生在所罗门去世后，约前 930 年。</li>
  <li><b>结局</b>：约前 722/720 年撒马利亚被亚述征服，北国灭亡；前 586 年犹大被新巴比伦征服。各时期边界变化很大，图中仅示意铁器时代的主要地域。</li>
  <li><b>现代国家</b>：1948 年以色列宣布建国。以巴争议、占领地区及耶路撒冷地位是现代国际政治问题；古代文化和宗教地图不能自动构成现代领土依据。</li>
  </ul>
  <p class="see"><a class="go" data-go="unitedMonarchy">传统统一王国</a><a class="go" data-go="jerusalem">耶路撒冷 Jerusalem</a><a class="go" data-go="jordan">约旦 Jordan</a></p>`,
  draw(d){
    d.region('israelKingdom',COL.israel,{weight:2,fillOpacity:.3});
    d.region('judahKingdom','#a66a36',{weight:2,fillOpacity:.3});
    d.river('jordan',{color:COL.nile,weight:2.6,opacity:.95});
    d.pin(P('撒马利亚',32.276,35.190,'暗利王朝建立的北国都城，今塞巴斯蒂耶一带。','big',{left:1}));
    d.pin(P('耶路撒冷',31.778,35.235,'南方犹大王国的都城。','big',{left:1}));
    d.pin(P('但',33.249,35.652,'北方边缘的古城与宗教中心。','site'));
    d.pin(P('耶斯列',32.558,35.321,'北方肥沃平原上的王家据点。','site',{left:1}));
    d.pin(P('拉吉',31.565,34.849,'犹大重要城，前 701 年遭亚述攻取，前 6 世纪再次毁灭。','site',{left:1}));
    d.pin(P('别是巴',31.244,34.841,'南方边缘的古城。','site',{left:1}));
    d.label(LB('以色列',32.75,36.65,'region sm',{en:'Kingdom of Israel',c:COL.israel}));
    d.label(LB('犹大',30.95,36.2,'region sm',{en:'Kingdom of Judah',c:'#a66a36'}));
    levantWater(d);
  }},

{ id:'jordan', ch:6, title:'约旦与约旦河', short:'约旦', c:COL.jordan,
  sub:'现代国家 Jordan，与古老的河流 Jordan River',
  view:[[29.0,34.0],[33.6,39.5]],
  legend:[['fill',COL.jordan,'现代约旦：只作地理定位'],['line',COL.nile,'约旦河：不是整个现代国界']],
  html:`<p class="lede"><b>约旦（Jordan）</b>是约旦河以东的现代国家；<b>约旦河（Jordan River）</b>是一条由北向南、流入死海的古老河流。国名来自河名，但二者不等同。</p>
  <ul>
  <li><b>河流怎么走</b>：北方源流 → 加利利海（Sea of Galilee）→ 约旦谷地 → 死海（Dead Sea）。死海没有通海出口，湖面低于海平面约 430 米，数值会随水位改变。</li>
  <li><b>古代河东</b>：从北到南有基列、亚扪、摩押、以东等地区和政权。今天安曼的名字与古代亚扪有关；佩特拉则是后来纳巴泰人的商贸中心。</li>
  <li><b>宗教记忆</b>：约书亚渡河进入迦南，耶稣受洗，都与这条河有关。具体叙事地点与古代水文，不应直接等同于每一处现代纪念地。</li>
  <li><b>现代国家</b>：外约旦在一战后的委任统治体系中形成，1946 年独立，1949 年采用“约旦哈希姆王国”国名。现代国家与同名河流要分开理解。</li>
  <li><b>看国界</b>：约旦河只构成部分边界。现代约旦还向东伸入沙漠，南到亚喀巴湾；不能把古代的“约旦河东”与今天的国家画成完全相同。</li>
  </ul>
  <p class="see"><a class="go" data-go="exodus">出埃及 Exodus</a><a class="go" data-go="canaan">迦南 Canaan</a></p>`,
  draw(d){
    d.region('jordanModern',COL.jordan,{weight:1.7,fillOpacity:.2});
    d.river('jordan',{color:COL.nile,weight:3.4,opacity:.95});
    d.pin(P('安曼',31.953,35.910,'现代约旦首都；古代拉巴亚扪，希腊化时代称费拉德尔菲亚。','modern'));
    d.pin(P('佩特拉',30.328,35.444,'纳巴泰王国的商贸中心，著名岩凿建筑。','site'));
    d.pin(P('亚喀巴',29.532,35.006,'约旦的红海港口。','modern'));
    d.pin(P('尼波山',31.768,35.726,'传统中摩西眺望迦南的山。','peak',{left:1}));
    d.pin(P('耶路撒冷',31.778,35.235,'在河西的犹大山地，不是约旦王国的城市。','city',{left:1}));
    d.label(LB('约旦',31.8,38.1,'region',{en:'Jordan',c:COL.jordan}));
    d.label(LB('约旦河',32.35,35.1,'river',{en:'Jordan River',rot:70}));
    d.label(LB('加利利海',32.82,35.8,'sea',{en:'Sea of Galilee'}));
    d.label(LB('死海',31.4,35.1,'sea',{en:'Dead Sea'}));
    d.label(LB('亚扪',32.1,36.7,'people',{en:'Ammon'}));
    d.label(LB('摩押',31.35,36.4,'people',{en:'Moab'}));
    d.label(LB('以东',30.3,36.1,'people',{en:'Edom'}));
  }},
