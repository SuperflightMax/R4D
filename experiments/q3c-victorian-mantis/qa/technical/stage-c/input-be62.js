async (page) => {
  const sha = 'be62b16b0253208493e5d546e0f9d158342a9250';
  const buildSha256 = 'd51cc6dd6d6f00b5203c3ce428fab4907af463054c8b9537b06c17054f43619e';
  const url = 'http://127.0.0.1:4205/?seed=42&paused=1';
  const diagnostics = { console: [], pageErrors: [], failedRequests: [] };
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) diagnostics.console.push({ type: m.type(), text: m.text() }); });
  page.on('pageerror', e => diagnostics.pageErrors.push(e.message));
  page.on('requestfailed', r => diagnostics.failedRequests.push({ url: r.url(), failure: r.failure() }));
  const checks = [];
  const check = (name, pass, details) => checks.push({ name, pass: Boolean(pass), details });
  const snapshot = () => page.evaluate(() => window.__Q3C__.trace());
  const step = seconds => page.evaluate(t => window.__Q3C__.step(t), seconds);
  const transformEvents = s => s.events.filter(e => e.type === 'transform');
  const matrices = s => Object.fromEntries(Object.entries(s.render.parts).map(([id, p]) => [id, [p.token, p.matrix, p.physicalMatrix]]));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(url);
  await page.waitForFunction(() => window.__Q3C__?.ready);
  await page.keyboard.press('e');
  let s = await snapshot();
  check('fresh E activates delivery only', s.phase === 'beacon' && s.events[0]?.source === 'keyboard' && transformEvents(s).length === 0, s.events);
  await step(6);
  const beforeE = await snapshot();
  await page.keyboard.press('e');
  const afterE = await snapshot();
  check('E at K0 triggers one direct transform without a matrix jump',
    beforeE.phase === 'capsule' && afterE.phase === 'transforming' && transformEvents(afterE).length === 1 &&
    transformEvents(afterE)[0].source === 'keyboard' && beforeE.tick === afterE.tick &&
    JSON.stringify(matrices(beforeE)) === JSON.stringify(matrices(afterE)), transformEvents(afterE));
  await page.keyboard.press('e');
  check('repeat E remains one transform', transformEvents(await snapshot()).length === 1);
  await step(1.69);
  const beforeResize = await snapshot();
  await page.setViewportSize({ width: 1120, height: 820 });
  const resized = await snapshot();
  check('resize preserves world and projected-before-camera transforms', resized.tick === beforeResize.tick &&
    JSON.stringify(matrices(resized)) === JSON.stringify(matrices(beforeResize)) &&
    JSON.stringify(resized.render.camera) !== JSON.stringify(beforeResize.render.camera),
    { tick: resized.tick, cameraBefore: beforeResize.render.camera, cameraAfter: resized.render.camera });
  await page.setViewportSize({ width: 1440, height: 1000 });
  const restart = page.getByRole('button', { name: 'Заново', exact: true });
  await restart.click();
  s = await snapshot();
  check('restart during K2 resets the scene', s.phase === 'waiting' && s.tick === 0 && s.events.length === 0);
  await page.evaluate(() => {
    window.__c2ClickProbe = [];
    document.querySelector('#restart').addEventListener('click', e => window.__c2ClickProbe.push({
      detail: e.detail, trusted: e.isTrusted, phase: window.__Q3C__.snapshot().phase
    }), true);
  });
  await page.keyboard.press('Space');
  const restartClick = await page.evaluate(() => window.__c2ClickProbe);
  s = await snapshot();
  check('focused restart Space is one native click', s.phase === 'waiting' && s.events.length === 0 &&
    restartClick.length === 1 && restartClick[0].trusted && restartClick[0].detail === 0 && restartClick[0].phase === 'waiting', restartClick);
  await page.keyboard.press('a');
  s = await snapshot();
  check('A after restart focus starts beacon', s.phase === 'beacon' && s.events[0]?.source === 'keyboard', s.events);
  await step(6);
  const unfold = page.getByRole('button', { name: 'Раскрыться', exact: true });
  for (let i = 0; i < 12 && !await unfold.evaluate(el => document.activeElement === el); i++) await page.keyboard.press('Tab');
  const focus = await unfold.evaluate(el => ({ active: el === document.activeElement, visible: el.matches(':focus-visible'), outline: getComputedStyle(el).outlineStyle }));
  check('accessible name, real Tab and visible focus', await unfold.count() === 1 && await unfold.isEnabled() && focus.active && focus.visible && focus.outline !== 'none', focus);
  await page.keyboard.press('Space');
  s = await snapshot();
  check('focused unfold Space invokes one native action', s.phase === 'transforming' && transformEvents(s).length === 1 && transformEvents(s)[0].source === 'button', transformEvents(s));

  // A seeded property probe supplements the two independently recorded public-input traces.
  const seedProbe = await page.evaluate(() => [42, 77, 42].map(seed => {
    const q = window.__Q3C__;
    q.reset(seed); q.activate(); q.step(7.13);
    const capsule = q.trace();
    q.transform(); q.step(6.17);
    const mantis = q.trace();
    const select = s => ({ tick: s.tick, phase: s.phase, idle: s.pose.idle, lens: s.pose.eye, regulator: s.pose.parts['shell.regulator'].local.rotation });
    return { seed, capsule: select(capsule), mantis: select(mantis) };
  }));
  check('explicit seed replay and alternate seeded idles', JSON.stringify(seedProbe[0]) === JSON.stringify(seedProbe[2]) &&
    JSON.stringify(seedProbe[0].capsule.idle) !== JSON.stringify(seedProbe[1].capsule.idle) &&
    JSON.stringify(seedProbe[0].mantis.idle) !== JSON.stringify(seedProbe[1].mantis.idle));
  check('console and network', Object.values(diagnostics).every(v => v.length === 0), diagnostics);
  return { sha, buildSha256, checks, seedProbe, diagnostics };
}
