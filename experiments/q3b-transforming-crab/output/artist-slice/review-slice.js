async (page) => {
  await page.waitForFunction(() => !!window.__Q3B);
  await page.getByRole('button', {name:'Пауза · P', exact:true}).click();
  const samples=[];
  async function capture(name) {
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const snapshot=await page.evaluate(()=>__Q3B.snapshot());
    await page.locator('#scene').screenshot({path:'D:/dev/R4D/experiments/q3b-transforming-crab/output/artist-slice/'+name+'.png'});
    samples.push({name,u:snapshot.u,uv:snapshot.uv,world:snapshot.world});
    return snapshot;
  }
  await capture('module-u0');
  await page.getByRole('button',{name:'02 Краб Развернуть опоры'}).click();
  await page.evaluate(()=>__Q3B.step(3));
  await capture('open-000');
  await page.getByRole('button',{name:'03 Мастерская Открыть и приступить к работе'}).click();
  for(const [name,target] of [['open-025',1.25],['open-050',1.5],['open-075',1.75],['open-100',1.99999]]) {
    await page.evaluate(target=>{for(let i=0;i<2400&&__Q3B.snapshot().u<target;i++)__Q3B.step(1/600);},target);
    await capture(name);
  }
  await page.getByRole('button',{name:'Шарниры',exact:true}).click();
  await capture('open-100-mast-mount');
  await page.getByRole('button',{name:'Шарниры',exact:true}).click();
  await page.getByRole('button',{name:'02 Краб Развернуть опоры'}).click();
  for(const [name,target] of [['reverse-075',1.75],['reverse-050',1.5],['reverse-025',1.25]]) {
    await page.evaluate(target=>{for(let i=0;i<2400&&__Q3B.snapshot().u>target;i++)__Q3B.step(1/600);},target);
    await capture(name);
  }
  await page.getByRole('button',{name:'03 Мастерская Открыть и приступить к работе'}).click();
  await page.evaluate(()=>__Q3B.step(.12));
  const before=await page.evaluate(()=>__Q3B.snapshot());
  await page.getByRole('button',{name:'01 Модуль Сложить конструкцию'}).click();
  const after=await page.evaluate(()=>__Q3B.snapshot());
  const delta=Math.max(...Object.keys(before.world).flatMap(id=>['x','y','angle'].map(key=>Math.abs(after.world[id][key]-before.world[id][key]))));
  await capture('mid-retarget-request');
  await page.evaluate(()=>__Q3B.step(.18));
  await capture('mid-retarget-moving');
  await page.getByRole('button',{name:'02 Краб Развернуть опоры'}).click();
  await page.evaluate(()=>__Q3B.step(3));
  await capture('reverse-return-crab');
  return {manifest:await page.evaluate(()=>__Q3B.snapshot().manifestRevision),samples,
    retarget:{before:{u:before.u,uv:before.uv,world:before.world},after:{u:after.u,uv:after.uv,world:after.world},maxImmediateWorldDelta:delta}};
}
