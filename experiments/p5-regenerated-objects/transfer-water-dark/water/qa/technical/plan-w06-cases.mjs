// Analytical selection from complete, already cached trajectories. No core/browser.
import assert from 'node:assert/strict';
import { readFileSync, writeFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
const base = 'E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water';
const root = `${base}/w06-plan-001`, oracle = `${base}/input-oracle-001`;
const parse = path => JSON.parse(readFileSync(path)), sha = b => createHash('sha256').update(b).digest('hex');
const pin = path => { const b = readFileSync(path); return { path, bytes: b.length, sha256: sha(b) }; };
const artPath = `${root}/artist-manifest.source.json`, art = parse(artPath), bindings = parse(`${root}/BINDINGS.json`);
assert.equal(pin(artPath).sha256, 'b533e4d2a2f6f2094fed132913fe9dadb9b6eaa370f5a447ff3afc627f7cda27'); assert.equal(pin(artPath).bytes, 125833);
const config = parse(`${oracle}/common/config.json`), p1 = parse(`${oracle}/common/manifest.json`), matrix = p1.projection.nativeToSource;
const ball = art.textures.find(t => t.id === 'ball-v1'), ballR = config.board.ball.r;
const project = (x,y) => { const d = matrix[2][0]*x + matrix[2][1]*y + matrix[2][2]; return [(matrix[0][0]*x+matrix[0][1]*y+matrix[0][2])/d, (matrix[1][0]*x+matrix[1][1]*y+matrix[1][2])/d]; };
const trials = [];
function paintDisc(state) {
  const p = state.ball.pos, ground = project(p.x,p.y), ring = Array.from({length:128}, (_,i) => project(p.x+ballR*Math.cos(i*Math.PI/64), p.y+ballR*Math.sin(i*Math.PI/64)));
  const width = Math.max(...ring.map(p=>p[0])) - Math.min(...ring.map(p=>p[0])), scale = width/ball.footprintPx.width;
  return { ground, center: ground.map((v,i)=>v+(ball.sphereVisualCenterPx[i]-ball.groundAnchorPx[i])*scale), radius: width/2, uniformBallScale: scale };
}
for (const seed of [0,1,2,3]) {
  const statesPath = `${oracle}/private/seed-${seed}/states.ndjson`, eventsPath = `${oracle}/private/seed-${seed}/events.json`;
  const states = readFileSync(statesPath,'utf8').trimEnd().split('\n').map(JSON.parse), events = parse(eventsPath);
  states.forEach((s,t)=>assert.equal(s.tick,t)); assert.equal(states.at(-1).done,true);
  trials.push({seed, states, events, discs:states.map(paintDisc), refs:{states:pin(statesPath),events:pin(eventsPath)}, terminal:states.at(-1)});
}
const pointSegDistance = (p,a,b) => { const dx=b[0]-a[0],dy=b[1]-a[1],d=dx*dx+dy*dy,u=d?Math.max(0,Math.min(1,((p[0]-a[0])*dx+(p[1]-a[1])*dy)/d)):0;return Math.hypot(p[0]-a[0]-u*dx,p[1]-a[1]-u*dy); };
function inside(p,poly) { let yes=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++) { const a=poly[i],b=poly[j];if((a[1]>p[1])!==(b[1]>p[1])&&p[0]<(b[0]-a[0])*(p[1]-a[1])/(b[1]-a[1])+a[0])yes=!yes; } return yes; }
const boundaryDistance = (p,poly) => Math.min(...poly.map((a,i)=>pointSegDistance(p,a,poly[(i+1)%poly.length])));
const circleTouches = (disc,poly,bounds) => disc.center[0]+disc.radius>=bounds[0] && disc.center[0]-disc.radius<=bounds[2] && disc.center[1]+disc.radius>=bounds[1] && disc.center[1]-disc.radius<=bounds[3] && (inside(disc.center,poly)||boundaryDistance(disc.center,poly)<=disc.radius);
const samples = []; for(let y=-10;y<=10;y++)for(let x=-10;x<=10;x++)if(x*x+y*y<=100)samples.push([x/10,y/10]);
function fraction(disc,poly) { return samples.filter(([x,y])=>inside([disc.center[0]+x*disc.radius,disc.center[1]+y*disc.radius],poly)).length/samples.length; }
const splitRuns = ticks => { const r=[];for(const t of ticks){if(!r.length||t>r.at(-1)[1]+1)r.push([t,t]);else r.at(-1)[1]=t;}return r; };
function frame(seed,tick) {
  if(tick===null)return null;const tr=trials[seed],state=tr.states[tick],disc=tr.discs[tick];
  return { seed,tick,ndjsonLine:tick+1,tracePath:tr.refs.states.path,nativeGround:state.ball.pos,sourceGround:disc.ground,sourceSphereCenter:disc.center,raw1254SphereCenter:disc.center.map(v=>v*1254/1536),sphereDiscRadiusSourcePx:disc.radius,rngU32:state.rngU32,done:state.done };
}
function triple(seed,at) {return [at-1,at,at+1].map(t=>frame(seed,t));}
const frogs = config.board.pins.filter(p=>p.id!=='frog-01').map(p=>{
  const contacts=trials.flatMap(tr=>tr.events.filter(e=>e.type==='object_hit'&&e.objectId===p.id).map(e=>({seed:tr.seed,eventTick:e.tick,stateTick:e.tick+1,triple:triple(tr.seed,e.tick+1)})));
  let closest = null;
  for(const tr of trials)for(const s of tr.states){ const gap=Math.hypot(s.ball.pos.x-p.x,s.ball.pos.y-p.y)-p.r-ballR; if(!closest||gap<closest.clearanceNativePx)closest={...frame(tr.seed,s.tick),clearanceNativePx:gap,targetRadiusNative:p.r,ballRadiusNative:ballR}; }
  const binding=bindings.find(b=>b.targetId===p.id);
  return {id:p.id,textureId:art.instances.find(i=>i.targetId===p.id&&i.role==='body').textureId,binding,contacts,closest,contactAvailable:contacts.length>0};
});
const gates = Array.from({length:8},(_,i)=>`arch-${String(i+1).padStart(2,'0')}`).map(id=>{
  const foot = side => { const segs=config.board.segments.filter(s=>s.id.startsWith(`${id}-${side}-foot:`)),v=segs.flatMap(s=>[[s.x1,s.y1],[s.x2,s.y2]]); assert(v.length);return {minX:Math.min(...v.map(v=>v[0])),maxX:Math.max(...v.map(v=>v[0])),minY:Math.min(...v.map(v=>v[1])),maxY:Math.max(...v.map(v=>v[1]))}; };
  const left=foot('left'),right=foot('right'),opening={minX:left.maxX,maxX:right.minX,minY:Math.max(left.minY,right.minY),maxY:Math.min(left.maxY,right.maxY)};
  const contacts=trials.flatMap(tr=>tr.events.filter(e=>e.type==='object_hit'&&e.objectId.startsWith(id+'-')).map(e=>({seed:tr.seed,id:e.objectId,eventTick:e.tick,stateTick:e.tick+1,triple:triple(tr.seed,e.tick+1)})));
  const groundOpeningPasses=trials.flatMap(tr=>splitRuns(tr.states.filter(s=>{const p=s.ball.pos;return p.x>opening.minX+ballR&&p.x<opening.maxX-ballR&&p.y>=opening.minY&&p.y<=opening.maxY;}).map(s=>s.tick)).map(([a,b])=>({seed:tr.seed,range:[a,b],frames:[Math.max(0,a-1),Math.floor((a+b)/2),Math.min(tr.states.length-1,b+1)].map(t=>frame(tr.seed,t)),classification:'radius-clear of inner AABB X bounds at sampled Ground points; no height/lintel or source-silhouette proof'})));
  const binding = bindings.find(b=>b.targetId===id);
  let paintedBodyBboxCandidates = [];
  if(binding) {
    const tex=art.textures.find(t=>t.id===binding.textureId),a=tex.alpha.visibleBounds,s=binding.uniformScale,o=binding.sourceAnchor.map((v,i)=>v-tex.groundAnchorPx[i]*s),bb=[o[0]+a[0]*s,o[1]+a[1]*s,o[0]+(a[0]+a[2])*s,o[1]+(a[1]+a[3])*s],poly=[[bb[0],bb[1]],[bb[2],bb[1]],[bb[2],bb[3]],[bb[0],bb[3]]];
    paintedBodyBboxCandidates=trials.flatMap(tr=>splitRuns(tr.discs.flatMap((d,t)=>circleTouches(d,poly,bb)?[t]:[])).map(([a,b])=>({seed:tr.seed,range:[a,b],mid:frame(tr.seed,Math.floor((a+b)/2)),classification:'Bounding-box candidate only: includes transparent arch opening. No pixel-alpha, anatomical surface or actual visibility proof.'})));
  }
  return {id,openingNativeAABB:opening,contacts,groundOpeningPasses,paintedBodyBboxCandidates,nativeContactAvailable:!!contacts.length};
});
const foreground = art.instances.filter(i=>i.role==='foreground').map(spec=>{
  assert.equal(spec.sourceClipPx.coordinateSpace,'source1536');assert.equal(spec.textureId,'floor-v1');assert.equal(spec.targetId,'$source');assert.equal(spec.parentId,'floor');
  const poly=spec.sourceClipPx.polygon,bounds=[Math.min(...poly.map(p=>p[0])),Math.min(...poly.map(p=>p[1])),Math.max(...poly.map(p=>p[0])),Math.max(...poly.map(p=>p[1]))];
  const episodes=trials.flatMap(tr=>splitRuns(tr.discs.flatMap((d,t)=>circleTouches(d,poly,bounds)?[t]:[])).map(([a,b])=>{
    let peak=a,peakFraction=-1;for(let t=a;t<=b;t++){const f=fraction(tr.discs[t],poly);if(f>peakFraction){peak=t;peakFraction=f;}}
    const before=a>0?a-1:null,after=b+1<tr.states.length?b+1:null;
    if(before!==null)assert(!circleTouches(tr.discs[before],poly,bounds));if(after!==null)assert(!circleTouches(tr.discs[after],poly,bounds));
    return {seed:tr.seed,overlapRange:[a,b],peakTick:peak,peakSampleFraction:peakFraction,peakCenterInside:inside(tr.discs[peak].center,poly),peakCenterBoundaryDistanceSourcePx:boundaryDistance(tr.discs[peak].center,poly),hasClearBeforeAndAfter:before!==null&&after!==null,frames:{before:frame(tr.seed,before),firstOverlap:frame(tr.seed,a),peak:frame(tr.seed,peak),lastOverlap:frame(tr.seed,b),after:frame(tr.seed,after)},shortMotionEntryRange:[Math.max(0,a-8),Math.min(tr.states.length-1,a+12)],shortMotionExitRange:after===null?null:[Math.max(0,b-8),Math.min(tr.states.length-1,b+12)]};
  }));
  const groundInsideRanges=trials.flatMap(tr=>splitRuns(tr.discs.flatMap((d,t)=>inside(d.ground,poly)?[t]:[])).map(range=>({seed:tr.seed,range})));
  let closest = null;
  for(const tr of trials)for(let t=0;t<tr.states.length;t++) { const d=tr.discs[t],edge=boundaryDistance(d.center,poly),gap=(inside(d.center,poly)?-edge:edge)-d.radius;if(!closest||gap<closest.signedDiscClearanceSourcePx)closest={...frame(tr.seed,t),signedDiscClearanceSourcePx:gap}; }
  return {id:spec.id,polygonSource1536:poly,boundsSourcePx:bounds,rawToSourceUniformScale:1536/1254,boundaryUncertaintySourcePx:3*1536/1254,episodes,groundInsideRanges,closest,classification:episodes.length?'Analytically available visual-disc overlap; actual/anatomical masking unverified':'No visual-disc overlap at cached 5ms states0–3; dynamic unverified, no invented sub-tick motion'};
});
const artistCommit='189fe2e7f4264270f60b4a2ebe247d0d49b3c72e',oldCommit='9647869d6dbf672ee5922b0fc57df254b9fdbb93';
const old=JSON.parse(execFileSync('git',['show',oldCommit+':experiments/p5-regenerated-objects/transfer-water-dark/water/asset-artist/asset-manifest.mini-04-receiver-parts.json']));
const oldDelta={instances:old.instances.length,textures:old.textures.length,changedInstances:old.instances.filter(i=>JSON.stringify(i)!==JSON.stringify(art.instances.find(n=>n.id===i.id))).map(i=>i.id),changedTextures:old.textures.filter(i=>JSON.stringify(i)!==JSON.stringify(art.textures.find(n=>n.id===i.id))).map(i=>i.id)};
const result={status:'ANALYTICAL PLAN ONLY; actual stage not performed by this script',artistCommit,artistManifest:pin(artPath),supporting:[pin(`${root}/HANDOFF.md`),pin(`${root}/BINDINGS.json`)],sourceInputs:{config:pin(`${oracle}/common/config.json`),p1Manifest:pin(`${oracle}/common/manifest.json`)},oldMini04Delta:oldDelta,oracleRefs:trials.map(tr=>({seed:tr.seed,...tr.refs,states:tr.states.length,terminalTick:tr.terminal.tick,result:tr.terminal.result})),method:{coordinates:'Native Ground -> P1 source1536 homography; ball sprite uniform width fit and [625,624]-[625,1147] visual lift. Foreground polygons remain source1536; raw1254=source*1254/1536.',sphereProxy:'Projected sprite bounding-width circle; 317 equal grid probes for ranking only, not PNG alpha or exact Pixi visibility.',collisionTiming:'object_hit event tick t -> post-step state t+1. Terminal lifecycle already post-step.',scope:'Read existing complete seeds0–3 only. No re-simulation, core export/compile, browser, product writes, or invented/extrapolated trajectory.'},frogs,gates,foreground,receiverRegression:{seed:2,ticks:[1273,1274,1275],sameStateViewsTick:1274,reference:`${base}/w05/`,frontNote:'W05-TQA-L01 NOTE/front-hide UNVERIFIED retained; no artificial hiding case/sorting fix',field:'Pin first actual w06 Field domain and require state/view/replay invariance; record art-envelope delta from w05, no compensation/manual offset.'},newNativeRuns:0,newSeeds:0,browserStage:false,fullPass:false,serverWrites:0,tokenGranted:false};
writeFileSync(`${root}/case-analysis.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({frogs:frogs.map(f=>({id:f.id,contacts:f.contacts.map(c=>[c.seed,c.stateTick]),closest:[f.closest.seed,f.closest.tick,f.closest.clearanceNativePx]})),gates:gates.map(g=>({id:g.id,contacts:g.contacts.map(c=>[c.seed,c.stateTick,c.id]),opening:g.groundOpeningPasses.map(c=>[c.seed,...c.range])})),foreground:foreground.map(f=>({id:f.id,episodes:f.episodes.map(e=>({seed:e.seed,range:e.overlapRange,peak:e.peakTick,fraction:e.peakSampleFraction,clearEnds:e.hasClearBeforeAndAfter}))})),oldDelta},null,2));
