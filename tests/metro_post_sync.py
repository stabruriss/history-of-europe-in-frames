#!/usr/bin/env python3
"""Run at the end of work/v35/sync_tests.sh. That chain rebuilds the older suites from their
pre-metro backup, so this re-applies what the metro layout changes in them. Safe to run repeatedly.
Usage: python3 tests/metro_post_sync.py [tests_dir]"""
import re
import sys
from pathlib import Path

TESTS = Path(sys.argv[1]).resolve() if len(sys.argv) > 1 else Path(__file__).resolve().parent
# These test the layout as shipped, so they do not bring the old sidebar back.
METRO_SUITES = {'verify-metro.js', 'verify-metro-keys.js', 'verify-reader-width.js', 'verify-no-leak.js',
                'verify-audio-pipeline.js', 'verify-audio-player.js'}
REQUIRE = "const puppeteer=require('puppeteer-core');"
SHIM = "require('./legacy_sidebar.cjs');"
CLOSE = "}finally{await Promise.race([browser.close()"
CATCH = "}catch(e){console.error(e);process.exitCode=1;}"


def swap(t, name, old, new):
    """Fail loudly if an anchor disappears, rather than leaving a suite half patched."""
    if new in t:
        return t
    assert old in t, (name, 'anchor missing', old[:80])
    return t.replace(old, new)


def drop_screenshots(t):
    """Nothing ever compared these pictures, and with the old sidebar back they did not show what readers see."""
    dangling = lambda s: len(re.findall(r"(?:\bif\([^\n;{}]*\)|\belse)[ \t]*$", s, re.M))
    before = dangling(t)
    out, i = [], 0
    for m in re.finditer(r"(?:if\(process\.env\.FULL_SHOTS==='1'\))?await [A-Za-z0-9_]+\.screenshot\(", t):
        # A condition that only guarded the picture goes with it, or it would capture the next statement.
        out.append(re.sub(r"if\([^()\n]*\)[ \t]*$", '', t[i:m.start()]))
        j, depth = m.end(), 1
        while depth:
            depth += {'(': 1, ')': -1}.get(t[j], 0)
            j += 1
        i = j + 1 if t[j] == ';' else j
    out.append(t[i:])
    t = ''.join(out)
    t = re.sub(r"const shots=path\.join\(__dirname,'shots[^']*'\);", '', t)
    t = re.sub(r"(?:require\('node:fs'\)|fs)\.mkdirSync\(shots,\{recursive:true\}\);", '', t)
    t = re.sub(r"(?:require\('node:fs'\)|fs)\.mkdirSync\((?:require\('node:path'\)|path)\.join\(__dirname,'shots[^']*'\),\{recursive:true\}\);", '', t)
    assert dangling(t) == before, 'a condition lost its statement'
    return t.replace("process.env.FULL_SHOTS==='1'", 'false')


# The arrow keys now change station and scene, so verify-metro-keys.js replaces the old keyboard suite.
(TESTS / 'verify-keyboard.js').unlink(missing_ok=True)

changed = 0
for path in sorted(TESTS.glob('verify-*.js')):
    if path.name in METRO_SUITES:
        continue
    before = text = path.read_text(encoding='utf-8')
    # The old sidebar is hidden in the new layout; these suites still test what it shows.
    text = swap(text, path.name, REQUIRE, REQUIRE + SHIM)
    text = drop_screenshots(text)
    # Without a catch, finally's process.exit(0) turns a failed assertion into a pass.
    if CLOSE in text and CATCH + 'finally{' not in text:
        text = text.replace(CLOSE, CATCH + CLOSE[1:])
    if path.name == 'verify-figures.js':
        # Every scene now keeps its own cards on the page; this counts the current scene's.
        text = swap(text, path.name, "p.$$eval('.person-card',es=>es.length),5)",
                    "p.$$eval('#peopleCards .person-card',es=>es.length),5)")
    if path.name == 'verify-history.js':
        text = swap(text, path.name, "document.querySelector('#side h1')", "document.querySelector('#masthead h1')")
    if path.name == 'verify-tree.js':
        text = text.replace("p.keyboard.press('ArrowDown')", "p.click('#next')").replace("p.keyboard.press('ArrowUp')", "p.click('#prev')")
        text = swap(text, path.name, "; ↑↓ then stay on that line (metro style) and stop at its ends.",
                    "; 上一条/下一条 then stay on that line and stop at its ends. (On the train, ← → do this: see verify-metro-keys.js.)")
    if text != before:
        path.write_text(text, encoding='utf-8')
        changed += 1
print(f'metro_post_sync: {changed} suites updated in {TESTS}')
