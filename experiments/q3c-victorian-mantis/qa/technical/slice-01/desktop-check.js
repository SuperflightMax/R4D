async (page) => {
  const base = 'http://127.0.0.1:4194/';
  const out = { candidate: 'c79af101d944c121d9dc6b7e203d393a45baf8e5', viewport: '1280x720', checks: [], console: [], live: [], poses: [] };
  const check = (name, pass, details) => out.checks.push({ name, pass: !!pass, details });
  page.on('pageerror', error => out.console.push({ type: 'pageerror', message: error.message }));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) out.console.push({ type: message.type(), message: message.text() }); });
  const state = () => page.evaluate(() => window.__Q3C__.snapshot());
  const ready = () => page.waitForFunction(() => window.__Q3C__?.ready);
  await page.goto(base + '?seed=42&paused=1');
  await ready();
  const initial = await state();
  check('waiting before input', initial.phase === 'waiting' && initial.tick === 0 && !initial.active);
  await page.locator('#stage').click();
  const clicked = await state();
  check('real mouse activates beacon', clicked.phase === 'beacon' && clicked.events[0]?.source === 'mouse', clicked.events);
  await page.locator('#stage').click();
  await page.keyboard.press('ArrowRight');
  const repeated = await state();
  check('repeated input does not reset or reactivate', repeated.events.length === 1 && repeated.tick === 0);
  let previous = 0;
  for (const target of [0.2, 0.9, 1.45, 2.7, 3.225, 3.6, 4.65, 5.1, 5.75, 6.4]) {
    const pose = await page.evaluate(dt => window.__Q3C__.step(dt), target - previous);
    previous = target;
    out.poses.push({ time: pose.time, phase: pose.phase, eyeId: pose.pose.eye.id, legs: pose.pose.legs.map(l => l.id), body: pose.pose.body, hatches: pose.pose.hatches, eye: pose.pose.eye });
    await page.screenshot({ path: `output/playwright/desktop-step-${target}.png` });
  }
  const geometry = await page.evaluate(() => {
    const q = window.__Q3C__;
    q.pause(); q.reset(42); q.activate();
    let maxLengthError = 0, maxFootY = -Infinity, maxKneeY = -Infinity, maxPlantedDrift = 0, samples = 0, identity = true, finite = true;
    const anchors = new Map();
    for (let n = 0; n <= 2400; n++) {
      const s = n ? q.step(1 / 120) : q.snapshot();
      const legs = s.pose.legs;
      identity &&= legs.length === 4 && legs.map(l => l.id).join() === 'rear-left,rear-right,front-left,front-right' && s.pose.eye.id === 'optical-head';
      for (const l of legs) {
        const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
        maxLengthError = Math.max(maxLengthError, Math.abs(d(l.world.hip, l.world.knee) - l.upper), Math.abs(d(l.world.knee, l.world.foot) - l.lower));
        maxFootY = Math.max(maxFootY, l.world.foot.y);
        maxKneeY = Math.max(maxKneeY, l.world.knee.y);
        finite &&= Object.values(l.world).every(p => Number.isFinite(p.x) && Number.isFinite(p.y));
        if (l.planted) { if (!anchors.has(l.id)) anchors.set(l.id, l.world.foot); maxPlantedDrift = Math.max(maxPlantedDrift, d(l.world.foot, anchors.get(l.id))); }
      }
      samples++;
    }
    const contact = q.seek(1.45);
    return { samples, identity, finite, maxLengthError, maxFootY, maxKneeY, maxPlantedDrift, contact: { x: contact.pose.body.x, bottomY: contact.pose.body.y + 82, beacon: contact.pose.beacon } };
  });
  out.geometry = geometry;
  check('2401 samples: rigid lengths, four identities, same eye, finite geometry', geometry.identity && geometry.finite && geometry.maxLengthError < 1e-7, geometry);
  check('joint/foot centerlines stay above floor; planted feet do not drift', geometry.maxFootY < 1e-7 && geometry.maxKneeY <= 0 && geometry.maxPlantedDrift < 1e-7);
  check('capsule centerline contact on beacon', geometry.contact.x === 0 && Math.abs(geometry.contact.bottomY) < 1e-7);
  out.determinism = await page.evaluate(() => {
    const q = window.__Q3C__;
    const replay = parts => {
      q.reset(42); q.activate(); q.setPointer(-180, -240);
      for (let i = 0; i < parts; i++) q.step(2 / parts);
      q.setPointer(170, -160);
      for (let i = 0; i < parts; i++) q.step(6 / parts);
      return q.snapshot();
    };
    const a = replay(1), b = replay(240);
    q.reset(2147483648); q.activate(); q.step(8);
    return { equalAcrossCadences: JSON.stringify(a) === JSON.stringify(b), tick: a.tick, seed: a.seed, changedSeedChangesIdle: a.pose.body.y !== q.snapshot().pose.body.y };
  });
  check('seed and timestamped input replay across frame cadences', out.determinism.equalAcrossCadences && out.determinism.changedSeedChangesIdle, out.determinism);
  await page.goto(base + '?seed=42&paused=1'); await ready();
  await page.keyboard.press('a');
  check('real keyboard activates beacon from fresh page', (await state()).events[0]?.source === 'keyboard');
  await page.getByRole('button', { name: 'Заново' }).click();
  check('restart returns waiting with empty events', (await state()).phase === 'waiting' && (await state()).events.length === 0);
  await page.keyboard.press('a');
  const afterRestartKey = await state();
  out.keyboardAfterRestart = { phase: afterRestartKey.phase, focused: await page.evaluate(() => document.activeElement?.id), events: afterRestartKey.events };
  check('keyboard can start again after clicking restart', afterRestartKey.phase === 'beacon', out.keyboardAfterRestart);
  await page.goto(base + '?seed=42&paused=1'); await ready();
  const box = await page.locator('#stage').boundingBox();
  await page.mouse.move(box.x + 80, box.y + 100); await page.mouse.down();
  await page.mouse.move(box.x + 140, box.y + 140); await page.mouse.up();
  check('real pointer drag starts once', (await state()).events.filter(e => e.type === 'activate').length === 1 && (await state()).active);
  await page.goto(base + '?seed=42'); await ready();
  await page.locator('#stage').click();
  for (const target of [0.2, 0.9, 1.45, 2.7, 3.225, 3.6, 4.65, 5.1, 5.75, 6.4, 8.4]) {
    await page.waitForFunction(t => window.__Q3C__.snapshot().time >= t, target);
    const s = await state();
    out.live.push({ target, time: s.time, phase: s.phase, body: s.pose.body, eye: s.pose.eye, hatches: s.pose.hatches, legs: s.pose.legs.map(l => ({ id: l.id, upperAngle: l.upperAngle, kneeAngle: l.kneeAngle, foot: l.world.foot })) });
    await page.screenshot({ path: `output/playwright/desktop-live-${target}.png` });
  }
  check('unpaused real-time route reaches capsule without bypass', (await state()).phase === 'capsule' && (await state()).events[0]?.source === 'mouse');
  const idleBefore = await state();
  await page.mouse.move(box.x + 30, box.y + 60); await page.waitForTimeout(700);
  const left = await state();
  await page.mouse.move(box.x + box.width - 30, box.y + 60); await page.waitForTimeout(700);
  const right = await state();
  out.liveGaze = { left: left.pose.eye.gazeX, right: right.pose.eye.gazeX, bodyY: [idleBefore.pose.body.y, left.pose.body.y, right.pose.body.y], eyeY: [idleBefore.pose.eye.y, left.pose.eye.y, right.pose.eye.y] };
  check('real pointer tracking and living idle', left.pose.eye.gazeX < 0 && right.pose.eye.gazeX > 0 && idleBefore.pose.body.y !== right.pose.body.y && idleBefore.pose.eye.y !== right.pose.eye.y, out.liveGaze);
  out.layout = await page.evaluate(() => ({ viewport: { width: innerWidth, height: innerHeight }, scrollWidth: document.documentElement.scrollWidth, stage: (() => { const r = document.querySelector('#stage').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; })(), errorVisible: !document.querySelector('#error').hidden }));
  check('desktop has canvas, no horizontal overflow or launch error', await page.locator('canvas').count() === 1 && out.layout.scrollWidth <= 1280 && !out.layout.errorVisible, out.layout);
  const seeds = [];
  for (let n = 0; n < 2; n++) { await page.goto(base); await ready(); seeds.push((await state()).seed); }
  out.ordinarySeeds = seeds;
  check('ordinary page loads select a fresh seed', seeds[0] !== seeds[1], seeds);
  check('browser console and page errors', out.console.length === 0, out.console);
  return out;
}
