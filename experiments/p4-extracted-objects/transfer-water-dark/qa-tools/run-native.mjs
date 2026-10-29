import assert from 'node:assert/strict';
import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {registerHooks} from 'node:module';

const [oracleArg,boardArg]=process.argv.slice(2);
if(!oracleArg||!boardArg)throw Error('Usage: node run-native.mjs <existing-own-jungle-oracle> <own-board-runtime>');
const oracle=resolve(oracleArg),out=resolve(boardArg),sha=b=>createHash('sha256').update(typeof b==='string'?b:JSON.stringify(b)).digest('hex');
const json=p=>JSON.parse(readFileSync(p)),copy=x=>structuredClone(x);
const binding=json(join(out,'INPUTS.json')),proof=json(join(oracle,'input-verification.json'));
const fileSha=b=>createHash('sha256').update(b).digest('hex');
for(const f of proof.nativeFiles)assert.equal(fileSha(readFileSync(join(oracle,'native',f.path))),f.sha256);
for(const f of binding.objects)assert.equal(fileSha(readFileSync(join(out,'inputs',f.file))),f.sha256);
const native=join(oracle,'native/packages/sim-core/src'),prefix=pathToFileURL(native+'/').href;
registerHooks({resolve(s,c,next){return next(c.parentURL?.startsWith(prefix)&&s.startsWith('.')&&s.endsWith('.js')?s.slice(0,-3)+'.ts':s,c);}});
const core=await import(pathToFileURL(join(native,'Sim.ts')).href);
const {validateConfig}=await import(pathToFileURL(join(native,'validate/validateConfig.ts')).href);
const {PrngLcg32}=await import(pathToFileURL(join(native,'PrngLcg32.ts')).href);
const {transform}=await import(pathToFileURL(join(out,'inputs/view-math.mjs')).href);
const cfg=json(join(out,'inputs/config.json')),manifest=json(join(out,'inputs/manifest.json'));
const write=(name,value)=>{const text=JSON.stringify(value,null,2)+'\n';writeFileSync(join(out,name),text);return sha(text);};
function immutable(name,text){const p=join(out,name);mkdirSync(resolve(p,'..'),{recursive:true});if(existsSync(p))assert.equal(readFileSync(p,'utf8'),text,`Existing raw evidence differs: ${name}`);else writeFileSync(p,text,{flag:'wx'});return sha(text);}

// Static measurement of supplied geometry only; no alternate integration/collision code.
function nearest(p,s){const dx=s.x2-s.x1,dy=s.y2-s.y1,l=dx*dx+dy*dy;const t=Math.max(0,Math.min(1,l?((p.x-s.x1)*dx+(p.y-s.y1)*dy)/l:0));const q={x:s.x1+t*dx,y:s.y1+t*dy};return {id:s.id,t,point:q,distance:Math.hypot(p.x-q.x,p.y-q.y)};}
function clearances(p){return [...cfg.board.segments.map(s=>({...nearest(p,s),kind:'segment',margin:nearest(p,s).distance-cfg.board.ball.r})),...cfg.board.pins.map(s=>({id:s.id,kind:'pin',distance:Math.hypot(p.x-s.x,p.y-s.y),margin:Math.hypot(p.x-s.x,p.y-s.y)-s.r-cfg.board.ball.r}))].sort((a,b)=>a.margin-b.margin);}
function interval(edges,y){const xs=[];for(const s of edges){if(y<Math.min(s.y1,s.y2)-1e-8||y>Math.max(s.y1,s.y2)+1e-8)continue;if(s.y1===s.y2){xs.push(s.x1,s.x2);}else xs.push(s.x1+(y-s.y1)/(s.y2-s.y1)*(s.x2-s.x1));}return {min:Math.min(...xs),max:Math.max(...xs)};}
const seeds=[0,1,2]; // Fixed before observing outcomes, retained in full.
assert.deepEqual(validateConfig(cfg),[]);
assert.deepEqual(cfg.defaults,{tickMs:5,quantizeDigits:7});
assert.deepEqual(cfg.physics,{gravityY:980,maxBallSpeed:2000,angleDeviationDeg:2,bounceDeviation:0.02,wallBounce:1});
assert.equal(cfg.board.ball.r,16);assert.equal(cfg.rng.algo,'lcg32');assert.equal(cfg.rng.seed,0);
const configBefore=sha(cfg),manifestBefore=sha(manifest);
const points=[...cfg.board.pins,...cfg.board.buckets,...cfg.board.drops,...cfg.board.segments.flatMap(s=>[{x:s.x1,y:s.y1},{x:s.x2,y:s.y2}])];
let maxRoundTrip=0;for(const p of points){const projected=transform(manifest.projection.nativeToSource,p),back=transform(manifest.projection.sourceToNative,projected);maxRoundTrip=Math.max(maxRoundTrip,Math.hypot(back.x-p.x,back.y-p.y));}assert(maxRoundTrip<1e-8);
const startup={drop:cfg.board.drops[0],nearest:clearances(cfg.board.drops[0]).slice(0,3),nativeSessionCreated:false};
const maxTicks=Math.ceil(cfg.board.timeSecMax*1000/cfg.defaults.tickMs);
function run(seed,checkpoint=null,stopAfter=null){
  const c=copy(cfg);c.rng.seed=seed;const events=[];
  const session=core.createSimRunSession(c,{onEvent:e=>events.push(copy(e))});
  if(checkpoint){Object.assign(session.state,copy(checkpoint));events.length=0;}
  const frames=[{state:copy(session.state),events:events.splice(0)}];
  while(!session.finished&&session.state.tick<maxTicks&&(!stopAfter||frames.length<=stopAfter)){
    core.stepSimRunSession(session);if(!session.finished&&session.state.tick>=maxTicks)core.timeoutSimRunSession(session);
    frames.push({state:copy(session.state),events:events.splice(0)});
  }
  return {frames,session,config:c};
}
const summaries=[],allHits=[],runs=new Map(),selected=[];
function window(seed,tick,label,extra={}){const frames=runs.get(seed),end=frames.length-1;tick=Math.max(0,Math.min(tick,end));const at=frames[tick];selected.push({label,seed,tick,...extra,frames:[Math.max(0,tick-1),tick,Math.min(end,tick+1)].map(t=>({state:frames[t].state,events:frames[t].events})),eventsThroughTick:frames.slice(0,tick+1).flatMap(f=>f.events)});return at;}
for(const seed of seeds){
  const result=run(seed),frames=result.frames;startup.nativeSessionCreated=true;runs.set(seed,frames);
  const final=frames.at(-1).state;
  assert.deepEqual(core.runUntilDone(copy(result.config)).result,final.result);
  for(let i=1;i<frames.length;i++){
    assert.equal(frames[i].state.tick,i);const p=new PrngLcg32(frames[i-1].state.rngU32);
    for(const e of frames[i].events.filter(e=>e.type==='object_hit'&&e.objectKind!=='bucket')){p.nextU32();p.nextU32();assert.equal(e.tick,i-1);}
    assert.equal(frames[i].state.rngU32,p.state.u32);
  }
  const contacts=frames.flatMap(f=>f.events.filter(e=>e.type==='object_hit').map(e=>{const s=cfg.board.segments.find(s=>s.id===e.objectId),near=s?nearest({x:e.x,y:e.y},s):null;return {...e,seed,postStateTick:e.objectKind==='bucket'?e.tick:e.tick+1,segment:near,contactClass:s?(e.objectId.includes(':')?(near.t<1e-8||near.t>1-1e-8?'endpoint/corner':'segment-face'):'boundary'):e.objectKind};}));
  allHits.push(...contacts);
  const jsonl=frames.map(f=>JSON.stringify(f)).join('\n')+'\n';
  const trajectorySha=immutable(`runs/seed-${seed}.jsonl`,jsonl);
  if(seed===0){assert.deepEqual(run(seed).frames,frames);const first=contacts.find(e=>e.objectKind!=='bucket');if(first){const from=Math.max(1,first.tick-1),continued=run(seed,frames[from].state,3);assert.deepEqual(continued.frames.slice(1),frames.slice(from+1,from+continued.frames.length));}}
  const logical=copy(result.config);logical.rng.seed=cfg.rng.seed;assert.deepEqual(logical,cfg);
  const summary={seed,ticks:final.tick,result:final.result,initialState:frames[0].state,finalState:final,contactCount:contacts.length,physicalTraceSha256:sha(frames.map(f=>f.state.ball)),trajectorySha256:trajectorySha,firstContact:contacts[0]??null};summaries.push(summary);
  for(const [label,predicate] of [['first-contact',()=>true],['support-contact',e=>e.objectId.startsWith('arch-')],['face-contact',e=>e.contactClass==='segment-face'],['corner-contact',e=>e.contactClass==='endpoint/corner'],['border-contact',e=>e.contactClass==='boundary']]){const e=contacts.find(predicate);if(e)window(seed,e.postStateTick,label,{contact:e});}
  window(seed,final.tick,'terminal');
  immutable(`runs/seed-${seed}.replay.json`,JSON.stringify({schema:'r4d.p4.transfer.qa.oracle-run.v1',board:binding.board,inputConfigSha256:binding.objects.find(f=>f.file==='config.json').sha256,manifestSha256:binding.objects.find(f=>f.file==='manifest.json').sha256,acceptedP1Revision:binding.acceptedP1Revision,coreCommit:proof.nativeCommit,seed,config:result.config,state:final,events:frames.flatMap(f=>f.events)},null,2)+'\n');
}
const receiverApproaches=cfg.board.buckets.map(b=>{
  let best=null;for(const [seed,frames] of runs)for(const f of frames){const distance=Math.hypot(f.state.ball.pos.x-b.x,f.state.ball.pos.y-b.y);if(!best||distance<best.distance)best={seed,tick:f.state.tick,distance,bucket:b.id,margin:distance-b.r};}
  best.observedCapture=summaries.some(r=>r.result.kind==='IN_BUCKET'&&r.result.bucketId===b.id);
  window(best.seed,best.tick,'closest-receiver-approach',best);return best;
});
const gates=[];
if(binding.board==='water'){
  for(let n=1;n<=8;n++){
    const id=`arch-${String(n).padStart(2,'0')}`,left=cfg.board.segments.filter(s=>s.id.startsWith(id+'-left-foot:')),right=cfg.board.segments.filter(s=>s.id.startsWith(id+'-right-foot:'));
    const low=Math.max(Math.min(...left.flatMap(s=>[s.y1,s.y2])),Math.min(...right.flatMap(s=>[s.y1,s.y2]))),high=Math.min(Math.max(...left.flatMap(s=>[s.y1,s.y2])),Math.max(...right.flatMap(s=>[s.y1,s.y2])));
    const ys=[low,(low+high)/2,high],samples=ys.map(y=>{const l=interval(left,y),r=interval(right,y),p={x:(l.max+r.min)/2,y};return{y,leftInner:l.max,rightInner:r.min,width:r.min-l.max,horizontalWidthMinusDiameter:r.min-l.max-2*cfg.board.ball.r,center:p,nearestAll:clearances(p)[0]};});
    const passages=[];for(const [seed,frames] of runs){let first=null,last=null;for(let i=0;i<frames.length;i++){const p=frames[i].state.ball.pos;let inside=false;if(p.y>=low&&p.y<=high){const l=interval(left,p.y),r=interval(right,p.y);inside=p.x>l.max&&p.x<r.min&&[...left,...right].every(s=>nearest(p,s).distance>=cfg.board.ball.r-1e-6);}if(inside){if(first===null)first=i;last=i;}if((!inside||i===frames.length-1)&&first!==null){const before=frames[Math.max(0,first-1)].state.ball.pos,after=frames[Math.min(frames.length-1,last+1)].state.ball.pos;const crosses=before.y<low&&after.y>high;passages.push({seed,firstTick:first,lastTick:last,crossesFullFootBand:crosses});if(crosses)window(seed,Math.round((first+last)/2),'native-support-gap-crossing',{gate:id,firstTick:first,lastTick:last});first=null;last=null;}}}
    gates.push({id,footSegmentIds:[...left,...right].map(s=>s.id),band:[low,high],samples,supportGapClassification:samples.every(s=>s.width>32)?'support-only horizontal gap wider than diameter':samples.every(s=>s.width<=32)?'support gap closed throughout sampled band':'bottleneck/needs exact path assessment',ordinaryPassages:passages,ordinarySupportHits:allHits.filter(e=>e.objectId.startsWith(id+'-')).map(e=>({seed:e.seed,tick:e.tick,objectId:e.objectId,postStateTick:e.postStateTick}))});
  }
}
let cornerNearest=null;
if(binding.board==='dark')for(const [seed,frames] of runs)for(const f of frames)for(const s of cfg.board.segments.filter(s=>s.id.includes(':'))){const p=f.state.ball.pos,d=Math.hypot(p.x-s.x1,p.y-s.y1);if(!cornerNearest||d<cornerNearest.centerDistance)cornerNearest={seed,tick:f.state.tick,edge:s.id,vertex:{x:s.x1,y:s.y1},centerDistance:d,marginToBallRadius:d-cfg.board.ball.r};}
if(cornerNearest)window(cornerNearest.seed,cornerNearest.tick,'closest-polygon-vertex',cornerNearest);
assert.equal(sha(cfg),configBefore);assert.equal(sha(manifest),manifestBefore);
const report={schema:'r4d.p4.transfer.qa.native-prep.v1',board:binding.board,activeTrial:binding.activeTrial,scope:'native/input preparation only; no consumer or Art PASS',binding,startup,settings:{defaults:cfg.defaults,physics:cfg.physics,ball:cfg.board.ball,drops:cfg.board.drops},projection:{checkedPoints:points.length,maxRoundTrip},seeds,summaries,distinctPhysicalTraces:new Set(summaries.map(s=>s.physicalTraceSha256)).size,seed0ExactReplay:true,seed0ObservedCheckpointRestoration:true,receiverApproaches,gates,cornerNearest,lintelOrHeightCollidersGenerated:manifest.generatedShorelineHeightOrLintelColliders??null};
write('contact-windows.json',allHits);write('selected-windows.json',selected);const reportSha=write('NATIVE_PREP.json',report);
console.log(JSON.stringify({board:binding.board,report:join(out,'NATIVE_PREP.json'),reportSha256:reportSha,startupNearest:startup.nearest[0],projection:report.projection,runs:summaries.map(s=>({seed:s.seed,ticks:s.ticks,result:s.result,contacts:s.contactCount})),distinctPhysicalTraces:report.distinctPhysicalTraces,selectedWindows:selected.length,gatePassages:gates.map(g=>({id:g.id,widths:g.samples.map(s=>s.width),crossings:g.ordinaryPassages.filter(p=>p.crossesFullFootBand)})),cornerNearest}));
