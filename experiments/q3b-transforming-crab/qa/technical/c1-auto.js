async (page) => {
 const dir='D:/dev/R4D/experiments/q3b-transforming-crab/qa/technical/output/playwright/c1/';
 const read=()=>page.evaluate(()=>window.__Q3B.snapshot());
 const brief=s=>({t:s.time,u:s.u,form:s.form,action:s.action,speed:s.speed,jump:s.jump,height:s.height,jumps:s.jumpCount,lands:s.landCount,auto:s.auto,gaps:s.soleGaps,bounds:s.view.characterBounds});
 const result={method:'Real-time show button, manual override, then full show'};
 await page.evaluate(()=>window.__Q3B.setPaused(false));
 await page.getByRole('button',{name:'Сначала',exact:true}).click();
 await page.getByRole('button',{name:'▶ Показать всё',exact:true}).click();await page.waitForTimeout(900);
 result.beforeOverride=brief(await read());
 await page.getByRole('button',{name:'03 Мастерская Открыть и приступить к работе',exact:true}).click();
 result.afterOverride=brief(await read());await page.waitForTimeout(2200);result.overrideLater=brief(await read());
 await page.getByRole('button',{name:'Сначала',exact:true}).click();
 await page.getByRole('button',{name:'▶ Показать всё',exact:true}).click();
 const samples=[],shots=[];let prior='',lastShot=-10;
 for(let i=0;i<365;i++){
  await page.waitForTimeout(120);const s=await read(),key=s.form+'>'+s.action+'>'+s.jump;
  if(key!==prior||i%10===0){samples.push(brief(s));prior=key;}
  if(i%40===0||(s.jump==='flight'&&s.time-lastShot>1.5)){const file='show-'+i+'.png';await page.locator('#scene').screenshot({path:dir+file});shots.push({file,...brief(s)});lastShot=s.time;}
  if(!s.auto&&s.time>35)break;
 }
 const end=await read();return {...result,samples,shots,end:brief(end),events:end.events};
}
