async (page) => {
  const viewport = page.viewportSize();
  const touch = viewport.width < 600;
  const stage = page.getByRole('region', { name: /Интерактивная сцена/ });
  const metadata = await page.evaluate(() => ({
    script: document.querySelector('script[type=module]').src,
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  if (metadata.reduced) throw new Error('Expected normal motion');

  await page.waitForTimeout(450);
  if (touch) await stage.tap();
  else await stage.click();
  await page.waitForTimeout(6100);
  const ready = await page.getByRole('button', { name: 'Раскрыться', exact: true }).isVisible();
  if (!ready) throw new Error('Intro did not reach K0');

  return {
    candidate: 'af9a1baa7122fc5d17d0783581a564be2d32f187',
    viewport, touch, metadata, ready, browser: page.context().browser().version(),
    method: 'One uninterrupted normal-speed intro. No application hooks or screenshots.',
  };
}
