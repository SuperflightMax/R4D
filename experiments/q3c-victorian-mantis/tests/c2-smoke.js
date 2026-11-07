// Playwright CLI: run-code --filename=c2-smoke.js (cwd: tests).
async (page) => {
  const browser = page.context().browser();
  const origin = new URL(page.url()).origin;
  const result = [];
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const sizes = [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 360, height: 732 }];
  const tokens = state => Object.values(state.render.parts).map(part => part.token).join(',');
  const point = ([a, b, c, d, x, y], px, py) => [a * px + c * py + x, b * px + d * py + y];
  for (const viewport of sizes) {
    const touch = viewport.width < 600;
    const context = await browser.newContext({ viewport, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1 });
    const target = await context.newPage();
    const errors = [];
    target.on('pageerror', error => errors.push(error.message));
    target.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    target.on('requestfailed', request => errors.push(`${request.url()} ${request.failure()?.errorText}`));
    target.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    const prefix = `output/playwright/c2-live-${viewport.width}x${viewport.height}`;
    try {
      await target.goto(origin + '/?seed=42');
      await target.waitForFunction(() => window.__Q3C__?.ready);
      const snapshot = () => target.evaluate(() => window.__Q3C__.snapshot());
      const trace = () => target.evaluate(() => window.__Q3C__.trace());
      const assets = await target.evaluate(() => window.__Q3C__.assets);
      const waiting = await trace();
      const ids = Object.keys(waiting.pose.parts).join(',');
      check(assets.id === 'q3c.full-rig.v1' && assets.nodes === 98 && assets.textures === 64, 'Production rig failed to bind');
      check(Object.keys(waiting.render.parts).length === 98 && new Set(tokens(waiting).split(',')).size === 98, 'Rendered identities are missing');
      check(waiting.phase === 'waiting' && waiting.tick === 0, 'Scene started without input');
      await target.screenshot({ path: `${prefix}-waiting.png` });
      const scene = target.getByRole('region');
      if (touch) await scene.tap({ position: { x: 110, y: 140 } });
      else await scene.click({ position: { x: 110, y: 140 } });
      for (const time of [3.15, 3.55, 4.15]) {
        await target.waitForFunction(t => window.__Q3C__.snapshot().time >= t, time);
        await target.screenshot({ path: `${prefix}-leg-${time}.png` });
      }
      const unfold = target.getByRole('button', { name: 'Раскрыться', exact: true });
      await unfold.waitFor({ state: 'visible' });
      const capsule = await snapshot();
      check(capsule.phase === 'capsule' && capsule.events[0].source === (touch ? 'touch' : 'mouse'), 'Capsule intro failed');
      await target.waitForFunction(time => window.__Q3C__.snapshot().time > time + 1.1, capsule.time);
      const capsuleIdle = await trace();
      check(capsuleIdle.pose.parts['eye.brow'].local.rotation !== capsule.pose.parts['eye.brow'].local.rotation, 'Capsule idle froze');
      const hatchSetpoint = capsuleIdle.pose.motion['eye.front_hatch.open'] * Math.PI / 180;
      check(capsuleIdle.render.parts['eye.lens'].surface === 'eye-glass' && capsuleIdle.pose.eye.extension > .8 &&
        Math.abs(Math.abs(capsuleIdle.pose.lid.angle) - hatchSetpoint) < 1e-6, 'K0 lens and hatch did not reach their authored seats');
      await target.screenshot({ path: `${prefix}-capsule.png` });
      if (touch) await unfold.tap();
      else await unfold.press('Enter');
      const beats = [];
      for (const beat of ['K0', 'K1', 'K2', 'K3', 'K4', 'K5']) {
        await target.waitForFunction(id => window.__Q3C__.snapshot().pose.beat === id, beat);
        const state = await trace();
        check(Object.keys(state.pose.parts).join(',') === ids, `Inventory changed at ${beat}`);
        check(tokens(state) === tokens(waiting), `Render objects changed at ${beat}`);
        check(state.planted.length === 4 && state.pose.legs.every(leg => leg.planted && Math.abs(leg.world.foot.y) < 1e-6), `Lost support at ${beat}`);
        beats.push({ beat, elapsed: state.pose.transformTime, eyeY: state.pose.eye.y });
        await target.screenshot({ path: `${prefix}-${beat}.png` });
      }
      const mantis = await trace();
      check(mantis.phase === 'mantis' && mantis.events.filter(event => event.type === 'transform').length === 1, 'Transform did not finish once');
      const nearTip = point(mantis.render.parts['rapt.near.tibia'].matrix, 88, 0);
      const farTip = point(mantis.render.parts['rapt.far.tibia'].matrix, 88, 0);
      const tipGap = Math.hypot(nearTip[0] - farTip[0], nearTip[1] - farTip[1]);
      check(tipGap > 38, `Blade tips collapsed to ${tipGap} rig units`);
      await target.waitForFunction(time => window.__Q3C__.snapshot().time > time + 1.1, mantis.time);
      const idle = await snapshot();
      check(idle.pose.parts['rapt.near.tibia'].local.rotation !== mantis.pose.parts['rapt.near.tibia'].local.rotation, 'Mantis idle froze');
      check(await target.evaluate(() => document.documentElement.scrollWidth === innerWidth), 'Viewport overflow');
      const restart = target.getByRole('button', { name: 'Заново', exact: true });
      if (touch) await restart.tap();
      else await restart.click();
      check((await snapshot()).phase === 'waiting', 'Restart did not reset the transformed rig');
      await target.keyboard.press('a');
      check((await snapshot()).events[0]?.source === 'keyboard', 'Keyboard restart regression');
      await target.keyboard.press('Enter');
      check((await snapshot()).phase === 'waiting', 'Enter lost the native restart action');
      if (!touch) {
        await target.evaluate(() => window.__Q3C__.seek(7));
        await target.keyboard.press('e');
        const shortcut = await snapshot();
        check(shortcut.phase === 'transforming' && shortcut.events.at(-1)?.source === 'keyboard', 'E did not start the transform');
      }
      check(!errors.length, errors.join('; '));
      result.push({ viewport, touch, assets, beats, tipGap, errors });
    } finally {
      await context.close();
    }
  }

  await page.setViewportSize(sizes[0]);
  await page.goto(origin + '/?seed=42&paused=1');
  await page.waitForFunction(() => window.__Q3C__?.ready);
  await page.keyboard.press('a');
  const before = await page.evaluate(() => {
    window.__Q3C__.step(7);
    return window.__Q3C__.trace();
  });
  await page.getByRole('button', { name: 'Раскрыться', exact: true }).click();
  const download = page.waitForEvent('download');
  const traceResult = await page.evaluate(preAction => {
    const q = window.__Q3C__;
    const first = q.trace();
    const frames = [first];
    const { hz, beatOffsets } = q.timing;
    let offset = 0;
    for (const marker of [...Object.values(beatOffsets).slice(1), beatOffsets.K5 + hz]) {
      q.step((marker - offset) / hz);
      frames.push(q.trace());
      offset = marker;
    }
    const data = { assets: q.assets, timing: q.timing, viewport: [innerWidth, innerHeight], preAction, frames };
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = 'c2-render-trace.json';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return {
      exactAction: first.tick === preAction.tick && JSON.stringify(first.render.parts) === JSON.stringify(preAction.render.parts),
      keyTicks: first.keyTicks,
      frames: frames.map(frame => ({ tick: frame.tick, beat: frame.pose.beat })),
    };
  }, before);
  check(traceResult.exactAction, 'Rendered matrices or identities jumped at the action tick');
  check(traceResult.frames.slice(0, 6).every(frame => traceResult.keyTicks[frame.beat] === frame.tick), 'Trace beat ticks do not match native ticks');
  await (await download).saveAs('output/playwright/c2-render-trace.json');
  result.push({ trace: traceResult });
  return result;
}
