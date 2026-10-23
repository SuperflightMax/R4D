async (page) => {
 const stage=page.getByRole('region',{name:'Анимированный персонаж',exact:true});
 const results=[];
 await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption({label:'Светлый'});
 for(const [name,prefix] of [['Маршрут 1','route1'],['Маршрут 2','route2']]){
  await page.getByRole('button',{name,exact:true}).click();
  await page.evaluate(()=>window.__R4D.setPaused(true));
  for(let i=0;i<23;i++){
   await page.evaluate(()=>window.__R4D.step(.32));
   const s=await page.evaluate(()=>window.__R4D.snapshot());
   results.push({file:`${prefix}-${i}.png`,time:s.time,state:s.state,target:s.target,height:s.height});
   await stage.screenshot({path:`${prefix}-${i}.png`});
  }
 }
 return results;
}
