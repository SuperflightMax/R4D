async page=>{
 const dir='D:/dev/R4D/experiments/q5a-construction-first/output/artist-motion-asset-rereview03/';
 const url='http://127.0.0.1:5192/review/r4d/q5a-construction-first/';const shots=[],samples=[];
 const read=p=>p.evaluate(()=>{
  const q=window.q5a,gl=q.renderer.gl,pr=q.renderer.program;
  const zoom=gl.getUniform(pr,q.renderer.locations.zoom),origin=Array.from(gl.getUniform(pr,q.renderer.locations.origin)),camera=gl.getUniform(pr,q.renderer.locations.camera);
  const vv=Object.values(q.getPose().surfaces).flatMap(g=>g.vertices),xx=vv.map(v=>origin[0]+(v[0]-camera)*zoom),yy=vv.map(v=>origin[1]-v[1]*zoom),canvas=q.renderer.canvas,css=canvas.getBoundingClientRect();
  return {tick:q.motion.tick,t:q.motion.time,phase:q.motion.phase,elapsed:q.motion.elapsed,target:q.motion.ground,worldX:q.motion.worldX,stats:q.getStats(),uniform:{zoom,origin,camera},projected:{left:Math.min(...xx),right:canvas.width-Math.max(...xx),top:Math.min(...yy),bottom:canvas.height-Math.max(...yy)},css:{width:css.width,height:css.height,scale:zoom*css.width/canvas.width},landmarks:q.getPose().landmarks};
 });
 const shot=async(p,label)=>{shots.push({label,...await read(p)});await p.locator('.canvas-wrap').screenshot({path:dir+label+'.png'});};
 const step=(p,n)=>p.evaluate(n=>q5a.step(n),n),cmd=(p,n)=>p.locator('[data-command="'+n+'"]').click();
 const fresh=async p=>{await p.goto(url);await p.waitForFunction(()=>window.q5a);await p.evaluate(()=>q5a.pause(true));await p.getByText('Диагностика и просмотр',{exact:true}).click();};
 await page.setViewportSize({width:1280,height:720});await fresh(page);
 await step(page,240-(await read(page)).tick);await cmd(page,'jump');await step(page,12);await cmd(page,'walk');await step(page,12);
 while((await read(page)).phase!=='push')await step(page,2);
 await cmd(page,'low');await step(page,12);while((await read(page)).phase!=='flight')await step(page,2);
 await cmd(page,'idle');await cmd(page,'jump');await step(page,46);await page.locator('#zoom').check();await shot(page,'desktop-witness348-x2');await step(page,2);await shot(page,'desktop-witness350-x2-light');await page.locator('#dark').check();await shot(page,'desktop-witness350-x2-dark');await page.locator('#bones').check();await page.locator('#mesh').check();await shot(page,'desktop-witness350-x2-diagnostics');await page.locator('#bones').uncheck();await page.locator('#mesh').uncheck();await page.locator('#zoom').uncheck();await shot(page,'desktop-witness350-x1-dark');await page.locator('#dark').uncheck();await shot(page,'desktop-witness350-x1-light');await page.locator('#zoom').check();await step(page,2);await shot(page,'desktop-witness352-x2');
 const context=await page.context().browser().newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,deviceScaleFactor:2});const mobile=await context.newPage();
 await fresh(mobile);
 // Reproduce the old paused tail from fresh idle; realtime motor prehistory was not saved.
 await step(mobile,2114-(await read(mobile)).tick);await cmd(mobile,'walk');await step(mobile,180);await mobile.locator('#stop-target').selectOption('low');await cmd(mobile,'stop');await step(mobile,162);await cmd(mobile,'walk');await step(mobile,120);await mobile.locator('#stop-target').selectOption('idle');await cmd(mobile,'stop');await step(mobile,150);
 await cmd(mobile,'jump');await step(mobile,12);await cmd(mobile,'jump');while((await read(mobile)).phase!=='push')await step(mobile,2);await cmd(mobile,'walk');await cmd(mobile,'jump');await step(mobile,12);while((await read(mobile)).phase!=='flight')await step(mobile,2);await cmd(mobile,'low');await step(mobile,46);await mobile.locator('#zoom').check();await shot(mobile,'mobile-recipe-neighbor-before-x2');await step(mobile,2);await shot(mobile,'mobile-recipe-apex-x2-light');await mobile.locator('#dark').check();await shot(mobile,'mobile-recipe-apex-x2-dark');await mobile.locator('#bones').check();await mobile.locator('#mesh').check();await shot(mobile,'mobile-recipe-apex-x2-diagnostics');await mobile.locator('#bones').uncheck();await mobile.locator('#mesh').uncheck();await mobile.locator('#zoom').uncheck();await shot(mobile,'mobile-recipe-apex-x1-dark');await mobile.locator('#dark').uncheck();await shot(mobile,'mobile-recipe-apex-x1-light');await mobile.locator('#zoom').check();await step(mobile,2);await shot(mobile,'mobile-recipe-neighbor-after-x2');
 for(const [name,p] of [['desktop',page],['mobile',mobile]])for(const source of ['idle','low','walk']){
  await fresh(p);await cmd(p,source);await step(p,240-(await read(p)).tick);await p.locator('#zoom').check();await cmd(p,'jump');
  for(let i=0;i<180;i++){
   await step(p,2);const s=await read(p);samples.push({run:name+'-'+source,...s});
   if(i%6===0||[17,29,53,54,55,83,84,85].includes(i))await shot(p,name+'-'+source+'-jump-'+i);
   if(i===54){await p.locator('#dark').check();await shot(p,name+'-'+source+'-apex-dark');await p.locator('#bones').check();await p.locator('#mesh').check();await shot(p,name+'-'+source+'-apex-diagnostics');await p.locator('#bones').uncheck();await p.locator('#mesh').uncheck();await p.locator('#zoom').uncheck();await shot(p,name+'-'+source+'-apex-x1');await p.locator('#zoom').check();}
   if(i===90){await p.locator('#bones').check();await p.locator('#mesh').check();}
   if(i===120){await p.locator('#bones').uncheck();await p.locator('#mesh').uncheck();await p.locator('#dark').uncheck();}
  }
 }
 const environment=await mobile.evaluate(()=>({ua:navigator.userAgent,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio}));await context.close();return {candidate:await page.evaluate(()=>q5a.candidate),mode:'real browser paused live-engine step; projected bounds independently read from actual GPU uniforms',environment,shots,samples};
}
