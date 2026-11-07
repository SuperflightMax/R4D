async (page) => {
  const binding = null;
  const { sha, buildSha256, output } = binding;
  const base = 'http://127.0.0.1:4207/?seed=42&paused=1';
  const diagnostics = [];
  page.on('pageerror', e => diagnostics.push(e.message));
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) diagnostics.push(m.text()); });
  page.on('requestfailed', r => diagnostics.push(r.url()));
  page.on('response', r => { if (r.status() >= 400) diagnostics.push(r.url()); });
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(base);
  await page.waitForFunction(() => window.__Q3C__?.ready);
  await page.locator('#stage').click();
  const pending = page.waitForEvent('download', { timeout: 60_000 });
  const summary = await page.evaluate(async ({ sha, buildSha256 }) => {
    const q = window.__Q3C__;
    const hz = 120;
    q.step(282 / hz);
    const first = q.trace();
    const all = Object.keys(first.render.parts);
    const definition = Object.fromEntries(all.map(id => {
      const { token, parent, asset } = first.render.parts[id];
      return [id, [token, parent, asset]];
    }));
    const selected = all.filter(id => id === 'cradle' || /^(?:walk\..+\.(?:hip_fork|femur|tibia|foot|piston\.\w+)|bay\.walk\..+\.door)$/.test(id));
    const frames = [];
    const identityFlags = [];
    for (let i = 0; i <= 408; i++) {
      if (i) q.step(1 / hz);
      const frame = q.trace();
      for (const id of all) {
        const p = frame.render.parts[id];
        if (!p || definition[id].some((v, j) => v !== [p.token, p.parent, p.asset][j])) {
          identityFlags.push({ id, tick: frame.tick });
        }
      }
      frames.push({
        tick: frame.tick, phase: frame.phase, planted: frame.planted,
        parts: Object.fromEntries(selected.map(id => {
          const { matrix, physicalMatrix } = frame.render.parts[id];
          const roll = frame.pose.parts[id].local.roll;
          return [id, { matrix, physicalMatrix, roll }];
        })),
        legs: frame.pose.legs.map(({ id, sole, anchor, planted }) => ({ id, sole, anchor, planted }))
      });
    }
    const data = { sha, buildSha256, hz, seed: first.seed, definition, identityFlags, frames };
    const blob = await new Response(new Blob([JSON.stringify(data)]).stream().pipeThrough(new CompressionStream('gzip'))).blob();
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'intro.json.gz';
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
    return { firstTick: frames[0].tick, lastTick: frames.at(-1).tick, frames: frames.length, nodes: all.length, identityFlags };
  }, { sha, buildSha256 });
  await (await pending).saveAs(output + '/raw-intro.json.gz');
  return { sha, buildSha256, ...summary, diagnostics };
}
