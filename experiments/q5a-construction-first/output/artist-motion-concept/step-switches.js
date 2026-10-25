async page => {
  await page.reload(); await page.waitForFunction(()=>window.q5a);
  await page.getByRole('button',{name:'Пауза',exact:true}).click();
  await page.getByText('Диагностика и просмотр',{exact:true}).click();
  await page.getByLabel('Тёмный фон',{exact:true}).check();
  await page.getByLabel('Крупно 2×',{exact:true}).check();
  const rows=[]; let number=0;
  const read=()=>page.evaluate(()=>{const q=window.q5a,m=q.motion;return {t:m.time,tick:m.tick,phase:m.phase,elapsed:m.elapsed,target:m.ground,worldX:m.worldX,motors:m.snapshot(),pose:q.getPose().landmarks,stats:q.getStats()};});
  async function shot(label){const file='c2-'+String(number++).padStart(3,'0')+'.png';const state=await read();await page.locator('.canvas-wrap').screenshot({path:file});rows.push({label,file,...state});}
  async function frames(n,label,stride=3){for(let i=0;i<n;i++){await page.evaluate(()=>window.q5a.step(2));if(i%stride===0||i===n-1)await shot(label+' frame '+(i+1));}}
  async function cmd(name,label){const before=await read();await page.getByRole('button',{name,exact:true}).click();rows.push({command:name,label,before,after:await read()});}
  await shot('initial');
  await cmd('Присед','early low');await frames(4,'low before interrupt',1);
  await cmd('Ходьба','walk at 4/60s of low');await frames(30,'early low to walk');
  await cmd('Стойка','idle during start');await frames(5,'early stop idle',1);
  await cmd('Присед','low during stop');await frames(5,'early low',1);
  await cmd('Ходьба','walk during low');await frames(5,'early walk',1);
  await page.getByRole('combobox',{name:'Остановка в',exact:true}).selectOption('low');
  await cmd('Стоп','stop to low during walk start');await frames(45,'stop low');
  await cmd('Стойка','low to idle');await frames(7,'rise interrupted',1);
  await cmd('Присед','reverse rise');await frames(6,'reverse low',1);
  await cmd('Ходьба','reverse to walk');await frames(45,'resume walk',4);
  await page.getByLabel('Кости и опора',{exact:true}).check();
  await page.getByLabel('Сетка и грани',{exact:true}).check();await shot('same paused frame diagnostics');
  await page.getByLabel('Кости и опора',{exact:true}).uncheck();
  await page.getByLabel('Сетка и грани',{exact:true}).uncheck();await shot('same paused frame clean');
  await page.getByRole('button',{name:'Кадр +',exact:true}).click();await shot('actual UI single frame');
  return {scenario:'desktop dark 2x paused early/frequent switches, same production step(2) as Frame+',rows};
}
