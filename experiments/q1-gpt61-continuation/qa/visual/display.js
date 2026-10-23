async(page)=>{
 const root='D:/dev/R4D/experiments/q1-gpt61-continuation/qa/visual/';
 const step=page.getByRole('button',{name:'Шаг · .',exact:true});
 const advance=async n=>{for(let i=0;i<n;i++)await step.click()};
 const region=page.getByRole('region',{name:'Анимированный персонаж',exact:true});
 await page.keyboard.press('2');await advance(35);
 await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption({label:'Средний'});
 await region.screenshot({path:root+'raw-low-mid.png'});
 await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption({label:'Тёмный'});
 await region.screenshot({path:root+'05-low-dark.png'});
 await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption({label:'Светлый'});
 const frame=page.frameLocator('iframe');
 await frame.getByRole('button',{name:'Пауза · P',exact:true}).click();
 await frame.getByRole('region',{name:'Анимированный персонаж',exact:true}).screenshot({path:root+'06-baseline-idle.png'});
 await page.setViewportSize({width:390,height:844});
 await page.getByRole('heading',{name:'Тот же герой, новые позы',exact:true}).scrollIntoViewIfNeeded();
 await page.screenshot({path:root+'07-mobile-low.png'});
 await page.getByRole('button',{name:'Идти · 3',exact:true}).click();await advance(35);
 await page.getByRole('button',{name:'Прыжок · пробел',exact:true}).click();await advance(28);
 await page.getByRole('heading',{name:'Тот же герой, новые позы',exact:true}).scrollIntoViewIfNeeded();
 await page.screenshot({path:root+'08-mobile-flight.png'});
 return {viewport:page.viewportSize(),overflow:await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth})),text:await page.locator('body').innerText()};
}
