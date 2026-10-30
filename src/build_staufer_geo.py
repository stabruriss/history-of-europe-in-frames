"""Add teaching areas for 1106—1216 to history_geo.json: the papal lands under Innocent III and the cities of the Lombard League.

Usage: <python with shapely> build_staufer_geo.py   (run after build_crusade_geo.py).  Teaching regions only, not reconstructed frontiers.
Points are (lon, lat).  The duchies (mSaxonyDuchy, mBavariaDuchy, mSwabiaDuchy, mFranconiaDuchy), the empire (mEmpire1050), Matilda's lands
(mMatilda1077) and the kingdom of Sicily (mSicilyKingdom1190) are reused from the earlier builders.
- mPapal1210: the papal lands after Innocent III's “recuperations” (1198—1210): the duchy of Rome with the Campagna and the Marittima, the
  Patrimony in Tuscany up to Radicofani, the Sabina, the duchy of Spoleto (Umbria) and the march of Ancona down to the Tronto; not the
  Romagna, which the popes claimed but did not hold.
- mLombardLeague1176: the Po plain of the Lombard League's cities about 1176 (Milan, Brescia, Bergamo, Verona, Vicenza, Padua, Treviso,
  Venice, Ferrara, Bologna, Modena, Reggio, Parma, Piacenza, Lodi, Novara, Vercelli, Cremona, Alessandria); Pavia and Como, which held to
  the emperor, lie inside it — a teaching area for the cities, not a frontier.
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon

base = json.loads(Path('data.json').read_text())
geo = json.loads(Path('history_geo.json').read_text())
land = shape(base['land']).buffer(0)
L = lambda pts: land.intersection(Polygon(pts)).buffer(0)
regions = {}

# The coastal points lie out at sea, so that the land cuts the coastline.
regions['mPapal1210'] = L([(13.20, 41.20), (12.55, 41.35), (12.10, 41.65), (11.65, 42.00), (11.40, 42.32), (11.62, 42.58), (11.72, 42.90),
                           (11.95, 43.05), (12.05, 43.25), (12.20, 43.50), (12.40, 43.66), (12.72, 43.90), (13.00, 44.05), (13.45, 43.78),
                           (13.80, 43.45), (14.05, 43.00), (13.92, 42.88), (13.55, 42.80), (13.20, 42.70), (12.95, 42.45), (13.10, 42.15),
                           (13.20, 41.90), (13.45, 41.65), (13.55, 41.50), (13.30, 41.30)])
regions['mLombardLeague1176'] = L([(8.30, 45.25), (8.45, 45.65), (9.00, 45.85), (9.70, 45.80), (10.25, 45.70), (10.80, 45.55), (11.50, 45.70),
                                   (12.25, 45.78), (12.60, 45.45), (12.35, 45.05), (11.95, 44.75), (11.55, 44.40), (11.00, 44.45), (10.55, 44.55),
                                   (10.10, 44.70), (9.60, 44.85), (9.00, 44.80), (8.55, 44.80), (8.35, 45.00)])

for k, g in regions.items():
    assert not g.is_empty and g.area > 0.3, (k, g.area)
    geo[k] = mapping(g)
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print('staufer regions:', ', '.join(f'{k} {g.area:.2f}' for k, g in regions.items()))
