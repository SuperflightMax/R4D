async(page)=>{
 await page.getByRole('button',{name:'Кости · B',exact:true}).click();
 await page.getByRole('button',{name:'В середине → прыжок',exact:true}).click();
 for(let i=0;i<48;i++)await page.getByRole('button',{name:'Шаг · .',exact:true}).click();
 return await page.locator('body').innerText();
}
