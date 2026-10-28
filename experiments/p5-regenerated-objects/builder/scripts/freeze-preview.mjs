import { readFileSync, writeFileSync, copyFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { root, runtime } from './runtime.mjs';

const id = process.argv[2];
if (!id || !/^[a-z0-9-]+$/.test(id)) throw new Error('A new explicit preview id is required');
const base = resolve(runtime, 'output/previews', id);
if (existsSync(base)) throw new Error('Preview id already exists; immutable previews are not overwritten');
const sourceRoot = resolve(runtime, 'site');
const publicRoot = resolve(base, 'public');
const preview = JSON.parse(readFileSync(resolve(sourceRoot, 'data/preview-input.json')));
const files = ['index.html', 'style.css', 'app.js', 'THIRD_PARTY_LICENSES.txt',
  ...['config.json', 'p1-manifest.json', 'input-verification.json', 'targets.json', 'preview-input.json', 'dependency-pins.json', 'dependency-lock.json'].map(p => 'data/' + p)];
if (preview.manifestUrl) {
  files.push(preview.manifestUrl);
  const manifest = JSON.parse(readFileSync(resolve(sourceRoot, preview.manifestUrl)));
  for (const texture of manifest.textures) files.push('assets/' + texture.file);
} else if (preview.earlyFloor) files.push(preview.earlyFloor.file);
const inventory = [];
for (const path of [...new Set(files)].sort()) {
  const bytes = readFileSync(resolve(sourceRoot, path));
  const destination = resolve(publicRoot, path);
  mkdirSync(dirname(destination), { recursive: true });
  copyFileSync(resolve(sourceRoot, path), destination);
  inventory.push({ path, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
const index = { schema: 'r4d.p5.preview-index/1', id, createdUtc: new Date().toISOString(),
  consumerCommit: execFileSync('git', ['-C', resolve(root, '../../..'), 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  consumerPath: 'experiments/p5-regenerated-objects/builder', publicRoot,
  status: preview.manifestUrl ? 'early generated candidate; independent QA not yet performed' : 'floor-only compatibility preview; not promised generated mini-set',
  inputPins: JSON.parse(readFileSync(resolve(sourceRoot, 'data/input-verification.json'))),
  artistManifest: preview.artistManifest ?? null, earlyFloor: preview.earlyFloor,
  inventory, inventoryBytes: inventory.reduce((sum, f) => sum + f.bytes, 0),
  knownLimits: ['No independent technical/artistic QA of these bytes yet', 'Private staging and raw native TS/maps excluded by explicit file list; release privacy approval pending', '@pixi/colord package declares MIT but installed package lacks license file; resolve before release'],
  serverWrites: 0, releaseGate: 'closed' };
const bytes = Buffer.from(JSON.stringify(index, null, 2) + '\n');
writeFileSync(resolve(base, 'index.json'), bytes);
console.log(JSON.stringify({ index: resolve(base, 'index.json'), indexSha256: createHash('sha256').update(bytes).digest('hex'), indexBytes: bytes.length, publicRoot, consumerCommit: index.consumerCommit, files: inventory.length, bytes: index.inventoryBytes, status: index.status }));
