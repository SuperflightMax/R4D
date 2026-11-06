async (page) => {
 const out='D:/dev/R4D/experiments/q3b-transforming-crab/qa/visual/output/playwright/c1',rows=[];
 const names={module:'01 Модуль Сложить конструкцию',crab:'02 Краб Развернуть опоры',work:'03 Мастерская Открыть и приступить к работе',forward:'Вперёд →',backward:'← Назад',stop:'Стоп',low:'Ниже',jump:'Прыгнуть ↑'};
 const click=async k=>page.getByRole('button',{name:names[k],exact:true}).click();
 const snap=async name=>{const s=await page.evaluate(()=>window.__Q3B.snapshot());await page.locator('#scene').screenshot({path:out+'/'+name+'.png',scale:'css'});rows.push({file:name+'.png',snapshot:s});};
 for(const [label,setup,airGoal] of [['jump-low','low','crab'],['jump-forward','forward','work'],['jump-backward','backward','module']]){
  await click(setup);
  await page.waitForFunction((moving)=>{const s=window.__Q3B.snapshot();return s.jump==='ground'&&Math.abs(s.u-1)<.02&&(!moving||Math.abs(s.speed)>40);},setup!=='low',{timeout:12000});
  await page.waitForTimeout(setup==='low'?900:600);await snap(label+'-before');await click('jump');
  for(let i=0;i<12;i++) {await snap(label+'-prepare-'+String(i).padStart(2,'0'));if((await page.evaluate(()=>window.__Q3B.snapshot().jump))==='flight')break;await page.waitForTimeout(55);}
  await page.waitForFunction(()=>window.__Q3B.snapshot().jump==='flight',null,{timeout:6000});
  const start=Date.now();let sent=false;
  for(let i=0;i<11;i++){
   const remaining=start+i*105-Date.now();if(remaining>0)await page.waitForTimeout(remaining);
   if(i===2){const before=await page.evaluate(()=>window.__Q3B.snapshot());await click(airGoal);rows.push({label,command:airGoal,before,after:await page.evaluate(()=>window.__Q3B.snapshot())});sent=true;}
   await snap(label+'-air-land-'+String(i).padStart(2,'0'));
  }
  await page.waitForTimeout(3600);await snap(label+'-settled');
 }
 return rows;
}
