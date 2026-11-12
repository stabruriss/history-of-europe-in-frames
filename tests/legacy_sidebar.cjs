// The metro layout hides the old sidebar tree, but atlas_ui.js still builds it from the same rows, and most suites check
// sections, lines and scenes through it. This shows it again inside those suites only, so their content checks keep working.
// What readers actually see is tested by verify-metro.js, which does not load this file.
require('./chrome_guard.cjs');
const puppeteer = require('puppeteer-core');
// The reader toggle is shown here only. It sits in the reader's top-right corner, where the reading bar's option chips
// (positioned, later in the page) can reach on a 390px phone, so it is raised above them to stay clickable.
const showSidebar = () => {
  const css = `
    body.history-mode #side{display:flex!important}
    body.history-mode #mapwrap{grid-column:2!important}
    #networkMode,#ridePanel{display:none!important}
    body.history-mode #sceneRail:not([hidden]){display:flex!important}
    .scene-passage.off-station{display:block!important}
    #readerToggle{display:block!important;z-index:3}`;
  const add = () => {
    if (!document.documentElement) return false;
    const style = document.createElement('style');
    style.textContent = css;
    document.documentElement.appendChild(style);
    return true;
  };
  if (!add()) new MutationObserver((_, watcher) => { if (add()) watcher.disconnect(); }).observe(document, { childList: true });
};
const launch = puppeteer.launch.bind(puppeteer);
puppeteer.launch = async options => {
  const browser = await launch(options);
  const newPage = browser.newPage.bind(browser);
  browser.newPage = async () => {
    const page = await newPage();
    await page.evaluateOnNewDocument(showSidebar);
    return page;
  };
  return browser;
};
