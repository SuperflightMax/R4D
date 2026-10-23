async (page) => {
  await page.locator('#mode').selectOption('joint');
  await page.locator('#zoom').selectOption('target');
  await page.locator('#theme').selectOption('light');
  await page.locator('#reset').click();
  await page.locator('#state').selectOption('extreme_flexion');
  await page.locator('#play').click();
  await page.waitForTimeout(145);
  await page.locator('#state').selectOption('jump_phase');
  await page.waitForTimeout(145);
  await page.locator('#state').selectOption('step_overlap');
  await page.waitForTimeout(100);
  await page.locator('#play').click();
  const file='experiments/q6-single-joint/qa/visual/output/playwright/live-mid-retarget.png';
  await page.locator('#panels').screenshot({path:file});
  const snapshot=await page.evaluate(()=>{const s=window.__Q6.snapshot();delete s.manifest;return s;});
  const events=await page.evaluate(()=>window.__VQ_EVENTS);
  await page.locator('#mode').selectOption('diagnostic');
  await page.locator('#reset').click();
  await page.locator('#pivots').check();
  await page.locator('#bones').check();
  await page.locator('#layers').check();
  await page.locator('#panels').screenshot({path:'experiments/q6-single-joint/qa/visual/output/playwright/diagnostic-bind-axes.png'});
  return {file,snapshot,events};
}
