async(page)=>{
 const root='D:/dev/R4D/experiments/q1-gpt61-continuation/qa/visual/f1/';
 const region=page.getByRole('region',{name:'Анимированный персонаж',exact:true});
 const advance=async n=>{for(let i=0;i<n;i++)await page.keyboard.press('.')};
 const state=async()=> (await page.locator('body').innerText()).split('Нажимайте')[1]?.split('Маршруты')[0];
 await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
 await page.keyboard.press('2');await advance(35);await page.keyboard.press('3');await advance(83);
 await page.keyboard.press('Space');await advance(28);await page.keyboard.press('2');await advance(26);
 const result={descent:[]};
 for(let i=0;i<7;i++){
  result.descent.push(await state());await region.screenshot({path:root+'raw-descent-'+i+'.png'});await advance(3);
 }
 await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
 await page.keyboard.press('1');await advance(35);await page.keyboard.press('2');await advance(4);await page.keyboard.press('Space');await advance(25);await page.keyboard.press('3');await advance(45);
 await region.screenshot({path:root+'raw-mid-contact.png'});result.mid=await state();await advance(50);result.midSettled=await state();
 result.live=[];
 await page.getByRole('button',{name:'Продолжить · P',exact:true}).click();
 for(const start of [1,2,3])for(const finish of [1,2,3]){
  await page.getByRole('button',{name:'Сначала · R',exact:true}).click();await page.keyboard.press(String(start));await page.waitForTimeout(650);
  await page.keyboard.press('Space');await page.waitForTimeout(420);await page.keyboard.press(String(finish));await page.waitForTimeout(1050);
  result.live.push({start,finish,state:await state()});
 }
 await page.getByRole('button',{name:'Пауза · P',exact:true}).click();
 await page.setViewportSize({width:390,height:844});await page.getByRole('heading',{name:'Тот же герой, новые позы',exact:true}).scrollIntoViewIfNeeded();
 await page.screenshot({path:root+'mobile-smoke.png'});
 result.mobile=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth}));
 return result;
}
