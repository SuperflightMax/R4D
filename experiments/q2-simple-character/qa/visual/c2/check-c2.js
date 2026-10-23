async (page) => {
 const stage=page.getByRole('region',{name:'Анимированный персонаж',exact:true});
 const click=state=>page.getByRole('button',{name:{idle:'Покой · 1',low:'Низкая поза · 2',move:'Идти · 3',jump:'Прыжок · пробел'}[state],exact:true}).click();
 const step=dt=>page.evaluate(dt=>window.__R4D.step(dt),dt);
 const reset=()=>page.evaluate(()=>{window.__R4D.reset();window.__R4D.setPaused(true)});
 const results=[];
 async function frame(name){const s=await page.evaluate(()=>window.__R4D.snapshot());results.push({file:name+'.png',time:s.time,state:s.state,height:s.height,phase:s.phase});await stage.screenshot({path:'c2/'+name+'.png'});}
 await frame('live-idle');await click('move');await page.waitForTimeout(140);await frame('live-move');
 await reset();await step(1);await frame('idle');
 await click('low');await step(.06);await frame('low-mid');await step(.12);await frame('low-transition');await step(.82);await frame('low');
 await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption({label:'Тёмный'});await frame('low-dark');
 await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption({label:'Светлый'});
 await reset();await click('move');await step(1);await frame('move-a');await step(.35);await frame('move-b');
 await reset();await click('low');await step(.8);await click('jump');await step(.1);await frame('prepare');
 await step(.25);await frame('flight-early');await step(.2);await frame('flight');await step(.32);await frame('flight-late');
 for(let i=0;i<180;i++){await step(1/120);if((await page.evaluate(()=>window.__R4D.snapshot())).state==='land'){await frame('land-first');break;}}
 await step(.12);await frame('land-mid');await step(.5);await frame('land-low');
 for(const dest of ['move','jump']){
  await reset();await click('low');await step(.06);await frame('interrupt-'+dest+'-before');
  await click(dest);await frame('interrupt-'+dest+'-request');
  await step(.08);await frame('interrupt-'+dest+'-early');await step(.32);await frame('interrupt-'+dest+'-middle');
  await step(.7);await frame('interrupt-'+dest+'-late');await step(.9);await frame('interrupt-'+dest+'-end');
 }
 return results;
}
