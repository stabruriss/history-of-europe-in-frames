"""Add teaching areas for the 美洲 line to history_geo.json (老无 2026-11-06).

Usage: <python with shapely> build_america_geo.py   (run after build_france16_geo.py).  Teaching regions only, not reconstructed frontiers.
Points are (lon, lat).
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon

base = json.loads(Path('data.json').read_text())
geo = json.loads(Path('history_geo.json').read_text())
land = shape(base['land']).buffer(0)
L = lambda pts: land.intersection(Polygon(pts)).buffer(0)
regions = {}

# ---------- Before 1492 ----------
regions['amMaya'] = L([(-94.2, 17.6), (-92.6, 18.9), (-90.9, 21.6), (-86.6, 21.8), (-86.6, 18.0), (-87.7, 15.9), (-88.6, 14.0), (-91.4, 13.7), (-92.4, 14.6), (-93.3, 16.0)])
# The Mississippian towns: the middle Mississippi, the lower Ohio and the Southeast.
regions['amMississippian'] = L([(-92.0, 33.2), (-92.0, 37.0), (-91.5, 39.6), (-89.0, 40.8), (-85.4, 38.9), (-83.8, 35.8), (-84.2, 32.6), (-88.0, 30.8), (-90.5, 31.0)])
# The Five Nations, south of Lake Ontario.
regions['amIroquoia'] = L([(-79.4, 42.1), (-79.0, 43.4), (-76.2, 43.65), (-74.7, 43.2), (-73.9, 42.7), (-74.6, 42.2), (-77.0, 41.95)])
regions['amHuronia'] = L([(-81.0, 44.2), (-80.4, 45.0), (-79.0, 45.0), (-78.8, 44.2), (-79.9, 43.9)])
# Tsenacommacah, the tidewater country under Powhatan about 1607.
regions['amTsenacommacah'] = L([(-77.6, 38.6), (-77.7, 37.1), (-77.0, 36.75), (-75.85, 36.75), (-75.9, 37.9), (-76.3, 38.5)])
# Pokanoket and the other Wampanoag peoples about 1620.
regions['amWampanoag'] = L([(-71.5, 41.4), (-71.5, 42.05), (-70.6, 42.15), (-69.85, 42.05), (-69.85, 41.5), (-70.9, 41.35)])
regions['amPequot'] = L([(-72.4, 41.25), (-72.4, 41.75), (-71.8, 41.75), (-71.8, 41.3)])

# ---------- French ----------
regions['amGrandBanks'] = Polygon([(-56.5, 42.5), (-48.5, 42.5), (-48.0, 47.5), (-52.0, 49.0), (-56.5, 46.5)]).difference(land).buffer(0)
regions['amNewFrance1635'] = L([(-74.6, 45.2), (-73.0, 46.8), (-70.5, 48.0), (-69.1, 48.7), (-68.4, 48.1), (-70.4, 46.6), (-72.5, 45.6), (-74.0, 44.9)])
regions['amAcadia'] = L([(-67.6, 44.5), (-66.0, 46.3), (-64.0, 46.3), (-59.7, 46.1), (-65.8, 43.2)])
regions['amLaFlorida1565'] = L([(-81.6, 33.0), (-80.4, 32.0), (-80.0, 27.0), (-80.0, 25.0), (-82.0, 25.0), (-83.2, 28.6), (-85.5, 29.6), (-85.5, 31.0), (-83.0, 31.8)])

# ---------- English ----------
regions['amVirginia1624'] = L([(-77.6, 37.7), (-77.5, 37.0), (-76.2, 36.75), (-75.9, 37.0), (-76.25, 37.5), (-76.9, 37.55)])
regions['amPlymouth1621'] = L([(-71.2, 41.5), (-71.2, 42.1), (-70.6, 42.2), (-69.85, 42.05), (-69.95, 41.55), (-70.9, 41.45)])
regions['amMassBay1640'] = L([(-72.0, 42.1), (-72.0, 42.75), (-70.55, 42.95), (-70.5, 42.15), (-71.2, 41.98)])
regions['amRhodeIsland1640'] = L([(-71.9, 41.3), (-71.9, 42.0), (-71.3, 42.0), (-71.1, 41.45)])
regions['amNewEngland1640'] = L([(-73.6, 41.05), (-73.4, 42.7), (-72.5, 43.2), (-70.6, 44.1), (-69.4, 44.1), (-70.2, 43.0), (-69.85, 41.5), (-71.5, 41.2)])
# Where the Puritans who sailed in 1630 mostly came from.
regions['amEastAnglia'] = L([(0.05, 51.55), (0.05, 52.65), (0.6, 53.0), (1.8, 52.75), (1.75, 52.0), (1.0, 51.65)])

# ---------- Dutch and Portuguese ----------
regions['amNewNetherland1630'] = L([(-75.7, 39.1), (-75.1, 38.85), (-74.0, 40.3), (-71.9, 41.0), (-73.4, 41.25), (-73.45, 42.85), (-74.4, 42.95), (-74.7, 41.5), (-75.0, 40.3)])
regions['amDutchBrazil1640'] = L([(-45.0, -1.5), (-42.0, -2.2), (-38.0, -3.0), (-35.0, -5.0), (-34.7, -8.0), (-36.4, -11.2), (-38.6, -11.2), (-38.6, -7.0), (-41.0, -5.0), (-44.0, -4.0)])
regions['amAngola1620'] = L([(12.9, -8.2), (12.9, -10.8), (15.8, -10.8), (16.2, -8.2)])

for key, region in regions.items():
    assert not region.is_empty, key
    assert key not in geo, key
    geo[key] = mapping(region.simplify(0.02, preserve_topology=True))
Path('history_geo.json').write_text(json.dumps(geo))
print('regions', len(regions))
