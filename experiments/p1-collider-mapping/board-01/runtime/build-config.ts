import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Point = [number, number];
type Circle = { id: string; shape: 'circle'; centerFlat: Point; radiusFlat: number };
type Goal = { id: string; shape: 'bucketCircle'; centerFlat: Point; radiusFlat: number };
type Bound = { id: string; from: Point; to: Point };
type Mapping = {
  schema: string;
  source: { sha256: string };
  coordinates: {
    flatExtent: { x: Point; y: Point };
    domains: {
      playable: { x: Point; y: Point };
      receiverApron: { x: Point; y: Point };
    };
  };
  start: { id: string; positionFlat: Point; directionFlat: Point };
  bounds: Bound[];
  goals: Goal[];
  obstacles: Circle[];
};

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const mappingPath = path.resolve(
  process.env.BOARD_01_MAPPING_PATH
    ?? path.join(runtimeDir, '..', '..', 'research', 'board-01-jungle', 'mapping-v0.1.json')
);
const expectedResearchCommit = '92df55715867916669bc370a8040d6bf7d3e1eb7';
const expectedSchema = 'r4d.p1.board-01.mapping.v0.1';
const expectedResearchCanonicalSha256 = '9a248421ad8453d839940bccf7e9838e9091ffa83ab40e1b50998f57e7041d5c';
const expectedJsSemanticSha256 = '25c72590f39559b6d775d485731d3138e0f91f05f02165fb5c940d0962a0cb7d';
const expectedImageSha256 = 'c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72';

function sha256(text: string): string
{
  return createHash('sha256').update(text).digest('hex');
}

function isFinitePoint(point: Point): boolean
{
  return point.length === 2 && point.every(Number.isFinite);
}

function same(value: unknown, expected: unknown): boolean
{
  return JSON.stringify(value) === JSON.stringify(expected);
}

const mappingText = await readFile(mappingPath, 'utf8');
const mapping = JSON.parse(mappingText) as Mapping;
if (mapping.schema !== expectedSchema)
{
  throw new Error(`unexpected board-01 mapping schema: ${mapping.schema}`);
}
if (mapping.source.sha256 !== expectedImageSha256)
{
  throw new Error('board-01 mapping points to an unexpected source image');
}
if (sha256(JSON.stringify(mapping)) !== expectedJsSemanticSha256)
{
  throw new Error('board-01 mapping semantic content differs from frozen Research');
}
if (mapping.obstacles.length !== 25 || mapping.goals.length !== 4 || mapping.bounds.length !== 8)
{
  throw new Error('board-01 mapping primitive inventory differs from frozen Research');
}
if (!same(mapping.coordinates.flatExtent, { x: [0, 1000], y: [0, 1180] })
  || !same(mapping.coordinates.domains.playable, { x: [0, 1000], y: [0, 1000] })
  || !same(mapping.coordinates.domains.receiverApron, { x: [0, 1000], y: [1000, 1180] }))
{
  throw new Error('board-01 playable/apron domains differ from frozen Research');
}

const ids = new Set<string>();
for (const item of [...mapping.obstacles, ...mapping.goals, ...mapping.bounds, mapping.start])
{
  if (ids.has(item.id)) throw new Error(`duplicate mapping id: ${item.id}`);
  ids.add(item.id);
}
for (const obstacle of mapping.obstacles)
{
  if (obstacle.shape !== 'circle' || !isFinitePoint(obstacle.centerFlat)
    || !Number.isFinite(obstacle.radiusFlat) || obstacle.radiusFlat <= 0)
  {
    throw new Error(`invalid circle obstacle: ${obstacle.id}`);
  }
  const [x, y] = obstacle.centerFlat;
  if (x - obstacle.radiusFlat < 0 || x + obstacle.radiusFlat > 1000
    || y - obstacle.radiusFlat < 0 || y + obstacle.radiusFlat > 1000)
  {
    throw new Error(`obstacle is outside playable bounds: ${obstacle.id}`);
  }
}
for (const goal of mapping.goals)
{
  if (goal.shape !== 'bucketCircle' || !isFinitePoint(goal.centerFlat)
    || !Number.isFinite(goal.radiusFlat) || goal.radiusFlat !== 26)
  {
    throw new Error(`invalid bucket goal: ${goal.id}`);
  }
  const [x, y] = goal.centerFlat;
  if (x - goal.radiusFlat < 0 || x + goal.radiusFlat > 1000
    || y - goal.radiusFlat <= 1000 || y + goal.radiusFlat >= 1180)
  {
    throw new Error(`goal is outside receiver apron: ${goal.id}`);
  }
}
for (const bound of mapping.bounds)
{
  if (!isFinitePoint(bound.from) || !isFinitePoint(bound.to))
  {
    throw new Error(`non-finite bound: ${bound.id}`);
  }
}

const pins = mapping.obstacles.map((obstacle) => ({
  id: obstacle.id,
  x: obstacle.centerFlat[0],
  y: obstacle.centerFlat[1],
  r: obstacle.radiusFlat,
  bounce: 0.8,
  integrity: 0.9
}));
const explicitBounds = mapping.bounds
  .filter((bound) => !['bound-far', 'bound-left', 'bound-right'].includes(bound.id))
  .map((bound) => ({
    id: bound.id,
    x1: bound.from[0],
    y1: bound.from[1],
    x2: bound.to[0],
    y2: bound.to[1],
    bounce: 0.78,
    integrity: 0.9
  }));
const buckets = mapping.goals.map((goal) => ({
  id: goal.id,
  x: goal.centerFlat[0],
  y: goal.centerFlat[1],
  r: goal.radiusFlat,
  prizeMul: 1
}));
const angleDeg = Math.atan2(mapping.start.directionFlat[1], mapping.start.directionFlat[0]) * 180 / Math.PI;

const config = {
  defaults: { tickMs: 8, quantizeDigits: 7 },
  board: {
    width: 1000,
    height: 1180,
    timeSecMin: 0.5,
    timeSecMax: 20,
    ball: { id: 'ball-01', r: 18, bounce: 0.86 },
    drops: [{
      id: mapping.start.id,
      x: mapping.start.positionFlat[0],
      y: mapping.start.positionFlat[1],
      angleDeg,
      speed: 0
    }],
    pins,
    segments: explicitBounds,
    buckets
  },
  physics: {
    gravityY: 620,
    maxBallSpeed: 1300,
    angleDeviationDeg: 2,
    bounceDeviation: 0.025,
    wallBounce: 0.78
  },
  rng: { algo: 'lcg32', seed: 0 }
};

const configText = `${JSON.stringify(config, null, 2)}\n`;
const mappingTable = [
  { mappingId: mapping.start.id, mappingShape: 'start', simKind: 'drop', simIds: [mapping.start.id] },
  ...mapping.obstacles.map((obstacle) => ({
    mappingId: obstacle.id,
    mappingShape: obstacle.shape,
    simKind: 'pin',
    simIds: [obstacle.id]
  })),
  ...mapping.bounds.map((bound) => ({
    mappingId: bound.id,
    mappingShape: 'segment',
    simKind: ['bound-far', 'bound-left', 'bound-right'].includes(bound.id) ? 'implicit-wall' : 'segment',
    simIds: [bound.id === 'bound-far' ? 'wall_top'
      : bound.id === 'bound-left' ? 'wall_left'
        : bound.id === 'bound-right' ? 'wall_right'
          : bound.id]
  })),
  ...mapping.goals.map((goal) => ({
    mappingId: goal.id,
    mappingShape: goal.shape,
    simKind: 'bucket',
    simIds: [goal.id]
  }))
];
const manifest = {
  schemaVersion: 1,
  board: '01-jungle',
  mapping: {
    commit: expectedResearchCommit,
    schema: mapping.schema,
    canonicalization: 'Research Python json.dumps(ensure_ascii=False,separators=(comma,colon))',
    canonicalSha256: expectedResearchCanonicalSha256,
    jsSemanticSha256: expectedJsSemanticSha256,
    sourceImageSha256: expectedImageSha256
  },
  simCoreCommit: '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023',
  config: {
    file: 'board-01-config.v1.json',
    sha256: sha256(configText),
    simulationDomain: {
      width: 1000,
      height: 1180,
      playablePlaneY: [0, 1000],
      receiverApronY: [1000, 1180]
    },
    counts: {
      pins: pins.length,
      explicitSegments: explicitBounds.length,
      implicitWalls: 3,
      buckets: buckets.length,
      drops: 1
    },
    ballRadiusFlat: config.board.ball.r,
    goalMapping: 'direct bucketCircle centerFlat/radiusFlat transfer',
    implicitBounds: {
      mapped: ['bound-far', 'bound-left', 'bound-right'],
      apronBehavior: 'Millionko implicit left/right walls use board.height and continue through y=1000..1180; top remains wall_top'
    }
  },
  mappingTable
};

await writeFile(path.join(runtimeDir, 'board-01-config.v1.json'), configText, 'utf8');
await writeFile(path.join(runtimeDir, 'board-01-config.manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`wrote board-01 config sha256=${manifest.config.sha256}`);
