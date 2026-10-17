# -*- coding: utf-8 -*-
"""Build geo data for the ancient-Mediterranean concept map.

Hand-drawn historical rings (lon, lat) are clipped to Natural Earth 10m land
(or have land subtracted, for seas), simplified, and written to data.json.
All ancient boundaries are schematic.
"""
import json, math
import shapefile
from shapely.geometry import shape, mapping, Polygon, MultiPolygon, LineString, MultiLineString, Point, box
from shapely.ops import unary_union, nearest_points, linemerge

BBOX = box(-20, -5, 82, 60)

def load(path, filt=None):
    r = shapefile.Reader(path)
    out = []
    for sr in r.iterShapeRecords():
        d = sr.record.as_dict()
        if filt and not filt(d):
            continue
        g = shape(sr.shape.__geo_interface__)
        out.append((d, g))
    return out

print('loading land...')
land = unary_union([g.intersection(BBOX) for d, g in load('ne_10m_land/ne_10m_land') if g.intersects(BBOX)])
lakes = unary_union([g for d, g in load('ne_10m_lakes/ne_10m_lakes') if g.intersects(BBOX) and (g.area > 0.15 or d.get('name') in ['Sea of Galilee','Dead Sea'])])
land = land.difference(lakes)
countries = load('ne_50m_admin_0_countries/ne_50m_admin_0_countries')
C = {d['ADM0_A3']: (d, g) for d, g in countries}

def rnd(geom, nd=3):
    def fix(c):
        if isinstance(c, (list, tuple)) and c and isinstance(c[0], (int, float)):
            return [round(c[0], nd), round(c[1], nd)]
        return [fix(x) for x in c]
    m = mapping(geom)
    return {'type': m['type'], 'coordinates': fix(m['coordinates'])}

def clean(g, tol, min_area=0.0):
    g = g.simplify(tol, preserve_topology=True).buffer(0)
    if min_area and isinstance(g, MultiPolygon):
        g = MultiPolygon([p for p in g.geoms if p.area >= min_area])
    return g

def chaikin(coords, n=2):
    pts = list(coords)
    if pts[0] == pts[-1]:
        pts = pts[:-1]
    for _ in range(n):
        out = []
        for i in range(len(pts)):
            a, b = pts[i], pts[(i + 1) % len(pts)]
            out.append((0.75 * a[0] + 0.25 * b[0], 0.75 * a[1] + 0.25 * b[1]))
            out.append((0.25 * a[0] + 0.75 * b[0], 0.25 * a[1] + 0.75 * b[1]))
        pts = out
    return pts + [pts[0]]

def ring(coords, smooth=True):
    return Polygon(chaikin(coords) if smooth else coords).buffer(0)

def on_land(coords, tol=0.012, keep=None, min_area=0.004):
    g = ring(coords).intersection(land)
    if keep == 'largest' and isinstance(g, MultiPolygon):
        g = max(g.geoms, key=lambda p: p.area)
    return clean(g, tol, min_area)

def sea(coords, tol=0.012):
    g = ring(coords).difference(land)
    if isinstance(g, MultiPolygon):
        g = max(g.geoms, key=lambda p: p.area)
    return clean(g, tol)

def capsule_chain(pts):
    """pts: (lon, lat, radius_deg). Tapered sausage through the points."""
    parts = []
    for a, b in zip(pts, pts[1:]):
        ca = Point(a[0], a[1]).buffer(a[2], 24)
        cb = Point(b[0], b[1]).buffer(b[2], 24)
        parts.append(unary_union([ca, cb]).convex_hull)
    return unary_union(parts)

R = {}

# ---------- Rivers ----------
print('rivers...')
RIVER_NAMES = {
    'nile': (['Nile', 'Rosetta Branch', 'Damietta Branch', 'Albert Nile', 'Bahr el Jebel', 'El Bahr el Abyad', 'Victoria Nile'], '尼罗河'),
    'bluenile': (['Abay', 'El Bahr el Azraq'], '青尼罗河'),
    'atbara': (['Atbara', 'Setit', 'Tekezé'], '阿特巴拉河'),
    'sobat': (['Sobat'], '索巴特河'),
    'kagera': (['Kagera'], '卡盖拉河'),
    'euphrates': (['Al Furat', 'Euphrates', 'Firat', 'Murat'], '幼发拉底河'),
    'tigris': (['Dicle', 'Tigris'], '底格里斯河'),
    'shatt': (['Shatt al-Arab'], '阿拉伯河'),
    'karkheh': (['Karkheh'], '卡尔黑河'),
    'danube': (['Danube', 'Donau', 'Bratul Chillia', 'Bratul Sulina', 'Bratul Sfântu Gheorghe', 'Borcea'], '多瑙河'),
    'sava': (['Sava'], '萨瓦河'),
    'drina': (['Drina'], '德里纳河'),
    'po': (['Po'], '波河'),
    'tiber': (['Tevere'], '台伯河'),
    'arno': (['Arno'], '阿尔诺河'),
    'rhine': (['Rhein', 'Rhin', 'Rhine', 'Nederrijn', 'Waal', 'Lek'], '莱茵河'),
    'rhone': (['Rhône'], '罗讷河'),
    'indus': (['Indus', 'Shiquan'], '印度河'),
    'jhelum': (['Jhelum'], '杰赫勒姆河'),
    'chenab': (['Chenab'], '杰纳布河'),
    'ravi': (['Ravi'], '拉维河'),
    'beas': (['Beas'], '比亚斯河'),
    'sutlej': (['Sutlej'], '萨特莱杰河'),
    'oxus': (['Amu Darya', 'Panj'], '阿姆河'),
    'jaxartes': (['Syr Darya', 'Naryn'], '锡尔河'),
    'zeravshan': (['Zarafshon'], '泽拉夫尚河'),
    'helmand': (['Helmand'], '赫尔曼德河'),
    'halys': (['Kızılırmak'], '克孜勒河'),
    'sakarya': (['Sakarya'], '萨卡里亚河'),
    'maeander': (['Büyük Menderes'], '大门德雷斯河'),
    'jordan': (['Jordan'], '约旦河'),
    'strymon': (['Strymnas', 'Strimonas'], '斯特鲁马河'),
    'hebrus': (['Evros', 'Maritsa'], '马里查河'),
    'haliacmon': (['Haliacmon'], '阿利亚克蒙河'),
    'nestos': (['Mesta'], '内斯托斯河'),
    'kupa': (['Kupa'], '库帕河'),
    'ebro': (['Ebro'], '埃布罗河'),
    'aras': (['Aras'], '阿拉斯河'),
}
segs = {k: [] for k in RIVER_NAMES}
for path in ['ne_10m_rivers_lake_centerlines/ne_10m_rivers_lake_centerlines', 'ne_10m_rivers_europe/ne_10m_rivers_europe']:
    for d, g in load(path):
        for k, (names, zh) in RIVER_NAMES.items():
            if d.get('name') in names:
                gi = g.intersection(BBOX)
                if not gi.is_empty:
                    segs[k].append(gi)
rivers = {}
for k, parts in segs.items():
    if not parts:
        print('  missing river', k); continue
    u = unary_union(parts)
    g = linemerge(u) if u.geom_type == 'MultiLineString' else u
    # Jordan flows INTO the Dead Sea; lake-centre routing lines are not river reaches.
    if k == 'jordan':
        g = g.intersection(box(-20,31.76,82,60)).difference(lakes)
    g = g.simplify(0.008)
    rivers[k] = g
R['rivers'] = {k: {'zh': RIVER_NAMES[k][1], 'geom': rnd(g, 3)} for k, g in rivers.items()}

def snap(rk, lon, lat):
    p = nearest_points(rivers[rk], Point(lon, lat))[0]
    return [round(p.x, 3), round(p.y, 3)]

def river_angle(rk, lon, lat):
    g = rivers[rk]
    p = Point(lon, lat)
    best = None
    lines = g.geoms if hasattr(g, 'geoms') else [g]
    for ln in lines:
        cs = list(ln.coords)
        for a, b in zip(cs, cs[1:]):
            s = LineString([a, b])
            dd = s.distance(p)
            if best is None or dd < best[0]:
                best = (dd, a, b)
    _, a, b = best
    # screen angle in mercator-ish: approximate with lat scaling
    dx = (b[0] - a[0]) * math.cos(math.radians(lat))
    dy = (b[1] - a[1])
    ang = -math.degrees(math.atan2(dy, dx))
    while ang > 90: ang -= 180
    while ang < -90: ang += 180
    return round(max(-70, min(70, ang)))

RIVER_LABELS = [
    # key, approx lon, lat, label, minzoom
    ('nile', 31.0, 27.6, '尼罗河', 4),
    ('nile', 32.6, 12.5, '白尼罗河', 5),
    ('bluenile', 34.9, 11.0, '青尼罗河', 5),
    ('atbara', 35.2, 15.6, '阿特巴拉河', 6),
    ('euphrates', 40.4, 34.8, '幼发拉底河', 5),
    ('tigris', 43.9, 34.3, '底格里斯河', 5),
    ('danube', 24.0, 43.75, '多瑙河', 5),
    ('danube', 18.9, 46.3, '多瑙河', 6),
    ('sava', 18.2, 45.1, '萨瓦河', 6),
    ('po', 10.8, 45.05, '波河', 6),
    ('tiber', 12.35, 42.5, '台伯河', 6),
    ('rhine', 7.6, 50.2, '莱茵河', 5),
    ('indus', 71.1, 29.0, '印度河', 5),
    ('jhelum', 73.4, 32.6, '杰赫勒姆河（希达斯皮斯河）', 6),
    ('beas', 75.4, 31.75, '比亚斯河（希发西斯河）', 6),
    ('oxus', 64.0, 39.4, '阿姆河（奥克苏斯河）', 5),
    ('jaxartes', 66.0, 42.8, '锡尔河（药杀水）', 5),
    ('halys', 34.7, 39.9, '克孜勒河（哈利斯河）', 6),
    ('jordan', 35.56, 32.2, '约旦河', 7),
    ('strymon', 23.2, 41.6, '斯特鲁马河', 7),
    ('maeander', 28.3, 37.85, '大门德雷斯河（迈安德河）', 7),
]
R['riverLabels'] = []
for rk, lo, la, zh, mz in RIVER_LABELS:
    p = snap(rk, lo, la)
    R['riverLabels'].append({'ll': [p[1], p[0]], 't': zh, 'rot': river_angle(rk, p[0], p[1]), 'z': mz})

# ---------- Regions ----------
print('regions...')
REG = {}

# Near / Middle / Far East (modern-country based)
def union_countries(codes, tol=0.03):
    gs = [C[c][1] for c in codes if c in C]
    missing = [c for c in codes if c not in C]
    if missing: print('  missing countries', missing)
    return clean(unary_union(gs), tol, 0.01)

NEAR_CORE = ['TUR', 'SYR', 'LBN', 'ISR', 'PSX', 'JOR', 'IRQ', 'EGY', 'CYP', 'CYN']
# Near East in nineteenth-century usage also encompassed the Balkan/Ottoman world.
NEAR = NEAR_CORE + ['GRC', 'BGR', 'ALB', 'MKD', 'SRB', 'MNE', 'BIH', 'KOS']
MIDDLE_MAHAN = ['IRN', 'AFG', 'KWT', 'BHR', 'QAT', 'ARE', 'OMN']
MIDDLE_TODAY = NEAR_CORE + ['IRN', 'SAU', 'YEM', 'OMN', 'ARE', 'QAT', 'BHR', 'KWT']
FAR_CORE = ['CHN', 'TWN', 'MNG', 'PRK', 'KOR', 'JPN']
FAR_SEA = ['VNM', 'LAO', 'KHM', 'THA', 'MMR', 'MYS', 'SGP', 'IDN', 'PHL', 'BRN', 'TLS']
WIDE = box(-30, -15, 160, 62)
countries_wide = {k: (d, g.intersection(WIDE)) for k, (d, g) in C.items() if g.intersects(WIDE)}
C = countries_wide
REG['near'] = union_countries(NEAR)
REG['middle'] = union_countries(MIDDLE_MAHAN)
REG['middleToday'] = union_countries(MIDDLE_TODAY).exterior if False else union_countries(MIDDLE_TODAY)
REG['farCore'] = union_countries(FAR_CORE, 0.05)
REG['farSea'] = union_countries(FAR_SEA, 0.05)
REG['balkansOtt'] = None  # placeholder (not drawn)
del REG['balkansOtt']

# Fertile Crescent: tapered band (lon, lat, radius)
FC = [(34.55, 31.0, 0.45), (35.05, 31.9, 0.55), (35.6, 33.0, 0.6), (36.3, 34.2, 0.65), (36.75, 35.3, 0.7),
      (37.3, 36.3, 0.75), (38.3, 36.8, 0.8), (39.5, 36.95, 0.85), (40.8, 36.95, 0.85), (42.1, 36.75, 0.85),
      (43.3, 36.1, 0.9), (44.3, 35.0, 0.95), (45.0, 33.8, 1.0), (45.8, 32.6, 1.0), (46.7, 31.6, 0.95),
      (47.6, 30.7, 0.8), (48.2, 30.2, 0.55)]
REG['crescent'] = clean(capsule_chain(FC).intersection(land), 0.012, 0.004)
nile_lower = rivers['nile'].intersection(box(30.0, 23.9, 33.5, 30.2))
DELTA = [(31.2, 30.0), (30.75, 30.3), (29.85, 31.05), (29.95, 31.35), (30.4, 31.6), (31.1, 31.65), (31.85, 31.55),
         (32.35, 31.3), (32.2, 30.75), (31.7, 30.3), (31.2, 30.0)]
REG['crescentNile'] = clean(unary_union([nile_lower.buffer(0.28, 16), ring(DELTA).buffer(0.12, 16)]).intersection(land), 0.012)

# Mesopotamia
REG['mesopotamia'] = on_land([
    (37.7, 37.25), (37.85, 36.6), (38.2, 36.0), (38.9, 35.65), (39.9, 35.05), (40.6, 34.45), (41.6, 34.15),
    (42.2, 33.85), (42.75, 33.35), (43.6, 32.9), (44.0, 32.2), (44.5, 31.4), (45.4, 30.75), (46.3, 30.45),
    (47.2, 30.1), (47.95, 29.9), (48.6, 30.0), (48.4, 30.6), (47.9, 31.3), (47.3, 32.0), (46.3, 32.75),
    (45.3, 33.55), (44.7, 34.4), (44.45, 35.4), (44.3, 36.3), (43.8, 36.95), (42.6, 37.45), (41.2, 37.75),
    (40.1, 38.15), (39.0, 37.85), (37.7, 37.25)], keep='largest')

# Historical Syria (Levant)
REG['syria'] = on_land([
    (35.85, 36.7), (36.3, 37.05), (37.0, 37.3), (37.9, 37.1), (38.3, 36.6), (38.45, 36.1), (39.0, 35.85),
    (39.15, 35.2), (38.95, 34.55), (38.4, 33.8), (37.6, 32.8), (37.1, 31.5), (36.6, 30.3), (35.6, 29.6),
    (34.95, 29.45), (34.6, 30.4), (34.0, 31.1), (33.9, 31.6), (34.8, 32.9), (35.4, 34.6), (35.6, 35.6),
    (35.75, 36.5), (35.85, 36.7)], keep='largest')
REG['syriaModern'] = clean(C['SYR'][1], 0.01)

# Southern Levant: geographic/teaching sketches, not surveyed ancient frontiers.
REG['canaan'] = on_land([
    (34.1,31.0),(34.7,30.75),(35.35,30.9),(35.7,31.55),(35.85,32.7),(36.1,33.65),
    (36.35,34.55),(36.15,35.2),(35.65,35.2),(35.35,34.4),(35.0,33.0),(34.5,31.8),(34.1,31.0)],tol=0.005)
REG['phoenicia'] = on_land([
    (35.05,33.0),(35.42,33.0),(35.72,33.65),(36.0,34.4),(36.12,35.2),(35.88,35.55),
    (35.55,35.4),(35.25,34.2),(35.05,33.0)],tol=0.004)
REG['centralHighlands'] = on_land([
    (34.88,31.3),(35.05,31.05),(35.3,31.35),(35.45,31.9),(35.45,32.45),
    (35.2,32.65),(34.95,32.2),(34.88,31.3)],tol=0.004)
REG['danBeersheba'] = clean(capsule_chain([
    (34.84,31.24,0.26),(35.10,31.53,0.3),(35.24,31.78,0.3),
    (35.25,32.2,0.35),(35.28,32.65,0.45),(35.65,33.25,0.25)]).intersection(land),0.005)
# Optional textual schematic for 1 Kings 4:21–24. NEVER labelled as proven territory.
REG['solomonNarrative'] = on_land([
    (34.0,30.6),(34.45,31.5),(35.1,32.6),(35.85,33.5),(36.1,34.5),(36.55,35.2),
    (38.2,36.1),(39.15,35.85),(39.0,34.7),(38.0,33.6),(37.1,32.0),
    (36.3,30.4),(35.2,30.0),(34.0,30.6)],tol=0.015)
REG['israelKingdom'] = on_land([
    (34.8,32.05),(35.15,31.8),(35.8,31.95),(36.25,32.3),(36.25,32.95),
    (35.85,33.3),(35.4,33.35),(35.0,33.0),(34.8,32.65),(34.8,32.05)],tol=0.005)
REG['judahKingdom'] = on_land([
    (34.65,31.1),(34.75,31.55),(35.0,31.9),(35.35,31.95),(35.53,31.65),
    (35.45,31.15),(35.05,30.9),(34.65,31.1)],tol=0.005)
REG['jordanModern'] = clean(C['JOR'][1],0.005)

# Egypt: the black land
nile_eg = rivers['nile'].intersection(box(30.5, 23.9, 33.5, 30.15))
delta = ring(DELTA)
faiyum = Point(30.72, 29.35).buffer(0.28, 24)
REG['egypt'] = clean(unary_union([nile_eg.buffer(0.11, 16), delta, faiyum]).intersection(land), 0.008)
REG['egyptModern'] = clean(C['EGY'][1], 0.01)

# Anatolia = Asian Turkey
europe_cut = Polygon([(20, 39.85), (26.0, 39.85), (26.32, 40.08), (26.42, 40.2), (26.7, 40.43), (27.5, 40.72), (28.4, 40.88),
                      (28.99, 41.0), (29.06, 41.12), (29.12, 41.24), (29.1, 41.8), (20, 43)])
REG['anatolia'] = clean(C['TUR'][1].difference(europe_cut), 0.01, 0.01)

# Iranian Plateau
REG['iranPlateau'] = on_land([
    (44.2, 38.6), (44.9, 37.2), (45.6, 35.6), (46.6, 33.6), (47.9, 32.2), (49.4, 31.0), (50.4, 30.0), (51.4, 28.8),
    (52.8, 27.7), (54.6, 27.1), (56.4, 27.0), (57.6, 26.6), (59.5, 26.0), (61.6, 25.9), (64.0, 25.9), (66.0, 25.9),
    (67.0, 26.8), (67.6, 28.4), (68.6, 29.6), (69.8, 30.8), (70.6, 32.6), (71.3, 34.0), (71.6, 35.6), (71.2, 36.6),
    (69.8, 36.8), (68.0, 36.3), (66.0, 36.2), (64.0, 35.9), (62.4, 36.4), (60.5, 37.0), (58.4, 37.6), (56.5, 37.9),
    (55.0, 37.2), (53.8, 36.6), (52.0, 36.4), (50.5, 36.7), (49.4, 37.0), (48.7, 38.2), (47.5, 38.9), (46.0, 39.0),
    (44.8, 39.3), (44.2, 38.6)], keep='largest')

# Persis (Fars)
REG['persis'] = on_land([(50.6, 30.6), (51.8, 31.4), (53.5, 31.3), (54.8, 30.0), (55.2, 28.6), (54.2, 27.3), (52.6, 27.0),
                         (51.2, 27.8), (50.6, 29.2), (50.6, 30.6)], keep='largest')

# Achaemenid empire c. 500 BC (schematic)
ACH = [(23.8, 40.6), (23.3, 41.2), (23.4, 42.0), (24.5, 42.4), (26.0, 42.9), (27.6, 42.95), (28.2, 42.9), (29.5, 42.2),
       (33.0, 42.4), (36.0, 42.3), (39.0, 41.6), (41.4, 42.6), (42.5, 43.1), (44.5, 42.8), (46.5, 42.0), (48.3, 41.9),
       (50.0, 41.0), (51.5, 39.5), (52.8, 40.5), (53.2, 41.0), (55.5, 42.0), (58.0, 43.4), (60.0, 43.6), (61.5, 42.5),
       (64.0, 41.8), (66.5, 41.0), (68.6, 41.2), (69.8, 40.8), (70.6, 40.4), (71.0, 39.4), (71.4, 38.0), (71.6, 37.0),
       (72.6, 36.2), (73.4, 35.0), (74.0, 33.6), (73.9, 32.4), (73.0, 30.6), (71.6, 28.8), (70.8, 27.4), (70.3, 25.5),
       (69.5, 24.5), (68.5, 23.4), (66.0, 24.6), (62.0, 24.8), (58.5, 25.2), (56.8, 25.9), (55.5, 26.2), (53.0, 26.0),
       (51.0, 27.0), (49.5, 28.3), (48.4, 29.3), (47.0, 29.6), (45.0, 30.3), (42.0, 31.3), (39.5, 31.5), (37.5, 30.0),
       (35.5, 29.0), (34.9, 29.4), (34.0, 27.4), (34.8, 25.5), (35.6, 23.5), (34.0, 22.0), (32.5, 21.8), (31.0, 21.6),
       (29.0, 22.0), (25.0, 24.0), (24.5, 28.0), (23.5, 30.0), (21.0, 30.3), (19.8, 30.8), (19.6, 31.8), (20.0, 32.8),
       (22.5, 33.2), (25.0, 32.6), (26.5, 33.5), (27.0, 34.8), (27.2, 35.6), (26.7, 36.6), (26.3, 37.5), (26.0, 38.4),
       (25.5, 39.4), (25.0, 40.0), (24.6, 40.4), (23.8, 40.6)]
REG['achaemenid'] = on_land(ACH, tol=0.03, min_area=0.02)

# Greek world: core and Magna Graecia
REG['greekCore'] = on_land([
    (19.3, 40.4), (20.6, 40.4), (21.5, 40.0), (22.6, 40.1), (23.0, 40.45), (23.3, 40.7), (24.0, 40.75), (24.6, 40.95),
    (25.5, 41.0), (26.2, 40.85), (26.85, 40.6), (26.7, 40.2), (26.6, 39.6), (27.1, 39.3), (27.5, 38.8), (27.7, 38.4),
    (27.75, 37.9), (27.7, 37.4), (28.0, 37.0), (28.2, 36.65), (28.45, 36.1), (28.3, 35.8), (26.6, 34.9), (24.0, 34.75),
    (23.3, 35.6), (22.8, 36.2), (21.6, 36.6), (20.3, 37.4), (20.0, 38.6), (19.6, 39.4), (19.3, 40.4)], tol=0.01)
REG['magnaGraecia'] = clean(unary_union([
    ring([(13.9, 41.1), (14.8, 41.0), (15.6, 40.6), (16.5, 40.75), (17.3, 40.75), (18.0, 40.6), (18.7, 39.9), (17.5, 38.8),
          (16.5, 37.8), (15.6, 37.85), (15.62, 38.3), (15.3, 38.9), (14.4, 40.3), (13.9, 41.1)]),
    ring([(13.6, 38.3), (15.9, 38.4), (15.6, 36.4), (14.5, 36.6), (12.75, 37.45), (13.0, 37.75), (13.6, 38.3)])]).intersection(land), 0.01, 0.004)

# Seas
REG['aegean'] = sea([(22.9, 40.7), (24.5, 41.0), (26.0, 41.0), (26.32, 40.08), (26.6, 39.5), (27.0, 38.5), (27.4, 37.0),
                     (28.2, 36.6), (28.3, 36.2), (27.9, 35.9), (27.3, 35.5), (26.32, 35.25), (25.0, 35.3), (23.55, 35.4),
                     (23.1, 36.4), (22.4, 36.6), (22.5, 37.5), (23.0, 38.0), (22.8, 39.0), (22.5, 40.0), (22.9, 40.7)])
REG['adriatic'] = sea([(12.2, 45.85), (13.8, 45.85), (15.0, 45.0), (16.0, 44.0), (18.0, 42.6), (19.5, 41.8), (19.8, 40.5),
                       (20.02, 39.75), (18.37, 39.79), (17.5, 40.6), (16.0, 41.5), (14.0, 42.5), (13.0, 44.0), (12.2, 45.0),
                       (12.2, 45.85)])

# Balkans
REG['balkans'] = on_land([
    (13.55, 45.75), (14.6, 45.6), (15.5, 45.45), (16.37, 45.48), (17.0, 45.25), (18.0, 45.13), (19.0, 44.92),
    (20.47, 44.82), (21.5, 44.72), (22.5, 44.62), (22.75, 44.2), (22.9, 44.0), (24.0, 43.7), (25.5, 43.65),
    (26.0, 43.88), (27.3, 44.1), (28.0, 44.45), (28.2, 45.35), (29.7, 45.2), (30.0, 44.0), (29.4, 42.0),
    (29.15, 41.25), (29.06, 41.12), (28.99, 41.0), (28.4, 40.88), (27.5, 40.72), (26.7, 40.43), (26.42, 40.2),
    (26.32, 40.08), (26.0, 39.85), (25.6, 39.5), (25.0, 38.5), (24.5, 37.0), (23.0, 36.2), (21.5, 36.5),
    (20.3, 37.4), (19.5, 39.0), (19.2, 40.4), (18.5, 42.0), (16.5, 43.2), (15.0, 44.2), (14.2, 44.8),
    (13.4, 45.2), (13.55, 45.75)], tol=0.012, min_area=0.01)

# Ancient Macedon (c. 336 BC, schematic)
REG['macedon'] = on_land([
    (20.75, 41.05), (20.9, 40.55), (21.2, 40.15), (21.8, 39.95), (22.55, 40.0), (22.75, 40.2), (23.3, 39.85),
    (24.5, 39.95), (24.5, 40.82), (24.85, 40.9), (24.75, 41.35), (24.0, 41.5), (23.2, 41.65), (22.4, 41.75),
    (21.6, 41.6), (21.0, 41.35), (20.75, 41.05)], tol=0.008)
REG['northMacedonia'] = clean(C['MKD'][1], 0.005)

# Apennine peninsula and Roman Italy c. 264 BC
REG['apennine'] = on_land([(7.5, 44.1), (8.6, 44.6), (9.6, 44.9), (10.6, 44.6), (11.6, 44.4), (12.4, 44.3), (13.0, 44.0),
                          (14.5, 42.6), (16.4, 41.8), (18.8, 40.4), (18.6, 39.5), (16.6, 37.6), (15.68, 37.85), (15.68, 38.36),
                          (15.0, 39.5), (13.0, 41.0), (11.0, 42.2), (10.0, 43.0), (9.0, 44.0), (7.5, 43.6), (7.5, 44.1)],
                         keep='largest')
REG['poValley'] = on_land([(7.3, 45.2), (7.6, 45.9), (9.0, 46.0), (10.5, 45.75), (12.4, 45.8), (13.0, 45.7), (12.6, 44.2),
                           (11.6, 44.4), (10.6, 44.6), (9.6, 44.9), (8.6, 44.6), (7.5, 44.7), (7.3, 45.2)], keep='largest')
REG['romanItaly264'] = on_land([(9.9, 43.95), (10.5, 44.0), (11.5, 43.95), (12.2, 44.1), (12.65, 44.15), (13.6, 43.7),
                                (15.5, 42.5), (17.0, 41.5), (18.6, 40.4), (18.6, 39.6), (17.2, 38.7), (16.5, 37.7), (15.68, 37.85),
                                (15.68, 38.36), (15.5, 38.5), (14.5, 40.0), (12.0, 41.2), (10.8, 42.3), (10.0, 42.9), (9.9, 43.95)],
                               keep='largest')
REG['italyModern'] = clean(C['ITA'][1], 0.01, 0.01)

# Roman Empire AD 117 (schematic) + Trajan's short-lived eastern provinces
ROM = [(4.2, 52.35), (5.1, 52.08), (5.9, 51.85), (6.45, 51.66), (6.96, 50.94), (7.1, 50.73), (7.33, 50.5),
       (7.9, 50.35), (8.4, 50.4), (8.75, 50.45), (9.0, 50.1), (9.25, 49.7), (9.6, 49.2), (9.65, 48.85), (10.4, 48.95),
       (11.2, 49.05), (11.78, 48.9), (12.1, 49.02), (13.47, 48.6), (14.29, 48.33), (15.6, 48.4), (16.37, 48.23),
       (16.92, 48.14), (17.6, 47.85), (18.15, 47.76), (18.9, 47.8), (19.06, 47.56), (18.95, 46.6), (18.9, 46.0),
       (19.2, 45.4), (20.0, 45.2), (20.6, 45.6), (21.2, 46.3), (22.0, 46.9), (22.8, 47.3), (23.4, 47.35), (24.3, 47.3),
       (25.0, 46.8), (25.5, 46.3), (25.6, 45.6), (25.2, 45.1), (25.0, 44.5), (25.0, 43.75), (26.0, 43.9), (27.3, 44.15),
       (28.0, 44.6), (28.3, 45.3), (29.7, 45.25), (30.4, 45.0), (31.5, 43.5), (34.0, 43.0), (37.5, 43.0), (39.5, 43.4),
       (40.3, 43.3), (41.6, 42.6), (42.0, 41.6), (42.6, 41.0), (43.6, 40.0), (43.0, 38.8), (42.0, 37.9), (41.0, 37.3),
       (40.0, 36.6), (39.6, 35.6), (40.0, 34.8), (39.4, 33.8), (38.9, 32.6), (38.0, 31.5), (38.8, 29.5), (38.5, 27.5),
       (38.3, 26.5), (36.9, 26.2), (36.0, 25.5), (35.9, 23.8), (33.5, 22.8), (32.6, 22.9), (31.0, 23.2), (29.0, 24.3),
       (28.6, 25.2), (27.5, 26.6), (27.0, 27.5), (25.0, 28.9), (24.8, 29.6), (23.0, 30.2), (21.0, 30.3), (19.8, 30.4),
       (19.0, 30.3), (17.5, 30.8), (16.0, 31.0), (15.2, 31.2), (14.0, 31.5), (12.5, 31.6), (11.0, 32.0), (10.2, 33.0),
       (9.2, 33.6), (8.5, 33.8), (7.5, 34.4), (6.5, 34.7), (5.5, 34.9), (4.5, 35.4), (3.0, 35.6), (2.0, 35.6),
       (0.5, 35.3), (-1.5, 34.9), (-2.0, 35.0), (-3.5, 34.9), (-5.0, 34.2), (-5.6, 33.95), (-6.5, 33.8), (-7.0, 33.9),
       (-7.5, 34.3), (-9.8, 36.8), (-10.0, 39.0), (-9.8, 42.5), (-9.0, 44.0), (-4.0, 44.5), (-5.5, 47.5), (-6.0, 48.6),
       (-6.2, 49.7), (-5.8, 52.0), (-5.2, 53.3), (-4.9, 54.4), (-3.7, 54.8), (-3.0, 54.98), (-2.0, 55.0), (-1.4, 55.02),
       (-0.5, 54.9), (1.8, 53.2), (4.2, 52.35)]
REG['romanEmpire'] = on_land(ROM, tol=0.025, min_area=0.02)
TRAJAN_EAST = [(39.6, 35.6), (40.0, 36.6), (41.0, 37.3), (42.0, 37.9), (43.0, 38.8), (43.6, 40.0), (42.6, 41.0),
               (44.5, 41.4), (46.0, 41.0), (46.5, 39.8), (45.4, 38.4), (44.9, 37.2), (45.4, 35.6), (46.2, 34.0),
               (47.2, 32.8), (48.3, 31.3), (48.8, 30.0), (48.4, 29.5), (47.4, 29.5), (46.0, 30.6), (44.0, 31.8),
               (42.5, 33.0), (41.0, 34.3), (40.0, 34.8), (39.6, 35.6)]
REG['trajanEast'] = on_land(TRAJAN_EAST, tol=0.02, min_area=0.02)

# simplify outputs
R['regions'] = {k: rnd(v, 3) for k, v in REG.items()}

# Modern borders (land boundary lines) + country labels
print('borders...')
MOD_BOX = WIDE
blines = [g.intersection(MOD_BOX) for d, g in load('ne_50m_admin_0_boundary_lines_land/ne_50m_admin_0_boundary_lines_land') if g.intersects(MOD_BOX)]
bl = unary_union([b for b in blines if not b.is_empty]).simplify(0.02)
R['borders'] = rnd(bl, 2)
labels = []
for k, (d, g) in C.items():
    lx, ly = d['LABEL_X'], d['LABEL_Y']
    if -30 < lx < 160 and -15 < ly < 62 and d['NAME_ZH']:
        zh = d['NAME_ZH']
        zh = {'中华民国': '台湾', '北塞浦路斯土耳其共和国': '北塞浦路斯', '波斯尼亚和黑塞哥维那': '波黑'}.get(zh, zh)
        labels.append({'ll': [round(ly, 2), round(lx, 2)], 't': zh, 'en': d.get('NAME_EN') or d['NAME'], 'r': d['LABELRANK']})
R['countryLabels'] = labels

# Embedded low-detail land provides an offline fallback beneath the online terrain tiles.
fallback_land = unary_union([g.intersection(WIDE) for d, g in load('ne_50m_land/ne_50m_land') if g.intersects(WIDE)])
R['land'] = rnd(clean(fallback_land, 0.065, 0.015), 3)

# Cataracts snapped to the Nile
CAT = [('Ⅰ', 32.89, 24.08), ('Ⅱ', 31.3, 21.85), ('Ⅲ', 30.37, 19.75), ('Ⅳ', 32.1, 18.75), ('Ⅴ', 33.95, 18.3), ('Ⅵ', 32.68, 16.3)]
R['cataracts'] = [{'t': t, 'll': list(reversed(snap('nile', lo, la)))} for t, lo, la in CAT]

s = json.dumps(R, ensure_ascii=False, separators=(',', ':'))
open('data.json', 'w').write(s)
print('size KB', len(s) // 1024)
for k, v in R['regions'].items():
    print(' ', k, len(json.dumps(v)) // 1024, 'KB')
print('rivers KB', len(json.dumps(R['rivers'])) // 1024, 'borders KB', len(json.dumps(R['borders'])) // 1024)
