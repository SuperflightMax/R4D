// Independent numerical registration checks for the accepted P1 geometry.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
const runtime = path.resolve(process.argv[2]);
const qaDir = path.dirname(fileURLToPath(import.meta.url));
const common = path.join(runtime, 'inputs/common');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const read = name => fs.readFileSync(path.join(common, name));
const manifest = JSON.parse(read('manifest.json'));
const cfg = JSON.parse(read('config.json'));
const receipt = JSON.parse(fs.readFileSync(path.join(qaDir, 'common-inputs.json')));
for (const input of receipt.common_inputs) assert.equal(hash(read(input.name)), input.sha256);
const { project } = await import(pathToFileURL(path.join(common, 'projection.mjs')));
const { transform, inverseImageMesh } = await import(pathToFileURL(path.join(common, 'view-math.mjs')));
const H = manifest.projection.nativeToSource, I = manifest.projection.sourceToNative;
function projectIndependent(M, p) {
  const homogeneous = M.map(row => row.reduce((s,v,i) => s+v*[p[0],p[1],1][i],0));
  return homogeneous.slice(0,2).map(v => v/homogeneous[2]);
}
function invert3(m) {
  const [a,b,c,d,e,f,g,h,i] = m.flat();
  const adj = [[e*i-f*h,c*h-b*i,b*f-c*e],[f*g-d*i,a*i-c*g,c*d-a*f],[d*h-e*g,b*g-a*h,a*e-b*d]];
  const det = a*adj[0][0]+b*adj[1][0]+c*adj[2][0];
  assert.ok(Math.abs(det)>1e-15);
  return { inverse: adj.map(row => row.map(v=>v/det)), determinant: det };
}
const { inverse: independentInverse, determinant } = invert3(H);
let maxRoundTripNative = 0, maxRoundTripSource = 0, maxFunctionDisagreement = 0, maxDeclaredInverseDifference = 0;
function checkNative(p) {
  const q = project(H,p), q2 = projectIndependent(H,p), q3 = transform(H,{x:p[0],y:p[1]});
  maxFunctionDisagreement = Math.max(maxFunctionDisagreement, Math.hypot(q[0]-q2[0],q[1]-q2[1]),Math.hypot(q[0]-q3.x,q[1]-q3.y));
  const back = project(I,q);
  maxRoundTripNative = Math.max(maxRoundTripNative,Math.hypot(back[0]-p[0],back[1]-p[1]));
  const independentBack = projectIndependent(independentInverse,q);
  maxDeclaredInverseDifference = Math.max(maxDeclaredInverseDifference,Math.hypot(back[0]-independentBack[0],back[1]-independentBack[1]));
  return q;
}
function checkSource(p) {
  const back = project(H,project(I,p));
  maxRoundTripSource = Math.max(maxRoundTripSource,Math.hypot(back[0]-p[0],back[1]-p[1]));
}
const sourceCorners = [[0,0],[1536,0],[1536,1536],[0,1536]];
sourceCorners.forEach(checkSource);
for (let row=0;row<=24;row++) for (let col=0;col<=24;col++) checkSource([col*64,row*64]);
const whole = manifest.projection.wholeSourceNativePolygon;
whole.forEach((p,i) => assert.ok(Math.hypot(...checkNative(p).map((v,j)=>v-sourceCorners[i][j]))<1e-7));
const floor = manifest.projection.playableFloorNativePolygon.map(checkNative);
const receiverSegments = cfg.board.segments.filter(s=>s.id.startsWith('near-divider-'));
const landmarks = [];
function circle(kind,p) {
  const center = checkNative([p.x,p.y]);
  const ringNative = Array.from({length:128},(_,i)=>[p.x+p.r*Math.cos(i*Math.PI/64),p.y+p.r*Math.sin(i*Math.PI/64)]);
  const contour = ringNative.map(checkNative);
  const bounds = { minX:Math.min(...contour.map(p=>p[0])),maxX:Math.max(...contour.map(p=>p[0])),minY:Math.min(...contour.map(p=>p[1])),maxY:Math.max(...contour.map(p=>p[1])) };
  const item = {kind,id:p.id,nativeCenter:[p.x,p.y],nativeRadius:p.r,sourceCenter:center,sourceBounds:bounds,sourceContour:contour};
  landmarks.push(item); return item;
}
const pins = cfg.board.pins.map(p=>circle('pin',p));
const buckets = cfg.board.buckets.map(p=>circle('bucket',p));
const segments = cfg.board.segments.map(s=>({kind:'segment',id:s.id,native:[[s.x1,s.y1],[s.x2,s.y2]],source:[checkNative([s.x1,s.y1]),checkNative([s.x2,s.y2])]}));
const drop = cfg.board.drops[0];
const start = {id:drop.id,native:[drop.x,drop.y],source:checkNative([drop.x,drop.y]),angleDeg:drop.angleDeg,speed:drop.speed};
const mesh = inverseImageMesh(I,1536,1536);
assert.equal(mesh.vertices.length,97*97*2);
const cornerOffsets = [0,96*2,(96*97+96)*2,(96*97)*2];
let maxMeshCornerNativeError=0;
cornerOffsets.forEach((offset,i)=>{maxMeshCornerNativeError=Math.max(maxMeshCornerNativeError,Math.hypot(mesh.vertices[offset]-whole[i][0],mesh.vertices[offset+1]-whole[i][1]));});
assert.ok(maxRoundTripNative<1e-7);
assert.ok(maxRoundTripSource<1e-7);
assert.ok(maxFunctionDisagreement<1e-9);
assert.ok(maxDeclaredInverseDifference<1e-7);
// View-math stores mesh positions in Float32: report that precision, do not call it exact.
assert.ok(maxMeshCornerNativeError<0.004);
const contactChecks=[];
for(const seed of [0,1,2]) {
  const run=JSON.parse(fs.readFileSync(path.join(runtime,'oracle',`seed-${seed}.json`)));
  const hits=run.events.filter(e=>e.type==='object_hit'&&e.objectKind!=='bucket');
  const first=hits[0];
  const lateral=hits.find(e=>{
    const pin=cfg.board.pins.find(p=>p.id===e.objectId);
    return pin && Math.abs(e.x-pin.x)>Math.abs(e.y-pin.y);
  });
  const selected=[first,lateral,hits.at(-1)].filter(Boolean).filter((e,i,all)=>all.findIndex(x=>x.tick===e.tick&&x.objectId===e.objectId)===i);
  const eventPoints=selected.map(e=>({event:e,stateTicks:[e.tick,e.tick+1,e.tick+2].filter(t=>t<run.states.length),
    projectedStates:[e.tick,e.tick+1,e.tick+2].filter(t=>t<run.states.length).map(t=>({tick:t,sourceCenter:checkNative([run.states[t].ball.pos.x,run.states[t].ball.pos.y]),rngU32:run.states[t].rngU32}))}));
  const bucket=run.events.find(e=>e.type==='bucket_entered');
  contactChecks.push({seed,contacts:eventPoints,terminal:{tick:run.states.at(-1).tick,result:run.states.at(-1).result},
    bucketEntry:bucket?{event:bucket,stateTicks:[bucket.tick-1,bucket.tick]}:null});
}
const geometry={schema:'r4d.p6.qa.registration.v1',sourceWidth:1536,sourceHeight:1536,configSha256:hash(read('config.json')),manifestSha256:hash(read('manifest.json')),
  nativeToSource:H,sourceToNative:I,sourceCorners,floor,wholeSourceNativePolygon:whole,start,landmarks,segments,contactChecks};
const save=(name,obj)=>fs.writeFileSync(path.join(qaDir,name),JSON.stringify(obj,null,2)+'\n');
save('registration-landmarks.json',geometry);
const points=ring=>ring.map(p=>p.map(n=>n.toFixed(6)).join(',')).join(' ');
const shapes=[`<polygon points="${points(floor)}" stroke="#00ff80" stroke-width="2"/>`,
  ...pins.map(p=>`<polygon points="${points(p.sourceContour)}" stroke="#00ffff" stroke-width="2"/><text x="${p.sourceCenter[0].toFixed(4)}" y="${p.sourceCenter[1].toFixed(4)}" fill="#ffffff">${p.id}</text>`),
  ...buckets.map(p=>`<polygon points="${points(p.sourceContour)}" stroke="#ffcc00" stroke-width="2"/>`),
  ...segments.map(s=>`<polyline points="${points(s.source)}" stroke="#ff00ff" stroke-width="2"/>`),
  `<circle cx="${start.source[0]}" cy="${start.source[1]}" r="5" stroke="#ffffff" stroke-width="2"/>`];
fs.writeFileSync(path.join(qaDir,'registration-overlay.svg'),`<svg xmlns="http://www.w3.org/2000/svg" width="1536" height="1536" viewBox="0 0 1536 1536"><g fill="none" font-size="14" font-family="sans-serif">${shapes.join('')}</g></svg>\n`);
const report={scope:'numerical common-input registration only; no art or frozen consumer evaluated',configSha256:hash(read('config.json')),manifestSha256:hash(read('manifest.json')),
  counts:{pins:pins.length,segments:segments.length,buckets:buckets.length,drops:cfg.board.drops.length,floorVertices:floor.length},determinant,
  maxRoundTripNative,maxRoundTripSource,maxFunctionDisagreement,maxDeclaredInverseDifference,maxMeshCornerNativeError,
  overlaySha256:hash(fs.readFileSync(path.join(qaDir,'registration-overlay.svg'))),landmarksSha256:hash(fs.readFileSync(path.join(qaDir,'registration-landmarks.json'))),
  controlPoints:[start,...['flower-01','leaf-01','frog-01','frog-04','flower-07','wood-08'].map(id=>{const p=pins.find(p=>p.id===id);return {id,sourceCenter:p.sourceCenter,sourceBounds:p.sourceBounds};}),...buckets.map(p=>({id:p.id,sourceCenter:p.sourceCenter}))],
  contactChecks};
save('projection-check.json',report);
console.log(JSON.stringify({...report,contactChecks:report.contactChecks.map(x=>({seed:x.seed,contacts:x.contacts.map(c=>({id:c.event.objectId,tick:c.event.tick,stateTicks:c.stateTicks})),terminal:x.terminal,bucketEntry:x.bucketEntry}))},null,2));
