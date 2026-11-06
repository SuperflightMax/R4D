async(page)=>{
 const records=[];const advance=dt=>page.evaluate(dt=>{window.__Q3B.step(dt);return window.__Q3B.snapshot();},dt);
 for(const [direction,target]of [[1,'work'],[-1,'work'],[1,'module'],[-1,'crab']]){
  await page.evaluate(()=>{window.__Q3B.setPaused(true);window.__Q3B.reset();});
  await page.getByRole('button',{name:direction===1?'Вперёд →':'← Назад',exact:true}).click();await advance(6);
  await page.getByRole('button',{name:'Прыгнуть ↑',exact:true}).click();
  let previous=await page.evaluate(()=>window.__Q3B.snapshot()),takeoff=null,landing=null,beforeRequest=null,afterRequest=null,maxStep=0,minTop=Infinity,commanded=false;
  for(let i=0;i<1500;i++){
   let s=await advance(1/240);minTop=Math.min(minTop,s.view.characterBounds.y);
   for(const id of s.parts)maxStep=Math.max(maxStep,Math.hypot(s.world[id].x-previous.world[id].x,s.world[id].y-previous.world[id].y));
   if(previous.jump==='prepare'&&s.jump==='flight')takeoff={before:previous,after:s,footDeltas:Object.fromEntries(['Left','Right','Rear'].map(id=>[id,{x:s.world['foot'+id].x-previous.world['foot'+id].x,y:s.world['foot'+id].y-previous.world['foot'+id].y}]))};
   if(!commanded&&s.jump==='flight'&&s.jumpTime>.3){
    beforeRequest=s;await page.getByRole('button',{name:target==='work'?'03 Мастерская Открыть и приступить к работе':target==='module'?'01 Модуль Сложить конструкцию':'02 Краб Развернуть опоры',exact:true}).click();afterRequest=await page.evaluate(()=>window.__Q3B.snapshot());
    for(const id of s.parts)if(Math.hypot(s.world[id].x-afterRequest.world[id].x,s.world[id].y-afterRequest.world[id].y)>1e-8)throw new Error('rendered airborne request reset '+id);
    await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:'experiments/q3b-transforming-crab/output/playwright/takeoff-fix/flight-'+direction+'-'+target+'.png'});s=afterRequest;commanded=true;
   }
   if(previous.jump==='flight'&&s.jump==='land')landing={before:previous,after:s};
   previous=s;if(takeoff&&landing&&s.jump==='ground')break;
  }
  if(!takeoff||!landing)throw new Error('missing jump phase');
  for(const d of Object.values(takeoff.footDeltas))if(Math.abs(d.x)>.01)throw new Error('horizontal takeoff teleport');
  const final=await advance(6);if(final.jumpCount!==1||final.landCount!==1||final.form!==target)throw new Error('wrong landing');
  records.push({direction,target,takeoff,landing,beforeRequest,afterRequest,final,maxStepAt240Hz:maxStep,minTop});
 }
 await page.evaluate(()=>{window.__Q3B.reset();window.__Q3B.setPaused(false);});return records;
}
