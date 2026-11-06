async(page)=>{
 const out='D:/dev/R4D/experiments/q3b-transforming-crab/qa/visual/output/playwright/c1',rows=[];
 const snap=async name=>{const s=await page.evaluate(()=>window.__Q3B.snapshot());await page.locator('#scene').screenshot({path:out+'/'+name+'.png',scale:'css'});rows.push({file:name+'.png',snapshot:s});};
 await page.getByRole('button',{name:'Сначала',exact:true}).click();await page.getByRole('button',{name:'▶ Показать всё',exact:true}).click();
 const times=[0,2.1,4,6.2,8.5,10.8,12.5,15.5,18,21,23.2,24.5,26.5,29.8,33,35.5,38,41.5],start=Date.now();
 for(let i=0;i<times.length;i++){const wait=start+times[i]*1000-Date.now();if(wait>0)await page.waitForTimeout(wait);await snap('auto-'+String(i).padStart(2,'0'));}
 return rows;
}
