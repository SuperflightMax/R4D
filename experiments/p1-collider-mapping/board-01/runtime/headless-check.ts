import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createBoard01Adapter, type Board01Snapshot, type SimCorePublicApi } from './sim-adapter.js';

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const boardDir = path.dirname(runtimeDir);
const expectedCoreCommit = '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023';
const expectedMappingSha = '9a248421ad8453d839940bccf7e9838e9091ffa83ab40e1b50998f57e7041d5c';
const sourceRoot = path.resolve(
  process.env.MILLIONKO_SOURCE_ROOT
    ?? path.join(runtimeDir, '..', '..', '..', '..', '..', 'millionko-source', 'sim-builder')
);

function git(...args: string[]): string
{
  return execFileSync('git', ['-C', sourceRoot, ...args], { encoding: 'utf8' }).trim();
}

async function loadJson(name: string): Promise<Record<string, unknown>>
{
  return JSON.parse(await readFile(path.join(runtimeDir, name), 'utf8')) as Record<string, unknown>;
}

function finiteNumbers(value: unknown): boolean
{
  if (typeof value === 'number') return Number.isFinite(value);
  if (Array.isArray(value)) return value.every(finiteNumbers);
  if (value && typeof value === 'object') return Object.values(value).every(finiteNumbers);
  return true;
}

async function main(): Promise<void>
{
  assert.equal(git('rev-parse', 'HEAD'), expectedCoreCommit, 'Millionko source view must stay at the accepted commit');
  assert.equal(git('rev-parse', '--abbrev-ref', 'HEAD'), 'HEAD', 'Millionko source view must stay detached');

  const version = await loadJson('sim-core-version.json');
  assert.equal(version.package, '@millionko/sim-core');
  assert.equal(version.sourceCommit, expectedCoreCommit);

  const configText = await readFile(path.join(runtimeDir, 'board-01-config.v1.json'), 'utf8');
  const config = JSON.parse(configText) as Record<string, unknown>;
  const board = config.board as Record<string, unknown>;
  const drops = board.drops as Array<Record<string, number | string>>;
  const pins = board.pins as Array<Record<string, number | string>>;
  const segments = board.segments as Array<Record<string, number | string>>;
  const buckets = board.buckets as Array<Record<string, number | string>>;
  const manifest = await loadJson('board-01-config.manifest.json');
  const manifestMapping = manifest.mapping as Record<string, unknown>;
  const manifestConfig = manifest.config as Record<string, unknown>;
  const mappingTable = manifest.mappingTable as Array<Record<string, unknown>>;
  const mapping = JSON.parse(await readFile(
    path.join(boardDir, '..', 'research', 'board-01-jungle', 'mapping-v0.1.json'),
    'utf8'
  )) as Record<string, unknown>;
  const mappingStart = mapping.start as Record<string, unknown>;
  const mappingObstacles = mapping.obstacles as Array<Record<string, unknown>>;
  const mappingBounds = mapping.bounds as Array<Record<string, unknown>>;
  const mappingGoals = mapping.goals as Array<Record<string, unknown>>;

  assert.equal(manifestMapping.canonicalSha256, expectedMappingSha);
  assert.equal(
    createHash('sha256').update(JSON.stringify(mapping)).digest('hex'),
    manifestMapping.jsSemanticSha256,
    'machine-readable mapping must match the frozen semantic digest'
  );
  assert.equal(manifest.simCoreCommit, expectedCoreCommit);
  assert.equal(manifestConfig.sha256, createHash('sha256').update(configText).digest('hex'));
  assert.ok(finiteNumbers(config), 'config must contain only finite numeric values');
  assert.equal(board.width, 1000);
  assert.equal(board.height, 1180);
  assert.equal(pins.length, 25);
  assert.equal(segments.length, 5);
  assert.equal(buckets.length, 4);
  assert.equal(mappingTable.length, 38);
  assert.ok(pins.every((pin) => Number(pin.x) - Number(pin.r) >= 0
    && Number(pin.x) + Number(pin.r) <= 1000
    && Number(pin.y) - Number(pin.r) >= 0
    && Number(pin.y) + Number(pin.r) <= 1000));
  assert.ok(segments.every((item) => [item.x1, item.x2].every((x) => Number(x) >= 0 && Number(x) <= 1000)
    && [item.y1, item.y2].every((y) => Number(y) >= 0 && Number(y) <= 1180)));
  assert.ok(buckets.every((bucket) => bucket.r === 26
    && Number(bucket.x) - 26 >= 0 && Number(bucket.x) + 26 <= 1000
    && Number(bucket.y) - 26 > 1000 && Number(bucket.y) + 26 < 1180));

  const startPosition = mappingStart.positionFlat as number[];
  assert.deepEqual(
    drops.map((drop) => ({ id: drop.id, x: drop.x, y: drop.y, angleDeg: drop.angleDeg })),
    [{ id: mappingStart.id, x: startPosition[0], y: startPosition[1], angleDeg: 90 }],
    'mapping start must transfer exactly to the drop'
  );
  assert.deepEqual(
    pins.map((pin) => ({ id: pin.id, x: pin.x, y: pin.y, r: pin.r })),
    mappingObstacles.map((obstacle) => {
      const center = obstacle.centerFlat as number[];
      return { id: obstacle.id, x: center[0], y: center[1], r: obstacle.radiusFlat };
    }),
    'all mapping circles must transfer exactly to pins'
  );
  const explicitMappingBounds = mappingBounds.filter((bound) => !['bound-far', 'bound-left', 'bound-right'].includes(String(bound.id)));
  assert.deepEqual(
    segments.map((item) => ({ id: item.id, x1: item.x1, y1: item.y1, x2: item.x2, y2: item.y2 })),
    explicitMappingBounds.map((bound) => {
      const from = bound.from as number[];
      const to = bound.to as number[];
      return { id: bound.id, x1: from[0], y1: from[1], x2: to[0], y2: to[1] };
    }),
    'all explicit mapping bounds must transfer exactly to segments'
  );
  assert.deepEqual(
    buckets.map((bucket) => ({ id: bucket.id, x: bucket.x, y: bucket.y, r: bucket.r })),
    mappingGoals.map((goal) => {
      const center = goal.centerFlat as number[];
      return { id: goal.id, x: center[0], y: center[1], r: goal.radiusFlat };
    }),
    'all mapping bucket circles must transfer exactly to buckets'
  );

  const coreUrl = pathToFileURL(path.join(sourceRoot, String(version.entrypoint))).href;
  const core = await import(coreUrl) as unknown as SimCorePublicApi;
  const adapter = createBoard01Adapter(core, config as never);
  const checkpoints = [0, 1, 120, 360, 720, 1200, 2500];

  function trace(seed: number): { snapshots: Board01Snapshot[]; events: readonly Readonly<Record<string, unknown>>[] }
  {
    const run = adapter.createRun(seed);
    let previous = 0;
    const snapshots = checkpoints.map((tick) =>
    {
      const value = run.stepTicks(tick - previous);
      previous = value.tick;
      return value;
    });
    return { snapshots, events: run.events() };
  }

  const trace1a = trace(1);
  const trace1b = trace(1);
  const trace2 = trace(2);
  assert.deepEqual(trace1a, trace1b, 'same seed must replay exactly');
  assert.notDeepEqual(trace1a, trace2, 'ordinary adjacent seeds must differ');
  assert.ok(trace1a.events.some((event) => event.type === 'object_hit'), 'seed 1 must exercise real collisions');
  assert.ok(trace2.events.some((event) => event.type === 'object_hit'), 'seed 2 must exercise real collisions');
  assert.ok(trace1a.snapshots.at(-1)?.done && trace1a.snapshots.at(-1)?.result, 'seed 1 must record terminal outcome');
  assert.ok(trace2.snapshots.at(-1)?.done && trace2.snapshots.at(-1)?.result, 'seed 2 must record terminal outcome');

  const single = adapter.createRun(1);
  for (let index = 0; index < 360; index += 1) single.stepTicks(1);
  const batch = adapter.createRun(1);
  assert.deepEqual(single.snapshot(), batch.stepTicks(360), 'single/multi tick states must match');
  assert.deepEqual(single.events(), batch.events(), 'single/multi tick events must match');

  const evidence = {
    schemaVersion: 1,
    board: '01-jungle',
    simCoreCommit: expectedCoreCommit,
    mappingCanonicalSha256: expectedMappingSha,
    configFile: 'runtime/board-01-config.v1.json',
    tickMs: adapter.tickMs,
    checkpoints,
    runs: [
      { seed: 1, ...trace1a },
      { seed: 2, ...trace2 }
    ]
  };
  const tracePath = path.join(boardDir, 'checks', 'board-01-traces.v1.json');
  if (process.argv.includes('--update-traces'))
  {
    await mkdir(path.dirname(tracePath), { recursive: true });
    await writeFile(tracePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  }
  else
  {
    assert.deepEqual(evidence, JSON.parse(await readFile(tracePath, 'utf8')), 'frozen board-01 trace differs');
  }

  console.log(`PASS board-01 sim slice: core=${expectedCoreCommit} tickMs=${adapter.tickMs} seeds=1,2`);
}

await main();
