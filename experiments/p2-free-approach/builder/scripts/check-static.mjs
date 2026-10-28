import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { sha256, pins, root as builderRoot, canonicalLF } from './pins.mjs';
import { scanBrowserText } from './scan-browser-text.mjs';

const i=process.argv.indexOf('--artifact');
if(i<0 || !process.argv[i+1]) throw new Error('--artifact is required');
const artifact=path.resolve(process.argv[i+1]);
const packageOnly=process.argv.includes('--package-only');
const manifest=JSON.parse(readFileSync(path.join(artifact,'BUILD_MANIFEST.json'),'utf8'));
const root=path.join(artifact,'bundle',manifest.route);
const list=(dir,prefix='')=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>{
  assert.ok(!entry.isSymbolicLink(),'Symlinks are not allowed in the browser package');
  return entry.isDirectory()?list(path.join(dir,entry.name),prefix+entry.name+'/'):[prefix+entry.name];
});
assert.deepEqual(list(root).sort(),manifest.files.map(f=>f.path));
for(const file of manifest.files){const bytes=readFileSync(path.join(root,file.path));assert.equal(bytes.length,file.bytes);assert.equal(sha256(bytes),file.sha256);if(/\.(?:js|mjs|json|html|css|txt)$/.test(file.path))assert.deepEqual(scanBrowserText(file.path,bytes).violations,[]);}
assert.equal(sha256(Buffer.from(JSON.stringify(manifest.files)+'\n')),manifest.treeSha256);
const read=relative=>readFileSync(path.join(root,relative),'utf8');
const config=JSON.parse(read('inputs/config.json'));
assert.equal(sha256(Buffer.from(read('inputs/config.json').replaceAll('\r\n','\n'))),pins.configSha256);
const accepted=JSON.parse(read('inputs/manifest.json'));
const art=JSON.parse(read('assets/manifest.json'));
assert.equal(art.mode,'art');assert.equal(art.ball.file,'ball-v2.png');assert.equal(art.occluders.length,4);
assert.deepEqual(art.ball.centerPx,[627,629.5]);assert.equal(art.ball.diameterPx,830.5);
for(const item of [art.ball,art.shadow]) assert.equal(sha256(readFileSync(path.join(root,'assets/files',item.file))),item.sha256);
assert.deepEqual(art.shadow.offsetNative,[-8,14]);assert.deepEqual(art.shadow.nativeRadii,[1.15,1.15]);
assert.equal(art.shadow.opacity,1);
assert.equal(accepted.source.url,'source/01-jungle.jpg');
assert.equal(sha256(readFileSync(path.join(root,accepted.source.url))),pins.sourceSha256);
assert.ok(!manifest.files.some(file=>file.path.endsWith('.mjs')),'Published modules must use supported .js extension');
for(const emission of manifest.moduleEmissions){
  const source=execFileSync('git',['show',`${manifest.sourceCommit}:experiments/p2-free-approach/builder/${emission.source}`],{cwd:builderRoot});
  assert.equal(sha256(canonicalLF(source)),emission.sourceCanonicalLfSha256);
  let expected=canonicalLF(source).toString('utf8');
  for(const [before,after] of emission.references){assert.equal(expected.split(before).length,2);expected=expected.replace(before,after);}
  assert.equal(canonicalLF(Buffer.from(read(emission.output))).toString('utf8'),expected,'Only declared module references may change');
}
const html=read('index.html'), main=read('src/main.js');
assert.ok(html.includes('"pixi.js":"./vendor/pixi.js"'));
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  assert.ok(match[1].startsWith('./'));assert.ok(manifest.files.some(f=>f.path===match[1].slice(2)));
}
assert.ok(main.includes("from '../runtime/sim-core.js'"));
assert.ok(main.includes("from './controller.js'"));
assert.ok(main.includes("from './playback-clock.js'"));
assert.ok(manifest.moduleEmissions.some(item=>item.source==='src/playback-clock.mjs'&&item.output==='src/playback-clock.js'));
assert.ok(main.includes("from '../inputs/view-math.js'"));
assert.ok(main.includes("new URL('../', import.meta.url)"));
assert.ok(!/\/api\/checkpoint|method\s*:\s*['"]POST['"]/.test(main));
assert.ok(main.includes('link.download = filename'));
for(const ref of ['inputs/config.json','inputs/manifest.json','metadata.json','assets/manifest.json','source/01-jungle.jpg']){
  assert.ok(main.includes(`resource('${ref}')`));assert.ok(manifest.files.some(f=>f.path===ref));
}
const runs=[];
if(!packageOnly) {
const core=await import(pathToFileURL(path.join(root,'runtime/sim-core.js')).href);
const {Controller}=await import(pathToFileURL(path.join(root,'src/controller.js')).href);
const expected={1:{ticks:1735,path:'76dbe2227e8e7ed57842e8141b43be37ce728e6160fee11d5ca80a10ef89b376'},2:{ticks:1290,path:'930c1e942212ff8cb2227d88469ff0ba8dc31ea8bc94a137c5e15a5f0a2e9123'}};
for(const seed of [1,2]){
  const sim=new Controller(core,config,{},seed);sim.advance(sim.maxTicks);
  const first=sim.snapshot();
  assert.equal(first.tick,expected[seed].ticks);assert.equal(first.result.kind,'LOST');
  assert.equal(sha256(Buffer.from(JSON.stringify(sim.frames))),expected[seed].path,'Compiled runtime must preserve exact accepted native trajectory');
  const frame95=structuredClone(sim.frames[95]);sim.seek(95);assert.deepEqual(sim.snapshot(),frame95);
  assert.ok(sim.contacts.some(c=>c.objectId==='leaf-01'&&c.observedAtTick===95));
  sim.advance(1);assert.equal(sim.state.tick,96);
  runs.push({seed,ticks:first.tick,result:first.result,trajectorySha256:expected[seed].path,exactReplayContactTick:95});
}
}
const report={schema:'r4d.p2.static-check.v1',scope:packageOnly?'package-only; core/controller never imported or executed':'static-data and compiled-core artifact checks',sourceCommit:manifest.sourceCommit,candidate:manifest.candidate,treeSha256:manifest.treeSha256,checks:['Exact file set and all bytes/SHA256','Actual artifact privacy scan including every emitted .js; pinned SDK exact-span exception only','Declared source→.js module emission receipts; only explicit references changed','Relative HTML/import/resource references under route','No required POST API; replay download source present','Jungle v2 exact PNG/config and four-object data',...(packageOnly?[]:['Compiled real sim-core trajectories match earlier pinned native baseline','Exact contact replay and one physical tick'])],runs,physicsExecuted:!packageOnly,mimePrediction:manifest.mime,browserExecuted:false,visualPass:false,independentQA:false,limitations:['Download DOM interaction and Pixi rendering not executed','Existing mapping predicts JS MIME; real HTTP200 not observed','New independent TQA/VQA required on these bytes; previous PASS not carried forward',...(packageOnly?['Existing physics/oracle results are attributed baseline only; no new trajectory/control/clock execution']:[])]};
const ri=process.argv.indexOf('--report');
const reportPath=ri>=0?path.resolve(process.argv[ri+1]):path.join(artifact,packageOnly?'PACKAGE_STATIC_CHECK.json':'STATIC_CHECK.json');
if(ri>=0 && !reportPath.replaceAll('\\','/').toLowerCase().startsWith('e:/r4d/perspective/p2-runtime/')) throw new Error('Report must stay in E runtime');
writeFileSync(reportPath,JSON.stringify(report,null,2)+'\n',{flag:packageOnly?'wx':'w'});
console.log(JSON.stringify({pass:true,scope:report.scope,candidate:manifest.candidate,treeSha256:manifest.treeSha256,physicsExecuted:!packageOnly,browserExecuted:false,visualPass:false,runs:runs.map(r=>({seed:r.seed,ticks:r.ticks,result:r.result.kind}))}));
