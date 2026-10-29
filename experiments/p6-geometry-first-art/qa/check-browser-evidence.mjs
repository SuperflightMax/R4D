// Validate captured IAB evidence against the independent oracle and native source build.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const runtime=path.resolve(process.argv[2]),qa=path.dirname(fileURLToPath(import.meta.url));
const stable=v=>JSON.stringify(v,(_k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const ui=JSON.parse(fs.readFileSync(path.join(runtime,'browser/ui-evidence.json')));const runs=[];
for(const seed of [0,1,2]){
 const actual=JSON.parse(fs.readFileSync(path.join(runtime,'browser',`seed-${seed}-actual.json`)));
 const oracle=JSON.parse(fs.readFileSync(path.join(runtime,'oracle',`seed-${seed}.json`)));
 assert.equal(stable(actual.states),stable(oracle.states));assert.equal(stable(actual.events),stable(oracle.events));
 const expectedTicks=actual.events.map(e=>e.type==='object_hit'&&e.objectKind!=='bucket'?e.tick+1:e.tick);
 assert.deepEqual(actual.eventStateTicks,expectedTicks);
 assert.equal(hash(actual.replay.originalConfigUtf8),'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db');
 runs.push({seed,states:actual.states.length,events:actual.events.length,allStatesEqual:true,allEventsEqual:true,eventStateTicksEqual:true,stateDigest:hash(stable(actual.states)),eventDigest:hash(stable(actual.events))});
}
const native=await import(pathToFileURL(path.join(runtime,'native-build/index.js')));
const cfg=JSON.parse(fs.readFileSync(path.join(runtime,'inputs/common/config.json')));const random=[];
for(const name of ['random-actual.json','random-paused-replay95.json']){
 for(const actual of JSON.parse(fs.readFileSync(path.join(runtime,'browser',name)))){
  const c=structuredClone(cfg);c.rng.seed=actual.seed;const events=[];const session=native.createSimRunSession(c,{onEvent:e=>events.push(structuredClone(e))});const states=[structuredClone(session.state)];
  while(session.state.tick<actual.state.tick){native.stepSimRunSession(session);states.push(structuredClone(session.state));}
  assert.equal(stable(states),stable(actual.states));assert.equal(stable(events),stable(actual.events));
  random.push({file:name,seed:actual.seed,tick:actual.state.tick,states:states.length,allStatesEqual:true,allEventsEqual:true});
 }
}
assert.notEqual(ui.randomSeeds[0],ui.randomSeeds[1]);
assert.ok(ui.actions.every(a=>a.oracleEqual!==false&&a.statePreserved!==false&&a.eventsEqual!==false));
assert.equal(ui.downloadLimitation.callId,'call_dfb293d358174d6b8a83b1b0686463ad');assert.equal(ui.downloadLimitation.retried,false);assert.equal(ui.downloadLimitation.saveButtonVerified,false);
const app=fs.readFileSync(path.join(runtime,'consumer/b1bb84d06fea0389f8cecd3ae7e5a0103aad0e96/source/viewer/app.mjs'),'utf8');
const overwriteLine=app.split('\n').findIndex(s=>s.includes("$('tick').value=st.tick"))+1;
const report={scope:'IAB early physical baseline only; no final art or motion/occlusion acceptance',runs,random,actions:ui.actions,viewportReset:ui.viewportReset,console:ui.console,
 finding:{priority:'P2',title:'Live redraw overwrites editable tick field',sourceCommit:'b1bb84d06fea0389f8cecd3ae7e5a0103aad0e96',source:'experiments/p6-geometry-first-art/builder/viewer/app.mjs',line:overwriteLine,requestedTick:95,observedRandomTicks:ui.randomSeekDuringMotion.actualTicks,controlledReproduction:ui.finding,impact:'Seek while moving may select a tick different from the entered value. Pausing before entry gives exact95. Native calculation remains correct.',candidateModified:false},
 downloadLimitation:ui.downloadLimitation,exportScope:ui.exportScope,finalState:ui.finalState};
const out=path.join(qa,'physical-baseline');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'browser.json'),JSON.stringify(report,null,2)+'\n');
fs.copyFileSync(path.join(runtime,'consumer/b1bb84d06fea0389f8cecd3ae7e5a0103aad0e96/inventory.json'),path.join(out,'frozen-inventory.json'));
const screenshots=[];
for(const name of ['final-seed0-state95.png','seed0-terminal1956.png','state96-flat-geometry.png','seek-race.png','realtime-paused.png']){const raw=fs.readFileSync(path.join(runtime,'browser',name));fs.writeFileSync(path.join(out,name),raw);screenshots.push({file:name,sha256:hash(raw),bytes:raw.length});}
fs.writeFileSync(path.join(out,'screenshots.json'),JSON.stringify(screenshots,null,2)+'\n');console.log(JSON.stringify({runs,random,overwriteLine,downloadLimitation:ui.downloadLimitation},null,2));
