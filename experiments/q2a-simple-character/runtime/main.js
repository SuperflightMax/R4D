import {bind,poseAt,mapPoint,clamp,setMeasuredBind} from './pose.js';
import {Motion} from './motion.js';
const {Application,Container,Graphics,Mesh,MeshGeometry,Assets}=PIXI;
const app=new Application();
await app.init({width:900,height:720,backgroundAlpha:0,antialias:true,preserveDrawingBuffer:true,preference:'webgl'});
document.querySelector('#stage').appendChild(app.canvas);
const world=new Container();app.stage.addChild(world);
function resize(){const width=document.querySelector('#stage').clientWidth,height=Math.max(300,Math.min(684,window.innerHeight-250));app.renderer.resize(width,height);const scale=Math.min(2/3,height/1024,width/850);world.scale.set(scale);world.position.set((width-1024*scale)/2,0)}
resize();window.addEventListener('resize',resize);
const surfaces=new Container(),guides=new Graphics();world.addChild(surfaces,guides);
const status=document.querySelector('#status'),scrub=document.querySelector('#scrub');
let paused=false,realArt=false,dark=false,manifest=null,motion=null,history=[],cursor=0,accumulator=0;
const meshes=[];
const order=['arm_far','hand_far','leg_far','foot_far','body','leg_near','foot_near','arm_near','hand_near','head'];

async function loadArt(){
  const response=await fetch('/runtime/art-binding.json');
  if(response.status===404){status.textContent='Техническая настройка: новый растровый комплект ещё не передан. Художественная сборка отсутствует.';return;}
  if(!response.ok)throw Error(`Передача арта: HTTP ${response.status}`);
  manifest=await response.json();
  if(!manifest.parts){status.textContent='Техническая настройка: новый растровый комплект ещё не передан. Художественная сборка отсутствует.';return;}
  if(manifest.rig)setMeasuredBind(manifest.rig);
  for(const id of order){
    const part=manifest.parts[id];
    if(!part)throw Error(`В передаче нет ${id}`);
    const texture=await Assets.load(part.url);
    const w=texture.width,h=texture.height,step=12*manifest.scale;
    const nx=Math.ceil(w/step)+1,ny=Math.ceil(h/step)+1;
    const positions=new Float32Array(nx*ny*2),uvs=new Float32Array(nx*ny*2),points=[];
    for(let y=0;y<ny;y++)for(let x=0;x<nx;x++){
      const i=y*nx+x,lx=x*w/(nx-1),ly=y*h/(ny-1);
      const p=[(lx+part.crop[0]-manifest.translation[0])/manifest.scale-part.offset[0],(ly+part.crop[1]-manifest.translation[1])/manifest.scale-part.offset[1]];
      points.push(p);positions.set(p,i*2);uvs.set([x/(nx-1),y/(ny-1)],i*2);
    }
    const indices=[];
    for(let y=0;y<ny-1;y++)for(let x=0;x<nx-1;x++){const i=y*nx+x;indices.push(i,i+1,i+nx,i+1,i+nx+1,i+nx)}
    const geometry=new MeshGeometry({positions,uvs,indices:new Uint32Array(indices)});
    const mesh=new Mesh({geometry,texture});mesh.label=id;surfaces.addChild(mesh);meshes.push({id,mesh,points});
  }
  realArt=true;status.textContent=`Диагностическая растровая сборка · ${manifest.version} · отклонения от контракта сохранены; художественная оценка ожидается`;
  motion=new Motion();history=[motion.save()];
  document.querySelector('#guides').checked=false;
}
document.querySelector('#guides').checked=true;
function command(action){if(!motion)return;history=history.slice(0,cursor+1);motion.command(action);paused=false;updateButtons()}
function updateButtons(){document.querySelector('#pause').textContent=paused?'Продолжить':'Пауза';for(const id of ['idle','low','walk'])document.querySelector('#'+id).setAttribute('aria-pressed',String(motion?.s.goal===id));document.querySelector('#jump').setAttribute('aria-pressed',String(motion&&motion.s.stage!=='ground'))}
for(const id of ['idle','low','walk','jump'])document.querySelector('#'+id).onclick=()=>command(id);
document.querySelector('#pause').onclick=()=>{if(!paused)paused=true;else{history=history.slice(0,cursor+1);paused=false}updateButtons()};
document.querySelector('#background').onclick=()=>{dark=!dark;document.body.classList.toggle('dark',dark);document.querySelector('#background').textContent=dark?'Светлый фон':'Тёмный фон'};
scrub.oninput=()=>{if(!motion)return;cursor=Number(scrub.value);motion.restore(history[cursor]);paused=true;updateButtons();render()};

function render(){
  if(!motion)return;
  const pose=motion.pose();world.x=(app.renderer.width-1024*world.scale.x)/2-pose.originX*world.scale.x;
  for(const {id,mesh,points} of meshes){const mode=document.querySelector('#surface').value;mesh.visible=mode==='all'||id===mode||(mode==='pelvis'&&(id==='body'||id==='leg_near'))||(mode==='pelvis_far'&&(id==='body'||id==='leg_far'));const data=mesh.geometry.getBuffer('aPosition').data;for(let i=0;i<points.length;i++)data.set(mapPoint(id,points[i],pose),i*2);mesh.geometry.getBuffer('aPosition').update()}
  guides.clear();
  // Ground is a viewer guide, not character artwork.
  const left=pose.originX-200,right=pose.originX+1200;
  guides.moveTo(left,bind.ground+1).lineTo(right,bind.ground+1).stroke({color:dark?0x879998:0x9b9e8c,width:1.5});
  for(let x=Math.floor(left/60)*60;x<right;x+=60)guides.moveTo(x,bind.ground+1).lineTo(x-9,bind.ground+10).stroke({color:dark?0x879998:0x9b9e8c,width:1});
  if(document.querySelector('#guides').checked){
    for(const side of ['far','near']){const p=pose[side],color=side==='near'?0xc56a29:0x5e84b5;for(const chain of [['hip','knee','ankle'],['shoulder','elbow','wrist']]){guides.moveTo(...p[chain[0]]);for(const k of chain.slice(1))guides.lineTo(...p[k]);guides.stroke({color,width:3});for(const k of chain)guides.circle(...p[k],4).fill(color)}}
    guides.moveTo(...pose.pelvis).lineTo(...pose.waist).lineTo(...pose.neck).stroke({color:0x759452,width:4});
  }
  scrub.max=String(history.length-1);scrub.value=String(cursor);document.querySelector('#amount').value=`${motion.s.time.toFixed(1)} с`;
  const names={ground:'На земле',prepare:'Подготовка',push:'Толчок',flight:'Полёт',land:'Принятие веса',idle:'Стойка',low:'Низкая поза',walk:'Ходьба'};
  document.querySelector('#motionstate').textContent=`${names[motion.s.stage]} · ${names[motion.s.goal]}${motion.s.stage!=='ground'?' после посадки':''}`;
  app.renderer.render(app.stage);
}
await loadArt().catch(e=>{status.textContent='Ошибка сборки: '+e.message;console.error(e)});
updateButtons();render();
app.ticker.add(ticker=>{
  const dt=Math.min(ticker.deltaMS/1000,0.04);
  if(!paused&&motion){accumulator+=dt;while(accumulator>=1/120){motion.tick(1/120);accumulator-=1/120;history.push(motion.save());if(history.length>3601)history.shift();cursor=history.length-1}updateButtons()}
  render();
});
// Read-only observations for reproducible self-checks; commands use the UI.
window.q2a={get state(){return {q:motion?.s.q,paused,time:motion?.s.time,realArt,version:manifest?.version,motion:motion?.save(),cursor,historyLength:history.length,pose:motion?.pose()}},app};
