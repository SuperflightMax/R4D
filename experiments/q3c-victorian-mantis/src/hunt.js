import { clamp, curveAt, mix, smooth } from './motion.js';
import mothPack from '../assets/production-stage-d/MOTH_V1.json' with { type: 'json' };

export const MOTH_PACK = mothPack;
export const MOTH_GEOMETRY = Object.freeze({ safeRadius: mothPack.safeSpawnRadiusWorld, capture: mothPack.captureEllipseLocal });
export const DEFAULT_BOUNDS = Object.freeze({ left: -216, right: 244, top: -368, bottom: 98, inset: 16 });
export const ARRIVAL_DELAY = 62;
export const LUNGE_TICKS = 38;
export const IMPACT_TICKS = 13;
export const REACTION_TICKS = 86;

export function randomStream(seed, round, lane = 0) {
  let state = (seed ^ Math.imul(round, 0x9e3779b9) ^ Math.imul(lane, 0x85ebca6b)) >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let bits = Math.imul(state ^ state >>> 15, state | 1);
    bits ^= bits + Math.imul(bits ^ bits >>> 7, bits | 61);
    return ((bits ^ bits >>> 14) >>> 0) / 4294967296;
  };
}

export function flightRect(bounds, actorX, geometry = MOTH_GEOMETRY) {
  const pad = geometry.safeRadius + (bounds.inset ?? DEFAULT_BOUNDS.inset);
  const top = Math.max(bounds.top + pad, -414);
  const left = Math.max(bounds.left + pad, actorX - 190);
  const right = Math.min(bounds.right - pad, actorX + 190);
  if (top > -372) {
    // A shallow viewport leaves room beside the silhouette instead of over it.
    return { left, right: Math.min(right, actorX - 76), top, bottom: Math.min(bounds.bottom - pad, -285) };
  }
  return {
    left, right, top, bottom: -365,
  };
}

function sampleWings(elapsed, offset) {
  const { periodMs, samples } = MOTH_PACK.flightProfile;
  const time = (elapsed * 1000 + offset * periodMs) % periodMs;
  const i = samples.findIndex(sample => sample.tMs > time);
  const from = samples[i - 1], to = samples[i];
  const t = smooth((time - from.tMs) / (to.tMs - from.tMs));
  return { far: mix(from.farScaleY, to.farScaleY, t), near: mix(from.nearScaleY, to.nearScaleY, t) };
}

export function spawnMoth(seed, round, tick, bounds, actorX) {
  const draw = randomStream(seed, round);
  const rect = flightRect(bounds, actorX);
  const home = { x: mix(rect.left, rect.right, .13 + .74 * draw()), y: mix(rect.top, rect.bottom, .18 + .64 * draw()) };
  const wingOffset = draw();
  return { id: `moth-${round}`, round, tick, rect, home, position: home, wingOffset,
    direction: draw() < .5 ? -1 : 1, period: mix(2.65, 3.7, draw()), wings: sampleWings(0, wingOffset), bank: 0 };
}

export function mothFlight(moth, tick, hz, approach) {
  const elapsed = (tick - moth.tick) / hz;
  const cycle = elapsed * Math.PI * 2 / moth.period;
  const wings = sampleWings(elapsed, moth.wingOffset);
  const { rect, home } = moth;
  const dx = Math.min(35, home.x - rect.left, rect.right - home.x);
  const dy = Math.min(14, home.y - rect.top, rect.bottom - home.y);
  let position = { x: home.x + moth.direction * dx * Math.sin(cycle), y: home.y + dy * Math.sin(cycle * 1.37) };
  let bank = .24 * Math.sin(cycle + .55) * moth.direction;
  if (approach) {
    const t = clamp((tick - approach.start) / approach.duration);
    const p = curveAt('carry', t);
    position = { x: mix(approach.from.x, approach.target.x, p),
      y: mix(approach.from.y, approach.target.y, p) - Math.sin(Math.PI * p) * approach.arc };
    bank = approach.direction * .28 * Math.sin(Math.PI * p) + approach.bank * (1 - smooth(t));
  }
  return { ...moth, position, wings, bank };
}

export function approachFlight(moth, target, tick) {
  const from = moth.position;
  const distance = Math.hypot(target.x - from.x, target.y - from.y);
  return { from, target, start: tick, duration: Math.round(clamp(distance * .83, 83, 212)),
    arc: Math.min(23, Math.max(0, from.y - moth.rect.top)), direction: Math.sign(target.x - from.x), bank: moth.bank };
}

export function huntPose(hunt, tick) {
  const local = tick - hunt.since;
  if (hunt.phase === 'intent') return { side: hunt.side, wind: smooth((local - hunt.approach.duration + 34) / 34), reach: 0 };
  if (hunt.phase === 'lunge') {
    const progress = clamp(local / LUNGE_TICKS);
    return { side: hunt.side, wind: 1 - curveAt('blade', progress), reach: curveAt('fast', progress) };
  }
  if (hunt.phase === 'impact') return { ...hunt.grip, close: smooth(local / IMPACT_TICKS) };
  if (hunt.phase === 'reaction') {
    const fade = 1 - curveAt('damped', clamp(local / REACTION_TICKS));
    return { side: hunt.side, wind: hunt.grip.wind * fade, reach: hunt.grip.reach * fade,
      close: hunt.missed ? 0 : fade, recoil: Math.sin(Math.PI * (1 - fade)) };
  }
  return null;
}

export function sweptContact(before, after, mothBefore, mothAfter, ellipse = MOTH_GEOMETRY.capture) {
  const unit = (point, moth) => {
    const x = point.x - moth.position.x, y = point.y - moth.position.y;
    const c = Math.cos(moth.bank), s = Math.sin(moth.bank);
    return { x: (c * x + s * y - ellipse.center[0]) / ellipse.radii[0],
      y: (c * y - s * x - ellipse.center[1]) / ellipse.radii[1] };
  };
  const { x, y } = unit(before, mothBefore);
  const end = unit(after, mothAfter);
  const dx = end.x - x, dy = end.y - y;
  const c = x * x + y * y - 1;
  let t = 0;
  if (c > 0) {
    const a = dx * dx + dy * dy;
    const b = x * dx + y * dy;
    const discriminant = b * b - a * c;
    if (a === 0 || b >= 0 || discriminant < 0) return null;
    t = (-b - Math.sqrt(discriminant)) / a;
    if (t > 1) return null;
  }
  const vx = after.x - before.x, vy = after.y - before.y;
  const length = Math.hypot(vx, vy) || 1;
  return { contactWorldXY: { x: mix(before.x, after.x, t), y: mix(before.y, after.y, t) },
    strikeDirection: { x: vx / length, y: vy / length },
    victimWorldXY: { x: mix(mothBefore.position.x, mothAfter.position.x, t), y: mix(mothBefore.position.y, mothAfter.position.y, t) },
    victimAngle: mix(mothBefore.bank, mothAfter.bank, t) };
}
