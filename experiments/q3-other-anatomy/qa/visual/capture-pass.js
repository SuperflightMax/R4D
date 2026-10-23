async (page) => {
  const out='D:/dev/R4D/experiments/q3-other-anatomy/qa/visual/output/playwright';
  const controls={idle:'Покой · 1',low:'Низкая поза · 2',move:'Двигаться · 3',jump:'Прыжок · пробел'};
  const records=[];
  const box=await page.locator('#scene').boundingBox();
  const clip={x:box.x+box.width/2-310,y:box.y,width:620,height:box.height};
  const sequences=[
    {name:'route1',commands:[[0,'idle'],[.6,'low'],[1.6,'move'],[3.6,'idle'],[4.6,'jump']],frames:[.1,.72,1,1.4,1.85,2.2,2.5,2.8,3.2,3.8,4.15,4.72,4.9,5.08,5.27,5.45,5.65,5.95,6.3]},
    {name:'route2',commands:[[0,'move'],[1.5,'low'],[2.5,'jump'],[2.95,'move'],[4.5,'jump'],[4.95,'low']],frames:[.15,.45,.8,1.15,1.65,2,2.35,2.62,2.83,3.08,3.3,3.6,3.95,4.3,4.62,4.82,5.08,5.3,5.6,6.1]},
    {name:'midMove',commands:[[0,'low'],[.14,'move'],[1.15,'low'],[1.3,'idle']],frames:[.05,.11,.22,.4,.65,.95,1.23,1.45,1.8]},
    {name:'midJump',commands:[[0,'low'],[.14,'jump'],[.5,'move'],[.9,'low']],frames:[.05,.11,.23,.37,.55,.72,.95,1.2,1.55,1.9]}
  ];
  for (const seq of sequences) {
    await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
    const timeline=[...seq.commands.map(([t,command])=>({t,command})),...seq.frames.map((t,i)=>({t,i}))].sort((a,b)=>a.t-b.t);
    const start=Date.now();
    for(const item of timeline){
      const remaining=start+item.t*1000-Date.now();if(remaining>0)await page.waitForTimeout(remaining);
      if(item.command){await page.getByRole('button',{name:controls[item.command],exact:true}).click();continue;}
      const snapshot=await page.evaluate(()=>window.__R4D.snapshot());
      const name=seq.name+'-'+String(item.i).padStart(2,'0')+'.png';
      await page.screenshot({path:out+'/'+name,clip,scale:'css'});
      records.push({sequence:seq.name,file:name,requestedTime:item.t,wallTime:(Date.now()-start)/1000,snapshot});
    }
  }
  return records;
}
