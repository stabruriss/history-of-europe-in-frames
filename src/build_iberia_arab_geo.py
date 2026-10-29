"""Add teaching areas for Spain before 1031 and the Arabs to 945 to history_geo.json.

Usage: <python with shapely> build_iberia_arab_geo.py   (run after build_ottonian_geo.py; reads mAndalus750, mSeptimania and mAbbasid800).
Teaching regions only, not reconstructed frontiers.  Points are (lon, lat).
- mUmayyad750: the Umayyad caliphate at its widest (about 732—750): al-Andalus, Septimania, the Maghreb coast to Cyrenaica,
  the Abbasid lands of 800 and Transoxiana up to the Syr Darya.
- mMakuria650: the Nubian kingdom of Makuria (with Nobadia) along the Nile from the First to the Fifth Cataract.
- mHimyar: Yemen, the Himyarite kingdom about 500; mAksum: the kingdom of Aksum about 525 (Eritrea and Tigray).
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
