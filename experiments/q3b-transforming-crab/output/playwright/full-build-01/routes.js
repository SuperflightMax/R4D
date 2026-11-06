async (page) => {
 const data={routes:[],commands:[],metrics:{maxReach:0,minGap:0},samples:[]};
 const snap=()=>page.evaluate(()=>window.__Q3B.snapshot());
 const step=dt=>page.evaluate(dt=>window.__Q3B.step(dt),dt);
 const buttons={module:'01 Модуль Сложить конструкцию',crab:'02 Краб Развернуть опоры',work:'03 Мастерская Открыть и приступить к работе'};
 await page.evaluate(()=>{window.__Q3B.setPaused(true);window.__Q3B.reset();});
 for(const form of ['crab','module','crab','work','crab']){
  await page.getByRole('button',{name:buttons[form],exact:true}).click();
  for(let i=0;i<180;i++){await step(1/60);const s=await snap();if(i%6===0)data.samples.push({time:s.time,u:s.u,uv:s.uv,world:s.world});}
  data.routes.push({form,snapshot:await snap()});
 }
 await page.getByRole('button',{name:buttons.work,exact:true}).click();let s=await snap();
 while(s.u<1.65){await step(1/120);s=await snap();}
 const before=s;await page.getByRole('button',{name:buttons.module,exact:true}).click();const after=await snap();
 let delta=0;for(const id of before.parts)delta=Math.max(delta,Math.hypot(before.world[id].x-after.world[id].x,before.world[id].y-after.world[id].y),Math.abs(before.world[id].angle-after.world[id].angle));
 data.commands.push({before,after,maxAttachmentDelta:delta});if(delta>1e-9)throw new Error('retarget reset');
 await step(3);await page.getByRole('button',{name:'Вперёд →',exact:true}).click();await step(4);
 for(let i=0;i<360;i++){await step(1/120);s=await snap();for(const v of Object.values(s.solutions))data.metrics.maxReach=Math.max(data.metrics.maxReach,v.requested);data.metrics.minGap=Math.min(data.metrics.minGap,...Object.values(s.soleGaps));}
 await page.getByRole('button',{name:'Стоп',exact:true}).click();await step(2);
 data.afterStop=await snap();return data;
}
