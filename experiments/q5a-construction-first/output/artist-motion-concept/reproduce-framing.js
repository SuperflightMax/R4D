async page => {
 await page.reload();await page.waitForFunction(()=>window.q5a);
 await page.getByRole('button',{name:'Пауза',exact:true}).click();
 await page.getByRole('button',{name:'Прыжок ↑',exact:true}).click();
 const start=await page.evaluate(()=>({tick:window.q5a.motion.tick,t:window.q5a.motion.time}));
 await page.evaluate(()=>window.q5a.step(120));
 await page.getByText('Диагностика и просмотр',{exact:true}).click();
 const prefix=page.viewportSize().width<600?'repro-mobile':'repro-desktop';
 const pose=await page.evaluate(()=>JSON.stringify(window.q5a.getPose().landmarks));
 await page.locator('.canvas-wrap').screenshot({path:prefix+'-1x-light.png'});
 await page.getByLabel('Крупно 2×',{exact:true}).check();
 await page.locator('.canvas-wrap').screenshot({path:prefix+'-2x-light.png'});
 await page.screenshot({path:prefix+'-2x-full-page.png',fullPage:true});
 await page.getByLabel('Тёмный фон',{exact:true}).check();
 await page.locator('.canvas-wrap').screenshot({path:prefix+'-2x-dark.png'});
 await page.getByLabel('Кости и опора',{exact:true}).check();
 await page.getByLabel('Сетка и грани',{exact:true}).check();
 await page.locator('.canvas-wrap').screenshot({path:prefix+'-2x-diagnostic.png'});
 return {prefix,start,advancedSubsteps:120,equivalentUiFrames:60,samePose:pose===await page.evaluate(()=>JSON.stringify(window.q5a.getPose().landmarks)),state:await page.evaluate(()=>({phase:window.q5a.motion.phase,elapsed:window.q5a.motion.elapsed,t:window.q5a.motion.time,tick:window.q5a.motion.tick,pose:window.q5a.getPose().landmarks,stats:window.q5a.getStats(),ua:navigator.userAgent,dpr:devicePixelRatio,viewport:[innerWidth,innerHeight]}))};
}
