async (page) => {
  const stage = page.getByRole('region', { name: /Интерактивная сцена/ });
  const unfold = page.getByRole('button', { name: 'Раскрыться', exact: true });
  const restart = page.getByRole('button', { name: 'Заново', exact: true });
  const mantis = page.getByText('Богомол следит за курсором и касанием', { exact: true });
  const source = await page.locator('script[type=module]').getAttribute('src');
  const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduced) throw new Error('Expected normal motion');
  const start = Date.now();
  const events = {};

  await page.waitForTimeout(350);
  await stage.click();
  events.firstInputMs = Date.now() - start;
  await unfold.waitFor({ state: 'visible' });
  await page.waitForTimeout(8000);
  await page.keyboard.press('e');
  events.unfoldMs = Date.now() - start;
  await mantis.waitFor({ state: 'visible' });
  events.mantisMs = Date.now() - start;
  await page.waitForTimeout(8000);
  await restart.click();
  events.restartMs = Date.now() - start;
  await page.waitForTimeout(600);
  await page.keyboard.press('a');
  events.repeatMs = Date.now() - start;
  await page.waitForTimeout(700);

  return {
    candidate: '3be9dbf11e7a07a2678c3be161e54fd24aa7f893',
    viewport: page.viewportSize(),
    reduced,
    metadata: { script: new URL(source, page.url()).href },
    method: 'user input and UI locators only; no screenshots or application state reads',
    events,
  };
}
