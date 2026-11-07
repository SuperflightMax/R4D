async (page) => {
  const binding = null;
  const { sha, buildSha256, output } = binding;
  const diagnostics = [];
  page.on('pageerror', error => diagnostics.push(error.message));
  page.on('console', message => { if (['warning', 'error'].includes(message.type())) diagnostics.push(message.text()); });
  page.on('requestfailed', request => diagnostics.push(request.url()));
  page.on('response', response => { if (response.status() >= 400) diagnostics.push(response.url()); });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 360, height: 732 });
  await page.goto('http://127.0.0.1:4209/?seed=42&paused=1');
  await page.waitForFunction(() => window.__Q3C__?.ready);
  await page.locator('#stage').tap();
  const ticks = [353, 354, 372, 373, 493, 500];
  let previous = 0;
  const captures = [];
  for (const tick of ticks) {
    const state = await page.evaluate(delta => {
      const q = window.__Q3C__;
      q.step(delta / 120);
      const s = q.trace();
      return { tick: s.tick, phase: s.phase, body: s.pose.body, planted: s.planted, camera: s.render.camera };
    }, tick - previous);
    if (state.tick !== tick) throw new Error('Wrong capture tick');
    const path = 'touch360-intro-t' + tick + '.png';
    await page.screenshot({ path: output + '/' + path });
    captures.push({ path, ...state });
    previous = tick;
  }
  return { sha, buildSha256, viewport: [360, 732], captures, diagnostics };
}
