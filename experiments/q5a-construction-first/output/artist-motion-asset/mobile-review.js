async page=>{
 const context=await page.context().browser().newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});
 const mobile=await context.newPage();const dir='D:/dev/R4D/experiments/q5a-construction-first/output/artist-motion-asset/';const rows=[];
 await mobile.goto('http://127.0.0.1:5187/review/r4d/q5a-construction-first/');await mobile.waitForFunction(()=>window.q5a);
 const shot=async label=>{const state=await mobile.evaluate(()=>({tick:q5a.motion.tick,t:q5a.motion.time,phase:q5a.motion.phase,elapsed:q5a.motion.elapsed,target:q5a.motion.ground,stats:q5a.getStats(),viewport:[innerWidth,innerHeight],dpr:devicePixelRatio}));await mobile.locator('.canvas-wrap').screenshot({path:dir+label+'.png'});rows.push({label,...state});};
 const cmd=n=>mobile.locator('[data-command="'+n+'"]').click();const step=n=>mobile.evaluate(n=>q5a.step(n),n);
 await mobile.getByText('Диагностика и просмотр',{exact:true}).click();
 for(const [i,n] of ['idle','low','walk','idle','jump','idle','walk','low','jump','walk','jump','low'].entries()){await cmd(n);await mobile.waitForTimeout(n==='jump'?680:900);await shot('M-realtime-'+i+'-'+n);if(n==='jump'){await mobile.waitForTimeout(1050);await shot('M-realtime-'+i+'-landed');}}
 await mobile.locator('#dark').check();
 for(let i=0;i<12;i++){await cmd(['idle','low','walk'][i%3]);await mobile.waitForTimeout(50);if(i%3===2)await shot('M-rapid-'+i);}
 await mobile.evaluate(()=>q5a.pause(true));await cmd('walk');await step(180);await mobile.locator('#stop-target').selectOption('low');await cmd('stop');await step(12);await shot('M-stop-low-100');await step(150);await shot('M-stop-low-settled');await cmd('walk');await step(120);await mobile.locator('#stop-target').selectOption('idle');await cmd('stop');await step(150);await shot('M-stop-idle');
 await cmd('jump');await step(12);await cmd('jump');await shot('M-repeat-prepare');
 while(await mobile.evaluate(()=>q5a.motion.phase!=='push'))await step(2);
 await cmd('walk');await cmd('jump');await step(12);await shot('M-repeat-push');
 while(await mobile.evaluate(()=>q5a.motion.phase!=='flight'))await step(2);
 await cmd('low');await step(48);await shot('M-apex-1x-dark');await mobile.locator('#zoom').check();await shot('M-apex-2x-dark');await mobile.locator('#dark').uncheck();await shot('M-apex-2x-light');await mobile.locator('#bones').check();await mobile.locator('#mesh').check();await shot('M-apex-2x-diagnostics');await mobile.locator('#zoom').uncheck();await mobile.locator('#bones').uncheck();await mobile.locator('#mesh').uncheck();
 while(await mobile.evaluate(()=>q5a.motion.phase!=='landing'))await step(2);
 await step(12);await shot('M-landing-pre-repeat');await cmd('jump');await shot('M-landing-repeat-command');
 for(let i=0;i<10;i++){await step(12);await shot('M-landing-repeat-'+i);}
 await step(180);await cmd('low');await step(180);await mobile.locator('#zoom').check();await shot('M-low-2x-light');await mobile.locator('#dark').check();await shot('M-low-2x-dark');await mobile.locator('#bones').check();await mobile.locator('#mesh').check();await shot('M-low-2x-diagnostics');await mobile.screenshot({path:dir+'mobile-controls.png',fullPage:true});
 await mobile.locator('#step').click();await shot('M-UI-step-button');
 const environment=await mobile.evaluate(()=>({ua:navigator.userAgent,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio}));await context.close();return {mode:'real Chrome mobile emulation, realtime UI routes then paused same-engine step inspection',environment,rows};
}
