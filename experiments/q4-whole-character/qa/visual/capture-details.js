async (page) => {
  const out='D:/dev/R4D/experiments/q4-whole-character/qa/visual/output/playwright';
  const box=await page.locator('#scene').boundingBox();
  const clip={x:box.x+box.width/2-290,y:box.y,width:580,height:box.height};
  const records=[];
  const shot=async name=>{
    const s=await page.evaluate(()=>window.__R4D.snapshot());
    await page.screenshot({path:out+'/'+name+'.png',clip,scale:'css'});
    records.push({file:name+'.png',state:s.state,ground:s.ground,paused:s.paused,pose:s.pose,view:s.view,time:s.time});
  };
  await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
  if(await page.evaluate(()=>window.__R4D.snapshot().paused))await page.getByRole('button',{name:'Продолжить · P',exact:true}).click();
  await page.waitForTimeout(600);
  await page.getByRole('button',{name:'Пауза · P',exact:true}).click();
  await shot('idle-dark');
  await page.getByRole('button',{name:'Низкая поза · 2',exact:true}).click();
  await page.getByRole('button',{name:'Продолжить · P',exact:true}).click();
  await page.waitForTimeout(900);
  await page.getByRole('button',{name:'Пауза · P',exact:true}).click();
  await shot('low-dark');
  await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption('light');
  await shot('low-light');
  return records;
}
