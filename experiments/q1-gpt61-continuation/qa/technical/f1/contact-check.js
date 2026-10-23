async (page) => {
  const assert=(ok,m)=>{if(!ok)throw new Error(m);};
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.reload();await page.waitForFunction(()=>!!window.__R4D);
  await page.keyboard.press('p');await page.keyboard.press('r');
  const raw=await page.evaluate(async()=>{
    const parts=window.__R4D.manifest.parts;
    const output={};
    for(const side of ['Near','Far']){
      const part=parts.find(p=>p.id==='foot'+side),im=new Image();im.src=part.file;await im.decode();
      const c=document.createElement('canvas');c.width=im.width;c.height=im.height;
      const ctx=c.getContext('2d');ctx.drawImage(im,0,0);const pixels=ctx.getImageData(0,0,im.width,im.height).data;
      const points=[];
      // Independent full alpha-mask scan, not the production soleGap/column outline.
      for(let y=0;y<im.height;y++)for(let x=0;x<im.width;x++)if(pixels[(y*im.width+x)*4+3]>=128)
        points.push([x+.5-part.pivot[0],y+1-part.pivot[1]]);
      output[side]=points;
    }return output;
  });
  const read=()=>page.evaluate(()=>window.__R4D.snapshot());
  const step=dt=>page.evaluate(dt=>window.__R4D.step(dt),dt);
  const ground={idle:'1',low:'2',move:'3'};
  const bounds=s=>Object.fromEntries(['Near','Far'].map(side=>{
    const w=s.world['foot'+side],c=Math.cos(w.angle),sn=Math.sin(w.angle);
    let bottom=-Infinity;
    for(const [x,y] of raw[side])bottom=Math.max(bottom,s.pose.rootY+w.y+x*sn+y*c);
    return [side,{bottom,x:s.pose.bodyX+w.x,y:s.pose.rootY+w.y}];
  }));
  const initial=bounds(await read());
  assert(Math.abs(initial.Near.bottom-initial.Far.bottom)<1e-6,'standing sole planes differ');
  const floor=(initial.Near.bottom+initial.Far.bottom)/2;
  const measure=s=>{const b=bounds(s);return {...s,independentGap:{Near:floor-b.Near.bottom,Far:floor-b.Far.bottom},boot:b};};
  const rows=[];
  for(const source of ['idle','low','move','midLow'])for(const target of ['idle','low','move']){
    await page.keyboard.press('r');
    await page.keyboard.press(source==='midLow'?'2':ground[source]);await step(source==='midLow'?.06:.583);
    const preJump=await read();await page.keyboard.press('Space');
    const input=await read();assert(Object.keys(input.pose).every(k=>input.pose[k]===preJump.pose[k]),'jump input reset pose');
    let prev=measure(await read()),before=null,at=null,after=null;
    let maxGapInLand=0,maxRigDrift=0,maxContactRootStep=0,maxContactAngleStep=0;
    let firstBoot=null,post=0;
    const evidence=source==='idle'&&target==='move';let beforeSaved=false;
    for(let i=0;i<270;i++){
      await step(1/120);const s=measure(await read());
      if(s.state==='flight'&&s.stateTime>.22 && s.ground!==target)await page.keyboard.press(ground[target]);
      if(evidence&&!beforeSaved&&s.state==='flight'&&s.height===0&&Math.min(...Object.values(s.independentGap))<2.5){
        await page.locator('#scene').screenshot({path:'experiments/q1-gpt61-continuation/qa/technical/f1/before-contact.png'});beforeSaved=true;
      }
      if(s.landCount>prev.landCount){
        before=prev;at=s;firstBoot=s.boot;
        assert(prev.landCount===0&&s.landCount===1,'bad contact count');
        assert(Math.min(...Object.values(prev.independentGap))>0,'contact was already present before count');
        assert(Math.min(...Object.values(s.independentGap))>=-.06&&Math.min(...Object.values(s.independentGap))<=.06,'count without rendered sole contact');
        if(evidence)await page.locator('#scene').screenshot({path:'experiments/q1-gpt61-continuation/qa/technical/f1/at-contact.png'});
      }
      if(at&&s.state==='land'){
        maxGapInLand=Math.max(maxGapInLand,...Object.values(s.independentGap).map(Math.abs));
        maxRigDrift=Math.max(maxRigDrift,...['Near','Far'].map(side=>Math.abs(s.boot[side].x-firstBoot[side].x)));
        if(post<=12){
          maxContactRootStep=Math.max(maxContactRootStep,Math.abs(s.pose.rootY-prev.pose.rootY));
          maxContactAngleStep=Math.max(maxContactAngleStep,...Object.keys(s.pose).filter(k=>/^(thigh|shin|footNear|footFar|torso|pelvis)/.test(k)).map(k=>Math.abs(s.pose[k]-prev.pose[k])));
        }
        post++;
        if(post===13){after=s;if(evidence)await page.locator('#scene').screenshot({path:'experiments/q1-gpt61-continuation/qa/technical/f1/after-contact.png'});}
      }
      prev=s;if(at&&s.state!=='land'&&s.stateTime>.4)break;
    }
    const end=await read();assert(at&&after,'missing contact samples');
    assert(end.state===target&&end.jumpCount===1&&end.landCount===1,'bad final ground '+source+'/'+target);
    assert(maxGapInLand<.06,'sole lift/sink after contact '+source+'/'+target+' '+maxGapInLand);
    assert(maxRigDrift<.1,'new horizontal drift within land');
    rows.push({source,target,preJumpDepth:preJump.pose.rootY,contactTime:at.time,
      beforeGap:before.independentGap,atGap:at.independentGap,after100msGap:after.independentGap,
      maxGapInLand,maxRigDrift,maxContactRootStep,maxContactAngleStep,final:end.state,
      firstContactRootStep:at.pose.rootY-before.pose.rootY,
      diagnosticAtGap:at.soleGap});
  }
  const mobile=await page.context().browser().newContext({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
  const mp=await mobile.newPage();await mp.goto('http://127.0.0.1:4181/');await mp.waitForFunction(()=>!!window.__R4D);
  await mp.getByRole('button',{name:'Пауза · P',exact:true}).tap();
  await mp.getByRole('button',{name:'Низкая поза · 2',exact:true}).tap();await mp.evaluate(()=>window.__R4D.step(.7));
  await mp.getByRole('button',{name:'Прыжок · пробел',exact:true}).tap();await mp.evaluate(()=>window.__R4D.step(.5));
  await mp.getByRole('button',{name:'Идти · 3',exact:true}).tap();await mp.evaluate(()=>window.__R4D.step(1.3));
  const ms=await mp.evaluate(()=>window.__R4D.snapshot());assert(ms.state==='move'&&ms.landCount===1,'mobile regression');
  await mobile.close();assert(!errors.length,'page errors '+errors);
  return {result:'PASS',floor,pixels:{Near:raw.Near.length,Far:raw.Far.length},rows,mobile:{state:ms.state,landCount:ms.landCount},errors};
}
