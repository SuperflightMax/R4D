import { Application,Container,Graphics,Sprite,Assets,Mesh,MeshGeometry } from 'pixi.js';
import * as core from '@millionko/sim-core';
import { project } from '../inputs/projection.mjs';
import { RunController } from './controller.mjs';

const $=id=>document.getElementById(id);
const [configSourceText,manifest,meta,draft] = await Promise.all(['config.json','manifest.json','build-meta.json','geometry.json'].map((p,i)=>fetch(p).then(r=>i===0?r.text():r.json())));
const config=JSON.parse(configSourceText);
const run=new RunController(core,config,meta,configSourceText);
const M=manifest.projection.nativeToSource, inverse=manifest.projection.sourceToNative;
const app=new Application();
await app.init({width:1536,height:1536,antialias:true,background:'#1a3030',preference:'webgl',resolution:1});
$('stage').appendChild(app.canvas);
const scene=new Container();app.stage.addChild(scene);
const artistic=new Container(), ground=new Container(), shadowGround=new Container(), bodiesBelow=new Container(), ballLayer=new Container(),bodiesAbove=new Container(),geometry=new Graphics();
artistic.addChild(ground,shadowGround,bodiesBelow,ballLayer,bodiesAbove);scene.addChild(artistic,geometry);
let flat=false,artist=null,artistLayers=[],ballSprite=null,shadowSprite=null,frameAccumulator=0,lastEvents='';
const diagnosticBall=new Graphics();scene.addChild(diagnosticBall,geometry);
const map=p=>project(M,p);
const sourcePoint=(p)=>flat?project(inverse,p):p;
const nativePoint=p=>flat?p:map(p);
function pathGraphic(g,points,color,width=2,alpha=1,close=false){
  if(!points.length)return;g.moveTo(...points[0]);for(const p of points.slice(1))g.lineTo(...p);if(close)g.closePath();g.stroke({color,width,alpha});
}
function circleNative(g,o,color,width=2){const poly=Array.from({length:96},(_,i)=>nativePoint([o.x+o.r*Math.cos(i*Math.PI/48),o.y+o.r*Math.sin(i*Math.PI/48)]));pathGraphic(g,poly,color,width,1,true);}
const backgroundTexture=await Assets.load('geometry-draft.png');
function fullImage(texture){
  if(!flat){const sp=new Sprite(texture);sp.width=1536;sp.height=1536;return sp;}
  const cells=48,positions=[],uvs=[],indices=[];
  for(let row=0;row<=cells;row++)for(let col=0;col<=cells;col++){
    positions.push(...project(inverse,[1536*col/cells,1536*row/cells]));uvs.push(col/cells,row/cells);
    if(row<cells&&col<cells){const a=row*(cells+1)+col,b=a+1,c=a+cells+1,d=c+1;indices.push(a,b,d,a,d,c);}
  }
  return new Mesh({geometry:new MeshGeometry({positions:new Float32Array(positions),uvs:new Float32Array(uvs),indices:new Uint32Array(indices)}),texture});
}
function fitScene(){
  if(!flat){scene.scale.set(1);scene.position.set(0);return;}
  const poly=manifest.projection.wholeSourceNativePolygon;
  const minX=Math.min(...poly.map(p=>p[0])),maxX=Math.max(...poly.map(p=>p[0])),minY=Math.min(...poly.map(p=>p[1])),maxY=Math.max(...poly.map(p=>p[1]));
  const s=Math.min(1500/(maxX-minX),1500/(maxY-minY));scene.scale.set(s);scene.position.set((1536-(maxX-minX)*s)/2-minX*s,(1536-(maxY-minY)*s)/2-minY*s);
}
function uniformRadius(p,r){const a=map([p[0]-r,p[1]]),b=map([p[0]+r,p[1]]);return Math.hypot(b[0]-a[0],b[1]-a[1])/2;}
async function makeLayer(layer){
  const tex=await Assets.load('artist/'+layer.texture);let sp;
  if(!layer.rect&&(!layer.anchor||layer.fullFrame)){sp=fullImage(tex);}
  else if(flat){
    // Rect textures are a projected source-image patch, including exact projective corners.
    const rect=layer.rect??[layer.anchor[0]-layer.textureAnchor[0],layer.anchor[1]-layer.textureAnchor[1],tex.width,tex.height];
    const cells=12,positions=[],uvs=[],indices=[];
    for(let row=0;row<=cells;row++)for(let col=0;col<=cells;col++){
      positions.push(...project(inverse,[rect[0]+rect[2]*col/cells,rect[1]+rect[3]*row/cells]));uvs.push(col/cells,row/cells);
      if(row<cells&&col<cells){const a=row*(cells+1)+col,b=a+1,c=a+cells+1,d=c+1;indices.push(a,b,d,a,d,c);}
    }
    sp=new Mesh({geometry:new MeshGeometry({positions:new Float32Array(positions),uvs:new Float32Array(uvs),indices:new Uint32Array(indices)}),texture:tex});
  }else{sp=new Sprite(tex);if(layer.rect){sp.position.set(layer.rect[0],layer.rect[1]);sp.width=layer.rect[2];sp.height=layer.rect[3];}else{sp.position.set(layer.anchor[0]-layer.textureAnchor[0],layer.anchor[1]-layer.textureAnchor[1]);}}
  sp.alpha=layer.opacity??1;sp.zIndex=layer.order??layer.nativeBase?.[1]??0;return sp;
}
async function rebuildArt(){
  for(const c of [ground,shadowGround,bodiesBelow,bodiesAbove,ballLayer])c.removeChildren().forEach(child=>child.destroy({children:true}));
  artistLayers=[];ballSprite=null;shadowSprite=null;
  if(!artist){ground.addChild(fullImage(backgroundTexture));return;}
  for(const layer of artist.layers){
    const sp=await makeLayer(layer);
    if(layer.role==='background'||layer.role==='ground-shadow')ground.addChild(sp);
    else artistLayers.push({layer,sp});
  }
  if(artist.ball){
    ballSprite=new Sprite(await Assets.load('artist/'+artist.ball.texture));ballLayer.addChild(ballSprite);
    ballSprite.alpha=artist.ball.opacity??1;
    if(artist.ball.shadow){
      const tex=await Assets.load('artist/'+artist.ball.shadow.texture),cells=8,uvs=[],indices=[];
      for(let row=0;row<=cells;row++)for(let col=0;col<=cells;col++){
        uvs.push(col/cells,row/cells);
        if(row<cells&&col<cells){const a=row*(cells+1)+col,b=a+1,c=a+cells+1,d=c+1;indices.push(a,b,d,a,d,c);}
      }
      shadowSprite=new Mesh({geometry:new MeshGeometry({positions:new Float32Array(uvs.length),uvs:new Float32Array(uvs),indices:new Uint32Array(indices)}),texture:tex});shadowGround.addChild(shadowSprite);
    }
  }
}
function inPolygon(p,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){
  const [xi,yi]=poly[i],[xj,yj]=poly[j];if((yi>p[1])!==(yj>p[1])&&p[0]<(xj-xi)*(p[1]-yi)/(yj-yi)+xi)inside=!inside;
}return inside;}
function aboveBall(layer,pos){
  if(layer.role==='foreground'||layer.role==='receiver-front')return true;
  if(layer.role==='receiver-rear')return false;
  if(layer.occlusion?.nativePolygon)return inPolygon([pos.x,pos.y],layer.occlusion.nativePolygon);
  if(layer.depthLine){const [[x1,y1],[x2,y2]]=layer.depthLine;const y=x1===x2?Math.max(y1,y2):y1+(pos.x-x1)*(y2-y1)/(x2-x1);return pos.y<y;}
  return pos.y<(layer.nativeBase?.[1]??0);
}
function draw(){
  const st=run.session.state,p=st.ball.pos;
  artistic.visible=$('art').checked;geometry.visible=$('geometry').checked;
  diagnosticBall.clear();diagnosticBall.visible=$('geometry').checked;
  geometry.clear();
  const lineW=flat?3/scene.scale.x:3;
  for(const pin of config.board.pins)circleNative(geometry,pin,0x00ffff,lineW);
  for(const s of config.board.segments)pathGraphic(geometry,[nativePoint([s.x1,s.y1]),nativePoint([s.x2,s.y2])],0xff59bb,lineW);
  for(const b of config.board.buckets)circleNative(geometry,b,0x69ff9e,lineW);
  for(const drop of config.board.drops)circleNative(geometry,{...drop,r:config.board.ball.r},0xffd66b,lineW);
  circleNative(geometry,{...p,r:config.board.ball.r},0xffffff,lineW);
  const center=nativePoint([p.x,p.y]);
  diagnosticBall.circle(...center,flat?config.board.ball.r:uniformRadius([p.x,p.y],config.board.ball.r)).fill({color:0xffffff,alpha:.2});
  for(const {layer,sp} of artistLayers){const parent=aboveBall(layer,p)?bodiesAbove:bodiesBelow;if(sp.parent!==parent)parent.addChild(sp);}
  for(const parent of [bodiesBelow,bodiesAbove])parent.children.sort((a,b)=>(a.zIndex??0)-(b.zIndex??0));
  if(ballSprite){
    const b=artist.ball,rad=flat?config.board.ball.r:uniformRadius([p.x,p.y],config.board.ball.r);
    ballSprite.anchor.set(b.center[0]/ballSprite.texture.width,b.center[1]/ballSprite.texture.height);
    const visualLift=Object.hasOwn(b,'visualLiftPx')?b.visualLiftPx:rad*(b.liftRadiusFactor??1);
    ballSprite.scale.set(rad/b.visibleRadius);ballSprite.position.set(center[0],center[1]-(flat?0:visualLift));
    if(shadowSprite){
      const sh=b.shadow,offset=sh.offsetNative??[-8,8],positions=shadowSprite.geometry.positions,uvs=shadowSprite.geometry.uvs,tex=shadowSprite.texture;
      for(let i=0;i<positions.length;i+=2){
        const native=[p.x+offset[0]+(uvs[i]*tex.width-sh.center[0])*sh.radiusNative[0]/sh.visibleRadii[0],p.y+offset[1]+(uvs[i+1]*tex.height-sh.center[1])*sh.radiusNative[1]/sh.visibleRadii[1]];
        const point=nativePoint(native);positions[i]=point[0];positions[i+1]=point[1];
      }
      shadowSprite.geometry.getBuffer('aPosition').update();shadowSprite.alpha=sh.opacity??1;
    }
  }
  $('render-metrics').textContent=JSON.stringify({
    seed:run.seed,tick:st.tick,view:flat?'flat':'source',artVisible:artistic.visible,geometryVisible:geometry.visible,
    nativeCenter:[p.x,p.y],projectedNativeCenter:map([p.x,p.y]),
    ball:ballSprite?{center:[ballSprite.x,ballSprite.y],scale:[ballSprite.scale.x,ballSprite.scale.y],anchor:[ballSprite.anchor.x,ballSprite.anchor.y],textureCanvas:[ballSprite.texture.width,ballSprite.texture.height],visualLiftPx:artist.ball.visualLiftPx,visibleRadius:uniformRadius([p.x,p.y],config.board.ball.r),opacity:ballSprite.alpha}:null,
    shadow:shadowSprite?{textureCanvas:[shadowSprite.texture.width,shadowSprite.texture.height],meshScale:[shadowSprite.scale.x,shadowSprite.scale.y],opacity:shadowSprite.alpha,firstGroundVertexSource:[shadowSprite.geometry.positions[0],shadowSprite.geometry.positions[1]],radiusNative:artist.ball.shadow.radiusNative,offsetNative:artist.ball.shadow.offsetNative}:null,
    objectLayers:artistLayers.map(({layer,sp})=>({id:layer.id,objectId:layer.objectId,nativeBase:layer.nativeBase,nativeRadius:layer.nativeRadius,rect:layer.rect,actualPosition:[sp.x,sp.y],actualDimensions:[sp.width,sp.height],aboveBall:sp.parent===bodiesAbove,visible:sp.visible})),
  },null,2);
  const outcome=st.done?JSON.stringify(st.result):run.paused?'пауза':'движение';
  $('status').textContent=`Seed ${run.seed}\nТик ${st.tick} · ${(st.tick*.005).toFixed(3)} с\n${outcome}\nx ${p.x.toFixed(7)}\ny ${p.y.toFixed(7)}\nPRNG ${st.rngU32}`;
  $('snapshot').textContent=JSON.stringify(run.snapshot(),null,2);
  $('tick').value=st.tick;$('seed').value=run.seed;$('play').textContent=run.paused?'Продолжить':'Пауза';
  const eventKey=run.seed+':'+run.events.length;
  if(lastEvents!==eventKey){lastEvents=eventKey;$('events').replaceChildren();for(const {e,i} of run.events.map((e,i)=>({e,i})).filter(({e})=>['object_hit','bucket_entered','run_finished'].includes(e.type)).slice(-40).reverse()){
    const observed=run.eventStateTicks[i];const button=document.createElement('button');button.className='event';button.textContent=`${e.type} ${e.objectId??e.bucketId??''}\nevent ${e.tick} → state ${observed}`;button.onclick=()=>{run.seek(observed);frameAccumulator=0;draw();};$('events').appendChild(button);
  }}
}
function guard(fn){return async()=>{try{$('error').textContent='';await fn();draw();}catch(e){$('error').textContent=e.message;throw e;}};}
$('new').onclick=guard(()=>{const seed=crypto.getRandomValues(new Uint32Array(1))[0];run.reset(seed);run.paused=false;frameAccumulator=0;});
$('replay').onclick=guard(()=>{run.reset(Number($('seed').value));frameAccumulator=0;});
$('play').onclick=guard(()=>{run.paused=!run.paused;frameAccumulator=0;});
$('step').onclick=guard(()=>{run.paused=true;run.advance(1);frameAccumulator=0;});
$('step10').onclick=guard(()=>{run.paused=true;run.advance(10);frameAccumulator=0;});
$('seek').onclick=guard(()=>{run.seek(Number($('tick').value));frameAccumulator=0;});
for(const id of ['art','geometry'])$(id).onchange=draw;
$('flat').onchange=guard(async()=>{flat=$('flat').checked;fitScene();await rebuildArt();});
$('contact').onclick=guard(()=>{run.paused=true;const before=run.events.filter(e=>e.type==='object_hit'||e.type==='bucket_entered').length;while(!run.session.state.done){run.advance();if(run.events.filter(e=>e.type==='object_hit'||e.type==='bucket_entered').length>before)break;}frameAccumulator=0;});
$('save').onclick=()=>{const blob=new Blob([JSON.stringify(run.exportReplay(),null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=`p6-seed-${run.seed}-tick-${run.session.state.tick}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('load').onchange=guard(async()=>{const file=$('load').files[0];if(file)run.importReplay(JSON.parse(await file.text()));frameAccumulator=0;});
if(meta.artCandidate){artist=await fetch('artist.json').then(r=>r.json());}
$('candidate').textContent=artist?.stage==='one-wood-sphere-shadow'?`${artist.id} · только wood-01`:artist?.stage==='sphere-shadow-only'?`${artist.id} · sphere/shadow · геометрический фон`:artist?`${artist.id} · визуальная проверка ожидается`:'Геометрический черновик v01 · арт ещё не подключён';
$('mode').textContent=artist?.stage==='one-wood-sphere-shadow'?'Один actual wood-01 + sphere/shadow. Остальные24 объекта — черновик; перекрытия и ellipse проверяются.':artist?.stage==='sphere-shadow-only'?'Sphere/shadow v01: visualLiftPx=0. Слои перекрытий препятствий ещё не подключены.':artist?'Художественный кандидат':'Техническая сборка: круг — диагностический контур шарика';
$('pins').textContent=JSON.stringify(meta,null,2);
await rebuildArt();fitScene();
const frameParams=new URLSearchParams(location.search);
if(frameParams.get('frame')==='1'){
  document.body.classList.add('frame');
  run.reset(Number(frameParams.get('seed')??0));run.seek(Number(frameParams.get('tick')??0));
  $('geometry').checked=frameParams.get('geometry')==='1';$('art').checked=true;
}
draw();
app.ticker.add(ticker=>{
  if(!run.paused){frameAccumulator+=Math.min(ticker.deltaMS,250);const ticks=Math.floor(frameAccumulator/config.defaults.tickMs);if(ticks){run.advance(ticks);frameAccumulator-=ticks*config.defaults.tickMs;draw();}}
});
// Readable QA API; every seek replays the real core from the retained initial config.
window.p6={run,meta,get state(){return run.snapshot();},pause(){run.paused=true;frameAccumulator=0;draw();},seek(t){run.seek(t);frameAccumulator=0;draw();return run.snapshot();},step(n=1){run.paused=true;run.advance(n);draw();return run.snapshot();},exportReplay:()=>run.exportReplay(),setView:async v=>{flat=v==='flat';$('flat').checked=flat;fitScene();await rebuildArt();draw();},getReady:()=>true};
