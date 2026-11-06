async (page) => {
  const out = 'output/recheck-vq01/desktop';
  await page.waitForTimeout(900);
  const freshWaiting = await page.evaluate(() => window.__Q3C__.snapshot());
  await page.screenshot({ path: `${out}/fresh-waiting.png` });
  await page.keyboard.press('Enter');
  await page.waitForTimeout(6500);
  const capsule = await page.evaluate(() => window.__Q3C__.snapshot());
  await page.screenshot({ path: `${out}/capsule.png` });
  await page.getByRole('button', { name: 'Заново' }).click();
  await page.waitForTimeout(900);
  const restartedWaiting = await page.evaluate(() => window.__Q3C__.snapshot());
  await page.screenshot({ path: `${out}/restarted-waiting.png` });
  await page.keyboard.press('a');
  await page.waitForTimeout(180);
  const keyAfterRestart = await page.evaluate(() => window.__Q3C__.snapshot());
  await page.screenshot({ path: `${out}/key-after-restart.png` });
  await page.waitForTimeout(1700);
  const impact = await page.evaluate(() => window.__Q3C__.snapshot());
  await page.screenshot({ path: `${out}/reentry-impact.png` });
  return { candidate: '4a26f1cb789a4b41d09e7b7c9ac1905680d965b4', viewport: page.viewportSize(), method: 'fresh isolated desktop context; default 1x; real Enter/click/a; no debug pause/seek/step', freshWaiting, capsule, restartedWaiting, keyAfterRestart, impact };
}
