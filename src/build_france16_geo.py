"""Add teaching areas for France in the Wars of Religion and under Richelieu to history_geo.json.

Usage: <python with shapely> build_france16_geo.py   (run after build_nordic_geo.py).  Teaching regions only, not reconstructed frontiers.
Points are (lon, lat).
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
regions = {}

# The kingdom in 1559: without Lorraine, Béarn–Navarre, Roussillon, Bresse, Savoy, Franche-Comté and Artois.
FRANCE_1559 = L([(1.45, 51.2), (2.05, 51.05), (2.0, 50.8), (1.75, 50.6), (2.1, 50.35), (2.75, 50.05), (3.25, 50.0), (3.6, 49.95), (4.2, 49.95),
                 (4.7, 49.85), (5.05, 49.6), (5.2, 49.2), (5.1, 48.75), (5.3, 48.4), (5.45, 47.9), (5.25, 47.35), (5.2, 46.8), (4.95, 46.35),
                 (4.85, 45.9), (5.15, 45.75), (5.7, 45.6), (6.1, 45.35), (6.65, 45.1), (6.95, 44.85), (6.85, 44.4), (6.7, 44.2), (7.05, 43.95),
                 (7.25, 43.7), (7.25, 43.2), (4.5, 42.8), (3.2, 42.93), (2.2, 42.85), (1.75, 42.7), (0.7, 42.7), (0.05, 42.75), (0.05, 43.2),
                 (-0.35, 43.6), (-0.9, 43.6), (-1.35, 43.55), (-1.5, 43.52), (-1.9, 43.7), (-3.2, 46.0), (-5.8, 48.3), (-5.2, 48.95), (-3.0, 49.1),
                 (-1.95, 48.75), (-1.75, 49.85), (0.0, 50.1)])
THREE_BISHOPRICS = U(L([(5.9, 48.95), (5.9, 49.35), (6.5, 49.35), (6.5, 48.95)]), L([(5.75, 48.55), (5.75, 48.8), (6.05, 48.8), (6.05, 48.55)]),
                     L([(5.2, 49.0), (5.2, 49.35), (5.6, 49.35), (5.6, 49.0)]))
CALAIS = L([(1.6, 50.75), (1.6, 51.05), (2.05, 51.05), (2.05, 50.75)])
NAVARRE_BEARN = L([(-1.75, 43.35), (-1.5, 43.55), (-0.9, 43.6), (-0.35, 43.6), (0.05, 43.2), (0.05, 42.75), (-0.8, 42.8), (-1.4, 43.0)])
BRESSE = L([(4.85, 46.0), (4.95, 46.55), (5.5, 46.5), (6.1, 46.4), (6.0, 45.75), (5.3, 45.65)])
ALSACE = L([(7.05, 47.45), (7.1, 48.1), (7.7, 49.0), (8.2, 49.0), (7.7, 48.3), (7.55, 47.55)])
ARTOIS = L([(1.6, 50.35), (2.1, 50.85), (3.1, 50.75), (3.25, 50.15), (2.6, 50.05)])
ROUSSILLON = L([(1.75, 42.45), (1.85, 42.85), (3.05, 42.95), (3.25, 42.4)])
FRANCE_1610 = U(FRANCE_1559, THREE_BISHOPRICS, NAVARRE_BEARN, BRESSE)
regions['fFrance1559'] = U(FRANCE_1559, THREE_BISHOPRICS)
regions['fFrance1610'] = FRANCE_1610
regions['fFrance1648'] = U(FRANCE_1610, ALSACE, ARTOIS, ROUSSILLON)
regions['fThreeBishoprics'] = THREE_BISHOPRICS
regions['fCalaisPale'] = CALAIS
regions['fNavarreBearn'] = NAVARRE_BEARN
regions['fBresse1601'] = BRESSE
regions['fAlsace'] = ALSACE
regions['fArtois'] = ARTOIS
regions['fRoussillon'] = ROUSSILLON
regions['fLorraine'] = L([(5.0, 48.35), (5.35, 49.0), (6.5, 49.55), (7.5, 49.15), (7.2, 48.25), (6.4, 47.85), (5.6, 47.9)]).difference(THREE_BISHOPRICS.buffer(.01)).buffer(0)
regions['fSavoy1559'] = L([(5.6, 45.6), (5.9, 46.4), (6.9, 46.4), (7.9, 45.9), (8.4, 45.2), (8.0, 44.4), (7.25, 43.75), (7.05, 43.95), (6.85, 44.4), (6.95, 44.85), (6.1, 45.35)])

# Where the Huguenots were strong: the crescent from La Rochelle through Gascony and Languedoc to Dauphiné.
regions['fHuguenotCrescent'] = L([(-1.7, 46.6), (-0.2, 46.2), (0.7, 45.6), (1.5, 44.9), (2.6, 44.7), (3.9, 45.0), (5.2, 45.4), (6.2, 45.2), (6.6, 44.7),
                                  (5.4, 44.1), (4.6, 43.6), (3.2, 43.1), (2.0, 43.1), (0.6, 43.3), (-0.6, 43.7), (-1.3, 44.6), (-1.7, 45.6)])
regions['fAunis'] = L([(-1.55, 45.95), (-1.55, 46.4), (-0.7, 46.4), (-0.7, 45.95)])

# The three houses: where their lands and governorships lay.
regions['fGuiseEast'] = L([(3.2, 49.6), (4.8, 49.7), (5.05, 49.6), (5.2, 49.2), (5.1, 48.75), (5.3, 48.4), (5.45, 47.9), (5.25, 47.35), (5.2, 46.8), (4.95, 46.35),
                           (4.3, 46.3), (3.6, 47.2), (3.2, 48.3)])
regions['fBourbonSW'] = U(NAVARRE_BEARN, L([(-1.4, 44.9), (0.3, 45.25), (1.35, 44.85), (1.35, 43.9), (0.75, 43.1), (0.05, 42.75), (0.05, 43.2), (-0.35, 43.6), (-1.5, 43.52)]),
                          L([(0.7, 47.65), (0.7, 48.05), (1.4, 48.05), (1.4, 47.65)]))
regions['fMontmorency'] = U(L([(1.8, 48.4), (1.8, 49.3), (3.2, 49.4), (3.4, 48.6), (2.6, 48.2)]),
                            L([(0.9, 43.4), (1.7, 44.1), (3.3, 44.9), (4.7, 44.8), (4.7, 43.6), (3.1, 43.0), (1.7, 43.2)]))

# 1589, after Blois: who held what.
regions['fLeague1589'] = U(L([(0.2, 49.6), (1.6, 50.1), (3.2, 49.9), (4.8, 49.7), (5.2, 49.2), (5.3, 48.4), (5.3, 47.6), (5.2, 46.4), (4.85, 45.7), (4.0, 45.9), (3.1, 47.2), (2.3, 47.9), (1.0, 48.5)]),
                           L([(-4.8, 47.7), (-4.8, 48.7), (-2.0, 48.7), (-1.2, 47.6), (-2.2, 47.1)]),
                           L([(4.8, 43.3), (4.8, 44.0), (6.8, 44.1), (7.2, 43.6), (6.2, 43.0)]),
                           L([(1.0, 43.3), (1.0, 43.9), (2.2, 43.9), (2.2, 43.3)]))
regions['fRoyalLoire1589'] = L([(-0.5, 47.2), (0.3, 48.0), (1.7, 47.9), (2.3, 47.1), (1.4, 46.5), (0.2, 46.4)])
regions['fHuguenotSW1589'] = L([(-1.7, 46.4), (-0.3, 46.2), (0.7, 45.3), (1.4, 44.7), (2.4, 43.9), (3.1, 43.5), (2.0, 43.0), (0.05, 42.75), (-0.8, 42.8), (-1.75, 43.35), (-1.3, 44.6)])

for key, region in regions.items():
    assert not region.is_empty, key
    assert key not in geo, key
    geo[key] = mapping(region.simplify(0.02, preserve_topology=True))
Path('history_geo.json').write_text(json.dumps(geo))
print('regions', len(regions))
