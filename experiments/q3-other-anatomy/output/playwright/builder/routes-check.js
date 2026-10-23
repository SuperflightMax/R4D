async (page) => {
 const records=[];
 for(const name of ['Маршрут 1','Маршрут 2','В середине → идти','В середине → прыжок']){
  await page.getByRole('button',{name,exact:true}).click();
  await page.evaluate(()=>{window.__R4D.setPaused(true);window.__R4D.step(7.1);});
  const s=await page.evaluate(()=>window.__R4D.snapshot());
  if(s.jumpCount!==s.landCount)throw new Error('unfinished route '+name);
  records.push({name,state:s.state,ground:s.ground,jumps:s.jumpCount,landings:s.landCount,events:s.events});
 }
 await page.evaluate(()=>{window.__R4D.setPaused(true);window.__R4D.reset();});
 await page.keyboard.press('2');await page.evaluate(()=>window.__R4D.step(.08));
 await page.keyboard.press('Space');await page.evaluate(()=>window.__R4D.step(.5));
 const flight=await page.evaluate(()=>window.__R4D.snapshot());
 await page.screenshot({path:'experiments/q3-other-anatomy/output/playwright/builder/keyboard-flight.png'});
 await page.keyboard.press('3');await page.evaluate(()=>window.__R4D.step(.6));
 await page.screenshot({path:'experiments/q3-other-anatomy/output/playwright/builder/landing.png'});
 await page.evaluate(()=>window.__R4D.step(.7));
 const end=await page.evaluate(()=>window.__R4D.snapshot());
 if(flight.state!=='flight'||end.ground!=='move'||end.landCount!==1)throw new Error('keyboard interaction failed');
 await page.getByRole('button',{name:'Шаг · .',exact:true}).click();
 records.push({name:'keyboard/step',flightState:flight.state,endState:end.state,jumps:end.jumpCount,lands:end.landCount});
 await page.evaluate(()=>{window.__R4D.reset();window.__R4D.setPaused(false);});
 return records;
}
