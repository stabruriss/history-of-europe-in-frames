"""Build historical regions for the Japan main line (japan) from data.json's coastline.

Every polygon is intersected with data.json's land mask so coastal borders
follow the exact Japanese archipelago, Korea, and Manchuria coastlines.
"""
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

# Main Japanese islands south of Tsugaru Strait: Honshu, Shikoku, Kyushu (and Tsushima).
HONSHU_SHIKOKU_KYUSHU = L([
    (128.8, 30.8), (128.8, 35.0), (131.0, 36.2), (135.5, 37.8), (138.5, 38.8),
    (139.6, 41.6), (141.9, 41.6), (142.3, 39.2), (141.3, 35.4), (139.9, 34.4),
    (136.0, 33.2), (132.4, 32.4), (131.6, 30.8),
])
HOKKAIDO = L([
    (139.5, 41.35), (139.5, 43.8), (141.3, 45.6), (145.9, 44.6),
    (146.1, 42.9), (142.8, 41.7), (140.5, 41.35),
])
RYUKYU = L([
    (122.8, 23.9), (122.8, 25.2), (127.0, 27.3), (129.5, 29.6),
    (131.1, 30.9), (132.0, 30.5), (129.0, 27.0), (125.0, 23.9),
])

regions['jpCore'] = HONSHU_SHIKOKU_KYUSHU
regions['jpHokkaido'] = HOKKAIDO
regions['jpRyukyu'] = RYUKYU
regions['jpArchipelago'] = unary_union([HONSHU_SHIKOKU_KYUSHU, HOKKAIDO, RYUKYU]).buffer(0)

# Ancient Yamato / Kofun / Nara core: northern Kyushu through Seto Inland Sea, Kinai, and central Honshu.
regions['jpYamato'] = L([
    (129.2, 32.0), (129.2, 35.0), (131.0, 36.2), (135.5, 37.5), (137.5, 37.5),
    (138.2, 35.0), (136.0, 33.2), (132.4, 32.4), (131.6, 31.8),
])

# Emishi frontier in northern Honshu (Tohoku) and Hokkaido during Asuka/Nara/early Heian.
regions['jpTohokuEmishi'] = unary_union([
    L([(138.8, 37.5), (139.6, 41.6), (141.9, 41.6), (142.3, 39.2), (141.4, 37.5)]),
    HOKKAIDO,
]).buffer(0)

# Late Heian split: Taira (Heike) western maritime base vs Minamoto (Genji) eastern Kanto base.
regions['jpHeikeWest'] = L([
    (129.0, 30.8), (129.0, 35.0), (131.0, 36.2), (135.5, 36.4),
    (136.3, 35.0), (135.8, 33.2), (132.4, 32.4), (131.6, 30.8),
])
regions['jpMinamotoEast'] = L([
    (136.3, 34.4), (136.3, 37.5), (138.5, 38.8), (139.6, 41.6),
    (141.9, 41.6), (142.3, 39.2), (141.3, 35.4), (139.9, 34.4),
])

# Oda Nobunaga's central Japan domain on the eve of Honno-ji (1582).
regions['jpOda1582'] = L([
    (133.2, 34.2), (133.2, 35.9), (136.0, 37.6), (138.4, 37.2),
    (139.0, 35.2), (137.4, 34.3), (135.5, 33.3), (134.0, 33.8),
])

# Tokugawa Kanto & Tokaido core (1600 / Edo shogunate core).
regions['jpTokugawaEast'] = L([
    (137.2, 34.3), (137.2, 37.4), (139.5, 37.8), (141.2, 37.4),
    (141.2, 35.2), (139.9, 34.4),
])

# Southwestern outer domains (Tozama): Satsuma (southern Kyushu), Choshu (western Honshu), Tosa (southern Shikoku).
regions['jpSatsumaChoshu'] = unary_union([
    L([(129.6, 30.8), (129.6, 32.5), (131.7, 32.5), (131.7, 30.8)]),  # Satsuma
    L([(130.7, 33.8), (130.7, 34.7), (132.2, 34.7), (132.2, 33.8)]),  # Choshu
    L([(132.5, 32.7), (132.5, 33.9), (134.4, 33.9), (134.4, 32.7)]),  # Tosa
]).buffer(0)

# Southern Manchuria / Liaodong corridor after the 1905 Treaty of Portsmouth.
regions['jpLiaodong1905'] = L([
    (120.8, 38.6), (121.0, 41.2), (123.0, 43.8), (125.8, 43.8),
    (125.5, 41.0), (124.2, 39.8), (122.4, 38.6),
])

for key, region in regions.items():
    assert not region.is_empty, key
    assert key not in geo, key
    geo[key] = mapping(region.simplify(0.02, preserve_topology=True))

(SRC / 'history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print('japan regions', len(regions))
