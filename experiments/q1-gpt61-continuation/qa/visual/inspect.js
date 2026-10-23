async (page) => {
  const root='D:/dev/R4D/experiments/q1-gpt61-continuation/qa/visual/';
  const step=page.getByRole('button',{name:'Шаг · .',exact:true});
  const advance=async n=>{for(let i=0;i<n;i++) await step.click()};
  const snap=async name=>{await page.getByRole('region',{name:'Анимированный персонаж',exact:true}).screenshot({path:root+name+'.png'}); return (await page.locator('body').innerText()).split('Нажимайте')[1]?.split('Маршруты')[0]};
  await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
  await page.keyboard.press('2'); await advance(35);
  const states={low:await snap('02-low')};
  await page.keyboard.press('b'); states.bones=await snap('03-low-bones'); await page.keyboard.press('b');
  await page.keyboard.press('3'); await advance(35);
  for(let i=0;i<4;i++){states['walk'+i]=await snap('raw-walk'+i);await advance(12)}
  await page.keyboard.press('Space'); await advance(7); states.prepare=await snap('raw-prepare');
  await advance(21); states.flight=await snap('04-flight');
  await page.keyboard.press('2'); await advance(38); states.land=await snap('raw-land');
  await advance(35); states.returnLow=await snap('raw-return-low');
  await page.keyboard.press('1'); await advance(35); await page.keyboard.press('2'); await advance(4);
  states.mid=await snap('raw-mid-low'); await page.keyboard.press('3'); await advance(7); states.midMove=await snap('raw-mid-move');
  await page.keyboard.press('1'); await advance(35); await page.keyboard.press('2'); await advance(4); await page.keyboard.press('Space'); await advance(5); states.midJump=await snap('raw-mid-jump');
  return states;
}
