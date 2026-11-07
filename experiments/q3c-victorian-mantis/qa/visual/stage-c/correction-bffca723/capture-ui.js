async (page) => {
  const viewport = page.viewportSize();
  const touch = viewport.width < 600;
  const stage = page.getByRole('region', { name: /Интерактивная сцена/ });
  const unfold = page.getByRole('button', { name: 'Раскрыться', exact: true });
  const restart = page.getByRole('button', { name: 'Заново', exact: true });
  const mantis = page.getByText('Богомол следит за курсором и касанием', { exact: true });
  const act = (element) => touch ? element.tap() : element.click();
  const metadata = await page.evaluate(() => ({
    script: document.querySelector('script[type=module]').src,
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scrollWidth: document.documentElement.scrollWidth,
    touchPoints: navigator.maxTouchPoints,
  }));
  const started = Date.now();
  const events = {};
  const focus = {};

  await page.waitForTimeout(450);
  await act(stage);
  events.firstInputMs = Date.now() - started;
  await unfold.waitFor({ state: 'visible' });
  events.capsuleMs = Date.now() - started;
  focus.capsule = await page.evaluate(() => document.activeElement.id);
  await page.waitForTimeout(metadata.reduced ? 1000 : 7700);
  if (touch) await unfold.tap();
  else await page.keyboard.press('e');
  events.unfoldMs = Date.now() - started;
  await mantis.waitFor({ state: 'visible' });
  events.mantisMs = Date.now() - started;
  focus.mantis = await page.evaluate(() => document.activeElement.id);
  await page.waitForTimeout(metadata.reduced ? 1000 : 8000);
  await act(restart);
  events.restartMs = Date.now() - started;
  focus.restart = await page.evaluate(() => document.activeElement.id);
  await page.waitForTimeout(630);
  if (touch) await stage.tap();
  else await page.keyboard.press('a');
  events.repeatMs = Date.now() - started;
  await page.waitForTimeout(750);
  focus.repeat = await page.evaluate(() => document.activeElement.id);

  return {
    candidate: 'bffca72375cee40e8cd96bb19e47b60f7b95e5d9',
    viewport, touch, browser: page.context().browser().version(),
    metadata, events, focus,
    method: 'Real UI input and DOM state; uninterrupted recording with no screenshots or application state hooks.',
  };
}
