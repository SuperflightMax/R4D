async(page)=>{
 const root='D:/dev/R4D/experiments/q1-gpt61-continuation/qa/visual/';
 const step=page.getByRole('button',{name:'Шаг · .',exact:true});
 const advance=async n=>{for(let i=0;i<n;i++)await step.click()};
 const state=async()=> (await page.locator('body').innerText()).split('Нажимайте')[1]?.split('Маршруты')[0];
 const results={};
 await advance(95); await page.keyboard.press('1'); await advance(30);
 await page.keyboard.press('Space'); await advance(25); await page.keyboard.press('3');await advance(95);results.idleJumpReturnMove=await state();
 await page.keyboard.press('2');await advance(35);await page.keyboard.press('Space');await advance(25);
 await page.getByRole('region',{name:'Анимированный персонаж',exact:true}).screenshot({path:root+'raw-low-jump-flight.png'});
 await page.keyboard.press('1');await advance(95);results.lowJumpReturnIdle=await state();
 for(const n of [1,2]){
  await page.getByRole('button',{name:'Маршрут '+n,exact:true}).click();
  results['route'+n]=[];
  for(let i=0;i<14;i++){await advance(30);results['route'+n].push(await state());}
  await page.getByRole('region',{name:'Анимированный персонаж',exact:true}).screenshot({path:root+'raw-route'+n+'-end.png'});
 }
 await page.getByRole('button',{name:'В середине → идти',exact:true}).click();await advance(6);results.midMoveButton=await state();
 await page.getByRole('button',{name:'В середине → прыжок',exact:true}).click();await advance(6);results.midJumpButton=await state();
 await advance(110);await page.keyboard.press('p');await page.keyboard.down('d');await page.waitForTimeout(700);await page.keyboard.press('Space');await page.waitForTimeout(350);await page.keyboard.up('d');await page.waitForTimeout(900);await page.keyboard.press('p');results.live=await state();
 return results;
}
