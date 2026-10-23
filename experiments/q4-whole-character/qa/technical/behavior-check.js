async (page) => {
 const labels={idle:'Покой · 1',low:'Низкая поза · 2',move:'Идти · 3',jump:'Прыжок · пробел'};
 const click=s=>page.getByRole('button',{name:labels[s],exact:true}).click();
 const snap=()=>page.evaluate(()=>window.__R4D.snapshot());
 const step=dt=>page.evaluate(dt=>window.__R4D.step(dt),dt);
 const reset=()=>page.getByRole('button',{name:'Сначала · R',exact:true}).click();
 const shot=name=>page.getByRole('region',{name:'Анимированный персонаж'}).screenshot({path:`D:/dev/R4D/experiments/q4-whole-character/qa/technical/output/playwright/${name}.png`});
 const out={method:'Independent real UI inputs; live routes then paused existing step/render observation. No mock, candidate writes or private motion setter.',liveRoutes:[],states:{},jumps:[],interruptions:[]};
 await page.waitForFunction(()=>window.__R4D);
 await page.getByText('Маршруты и замедление',{exact:true}).click();
 for(const route of [1,2]){
  await page.getByRole('button',{name:`Маршрут ${route}`,exact:true}).click();
  let last='';const observed=[];
  for(let i=0;i<42;i++){
   await page.waitForTimeout(175);const s=await snap(),key=s.state+'>'+s.ground;
   if(key!==last){observed.push({t:s.time,state:s.state,ground:s.ground,height:s.height});last=key;}
  }
  const e=await snap();out.liveRoutes.push({route,observed,end:{state:e.state,ground:e.ground,jumps:e.jumpCount,lands:e.landCount,events:e.events,inputs:e.inputs}});
 }
 if(!(await snap()).paused)await page.getByRole('button',{name:'Пауза · P',exact:true}).click();
 for(const state of ['idle','low','move']){
  await reset();await click(state);await step(1.2);const a=await snap();await step(.23);const b=await snap();
  out.states[state]={pose:a.pose,scale:a.view.scale,world:a.world,soleGap:a.view.renderedSoleGap,laterRootY:b.pose.rootY,phase:a.phase,laterPhase:b.phase};await shot(state);
 }
 await reset();await click('move');await step(1.5);
 out.walkContact=await page.evaluate(()=>{let minimum=Infinity,maximum=-Infinity;const samples=[];for(let i=0;i<300;i++){window.__R4D.step(1/120);const s=window.__R4D.snapshot(),gap=Math.min(...Object.values(s.view.renderedSoleGap));minimum=Math.min(minimum,gap);maximum=Math.max(maximum,gap);if(i%60===0)samples.push({phase:s.phase,gaps:s.view.renderedSoleGap});}return {duration:2.5,minimumClosestGap:minimum,maximumClosestGap:maximum,samples};});
 for(const [origin,landing] of [['idle','low'],['low','move'],['move','idle']]){
  await reset();await click(origin);await step(.9);await click('jump');let changed=false,previous='';const phases=[];let maxHeight=0,minLandGap=Infinity,maxLandGap=-Infinity,flightAfterCommand=null;
  for(let i=0;i<240;i++){
   await step(1/120);const s=await snap();if(s.state!==previous){phases.push({t:s.time,state:s.state});previous=s.state;}
   maxHeight=Math.max(maxHeight,s.height);
   if(s.state==='flight'&&s.stateTime>.12&&!changed){await click(landing);flightAfterCommand=await snap();changed=true;}
   if(s.state==='land'){const gap=Math.min(...Object.values(s.view.renderedSoleGap));minLandGap=Math.min(minLandGap,gap);maxLandGap=Math.max(maxLandGap,gap);}
   if(origin==='low'&&[12,55,105,145].includes(i))await shot(`jump-${i}`);
  }
  const e=await snap();out.jumps.push({origin,landing,phases,maxHeight,minLandGap,maxLandGap,changedInFlight:changed,airCommandState:flightAfterCommand?.state,airCommandGround:flightAfterCommand?.ground,end:{state:e.state,ground:e.ground,jumps:e.jumpCount,lands:e.landCount},contact:e.contactEvent});
 }
 for(const destination of ['move','jump']){
  await reset();await click('low');await step(.08);const before=await snap();if(destination==='jump')await shot('mid-before-jump');await click(destination);const at=await snap();await step(1/120);const next=await snap();if(destination==='jump')await shot('mid-after-jump');await step(2);const e=await snap();
  out.interruptions.push({destination,intermediateRoot:before.pose.rootY,unchangedAtCommand:JSON.stringify(before.pose)===JSON.stringify(at.pose),nextRoot:next.pose.rootY,end:{state:e.state,ground:e.ground,jumps:e.jumpCount,lands:e.landCount}});
 }
 await reset();await click('move');await step(1.37);const a=await snap();await click('low');const b=await snap();await step(.09);await click('idle');await step(.12);await click('move');await step(.3);await click('jump');await step(.4);await click('low');await step(1.8);const e=await snap();
 out.otherPhase={phase:a.phase,unchangedAtCommand:JSON.stringify(a.pose)===JSON.stringify(b.pose),end:{state:e.state,ground:e.ground,jumps:e.jumpCount,lands:e.landCount}};
 await page.getByRole('button',{name:'Кости · B',exact:true}).click();await shot('bones');
 await page.getByLabel('Фон',{exact:true}).selectOption('dark');await shot('dark');
 await reset();await page.keyboard.press('Digit2');await step(.8);out.keyboardLow=(await snap()).state;await page.keyboard.press('Space');await step(.4);out.keyboardJump=(await snap()).state;
 return out;
}
