"""Add early-Rome teaching areas to history_geo.json, clipped to the atlas coastline.

Usage: <python with shapely> build_rome_geo.py
Uses the land layer already inside data.json (no Natural Earth download needed).
Areas are teaching regions for 前1000—前264年, not reconstructed frontiers.
Points are (lon, lat) for region(); (lat, lon) for nodes(), matching build_history.py.
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon, Point, box
from shapely.ops import unary_union

base = json.loads(Path('data.json').read_text())
land = shape(base['land']).buffer(0).intersection(box(7, 36, 20, 46))
geo = json.loads(Path('history_geo.json').read_text())
regions = {}

def region(name, points):
    regions[name] = Polygon(points).buffer(0).intersection(land).simplify(.004, preserve_topology=True)

def nodes(name, coords, radius=.07):
    regions[name] = unary_union([Point(lon, lat).buffer(radius, resolution=16) for lat, lon in coords]).intersection(land)

region('hEtruria', [(10.0,43.8),(11.25,43.85),(12.0,43.45),(12.35,43.0),(12.52,42.5),(12.58,42.18),
                    (12.48,41.95),(12.40,41.90),(12.25,41.74),(11.0,41.9),(10.0,42.6)])
region('hLatium', [(12.25,41.74),(12.40,41.90),(12.62,41.98),(12.86,42.0),(13.0,41.80),(13.12,41.55),
                   (13.28,41.32),(13.2,41.15),(12.9,41.1),(12.4,41.4),(12.05,41.62)])
region('hSabina', [(12.52,42.18),(12.55,42.55),(12.85,42.62),(13.15,42.45),(13.05,42.15),(12.86,42.0),(12.65,41.99)])
region('hVolsci', [(12.85,41.62),(13.05,41.80),(13.45,41.80),(13.80,41.62),(13.85,41.35),(13.55,41.2),(13.3,41.3),(13.1,41.5)])
region('hAequi', [(12.86,42.0),(12.95,42.18),(13.3,42.2),(13.48,41.98),(13.3,41.80),(13.05,41.80),(13.0,41.86)])
region('hCampania', [(13.75,41.25),(14.1,41.32),(14.55,41.15),(14.62,40.85),(14.45,40.6),(14.0,40.75),(13.85,41.05)])
region('hSamnium', [(13.95,41.95),(14.45,42.1),(15.05,41.9),(15.3,41.5),(15.15,41.0),(14.7,40.85),(14.5,41.15),(14.05,41.45)])
region('hRomeEarly', [(12.30,41.80),(12.40,41.92),(12.48,41.99),(12.62,41.98),(12.70,41.88),(12.62,41.78),(12.45,41.73),(12.32,41.74)])
region('hVeii', [(12.15,41.90),(12.20,42.12),(12.42,42.20),(12.56,42.10),(12.50,41.99),(12.42,41.95),(12.30,41.86)])
early = [(42.24,12.22),(42.23,12.35),(41.55,13.06),(41.58,12.97),(41.73,13.03),(41.235,13.09),(41.61,12.54)]
by290 = early + [(41.21,14.13),(41.55,13.55),(41.51,15.33),(41.24,13.93),(41.40,13.77),(41.72,13.61),
                 (42.08,13.41),(42.52,12.52),(42.10,13.09),(40.96,15.81)]
by264 = by290 + [(42.66,13.92),(42.41,11.29),(40.42,15.0),(44.06,12.57),(41.13,14.78),(43.16,13.72)]
nodes('hColonies290', by290)
nodes('hColonies264', by264)

def rounded(g):
    assert not g.is_empty and g.is_valid, g
    def coords(c):
        if isinstance(c[0], (float, int)): return [round(x, 4) for x in c]
        return [coords(x) for x in c]
    m = mapping(g); return {'type': m['type'], 'coordinates': coords(m['coordinates'])}

geo.update({k: rounded(g) for k, g in regions.items()})
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print(len(regions), 'Rome areas;', {k: round(g.area, 3) for k, g in regions.items()})
