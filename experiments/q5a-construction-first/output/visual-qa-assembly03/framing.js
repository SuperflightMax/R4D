async(page)=>{
 const dir='D:/dev/R4D/experiments/q5a-construction-first/output/visual-qa-assembly03/';const kind=page.viewportSize().width<600?'mobile':'desktop';let rows=[];
 async function snap(suffix){const file='F-'+kind+'-'+suffix;const s=await page.evaluate(()=>({tick:q5a.motion.tick,time:q5a.motion.time,phase:q5a.motion.phase,elapsed:q5a.motion.elapsed,stats:q5a.getStats(),options:['zoom','dark','bones','mesh'].map(id=>[id,document.getElementById(id).checked]),viewport:{w:innerWidth,h:innerHeight,dpr:devicePixelRatio},canvas:document.getElementById('character').getBoundingClientRect().toJSON()}));await page.locator('.canvas-wrap').screenshot({path:dir+file+'.png'});rows.push({file,...s});}
 for(const [i,base] of ['Стойка','Присед','Ходьба'].entries()){
  await page.goto('http://127.0.0.1:5195/review/r4d/q5a-construction-first/');await page.waitForFunction(()=>window.q5a);await page.evaluate(()=>q5a.pause(true));await page.locator('summary').click();
  await page.getByRole('button',{name:base,exact:true}).click();await page.evaluate(()=>q5a.step(240));
  await page.getByRole('button',{name:'Прыжок ↑',exact:true}).click();await page.evaluate(()=>q5a.step(12));await page.getByRole('button',{name:'Ходьба',exact:true}).click();await page.evaluate(()=>q5a.step(12));
  await page.evaluate(()=>{for(let k=0;k<120&&q5a.motion.phase!=='push';k++)q5a.step(1)});await page.getByRole('button',{name:'Присед',exact:true}).click();await page.evaluate(()=>{for(let k=0;k<120&&q5a.motion.phase!=='flight';k++)q5a.step(1)});await page.getByRole('button',{name:'Стойка',exact:true}).click();await page.getByRole('button',{name:'Прыжок ↑',exact:true}).click();await page.evaluate(()=>q5a.step(46));
  await page.locator('#zoom').check();await snap(i+'-apex-before-x2');await page.evaluate(()=>q5a.step(2));await snap(i+'-apex-x2-light');
  await page.locator('#dark').check();await snap(i+'-apex-x2-dark');await page.locator('#bones').check();await page.locator('#mesh').check();await snap(i+'-apex-x2-diagnostics');await page.locator('#bones').uncheck();await page.locator('#mesh').uncheck();await page.locator('#zoom').uncheck();await snap(i+'-apex-x1-dark');await page.locator('#dark').uncheck();await snap(i+'-apex-x1-light');await page.locator('#zoom').check();await page.evaluate(()=>q5a.step(2));await snap(i+'-apex-after-x2');
  if(i===0){await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:dir+'F-'+kind+'-full-ui.png',fullPage:true});}
 }
 return {kind,rows};
}
