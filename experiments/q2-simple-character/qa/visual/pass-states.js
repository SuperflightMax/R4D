async (page) => {await page.getByRole('button', {name: 'Сначала · R', exact:true}).click();
for (let i=0; i<4; i++) { await page.waitForTimeout(180); await page.screenshot({path:`idle-${i}.png`,clip:{x:420,y:25,width:420,height:525}}); }
await page.getByRole('button', {name:'Низкая поза · 2',exact:true}).click();
for (let i=0; i<9; i++) { await page.waitForTimeout(90); await page.screenshot({path:`low-${i}.png`,clip:{x:420,y:25,width:420,height:525}}); }
await page.getByRole('combobox',{name:'Фон',exact:true}).selectOption({label:'Тёмный'});
await page.screenshot({path:'low-dark.png'});
await page.getByRole('button', {name:'Идти · 3',exact:true}).click();
for (let i=0; i<14; i++) { await page.waitForTimeout(85); await page.screenshot({path:`move-${i}.png`,clip:{x:420,y:25,width:420,height:525}}); }
await page.getByRole('button', {name:'Пауза · P',exact:true}).click();
console.log(await page.locator('main').innerText());
}
