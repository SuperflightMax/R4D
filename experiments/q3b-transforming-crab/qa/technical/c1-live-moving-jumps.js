async (page) => {
 const dir='D:/dev/R4D/experiments/q3b-transforming-crab/qa/technical/output/playwright/c1/';
 const read=()=>page.evaluate(()=>window.__Q3B.snapshot());
 const brief=s=>({t:s.time,u:s.u,form:s.form,action:s.action,x:s.x,speed:s.speed,jump:s.jump,height:s.height,jumps:s.jumpCount,lands:s.landCount,gaps:s.soleGaps,bounds:s.view.characterBounds});
 const result={reason:'Explicit live walking precondition in BOTH directions; earlier broad live script requested backward jump before crab deployment completed',cases:[]};
 await page.evaluate(()=>window.__Q3B.setPaused(false));
 for(const [direction,name,target,label] of [[1,'Вперёд →','module','01 Модуль Сложить конструкцию'],[-1,'← Назад','work','03 Мастерская Открыть и приступить к работе']]){
  await page.getByRole('button',{name:'Сначала',exact:true}).click();
  await page.getByRole('button',{name,exact:true}).click();
  await page.waitForFunction(dir=>{const s=window.__Q3B.snapshot();return s.action==='move'&&s.jump==='ground'&&dir*s.speed>45;},direction,{timeout:12000});
  const start=await read();await page.locator('#scene').screenshot({path:dir+'walk-pre-jump-'+direction+'.png'});
  await page.getByRole('button',{name:'Прыгнуть ↑',exact:true}).click();
  const samples=[],shots=[];let selected=false,last='';
  for(let i=0;i<70;i++){
   await page.waitForTimeout(90);const s=await read();samples.push(brief(s));
   if(s.jump!==last){const file='walk-jump-'+direction+'-'+s.jump+'-'+i+'.png';await page.locator('#scene').screenshot({path:dir+file});shots.push({file,...brief(s)});last=s.jump;}
   if(s.jump==='flight'&&!selected){await page.getByRole('button',{name:label,exact:true}).click();selected=true;}
   if(selected&&s.jump==='ground'&&Math.abs(s.u-(target==='work'?2:0))<.006)break;
  }
  const end=await read();result.cases.push({direction,target,start:brief(start),samples,shots,selected,end:brief(end),events:end.events});
 }
 return result;
}
