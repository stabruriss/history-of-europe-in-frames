"""Add Punic-war and eastern-expansion teaching areas to history_geo.json, clipped to the atlas coastline.

Usage: <python with shapely> build_punic_geo.py
Uses the land layer already inside data.json. Areas are teaching regions for 前264—前133年,
not reconstructed frontiers. Points are (lon, lat), matching build_rome_geo.py.
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon, box

base = json.loads(Path('data.json').read_text())
land = shape(base['land']).buffer(0).intersection(box(-10.5, 30, 30, 46.5))
geo = json.loads(Path('history_geo.json').read_text())
regions = {}

def region(name, *polys):
    regions[name] = Polygon(polys[0]).buffer(0) if len(polys) == 1 else \
        Polygon(polys[0]).buffer(0).union(Polygon(polys[1]).buffer(0))
    regions[name] = regions[name].intersection(land).simplify(.01, preserve_topology=True)

# Carthage about 264: northern and eastern Tunisia plus the Emporia coast toward Tripolitania.
region('hCarthageAfrica', [(8.3,37.1),(11.2,37.3),(11.3,36.4),(10.95,35.3),(10.3,34.0),(11.5,33.1),(13.3,32.95),
                           (15.6,32.3),(15.5,31.6),(13.0,32.4),(10.3,33.0),(9.5,34.1),(8.5,35.3),(8.1,36.3)])
# Western Sicily held by Carthage (Lilybaeum, Drepana, Panormus).
region('hPunicSicily', [(12.2,38.35),(13.95,38.25),(13.75,37.6),(13.3,37.3),(12.2,37.5)])
# Sardinia and Corsica: Carthaginian before 238, a Roman province from 227.
region('hSardCorsica', [(7.9,38.7),(10.0,38.7),(10.0,41.3),(9.9,43.2),(8.3,43.2),(8.2,41.3)])
# Barcid Spain about 219: south and east up to the Ebro.
region('hBarcidSpain', [(-7.5,37.2),(-6.3,35.95),(-5.4,35.95),(-2.0,36.6),(-0.5,37.4),(0.3,38.8),(-0.2,39.6),
                        (0.7,40.5),(0.9,40.75),(0.1,41.0),(-1.6,40.3),(-3.2,39.5),(-4.8,38.9),(-6.5,38.4),(-7.5,37.9)])
# Italian communities that went over to Hannibal after Cannae (216—211), very rough.
region('hHannibalItaly', [(14.0,41.2),(14.6,41.25),(15.2,41.55),(16.1,41.3),(17.4,40.65),(18.6,40.1),(17.2,38.9),
                          (16.6,37.85),(15.55,37.85),(15.6,38.8),(15.75,39.6),(15.0,40.1),(14.8,40.6),(14.15,40.8)])
# Roman Spain about 133: the coast, the Ebro and Guadalquivir valleys; the interior still contested.
region('hHispania133', [(-7.4,37.2),(-6.3,35.95),(-5.4,35.95),(-2.0,36.6),(-0.5,37.4),(0.3,38.8),(-0.2,39.6),
                        (0.9,40.8),(3.4,42.3),(2.0,42.7),(0.5,42.2),(-1.6,42.4),(-2.6,41.6),(-2.2,40.8),(-3.0,39.8),
                        (-4.5,39.0),(-6.0,38.6),(-7.4,38.1)])
# The province of Africa from 146: Carthage's last territory in northern Tunisia.
region('hAfrica146', [(8.6,37.1),(11.2,37.3),(11.3,36.4),(10.95,35.3),(10.0,34.9),(9.2,35.5),(8.75,36.3)])

def rounded(g):
    assert not g.is_empty and g.is_valid, g
    def coords(c):
        if isinstance(c[0], (float, int)): return [round(x, 4) for x in c]
        return [coords(x) for x in c]
    m = mapping(g); return {'type': m['type'], 'coordinates': coords(m['coordinates'])}

geo.update({k: rounded(g) for k, g in regions.items()})
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print(len(regions), 'Punic/eastern areas;', {k: round(g.area, 3) for k, g in regions.items()})
