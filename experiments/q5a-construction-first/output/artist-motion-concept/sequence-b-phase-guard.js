async page=>{
 await page.waitForFunction(()=>window.q5a);
 const rows=[];let n=0;
 async function shot(label){const state=await page.evaluate(()=>({t:window.q5a.motion.time,phase:window.q5a.motion.phase,elapsed:window.q5a.motion.elapsed,target:window.q5a.motion.ground}));const file='b2-'+String(n++).padStart(3,'0')+'.png';await page.locator('.canvas-wrap').screenshot({path:file});rows.push({label,file,...state});}
 async function observe(label,ms){const end=Date.now()+ms;while(Date.now()<end){await shot(label);await page.waitForTimeout(90);}}
 async function cmd(name,label){const before=await page.evaluate(()=>({t:window.q5a.motion.time,phase:window.q5a.motion.phase,elapsed:window.q5a.motion.elapsed,target:window.q5a.motion.ground}));await page.getByRole('button',{name,exact:true}).click();rows.push({label,command:name,before});}
 await cmd('Ходьба','begin route B');await observe('walk',1300);
 await cmd('Присед','walk to low');await observe('low',1000);
 await cmd('Прыжок ↑','jump from low');
 await page.waitForFunction(()=>window.q5a.motion.phase==='flight'&&window.q5a.motion.elapsed>.12);
 await shot('flight before target walk');await cmd('Ходьба','walk requested in flight');await observe('flight landing recovery walk',1600);
 await cmd('Прыжок ↑','jump from walk');
 await page.waitForFunction(()=>window.q5a.motion.phase==='flight'&&window.q5a.motion.elapsed>.12);
 await shot('flight before target low');await cmd('Присед','low requested in flight');await observe('flight landing recovery low',1700);
 await page.getByRole('button',{name:'Пауза',exact:true}).click();
 return {scenario:'B realtime with phase-guarded flight selections',rows};
}
