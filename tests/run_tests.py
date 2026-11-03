#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Parallel test runner for all tests/verify-*.js suites.
By default runs with FULL_SHOTS=0 (fast assertion mode, skipping redundant PNG re-encoding).
Pass --full-shots or set FULL_SHOTS=1 to regenerate all legacy suite screenshots.
Usage:
  python3 tests/run_tests.py [index.html] [--jobs 8] [--full-shots] [verify-foo.js ...]
"""
import argparse
import concurrent.futures
import json
import os
import subprocess
import sys
import time
from pathlib import Path

SLOWEST_FIRST = [
    'verify-history.js',
    'verify-empire.js',
    'verify-faith.js',
    'verify-figures.js',
    'verify-keyboard.js',
    'verify-tree.js',
    'verify-v5.js',
    'verify-v45.js',
    'verify-v43.js',
    'verify-v40.js',
    'verify-v39.js',
    'verify-v42.js',
    'verify-v38.js',
    'verify-v37.js',
    'verify-v35.js',
    'verify-v34.js',
    'verify-ostrogoths.js',
    'verify-carolingian.js',
    'verify-west-end.js',
    'verify-gregory.js',
    'verify-rome.js',
    'verify-lines.js',
    'verify-moments.js',
]


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


def main() -> int:
    parser = argparse.ArgumentParser(description='Run verify-*.js test suites in parallel.')
    parser.add_argument('args', nargs='*', help='Optional index.html path and/or specific verify-*.js names')
    parser.add_argument('-j', '--jobs', type=int, default=int(os.environ.get('TEST_JOBS', '8')),
                        help='Number of parallel Chrome test workers (default: 8)')
    parser.add_argument('--full-shots', action='store_true',
                        help='Enable FULL_SHOTS=1 to write all legacy PNG screenshots')
    ns = parser.parse_args()

    pf = find_project_files()
    tests_dir = pf / 'tests'
    target_html = pf / 'index.html'
    selected = []
    for a in ns.args:
        if a.endswith('.html'):
            target_html = Path(a).resolve()
        elif a.endswith('.js'):
            selected.append(Path(a).name)

    all_suites = sorted(p.name for p in tests_dir.glob('verify-*.js'))
    if selected:
        suites = [s for s in all_suites if s in selected]
    else:
        order = {name: i for i, name in enumerate(SLOWEST_FIRST)}
        suites = sorted(all_suites, key=lambda s: (order.get(s, 999), s))

    env = os.environ.copy()
    if ns.full_shots:
        env['FULL_SHOTS'] = '1'
    else:
        env.setdefault('FULL_SHOTS', '0')

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
    results = {}

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
        return name, proc.returncode, dt, last, out

    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, ns.jobs)) as pool:
        futs = [pool.submit(run_one, s) for s in suites]
        for fut in concurrent.futures.as_completed(futs):
            name, rc, dt, last, out = fut.result()
            results[name] = (rc, round(dt, 2), last, out)
            status = 'PASS' if rc == 0 else f'FAIL({rc})'
            print(f'[{status}] {name:<24} {dt:5.2f}s  {last[:90]}', flush=True)

    wall = time.monotonic() - t0
    cum = sum(r[1] for r in results.values())
    failed = [k for k, r in results.items() if r[0] != 0]

    # Write tests_pass.json if work/v35 exists
    v35_dir = pf.parent / 'work' / 'v35'
    if v35_dir.is_dir():
        summary = {k: [v[0], v[1], v[2]] for k, v in sorted(results.items())}
        (v35_dir / 'tests_pass.json').write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding='utf-8')

    print(f'\nSummary: {len(suites) - len(failed)}/{len(suites)} passed in {wall:.2f}s wall-clock '
          f'(cumulative {cum:.2f}s across {ns.jobs} workers, FULL_SHOTS={env["FULL_SHOTS"]})')

    if failed:
        for k in failed:
            print(f'\n=== FAILED: {k} ===\n{results[k][3]}', file=sys.stderr)
        return 1
    return 0


if __name__ == '__main__':
    raise SystemExit(main())
