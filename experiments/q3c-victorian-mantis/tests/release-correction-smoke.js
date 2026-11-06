// Playwright CLI: run-code --filename=release-correction-smoke.js (cwd: tests).
async (page) => {
  const browser = page.context().browser();
  const results = [];
  const check = (condition, message) => { if (!condition) throw new Error(message); };
  for (const viewport of [{ width: 1280, height: 720 }, { width: 390, height: 844 }, { width: 360, height: 732 }]) {
    const touch = viewport.width < 600;
    const context = await browser.newContext({ viewport, isMobile: touch, hasTouch: touch, deviceScaleFactor: 1 });
    const target = await context.newPage();
    const errors = [];
    target.on('pageerror', error => errors.push(error.message));
    target.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    const prefix = `output/playwright/correction-${viewport.width}x${viewport.height}`;
    try {
      await target.goto('http://127.0.0.1:4187/?seed=42');
      await target.waitForFunction(() => window.__Q3C__?.ready);
      await target.waitForTimeout(600);
      const snapshot = () => target.evaluate(() => window.__Q3C__.snapshot());
      const waiting = await snapshot();
      check(waiting.phase === 'waiting' && waiting.time === 0, 'Initial waiting was activated without input');
      await target.screenshot({ path: `${prefix}-waiting.png` });
      const region = target.getByRole('region');
      const input = () => touch ? region.tap({ position: { x: 100, y: 140 } }) : region.click({ position: { x: 100, y: 140 } });
      const restartButton = target.getByRole('button', { name: 'Заново', exact: true });
      const restart = () => touch ? restartButton.tap() : restartButton.click();
      await input();
      const activated = await snapshot();
      check(activated.events[0]?.source === (touch ? 'touch' : 'mouse'), 'Wrong first input source');
      const entry = [];
      for (const time of [.4, .65, .9]) {
        await target.waitForFunction(t => window.__Q3C__.snapshot().time >= t, time);
        const state = await snapshot();
        entry.push({ time: state.time, y: state.pose.body.y });
        await target.screenshot({ path: `${prefix}-entry-${time}.png` });
      }
      await target.waitForFunction(() => window.__Q3C__.snapshot().phase === 'capsule');
      await restart();
      const restarted = await snapshot();
      check(restarted.phase === 'waiting' && restarted.tick === 0 && restarted.events.length === 0, 'Restart did not clear the scene');
      await target.screenshot({ path: `${prefix}-restarted.png` });
      check(await target.evaluate(() => document.activeElement.id === 'restart'), 'Regression must test the focused restart button');
      await target.keyboard.press('a');
      const keyboard = await snapshot();
      check(keyboard.phase === 'beacon' && keyboard.events.filter(e => e.type === 'activate').length === 1 && keyboard.events[0].source === 'keyboard', 'A after restart failed or activated twice');
      for (const key of ['Enter', 'Space']) {
        await target.keyboard.press(key);
        const nativeReset = await snapshot();
        check(nativeReset.phase === 'waiting' && nativeReset.events.length === 0, `${key} must reset through the button without activating the beacon`);
      }
      await target.keyboard.press('b');
      check((await snapshot()).events[0]?.source === 'keyboard', 'Ordinary key after native reset failed');
      await restart();
      await input();
      await input();
      const repeated = await snapshot();
      check(repeated.events.filter(e => e.type === 'activate').length === 1, 'Repeated pointer/touch restarted the intro');
      check(errors.length === 0, `Browser errors: ${errors.join('; ')}`);
      results.push({ viewport, touch, waitingY: waiting.pose.body.y, entry, restart: restarted.phase, keyboard: keyboard.phase, nativeReset: 'Enter/Space pass', repeatedActivations: 1, errors });
    } finally {
      await context.close();
    }
  }
  return results;
}
