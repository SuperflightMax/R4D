async (page) => {
 const out={method:'Targeted recovery of missing numeric observations after harness selector timeout, within initial q4-c1 pass; live routes and pixel audit not repeated.',states:{},jumps:[],interruptions:[]};
 const click=id=>page.locator('#'+id).click(),snap=()=>page.evaluate(()=>window.__R4D.snapshot());
 const step=dt=>page.evaluate(dt=>{const phases=[];let minGap=Infinity,maxGap=-Infinity,maxHeight=0,last='';for(let t=0;t<dt-1e-8;t+=1/120){window.__R4D.step(Math.min(1/120,dt-t));const s=window.__R4D.snapshot();if(s.state!==last){phases.push(s.state);last=s.state;}maxHeight=Math.max(maxHeight,s.height);if(s.state==='land'){const g=Math.min(...Object.values(s.view.renderedSoleGap));minGap=Math.min(minGap,g);maxGap=Math.max(maxGap,g);}}return {phases,maxHeight,minGap:Number.isFinite(minGap)?minGap:null,maxGap:Number.isFinite(maxGap)?maxGap:null,s:window.__R4D.snapshot()};},dt);
 out.initial=await snap();
 for(const id of ['idle','low','move']){await click('reset');await click(id);const a=(await step(1.2)).s;const b=(await step(.23)).s;out.states[id]={rootY:a.pose.rootY,knee:a.pose.shinNear,torso:a.pose.torso,scale:a.view.scale,gaps:a.view.renderedSoleGap,laterRootY:b.pose.rootY,phase:a.phase,laterPhase:b.phase};}
 await click('reset');await click('move');await step(1.5);
 out.walk=await page.evaluate(()=>{let min=Infinity,max=-Infinity;for(let i=0;i<300;i++){window.__R4D.step(1/120);const s=window.__R4D.snapshot(),g=Math.min(...Object.values(s.view.renderedSoleGap));min=Math.min(min,g);max=Math.max(max,g);}return {duration:2.5,minClosestGap:min,maxClosestGap:max};});
 for(const [origin,target] of [['idle','low'],['low','move'],['move','idle']]){
  await click('reset');await click(origin);await step(.9);await click('jump');const a=await step(.4);await click(target);const at=await snap(),b=await step(1.7),e=b.s;
  out.jumps.push({origin,target,phases:[...a.phases,...b.phases],airCommandState:at.state,airCommandGround:at.ground,maxHeight:Math.max(a.maxHeight,b.maxHeight),minLandGap:b.minGap,maxLandGap:b.maxGap,end:{state:e.state,ground:e.ground,jumps:e.jumpCount,lands:e.landCount},contact:e.contactEvent});
 }
 for(const destination of ['move','jump']){await click('reset');await click('low');const before=(await step(.08)).s;await click(destination);const at=await snap(),next=(await step(1/120)).s,e=(await step(2)).s;out.interruptions.push({destination,intermediateRoot:before.pose.rootY,unchangedAtCommand:JSON.stringify(before.pose)===JSON.stringify(at.pose),nextRoot:next.pose.rootY,end:{state:e.state,ground:e.ground,jumps:e.jumpCount,lands:e.landCount}});}
 await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption('dark');
 await page.getByRole('region',{name:'Анимированный персонаж'}).screenshot({path:'D:/dev/R4D/experiments/q4-whole-character/qa/technical/output/playwright/dark.png'});
 await click('reset');await page.keyboard.press('Digit2');await step(.8);out.keyboardLow=(await snap()).state;await page.keyboard.press('Space');await step(.4);out.keyboardJump=(await snap()).state;
 await page.getByText('Цельный исходник и происхождение',{exact:true}).click();out.sourcePreview=await page.locator('#whole').evaluate(img=>({loaded:img.complete,width:img.naturalWidth,height:img.naturalHeight,url:img.currentSrc}));
 return out;
}
