async (page) => {
 const click=name=>page.getByRole('button',{name,exact:true}).click();
 const read=()=>page.evaluate(()=>window.__Q3B.snapshot());
 const run=(seconds,stop)=>page.evaluate(([s,p])=>window.__TQA.run(s,p),[seconds,stop]);
 const result={};
 await page.evaluate(()=>window.__Q3B.setPaused(true));
 await click('Сначала');await click('03 Мастерская Открыть и приступить к работе');await run(.8);result.midBeforeLow=await read();await click('Ниже');result.midAfterLow=await read();result.lowFromTransition=await run(5);
 await click('Прыгнуть ↑');const prepare=await run(3,{kind:'jump',value:'prepare'});await click('Стоп');result.stopDuringPrepare=await read();await click('Прыгнуть ↑');result.repeatJump=await read();result.afterActiveStop=await run(3);
 await click('Сначала');await click('03 Мастерская Открыть и приступить к работе');await run(7);await click('Прыгнуть ↑');result.pendingBeforeForm=await read();await click('01 Модуль Сложить конструкцию');result.pendingAfterForm=await read();result.cancelledByForm=await run(7);
 await click('02 Краб Развернуть опоры');await run(5);const before=await read();await click('Один кадр · .');const after=await read();result.oneFrame={beforeTime:before.time,afterTime:after.time,dt:after.time-before.time,paused:after.paused};
 await page.keyboard.press('3');result.key3=await read();await page.keyboard.press('2');result.key2=await read();await page.keyboard.press('s');await run(1);result.keyLow=await read();await page.keyboard.press('Space');await run(2);result.keyJump=await read();
 return result;
}
