async (page) => {
 const records=[], issues=[];
 const out='experiments/q3-other-anatomy/output/playwright/builder/';
 const button={idle:'Покой · 1',low:'Низкая поза · 2',move:'Двигаться · 3'};
 const snap=()=>page.evaluate(()=>window.__R4D.snapshot());
 const step=dt=>page.evaluate(dt=>window.__R4D.step(dt),dt);
 const reset=()=>page.evaluate(()=>{window.__R4D.setPaused(true);window.__R4D.reset();});
 function verify(s,label){
  for(const [id,sol] of Object.entries(s.solutions))if(sol.requestedDistance>220.001||sol.requestedDistance<19.999)issues.push({label,id,reach:sol.requestedDistance});
  for(const [id,gap] of Object.entries(s.view.renderedSoleGap))if(gap<-.02)issues.push({label,id,penetration:gap});
  if(s.view.characterBounds.y<0)issues.push({label,clippedTop:s.view.characterBounds.y});
 }
 for(const state of ['idle','low','move']){
  await reset();await page.getByRole('button',{name:button[state],exact:true}).click();await step(state==='move'?2:1);
  const s=await snap();verify(s,state);records.push({label:state,snapshot:s});
  await page.screenshot({path:out+state+'.png'});
 }
 for(const from of ['idle','low','move'])for(const end of ['idle','low','move']){
  await reset();await page.getByRole('button',{name:button[from],exact:true}).click();await step(1);
  await page.getByRole('button',{name:'Прыжок · пробел',exact:true}).click();await step(.18);
  let s=await snap();verify(s,'prepare');if(from==='low'&&end==='move')await page.screenshot({path:out+'prepare.png'});
  await step(.32);s=await snap();verify(s,'flight');
  if(s.state!=='flight')throw new Error('No flight '+from+'/'+end);
  const pose=s.pose;await page.getByRole('button',{name:button[end],exact:true}).click();
  if(JSON.stringify((await snap()).pose)!==JSON.stringify(pose))throw new Error('Pose reset on airborne command');
  if(from==='low'&&end==='move')await page.screenshot({path:out+'flight.png'});
  for(let i=0;i<80;i++){await step(1/60);s=await snap();verify(s,'jump '+from+'/'+end);}
  if(s.state!==end||s.jumpCount!==1||s.landCount!==1)throw new Error('Incorrect landing '+from+'/'+end);
  records.push({label:'jump '+from+' -> '+end,snapshot:s});
 }
 for(const end of ['move','jump']){
  await reset();await page.getByRole('button',{name:button.low,exact:true}).click();await step(.08);
  const before=await snap();await page.getByRole('button',{name:end==='jump'?'Прыжок · пробел':button.move,exact:true}).click();
  const after=await snap();if(JSON.stringify(before.pose)!==JSON.stringify(after.pose))throw new Error('Mid-transition pose reset');
  await step(.08);const continued=await snap();verify(continued,'mid '+end);
  await page.screenshot({path:out+'mid-'+end+'.png'});records.push({label:'mid '+end,before,after,continued});
 }
 await reset();await page.getByRole('button',{name:button.move,exact:true}).click();await step(2);
 let minSupports=3,maxPenetration=0,maxReach=0;
 for(let i=0;i<240;i++){
  await step(1/120);const s=await snap();verify(s,'gait');
  minSupports=Math.min(minSupports,Object.values(s.view.renderedSoleGap).filter(g=>Math.abs(g)<.02).length);
  maxPenetration=Math.min(maxPenetration,...Object.values(s.view.renderedSoleGap));maxReach=Math.max(maxReach,...Object.values(s.solutions).map(v=>v.requestedDistance));
 }
 records.push({label:'steady gait',minSupports,maxPenetration,maxReach});
 await page.getByRole('combobox',{name:'Фон'}).selectOption('dark');await step(.1);await page.screenshot({path:out+'dark-move.png'});
 await page.getByRole('button',{name:'Кости · B',exact:true}).click();await page.screenshot({path:out+'bones.png'});
 await page.getByRole('button',{name:'Кости · B',exact:true}).click();
 await page.getByRole('combobox',{name:'Фон'}).selectOption('light');
 await reset();
 return {issues,records};
}
