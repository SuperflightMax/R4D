// First actual Dark QA. Read-only frozen inputs and HTTP, no native re-export/run.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const producer = 'E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/dark/output/previews/d01';
const own = 'E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/dark/d01';
const sha = b => createHash('sha256').update(b).digest('hex');
assert(!existsSync(own), 'Append-only QA directory already exists');
const guard = JSON.parse(execFileSync('pwsh', ['-NoProfile', '-Command', `$o=Get-CimInstance Win32_OperatingSystem;$p=Get-Process;[pscustomobject]@{utc=(Get-Date).ToUniversalTime().ToString('o');computer=$env:COMPUTERNAME;freeRamGiB=$o.FreePhysicalMemory/1MB;cpuPercent=(Get-CimInstance Win32_Processor|Measure-Object LoadPercentage -Average).Average;aggregateWorkingSetGiB=($p|Measure-Object WorkingSet64 -Sum).Sum/1GB;disks=@(Get-PSDrive C,D,E|ForEach-Object{[pscustomobject]@{name=$_.Name;freeGiB=$_.Free/1GB}})}|ConvertTo-Json -Depth 4 -Compress`], { encoding: 'utf8' }));
assert.equal(guard.computer, 'WIN-36E9FF9EJM0'); assert(guard.freeRamGiB > 5); assert(guard.disks.find(d => d.name === 'E').freeGiB > 4);
mkdirSync(path.join(own, 'screenshots'), { recursive: true }); mkdirSync(path.join(own, 'snapshots'));
writeFileSync(path.join(own, 'resource-before.json'), JSON.stringify({ ...guard, ownEstimate: { ramGiB: 1, eGiB: 0.1 }, concurrentAllowance: { ramGiB: 4, eGiB: 2 } }, null, 2));
const indexBytes = readFileSync(path.join(producer, 'FILE_INDEX.json'));
assert.equal(indexBytes.length, 6109); assert.equal(sha(indexBytes), 'd810ae08b53a0eaf44636df0adcb2c15eb4a0195b31db383534b4ea70af2116b');
const idx = JSON.parse(indexBytes); assert.equal(idx.consumerCommit, 'aae514ed31720ab6d913f4bc6d63286c26992e0a');
const preview = readFileSync(path.join(producer, 'index.json')); assert.equal(preview.length, idx.previewIndex.bytes); assert.equal(sha(preview), idx.previewIndex.sha256);
const source = execFileSync('git', ['--no-optional-locks', 'show', `${idx.artistManifest.commit}:${idx.artistManifest.path}`]);
assert.equal(source.length, 47851); assert.equal(sha(source), 'c14b212e846f00dd3adf546feba5692bf9bd268002405b711f9157648a1661d7');
const supporting = idx.artistManifest.supporting.map(f => { const b = execFileSync('git', ['--no-optional-locks', 'show', `${idx.artistManifest.commit}:${f.path}`]); assert.equal(b.length, f.bytes); assert.equal(sha(b), f.sha256); writeFileSync(path.join(own, f.materialized), b); return f; });
const checked = [];
for (const f of idx.files) {
  const disk = readFileSync(path.join(idx.publicRoot, f.path)); assert.equal(disk.length, f.bytes); assert.equal(sha(disk), f.sha256);
  const response = await fetch(new URL(f.path, 'http://127.0.0.1:55193/')); assert.equal(response.status, 200, f.path);
  const served = Buffer.from(await response.arrayBuffer()); assert.equal(served.length, f.bytes); assert.equal(sha(served), f.sha256);
  checked.push({ ...f, diskExact: true, httpExact: true });
}
const staged = JSON.parse(readFileSync(path.join(idx.publicRoot, 'assets/manifest.json'))), artist = JSON.parse(source);
assert.equal(staged.textures.length, 15); assert.equal(new Set(staged.textures.map(t => t.sha256)).size, 8); assert.equal(staged.instances.length, 35);
for (const t of staged.textures) { const a = artist.textures.find(x => x.id === t.id); assert(a); for (const k of ['sha256', 'groundAnchorPx', 'footprintPx']) assert.deepEqual(t[k], a[k]); }
assert.deepEqual(staged.instances, artist.instances);
for (const [candidate, cached] of [['config', 'config'], ['p1-manifest', 'manifest']]) assert.deepEqual(JSON.parse(readFileSync(path.join(idx.publicRoot, `data/${candidate}.json`))), JSON.parse(readFileSync(`E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/dark/input-oracle-001/common/${cached}.json`)));
const app = checked.find(f => f.path === 'app.js'); assert.equal(app.sha256, '0571bbdaa541fa8d5ad617c686118d69b4ba7dacca746652dc99f8489cc248c2');
const output = { utc: new Date().toISOString(), candidate: 'd01', producer, url: 'http://127.0.0.1:55193/', consumerCommit: idx.consumerCommit, artistManifest: idx.artistManifest, fileIndex: { bytes: indexBytes.length, sha256: sha(indexBytes) }, previewSidecar: { bytes: preview.length, sha256: sha(preview), servedFromPublic: false }, checked, supporting, counts: { textures: 15, png: 8, instances: 35 }, appBytesSameAsW04: true, darkConfigAndProjectionMatchOwnOracle: true, serverWrites: 0, tokenGranted: false };
writeFileSync(path.join(own, 'FILE_INDEX.producer.json'), indexBytes); writeFileSync(path.join(own, 'frozen-verification.json'), JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ own, publicFiles: checked.length, sourceInstancesExact: true, appBytesSameAsW04: true, counts: output.counts }, null, 2));
