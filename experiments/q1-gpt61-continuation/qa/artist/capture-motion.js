async (page) => {
 const base='D:/dev/R4D/experiments/q1-gpt61-continuation/qa/artist/';
 await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
 await page.getByRole('button',{name:'Низкая поза · 2',exact:true}).click();
 for(let i=0;i<6;i++){await page.waitForTimeout(90);await page.locator('#scene').screenshot({path:base+`low-${i}.png`});}
 await page.getByRole('button',{name:'Идти · 3',exact:true}).click();
 for(let i=0;i<6;i++){await page.waitForTimeout(110);await page.locator('#scene').screenshot({path:base+`move-${i}.png`});}
 await page.getByRole('button',{name:'Прыжок · пробел',exact:true}).click();
 for(let i=0;i<8;i++){await page.waitForTimeout(110);await page.locator('#scene').screenshot({path:base+`jump-${i}.png`});if(i===3)await page.getByRole('button',{name:'Низкая поза · 2',exact:true}).click();}
 return await page.getByRole('region',{name:'Анимированный персонаж'}).count();
}
