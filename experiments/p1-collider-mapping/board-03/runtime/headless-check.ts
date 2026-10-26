import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createBoard03Adapter, type Board03Snapshot, type SimCorePublicApi } from './sim-adapter.js';

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const boardDir = path.dirname(runtimeDir);
const expectedCommit = '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023';
const sourceRoot = path.resolve(
  process.env.MILLIONKO_SOURCE_ROOT
    ?? path.join(runtimeDir, '..', '..', '..', '..', '..', 'millionko-source', 'sim-builder')
);

function git(...args: string[]): string
{
  return execFileSync('git', ['-C', sourceRoot, ...args], { encoding: 'utf8' }).trim();
}

function pickTrace(snapshot: Board03Snapshot): Board03Snapshot
{
  return snapshot;
}

async function loadJson(relativePath: string): Promise<Record<string, unknown>>
{
  return JSON.parse(await readFile(path.join(runtimeDir, relativePath), 'utf8')) as Record<string, unknown>;
}

async function main(): Promise<void>
{
  assert.equal(git('rev-parse', 'HEAD'), expectedCommit, 'Millionko source view must be pinned to the accepted commit');
  assert.equal(git('rev-parse', '--abbrev-ref', 'HEAD'), 'HEAD', 'Millionko source view must remain detached');

  const version = await loadJson('sim-core-version.json');
  assert.equal(version.package, '@millionko/sim-core');
  assert.equal(version.sourceCommit, expectedCommit);

  const configText = await readFile(path.join(runtimeDir, 'board-03-config.v1.json'), 'utf8');
  const config = JSON.parse(configText) as Record<string, unknown>;
  const configBoard = config.board as Record<string, unknown>;
  const configBuckets = configBoard.buckets as Array<Record<string, unknown>>;
  const configManifest = await loadJson('board-03-config.manifest.json');
  const manifestMapping = configManifest.mapping as Record<string, unknown>;
  const manifestConfig = configManifest.config as Record<string, unknown>;
  assert.equal(manifestMapping.commit, '83e3b0e63ecc3fb7878719c30f59a3b4306fc467');
  assert.equal(manifestMapping.sha256, '070c0fb3f9b6d39601a8230dc2c5b4e792a223872ad611c9de48b8717b387bbf');
  assert.equal(configManifest.simCoreCommit, expectedCommit);
  assert.equal(configBoard.height, 1150, 'simulation domain must include the receiver apron');
  assert.equal((configBoard.pins as unknown[]).length, 7);
  assert.equal((configBoard.segments as unknown[]).length, 61);
  assert.equal(configBuckets.length, 4);
  assert.ok(configBuckets.every((bucket) => bucket.r === 48 && !('nearMiss' in bucket)), 'v0.2 bucket circles must transfer directly');
  assert.equal(
    manifestConfig.sha256,
    createHash('sha256').update(configText.replace(/\r\n/g, '\n')).digest('hex'),
    'config digest must match the Viewer-facing manifest'
  );
  const coreUrl = pathToFileURL(path.join(sourceRoot, String(version.entrypoint))).href;
  const core = await import(coreUrl) as unknown as SimCorePublicApi;
  const adapter = createBoard03Adapter(core, config as never);

  // The first two ordinary uint32 seeds; no trajectory filtering or reroll.
  const seedA = 1;
  const seedB = 2;
  const checkpoints = [0, 1, 120, 360, 720, 1200, 2500];

  function trace(seed: number): { snapshots: Board03Snapshot[]; events: readonly Readonly<Record<string, unknown>>[] }
  {
    const run = adapter.createRun(seed);
    let previous = 0;
    const snapshots = checkpoints.map((tick) =>
    {
      const value = run.stepTicks(tick - previous);
      previous = value.tick;
      return pickTrace(value);
    });
    return { snapshots, events: run.events() };
  }

  const traceA1 = trace(seedA);
  const traceA2 = trace(seedA);
  const traceB = trace(seedB);
  assert.deepEqual(traceA1, traceA2, 'same seed must reproduce the exact trace');
  assert.notDeepEqual(traceA1, traceB, 'ordinary adjacent seeds must produce different traces');
  assert.ok(traceA1.events.some((event) => event.type === 'object_hit'), 'seed A must exercise real collision primitives');
  assert.ok(traceB.events.some((event) => event.type === 'object_hit'), 'seed B must exercise real collision primitives');
  assert.ok(traceA1.snapshots.at(-1)?.done && traceA1.snapshots.at(-1)?.result, 'seed A must record its honest terminal outcome');
  assert.ok(traceB.snapshots.at(-1)?.done && traceB.snapshots.at(-1)?.result, 'seed B must record its honest terminal outcome');

  const single = adapter.createRun(seedA);
  for (let index = 0; index < 360; index += 1)
  {
    single.stepTicks(1);
  }
  const batch = adapter.createRun(seedA);
  assert.deepEqual(single.snapshot(), batch.stepTicks(360), 'single and multi tick stepping must share one state model');
  assert.deepEqual(single.events(), batch.events(), 'single and multi tick stepping must emit the same core events');

  const evidence = {
    schemaVersion: 1,
    simCoreCommit: expectedCommit,
    configFile: 'runtime/board-03-config.v1.json',
    tickMs: adapter.tickMs,
    checkpoints,
    runs: [
      { seed: seedA, ...traceA1 },
      { seed: seedB, ...traceB }
    ]
  };

  const tracePath = path.join(boardDir, 'checks', 'board-03-traces.v1.json');
  if (process.argv.includes('--update-traces'))
  {
    await writeFile(tracePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  }
  else
  {
    const frozen = JSON.parse(await readFile(tracePath, 'utf8')) as unknown;
    assert.deepEqual(evidence, frozen, 'frozen trace differs; update only with an intentional config/core change');
  }

  console.log(`PASS board-03 sim slice: core=${expectedCommit} tickMs=${adapter.tickMs} seeds=${seedA},${seedB}`);
}

await main();
