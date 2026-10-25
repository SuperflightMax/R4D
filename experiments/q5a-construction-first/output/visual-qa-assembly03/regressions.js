async(page)=>{
 const dir='D:/dev/R4D/experiments/q5a-construction-first/output/visual-qa-assembly03/';let rows=[];
 await page.goto('http://127.0.0.1:5195/review/r4d/q5a-construction-first/');await page.waitForFunction(()=>window.q5a);await page.evaluate(()=>q5a.pause(true));await page.locator('summary').click();await page.locator('#zoom').check();await page.locator('#dark').check();
 const click=async n=>page.getByRole('button',{name:n,exact:true}).click();
 async function snap(file,label){const s=await page.evaluate(()=>({tick:q5a.motion.tick,phase:q5a.motion.phase,elapsed:q5a.motion.elapsed,ground:q5a.motion.ground,stats:q5a.getStats(),spec:q5a.motion.spec()}));await page.locator('.canvas-wrap').screenshot({path:dir+file+'.png'});rows.push({file,label,...s});}
 const baseTick=await page.evaluate(()=>q5a.motion.tick);await click('Ходьба');await page.evaluate(()=>q5a.step(144));await click('Присед');await page.evaluate(()=>q5a.step(36));
 for(let i=0;i<25;i++){await snap('W-'+String(i).padStart(3,'0'),'assembly01 scenario1 relative '+(180+i));await page.evaluate(()=>q5a.step(1));}
 await page.locator('#bones').check();await page.locator('#mesh').check();await snap('W-025','same transition diagnostic');await page.locator('#bones').uncheck();await page.locator('#mesh').uncheck();
 await click('Прыжок ↑');await page.evaluate(()=>{let seen=false;for(let k=0;k<400;k++){q5a.step(1);if(q5a.motion.phase==='landing')seen=true;if(seen&&q5a.motion.phase==='ground')break;}});await snap('W-026','first recovery tick before jump');await click('Прыжок ↑');await snap('W-027','first recovery tick repeated jump');await page.evaluate(()=>q5a.step(2));await snap('W-028','recovery repeat next frame');
 return {baseTick,recipe:'walk 144/120s, low 36/120s, each following 1/120s around old scenario1 frame186; then recovery repeat',rows};
}
