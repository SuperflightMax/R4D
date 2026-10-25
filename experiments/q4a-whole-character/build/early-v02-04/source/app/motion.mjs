import { supportOffset } from './support.mjs';
const TAU = Math.PI * 2;
export const STEP = 1 / 60;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const add = (a, b) => ({ x: a.x + b.x, y: a.y + b.y });
const sub = (a, b) => ({ x: a.x - b.x, y: a.y - b.y });
const rotate = (p, a) => ({ x: p.x * Math.cos(a) - p.y * Math.sin(a), y: p.x * Math.sin(a) + p.y * Math.cos(a) });
const length = p => Math.hypot(p.x, p.y);

// Analytical two-link IK preserves the measured upper/lower limb lengths.
export function kneeBetween(hip, ankle, upper, lower) {
  const delta = sub(ankle, hip);
  const distance = clamp(length(delta), Math.abs(upper - lower) + 0.001, upper + lower - 0.001);
  const direction = Math.atan2(delta.y, delta.x);
  const bend = Math.acos(clamp((upper * upper + distance * distance - lower * lower) / (2 * upper * distance), -1, 1));
  return add(hip, { x: upper * Math.cos(direction - bend), y: upper * Math.sin(direction - bend) });
}

// One persistent critically damped system; no table of pair transitions.
function spring(value, velocity, target, dt, omega = 16) {
  const displacement = value - target;
  const impulse = velocity + omega * displacement;
  const decay = Math.exp(-omega * dt);
  return [(displacement + impulse * dt) * decay + target, (velocity - omega * impulse * dt) * decay];
}

export class Motion {
  constructor(joints, height, options = {}) {
    this.rest = structuredClone(joints);
    this.height = height;
    this.options = options;
    this.contactRest = options.contacts || null;
    this.groundY = options.groundY ?? (this.contactRest ? Math.max(...Object.values(this.contactRest).flatMap(c => [c.heel.y, c.toe.y])) : null);
    this.footAngles = { near: 0, far: 0 };
    this.soleContours = options.soleContours || null;
    this.footSupport = {};
    this.neutralRootY = 0;
    if (this.contactRest) {
      // Put the two measured support lines on one plane by rotation, then solve
      // one shared pelvis translation. Never scale a segment or its texture.
      for (const side of ['near', 'far']) {
        const c = this.contactRest[side];
        // The source shoes have curved soles: their two internal landmarks are
        // not a tangent line. Keep the actual source orientation and solve the
        // full alpha support; only the anatomical chain changes its pose.
        this.footAngles[side] = this.soleContours ? 0 : -Math.atan2(c.toe.y - c.heel.y, c.toe.x - c.heel.x);
        const ankle = joints[`${side}Ankle`], hip = joints[`${side}Hip`];
        const contactOffset = this.soleContours
          ? supportOffset(this.soleContours[side], ankle, this.footAngles[side])
          : rotate(sub(c.heel, ankle), this.footAngles[side]);
        this.footSupport[side] = contactOffset;
        const targetY = this.groundY - contactOffset.y;
        const L1 = length(sub(joints[`${side}Knee`], hip));
        const L2 = length(sub(ankle, joints[`${side}Knee`]));
        const maxY = Math.sqrt(Math.max(0, (L1 + L2 - height * 0.003) ** 2 - (ankle.x - hip.x) ** 2));
        this.neutralRootY = Math.max(this.neutralRootY, targetY - hip.y - maxY);
      }
      this.neutralRootY += height * 0.004;
    }
    this.time = 0;
    this.phase = 0;
    this.worldX = 0;
    this.target = 'idle';
    this.jump = null;
    this.jumpCount = 0;
    this.values = { low: 0, walking: 0, tuck: 0, armLift: 0 };
    this.velocities = Object.fromEntries(Object.keys(this.values).map(k => [k, 0]));
    this.lastCommand = 'idle';
    this.pose = this.calculate();
  }

  command(command) {
    if (!['idle', 'low', 'walk', 'jump'].includes(command)) return false;
    if (this.options.early && !['idle', 'low'].includes(command)) return false;
    this.lastCommand = command;
    if (command === 'jump') {
      // Repeated requests throughout a jump do not queue another jump.
      if (this.jump) return false;
      this.jump = { elapsed: 0, phase: 'prepare' };
      this.jumpCount++;
    } else this.target = command;
    return true;
  }

  advance(dt) {
    if (!Number.isFinite(dt) || dt < 0) throw new Error('Invalid simulation interval');
    // Fixed substeps also make an explicit step independent of the display rate.
    let remaining = dt;
    while (remaining > 1e-9) { const h = Math.min(STEP, remaining); this.integrate(h); remaining -= h; }
    this.pose = this.calculate();
    return this.pose;
  }

  integrate(dt) {
    this.time += dt;
    let low = this.target === 'low' ? 1 : 0;
    let walking = this.target === 'walk' ? 1 : 0;
    let tuck = 0, armLift = 0;
    if (this.jump) {
      this.jump.elapsed += dt;
      const t = this.jump.elapsed;
      if (t < 0.24) { this.jump.phase = 'prepare'; low = 0.72; walking = 0; armLift = -0.2; }
      else if (t < 0.96) {
        this.jump.phase = 'air';
        const air = (t - 0.24) / 0.72;
        low = 0.08; walking = 0; tuck = Math.sin(Math.PI * air) * 0.9; armLift = 1;
      } else if (t < 1.22) { this.jump.phase = 'land'; low = 0.6 * (1 - (t - 0.96) / 0.26); walking = 0; }
      else this.jump = null;
    }
    const targets = { low, walking, tuck, armLift };
    for (const key of Object.keys(this.values)) {
      [this.values[key], this.velocities[key]] = spring(this.values[key], this.velocities[key], targets[key], dt);
    }
    const travel = this.values.walking * dt * this.height * 0.27;
    this.worldX += travel;
    // Phase and camera travel share one speed; the support foot has zero world velocity.
    this.phase += this.values.walking * dt * 0.9 * TAU;
  }

  calculate() {
    const r = this.rest, H = this.height, v = this.values;
    const breath = this.options.early ? 0 : Math.sin(this.time * 2.5) * H * 0.0018 * (1 - v.walking);
    const lean = v.low * 0.4 + v.walking * 0.08;
    let lift = 0;
    if (this.jump?.phase === 'air') {
      const a = clamp((this.jump.elapsed - 0.24) / 0.72, 0, 1);
      lift = H * 0.24 * 4 * a * (1 - a);
    }
    const bounce = Math.abs(Math.sin(this.phase)) * H * 0.007 * v.walking;
    const pelvis = add(r.pelvis, { x: -H * 0.09 * v.low, y: this.neutralRootY + H * 0.17 * v.low - lift - bounce + breath });
    const p = { pelvis };
    const onTorso = key => add(pelvis, rotate(sub(r[key], r.pelvis), lean));
    p.chest = onTorso('chest'); p.neck = onTorso('neck');
    p.head = add(p.neck, rotate(sub(r.head, r.neck), lean * 0.35));
    for (const [side, offset] of [['near', 0], ['far', Math.PI]]) {
      const hipKey = `${side}Hip`, kneeKey = `${side}Knee`, ankleKey = `${side}Ankle`;
      p[hipKey] = add(pelvis, sub(r[hipKey], r.pelvis));
      const q = ((this.phase + offset) / TAU % 1 + 1) % 1;
      // First half is stance; second half is an eased forward swing.
      const stride = H * 0.15;
      const stepX = q < 0.5 ? stride * (0.5 - 2 * q) : -stride * 0.5 + stride * (1 - Math.cos((q - 0.5) * TAU)) / 2;
      const stepY = q < 0.5 ? 0 : -Math.sin((q - 0.5) * TAU) * H * 0.065;
      const baseAnkleY = this.contactRest ? this.groundY - this.footSupport[side].y : r[ankleKey].y;
      const ankle = { x: r[ankleKey].x + stepX * v.walking + H * 0.025 * v.tuck,
        y: baseAnkleY + stepY * v.walking - lift - H * 0.11 * v.tuck };
      const upper = length(sub(r[kneeKey], r[hipKey])), lower = length(sub(r[ankleKey], r[kneeKey]));
      const reach = sub(ankle, p[hipKey]);
      const reachLength = length(reach), maxLength = upper + lower - 0.001;
      // Actual target is clamped to reachable distance, never stretching the artwork.
      p[ankleKey] = reachLength > maxLength ? add(p[hipKey], { x: reach.x * maxLength / reachLength, y: reach.y * maxLength / reachLength }) : ankle;
      p[kneeKey] = kneeBetween(p[hipKey], p[ankleKey], upper, lower);
      const toeKey = `${side}Toe`;
      const footPitch = this.footAngles[side] + (q < 0.5 ? 0 : -Math.sin((q - 0.5) * TAU) * 0.17) * v.walking - v.tuck * 0.12;
      p[toeKey] = add(p[ankleKey], rotate(sub(r[toeKey], r[ankleKey]), footPitch));
      if (this.contactRest) {
        for (const name of ['heel', 'toe']) p[`${side}Contact${name}`] = add(p[ankleKey], rotate(sub(this.contactRest[side][name], r[ankleKey]), footPitch));
      }
      if (this.soleContours) {
        const support = supportOffset(this.soleContours[side], r[ankleKey], footPitch);
        p[`${side}ActualSupport`] = add(p[ankleKey], rotate(sub(support.sourcePoint, r[ankleKey]), footPitch));
      }
      const shoulderKey = `${side}Shoulder`, elbowKey = `${side}Elbow`, wristKey = `${side}Wrist`;
      p[shoulderKey] = onTorso(shoulderKey);
      const swing = Math.sin(this.phase + offset) * 0.5 * v.walking;
      const upperAngle = lean + swing - v.low * 0.6 - v.armLift * 1.1;
      p[elbowKey] = add(p[shoulderKey], rotate(sub(r[elbowKey], r[shoulderKey]), upperAngle));
      p[wristKey] = add(p[elbowKey], rotate(sub(r[wristKey], r[elbowKey]), upperAngle - v.low * 0.35 - v.armLift * 0.25));
      if (r[`${side}Hand`]) p[`${side}Hand`] = add(p[wristKey], rotate(sub(r[`${side}Hand`], r[wristKey]), upperAngle - v.low * 0.35 - v.armLift * 0.25));
    }
    return p;
  }

  snapshot() {
    return { time: this.time, target: this.target, jumpPhase: this.jump?.phase ?? 'ground',
      jumpCount: this.jumpCount, worldX: this.worldX, values: { ...this.values }, pose: structuredClone(this.pose) };
  }

  measurements(p = this.pose) {
    const degrees = (a, b) => Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    const result = { groundY: this.groundY, neutralRootY: this.neutralRootY,
      rootDelta: sub(p.pelvis, this.rest.pelvis), sides: {} };
    for (const side of ['near', 'far']) {
      const row = { lengths: {}, anglesDegrees: {}, contacts: {} };
      for (const [name, a, b] of [['thigh', 'Hip', 'Knee'], ['shin', 'Knee', 'Ankle'], ['footAxis', 'Ankle', 'Toe'], ['upperArm', 'Shoulder', 'Elbow'], ['forearm', 'Elbow', 'Wrist']]) {
        const expected = length(sub(this.rest[side+b], this.rest[side+a]));
        const actual = length(sub(p[side+b], p[side+a]));
        row.lengths[name] = { source: expected, actual, error: actual - expected };
        row.anglesDegrees[name] = degrees(p[side+a], p[side+b]);
      }
      if (this.contactRest) for (const name of ['heel', 'toe']) {
        const contact = p[`${side}Contact${name}`] || this.contactRest[side][name];
        row.contacts[name] = { ...contact, groundError: contact.y - this.groundY };
      }
      if (this.soleContours && p[`${side}ActualSupport`]) {
        row.actualAlphaSupport = { ...p[`${side}ActualSupport`],
          groundError: p[`${side}ActualSupport`].y - this.groundY };
      }
      const hip = p[`${side}Hip`], knee = p[`${side}Knee`], ankle = p[`${side}Ankle`];
      const u = sub(hip, knee), w = sub(ankle, knee);
      row.kneeFlexDegrees = 180 - Math.acos(clamp((u.x * w.x + u.y * w.y) / (length(u) * length(w)), -1, 1)) * 180 / Math.PI;
      result.sides[side] = row;
    }
    return result;
  }
}
