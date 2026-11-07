import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, resolve } from 'node:path';
import { gunzipSync } from 'node:zlib';

const sha = '3be9dbf11e7a07a2678c3be161e54fd24aa7f893';
const run = resolve(process.argv[2] ?? '');
const read = name => JSON.parse(readFileSync(join(run, name), 'utf8'));
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const buildSha256 = digest(readFileSync(join(run, 'build-manifest.json')));
const rig = read('tree/experiments/q3c-victorian-mantis/assets/rig/FULL_RIG_V1.json');
const nodes = Object.fromEntries(rig.nodes.map(node => [node.id, node]));
const findings = new Map();
const flag = (code, id, tick, details) => {
  const key = code + '/' + id;
  if (!findings.has(key)) findings.set(key, { code, id, tick, details });
};
function raw(name) {
  const bytes = readFileSync(join(run, 'evidence', name));
  const data = JSON.parse(gunzipSync(bytes).toString('utf8'));
  if (data.sha !== sha || data.buildSha256 !== buildSha256 || data.seed !== 42 || data.hz !== 120) {
    throw new Error('Wrong raw capture: ' + name);
  }
  return { data, sha256: digest(bytes) };
}
const at = (m, [x, y] = [0, 0]) => [m[4] + m[0] * x + m[2] * y, m[5] + m[1] * x + m[3] * y];
const d = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const angle = m => Math.atan2(m[1], m[0]);
const angleDelta = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
const deg = r => r * 180 / Math.PI;
const tol = 1e-6;
const soleContour = [[-6, 2], [6, 2], [5.87, -2.18], [4.65, -5.5], [3.05, -7.6], [-2.7, -7.7], [-5.88, -0.7]];
const local = (m, [x, y]) => [
  m[0] * (x - m[4]) + m[1] * (y - m[5]),
  m[2] * (x - m[4]) + m[3] * (y - m[5])
];
const introduction = raw('raw-intro.json.gz');
const intro = introduction.data;
if (intro.frames.length !== 409 || intro.frames[0].tick !== 282 || intro.frames.at(-1).tick !== 690 ||
    Object.keys(intro.definition).length !== 98 || intro.identityFlags.length) {
  flag('INTRO_COVERAGE', 'intro', 282, { samples: intro.frames.length, identities: intro.identityFlags });
}
const legIds = ['rear.far', 'front.far', 'rear.near', 'front.near'];
const stats = Object.fromEntries(legIds.map(id => [id, {
  lengthError: 0, floorPenetration: 0, plantedGap: 0, packedBayMargin: Infinity,
  maxJointStep: 0, maxAngleStep: 0, firstContactTick: null, firstSeatTick: null, exit: null
}]));
const introMax = { partStep: 0, projectedStep: 0, angleStep: 0, pistonPinGap: 0, pistonRangeViolation: 0 };
let previous;
for (const [index, f] of intro.frames.entries()) {
  if (f.tick !== 282 + index) throw new Error('Dropped intro tick');
  const m = id => f.parts[id].physicalMatrix;
  const root = m('cradle');
  for (const [id, p] of Object.entries(f.parts)) {
    if (previous) {
      const prior = previous.parts[id];
      const step = d(at(p.physicalMatrix), at(prior.physicalMatrix));
      const projected = d(at(p.matrix), at(prior.matrix));
      const turn = angleDelta(angle(p.physicalMatrix), angle(prior.physicalMatrix));
      introMax.partStep = Math.max(introMax.partStep, step);
      introMax.projectedStep = Math.max(introMax.projectedStep, projected);
      introMax.angleStep = Math.max(introMax.angleStep, turn);
      if (Math.max(step, projected) > 6 + tol || turn > .25 + tol) flag('INTRO_POP', id, f.tick, { step, projected, turn });
    }
    const drive = nodes[id].drive;
    if (drive) {
      const a = at(m(drive.pinA.part), drive.pinA.local), b = at(m(drive.pinB.part), drive.pinB.local);
      const gap = Math.max(d(at(m(id)), a), d(at(m(drive.sectionIds.at(-1))), b));
      const distance = d(a, b);
      introMax.pistonPinGap = Math.max(introMax.pistonPinGap, gap);
      introMax.pistonRangeViolation = Math.max(introMax.pistonRangeViolation, drive.pinDistanceAllowed[0] - distance, distance - drive.pinDistanceAllowed[1]);
      if (gap > tol || distance < drive.pinDistanceAllowed[0] - tol || distance > drive.pinDistanceAllowed[1] + tol) {
        flag('INTRO_PISTON', id, f.tick, { gap, distance, allowed: drive.pinDistanceAllowed });
      }
    }
  }
  for (const leg of f.legs) {
    const stat = stats[leg.id], stem = 'walk.' + leg.id;
    const femur = stem + '.femur', tibia = stem + '.tibia', foot = stem + '.foot';
    const hip = at(m(femur)), knee = at(m(tibia)), ankle = at(m(foot));
    const lengthError = Math.max(d(at(m(femur), [nodes[femur].length, 0]), knee), d(at(m(tibia), [nodes[tibia].length, 0]), ankle));
    stat.lengthError = Math.max(stat.lengthError, lengthError);
    if (lengthError > tol) flag('INTRO_LINK', leg.id, f.tick, lengthError);
    if (previous) {
      stat.maxJointStep = Math.max(stat.maxJointStep, d(hip, at(previous.parts[femur].physicalMatrix)),
        d(knee, at(previous.parts[tibia].physicalMatrix)), d(ankle, at(previous.parts[foot].physicalMatrix)));
      stat.maxAngleStep = Math.max(stat.maxAngleStep, ...[femur, tibia, foot].map(id =>
        angleDelta(angle(m(id)), angle(previous.parts[id].physicalMatrix))));
    }
    const footFloor = Math.max(...soleContour.map(p => at(m(foot), p)[1]));
    const floor = Math.max(footFloor, hip[1], knee[1], ankle[1]);
    stat.floorPenetration = Math.max(stat.floorPenetration, floor);
    if (floor > tol) flag('INTRO_FLOOR', leg.id, f.tick, floor);
    if (Math.abs(footFloor) <= tol) stat.firstContactTick ??= f.tick;
    if (leg.planted !== f.planted.includes(foot)) flag('INTRO_CONTACT_TRACE', leg.id, f.tick, f.planted);
    if (leg.planted) {
      stat.firstSeatTick ??= f.tick;
      const gap = d(at(m(foot), [leg.sole.x, leg.sole.y]), [leg.anchor.x, 0]);
      stat.plantedGap = Math.max(stat.plantedGap, gap);
      if (gap > tol) flag('INTRO_SEAT', leg.id, f.tick, gap);
    } else if (stat.firstSeatTick !== null) flag('INTRO_LOST_SEAT', leg.id, f.tick, f.planted);
    const [x, y] = local(root, knee);
    const [left, right] = rig.apertures.walk.bodyOpeningsXYUp[leg.id.split('.')[0]][0];
    const margin = Math.min(x - left, right - x);
    if (!stat.exit) {
      stat.packedBayMargin = Math.min(stat.packedBayMargin, margin);
      if (margin < -tol) flag('INTRO_BAY_ALIGNMENT', leg.id, f.tick, { x, y, left, right });
      if (y >= 0) {
        const door = 'bay.' + stem + '.door';
        const opening = Math.abs(deg(f.parts[door].roll));
        stat.exit = { tick: f.tick, seconds: f.tick / intro.hz, x, y, margin, opening };
        if (opening < rig.apertures.walk.sideRollMagnitude - tol) flag('INTRO_CLOSED_GATE', leg.id, f.tick, { door, opening });
      }
    }
  }
  previous = f;
}
const exits = legIds.map(id => stats[id].exit?.tick);
if (exits.some((tick, i) => !tick || i && tick - exits[i - 1] < 12) || intro.frames.at(-1).planted.length !== 4) {
  flag('INTRO_EXIT_ORDER', 'four legs', 282, { exits, final: intro.frames.at(-1).planted });
}

function closestOnSegment(point, a, b) {
  const dx = b[0] - a[0], dy = b[1] - a[1];
  const t = Math.max(0, Math.min(1, ((point[0] - a[0]) * dx + (point[1] - a[1]) * dy) / (dx * dx + dy * dy)));
  return d(point, [a[0] + t * dx, a[1] + t * dy]);
}
const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
function segments(a, b, c, e) {
  if (cross(a, b, c) * cross(a, b, e) < 0 && cross(c, e, a) * cross(c, e, b) < 0) return 0;
  return Math.min(closestOnSegment(a, c, e), closestOnSegment(b, c, e),
    closestOnSegment(c, a, b), closestOnSegment(e, a, b));
}
const capture = rig.stageDInterfaces.capture;
const separation = [];
for (const tag of ['seed42-a', 'seed42-b']) {
  const transition = raw('raw-' + tag + '-transform.json.gz');
  const idle = raw('raw-' + tag + '-mantisIdle.json.gz');
  const keys = transition.data.frames[0].keyTicks;
  const samples = [...transition.data.frames.filter(f => f.tick >= keys.K4), ...idle.data.frames.slice(1)];
  const summary = { tag, samples: samples.length, firstTick: samples[0].tick, lastTick: samples.at(-1).tick,
    transitionSha256: transition.sha256, idleSha256: idle.sha256,
    minHinge: Infinity, minMiddle: Infinity, minTip: Infinity, minBladeAxisGap: Infinity,
    minUpperRelativeDeg: Infinity, maxBladePivotError: 0, K5: null };
  for (const f of samples) {
    const projected = capture.map(({ blade, tip }) => {
      const m = f.render.parts[blade].matrix;
      return [at(m), at(m, tip.map(v => .5 * v)), at(m, tip)];
    });
    const [hinge, middle, tip] = projected[0].map((p, i) => d(p, projected[1][i]));
    const axisGap = segments(projected[0][0], projected[0][2], projected[1][0], projected[1][2]);
    const upper = f.render.parts['thorax.upper'].physicalMatrix, lower = f.render.parts['thorax.lower'].physicalMatrix;
    const bend = deg(angleDelta(angle(upper), angle(lower)));
    const pivot = Math.max(...capture.map(({ blade, opposingFemur }) => {
      const a = f.render.parts[opposingFemur].physicalMatrix;
      return d(at(a, [nodes[opposingFemur].length, 0]), at(f.render.parts[blade].physicalMatrix));
    }));
    summary.minHinge = Math.min(summary.minHinge, hinge);
    summary.minMiddle = Math.min(summary.minMiddle, middle);
    summary.minTip = Math.min(summary.minTip, tip);
    summary.minBladeAxisGap = Math.min(summary.minBladeAxisGap, axisGap);
    summary.minUpperRelativeDeg = Math.min(summary.minUpperRelativeDeg, bend);
    summary.maxBladePivotError = Math.max(summary.maxBladePivotError, pivot);
    if (hinge <= 48 || middle <= 58 || tip <= 70 || axisGap <= 0 || bend < 24 - tol || pivot > tol) {
      flag('STANCE_SEPARATION', tag, f.tick, { hinge, middle, tip, axisGap, bend, pivot });
    }
    if (f.tick === keys.K5) {
      summary.K5 = { tick: f.tick, stance: f.pose.stance, hinge, middle, tip, axisGap, bend };
    }
  }
  separation.push(summary);
}
console.log(JSON.stringify({ sha, buildSha256, intro: { sha256: introduction.sha256, samples: intro.frames.length,
  stableNodes: Object.keys(intro.definition).length, stats, max: introMax }, separation, findings: [...findings.values()] }, null, 2));
if (findings.size) process.exitCode = 3;
