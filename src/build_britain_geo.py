"""Add teaching areas for the British and Irish Isles (from Doggerland to 1307) to history_geo.json.

Usage: <python with shapely> build_britain_geo.py   (run after build_capet_geo.py).  Teaching regions only, not reconstructed frontiers.
Points are (lon, lat).
- mDoggerland7000: the submerged North Sea land bridge connecting Britain to the continent before ~6500 BCE.
- mIreland: the island of Ireland.
- mRomanBritain122: Roman Britain south of Hadrian's Wall (Tyne–Solway).
- mWales: Wales west of Offa's Dyke; mGwynedd1267: Llywelyn's Gwynedd and Anglesey in north-west Wales.
- mScotland1200: the Kingdom of Scotland north of the Tweed–Solway line.
- mEngland1066: the Kingdom of England (south of the Tweed–Solway line, east of Wales).
- mNorthumbria700: Northumbria from the Humber to the Firth of Forth; mMercia750: Mercia in the Midlands.
- mNorthSeaEmpire1030: Cnut's North Sea Empire (England, Denmark and southern Norway).
- mNormanIreland1210: the Anglo-Norman lordships in eastern and southern Ireland; mGaelicIreland1210: Gaelic western and northern Ireland.
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

# Doggerland sits across the southern North Sea between eastern Britain, Flanders and Jutland.
regions['mDoggerland7000'] = Polygon([(-1.2, 54.5), (8.2, 56.2), (8.5, 53.5), (4.5, 51.2), (1.3, 51.1), (0.2, 52.8)]).buffer(0)

# Ireland and the divisions of Great Britain.
IRELAND = L([(-10.8, 51.3), (-10.8, 55.5), (-5.3, 55.5), (-5.3, 54.0), (-5.9, 52.0), (-7.5, 51.3)])
regions['mIreland'] = IRELAND

WALES = L([(-5.4, 51.35), (-5.4, 53.5), (-3.05, 53.35), (-2.95, 52.3), (-2.65, 51.6), (-3.5, 51.35)])
regions['mWales'] = WALES
regions['mGwynedd1267'] = L([(-4.85, 52.55), (-4.85, 53.5), (-3.15, 53.4), (-3.25, 52.65)])

SCOTLAND = L([(-7.8, 54.6), (-7.8, 58.8), (-1.5, 58.8), (-1.7, 55.75), (-2.3, 55.6), (-3.1, 55.0), (-3.6, 54.85), (-5.2, 54.6)])
regions['mScotland1200'] = SCOTLAND

GB_BOX = L([(-6.0, 49.9), (-5.5, 58.8), (2.0, 58.8), (2.0, 49.9)])
regions['mRomanBritain122'] = L([(-5.8, 49.9), (-5.4, 54.95), (-3.1, 54.98), (-1.4, 55.02), (1.9, 52.8), (1.6, 50.8), (-1.0, 50.5)])
regions['mEngland1066'] = GB_BOX.difference(SCOTLAND.buffer(.01)).difference(WALES.buffer(.01)).difference(IRELAND.buffer(.05)).buffer(0)

regions['mNorthumbria700'] = L([(-3.6, 53.55), (-4.6, 54.9), (-4.2, 56.05), (-2.4, 56.05), (-1.4, 55.6), (-0.1, 53.6), (-2.2, 53.5)])
regions['mMercia750'] = L([(-3.05, 51.6), (-3.05, 53.5), (-0.1, 53.55), (0.4, 52.8), (-0.3, 51.55), (-1.8, 51.45)])

NORWAY_S = L([(4.5, 57.9), (4.5, 63.5), (11.5, 63.5), (11.8, 58.8), (8.0, 57.9)])
regions['mNorthSeaEmpire1030'] = unary_union([regions['mEngland1066'], G('mDenmark800'), NORWAY_S]).buffer(0)

NORMAN_IRE = IRELAND.intersection(Polygon([(-9.5, 51.4), (-8.5, 52.8), (-7.5, 53.7), (-6.3, 55.3), (-5.3, 55.3), (-5.3, 51.4)])).buffer(0)
regions['mNormanIreland1210'] = NORMAN_IRE
regions['mGaelicIreland1210'] = IRELAND.difference(NORMAN_IRE.buffer(.01)).buffer(0)

# v85: Ulster Plantation (1609), Civil War division of England & Wales (1643), and Connacht (1652).
regions['brUlster1609'] = IRELAND.intersection(Polygon([(-8.6, 54.0), (-8.6, 55.45), (-5.35, 55.45), (-5.35, 54.0)])).buffer(0)
regions['brConnacht1652'] = IRELAND.intersection(Polygon([(-10.5, 52.8), (-10.5, 54.45), (-7.8, 54.45), (-7.8, 52.8)])).buffer(0)
PARL_POLY = Polygon([(-1.8, 50.6), (-1.4, 52.2), (-0.8, 53.6), (2.0, 53.6), (2.0, 50.6)])
ENG_WALES = unary_union([regions['mEngland1066'], WALES]).buffer(0)
regions['brParliament1643'] = ENG_WALES.intersection(PARL_POLY).buffer(0)
regions['brRoyalist1643'] = ENG_WALES.difference(PARL_POLY.buffer(.01)).buffer(0)

# 普选篇 (老无 2026-11-08): from the Union of 1707 to universal suffrage in 1928. Teaching areas, not surveyed frontiers.
# The base land layer stops short of southern Africa and Australia, so the Boer War and Australia stay pins-free text.
regions['brGreatBritain1707'] = unary_union([regions['mEngland1066'], WALES, SCOTLAND]).buffer(0)
regions['brHighlands1745'] = SCOTLAND.intersection(Polygon([(-8.0, 55.4), (-4.9, 55.9), (-4.5, 56.1), (-3.9, 56.3), (-3.3, 56.6), (-2.6, 56.85), (-2.1, 57.0), (-1.7, 57.6), (-1.5, 58.8), (-8.0, 58.8)])).buffer(0)
regions['brHanover1714'] = L([(8.7, 51.4), (8.7, 52.6), (9.0, 53.5), (9.8, 53.65), (10.8, 53.3), (11.6, 52.9), (11.0, 52.0), (10.3, 51.5), (9.6, 51.3)])
regions['brThirteenColonies1775'] = L([(-81.4, 30.7), (-84.9, 31.0), (-85.4, 34.9), (-83.1, 35.3), (-81.7, 36.6), (-80.3, 38.5), (-79.5, 39.7), (-80.5, 39.7), (-80.5, 42.0), (-79.8, 42.0), (-79.8, 43.3), (-76.3, 43.5), (-75.0, 45.0), (-71.5, 45.0), (-70.3, 45.9), (-69.2, 47.4), (-67.8, 47.1), (-67.0, 45.2), (-66.9, 44.7), (-66.0, 44.0), (-69.0, 41.0), (-75.0, 34.0), (-80.5, 30.5)])
regions['brCanada1763'] = L([(-79.8, 43.3), (-80.5, 46.5), (-79.0, 49.0), (-70.0, 52.0), (-60.0, 52.5), (-55.5, 52.0), (-52.5, 47.5), (-59.0, 45.5), (-64.0, 43.3), (-66.9, 44.7), (-67.0, 45.2), (-67.8, 47.1), (-69.2, 47.4), (-70.3, 45.9), (-71.5, 45.0), (-75.0, 45.0), (-76.3, 43.5)]).difference(regions['brThirteenColonies1775'].buffer(.01)).buffer(0)
regions['brBengal1765'] = L([(83.3, 27.5), (88.2, 27.0), (89.9, 26.4), (92.4, 25.3), (92.6, 22.0), (91.5, 21.5), (87.5, 21.0), (86.0, 19.8), (84.5, 21.5), (83.3, 24.0)])
regions['brIndia1858'] = L([(61.0, 25.0), (66.5, 30.0), (70.0, 34.0), (74.0, 37.0), (78.0, 35.5), (80.0, 30.5), (84.0, 28.3), (88.0, 28.0), (92.0, 28.0), (97.0, 27.5), (98.5, 24.0), (97.5, 16.0), (93.5, 15.5), (92.0, 20.0), (88.0, 21.0), (81.0, 15.0), (78.5, 8.0), (76.5, 8.0), (72.5, 18.0), (68.0, 23.0)])
regions['brCrimea1854'] = L([(32.4, 45.0), (33.5, 46.2), (35.0, 45.6), (36.7, 45.5), (36.5, 44.9), (35.0, 44.7), (33.5, 44.3)])
NI = IRELAND.intersection(Polygon([(-8.18, 54.45), (-7.7, 54.6), (-7.55, 54.75), (-7.4, 54.95), (-7.25, 55.07), (-6.9, 55.35), (-6.0, 55.35), (-5.3, 54.6), (-5.4, 54.2), (-6.1, 54.0), (-6.6, 54.05), (-7.0, 54.25), (-7.3, 54.15), (-7.7, 54.1), (-8.18, 54.25)])).buffer(0)
regions['brNorthernIreland1921'] = NI
regions['brFreeState1922'] = IRELAND.difference(NI.buffer(.01)).buffer(0)
regions['brCottonLancs'] = L([(-3.1, 53.35), (-3.1, 53.95), (-2.0, 53.95), (-1.95, 53.35)])
regions['brWoolYorks'] = L([(-2.0, 53.45), (-2.0, 53.95), (-1.2, 53.95), (-1.2, 53.45)])
regions['brMidlandsIron'] = L([(-2.6, 52.3), (-2.6, 52.8), (-1.5, 52.8), (-1.5, 52.3)])
regions['brTyneCoal'] = L([(-2.0, 54.5), (-2.0, 55.3), (-1.0, 55.3), (-1.0, 54.5)])
regions['brSouthWalesCoal'] = L([(-4.4, 51.5), (-4.4, 51.9), (-2.9, 51.9), (-2.9, 51.5)])
regions['brCanada1867'] = L([(-128.0, 49.0), (-128.0, 72.0), (-52.0, 72.0), (-52.0, 46.0), (-67.0, 45.0), (-71.5, 45.0), (-75.0, 45.0), (-79.0, 43.2), (-83.0, 42.0), (-83.5, 46.0), (-89.0, 48.0), (-95.2, 49.0)])

# 普选篇 areas reach North America and India; simplify them like the America line does, and drop Arctic islets.
SIMPLIFY = {'brCanada1867': 0.06, 'brCanada1763': 0.04, 'brThirteenColonies1775': 0.03, 'brIndia1858': 0.03, 'brBengal1765': 0.02}
for k in ('brGreatBritain1707', 'brHighlands1745', 'brFreeState1922', 'brNorthernIreland1921', 'brCrimea1854', 'brHanover1714'):
    SIMPLIFY[k] = 0.012
for k, tol in SIMPLIFY.items():
    g = regions[k]
    if k.startswith('brCanada') and g.geom_type == 'MultiPolygon':
        g = unary_union([p for p in g.geoms if p.area > 0.8])
    regions[k] = g.simplify(tol, preserve_topology=True).buffer(0)

for k, g in regions.items():
    assert not g.is_empty and g.area > 0.3, (k, g.area)
    geo[k] = mapping(g)
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print('britain regions:', ', '.join(f'{k} {g.area:.2f}' for k, g in regions.items()))
