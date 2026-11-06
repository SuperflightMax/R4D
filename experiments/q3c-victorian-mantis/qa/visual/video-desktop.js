async (page) => {
  await page.keyboard.press('Enter');
  await page.waitForTimeout(13000);
  const idle = await page.evaluate(() => window.__Q3C__.snapshot());
  await page.mouse.move(1100, 350);
  await page.waitForTimeout(900);
  await page.mouse.move(350, 400);
  await page.waitForTimeout(900);
  return { input: 'real Enter key; default 1x runtime; then two real pointer moves', viewport: page.viewportSize(), idle };
}
