async (page) => {
 const errors=[],badResponses=[],external=[];page.on('pageerror',e=>errors.push(e.message));
 page.on('response',r=>{if(r.status()>=400)badResponses.push({url:r.url(),status:r.status()});});
 page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:4197/'))external.push(r.url());});
 const check=(value,message)=>{if(!value)throw new Error(message);};
 await page.reload();await page.waitForFunction(()=>!document.querySelector('#play').disabled);
 const editorial={header:await page.locator('.header-tools .tag').textContent(),footer:await page.locator('footer').textContent(),detailsVersion:await page.locator('#candidate-version').textContent(),conclusion:await page.locator('#conclusion').textContent()};
 check(editorial.header==='Просмотр свидетельств · v02','Wrong v02 header');
 check(editorial.footer.includes('Просмотр свидетельств · v02'),'Wrong v02 footer');
 check(editorial.detailsVersion.includes('negative-review-v02'),'Wrong displayed snapshot version');
 check(!editorial.conclusion.includes('приёмка и отдельная публикация ещё не выполнены'),'Time-dependent pending copy remains');
 const initial=await page.evaluate(()=>window.__negativeReviewState);
 check(initial.acceptedIndex===0&&!initial.playing&&initial.acceptedCount===26,'Initial state must be paused low0/26');
 const sources=[];
 for(let i=0;i<5;i++){
  await page.locator('#source-select').selectOption(String(i));
  await page.waitForFunction(()=>['whole','shoulder','hip-context'].every(id=>{const e=document.getElementById(id);return e.complete&&e.naturalWidth>0;}));
  sources.push(await page.locator('#whole-title').textContent());
 }
 await page.locator('#source-select').selectOption('4');
 await page.locator('#frame').focus();await page.keyboard.press('End');
 check((await page.evaluate(()=>window.__negativeReviewState.acceptedIndex))===25,'Native End must select exact output25');
 const maxDrop=await page.locator('#drop-label').textContent();check(maxDrop.includes('23,9583')&&maxDrop.includes('/230'),'Maximum drop label must remain partial');
 await page.keyboard.press('ArrowLeft');await page.locator('#speed').selectOption('250');await page.locator('#play').click();
 await page.waitForFunction(()=>window.__negativeReviewState.acceptedIndex===25&&!window.__negativeReviewState.playing);
 check((await page.evaluate(()=>window.__negativeReviewState.acceptedIndex))===25,'End of playback must not add output26 or loop');
 await page.locator('#restart').click();await page.locator('#play').click();
 await page.waitForFunction(()=>window.__negativeReviewState.acceptedIndex>=2);
 await page.locator('#play').click();const paused=await page.evaluate(()=>window.__negativeReviewState.acceptedIndex);
 await page.waitForTimeout(600);check((await page.evaluate(()=>window.__negativeReviewState.acceptedIndex))===paused,'Pause must freeze output index');
 await page.locator('#frame').focus();await page.keyboard.press('End');
 await page.locator('#mesh').uncheck();await page.locator('#mesh').check();await page.locator('#texture').uncheck();await page.locator('#texture').check();
 await page.locator('#rejected > summary').click();await page.waitForFunction(()=>document.querySelector('#rejected-stage canvas')?.width>0);
 check((await page.evaluate(()=>window.__negativeReviewState.acceptedIndex))===25,'Opening rejected must preserve accepted index');
 check((await page.locator('#rejected').textContent()).includes('0.29999830114264353'),'Rejected sigma must not be rounded into PASS');
 await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:'output/playwright/v02-desktop-light-current.png',fullPage:true});
 await page.locator('#theme').selectOption('dark');await page.locator('#r2').screenshot({path:'output/playwright/v02-r2-dark.png'});
 const viewports=[];
 for(const width of[390,360,768]){
  await page.setViewportSize({width,height:844});
  await page.waitForFunction(()=>{const c=document.querySelector('#accepted-stage canvas'),h=document.querySelector('#accepted-stage');return Math.abs(c.getBoundingClientRect().width-h.clientWidth)<2;});
  const geometry=await page.evaluate(()=>({viewport:innerWidth,pageWidth:document.documentElement.scrollWidth,canvasWidth:document.querySelector('#accepted-stage canvas').getBoundingClientRect().width,controlWidth:document.querySelector('.controls').getBoundingClientRect().width}));
  check(geometry.pageWidth<=width+1,`Horizontal overflow at${width}`);viewports.push(geometry);
  if(width===390){await page.screenshot({path:'output/playwright/v02-mobile-dark.png',fullPage:true});await page.locator('#r2').screenshot({path:'output/playwright/v02-r2-mobile-dark.png'});await page.locator('#theme').selectOption('light');await page.screenshot({path:'output/playwright/v02-mobile-light.png',fullPage:true});}
 }
 await page.setViewportSize({width:1440,height:1000});await page.locator('#theme').selectOption('light');
 await page.locator('#rejected > summary').click();await page.locator('#restart').click();await page.locator('#speed').selectOption('500');await page.evaluate(()=>scrollTo(0,0));
 check(errors.length===0,'Page errors: '+errors.join(';'));check(badResponses.length===0,'Bad responses');check(external.length===0,'External network requests');
 return {editorial,initial,sources,maxDrop,pauseVerified:true,playStopsAt25:true,rejectedSeparate:true,overlayAndTextureControls:true,viewports,errors,badResponses,externalRequests:external,finalState:await page.evaluate(()=>window.__negativeReviewState)};
}
