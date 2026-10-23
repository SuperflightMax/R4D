async (page) => {
  const observations=[];
  const save=async id=>{const s=await page.evaluate(()=>{const s=window.__Q6.snapshot();delete s.manifest;return s;});observations.push({id,state:s});};
  await page.locator('#mode').selectOption('joint');await page.getByRole('button',{name:'Сброс bind',exact:true}).click();
  await page.locator('#state').selectOption('extreme_flexion');await page.evaluate(()=>window.__Q6.advance(.19));await save('half-before');
  await page.locator('#state').selectOption('jump_phase');await save('retarget-immediate');
  await page.getByRole('button',{name:'Шаг 1/60 с',exact:true}).click();await save('one-ui-step');
  await page.evaluate(()=>window.__Q6.advance(.16));await save('intermediate');
  await page.locator('#state').selectOption('extreme_extension');await save('second-retarget-immediate');
  await page.getByRole('button',{name:'Играть ↔ bind',exact:true}).click();await page.waitForTimeout(160);await save('live-160ms');
  await page.getByRole('button',{name:'Пауза',exact:true}).click();await save('pause');await page.waitForTimeout(150);await save('pause-later');
  await page.getByRole('button',{name:'Шаг 1/60 с',exact:true}).click();await save('paused-step');
  return {observations,note:'Telemetry-only remainder after original screenshots: initial run-code console.log did not export its local observation array. No repeat of full pose/background/method matrix. These states do not retroactively timestamp original live screenshots.'};
}
