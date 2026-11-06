async (page) => {
 const dir='D:/dev/R4D/experiments/q3b-transforming-crab/qa/technical/output/playwright/c1/';
 const formNames={module:'01 Модуль Сложить конструкцию',crab:'02 Краб Развернуть опоры',work:'03 Мастерская Открыть и приступить к работе'};
 const clickForm=f=>page.getByRole('button',{name:formNames[f],exact:true}).click();
 const click=name=>page.getByRole('button',{name,exact:true}).click();
 const read=()=>page.evaluate(()=>window.__Q3B.snapshot());
 const shot=name=>page.locator('#scene').screenshot({path:dir+name+'.png'});
 const reset=()=>click('Сначала');
 await page.evaluate(()=>{
  window.__Q3B.setPaused(true);
  window.__TQA={
   brief:s=>({t:s.time,u:s.u,uv:s.uv,form:s.form,action:s.action,x:s.x,speed:s.speed,jump:s.jump,jumpTime:s.jumpTime,height:s.height,low:s.low,pending:s.pendingJump,jumps:s.jumpCount,lands:s.landCount,gaps:s.soleGaps,bounds:s.view.characterBounds,scale:s.view.scale}),
   delta:(a,b)=>{let position=0,angle=0,part='';for(const id of Object.keys(a.world)){const p=a.world[id],q=b.world[id],d=Math.hypot(p.x-q.x,p.y-q.y);if(d>position){position=d;part=id;}angle=Math.max(angle,Math.abs(q.angle-p.angle));}return {position,angle,part,u:b.u-a.u,uv:b.uv-a.uv,speed:b.speed-a.speed};},
   run:(seconds,stop)=>{
    const api=window.__Q3B,tqa=window.__TQA;
    let prev=api.snapshot(),maxStep={position:0},maxAngle=0,minGap=Infinity,minTop=Infinity,maxRight=-Infinity,minLeft=Infinity,minGroundSupports=3,hasGround=false,maxLengthError=0,maxReach=0;
    const samples=[],states=[];let old='';
    for(let i=0;i<Math.ceil(seconds*120);i++){
     api.step(1/120);const s=api.snapshot(),d=tqa.delta(prev,s);
     if(d.position>maxStep.position)maxStep={...d,t:s.time,jump:s.jump,u:s.u,before:tqa.brief(prev),after:tqa.brief(s),beforeWorld:prev.world,afterWorld:s.world};
     maxAngle=Math.max(maxAngle,d.angle);minTop=Math.min(minTop,s.view.characterBounds.y);minLeft=Math.min(minLeft,s.view.characterBounds.x);maxRight=Math.max(maxRight,s.view.characterBounds.x+s.view.characterBounds.width);
     const gaps=Object.values(s.soleGaps).map(x=>x*s.view.scale);minGap=Math.min(minGap,...gaps);
     if(s.pose.deploy>.999&&s.jump==='ground'){hasGround=true;minGroundSupports=Math.min(minGroundSupports,gaps.filter(x=>Math.abs(x)<.75).length);}
     for(const side of ['Left','Right','Rear']){
      const upper=s.world['upper'+side],lower=s.world['lower'+side],foot=s.world['foot'+side];
      maxLengthError=Math.max(maxLengthError,Math.abs(Math.hypot(upper.x-lower.x,upper.y-lower.y)-90),Math.abs(Math.hypot(lower.x-foot.x,lower.y-foot.y)-105));
      if(s.pose.deploy>.999)maxReach=Math.max(maxReach,s.solutions[side].requested);
     }
     const state=s.jump+'>'+s.form;
     if(state!==old){states.push(tqa.brief(s));old=state;}
     if(i%30===0)samples.push(tqa.brief(s));prev=s;
     if(stop&&((stop.kind==='u'&&((stop.sign>0&&s.u>=stop.value)||(stop.sign<0&&s.u<=stop.value)))||(stop.kind==='jump'&&s.jump===stop.value)))break;
    }
    return {maxStep,maxAngle,minGap,minTop,minLeft,maxRight,minGroundSupports:hasGround?minGroundSupports:null,maxLengthError,maxReach,samples,states,end:tqa.brief(api.snapshot())};
   }
  };
 });
 const run=(seconds,stop)=>page.evaluate(([s,p])=>window.__TQA.run(s,p),[seconds,stop]);
 const delta=(a,b)=>{let position=0,angle=0;for(const id of Object.keys(a.world)){position=Math.max(position,Math.hypot(a.world[id].x-b.world[id].x,a.world[id].y-b.world[id].y));angle=Math.max(angle,Math.abs(a.world[id].angle-b.world[id].angle));}return {position,angle,u:b.u-a.u,uv:b.uv-a.uv,speed:b.speed-a.speed};};
 const result={method:'UI buttons; existing product pause and step 1/120; diagnostic transforms plus rendered checkpoints',routes:[],retarget:[],idle:[],jumpOrigins:[],movingJumps:[]};
 await reset();
 for(const form of ['crab','work','crab','module','work','module']){
  await clickForm(form);const r=await run(6.5);await shot('mech-form-'+result.routes.length+'-'+form);result.routes.push({target:form,...r});
 }
 for(const [source,target,threshold,reverse,next] of [['module','crab',.26,'module',null],['module','crab',.70,'module','work'],['crab','work',1.60,'crab',null],['work','crab',1.84,'work','module']]){
  await reset();if(source!=='module'){await clickForm(source);await run(7);}
  await clickForm(target);await run(6,{kind:'u',sign:target==='crab'&&source==='work'?-1:1,value:threshold});
  const before=await read();await shot('retarget-'+result.retarget.length+'-before');await clickForm(reverse);const after=await read();
  const continuation=await run(next?.3:5.5);
  let third=null;if(next){const pre=await read();await clickForm(next);const post=await read();third={target:next,instant:delta(pre,post),continuation:await run(7)};}
  await shot('retarget-'+result.retarget.length+'-after');result.retarget.push({source,target,threshold,reverse,before,after,instant:delta(before,after),continuation,third});
 }
 for(const form of ['module','crab','work']){
  await reset();await clickForm(form);await run(7);const before=await read();await run(.75);const after=await read();result.idle.push({form,before,after});
 }
 await reset();await clickForm('crab');await run(5);result.idleCrab=await read();await click('Ниже');await run(1.1);result.low=await read();await shot('mech-low');await run(.8);result.lowAfter=await read();
 // Commands from an unfinished transformation, with pending-jump cancellation.
 await reset();await clickForm('work');await run(.65);await click('Прыгнуть ↑');result.pendingBeforeStop=await read();await click('Стоп');result.pendingAfterStop=await read();result.cancelledJump=await run(6);
 await reset();await clickForm('work');await run(.8);await click('← Назад');result.moveDuringForm=await run(6);await click('Вперёд →');result.turnaround=await run(1.5);await click('Стоп');result.stop=await run(1.6);
 for(const [origin,target] of [['module','work'],['crab','module'],['work','crab']]){
  await reset();await clickForm(origin);await run(7);await click('Прыгнуть ↑');const flight=await run(8,{kind:'jump',value:'flight'});const before=await read();await clickForm(target);const after=await read();await shot('jump-origin-'+origin+'-flight-start');const rest=await run(8);result.jumpOrigins.push({origin,target,flight,instant:delta(before,after),rest});
 }
 for(const [direction,moveButton,target] of [[1,'Вперёд →','work'],[-1,'← Назад','module']]){
  await reset();await clickForm('crab');await run(5);await click(moveButton);await run(1.3);const start=await read();await click('Прыгнуть ↑');
  const flight=await run(3,{kind:'jump',value:'flight'});const before=await read();await clickForm(target);const after=await read();await run(.4);const apex=await read();await shot('moving-jump-'+direction+'-apex');const rest=await run(8);await shot('moving-jump-'+direction+'-land');
  result.movingJumps.push({direction,target,start,flight,instant:delta(before,after),apex,rest});
 }
 // Landing with no form request preserves the moving action; test both directions.
 for(const [direction,button] of [[1,'Вперёд →'],[-1,'← Назад']]){
  await reset();await clickForm('crab');await run(5);await click(button);await run(1.3);await click('Прыгнуть ↑');const r=await run(3);result.movingJumps.push({direction,target:'continue-move',rest:r});
 }
 await reset();await clickForm('crab');await run(5);await click('Вперёд →');const walk=await run(6);result.walk=walk;await shot('mech-walk');
 await click('Шарниры');await shot('joints');await click('Шарниры');await page.locator('#background').selectOption('light');await shot('daylight');await page.locator('#background').selectOption('dark');
 return result;
}
