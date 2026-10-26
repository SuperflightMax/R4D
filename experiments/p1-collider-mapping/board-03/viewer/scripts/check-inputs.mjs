import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { expected, paths } from './input-paths.mjs';

const sha = (bytes) => createHash('sha256').update(bytes).digest('hex');
const assertEqual = (actual, wanted, label) => {
  if (actual !== wanted) throw new Error(`${label}: expected ${wanted}, received ${actual}`);
};

const [image, mappingText, config, ball, shadow] = await Promise.all([
  readFile(paths.image),
  readFile(paths.mapping, 'utf8'),
  readFile(paths.config, 'utf8'),
  readFile(paths.ball),
  readFile(paths.shadow),
]);

assertEqual(sha(image), expected.image, 'source image SHA-256');
assertEqual(sha(JSON.stringify(JSON.parse(mappingText))), expected.mapping, 'canonical mapping SHA-256');
assertEqual(sha(config.replace(/\r\n/g, '\n')), expected.config, 'config canonical LF SHA-256');
assertEqual(sha(ball), expected.ball, 'candidate-B ball SHA-256');
assertEqual(sha(shadow), expected.shadow, 'candidate-B shadow SHA-256');
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

console.log(`PASS exact viewer inputs: config=${expected.config} mapping=${expected.mapping} image=${expected.image}`);
