import {bind,poseAt,mapPoint,clamp,setMeasuredBind} from './pose.js';
const {Application,Container,Graphics,Mesh,MeshGeometry,Assets}=PIXI;
const app=new Application();
await app.init({width:900,height:720,backgroundAlpha:0,antialias:true,preserveDrawingBuffer:true,preference:'webgl'});
document.querySelector('#stage').appendChild(app.canvas);
const world=new Container();app.stage.addChild(world);
function resize(){const width=document.querySelector('#stage').clientWidth,height=Math.max(300,Math.min(684,window.innerHeight-250));app.renderer.resize(width,height);const scale=Math.min(2/3,height/1024,width/850);world.scale.set(scale);world.position.set((width-1024*scale)/2,0)}
resize();window.addEventListener('resize',resize);
const surfaces=new Container(),guides=new Graphics();world.addChild(surfaces,guides);
const status=document.querySelector('#status'),scrub=document.querySelector('#scrub');
let q=0,target=0,velocity=0,paused=false,time=0,realArt=false,dark=false,manifest=null;
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
    const mesh=new Mesh({geometry,texture});surfaces.addChild(mesh);meshes.push({id,mesh,points});
  }
  realArt=true;status.textContent=`Диагностическая растровая сборка · ${manifest.version} · отклонения от контракта сохранены; художественная оценка ожидается`;
  document.querySelector('#guides').checked=false;
}
document.querySelector('#guides').checked=true;
function command(t){target=t;paused=false;updateButtons()}
function updateButtons(){document.querySelector('#pause').textContent=paused?'Продолжить':'Пауза';for(const id of ['idle','low'])document.querySelector('#'+id).setAttribute('aria-pressed',String(target===(id==='low'?1:0)))}
document.querySelector('#idle').onclick=()=>command(0);
document.querySelector('#low').onclick=()=>command(1);
document.querySelector('#pause').onclick=()=>{paused=!paused;updateButtons()};
document.querySelector('#background').onclick=()=>{dark=!dark;document.body.classList.toggle('dark',dark);document.querySelector('#background').textContent=dark?'Светлый фон':'Тёмный фон'};
scrub.oninput=()=>{q=Number(scrub.value);target=q;velocity=0;paused=true;updateButtons();render()};

function render(){
  const pose=poseAt(q,time);
  for(const {id,mesh,points} of meshes){const mode=document.querySelector('#surface').value;mesh.visible=mode==='all'||id===mode||(mode==='pelvis'&&(id==='body'||id==='leg_near'));const data=mesh.geometry.getBuffer('aPosition').data;for(let i=0;i<points.length;i++)data.set(mapPoint(id,points[i],pose),i*2);mesh.geometry.getBuffer('aPosition').update()}
  guides.clear();
  // Ground is a viewer guide, not character artwork.
  guides.moveTo(120,bind.ground+1).lineTo(920,bind.ground+1).stroke({color:dark?0x879998:0x9b9e8c,width:1.5});
  if(document.querySelector('#guides').checked){
    for(const side of ['far','near']){const p=pose[side],color=side==='near'?0xc56a29:0x5e84b5;for(const chain of [['hip','knee','ankle'],['shoulder','elbow','wrist']]){guides.moveTo(...p[chain[0]]);for(const k of chain.slice(1))guides.lineTo(...p[k]);guides.stroke({color,width:3});for(const k of chain)guides.circle(...p[k],4).fill(color)}}
    guides.moveTo(...pose.pelvis).lineTo(...pose.waist).lineTo(...pose.neck).stroke({color:0x759452,width:4});
  }
  scrub.value=String(q);document.querySelector('#amount').value=`${Math.round(q*100)}%`;
  app.renderer.render(app.stage);
}
await loadArt().catch(e=>{status.textContent='Ошибка сборки: '+e.message;console.error(e)});
updateButtons();render();
app.ticker.add(ticker=>{
  const dt=Math.min(ticker.deltaMS/1000,0.04);
  if(!paused){time+=dt;const acceleration=40*(target-q)-13*velocity;velocity+=acceleration*dt;q=clamp(q+velocity*dt,0,1);if(Math.abs(q-target)<0.0001&&Math.abs(velocity)<0.001){q=target;velocity=0}}
  render();
});
// Read-only observations for reproducible self-checks; commands use the UI.
window.q2a={get state(){return {q,target,velocity,paused,time,realArt,version:manifest?.version,pose:poseAt(q,time)}},app};
