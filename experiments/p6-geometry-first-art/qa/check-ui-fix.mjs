// Targeted regression only: live Tick edit/paused seek/steps/replay and lift1 adapter.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath,pathToFileURL} from 'node:url';
const runtime=path.resolve(process.argv[2]),qa=path.dirname(fileURLToPath(import.meta.url));
const root=path.join(runtime,'consumer/integration-03-ui-fix-01'),served=path.join(root,'served');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const stable=v=>JSON.stringify(v,(_k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
const invbytes=fs.readFileSync(path.join(root,'inventory.bin'));assert.equal(hash(invbytes),'eaffd874d5eae1d0881199253fb7a706601b829b2d64d4d23a700e6ccd2f0046');
const inv=JSON.parse(invbytes);assert.equal(inv.files.length,40);assert.equal(inv.totalBytes,6983315);
for(const f of inv.files){const raw=fs.readFileSync(path.join(served,f.path));assert.equal(raw.length,f.bytes);assert.equal(hash(raw),f.sha256);}
const meta=JSON.parse(fs.readFileSync(path.join(served,'build-meta.json')));assert.equal(meta.consumerSha256,'7248b00992254b93f20eaf48b1d10a16719c1de9d7ee8dabe9e4438c6e1d53e5');
assert.equal(meta.coreSha256,'8843446996582eaccbd9ff63d3147d74b7eca9a614d8e0df16851d1d89d46f50');assert.equal(meta.configSha256,'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db');assert.equal(meta.manifestSha256,'7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18');
const ui=JSON.parse(fs.readFileSync(path.join(runtime,'ui-fix-browser/initial-ui.json'))),steps=JSON.parse(fs.readFileSync(path.join(runtime,'ui-fix-browser/steps-replay.json')));
assert.equal(ui.normalNew.paused,false);assert.equal(ui.typedWhileMoving.paused,false);assert.equal(ui.heldAcrossRedraw.paused,false);assert.equal(ui.typedWhileMoving.input,'95');assert.equal(ui.heldAcrossRedraw.input,'95');assert.ok(ui.heldAcrossRedraw.state.tick>ui.typedWhileMoving.state.tick);
assert.equal(ui.seek95.state.tick,95);assert.equal(ui.seek95.paused,true);assert.equal(ui.seek95.input,'95');assert.deepEqual(steps.map(s=>s.state.tick),[94,95,96,0,95]);assert.ok(steps.every(s=>s.paused&&s.input===String(s.state.tick)));
const seed=ui.normalNew.seed;assert.ok(Number.isInteger(seed));const samples=[ui.normalNew,ui.typedWhileMoving,ui.heldAcrossRedraw,ui.seek95,...steps];assert.ok(samples.every(s=>s.seed===undefined||s.seed===seed));
const native=await import(pathToFileURL(path.join(runtime,'native-build/index.js')));const cfg=JSON.parse(fs.readFileSync(path.join(runtime,'inputs/common/config.json')));cfg.rng.seed=seed;
const session=native.createSimRunSession(cfg),oracle=[structuredClone(session.state)];const maxTick=Math.max(...samples.map(s=>s.state.tick));
while(session.state.tick<maxTick){native.stepSimRunSession(session);oracle.push(structuredClone(session.state));}
for(const sample of samples)assert.equal(stable(sample.state),stable(oracle[sample.state.tick]),`native snapshot differs tick${sample.state.tick}`);
assert.equal(stable(ui.seek95.state),stable(steps[1].state));assert.equal(stable(ui.seek95.state),stable(steps.at(-1).state));
fs.writeFileSync(path.join(runtime,'oracle',`ui-fix-seed-${seed}-to${maxTick}.json`),JSON.stringify({seed,source:'independent original native build',states:oracle},null,2)+'\n');
const packetBytes=fs.readFileSync(path.join(root,'source/SPRITE_PACKET_V02.git-lf.json'));assert.equal(packetBytes.length,6798);assert.equal(hash(packetBytes),'49766ad720b73ce4d92276917e7b394d6b552e078cdd0c0afe0b924c2650a680');assert.ok(!packetBytes.includes(Buffer.from('\r\n')));
const adapter=JSON.parse(fs.readFileSync(path.join(served,'artist.json'))),old=JSON.parse(fs.readFileSync(path.join(root,'source/WOOD_ADAPTER_V01.integration03.git.json')));
assert.equal(adapter.ball.liftRadiusFactor,1);assert.ok(!Object.hasOwn(adapter.ball,'visualLiftPx'));
for(const key of ['layers','hashes','shadows','woodSource'])assert.equal(stable(adapter[key]),stable(old[key]));assert.deepEqual(adapter.ball.shadow,old.ball.shadow);
for(const name of ['raw/ball-v01.png','raw/ball-shadow-v01.png'])assert.equal(hash(fs.readFileSync(path.join(served,'artist',name))),hash(fs.readFileSync(path.join(runtime,'consumer/integration-02/served/artist',name))));
const M=JSON.parse(fs.readFileSync(path.join(runtime,'inputs/common/manifest.json'))).projection.nativeToSource;
const P=([x,y])=>{const w=M[2][0]*x+M[2][1]*y+M[2][2];return [(M[0][0]*x+M[0][1]*y+M[0][2])/w,(M[1][0]*x+M[1][1]*y+M[1][2])/w];};
const oldFrames=JSON.parse(fs.readFileSync(path.join(runtime,'integration-browser/source-frames.json'))),oracle0=JSON.parse(fs.readFileSync(path.join(runtime,'oracle/seed-0.json')));
const render=JSON.parse(fs.readFileSync(path.join(runtime,'ui-fix-browser/render-probes.json'))).map(f=>{
 const s=f.state,m=f.metrics;assert.equal(stable(s),stable(oracle0.states[s.tick]));const p=[s.ball.pos.x,s.ball.pos.y],c=P(p),a=P([p[0]-16,p[1]]),b=P([p[0]+16,p[1]]),r=Math.hypot(b[0]-a[0],b[1]-a[1])/2;
 assert.equal(m.ball.liftRadiusFactor,1);assert.ok(!Object.hasOwn(m.ball,'visualLiftPx'));assert.deepEqual(m.ball.center,[c[0],c[1]-r]);assert.ok(Math.abs(m.ball.appliedVisualLiftPx-r)<1e-10);assert.ok(Math.abs(m.ball.scale[0]*428-r)<1e-12);assert.equal(m.ball.scale[0],m.ball.scale[1]);
 const bottomError=Math.abs(m.ball.center[1]+r-c[1]);assert.ok(bottomError<1e-10);assert.deepEqual(m.shadow,oldFrames.find(old=>old.state.tick===s.tick).metrics.shadow);
 const bodies=m.objectLayers.filter(l=>l.objectId);assert.equal(bodies.length,1);assert.equal(bodies[0].objectId,'wood-01');assert.deepEqual(bodies[0].nativeBase,adapter.layers[1].nativeBase);assert.deepEqual(bodies[0].actualPosition,adapter.layers[1].rect.slice(0,2));assert.deepEqual(bodies[0].actualDimensions,adapter.layers[1].rect.slice(2));
 return {tick:s.tick,nativeStateEqual:true,radius:r,appliedLift:m.ball.appliedVisualLiftPx,center:m.ball.center,expectedGroundPoint:c,bottomError,groundShadowExactlyUnchanged:true,oneWoodUnchanged:true};
});
const report={scope:'targeted UI defect regression and lift1 adapter only; no new full native run or art PASS',sourceCommit:'93963cdb1157afc517469f3c08b581455c7d1697',url:'http://127.0.0.1:41769/',inventoryFileSha256:hash(invbytes),files:40,bytes:6983315,consumerSha256:meta.consumerSha256,coreSha256:meta.coreSha256,
 fixedScenarioConfirmed:true,ordinarySeed:seed,inputHeldWhileMoving:{firstLiveTick:ui.typedWhileMoving.state.tick,nextLiveTick:ui.heldAcrossRedraw.state.tick,input:'95',pausedBeforeSeek:false,actualTickAfterSeek:95,pausedAfterSeek:true},nativeOracle:{method:'independent pinned native build, short prefix only',maxObservedTick:maxTick,generatedStates:oracle.length,comparedSnapshots:samples.length,allEqual:true},stepTicks:steps.map(s=>s.state.tick),replay95ExactlyEqual:true,
 packetV02:{sourceCommit:'3899da2bc3fbaa9973bbc88dd823d58f958e7d60',bytes:6798,sha256:hash(packetBytes),encoding:'UTF8 LF without BOM; source Git identity equals declared used input identity'},render,
 downloadOperationRetried:false,saveReplayDownloadButtonTested:false,limitations:['Full native audit remains the previously delivered baseline; only targeted snapshots checked here.','One actual wood and24 diagnostic bodies do not constitute final art/occlusion acceptance.','Download call limitation remains separate and unchanged.']};
const output=path.join(qa,'integration-03-ui-fix-01');fs.mkdirSync(output,{recursive:true});fs.writeFileSync(path.join(output,'check.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(output,'frozen-inventory.json'),invbytes);
fs.writeFileSync(path.join(output,'actual-ui.json'),JSON.stringify({initial:ui,steps},null,2)+'\n');
const shots=[];for(const name of ['typed95-while-moving.png','paused95.png','replayed95.png','render-state1916.png']){const raw=fs.readFileSync(path.join(runtime,'ui-fix-browser',name));fs.writeFileSync(path.join(output,name),raw);shots.push({file:name,sha256:hash(raw),bytes:raw.length});}
fs.writeFileSync(path.join(output,'screenshots.json'),JSON.stringify(shots,null,2)+'\n');console.log(JSON.stringify(report,null,2));
