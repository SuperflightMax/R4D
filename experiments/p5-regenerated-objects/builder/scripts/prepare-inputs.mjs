import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const repo = resolve(root, '../../..');
const p1 = '4b47db04c7140ebf88f69b91faa0b790d46f22ec';
const prefix = 'experiments/p1-collider-mapping/clean-repeat-01/';
const pins = [
  ['simulation/boards/01/trial-01/config.json', 'public/data/config.json', 9503, 'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db'],
  ['simulation/boards/01/trial-01/manifest.json', 'public/data/p1-manifest.json', 11565, '7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18'],
  ['simulation/projection.mjs', 'src/p1-projection.mjs', 614, 'b59a0c1e6c34b417d253178457ef3580b8bea0aa89c989d1342f9376e19b9431'],
  ['viewer/src/view-math.mjs', 'src/p1-view-math.mjs', 3050, '96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e'],
];
const sha = buffer => createHash('sha256').update(buffer).digest('hex');
const verified = [];
for (const [source, destination, bytes, digest] of pins) {
  const buffer = execFileSync('git', ['-C', repo, 'show', `${p1}:${prefix}${source}`]);
  if (buffer.length !== bytes || sha(buffer) !== digest) throw new Error(`P1 pin mismatch: ${source}`);
  const output = resolve(root, destination);
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output, buffer);
  verified.push({ source: `${p1}:${prefix}${source}`, destination, bytes, sha256: digest });
}
const sourcePath = 'K:/Agents/R4D/Assets/perspective/01-jungle.jpg';
const source = readFileSync(sourcePath);
const sourceSha = 'c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72';
if (sha(source) !== sourceSha) throw new Error('Read-only Jungle source pin mismatch');
const config = JSON.parse(readFileSync(resolve(root, 'public/data/config.json')));
const manifest = JSON.parse(readFileSync(resolve(root, 'public/data/p1-manifest.json')));
const { project, bounds } = await import('../src/p1-projection.mjs');
const matrix = manifest.projection.nativeToSource;
const circle = ({ x, y, r }) => Array.from({ length: 128 }, (_, index) => {
  const angle = index * Math.PI * 2 / 128;
  return project(matrix, [x + Math.cos(angle) * r, y + Math.sin(angle) * r]);
});
const describe = (kind, object) => {
  const polygon = circle(object);
  const box = bounds(polygon);
  return {
    id: object.id,
    kind,
    family: object.id.replace(/-\d+$/, ''),
    native: { anchor: [object.x, object.y], radius: object.r },
    sourcePx: { anchor: project(matrix, [object.x, object.y]), footprintBounds: box,
      footprintWidth: box.maxX - box.minX, footprintDepth: box.maxY - box.minY,
      groundPolygon: polygon },
  };
};
const targets = {
  schema: 'r4d.p5.targets/1',
  p1Commit: p1,
  configSha256: pins[0][3],
  manifestSha256: pins[1][3],
  source: { path: sourcePath, width: 1536, height: 1536, bytes: source.length, sha256: sourceSha },
  units: { native: 'Unchanged Millionko units, including P1 translation', source: '1536x1536 pixels', texture: 'Untrimmed texture-local pixels', viewport: 'CSS pixels; renderer DPR affects backing resolution only' },
  translation: manifest.translation,
  projection: manifest.projection,
  objects: [...config.board.pins.map(o => describe('pin', o)), ...config.board.buckets.map(o => describe('bucket', o))],
  ball: { nativeRadius: config.board.ball.r, binding: 'live native ball.pos', referenceAtDrop: describe('ball', { ...config.board.drops[0], r: config.board.ball.r }),
    scaleRule: 'Projected horizontal diameter / authored texture footprint width; sphere uses uniform XY scale. Texture groundAnchor is the ground contact under its center; no native state offset.' },
};
writeFileSync(resolve(root, 'public/data/targets.json'), JSON.stringify(targets, null, 2) + '\n');
const verification = { schema: 'r4d.p5.input-verification/1', p1Commit: p1, inputs: verified, source: targets.source,
  native: { commit: '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023', tree: '008d16a80a26bb77d562a45218b01da09b0d9ff0' },
  counts: { pins: config.board.pins.length, segments: config.board.segments.length, buckets: config.board.buckets.length, drops: config.board.drops.length },
  defaults: config.defaults, physics: config.physics, rngAlgorithm: config.rng.algo, ballRadius: config.board.ball.r };
writeFileSync(resolve(root, 'public/data/input-verification.json'), JSON.stringify(verification, null, 2) + '\n');
console.log(JSON.stringify({ verified: verified.length, sourceBytes: source.length, counts: verification.counts,
  radius: config.board.ball.r, translation: manifest.translation.offset }));
