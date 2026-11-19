'use strict';
// Delivery-only check: anonymous HTTPS bytes and real browser pickups.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const pw = require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const [inputsPath, requestedUrl, outputDir] = process.argv.slice(2);
const assert = (ok, why) => { if (!ok) throw new Error(why); };
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const inputs = JSON.parse(fs.readFileSync(inputsPath, 'utf8'));
const base = new URL(requestedUrl);
assert(base.protocol === 'https:' && base.hostname === 'superflight.space' && base.pathname.startsWith('/review/'), 'Unexpected publication destination');
assert(base.pathname.endsWith('/') && !base.search && !base.hash, 'Use the exact version directory URL');
assert(path.resolve(outputDir).toLowerCase().startsWith('k:\\agents\\r4d\\review\\ho-tp-01\\release\\'), 'Evidence must stay in the private release directory');
const reportPath = path.join(outputDir, 'cto-public-check.json');
assert(!fs.existsSync(reportPath), 'Evidence exists: select a new versioned output directory');
fs.mkdirSync(outputDir, { recursive: true });
const report = { startedAt: new Date().toISOString(), url: base.href, inputSha256: sha(fs.readFileSync(inputsPath)), reportCommit: inputs.reportCommit, anonymous: true, providedCookies: 0, providedAuthorization: false, http: [], browserHttp: [], failedRequests: [], pageErrors: [], consoleErrors: [], observations: [], qualifications: [], passed: false };
const originFaviconUrl = new URL('/favicon.ico', base).href;
let browser;
const snapshot = page => page.evaluate(() => window.HOTP01.snapshot());
const settled = (page, name) => page.waitForFunction(target => window.HOTP01?.snapshot().loaded && window.HOTP01.snapshot().state === target && !window.HOTP01.snapshot().animating, name, { timeout: 15000 });
async function pickup(page, x, y, name) {
  const r = await page.locator('#scene').boundingBox();
  assert(r && r.width > 0 && r.height > 0, 'Canvas is not visible');
  await page.mouse.click(r.x + x * r.width / 1672, r.y + y * r.height / 941);
  await settled(page, name);
  report.observations.push({ action: 'real mouse click', native: [x, y], snapshot: await snapshot(page) });
}
const rgbaHash = page => page.evaluate(async () => {
  const c = document.querySelector('#scene');
  const pixels = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  const digest = await crypto.subtle.digest('SHA-256', pixels);
  return Array.from(new Uint8Array(digest), n => n.toString(16).padStart(2, '0')).join('');
});
(async () => {
  try {
    assert(inputs.files.length === 4, 'Unexpected allowlist');
    for (const file of inputs.files) {
      const local = fs.readFileSync(file.sourcePath);
      assert(local.length === file.bytes && sha(local) === file.sha256, 'Frozen local input changed: ' + file.relativePath);
      const response = await fetch(new URL(file.relativePath, base), { redirect: 'manual', signal: AbortSignal.timeout(30000) });
      const bytes = Buffer.from(await response.arrayBuffer());
      const item = { path: file.relativePath, status: response.status, mime: response.headers.get('content-type'), bytes: bytes.length, sha256: sha(bytes), expectedSha256: file.sha256 };
      report.http.push(item);
      assert(item.status === 200 && item.bytes === file.bytes && item.sha256 === file.sha256, 'Anonymous published bytes mismatch: ' + file.relativePath);
      assert(file.relativePath.endsWith('.html') ? /text\/html/i.test(item.mime) : file.relativePath.endsWith('.css') ? /text\/css/i.test(item.mime) : /(?:java|ecma)script/i.test(item.mime), 'Unexpected MIME: ' + file.relativePath);
    }
    browser = await pw.chromium.launch({ headless: true, executablePath: 'C:/Users/user/AppData/Local/ms-playwright/chromium-1208/chrome-win64/chrome.exe' });
    report.browserVersion = browser.version();
    const context = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
    assert((await context.cookies()).length === 0, 'Browser did not start anonymously');
    const page = await context.newPage();
    page.on('response', r => { if (/^https?:/.test(r.url())) report.browserHttp.push({ url: r.url(), status: r.status() }); });
    page.on('requestfailed', r => report.failedRequests.push({ url: r.url(), error: r.failure()?.errorText }));
    page.on('pageerror', e => report.pageErrors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') report.consoleErrors.push({ text: m.text(), location: m.location() }); });
    const response = await page.goto(base.href, { waitUntil: 'load', timeout: 30000 });
    assert(response?.status() === 200 && page.url() === base.href, 'Anonymous browser entry redirected or failed');
    await settled(page, 'both');
    // Same readonly readback warmup used by the accepted local measurement.
    await page.evaluate(() => { const c = document.querySelector('#scene'); for (let n = 0; n < 4; n++) c.getContext('2d').getImageData(0, 0, c.width, c.height); });
    const first = await snapshot(page);
    assert(first.sourceSha256 === 'f6f96897290470778067ae15cba408418673f7578c38195736bee60fb822a65e' && first.manifestSha256 === inputs.artManifestSha256, 'Published runtime reports a different source');
    report.initialSnapshot = first;
    report.visibleArtWarning = await page.locator('#detail').innerText();
    assert(/PARTIAL/.test(first.artStatus) && /шов.*стык/.test(report.visibleArtWarning) && /при[её]мка.*впереди/.test(report.visibleArtWarning), 'Author PARTIAL or visible Russian art warning is missing');
    report.initialRgba = await rgbaHash(page);
    await page.screenshot({ path: path.join(outputDir, 'initial-public-desktop.png') });
    await pickup(page, 350, 680, 'bread_removed');
    await pickup(page, 625, 603, 'both_removed');
    report.breadThenBowlRgba = await rgbaHash(page);
    await page.locator('#reset').click();
    await settled(page, 'both');
    assert(await rgbaHash(page) === report.initialRgba, 'Reset changed the initial frame');
    await pickup(page, 625, 603, 'bowl_removed');
    await pickup(page, 350, 680, 'both_removed');
    report.bowlThenBreadRgba = await rgbaHash(page);
    assert(report.breadThenBowlRgba === report.bowlThenBreadRgba, 'Published pickup orders have different final frames');
    report.matchesAcceptedLocalFinalRgba = report.bowlThenBreadRgba === '0f898f2049504c426f8776e392938dcbe3d973e0b396050eafba25d330502f7a';
    await page.screenshot({ path: path.join(outputDir, 'both-removed-public-desktop.png') });
    // Chromium may report its origin-favicon fetch only through the console,
    // without emitting a Page response event. Preserve that exact observation.
    const favicon404 = report.browserHttp.some(r => r.url === originFaviconUrl && r.status === 404) || report.consoleErrors.some(e => e.location.url === originFaviconUrl && /404/.test(e.text));
    const applicationConsoleErrors = report.consoleErrors.filter(e => !(favicon404 && e.location.url === originFaviconUrl && /404/.test(e.text)));
    if (favicon404) report.qualifications.push({ url: originFaviconUrl, status: 404, scope: 'Browser origin favicon, outside the immutable HO-TP-01 leaf and four-file allowlist. Observed and left unchanged.' });
    assert(!report.failedRequests.length && !report.pageErrors.length && !applicationConsoleErrors.length, 'Public browser logged an application or failed-request error');
    assert(report.browserHttp.every(r => r.status >= 200 && r.status < 300 || r.url === originFaviconUrl && r.status === 404), 'A required public browser resource response was not successful');
    report.passed = true;
  } catch (error) {
    report.failure = error.stack || String(error);
    process.exitCode = 1;
  } finally {
    if (browser) await browser.close();
    report.browserClosed = true;
    report.completedAt = new Date().toISOString();
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2) + '\n');
    console.log(JSON.stringify({ passed: report.passed, evidence: reportPath, publicFiles: report.http.length, bothOrdersMatch: !!report.breadThenBowlRgba && report.breadThenBowlRgba === report.bowlThenBreadRgba, finalRgba: report.bowlThenBreadRgba, qualifications: report.qualifications, failure: report.failure }));
  }
})();
