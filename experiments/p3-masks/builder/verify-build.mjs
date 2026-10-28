import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
const directory=path.resolve(process.argv[2]);
const url=process.argv[3];
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const fileManifest=JSON.parse(fs.readFileSync(path.join(directory,'file-manifest.json')));
let bytes=0;
for(const file of fileManifest.files){
 assert(!/\.(ts|tsx|map|mjs)$/.test(file.path),`Unexpected browser artifact: ${file.path}`);
 const content=fs.readFileSync(path.join(directory,file.path));
 assert.equal(content.length,file.bytes);assert.equal(sha(content),file.sha256);
 if(url){const response=await fetch(new URL(file.path,url));assert.equal(response.status,200,file.path);const downloaded=Buffer.from(await response.arrayBuffer());assert.equal(sha(downloaded),file.sha256,`HTTP bytes: ${file.path}`);if(file.path.endsWith('.js'))assert.match(response.headers.get('content-type'),/javascript/);}
 bytes+=content.length;
}
const native=fs.readFileSync(path.join(directory,'native-core.js'),'utf8');
assert(!/sourceMappingURL|packages\/sim-core\/src|[A-Z]:[\\/]/.test(native),'Private source reference in compiled core');
const config=JSON.parse(fs.readFileSync(path.join(directory,'data/config.json')));
assert.equal(sha(fs.readFileSync(path.join(directory,'data/config.json'))),'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db');
assert.equal(sha(fs.readFileSync(path.join(directory,'data/manifest.json'))),'7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18');
assert.equal(sha(fs.readFileSync(path.join(directory,'data/projection.json'))),'9ca9e520f1927426a3a5ba73a5eacaf90fedffc9385e7d08d5b1e6ee644b020c');
const {makeRun,checkpoint,importCheckpoint}=await import(pathToFileURL(path.join(directory,'run-model.js')));
const build=JSON.parse(fs.readFileSync(path.join(directory,'build.json')));
const runs=[];
for(const seed of [0,2818447218,2099436614,3925936860]){
 const run=makeRun(config,seed),tick=Math.min(95,run.lastTick),cp=checkpoint(run,tick,build);
 const restored=importCheckpoint(JSON.parse(JSON.stringify(cp)),config,build);
 assert.deepEqual(restored.run.states[tick],run.states[tick]);
 const changed=structuredClone(cp);changed.config.physics.gravityY+=1;
 assert.throws(()=>importCheckpoint(changed,config,build));
 const badState=structuredClone(cp);badState.state.rngU32^=1;
 assert.throws(()=>importCheckpoint(badState,config,build));
 runs.push({seed,lastTick:run.lastTick,result:run.result,firstHit:run.hits[0]});
}
const first=makeRun(config,2818447218),second=makeRun(config,2099436614);
assert.notDeepEqual(first.states[500].ball,second.states[500].ball);
console.log(JSON.stringify({sourceCommit:fileManifest.sourceCommit,filesVerified:fileManifest.files.length,bytes,manifestSha256:sha(fs.readFileSync(path.join(directory,'file-manifest.json'))),route:url??null,httpHashesAndJavaScriptMime:!!url,nativeReplay:true,tamperRejected:true,ordinaryRuns:runs},null,2));
