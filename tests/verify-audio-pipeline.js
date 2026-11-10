'use strict';
// Offline fixture tests only; no Chrome, TTS, upload, or prepared book materials.
const {spawnSync}=require('node:child_process');
const path=require('node:path');
const result=spawnSync(process.env.AUDIO_PYTHON||'python3',[path.join(__dirname,'audio_pipeline_test.py')],{stdio:'inherit'});
if(result.error)throw result.error;
process.exitCode=result.status===0?0:1;
if(result.status===0)console.log('PASS: offline audio pipeline fixtures; extraction, batching, integrity, dry-run gate, cache and failed-stream acceptance');
