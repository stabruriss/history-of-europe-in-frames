"""Add teaching areas for 北欧, the Spanish Habsburgs and 瑞士 to history_geo.json.

Usage: <python with shapely> build_nordic_geo.py   (run after build_britain_geo.py).  Teaching regions only, not reconstructed frontiers.
Points are (lon, lat).
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
U = lambda *parts: unary_union(parts).buffer(0)
regions = {}

# ---------- 北欧 ----------
# Danish provinces east of the Sound (Danish until 1645/1658) and the islands that changed hands.
SCANIA = L([(12.3, 55.2), (12.4, 56.4), (14.4, 56.6), (16.1, 56.4), (15.7, 55.85), (14.6, 55.2)])
HALLAND = L([(11.7, 56.3), (11.7, 57.7), (13.3, 57.7), (13.3, 56.4), (12.4, 56.4)])
GOTLAND = L([(18.0, 56.8), (18.0, 58.1), (19.5, 58.1), (19.5, 56.8)])
OSEL = L([(21.7, 57.85), (21.7, 58.75), (23.4, 58.75), (23.4, 57.85)])
JAMTLAND = L([(12.2, 61.6), (12.2, 64.0), (14.4, 64.7), (16.6, 63.2), (16.0, 61.6)])
regions['nScania'] = SCANIA
regions['nHalland'] = HALLAND
regions['nGotland'] = GOTLAND
regions['nOsel'] = OSEL
regions['nJamtland'] = JAMTLAND
# Medieval Norway reaches south to the Göta river and east over Jämtland.
NORWAY = U(L([(3.8, 57.7), (3.8, 62.6), (9.5, 66.0), (13.0, 69.5), (22.0, 71.6), (31.6, 71.0), (29.0, 69.0), (25.0, 68.9), (20.5, 68.9),
              (18.0, 68.2), (15.5, 66.4), (14.0, 64.9), (12.2, 63.6), (12.2, 61.2), (12.7, 60.0), (12.0, 58.9), (11.9, 57.7), (8.0, 57.7)]), JAMTLAND)
regions['nNorway'] = NORWAY
DENMARK = U(G('mDenmark800'), SCANIA, HALLAND)
regions['nDenmark'] = DENMARK
SWEDEN_BOX = L([(11.0, 55.0), (11.0, 59.2), (12.7, 61.0), (12.4, 63.9), (14.4, 65.2), (15.7, 66.8), (18.3, 68.6), (20.8, 69.2), (23.8, 67.9),
                (24.3, 65.8), (20.2, 63.0), (18.8, 60.2), (19.6, 59.6), (17.6, 58.2), (17.4, 56.3), (15.7, 55.85), (14.4, 55.2)])
SWEDEN = SWEDEN_BOX.difference(NORWAY.buffer(.01)).difference(SCANIA.buffer(.01)).difference(HALLAND.buffer(.01)).difference(G('mDenmark800').buffer(.01)).difference(GOTLAND.buffer(.01)).buffer(0)
regions['nSweden'] = SWEDEN
FINLAND = L([(20.0, 59.6), (20.0, 60.6), (21.0, 62.9), (23.6, 65.9), (25.6, 66.1), (29.2, 64.6), (30.8, 62.3), (28.6, 60.6), (26.0, 60.1), (23.0, 59.6)])
regions['nFinland'] = FINLAND
ICELAND = L([(-25.0, 63.1), (-25.0, 66.8), (-13.0, 66.8), (-13.0, 63.1)])
regions['nIceland'] = ICELAND
regions['nKalmar1397'] = U(DENMARK, GOTLAND, NORWAY, SWEDEN, FINLAND, ICELAND)
regions['nDenmarkNorway1536'] = U(DENMARK, GOTLAND, OSEL, NORWAY, ICELAND)
regions['nDenmarkNorway1645'] = U(G('mDenmark800'), SCANIA, NORWAY.difference(JAMTLAND.buffer(.01)), ICELAND)
SWEDEN_1523 = U(SWEDEN, FINLAND)
regions['nSweden1523'] = SWEDEN_1523
ESTONIA = L([(23.3, 58.3), (23.3, 59.7), (28.3, 59.7), (28.3, 58.9), (26.0, 58.25)])
LIVONIA = L([(21.0, 56.9), (21.0, 58.0), (23.3, 58.3), (26.0, 58.25), (27.5, 57.6), (28.0, 57.0), (24.5, 56.7)])
INGRIA = L([(27.6, 58.9), (27.6, 60.6), (30.8, 62.3), (33.0, 60.4), (30.5, 59.0)])
PRUSSIA_PORTS = L([(18.4, 54.15), (18.4, 54.95), (21.3, 55.8), (21.3, 54.4)])
POMERANIA = L([(12.3, 53.9), (12.3, 54.8), (14.9, 54.3), (14.9, 53.2), (14.2, 53.2), (13.2, 53.7)])
BREMEN_VERDEN = L([(8.3, 53.15), (8.45, 53.85), (8.95, 53.95), (9.75, 53.6), (9.75, 53.05), (9.3, 52.85), (8.75, 52.95)])
regions['nEstonia1561'] = ESTONIA
regions['nLivonia1621'] = LIVONIA
regions['nIngria1617'] = INGRIA
regions['nPrussianPorts1629'] = PRUSSIA_PORTS
regions['nPomerania1648'] = POMERANIA
regions['nBremenVerden1648'] = BREMEN_VERDEN
SWEDEN_1629 = U(SWEDEN_1523, ESTONIA, LIVONIA, INGRIA)
regions['nSweden1629'] = SWEDEN_1629
regions['nSweden1648'] = U(SWEDEN_1629, JAMTLAND, GOTLAND, OSEL, HALLAND, POMERANIA, BREMEN_VERDEN)

# ---------- 西班牙 ----------
IBERIA = L([(-9.9, 36.0), (-9.9, 43.9), (-1.8, 43.5), (-0.7, 42.8), (0.7, 42.75), (3.3, 42.4), (3.5, 41.3), (0.6, 39.6), (-0.1, 38.0), (-2.0, 36.5), (-5.4, 35.9)])
PORTUGAL = L([(-9.9, 36.9), (-9.9, 42.2), (-8.1, 42.2), (-6.2, 41.9), (-6.9, 41.0), (-7.0, 39.5), (-7.5, 38.2), (-7.4, 37.0)])
ARAGON = L([(-2.2, 41.9), (-1.6, 42.8), (0.7, 42.75), (3.4, 42.45), (3.6, 41.3), (0.7, 39.8), (0.2, 38.6), (-1.2, 38.2), (-1.6, 40.2)])
regions['sPortugal'] = PORTUGAL
regions['sCrownAragon'] = ARAGON
regions['sCastile'] = IBERIA.difference(PORTUGAL.buffer(.01)).difference(ARAGON.buffer(.01)).buffer(0)
regions['sIberia1580'] = IBERIA
regions['sValencia'] = L([(-1.1, 38.0), (-1.45, 39.3), (-0.85, 40.25), (0.15, 40.75), (0.6, 40.5), (0.3, 38.6)])
regions['sAlpujarras'] = L([(-3.95, 36.7), (-3.75, 37.15), (-3.0, 37.25), (-2.45, 37.05), (-2.55, 36.7), (-3.3, 36.65)])
MILAN = L([(8.45, 45.1), (8.55, 45.75), (8.95, 46.05), (9.5, 46.1), (10.4, 45.85), (10.6, 45.3), (10.0, 45.0), (9.2, 44.85)])
NETHERLANDS = L([(2.3, 50.2), (2.3, 51.3), (3.3, 51.6), (4.5, 53.3), (7.3, 53.7), (7.1, 52.2), (6.1, 50.8), (5.9, 49.5), (4.2, 49.9)])
NORTH_NL = L([(3.3, 51.2), (3.3, 51.7), (4.5, 53.3), (7.3, 53.7), (7.1, 52.0), (6.0, 51.75), (5.0, 51.45)])
FRANCHE_COMTE = L([(5.25, 46.35), (5.3, 47.2), (5.75, 47.85), (6.8, 47.75), (7.0, 47.45), (6.4, 46.85), (5.95, 46.35)])
regions['sMilan'] = MILAN
regions['sNetherlands1556'] = NETHERLANDS
regions['sDutchRepublic1609'] = NORTH_NL
regions['sSpanishNetherlands1609'] = NETHERLANDS.difference(NORTH_NL.buffer(.01)).buffer(0)
regions['sFrancheComte'] = FRANCHE_COMTE
SPANISH_EUROPE = U(regions['sCastile'], ARAGON, MILAN, NETHERLANDS, FRANCHE_COMTE, G('mNaplesAnjou1282'), G('mSicilyKingdom1190'))
regions['sHabsburgSpain1556'] = SPANISH_EUROPE
regions['sHabsburgAustria1556'] = L([(9.6, 46.4), (9.6, 47.6), (12.0, 50.9), (15.0, 51.1), (18.8, 50.0), (22.5, 48.9), (21.0, 46.8), (16.5, 45.7), (13.5, 45.7)])
regions['sLowerPalatinate'] = L([(7.65, 49.1), (7.7, 49.75), (8.15, 50.0), (8.95, 49.75), (9.0, 49.3), (8.5, 49.0), (8.0, 48.95)])
regions['aAztec1519'] = L([(-100.6, 18.0), (-100.6, 20.8), (-96.0, 20.6), (-95.5, 17.5), (-98.5, 16.5)])
regions['aInca1532'] = L([(-81.4, -5.0), (-79.0, 1.6), (-76.5, 0.0), (-74.0, -6.0), (-70.0, -14.0), (-65.0, -17.0), (-64.5, -25.0), (-69.0, -34.2), (-71.9, -34.2), (-71.2, -25.0), (-75.5, -15.0), (-79.8, -7.0)])
regions['aNewSpain1600'] = L([(-112.0, 23.0), (-106.0, 26.5), (-97.0, 26.5), (-95.0, 19.0), (-86.5, 21.8), (-83.0, 15.5), (-82.5, 8.5), (-92.0, 13.5), (-105.5, 19.5)])
regions['aPeru1600'] = L([(-81.5, -5.0), (-78.0, 9.5), (-71.5, 12.0), (-70.0, 2.0), (-69.0, -11.0), (-58.0, -19.0), (-57.5, -34.5), (-65.0, -40.0), (-73.5, -40.0), (-71.2, -25.0), (-75.5, -15.0), (-79.8, -7.0)])
regions['aBrazil1600'] = L([(-48.5, -1.0), (-46.5, -24.5), (-48.5, -28.0), (-38.0, -18.0), (-34.5, -7.0), (-44.0, -1.5)])
regions['aCaribbean'] = L([(-85.2, 18.0), (-85.2, 23.5), (-68.0, 20.5), (-65.0, 17.6), (-72.0, 17.4)])

# ---------- 瑞士 ----------
regions['cForestCantons1291'] = L([(8.42, 46.72), (8.2, 46.9), (8.33, 47.03), (8.6, 47.14), (8.98, 47.2), (9.0, 46.95), (8.82, 46.68), (8.6, 46.55)])
regions['cSwiss1353'] = L([(6.9, 46.6), (6.9, 47.35), (8.1, 47.6), (9.1, 47.65), (9.2, 46.6), (8.6, 46.45)])
regions['cSwiss1513'] = L([(6.0, 46.2), (6.9, 47.5), (7.6, 47.65), (9.5, 47.75), (9.7, 47.0), (9.0, 45.85), (8.2, 46.05), (7.0, 45.95)])
regions['cAargau'] = L([(7.8, 47.3), (7.92, 47.5), (8.18, 47.62), (8.48, 47.58), (8.45, 47.3), (8.25, 47.16), (7.95, 47.18)])
regions['cBurgundy1476'] = U(NETHERLANDS, FRANCHE_COMTE, G('mBurgundyDuchy900'), L([(5.4, 48.0), (5.4, 49.5), (7.6, 49.4), (7.8, 47.9)]))

for key, region in regions.items():
    assert not region.is_empty, key
    geo[key] = mapping(region.simplify(0.02, preserve_topology=True))
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print('regions', len(regions))
