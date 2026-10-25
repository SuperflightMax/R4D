async (page) => {
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.reload();await page.waitForFunction(()=>window.q5a?.getStats().authoredMasks===2);
  await page.setViewportSize({width:1280,height:900});
  await page.getByRole('button',{name:'Пауза',exact:true}).click();
  const states=[],capture=async(name)=>{let state=await page.evaluate(()=>({phase:q5a.motion.phase,target:q5a.motion.ground,tick:q5a.motion.tick,root:q5a.getPose().landmarks.pelvis,stats:q5a.getStats()}));if(state.stats.inverted||state.stats.webglError)throw Error(JSON.stringify(state));states.push({name,...state});await page.locator('.stage').screenshot({path:`output/playwright/${name}.png`});};
  const advance=async(n)=>page.evaluate(n=>q5a.step(n),n);
  await capture('02-desktop-idle');
  await page.getByRole('button',{name:'Присед',exact:true}).click();await advance(18);await capture('02-idle-low-mid');await advance(110);await capture('02-low');
  await page.getByRole('button',{name:'Ходьба',exact:true}).click();await advance(20);await capture('02-low-walk-mid');await advance(100);await capture('02-walk');
  await page.getByRole('button',{name:'Стойка',exact:true}).click();await advance(120);
  await page.getByRole('button',{name:'Прыжок ↑',exact:true}).click();await advance(27);await capture('02-prepare');await advance(26);await capture('02-push');await advance(40);await capture('02-flight');
  await page.getByRole('button',{name:'Присед',exact:true}).click();await advance(70);await capture('02-prelanding');await advance(16);await capture('02-landing');await advance(130);await capture('02-after-low');
  await page.getByRole('button',{name:'Ходьба',exact:true}).click();await advance(140);await page.getByRole('button',{name:'Присед',exact:true}).click();await advance(60);await page.getByRole('button',{name:'Прыжок ↑',exact:true}).click();await advance(105);await page.getByRole('button',{name:'Ходьба',exact:true}).click();await advance(140);await capture('02-after-flight-walk');
  await page.getByRole('button',{name:'Прыжок ↑',exact:true}).click();await advance(105);await page.getByRole('button',{name:'Присед',exact:true}).click();await advance(140);
  await page.getByRole('button',{name:'Стойка',exact:true}).click();await advance(150);await page.getByRole('button',{name:'Присед',exact:true}).click();await advance(8);await page.getByRole('button',{name:'Ходьба',exact:true}).click();await advance(17);await capture('02-early-interrupt-walk');
  await page.getByRole('button',{name:'Стойка',exact:true}).click();await advance(150);await page.getByRole('button',{name:'Присед',exact:true}).click();await advance(8);await page.getByRole('button',{name:'Прыжок ↑',exact:true}).click();await advance(24);await capture('02-early-interrupt-jump');await advance(220);
  await page.getByText('Диагностика и просмотр',{exact:true}).click();await page.getByLabel('Тёмный фон',{exact:true}).check();await page.getByLabel('Кости и опора',{exact:true}).check();await page.getByLabel('Сетка и грани',{exact:true}).check();await capture('02-dark-diagnostics');
  await page.getByLabel('Сетка и грани',{exact:true}).uncheck();await page.getByLabel('Крупно 2×',{exact:true}).check();await capture('02-dark-x2');await page.getByLabel('Крупно 2×',{exact:true}).uncheck();
  const before=await page.evaluate(()=>q5a.motion.tick);await page.getByRole('button',{name:'Кадр +',exact:true}).click();const after=await page.evaluate(()=>q5a.motion.tick);if(after-before!==2)throw Error('frame-step mismatch');
  await page.locator('#stop-target').selectOption('low');await page.getByRole('button',{name:'Ходьба',exact:true}).click();await advance(130);await page.getByRole('button',{name:'Стоп',exact:true}).click();await advance(130);if(await page.evaluate(()=>q5a.motion.ground)!=='low')throw Error('selected stop target lost');
  await page.setViewportSize({width:390,height:844});await capture('02-mobile-dark-low');
  const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth);if(overflow)throw Error('mobile horizontal overflow');
  await page.getByLabel('Тёмный фон',{exact:true}).uncheck();await page.getByLabel('Кости и опора',{exact:true}).uncheck();await page.getByRole('button',{name:'Стойка',exact:true}).click();await advance(150);await capture('02-mobile-light-idle');
  await page.getByRole('button',{name:'Прыжок ↑',exact:true}).click();await advance(105);await capture('02-mobile-jump');await page.getByRole('button',{name:'Ходьба',exact:true}).click();await advance(150);await capture('02-mobile-after-walk');
  if(errors.length)throw Error(errors.join('\n'));
  const result={result:'BROWSER_SELF_CHECK_PASS',candidate:'Q5A-NELA-ASSEMBLY-02',states,console_errors:errors,frame_step_ticks:after-before,mobile_horizontal_overflow:overflow,events:await page.evaluate(()=>q5a.motion.events)};await page.evaluate(r=>{q5a.selfCheckResult=r;},result);return result;
}
