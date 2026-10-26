import { describe, expect, it } from 'vitest';
import traces from '../../../board-01/checks/board-01-traces.v1.json';
import config from '../../../board-01/runtime/board-01-config.v1.json';
import { board01Bundle } from '../src/board01-bundle';
import { formatTerminalResult } from '../src/terminal-status';
import { ViewerState } from '../src/viewer-state';

describe('exact board 01 integration', () => {
  it('exposes exact inputs and config-only geometry', () => {
    expect(board01Bundle.sourcePins).toEqual({
      imageSha256: 'c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72',
      projectionVersion: 'perspective-homography',
      configVersion: 'board-01-config.v1.json',
      configSha256: '7d652dc28e30bfc42f7d862fc6cb4bfc2489b4e88593c655d31baca4f85de057',
      mappingSha256: '9a248421ad8453d839940bccf7e9838e9091ffa83ab40e1b50998f57e7041d5c',
      simCoreCommit: '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023',
    });
    expect(board01Bundle.geometry.filter((item) => item.kind === 'circle' && item.role === 'obstacle')).toHaveLength(25);
    expect(board01Bundle.geometry.filter((item) => item.kind === 'segment' && item.role === 'boundary')).toHaveLength(8);
    expect(board01Bundle.geometry.filter((item) => item.kind === 'circle' && item.role === 'goal')).toHaveLength(4);
    expect(board01Bundle.geometry).toHaveLength(37);
    expect(board01Bundle.geometry.find((item) => item.id === 'wall_left')).toMatchObject({ to: { x: 0, y: 1180 } });
    expect(board01Bundle.geometry.find((item) => item.id === 'goal-01')).toEqual({
      kind: 'circle', id: 'goal-01', role: 'goal',
      center: { x: 130.797127, y: 1101.601446 }, radius: 26,
    });
  });

  it('preserves full simulation state across view and layer toggles', () => {
    const state = new ViewerState(board01Bundle);
    state.reset(1);
    state.stepTicks(120);
    const before = structuredClone(state.snapshot);
    state.setView('flat');
    state.setArt(false);
    state.setGeometry(false);
    state.setView('perspective');
    expect(state.snapshot).toEqual(before);
  });

  it('replays the saved traces through the real adapter/core', () => {
    for (const run of traces.runs) {
      const state = new ViewerState(board01Bundle);
      state.reset(run.seed);
      let previousTick = 0;
      for (const expected of run.snapshots) {
        if (expected.tick > previousTick) state.stepTicks(expected.tick - previousTick);
        previousTick = expected.tick;
        expect(state.snapshot).toEqual({
          seed: expected.seed,
          tick: expected.tick,
          rngU32: expected.rngU32,
          ball: {
            x: expected.ball.pos.x,
            y: expected.ball.pos.y,
            radius: config.board.ball.r,
            vx: expected.ball.vel.x,
            vy: expected.ball.vel.y,
          },
          done: expected.done,
          result: expected.result ?? null,
        });
      }
    }
  });

  it.each([
    [1, 395, 48.7763232],
    [2, 561, 55.7894614],
  ])('shows the honest LOST terminal for seed %i', (seed, tick, finalX) => {
    const state = new ViewerState(board01Bundle);
    state.reset(seed);
    const terminal = state.stepTicks(2500);
    expect(terminal).toMatchObject({
      seed,
      tick,
      done: true,
      result: { kind: 'LOST', finalX, nearMissBucketIds: [] },
    });
    expect(formatTerminalResult(terminal.result)).toBe(`LOST · finalX=${finalX} · nearMiss=none`);
  });
});
