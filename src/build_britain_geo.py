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

for k, g in regions.items():
    assert not g.is_empty and g.area > 0.3, (k, g.area)
    geo[k] = mapping(g)
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print('britain regions:', ', '.join(f'{k} {g.area:.2f}' for k, g in regions.items()))
