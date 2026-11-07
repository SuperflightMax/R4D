import fullRig from '../assets/rig/FULL_RIG_V1.json' with { type: 'json' };

const motion = fullRig.motion;

export const clamp = (x, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, x));
export const mix = (a, b, t) => a + (b - a) * t;
export const smooth = x => { x = clamp(x); return x * x * (3 - 2 * x); };
export const windowed = (t, start, duration, curve = smooth) => curve((t - start) / duration);
export const rad = deg => deg * Math.PI / 180;
export const TRANSFORM_DURATION = motion.durationSeconds;
export const KEY_BEATS = Object.freeze(motion.keys.map(({ id, t }) => ({ id, time: t })));
export const TRACKS = motion.tracks;
export const INTRO_PROFILES = motion.introProfiles;
export const FOOT_CONTACTS = motion.footContacts;

export function beatAt(t) {
  return KEY_BEATS.findLast(beat => beat.time <= Math.max(t, 0) + 1e-9).id;
}

function bezier(u, a, b) {
  const inverse = 1 - u;
  return 3 * inverse * inverse * u * a + 3 * inverse * u * u * b + u ** 3;
}

export function curveAt(name, fraction) {
  if (fraction <= 0) return 0;
  if (fraction >= 1) return 1;
  const [x1, y1, x2, y2] = motion.curves[name];
  let low = 0;
  let high = 1;
  for (let i = 0; i < 18; i++) {
    const u = (low + high) / 2;
    if (bezier(u, x1, x2) < fraction) low = u;
    else high = u;
  }
  return bezier((low + high) / 2, y1, y2);
}

export function sampleTrack(track, time) {
  let value = track.initial;
  for (const segment of track.segments) {
    if (time <= segment.start) return value;
    if (time < segment.end) {
      const fraction = (time - segment.start) / (segment.end - segment.start);
      return mix(segment.from, segment.to, curveAt(segment.ease, fraction));
    }
    value = segment.to;
  }
  return value;
}

export function introProgress(profile, time) {
  return curveAt(profile.ease, (time - profile.start) / profile.duration);
}

export function sampleMotion(time) {
  return Object.fromEntries(Object.entries(TRACKS).map(([id, track]) => [id, sampleTrack(track, time)]));
}

function seeded(seed, form, key) {
  // Form and channel IDs are ASCII. Each channel owns its random stream.
  const label = `${seed}:${form}:${key}`;
  let state = 2166136261;
  for (let i = 0; i < label.length; i++) state = Math.imul(state ^ label.charCodeAt(i), 16777619) >>> 0;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
}

function idleValue(channel, time, random) {
  if (channel.type === 'independentOscillators') {
    return channel.offset + channel.amp * channel.periods.reduce((sum, period, index) => (
      sum + channel.weights[index] * Math.sin(2 * Math.PI * (time / period + random()))
    ), 0);
  }
  let previous = 0;
  for (let remaining = time; remaining > 0;) {
    const dwell = mix(...channel.dwell, random());
    const movement = mix(...channel.movement, random());
    const target = mix(...channel.amplitude, random());
    if (remaining <= dwell) return previous;
    remaining -= dwell;
    if (remaining <= movement) return mix(previous, target, curveAt(channel.profile, remaining / movement));
    remaining -= movement;
    previous = target;
  }
  return previous;
}

export function sampleIdle(form, time, seed) {
  const channels = motion.idle[form].filter(channel => channel.type !== 'continuousRotation');
  const byId = Object.fromEntries(channels.map(channel => [channel.channel, channel]));
  return Object.fromEntries(channels.map(channel => {
    const follower = channel.type === 'laggedFollower';
    const source = follower ? byId[channel.source] : channel;
    const elapsed = follower ? Math.max(0, time - channel.lag) : time;
    const value = idleValue(source, elapsed, seeded(seed, form, source.seedKey));
    return [channel.channel, follower ? value * channel.gain : value];
  }));
}

export function regulatorRotation(readyTime, transformTime, seed) {
  const capsule = motion.idle.capsule.find(channel => channel.channel === 'shell.regulator.rotation');
  const mantis = motion.idle.mantis.find(channel => channel.channel === 'shell.regulator.rotation');
  const phase = capsule.phaseFromSeed ? 360 * seeded(seed, 'capsule', capsule.channel)() : 0;
  const elapsed = Math.max(0, transformTime);
  const sweep = Math.min(elapsed, TRANSFORM_DURATION);
  const spin = (readyTime - elapsed + sweep) * capsule.degPerSecond
    + (mantis.degPerSecond - capsule.degPerSecond) * sweep ** 2 / (2 * TRANSFORM_DURATION)
    + mantis.degPerSecond * (elapsed - sweep);
  return rad(phase + spin);
}
