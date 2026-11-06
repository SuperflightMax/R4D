async (page) => {
  await page.reload();
  await page.waitForFunction(()=>!!window.__Q3B);
  await page.getByText('Рассмотреть движение',{exact:true}).click();
  await page.getByRole('button',{name:'Пауза · P',exact:true}).click();
  const frames=[],retargets=[];
  const advance=seconds=>page.evaluate(seconds=>__Q3B.step(seconds),seconds);
  const form=name=>page.locator('[data-form='+name+']').click();
  async function capture(name) {
    await page.evaluate(()=>new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r))));
    const snapshot=await page.evaluate(()=>__Q3B.snapshot());
    await page.locator('#scene').screenshot({path:'D:/dev/R4D/experiments/q3b-transforming-crab/output/artist-candidate/'+name+'.png'});
    frames.push({name,snapshot});return snapshot;
  }
  async function reach(name,target,direction=1) {
    await page.evaluate(({target,direction})=>{
      for(let i=0;i<3600&&(direction>0?__Q3B.snapshot().u<target:__Q3B.snapshot().u>target);i++)__Q3B.step(1/600);
    },{target,direction});return capture(name);
  }
  async function retarget(name,target) {
    const before=await page.evaluate(()=>__Q3B.snapshot());await form(target);
    const after=await page.evaluate(()=>__Q3B.snapshot());
    retargets.push({name,before,after,maxImmediateWorldDelta:Math.max(...before.parts.flatMap(id=>['x','y','angle'].map(k=>Math.abs(before.world[id][k]-after.world[id][k]))))});
    await capture(name+'-request');await advance(.16);await capture(name+'-continued');
  }
  await capture('module-idle');
  await form('crab');
  for(const [name,u] of [['A-025',.25],['A-050',.5],['A-075',.75],['crab-idle-0',.99999]])await reach(name,u);
  await advance(.65);await capture('crab-idle-1');
  await form('work');
  for(const [name,u] of [['B-025',1.25],['B-050',1.5],['B-075',1.75],['work-idle-0',1.99999]])await reach(name,u);
  await advance(.65);await capture('work-idle-1');
  await form('crab');await reach('B-reverse-050',1.5,-1);await advance(3);
  await form('module');await reach('A-reverse-050',.5,-1);await advance(3);await capture('module-return');
  await form('crab');await reach('mid-A-before',.35);await retarget('mid-A-to-work','work');await advance(3);
  await form('crab');await reach('mid-B-before',1.6,-1);await retarget('mid-B-reverse-to-work','work');
  await retarget('mid-B-third-module','module');await advance(3);
  await form('crab');await advance(3);
  await page.getByRole('button',{name:'Вперёд →',exact:true}).click();
  await advance(.2);await capture('forward-accel');await advance(1);await capture('forward-step');
  await page.getByRole('button',{name:'← Назад',exact:true}).click();
  await advance(.2);await capture('direction-reverse');await advance(1.1);await capture('backward-step');
  await page.getByRole('button',{name:'Стоп',exact:true}).click();await advance(.15);await capture('brake');await advance(.9);await capture('stop');
  await page.getByRole('button',{name:'Ниже',exact:true}).click();await advance(1);await capture('low');
  await page.getByRole('button',{name:'Прыгнуть ↑',exact:true}).click();
  await page.evaluate(()=>{for(let i=0;i<1200&&__Q3B.snapshot().jump==='ground';i++)__Q3B.step(1/120);});
  await advance(.14);await capture('jump-prepare');
  await page.evaluate(()=>{for(let i=0;i<1800&&(__Q3B.snapshot().jump==='prepare'||(__Q3B.snapshot().jump==='flight'&&__Q3B.snapshot().jumpTime<.4));i++)__Q3B.step(1/600);});
  await capture('jump-peak');
  await form('work');await capture('air-work-request');await advance(.6);await capture('jump-land');await advance(3);await capture('land-work');
  await page.getByRole('combobox',{name:'Свет',exact:true}).selectOption('light');await capture('work-daylight');
  await form('module');await advance(4);await capture('module-daylight');
  await page.getByRole('button',{name:'▶ Показать всё',exact:true}).click();
  await page.getByRole('button',{name:'Пауза · P',exact:true}).click();
  const started=await page.evaluate(()=>__Q3B.snapshot().time);
  for(const t of [3.4,7.9,12.9,17.0,21.9,23.8,25.8,30.2,35.8]){
    await page.evaluate(({started,t})=>__Q3B.step(Math.max(0,started+t-__Q3B.snapshot().time)),{started,t});
    await capture('auto-'+t);
  }
  await page.getByRole('button',{name:'Стоп',exact:true}).click();await capture('manual-cancels-auto');
  return {reviewKind:'author exact-candidate visual review, not independent QA',frames,retargets};
}
