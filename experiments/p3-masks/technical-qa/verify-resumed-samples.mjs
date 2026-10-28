import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';

// Continues the existing frozen-01 verification. No build, source extraction or server.
const root='E:/R4D/perspective/p3-runtime/builder/full-checkpoint-06';
const out='E:/R4D/perspective/p3-runtime/technical-qa/frozen-01';
const sha=x=>createHash('sha256').update(x).digest('hex');
const stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const pendingOnly=process.argv.includes('--pending-only');
const previous=pendingOnly?JSON.parse(fs.readFileSync(path.join(out,'resumed-samples-verification.json'))):null;
const read=relative=>fs.readFileSync(path.join(root,relative));
const manifestBytes=read('file-manifest.json');
assert.equal(sha(manifestBytes),'e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f');
const manifest=JSON.parse(manifestBytes);
for(const name of ['run-model.js','native-core.js','data/config.json','build.json'])assert.equal(sha(read(name)),manifest.files.find(f=>f.path===name).sha256,name);
const baseline=JSON.parse(read('data/config.json')),build=JSON.parse(read('build.json'));
const native=await import(pathToFileURL(path.join(out,'private-native-oracle/Sim.js')));
const candidate=await import(pathToFileURL(path.join(root,'run-model.js')));
const cache=new Map();
function oracle(seed){
 if(cache.has(seed))return cache.get(seed);
 const config=structuredClone(baseline);config.rng.seed=seed;
 const hits=[];const session=native.createSimRunSession(config,{onEvent:e=>{if(e.type==='object_hit')hits.push(structuredClone(e));}});
 const states=[structuredClone(session.state)];
 for(let n=0;n<Math.ceil(config.board.timeSecMax*1000/config.defaults.tickMs)&&!session.state.done;n++){
  native.stepSimRunSession(session);states.push(structuredClone(session.state));
 }
 if(!session.state.done){native.timeoutSimRunSession(session);states[states.length-1]=structuredClone(session.state);}
 const result={seed,config,states,hits,lastTick:states.length-1,result:structuredClone(session.state.result)};
 cache.set(seed,result);return result;
}
const ordinary=previous?previous.ordinary:[];
for(const seed of previous?[]:[4002564341,892542836,1061109253]){
 const truth=oracle(seed),actual=candidate.makeRun(baseline,seed);
 assert.deepEqual(actual.states,truth.states,`complete ordinary trace ${seed}`);
 assert.deepEqual(actual.hits,truth.hits);assert.deepEqual(actual.config,truth.config);
 ordinary.push({seed,lastTick:truth.lastTick,result:truth.result,ticksCompared:truth.states.length,traceSha256:sha(stable(truth.states)),contacts:truth.hits.length});
}
assert.equal(new Set(ordinary.map(x=>x.traceSha256)).size,ordinary.length,'different ordinary seeds must differ');
const directory=path.join(out,'browser'),samples=[];
for(const file of fs.readdirSync(directory).filter(f=>f.endsWith('.json')).sort()){
 const saved=JSON.parse(fs.readFileSync(path.join(directory,file)));
 const cp=saved.checkpoint??(saved.schema==='r4d-p3-checkpoint-v1'?saved:null);
 if(!cp)continue;
 const prior=previous?.samples.find(s=>s.file===file);
 if(prior){assert.equal(sha(stable(cp.state)),prior.stateSha256,file);samples.push(prior);continue;}
 const truth=oracle(cp.seed);
 assert.deepEqual(cp.config,truth.config,file);assert.deepEqual(cp.state,truth.states[cp.tick],file);
 assert.equal(cp.coreCommit,build.coreCommit);assert.equal(cp.p1Commit,build.p1Commit);
 assert.equal(cp.configSha256,build.configSha256);assert.equal(cp.projectionSha256,build.projectionSha256);
 assert.equal(cp.dropId,truth.config.board.drops[0].id);
 const restored=candidate.importCheckpoint(cp,baseline,build);
 assert.equal(restored.tick,cp.tick);assert.deepEqual(restored.run.states[cp.tick],truth.states[cp.tick],file);
 samples.push({file,seed:cp.seed,tick:cp.tick,stateSha256:sha(stable(cp.state)),result:cp.state.result??null});
}
const results={candidate:'P3-frozen-01',utc:new Date().toISOString(),manifestSha256:sha(manifestBytes),ordinary,samples,previouslyComparedSamples:previous?.samples.length??0,newlyComparedSamples:samples.length-(previous?.samples.length??0),scope:pendingOnly?'Pending browser samples against cached independent oracle; completed ordinary full-trace comparisons retained without repeating.':'Cached independent oracle; only pending ordinary traces and saved browser samples. No repeat of five completed saved-run matrix or build.'};
fs.writeFileSync(path.join(out,pendingOnly?'browser-final-verification.json':'resumed-samples-verification.json'),JSON.stringify(results,null,2)+'\n');
console.log(JSON.stringify({...results,samples:`${samples.length} exact browser/export checkpoints matched pinned native`},null,2));
