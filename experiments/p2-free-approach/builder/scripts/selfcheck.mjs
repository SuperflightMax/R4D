import assert from 'node:assert/strict';
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { root, pins, defaults, verifyInputs, sha256 } from './pins.mjs';
import { loadCore } from './native-core.mjs';
import { Controller } from '../src/controller.mjs';
import { transform } from '../inputs/view-math.mjs';

verifyInputs();
const core = await loadCore(process.env.P2_CORE_ROOT || defaults.coreRoot);
const config = JSON.parse(readFileSync(path.join(root, 'inputs/config.json'), 'utf8'));
const manifest = JSON.parse(readFileSync(path.join(root, 'inputs/manifest.json'), 'utf8'));
const beforeConfig = JSON.stringify(config);
assert.deepEqual([config.board.pins.length, config.board.segments.length, config.board.buckets.length, config.board.drops.length], [25, 16, 4, 1]);
assert.deepEqual([config.board.ball.r, config.defaults.tickMs, config.physics.gravityY, config.physics.maxBallSpeed, config.physics.angleDeviationDeg, config.physics.bounceDeviation, config.rng.algo], [16, 5, 980, 2000, 2, 0.02, 'lcg32']);
const reports = [];
for (const seed of [1, 2]) {
  const sim = new Controller(core, config, pins, seed);
  sim.advance(sim.maxTicks);
  const first = sim.snapshot(), events = structuredClone(sim.events), frames = structuredClone(sim.frames);
  assert.ok(first.done);
  assert.ok(sim.contacts.some(event => event.objectKind === 'pin'), 'Must observe a genuine pin collision');
  const reference = core.runHeadlessOnce({ ...structuredClone(config), rng: { ...config.rng, seed } });
  assert.deepEqual({ result: first.result, ticks: first.tick }, { result: reference.result, ticks: reference.ticks }, 'UI controller must match native headless completion');
  const inspectedTicks = [...new Set([0, 1, 100, Math.min(200, first.tick), ...sim.contacts.flatMap(e => [Math.max(0,e.observedAtTick-1),e.observedAtTick,Math.min(first.tick,e.observedAtTick+1)]), first.tick])];
  for (const tick of inspectedTicks) {
    sim.seek(tick);
    assert.deepEqual(sim.snapshot(), frames[tick], `Exact replay differs at seed ${seed}, tick ${tick}`);
  }
  sim.seek(first.tick);
  assert.deepEqual(sim.events, events, 'Replay must preserve native event order and values');
  const stepped = new Controller(core, config, pins, seed);
  while (!stepped.state.done) stepped.advance(1);
  assert.deepEqual(stepped.snapshot(), first, 'Single ticks and bulk playback must agree');
  assert.equal(JSON.stringify(config), beforeConfig, 'Canonical base config was mutated');
  reports.push({ seed, result: first.result, ticks: first.tick, contacts: sim.contacts, trajectorySha256: sha256(Buffer.from(JSON.stringify(frames))), inspectedTicks });
}
assert.notEqual(reports[0].trajectorySha256, reports[1].trajectorySha256, 'Ordinary different seeds must produce different trajectories');
let inverseErrorMax = 0;
for (const point of [...config.board.pins, ...config.board.drops, ...config.board.buckets]) {
  const projected = transform(manifest.projection.nativeToSource, point);
  const inverse = transform(manifest.projection.sourceToNative, projected);
  const error = Math.hypot(inverse.x-point.x, inverse.y-point.y);
  inverseErrorMax = Math.max(inverseErrorMax, error);
  assert.ok(error < 1e-7, `Projection round trip failed for ${point.id}`);
}
const report = { schema:'r4d.p2.builder-selfcheck.v1', checkedAtUtc:new Date().toISOString(), pins, checks:['native-core HEAD and untouched package','accepted input bytes and hashes','controller equals native headless','exact contact frames and seeded replay','single tick equals bulk playback','distinct ordinary seeds','config unchanged','projection inverse'], inverseErrorMax, reports, visualCheck:'not performed by this script' };
const output = path.join(defaults.output, 'selfcheck.json');
mkdirSync(path.dirname(output), { recursive:true });
writeFileSync(output, JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({ pass:true, output, inverseErrorMax, runs:reports.map(r=>({seed:r.seed,result:r.result,ticks:r.ticks,contacts:r.contacts.length})) }));
