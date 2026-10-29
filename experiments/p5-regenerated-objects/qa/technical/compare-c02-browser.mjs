// Frozen C02: reuse proven ordinary traces and simulate only new UI-selected seeds once.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const root='E:/R4D/perspective/p5-runtime/technical-qa/c02';
const old='E:/R4D/perspective/p5-runtime/technical-qa/c01';
const oracle='E:/R4D/perspective/p5-runtime/technical-qa/source-oracle-001';
const digest=b=>createHash('sha256').update(b).digest('hex');
const output=path.join(root,'browser-native-comparison.json');assert(!existsSync(output));
const captures=readdirSync(path.join(root,'browser')).filter(f=>f.endsWith('.json')).map(file=>({file,...JSON.parse(readFileSync(path.join(root,'browser',file)))})).filter(c=>c.state&&c.record);
const seeds=[...new Set(captures.map(c=>c.record.seed))];
const compiled=JSON.parse(readFileSync(path.join(oracle,'private/native-compiled-inventory.json')));
for(const f of compiled.files){const b=readFileSync(path.join(oracle,'private/native-js',f.path));assert.equal(b.length,f.bytes);assert.equal(digest(b),f.sha256);}
const native=await import(pathToFileURL(path.join(oracle,'private/native-js/src/index.js')));
const baseline=JSON.parse(readFileSync(path.join(oracle,'common/simulation/boards/01/trial-01/config.json')));
const known=new Map([
 [0,{trace:path.join(oracle,'private/seed-0/states.ndjson'),events:path.join(oracle,'private/seed-0/events.json'),hash:'971c4b1c96f9e8aa271161fe31025cb776d7ad830dae5758cb54e01c77c8a572'}],
 [1696420279,{trace:path.join(old,'native-seed-1696420279.states.ndjson'),events:path.join(old,'native-seed-1696420279.events.json'),hash:'04d76d90cd5425d64c625ac1cea15e5501bd009bccbc6fcad3be2e04bb6c9a14'}],
 [3957814979,{trace:path.join(old,'native-seed-3957814979.states.ndjson'),events:path.join(old,'native-seed-3957814979.events.json'),hash:'f722ffbe0d33fc110f850e2be3e68393b7c72f07a6147d51fce62183f4137979'}],
]);
const expected=new Map();
for(const seed of seeds){
 const cached=known.get(seed);
 if(cached){
  const b=readFileSync(cached.trace);assert.equal(digest(b),cached.hash);
  expected.set(seed,{states:b.toString().trimEnd().split('\n').map(JSON.parse),events:JSON.parse(readFileSync(cached.events)).map(({callbackStateTick,...e})=>e),traceSha256:cached.hash,reused:true});continue;
 }
 const cfg=structuredClone(baseline);cfg.rng.seed=seed;const events=[];
 const session=native.createSimRunSession(cfg,{dropId:'board01-start',onEvent:e=>events.push(structuredClone(e))});const states=[structuredClone(session.state)];
 while(!session.finished&&session.state.tick<3200){native.stepSimRunSession(session);states.push(structuredClone(session.state));}
 if(!session.finished){native.timeoutSimRunSession(session);states[states.length-1]=structuredClone(session.state);}
 const trace=states.map(s=>JSON.stringify(s)).join('\n')+'\n';
 writeFileSync(path.join(root,`native-seed-${seed}.states.ndjson`),trace,{flag:'wx'});
 writeFileSync(path.join(root,`native-seed-${seed}.events.json`),JSON.stringify(events,null,2)+'\n',{flag:'wx'});
 expected.set(seed,{states,events,traceSha256:digest(trace),reused:false});
}
const checks=[];let fieldDomain;
for(const c of captures){
 const r=expected.get(c.record.seed),tick=c.state.tick,cfg=structuredClone(baseline);cfg.rng.seed=c.record.seed;
 assert.deepEqual(c.state,r.states[tick],c.file+' state');assert.deepEqual(c.config,cfg,c.file+' config');assert.deepEqual(c.record.state,c.state);
 const events=r.events.filter(e=>e.type==='object_hit'?e.tick<tick:e.tick<=tick).map(e=>({...e,stateTick:e.type==='object_hit'?e.tick+1:e.tick}));
 assert.deepEqual(c.record.events,events,c.file+' events');
 assert.equal(c.meta.pins.artistManifest.sourceSha256,'6055be855714bc9ad66a0e803fc392fbd8e01d94a9798536e7047c06d5d2a331');
 assert.equal(c.meta.pins.core.tree,'008d16a80a26bb77d562a45218b01da09b0d9ff0');
 assert.equal(c.meta.pins.configSha256,'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db');
 assert.equal(c.meta.pins.projectionSha256,'b59a0c1e6c34b417d253178457ef3580b8bea0aa89c989d1342f9376e19b9431');
 if(!fieldDomain)fieldDomain=c.meta.fieldFraming;else assert.deepEqual(c.meta.fieldFraming,fieldDomain,c.file+' framing/aliases');
 assert.equal(c.meta.manifest.instances.filter(i=>i.sourceClipPx).length,3);
 checks.push({file:c.file,seed:c.record.seed,tick,stateRngConfigAndEventsMatched:true});
}
const find=name=>captures.find(c=>c.file===name+'.json');
for(const name of ['mask852-geometry','mask852-artoff','mask852-whole-noart'])assert.deepEqual(find(name).state,find('mask852-art').state);
assert.deepEqual(find('ordinary1-paused').state,find('ordinary1-paused-stable').state);
assert.equal(find('mask-step853').state.tick,853);assert.equal(find('mask-step863').state.tick,863);
const result={createdUtc:new Date().toISOString(),scope:'Actual selected browser states/events versus native; no full per-tick browser trace or blanket art PASS',captures:checks,
 runs:seeds.map(seed=>{const r=expected.get(seed);return{seed,reusedTrace:r.reused,traceSha256:r.traceSha256,terminal:r.states.at(-1),browserTerminalObserved:captures.some(c=>c.record.seed===seed&&c.state.done),contacts:r.events.filter(e=>e.type==='object_hit').map(e=>({id:e.objectId,kind:e.objectKind,eventTick:e.tick,stateTick:e.tick+1}))};}),
 fieldDomain,maskToggleNativeInvariant:true,pauseExact:true,step1And10OnChangedMaskWindow:true,old1922PointsAndSeed0To3MatrixNotRerun:true,
 caveat:'Paused contact frames are exact. Realtime read and screenshot are not atomic; JSON state read precedes screenshot.'};
const b=Buffer.from(JSON.stringify(result,null,2)+'\n');writeFileSync(output,b,{flag:'wx'});console.log(JSON.stringify({output,bytes:b.length,sha256:digest(b),captureCount:checks.length,runs:result.runs.map(({seed,reusedTrace,traceSha256,terminal,browserTerminalObserved})=>({seed,reusedTrace,traceSha256,terminal,browserTerminalObserved}))},null,2));
