import { describe, expect, it } from 'vitest';
import { board03Bundle } from '../src/board03-bundle';
import { ViewerState } from '../src/viewer-state';

describe('exact board 03 integration', () => {
  it('exposes the accepted source pins', () => {
    expect(board03Bundle.sourcePins).toEqual({
      imageSha256: 'f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32',
      projectionVersion: 'p0-selected-ruled-trapezoid-v0.1',
      configVersion: 'board-03-config.v1.json',
      configSha256: '4c708fab600a7224bd43782b0e48540db1ea19ad1a399fb175cb840dc438e4b6',
      mappingSha256: '070c0fb3f9b6d39601a8230dc2c5b4e792a223872ad611c9de48b8717b387bbf',
      simCoreCommit: '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023',
    });
  });

  it('preserves the full real sim snapshot across all visual controls', () => {
    const state = new ViewerState(board03Bundle);
    state.reset(1);
    state.stepTicks(120);
    const before = structuredClone(state.snapshot);
    state.setView('flat');
    state.setArt(false);
    state.setGeometry(false);
    state.setView('perspective');
    expect(state.snapshot).toEqual(before);
  });

  it('runs ordinary seeds 1 and 2 through different real sim states', () => {
    const state = new ViewerState(board03Bundle);
    state.reset(1);
    const first = structuredClone(state.stepTicks(120));
    state.reset(2);
    const second = structuredClone(state.stepTicks(120));
    expect(first.seed).toBe(1);
    expect(second.seed).toBe(2);
    expect(second).not.toEqual(first);
  });

  it.each([
    [1, 935, 'goal-02'],
    [2, 1023, 'goal-01'],
  ])('keeps the exact terminal result for seed %i', (seed, tick, bucketId) => {
    const state = new ViewerState(board03Bundle);
    state.reset(seed);
    const terminal = state.stepTicks(2500);
    expect(terminal).toMatchObject({
      seed,
      tick,
      done: true,
      result: { kind: 'IN_BUCKET', bucketId },
    });
    expect(terminal.ball.y).toBeGreaterThan(1000);
    expect(terminal.ball.y).toBeLessThanOrEqual(1150);
  });
});
