import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

type Point = [number, number];
type Circle = { id: string; shape: 'circle'; centerFlat: Point; radiusFlat: number };
type Loop = { id: string; shape: 'axisAlignedSegmentLoop'; centerFlat: Point; halfExtentsFlat: Point };
type Obstacle = Circle | Loop;
type Goal = { id: string; shape: 'bucketCircle'; centerFlat: Point; radiusFlat: number };
type Bound = { id: string; from: Point; to: Point };
type Mapping = {
  schema: string;
  source: { sha256: string };
  coordinates: {
    flatExtent: { x: Point; y: Point };
    domains: { playable: { x: Point; y: Point }; receiverApron: { x: Point; y: Point } };
  };
  planeCollapse: {
    model: string;
    greenStoneIslands: { flatRole: string; collidersFromShoreline: boolean };
    internalWaterChannels: { flatRole: string; collidersFromWaterEdge: boolean; depthMechanic: boolean };
    bridgesRampsAndSteps: { flatRole: string; collidersFromElevationEdge: boolean; heightMechanic: boolean };
    outerCascadesBeyondTempleWalls: { flatRole: string };
    foregroundWaterBasins: { flatRole: string; traversable: boolean };
  };
  start: { id: string; positionFlat: Point; directionFlat: Point };
  bounds: Bound[];
  goals: Goal[];
  obstacles: Obstacle[];
};

const runtimeDir = path.dirname(fileURLToPath(import.meta.url));
const mappingPath = path.resolve(
  process.env.BOARD_04_MAPPING_PATH
    ?? path.join(runtimeDir, '..', '..', 'research', 'board-04-water-temple', 'mapping-v0.1.json')
);
const expectedResearchCommit = '9219aa8acf38a46e068580e186dfea1fa4011c3c';
const expectedSchema = 'r4d.p1.board-04.mapping.v0.1';
const expectedResearchCanonicalSha256 = 'a65a72549fd7ebd7a49c9322dcdff00d03daa9cdbbf9c1fad094dc29c80fceac';
const expectedJsSemanticSha256 = 'b10554f5e7aa067f1c22e2b2ca9dc6816729c5d02a6ae05c527b9f10de14f9b9';
const expectedImageSha256 = '8da65c76c110b6ba7cefe113564fe12feed4428e84e84835f033e7da31d3b80d';

function sha256(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

function same(value: unknown, expected: unknown): boolean {
  return JSON.stringify(value) === JSON.stringify(expected);
}

function finitePoint(point: Point): boolean {
  return point.length === 2 && point.every(Number.isFinite);
}

function segment(id: string, from: Point, to: Point): Record<string, unknown> {
  return { id, x1: from[0], y1: from[1], x2: to[0], y2: to[1], bounce: 0.78, integrity: 0.9 };
}

function expandLoop(obstacle: Loop): Record<string, unknown>[] {
  const [cx, cy] = obstacle.centerFlat;
  const [hx, hy] = obstacle.halfExtentsFlat;
  const tl: Point = [cx - hx, cy - hy];
  const tr: Point = [cx + hx, cy - hy];
  const br: Point = [cx + hx, cy + hy];
  const bl: Point = [cx - hx, cy + hy];
  return [
    segment(`${obstacle.id}:top`, tl, tr),
    segment(`${obstacle.id}:right`, tr, br),
    segment(`${obstacle.id}:bottom`, br, bl),
    segment(`${obstacle.id}:left`, bl, tl)
  ];
}

const mapping = JSON.parse(await readFile(mappingPath, 'utf8')) as Mapping;
if (mapping.schema !== expectedSchema || mapping.source.sha256 !== expectedImageSha256) {
  throw new Error('board-04 mapping schema or source image differs from frozen Research');
}
if (sha256(JSON.stringify(mapping)) !== expectedJsSemanticSha256) {
  throw new Error('board-04 mapping semantic content differs from frozen Research');
}
const circles = mapping.obstacles.filter((item): item is Circle => item.shape === 'circle');
const loops = mapping.obstacles.filter((item): item is Loop => item.shape === 'axisAlignedSegmentLoop');
if (mapping.obstacles.length !== 21 || circles.length !== 6 || loops.length !== 15
  || mapping.goals.length !== 4 || mapping.bounds.length !== 8) {
  throw new Error('board-04 mapping primitive inventory differs from frozen Research');
}
if (!same(mapping.coordinates.flatExtent, { x: [0, 1000], y: [0, 1250] })
  || !same(mapping.coordinates.domains.playable, { x: [0, 1000], y: [0, 1000] })
  || !same(mapping.coordinates.domains.receiverApron, { x: [0, 1000], y: [1000, 1250] })) {
  throw new Error('board-04 domains differ from frozen Research');
}
const plane = mapping.planeCollapse;
if (plane.model !== 'single-continuous-2d-navigation-plane'
  || plane.greenStoneIslands.flatRole !== 'traversable floor' || plane.greenStoneIslands.collidersFromShoreline
  || plane.internalWaterChannels.flatRole !== 'traversable floor'
  || plane.internalWaterChannels.collidersFromWaterEdge || plane.internalWaterChannels.depthMechanic
  || plane.bridgesRampsAndSteps.flatRole !== 'traversable floor'
  || plane.bridgesRampsAndSteps.collidersFromElevationEdge || plane.bridgesRampsAndSteps.heightMechanic
  || plane.outerCascadesBeyondTempleWalls.flatRole !== 'background outside playable domain'
  || plane.foregroundWaterBasins.flatRole !== 'receiver apron only' || plane.foregroundWaterBasins.traversable) {
  throw new Error('board-04 single-plane collapse differs from frozen Research');
}

const ids = new Set<string>();
for (const item of [...mapping.obstacles, ...mapping.goals, ...mapping.bounds, mapping.start]) {
  if (ids.has(item.id)) throw new Error(`duplicate mapping id: ${item.id}`);
  ids.add(item.id);
}
for (const obstacle of mapping.obstacles) {
  if (!finitePoint(obstacle.centerFlat)) throw new Error(`non-finite obstacle: ${obstacle.id}`);
  const [x, y] = obstacle.centerFlat;
  const [hx, hy] = obstacle.shape === 'circle'
    ? [obstacle.radiusFlat, obstacle.radiusFlat]
    : obstacle.halfExtentsFlat;
  if (![hx, hy].every((value) => Number.isFinite(value) && value > 0)
    || x - hx < 0 || x + hx > 1000 || y - hy < 0 || y + hy > 1000) {
    throw new Error(`obstacle is outside playable bounds: ${obstacle.id}`);
  }
}
for (const goal of mapping.goals) {
  const [x, y] = goal.centerFlat;
  if (goal.shape !== 'bucketCircle' || !finitePoint(goal.centerFlat) || goal.radiusFlat !== 45
    || x - 45 < 0 || x + 45 > 1000 || y - 45 <= 1000 || y + 45 >= 1250) {
    throw new Error(`invalid receiver-apron goal: ${goal.id}`);
  }
}

const pins = circles.map((item) => ({
  id: item.id, x: item.centerFlat[0], y: item.centerFlat[1], r: item.radiusFlat, bounce: 0.8, integrity: 0.9
}));
const obstacleSegments = loops.flatMap(expandLoop);
const explicitBounds = mapping.bounds
  .filter((item) => !['bound-far', 'bound-left', 'bound-right'].includes(item.id))
  .map((item) => segment(item.id, item.from, item.to));
const buckets = mapping.goals.map((item) => ({
  id: item.id, x: item.centerFlat[0], y: item.centerFlat[1], r: item.radiusFlat, prizeMul: 1
}));
const angleDeg = Math.atan2(mapping.start.directionFlat[1], mapping.start.directionFlat[0]) * 180 / Math.PI;
const config = {
  defaults: { tickMs: 8, quantizeDigits: 7 },
  board: {
    width: 1000,
    height: 1250,
    timeSecMin: 0.5,
    timeSecMax: 20,
    ball: { id: 'ball-04', r: 18, bounce: 0.86 },
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
  { mappingId: mapping.start.id, mappingShape: 'start', simKind: 'drop', simIds: [mapping.start.id] },
  ...mapping.obstacles.map((item) => ({
    mappingId: item.id,
    mappingShape: item.shape,
    simKind: item.shape === 'circle' ? 'pin' : 'segments',
    simIds: item.shape === 'circle'
      ? [item.id]
      : ['top', 'right', 'bottom', 'left'].map((side) => `${item.id}:${side}`)
  })),
  ...mapping.bounds.map((item) => ({
    mappingId: item.id,
    mappingShape: 'segment',
    simKind: ['bound-far', 'bound-left', 'bound-right'].includes(item.id) ? 'implicit-wall' : 'segment',
    simIds: [item.id === 'bound-far' ? 'wall_top'
      : item.id === 'bound-left' ? 'wall_left'
        : item.id === 'bound-right' ? 'wall_right'
          : item.id]
  })),
  ...mapping.goals.map((item) => ({
    mappingId: item.id, mappingShape: item.shape, simKind: 'bucket', simIds: [item.id]
  }))
];
const manifest = {
  schemaVersion: 1,
  board: '04-water-temple',
  mapping: {
    commit: expectedResearchCommit,
    schema: mapping.schema,
    canonicalization: 'Research Python json.dumps(ensure_ascii=False,separators=(comma,colon))',
    canonicalSha256: expectedResearchCanonicalSha256,
    jsSemanticSha256: expectedJsSemanticSha256,
    sourceImageSha256: expectedImageSha256
  },
  planeCollapse: {
    model: plane.model,
    generatedExtraColliders: 0,
    traversableFloorCues: ['greenStoneIslands', 'internalWaterChannels', 'bridgesRampsAndSteps'],
    excludedGeometry: ['shoreline', 'water-edge', 'elevation-edge', 'bridge-edge', 'depth', 'outer-cascades'],
    foregroundWaterBasins: 'receiver goals only',
    hiddenBases: 'frozen Research footprints only'
  },
  simCoreCommit: '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023',
  config: {
    file: 'board-04-config.v1.json',
    sha256: sha256(configText),
    simulationDomain: { width: 1000, height: 1250, playablePlaneY: [0, 1000], receiverApronY: [1000, 1250] },
    counts: {
      pins: pins.length,
      obstacleSegments: obstacleSegments.length,
      explicitNearSegments: explicitBounds.length,
      totalSegments: obstacleSegments.length + explicitBounds.length,
      implicitWalls: 3,
      buckets: buckets.length,
      drops: 1
    },
    ballRadiusFlat: config.board.ball.r,
    goalMapping: 'direct bucketCircle centerFlat/radiusFlat transfer',
    implicitBounds: ['bound-far', 'bound-left', 'bound-right']
  },
  mappingTable
};

await writeFile(path.join(runtimeDir, 'board-04-config.v1.json'), configText, 'utf8');
await writeFile(path.join(runtimeDir, 'board-04-config.manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
console.log(`wrote board-04 config sha256=${manifest.config.sha256}`);
