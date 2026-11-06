async (page) => {
  const dir='D:/dev/R4D/experiments/q3b-transforming-crab/qa/technical/output/playwright/c1/';
  const read=()=>page.evaluate(()=>window.__Q3B.snapshot());
  const brief=s=>({t:s.time,u:s.u,uv:s.uv,form:s.form,action:s.action,speed:s.speed,jump:s.jump,height:s.height,auto:s.auto,bounds:s.view.characterBounds,scale:s.view.scale,gaps:s.soleGaps});
  const result={method:'Real-time UI form buttons; selected live rendered frames',routes:[],idle:[]};
  await page.waitForFunction(()=>window.__Q3B);
  await page.getByText('Рассмотреть движение',{exact:true}).click();
  await page.getByRole('button',{name:'Сначала',exact:true}).click();
  for(let i=0;i<3;i++){result.idle.push(await read());await page.waitForTimeout(450);}
  for(const [name,target] of [['crab','02 Краб Развернуть опоры'],['work','03 Мастерская Открыть и приступить к работе'],['crab','02 Краб Развернуть опоры'],['module','01 Модуль Сложить конструкцию']]){
    await page.getByRole('button',{name:target,exact:true}).click();
    const samples=[],shots=[];
    for(let i=0;i<23;i++){
      await page.waitForTimeout(155);const s=await read();samples.push(brief(s));
      if([2,8,15,22].includes(i)){
        const file=`form-${result.routes.length}-${name}-${i}.png`;
        await page.locator('#scene').screenshot({path:dir+file});shots.push({file,...brief(s)});
      }
    }
    result.routes.push({name,samples,shots,end:await read()});
  }
  await page.getByRole('button',{name:'03 Мастерская Открыть и приступить к работе',exact:true}).click();
  await page.waitForTimeout(900);result.thirdTargetBefore=await read();
  await page.getByRole('button',{name:'02 Краб Развернуть опоры',exact:true}).click();
  await page.waitForTimeout(300);result.reverseLive=await read();
  await page.getByRole('button',{name:'01 Модуль Сложить конструкцию',exact:true}).click();
  await page.waitForTimeout(3200);result.thirdTargetEnd=await read();
  await page.locator('#scene').screenshot({path:dir+'third-target-end.png'});
  return result;
}
