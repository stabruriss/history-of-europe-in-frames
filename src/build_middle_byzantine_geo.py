"""Add middle-Byzantine teaching areas (c. 680-1056) to history_geo.json.

Usage: <python with shapely> build_middle_byzantine_geo.py   (run after build_early_medieval_geo.py; it reads its areas)
- mThemeOpsikion, mThemeThrakesion, mThemeAnatolikon, mThemeArmeniakon: the four first themes of Asia Minor about 700,
  where the old field armies were quartered (the Opsician guard in the north-west, the Thracesians in the west,
  the Anatolics in the centre and south, the Armeniacs in the north-east).
- mBulgars681: Asparukh's Bulgar state between the lower Danube and the Balkan range after 681.
- mByz842: the empire about 842 (Crete gone, most of Sicily gone, Greece regained).
- mByz1025: the empire at Basil II's death (the Balkans to the Danube, Armenia and Iberia, Antioch and Cilicia,
  Crete and Cyprus, Apulia and Calabria).
- mSamuel1000: Samuel's Bulgaria about 1000 (Macedonia, Albania, the western Balkans).
- mRus1000: the Rus' of Kiev about 1000 (the Dnieper to Novgorod).
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

# ---------- the first themes of Asia Minor, about 700 ----------
asia = G('eEast395').intersection(box(26.0, 35.8, 41.6, 42.3))
OPSIKION = [(26.0,39.7),(26.4,40.7),(29.0,41.3),(31.5,41.4),(34.0,42.1),(35.2,41.8),(34.4,40.0),(33.0,39.3),(30.6,39.5),(28.2,39.6)]
THRAKESION = [(26.0,39.7),(28.2,39.6),(30.6,39.5),(30.3,38.4),(29.7,37.3),(28.9,36.5),(27.2,36.6),(26.0,37.0)]
ANATOLIKON = [(29.7,37.3),(30.3,38.4),(30.6,39.5),(33.0,39.3),(34.4,40.0),(35.4,38.4),(35.2,37.2),(34.0,36.3),(32.5,36.0),(30.6,36.1),(29.4,36.3),(28.9,36.5)]
ARMENIAKON = [(34.4,40.0),(35.2,41.8),(36.6,41.9),(38.6,41.2),(41.6,41.6),(41.6,40.0),(40.4,39.0),(38.8,38.4),(37.0,38.2),(35.4,38.4)]
for k, pts in [('mThemeOpsikion', OPSIKION), ('mThemeThrakesion', THRAKESION), ('mThemeAnatolikon', ANATOLIKON), ('mThemeArmeniakon', ARMENIAKON)]:
    regions[k] = asia.intersection(Polygon(pts)).buffer(0)

# ---------- the Bulgars ----------
regions['mBulgars681'] = L([(25.6,43.7),(27.0,44.1),(28.0,44.2),(28.7,45.2),(29.7,45.25),(28.9,44.4),(28.6,43.5),(28.0,42.9),(27.0,42.8),(25.8,42.9)])
regions['mSamuel1000'] = L([(19.4,40.6),(19.5,42.1),(19.3,43.0),(20.4,43.6),(21.6,44.3),(22.6,44.2),(23.4,43.6),(24.3,43.2),(24.0,42.5),(23.4,41.6),
                            (22.9,41.0),(22.2,40.5),(21.4,39.9),(20.4,39.8)])

# ---------- the empire about 842 and at Basil II's death ----------
west_sicily = box(12.0, 36.5, 14.6, 38.5)
regions['mByz842'] = G('mByz780').difference(west_sicily)
EAST1025 = L([(35.7,35.4),(36.1,34.9),(36.6,35.6),(37.0,36.4),(37.9,36.9),(38.6,37.4),(39.6,38.0),(41.0,38.4),(42.4,38.2),(43.6,38.2),(44.2,38.9),
              (44.0,39.6),(43.3,40.4),(43.0,41.5),(41.6,41.7),(41.6,40.0),(40.4,39.0),(38.8,38.4),(37.0,38.0),(35.4,37.0),(34.5,36.4)])
BALKANS1025 = L([(19.3,40.1),(19.4,41.8),(19.0,43.0),(19.2,44.9),(21.2,44.8),(22.5,44.6),(23.6,43.85),(25.3,43.65),(27.0,44.1),(28.5,44.3),
                 (29.7,45.2),(28.7,43.6),(28.0,42.5),(28.2,42.0),(29.5,41.3),(29.2,40.9),(28.0,40.9),(26.0,40.3),(24.3,40.9),(23.2,40.3),
                 (22.6,39.6),(23.2,38.3),(24.2,38.0),(23.2,36.4),(22.4,36.3),(21.6,36.7),(21.0,37.6),(21.2,38.6),(20.6,39.2),(20.0,39.6)])
ITALY1025 = L([(15.0,41.9),(16.1,41.6),(16.9,41.1),(18.0,40.65),(18.55,40.15),(18.4,39.8),(17.2,39.1),(16.6,38.4),(16.0,37.9),(15.6,38.0),
               (15.7,38.9),(15.6,39.6),(15.4,40.2),(15.6,40.8),(15.0,41.2),(14.9,41.6)])
CRETE = land.intersection(box(23.4, 34.8, 26.4, 35.75))
CYPRUS = land.intersection(box(32.2, 34.5, 34.7, 35.75))
CHERSON = L([(32.5,44.4),(33.3,45.3),(34.0,44.9),(33.6,44.4)])
regions['mByz1025'] = unary_union([asia, EAST1025, BALKANS1025, ITALY1025, CRETE, CYPRUS, CHERSON, G('mByz780').intersection(box(26.0, 35.8, 30.0, 40.0))])

# ---------- the Rus' ----------
regions['mRus1000'] = L([(23.6,50.2),(24.6,52.6),(26.2,54.6),(27.8,56.6),(29.5,59.4),(32.8,60.4),(36.8,58.6),(39.6,57.0),(38.2,54.2),(36.6,52.0),
                         (34.6,50.2),(32.6,49.4),(30.6,49.2),(28.0,49.4),(25.0,49.4)])


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
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print(len(regions), 'areas;', {k: round(g.area, 1) for k, g in regions.items()})
