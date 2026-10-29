const spec={
  "name": "water",
  "board": "04",
  "trial": "02",
  "config": "simulation/boards/04/trial-02/config.json",
  "manifest": "simulation/boards/04/trial-02/manifest.json",
  "projection": "research/board04-projection.candidate-02.json",
  "source": "K:/Agents/R4D/Assets/perspective/04-water-temple.jpg",
  "sourceSha": "8da65c76c110b6ba7cefe113564fe12feed4428e84e84835f033e7da31d3b80d",
  "hashes": {
    "config": "9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c",
    "manifest": "48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420",
    "projection": "ee0c6e429d4e0b1da6c342174d22369cd293c3fc4b18ccd7d09a4690f71da54f"
  },
  "counts": [
    6,
    106,
    4,
    1
  ],
  "gates": true
};

import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../../../../..');
const p1='4b47db04c7140ebf88f69b91faa0b790d46f22ec';
const core='5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023';
const pre='experiments/p1-collider-mapping/clean-repeat-01/';
const [nativeRepo,oracleDir]=process.argv.slice(2);
if(!nativeRepo||!oracleDir)throw Error('Provide authorized nativeRepo and cached independent oracle directory');
const git=(root,...args)=>execFileSync('git',['--no-optional-locks','-C',root,...args],{maxBuffer:4*1024*1024});
const raw=relative=>git(repo,'show',p1+':'+pre+relative);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const stable=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const close=(a,b,label)=>assert.ok(Math.abs(a-b)<1e-7,label+': '+a+' / '+b);
const cfgBytes=raw(spec.config),manifestBytes=raw(spec.manifest),projectionBytes=raw(spec.projection);
assert.equal(sha(cfgBytes),spec.hashes.config);assert.equal(sha(manifestBytes),spec.hashes.manifest);assert.equal(sha(projectionBytes),spec.hashes.projection);
const c=JSON.parse(cfgBytes),m=JSON.parse(manifestBytes),p=JSON.parse(projectionBytes);
assert.equal(m.board,spec.board);assert.equal(m.trial,spec.trial);assert.equal(m.coreCommit,core);
assert.equal(m.config.canonicalLfUtf8Sha256,sha(cfgBytes));assert.equal(m.research.canonicalLfUtf8Sha256,sha(projectionBytes));
assert.equal(m.research.file,pre+spec.projection);
assert.equal(sha(fs.readFileSync(spec.source)),spec.sourceSha);assert.equal(m.source.sha256,spec.sourceSha);
assert.deepEqual([c.board.pins.length,c.board.segments.length,c.board.buckets.length,c.board.drops.length],spec.counts);
assert.deepEqual(c.defaults,{tickMs:5,quantizeDigits:7});
assert.deepEqual(c.physics,{gravityY:980,maxBallSpeed:2000,angleDeviationDeg:2,bounceDeviation:0.02,wallBounce:1});
assert.equal(c.board.ball.r,16);assert.equal(c.rng.algo,'lcg32');
const offset=m.translation.offset,point=([x,y])=>[x+offset[0],y+offset[1]];
const project=(mat,[x,y])=>{const w=mat[2][0]*x+mat[2][1]*y+mat[2][2];assert.ok(Math.abs(w)>1e-12);return[(mat[0][0]*x+mat[0][1]*y+mat[0][2])/w,(mat[1][0]*x+mat[1][1]*y+mat[1][2])/w];};
const segments=new Map(c.board.segments.map(s=>[s.id,s]));
let anchors=0,maxRoundtrip=0;
for(const o of p.obstacles){
 if(o.primitive==='circle'){const pin=c.board.pins.find(v=>v.id===o.id);assert.ok(pin);const q=point(o.centerFlat);close(pin.x,q[0],o.id);close(pin.y,q[1],o.id);close(pin.r,o.radiusFlat,o.id);}
 else{assert.equal(o.primitive,'segmentLoop');for(let i=0;i<o.verticesFlat.length;i++){const s=segments.get(o.id+':edge-'+String(i+1).padStart(2,'0'));assert.ok(s);const a=point(o.verticesFlat[i]),b=point(o.verticesFlat[(i+1)%o.verticesFlat.length]);[s.x1,s.y1,s.x2,s.y2].forEach((v,k)=>close(v,[...a,...b][k],s.id));anchors++;}}
}
for(const b of p.bounds.segments){const s=segments.get(b.id),a=point(b.fromFlat),z=point(b.toFlat);[s.x1,s.y1,s.x2,s.y2].forEach((v,k)=>close(v,[...a,...z][k],b.id));}
for(const g of p.goals){const b=c.board.buckets.find(v=>v.id===g.id),q=point(g.centerFlat);close(b.x,q[0],g.id);close(b.y,q[1],g.id);close(b.r,g.radiusFlat,g.id);}
const drop=c.board.drops[0],start=point(p.start.positionFlat);close(drop.x,start[0],'drop.x');close(drop.y,start[1],'drop.y');
const nativePoints=[...[drop,...c.board.pins,...c.board.buckets].map(v=>[v.x,v.y]),...c.board.segments.flatMap(s=>[[s.x1,s.y1],[s.x2,s.y2]]),...m.projection.wholeSourceNativePolygon];
for(const q of nativePoints){
 const src=project(m.projection.nativeToSource,q),back=project(m.projection.sourceToNative,src);
 maxRoundtrip=Math.max(maxRoundtrip,Math.abs(back[0]-q[0]),Math.abs(back[1]-q[1]));
 const research=project(p.transform.forward,[q[0]-offset[0],q[1]-offset[1]]);close(src[0],research[0],'native/research projection x');close(src[1],research[1],'native/research projection y');
}
assert.ok(maxRoundtrip<1e-7);
for(let i=0;i<4;i++){const native=project(m.projection.sourceToNative,m.projection.sourceImageQuadPx[i]);native.forEach((v,k)=>close(v,m.projection.wholeSourceNativePolygon[i][k],'whole-source corner'));p.domains.wholeSourceFlatPolygon[i].forEach((v,k)=>close(v+offset[k],native[k],'research domain'));}
assert.equal(git(nativeRepo,'rev-parse','HEAD').toString().trim(),core);
assert.equal(git(nativeRepo,'status','--porcelain=v1','--','packages/sim-core').toString().trim(),'');
const trees={repository:git(nativeRepo,'rev-parse',core+'^{tree}').toString().trim(),package:git(nativeRepo,'rev-parse',core+':packages/sim-core').toString().trim(),src:git(nativeRepo,'rev-parse',core+':packages/sim-core/src').toString().trim()};
assert.equal(trees.package,'008d16a80a26bb77d562a45218b01da09b0d9ff0');assert.equal(trees.src,'6539b91a379d32c22281d43e71bb17fecb608437');
const blobs=[];
for(const relative of fs.readdirSync(oracleDir,{recursive:true}).filter(f=>f.endsWith('.js'))){const data=git(nativeRepo,'show',core+':packages/sim-core/src/'+relative.replaceAll('\\','/').replace(/\.js$/,'.ts'));assert.equal(fs.readFileSync(path.join(oracleDir,relative),'utf8'),stripTypeScriptTypes(data.toString('utf8'),{mode:'transform',sourceMap:false}));blobs.push(createHash('sha1').update('blob '+data.length+'\0').update(data).digest('hex'));}
assert.equal(blobs.length,14);
const native=await import(pathToFileURL(path.join(oracleDir,'Sim.js')));
const distance=(p,a,b)=>{const dx=b[0]-a[0],dy=b[1]-a[1],d=dx*dx+dy*dy,t=d?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/d)):0;return Math.hypot(p[0]-a[0]-t*dx,p[1]-a[1]-t*dy);};
const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
function segmentDistance(a,b,z,w){const d1=cross(a,b,z),d2=cross(a,b,w),d3=cross(z,w,a),d4=cross(z,w,b);if(d1*d2<=0&&d3*d4<=0&&Math.max(Math.min(a[0],b[0]),Math.min(z[0],w[0]))<=Math.min(Math.max(a[0],b[0]),Math.max(z[0],w[0]))&&Math.max(Math.min(a[1],b[1]),Math.min(z[1],w[1]))<=Math.min(Math.max(a[1],b[1]),Math.max(z[1],w[1])))return 0;return Math.min(distance(a,z,w),distance(b,z,w),distance(z,a,b),distance(w,a,b));}
function clearance(a,b){return Math.min(...c.board.segments.map(s=>segmentDistance(a,b,[s.x1,s.y1],[s.x2,s.y2])-c.board.ball.r),...c.board.pins.map(pin=>distance([pin.x,pin.y],a,b)-pin.r-c.board.ball.r));}
const startupClearance=clearance([drop.x,drop.y],[drop.x,drop.y]);
const gates=[];
if(spec.gates){
 assert.equal(m.generatedShorelineHeightOrLintelColliders,0);
 for(let i=1;i<=8;i++){
  const id='arch-'+String(i).padStart(2,'0'),left=p.obstacles.find(v=>v.id===id+'-left-foot'),right=p.obstacles.find(v=>v.id===id+'-right-foot');
  assert.ok(left&&right);const L=left.verticesFlat.map(point),R=right.verticesFlat.map(point);
  const centerY=[...L,...R].reduce((n,v)=>n+v[1],0)/8;
  function section(poly,y){const xs=[];for(let k=0;k<poly.length;k++){const a=poly[k],b=poly[(k+1)%poly.length];if(a[1]===b[1])continue;if(y>=Math.min(a[1],b[1])&&y<=Math.max(a[1],b[1]))xs.push(a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0]));}return xs;}
  const innerL=Math.max(...section(L,centerY)),innerR=Math.min(...section(R,centerY));
  const centerX=(innerL+innerR)/2,yMin=Math.min(...L.map(v=>v[1]),...R.map(v=>v[1])),yMax=Math.max(...L.map(v=>v[1]),...R.map(v=>v[1]));
  const corridor=[[centerX,yMin-c.board.ball.r-0.01],[centerX,yMax+c.board.ball.r+0.01]];
  let minGap=Infinity;for(let a=0;a<4;a++)for(let b=0;b<4;b++)minGap=Math.min(minGap,segmentDistance(L[a],L[(a+1)%4],R[b],R[(b+1)%4]));
  gates.push({id,minimumFootGap:minGap,diameter:c.board.ball.r*2,pairGapMinusDiameter:minGap-c.board.ball.r*2,centerY,centerFitInterval:[innerL+c.board.ball.r,innerR-c.board.ball.r],corridor,allConfigCorridorClearance:clearance(...corridor),ordinaryCrossings:[]});
 }
}
const summaries=[],witnesses=[];
for(const seed of [0,1,2]){
 const config=structuredClone(c);config.rng.seed=seed;const hits=[],session=native.createSimRunSession(config,{onEvent:e=>{if(e.type==='object_hit')hits.push(structuredClone(e));}});
 const states=[structuredClone(session.state)];
 for(let n=0;n<Math.ceil(config.board.timeSecMax*1000/config.defaults.tickMs)&&!session.state.done;n++){native.stepSimRunSession(session);states.push(structuredClone(session.state));}
 if(!session.state.done){native.timeoutSimRunSession(session);states[states.length-1]=structuredClone(session.state);}
 const again=native.createSimRunSession(config);const replay=[];
 replay.push(structuredClone(again.state));while(!again.state.done&&again.state.tick<Math.ceil(config.board.timeSecMax*1000/config.defaults.tickMs)){native.stepSimRunSession(again);replay.push(structuredClone(again.state));}if(!again.state.done){native.timeoutSimRunSession(again);replay[replay.length-1]=structuredClone(again.state);}
 assert.deepEqual(replay,states);
 for(const gate of gates)for(let tick=1;tick<states.length;tick++){const a=states[tick-1].ball.pos,b=states[tick].ball.pos;if(a.y===b.y||((a.y<gate.centerY)===(b.y<gate.centerY)))continue;const t=(gate.centerY-a.y)/(b.y-a.y),x=a.x+t*(b.x-a.x);if(x<=gate.centerFitInterval[0]||x>=gate.centerFitInterval[1])continue;const stepClearance=clearance([a.x,a.y],[b.x,b.y]);if(stepClearance < -1e-6)continue;const record={seed,tick,x,y:gate.centerY,direction:b.y>a.y?'down':'up',stepClearance,source:project(m.projection.nativeToSource,[x,gate.centerY])};gate.ordinaryCrossings.push(record);witnesses.push({gate:gate.id,...record,states:states.slice(Math.max(0,tick-1),Math.min(states.length,tick+2))});}
 summaries.push({seed,lastTick:states.length-1,result:states.at(-1).result,traceSha256:sha(stable(states)),hitCount:hits.length,hits,firstTick:states[1],lastState:states.at(-1)});
}
assert.equal(new Set(summaries.map(v=>v.traceSha256)).size,3);
const runtime='E:/R4D/perspective/p3-runtime/technical-qa/transfer-water-dark/'+spec.name;fs.mkdirSync(runtime,{recursive:true});
const output={scope:'INPUT_PREPARATION_ONLY; no transfer frozen candidate or rendered movement tested',board:spec.name,utc:new Date().toISOString(),turnId:'01a186fc-3cd2-7173-b970-246428cca6de',p1Commit:p1,source:{path:spec.source,sha256:spec.sourceSha,width:m.source.width,height:m.source.height},inputs:{config:{path:pre+spec.config,sha256:sha(cfgBytes)},manifest:{path:pre+spec.manifest,sha256:sha(manifestBytes)},projection:{path:pre+spec.projection,sha256:sha(projectionBytes)}},counts:spec.counts,drop,settings:{defaults:c.defaults,physics:c.physics,ball:c.board.ball,rng:c.rng},native:{commit:core,trees,verifiedCachedModuleBlobs:blobs.sort()},geometry:{loopEdgesChecked:anchors,projectionMaxRoundtripError:maxRoundtrip,startupClearance},nativeInputRuns:summaries,gates,limits:'Local 2D corridor and ordinary native crossing are not proof of painted lintel clearance or future candidate render/masks. Three fixed upfront seeds; not a search for wins.'};
const dest=path.join(runtime,'input-preflight-01.json');if(fs.existsSync(dest))throw Error('Preserve existing observation; use its saved result or a new named run');fs.writeFileSync(dest,JSON.stringify(output,null,2)+'\n');fs.writeFileSync(path.join(runtime,'gate-native-witnesses-01.json'),JSON.stringify({board:spec.name,p1Commit:p1,configSha256:sha(cfgBytes),projectionSha256:sha(projectionBytes),coreCommit:core,witnesses},null,2)+'\n');
fs.writeFileSync(path.join(here,'INPUT_PREFLIGHT.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify({board:spec.name,inputs:output.inputs,counts:spec.counts,native:output.native.trees,startupClearance,maxRoundtrip,ordinary:summaries.map(({seed,lastTick,result,hitCount})=>({seed,lastTick,result,hitCount})),gates:gates.map(({ordinaryCrossings,corridor,...g})=>({...g,ordinaryCrossings}))},null,2));
