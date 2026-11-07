#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test runner for tests/verify-*.js.
After editing the text:
  python3 tests/run_tests.py --changed [index.html]
    Runs check_changed.js, which checks only the scenes that changed and scans the whole
    book's references, then only the suites that name a changed section. A change to the lines or to the
    page's own code brings in more; see pick_suites.
Before publishing:
  python3 tests/run_tests.py [index.html] [--jobs N] [--no-cache]
    The full set. A suite that already passed with exactly these inputs (page, suite, helpers) is not run
    again, so rerunning after a fix runs only what the fix touched.
Some suites only:
  python3 tests/run_tests.py verify-foo.js verify-bar.js

However a run ends, nothing stays behind (verify-no-leak.js tests this by killing things):
- Each suite has its own process group and a time limit. A hung suite fails; it is not run again.
- Stopping the runner stops its suites. If it is killed outright, chrome_guard.cjs ends them within a second or
  so, and Chrome with them; the next run removes what the killed one left.
- Everything temporary lives in one directory per run, removed at the end.
- One run per worktree: a second one exits at once. Across all worktrees at most CHROME_SLOTS Chromes run at
  once, and the rest queue. So there is no need to poll for another run to finish: just start yours.
"""
import argparse
import concurrent.futures
import fcntl
import hashlib
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import tempfile
import time
from pathlib import Path

SLOWEST_FIRST = [
    'verify-metro-keys.js',
    'verify-history.js',
    'verify-metro.js',
    'verify-tree.js',
    'verify-v5.js',
    'verify-moments.js',
    'verify-empire.js',
    'verify-figures.js',
    'verify-v43.js',
    'verify-faith.js',
    'verify-reader-width.js',
    'verify-v45.js',
    'verify-v39.js',
    'verify-rome.js',
    'verify-v42.js',
    'verify-v38.js',
    'verify-v40.js',
    'verify-ostrogoths.js',
    'verify-v37.js',
    'verify-v35.js',
    'verify-lines.js',
    'verify-west-end.js',
    'verify-carolingian.js',
    'verify-gregory.js',
    'verify-v34.js',
]
# These walk the whole book, and check_changed.js does their per-scene checks on the scenes that changed.
# They run in the full set, even if they mention a changed section by name.
WHOLE_BOOK = {'verify-history.js', 'verify-figures.js', 'verify-moments.js', 'verify-metro.js',
              'verify-metro-keys.js', 'verify-reader-width.js', 'verify-v5.js'}
# On this shared 8-core, 16 GB machine, 3 at once finished about as fast as 8 (109-159s against 124s for the
# same suites) with less than half the total Chrome time, and 1 took 349s.
DEFAULT_JOBS = 3
CHROME_SLOTS = int(os.environ.get('ATLAS_TEST_SLOTS', DEFAULT_JOBS))
# Fixed, not under TMPDIR, so that every agent's run on this machine shares the same slots whatever its environment.
LOCK_DIR = Path(os.environ.get('ATLAS_TEST_LOCK_DIR') or f'/tmp/atlas-tests-{os.getuid()}')
# The slowest suite has taken about 5 minutes on a badly overloaded machine. The time starts once it has a slot.
SUITE_TIMEOUT = 600

LIVE = set()


def find_project_files() -> Path:
    here = Path(__file__).resolve().parent
    if here.name == 'tests' and (here.parent / 'index.html').exists():
        return here.parent
    for base in (here, here.parent, here.parents[1] if len(here.parents) > 1 else here):
        if (base / 'project-files' / 'index.html').exists():
            return base / 'project-files'
        if (base / 'index.html').exists() and (base / 'tests').is_dir():
            return base
    raise RuntimeError(f'Cannot locate project-files root from {here}')


def suite_specs(tests_dir: Path, text: str) -> list:
    return [tests_dir / name for name in sorted(set(re.findall(r'v\d+-spec\.json', text))) if (tests_dir / name).exists()]


def inputs_key(tests_dir: Path, page_hash: str, name: str) -> str:
    """Everything a suite's result depends on: the page, the suite, the helpers it loads, the spec it reads."""
    text = (tests_dir / name).read_text(encoding='utf-8')
    h = hashlib.sha256(page_hash.encode())
    h.update(text.encode())
    paths = [tests_dir / 'legacy_sidebar.cjs', tests_dir / 'chrome_guard.cjs', *suite_specs(tests_dir, text)]
    if 'run_tests.py' in text:
        paths.append(tests_dir / 'run_tests.py')
    for path in paths:
        if path.exists():
            h.update(path.read_bytes())
    return h.hexdigest()


def names_a_section(tests_dir: Path, name: str, sections: set) -> bool:
    text = (tests_dir / name).read_text(encoding='utf-8')
    for spec in suite_specs(tests_dir, text):
        text += spec.read_text(encoding='utf-8')
    named = set(re.findall(r'history-[a-z0-9-]+', text))
    # A name ending in a hyphen is a prefix the suite builds ids from.
    return bool(named & sections) or any(n.endswith('-') and s.startswith(n) for n in named for s in sections)


def pick_suites(tests_dir: Path, info: dict, all_suites: list) -> list:
    if info['engineChanged']:
        print("The page's own code changed since the last check: running the full set.", flush=True)
        return all_suites
    sections = set(info['sections'])
    picked = {s for s in all_suites if s not in WHOLE_BOOK and names_a_section(tests_dir, s, sections)}
    if info['linesChanged']:
        # The tree and the whole-map layout are what a new or moved station can break.
        picked |= {'verify-tree.js', 'verify-metro.js'} & set(all_suites)
    return sorted(picked)


def take_slot(label: str, where: Path):
    """One Chrome per slot, across every worktree. The lock is the kernel's, so it goes when its holder does, however it dies."""
    LOCK_DIR.mkdir(parents=True, exist_ok=True)
    start, told = time.monotonic(), False
    while True:
        for i in range(CHROME_SLOTS):
            slot = open(LOCK_DIR / f'slot-{i}', 'a+')
            try:
                fcntl.flock(slot, fcntl.LOCK_EX | fcntl.LOCK_NB)
            except OSError:
                slot.close()
                continue
            slot.truncate(0)
            slot.write(f'{label} in {where.parent.name}/{where.name}')
            slot.flush()
            return slot
        if not told and time.monotonic() - start > 15:
            told = True
            holders = '; '.join((LOCK_DIR / f'slot-{i}').read_text().strip() for i in range(CHROME_SLOTS))
            print(f'[WAIT] {label}: all {CHROME_SLOTS} Chrome slots are in use ({holders})', flush=True)
        time.sleep(0.5)


def stop_group(proc) -> None:
    for sig in (signal.SIGTERM, signal.SIGKILL):
        try:
            os.killpg(proc.pid, sig)
        except (ProcessLookupError, PermissionError):
            return
        try:
            proc.wait(timeout=2)
            return
        except subprocess.TimeoutExpired:
            pass


def run_job(label: str, cmd: list, env: dict, cwd: Path, limit: int, capture: bool = True):
    """Returns (exit code, seconds, stdout, stderr, timed out). The time limit starts once the job has a slot."""
    slot = take_slot(label, cwd)
    try:
        start = time.monotonic()
        pipes = {'stdout': subprocess.PIPE, 'stderr': subprocess.PIPE, 'text': True} if capture else {}
        proc = subprocess.Popen(cmd, cwd=str(cwd), env=env, start_new_session=True, **pipes)
        LIVE.add(proc)
        timed_out = False
        try:
            out, err = proc.communicate(timeout=limit)
        except subprocess.TimeoutExpired:
            timed_out = True
            stop_group(proc)
            try:
                out, err = proc.communicate(timeout=5)
            except (subprocess.TimeoutExpired, ValueError):
                out, err = '', ''
        finally:
            LIVE.discard(proc)
        return proc.returncode, time.monotonic() - start, out or '', err or '', timed_out
    finally:
        slot.close()


def processes_under(run_dir: Path) -> list:
    found = subprocess.run(['pgrep', '-f', str(run_dir)], capture_output=True, text=True).stdout.split()
    return [int(pid) for pid in found if int(pid) != os.getpid()]


def clean_up(run_dir: Path, report: bool = True) -> None:
    for proc in list(LIVE):
        stop_group(proc)
    # A Chrome's helpers take a moment to follow it.
    end = time.monotonic() + 3
    strays = processes_under(run_dir)
    while strays and time.monotonic() < end:
        time.sleep(0.1)
        strays = processes_under(run_dir)
    for pid in strays:
        try:
            os.kill(pid, signal.SIGKILL)
        except (ProcessLookupError, PermissionError):
            pass
    if strays and report:
        print(f'[LEAK] {len(strays)} processes outlived their suite and were stopped. That should not happen: see chrome_guard.cjs.',
              file=sys.stderr, flush=True)
    shutil.rmtree(run_dir, ignore_errors=True)


def sweep_dead_runs(runs: Path) -> None:
    """A run killed with SIGKILL cannot tidy up after itself, so the next one does."""
    for old in runs.glob('*'):
        try:
            os.kill(int(old.name.split('-')[0]), 0)
        except ProcessLookupError:
            shutil.rmtree(old, ignore_errors=True)
        except (ValueError, PermissionError):
            pass


def save_json(path: Path, data: dict) -> None:
    temp = path.with_name(path.name + '.tmp')
    temp.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding='utf-8')
    temp.replace(path)


def main() -> int:
    parser = argparse.ArgumentParser(description='Run verify-*.js test suites.')
    parser.add_argument('args', nargs='*', help='Optional index.html path and/or specific verify-*.js names')
    parser.add_argument('-j', '--jobs', type=int, default=int(os.environ.get('TEST_JOBS', DEFAULT_JOBS)),
                        help=f'Suites at once from this run (default: {DEFAULT_JOBS})')
    parser.add_argument('--changed', action='store_true',
                        help='After editing the text: check what changed, then only the suites that name it')
    parser.add_argument('--no-cache', action='store_true', help='Run every suite, even if it passed with these inputs')
    parser.add_argument('--timeout', type=int, default=SUITE_TIMEOUT, help=f'Seconds each suite may take (default: {SUITE_TIMEOUT})')
    ns = parser.parse_intermixed_args()

    pf = find_project_files()
    tests_dir = pf / 'tests'
    target_html = pf / 'index.html'
    selected = []
    for a in ns.args:
        if a.endswith('.html'):
            target_html = Path(a).resolve()
        elif a.endswith('.js'):
            selected.append(Path(a).name)

    instance = open(tests_dir / '.run.lock', 'a+')
    try:
        fcntl.flock(instance, fcntl.LOCK_EX | fcntl.LOCK_NB)
    except OSError:
        instance.seek(0)
        print(f'Tests are already running in this worktree ({instance.read().strip()}). Wait for that run: '
              'another one here would only compete with it.', file=sys.stderr)
        return 3
    instance.truncate(0)
    instance.write(f'pid {os.getpid()}, since {time.strftime("%H:%M:%S")}')
    instance.flush()

    runs = Path(tempfile.gettempdir()) / 'atlas-test-runs'
    sweep_dead_runs(runs)
    run_dir = runs / f'{os.getpid()}-{int(time.time())}'
    run_dir.mkdir(parents=True)

    def on_signal(sig, _frame):
        for s in (signal.SIGINT, signal.SIGTERM, signal.SIGHUP):
            signal.signal(s, signal.SIG_IGN)
        clean_up(run_dir, report=False)
        os._exit(128 + sig)

    for s in (signal.SIGINT, signal.SIGTERM, signal.SIGHUP):
        signal.signal(s, on_signal)

    env = os.environ.copy()
    env.pop('FULL_SHOTS', None)
    env['TMPDIR'] = str(run_dir)
    env['ATLAS_TEST_PARENT'] = str(os.getpid())
    if not (pf / 'node_modules').is_dir() and 'NODE_PATH' not in env:
        candidates = list(pf.parents[1].glob('*/project-files/node_modules'))
        proj_root = os.environ.get('KOTA_PROJECT_ROOT')
        if proj_root:
            candidates.extend(Path(proj_root).glob('.agent-workspaces/*/project-files/node_modules'))
        for nm in candidates:
            if nm.is_dir():
                env['NODE_PATH'] = str(nm)
                break
    try:
        return run_suites(ns, pf, tests_dir, target_html, selected, env)
    finally:
        clean_up(run_dir)


def run_suites(ns, pf: Path, tests_dir: Path, target_html: Path, selected: list, env: dict) -> int:
    t0 = time.monotonic()
    all_suites = sorted(p.name for p in tests_dir.glob('verify-*.js'))
    pending = None
    if ns.changed:
        code, _, _, _, timed_out = run_job('check_changed.js', ['node', str(tests_dir / 'check_changed.js'), str(target_html), '--pending'],
                                           env, pf, ns.timeout, capture=False)
        if timed_out:
            print(f'check_changed.js was stopped after {ns.timeout}s.', file=sys.stderr)
        if code or timed_out:
            return 1
        out = tests_dir / 'shots-changed'
        info = json.loads((out / 'changed.json').read_text(encoding='utf-8'))
        pending = out / 'baseline.next.json'
        suites = pick_suites(tests_dir, info, all_suites)
        print(f"Suites that apply: {', '.join(suites) if suites else 'none'}", flush=True)
    elif selected:
        suites = [s for s in all_suites if s in selected]
    else:
        suites = all_suites
    full_set = not ns.changed and not selected
    order = {name: i for i, name in enumerate(SLOWEST_FIRST)}
    suites = sorted(suites, key=lambda s: (order.get(s, 999), s))

    cache_file = tests_dir / '.test_cache.json'
    try:
        cache = json.loads(cache_file.read_text(encoding='utf-8'))
    except (OSError, ValueError):
        cache = {}
    page_hash = hashlib.sha256(target_html.read_bytes()).hexdigest()
    keys = {s: inputs_key(tests_dir, page_hash, s) for s in suites}
    # Naming a suite asks for it to run, so only the full set and --changed reuse results.
    reuse = not selected and not ns.no_cache
    results = {}
    if reuse:
        for s in suites:
            hit = cache.get(s)
            if hit and hit.get('key') == keys[s]:
                results[s] = (0, hit['dt'], hit['last'], '')
                print(f"[REUSED] {s:<24} {hit['dt']:5.2f}s  {hit['last'][:90]}", flush=True)
    reused = len(results)

    def run_one(name: str):
        rc, dt, stdout, stderr, timed_out = run_job(name, ['node', str(tests_dir / name), str(target_html)], env, pf, ns.timeout)
        out = (stdout + stderr).strip()
        if timed_out:
            out = (out + f'\nStopped after {ns.timeout}s. Find out why it hung before running it again.').strip()
            return name, 124, dt, out.splitlines()[-1], out
        last = out.splitlines()[-1] if out else ''
        # Every suite prints PASS as its last act; a clean exit without it did not finish.
        code = rc or (0 if 'PASS' in stdout else 99)
        return name, code, dt, last, out or 'Exited cleanly without printing PASS.'

    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, ns.jobs)) as pool:
        futs = [pool.submit(run_one, s) for s in suites if s not in results]
        for fut in concurrent.futures.as_completed(futs):
            name, rc, dt, last, out = fut.result()
            results[name] = (rc, round(dt, 2), last, out)
            status = 'PASS' if rc == 0 else f'FAIL({rc})'
            print(f'[{status}] {name:<24} {dt:5.2f}s  {last[:90]}', flush=True)
            if rc == 0:
                cache[name] = {'key': keys[name], 'dt': round(dt, 2), 'last': last}
            else:
                cache.pop(name, None)
            # After each suite, so that an interrupted run keeps what it has done.
            save_json(cache_file, cache)

    wall = time.monotonic() - t0
    failed = [k for k, r in results.items() if r[0] != 0]

    # BUILD records read this, so it only ever describes a full set.
    v35_dir = pf.parent / 'work' / 'v35'
    if full_set and v35_dir.is_dir():
        summary = {k: [v[0], v[1], v[2]] for k, v in sorted(results.items())}
        (v35_dir / 'tests_pass.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f'\nSummary: {len(suites) - len(failed)}/{len(suites)} passed in {wall:.2f}s wall-clock '
          f'({len(suites) - reused} run across {ns.jobs} workers, {reused} reused)')

    if failed:
        for k in failed:
            print(f'\n=== FAILED: {k} ===\n{results[k][3]}', file=sys.stderr)
        return 1
    if pending and pending.exists():
        pending.replace(tests_dir / '.check_baseline.json')
    if ns.changed:
        print('The full set still has to pass before publishing: python3 tests/run_tests.py')
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
