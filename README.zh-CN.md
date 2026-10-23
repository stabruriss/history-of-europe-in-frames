<h1 align="center">History of Europe in Frames</h1>

<p align="center">
  以地图分镜讲述欧洲历史——从史前时代直至二战之后，浓缩于单个离线 HTML 文件的个人学习笔记。
</p>

<p align="center">
  <a href="./index.html"><strong>index.html</strong></a>
  ·
  <a href="https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fstabruriss%2Fhistory-of-europe-in-frames"><strong>一键部署至 Vercel</strong></a>
  ·
  <a href="./LICENSE">MIT 许可证</a>
</p>

<p align="center">
  <a href="./README.md">English</a> · <strong>简体中文</strong>
</p>

这是一份以交互式地图呈现的欧洲史学习笔记，计划从人类走出非洲的史前时代一路写到第二次世界大战之后。全书以中文撰写，所有人物与地名均附有英文对照，希望能为使用中文学习欧洲历史的读者提供一份清晰、生动的参考。

笔记以“分镜”的方式展开：每一节由若干幕地图组成，疆域、路线与城邦随时间流转而重绘，旁侧辅以短文，道出彼时彼刻的来龙去脉。在叙事上，这份笔记重因果而轻年表，试图从权力、财政成本与统治合法性的视角去理解历史的演进，而非将其简化为一条通往现代欧洲的单向直线；遇到可以互相发明的地方，也会将同时代的中国置于一旁加以对照。

目前已完成第一阶段**《地中海与近东》**（自人类走出非洲至西罗马帝国终结与迦克墩公会议），后续的中世纪与近现代篇章将沿历史树继续向下生长。

## 界面预览

![布匿战争：汉尼拔翻越阿尔卑斯的进军路线，右侧为正文、名场面标签与人物卡片](./docs/images/punic-wars.jpg)

![君士坦丁的新罗马：自亚历山大里亚改驶新都的粮道，左侧为历史树，底部为本节分镜](./docs/images/new-rome.jpg)

## 使用方式

直接用桌面或手机浏览器打开 `index.html` 即可阅读。地图引擎（Leaflet）、基础地理数据、历代疆域、正文与人物卡片均已内嵌在这一份文件中，无需启动服务器，离线亦可完整浏览。联网状态下，页面会自动加载地形晕渲图层，文末的延伸阅读链接也可直接访问。

当前已收录的内容包括：

- **地理概念**：涵盖海域、山脉、河流、商道与历史区域，共 33 个条目。
- **动力专题**：与“历史进程”“地理概念”并列的宏观机制专栏（主线讲事情怎么发生，专题讲事情为什么总这样发生），现已收录 8 篇专题、32 幕对照地图（《圣杯与剑：统治的成本》《减压阀与大马路：社会阶梯》《战斗力决定话语权》《为什么中国没有平民和贵族的拉扯》《罗马内政：三方怎么拉扯》《吸纳的机器：罗马为什么人多兵多》《黑羊与收买：一再重演的闹剧》《城里没有兵：广场政治的源头》）。
- **历史进程**：现已写就 10 章、97 节、343 幕地图，起于上古初民，经罗马帝国写到西罗马终结；东罗马按王朝一路写到马其顿王朝绝嗣（1056年），西欧写到法兰克、伦巴第与查理曼，基督教经圣像之争写到1054年东西教会大分裂；埃及、波斯各成一条主线（从最早的国家写到阿拉伯征服），并附有同时期中国的大事对照（写到唐）。
- **历史树**：以纵轴标示时间，按主题分出希腊、罗马、东罗马、中世纪西欧、基督教、埃及、波斯，以及一条与之平行的**中国**时间线（自新石器聚落、三代秦汉、南北朝、隋唐，供跨文明时间对照）。埃及、波斯从早期国家处分出，托勒密、塞琉古、罗马、东罗马在这两条线上都只是这片土地的临时统治者。每条线停下时都有交代：希腊并入罗马；罗马以476年西罗马终结收尾，分出东罗马与中世纪西欧。同时影响几条线的大事（希拉克略的圣战换家、阿拉伯征服，以及641年以后东罗马与基督教一同经历的几次大公会议和教会之争）做成共享站，在每条线的同一时间切面各有一站、同时点亮，只呈现一套分幕和说明。选中任一脉络后，可用 `↑` `↓` 键沿时间线上下游历，用 `←` `→` 键切换同一节内的各幕场景。
- **人物与名场面**：收录 167 位历史人物、223 张纪年人物卡，为马拉松、温泉关等标志性历史时刻设有 192 个“名场面”标签，另有 10 个讲清一个专题的“豆腐块”小框（如哥特人怎么打仗、查士丁尼身后与汉武帝、任意一条线），并附有 752 条主要指向在线古典原典的阅读链接。

*注：图中的古代疆域系沿海岸线裁剪而成的教学示意区域，旨在辅助空间理解，并非严格考据的边界复原。*

## 构建与部署

```sh
npm run build        # 即 cd src && python3 assemble.py ../index.html
```

项目根目录已配置 `vercel.json`，支持在 Vercel 中直接导入本仓库（或点击页首的 [一键部署至 Vercel](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fstabruriss%2Fhistory-of-europe-in-frames)），无需额外设置即可自动完成构建并发布静态页面。

构建脚本 `src/assemble.py` 仅依赖 Python 标准库。它会将 Leaflet、底图（`data.json`）、历史疆域（`history_geo.json`）、目录条目、正文以及人物卡依次填入 `src/template.html` 的占位符中，生成最终的 `index.html`；若有任何占位符未能填妥，构建便会报错中止。因此，日常修订请直接编辑 `src/` 目录下的源文件，切勿手动修改 `index.html`。

| 路径 | 说明 |
| --- | --- |
| `src/template.html`、`src/layout.css`、`src/atlas_ui.js` | 页面骨架、排版样式与交互逻辑 |
| `src/history_entries.js` | 历史章节、分镜场景、地图视野、历史树及各条脉络 |
| `src/history_content.json` | 各节正文、名场面标签与延伸阅读链接 |
| `src/historical_figures.js` | 历史人物、纪年卡片与关联地点 |
| `src/levante_entries.js`、`src/labels_dates.js`、`src/marine_labels.js` | 地理概念条目与地图注记 |
| `src/data.json`、`src/history_geo.json` | 经简化处理的基础底图与历代疆域数据 |
| `src/build*.py` | 生成上述两份地理数据的 Python 脚本（详见下文） |
| `tests/verify-*.js` | 自动化浏览器测试脚本，按功能模块划分 |

## 自动化测试

```sh
npm install
npm test             # 针对 index.html 依次运行 tests/verify-*.js
```

测试套件通过 `puppeteer-core` 驱动本地 Chrome 浏览器，自动核验以下内容：
- 章节、场景、人物卡的数量统计与单幕正文字数上限；
- 各幕正文中的关键表述；
- 历史树导航与键盘快捷键交互；
- 桌面端与手机端（390 px 宽）的响应式布局，确保无横向溢出；
- 页面零运行时报错，以及完全断网状态下的可用性。

脚本默认调用 `/Applications/Google Chrome.app`；若浏览器安装在其他路径，可通过环境变量 `CHROME_PATH` 指定。测试过程中生成的截图保存在 `tests/shots*/` 目录下（已由 Git 忽略）。

## 重新生成地理数据

图册在阅读与常规构建时并不需要运行这部分脚本；唯有在增补或重绘历史疆域时才需调用。

脚本依赖 `shapely` 与 `pyshp`，其中 `build.py`、`build_history.py` 和 `build_west_geo.py` 还需读取 [Natural Earth](https://www.naturalearthdata.com/) 的公开地理数据（`build.py` 使用陆地、湖泊、河流与现代国界，`build_history.py` 使用陆地轮廓，`build_west_geo.py` 使用水系中心线）。请在 `src/` 目录下按序执行：

1. 运行 `build.py`，生成基础底图 `data.json`。
2. 运行 `build_history.py <natural-earth-dir>`，从头生成 `history_geo.json`。
3. 依次运行各时期的疆域脚本，向 `history_geo.json` 追加对应时代的图层：`build_rome_geo.py`、`build_punic_geo.py`、`build_late_rep_geo.py`、`build_west_geo.py <natural-earth-dir>`、`build_empire_geo.py`、`build_const_geo.py`。

## 许可证

本项目采用 [MIT 许可证](./LICENSE) 开源。页面内嵌的 Leaflet 遵循其原有的 BSD-2-Clause 许可，基础底图源自公有领域的 Natural Earth 数据。第三方资源与引文说明详见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
