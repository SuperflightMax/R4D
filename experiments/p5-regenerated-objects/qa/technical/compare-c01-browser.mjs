// Compare saved actual browser snapshots/events with exact native, without rerunning the old matrix.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = 'E:/R4D/perspective/p5-runtime/technical-qa/c01';
const oracle = 'E:/R4D/perspective/p5-runtime/technical-qa/source-oracle-001';
const digest = buffer => createHash('sha256').update(buffer).digest('hex');
const output = path.join(root,'browser-native-comparison.json');
assert(!existsSync(output), 'Append-only comparison already exists.');
const inventory = JSON.parse(readFileSync(path.join(oracle,'private/native-compiled-inventory.json')));
for (const f of inventory.files) {
  const bytes = readFileSync(path.join(oracle,'private/native-js',f.path));
  assert.equal(bytes.length,f.bytes); assert.equal(digest(bytes),f.sha256);
}
const native = await import(pathToFileURL(path.join(oracle,'private/native-js/src/index.js')));
const baseline = JSON.parse(readFileSync(path.join(oracle,'common/simulation/boards/01/trial-01/config.json')));
const captures = readdirSync(path.join(root,'browser')).filter(f=>f.endsWith('.json')).map(file=>({file,...JSON.parse(readFileSync(path.join(root,'browser',file)))})).filter(c=>c.record && c.state);
const seeds = [...new Set(captures.map(c=>c.record.seed))];
assert.deepEqual(seeds.slice().sort((a,b)=>a-b),[0,1696420279,3957814979]);
const expected = new Map();
for (const seed of seeds) {
  if (seed === 0) {
    const text = readFileSync(path.join(oracle,'private/seed-0/states.ndjson'),'utf8');
    const events = JSON.parse(readFileSync(path.join(oracle,'private/seed-0/events.json'))).map(({callbackStateTick,...event})=>event);
    expected.set(seed,{states:text.trimEnd().split('\n').map(JSON.parse),events,reusedExistingOracle:true,traceSha256:digest(text)});
    continue;
  }
  const cfg = structuredClone(baseline); cfg.rng.seed=seed;
  const events=[];
  const session=native.createSimRunSession(cfg,{dropId:'board01-start',onEvent:e=>events.push(structuredClone(e))});
  const states=[structuredClone(session.state)];
  while (!session.finished && session.state.tick < 3200) {
    native.stepSimRunSession(session); states.push(structuredClone(session.state));
  }
  if (!session.finished) { native.timeoutSimRunSession(session); states[states.length-1]=structuredClone(session.state); }
  const trace = states.map(s=>JSON.stringify(s)).join('\n')+'\n';
  writeFileSync(path.join(root,`native-seed-${seed}.states.ndjson`),trace,{flag:'wx'});
  writeFileSync(path.join(root,`native-seed-${seed}.events.json`),JSON.stringify(events,null,2)+'\n',{flag:'wx'});
  expected.set(seed,{states,events,reusedExistingOracle:false,traceSha256:digest(trace)});
}
const checks=[];
for (const capture of captures) {
  const run=expected.get(capture.record.seed), tick=capture.state.tick;
  assert.deepEqual(capture.state,run.states[tick],capture.file+' state');
  const cfg=structuredClone(baseline); cfg.rng.seed=capture.record.seed;
  assert.deepEqual(capture.config,cfg,capture.file+' config');
  assert.deepEqual(capture.record.state,capture.state,capture.file+' atomic record');
  // Native collision callbacks use pre-increment t. A state at N includes such hits through N-1.
  const events=run.events.filter(e=>e.type==='object_hit'?e.tick<tick:e.tick<=tick).map(e=>({...e,stateTick:e.type==='object_hit'?e.tick+1:e.tick}));
  assert.deepEqual(capture.record.events,events,capture.file+' event sequence');
  assert.equal(capture.record.pins.configSha256,'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db');
  assert.equal(capture.record.pins.core.tree,'008d16a80a26bb77d562a45218b01da09b0d9ff0');
  assert.equal(capture.record.pins.projectionSha256,'b59a0c1e6c34b417d253178457ef3580b8bea0aa89c989d1342f9376e19b9431');
  checks.push({file:capture.file,seed:capture.record.seed,tick,stateRngConfigAndEventsMatched:true});
}
const named = name => captures.find(c=>c.file===name+'.json');
const invarianceBase=named('controls-contact95');
for (const name of ['controls-artoff-geometryon95','controls-bothoff95','controls-artonly95','controls-field95']) {
  assert.deepEqual(named(name).state,invarianceBase.state); assert.deepEqual(named(name).config,invarianceBase.config);
}
assert.deepEqual(named('known-paused').state,named('known-paused-stable').state);
assert.deepEqual(named('ordinary-throw-terminal').state,named('ordinary-replay-terminal').state);
assert.deepEqual(named('known-realtime-terminal').state,named('seed1696420279-basket875-art').state);
const result={createdUtc:new Date().toISOString(),scope:'Actual browser snapshots/events and UI controls versus exact native; no complete browser per-tick trace or art PASS',
  captures:checks,oldSeed0OracleReused:true,newNativeSeedsOnly:[1696420279,3957814979],
  runs:seeds.map(seed=>{const r=expected.get(seed);return {seed,traceSha256:r.traceSha256,reusedExistingOracle:r.reusedExistingOracle,terminal:r.states.at(-1),presentContacts:r.events.filter(e=>e.type==='object_hit'&&['flower-07','leaf-05','frog-05','wood-04'].includes(e.objectId)).map(e=>({id:e.objectId,eventTick:e.tick,stateTick:e.tick+1}))};}),
  invariants:{pausedLayersAndFraming:true,pauseStable:true,ordinaryReplay:true,knownRealtimeVersusExactStepTerminal:true},
  captureCaveat:'Contact/control frames were paused and exact. Realtime JSON is the read immediately before screenshot, not an atomic render-frame timestamp.'};
const bytes=Buffer.from(JSON.stringify(result,null,2)+'\n'); writeFileSync(output,bytes,{flag:'wx'});
console.log(JSON.stringify({output,bytes:bytes.length,sha256:digest(bytes),captures:checks.length,runs:result.runs},null,2));
