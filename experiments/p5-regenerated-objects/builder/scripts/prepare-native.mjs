import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { runtime } from './runtime.mjs';

const repo = 'D:/dev/millionko';
const commit = '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023';
const expectedTree = '008d16a80a26bb77d562a45218b01da09b0d9ff0';
const tree = execFileSync('git', ['-C', repo, 'rev-parse', `${commit}:packages/sim-core`], { encoding: 'utf8' }).trim();
if (tree !== expectedTree) throw new Error('Native tree mismatch');
const paths = execFileSync('git', ['-C', repo, 'ls-tree', '-r', '--name-only', commit, '--', 'packages/sim-core/src', 'packages/sim-core/package.json'], { encoding: 'utf8' }).trim().split(/\r?\n/);
const files = [];
for (const path of paths) {
  const bytes = execFileSync('git', ['-C', repo, 'show', `${commit}:${path}`]);
  const destination = resolve(runtime, 'private-native', path.replace('packages/sim-core/', ''));
  mkdirSync(dirname(destination), { recursive: true });
  writeFileSync(destination, bytes);
  files.push({ path, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
writeFileSync(resolve(runtime, 'private-native/EXACT-INPUTS.json'), JSON.stringify({ commit, tree, files }, null, 2) + '\n');
console.log(JSON.stringify({ nativeCommit: commit, tree, exactFiles: files.length, bytes: files.reduce((sum, f) => sum + f.bytes, 0), sourceUnchanged: true, rawDestination: resolve(runtime, 'private-native') }));
