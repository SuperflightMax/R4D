import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const experiment = path.resolve(root, '..');
const generated = path.join(root, 'generated');
const model = JSON.parse(await readFile(path.join(experiment, 'research', 'perspective-model-v0.1.json'), 'utf8'));
const temp = await mkdtemp(path.join(os.tmpdir(), 'r4d-p0-builder-check-'));

try {
  const build = spawnSync(process.execPath, [path.join(here, 'build.mjs'), '--out', temp], { encoding: 'utf8' });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout || 'Rebuild failed');
  const expected = (await readdir(generated)).sort();
  const actual = (await readdir(temp)).sort();
  assert(JSON.stringify(actual) === JSON.stringify(expected), `Generated file set differs: ${actual.join(', ')}`);
  for (const name of expected) {
    const [a, b] = await Promise.all([readFile(path.join(generated, name)), readFile(path.join(temp, name))]);
    assert(canonicalText(a).equals(canonicalText(b)), `${name} is stale; run npm run build`);
  }

  const source = await readFile(model.source.readOnlyPath);
  assert(sha256(source) === model.source.sha256, 'Reference JPEG SHA-256 differs from Research v0.1');
  const dimensions = jpegDimensions(source);
  assert(dimensions.width === model.source.widthPx && dimensions.height === model.source.heightPx, `Reference dimensions differ: ${dimensions.width} × ${dimensions.height}`);

  const metrics = JSON.parse(await readFile(path.join(generated, 'metrics-v1.json'), 'utf8'));
  const q = metrics.selectedModel.fieldQuadPxClockwise;
  assert(JSON.stringify(q) === JSON.stringify([[345.6,391.68],[1190.4,391.68],[1405.44,1190.4],[130.56,1190.4]]), `Unexpected normalized quad projection: ${JSON.stringify(q)}`);
  assert(Math.abs(metrics.selectedModel.nearToFarFieldWidthRatio - 1.5090909091) < 1e-9, 'Field ratio invariant failed');
  assert(metrics.comparison.rows.length === model.controlRows.length, 'Comparison row count differs');
  assert(metrics.exclusions.includes('physics') && metrics.exclusions.includes('ball') && metrics.exclusions.includes('sim-core'), 'P0 exclusions missing');
  console.log(`PASS: ${expected.length} deterministic artifacts; source ${dimensions.width} × ${dimensions.height}; SHA-256 ${model.source.sha256}`);
} finally {
  await rm(temp, { recursive: true, force: true });
}

function jpegDimensions(buffer) {
  assert(buffer[0] === 0xff && buffer[1] === 0xd8, 'Reference is not a JPEG');
  let offset = 2;
  while (offset < buffer.length) {
    if (buffer[offset] !== 0xff) { offset += 1; continue; }
    const marker = buffer[offset + 1];
    offset += 2;
    if (marker === 0xd8 || marker === 0xd9) continue;
    const length = buffer.readUInt16BE(offset);
    if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(marker)) {
      return { height: buffer.readUInt16BE(offset + 3), width: buffer.readUInt16BE(offset + 5) };
    }
    offset += length;
  }
  throw new Error('JPEG dimensions not found');
}

function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }
function canonicalText(buffer) { return Buffer.from(buffer.toString('utf8').replace(/\r\n/g, '\n'), 'utf8'); }
function assert(condition, message) { if (!condition) throw new Error(message); }
