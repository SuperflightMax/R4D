async page=>{
 const rows=[];let number=0;
 const read=()=>page.evaluate(()=>({t:window.q5a.motion.time,phase:window.q5a.motion.phase,elapsed:window.q5a.motion.elapsed,target:window.q5a.motion.ground,motors:window.q5a.motion.snapshot(),events:window.q5a.motion.events}));
 async function shot(label){const file='e-'+String(number++).padStart(3,'0')+'.png';rows.push({label,file,...await read()});await page.locator('.canvas-wrap').screenshot({path:file});}
 async function cmd(name,label){const before=await read();await page.getByRole('button',{name,exact:true}).click();rows.push({label,command:name,before,after:await read()});}
 async function step(frames){await page.evaluate(n=>window.q5a.step(n*2),frames);}
 for(const delay of [2,7,15]){
  await page.reload();await page.waitForFunction(()=>window.q5a);await page.getByRole('button',{name:'Пауза',exact:true}).click();
  await cmd('Присед','begin low');await step(delay);await shot('low '+delay+'/60 before jump');
  await cmd('Прыжок ↑','interrupt low after '+delay+'/60');
  for(let f=0;f<120;f++){await step(1);if(f%12===0||f===119)await shot('early jump '+delay+'/60 progress '+f);}
 }
 await page.reload();await page.waitForFunction(()=>window.q5a);await page.getByRole('button',{name:'Пауза',exact:true}).click();
 await cmd('Прыжок ↑','landing-repeat initial jump');
 for(let f=0;f<150&&(await read()).phase!=='landing';f++)await step(1);
 await step(2);await shot('early landing before repeated jump');await cmd('Прыжок ↑','repeat in landing after 2 frames');
 for(let f=0;f<125;f++){await step(1);if(f%12===0||f===124)await shot('landing repeated jump '+f);}
 for(let f=0;f<150&&(await read()).phase!=='ground';f++)await step(1);
 await step(1);await shot('early recovery before repeated jump');await cmd('Прыжок ↑','repeat after first recovery frame');
 for(let f=0;f<125;f++){await step(1);if(f%12===0||f===124)await shot('recovery repeated jump '+f);}
 return {scenario:'desktop 1x early low-jump at 2/7/15 frames, repeat in landing and early recovery',rows};
}
