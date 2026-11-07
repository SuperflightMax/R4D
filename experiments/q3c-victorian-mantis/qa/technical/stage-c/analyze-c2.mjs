import { readFileSync } from 'node:fs';

const start = '21fbafcfb435838bc84aed931fe68e57cae9fdbc';
const [sha, primaryPath, replayPath] = process.argv.slice(2);
const findings = new Map();
const note = (code, key, tick, value) => {
  const id = code + ':' + key;
  const entry = findings.get(id);
  if (entry) entry.count++;
  else findings.set(id, { code, key, firstTick: tick, firstValue: value, count: 1 });
};
const need = (condition, message) => { if (!condition) throw new Error(message); };
const finite = Number.isFinite;
const pair = p => Array.isArray(p) && p.length === 2 && p.every(finite);
const length = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1]);
const span = values => Math.max(...values) - Math.min(...values);
const canonical = value => {
  if (Array.isArray(value)) return value.map(canonical);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, canonical(value[key])]));
  }
  return value;
};
const same = (a, b) => JSON.stringify(canonical(a)) === JSON.stringify(canonical(b));

function world(frame, anchor) {
  const [a, b, c, d, x, y] = frame.parts[anchor.part].matrix;
  const [u, v] = anchor.at;
  return [a * u + c * v + x, b * u + d * v + y];
}

function verifyRig(trace, label) {
  const { rig, hz, actionTick, sections, keyTicks, preAction } = trace;
  const { parts, hinges, links, soles, tolerances: tol } = rig;
  const ids = Object.keys(parts);
  need(ids.length > 0 && hinges.length > 0 && links.length > 0 && Object.keys(soles).length >= 4, 'Full part, pivot, link and sole inventory required');
  need(finite(rig.U) && rig.U > 0 && finite(rig.floorY), 'Rig units and floor required');
  need(['position', 'contact', 'scale', 'angle'].every(k => finite(tol[k]) && tol[k] > 0), 'Freeze numerical tolerances before analysis');
  need(tol.position <= 0.001 * rig.U && tol.contact <= 0.001 * rig.U && tol.scale <= 0.001 && tol.angle <= 0.001, 'Tolerance exceeds numerical budget');
  for (const id of ids) {
    const p = parts[id];
    need(typeof p.asset === 'string' && p.asset && pair(p.scale) && p.scale.every(x => x > 0), 'Missing asset or fixed scale for ' + id);
    need(finite(p.maxSpeed) && p.maxSpeed >= 0 && finite(p.maxAngularSpeed) && p.maxAngularSpeed >= 0, 'Missing step bound for ' + id);
    need(Array.isArray(p.floorContour) && p.floorContour.every(pair), 'Missing floor contour declaration for ' + id);
    need(p.parent === null || (p.parent in parts && p.parent !== id), 'Invalid parent for ' + id);
  }
  const validAnchor = a => a && a.part in parts && pair(a.at);
  need(hinges.every(h => h.id && validAnchor(h.a) && validAnchor(h.b)), 'Invalid fixed pivot mapping');
  need(links.every(l => l.id && validAnchor(l.a) && validAnchor(l.b) && finite(l.length) && l.length > 0), 'Invalid rigid link mapping');
  need(Object.values(soles).every(a => validAnchor(a) && parts[a.part].floorContour.length >= 3) &&
    new Set(Object.values(soles).map(a => a.part)).size >= 4, 'Independent sole contours and anchors required');

  const names = ['capsuleIdle', 'transform', 'mantisIdle'];
  for (const name of names) need(Array.isArray(sections[name]) && sections[name].length >= 2, 'Missing section ' + name);
  const transform = sections.transform;
  need(preAction.state === 'capsule' && sections.capsuleIdle.every(f => f.state === 'capsule') &&
    sections.mantisIdle.every(f => f.state === 'mantis') && transform.at(-1).state === 'mantis', 'Both actual ready forms are required');
  need(sections.capsuleIdle.at(-1).tick === preAction.tick && sections.mantisIdle[0].tick === transform.at(-1).tick, 'Capture sections must share their boundary ticks');
  const keys = Array.from({ length: 6 }, (_, n) => keyTicks['K' + n]);
  need(keys.every(Number.isSafeInteger) && keys[0] === actionTick && preAction.tick === actionTick && transform[0].tick === actionTick, 'K0 and action tick must agree');
  need(keys.every((tick, i) => !i || tick > keys[i - 1]) && keys[5] < transform.at(-1).tick, 'K1–K5 require ordered, bracketed samples');
  const tokens = Object.fromEntries(ids.map(id => [id, preAction.parts[id]?.token]));
  need(Object.values(tokens).every(x => typeof x === 'string' && x) && new Set(Object.values(tokens)).size === ids.length, 'Unique rendered-instance tokens required');
  const worst = { pivotGap: 0, lengthError: 0, floorPenetration: 0, soleGap: 0, plantedDrift: 0 };
  const scan = (frames, section) => {
    let previous = null;
    let plantedAt = new Map();
    for (const frame of frames) {
      need(Number.isSafeInteger(frame.tick) && (!previous || frame.tick === previous.tick + 1), 'Expected one sample per tick in ' + section);
      need(typeof frame.state === 'string' && frame.state.length > 0 && Array.isArray(frame.events), 'Runtime state and events required');
      const tick = frame.tick;
      const key = id => label + '/' + section + '/' + id;
      if (Object.keys(frame.parts).length !== ids.length || ids.some(id => !(id in frame.parts))) {
        note('PART_SET', key('inventory'), tick, Object.keys(frame.parts));
        previous = null;
        plantedAt = new Map();
        continue;
      }
      for (const id of ids) {
        const part = frame.parts[id];
        const def = parts[id];
        need(Array.isArray(part.matrix) && part.matrix.length === 6 && part.matrix.every(finite), 'Invalid world matrix for ' + id);
        if (part.token !== tokens[id] || part.parent !== def.parent || part.asset !== def.asset) note('IDENTITY', key(id), tick, part.token);
        const [a, b, c, d, x, y] = part.matrix;
        const sx = Math.hypot(a, b), sy = Math.hypot(c, d);
        const shear = sx && sy ? Math.abs((a * c + b * d) / (sx * sy)) : Infinity;
        const baseline = preAction.parts[id].matrix;
        const handedness = m => Math.sign(m[0] * m[3] - m[1] * m[2]);
        if (Math.abs(sx - def.scale[0]) > tol.scale || Math.abs(sy - def.scale[1]) > tol.scale || shear > tol.scale ||
            handedness(part.matrix) !== handedness(baseline) || !handedness(part.matrix)) note('SCALE_SHEAR_OR_REFLECTION', key(id), tick, [sx, sy, shear]);
        if (previous) {
          const m = previous.parts[id].matrix;
          const distance = length([x, y], [m[4], m[5]]);
          const delta = Math.atan2(b, a) - Math.atan2(m[1], m[0]);
          const rotation = Math.abs(Math.atan2(Math.sin(delta), Math.cos(delta)));
          if (distance > def.maxSpeed / hz + tol.position || rotation > def.maxAngularSpeed / hz + tol.angle) {
            note('STEP_BOUND', key(id), tick, [distance, rotation]);
          }
        }
        if (section === 'transform' && tick === actionTick &&
            part.matrix.some((v, i) => Math.abs(v - baseline[i]) > (i < 4 ? Math.max(tol.scale, tol.angle) : tol.position))) {
          note('ACTION_JUMP', key(id), tick, part.matrix);
        }
        for (const at of def.floorContour) {
          const penetration = Math.max(0, world(frame, { part: id, at })[1] - rig.floorY);
          worst.floorPenetration = Math.max(worst.floorPenetration, penetration);
          if (penetration > tol.contact) note('FLOOR_PENETRATION', key(id), tick, penetration);
        }
      }
      for (const h of hinges) {
        const gap = length(world(frame, h.a), world(frame, h.b));
        worst.pivotGap = Math.max(worst.pivotGap, gap);
        if (gap > tol.position) note('PIVOT_GAP', key(h.id), tick, gap);
      }
      for (const link of links) {
        const error = Math.abs(length(world(frame, link.a), world(frame, link.b)) - link.length);
        worst.lengthError = Math.max(worst.lengthError, error);
        if (error > tol.position) note('LINK_LENGTH', key(link.id), tick, error);
      }
      need(Array.isArray(frame.planted) && new Set(frame.planted).size === frame.planted.length, 'Planted support IDs required');
      if (!frame.planted.length || (rig.supportCount && frame.planted.length !== rig.supportCount)) {
        note('SUPPORT_COUNT', key('floor'), tick, frame.planted.length);
      }
      const supportParts = frame.planted.map(id => soles[id]?.part);
      if (new Set(supportParts).size !== supportParts.length) note('DUPLICATE_SUPPORT', key('floor'), tick, supportParts);
      const now = new Map();
      for (const id of frame.planted) {
        need(id in soles, 'Unknown sole ' + id);
        const point = world(frame, soles[id]);
        const gap = Math.abs(point[1] - rig.floorY);
        const anchor = plantedAt.get(id) ?? point;
        const drift = length(point, anchor);
        worst.soleGap = Math.max(worst.soleGap, gap);
        worst.plantedDrift = Math.max(worst.plantedDrift, drift);
        if (gap > tol.contact) note('SOLE_GAP', key(id), tick, gap);
        if (drift > tol.contact) note('PLANTED_DRIFT', key(id), tick, drift);
        now.set(id, anchor);
      }
      plantedAt = now;
      previous = frame;
    }
  };
  scan([preAction], 'preAction');
  for (const name of names) scan(sections[name], name);
  for (const [name, before, after] of [
    ['capsule', sections.capsuleIdle.at(-1), preAction],
    ['mantis', transform.at(-1), sections.mantisIdle[0]]
  ]) for (const id of ids) {
    const a = before.parts[id]?.matrix, b = after.parts[id]?.matrix;
    if (a && b && b.some((v, i) => Math.abs(v - a[i]) > (i < 4 ? Math.max(tol.scale, tol.angle) : tol.position))) {
      note('SAME_TICK_JUMP', label + '/' + name + '/' + id, after.tick, b);
    }
  }
  return worst;
}

const valuesFor = (frames, id) => {
  const values = frames.map(f => f.channels?.[id]);
  need(values.every(finite), 'Missing finite actual channel samples for ' + id);
  return values;
};
const at = (samples, index) => {
  const lo = Math.floor(index);
  return samples[lo] + (samples[Math.min(lo + 1, samples.length - 1)] - samples[lo]) * (index - lo);
};
const crossing = (samples, target) => {
  const i = samples.findIndex(x => x >= target);
  return i - 1 + (target - samples[i - 1]) / (samples[i] - samples[i - 1]);
};

function measureMotion(trace) {
  const { rig, hz, actionTick, sections: { transform: frames } } = trace;
  const required = ['chassis', 'thorax-lower', 'thorax-upper', 'carriage', 'hatch', 'near-arm', 'near-blade', 'far-arm', 'far-blade', 'support-near', 'support-far'];
  need(required.every(role => rig.motion.some(c => c.role === role)), 'Major drive coverage is incomplete');
  need(new Set(rig.motion.map(c => c.id)).size === rig.motion.length, 'Duplicate motion channel IDs');
  const rows = Object.fromEntries(rig.motion.map(def => {
    const { id, noise, minTravel, target, settleBand, overshoot } = def;
    need(['rad', 'u', 'ratio'].includes(def.unit) && finite(noise) && noise >= 0 && finite(minTravel) && minTravel > 5 * noise && finite(target) && finite(settleBand) && settleBand > noise, 'Invalid channel bounds for ' + id);
    need(overshoot && [-1, 1].includes(overshoot.direction) && finite(overshoot.min) && finite(overshoot.max) &&
      (overshoot.min === 0 || overshoot.min > 5 * noise) && overshoot.max >= overshoot.min, 'Invalid overshoot envelope for ' + id);
    const samples = valuesFor(frames, id);
    const travel = [0];
    const velocity = [];
    for (let n = 1; n < samples.length; n++) {
      const delta = samples[n] - samples[n - 1];
      travel.push(travel.at(-1) + Math.abs(delta));
      velocity.push(delta * hz);
    }
    const total = travel.at(-1);
    if (span(samples) < minTravel || !total) {
      note('MOTION_RANGE', id, actionTick, span(samples));
      return [id, null];
    }
    const progress = travel.map(v => v / total);
    const onset = crossing(progress, 0.02);
    const end = crossing(progress, 0.98);
    const shape = Array.from({ length: 17 }, (_, n) => (at(progress, onset + (end - onset) * n / 16) - 0.02) / 0.96);
    const nonlinear = Math.max(...shape.map((v, n) => Math.abs(v - n / 16)));
    const noiseFraction = 5 * noise / (0.96 * total);
    if (nonlinear <= Math.max(0.01, noiseFraction)) note('NO_NONLINEAR_EVIDENCE', id, actionTick + onset, nonlinear);
    const acceleration = velocity.slice(1).map((v, n) => (v - velocity[n]) * hz);
    const peak = velocity.reduce((best, v, n) => Math.abs(v) > Math.abs(velocity[best]) ? n : best, 0);
    const moving = velocity.map(v => Math.abs(v) > Math.max(5 * noise * hz, .01 * Math.abs(velocity[peak])));
    const over = Math.max(0, ...samples.map(v => overshoot.direction * (v - target)));
    if (over + noise < overshoot.min || over > overshoot.max + noise) note('OVERSHOOT', id, actionTick, over);
    const settled = samples.findLastIndex(v => Math.abs(v - target) > settleBand) + 1;
    const tail = samples.length - settled;
    if (tail < Math.ceil(0.1 * hz)) note('NO_SETTLE', id, frames.at(-1).tick, tail);
    return [id, { role: def.role, unit: def.unit, travel: total, onset, end, shape, nonlinear, noiseFraction, peakSpeedTick: actionTick + peak + 1, peakVelocity: velocity[peak], accelerationRange: [Math.min(...acceleration), Math.max(...acceleration)], moving, overshoot: over, settledTick: tail ? actionTick + settled : null, settledSamples: tail }];
  }));
  need(rig.pairs.filter(p => p.distinctShape).length >= 2 && rig.pairs.some(p => p.delayTicks >= 3) && rig.pairs.some(p => p.overlapTicks >= 3), 'Freeze distinct shape, delay and overlap pairs');
  const comparisons = rig.pairs.map(p => {
    need(p.first in rows && p.second in rows && p.first !== p.second, 'Invalid motion pair');
    const a = rows[p.first], b = rows[p.second];
    if (!a || !b) return { ...p, measured: false };
    const difference = Math.max(...a.shape.map((v, n) => Math.abs(v - b.shape[n])));
    const delay = b.onset - a.onset;
    const intervalOverlap = Math.max(0, Math.min(a.end, b.end) - Math.max(a.onset, b.onset));
    const overlap = a.moving.filter((moving, n) => moving && b.moving[n]).length;
    const key = p.first + '/' + p.second;
    if (p.distinctShape && difference <= Math.max(0.02, a.noiseFraction + b.noiseFraction)) note('SHARED_PROFILE_SHAPE', key, actionTick, difference);
    if (p.delayTicks != null && delay + 1e-8 < p.delayTicks) note('DELAY', key, actionTick, delay);
    if (p.overlapTicks != null && overlap + 1e-8 < p.overlapTicks) note('OVERLAP', key, actionTick, overlap);
    return { ...p, measured: true, difference, delay, intervalOverlap, overlap };
  });
  const channels = Object.fromEntries(Object.entries(rows).map(([id, row]) => {
    if (!row) return [id, null];
    const { moving, ...summary } = row;
    return [id, summary];
  }));
  return { channels, comparisons };
}

function lagCorrelation(a, b, maxLag) {
  let best = { absolute: 0, lag: 0 };
  for (let lag = -maxLag; lag <= maxLag; lag++) {
    let n = 0, x = 0, y = 0, xx = 0, yy = 0, xy = 0;
    for (let i = Math.max(0, -lag); i < Math.min(a.length, b.length - lag); i++) {
      const u = a[i], v = b[i + lag];
      n++; x += u; y += v; xx += u * u; yy += v * v; xy += u * v;
    }
    const denominator = Math.sqrt(Math.max(0, n * xx - x * x) * Math.max(0, n * yy - y * y));
    const absolute = denominator ? Math.min(1, Math.abs((n * xy - x * y) / denominator)) : 1;
    if (absolute > best.absolute) best = { absolute, lag };
  }
  return best;
}

function measureIdle(trace, section) {
  const { rig, hz, sections } = trace;
  const frames = sections[section];
  const config = rig.idle[section];
  need(frames.length >= Math.max(12 * hz + 1, config.minSamples) && config.lagSeconds >= 0.5 && config.lagSeconds <= 3, 'Idle needs a full observation window and bounded lag search');
  need(['body', 'eye', 'secondary'].every(role => config.channels.some(c => c.role === role)), 'Idle channels must include body, eye and secondary drive');
  const stride = Math.max(1, Math.floor(hz / 30));
  const tracks = config.channels.map(c => {
    need(finite(c.noise) && c.noise >= 0 && finite(c.minRange) && c.minRange > 5 * c.noise, 'Freeze idle resolution for ' + c.id);
    const values = valuesFor(frames, c.id);
    const range = span(values);
    if (range < c.minRange) note('IDLE_RANGE', section + '/' + c.id, frames[0].tick, range);
    return { ...c, values, range, reduced: values.filter((_, n) => n % stride === 0).map(v => v - values[0]) };
  });
  for (let n = 0; n + hz < frames.length; n += Math.max(1, Math.floor(hz / 2))) {
    if (tracks.every(t => span(t.values.slice(n, n + hz + 1)) < Math.max(5 * t.noise, 0.05 * t.minRange))) {
      note('IDLE_FREEZE', section, frames[n].tick, 'one second');
    }
  }
  const comparisons = [];
  for (let i = 0; i < tracks.length; i++) for (let j = i + 1; j < tracks.length; j++) {
    const a = tracks[i], b = tracks[j];
    if (a.role === b.role) continue;
    const match = lagCorrelation(a.reduced, b.reduced, Math.round(config.lagSeconds * hz / stride));
    comparisons.push({ pair: [a.id, b.id], bestLagTicks: match.lag * stride, bestAbsoluteCorrelation: match.absolute, independent: a.range >= a.minRange && b.range >= b.minRange && match.absolute < 0.985 });
  }
  if (comparisons.filter(p => p.independent).length < 2) note('IDLE_SHARED_WAVEFORM', section, frames[0].tick, comparisons.length);
  return { samples: frames.length, ranges: tracks.map(t => ({ id: t.id, range: t.range })), comparisons };
}

function measureReplay(a, b) {
  const meta = t => ({ sha: t.sha, buildSha256: t.buildSha256, hz: t.hz, seed: t.seed, viewport: t.viewport, inputs: t.inputs, actionTick: t.actionTick, keyTicks: t.keyTicks, rig: t.rig });
  if (!same(meta(a), meta(b))) return { equal: false, firstMismatch: 'metadata' };
  const pose = ({ parts, ...frame }) => ({ ...frame, parts: Object.fromEntries(Object.entries(parts).map(([id, { token, ...p }]) => [id, p])) });
  if (!same(pose(a.preAction), pose(b.preAction))) return { equal: false, firstMismatch: 'preAction' };
  for (const section of ['capsuleIdle', 'transform', 'mantisIdle']) {
    const x = a.sections[section], y = b.sections[section];
    if (x.length !== y.length) return { equal: false, firstMismatch: section + '/length' };
    for (let n = 0; n < x.length; n++) if (!same(pose(x[n]), pose(y[n]))) return { equal: false, firstMismatch: section + '/' + x[n].tick };
  }
  return { equal: true };
}

try {
  need(/^[0-9a-f]{40}$/.test(sha ?? '') && sha !== start && primaryPath && replayPath && primaryPath !== replayPath, 'Usage: node analyze-c2.mjs <CTO candidate SHA> <trace.json> <replay.json>');
  const read = path => JSON.parse(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''));
  const first = read(primaryPath), replay = read(replayPath);
  need(first.captureId && replay.captureId && first.captureId !== replay.captureId, 'Use two separately recorded runs');
  for (const trace of [first, replay]) {
    need(trace.sha === sha && /^[0-9a-f]{64}$/.test(trace.buildSha256) && Number.isInteger(trace.hz) && trace.hz >= 1 && trace.hz <= 480 && Number.isSafeInteger(trace.seed) && trace.seed >= 0 && trace.seed <= 0xffffffff, 'Wrong candidate, build, seed or trace clock');
    need(pair(trace.viewport) && trace.viewport.every(n => n > 0) && Array.isArray(trace.inputs) && trace.inputs.length >= 2, 'Replay input and viewport are required');
  }
  const geometry = { primary: verifyRig(first, 'primary'), replay: verifyRig(replay, 'replay') };
  const motion = measureMotion(first);
  const idle = { capsule: measureIdle(first, 'capsuleIdle'), mantis: measureIdle(first, 'mantisIdle') };
  const determinism = measureReplay(first, replay);
  if (!determinism.equal) note('REPLAY_DIVERGENCE', 'seed-' + first.seed, first.actionTick, determinism.firstMismatch);
  const rendererAudit = { primary: first.audit, replay: replay.audit };
  for (const [name, audit] of Object.entries(rendererAudit)) for (const f of audit?.findings ?? []) {
    note(f.code, name + '/' + f.id, f.tick, f.measured);
  }
  console.log(JSON.stringify({ sha, buildSha256: first.buildSha256, keyTicks: first.keyTicks, geometry, rendererAudit, motion, idle, determinism, findings: [...findings.values()] }, null, 2));
  if (findings.size) process.exitCode = 3;
} catch (error) {
  console.error('INVALID_OR_INCOMPLETE_TRACE: ' + error.message);
  process.exitCode = 2;
}
