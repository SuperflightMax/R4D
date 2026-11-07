import { BODY_ORIGIN, LANDING_Y, solveRig, walkoutLift } from './rig.js';
import { TRANSFORM_DURATION, clamp, curveAt, mix, regulatorRotation, sampleIdle, sampleMotion, smooth, windowed } from './motion.js';
export { LEG_SPECS, TRANSFORM_DURATION, clamp, mix, toWorld } from './rig.js';

// World units: beacon at (0, 0), floor y = 0; negative y is above the floor.
export const DT = 1 / 120;
export const STAGES = Object.freeze([
  { name: 'beacon', duration: 0.4 },
  { name: 'falling', duration: 1.05 },
  { name: 'impact', duration: 0.9 },
  { name: 'legs', duration: 2.15 },
  { name: 'eye', duration: 1.25 },
  { name: 'capsule', duration: Infinity },
]);
export const INTRO_DURATION = STAGES.slice(0, -1).reduce((sum, stage) => sum + stage.duration, 0);

export function stageAt(time, active = true, transformAt = null) {
  if (!active) return { name: 'waiting', local: 0, start: 0 };
  if (transformAt !== null && time >= transformAt) {
    const end = transformAt + TRANSFORM_DURATION;
    if (time >= end - 1e-9) return { name: 'mantis', local: time - end, start: end };
    return { name: 'transforming', local: time - transformAt, start: transformAt };
  }
  let start = 0;
  for (const stage of STAGES) {
    if (time < start + stage.duration - 1e-9) return { name: stage.name, local: time - start, start };
    start += stage.duration;
  }
}

function stageStart(name) {
  let result = 0;
  for (const stage of STAGES) { if (stage.name === name) return result; result += stage.duration; }
}

export function samplePose(time, { active = true, gaze = { x: 100, y: -180 }, seed = 1, entryY = -780, transformAt = null } = {}) {
  const phase = stageAt(time, active, transformAt);
  const fallTime = time - stageStart('falling');
  const impactTime = time - stageStart('impact');
  const legTime = active ? time - stageStart('legs') : -1;
  const eyeTime = active ? time - stageStart('eye') : -1;
  const readyTime = Math.max(0, time - INTRO_DURATION);
  const transformTime = active && transformAt !== null ? time - transformAt : -1;
  const capsuleIdle = active ? smooth(readyTime / .6) * (1 - windowed(transformTime, 0, .24)) : 0;
  const mantisIdle = windowed(transformTime, TRANSFORM_DURATION - .12, .54, t => curveAt('servo', t));
  const seedPhase = (seed >>> 0) / 4294967296 * Math.PI * 2;
  const lift = walkoutLift(legTime);
  const body = { x: 0, y: entryY, rotation: -.12 };
  if (active && fallTime >= 0) {
    const p = clamp(fallTime / 1.05);
    body.y = mix(entryY, LANDING_Y, p * p);
    body.rotation = -.12 * (1 - p) + .045 * Math.sin(p * Math.PI);
  }
  if (active && impactTime >= 0) {
    const t = Math.min(impactTime, .9);
    body.y = LANDING_Y - 19 * Math.exp(-8 * t) * Math.sin(19 * t) ** 2 - lift;
    body.rotation = .045 * Math.exp(-9 * t) * Math.sin(24 * t);
  }
  const motion = sampleMotion(transformTime);
  const idle = Object.create(null);
  for (const [form, weight, elapsed] of [['capsule', capsuleIdle, readyTime], ['mantis', mantisIdle, Math.max(0, transformTime - TRANSFORM_DURATION)]]) {
    if (!weight) continue;
    for (const [id, value] of Object.entries(sampleIdle(form, elapsed, seed))) idle[id] = (idle[id] || 0) + weight * value;
  }
  body.x += motion['cradle.x'] + (idle['cradle.x'] || 0);
  body.y -= motion['cradle.rise'] + (idle['cradle.rise'] || 0);
  body.rotation += capsuleIdle * .006 * Math.sin(readyTime * .89 + .6)
    + mantisIdle * .008 * Math.sin(readyTime * .73 + seedPhase);
  const regulatorAngle = regulatorRotation(readyTime, transformTime, seed);
  const rig = solveRig({ body, legTime, eyeTime, transformTime, regulatorAngle, motion, idle, gaze });
  return { body, ...rig, phase, motion, idle, lift, idleFade: capsuleIdle, mantisIdle, transformTime,
    beacon: { x: 0, y: 0, active }, time, contactY: body.y + BODY_ORIGIN - 5 };
}

export class SceneModel {
  constructor(seed = 1) { this.entryY = -780; this.reset(seed); }

  prepareEntry(worldTop) {
    // The complete packed rig fits inside 160 units of its root.
    if (!this.active) this.entryY = Math.min(-780, worldTop - 160);
  }

  reset(seed = this.seed) {
    this.seed = Number(seed) >>> 0;
    this.tick = 0;
    this.remainder = 0;
    this.active = false;
    this.transformTick = null;
    this.pointer = { x: 100, y: -180 };
    this.gaze = { ...this.pointer };
    this.events = [];
    return this.snapshot();
  }

  get transformAt() {
    return this.transformTick === null ? null : this.transformTick * DT;
  }

  activate(source = 'debug') {
    if (this.active) return false;
    this.active = true;
    this.events.push({ type: 'activate', source, tick: this.tick });
    return true;
  }

  requestTransform(source = 'debug') {
    if (stageAt(this.tick * DT, this.active, this.transformAt).name !== 'capsule') return false;
    this.transformTick = this.tick;
    this.events.push({ type: 'transform', source, tick: this.tick });
    return true;
  }

  setPointer(x, y) {
    if (!Number.isFinite(x) || !Number.isFinite(y)) return;
    this.pointer = { x, y };
  }

  advance(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError('Time must be finite and nonnegative');
    if (!this.active) return this.snapshot();
    this.remainder += seconds;
    const steps = Math.floor((this.remainder + 1e-10) / DT);
    this.remainder -= steps * DT;
    const transformAt = this.transformAt;
    const follow = 1 - Math.exp(-7 * DT);
    for (let i = 0; i < steps; i++) {
      const before = stageAt(this.tick * DT, true, transformAt).name;
      this.tick++;
      const after = stageAt(this.tick * DT, true, transformAt).name;
      if (before !== after) this.events.push({ type: 'stage', name: after, tick: this.tick });
      this.gaze.x = mix(this.gaze.x, this.pointer.x, follow);
      this.gaze.y = mix(this.gaze.y, this.pointer.y, follow);
    }
    return this.snapshot();
  }

  seek(seconds, { transformAt = null } = {}) {
    if (!Number.isFinite(seconds) || seconds < 0) throw new RangeError('Seek time must be finite and nonnegative');
    if (transformAt !== null && (!Number.isFinite(transformAt) || transformAt < INTRO_DURATION || transformAt > seconds)) {
      throw new RangeError('Transform replay must begin from the live capsule before the seek target');
    }
    this.reset();
    this.activate('replay');
    if (transformAt !== null) {
      this.advance(transformAt);
      this.requestTransform('replay');
      return this.advance(seconds - transformAt);
    }
    return this.advance(seconds);
  }

  snapshot() {
    const time = this.tick * DT;
    const transformAt = this.transformAt;
    const pose = samplePose(time, { active: this.active, gaze: this.gaze, seed: this.seed, entryY: this.entryY, transformAt });
    return {
      version: 'q3c-c2', seed: this.seed, tick: this.tick, time,
      active: this.active, phase: pose.phase.name, entryY: this.entryY, transformAt,
      pointer: { ...this.pointer }, gaze: { ...this.gaze },
      events: this.events.map(event => ({ ...event })),
      pose,
    };
  }
}
