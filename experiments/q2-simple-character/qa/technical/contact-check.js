async (page) => {
 await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
 await page.getByRole('button',{name:'Идти · 3',exact:true}).click();
 await page.evaluate(()=>window.__R4D.step(1.5));
 const worst=await page.evaluate(()=>{let worst=null;for(let i=0;i<120;i++){window.__R4D.step(1/120);const s=window.__R4D.snapshot();const gap=Math.min(...Object.values(s.view.renderedSoleGap));if(!worst||gap>worst.gap)worst={gap,t:s.time,phase:s.phase,soleGap:s.view.renderedSoleGap};}return worst;});
 await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
 await page.getByRole('button',{name:'Идти · 3',exact:true}).click();
 await page.evaluate(t=>window.__R4D.step(t),worst.t);
 await page.getByRole('region',{name:'Анимированный персонаж'}).screenshot({path:'walk-gap.png'});
 const interrupts=[];
 for(const name of ['Идти · 3','Прыжок · пробел']){
  await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
  await page.getByRole('button',{name:'Низкая поза · 2',exact:true}).click();
  await page.evaluate(()=>window.__R4D.step(.06));
  const label=name.startsWith('Идти')?'move':'jump';
  await page.getByRole('region',{name:'Анимированный персонаж'}).screenshot({path:`interrupt-${label}-before.png`});
  await page.getByRole('button',{name,exact:true}).click();
  await page.evaluate(()=>window.__R4D.step(.18));
  await page.getByRole('region',{name:'Анимированный персонаж'}).screenshot({path:`interrupt-${label}-after.png`});
  interrupts.push({destination:label,snapshot:await page.evaluate(()=>{const s=window.__R4D.snapshot();return {t:s.time,state:s.state,ground:s.ground,rootY:s.pose.rootY};})});
 }
 return {worst,interrupts};
}
