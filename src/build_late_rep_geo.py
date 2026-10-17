"""Add late-Republic teaching areas to history_geo.json, clipped to the atlas coastline.

Usage: <python with shapely> build_late_rep_geo.py
Uses the land layer already inside data.json. Areas are teaching regions for 前133—前27年,
not reconstructed frontiers. Points are (lon, lat), matching build_rome_geo.py.
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon, box
from shapely.ops import unary_union

base = json.loads(Path('data.json').read_text())
land = shape(base['land']).buffer(0).intersection(box(-10.5, 28, 46, 53))
geo = json.loads(Path('history_geo.json').read_text())
regions = {}

def poly(points):
    return Polygon(points).buffer(0)

def region(name, *parts, minus=None):
    g = unary_union([poly(p) for p in parts])
    if minus is not None:
        g = g.difference(minus)
    regions[name] = g.intersection(land).simplify(.01, preserve_topology=True)

# Jugurtha's Numidia about 112, around the old Carthaginian territory (province of Africa from 146).
africa = poly([(8.6,37.1),(11.2,37.3),(11.3,36.4),(10.95,35.3),(10.0,34.9),(9.2,35.5),(8.75,36.3)])
region('hNumidia', [(-2.2,35.1),(1.0,36.55),(5.0,36.95),(8.55,37.0),(8.7,36.3),(9.1,35.5),(9.9,34.9),(10.6,34.3),
                    (9.5,33.6),(6.0,34.2),(2.0,34.4),(-1.0,34.4),(-2.2,34.6)], minus=africa)
# Transalpine Gaul: the province (from 121) and the rest conquered by Caesar 58—50.
narbonensis = poly([(1.7,42.4),(3.1,42.45),(4.0,43.4),(6.0,43.0),(7.6,43.75),(7.0,44.8),(6.6,45.4),(6.0,45.95),
                    (5.0,45.9),(4.3,44.9),(3.4,44.2),(2.0,43.6),(1.4,43.0)])
region('hNarbonensis', list(narbonensis.exterior.coords))
region('hGaulComata', [(-5.0,48.6),(-1.6,49.8),(1.6,51.0),(4.0,51.6),(6.0,51.8),(6.9,51.0),(7.5,49.0),(8.2,48.9),
                       (7.6,47.6),(6.9,47.0),(6.2,46.2),(5.0,45.9),(4.3,44.9),(3.4,44.2),(2.0,43.6),(1.4,43.0),
                       (-1.8,43.35),(-1.5,46.0)], minus=narbonensis)
# Italian allies that rose in 91: the Marsic peoples of the central Apennines and the Samnite group to the south.
region('hSocialRebels', [(13.1,43.0),(13.9,42.95),(14.4,42.3),(15.0,41.95),(16.0,41.5),(17.0,41.0),(17.3,40.5),
                         (16.6,40.2),(16.0,39.9),(15.6,40.05),(15.2,40.4),(14.9,40.75),(14.5,41.05),(14.2,41.2),
                         (13.9,41.5),(13.5,41.9),(13.2,42.3),(12.9,42.7)])
# Gaul north of the Po: Latin rights in 89, full citizenship from Caesar in 49.
region('hTranspadana', [(7.2,45.5),(7.6,45.05),(9.0,45.1),(10.5,45.0),(12.0,45.05),(12.6,45.4),(13.0,45.8),
                        (12.0,46.4),(10.0,46.4),(8.5,46.3),(7.6,45.9)])
# Mithridates VI's Pontus about 89, with the Bosporan kingdom across the Black Sea.
region('hPontus', [(31.5,41.2),(34.0,42.15),(37.0,41.25),(41.5,41.6),(41.8,40.2),(38.0,39.8),(35.0,40.0),(32.5,40.4)],
                  [(33.8,45.05),(36.6,45.5),(37.5,45.45),(38.4,44.8),(37.2,44.55),(35.2,44.45),(34.0,44.7)])

def rounded(g):
    assert not g.is_empty and g.is_valid, g
    def coords(c):
        if isinstance(c[0], (float, int)): return [round(x, 4) for x in c]
        return [coords(x) for x in c]
    m = mapping(g); return {'type': m['type'], 'coordinates': coords(m['coordinates'])}

geo.update({k: rounded(g) for k, g in regions.items()})
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print(len(regions), 'late-Republic areas;', {k: round(g.area, 3) for k, g in regions.items()})
