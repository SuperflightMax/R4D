// Read-only verification of the handed-off C01 bytes. Never builds or writes Builder's root.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';

const repo = 'E:/R4D/perspective/p5-worktrees/technical-qa';
const root = 'E:/R4D/perspective/p5-runtime/builder/output/previews/c01';
const out = 'E:/R4D/perspective/p5-runtime/technical-qa/c01';
const baseUrl = 'http://127.0.0.1:55185/';
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const getGit = spec => execFileSync('git', ['--no-optional-locks', '-C', repo, 'show', spec]);
const readPinned = (file, bytes, sha256) => {
  const buffer = readFileSync(file);
  assert.equal(buffer.length, bytes, file); assert.equal(digest(buffer), sha256, file);
  return buffer;
};
mkdirSync(out, { recursive: true });
const outputName = process.argv[2] ?? 'package-verification.json';
assert.match(outputName, /^package-verification(?:-\d+)?\.json$/);
const resultPath = path.join(out, outputName);
assert(!existsSync(resultPath), 'Append-only C01 verification already exists.');
const indexBuffer = readPinned(path.join(root, 'index.json'), 7149, 'a19fea2f7ce677f9fa24c5822e0c411a032bd79fda58c055ff8e386ec474f4ac');
const index = JSON.parse(indexBuffer);
assert.equal(index.consumerCommit, '0c611039246904443128b9d12084af2c5a0ae6e6');
assert.equal(index.inventory.length, 22);
assert.equal(index.inventory.reduce((n, f) => n + f.bytes, 0), 13937155);
const checks = [];
for (const file of index.inventory) {
  assert(!file.path.includes('..') && !path.isAbsolute(file.path));
  const buffer = readPinned(path.join(root, 'public', file.path), file.bytes, file.sha256);
  const response = await fetch(new URL(file.path, baseUrl), { cache: 'no-store' });
  assert.equal(response.status, 200, file.path);
  const served = Buffer.from(await response.arrayBuffer());
  assert.equal(served.length, buffer.length, `HTTP bytes ${file.path}`);
  assert.equal(digest(served), file.sha256, `HTTP hash ${file.path}`);
  checks.push({ ...file, localMatched: true, httpMatched: true });
}
const source = getGit('5085be86d5b5e9bf22619254f42b95ad3dc1320e:experiments/p5-regenerated-objects/asset-artist/asset-manifest.mini-01.json');
assert.equal(source.length, 23553); assert.equal(digest(source), '7b8935f4db6f9c20ec6fc2867e115dd787a2a93982f5ef4a5588810d8470e77f');
const artist = JSON.parse(source);
const staged = JSON.parse(readFileSync(path.join(root, 'public/assets/manifest.json')));
assert.equal(artist.textures.length, 10); assert.equal(staged.textures.length, 10);
assert.equal(artist.instances.length, 13); assert.equal(staged.instances.length, 13);
const textureFields = ['id', 'sha256', 'bytes', 'sizePx', 'alpha', 'groundAnchorPx', 'footprintPx'];
for (const tex of artist.textures) {
  const target = staged.textures.find(t => t.id === tex.id); assert(target, tex.id);
  for (const field of textureFields) assert.deepEqual(target[field], tex[field], `${tex.id}.${field}`);
}
assert.deepEqual(staged.instances, artist.instances);
for (const [name, gitPath] of [['data/config.json','simulation/boards/01/trial-01/config.json'], ['data/p1-manifest.json','simulation/boards/01/trial-01/manifest.json']]) {
  assert.deepEqual(readFileSync(path.join(root,'public',name)), getGit(`4b47db04c7140ebf88f69b91faa0b790d46f22ec:experiments/p1-collider-mapping/clean-repeat-01/${gitPath}`));
}
for (const [name, hash] of [['p1-projection.mjs','b59a0c1e6c34b417d253178457ef3580b8bea0aa89c989d1342f9376e19b9431'], ['p1-view-math.mjs','96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e']]) {
  assert.equal(digest(getGit(`0c611039246904443128b9d12084af2c5a0ae6e6:experiments/p5-regenerated-objects/builder/src/${name}`)), hash);
}
const depsBuffer = readFileSync(path.join(root,'public/data/dependency-lock.json'));
assert.deepEqual(depsBuffer, getGit('0c611039246904443128b9d12084af2c5a0ae6e6:experiments/p5-regenerated-objects/builder/DEPENDENCIES.lock.json'));
const replayRoot = 'E:/R4D/perspective/p5-runtime/builder/evidence/c01-replays';
const replayIndex = readPinned(path.join(replayRoot,'index.json'),5430,'aca3ca025c5aee9a0fdf7069035ce376207029c38b99f48f0611e650b7a93c4b');
const result = { createdUtc:new Date().toISOString(), consumerCommit:index.consumerCommit, root:path.join(root,'public'), baseUrl,
  index:{bytes:indexBuffer.length,sha256:digest(indexBuffer)}, files:checks, inventoryBytes:index.inventoryBytes,
  artistManifest:{commit:index.artistManifest.commit,bytes:source.length,sha256:digest(source),textures:10,instances:13,stagedMetadataMatched:true},
  dependencyLock:{sha256:digest(depsBuffer),matchedExactConsumerGit:true}, replayIndex:{path:path.join(replayRoot,'index.json'),bytes:replayIndex.length,sha256:digest(replayIndex)},
  scope:'Package integrity/provenance only. Browser movement and rendering are verified separately.' };
writeFileSync(resultPath, JSON.stringify(result,null,2)+'\n', {flag:'wx'});
console.log(JSON.stringify({resultPath,bytes:readFileSync(resultPath).length,sha256:digest(readFileSync(resultPath)),files:checks.length,inventoryBytes:index.inventoryBytes,artistTextureKeys:Object.keys(artist.textures[0]),stagedTextureKeys:Object.keys(staged.textures[0]),replayIndex:JSON.parse(replayIndex)},null,2));
