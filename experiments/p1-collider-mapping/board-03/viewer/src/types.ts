export type ViewId = 'perspective' | 'flat';

export interface Point {
  x: number;
  y: number;
}

export interface CircleGeometry {
  kind: 'circle';
  id: string;
  center: Point;
  radius: number;
}

export interface SegmentGeometry {
  kind: 'segment';
  id: string;
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
  radiusToView(radius: number, center: Readonly<Point>, view: ViewId): number;
}

export interface Board03Bundle {
  readonly sourcePins: Readonly<{
    imageSha256: string;
    projectionVersion: string;
    configVersion: string;
    simCoreCommit: string;
  }>;
  readonly geometry: readonly GeometryPrimitive[];
  readonly projection: ProjectionPort;
  readonly simulation: SimulationPort;
}

