import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Point = [number, number];
type Bound = { id: string; from: Point; to: Point };
type Goal = { id: string; rectFlat: { x: Point; y: Point } };
type CircleObstacle = { id: string; shape: 'circle'; centerFlat: Point; radiusFlat: number };
type LoopObstacle = { id: string; shape: 'axisAlignedSegmentLoop'; centerFlat: Point; halfExtentsFlat: Point };
type Mapping = {
  schema: string;
  sources: { sourceImage: { sha256: string } };
  coordinateSystems: { flat: { extent: { x: Point; y: Point } } };
  start: { id: string; positionFlat: Point; directionFlat: Point };
  bounds: Bound[];
  goals: Goal[];
  obstacles: Array<CircleObstacle | LoopObstacle>;
};

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const expectedMappingCommit = '071c52477c829cf6dac5ea8b1dec49f23d48d9ca';
const expectedMappingSchema = 'r4d.p1.board-03-mapping.v0.1';
const expectedImageSha256 = 'f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32';
const mappingPath = path.resolve(
  process.env.BOARD_03_MAPPING_PATH
    ?? path.join(runtimeDir, '..', '..', 'research', 'board-03-mapping-v0.1.json')
);

function sha256(text: string): string
{
  return createHash('sha256').update(text).digest('hex');
}

function segment(id: string, from: Point, to: Point): Record<string, unknown>
{
  return {
    id,
    x1: from[0],
    y1: from[1],
    x2: to[0],
    y2: to[1],
    bounce: 0.78,
    integrity: 0.9
  };
}

function expandLoop(obstacle: LoopObstacle): Record<string, unknown>[]
{
  const [cx, cy] = obstacle.centerFlat;
  const [hx, hy] = obstacle.halfExtentsFlat;
  const topLeft: Point = [cx - hx, cy - hy];
  const topRight: Point = [cx + hx, cy - hy];
  const bottomRight: Point = [cx + hx, cy + hy];
  const bottomLeft: Point = [cx - hx, cy + hy];
  return [
    segment(`${obstacle.id}:top`, topLeft, topRight),
    segment(`${obstacle.id}:right`, topRight, bottomRight),
    segment(`${obstacle.id}:bottom`, bottomRight, bottomLeft),
    segment(`${obstacle.id}:left`, bottomLeft, topLeft)
  ];
}

const mappingText = await readFile(mappingPath, 'utf8');
const mapping = JSON.parse(mappingText) as Mapping;
if (mapping.schema !== expectedMappingSchema)
{
  throw new Error(`unexpected mapping schema: ${mapping.schema}`);
}
if (mapping.sources.sourceImage.sha256 !== expectedImageSha256)
{
  throw new Error('mapping points to an unexpected source image');
}
if (mapping.obstacles.length !== 21 || mapping.bounds.length !== 8 || mapping.goals.length !== 4)
{
  throw new Error('mapping inventory differs from Researcher checkpoint');
}

const [minX, maxX] = mapping.coordinateSystems.flat.extent.x;
const [minY, maxY] = mapping.coordinateSystems.flat.extent.y;
if (minX !== 0 || minY !== 0 || maxX !== 1000 || maxY !== 1000)
{
  throw new Error('board 03 runtime requires the accepted 1000x1000 flat plane');
}

const pins = mapping.obstacles
  .filter((obstacle): obstacle is CircleObstacle => obstacle.shape === 'circle')
  .map((obstacle) => ({
    id: obstacle.id,
    x: obstacle.centerFlat[0],
    y: obstacle.centerFlat[1],
    r: obstacle.radiusFlat,
    bounce: 0.8,
    integrity: 0.9
  }));

const obstacleSegments = mapping.obstacles
  .filter((obstacle): obstacle is LoopObstacle => obstacle.shape === 'axisAlignedSegmentLoop')
  .flatMap(expandLoop);

const explicitBounds = mapping.bounds
  .filter((bound) => !['bound-far', 'bound-left', 'bound-right'].includes(bound.id))
  .map((bound) => segment(bound.id, bound.from, bound.to));

const buckets = mapping.goals.map((goal) =>
{
  const width = goal.rectFlat.x[1] - goal.rectFlat.x[0];
  const height = goal.rectFlat.y[1] - goal.rectFlat.y[0];
  return {
    id: goal.id,
    x: (goal.rectFlat.x[0] + goal.rectFlat.x[1]) / 2,
    y: (goal.rectFlat.y[0] + goal.rectFlat.y[1]) / 2,
    r: Math.min(width, height) / 2,
    prizeMul: 1,
    nearMiss: {
      x: (goal.rectFlat.x[0] + goal.rectFlat.x[1]) / 2,
      y: (goal.rectFlat.y[0] + goal.rectFlat.y[1]) / 2,
      r: Math.min(width / 2, 60)
    }
  };
});

const direction = mapping.start.directionFlat;
const angleDeg = Math.atan2(direction[1], direction[0]) * 180 / Math.PI;
const config = {
  defaults: { tickMs: 8, quantizeDigits: 7 },
  board: {
    width: maxX,
    height: maxY,
    timeSecMin: 0.5,
    timeSecMax: 20,
    ball: { id: 'ball-03', r: 18, bounce: 0.86 },
    drops: [{
      id: mapping.start.id,
      x: mapping.start.positionFlat[0],
      y: mapping.start.positionFlat[1],
      angleDeg,
      speed: 0
    }],
    pins,
    segments: [...obstacleSegments, ...explicitBounds],
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
  ...mapping.obstacles.map((obstacle) => ({
    mappingId: obstacle.id,
    simKind: obstacle.shape === 'circle' ? 'pin' : 'segments',
    simIds: obstacle.shape === 'circle'
      ? [obstacle.id]
      : ['top', 'right', 'bottom', 'left'].map((side) => `${obstacle.id}:${side}`)
  })),
  ...mapping.bounds.map((bound) => ({
    mappingId: bound.id,
    simKind: ['bound-far', 'bound-left', 'bound-right'].includes(bound.id) ? 'implicit-wall' : 'segment',
    simIds: [bound.id === 'bound-far' ? 'wall_top'
      : bound.id === 'bound-left' ? 'wall_left'
        : bound.id === 'bound-right' ? 'wall_right'
          : bound.id]
  })),
  ...mapping.goals.map((goal) => ({ mappingId: goal.id, simKind: 'bucket', simIds: [goal.id] }))
];
const manifest = {
  schemaVersion: 1,
  mapping: {
    commit: expectedMappingCommit,
    schema: mapping.schema,
    sha256: sha256(mappingText),
    sourceImageSha256: expectedImageSha256
  },
  simCoreCommit: '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023',
  config: {
    file: 'board-03-config.v1.json',
    sha256: sha256(configText),
    ballRadiusFlat: config.board.ball.r,
    goalApproximation: 'inscribed bucket circle inside each rectangular Researcher goal zone',
    implicitBounds: ['bound-far', 'bound-left', 'bound-right']
  },
  mappingTable
};

await writeFile(path.join(runtimeDir, 'board-03-config.v1.json'), configText, 'utf8');
await writeFile(path.join(runtimeDir, 'board-03-config.manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`wrote board-03 config sha256=${manifest.config.sha256}`);
