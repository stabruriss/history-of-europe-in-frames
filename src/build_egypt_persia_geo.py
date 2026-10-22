"""Add teaching areas for the Egypt and Persia lines (chapters 8 and 9) to history_geo.json.

Usage: <python with shapely> build_egypt_persia_geo.py
- nLowerEgypt / nUpperEgypt: the Two Lands, split just south of Memphis (about 29.5° N).
- nWawat: Lower Nubia between the First and Second Cataracts; nKush: Upper Nubia from the Second Cataract to Meroe.
- nNewKingdom: Egypt's reach about 1450 BC (the Nile to the Fourth Cataract, Sinai, the Levant to the Euphrates bend).
- nKush25: the Kushite (25th-dynasty) realm about 700 BC, Meroe to the Delta.
- nElam: Susiana and the Zagros up to Anshan in Fars.
- nMedia585: the Median kingdom about 585 BC, Halys to eastern Iran (very approximate).
- nHyksos / nTheban17: Egypt about 1600 BC, split near Cusae (27.4° N) between the Hyksos kings and the Theban rulers.
- pLydia585: Lydia at its height about 585 BC, the Aegean coast to the Halys.
- pAssyria650: the Neo-Assyrian empire about 650 BC without Egypt, the Levant to the Zagros.
The Nile band is a buffer of the base map's Nile between latitude limits. Teaching regions only. Points are (lon, lat).
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon, box
from shapely.ops import unary_union

base = json.loads(Path('data.json').read_text())
geo = json.loads(Path('history_geo.json').read_text())
land = shape(base['land']).buffer(0)
egypt = shape(base['regions']['egypt']).buffer(0)
nile = shape(base['rivers']['nile']['geom'])
regions = {}

def nile_band(south, north, width=.32):
    return land.intersection(nile.buffer(width, 16).intersection(box(28, south, 35, north)))

regions['nLowerEgypt'] = egypt.intersection(box(28, 29.5, 34, 32))
regions['nUpperEgypt'] = egypt.intersection(box(28, 23, 34, 29.5))
regions['nWawat'] = nile_band(21.85, 24.15)
regions['nKush'] = nile_band(16.0, 21.9)
SINAI = land.intersection(Polygon([(32.3,31.3),(34.25,31.35),(34.95,29.5),(34.3,27.7),(32.6,29.9)]))
LEVANT = land.intersection(Polygon([(34.2,31.2),(34.9,33.2),(35.7,35.5),(36.0,36.7),(37.8,36.7),(38.3,36.0),(38.0,35.2),
                                    (36.8,33.2),(35.9,31.0),(34.9,29.6)]))
regions['nNewKingdom'] = unary_union([egypt, nile_band(18.4, 24.15), SINAI, LEVANT])
regions['nKush25'] = unary_union([egypt, nile_band(16.0, 24.15)])
regions['nHyksos'] = egypt.intersection(box(28, 27.4, 34, 32))
regions['nTheban17'] = egypt.intersection(box(28, 23.79, 34, 27.4))
regions['pLydia585'] = land.intersection(Polygon([(26.0,39.9),(27.0,40.5),(29.0,41.1),(31.0,41.3),(33.5,41.9),(35.0,41.7),(34.8,40.5),
                                                  (34.2,39.0),(33.5,38.0),(31.0,37.4),(29.5,36.9),(28.0,36.8),(27.2,37.3),(26.3,38.3)]))
regions['pAssyria650'] = land.intersection(Polygon([(34.2,31.0),(34.9,33.2),(35.8,35.5),(36.0,36.9),(37.5,37.6),(40.0,37.8),(42.5,37.6),
                                                    (44.5,37.0),(45.5,36.0),(46.0,35.0),(46.5,33.5),(47.5,32.0),(48.0,30.5),(47.0,30.0),(45.5,31.0),
                                                    (44.0,32.0),(42.5,33.5),(40.0,34.0),(38.5,33.0),(36.5,31.5),(35.5,30.0),(34.6,30.6)]))
regions['nElam'] = land.intersection(Polygon([(47.0,33.3),(48.5,34.0),(50.0,33.3),(51.0,32.2),(52.0,31.3),(54.0,30.5),(54.5,29.0),
                                              (53.0,28.2),(51.5,28.7),(50.5,29.6),(49.5,30.2),(48.4,29.9),(47.8,30.6),(47.6,31.8)]))
regions['nMedia585'] = land.intersection(Polygon([(35.2,41.2),(38.0,41.2),(41.0,41.5),(44.0,42.2),(47.5,41.5),(49.5,38.5),
                                                  (53.0,37.0),(56.5,36.8),(58.0,35.5),(55.0,33.8),(52.5,33.2),(50.0,33.0),(48.0,33.8),
                                                  (46.0,35.0),(44.5,36.2),(42.5,37.2),(40.5,37.5),(38.5,38.2),(36.5,38.8)]))

def rounded(g):
    g = g.simplify(.01, preserve_topology=True).buffer(0)
    assert not g.is_empty and g.is_valid, g
    def coords(c):
        if isinstance(c[0], (float, int)): return [round(x, 4) for x in c]
        return [coords(x) for x in c]
    m = mapping(g); return {'type': m['type'], 'coordinates': coords(m['coordinates'])}

geo.update({k: rounded(g) for k, g in regions.items()})
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print(len(regions), 'areas;', {k: round(g.area, 2) for k, g in regions.items()})
