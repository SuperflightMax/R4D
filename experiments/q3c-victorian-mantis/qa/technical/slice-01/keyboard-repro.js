async (page) => {
  await page.goto('http://127.0.0.1:4194/?seed=42');
  await page.waitForFunction(() => window.__Q3C__?.ready);
  await page.locator('#stage').click();
  await page.waitForFunction(() => window.__Q3C__.snapshot().phase === 'capsule');
  await page.getByRole('button', { name: 'Заново' }).click();
  await page.keyboard.press('a');
  await page.waitForTimeout(250);
  const failed = await page.evaluate(() => ({ snapshot: window.__Q3C__.snapshot(), focus: document.activeElement?.id, hint: document.querySelector('#hint').textContent }));
  await page.screenshot({ path: 'output/playwright/keyboard-after-restart.png' });
  await page.locator('#stage').click();
  const pointerWorkaround = await page.evaluate(() => window.__Q3C__.snapshot().active);
  return { candidate: 'c79af101d944c121d9dc6b7e203d393a45baf8e5', paused: false, observedPhase: failed.snapshot.phase, focus: failed.focus, events: failed.snapshot.events, hint: failed.hint, pointerWorkaround, reproduces: failed.snapshot.phase === 'waiting' && failed.snapshot.events.length === 0 };
}
