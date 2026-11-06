async (page) => {
  const base = 'http://127.0.0.1:4195/?seed=42';
  const mobile = new URL(page.url()).searchParams.get('qa_input') === 'touch';
  const out = { candidate: '4a26f1cb789a4b41d09e7b7c9ac1905680d965b4', mode: mobile ? 'Chrome touch emulation' : 'Chrome desktop', checks: [], keyboard: [], routes: [], console: [], networkFailures: [] };
  const check = (name, pass, details) => out.checks.push({ name, pass: !!pass, details });
  page.on('pageerror', e => out.console.push({ type: 'pageerror', message: e.message }));
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) out.console.push({ type: m.type(), message: m.text() }); });
  page.on('requestfailed', r => out.networkFailures.push({ url: r.url(), failure: r.failure() }));
  const ready = () => page.waitForFunction(() => window.__Q3C__?.ready);
  const state = () => page.evaluate(() => window.__Q3C__.snapshot());
  const reset = () => mobile ? page.getByRole('button', { name: 'Заново' }).tap() : page.getByRole('button', { name: 'Заново' }).click();
  const start = async () => {
    if (mobile) { const r = await page.locator('#stage').boundingBox(); await page.touchscreen.tap(r.x + r.width / 2, r.y + r.height / 2); }
    else await page.locator('#stage').click();
  };
  if (!mobile) {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(base); await ready();
    await page.keyboard.press('a');
    let s = await state();
    check('fresh ordinary keyboard activation', s.phase === 'beacon' && s.events.length === 1 && s.events[0].source === 'keyboard');
    for (const key of ['a', 'b']) {
      await reset();
      const focus = await page.evaluate(() => document.activeElement?.id);
      await page.keyboard.press(key);
      s = await state();
      out.keyboard.push({ key, focus, phase: s.phase, events: s.events });
      check(`TQ-01: ${key.toUpperCase()} after real restart click`, focus === 'restart' && s.phase === 'beacon' && s.events.length === 1 && s.events[0].source === 'keyboard');
      await page.keyboard.press(key);
      check(`repeated ${key.toUpperCase()} has one activation`, (await state()).events.filter(e => e.type === 'activate').length === 1);
    }
    await page.evaluate(() => {
      window.__technicalProbe = [];
      document.querySelector('#restart').addEventListener('click', e => { const s = window.__Q3C__.snapshot(); window.__technicalProbe.push({ type: 'click', trusted: e.isTrusted, detail: e.detail, activeBefore: s.active, eventsBefore: s.events }); }, true);
      window.addEventListener('keyup', e => { if (['Enter', ' '].includes(e.key)) { const s = window.__Q3C__.snapshot(); window.__technicalProbe.push({ type: 'keyup', key: e.key, active: s.active, events: s.events }); } }, true);
    });
    for (const key of ['Enter', 'Space']) {
      for (const fromActive of [false, true]) {
        await reset();
        if (fromActive) await page.keyboard.press('b');
        await page.evaluate(() => { window.__technicalProbe = []; });
        await page.keyboard.press(key);
        await page.waitForTimeout(60);
        s = await state();
        const probe = await page.evaluate(() => window.__technicalProbe);
        const clicks = probe.filter(x => x.type === 'click');
        const noTransientActivation = fromActive || probe.every(x => x.type === 'click' ? !x.activeBefore && x.eventsBefore.length === 0 : !x.active && x.events.length === 0);
        check(`${key} native restart from ${fromActive ? 'active' : 'waiting'}`, s.phase === 'waiting' && !s.active && s.events.length === 0 && clicks.length === 1 && clicks[0].trusted && clicks[0].detail === 0 && noTransientActivation, { key, fromActive, probe, phase: s.phase, events: s.events });
      }
    }
    await page.screenshot({ path: 'output/playwright/desktop-native-restart.png' });
  }
  const sizes = mobile ? [{ width: 390, height: 844 }, { width: 360, height: 732 }] : [{ width: 1280, height: 720 }];
  for (const size of sizes) {
    const tag = `${mobile ? 'touch' : 'desktop'}-${size.width}x${size.height}`;
    await page.setViewportSize(size);
    await page.goto(base + '&paused=1'); await ready();
    const waiting = await state();
    const layout = await page.evaluate(() => { const el = document.querySelector('#stage'); const scale = Math.min(el.clientWidth / 580, el.clientHeight / 520, 1.35); return { worldTop: -el.clientHeight * .75 / scale, width: innerWidth, height: innerHeight, touchPoints: navigator.maxTouchPoints, scrollWidth: document.documentElement.scrollWidth }; });
    check(`${tag}: whole packed rig above waiting viewport`, waiting.phase === 'waiting' && waiting.entryY + 160 <= layout.worldTop && layout.scrollWidth <= layout.width, { entryY: waiting.entryY, layout });
    await page.screenshot({ path: `output/playwright/${tag}-waiting.png` });
    await start();
    const beacon = await state();
    check(`${tag}: real ${mobile ? 'touch' : 'pointer'} start has no jump`, beacon.phase === 'beacon' && beacon.pose.body.y === waiting.pose.body.y && beacon.events.length === 1 && beacon.events[0].source === (mobile ? 'touch' : 'mouse'));
    const fallStart = await page.evaluate(() => window.__Q3C__.step(.4));
    const firstFall = await page.evaluate(() => window.__Q3C__.step(1 / 120));
    check(`${tag}: continuous first fall step`, fallStart.pose.body.y === waiting.pose.body.y && firstFall.pose.body.y > waiting.pose.body.y && firstFall.pose.body.y - waiting.pose.body.y < 1);
    await page.setViewportSize({ width: size.width + 40, height: size.height + 20 });
    const resized = await state();
    check(`${tag}: active resize preserves entry and world pose`, resized.entryY === firstFall.entryY && resized.tick === firstFall.tick && resized.pose.body.y === firstFall.pose.body.y);
    await page.setViewportSize(size);
    const contact = await page.evaluate(() => window.__Q3C__.step(1.05 - 1 / 120));
    check(`${tag}: same beacon contact after viewport-aware fall`, contact.phase === 'impact' && Math.abs(contact.pose.body.y + 82) < 1e-7 && contact.pose.body.x === contact.pose.beacon.x);
    await page.screenshot({ path: `output/playwright/${tag}-contact-step.png` });
    await page.goto(base); await ready();
    await start();
    await page.waitForFunction(() => window.__Q3C__.snapshot().time >= .9);
    const liveFall = await state();
    await page.screenshot({ path: `output/playwright/${tag}-live-fall.png` });
    await page.waitForFunction(() => window.__Q3C__.snapshot().time >= 1.45);
    const liveContact = await state();
    await page.screenshot({ path: `output/playwright/${tag}-live-contact.png` });
    check(`${tag}: ordinary-speed fall/contact smoke`, liveFall.phase === 'falling' && liveContact.phase === 'impact' && liveContact.pose.body.x === 0 && liveContact.pose.body.y + 82 <= 1e-7 && liveContact.events.filter(e => e.type === 'activate').length === 1);
    await reset();
    const resetState = await state();
    check(`${tag}: pointer/touch restart smoke`, resetState.phase === 'waiting' && resetState.tick === 0 && resetState.events.length === 0);
    await start();
    check(`${tag}: next real input starts once`, (await state()).events.filter(e => e.type === 'activate').length === 1);
    out.routes.push({ tag, entryY: waiting.entryY, worldTop: layout.worldTop, firstFall: { tick: firstFall.tick, y: firstFall.pose.body.y }, contact: { tick: contact.tick, y: contact.pose.body.y }, liveFall: { time: liveFall.time, y: liveFall.pose.body.y }, liveContact: { time: liveContact.time, y: liveContact.pose.body.y }, input: mobile ? 'touch' : 'mouse' });
  }
  check('console/page errors and warnings', out.console.length === 0, out.console);
  check('network failures', out.networkFailures.length === 0, out.networkFailures);
  return out;
}
