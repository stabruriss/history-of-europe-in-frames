"""Faithful reader text, without a browser or third-party dependencies."""
from collections import Counter, defaultdict
from html.parser import HTMLParser
import hashlib
import re

POLICY = 3
EXCLUDED = {'table', 'img', 'svg', 'canvas', 'script', 'style', 'button', 'input',
            'select', 'audio', 'video', 'iframe', 'noscript'}
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
        'param', 'source', 'track', 'wbr'}
BLOCK = {'p', 'div', 'section', 'article', 'aside', 'li', 'ul', 'ol', 'h1', 'h2',
         'h3', 'h4', 'h5', 'h6', 'blockquote', 'details', 'summary', 'br', 'hr'}
ENTRY_ID = r'(?:history|topic)-[a-z0-9]+(?:-[a-z0-9]+)*'
INDEX = r'(?:0|[1-9][0-9]*)'
ASSET_ID = re.compile(r'('+ENTRY_ID+r')(?:/(title|'+INDEX+r')(?:/(moment|box|person)/('+INDEX+r'))?)?')


def clean(s):
    s = re.sub(r'[^\S\n]+', ' ', s)
    return re.sub(r'\n[ \n]*\n', '\n\n', s).strip()


class ReaderHTML(HTMLParser):
    def __init__(self, markup, omit_external_links=False):
        super().__init__(convert_charrefs=True)
        self.stack = []  # tag, scene, excluded (inherited)
        self.parts = defaultdict(list)
        self.excluded = defaultdict(Counter)
        self.markers = Counter()
        self.omit_external_links = omit_external_links
        self.feed(markup)
        self.close()
        if any(skip for _, _, skip in self.stack):
            raise ValueError('Unclosed excluded element; refusing possible text loss')

    def state(self):
        return self.stack[-1][1:] if self.stack else (None, False)

    def handle_starttag(self, tag, attrs):
        scene, skip = self.state()
        closes_p = (BLOCK - {'br'}) | {'table','form','figure','figcaption','pre','fieldset',
                                      'header','footer','main','nav','dl','dt','dd','address'}
        if not skip and tag in closes_p and any(t == 'p' for t, _, _ in self.stack):
            raise ValueError('Block element <'+tag+'> inside <p>; browser paragraph boundaries would differ')
        attrs = dict(attrs)
        if 'data-scene-text' in attrs:
            scene = int(attrs['data-scene-text'])
            self.markers[scene] += 1
        if not skip and (tag in BLOCK or tag == 'table'):
            self.parts[scene].append('\n')
        external = (self.omit_external_links and tag == 'a' and
                    re.match(r'(?:https?:)?//', (attrs.get('href') or '').strip(), re.IGNORECASE))
        if tag in EXCLUDED or external:
            self.excluded[scene]['external-link' if external else tag] += 1
        skip = skip or tag in EXCLUDED or bool(external)
        if tag not in VOID:
            self.stack.append((tag, scene, skip))

    def handle_endtag(self, tag):
        for i in range(len(self.stack)-1, -1, -1):
            if self.stack[i][0] == tag:
                _, scene, skip = self.stack[i]
                if not skip and tag in BLOCK:
                    self.parts[scene].append('\n')
                del self.stack[i:]
                return

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID:
            self.handle_endtag(tag)

    def handle_data(self, value):
        scene, skip = self.state()
        if not skip:
            self.parts[scene].append(value)

    def value(self, scene=None):
        return clean(''.join(self.parts[scene]))


def text_of(markup, omit_external_links=False):
    return ReaderHTML(markup or '', omit_external_links=omit_external_links).value()


# Reviewed calendar vocabulary, used ONLY in fixed-layout metadata, never in authored prose.
# Unknown/mixed wording is retained for review instead of guessing from the presence of digits.
FIXED_TIME_WORDS = re.compile(
    r'生年不详|传统年表|传说时代|征服后至|及此后|活跃于|铭刻于|'
    r'公元|距今|世纪|千纪|年代|在位|卒于|活跃|尤其|凌晨|传统|传说|俄历|一说|'
    r'[约前后至今年月日初中末叶半上下春夏秋冬底夜旬期间或起以千万]')


def fixed_time_label(value):
    """Conservative calendar recognition for period/date/when/life slots, not a text filter."""
    compact = re.sub(r'\s+', '', value)
    if compact in {'古风时代', '公元前后'}:
        return True
    if not re.search(r'[0-9]', compact):
        return False
    numeric = FIXED_TIME_WORDS.sub('', compact)
    if not re.fullmatch(r'[0-9?？()（）/／—–－\-、·.]+', numeric):
        return False
    # A ratio or an unexplained number is not evidence of a year. Bare year ranges are conventional.
    return bool(re.search(r'[0-9][千万]?(?:世纪|千纪|年代|年|月|日)', compact) or
                re.fullmatch(r'[0-9]{1,4}[—–－-][0-9]{1,4}', numeric))


def parse_asset_id(asset_id):
    """Only canonical body/title/part shapes; no aliases, zero padding or path escapes."""
    match = ASSET_ID.fullmatch(asset_id) if isinstance(asset_id, str) else None
    if match:
        entry, scene, part, index = match.groups()
        if part and scene != 'title':
            return entry, part, int(scene), int(index)
        if not part and entry.startswith('history-') and scene is not None:
            return entry, 'title' if scene == 'title' else 'scene', None if scene == 'title' else int(scene), None
        if not part and entry.startswith('topic-') and scene is None:
            return entry, 'topic', None, None
    raise ValueError('Unsafe asset ID: '+str(asset_id))


def part_ids(entry, scene_index):
    """Page order, retaining entry-wide supplement indices and per-appearance people indices."""
    stem = entry['id']+'/'+str(scene_index)
    result = []
    for field, kind in (('moments', 'moment'), ('boxes', 'box')):
        result.extend(stem+'/'+kind+'/'+str(j) for j, part in enumerate(entry[field])
                      if part['scene'] == scene_index)
    result.extend(stem+'/person/'+str(j) for j in range(len(entry['scenes'][scene_index]['people'])))
    return result


def entry_asset_ids(entry):
    result = [entry['id']+'/title'] if entry['kind'] == 'history' else [entry['id']]
    for i in range(len(entry['scenes'])):
        if entry['kind'] == 'history':
            result.append(entry['id']+'/'+str(i))
        result.extend(part_ids(entry, i))
    return result


def asset_ids(snapshot):
    return [asset_id for entry in snapshot['entries'] for asset_id in entry_asset_ids(entry)]


def tracks_for(snapshot, body_ids=None):
    """Source-derived playback plan, including missing optional assets. Never consume stored tracks."""
    wanted = None if body_ids is None else set(body_ids)
    tracks = {}
    for entry in snapshot['entries']:
        topic = entry['kind'] == 'topic'
        bodies = [entry['id']] if topic else [entry['id']+'/'+str(i) for i in range(len(entry['scenes']))]
        for i, body_id in enumerate(bodies):
            if wanted is not None and body_id not in wanted:
                continue
            track = {'bodyId':body_id, 'titleId':None if topic else entry['id']+'/title',
                     'extras':[], 'people':[]}
            for scene_index in range(len(entry['scenes'])) if topic else [i]:
                for asset_id in part_ids(entry, scene_index):
                    _, kind, _, j = parse_asset_id(asset_id)
                    if kind == 'person':
                        person = entry['scenes'][scene_index]['people'][j]
                        label = ' · '.join(value for field in ('name', 'event')
                                           if (value := text_of(person.get(field, ''), omit_external_links=True)))
                    else:
                        label = text_of(entry['moments' if kind == 'moment' else 'boxes'][j]['name'])
                    track['people' if kind == 'person' else 'extras'].append(
                        {'id':asset_id, 'kind':kind, 'label':label})
            tracks[body_id] = track
    return tracks


def body_for(entry):
    body = ReaderHTML(entry['html'])
    expected = Counter({i: 1 for i in range(len(entry['scenes']))})
    if body.markers != expected or body.value():
        raise ValueError('Missing/duplicate scene body or unassigned readable prose: '+entry['id'])
    for i in range(len(entry['scenes'])):
        if not body.value(i):
            raise ValueError('Empty body: '+entry['id']+'/'+str(i))
    return body


def entry_records(entry):
    """Validate/render the whole entry with one body parse, even outside a material selection."""
    body = body_for(entry)
    for asset_id in entry_asset_ids(entry):
        yield _render(entry, asset_id, body)


def render(entry, asset_id):
    return _render(entry, asset_id)


def _render(entry, asset_id, body=None):
    """Keep source pointers; omit fixed time labels, not topic kickers or non-time identities."""
    prefix, kind, index, part_index = parse_asset_id(asset_id)
    if prefix != entry['id'] or asset_id not in entry_asset_ids(entry):
        raise ValueError('Unknown asset ID for entry: '+asset_id)
    topic = kind == 'topic'
    indices = list(range(len(entry['scenes']))) if topic else [] if kind == 'title' else [index]
    blocks, excluded, retained_metadata = [], Counter(), []

    def add(ref, markup, required=False, person=False, metadata=None):
        parser = ReaderHTML(markup or '', omit_external_links=person)
        if parser.markers:
            raise ValueError('Unexpected scene marker in field: '+prefix+'.'+ref)
        value = parser.value()
        for counts in parser.excluded.values():
            excluded.update(counts)
        # A required source field may become silent solely because it contains an external reference.
        if required and not value and not (person and text_of(markup)):
            raise ValueError('Empty required text: '+prefix+'.'+ref)
        if value:
            if metadata:
                if metadata != 'topic-kicker' and fixed_time_label(value):
                    return
                retained_metadata.append({'source':prefix+'.'+ref, 'text':value, 'reason':metadata})
            blocks.append({'source': prefix+'.'+ref, 'text': value})

    if topic or kind == 'title':
        for field in ('title', 'en'):
            add(field, entry[field], required=True)
        if kind == 'title':  # Topic period is not rendered, even when it is not a time label.
            add('period', entry.get('period', ''), metadata='non-time-or-uncertain')
    if topic or kind == 'scene':
        body = body if body is not None else body_for(entry)
        for i in indices:
            add('scenes[%d].date' % i, entry['scenes'][i].get('date', ''), required=topic,
                metadata='topic-kicker' if topic else 'non-time-or-uncertain')
            add('scenes[%d].title' % i, entry['scenes'][i]['title'], required=True)
            blocks.append({'source': prefix+'.html[data-scene-text="%d"]' % i, 'text': body.value(i)})
            excluded.update(body.excluded[i])
    elif kind in ('moment', 'box'):
        field = 'moments' if kind == 'moment' else 'boxes'
        part = entry[field][part_index]
        for key in ('name', 'en', 'text'):
            # A supplement may consist entirely of an excluded table; its title survives.
            add('%s[%d].%s' % (field, part_index, key), part.get(key, ''), required=key == 'name')
    elif kind == 'person':
        person = entry['scenes'][index]['people'][part_index]
        for field in ('when', 'name', 'en', 'life', 'event', 'relation', 'note', 'bio'):
            add('scenes[%d].people[%d].%s' % (index, part_index, field), person.get(field, ''),
                required=field in ('name', 'bio'), person=True,
                metadata='non-time-or-uncertain' if field in ('when', 'life') else None)
    if not blocks:
        raise ValueError('Empty spoken asset: '+asset_id)
    script = '\n\n'.join(block['text'] for block in blocks)+'\n'
    return {'id':asset_id, 'kind':kind, 'entryId':prefix, 'sceneIndices':indices,
            'titleId':prefix+'/title' if kind=='scene' else None, 'policy':POLICY,
            'blocks':blocks, 'excluded':dict(sorted(excluded.items())),
            **({'retainedMetadata':retained_metadata} if retained_metadata else {}),
            'textHash':hashlib.sha256(script.encode('utf-8')).hexdigest(),
            'characters':len(re.sub(r'\s','',script)), 'text':script}
