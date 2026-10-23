async (page) => {
  const out='D:/dev/R4D/experiments/q4-whole-character/qa/visual/output/playwright';
  const controls={idle:'Покой · 1',low:'Низкая поза · 2',move:'Идти · 3',jump:'Прыжок · пробел'};
  const records=[];
  const box=await page.locator('#scene').boundingBox();
  const clip={x:box.x+box.width/2-290,y:box.y,width:580,height:box.height};
  const shot=async(file,label)=>{
    const snapshot=await page.evaluate(()=>window.__R4D.snapshot());
    await page.screenshot({path:out+'/'+file,clip,scale:'css'});
    records.push({file,label,snapshot});
  };
  const reset=async()=>{
    await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
    const paused=await page.evaluate(()=>window.__R4D.snapshot().paused);
    if(paused) await page.getByRole('button',{name:'Продолжить · P',exact:true}).click();
  };
  const sequences=[
    {name:'route1',commands:[[0,'idle'],[.65,'low'],[1.6,'move'],[3.5,'idle'],[4.5,'jump']],frames:[.2,.85,1.3,1.85,2.2,2.55,2.95,3.75,4.25,4.62,4.85,5.08,5.3,5.55,5.85,6.2]},
    {name:'route2',commands:[[0,'move'],[1.5,'low'],[2.5,'jump'],[2.95,'move'],[4.5,'jump'],[4.95,'low']],frames:[.2,.6,1.1,1.7,2.2,2.62,2.85,3.1,3.4,3.8,4.2,4.62,4.85,5.12,5.4,5.8,6.2]}
  ];
  for(const seq of sequences){
    await reset();
    const timeline=[...seq.commands.map(([t,command])=>({t,command})),...seq.frames.map((t,i)=>({t,i}))].sort((a,b)=>a.t-b.t);
    const start=Date.now();
    for(const item of timeline){
      const remaining=start+item.t*1000-Date.now();if(remaining>0) await page.waitForTimeout(remaining);
      if(item.command){await page.getByRole('button',{name:controls[item.command],exact:true}).click();continue;}
      await shot(seq.name+'-'+String(item.i).padStart(2,'0')+'.png',{sequence:seq.name,requestedTime:item.t,wallTime:(Date.now()-start)/1000});
    }
  }
  // Freeze via the actual UI, step eight real UI frames into idle -> low,
  // issue the new command in that intermediate pose, then resume real playback.
  for(const next of ['move','jump']){
    await reset();
    await page.getByRole('button',{name:'Пауза · P',exact:true}).click();
    await page.getByRole('button',{name:controls.low,exact:true}).click();
    for(let i=0;i<8;i++) await page.getByRole('button',{name:'Шаг · .',exact:true}).click();
    await shot('mid-'+next+'-before.png',{sequence:'mid-'+next,phase:'before new input'});
    await page.getByRole('button',{name:controls[next],exact:true}).click();
    await shot('mid-'+next+'-immediate.png',{sequence:'mid-'+next,phase:'same paused pose after input'});
    await page.getByRole('button',{name:'Продолжить · P',exact:true}).click();
    await page.waitForTimeout(180);
    await shot('mid-'+next+'-later.png',{sequence:'mid-'+next,phase:'180ms after resume'});
    if(next==='jump'){
      await page.getByRole('button',{name:controls.move,exact:true}).click();
      await page.waitForTimeout(220);
      await shot('mid-jump-air-target.png',{sequence:'mid-jump',phase:'airborne ground target move'});
      await page.waitForTimeout(1000);
      await shot('mid-jump-landed.png',{sequence:'mid-jump',phase:'after landing'});
    }
  }
  return records;
}
