#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Test runner for tests/verify-*.js.
After editing the text:
  python3 tests/run_tests.py --changed [index.html]
    Runs check_changed.js, which checks and photographs only the scenes that changed and scans the whole
    book's references, then only the suites that name a changed section. A change to the lines or to the
    page's own code brings in more; see pick_suites.
Before publishing:
  python3 tests/run_tests.py [index.html] [--jobs N] [--no-cache]
    The full set. A suite that already passed with exactly these inputs (page, suite, helpers) is not run
    again, so rerunning after a fix runs only what the fix touched.
Some suites only:
  python3 tests/run_tests.py verify-foo.js verify-bar.js
"""
import argparse
import concurrent.futures
import hashlib
import json
import os
import re
import subprocess
import sys
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
    for path in [tests_dir / 'legacy_sidebar.cjs', *suite_specs(tests_dir, text)]:
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


def main() -> int:
    parser = argparse.ArgumentParser(description='Run verify-*.js test suites.')
    parser.add_argument('args', nargs='*', help='Optional index.html path and/or specific verify-*.js names')
    parser.add_argument('-j', '--jobs', type=int, default=int(os.environ.get('TEST_JOBS', DEFAULT_JOBS)),
                        help=f'Chrome test workers at once (default: {DEFAULT_JOBS})')
    parser.add_argument('--changed', action='store_true',
                        help='After editing the text: check what changed, then only the suites that name it')
    parser.add_argument('--no-cache', action='store_true', help='Run every suite, even if it passed with these inputs')
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

    env = os.environ.copy()
    env.pop('FULL_SHOTS', None)
    if not (pf / 'node_modules').is_dir() and 'NODE_PATH' not in env:
        candidates = list(pf.parents[1].glob('*/project-files/node_modules'))
        proj_root = os.environ.get('KOTA_PROJECT_ROOT')
        if proj_root:
            candidates.extend(Path(proj_root).glob('.agent-workspaces/*/project-files/node_modules'))
        for nm in candidates:
            if nm.is_dir():
                env['NODE_PATH'] = str(nm)
                break

    t0 = time.monotonic()
    all_suites = sorted(p.name for p in tests_dir.glob('verify-*.js'))
    pending = None
    if ns.changed:
        check = subprocess.run(['node', str(tests_dir / 'check_changed.js'), str(target_html), '--pending'],
                               cwd=str(pf), env=env)
        if check.returncode:
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
        st = time.monotonic()
        proc = subprocess.run(
            ['node', str(tests_dir / name), str(target_html)],
            cwd=str(pf),
            env=env,
            capture_output=True,
            text=True,
        )
        dt = time.monotonic() - st
        out = (proc.stdout + proc.stderr).strip()
        last = out.splitlines()[-1] if out else ''
        # Every suite prints PASS as its last act; a clean exit without it did not finish.
        code = proc.returncode or (0 if 'PASS' in proc.stdout else 99)
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

    cache_file.write_text(json.dumps(cache, ensure_ascii=False, indent=1), encoding='utf-8')
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
