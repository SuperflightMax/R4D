import * as PIXI from './vendor/pixi.js';
import {transform,boundsOf,contain} from './view-math.js';
import {makeRun,checkpoint,importCheckpoint,uintSeed} from './run-model.js';

const $=id=>document.getElementById(id);
const json=async url=>{const response=await fetch(url);if(!response.ok)throw Error(`${url}: HTTP ${response.status}`);return response.json();};
const [baseline,manifest,projection,build,assets,replays]=await Promise.all(['data/config.json','data/manifest.json','data/projection.json','build.json','assets/artist/assets.json','replays/index.json'].map(json));
const viewport=$('viewport');
const app=new PIXI.Application();
await app.init({width:viewport.clientWidth,height:viewport.clientHeight,background:0x0a100d,antialias:true,resolution:Math.min(devicePixelRatio,2),autoDensity:true,preference:'webgl',autoStart:false});
viewport.appendChild(app.canvas);
const root=new PIXI.Container();app.stage.addChild(root);
const backgroundLayer=new PIXI.Container(),shadowLayer=new PIXI.Container(),shadowOcclusionLayer=new PIXI.Container(),ballLayer=new PIXI.Container(),occlusionLayer=new PIXI.Container(),geometry=new PIXI.Graphics();
root.addChild(backgroundLayer,shadowLayer,shadowOcclusionLayer,ballLayer,occlusionLayer,geometry);
let run,tick=0,playing=false,lastFrame=0,accumulator=0,view='source',framing='whole',zoom=1;
let ballMesh,shadowMesh;
const staticMeshes=[],occluders=[];
const sourceTexture=await PIXI.Assets.load('./assets/source.jpg');
const sourceImage=sourceTexture.source.resource;
const forward=manifest.projection.nativeToSource,inverse=manifest.projection.sourceToNative;
const sourceToView=p=>view==='source'?p:transform(inverse,p);
const nativeToView=p=>view==='source'?transform(forward,p):p;

function grid(texture,rect,cells=1){
 const [x,y,w,h]=rect,positions=[],uvs=[],indices=[];
 for(let row=0;row<=cells;row++)for(let col=0;col<=cells;col++){positions.push(x+w*col/cells,y+h*row/cells);uvs.push(col/cells,row/cells);if(row<cells&&col<cells){const a=row*(cells+1)+col,b=a+1,c=a+cells+1,d=c+1;indices.push(a,b,d,a,d,c);}}
 const mesh=new PIXI.MeshSimple({texture,vertices:new Float32Array(positions),uvs:new Float32Array(uvs),indices:new Uint32Array(indices)});
 const result={mesh,sourcePositions:positions};updateMesh(result);return result;
}
function updateMesh(item){
 const vertices=item.mesh.vertices;
 for(let i=0;i<vertices.length;i+=2){const p=sourceToView({x:item.sourcePositions[i],y:item.sourcePositions[i+1]});vertices[i]=p.x;vertices[i+1]=p.y;}
 item.mesh.vertices=vertices;
}
const background=grid(sourceTexture,[0,0,1536,1536],96);staticMeshes.push(background);backgroundLayer.addChild(background.mesh);

async function loadArtist(){
 if(assets.schema!=='r4d-p3-assets-v1'||JSON.stringify(assets.sourceSize)!=='[1536,1536]')throw Error('Неподдерживаемый формат ассетов');
 for(const item of assets.occluders){
  const maskTexture=await PIXI.Assets.load('./assets/artist/'+item.path),[x,y,w,h]=item.rectPx;
  if(maskTexture.width!==w||maskTexture.height!==h)throw Error(`${item.id}: размер маски отличается от rectPx`);
  const canvas=document.createElement('canvas');canvas.width=w;canvas.height=h;
  const context=canvas.getContext('2d');context.drawImage(sourceImage,x,y,w,h,0,0,w,h);context.globalCompositeOperation='destination-in';context.drawImage(maskTexture.source.resource,0,0);
  const texture=PIXI.Texture.from(canvas);
  const overlay=grid(texture,item.rectPx,Math.max(2,Math.ceil(Math.max(w,h)/24)));
  const shadowOverlay=grid(texture,item.rectPx,Math.max(2,Math.ceil(Math.max(w,h)/24)));
  staticMeshes.push(overlay,shadowOverlay);occlusionLayer.addChild(overlay.mesh);shadowOcclusionLayer.addChild(shadowOverlay.mesh);occluders.push({...item,...overlay,shadowOverlay});
 }
 if(assets.ball){const texture=await PIXI.Assets.load('./assets/artist/'+assets.ball.path);ballMesh=grid(texture,[0,0,1,1],6);ballLayer.addChild(ballMesh.mesh);}
 if(assets.shadow){const texture=await PIXI.Assets.load('./assets/artist/'+assets.shadow.path);shadowMesh=grid(texture,[0,0,1,1],6);shadowMesh.mesh.alpha=assets.shadow.alpha??1;shadowLayer.addChild(shadowMesh.mesh);}
}
await loadArtist();

function depthAt(item,x){
 if(item.depthLineNative){const [[x1,y1],[x2,y2]]=item.depthLineNative;const t=x1===x2?0:Math.max(0,Math.min(1,(x-x1)/(x2-x1)));return y1+t*(y2-y1);}
 return item.depthNativeY;
}
function projectedRadius(p,r){const center=transform(forward,p),left=transform(forward,{x:p.x-r,y:p.y}),right=transform(forward,{x:p.x+r,y:p.y});return Math.hypot(right.x-left.x,right.y-left.y)/2;}
function updateBallMesh(){
 const pos=run.states[tick].ball.pos,r=baseline.board.ball.r;
 if(ballMesh){
  const definition=assets.ball,texture=ballMesh.mesh.texture,radius=projectedRadius(pos,r),center=transform(forward,pos);
  const scale=radius/definition.radiusPx,anchor=definition.anchorPx,lift=definition.liftRadius??0.65;
  const x=center.x-anchor[0]*scale,y=center.y-anchor[1]*scale-radius*lift;
  const positions=ballMesh.sourcePositions,cells=Math.sqrt(positions.length/2)-1;
  for(let row=0;row<=cells;row++)for(let col=0;col<=cells;col++){const i=(row*(cells+1)+col)*2;positions[i]=x+texture.width*scale*col/cells;positions[i+1]=y+texture.height*scale*row/cells;}
  updateMesh(ballMesh);
 }
 if(shadowMesh){
  const definition=assets.shadow,offset=definition.offsetRadius??[0.35,0.4],scale=definition.scaleRadius??[1.15,0.42],anchor=definition.anchorPx,texture=shadowMesh.mesh.texture;
  const positions=shadowMesh.sourcePositions,cells=Math.sqrt(positions.length/2)-1;
  for(let row=0;row<=cells;row++)for(let col=0;col<=cells;col++){
   const point=transform(forward,{x:pos.x+offset[0]*r+(texture.width*col/cells-anchor[0])/definition.radiusPx*r*scale[0],y:pos.y+offset[1]*r+(texture.height*row/cells-anchor[1])/definition.radiusPx*r*scale[1]});
   const i=(row*(cells+1)+col)*2;positions[i]=point.x;positions[i+1]=point.y;
  }updateMesh(shadowMesh);
 }
}
function line(points,color,width=1.7,closed=false){
 const first=nativeToView(points[0]);geometry.moveTo(first.x,first.y);
 for(const point of points.slice(1)){const p=nativeToView(point);geometry.lineTo(p.x,p.y);}
 if(closed)geometry.closePath();geometry.stroke({color,width:width/Math.max(root.scale.x,1e-6)});
}
function circle(x,y,r,color,width=1.7){const points=[];for(let i=0;i<64;i++){const a=i*Math.PI*2/64;points.push({x:x+Math.cos(a)*r,y:y+Math.sin(a)*r});}line(points,color,width,true);}
function drawGeometry(){
 geometry.clear();
 const show=$('geometry').checked,showDiagnostic=!$('art').checked||!ballMesh;
 if(show){
  for(const pin of run.config.board.pins)circle(pin.x,pin.y,pin.r,0x7df7ff);
  for(const segment of run.config.board.segments)line([{x:segment.x1,y:segment.y1},{x:segment.x2,y:segment.y2}],0xffc562,2.1);
  for(const bucket of run.config.board.buckets)circle(bucket.x,bucket.y,bucket.r,0xf5a5ff,2);
  for(const drop of run.config.board.drops){line([{x:drop.x-12,y:drop.y},{x:drop.x+12,y:drop.y}],0xffffff,2);line([{x:drop.x,y:drop.y-12},{x:drop.x,y:drop.y+12}],0xffffff,2);}
 }
 if(show||showDiagnostic){const pos=run.states[tick].ball.pos;circle(pos.x,pos.y,run.config.board.ball.r,0xffffff,2.6);}
}
function fit(){
 const points=framing==='whole'?(view==='source'?[[0,0],[1536,0],[1536,1536],[0,1536]]:manifest.projection.wholeSourceNativePolygon):[...manifest.projection.playableFloorNativePolygon,...baseline.board.buckets.flatMap(b=>[[b.x-b.r,b.y-b.r],[b.x+b.r,b.y+b.r]])].map(([x,y])=>{const p=nativeToView({x,y});return[p.x,p.y];});
 const bounds=boundsOf(points.map(([x,y])=>({x,y}))),frame=contain(bounds,app.screen.width,app.screen.height);
 const scale=frame.scale*zoom;root.scale.set(scale);root.position.set(app.screen.width/2-(bounds.minX+bounds.maxX)/2*scale,app.screen.height/2-(bounds.minY+bounds.maxY)/2*scale);
}
function render(){
 if(!run)return;
 const art=$('art').checked,pos=run.states[tick].ball.pos;
 backgroundLayer.visible=art;shadowLayer.visible=art;shadowOcclusionLayer.visible=art;ballLayer.visible=art;occlusionLayer.visible=art;
 const shadowOffset=assets.shadow?.offsetRadius??[0.35,0.4],radius=baseline.board.ball.r;
 const shadowPosition={x:pos.x+shadowOffset[0]*radius,y:pos.y+shadowOffset[1]*radius};
 for(const item of occluders){item.mesh.visible=pos.y<depthAt(item,pos.x);item.shadowOverlay.mesh.visible=shadowPosition.y<depthAt(item,shadowPosition.x);}
 updateBallMesh();drawGeometry();app.render();
 $('seek').value=tick;$('tick').value=tick;$('time').textContent=`/ ${run.lastTick} · ${(tick*baseline.defaults.tickMs/1000).toFixed(3)} с`;
 $('play').textContent=playing?'Пауза':'Пуск';
 const result=run.states[tick].result;
 $('summary').textContent=`Seed ${run.seed} · тик ${tick}\n${result?result.kind+(result.bucketId?' · '+result.bucketId:''):(playing?'Движение':'Пауза')}`;
 $('state').textContent=JSON.stringify(run.states[tick],null,2);
}
function setRun(seed,play=false){
 run=makeRun(baseline,uintSeed(seed));tick=0;playing=play;accumulator=0;lastFrame=performance.now();
 $('seed').value=run.seed;$('seek').max=run.lastTick;$('tick').max=run.lastTick;
 $('contacts').replaceChildren();
 for(const hit of run.hits){const button=document.createElement('button');button.className='hit';button.textContent=`тик ${hit.tick} · ${hit.objectKind}: ${hit.objectId}`;button.onclick=()=>seek(Math.max(0,hit.tick-1));$('contacts').appendChild(button);}
 render();
}
function seek(value){const selected=Number(value);if(!Number.isInteger(selected))throw Error('Тик должен быть целым');tick=Math.max(0,Math.min(run.lastTick,selected));playing=false;accumulator=0;render();}
function message(text,error=false){$('message').textContent=text;$('message').style.color=error?'#ffb3a5':'';}
function action(fn){return async()=>{try{await fn();}catch(error){message(error.message,true);}};}
$('random').onclick=action(()=>{const buffer=new Uint32Array(1);crypto.getRandomValues(buffer);setRun(buffer[0],true);message('Новый обычный seed. Общие физические настройки сохранены.');});
$('replay').onclick=action(()=>{setRun($('seed').value,true);message('Повтор seed с исходного состояния.');});
$('play').onclick=()=>{if(tick===run.lastTick)tick=0;playing=!playing;lastFrame=performance.now();accumulator=0;render();};
$('step').onclick=()=>seek(tick+1);$('step10').onclick=()=>seek(tick+10);
$('seek').oninput=()=>seek($('seek').value);$('tick').oninput=action(()=>seek($('tick').value));
for(const id of ['art','geometry'])$(id).onchange=render;
$('view').onchange=()=>{view=$('view').value;for(const mesh of staticMeshes)updateMesh(mesh);fit();render();};
$('framing').onchange=()=>{framing=$('framing').value;fit();render();};
$('zoom').onchange=()=>{zoom=Number($('zoom').value);fit();render();};
$('download').onclick=action(()=>{
 const data=checkpoint(run,tick,build),blob=new Blob([JSON.stringify(data,null,2)+'\n'],{type:'application/json'}),url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`p3-${build.board}-seed-${run.seed}-tick-${tick}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);message('Checkpoint сохранён браузером.');
});
$('import').onchange=action(async()=>{
 const file=$('import').files[0];if(!file)return;
 const result=importCheckpoint(JSON.parse(await file.text()),baseline,build);setRun(result.run.seed,false);seek(result.tick);message('Checkpoint воспроизведён настоящим ядром; точное состояние совпало.');$('import').value='';
});
for(const saved of replays.runs){
 const row=document.createElement('p'),button=document.createElement('button'),link=document.createElement('a');
 button.className='hit';button.textContent=`${saved.seed} · ${saved.result.kind}${saved.result.bucketId?' · '+saved.result.bucketId:''}`;
 button.onclick=()=>{setRun(saved.seed,true);message(saved.label);};
 link.href='./'+saved.path;link.download='';link.textContent='Checkpoint JSON';row.append(button,link);$('replays').appendChild(row);
}
for(const saved of replays.frames){
 const row=document.createElement('p'),button=document.createElement('button'),link=document.createElement('a');
 button.className='hit';button.textContent=`${saved.label} · тик ${saved.tick}`;
 button.onclick=()=>{setRun(saved.seed,false);seek(saved.tick);message('Сохранённый кадр обычного запуска; +1 тик показывает соседнее состояние.');};
 link.href='./'+saved.path;link.download='';link.textContent='Checkpoint JSON';row.append(button,link);$('replays').appendChild(row);
}
let drag=null;
app.canvas.style.cursor='grab';app.canvas.style.touchAction='none';
app.canvas.addEventListener('pointerdown',event=>{drag={x:event.clientX,y:event.clientY};app.canvas.setPointerCapture(event.pointerId);app.canvas.style.cursor='grabbing';});
app.canvas.addEventListener('pointermove',event=>{if(!drag)return;root.position.x+=event.clientX-drag.x;root.position.y+=event.clientY-drag.y;drag={x:event.clientX,y:event.clientY};app.render();});
const endDrag=()=>{drag=null;app.canvas.style.cursor='grab';};
app.canvas.addEventListener('pointerup',endDrag);app.canvas.addEventListener('pointercancel',endDrag);app.canvas.addEventListener('lostpointercapture',endDrag);
new ResizeObserver(()=>{app.renderer.resize(viewport.clientWidth,viewport.clientHeight);fit();render();}).observe(viewport);
$('version').textContent=`Core ${build.coreCommit.slice(0,12)} · P1 ${build.p1Commit.slice(0,12)} · Pixi ${build.pixi} · source ${build.sourceCommit.slice(0,12)} · масок ${occluders.length}`;
fit();setRun(baseline.rng.seed,false);
message(ballMesh?`Сцена загружена: ${occluders.length} масок. Художественное качество проверяется отдельно.`:'Диагностический checkpoint: настоящий core/config/projection; художественные ball/shadow и маски ещё не подключены.');
function frame(now){
 if(playing){
  accumulator+=Math.max(0,Math.min(now-lastFrame,250));
  const steps=Math.floor(accumulator/baseline.defaults.tickMs);
  if(steps>0){accumulator-=steps*baseline.defaults.tickMs;tick=Math.min(run.lastTick,tick+steps);if(tick===run.lastTick)playing=false;render();}
 }lastFrame=now;requestAnimationFrame(frame);
}requestAnimationFrame(frame);
// Small read-only inspection surface for reproducible QA; no state patching.
window.p3=Object.freeze({snapshot:()=>checkpoint(run,tick,build),runInfo:()=>({seed:run.seed,lastTick:run.lastTick,result:structuredClone(run.result),hits:structuredClone(run.hits)}),versions:structuredClone(build)});
