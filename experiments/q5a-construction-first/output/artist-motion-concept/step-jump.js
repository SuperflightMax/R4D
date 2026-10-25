async page => {
  await page.reload(); await page.waitForFunction(()=>window.q5a);
  await page.getByRole('button',{name:'Пауза',exact:true}).click();
  await page.getByText('Диагностика и просмотр',{exact:true}).click();
  await page.getByLabel('Крупно 2×',{exact:true}).check();
  const rows=[];let number=0;const fired=new Set();
  const read=()=>page.evaluate(()=>{const q=window.q5a,m=q.motion;return {t:m.time,tick:m.tick,phase:m.phase,elapsed:m.elapsed,target:m.ground,worldX:m.worldX,motors:m.snapshot(),feet:m.feet,pose:q.getPose().landmarks,stats:q.getStats(),events:m.events};});
  async function shot(label){const file='d-'+String(number++).padStart(3,'0')+'.png';const state=await read();await page.locator('.canvas-wrap').screenshot({path:file});rows.push({label,file,...state});}
  async function cmd(key,name){if(fired.has(key))return;fired.add(key);const before=await read();await page.getByRole('button',{name,exact:true}).click();rows.push({command:name,key,before,after:await read()});await shot('command '+key);}
  await page.evaluate(()=>window.q5a.step(120));await shot('settled idle');
  await cmd('jump-idle','Прыжок ↑');
  let recovered=0;
  for(let frame=0;frame<165;frame++){
    const s=await read();
    if(s.phase==='prepare'&&s.elapsed>.05){await cmd('prepare-low','Присед');await cmd('repeat-prepare','Прыжок ↑');}
    if(s.phase==='push'){await cmd('push-idle','Стойка');await cmd('repeat-push','Прыжок ↑');}
    if(s.phase==='flight'&&s.elapsed>.05){await cmd('flight-low','Присед');await cmd('repeat-flight','Прыжок ↑');}
    if(s.phase==='flight'&&s.elapsed>.30)await cmd('flight-walk','Ходьба');
    if(s.phase==='flight'&&s.elapsed>.65)await cmd('flight-idle','Стойка');
    if(s.phase==='landing'){await cmd('landing-low','Присед');if(s.elapsed>.12)await cmd('landing-walk','Ходьба');}
    if(s.phase==='ground'&&fired.has('landing-low')){recovered++;if(recovered===2)await cmd('recovery-low','Присед');if(recovered===6)await cmd('recovery-walk','Ходьба');}
    await page.evaluate(()=>window.q5a.step(2));
    if(frame%4===0||frame===164)await shot('jump progression '+frame);
  }
  await cmd('next-jump-after-recovery','Прыжок ↑');
  for(let f=0;f<125;f++){await page.evaluate(()=>window.q5a.step(2));if(f%8===0||f===124)await shot('repeat full jump '+f);}
  await page.getByLabel('Тёмный фон',{exact:true}).check();
  await page.getByLabel('Кости и опора',{exact:true}).check();
  await page.getByLabel('Сетка и грани',{exact:true}).check();await shot('final diagnostics dark');
  return {scenario:'desktop light 2x, jump phase commands/rejected airborne repeats/recovery/new full jump',rows};
}
