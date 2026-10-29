"""Add teaching areas for 870—1054 to history_geo.json: the partition of Lotharingia at Meerssen, the kingdom of Burgundy,
the empire about 1050 and the Normans in southern Italy.

Usage: <python with shapely> build_ottonian_geo.py   (run after build_carolingian_geo.py; reads mLotharingia855, mProvence855
and mOtto962).  Teaching regions only, not reconstructed frontiers.  Points are (lon, lat).
- Meerssen (870): mMeerssen870W (Charles the Bald: west of the Meuse, Ourthe, Moselle line, with Lyon and Vienne),
  mMeerssen870E (Louis the German: Aachen, Metz, Alsace, most of Frisia).
- mBurgundyKingdom1032: the kingdom of Burgundy (Arles) between the Saône, the Rhône and the Alps, joined to the empire in 1032/1033.
- mEmpire1050: the empire about 1050 (mOtto962 with Burgundy).
- mNormanItaly1053: the Norman lordships about 1053 (Aversa near Naples; Melfi and inland Apulia), before Bari and Calabria fell.
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


# ---------- Meerssen, 870 ----------
# Roughly the Meuse to Liège, up the Ourthe, west of Metz along the Moselle, then east of Toul and Besançon to Lake Geneva.
MEERSSEN = [(5.3, 55.0), (5.6, 51.9), (5.75, 51.0), (5.6, 50.6), (5.7, 50.2), (5.95, 49.6), (6.05, 49.2), (6.2, 48.6), (6.25, 48.0),
            (6.3, 47.5), (6.2, 46.9), (6.0, 46.15)]
west_of = Polygon([(1.5, 55.0), *MEERSSEN, (6.0, 44.9), (1.5, 44.9)])
loth = G('mLotharingia855')
lyon_vienne = G('mProvence855').intersection(Polygon([(3.0, 46.4), (7.5, 46.4), (7.5, 45.0), (3.0, 45.0)])).buffer(0)
regions['mMeerssen870W'] = unary_union([loth.intersection(west_of), lyon_vienne]).buffer(0)
regions['mMeerssen870E'] = loth.difference(west_of).buffer(0)

# ---------- The kingdom of Burgundy and the empire about 1050 ----------
regions['mBurgundyKingdom1032'] = L([(5.0, 47.9), (6.0, 48.0), (7.0, 47.6), (7.6, 47.55), (8.2, 47.3), (8.0, 46.6), (7.8, 46.0), (7.2, 45.6),
                                     (7.0, 44.9), (7.0, 44.3), (7.6, 43.9), (7.5, 43.75), (6.6, 43.1), (5.3, 43.2), (4.6, 43.4), (4.4, 43.8),
                                     (4.65, 44.6), (4.75, 45.3), (4.8, 45.8), (4.9, 46.4), (5.1, 47.1)])
regions['mEmpire1050'] = unary_union([G('mOtto962'), regions['mBurgundyKingdom1032']]).buffer(0)

# ---------- The Normans in the south, about 1053 ----------
AVERSA = L([(13.9, 41.25), (14.4, 41.2), (14.45, 40.95), (14.1, 40.9), (13.9, 41.05)])
APULIA = L([(15.2, 41.7), (15.9, 41.6), (16.3, 41.2), (16.4, 40.8), (16.1, 40.4), (15.6, 40.5), (15.3, 40.9), (15.0, 41.3)])
regions['mNormanItaly1053'] = unary_union([AVERSA, APULIA]).buffer(0)


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
