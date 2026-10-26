import { describe, expect, it } from 'vitest';
import config from '../../runtime/board-03-config.v1.json';
import { geometryFromConfig, type Board03Config } from '../src/config-geometry';

const geometry = geometryFromConfig(config as unknown as Board03Config);

describe('geometryFromConfig', () => {
  it('uses only actual config primitives plus the three implicit board walls', () => {
    expect(geometry.filter((item) => item.kind === 'circle' && item.role === 'obstacle')).toHaveLength(7);
    expect(geometry.filter((item) => item.kind === 'segment' && item.role === 'obstacle')).toHaveLength(56);
    expect(geometry.filter((item) => item.kind === 'segment' && item.role === 'boundary')).toHaveLength(8);
    expect(geometry.filter((item) => item.kind === 'circle' && item.role === 'goal')).toHaveLength(4);
    expect(geometry).toHaveLength(75);
    expect(geometry.find((item) => item.id === 'wall_left')).toMatchObject({
      from: { x: 0, y: 0 },
      to: { x: 0, y: 1150 },
    });
  });

  it('renders goal triggers as their actual config circles', () => {
    const goal = geometry.find((item) => item.id === 'goal-01');
    expect(goal).toEqual({
      kind: 'circle',
      id: 'goal-01',
      role: 'goal',
      center: { x: 111.741585, y: 1074.481671 },
      radius: 48,
    });
  });
});
