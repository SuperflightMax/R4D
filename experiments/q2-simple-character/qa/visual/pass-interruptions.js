async (page) => {
 const stage=page.getByRole('region',{name:'Анимированный персонаж',exact:true});
 const click=async name=>page.getByRole('button',{name,exact:true}).click();
 const step=async dt=>page.evaluate(dt=>window.__R4D.step(dt),dt);
 const results=[];
 const shot=async file=>{const s=await page.evaluate(()=>window.__R4D.snapshot());results.push({file,time:s.time,state:s.state,height:s.height});await stage.screenshot({path:file});};
 for(const [dest,prefix] of [['Идти · 3','interrupt-move'],['Прыжок · пробел','interrupt-jump']]){
  await click('Сначала · R');await page.evaluate(()=>window.__R4D.setPaused(true));
  await click('Низкая поза · 2');await step(.06);await shot(`${prefix}-0.png`);
  await click(dest);await shot(`${prefix}-1.png`);
  for(let i=0;i<12;i++){await step(i<3?.04:.13);await shot(`${prefix}-${i+2}.png`);}
 }
 await click('Сначала · R');await page.evaluate(()=>window.__R4D.setPaused(true));
 await click('Идти · 3');await step(.57);await shot('manual-0.png');
 await click('Прыжок · пробел');await step(.12);await shot('manual-1.png');
 await click('Низкая поза · 2');await step(.12);await shot('manual-2.png');
 await click('Идти · 3');await step(.14);await shot('manual-3.png');
 await click('Покой · 1');await step(.15);await shot('manual-4.png');
 await click('Низкая поза · 2');
 for(let i=5;i<13;i++){await step(.1);await shot(`manual-${i}.png`);}
 await click('Шаг · .');await shot('manual-13.png');
 return results;
}
