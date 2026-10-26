"""Add teaching areas for the last Western emperors (455-476) to history_geo.json.

Usage: <python with shapely> build_late_west_geo.py   (run after build_middle_byzantine_geo.py; it reads the 395 and 476 areas)
- eVisigoths460: the Visigothic federates of Toulouse about 460, between the Loire and the Pyrenees (before Euric's conquests).
- eWest460: what Majorian held about 460 (Italy, Sicily, Raetia and Noricum, Dalmatia, Gaul outside the Visigoths, the Franks
  and the Burgundians of Sapaudia, Spain outside the Suebi); no Africa, no Britain, no Pannonia, no Vandal islands.
- eDalmatia460: Dalmatia, held by Marcellinus and then by his nephew Julius Nepos.
- eBurgundians460: the Burgundians settled in Sapaudia (around Geneva) in 443, before they spread down the Rhône.
Also repairs e476Visigoths, which had a sliver of a hole along the Pyrenees where its Gallic and Spanish parts were joined.
Teaching regions only, not reconstructed frontiers. Points are (lon, lat).
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon, box
from shapely.ops import unary_union

base = json.loads(Path('data.json').read_text())
geo = json.loads(Path('history_geo.json').read_text())
land = shape(base['land']).buffer(0)
G = lambda k: shape(geo[k]).buffer(0)
L = lambda pts: land.intersection(Polygon(pts))
regions = {}

# ---------- the Visigoths of Toulouse, about 460 ----------
regions['eVisigoths460'] = L([(-3.0,47.3),(0.3,47.3),(0.9,47.15),(1.3,46.6),(1.6,46.0),(1.8,45.3),(2.0,44.6),(2.2,44.0),(2.3,43.6),
                              (2.0,43.2),(1.6,42.75),(0.7,42.65),(-0.5,42.75),(-1.4,43.05),(-1.8,43.38),(-3.0,43.6)])

# ---------- Dalmatia ----------
regions['eDalmatia460'] = L([(14.1,45.5),(15.6,45.5),(16.8,45.2),(17.8,45.05),(19.0,44.9),(19.4,44.2),(19.2,43.3),(19.4,42.4),
                             (18.4,42.0),(17.3,42.6),(16.0,43.1),(14.9,43.7),(14.0,44.6)])

# ---------- Majorian's West, about 460 ----------
# Cut with plain shapes, not land-clipped ones: the 395 area runs a little past the simplified coastline.
africa = Polygon([(-10.5,30.0),(11.6,30.0),(11.6,37.6),(9.5,37.6),(-5.3,35.95),(-10.5,35.95)])
sapaudia = Polygon([(5.6,45.4),(5.6,46.6),(6.9,46.7),(7.3,46.2),(7.1,45.4)])
pannonia = box(15.8, 45.7, 21.5, 48.6)
islands = unary_union([box(8.0, 38.8, 9.9, 43.1), box(1.1, 38.6, 4.5, 40.2)])  # Sardinia and Corsica, the Balearics: Vandal by 460
lost = unary_union([africa, G('gBritannia'), regions['eVisigoths460'], G('e476Suebi'), G('e476Franks'), sapaudia, pannonia, islands])
regions['eWest460'] = G('eWest395').intersection(box(-10.5, 35.8, 21.0, 51.6)).difference(lost).buffer(0)
regions['eBurgundians460'] = land.intersection(sapaudia)


def rounded(g):
    g = g.simplify(.01, preserve_topology=True).buffer(0)
    assert not g.is_empty and g.is_valid, g
    def coords(c):
        if isinstance(c[0], (float, int)): return [round(x, 4) for x in c]
        return [coords(x) for x in c]
    m = mapping(g); return {'type': m['type'], 'coordinates': coords(m['coordinates'])}

for k in regions:
    assert k not in geo, ('exists', k)
geo.update({k: rounded(g) for k, g in regions.items()})
v = G('e476Visigoths')
assert sum(len(q.interiors) for q in getattr(v, 'geoms', [v])) == 1, 'expected the one sliver hole'
geo['e476Visigoths'] = rounded(unary_union([Polygon(q.exterior) for q in getattr(v, 'geoms', [v])]))
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print(len(regions), 'areas;', {k: round(g.area, 1) for k, g in regions.items()})
