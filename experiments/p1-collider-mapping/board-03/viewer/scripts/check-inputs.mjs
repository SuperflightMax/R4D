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
  board02Image,
  board02MappingText,
  board02Config,
  board02ManifestText,
  board02Traces,
  board04Image,
  board04MappingText,
  board04Config,
  board04ManifestText,
  board04Traces,
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
  readFile(paths.board02.image),
  readFile(paths.board02.mapping, 'utf8'),
  readFile(paths.board02.config, 'utf8'),
  readFile(paths.board02.configManifest, 'utf8'),
  readFile(paths.board02.traces, 'utf8'),
  readFile(paths.board04.image),
  readFile(paths.board04.mapping, 'utf8'),
  readFile(paths.board04.config, 'utf8'),
  readFile(paths.board04.configManifest, 'utf8'),
  readFile(paths.board04.traces, 'utf8'),
  readFile(paths.ball),
  readFile(paths.shadow),
  readFile(paths.assetManifest, 'utf8'),
]);
const board01Manifest = JSON.parse(board01ManifestText);
const board02Manifest = JSON.parse(board02ManifestText);
const board04Manifest = JSON.parse(board04ManifestText);
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

assertEqual(sha(board02Image), expected.board02.image, 'board-02 source image SHA-256');
assertEqual(sha(JSON.stringify(JSON.parse(board02MappingText))), expected.board02.mappingJsSemantic, 'board-02 JS semantic mapping SHA-256');
assertEqual(board02Manifest.mapping.commit, expected.board02.researchCommit, 'board-02 Research commit');
assertEqual(board02Manifest.mapping.canonicalSha256, expected.board02.mappingCanonical, 'board-02 canonical mapping SHA-256');
assertEqual(sha(canonicalLf(board02Config)), expected.board02.config, 'board-02 config canonical LF SHA-256');
assertEqual(sha(canonicalLf(board02Traces)), expected.board02.traces, 'board-02 traces canonical LF SHA-256');

assertEqual(sha(board04Image), expected.board04.image, 'board-04 source image SHA-256');
assertEqual(sha(JSON.stringify(JSON.parse(board04MappingText))), expected.board04.mappingJsSemantic, 'board-04 JS semantic mapping SHA-256');
assertEqual(board04Manifest.mapping.commit, expected.board04.researchCommit, 'board-04 Research commit');
assertEqual(board04Manifest.mapping.canonicalSha256, expected.board04.mappingCanonical, 'board-04 canonical mapping SHA-256');
assertEqual(sha(canonicalLf(board04Config)), expected.board04.config, 'board-04 config canonical LF SHA-256');
assertEqual(sha(canonicalLf(board04Traces)), expected.board04.traces, 'board-04 traces canonical LF SHA-256');

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

console.log(`PASS exact viewer inputs: board03=${expected.board03.mapping} board01=${expected.board01.mappingCanonical} board02=${expected.board02.mappingCanonical} board04=${expected.board04.mappingCanonical} core=${expected.simCore}`);
