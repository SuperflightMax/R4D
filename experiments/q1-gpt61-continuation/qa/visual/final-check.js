async(page)=>{
 const root='D:/dev/R4D/experiments/q1-gpt61-continuation/qa/visual/';
 await page.setViewportSize({width:1440,height:1000});
 const step=page.getByRole('button',{name:'Шаг · .',exact:true});
 const advance=async n=>{for(let i=0;i<n;i++)await step.click()};
 const state=async()=> (await page.locator('body').innerText()).split('Нажимайте')[1]?.split('Маршруты')[0];
 const results={};
 await page.getByRole('button',{name:'В середине → идти',exact:true}).click();await advance(38);results.midMove=await state();
 await page.getByRole('button',{name:'В середине → прыжок',exact:true}).click();await advance(38);results.midJump=await state();
 await advance(95);
 await page.getByRole('button',{name:'Маршрут 1',exact:true}).click();await advance(10);
 await page.keyboard.press('2');await advance(35);results.manualInterrupt=await state();
 const range=page.getByRole('slider',{name:'Скорость времени',exact:true});await range.press('Home');
 await page.getByRole('button',{name:'Идти · 3',exact:true}).click();
 await page.getByRole('button',{name:'Продолжить · P',exact:true}).click();
 await page.waitForTimeout(950);results.slow1=await state();
 await page.getByRole('region',{name:'Анимированный персонаж',exact:true}).screenshot({path:root+'raw-slow1.png'});
 await page.waitForTimeout(950);results.slow2=await state();
 await page.getByRole('region',{name:'Анимированный персонаж',exact:true}).screenshot({path:root+'raw-slow2.png'});
 await page.getByRole('button',{name:'Пауза · P',exact:true}).click();
 await page.keyboard.press('1');await advance(35);await page.keyboard.press('b');
 await page.getByRole('region',{name:'Анимированный персонаж',exact:true}).screenshot({path:root+'raw-idle-bones.png'});
 return results;
}
