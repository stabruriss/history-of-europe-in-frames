"""Add teaching areas for the Ottoman, Safavid, Russian and Polish–Lithuanian lines (1501—1923) to history_geo.json.

Usage: <python with shapely> build_ote_geo.py   (run after build_france18_geo.py). Teaching regions only, not reconstructed frontiers.
Points are (lon, lat). Shapes are clipped to the base land layer, so outlines may run across water.
Ottoman world:
- osOttoman1566: lands under direct Ottoman rule when Suleiman died (Balkans with central Hungary, Anatolia, the Levant, Iraq, Egypt,
  the Hejaz, Yemen, al-Hasa, Algiers, Tripoli). osVassals1566: tributary Wallachia, Moldavia, Transylvania and the Crimean Khanate.
- osSafavid1514: Safavid Persia at Chaldiran (with Iraq and Diyarbakir); osSafavid1600: Safavid Persia under Abbas I.
- osOttoman1683: the empire at its widest in Europe (1566 plus Tunis, Cyprus, Crete and Podolia).
- osCeded1699: what Karlowitz took away (Hungary and Transylvania to Austria, Podolia to Poland, the Morea to Venice).
- osOttoman1830: the empire after Greek independence (Egypt drawn apart); osGreece1832: the first Kingdom of Greece (Arta–Volos line).
- osMuhammadAli1839: Muhammad Ali's realm at its height (Egypt, the northern Sudan, the Levant with Adana, the Hejaz, Crete).
- osOttoman1878: the empire after the Congress of Berlin; osBalkanStates1878: Romania, Serbia, Montenegro, Bulgaria with Eastern
  Rumelia; osBosnia1878: Bosnia-Herzegovina under Austro-Hungarian occupation; osCyprus1878: Cyprus under British administration.
- osOttoman1914: the empire on the eve of the war (Eastern Thrace, Anatolia, the Levant, Iraq, the Hejaz, Yemen).
- osMandateBritish1920 / osMandateFrench1920: Iraq, Palestine and Transjordan; Syria and Lebanon (roughly the Sykes–Picot split).
- osSmyrnaZone1920: the Greek-administered Smyrna zone; osTurkey1923: the Republic of Turkey after Lausanne (without Hatay).
Russia and Poland–Lithuania:
- ruMuscovy1505: Muscovy when Ivan III died; ruRussia1598: after Kazan, Astrakhan and western Siberia, when the Rurikids died out.
- plCommonwealth1569: Poland–Lithuania after the Union of Lublin (with Livonia, Courland and ducal Prussia).
- ruRussia1689: Russia at Nerchinsk (to the Pacific, with Kyiv and Left-bank Ukraine, still without the Baltic).
- ruRussia1725: after Nystad (Ingria, Estonia, Livonia, Vyborg) and Kamchatka.
- plPrussiaShare1795 / plAustriaShare1795 / plRussiaShare1795: what each power took in the three partitions (1772—1795).
- ruRussia1796: Russia when Catherine II died (with the partition share, New Russia and the Crimea).
- ruRussia1914: the Russian Empire in 1914; ruBrestLitovsk1918: what Russia gave up at Brest-Litovsk; ruUSSR1922: the Soviet Union.
- plPoland1921: the Second Polish Republic after the Treaty of Riga.
The First World War: wwGermany1914 (the German Empire), wwAustriaHungary1914 (Austria-Hungary with Bosnia).
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon
from shapely.ops import unary_union

base = json.loads(Path('data.json').read_text())
geo = json.loads(Path('history_geo.json').read_text())
land = shape(base['land']).buffer(0)
G = lambda k: shape(geo[k]).buffer(0)
L = lambda pts: land.intersection(Polygon(pts)).buffer(0)
U = lambda *parts: unary_union(list(parts)).buffer(0)
regions = {}

# ---------- Pieces of the Ottoman world ----------
# Balkans south of the Danube–Sava (Greece and Albania included; Venetian Dalmatia, Corfu and Crete left out).
BALKANS = L([(15.7, 44.6), (16.6, 45.25), (19.2, 44.95), (20.5, 44.8), (22.5, 44.6), (22.9, 44.1), (24.5, 43.7), (26.0, 43.8),
             (27.5, 44.1), (28.3, 45.2), (29.7, 45.3), (30.2, 44.0), (29.6, 41.3), (29.05, 41.05), (28.5, 40.6), (26.6, 40.3),
             (25.5, 39.8), (25.3, 37.2), (23.5, 36.0), (21.3, 36.6), (21.0, 37.9), (20.6, 38.9), (20.15, 39.4), (19.4, 40.4),
             (19.4, 41.9), (18.4, 42.5), (17.6, 43.0), (16.8, 43.4), (16.0, 44.0)])
# Ottoman central Hungary with Slavonia and the Banat (Szigetvár, Buda, Esztergom, Szolnok, Temesvár).
HUNGARY_OTT = L([(16.6, 45.25), (16.5, 45.9), (17.4, 46.45), (18.2, 47.15), (18.75, 47.8), (19.7, 47.85), (20.6, 47.45),
                 (21.6, 46.7), (22.0, 45.9), (22.5, 44.7), (21.0, 44.7), (19.2, 44.95)])
TRANSYLVANIA = L([(21.6, 46.7), (22.0, 47.7), (24.0, 48.0), (25.0, 47.7), (26.0, 46.6), (25.8, 45.5), (24.0, 45.4), (22.5, 45.6)])
DANUBIAN = L([(21.8, 47.6), (24.0, 48.0), (26.6, 48.4), (28.2, 48.2), (29.6, 46.9), (28.7, 45.9), (28.2, 45.4), (27.0, 44.15),
              (22.8, 44.1), (22.3, 44.7), (22.0, 45.9), (21.6, 46.7)])
CRIMEA_KH = L([(30.8, 46.7), (33.3, 47.6), (37.0, 47.3), (38.6, 46.6), (38.0, 45.9), (36.9, 45.2), (35.6, 44.5), (33.4, 44.3),
               (32.3, 45.3), (31.0, 46.0)])
# Asia Minor up to the Amasya (1555) line with Persia; the south edge runs along the later Turkish–Syrian border, north of Cyprus.
ANATOLIA = L([(25.8, 39.5), (26.5, 40.6), (28.5, 40.6), (29.05, 41.05), (29.6, 41.3), (31.5, 41.6), (35.0, 42.4), (37.5, 41.4),
              (41.5, 41.7), (42.8, 41.2), (43.6, 40.0), (44.4, 38.7), (44.6, 37.3), (42.3, 37.1), (40.0, 36.8), (38.0, 36.8),
              (36.6, 36.9), (36.0, 35.8), (34.5, 35.9), (32.0, 35.9), (29.5, 35.9), (27.5, 36.2), (26.0, 37.5)])
LEVANT = L([(35.9, 35.8), (36.6, 36.9), (38.5, 36.8), (40.5, 35.0), (39.0, 33.0), (37.0, 31.0), (36.0, 29.5), (34.9, 29.5),
            (34.2, 31.3), (34.6, 32.2), (35.0, 33.2), (35.6, 34.4)])
IRAQ = L([(42.3, 37.1), (44.6, 37.3), (45.8, 35.5), (46.2, 33.6), (47.6, 31.6), (48.6, 30.0), (47.7, 29.4), (46.5, 30.5),
          (44.0, 31.0), (41.0, 33.0), (40.5, 35.0), (40.0, 36.8)])
EGYPT = L([(28.5, 31.3), (32.3, 31.6), (34.3, 31.4), (34.95, 29.55), (34.3, 27.6), (35.8, 23.5), (31.5, 22.0), (30.5, 24.0),
           (29.5, 28.5), (28.4, 30.5)])
HEJAZ = L([(34.95, 29.55), (36.0, 29.5), (37.6, 28.5), (39.6, 26.0), (41.0, 22.5), (42.6, 18.5), (43.0, 17.3), (42.3, 16.4),
           (40.8, 19.0), (39.0, 21.5), (38.0, 24.0), (36.5, 26.3), (35.0, 28.2)])
YEMEN = L([(42.6, 17.4), (43.9, 17.2), (45.3, 15.3), (45.3, 12.8), (43.3, 12.6), (42.6, 15.2)])
HASA = L([(47.7, 29.2), (48.5, 28.0), (49.8, 26.6), (50.3, 25.2), (49.5, 24.6), (48.7, 26.2), (47.4, 28.3)])
ALGIERS = L([(-1.0, 35.5), (2.0, 36.7), (8.6, 37.0), (8.3, 34.5), (5.0, 33.8), (0.5, 34.0), (-1.4, 34.9)])
TUNIS = L([(8.3, 34.5), (8.6, 37.0), (11.3, 37.4), (11.5, 33.2), (10.0, 32.5), (8.0, 33.0)])
TRIPOLI = L([(11.5, 33.2), (15.3, 32.6), (19.0, 30.2), (20.0, 32.3), (25.0, 31.8), (25.0, 29.5), (17.0, 28.5), (11.5, 30.5)])
CRETE = L([(23.4, 35.1), (23.4, 35.75), (26.4, 35.4), (26.4, 34.85), (24.5, 34.8)])
CYPRUS = L([(32.2, 34.5), (32.2, 35.8), (34.7, 35.8), (34.7, 34.5)])
PODOLIA = L([(26.2, 49.6), (27.0, 49.9), (28.5, 49.6), (29.5, 48.3), (28.3, 48.0), (26.4, 48.5)])
MOREA = L([(21.0, 37.0), (21.0, 38.4), (23.5, 38.2), (23.5, 36.3), (22.3, 36.3)])
SUDAN_N = L([(31.0, 22.0), (36.9, 22.0), (37.4, 18.5), (36.5, 14.0), (34.0, 12.0), (30.0, 11.5), (27.5, 13.5), (27.5, 20.0)])
ADANA = L([(34.5, 36.5), (35.0, 37.6), (36.5, 37.6), (36.6, 36.9), (36.0, 35.8)])
GREECE1832 = L([(20.7, 38.9), (21.0, 39.15), (22.0, 39.0), (22.95, 39.3), (23.6, 39.1), (24.6, 38.6), (26.0, 37.5), (25.8, 36.3),
                (23.0, 36.2), (21.3, 36.6), (21.0, 37.8)])
# Kars, Ardahan and Batumi (to Russia 1878); Batumi alone stayed Soviet after the Treaty of Kars (1921).
KARS = L([(41.4, 41.75), (43.4, 41.25), (44.0, 40.3), (43.0, 40.0), (42.3, 40.4), (41.6, 41.0)])
BATUMI = L([(41.4, 41.75), (42.3, 41.6), (42.2, 41.3), (41.6, 41.3)])
HATAY = L([(35.8, 35.8), (35.8, 36.9), (36.7, 36.9), (36.6, 36.2), (36.2, 35.8)])
EAST_THRACE = L([(26.0, 40.6), (26.3, 41.2), (26.3, 41.75), (26.6, 41.95), (27.4, 42.0), (28.0, 41.98), (29.6, 41.3),
                 (29.05, 41.05), (28.5, 40.6), (26.6, 40.3)])
# Ottoman Europe after Berlin: Thrace, Macedonia, Albania, Epirus, Thessaly, Kosovo and the sanjak of Novi Pazar.
BALKANS1878 = L([(19.3, 40.4), (19.4, 41.8), (19.8, 42.5), (20.3, 43.2), (20.8, 43.3), (21.2, 42.9), (22.0, 42.4), (23.0, 42.0),
                 (24.5, 41.6), (26.4, 41.8), (27.9, 42.0), (29.6, 41.3), (29.05, 41.05), (28.5, 40.6), (26.6, 40.3), (25.6, 39.9),
                 (23.3, 39.3), (22.95, 39.3), (21.0, 39.15), (20.7, 38.9), (20.1, 39.4)])
ROMANIA1878 = L([(22.4, 44.6), (23.0, 45.4), (25.5, 45.4), (26.2, 45.8), (25.9, 47.0), (26.2, 47.8), (26.7, 48.25), (27.6, 47.4),
                 (28.1, 46.5), (28.2, 45.5), (29.7, 45.2), (28.6, 43.75), (27.3, 44.1), (25.0, 43.6), (22.9, 44.0)])
SERBIA1878 = L([(19.1, 44.9), (20.5, 44.8), (22.5, 44.6), (22.9, 44.0), (22.4, 43.4), (22.4, 42.5), (21.9, 42.4), (21.2, 42.9),
                (20.8, 43.3), (19.6, 43.8), (19.3, 44.3)])
MONTENEGRO1878 = L([(18.5, 42.4), (18.7, 43.0), (19.3, 43.3), (20.3, 43.2), (19.8, 42.5), (19.4, 41.85), (19.0, 41.9)])
BULGARIA1878 = L([(22.9, 44.0), (25.0, 43.6), (27.3, 44.1), (28.6, 43.75), (27.9, 42.0), (26.4, 41.8), (24.5, 41.6), (23.0, 42.0),
                  (22.4, 42.2), (22.4, 43.4)])
BOSNIA = L([(15.7, 44.6), (16.6, 45.25), (19.1, 44.95), (19.3, 44.3), (19.6, 43.8), (18.7, 43.0), (18.5, 42.4), (17.6, 43.0),
            (16.8, 43.4), (16.0, 44.0)])
PAL_TJ = L([(34.2, 31.3), (34.9, 29.5), (36.1, 29.2), (37.5, 30.3), (38.0, 31.5), (39.3, 32.2), (38.8, 33.4), (36.8, 32.4),
            (35.8, 32.7), (35.6, 33.2), (35.1, 33.1)])
SYRIA_LEB = L([(35.1, 33.1), (35.6, 33.2), (35.8, 32.7), (36.8, 32.4), (38.8, 33.4), (40.9, 34.4), (41.2, 35.6), (42.3, 37.1),
               (40.0, 36.8), (38.0, 36.8), (36.6, 36.9), (36.0, 35.8), (35.9, 35.0), (35.5, 34.0)])

regions['osOttoman1566'] = U(BALKANS, HUNGARY_OTT, ANATOLIA, LEVANT, IRAQ, EGYPT, HEJAZ, YEMEN, HASA, ALGIERS, TRIPOLI)
regions['osVassals1566'] = U(DANUBIAN, TRANSYLVANIA, CRIMEA_KH).difference(regions['osOttoman1566'].buffer(.01)).buffer(0)
SAFAVID = L([(48.6, 30.0), (47.6, 31.6), (46.2, 33.6), (45.8, 35.5), (44.6, 37.3), (44.4, 38.7), (43.6, 40.0), (43.4, 41.2),
             (44.0, 42.4), (46.0, 42.0), (48.0, 42.0), (48.5, 41.5), (49.6, 40.3), (49.0, 38.5), (50.5, 37.0), (54.0, 36.8),
             (56.5, 38.0), (59.5, 37.0), (61.5, 35.6), (62.8, 34.5), (61.8, 31.0), (61.6, 25.2), (57.5, 25.6), (54.0, 26.5),
             (51.5, 27.8), (50.2, 29.5)])
DIYARBAKIR = L([(38.5, 37.0), (38.8, 39.9), (40.5, 40.4), (42.8, 41.2), (43.6, 40.0), (44.4, 38.7), (44.6, 37.3), (42.3, 37.1),
                (40.0, 36.8)])
regions['osSafavid1600'] = SAFAVID
regions['osSafavid1514'] = U(SAFAVID, IRAQ, DIYARBAKIR)
regions['osOttoman1683'] = U(regions['osOttoman1566'], TUNIS, CYPRUS, CRETE, PODOLIA)
regions['osCeded1699'] = U(HUNGARY_OTT, TRANSYLVANIA, PODOLIA, MOREA)
regions['osGreece1832'] = GREECE1832
regions['osOttoman1830'] = U(BALKANS.difference(GREECE1832.buffer(.01)), ANATOLIA, LEVANT, IRAQ, HEJAZ, TRIPOLI, CRETE)
regions['osMuhammadAli1839'] = U(EGYPT, SUDAN_N, LEVANT, ADANA, HEJAZ, CRETE)
regions['osOttoman1878'] = U(BALKANS1878, ANATOLIA.difference(KARS.buffer(.01)), LEVANT, IRAQ, HEJAZ, YEMEN, HASA, TRIPOLI, CRETE)
regions['osBalkanStates1878'] = U(ROMANIA1878, SERBIA1878, MONTENEGRO1878, BULGARIA1878).difference(BALKANS1878.buffer(.01)).buffer(0)
regions['osBosnia1878'] = BOSNIA
regions['osCyprus1878'] = CYPRUS
regions['osOttoman1914'] = U(EAST_THRACE, ANATOLIA.difference(KARS.buffer(.01)), LEVANT, IRAQ, HEJAZ, YEMEN)
regions['osMandateBritish1920'] = U(IRAQ, PAL_TJ)
regions['osMandateFrench1920'] = SYRIA_LEB.difference(PAL_TJ.buffer(.01)).buffer(0)
regions['osSmyrnaZone1920'] = L([(26.2, 38.0), (26.5, 39.2), (27.6, 39.4), (28.4, 38.9), (28.2, 37.9), (27.2, 37.7)])
regions['osTurkey1923'] = U(EAST_THRACE, ANATOLIA.difference(BATUMI.buffer(.01))).difference(HATAY.buffer(.01)).buffer(0)

# ---------- Russia and Poland–Lithuania ----------
MUSCOVY = L([(28.0, 57.5), (28.2, 59.4), (30.0, 60.5), (33.0, 63.5), (37.0, 66.5), (44.0, 66.5), (54.0, 68.0), (60.0, 66.0),
             (59.0, 60.0), (52.0, 58.0), (46.5, 56.4), (44.5, 55.3), (41.5, 54.0), (39.0, 53.2), (36.0, 52.5), (34.5, 51.5),
             (32.5, 51.0), (31.5, 52.0), (32.0, 53.5), (31.5, 55.5), (29.0, 56.5)])
VOLGA_SIBERIA = L([(46.5, 56.4), (52.0, 58.0), (59.0, 60.0), (60.0, 66.0), (54.0, 68.0), (60.0, 67.5), (70.0, 67.0), (68.0, 63.0),
                   (73.0, 58.5), (74.5, 56.5), (70.0, 56.0), (62.0, 55.0), (56.0, 53.0), (52.0, 51.5), (48.5, 48.5), (47.5, 46.0),
                   (45.5, 45.5), (44.5, 47.5), (42.0, 50.0), (38.0, 50.5), (36.0, 50.5), (34.5, 51.5), (36.0, 52.5), (39.0, 53.2),
                   (41.5, 54.0), (44.5, 55.3)])
SMOLENSK = L([(30.8, 54.4), (31.5, 55.5), (32.0, 53.5), (31.0, 53.2), (30.5, 53.9)])
regions['ruMuscovy1505'] = MUSCOVY
regions['ruRussia1598'] = U(MUSCOVY, VOLGA_SIBERIA, SMOLENSK)
COMMONWEALTH = L([(15.8, 52.3), (16.4, 53.4), (17.0, 54.6), (18.6, 54.4), (20.0, 54.9), (21.0, 56.0), (21.5, 57.5), (24.0, 58.3),
                  (26.0, 58.4), (27.8, 58.0), (28.0, 56.7), (30.0, 55.8), (31.0, 54.5), (30.5, 53.9), (31.0, 53.2), (33.0, 51.5),
                  (35.5, 50.3), (33.5, 48.8), (31.0, 48.3), (29.0, 48.1), (26.5, 48.3), (24.8, 48.2), (22.5, 49.0), (19.5, 49.3),
                  (19.0, 50.0), (18.3, 51.2), (16.2, 51.8)])
regions['plCommonwealth1569'] = COMMONWEALTH
# Siberia to the Pacific north of the Amur basin (the Argun and the Stanovoy range at Nerchinsk), Kamchatka not yet included.
SIBERIA1689 = L([(60.0, 67.5), (70.0, 73.5), (105.0, 78.0), (140.0, 74.0), (179.9, 71.0), (179.9, 64.0), (170.0, 60.0),
                 (163.0, 61.5), (155.0, 59.5), (143.0, 59.3), (137.0, 55.5), (135.0, 54.5), (125.0, 55.3), (121.5, 53.3),
                 (117.0, 50.0), (107.0, 50.5), (100.0, 52.0), (93.0, 54.5), (87.0, 53.5), (80.0, 54.5), (74.5, 56.5), (73.0, 58.5),
                 (68.0, 63.0), (70.0, 67.0)])
# West of the Urals in 1689: Smolensk, Kyiv and Left-bank Ukraine are Russian; Ingria and Karelia are still Swedish.
WEST1689 = L([(28.0, 57.8), (28.0, 58.9), (30.0, 59.0), (32.0, 60.0), (32.0, 62.0), (30.0, 64.0), (29.0, 69.8), (37.0, 69.5),
              (44.0, 68.5), (54.0, 68.5), (60.0, 67.5), (59.0, 60.0), (62.0, 55.0), (56.0, 53.0), (52.0, 51.5), (48.5, 48.5),
              (47.5, 46.0), (45.5, 45.5), (44.5, 47.5), (40.0, 49.0), (36.5, 49.0), (35.0, 48.6), (33.0, 48.6), (31.0, 49.3),
              (30.4, 50.4), (30.6, 51.5), (31.8, 52.3), (31.2, 53.5), (31.0, 54.5), (30.0, 55.8), (28.6, 56.4)])
regions['ruRussia1689'] = U(WEST1689, VOLGA_SIBERIA, SIBERIA1689)
BALTIC1721 = L([(21.5, 57.4), (22.0, 59.2), (27.0, 60.6), (28.0, 61.0), (30.6, 61.6), (32.0, 60.3), (30.5, 59.5), (28.0, 58.9),
                (27.6, 57.8), (26.0, 56.8), (24.2, 56.8), (23.3, 57.2)])
KAMCHATKA = L([(155.0, 59.5), (163.5, 61.0), (166.0, 56.0), (162.0, 51.0), (156.5, 50.8), (155.5, 55.0)])
regions['ruRussia1725'] = U(regions['ruRussia1689'], BALTIC1721, KAMCHATKA)
regions['plPrussiaShare1795'] = L([(15.8, 52.3), (16.4, 53.4), (17.0, 54.6), (18.6, 54.4), (19.6, 54.3), (20.5, 53.6), (22.5, 53.9),
                                   (23.5, 54.2), (23.0, 53.0), (22.0, 52.4), (21.6, 52.0), (20.5, 51.4), (19.2, 50.4), (18.3, 51.2),
                                   (16.2, 51.8)])
regions['plAustriaShare1795'] = L([(19.0, 50.0), (19.2, 50.4), (20.5, 51.4), (21.6, 52.0), (23.6, 51.7), (24.1, 50.7), (25.5, 50.3),
                                   (26.2, 49.6), (26.3, 48.6), (24.8, 48.2), (22.5, 49.0), (19.5, 49.3)])
regions['plRussiaShare1795'] = COMMONWEALTH.difference(U(regions['plPrussiaShare1795'], regions['plAustriaShare1795']).buffer(.01)).buffer(0)
NEW_RUSSIA = L([(29.6, 46.9), (30.2, 48.0), (33.0, 48.5), (36.0, 49.2), (39.5, 49.5), (41.5, 48.0), (41.0, 46.5), (38.5, 45.5),
                (37.0, 45.0), (36.5, 45.4), (33.4, 44.3), (32.3, 45.3), (31.0, 46.3), (30.2, 46.2)])
STEPPE_LINE = L([(50.0, 51.5), (55.0, 50.8), (61.0, 50.8), (69.0, 53.5), (74.5, 54.0), (80.0, 52.5), (87.0, 52.0), (87.0, 53.5),
                 (80.0, 54.5), (74.5, 56.5), (70.0, 56.0), (62.0, 55.0), (56.0, 53.0), (52.0, 51.5)])
regions['ruRussia1796'] = U(regions['ruRussia1725'], regions['plRussiaShare1795'], NEW_RUSSIA, STEPPE_LINE)
RUSSIA1914 = L([(21.1, 55.9), (22.8, 54.4), (22.6, 53.9), (21.0, 53.4), (19.0, 53.2), (18.6, 52.6), (18.0, 52.0), (18.4, 51.3),
                (19.2, 50.3), (20.0, 50.1), (21.8, 50.3), (23.6, 50.4), (24.1, 50.6), (25.0, 50.2), (26.0, 49.4), (26.2, 48.5),
                (26.7, 48.3), (27.3, 47.8), (28.1, 46.5), (28.2, 45.5), (29.7, 45.2), (32.0, 44.0), (38.0, 43.5), (41.4, 41.75),
                (42.3, 41.6), (43.4, 41.25), (44.0, 40.3), (44.8, 39.7), (46.0, 38.9), (48.0, 39.4), (48.9, 38.4), (51.0, 38.0),
                (54.0, 37.3), (58.4, 37.6), (61.0, 36.5), (62.3, 35.3), (65.0, 37.3), (67.8, 37.2), (71.5, 37.0), (74.8, 37.3),
                (73.5, 39.5), (75.5, 40.6), (78.0, 41.3), (80.2, 42.2), (80.3, 44.9), (82.5, 45.3), (82.8, 47.0), (85.5, 47.1),
                (86.8, 49.0), (87.5, 49.2), (90.0, 50.4), (98.0, 50.5), (106.4, 50.3), (111.0, 49.8), (116.0, 49.9), (120.5, 53.3),
                (126.0, 53.4), (131.0, 49.4), (134.7, 48.3), (133.0, 45.0), (131.2, 42.9),
                (135.0, 43.0), (141.0, 48.0), (143.5, 50.0), (145.0, 54.0), (155.0, 50.5), (166.0, 56.0),
                (179.9, 62.0), (179.9, 71.0), (140.0, 74.0), (105.0, 78.0), (70.0, 73.5), (60.0, 70.0), (44.0, 68.8),
                (37.0, 70.0), (31.0, 70.0), (28.5, 69.0), (29.5, 67.5), (30.0, 64.0), (31.5, 62.0), (29.0, 61.2), (27.0, 60.5),
                (22.0, 59.2), (21.0, 57.5)])
FINLAND = G('nFinland')
regions['ruRussia1914'] = U(RUSSIA1914, FINLAND)
BALTIC3 = L([(21.0, 55.9), (21.0, 57.5), (22.0, 59.5), (28.2, 59.4), (27.7, 57.8), (28.2, 56.2), (26.6, 55.7), (25.5, 55.2),
             (24.6, 54.6), (24.3, 54.0), (23.4, 54.2), (22.8, 54.4)])
POLAND1921 = L([(17.6, 54.8), (18.5, 54.5), (19.0, 53.4), (20.6, 53.2), (22.6, 53.9), (23.4, 54.2), (24.3, 54.0), (24.6, 54.6),
                (25.5, 55.2), (26.6, 55.7), (27.6, 55.4), (27.3, 54.2), (26.8, 53.5), (27.3, 52.8), (27.6, 51.6), (26.8, 50.8),
                (26.2, 49.7), (26.0, 48.8), (25.2, 48.2), (24.0, 48.4), (22.6, 49.1), (20.9, 49.3), (19.0, 49.4), (18.6, 50.0),
                (18.9, 50.4), (18.4, 51.1), (17.5, 51.6), (16.2, 52.3), (16.6, 53.0), (17.4, 53.6), (17.3, 54.3)])
regions['plPoland1921'] = POLAND1921
BESSARABIA = L([(26.6, 48.3), (27.5, 48.5), (29.2, 48.0), (30.2, 46.4), (29.7, 45.3), (28.2, 45.5), (28.1, 46.5), (27.3, 47.8)])
UKRAINE1918 = L([(23.8, 51.6), (26.0, 52.0), (30.0, 51.5), (32.0, 52.3), (34.5, 52.3), (36.0, 51.0), (38.0, 50.0), (39.8, 49.0),
                 (38.0, 47.0), (35.0, 46.4), (33.5, 46.0), (31.5, 46.6), (30.2, 46.4), (29.2, 48.0), (27.5, 48.5), (26.2, 48.5),
                 (26.0, 49.5), (24.0, 50.5)])
regions['ruBrestLitovsk1918'] = U(FINLAND, BALTIC3, POLAND1921, UKRAINE1918, KARS).intersection(U(RUSSIA1914, FINLAND).buffer(.05)).buffer(0)
regions['ruUSSR1922'] = RUSSIA1914.difference(U(FINLAND, BALTIC3, POLAND1921, BESSARABIA, KARS.difference(BATUMI)).buffer(.01)).buffer(0)

# ---------- The First World War ----------
regions['wwGermany1914'] = L([(6.1, 53.5), (7.1, 52.2), (6.0, 50.8), (6.1, 50.1), (6.4, 49.5), (5.9, 49.5), (6.9, 48.3),
                              (7.6, 47.55), (8.6, 47.6), (9.6, 47.5), (10.5, 47.4), (12.2, 47.7), (13.0, 47.5), (13.8, 48.6),
                              (12.1, 50.3), (14.4, 51.0), (15.0, 51.0), (16.3, 50.6), (17.0, 50.2), (18.0, 50.0), (19.2, 50.3),
                              (18.4, 51.3), (18.0, 52.0), (18.6, 52.6), (19.0, 53.2), (21.0, 53.4), (22.6, 53.9), (22.8, 54.4),
                              (21.1, 55.9), (14.0, 54.5), (11.0, 54.5), (9.4, 54.8), (8.3, 55.0), (8.5, 53.9)])
regions['wwAustriaHungary1914'] = L([(9.5, 47.5), (10.5, 47.4), (12.2, 47.7), (13.0, 47.5), (13.8, 48.6), (12.1, 50.3), (14.4, 51.0),
                                     (15.0, 51.0), (16.3, 50.6), (17.0, 50.2), (18.0, 50.0), (19.2, 50.3), (20.0, 50.1), (21.8, 50.3),
                                     (23.6, 50.4), (24.1, 50.6), (25.0, 50.2), (26.0, 49.4), (26.2, 48.5), (26.7, 48.3), (25.9, 47.8),
                                     (26.0, 46.6), (25.5, 45.4), (23.0, 45.4), (22.4, 44.6), (20.5, 44.8), (19.1, 44.95), (19.3, 44.3),
                                     (19.6, 43.8), (18.7, 43.0), (18.5, 42.4), (17.2, 42.6), (15.0, 44.0), (13.6, 44.8), (13.6, 45.7),
                                     (13.5, 46.4), (12.4, 46.7), (11.0, 46.0), (10.4, 46.5), (9.5, 47.0)])

for k, v in regions.items():
    assert not v.is_empty and v.area > .05, (k, v.area)
    geo[k] = mapping(v)
print(len(regions), 'ote regions:', ', '.join(f'{k} {v.area:.2f}' for k, v in regions.items()))
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
