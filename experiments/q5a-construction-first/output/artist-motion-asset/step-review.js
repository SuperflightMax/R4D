async page=>{
 const dir='D:/dev/R4D/experiments/q5a-construction-first/output/artist-motion-asset/';const rows=[];
 const read=()=>page.evaluate(()=>({tick:q5a.motion.tick,t:q5a.motion.time,phase:q5a.motion.phase,elapsed:q5a.motion.elapsed,target:q5a.motion.ground,worldX:q5a.motion.worldX,stats:q5a.getStats(),feet:q5a.motion.feet.map(f=>({x:f.x,lift:f.lift,contact:f.contact})),canvas:[q5a.renderer.canvas.width,q5a.renderer.canvas.height],landmarks:q5a.getPose().landmarks}));
 const shot=async label=>{rows.push({label,...await read()});await page.locator('.canvas-wrap').screenshot({path:dir+label+'.png'});};
 const step=n=>page.evaluate(n=>q5a.step(n),n);
 const cmd=n=>page.locator('[data-command="'+n+'"]').click();
 const fresh=async()=>{await page.goto('http://127.0.0.1:5187/review/r4d/q5a-construction-first/');await page.waitForFunction(()=>window.q5a);await page.evaluate(()=>q5a.pause(true));await page.getByText('Диагностика и просмотр',{exact:true}).click();};
 await fresh();
 for(const [i,seq] of [['C1',['low','walk','idle','low','idle','walk','low','walk','idle']],['C2',['low','jump','walk','low','idle']]]){
  for(let j=0;j<seq.length;j++){await cmd(seq[j]);await step(12);await shot(i+'-'+j+'-'+seq[j]+'-100ms');}
  await step(180);await shot(i+'-settled');
 }
 for(const origin of ['idle','low','walk']){
  await fresh();await cmd(origin);await step(240);await shot('J-'+origin+'-origin');await cmd('jump');
  await step(12);await shot('J-'+origin+'-prepare-100');await cmd('walk');await step(12);await shot('J-'+origin+'-prepare-target-walk');
  for(let i=0;i<120;i++){if((await read()).phase==='push')break;await step(2);}
  await shot('J-'+origin+'-push-start');await cmd('low');await step(12);await shot('J-'+origin+'-push-target-low');
  for(let i=0;i<120;i++){if((await read()).phase==='flight')break;await step(2);}
  await shot('J-'+origin+'-takeoff');await cmd('idle');await cmd('jump');await step(48);await shot('J-'+origin+'-flight-repeat-ignored');
  await page.locator('#zoom').check();await shot('J-'+origin+'-apex-x2-light');await page.locator('#dark').check();await shot('J-'+origin+'-apex-x2-dark');await page.locator('#bones').check();await page.locator('#mesh').check();await shot('J-'+origin+'-apex-x2-diagnostics');await page.locator('#zoom').uncheck();await page.locator('#bones').uncheck();await page.locator('#mesh').uncheck();
  await cmd('walk');
  for(let i=0;i<120;i++){if((await read()).phase==='landing')break;await step(2);}
  await shot('J-'+origin+'-landing-start');await cmd('low');await step(12);await shot('J-'+origin+'-landing-target-low');await cmd('idle');await step(30);await shot('J-'+origin+'-recovery');await cmd('walk');await step(12);await shot('J-'+origin+'-recovery-target-walk');await step(100);await shot('J-'+origin+'-walk-recovered');
  await cmd('jump');await step(12);await shot('J-'+origin+'-repeat-ground-prepare');
 }
 await fresh();await cmd('walk');await step(240);await page.locator('#stop-target').selectOption('low');await cmd('stop');await step(12);await shot('S-stop-low-100');await step(150);await shot('S-stop-low-settled');await cmd('walk');await step(60);await page.locator('#stop-target').selectOption('idle');await cmd('stop');await step(12);await shot('S-stop-idle-100');await step(180);await shot('S-stop-idle-settled');
 await page.locator('#zoom').check();await cmd('low');await step(180);await shot('S-low-x2-light');await page.locator('#dark').check();await shot('S-low-x2-dark');await page.locator('#bones').check();await page.locator('#mesh').check();await shot('S-low-x2-diagnostics');
 return {mode:'same live candidate, paused and advanced with q5a.step(2) at phase boundaries; UI commands/options; no pose override',rows};
}
