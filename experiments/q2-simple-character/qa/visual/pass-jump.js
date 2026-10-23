async (page) => {
 const stage=page.getByRole('region',{name:'Анимированный персонаж',exact:true});
 await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
 await page.getByRole('button',{name:'Продолжить · P',exact:true}).click();
 await page.getByRole('slider',{name:'Скорость времени',exact:true}).fill('0.3');
 await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption({label:'Светлый'});
 await page.getByRole('button',{name:'Прыжок · пробел',exact:true}).click();
 for(let i=0;i<21;i++){await page.waitForTimeout(115);await stage.screenshot({path:`jump-${i}.png`});}
 await page.getByRole('button',{name:'Низкая поза · 2',exact:true}).click();
 await page.waitForTimeout(1200);
 await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption({label:'Тёмный'});
 await page.getByRole('button',{name:'Прыжок · пробел',exact:true}).click();
 for(let i=0;i<20;i++){
   await page.waitForTimeout(115);
   if(i===7) await page.getByRole('button',{name:'Идти · 3',exact:true}).click();
   if(i===10) await page.getByRole('button',{name:'Низкая поза · 2',exact:true}).click();
   await stage.screenshot({path:`jump-low-retarget-${i}.png`});
 }
 await page.getByRole('button',{name:'Пауза · P',exact:true}).click();
}
