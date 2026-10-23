async(page)=>{
  const frames=[];
  const capture=async label=>{
    const s=await page.evaluate(()=>window.__R4D.snapshot());
    frames.push({label,snapshot:s});
    await page.locator('#scene').screenshot({path:`experiments/q5-construction-first/output/playwright/artist/${label}.png`});
  };
  // Continue the interrupted author pass; do not repeat routes/state/mid-transition matrix.
  await page.evaluate(()=>window.__R4D.step(.9));
  await capture('mid-jump-landed-low');
  await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption('dark');
  await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
  await page.evaluate(()=>{window.__R4D.setPaused(true);window.__R4D.step(.4);});
  await capture('dark-idle');
  await page.getByRole('button',{name:'Низкая поза · 2',exact:true}).click();
  await page.evaluate(()=>window.__R4D.step(.65));
  await capture('dark-low');
  await page.getByRole('button',{name:'Конструкция / арт',exact:true}).click();
  await capture('same-low-construction');
  await page.getByRole('button',{name:'Конструкция / арт',exact:true}).click();
  await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption('light');
  return {candidate:'q5-c1',continuationOnly:true,frames};
}
