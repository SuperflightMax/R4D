import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const run = resolve(process.argv[2] ?? '');
const { capture, contactCheck, sha, baseline, buildSha256, oldBuildSha256, previous, legIds } =
  await import(pathToFileURL(join(run, 'contact-probe.mjs')).href);
const candidate = capture(join(run, 'evidence/raw-intro.json.gz'), sha, buildSha256);
const control = capture(new URL('raw-intro.json.gz', previous), baseline, oldBuildSha256);
const currentContact = contactCheck(candidate.frames);
const priorContact = contactCheck(control.frames);

const screenLimit = 6, angularLimit = .25, rearFarTibia = 'walk.rear.far.tibia';
function step(a, b, id) {
  const before = a.parts[id], after = b.parts[id];
  const dx = after.matrix[4] - before.matrix[4], dy = after.matrix[5] - before.matrix[5];
  const yaw = after.world.rotation - before.world.rotation;
  const tilt = (after.world.tilt ?? 0) - (before.world.tilt ?? 0);
  return { id, beforeTick: a.tick, tick: b.tick, screen: Math.hypot(dx, dy),
    angle: 2 * Math.acos(Math.min(1, Math.abs(Math.cos(yaw / 2) * Math.cos(tilt / 2)))) };
}
function maxima(frames, lastTick) {
  const result = { throughTick: lastTick, steps: 0, maxScreen: null, maxAngle: null, findings: [] };
  const ids = Object.keys(frames[0].parts);
  if (ids.length !== 98) throw new Error('Capture must cover all 98 nodes');
  for (let i = 1; i < frames.length && frames[i].tick <= lastTick; i++) {
    for (const id of ids) {
      const s = step(frames[i - 1], frames[i], id);
      result.steps++;
      if (!result.maxScreen || s.screen > result.maxScreen.screen) result.maxScreen = s;
      if (!result.maxAngle || s.angle > result.maxAngle.angle) result.maxAngle = s;
      if (s.screen > screenLimit || s.angle > angularLimit) result.findings.push(s);
    }
  }
  return result;
}
function formerPeak(frames, tick) {
  const i = frames.findIndex(f => f.tick === tick);
  if (i < 1) throw new Error('Former peak missing from trace');
  return step(frames[i - 1], frames[i], rearFarTibia);
}
const firstContact = Math.min(...Object.values(currentContact.soles).map(s => s.firstContact.tick));
const rollout = maxima(candidate.frames, currentContact.supportTick);
const beforeFirstContact = maxima(candidate.frames, firstContact);
const fullIntro = maxima(candidate.frames, candidate.frames.at(-1).tick);
const formerPeaks = [354, 373].map(tick => ({
  baseline: formerPeak(control.frames, tick), candidate: formerPeak(candidate.frames, tick)
}));
const compare = (id, now, before) => ({ id, now, before, equal: now === before });
const boundaries = [
  ...legIds.flatMap(id => [
    compare(id + '.contact', currentContact.soles[id].firstContact.tick, priorContact.soles[id].firstContact.tick),
    compare(id + '.seated', currentContact.soles[id].seatTick, priorContact.soles[id].seatTick),
  ]),
  ...['firstAllInContactTick', 'supportTick', 'loadDriveTick', 'loadOverToleranceTick'].map(id =>
    compare(id, currentContact[id], priorContact[id]))
];
const failures = [];
if (fullIntro.findings.length) failures.push('STEP_BUDGET');
if (currentContact.findings.length) failures.push('CONTACT');
if (boundaries.some(b => !b.equal)) failures.push('CONTACT_BOUNDARY_CHANGED');
if (formerPeaks[0].baseline.screen <= screenLimit || formerPeaks[1].baseline.angle <= angularLimit) failures.push('CONTROL_DID_NOT_REPRODUCE');
console.log(JSON.stringify({ sha, buildSha256, rawSha256: candidate.rawSha256, hz: 120,
  limits: {screenLimit, angularLimit}, rollout, beforeFirstContact, fullIntro, formerPeaks,
  contact: currentContact, boundaries, control: { sha: baseline, rawSha256: control.rawSha256, buildSha256: oldBuildSha256 },
  failures }, null, 2));
if (failures.length) process.exitCode = 3;
