async(page)=>{
 const dir='D:/dev/R4D/experiments/q5a-construction-first/output/visual-qa-assembly03/';let rows=[],commands=[];
 async function snap(file,label){const s=await page.evaluate(()=>({tick:q5a.motion.tick,time:q5a.motion.time,phase:q5a.motion.phase,elapsed:q5a.motion.elapsed,ground:q5a.motion.ground,spec:q5a.motion.spec(),stats:q5a.getStats(),options:{dark:document.querySelector('#dark').checked,zoom:document.querySelector('#zoom').checked}}));await page.locator('.canvas-wrap').screenshot({path:dir+file+'.png'});rows.push({file,label,...s});}
 async function command(name){await page.getByRole('button',{name,exact:true}).click();commands.push(await page.evaluate(()=>({tick:q5a.motion.tick,phase:q5a.motion.phase,ground:q5a.motion.ground})));}
 for(const [i,base] of ['Стойка','Присед','Ходьба'].entries()){
  await page.goto('http://127.0.0.1:5195/review/r4d/q5a-construction-first/');await page.waitForFunction(()=>window.q5a);await page.evaluate(()=>q5a.pause(true));
  await page.locator('summary').click();await page.locator('#zoom').check();await command(base);await page.evaluate(()=>q5a.step(240));await snap(`J-${i}-00`,'base '+base);
  await command('Прыжок ↑');
  for(let k=1;k<=22;k++){
   await page.evaluate(()=>q5a.step(12));
   if([1,4,7].includes(k))await command(['Ходьба','Присед','Стойка'][[1,4,7].indexOf(k)]);
   if([2,5,8].includes(k))await command('Прыжок ↑');
   await snap(`J-${i}-${String(k).padStart(2,'0')}`,'jump phases, targets/repeated jump');
  }
 }
 return {method:'paused live engine 12 fixed steps per image; UI commands',rows,commands};
}
