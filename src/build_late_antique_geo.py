"""Add late-antique teaching areas (West after 476, East Rome under Justinian, Parthians and Sasanians) to history_geo.json.

Usage: <python with shapely> build_late_antique_geo.py   (run after build_empire_geo.py; it reads e476* and eEast395)
- lOstrogoths510: Theodoric's realm about 510 (Italy with Sicily, Dalmatia, the Alpine provinces, Provence after 508).
- lVisigoths510: the Visigoths after Vouillé (Spain without the Suebi, plus Septimania).
- lFranks511: Clovis's kingdom at his death (Gaul north of the Loire, Aquitaine taken in 507, the Rhineland and Alamannia).
- lSpania: the Byzantine foothold in south-eastern Spain from 552 (coast from Cartagena to the Strait).
- lVisigoths600: Spain after the Suebi fell (585), less Spania, plus Septimania.
- lJustinian565: the empire at Justinian's death (the East, Africa with the islands, Italy, Dalmatia, Spania).
- lParthia1: the Parthian realm about the turn of the era, Euphrates to Arachosia.
- lSasanian560: Iran under Khosrow I, from the Dara-Nisibis frontier to the Oxus, with Persarmenia and the Caucasus.
- lHephthalites500: the Hephthalite power about 500 (Bactria, Sogdiana, the Kabul valley and Gandhara).
Teaching regions only, not reconstructed frontiers. Points are (lon, lat).
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon, box
from shapely.ops import unary_union

base = json.loads(Path('data.json').read_text())
geo = json.loads(Path('history_geo.json').read_text())
land = shape(base['land']).buffer(0)
italy = shape(base['regions']['italyModern']).buffer(0)
G = lambda k: shape(geo[k]).buffer(0)
regions = {}

# ---------- the West about 510 ----------
DALMATIA = land.intersection(Polygon([(13.4,45.7),(15.2,45.5),(16.8,45.2),(19.1,45.0),(19.3,44.2),(19.4,43.5),(19.0,42.6),
                                      (18.4,42.3),(17.2,42.9),(15.9,43.5),(14.4,44.9)]))
ALPS = land.intersection(Polygon([(9.4,46.3),(10.5,47.3),(12.3,47.6),(13.6,47.3),(15.5,46.9),(16.6,46.5),(16.3,45.7),(13.6,45.7),
                                  (12.4,46.1),(10.4,46.3)])).difference(italy)
PROVENCE = land.intersection(Polygon([(4.6,43.25),(4.8,44.1),(5.6,44.4),(6.3,44.9),(7.0,45.2),(7.6,44.1),(7.5,43.7),(6.2,42.9)]))
regions['lOstrogoths510'] = unary_union([italy, G('hSicily'), DALMATIA, ALPS, PROVENCE]).difference(G('hSardCorsica').buffer(.05))

SEPTIMANIA = land.intersection(Polygon([(1.7,42.35),(3.25,42.3),(3.6,43.25),(4.55,43.35),(4.45,44.05),(3.3,44.1),(2.3,43.65),(1.55,43.2)]))
iberia = G('gIberia')
suebi = G('e476Suebi')
regions['lVisigoths510'] = unary_union([iberia.difference(suebi.buffer(.02)), SEPTIMANIA])

GAUL = land.intersection(Polygon([(-5.2,48.6),(-4.5,47.6),(-1.9,46.4),(-1.6,43.4),(0.5,42.7),(1.7,42.35),(1.55,43.2),(2.3,43.65),
                                  (3.3,44.1),(4.45,44.05),(4.8,44.1),(5.6,44.4),(6.3,44.9),(7.0,45.9),(7.7,47.6),(9.6,47.6),(10.2,48.6),
                                  (9.5,50.4),(9.5,53.6),(7.0,53.7),(4.5,52.8),(3.0,51.6),(1.5,51.2),(-1.6,49.8)]))
regions['lFranks511'] = GAUL.difference(SEPTIMANIA.buffer(.02)).difference(G('e476Burgundians').buffer(.02)).difference(PROVENCE.buffer(.02))

regions['lSpania'] = land.intersection(Polygon([(-6.3,36.1),(-6.0,36.6),(-5.3,37.2),(-4.5,37.5),(-3.0,37.75),(-1.6,38.25),(-0.45,38.4),
                                                (-0.6,37.6),(-1.1,37.3),(-2.0,36.6),(-4.4,36.55),(-5.3,35.95)]))
regions['lVisigoths600'] = unary_union([iberia.difference(regions['lSpania'].buffer(.02)), SEPTIMANIA])

# ---------- the empire at Justinian's death, 565 ----------
regions['lJustinian565'] = unary_union([G('eEast395'), G('e476Vandals'), italy, G('hSicily'), DALMATIA, regions['lSpania']])

# ---------- Iran ----------
PARTHIA = Polygon([(38.0,37.1),(38.4,36.0),(40.7,34.7),(42.5,33.5),(44.3,32.5),(46.5,31.0),(48.0,30.0),(50.0,29.2),(51.5,27.8),
                   (54.0,26.6),(57.0,26.0),(59.5,25.3),(62.0,25.0),(64.5,25.2),(66.0,27.5),(67.0,30.5),(66.0,32.5),(63.5,34.0),
                   (62.0,35.0),(62.6,37.6),(60.0,38.5),(56.5,38.2),(54.0,37.4),(53.0,36.8),(50.5,37.2),(49.0,38.3),(47.0,38.6),
                   (45.0,38.0),(43.5,37.5),(42.0,37.2),(40.5,37.3)])
regions['lParthia1'] = land.intersection(PARTHIA)
SASANIAN = Polygon([(41.1,37.3),(42.5,37.8),(43.5,38.3),(43.6,39.6),(43.0,41.2),(44.5,41.8),(46.3,41.9),(47.6,42.4),(48.4,42.1),
                    (50.0,40.0),(50.5,37.2),(53.0,36.8),(54.0,37.4),(56.5,38.2),(60.0,38.5),(63.0,38.6),(65.5,38.0),(68.0,37.3),
                    (68.5,35.5),(66.5,33.5),(66.0,31.0),(64.5,25.2),(62.0,25.0),(59.5,25.3),(57.0,26.0),(54.0,26.6),(51.5,27.8),
                    (50.0,29.2),(48.0,30.0),(46.5,31.0),(44.3,32.5),(42.5,33.5),(40.9,34.6),(40.6,35.2),(41.1,36.3)])
regions['lSasanian560'] = land.intersection(SASANIAN)
regions['lHephthalites500'] = land.intersection(Polygon([(61.0,37.5),(63.0,40.5),(68.0,42.0),(72.0,41.0),(75.0,38.0),(74.5,34.0),
                                                         (71.5,32.5),(68.5,33.5),(66.0,34.5),(63.0,35.5)]))

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
