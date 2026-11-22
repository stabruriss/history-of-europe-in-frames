"""Build historical regions for WWII (ww2), late Japan (J9-J10), and topic-ww2-tech from data.json's coastline."""
import json
from pathlib import Path
from shapely.geometry import Polygon, mapping, shape
from shapely.ops import unary_union

SRC = Path(__file__).resolve().parent
land = shape(json.loads((SRC / 'data.json').read_text())['land']).buffer(0)
geo = json.loads((SRC / 'history_geo.json').read_text())


def L(pts):
    return Polygon(pts).buffer(0).intersection(land).buffer(0)


regions = {}

# Manchukuo / Northeast China (1932-1945)
regions['ww2Manchukuo'] = L([
    (118.0, 40.2), (116.8, 44.0), (118.5, 49.5), (122.0, 53.3),
    (128.0, 50.0), (134.8, 48.3), (134.0, 44.5), (130.6, 42.4),
    (126.5, 41.2), (124.2, 39.8), (121.0, 38.7), (119.5, 40.0),
])

# Japanese-occupied eastern & coastal China (1938-1944)
regions['ww2ChinaOccupied'] = L([
    (111.5, 40.8), (119.8, 40.8), (122.8, 37.5), (122.2, 31.0),
    (120.5, 27.0), (117.0, 23.0), (113.0, 21.5), (110.5, 22.8),
    (111.5, 28.0), (112.5, 31.5), (111.5, 35.5), (111.0, 39.0),
])

# Free China / Southwest wartime rear (Chongqing, Sichuan, Yunnan, Shaanxi, Gansu)
regions['ww2ChinaFree'] = L([
    (97.5, 21.5), (97.5, 34.5), (103.5, 39.5), (111.0, 39.5),
    (111.5, 35.5), (112.5, 31.5), (111.5, 28.0), (110.5, 22.8),
    (106.5, 21.5),
])

# Greater German Reich on the eve of Sept 1939 (Germany + Austria + Bohemia-Moravia + East Prussia)
regions['ww2GreaterReich1939'] = L([
    (6.0, 49.0), (6.8, 52.0), (8.2, 54.9), (14.5, 54.6),
    (18.0, 54.4), (22.7, 55.3), (22.8, 53.5), (18.5, 53.1),
    (16.0, 52.2), (18.8, 50.0), (17.2, 48.0), (16.5, 46.7),
    (13.5, 46.5), (9.6, 47.4), (7.5, 47.6),
])

# Peak Axis-controlled Europe (late 1942: France, Low Countries, Denmark, Norway, Central/SE Europe, Italy, occupied Western USSR)
regions['ww2AxisEurope1942'] = L([
    (-5.2, 48.5), (-1.8, 43.3), (3.3, 42.3), (7.5, 43.7),
    (12.2, 37.5), (16.0, 37.8), (24.0, 35.0), (26.5, 40.8),
    (29.0, 42.0), (30.5, 46.0), (38.0, 45.0), (43.5, 44.0),
    (44.5, 48.8), (38.0, 52.0), (35.5, 56.0), (31.0, 59.8),
    (31.5, 68.5), (27.0, 71.2), (16.0, 69.0), (4.5, 60.5),
    (8.0, 55.0), (2.0, 51.0),
])

# German Barbarossa advance zone inside the USSR (1941-1942)
regions['ww2EastFront1941'] = L([
    (21.0, 54.5), (23.8, 50.0), (28.0, 46.0), (33.5, 44.5),
    (40.0, 46.5), (44.0, 48.8), (37.5, 52.5), (36.0, 56.0),
    (31.0, 60.0), (27.5, 60.5), (24.0, 59.5), (20.8, 56.5),
])

# North Africa front (Tunisia - Libya - Western Egypt coastal arc)
regions['ww2NorthAfricaFront'] = L([
    (7.5, 37.3), (11.2, 37.0), (11.5, 33.0), (15.5, 31.2),
    (20.5, 32.8), (25.2, 31.6), (31.5, 31.5), (32.5, 29.5),
    (25.0, 29.0), (15.0, 29.0), (9.5, 30.5), (7.5, 34.0),
])

# Japanese Southern Expansion / Southeast Asia & Philippines arc (1942)
regions['ww2SoutheastAsia1942'] = unary_union([
    # Burma, Thailand, Indochina, Malaya
    L([(92.5, 21.5), (96.0, 26.5), (103.5, 23.0), (109.5, 21.0),
       (109.5, 11.5), (104.5, 8.5), (104.5, 1.1), (99.0, 5.5),
       (98.0, 14.0), (94.0, 16.0)]),
    # Philippines
    L([(119.0, 19.0), (127.0, 19.0), (127.0, 5.0), (119.0, 5.0)]),
    # Dutch East Indies / Borneo / Sumatra / Java / Sulawesi
    L([(95.0, 6.0), (119.5, 7.5), (132.0, 2.0), (132.0, -9.5),
       (105.0, -9.0), (95.0, 0.0)]),
]).buffer(0)

# Postwar Eastern Bloc / Iron Curtain in Europe (1945-1946: East Germany, Poland, Czechoslovakia, Hungary, Romania, Bulgaria)
regions['ww2EastBloc1946'] = L([
    (10.8, 53.8), (11.5, 50.5), (12.2, 49.8), (14.5, 48.6),
    (16.8, 47.8), (16.5, 46.5), (20.5, 46.0), (22.5, 44.0),
    (22.5, 41.3), (28.5, 41.8), (29.8, 45.2), (26.5, 48.2),
    (23.8, 50.5), (23.8, 54.4), (18.5, 54.8), (14.2, 54.2),
])

# Postwar Western Europe core (UK, France, Benelux, West Germany, Italy)
regions['ww2WestEurope1946'] = L([
    (-8.5, 58.8), (2.0, 58.8), (10.5, 55.0), (11.5, 50.5),
    (13.5, 48.0), (13.8, 45.5), (18.8, 40.0), (15.5, 37.2),
    (8.0, 38.8), (3.0, 42.3), (-2.0, 43.3), (-5.5, 48.5),
    (-6.0, 50.0), (-8.5, 54.5),
])

# Divided Korea at the 38th parallel (1945-1953)
regions['ww2KoreaNorth'] = L([
    (124.0, 38.0), (124.0, 40.3), (127.0, 41.8), (130.8, 43.2),
    (131.0, 38.0),
])
regions['ww2KoreaSouth'] = L([
    (125.0, 34.0), (125.0, 38.0), (130.2, 38.0), (130.2, 34.0),
])

for key, region in regions.items():
    assert not region.is_empty, key
    assert key not in geo, key
    geo[key] = mapping(region.simplify(0.02, preserve_topology=True))

(SRC / 'history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print('ww2 regions', len(regions))
