async page=>{
 const device=page.viewportSize().width<600?'mobile':'desktop',runs=[];
 for(const state of ['idle','low','walk']){
  await page.reload();await page.waitForFunction(()=>window.q5a);await page.bringToFront();
  await page.getByText('Диагностика и просмотр',{exact:true}).click();await page.getByLabel('Крупно 2×',{exact:true}).check();
  if(state!=='idle')await page.getByLabel('Тёмный фон',{exact:true}).check();
  if(state==='walk'){await page.getByLabel('Кости и опора',{exact:true}).check();await page.getByLabel('Сетка и грани',{exact:true}).check();}
  if(state!=='idle')await page.getByRole('button',{name:state==='low'?'Присед':'Ходьба',exact:true}).click();
  await page.waitForTimeout(1400);await page.getByRole('button',{name:'Прыжок ↑',exact:true}).click();
  const rows=[],start=Date.now();
  while(Date.now()-start<2250){
   const data=await page.evaluate(()=>({tick:window.q5a.motion.tick,t:window.q5a.motion.time,phase:window.q5a.motion.phase,elapsed:window.q5a.motion.elapsed,framing:window.q5a.getStats().framing}));
   const file=device+'-rt-'+state+'-'+String(rows.length).padStart(3,'0')+'.png';await page.locator('.canvas-wrap').screenshot({path:file});rows.push({file,wallMs:Date.now()-start,...data});await page.waitForTimeout(60);
  }
  await page.getByRole('button',{name:'Пауза',exact:true}).click();runs.push({state,rows});
 }
 return {device,rate:1,runs};
}
