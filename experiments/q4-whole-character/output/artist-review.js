async (page) => {
  const out='D:/dev/R4D/experiments/q4-whole-character/output/playwright/artist/';
  const observed=[];
  await page.setViewportSize({width:1280,height:1000});
  await page.reload();
  await page.locator('#loading').waitFor({state:'detached'});
  const step=dt=>page.evaluate(dt=>window.__R4D.step(dt),dt);
  const snap=()=>page.evaluate(()=>window.__R4D.snapshot());
  const capture=async name=>{
    observed.push({name,snapshot:await snap()});
    await page.screenshot({path:out+name+'.png',fullPage:true});
  };
  const reset=async()=>{await page.locator('#reset').click();await page.evaluate(()=>window.__R4D.setPaused(true));};
  await reset();await step(.8);await capture('idle-a');await step(.6);await capture('idle-b');
  await page.locator('#bind').click();await capture('bind');await page.locator('#idle').click();
  await page.locator('#low').click();await step(.8);await capture('low');
  await page.locator('#move').click();await step(.2);await capture('low-to-move');await step(.35);await capture('move-a');await step(.35);await capture('move-b');
  await page.locator('#idle').click();await step(.8);
  await page.locator('#jump').click();await step(.10);await capture('jump-prepare');await step(.30);await capture('jump-flight');
  await page.locator('#low').click();await capture('air-target-low');
  let landed=false;
  for(let i=0;i<100;i++){await step(1/60);if((await snap()).state==='land'){landed=true;break;}}
  await capture('jump-land');await step(.8);await capture('land-to-low');
  for(const next of ['move','jump']){
    await reset();await page.locator('#low').click();await step(.06);await capture('mid-'+next+'-before');
    await page.locator('#'+next).click();await step(.08);await capture('mid-'+next+'-after');await step(1.8);await capture('mid-'+next+'-settled');
  }
  await page.getByText('Маршруты и замедление',{exact:true}).click();
  for(const route of ['one','two']){
    await page.locator('[data-route="'+route+'"]').click();
    await page.evaluate(()=>window.__R4D.setPaused(true));
    for(let i=0;i<16;i++){await step(.5);observed.push({name:'route-'+route+'-'+i,snapshot:await snap()});}
    await capture('route-'+route+'-end');
  }
  await reset();await page.locator('#low').click();await step(.8);
  await page.locator('#background').selectOption('dark');await capture('dark-low');
  await page.locator('#move').click();await step(.6);await capture('dark-move');
  await page.locator('#background').selectOption('light');await reset();
  return {review:'Artist self-review, not independent QA',landed,observed};
}
