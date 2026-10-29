"""Add teaching areas for Spain before 1031 and the Arabs to 945 to history_geo.json.

Usage: <python with shapely> build_iberia_arab_geo.py   (run after build_ottonian_geo.py; reads mAndalus750, mSeptimania and mAbbasid800).
Teaching regions only, not reconstructed frontiers.  Points are (lon, lat).
- mUmayyad750: the Umayyad caliphate at its widest (about 732—750): al-Andalus, Septimania, the Maghreb coast to Cyrenaica,
  the Abbasid lands of 800 and Transoxiana up to the Syr Darya.
- mMakuria650: the Nubian kingdom of Makuria (with Nobadia) along the Nile from the First to the Fifth Cataract.
- mHimyar: Yemen, the Himyarite kingdom about 500; mAksum: the kingdom of Aksum about 525 (Eritrea and Tigray).
- ibBaetica, ibLusitania, ibTarraconensis: the three provinces of Roman Spain after Augustus (cut from gIberia).
- mChristianNorth1000/1031, mCaliphCordoba1000, mTaifasBerber1035, mTaifasSlav1035, mTaifasLocal1035: Córdoba and its break-up.
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


# ---------- The Umayyads at their widest ----------
MAGHREB = L([(-9.8, 30.5), (-9.6, 32.0), (-8.6, 33.3), (-6.8, 34.0), (-6.0, 35.8), (-5.4, 35.9), (-2.2, 35.1), (0.0, 35.5), (1.0, 36.4),
             (3.0, 36.8), (6.0, 37.0), (8.6, 36.9), (10.3, 37.3), (11.1, 36.8), (10.0, 34.3), (11.5, 33.1), (15.3, 32.3), (19.9, 30.9),
             (20.1, 32.3), (22.5, 32.9), (25.0, 31.6), (25.2, 29.5), (20.0, 27.5), (10.0, 30.0), (2.0, 31.0), (-3.0, 30.5), (-6.0, 29.5)])
TRANSOXIANA = L([(61.0, 42.0), (64.0, 43.0), (68.0, 42.5), (69.5, 41.5), (71.0, 41.2), (72.5, 40.7), (71.5, 39.9), (69.0, 39.5), (68.3, 38.0),
                 (67.5, 37.2), (65.0, 37.3), (62.0, 37.5), (61.0, 40.0)])
regions['mUmayyad750'] = unary_union([G('mAndalus750'), G('mSeptimania'), G('mAbbasid800'), MAGHREB, TRANSOXIANA]).buffer(0)

# ---------- Makuria ----------
regions['mMakuria650'] = L([(32.6, 24.2), (33.2, 24.0), (32.4, 22.2), (31.9, 21.2), (31.2, 20.6), (30.9, 19.8), (31.1, 18.9), (31.9, 18.7),
                            (32.6, 19.1), (33.5, 19.7), (34.2, 18.6), (34.1, 17.8), (33.6, 17.6), (32.9, 18.3), (32.0, 17.9), (31.0, 17.7),
                            (30.3, 18.2), (29.9, 19.6), (30.3, 20.8), (31.0, 21.8), (31.8, 22.6), (32.2, 23.6)])

# ---------- South Arabia and Aksum ----------
regions['mHimyar'] = L([(42.7, 16.4), (43.3, 17.6), (44.6, 17.9), (46.2, 17.3), (48.5, 16.9), (51.2, 17.0), (52.3, 16.4), (52.2, 15.6), (50.2, 15.0),
                        (49.0, 14.5), (47.5, 13.8), (45.6, 13.2), (44.6, 12.7), (43.5, 12.7), (43.2, 13.3), (42.9, 14.6), (42.6, 15.6)])
regions['mAksum'] = L([(36.6, 14.3), (37.0, 15.6), (38.3, 17.0), (38.9, 16.6), (39.4, 15.6), (40.0, 15.0), (40.9, 14.6), (41.7, 13.8), (42.4, 13.1),
                       (41.0, 12.4), (39.8, 12.0), (38.4, 12.3), (37.4, 13.0)])

# ---------- Roman Spain: the three provinces of Augustus (coasts from gIberia; inland lines approximate) ----------
regions['ibBaetica'] = G('gIberia').intersection(Polygon([(-2.112, 36.777), (-4.367, 36.718), (-4.674, 36.506), (-5.171, 36.424), (-5.361, 36.135), (-5.625, 36.026), (-6.041, 36.188), (-6.269, 36.597), (-6.384, 36.637), (-6.412, 36.729), (-6.217, 36.914), (-6.396, 36.832), (-6.885, 37.194), (-6.864, 37.279), (-7.4, 37.17), (-7.5, 37.55), (-7.45, 38.0), (-7.25, 38.45), (-7.0, 38.75), (-6.97, 38.88), (-6.34, 38.87), (-5.6, 38.92), (-5.0, 38.95), (-4.3, 38.62), (-3.9, 38.35), (-3.75, 38.0), (-3.3, 37.7), (-2.7, 37.3), (-2.112, 36.777)])).buffer(0)
regions['ibLusitania'] = G('gIberia').intersection(Polygon([(-7.4, 37.17), (-7.834, 37.006), (-8.598, 37.121), (-8.998, 37.032), (-8.814, 37.431), (-8.881, 38.447), (-8.668, 38.424), (-8.799, 38.518), (-9.213, 38.448), (-9.25, 38.657), (-9.021, 38.747), (-8.938, 38.998), (-8.792, 39.078), (-8.954, 39.016), (-9.136, 38.743), (-9.357, 38.698), (-9.48, 38.799), (-9.375, 39.338), (-9.148, 39.543), (-8.838, 40.116), (-8.873, 40.259), (-8.685, 40.753), (-8.67, 41.14), (-8.3, 41.1), (-7.6, 41.1), (-6.9, 41.0), (-6.2, 41.2), (-5.6, 41.1), (-5.2, 40.6), (-4.9, 40.2), (-5.0, 39.6), (-5.0, 38.95), (-5.6, 38.92), (-6.34, 38.87), (-6.97, 38.88), (-7.0, 38.75), (-7.25, 38.45), (-7.45, 38.0), (-7.5, 37.55), (-7.4, 37.17)])).buffer(0)
regions['ibTarraconensis'] = G('gIberia').intersection(Polygon([(-8.67, 41.14), (-8.755, 41.698), (-8.888, 41.765), (-8.777, 41.941), (-8.878, 41.947), (-8.887, 42.105), (-8.691, 42.274), (-8.816, 42.285), (-8.73, 42.412), (-8.812, 42.64), (-9.033, 42.594), (-8.927, 42.799), (-9.235, 42.977), (-9.178, 43.174), (-8.874, 43.334), (-8.355, 43.397), (-8.249, 43.439), (-8.257, 43.58), (-7.698, 43.765), (-7.061, 43.554), (-5.847, 43.645), (-4.523, 43.416), (-3.605, 43.519), (-3.046, 43.372), (-2.875, 43.454), (-1.991, 43.345), (-1.816, 43.421), (-1.8, 43.35), (-0.7, 42.85), (0.7, 42.72), (1.7, 42.5), (3.228, 42.452), (3.307, 42.289), (3.15, 42.162), (3.248, 41.944), (2.083, 41.287), (1.033, 41.062), (0.715, 40.823), (0.891, 40.722), (0.596, 40.615), (-0.327, 39.52), (-0.205, 39.063), (0.202, 38.759), (-0.521, 38.317), (-0.815, 37.77), (-0.722, 37.631), (-1.328, 37.561), (-1.641, 37.387), (-2.112, 36.777), (-2.7, 37.3), (-3.3, 37.7), (-3.75, 38.0), (-3.9, 38.35), (-4.3, 38.62), (-5.0, 38.95), (-5.0, 39.6), (-4.9, 40.2), (-5.2, 40.6), (-5.6, 41.1), (-6.2, 41.2), (-6.9, 41.0), (-7.6, 41.1), (-8.3, 41.1), (-8.67, 41.14)])).buffer(0)

# ---------- The Umayyads of Córdoba and the taifas (teaching outlines after Dozy: Berbers in the south, Slavs on the east coast) ----------
NORTH1000 = L([(-9.6, 41.0), (-8.4, 41.05), (-7.2, 41.05), (-6.2, 41.2), (-5.7, 41.45), (-4.8, 41.5), (-3.8, 41.65), (-3.05, 41.6), (-2.6, 41.85),
               (-2.45, 42.25), (-1.9, 42.45), (-1.2, 42.55), (-0.6, 42.45), (0.05, 42.3), (0.75, 42.1), (1.3, 41.85), (1.65, 41.45), (2.05, 41.22),
               (3.5, 41.9), (3.4, 42.5), (1.7, 42.62), (0.0, 42.85), (-1.0, 43.15), (-1.8, 43.4), (-3.8, 43.6), (-6.0, 43.7), (-8.0, 44.0), (-9.5, 43.3)])
regions['mChristianNorth1000'] = NORTH1000
# 1010: the frontier forts on the Duero (Gormaz, Osma, San Esteban) given to Castile.
regions['mChristianNorth1031'] = unary_union([NORTH1000, L([(-3.6, 41.66), (-3.6, 41.42), (-2.75, 41.42), (-2.55, 41.7), (-2.6, 41.85), (-3.05, 41.6)])]).buffer(0)
BALEARICS = L([(1.1, 38.55), (4.5, 38.55), (4.5, 40.2), (1.1, 40.2)])
N_MOROCCO = L([(-6.4, 35.95), (-5.25, 35.95), (-4.2, 35.35), (-2.2, 35.15), (-1.9, 34.6), (-3.6, 33.9), (-5.2, 33.75), (-6.7, 34.2)])
regions['mCaliphCordoba1000'] = unary_union([G('gIberia').difference(NORTH1000.buffer(.02)), BALEARICS, N_MOROCCO]).buffer(0)
BERBER = L([(-6.05, 36.0), (-5.35, 36.05), (-4.95, 36.45), (-4.4, 36.7), (-3.75, 36.72), (-3.0, 36.72), (-2.95, 37.0), (-3.05, 37.45), (-3.45, 37.75),
            (-4.15, 37.62), (-4.75, 37.55), (-5.35, 37.62), (-5.75, 37.55), (-5.95, 37.2), (-6.1, 36.75)])
SLAV = unary_union([L([(-2.9, 36.7), (-1.9, 36.7), (-1.3, 37.4), (-0.7, 37.6), (0.25, 38.75), (-0.3, 39.45), (0.15, 40.05), (0.55, 40.5), (0.95, 40.75),
                       (0.55, 41.0), (0.05, 40.7), (-0.55, 40.15), (-0.95, 39.55), (-1.15, 38.85), (-1.55, 38.2), (-2.15, 37.75), (-2.75, 37.4),
                       (-2.9, 37.05)]), BALEARICS]).buffer(0)
regions['mTaifasBerber1035'] = BERBER
regions['mTaifasSlav1035'] = SLAV
regions['mTaifasLocal1035'] = (G('gIberia').difference(regions['mChristianNorth1031'].buffer(.02)).difference(BERBER.buffer(.02))
                               .difference(SLAV.buffer(.02)).buffer(0))


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
