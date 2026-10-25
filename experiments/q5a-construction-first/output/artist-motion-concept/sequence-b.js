async (page) => {
  await page.reload();
  await page.waitForFunction(() => window.q5a && document.querySelector('#ready').textContent === 'Можно управлять');
  const rows = [], start = Date.now();
  async function observe(label, ms) {
    const end = Date.now() + ms;
    while (Date.now() < end) {
      const row = await page.evaluate(() => {
        const q = window.q5a, m = q.motion, p = q.getPose();
        return {t:m.time,tick:m.tick,phase:m.phase,target:m.ground,root:m.root,feet:m.feet,pelvis:p.landmarks.pelvis,stats:q.getStats()};
      });
      const file = 'b-' + String(rows.length).padStart(3,'0') + '.png';
      await page.locator('.canvas-wrap').screenshot({path:file});
      rows.push({label,file,wallMs:Date.now()-start,...row});
      await page.waitForTimeout(90);
    }
  }
  await page.getByRole('button',{name:'Ходьба',exact:true}).click();
  await observe('walk',1800);
  await page.getByRole('button',{name:'Присед',exact:true}).click();
  await observe('walk-to-low',1200);
  await page.getByRole('button',{name:'Прыжок ↑',exact:true}).click();
  await observe('low-jump-prepare',350);
  await page.getByRole('button',{name:'Ходьба',exact:true}).click();
  await observe('flight-target-walk',2100);
  await page.getByRole('button',{name:'Прыжок ↑',exact:true}).click();
  await observe('walk-jump-prepare',400);
  await page.getByRole('button',{name:'Присед',exact:true}).click();
  await observe('flight-target-low',2400);
  await page.getByRole('button',{name:'Пауза',exact:true}).click();
  console.log(JSON.stringify({scenario:'B realtime walk-low-jump-walk-jump-low',rows}));
}
