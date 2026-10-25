import{Application,Assets,Container,Graphics,Sprite,Matrix}from'pixi.js';
import{Motion,STEP}from'./motion.mjs';
import{lowerAlphaContour}from'./support.mjs';
import{garmentMatrix,PANEL_EPSILON,PANEL_ANCHORS}from'./panel-transform.mjs';
import fixtures from'../builder/early-v02-04/FIXTURES.json';

const host=document.querySelector('#stage'),status=document.querySelector('#asset-status');
const app=new Application();await app.init({resizeTo:host,background:'#eee9df',antialias:true,preference:'webgl',autoDensity:true,resolution:Math.min(devicePixelRatio,2)});
host.appendChild(app.canvas);app.canvas.setAttribute('aria-label','Мирон: три garment-панели04, тело02');
const ground=new Graphics(),figure=new Container();figure.sortableChildren=true;app.stage.addChild(ground,figure);
const panelIds=['farFlap','nearFlap','waistSeat'],panelZ={farFlap:15,nearFlap:35,waistSeat:36};
let model=null,motion=null,parts=[],paused=false,sourceRest=false,speed=1,sample='live',dark=false,loading=false;
const point=p=>Array.isArray(p)?{x:p[0],y:p[1]}:p;
for(let i=0;i<fixtures.samples.length;i++)document.querySelector('#sample').add(new Option(fixtures.samples[i].label,String(i)));
async function load(){
 if(loading)return;loading=true;
 try{
  const response=await fetch('art/parts.json',{cache:'no-store'});if(!response.ok)throw new Error(`parts.json HTTP ${response.status}`);
  const data=await response.json();
  for(const id of panelIds)if(data.parts.filter(p=>p.id===id).length!==1)throw new Error(`Материал04 ещё не готов: нужна ровно одна панель ${id}`);
  if(data.parts.some(p=>p.id==='pelvis'))throw new Error('Старый garment pelvis не должен оставаться под новыми панелями');
  data.jointPoints=Object.fromEntries(Object.entries(data.jointPoints).map(([k,p])=>[k,point(p)]));
  if(Object.keys(data.jointPoints).length!==Object.keys(fixtures.rest).length||Object.entries(fixtures.rest).some(([k,p])=>
    !data.jointPoints[k]||data.jointPoints[k].x!==p.x||data.jointPoints[k].y!==p.y))throw new Error('Ориентиры тела отличаются от frozen02');
  const loaded=await Promise.all(data.parts.map(async p=>{
   const texture=await Assets.load(new URL(p.file,new URL('art/parts.json',location.href)).href);
   if(texture.width!==p.cropRect[2]||texture.height!==p.cropRect[3])throw new Error(`PNG/crop: ${p.id}`);
   return{...p,sprite:new Sprite(texture),isPanel:panelIds.includes(p.id)};
  }));
  const soleContours={};
  for(const side of['near','far']){
   const foot=loaded.find(p=>p.id===`${side}Foot`);if(!foot)throw new Error(`Missing real ${side}Foot`);
   const canvas=document.createElement('canvas');canvas.width=foot.sprite.texture.width;canvas.height=foot.sprite.texture.height;
   const ctx=canvas.getContext('2d',{willReadFrequently:true});ctx.drawImage(foot.sprite.texture.source.resource,0,0);
   soleContours[side]=lowerAlphaContour(ctx.getImageData(0,0,canvas.width,canvas.height).data,canvas.width,canvas.height,foot.cropRect);
  }
  const contacts=Object.fromEntries(Object.entries(data.contacts).map(([s,c])=>[s,{heel:point(c.heel),toe:point(c.toe)}]));
  const nextMotion=new Motion(data.jointPoints,data.figureBounds[3],{contacts,soleContours,groundY:data.groundY,early:true});
  figure.removeChildren().forEach(p=>p.destroy());model=data;motion=nextMotion;parts=loaded;
  for(const p of parts){p.sprite.zIndex=p.isPanel?panelZ[p.id]:p.z;figure.addChild(p.sprite);}
  const mismatch=['nearFlap','farFlap'].filter(id=>JSON.stringify(data.parts.find(p=>p.id===id).garmentPanel?.anchors?.map(a=>a.source))!==JSON.stringify(PANEL_ANCHORS[id]));
  status.textContent=`Garment04 · 3 объекта/3 матрицы. ${mismatch.length?`Промежуточный вход: metadata ${mismatch.join(',')} расходится с договором; renderer использует согласованные anchors. `:''}Визуальный gate ещё не пройден.`;
  document.querySelectorAll('[data-command]').forEach(b=>b.disabled=false);draw();
 }catch(error){status.textContent=`Garment04 не загружен: ${error.message}`;console.error(error);}
 finally{loading=false;}
}
function draw(){
 const W=app.screen.width,H=app.screen.height,floor=H-52;
 app.renderer.background.color=dark?'#242631':'#eee9df';
 const only=document.querySelector('#garment-only').checked;
 ground.clear();if(!only)ground.moveTo(0,floor).lineTo(W,floor).stroke({width:1,color:dark?0x858896:0x9c9588});
 if(!model)return;
 const rest=model.jointPoints,p=sourceRest?rest:sample==='live'?motion.pose:fixtures.samples[Number(sample)].state.pose;
 const scale=Math.min(420,H*.64,W*.98)/model.figureBounds[3]*(only?3:1);figure.scale.set(scale);
 figure.position.set(only?W/2-p.pelvis.x*scale:W/2-rest.pelvis.x*scale,
   only?H/2-p.pelvis.y*scale:floor-model.groundY*scale);
 const matrices={};
 for(const part of parts){
  const sprite=part.sprite;sprite.visible=part.isPanel||!only;
  if(part.isPanel){
   const m=garmentMatrix(part.id,rest,p);matrices[part.id]=m;
   if(m.determinant<=PANEL_EPSILON){status.textContent=`FAIL det: ${part.id} = ${m.determinant}`;paused=true;}
   const[x,y]=part.cropRect;
   // Entire texture uses this ONE matrix, including crop-to-source translation.
   sprite.setFromMatrix(new Matrix(m.a,m.b,m.c,m.d,m.tx+m.a*x+m.c*y,m.ty+m.b*x+m.d*y));
  }else{
   const a=rest[part.from],b=rest[part.to],A=p[part.from],B=p[part.to];
   sprite.pivot.set(a.x-part.cropRect[0],a.y-part.cropRect[1]);sprite.position.set(A.x,A.y);
   sprite.rotation=sourceRest||part.rigidPelvis?0:Math.atan2(B.y-A.y,B.x-A.x)-Math.atan2(b.y-a.y,b.x-a.x);
  }
 }
 if(document.querySelector('details').open)document.querySelector('#measurements').textContent=JSON.stringify(matrices,null,2);
 document.querySelector('#motion-status').textContent=`${sourceRest?'Source-neutral / identity':sample==='live'?`${paused?'Пауза':'Движение'} · ${motion.time.toFixed(2)} с · ${motion.target}`:`Сохранено: ${fixtures.samples[Number(sample)].label}`} · ${speed}×`;
}
function command(target){
 if(!motion)return;sample='live';sourceRest=false;document.querySelector('#sample').value='live';
 motion.command(target);draw();
}
function toggle(){if(sample!=='live'||sourceRest){sample='live';sourceRest=false;document.querySelector('#sample').value='live';}
 paused=!paused;document.querySelector('#pause').textContent=paused?'Продолжить':'Пауза';draw();}
function step(){if(!motion)return;if(!paused)toggle();if(sample==='live'&&!sourceRest)motion.advance(STEP);draw();}
document.querySelectorAll('[data-command]').forEach(b=>b.addEventListener('click',()=>command(b.dataset.command)));
document.querySelector('#pause').addEventListener('click',toggle);document.querySelector('#step').addEventListener('click',step);
document.querySelector('#rest').addEventListener('click',()=>{sourceRest=!sourceRest;draw();});
document.querySelector('#sample').addEventListener('change',e=>{sample=e.target.value;sourceRest=false;if(sample!=='live'){paused=true;document.querySelector('#pause').textContent='Продолжить';}draw();});
document.querySelector('#speed').addEventListener('change',e=>{speed=Number(e.target.value);draw();});
document.querySelector('#background').addEventListener('change',e=>{dark=e.target.value==='dark';draw();});
document.querySelector('#garment-only').addEventListener('change',draw);document.querySelector('#reload').addEventListener('click',load);
app.ticker.add(t=>{if(motion&&!paused&&sample==='live'&&!sourceRest)motion.advance(Math.min(t.deltaMS/1000,.05)*speed);draw();});
await load();
