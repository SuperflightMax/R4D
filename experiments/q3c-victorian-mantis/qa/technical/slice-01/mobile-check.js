async (page) => {
  const base = 'http://127.0.0.1:4194/';
  const out = { candidate: 'c79af101d944c121d9dc6b7e203d393a45baf8e5', mode: 'Pixel 7 touch emulation, Chrome', checks: [], console: [], live: [] };
  const check = (name, pass, details) => out.checks.push({ name, pass: !!pass, details });
  page.on('pageerror', error => out.console.push({ type: 'pageerror', message: error.message }));
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) out.console.push({ type: message.type(), message: message.text() }); });
  const ready = () => page.waitForFunction(() => window.__Q3C__?.ready);
  const state = () => page.evaluate(() => window.__Q3C__.snapshot());
  await page.goto(base + '?seed=42&paused=1'); await ready();
  out.environment = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, touchPoints: navigator.maxTouchPoints, coarse: matchMedia('(pointer: coarse)').matches, userAgent: navigator.userAgent }));
  check('touch device emulation active', out.environment.touchPoints > 0 && out.environment.coarse, out.environment);
  const box = await page.locator('#stage').boundingBox();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  const activation = await state();
  check('real touchscreen tap activates beacon once', activation.phase === 'beacon' && activation.events.length === 1 && activation.events[0].source === 'touch', activation.events);
  await page.screenshot({ path: 'output/playwright/mobile-beacon.png' });
  await page.evaluate(() => window.__Q3C__.step(6.4));
  const capsule = await state();
  check('touch-started intro reaches same four legs and eye', capsule.phase === 'capsule' && capsule.pose.legs.length === 4 && capsule.pose.eye.id === 'optical-head', { phase: capsule.phase, ids: capsule.pose.legs.map(l => l.id), eye: capsule.pose.eye.id });
  await page.touchscreen.tap(box.x + 15, box.y + 50); await page.evaluate(() => window.__Q3C__.step(.8));
  const left = await state();
  await page.touchscreen.tap(box.x + box.width - 15, box.y + 50); await page.evaluate(() => window.__Q3C__.step(.8));
  const right = await state();
  check('touch changes gaze without reactivation/reset', left.pose.eye.gazeX < 0 && right.pose.eye.gazeX > 0 && right.events.filter(e => e.type === 'activate').length === 1, { left: left.pose.eye.gazeX, right: right.pose.eye.gazeX, tick: right.tick });
  await page.getByRole('button', { name: 'Заново' }).tap();
  const reset = await state();
  check('touch restart clears state', reset.phase === 'waiting' && reset.tick === 0 && reset.events.length === 0);
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  check('touch starts again after restart', (await state()).events[0]?.source === 'touch');
  await page.goto(base + '?seed=42'); await ready();
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  for (const target of [1.45, 3.225, 5.1, 6.4, 8.4]) {
    await page.waitForFunction(t => window.__Q3C__.snapshot().time >= t, target);
    const s = await state();
    out.live.push({ time: s.time, phase: s.phase, body: s.pose.body, eye: s.pose.eye, feet: s.pose.legs.map(l => l.world.foot) });
    await page.screenshot({ path: `output/playwright/mobile-live-${target}.png` });
  }
  check('real-time touch route and idle', out.live.at(-1).phase === 'capsule' && out.live.at(-1).body.y !== out.live.at(-2).body.y);
  out.layout = await page.evaluate(() => ({ width: innerWidth, height: innerHeight, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, stage: (() => { const r = document.querySelector('#stage').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, bottom: r.bottom }; })(), errorVisible: !document.querySelector('#error').hidden }));
  check('portrait scene fits width and viewport', out.layout.scrollWidth <= out.layout.width && out.layout.stage.bottom <= out.layout.height && !out.layout.errorVisible, out.layout);
  check('console and page errors', out.console.length === 0, out.console);
  return out;
}
