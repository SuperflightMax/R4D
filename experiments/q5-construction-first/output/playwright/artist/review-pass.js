async (page) => {
  const frames=[];
  const errors=[];
  page.on('pageerror',e=>errors.push(String(e)));
  const shot=async label=>{
    const s=await page.evaluate(()=>window.__R4D.snapshot());
    frames.push({label,time:s.time,state:s.state,ground:s.ground,height:s.height,phase:s.phase,rootY:s.pose.rootY,knee:s.pose.shinNear,
      jumpCount:s.jumpCount,landCount:s.landCount,partCount:s.partCount,soleGap:s.view.renderedSoleGap,showConstruction:s.showConstruction,showBind:s.showBind});
    await page.locator('#scene').screenshot({path:`experiments/q5-construction-first/output/playwright/artist/${label}.png`});
  };
  const input=async(id,dt=0)=>page.evaluate(({id,dt})=>{document.getElementById(id).click();window.__R4D.setPaused(true);if(dt)window.__R4D.step(dt);},{id,dt});
  const step=async dt=>page.evaluate(dt=>window.__R4D.step(dt),dt);
  await page.waitForFunction(()=>window.__R4D?.snapshot().partCount===12);
  // UI controls are the input path; stepping only makes the existing mechanism observable.
  await input('reset');
  await input('bind'); await shot('01-bind'); await input('bind');
  await step(.5); await shot('02-idle');
  await input('low',.65); await shot('03-low');
  await input('move',.6); await shot('04-walk-a'); await step(.3); await shot('05-walk-b');
  await input('jump',.12); await shot('06-jump-prepare');
  await step(.35); await shot('07-jump-flight');
  await input('low',.15); await shot('08-flight-new-low');
  await step(.5); await shot('09-jump-contact');
  await step(.55); await shot('10-landed-low');
  // The two actual UI routes, each once, with snapshots at relevant phases.
  for(const [route,times] of [['one',[.8,1.6,2.8,4.6,5.8]],['two',[1.4,2.5,3.3,4.5,5.8]]]){
    await page.evaluate(route=>{document.querySelector(`[data-route="${route}"]`).click();window.__R4D.setPaused(true);},route);
    let previous=0;
    for(const time of times){await step(time-previous);previous=time;await shot(`route-${route}-${time}`);}
  }
  // Arbitrary mid-transition requests from the current intermediate pose, no reset at the switch.
  for(const action of ['move','jump']){
    await input('reset'); await input('low',.06); await shot(`mid-${action}-before`);
    await input(action,.06); await shot(`mid-${action}-after`);
    await step(action==='jump'?.5:.4); await shot(`mid-${action}-follow`);
  }
  await page.getByLabel('Фон',{exact:true}).selectOption('dark');
  await input('reset'); await step(.4); await shot('dark-idle');
  await input('low',.65); await shot('dark-low');
  await input('construction'); await shot('same-low-construction'); await input('construction');
  await page.getByLabel('Фон',{exact:true}).selectOption('light');
  return {candidate:'q5-c1',frames,errors,method:'single author pass through UI commands and same paused step mechanism; no image/runtime writes'};
}
