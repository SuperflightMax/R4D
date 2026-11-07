import fullRig from '../assets/rig/FULL_RIG_V1.json' with { type: 'json' };
import { FOOT_CONTACTS, INTRO_PROFILES, beatAt, clamp, curveAt, introProgress, mix, rad, windowed } from './motion.js';
import { walkSole } from './locomotion.js';
export { TRANSFORM_DURATION, clamp, mix, smooth, windowed } from './motion.js';

export const BODY_ORIGIN = 87;
export const LANDING_Y = -82;
export const SOLE_DROP = 2;
export const FULL_RIG = fullRig;
export const RELEASE = fullRig.apertures.raptorial;
export const RIG_PARTS = Object.freeze(fullRig.nodes.map(part => Object.freeze(part)));
const partSpecs = new Map(RIG_PARTS.map(part => [part.id, part]));
const BLADE_LENGTH = partSpecs.get('rapt.near.tibia').length;
const CAPTURE = Object.fromEntries(fullRig.stageDInterfaces.capture.map(c => [c.side, c]));
const WALK_ALIGN = .86;
const WALK_LOWER = .17;
const WALK_CLEARANCE = 9;

// Wall-clock seconds and matching path seconds from each femur's release.
// Spend more time across the steep part of the lower-bay turn, then regain
// time in the shallow approach. Both clocks meet before the vertical drop.
const WALK_SWEEP_TIMING = [
  [0, 0], [.009, .042], [.097, .112], [.146, .169], [.344, .315],
  [.406, .370], [.429, .386], [.463, .397], [.484, .413], [.542, .460],
  [.623, .556], [.693, .691], [.728, .741], [.835, .826], [WALK_ALIGN, WALK_ALIGN],
];
const WALK_SWEEP_PACES = WALK_SWEEP_TIMING.slice(1).map(([at, path], i) => {
  const [before, beforePath] = WALK_SWEEP_TIMING[i];
  return (path - beforePath) / (at - before);
});

function walkSweepTime(time, start) {
  const elapsed = time - start;
  if (elapsed <= 0 || elapsed >= WALK_ALIGN) return time;
  const i = WALK_SWEEP_TIMING.findIndex(([at]) => at > elapsed) - 1;
  const [from, fromPath] = WALK_SWEEP_TIMING[i];
  const [to, toPath] = WALK_SWEEP_TIMING[i + 1];
  const duration = to - from;
  const travel = toPath - fromPath;
  const pace = WALK_SWEEP_PACES[i];
  const entry = 2 / (1 / (WALK_SWEEP_PACES[i - 1] ?? pace) + 1 / pace);
  const exit = 2 / (1 / pace + 1 / (WALK_SWEEP_PACES[i + 1] ?? pace));
  const t = (elapsed - from) / duration;
  // A monotone Hermite segment matches the shared pace at each timing mark.
  return start + mix(fromPath, toPath, t) + t * (1 - t) *
    ((1 - t) * (duration * entry - travel) + t * (travel - duration * exit));
}

function stanceMotion(time, motion) {
  // Retain each drive's authored time and easing. Regear only the cleared end of the chest sweep.
  const lower = time >= 2.42 ? mix(115.8, motion['thorax.lower.abs'], (115.8 - 95) / (115.8 - 82)) : motion['thorax.lower.abs'];
  const upper = time >= 2.49 ? mix(64, motion['thorax.upper.abs'], (68 - 64) / (78 - 64)) : motion['thorax.upper.abs'];
  const spread = 44 * windowed(time, 2.49, 1.09, t => curveAt('upper', t));
  return {
    'thorax.lower.abs': lower,
    'thorax.upper.abs': upper,
    'rapt.far.femur.abs': motion['rapt.far.femur.abs'] + spread,
    // The far sickle opens outward on its side of the bent chest.
    'rapt.far.tibia.relative': 170 - .31 * (motion['rapt.far.tibia.relative'] - 170),
  };
}

export const LEG_SPECS = Object.freeze(Object.entries(FOOT_CONTACTS.contactX).map(([id, contact]) => {
  const stem = 'walk.' + id;
  const [hipX, hipY] = partSpecs.get(stem + '.hip_fork').pivot;
  return Object.freeze({ id, stem, side: Math.sign(hipX), hip: { x: hipX, y: BODY_ORIGIN + hipY },
    footX: contact.x, outward: id.endsWith('.far') ? -1 : 1, upper: partSpecs.get(stem + '.femur').length,
    lower: partSpecs.get(stem + '.tibia').length, intro: INTRO_PROFILES.legs[id] });
}));

const WALK_LOAD_START = Math.max(...LEG_SPECS.map(leg => leg.intro.femur.start)) + WALK_ALIGN + WALK_LOWER + .06;

export function walkoutLift(time) {
  return 35 * windowed(time, WALK_LOAD_START, 2.15 - WALK_LOAD_START);
}

export function toWorld(point, root) {
  const c = Math.cos(root.rotation), s = Math.sin(root.rotation);
  const x = root.x + c * point.x - s * point.y;
  const dy = s * point.x + c * point.y;
  if (root.tilt) return { x, y: root.y + dy * Math.cos(root.tilt), depth: root.depth + dy * Math.sin(root.tilt) };
  const y = root.y + dy;
  return root.depth ? { x, y, depth: root.depth } : { x, y };
}

function toLocal(point, root) {
  return toWorld({ x: point.x - root.x, y: point.y - root.y }, { x: 0, y: 0, rotation: -root.rotation });
}

function solveLeg(leg, body, legTime, motion, idle, walk) {
  const rollChannel = leg.stem + '.foot.roll';
  const idleRoll = idle[rollChannel] || 0;
  const rawRoll = motion[rollChannel] + (walk ? mix(idleRoll, walk.rolls[rollChannel] || 0, walk.rollLock) : idleRoll);
  const footAngle = -rad(rawRoll);
  // Switching heel/toe at zero angle preserves the same flat shoe pose.
  const sole = { x: rawRoll >= 0 ? -6 : 6, y: SOLE_DROP };
  const stride = walk ? walkSole(walk, leg.id) : { offset: 0, lift: 0 };
  const anchor = { x: leg.footX + sole.x + stride.offset, y: -stride.lift };
  const soleOffset = toWorld(sole, { x: 0, y: 0, rotation: footAngle });
  const { femur, tibia, foot } = leg.intro;
  const descent = introProgress({ ...foot, start: femur.start + WALK_ALIGN, duration: WALK_LOWER }, legTime);
  const landing = toLocal({ x: anchor.x - soleOffset.x, y: anchor.y - soleOffset.y - WALK_CLEARANCE * (1 - descent) }, body);
  const dx = leg.side * (landing.x - leg.hip.x);
  const dy = landing.y - leg.hip.y;
  const distance = Math.hypot(dx, dy);
  const upperOpen = Math.atan2(dy, dx) - Math.acos(clamp(
    (leg.upper ** 2 + distance ** 2 - leg.lower ** 2) / (2 * leg.upper * distance), -1, 1,
  ));
  const lowerOpen = upperOpen + Math.acos(clamp(
    (distance ** 2 - leg.upper ** 2 - leg.lower ** 2) / (2 * leg.upper * leg.lower), -1, 1,
  ));
  const sweepTime = walkSweepTime(legTime, femur.start);
  const sweep = introProgress({ ...femur, duration: .66 }, sweepTime);
  const extend = introProgress(tibia, sweepTime);
  const align = introProgress({ ...foot, start: femur.start + .34, duration: WALK_ALIGN - .34 }, sweepTime);
  const upperAngle = mix(mix(Math.PI, -.35, sweep), upperOpen, align);
  const lowerAngle = upperAngle + mix(Math.PI, lowerOpen - upperOpen, Math.max(extend, align));

  // Turn the knee plane out through its own lower bay. The shoe stays level,
  // and the plane is back in XY before the shoe lowers vertically at its seat.
  const hip = toWorld(leg.hip, body);
  const kneeDrop = leg.upper * Math.sin(upperAngle + leg.side * body.rotation);
  const ankleDrop = kneeDrop + leg.lower * Math.sin(lowerAngle + leg.side * body.rotation);
  const floorRoom = -hip.y - soleOffset.y;
  // Receding depth moves a far sole down in the picture. Reserve that space as well.
  const depthDrop = Math.max(0, fullRig.coordinates.projection.yPerZ * leg.outward * ankleDrop);
  const kneeRatio = kneeDrop / ((floorRoom - 3) * .65);
  const ankleRatio = ankleDrop / (Math.max(1, floorRoom - 5 - depthDrop) * .65);
  const tilt = align === 1 ? 0 : leg.outward * Math.atan(Math.max(0, Math.max(kneeRatio, ankleRatio) - 1));
  return { ...leg, upperAngle, lowerAngle, footAngle, sole, anchor, shoulderProgress: sweep,
    kneeProgress: extend, tilt, planted: descent === 1 && stride.lift < 1e-9 };
}

export function solveRig({ body, legTime, eyeTime, transformTime, regulatorAngle, motion, idle, gaze, walk, strike, trackingMoth, headGaze }) {
  const stance = stanceMotion(transformTime, motion);
  const overrides = new Map();
  const relative = (id, angle) => overrides.set(id, { rotation: -rad(angle) });
  const absolute = (id, angle) => overrides.set(id, { absolute: -rad(angle) });
  const roll = (id, angle) => overrides.set(id, { roll: rad(angle) * partSpecs.get(id).rollSignScreen });
  const stroke = (id, x) => overrides.set(id, { dx: clamp(x, 0, 12) });
  const track = id => (stance[id] ?? motion[id]) + (idle[id] || 0);

  for (const id of ['shell.rear', 'shell.front', 'bay.rapt.far.door', 'bay.rapt.near.door']) {
    roll(id, track(id + '.open'));
  }
  for (const side of ['far', 'near']) {
    const bay = 'bay.rapt.' + side + '.catch';
    const arm = 'rapt.' + side;
    relative(bay, track(bay + '.open'));
    let shoulder = track(arm + '.femur.abs');
    let claw = track(arm + '.tibia.relative');
    if (strike) {
      const near = side === 'near';
      const { wind, reach, close = 0 } = strike;
      if (strike.side === side) {
        shoulder += near ? -14 * wind + 19 * reach : 14 * wind + 7 * reach;
        claw += near ? -13 * wind + 14 * reach - 6 * close : 14 * wind - 34 * reach + 7 * close;
      } else {
        shoulder += (near ? -1 : 1) * (3 * wind + 8 * reach);
        claw += (near ? -1 : 1) * (4 * wind + 6 * reach + 3 * close);
      }
    }
    absolute(arm + '.femur', shoulder);
    relative(arm + '.tibia', claw);
    relative(arm + '.latch', track(arm + '.latch.open'));
  }
  absolute('thorax.lower', track('thorax.lower.abs'));
  absolute('thorax.upper', track('thorax.upper.abs'));

  const exit = INTRO_PROFILES.eyeExit;
  const eyeGate = introProgress(exit.hatch, eyeTime);
  const headTurn = introProgress(exit.headTurn, eyeTime);
  const gimbal = introProgress(exit.gimbal, eyeTime);
  roll('eye.front_hatch', eyeGate * track('eye.front_hatch.open'));
  const rail = track('head.carriage.sleeve.abs');
  absolute('head.carriage.sleeve', rail);
  const slide1 = introProgress(exit.carriage1, eyeTime) * track('head.carriage.section1.stroke');
  const slide2 = introProgress(exit.carriage2, eyeTime) * track('head.carriage.section2.stroke');
  stroke('head.carriage.section1', slide1);
  stroke('head.carriage.section2', slide2);
  const lower = -rad(track('thorax.lower.abs'));
  const upper = -rad(track('thorax.upper.abs'));
  const lowerSpec = partSpecs.get('thorax.lower');
  const upperLength = partSpecs.get('thorax.upper').length;
  const neutral = toWorld({
    x: lowerSpec.pivot[0] + lowerSpec.length * Math.cos(lower) + upperLength * Math.cos(upper)
      + (slide1 + slide2) * Math.cos(rad(rail)) + 12,
    y: BODY_ORIGIN + lowerSpec.pivot[1] + lowerSpec.length * Math.sin(lower) + upperLength * Math.sin(upper)
      - (slide1 + slide2) * Math.sin(rad(rail)) + 6,
  }, body);
  const gazeX = clamp((gaze.x - neutral.x) / 230, -1, 1);
  const gazeY = clamp((gaze.y - neutral.y) / 230, -1, 1);
  const aim = gimbal * (gazeX * 14 + track('eye.gimbal.aim'));
  const headX = clamp((headGaze.x - neutral.x) / 230, -1, 1);
  const headY = clamp((headGaze.y - neutral.y) / 230, -1, 1);
  const headAim = gimbal * mix(5 * gazeY, 8 * headX + 12 * headY, trackingMoth);
  absolute('head.chassis', -25 * (1 - headTurn) + track('head.chassis.abs') + headAim);
  relative('eye.gimbal', .38 * aim);
  overrides.set('eye.pupil', { dx: clamp(aim * .17, -2.4, 2.4), dy: gazeY * gimbal * 1.35 });
  relative('eye.brow', mix(-4, track('eye.brow.angle'), introProgress(exit.brow, eyeTime)));
  const aperture = clamp(track('eye.iris.open'), .4, 1);
  for (let i = 1; i <= 6; i++) {
    const id = 'eye.iris.leaf.' + i;
    const [x, y] = partSpecs.get(id).pivot;
    overrides.set(id, { rotation: Math.atan2(y, x) + Math.PI + rad(84 * aperture) });
  }
  overrides.set('shell.regulator', { rotation: regulatorAngle });

  const solved = LEG_SPECS.map(leg => {
    const pose = solveLeg(leg, body, legTime, motion, idle, walk);
    const side = leg.side;
    const mirror = angle => side > 0 ? angle : Math.PI - angle;
    const upper = mirror(pose.upperAngle), lower = mirror(pose.lowerAngle);
    overrides.set(leg.stem + '.femur', { absolute: upper });
    overrides.set(leg.stem + '.tibia', { absolute: lower });
    overrides.set(leg.stem + '.foot', { worldRotation: pose.footAngle });
    roll('bay.' + leg.stem + '.door', introProgress(leg.intro.door, legTime) * fullRig.apertures.walk.sideRollMagnitude);
    return pose;
  });

  const parts = Object.create(null);
  const root = { ...toWorld({ x: 0, y: BODY_ORIGIN }, body), rotation: body.rotation };
  for (const node of RIG_PARTS) {
    const parent = parts[node.parent];
    const joint = overrides.get(node.id) || {};
    let x = node.pivot[0] + (joint.dx || 0);
    const y = node.pivot[1] + (joint.dy || 0);
    const parentDrive = partSpecs.get(node.parent)?.drive;
    if (parentDrive) {
      const index = parentDrive.sectionIds.indexOf(node.id);
      if (index >= 0) {
        const capacities = parentDrive.sectionLengths.map(length => length - parentDrive.minimumInsertion);
        const total = capacities.reduce((sum, travel) => sum + travel, 0);
        const reach = capacities.slice(0, index + 1).reduce((sum, travel) => sum + travel, 0);
        x = parentDrive.barrelLength + (parent.pinDistance - parentDrive.barrelLength) * reach / total;
      }
    }
    const position = parent ? toWorld({ x, y }, parent.world) : root;
    let rotation = joint.rotation || 0;
    let pinDistance;
    if (joint.absolute !== undefined) rotation = body.rotation + joint.absolute - parent.world.rotation;
    if (joint.worldRotation !== undefined) rotation = joint.worldRotation - parent.world.rotation;
    if (node.drive) {
      const { part, local } = node.drive.pinB;
      const pin = toWorld({ x: local[0], y: local[1] }, parts[part].world);
      rotation = Math.atan2(pin.y - position.y, pin.x - position.x) - parent.world.rotation;
      pinDistance = Math.hypot(pin.x - position.x, pin.y - position.y);
    }
    const z = node.artDepth;
    parts[node.id] = {
      id: node.id, parent: node.parent, length: node.length, pinDistance,
      local: { x, y, rotation, roll: joint.roll || 0 },
      world: { x: position.x, y: position.y, rotation: parent ? parent.world.rotation + rotation : root.rotation, z },
    };
  }

  for (const leg of solved) {
    if (!leg.tilt) continue;
    const hip = parts[leg.stem + '.hip_fork'].world;
    for (const suffix of ['femur', 'tibia', 'foot', 'piston.sleeve', 'piston.inner', 'piston.rod', 'knee.cap', 'ankle.cap']) {
      const world = parts[leg.stem + '.' + suffix].world;
      const dy = world.y - hip.y;
      world.y = hip.y + dy * Math.cos(leg.tilt);
      world.depth = dy * Math.sin(leg.tilt);
      if (suffix !== 'foot' && suffix !== 'ankle.cap') world.tilt = leg.tilt;
    }
  }

  const legs = solved.map(leg => {
    const hip = parts[leg.stem + '.femur'].world;
    const knee = parts[leg.stem + '.tibia'].world;
    const ankle = parts[leg.stem + '.foot'].world;
    const foot = toWorld(leg.sole, ankle);
    return { ...leg, world: { hip, knee, ankle, foot } };
  });
  const arms = ['far', 'near'].map(side => {
    const id = 'rapt.' + side;
    const shoulder = parts[id + '.femur'].world;
    const elbow = parts[id + '.tibia'].world;
    const [x, y] = CAPTURE[side].contactSeat;
    const { xPerZ, yPerZ } = fullRig.coordinates.projection;
    const seat = toWorld({ x, y }, elbow);
    const contact = toWorld({ x: xPerZ * elbow.z, y: yPerZ * elbow.z }, { ...seat, rotation: body.rotation });
    return { id, side, shoulder, elbow, contact, tip: toWorld({ x: BLADE_LENGTH, y: 0 }, elbow) };
  });
  const lens = parts['eye.lens'].world;
  return {
    parts, legs, arms, stance, beat: beatAt(transformTime),
    eye: { id: 'eye.lens', parent: 'eye.barrel', ...lens, extension: (slide1 + slide2) / 24,
      stroke: slide1 + slide2, gazeX, gazeY, aperture },
    shoulderInBody: toLocal(arms[0].shoulder, root),
    lid: { angle: parts['eye.front_hatch'].local.roll },
    hatches: legs.map(leg => ({ id: 'bay.' + leg.stem + '.door', angle: parts['bay.' + leg.stem + '.door'].local.roll })),
  };
}
