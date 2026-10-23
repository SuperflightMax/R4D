async (page) => {
 const samples=[],check=(yes,message)=>{if(!yes)throw new Error(message);};
 const snap=()=>page.evaluate(()=>window.__R4D.snapshot());
 const step=dt=>page.evaluate(dt=>window.__R4D.step(dt),dt);
 const reset=async()=>{await page.locator('#reset').click();await page.evaluate(()=>window.__R4D.setPaused(true));};
 const capture=async name=>{await page.screenshot({path:`D:/dev/R4D/experiments/q4-whole-character/output/playwright/builder/${name}.png`,fullPage:true});};
 const record=async name=>{const s=await snap();samples.push({name,state:s.state,ground:s.ground,time:s.time,rootY:s.pose.rootY,knee:s.pose.shinNear,jumps:s.jumpCount,lands:s.landCount,sole:s.view.renderedSoleGap});return s;};
 await reset();await step(.8);await record('idle');await capture('idle');
 await page.locator('#low').click();await step(1);let s=await record('low');check(s.pose.rootY>145,'low depth');check(s.pose.shinNear>1,'low joint bend');check(Math.max(...Object.values(s.view.renderedSoleGap).map(Math.abs))<.01,'low planted soles');await capture('low');
 await page.locator('#move').click();await step(.6);await record('move');await capture('move');
 for(const origin of ['idle','low','move'])for(const landing of ['idle','low','move']){
  await reset();await page.locator('#'+origin).click();await step(.8);await page.locator('#jump').click();await step(.1);s=await record(`${origin}-${landing}-prepare`);check(s.state==='prepare','jump preparation');
  if(origin==='low'&&landing==='move')await capture('jump-prepare');
  await step(.3);s=await record(`${origin}-${landing}-flight`);check(s.state==='flight'&&s.height>0,'jump airborne');
  await page.locator('#'+landing).click();check((await snap()).state==='flight','airborne target teleported');
  if(origin==='low'&&landing==='move')await capture('jump-flight');
  let found=false;for(let i=0;i<90;i++){await step(1/60);s=await snap();check(Math.min(...Object.values(s.view.renderedSoleGap))>-.2,'rendered sole penetrates ground');if(s.state==='land'){found=true;break;}}
  check(found,'landing never reached');if(origin==='low'&&landing==='move')await capture('jump-land');
  await step(1);s=await record(`${origin}-${landing}-end`);check(s.state===landing&&s.jumpCount===1&&s.landCount===1,'latest landing target not completed');
 }
 for(const next of ['move','jump']){
  await reset();await page.locator('#low').click();await step(.06);const before=await snap();
  await page.locator('#'+next).click();const commanded=await snap();check(JSON.stringify(before.pose)===JSON.stringify(commanded.pose),'command reset current pose');
  await step(1/120);s=await record('mid-'+next);check(Math.abs(s.pose.rootY-before.pose.rootY)<12,'mid-transition jump in root');await capture('mid-'+next);await step(2);
 }
 await page.getByText('Маршруты и замедление',{exact:true}).click();
 for(const route of ['one','two','midMove','midJump']){
  await page.locator(`[data-route="${route}"]`).click();await page.evaluate(()=>window.__R4D.setPaused(true));await step(8);s=await record('route-'+route);check(s.jumpCount===s.landCount,'route jump not landed');
 }
 await reset();await page.locator('#bind').click();s=await snap();check(s.bindMode,'bind view');await capture('bind');await page.locator('#idle').click();check(!(await snap()).bindMode,'manual command did not exit bind');
 await page.locator('#bones').click();await capture('bones');await page.locator('#bones').click();
 await page.locator('#background').selectOption('dark');await capture('dark');await page.locator('#background').selectOption('light');
 await page.keyboard.press('2');await step(.5);check((await snap()).ground==='low','keyboard low');await page.keyboard.press('Space');await step(.4);check((await snap()).state==='flight','keyboard jump');await step(2);
 const t=(await snap()).time;await page.locator('#step').click();check((await snap()).time>t,'frame step');
 await page.getByText('Цельный исходник и происхождение',{exact:true}).click();check(await page.locator('#whole').evaluate(img=>img.complete&&img.naturalWidth===1024),'exact source preview missing');await capture('source');
 await page.setViewportSize({width:390,height:844});check(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'mobile horizontal overflow');await capture('mobile');await page.setViewportSize({width:1280,height:1000});
 await page.getByText('Цельный исходник и происхождение',{exact:true}).click();await reset();
 return {ok:true,jumpCases:9,routes:4,midTransitionCases:2,samples};
}
