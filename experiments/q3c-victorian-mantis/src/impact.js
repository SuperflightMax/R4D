import impactPack from '../assets/production-stage-d/IMPACT_V1.json' with { type: 'json' };
import { randomStream } from './hunt.js';
import { mix, rad, smooth } from './motion.js';

export const IMPACT_PACK = impactPack;

export function impactPlan(impact) {
  const random = randomStream(impact.seed, 1);
  const direction = Math.atan2(impact.strikeDirection.y, impact.strikeDirection.x);
  const choose = range => mix(range[0], range[1], random());
  return IMPACT_PACK.drawOrder.flatMap(kind => {
    const group = IMPACT_PACK.burst[kind];
    const count = Array.isArray(group.count) ? Math.floor(mix(group.count[0], group.count[1] + 1, random())) : group.count;
    return Array.from({ length: count }, () => {
      const texture = group.texture ?? group.textures[Math.floor(random() * group.textures.length)];
      const [x, y, w, h] = IMPACT_PACK.sprites[texture].viewBox;
      const bounds = Math.hypot(Math.max(-x, x + w), Math.max(-y, y + h));
      const scale = group.scale ? choose(group.scale) : group.scaleTo ?? 1;
      return { kind, texture, origin: impact.contactWorldXY, delay: group.startMs / 1000, life: choose(group.lifetimeMs) / 1000,
        angle: direction + (random() * 2 - 1) * rad(group.halfConeDeg ?? 18), scale, scaleFrom: group.scaleFrom ?? scale,
        speed: group.speedWorldPerSecond ? choose(group.speedWorldPerSecond) : 0,
        spin: group.spinDegPerSecond ? rad(choose(group.spinDegPerSecond)) : 0,
        travel: Math.max(0, Math.min(group.driftMaxWorld ?? Infinity, IMPACT_PACK.maxTraceRadiusWorld - bounds * scale)),
      };
    });
  });
}

export function impactParticle(particle, age) {
  const t = age - particle.delay;
  if (t < 0 || t >= particle.life) return null;
  const f = t / particle.life;
  const eased = 1 - (1 - f) ** 2;
  const dust = particle.kind === 'dust';
  const distance = dust ? particle.travel * eased : Math.min(particle.travel, particle.speed * t * (1 - .24 * f));
  const fall = particle.kind === 'debris' ? 40 * t * t : 0;
  const dx = distance * Math.cos(particle.angle), dy = distance * Math.sin(particle.angle) + fall;
  const cap = Math.min(1, particle.travel / (Math.hypot(dx, dy) || 1));
  return { x: particle.origin.x + dx * cap, y: particle.origin.y + dy * cap,
    rotation: particle.angle + particle.spin * t, scale: mix(particle.scaleFrom, particle.scale, eased),
    // The dust SVG already carries its low peak opacity.
    alpha: dust ? smooth(f / .24) * (1 - smooth((f - .25) / .75)) : 1 - f ** 2 };
}
