async (page) => {
 const out='D:/dev/R4D/experiments/q3b-transforming-crab/qa/visual/output/playwright/c1',rows=[];
 const names={module:'01 Модуль Сложить конструкцию',crab:'02 Краб Развернуть опоры',work:'03 Мастерская Открыть и приступить к работе',forward:'Вперёд →',backward:'← Назад',stop:'Стоп',low:'Ниже',jump:'Прыгнуть ↑'};
 const click=async k=>page.getByRole('button',{name:names[k],exact:true}).click();
 const snap=async name=>{const s=await page.evaluate(()=>window.__Q3B.snapshot());await page.locator('#scene').screenshot({path:out+'/'+name+'.png',scale:'css'});rows.push({file:name+'.png',snapshot:s});};
 const run=async(label,commands,times)=>{
  const events=[...commands.map(([t,key])=>({t,key})),...times.map((t,i)=>({t,i}))].sort((a,b)=>a.t-b.t);const start=Date.now();
  for(const e of events){const wait=start+e.t*1000-Date.now();if(wait>0)await page.waitForTimeout(wait);if(e.key){const before=await page.evaluate(()=>window.__Q3B.snapshot());await click(e.key);rows.push({command:e.key,label,before,after:await page.evaluate(()=>window.__Q3B.snapshot())});}else await snap(label+'-'+String(e.i).padStart(2,'0'));}
 };
 await page.getByRole('button',{name:'Сначала',exact:true}).click();
 await run('third-target',[[0,'work'],[1.1,'module'],[1.45,'crab']],[.1,.4,.75,1,1.2,1.5,1.8,2.15,2.6,3.4,4.2]);
 await click('work');await page.waitForTimeout(3500);
 await run('reverse-third',[[0,'module'],[.9,'crab'],[1.25,'work']],[.1,.35,.65,.85,1,1.35,1.6,2,2.5,3.5]);
 await run('walk-both',[[0,'forward'],[6.8,'backward'],[10.2,'stop'],[11.7,'low']],[.2,1,2,3,3.8,4.3,4.8,5.3,5.8,6.3,6.85,7.1,7.5,8,8.5,9.2,10.3,10.65,11.2,11.9,12.3,12.8]);
 return rows;
}
