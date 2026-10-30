// Compare saved actual snapshots with existing independent traces, never run core.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
const candidate = 'd03', board = 'dark';
const base = `E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/${board}`, root = `${base}/${candidate}`;
const frozen = JSON.parse(readFileSync(`${root}/frozen-verification.json`));
const art = JSON.parse(readFileSync(`${frozen.producer}/public/assets/manifest.json`));
const config = JSON.parse(readFileSync(`${base}/input-oracle-001/common/config.json`)), traces = {}, events = {};
const hash = b => createHash('sha256').update(b).digest('hex');
for (const seed of [0, 1, 2, 3]) { traces[seed] = readFileSync(`${base}/input-oracle-001/private/seed-${seed}/states.ndjson`, 'utf8').trimEnd().split('\n').map(JSON.parse); events[seed] = JSON.parse(readFileSync(`${base}/input-oracle-001/private/seed-${seed}/events.json`)); }
const results = [];
for (const file of readdirSync(`${root}/snapshots`).filter(f => f.endsWith('.json'))) {
  const bytes = readFileSync(`${root}/snapshots/${file}`), b = JSON.parse(bytes), seed = b.record.seed, tick = b.state.tick;
  assert(traces[seed]); assert.deepEqual(b.state, traces[seed][tick], file);
  const expected = structuredClone(config); expected.rng.seed = seed; assert.deepEqual(b.config, expected, file); assert.deepEqual(b.record.config, expected);
  assert.deepEqual(b.record.events.map(({ stateTick, ...e }) => e), events[seed].filter(e => (e.type === 'object_hit' && e.objectKind !== 'bucket' ? e.tick + 1 : e.tick) <= tick), file);
  assert.deepEqual(b.meta.manifest, art, `${file}: actual loaded art`);
  assert.equal(b.meta.pins.artistManifest.commit, frozen.artist.commit);
  assert.equal(b.meta.pins.configSha256, frozen.checked.find(f => f.path === 'data/config.json').sha256);
  results.push({ file, bytes: bytes.length, sha256: hash(bytes), seed, tick, rng: b.state.rngU32, result: b.state.result ?? null, stateConfigRngEventsExact: true, loadedArtExact: true, view: b.view });
}
const first = JSON.parse(readFileSync(`${root}/snapshots/${results[0].file}`));
const domain = first.meta.fieldFraming.domainSourcePx;
for (const r of results) assert.deepEqual(JSON.parse(readFileSync(`${root}/snapshots/${r.file}`)).meta.fieldFraming.domainSourcePx, domain);
const previous = 'd02';
const oldSession = JSON.parse(readFileSync(`${base}/${previous}/browser-session.json`));
const old = JSON.parse(readFileSync(`${base}/${previous}/snapshots/${oldSession.snapshots[0].file ?? oldSession.snapshots[0].label + '.json'}`));
const delta = Object.fromEntries(Object.keys(domain).map(k => [k, domain[k] - old.meta.fieldFraming.domainSourcePx[k]]));
if (candidate === 'd02') assert.deepEqual(domain, old.meta.fieldFraming.domainSourcePx);
const output = { candidate, board, oracleCommit: '761e6087c902fe5ea941b90b5ce4d72383a0d755', snapshots: results.length, results, fieldDomain: domain, fieldDomainFixedAcrossStates: true, previousFieldDomain: old.meta.fieldFraming.domainSourcePx, fieldDelta: delta, noNewOracleRuns: true };
writeFileSync(`${root}/browser-comparison.json`, JSON.stringify(output, null, 2) + '\n');
console.log(JSON.stringify({ candidate, snapshots: results.length, sampledStatesAndLoadedArtExact: true, fieldDelta: delta }, null, 2));
