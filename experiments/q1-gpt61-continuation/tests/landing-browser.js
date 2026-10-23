async (page)=>{
 await page.setViewportSize({width:1100,height:950});
 await page.waitForFunction(()=>!!window.__R4D);
 const read=()=>page.evaluate(()=>window.__R4D.snapshot());
 const step=dt=>page.evaluate(dt=>window.__R4D.step(dt),dt);
 if(!(await read()).paused)await page.locator('#pause').click();
 if((await read()).bones)await page.locator('#bones').click();
 const results=[];
 for(const start of ['idle','low','move'])for(const end of ['idle','low','move']){
  await page.locator('#reset').click();await page.locator('#'+start).click();await step(.8);await page.locator('#jump').click();await step(.25);await page.locator('#'+end).click();
  let previous=await read(),previousGap=Math.min(...Object.values(previous.soleGap)),contact=null,maxLandSlip=0;
  const capture=start==='low'&&end==='move';let beforeSaved=false;
  for(let i=0;i<180;i++){
   if(capture&&!beforeSaved&&previous.state==='flight'&&Math.min(...Object.values(previous.soleGap))<previousGap&&Math.min(...Object.values(previous.soleGap))<9&&Math.min(...Object.values(previous.soleGap))>0){await page.locator('#scene').screenshot({path:'tests/evidence/f1-before-contact.png'});beforeSaved=true;}
   await step(1/120);const s=await read();
   if(s.landCount&&!previous.landCount){
    if(Math.min(...Object.values(s.soleGap))<-.00001||Math.min(...Object.values(s.soleGap))>.05)throw new Error('Counter detached from real alpha sole');
    contact={beforeGap:previous.soleGap,atGap:s.soleGap,event:s.contactEvent,rootStep:s.pose.rootY-previous.pose.rootY};
    if(capture)await page.locator('#scene').screenshot({path:'tests/evidence/f1-at-contact.png'});
   }
   if(s.state==='land')for(const side of ['Near','Far'])if(s.contacts[side]){
    if(Math.abs(s.soleGap[side])>1e-5)throw new Error('Planted sole leaves floor');
    maxLandSlip=Math.max(maxLandSlip,Math.abs(s.pose['footX'+side]-s.contacts[side].x));
   }
   if(capture&&s.state==='land'&&s.stateTime>=.1&&s.stateTime<.109)await page.locator('#scene').screenshot({path:'tests/evidence/f1-after-contact.png'});
   previousGap=Math.min(...Object.values(previous.soleGap));previous=s;
  }
  const s=await read();if(!contact||s.landCount!==1||s.state!==end||(capture&&!beforeSaved))throw new Error(`Failed ${start}-${end}`);results.push({start,end,contact,maxLandSlip});
 }
 return results;
}
