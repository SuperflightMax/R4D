import { BODY_ORIGIN, LANDING_Y, solveRig, walkoutLift } from './rig.js';
import { TRANSFORM_DURATION, clamp, curveAt, mix, regulatorRotation, sampleIdle, sampleMotion, smooth, windowed } from './motion.js';
import { sampleWalk, WALK_STEP, WALK_TICKS } from './locomotion.js';
import { approachFlight, ARRIVAL_DELAY, DEFAULT_BOUNDS, huntPose, IMPACT_TICKS, LUNGE_TICKS,
  MOTH_GEOMETRY, mothFlight, randomStream, REACTION_TICKS, spawnMoth, sweptContact } from './hunt.js';
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

export function samplePose(time, { active = true, gaze = { x: 100, y: -180 }, seed = 1, entryY = -780, transformAt = null,
  walk, strike, trackingMoth = 0, headGaze = gaze } = {}) {
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
  if (walk) {
    body.x += walk.x;
    body.y += walk.dip;
    body.rotation += walk.roll;
  }
  if (strike) {
    body.x += (strike.side === 'near' ? 1 : -1) * (2.8 * strike.reach - 2.3 * strike.wind);
    body.y += 3.4 * (strike.recoil || 0);
  }
  const regulatorAngle = regulatorRotation(readyTime, transformTime, seed);
  const rig = solveRig({ body, legTime, eyeTime, transformTime, regulatorAngle, motion, idle, gaze, walk, strike, trackingMoth, headGaze });
  return { body, ...rig, phase, motion, idle, lift, idleFade: capsuleIdle, mantisIdle, transformTime,
    beacon: { x: 0, y: 0, active }, time, contactY: body.y + BODY_ORIGIN - 5 };
}

export class SceneModel {
  constructor(seed = 1) {
    this.entryY = -780;
    this.bounds = DEFAULT_BOUNDS;
    this.reset(seed);
  }

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
    this.pendingTransform = null;
    this.walk = { x: 0, target: 0, step: null, rolls: null };
    this.hunt = { phase: 'idle', since: 0 };
    this.round = 0;
    this.moth = null;
    this.impact = null;
    this.pointer = { x: 100, y: -180 };
    this.gaze = { ...this.pointer };
    this.headGaze = { ...this.pointer };
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
    if (stageAt(this.tick * DT, this.active, this.transformAt).name !== 'capsule' || this.pendingTransform) return false;
    if (this.walk.step) {
      this.walk.target = this.walk.step.to;
      this.pendingTransform = source;
      return true;
    }
    this.startTransform(source);
    return true;
  }

  startTransform(source) {
    this.transformTick = this.tick;
    this.events.push({ type: 'transform', source, tick: this.tick });
  }

  setBounds(bounds) {
    this.bounds = bounds;
  }

  walkTo(x, source = 'debug') {
    if (!Number.isFinite(x) || this.pendingTransform || stageAt(this.tick * DT, this.active, this.transformAt).name !== 'capsule') return false;
    const target = clamp(x, Math.max(-150, this.bounds.left + 177), Math.min(150, this.bounds.right - 177));
    if (Math.abs(target - this.walk.target) < .5) return false;
    this.walk.rolls ??= Object.fromEntries(Object.entries(this.poseAt().idle).filter(([id]) => id.endsWith('.foot.roll')));
    this.walk.target = target;
    this.events.push({ type: 'walk', source, tick: this.tick, target });
    this.updateWalk();
    return true;
  }

  walkBy(direction, source = 'debug') {
    return this.walkTo(this.walk.target + Math.sign(direction) * WALK_STEP, source);
  }

  updateWalk() {
    const { step } = this.walk;
    if (step && this.tick - step.start < WALK_TICKS) return;
    if (step) this.walk.x = step.to;
    this.walk.step = null;
    if (this.pendingTransform) {
      this.startTransform(this.pendingTransform);
      this.pendingTransform = null;
    } else if (Math.abs(this.walk.target - this.walk.x) >= .5) {
      this.walk.step = { from: this.walk.x, to: this.walk.x + clamp(this.walk.target - this.walk.x, -WALK_STEP, WALK_STEP), start: this.tick };
    }
  }

  setHuntPhase(phase, state = {}) {
    this.hunt = { ...state, phase, since: this.tick };
    this.events.push({ type: 'hunt', name: phase, tick: this.tick });
  }

  releaseMoth() {
    this.round++;
    this.impact = null;
    this.moth = spawnMoth(this.seed, this.round, this.tick, this.bounds, this.walk.x);
    this.events.push({ type: 'moth-spawn', tick: this.tick, id: this.moth.id, position: { ...this.moth.position } });
    this.setHuntPhase('observe');
  }

  repeatMoth(source = 'debug') {
    if (!this.round || this.hunt.phase !== 'idle' || this.moth) return false;
    this.events.push({ type: 'repeat', tick: this.tick, source });
    this.releaseMoth();
    return true;
  }

  requestHunt(source = 'debug') {
    if (!this.moth || this.hunt.phase !== 'observe') return false;
    let side = this.moth.position.x >= this.walk.x + 26 ? 'near' : 'far';
    const endpoint = (name, tick = this.tick) => {
      const contact = this.poseAt({ side: name, wind: 0, reach: 1 }, tick).arms.find(arm => arm.side === name).contact;
      const [x, y] = MOTH_GEOMETRY.capture.center;
      return { x: contact.x - x, y: contact.y - y };
    };
    let target = endpoint(side);
    const { left, right } = this.bounds;
    if (target.x < left + MOTH_GEOMETRY.safeRadius || target.x > right - MOTH_GEOMETRY.safeRadius) {
      side = side === 'near' ? 'far' : 'near';
      target = endpoint(side);
    }
    const approach = approachFlight(this.moth, target, this.tick);
    approach.target = endpoint(side, this.tick + approach.duration + LUNGE_TICKS);
    this.events.push({ type: 'hunt-command', tick: this.tick, source, side });
    this.setHuntPhase('intent', { side, approach });
    return true;
  }

  updateHunt() {
    const hunt = this.hunt;
    const elapsed = this.tick - hunt.since;
    if (!this.round && this.tick - this.transformTick >= Math.ceil(TRANSFORM_DURATION / DT) + ARRIVAL_DELAY) {
      this.releaseMoth();
      return;
    }
    const previousMoth = this.moth;
    if (this.moth) this.moth = mothFlight(this.moth, this.tick, 1 / DT, hunt.approach);
    if (hunt.phase === 'intent' && elapsed >= hunt.approach.duration) {
      const contact = this.poseAt().arms.find(arm => arm.side === hunt.side).contact;
      this.setHuntPhase('lunge', { ...hunt, contact });
    } else if (hunt.phase === 'lunge') {
      const contact = this.poseAt().arms.find(arm => arm.side === hunt.side).contact;
      const hit = sweptContact(hunt.contact, contact, previousMoth, this.moth);
      if (hit) {
        const grip = huntPose(hunt, this.tick);
        this.impact = { ...hit, type: 'impact', tick: this.tick, victimId: this.moth.id,
          seed: Math.floor(randomStream(this.seed, this.round, 2)() * 4294967296) };
        this.events.push(this.impact);
        this.moth = null;
        this.setHuntPhase('impact', { side: hunt.side, grip });
      } else if (elapsed >= LUNGE_TICKS) {
        this.setHuntPhase('reaction', { side: hunt.side, grip: huntPose(hunt, this.tick), approach: hunt.approach, missed: true });
      } else hunt.contact = contact;
    } else if (hunt.phase === 'impact' && elapsed >= IMPACT_TICKS) {
      this.setHuntPhase('reaction', { side: hunt.side, grip: hunt.grip });
    } else if (hunt.phase === 'reaction' && elapsed >= REACTION_TICKS) {
      this.setHuntPhase(this.moth ? 'observe' : 'idle', this.moth ? { approach: hunt.approach } : {});
    }
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
    const follow = 1 - Math.exp(-7 * DT);
    const mothFollow = 1 - Math.exp(-11 * DT);
    const headFollow = 1 - Math.exp(-16 * DT);
    for (let i = 0; i < steps; i++) {
      const transformAt = this.transformAt;
      const before = stageAt(this.tick * DT, true, transformAt).name;
      this.tick++;
      const after = stageAt(this.tick * DT, true, transformAt).name;
      if (before !== after) this.events.push({ type: 'stage', name: after, tick: this.tick });
      if (after === 'capsule' && this.walk.step) this.updateWalk();
      if (after === 'mantis') this.updateHunt();
      const target = this.moth?.position ?? (this.hunt.phase === 'impact' || this.hunt.phase === 'reaction' ? this.impact?.contactWorldXY : null) ?? this.pointer;
      const response = this.moth ? mothFollow : follow;
      this.gaze.x = mix(this.gaze.x, target.x, response);
      this.gaze.y = mix(this.gaze.y, target.y, response);
      this.headGaze.x = mix(this.headGaze.x, this.gaze.x, headFollow);
      this.headGaze.y = mix(this.headGaze.y, this.gaze.y, headFollow);
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

  poseAt(strike = huntPose(this.hunt, this.tick), tick = this.tick) {
    const walk = this.walk.rolls ? { ...sampleWalk(this.walk.step, tick, this.walk.x), rolls: this.walk.rolls,
      rollLock: this.transformTick === null ? 1 : 1 - smooth((tick - this.transformTick) / 29) } : undefined;
    const trackingMoth = this.moth ? smooth((this.tick - this.moth.tick) / 48)
      : this.impact ? 1 - smooth((this.tick - this.impact.tick - IMPACT_TICKS) / REACTION_TICKS) : 0;
    return samplePose(tick * DT, { active: this.active, gaze: this.gaze, seed: this.seed,
      entryY: this.entryY, transformAt: this.transformAt, walk, strike, trackingMoth, headGaze: this.headGaze });
  }

  snapshot() {
    const pose = this.poseAt();
    return {
      version: 'q3c-d', seed: this.seed, tick: this.tick, time: this.tick * DT,
      active: this.active, phase: pose.phase.name, entryY: this.entryY, transformAt: this.transformAt,
      pointer: { ...this.pointer }, gaze: { ...this.gaze },
      walk: { ...sampleWalk(this.walk.step, this.tick, this.walk.x), target: this.walk.target, queuedTransform: !!this.pendingTransform },
      moth: structuredClone(this.moth), hunt: structuredClone(this.hunt), impact: structuredClone(this.impact),
      events: structuredClone(this.events),
      pose,
    };
  }
}
