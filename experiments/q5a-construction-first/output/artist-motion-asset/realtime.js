async page => {
  await page.waitForFunction(()=>window.q5a);
  await page.setViewportSize({width:1440,height:1100});
  await page.getByText('Диагностика и просмотр',{exact:true}).click();
  const dir='D:/dev/R4D/experiments/q5a-construction-first/output/artist-motion-asset/';
  const rows=[];
  const shot=async label=>{const state=await page.evaluate(()=>({t:q5a.motion.time,tick:q5a.motion.tick,phase:q5a.motion.phase,elapsed:q5a.motion.elapsed,target:q5a.motion.ground,stats:q5a.getStats(),feet:q5a.motion.feet.map(f=>({x:f.x,contact:f.contact,lift:f.lift})),worldX:q5a.motion.worldX}));await page.locator('.canvas-wrap').screenshot({path:dir+label+'.png'});rows.push({label,...state});};
  const command=async(name,label,wait=1000)=>{await page.locator('[data-command="'+name+'"]').click();for(let i=0;i<3;i++){await page.waitForTimeout(140);await shot(label+'-'+i);}await page.waitForTimeout(wait);await shot(label+'-settled');};
  await page.goto('http://127.0.0.1:5187/review/r4d/q5a-construction-first/');await page.waitForFunction(()=>window.q5a);
  await page.getByText('Диагностика и просмотр',{exact:true}).click();
  await command('idle','A01-idle',500);await command('low','A02-low',500);await command('walk','A03-walk',1400);await command('idle','A04-idle',700);await command('jump','A05-jump',1300);await command('idle','A06-idle',600);
  await page.locator('#dark').check();
  await command('walk','B01-walk',700);await command('low','B02-low',500);await page.locator('[data-command="jump"]').click();await page.waitForTimeout(680);await shot('B03-flight');await page.locator('[data-command="walk"]').click();await shot('B04-flight-target-walk');await page.locator('[data-command="jump"]').click();await shot('B05-repeat-airborne');await page.waitForTimeout(1500);await shot('B06-walk-after-landing');await page.locator('[data-command="jump"]').click();await page.waitForTimeout(660);await shot('B07-flight');await page.locator('[data-command="low"]').click();await shot('B08-flight-target-low');await page.waitForTimeout(1400);await shot('B09-low-after-landing');
  await page.locator('#pause').click();
  await page.screenshot({path:dir+'desktop-controls.png',fullPage:true});
  return {mode:'real requestAnimationFrame playback, default 1x rate, UI commands, no deterministic fast-forward',userAgent:await page.evaluate(()=>navigator.userAgent),rows};
}
