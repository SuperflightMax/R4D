'use strict';
// Independent acceptance observations. No gameplay state is set through JS.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { pathToFileURL } = require('node:url');
const pw = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const input = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const hash = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const assert = (ok, message) => { if (!ok) throw new Error(message); };
const dataUrl = p => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
const report = { started: new Date().toISOString(), input, observations: [], errors: [], passed: false };
const outputDir = process.argv[3] || input.outputDir;
report.outputDir = outputDir;
fs.mkdirSync(outputDir, { recursive: true });
const reportPath = path.join(outputDir, 'cto-live-check.json');
assert(!fs.existsSync(reportPath), 'Evidence already exists; use a new versioned output directory.');
const sourceData = dataUrl(input.sourcePng);
const originalHash = hash(input.sourcePng);
const shaInputs = Object.fromEntries(Object.keys(input.runtimeFileHashes).map(p => [p, hash(p)]));
for (const [p, expected] of Object.entries(input.runtimeFileHashes)) assert(shaInputs[p] === expected, 'Input mismatch: ' + p);
assert(originalHash === 'f6f96897290470778067ae15cba408418673f7578c38195736bee60fb822a65e', 'Wrong C2 source.');
let browser;

async function ready(page) {
  for (let attempt = 0; attempt < 100; attempt++) {
    if (await page.evaluate(() => !!window.HOTP01?.snapshot().loaded)) return;
    await new Promise(resolve => setTimeout(resolve, 50));
  }
  throw new Error('The actual page did not become ready.');
}
const state = page => page.evaluate(() => window.HOTP01.snapshot());
async function clickNative(page, x, y) {
  const rect = await page.locator('#scene').boundingBox();
  assert(rect && rect.width > 0 && rect.height > 0, 'No visible scene.');
  await page.mouse.click(rect.x + x * rect.width / 1672, rect.y + y * rect.height / 941);
}
async function pixels(page, expectedPng) {
  return page.evaluate(async ({ original, expected }) => {
    const decode = async uri => { const im = new Image(); im.src = uri; await im.decode(); const c = new OffscreenCanvas(1672, 941); const ctx = c.getContext('2d'); ctx.drawImage(im, 0, 0); return ctx.getImageData(0, 0, 1672, 941).data; };
    const source = await decode(original), ref = await decode(expected);
    const actual = document.querySelector('#scene').getContext('2d').getImageData(0, 0, 1672, 941).data;
    let outsideRoiChangedPixels = 0, maxExpectedChannelDifference = 0;
    for (let y = 0; y < 941; y++) for (let x = 0; x < 1672; x++) {
      const i = (y * 1672 + x) * 4;
      let changed = false;
      for (let channel = 0; channel < 4; channel++) {
        changed ||= actual[i + channel] !== source[i + channel];
        maxExpectedChannelDifference = Math.max(maxExpectedChannelDifference, Math.abs(actual[i + channel] - ref[i + channel]));
      }
      if (changed && !(x < 960 && y >= 480)) outsideRoiChangedPixels++;
    }
    const digest = await crypto.subtle.digest('SHA-256', actual);
    return { rgbaSha256: Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2, '0')).join(''), outsideRoiChangedPixels, maxExpectedChannelDifference };
  }, { original: sourceData, expected: dataUrl(expectedPng) });
}
async function observe(page, name, expectedState, expectedPng, allowTransition = false) {
  const snapshot = await state(page), measurement = await pixels(page, expectedPng);
  assert(snapshot.state === expectedState, name + ': wrong state ' + snapshot.state);
  assert(snapshot.manifestSha256 === input.artManifestSha256, name + ': wrong art manifest.');
  assert(measurement.outsideRoiChangedPixels === 0, name + ': changed pixels outside ROI.');
  if (!allowTransition) assert(measurement.maxExpectedChannelDifference <= 1, name + ': differs from exact reference beyond compositor rounding.');
  report.observations.push({ name, snapshot, measurement });
  return measurement.rgbaSha256;
}

(async () => {
  try {
    browser = await pw.chromium.launch({ headless: true, executablePath: 'C:/Users/user/AppData/Local/ms-playwright/chromium-1208/chrome-win64/chrome.exe' });
    const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    page.on('pageerror', e => report.errors.push(e.message));
    page.on('console', message => { if (message.type() === 'error') report.errors.push(message.text()); });
    page.on('request', request => { if (/^https?:/.test(request.url())) report.errors.push('Unexpected network request: ' + request.url()); });
    await page.goto(pathToFileURL(input.runtimeHtml).href); await ready(page);
    // Warm the readback path before pixel-hash comparisons. Repeated reads can
    // change the browser's canvas rendering path; gameplay is never mutated.
    await page.evaluate(() => { const c = document.querySelector('#scene'); for (let i = 0; i < 4; i++) c.getContext('2d').getImageData(0, 0, c.width, c.height); });
    report.browserVersion = browser.version();
    report.ui = await page.locator('button').evaluateAll(elements => elements.map(e => ({ id: e.id, text: e.textContent })));
    const viewport = await page.locator('#scene').boundingBox();
    assert(viewport.x >= 0 && viewport.y >= 0 && viewport.x + viewport.width <= 1920.5 && viewport.y + viewport.height <= 1080.5, 'Full scene clipped in desktop fit.');
    assert(await page.evaluate(() => document.documentElement.scrollHeight <= 1081), 'Unexpected vertical page scroll in fit.');
    const initial = await observe(page, 'initial', 'both', input.sourcePng);
    await page.screenshot({ path: path.join(outputDir, 'initial-desktop.png') });
    for (const [x, y] of [[270, 625], [522, 548], [521, 709], [215, 822], [520, 630], [1500, 650]]) {
      await clickNative(page, x, y);
      assert((await state(page)).state === 'both', 'Background/fragment/bbox corner was clickable: ' + x + ',' + y);
    }
    await clickNative(page, 350, 680); await page.waitForTimeout(250);
    const noBread = await observe(page, 'bread-first', 'bread_removed', input.states.bread_removed);
    await clickNative(page, 350, 680); await clickNative(page, 521, 709);
    assert((await observe(page, 'repeat-and-fragment', 'bread_removed', input.states.bread_removed)) === noBread, 'Repeated/fragment click changed picture.');
    await page.locator('#compare').click();
    await observe(page, 'compare-original', 'bread_removed', input.sourcePng);
    await clickNative(page, 625, 603);
    assert((await state(page)).state === 'bread_removed', 'Original comparison allowed pickup.');
    await page.locator('#compare').click(); await page.locator('#zoom').click(); await page.locator('#zoom').click();
    assert((await observe(page, 'return-and-zoom', 'bread_removed', input.states.bread_removed)) === noBread, 'Compare/zoom changed run.');
    await clickNative(page, 625, 603); await page.waitForTimeout(250);
    const finalA = await observe(page, 'bread-then-bowl', 'both_removed', input.states.both_removed);
    await page.screenshot({ path: path.join(outputDir, 'both-removed-desktop.png') });
    await page.locator('#reset').click();
    assert((await observe(page, 'reset-final', 'both', input.sourcePng)) === initial, 'Reset did not restore source.');
    await clickNative(page, 625, 581); await page.waitForTimeout(250);
    await observe(page, 'dough-bowl-first', 'bowl_removed', input.states.bowl_removed);
    await clickNative(page, 350, 680); await page.waitForTimeout(250);
    const finalB = await observe(page, 'bowl-then-bread', 'both_removed', input.states.both_removed);
    assert(finalA === finalB, 'Two orders produced different final RGBA.');
    await page.locator('#reset').click(); await clickNative(page, 350, 680); await page.waitForTimeout(60); await page.locator('#reset').click(); await page.waitForTimeout(250);
    assert((await observe(page, 'reset-mid-transition', 'both', input.sourcePng)) === initial, 'A transition resurrected after reset.');
    await page.clock.install({ time: new Date('2026-11-19T15:00:00Z') });
    await page.clock.pauseAt(new Date('2026-11-19T15:00:01Z'));
    await clickNative(page, 350, 680);
    const start = await observe(page, 'transition-start', 'bread_removed', input.sourcePng, true);
    await page.clock.runFor(100);
    const middle = await observe(page, 'transition-middle', 'bread_removed', input.sourcePng, true);
    await page.screenshot({ path: path.join(outputDir, 'transition-middle-desktop.png') });
    const midProgress = (await state(page)).transitionProgress.bread;
    assert(midProgress > 0.25 && midProgress < 0.75, 'No measured middle transition.');
    await page.clock.runFor(150);
    const end = await observe(page, 'transition-end', 'bread_removed', input.states.bread_removed);
    assert(start !== middle && middle !== end && start !== end, 'Transition frames are not distinct.');
    assert(report.errors.length === 0, 'Browser errors or network requests.');
    for (const [p, sha] of Object.entries(shaInputs)) assert(hash(p) === sha, 'Runtime changed during independent check: ' + p);
    report.passed = true;
  } catch (error) { report.failure = error.stack; process.exitCode = 1; }
  finally {
    if (browser) await browser.close();
    report.finished = new Date().toISOString();
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ passed: report.passed, reportPath, failure: report.failure, observations: report.observations.length }));
  }
})();
