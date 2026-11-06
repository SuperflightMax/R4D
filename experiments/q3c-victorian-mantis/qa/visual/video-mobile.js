async (page) => {
  await page.getByRole('region', { name: 'Интерактивная сцена: активируйте маячок любым действием' }).tap();
  await page.waitForTimeout(12000);
  const idle = await page.evaluate(() => window.__Q3C__.snapshot());
  await page.touchscreen.tap(320, 300);
  await page.waitForTimeout(900);
  await page.touchscreen.tap(65, 390);
  await page.waitForTimeout(900);
  return { input: 'real emulated tap; default 1x runtime; then two real taps', viewport: page.viewportSize(), idle };
}
