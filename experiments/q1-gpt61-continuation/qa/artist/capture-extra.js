async (page) => {
 const base='D:/dev/R4D/experiments/q1-gpt61-continuation/qa/artist/';
 await page.getByRole('button',{name:'Низкая поза · 2',exact:true}).click();
 await page.getByRole('button',{name:'Прыжок · пробел',exact:true}).click();
 for(let i=0;i<7;i++){await page.waitForTimeout(110);await page.locator('#scene').screenshot({path:base+`low-jump-${i}.png`});if(i===2)await page.getByRole('button',{name:'Идти · 3',exact:true}).click();}
 await page.getByRole('combobox',{name:'Фон'}).selectOption('dark');
 await page.getByRole('button',{name:'Низкая поза · 2',exact:true}).click();
 await page.locator('#scene').screenshot({path:base+'low-dark.png'});
 await page.getByRole('combobox',{name:'Фон'}).selectOption('medium');
 await page.getByRole('button',{name:'Покой · 1',exact:true}).click();
 await page.locator('#scene').screenshot({path:base+'idle-medium.png'});
 await page.getByRole('combobox',{name:'Фон'}).selectOption('light');
 return await page.locator('#status').innerText();
}
