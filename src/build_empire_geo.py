"""Add Roman-Empire teaching areas (chapter 6 history scenes) to history_geo.json.

Usage: <python with shapely> build_empire_geo.py
Areas (prefix e) are cut from the base map's romanEmpire (AD 117) and land outline:
- eEmpire14: the empire Augustus left (117 minus Britain, Mauretania, Thrace, Cappadocia, Arabia, Dacia, Agri Decumates).
- eEmpire96: the Flavian empire (117 minus Dacia and Arabia).
- eGermania9: the land between Rhine and Elbe lost in AD 9.
- eEmpire300: the empire after Dacia and the Agri Decumates were given up (c. 260-275).
- eGallic271 / ePalmyra271 / eCentral271: the three-way split around 271.
- eWest395 / eEast395: the division of 395 along SPLIT_395 (template.html).
- e476*: the West in 476 (Visigoths, Suebi, Franks, Soissons, Burgundians, Vandals, Odoacer's Italy).
Teaching regions only, not reconstructed frontiers. Points are (lon, lat).
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon, box
from shapely.ops import unary_union

base = json.loads(Path('data.json').read_text())
geo = json.loads(Path('history_geo.json').read_text())
land = shape(base['land']).buffer(0)
empire117 = shape(base['regions']['romanEmpire']).buffer(0)
italy = shape(base['regions']['italyModern']).buffer(0)
G = lambda k: shape(geo[k]).buffer(0)
regions = {}

# ---------- what Augustus did not yet hold ----------
BRITAIN = Polygon([(-7,49.5),(-1,50.4),(0.5,50.6),(1.1,50.85),(1.5,51.2),(2.2,51.6),(2.2,56),(-8,56)])
MAURETANIA = Polygon([(-10,27),(6.3,27),(6.3,37.2),(0,36.2),(-2,35.5),(-5.0,35.92),(-6.5,35.85),(-10,35.8)])
DACIA = Polygon([(20.3,49),(20.3,45.12),(20.55,44.86),(20.88,44.69),(21.41,44.8),(21.86,44.72),(22.18,44.54),(22.7,44.65),
                 (22.6,44.33),(23.02,44.05),(23.3,43.91),(24.16,43.77),(25.25,43.72),(25.78,43.75),(26.15,44.03),(27.1,44.17),
                 (27.4,44.2),(27.8,44.5),(27.9,45.1),(28.2,45.45),(29.8,45.45),(30.5,46),(30.5,49)])
AGRI_DECUMATES = Polygon([(7.62,47.62),(8.6,47.68),(9.0,47.9),(10.0,48.45),(11.8,48.9),(11.8,49.2),(10.5,49.3),(9.6,49.6),
                          (9.2,50.1),(8.9,50.5),(8.4,50.4),(8.3,50.0),(8.48,49.3),(8.23,49.0),(7.83,48.6),(7.6,48.1)])
THRACE = box(24.6, 40.6, 29.0, 42.7)
CAPPADOCIA = Polygon([(34.6,37.3),(42,37.3),(42,41.8),(35.5,41.8),(35.5,40.3),(34.6,40.3)])
ARABIA = Polygon([(34.25,31.3),(35.0,31.5),(35.5,32.3),(37.5,32.6),(39.5,32.0),(39.5,25.5),(36.5,25.5),(34.9,29.5)])
regions['eEmpire14'] = empire117.difference(unary_union([BRITAIN, MAURETANIA, DACIA, AGRI_DECUMATES, THRACE, CAPPADOCIA, ARABIA]))
regions['eEmpire96'] = empire117.difference(DACIA).difference(ARABIA)  # the Flavian empire: Britain, Thrace, Cappadocia, Agri Decumates in
regions['eGermania9'] = land.intersection(Polygon([(8.3,50.0),(7.6,50.4),(7.0,50.9),(6.75,51.45),(6.2,51.85),(5.9,52.6),(6.2,53.6),
    (8.6,54.2),(9.0,53.9),(10.0,53.5),(11.6,52.6),(11.8,51.9),(11.0,51.0),(9.5,50.4)]))

# ---------- the third century ----------
empire300 = empire117.difference(DACIA).difference(AGRI_DECUMATES)
regions['eEmpire300'] = empire300
regions['eGallic271'] = empire300.intersection(box(-11, 42.3, 8.6, 60)).difference(G('gIberia').buffer(.05)).difference(italy).difference(G('hSardCorsica').buffer(.05))
palmyra = unary_union([box(24.6, 20, 45, 31.9), box(33.6, 31.9, 45, 37.5), box(31.5, 36.6, 42, 40.2)])
regions['ePalmyra271'] = empire300.intersection(palmyra).difference(G('gCyprus').buffer(.05))
regions['eCentral271'] = empire300.difference(regions['eGallic271']).difference(regions['ePalmyra271'])

# ---------- 395: west of the line Theodosius' sons divided along ----------
WEST = Polygon([(19.1,60),(19.1,45.0),(19.3,44.2),(19.4,43.5),(19.0,42.6),(18.9,42.0),(18.5,38.0),(18.9,30.4),(18.9,15),(-20,15),(-20,60)])
regions['eWest395'] = empire300.intersection(WEST)
regions['eEast395'] = empire300.difference(WEST)

# ---------- 476 ----------
west = regions['eWest395']
iberia = G('gIberia')
regions['e476Suebi'] = iberia.intersection(Polygon([(-10,41.0),(-6.3,41.0),(-6.0,42.0),(-6.6,43.6),(-10,44.2)]))
LOIRE_RHONE = [(0.7,47.4),(1.9,47.9),(2.95,47.1),(3.2,46.2),(4.0,45.4),(4.85,44.9),(4.75,44.0),(5.9,43.75),(6.5,44.2)]
visi_gaul = land.intersection(Polygon([(-5,47.4)] + LOIRE_RHONE + [(7.0,43.4),(6.5,42.5),(3.2,42.4),(-1.8,43.3),(-5,43.6)]))
regions['e476Visigoths'] = unary_union([iberia.difference(regions['e476Suebi']), visi_gaul])
regions['e476Burgundians'] = land.intersection(Polygon(LOIRE_RHONE[2:] + [(6.6,44.6),(6.9,45.2),(7.0,45.9),(7.4,46.8),(6.8,47.6),
    (5.3,48.0),(3.8,47.6)])).difference(regions['e476Visigoths'])
regions['e476Soissons'] = land.intersection(Polygon([(-1.6,49.8),(1.6,50.2),(3.0,50.1),(4.5,49.9),(5.0,48.8),(4.2,48.0),(3.8,47.6),
    (2.95,47.1),(1.9,47.9),(0.7,47.4),(-1.2,47.4),(-1.6,48.6)])).difference(regions['e476Burgundians'])
regions['e476Franks'] = land.intersection(Polygon([(1.6,50.2),(3.0,50.1),(4.5,49.9),(5.8,49.5),(6.6,49.4),(7.6,50.2),(9.5,50.4),
    (9.5,53.6),(7.0,53.7),(4.5,52.8),(3.0,51.6),(1.5,51.2)]))
regions['e476Vandals'] = unary_union([west.intersection(box(-1.5, 28, 18.95, 37.6)), G('hSardCorsica'),
                                      land.intersection(box(1.1, 38.6, 4.4, 40.1))])
regions['e476Odoacer'] = unary_union([italy, G('hSicily')]).difference(G('hSardCorsica').buffer(.05))  # Sardinia and Corsica were Vandal

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
