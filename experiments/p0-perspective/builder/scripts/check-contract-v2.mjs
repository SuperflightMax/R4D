import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const experiment = path.resolve(root, '..');
const generated = path.join(root, 'generated', 'composition-contract-v2.json');
const temp = await mkdtemp(path.join(os.tmpdir(), 'r4d-p0-contract-v2-'));

try {
  const build = spawnSync(process.execPath, [path.join(here, 'build-contract-v2.mjs'), '--out', temp], { encoding: 'utf8' });
  if (build.status !== 0) throw new Error(build.stderr || build.stdout || 'Contract v2 rebuild failed');
  const [checkedBuffer, rebuiltBuffer] = await Promise.all([
    readFile(generated),
    readFile(path.join(temp, 'composition-contract-v2.json')),
  ]);
  assert(canonicalText(checkedBuffer).equals(canonicalText(rebuiltBuffer)), 'composition-contract-v2.json is stale; run npm run build:contract:v2');

  const contract = JSON.parse(rebuiltBuffer.toString('utf8'));
  const model = JSON.parse(await readFile(path.join(experiment, 'research', 'perspective-model-v0.1.json'), 'utf8'));
  assert(contract.frame.widthPx === 1536 && contract.frame.heightPx === 1536, 'Frame must remain 1536 × 1536');
  assert(JSON.stringify(contract.frame.channels) === JSON.stringify(['R','G','B','A']), 'Frame must remain RGBA');
  assert(JSON.stringify(contract.playablePlane.quadNormalized) === JSON.stringify([[0.225,0.255],[0.775,0.255],[0.915,0.775],[0.085,0.775]]), 'Playable quad changed');
  assert(JSON.stringify(contract.playablePlane.quadPx) === JSON.stringify([[345.6,391.68],[1190.4,391.68],[1405.44,1190.4],[130.56,1190.4]]), 'Playable quad pixel projection changed');
  assert(JSON.stringify(contract.playablePlane.seams.map(({q,yPx}) => [q,yPx])) === JSON.stringify([[0.255,391.68],[0.775,1190.4]]), 'Playable seams changed');
  assert(JSON.stringify(contract.playablePlane.seams.map(({fromPx,toPx}) => [fromPx,toPx])) === JSON.stringify([[[345.6,391.68],[1190.4,391.68]],[[130.56,1190.4],[1405.44,1190.4]]]), 'Playable seam endpoints changed');

  const anchors = contract.repeatedVolumeFamily.anchors;
  assert(JSON.stringify(anchors.map((a) => a.baseCenterNormalized.q)) === JSON.stringify([0.338,0.453,0.567,0.681]), 'Anchor q list changed');
  assert(JSON.stringify(anchors.map((a) => a.baseCenterYPx)) === JSON.stringify([519.168,695.808,870.912,1046.016]), 'Anchor q→pixel mapping changed');
  assert(JSON.stringify(anchors.map((a) => a.uniformScale)) === JSON.stringify([0.939,0.978,1.018,1.058]), 'Uniform scale list changed');
  assert(anchors.every((a) => a.baseCenterNormalized.p === null), 'Contract v2 must not invent horizontal p before L1');
  assert(contract.repeatedVolumeFamily.master.count === 1 && contract.repeatedVolumeFamily.master.format === 'RGBA', 'Exactly one RGBA master is required');

  assert(JSON.stringify(contract.deterministicComposition.stableSortKeyAscending) === JSON.stringify(['baseCenter.q','baseCenter.p','instanceId']), 'Stable z-order key changed');
  assert(contract.deterministicComposition.randomness === 'forbidden', 'Random composition is forbidden');
  assert(contract.contactShadows.placement.includes('equals its instance base-center anchor'), 'Shadow anchor coupling changed');
  assert(contract.contactShadows.scaling.includes('same instance uniformScale'), 'Shadow scale coupling changed');
  assert(contract.cleanOutput.controlMarkersAllowed === false, 'Control markers must remain forbidden');
  assert(contract.cleanOutput.forbiddenVisibleElements.length >= 7, 'Control-marker exclusion list was weakened');
  assert(JSON.stringify(contract.tolerances) === JSON.stringify(model.tolerances), 'Research tolerances changed or were weakened');
  assert(Object.values(contract.gates).every((value) => value === 'contract-v2-only' || value === 'closed-until-real-Asset-components' || value === 'closed'), 'A closed gate was opened');

  console.log('PASS: contract v2 frame/quad/seams, 4 anchors, 4 scales, RGBA master, z-order, shadows, clean-output rule and unchanged Research tolerances');
} finally {
  await rm(temp, { recursive: true, force: true });
}

function canonicalText(buffer) { return Buffer.from(buffer.toString('utf8').replace(/\r\n/g, '\n'), 'utf8'); }
function assert(condition, message) { if (!condition) throw new Error(message); }
