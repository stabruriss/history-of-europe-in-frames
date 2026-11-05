// Hand-composed route plan for the network map, the way a metro diagram is drawn:
// a designer decides where each line runs; the engine in metro_layout.js only
// solves exact x positions and places labels.
//
// A knot is [t, y, mode, dx]. t is the atlas anchor year, y the world height.
// mode 'e' leaves the previous knot at once; otherwise the line turns just before this knot.
// dx shifts the knot horizontally (where a branch leaves its parent's rail).
//
// Lines run straight on their own lane and change lane rarely, by one 45deg run. They do
// not detour to meet: rails that travel together are bundled one step apart and share a
// capsule; rails that stay apart each carry a ring, joined by a dashed link.
// Nothing here adds an event or a connection: stations and interchange membership come
// only from the atlas's tree rows, and branch / merge points from its parent, from and ends fields.
// A new HISTORY_BRANCHES line gets a spare lane until it has a route here; verify-metro.js fails until then.
window.NETWORK_DESIGN = (() => {
  const S = 2.2, B = 13;
  const y = (level, k = 0) => Math.round(level * S) + k * B;

  // Lanes, top to bottom.
  const TOP = 60;        // eastern europe in antiquity
  const BRITAIN = 140;   // greece, then britain; france bundles here from 1154
  const FRANCE = 182;
  const LOW = 224;       // low countries
  const ROME = 266;      // rome, then the medieval west, then italy: one straight lane
  const GER0 = 310;      // germany before it bundles with the church
  const GERMANY = 345;   // germany; the church runs one step below
  const CRUSADE = 395;
  const PERSIA = 440;    // persia; east rome bundles one step below from 602
  const EAST0 = 470;     // east rome before it bundles with persia
  const EASTEU = 505;    // egypt in antiquity, eastern europe from 860
  const SPAIN = 550;
  const CHINA = 620;

  const routes = {
    trunk: [[-68000, y(ROME)], [-1000, y(ROME), null, -34], [-800, y(BRITAIN), 'e'], [-55, y(BRITAIN), null, -26], [-30, y(ROME), 'e']],
    rome: [[-1000, y(ROME), null, -34], [476, y(ROME), null, -14]],
    west: [[476, y(ROME), null, -14], [830, y(ROME)]],
    italy: [[830, y(ROME)], [1454, y(ROME)]],
    china: [[-7000, y(CHINA)], [589, y(CHINA)]],
    persia: [[-3200, y(ROME), null, -20], [-3200, y(PERSIA)], [1454, y(PERSIA)]],
    egypt: [[-3100, y(ROME), null, -100], [-3100, y(EASTEU)], [632, y(EASTEU)]],
    faith: [[-1400, y(ROME), null, -34], [-1400, y(GERMANY, 1)], [1450, y(GERMANY, 1)]],
    eeurope: [[-700, y(BRITAIN), null, -34], [-700, y(TOP)], [602, y(TOP)], [860, y(EASTEU)], [1455, y(EASTEU)]],
    britain: [[-55, y(BRITAIN), null, -26], [1472, y(BRITAIN)]],
    east: [[395, y(ROME), null, -34], [395, y(EAST0)], [518, y(EAST0)], [602, y(PERSIA, 1)], [1450, y(PERSIA, 1)]],
    spain: [[481, y(ROME), null, -34], [481, y(SPAIN)], [1470, y(SPAIN)]],
    france: [[830, y(ROME)], [843, y(FRANCE), 'e'], [1137, y(FRANCE)], [1154, y(BRITAIN, 1)], [1461, y(BRITAIN, 1)]],
    lowlands: [[830, y(ROME), null, -10], [1300, y(LOW), 'e'], [1495, y(LOW)]],
    germany: [[830, y(ROME)], [843, y(GER0), 'e'], [860, y(GER0)], [951, y(GERMANY)], [1495, y(GERMANY)]],
    crusade: [[1070, y(GERMANY, 1), null, -92], [1070, y(CRUSADE)], [1295, y(CRUSADE)]],
  };

  // Room around branch points, and where a name needs to sit between dashed links.
  const gaps = [
    [-4000, -3200, 48], [-4000, -3100, 128],
    [-1900, -1400, 62], [-1100, -1000, 66],
    [-730, -700, 62], [-200, -55, 60], [-44, -30, 40], [-30, -27, 20],
    [379, 395, 62], [455, 476, 30], [480, 481, 62],
    [814, 830, 100],
    [1056, 1070, 110],
    [641, 641.4, 34],
    [1296, 1300, 74], [1300, 1304, 74], [1438, 1450, 26], [1450, 1454, 72],
  ];

  // Keeps a plain stop off a dashed link that shares its anchor year.
  const nudge = { 'history-empire-constans/0': 0.4 };

  return { S, B, routes, gaps, nudge, top: y(TOP) };
})();
