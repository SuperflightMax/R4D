// Scoped frozen Water w04 read-only verification. No native reruns or producer writes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const producer = 'E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/output/previews/w04';
const own = 'E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w04';
const sha = b => createHash('sha256').update(b).digest('hex');
assert(!existsSync(own), 'Append-only QA directory already exists');
const guard = JSON.parse(execFileSync('pwsh', ['-NoProfile', '-Command', `$o=Get-CimInstance Win32_OperatingSystem;$p=Get-Process;[pscustomobject]@{utc=(Get-Date).ToUniversalTime().ToString('o');computer=$env:COMPUTERNAME;freeRamGiB=$o.FreePhysicalMemory/1MB;cpuPercent=(Get-CimInstance Win32_Processor|Measure-Object LoadPercentage -Average).Average;aggregateWorkingSetGiB=($p|Measure-Object WorkingSet64 -Sum).Sum/1GB;disks=@(Get-PSDrive C,D,E|ForEach-Object{[pscustomobject]@{name=$_.Name;freeGiB=$_.Free/1GB}})}|ConvertTo-Json -Depth 4 -Compress`], { encoding: 'utf8' }));
assert.equal(guard.computer, 'WIN-36E9FF9EJM0'); assert(guard.freeRamGiB > 5); assert(guard.disks.find(d => d.name === 'E').freeGiB > 4);
mkdirSync(path.join(own, 'screenshots'), { recursive: true }); mkdirSync(path.join(own, 'snapshots'));
writeFileSync(path.join(own, 'resource-before.json'), JSON.stringify({ ...guard, ownEstimate: { ramGiB: 1, eGiB: 0.1 }, concurrentAllowance: { ramGiB: 4, eGiB: 2 } }, null, 2));
const indexBytes = readFileSync(path.join(producer, 'FILE_INDEX.json'));
assert.equal(indexBytes.length, 6632); assert.equal(sha(indexBytes), 'c1c983dbddaaf556c5000dc9463df262fdc38444b2826a5883a2800b78b70554');
const idx = JSON.parse(indexBytes); assert.equal(idx.consumerCommit, '48763f47d1e21e32334df3427209181a5a6114de');
const preview = readFileSync(path.join(producer, 'index.json')); assert.equal(preview.length, idx.previewIndex.bytes); assert.equal(sha(preview), idx.previewIndex.sha256);
const source = execFileSync('git', ['--no-optional-locks', 'show', `${idx.artistManifest.commit}:${idx.artistManifest.path}`]);
assert.equal(source.length, 44339); assert.equal(sha(source), '50dceb14be6f71a429231a89c44c67d75198e1c9dd9d425c6e8c1747f251803f');
const supporting = idx.artistManifest.supporting.map(f => { const b = execFileSync('git', ['--no-optional-locks', 'show', `${idx.artistManifest.commit}:${f.path}`]); assert.equal(b.length, f.bytes); assert.equal(sha(b), f.sha256); writeFileSync(path.join(own, f.materialized), b); return f; });
const w01 = JSON.parse(readFileSync('E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w01/frozen-verification.json'));
const checked = [];
for (const f of idx.files) {
  const disk = readFileSync(path.join(idx.publicRoot, f.path)); assert.equal(disk.length, f.bytes); assert.equal(sha(disk), f.sha256);
  const response = await fetch(new URL(f.path, 'http://127.0.0.1:55192/')); assert.equal(response.status, 200, f.path);
  const served = Buffer.from(await response.arrayBuffer()); assert.equal(served.length, f.bytes); assert.equal(sha(served), f.sha256);
  checked.push({ ...f, diskExact: true, httpExact: true, unchangedFromW01: w01.checked.some(old => old.path === f.path && old.sha256 === f.sha256) });
}
const staged = JSON.parse(readFileSync(path.join(idx.publicRoot, 'assets/manifest.json'))), artist = JSON.parse(source);
assert.equal(staged.textures.length, 15); assert.equal(new Set(staged.textures.map(t => t.sha256)).size, 9); assert.equal(staged.instances.length, 30);
for (const t of staged.textures) { const a = artist.textures.find(x => x.id === t.id); assert(a); for (const k of ['sha256', 'groundAnchorPx', 'footprintPx']) assert.deepEqual(t[k], a[k]); }
assert.deepEqual(staged.instances, artist.instances);
const p1 = JSON.parse(readFileSync(path.join(idx.publicRoot, 'data/p1-manifest.json')));
assert.deepEqual(p1, JSON.parse(readFileSync('E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/input-oracle-001/common/manifest.json')));
const output = { utc: new Date().toISOString(), candidate: 'w04', producer, url: 'http://127.0.0.1:55192/', consumerCommit: idx.consumerCommit, artistManifest: idx.artistManifest, fileIndex: { bytes: indexBytes.length, sha256: sha(indexBytes) }, previewSidecar: { bytes: preview.length, sha256: sha(preview), servedFromPublic: false }, checked, supporting, counts: { textures: 15, png: 9, instances: 30 }, serverWrites: 0, tokenGranted: false };
writeFileSync(path.join(own, 'FILE_INDEX.producer.json'), indexBytes);
writeFileSync(path.join(own, 'frozen-verification.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ own, publicFiles: checked.length, unchangedFromW01: checked.filter(f => f.unchangedFromW01).length, sourceInstancesExact: true, counts: output.counts }, null, 2));
