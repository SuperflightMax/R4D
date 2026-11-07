import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';

const sha = 'bffca72375cee40e8cd96bb19e47b60f7b95e5d9';
const baseline = '3be9dbf11e7a07a2678c3be161e54fd24aa7f893';
const run = resolve(process.argv[2] ?? '');
const previous = new URL('../correction-3be9dbf1/evidence/', import.meta.url);
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const buildSha256 = hash(readFileSync(join(run, 'build-manifest.json')));
const oldBuildSha256 = hash(readFileSync(new URL('build-manifest.json', previous)));
const rig = JSON.parse(readFileSync(join(run, 'tree/experiments/q3c-victorian-mantis/assets/rig/FULL_RIG_V1.json'), 'utf8'));
const nodes = Object.fromEntries(rig.nodes.map(n => [n.id, n]));
const { xPerZ, yPerZ } = rig.coordinates.projection;
const legIds = ['rear.far', 'front.far', 'rear.near', 'front.near'];
const contactTol = .01;
const liftTol = .02;
const numericTol = 1e-6;
const soleOutline = [[-6, 2], [6, 2], [5.87, -2.18], [4.65, -5.5], [3.05, -7.6], [-2.7, -7.7], [-5.88, -.7]];
const at = (m, [x, y] = [0, 0]) => [m[4] + m[0] * x + m[2] * y, m[5] + m[1] * x + m[3] * y];
const depth = p => p.world?.depth ?? 0;
const distance = (a, b) => Math.hypot(...a.map((n, i) => n - b[i]));
function at3(p, [x, y] = [0, 0]) {
  const { rotation = 0, tilt = 0 } = p.world ?? {};
  return [...at(p.physicalMatrix, [x, y]), depth(p) + Math.sin(tilt) * (Math.sin(rotation) * x + Math.cos(rotation) * y)];
}
function capture(file, expectedSha, expectedBuild) {
  const bytes = readFileSync(file);
  const rawSha256 = hash(bytes);
  const data = JSON.parse(gunzipSync(bytes).toString('utf8'));
  if (data.sha !== expectedSha || data.buildSha256 !== expectedBuild || data.seed !== 42 || data.hz !== 120 ||
      data.identityFlags.length || Object.keys(data.definition).length !== 98 || data.frames.length !== 409 ||
      data.frames.some((f, i) => f.tick !== 282 + i)) throw new Error('Wrong intro input ' + file);
  return { rawSha256, frames: data.frames };
}

function contactCheck(frames) {
  const findings = [];
  const flag = (code, id, tick, value) => findings.push({ code, id, tick, value });
  const soles = {};
  for (const id of legIds) {
    const stem = 'walk.' + id + '.foot';
    const samples = frames.map(f => {
      const leg = f.legs.find(l => l.id === id);
      const p = f.parts[stem], root = f.parts.cradle.physicalMatrix;
      const point = [leg.sole.x, leg.sole.y];
      const [x, y] = at(p.physicalMatrix, point);
      const projectedY = at(p.matrix, point)[1];
      const floorAtStaticDepth = (root[1] * xPerZ + root[3] * yPerZ) * nodes[stem].artDepth;
      return { tick: f.tick, x, y, projectedClearance: floorAtStaticDepth - projectedY,
        floor: Math.max(...soleOutline.map(v => at(p.physicalMatrix, v)[1])),
        seated: f.planted.includes(stem), anchorX: leg.anchor.x };
    });
    const targetX = samples.at(-1).anchorX;
    const align = samples[samples.findLastIndex(s => Math.abs(s.x - targetX) > contactTol) + 1];
    const contact = samples.find(s => s.floor >= -contactTol);
    const seated = samples.find(s => s.seated);
    if (!contact || !align || !seated) {
      flag('CONTACT_COVERAGE', id, frames.at(-1).tick, { contact, align, seated });
      continue;
    }
    const moves = samples.filter((s, i) => i && Math.abs(s.x - samples[i - 1].x) > contactTol);
    const movingClearance = Math.min(...moves.map(s => -s.y));
    const movingProjectedClearance = Math.min(...moves.map(s => s.projectedClearance));
    const floorPenetration = Math.max(0, ...samples.map(s => s.floor));
    const onFloor = samples.filter(s => s.tick >= contact.tick);
    const drift = Math.max(...onFloor.map(s => Math.abs(s.x - contact.x)));
    const floorDeviation = Math.max(...onFloor.map(s => Math.max(Math.abs(s.y), Math.abs(s.floor))));
    const finalErrorAtContact = Math.abs(contact.x - targetX);
    const replant = samples.filter(s => s.tick >= seated.tick && !s.seated).length;
    soles[id] = { targetX, alignTick: align.tick, firstContact: contact, seatTick: seated.tick,
      finalErrorAtContact, drift, floorDeviation, floorPenetration, replant, movingClearance, movingProjectedClearance };
    if (align.tick >= contact.tick || finalErrorAtContact > contactTol) flag('CONTACT_BEFORE_ALIGN', id, contact.tick, { alignTick: align.tick, finalErrorAtContact });
    if (drift > contactTol) flag('POST_CONTACT_SLIP', id, contact.tick, drift);
    if (floorDeviation > contactTol + numericTol || replant) flag('REPLANT', id, contact.tick, { floorDeviation, replant });
    if (floorPenetration > numericTol) flag('SOLE_PENETRATION', id, contact.tick, floorPenetration);
    if (Math.min(movingClearance, movingProjectedClearance) < 5) flag('SPREAD_CLEARANCE', id, contact.tick, { movingClearance, movingProjectedClearance });
  }
  const support = frames.find(f => f.planted.length === 4);
  const frameLift = f => -82 - (f.body?.y ?? (f.parts.cradle.physicalMatrix[5] - 87 * f.parts.cradle.physicalMatrix[3]));
  const firstLoad = frames.find(f => frameLift(f) > liftTol);
  const driveStart = frames.find(f => f.lift > numericTol);
  const beforeSupport = Math.max(...frames.filter(f => !support || f.tick < support.tick).map(frameLift));
  if (!support || !firstLoad || firstLoad.tick <= support.tick || beforeSupport > liftTol) {
    flag('LOAD_BEFORE_SUPPORT', 'cradle', firstLoad?.tick, { beforeSupport, support: support?.tick });
  }
  // Project the four nominal seats onto the ground XZ plane. Decorative layer
  // depth is used for the lanes, and dynamic tilt must already be zero.
  const polygon = ['rear.far', 'front.far', 'front.near', 'rear.near'].map(id => {
    const f = support?.parts['walk.' + id + '.foot'];
    return [soles[id]?.targetX, f?.world?.z ?? nodes['walk.' + id + '.foot'].artDepth];
  });
  const area = Math.abs(polygon.reduce((sum, p, i) => {
    const q = polygon[(i + 1) % polygon.length];
    return sum + p[0] * q[1] - p[1] * q[0];
  }, 0)) / 2;
  const rootX = support?.parts.cradle.physicalMatrix[4] ?? 0;
  const crosses = polygon.map((p, i) => {
    const q = polygon[(i + 1) % polygon.length];
    return (q[0] - p[0]) * -p[1] - (q[1] - p[1]) * (rootX - p[0]);
  });
  const containsRoot = crosses.every(n => n > 0) || crosses.every(n => n < 0);
  const lostSupport = frames.filter(f => support && f.tick >= support.tick && f.planted.length !== 4).length;
  const dynamicDepth = Math.max(...legIds.map(id => Math.abs(depth(support?.parts['walk.' + id + '.foot'] ?? {}))));
  if (!(area > 0) || !containsRoot || lostSupport || dynamicDepth > numericTol) {
    flag('SUPPORT_POLYGON', 'cradle', support?.tick, { polygon, area, containsRoot, lostSupport, dynamicDepth });
  }
  return { soles, firstAllInContactTick: Math.max(...Object.values(soles).map(s => s.firstContact.tick)),
    supportTick: support?.tick, nominalPolygonXZ: polygon, polygonArea: area, containsRoot, dynamicDepth,
    maxLiftBeforeSupport: beforeSupport, loadOverToleranceTick: firstLoad?.tick, loadDriveTick: driveStart?.tick ?? null,
    lostSupport, findings };
}

function inspectGeometry(frames) {
  const exits = {};
  const findings = new Map();
  const flag = (code, id, tick, detail) => {
    const key = code + '/' + id;
    if (!findings.has(key)) findings.set(key, { code, id, tick, detail });
  };
  const worst = { lengthError: 0, pivotGap: 0, actuatorGap: 0, actuatorRangeError: 0, physicalXYStep: 0,
    physical3DStep: 0, projectedStep: 0, angularStep: 0, projectionError: 0, tiltedFrames: 0 };
  const stepLimits = { physicalXYStep: 6, projectedStep: 6, angularStep: .25 };
  const worstAt = {};
  const overLimit = { physicalXYStep: 0, projectedStep: 0, angularStep: 0 };
  let previous;
  for (const f of frames) {
    const { parts, tick } = f;
    const root = parts.cradle.physicalMatrix;
    if (Object.values(parts).some(p => p.world?.tilt)) worst.tiltedFrames++;
    for (const [id, p] of Object.entries(parts)) {
      const world = p.world;
      const [cos, sin] = [Math.cos(world.rotation), Math.sin(world.rotation)];
      const z = world.z + depth(p);
      const [dx, dy] = [root[0] * xPerZ - root[1] * yPerZ, root[1] * xPerZ + root[0] * yPerZ];
      const h = Math.sin(world.tilt || 0);
      const v = Math.cos(world.tilt || 0);
      const planeX = xPerZ * Math.sin(p.roll), planeY = Math.cos(p.roll) + yPerZ * Math.sin(p.roll);
      const linear = world.tilt
        ? [cos + sin * dx * h, sin * (v + dy * h), -sin + cos * dx * h, cos * (v + dy * h)]
        : [cos, sin, cos * planeX - sin * planeY, sin * planeX + cos * planeY];
      const expected = [...linear, world.x + dx * z, world.y + dy * z];
      const residual = Math.max(...expected.map((n, i) => Math.abs(n - p.matrix[i])));
      worst.projectionError = Math.max(worst.projectionError, residual);
      if (Math.SQRT2 * residual * 246 * 1.52 > .01) flag('INTRO_PROJECTION', id, tick, residual);
      if (previous) {
        const q = previous.parts[id], delta = world.rotation - q.world.rotation;
        const tiltDelta = (world.tilt || 0) - (q.world.tilt || 0);
        const turn = 2 * Math.acos(Math.min(1, Math.abs(Math.cos(delta / 2) * Math.cos(tiltDelta / 2))));
        const xy = distance(at(p.physicalMatrix), at(q.physicalMatrix));
        const xyz = distance(at3(p), at3(q));
        const projected = distance(at(p.matrix), at(q.matrix));
        for (const [key, value] of Object.entries({physicalXYStep: xy, physical3DStep: xyz, projectedStep: projected, angularStep: turn})) {
          if (value > worst[key]) {
            worst[key] = value;
            worstAt[key] = { id, beforeTick: tick - 1, tick, value };
          }
          if (key in stepLimits && value > stepLimits[key] + numericTol) overLimit[key]++;
        }
        if (Math.max(xy, projected) > 6 + numericTol || turn > .25 + numericTol) {
          flag('INTRO_STEP_BUDGET', id, tick, { xy, xyz, projected, turn });
        }
      }
      const drive = nodes[id].drive;
      if (!drive) continue;
      const a = at3(parts[drive.pinA.part], drive.pinA.local);
      const b = at3(parts[drive.pinB.part], drive.pinB.local);
      const length = distance(a, b);
      const gap = Math.max(distance(at3(p), a), distance(at3(parts[drive.sectionIds.at(-1)]), b));
      const outside = Math.max(0, drive.pinDistanceAllowed[0] - length, length - drive.pinDistanceAllowed[1]);
      worst.actuatorGap = Math.max(worst.actuatorGap, gap);
      worst.actuatorRangeError = Math.max(worst.actuatorRangeError, outside);
      if (Math.max(gap, outside) > numericTol) flag('INTRO_ACTUATOR', id, tick, { gap, length, outside });
    }
    for (const id of legIds) {
      const stem = 'walk.' + id;
      const femur = stem + '.femur', tibia = stem + '.tibia', foot = stem + '.foot';
      const knee = parts[tibia];
      for (const [from, to] of [[femur, tibia], [tibia, foot]]) {
        const length = nodes[from].length;
        const gap = distance(at3(parts[from], [length, 0]), at3(parts[to]));
        const error = Math.abs(length - distance(at3(parts[from]), at3(parts[to])));
        worst.lengthError = Math.max(worst.lengthError, error);
        worst.pivotGap = Math.max(worst.pivotGap, gap);
        if (Math.max(gap, error) > numericTol) flag('INTRO_LINK', id, tick, { error, gap });
      }
      if (exits[id]) continue;
      const [x, y] = at(knee.physicalMatrix);
      const localX = root[0] * (x - root[4]) + root[1] * (y - root[5]);
      const localYUp = -(root[2] * (x - root[4]) + root[3] * (y - root[5]));
      const [xs, ys] = rig.apertures.walk.bodyOpeningsXYUp[id.split('.')[0]];
      const margin = Math.min(localX - xs[0], xs[1] - localX);
      const outward = depth(knee) * (id.endsWith('.far') ? -1 : 1);
      if (margin < -numericTol) flag('INTRO_BAY_ALIGNMENT', id, tick, { localX, margin });
      if (outward >= 8) {
        const door = Math.abs(parts['bay.' + stem + '.door'].roll * 180 / Math.PI);
        exits[id] = { tick, localX, localYUp, margin, outward, door };
        if (localYUp < ys[0] || localYUp > ys[1] || door < rig.apertures.walk.sideRollMagnitude - numericTol) {
          flag('INTRO_BAY_EXIT', id, tick, exits[id]);
        }
      }
    }
    previous = f;
  }
  const ticks = legIds.map(id => exits[id]?.tick);
  if (ticks.some((t, i) => !t || i && t - ticks[i - 1] < 12)) flag('INTRO_EXIT_ORDER', 'four legs', 282, ticks);
  return { exits, worst, worstAt, stepLimits, overLimit, findings: [...findings.values()] };
}

const current = capture(join(run, 'evidence/raw-intro.json.gz'), sha, buildSha256);
const old = capture(new URL('raw-intro.json.gz', previous), baseline, oldBuildSha256);
const contact = contactCheck(current.frames);
const negative = contactCheck(old.frames);
const geometry = inspectGeometry(current.frames);
const findings = [...contact.findings, ...geometry.findings];
for (const code of ['CONTACT_BEFORE_ALIGN', 'POST_CONTACT_SLIP', 'LOAD_BEFORE_SUPPORT']) {
  if (!negative.findings.some(f => f.code === code)) findings.push({ code: 'NEGATIVE_CONTROL_MISSED', expected: code });
}
console.log(JSON.stringify({ sha, buildSha256, samples: current.frames.length, rawSha256: current.rawSha256,
  limits: { contactTol, liftTol, numericTol, movingClearance: 5 }, contact, geometry,
  negativeControl: { sha: baseline, buildSha256: oldBuildSha256, rawSha256: old.rawSha256, ...negative }, findings }, null, 2));
if (findings.length) process.exitCode = 3;
