async (page) => {
  await page.waitForFunction(() => window.__R4D);
  await page.evaluate(() => window.__R4D.setPaused(true));
  const snap = () => page.evaluate(() => window.__R4D.snapshot());
  const step = dt => page.evaluate(dt => window.__R4D.step(dt), dt);
  const click = state => page.getByRole('button', {name: {idle:'Покой · 1',low:'Низкая поза · 2',move:'Идти · 3',jump:'Прыжок · пробел'}[state], exact:true}).click();
  const results = {states:{},jumps:[],interruptions:[],routes:[]};
  for (const state of ['idle','low','move']) {
    await page.evaluate(() => window.__R4D.reset());
    await click(state); await step(1);
    const stateSnap=await snap();
    results.states[state] = {rootY:stateSnap.pose.rootY,knee:stateSnap.pose.shinNear,renderedSoleGap:stateSnap.view.renderedSoleGap};
    await page.screenshot({path:`q2-c1-${state}.png`});
  }
  for (const origin of ['idle','low','move']) for (const landing of ['idle','low','move']) {
    await page.evaluate(() => window.__R4D.reset());
    await click(origin); await step(.8); await click('jump');
    let minGap=Infinity,maxGapAtContact=0,maxHeight=0,selected=false,previous='',contact=null;
    const phases=[];
    for (let i=0;i<240;i++) {
      await step(1/120); const s=await snap();
      if(s.state!==previous){phases.push(s.state);previous=s.state;}
      maxHeight=Math.max(maxHeight,s.height);
      if(s.state==='flight'&&!selected){await click(landing);selected=true;}
      if(s.state==='land'){
        minGap=Math.min(minGap,...Object.values(s.view.renderedSoleGap));
        maxGapAtContact=Math.max(maxGapAtContact,Math.min(...Object.values(s.view.renderedSoleGap)));
        contact=s.contactEvent;
      }
      if(origin==='low'&&landing==='move'&&i===62)await page.screenshot({path:'q2-c1-jump.png'});
    }
    const s=await snap();
    if(s.state!==landing||s.jumpCount!==1||s.landCount!==1)throw Error(`Jump failed ${origin} -> ${landing}`);
    results.jumps.push({origin,landing,phases,maxHeight,minGap,maxGapAtContact,contact});
  }
  for (const destination of ['move','jump']) {
    await page.evaluate(() => window.__R4D.reset());
    await click('low');await step(.06);const before=await snap();
    await click(destination);const after=await snap();
    if(JSON.stringify(before.pose)!==JSON.stringify(after.pose))throw Error('Retarget reset pose');
    await step(1/120);const next=await snap();await step(2);const end=await snap();
    results.interruptions.push({destination,rootBefore:before.pose.rootY,rootAfter:next.pose.rootY,endState:end.state});
  }
  if (!(await page.locator('details').evaluate(el=>el.open))) await page.getByText('Маршруты и замедление',{exact:true}).click();
  for(const name of ['Маршрут 1','Маршрут 2','В середине → идти','В середине → прыжок']) {
    await page.getByRole('button',{name,exact:true}).click();
    await page.evaluate(() => {window.__R4D.setPaused(true);window.__R4D.step(8);});
    const s=await snap();results.routes.push({name,state:s.state,jumps:s.jumpCount,landings:s.landCount});
  }
  await page.getByRole('combobox',{name:'Фон'}).selectOption('dark');
  await click('low');await step(1);await page.screenshot({path:'q2-c1-low-dark.png'});
  await page.getByRole('combobox',{name:'Фон'}).selectOption('light');
  await page.evaluate(data=>{window.__BUILDER_RESULTS=data;},results);
  return results;
}
