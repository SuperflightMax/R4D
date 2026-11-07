async (page) => {
  // Bind a copy in the pinned run directory to the candidate's published hooks.
  const binding = null;
  if (!binding || !/^[0-9a-f]{40}$/.test(binding.sha) || binding.sha === '21fbafcfb435838bc84aed931fe68e57cae9fdbc') {
    throw new Error('Bind the exact Builder SHA supplied by CTO before collection.');
  }
  const { sha, buildSha256, kind, mode, viewport, seed, tag, hz, introLimitTicks, transformTicks, idleTicks, capsulePhase, mantisPhase, actionName } = binding;
  const output = binding.output.replaceAll('\\', '/');
  const zone = 'D:/dev/R4D/experiments/q3c-victorian-mantis/qa/technical/stage-c/.local/';
  if (!output.toLowerCase().startsWith(zone.toLowerCase()) || output.split('/').includes('..') || !/^[a-z0-9-]+$/.test(tag)) {
    throw new Error('Select a run directory in the Stage C QA zone and a simple tag.');
  }
  const url = new URL(binding.url);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port ||
      !['live', 'trace'].includes(kind) || !['pointer', 'keyboard', 'touch'].includes(mode) ||
      !/^[0-9a-f]{64}$/.test(buildSha256) || !Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff ||
      !Number.isInteger(hz) || hz < 1 || hz > 480 ||
      ![introLimitTicks, transformTicks, idleTicks].every(n => Number.isInteger(n) && n > 1 && n <= 30 * hz) ||
      idleTicks < 12 * hz + 1 || !capsulePhase || !mantisPhase || !actionName) {
    throw new Error('Complete the candidate binding, including bounded tick counts.');
  }

  const diagnostics = { console: [], pageErrors: [], failedRequests: [], badResponses: [] };
  page.on('console', m => {
    if (['error', 'warning'].includes(m.type())) diagnostics.console.push({ type: m.type(), text: m.text(), url: m.location().url });
  });
  page.on('pageerror', e => diagnostics.pageErrors.push(e.message));
  page.on('requestfailed', r => diagnostics.failedRequests.push({ url: r.url(), failure: r.failure() }));
  page.on('response', r => { if (r.status() >= 400) diagnostics.badResponses.push({ url: r.url(), status: r.status() }); });
  await page.setViewportSize(viewport);
  url.searchParams.set('seed', String(seed));
  if (kind === 'trace') url.searchParams.set('paused', '1');
  else url.searchParams.delete('paused');
  await page.goto(url.href);
  await page.waitForFunction(() => window.__Q3C__?.ready);
  const snapshot = () => page.evaluate(() => window.__Q3C__.snapshot());
  const rendered = () => page.evaluate(() => window.__Q3C__.trace());
  const stateSummary = async () => {
    const s = await snapshot();
    return { tick: s.tick, seed: s.seed, phase: s.phase, events: s.events };
  };
  const phase = phaseName => page.waitForFunction(name => window.__Q3C__.snapshot().phase === name, phaseName);
  const inputs = [];
  const live = {};
  const layout = await page.evaluate(() => ({
    viewport: [innerWidth, innerHeight], scrollWidth: document.documentElement.scrollWidth,
    touchPoints: navigator.maxTouchPoints, coarsePointer: matchMedia('(pointer: coarse)').matches
  }));
  if (mode === 'touch' && (!layout.touchPoints || !layout.coarsePointer)) throw new Error('Select a touch-emulated context.');
  const waiting = await stateSummary();
  if (waiting.phase !== 'waiting' || waiting.seed !== seed) throw new Error('Fresh waiting phase and explicit seed required.');
  const hiddenInWaiting = !(await page.getByRole('button', { name: actionName, exact: true }).isVisible());
  const assets = await page.evaluate(() => ({ ...window.__Q3C__.assets, timing: window.__Q3C__.timing }));
  if (kind === 'live') await page.screenshot({ path: output + '/' + tag + '-waiting.png' });
  if (kind === 'trace') await page.evaluate(() => window.__Q3C__.pause());

  const stage = page.locator(binding.stageSelector || '#stage');
  if (mode === 'touch') await stage.tap();
  else if (mode === 'keyboard') await page.keyboard.press(binding.firstKey || 'a');
  else await stage.click();
  inputs.push({ action: 'start', mode, tick: waiting.tick });

  if (kind === 'trace') {
    await page.evaluate(({ target, hz, limit }) => {
      const q = window.__Q3C__;
      for (let i = 0; i < limit && q.snapshot().phase !== target; i++) q.step(1 / hz);
      if (q.snapshot().phase !== target) throw new Error('Capsule phase did not arrive within the bound.');
    }, { target: capsulePhase, hz, limit: introLimitTicks });
  } else {
    await page.waitForFunction(() => window.__Q3C__.snapshot().time >= 1.45);
    const contact = await snapshot();
    live.delivery = { tick: contact.tick, phase: contact.phase, body: contact.pose.body, contactY: contact.pose.contactY };
    await page.screenshot({ path: output + '/' + tag + '-contact.png' });
    await page.waitForFunction(() => window.__Q3C__.snapshot().time >= 3.225);
    await page.screenshot({ path: output + '/' + tag + '-legs.png' });
    await phase(capsulePhase);
  }

  // The download transfers QA observations to the run directory.
  // Scene actions above and below use the public UI.
  const capture = async (section, ticks, preAction = null) => {
    const pending = page.waitForEvent('download', { timeout: 60_000 });
    const result = await page.evaluate(async ({ section, ticks, hz, sha, buildSha256, tag, seed, inputs, preAction, viewport }) => {
      const q = window.__Q3C__;
      const frames = [];
      for (let i = 0; i < ticks; i++) {
        if (i) q.step(1 / hz);
        frames.push(q.trace());
      }
      const data = { sha, buildSha256, tag, seed, viewport, hz, section, inputs, preAction, frames };
      const plain = new Blob([JSON.stringify(data)], { type: 'application/json' });
      const blob = await new Response(plain.stream().pipeThrough(new CompressionStream('gzip'))).blob();
      const anchor = document.createElement('a');
      anchor.href = URL.createObjectURL(blob);
      anchor.download = section + '.json.gz';
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
      return { section, samples: frames.length, firstTick: frames[0].tick, lastTick: frames.at(-1).tick, lastPhase: frames.at(-1).phase };
    }, { section, ticks, hz, sha, buildSha256, tag, seed, inputs, preAction, viewport });
    const download = await pending;
    await download.saveAs(output + '/raw-' + tag + '-' + section + '.json.gz');
    return result;
  };

  const captures = [];
  if (kind === 'trace') {
    await page.evaluate(hz => window.__Q3C__.step(Math.ceil(0.75 * hz) / hz), hz);
    captures.push(await capture('capsuleIdle', idleTicks));
  } else {
    const a = await snapshot();
    await page.waitForTimeout(binding.liveIdleMs ?? 1500);
    const b = await snapshot();
    live.capsule = [a, b].map(s => ({ tick: s.tick, body: s.pose.body, eye: s.pose.eye, idle: s.pose.idle }));
    await page.screenshot({ path: output + '/' + tag + '-K0.png' });
  }

  const action = page.getByRole('button', { name: actionName, exact: true });
  if (await action.count() !== 1 || !await action.isVisible() || !await action.isEnabled()) {
    throw new Error('A single visible, enabled transform button with an accessible name is required.');
  }
  if (mode === 'keyboard') {
    for (let n = 0; n < 12 && !await action.evaluate(el => el === document.activeElement); n++) {
      await page.keyboard.press('Tab');
    }
    if (!await action.evaluate(el => el === document.activeElement)) throw new Error('Transform is not reachable via Tab.');
  }
  const preAction = await rendered();
  if (mode === 'keyboard') await page.keyboard.press('Enter');
  else if (mode === 'touch') await action.tap();
  else await action.click();
  inputs.push({ action: 'transform', mode, tick: preAction.tick });

  if (kind === 'trace') {
    const transition = await capture('transform', transformTicks, preAction);
    captures.push(transition);
    if (transition.lastPhase !== mantisPhase) throw new Error('The direct action did not reach mantis within the bound.');
    captures.push(await capture('mantisIdle', idleTicks));
  } else {
    const started = await rendered();
    live.before = { tick: preAction.tick, phase: preAction.phase, tokens: Object.fromEntries(Object.entries(preAction.render.parts).map(([id, p]) => [id, p.token])) };
    live.started = { tick: started.tick, phase: started.phase, events: started.events, keyTicks: started.keyTicks };
    if (!started.keyTicks) throw new Error('Missing transform lifecycle on direct input.');
    if (mode !== 'touch') await page.keyboard.press('e');
    live.keys = [];
    for (const name of ['K1', 'K2', 'K3', 'K4', 'K5']) {
      await page.waitForFunction(tick => window.__Q3C__.snapshot().tick >= tick, started.keyTicks[name]);
      const s = await rendered();
      live.keys.push({ name, tick: s.tick, beat: s.pose.beat, planted: s.planted, eye: s.pose.eye, camera: s.render.camera });
      await page.screenshot({ path: output + '/' + tag + '-' + name + '.png' });
    }
    await phase(mantisPhase);
    const a = await rendered();
    await page.waitForTimeout(binding.liveIdleMs ?? 1500);
    const b = await rendered();
    live.mantis = [a, b].map(s => ({ tick: s.tick, body: s.pose.body, eye: s.pose.eye, idle: s.pose.idle }));
    live.after = { tick: b.tick, phase: b.phase, planted: b.planted, events: b.events, tokens: Object.fromEntries(Object.entries(b.render.parts).map(([id, p]) => [id, p.token])) };
    const restart = page.getByRole('button', { name: 'Заново' });
    if (mode === 'touch') await restart.tap();
    else await restart.click();
    live.restart = await stateSummary();
    if (mode === 'keyboard') {
      await page.keyboard.press('a');
      live.keyAfterRestart = await stateSummary();
    }
  }
  return { sha, buildSha256, tag, kind, seed, layout, assets, hiddenInWaiting, inputs, captures, live, end: await stateSummary(), diagnostics };
}
