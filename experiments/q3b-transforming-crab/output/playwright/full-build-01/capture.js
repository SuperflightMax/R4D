async (page) => {
 const records=[];await page.evaluate(()=>{window.__Q3B.setPaused(true);window.__Q3B.reset();});
 for(const [form,button] of [['module','01 Модуль Сложить конструкцию'],['crab','02 Краб Развернуть опоры'],['work','03 Мастерская Открыть и приступить к работе']]){
  await page.getByRole('button',{name:button,exact:true}).click();await page.evaluate(()=>window.__Q3B.step(5));
  const s=await page.evaluate(()=>window.__Q3B.snapshot());if(s.parts.length!==23)throw new Error('Not full art');records.push({form,snapshot:s});
  await page.getByRole('region',{name:'Интерактивный фонарный механик'}).screenshot({path:'experiments/q3b-transforming-crab/output/playwright/full-build-01/'+form+'.png'});
 }
 return records;
}
