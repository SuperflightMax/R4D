async (page) => {
  const out='experiments/q6-single-joint/qa/visual/output/playwright/';
  const observations=[];
  const snap=async()=>page.evaluate(()=>{const s=window.__Q6.snapshot();delete s.manifest;return s;});
  await page.locator('#mode').selectOption('joint');
  await page.locator('#zoom').selectOption('target');
  await page.locator('#theme').selectOption('light');
  await page.evaluate(()=>{
    window.__VQ_EVENTS=[];
    let before;
    document.addEventListener('change',e=>{if(e.target.id==='state'){before=window.__Q6.snapshot();delete before.manifest;}},true);
    document.addEventListener('change',e=>{if(e.target.id==='state'){const after=window.__Q6.snapshot();delete after.manifest;window.__VQ_EVENTS.push({before,after});}},false);
  });
  await page.locator('#reset').click();
  await page.locator('#play').click();
  for(const pose of ['extreme_extension','extreme_flexion','step_overlap','jump_phase','bind']) {
    await page.locator('#state').selectOption(pose);
    for(let i=0;i<3;i++) {
      await page.waitForTimeout(70);
      const label=`live-joint-${pose}-${i}`;
      const before=await snap();
      const file=out+label+'.png';
      await page.locator('#panels').screenshot({path:file,animations:'allow'});
      const after=await snap();
      observations.push({label,file,kind:'live requestAnimationFrame playback, screenshot bracketed',before,after});
    }
  }
  await page.locator('#mode').selectOption('method');
  await page.locator('#theme').selectOption('dark');
  await page.locator('#state').selectOption('extreme_flexion');
  for(let i=0;i<3;i++) {
    await page.waitForTimeout(85);
    const label=`live-method-${i}`,file=out+label+'.png';
    const before=await snap();
    await page.locator('#panels').screenshot({path:file,animations:'allow'});
    observations.push({label,file,kind:'live requestAnimationFrame playback, screenshot bracketed',before,after:await snap()});
  }
  await page.locator('#play').click();
  await page.locator('#step').click();
  observations.push({label:'UI pause and step',state:await snap()});
  return {observations,retargetEvents:await page.evaluate(()=>window.__VQ_EVENTS)};
}
