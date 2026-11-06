async (page) => {
  const out = 'output/playwright/mobile';
  const observations = [];
  await page.getByRole('region', { name: 'Интерактивная сцена: активируйте маячок любым действием' }).tap();
  const started = Date.now();
  for (const target of [0.15, 0.8, 1.2, 1.5, 2.4, 2.8, 3.225, 3.7, 4.2, 4.7, 5.1, 5.5, 5.9, 7.9, 10.2]) {
    const delay = target * 1000 - (Date.now() - started);
    if (delay > 0) await page.waitForTimeout(delay);
    const snapshot = await page.evaluate(() => window.__Q3C__.snapshot());
    const filename = `${out}/live-${String(target).replace('.', '_')}.png`;
    await page.screenshot({ path: filename });
    observations.push({ target, wallMs: Date.now() - started, filename, snapshot });
  }
  await page.touchscreen.tap(318, 300);
  await page.waitForTimeout(550);
  const gazeRight = await page.evaluate(() => window.__Q3C__.snapshot());
  await page.screenshot({ path: `${out}/gaze-right.png` });
  await page.touchscreen.tap(72, 420);
  await page.waitForTimeout(550);
  const gazeLeft = await page.evaluate(() => window.__Q3C__.snapshot());
  await page.screenshot({ path: `${out}/gaze-left.png` });
  return { viewport: page.viewportSize(), method: 'normal-time scene tap; no debug pause/seek/step; mobile touch emulation', observations, gazeRight, gazeLeft };
}
