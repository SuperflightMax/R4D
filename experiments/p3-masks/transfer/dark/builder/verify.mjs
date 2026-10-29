import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const here=path.dirname(fileURLToPath(import.meta.url)),spec=JSON.parse(fs.readFileSync(path.join(here,'transfer.json')));
const root=path.resolve(process.argv[2]),url=process.argv[3];
assert(root.startsWith(path.resolve(spec.runtime)+path.sep));
const sha=b=>createHash('sha256').update(b).digest('hex');
const raw=fs.readFileSync(path.join(root,'file-manifest.json')),manifest=JSON.parse(raw),build=JSON.parse(fs.readFileSync(path.join(root,'build.json')));
assert.equal(build.board,spec.board);assert.equal(build.configSha256,spec.configSha256);assert.equal(build.projectionSha256,spec.projectionSha256);
for(const file of manifest.files){const bytes=fs.readFileSync(path.join(root,file.path));assert.equal(bytes.length,file.bytes,file.path);assert.equal(sha(bytes),file.sha256,file.path);assert(!/\.(?:ts|tsx|map|mjs)$/.test(file.path));if(url){const response=await fetch(new URL(file.path,url));assert.equal(response.status,200,file.path);assert.equal(sha(Buffer.from(await response.arrayBuffer())),file.sha256,file.path);if(file.path.endsWith('.js'))assert.match(response.headers.get('content-type'),/javascript/);}}
for(const [name,expected]of [['config.json',spec.configSha256],['manifest.json',spec.manifestSha256],['projection.json',spec.projectionSha256]])assert.equal(sha(fs.readFileSync(path.join(root,'data',name))),expected);
assert.equal(sha(fs.readFileSync(path.join(root,'native-core.js'))),build.nativeProvenance.compiledSha256);
assert.equal(build.nativeProvenance.corePackageTree,spec.corePackageTree);
const {makeRun,importCheckpoint}=await import(pathToFileURL(path.join(root,'run-model.js'))),config=JSON.parse(fs.readFileSync(path.join(root,'data/config.json'))),catalog=JSON.parse(fs.readFileSync(path.join(root,'replays/index.json'))),ordinaryRuns=[];
for(const item of catalog.runs){const data=JSON.parse(fs.readFileSync(path.join(root,item.path))),restored=importCheckpoint(data,config,build),direct=makeRun(config,item.seed);assert.deepEqual(restored.run.states[restored.tick],direct.states[direct.lastTick]);const wrongBoard=structuredClone(data);wrongBoard.boardId=spec.board==='water'?'dark':'water';assert.throws(()=>importCheckpoint(wrongBoard,config,build));const wrongState=structuredClone(data);wrongState.state.ball.pos.x+=1;assert.throws(()=>importCheckpoint(wrongState,config,build));ordinaryRuns.push({seed:item.seed,lastTick:direct.lastTick,result:direct.result,firstHits:direct.hits.slice(0,3).map(h=>({tick:h.tick,id:h.objectId}))});}
console.log(JSON.stringify({board:spec.board,sourceCommit:build.sourceCommit,artistSource:build.artistSource,manifestSha256:sha(raw),filesVerified:manifest.files.length,httpHashesAndMime:!!url,nativeReplayExact:true,crossBoardImportRejected:true,ordinaryRuns},null,2));
