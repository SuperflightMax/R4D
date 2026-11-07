async (page) => {
  const viewport = page.viewportSize();
  const touch = viewport.width < 600;
  const reduced = await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const size = touch ? `mobile${viewport.width}` : 'desktop';
  const out = `evidence/${reduced ? 'reduced' : 'normal'}/${size}`;
  const shots = [];
  const interactions = [];
  const wallOrigin = Date.now();
  const stage = page.getByRole('region', { name: /Интерактивная сцена/ });
  const unfold = page.getByRole('button', { name: 'Раскрыться', exact: true });
  const restart = page.getByRole('button', { name: 'Заново', exact: true });
  const act = (locator) => touch ? locator.tap() : locator.click();
  const observe = (identity) => page.evaluate((includeIdentity) => {
    const q = window.__Q3C__;
    const s = q.snapshot();
    const parts = includeIdentity ? q.trace().render.parts : {};
    const identityParts = Object.fromEntries(Object.entries(parts)
      .filter(([id]) => /^(eye\.(lens|front_hatch)|cradle|shell\.(front|rear)|thorax\.(lower|upper)|walk\..+\.foot|rapt\..+\.tibia)$/.test(id))
      .map(([id, part]) => [id, { token: part.token, parent: part.parent, asset: part.asset, surface: part.surface }]));
    return {
      time: s.time, tick: s.tick, phase: s.phase, beat: s.pose.beat, focus: document.activeElement?.id,
      transformTime: s.pose.transformTime, body: s.pose.body, eye: s.pose.eye,
      contacts: Object.values(s.pose.legs ?? {}).map((leg) => ({ id: leg.id, foot: leg.world?.foot, anchor: leg.anchor })),
      identityParts,
    };
  }, identity);
  const capture = async (name, identity = false) => {
    const before = await observe(identity);
    const wallMs = Date.now() - wallOrigin;
    const file = `${out}/${name}.png`;
    await page.screenshot({ path: file });
    const after = await observe(false);
    shots.push({ name, file, wallMs, before, frameTimeBracket: [before.time, after.time] });
  };
  const waitForPhase = (phase) => page.waitForFunction((expected) => window.__Q3C__.snapshot().phase === expected, phase, { timeout: 25000 });
  const waitForIntro = (time) => page.waitForFunction((target) => window.__Q3C__.snapshot().time >= target, time, { timeout: 16000 });
  const input = async (name, action) => {
    const wallBeforeMs = Date.now() - wallOrigin;
    await action();
    interactions.push({ name, wallBeforeMs, wallAfterMs: Date.now() - wallOrigin, state: await observe(false) });
  };

  await waitForPhase('waiting');
  await page.waitForTimeout(350);
  const metadata = await page.evaluate(() => ({
    href: location.href, script: document.querySelector('script[type=module]')?.src,
    assets: window.__Q3C__.assets, timing: window.__Q3C__.timing,
    screen: { width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth },
    maxTouchPoints: navigator.maxTouchPoints,
  }));
  await capture('waiting');
  await input('first scene input', () => act(stage));
  if (!reduced) {
    for (const [time, name] of [[1.49, 'impact'], [2.83, 'leg-intro-1'], [3.32, 'leg-intro-2'], [3.79, 'leg-intro-3'], [4.25, 'leg-plant'], [4.67, 'eye-hatch-intro'], [5.19, 'eye-carriage-intro']]) {
      await waitForIntro(time);
      await capture(name);
    }
  }
  await waitForPhase('capsule');
  await unfold.waitFor({ state: 'visible' });
  await capture('K0-capsule', true);
  if (!reduced) {
    await page.waitForTimeout(3150);
    await capture('capsule-idle-a');
    await page.waitForTimeout(4500);
    await capture('capsule-idle-b');
  } else {
    await page.waitForTimeout(950);
  }
  await input(touch ? 'tap Раскрыться' : 'key E', () => touch ? unfold.tap() : page.keyboard.press('e'));
  await waitForPhase('transforming');
  if (!reduced) {
    for (const beat of ['K1', 'K2', 'K3', 'K4']) {
      const time = metadata.timing.beatOffsets[beat] / metadata.timing.hz;
      await page.waitForFunction((target) => window.__Q3C__.snapshot().pose.transformTime >= target, time, { timeout: 15000 });
      await capture(beat, true);
    }
  }
  await waitForPhase('mantis');
  await capture('K5-mantis', true);
  if (!reduced) {
    await page.waitForTimeout(3150);
    await capture('mantis-idle-a');
    await page.waitForTimeout(4500);
    await capture('mantis-idle-b');
  } else {
    await page.waitForTimeout(950);
  }
  await input('restart from mantis', () => act(restart));
  await page.waitForTimeout(550);
  await capture('restarted-waiting');
  await input(touch ? 'tap after restart' : 'key A after restart', () => touch ? stage.tap() : page.keyboard.press('a'));
  await page.waitForTimeout(150);
  await capture('restarted-beacon');

  return {
    candidate: '3be9dbf11e7a07a2678c3be161e54fd24aa7f893', viewport, touch, reduced,
    browser: page.context().browser().version(), metadata,
    method: 'real scene input and regular runtime clock; no pause, seek or step; screenshot time bracket covers capture latency',
    interactions, shots,
  };
}
