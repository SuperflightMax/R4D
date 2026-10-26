import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Point = [number, number];
type Bound = { id: string; from: Point; to: Point };
type Goal = { id: string; shape: 'bucketCircle'; centerFlat: Point; radiusFlat: number };
type CircleObstacle = { id: string; shape: 'circle'; centerFlat: Point; radiusFlat: number };
type LoopObstacle = { id: string; shape: 'axisAlignedSegmentLoop'; centerFlat: Point; halfExtentsFlat: Point };
type Mapping = {
  schema: string;
  sources: { sourceImage: { sha256: string } };
  coordinateSystems: {
    flat: {
      extent: { x: Point; y: Point };
      semanticDomains: {
        playablePlane: { x: Point; y: Point };
        foregroundReceiverApron: { x: Point; y: Point };
      };
    };
  };
  start: { id: string; positionFlat: Point; directionFlat: Point };
  bounds: Bound[];
  goals: Goal[];
  obstacles: Array<CircleObstacle | LoopObstacle>;
};

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const expectedMappingCommit = '83e3b0e63ecc3fb7878719c30f59a3b4306fc467';
const expectedMappingSchema = 'r4d.p1.board-03-mapping.v0.2';
const expectedMappingSha256 = '070c0fb3f9b6d39601a8230dc2c5b4e792a223872ad611c9de48b8717b387bbf';
const expectedFrozenGeometrySha256 = '45e937b017c04ef854532a4b2c156b90cbdf4c0f0574fab5d1827c02de66b733';
const expectedImageSha256 = 'f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32';
const mappingPath = path.resolve(
  process.env.BOARD_03_MAPPING_PATH
    ?? path.join(runtimeDir, '..', '..', 'research', 'board-03-mapping-v0.2.json')
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
const canonicalMappingText = JSON.stringify(mapping);
if (mapping.schema !== expectedMappingSchema)
{
  throw new Error(`unexpected mapping schema: ${mapping.schema}`);
}
if (mapping.sources.sourceImage.sha256 !== expectedImageSha256)
{
  throw new Error('mapping points to an unexpected source image');
}
if (sha256(canonicalMappingText) !== expectedMappingSha256)
{
  throw new Error('mapping canonical digest differs from the accepted Research v0.2');
}
const frozenGeometryText = JSON.stringify({
  start: mapping.start,
  bounds: mapping.bounds,
  obstacles: mapping.obstacles
});
if (sha256(frozenGeometryText) !== expectedFrozenGeometrySha256)
{
  throw new Error('start, bounds or obstacles drifted from the frozen Research geometry');
}
if (mapping.obstacles.length !== 21 || mapping.bounds.length !== 8 || mapping.goals.length !== 4)
{
  throw new Error('mapping inventory differs from Researcher checkpoint');
}

const [minX, maxX] = mapping.coordinateSystems.flat.extent.x;
const [minY, maxY] = mapping.coordinateSystems.flat.extent.y;
if (minX !== 0 || minY !== 0 || maxX !== 1000 || maxY !== 1150)
{
  throw new Error('board 03 runtime requires the accepted 1000x1150 simulation domain');
}
const playable = mapping.coordinateSystems.flat.semanticDomains.playablePlane;
const apron = mapping.coordinateSystems.flat.semanticDomains.foregroundReceiverApron;
if (JSON.stringify(playable) !== JSON.stringify({ x: [0, 1000], y: [0, 1000] })
  || JSON.stringify(apron) !== JSON.stringify({ x: [0, 1000], y: [1000, 1150] }))
{
  throw new Error('playable-plane or receiver-apron domain differs from Research v0.2');
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

const buckets = mapping.goals.map((goal) => ({
  id: goal.id,
  x: goal.centerFlat[0],
  y: goal.centerFlat[1],
  r: goal.radiusFlat,
  prizeMul: 1
}));

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
  ...mapping.goals.map((goal) => ({
    mappingId: goal.id,
    mappingShape: goal.shape,
    simKind: 'bucket',
    simIds: [goal.id]
  }))
];
const manifest = {
  schemaVersion: 1,
  mapping: {
    commit: expectedMappingCommit,
    schema: mapping.schema,
    canonicalization: 'JSON.stringify(JSON.parse(sourceBytes))',
    sha256: expectedMappingSha256,
    sourceImageSha256: expectedImageSha256
  },
  simCoreCommit: '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023',
  config: {
    file: 'board-03-config.v1.json',
    sha256: sha256(configText),
    ballRadiusFlat: config.board.ball.r,
    segmentBreakdown: {
      obstacleSegments: obstacleSegments.length,
      explicitNearBoundarySegments: explicitBounds.length,
      total: obstacleSegments.length + explicitBounds.length
    },
    simulationDomain: {
      width: maxX,
      height: maxY,
      playablePlaneY: playable.y,
      receiverApronY: apron.y
    },
    goalMapping: {
      declaredMappingShape: 'bucketCircle',
      coreShape: 'bucket circle',
      rule: 'direct centerFlat/radiusFlat transfer with no geometric approximation'
    },
    implicitBounds: {
      mapped: ['bound-far', 'bound-left', 'bound-right'],
      apronBehavior: 'Millionko implicit left/right walls use board.height and therefore continue through y=1000..1150; top remains wall_top'
    },
    frozenStartBoundsObstaclesCanonicalSha256: expectedFrozenGeometrySha256
  },
  mappingTable
};

await writeFile(path.join(runtimeDir, 'board-03-config.v1.json'), configText, 'utf8');
await writeFile(path.join(runtimeDir, 'board-03-config.manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`wrote board-03 config sha256=${manifest.config.sha256}`);
