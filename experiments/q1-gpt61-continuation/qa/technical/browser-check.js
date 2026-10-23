async (page) => {
  const records = [], errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if(m.type()==='error') errors.push(m.text()); });
  const assert = (ok, message) => { if(!ok) throw new Error(message); };
  await page.reload();
  await page.waitForFunction(() => !!window.__R4D);
  const key = value => page.keyboard.press(value);
  const step = dt => page.evaluate(dt => window.__R4D.step(dt), dt);
  const read = () => page.evaluate(() => window.__R4D.snapshot());
  const record = async label => {
    const s = await read();
    records.push({label,time:s.time,state:s.state,ground:s.ground,phase:s.phase,
      rootY:s.pose.rootY,knee:s.pose.shinNear,footNear:s.world.footNear,
      height:s.height,jumps:s.jumpCount,lands:s.landCount,paused:s.paused,bones:s.bones});
    return s;
  };
  await key('p');
  const reset = async () => { await key('r'); assert((await read()).paused,'reset must retain pause'); };
  const groundKey = {idle:'1',low:'2',move:'3'};
  await reset();
  const idle = await record('idle');
  await key('2'); await step(.8);
  const low = await record('low-settled');
  assert(low.pose.rootY-idle.pose.rootY>60 && low.pose.shinNear-idle.pose.shinNear>.5,'low must change joints');
  const nearFootShift = Math.hypot(low.world.footNear.x+low.pose.bodyX-idle.world.footNear.x-idle.pose.bodyX,
    low.world.footNear.y+low.pose.rootY-idle.world.footNear.y-idle.pose.rootY);
  assert(nearFootShift < .1,'low grounded ankle drift');
  await page.screenshot({path:'experiments/q1-gpt61-continuation/qa/technical/output/playwright/low.png'});

  // Both documented sequences independently requested with actual keyboard input.
  await reset();
  for(const command of ['2','3','1']) { await key(command); await step(.73); await record('manual-route1-'+command); }
  await key('Space'); await step(1.55); assert((await read()).state==='idle','route1 idle end');
  await record('manual-route1-end');
  await reset(); await key('3'); await step(.41); await key('2'); await step(.61);
  await key('Space'); await step(.4); await key('3'); await step(1.15);
  assert((await read()).state==='move','route2 first landing');
  await key('Space'); await step(.37); await key('2'); await step(1.18);
  assert((await read()).state==='low','route2 second landing');
  await record('manual-route2-end');

  for(const target of ['move','jump']) {
    await reset(); await key('2'); await step(.06);
    const before = await read();
    await key(target==='move'?'3':'Space');
    const after = await read();
    const delta = Math.max(...Object.keys(before.pose).map(k=>Math.abs(after.pose[k]-before.pose[k])));
    assert(delta===0,'input reset intermediate pose');
    records.push({label:'mid-low-to-'+target,rootY:before.pose.rootY,knee:before.pose.shinNear,instantDelta:delta});
    await step(1.55);
    assert((await read()).state === (target==='move'?'move':'low'),'midtransition final');
    await record('mid-low-to-'+target+'-end');
  }
  for(const source of ['idle','low','move']) for(const target of ['idle','low','move']) {
    await reset(); await key(groundKey[source]); await step(source==='move'?.413:.7);
    await key('Space'); await step(.1);
    assert((await read()).state==='prepare','missing prepare '+source);
    await step(.3); const flight=await read(); assert(flight.state==='flight' && flight.height>0,'missing flight');
    await key(groundKey[target]); await key('Space'); await step(.05);
    assert((await read()).jumpCount===1,'double jump accepted');
    await step(.66); assert((await read()).state==='land','missing landing phase');
    await step(.45); const end=await read();
    assert(end.state===target && end.jumpCount===1 && end.landCount===1,'wrong landing '+source+'->'+target);
    await record('jump-'+source+'-to-'+target);
  }
  // Keyboard hold/release, no API setMove.
  await reset(); await page.keyboard.down('d'); await step(.217); await record('D-held');
  await page.keyboard.up('d'); await step(.7); assert((await read()).ground==='idle','D release');
  await page.keyboard.down('ArrowLeft'); await step(.313); assert((await read()).move===-1,'left key');
  await page.keyboard.up('ArrowLeft'); await step(.5);
  await key('b'); assert((await read()).bones,'bones on'); await key('b'); assert(!(await read()).bones,'bones off');
  const t=(await read()).time; await page.waitForTimeout(100); assert((await read()).time===t,'pause time advanced');
  await key('.'); assert(Math.abs((await read()).time-t-1/60)<1e-9,'step not 1/60');
  await record('pause-step-bones');

  await page.getByText('Маршруты и замедление',{exact:true}).click();
  for(const [button,end,jumps] of [['Маршрут 1','idle',1],['Маршрут 2','low',2],['В середине → идти','move',0],['В середине → прыжок','low',1]]) {
    await page.getByRole('button',{name:button,exact:true}).click(); await key('p'); await step(7.2);
    const s=await read();assert(s.state===end && s.jumpCount===jumps && s.landCount===jumps,'auto route '+button);
    records.push({label:'auto-'+button,state:s.state,jumps:s.jumpCount,lands:s.landCount,events:s.events});
  }
  // Interrupt an active route with a manual real key.
  await page.getByRole('button',{name:'Маршрут 1',exact:true}).click();await key('p');await step(.9);
  await key('2');await step(7);assert((await read()).state==='low' && (await read()).jumpCount===0,'manual command did not interrupt');
  await page.getByText('До: исходный baseline без изменений',{exact:true}).click();
  const frame=page.frameLocator('iframe[title="Исходный baseline 6.1"]');
  await frame.getByRole('button',{name:'Идти · D / →',exact:true}).waitFor();
  await page.waitForFunction(()=>!!document.querySelector('iframe[title="Исходный baseline 6.1"]').contentWindow.__R4D);
  const iframeInfo=await frame.locator('body').evaluate(()=>({parts:window.__R4D.snapshot().partCount,hasLow:!!document.getElementById('low'),canvas:document.querySelectorAll('canvas').length}));
  assert(iframeInfo.parts===13 && !iframeInfo.hasLow && iframeInfo.canvas===1,'baseline iframe mismatch');
  records.push({label:'baseline-iframe',...iframeInfo});
  // Real touch-enabled context, not CSS width alone.
  const mobile=await page.context().browser().newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:1});
  const mp=await mobile.newPage();await mp.goto('http://127.0.0.1:4181/');await mp.waitForFunction(()=>!!window.__R4D);
  const mobileStep=dt=>mp.evaluate(dt=>window.__R4D.step(dt),dt);
  await mp.getByRole('button',{name:'Пауза · P',exact:true}).tap();
  await mp.getByRole('button',{name:'Низкая поза · 2',exact:true}).tap();await mobileStep(.7);
  assert((await mp.evaluate(()=>window.__R4D.snapshot())).state==='low','mobile touch low');
  await mp.getByRole('button',{name:'Идти · 3',exact:true}).tap();await mobileStep(.4);
  await mp.getByRole('button',{name:'Прыжок · пробел',exact:true}).tap();await mobileStep(.4);
  await mp.getByRole('button',{name:'Низкая поза · 2',exact:true}).tap();await mobileStep(1.15);
  const ms=await mp.evaluate(()=>window.__R4D.snapshot());assert(ms.state==='low' && ms.landCount===1,'mobile touch landing');
  await mp.getByRole('button',{name:'Покой · 1',exact:true}).click();await mobileStep(.7);
  const overflow=await mp.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,hasTouch:navigator.maxTouchPoints>0}));
  assert(overflow.width===390 && overflow.scroll===390 && overflow.hasTouch,'mobile layout/touch');
  records.push({label:'mobile390',touchLanding:ms.state,lands:ms.landCount,...overflow});
  await mp.screenshot({path:'experiments/q1-gpt61-continuation/qa/technical/output/playwright/mobile390.png',fullPage:true});
  await mobile.close();
  assert(errors.length===0,'browser errors '+errors.join(';'));
  return {result:'PASS',nearFootShift,records,errors};
}
