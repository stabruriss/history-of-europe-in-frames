<h1 align="center">Mediterranean in Frames</h1>

<p align="center">
  A map atlas of Mediterranean and Near Eastern history, told scene by scene in one offline HTML file.
</p>

<p align="center">
  <a href="./index.html"><strong>index.html</strong></a>
  ·
  <a href="./LICENSE">MIT License</a>
</p>

<p align="center">
  <strong>English</strong> · <a href="./README.zh-CN.md">简体中文</a>
</p>

*地中海与近东* is a history atlas written in Chinese, with English names for every person and place. It runs from the first migrations out of Africa to the fall of the Western Roman Empire. Each section is a short run of map scenes. In each scene the map redraws for that moment, and a short passage says what happened and why.

The text puts causes ahead of dates. It reads the period through power, cost and legitimacy rather than as a march toward Europe, and it sets same-era China beside the West where the comparison helps.

## Interface

![The Punic Wars: Hannibal's route over the Alps, with the passage, iconic-moment tags and people cards](./docs/images/punic-wars.jpg)

![Constantine's New Rome: the grain route from Alexandria, the history tree on the left and the scene strip below](./docs/images/new-rome.jpg)

## Quick start

Open `index.html` in a desktop or mobile browser. Everything (Leaflet, the base map, the historical areas and all text) is inside that one file, so it works without a server or a network connection. When you are online, the shaded-relief terrain tiles load as well, and the reading links work.

- **地理概念** (Geography): 33 entries on seas, mountains, rivers, routes and regions.
- **历史进程** (History): 7 chapters, 54 sections and 163 map scenes, from 上古 (early times) to 帝国 (the empire) and 基督教 (Christianity).
- **The history tree** puts time on the vertical axis and gives each theme its own line: Greek, Rome, Ptolemaic Egypt, the Seleucids, West Rome, and Christianity. Pick a line, then use ↑ ↓ to walk along it and ← → to step through a section's scenes.
- **People and moments**: 102 people on 148 dated cards, 108 tags for iconic moments such as Marathon and Thermopylae, and 227 reading links, mostly to primary sources online.

Ancient boundaries are drawn as teaching regions clipped to the coastline. They are not reconstructed frontiers.

## Build

```sh
npm run build        # cd src && python3 assemble.py ../index.html
```

`src/assemble.py` uses only the Python standard library. It fills the placeholders in `src/template.html` with Leaflet, the base map (`data.json`), the historical areas (`history_geo.json`), the entries, the text and the people cards. It stops if any placeholder is left unfilled. Edit the files in `src/`, never `index.html` directly.

| Path | Contents |
| --- | --- |
| `src/template.html`, `src/layout.css`, `src/atlas_ui.js` | Page shell, styles and interface |
| `src/history_entries.js` | Sections, scenes, map views, the history tree and its lines |
| `src/history_content.json` | Text, iconic-moment tags and reading links for each section |
| `src/historical_figures.js` | People, their dated cards and places |
| `src/levante_entries.js`, `src/labels_dates.js`, `src/marine_labels.js` | Geography entries and map labels |
| `src/data.json`, `src/history_geo.json` | Base map and historical areas (GeoJSON-like, pre-simplified) |
| `src/build*.py` | Generators for the two geo files (see below) |
| `tests/verify-*.js` | Browser checks, one per feature area |

## Tests

```sh
npm install
npm test             # runs every tests/verify-*.js against index.html
```

The checks drive a local Chrome through `puppeteer-core`. They cover counts and text length limits, key phrases in each scene, the tree and the keyboard, desktop and 390 px phone widths, horizontal overflow, page errors and offline use. They expect Chrome at `/Applications/Google Chrome.app`; set `CHROME_PATH` to point elsewhere. Screenshots go to `tests/shots*/`, which git ignores.

## Regenerating the geography

You only need this to redraw areas. The atlas itself never runs Python.

The scripts need `shapely` and `pyshp`, plus [Natural Earth](https://www.naturalearthdata.com/) data for `build.py` (land, lakes, rivers and country borders), `build_history.py` (land) and `build_west_geo.py` (rivers). Run them from `src/`:

1. `build.py` writes the base map, `data.json`.
2. `build_history.py <natural-earth-dir>` rewrites `history_geo.json` from scratch.
3. Each later script adds its period's areas to `history_geo.json`: `build_rome_geo.py`, `build_punic_geo.py`, `build_late_rep_geo.py`, `build_west_geo.py <natural-earth-dir>`, `build_empire_geo.py`, `build_const_geo.py`.

## License

[MIT](./LICENSE). Leaflet ships inside the page under its own BSD-2-Clause license, and the base map comes from public-domain Natural Earth data. See [THIRD_PARTY_NOTICES.md](./THIRD_PARTY_NOTICES.md).
