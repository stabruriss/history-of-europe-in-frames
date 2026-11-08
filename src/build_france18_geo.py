"""Add teaching areas for France from the Fronde to Brumaire (1643—1799) to history_geo.json.

Usage: <python with shapely> build_france18_geo.py   (run after build_america_geo.py, in project-files/src).
Teaching regions only, not reconstructed frontiers. Points are (lon, lat). Builds on regions already in
history_geo.json (fFrance1648, sFrancheComte, sSpanishNetherlands1609, fArtois, fLorraine, sMilan, amLaFlorida1565).
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon
from shapely.ops import unary_union

base = json.loads(Path('data.json').read_text())
geo = json.loads(Path('history_geo.json').read_text())
land = shape(base['land']).buffer(0)
L = lambda pts: land.intersection(Polygon(pts)).buffer(0)
U = lambda *parts: unary_union(parts).buffer(0)
G = lambda key: shape(geo[key]).buffer(0)
regions = {}

# --- The kingdom ---------------------------------------------------------------------------------------------
# Lille, Douai, Valenciennes, Cambrai, Maubeuge: what Aix-la-Chapelle (1668) and Nijmegen (1678) left to France.
FRENCH_FLANDERS = L([(2.45, 50.62), (2.55, 50.95), (3.1, 50.85), (3.4, 50.65), (3.7, 50.45), (4.2, 50.35), (4.25, 50.15),
                     (3.9, 50.05), (3.25, 50.1), (2.7, 50.35)])
CORSICA = L([(8.5, 42.35), (8.75, 42.65), (9.3, 42.75), (9.35, 43.05), (9.5, 43.05), (9.6, 42.6), (9.6, 42.1), (9.45, 41.7),
             (9.15, 41.33), (8.75, 41.55), (8.55, 41.9), (8.55, 42.2)])
FRANCE_1678 = U(G('fFrance1648'), G('sFrancheComte'), FRENCH_FLANDERS)
regions['fr18FrenchFlanders'] = FRENCH_FLANDERS
regions['fr18France1678'] = FRANCE_1678
regions['fr18Corsica'] = CORSICA
regions['fr18France1789'] = U(FRANCE_1678, G('fLorraine'), CORSICA)
# Annexed in the Revolution: the papal enclave (1791), Savoy and Nice (1792).
regions['fr18Avignon1791'] = L([(4.72, 43.88), (4.8, 44.18), (5.05, 44.45), (5.45, 44.35), (5.38, 44.0), (5.05, 43.83)])
regions['fr18Savoy1792'] = U(L([(5.6, 45.6), (5.85, 46.25), (6.8, 46.45), (7.15, 45.9), (7.15, 45.25), (6.65, 45.1), (6.1, 45.35)]),
                             L([(6.85, 44.2), (7.7, 44.15), (7.55, 43.78), (7.05, 43.55), (6.88, 43.85)]))
# The Vendée militaire: the bocage south of the Loire that rose in March 1793.
regions['fr18Vendee1793'] = L([(-2.2, 46.6), (-2.15, 47.2), (-1.5, 47.35), (-0.6, 47.4), (-0.2, 46.9), (-0.5, 46.3), (-1.3, 46.25)])

# --- The Netherlands -----------------------------------------------------------------------------------------
SPN_1659 = G('sSpanishNetherlands1609').difference(G('fArtois').buffer(.02)).buffer(0)
SOUTH_1678 = SPN_1659.difference(FRENCH_FLANDERS.buffer(.02)).buffer(0)
LIEGE = L([(5.0, 50.2), (5.15, 50.8), (5.6, 51.25), (5.95, 51.05), (6.0, 50.6), (5.7, 50.25)])
regions['fr18SpanishNetherlands1659'] = SPN_1659
regions['fr18SouthernNetherlands1678'] = SOUTH_1678
regions['fr18Belgium1795'] = U(SOUTH_1678, LIEGE)
regions['fr18LeftBank1797'] = L([(6.1, 49.45), (6.35, 50.0), (6.0, 50.7), (5.9, 51.1), (6.1, 51.85), (6.8, 51.85), (7.0, 51.1), (7.4, 50.6),
                                 (7.8, 50.1), (8.3, 49.95), (8.45, 49.2), (8.2, 49.0), (7.0, 49.1)])

# --- The Spanish inheritance in Italy ------------------------------------------------------------------------------
NAPLES = L([(13.0, 41.6), (13.9, 42.05), (14.6, 42.2), (15.1, 41.95), (16.2, 41.95), (18.6, 40.3), (18.4, 39.8), (16.6, 38.0), (15.6, 37.9),
            (15.65, 39.4), (14.9, 40.3), (14.0, 40.8), (13.3, 41.2)])
SICILY = L([(12.3, 37.55), (12.4, 38.25), (13.4, 38.3), (15.7, 38.35), (15.35, 36.95), (14.3, 36.6), (12.4, 37.5)])
SARDINIA = L([(8.1, 38.9), (8.3, 40.75), (9.2, 41.35), (9.85, 40.95), (9.75, 39.1), (9.0, 38.8)])
regions['fr18SpanishItaly1700'] = U(G('sMilan'), NAPLES, SICILY, SARDINIA)

# --- North America, the Caribbean and India ------------------------------------------------------------------------
NEW_FRANCE = L([(-60.0, 47.0), (-64.0, 49.2), (-70.0, 48.8), (-75.0, 46.6), (-80.0, 46.3), (-85.0, 47.2), (-90.0, 47.8), (-95.0, 46.5),
                (-96.0, 43.0), (-95.0, 38.0), (-94.0, 33.0), (-92.0, 30.0), (-89.4, 28.9), (-88.4, 30.4), (-88.0, 34.0), (-86.0, 37.0),
                (-83.0, 39.6), (-80.6, 40.6), (-79.4, 42.6), (-76.4, 43.6), (-74.0, 45.0), (-71.0, 45.6), (-67.0, 46.2), (-64.0, 46.6)])
LOUISIANA_WEST = L([(-89.6, 28.9), (-90.2, 30.2), (-91.2, 31.0), (-91.1, 33.0), (-90.2, 35.0), (-89.6, 37.0), (-90.3, 38.8), (-91.5, 41.0),
                    (-91.0, 43.5), (-92.5, 46.6), (-96.0, 46.3), (-98.0, 42.0), (-100.0, 36.0), (-98.0, 32.0), (-94.0, 29.5)])
regions['fr18NewFrance1754'] = NEW_FRANCE
regions['fr18ThirteenColonies1754'] = L([(-67.0, 44.8), (-70.0, 45.6), (-73.4, 45.0), (-74.5, 43.6), (-77.0, 42.1), (-79.6, 42.0), (-80.6, 40.4),
                                         (-81.6, 37.6), (-83.6, 35.0), (-83.4, 32.2), (-81.4, 30.6), (-80.0, 32.0), (-76.0, 35.0), (-75.4, 37.6),
                                         (-74.0, 40.0), (-70.0, 41.4), (-69.4, 43.6)])
regions['fr18LouisianaWest1763'] = LOUISIANA_WEST
regions['fr18BritishGains1763'] = U(NEW_FRANCE.difference(LOUISIANA_WEST.buffer(.05)), G('amLaFlorida1565'))
regions['fr18SaintDomingue'] = L([(-74.6, 18.3), (-74.5, 19.95), (-72.8, 20.05), (-71.7, 19.8), (-71.6, 18.9), (-71.75, 18.0), (-73.0, 17.9)])
regions['fr18Carnatic'] = L([(78.0, 9.0), (77.5, 11.5), (78.0, 13.5), (79.0, 15.0), (80.4, 15.6), (80.5, 13.5), (80.1, 11.5), (79.6, 10.0), (79.2, 9.0)])
regions['fr18Bengal'] = L([(86.0, 21.4), (85.0, 24.5), (86.5, 26.5), (88.0, 26.8), (89.8, 26.3), (92.0, 24.0), (92.4, 22.0), (91.0, 22.1),
                           (89.0, 21.5), (87.5, 21.5)])

# --- The sister republics and Campo Formio (1797—1799) --------------------------------------------------------------
regions['fr18Cisalpine1797'] = L([(8.5, 45.9), (9.3, 46.45), (10.2, 46.6), (10.6, 45.65), (11.3, 45.05), (12.4, 44.95), (12.7, 44.0), (11.7, 43.9),
                                  (10.3, 44.3), (9.4, 44.7), (8.6, 45.1)])
regions['fr18Ligurian1797'] = L([(7.55, 43.78), (7.85, 44.2), (8.7, 44.6), (9.5, 44.45), (10.1, 44.12), (9.85, 44.0), (8.9, 44.3), (8.2, 43.95), (7.75, 43.72)])
regions['fr18Roman1798'] = L([(11.75, 42.25), (11.3, 43.1), (12.3, 43.85), (13.0, 43.85), (13.95, 42.9), (13.95, 42.0), (13.3, 41.3), (12.55, 41.4)])
regions['fr18Parthenopean1799'] = NAPLES
regions['fr18VenetoAustria1797'] = L([(10.5, 45.4), (10.65, 46.0), (11.6, 46.3), (12.5, 46.6), (13.7, 46.5), (13.65, 45.75), (12.4, 45.2), (11.4, 45.0), (10.7, 45.1)])

for key, region in regions.items():
    assert not region.is_empty, key
    assert key not in geo, key
    geo[key] = mapping(region.simplify(0.02, preserve_topology=True))
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
