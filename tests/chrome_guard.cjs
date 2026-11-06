// Every test Chrome starts through here, so that none can outlive what started it, however that ends.
// A `finally` is not enough: it does not run when the process is killed with SIGKILL, as an outer tool's timeout does.
// Require this before the first launch. verify-no-leak.js tests it by killing things.
const fs = require('node:fs'), os = require('node:os'), path = require('node:path');
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
  process.on('exit', () => {
    for (const { browser, dir } of started) {
      try { browser?.process()?.kill('SIGKILL'); } catch {}
      if (dir) try { fs.rmSync(dir, { recursive: true, force: true, maxRetries: 2 }); } catch {}
    }
  });
  // Under run_tests.py: if the runner is gone, nobody will read this result, and the next run should not have to compete with it.
  const parent = Number(process.env.ATLAS_TEST_PARENT);
  if (parent) setInterval(() => { if (process.ppid !== parent) process.exit(1); }, 1000).unref();
}
