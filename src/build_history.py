"""Build teaching areas clipped to coastlines, never to modern national borders.

Usage: python build_history.py /path/to/natural-earth-data
Requires shapely and pyshp; expects ne_10m_land/ne_10m_land.shp under that directory.
The assembled atlas uses the generated history_geo.json without Python at runtime.
"""
import json
import sys
from pathlib import Path
import shapefile
from shapely.geometry import shape, mapping, Polygon, Point, box
from shapely.ops import unary_union

root = Path(sys.argv[1]) if len(sys.argv) > 1 else Path('.')
coast = shapefile.Reader(str(root / 'ne_10m_land/ne_10m_land'))
clip = box(10, 20, 81, 47)
land = unary_union([shape(s.__geo_interface__).intersection(clip) for s in coast.shapes()
                    if shape(s.__geo_interface__).intersects(clip)])
base = json.loads(Path('data.json').read_text())
regions = {}

def region(name, points):
    regions[name] = Polygon(points).buffer(0).intersection(land).simplify(.008, preserve_topology=True)

def union(name, *keys):
    regions[name] = unary_union([regions[k] for k in keys])

def nodes(name, coords, radius=.16):
    regions[name] = unary_union([Point(lon, lat).buffer(radius, resolution=20) for lat, lon in coords]).intersection(land)

regions['hCrete'] = land.intersection(box(23.4, 34.75, 26.5, 35.8))
nodes('hPalaceAreas', [(37.73,22.76),(37.60,22.80),(37.03,21.69),(38.32,23.32),(37.98,23.73)], .32)
region('hHittite', [(30.0,38.5),(31.4,40.4),(34.0,41.5),(37.0,41.1),(39.1,39.5),(39.3,37.5),
                   (37.9,35.8),(36.1,35.5),(35.2,36.6),(32.0,36.1),(30.0,38.5)])
region('hBabylonia', [(43.0,34.4),(44.8,34.8),(46.3,33.0),(47.8,30.7),(46.7,30.1),(44.1,31.7),(43.0,34.4)])
region('hPhilistia', [(34.19,31.22),(34.46,31.31),(34.85,31.83),(34.80,32.10),(34.42,31.91),(34.19,31.22)])
region('hLaconia', [(22.20,37.20),(22.48,37.37),(22.87,37.31),(23.18,36.85),(23.28,36.41),
                    (22.50,36.35),(22.34,36.70),(22.20,37.20)])
region('hMessenia', [(21.37,37.36),(21.94,37.36),(22.20,37.17),(22.25,36.68),(21.76,36.67),(21.40,36.83),(21.37,37.36)])
region('hAttica', [(23.34,38.07),(23.49,38.29),(23.88,38.30),(24.15,38.18),(24.16,37.57),(23.78,37.66),(23.49,37.88),(23.34,38.07)])
region('hBoeotia', [(22.57,38.26),(22.68,38.59),(23.00,38.68),(23.46,38.62),(23.71,38.40),(23.42,38.20),(22.94,38.12),(22.57,38.26)])
region('hCorinth', [(22.53,38.11),(22.63,37.85),(22.91,37.79),(23.13,37.88),(23.23,38.02),(22.98,38.15),(22.53,38.11)])
region('hMegara', [(23.10,38.02),(23.19,38.21),(23.39,38.17),(23.49,38.05),(23.37,37.92),(23.10,38.02)])
region('hArcadia', [(21.87,37.39),(22.29,37.30),(22.66,37.48),(22.62,37.87),(22.19,37.97),(21.78,37.81),(21.87,37.39)])
region('hElis', [(21.08,37.61),(21.38,38.02),(21.76,38.02),(21.91,37.75),(21.76,37.43),(21.38,37.36),(21.08,37.61)])
region('hArgolis', [(22.70,37.71),(22.67,37.42),(23.10,37.29),(23.52,37.39),(23.21,37.67),(22.70,37.71)])
region('hThessaly', [(21.18,39.13),(21.17,39.66),(21.88,40.04),(22.55,39.99),(23.21,39.55),(23.31,39.08),(22.33,38.87),(21.18,39.13)])
region('hIonia', [(26.30,38.62),(26.69,39.10),(27.23,38.93),(27.70,38.36),(27.81,37.57),(27.22,37.27),(26.63,37.51),(26.30,38.62)])
regions['hSicily'] = land.intersection(box(12.3,36.5,15.7,38.35))
nodes('hSyracuse', [(37.06,15.29)], .40)
union('hSpartaCore','hLaconia','hMessenia')
union('hPeloponnesianAllies','hArcadia','hElis','hCorinth','hMegara')
nodes('hDelianCoasts', [(38.1,24.3),(38.5,24.0),(37.09,25.38),(37.43,25.27),(37.76,26.98),
                      (38.36,26.13),(39.12,26.40),(40.78,24.71),(40.85,25.8),(40.37,26.0),
                      (38.42,26.98),(37.95,27.35),(37.53,27.28),(36.89,27.28),(36.45,28.23)], .24)
nodes('hColonyCoasts', [(37.06,15.29),(37.29,13.59),(40.46,17.24),(39.08,17.12),(40.85,14.05),
                       (36.82,21.71),(37.53,27.28),(41.03,28.98),(42.03,35.15),(44.61,33.49),(46.7,31.9)], .24)
region('hMacedonEarly', [(21.03,40.31),(21.36,41.08),(22.50,41.30),(23.03,40.96),(23.33,40.68),
                        (22.71,40.18),(21.87,40.01),(21.03,40.31)])
region('hThracePhilip', [(24.0,41.0),(25.4,40.7),(26.2,40.6),(26.5,40.8),(26.8,41.3),
                        (28.2,41.5),(28.5,42.0),(27.8,42.65),(24.0,42.4),(24.0,41.0)])
regions['hMacedonPhilip'] = unary_union([shape(base['regions']['macedon']),regions['hThracePhilip']])
region('hGreekMainland', [(19.4,39.9),(20.2,40.1),(21.1,39.95),(21.8,40.0),(22.5,40.03),
                         (23.5,39.6),(24.2,38.7),(24.3,37.5),(23.2,36.0),(21.4,36.3),(20.6,37.2),(19.4,39.9)])
regions['hCorinthianLeague'] = regions['hGreekMainland'].difference(regions['hLaconia']).buffer(0)

# Broad campaign and administrative settings. These are teaching regions,
# not reconstructed frontiers; the scene legends state their meaning.
region('hWestAnatolia', [(26,35.9),(26,40.6),(29.7,41.2),(33,39.6),(33.2,36.1),(30.2,35.7)])
region('hLevantCorridor', [(34.1,31),(35.4,31),(36.4,33.5),(37.4,36.9),(35.5,37),(34.1,31)])
region('hRoyalHeartlands', [(36.5,36.4),(40,37.3),(45.5,37.6),(49.1,36.0),(54.8,31.5),
                           (55,27.5),(50.7,28),(47.5,30),(43,33),(38.5,34.8)])
region('hBactriaSogdiana', [(61,36),(63,40.3),(67,42.1),(71.8,40.7),(71.7,37.3),(68,35),(63.5,34.8)])
region('hIndusCampaign', [(69.5,35.3),(72.1,35.2),(75.8,32.6),(74.9,30.5),(71.2,26.5),
                         (68.5,23.7),(66.7,24.3),(68,28.5),(70.3,32.6)])
region('hGedrosia', [(58.5,27.1),(62,29),(67.4,28.3),(68.3,25.1),(66,24.5),(59,25.2)])
region('hAlexAsia', [(26,36),(26,40.6),(31,41.7),(38,40.2),(42,40.8),(49,39.8),(53,39),
                    (58,38),(63,41),(68,42),(72,40),(72,36),(76,32.5),(75,30.5),(71,26.5),
                    (68.5,23.6),(60,24.6),(56,26.5),(51,28),(48,29.7),(44,32),(39,34),(36,31),(34,31)])
regions['hAlexEmpire'] = unary_union([regions['hAlexAsia'], shape(base['regions']['egypt']),
                                      regions['hMacedonPhilip'], regions['hCorinthianLeague']])
region('hAntigonidCore', [(20.8,40.1),(21,41.3),(23.3,41.5),(24.3,41.1),(24.4,40.2),
                         (23,39.4),(22.4,38.9),(21.2,39.2)])
region('hSeleucidCore', [(35.6,36),(37.5,37.4),(42.2,37.7),(44.4,38),(49,37.5),(54.8,38.2),
                        (60,38.8),(64,41),(69,41.5),(71,39),(68.5,35),(65,33.1),(63,30),
                        (61,27),(57,25.8),(52,27),(48,30),(43,33),(37,34.4),(35.6,36)])
region('hSeleucidAnatolia', [(27.0,37),(28.8,39.2),(31.2,39.8),(34.0,38.4),(36.1,37.2),(34.7,36),(30,36)])
regions['hSeleucidCore'] = unary_union([regions['hSeleucidCore'],regions['hSeleucidAnatolia']])
region('hPtolemaicLevant', [(34,30.8),(35.4,31),(36.2,34.4),(35.5,34.8),(34.4,33),(34,30.8)])
regions['hPtolemaicCore'] = unary_union([shape(base['regions']['egypt']),regions['hPtolemaicLevant'],
                                        land.intersection(box(32.1,34.4,34.7,35.8))])
region('hMauryaNorthwest', [(63.5,29.8),(65,33.2),(68.5,35),(71.5,35.5),(76.5,33),(80,30),
                           (79,23),(72,22),(68,23.6),(65,25.5),(63.5,29.8)])

# Hellenistic scenes use activity areas and regional cores, not fixed borders.
region('hCelticBalkans', [(19.8,45.6),(23.2,46.0),(27.4,44.7),(27.5,42.0),
                         (24.5,40.9),(22.0,40.9),(20.6,42.9)])
region('hBithynia', [(28.7,40.3),(29.2,41.2),(31.4,41.2),(32.1,40.8),(31.1,39.8),(29.6,39.8)])
region('hGalatia', [(30.8,39.2),(31.1,40.1),(32.8,40.7),(34.9,40.5),
                   (35.0,39.5),(33.5,38.6),(31.8,38.7)])
region('hPergamonCore', [(26.6,38.5),(27.8,38.4),(29.0,39.0),(28.9,40.2),(27.0,40.3),(26.3,39.5)])
region('hAetolia', [(20.9,38.3),(21.6,38.3),(22.0,38.65),(21.7,39.15),(20.9,39.0)])
region('hAchaea', [(21.4,38.2),(22.4,38.2),(22.7,38.05),(22.0,37.8),(21.5,37.8)])
nodes('hMegalopolis', [(37.40,22.14)], .16)
union('hAchaeanLeague', 'hAchaea','hCorinth','hArgolis','hMegalopolis')
regions['hUpperEgypt'] = shape(base['regions']['egypt']).intersection(box(29,22,35,28.5))
region('hParthiaEarly', [(53.8,36.2),(55.3,38.7),(58.7,39.0),(60.2,37.2),(58.2,35.1),(55.2,35.2)])
region('hParthiaWest', [(43.1,34.8),(45.3,37.1),(49.4,37.2),(54.8,38.3),(58.7,39),
                       (60.2,37.1),(58.6,34.4),(53.0,32),(48.4,32),(46.7,30.1),(44.0,31.7)])
region('hSeleucidSyria', [(35.4,33.2),(36.4,33.1),(39.2,35.7),(38.3,37.1),(36,37.1),(35.4,35.3)])

def rounded(g):
    assert not g.is_empty and g.is_valid
    def coords(c):
        if isinstance(c[0], (float,int)): return [round(x,4) for x in c]
        return [coords(x) for x in c]
    m=mapping(g);return {'type':m['type'],'coordinates':coords(m['coordinates'])}

Path('history_geo.json').write_text(json.dumps({k:rounded(g) for k,g in regions.items()},separators=(',',':')))
print(f'{len(regions)} history areas; all valid and clipped to coastlines')
