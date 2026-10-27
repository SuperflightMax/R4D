import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

export const root = fileURLToPath(new URL('../', import.meta.url));
export const pins = Object.freeze({
  p1Commit: '4b47db04c7140ebf88f69b91faa0b790d46f22ec',
  subtree: 'experiments/p1-collider-mapping/clean-repeat-01',
  coreCommit: '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023',
  configSha256: 'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db',
  projectionSha256: '9ca9e520f1927426a3a5ba73a5eacaf90fedffc9385e7d08d5b1e6ee644b020c',
  sourceSha256: 'c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72',
});
export const inputFiles = {
  'config.json': 'simulation/boards/01/trial-01/config.json',
  'manifest.json': 'simulation/boards/01/trial-01/manifest.json',
  'projection.json': 'research/board01-projection.candidate-01.json',
  'view-math.mjs': 'viewer/src/view-math.mjs',
};
export const defaults = {
  coreRoot: 'D:/dev/.codex-worktrees/r4d-p1-collider-mapping/millionko-source/lead',
  source: 'K:/Agents/R4D/Assets/perspective/01-jungle.jpg',
  pixiRoot: 'D:/dev/.codex-worktrees/r4d-p1-clean-repeat-01/lead/experiments/p1-collider-mapping/clean-repeat-01/viewer/node_modules/pixi.js',
  output: 'E:/R4D/perspective/p2-runtime/output/builder',
};
export const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
export const canonicalLF = bytes => Buffer.from(bytes.toString('utf8').replaceAll('\r\n', '\n'));
export function pinnedFile(relative) {
  return execFileSync('git', ['show', `${pins.p1Commit}:${pins.subtree}/${relative}`], { cwd: root, maxBuffer: 8 * 1024 * 1024 });
}
export function verifyInputs() {
  for (const [local, relative] of Object.entries(inputFiles)) {
    const expected = canonicalLF(pinnedFile(relative));
    const actual = canonicalLF(readFileSync(path.join(root, 'inputs', local)));
    if (!actual.equals(expected)) throw new Error(`Pinned input differs: ${local}`);
  }
  const cfg = readFileSync(path.join(root, 'inputs/config.json'));
  const projection = readFileSync(path.join(root, 'inputs/projection.json'));
  if (sha256(canonicalLF(cfg)) !== pins.configSha256) throw new Error('Config hash mismatch');
  if (sha256(canonicalLF(projection)) !== pins.projectionSha256) throw new Error('Projection hash mismatch');
}
export function verifyCore(coreRoot) {
  const actual = execFileSync('git', ['rev-parse', 'HEAD'], { cwd: coreRoot, encoding: 'utf8' }).trim();
  if (actual !== pins.coreCommit) throw new Error(`Wrong core HEAD: ${actual}`);
  execFileSync('git', ['diff', '--exit-code', pins.coreCommit, '--', 'packages/sim-core'], { cwd: coreRoot, stdio: 'pipe' });
  return path.join(coreRoot, 'packages/sim-core/src');
}
