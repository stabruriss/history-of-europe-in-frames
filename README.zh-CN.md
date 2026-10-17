<h1 align="center">History of Europe in Frames</h1>

<p align="center">
  用地图一幕一幕讲欧洲历史，整本图册就是一个离线 HTML 文件。
</p>

<p align="center">
  <a href="./index.html"><strong>index.html</strong></a>
  ·
  <a href="./LICENSE">MIT 许可证</a>
</p>

<p align="center">
  <a href="./README.md">English</a> · <strong>简体中文</strong>
</p>

这里放的是中文历史图册《地中海与近东》，人名、地名都附英文，从走出非洲一直讲到西罗马灭亡。每一节由几幕地图组成：地图随时间变化，旁边用一小段话讲清这一刻发生了什么、为什么。

正文重因果、轻年表。它从权力、成本和合法性去读这段历史，不把它写成通向欧洲的直线；有可比之处，就把同时代的中国摆在旁边。

## 界面

![布匿战争：汉尼拔翻越阿尔卑斯的路线，右边是正文、名场面和人物卡](./docs/images/punic-wars.jpg)

![君士坦丁的新罗马：埃及粮船改驶新都，左边是历史树，下面是本节各幕](./docs/images/new-rome.jpg)

## 打开方式

用电脑或手机浏览器直接打开 `index.html`。Leaflet、底图、历史疆域和全部文字都在这一个文件里，不用服务器，断网也能看。联网时会多载入一层地形晕渲，阅读链接也能点开。

- **地理概念**：海、山、河、道路和区域，共 33 条。
- **历史进程**：7 章、54 节、163 幕地图，从上古讲到帝国和基督教。
- **历史树**：从上到下是时间，每个主题一条线，包括希腊主线、罗马、托勒密埃及、塞琉古、西罗马和基督教。先选一条线，↑ ↓ 沿线走，← → 切换本节的各幕。
- **人物与名场面**：102 个人物，148 张带年份的卡片；马拉松、温泉关这类标志性事件有 108 个名场面标签；227 条阅读链接，大多指向在线原典。

古代疆域按海岸线画成示意区域，不是考证出来的边界。

## 构建

```sh
npm run build        # 即 cd src && python3 assemble.py ../index.html
```

`src/assemble.py` 只用 Python 标准库，把 Leaflet、底图（`data.json`）、历史疆域（`history_geo.json`）、条目、正文和人物卡逐一填进 `src/template.html` 的占位符；只要还剩一个没填，就报错停下。改内容只改 `src/` 里的文件，不要手改 `index.html`。

| 路径 | 内容 |
| --- | --- |
| `src/template.html`、`src/layout.css`、`src/atlas_ui.js` | 页面骨架、样式和交互 |
| `src/history_entries.js` | 各节、各幕、地图视野、历史树和主线 |
| `src/history_content.json` | 各节正文、名场面标签和阅读链接 |
| `src/historical_figures.js` | 人物、人物卡和地点 |
| `src/levante_entries.js`、`src/labels_dates.js`、`src/marine_labels.js` | 地理条目和地图标注 |
| `src/data.json`、`src/history_geo.json` | 底图和历史疆域（已简化） |
| `src/build*.py` | 生成上面两个地理文件的脚本（见下文） |
| `tests/verify-*.js` | 浏览器自动检查，每块功能一套 |

## 检查

```sh
npm install
npm test             # 对 index.html 逐个运行 tests/verify-*.js
```

检查用 `puppeteer-core` 驱动本机 Chrome，内容包括：
- 各项计数和每幕字数上限；
- 每幕的关键句；
- 历史树和键盘操作；
- 桌面和 390 px 手机两种宽度，有没有横向溢出；
- 页面报错，以及断网能否正常使用。

默认的 Chrome 路径是 `/Applications/Google Chrome.app`，装在别处时用 `CHROME_PATH` 指定。截图存到 `tests/shots*/`，不进 git。

## 重新生成地理数据

只有重画疆域时才需要，图册本身运行时不用 Python。

脚本依赖 `shapely` 和 `pyshp`；`build.py`、`build_history.py`、`build_west_geo.py` 还要用到 [Natural Earth](https://www.naturalearthdata.com/) 的数据：`build.py` 用陆地、湖泊、河流和国界，`build_history.py` 用陆地，`build_west_geo.py` 用河流。在 `src/` 下运行：

1. `build.py` 生成底图 `data.json`。
2. `build_history.py <natural-earth-dir>` 从头重写 `history_geo.json`。
3. 之后按顺序运行各时期的脚本，往 `history_geo.json` 里追加该时期的区域：`build_rome_geo.py`、`build_punic_geo.py`、`build_late_rep_geo.py`、`build_west_geo.py <natural-earth-dir>`、`build_empire_geo.py`、`build_const_geo.py`。

## 许可

本项目用 [MIT 许可证](./LICENSE)。页面里内嵌的 Leaflet 沿用它自己的 BSD-2-Clause 许可，底图来自公有领域的 Natural Earth 数据。详见 [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md)。
