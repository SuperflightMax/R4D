import { clamp, mix, smooth } from './motion.js';

export const WALK_STEP = 24;
export const WALK_TICKS = 96;
const firstPair = new Set(['rear.far', 'front.near']);

export function sampleWalk(step, tick, settledX) {
  if (!step) return { x: settledX, dip: 0, roll: 0 };
  const t = clamp((tick - step.start) / WALK_TICKS);
  const transfer = Math.sin(2 * Math.PI * t) ** 2;
  return { step, t, x: mix(step.from, step.to, smooth(t)), dip: 2.6 * transfer,
    roll: Math.sign(step.to - step.from) * .019 * Math.sin(2 * Math.PI * t) * Math.sin(Math.PI * t) };
}

export function walkSole(walk, id) {
  if (!walk.step) return { offset: walk.x, lift: 0 };
  const { from, to } = walk.step;
  const swing = clamp(2 * walk.t - (firstPair.has(id) ? 0 : 1));
  return { offset: mix(from, to, smooth(swing)), lift: 11 * Math.sin(Math.PI * swing) ** 2 };
}
