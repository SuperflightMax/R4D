async page => {
  await page.waitForFunction(()=>window.q5a);
  const rows=[];let number=0;
  const environment=await page.evaluate(()=>({ua:navigator.userAgent,viewport:[innerWidth,innerHeight],dpr:devicePixelRatio,touch:navigator.maxTouchPoints,canvas:[document.getElementById('character').width,document.getElementById('character').height]}));
  async function shot(label){const state=await page.evaluate(()=>({t:window.q5a.motion.time,phase:window.q5a.motion.phase,elapsed:window.q5a.motion.elapsed,target:window.q5a.motion.ground,stats:window.q5a.getStats()}));const file='m-'+String(number++).padStart(3,'0')+'.png';await page.locator('.canvas-wrap').screenshot({path:file});rows.push({label,file,...state});}
  async function observe(label,ms){const end=Date.now()+ms;while(Date.now()<end){await shot(label);await page.waitForTimeout(100);}}
  async function tap(name){await page.getByRole('button',{name,exact:true}).tap();}
  await page.screenshot({path:'mobile-initial-full.png',fullPage:true});
  await observe('mobile idle 1x light',400);
  await tap('Присед');await observe('mobile low',800);
  await tap('Ходьба');await observe('mobile walk from low',1500);
  await page.getByRole('combobox',{name:'Остановка в',exact:true}).selectOption('low');
  await tap('Стоп');await observe('mobile stop low',1000);
  await tap('Прыжок ↑');await observe('mobile low jump',650);
  await tap('Ходьба');await observe('mobile flight to walk',1700);
  await tap('Прыжок ↑');await observe('mobile walk jump',650);
  await tap('Присед');await observe('mobile flight to low',1700);
  await tap('Пауза');
  await page.getByText('Диагностика и просмотр',{exact:true}).tap();
  await page.getByLabel('Тёмный фон',{exact:true}).check();
  await page.getByLabel('Крупно 2×',{exact:true}).check();await shot('mobile low 2x dark clean');
  await page.getByLabel('Кости и опора',{exact:true}).check();await page.getByLabel('Сетка и грани',{exact:true}).check();await shot('mobile same paused pose diagnostic');
  await page.screenshot({path:'mobile-diagnostic-full.png',fullPage:true});
  await page.getByLabel('Кости и опора',{exact:true}).uncheck();await page.getByLabel('Сетка и грани',{exact:true}).uncheck();
  await tap('Стойка');await tap('Продолжить');await observe('mobile rise 2x dark',800);
  await tap('Присед');await observe('mobile early low 2x dark',100);
  await tap('Ходьба');await observe('mobile interrupt low walk 2x dark',1200);
  await tap('Стойка');await observe('mobile stop idle 2x dark',600);
  await tap('Прыжок ↑');await observe('mobile idle jump 2x dark',1900);
  await tap('Пауза');await shot('mobile end');
  return {scenario:'mobile touch realtime light1x/dark2x',environment,rows};
}
