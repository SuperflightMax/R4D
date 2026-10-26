import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createBoard02Adapter, type Board02Snapshot, type SimCorePublicApi } from './sim-adapter.js';

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const boardDir = path.dirname(runtimeDir);
const expectedCoreCommit = '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023';
const expectedMappingSha = '4f5862f5c2a602fccdc4d4419f7b5e6e4049fb807038d386ee3950d9cad24a12';
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

function expandLoop(item: Record<string, unknown>): Array<Record<string, number | string>>
{
  const [cx, cy] = item.centerFlat as number[];
  const [hx, hy] = item.halfExtentsFlat as number[];
  return [
    { id: `${item.id}:top`, x1: cx - hx, y1: cy - hy, x2: cx + hx, y2: cy - hy },
    { id: `${item.id}:right`, x1: cx + hx, y1: cy - hy, x2: cx + hx, y2: cy + hy },
    { id: `${item.id}:bottom`, x1: cx + hx, y1: cy + hy, x2: cx - hx, y2: cy + hy },
    { id: `${item.id}:left`, x1: cx - hx, y1: cy + hy, x2: cx - hx, y2: cy - hy }
  ];
}

async function main(): Promise<void>
{
  assert.equal(git('rev-parse', 'HEAD'), expectedCoreCommit);
  assert.equal(git('rev-parse', '--abbrev-ref', 'HEAD'), 'HEAD');

  const version = await loadJson('sim-core-version.json');
  assert.equal(version.package, '@millionko/sim-core');
  assert.equal(version.sourceCommit, expectedCoreCommit);
  const configText = await readFile(path.join(runtimeDir, 'board-02-config.v1.json'), 'utf8');
  const config = JSON.parse(configText) as Record<string, unknown>;
  const board = config.board as Record<string, unknown>;
  const drops = board.drops as Array<Record<string, number | string>>;
  const pins = board.pins as Array<Record<string, number | string>>;
  const segments = board.segments as Array<Record<string, number | string>>;
  const buckets = board.buckets as Array<Record<string, number | string>>;
  const manifest = await loadJson('board-02-config.manifest.json');
  const manifestMapping = manifest.mapping as Record<string, unknown>;
  const manifestConfig = manifest.config as Record<string, unknown>;
  const mappingTable = manifest.mappingTable as Array<Record<string, unknown>>;
  const mapping = JSON.parse(await readFile(
    path.join(boardDir, '..', 'research', 'board-02-dark-temple', 'mapping-v0.1.json'), 'utf8'
  )) as Record<string, unknown>;
  const mappingStart = mapping.start as Record<string, unknown>;
  const mappingObstacles = mapping.obstacles as Array<Record<string, unknown>>;
  const mappingBounds = mapping.bounds as Array<Record<string, unknown>>;
  const mappingGoals = mapping.goals as Array<Record<string, unknown>>;

  assert.equal(manifestMapping.canonicalSha256, expectedMappingSha);
  assert.equal(createHash('sha256').update(JSON.stringify(mapping)).digest('hex'), manifestMapping.jsSemanticSha256);
  assert.equal(manifest.simCoreCommit, expectedCoreCommit);
  assert.equal(manifestConfig.sha256, createHash('sha256').update(configText).digest('hex'));
  assert.ok(finiteNumbers(config));
  assert.equal(board.width, 1000);
  assert.equal(board.height, 1150);
  assert.equal(pins.length, 12);
  assert.equal(segments.length, 53);
  assert.equal(buckets.length, 4);
  assert.equal(mappingTable.length, 37);

  const start = mappingStart.positionFlat as number[];
  assert.deepEqual(drops.map((item) => ({ id: item.id, x: item.x, y: item.y, angleDeg: item.angleDeg })),
    [{ id: mappingStart.id, x: start[0], y: start[1], angleDeg: 90 }]);
  const circles = mappingObstacles.filter((item) => item.shape === 'circle');
  assert.deepEqual(pins.map((item) => ({ id: item.id, x: item.x, y: item.y, r: item.r })),
    circles.map((item) => {
      const center = item.centerFlat as number[];
      return { id: item.id, x: center[0], y: center[1], r: item.radiusFlat };
    }));
  const loopSegments = mappingObstacles.filter((item) => item.shape === 'axisAlignedSegmentLoop').flatMap(expandLoop);
  const nearSegments = mappingBounds
    .filter((item) => !['bound-far', 'bound-left', 'bound-right'].includes(String(item.id)))
    .map((item) => {
      const from = item.from as number[];
      const to = item.to as number[];
      return { id: String(item.id), x1: from[0], y1: from[1], x2: to[0], y2: to[1] };
    });
  assert.deepEqual(segments.map((item) => ({ id: item.id, x1: item.x1, y1: item.y1, x2: item.x2, y2: item.y2 })),
    [...loopSegments, ...nearSegments]);
  assert.deepEqual(buckets.map((item) => ({ id: item.id, x: item.x, y: item.y, r: item.r })),
    mappingGoals.map((item) => {
      const center = item.centerFlat as number[];
      return { id: item.id, x: center[0], y: center[1], r: item.radiusFlat };
    }));
  assert.ok(pins.every((item) => Number(item.x) - Number(item.r) >= 0
    && Number(item.x) + Number(item.r) <= 1000
    && Number(item.y) - Number(item.r) >= 0 && Number(item.y) + Number(item.r) <= 1000));
  assert.ok(segments.every((item) => [item.x1, item.x2].every((x) => Number(x) >= 0 && Number(x) <= 1000)
    && [item.y1, item.y2].every((y) => Number(y) >= 0 && Number(y) <= 1150)));

  const core = await import(pathToFileURL(path.join(sourceRoot, String(version.entrypoint))).href) as unknown as SimCorePublicApi;
  const adapter = createBoard02Adapter(core, config as never);
  const checkpoints = [0, 1, 120, 360, 720, 1200, 2500];
  function trace(seed: number): { snapshots: Board02Snapshot[]; events: readonly Readonly<Record<string, unknown>>[] }
  {
    const run = adapter.createRun(seed);
    let previous = 0;
    const snapshots = checkpoints.map((tick) => {
      const value = run.stepTicks(tick - previous);
      previous = value.tick;
      return value;
    });
    return { snapshots, events: run.events() };
  }
  const trace1a = trace(1);
  const trace1b = trace(1);
  const trace2 = trace(2);
  assert.deepEqual(trace1a, trace1b);
  assert.notDeepEqual(trace1a, trace2);
  assert.ok(trace1a.events.some((event) => event.type === 'object_hit'));
  assert.ok(trace2.events.some((event) => event.type === 'object_hit'));
  assert.ok(trace1a.snapshots.at(-1)?.done && trace1a.snapshots.at(-1)?.result);
  assert.ok(trace2.snapshots.at(-1)?.done && trace2.snapshots.at(-1)?.result);
  const single = adapter.createRun(1);
  for (let index = 0; index < 360; index += 1) single.stepTicks(1);
  const batch = adapter.createRun(1);
  assert.deepEqual(single.snapshot(), batch.stepTicks(360));
  assert.deepEqual(single.events(), batch.events());

  const evidence = {
    schemaVersion: 1,
    board: '02-dark-temple',
    simCoreCommit: expectedCoreCommit,
    mappingCanonicalSha256: expectedMappingSha,
    configFile: 'runtime/board-02-config.v1.json',
    tickMs: adapter.tickMs,
    checkpoints,
    runs: [{ seed: 1, ...trace1a }, { seed: 2, ...trace2 }]
  };
  const tracePath = path.join(boardDir, 'checks', 'board-02-traces.v1.json');
  if (process.argv.includes('--update-traces'))
  {
    await mkdir(path.dirname(tracePath), { recursive: true });
    await writeFile(tracePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
  }
  else
  {
    assert.deepEqual(evidence, JSON.parse(await readFile(tracePath, 'utf8')));
  }
  console.log(`PASS board-02 sim slice: core=${expectedCoreCommit} tickMs=${adapter.tickMs} seeds=1,2`);
}

await main();
