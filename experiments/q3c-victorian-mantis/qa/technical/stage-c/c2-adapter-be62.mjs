import { readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';

const product = new URL('./tree/experiments/q3c-victorian-mantis/', import.meta.url);
const read = relative => JSON.parse(readFileSync(new URL(relative, product), 'utf8'));
const manifest = read('assets/rig/FULL_RIG_V1.json');
const index = read('assets/production-v1/PARTS_INDEX.json');
const svgNames = readdirSync(new URL('assets/production-v1/parts/', product)).filter(name => name.endsWith('.svg'));
const nodes = Object.fromEntries(manifest.nodes.map(n => [n.id, n]));
const tracks = manifest.motion.tracks;
const { xPerZ, yPerZ } = manifest.coordinates.projection;
const rad = x => x * Math.PI / 180;
const stemByFoot = Object.fromEntries(manifest.stageDInterfaces.walk.map(s => [s.foot, s]));
const threshold = 1e-6;
const want = (ok, message) => { if (!ok) throw new Error(message); };
const maxDelta = (a, b) => Math.max(...a.map((n, i) => Math.abs(n - b[i])));
const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const anchor = (part, at = [0, 0]) => ({ part, at: at.slice(0, 2) });
const bySurface = new Set(manifest.nodes.flatMap(n => [n.draw?.asset, n.draw?.backAsset]).filter(Boolean));
want(svgNames.length === 64 && Object.keys(index).length === 64 && Object.keys(manifest.assets).length === 64 && bySurface.size === 64, '64-SVG manifest mismatch');
want(manifest.nodes.length === 98 && Object.keys(nodes).length === 98 && new Set(manifest.drawOrder).size === 98 &&
  manifest.drawOrder.every(id => id in nodes) && Object.keys(tracks).length === 28, '98 nodes / 28 tracks manifest mismatch');
for (const [id, asset] of Object.entries(manifest.assets)) {
  const { sha256, ...indexMetadata } = asset;
  const keys = Object.keys(indexMetadata);
  want(bySurface.has(id) && index[id] && Object.keys(index[id]).length === keys.length &&
    keys.every(k => JSON.stringify(indexMetadata[k]) === JSON.stringify(index[id][k])), 'Unbound asset ' + id);
  const bytes = readFileSync(new URL('assets/' + asset.path, product));
  want(createHash('sha256').update(bytes).digest('hex') === sha256, 'SVG byte mismatch ' + id);
  want(svgNames.includes(asset.path.split('/').at(-1)), 'SVG path missing from pack ' + id);
  const [x, y, w, h] = asset.viewBox, [px, py] = asset.pivotLocal;
  want(maxDelta(asset.spriteAnchor, [(px - x) / w, (py - y) / h]) < threshold, 'Trim/pivot mismatch ' + id);
}
const actualSvgPaths = Object.values(manifest.assets).map(a => a.path);
want(new Set(actualSvgPaths).size === 64 && svgNames.every(name => actualSvgPaths.includes('production-v1/parts/' + name)), 'Distinct SVG path mismatch');

const soleContour = [[-6, 2], [6, 2], [5.87, -2.18], [4.65, -5.5], [3.05, -7.6], [-2.7, -7.7], [-5.88, -0.7]];
const roles = {
  'cradle.rise': 'chassis', 'thorax.lower.abs': 'thorax-lower', 'thorax.upper.abs': 'thorax-upper',
  'head.carriage.sleeve.abs': 'carriage', 'shell.front.open': 'hatch',
  'rapt.near.femur.abs': 'near-arm', 'rapt.near.tibia.relative': 'near-blade',
  'rapt.far.femur.abs': 'far-arm', 'rapt.far.tibia.relative': 'far-blade',
  'walk.front.near.foot.roll': 'support-near', 'walk.front.far.foot.roll': 'support-far'
};
const unitOf = id => id === 'eye.iris.open' ? 'ratio' : /stroke$|^cradle\./.test(id) ? 'u' : 'rad';
const inUnits = (id, x) => unitOf(id) === 'rad' ? rad(x) : x;
const nominatedOverruns = new Set(['cradle.rise', 'thorax.lower.abs', 'thorax.upper.abs', 'head.carriage.sleeve.abs', 'rapt.near.tibia.relative', 'rapt.far.tibia.relative']);
const motion = Object.entries(tracks).map(([id, t]) => {
  const values = [t.initial, ...t.segments.flatMap(s => [s.from, s.to])].map(x => inUnits(id, x));
  const target = values.at(-1);
  const direction = Math.sign(target - values[0]) || 1;
  const excursion = Math.max(0, ...values.map(x => direction * (x - target)));
  return { id, role: roles[id] ?? 'auxiliary', unit: unitOf(id), noise: 1e-7,
    minTravel: .80 * (Math.max(...values) - Math.min(...values)), target, settleBand: 1e-5,
    overshoot: { direction, min: nominatedOverruns.has(id) ? .80 * excursion : 0, max: excursion + threshold } };
});
const constraints = [
  { first: 'thorax.lower.abs', second: 'thorax.upper.abs', delayTicks: 3, overlapTicks: 3, distinctShape: true },
  { first: 'rapt.near.femur.abs', second: 'rapt.near.tibia.relative', delayTicks: 3, overlapTicks: 3, distinctShape: true },
  { first: 'rapt.far.femur.abs', second: 'rapt.far.tibia.relative', delayTicks: 3, overlapTicks: 3, distinctShape: true },
  { first: 'rapt.near.femur.abs', second: 'rapt.far.femur.abs', delayTicks: 3, overlapTicks: 3, distinctShape: false },
  { first: 'rapt.near.tibia.relative', second: 'rapt.far.tibia.relative', delayTicks: 3, overlapTicks: 3, distinctShape: false }
];
const idle = (secondary, eyeRange) => ({
  minSamples: 1441, lagSeconds: 2,
  channels: [
    { id: 'actual.body.y', role: 'body', noise: 1e-7, minRange: .15 },
    { id: 'actual.eye.brow', role: 'eye', noise: 1e-7, minRange: rad(eyeRange) },
    { id: 'actual.' + secondary, role: 'secondary', noise: 1e-7, minRange: secondary.includes('carriage') ? .15 : rad(.15) }
  ]
});

export const rig = {
  U: 180, floorY: 0, supportCount: 4, tolerances: { position: threshold, contact: threshold, scale: 1e-8, angle: 1e-8 },
  parts: Object.fromEntries(manifest.nodes.map(n => [n.id, {
    parent: n.parent ?? null, asset: n.draw?.asset ?? 'rig:' + n.id, scale: [1, 1],
    maxSpeed: 6 * 120, maxAngularSpeed: .25 * 120,
    floorContour: stemByFoot[n.id] ? soleContour : n.length ? [[0, 0], [n.length, 0]] : []
  }])),
  hinges: manifest.nodes.filter(n => n.parent && !n.kind.startsWith('prismatic') && n.id !== 'eye.pupil').map(n => ({
    id: n.id, a: anchor(n.parent, n.pivot), b: anchor(n.id)
  })),
  links: manifest.nodes.filter(n => n.length > 0).map(n => ({
    id: n.id, a: anchor(n.id), b: anchor(n.id, [n.length, 0]), length: n.length
  })),
  soles: Object.fromEntries(manifest.stageDInterfaces.walk.flatMap(s => [
    [s.foot + '@heel', anchor(s.foot, s.heel)], [s.foot + '@toe', anchor(s.foot, s.toe)]
  ])),
  motion, pairs: constraints,
  idle: { capsuleIdle: idle('head.carriage.section2', .15), mantisIdle: idle('rapt.near.tibia', .15) }
};

const metrics = {
  manifest: { id: manifest.id, svg: svgNames.length, nodes: manifest.nodes.length, tracks: motion.length, rigidLinks: rig.links.length, fixedAnchors: rig.hinges.length },
  samples: {}, worst: { projectionError: 0, projectedTranslationStep: 0, physicalTranslationStep: 0, commandMatrixDelta: 0, pinGap: 0, actuatorAxisError: 0, soleGap: 0, minimumInsertion: Infinity, minimumCarriageInsertion: Infinity, minimumReleaseAngle: Infinity, minimumShoulderFemur: Infinity, minimumShoulderBlade: Infinity },
  findings: []
};
const findingKeys = new Set();
function finding(code, id, tick, measured) {
  const key = code + '/' + id;
  if (findingKeys.has(key)) return;
  findingKeys.add(key);
  metrics.findings.push({ code, id, tick, measured });
}
const last = new Map();
let pre;
const origin = m => [m[4], m[5]];
const at = (m, [x, y]) => [m[4] + m[0] * x + m[2] * y, m[5] + m[1] * x + m[3] * y];
const drives = manifest.nodes.filter(n => n.drive);

function auditFrame(raw, section) {
  const { tick, render, pose } = raw;
  metrics.samples[section] = (metrics.samples[section] ?? 0) + 1;
  if (Object.keys(pose.motion).length !== 28 || Object.keys(tracks).some(id => !Number.isFinite(pose.motion[id]))) {
    finding('MOTION_INVENTORY', section, tick, Object.keys(pose.motion));
  }
  if (pose.eye.id !== 'eye.lens' || pose.eye.parent !== 'eye.barrel' || pose.legs.length !== 4 || pose.arms.length !== 2) {
    finding('CHARACTER_INVENTORY', section, tick, [pose.eye.id, pose.legs.length, pose.arms.length]);
  }
  const p = render.parts;
  const before = last.get(section);
  const cBody = Math.cos(pose.body.rotation), sBody = Math.sin(pose.body.rotation);
  for (const n of manifest.nodes) {
    const part = p[n.id];
    const m = part.physicalMatrix;
    const roll = pose.parts[n.id].local.roll;
    const z = pose.parts[n.id].world.z;
    const dx = xPerZ * Math.sin(roll), dy = Math.cos(roll) + yPerZ * Math.sin(roll);
    const x = xPerZ * z, y = yPerZ * z;
    const expected = [m[0], m[1], m[0] * dx + m[2] * dy, m[1] * dx + m[3] * dy, m[4] + cBody * x - sBody * y, m[5] + sBody * x + cBody * y];
    const error = maxDelta(expected, part.matrix);
    metrics.worst.projectionError = Math.max(metrics.worst.projectionError, error);
    if (error > threshold) finding('ACTUAL_PIXI_PROJECTION', n.id, tick, error);
    if (part.surface !== (n.draw?.backAsset && dy < 0 ? n.draw.backAsset : n.draw?.asset ?? null)) {
      finding('SURFACE_BINDING', n.id, tick, part.surface);
    }
    if (before) {
      const projectedStep = dist(origin(part.matrix), origin(before[n.id].matrix));
      const physicalStep = dist(origin(m), origin(before[n.id].physicalMatrix));
      metrics.worst.projectedTranslationStep = Math.max(metrics.worst.projectedTranslationStep, projectedStep);
      metrics.worst.physicalTranslationStep = Math.max(metrics.worst.physicalTranslationStep, physicalStep);
      if (projectedStep > 6) finding('PROJECTED_STEP', n.id, tick, projectedStep);
    }
    if (section === 'transform' && tick === pre?.tick) {
      const delta = maxDelta(pre.render.parts[n.id].matrix, part.matrix);
      metrics.worst.commandMatrixDelta = Math.max(metrics.worst.commandMatrixDelta, delta);
      if (delta > threshold) finding('PROJECTED_COMMAND_JUMP', n.id, tick, delta);
    }
  }
  last.set(section, p);
  for (const { id, drive } of drives) {
    const m = p[id].physicalMatrix;
    const a = at(p[drive.pinA.part].physicalMatrix, drive.pinA.local);
    const b = at(p[drive.pinB.part].physicalMatrix, drive.pinB.local);
    const distance = dist(a, b);
    const unit = [(b[0] - a[0]) / distance, (b[1] - a[1]) / distance];
    const startGap = dist(origin(m), a), endGap = dist(origin(p[drive.sectionIds.at(-1)].physicalMatrix), b);
    metrics.worst.pinGap = Math.max(metrics.worst.pinGap, startGap, endGap);
    if (Math.max(startGap, endGap) > threshold || distance < drive.pinDistanceAllowed[0] - threshold || distance > drive.pinDistanceAllowed[1] + threshold) finding('ACTUATOR_PIN', id, tick, [startGap, endGap, distance]);
    const angleError = dist(unit, [m[0], m[1]]);
    metrics.worst.actuatorAxisError = Math.max(metrics.worst.actuatorAxisError, angleError);
    if (angleError > threshold) finding('ACTUATOR_AXIS', id, tick, angleError);
    let previous = drive.barrelLength;
    for (const [i, partId] of drive.sectionIds.entries()) {
      const o = origin(p[partId].physicalMatrix);
      const delta = [o[0] - a[0], o[1] - a[1]];
      const lateral = Math.abs(delta[0] * unit[1] - delta[1] * unit[0]);
      const reach = delta[0] * unit[0] + delta[1] * unit[1];
      const insertion = drive.sectionLengths[i] - (reach - previous);
      metrics.worst.minimumInsertion = Math.min(metrics.worst.minimumInsertion, insertion);
      if (lateral > threshold || insertion < drive.minimumInsertion - threshold) finding('ACTUATOR_INSERTION', partId, tick, [lateral, insertion]);
      previous = reach;
    }
  }
  for (const id of ['head.carriage.section1', 'head.carriage.section2']) {
    const m = p[nodes[id].parent].physicalMatrix;
    const [x, y] = origin(p[id].physicalMatrix);
    const dx = x - m[4], dy = y - m[5];
    const travel = dx * m[0] + dy * m[1];
    const cross = Math.abs(dx * m[1] - dy * m[0]);
    metrics.worst.minimumCarriageInsertion = Math.min(metrics.worst.minimumCarriageInsertion, nodes[id].length - travel);
    if (travel < -threshold || travel > 12 + threshold || cross > threshold) finding('CARRIAGE_STROKE', id, tick, [travel, cross]);
  }
  for (const leg of pose.legs) {
    const part = leg.stem + '.foot';
    const sample = at(p[part].physicalMatrix, [leg.sole.x, leg.sole.y]);
    const error = dist(sample, [leg.anchor.x, leg.anchor.y]);
    metrics.worst.soleGap = Math.max(metrics.worst.soleGap, error);
    if (!leg.planted || error > threshold) finding('SOLE_CONTACT', part, tick, error);
  }
  if (section === 'transform') {
    const height = -pose.shoulderInBody.y;
    const a = manifest.apertures.raptorial;
    if (height > a.gateFreeXY.y[0] && height < a.gateFreeXY.y[1]) {
      for (const id of ['bay.rapt.near.door', 'bay.rapt.far.door', 'shell.front', 'shell.rear']) {
        const angle = Math.abs(pose.parts[id].local.roll) * 180 / Math.PI;
        metrics.worst.minimumReleaseAngle = Math.min(metrics.worst.minimumReleaseAngle, angle);
        if (angle + threshold < 100) finding('RELEASE_GATE_CLEARANCE', id, tick, [height, angle]);
      }
    }
    for (const side of ['near', 'far']) {
      const arm = 'rapt.' + side;
      if (Math.abs(pose.motion[arm + '.femur.abs'] - a.holdPackedArmAbs[0]) > 1e-6) {
        metrics.worst.minimumShoulderFemur = Math.min(metrics.worst.minimumShoulderFemur, height);
        if (height < a.shoulderLocalYForFemur - .01) finding('FEMUR_RELEASE_HEIGHT', arm, tick, height);
      }
      if (Math.abs(pose.motion[arm + '.tibia.relative'] - a.holdPackedArmAbs[1]) > 1e-6) {
        metrics.worst.minimumShoulderBlade = Math.min(metrics.worst.minimumShoulderBlade, height);
        if (height < a.shoulderLocalYForBlade - .01) finding('BLADE_RELEASE_HEIGHT', arm, tick, height);
      }
    }
  }
}

export function frame(raw, section) {
  if (section === 'preAction') pre = raw;
  auditFrame(raw, section);
  const actual = raw.pose.parts;
  const channels = section === 'transform'
    ? Object.fromEntries(Object.entries(raw.pose.motion).map(([id, value]) => [id, inUnits(id, value)]))
    : {
      'actual.body.y': raw.pose.body.y, 'actual.eye.brow': actual['eye.brow'].local.rotation,
      'actual.head.carriage.section2': actual['head.carriage.section2'].local.x,
      'actual.rapt.near.tibia': actual['rapt.near.tibia'].local.rotation
    };
  const planted = raw.pose.legs.filter(l => l.planted).map(l => l.stem + '.foot@' + (l.sole.x < 0 ? 'heel' : 'toe'));
  want(planted.length === raw.planted.length && planted.every(id => raw.planted.includes(id.split('@')[0])), 'Model and renderer support trace disagree');
  return { tick: raw.tick, state: raw.phase === 'transforming' ? 'transform' : raw.phase, phase: raw.phase, events: raw.events, channels, planted,
    parts: Object.fromEntries(Object.entries(raw.render.parts).map(([id, p]) => [id, { token: p.token, asset: p.asset, parent: p.parent ?? null, matrix: p.physicalMatrix, projected: p.matrix, surface: p.surface }])) };
}

export const keyTicks = raw => raw.find(x => x.keyTicks)?.keyTicks;
export const audit = () => metrics;
