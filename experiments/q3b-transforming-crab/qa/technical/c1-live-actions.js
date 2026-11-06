async (page) => {
 const dir='D:/dev/R4D/experiments/q3b-transforming-crab/qa/technical/output/playwright/c1/';
 const read=()=>page.evaluate(()=>window.__Q3B.snapshot());
 const brief=s=>({t:s.time,u:s.u,uv:s.uv,form:s.form,action:s.action,x:s.x,speed:s.speed,jump:s.jump,height:s.height,jumps:s.jumpCount,lands:s.landCount,gaps:s.soleGaps,bounds:s.view.characterBounds});
 const result={method:'Live wall-time buttons and keyboard',motion:[],jumps:[]};
 await page.getByRole('button',{name:'02 Краб Развернуть опоры',exact:true}).click();await page.waitForTimeout(3900);
 result.idle=[];for(let i=0;i<3;i++){result.idle.push(await read());await page.waitForTimeout(400);}
 await page.getByRole('button',{name:'Вперёд →',exact:true}).click();
 for(let i=0;i<5;i++){await page.waitForTimeout(150);result.motion.push({stage:'accelerate forward',...brief(await read())});}
 await page.locator('#scene').screenshot({path:dir+'live-forward.png'});
 await page.getByRole('button',{name:'← Назад',exact:true}).click();
 for(let i=0;i<6;i++){await page.waitForTimeout(130);result.motion.push({stage:'reverse backward',...brief(await read())});}
 await page.getByRole('button',{name:'Стоп',exact:true}).click();
 for(let i=0;i<5;i++){await page.waitForTimeout(140);result.motion.push({stage:'brake',...brief(await read())});}
 await page.getByRole('button',{name:'Ниже',exact:true}).click();await page.waitForTimeout(900);
 result.low=[];for(let i=0;i<3;i++){result.low.push(await read());await page.waitForTimeout(350);}
 await page.locator('#scene').screenshot({path:dir+'live-low.png'});
 for(const [direction,button,landing,formButton] of [[1,'Вперёд →','work','03 Мастерская Открыть и приступить к работе'],[-1,'← Назад','module','01 Модуль Сложить конструкцию']]){
   await page.getByRole('button',{name:button,exact:true}).click();await page.waitForTimeout(900);
   const start=await read();await page.getByRole('button',{name:'Прыгнуть ↑',exact:true}).click();
   const samples=[],shots=[];let selected=false,previous='';
   for(let i=0;i<65;i++){
    await page.waitForTimeout(115);const s=await read();samples.push(brief(s));
    if(s.jump!==previous){const file=`live-jump-${direction}-${s.jump}-${i}.png`;await page.locator('#scene').screenshot({path:dir+file});shots.push({file,...brief(s)});previous=s.jump;}
    if(s.jump==='flight'&&!selected){await page.getByRole('button',{name:formButton,exact:true}).click();selected=true;}
    if(selected&&s.jump==='ground'&&Math.abs(s.u-(landing==='work'?2:0))<.005)break;
   }
   const end=await read();result.jumps.push({direction,landing,start:brief(start),samples,shots,selected,end:brief(end),events:end.events});
 }
 await page.keyboard.down('ArrowRight');await page.waitForTimeout(3900);result.keyHeld=brief(await read());
 await page.keyboard.up('ArrowRight');await page.waitForTimeout(1100);result.keyReleased=brief(await read());
 return result;
}
