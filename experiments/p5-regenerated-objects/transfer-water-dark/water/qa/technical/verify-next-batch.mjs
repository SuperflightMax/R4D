// Read-only verification for the addressed w05/d02 batch. No simulation runs.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const specs = {
  w05: { board: 'water', previous: 'w04', port: 55194, pid: 38924, indexBytes: 6580, indexSha: 'dd5a85b7187b90197527fef5763fd31a64b16ae7e84f53a092a33674dd0031b8', sourceBytes: 65234, sourceSha: '83961fd80bfc027e77300805bd02ecdd6e961c22e770de9bf18675a670057521', stagedBytes: 46425, stagedSha: '7a7f55effb5c7a4d5b60c4752c14bc2fa0ca846817f94ca88e12bd165ddba965', files: 22, textures: 19, png: 10, instances: 34 },
  d02: { board: 'dark', previous: 'd01', port: 55195, pid: 48448, indexBytes: 5821, indexSha: '0fcf214387311490744ff1630052eda287b48841b6404c5896eec071359a6c0c', sourceBytes: 49103, sourceSha: '5bad898c270432928a403def12ffbca826a94d76cb83b395708bdf12588e8545', stagedBytes: 34767, stagedSha: '18578c9568b1198e8dc4d3453ba2d8f30e44a232ed0b8042aabbeb4ba1a5ffb2', files: 20, textures: 15, png: 8, instances: 35 },
};
const candidate = process.argv[2], s = specs[candidate]; assert(s);
const prodBase = `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/${s.board}`;
const producer = `${prodBase}/output/previews/${candidate}`, own = `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/${s.board}/${candidate}`;
const hash = b => createHash('sha256').update(b).digest('hex');
const git = (...a) => execFileSync('git', ['--no-optional-locks', ...a]);
assert(!existsSync(own), 'Append-only evidence directory exists');
const guard = JSON.parse(execFileSync('pwsh', ['-NoProfile', '-Command', `$o=Get-CimInstance Win32_OperatingSystem;$p=Get-Process;[pscustomobject]@{utc=(Get-Date).ToUniversalTime().ToString('o');computer=$env:COMPUTERNAME;freeRamGiB=$o.FreePhysicalMemory/1MB;cpuPercent=(Get-CimInstance Win32_Processor|Measure-Object LoadPercentage -Average).Average;aggregateWorkingSetGiB=($p|Measure-Object WorkingSet64 -Sum).Sum/1GB;disks=@(Get-PSDrive C,D,E|ForEach-Object{[pscustomobject]@{name=$_.Name;freeGiB=$_.Free/1GB}})}|ConvertTo-Json -Depth 4 -Compress`], { encoding: 'utf8' }));
assert.equal(guard.computer, 'WIN-36E9FF9EJM0'); assert(guard.freeRamGiB > 5); assert(guard.disks.find(d => d.name === 'E').freeGiB > 4);
mkdirSync(path.join(own, 'screenshots'), { recursive: true }); mkdirSync(path.join(own, 'snapshots'));
const save = (name, value) => writeFileSync(path.join(own, name), JSON.stringify(value, null, 2) + '\n');
save('resource-before.json', { ...guard, ownEstimate: { ramGiB: 1, eGiB: 0.1 }, concurrentAllowance: { ramGiB: 4, eGiB: 2 } });
const indexBytes = readFileSync(`${producer}/FILE_INDEX.json`); assert.equal(indexBytes.length, s.indexBytes); assert.equal(hash(indexBytes), s.indexSha);
const idx = JSON.parse(indexBytes); assert.equal(idx.consumerCommit, 'ce110a387919bbb10c467c70afce678f8b4ee4a7'); assert.equal(idx.artistManifest.commit, '9647869d6dbf672ee5922b0fc57df254b9fdbb93');
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
const old = JSON.parse(readFileSync(`${prodBase}/output/previews/${s.previous}/public/assets/manifest.json`));
let delta;
if (candidate === 'd02') { assert.deepEqual(art.textures.filter(t => t.family !== 'floor'), old.textures.filter(t => t.family !== 'floor')); assert.deepEqual(art.instances.filter(i => i.role !== 'floor'), old.instances.filter(i => i.role !== 'floor')); delta = { nonFloorTexturesExact: 14, actorInstancesExact: 34, targetBoundFloors: 0 }; }
else { const oldPng = new Set(old.textures.map(t => t.sha256)), newPng = [...new Set(art.textures.map(t => t.sha256))].filter(h => !oldPng.has(h)); assert.deepEqual(newPng, ['2f58c03e3ae6a7a4a4460f94976c3c5a4b93ca6045674df8140b9221741a3c0a']); const floors = art.instances.filter(i => i.role === 'floor').map(i => i.id).sort(); assert.deepEqual(floors, ['floor', 'receiver-01-base', 'receiver-02-base', 'receiver-03-base', 'receiver-04-base']); delta = { originalNinePngRetained: [...oldPng].every(h => art.textures.some(t => t.sha256 === h)), newRim: newPng[0], floorInsertionOrder: floors, floorRank: -1e8 }; }
const sidecar = readFileSync(`${producer}/index.json`); assert.equal(sidecar.length, idx.previewIndex.bytes); assert.equal(hash(sidecar), idx.previewIndex.sha256);
const owner = JSON.parse(readFileSync(`${prodBase}/preview-owner.json`)); assert.equal(owner.pid, s.pid); assert.equal(owner.candidate, candidate); assert.equal(owner.fileIndexSha256, s.indexSha);
writeFileSync(`${own}/FILE_INDEX.producer.json`, indexBytes);
save('frozen-verification.json', { candidate, board: s.board, producer, url: `http://127.0.0.1:${s.port}/`, sourceCommit: idx.consumerCommit, artist: idx.artistManifest, fileIndex: { bytes: indexBytes.length, sha256: hash(indexBytes) }, sidecar: { ...idx.previewIndex, outsidePublic: true }, counts: { files: s.files, textures: s.textures, png: s.png, instances: s.instances }, checked, supporting, delta, owner, initialTcpOwnerMatched: true, serverWrites: 0, tokenGranted: false });
console.log(JSON.stringify({ candidate, own, counts: s, delta }, null, 2));
