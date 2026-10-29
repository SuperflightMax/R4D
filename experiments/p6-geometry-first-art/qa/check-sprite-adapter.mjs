// Limited exact sprite adapter verification; no repeated full physical/art audit.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const runtime=path.resolve(process.argv[2]),qa=path.dirname(fileURLToPath(import.meta.url));
const consumer=path.join(runtime,'consumer/integration-02'),served=path.join(consumer,'served');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const stable=v=>JSON.stringify(v,(_k,x)=>x&&typeof x==='object'&&!Array.isArray(x)?Object.fromEntries(Object.keys(x).sort().map(k=>[k,x[k]])):x);
const inventoryBytes=fs.readFileSync(path.join(consumer,'inventory.json'));
assert.equal(hash(inventoryBytes),'dacd666acd97e8767b6502ff60ec4b456d21c3a1b9b36d170f87b7123e9d787a');
const inventory=JSON.parse(inventoryBytes);assert.equal(inventory.files.length,28);assert.equal(inventory.totalBytes,5260713);
for(const file of inventory.files){const bytes=fs.readFileSync(path.join(served,file.path));assert.equal(bytes.length,file.bytes);assert.equal(hash(bytes),file.sha256);}
const sourcePacketBytes=fs.readFileSync(path.join(consumer,'source/SPRITE_PACKET_V01.git-lf.json'));
assert.equal(sourcePacketBytes.length,5302);assert.equal(hash(sourcePacketBytes),'5ef0efec3633755935fa260a13f0e4e218da16e1479b54c4caee7d3b0d32bb6c');
const packet=JSON.parse(sourcePacketBytes),adapter=JSON.parse(fs.readFileSync(path.join(consumer,'source/SPRITE_ADAPTER_V01.git.json')));
assert.deepEqual(adapter,JSON.parse(fs.readFileSync(path.join(served,'artist.json'))));
assert.equal(adapter.ball.visualLiftPx,0);assert.equal(packet.ball.visualLiftPx,0);
assert.deepEqual(adapter.ball.center,packet.ball.centerPx);assert.equal(adapter.ball.visibleRadius,packet.ball.visibleRadiusPx);
assert.deepEqual(adapter.ball.shadow.center,packet.shadow.centerPx);assert.deepEqual(adapter.ball.shadow.canvas,packet.shadow.canvas);
assert.deepEqual(adapter.ball.shadow.visibleRadii,[packet.shadow.visibleRadiusPx,packet.shadow.visibleRadiusPx]);
assert.deepEqual(adapter.ball.shadow.radiusNative,[packet.shadow.groundVisibleRadiusNative,packet.shadow.groundVisibleRadiusNative]);
assert.deepEqual(adapter.ball.shadow.offsetNative,packet.shadow.groundOffsetNative);assert.equal(adapter.ball.shadow.opacity,packet.shadow.opacity);
for(const p of [packet.ball,packet.shadow]){const bytes=fs.readFileSync(path.join(served,'artist',p.texture));assert.equal(hash(bytes),p.sha256);}
const meta=JSON.parse(fs.readFileSync(path.join(served,'build-meta.json')));
assert.equal(meta.coreSha256,'8843446996582eaccbd9ff63d3147d74b7eca9a614d8e0df16851d1d89d46f50');
assert.equal(hash(fs.readFileSync(path.join(served,'native/core.mjs'))),meta.coreSha256);
const M=JSON.parse(fs.readFileSync(path.join(runtime,'inputs/common/manifest.json'))).projection.nativeToSource;
const P=([x,y])=>{const w=M[2][0]*x+M[2][1]*y+M[2][2];return [(M[0][0]*x+M[0][1]*y+M[0][2])/w,(M[1][0]*x+M[1][1]*y+M[1][2])/w];};
const oracle=JSON.parse(fs.readFileSync(path.join(runtime,'oracle/seed-0.json')));
const frames=JSON.parse(fs.readFileSync(path.join(runtime,'integration-browser/source-frames.json')));
const toggles=JSON.parse(fs.readFileSync(path.join(runtime,'integration-browser/toggles.json')));
assert.deepEqual(frames.map(f=>f.state.tick),[0,94,95,96,1916,1956]);
function check(frame){
 const state=frame.state,m=frame.metrics,p=[state.ball.pos.x,state.ball.pos.y],projected=P(p);
 assert.equal(stable(state),stable(oracle.states[state.tick]));assert.deepEqual(m.nativeCenter,p);assert.deepEqual(m.projectedNativeCenter,projected);
 const flat=m.view==='flat',center=flat?p:projected,ends=[P([p[0]-16,p[1]]),P([p[0]+16,p[1]])],radius=flat?16:Math.hypot(ends[1][0]-ends[0][0],ends[1][1]-ends[0][1])/2;
 const b=m.ball,sh=m.shadow;assert.equal(b.visualLiftPx,0);assert.deepEqual(b.textureCanvas,[1254,1254]);assert.deepEqual(b.anchor,[626/1254,636.5/1254]);assert.equal(b.opacity,1);
 const centerError=Math.hypot(b.center[0]-center[0],b.center[1]-center[1]);assert.equal(centerError,0);
 const radiusError=Math.max(...b.scale.map(s=>Math.abs(s*428-radius)));assert.ok(radiusError<1e-12);assert.equal(b.scale[0],b.scale[1]);
 assert.deepEqual(sh.textureCanvas,[1774,887]);assert.deepEqual(sh.meshScale,[1,1]);assert.equal(sh.opacity,0.42);assert.deepEqual(sh.radiusNative,[22,22]);assert.deepEqual(sh.offsetNative,[-6,10]);
 const firstNative=[p[0]-6+(0-885.5)*22/312,p[1]+10+(0-442)*22/312],first=flat?firstNative:P(firstNative),float32Expected=first.map(Math.fround);
 assert.deepEqual(sh.firstGroundVertexSource,float32Expected,'actual mesh must store exactly one projection in Float32');
 const shadowError=Math.hypot(first[0]-sh.firstGroundVertexSource[0],first[1]-sh.firstGroundVertexSource[1]);
 return {tick:state.tick,view:m.view,ballCenter:b.center,expectedRadius:radius,actualRadiusFromScale:b.scale[0]*428,centerError,radiusError,shadowVertexFloat32Exact:true,shadowQuantizationError:shadowError,nativeStateEqual:true,visualLiftPx:b.visualLiftPx};
}
const results=frames.map(check),toggleResults=toggles.map(t=>({...check(t),action:t.action,artVisible:t.metrics.artVisible,geometryVisible:t.metrics.geometryVisible,statePreserved:t.statePreserved}));
assert.ok(toggles.every(t=>t.statePreserved));assert.equal(toggles[0].metrics.artVisible,false);assert.equal(toggles[0].metrics.geometryVisible,true);assert.equal(toggles[1].metrics.geometryVisible,false);
const report={scope:'limited renderer adapter only; no final board, obstacle/receiver occlusion, or artistic PASS',sourceCommit:'38282825c2688e010612e35b6a807e027fb0b90a',url:'http://127.0.0.1:41767/',inventorySha256:hash(inventoryBytes),filesListSha256:'e3b47613b5b678d38d6da35bfac3af8ca567540f6270dc841ea5686eafd50850',files:28,totalBytes:5260713,
 packetProvenance:{sourceGit:{commit:'1adf57cfde5a20855c02a846baa045936e4d5a6d',bytes:5302,sha256:hash(sourcePacketBytes),encoding:'UTF8 LF; independently read from exact Git object'},usedInputCopy:{bytes:5521,sha256:adapter.spriteSource.packetSha256,encoding:'working copy containing CRLF; identity declared in frozen adapter and verified by Lead',normalizationEquivalence:'CRLF->LF and parsed JSON equality independently confirmed by Lead; QA verified Git bytes and adapter semantics, did not regenerate the used copy'}},
 nativeBundleUnchanged:true,coreSha256:meta.coreSha256,consumerSha256:meta.consumerSha256,adapterManifestSha256:hash(fs.readFileSync(path.join(served,'artist.json'))),results,toggleResults,
 limitation:'Only first actual mesh vertex is exposed by DOM metrics; its Float32 position and frozen source UV mapping were checked. No claim of artistic shadow readability/occlusion follows from numeric properties.'};
const out=path.join(qa,'integration-02');fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'adapter-check.json'),JSON.stringify(report,null,2)+'\n');fs.writeFileSync(path.join(out,'frozen-inventory.json'),inventoryBytes);
const shots=[];for(const name of ['state0.png','state95.png','state1956.png','state95-art-only.png','state95-flat-art.png']){const bytes=fs.readFileSync(path.join(runtime,'integration-browser',name));fs.writeFileSync(path.join(out,name),bytes);shots.push({file:name,sha256:hash(bytes),bytes:bytes.length});}
fs.writeFileSync(path.join(out,'screenshots.json'),JSON.stringify(shots,null,2)+'\n');
console.log(JSON.stringify({results,toggleResults,packetProvenance:report.packetProvenance},null,2));
