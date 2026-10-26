import type { GeometryPrimitive } from './types';

export interface Board03Config {
  defaults: { tickMs: number };
  board: {
    width: number;
    height: number;
    ball: { r: number };
    pins: Array<{ id: string; x: number; y: number; r: number }>;
    segments: Array<{ id: string; x1: number; y1: number; x2: number; y2: number }>;
    buckets: Array<{ id: string; x: number; y: number; r: number }>;
  };
}
export function geometryFromConfig(config: Board03Config): readonly GeometryPrimitive[] {
  const primitives: GeometryPrimitive[] = [
    ...config.board.pins.map((pin) => ({
      kind: 'circle' as const,
      id: pin.id,
      role: 'obstacle' as const,
      center: { x: pin.x, y: pin.y },
      radius: pin.r,
    })),
    ...config.board.segments.map((segment) => ({
      kind: 'segment' as const,
      id: segment.id,
      role: segment.id.startsWith('bound-near-') ? 'boundary' as const : 'obstacle' as const,
      from: { x: segment.x1, y: segment.y1 },
      to: { x: segment.x2, y: segment.y2 },
    })),
    {
      kind: 'segment' as const,
      id: 'wall_top',
      role: 'boundary' as const,
      from: { x: 0, y: 0 },
      to: { x: config.board.width, y: 0 },
    },
    {
      kind: 'segment' as const,
      id: 'wall_left',
      role: 'boundary' as const,
      from: { x: 0, y: 0 },
      to: { x: 0, y: config.board.height },
    },
    {
      kind: 'segment' as const,
      id: 'wall_right',
      role: 'boundary' as const,
      from: { x: config.board.width, y: 0 },
      to: { x: config.board.width, y: config.board.height },
    },
    ...config.board.buckets.map((bucket) => ({
      kind: 'circle' as const,
      id: bucket.id,
      role: 'goal' as const,
      center: { x: bucket.x, y: bucket.y },
      radius: bucket.r,
    })),
  ];
  return Object.freeze(primitives);
}
