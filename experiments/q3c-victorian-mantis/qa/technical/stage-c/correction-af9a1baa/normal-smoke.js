async (page) => {
  const binding = null;
  const { sha, buildSha256, output } = binding;
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (['warning', 'error'].includes(message.type())) errors.push(message.text()); });
  page.on('requestfailed', request => errors.push(request.url()));
  page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('http://127.0.0.1:4211/?seed=42');
  await page.waitForFunction(() => window.__Q3C__?.ready && window.__Q3C__.snapshot().phase === 'waiting');
  const started = Date.now();
  const observations = page.evaluate(() => new Promise(resolve => {
    const q = window.__Q3C__;
    const firstSeen = {};
    let firstActiveAt, firstLoadAt, firstFourAt, samples = 0;
    let maxLiftBeforeFour = 0;
    let lastTick = -1;
    function observe(now) {
      const s = q.snapshot();
      if (s.phase !== 'waiting') {
        firstActiveAt ??= now;
        if (s.tick !== lastTick) samples++;
        lastTick = s.tick;
        for (const leg of s.pose.legs) {
          if (leg.planted) firstSeen[leg.id] ??= s.tick;
        }
        if (s.pose.legs.every(leg => leg.planted)) firstFourAt ??= s.tick;
        else if (s.tick >= 282) maxLiftBeforeFour = Math.max(maxLiftBeforeFour, -82 - s.pose.body.y);
        if (s.pose.lift > .02) firstLoadAt ??= s.tick;
        if (s.phase === 'capsule') {
          resolve({ samples, firstSeen, firstFourAt, firstLoadAt, maxLiftBeforeFour,
            elapsedMs: now - firstActiveAt, finalTick: s.tick, phase: s.phase, seed: s.seed,
            events: s.events, soles: s.pose.legs.map(leg => ({ id: leg.id, foot: leg.world.foot, anchor: leg.anchor, planted: leg.planted })) });
          return;
        }
      }
      if (firstActiveAt !== undefined && now - firstActiveAt > 15_000) {
        resolve({ timedOut: true, samples, lastTick });
        return;
      }
      requestAnimationFrame(observe);
    }
    requestAnimationFrame(observe);
  }));
  await page.locator('#stage').click();
  await page.getByRole('button', { name: 'Раскрыться', exact: true }).waitFor();
  const observed = await observations;
  const elapsedWallMs = Date.now() - started;
  const viewport = page.viewportSize();
  await page.screenshot({ path: output + '/normal-smoke.png' });
  return { sha, buildSha256, viewport, elapsedWallMs, ...observed, errors };
}
