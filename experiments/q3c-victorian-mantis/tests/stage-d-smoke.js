// Playwright CLI run-code from tests, with the production preview open.
async page => {
  const origin = new URL(page.url()).origin;
  const browser = page.context().browser();
  const check = (ok, message) => { if (!ok) throw new Error(message); };
  const runs = [];
  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }, { width: 360, height: 732 }]) {
    const touch = viewport.width < 600;
    const context = await browser.newContext({ viewport, hasTouch: touch, isMobile: touch });
    const target = await context.newPage();
    const errors = [];
    target.on('pageerror', error => errors.push(error.message));
    target.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    target.on('requestfailed', request => errors.push(request.url()));
    target.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
    try {
      await target.goto(origin + '/?seed=42');
      await target.waitForFunction(() => window.__Q3C__?.ready);
      const scene = target.getByRole('region');
      const button = name => target.getByRole('button', { name, exact: true });
      const act = locator => touch ? locator.tap() : locator.click();
      const snapshot = () => target.evaluate(() => window.__Q3C__.snapshot());
      const folder = `output/playwright/stage-d/${viewport.width}x${viewport.height}`;
      await act(scene);
      await button('Раскрыться').waitFor();
      if (touch) await act(button('Вправо →'));
      else await target.keyboard.press('ArrowRight');
      await target.waitForFunction(() => {
        const s = window.__Q3C__.snapshot();
        return s.walk.x === 24 && !s.walk.step && s.pose.legs.every(leg => leg.planted);
      });
      if (touch) await act(button('Раскрыться'));
      else await target.keyboard.press('e');
      await button('Схватить').waitFor();
      const field = await scene.boundingBox();
      const first = await snapshot();
      check(first.phase === 'mantis' && first.moth?.id === 'moth-1', 'Missing first moth');
      await target.screenshot({ path: `${folder}/moth.png` });
      if (touch) await act(button('Схватить'));
      else {
        const point = await target.evaluate(() => {
          const { moth, render } = window.__Q3C__.trace();
          const { scale, x, y } = render.camera;
          return { x: x + scale * moth.position.x, y: y + scale * moth.position.y };
        });
        await scene.click({ position: point });
      }
      await target.waitForFunction(() => window.__Q3C__.snapshot().impact?.victimId === 'moth-1');
      const impact = (await snapshot()).impact;
      await target.screenshot({ path: `${folder}/impact.png` });
      check(JSON.stringify(await scene.boundingBox()) === JSON.stringify(field), 'Hunt status moved the scene');
      await button('Ещё мотылёк').waitFor();
      if (touch) await act(button('Ещё мотылёк'));
      else await target.keyboard.press('r');
      check((await snapshot()).moth?.id === 'moth-2', 'Repeat did not release a distinct moth');
      if (touch) await act(button('Схватить'));
      else await target.keyboard.press('h');
      await target.waitForFunction(() => window.__Q3C__.snapshot().impact?.victimId === 'moth-2');
      await button('Ещё мотылёк').waitFor();
      const second = (await snapshot()).impact;
      await act(button('Заново'));
      const reset = await snapshot();
      check(reset.phase === 'waiting' && reset.tick === 0 && !reset.moth && !reset.impact && reset.walk.x === 0, 'Full restart left state behind');
      await act(scene);
      check((await snapshot()).active, 'The first action after restart was lost');
      check(await target.evaluate(() => document.documentElement.scrollWidth === innerWidth), 'Horizontal overflow');
      check(!errors.length, errors.join('\n'));
      runs.push({ viewport, touch, spawn: first.moth.home, hits: [impact.contactWorldXY, second.contactWorldXY], errors });
    } finally {
      await context.close();
    }
  }
  return runs;
}
