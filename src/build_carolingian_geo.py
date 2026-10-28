"""Add teaching areas for the Carolingians, the partition of Verdun and the three lines after it (France, Germany, Italy) to history_geo.json.

Usage: <python with shapely> build_carolingian_geo.py   (run after build_early_medieval_geo.py and build_late_west_geo.py; reads mCarolingian814,
mAndalus750, mPapal756 and hSicily).  Teaching regions only, not reconstructed frontiers.  Points are (lon, lat).
- Charlemagne's wars and neighbours: mSaxony772, mBavaria788, mSpanishMarch801, mAndalus814, mAsturias800, mDenmark800, mSlavs800,
  mBenevento800, mAngloSaxons800.
- Verdun (843): mFrancia843W (Charles the Bald), mFrancia843M (Lothair I), mFrancia843E (Louis the German); Lothair's heirs (855):
  mLotharingia855, mProvence855, mItaly855; after Ribemont (880): mEastFrancia880; Lorraine as a duchy of the East (925): mLotharingia925.
- West Francia: mBrittany851, mNormandy911, mNormandy933, mFlanders900, mBurgundyDuchy900, mAquitaineDuchy900, mCapetDomain987;
  the Vikings: mScandinavia, mDanelaw878, mWessex878.
- East Francia: the duchies about 919 (mSaxonyDuchy, mFranconiaDuchy, mBavariaDuchy, mSwabiaDuchy), mMoravia890, mBohemia900, mMagyars900,
  mOtto962 (East Francia with Lorraine, the kingdom of Italy and the marches beyond the Elbe).
- Italy: mBenevento849, mSalerno849, mByzItaly880, mBari847, mSicilyArab902, mItalyKingdom950.
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
L = lambda pts: land.intersection(Polygon(pts)).buffer(0)
regions = {}


def filled(g):
    """Drop interior rings: the unions behind these teaching areas leave slivers of unclaimed land (Tyrol, Hesse) as holes."""
    return unary_union([Polygon(p.exterior) for p in getattr(g, 'geoms', [g])]).buffer(0)


# Charlemagne's empire, mended: Bavaria reached over the Brenner, and Hesse was Frankish; the old area had holes there.
# The Main valley between Alamannia, Thuringia and Bavaria was Frankish too; slivers left along the southern Italian coast were never his.
MAIN = L([(8.9,49.45),(9.4,50.4),(11.0,50.1),(12.45,50.4),(12.2,49.75),(10.2,49.35),(10.5,48.95),(9.0,49.4)])
SOUTH = Polygon([(11.0,41.2),(13.2,41.25),(13.9,41.7),(14.5,42.0),(15.0,42.2),(19.5,42.2),(19.5,36.5),(11.0,36.5)])
c814 = filled(unary_union([G('mCarolingian814'), MAIN]).difference(SOUTH))

# ---------- Charlemagne's wars and his neighbours ----------
regions['mSaxony772'] = L([(6.6,51.6),(6.9,52.4),(7.2,53.6),(9.0,54.0),(10.8,53.9),(11.6,52.6),(11.9,51.9),(11.0,51.5),(9.0,51.2),(7.5,51.3)])
regions['mBavaria788'] = L([(10.0,47.3),(10.2,49.4),(12.1,49.8),(13.8,48.8),(14.5,48.2),(13.0,47.4),(12.2,46.8),(11.2,46.5),(10.4,46.9)])
SPANISH_MARCH = L([(0.6,42.7),(3.3,42.45),(3.2,41.9),(2.4,41.3),(1.6,41.15),(0.7,41.6)])
regions['mSpanishMarch801'] = SPANISH_MARCH
regions['mAndalus814'] = G('mAndalus750').difference(SPANISH_MARCH.buffer(.02)).buffer(0)
regions['mAsturias800'] = L([(-9.5,42.6),(-9.4,43.9),(-7.0,43.7),(-3.0,43.6),(-3.0,42.7),(-6.0,42.5)])
regions['mDenmark800'] = L([(8.0,54.35),(8.0,57.8),(10.6,57.8),(11.5,56.5),(12.7,56.3),(14.4,56.2),(14.4,55.3),(12.2,54.9),(11.0,54.35)])
regions['mSlavs800'] = L([(10.9,54.35),(14.5,54.3),(15.6,53.6),(15.6,52.0),(16.6,50.5),(17.8,50.0),(18.6,49.3),(17.0,48.7),(15.0,48.8),
                          (13.9,48.75),(12.6,49.4),(12.1,50.3),(11.95,51.3),(11.7,52.6),(10.9,53.9)]).difference(c814.buffer(.02)).buffer(0)
regions['mBenevento800'] = L([(14.0,41.8),(15.5,41.9),(16.4,41.2),(17.2,40.6),(17.2,40.4),(16.6,39.75),(15.6,39.6),(15.1,40.3),(14.6,40.6),(14.5,41.0),(14.0,41.2)])
regions['mAngloSaxons800'] = L([(-5.8,50.0),(-4.0,51.25),(-3.0,51.55),(-2.95,53.25),(-3.1,54.0),(-3.4,54.9),(-3.0,55.9),(-2.4,56.1),
                                (-1.6,55.6),(0.2,53.6),(1.9,52.7),(1.6,51.2),(1.4,50.9),(-1.0,50.7),(-3.5,50.2)])

# ---------- Verdun, 843 ----------
# The western line: the Scheldt, west of the Meuse, the Saône and the Rhône (Lyon and Arles to Lothair).
W_LINE = [(3.45,51.55),(3.75,51.0),(3.3,50.2),(4.2,49.8),(4.9,49.2),(5.2,48.3),(5.0,47.6),(4.85,46.8),(4.85,46.0),(4.72,45.8),
          (4.72,45.0),(4.6,44.0),(4.55,43.3),(4.6,42.0)]
# The eastern line: Frisia to the Ems, the Rhine (Cologne and Alsace west of it to Lothair, Mainz, Worms and Speyer to Louis),
# the Aare, the Alps between Italy and Rhaetia, Bavaria and Carinthia, down to Istria.
E_LINE = [(7.45,54.3),(7.35,53.7),(7.05,53.2),(6.8,52.4),(6.2,51.9),(6.65,51.4),(7.02,50.94),(7.62,50.35),(7.9,50.02),(7.75,49.95),
          (7.55,49.6),(7.9,49.2),(8.15,48.98),(7.95,48.6),(7.6,47.6),(7.9,47.3),(8.2,46.9),(8.45,46.5),(9.0,46.3),(10.2,46.6),
          (11.0,46.9),(12.2,46.75),(13.7,46.5),(14.0,45.6),(14.6,45.0)]
west_poly = Polygon([(-11.0,56.0), *W_LINE, (-11.0,36.0)])
mid_poly = Polygon([*W_LINE, (8.0,40.5), (19.5,39.0), (19.0,43.0), *reversed(E_LINE), (3.0,56.0)])
regions['mFrancia843W'] = c814.intersection(west_poly).buffer(0)
regions['mFrancia843M'] = c814.intersection(mid_poly).difference(regions['mFrancia843W'].buffer(.01)).buffer(0)
regions['mFrancia843E'] = c814.difference(regions['mFrancia843W'].buffer(.01)).difference(regions['mFrancia843M'].buffer(.01)).buffer(0)

# ---------- Lothair's heirs (855) and the fate of the north ----------
mid = regions['mFrancia843M']
mid_italy = mid.intersection(italy.buffer(.05)).buffer(0)
mid_north = mid.difference(mid_italy.buffer(.01)).buffer(0)
regions['mItaly855'] = mid_italy
regions['mLotharingia855'] = mid_north.intersection(box(2.5, 46.15, 9.5, 55.0)).buffer(0)
regions['mProvence855'] = mid_north.difference(regions['mLotharingia855'].buffer(.01)).buffer(0)
regions['mLotharingia925'] = mid_north.intersection(box(2.5, 47.5, 9.5, 55.0)).buffer(0)
regions['mEastFrancia880'] = unary_union([regions['mFrancia843E'], regions['mLotharingia925']]).buffer(0)

# ---------- West Francia ----------
regions['mBrittany851'] = L([(-5.2,48.9),(-1.15,48.75),(-1.0,48.0),(-1.05,47.3),(-1.6,46.9),(-5.0,47.0)])
regions['mNormandy911'] = L([(0.05,49.75),(1.4,50.1),(1.78,49.7),(1.72,49.25),(1.45,48.9),(0.7,48.85),(0.2,49.1),(-0.1,49.4)])
regions['mNormandy933'] = L([(-2.0,49.8),(-1.2,49.75),(0.05,49.75),(1.4,50.1),(1.78,49.7),(1.72,49.25),(1.45,48.9),(0.8,48.55),
                             (-0.3,48.5),(-1.1,48.6),(-1.65,48.6)])
regions['mFlanders900'] = L([(1.6,50.95),(2.4,51.15),(3.45,51.45),(4.2,51.35),(3.75,50.9),(3.35,50.4),(2.8,50.25),(2.0,50.45)])
regions['mBurgundyDuchy900'] = L([(3.0,48.05),(3.9,48.3),(4.6,48.2),(5.3,47.8),(5.1,47.0),(4.85,46.5),(4.2,46.3),(3.5,46.6),(3.0,47.4)])
regions['mAquitaineDuchy900'] = L([(-1.9,47.05),(-0.1,47.25),(1.4,46.85),(2.8,46.45),(3.45,46.1),(3.4,45.0),(2.9,44.6),(1.0,44.9),
                                   (-0.6,45.0),(-1.3,45.7),(-1.5,46.4)])
regions['mCapetDomain987'] = L([(1.6,49.3),(2.6,49.38),(3.1,49.12),(3.0,48.6),(2.5,48.3),(2.35,47.75),(1.85,47.7),(1.45,48.0),(1.6,48.7)])
regions['mScandinavia'] = L([(8.0,54.35),(8.0,57.8),(4.8,60.0),(4.8,62.6),(9.0,64.2),(14.0,64.2),(18.6,61.5),(19.3,59.6),(18.2,58.5),
                             (16.7,57.0),(16.1,56.0),(14.3,55.3),(12.3,55.35),(11.0,54.35)])
regions['mDanelaw878'] = L([(-0.05,51.5),(-0.4,52.1),(-1.3,52.4),(-2.0,52.7),(-2.9,53.2),(-3.0,53.8),(-2.2,54.6),(-1.1,54.75),(0.5,54.0),
                            (1.9,52.8),(1.8,51.4)])
regions['mWessex878'] = L([(-5.8,50.0),(-4.0,51.25),(-2.6,51.6),(-1.4,51.9),(-0.05,51.5),(1.5,51.3),(1.4,50.9),(-1.0,50.7),(-3.5,50.2)])

# ---------- East Francia ----------
# Saxony with Thuringia, which the Saxon dukes held from 908.
regions['mSaxonyDuchy'] = L([(6.6,51.6),(6.9,52.4),(7.2,53.4),(8.6,53.9),(9.0,54.0),(10.6,54.35),(11.5,53.3),(12.0,52.6),(11.95,51.9),
                             (12.4,51.6),(12.45,50.45),(11.0,50.15),(9.95,50.5),(10.0,51.35),(9.0,51.25),(8.0,51.2),(7.0,51.3)])
regions['mFranconiaDuchy'] = L([(7.8,49.4),(7.95,50.0),(8.1,50.6),(8.6,51.2),(9.6,51.25),(10.2,50.65),(11.4,50.35),(11.6,49.6),(10.8,49.1),
                                (9.8,49.2),(8.8,49.1),(8.2,49.2)])
regions['mBavariaDuchy'] = L([(10.9,47.4),(10.9,48.6),(11.4,49.35),(12.2,49.8),(13.8,48.8),(14.5,48.3),(14.6,47.5),(15.8,46.75),(15.5,46.3),
                              (13.7,46.5),(12.3,46.7),(11.0,46.8),(10.5,47.0)])
regions['mSwabiaDuchy'] = L([(7.6,47.55),(8.0,48.6),(8.2,49.0),(9.0,49.3),(10.0,49.15),(10.9,48.6),(10.9,47.4),(10.0,46.8),(9.5,46.45),
                             (8.45,46.5),(8.2,46.9),(7.9,47.3)])
regions['mMoravia890'] = L([(15.0,49.5),(16.0,50.2),(18.5,50.0),(19.5,49.3),(20.5,48.6),(19.0,47.9),(17.5,47.9),(16.9,48.6),(15.4,48.8)])
regions['mBohemia900'] = L([(12.1,50.2),(12.9,49.4),(13.9,48.8),(14.8,48.9),(15.6,49.3),(16.2,50.1),(16.0,50.6),(14.9,51.0),(13.9,51.0),(12.6,50.6)])
regions['mMagyars900'] = L([(16.2,46.9),(16.9,48.0),(18.5,48.4),(20.8,48.6),(22.4,48.4),(23.5,47.9),(24.6,47.2),(24.7,46.0),(23.0,45.0),
                            (21.0,44.8),(19.2,45.0),(18.0,45.5),(16.6,46.0)])

# ---------- Italy ----------
NAPLES = L([(13.75,41.25),(14.5,41.0),(14.6,40.6),(14.35,40.55),(13.95,40.75)])
CALABRIA = L([(15.6,39.6),(16.65,39.65),(17.2,39.1),(16.6,38.4),(16.0,37.9),(15.6,38.0),(15.7,38.9)])
APULIA876 = L([(16.45,41.25),(17.3,41.05),(18.6,40.15),(18.4,39.8),(17.2,40.3),(16.8,40.6)])
regions['mBari847'] = L([(16.35,41.3),(17.2,41.12),(17.4,40.8),(16.9,40.7),(16.3,41.0)])
regions['mBenevento849'] = L([(13.9,42.0),(14.7,42.1),(15.9,41.95),(16.2,41.45),(17.0,41.05),(16.9,40.75),(15.9,40.9),(15.2,41.0),
                              (14.6,41.2),(14.0,41.4)]).difference(regions['mBari847'].buffer(.01)).buffer(0)
regions['mSalerno849'] = L([(13.75,41.4),(14.6,41.2),(15.2,41.0),(15.9,40.9),(16.9,40.75),(17.3,40.45),(16.6,39.75),(16.2,39.3),(15.6,39.4),
                            (15.6,39.95),(14.8,40.3),(14.3,40.65),(13.75,41.2)]).difference(NAPLES.buffer(.01)).difference(CALABRIA.buffer(.01)).buffer(0)
regions['mByzItaly880'] = unary_union([CALABRIA, APULIA876, NAPLES]).buffer(0)
regions['mSicilyArab902'] = G('hSicily')
regions['mItalyKingdom950'] = mid_italy.difference(G('mPapal756').buffer(.01)).buffer(0)
GERO_MARCH = L([(11.6,52.6),(11.5,53.3),(12.6,53.4),(14.3,53.0),(14.7,52.3),(14.9,51.4),(14.0,50.95),(12.6,50.6),(12.1,50.3),(11.95,51.3)])
regions['mOtto962'] = unary_union([regions['mEastFrancia880'], regions['mItalyKingdom950'], GERO_MARCH]).buffer(0)


def rounded(g):
    g = g.simplify(.01, preserve_topology=True).buffer(0)
    assert not g.is_empty and g.is_valid, g
    def coords(c):
        if isinstance(c[0], (float, int)): return [round(x, 4) for x in c]
        return [coords(x) for x in c]
    m = mapping(g); return {'type': m['type'], 'coordinates': coords(m['coordinates'])}

for k in regions:
    assert k not in geo, ('exists', k)
geo.update({k: rounded(filled(g)) for k, g in regions.items()})
geo['mCarolingian814'] = rounded(c814)
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print(len(regions), 'areas;', {k: round(g.area, 1) for k, g in regions.items()})
