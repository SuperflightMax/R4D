async (page) => {
  await page.waitForFunction(()=>window.__Q6_READY===true);
  const base='D:/dev/R4D/experiments/q6-single-joint/qa/artist/output/playwright/';
  const observations=[],errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  page.on('console',m=>{if(m.type()==='error'||m.type()==='warning')errors.push(m.type()+': '+m.text());});
  const save=async(id,screen=true)=>{
    const state=await page.evaluate(()=>{const s=window.__Q6.snapshot();delete s.manifest;return s;});
    observations.push({id,state});
    if(screen)await page.locator('#panels').screenshot({path:base+id+'.png'});
  };
  const states=['bind','extreme_extension','extreme_flexion','step_overlap','jump_phase'];
  for(const [mode,zoom,theme] of [['joint','target','light'],['joint','zoom','dark'],['method','target','dark'],['method','zoom','light']]){
    await page.locator('#mode').selectOption(mode);await page.locator('#zoom').selectOption(zoom);await page.locator('#theme').selectOption(theme);
    for(const state of states){
      await page.getByRole('button',{name:'Сброс bind',exact:true}).click();
      await page.locator('#state').selectOption(state);
      await page.evaluate(()=>window.__Q6.advance(.38));
      await save(`${mode}-${zoom}-${theme}-${state}`);
    }
  }
  // Complementary backgrounds/scales at the most demanding flexion.
  for(const mode of ['joint','method'])for(const [zoom,theme] of [['target','light'],['target','dark'],['zoom','light'],['zoom','dark']]){
    await page.locator('#mode').selectOption(mode);await page.locator('#zoom').selectOption(zoom);await page.locator('#theme').selectOption(theme);
    await page.getByRole('button',{name:'Сброс bind',exact:true}).click();await page.locator('#state').selectOption('extreme_flexion');await page.evaluate(()=>window.__Q6.advance(.38));
    await save(`${mode}-${zoom}-${theme}-flexion-complement`);
  }
  // Diagnostic compares identical artwork with only source/neutral offset difference.
  await page.locator('#mode').selectOption('diagnostic');await page.locator('#zoom').selectOption('zoom');await page.locator('#theme').selectOption('light');
  await page.getByRole('checkbox',{name:'Оси',exact:true}).check();await page.getByRole('checkbox',{name:'Кости',exact:true}).check();await page.getByRole('checkbox',{name:'Слои',exact:true}).check();
  for(const state of ['bind','extreme_flexion','step_overlap']){
    await page.getByRole('button',{name:'Сброс bind',exact:true}).click();await page.locator('#state').selectOption(state);await page.evaluate(()=>window.__Q6.advance(.38));await save('diagnostic-zoom-light-'+state);
  }
  await page.getByRole('checkbox',{name:'Оси',exact:true}).uncheck();await page.getByRole('checkbox',{name:'Кости',exact:true}).uncheck();await page.getByRole('checkbox',{name:'Слои',exact:true}).uncheck();
  // Sample current intermediate pose and prove a new UI request retains it.
  await page.locator('#mode').selectOption('joint');await page.locator('#theme').selectOption('light');
  await page.getByRole('button',{name:'Сброс bind',exact:true}).click();await page.locator('#state').selectOption('extreme_flexion');await page.evaluate(()=>window.__Q6.advance(.19));await save('retarget-half-before');
  await page.locator('#state').selectOption('jump_phase');await save('retarget-half-immediate');
  await page.getByRole('button',{name:'Шаг 1/60 с',exact:true}).click();await save('retarget-half-one-step');
  await page.evaluate(()=>window.__Q6.advance(.16));await save('retarget-jump-intermediate');
  await page.locator('#state').selectOption('extreme_extension');await save('retarget-again-immediate');await page.evaluate(()=>window.__Q6.advance(.19));await save('retarget-extension-intermediate');
  // Actual requestAnimationFrame-driven play/pause, not just diagnostic stepping.
  await page.getByRole('button',{name:'Сброс bind',exact:true}).click();await page.locator('#state').selectOption('extreme_flexion');
  await page.getByRole('button',{name:'Играть ↔ bind',exact:true}).click();
  await page.waitForTimeout(180);await save('live-play-early');
  await page.locator('#state').selectOption('step_overlap');await page.waitForTimeout(130);await save('live-mid-retarget');
  await page.locator('#state').selectOption('jump_phase');await page.waitForTimeout(230);
  await page.getByRole('button',{name:'Пауза',exact:true}).click();await save('live-pause');
  await page.waitForTimeout(180);await save('live-still-paused',false);
  await page.getByRole('button',{name:'Шаг 1/60 с',exact:true}).click();await save('live-ui-step');
  // Single mode and narrower display: a layout observation, not device QA.
  await page.locator('#mode').selectOption('single');await page.locator('#variant').selectOption('J2');await save('single-J2-zoom-light');
  await page.setViewportSize({width:390,height:844});await save('mobile-single-J2');
  await page.setViewportSize({width:1500,height:1100});
  console.log('OBSERVATIONS='+JSON.stringify({observations,errors,method:'Real UI controls; settled poses sampled by same exposed Motion.advance; live section uses requestAnimationFrame with wall-clock waits. Screenshots can delay wall-clock sampling.'}));
}
