import {Application,Assets,Container,Sprite,Graphics} from 'pixi.js';
import {Motion,ROUTES,solveChain} from './motion.js';
import './style.css';
const $=id=>document.getElementById(id);
const app=new Application(),scene=$('scene');
await app.init({resizeTo:scene,antialias:true,background:0xd6dfd1,resolution:Math.min(devicePixelRatio,2),autoDensity:true});
scene.appendChild(app.canvas);
const backdrop=new Graphics(),ground=new Graphics(),shadow=new Graphics(),character=new Container(),skeleton=new Graphics();
app.stage.addChild(backdrop,ground,shadow,character,skeleton);character.sortableChildren=true;
const base=import.meta.env.BASE_URL;
const response=await fetch(`${base}art/manifest.json`);
if(!response.ok){$('loading').textContent='Растровый комплект ещё не подключён.';throw new Error(`manifest: ${response.status}`);}
const manifest=await response.json(),parts=manifest.parts,byId=Object.fromEntries(parts.map(p=>[p.id,p]));
const textures=await Promise.all(parts.map(p=>Assets.load(`${base}${p.file}`))),sprites={};
parts.forEach((p,i)=>{const sprite=new Sprite(textures[i]);sprite.pivot.set(...p.pivot);sprite.zIndex=p.layer;character.addChild(sprite);sprites[p.id]=sprite;});
// Read the actual alpha footprint; no changes to Artist's PNG or manifest.
const legs=[];
for(const [side,homeX,plane,bend] of [['Left',-170,175,-1],['Right',170,175,1],['Rear',35,155,1]]){
 const upper=byId['upper'+side],lower=byId['lower'+side],foot=byId['foot'+side];
 if(!upper||!lower||!foot)throw new Error(`Missing chain ${side}`);
 const image=new Image();image.src=`${base}${foot.file}`;await image.decode();
 const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
 const context=canvas.getContext('2d',{willReadFrequently:true});context.drawImage(image,0,0);
 const pixels=context.getImageData(0,0,image.width,image.height).data,sole=[];
 for(let x=0;x<image.width;x++)for(let y=image.height-1;y>=0;y--)if(pixels[(y*image.width+x)*4+3]>=128){sole.push([x+.5-foot.pivot[0],y+1-foot.pivot[1]]);break;}
 const extent=Math.max(...sole.map(([,y])=>y));
 legs.push({id:side,upper:upper.id,lower:lower.id,foot:foot.id,homeX,homeY:plane-extent,plane,bend,sole,a:Math.hypot(...lower.joint),b:Math.hypot(...foot.joint),alpha:Math.atan2(lower.joint[1],lower.joint[0]),beta:Math.atan2(foot.joint[1],foot.joint[0])});
}
const motion=new Motion({legs,lowDepth:70,stride:72});
let paused=false,bones=false,held=new Set(),scenario=null,world={},view={},solutions={};
const eventLog=[];
function log(action){eventLog.push({time:motion.time,action});if(eventLog.length>100)eventLog.shift();}
function requestGround(state,direction=1){motion.requestGround(state,direction);for(const name of ['idle','low','move'])$(name).setAttribute('aria-pressed',String(state===name));log(state);}
function inputMove(){const direction=held.has('ArrowLeft')||held.has('KeyA')?-1:held.has('ArrowRight')||held.has('KeyD')?1:0;requestGround(direction?'move':'idle',direction||1);}
function jump(){motion.jump();log('jump');}
function pause(){paused=!paused;$('pause').setAttribute('aria-pressed',String(paused));$('pause').textContent=paused?'Продолжить · P':'Пауза · P';}
function reset(){motion.reset();held.clear();scenario=null;requestGround('idle');log('reset');render();}
for(const state of ['idle','low','move'])$(state).onclick=()=>{scenario=null;held.clear();requestGround(state);};
$('jump').onclick=()=>{scenario=null;jump();};$('pause').onclick=pause;
$('bones').onclick=()=>{bones=!bones;$('bones').setAttribute('aria-pressed',String(bones));render();};
$('reset').onclick=reset;$('step').onclick=()=>{if(!paused)pause();advance(1/60);render();};
document.querySelectorAll('[data-route]').forEach(button=>button.onclick=()=>{reset();scenario={start:motion.time,cursor:0,name:button.dataset.route};if(paused)pause();log(`route ${scenario.name}`);});
window.addEventListener('keydown',e=>{
 if(e.target instanceof HTMLInputElement||e.target instanceof HTMLSelectElement)return;
 if(['Space','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();if(e.repeat)return;
 if(['ArrowLeft','ArrowRight','KeyA','KeyD'].includes(e.code)){scenario=null;held.add(e.code);inputMove();}
 if(e.code==='Space'){scenario=null;jump();}
 if(['Digit1','Digit2','Digit3','KeyS'].includes(e.code)){scenario=null;requestGround(e.code==='Digit1'?'idle':e.code==='Digit3'?'move':'low');}
 if(e.code==='KeyP')pause();if(e.code==='KeyB')$('bones').click();if(e.code==='KeyR')reset();if(e.code==='Period')$('step').click();
});
window.addEventListener('keyup',e=>{if(held.delete(e.code))inputMove();});
window.addEventListener('blur',()=>{if(held.size){held.clear();inputMove();}});
function advance(dt){
 let remaining=dt;
 while(remaining>1e-8){const step=Math.min(remaining,1/120);
  if(scenario){const route=ROUTES[scenario.name];while(scenario.cursor<route.length&&route[scenario.cursor].at<=motion.time-scenario.start+1e-8){const e=route[scenario.cursor++];if(e.ground)requestGround(e.ground);if(e.jump)jump();}if(motion.time-scenario.start>7)scenario=null;}
  motion.update(step);remaining-=step;
 }
}
function render(){
 const w=app.screen.width,h=app.screen.height,floor=h*.84,scale=Math.min((h*.65)/300,w/650,1.12),center=w*.5;
 const palette={light:[0xd6dfd1,0xb5c7bc,0x8da69c],medium:[0x87998f,0x6c847a,0x536f64],dark:[0x253c43,0x314e51,0x244743]}[$('background').value];
 backdrop.clear().rect(0,0,w,h).fill(palette[0]).circle(w*.78,h*.22,h*.1).fill({color:0xf1e8cd,alpha:.65});
 backdrop.moveTo(0,h*.66).bezierCurveTo(w*.2,h*.52,w*.38,h*.75,w*.57,h*.62).bezierCurveTo(w*.78,h*.48,w*.87,h*.68,w,h*.57).lineTo(w,floor).lineTo(0,floor).fill(palette[1]);
 ground.clear().rect(0,floor-20*scale,w,h-floor+20*scale).fill(palette[2]);
 ground.moveTo(0,floor).lineTo(w,floor).stroke({color:0x52786c,width:2});
 for(let i=-1;i<w/75+2;i++){const x=i*75-((motion.travel*scale)%75);ground.moveTo(x,floor+17).lineTo(x+18,floor+17).stroke({color:0x66897d,width:2,alpha:.65});}
 const rootX=center,rootY=floor-175*scale;
 character.position.set(rootX,rootY);character.scale.set(scale);
 shadow.clear().ellipse(center,floor+2,135*scale,12*scale).fill({color:0x254b4b,alpha:Math.max(.06,.23-motion.height/700)});
 const angles={body:motion.pose.bodyAngle,sensor:motion.pose.sensor};
 const bodyY=motion.pose.bodyY-motion.height;
 // Body/sensor use normal parent transforms; each radial leg gets its own physical IK target.
 world={};solutions={};
 function transform(id){
  if(world[id])return world[id];const p=byId[id];
  const parent=p.parent?transform(p.parent):{x:0,y:bodyY,angle:0};
  const c=Math.cos(parent.angle),s=Math.sin(parent.angle);
  return world[id]={x:parent.x+p.joint[0]*c-p.joint[1]*s,y:parent.y+p.joint[0]*s+p.joint[1]*c,angle:parent.angle+(angles[id]??0)};
 }
 transform('body');
 for(const leg of legs){
  const upper=byId[leg.upper],parent=transform(upper.parent),c=Math.cos(parent.angle),s=Math.sin(parent.angle);
  const hip={x:parent.x+upper.joint[0]*c-upper.joint[1]*s,y:parent.y+upper.joint[0]*s+upper.joint[1]*c};
  const target=motion.foot(leg),solved=solveChain(target.x-hip.x,target.y-hip.y,leg.a,leg.b,leg.bend);
  angles[leg.upper]=solved.first-leg.alpha-parent.angle;
  angles[leg.lower]=solved.second+leg.alpha-leg.beta;
  angles[leg.foot]=-(solved.first+solved.second-leg.beta);
  solutions[leg.id]={...solved,target,hip};
 }
 for(const p of parts){const t=transform(p.id);sprites[p.id].position.set(t.x,t.y);sprites[p.id].rotation=t.angle;}
 view={floor,rootX,rootY,scale,bodyY,renderedSoleGap:{},planes:{},characterBounds:{x:character.getBounds().x,y:character.getBounds().y,width:character.getBounds().width,height:character.getBounds().height}};
 for(const leg of legs){const foot=world[leg.foot],extent=Math.max(...leg.sole.map(([x,y])=>x*Math.sin(foot.angle)+y*Math.cos(foot.angle)));view.renderedSoleGap[leg.id]=(leg.plane-foot.y-extent)*scale;view.planes[leg.id]=rootY+leg.plane*scale;
  const x=rootX+foot.x*scale,y=rootY+leg.plane*scale;
  ground.moveTo(x-22*scale,y).lineTo(x+22*scale,y).stroke({color:0x395c52,width:2,alpha:.6});
 }
 skeleton.clear();
 if(bones)for(const p of parts){const t=world[p.id],parent=p.parent&&world[p.parent],x=rootX+t.x*scale,y=rootY+t.y*scale;if(parent)skeleton.moveTo(rootX+parent.x*scale,rootY+parent.y*scale).lineTo(x,y).stroke({color:0xffe970,width:2});skeleton.circle(x,y,3.5).fill(0xed5343);}
 const labels={idle:'покой',low:'низкая поза',move:'три опоры: шаг',prepare:'сжатие',flight:'полёт',land:'приземление'};
 $('status').textContent=`${labels[motion.state]} → ${labels[motion.ground]} · ${paused?'пауза':'время идёт'}\nt = ${motion.time.toFixed(3)} с · фаза ${motion.phase.toFixed(3)} · высота ${motion.height.toFixed(1)}\nкорпус ↓ ${motion.pose.bodyY.toFixed(1)} · прыжки ${motion.jumpCount}/${motion.landCount}\n3 радиальные цепи · ${parts.length} частей · единый переход целей + IK`;
}
$('loading').remove();
app.ticker.add(ticker=>{if(!paused)advance(Math.min(ticker.deltaMS/1000,.05)*Number($('speed').value));render();});
window.__R4D={snapshot:()=>({...motion.snapshot(),paused,bones,partCount:parts.length,world:structuredClone(world),solutions:structuredClone(solutions),view:structuredClone(view),inputs:[...eventLog]}),setPaused:value=>{if(paused!==value)pause();},step:(dt=1/60)=>{advance(dt);render();},reset,manifest};
render();

