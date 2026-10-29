// Transpile the independently extracted native TS; never publish its sources/build.
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { stripTypeScriptTypes } from 'node:module';

const runtime = path.resolve(process.argv[2]);
const qaDir = path.dirname(fileURLToPath(import.meta.url));
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const stable = value => JSON.stringify(value, (_key, item) => item && typeof item === 'object' && !Array.isArray(item)
  ? Object.fromEntries(Object.keys(item).sort().map(k => [k, item[k]])) : item);
const save = (file, object) => { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, JSON.stringify(object, null, 2)+'\n'); };
const nativeManifestBytes = fs.readFileSync(path.join(runtime, 'native-source-manifest.json'));
const nativeManifest = JSON.parse(nativeManifestBytes);
const receipt = JSON.parse(fs.readFileSync(path.join(qaDir, 'common-inputs.json')));
assert.equal(hash(nativeManifestBytes), receipt.native.source_manifest_sha256);
const buildDir = path.join(runtime, 'native-build');
const compiled = [];
for (const record of nativeManifest) {
  const source = fs.readFileSync(path.join(runtime, 'native-source', record.path));
  assert.equal(hash(source), record.sha256, `native source changed: ${record.path}`);
  if (!record.path.startsWith('packages/sim-core/src/') || !record.path.endsWith('.ts')) continue;
  const relative = record.path.slice('packages/sim-core/src/'.length).replace(/\.ts$/, '.js');
  const output = stripTypeScriptTypes(source.toString('utf8'), { mode: 'transform', sourceMap: false });
  const target = path.join(buildDir, relative);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, output);
  compiled.push({ source: record.path, sourceSha256: record.sha256, output: relative, outputSha256: hash(output) });
}
save(path.join(buildDir, 'package.json'), { type: 'module', private: true });
save(path.join(runtime, 'native-build-manifest.json'), { node: process.version, transformer: 'node:module.stripTypeScriptTypes/transform', files: compiled });
const native = await import(pathToFileURL(path.join(buildDir, 'index.js')));
const cfgBytes = fs.readFileSync(path.join(runtime, 'inputs/common/config.json'));
assert.equal(hash(cfgBytes), 'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db');
const originalCfg = JSON.parse(cfgBytes);
assert.deepEqual(originalCfg.defaults, { tickMs: 5, quantizeDigits: 7 });
assert.equal(originalCfg.board.ball.r, 16);
assert.deepEqual(originalCfg.physics, { gravityY: 980, maxBallSpeed: 2000, angleDeviationDeg: 2, bounceDeviation: 0.02, wallBounce: 1 });
assert.equal(originalCfg.rng.algo, 'lcg32');
native.assertValidConfig(originalCfg);
// Seeds declared before running; every outcome is retained.
const seeds = [0, 1, 2];
function run(seed) {
  const cfg = structuredClone(originalCfg);
  cfg.rng.seed = seed;
  const events = [];
  const session = native.createSimRunSession(cfg, { onEvent: e => events.push(structuredClone(e)) });
  const states = [structuredClone(session.state)];
  const maxTicks = Math.ceil(cfg.board.timeSecMax * 1000 / cfg.defaults.tickMs);
  for (let i = 0; i < maxTicks && !session.state.done; i++) {
    native.stepSimRunSession(session);
    states.push(structuredClone(session.state));
  }
  if (!session.state.done) {
    native.timeoutSimRunSession(session);
    states[states.length - 1] = structuredClone(session.state);
  }
  const rngTransitions = [];
  for (let i = 1; i < states.length; i++) {
    let u32 = states[i-1].rngU32;
    const target = states[i].rngU32;
    let draws = 0;
    while (u32 !== target && draws < 1024) { u32 = (Math.imul(1664525, u32) + 1013904223) >>> 0; draws++; }
    assert.equal(u32, target, `unexplained PRNG transition at state ${i}`);
    if (draws) rngTransitions.push({ beforeTick: states[i-1].tick, afterTick: states[i].tick, from: states[i-1].rngU32, to: target, draws });
  }
  return { seed, cfg, states, events, rngTransitions };
}
const runs = [];
for (const seed of seeds) {
  const first = run(seed), replay = run(seed);
  assert.equal(stable(first), stable(replay), `native replay mismatch seed ${seed}`);
  const headless = native.runUntilDone(first.cfg);
  const last = first.states.at(-1);
  assert.deepEqual(headless.result, last.result);
  assert.equal(headless.ticks, last.tick);
  const artifact = { schema: 'r4d.p6.qa.native-oracle.v1', coreCommit: receipt.native.commit,
    packageTree: receipt.native.package_tree, inputConfigSha256: hash(cfgBytes), ...first };
  const file = path.join(runtime, 'oracle', `seed-${seed}.json`);
  save(file, artifact);
  const collisions = first.events.filter(e => e.type === 'object_hit' && e.objectKind !== 'bucket');
  assert.equal(first.rngTransitions.reduce((sum, t) => sum+t.draws, 0), collisions.length*2);
  const firstHit = collisions[0];
  runs.push({ seed, file: `private-runtime/oracle/seed-${seed}.json`, artifactSha256: hash(fs.readFileSync(file)),
    stateDigest: hash(stable(first.states)), eventDigest: hash(stable(first.events)),
    states: first.states.length, terminal: last, collisionCount: collisions.length,
    prngDraws: first.rngTransitions.reduce((sum, t) => sum+t.draws, 0),
    firstContact: firstHit ? { event: firstHit, stateTicks: [firstHit.tick, firstHit.tick+1, firstHit.tick+2].filter(t => t <= last.tick) } : null,
    replayIdentical: true, headlessTerminalIdentical: true });
}
assert.notEqual(runs[0].stateDigest, runs[1].stateDigest);
// Compare ball positions, not just the seed field or RNG state.
const ordinaryTrajectories = seeds.map(seed => JSON.parse(fs.readFileSync(path.join(runtime, 'oracle', `seed-${seed}.json`))).states.map(s => s.ball));
assert.notEqual(stable(ordinaryTrajectories[0]), stable(ordinaryTrajectories[1]));
assert.notEqual(stable(ordinaryTrajectories[1]), stable(ordinaryTrajectories[2]));
for (const record of nativeManifest) assert.equal(hash(fs.readFileSync(path.join(runtime, 'native-source', record.path))), record.sha256);
const report = { scope: 'independent native oracle preparation; candidate and visual behavior not checked',
  coreCommit: receipt.native.commit, packageTree: receipt.native.package_tree,
  node: process.version, transformedModules: compiled.length,
  buildManifestSha256: hash(fs.readFileSync(path.join(runtime, 'native-build-manifest.json'))),
  sourceManifestSha256: hash(nativeManifestBytes), inputConfigSha256: hash(cfgBytes),
  seedsDeclaredBeforeRun: seeds, allOutcomesRetained: true, runs,
  contactTickRule: 'pin/segment/wall hit tick N is emitted inside transition state N -> state N+1; inspect N,N+1,N+2. Bucket entry uses resulting state tick.' };
save(path.join(qaDir, 'native-oracle-preparation.json'), report);
console.log(JSON.stringify(report, null, 2));
