async(page)=>{
 const records=[],takeoffs=[],retargets=[];
 const step=s=>page.evaluate(s=>__Q3B.step(s),s);
 const snap=()=>page.evaluate(()=>__Q3B.snapshot());
 async function cap(name){await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)))); const snapshot=await snap();await page.locator('#scene').screenshot({path:'D:/dev/R4D/experiments/q3b-transforming-crab/output/artist-candidate/'+name+'.png'});records.push({name,snapshot});}
 await page.getByRole('combobox',{name:'Свет',exact:true}).selectOption('dark');
 for(const dir of ['forward','backward']){
  await page.evaluate(()=>{__Q3B.reset();__Q3B.setPaused(true);});
  await page.locator('[data-form=crab]').click();await step(6);
  await page.getByRole('button',{name:dir==='forward'?'Вперёд →':'← Назад',exact:true}).click();await step(1.4);await cap(dir+'-pre-jump');
  await page.getByRole('button',{name:'Прыгнуть ↑',exact:true}).click();await step(.23);await cap(dir+'-prepare');
  const pair=await page.evaluate(()=>{let before=__Q3B.snapshot();for(let i=0;i<200;i++){before=__Q3B.snapshot();__Q3B.step(1/600);if(__Q3B.snapshot().jump==='flight')return {before,after:__Q3B.snapshot()};}throw Error('No takeoff');});
  takeoffs.push({dir,...pair});await cap(dir+'-takeoff');await step(.15);await cap(dir+'-flight-015');await step(.25);await cap(dir+'-peak');
  const before=await snap();await page.locator('[data-form=work]').click();const after=await snap();retargets.push({dir,before,after});
  await step(.38);await cap(dir+'-descending');await step(.06);await cap(dir+'-land');await step(1);await cap(dir+'-settle');await step(3);await cap(dir+'-work');
 }
 await page.evaluate(()=>{__Q3B.reset();__Q3B.setPaused(true);});await cap('module-idle-extra-0');await step(.8);await cap('module-idle-extra-1');
 return {records,takeoffs,retargets};
}
