async (page) => {
 await page.getByRole('combobox',{name:'Цель',exact:true}).selectOption('extreme_flexion');
 const before=await page.evaluate(()=>window.__Q6.snapshot());
 await page.getByRole('button',{name:'Играть ↔ bind',exact:true}).click();await page.waitForTimeout(180);
 await page.getByRole('button',{name:'Пауза',exact:true}).click();
 const playing=await page.evaluate(()=>window.__Q6.snapshot());
 if(playing.clock<=before.clock)throw new Error('RAF clock did not advance');
 await page.waitForTimeout(100);const held=await page.evaluate(()=>window.__Q6.snapshot());
 if(JSON.stringify(playing.pose)!==JSON.stringify(held.pose)||playing.clock!==held.clock)throw new Error('Pause did not hold');
 await page.getByRole('button',{name:'Сброс bind',exact:true}).click();
 const result={before,playing,held,final:await page.evaluate(()=>window.__Q6.snapshot()),layout:await page.evaluate(()=>({innerWidth,scrollWidth:document.documentElement.scrollWidth}))};
 return result;
}
