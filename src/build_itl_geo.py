"""Add teaching areas for the Italian line (1559—1929) and the Low Countries line (1648—1914) to history_geo.json (v101).

Usage: <python with shapely> build_itl_geo.py   (run after build_china_geo.py, in project-files/src). Teaching regions only, not
reconstructed frontiers: they get the big divisions right (Venice on the Adda and the Po, the Papal States from the Po to Terracina,
Naples with the Abruzzi up to the Tronto, Savoy-Piedmont growing east to the Ticino, the Mincio line of 1859, the 1866 and 1919
borders in the northeast; the Dutch Republic with the Generality Lands, the 1839 split of Limburg and Luxembourg) and no more.
Points are (lon, lat). Shapes are clipped to the base land layer, so outlines may run across water.
Italy:
- itVenice1600 (the Terraferma, Venetian Istria and Dalmatia, the Bocche, the Ionian islands); itCrete1600 (Crete, lost in 1669).
- itPapal1600 / itPapal1815 (the Papal States from Ferrara to Terracina); itTuscany (the grand duchy, without Lucca); itGenoa1600
  (Liguria with Corsica); itParma; itModena; itSardinia1720 (Savoy, Piedmont with Monferrato and Alessandria, Nice, the island of
  Sardinia); itSardinia1748 (east to the Ticino, with the Oltrepo); itSardinia1815 (with Genoa); itSardinia1859 (with Lombardy west
  of the Mincio); itAustria1720 (Milan, Mantua, Naples and Sicily); itTwoSicilies (Naples with Sicily); itLombardy1748 (Milan and
  Mantua); itLombardyVenetia1815; itCentral1860 (Tuscany, Parma, Modena and the Legations); itNiceSavoy1860; itMarcheUmbria1860;
  itItaly1861; itVeneto1866 (Venetia with Mantua); itLazio1870 (the Papal State of 1860—1870); itItaly1871; itLondonPact1915 (what
  the Treaty of London promised: Trentino, South Tyrol, the Littoral, Istria without Fiume, northern Dalmatia); itGains1920 (what
  Italy got: Trentino-Alto Adige, Venezia Giulia, Istria, Zara); itItaly1924 (with Fiume); itLibya1912; itEritrea1890; itEthiopia1896.
The Low Countries:
- lcDutchRepublic1648 (the United Provinces with the Generality Lands); lcSouthern1648 (the Spanish Netherlands after Muenster, with
  Artois and Walloon Flanders, without Liege); lcAustrian1714 (the Austrian Netherlands); lcLiege (the prince-bishopric);
  lcBatavian1795 (the Batavian Republic and the Kingdom of Holland); lcUnited1815 (the United Kingdom of the Netherlands);
  lcLuxembourg1815 (the grand duchy before the split); lcBelgium1839; lcNetherlands1839; lcLuxembourg1839; lcLimburg1839 (Dutch
  Limburg); lcLuxBelgian1839 (Belgian Luxembourg); lcJava; lcEastIndies1914; lcCongo1885; lcSuriname1667.
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon, box
from shapely.ops import unary_union

base = json.loads(Path('data.json').read_text())
geo = json.loads(Path('history_geo.json').read_text())
land = shape(base['land']).buffer(0)
G = lambda k: shape(geo[k]).buffer(0)
L = lambda pts: land.intersection(Polygon(pts)).buffer(0)
U = lambda *parts: unary_union(list(parts)).buffer(0)
D = lambda a, *b: a.difference(U(*b).buffer(.01)).buffer(0)
regions = {}

# ---------- Shared lines (lon, lat) ----------
# Venice against Milan: the Adda and the Oglio (Bergamo, Brescia and Crema Venetian; Lodi and Cremona Milanese).
VEN_W = [(9.45, 46.1), (9.5, 45.85), (9.52, 45.6), (9.6, 45.4), (9.75, 45.3), (10.0, 45.2), (10.45, 45.15)]
# Venice's northern rim against the Grisons and the Tyrol, east to the Carnic Alps; reused for the 1866 border.
VEN_N = [(13.35, 46.5), (12.75, 46.65), (12.2, 46.5), (11.95, 46.25), (11.65, 45.98), (11.3, 45.85), (11.0, 45.75), (10.85, 45.83),
         (10.5, 45.85), (10.4, 46.15), (10.2, 46.25), (9.95, 46.08), (9.45, 46.1)]
# Venice against Habsburg Gorizia, from the lagoon of Marano up the Judrio to the Carnic Alps; the line of 1866 as well.
VEN_E = [(13.25, 45.72), (13.5, 46.0), (13.45, 46.25), (13.35, 46.5)]
# The Po from the Mantuan border to the delta: Venice to the north, Ferrara (papal from 1598) to the south.
PO = [(11.25, 45.0), (11.6, 44.98), (12.0, 44.97), (12.55, 44.9)]
# The Papal States against Modena (the Panaro) and then along the Apennine crest against Tuscany to the Tyrrhenian coast.
PAP_W = [(11.25, 45.0), (11.15, 44.75), (11.05, 44.45), (11.0, 44.25)]
PAP_TUS = [(11.0, 44.25), (11.35, 44.2), (11.65, 44.12), (11.9, 43.88), (12.2, 43.75), (12.25, 43.55), (12.15, 43.45), (12.05, 43.27),
           (12.02, 43.1), (11.95, 42.95), (11.8, 42.8), (11.6, 42.62), (11.45, 42.4)]
# Naples against the Papal States, from Terracina up the Liri and over the Abruzzi to the mouth of the Tronto.
NAP_N = [(13.25, 41.28), (13.5, 41.55), (13.55, 41.75), (13.3, 41.95), (13.1, 42.15), (12.95, 42.35), (13.0, 42.6), (13.25, 42.75),
         (13.6, 42.8), (13.95, 42.92)]

MANTUA = L([(10.45, 45.15), (10.6, 45.32), (10.9, 45.28), (11.25, 45.07), (11.25, 45.0), (10.75, 44.9), (10.5, 45.0)])
VENICE_TERRA = L(VEN_W + [(10.6, 45.32), (10.9, 45.28), (11.25, 45.07)] + PO + [(12.6, 45.3), (12.45, 45.5), (13.1, 45.65)] + VEN_E
                 + VEN_N[1:])
IST_VEN = L([(13.48, 45.6), (13.75, 45.5), (13.95, 45.25), (14.2, 45.05), (14.0, 44.75), (13.75, 44.8), (13.5, 45.2)])
DALM_VEN = L([(14.9, 44.6), (15.6, 44.3), (16.2, 43.8), (16.8, 43.45), (17.25, 43.4), (17.0, 43.2), (16.0, 43.05), (15.0, 43.6),
              (14.5, 44.3)])
KOTOR = L([(18.45, 42.55), (18.85, 42.55), (18.95, 42.3), (18.55, 42.35)])
IONIAN = U(L([(19.55, 39.85), (20.15, 39.85), (20.15, 39.35), (19.55, 39.35)]), L([(20.3, 38.55), (20.85, 38.55), (20.85, 38.0), (20.3, 38.0)]),
           L([(20.55, 38.0), (21.0, 38.0), (21.0, 37.6), (20.55, 37.6)]), L([(22.85, 36.4), (23.15, 36.4), (23.15, 36.1), (22.85, 36.1)]))
CRETE = L([(23.45, 35.25), (23.55, 35.7), (24.9, 35.5), (26.4, 35.4), (26.3, 34.9), (24.7, 34.85), (23.45, 35.15)])
POPE = L(PO + [(13.0, 44.3), (14.2, 43.2)] + list(reversed(NAP_N)) + [(12.6, 41.2), (11.4, 42.2)] + list(reversed(PAP_TUS))
         + list(reversed(PAP_W))[1:])
TUSCANY = L([(10.27, 43.78), (10.45, 43.76), (10.62, 43.8), (10.72, 43.95), (10.85, 44.15)] + PAP_TUS + [(11.3, 42.38), (10.9, 42.6), (10.0, 42.75),
            (10.1, 43.3)])
GENOA = L([(7.53, 43.78), (7.6, 44.05), (8.0, 44.25), (8.35, 44.4), (8.6, 44.68), (8.85, 44.8), (9.05, 44.65), (9.4, 44.5), (9.7, 44.4),
           (9.95, 44.2), (10.05, 44.05), (9.7, 43.85), (8.6, 43.95), (7.7, 43.68)])
PARMA = L([(9.35, 45.1), (10.0, 45.08), (10.5, 45.0), (10.65, 44.92), (10.5, 44.6), (10.4, 44.35), (10.0, 44.35), (9.7, 44.4), (9.4, 44.55),
           (9.35, 44.75)])
MODENA = L([(10.65, 44.92), (10.75, 44.9), (11.25, 45.0)] + PAP_W[1:] + [(10.85, 44.15), (10.75, 44.05), (10.45, 44.0), (10.35, 44.3),
           (10.4, 44.35), (10.5, 44.6)])
NAPLES = L(NAP_N + [(14.9, 42.2), (16.2, 42.05), (18.7, 40.3), (18.6, 39.7), (17.0, 38.8), (16.6, 37.85), (15.6, 37.85), (15.6, 38.6),
           (15.7, 39.4), (14.9, 40.2), (14.0, 40.65), (13.6, 41.1)])
SICILY = L([(12.3, 37.5), (12.3, 38.3), (13.4, 38.35), (15.75, 38.4), (15.45, 36.9), (14.3, 36.55)])
SARDINIA = L([(8.0, 38.85), (8.2, 40.9), (9.25, 41.4), (9.9, 40.95), (9.85, 39.0), (9.0, 38.75)])
# Savoy-Piedmont: the 1559 duchy, then Monferrato, Alessandria, Valenza and the Lomellina (1708—1713), then everything west of the
# Ticino with Novara, Tortona, Vigevano, the Oltrepo and the Ossola (1738—1748).
PIED_1713 = L([(8.0, 44.4), (8.4, 45.2), (8.75, 45.3), (8.95, 45.2), (8.95, 45.0), (8.8, 44.8), (8.6, 44.68), (8.35, 44.4)])
PIED_1748 = L([(7.9, 45.9), (8.1, 46.25), (8.4, 46.45), (8.45, 46.2), (8.6, 46.0), (8.62, 45.75), (8.7, 45.55), (8.8, 45.35), (9.1, 45.2), (9.25, 45.12),
               (9.35, 45.1), (9.35, 44.75), (9.2, 44.6), (9.05, 44.65), (8.85, 44.8), (8.95, 45.0), (8.95, 45.2), (8.4, 45.2)])
LOMBARDY = L([(8.62, 45.75), (8.75, 46.0), (9.0, 45.85), (9.1, 46.0), (9.3, 46.2)] + VEN_W + [(10.6, 45.32), (10.9, 45.28), (11.25, 45.07),
             (11.25, 45.0), (10.75, 44.9), (10.5, 45.0), (10.0, 45.08), (9.35, 45.1), (9.25, 45.12), (9.1, 45.2), (8.8, 45.35), (8.7, 45.55)])
VALTELLINA = L([(9.3, 46.2), (9.35, 46.5), (9.75, 46.35), (10.1, 46.6), (10.45, 46.6), (10.5, 46.3), (10.2, 46.25), (9.95, 46.08), (9.45, 46.1)])
WEST_OF_MINCIO = Polygon([(8.0, 47.0), (10.75, 47.0), (10.72, 45.45), (10.62, 45.3), (10.5, 44.8), (8.0, 44.8)])
LEGATIONS = Polygon([(10.9, 45.2), (12.9, 45.2), (12.85, 43.95), (12.0, 43.85), (11.5, 43.9), (10.9, 44.0)])
LAZIO = Polygon([(11.3, 42.75), (12.0, 42.85), (12.45, 42.7), (12.65, 42.4), (13.0, 42.2), (13.4, 41.95), (13.65, 41.7), (13.6, 41.2),
                 (11.3, 41.2)])
TRENTINO = L([(10.45, 46.6), (10.47, 46.85), (11.0, 46.77), (11.5, 47.0), (12.2, 47.08), (12.45, 46.7)] + VEN_N[1:9] + [(10.4, 46.15), (10.5, 46.3)])
GIULIA = L([(13.35, 46.5), (13.7, 46.52), (13.75, 46.4), (13.95, 46.2), (14.1, 46.0), (14.25, 45.8), (14.45, 45.55), (14.42, 45.35),
            (14.3, 45.25), (14.15, 44.95), (13.95, 44.75), (13.6, 45.0), (13.5, 45.3), (13.6, 45.55)] + VEN_E[:-1])
ZARA = L([(15.13, 44.06), (15.32, 44.06), (15.32, 44.2), (15.13, 44.2)])
FIUME = L([(14.4, 45.3), (14.52, 45.3), (14.52, 45.38), (14.4, 45.38)])
N_DALMATIA = L([(15.05, 44.55), (15.5, 44.35), (15.85, 44.15), (16.15, 43.85), (16.05, 43.5), (15.6, 43.3), (14.9, 43.9), (14.35, 44.45),
                (14.3, 44.95), (14.5, 45.1)])

regions['itVenice1600'] = U(VENICE_TERRA, IST_VEN, DALM_VEN, KOTOR, IONIAN)
regions['itCrete1600'] = CRETE
regions['itPapal1600'] = POPE
regions['itTuscany'] = TUSCANY
regions['itGenoa1600'] = U(GENOA, G('fr18Corsica'))
regions['itParma'] = PARMA
regions['itModena'] = MODENA
NICE = L([(6.85, 43.6), (7.53, 43.78), (7.6, 44.05), (7.7, 44.15), (6.85, 44.2)])
SAV_1720 = U(G('fSavoy1559'), NICE, PIED_1713, SARDINIA)
SAV_1748 = U(SAV_1720, PIED_1748)
SAV_1815 = U(SAV_1748, GENOA)
regions['itSardinia1720'] = SAV_1720
regions['itAustria1720'] = U(D(U(LOMBARDY, PIED_1748), G('fSavoy1559'), PIED_1713), MANTUA, NAPLES, SICILY)
regions['itTwoSicilies'] = U(NAPLES, SICILY)
regions['itLombardy1748'] = LOMBARDY
regions['itSardinia1748'] = SAV_1748
LV = U(LOMBARDY, VALTELLINA, VENICE_TERRA)
regions['itLombardyVenetia1815'] = LV
regions['itSardinia1815'] = SAV_1815
regions['itPapal1815'] = POPE
SAV_1859 = U(SAV_1815, LV.intersection(WEST_OF_MINCIO))
regions['itSardinia1859'] = SAV_1859
CENTRAL = U(TUSCANY, PARMA, MODENA, POPE.intersection(LEGATIONS))
regions['itCentral1860'] = CENTRAL
NICE_SAVOY = G('fr18Savoy1792')
regions['itNiceSavoy1860'] = NICE_SAVOY
regions['itMarcheUmbria1860'] = D(POPE, LEGATIONS, LAZIO)
ITALY_1861 = U(D(SAV_1859, NICE_SAVOY), CENTRAL, D(POPE, LEGATIONS, LAZIO), NAPLES, SICILY)
regions['itItaly1861'] = ITALY_1861
VENETO = D(LV, WEST_OF_MINCIO)
regions['itVeneto1866'] = VENETO
regions['itLazio1870'] = POPE.intersection(LAZIO).buffer(0)
ITALY_1871 = U(ITALY_1861, VENETO, POPE.intersection(LAZIO))
regions['itItaly1871'] = ITALY_1871
regions['itLondonPact1915'] = U(TRENTINO, GIULIA, N_DALMATIA)
regions['itGains1920'] = U(TRENTINO, GIULIA, ZARA)
regions['itItaly1924'] = U(ITALY_1871, TRENTINO, GIULIA, ZARA, FIUME)
regions['itLibya1912'] = L([(11.56, 33.17), (12.5, 33.5), (15.5, 32.6), (19.0, 30.6), (20.0, 31.5), (20.0, 33.0), (25.15, 31.7), (24.9, 30.0),
                            (25.0, 22.0), (24.0, 20.0), (23.9, 19.5), (19.0, 21.4), (15.5, 23.0), (14.2, 22.6), (11.9, 23.5), (10.2, 24.6),
                            (9.4, 26.2), (9.9, 28.0), (9.5, 30.2), (10.2, 30.8), (10.3, 31.7)])
regions['itEritrea1890'] = L([(36.45, 14.3), (36.6, 15.8), (37.0, 17.0), (38.6, 18.05), (39.5, 15.9), (41.0, 14.8), (42.3, 13.3), (43.15, 12.7),
                              (42.4, 12.45), (40.8, 14.0), (40.0, 14.45), (39.0, 14.6), (37.6, 14.4)])
regions['itEthiopia1896'] = D(L([(35.5, 12.5), (36.45, 14.3), (37.6, 14.4), (39.0, 14.6), (40.0, 14.45), (40.8, 14.0), (41.8, 11.6), (42.8, 10.9),
                                 (43.5, 9.6), (44.5, 8.2), (42.0, 5.5), (40.0, 4.0), (38.0, 3.6), (36.0, 4.5), (35.0, 6.0), (34.3, 8.0), (34.6, 10.5)]),
                              regions['itEritrea1890'])

# ---------- The Low Countries ----------
# The 1839 frontiers, close to today's, then cut and joined for the older states.
BELGIUM = L([(2.55, 51.09), (2.6, 50.8), (2.9, 50.7), (3.2, 50.75), (3.7, 50.3), (4.2, 50.25), (4.15, 49.95), (4.85, 50.15), (4.85, 49.8),
             (5.45, 49.5), (5.82, 49.54), (5.9, 49.66), (5.82, 49.85), (5.85, 50.0), (6.02, 50.17), (5.98, 50.35), (5.95, 50.55), (6.0, 50.75),
             (5.68, 50.75), (5.64, 50.85), (5.7, 50.95), (5.8, 51.08), (5.85, 51.15), (5.2, 51.3), (4.75, 51.5), (4.3, 51.37), (3.95, 51.21), (3.37, 51.37), (2.4, 51.4)])
NETHERLANDS = L([(3.37, 51.37), (3.95, 51.21), (4.3, 51.37), (4.75, 51.5), (5.2, 51.3), (5.85, 51.15), (5.8, 51.08), (5.7, 50.95), (5.64, 50.85), (5.68, 50.75), (6.0, 50.75), (6.1, 50.9),
                 (6.0, 51.1), (6.2, 51.4), (5.95, 51.75), (6.15, 51.9), (6.75, 51.9), (7.05, 52.25), (7.05, 52.65), (7.25, 53.2), (7.2, 53.4),
                 (7.0, 53.8), (4.5, 53.6), (3.2, 51.8)])
LIMBURG_NL = L([(5.68, 50.75), (6.0, 50.75), (6.1, 50.9), (6.0, 51.1), (6.2, 51.4), (6.05, 51.6), (5.85, 51.62), (5.95, 51.3), (5.85, 51.15),
                (5.8, 51.08), (5.7, 50.95), (5.64, 50.85)])
LUX_1839 = L([(5.82, 49.54), (5.9, 49.66), (5.82, 49.85), (5.85, 50.0), (6.02, 50.17), (6.13, 50.13), (6.45, 49.95), (6.52, 49.8), (6.35, 49.45)])
LUX_1815 = U(LUX_1839, L([(4.95, 49.8), (5.0, 50.0), (5.2, 50.25), (5.45, 50.38), (5.7, 50.35), (5.98, 50.35), (6.02, 50.17), (5.85, 50.0),
                          (5.82, 49.85), (5.9, 49.66), (5.82, 49.54), (5.45, 49.5), (5.2, 49.65)]))
LIEGE = L([(5.0, 50.2), (5.15, 50.8), (5.6, 51.25), (5.95, 51.05), (6.0, 50.6), (5.7, 50.25)]).intersection(U(BELGIUM, LIMBURG_NL)).buffer(0)
ARTOIS_WALLOON = L([(1.6, 50.35), (1.9, 50.95), (2.55, 51.09), (2.6, 50.8), (2.9, 50.7), (3.2, 50.75), (3.7, 50.3), (4.2, 50.25), (4.15, 49.95),
                    (3.6, 49.95), (2.8, 50.05), (2.1, 50.15)])
STATES_FLANDERS = Polygon([(3.3, 51.15), (4.3, 51.15), (4.3, 51.42), (3.3, 51.42)])
regions['lcDutchRepublic1648'] = D(NETHERLANDS, LIMBURG_NL)
regions['lcSouthern1648'] = D(U(BELGIUM, LUX_1815, ARTOIS_WALLOON), LIEGE)
regions['lcAustrian1714'] = D(U(BELGIUM, LUX_1815), LIEGE)
regions['lcLiege'] = LIEGE
regions['lcBatavian1795'] = D(NETHERLANDS, LIMBURG_NL, STATES_FLANDERS)
regions['lcUnited1815'] = D(U(NETHERLANDS, BELGIUM), LUX_1815)
regions['lcLuxembourg1815'] = LUX_1815
regions['lcBelgium1839'] = BELGIUM
regions['lcNetherlands1839'] = NETHERLANDS
regions['lcLuxembourg1839'] = LUX_1839
regions['lcLimburg1839'] = LIMBURG_NL
regions['lcLuxBelgian1839'] = D(LUX_1815, LUX_1839)
JAVA = L([(105.1, -6.75), (105.9, -5.85), (106.8, -5.9), (108.3, -6.2), (110.4, -6.8), (112.6, -6.8), (114.5, -7.6), (114.65, -8.75),
          (112.7, -8.5), (110.5, -8.25), (108.5, -7.85), (106.5, -7.45), (105.3, -6.95)])
regions['lcJava'] = JAVA
regions['lcEastIndies1914'] = D(L([(94.5, 6.0), (98.0, 5.6), (100.5, 3.2), (103.0, 1.6), (104.6, 1.05), (108.0, 3.0), (109.6, 1.95), (111.0, 1.0),
                                   (112.5, 1.5), (114.5, 1.5), (115.5, 3.0), (115.6, 4.1), (117.6, 4.2), (118.6, 4.5), (125.5, 4.6), (141.0, 4.5),
                                   (141.0, -9.2), (141.0, -11.0), (94.5, -11.0)]), L([(124.9, -9.6), (127.4, -9.6), (127.4, -8.0), (124.9, -8.0)]))
regions['lcCongo1885'] = L([(12.2, -6.0), (12.25, -5.0), (13.1, -4.6), (15.3, -4.3), (16.2, -2.0), (17.6, -0.6), (18.0, 1.0), (18.6, 3.5),
                            (19.5, 5.1), (22.5, 4.2), (24.5, 5.05), (27.4, 5.1), (29.0, 4.4), (30.8, 3.5), (31.0, 2.3), (29.8, 0.0), (29.6, -1.4),
                            (29.0, -2.5), (29.3, -4.5), (29.5, -6.0), (30.5, -8.3), (28.5, -9.0), (28.6, -10.5), (29.8, -12.2), (29.4, -13.4),
                            (27.3, -12.2), (25.5, -11.2), (24.0, -11.0), (22.3, -11.0), (21.8, -7.3), (19.5, -8.0), (17.5, -8.1), (16.5, -6.5),
                            (14.0, -5.85)])
regions['lcSuriname1667'] = L([(-57.15, 6.0), (-54.0, 5.8), (-54.0, 4.0), (-54.4, 2.2), (-56.0, 1.9), (-58.0, 1.9), (-57.2, 4.0)])

for k, v in regions.items():
    assert not v.is_empty and v.area > .03, (k, v.area)
    geo[k] = mapping(v)
print(len(regions), 'itl regions:', ', '.join(f'{k} {v.area:.2f}' for k, v in regions.items()))
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
