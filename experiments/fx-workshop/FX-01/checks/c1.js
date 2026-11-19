// FX01-C1-after-Q1-2af34679. Playwright CLI run-code function; no framework/install.
// An initial URL with &before=1 records the original defects without expecting fixes.
async (page) => {
  const before=new URL(page.url()).searchParams.has('before');
  const phase=before?'before':'after',checks=[],observed={phase};
  const ok=(value,name)=>{if(!value)throw Error(name);checks.push(name);};
  const base=`http://127.0.0.1:18731/?test=FX01-C1-${phase}-${Date.now()}`;
  const out='D:/dev/.codex-task-temp/r4d-fx01/builder/c1/output/';
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  // Local HTTP freshness can otherwise retain the pre-correction app across goto().
  await page.context().route('http://127.0.0.1:18731/**',route=>route.continue());
  const apply=async name=>{const card=page.getByRole('article',{name:`Примерить: ${name}`,exact:true});const replace=card.getByRole('button',{name:'Заменить шаг',exact:true});await (await replace.count()?replace:card.getByRole('button',{name:'Применить',exact:true})).click();await page.mouse.move(400,110);await page.waitForTimeout(80);};
  const edit=async(label,n)=>{const el=page.getByRole('spinbutton',{name:label,exact:true});await el.fill(String(n));await el.press('Tab');await page.waitForTimeout(650);};
  const feedback=()=>page.evaluate(()=>({hint:document.querySelector('#save-hint').textContent,top:document.querySelector('#storage-status').textContent,disabled:document.querySelector('#save-recipe').disabled,revisions:recipes[0]?.revisions.length,storedRevisions:JSON.parse(localStorage.getItem(storageKey))?.recipes[0]?.revisions.length}));
  await page.goto(base);await page.locator('body').ariaSnapshot();
  const ordinary=await page.evaluate(()=>localStorage.getItem('r4d-fx01:work'));
  await apply('Кометный след');await page.getByRole('button',{name:'Закрепить в коллекции',exact:true}).click();
  await page.getByRole('button',{name:'Закрыть коллекцию',exact:true}).click();
  observed.pinned=await feedback();
  await page.screenshot({path:out+phase+'-pinned.png'});
  await edit('Длина хвоста',35);observed.dirty=await feedback();
  await page.getByRole('button',{name:'Сохранить редакцию',exact:true}).click();
  observed.saved=await feedback();await page.screenshot({path:out+phase+'-saved.png'});
  await edit('Длина хвоста',36);observed.newEdit=await feedback();
  if(!before){
    ok(observed.pinned.hint.includes('Редакция сохранена')&&observed.pinned.disabled,'D01 pinned feedback matches persisted clean revision');
    ok(observed.dirty.hint.includes('Правки')&&!observed.dirty.disabled,'D01 dirty draft asks for an available save action');
    ok(observed.saved.hint.includes('Редакция сохранена')&&observed.saved.disabled&&observed.saved.storedRevisions===2,'D01 explicit save produces clean persisted revision');
    ok(observed.newEdit.hint.includes('Правки')&&!observed.newEdit.disabled&&observed.newEdit.storedRevisions===2,'D01 new edit restores dirty feedback without changing saved revision');
    await page.getByRole('button',{name:'Отменить',exact:true}).click();
    ok((await feedback()).hint.includes('Редакция сохранена'),'D01 undo back to saved state restores clean feedback');
    await page.getByRole('button',{name:'Вернуть',exact:true}).click();
  }
  await page.getByRole('button',{name:'Пауза',exact:true}).click();
  observed.single=[];observed.group=[];
  for(const name of ['Мягкая подсветка','Каскад']){
    await page.getByRole('combobox',{name:'Цель эффекта',exact:true}).selectOption('button2');await apply(name);
    const input=page.getByRole('spinbutton',{name:'Интервал кнопок',exact:true});
    const shown=await input.count();let ignored=null;
    if(shown){const art=await page.locator('#scene-art').innerHTML();await edit('Интервал кнопок',.5);ignored=art===await page.locator('#scene-art').innerHTML();}
    observed.single.push({name,shown:!!shown,ignored});
    if(!before)ok(!shown,`CTO-C01 ${name}: no ineffective interval on single button`);
    await page.getByRole('combobox',{name:'Цель эффекта',exact:true}).selectOption('buttons');await apply(name);
    const art=await page.locator('#scene-art').innerHTML();await edit('Интервал кнопок',.5);
    const changed=art!==await page.locator('#scene-art').innerHTML();observed.group.push({name,changed});
    ok(changed,`CTO-C01 ${name}: group interval changes rendered buttons`);
  }
  await page.getByRole('combobox',{name:'Цель эффекта',exact:true}).selectOption('ball');
  observed.layouts=[];
  for(const [width,height] of [[1536,864],[1920,1080]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(120);
    const metrics=await page.evaluate(()=>{
      const stage=document.querySelector('#stage'),r=stage.getBoundingClientRect(),m=stage.getScreenCTM();
      const texts=[...stage.querySelectorAll('.scene-label')].filter(el=>el.getBoundingClientRect().width>0).map(el=>({text:el.textContent,font:Number.parseFloat(getComputedStyle(el).fontSize)*Math.hypot(m.a,m.b),bounds:el.getBoundingClientRect().toJSON()}));
      const button=stage.querySelector('#scene-art g text');
      return {viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,visualScale:visualViewport.scale,stage:r.toJSON(),scale:m.a,labels:texts,buttonFont:Number.parseFloat(getComputedStyle(button).fontSize)*m.a,overflow:[document.documentElement.scrollWidth-innerWidth,document.documentElement.scrollHeight-innerHeight],footer:document.querySelector('.savebar').getBoundingClientRect().toJSON(),composition:document.querySelector('.composition').getBoundingClientRect().toJSON(),inspector:document.querySelector('.inspector').getBoundingClientRect().toJSON()};
    });
    observed.layouts.push(metrics);await page.screenshot({path:out+phase+'-layout-'+width+'.png'});
    if(!before){ok(metrics.labels.every(l=>l.font>=14)&&metrics.buttonFont>=14,`UX-01 readable screen font at ${width} CSS px`);ok(metrics.overflow.every(n=>n===0)&&metrics.footer.bottom<=height+1&&metrics.inspector.bottom<=height,`UX-01 stage/settings/actions fit ${width}x${height}`);}
  }
  if(!before){
    // The same saved card and previous revision still round-trip after corrections.
    await page.getByRole('button',{name:'Коллекция 1',exact:true}).click();
    await page.getByRole('button',{name:'Вернуть редакцию в черновик',exact:true}).click();
    ok(await page.getByRole('spinbutton',{name:'Длина хвоста',exact:true}).inputValue()==='28','D01 previous saved revision remains available');
    await page.getByRole('button',{name:'Сохранить редакцию',exact:true}).click();
    ok((await feedback()).storedRevisions===3&&(await feedback()).hint.includes('Редакция сохранена'),'D01 restored work saves as next revision of same card');
    const saved=await page.evaluate(()=>JSON.stringify({draft,recipes}));await page.reload();
    ok(await page.evaluate(()=>JSON.stringify({draft,recipes}))===saved,'D01 reload preserves draft and revisions');
    ok(await page.evaluate(()=>localStorage.getItem('r4d-fx01:work'))===ordinary,'C1 isolated data leaves ordinary work untouched');
    const denied=await page.context().newPage();denied.on('pageerror',e=>errors.push(e.message));
    await denied.addInitScript(()=>{const put=Storage.prototype.setItem;globalThis.__c1Deny=true;Storage.prototype.setItem=function(...args){if(globalThis.__c1Deny)throw new DOMException('C1 quota probe','QuotaExceededError');return put.apply(this,args);};});
    await denied.goto(base+'-denied');
    await denied.getByRole('article',{name:'Примерить: Кометный след',exact:true}).getByRole('button',{name:'Применить',exact:true}).click();
    await denied.waitForFunction(()=>document.querySelector('#storage-status').textContent.startsWith('Не сохранено:'));
    ok((await denied.locator('#save-hint').textContent()).includes('Не сохранено'),'D01 unpinned draft reports actual storage failure');
    await denied.getByRole('button',{name:'Закрепить в коллекции',exact:true}).click();
    await denied.getByRole('button',{name:'Закрыть коллекцию',exact:true}).click();
    ok((await denied.locator('#save-hint').textContent()).includes('Не сохранено')&&await denied.getByRole('button',{name:'Сохранить редакцию',exact:true}).isEnabled(),'D01 failed pin is not claimed saved and can retry');
    const length=denied.getByRole('spinbutton',{name:'Длина хвоста',exact:true});await length.fill('39');await length.press('Tab');
    await denied.getByRole('button',{name:'Сохранить редакцию',exact:true}).click();
    ok((await denied.locator('#save-hint').textContent()).includes('Не сохранено'),'D01 failed revision is not claimed saved');
    observed.failure=await denied.locator('#save-hint').textContent();await denied.screenshot({path:out+'after-storage-denied.png'});
    await denied.evaluate(()=>globalThis.__c1Deny=false);await denied.getByRole('button',{name:'Сохранить редакцию',exact:true}).click();
    ok(await denied.evaluate(()=>recipes.length===1&&recipes[0].revisions.length===2&&JSON.parse(localStorage.getItem(storageKey)).recipes[0].revisions.length===2),'D01 retry persists same card without a duplicate revision');
    ok((await denied.locator('#save-hint').textContent()).includes('Редакция сохранена')&&await denied.getByRole('button',{name:'Сохранить редакцию',exact:true}).isDisabled(),'D01 successful retry returns clean feedback');
    await denied.close();ok(errors.length===0,'C1 no uncaught page errors');
  }
  return {key:'FX01-C1-after-Q1-2af34679',checks,observed,url:base,physicalM11:'NOT_VERIFIED'};
}
