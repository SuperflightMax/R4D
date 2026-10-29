// A single actual wood-01 placement from the normal retained seed0 contact, not all8.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { project } from '../inputs/projection.mjs';
import { root,runtime,candidateName } from './paths.mjs';
const commit='f493bbf8d5ec92b429767e2bd9afd8de766c13e0';
const prefix='experiments/p6-geometry-first-art/asset-artist/components-v01/';
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');

export function prepareWoodV01(sphere){
  const checkout=path.resolve(root,'../../..'),dir=path.dirname(sphere.artistPath);
  const packetBytes=execFileSync('git',['-C',checkout,'show',`${commit}:${prefix}WOOD_PACKET_V01.json`],{cwd:checkout});
  const packet=JSON.parse(packetBytes);
  const raw=execFileSync('git',['-C',checkout,'show',`${commit}:${prefix}${packet.texture}`],{cwd:checkout,maxBuffer:16*1024*1024});
  if(sha(raw)!=='802f339d693d4dfc175a1e0f9013c78a6e9062bd6532a3db228bd98cd307e161'||sha(raw)!==packet.sha256)throw new Error('Wood master hash mismatch');
  if(JSON.stringify(packet.groundAnchorPx)!=='[625,1032]'||packet.baseEllipse.radiusXPx!==255||packet.baseEllipse.radiusYPx!==138||packet.bakedGroundShadow!==false)throw new Error('Unexpected actual wood packet geometry/shadow');
  const textureCanvas=[raw.readUInt32BE(16),raw.readUInt32BE(20)];
  if(JSON.stringify(textureCanvas)!==JSON.stringify(packet.canvas))throw new Error('Wood canvas differs');
  const woodFile='raw/wood-master-v01.png';fs.writeFileSync(path.join(dir,woodFile),raw);
  fs.writeFileSync(path.join(dir,'WOOD_PACKET_V01.json'),packetBytes);
  const backgroundFile='draft-without-wood-01-body.png';
  const backgroundPath=path.join(dir,backgroundFile);
  execFileSync('python',[path.join(root,'scripts/render-draft.py'),'--omit-body','wood-01','--output',backgroundPath],{cwd:checkout,env:{...process.env,TEMP:runtime,TMP:runtime,PYTHONIOENCODING:'utf-8'}});
  const cfg=JSON.parse(fs.readFileSync(path.join(root,'inputs/config.json')));
  const manifest=JSON.parse(fs.readFileSync(path.join(root,'inputs/manifest.json')));
  const M=manifest.projection.nativeToSource,pin=cfg.board.pins.find(p=>p.id==='wood-01');
  const center=project(M,[pin.x,pin.y]),left=project(M,[pin.x-pin.r,pin.y]),right=project(M,[pin.x+pin.r,pin.y]);
  const projectedRadius=Math.hypot(right[0]-left[0],right[1]-left[1])/2;
  const scale=projectedRadius/packet.baseEllipse.radiusXPx;
  const anchor=packet.groundAnchorPx;
  const rect=[center[0]-anchor[0]*scale,center[1]-anchor[1]*scale,packet.canvas[0]*scale,packet.canvas[1]*scale];
  const adapter=structuredClone(sphere.adapter);
  adapter.id='p6-integration-03-one-wood-v01';adapter.stage='one-wood-sphere-shadow';
  adapter.status='one actual wood-01 over deterministic draft variant; only one object body has dynamic occlusion';
  adapter.layers=[{id:'diagnostic-floor-without-wood-01-body',role:'background',texture:backgroundFile,fullFrame:true},
    {id:'wood-01-body',objectId:pin.id,role:'body',texture:woodFile,rect,nativeBase:[pin.x,pin.y],nativeRadius:pin.r,order:pin.y}];
  adapter.shadows={'wood-01':{kind:'baked',layerId:'diagnostic-floor-without-wood-01-body',source:'single unchanged own draft ground shadow; no added or master-baked shadow'}};
  delete adapter.hashes['geometry-draft.png'];
  adapter.hashes[backgroundFile]=sha(fs.readFileSync(backgroundPath));adapter.hashes[woodFile]=sha(raw);
  const w=M[2][0]*pin.x+M[2][1]*pin.y+M[2][2];
  const expectedCircle=Array.from({length:128},(_,i)=>project(M,[pin.x+pin.r*Math.cos(i*Math.PI/64),pin.y+pin.r*Math.sin(i*Math.PI/64)]));
  const ellipse=Array.from({length:128},(_,i)=>[center[0]+255*scale*Math.cos(i*Math.PI/64),center[1]+138*scale*Math.sin(i*Math.PI/64)]);
  adapter.woodSource={commit,packet:prefix+'WOOD_PACKET_V01.json',packetSha256:sha(packetBytes),masterSha256:sha(raw),canvas:textureCanvas,
    instanceId:pin.id,selection:{seed:0,hitEventTick:571,beforeStateTick:571,contactStateTick:572,afterStateTick:573},
    sourceGroundAnchor:anchor,sourceBaseEllipse:packet.baseEllipse,sourceVisibleHeightAboveGroundPx:packet.visibleHeightAboveGroundPx,
    actualUniformScale:scale,projectedPinCenter:center,projectedHorizontalRadius:projectedRadius,
    scaledBaseEllipseRadii:[255*scale,138*scale],actualProjectedCircleBounds:[Math.min(...expectedCircle.map(p=>p[0])),Math.min(...expectedCircle.map(p=>p[1])),Math.max(...expectedCircle.map(p=>p[0])),Math.max(...expectedCircle.map(p=>p[1]))],
    maxSampledEllipseMismatchPx:Math.max(...expectedCircle.map((p,i)=>Math.hypot(p[0]-ellipse[i][0],p[1]-ellipse[i][1]))),
    visibleHeightAboveGroundPx:packet.visibleHeightAboveGroundPx*scale,draftHeightAboveGroundPx:76/w,
    registration:'source anchor625/1032 at P(actual config center); uniform scale horizontal projected radius/255; no bbox or bottom1170 anchoring',
    shadowPolicy:adapter.shadows['wood-01'],limitations:packet.limits};
  adapter.limitations.push('Only wood-01 replaced; other24 draft bodies remain baked diagnostic art. Existing single draft shadow retained; lighting is provisional.');
  const text=JSON.stringify(adapter,null,2)+'\n';fs.writeFileSync(sphere.artistPath,text);
  const out=path.join(root,candidateName);fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'WOOD_ADAPTER_V01.json'),text);
  return {artistPath:sphere.artistPath,adapter,adapterSha256:sha(text)};
}
