import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {stripTypeScriptTypes} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';

// Only parameters locate the authorized private inputs; no private source is committed.
const [nativeRepo,deps]=process.argv.slice(2);
if(!nativeRepo||!deps)throw Error('Provide nativeRepo and accepted P1 node_modules');
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../..');
const root='E:/R4D/perspective/p3-runtime/builder/full-checkpoint-06';
const out='E:/R4D/perspective/p3-runtime/technical-qa/frozen-01';
const base='http://127.0.0.1:6866/review/r4d/p3-masks/';
const code='f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74';
const art='f899a308aed156a11e2a1013292ed68c6669959d';
const p1='4b47db04c7140ebf88f69b91faa0b790d46f22ec';
const core='5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023';
const manifestHash='e2e9f7d837b3d05f484f75a877af6992a70ee88363add783d80f3c6e206f431f';
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const git=(root,...args)=>execFileSync('git',['--no-optional-locks','-C',root,...args],{maxBuffer:8*1024*1024});
const exact=(commit,file)=>git(repo,'show',`${commit}:${file}`);
const read=relative=>fs.readFileSync(path.join(root,relative));
const json=relative=>JSON.parse(read(relative));
const stable=value=>JSON.stringify(value,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
fs.mkdirSync(out,{recursive:true});
const manifestBytes=read('file-manifest.json');assert.equal(sha(manifestBytes),manifestHash);
const manifest=JSON.parse(manifestBytes),build=json('build.json'),baseline=json('data/config.json');
assert.equal(manifest.sourceCommit,code);assert.equal(build.sourceCommit,code);
const local=[];
function visit(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const f=path.join(dir,e.name);if(e.isDirectory())visit(f);else local.push(path.relative(root,f).replaceAll('\\','/'));}}
visit(root);
assert.equal(new Set(manifest.files.map(f=>f.path)).size,76);
assert.deepEqual(local.sort(),[...manifest.files.map(f=>f.path),'file-manifest.json'].sort());
let bytes=0;const served=[];const scanFindings=[];
for(const entry of [...manifest.files,{path:'file-manifest.json',bytes:manifestBytes.length,sha256:manifestHash}]){
 const data=read(entry.path);assert.equal(data.length,entry.bytes,entry.path);assert.equal(sha(data),entry.sha256,entry.path);bytes+=data.length;
 const response=await fetch(base+entry.path,{cache:'no-store'});assert.equal(response.status,200,entry.path);
 const http=Buffer.from(await response.arrayBuffer());assert.deepEqual(http,data,entry.path);
 const mime=response.headers.get('content-type');
 if(entry.path.endsWith('.js'))assert.match(mime,/^(application|text)\/javascript(?:;|$)/i,entry.path);
 served.push({path:entry.path,bytes:data.length,sha256:sha(http),contentType:mime});
 assert.ok(!/\.(ts|tsx|map)$/i.test(entry.path),entry.path);
 if(/\.(?:js|json|html|css|txt)$/.test(entry.path)){
  const text=data.toString('utf8');
  if(/sourceMappingURL|sourcesContent|[CD]:[\\/]|file:\/\/\/|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/.test(text))scanFindings.push(entry.path);
 }
}
assert.equal(bytes,3401352);assert.deepEqual(scanFindings,[]);
const linked=[];
for(const [payload,source] of [['app.js','src/app.js'],['index.html','src/index.html'],['run-model.js','src/run-model.js'],['style.css','src/style.css'],['data/config.json','inputs/config.json'],['data/manifest.json','inputs/manifest.json'],['data/projection.json','inputs/projection.json'],['view-math.js','inputs/view-math.mjs']]){
 assert.deepEqual(read(payload),exact(code,'experiments/p3-masks/builder/'+source),payload);linked.push(payload);
}
for(const [payload,source] of [['data/config.json','simulation/boards/01/trial-01/config.json'],['data/manifest.json','simulation/boards/01/trial-01/manifest.json'],['data/projection.json','research/board01-projection.candidate-01.json'],['view-math.js','viewer/src/view-math.mjs']])assert.deepEqual(read(payload),exact(p1,'experiments/p1-collider-mapping/clean-repeat-01/'+source),payload);
const assets=json('assets/artist/assets.json');assert.equal(assets.occluders.length,51);
for(const relative of new Set(['assets.json',assets.ball.path,assets.shadow.path,...assets.occluders.map(x=>x.path)])){
 assert.deepEqual(read('assets/artist/'+relative),exact(art,'experiments/p3-masks/asset-artist/'+relative),relative);linked.push('assets/artist/'+relative);
}
assert.equal(sha(read('assets/jungle.jpg')),'c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72');
assert.equal(sha(read('vendor/PIXI-LICENSE.txt')),'5ce7447bc57f7349ffc48338782fbcabe613696e00712b20d66bc58e780f9473');
const pixi=fs.readFileSync(path.join(deps,'pixi.js/dist/pixi.min.mjs'),'utf8').replace(/\/\/# sourceMappingURL=.*$/gm,'');
assert.deepEqual(read('vendor/pixi.js'),Buffer.from(pixi));
assert.equal(git(nativeRepo,'rev-parse','HEAD').toString().trim(),core);
assert.equal(git(nativeRepo,'status','--porcelain=v1','--','packages/sim-core').toString().trim(),'');
assert.equal(git(nativeRepo,'rev-parse',`${core}:packages/sim-core/src`).toString().trim(),build.nativeProvenance.sourceTreeGitOid);
assert.equal(process.versions.node,build.nativeProvenance.nodeVersion);
const consumed=new Set();
function nativeSource(relative){const raw=git(nativeRepo,'show',`${core}:packages/sim-core/src/${relative}`);consumed.add(createHash('sha1').update(`blob ${raw.length}\0`).update(raw).digest('hex'));return stripTypeScriptTypes(raw.toString('utf8'),{mode:'transform',sourceMap:false});}
const {rolldown}=await import(pathToFileURL(path.join(deps,'rolldown/dist/index.mjs')));
assert.equal('rolldown '+JSON.parse(fs.readFileSync(path.join(deps,'rolldown/package.json'))).version,build.nativeProvenance.bundler);
const rebuilt=path.join(out,'qa-native-core.js');
const bundler=await rolldown({input:'native-entry',plugins:[{
 name:'tqa-exact-native-reproduction',
 resolveId(id,importer){
  if(id==='native-entry')return '\0native-entry';
  if(importer==='\0native-entry'&&id.startsWith('./'))return '\0native/'+id.slice(2).replace(/\.js$/,'.ts');
  if(importer?.startsWith('\0native/')&&id.startsWith('.'))return '\0native/'+path.posix.normalize(path.posix.join(path.posix.dirname(importer.slice(8)),id)).replace(/\.js$/,'.ts');
 },
 load(id){if(id==='\0native-entry')return 'export {createSimRunSession,stepSimRunSession,timeoutSimRunSession} from "./Sim.js";';if(id.startsWith('\0native/'))return nativeSource(id.slice(8));}
}]});
await bundler.write({file:rebuilt,format:'esm',minify:true,sourcemap:false});await bundler.close();
assert.deepEqual([...consumed].sort(),build.nativeProvenance.inputGitBlobOids);
assert.deepEqual(fs.readFileSync(rebuilt),read('native-core.js'),'Independently rebuilt compiled native bytes');

// Separate unbundled oracle: transformed exact Git modules, no Builder adapter.
const oracleDir=path.join(out,'private-native-oracle');fs.mkdirSync(oracleDir,{recursive:true});
fs.writeFileSync(path.join(oracleDir,'package.json'),'{"type":"module","private":true}\n');
const loaded=new Set();
function emit(relative){
 if(loaded.has(relative))return;loaded.add(relative);
 const text=nativeSource(relative),dest=path.join(oracleDir,relative.replace(/\.ts$/,'.js'));
 fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,text);
 for(const m of text.matchAll(/(?:from\s*|import\s*\()\s*['"]([^'"]+)['"]/g))if(m[1].startsWith('.'))emit(path.posix.normalize(path.posix.join(path.posix.dirname(relative),m[1])).replace(/\.js$/,'.ts'));
}
emit('Sim.ts');
const native=await import(pathToFileURL(path.join(oracleDir,'Sim.js')));
const candidate=await import(pathToFileURL(path.join(root,'run-model.js')));
function oracle(seed){
 const config=structuredClone(baseline);config.rng.seed=seed;
 const hits=[];const session=native.createSimRunSession(config,{onEvent:e=>{if(e.type==='object_hit')hits.push(structuredClone(e));}});
 const states=[structuredClone(session.state)];
 for(let n=0;n<Math.ceil(config.board.timeSecMax*1000/config.defaults.tickMs)&&!session.state.done;n++){
  native.stepSimRunSession(session);states.push(structuredClone(session.state));
 }
 if(!session.state.done){native.timeoutSimRunSession(session);states[states.length-1]=structuredClone(session.state);}
 return {seed,config,states,hits,lastTick:states.length-1,result:structuredClone(session.state.result)};
}
const results=[];
function compare(seed){
 const truth=oracle(seed),actual=candidate.makeRun(baseline,seed);
 assert.deepEqual(actual.config,truth.config);assert.deepEqual(actual.states,truth.states,`all native states seed ${seed}`);assert.deepEqual(actual.hits,truth.hits);
 results.push({seed,lastTick:truth.lastTick,result:truth.result,ticksCompared:truth.states.length,traceSha256:sha(stable(truth.states)),hits:truth.hits});return truth;
}
const catalog=json('replays/index.json');
for(const saved of catalog.runs){const run=compare(saved.seed);assert.equal(run.lastTick,saved.lastTick);assert.deepEqual(run.result,saved.result);}
for(const record of [...catalog.runs,...catalog.frames]){
 const cp=json(record.path),run=oracle(cp.seed);assert.deepEqual(cp.state,run.states[cp.tick]);assert.deepEqual(cp.config,run.config);
 const replay=candidate.importCheckpoint(cp,baseline,build);assert.equal(replay.tick,cp.tick);assert.deepEqual(replay.run.states[cp.tick],run.states[cp.tick]);
}
const evidenceDir=path.join(out,'browser');
const browserSamples=fs.existsSync(evidenceDir)?fs.readdirSync(evidenceDir).filter(f=>f.endsWith('.json')).sort():[];
const samples=[];
for(const file of browserSamples){
 const sample=JSON.parse(fs.readFileSync(path.join(evidenceDir,file)));
 if(!sample.checkpoint)continue;
 const cp=sample.checkpoint,truth=oracle(cp.seed);assert.deepEqual(cp.config,truth.config);assert.deepEqual(cp.state,truth.states[cp.tick],file);
 const expected=candidate.checkpoint(candidate.makeRun(baseline,cp.seed),cp.tick,build);assert.deepEqual(cp,expected,file);
 samples.push({file,seed:cp.seed,tick:cp.tick,stateSha256:sha(stable(cp.state)),lastTick:truth.lastTick,result:truth.result});
}
const summary={candidate:'P3-frozen-01',utc:new Date().toISOString(),sourceCommit:code,artistCommit:art,manifestSha256:manifestHash,payloadFiles:76,payloadBytes:3388537,totalFiles:local.length,totalBytes:bytes,served,sourceLinkedFiles:linked,nativeCompiledSha256:sha(fs.readFileSync(rebuilt)),nativeInputGitBlobOids:[...consumed].sort(),nativeOracleModules:loaded.size,savedRuns:results,browserSamples:samples,scanFindings};
fs.writeFileSync(path.join(out,'verification.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({...summary,served:`${served.length} exact HTTP/local files`,sourceLinkedFiles:linked.length,nativeInputGitBlobOids:consumed.size,savedRuns:results.map(({hits,...r})=>({...r,contacts:hits.length}))},null,2));
