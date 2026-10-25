async(page)=>{
 const dir='D:/dev/R4D/experiments/q5a-construction-first/output/visual-qa-assembly03/';let rows=[],n=0;
 await page.goto('http://127.0.0.1:5195/review/r4d/q5a-construction-first/');await page.waitForFunction(()=>window.q5a);await page.evaluate(()=>q5a.pause(true));await page.locator('summary').click();await page.locator('#zoom').check();await page.locator('#dark').check();
 const click=async n=>page.getByRole('button',{name:n,exact:true}).click();
 async function snap(label){const file='R-'+String(n++).padStart(3,'0');const s=await page.evaluate(()=>({tick:q5a.motion.tick,phase:q5a.motion.phase,elapsed:q5a.motion.elapsed,ground:q5a.motion.ground,snapshot:q5a.motion.snapshot(),feet:q5a.motion.feet.map(f=>({x:f.x,lift:f.lift,contact:f.contact})),stats:q5a.getStats()}));await page.locator('.canvas-wrap').screenshot({path:dir+file+'.png'});rows.push({file,label,...s});}
 await click('Ходьба');await page.evaluate(()=>q5a.step(240));await page.locator('#bones').check();
 for(let i=0;i<14;i++){await snap('walk contact '+i);await page.evaluate(()=>q5a.step(6));}await page.locator('#bones').uncheck();
 await click('Присед');await page.evaluate(()=>q5a.step(200));await click('Прыжок ↑');await page.evaluate(()=>{while(q5a.motion.phase!=='push')q5a.step(1)});
 for(let i=0;i<10;i++){await snap('push hands '+i);await page.evaluate(()=>q5a.step(2));}
 await page.evaluate(()=>{while(q5a.motion.phase!=='landing')q5a.step(1)});
 for(let i=0;i<9;i++){await snap('landing material '+i);await page.evaluate(()=>q5a.step(2));}
 await snap('landing before repeated jump');await click('Прыжок ↑');await snap('landing repeated jump immediate');await page.evaluate(()=>q5a.step(2));await snap('landing repeat next frame');await page.evaluate(()=>q5a.step(240));
 await snap('recovery before repeated jump');await click('Прыжок ↑');await snap('recovery repeated jump immediate');await page.evaluate(()=>q5a.step(2));await snap('recovery repeat next frame');
 return {rows};
}
