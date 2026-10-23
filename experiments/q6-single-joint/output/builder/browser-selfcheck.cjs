async (page) => {
 const errors=[],warnings=[],failed=[],badResponses=[],observations=[];
 page.on('pageerror',e=>errors.push(String(e)));
 page.on('console',m=>{if(m.type()==='error')errors.push(m.text());if(m.type()==='warning')warnings.push(m.text());});
 page.on('requestfailed',r=>failed.push({url:r.url(),failure:r.failure()}));
 page.on('response',r=>{if(r.status()>=400)badResponses.push({url:r.url(),status:r.status()});});
 const assert=(condition,message)=>{if(!condition)throw new Error(message);};
 await page.setViewportSize({width:1440,height:1100});await page.reload();await page.waitForFunction(()=>window.__Q6_READY===true);
 const snap=()=>page.evaluate(()=>window.__Q6.snapshot());
 const step=dt=>page.evaluate(dt=>window.__Q6.advance(dt),dt);
 const capture=async name=>{const s=await snap();assert(s.issues.length===0,`assets ${name}`);assert(s.equality.exact,`equality ${name}`);assert(s.equality.checked.length===5,'five neutral variants');
  const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,visible:[...document.querySelectorAll('article')].filter(e=>!e.hidden).map(e=>e.dataset.panel),canvases:[...document.querySelectorAll('article:not([hidden]) canvas')].map(e=>({width:e.width,height:e.height,css:e.getBoundingClientRect().width}))}));
  assert(layout.scroll<=layout.width,`overflow ${name}`);observations.push({name,clock:s.clock,pose:s.pose,requested:s.requested,fraction:s.fraction,paused:s.paused,equality:s.equality,panels:s.panels,layout});return s;
 };
 const screenshot=async name=>page.screenshot({path:`output/playwright/${name}.png`,fullPage:true});
 const mode=page.getByRole('combobox',{name:'Сравнение',exact:true}),state=page.getByRole('combobox',{name:'Цель',exact:true});
 await capture('initial-all-assets');await screenshot('desktop-bind-J');
 for(const group of ['joint','method']){
  await mode.selectOption(group);
  for(const pose of ['bind','extreme_extension','extreme_flexion','step_overlap','jump_phase']){
   await state.selectOption(pose);await page.getByRole('button',{name:'Запросить цель',exact:true}).click();await step(.38);
   await capture(`${group}-${pose}`);await screenshot(`desktop-${group}-${pose}`);
  }
 }
 await mode.selectOption('single');
 for(const id of ['J0','J1','J2','M1','M2']){await page.getByRole('combobox',{name:'Вариант',exact:true}).selectOption(id);const s=await capture(`single-${id}`);assert(s.mode==='single','single mode');}
 await screenshot('desktop-single-M2');
 await mode.selectOption('diagnostic');await page.getByRole('button',{name:'Сброс bind',exact:true}).click();
 const diagnostic=await capture('source-neutral-bind');const neutral=diagnostic.panels.find(p=>p.id==='J0').transform,source=diagnostic.panels.find(p=>p.id==='source').transform;
 assert(Math.abs(source.shin.y-neutral.shin.y+18.48)<1e-9,'source offset delta');assert(source.shin.layer===-11&&neutral.shin.layer===-11,'runtime layer');await screenshot('desktop-source-neutral');
 await mode.selectOption('joint');await state.selectOption('extreme_flexion');await step(.19);
 const before=await snap();await state.selectOption('jump_phase');const immediate=await snap();assert(JSON.stringify(before.pose)===JSON.stringify(immediate.pose),'retarget continuity jump');await step(.19);const middle=await capture('mid-flexion-to-jump');
 assert(middle.fraction===.5&&middle.pose.shin===63,'half blend jump');
 await state.selectOption('extreme_extension');const immediate2=await snap();assert(JSON.stringify(middle.pose)===JSON.stringify(immediate2.pose),'retarget continuity extension');await step(.127);await capture('mid-jump-to-extension');await screenshot('desktop-mid-retarget');
 await page.getByRole('button',{name:'Играть ↔ bind',exact:true}).click();await page.waitForTimeout(170);await page.getByRole('button',{name:'Пауза',exact:true}).click();
 const pause=await snap();await page.waitForTimeout(130);assert(JSON.stringify(pause.pose)===JSON.stringify((await snap()).pose),'pause holds');
 await page.getByRole('button',{name:'Шаг 1/60 с',exact:true}).click();const stepped=await capture('pause-step');assert(Math.abs(stepped.clock-pause.clock-1/60)<1e-10,'one exact step');
 await page.getByRole('button',{name:'Сброс bind',exact:true}).click();const reset=await capture('reset');assert(reset.clock===0&&reset.pose.shin===0&&reset.paused,'reset exact');
 await page.getByRole('checkbox',{name:'Кости',exact:true}).check();await page.getByRole('checkbox',{name:'Оси',exact:true}).check();await page.getByRole('checkbox',{name:'Слои',exact:true}).check();
 for(const theme of ['light','dark'])for(const zoom of ['target','zoom']){
  await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption(theme);await page.getByRole('combobox',{name:'Масштаб',exact:true}).selectOption(zoom);
  await state.selectOption('extreme_flexion');await step(.38);const s=await capture(`desktop-${theme}-${zoom}-diagnostics`);assert(s.panels[0].transform.thigh.scale===(zoom==='zoom'?.84:.42),'fixed scale');await screenshot(`desktop-${theme}-${zoom}`);
 }
 await page.setViewportSize({width:390,height:844});
 for(const group of ['joint','method','single','diagnostic']){await mode.selectOption(group);await capture(`mobile-${group}`);await screenshot(`mobile-${group}`);}
 await mode.selectOption('joint');
 for(const theme of ['light','dark'])for(const zoom of ['target','zoom']){await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption(theme);await page.getByRole('combobox',{name:'Масштаб',exact:true}).selectOption(zoom);await state.selectOption('jump_phase');await step(.38);await capture(`mobile-${theme}-${zoom}`);await screenshot(`mobile-${theme}-${zoom}`);}
 await page.getByRole('checkbox',{name:'Кости',exact:true}).uncheck();await page.getByRole('checkbox',{name:'Оси',exact:true}).uncheck();await page.getByRole('checkbox',{name:'Слои',exact:true}).uncheck();await page.getByRole('button',{name:'Сброс bind',exact:true}).click();
 await page.setViewportSize({width:1440,height:1100});await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption('light');await page.getByRole('combobox',{name:'Масштаб',exact:true}).selectOption('target');await capture('final');
 assert(errors.length===0,'browser errors');assert(failed.length===0,'request failures');assert(badResponses.length===0,'HTTP errors');
 console.log('Q6_RESULT '+JSON.stringify({ok:true,errors,warnings,failed,badResponses,observations,limits:'Implementer check; deterministic advance samples same Motion; not human assessment of continuous naturalness.'}));
}
