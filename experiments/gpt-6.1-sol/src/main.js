import {Application,Assets,Container,Sprite,Graphics} from 'pixi.js';
import {Motion,SCENARIO} from './motion.js';
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
  const response=await fetch(`${base}manifest.json`);
  if(!response.ok)throw new Error(`manifest.json: HTTP ${response.status}`);
  manifest=await response.json();
} catch(error) { $('loading').textContent='Не удалось загрузить рисунок. Проверьте assets/manifest.json и запустите npm run dev.'; throw error; }
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
const contact=side=>byId['foot'+side].size[1]-byId['foot'+side].pivot[1];
const standingDistance=side=>bind['thigh'+side].y+length('shin'+side,125)+length('foot'+side,125)+contact(side);
const groundDistance=Math.min(standingDistance('Near'),standingDistance('Far'))-12;
const motion=new Motion({thigh:length('shinNear',125),shin:length('footNear',125),farThigh:length('shinFar',125),farShin:length('footFar',125),nearReach:groundDistance-bind.thighNear.y-contact('Near'),farReach:groundDistance-bind.thighFar.y-contact('Far')});
let paused=false,bones=false,latched=false,held=new Set(),facing=1,scenario=null,world={};
const eventLog=[];
function log(action){eventLog.push({time:motion.time,action});if(eventLog.length>80)eventLog.shift();}
function inputMove(){const direction=held.has('ArrowLeft')||held.has('KeyA')?-1:held.has('ArrowRight')||held.has('KeyD')?1:latched?1:0;motion.setMove(direction);if(direction)facing=direction;$('move').setAttribute('aria-pressed',String(latched));}
function jump(){motion.jump();log('jump');}
function pause(){paused=!paused;$('pause').setAttribute('aria-pressed',String(paused));$('pause').textContent=paused?'Продолжить · P':'Пауза · P';}
function toggleBones(){bones=!bones;$('bones').setAttribute('aria-pressed',String(bones));render();}
function reset(){motion.reset();held.clear();latched=false;facing=1;scenario=null;inputMove();log('reset');render();}
$('move').onclick=()=>{scenario=null;latched=!latched;inputMove();log(latched?'move':'stop');};
$('jump').onclick=()=>{scenario=null;jump();};
$('pause').onclick=pause;
$('bones').onclick=toggleBones;
$('reset').onclick=reset;
$('step').onclick=()=>{if(!paused)pause();advance(1/60);render();};
$('scenario').onclick=()=>{reset();scenario={start:motion.time,cursor:0};if(paused)pause();log('scenario');};
window.addEventListener('keydown',e=>{
 if(e.target instanceof HTMLInputElement)return;
 if(['Space','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();
 if(e.repeat)return;
 if(['ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code)){scenario=null;held.add(e.code);inputMove();log(`down ${e.code}`);}
 if(e.code==='Space'){scenario=null;jump();}
 if(e.code==='KeyP')pause();if(e.code==='KeyB')toggleBones();if(e.code==='KeyR')reset();if(e.code==='Period')$('step').click();
});
window.addEventListener('keyup',e=>{held.delete(e.code);inputMove();if(['ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code))log(`up ${e.code}`);});
window.addEventListener('blur',()=>{held.clear();inputMove();});
function advance(dt){
 // Event times are evaluated against simulated time, so pause/step/slow motion replay identically.
 let remaining=dt;
 while(remaining>1e-8){const step=Math.min(remaining,1/120);
  if(scenario){while(scenario.cursor<SCENARIO.length&&SCENARIO[scenario.cursor].at<=motion.time-scenario.start+1e-8){const e=SCENARIO[scenario.cursor++];if('move'in e){motion.setMove(e.move);latched=!!e.move;$('move').setAttribute('aria-pressed',String(latched));}if(e.jump)jump();}if(motion.time-scenario.start>5.8)scenario=null;}
  motion.update(step);remaining-=step;
 }
}
function render(){
 const w=app.screen.width,h=app.screen.height, floor=h*.86;
 const scale=Math.min((h*.72)/bindHeight,w/(bindHeight*.9),.9);
 const center=w*.50;
 backdrop.clear().rect(0,0,w,h).fill(0xd6dfd1);
 backdrop.circle(w*.78,h*.25,h*.11).fill({color:0xf1e8cd,alpha:.65});
 backdrop.moveTo(0,h*.66).bezierCurveTo(w*.2,h*.52,w*.38,h*.75,w*.57,h*.62).bezierCurveTo(w*.78,h*.48,w*.87,h*.68,w,h*.57).lineTo(w,floor).lineTo(0,floor).fill(0xb5c7bc);
 ground.clear().rect(0,floor,w,h-floor).fill(0x8da69c).moveTo(0,floor).lineTo(w,floor).stroke({color:0x5d8079,width:2});
 for(let i=-1;i<w/90+2;i++){const x=i*90-((motion.travel*scale)%90);ground.moveTo(x,floor+15).lineTo(x+20,floor+15).stroke({color:0x66897d,width:2,alpha:.55});}
 const rootY=floor-groundDistance*scale+motion.pose.rootY*scale;
 character.position.set(center,rootY);character.scale.set(scale*facing,scale);
 shadow.clear().ellipse(center,floor+4,48*scale*(1-motion.height/600),7*scale).fill({color:0x254b4b,alpha:Math.max(.08,.22-motion.height/1200)});
 world={};
 function transform(id){if(world[id])return world[id];const p=byId[id];const parent=p.parent&&byId[p.parent]?transform(p.parent):{x:0,y:0,angle:0};const c=Math.cos(parent.angle),s=Math.sin(parent.angle);return world[id]={x:parent.x+p.joint[0]*c-p.joint[1]*s,y:parent.y+p.joint[0]*s+p.joint[1]*c,angle:parent.angle+(motion.pose[id]??0)};}
 for(const p of parts){const t=transform(p.id),sprite=sprites[p.id];sprite.position.set(t.x,t.y);sprite.rotation=t.angle;}
 skeleton.clear();
 if(bones){for(const p of parts){const t=world[p.id];const x=center+t.x*scale*facing,y=rootY+t.y*scale;const parent=p.parent&&world[p.parent];if(parent)skeleton.moveTo(center+parent.x*scale*facing,rootY+parent.y*scale).lineTo(x,y).stroke({color:0xffe970,width:2});skeleton.circle(x,y,3.5).fill(0xed5343).stroke({color:0xffedbc,width:1});}}
 const labels={idle:'стойка',move:'ходьба',prepare:'подготовка',flight:'полёт',land:'приземление'};
 $('status').textContent=`${labels[motion.state]} · ${paused?'пауза':'время идёт'}${scenario?' · сценарий':''}\nt = ${motion.time.toFixed(3)} с · фаза шага ${motion.phase.toFixed(3)}\nскорость ${motion.speed.toFixed(1)} · высота ${motion.height.toFixed(1)}\nпрыжков ${motion.jumpCount} · приземлений ${motion.landCount}\n${parts.length} PNG / ${parts.length} суставов · общий пружинный переход`;
}
$('loading').remove();
app.ticker.add(ticker=>{if(!paused)advance(Math.min(ticker.deltaMS/1000,.05)*Number($('speed').value));render();});
// Read-only observation plus the same input/step paths used by controls, for reproducible QA.
window.__R4D={snapshot:()=>({...motion.snapshot(),paused,bones,latched,partCount:parts.length,world:structuredClone(world),inputs:[...eventLog]}),setPaused:value=>{if(paused!==value)pause();},step:(dt=1/60)=>{advance(dt);render();},reset,manifest};
render();
