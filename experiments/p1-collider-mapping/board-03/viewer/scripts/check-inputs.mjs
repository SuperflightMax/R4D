import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { expected, paths } from './input-paths.mjs';

const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const canonicalLf = (text) => text.replace(/\r\n/g, '\n');
const assertEqual = (actual, wanted, label) => {
  if (actual !== wanted) throw new Error(`${label}: expected ${wanted}, received ${actual}`);
};

const [
  board03Image,
  board03MappingText,
  board03Config,
  board01Image,
  board01MappingText,
  board01Config,
  board01ManifestText,
  board01Traces,
  ball,
  shadow,
  assetManifestText,
] = await Promise.all([
  readFile(paths.board03.image),
  readFile(paths.board03.mapping, 'utf8'),
  readFile(paths.board03.config, 'utf8'),
  readFile(paths.board01.image),
  readFile(paths.board01.mapping, 'utf8'),
  readFile(paths.board01.config, 'utf8'),
  readFile(paths.board01.configManifest, 'utf8'),
  readFile(paths.board01.traces, 'utf8'),
  readFile(paths.ball),
  readFile(paths.shadow),
  readFile(paths.assetManifest, 'utf8'),
]);
const board01Manifest = JSON.parse(board01ManifestText);
const assetManifest = JSON.parse(assetManifestText);

assertEqual(sha(board03Image), expected.board03.image, 'board-03 source image SHA-256');
assertEqual(sha(JSON.stringify(JSON.parse(board03MappingText))), expected.board03.mapping, 'board-03 canonical mapping SHA-256');
assertEqual(sha(canonicalLf(board03Config)), expected.board03.config, 'board-03 config canonical LF SHA-256');

assertEqual(sha(board01Image), expected.board01.image, 'board-01 source image SHA-256');
assertEqual(sha(JSON.stringify(JSON.parse(board01MappingText))), expected.board01.mappingJsSemantic, 'board-01 JS semantic mapping SHA-256');
assertEqual(board01Manifest.mapping.commit, expected.board01.researchCommit, 'board-01 Research commit');
assertEqual(board01Manifest.mapping.canonicalSha256, expected.board01.mappingCanonical, 'board-01 canonical mapping SHA-256');
assertEqual(sha(canonicalLf(board01Config)), expected.board01.config, 'board-01 config canonical LF SHA-256');
assertEqual(sha(canonicalLf(board01Traces)), expected.board01.traces, 'board-01 traces canonical LF SHA-256');

assertEqual(sha(ball), expected.ball, 'candidate-B ball SHA-256');
assertEqual(sha(shadow), expected.shadow, 'candidate-C shadow SHA-256');
assertEqual(assetManifest.selected.ball, 'candidate-b/ball-64.png', 'asset manifest ball');
assertEqual(assetManifest.selected.shadow, 'candidate-c/shadow-r18-54x27.png', 'asset manifest shadow');
assertEqual(
  execFileSync('git', ['-C', paths.simCoreRoot, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim(),
  expected.simCore,
  'sim-core source commit',
);
assertEqual(
  execFileSync('git', ['-C', paths.simCoreRoot, 'branch', '--show-current'], { encoding: 'utf8' }).trim(),
  '',
  'sim-core source must be detached',
);

console.log(`PASS exact viewer inputs: board03=${expected.board03.mapping} board01=${expected.board01.mappingCanonical} core=${expected.simCore}`);
