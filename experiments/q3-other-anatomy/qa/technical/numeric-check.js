async (page) => {
  const dir='D:/dev/R4D/experiments/q3-other-anatomy/qa/technical/output/playwright/';
  const read=()=>page.evaluate(()=>window.__R4D.snapshot());
  const step=dt=>page.evaluate(dt=>window.__R4D.step(dt),dt);
  const click=state=>page.getByRole('button',{name:{idle:'Покой · 1',low:'Низкая поза · 2',move:'Двигаться · 3',jump:'Прыжок · пробел'}[state],exact:true}).click();
  const reset=()=>page.getByRole('button',{name:'Сначала · R',exact:true}).click();
  const shot=async name=>page.locator('#scene').screenshot({path:dir+name+'.png'});
  const brief=s=>({time:s.time,state:s.state,ground:s.ground,stateTime:s.stateTime,phase:s.phase,height:s.height,pose:s.pose,world:s.world,solutions:s.solutions,view:s.view,jumps:s.jumpCount,lands:s.landCount});
  const delta=(a,b)=>Math.max(...Object.keys(a).map(k=>Math.abs(a[k]-b[k])));
  const result={method:'Existing product pause/step at 1/120 s; commands through real buttons; alpha>=128 product observer',states:{},interruptions:[],jumps:[],walk:{samples:[]}};
  await page.evaluate(()=>window.__R4D.setPaused(true));
  await reset();await step(.8);result.states.idle=brief(await read());await shot('idle');
  await click('low');await step(.8);result.states.low=brief(await read());await shot('low');
  for(const command of ['move','jump']){
    await reset();await click('low');await step(.08);
    const before=await read();await shot('intermediate-before-'+command);
    await click(command);const after=await read();
    await step(1/120);const next=await read();await shot('intermediate-after-'+command);
    await step(2);const end=await read();
    result.interruptions.push({command,instantPoseDelta:delta(before.pose,after.pose),before:brief(before),after:brief(after),next:brief(next),end:brief(end)});
  }
  for(const [source,target] of [['idle','low'],['low','move'],['move','idle']]){
    await reset();await click(source);await step(.9);await click('jump');
    const samples=[],states=[];let last='',selected=false,minLandGap=Infinity,maxGroundGap=-Infinity,minGap=Infinity;
    for(let i=0;i<275;i++){
      await step(1/120);const s=await read();
      const gaps=Object.values(s.view.renderedSoleGap),gap=Math.min(...gaps);
      minGap=Math.min(minGap,gap);
      if(s.state==='land'){minLandGap=Math.min(minLandGap,gap);maxGroundGap=Math.max(maxGroundGap,gap);}
      if(s.state!==last){states.push({time:s.time,state:s.state,height:s.height,gaps:s.view.renderedSoleGap});last=s.state;}
      if(i%20===0)samples.push({time:s.time,state:s.state,ground:s.ground,height:s.height,gaps:s.view.renderedSoleGap});
      if(source==='idle'&&[15,75,130,190].includes(i))await shot('jump-'+i);
      if(s.state==='flight'&&!selected){await click(target);selected=true;}
    }
    const end=await read();result.jumps.push({source,target,states,samples,minGap,minLandGap,maxGroundGap,end:brief(end)});
  }
  await reset();await click('move');await step(1.4);
  let minSupport=3,maxBestGap=-Infinity,minAnyGap=Infinity,maxReachOverrun=0;
  for(let i=0;i<325;i++){
    await step(1/120);const s=await read(),g=Object.values(s.view.renderedSoleGap);
    const support=g.filter(x=>Math.abs(x)<=.75).length;
    minSupport=Math.min(minSupport,support);maxBestGap=Math.max(maxBestGap,Math.min(...g));minAnyGap=Math.min(minAnyGap,...g);
    maxReachOverrun=Math.max(maxReachOverrun,...Object.values(s.solutions).map(x=>x.requestedDistance-220));
    if(i%12===0)result.walk.samples.push({time:s.time,phase:s.phase,support,gaps:s.view.renderedSoleGap,feet:s.feet});
    if([15,120,225].includes(i))await shot('walk-'+i);
  }
  result.walk={...result.walk,minSupportWithin075ScreenPx:minSupport,maxBestGap,minAnyGap,maxReachOverrun};
  const before=await read();await click('low');const after=await read();await step(.07);await click('idle');await step(.05);await click('move');await step(.7);
  result.walkInterruption={beforePhase:before.phase,instantPoseDelta:delta(before.pose,after.pose),end:brief(await read())};
  await page.getByRole('button',{name:'Кости · B',exact:true}).click();await shot('bones');
  await page.getByRole('button',{name:'Кости · B',exact:true}).click();
  await page.locator('#background').selectOption('dark');await shot('dark-move');
  await page.locator('#background').selectOption('light');
  result.final=brief(await read());
  return result;
}
