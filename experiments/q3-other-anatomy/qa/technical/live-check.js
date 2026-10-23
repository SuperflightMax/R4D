async (page) => {
  const dir='D:/dev/R4D/experiments/q3-other-anatomy/qa/technical/output/playwright/';
  const read=()=>page.evaluate(()=>window.__R4D.snapshot());
  const brief=s=>({time:s.time,state:s.state,ground:s.ground,height:s.height,phase:s.phase,bodyY:s.pose.bodyY,scale:s.view.scale,gaps:s.view.renderedSoleGap,jumps:s.jumpCount,lands:s.landCount});
  const result={method:'Real-time browser, real controls, real raster; diagnostic snapshot supplements rendered frames',routes:[],manual:[]};
  await page.waitForFunction(()=>window.__R4D);
  await page.getByText('Маршруты и замедление',{exact:true}).click();
  for(const route of [1,2]){
    await page.getByRole('button',{name:`Маршрут ${route}`,exact:true}).click();
    const samples=[],shots=[];let last='',lastShot='';
    for(let i=0;i<58;i++){
      await page.waitForTimeout(125);
      const s=await read(),key=s.state+'>'+s.ground;
      if(key!==last){samples.push(brief(s));last=key;}
      if(key!==lastShot&&shots.length<9){
        const file=`live-route-${route}-${i}-${s.state}.png`;
        await page.locator('#scene').screenshot({path:dir+file});
        shots.push({file,...brief(s)});lastShot=key;
      }
    }
    const s=await read();result.routes.push({route,samples,shots,end:brief(s),events:s.events,inputs:s.inputs});
  }
  await page.getByRole('button',{name:'Сначала · R',exact:true}).click();
  await page.getByRole('button',{name:'Низкая поза · 2',exact:true}).click();
  await page.waitForTimeout(600);
  result.manual.push({action:'low button',...brief(await read())});
  await page.getByRole('button',{name:'Двигаться · 3',exact:true}).click();
  await page.waitForTimeout(450);
  result.manual.push({action:'move button from low',...brief(await read())});
  await page.keyboard.press('1');await page.waitForTimeout(400);
  result.manual.push({action:'keyboard 1',...brief(await read())});
  await page.keyboard.down('ArrowLeft');await page.waitForTimeout(450);
  result.manual.push({action:'held ArrowLeft',...brief(await read())});
  await page.keyboard.up('ArrowLeft');await page.waitForTimeout(350);
  result.manual.push({action:'release ArrowLeft',...brief(await read())});
  await page.keyboard.press('Space');await page.waitForTimeout(420);
  await page.getByRole('button',{name:'Низкая поза · 2',exact:true}).click();
  result.manual.push({action:'Space from idle, low button in flight',...brief(await read())});
  await page.waitForTimeout(1250);
  result.manual.push({action:'after landing',...brief(await read())});
  return result;
}
