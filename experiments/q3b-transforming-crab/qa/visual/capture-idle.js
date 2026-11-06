async(page)=>{
 const out='D:/dev/R4D/experiments/q3b-transforming-crab/qa/visual/output/playwright/c1',rows=[];
 const snap=async name=>{const s=await page.evaluate(()=>window.__Q3B.snapshot());await page.locator('#scene').screenshot({path:out+'/'+name+'.png',scale:'css'});rows.push({file:name+'.png',snapshot:s});};
 for(const [label,name] of [['module','01 Модуль Сложить конструкцию'],['crab','02 Краб Развернуть опоры'],['low','Ниже'],['work','03 Мастерская Открыть и приступить к работе']]){
  await page.getByRole('button',{name,exact:true}).click();await page.waitForTimeout(label==='low'?1500:3500);
  for(let i=0;i<3;i++){await snap('idle-'+label+'-'+i);await page.waitForTimeout(700);}
 }
 await page.getByRole('combobox',{name:'Свет',exact:true}).selectOption('light');await snap('work-daylight');
 await page.getByRole('button',{name:'Пауза · P',exact:true}).click();const before=await page.evaluate(()=>window.__Q3B.snapshot());await page.waitForTimeout(400);const after=await page.evaluate(()=>window.__Q3B.snapshot());await page.getByRole('button',{name:'Один кадр · .',exact:true}).click();const stepped=await page.evaluate(()=>window.__Q3B.snapshot());rows.push({label:'pause-step',before,after,stepped});
 await page.getByRole('button',{name:'Продолжить · P',exact:true}).click();await page.getByRole('combobox',{name:'Свет',exact:true}).selectOption('dark');
 return rows;
}
