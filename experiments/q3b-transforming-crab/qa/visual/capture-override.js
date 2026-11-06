async(page)=>{
 const out='D:/dev/R4D/experiments/q3b-transforming-crab/qa/visual/output/playwright/c1',rows=[];
 const snap=async name=>{const s=await page.evaluate(()=>window.__Q3B.snapshot());await page.locator('#scene').screenshot({path:out+'/'+name+'.png',scale:'css'});rows.push({file:name+'.png',snapshot:s});};
 await page.getByRole('button',{name:'▶ Показать всё',exact:true}).click();await snap('override-start');await page.waitForTimeout(650);
 await page.keyboard.press('Space');await snap('override-jump-request');
 for(let i=0;i<12;i++){await page.waitForTimeout(330);await snap('override-'+String(i).padStart(2,'0'));}
 await page.getByRole('button',{name:'03 Мастерская Открыть и приступить к работе',exact:true}).click();await page.waitForTimeout(1000);await page.getByRole('button',{name:'Пауза · P',exact:true}).click();await snap('paused-mid-transform');
 const before=await page.evaluate(()=>window.__Q3B.snapshot());await page.waitForTimeout(300);const still=await page.evaluate(()=>window.__Q3B.snapshot());
 await page.getByRole('button',{name:'01 Модуль Сложить конструкцию',exact:true}).click();const retarget=await page.evaluate(()=>window.__Q3B.snapshot());await page.getByRole('button',{name:'Один кадр · .',exact:true}).click();const stepped=await page.evaluate(()=>window.__Q3B.snapshot());
 rows.push({label:'paused-mid-retarget',before,still,retarget,stepped});await snap('paused-mid-after-frame');
 await page.getByRole('button',{name:'Продолжить · P',exact:true}).click();await page.waitForTimeout(4200);await snap('paused-reverse-settled');return rows;
}
