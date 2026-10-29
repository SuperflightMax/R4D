// Compare actual browser snapshots to existing independent traces. Never runs core.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const root = 'E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water';
const sha = b => createHash('sha256').update(b).digest('hex');
const config = JSON.parse(readFileSync(root + '/input-oracle-001/common/config.json'));
const traces = {}, events = {};
for (const seed of [0, 1, 2, 3]) {
  traces[seed] = readFileSync(root + `/input-oracle-001/private/seed-${seed}/states.ndjson`, 'utf8').trimEnd().split('\n').map(JSON.parse);
  events[seed] = JSON.parse(readFileSync(root + `/input-oracle-001/private/seed-${seed}/events.json`));
}
const results = [];
for (const name of readdirSync(root + '/w01/snapshots').filter(x => x.endsWith('.json'))) {
  const bytes = readFileSync(root + '/w01/snapshots/' + name), b = JSON.parse(bytes), seed = b.record.seed, tick = b.state.tick;
  assert(traces[seed], `Unannounced seed ${seed}`);
  assert.deepEqual(b.state, traces[seed][tick], `${name}: native full state`);
  const expected = structuredClone(config); expected.rng.seed = seed;
  assert.deepEqual(b.config, expected, `${name}: config`); assert.deepEqual(b.record.config, expected);
  const actualEvents = b.record.events.map(({ stateTick, ...e }) => e);
  const expectedEvents = events[seed].filter(e => (e.type === 'object_hit' && e.objectKind !== 'bucket' ? e.tick + 1 : e.tick) <= tick);
  assert.deepEqual(actualEvents, expectedEvents, `${name}: events`);
  assert.equal(b.meta.pins.configSha256, '9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c');
  assert.equal(b.meta.pins.p1ManifestSha256, '48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420');
  assert.equal(b.meta.pins.core.sourceCommit, '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023');
  const diagnostics = JSON.parse(b.diagnostics);
  results.push({ file: name, bytes: bytes.length, sha256: sha(bytes), seed, tick, rngU32: b.state.rngU32, result: b.state.result ?? null, nativeStateExact: true, configExact: true, eventsExact: true, view: b.view, footprintFits: diagnostics.footprintFits });
}
const output = { utc: new Date().toISOString(), oracleCommit: '761e6087c902fe5ea941b90b5ce4d72383a0d755', snapshots: results.length, results, noNewOracleRuns: true };
writeFileSync(root + '/w01/browser-comparison.json', JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ snapshots: results.length, allStatesConfigRngEventsExact: true, terminalResults: results.filter(x => x.result).map(({ file, seed, tick, result }) => ({ file, seed, tick, result })), footprintFits: results[0]?.footprintFits }, null, 2));
