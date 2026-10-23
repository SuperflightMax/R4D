async(page)=>{
  const assert=(v,m)=>{if(!v)throw Error(m);};
  await page.reload();await page.waitForFunction(()=>!!window.__R4D);
  await page.keyboard.press('p');await page.keyboard.press('r');
  const read=()=>page.evaluate(()=>window.__R4D.snapshot());
  const step=t=>page.evaluate(t=>window.__R4D.step(t),t);
  const rows=[];
  await page.keyboard.press('2');await step(.06);const mid=await read();
  await page.keyboard.press('3');const requested=await read();
  assert(Object.keys(mid.pose).every(k=>mid.pose[k]===requested.pose[k]),'mid low-move reset');
  await step(.7);assert((await read()).state==='move','mid move');
  await page.keyboard.press('1');await step(.7);assert((await read()).state==='idle','stop');
  await page.keyboard.press('b');assert((await read()).bones,'bones');await page.keyboard.press('b');
  let t=(await read()).time;await page.waitForTimeout(100);assert((await read()).time===t,'pause');
  await page.keyboard.press('.');assert(Math.abs((await read()).time-t-1/60)<1e-9,'step');
  await page.getByText('Маршруты и замедление',{exact:true}).click();
  for(const [name,state,count] of [['Маршрут 1','idle',1],['Маршрут 2','low',2],['В середине → идти','move',0],['В середине → прыжок','low',1]]){
    await page.getByRole('button',{name,exact:true}).click();await page.keyboard.press('p');await step(7.2);
    const s=await read();assert(s.state===state&&s.jumpCount===count&&s.landCount===count,'route '+name);
    rows.push({name,state:s.state,jumps:s.jumpCount,lands:s.landCount});
  }
  // Ordinary rendering time and actual keyboard input, no step.
  await page.keyboard.press('r');await page.keyboard.press('p');
  await page.keyboard.press('3');await page.waitForTimeout(300);
  await page.keyboard.press('2');await page.waitForTimeout(60);await page.keyboard.press('Space');
  await page.waitForTimeout(400);const flight=await read();assert(flight.state==='flight','real-time flight');
  await page.keyboard.press('1');await page.waitForTimeout(1700);const end=await read();
  assert(end.state==='idle'&&end.landCount===1,'real-time landing');
  return {result:'PASS',routes:rows,midDepth:mid.pose.rootY,realtime:{flight:flight.state,final:end.state,counts:[end.jumpCount,end.landCount]}};
}
