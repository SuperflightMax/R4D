async (page) => {
  const out='experiments/q6-single-joint/qa/visual/output/playwright/';
  const observations=[];
  async function capture(label,kind='paused exact target') {
    const file=out+label+'.png';
    await page.locator('#panels').screenshot({path:file});
    const state=await page.evaluate(()=>{const s=window.__Q6.snapshot();delete s.manifest;return s;});
    observations.push({label,kind,file,...state});
  }
  // Source/neutral only: this is NOT a fourth artwork choice.
  await page.locator('#mode').selectOption('diagnostic');
  await page.locator('#zoom').selectOption('target');
  await page.locator('#theme').selectOption('light');
  for(const pose of ['bind','extreme_flexion','jump_phase']) {
    await page.locator('#reset').click();
    await page.locator('#state').selectOption(pose);
    await page.evaluate(()=>window.__Q6.advance(.38));
    await capture('diagnostic-'+pose);
  }
  // Equal-background cross-check of the most informative J/M target and zoom cases.
  for(const mode of ['joint','method']) {
    await page.locator('#mode').selectOption(mode);
    for(const zoom of ['target','zoom']) {
      await page.locator('#zoom').selectOption(zoom);
      await page.locator('#theme').selectOption('dark');
      await page.locator('#reset').click();
      await page.locator('#state').selectOption('extreme_flexion');
      await page.evaluate(()=>window.__Q6.advance(.38));
      await capture(`background-${mode}-${zoom}-dark-flexion`);
    }
  }
  await page.setViewportSize({width:390,height:844});
  for(const mode of ['joint','method']) {
    await page.locator('#mode').selectOption(mode);
    await page.locator('#zoom').selectOption('target');
    const poses=['bind','extreme_extension','extreme_flexion','step_overlap','jump_phase'];
    for(let i=0;i<poses.length;i++) {
      const pose=poses[i],theme=i%2?'light':'dark';
      await page.locator('#theme').selectOption(theme);
      await page.locator('#reset').click();
      await page.locator('#state').selectOption(pose);
      await page.evaluate(()=>window.__Q6.advance(.38));
      await capture(`mobile-${mode}-target-${theme}-${pose}`);
      if(mode==='joint'&&pose==='bind')await page.screenshot({path:out+'mobile-viewport.png'});
    }
    await page.locator('#zoom').selectOption('zoom');
    await page.locator('#theme').selectOption('light');
    await page.locator('#reset').click();
    await page.locator('#state').selectOption('extreme_flexion');
    await page.evaluate(()=>window.__Q6.advance(.38));
    await capture(`mobile-${mode}-zoom-light-extreme_flexion`);
  }
  const mobileGeometry=await page.evaluate(()=>({innerWidth,scrollWidth:document.documentElement.scrollWidth,panels:[...document.querySelectorAll('article:not([hidden])')].map(e=>({id:e.dataset.panel,rect:e.getBoundingClientRect().toJSON(),canvas:e.querySelector('canvas').getBoundingClientRect().toJSON()}))}));
  await page.setViewportSize({width:1420,height:1000});
  await page.locator('#mode').selectOption('single');
  await page.locator('#zoom').selectOption('target');
  await page.locator('#reset').click();
  await page.locator('#state').selectOption('extreme_flexion');
  await page.evaluate(()=>window.__Q6.advance(.19));
  const switches=[];
  for(const id of ['J0','J1','J2','M1','M2']){
    await page.locator('#variant').selectOption(id);
    switches.push(await page.evaluate(()=>{const s=window.__Q6.snapshot();return {clock:s.clock,pose:s.pose,variant:s.variant,equality:s.equality};}));
  }
  return {observations,mobileGeometry,switches};
}
