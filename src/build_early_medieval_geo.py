"""Add early-medieval teaching areas (565-845) to history_geo.json.

Usage: <python with shapely> build_early_medieval_geo.py   (run after build_late_antique_geo.py; it reads its areas)
East Rome and Byzantium
- mByzItaly600: the imperial pieces of Italy about 600 (Venetian lagoon and Istria, Ravenna and the Pentapolis, the Perugia
  corridor, the duchies of Rome and Naples, Calabria, the heel of Apulia).
- mByz600: the empire under Maurice after 591 (the East with Egypt, the Armenian and Iberian gains, Africa, the islands,
  imperial Italy, Spania).
- mSasanian620: Persia at its widest under Khosrow II, about 620 (with Syria, Palestine, Egypt, Armenia, eastern Anatolia).
- mByz620: what was left to Constantinople about 620.  mByz641: the empire at Heraclius's death (Syria and Mesopotamia lost).
- mByz680: about 680 (Anatolia, Thrace, the Greek coasts, Sicily, imperial Italy, Carthage).  mByz780: about 780 (no Africa,
  no Ravenna).
Neighbours
- mAvars600: the Avar khaganate in the Carpathian basin.  mBulgars800: the Bulgar khanate on the lower Danube under Krum.
- mWesternTurks600: the Western Turkic khaganate (Zhetysu, the steppe north of Sogdiana).  mTarim: the Tarim basin (Anxi).
- mArabia: the Arabian peninsula.  mLakhmids, mGhassanids: the Arab client kingdoms of Persia and Rome.
- mCaliph644: the caliphate about 644 (Arabia, Iraq, Syria, Egypt, western Iran).  mCaliph661: about 661 (all of Iran).
- mAbbasid800: the Abbasid caliphate about 800 (without Spain and the far West; with Transoxiana and Sind).
The West
- mLombards600 / mLombards750: Lombard Italy about 600 and about 750 (after Ravenna fell in 751 it is Lombard too).
- mPapal756: the papal lands after Pepin's donation (the duchy of Rome, the Perugia corridor, Ravenna and the Pentapolis).
- mFranks600: the Merovingian realm about 600.  mFranks768: at Pepin's death.  mCarolingian814: Charlemagne's empire.
- mAndalus750: Umayyad Spain (without the Asturian north).  mSeptimania: the coast between the Pyrenees and the Rhone.
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
egypt = shape(base['regions']['egypt']).buffer(0)
G = lambda k: shape(geo[k]).buffer(0)
L = lambda pts: land.intersection(Polygon(pts))
regions = {}

# ---------- Italy ----------
VENETIA = L([(12.2,45.15),(12.35,45.55),(13.1,45.8),(13.95,45.6),(14.05,45.1),(13.6,44.8),(12.4,44.95)])
RAVENNA = L([(11.9,44.75),(12.6,44.6),(13.1,43.95),(13.65,43.45),(13.6,43.2),(12.6,43.35),(12.0,43.9),(11.7,44.4)])
PERUGIA = L([(12.0,43.4),(12.6,43.35),(12.75,42.9),(12.45,42.45),(12.1,42.6),(11.95,43.1)])
ROME = L([(11.6,42.45),(12.45,42.5),(13.0,42.1),(13.4,41.6),(13.1,41.25),(12.6,41.45),(12.2,41.75),(11.75,42.1)])
NAPLES = L([(13.9,41.0),(14.5,41.0),(14.6,40.6),(14.35,40.55),(13.95,40.75)])
CALABRIA = L([(15.6,39.6),(16.65,39.65),(17.2,39.1),(16.6,38.4),(16.0,37.9),(15.6,38.0),(15.7,38.9)])
APULIA = L([(17.2,40.6),(18.0,40.65),(18.55,40.15),(18.4,39.8),(17.9,39.95),(17.2,40.4)])
BENEVENTO = L([(14.0,41.8),(15.5,41.9),(16.4,41.2),(17.2,40.6),(17.2,40.4),(16.6,39.75),(15.6,39.6),(15.1,40.3),(14.6,40.6),(14.5,41.0),(14.0,41.2)])
islands = unary_union([G('hSicily'), G('hSardCorsica')]).buffer(.05)
regions['mByzItaly600'] = unary_union([VENETIA, RAVENNA, PERUGIA, ROME, NAPLES, CALABRIA, APULIA])
regions['mLombards600'] = italy.difference(islands).difference(regions['mByzItaly600'].buffer(.02))
regions['mLombards750'] = italy.difference(islands).difference(unary_union([VENETIA, PERUGIA, ROME, NAPLES, CALABRIA, APULIA]).buffer(.02))
regions['mPapal756'] = unary_union([ROME, PERUGIA, RAVENNA])

# ---------- East Rome, Persia, Arabs ----------
east = G('eEast395')
ARMENIA591 = L([(39.5,38.3),(41.0,38.6),(42.5,38.9),(43.8,39.4),(44.6,40.0),(44.8,40.8),(45.5,41.2),(46.3,41.6),(45.2,42.3),
                (43.8,42.6),(42.0,43.1),(41.5,41.5),(40.3,40.9),(39.5,40.0)])
AFRICA = G('e476Vandals')
regions['mByz600'] = unary_union([east, ARMENIA591, AFRICA, G('hSicily'), G('hSardCorsica'), regions['mByzItaly600'], G('lSpania')])
LEVANT = L([(34.2,31.2),(34.8,29.5),(35.9,29.4),(38.5,33.0),(40.5,34.6),(42.5,36.2),(41.5,37.3),(38.3,37.0),(36.5,36.95),
            (35.8,35.5),(34.9,33.2)])
EAST_ANATOLIA = L([(35.3,36.9),(34.5,38.5),(34.8,40.5),(36.5,41.2),(41.8,41.6),(41.5,38.0),(38.5,37.1)])
SINAI = L([(32.3,31.3),(34.25,31.35),(34.95,29.5),(34.3,27.7),(32.6,29.9)])
regions['mSasanian620'] = unary_union([G('lSasanian560'), LEVANT, egypt, SINAI, EAST_ANATOLIA, ARMENIA591])
regions['mByz620'] = regions['mByz600'].difference(regions['mSasanian620'].buffer(.02)).difference(G('lSpania').buffer(.02))
CYRENAICA = L([(19.5,30.3),(20.0,32.2),(22.5,33.0),(25.2,31.6),(25.0,29.5),(20.0,29.5)])
regions['mByz641'] = regions['mByz600'].difference(unary_union([LEVANT, ARMENIA591.intersection(box(42.5, 37, 47, 44))]).buffer(.02)).difference(G('lSpania').buffer(.02))
ANATOLIA = east.intersection(box(26.0, 35.8, 41.5, 42.3))
THRACE = L([(26.0,40.3),(26.2,41.7),(27.5,42.3),(28.2,42.0),(29.5,41.3),(29.2,40.9),(28.0,40.9),(27.0,40.4)])
GREEK_COASTS = L([(21.0,36.3),(21.2,38.6),(22.6,39.6),(23.2,40.3),(24.3,40.9),(26.0,40.9),(26.0,40.3),(24.5,38.5),(24.6,36.3)])
CARTHAGE = AFRICA.intersection(box(8.2, 33.5, 11.5, 37.5))
CHERSON = L([(32.5,44.4),(33.3,45.3),(34.0,44.9),(33.6,44.4)])
islands_e = unary_union([G('hSicily'), G('hSardCorsica')])
regions['mByz680'] = unary_union([ANATOLIA, THRACE, GREEK_COASTS, islands_e, regions['mByzItaly600'], CARTHAGE, CHERSON])
regions['mByz780'] = unary_union([ANATOLIA, THRACE, GREEK_COASTS, G('hSicily'), VENETIA, NAPLES, CALABRIA, APULIA, CHERSON])
regions['mArabia'] = L([(34.5,28.0),(35.0,29.6),(37.0,31.3),(39.2,32.2),(42.0,31.2),(44.5,29.5),(47.8,30.1),(48.6,28.5),(51.0,25.0),
                        (56.5,26.5),(60.0,22.5),(52.0,15.5),(44.0,12.4),(42.5,14.0),(38.5,20.0),(36.8,24.5)])
regions['mLakhmids'] = L([(43.0,31.5),(44.5,32.4),(46.0,31.0),(47.5,30.0),(46.5,29.0),(44.5,29.8)])
regions['mGhassanids'] = L([(35.6,30.5),(36.2,33.5),(37.5,34.5),(38.6,33.6),(38.0,31.5),(37.0,30.0)])
WEST_IRAN = L([(44.0,30.0),(44.5,36.5),(47.5,37.0),(51.5,35.8),(52.5,33.0),(52.0,29.5),(49.5,29.6),(48.0,30.0)])
MESO = shape(base['regions']['mesopotamia']).buffer(0)
regions['mCaliph644'] = unary_union([regions['mArabia'], LEVANT, MESO, egypt, SINAI, CYRENAICA, WEST_IRAN])
regions['mCaliph661'] = unary_union([regions['mCaliph644'], G('lSasanian560'), ARMENIA591.intersection(box(42.5, 37, 47, 44))])
TRANSOXIANA = L([(61.0,37.5),(63.0,40.8),(68.0,42.5),(71.5,41.5),(71.0,39.5),(68.0,37.2),(64.0,37.0)])
IFRIQIYA = L([(8.0,37.3),(11.5,37.2),(11.2,33.0),(10.0,31.5),(8.0,33.0)])
SIND = L([(66.5,24.0),(68.8,23.8),(71.5,27.5),(72.0,30.5),(70.0,30.0),(67.0,27.0)])
regions['mAbbasid800'] = unary_union([regions['mCaliph661'], TRANSOXIANA, IFRIQIYA, SIND, CYRENAICA,
                                      L([(11.2,33.0),(15.5,32.4),(19.5,30.3),(20.0,29.5),(15.0,29.5),(11.0,31.0)])])

# ---------- steppe neighbours ----------
regions['mAvars600'] = L([(16.0,46.9),(17.3,48.1),(19.0,48.6),(21.5,48.4),(23.0,47.9),(24.6,47.0),(24.5,45.9),(22.6,44.7),
                          (21.0,44.8),(19.2,44.9),(18.0,45.3),(16.6,45.9)])
regions['mBulgars800'] = L([(22.3,44.0),(23.0,45.2),(25.0,45.0),(27.0,44.4),(28.7,45.3),(30.0,45.8),(29.6,44.9),(28.7,43.9),
                            (28.0,42.6),(27.0,42.2),(25.5,42.6),(24.0,42.6),(23.2,42.8),(22.5,43.4)])
regions['mWesternTurks600'] = L([(57.0,40.5),(59.0,45.0),(66.0,47.0),(75.0,47.5),(85.0,47.0),(90.0,45.0),(88.0,42.5),(80.0,42.0),
                                 (75.0,40.0),(70.0,40.5),(64.0,39.5),(60.0,39.0)])
regions['mTarim'] = L([(75.0,37.0),(75.5,40.0),(80.0,42.3),(86.0,42.8),(90.0,43.2),(93.5,42.6),(93.5,40.0),(90.0,38.4),(84.0,36.3),(78.0,36.3)])

# ---------- Franks and Spain ----------
PROVENCE = L([(4.6,43.25),(4.8,44.1),(5.6,44.4),(6.3,44.9),(7.0,45.2),(7.6,44.1),(7.5,43.7),(6.2,42.9)])
SEPTIMANIA = L([(1.7,42.35),(3.25,42.3),(3.6,43.25),(4.55,43.35),(4.45,44.05),(3.3,44.1),(2.3,43.65),(1.55,43.2)])
ALAMANNIA = L([(7.5,47.5),(7.6,48.9),(9.0,49.5),(10.5,49.0),(10.9,47.5),(9.6,47.3),(8.5,47.5)])
ALPINE = L([(4.6,44.4),(5.8,44.9),(5.9,46.3),(6.8,47.6),(9.6,47.6),(10.4,46.6),(9.0,46.0),(7.8,45.8),(7.0,45.2),(6.3,44.9),(5.6,44.4)])
FRISIA = L([(4.5,52.0),(5.0,53.4),(7.2,53.6),(7.5,52.5),(6.5,51.8)])
THURINGIA = L([(9.5,50.3),(10.0,51.6),(12.3,51.6),(12.4,50.4),(11.0,50.1)])
SAXONY = L([(6.8,52.0),(7.2,53.6),(9.0,54.0),(10.8,53.9),(11.6,52.6),(11.0,51.5),(9.0,51.2),(7.5,51.3)])
BAVARIA = L([(10.0,47.3),(10.2,49.4),(12.1,49.8),(13.8,48.8),(13.0,47.4),(12.0,47.5)])
EASTMARCH = L([(13.0,47.4),(13.8,48.8),(16.9,48.6),(17.2,47.0),(16.0,46.3),(14.5,46.3),(13.5,46.5)])
SPANISH_MARCH = L([(0.8,42.6),(3.3,42.4),(2.6,41.4),(1.3,41.1),(0.6,41.6)])
regions['mSeptimania'] = SEPTIMANIA
regions['mFranks600'] = unary_union([G('lFranks511'), G('e476Burgundians'), PROVENCE, ALAMANNIA, ALPINE.difference(italy)]).buffer(.03).buffer(-.03).intersection(land).difference(SEPTIMANIA.buffer(.02))
regions['mFranks768'] = unary_union([regions['mFranks600'], SEPTIMANIA, FRISIA, THURINGIA])
regions['mCarolingian814'] = unary_union([regions['mFranks768'], SAXONY, BAVARIA, EASTMARCH, SPANISH_MARCH,
                                          regions['mLombards750'].difference(BENEVENTO.buffer(.02)), regions['mPapal756']])
ASTURIAS = L([(-9.5,42.6),(-9.4,43.9),(-7.0,43.7),(-3.0,43.6),(-3.0,42.7),(-6.0,42.5)])
regions['mAndalus750'] = G('gIberia').difference(ASTURIAS.buffer(.02))


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
