// Read-only verification for the frozen w06 expansion. No simulation runs.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const candidate='w06', s={board:'water',previous:'w05',port:55196,pid:33028,indexBytes:8432,indexSha:'9ba0caf153b7528d551cd6da9ed8b6ccb90ab2ad4e96aba558eeb6b5c0ef5108',sourceBytes:125833,sourceSha:'b533e4d2a2f6f2094fed132913fe9dadb9b6eaa370f5a447ff3afc627f7cda27',stagedBytes:103822,stagedSha:'44fa6b45ac8f513b9231e16eb2db0dbece54c9255d549b0d8a7d24ad99f39a0c',files:25,textures:22,png:13,instances:84};
const prodBase = `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/${s.board}`;
const producer = `${prodBase}/output/previews/${candidate}`, own = `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/${s.board}/${candidate}`;
const hash = b => createHash('sha256').update(b).digest('hex');
const git = (...a) => execFileSync('git', ['--no-optional-locks', ...a]);
const resume = process.argv.includes('--resume');
assert(resume ? existsSync(`${own}/resource-before.json`) && !existsSync(`${own}/frozen-verification.json`) : !existsSync(own), 'Only an unfinished owned verification can resume');
const guard = JSON.parse(execFileSync('pwsh', ['-NoProfile', '-Command', `$o=Get-CimInstance Win32_OperatingSystem;$p=Get-Process;[pscustomobject]@{utc=(Get-Date).ToUniversalTime().ToString('o');computer=$env:COMPUTERNAME;freeRamGiB=$o.FreePhysicalMemory/1MB;cpuPercent=(Get-CimInstance Win32_Processor|Measure-Object LoadPercentage -Average).Average;aggregateWorkingSetGiB=($p|Measure-Object WorkingSet64 -Sum).Sum/1GB;disks=@(Get-PSDrive C,D,E|ForEach-Object{[pscustomobject]@{name=$_.Name;freeGiB=$_.Free/1GB}})}|ConvertTo-Json -Depth 4 -Compress`], { encoding: 'utf8' }));
assert.equal(guard.computer, 'WIN-36E9FF9EJM0'); assert(guard.freeRamGiB > 5); assert(guard.disks.find(d => d.name === 'E').freeGiB > 4);
mkdirSync(path.join(own, 'screenshots'), { recursive: true }); mkdirSync(path.join(own, 'snapshots'), { recursive: true });
const save = (name, value) => writeFileSync(path.join(own, name), JSON.stringify(value, null, 2) + '\n');
save(resume ? 'resource-resume-before.json' : 'resource-before.json', { ...guard, ownEstimate: { ramGiB: 1, eGiB: 0.1 }, concurrentAllowance: { ramGiB: 4, eGiB: 2 } });
const indexBytes = readFileSync(`${producer}/FILE_INDEX.json`); assert.equal(indexBytes.length, s.indexBytes); assert.equal(hash(indexBytes), s.indexSha);
const idx = JSON.parse(indexBytes); assert.equal(idx.consumerCommit, 'b8a070ab60e97aee3f71018ff614c2cf21c8f10f'); assert.equal(idx.artistManifest.commit, '189fe2e7f4264270f60b4a2ebe247d0d49b3c72e');
const source = git('show', `${idx.artistManifest.commit}:${idx.artistManifest.path}`); assert.equal(source.length, s.sourceBytes); assert.equal(hash(source), s.sourceSha);
const sourceArt = JSON.parse(source), stagedBytes = readFileSync(`${idx.publicRoot}/assets/manifest.json`); assert.equal(stagedBytes.length, s.stagedBytes); assert.equal(hash(stagedBytes), s.stagedSha);
const art = JSON.parse(stagedBytes); assert.deepEqual(art.instances, sourceArt.instances);
for (const t of art.textures) { const a = sourceArt.textures.find(x => x.id === t.id); for (const k of ['sha256', 'groundAnchorPx', 'footprintPx']) assert.deepEqual(t[k], a[k]); }
assert.equal(art.textures.length, s.textures); assert.equal(new Set(art.textures.map(t => t.sha256)).size, s.png); assert.equal(art.instances.length, s.instances);
const supporting = idx.artistManifest.supporting.map(f => { const b = git('show', `${idx.artistManifest.commit}:${f.path}`); assert.equal(b.length, f.bytes); assert.equal(hash(b), f.sha256); writeFileSync(`${own}/${f.materialized}`, b); return f; });
const checked = [];
for (const f of idx.files) { const disk = readFileSync(`${idx.publicRoot}/${f.path}`); assert.equal(disk.length, f.bytes); assert.equal(hash(disk), f.sha256); const r = await fetch(`http://127.0.0.1:${s.port}/${f.path}`); assert.equal(r.status, 200); const b = Buffer.from(await r.arrayBuffer()); assert.equal(b.length, f.bytes); assert.equal(hash(b), f.sha256); checked.push({ ...f, diskAndHttpExact: true }); }
assert.equal(checked.length, s.files);
for (const [f, cached] of [['config', 'config'], ['p1-manifest', 'manifest']]) assert.deepEqual(JSON.parse(readFileSync(`${idx.publicRoot}/data/${f}.json`)), JSON.parse(readFileSync(`E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/${s.board}/input-oracle-001/common/${cached}.json`)));
const old=JSON.parse(readFileSync('E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w05/snapshots/s0-start-whole.json')).meta.manifest;
for(const i of old.instances) assert.deepEqual(art.instances.find(n=>n.id===i.id),i);
for(const t of old.textures) assert.deepEqual(art.textures.find(n=>n.id===t.id),t);
const oldFrozen=JSON.parse(readFileSync('E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w05/frozen-verification.json'));
for(const f of idx.files.filter(f=>(f.path.startsWith('data/')&&f.path!=='data/preview-input.json')||f.path==='app.js')) {const prior=oldFrozen.checked.find(p=>p.path===f.path);assert(prior);assert.equal(f.bytes,prior.bytes);assert.equal(f.sha256,prior.sha256);}
const foreground=art.instances.filter(i=>i.role==='foreground');assert.equal(foreground.length,11);for(const i of foreground){assert.equal(i.parentId,'floor');assert.equal(i.targetId,'$source');assert.equal(i.sourceClipPx.coordinateSpace,'source1536');}
const delta={oldInstancesExact:34,oldTexturesExact:19,newUniquePng:3,sourceClipCount:11,appAndNativeInputDataBytesIdenticalW05:true,previewInputMetadataChanged:true,sourceClipFrame:'source1536, uniform floor1536/1254'};
const sidecar = readFileSync(`${producer}/index.json`); assert.equal(sidecar.length, idx.previewIndex.bytes); assert.equal(hash(sidecar), idx.previewIndex.sha256);
const owner = JSON.parse(readFileSync(`${prodBase}/preview-owner.json`)); assert.equal(owner.pid, s.pid); assert.equal(owner.candidate, candidate); assert.equal(owner.fileIndexSha256, s.indexSha);
writeFileSync(`${own}/FILE_INDEX.producer.json`, indexBytes);
save('frozen-verification.json', { candidate, board: s.board, producer, url: `http://127.0.0.1:${s.port}/`, sourceCommit: idx.consumerCommit, artist: idx.artistManifest, fileIndex: { bytes: indexBytes.length, sha256: hash(indexBytes) }, sidecar: { ...idx.previewIndex, outsidePublic: true }, counts: { files: s.files, textures: s.textures, png: s.png, instances: s.instances }, checked, supporting, delta, owner, initialTcpOwnerMatched: true, serverWrites: 0, tokenGranted: false });
console.log(JSON.stringify({ candidate, own, counts: s, delta }, null, 2));
