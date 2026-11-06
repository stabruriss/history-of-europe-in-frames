// However a test run ends, no Chrome, suite or temporary directory stays behind. The faults here are real: SIGKILL, SIGTERM, a suite that hangs.
// It runs a copy of run_tests.py over two small suites of its own, with its own locks, so it neither waits for nor holds up real runs.
const assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {spawn,spawnSync}=require('node:child_process');

const T=fs.mkdtempSync(path.join(fs.realpathSync(os.tmpdir()),'no-leak-'));
const CHROME=process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const resolved=require.resolve('puppeteer-core'),MODULES=resolved.slice(0,resolved.lastIndexOf('/node_modules/')+13);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const alive=pid=>{try{process.kill(pid,0);return true;}catch{return false;}};
const under=dir=>spawnSync('pgrep',['-f',dir],{encoding:'utf8'}).stdout.trim().split('\n').filter(Boolean).map(Number);
const until=async(check,ms,what)=>{const end=Date.now()+ms;while(Date.now()<end){if(check())return;await sleep(100);}assert.fail(what);};

const OPEN=`require('./chrome_guard.cjs');const puppeteer=require('puppeteer-core'),fs=require('node:fs');
const mark=process.env.MARK_DIR;const launch=()=>puppeteer.launch({executablePath:${JSON.stringify(CHROME)},headless:true});`;
const SUITES={
 // Stays open until something stops it, and says who is who once Chrome is up.
 'verify-hang.js':`${OPEN}
(async()=>{const b=await launch();const p=await b.newPage();await p.goto('about:blank');fs.writeFileSync(mark+'/pids',process.pid+' '+b.process().pid);setInterval(()=>{},1000);})();`,
 // Ends the way the real suites do: a short wait for close, then SIGKILL and process.exit.
 'verify-fine.js':`${OPEN}
(async()=>{fs.appendFileSync(mark+'/spans','start '+Date.now()+'\\n');const b=await launch();const p=await b.newPage();await p.goto('about:blank');await new Promise(r=>setTimeout(r,500));fs.appendFileSync(mark+'/spans','end '+Date.now()+'\\n');console.log('PASS: fine');
await Promise.race([b.close(),new Promise(r=>setTimeout(r,200))]);b.process()?.kill('SIGKILL');process.exit(0);})();`,
};
function tree(name){
 const dir=path.join(T,name),tests=path.join(dir,'tests');fs.mkdirSync(tests,{recursive:true});fs.writeFileSync(path.join(dir,'index.html'),'<!doctype html>');
 for(const f of ['run_tests.py','chrome_guard.cjs'])fs.copyFileSync(path.join(__dirname,f),path.join(tests,f));
 for(const [f,text] of Object.entries(SUITES))fs.writeFileSync(path.join(tests,f),text);
 return dir;
}
function place(name,slots=3){
 const dir=path.join(T,name),tmp=path.join(dir,'tmp'),marks=path.join(dir,'marks');fs.mkdirSync(tmp,{recursive:true});fs.mkdirSync(marks,{recursive:true});
 const env={...process.env,TMPDIR:tmp,MARK_DIR:marks,NODE_PATH:MODULES,ATLAS_TEST_LOCK_DIR:path.join(dir,'locks'),ATLAS_TEST_SLOTS:String(slots)};
 delete env.ATLAS_TEST_PARENT;  // this suite's own runner is not theirs
 return {dir,tmp,marks,env};
}
const runner=(root,where,...args)=>spawn('python3',[path.join(root,'tests/run_tests.py'),...args],{env:where.env,stdio:['ignore','pipe','pipe']});
const collect=child=>{const c={out:''};child.stdout.on('data',d=>c.out+=d);child.stderr.on('data',d=>c.out+=d);c.done=new Promise(r=>child.on('exit',(code,sig)=>r({code,sig})));return c;};
const pidsOf=async where=>{const file=path.join(where.marks,'pids');await until(()=>fs.existsSync(file),90000,'the suite never got its Chrome up');return fs.readFileSync(file,'utf8').split(' ').map(Number);};
const runsLeft=where=>{const d=path.join(where.tmp,'atlas-test-runs');return fs.existsSync(d)?fs.readdirSync(d).length:0;};

(async()=>{
 try{
  const root=tree('tree');
  // A suite that ends normally leaves no process and no profile, even run directly.
  let w=place('direct-fine');
  let r=spawnSync('node',[path.join(root,'tests/verify-fine.js')],{env:w.env,encoding:'utf8'});assert.equal(r.status,0,r.stderr);
  await until(()=>!under(w.tmp).length,15000,'processes after a normal finish');assert.deepEqual(fs.readdirSync(w.tmp),[],'nothing left in the temporary directory');
  // A suite killed outright takes its Chrome with it.
  w=place('direct-kill');
  let child=spawn('node',[path.join(root,'tests/verify-hang.js')],{env:w.env,stdio:'ignore'});
  let [suite,chrome]=await pidsOf(w);assert.ok(alive(chrome));child.kill('SIGKILL');
  await until(()=>!alive(chrome)&&!under(w.tmp).length,15000,'Chrome outlived a killed suite');
  // Stopping the runner stops everything, and it tidies up.
  w=place('runner-term');
  let run=runner(root,w,'verify-hang.js'),c=collect(run);[suite,chrome]=await pidsOf(w);
  run.kill('SIGTERM');let end=await c.done;assert.equal(end.code,128+15,c.out);
  await until(()=>!alive(suite)&&!alive(chrome)&&!under(w.tmp).length,15000,'something outlived a stopped runner');assert.equal(runsLeft(w),0,'run directory removed');
  // A runner killed outright cannot do that: its suite notices, and the next run tidies up. Its Chrome slot comes free at once.
  w=place('runner-kill',1);
  run=runner(root,w,'verify-hang.js');[suite,chrome]=await pidsOf(w);
  run.kill('SIGKILL');await until(()=>!alive(suite)&&!alive(chrome)&&!under(w.tmp).length,15000,'something outlived a killed runner');assert.equal(runsLeft(w),1,'the killed run left its directory');
  run=runner(root,w,'verify-fine.js');c=collect(run);end=await c.done;assert.equal(end.code,0,c.out);assert.equal(runsLeft(w),0,'the next run removed it');
  // A suite that hangs fails after its time limit, and is stopped.
  w=place('timeout');
  run=runner(root,w,'--timeout','12','verify-hang.js');c=collect(run);end=await c.done;assert.equal(end.code,1,c.out);
  assert.match(c.out,/FAIL\(124\)/);assert.match(c.out,/Stopped after 12s/);
  [suite,chrome]=fs.existsSync(path.join(w.marks,'pids'))?fs.readFileSync(path.join(w.marks,'pids'),'utf8').split(' ').map(Number):[0,0];
  await until(()=>(!suite||!alive(suite))&&(!chrome||!alive(chrome))&&!under(w.tmp).length,15000,'something outlived a timed-out suite');assert.equal(runsLeft(w),0,'run directory removed');
  // A second run in the same worktree refuses at once instead of competing.
  w=place('second-run');
  run=runner(root,w,'verify-hang.js');c=collect(run);await pidsOf(w);
  r=spawnSync('python3',[path.join(root,'tests/run_tests.py'),'verify-fine.js'],{env:w.env,encoding:'utf8',timeout:20000});assert.equal(r.status,3,r.stderr);assert.match(r.stderr,/already running in this worktree/);
  run.kill('SIGTERM');await c.done;
  // With one slot, two worktrees take turns.
  w=place('slots',1);const other=tree('tree2');
  const a=collect(runner(root,w,'verify-fine.js')),b=collect(runner(other,w,'verify-fine.js'));
  const [ea,eb]=await Promise.all([a.done,b.done]);assert.equal(ea.code,0,a.out);assert.equal(eb.code,0,b.out);
  const spans=fs.readFileSync(path.join(w.marks,'spans'),'utf8').trim().split('\n').map(l=>l.split(' '));
  assert.deepEqual(spans.map(s=>s[0]),['start','end','start','end'],'the second began only after the first had ended');
  console.log('PASS: no leaks — normal finish, killed suite, stopped runner, killed runner, time limit, one run per worktree, Chrome slots across worktrees');
 }catch(e){console.error(e);process.exitCode=1;}
 finally{
  for(const pid of under(T))try{process.kill(pid,'SIGKILL');}catch{}
  await sleep(300);fs.rmSync(T,{recursive:true,force:true});process.exit(process.exitCode||0);
 }
})();
