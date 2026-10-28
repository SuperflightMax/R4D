import {Application,Assets,Container,Graphics,MeshSimple,Sprite} from 'pixi.js';
import {transform,boundsOf,contain,inverseImageMesh} from '@p1/math';
import {registration} from '@p1/registration';
import {clipSegment} from '@p1/geometry';

export class Scene {
 constructor(host,config,p1,replay){
  Object.assign(this,{host,config,p1,replay,view:'source',art:true,geometry:true,zoom:1});
  this.app=new Application();this.world=new Container();
  this.artRoot=new Container();this.ground=new Container();this.bodies=new Container();this.front=new Container();
  this.overlay=new Graphics();this.parts=[];
 }
 async init(manifest){
  await this.app.init({width:1,height:1,background:'#081010',antialias:true,
   resolution:Math.min(devicePixelRatio,2),autoDensity:true,autoStart:false,preference:'webgl'});
  this.host.replaceChildren(this.app.canvas);
  this.app.stage.addChild(this.world);
  this.world.addChild(this.artRoot,this.overlay);
  this.manifest=manifest;
  const texture=await Assets.load(manifest?'./art/'+manifest.background.file:'./input/original.jpg');
  this.original=new Sprite(texture);
  this.flat=new MeshSimple({texture,...inverseImageMesh(this.p1.projection.sourceToNative,1536,1536)});
  this.flat.autoUpdate=false;
  this.artRoot.addChild(this.original,this.flat,this.ground,this.bodies,this.front);
  if(manifest){
   this.validateManifest(manifest);
   for(const object of manifest.objects)for(const part of object.parts){
    const texture=await Assets.load('./art/'+part.file);
    const [x,y,w,h]=part.sourceRectPx;
    if(texture.width!==w||texture.height!==h)throw new Error(`${part.id}: PNG/crop dimensions mismatch`);
    const source=new Sprite(texture);source.position.set(x,y);
    const flat=this.cropMesh(texture,part.sourceRectPx);
    const container=part.role==='ground-shadow'?this.ground:part.depth.mode==='always-front'?this.front:this.bodies;
    container.addChild(source,flat);
    this.parts.push({object,part,source,flat});
   }
   if(manifest.ball){
    this.ball=new Sprite(await Assets.load('./art/'+manifest.ball.file));
    this.ball.anchor.set(...manifest.ball.anchorNormalized);this.bodies.addChild(this.ball);
   }
   if(manifest.shadow){
    this.shadow=new Sprite(await Assets.load('./art/'+manifest.shadow.file));
    this.shadow.anchor.set(...manifest.shadow.anchorNormalized);
    this.shadow.alpha=manifest.shadow.opacity;
    this.ground.addChild(this.shadow);
   }
  }
  this.bodies.sortableChildren=true;this.front.sortableChildren=true;
  this.observer=new ResizeObserver(()=>this.render());this.observer.observe(this.host);
  this.render();
 }
 validateManifest(m){
  if(m.schema!=='r4d.p4.art.v1'||m.alphaMode!=='straight'||m.sourceSizePx?.join(',')!=='1536,1536'
   ||m.sourceSha256!=='c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72')throw new Error('Wrong art source/schema/alpha mode');
  const ids=new Set([...this.config.board.pins,...this.config.board.buckets].map(o=>o.id));
  for(const object of m.objects){
   if(!ids.has(object.objectId))throw new Error(`Unknown P1 objectId: ${object.objectId}`);
   const [x,y]=object.anchorSourcePx;
   const native=transform(this.p1.projection.sourceToNative,{x,y});
   if(Math.hypot(native.x-object.anchorNative[0],native.y-object.anchorNative[1])>0.05)throw new Error(`${object.objectId}: mixed coordinates`);
   for(const part of object.parts){
    const [rx,ry]=part.sourceRectPx;const [ax,ay]=part.anchorLocalPx;
    if(Math.hypot(x-ax-rx,y-ay-ry)>0.05)throw new Error(`${part.id}: anchor/padding mismatch`);
    if(!['ground-shadow','body','foreground'].includes(part.role)
      ||!['native-y','always-front'].includes(part.depth?.mode)
      ||(part.depth.mode==='native-y'&&!Number.isFinite(part.depth.nativeY))||!part.provenance?.kind)throw new Error(`${part.id}: missing depth/provenance`);
   }
  }
 }
 cropMesh(texture,[x,y,w,h]){
  const cells=16,vertices=new Float32Array((cells+1)**2*2),uvs=new Float32Array(vertices.length),indices=new Uint32Array(cells*cells*6);
  for(let row=0;row<=cells;row++)for(let column=0;column<=cells;column++){
   const i=(row*(cells+1)+column)*2,u=column/cells,v=row/cells;
   const p=transform(this.p1.projection.sourceToNative,{x:x+u*w,y:y+v*h});
   vertices.set([p.x,p.y],i);uvs.set([u,v],i);
   if(row<cells&&column<cells){const a=row*(cells+1)+column,b=a+1,c=a+cells+1,d=c+1;indices.set([a,b,d,a,d,c],(row*cells+column)*6);}
  }
  const mesh=new MeshSimple({texture,vertices,uvs,indices});mesh.autoUpdate=false;return mesh;
 }
 project(p){return this.view==='source'?transform(this.p1.projection.nativeToSource,p):p;}
 render(){
  if(!this.original)return;
  const width=Math.max(1,this.host.clientWidth),height=Math.max(1,this.host.clientHeight);
  this.app.renderer.resize(width,height);
  const polygon=(this.view==='source'?this.p1.projection.sourceImageQuadPx:this.p1.projection.wholeSourceNativePolygon).map(([x,y])=>({x,y}));
  this.fit=contain(boundsOf(polygon),width,height);
  this.fit.scale*=this.zoom;
  const bounds=boundsOf(polygon);
  this.fit.x=width/2-(bounds.minX+bounds.maxX)/2*this.fit.scale;
  this.fit.y=height/2-(bounds.minY+bounds.maxY)/2*this.fit.scale;
  this.world.position.set(this.fit.x,this.fit.y);this.world.scale.set(this.fit.scale);
  this.artRoot.visible=this.art;this.original.visible=this.view==='source';this.flat.visible=this.view==='flat';
  for(const {part,source,flat} of this.parts){
   source.visible=this.view==='source';flat.visible=this.view==='flat';
   source.zIndex=flat.zIndex=(part.depth.nativeY||0)+(part.depth.order||0)*1e-5;
  }
  const state=this.replay.snapshot(),pos=state.ball.pos,r=this.config.board.ball.r;
  const src=transform(this.p1.projection.nativeToSource,pos);
  const inside=src.x>=0&&src.x<=1536&&src.y>=0&&src.y<=1536;
  if(this.ball){
   const ball=this.manifest.ball;
   const pose=registration(this.p1.projection.nativeToSource,pos,r,this.view,this.ball.texture.width/ball.visibleDiameterPx);
   this.ball.position.set(pose.center.x,pose.center.y);this.ball.width=pose.canvasDiameter;
   this.ball.height=pose.canvasDiameter*this.ball.texture.height/this.ball.texture.width;
   this.ball.zIndex=pos.y;this.ball.visible=inside;
   if(this.shadow){
    const s=this.manifest.shadow;const point=this.project({x:pos.x+s.offsetNativeR[0]*r,y:pos.y+s.offsetNativeR[1]*r});
    this.shadow.position.set(point.x,point.y);
    this.shadow.width=pose.diameter*s.widthDiameters;this.shadow.height=pose.diameter*s.heightDiameters;
    this.shadow.visible=inside;
   }
  }
  this.bodies.sortChildren();this.front.sortChildren();
  this.overlay.clear();this.overlay.visible=this.geometry;
  const stroke=color=>({color,width:1.7/this.fit.scale,alpha:1});
  const circle=(p,r,color)=>{
   for(let i=0;i<=96;i++){const a=i/96*2*Math.PI,q=this.project({x:p.x+r*Math.cos(a),y:p.y+r*Math.sin(a)});if(i===0)this.overlay.moveTo(q.x,q.y);else this.overlay.lineTo(q.x,q.y);}
   this.overlay.stroke(stroke(color));
  };
  const segment=(from,to,color)=>{
   const clipped=clipSegment(from,to,this.p1.projection.wholeSourceNativePolygon);if(!clipped)return;
   const [a,b]=clipped.map(p=>this.project(p));this.overlay.moveTo(a.x,a.y).lineTo(b.x,b.y).stroke(stroke(color));
  };
  this.config.board.pins.forEach(p=>circle(p,p.r,0x54e8ff));
  this.config.board.buckets.forEach(p=>circle(p,p.r,0xb8ff54));
  this.config.board.segments.forEach(s=>segment({x:s.x1,y:s.y1},{x:s.x2,y:s.y2},0xffcf5c));
  const b=this.config.board;
  segment({x:0,y:0},{x:b.width,y:0},0xffcf5c);segment({x:0,y:0},{x:0,y:b.height},0xffcf5c);segment({x:b.width,y:0},{x:b.width,y:b.height},0xffcf5c);
  if(inside){circle(pos,r,0xff76d2);const p=this.project(pos),d=4/this.fit.scale;this.overlay.moveTo(p.x-d,p.y).lineTo(p.x+d,p.y).moveTo(p.x,p.y-d).lineTo(p.x,p.y+d).stroke(stroke(0xff76d2));}
  this.app.render();
 }
 inspection(){return {view:this.view,art:this.art,geometry:this.geometry,zoom:this.zoom,parts:this.parts.map(({object,part})=>({objectId:object.objectId,id:part.id,role:part.role,depth:part.depth})),state:this.replay.snapshot(),fit:this.fit};}
}
