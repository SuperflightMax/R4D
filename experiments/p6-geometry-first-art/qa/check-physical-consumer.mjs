// Independent physical consumer audit. Native source/build bytes stay private.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { fileURLToPath,pathToFileURL } from 'node:url';
const runtime=path.resolve(process.argv[2]),qa=path.dirname(fileURLToPath(import.meta.url));
const commit='b1bb84d06fea0389f8cecd3ae7e5a0103aad0e96';
const consumer=path.join(runtime,'consumer',commit),served=path.join(consumer,'served');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const stable=v=>JSON.stringify(v,(_k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
const inventoryBytes=fs.readFileSync(path.join(consumer,'inventory.json'));
assert.equal(hash(inventoryBytes),'dc98e5271aac9e4a173a3902b13c62741630c4eacedc854a4326511b0c8bdef9');
const inventory=JSON.parse(inventoryBytes);
for(const item of inventory.files){const b=fs.readFileSync(path.join(served,item.path));assert.equal(b.length,item.bytes);assert.equal(hash(b),item.sha256);}
const meta=JSON.parse(fs.readFileSync(path.join(served,'build-meta.json')));
for(const [name,expected] of Object.entries(meta.consumerSources))assert.equal(hash(fs.readFileSync(path.join(consumer,'source',name))),expected);
const require=createRequire(path.join(runtime,'consumer-tools/package.json'));const esbuild=require('esbuild');assert.equal(esbuild.version,'0.25.5');
const sourceManifest=JSON.parse(fs.readFileSync(path.join(runtime,'native-source-manifest.json')));
for(const r of sourceManifest)assert.equal(hash(fs.readFileSync(path.join(runtime,'native-source',r.path))),r.sha256);
const repro=path.join(runtime,'consumer-native-reproduction/core.mjs');fs.mkdirSync(path.dirname(repro),{recursive:true});
await esbuild.build({entryPoints:[path.join(runtime,'native-source/packages/sim-core/src/index.ts')],outfile:repro,bundle:true,format:'esm',platform:'neutral',target:'es2022',sourcemap:false,minify:true,legalComments:'none'});
assert.equal(hash(fs.readFileSync(repro)),meta.coreSha256,'served native differs from independently reproduced pinned native');
assert.equal(hash(fs.readFileSync(path.join(served,'native/core.mjs'))),meta.coreSha256);
const appText=fs.readFileSync(path.join(served,'app.mjs'),'utf8');
assert.match(appText,/from\s+["']\.\/native\/core\.mjs["']/);
assert.equal(hash(appText),meta.consumerSha256);
const core=await import(pathToFileURL(path.join(served,'native/core.mjs')));
const {RunController}=await import(pathToFileURL(path.join(consumer,'source/viewer/controller.mjs')));
const configText=fs.readFileSync(path.join(served,'config.json'),'utf8'),cfg=JSON.parse(configText);
assert.equal(hash(configText),'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db');
const runs=[];
for(const seed of [0,1,2]){
 const reference=JSON.parse(fs.readFileSync(path.join(runtime,'oracle',`seed-${seed}.json`)));
 const run=new RunController(core,cfg,meta,configText);run.reset(seed);run.advance(10000);
 assert.equal(stable(run.states),stable(reference.states),`all states differ seed${seed}`);
 assert.equal(stable(run.events),stable(reference.events),`event sequence differs seed${seed}`);
 const batch=new RunController(core,cfg,meta,configText);batch.reset(seed);while(!batch.snapshot().done)batch.advance(10);
 assert.equal(stable(batch.states),stable(reference.states));assert.equal(stable(batch.events),stable(reference.events));
 const seekChecks=[];
 for(const tick of [0,94,95,96,1956]){const state=run.seek(tick);assert.equal(stable(state),stable(reference.states[Math.min(tick,reference.states.length-1)]));seekChecks.push({requestedTick:tick,actualTick:state.tick,stateDigest:hash(stable(state))});}
 const replay=run.exportReplay();const restored=new RunController(core,cfg,meta,configText);restored.importReplay(replay);
 assert.equal(stable(restored.snapshot()),stable(run.snapshot()));assert.equal(stable(restored.events),stable(run.events));
 assert.deepEqual(replay.config,{...cfg,rng:{...cfg.rng,seed}});assert.equal(replay.originalConfigUtf8,configText);
 const firstIndex=run.events.findIndex(e=>e.type==='object_hit'&&e.objectId==='leaf-01');
 assert.equal(run.events[firstIndex].tick,94);assert.equal(run.eventStateTicks[firstIndex],95);
 runs.push({seed,stateCount:reference.states.length,eventCount:reference.events.length,stateDigest:hash(stable(reference.states)),eventDigest:hash(stable(reference.events)),allStatesEqual:true,allEventsEqual:true,batch10Equal:true,seekChecks,replayImportEqual:true,firstContact:{eventTick:94,resultingStateTick:95},terminal:reference.states.at(-1)});
}
const report={scope:'early physical consumer only; no final art, sphere/shadow or occlusion acceptance',sourceCommit:commit,inventoryFileSha256:hash(inventoryBytes),frozenSiteFiles:inventory.files.length,frozenSiteBytes:inventory.totalBytes,coreCommit:meta.coreCommit,coreTree:meta.coreTree,
 servedCoreSha256:meta.coreSha256,independentlyReproducedNativeSha256:hash(fs.readFileSync(repro)),nativeBuildByteIdentical:true,esbuild:esbuild.version,node:process.version,consumerSha256:meta.consumerSha256,actualNativeImport:'./native/core.mjs',sourcePinsMatch:true,runs};
fs.mkdirSync(path.join(qa,'physical-baseline'),{recursive:true});fs.writeFileSync(path.join(qa,'physical-baseline/headless.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({...report,runs:runs.map(r=>({seed:r.seed,stateCount:r.stateCount,eventCount:r.eventCount,allStatesEqual:r.allStatesEqual,allEventsEqual:r.allEventsEqual,batch10Equal:r.batch10Equal,replayImportEqual:r.replayImportEqual,terminalTick:r.terminal.tick,result:r.terminal.result}))},null,2));
