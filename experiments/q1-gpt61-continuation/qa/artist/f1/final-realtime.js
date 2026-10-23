async (page) => {
 const result=[];
 for(const mode of ['idle','move','low']){
  await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
  await page.evaluate(()=>window.__R4D.setPaused(false));
  await page.getByRole('button',{name:{idle:'Покой · 1',move:'Идти · 3',low:'Низкая поза · 2'}[mode],exact:true}).click();
  await page.waitForTimeout(600);
  await page.getByRole('button',{name:'Прыжок · пробел',exact:true}).click();
  let landed=false;
  for(let i=0;i<120;i++){
   await page.waitForTimeout(16);
   const s=await page.evaluate(()=>window.__R4D.snapshot());
   if(s.state==='land'){
    await page.locator('#scene').screenshot({path:'D:/dev/R4D/experiments/q1-gpt61-continuation/qa/artist/f1/final-'+mode+'-live.png'});
    result.push({mode,state:s.state,stateTime:s.stateTime,contact:s.contactEvent,soleGap:s.soleGap});landed=true;break;
   }
  }
  if(!landed)throw new Error('No landing observed for '+mode);
  await page.waitForTimeout(450);
 }
 return result;
}
