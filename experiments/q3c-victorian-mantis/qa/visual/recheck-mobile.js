async (page) => {
  const viewport = page.viewportSize();
  const out = `output/recheck-vq01/mobile${viewport.width}`;
  const observations = [];
  await page.waitForTimeout(900);
  const freshWaiting = await page.evaluate(() => window.__Q3C__.snapshot());
  await page.screenshot({ path: `${out}/fresh-waiting.png` });
  await page.getByRole('region', { name: 'Интерактивная сцена: активируйте маячок любым действием' }).tap();
  const started = Date.now();
  for (const target of [0.15, 0.4, 0.55, 0.7, 0.85, 1.05, 1.25, 1.5, 1.8]) {
    const delay = target * 1000 - (Date.now() - started);
    if (delay > 0) await page.waitForTimeout(delay);
    const snapshot = await page.evaluate(() => window.__Q3C__.snapshot());
    const filename = `${out}/entry-${String(target).replace('.', '_')}.png`;
    await page.screenshot({ path: filename });
    observations.push({ target, wallMs: Date.now() - started, snapshot, filename });
  }
  const toCapsule = 6500 - (Date.now() - started);
  if (toCapsule > 0) await page.waitForTimeout(toCapsule);
  const capsule = await page.evaluate(() => window.__Q3C__.snapshot());
  await page.screenshot({ path: `${out}/capsule-before-restart.png` });
  await page.getByRole('button', { name: 'Заново' }).tap();
  await page.waitForTimeout(900);
  const restartedWaiting = await page.evaluate(() => window.__Q3C__.snapshot());
  await page.screenshot({ path: `${out}/restarted-waiting.png` });
  await page.getByRole('region', { name: 'Интерактивная сцена: активируйте маячок любым действием' }).tap();
  const restartedAt = Date.now();
  const restartedEntry = [];
  for (const target of [0.4, 0.7, 1.1, 1.5, 1.8]) {
    const delay = target * 1000 - (Date.now() - restartedAt);
    if (delay > 0) await page.waitForTimeout(delay);
    const snapshot = await page.evaluate(() => window.__Q3C__.snapshot());
    const filename = `${out}/reentry-${String(target).replace('.', '_')}.png`;
    await page.screenshot({ path: filename });
    restartedEntry.push({ target, wallMs: Date.now() - restartedAt, snapshot, filename });
  }
  return { candidate: '4a26f1cb789a4b41d09e7b7c9ac1905680d965b4', viewport, method: 'fresh isolated mobile context; default 1x; real taps; no debug pause/seek/step', freshWaiting, observations, capsule, restartedWaiting, restartedEntry };
}
