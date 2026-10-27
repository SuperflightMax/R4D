import assert from 'node:assert/strict';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { sha256, pins } from './pins.mjs';

const i=process.argv.indexOf('--artifact');
if(i<0 || !process.argv[i+1]) throw new Error('--artifact is required');
const artifact=path.resolve(process.argv[i+1]);
const manifest=JSON.parse(readFileSync(path.join(artifact,'BUILD_MANIFEST.json'),'utf8'));
const root=path.join(artifact,'bundle',manifest.route);
const list=(dir,prefix='')=>readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?list(path.join(dir,entry.name),prefix+entry.name+'/'):[prefix+entry.name]);
assert.deepEqual(list(root).sort(),manifest.files.map(f=>f.path));
for(const file of manifest.files){const bytes=readFileSync(path.join(root,file.path));assert.equal(bytes.length,file.bytes);assert.equal(sha256(bytes),file.sha256);}
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
const html=read('index.html'), main=read('src/main.mjs');
assert.ok(html.includes('"pixi.js":"./vendor/pixi.mjs"'));
for(const match of html.matchAll(/(?:src|href)="([^"]+)"/g)){
  assert.ok(match[1].startsWith('./'));assert.ok(manifest.files.some(f=>f.path===match[1].slice(2)));
}
assert.ok(main.includes("from '../runtime/sim-core.mjs'"));
assert.ok(main.includes("new URL('../', import.meta.url)"));
assert.ok(!/\/api\/checkpoint|method\s*:\s*['"]POST['"]/.test(main));
assert.ok(main.includes('link.download = filename'));
for(const ref of ['inputs/config.json','inputs/manifest.json','metadata.json','assets/manifest.json','source/01-jungle.jpg']){
  assert.ok(main.includes(`resource('${ref}')`));assert.ok(manifest.files.some(f=>f.path===ref));
}
const core=await import(pathToFileURL(path.join(root,'runtime/sim-core.mjs')).href);
const {Controller}=await import(pathToFileURL(path.join(root,'src/controller.mjs')).href);
const expected={1:{ticks:1735,path:'76dbe2227e8e7ed57842e8141b43be37ce728e6160fee11d5ca80a10ef89b376'},2:{ticks:1290,path:'930c1e942212ff8cb2227d88469ff0ba8dc31ea8bc94a137c5e15a5f0a2e9123'}};
const runs=[];
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
const report={schema:'r4d.p2.static-check.v1',sourceCommit:manifest.sourceCommit,candidate:manifest.candidate,treeSha256:manifest.treeSha256,checks:['Exact file set and all bytes/SHA256','Relative HTML/import/resource references under route','No required POST API; replay download source present','Jungle v2 exact PNG/config and four-object data','Compiled real sim-core trajectories match earlier pinned native baseline','Exact contact replay and one physical tick'],runs,browserExecuted:false,visualPass:false,independentQA:false,limitations:['Download DOM interaction and Pixi rendering not executed','No existing authorized frozen-candidate preview route confirmed']};
writeFileSync(path.join(artifact,'STATIC_CHECK.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({pass:true,scope:'static-data and compiled-core artifact checks only',candidate:manifest.candidate,treeSha256:manifest.treeSha256,browserExecuted:false,visualPass:false,runs:runs.map(r=>({seed:r.seed,ticks:r.ticks,result:r.result.kind}))}));
