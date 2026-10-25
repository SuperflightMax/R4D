async page=>{
 const device=page.viewportSize().width<600?'mobile':'desktop',runs=[];
 async function options(zoom,dark,diag){await page.evaluate(o=>{for(const [id,value]of Object.entries(o)){let el=document.getElementById(id);el.checked=value;el.dispatchEvent(new Event('change',{bubbles:true}));}},{zoom:zoom===2,dark,bones:diag,mesh:diag});}
 const read=()=>page.evaluate(()=>({tick:window.q5a.motion.tick,t:window.q5a.motion.time,phase:window.q5a.motion.phase,elapsed:window.q5a.motion.elapsed,target:window.q5a.motion.ground,framing:window.q5a.getStats().framing,stats:window.q5a.getStats(),head:window.q5a.getPose().landmarks.head}));
 for(const state of ['idle','low','walk']){
  await page.reload();await page.waitForFunction(()=>{if(!window.q5a)return false;window.q5a.pause(true);return true;},null,{polling:1});
  if(state!=='idle')await page.getByRole('button',{name:state==='low'?'Присед':'Ходьба',exact:true}).click();
  await page.evaluate(()=>window.q5a.step(180));
  await page.getByText('Диагностика и просмотр',{exact:true}).click();
  await page.getByLabel('Крупно 2×',{exact:true}).check();
  await page.getByRole('button',{name:'Прыжок ↑',exact:true}).click();
  const rows=[],captures=[];
  for(let f=0;f<=144;f++){
   if(f)await page.evaluate(()=>window.q5a.step(2));
   await options(2,false,false);rows.push({frame:f,...await read()});
   if(f%12===0){
    for(const [dark,diag,suffix]of [[false,false,'light'],[true,false,'dark'],[true,true,'dark-diagnostic'],[false,true,'light-diagnostic']]){
     await options(2,dark,diag);const file=device+'-'+state+'-f'+String(f).padStart(3,'0')+'-2x-'+suffix+'.png';await page.locator('.canvas-wrap').screenshot({path:file});captures.push({file,frame:f,mode:suffix,...await read()});
    }
    if(f===60){await options(1,false,false);const file=device+'-'+state+'-f060-1x-light.png';await page.locator('.canvas-wrap').screenshot({path:file});captures.push({file,frame:f,mode:'1x-light',...await read()});}
    await options(2,false,false);
   }
  }
  runs.push({state,rows,captures});
 }
 return {device,method:'paused production step(2)=1/60 s; all four 2x control combinations at identical poses',runs};
}
