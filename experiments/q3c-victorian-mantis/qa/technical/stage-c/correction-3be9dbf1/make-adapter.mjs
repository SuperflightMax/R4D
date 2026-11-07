import { readFileSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const sha = '3be9dbf11e7a07a2678c3be161e54fd24aa7f893';
const run = resolve(process.argv[2] ?? '');
const stage = fileURLToPath(new URL('../', import.meta.url));
const pin = JSON.parse(readFileSync(join(run, 'pin.json'), 'utf8'));
if (pin.candidateSha !== sha || run !== pin.runRoot || !run.startsWith(join(stage, '.local', sha) + '-')) {
  throw new Error('Wrong correction pin');
}
let code = readFileSync(join(stage, 'c2-adapter-be62.mjs'), 'utf8').replaceAll('\r\n', '\n');
function replace(from, to) {
  if (code.split(from).length !== 2) throw new Error('Baseline adapter anchor changed: ' + from);
  code = code.replace(from, () => to);
}
replace('const motion = Object.entries(tracks)', `
const calibration = {
  'thorax.lower.abs': { node: 'thorax.lower', target: 95, min: 80.4, max: 170, excursion: 1.6 * 20.8 / 33.8 },
  'thorax.upper.abs': { node: 'thorax.upper', target: 68, min: 10, max: 64 + 16.4 * 4 / 14, excursion: 2.4 * 4 / 14 },
  'rapt.far.femur.abs': { node: 'rapt.far.femur', target: 93, min: 0, max: 98, excursion: 5 },
  'rapt.far.tibia.relative': { node: 'rapt.far.tibia', target: 148.92, min: 148.30, max: 170, excursion: .62, relative: true }
};
const driveValue = (pose, id) => pose.stance[id] ?? pose.motion[id];
const motion = Object.entries(tracks)`.trimStart());
replace('const target = values.at(-1);', 'const target = calibration[id] ? rad(calibration[id].target) : values.at(-1);');
replace('const excursion = Math.max(0, ...values.map(x => direction * (x - target)));',
  'const excursion = calibration[id] ? rad(calibration[id].excursion) : Math.max(0, ...values.map(x => direction * (x - target)));');
replace('.80 * (Math.max(...values) - Math.min(...values))',
  '.80 * (calibration[id] ? rad(calibration[id].max - calibration[id].min) : Math.max(...values) - Math.min(...values))');
replace('minSamples: 1441', 'minSamples: 1501');
replace('const metrics = {', `
let maxCornerSum = 0;
for (const n of manifest.nodes) for (const id of [n.draw?.asset, n.draw?.backAsset].filter(Boolean)) {
  const art = manifest.assets[id];
  const [dx, dy] = n.draw.offset;
  const [px, py] = art.pivotLocal;
  const [x, y, w, h] = art.viewBox;
  for (const u of [x, x + w]) for (const v of [y, y + h]) {
    maxCornerSum = Math.max(maxCornerSum, Math.abs(u - px + dx) + Math.abs(v - py + dy));
  }
}
const opening = { firstTick: null, lastTick: null, ticks: 0, minByGate: {} };
const metrics = {
  opening, projection: { maxCornerSum, cameraScaleLimit: 1.52, pixelBudget: .01, maxPixelBound: 0 },
  stance: { maxGeometryError: 0 },
`.trimStart());
replace('  const p = render.parts;', `
  const p = render.parts;
  if (!pose.stance || Object.keys(pose.stance).length !== 4) finding('STANCE_INVENTORY', section, tick, pose.stance);
  for (const [id, def] of Object.entries(calibration)) {
    if (!Number.isFinite(pose.stance?.[id])) {
      finding('STANCE_CHANNEL_MISSING', id, tick, pose.stance);
      continue;
    }
    const expected = -rad(pose.stance[id] + (pose.idle[id] || 0));
    const m = p[def.node].physicalMatrix;
    let angle = Math.atan2(m[1], m[0]) - pose.body.rotation;
    if (def.relative) {
      const parent = p[nodes[def.node].parent].physicalMatrix;
      angle = Math.atan2(m[1], m[0]) - Math.atan2(parent[1], parent[0]);
    }
    const error = Math.abs(Math.atan2(Math.sin(angle - expected), Math.cos(angle - expected)));
    metrics.stance.maxGeometryError = Math.max(metrics.stance.maxGeometryError, error);
    if (error > threshold) finding('STANCE_GEOMETRY', id, tick, error);
  }`.trimEnd());
replace("    if (error > threshold) finding('ACTUAL_PIXI_PROJECTION', n.id, tick, error);", `
    const pixelBound = Math.SQRT2 * error * (maxCornerSum + 1) * 1.52;
    metrics.projection.maxPixelBound = Math.max(metrics.projection.maxPixelBound, pixelBound);
    if (render.camera.scale > 1.52 + threshold || pixelBound > .01) {
      finding('ACTUAL_PIXI_PROJECTION', n.id, tick, { pixelBound, scale: render.camera.scale });
    }`.trimEnd());
replace('    if (height > a.gateFreeXY.y[0] && height < a.gateFreeXY.y[1]) {', `
    const packed = pre.pose.shoulderInBody;
    const carrierMoves = Math.hypot(pose.shoulderInBody.x - packed.x, pose.shoulderInBody.y - packed.y) > 1e-5 ||
      Math.abs(pose.parts['thorax.lower'].local.rotation - pre.pose.parts['thorax.lower'].local.rotation) > 1e-5;
    if (carrierMoves && height < a.shoulderLocalYForFemur) {
      opening.firstTick ??= tick;
      opening.lastTick = tick;
      opening.ticks++;
`.trimEnd());
replace("        if (angle + threshold < 100) finding('RELEASE_GATE_CLEARANCE', id, tick, [height, angle]);", `
        opening.minByGate[id] = Math.min(opening.minByGate[id] ?? Infinity, angle);
        const minimum = id.startsWith('shell.') ? a.minimumRoofOpenDeg : a.minimumSideGateOpenDeg;
        if (angle + threshold < minimum) finding('RELEASE_GATE_CLEARANCE', id, tick, [height, angle, minimum]);
`.trimEnd());
replace("pose.motion[arm + '.femur.abs']", "driveValue(pose, arm + '.femur.abs')");
replace("pose.motion[arm + '.tibia.relative']", "driveValue(pose, arm + '.tibia.relative')");
replace('Object.entries(raw.pose.motion).map(([id, value]) => [id, inUnits(id, value)])',
  'Object.keys(raw.pose.motion).map(id => [id, inUnits(id, driveValue(raw.pose, id))])');
replace('export const audit = () => metrics;', `
export function audit() {
  want(opening.ticks > 0 && opening.ticks === opening.lastTick - opening.firstTick + 1, 'Incomplete shoulder exit interval');
  return metrics;
}`.trimStart());
writeFileSync(join(run, 'c2-adapter.mjs'), code);
