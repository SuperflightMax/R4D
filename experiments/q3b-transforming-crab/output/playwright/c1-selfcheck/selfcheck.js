async(page)=>{
 const output='experiments/q3b-transforming-crab/output/playwright/c1-selfcheck/';
 const results={cases:[],issues:[],metrics:{minTop:Infinity,maxBottom:0,minGap:0,maxReach:0,minPlanted:3,maxJointStep:0}};
 const labels={module:'01 Модуль Сложить конструкцию',crab:'02 Краб Развернуть опоры',work:'03 Мастерская Открыть и приступить к работе'};
 const snap=()=>page.evaluate(()=>window.__Q3B.snapshot());
 const advance=async(seconds)=>{
  const sample=await page.evaluate(seconds=>{
   const metrics={minTop:Infinity,maxBottom:0,minGap:0,maxReach:0,minPlanted:3,maxJointStep:0};let remaining=seconds,last=window.__Q3B.snapshot();
   while(remaining>1e-8){const dt=Math.min(remaining,1/120);window.__Q3B.step(dt);remaining-=dt;const s=window.__Q3B.snapshot();metrics.minTop=Math.min(metrics.minTop,s.view.characterBounds.y);metrics.maxBottom=Math.max(metrics.maxBottom,s.view.characterBounds.y+s.view.characterBounds.height);
    for(const id of s.parts){const delta=Math.hypot(s.world[id].x-last.world[id].x,s.world[id].y-last.world[id].y);if(delta>metrics.maxJointStep){metrics.maxJointStep=delta;metrics.worst={id,delta,before:{time:last.time,u:last.u,jump:last.jump,pose:last.pose,world:last.world},after:{time:s.time,u:s.u,jump:s.jump,pose:s.pose,world:s.world}};}}
    if(s.pose.deploy===1){metrics.maxReach=Math.max(metrics.maxReach,...Object.values(s.solutions).map(l=>l.requested));metrics.minGap=Math.min(metrics.minGap,...Object.values(s.soleGaps));if(s.jump==='ground'&&Math.abs(s.speed)>30)metrics.minPlanted=Math.min(metrics.minPlanted,Object.values(s.soleGaps).filter(g=>Math.abs(g)<.001).length);}
    last=s;
   }return{metrics,snapshot:last};
  },seconds);
  for(const key of ['minTop','minGap','minPlanted'])results.metrics[key]=Math.min(results.metrics[key],sample.metrics[key]);
  if(sample.metrics.maxJointStep>results.metrics.maxJointStep)results.worstStep=sample.metrics.worst; for(const key of ['maxBottom','maxReach','maxJointStep'])results.metrics[key]=Math.max(results.metrics[key],sample.metrics[key]);
  return sample.snapshot;
 };
 const reset=()=>page.evaluate(()=>{window.__Q3B.setPaused(true);window.__Q3B.reset();});
 for(const from of ['module','crab','work'])for(const to of ['module','crab','work']){
  await reset();await page.getByRole('button',{name:labels[from],exact:true}).click();await advance(6);
  await page.getByRole('button',{name:'Прыгнуть ↑',exact:true}).click();let s=await snap(),guard=0;
  while(s.jump!=='flight'&&guard++<700)s=await advance(1/120);
  if(s.jump!=='flight')throw new Error('No flight from '+from);
  await advance(.36);const before=await snap();await page.getByRole('button',{name:labels[to],exact:true}).click();const after=await snap();
  let delta=0;for(const id of before.parts)delta=Math.max(delta,Math.hypot(before.world[id].x-after.world[id].x,before.world[id].y-after.world[id].y),Math.abs(before.world[id].angle-after.world[id].angle));
  if(delta>1e-9)throw new Error('Airborne retarget reset');
  if(from==='crab'&&to==='work')await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:output+'jump-peak.png'});
  s=await advance(6);
  if(s.jumpCount!==1||s.landCount!==1||s.form!==to||Math.abs(s.u-({module:0,crab:1,work:2}[to]))>.02)throw new Error('Landing wrong '+from+'/'+to);
  results.cases.push({name:'jump '+from+' -> '+to,delta,final:s});
 }
 await reset();await page.getByRole('button',{name:'Прыгнуть ↑',exact:true}).click();await page.getByRole('button',{name:'Стоп',exact:true}).click();let s=await advance(5);if(s.jumpCount!==0)throw new Error('Queued jump not cancelled');results.cases.push({name:'queued jump cancelled',state:s});
 await page.getByRole('button',{name:'Вперёд →',exact:true}).click();await advance(5);s=await snap();if(s.speed<50)throw new Error('No forward movement');
 await page.getByRole('button',{name:'← Назад',exact:true}).click();const afterDirection=await snap();if(afterDirection.speed!==s.speed)throw new Error('Direction velocity reset');await advance(5);s=await snap();if(s.speed>-50)throw new Error('No backward movement');
 await page.getByRole('button',{name:'Стоп',exact:true}).click();s=await advance(3);if(Math.abs(s.speed)>.1)throw new Error('Failed braking');results.cases.push({name:'forward reverse stop',final:s});
 await page.getByRole('button',{name:'Ниже',exact:true}).click();s=await advance(3);results.cases.push({name:'low',final:s});await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:output+'low.png'});
 await page.getByRole('button',{name:labels.work,exact:true}).click();await advance(6);await page.getByRole('button',{name:'▶ Показать всё',exact:true}).click();await page.evaluate(()=>window.__Q3B.setPaused(true));s=await advance(.5);
 await page.getByRole('button',{name:'Ниже',exact:true}).click();if((await snap()).auto!==null)throw new Error('Manual input did not cancel show');results.cases.push({name:'manual cancels show'});
 await page.getByRole('button',{name:'▶ Показать всё',exact:true}).click();await page.evaluate(()=>window.__Q3B.setPaused(true));s=await advance(47);if(s.auto!==null||s.jumpCount<1||s.landCount!==s.jumpCount)throw new Error('Show failed');results.cases.push({name:'complete show',final:s});
 await page.keyboard.press('1');await advance(3);await page.keyboard.press('2');await advance(.1);const before=await snap();await page.keyboard.press('3');const after=await snap();
 let delta=0;for(const id of before.parts)delta=Math.max(delta,Math.hypot(before.world[id].x-after.world[id].x,before.world[id].y-after.world[id].y));if(delta>1e-9)throw new Error('Keyboard retarget reset');results.cases.push({name:'keyboard mid-retarget',delta});
 await advance(6);await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:output+'work.png'});
 await page.getByText('Рассмотреть движение',{exact:true}).click();await page.getByRole('button',{name:'Шарниры',exact:true}).click();await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:output+'work-joints.png'});await page.getByRole('button',{name:'Шарниры',exact:true}).click();
 await page.getByRole('combobox',{name:'Свет'}).selectOption('light');await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:output+'daylight.png'});await page.getByRole('combobox',{name:'Свет'}).selectOption('dark');
 if(results.metrics.minTop<0)results.issues.push('character clipped at top during jump/transform');if(results.metrics.maxReach>195.01)results.issues.push('unreachable deployed target');if(results.metrics.minGap<-.02)results.issues.push('sole plane penetration');if(results.metrics.minPlanted<2)results.issues.push('less than two planted feet in movement');
 await page.evaluate(()=>{window.__Q3B.reset();window.__Q3B.setPaused(false);});return results;
}



