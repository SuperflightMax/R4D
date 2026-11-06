async(page)=>{
 await page.reload();await page.waitForFunction(()=>!!window.__Q3B);
 await page.getByText('Рассмотреть движение',{exact:true}).click();
 await page.getByRole('button',{name:'Пауза · P',exact:true}).click();
 await page.locator('[data-form=work]').click();await page.evaluate(()=>__Q3B.step(5));
 const recording=await page.evaluate(()=>{
  const canvas=document.querySelector('#scene canvas');
  if(!canvas.captureStream||!window.MediaRecorder)return false;
  const stream=canvas.captureStream(60),chunks=[];
  const recorder=new MediaRecorder(stream,{mimeType:'video/webm;codecs=vp8'});
  const done=new Promise(resolve=>recorder.onstop=()=>{
   const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.readAsDataURL(new Blob(chunks,{type:'video/webm'}));
  });
  recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
  window.__artistLiveCapture={recorder,stream,done};recorder.start(250);return true;
 });
 await page.getByRole('button',{name:'Продолжить · P',exact:true}).click();
 const records=[];
 for(const [label,target,duration] of [['work-crab','crab',3600],['crab-module','module',3600],['module-crab','crab',3600],['crab-work','work',3600],['work-module','module',5600]]){
  await page.locator('[data-form='+target+']').click();
  const start=Date.now();let frame=0;
  while(Date.now()-start<duration){
   const s=await page.evaluate(()=>({wall:performance.now(),snapshot:__Q3B.snapshot(),speed:Number(document.querySelector('#speed').value)}));
   records.push({label,frame,elapsedMs:Date.now()-start,...s});
   await page.locator('#scene').screenshot({path:'D:/dev/R4D/experiments/q3b-transforming-crab/output/artist-live-tempo/'+label+'-'+String(frame++).padStart(3,'0')+'.jpg',type:'jpeg',quality:82});
   await page.waitForTimeout(60);
  }
 }
 await page.getByRole('button',{name:'Пауза · P',exact:true}).click();
 let videoData=null;
 if(recording)videoData=await page.evaluate(async()=>{
  const c=window.__artistLiveCapture;c.recorder.stop();const data=await c.done;c.stream.getTracks().forEach(t=>t.stop());delete window.__artistLiveCapture;return data;
 });
 return {recording,videoData,records,note:'Normal wall-time playback at UI speed1; no __Q3B.step during the five live intervals. Initial settled work pose used only as setup.'};
}
