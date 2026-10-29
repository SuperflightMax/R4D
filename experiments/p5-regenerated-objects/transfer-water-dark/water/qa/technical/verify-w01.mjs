// Read-only frozen bytes + localhost delivery verification. No native reruns.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const producer = 'E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/output/previews/w01';
const own = 'E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w01';
assert(!existsSync(own), 'Append-only QA run already exists');
const sha = b => createHash('sha256').update(b).digest('hex');
const guard = JSON.parse(execFileSync('pwsh', ['-NoProfile', '-Command', `$o=Get-CimInstance Win32_OperatingSystem;$p=Get-Process;[pscustomobject]@{utc=(Get-Date).ToUniversalTime().ToString('o');computer=$env:COMPUTERNAME;freeRamGiB=$o.FreePhysicalMemory/1MB;cpuPercent=(Get-CimInstance Win32_Processor|Measure-Object LoadPercentage -Average).Average;aggregateWorkingSetGiB=($p|Measure-Object WorkingSet64 -Sum).Sum/1GB;disks=@(Get-PSDrive C,D,E|ForEach-Object{[pscustomobject]@{name=$_.Name;freeGiB=$_.Free/1GB}})}|ConvertTo-Json -Depth 4 -Compress`], { encoding: 'utf8' }));
assert.equal(guard.computer, 'WIN-36E9FF9EJM0'); assert(guard.freeRamGiB > 5); assert(guard.disks.find(d => d.name === 'E').freeGiB > 4);
mkdirSync(path.join(own, 'screenshots'), { recursive: true }); mkdirSync(path.join(own, 'snapshots'));
writeFileSync(path.join(own, 'resource-before.json'), JSON.stringify({ ...guard, ownEstimate: { ramGiB: 1, eGiB: 0.05 }, concurrentAllowance: { ramGiB: 4, eGiB: 2 } }, null, 2));
const indexBytes = readFileSync(path.join(producer, 'FILE_INDEX.json'));
assert.equal(indexBytes.length, 4851); assert.equal(sha(indexBytes), 'b65666c1c942d71763115f05744358ef45463f0fa528a4da0e9f0b8b3d912c4e');
const idx = JSON.parse(indexBytes); assert.equal(idx.consumerCommit, '41349b8d8ae61ceb69e288301af7c080e2b006b5');
const preview = readFileSync(path.join(producer, 'index.json')); assert.equal(preview.length, 12125); assert.equal(sha(preview), '6b30fdf4f76d665c8d9aeb2c9d9b6d9e0398da3caa2326fa462a8ca37e7d4ce1');
const artifactBytes = execFileSync('git', ['--no-optional-locks', 'show', '094301dda9a43e7b4970af9d9af20982a38fb221:experiments/p5-regenerated-objects/transfer-water-dark/water/asset-artist/asset-manifest.mini-01.json']);
assert.equal(artifactBytes.length, 13990); assert.equal(sha(artifactBytes), '7d551ff2eebfeef6f23674c140836f010ed16b6da11b42822af708f92c292981');
const checked = [];
for (const f of idx.files) {
  const disk = readFileSync(path.join(idx.publicRoot, f.path)); assert.equal(disk.length, f.bytes); assert.equal(sha(disk), f.sha256);
  const response = await fetch(new URL(f.path, 'http://localhost:55188/')); assert.equal(response.status, 200, f.path);
  const served = Buffer.from(await response.arrayBuffer()); assert.equal(served.length, f.bytes); assert.equal(sha(served), f.sha256);
  checked.push({ ...f, diskExact: true, httpStatus: response.status, servedExact: true });
}
const p1 = JSON.parse(readFileSync(path.join(idx.publicRoot, 'data/p1-manifest.json')));
const ownP1 = JSON.parse(readFileSync('E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/input-oracle-001/common/manifest.json'));
assert.deepEqual(p1, ownP1);
const a = JSON.parse(artifactBytes), staged = JSON.parse(readFileSync(path.join(idx.publicRoot, 'assets/manifest.json')));
assert.equal(staged.textures.length, 5); assert.equal(staged.instances.length, 7);
for (const t of staged.textures) { const source = a.textures.find(x => x.id === t.id); assert(source); assert.equal(t.sha256, source.sha256); assert.deepEqual(t.groundAnchorPx, source.groundAnchorPx); assert.deepEqual(t.footprintPx, source.footprintPx); }
const idxResponse = await fetch('http://localhost:55188/index.json');
const deliveredIndex = Buffer.from(await idxResponse.arrayBuffer());
const output = { createdUtc: new Date().toISOString(), producer, url: 'http://localhost:55188/', fileIndex: { bytes: indexBytes.length, sha256: sha(indexBytes) }, previewIndex: { physicalPath: path.join(producer, 'index.json'), bytes: preview.length, sha256: sha(preview), httpStatus: idxResponse.status, httpSha256: sha(deliveredIndex), servedExact: idxResponse.status === 200 && sha(deliveredIndex) === sha(preview) }, consumerCommit: idx.consumerCommit, artist: idx.artistManifest, checked, configAndProjectionMatchOwnOracle: true, instances: staged.instances, serverWrites: 0, tokenGranted: false };
writeFileSync(path.join(own, 'frozen-verification.json'), JSON.stringify(output, null, 2) + '\n');
writeFileSync(path.join(own, 'FILE_INDEX.producer.json'), indexBytes);
console.log(JSON.stringify({ own, files: checked.length, configAndProjectionMatchOwnOracle: true, previewIndex: output.previewIndex }, null, 2));
