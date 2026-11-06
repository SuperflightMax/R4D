async (page) => {
  await page.getByRole('region', { name: 'Интерактивная сцена: активируйте маячок любым действием' }).tap();
  await page.waitForTimeout(8500);
  await page.screenshot({ path: 'output/playwright/mobile/narrow-360x732.png' });
  const result = await page.evaluate(() => ({
    width: innerWidth,
    height: innerHeight,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: document.documentElement.scrollHeight,
    snapshot: window.__Q3C__.snapshot()
  }));
  await page.getByRole('button', { name: 'Заново' }).tap();
  await page.screenshot({ path: 'output/playwright/mobile/narrow-restarted.png' });
  return { result, afterRestart: await page.evaluate(() => window.__Q3C__.snapshot()) };
}
