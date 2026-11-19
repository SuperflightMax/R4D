// Small real-HTTPS delivery check, not a repeat of M01-M11 or a human evaluation.
async (page) => {
  const checks=[],errors=[],failed=[],responses=[];
  const ok=(value,name)=>{if(!value)throw Error(name);checks.push(name);};
  const base='https://superflight.space/review/r4d/fx-workshop/fx-01/';
  const expected={
    'index.html':[5387,'b4d67713c59184e4f813f4ba89c8d3b074f60149e7be90c9a29595e83561bab5'],
    'style.css':[7215,'c7409f0d06fca2b22b8f0f6cde013529c8d20a9fe84c61b205d5212bc6bc3a3b'],
    'app.js':[27932,'b34abd8bfc6e6f010397da9b2372def74f005271ce1e92a8e35b5ce9b2405f6f']
  };
  page.on('pageerror',e=>errors.push(e.message));
  page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  page.on('requestfailed',r=>failed.push({url:r.url(),failure:r.failure()?.errorText}));
  page.on('response',r=>{if(r.url().startsWith(base))responses.push(r);});
  await page.context().route('https://superflight.space/review/**',route=>route.continue());
  await page.goto('https://superflight.space/review/');await page.locator('body').ariaSnapshot();
  await page.getByRole('link',{name:/FX Workshop/}).click();await page.locator('body').ariaSnapshot();
  ok(new URL(page.url()).pathname==='/review/r4d/'&&new URL(page.url()).hash==='#fx-workshop','Live global FX card reaches R4D section');
  ok(await page.getByText('UX-прототип для просмотра',{exact:true}).isVisible(),'Live R4D card identifies UX candidate');
  const href=await page.getByRole('link',{name:'Открыть мастерскую',exact:true}).getAttribute('href');
  const url=new URL(href,page.url());url.searchParams.set('test','FX01-D1-CUT-43b6268e-'+Date.now());
  await page.goto(url.href);await page.locator('body').ariaSnapshot();
  const loaded=[];
  for(const r of responses){
    const path=new URL(r.url()).pathname;
    const name=path.endsWith('/')?'index.html':path.split('/').at(-1);
    if(!expected[name])continue;
    const body=await r.body();
    const digest=await page.evaluate(async bytes=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new Uint8Array(bytes)))).map(n=>n.toString(16).padStart(2,'0')).join(''),Array.from(body));
    ok(r.status()===200&&body.length===expected[name][0]&&digest===expected[name][1],'Browser loaded exact '+name);
    loaded.push({name,url:r.url(),status:r.status(),size:body.length,sha256:digest,mime:r.headers()['content-type']});
  }
  ok(new Set(loaded.map(r=>r.name)).size===3,'Browser received all three runtime responses');
  const ordinary=await page.evaluate(()=>localStorage.getItem('r4d-fx01:work'));
  const card=page.getByRole('article',{name:'Примерить: Кометный след',exact:true});
  await card.hover();ok(await page.locator('#preview-status').isVisible(),'Live preview visible');
  await card.getByRole('button',{name:'Применить',exact:true}).click();await page.mouse.move(400,110);
  const length=page.getByRole('spinbutton',{name:'Длина хвоста',exact:true});await length.fill('36');await length.press('Tab');
  await page.waitForTimeout(650);ok(await length.inputValue()==='36','Live apply and parameter edit work');
  const context=await page.evaluate(()=>{const c=JSON.parse(JSON.stringify(draft));delete c.entry;return JSON.stringify(c);});
  await page.getByRole('button',{name:'От объекта',exact:true}).click();await page.locator('body').ariaSnapshot();
  ok(await page.evaluate(()=>{const c=JSON.parse(JSON.stringify(draft));delete c.entry;return JSON.stringify(c);})===context,'Live A to B retains draft');
  await page.getByRole('button',{name:'От эффекта',exact:true}).click();
  ok(await length.inputValue()==='36','Live B to A retains parameter');
  await page.getByRole('button',{name:'Закрепить в коллекции',exact:true}).click();
  await page.getByRole('button',{name:'Закрыть коллекцию',exact:true}).click();
  ok((await page.locator('#save-hint').textContent()).includes('Редакция сохранена')&&await page.evaluate(()=>recipes.length===1),'Live pin saved and feedback clean');
  const saved=await page.evaluate(()=>JSON.stringify({draft,recipes}));await page.reload();
  ok(await page.evaluate(()=>JSON.stringify({draft,recipes}))===saved&&await length.inputValue()==='36','Live reload restores draft and pinned recipe');
  ok(await page.evaluate(()=>localStorage.getItem('r4d-fx01:work'))===ordinary,'Delivery smoke did not touch ordinary namespace');
  ok(errors.length===0&&failed.length===0,'No page/console errors or failed requests');
  await page.screenshot({path:'D:/dev/.codex-task-temp/r4d-fx01/builder/cut/output/delivery-smoke.png'});
  return {key:'FX01-D1-CUT-43b6268e-20261119T031029Z',status:'BROWSER_DELIVERY_SMOKE_PASS',source:'43b6268e924698048a4d79df1aad2512c86f08f7',url:base,testUrl:page.url(),checks,loaded,errors,failed,conditions:await page.evaluate(()=>({css:[innerWidth,innerHeight],dpr:devicePixelRatio,userAgent:navigator.userAgent})),physicalM11:'NOT_VERIFIED',humanGate:'PENDING'};
}
