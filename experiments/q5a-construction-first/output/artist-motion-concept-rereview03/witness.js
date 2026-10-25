async page=>{
 const mobile=page.viewportSize().width<600,device=mobile?'mobile':'desktop',seed=mobile?10:9;
 let initialTick;
 for(let attempt=0;attempt<3;attempt++){
  await page.reload();
  await page.waitForFunction(()=>{if(!window.q5a)return false;window.q5a.pause(true);return true;},null,{polling:1});
  initialTick=await page.evaluate(()=>window.q5a.motion.tick);if(initialTick<=seed)break;
 }
 if(initialTick>seed)throw Error('Could not pause before exact seed tick');
 await page.evaluate(n=>window.q5a.step(n),seed-initialTick);
 await page.getByRole('button',{name:'Прыжок ↑',exact:true}).click();
 await page.getByText('Диагностика и просмотр',{exact:true}).click();
 await page.getByLabel('Крупно 2×',{exact:true}).check();
 const rows=[];
 async function options(zoom,dark,diag){await page.evaluate(o=>{for(const [id,value]of Object.entries(o)){let el=document.getElementById(id);el.checked=value;el.dispatchEvent(new Event('change',{bubbles:true}));}},{zoom:zoom===2,dark,bones:diag,mesh:diag});}
 async function shot(label){const state=await page.evaluate(()=>({tick:window.q5a.motion.tick,t:window.q5a.motion.time,phase:window.q5a.motion.phase,elapsed:window.q5a.motion.elapsed,landmarks:window.q5a.getPose().landmarks,framing:window.q5a.getStats().framing,stats:window.q5a.getStats(),canvas:document.getElementById('character').getBoundingClientRect().toJSON()}));const file=device+'-witness-tick'+state.tick+'-'+label+'.png';await page.locator('.canvas-wrap').screenshot({path:file});rows.push({file,label,...state});}
 for(const offset of [114,116,118,120,122,124,126]){
  const target=seed+offset,current=await page.evaluate(()=>window.q5a.motion.tick);
  await page.evaluate(n=>window.q5a.step(n),target-current);
  await options(2,false,false);await shot('2x-light');
  if(offset===120){
   await options(1,false,false);await shot('1x-light');
   await options(2,true,false);await shot('2x-dark');
   await options(2,true,true);await shot('2x-dark-diagnostic');
   await options(2,false,true);await shot('2x-light-diagnostic');
   await page.screenshot({path:device+'-witness-full-page.png',fullPage:true});
  }
 }
 return {device,initialTick,seed,expectedWitness:seed+120,environment:await page.evaluate(()=>({ua:navigator.userAgent,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,touch:navigator.maxTouchPoints,candidate:window.q5a.candidate})),rows};
}
