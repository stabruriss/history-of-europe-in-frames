"""Add western-Mediterranean geography (chapter 5 directory entries) to the atlas data.

Usage: <python with shapely + pyshp> build_west_geo.py <dir holding ne_10m_rivers_lake_centerlines/>
- Rivers: Seine, Marne, Loire, Garonne, Thames, Tagus, Douro, Guadalquivir, Moulouya from Natural Earth 10m
  lake centerlines, written into data.json rivers (labels are placed per entry in template.html).
- Areas (history_geo.json, prefix g): Italy's regions in the late Republic, partitioned so they share borders;
  Caesar's three parts of Gaul; Roman Britain; the Iberian peninsula; Mauretania; and the provinces of 27 BC
  that no earlier script drew. Teaching regions only, not reconstructed frontiers. Points are (lon, lat).
"""
import json, sys
from pathlib import Path
import shapefile
from shapely.geometry import shape, mapping, Polygon, box
from shapely.ops import unary_union, linemerge

base = json.loads(Path('data.json').read_text())
geo = json.loads(Path('history_geo.json').read_text())
land = shape(base['land']).buffer(0)
regions = {}

# ---------- rivers ----------
NE = Path(sys.argv[1]) / 'ne_10m_rivers_lake_centerlines' / 'ne_10m_rivers_lake_centerlines'
RIVERS = {'seine':(['Seine'],'塞纳河'), 'marne':(['Marne'],'马恩河'), 'loire':(['Loire'],'卢瓦尔河'),
          'garonne':(['Garonne'],'加龙河'), 'thames':(['Thames'],'泰晤士河'), 'tagus':(['Tajo','Tejo'],'塔霍河'),
          'douro':(['Duero'],'杜罗河'), 'baetis':(['Guadalquivir'],'瓜达尔基维尔河'), 'moulouya':(['Moulouya'],'穆卢耶河')}
segs = {k: [] for k in RIVERS}
for sr in shapefile.Reader(str(NE)).iterShapeRecords():
    for k, (names, _) in RIVERS.items():
        if sr.record['name'] in names:
            segs[k].append(shape(sr.shape.__geo_interface__))
def rnd(g):
    m = mapping(g)
    def fix(c): return [round(c[0], 3), round(c[1], 3)] if isinstance(c[0], float) else [fix(x) for x in c]
    return {'type': m['type'], 'coordinates': fix(m['coordinates'])}
for k, parts in segs.items():
    assert parts, k
    u = unary_union(parts); g = linemerge(u) if u.geom_type == 'MultiLineString' else u
    base['rivers'][k] = {'zh': RIVERS[k][1], 'geom': rnd(g.simplify(0.008))}
# Labels for these rivers are drawn per entry (template.html), so each map can place them clear of its pins.

# ---------- Italy, partitioned ----------
italy = shape(base['regions']['italyModern']).buffer(0)
italy = italy.difference(box(12.2, 36.5, 15.8, 38.32)).difference(box(7.9, 38.7, 10.0, 41.4)).difference(box(8.4, 41.3, 9.7, 43.1))
PO = [(7.05,44.68),(7.68,45.07),(8.45,45.13),(9.18,45.12),(9.6,45.06),(10.02,45.12),(10.6,45.02),(11.0,45.05),(11.6,44.88),(12.4,44.97)]
CREST = [(9.6,44.45),(9.9,44.4),(10.3,44.3),(11.0,44.15),(11.7,43.95),(12.07,43.79)]
TIBER = [(12.07,43.79),(12.14,43.57),(12.30,43.3),(12.39,43.07),(12.41,42.78),(12.39,42.46),(12.55,42.2),(12.50,41.95),(12.48,41.89),(12.25,41.74)]
ITALY = [  # order matters: later pieces only take what earlier ones left
  ('gTranspadana', [(6.0,44.5)] + PO + [(12.9,45.0),(14.2,45.6),(14.2,47.3),(6.0,47.3)]),
  ('gLiguria', [(6.0,43.0),(6.0,44.5)] + PO[:5] + [(9.45,44.75),(9.6,44.45),(9.9,44.4),(9.97,44.05),(9.8,43.4)]),
  ('gAemilia', PO[4:] + [(12.9,44.9),(12.7,44.2),(12.44,44.16),(12.2,43.95)] + CREST[::-1] + [(9.45,44.75)]),
  ('gEtruria', [(9.97,44.05)] + CREST[1:] + TIBER[1:] + [(12.0,41.4),(9.9,42.0),(9.6,43.5)]),
  ('gUmbria', [(12.07,43.79),(12.2,43.95),(12.44,44.16),(12.7,44.4),(13.7,43.75),(13.38,43.63),(12.95,43.35),(13.05,42.95),
               (12.9,42.75),(12.65,42.56),(12.39,42.46)] + TIBER[1:5][::-1]),
  ('gPicenum', [(13.38,43.63),(13.7,43.75),(14.5,42.6),(14.15,42.5),(13.55,42.55),(13.25,42.7),(13.05,42.95),(12.95,43.35)]),
  ('gLatium', [(12.25,41.74),(12.48,41.89),(12.50,41.95),(12.80,41.96),(13.0,41.95),(13.3,41.85),(13.6,41.7),(13.9,41.5),
               (13.95,41.35),(13.77,41.22),(13.5,40.9),(12.0,41.4)]),
  ('gCampania', [(13.77,41.22),(13.95,41.35),(14.2,41.4),(14.45,41.2),(14.6,41.0),(14.7,40.85),(14.95,40.65),(15.0,40.5),
                 (14.95,40.48),(14.6,40.1),(13.4,40.5),(13.5,40.9)]),
  ('gApulia', [(15.27,41.92),(15.5,42.1),(16.3,42.05),(19.0,40.3),(18.7,39.5),(17.1,40.15),(16.87,40.42),(16.6,40.5),(16.2,40.7),
               (15.7,40.8),(15.3,40.95),(15.25,41.1),(15.1,41.35),(15.0,41.65)]),
  ('gLucania', [(15.0,40.5),(15.3,40.75),(15.3,40.95),(15.7,40.8),(16.2,40.7),(16.6,40.5),(16.87,40.42),(17.1,40.15),(16.52,39.72),
                (15.79,39.9),(15.3,39.9),(14.6,40.1),(14.95,40.48)]),
  ('gBruttium', [(15.79,39.9),(16.52,39.72),(17.1,40.15),(17.6,38.8),(16.4,37.6),(15.55,37.85),(15.62,38.3),(15.3,38.6),(15.3,39.9)]),
  # Regio IV: Sabines, Marsi, Paeligni, Vestini, Frentani and the Samnites proper; takes the mountain remainder.
  ('gSamnium', [(12.39,42.46),(12.65,42.56),(12.9,42.75),(13.05,42.95),(13.25,42.7),(13.55,42.55),(14.15,42.5),(14.5,42.6),
                (15.5,42.1),(15.27,41.92),(15.0,41.65),(15.1,41.35),(15.25,41.1),(15.3,40.95),(15.3,40.75),(15.0,40.5),
                (14.95,40.65),(14.7,40.85),(14.6,41.0),(14.45,41.2),(14.2,41.4),(13.95,41.35),(13.9,41.5),(13.6,41.7),
                (13.3,41.85),(13.0,41.95),(12.80,41.96),(12.50,41.95),(12.55,42.2)]),
]
taken = Polygon()
for name, pts in ITALY:
    piece = Polygon(pts).buffer(0).intersection(italy).difference(taken)
    regions[name] = piece; taken = taken.union(piece)
left = italy.difference(taken)
for part in getattr(left, 'geoms', [left]):  # slivers between hand-drawn borders go to the neighbour sharing most edge
    if part.is_empty or part.area < 1e-7: continue
    best = max(regions, key=lambda k: regions[k].buffer(1e-4).intersection(part.buffer(1e-4)).area)
    regions[best] = regions[best].union(part)
print('Italy leftover merged:', round(left.area, 4), 'of', round(italy.area, 2))

# ---------- Gaul: Caesar's three parts of Gallia Comata ----------
comata = shape(geo['hGaulComata']).buffer(0)
GARONNE = [(-1.1,45.6),(-0.58,44.84),(-0.2,44.55),(0.62,44.2),(1.1,43.95),(1.44,43.6),(1.1,43.2),(0.7,42.7)]
SEINE_MARNE = [(0.1,49.45),(1.1,49.44),(2.35,48.85),(2.88,48.96),(3.4,49.04),(3.95,49.04),(4.36,48.96),(4.58,48.72),(4.95,48.64),
               (5.14,48.1),(5.33,47.85),(6.2,48.0),(7.0,48.2),(7.9,48.3)]
regions['gAquitani'] = comata.intersection(Polygon([(-4,43.0),(-4,46.2)] + GARONNE + [(-2,42.5)]).buffer(0))
regions['gBelgae'] = comata.intersection(Polygon([(-1.5,49.8)] + SEINE_MARNE + [(9.5,49.0),(9.5,53),(-1.5,53)]).buffer(0))
regions['gCeltae'] = comata.difference(regions['gAquitani']).difference(regions['gBelgae'])

# ---------- Britain, Iberia, Mauretania ----------
regions['gBritannia'] = land.intersection(Polygon([(-6.6,49.8),(-5.6,50.0),(-5.5,51.6),(-4.9,52.2),(-4.8,53.0),(-4.7,53.5),(-4.0,54.0),
    (-3.6,54.6),(-3.4,54.95),(-3.05,55.0),(-1.6,55.0),(-1.3,55.1),(0.0,54.0),(2.0,53.0),(2.0,51.0),(1.5,50.6),(-2.0,50.3)]))
regions['gCaledonia'] = land.intersection(Polygon([(-3.05,55.0),(-1.6,55.0),(-1.3,55.1),(-1.4,56.5),(-1.0,59.0),(-8.0,59.0),
    (-7.0,56.5),(-5.6,55.2),(-4.9,54.6),(-3.6,54.6),(-3.4,54.95)]))
regions['gIberia'] = land.intersection(Polygon([(-10.5,35.8),(-5.6,35.95),(-2.0,36.6),(0.6,38.5),(0.5,40.0),(1.5,41.0),(3.5,41.8),
    (3.3,42.45),(1.7,42.5),(0.7,42.72),(-0.7,42.85),(-1.8,43.35),(-1.9,43.8),(-10.5,44.2)]))
regions['gMauretania'] = land.intersection(Polygon([(-2.3,35.2),(-5.35,36.0),(-6.1,35.8),(-10.0,31.8),(-10.0,30.6),(-6.0,31.4),
    (-3.5,32.6),(-2.2,33.7),(-2.2,34.6)]))
regions['gAfricaNova'] = shape(geo['hNumidia']).buffer(0).intersection(box(6.3, 33, 11, 37.5))  # eastern Numidia, 46 BC

# ---------- the rest of the 27 BC provinces ----------
regions['gMacedonia'] = land.intersection(Polygon([(19.3,40.0),(19.4,41.9),(20.6,42.2),(22.4,42.3),(24.0,41.6),(26.0,41.0),(26.0,40.3),
    (23.0,39.7),(22.7,39.0),(20.6,39.1)])).union(shape(geo['hGreekMainland']).buffer(0)).buffer(0)
west = shape(geo['hWestAnatolia']).buffer(0)
regions['gAsia'] = west.difference(shape(geo['hBithynia']).buffer(0)).difference(box(29.2, 35.9, 31.2, 36.9)).intersection(box(25, 36.3, 31.6, 40.6))
regions['gBithyniaPontus'] = shape(geo['hBithynia']).buffer(0).union(shape(geo['hPontus']).buffer(0).intersection(box(31.5, 40.6, 36.6, 42.3)))
regions['gCilicia'] = land.intersection(Polygon([(30.4,36.85),(30.8,37.3),(32.0,37.25),(33.5,37.3),(35.0,37.4),(36.0,37.2),(36.4,36.8),
    (36.0,36.3),(34.0,35.9),(32.5,35.8),(31.0,36.5)]))
regions['gCyprus'] = land.intersection(box(32.2, 34.5, 34.7, 35.75))
regions['gCyrenaica'] = land.intersection(Polygon([(19.8,30.2),(20.0,32.4),(21.5,33.1),(23.3,32.8),(25.2,31.7),(25.1,29.6),(20.0,29.6)]))
regions['gIllyricum'] = land.intersection(Polygon([(13.6,45.6),(14.6,45.3),(15.6,44.3),(16.6,43.5),(18.0,42.8),(19.4,41.9),(19.7,42.3),
    (18.8,43.1),(17.6,43.9),(16.3,44.7),(15.3,45.5),(14.2,45.8)]))

def rounded(g):
    g = g.simplify(.01, preserve_topology=True).buffer(0)
    assert not g.is_empty and g.is_valid, g
    def coords(c):
        if isinstance(c[0], (float, int)): return [round(x, 4) for x in c]
        return [coords(x) for x in c]
    m = mapping(g); return {'type': m['type'], 'coordinates': coords(m['coordinates'])}

geo.update({k: rounded(g) for k, g in regions.items()})
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
Path('data.json').write_text(json.dumps(base, ensure_ascii=False, separators=(',', ':')))
print(len(regions), 'areas;', {k: round(g.area, 2) for k, g in regions.items()})
print('rivers', sorted(RIVERS))
