async (page) => {
 const out='D:/dev/R4D/experiments/q3b-transforming-crab/qa/visual/output/playwright/c1';
 const names={module:'01 Модуль Сложить конструкцию',crab:'02 Краб Развернуть опоры',work:'03 Мастерская Открыть и приступить к работе'};
 const box=await page.locator('#scene').boundingBox();const rows=[];
 const capture=async(name)=>{const s=await page.evaluate(()=>window.__Q3B.snapshot());await page.screenshot({path:out+'/'+name+'.png',clip:box,scale:'css'});rows.push({file:name+'.png',snapshot:s});};
 await capture('module-idle-start');await page.waitForTimeout(1000);await capture('module-idle-later');
 for(const [label,form] of [['module-crab','crab'],['crab-work','work'],['work-crab','crab'],['crab-module','module']]){
  await page.getByRole('button',{name:names[form],exact:true}).click();const start=Date.now();
  for(let i=0;i<12;i++){const remaining=start+i*270-Date.now();if(remaining>0)await page.waitForTimeout(remaining);await capture(label+'-'+String(i).padStart(2,'0'));}
  await page.waitForTimeout(350);await capture(label+'-end');
 }
 return rows;
}
