export type ViewId = 'perspective' | 'flat';

export interface Point {
  x: number;
  y: number;
}

export interface CircleGeometry {
  kind: 'circle';
  id: string;
  role: 'obstacle' | 'goal';
  center: Point;
  radius: number;
}

export interface SegmentGeometry {
  kind: 'segment';
  id: string;
  role: 'obstacle' | 'boundary';
  from: Point;
  to: Point;
}

export type GeometryPrimitive = CircleGeometry | SegmentGeometry;

export interface BallSnapshot {
  x: number;
  y: number;
  radius: number;
  vx?: number;
  vy?: number;
}

export interface SimulationSnapshot {
  seed: number;
  tick: number;
  rngU32: number;
  ball: BallSnapshot;
  done: boolean;
  result: unknown;
}

export interface SimulationPort {
  readonly tickMs: number;
  snapshot(): Readonly<SimulationSnapshot>;
  stepTicks(count: number): Readonly<SimulationSnapshot>;
  reset(seed: number): Readonly<SimulationSnapshot>;
}

export interface ProjectionPort {
  readonly mode: 'perspective' | 'identity';
  readonly imageSize: Readonly<{ width: number; height: number }>;
  readonly flatSize: Readonly<{ width: number; height: number }>;
  simToImage(point: Readonly<Point>): Point;
  imageToSim(point: Readonly<Point>): Point;
  simToFlat(point: Readonly<Point>): Point;
  flatToSim(point: Readonly<Point>): Point;
}

export type BoardId = '03' | '01' | '02';

export interface BoardBundle {
  readonly id: BoardId;
  readonly label: string;
  readonly domain: Readonly<{
    playableMaxY: number;
    apronMaxY: number;
    goalRadius: number;
  }>;
  readonly sourcePins: Readonly<{
    imageSha256: string;
    projectionVersion: string;
    configVersion: string;
    configSha256: string;
    mappingSha256: string;
    simCoreCommit: string;
  }>;
  readonly art: Readonly<{
    imageUrl: string;
    ballUrl: string;
    shadowUrl: string;
    ballNativeDiameter: number;
    shadowNativeSize: readonly [number, number];
    shadowOffsetInBallDiameters: readonly [number, number];
  }>;
  readonly geometry: readonly GeometryPrimitive[];
  readonly projection: ProjectionPort;
  readonly simulation: SimulationPort;
}

export type Board03Bundle = BoardBundle;

