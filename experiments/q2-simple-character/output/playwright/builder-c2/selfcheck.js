async (page) => {
  await page.waitForFunction(()=>window.__R4D);
  await page.evaluate(()=>window.__R4D.setPaused(true));
  const results={candidate:'q2-c2',frames:{},interruptions:[]};
  const click=state=>page.getByRole('button',{name:{idle:'Покой · 1',low:'Низкая поза · 2',move:'Идти · 3',jump:'Прыжок · пробел'}[state],exact:true}).click();
  const step=dt=>page.evaluate(dt=>window.__R4D.step(dt),dt);
  const snapshot=()=>page.evaluate(()=>window.__R4D.snapshot());
  const reset=()=>page.evaluate(()=>{window.__R4D.reset();window.__R4D.setPaused(true);});
  async function frame(name){
    const s=await snapshot();
    s.silhouetteBox=await page.evaluate(()=>{
      const s=window.__R4D.snapshot(),points=[];
      for(const p of window.__R4D.manifest.parts){
        const w=s.world[p.id],c=Math.cos(w.angle),t=Math.sin(w.angle);
        for(const x of [-p.pivot[0],p.size[0]-p.pivot[0]])for(const y of [-p.pivot[1],p.size[1]-p.pivot[1]]){
          points.push([s.view.rootX+(w.x+x*c-y*t)*s.view.scale*s.view.facing,s.view.rootY+(w.y+x*t+y*c)*s.view.scale]);
        }
      }
      const box={left:Math.min(...points.map(p=>p[0])),right:Math.max(...points.map(p=>p[0])),top:Math.min(...points.map(p=>p[1])),bottom:Math.max(...points.map(p=>p[1]))};
      const canvas=document.querySelector('canvas');
      return {...box,inside:box.left>=0&&box.top>=0&&box.right<=canvas.clientWidth&&box.bottom<=canvas.clientHeight};
    });
    if(!s.silhouetteBox.inside)throw Error(`Clipped silhouette: ${name}`);
    results.frames[name]=s;
    await page.screenshot({path:`${name}.png`});
  }
  await reset();await step(1);await frame('idle');
  await click('low');await step(1);await frame('low');
  await reset();await click('move');await step(1);await frame('move-a');
  await step(.35);await frame('move-b');
  await reset();await click('low');await step(.8);await click('jump');await step(.1);await frame('prepare');
  await step(.42);await frame('flight-to-low');
  let landed=false;
  for(let i=0;i<180;i++){
    await step(1/120);
    if((await snapshot()).state==='land'){landed=true;await frame('first-land-low');break;}
  }
  if(!landed)throw Error('Jump did not land');
  await step(.5);await frame('after-land-low');
  if(results.frames['after-land-low'].state!=='low')throw Error('Wrong landing target');
  for(const destination of ['move','jump']){
    await reset();await click('low');await step(.06);await frame(`mid-low-${destination}`);
    const before=await snapshot();await click(destination);const after=await snapshot();
    if(JSON.stringify(before.pose)!==JSON.stringify(after.pose))throw Error('Retarget reset pose');
    await step(.4);await frame(`interrupt-${destination}`);await step(1.6);
    const end=await snapshot();
    const expected=destination==='jump'?'low':'move';
    if(end.state!==expected)throw Error(`Retarget ended in ${end.state}`);
    results.interruptions.push({destination,posePreserved:true,endState:end.state,jumps:end.jumpCount,landings:end.landCount});
  }
  await page.getByRole('combobox',{name:'Фон'}).selectOption('dark');
  await click('low');await step(1);await frame('low-dark');
  await page.getByRole('combobox',{name:'Фон'}).selectOption('light');
  return results;
}
