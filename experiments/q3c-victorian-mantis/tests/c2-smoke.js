// Playwright CLI: run-code --filename=c2-smoke.js (cwd: tests).
async (page) => {
  const browser = page.context().browser();
  const origin = new URL(page.url()).origin;
  const result = [];
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const sizes = [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 360, height: 732 }];
  const tokens = state => Object.values(state.render.parts).map(part => part.token).join(',');
  const point = ([a, b, c, d, x, y], px, py) => [a * px + c * py + x, b * px + d * py + y];
  const routes = ['no-preference', 'reduce'].flatMap(reducedMotion => sizes.map(viewport => ({ viewport, reducedMotion })));
  const bladeGaps = ({ render }) => [0, 44, 88].map(x => {
    const near = point(render.parts['rapt.near.tibia'].matrix, x, 0);
    const far = point(render.parts['rapt.far.tibia'].matrix, x, 0);
    return Math.hypot(near[0] - far[0], near[1] - far[1]);
  });
  const output = 'output/playwright/c2-correction/after';
  for (const { viewport, reducedMotion } of routes) {
    const touch = viewport.width < 600;
    const normal = reducedMotion === 'no-preference';
    const context = await browser.newContext({ viewport, hasTouch: touch, isMobile: touch, deviceScaleFactor: 1, reducedMotion });
    const target = await context.newPage();
    const errors = [];
    target.on('pageerror', error => errors.push(error.message));
    target.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    target.on('requestfailed', request => errors.push(`${request.url()} ${request.failure()?.errorText}`));
    target.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
    const prefix = `${output}/${normal ? 'normal' : 'reduced'}/${viewport.width}x${viewport.height}`;
    try {
      await target.goto(origin + '/?seed=42');
      await target.waitForFunction(() => window.__Q3C__?.ready);
      check(await target.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches) === !normal, 'Motion preference was not applied');
      const snapshot = () => target.evaluate(() => window.__Q3C__.snapshot());
      const trace = () => target.evaluate(() => window.__Q3C__.trace());
      const assets = await target.evaluate(() => window.__Q3C__.assets);
      const waiting = await trace();
      const ids = Object.keys(waiting.pose.parts).join(',');
      check(assets.id === 'q3c.full-rig.v1' && assets.nodes === 98 && assets.textures === 64, 'Production rig failed to bind');
      check(Object.keys(waiting.render.parts).length === 98 && new Set(tokens(waiting).split(',')).size === 98, 'Rendered identities are missing');
      check(waiting.phase === 'waiting' && waiting.tick === 0, 'Scene started without input');
      await target.screenshot({ path: `${prefix}/waiting.png` });
      const scene = target.getByRole('region');
      if (touch) await scene.tap({ position: { x: 110, y: 140 } });
      else await scene.click({ position: { x: 110, y: 140 } });
      const legFrames = [];
      const legTimes = touch ? [2.83, 3.05, 3.27, 3.49, 3.71, 3.93, 4.14, 4.35] : [2.83, 3.30, 3.75, 4.35];
      const captureBudget = touch ? .35 : .55;
      for (const time of normal ? legTimes : []) {
        await target.waitForFunction(t => window.__Q3C__.snapshot().time >= t, time);
        const state = await snapshot();
        check(state.phase === 'legs' && state.time < time + captureBudget, `Missed leg inspection at ${time}s: ${state.time}s`);
        legFrames.push(state.time);
        await target.screenshot({ path: `${prefix}/leg-${time}.jpg`, quality: 94 });
      }
      const unfold = target.getByRole('button', { name: 'Раскрыться', exact: true });
      await unfold.waitFor({ state: 'visible' });
      const capsule = await snapshot();
      check(capsule.phase === 'capsule' && capsule.events[0].source === (touch ? 'touch' : 'mouse'), 'Capsule intro failed');
      const capsuleHold = normal ? (touch ? 8.11 : 12) : 1.1;
      await target.waitForFunction(time => window.__Q3C__.snapshot().time >= time, capsule.time + capsuleHold);
      const capsuleIdle = await trace();
      check(capsuleIdle.pose.parts['eye.brow'].local.rotation !== capsule.pose.parts['eye.brow'].local.rotation, 'Capsule idle froze');
      const hatchSetpoint = capsuleIdle.pose.motion['eye.front_hatch.open'] * Math.PI / 180;
      check(capsuleIdle.render.parts['eye.lens'].surface === 'eye-glass' && capsuleIdle.pose.eye.extension > .8 &&
        Math.abs(Math.abs(capsuleIdle.pose.lid.angle) - hatchSetpoint) < 1e-6, 'K0 lens and hatch did not reach their authored seats');
      await target.screenshot({ path: `${prefix}/capsule.png` });
      if (touch) await unfold.tap();
      else {
        for (let i = 0; i < 8 && !await unfold.evaluate(button => button === document.activeElement); i++) {
          await target.keyboard.press('Tab');
        }
        check(await unfold.evaluate(button => button.matches(':focus-visible')), 'Tab did not give the unfold button a visible focus');
        await target.keyboard.press(normal ? 'Space' : 'Enter');
      }
      const beats = [];
      const graspFrames = [];
      for (const beat of ['K0', 'K1', 'K2', 'K3', 'K4', 'K5']) {
        await target.waitForFunction(id => window.__Q3C__.snapshot().pose.beat === id, beat);
        const state = await trace();
        check(Object.keys(state.pose.parts).join(',') === ids, `Inventory changed at ${beat}`);
        check(tokens(state) === tokens(waiting), `Render objects changed at ${beat}`);
        check(state.planted.length === 4 && state.pose.legs.every(leg => leg.planted && Math.abs(leg.world.foot.y) < 1e-6), `Lost support at ${beat}`);
        beats.push({ beat, elapsed: state.pose.transformTime, eyeY: state.pose.eye.y });
        if (beat === 'K4' || beat === 'K5') graspFrames.push({ elapsed: state.pose.transformTime, gaps: bladeGaps(state) });
        if (normal || beat === 'K0' || beat === 'K5') await target.screenshot({ path: `${prefix}/${beat}.jpg`, quality: 94 });
        if (normal && beat === 'K4') {
          for (const time of touch ? [3.43, 3.80] : [3.68]) {
            await target.waitForFunction(t => window.__Q3C__.snapshot().pose.transformTime >= t, time);
            const inspection = await trace();
            check(inspection.pose.beat === 'K4' && inspection.pose.transformTime < time + captureBudget,
              `Missed grasp inspection at ${time}s: ${inspection.pose.transformTime}s`);
            graspFrames.push({ elapsed: inspection.pose.transformTime, gaps: bladeGaps(inspection) });
            await target.screenshot({ path: `${prefix}/grasp-${time}.jpg`, quality: 94 });
          }
        }
      }
      const mantis = await trace();
      check(mantis.phase === 'mantis' && mantis.events.filter(event => event.type === 'transform').length === 1, 'Transform did not finish once');
      const finalGaps = bladeGaps(mantis);
      for (const { gaps } of graspFrames) {
        check(gaps[0] > 48 && gaps[1] > 58 && gaps[2] > 70, `Grasping chains overlap: ${gaps}`);
      }
      const mantisHold = normal && !touch ? 12 : 1.1;
      await target.waitForFunction(time => window.__Q3C__.snapshot().time >= time, mantis.time + mantisHold);
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
      result.push({ viewport, touch, reducedMotion, assets, legFrames, beats, graspFrames, finalGaps, capsuleHold, mantisHold, errors });
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
  await (await download).saveAs(`${output}/c2-render-trace.json`);
  result.push({ trace: traceResult });
  return result;
}
