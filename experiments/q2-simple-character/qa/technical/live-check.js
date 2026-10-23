async (page) => {
  await page.waitForFunction(() => window.__R4D);
  const result = {kind:'real-time browser, real button clicks',routes:[]};
  for (const route of [1,2]) {
    await page.getByRole('button',{name:`Маршрут ${route}`,exact:true}).click();
    const samples=[]; let last=''; const shots=[];
    for(let i=0;i<58;i++) {
      await page.waitForTimeout(125);
      const s=await page.evaluate(()=>window.__R4D.snapshot());
      const key=s.state+'>'+s.ground;
      if(key!==last) {samples.push({t:s.time,state:s.state,ground:s.ground,height:s.height,phase:s.phase});last=key;}
      if((route===1&&[7,19,35].includes(i))||(route===2&&[12,20,36].includes(i))) {
        const path=`live-route-${route}-${i}.png`;
        await page.getByRole('region',{name:'Анимированный персонаж'}).screenshot({path});shots.push({path,t:s.time,state:s.state,ground:s.ground});
      }
    }
    const end=await page.evaluate(()=>window.__R4D.snapshot());
    result.routes.push({route,samples,shots,end:{t:end.time,state:end.state,ground:end.ground,jumps:end.jumpCount,lands:end.landCount,inputs:end.inputs,events:end.events}});
  }
  return result;
}
