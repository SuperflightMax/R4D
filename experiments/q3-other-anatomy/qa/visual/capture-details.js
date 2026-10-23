async (page) => {
 const out='D:/dev/R4D/experiments/q3-other-anatomy/qa/visual/output/playwright';const rows=[];
 for(const [label,next] of [['early-mid-move','Двигаться · 3'],['early-mid-jump','Прыжок · пробел']]){
  await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
  await page.getByRole('button',{name:'Низкая поза · 2',exact:true}).click();
  await page.waitForTimeout(60);
  const before=await page.evaluate(()=>window.__R4D.snapshot());
  await page.getByRole('button',{name:next,exact:true}).click();
  const after=await page.evaluate(()=>window.__R4D.snapshot());
  await page.screenshot({path:out+'/'+label+'-immediate.png',scale:'css'});
  await page.waitForTimeout(350);
  await page.screenshot({path:out+'/'+label+'-later.png',scale:'css'});
  rows.push({label,before,after,later:await page.evaluate(()=>window.__R4D.snapshot())});
 }
 await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
 await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption('dark');
 await page.waitForTimeout(500);
 await page.screenshot({path:out+'/idle-dark.png',scale:'css'});
 await page.getByRole('button',{name:'Низкая поза · 2',exact:true}).click();
 await page.waitForTimeout(650);
 await page.getByRole('button',{name:'Пауза · P',exact:true}).click();
 await page.screenshot({path:out+'/low-dark.png',scale:'css'});
 return rows;
}
