async (page) => {
  await page.reload(); await page.waitForFunction(()=>!!window.__R4D);
  await page.keyboard.press('r');
  await page.keyboard.press('3'); await page.waitForTimeout(300);
  const move=await page.evaluate(()=>window.__R4D.snapshot());
  await page.keyboard.press('2'); await page.waitForTimeout(60);
  const intermediate=await page.evaluate(()=>window.__R4D.snapshot());
  await page.keyboard.press('Space'); await page.waitForTimeout(400);
  const flight=await page.evaluate(()=>window.__R4D.snapshot());
  await page.keyboard.press('b');
  await page.screenshot({path:'experiments/q1-gpt61-continuation/qa/technical/output/playwright/realtime-flight.png'});
  await page.keyboard.press('1'); await page.waitForTimeout(1500);
  const end=await page.evaluate(()=>window.__R4D.snapshot());
  if(move.state!=='move'||intermediate.ground!=='low'||flight.state!=='flight'||end.state!=='idle'||end.landCount!==1)
    throw new Error('Realtime progression failed '+JSON.stringify([move.state,intermediate.state,flight.state,end.state,end.landCount]));
  const brief=s=>({time:s.time,state:s.state,ground:s.ground,rootY:s.pose.rootY,height:s.height,jumps:s.jumpCount,lands:s.landCount});
  return {result:'PASS',move:brief(move),intermediate:brief(intermediate),flight:brief(flight),end:brief(end)};
}
