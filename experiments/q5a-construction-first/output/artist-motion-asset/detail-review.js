async page=>{
 const dir='D:/dev/R4D/experiments/q5a-construction-first/output/artist-motion-asset/';const rows=[];
 await page.goto('http://127.0.0.1:5187/review/r4d/q5a-construction-first/');await page.waitForFunction(()=>window.q5a);await page.evaluate(()=>q5a.pause(true));await page.getByText('Диагностика и просмотр',{exact:true}).click();
 const cmd=n=>page.locator('[data-command="'+n+'"]').click();const step=n=>page.evaluate(n=>q5a.step(n),n);
 const shot=async label=>{const state=await page.evaluate(()=>({tick:q5a.motion.tick,t:q5a.motion.time,phase:q5a.motion.phase,elapsed:q5a.motion.elapsed,target:q5a.motion.ground,worldX:q5a.motion.worldX,feet:q5a.motion.feet.map(f=>({x:f.x,contact:f.contact,lift:f.lift})),stats:q5a.getStats()}));await page.locator('.canvas-wrap').screenshot({path:dir+label+'.png'});rows.push({label,...state});};
 await cmd('low');await step(180);await page.locator('#zoom').check();await cmd('jump');await step(36);
 for(let i=0;i<16;i++){await step(2);await shot('D-push-swing-'+i);}
 await page.locator('#zoom').uncheck();while(await page.evaluate(()=>q5a.motion.phase!=='landing'))await step(2);
 await page.locator('#zoom').check();
 for(let i=0;i<12;i++){await step(2);await shot('D-landing-'+i);}
 await step(150);await cmd('walk');await step(180);await page.locator('#bones').check();await page.locator('#dark').check();
 for(let i=0;i<12;i++){await step(6);await shot('D-walk-contact-'+i);}
 await page.locator('#bones').uncheck();await cmd('idle');await step(150);await page.setViewportSize({width:1280,height:720});await shot('D-short-desktop-idle-x2');await page.screenshot({path:dir+'short-desktop-controls.png',fullPage:true});
 return {mode:'adjacent 1/60-second push/landing frames; 50ms contact frames; short desktop viewport',rows};
}
