import {Application,Assets,Container,Sprite,Graphics} from 'pixi.js';
import {Motion,ROUTES} from './motion.js';
import './style.css';

const $=id=>document.getElementById(id);
const app=new Application();
const scene=$('scene');
await app.init({resizeTo:scene,antialias:true,background:0xd6dfd1,resolution:Math.min(devicePixelRatio,2),autoDensity:true});
scene.appendChild(app.canvas);
const backdrop=new Graphics(), ground=new Graphics(), shadow=new Graphics();
const character=new Container(), skeleton=new Graphics();
app.stage.addChild(backdrop,ground,shadow,character,skeleton);
const base=import.meta.env.BASE_URL;
let manifest;
try {
  const response=await fetch(`${base}art/manifest.json`);
  if(!response.ok)throw new Error(`manifest.json: HTTP ${response.status}`);
  manifest=await response.json();
} catch(error) { $('loading').textContent='Не удалось загрузить рисунок. Ожидается public/art/manifest.json и запустите npm run dev.'; throw error; }
const parts=manifest.parts;
const byId=Object.fromEntries(parts.map(p=>[p.id,p]));
const textures=await Promise.all(parts.map(p=>Assets.load(`${base}${p.file}`)));
const sprites={};
parts.forEach((p,i)=>{const s=new Sprite(textures[i]);s.pivot.set(...p.pivot);s.zIndex=p.layer;character.addChild(s);sprites[p.id]=s;});
character.sortableChildren=true;
const bind={};
function bindPosition(id){if(bind[id])return bind[id];const p=byId[id];const parent=p.parent&&byId[p.parent]?bindPosition(p.parent):{x:0,y:0};return bind[id]={x:parent.x+p.joint[0],y:parent.y+p.joint[1]};}
parts.forEach(p=>bindPosition(p.id));
const length=(id,fallback)=>byId[id]?Math.hypot(...byId[id].joint):fallback;
let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
parts.forEach((p,i)=>{const b=bind[p.id],t=textures[i];minX=Math.min(minX,b.x-p.pivot[0]);minY=Math.min(minY,b.y-p.pivot[1]);maxX=Math.max(maxX,b.x-p.pivot[0]+t.width);maxY=Math.max(maxY,b.y-p.pivot[1]+t.height);});
const bindHeight=maxY-minY;
// Lower opaque boundary of each real boot, relative to its physical ankle pivot.
// This measures existing art; no PNG pixels are altered.
const soles={};
for(const side of ['Near','Far']){
 const p=byId['foot'+side],image=new Image();image.src=`${base}${p.file}`;await image.decode();
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
 const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
 const pixels=context.getImageData(0,0,image.width,image.height).data,points=[];
 for(let x=0;x<image.width;x++)for(let y=image.height-1;y>=0;y--)if(pixels[(y*image.width+x)*4+3]>=128){points.push([x+.5-p.pivot[0],y+1-p.pivot[1]]);break;}
 soles[side]=points;
}
const contact=side=>Math.max(...soles[side].map(([,y])=>y));
const standingDistance=side=>bind['thigh'+side].y+length('shin'+side,125)+length('foot'+side,125)+contact(side);
const motionUnit=(length('shinNear',125)+length('footNear',125))/250;
const groundDistance=Math.min(standingDistance('Near'),standingDistance('Far'))-12*motionUnit;
const axis=id=>Math.atan2(-byId[id].joint[0],byId[id].joint[1]);
const motion=new Motion({thigh:length('shinNear',125),shin:length('footNear',125),farThigh:length('shinFar',125),farShin:length('footFar',125),nearReach:groundDistance-bind.thighNear.y-contact('Near'),farReach:groundDistance-bind.thighFar.y-contact('Far'),nearAxisA:axis('shinNear'),nearAxisB:axis('footNear'),farAxisA:axis('shinFar'),farAxisB:axis('footFar'),soleNear:soles.Near,soleFar:soles.Far});
let paused=false,bones=false,held=new Set(),facing=1,scenario=null,world={},view={};
const eventLog=[];
function log(action){eventLog.push({time:motion.time,action});if(eventLog.length>80)eventLog.shift();}
function requestGround(state,direction=1){motion.requestGround(state,direction);if(state==='move')facing=direction;for(const name of ['idle','low','move'])$(name).setAttribute('aria-pressed',String(state===name));log(state);}
function inputMove(){const direction=held.has('ArrowLeft')||held.has('KeyA')?-1:held.has('ArrowRight')||held.has('KeyD')?1:0;requestGround(direction?'move':'idle',direction||facing);}
function jump(){motion.jump();log('jump');}
function pause(){paused=!paused;$('pause').setAttribute('aria-pressed',String(paused));$('pause').textContent=paused?'Продолжить · P':'Пауза · P';}
function toggleBones(){bones=!bones;$('bones').setAttribute('aria-pressed',String(bones));render();}
function reset(){motion.reset();held.clear();facing=1;scenario=null;requestGround('idle');log('reset');render();}
for(const state of ['idle','low','move'])$(state).onclick=()=>{scenario=null;held.clear();requestGround(state);};
$('jump').onclick=()=>{scenario=null;jump();};
$('pause').onclick=pause;
$('bones').onclick=toggleBones;
$('reset').onclick=reset;
$('step').onclick=()=>{if(!paused)pause();advance(1/60);render();};
document.querySelectorAll('[data-route]').forEach(button=>button.onclick=()=>{reset();scenario={start:motion.time,cursor:0,name:button.dataset.route};if(paused)pause();log(`route ${scenario.name}`);});
window.addEventListener('keydown',e=>{
 if(e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement)return;
 if(['Space','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
 if(e.repeat)return;
 if(['ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code)){scenario=null;held.add(e.code);inputMove();log(`down ${e.code}`);}
 if(e.code==='Space'){scenario=null;jump();}
 if(['Digit1','Digit2','Digit3','KeyS'].includes(e.code)){scenario=null;requestGround(e.code==='Digit1'?'idle':e.code==='Digit3'?'move':'low');}
 if(e.code==='KeyP')pause();if(e.code==='KeyB')toggleBones();if(e.code==='KeyR')reset();if(e.code==='Period')$('step').click();
});
window.addEventListener('keyup',e=>{if(held.delete(e.code)){inputMove();log(`up ${e.code}`);}});
window.addEventListener('blur',()=>{if(held.size){held.clear();inputMove();}});
function advance(dt){
 // Event times are evaluated against simulated time, so pause/step/slow motion replay identically.
 let remaining=dt;
 while(remaining>1e-8){const step=Math.min(remaining,1/120);
  if(scenario){const route=ROUTES[scenario.name];while(scenario.cursor<route.length&&route[scenario.cursor].at<=motion.time-scenario.start+1e-8){const e=route[scenario.cursor++];if(e.ground)requestGround(e.ground);if(e.jump)jump();}if(motion.time-scenario.start>7)scenario=null;}
  motion.update(step);remaining-=step;
 }
}
function render(){
 const w=app.screen.width,h=app.screen.height, floor=h*.86;
 const scale=Math.min((h*.72)/bindHeight,w/(bindHeight*.78),360/bindHeight);
 const center=w*.50;
 const palette={light:[0xd6dfd1,0xb5c7bc,0x8da69c],medium:[0x87998f,0x6c847a,0x536f64],dark:[0x253c43,0x314e51,0x244743]}[$('background').value];
 backdrop.clear().rect(0,0,w,h).fill(palette[0]);
 backdrop.circle(w*.78,h*.25,h*.11).fill({color:0xf1e8cd,alpha:.65});
 backdrop.moveTo(0,h*.66).bezierCurveTo(w*.2,h*.52,w*.38,h*.75,w*.57,h*.62).bezierCurveTo(w*.78,h*.48,w*.87,h*.68,w,h*.57).lineTo(w,floor).lineTo(0,floor).fill(palette[1]);
 ground.clear().rect(0,floor,w,h-floor).fill(palette[2]).moveTo(0,floor).lineTo(w,floor).stroke({color:0x5d8079,width:2});
 for(let i=-1;i<w/90+2;i++){const x=i*90-((motion.travel*scale)%90);ground.moveTo(x,floor+15).lineTo(x+20,floor+15).stroke({color:0x66897d,width:2,alpha:.55});}
 const rootY=floor-groundDistance*scale+motion.pose.rootY*scale;
 const rootX=center+motion.pose.bodyX*scale*facing;
 character.position.set(rootX,rootY);character.scale.set(scale*facing,scale);
 shadow.clear().ellipse(center,floor+4,48*scale*(1-motion.height/600),7*scale).fill({color:0x254b4b,alpha:Math.max(.08,.22-motion.height/1200)});
 world={};
 function transform(id){if(world[id])return world[id];const p=byId[id];const parent=p.parent&&byId[p.parent]?transform(p.parent):{x:0,y:0,angle:0};const c=Math.cos(parent.angle),s=Math.sin(parent.angle);return world[id]={x:parent.x+p.joint[0]*c-p.joint[1]*s,y:parent.y+p.joint[0]*s+p.joint[1]*c,angle:parent.angle+(motion.pose[id]??0)};}
 for(const p of parts){const t=transform(p.id),sprite=sprites[p.id];sprite.position.set(t.x,t.y);sprite.rotation=t.angle;}
 view={floor,rootX,rootY,scale,facing,bindHeight,groundDistance,renderedSoleGap:{}};
 for(const side of ['Near','Far']){
  const foot=world['foot'+side],extent=Math.max(...soles[side].map(([x,y])=>x*Math.sin(foot.angle)+y*Math.cos(foot.angle)));
  view.renderedSoleGap[side]=floor-(rootY+(foot.y+extent)*scale);
 }
 skeleton.clear();
 if(bones){for(const p of parts){const t=world[p.id];const x=rootX+t.x*scale*facing,y=rootY+t.y*scale;const parent=p.parent&&world[p.parent];if(parent)skeleton.moveTo(rootX+parent.x*scale*facing,rootY+parent.y*scale).lineTo(x,y).stroke({color:0xffe970,width:2});skeleton.circle(x,y,3.5).fill(0xed5343).stroke({color:0xffedbc,width:1});}}
 const labels={idle:'покой',low:'низкая поза',move:'ходьба',prepare:'подготовка',flight:'полёт',land:'приземление'};
 $('status').textContent=`${labels[motion.state]} → ${labels[motion.ground]} · ${paused?'пауза':'время идёт'}${scenario?' · маршрут '+scenario.name:''}\nt = ${motion.time.toFixed(3)} с · фаза ${motion.phase.toFixed(3)} · высота ${motion.height.toFixed(1)}\nтаз ↓ ${motion.pose.rootY.toFixed(1)} · колено ${(motion.pose.shinNear*180/Math.PI).toFixed(0)}° · прыжки ${motion.jumpCount}/${motion.landCount}\n${parts.length} PNG · общий пружинный переход + единая IK ног`;
}
$('loading').remove();
app.ticker.add(ticker=>{if(!paused)advance(Math.min(ticker.deltaMS/1000,.05)*Number($('speed').value));render();});
// Read-only observation plus the same input/step paths used by controls, for reproducible QA.
window.__R4D={snapshot:()=>({...motion.snapshot(),paused,bones,partCount:parts.length,world:structuredClone(world),view:structuredClone(view),inputs:[...eventLog]}),setPaused:value=>{if(paused!==value)pause();},step:(dt=1/60)=>{advance(dt);render();},reset,manifest};
render();
