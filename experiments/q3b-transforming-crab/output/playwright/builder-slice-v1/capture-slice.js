async (page) => {
 const out='experiments/q3b-transforming-crab/output/playwright/builder-slice-v1/';
 const snap=()=>page.evaluate(()=>window.__Q3B.snapshot());
 const step=dt=>page.evaluate(dt=>window.__Q3B.step(dt),dt);
 await page.evaluate(()=>{window.__Q3B.setPaused(true);window.__Q3B.reset();});
 const records={module:await snap(),forward:[],reverse:[],retarget:[],samples:[],deltas:[]};
 await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:out+'module-u0.png'});
 await page.getByRole('button',{name:'02 Краб Развернуть опоры'}).click();await step(4.5);
 const initial=await snap();records.forward.push({percent:0,snapshot:initial});
 await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:out+'forward-000.png'});
 await page.getByRole('button',{name:'03 Мастерская Открыть и приступить к работе'}).click();
 for(const [percent,target] of [[25,1.25],[50,1.5],[75,1.75],[100,1.9995]]){
  let count=0,s=await snap();
  while(s.u<target&&count++<1800){await step(1/120);s=await snap();records.samples.push({time:s.time,u:s.u,uv:s.uv,world:s.world});}
  if(count>=1800)throw new Error('Form failed to progress '+percent);
  records.forward.push({percent,snapshot:s});
  await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:out+'forward-'+String(percent).padStart(3,'0')+'.png'});
 }
 function delta(a,b){let xy=0,angle=0;for(const id of Object.keys(a.world)){xy=Math.max(xy,Math.hypot(a.world[id].x-b.world[id].x,a.world[id].y-b.world[id].y));angle=Math.max(angle,Math.abs(a.world[id].angle-b.world[id].angle));}return {u:Math.abs(a.u-b.u),uv:Math.abs(a.uv-b.uv),maxJointPosition:xy,maxAngle:angle};}
 let before=await snap();await page.getByRole('button',{name:'02 Краб Развернуть опоры'}).click();let after=await snap();records.reverse.push({label:'reverse dispatch',before,after});records.deltas.push({label:'reverse',...delta(before,after)});
 for(const target of [1.75,1.5,1.25,1.0005]){let s=await snap(),count=0;while(s.u>target&&count++<1800){await step(1/120);s=await snap();}records.reverse.push({target,snapshot:s});if(target===1.5)await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:out+'reverse-mid.png'});}
 await page.getByRole('button',{name:'03 Мастерская Открыть и приступить к работе'}).click();let s=await snap();while(s.u<1.67){await step(1/120);s=await snap();}
 before=s;await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:out+'retarget-before.png'});
 await page.getByRole('button',{name:'01 Модуль Сложить конструкцию'}).click();after=await snap();records.retarget.push({label:'work to module while opening',before,after});records.deltas.push({label:'third target',...delta(before,after)});
 await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:out+'retarget-after-command.png'});
 await step(.18);records.retarget.push({label:'continued from preserved velocity',snapshot:await snap()});
 await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:out+'retarget-continued.png'});
 for(const d of records.deltas)if(d.maxJointPosition>1e-9||d.maxAngle>1e-9||d.u>1e-9||d.uv>1e-9)throw new Error('Reset at dispatch '+d.label);
 await page.getByText('Рассмотреть движение',{exact:true}).click();await page.getByRole('button',{name:'Шарниры',exact:true}).click();
 await page.evaluate(()=>window.__Q3B.reset());
 await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:out+'module-mast-mount.png'});
 await page.getByRole('button',{name:'Шарниры',exact:true}).click();
 await page.getByRole('button',{name:'03 Мастерская Открыть и приступить к работе'}).click();await step(6);await page.getByRole('combobox',{name:'Свет'}).selectOption('light');
 await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:out+'work-daylight.png'});
 await page.getByRole('combobox',{name:'Свет'}).selectOption('dark');
 await page.evaluate(()=>{window.__Q3B.reset();window.__Q3B.setPaused(false);});
 return records;
}
