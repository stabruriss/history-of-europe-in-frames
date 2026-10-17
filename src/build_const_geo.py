"""Add the Constantine-era and Hunnic teaching areas (chapter 6 history scenes) to history_geo.json.

Usage: <python with shapely> build_const_geo.py   (run after build_empire_geo.py; it reads eEmpire300 and eGallic271)
- eConst306: Constantine's share 306-312 (Britain, Gaul, the Rhine provinces, Spain with Mauretania Tingitana).
- eMaxent306: Maxentius's share 306-312 (Italy with Sicily, Sardinia and Corsica; Africa from Mauretania Caesariensis to Tripolitania).
- eConst317 / eLic317: the split of 317-324. Licinius kept Thrace, Moesia Inferior and Scythia, Asia Minor,
  the East, Egypt and Cyrenaica; Constantine took the rest of the Balkans, Greece and Crete.
- eChrist300: where Christians were thickest around 300 (Asia Minor, Syria and Edessa, Egypt, Africa, Rome), as blobs round the cities.
- eHuns450: the Hunnic power around 450 outside the empire (the Tisza plain and the Pontic steppe to the Volga).
Teaching regions only, not reconstructed frontiers. Points are (lon, lat).
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon, box, Point
from shapely.ops import unary_union

base = json.loads(Path('data.json').read_text())
geo = json.loads(Path('history_geo.json').read_text())
land = shape(base['land']).buffer(0)
italy = shape(base['regions']['italyModern']).buffer(0)
G = lambda k: shape(geo[k]).buffer(0)
empire300 = G('eEmpire300')
regions = {}

# ---------- 306-312: the two western shares ----------
TINGITANA = box(-10, 30, -2.3, 36.3)
regions['eConst306'] = unary_union([G('eGallic271'), empire300.intersection(G('gIberia').buffer(.05)), empire300.intersection(TINGITANA)])
AFRICA = box(-2.3, 28, 19.2, 37.6)
regions['eMaxent306'] = unary_union([italy, G('hSicily'), G('hSardCorsica'), empire300.intersection(AFRICA)])

# ---------- 317-324: Constantine and Licinius ----------
# West of the Utus and the Nestos in the Balkans, west of Rhodes in the Aegean (Crete stays west), west of Cyrenaica in Africa.
WEST317 = Polygon([(24.6,60),(24.6,43.7),(24.5,42.7),(24.1,41.6),(24.7,40.85),(25.3,39.5),(24.9,38.3),(26.6,35.8),
                   (26.6,34.6),(19.0,32.0),(19.0,15),(-20,15),(-20,60)])
regions['eConst317'] = empire300.intersection(WEST317)
regions['eLic317'] = empire300.difference(WEST317)

# ---------- about 300: where Christians were thickest (cities and their hinterlands, after the usual maps of the spread) ----------
CHRIST = [(27.3,38.0,2.0),(29.9,38.4,1.8),(29.9,40.6,1.3),(32.9,39.9,1.0),(35.5,38.7,1.2),(36.2,36.2,1.4),(38.8,37.2,1.1),
          (34.9,32.5,.7),(29.9,31.0,1.0),(30.8,28.3,.8),(32.6,26.0,.7),(10.2,36.6,1.4),(7.0,36.0,1.3),(12.5,41.9,.9)]
regions['eChrist300'] = unary_union([Point(lo, la).buffer(r, 32) for lo, la, r in CHRIST]).intersection(empire300)

# ---------- about 450: the Huns north of the Danube and the Black Sea ----------
HUNS = Polygon([(16.5,48.6),(22.0,49.6),(30.0,50.6),(40.0,50.2),(47.0,48.5),(47.0,45.0),(40.5,46.5),(37.5,45.2),(35.5,45.4),
                (33.0,46.1),(30.2,45.6),(28.3,45.4),(22.4,44.6),(19.4,45.1),(18.6,45.9),(17.0,46.6)])
regions['eHuns450'] = land.intersection(HUNS).difference(empire300.buffer(.05))

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
