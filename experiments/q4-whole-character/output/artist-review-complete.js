async (page) => {
  const out='D:/dev/R4D/experiments/q4-whole-character/output/playwright/artist/';
  const observed=[];
  const step=dt=>page.evaluate(dt=>window.__R4D.step(dt),dt);
  const snap=()=>page.evaluate(()=>window.__R4D.snapshot());
  const capture=async name=>{observed.push({name,snapshot:await snap()});await page.screenshot({path:out+name+'.png',fullPage:true});};
  await page.locator('details').first().locator('summary').click();
  for(const route of ['one','two']){
    await page.locator('[data-route="'+route+'"]').click();
    await page.evaluate(()=>window.__R4D.setPaused(true));
    for(let i=0;i<16;i++){await step(.5);observed.push({name:'route-'+route+'-'+i,snapshot:await snap()});}
    await capture('route-'+route+'-end');
  }
  await page.locator('#reset').click();await page.evaluate(()=>window.__R4D.setPaused(true));
  await page.locator('#low').click();await step(.8);
  await page.locator('#background').selectOption('dark');await capture('dark-low');
  await page.locator('#move').click();await step(.6);await capture('dark-move');
  await page.locator('#background').selectOption('light');
  await page.locator('#reset').click();await page.evaluate(()=>window.__R4D.setPaused(true));
  return {review:'Artist review resumed after selector encoding timeout; no restart or implementation edits',observed};
}
