async (page) => {
 const labels={idle:'Покой · 1',low:'Низкая поза · 2',move:'Идти · 3',jump:'Прыжок · пробел'};
 const click=s=>page.getByRole('button',{name:labels[s],exact:true}).click();
 const snap=()=>page.evaluate(()=>window.__R4D.snapshot());
 const step=dt=>page.evaluate(dt=>window.__R4D.step(dt),dt);
 if(!(await snap()).paused)await page.getByRole('button',{name:'Пауза · P',exact:true}).click();
 const reset=()=>page.getByRole('button',{name:'Сначала · R',exact:true}).click();
 const out={method:'Real UI commands, paused browser with existing step/render hook; no mock, no product writes',states:{},jumps:[],interruptions:[],otherPhases:[]};
 for(const state of ['idle','low','move']){
  await reset();await click(state);await step(1.1);const a=await snap();await step(.22);const b=await snap();
  out.states[state]={rootY:a.pose.rootY,kneeDeg:a.pose.shinNear*180/Math.PI,scale:a.view.scale,soleGap:a.view.renderedSoleGap,rootYLater:b.pose.rootY,phase:a.phase,phaseLater:b.phase};
  await page.getByRole('region',{name:'Анимированный персонаж'}).screenshot({path:`numeric-${state}.png`});
 }
 for(const origin of ['idle','low','move'])for(const landing of ['idle','low','move']){
  await reset();await click(origin);await step(.9);await click('jump');
  let previous='',changed=false;const phases=[];let maxHeight=0,minContactGap=Infinity,maxContactGap=-Infinity,contact=null;
  for(let i=0;i<240;i++){
   await step(1/120);const s=await snap();
   if(s.state!==previous){phases.push({state:s.state,t:s.time});previous=s.state;}
   maxHeight=Math.max(maxHeight,s.height);
   if(s.state==='flight'&&s.stateTime>.12&&!changed){await click(landing);changed=true;}
   if(s.state==='land'){const gap=Math.min(...Object.values(s.view.renderedSoleGap));minContactGap=Math.min(minContactGap,gap);maxContactGap=Math.max(maxContactGap,gap);contact=s.contactEvent;}
   if(origin==='low'&&landing==='move'&&[12,54,110,150].includes(i))await page.getByRole('region',{name:'Анимированный персонаж'}).screenshot({path:`jump-${i}.png`});
  }
  const end=await snap();out.jumps.push({origin,landing,changed,phases,maxHeight,minContactGap,maxContactGap,contact,end:{state:end.state,ground:end.ground,jumps:end.jumpCount,lands:end.landCount},pass:end.state===landing&&end.jumpCount===1&&end.landCount===1});
 }
 for(const destination of ['move','jump']){
  await reset();await click('low');await step(.06);const before=await snap();await click(destination);const atCommand=await snap();await step(1/120);const next=await snap();await step(1.8);const end=await snap();
  out.interruptions.push({destination,t:before.time,intermediateRoot:before.pose.rootY,intermediateKnee:before.pose.shinNear,unchangedAtCommand:JSON.stringify(before.pose)===JSON.stringify(atCommand.pose),nextRoot:next.pose.rootY,end:{state:end.state,ground:end.ground,jumps:end.jumpCount,lands:end.landCount}});
 }
 for(const offset of [.13,.46,.71]){
  await reset();await click('move');await step(1+offset);const a=await snap();await click('low');const b=await snap();await step(.09);await click('idle');await step(.12);await click('move');await step(.3);await click('jump');await step(.4);await click('idle');await step(1.5);const e=await snap();
  out.otherPhases.push({offset,phase:a.phase,unchangedAtCommand:JSON.stringify(a.pose)===JSON.stringify(b.pose),end:{state:e.state,ground:e.ground,jumps:e.jumpCount,lands:e.landCount}});
 }
 await reset();await click('move');await step(1.5);
 out.walkContact=await page.evaluate(()=>{let min=Infinity,max=-Infinity,phaseMin=1,phaseMax=0;for(let i=0;i<120;i++){window.__R4D.step(1/120);const s=window.__R4D.snapshot();const gap=Math.min(...Object.values(s.view.renderedSoleGap));min=Math.min(min,gap);max=Math.max(max,gap);phaseMin=Math.min(phaseMin,s.phase);phaseMax=Math.max(phaseMax,s.phase);}return {minClosestSoleGap:min,maxClosestSoleGap:max,phaseMin,phaseMax};});
 return out;
}
