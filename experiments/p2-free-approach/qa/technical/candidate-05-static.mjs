// Independent bounded C05 package/code regression. No product module is imported.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, lstatSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const root = process.cwd(), prefix = 'experiments/p2-free-approach/builder/';
const sourceRef = '0367d46211ed170c8840cf702b5ea1cc05f6e430';
const parentRef = '2cf9b6521cb2485a91ace37b44925b2a11fdc7b2';
const baselineRef = '08f9b9eaa6aa1063eb7fcd9cf373ddacf907725a';
const runtime = 'E:/R4D/perspective/p2-runtime/output';
const output = path.resolve(runtime, 'technical-qa/candidate-05-static-01');
const sha = data => createHash('sha256').update(data).digest('hex');
const lf = data => Buffer.from(data.toString('utf8').replaceAll('\r\n', '\n'));
const git = (...args) => execFileSync('git', args, { cwd:root, maxBuffer:8*1024*1024 });
const source = (ref, relative) => git('show', `${ref}:${prefix}${relative}`);
const text = (ref, relative) => lf(source(ref, relative)).toString('utf8');
assert.equal(root.replaceAll('\\','/').toLowerCase(), 'e:/r4d/perspective/p2-worktrees/technical-qa');
assert.equal(git('rev-parse', `${sourceRef}^`).toString().trim(), parentRef);
const newSourceFiles = ['scripts/build-static.mjs','scripts/check-static.mjs','scripts/check-ui-layout.mjs','src/main.mjs'];
assert.deepEqual(git('diff','--name-only',parentRef,sourceRef).toString().trim().split('\n').sort(), newSourceFiles.map(p=>prefix+p).sort());
const allowed = ['assets/files/ball-v2.png','assets/files/shadow-native-disc-v1.png','assets/manifest.json','index.html','inputs/config.json','inputs/manifest.json','inputs/view-math.js','metadata.json','runtime/sim-core.js','source/01-jungle.jpg','src/controller.js','src/main.js','src/playback-clock.js','style.css','vendor/PIXI-LICENSE.txt','vendor/pixi.js'].sort();
function listing(dir, rel='') {
  assert.ok(!lstatSync(dir).isSymbolicLink());
  return readdirSync(dir,{withFileTypes:true}).flatMap(e=>{
    assert.ok(!e.isSymbolicLink(), `symlink ${rel}${e.name}`);
    if(e.isDirectory()) return listing(path.join(dir,e.name),rel+e.name+'/');
    assert.ok(e.isFile(), `special file ${rel}${e.name}`); return [rel+e.name];
  }).sort();
}
function artifact(candidate, manifestHash, expectedTree, expectedBytes) {
  const dir=path.join(runtime,candidate), raw=readFileSync(path.join(dir,'BUILD_MANIFEST.json'));
  assert.equal(sha(raw),manifestHash); const manifest=JSON.parse(raw);
  assert.equal(manifest.route,'/review/r4d/p2-free-approach/');
  const bundle=path.join(dir,'bundle'), browser=path.join(bundle,'review/r4d/p2-free-approach');
  assert.deepEqual(listing(bundle),allowed.map(p=>'review/r4d/p2-free-approach/'+p));
  const files=allowed.map(p=>{const bytes=readFileSync(path.join(browser,p));return {path:p,bytes:bytes.length,sha256:sha(bytes),kind:p==='runtime/sim-core.js'?'authorized-private-compiled-runtime':'public-scene-or-asset'};});
  assert.deepEqual(files,manifest.files); assert.equal(sha(JSON.stringify(files)+'\n'),expectedTree);
  assert.equal(manifest.treeSha256,expectedTree); assert.equal(manifest.fileCount,16);
  assert.equal(files.reduce((sum,f)=>sum+f.bytes,0),expectedBytes); assert.equal(manifest.totalBytes,expectedBytes);
  return {dir,browser,raw,manifest,files,read:p=>readFileSync(path.join(browser,p))};
}
const c04=artifact('p2-jungle-static-candidate-04','60f79d1bdad8d3737376952043013394bb3098de6b15200fc5c352dd875dd1f7','60d216a64c86fed4b83f4ed3802e3d1393cdda2db8776818d22710173dc2ffed',2452021);
const c05=artifact('p2-jungle-static-candidate-05','aa40eea4d51100e157b0bdf32623e874a39777c52be2c801c3dce20285fc4b1b','19afaab7ef62e88948419b2fdc38210395ed64acba7aa024d4dc6619d7f6bdec',2453059);
assert.equal(c05.raw.length,9013); assert.equal(c05.manifest.sourceCommit,sourceRef); assert.equal(c04.manifest.sourceCommit,baselineRef);
const changed=allowed.filter(p=>!c05.read(p).equals(c04.read(p))), unchanged=allowed.filter(p=>!changed.includes(p));
assert.deepEqual(changed,['assets/manifest.json','metadata.json','src/main.js']); assert.equal(unchanged.length,13);
function differing(a,b,prefix='') {
  if(JSON.stringify(a)===JSON.stringify(b)) return [];
  if(a&&b&&typeof a==='object'&&typeof b==='object') return [...new Set([...Object.keys(a),...Object.keys(b)])].flatMap(k=>differing(a[k],b[k],prefix?prefix+'.'+k:k));
  return [prefix];
}
const oldArt=JSON.parse(c04.read('assets/manifest.json')), art=JSON.parse(c05.read('assets/manifest.json'));
const oldMeta=JSON.parse(c04.read('metadata.json')), meta=JSON.parse(c05.read('metadata.json'));
const artDiff=differing(oldArt,art).sort(), metaDiff=differing(oldMeta,meta).sort();
assert.deepEqual(artDiff,['provenance.candidate','provenance.consumerGitBlob']);
assert.deepEqual(metaDiff,['candidate','sourceCommit']);
assert.equal(meta.candidate,'p2-jungle-static-candidate-05'); assert.equal(art.provenance.candidate,meta.candidate);
assert.equal(meta.sourceCommit,sourceRef); assert.equal(art.provenance.consumerGitBlob,git('rev-parse',`${sourceRef}:${prefix}src/main.mjs`).toString().trim());
assert.deepEqual(c05.manifest.sourceInputs,c04.manifest.sourceInputs);
assert.equal(c05.manifest.core.sourceTree,'008d16a80a26bb77d562a45218b01da09b0d9ff0');
for(const k of ['commit','sourceTree','compiledSha256','emittedPath','sourceOrMapsIncluded']) assert.deepEqual(c05.manifest.core[k],c04.manifest.core[k]);
assert.deepEqual(c05.manifest.core.reusedFrom,{candidate:c04.manifest.candidate,sourceCommit:baselineRef,manifestSha256:sha(c04.raw),rebundled:false});
assert.equal(sha(c05.read('runtime/sim-core.js')),'dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7');
assert.deepEqual(c05.manifest.dependencies,c04.manifest.dependencies);
const emissions=c05.manifest.moduleEmissions.map(e=>{
  const raw=source(sourceRef,e.source); assert.equal(sha(lf(raw)),e.sourceCanonicalLfSha256);
  assert.equal(git('rev-parse',`${sourceRef}:${prefix}${e.source}`).toString().trim(),e.sourceGitBlob);
  let expected=lf(raw).toString('utf8');
  for(const [before,after] of e.references) {assert.equal(expected.split(before).length,2);expected=expected.replace(before,after);}
  assert.equal(lf(c05.read(e.output)).toString('utf8'),expected);
  return {source:e.source,output:e.output,sourceBlob:e.sourceGitBlob,sourceSha256:sha(lf(raw)),emittedSha256:sha(c05.read(e.output)),references:e.references};
});
assert.deepEqual(emissions.map(e=>e.output),['index.html','src/main.js','src/controller.js','src/playback-clock.js','inputs/view-math.js']);
const sourceNames=ref=>git('ls-tree','-r','--name-only',ref,'--',prefix).toString().trim().split('\n').map(p=>p.slice(prefix.length));
const protectedName=p=>['index.html','style.css','package.json'].includes(p)||/^(src\/(?!main\.mjs)|inputs\/|source-packets\/)/.test(p);
const protectedNames=sourceNames(baselineRef).filter(protectedName);
assert.deepEqual(sourceNames(sourceRef).filter(protectedName),protectedNames);
const protectedSources=protectedNames.map(p=>{const a=source(baselineRef,p),b=source(sourceRef,p);assert.ok(a.equals(b),p);return {path:p,gitBlob:git('rev-parse',`${sourceRef}:${prefix}${p}`).toString().trim(),sha256:sha(b)};});
const scannerBytes=source(sourceRef,'scripts/scan-browser-text.mjs');
assert.ok(scannerBytes.equals(source(baselineRef,'scripts/scan-browser-text.mjs')));
// Execute the unchanged pure text scanner only; no checker or product module.
const scanner=await import('data:text/javascript;base64,'+scannerBytes.toString('base64'));
const privacy=allowed.filter(p=>/\.(js|json|html|css|txt)$/.test(p)).map(p=>({path:p,...scanner.scanBrowserText(p,c05.read(p))}));
assert.deepEqual(privacy,c05.manifest.privacyScan.files); assert.equal(privacy.length,13);
assert.ok(privacy.every(x=>x.violations.length===0));
assert.deepEqual(privacy.filter(x=>x.exceptions.length),[{path:'vendor/pixi.js',violations:[],exceptions:[{kind:'pinned-pixi-uri-regex',start:135846,end:135849}]}]);
for(const probe of ['E:/example-private/core.ts','file:///E:/example-private/core.ts','packages/sim-core/src/Test.ts','//# sourceMappingURL=private.map']) assert.ok(scanner.scanBrowserText('src/probe.js',Buffer.from(probe)).violations.length);
assert.equal(scanner.scanBrowserText('src/probe.js',Buffer.from('https://example.invalid/docs')).violations.length,0);
assert.equal(scanner.scanBrowserText('vendor/pixi.js',Buffer.concat([c05.read('vendor/pixi.js'),Buffer.from('\n')])).exceptions.length,0);
const current=text(sourceRef,'src/main.mjs'), old=text(baselineRef,'src/main.mjs');
function fn(s,name,indent='  ') {
  const marker=indent+'function '+name+'(',begin=s.indexOf(marker); assert.ok(begin>=0,name);
  const lineEnd=s.indexOf('\n',begin), first=s.slice(begin,lineEnd);
  if(first.endsWith('}')) return first.slice(indent.length);
  const end=s.indexOf('\n'+indent+'}',lineEnd); assert.ok(end>begin,name);
  return s.slice(begin+indent.length,end+indent.length+2);
}
const equalFunctions=['circlePath','presentation','record','start','step','seek','setPlaybackRate'];
for(const name of equalFunctions) assert.equal(fn(current,name),fn(old,name),name);
assert.equal(fn(current,'render').replace('    syncCompletionHint(sim.state.done);\n',''),fn(old,'render'));
assert.equal(fn(current,'save').replace("setSaveStatus(`JSON передан браузеру для скачивания: ${filename}`, 'download');","$('save-status').textContent = `JSON передан браузеру для скачивания: ${filename}`;"),fn(old,'save'));
const fitCode=fn(current,'fit'); assert.ok(!/sim\.|clock\.|record\(/.test(fitCode));
assert.match(current,/new ResizeObserver\(fit\)\.observe\(stage\)/);
assert.ok(current.includes("$('zoom').onchange = fit;"));
assert.ok(current.includes("setZoom: value => { $('zoom').value = String(value); fit(); }"));
assert.ok(current.indexOf('const occluders = []')<current.indexOf('  fit();'));
assert.ok(current.indexOf('const clock =')<current.indexOf('  fit();'));
assert.ok(current.indexOf('let knownContacts')<current.indexOf('  fit();'));
const config=JSON.parse(c05.read('inputs/config.json')); assert.equal(config.board.ball.r,16); assert.equal(config.defaults.tickMs,5);
const html=c05.read('index.html').toString('utf8'); assert.ok(html.includes('<option value="0.25" selected>'));
assert.ok(current.includes("new PlaybackClock(config.defaults.tickMs, Number($('playback-rate').value))"));
const checker=text(sourceRef,'scripts/check-static.mjs');
const guard=checker.indexOf('if(!packageOnly) {'), coreImport=checker.indexOf("const core=await import("), report=checker.indexOf('const report=');
assert.ok(guard>0&&guard<coreImport&&coreImport<report);
assert.ok(checker.includes("const packageOnly=process.argv.includes('--package-only')"));
assert.ok(checker.includes("{flag:packageOnly?'wx':'w'}"));

// One isolated fit/status model. It never imports or evaluates main/render/core.
function fitModel(code,w=1118,h=554,zoom=2) {
  const canvas={width:w,height:h}, resizes=[], samples=[]; let draws=0;
  const physical=Object.freeze({tick:95,rngU32:1586005467,done:false});
  const forbidden=new Proxy({}, {get(){throw new Error('Unexpected physical/clock access in fit');}});
  const select={value:String(zoom)};
  // Classic15px gutters affect only clients; propagate the two cross-axis tests.
  const clients=()=>{let v=canvas.height>h, q=canvas.width>w;if(v&&canvas.width>w-15)q=true;if(q&&canvas.height>h-15)v=true;return [w-(v?15:0),h-(q?15:0)];};
  const stage={getBoundingClientRect:()=>({width:w+2,height:h+2}),get clientWidth(){return clients()[0];},get clientHeight(){return clients()[1];}};
  const scene={scale:{set(v){assert.ok(Number.isFinite(v));}},position:{set(x,y){assert.ok(Number.isFinite(x)&&Number.isFinite(y));}}};
  const context=vm.createContext({stage,$:()=>select,getComputedStyle:()=>({borderLeftWidth:'1px',borderRightWidth:'1px',borderTopWidth:'1px',borderBottomWidth:'1px'}),scene,sim:forbidden,clock:forbidden,app:{canvas,renderer:{resize(x,y){assert.ok(Number.isInteger(x)&&Number.isInteger(y)&&x>0&&y>0);canvas.width=x;canvas.height=y;resizes.push([x,y]);}}},render(){draws++;assert.deepEqual(physical,{tick:95,rngU32:1586005467,done:false});}});
  const action=new vm.Script('('+code+')').runInContext(context,{timeout:1000});
  return {resizes,samples,call(){action();samples.push({buffer:[canvas.width,canvas.height],draws,resizes:resizes.length});},zoom(v){select.value=String(v);},resize(x,y){w=x;h=y;}};
}
const negative=fitModel(fn(old,'fit'));for(let n=0;n<6;n++)negative.call();
assert.deepEqual(negative.resizes.slice(1,5),[[1103,1078],[1108,1108],[1103,1078],[1108,1108]]);
const stable=fitModel(fitCode);for(let n=0;n<8;n++)stable.call();assert.deepEqual(stable.resizes,[[1118,1108]]);assert.equal(stable.samples.at(-1).draws,8);
const fixtures=[];
for(const [w,h,cases] of [[1118,554,[[1,[1118,554]],[1.5,[1118,831]],[2,[1118,1108]],[1,[1118,554]]]],[341,650,[[1,[341,650]],[1.5,[512,650]],[2,[682,682]]]]]) {
  const model=fitModel(fitCode,w,h,1);
  for(const [zoom,expected] of cases){model.zoom(zoom);model.call();const count=model.resizes.length;for(let n=0;n<3;n++)model.call();assert.deepEqual(model.samples.at(-1).buffer,expected);assert.equal(model.resizes.length,count);}
  fixtures.push({externalBox:[w,h],cases,samples:model.samples,resizes:model.resizes});
}
const external=fitModel(fitCode);external.call();external.resize(900,500);external.call();for(let n=0;n<3;n++)external.call();assert.deepEqual(external.resizes,[[1118,1108],[1000,1000]]);
const initial='Initial replay help', label={textContent:initial,classList:{error:false,toggle(name,value){assert.equal(name,'error');this.error=value;}}};
const statusContext=vm.createContext({$:()=>label});
new vm.Script(current.slice(current.indexOf('const initialSaveStatus'),current.indexOf('async function main()'))).runInContext(statusContext,{timeout:1000});
const statusTrace=[], statusCall=(code,expected,error=false)=>{new vm.Script(code).runInContext(statusContext,{timeout:1000});assert.equal(label.textContent,expected);assert.equal(label.classList.error,error);statusTrace.push({code,message:label.textContent,error:label.classList.error});};
const completion='Запуск завершён. «Сохранить повтор» скачивает JSON всех наблюдавшихся запусков.';
for(const reason of ['seek','start/reset']){statusCall('syncCompletionHint(true)',completion);statusCall('syncCompletionHint(false)',initial);statusTrace.at(-1).modeledNonterminalReason=reason;}
statusCall('syncCompletionHint(true)',completion);
statusCall("setSaveStatus('Download receipt', 'download')",'Download receipt');
for(const done of [false,true,false]) statusCall(`syncCompletionHint(${done})`,'Download receipt');
statusCall("setSaveStatus('Real error', 'error')",'Real error',true);
for(const done of [false,true,false]) statusCall(`syncCompletionHint(${done})`,'Real error',true);
// Verify source/artifact inputs remained byte-exact after all reads/model calls.
for(const artifact of [c04,c05]){assert.equal(sha(readFileSync(path.join(artifact.dir,'BUILD_MANIFEST.json'))),sha(artifact.raw));for(const record of artifact.files)assert.equal(sha(artifact.read(record.path)),record.sha256);}
const evidence={schema:'r4d.p2.candidate05.independent-static.v1',recordedAtUtc:new Date().toISOString(),turnId:JSON.parse(readFileSync(path.join(output,'INITIAL_CHECKPOINT.json'))).turnId,sourceRef,parentRef,baselineRef,
  scope:'Independent package/source checks plus one bounded extracted fit/status VM model; no product imports/execution',
  sources:newSourceFiles.map(p=>({path:prefix+p,gitBlob:git('rev-parse',`${sourceRef}:${prefix}${p}`).toString().trim(),sha256:sha(source(sourceRef,p))})),
  artifacts:[c04,c05].map(a=>({candidate:a.manifest.candidate,sourceCommit:a.manifest.sourceCommit,manifestBytes:a.raw.length,manifestSha256:sha(a.raw),treeSha256:a.manifest.treeSha256,totalBytes:a.manifest.totalBytes,files:a.files})),
  changed,unchanged,artDiff,metaDiff,emissions,protectedSources,configPins:{radius:config.board.ball.r,tickMs:config.defaults.tickMs,rng:config.rng,sourceInputs:c05.manifest.sourceInputs,core:c05.manifest.core},
  privacy:{scannerSha256:sha(scannerBytes),scannerUnchangedFrom04:true,negativeControls:4,httpsControl:true,mutatedSdkExceptionRejected:true,files:privacy},
  codeInvariants:{equalFunctions,sceneDrawingEqualExceptStatusSync:true,saveEqualExceptStatusOwner:true,default025Unchanged:true,fitObserverUiQaUnified:true,fitNoPhysicalClockOrRecordAccess:true,initDependenciesDeclaredBeforeFirstFit:true,packageOnlyGuardReadNotExecuted:true},
  model:{negativeControl:{baselineRef,resizes:negative.resizes,claim:'Scrollbar-model alternating buffers, not actual black-frame cause'},stable:{resizes:stable.resizes,samples:stable.samples},fixtures,externalResize:{resizes:external.resizes,samples:external.samples},statusTrace},
  browserExecuted:false,productCoreControllerClockPixiImported:false,physicsExecuted:false,nativeExecuted:false,gpuExecuted:false,downloadOrVisibilityApiCalled:false,buildExecuted:false,serverWrites:0,black200ActualFixVerified:false,fullTechnicalPass:false,artPass:false,p2Closure:false,
  limitations:['VM uses a synthetic15px scrollbar container and a render stub, not DOM/ResizeObserver scheduling/Pixi/GPU.','No physical seed/tick/PRNG/clock or live paused-state execution; unchanged hashes are code/artifact protection only.','C04 black200 raw observation remains valid; scrollbar feedback cause and C05 actual black200 fix remain unverified.','No actual PUBLIC05, download, visibility suspension, native/Android, fine occlusion/shadow or Art acceptance.'],
  resources:JSON.parse(readFileSync(path.join(output,'RESOURCE_EXECUTION.json'))),frozenRehashedUnchanged:true,runnerSha256:sha(readFileSync(new URL(import.meta.url)))};
const evidencePath=path.join(output,'EVIDENCE.json');writeFileSync(evidencePath,JSON.stringify(evidence,null,2)+'\n',{flag:'wx'});
console.log(JSON.stringify({scope:evidence.scope,sourceRef,manifestSha256:sha(c05.raw),treeSha256:c05.manifest.treeSha256,files:16,bytes:2453059,changed,unchanged:unchanged.length,protectedSources:protectedSources.length,emissions:emissions.length,privacyTextFiles:privacy.length,modelFitCases:fixtures.reduce((sum,x)=>sum+x.cases.length,0),statusTransitions:statusTrace.length,frozenRehashedUnchanged:true,physicsExecuted:false,browserExecuted:false,evidencePath,evidenceSha256:sha(readFileSync(evidencePath))},null,2));
