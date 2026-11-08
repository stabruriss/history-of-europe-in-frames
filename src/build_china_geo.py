"""Add teaching areas for the 中国 line after 845 to history_geo.json (老无 2026-11-08).

Usage: <python with shapely> build_china_geo.py   (run after build_america_geo.py).  Teaching regions only, not reconstructed frontiers:
they get the big divisions right (the Liao-Song line south of the Sixteen Prefectures, the Huai-Qinling line between Jin and Southern
Song, the Great Wall and Liaodong under the Ming, Mongolia, Xinjiang, Tibet and Taiwan under the Qing) and no more.
Points are (lon, lat).
"""
import json
from pathlib import Path
from shapely.geometry import shape, mapping, Polygon
from shapely.ops import unary_union

base = json.loads(Path('data.json').read_text())
geo = json.loads(Path('history_geo.json').read_text())
land = shape(base['land']).buffer(0)
L = lambda pts: land.intersection(Polygon(pts)).buffer(0)
regions = {}

# Shared lines, so that neighbours meet without gaps or overlaps.
# The Liao-Song line: Baigou river to Yanmen pass, then the Song-Xia frontier down to the Tao river.
LIAO_SONG = [(118.2, 38.9), (116.5, 39.0), (115.2, 39.2), (113.5, 39.1), (112.0, 38.9), (111.2, 39.4)]
SONG_XIA = [(111.2, 39.4), (110.3, 38.0), (109.0, 37.6), (107.8, 37.0), (106.5, 36.4), (105.2, 35.8), (104.0, 35.0)]
# The Huai river and the Qinling, from the sea to the Dasan pass, as agreed in 1142.
HUAI_QINLING = [(120.6, 34.0), (119.0, 33.4), (117.4, 32.9), (116.0, 32.4), (114.1, 32.1), (112.6, 32.4), (111.0, 33.2), (109.5, 33.7),
                (107.5, 34.1), (106.6, 34.2)]
# The southwest: Sichuan's western edge, and Song or Ming country against Dali and the hills beyond.
SICHUAN_WEST = [(102.5, 32.0), (102.0, 30.0), (102.3, 28.0), (103.6, 27.0), (104.5, 26.0), (105.5, 24.5), (106.6, 23.0), (107.8, 21.6)]
# The south and east coast, out at sea so that the land clip draws it; Taiwan stays outside (the line passes west of it), Hainan inside.
SOUTH_COAST = [(107.8, 21.6), (108.0, 18.0), (111.5, 17.8), (113.5, 21.6), (117.0, 23.0), (119.3, 24.9), (120.3, 26.8), (122.3, 29.8),
               (122.3, 31.6), (121.3, 33.0)]

# ---------- About 1000-1100: Song, Liao, Xi Xia, Dali ----------
regions['zhSong1000'] = L(LIAO_SONG + SONG_XIA + [(103.5, 33.5)] + SICHUAN_WEST + SOUTH_COAST +
                          [(120.6, 34.0), (119.6, 35.2), (120.2, 36.0), (122.8, 37.0), (122.6, 37.8), (120.0, 37.9), (118.9, 38.1)])
regions['zhLiao1000'] = L(LIAO_SONG + [(110.5, 40.6), (107.5, 41.3), (105.0, 42.5), (103.0, 44.5), (102.5, 47.0),
                          (105.0, 48.8), (110.0, 49.6), (116.0, 50.0), (120.0, 51.8), (126.0, 52.6), (131.0, 48.5), (131.5, 45.0),
                          (130.0, 42.8), (126.5, 41.8), (124.4, 40.1), (122.5, 38.5), (120.0, 38.6)])
regions['zhXixia1100'] = L(SONG_XIA + [(102.6, 36.6), (100.5, 37.8), (98.5, 39.0), (96.0, 40.0), (94.0, 40.0),
                           (93.5, 41.0), (97.0, 42.2), (101.0, 42.5), (105.0, 42.5), (107.5, 41.3), (110.5, 40.6)])
regions['zhDali1100'] = L([(98.0, 28.5), (100.0, 29.0)] + SICHUAN_WEST[2:-1] + [(104.0, 22.6), (102.0, 21.4), (101.0, 21.6), (99.5, 22.0),
                          (98.0, 24.0), (97.6, 25.5)])

# ---------- 1142: Jin and Southern Song ----------
regions['zhSouthernSong1142'] = L(HUAI_QINLING + [(105.6, 33.5), (104.3, 33.0), (103.5, 33.2)] + SICHUAN_WEST + SOUTH_COAST)
regions['zhJin1142'] = L(HUAI_QINLING + [(105.5, 35.0)] + list(reversed(SONG_XIA[:-1])) +
                         [(110.5, 40.6), (107.5, 41.3), (112.0, 43.5), (115.5, 46.0), (118.0, 48.0), (120.0, 49.8), (122.0, 50.5),
                          (126.0, 52.6), (133.0, 48.4), (135.2, 48.4), (138.0, 46.0), (133.0, 42.5), (130.7, 42.4), (128.0, 41.8),
                          (124.4, 40.1), (122.5, 38.5), (120.0, 38.6), (118.9, 38.1), (120.0, 37.9), (122.6, 37.8), (122.8, 37.0),
                          (120.2, 36.0), (119.6, 35.2)])

# ---------- About 1294: the Yuan, ruled directly from Dadu ----------
MONGOLIA = [(88.0, 49.0), (98.0, 52.0), (108.0, 51.0), (116.0, 50.0), (120.0, 51.8), (119.0, 47.0), (115.0, 45.0), (111.0, 43.0),
            (105.0, 42.5), (97.0, 42.2), (93.5, 41.0), (90.5, 45.0)]
TIBET = [(78.5, 33.5), (80.5, 35.5), (86.0, 36.0), (93.0, 36.5), (97.0, 35.5), (100.5, 34.0), (102.5, 32.0), (102.0, 30.0), (99.0, 28.0),
         (97.0, 28.3), (92.0, 27.8), (89.0, 27.5), (86.0, 27.9), (84.0, 28.6), (81.0, 30.2), (79.0, 31.0)]
regions['zhYuan1294'] = unary_union([regions[k] for k in ('zhSong1000', 'zhLiao1000', 'zhXixia1100', 'zhDali1100', 'zhJin1142',
                                                          'zhSouthernSong1142')] + [L(MONGOLIA), L(TIBET)]).buffer(0)

# ---------- About 1580: the Ming, inside the Great Wall, with Liaodong ----------
regions['zhMing1580'] = L([(119.8, 40.0), (117.0, 40.6), (115.9, 40.7), (114.0, 40.5), (112.5, 40.3), (111.0, 39.7), (110.6, 39.0),
                           (109.7, 38.3), (107.8, 38.0), (106.5, 38.8), (104.0, 38.0), (102.0, 38.5), (100.0, 39.2), (98.2, 39.9),
                           (98.0, 39.4), (100.5, 38.0), (102.5, 36.9), (101.5, 36.0), (102.0, 34.0), (102.5, 32.0), (102.2, 30.0),
                           (100.4, 28.0), (99.0, 27.5), (98.5, 25.8), (97.5, 24.0), (99.0, 22.0), (101.0, 21.2), (102.5, 22.4),
                           (104.0, 22.7), (106.6, 22.8)] + SOUTH_COAST +
                          [(120.6, 34.0), (119.6, 35.2), (120.2, 36.0), (122.8, 37.0), (122.6, 37.8), (120.0, 37.9), (118.9, 38.1),
                           (118.2, 38.9), (119.3, 39.4), (121.0, 38.6), (122.5, 38.5), (124.4, 40.1), (125.0, 42.0), (124.0, 42.6),
                           (122.0, 42.2), (121.0, 41.6)])

# ---------- About 1820: the Qing at its widest; and after the losses to Russia: the Amur and Ussuri in 1858-1860, ----------
# ---------- and in the northwest the lands south and east of Lake Balkhash in 1864 (Ili itself came back in 1881) ----------
QING_NORTH_1689 = [(116.0, 49.9), (120.5, 53.3), (126.0, 55.0), (135.0, 55.5), (138.5, 54.3)]
QING_NORTH_1860 = [(116.0, 49.9), (120.5, 53.3), (126.0, 53.4), (131.0, 49.4), (134.7, 48.3), (133.0, 45.0), (131.2, 42.9)]
QING_SOUTH = [(130.7, 42.4), (128.0, 41.8), (126.5, 41.8), (124.4, 40.1), (122.5, 38.5), (121.3, 33.0), (122.3, 31.6), (122.3, 29.8),
              (122.6, 25.5), (121.8, 21.5), (119.5, 22.0), (117.0, 23.0), (113.5, 21.6), (111.5, 17.8), (108.0, 18.0), (107.8, 21.6),
              (106.6, 22.8), (104.0, 22.7), (102.5, 22.4), (101.0, 21.2), (99.0, 22.0), (97.5, 24.0), (98.5, 27.6), (97.0, 28.3),
              (92.0, 27.8), (89.0, 27.5), (86.0, 27.9), (84.0, 28.6), (81.0, 30.2), (79.0, 31.0), (78.0, 32.5), (79.0, 35.5),
              (77.0, 35.5), (75.0, 37.0), (73.5, 39.5)]
# Before 1864 the Qing northwest reached Lake Issyk-Kul and the southeast shore of Lake Balkhash.
QING_WEST_1820 = [(74.0, 42.5), (75.0, 44.5), (77.0, 46.5), (79.0, 46.9), (80.5, 47.5), (83.0, 49.5), (87.5, 49.2)]
# After 1864 and 1881: about the line of today's border.
QING_WEST_1881 = [(75.5, 40.6), (78.0, 41.3), (80.2, 42.2), (80.3, 44.9), (82.5, 45.3), (82.8, 47.0), (85.5, 47.1), (86.8, 49.0), (87.5, 49.2)]
# Tannu Uriankhai (Tuva) under the Sayan mountains, then the Kyakhta line of 1727.
QING_NORTH_TAIL = [(89.5, 50.6), (91.0, 52.0), (96.0, 53.0), (98.0, 52.0), (106.4, 50.3), (111.0, 49.8)]
regions['zhQing1820'] = L(QING_NORTH_1689 + [(141.0, 53.0), (140.5, 48.0), (138.0, 44.5), (133.0, 42.6)] + QING_SOUTH + QING_WEST_1820 + QING_NORTH_TAIL)
regions['zhQing1880'] = L(QING_NORTH_1860 + QING_SOUTH + QING_WEST_1881 + QING_NORTH_TAIL)

# ---------- Requested by the drafters (2026-11-08) ----------
# The Qara Khitai (西辽) after 1141: the Chu valley and Zhetysu, with Transoxiana and the Tarim cities as vassals.
regions['zhQaraKhitai1141'] = L([(62.0, 36.5), (66.0, 42.5), (70.0, 44.5), (75.0, 46.8), (82.0, 47.5), (89.0, 45.5), (92.0, 43.0), (90.0, 41.0),
                                 (84.0, 39.0), (80.0, 36.5), (75.5, 36.8), (71.0, 37.0), (67.0, 37.2)])
# The Korean peninsula, for Joseon in the 1590s.
regions['zhKorea1592'] = L([(124.4, 40.1), (126.5, 41.8), (128.0, 41.8), (130.7, 42.4), (130.5, 39.0), (129.6, 35.5), (127.5, 33.5), (125.5, 34.0),
                            (125.5, 37.5), (124.3, 38.0)])
# Later Jin, about 1626: Liaodong east of the Liao river with the Jurchen lands behind it.
regions['zhLaterJin1626'] = L([(122.0, 40.3), (122.3, 41.6), (121.8, 42.6), (123.5, 44.5), (124.5, 46.0), (127.0, 47.0), (131.0, 46.5), (132.5, 44.5),
                               (130.7, 42.4), (128.0, 41.8), (126.5, 41.8), (124.4, 40.1), (122.8, 39.1)])
# The Three Feudatories in 1673: Wu Sangui in Yunnan and Guizhou, Shang Kexi in Guangdong, Geng Jingzhong in Fujian.
regions['zhSanfan1673'] = unary_union([
    L([(98.0, 28.5), (100.0, 29.0), (102.3, 28.0), (104.3, 29.0), (106.4, 28.6), (109.5, 28.6), (109.4, 26.3), (108.0, 25.4), (106.5, 24.9),
       (105.5, 24.0), (104.0, 22.7), (102.5, 22.4), (101.0, 21.2), (99.0, 22.0), (97.5, 24.0), (98.5, 25.8)]),
    L([(109.6, 21.5), (110.5, 24.0), (112.0, 25.0), (114.0, 25.3), (115.5, 24.6), (116.8, 24.2), (117.2, 23.5), (115.0, 21.5), (111.5, 17.8),
       (108.0, 18.0), (108.5, 21.0)]),
    L([(115.9, 24.5), (116.8, 26.0), (117.5, 27.5), (118.4, 28.3), (120.4, 27.2), (119.3, 24.9), (117.2, 23.5)])]).buffer(0)
# The Zheng regime on Taiwan, 1662-1683: the southwestern plain round Tainan, with the Penghu islands.
regions['zhZhengTaiwan1662'] = L([(119.3, 23.4), (120.2, 24.4), (120.9, 24.2), (120.7, 22.6), (120.4, 22.0), (119.8, 22.6), (119.4, 23.0)])
# The Qing in 1683, after Taiwan and before Outer Mongolia, Xinjiang and Tibet: China proper, the northeast, Taiwan and Inner Mongolia.
regions['zhQing1683'] = unary_union([regions['zhMing1580'], regions['zhLaterJin1626'],
    L([(116.0, 49.9), (120.5, 53.3), (126.0, 55.0), (135.0, 55.5), (138.5, 54.3), (141.0, 53.0), (140.5, 48.0), (138.0, 44.5), (133.0, 42.6),
       (130.7, 42.4), (128.0, 41.8), (126.5, 41.8), (124.4, 40.1), (122.0, 40.3), (119.8, 40.0), (117.0, 40.6), (114.0, 40.5), (111.0, 39.7),
       (107.0, 41.0), (104.0, 41.8), (106.0, 43.0), (111.0, 43.5), (115.0, 45.5), (117.0, 47.0)]),
    L([(120.0, 21.8), (119.8, 25.4), (122.2, 25.4), (121.9, 21.8)])]).buffer(0)
# The Ming after it lost Liaodong to the Later Jin (1621-1626), so the two can be drawn side by side.
regions['zhMing1626'] = regions['zhMing1580'].difference(regions['zhLaterJin1626']).buffer(0)
# Taiwan and the Penghu islands, ceded to Japan in 1895. The line runs east of the Fujian coastal islands.
TAIWAN = L([(119.2, 22.9), (119.85, 25.4), (122.3, 25.6), (122.3, 21.7), (120.5, 21.7)])
# The Qing after 1895, and the Republic after 1912: the 1880 Qing without Taiwan.
regions['zhQing1895'] = regions['zhQing1880'].difference(TAIWAN).buffer(0)
# Japan with Ryukyu (annexed 1879), then with Taiwan (1895); in 1910 also southern Sakhalin (1905) and Korea.
JAPAN = L([(128.5, 33.0), (129.5, 35.0), (131.0, 36.0), (135.5, 37.0), (138.5, 38.5), (139.5, 40.0), (139.5, 42.5), (141.0, 45.6),
           (146.5, 44.0), (146.5, 43.0), (142.5, 39.0), (141.0, 35.5), (140.0, 34.5), (136.0, 33.3), (132.5, 32.5), (131.5, 30.8),
           (129.5, 31.0)])
RYUKYU = L([(122.8, 23.9), (122.8, 25.0), (127.0, 27.2), (129.5, 29.5), (131.0, 30.9), (132.0, 30.5), (129.0, 27.0), (125.0, 23.9)])
SOUTH_SAKHALIN = L([(141.3, 46.0), (141.2, 50.0), (144.8, 50.0), (144.8, 45.9)])
regions['zhJapan1895'] = unary_union([JAPAN, RYUKYU, TAIWAN]).buffer(0)
regions['zhJapan1910'] = unary_union([JAPAN, RYUKYU, TAIWAN, SOUTH_SAKHALIN, regions['zhKorea1592']]).buffer(0)
# Outer Mongolia, autonomous from 1911 (independence declared that December; Russia and China recognised its autonomy in 1915).
regions['zhMongolia1911'] = L([(87.8, 49.2), (90.7, 50.4), (92.3, 50.8), (94.3, 50.6), (97.3, 49.8), (98.3, 51.6), (99.5, 52.0), (102.0, 51.4),
                               (104.0, 50.3), (106.5, 50.3), (108.0, 49.4), (110.0, 49.2), (114.0, 50.2), (116.6, 49.9), (119.9, 46.7),
                               (117.5, 46.6), (115.6, 45.4), (112.0, 45.1), (111.0, 43.7), (107.5, 42.4), (105.0, 41.6), (100.0, 42.6),
                               (96.4, 42.7), (95.3, 44.2), (93.0, 45.0), (90.9, 45.2), (90.7, 46.5), (90.0, 47.9), (88.0, 48.6)])

for key, region in regions.items():
    assert not region.is_empty, key
    assert key not in geo, key
    geo[key] = mapping(region.simplify(0.02, preserve_topology=True))
Path('history_geo.json').write_text(json.dumps(geo, separators=(',', ':')))
print('regions', len(regions))
