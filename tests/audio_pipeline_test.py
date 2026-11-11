#!/usr/bin/env python3
"""Offline fixtures; test through run_tests.py verify-audio-pipeline.js."""
import asyncio
import copy
import io
import importlib.util
import json
from pathlib import Path
import socket
import sys
import tempfile
import unittest
from unittest.mock import patch

TESTS = Path(__file__).resolve().parent
sys.path.insert(0,str(TESTS.parent/'tools'/'audio'))
import pipeline as p
import release
from text import POLICY, asset_ids, render, text_of, tracks_for, ReaderHTML

FIGURE = {'name':'测试人','en':'René Example','life':'1500—1560','relation':'师承关系。',
          'bio':'折叠传记（Foreign Name）。','sources':[['人物来源','https://example.invalid/person']]}
HISTORY = {'id':'history-fixture','title':'章节标题','en':'Chapter English','period':'1500—1600',
           'scenes':[{'title':'第一幕','date':'1501年'},{'title':'第二幕','date':'1510年'}],
           'html':'<p data-scene-text="0">甲<strong>乙</strong>丙（Descartes &amp; Galileo）。<img alt="IMAGE_ONLY"><svg><text>SVG_ONLY</text></svg><button>BUTTON_ONLY</button></p><p data-scene-text="1">第二幕正文。</p>',
           'moments':[{'scene':0,'name':'名场面标题','en':'Famous Moment','text':'<p>名场面原文。</p>'}],
           'boxes':[{'scene':0,'name':'豆腐块标题','en':'Readable Box','text':'<p>表前</p><table><tr><td>TABLE_ONLY</td></tr></table><p>表后文字。</p><table><tr><td>BOX_TABLE_ONLY</td></tr></table><p>表后<a href="https://example.invalid/link">可读链接</a></p><details><summary>折叠标题</summary>折叠正文</details>'}],
           'sources':[{'label':'章节来源（Original Source）','url':'https://example.invalid/chapter'}]}
TOPIC = {'id':'topic-fixture','title':'完整专题','en':'Complete Topic','period':'跨时代',
         'scenes':[{'title':'专题一幕','date':'第一阶段'},{'title':'专题二幕','date':'第二阶段'}],
         'html':'<p data-scene-text="0">专题开头。</p><p data-scene-text="1">专题结尾。</p>',
         'moments':[],'boxes':[],'sources':[{'label':'专题出处','url':'https://example.invalid/topic'}]}


class PipelineTests(unittest.TestCase):
    def setUp(self):
        # The runner owns TMPDIR and cleans it even after a killed test. No dependencies live here.
        self.temp = tempfile.TemporaryDirectory(prefix='audio-pipeline-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.source = self.root/'source'
        self.library = self.root/'library'
        self.cache = self.root/'cache'
        (self.source/'src').mkdir(parents=True)
        self.library.mkdir()
        self.cards = {'history-fixture/0':[{'id':'person','when':'1501年','event':'一件小事','note':'当时的经历。'}]}
        self.raw = {'history':[copy.deepcopy(HISTORY)],'topics':[copy.deepcopy(TOPIC)]}
        self.write_source()
        # An accidental Python network call in any offline test is a hard failure.
        self.net = patch.object(socket.socket,'connect',side_effect=AssertionError('Network forbidden'))
        self.net.start()
        self.addCleanup(self.net.stop)

    def write_source(self):
        (self.source/'src'/'history_content.json').write_text(json.dumps(self.raw,ensure_ascii=False),encoding='utf-8')
        (self.source/'src'/'history_entries.js').write_text('''
const HISTORY_CONTENT=/*__HISTORY_CONTENT__*/;
const HISTORY_ENTRIES=HISTORY_CONTENT.history, TOPIC_ENTRIES=HISTORY_CONTENT.topics;
const HISTORY_ERAS=[{items:[['history-fixture',0,0],['history-fixture',1,1]]}];
const TREE_ROWS={'history-fixture/0':[['main','shared'],1501], 'history-fixture/1':['main',1510]};
const HISTORY_BRANCHES=[{id:'main',name:'主线'},{id:'shared',name:'换乘线'}];
''',encoding='utf-8')
        (self.source/'src'/'historical_figures.js').write_text('const FIGURES='+json.dumps({'person':FIGURE},ensure_ascii=False)+';const FIGURE_SCENES='+json.dumps(self.cards,ensure_ascii=False)+';',encoding='utf-8')

    def prepared(self):
        p.prepare(self.library,self.source,limit=99)
        return p.read_json(self.library/'source.json')

    def test_readable_text_and_exclusions(self):
        snapshot = self.prepared()
        h = snapshot['entries'][0]
        ids = ['history-fixture/0'+suffix for suffix in ('','/moment/0','/box/0','/person/0')]
        body,moment,box,person = [render(h,i) for i in ids]
        self.assertEqual(body['text'],'第一幕\n\n甲乙丙（Descartes & Galileo）。\n')
        self.assertEqual(moment['text'],'名场面标题\n\nFamous Moment\n\n名场面原文。\n')
        self.assertEqual(person['text'],'测试人\n\nRené Example\n\n一件小事\n\n师承关系。\n\n当时的经历。\n\n折叠传记（Foreign Name）。\n')
        for s in ['表后文字。','折叠标题','折叠正文','豆腐块标题','Readable Box','可读链接']:
            self.assertIn(s,box['text'])
        combined = ''.join(r['text'] for r in (body,moment,box,person))
        for s in ['TABLE_ONLY','IMAGE_ONLY','SVG_ONLY','BUTTON_ONLY','https://','<p>','章节来源','人物来源','史料与延伸阅读']:
            self.assertNotIn(s,combined)
        self.assertEqual(body['excluded'],{'button':1,'img':1,'svg':1})
        self.assertEqual(box['excluded'],{'table':2})
        table_only=copy.deepcopy(h)
        table_only['boxes'][0]['text']='<table><tr><td>TABLE_ONLY</td></tr></table>'
        self.assertEqual(render(table_only,'history-fixture/0/box/0')['text'],'豆腐块标题\n\nReadable Box\n')
        self.assertEqual([r['kind'] for r in (body,moment,box,person)],['scene','moment','box','person'])
        for part in (moment,box,person):
            self.assertNotIn(part['blocks'][0]['text'],body['text'])
            self.assertEqual(part['sceneIndices'],[0])
            self.assertEqual(part['policy'],3)
        self.assertEqual(text_of('甲<b>乙</b>丙<br>中文 &amp; English'),'甲乙丙\n中文 & English')

    def test_batch_resume_complete_and_routes(self):
        first = p.prepare(self.library,self.source,limit=1)
        self.assertEqual((first['prepared'],first['missing']),(1,6))
        with self.assertRaisesRegex(ValueError,'Incomplete'):
            p.validate(self.library,self.source,complete=True)
        second = p.prepare(self.library,self.source,limit=2)
        self.assertEqual(second['prepared'],3)
        p.prepare(self.library,self.source,limit=99)
        self.assertEqual(p.validate(self.library,self.source,complete=True)['prepared'],7)
        before = {f.name:f.read_bytes() for f in (self.library/'text').glob('*')}
        self.assertEqual(p.prepare(self.library,self.source,limit=2)['preparedThisBatch'],[])
        self.assertEqual(before,{f.name:f.read_bytes() for f in (self.library/'text').glob('*')})
        routes = p.read_json(self.library/'source.json')['routes']
        self.assertEqual(routes[0]['scenes'],['history-fixture/0','history-fixture/1'])
        self.assertEqual(routes[1]['scenes'],['history-fixture/0'])

    def test_topic_complete_title_separate_and_no_bibliography(self):
        s = self.prepared()
        h,t = s['entries']
        title = render(h,'history-fixture/title')['text']
        self.assertIn('Chapter English',title)
        self.assertNotIn('第一幕',title)
        self.assertNotIn('章节标题',render(h,'history-fixture/0')['text'])
        self.assertNotIn('章节来源',render(h,'history-fixture/1')['text'])
        self.assertNotIn(h['period'],title)
        self.assertEqual(title,'章节标题\n\nChapter English\n')
        topic = render(t,'topic-fixture')
        self.assertEqual(topic['sceneIndices'],[0,1])
        self.assertLess(topic['text'].index('专题开头'),topic['text'].index('专题结尾'))
        self.assertNotIn('专题出处',topic['text'])
        self.assertNotIn(t['period'],topic['text'])
        self.assertEqual(topic['text'],'完整专题\n\nComplete Topic\n\n第一阶段\n\n专题一幕\n\n专题开头。\n\n第二阶段\n\n专题二幕\n\n专题结尾。\n')
        self.assertEqual([b['source'] for b in topic['blocks']],['topic-fixture.'+ref for ref in
                         ('title','en','scenes[0].date','scenes[0].title','html[data-scene-text="0"]',
                          'scenes[1].date','scenes[1].title','html[data-scene-text="1"]')])
        t['moments']=copy.deepcopy(h['moments']);t['boxes']=copy.deepcopy(h['boxes'])
        t['scenes'][0]['people']=copy.deepcopy(h['scenes'][0]['people'])
        self.assertEqual(render(t,'topic-fixture')['text'],topic['text'])
        for kind in ('moment','box','person'):
            self.assertEqual(render(t,'topic-fixture/0/'+kind+'/0')['text'],
                             render(h,'history-fixture/0/'+kind+'/0')['text'])
        plan=tracks_for(s)['topic-fixture']
        self.assertIsNone(plan['titleId'])
        self.assertEqual([i['kind'] for i in plan['extras']],['moment','box'])
        self.assertEqual(plan['people'][0]['id'],'topic-fixture/0/person/0')

    def test_incremental_hash_contract(self):
        s = self.prepared()
        h = s['entries'][0]
        ids = [i for i in asset_ids(s) if i.startswith('history-')]
        hashes = lambda e:[render(e,i)['textHash'] for i in ids]
        old = hashes(h)
        changed = copy.deepcopy(h); changed['html']=changed['html'].replace('第二幕正文','新正文')
        self.assertEqual([i for i,a,b in zip(ids,old,hashes(changed)) if a!=b],['history-fixture/1'])
        changed = copy.deepcopy(h); changed['title']='新大标题'
        self.assertEqual([i for i,a,b in zip(ids,old,hashes(changed)) if a!=b],['history-fixture/title'])
        changed = copy.deepcopy(h); changed['boxes'][0]['text']=changed['boxes'][0]['text'].replace('TABLE_ONLY','ALTERED_CELL')
        changed['sources'][0]={'label':'新的不读参考资料','url':'https://changed.invalid'}
        changed['period']='1700—1800'
        changed['scenes'][0]['date']='1750年'
        changed['scenes'][0]['people'][0].update(when='1770年',life='1701—1801',sources=[['新人物出处','https://other.invalid']])
        changed['moments'][0].update(date='1700',period='1600—1700')
        changed['mapColor']='#123456'
        self.assertEqual(hashes(changed),old)
        changed['scenes'][0]['people'][0]['note']='只有这次人物出现的经历变了。'
        self.assertEqual([i for i,a,b in zip(ids,old,hashes(changed)) if a!=b],['history-fixture/0/person/0'])
        record=render(h,ids[1])
        same_speech={**record,'id':'history-other/1','policy':2,'blocks':[]}
        self.assertEqual(p.input_hash(record,p.config_for('+0Hz')),p.input_hash(same_speech,p.config_for('+0Hz')))
        self.assertNotEqual(p.input_hash(record,p.config_for('+0Hz')),p.input_hash(record,p.config_for('-5Hz')))

    def test_tampered_material_and_snapshot_rejected(self):
        self.prepared()
        meta,txt=p.item_paths(self.library,'history-fixture/0')
        txt.write_text('丢了正文',encoding='utf-8')
        with self.assertRaisesRegex(ValueError,'round-trip'):
            p.validate(self.library,self.source)
        p.prepare(self.library,self.source,only=['history-fixture/0'])
        snapshot=p.read_json(self.library/'source.json'); snapshot['entries'][0]['title']='篡改来源'
        p.save_json(self.library/'source.json',snapshot)
        with self.assertRaisesRegex(ValueError,'mismatch'):
            p.validate(self.library,self.source)

    def test_resume_after_abandoned_atomic_write(self):
        p.prepare(self.library,self.source,limit=1)
        script=self.library/'text'/'history-fixture__0.txt.pending-999999'
        script.write_text('interrupted',encoding='utf-8')
        p.prepare(self.library,self.source,limit=99)
        self.assertFalse(script.exists())
        self.assertEqual(p.validate(self.library,self.source,complete=True)['prepared'],7)

    def test_changed_source_requires_new_library(self):
        self.prepared()
        with (self.source/'src'/'history_entries.js').open('a') as f:f.write('\n// map-only edit')
        with self.assertRaisesRegex(ValueError,'Source changed'):
            p.validate(self.library,self.source)
        self.assertTrue((self.library/'text'/'history-fixture__0.txt').exists())

    def test_bad_inventory_and_unassigned_prose(self):
        snapshot=self.prepared()
        bad=copy.deepcopy(snapshot); bad['entries'].append(bad['entries'][0])
        with self.assertRaisesRegex(ValueError,'duplicate'):p.inspect_snapshot(bad)
        bad=copy.deepcopy(snapshot); bad['entries'][0]['moments'][0]['scene']=9
        with self.assertRaisesRegex(ValueError,'Unassigned'):p.inspect_snapshot(bad)
        for change in [lambda h:h['html']+'<p>无归属正文</p>',
                       lambda h:h['html'].replace('data-scene-text="1"','data-scene-text="0"')]:
            h=copy.deepcopy(snapshot['entries'][0]);h['html']=change(h)
            with self.assertRaisesRegex(ValueError,'scene body|unassigned'):render(h,'history-fixture/0')
        with self.assertRaisesRegex(ValueError,'Unknown'):p.prepare(self.library,self.source,only=['not-a-track'])
        with self.assertRaisesRegex(ValueError,'Unsafe'):p.slug('../../escape')
        with self.assertRaisesRegex(ValueError,'outside'):p.within(self.cache,'../escape.mp3')

    def test_dry_run_never_calls_provider_and_requires_pitch(self):
        self.prepared()
        with patch.object(p,'make_audio',side_effect=AssertionError('Provider called')):
            result=p.synthesize(self.library,self.source,self.cache,'+0Hz',limit=2)
            self.assertEqual(result['mode'],'dry-run')
            self.assertEqual(len(result['jobs']),2)
            self.assertEqual(result['networkRequests'],0)
            self.assertFalse(self.cache.exists())
            with self.assertRaisesRegex(ValueError,'pitch'):
                p.synthesize(self.library,self.source,self.cache,None)
        with self.assertRaises(SystemExit):
            with patch('sys.stderr',io.StringIO()):
                p.main(['prepare','--library',str(self.library),'--source',str(self.source),'--execute'])

    @staticmethod
    def fake_probe(path):
        return {'duration':1.0,'bytes':path.stat().st_size,'codec_name':'mp3','sample_rate':'24000','channels':1}

    async def fake_stream(self,script,config):
        yield {'type':'audio','data':b'offline-test-audio'}
        yield {'type':'WordBoundary','text':script,'offset':0,'duration':8_000_000}

    def test_audio_cache_resume_and_corruption(self):
        snapshot=self.prepared(); record=render(snapshot['entries'][0],'history-fixture/0')
        config=p.config_for('+0Hz')
        with patch.object(p,'probe_audio',side_effect=self.fake_probe):
            receipt,reused=asyncio.run(p.make_audio(self.cache,record,record['text'],config,3,self.fake_stream))
            self.assertFalse(reused);self.assertEqual(receipt['listeningReview'],'pending')
            async def forbidden(*args):
                raise AssertionError('Cache incorrectly calls provider')
                yield
            another_id={**record,'id':'history-other/9/person/2','policy':2}
            _,reused=asyncio.run(p.make_audio(self.cache,another_id,record['text'],config,3,forbidden))
            self.assertTrue(reused)
            (self.cache/receipt['file']).write_bytes(b'corrupted')
            with self.assertRaisesRegex(ValueError,'checksum'):
                asyncio.run(p.make_audio(self.cache,record,record['text'],config,3,forbidden))

    def test_failed_or_incomplete_stream_never_accepted(self):
        snapshot=self.prepared();record=render(snapshot['entries'][0],'history-fixture/0');config=p.config_for('+0Hz')
        async def interrupted(script,config):
            yield {'type':'audio','data':b'partial'}
            raise RuntimeError('interrupted')
        async def truncated(script,config):
            yield {'type':'audio','data':b'decodable-but-short'}
            yield {'type':'WordBoundary','text':'漏了大部分','offset':0,'duration':8_000_000}
        with patch.object(p,'probe_audio',side_effect=self.fake_probe):
            with self.assertRaisesRegex(RuntimeError,'interrupted'):
                asyncio.run(p.make_audio(self.cache,record,record['text'],config,3,interrupted))
            with self.assertRaisesRegex(ValueError,'coverage'):
                asyncio.run(p.make_audio(self.cache,record,record['text'],config,3,truncated))
            self.assertFalse(list(self.cache.rglob('*.partial.mp3')))
            self.assertFalse(list((self.cache/'receipts').glob('*.json')))
            self.assertTrue(list((self.cache/'failed').glob('*.json')))
            _,reused=asyncio.run(p.make_audio(self.cache,record,record['text'],config,3,self.fake_stream))
            self.assertFalse(reused)

    def test_small_state_keeps_boundaries_in_receipt_only(self):
        self.prepared()
        original=p.make_audio
        async def offline(cache,record,script,config,timeout):
            return await original(cache,record,script,config,timeout,self.fake_stream)
        with patch.object(p,'make_audio',side_effect=offline), patch.object(p,'probe_audio',side_effect=self.fake_probe):
            p.synthesize(self.library,self.source,self.cache,'+0Hz',only=['history-fixture/0'],execute=True)
            state=p.read_json(self.library/'audio-state.json')
            self.assertEqual(state['schema'],2)
            item=state['items']['history-fixture/0']
            self.assertNotIn('boundaries',item)
            receipt=p.read_json(p.receipt_path(self.cache,item['inputHash']))
            self.assertIn('boundaries',receipt)
            self.assertEqual(item,p.compact_receipt(receipt))
            result=p.synthesize(self.library,self.source,self.cache,'+0Hz',only=['history-fixture/0'])
            self.assertTrue(result['jobs'][0]['cachedReceipt'])
            result=p.synthesize(self.library,self.source,self.cache,'+0Hz',limit=99)
            self.assertNotIn('history-fixture/0',[j['id'] for j in result['jobs']])

    def test_authorized_selection_and_offline_audio_verification(self):
        self.prepared()
        original=p.make_audio
        async def offline(cache,record,script,config,timeout):
            return await original(cache,record,script,config,timeout,self.fake_stream)
        selection=['history-fixture/0']
        with patch.object(p,'make_audio',side_effect=offline), patch.object(p,'probe_audio',side_effect=self.fake_probe):
            first=p.synthesize(self.library,self.source,self.cache,'+0Hz',selection=selection,execute=True)
            self.assertEqual([j['id'] for j in first['jobs']],selection)
            second=p.synthesize(self.library,self.source,self.cache,'+0Hz',selection=selection,execute=True)
            self.assertEqual(second['jobs'],[])
            verified=p.verify_audio(self.library,self.source,self.cache,'+0Hz',selection)
            self.assertEqual(verified['items'],1)
            self.assertEqual(verified['networkRequests'],0)
            self.assertEqual(len(p.read_json(self.library/'audio-state.json')['items']),1)

    def test_errors_identify_file_and_timeout(self):
        self.prepared()
        broken=self.root/'broken.json';broken.write_text('{')
        with self.assertRaisesRegex(ValueError,'broken.json'):
            p.read_json(broken)
        with patch.object(p,'make_audio',side_effect=asyncio.TimeoutError):
            with self.assertRaisesRegex(ValueError,'history-fixture/0.*TimeoutError'):
                p.synthesize(self.library,self.source,self.cache,'+0Hz',only=['history-fixture/0'],execute=True)
        self.assertIn('TimeoutError', (self.library/'failures.jsonl').read_text())

    def test_player_cache_includes_its_private_build_inputs(self):
        spec=importlib.util.spec_from_file_location('player_test_runner',TESTS/'run_tests.py')
        runner=importlib.util.module_from_spec(spec);spec.loader.exec_module(runner)
        tests=self.root/'player-cache'/'tests';tests.mkdir(parents=True)
        src=tests.parent/'src';src.mkdir()
        (tests/'verify-audio-player.js').write_text('// private previews')
        js=src/'audio_player.js';js.write_text('original')
        first=runner.inputs_key(tests,'unchanged-index','verify-audio-player.js')
        js.write_text('changed')
        self.assertNotEqual(first,runner.inputs_key(tests,'unchanged-index','verify-audio-player.js'))
        picked=runner.pick_suites(tests,{'sections':[],'engineChanged':True,'linesChanged':False},['verify-audio-player.js'])
        self.assertIn('verify-audio-player.js',picked)

    def test_invalid_html_and_dirty_sources_fail_closed(self):
        for tag in ('table','div','p','details'):
            with self.assertRaisesRegex(ValueError,'inside <p>'):
                ReaderHTML('<p>before<'+tag+'>inside</'+tag+'>after</p>')
        snapshot=self.prepared();snapshot['source']['dirty']=[' M src/history_content.json']
        with self.assertRaisesRegex(ValueError,'uncommitted'):
            p.inspect_snapshot(snapshot)
        self.assertEqual(p.inspect_snapshot(snapshot,require_clean=False),asset_ids(snapshot))

    def test_runner_cache_includes_python_and_pipeline_sources(self):
        spec=importlib.util.spec_from_file_location('audio_test_runner',TESTS/'run_tests.py')
        runner=importlib.util.module_from_spec(spec);spec.loader.exec_module(runner)
        root=self.root/'cache-test';tests=root/'tests';tools=root/'tools'/'audio'
        tests.mkdir(parents=True);tools.mkdir(parents=True)
        (tests/'verify-audio-pipeline.js').write_text('fixture launcher')
        helper=tests/'audio_pipeline_test.py';helper.write_text('helper-v1')
        tool=tools/'pipeline.py';tool.write_text('pipeline-v1')
        key=lambda:runner.inputs_key(tests,'page-hash','verify-audio-pipeline.js')
        first=key();helper.write_text('helper-v2');second=key();tool.write_text('pipeline-v2');third=key()
        self.assertEqual(len({first,second,third}),3)

    def test_release_preview_integrity_and_changed_text_gate(self):
        self.prepared()
        scope={'schema':1,'policy':POLICY,'lines':['main'],'romanLastScene':'unused','profile':
               {k:p.config_for('+0Hz')[k] for k in ('voice','pitch','rate','volume')}}
        scope_path=self.root/'scope.json';p.save_json(scope_path,scope)
        release.refresh_scope(self.source,scope_path);scope=p.read_json(scope_path)
        extra_scope={**scope,'lines':[],'extraIds':['history-fixture/0']}
        self.assertEqual(release.required_ids(release.current_source(self.source),extra_scope),
                         {'topic-fixture','history-fixture/0','history-fixture/title',
                          'history-fixture/0/moment/0','history-fixture/0/box/0','history-fixture/0/person/0'})
        original=p.make_audio
        async def offline(cache,record,script,config,timeout):
            return await original(cache,record,script,config,timeout,self.fake_stream)
        output=self.root/'preview.json'
        with patch.object(p,'make_audio',side_effect=offline), patch.object(p,'probe_audio',side_effect=self.fake_probe):
            p.synthesize(self.library,self.source,self.cache,'+0Hz',selection=scope['ids'],execute=True)
            release.make_manifest(self.library,self.source,self.cache,scope_path,output,local=True)
            report=release.check_manifest(self.source,output,scope_path,allow_local=True)
            self.assertEqual(report['assets'],7);self.assertEqual(report['networkRequests'],0)
            self.assertEqual((p.read_json(output)['schema'],p.read_json(output)['policy']),(2,3))
            local_file=next((self.cache/'audio').glob('*.mp3'));original_bytes=local_file.read_bytes()
            local_file.write_bytes(b'corrupt local bytes')
            with self.assertRaisesRegex(ValueError,'local MP3 differs'):
                release.check_manifest(self.source,output,scope_path,allow_local=True)
            local_file.write_bytes(original_bytes)
            # A build cannot publish local file URLs, even though a local preview can play them.
            with self.assertRaisesRegex(ValueError,'public Blob'):
                release.check_manifest(self.source,output,scope_path)
            report=release.upload(self.library,self.source,self.cache,scope_path,None)
            self.assertEqual(report['mode'],'dry-run');self.assertEqual(report['networkRequests'],0)
            self.assertEqual(report['uniqueFiles'],1)  # The fixture intentionally returns identical bytes.
            host='fixture-store.public.blob.vercel-storage.com'
            scope['blobHost']=host;p.save_json(scope_path,scope)
            published=self.root/'published.json';published.write_text('keep old manifest')
            p.save_json(release.ledger_path(self.cache,host),{'schema':1,'host':host,'files':{}})
            with self.assertRaisesRegex(ValueError,'upload first'):
                release.make_manifest(self.library,self.source,self.cache,scope_path,published,host=host)
            self.assertEqual(published.read_text(),'keep old manifest')
            sha=next(iter(p.read_json(output)['assets'].values()))['audioHash']
            p.save_json(release.ledger_path(self.cache,host),{'schema':1,'host':host,'files':
                {sha:{'url':'https://'+host+'/audio/v1/'+sha+'.mp3','bytes':len(b'offline-test-audio')}}})
            release.make_manifest(self.library,self.source,self.cache,scope_path,published,host=host)
            self.assertEqual(release.check_manifest(self.source,published,scope_path)['assets'],7)
        old_history=copy.deepcopy(self.raw['history'][0])
        self.raw['history'][0]['period']='1700—1800年'
        self.raw['history'][0]['scenes'][0]['date']='1750年'
        self.raw['history'][0]['sources'][0]['label']='不朗读的新参考标题'
        self.write_source()
        self.assertEqual(release.check_manifest(self.source,published,scope_path,strict=True)['assets'],7)
        self.raw['history'][0]=old_history;self.write_source()
        original_html=self.raw['history'][0]['html']
        self.raw['history'][0]['html']=original_html.replace('甲','改过的甲',1);self.write_source()
        resolved,report=release.resolve_manifest(self.source,published,scope_path)
        self.assertEqual(set(resolved['assets']),set(scope['ids'])-{'history-fixture/0'})
        self.assertEqual(report['stale'],['history-fixture/0'])
        self.raw['history'][0]['html']=original_html;self.write_source()
        full=p.read_json(published);empty=copy.deepcopy(full);empty['assets']={};p.save_json(published,empty)
        resolved,report=release.resolve_manifest(self.source,published,scope_path)
        self.assertEqual(resolved['assets'],{});self.assertEqual(len(report['pending']),7)
        with self.assertRaisesRegex(ValueError,'Audio incomplete'):
            release.resolve_manifest(self.source,published,scope_path,strict=True)
        p.save_json(published,full)
        self.raw['history'][0]['title']='Changed heading';self.write_source()
        with self.assertRaisesRegex(ValueError,'text changed'):
            release.check_manifest(self.source,published,scope_path,strict=True)
        resolved,report=release.resolve_manifest(self.source,published,scope_path)
        self.assertEqual(set(resolved['assets']),{'topic-fixture'})
        self.assertEqual(report['stale'],['history-fixture/title'])
        self.assertEqual(set(report['missingTitle']),set(scope['ids'])-{'history-fixture/title','topic-fixture'})
        self.assertEqual(report['networkRequests'],0)
        # Even obsolete/stale items do not excuse illegal URLs, profiles or a wrong store.
        good=p.read_json(published)
        for bad_url in ['http://bad/a.mp3','../local.mp3','file:///audio.mp3',
                        'https://another.public.blob.vercel-storage.com/audio/v1/'+sha+'.mp3',
                        'https://'+host+'/audio/v1/'+sha+'.mp3?token=forbidden',
                        'https://'+host+'/audio/v1/'+sha+'.mp3#fragment',
                        'https://user:secret@'+host+'/audio/v1/'+sha+'.mp3',
                        'https://'+host+':443/audio/v1/'+sha+'.mp3']:
            bad=copy.deepcopy(good);bad['assets']['history-fixture/0']['url']=bad_url;p.save_json(published,bad)
            with self.subTest(url=bad_url),self.assertRaisesRegex(ValueError,'public Blob'):
                release.resolve_manifest(self.source,published,scope_path)
        bad=copy.deepcopy(good);bad['profile']['pitch']='-5Hz';p.save_json(published,bad)
        with self.assertRaisesRegex(ValueError,'profile'):
            release.resolve_manifest(self.source,published,scope_path)
        for mutation,pattern in [(lambda d:d['assets'].__setitem__('history-fixture/0',[]),'asset must be an object'),
                                  (lambda d:d['assets']['history-fixture/0'].__setitem__('duration',True),'invalid duration'),
                                  (lambda d:d.__setitem__('schema',True),'schema/profile'),
                                  (lambda d:d.__setitem__('schema',1),'schema/profile'),
                                  (lambda d:d.__setitem__('policy',2),'policy'),
                                  (lambda d:d.__setitem__('policy',True),'policy'),
                                  (lambda d:d.pop('policy'),'policy'),
                                  (lambda d:d['assets']['history-fixture/0'].__setitem__('bytes',True),'invalid bytes'),
                                  (lambda d:d['assets']['history-fixture/0'].__setitem__('textHash','bad'),'invalid textHash'),
                                  (lambda d:d['assets']['history-fixture/0'].__setitem__('duration',float('nan')),'invalid duration')]:
            bad=copy.deepcopy(good);mutation(bad);p.save_json(published,bad)
            with self.assertRaisesRegex(ValueError,pattern):
                release.resolve_manifest(self.source,published,scope_path)
        p.save_json(published,good)
        # New topics must not freeze the book, but are listed as pending and fail the strict audio gate.
        extra=copy.deepcopy(TOPIC);extra['id']='topic-new';self.raw['topics'].append(extra);self.write_source()
        resolved,report=release.resolve_manifest(self.source,published,scope_path)
        self.assertIn('topic-new',report['pending']);self.assertTrue(report['scopeWarning'])
        with self.assertRaisesRegex(ValueError,'Covered lines/topics changed'):
            release.resolve_manifest(self.source,published,scope_path,strict=True)

    def test_structural_dates_omitted_but_authored_years_retained(self):
        snapshot=self.prepared();h=snapshot['entries'][0]
        h['title']='章节标题：1500年';h['en']='Chapter 1600'
        h['period']='1400—1700年'
        h['scenes'][0].update(date='1801年',title='1501年的第一幕')
        h['html']=h['html'].replace('甲<strong>乙</strong>丙','1501年有12人，前480年，20世纪，甲<strong>乙</strong>丙')
        h['moments'][0].update(date='OMIT_MOMENT_1520',period='OMIT_MOMENT_PERIOD',
                               name='1520年的名场面',en='Moment 1520',text='<p>1520年有2件事。</p>')
        h['boxes'][0].update(date='OMIT_BOX_1530',period='OMIT_BOX_PERIOD',
                            name='1530年的专栏',text='<p>1530年有3个人。</p>')
        h['scenes'][0]['people'][0].update(when='1541年',life='1500—1560',
                                           event='1540年的小事',note='1540年经历。',bio='1550年的传记（Name Ⅱ）。')
        records=[render(h,i) for i in asset_ids(snapshot) if i.startswith('history-')]
        combined=''.join(r['text'] for r in records)
        for omitted in ('1400—1700年','1801年','1541年','1500—1560','OMIT_'):
            self.assertNotIn(omitted,combined)
        for visible in ('1500年','Chapter 1600','1501年的第一幕','1501年有12人，前480年，20世纪',
                        '1520年的名场面','Moment 1520','1520年有2件事','1530年的专栏','1530年有3个人',
                        '1540年的小事','1540年经历','1550年的传记（Name Ⅱ）'):
            self.assertIn(visible,combined)
        for record in records:
            for block in record['blocks']:
                self.assertFalse(block['source'].endswith(('.period','.date','.when','.life')))
                self.assertNotIn('.sources[',block['source'])

    def test_topic_kickers_ratios_and_narrative_years_retained(self):
        snapshot=self.prepared();topic=snapshot['entries'][1]
        kickers=['中央官制','地方官制','兵制','地下森林','技术链','1:10 与 1:1000','1500年']
        topic['scenes']=[{'title':'第%d幕：有12人' % i,'date':label,'people':[]} for i,label in enumerate(kickers)]
        topic['html']=''.join('<p data-scene-text="%d">正文在1501年有12人。</p>' % i for i in range(len(kickers)))
        record=render(topic,'topic-fixture')
        expected=[topic['title'],topic['en']]
        for i,label in enumerate(kickers):
            expected.extend([label,topic['scenes'][i]['title'],'正文在1501年有12人。'])
        self.assertEqual(record['text'],'\n\n'.join(expected)+'\n')
        self.assertEqual(record['retainedMetadata'],[
            {'source':'topic-fixture.scenes[%d].date' % i,'text':label,'reason':'topic-kicker'}
            for i,label in enumerate(kickers)])
        self.assertNotIn(topic['period'],record['text'])
        self.assertNotIn('专题出处',record['text'])
        changed=copy.deepcopy(topic);changed['period']='另一个不显示的专题口号'
        self.assertEqual(render(changed,'topic-fixture')['textHash'],record['textHash'])
        changed['scenes'][0]['date']='中央制度'
        self.assertNotEqual(render(changed,'topic-fixture')['textHash'],record['textHash'])

    def test_non_time_and_uncertain_fixed_labels_retained_actual_times_omitted(self):
        snapshot=self.prepared();history=snapshot['entries'][0]
        baseline=render(history,'history-fixture/0')['text']
        for label in ('古风时代','公元前后','前 4千纪—约前 3100年','尤其前 14—前 13世纪',
                      '征服后至前 4世纪','1572年8月24日凌晨','1849年3月23日夜','1500—1560'):
            history['scenes'][0]['date']=label
            record=render(history,'history-fixture/0')
            with self.subTest(time_label=label):
                self.assertEqual(record['text'],baseline)
                self.assertNotIn('retainedMetadata',record)
        for label in ('地理','1:10 与 1:1000','1/10','1500','未知纪元','第2版：1500年的地理'):
            history['scenes'][0]['date']=label
            record=render(history,'history-fixture/0')
            with self.subTest(retained_label=label):
                self.assertEqual(record['text'],label+'\n\n'+baseline)
                self.assertEqual(record['retainedMetadata'],[{
                    'source':'history-fixture.scenes[0].date','text':label,'reason':'non-time-or-uncertain'}])
        history['period']='地理概览'
        title=render(history,'history-fixture/title')
        self.assertEqual(title['text'],'章节标题\n\nChapter English\n\n地理概览\n')
        self.assertEqual(title['retainedMetadata'][0]['source'],'history-fixture.period')
        person=history['scenes'][0]['people'][0]
        person.update(when='身份待考2则',life='传说人物',note='1501年有12人的叙述不删。')
        record=render(history,'history-fixture/0/person/0')
        self.assertEqual(record['text'],'身份待考2则\n\n测试人\n\nRené Example\n\n传说人物\n\n一件小事\n\n师承关系。\n\n1501年有12人的叙述不删。\n\n折叠传记（Foreign Name）。\n')
        self.assertEqual(record['retainedMetadata'],[
            {'source':'history-fixture.scenes[0].people[0].when','text':'身份待考2则','reason':'non-time-or-uncertain'},
            {'source':'history-fixture.scenes[0].people[0].life','text':'传说人物','reason':'non-time-or-uncertain'}])
        # Mixed date/identity and date/event wording is deliberately flagged, not guessed away.
        person.update(life='前2世纪 · 安息国王',when='1456年平反—1920年封圣')
        record=render(history,'history-fixture/0/person/0')
        self.assertEqual([m['text'] for m in record['retainedMetadata']],[person['when'],person['life']])
        self.assertIn(person['life'],record['text']);self.assertIn(person['when'],record['text'])
        # The same known time words in ordinary authored titles/body are never filtered.
        history['scenes'][0].update(date='古风时代',title='古风时代：公元前后仍有12人')
        history['html']=history['html'].replace('甲<strong>乙</strong>丙','古风时代、公元前后，1501年甲<strong>乙</strong>丙')
        record=render(history,'history-fixture/0')
        self.assertIn('古风时代：公元前后仍有12人',record['text'])
        self.assertIn('古风时代、公元前后，1501年甲乙丙',record['text'])
        self.assertNotIn('retainedMetadata',record)

    def test_retained_metadata_audit_includes_unprepared_unselected_catalog(self):
        self.raw['history'][0]['period']='地理概览'
        self.raw['history'][0]['scenes'][0]['date']='地理'
        self.cards['history-fixture/0'][0]['when']='人物身份待考'
        self.write_source()
        before={f.name:f.read_bytes() for f in (self.source/'src').iterdir()}
        selection=['history-fixture/0']
        report=p.prepare(self.library,self.source,selection=selection)
        report=p.validate(self.library,self.source,complete=True,selection=selection)
        self.assertEqual((report['prepared'],report['catalogMissing']),(1,6))
        audit=report['retainedMetadata']
        self.assertEqual([(m['id'],m['source'],m['text'],m['reason'],m['selected']) for m in audit],[
            ('history-fixture/title','history-fixture.period','地理概览','non-time-or-uncertain',False),
            ('history-fixture/0','history-fixture.scenes[0].date','地理','non-time-or-uncertain',True),
            ('history-fixture/0/person/0','history-fixture.scenes[0].people[0].when','人物身份待考','non-time-or-uncertain',False),
            ('topic-fixture','topic-fixture.scenes[0].date','第一阶段','topic-kicker',False),
            ('topic-fixture','topic-fixture.scenes[1].date','第二阶段','topic-kicker',False)])
        catalog=p.read_json(self.library/'catalog.json')
        self.assertEqual(catalog['retainedMetadata'],[{k:v for k,v in m.items() if k!='selected'} for m in audit])
        record=p.read_json(p.item_paths(self.library,'history-fixture/0')[0])
        self.assertEqual(record['retainedMetadata'],[{'source':'history-fixture.scenes[0].date',
                                                    'text':'地理','reason':'non-time-or-uncertain'}])
        self.assertEqual(before,{f.name:f.read_bytes() for f in (self.source/'src').iterdir()})
        catalog['retainedMetadata'][0]['text']='篡改审计标签';p.save_json(self.library/'catalog.json',catalog)
        with self.assertRaisesRegex(ValueError,'Catalog/snapshot mismatch'):
            p.validate(self.library,self.source,selection=selection)

    def test_person_external_anchor_text_omitted_internal_refs_and_prose_kept(self):
        snapshot=self.prepared();h=snapshot['entries'][0]
        person=h['scenes'][0]['people'][0]
        for field in ('name','en','event','relation','note','bio'):
            person[field]+=('前<a href=" HTTPs://example.invalid/'+field+'"><b>EXTERNAL_'+field+'</b></a>后'
                            '<a href="#history-fixture/1">内部1501年</a><a data-go="topic-fixture">专题指针</a>')
        person['note']+=('<a href="http://example.invalid">外部二</a><a href="https&#58;//example.invalid">外部三</a>'
                         '1540年有12人。<a href="//example.invalid/page"><b>外部四</b></a>'
                         '<a href="chapter.html#scene">相对1550年</a><a href="../chapter.html">上级1560年</a>'
                         '<a href="/chapter.html">站内1570年</a>')
        item=render(h,'history-fixture/0/person/0')
        self.assertEqual(item['excluded'],{'external-link':9})
        self.assertEqual(item['text'].count('前后内部1501年专题指针'),6)
        self.assertIn('1540年有12人。相对1550年上级1560年站内1570年',item['text'])
        for unwanted in ('EXTERNAL_','外部二','外部三','外部四','人物来源','https://','<a'):
            self.assertNotIn(unwanted,item['text'])
        # External anchors remain readable in ordinary prose and supplements, not in person cards.
        self.assertIn('可读链接',render(h,'history-fixture/0/box/0')['text'])
        self.assertEqual(text_of('前<a href="https://example.invalid"><b>标题</b></a>后'),'前标题后')
        with self.assertRaisesRegex(ValueError,'Unclosed excluded'):
            text_of('前<a href="https://example.invalid">不闭合',omit_external_links=True)
        person['bio']='<a href="https://example.invalid">仅有外联的传记字段</a>'
        item=render(h,'history-fixture/0/person/0')
        self.assertNotIn('仅有外联',item['text'])
        self.assertFalse(any(b['source'].endswith('.bio') for b in item['blocks']))
        self.assertIn('当时的经历。',item['text'])

    def test_source_pointer_mapping_and_independent_card_appearances(self):
        snapshot=self.prepared();h=snapshot['entries'][0]
        expected={
            'history-fixture/title':['title','en'],
            'history-fixture/0':['scenes[0].title','html[data-scene-text="0"]'],
            'history-fixture/0/moment/0':['moments[0].name','moments[0].en','moments[0].text'],
            'history-fixture/0/box/0':['boxes[0].name','boxes[0].en','boxes[0].text'],
            'history-fixture/0/person/0':['scenes[0].people[0].'+f for f in ('name','en','event','relation','note','bio')]}
        for asset_id,fields in expected.items():
            record=render(h,asset_id)
            self.assertEqual([b['source'] for b in record['blocks']],['history-fixture.'+f for f in fields])
            self.assertEqual(record['text'],'\n\n'.join(b['text'] for b in record['blocks'])+'\n')
            self.assertEqual(record['textHash'],p.digest(record['text'].encode()))
        h['scenes'][1]['people']=copy.deepcopy(h['scenes'][0]['people'])
        h['scenes'][1]['people'][0]['note']='另一次出现，1510年。'
        first=render(h,'history-fixture/0/person/0');second=render(h,'history-fixture/1/person/0')
        self.assertNotEqual(first['textHash'],second['textHash'])
        self.assertIn('另一次出现，1510年。',second['text'])
        self.assertNotIn('当时的经历。',second['text'])
        self.assertTrue(all('.scenes[1].people[0].' in b['source'] for b in second['blocks']))

    def test_canonical_ids_page_order_and_plain_track_labels(self):
        snapshot=self.prepared();h,t=snapshot['entries']
        later=copy.deepcopy(h['moments'][0]);later.update(scene=1,name='<b>后来</b>')
        earlier=copy.deepcopy(h['moments'][0]);earlier['name']='<b>先前1480</b><script>不读</script>'
        h['moments']=[later,earlier]
        h['scenes'][0]['people'][0].update(name='<em>人物</em>',event='<b>小事</b><a href="https://example.invalid">外联</a>')
        expected=['history-fixture/title','history-fixture/0','history-fixture/0/moment/1',
                  'history-fixture/0/box/0','history-fixture/0/person/0','history-fixture/1',
                  'history-fixture/1/moment/0','topic-fixture']
        self.assertEqual(asset_ids(snapshot),expected)
        plan=tracks_for(snapshot)
        self.assertEqual(plan['history-fixture/0'],{
            'bodyId':'history-fixture/0','titleId':'history-fixture/title',
            'extras':[{'id':'history-fixture/0/moment/1','kind':'moment','label':'先前1480'},
                      {'id':'history-fixture/0/box/0','kind':'box','label':'豆腐块标题'}],
            'people':[{'id':'history-fixture/0/person/0','kind':'person','label':'人物 · 小事'}]})
        self.assertEqual(tracks_for(snapshot,['history-fixture/1']),{'history-fixture/1':plan['history-fixture/1']})
        self.assertEqual(render(h,'history-fixture/0/moment/1')['blocks'][0]['source'],'history-fixture.moments[1].name')
        with self.assertRaisesRegex(ValueError,'Unknown asset'):
            render(h,'history-fixture/0/moment/0')  # Valid shape, wrong scene for this entry-wide index.
        t['moments']=copy.deepcopy(h['moments']);t['boxes']=copy.deepcopy(h['boxes'])
        t['scenes'][0]['people']=copy.deepcopy(h['scenes'][0]['people'])
        topic=tracks_for(snapshot)['topic-fixture']
        self.assertEqual([i['id'] for i in topic['extras']],
                         ['topic-fixture/0/moment/1','topic-fixture/0/box/0','topic-fixture/1/moment/0'])
        self.assertEqual(topic['people'][0]['label'],'人物 · 小事')
        selected=release.required_ids(snapshot,{'lines':[],'includeTopics':False,'extraIds':['topic-fixture']})
        self.assertEqual(selected,{'topic-fixture',*(p['id'] for group in ('extras','people') for p in topic[group])})

    def test_nested_slug_safety_and_collision_rejection(self):
        valid=['history-fixture/title','history-fixture/0','topic-fixture',
               'history-fixture/10/moment/12','history-fixture/0/box/0','history-fixture/1/person/2',
               'topic-fixture/0/moment/0','topic-fixture/2/box/3','topic-fixture/1/person/0']
        self.assertEqual(len({p.slug(i) for i in valid}),len(valid))
        for asset_id in valid:
            meta,script=p.item_paths(self.library,asset_id)
            self.assertTrue(meta.is_relative_to(self.library/'items'))
            self.assertTrue(script.is_relative_to(self.library/'text'))
        self.assertEqual(p.slug('history-fixture/10/person/2'),'history-fixture__10__person__2')
        for bad in ('../../escape','/history-fixture/0','history-fixture','history-fixture__0',
                    'history-fixture/00','topic-fixture/title','topic-fixture/0',
                    'history-fixture/title/person/0','history-fixture/0/person/01',
                    'history-fixture/0/person/-1','history-fixture/0/person/1/extra',
                    'history-fixture/0/people/0','history-fixture/0/../person/0',
                    'history-fixture/0/person/../../outside','history-fixture%2f0',
                    'history-fixture/0\\person\\0','history-fixture/0/person/0\n','other-fixture/0',
                    'history-fixture/０/person/0','history-fixture/0/person/+1','history-fixture/0/person/0?x'):
            with self.subTest(bad=bad),self.assertRaisesRegex(ValueError,'Unsafe'):
                p.item_paths(self.library,bad)

    def test_scoped_prepare_validate_resume_cli_and_full_catalog_structure(self):
        snapshot=release.current_source(self.source)
        profile={k:p.config_for('+0Hz')[k] for k in ('voice','pitch','rate','volume')}
        scope={'schema':1,'policy':3,'lines':['shared'],'includeTopics':False,'profile':profile}
        wanted=release.required_ids(snapshot,scope)
        scope['ids']=[i for i in asset_ids(snapshot) if i in wanted]
        selection=scope['ids'];self.assertEqual(len(selection),5)
        path=self.root/'selection.json';p.save_json(path,scope)
        source_before={f.name:f.read_bytes() for f in (self.source/'src').iterdir()}
        with patch('sys.stdout',io.StringIO()) as stdout:
            p.main(['prepare','--library',str(self.library),'--source',str(self.source),
                    '--selection',str(path),'--limit','2'])
            first=json.loads(stdout.getvalue())
        self.assertEqual((first['prepared'],first['missing'],first['selected']),(2,3,5))
        self.assertEqual(first['expected']['assets'],7)
        with self.assertRaisesRegex(ValueError,'Incomplete'):
            p.validate(self.library,self.source,complete=True,selection=selection)
        second=p.prepare(self.library,self.source,limit=99,selection=selection)
        self.assertEqual((second['prepared'],second['missing'],second['catalogMissing']),(5,0,2))
        self.assertEqual(p.prepare(self.library,self.source,selection=selection)['preparedThisBatch'],[])
        with patch('sys.stdout',io.StringIO()) as stdout:
            p.main(['validate','--library',str(self.library),'--source',str(self.source),
                    '--selection',str(path),'--complete'])
            self.assertEqual(json.loads(stdout.getvalue())['status'],'complete')
        self.assertEqual(len(list((self.library/'text').glob('*.txt'))),5)
        self.assertEqual(p.read_json(self.library/'catalog.json')['ids'],asset_ids(snapshot))
        with self.assertRaisesRegex(ValueError,'Incomplete'):
            p.validate(self.library,self.source,complete=True)
        with patch.object(p,'make_audio',side_effect=AssertionError('Provider called')):
            dry=p.synthesize(self.library,self.source,self.cache,'+0Hz',selection=selection)
            self.assertEqual([i['id'] for i in dry['jobs']],selection)
            self.assertFalse(self.cache.exists())
        self.assertEqual(source_before,{f.name:f.read_bytes() for f in (self.source/'src').iterdir()})
        # Even prepared material outside the selected completeness set is checked, not ignored.
        p.prepare(self.library,self.source,only=['topic-fixture'])
        p.item_paths(self.library,'topic-fixture')[1].write_text('tampered unselected',encoding='utf-8')
        with self.assertRaisesRegex(ValueError,'round-trip.*topic-fixture'):
            p.validate(self.library,self.source,selection=selection)

    def test_unprepared_unselected_source_must_still_be_structurally_valid(self):
        self.raw['topics'][0]['html']+='<p>无归属的未选专题正文</p>';self.write_source()
        with self.assertRaisesRegex(ValueError,'unassigned'):
            p.prepare(self.library,self.source,selection=['history-fixture/title'])
        self.assertFalse((self.library/'catalog.json').exists())
        with self.assertRaisesRegex(ValueError,'unassigned'):
            release.current_source(self.source)

    def test_empty_duplicate_and_unbounded_execution_selections_rejected(self):
        self.prepared()
        for selection in ([],['history-fixture/0','history-fixture/0'],['history-fixture/0/person/9'],
                          'history-fixture/0',[{}]):
            with self.subTest(selection=selection),self.assertRaisesRegex(ValueError,'selection'):
                p.prepare(self.library,self.source,selection=selection)
        with patch.object(p,'make_audio',side_effect=AssertionError('Provider called')):
            with self.assertRaisesRegex(ValueError,'explicit --selection'):
                p.synthesize(self.library,self.source,self.cache,'+0Hz',execute=True)
        with self.assertRaisesRegex(ValueError,'not both'):
            p.prepare(self.library,self.source,only=['history-fixture/0'],selection=['history-fixture/1'])

    def test_narrow_scope_manifest_requires_only_selected_material(self):
        scope_path=self.root/'narrow-scope.json'
        p.save_json(scope_path,{'schema':1,'lines':['shared'],'includeTopics':False,'profile':
            {k:p.config_for('+0Hz')[k] for k in ('voice','pitch','rate','volume')}})
        counts=release.refresh_scope(self.source,scope_path);scope=p.read_json(scope_path)
        self.assertEqual(counts['assets'],5);self.assertEqual(counts['topics'],0)
        p.prepare(self.library,self.source,limit=99,selection=scope['ids'])
        original=p.make_audio
        async def offline(cache,record,script,config,timeout):
            return await original(cache,record,script,config,timeout,self.fake_stream)
        output=self.root/'narrow-preview.json'
        with patch.object(p,'make_audio',side_effect=offline),patch.object(p,'probe_audio',side_effect=self.fake_probe):
            p.synthesize(self.library,self.source,self.cache,'+0Hz',selection=scope['ids'],execute=True)
            result=p.verify_audio(self.library,self.source,self.cache,'+0Hz',scope['ids'])
            self.assertEqual(result['items'],5)
            release.make_manifest(self.library,self.source,self.cache,scope_path,output,local=True)
        manifest,report=release.resolve_manifest(self.source,output,scope_path,allow_local=True,strict=True)
        self.assertEqual(report['status'],'valid');self.assertEqual(report['required'],5)
        self.assertEqual(set(manifest['tracks']),{'history-fixture/0'})
        self.assertNotIn('topic-fixture',manifest['assets'])
        self.assertFalse(p.item_paths(self.library,'topic-fixture')[0].exists())
        snapshot=release.current_source(self.source)
        shared={**scope,'lines':['main','shared']}
        self.assertEqual(len(release.required_ids(snapshot,shared)),6)  # Shared body and parts deduplicate.
        self.assertIn('topic-fixture',release.required_ids(snapshot,{k:v for k,v in scope.items() if k!='includeTopics'}))
        topic_only={**scope,'lines':[],'extraIds':['topic-fixture']}
        self.assertEqual(release.required_ids(snapshot,topic_only),{'topic-fixture'})

    def test_public_topic_only_manifest_resolves_against_broad_plan(self):
        # Public topic bodies/boxes are an intentional subset of the site's historical+topic plan.
        self.raw['topics'][0]['boxes']=[{'scene':0,'name':'专题补充','en':'Topic Box',
                                       'text':'<p>专题补充正文，1501年。</p>'}]
        self.write_source()
        snapshot=release.current_source(self.source)
        host='approved.public.blob.vercel-storage.com'
        profile={k:p.config_for('+0Hz')[k] for k in ('voice','pitch','rate','volume')}
        broad_path=self.root/'broad-scope.json';narrow_path=self.root/'topic-scope.json'
        p.save_json(broad_path,{'schema':1,'policy':POLICY,'lines':['main'],'includeTopics':True,
                                'profile':profile,'blobHost':host})
        release.refresh_scope(self.source,broad_path);broad=p.read_json(broad_path)
        p.save_json(narrow_path,{**broad,'lines':[]})
        release.refresh_scope(self.source,narrow_path);narrow=p.read_json(narrow_path)
        self.assertEqual(narrow['blobHost'],broad['blobHost'])
        self.assertEqual(narrow['ids'],['topic-fixture','topic-fixture/0/box/0'])
        entries={e['id']:e for e in snapshot['entries']}
        assets={}
        for asset_id in narrow['ids']:
            record=render(entries[asset_id.split('/')[0]],asset_id)
            data=('offline-public-fixture:'+asset_id).encode();sha=p.digest(data)
            assets[asset_id]={'url':'https://'+host+'/audio/v1/'+sha+'.mp3','duration':1.0,'bytes':len(data),
                              'audioHash':sha,'textHash':record['textHash'],
                              'inputHash':p.input_hash(record,p.config_for('+0Hz'))}
        manifest_path=self.root/'public-topics.json'
        p.save_json(manifest_path,{'schema':2,'policy':POLICY,'profile':profile,'assets':assets,
                                  'tracks':tracks_for(snapshot,narrow['ids'])})
        source_before={f.name:f.read_bytes() for f in (self.source/'src').iterdir()}
        manifest_before=manifest_path.read_bytes();scope_before=broad_path.read_bytes()
        with patch.object(release,'urlopen',side_effect=AssertionError('Offline resolve requested public audio')):
            # This is the same normal, non-strict resolver called by assemble.py.
            resolved,report=release.resolve_manifest(self.source,manifest_path,broad_path)
            self.assertEqual(resolved['assets'],assets)
            self.assertEqual(set(resolved['tracks']),{'history-fixture/0','history-fixture/1','topic-fixture'})
            self.assertEqual(resolved['tracks'],tracks_for(snapshot,broad['ids']))
            history=resolved['tracks']['history-fixture/0']
            self.assertEqual(history['titleId'],'history-fixture/title')
            self.assertEqual([part['id'] for part in history['extras']],
                             ['history-fixture/0/moment/0','history-fixture/0/box/0'])
            self.assertEqual(history['people'][0]['id'],'history-fixture/0/person/0')
            self.assertEqual(resolved['tracks']['topic-fixture']['extras'][0]['id'],'topic-fixture/0/box/0')
            self.assertEqual(report['status'],'partial')
            self.assertEqual((report['assets'],report['required']),(len(narrow['ids']),len(broad['ids'])))
            self.assertEqual(report['pending'],[i for i in broad['ids'] if i not in assets])
            self.assertTrue(report['pending'])
            self.assertTrue(all(i.startswith('history-') for i in report['pending']))
            self.assertEqual((report['stale'],report['obsolete'],report['scopeWarning']),([],[],''))
            self.assertTrue(report['public']);self.assertEqual(report['networkRequests'],0)
            # Publication completeness is checked against the separately authorized narrow scope.
            published,strict_report=release.resolve_manifest(self.source,manifest_path,narrow_path,strict=True)
            self.assertEqual(published['assets'],assets)
            self.assertEqual(set(published['tracks']),{'topic-fixture'})
            self.assertEqual(strict_report['status'],'valid');self.assertEqual(strict_report['pending'],[])
            with self.assertRaisesRegex(ValueError,'Audio incomplete'):
                release.resolve_manifest(self.source,manifest_path,broad_path,strict=True)
            unbound_path=self.root/'unbound-broad-scope.json'
            p.save_json(unbound_path,{k:v for k,v in broad.items() if k!='blobHost'})
            for allow_local in (False,True):
                with self.subTest(allow_local=allow_local),self.assertRaisesRegex(ValueError,'approved blobHost'):
                    release.resolve_manifest(self.source,manifest_path,unbound_path,allow_local=allow_local)
        self.assertEqual(manifest_path.read_bytes(),manifest_before)
        self.assertEqual(broad_path.read_bytes(),scope_before)
        self.assertEqual(source_before,{f.name:f.read_bytes() for f in (self.source/'src').iterdir()})
        self.assertFalse(self.cache.exists())

    def test_optional_manifest_filtering_and_untrusted_track_plan(self):
        snapshot=self.prepared();scope_path=self.root/'scope.json';manifest_path=self.root/'manifest.json'
        host='approved.public.blob.vercel-storage.com'
        p.save_json(scope_path,{'schema':1,'lines':['main'],'blobHost':host,'profile':
            {k:p.config_for('+0Hz')[k] for k in ('voice','pitch','rate','volume')}})
        release.refresh_scope(self.source,scope_path);scope=p.read_json(scope_path)
        sha=p.digest(b'offline-public-fixture')
        entries={e['id']:e for e in snapshot['entries']}
        assets={}
        for asset_id in scope['ids']:
            record=render(entries[asset_id.split('/')[0]],asset_id)
            assets[asset_id]={'url':'https://'+host+'/audio/v1/'+sha+'.mp3','duration':1.0,'bytes':len(b'offline-public-fixture'),
                              'audioHash':sha,'textHash':record['textHash'],'inputHash':p.input_hash(record,p.config_for('+0Hz'))}
        manifest={'schema':2,'policy':3,'profile':scope['profile'],'assets':assets,
                  'tracks':{'history-fixture/0':{'bodyId':'topic-fixture','extras':[],
                            'people':[{'id':'fake','kind':'person','label':'<script>injected</script>'}]}}}
        p.save_json(manifest_path,manifest)
        source_before={f.name:f.read_bytes() for f in (self.source/'src').iterdir()}
        manifest_before=manifest_path.read_bytes()
        resolved,report=release.resolve_manifest(self.source,manifest_path,scope_path,strict=True)
        self.assertEqual(resolved['tracks'],tracks_for(snapshot,scope['ids']))
        self.assertEqual(manifest_path.read_bytes(),manifest_before)
        self.assertEqual(source_before,{f.name:f.read_bytes() for f in (self.source/'src').iterdir()})
        self.assertEqual(report['networkRequests'],0)
        self.assertFalse(self.cache.exists())
        # Public-host binding is mandatory even when local preview URLs are also permitted.
        p.save_json(scope_path,{k:v for k,v in scope.items() if k!='blobHost'})
        for allow_local in (False,True):
            with self.subTest(allow_local=allow_local),self.assertRaisesRegex(ValueError,'approved blobHost'):
                release.resolve_manifest(self.source,manifest_path,scope_path,allow_local=allow_local)
        p.save_json(scope_path,scope)
        obsolete=copy.deepcopy(manifest)
        obsolete['assets']['history-deleted/0']=copy.deepcopy(next(iter(assets.values())))
        p.save_json(manifest_path,obsolete)
        resolved,report=release.resolve_manifest(self.source,manifest_path,scope_path)
        self.assertEqual(report['obsolete'],['history-deleted/0'])
        self.assertNotIn('history-deleted/0',resolved['assets'])
        with self.assertRaisesRegex(ValueError,'obsolete'):
            release.resolve_manifest(self.source,manifest_path,scope_path,strict=True)
        obsolete['assets']['history-deleted/0']['url']='file:///not-a-public-asset.mp3'
        p.save_json(manifest_path,obsolete)
        with self.assertRaisesRegex(ValueError,'public Blob'):
            release.resolve_manifest(self.source,manifest_path,scope_path)
        p.save_json(manifest_path,manifest)
        # Explicit remote release checks still require HTTP Range, MIME and the exact byte count.
        from email.message import Message
        def response(status=206,size=len(b'offline-public-fixture'),mime='audio/mpeg',body=b'x'):
            stream=io.BytesIO(body);stream.status=status;stream.headers=Message()
            stream.headers['Content-Range']='bytes 0-0/'+str(size)
            stream.headers['Content-Type']=mime
            return stream
        with patch.object(release,'urlopen',side_effect=lambda *a,**k:response()) as remote:
            report=release.check_manifest(self.source,manifest_path,scope_path,remote=True)
            self.assertEqual(report['remoteChecked'],1)
            self.assertEqual(remote.call_args.args[0].get_header('Range'),'bytes=0-0')
        for bad in ({'status':200},{'size':1},{'mime':'text/html'},{'body':b''}):
            with patch.object(release,'urlopen',side_effect=lambda *a,**k:response(**bad)):
                with self.subTest(bad=bad),self.assertRaisesRegex(ValueError,'range/MIME/size'):
                    release.check_manifest(self.source,manifest_path,scope_path,remote=True)
        del manifest['assets']['history-fixture/0/person/0'];p.save_json(manifest_path,manifest)
        self.raw['history'][0]['boxes'][0]['text']+='<p>新增的1530年正文。</p>';self.write_source()
        resolved,report=release.resolve_manifest(self.source,manifest_path,scope_path)
        self.assertIn('history-fixture/0',resolved['assets'])
        self.assertIn('history-fixture/title',resolved['assets'])
        self.assertIn('history-fixture/0/moment/0',resolved['assets'])
        self.assertNotIn('history-fixture/0/box/0',resolved['assets'])
        self.assertNotIn('history-fixture/0/person/0',resolved['assets'])
        self.assertEqual(report['stale'],['history-fixture/0/box/0'])
        self.assertEqual(set(report['pending']),{'history-fixture/0/box/0','history-fixture/0/person/0'})
        self.assertEqual(resolved['tracks'],tracks_for(snapshot,scope['ids']))  # Missing pieces stay in the plan.
        with self.assertRaisesRegex(ValueError,'Audio incomplete'):
            release.resolve_manifest(self.source,manifest_path,scope_path,strict=True)
        with patch.object(release,'urlopen',side_effect=AssertionError('Remote request before completeness gate')):
            with self.assertRaisesRegex(ValueError,'Audio incomplete'):
                release.check_manifest(self.source,manifest_path,scope_path,remote=True)
        self.raw['history'][0]['moments'].append({'scene':1,'name':'新趣事','en':'New','text':'新增正文。'})
        self.write_source()
        resolved,report=release.resolve_manifest(self.source,manifest_path,scope_path)
        self.assertIn('history-fixture/1/moment/1',report['pending'])
        self.assertTrue(report['scopeWarning'])
        self.assertEqual(resolved['tracks']['history-fixture/1']['extras'][0]['id'],'history-fixture/1/moment/1')
        with self.assertRaisesRegex(ValueError,'Covered lines/topics changed'):
            release.resolve_manifest(self.source,manifest_path,scope_path,strict=True)
        # Renaming a line still degrades content-first; selected bodies retain their current parts.
        scope['lines']=['renamed'];p.save_json(scope_path,scope)
        resolved,report=release.resolve_manifest(self.source,manifest_path,scope_path)
        self.assertIn('history-fixture/1/moment/1',report['pending'])
        self.assertIn('history-fixture/0',resolved['assets'])
        # Schema/policy/profile errors are hard even for an empty or otherwise partial manifest.
        for field,value in (('schema',2),('schema',True),('policy',2),('policy',True),('includeTopics','false')):
            bad={**scope,field:value};p.save_json(scope_path,bad)
            with self.subTest(field=field,value=value),self.assertRaises(ValueError):
                release.resolve_manifest(self.source,manifest_path,scope_path)
        p.save_json(scope_path,scope)
        bad=copy.deepcopy(manifest);bad['assets']['history-fixture/0/person/../../escape']=next(iter(assets.values()))
        p.save_json(manifest_path,bad)
        with self.assertRaisesRegex(ValueError,'Unsafe asset ID'):
            release.resolve_manifest(self.source,manifest_path,scope_path)

    def test_blob_wrong_store_is_rejected_before_upload(self):
        import subprocess,os
        request={'expectedHost':'approved-store.public.blob.vercel-storage.com',
                 'pathname':'audio/v1/'+'a'*64+'.mp3','file':'does-not-exist'}
        env={**os.environ,'BLOB_READ_WRITE_TOKEN':'vercel_blob_rw_otherstore_fake'}
        child=subprocess.run(['node',str(p.HERE/'blob.cjs')],input=json.dumps(request),text=True,capture_output=True,env=env)
        self.assertNotEqual(child.returncode,0)
        self.assertIn('credential/store hostname mismatch',child.stderr)
        self.assertNotIn(env['BLOB_READ_WRITE_TOKEN'],child.stderr)
        # Cloudflare R2 public URLs and wrong-bucket/host rejection.
        r2_host='pub-'+'c'*32+'.r2.dev'
        self.assertEqual(release.public_url('https://'+r2_host+'/audio/v1/'+'a'*64+'.mp3','a'*64,r2_host),r2_host)
        with self.assertRaises(ValueError):
            release.public_url('https://'+r2_host+'/audio/v1/'+'a'*64+'.mp3','a'*64,'pub-'+'d'*32+'.r2.dev')
        bad_r2=subprocess.run(['node',str(p.HERE/'r2.cjs')],input=json.dumps({
            'expectedHost':'not-r2.example.com','bucket':'atlas-history-audio',
            'pathname':'audio/v1/'+'a'*64+'.mp3','file':'does-not-exist'
        }),text=True,capture_output=True)
        self.assertNotEqual(bad_r2.returncode,0)

    def test_lock_and_entity_boundary_checks(self):
        with p.lock(self.library):
            with self.assertRaisesRegex(ValueError,'Another audio'):
                with p.lock(self.library):pass
        p.check_boundaries('中文 A & B １２',[{'text':'中文 A &amp; B 12','offset':0,'duration':8_000_000}],1)
        with self.assertRaisesRegex(ValueError,'duration'):
            p.check_boundaries('abc',[{'text':'abc','offset':0,'duration':90_000_000}],1)


if __name__=='__main__':
    unittest.main(verbosity=2)
