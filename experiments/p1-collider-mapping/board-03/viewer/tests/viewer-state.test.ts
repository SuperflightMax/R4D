import { describe, expect, it } from 'vitest';
import type { Board03Bundle, SimulationSnapshot } from '../src/types';
import { ViewerState } from '../src/viewer-state';

function fixture(): { bundle: Board03Bundle; current: SimulationSnapshot } {
  const current: SimulationSnapshot = {
    seed: 7,
    tick: 12,
    rngU32: 123,
    ball: { x: 2, y: 3, radius: 0.5 },
    done: false,
    result: null,
  };
  const bundle: Board03Bundle = {
    id: '03',
    label: 'fixture-only',
    domain: { playableMaxY: 8, apronMaxY: 10, goalRadius: 1 },
    sourcePins: {
      imageSha256: 'fixture-only',
      projectionVersion: 'fixture-only',
      configVersion: 'fixture-only',
      configSha256: 'fixture-only',
      mappingSha256: 'fixture-only',
      simCoreCommit: 'fixture-only',
    },
    art: {
      imageUrl: 'fixture-only',
      ballUrl: 'fixture-only',
      shadowUrl: 'fixture-only',
      ballNativeDiameter: 64,
      shadowNativeSize: [96, 48],
      shadowOffsetInBallDiameters: [-0.18, 0.25],
    },
    geometry: [],
    projection: {
      mode: 'perspective',
      imageSize: { width: 10, height: 10 },
      flatSize: { width: 10, height: 10 },
      simToImage: (point) => ({ ...point }),
      imageToSim: (point) => ({ ...point }),
      simToFlat: (point) => ({ ...point }),
      flatToSim: (point) => ({ ...point }),
    },
    simulation: {
      tickMs: 8,
      snapshot: () => structuredClone(current),
      stepTicks: (count) => {
        current.tick += count;
        return structuredClone(current);
      },
      reset: (seed) => {
        current.seed = seed;
        current.tick = 0;
        return structuredClone(current);
      },
    },
  };
  return { bundle, current };
}

describe('ViewerState', () => {
  it('does not mutate simulation when view or layer visibility changes', () => {
    const { bundle, current } = fixture();
    const state = new ViewerState(bundle);
    const before = structuredClone(current);

    state.setView('flat');
    state.setArt(false);
    state.setGeometry(false);

    expect(current).toEqual(before);
    expect(state.view).toBe('flat');
    expect(state.visibility).toEqual({ art: false, geometry: false });
  });

  it('delegates diagnostic stepping to the supplied simulation port', () => {
    const { bundle } = fixture();
    const state = new ViewerState(bundle);
    expect(state.stepTicks(1).tick).toBe(13);
    expect(state.stepTicks(10).tick).toBe(23);
    expect(() => state.stepTicks(0)).toThrow(RangeError);
  });
});

