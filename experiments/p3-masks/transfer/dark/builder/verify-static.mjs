import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const here=path.dirname(fileURLToPath(import.meta.url)),spec=JSON.parse(fs.readFileSync(path.join(here,'transfer.json')));
const root=path.resolve(process.argv[2]),url=process.argv[3],prior=path.join(spec.runtime,'full-method-03');
assert(root.startsWith(path.resolve(spec.runtime)+path.sep));
const sha=b=>createHash('sha256').update(b).digest('hex'),read=(base,file)=>fs.readFileSync(path.join(base,file));
const raw=read(root,'file-manifest.json'),manifest=JSON.parse(raw),build=JSON.parse(read(root,'build.json'));
const allowed=/^(?:index\.html|app\.js|style\.css|run-model\.js|view-math\.js|native-core\.js|build\.json|data\/(?:config|manifest|projection)\.json|assets\/source\.jpg|assets\/artist\/(?:assets\.json|handoff\.json|assets\/(?:ball|shadow)\.png|masks\/[a-z0-9-]+\.png)|replays\/(?:index\.json|dark-seed-\d+-tick-\d+\.json)|vendor\/(?:pixi\.js|PIXI-LICENSE\.txt))$/;
for(const f of manifest.files){assert(allowed.test(f.path),f.path);const bytes=read(root,f.path);assert.equal(bytes.length,f.bytes,f.path);assert.equal(sha(bytes),f.sha256,f.path);if(url){const response=await fetch(new URL(f.path,url));assert.equal(response.status,200,f.path);assert.equal(sha(Buffer.from(await response.arrayBuffer())),f.sha256,f.path);if(f.path.endsWith('.js'))assert.match(response.headers.get('content-type'),/javascript/);}}
if(url){const response=await fetch(new URL('file-manifest.json',url));assert.equal(response.status,200);assert.equal(sha(Buffer.from(await response.arrayBuffer())),sha(raw));}
assert.equal(sha(read(prior,'file-manifest.json')),'b3923f4ccab57a8361a9dc8f64de73fcee9b70fb38c87aac5e9623fbc62d0307');
assert.equal(build.board,'dark');assert.equal(build.coreCommit,spec.coreCommit);assert.equal(build.p1Commit,spec.p1Commit);
assert.equal(build.artistSource.commit,'e5d3e1f44c112e483ff2a23fbd169cb119390865');assert.equal(build.artistSource.prefix,spec.artistPrefix+'variants/receiver-front-edge-01/');
assert.equal(sha(read(root,'assets/artist/assets.json')),'2b02dcde6c07266b67285700040e4ae0342f06fb760ae6ed0cf1fdcdc9b6cbad');
assert.equal(sha(read(root,'app.js')),'760c9bada40cb3ecb944f332f6efa91bb3c1340ce7f1ad9c2cabeda4dca0a3e6');
assert.equal(sha(read(root,'native-core.js')),'af8e6dea9ee5c46759f99ba3b68f4afa91c740b4fd2aba2d2d3f65bfa66753fa');
for(const f of ['app.js','run-model.js','view-math.js','native-core.js','data/config.json','data/manifest.json','data/projection.json','assets/source.jpg','vendor/pixi.js'])assert.deepEqual(read(root,f),read(prior,f),f);
const next=JSON.parse(read(root,'assets/artist/assets.json')),old=JSON.parse(read(prior,'assets/artist/assets.json')),changed=[];
for(let i=0;i<60;i++){const a=structuredClone(old.occluders[i]),b=structuredClone(next.occluders[i]);if(JSON.stringify(a)!==JSON.stringify(b))changed.push(a.id);delete a.depthLineNative;delete b.depthLineNative;assert.deepEqual(a,b);}
assert.equal(changed.length,12);assert(changed.every(id=>/^receiver-0[1-4]-(?:front|left-rim|right-rim)$/.test(id)));
const a={...old},b={...next};delete a.occluders;delete b.occluders;assert.deepEqual(a,b);
const pngs=manifest.files.filter(f=>f.path.endsWith('.png'));assert.equal(pngs.length,62);for(const f of pngs)assert.deepEqual(read(root,f.path),read(prior,f.path),f.path);
const catalog=JSON.parse(read(root,'replays/index.json'));assert.equal(catalog.runs.length,8);
console.log(JSON.stringify({board:build.board,sourceCommit:build.sourceCommit,artistSource:build.artistSource,manifestSha256:sha(raw),manifestBytes:raw.length,payloadFiles:manifest.files.length,payloadBytes:manifest.files.reduce((s,f)=>s+f.bytes,0),httpHashesAndMime:!!url,rendererCoreP1SourceEqual:true,pngsExactlyEqual:62,changedDepthRecords:12,nonReceiverRecordsEqual:48,nativeReplayed:false,ordinaryOutcomesPreviouslyVerified:catalog.runs.map(r=>({seed:r.seed,lastTick:r.lastTick,result:r.result})),visualQaPending:true},null,2));
