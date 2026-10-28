import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {registerHooks} from 'node:module';
import {createHash} from 'node:crypto';

// Read-only candidate; all output goes to the QA runtime argument.
const [preparedArg,candidateArg,evidenceArg]=process.argv.slice(2);
if(![preparedArg,candidateArg,evidenceArg].every(Boolean))throw Error('Usage: node compare-candidate02.mjs <existing-oracle-runtime> <frozen-candidate> <qa-evidence-runtime>');
const prepared=resolve(preparedArg),candidate=resolve(candidateArg),evidence=resolve(evidenceArg);
const digest=bytes=>createHash('sha256').update(bytes).digest('hex');
const oracleInputs=JSON.parse(readFileSync(join(prepared,'input-verification.json')));
for(const f of oracleInputs.nativeFiles)assert.equal(digest(readFileSync(join(prepared,'native',f.path))),f.sha256);
for(const f of oracleInputs.records)assert.equal(digest(readFileSync(join(prepared,'inputs',f.name))),f.sha256);
assert.equal(digest(readFileSync(join(candidate,'artifact.json'))),'c7815edc846749478e56e76d072233ae5a6fcd0ee86d2c14f9936379bff9b757');
assert.equal(digest(readFileSync(join(candidate,'native-runtime.js'))),'8843446996582eaccbd9ff63d3147d74b7eca9a614d8e0df16851d1d89d46f50');
const native=join(prepared,'native/packages/sim-core/src');
const prefix=pathToFileURL(native+'/').href;
registerHooks({resolve(s,c,next){return next(c.parentURL?.startsWith(prefix)&&s.startsWith('.')&&s.endsWith('.js')?s.slice(0,-3)+'.ts':s,c);}});
const oracle=await import(pathToFileURL(join(native,'Sim.ts')).href);
const bundle=await import(pathToFileURL(join(candidate,'native-runtime.js')).href);
const cfg=JSON.parse(readFileSync(join(prepared,'inputs/config.json')));
const artifact=JSON.parse(readFileSync(join(candidate,'artifact.json')));
const records=JSON.parse(readFileSync(join(evidence,'ui-records.json')));
const maxTicks=Math.ceil(cfg.board.timeSecMax*1000/cfg.defaults.tickMs);
const clone=x=>structuredClone(x);
function trace(core,seed){
  const config=clone(cfg);config.rng.seed=seed;
  const events=[];
  const session=core.createSimRunSession(config,{onEvent:e=>events.push(clone(e))});
  const frames=[];
  function snapshot(){return {...clone(session.state),seed,dropId:session.dropId,tickMs:cfg.defaults.tickMs,timeSec:session.state.tick*cfg.defaults.tickMs/1000,status:session.status,started:session.started,finished:session.finished};}
  frames.push({state:snapshot(),events:clone(events)});
  while(!session.finished&&session.state.tick<maxTicks){core.stepSimRunSession(session);if(!session.finished&&session.state.tick>=maxTicks)core.timeoutSimRunSession(session);frames.push({state:snapshot(),events:clone(events)});}
  return frames;
}
const seeds=[...new Set(records.map(r=>r.state.seed))];
const bySeed=new Map(),bundleChecks=[];
for(const seed of seeds){const source=trace(oracle,seed),compiled=trace(bundle,seed);assert.deepEqual(compiled,source,`frozen native bundle vs exact source, seed ${seed}`);bySeed.set(seed,source);bundleChecks.push({seed,states:source.length,final:source.at(-1).state.result});}
const compared=records.map(record=>{const expected=bySeed.get(record.state.seed)[record.state.tick];assert(expected,`unknown tick ${record.label}`);assert.deepEqual(record.state,expected.state,`state: ${record.label}`);assert.deepEqual(record.events,expected.events,`events: ${record.label}`);return {label:record.label,seed:record.state.seed,tick:record.state.tick,status:'PASS'};});
const downloads=[];
for(const name of ['download-seed1842222754-t605.json','random1-download.json','random2-download.json']){
  const data=JSON.parse(readFileSync(join(evidence,name)));const expected=bySeed.get(data.seed)[data.state.tick];
  const config=clone(cfg);config.rng.seed=data.seed;assert.deepEqual(data.config,config);assert.deepEqual(data.state,expected.state);assert.deepEqual(data.events,expected.events);assert.deepEqual(data.binding,artifact.binding);assert.deepEqual(data.art,artifact.art);
  downloads.push({file:name,seed:data.seed,tick:data.state.tick,status:'PASS'});
}
const report={candidate:artifact.name,builderCommit:artifact.builderCommit,scope:'exact native states/events for observed UI scenarios, not visual acceptance',bundleChecks,uiChecks:compared,downloads};
writeFileSync(join(evidence,'oracle-comparison.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({seeds,bundleComparedStates:bundleChecks.reduce((n,x)=>n+x.states,0),uiChecks:compared.length,downloads:downloads.length,allPassed:true}));
