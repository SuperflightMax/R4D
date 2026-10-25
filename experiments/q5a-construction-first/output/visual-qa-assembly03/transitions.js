async(page)=>{
 const dir='D:/dev/R4D/experiments/q5a-construction-first/output/visual-qa-assembly03/';let rows=[],n=0;
 await page.goto('http://127.0.0.1:5195/review/r4d/q5a-construction-first/');await page.waitForFunction(()=>window.q5a);await page.evaluate(()=>q5a.pause(true));await page.locator('summary').click();await page.locator('#zoom').check();
 async function snap(label){const file=`C-${String(n++).padStart(3,'0')}`;const s=await page.evaluate(()=>({tick:q5a.motion.tick,phase:q5a.motion.phase,ground:q5a.motion.ground,snapshot:q5a.motion.snapshot(),stats:q5a.getStats()}));await page.locator('.canvas-wrap').screenshot({path:dir+file+'.png'});rows.push({file,label,...s});}
 const click=async n=>page.getByRole('button',{name:n,exact:true}).click();
 for(const from of ['Стойка','Присед','Ходьба'])for(const to of ['Стойка','Присед','Ходьба'])if(from!==to){await click(from);await page.evaluate(()=>q5a.step(200));await snap(from+' base');await click(to);await snap('command '+to);await page.evaluate(()=>q5a.step(12));await snap(from+' to '+to+' mid');await page.evaluate(()=>q5a.step(160));await snap(to+' settled');}
 for(const to of ['Ходьба','Прыжок ↑']){await click('Стойка');await page.evaluate(()=>q5a.step(240));await click('Присед');await page.evaluate(()=>q5a.step(6));await snap('early low before '+to);await click(to);await snap('early interrupt '+to);await page.evaluate(()=>q5a.step(24));await snap('early interrupt plus .2s');await page.evaluate(()=>q5a.step(300));}
 for(const stop of ['idle','low']){await click('Ходьба');await page.evaluate(()=>q5a.step(240));await page.locator('#stop-target').selectOption(stop);await click('Стоп');await snap('stop '+stop+' command');for(let k=0;k<4;k++){await page.evaluate(()=>q5a.step(18));await snap('stop '+stop+' settle '+k);}}
 // Verify pause, UI single step, and slow realtime on the same engine.
 const before=await page.evaluate(()=>q5a.motion.tick);await page.waitForTimeout(350);const after=await page.evaluate(()=>q5a.motion.tick);await page.locator('#step').click();const stepped=await page.evaluate(()=>q5a.motion.tick);
 await page.locator('#speed').selectOption('.25');await click('Ходьба');await page.locator('#pause').click();await page.waitForTimeout(800);await page.locator('#pause').click();await snap('quarter-speed realtime');
 return {pause:{before,after,stepped},rows};
}
