async(page)=>{
 const root='D:/dev/R4D/experiments/q1-gpt61-continuation/qa/visual/f1/';
 const region=page.getByRole('region',{name:'Анимированный персонаж',exact:true});
 const advance=async n=>{for(let i=0;i<n;i++)await page.keyboard.press('.')};
 const state=async()=> (await page.locator('body').innerText()).split('Нажимайте')[1]?.split('Маршруты')[0];
 await page.getByRole('button',{name:'Пауза · P',exact:true}).click();
 const results=[];
 for(const start of [1,2,3]) for(const finish of [1,2,3]){
  const name=start+'-'+finish;
  await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
  await page.keyboard.press(String(start));await advance(50);
  const source=await state();
  await page.keyboard.press('Space');await advance(25);await page.keyboard.press(String(finish));
  let contact=null, before=null;
  for(let i=25;i<110;i++){
   const current=await state();
   if(current.includes('приземление')){contact=current;break}
   if(i>=45){await region.screenshot({path:root+'raw-'+name+'-before.png'});before=current}
   await advance(1);
  }
  await region.screenshot({path:root+'raw-'+name+'-contact.png'});
  await advance(4);await region.screenshot({path:root+'raw-'+name+'-after.png'});const after=await state();
  await advance(50);const settled=await state();
  results.push({name,source,before,contact,after,settled});
 }
 return results;
}
