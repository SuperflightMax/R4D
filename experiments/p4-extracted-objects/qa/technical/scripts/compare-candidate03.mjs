import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {registerHooks} from 'node:module';

const [preparedArg,candidateArg,evidenceArg]=process.argv.slice(2);
if(![preparedArg,candidateArg,evidenceArg].every(Boolean))throw Error('Usage: node compare-candidate03.mjs <existing-oracle-runtime> <frozen03> <own03-evidence>');
const prepared=resolve(preparedArg),candidate=resolve(candidateArg),evidence=resolve(evidenceArg);
const digest=b=>createHash('sha256').update(b).digest('hex');
const json=p=>JSON.parse(readFileSync(p));
const inputs=json(join(prepared,'input-verification.json'));
for(const f of inputs.nativeFiles)assert.equal(digest(readFileSync(join(prepared,'native',f.path))),f.sha256);
for(const f of inputs.records)assert.equal(digest(readFileSync(join(prepared,'inputs',f.name))),f.sha256);
assert.equal(digest(readFileSync(join(candidate,'artifact.json'))),'298649ec518a13e8070201e822108005a6b5081454452f50243d18f2fde2d542');
assert.equal(digest(readFileSync(join(candidate,'native-runtime.js'))),'8843446996582eaccbd9ff63d3147d74b7eca9a614d8e0df16851d1d89d46f50');
const native=join(prepared,'native/packages/sim-core/src'),prefix=pathToFileURL(native+'/').href;
registerHooks({resolve(s,c,next){return next(c.parentURL?.startsWith(prefix)&&s.startsWith('.')&&s.endsWith('.js')?s.slice(0,-3)+'.ts':s,c);}});
const core=await import(pathToFileURL(join(native,'Sim.ts')).href);
const {transform}=await import(pathToFileURL(join(prepared,'inputs/view-math.mjs')).href);
const cfg=json(join(prepared,'inputs/config.json'));
const rawRecords=json(join(evidence,'ui-records.json'));
const transport=json(join(evidence,'observation-transport.json'));
const records=rawRecords.filter(r=>r.label!==transport.excludedLabel);
assert.deepEqual(rawRecords.find(r=>r.label===transport.excludedLabel).state,records.find(r=>r.label===transport.replacementLabel).state);
const transitions=json(join(evidence,'clock-transitions.json'));
const requested=new Map();
for(const r of records){if(!requested.has(r.state.seed))requested.set(r.state.seed,new Set());requested.get(r.state.seed).add(r.state.tick);}
const expected=new Map(),prefixes=[];
for(const [seed,targets] of requested){
  const config=structuredClone(cfg);config.rng.seed=seed;
  const events=[],run=core.createSimRunSession(config,{onEvent:e=>events.push(structuredClone(e))});
  const max=Math.max(...targets),limit=Math.ceil(config.board.timeSecMax*1000/config.defaults.tickMs);
  function capture(){if(targets.has(run.state.tick))expected.set(`${seed}:${run.state.tick}`,{state:{...structuredClone(run.state),seed,dropId:run.dropId,tickMs:config.defaults.tickMs,timeSec:run.state.tick*config.defaults.tickMs/1000,status:run.status,started:run.started,finished:run.finished},events:structuredClone(events)});}
  capture();
  while(run.state.tick<max&&!run.finished){core.stepSimRunSession(run);if(!run.finished&&run.state.tick>=limit)core.timeoutSimRunSession(run);capture();}
  prefixes.push({seed,lastRequestedTick:max,nativeSteps:run.state.tick});
}
const uiChecks=records.map(r=>{const actual=expected.get(`${r.state.seed}:${r.state.tick}`);assert(actual,r.label);assert.deepEqual(r.state,actual.state,`native state ${r.label}`);assert.deepEqual(r.events,actual.events,`native events ${r.label}`);return{label:r.label,seed:r.state.seed,tick:r.state.tick,status:'PASS'};});
for(const t of transitions)assert(t.to>t.from,`No real progress: ${t.case}`);
const get=label=>records.find(r=>r.label===label);
for(const label of ['same-file-first605','same-file-second605','mode-flags605'])assert.deepEqual(get(label).state,get('manual-import605').state);
assert.deepEqual(get('manual606').state,get('mode-flags606').state);
assert.deepEqual(get('manual606').events,get('mode-flags606').events);
assert.deepEqual(get('seek824-play-paused').state,get('exact-pause-repeat').state);
assert.deepEqual(get('seek824-play-paused').events,get('exact-pause-repeat').events);
assert.equal(json(join(evidence,'console.json')).length,0);

const state=get('shadow590').state,H=json(join(prepared,'inputs/manifest.json')).projection.nativeToSource;
const manifest=json(join(candidate,'art/manifest.json')),b=manifest.ball;
const actor=json(join(evidence,'shadow590-inspection.json')).actor;
const p=transform(H,state.ball.pos),w=H[2][0]*state.ball.pos.x+H[2][1]*state.ball.pos.y+H[2][2],r=cfg.board.ball.r/w;
function close(a,b){assert(Math.abs(a-b)<1e-12,`${a} != ${b}`);}
close(actor.radius,r);close(actor.center.x,p.x);close(actor.center.y,p.y);
close(actor.shadowCenter.x,p.x+r*b.render.shadowSourceCenterOffsetR[0]);
close(actor.shadowCenter.y,p.y+r*b.render.shadowSourceCenterOffsetR[1]);
close(actor.shadowScale[0],r*b.render.shadowSourceContentHalfSizeR[0]/b.shadow.contentRadiusPx[0]);
close(actor.shadowScale[1],r*b.render.shadowSourceContentHalfSizeR[1]/b.shadow.contentRadiusPx[1]);
assert.equal(actor.rendered.shadow.sourceAlpha,b.shadow.opacityMultiplier);
assert(actor.rendered.shadow.sourceVisible&&!actor.rendered.shadow.flatVisible);
assert.equal(actor.rendered.shadow.textureAlphaMode,'premultiply-alpha-on-upload');
for(const name of ['groundAlpha','artRootAlpha','worldAlpha','stageAlpha'])assert.equal(actor.rendered[name],1);
close(actor.rendered.body.scale.x,r/b.body.contentRadiusPx[0]);
close(actor.rendered.body.scale.y,r/b.body.contentRadiusPx[0]);
assert.deepEqual(actor.rendered.body.position,actor.center);
assert.equal(actor.rendered.body.sourceAlpha,1);
assert.deepEqual(actor.rendered.shadow.position,actor.shadowCenter);
const report={candidate:'p4-full-v03-candidate-03',artifactSha256:'298649ec518a13e8070201e822108005a6b5081454452f50243d18f2fde2d542',scope:'targeted current03 UI states/events, actual clock progress and shadow application; no new seed matrix or native build',reusedOracleCommit:'6b011256d31c4ab0e617721420a92feda65ffbfd',unchangedBundleReference:'candidate02 exact SHA and independent comparison in cae522158d74f12765d766c71874886ce53465cc',prefixes,uiChecks,replacedObservation:transport,transitions,consoleErrors:0,manualSameFilePauseAndModes:'PASS',shadow:{status:'PASS for numeric application',radius:actor.radius,center:actor.shadowCenter,scale:actor.shadowScale,renderedAlpha:actor.rendered.shadow.sourceAlpha,visibleSource:true,flatVisible:false}};
writeFileSync(join(evidence,'oracle-regression.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({uiChecks:uiChecks.length,prefixes,positiveClockCases:transitions.length,consoleErrors:0,shadowApplication:'PASS'}));
