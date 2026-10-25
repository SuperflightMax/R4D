async page=>{
 const dir='D:/dev/R4D/experiments/q5a-construction-first/output/artist-motion-asset-rereview03/',url='http://127.0.0.1:5192/review/r4d/q5a-construction-first/';const rows=[];
 const context=await page.context().browser().newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});const mobile=await context.newPage();
 for(const [platform,p] of [['desktop',page],['mobile',mobile]])for(const [index,source] of ['idle','low','walk'].entries()){
  await p.goto(url);await p.waitForFunction(()=>window.q5a);await p.getByText('Диагностика и просмотр',{exact:true}).click();await p.locator('#zoom').check();if(index!==1)await p.locator('#dark').check();if(index!==2){await p.locator('#bones').check();await p.locator('#mesh').check();}
  await p.locator('[data-command="'+source+'"]').click();await p.waitForTimeout(1300);await p.locator('[data-command="jump"]').click();
  for(let i=0;i<12;i++){
   await p.waitForTimeout(70);
   const label='rt-alt-'+platform+'-'+source+'-'+i;
   const state=await p.evaluate(()=>({tick:q5a.motion.tick,t:q5a.motion.time,phase:q5a.motion.phase,elapsed:q5a.motion.elapsed,target:q5a.motion.ground,stats:q5a.getStats()}));
   await p.locator('.canvas-wrap').screenshot({path:dir+label+'.png'});rows.push({label,...state});
  }
  await p.evaluate(()=>q5a.pause(true));await p.screenshot({path:dir+'rt-alt-'+platform+'-'+source+'-fullpage.png',fullPage:true});
 }
 await context.close();return {mode:'normal 1x playback rate, actual requestAnimationFrame; entire jump with preparation/flight/landing/recovery, x2 requested, UI commands',rows};
}
