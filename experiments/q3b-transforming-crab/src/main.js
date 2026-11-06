import {Application,Assets,Container,Sprite,Graphics,Text} from 'pixi.js';
import {Motion,spring} from './motion.js';
import {Rig} from './rig.js';
import './style.css';
const $=id=>document.getElementById(id),scene=$('scene'),app=new Application();
await app.init({resizeTo:scene,antialias:true,resolution:Math.min(devicePixelRatio,2),autoDensity:true,background:0x233b3c});
scene.prepend(app.canvas);
const back=new Graphics(),floorArt=new Graphics(),shadow=new Graphics(),character=new Container(),bonesArt=new Graphics();
character.sortableChildren=true;app.stage.addChild(back,floorArt,shadow,character,bonesArt);
const base=import.meta.env.BASE_URL;
let manifest;
try{const r=await fetch(`${base}art/manifest.json`);if(!r.ok)throw new Error('manifest HTTP '+r.status);manifest=await r.json();}
catch(error){$('loading').textContent='Настоящий художественный узел ещё готовится.';throw error;}
const parts=manifest.parts,textures=await Promise.all(parts.map(p=>Assets.load(base+p.file))),sprites={},ink={},soles={};
for(let i=0;i<parts.length;i++){
 const part=parts[i],sprite=new Sprite(textures[i]);sprite.pivot.set(...part.pivot);sprite.zIndex=part.layer;
 if(part.scale)sprite.scale.set(...part.scale);character.addChild(sprite);sprites[part.id]=sprite;
 const image=new Image();image.src=base+part.file;await image.decode();
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
 const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
 const pixels=context.getImageData(0,0,image.width,image.height).data,points=[];
 let minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity;
 for(let x=0;x<image.width;x++){
  let bottom=null;
  for(let y=0;y<image.height;y++)if(pixels[(y*image.width+x)*4+3]>=128){minX=Math.min(minX,x);maxX=Math.max(maxX,x+1);minY=Math.min(minY,y);maxY=Math.max(maxY,y+1);bottom=y+1;}
  if(bottom!==null)points.push([x+.5-part.pivot[0],bottom-part.pivot[1]]);
 }
 ink[part.id]={minX:minX-part.pivot[0],maxX:maxX-part.pivot[0],minY:minY-part.pivot[1],maxY:maxY-part.pivot[1]};
 if(part.id.startsWith('foot'))soles[part.id.slice(4)]=points;
}
const motion=new Motion();
function configure(){
 motion.coreBottom=ink.core.maxY;
 motion.setGeometry(motion.legs.map(l=>{const lower=parts.find(p=>p.id==='lower'+l.id),foot=parts.find(p=>p.id==='foot'+l.id),upper=parts.find(p=>p.id==='upper'+l.id);return{id:l.id,sole:soles[l.id]?Math.max(...soles[l.id].map(p=>p[1])):l.sole,a:lower?Math.hypot(...lower.joint):l.a,b:foot?Math.hypot(...foot.joint):l.b,hip:upper?.joint};}));
}
configure();const rig=new Rig(parts,motion,soles);
let paused=false,showBones=false,camera=0,cameraV=0,last={},view={},held=new Set();
const names={module:'Модуль',crab:'Краб',work:'Мастерская'};
const partial=parts.length<23;
function command(type,value){motion.dispatch({type,value});held.clear();render();}
function pause(value=!paused){paused=value;$('pause').textContent=paused?'Продолжить · P':'Пауза · P';$('pause').setAttribute('aria-pressed',String(paused));}
function reset(){motion.reset();configure();camera=0;cameraV=0;held.clear();render();}
for(const button of document.querySelectorAll('[data-form]'))button.onclick=()=>command('form',button.dataset.form);
$('forward').onclick=()=>command('move',1);$('backward').onclick=()=>command('move',-1);
$('stop').onclick=()=>command('stop');$('low').onclick=()=>command('low');$('jump').onclick=()=>command('jump');
$('show').onclick=()=>{if(motion.auto){motion.auto=null;motion.dispatch({type:'stop'});}else{motion.startShow();pause(false);}render();};
$('pause').onclick=()=>pause();$('step').onclick=()=>{pause(true);advance(1/60);render();};
$('bones').onclick=()=>{showBones=!showBones;$('bones').setAttribute('aria-pressed',String(showBones));render();};$('reset').onclick=reset;
window.addEventListener('keydown',event=>{
 if(event.target instanceof HTMLInputElement||event.target instanceof HTMLSelectElement||event.repeat)return;
 const code=event.code;if(['Space','ArrowLeft','ArrowRight'].includes(code))event.preventDefault();
 if(['Digit1','Digit2','Digit3'].includes(code))command('form',code==='Digit1'?'module':code==='Digit2'?'crab':'work');
 if(['KeyA','ArrowLeft','KeyD','ArrowRight'].includes(code)){held.add(code);motion.dispatch({type:'move',value:['KeyA','ArrowLeft'].includes(code)?-1:1});}
 if(code==='KeyX')command('stop');if(code==='KeyS')command('low');if(code==='Space')command('jump');
 if(code==='KeyP')pause();if(code==='Period')$('step').click();
});
window.addEventListener('keyup',event=>{if(held.delete(event.code)&&held.size===0)motion.dispatch({type:'stop'});});
window.addEventListener('blur',()=>{if(held.size){held.clear();motion.dispatch({type:'stop'});}});
function advance(dt){motion.update(dt);[camera,cameraV]=spring(camera,cameraV,motion.x,dt,2.3);}
function render(){
 const width=app.screen.width,height=app.screen.height,ground=height*.80,scale=Math.min(width/740,(ground-55)/410,1.55),cx=width*.5-camera*scale;
 const day=$('background').value==='light',sky=day?0xd7dfd0:0x263d3f,skyLow=day?0xbdcdbb:0x1b3435,groundColor=day?0x9fb4a2:0x1a3030;
 back.clear().rect(0,0,width,height).fill(sky);
 back.circle(width*.75,height*.25,height*.19).fill({color:day?0xeee6ca:0xa6b9a1,alpha:day?.45:.055});
 back.moveTo(0,height*.60).bezierCurveTo(width*.22,height*.48,width*.35,height*.73,width*.58,height*.60).bezierCurveTo(width*.76,height*.47,width*.92,height*.64,width,height*.57).lineTo(width,ground).lineTo(0,ground).fill(skyLow);
 floorArt.clear().rect(0,ground,width,height-ground).fill(groundColor).moveTo(0,ground).lineTo(width,ground).stroke({color:day?0x6e8c79:0x50766c,width:1,alpha:.7});
 const drift=(camera*scale)%94;
 for(let i=-1;i<width/94+2;i++)floorArt.moveTo(i*94-drift,ground+24).lineTo(i*94+20-drift,ground+24).stroke({color:day?0x6c8c75:0x42655a,width:1,alpha:.45});
 shadow.clear().ellipse(cx+motion.x*scale,ground+3,120*scale,11*scale).fill({color:0x071a18,alpha:.24-Math.min(motion.height*.001,.16)});
 character.position.set(cx,ground);character.scale.set(scale);last=rig.solve();
 for(const part of parts){const pose=last.world[part.id],sprite=sprites[part.id];sprite.position.set(pose.x,pose.y);sprite.rotation=pose.angle;}
 bonesArt.clear();
 if(showBones){
  for(const part of parts){const p=last.world[part.id],parent=part.parent&&last.world[part.parent];const x=cx+p.x*scale,y=ground+p.y*scale;
   if(parent)bonesArt.moveTo(cx+parent.x*scale,ground+parent.y*scale).lineTo(x,y).stroke({color:0xf6d17c,width:1.5});
   bonesArt.circle(x,y,3).fill(0xff8f67);
  }
  // The absent mast is a diagnostic mount marker only, never substitute artwork.
  const core=last.world.core,c=Math.cos(core.angle),s=Math.sin(core.angle),mx=core.x+62*s,my=core.y-62*c;
  bonesArt.circle(cx+mx*scale,ground+my*scale,5).stroke({color:0xf5df8d,width:2});
 }
 const target=names[motion.form],current=motion.u<.15?'Модуль':motion.u>.99&&motion.u<1.04?'Краб':motion.u>1.98?'Мастерская':'Превращение';
 $('form-label').textContent=partial?'Ранний узел · '+current:current;
 const jumpLabel={ground:'',prepare:'Готовится к прыжку',flight:'В воздухе',land:'Приземляется'}[motion.jump];
 $('motion-label').textContent=jumpLabel|| (motion.pendingJump?'Разворачивается для прыжка':Math.abs(motion.speed)>2?(motion.speed>0?'Движется вперёд':'Движется назад'):motion.action==='low'?'Низкая опора':Math.abs(motion.u-({module:0,crab:1,work:2}[motion.form]))>.02?'К форме «'+target+'»':'В покое');
 for(const button of document.querySelectorAll('[data-form]'))button.setAttribute('aria-pressed',String(button.dataset.form===motion.form));
 $('show').setAttribute('aria-pressed',String(!!motion.auto));$('show').textContent=motion.auto?'■ Остановить показ':'▶ Показать всё';
 const b=character.getBounds();view={width,height,floor:ground,scale,camera,characterBounds:{x:b.x,y:b.y,width:b.width,height:b.height},partial};
 $('diagnostics').textContent=`u ${motion.u.toFixed(4)} / скорость ${motion.uv.toFixed(4)} · цель ${target}\nход ${motion.action} · скорость ${motion.speed.toFixed(2)} · высота ${motion.height.toFixed(2)} · ${motion.jump}\n${parts.length} связанных частей · ${partial?'ранний реальный срез, не полный персонаж':'единая конструкция'} · ${paused?'пауза':'время идёт'}`;
}
$('loading').remove();
app.ticker.add(ticker=>{if(!paused)advance(Math.min(ticker.deltaMS/1000,.05)*Number($('speed').value));render();});
window.__Q3B={snapshot:()=>({...motion.snapshot(),world:structuredClone(last.world),solutions:structuredClone(last.solutions),soleGaps:{...last.gaps},view:{...view},parts:parts.map(p=>p.id),paused,manifestRevision:manifest.artRevision}),dispatch:commandObject=>{motion.dispatch(commandObject);render();},setPaused:pause,step:(dt=1/60)=>{advance(dt);render();},reset,manifest};
render();
