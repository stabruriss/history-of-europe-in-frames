"""Add teaching areas for 987—1314 to history_geo.json: Greater Anjou, Toulouse, Philip II's expanded royal domain, English Gascony,
the Crown of Aragon in 1282, and Angevin Naples after the Sicilian Vespers.

Usage: <python with shapely> build_capet_geo.py   (run after build_staufer_geo.py).  Teaching regions only, not reconstructed frontiers.
Points are (lon, lat).
- mAnjou1100: Greater Anjou (Anjou, Maine and Touraine: Angers, Le Mans, Tours) before 1154.
- mToulouse1200: the county of Toulouse and Languedoc (Toulouse, Carcassonne, Béziers, Narbonne, Nîmes) about 1200.
- mCapetDomain1223: the French royal domain at Philip II's death (1223) — Île-de-France, Berry, Vermandois, Artois, Normandy, Maine,
  Anjou, Touraine and Poitou.
- mGascony1223: English-held Gascony (Bordeaux and Bayonne) after 1224.
- mNaplesAnjou1282: the mainland kingdom of Naples held by the house of Anjou after the Sicilian Vespers of 1282 (mSicilyKingdom1190
  without the island of Sicily).
- mAragonCrown1282: the Crown of Aragon (Aragon, Catalonia, Valencia and the Balearics) in 1282.
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

regions['mAnjou1100'] = L([(-1.15, 47.20), (-1.05, 48.45), (0.45, 48.45), (1.15, 47.90), (1.15, 47.05), (0.15, 47.00), (-0.85, 47.05)])
regions['mToulouse1200'] = L([(0.85, 44.60), (2.20, 44.75), (3.60, 44.65), (4.60, 44.15), (4.55, 43.35), (3.10, 42.75), (1.70, 42.75),
                              (0.75, 43.25), (0.65, 44.05)])
regions['mCapetDomain1223'] = unary_union([
    G('mCapetDomain987'), G('mNormandy933'), regions['mAnjou1100'],
    L([(-2.15, 46.10), (-1.15, 47.25), (1.40, 49.70), (1.60, 50.55), (3.20, 50.45), (3.25, 49.20), (2.85, 46.80), (1.15, 46.40),
       (-0.50, 46.10)])
]).buffer(0)
regions['mGascony1223'] = L([(-1.90, 43.30), (-1.20, 45.60), (0.35, 45.10), (0.40, 43.15), (-1.80, 43.10)])
regions['mNaplesAnjou1282'] = G('mSicilyKingdom1190').difference(G('hSicily').buffer(.05)).buffer(0)
IB = G('gIberia')
BALEARICS = land.intersection(Polygon([(1.1, 38.6), (4.5, 38.6), (4.5, 40.2), (1.1, 40.2)])).buffer(0)
regions['mAragonCrown1282'] = unary_union([
    IB.intersection(Polygon([(-1.85, 42.80), (0.75, 42.80), (3.40, 42.45), (3.50, 41.50), (1.20, 40.50), (0.50, 39.50), (-0.40, 37.85),
                             (-1.15, 38.10), (-1.55, 39.20), (-1.80, 40.40), (-2.00, 41.50)])),
    BALEARICS
]).buffer(0)

for k, g in regions.items():
    assert not g.is_empty and g.area > 0.3, (k, g.area)
    geo[k] = mapping(g)
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print('capet regions:', ', '.join(f'{k} {g.area:.2f}' for k, g in regions.items()))
