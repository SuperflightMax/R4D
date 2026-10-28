import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createHash } from 'node:crypto';
import { runtime } from './runtime.mjs';

const id = process.argv[2];
if (!id || !/^[a-z0-9-]+$/.test(id)) throw new Error('New evidence id required');
const folder = resolve(runtime, 'evidence', id);
mkdirSync(folder); // Do not overwrite previous evidence.
const site = resolve(runtime, 'site');
const config = JSON.parse(readFileSync(resolve(site, 'data/config.json')));
const inputs = JSON.parse(readFileSync(resolve(site, 'data/input-verification.json')));
const preview = JSON.parse(readFileSync(resolve(site, 'data/preview-input.json')));
const pins = { acceptedInputs: inputs, artistManifest: preview.artistManifest,
  appSha256: createHash('sha256').update(readFileSync(resolve(site, 'app.js'))).digest('hex') };
const { NativeRun } = await import(pathToFileURL(resolve(runtime, 'output/controller.mjs')));
const coverage = new Set(['flower-07', 'leaf-05', 'frog-05', 'wood-04', 'receiver-01']);
const records = [];
// These were already observed through the real browser UI; this script only
// preserves their exact consumer replay and windows. No new seed search.
for (const seed of [0, 1696420279]) {
  const run = new NativeRun(config, pins);
  if (seed !== 0) run.reset(seed);
  const states = [run.snapshot()];
  while (!run.snapshot().done) states.push(run.step());
  const record = run.replayRecord();
  const coveredEvents = record.events.filter(e => coverage.has(e.objectId ?? e.bucketId));
  const windows = coveredEvents.map(event => ({ event, states: [event.stateTick - 1, event.stateTick, event.stateTick + 1].filter(t => t >= 0 && t < states.length).map(t => states[t]) }));
  const trace = states.map(state => JSON.stringify(state)).join('\n') + '\n';
  const replay = JSON.stringify({ ...record, observationBasis: seed === 0 ? 'Default UI seed, seek/replay observed in browser' : 'First New throw crypto uint32, observed in browser without seed selection', coveredEvents, coveredWindows: windows }, null, 2) + '\n';
  writeFileSync(resolve(folder, `seed-${seed}.states.ndjson`), trace);
  writeFileSync(resolve(folder, `seed-${seed}.replay.json`), replay);
  records.push({ seed, terminal: run.snapshot(), stateCount: states.length,
    coveredEvents: coveredEvents.map(e => ({ type: e.type, objectId: e.objectId ?? e.bucketId, eventTick: e.tick, stateTick: e.stateTick })),
    trace: { file: `seed-${seed}.states.ndjson`, bytes: Buffer.byteLength(trace), sha256: createHash('sha256').update(trace).digest('hex') },
    replay: { file: `seed-${seed}.replay.json`, bytes: Buffer.byteLength(replay), sha256: createHash('sha256').update(replay).digest('hex') } });
}
const index = JSON.stringify({ schema: 'r4d.p5.replay-evidence/1', id, pins, records, scope: 'Preservation of two already observed seeds through the actual consumer controller; not independent QA or a repeated source-oracle matrix' }, null, 2) + '\n';
writeFileSync(resolve(folder, 'index.json'), index);
console.log(JSON.stringify({ index: resolve(folder, 'index.json'), indexBytes: Buffer.byteLength(index), indexSha256: createHash('sha256').update(index).digest('hex'), records }));
