async (page) => {
 const output='D:/dev/R4D/experiments/q1-gpt61-continuation/qa/artist/f1/';
 const result=[];
 for(const mode of ['idle','move','low']){
  await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
  await page.evaluate(()=>window.__R4D.setPaused(true));
  const name={idle:'Покой · 1',move:'Идти · 3',low:'Низкая поза · 2'}[mode];
  await page.getByRole('button',{name,exact:true}).click();
  await page.evaluate(()=>window.__R4D.step(1));
  await page.getByRole('button',{name:'Прыжок · пробел',exact:true}).click();
  let before=false,contact=false,previousHeight=0;
  for(let i=0;i<240;i++){
   const s=await page.evaluate(()=>{window.__R4D.step(1/120);return window.__R4D.snapshot();});
   if(!before&&s.state==='flight'&&i>70&&Math.min(s.soleGap.Near,s.soleGap.Far)<30){
    await page.locator('#scene').screenshot({path:output+mode+'-before.png'});before=true;
   }
   if(!contact&&s.state==='land'){
    await page.locator('#scene').screenshot({path:output+mode+'-contact.png'});
    result.push({mode,contact:s.contactEvent,soleGap:s.soleGap});contact=true;
    await page.evaluate(()=>window.__R4D.step(.12));
    await page.locator('#scene').screenshot({path:output+mode+'-compress.png'});
    await page.evaluate(()=>window.__R4D.step(.3));
    await page.locator('#scene').screenshot({path:output+mode+'-return.png'});break;
   }
   previousHeight=s.height;
  }
 }
 await page.evaluate(()=>window.__R4D.setPaused(false));
 return result;
}
