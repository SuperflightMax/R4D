async (page) => {
 const dir='D:/dev/R4D/experiments/q3b-transforming-crab/qa/technical/output/playwright/c1/';
 const forms={module:'01 Модуль Сложить конструкцию',crab:'02 Краб Развернуть опоры',work:'03 Мастерская Открыть и приступить к работе'};
 const click=name=>page.getByRole('button',{name,exact:true}).click();
 await page.evaluate(async()=>{
  window.__Q3B.setPaused(true);
  const api=window.__Q3B,images={};
  function hull(points){points.sort((a,b)=>a[0]-b[0]||a[1]-b[1]);const cross=(o,a,b)=>(a[0]-o[0])*(b[1]-o[1])-(a[1]-o[1])*(b[0]-o[0]);const lo=[],hi=[];for(const p of points){while(lo.length>1&&cross(lo[lo.length-2],lo[lo.length-1],p)<=0)lo.pop();lo.push(p);}for(const p of points.toReversed()){while(hi.length>1&&cross(hi[hi.length-2],hi[hi.length-1],p)<=0)hi.pop();hi.push(p);}return lo.slice(0,-1).concat(hi.slice(0,-1));}
  for(const p of api.manifest.parts){if(images[p.file])continue;const img=new Image();img.src=p.file;await img.decode();const cv=document.createElement('canvas');cv.width=img.width;cv.height=img.height;const c=cv.getContext('2d');c.drawImage(img,0,0);const px=c.getImageData(0,0,img.width,img.height).data,pts=[];for(let x=0;x<img.width;x++){let top=-1,bottom=-1;for(let y=0;y<img.height;y++)if(px[(y*img.width+x)*4+3]>=128){if(top<0)top=y;bottom=y+1;}if(top>=0)pts.push([x,top],[x+1,top],[x,bottom],[x+1,bottom]);}images[p.file]=hull(pts);}
  window.__TQA_INK={images,measure:s=>{let bottom=-Infinity,part;const perPart={};for(const p of api.manifest.parts){const w=s.world[p.id],c=Math.cos(w.angle),sin=Math.sin(w.angle);let max=-Infinity;for(const q of images[p.file]){const x=(q[0]-p.pivot[0])*(p.scale?.[0]??1),y=(q[1]-p.pivot[1])*(p.scale?.[1]??1);max=Math.max(max,w.y+x*sin+y*c);}perPart[p.id]=max;if(max>bottom){bottom=max;part=p.id;}}return {absoluteGap:-bottom*s.view.scale,part,perPart};}};
 });
 const result={method:'Independent alpha>=128 opaque-pixel hull from actual PNG, all 23 transforms vs common front floor; rear plane distinguished',routes:[],takeoff:[],walk:{}};
 await click('Сначала');
 const sequence=['crab','work','crab','module','work','module'];
 for(let k=0;k<sequence.length;k++){
  await click(forms[sequence[k]]);
  const r=await page.evaluate(()=>{let worst={absoluteGap:Infinity};for(let i=0;i<780;i++){window.__Q3B.step(1/120);const s=window.__Q3B.snapshot(),ink=window.__TQA_INK.measure(s);if(ink.absoluteGap<worst.absoluteGap)worst={...ink,t:s.time,u:s.u,step:i+1,snapshot:s};}return worst;});
  result.routes.push({index:k,target:sequence[k],...r});
 }
 const worst=result.routes.reduce((a,b)=>a.absoluteGap<b.absoluteGap?a:b);
 await click('Сначала');
 for(let k=0;k<=worst.index;k++){await click(forms[sequence[k]]);await page.evaluate(n=>{for(let i=0;i<n;i++)window.__Q3B.step(1/120);},k===worst.index?worst.step:780);}
 await page.locator('#scene').screenshot({path:dir+'contact-worst-floor.png'});result.worst=worst;
 for(const [direction,button] of [[1,'Вперёд →'],[-1,'← Назад']]){
  await click('Сначала');await click(forms.crab);await page.evaluate(()=>window.__Q3B.step(5));await click(button);await page.evaluate(()=>window.__Q3B.step(1.3));await click('Прыгнуть ↑');
  const r=await page.evaluate(()=>{let prev=window.__Q3B.snapshot();for(let i=0;i<720;i++){window.__Q3B.step(1/240);const s=window.__Q3B.snapshot();if(prev.jump==='prepare'&&s.jump==='flight'){return {before:prev,after:s,delta:window.__TQA.delta(prev,s),footDelta:Object.fromEntries(['Left','Right','Rear'].map(side=>[side,{dx:s.world['foot'+side].x-prev.world['foot'+side].x,dy:s.world['foot'+side].y-prev.world['foot'+side].y}]))};}prev=s;}return {error:'no takeoff'};});
  result.takeoff.push({direction,...r});
 }
 await click('Сначала');await click(forms.crab);await page.evaluate(()=>window.__Q3B.step(5));await click('Вперёд →');await page.evaluate(()=>window.__Q3B.step(2));
 result.walk=await page.evaluate(()=>{let prev=window.__Q3B.snapshot(),maxPlantDrift=0,samples=0;for(let i=0;i<720;i++){window.__Q3B.step(1/120);const s=window.__Q3B.snapshot();for(const side of ['Left','Right','Rear'])if(!prev.feet[side].swing&&!s.feet[side].swing&&Math.abs(prev.soleGaps[side])<.01&&Math.abs(s.soleGaps[side])<.01){maxPlantDrift=Math.max(maxPlantDrift,Math.hypot(prev.world['foot'+side].x-s.world['foot'+side].x,prev.world['foot'+side].y-s.world['foot'+side].y));samples++;}prev=s;}return {maxPlantDrift,samples,seconds:6,end:window.__TQA.brief(prev)};});
 return result;
}

