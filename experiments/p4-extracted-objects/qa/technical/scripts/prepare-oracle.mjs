import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';

// Operator inputs stay on the command line; never embed a private source path.
const [repoArg, nativeArg, imageArg, runtimeArg] = process.argv.slice(2);
if (![repoArg, nativeArg, imageArg, runtimeArg].every(Boolean)) {
  throw Error('Usage: node prepare-oracle.mjs <R4D-repo> <authorized-native-repo> <source-jpg> <runtime-dir>');
}
const repo = resolve(repoArg), nativeRepo = resolve(nativeArg), runtime = resolve(runtimeArg);
const p1 = '4b47db04c7140ebf88f69b91faa0b790d46f22ec';
const core = '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023';
const root = 'experiments/p1-collider-mapping/clean-repeat-01/';
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const git = (dir, ...args) => execFileSync('git', ['-C', dir, ...args]);
const blob = (dir, rev, path) => git(dir, 'show', `${rev}:${path}`);
const put = (path, bytes) => { mkdirSync(resolve(path, '..'), { recursive: true }); writeFileSync(path, bytes); };
const inputs = [
  ['config.json', 'simulation/boards/01/trial-01/config.json', 'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db'],
  ['manifest.json', 'simulation/boards/01/trial-01/manifest.json', '7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18'],
  ['projection.json', 'research/board01-projection.candidate-01.json', '9ca9e520f1927426a3a5ba73a5eacaf90fedffc9385e7d08d5b1e6ee644b020c'],
  ['view-math.mjs', 'viewer/src/view-math.mjs', null],
];
const records = inputs.map(([name, path, expected]) => {
  const bytes = blob(repo, p1, root + path);
  const lf = Buffer.from(bytes.toString('utf8').replaceAll('\r\n', '\n'));
  const digest = sha(lf);
  if (expected && digest !== expected) throw Error(`Input hash mismatch: ${name}`);
  put(join(runtime, 'inputs', name), bytes);
  return { name, commit: p1, path: root + path, gitBlob: git(repo, 'rev-parse', `${p1}:${root + path}`).toString().trim(), sha256: sha(bytes), shaLf: digest, expectedShaLf: expected };
});
const jpg = readFileSync(imageArg);
if (sha(jpg) !== 'c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72') throw Error('Source JPG mismatch');
let dimensions;
for (let i = 2; i < jpg.length;) {
  if (jpg[i++] !== 0xff) throw Error('Invalid JPEG marker');
  while (jpg[i] === 0xff) i++;
  const marker = jpg[i++];
  if (marker === 0xd9 || marker === 0xda) break;
  if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) continue;
  const length = jpg.readUInt16BE(i);
  if ([0xc0, 0xc1, 0xc2].includes(marker)) { dimensions = [jpg.readUInt16BE(i + 5), jpg.readUInt16BE(i + 3)]; break; }
  i += length;
}
if (String(dimensions) !== '1536,1536') throw Error('Source dimensions mismatch');
const paths = git(nativeRepo, 'ls-tree', '-r', '--name-only', core, '--', 'packages/sim-core/src', 'packages/sim-core/package.json').toString().trim().split('\n');
const nativeFiles = paths.map(path => {
  const bytes = blob(nativeRepo, core, path);
  put(join(runtime, 'native', path), bytes);
  return { path, bytes: bytes.length, sha256: sha(bytes), gitBlob: git(nativeRepo, 'rev-parse', `${core}:${path}`).toString().trim() };
});
const recipePath = 'experiments/p0-perspective/research/CROSS_SERIES_CONCLUSION_AND_RECIPE.md';
const recipeCommit = 'ee4d8e5c7dbb3b6618d58d6dacb0caf9b73dfb1b';
const report = {
  schema: 'r4d.p4.technical-qa.inputs.v1',
  p1Commit: p1, nativeCommit: core, source: { sha256: sha(jpg), dimensions },
  records, nativeFiles,
  recipe: { commit: recipeCommit, path: recipePath, sha256: sha(blob(repo, recipeCommit, recipePath)) },
  nativeCheckout: { head: git(nativeRepo, 'rev-parse', 'HEAD').toString().trim(), clean: git(nativeRepo, 'status', '--porcelain').length === 0 },
};
if (report.nativeCheckout.head !== core || !report.nativeCheckout.clean) throw Error('Authorized native checkout identity/cleanliness changed');
put(join(runtime, 'input-verification.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ inputsVerified: records.length, nativeFiles: nativeFiles.length, nativeBytes: nativeFiles.reduce((n, f) => n + f.bytes, 0), sourceDimensions: dimensions }));
