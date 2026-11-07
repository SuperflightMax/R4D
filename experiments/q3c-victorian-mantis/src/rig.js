import fullRig from '../assets/rig/FULL_RIG_V1.json' with { type: 'json' };
import { FOOT_CONTACTS, INTRO_PROFILES, beatAt, clamp, introProgress, mix, rad } from './motion.js';
export { TRANSFORM_DURATION, clamp, mix, smooth, windowed } from './motion.js';

export const BODY_ORIGIN = 87;
export const LANDING_Y = -82;
export const SOLE_DROP = 2;
export const FULL_RIG = fullRig;
export const RELEASE = fullRig.apertures.raptorial;
export const RIG_PARTS = Object.freeze(fullRig.nodes.map(part => Object.freeze(part)));
const partSpecs = new Map(RIG_PARTS.map(part => [part.id, part]));
const BLADE_LENGTH = partSpecs.get('rapt.near.tibia').length;

export const LEG_SPECS = Object.freeze(Object.entries(FOOT_CONTACTS.contactX).map(([id, contact]) => {
  const stem = 'walk.' + id;
  const [hipX, hipY] = partSpecs.get(stem + '.hip_fork').pivot;
  return Object.freeze({ id, stem, side: Math.sign(hipX), hip: { x: hipX, y: BODY_ORIGIN + hipY },
    footX: contact.x, upper: partSpecs.get(stem + '.femur').length,
    lower: partSpecs.get(stem + '.tibia').length, intro: INTRO_PROFILES.legs[id] });
}));

export function toWorld(point, root) {
  const c = Math.cos(root.rotation), s = Math.sin(root.rotation);
  return { x: root.x + c * point.x - s * point.y, y: root.y + s * point.x + c * point.y };
}

function toLocal(point, root) {
  return toWorld({ x: point.x - root.x, y: point.y - root.y }, { x: 0, y: 0, rotation: -root.rotation });
}

function solveLeg(leg, body, legTime, motion, idle) {
  const rollChannel = leg.stem + '.foot.roll';
  const rawRoll = motion[rollChannel] + (idle[rollChannel] || 0);
  const footAngle = -rad(rawRoll);
  // Switching heel/toe at zero angle preserves the same flat shoe pose.
  const sole = { x: rawRoll >= 0 ? -6 : 6, y: SOLE_DROP };
  const anchor = { x: leg.footX + sole.x, y: 0 };
  const soleOffset = toWorld(sole, { x: 0, y: 0, rotation: footAngle });
  const landing = toLocal({ x: anchor.x - soleOffset.x, y: -soleOffset.y }, body);
  const dx = leg.side * (landing.x - leg.hip.x);
  const dy = landing.y - leg.hip.y;
  const distance = Math.hypot(dx, dy);
  const upperOpen = Math.atan2(dy, dx) - Math.acos(clamp(
    (leg.upper ** 2 + distance ** 2 - leg.lower ** 2) / (2 * leg.upper * distance), -1, 1,
  ));
  const lowerOpen = upperOpen + Math.acos(clamp(
    (distance ** 2 - leg.upper ** 2 - leg.lower ** 2) / (2 * leg.upper * leg.lower), -1, 1,
  ));
  const { femur, tibia, foot } = leg.intro;
  // Lift the knee inside its bay before extending the tibia toward the floor.
  const preload = introProgress({ ...femur, duration: tibia.start - femur.start }, legTime);
  const extend = introProgress(tibia, legTime);
  const place = introProgress({ ...foot, start: tibia.start + tibia.duration }, legTime);
  const upperAngle = mix(mix(-Math.PI, -2.15, preload), upperOpen, place);
  let lowerAngle = mix(1.08 * extend, lowerOpen, place);
  if (place < 1) {
    const knee = toWorld({ x: leg.hip.x + leg.side * leg.upper * Math.cos(upperAngle),
      y: leg.hip.y + leg.upper * Math.sin(upperAngle) }, body);
    const floorSlope = clamp((-soleOffset.y - knee.y) / leg.lower, -1, 1);
    const aimed = lowerAngle + leg.side * body.rotation;
    if (Math.sin(aimed) > floorSlope) {
      const contactAngle = Math.asin(floorSlope);
      lowerAngle = (Math.cos(aimed) >= 0 ? contactAngle : Math.PI - contactAngle) - leg.side * body.rotation;
    }
  }
  return { ...leg, upperAngle, lowerAngle, footAngle, sole, anchor, shoulderProgress: preload,
    kneeProgress: extend, planted: place === 1 };
}

export function solveRig({ body, legTime, eyeTime, transformTime, regulatorAngle, motion, idle, gaze }) {
  const overrides = new Map();
  const relative = (id, angle) => overrides.set(id, { rotation: -rad(angle) });
  const absolute = (id, angle) => overrides.set(id, { absolute: -rad(angle) });
  const roll = (id, angle) => overrides.set(id, { roll: rad(angle) * partSpecs.get(id).rollSignScreen });
  const stroke = (id, x) => overrides.set(id, { dx: clamp(x, 0, 12) });
  const track = id => motion[id] + (idle[id] || 0);

  for (const id of ['shell.rear', 'shell.front', 'bay.rapt.far.door', 'bay.rapt.near.door']) {
    roll(id, track(id + '.open'));
  }
  for (const side of ['far', 'near']) {
    const bay = 'bay.rapt.' + side + '.catch';
    const arm = 'rapt.' + side;
    relative(bay, track(bay + '.open'));
    absolute(arm + '.femur', track(arm + '.femur.abs'));
    relative(arm + '.tibia', track(arm + '.tibia.relative'));
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
  absolute('head.chassis', -25 * (1 - headTurn) + track('head.chassis.abs') + gazeY * gimbal * 5);
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
    const pose = solveLeg(leg, body, legTime, motion, idle);
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
    return { id, shoulder, elbow, tip: toWorld({ x: BLADE_LENGTH, y: 0 }, elbow) };
  });
  const lens = parts['eye.lens'].world;
  return {
    parts, legs, arms, beat: beatAt(transformTime),
    eye: { id: 'eye.lens', parent: 'eye.barrel', ...lens, extension: (slide1 + slide2) / 24,
      stroke: slide1 + slide2, gazeX, gazeY, aperture },
    shoulderInBody: toLocal(arms[0].shoulder, root),
    lid: { angle: parts['eye.front_hatch'].local.roll },
    hatches: legs.map(leg => ({ id: 'bay.' + leg.stem + '.door', angle: parts['bay.' + leg.stem + '.door'].local.roll })),
  };
}
