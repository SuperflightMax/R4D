async (page) => {
  await page.setViewportSize({width:1280,height:900});
  const maskResult=await page.evaluate(async()=>{
    q5a.pause(true);let source=await fetch('./construction/construction.json').then(r=>r.json()),rig=q5a.rig,renderer=q5a.renderer,ops=rig.data.draw_operations,saved={};for(let n of ['far_hand','near_hand'])saved[n]=renderer.materials[n].alpha;
    const read=()=>{let gl=renderer.gl,raw=new Uint8Array(960*640*4);gl.readPixels(0,0,960,640,gl.RGBA,gl.UNSIGNED_BYTE,raw);return raw;};let rows=[];
    try{for(let p of source.poses)for(let name of ['far_hand','near_hand']){rig.data.draw_operations=[{surface:name,fragment:'all'}];let pose=rig.solve(p.inputs);renderer.materials[name].alpha=saved[name];renderer.draw(pose,{worldX:0},{zoom:1});let authored=read();renderer.materials[name].alpha=renderer.white;renderer.draw(pose,{worldX:0},{zoom:1});let uncut=read(),changed=0;for(let i=0;i<authored.length;i+=4)if(authored[i]!==uncut[i]||authored[i+1]!==uncut[i+1]||authored[i+2]!==uncut[i+2])changed++;if(changed===0)throw Error('GPU hand cut ignored '+p.id+' '+name);rows.push({pose:p.id,surface:name,different_pixels:changed});renderer.materials[name].alpha=saved[name];}}
    finally{rig.data.draw_operations=ops;for(let n in saved)renderer.materials[n].alpha=saved[n];q5a.draw();}
    return {result:'GPU_AUTHORED_ALPHA_PASS',cases:rows};
  });
  await page.getByRole('button',{name:'Стойка',exact:true}).click();await page.getByRole('button',{name:'Продолжить',exact:true}).click();
  const tickBefore=await page.evaluate(()=>q5a.motion.tick);await page.waitForTimeout(400);
  await page.getByRole('button',{name:'Присед',exact:true}).click();await page.waitForTimeout(80);await page.getByRole('button',{name:'Ходьба',exact:true}).click();await page.waitForTimeout(500);await page.getByRole('button',{name:'Прыжок ↑',exact:true}).click();await page.waitForTimeout(1000);await page.getByRole('button',{name:'Присед',exact:true}).click();await page.waitForTimeout(1400);
  await page.getByRole('button',{name:'Пауза',exact:true}).click();
  const final=await page.evaluate(()=>({tick:q5a.motion.tick,phase:q5a.motion.phase,target:q5a.motion.ground,stats:q5a.getStats(),error:document.getElementById('error').textContent}));
  if(final.tick<=tickBefore||final.target!=='low'||final.stats.inverted||final.stats.webglError||final.error)throw Error(JSON.stringify(final));
  await page.screenshot({path:'output/playwright/02-desktop-full-page.png',fullPage:true});
  await page.setViewportSize({width:390,height:844});await page.screenshot({path:'output/playwright/02-mobile-full-page.png',fullPage:true});
  const result={result:'GPU_AND_REALTIME_PASS',maskResult,real_time:{tickBefore,...final}};await page.evaluate(r=>{q5a.gpuCheckResult=r;},result);return result;
}
