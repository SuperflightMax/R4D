import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';import {execFileSync} from 'node:child_process';import {pathToFileURL} from 'node:url';
const root='E:/R4D/perspective/p3-runtime/builder/transfer-water-dark/dark/full-method-03';
const out='E:/R4D/perspective/p3-runtime/technical-qa/transfer-water-dark/dark/full-method-03';
const repo='E:/R4D/perspective/p3-worktrees/technical-qa';
const source='c73d6128970b2b022d5313b08c34cafdec9a1bc3',art='17dc9fcdc261562acb581dd8590096819734c807';
const p1='4b47db04c7140ebf88f69b91faa0b790d46f22ec',prefix='experiments/p3-masks/transfer/dark/builder/';
const manifestHash='b3923f4ccab57a8361a9dc8f64de73fcee9b70fb38c87aac5e9623fbc62d0307';
const sha=x=>createHash('sha256').update(x).digest('hex');
const stable=x=>JSON.stringify(x,(_,v)=>v&&typeof v==='object'&&!Array.isArray(v)?Object.fromEntries(Object.keys(v).sort().map(k=>[k,v[k]])):v);
const raw=relative=>fs.readFileSync(path.join(root,relative)),json=relative=>JSON.parse(raw(relative));
const exact=(commit,p)=>execFileSync('git',['--no-optional-locks','-C',repo,'show',commit+':'+p],{maxBuffer:8*1024*1024});
fs.mkdirSync(out,{recursive:true});assert.equal(sha(raw('file-manifest.json')),manifestHash);
const manifest=json('file-manifest.json'),build=json('build.json'),baseline=json('data/config.json');
assert.equal(manifest.board,'dark');assert.equal(manifest.sourceCommit,source);assert.equal(build.board,'dark');assert.equal(build.sourceCommit,source);assert.equal(build.artistSource.commit,art);
assert.equal(sha(raw('native-core.js')),'af8e6dea9ee5c46759f99ba3b68f4afa91c740b4fd2aba2d2d3f65bfa66753fa');
const preflight=JSON.parse(fs.readFileSync(path.join(repo,'experiments/p3-masks/transfer/dark/technical-qa/INPUT_PREFLIGHT.json')));
assert.deepEqual(build.nativeProvenance.inputGitBlobOids,preflight.native.verifiedCachedModuleBlobs);
assert.equal(build.nativeProvenance.corePackageTree,preflight.native.trees.package);assert.equal(build.nativeProvenance.sourceTreeGitOid,preflight.native.trees.src);
assert.equal(build.coreCommit,preflight.native.commit);assert.equal(build.p1Commit,p1);
const browserOnly=process.argv.includes('--browser');
if(!browserOnly){
 const listed=[];function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())visit(full);else listed.push(path.relative(root,full).replaceAll('\\','/'));}}visit(root);
 assert.equal(manifest.files.length,87);assert.equal(new Set(manifest.files.map(f=>f.path)).size,87);
 assert.deepEqual(listed.sort(),[...manifest.files.map(f=>f.path),'file-manifest.json'].sort());
 const served=[],privacy=[],declaredSourceAssetReferences=[];let total=0;
 for(const f of [...manifest.files,{path:'file-manifest.json',bytes:14842,sha256:manifestHash}]){
  const bytes=raw(f.path);assert.equal(bytes.length,f.bytes,f.path);assert.equal(sha(bytes),f.sha256,f.path);total+=bytes.length;
  const response=await fetch('http://127.0.0.1:6869/review/r4d/p3-masks-dark/'+f.path,{cache:'no-store'});assert.equal(response.status,200,f.path);assert.deepEqual(Buffer.from(await response.arrayBuffer()),bytes,f.path);
  const mime=response.headers.get('content-type'),mediaType=mime?.split(';')[0].trim().toLowerCase(),ext=path.extname(f.path);const allowedMime={'.js':['application/javascript','text/javascript'],'.json':['application/json'],'.html':['text/html'],'.css':['text/css'],'.png':['image/png'],'.jpg':['image/jpeg'],'.txt':['text/plain']};assert.ok(allowedMime[ext]?.includes(mediaType),f.path+' MIME '+mime);
  assert.ok(!/\.(ts|tsx|map)$/i.test(f.path),f.path);let inspection=bytes.toString('utf8');
  if(['data/manifest.json','data/projection.json'].includes(f.path)){let count=0;const classify=v=>{if(typeof v==='string'&&v.replaceAll('\\','/')===preflight.source.path){count++;return '[declared-source-asset-reference]';}if(Array.isArray(v))return v.map(classify);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,value])=>[k,classify(value)]));return v;};inspection=JSON.stringify(classify(JSON.parse(inspection)));assert.equal(count,1,f.path+' declared input reference');declaredSourceAssetReferences.push(f.path);}
  if(/\.(js|json|html|css|txt)$/.test(f.path)&&/sourceMappingURL|sourcesContent|\b[A-Za-z]:[\\/]|file:\/\/\/|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY/.test(inspection))privacy.push(f.path);
  served.push({path:f.path,bytes:bytes.length,sha256:sha(bytes),mime});
 }
 assert.equal(total,3398225);assert.deepEqual(privacy,[]);
 const linked=[];
 for(const [payload,input] of [['app.js','src/app.js'],['run-model.js','src/run-model.js'],['index.html','src/index.html'],['style.css','src/style.css'],['data/config.json','inputs/config.json'],['data/manifest.json','inputs/manifest.json'],['data/projection.json','inputs/projection.json'],['view-math.js','inputs/view-math.mjs']]){assert.deepEqual(raw(payload),exact(source,prefix+input),payload);linked.push(payload);}
 for(const [payload,input]of [['data/config.json','simulation/boards/02/trial-01/config.json'],['data/manifest.json','simulation/boards/02/trial-01/manifest.json'],['data/projection.json','research/board02-projection.candidate-01.json'],['view-math.js','viewer/src/view-math.mjs']])assert.deepEqual(raw(payload),exact(p1,'experiments/p1-collider-mapping/clean-repeat-01/'+input),payload);
 const assets=json('assets/artist/assets.json');assert.equal(assets.occluders.length,60);assert.equal(sha(raw('assets/artist/assets.json')),'ef5eb34be622f5ce6356d6fa51d7902c334a1f1f3c95acce225d7340928bbc29');
 for(const name of new Set(['assets.json',assets.ball.path,assets.shadow.path,...assets.occluders.map(o=>o.path)])){assert.deepEqual(raw('assets/artist/'+name),exact(art,'experiments/p3-masks/transfer/dark/asset-artist/'+name),name);linked.push('assets/artist/'+name);}
 assert.equal(sha(raw('assets/source.jpg')),preflight.source.sha256);
 assert.equal(sha(raw('vendor/PIXI-LICENSE.txt')),'5ce7447bc57f7349ffc48338782fbcabe613696e00712b20d66bc58e780f9473');
 const oldIndex=JSON.parse(fs.readFileSync(path.join(repo,'experiments/p3-masks/technical-qa/FROZEN_01_WIP_VERIFICATION.json')));
 assert.equal(sha(raw('vendor/pixi.js')),oldIndex.served.find(f=>f.path==='vendor/pixi.js').sha256);
 fs.writeFileSync(path.join(out,'package-verification.json'),JSON.stringify({candidate:'dark-full-method-03',utc:new Date().toISOString(),sourceCommit:source,artistCommit:art,manifestHash,files:88,totalBytes:total,sourceLinked:linked,served,privacy,declaredSourceAssetReferences,compiledNativeReusedByExactHash:true},null,2)+'\n');
 console.log(JSON.stringify({package:'88 exact local/HTTP files',totalBytes:total,sourceLinked:linked.length,masks:assets.occluders.length,privacy},null,2));
}
const oracle=await import(pathToFileURL('E:/R4D/perspective/p3-runtime/technical-qa/frozen-01/private-native-oracle/Sim.js'));
const candidate=await import(pathToFileURL(path.join(root,'run-model.js')));
const cache=new Map();
function truth(seed){if(cache.has(seed))return cache.get(seed);const config=structuredClone(baseline);config.rng.seed=seed;const hits=[];const session=oracle.createSimRunSession(config,{onEvent:e=>{if(e.type==='object_hit')hits.push(structuredClone(e));}});const states=[structuredClone(session.state)];for(let i=0;i<Math.ceil(config.board.timeSecMax*1000/config.defaults.tickMs)&&!session.state.done;i++){oracle.stepSimRunSession(session);states.push(structuredClone(session.state));}if(!session.state.done){oracle.timeoutSimRunSession(session);states[states.length-1]=structuredClone(session.state);}const run={seed,config,states,hits,lastTick:states.length-1,result:states.at(-1).result};cache.set(seed,run);return run;}
const results=[];
if(!browserOnly){
 const catalog=json('replays/index.json');assert.equal(catalog.board,'dark');
 for(const record of catalog.runs){const expected=truth(record.seed),actual=candidate.makeRun(baseline,record.seed);assert.deepEqual(actual.states,expected.states);assert.deepEqual(actual.hits,expected.hits);assert.deepEqual(actual.config,expected.config);assert.equal(actual.lastTick,record.lastTick);assert.deepEqual(actual.result,record.result);results.push({seed:record.seed,lastTick:expected.lastTick,result:expected.result,ticksCompared:expected.states.length,traceSha256:sha(stable(expected.states))});}
 for(const record of [...catalog.runs,...catalog.frames]){const cp=json(record.path),expected=truth(cp.seed);assert.equal(cp.boardId,'dark');assert.deepEqual(cp.state,expected.states[cp.tick]);assert.deepEqual(cp.config,expected.config);assert.equal(candidate.importCheckpoint(cp,baseline,build).tick,cp.tick);}
 const cp=candidate.checkpoint(candidate.makeRun(baseline,0),365,build);assert.throws(()=>candidate.importCheckpoint({...cp,boardId:'water'},baseline,build));assert.throws(()=>candidate.importCheckpoint({...cp,boardId:undefined},baseline,build));const bad=structuredClone(cp);bad.state.rngU32^=1;assert.throws(()=>candidate.importCheckpoint(bad,baseline,build));
 fs.writeFileSync(path.join(out,'catalog-oracle-verification.json'),JSON.stringify({candidate:'dark-full-method-03',manifestHash,utc:new Date().toISOString(),runs:results,savedCheckpoints:catalog.runs.length+catalog.frames.length,wrongBoardAndTamperedRngRejected:true},null,2)+'\n');
 console.log(JSON.stringify({catalogNativeOracle:results,savedCheckpoints:catalog.runs.length+catalog.frames.length,negativeBoardChecks:true},null,2));
}else{
 const samples=[];const ordinarySeeds=new Set();const named=new Map();
 for(const name of fs.readdirSync(path.join(out,'browser')).filter(f=>f.endsWith('.json')).sort()){
  const row=JSON.parse(fs.readFileSync(path.join(out,'browser',name)));const cp=row.checkpoint??(row.schema==='r4d-p3-checkpoint-v1'?row:null);if(!cp)continue;
  const expected=truth(cp.seed);assert.equal(cp.boardId,'dark',name);assert.deepEqual(cp.config,expected.config,name);assert.deepEqual(cp.state,expected.states[cp.tick],name);assert.equal(cp.coreCommit,build.coreCommit);assert.equal(cp.p1Commit,p1);assert.equal(cp.configSha256,build.configSha256);assert.equal(cp.projectionSha256,build.projectionSha256);assert.equal(candidate.importCheckpoint(cp,baseline,build).tick,cp.tick);
  if(row.runInfo)assert.deepEqual(row.runInfo,{seed:expected.seed,lastTick:expected.lastTick,result:expected.result,hits:expected.hits},name+' browser runInfo');
  named.set(name,row);if(name.startsWith('ordinary-'))ordinarySeeds.add(cp.seed);samples.push({file:name,seed:cp.seed,tick:cp.tick,stateSha256:sha(stable(cp.state)),result:cp.state.result??null,controls:row.controls});
 }
 for(const seed of ordinarySeeds){const expected=truth(seed),actual=candidate.makeRun(baseline,seed);assert.deepEqual(actual.states,expected.states);assert.deepEqual(actual.hits,expected.hits);results.push({seed,lastTick:expected.lastTick,result:expected.result,ticksCompared:expected.states.length,traceSha256:sha(stable(expected.states))});}
 assert.equal(ordinarySeeds.size,3);assert.equal(new Set(results.map(r=>r.traceSha256)).size,3);
 const row=name=>{assert.ok(named.has(name+'.json'),name);return named.get(name+'.json');};const cp=name=>row(name).checkpoint;
 for(let i=1;i<=3;i++){const a=cp('ordinary-0'+i+'-terminal');assert.equal(a.tick,truth(a.seed).lastTick);}
 assert.equal(cp('ordinary-03-plus1').tick,cp('ordinary-03-paused').tick+1);assert.equal(cp('ordinary-03-plus10').tick,cp('ordinary-03-plus1').tick+10);
 const point=cp('ordinary-03-plus10');for(const name of ['controls-art-off-geometry-off','controls-art-off-geometry-on','controls-art-on-geometry-on','controls-flat-floor-200-before-pan','controls-flat-floor-200-after-pan','imported-own-dark'])assert.deepEqual(cp(name),point,name);
 for(const [name,art,geometry]of [['ordinary-03-plus10',true,false],['controls-art-off-geometry-off',false,false],['controls-art-off-geometry-on',false,true],['controls-art-on-geometry-on',true,true]])assert.deepEqual(row(name).controls,{art,geometry,view:'source',framing:'whole',zoom:'1'},name+' controls');
 assert.deepEqual(row('controls-flat-floor-200-after-pan').controls,{art:true,geometry:false,view:'flat',framing:'floor',zoom:'2'});
 assert.deepEqual(cp('receiver01-t888-pan-immediate'),cp('receiver01-t888-terminal'));for(const t of [860,880,887,888])assert.deepEqual(cp('receiver01-visible-t'+t),cp('receiver01-visible-t'+t+'-before-display'));
 assert.deepEqual(named.get('exported-dark.json'),point);assert.equal(cp('import-next1').tick,point.tick+1);assert.deepEqual(cp('negative-board-rejected'),cp('import-next1'));
 assert.deepEqual(cp('ordinary-03-replay-terminal'),cp('ordinary-03-terminal'));assert.equal(cp('seek-home-third').tick,0);assert.deepEqual(cp('seek-end-third'),cp('ordinary-03-terminal'));assert.equal(cp('seek-back-third').tick,87);
 const uiChecks={firstThreeOrdinaryNoDiscard:true,pausePlus1Plus10:true,fullCheckpointInvariantAcrossFourArtGeometryAndFlatFloorZoomPan:true,visibleReceiverPanFullCheckpointUnchanged:true,actualDownloadFreshReloadImport:true,importNextTickNative:true,boardOnlyNegativeNoStateMutation:true,replaySameTerminal:true,seekHomeEndAndBack:true,browserRunInfoIncludingCompleteHitsMatchesOracle:true};
 fs.writeFileSync(path.join(out,'browser-oracle-verification.json'),JSON.stringify({candidate:'dark-full-method-03',manifestHash,utc:new Date().toISOString(),ordinary:results,uiChecks,samples},null,2)+'\n');
 console.log(JSON.stringify({ordinary:results,browserSamples:samples.length},null,2));
}
