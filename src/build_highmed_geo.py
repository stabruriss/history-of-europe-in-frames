"""Add teaching areas for 1030—1110 to history_geo.json: Matilda's lands, the Normans' south, the Christian kingdoms and the
taifas of Spain, the Almoravids, and the East after Basil II (East Rome about 1081, the Seljuks, the Ghaznavids, the Fatimids).

Usage: <python with shapely> build_highmed_geo.py   (run after build_eeurope_geo.py; reads gIberia, mBenevento849, mSalerno849,
mByzItaly880, mSicilyArab902, mNormanItaly1053, hCrete and gCyprus).  Teaching regions only, not reconstructed frontiers.  Points are (lon, lat).
- mMatilda1077: the lands of Matilda of Tuscany about 1077 — the march of Tuscany and the Canossa family's counties north of the
  Apennines (Reggio, Modena, Mantua, Ferrara).
- mNormanItaly1091: the Normans' south when Sicily was taken (1091): Apulia, Calabria, Capua and Salerno, and Sicily (not Naples).
- mByzItaly1030: the East Roman catepanate of Italy at its widest, about 1018—1041.
- mNavarre1035: Sancho III of Pamplona at his widest (about 1033): Pamplona, the county of Castile, Aragon, Sobrarbe, Ribagorza.
- mLeonCastile1065: Ferdinand I's León and Castile at his death, with Galicia and the county of Portugal down to Coimbra.
- mLeonCastile1080: Alfonso VI's kingdom about 1080, with the Duero frontier to the Sistema Central, Coria and La Rioja.
- mAragon1080: Aragon and Pamplona under Sancho Ramírez after 1076; mCatalonia1080: Barcelona and the Catalan counties.
- mTaifas1080: Muslim Iberia about 1080 (the rest of gIberia, with the Balearics); mTaifaToledo1080, mTaifaSeville1080,
  mTaifaZaragoza1080: three of its kingdoms (Seville without Murcia, which it held 1078—1088).
- mChristianNorth1110: the Christian kingdoms and counties about 1110, Toledo's Tagus valley included.
- mByz1081: East Rome about 1081 (the southern Balkans, the shore of the straits, a band of the Black Sea coast, Crete, Cyprus);
  mRum1092: the sultanate of Rum (inner west and central Anatolia to Nicaea); mSeljuks1092: the Great Seljuks when Malik-Shah died;
  mGhaznavids1030: the Ghaznavids when Mahmud died; mFatimids1050: Egypt, Palestine, southern Syria and the Hejaz;
  mCrusaderStates1100: Edessa, Antioch and Jerusalem about 1100.
- mAlmoravids1086: the Almoravids in north-west Africa when they crossed to Spain; mAlmoravids1110: with al-Andalus after
  Zaragoza fell to them (1110), Toledo's Tagus valley staying Castilian.
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon
from shapely.ops import unary_union

base = json.loads(Path('data.json').read_text())
geo = json.loads(Path('history_geo.json').read_text())
land = shape(base['land']).buffer(0)
G = lambda k: shape(geo[k]).buffer(0)
L = lambda pts: land.intersection(Polygon(pts)).buffer(0)
regions = {}


def filled(g):
    """Drop interior rings left by unions of neighbouring areas."""
    return unary_union([Polygon(p.exterior) for p in getattr(g, 'geoms', [g])]).buffer(0)


# ---------- Italy ----------
regions['mMatilda1077'] = L([(10.10, 45.05), (10.30, 45.25), (10.75, 45.35), (11.30, 45.20), (11.95, 44.95), (11.75, 44.60), (11.55, 44.35),
                             (11.70, 44.05), (12.00, 43.75), (12.10, 43.40), (11.95, 43.00), (11.80, 42.70), (11.45, 42.40), (11.05, 42.35),
                             (10.90, 42.70), (10.50, 43.00), (10.40, 43.40), (10.20, 43.85), (10.00, 44.05), (9.85, 44.20), (9.95, 44.45),
                             (10.10, 44.75)])
# Naples stayed a duchy of its own until 1137.
NAPLES = Polygon([(13.95, 40.75), (14.45, 40.75), (14.45, 41.0), (13.95, 41.0)])
regions['mNormanItaly1091'] = unary_union([G('mBenevento849'), G('mSalerno849'), G('mByzItaly880'), G('mSicilyArab902'),
                                           G('mNormanItaly1053')]).difference(NAPLES).buffer(0)
# The catepanate of Italy at its widest (about 1018—1041): from the Gargano to the gulf of Salerno, Calabria and the Salento.
regions['mByzItaly1030'] = L([(15.25, 41.93), (15.95, 41.95), (16.20, 41.75), (16.60, 41.25), (17.20, 41.10), (18.10, 40.60), (18.55, 40.10),
                              (18.40, 39.80), (17.30, 40.30), (16.65, 39.65), (17.20, 39.10), (16.60, 38.40), (16.00, 37.90), (15.60, 38.00),
                              (15.70, 38.90), (15.80, 39.80), (15.77, 40.12), (15.80, 40.64), (15.65, 41.00), (15.30, 41.36), (15.10, 41.60)])

# ---------- The Christian kingdoms of Spain ----------
IB = G('gIberia')
regions['mNavarre1035'] = IB.intersection(Polygon([(-4.45, 43.6), (-3.0, 43.5), (-1.8, 43.45), (-1.0, 43.15), (0.0, 42.85), (0.75, 42.78),
                                                   (0.70, 42.20), (0.10, 42.15), (-0.60, 42.25), (-1.30, 42.10), (-1.90, 42.30), (-2.50, 41.95),
                                                   (-3.00, 41.55), (-3.60, 41.40), (-4.10, 41.60), (-4.40, 42.10), (-4.50, 42.80)])).buffer(0)
regions['mLeonCastile1065'] = IB.intersection(Polygon([(-9.6, 43.3), (-8.3, 43.8), (-5.8, 43.8), (-3.5, 43.6), (-3.0, 43.4), (-3.0, 42.9),
                                                       (-2.85, 42.45), (-2.7, 41.95), (-3.0, 41.45), (-3.6, 41.35), (-4.6, 41.25), (-5.6, 41.15),
                                                       (-6.5, 41.0), (-7.2, 40.6), (-8.0, 40.2), (-9.0, 40.1)])).buffer(0)
ARAGON = Polygon([(-2.05, 43.4), (-1.0, 43.2), (0.0, 42.85), (0.75, 42.78), (0.70, 42.20), (0.15, 42.15), (-0.55, 42.25), (-1.25, 42.15),
                  (-1.75, 42.45), (-2.25, 42.6), (-2.45, 43.0)])
CATALONIA = Polygon([(0.75, 42.80), (1.7, 42.55), (3.35, 42.45), (3.35, 41.95), (2.1, 41.3), (1.45, 41.15), (1.3, 41.5), (1.05, 41.75),
                     (0.75, 41.95), (0.70, 42.2)])
regions['mAragon1080'] = IB.intersection(ARAGON).buffer(0)
regions['mCatalonia1080'] = IB.intersection(CATALONIA).buffer(0)
# 1080 also has the Basque lands, the Pyrenees' northern slopes, and the Duero frontier pushed to the Sistema Central (Coria 1079).
FRONTIER1080 = Polygon([(-7.2, 40.6), (-6.6, 40.3), (-5.5, 40.35), (-4.5, 40.6), (-3.8, 40.95), (-3.2, 41.2), (-2.7, 41.4), (-2.7, 41.95),
                        (-3.0, 41.45), (-3.6, 41.35), (-4.6, 41.25), (-5.6, 41.15), (-6.5, 41.0)])
CHRISTIAN1080 = unary_union([regions['mLeonCastile1065'], regions['mAragon1080'], regions['mCatalonia1080'], IB.intersection(FRONTIER1080),
                             IB.intersection(Polygon([(-3.0, 43.4), (-2.05, 43.4), (-2.45, 43.0), (-2.25, 42.6), (-2.6, 42.3), (-2.85, 42.45),
                                                      (-3.0, 42.9)])),
                             IB.intersection(Polygon([(-3.5, 42.95), (3.5, 42.95), (3.5, 44.0), (-3.5, 44.0)]))]).buffer(0)
# Alfonso VI about 1080: León and Castile with the Duero frontier to the Sistema Central, Coria (1079) and La Rioja (1076).
regions['mLeonCastile1080'] = unary_union([regions['mLeonCastile1065'], IB.intersection(FRONTIER1080),
                                           IB.intersection(Polygon([(-3.0, 43.4), (-2.05, 43.4), (-2.45, 43.0), (-2.25, 42.6), (-2.6, 42.3),
                                                                    (-2.85, 42.45), (-3.0, 42.9)])),
                                           IB.intersection(Polygon([(-2.85, 42.45), (-2.6, 42.3), (-2.25, 42.6), (-1.75, 42.45), (-1.9, 42.1),
                                                                    (-2.5, 41.95), (-2.7, 41.95)]))]).buffer(0)

# ---------- The taifas about 1080 ----------
BALEARICS = L([(1.1, 38.55), (4.5, 38.55), (4.5, 40.2), (1.1, 40.2)])
regions['mTaifas1080'] = unary_union([IB.difference(CHRISTIAN1080.buffer(.02)), BALEARICS]).buffer(0)
regions['mTaifaToledo1080'] = IB.intersection(Polygon([(-5.2, 40.2), (-4.3, 40.55), (-3.8, 40.85), (-3.2, 41.1), (-2.7, 41.25), (-2.1, 40.75), (-1.75, 40.2),
                                                       (-2.0, 39.55), (-2.9, 38.9), (-3.9, 38.75), (-4.9, 39.1), (-5.4, 39.6)])).buffer(0)
regions['mTaifaSeville1080'] = IB.intersection(Polygon([(-9.2, 37.0), (-8.7, 37.6), (-7.5, 37.75), (-6.9, 38.15), (-5.9, 38.3), (-4.9, 38.35),
                                                        (-4.3, 38.15), (-4.25, 37.6), (-4.6, 37.2), (-5.1, 36.8), (-5.35, 36.4), (-5.7, 35.9),
                                                        (-6.3, 36.5), (-6.9, 37.1), (-7.4, 37.0)])).buffer(0)
regions['mTaifaZaragoza1080'] = IB.intersection(Polygon([(-2.0, 42.1), (-1.25, 42.15), (-0.55, 42.25), (0.15, 42.15), (0.70, 42.0), (1.0, 41.7),
                                                         (1.3, 41.5), (0.95, 41.0), (0.6, 40.6), (0.0, 40.6), (-0.6, 40.75), (-1.3, 41.0),
                                                         (-1.9, 41.45), (-2.2, 41.9)])).difference(CHRISTIAN1080.buffer(.02)).buffer(0)

# About 1110: the Christian north with Toledo south to the Tagus, Portugal to the Mondego, Aragon to Huesca and Barbastro,
# the Catalan counties to the Tarragona line (Zaragoza, Tudela, Lleida and Tortosa still Muslim).
regions['mChristianNorth1110'] = IB.intersection(Polygon([(-8.87, 40.15), (-8.95, 41.90), (-9.30, 42.90), (-8.20, 43.75), (-5.80, 43.60),
                                                          (-3.80, 43.50), (-1.80, 43.38), (-1.00, 43.00), (0.50, 42.75), (1.70, 42.50),
                                                          (3.20, 42.40), (2.20, 41.40), (1.40, 41.15), (1.00, 41.60), (0.25, 41.90),
                                                          (-0.50, 42.05), (-1.40, 42.10), (-2.20, 41.80), (-2.60, 40.60), (-3.20, 39.90),
                                                          (-4.00, 39.50), (-5.00, 39.70), (-6.00, 40.00), (-7.00, 40.30)])).buffer(0)

# ---------- The Almoravids ----------
MAGHREB_W = L([(-13.0, 27.5), (-11.5, 28.3), (-10.0, 29.2), (-9.8, 30.5), (-9.6, 32.0), (-8.6, 33.3), (-6.8, 34.0), (-6.0, 35.8), (-5.4, 35.95),
               (-2.2, 35.15), (0.0, 35.6), (1.0, 36.4), (3.2, 36.85), (3.4, 35.6), (1.5, 34.4), (-1.0, 32.3), (-4.0, 30.8), (-6.0, 29.3),
               (-8.5, 28.0), (-10.5, 27.0)])
regions['mAlmoravids1086'] = MAGHREB_W
# 1110: the rest of the peninsula, the frontier fitting mChristianNorth1110.
regions['mAlmoravids1110'] = unary_union([MAGHREB_W, IB.difference(regions['mChristianNorth1110'].buffer(.02))]).buffer(0)


# ---------- The East after Basil II: East Rome about 1081, the Seljuks, the Ghaznavids, the Fatimids ----------
BYZ_BALKANS = L([(19.4, 42.1), (19.45, 41.3), (19.5, 40.4), (20.0, 39.6), (20.7, 38.8), (21.2, 37.8), (21.7, 36.8), (22.5, 36.4), (23.2, 37.4), (24.0, 38.0),
                 (23.0, 38.8), (22.9, 39.4), (23.3, 40.2), (24.0, 40.8), (26.0, 40.8), (26.2, 40.3), (27.0, 40.4), (28.9, 41.0), (29.1, 41.2), (28.5, 41.6),
                 (27.7, 42.5), (27.9, 43.2), (28.6, 44.2), (29.6, 45.2), (27.3, 44.1), (25.5, 43.7), (23.5, 43.8), (22.5, 44.3), (21.0, 44.0), (20.5, 43.0),
                 (19.9, 42.5)])
# What was left in Asia Minor: the shore of the straits and a band of the Black Sea coast (Heraclea, Amastris, Sinope, Trebizond).
BYZ_ASIA = unary_union([L([(29.0, 40.75), (29.75, 40.75), (29.95, 41.25), (29.05, 41.25)]),
                        L([(30.5, 41.15), (33.0, 41.05), (35.5, 41.35), (37.5, 40.85), (39.5, 40.75), (41.6, 40.85), (41.6, 41.7), (36.0, 42.3),
                           (33.0, 42.15), (30.5, 41.6)])]).buffer(0)
regions['mByz1081'] = unary_union([BYZ_BALKANS, BYZ_ASIA, G('hCrete'), G('gCyprus')]).buffer(0)
regions['mRum1092'] = L([(29.3, 40.65), (30.4, 40.55), (31.5, 40.2), (32.6, 39.9), (33.5, 39.2), (33.8, 38.5), (34.2, 37.8), (33.6, 37.1), (32.5, 36.9),
                         (31.2, 37.1), (30.2, 37.5), (29.4, 38.0), (28.9, 38.7), (28.6, 39.5), (28.9, 40.1), (29.1, 40.45)])
regions['mSeljuks1092'] = L([(35.9, 36.6), (35.8, 35.6), (36.0, 34.2), (36.2, 33.3), (35.6, 32.7), (35.3, 31.8), (35.4, 30.6), (36.8, 30.0), (39.0, 31.0),
                             (42.0, 30.8), (45.5, 29.8), (47.8, 29.9), (50.0, 29.5), (52.5, 27.5), (55.5, 26.8), (58.0, 25.8), (61.0, 25.5), (62.0, 27.5),
                             (61.5, 30.5), (61.0, 33.0), (62.5, 34.8), (64.5, 35.5), (66.8, 36.8), (68.5, 37.3), (69.0, 39.5), (68.5, 41.5), (65.0, 42.0),
                             (61.5, 43.0), (58.5, 42.5), (55.5, 41.5), (53.0, 40.5), (54.0, 37.2), (51.5, 36.7), (49.5, 37.5), (48.8, 39.0), (49.5, 41.2),
                             (47.5, 41.8), (45.0, 41.6), (43.5, 41.0), (41.3, 40.5), (40.0, 39.0), (39.0, 38.0), (37.8, 37.6), (37.0, 37.0), (36.3, 36.8)])
regions['mGhaznavids1030'] = L([(48.3, 34.5), (48.6, 35.6), (49.6, 36.3), (51.5, 36.6), (54.0, 37.0), (56.0, 38.2), (58.5, 40.5), (58.8, 42.6), (61.5, 42.3),
                                (62.5, 40.0), (65.3, 38.3), (67.3, 37.2), (69.5, 37.3), (71.5, 36.8), (73.5, 35.3), (75.0, 33.0), (75.2, 31.0), (73.5, 29.3),
                                (71.5, 28.2), (68.5, 27.5), (66.0, 28.0), (63.0, 29.0), (61.0, 30.5), (59.5, 31.5), (57.5, 33.5), (55.0, 34.2), (52.5, 34.3),
                                (50.0, 34.4)])
regions['mFatimids1050'] = L([(25.2, 31.6), (29.9, 31.2), (32.3, 31.3), (34.3, 31.3), (34.9, 32.4), (35.1, 33.2), (35.5, 34.0), (35.85, 34.45), (36.6, 34.6),
                              (36.8, 33.7), (36.9, 32.5), (36.4, 31.0), (36.8, 29.5), (38.6, 27.5), (39.8, 24.5), (40.5, 21.3), (41.2, 19.0), (40.0, 19.2),
                              (38.8, 21.5), (37.3, 24.3), (35.0, 27.5), (34.2, 27.8), (35.0, 24.0), (36.4, 22.2), (33.0, 22.0), (32.9, 24.0), (30.5, 25.0),
                              (28.5, 26.0), (27.5, 29.0), (25.2, 29.2)])

# About 1100: the three crusader states, apart — Edessa astride the Euphrates, Antioch with eastern Cilicia (Latakia still East
# Roman), Jerusalem from Jaffa and Ramla to Galilee (Ascalon, Acre, Tyre, Sidon, Beirut and Tripoli still Muslim).
regions['mCrusaderStates1100'] = unary_union([
    L([(36.8, 36.6), (37.3, 37.2), (38.0, 37.6), (38.6, 37.7), (39.4, 37.4), (39.6, 37.0), (39.1, 36.7), (38.3, 36.7), (37.6, 36.6), (37.0, 36.4)]),
    L([(34.8, 36.9), (35.4, 37.2), (36.2, 37.0), (36.6, 36.6), (36.8, 36.2), (36.5, 35.9), (36.0, 35.8), (35.8, 36.1), (35.9, 36.5), (35.3, 36.7)]),
    L([(34.95, 32.85), (35.6, 33.0), (35.65, 32.6), (35.55, 31.9), (35.4, 31.45), (35.1, 31.45), (34.85, 31.85), (34.75, 32.05), (34.85, 32.4)])]).buffer(0)


def rounded(g):
    g = g.simplify(.01, preserve_topology=True).buffer(0)
    assert not g.is_empty and g.is_valid, g

    def coords(c):
        if isinstance(c[0], (float, int)):
            return [round(x, 4) for x in c]
        return [coords(x) for x in c]
    m = mapping(g)
    return {'type': m['type'], 'coordinates': coords(m['coordinates'])}


for k in regions:
    assert k not in geo, ('exists', k)
geo.update({k: rounded(filled(g)) for k, g in regions.items()})
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print(len(regions), 'areas;', {k: round(g.area, 2) for k, g in regions.items()})
