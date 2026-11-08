// Every test Chrome starts through here, so that none can outlive what started it, however that ends.
// A `finally` is not enough: it does not run when the process is killed with SIGKILL, as an outer tool's timeout does.
// Require this before the first launch. verify-no-leak.js tests it by killing things.
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), { spawnSync } = require('node:child_process');
const puppeteer = require('puppeteer-core');

if (!puppeteer.atlasGuarded) {
  puppeteer.atlasGuarded = true;
  const launch = puppeteer.launch.bind(puppeteer), started = [];
  puppeteer.launch = async options => {
    const entry = { browser: null, dir: options?.userDataDir ? null : fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-chrome-')) };
    started.push(entry);
    entry.browser = await launch({
      // Slow to start on a machine short of memory, but a launch that never finishes should fail, not hang.
      timeout: 60000,
      ...options,
      // Over a pipe, Chrome exits as soon as this process is gone. Over puppeteer's default WebSocket it runs on for ever.
      pipe: true,
      userDataDir: options?.userDataDir || entry.dir,
      // The crash reporter holds Chrome's stderr open, which has made browser.close() hang for minutes on macOS.
      args: [...(options?.args || []), '--disable-breakpad', '--disable-crash-reporter'],
    });
    return entry.browser;
  };
  // The suites end with process.exit() a moment after closing Chrome, which leaves puppeteer no time to remove a profile of its own.
  // Chrome's helper processes can go on writing to the profile for a moment after the main process dies, most of all on a slow
  // machine (GitHub's runners), so the profile is removed again until it stays gone and nothing uses it. All of it is synchronous,
  // as an exit handler must be, and bounded.
  const pause = ms => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
  const users = dir => {
    try { return spawnSync('pgrep', ['-f', dir], { encoding: 'utf8' }).stdout.trim().split('\n').filter(Boolean).map(Number); } catch { return []; }
  };
  process.on('exit', () => {
    for (const { browser, dir } of started) {
      try { browser?.process()?.kill('SIGKILL'); } catch {}
      if (!dir) continue;
      const end = Date.now() + 5000;
      for (;;) {
        for (const pid of users(dir)) try { process.kill(pid, 'SIGKILL'); } catch {}
        try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 2 }); } catch {}
        if ((!fs.existsSync(dir) && !users(dir).length) || Date.now() > end) break;
        pause(100);
      }
    }
  });
  // Under run_tests.py: if the runner is gone, nobody will read this result, and the next run should not have to compete with it.
  const parent = Number(process.env.ATLAS_TEST_PARENT);
  if (parent) setInterval(() => { if (process.ppid !== parent) process.exit(1); }, 1000).unref();
}
