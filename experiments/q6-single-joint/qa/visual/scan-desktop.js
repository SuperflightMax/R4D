async (page) => {
  await page.waitForFunction(() => window.__Q6_READY === true);
  const observations=[];
  const out='experiments/q6-single-joint/qa/visual/output/playwright/';
  const poses=['bind','extreme_extension','extreme_flexion','step_overlap','jump_phase'];
  const record=async(label,kind,file)=>{
    const state=await page.evaluate(()=>window.__Q6.snapshot());
    delete state.manifest;
    observations.push({label,kind,file,wallUTC:new Date().toISOString(),...state});
  };
  for(const mode of ['joint','method']) {
    await page.locator('#mode').selectOption(mode);
    for(const zoom of ['target','zoom']) {
      await page.locator('#zoom').selectOption(zoom);
      for(let i=0;i<poses.length;i++) {
        const pose=poses[i];
        const theme=i%2?'dark':'light';
        await page.locator('#theme').selectOption(theme);
        await page.locator('#reset').click();
        await page.locator('#state').selectOption(pose);
        await page.evaluate(()=>window.__Q6.advance(.38));
        const label=`desktop-${mode}-${zoom}-${theme}-${pose}`;
        const file=out+label+'.png';
        await page.locator('#panels').screenshot({path:file});
        await record(label,'paused same-Motion diagnostic exact target',file);
      }
    }
  }
  await page.locator('#mode').selectOption('joint');
  await page.locator('#theme').selectOption('dark');
  await page.locator('#zoom').selectOption('zoom');
  await page.locator('#reset').click();
  await page.locator('#state').selectOption('extreme_flexion');
  for(let i=1;i<=3;i++) {
    await page.evaluate(()=>window.__Q6.advance(.095));
    const label='joint-intermediate-'+i;
    const file=out+label+'.png';
    await page.locator('#panels').screenshot({path:file});
    await record(label,'paused same-Motion intermediate',file);
  }
  await page.locator('#mode').selectOption('method');
  await page.locator('#reset').click();
  await page.locator('#state').selectOption('extreme_flexion');
  await page.evaluate(()=>window.__Q6.advance(.19));
  const file=out+'method-intermediate.png';
  await page.locator('#panels').screenshot({path:file});
  await record('method-intermediate','paused same-Motion intermediate',file);
  console.log('__OBS__'+JSON.stringify(observations)+'__END__');
}
