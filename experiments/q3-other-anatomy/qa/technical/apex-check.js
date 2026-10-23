async (page) => {
  await page.waitForFunction(()=>window.__R4D);
  await page.evaluate(()=>window.__R4D.setPaused(true));
  await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
  await page.evaluate(()=>window.__R4D.step(.9));
  await page.getByRole('button',{name:'Прыжок · пробел',exact:true}).click();
  await page.evaluate(()=>window.__R4D.step(76/120));
  const s=await page.evaluate(()=>window.__R4D.snapshot());
  const scene=await page.locator('#scene').boundingBox();
  await page.locator('#scene').screenshot({path:'D:/dev/R4D/experiments/q3-other-anatomy/qa/technical/output/playwright/apex-bounds.png'});
  return {reason:'Inspect apparent top crop in jump-75.png during same full pass',state:s.state,time:s.time,height:s.height,view:s.view,world:s.world,scene};
}
