// Playwright CLI run-code. The CLI can record this uninterrupted public route externally.
async page => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('requestfailed', request => errors.push(`${request.url()} ${request.failure()?.errorText}`));
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  const url = new URL(page.url());
  url.search = '?seed=42';
  await page.goto(url.href);

  const viewport = page.viewportSize();
  const { touch, reduced } = await page.evaluate(() => ({
    touch: matchMedia('(pointer: coarse)').matches && navigator.maxTouchPoints > 0,
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
  }));
  const scene = page.locator('#stage');
  const status = page.getByRole('status');
  const unfold = page.getByRole('button', { name: 'Раскрыться', exact: true });
  const restart = page.getByRole('button', { name: 'Заново', exact: true });
  const act = locator => touch ? locator.tap() : locator.click();
  const waitForStatus = text => status.filter({ hasText: text }).waitFor();
  await page.locator('#stage[data-phase="waiting"]').waitFor();
  await waitForStatus('Маячок ожидает сигнала');
  await page.waitForTimeout(350);

  const startedAt = Date.now();
  await act(scene);
  await unfold.waitFor();
  const capsuleAt = Date.now();
  await page.waitForTimeout(reduced ? 350 : touch ? 8100 : 12000);
  const unfoldAt = Date.now();
  if (touch) await unfold.tap();
  else await page.keyboard.press('e');
  await waitForStatus('Богомол следит за курсором и касанием');
  const mantisAt = Date.now();
  await page.waitForTimeout(reduced ? 500 : touch ? 1400 : 12000);
  await act(restart);
  await waitForStatus('Маячок ожидает сигнала');
  const restartAt = Date.now();
  await page.waitForTimeout(500);
  if (touch) await scene.tap();
  else await page.keyboard.press('a');
  await waitForStatus('Посылка уже в пути');
  await page.waitForTimeout(350);
  if (errors.length) throw new Error(errors.join('\n'));
  return {
    viewport, touch, reduced, errors,
    capsuleMs: capsuleAt - startedAt, unfoldMs: unfoldAt - startedAt,
    mantisMs: mantisAt - startedAt, restartMs: restartAt - startedAt,
  };
}
