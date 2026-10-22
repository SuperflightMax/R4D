async (page) => {
  await page.getByText('Диагностика и воспроизведение', { exact: true }).click();
  await page.getByRole('button', { name: 'Сначала · R', exact: true }).click();
  await page.keyboard.press('p');
  await page.keyboard.down('d');
  for (let i=0;i<27;i++) await page.getByRole('button',{name:'Шаг · .',exact:true}).click();
  await page.screenshot({path:'D:/dev/R4D/experiments/gpt-6.1-sol/qa/visual/02-walk.png'});
  await page.keyboard.press('Space');
  for (let i=0;i<7;i++) await page.getByRole('button',{name:'Шаг · .',exact:true}).click();
  await page.screenshot({path:'D:/dev/R4D/experiments/gpt-6.1-sol/qa/visual/03-prepare.png'});
  for (let i=0;i<24;i++) await page.getByRole('button',{name:'Шаг · .',exact:true}).click();
  await page.keyboard.up('d');
  await page.screenshot({path:'D:/dev/R4D/experiments/gpt-6.1-sol/qa/visual/04-flight.png'});
  for (let i=0;i<38;i++) await page.getByRole('button',{name:'Шаг · .',exact:true}).click();
  await page.screenshot({path:'D:/dev/R4D/experiments/gpt-6.1-sol/qa/visual/05-land.png'});
  for (let i=0;i<23;i++) await page.getByRole('button',{name:'Шаг · .',exact:true}).click();
  await page.keyboard.press('b');
  await page.screenshot({path:'D:/dev/R4D/experiments/gpt-6.1-sol/qa/visual/06-bones-idle.png'});
  return await page.locator('body').innerText();
}
