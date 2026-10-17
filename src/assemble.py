import sys
t = open('template.html', encoding='utf-8').read()
t = t.replace('/*__LEAFLET_CSS__*/', open('leaflet.css', encoding='utf-8').read())
t = t.replace('/*__LEAFLET_JS__*/', open('leaflet.js', encoding='utf-8').read())
t = t.replace('/*__GEO__*/', open('data.json', encoding='utf-8').read())
t = t.replace('/*__LABELS_DATES__*/', open('labels_dates.js', encoding='utf-8').read())
t = t.replace('/*__LEVANT_ENTRIES__*/', open('levante_entries.js', encoding='utf-8').read())
t = t.replace('/*__MARINE_LABELS__*/', open('marine_labels.js', encoding='utf-8').read())
t = t.replace('/*__LAYOUT_CSS__*/', open('layout.css', encoding='utf-8').read())
t = t.replace('/*__HISTORY_GEO__*/', open('history_geo.json', encoding='utf-8').read())
t = t.replace('/*__HISTORY_ENTRIES__*/', open('history_entries.js', encoding='utf-8').read())
t = t.replace('/*__HISTORY_CONTENT__*/', open('history_content.json', encoding='utf-8').read())
t = t.replace('/*__HISTORICAL_FIGURES__*/', open('historical_figures.js', encoding='utf-8').read())
t = t.replace('/*__ATLAS_UI__*/', open('atlas_ui.js', encoding='utf-8').read())
assert '/*__' not in t, 'Unresolved template placeholder'
out = sys.argv[1] if len(sys.argv) > 1 else 'out.html'
open(out, 'w', encoding='utf-8').write(t)
print(out, len(t.encode()) // 1024, 'KB')
