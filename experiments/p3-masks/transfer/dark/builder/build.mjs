import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url));
const repo=execFileSync('git',['-C',here,'rev-parse','--show-toplevel'],{encoding:'utf8'}).trim();
const prefix=path.relative(repo,here).replaceAll('\\','/');
const sourceCommit=execFileSync('git',['-C',repo,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(execFileSync('git',['-C',repo,'status','--porcelain=v1','--',prefix],{encoding:'utf8'}).trim())throw Error('Commit this board source before building');
const own=relative=>execFileSync('git',['-C',repo,'show',`${sourceCommit}:${prefix}/${relative}`]);
const spec=JSON.parse(own('transfer.json'));
const output=path.resolve(process.argv[2]??path.join(spec.runtime,'diagnostic-01'));
if(!output.startsWith(path.resolve(spec.runtime)+path.sep))throw Error('Output must stay inside this board runtime');
if(fs.existsSync(output))throw Error('Existing candidate bytes must not be overwritten');
const sha=b=>createHash('sha256').update(b).digest('hex');
const baseline='E:/R4D/perspective/p3-runtime/builder/full-checkpoint-06';
const baselineManifestBytes=fs.readFileSync(path.join(baseline,'file-manifest.json'));
if(sha(baselineManifestBytes)!==spec.baselineManifestSha256)throw Error('Original Jungle frozen manifest differs');
const baselineManifest=JSON.parse(baselineManifestBytes),baselineBuild=JSON.parse(fs.readFileSync(path.join(baseline,'build.json')));
if(baselineBuild.sourceCommit!==spec.baselineCode||baselineBuild.artistSource.commit!==spec.baselineArt||baselineBuild.coreCommit!==spec.coreCommit)throw Error('Selected method baseline differs');
const coreRepo='D:/dev/.codex-worktrees/r4d-p1-collider-mapping/millionko-source/lead';
const packageTree=execFileSync('git',['-C',coreRepo,'rev-parse',`${spec.coreCommit}:packages/sim-core`],{encoding:'utf8'}).trim();
if(packageTree!==spec.corePackageTree)throw Error('Native package tree differs');
fs.mkdirSync(output,{recursive:true});
for(const file of ['native-core.js','vendor/pixi.js','vendor/PIXI-LICENSE.txt']){
 const bytes=fs.readFileSync(path.join(baseline,file));
 if(sha(bytes)!==baselineManifest.files.find(item=>item.path===file)?.sha256)throw Error('Baseline compiled/vendor bytes differ: '+file);
 fs.mkdirSync(path.dirname(path.join(output,file)),{recursive:true});fs.writeFileSync(path.join(output,file),bytes);
}
for(const name of ['index.html','app.js','run-model.js','style.css'])fs.writeFileSync(path.join(output,name),own('src/'+name));
fs.mkdirSync(path.join(output,'data'));
for(const [name,expected]of [['config.json',spec.configSha256],['manifest.json',spec.manifestSha256],['projection.json',spec.projectionSha256]]){
 const bytes=own('inputs/'+name);if(sha(bytes)!==expected)throw Error('Board input differs: '+name);fs.writeFileSync(path.join(output,'data',name),bytes);
}
fs.writeFileSync(path.join(output,'view-math.js'),own('inputs/view-math.mjs'));
const source=fs.readFileSync(spec.sourcePath);if(sha(source)!==spec.sourceSha256)throw Error('Source JPG differs');
fs.mkdirSync(path.join(output,'assets'));fs.writeFileSync(path.join(output,'assets/source.jpg'),source);
fs.mkdirSync(path.join(output,'assets/artist'));
let artistSource=null;
if(process.env.P3_ARTIST_ASSETS){
 const artistDir=path.resolve(process.env.P3_ARTIST_ASSETS);
 if(!artistDir.startsWith(path.resolve(spec.runtime)+path.sep))throw Error('Artist snapshot belongs to another board runtime');
 const handoff=JSON.parse(fs.readFileSync(path.join(artistDir,'handoff.json')));
 if(handoff.variant&&!/^[a-z][a-z0-9-]{0,63}$/.test(handoff.variant))throw Error('Named Artist variant differs');
 const expectedArtistPrefix=spec.artistPrefix+(handoff.variant?`variants/${handoff.variant}/`:'');
 if(handoff.board!==spec.board||handoff.prefix!==expectedArtistPrefix)throw Error('Artist packet board identity differs');
 for(const item of handoff.files){const bytes=fs.readFileSync(path.join(artistDir,item.path));if(bytes.length!==item.bytes||sha(bytes)!==item.sha256)throw Error('Artist frozen bytes differ: '+item.path);fs.mkdirSync(path.dirname(path.join(output,'assets/artist',item.path)),{recursive:true});fs.writeFileSync(path.join(output,'assets/artist',item.path),bytes);}
 fs.copyFileSync(path.join(artistDir,'handoff.json'),path.join(output,'assets/artist/handoff.json'));
 artistSource={commit:handoff.commit,prefix:handoff.prefix,variant:handoff.variant??null,assetsSha256:sha(fs.readFileSync(path.join(artistDir,'assets.json')))};
}else fs.writeFileSync(path.join(output,'assets/artist/assets.json'),JSON.stringify({schema:'r4d-p3-assets-v1',sourceSize:[1536,1536],occluders:[],status:'diagnostic; own Artist handoff pending'},null,2)+'\n');
const nativeProvenance={...baselineBuild.nativeProvenance,corePackageTree:packageTree,reusedExactCompiledModule:true,baselineManifestSha256:spec.baselineManifestSha256};
const meta={schema:'r4d-p3-transfer-build-v1',board:spec.board,label:spec.label,sourceCommit,coreCommit:spec.coreCommit,nativeProvenance,p1Commit:spec.p1Commit,orderCommit:spec.orderCommit,pixi:baselineBuild.pixi,artistSource,methodBaseline:{code:spec.baselineCode,art:spec.baselineArt,manifestSha256:spec.baselineManifestSha256,depth:'unchanged scalar/line; same alpha restoration passes'},configSha256:spec.configSha256,manifestSha256:spec.manifestSha256,projectionSha256:spec.projectionSha256,sourceSha256:spec.sourceSha256,builtAt:new Date().toISOString()};
const replaySources=JSON.parse(own('replay-sources.json'));
meta.replayProvenance={mode:'exact existing checkpoints; no native replay during packaging',baselineManifestSha256:replaySources.baselineManifestSha256,vqaCommit:replaySources.vqaCommit};
fs.writeFileSync(path.join(output,'build.json'),JSON.stringify(meta,null,2)+'\n');
const catalog=JSON.parse(own('replay-catalog.json'));
const baselineConfig=JSON.parse(fs.readFileSync(path.join(output,'data/config.json')));
const priorRoot=path.join(spec.runtime,'full-method-03');
if(sha(fs.readFileSync(path.join(priorRoot,'file-manifest.json')))!==replaySources.baselineManifestSha256)throw Error('Prior replay bundle differs');
const canonical=value=>JSON.stringify(value,(_,item)=>item&&typeof item==='object'&&!Array.isArray(item)?Object.fromEntries(Object.keys(item).sort().map(key=>[key,item[key]])):item);
function reuseCheckpoint(seed,tick){
 const item=replaySources.files[`${seed}:${tick??'end'}`];if(!item)throw Error('Missing pinned checkpoint');
 const bytes=item.kind==='baseline'?fs.readFileSync(path.join(priorRoot,item.path)):execFileSync('git',['-C',repo,'show',`${replaySources.vqaCommit}:${item.path}`]);
 if(bytes.length!==item.bytes||sha(bytes)!==item.sha256)throw Error('Prior checkpoint bytes differ');
 const cp=JSON.parse(bytes),expected=structuredClone(baselineConfig);expected.rng.seed=seed;
 if(cp.boardId!==spec.board||cp.coreCommit!==spec.coreCommit||cp.p1Commit!==spec.p1Commit||cp.configSha256!==spec.configSha256||cp.projectionSha256!==spec.projectionSha256||cp.seed!==seed||canonical(cp.config)!==canonical(expected)||cp.state.tick!==cp.tick||(tick!==undefined&&cp.tick!==tick))throw Error('Prior checkpoint identity differs');
 if(tick===undefined&&(!cp.state.done||!cp.state.result))throw Error('Prior terminal checkpoint missing result');
 const relative=`replays/${spec.board}-seed-${seed}-tick-${cp.tick}.json`;fs.writeFileSync(path.join(output,relative),bytes);
 return {cp,path:relative};
}
fs.mkdirSync(path.join(output,'replays'));
const index={board:spec.board,runs:[],frames:[]};
for(const record of catalog.runs){
 const saved=reuseCheckpoint(record.seed);index.runs.push({...record,lastTick:saved.cp.tick,result:saved.cp.state.result,path:saved.path});
}
for(const record of catalog.frames){if(!catalog.runs.some(r=>r.seed===record.seed))throw Error('Frame seed not declared');const saved=reuseCheckpoint(record.seed,record.tick);index.frames.push({...record,path:saved.path});}
fs.writeFileSync(path.join(output,'replays/index.json'),JSON.stringify(index,null,2)+'\n');
const files=[];
function visit(directory){for(const item of fs.readdirSync(directory,{withFileTypes:true})){const full=path.join(directory,item.name);if(item.isDirectory())visit(full);else{const bytes=fs.readFileSync(full);files.push({path:path.relative(output,full).replaceAll('\\','/'),bytes:bytes.length,sha256:sha(bytes)});}}}
visit(output);files.sort((a,b)=>a.path.localeCompare(b.path));
fs.writeFileSync(path.join(output,'file-manifest.json'),JSON.stringify({schema:'r4d-p3-transfer-files-v1',board:spec.board,sourceCommit,files},null,2)+'\n');
console.log(JSON.stringify({board:spec.board,output,sourceCommit,artistSource,nativeSha256:nativeProvenance.compiledSha256,files:files.length,totalBytes:files.reduce((sum,f)=>sum+f.bytes,0),manifestSha256:sha(fs.readFileSync(path.join(output,'file-manifest.json'))),ordinaryRuns:index.runs.map(r=>({seed:r.seed,lastTick:r.lastTick,result:r.result})),browserChecked:false},null,2));
