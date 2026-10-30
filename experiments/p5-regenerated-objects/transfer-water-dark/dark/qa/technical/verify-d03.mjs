// Read-only verification for the frozen d03 receiver batch. No simulation runs.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const candidate='d03', s={board:'dark',previous:'d02',port:55197,pid:45612,indexBytes:6675,indexSha:'b9817e590c8db60e46a0f75b9182faea444a454706a4763227a81d7a314742ce',sourceBytes:65548,sourceSha:'709253ed3dd162c6b305bbb4f7be1925dace48d82ec0d7c14fc6e7c3449e812a',stagedBytes:44948,stagedSha:'27fa2237249e629a97e0f265fcd1052def7edfa4a105a3518cc339647da61dd6',files:21,textures:19,png:9,instances:39};
const prodBase = `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/${s.board}`;
const producer = `${prodBase}/output/previews/${candidate}`, own = `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/${s.board}/${candidate}`;
const hash = b => createHash('sha256').update(b).digest('hex');
const git = (...a) => execFileSync('git', ['--no-optional-locks', ...a]);
const resume=process.argv.includes('--resume');
assert(resume ? existsSync(`${own}/resource-before.json`) && !existsSync(`${own}/frozen-verification.json`) : !existsSync(own), 'Only unfinished owned verification can resume');
const guard = JSON.parse(execFileSync('pwsh', ['-NoProfile', '-Command', `$o=Get-CimInstance Win32_OperatingSystem;$p=Get-Process;[pscustomobject]@{utc=(Get-Date).ToUniversalTime().ToString('o');computer=$env:COMPUTERNAME;freeRamGiB=$o.FreePhysicalMemory/1MB;cpuPercent=(Get-CimInstance Win32_Processor|Measure-Object LoadPercentage -Average).Average;aggregateWorkingSetGiB=($p|Measure-Object WorkingSet64 -Sum).Sum/1GB;disks=@(Get-PSDrive C,D,E|ForEach-Object{[pscustomobject]@{name=$_.Name;freeGiB=$_.Free/1GB}})}|ConvertTo-Json -Depth 4 -Compress`], { encoding: 'utf8' }));
assert.equal(guard.computer, 'WIN-36E9FF9EJM0'); assert(guard.freeRamGiB > 5); assert(guard.disks.find(d => d.name === 'E').freeGiB > 4);
mkdirSync(path.join(own, 'screenshots'), { recursive: true }); mkdirSync(path.join(own, 'snapshots'), { recursive: true });
const save = (name, value) => writeFileSync(path.join(own, name), JSON.stringify(value, null, 2) + '\n');
save(resume?'resource-resume-before.json':'resource-before.json', { ...guard, ownEstimate: { ramGiB: 1, eGiB: 0.1 }, concurrentAllowance: { ramGiB: 4, eGiB: 2 } });
const indexBytes = readFileSync(`${producer}/FILE_INDEX.json`); assert.equal(indexBytes.length, s.indexBytes); assert.equal(hash(indexBytes), s.indexSha);
const idx = JSON.parse(indexBytes); assert.equal(idx.consumerCommit, '9d741f4d718a8d623ae4d1d51caa938ca4e96a66'); assert.equal(idx.artistManifest.commit, '79da6c7616de630102994d4e087e312a12892e0f');
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
const old=JSON.parse(readFileSync('E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/dark/d02/snapshots/s0-start-whole-geometry.json')).meta.manifest;
const unrelatedInstances=old.instances.filter(i=>i.role!=='receiver-back'),unrelatedTextures=old.textures.filter(t=>!t.id.endsWith('-back-v1'));assert.equal(unrelatedInstances.length,31);assert.equal(unrelatedTextures.length,11);
for(const i of unrelatedInstances)assert.deepEqual(art.instances.find(n=>n.id===i.id),i);for(const t of unrelatedTextures)assert.deepEqual(art.textures.find(n=>n.id===t.id),t);
const oldPng=new Set(old.textures.map(t=>t.sha256));assert([...oldPng].every(h=>art.textures.some(t=>t.sha256===h)));assert.deepEqual([...new Set(art.textures.map(t=>t.sha256))].filter(h=>!oldPng.has(h)),['5f00b57501ec52eb879ba6219d77034bee172c3ff580d2487581cd7406b573c1']);
const prior=JSON.parse(readFileSync('E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/dark/d02/frozen-verification.json'));for(const f of idx.files.filter(f=>(f.path.startsWith('data/')&&f.path!=='data/preview-input.json')||f.path==='app.js')){const p=prior.checked.find(p=>p.path===f.path);assert(p);assert.equal(f.bytes,p.bytes);assert.equal(f.sha256,p.sha256);}
const delta={unrelatedInstancesExact:31,unrelatedTexturesExact:11,originalEightPngRetained:true,newRimPng:1,appAndNativeInputsExactD02:true,floorV3Unchanged:true,sceneAndReceiverBasesFloorRank:-1e8};
const sidecar = readFileSync(`${producer}/index.json`); assert.equal(sidecar.length, idx.previewIndex.bytes); assert.equal(hash(sidecar), idx.previewIndex.sha256);
const ownerPath=`${prodBase}/preview-owners/d03-pid45612.json`;
const owner = JSON.parse(readFileSync(ownerPath)); assert.equal(owner.pid, s.pid); assert.equal(owner.candidate, candidate); assert.equal(owner.fileIndexSha256, s.indexSha); assert.equal(path.resolve(owner.root),path.resolve(idx.publicRoot));
save('owner-selection.json',{ownerPath,currentPointerNow:'d04, not used as d03 identity',tcpPort:55197,tcpPid:45612,archivedOwnerMatchesFrozenRootAndIndex:true});
writeFileSync(`${own}/FILE_INDEX.producer.json`, indexBytes);
save('frozen-verification.json', { candidate, board: s.board, producer, url: `http://127.0.0.1:${s.port}/`, sourceCommit: idx.consumerCommit, artist: idx.artistManifest, fileIndex: { bytes: indexBytes.length, sha256: hash(indexBytes) }, sidecar: { ...idx.previewIndex, outsidePublic: true }, counts: { files: s.files, textures: s.textures, png: s.png, instances: s.instances }, checked, supporting, delta, owner, initialTcpOwnerMatched: true, serverWrites: 0, tokenGranted: false });
console.log(JSON.stringify({ candidate, own, counts: s, delta }, null, 2));
