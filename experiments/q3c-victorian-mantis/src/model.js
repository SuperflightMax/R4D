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
export const LEG_SPECS = Object.freeze([
  { id: 'rear-left', side: -1, mount: 42, upper: 59, lower: 76, foot: 94, delay: 0.32 },
  { id: 'rear-right', side: 1, mount: 42, upper: 59, lower: 76, foot: 94, delay: 0.45 },
  { id: 'front-left', side: -1, mount: 54, upper: 68, lower: 85, foot: 136, delay: 0.59 },
  { id: 'front-right', side: 1, mount: 54, upper: 68, lower: 85, foot: 136, delay: 0.72 },
]);

export const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
export const mix = (a, b, t) => a + (b - a) * t;
const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const outCubic = x => 1 - (1 - clamp(x)) ** 3;
const windowed = (time, start, duration, curve = smooth) => curve((time - start) / duration);

export function stageAt(time, active = true) {
  if (!active) return { name: 'waiting', local: 0, start: 0 };
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

export function toWorld(point, root) {
  const c = Math.cos(root.rotation), s = Math.sin(root.rotation);
  return { x: root.x + c * point.x - s * point.y, y: root.y + s * point.x + c * point.y };
}

function toLocal(point, root) {
  const c = Math.cos(root.rotation), s = Math.sin(root.rotation);
  const x = point.x - root.x, y = point.y - root.y;
  return { x: c * x + s * y, y: -s * x + c * y };
}

function solveLeg(spec, body, deployment, time) {
  const hip = { x: spec.side * spec.mount, y: 8 };
  const plantedTarget = { x: spec.side * spec.foot, y: 0 };
  const landing = toLocal(plantedTarget, body);
  const folded = {
    x: hip.x + spec.side * (spec.upper * Math.cos(2.65) + spec.lower * Math.cos(4.95)),
    y: hip.y + spec.upper * Math.sin(2.65) + spec.lower * Math.sin(4.95),
  };
  // First unroll inside the bay; only then pass through the open lower hatch.
  // A floor-bounded effector path preserves rigid links without penetrating the floor.
  const shoulderProgress = windowed(time, spec.delay, 0.30) * deployment;
  const kneeProgress = windowed(time, spec.delay + 0.30, 0.48) * deployment;
  const inBay = { x: mix(folded.x, spec.side * 8, shoulderProgress), y: mix(folded.y, 60, shoulderProgress) };
  const target = { x: mix(inBay.x, landing.x, kneeProgress), y: mix(inBay.y, landing.y, kneeProgress) };
  const dx = spec.side * (target.x - hip.x), dy = target.y - hip.y;
  const distance = Math.hypot(dx, dy);
  const cosine = clamp((spec.upper ** 2 + distance ** 2 - spec.lower ** 2) / (2 * spec.upper * distance), -1, 1);
  let direction = Math.atan2(dy, dx);
  if (direction < 0 && dx < 0) direction += Math.PI * 2;
  const upperOpen = direction - Math.acos(cosine);
  const bendOpen = Math.acos(clamp((distance ** 2 - spec.upper ** 2 - spec.lower ** 2) / (2 * spec.upper * spec.lower), -1, 1));
  const upperAngle = upperOpen;
  const kneeAngle = bendOpen;
  const knee = { x: hip.x + spec.side * spec.upper * Math.cos(upperAngle), y: hip.y + spec.upper * Math.sin(upperAngle) };
  const foot = { x: knee.x + spec.side * spec.lower * Math.cos(upperAngle + kneeAngle), y: knee.y + spec.lower * Math.sin(upperAngle + kneeAngle) };
  return {
    ...spec, hip, knee, foot, upperAngle, kneeAngle,
    shoulderProgress, kneeProgress,
    planted: kneeProgress >= 1 && shoulderProgress >= 1,
    world: { hip: toWorld(hip, body), knee: toWorld(knee, body), foot: toWorld(foot, body) },
  };
}

export function samplePose(time, { active = true, gaze = { x: 100, y: -180 }, seed = 1 } = {}) {
  const phase = stageAt(time, active);
  const fallTime = time - stageStart('falling');
  const impactTime = time - stageStart('impact');
  const legTime = time - stageStart('legs');
  const eyeTime = time - stageStart('eye');
  const readyTime = Math.max(0, time - INTRO_DURATION);
  const idleFade = active ? smooth(readyTime / 0.6) : 0;
  const phaseSeed = (seed >>> 0) / 4294967296 * Math.PI * 2;
  const lift = active ? windowed(legTime, 1.5, 0.65) : 0;
  const body = { x: 0, y: -780, rotation: -0.12 };
  if (active && fallTime >= 0) {
    const p = clamp(fallTime / 1.05);
    body.y = mix(-780, -82, p * p);
    body.rotation = -0.12 * (1 - p) + 0.045 * Math.sin(p * Math.PI);
  }
  if (active && impactTime >= 0) {
    const t = Math.min(impactTime, 0.9);
    body.y = -82 - 19 * Math.exp(-8 * t) * Math.sin(19 * t) ** 2 - 40 * lift;
    body.rotation = 0.045 * Math.exp(-9 * t) * Math.sin(24 * t);
  }
  body.y += idleFade * (1.4 * Math.sin(readyTime * 1.35 + phaseSeed) + 0.45 * Math.sin(readyTime * 2.13));
  body.rotation += idleFade * 0.006 * Math.sin(readyTime * 0.89 + 0.6);
  const legDeployment = active && legTime >= 0 ? 1 : 0;
  const legs = LEG_SPECS.map(spec => solveLeg(spec, body, legDeployment, Math.max(0, legTime)));
  const hatches = [-1, 1].map(side => ({
    id: side < 0 ? 'hatch-left' : 'hatch-right', side,
    x: side * 63, y: 16,
    angle: -side * 1.16 * (active ? windowed(legTime, side < 0 ? 0 : 0.09, 0.48) : 0),
  }));
  const lid = { x: 48, y: -68, angle: active ? -2.90 * windowed(eyeTime, 0, 0.32) : 0 };
  const extension = active ? windowed(eyeTime, 0.34, 0.73, outCubic) : 0;
  const eye = {
    id: 'optical-head', parent: 'head-carriage', x: 76,
    y: -18 - 73 * extension + idleFade * 1.3 * Math.sin(readyTime * 1.77 + 1.4),
    extension,
    rotation: clamp(gaze.x / 600, -0.22, 0.22) * extension + idleFade * 0.025 * Math.sin(readyTime * 1.03 + phaseSeed),
    gazeX: clamp(gaze.x / 230, -1, 1),
    gazeY: clamp((gaze.y - (body.y - 91)) / 230, -1, 1),
  };
  return { body, legs, hatches, lid, eye, phase, lift, idleFade, beacon: { x: 0, y: 0, active }, time };
}

export class SceneModel {
  constructor(seed = 1) { this.reset(seed); }

  reset(seed = this.seed) {
    this.seed = Number(seed) >>> 0;
    this.tick = 0;
    this.remainder = 0;
    this.active = false;
    this.pointer = { x: 100, y: -180 };
    this.gaze = { ...this.pointer };
    this.events = [];
    return this.snapshot();
  }

  activate(source = 'debug') {
    if (this.active) return false;
    this.active = true;
    this.events.push({ type: 'activate', source, tick: this.tick });
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
    for (let i = 0; i < steps; i++) {
      const before = stageAt(this.tick * DT).name;
      this.tick++;
      const after = stageAt(this.tick * DT).name;
      if (before !== after) this.events.push({ type: 'stage', name: after, tick: this.tick });
      const follow = 1 - Math.exp(-7 * DT);
      this.gaze.x = mix(this.gaze.x, this.pointer.x, follow);
      this.gaze.y = mix(this.gaze.y, this.pointer.y, follow);
    }
    return this.snapshot();
  }

  seek(seconds) {
    this.reset();
    this.activate('replay');
    return this.advance(seconds);
  }

  snapshot() {
    const time = this.tick * DT;
    return {
      version: 'q3c-slice-01', seed: this.seed, tick: this.tick, time,
      active: this.active, phase: stageAt(time, this.active).name,
      pointer: { ...this.pointer }, gaze: { ...this.gaze },
      events: this.events.map(event => ({ ...event })),
      pose: samplePose(time, { active: this.active, gaze: this.gaze, seed: this.seed }),
    };
  }
}
