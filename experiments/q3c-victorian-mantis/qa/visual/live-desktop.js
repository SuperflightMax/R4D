async (page) => {
  const out = 'output/playwright/desktop';
  const observations = [];
  await page.getByRole('region', { name: 'Интерактивная сцена: активируйте маячок любым действием' }).click();
  const started = Date.now();
  for (const target of [0.12, 0.75, 1.15, 1.48, 1.85, 2.4, 2.7, 3.05, 3.3, 3.65, 4.1, 4.65, 4.95, 5.3, 5.7, 6.2, 8.2, 10.2, 12.2]) {
    const delay = target * 1000 - (Date.now() - started);
    if (delay > 0) await page.waitForTimeout(delay);
    const snapshot = await page.evaluate(() => window.__Q3C__.snapshot());
    const filename = `${out}/live-${String(target).replace('.', '_')}.png`;
    await page.screenshot({ path: filename });
    observations.push({ target, wallMs: Date.now() - started, filename, snapshot });
  }
  await page.mouse.move(1110, 340);
  await page.waitForTimeout(550);
  const gazeRight = await page.evaluate(() => window.__Q3C__.snapshot());
  await page.screenshot({ path: `${out}/gaze-right.png` });
  await page.mouse.move(350, 460);
  await page.waitForTimeout(550);
  const gazeLeft = await page.evaluate(() => window.__Q3C__.snapshot());
  await page.screenshot({ path: `${out}/gaze-left.png` });
  return { viewport: page.viewportSize(), method: 'normal-time scene click; no debug pause/seek/step', observations, gazeRight, gazeLeft };
}
