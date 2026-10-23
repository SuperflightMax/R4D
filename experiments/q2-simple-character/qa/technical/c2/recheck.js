async page => {
 await page.waitForFunction(()=>window.__R4D);
 const click=s=>page.getByRole('button',{name:{idle:'Покой · 1',low:'Низкая поза · 2',move:'Идти · 3',jump:'Прыжок · пробел',reset:'Сначала · R'}[s],exact:true}).click();
 const snap=()=>page.evaluate(()=>window.__R4D.snapshot());
 const step=t=>page.evaluate(t=>window.__R4D.step(t),t);
 const summary=s=>({t:s.time,state:s.state,ground:s.ground,phase:s.phase,rootY:s.pose.rootY,kneeDeg:s.pose.shinNear*180/Math.PI,scale:s.view.scale,soleGap:s.view.renderedSoleGap,jumps:s.jumpCount,lands:s.landCount,partCount:s.partCount,world:s.world});
 const out={candidate:'q2-c2',frames:{},interrupts:[]};
 const liveA=await snap();await page.waitForTimeout(300);const liveB=await snap();out.runningIdle={timeAdvance:liveB.time-liveA.time,rootDelta:liveB.pose.rootY-liveA.pose.rootY};
 await page.getByRole('button',{name:'Пауза · P',exact:true}).click();
 const frame=async name=>{out.frames[name]=summary(await snap());await page.getByRole('region',{name:'Анимированный персонаж'}).screenshot({path:`${name}.png`});};
 await click('reset');await step(1.32);await frame('idle');
 await click('reset');await click('low');await step(1.32);await frame('low');
 await click('reset');await click('move');await step(1);await frame('move-a');await step(.35);await frame('move-b');
 await click('jump');await step(.36);await click('low');await step(.12);await frame('flight-low');
 let firstLand=null;const phases=[];let prev='';
 for(let i=0;i<190;i++){
  await step(1/120);const s=await snap();if(s.state!==prev){phases.push({state:s.state,t:s.time});prev=s.state;}
  if(s.state==='land'&&!firstLand){firstLand=summary(s);await frame('first-land-low');}
 }
 await frame('after-land-low');out.landing={firstLand,phases,final:summary(await snap())};
 for(const destination of ['move','jump']){
  await click('reset');await click('low');await step(.06);const before=await snap();await frame(`intermediate-${destination}`);
  await click(destination);const after=await snap();await step(.18);await frame(`interrupt-${destination}`);await step(1.6);const end=await snap();
  out.interrupts.push({destination,intermediateRoot:before.pose.rootY,unchangedAtCommand:JSON.stringify(before.pose)===JSON.stringify(after.pose),end:summary(end)});
 }
 return out;
}
