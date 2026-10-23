async (page) => {
 const assert=(condition,message)=>{if(!condition)throw new Error(message);};
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.waitForFunction(()=>!!window.__R4D);
 const read=()=>page.evaluate(()=>window.__R4D.snapshot());
 const routes=page.locator('details').first();
 if(!await routes.evaluate(e=>e.open))await routes.locator('summary').click();
 const results=[];
 for(const [route,state,jumps,until]of [['one','idle',1,6.5],['two','low',2,6.3],['midMove','move',0,2],['midJump','low',1,2.5]]){
  await page.locator(`[data-route=${route}]`).click();
  await page.waitForFunction(t=>window.__R4D.snapshot().time>t,until);
  await page.locator('#pause').click();
  const s=await read();assert(s.state===state,`${route}: state ${s.state}`);assert(s.jumpCount===jumps&&s.landCount===jumps,`${route}: jumps ${s.jumpCount}/${s.landCount}`);
  results.push({route,state:s.state,ground:s.ground,jumps:s.jumpCount,landings:s.landCount});
 }
 const before=await read();await page.locator('#step').click();const after=await read();assert(Math.abs(after.time-before.time-1/60)<1e-8,'step must be 1/60');
 await page.setViewportSize({width:390,height:844});
 await page.locator('#reset').click();await page.locator('#low').click();await page.locator('#pause').click();
 await page.waitForFunction(()=>window.__R4D.snapshot().pose.rootY>75);
 await page.locator('#pause').click();
 const low=await read();assert(low.pose.shinNear>1.5,'visible knee flexion');
 assert(await page.locator('#jump').isVisible(),'mobile jump button');
 await page.locator('#scene').screenshot({path:'output/playwright/mobile-low.png'});
 await page.locator('#jump').click();await page.locator('#pause').click();
 await page.waitForFunction(()=>window.__R4D.snapshot().state==='flight');
 await page.locator('#idle').click();
 await page.waitForFunction(()=>window.__R4D.snapshot().landCount===1&&window.__R4D.snapshot().state==='idle');
 await page.keyboard.press('b');const bones=await read();assert(bones.bones,'keyboard bones');
 await page.keyboard.press('p');const paused=await read();assert(paused.paused,'keyboard pause');
 await page.locator('#comparison summary').click();
 await page.frameLocator('#comparison iframe').locator('#move').waitFor();
 assert((await page.frameLocator('#comparison iframe').locator('body').innerText()).includes('На ходу'),'original baseline loads');
 assert(errors.length===0,errors.join('\n'));
 return {routes:results,mobileLowKnee:low.pose.shinNear,step:after.time-before.time,baseline:true,pageErrors:errors};
}
