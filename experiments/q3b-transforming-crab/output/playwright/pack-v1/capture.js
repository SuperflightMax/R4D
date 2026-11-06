async(page)=>{
 const data={forward:[],reverse:[],maxGroundPenetration:0,maxAdjacentJointStep:0};
 const snap=()=>page.evaluate(()=>window.__Q3B.snapshot());const step=dt=>page.evaluate(dt=>window.__Q3B.step(dt),dt);
 await page.evaluate(()=>{window.__Q3B.setPaused(true);window.__Q3B.reset();});
 data.module=await snap();await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:'experiments/q3b-transforming-crab/output/playwright/pack-v1/module-after.png'});
 await page.getByRole('button',{name:'02 Краб Развернуть опоры',exact:true}).click();let prev=await snap();
 for(let i=0;i<420;i++){
  await step(1/120);const s=await snap();
  for(const id of s.parts)data.maxAdjacentJointStep=Math.max(data.maxAdjacentJointStep,Math.hypot(s.world[id].x-prev.world[id].x,s.world[id].y-prev.world[id].y));
  data.maxGroundPenetration=Math.max(data.maxGroundPenetration,-s.soleGaps.Left,-s.soleGaps.Right,-16-s.soleGaps.Rear);
  if(i%6===0)data.forward.push({time:s.time,u:s.u,uv:s.uv,world:s.world,gaps:s.soleGaps});
  if(i===20||i===50||i===110)await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:'experiments/q3b-transforming-crab/output/playwright/pack-v1/unfold-'+i+'.png'});
  prev=s;
 }
 data.crab=await snap();await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:'experiments/q3b-transforming-crab/output/playwright/pack-v1/crab-after.png'});
 await page.getByRole('button',{name:'01 Модуль Сложить конструкцию',exact:true}).click();
 for(let i=0;i<420;i++){await step(1/120);if(i%6===0){const s=await snap();data.reverse.push({time:s.time,u:s.u,uv:s.uv,world:s.world,gaps:s.soleGaps});}}
 await page.getByRole('button',{name:'Ниже',exact:true}).click();await step(4.5);data.low=await snap();
 await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:'experiments/q3b-transforming-crab/output/playwright/pack-v1/low-after.png'});
 await page.getByRole('button',{name:'03 Мастерская Открыть и приступить к работе',exact:true}).click();await step(5);data.work=await snap();
 await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:'experiments/q3b-transforming-crab/output/playwright/pack-v1/work-after.png'});
 return data;
}
