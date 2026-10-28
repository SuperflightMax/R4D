import fs from 'node:fs/promises';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {createHash,randomBytes} from 'node:crypto';
import assert from 'node:assert/strict';
import {createReplay} from '../src/replay.mjs';
const runtime=process.env.P4_RUNTIME;
if(!runtime)throw new Error('Set P4_RUNTIME');
const candidate=process.env.P4_CANDIDATE||'integration-01';
const out=path.join(runtime,'candidates',candidate);
const input=async file=>JSON.parse(await fs.readFile(path.join(out,'input',file),'utf8'));
const [config,binding]=await Promise.all(['config.json','binding.json'].map(input));
const core=await import(pathToFileURL(path.join(runtime,'native-check.mjs')));
const {createAdapter}=await import(pathToFileURL(path.join(runtime,'shared-p1','adapter.mjs')));
const adapter=createAdapter(core,config);
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
assert.equal(config.board.pins.length,25);assert.equal(config.board.segments.length,16);
assert.equal(config.board.buckets.length,4);assert.equal(config.board.drops.length,1);
assert.equal(config.board.ball.r,16);assert.equal(config.defaults.tickMs,5);
assert.equal(config.defaults.quantizeDigits,7);assert.equal(config.physics.gravityY,980);
assert.equal(config.physics.maxBallSpeed,2000);assert.equal(config.physics.angleDeviationDeg,2);
assert.equal(config.physics.bounceDeviation,0.02);assert.equal(config.rng.algo,'lcg32');
const evidence=path.join(runtime,'evidence');await fs.mkdir(evidence,{recursive:true});
let seeds;
try{seeds=JSON.parse(await fs.readFile(path.join(evidence,'ordinary-seeds.json'),'utf8'));}
catch(e){if(e.code!=='ENOENT')throw e;seeds=Array.from({length:6},()=>randomBytes(4).readUInt32LE());await fs.writeFile(path.join(evidence,'ordinary-seeds.json'),JSON.stringify(seeds)+'\n');}
const summaries=[];
for(let i=0;i<seeds.length;i++){
 const seed=seeds[i],replay=createReplay(core,adapter,binding),trace=[];
 replay.restart(seed);
 while(!replay.snapshot().done){trace.push(replay.snapshot());replay.stepTicks(1);}
 const full=replay.snapshot();
 const nativeConfig=core.cloneConfig(config);nativeConfig.rng.seed=seed;
 const expected=core.runUntilDone(nativeConfig);
 assert.deepEqual(full.result,expected.result);assert.equal(full.tick,expected.ticks);
 const checkpoint=replay.checkpoint();
 const restored=createReplay(core,adapter,binding);assert.deepEqual(restored.restore(checkpoint),full);
 const mid=Math.floor(full.tick/2);const afterSeek=restored.seek(mid);
 assert.deepEqual(afterSeek,trace[mid]);
 const midCheckpoint=restored.checkpoint();restored.stepTicks(17);restored.restore(midCheckpoint);
 assert.deepEqual(restored.snapshot(),afterSeek);
 const invalid=structuredClone(midCheckpoint);invalid.state.rngU32^=1;
 assert.throws(()=>restored.restore(invalid),/не воспроизводится/);
 assert.deepEqual(restored.snapshot(),afterSeek,'failed import must not mutate live state');
 await fs.writeFile(path.join(evidence,`ordinary-${String(i+1).padStart(2,'0')}.checkpoint.json`),JSON.stringify(checkpoint,null,2)+'\n');
 const hits=replay.events().filter(e=>e.type==='object_hit');
 summaries.push({name:`ordinary-${i+1}`,seed,tick:full.tick,result:full.result,traceSha256:hash(trace),checkpointSha256:hash(checkpoint),contacts:hits});
}
assert.equal(new Set(summaries.map(s=>s.traceSha256)).size,seeds.length,'ordinary seeds must produce different paths');
const result={candidate,binding,checks:['exact common config','native runUntilDone equivalence','ordinary seed diversity','seek exact state','checkpoint roundtrip including PRNG and events','corrupt checkpoint rejected atomically'],summaries};
await fs.writeFile(path.join(evidence,'native-validation.json'),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({checks:result.checks,runs:summaries.map(({name,seed,tick,result,contacts})=>({name,seed,tick,result,contacts:contacts.length})),evidence}));
