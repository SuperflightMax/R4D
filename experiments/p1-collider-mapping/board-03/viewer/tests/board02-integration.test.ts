import { describe, expect, it } from 'vitest';
import traces from '../../../board-02/checks/board-02-traces.v1.json';
import config from '../../../board-02/runtime/board-02-config.v1.json';
import { board02Bundle } from '../src/board02-bundle';
import { formatTerminalResult } from '../src/terminal-status';
import { ViewerState } from '../src/viewer-state';

describe('exact board 02 integration', () => {
  it('exposes exact inputs and config-only geometry', () => {
    expect(board02Bundle.sourcePins).toEqual({
      imageSha256: '7ceff71bd0a871fecd725527dff5522450c8e75a74eb99c107b5d8624bf8fa3a',
      projectionVersion: 'perspective-homography',
      configVersion: 'board-02-config.v1.json',
      configSha256: 'aea8c0d299b71facbed00d7774da6e31211a7cfb6c119604637a4caa65e4dd48',
      mappingSha256: '4f5862f5c2a602fccdc4d4419f7b5e6e4049fb807038d386ee3950d9cad24a12',
      simCoreCommit: '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023',
    });
    expect(board02Bundle.geometry.filter((item) => item.kind === 'circle' && item.role === 'obstacle')).toHaveLength(12);
    expect(board02Bundle.geometry.filter((item) => item.kind === 'segment' && item.role === 'obstacle')).toHaveLength(48);
    expect(board02Bundle.geometry.filter((item) => item.kind === 'segment' && item.role === 'boundary')).toHaveLength(8);
    expect(board02Bundle.geometry.filter((item) => item.kind === 'circle' && item.role === 'goal')).toHaveLength(4);
    expect(board02Bundle.geometry).toHaveLength(72);
    expect(board02Bundle.geometry.find((item) => item.id === 'wall_left')).toMatchObject({ to: { x: 0, y: 1150 } });
    expect(board02Bundle.geometry.find((item) => item.id === 'goal-04')).toEqual({
      kind: 'circle', id: 'goal-04', role: 'goal',
      center: { x: 921.189473, y: 1054.168566 }, radius: 34,
    });
  });

  it('preserves full simulation state across view and layer toggles', () => {
    const state = new ViewerState(board02Bundle);
    state.reset(1);
    state.stepTicks(120);
    const before = structuredClone(state.snapshot);
    state.setView('flat');
    state.setArt(false);
    state.setGeometry(false);
    state.setView('perspective');
    expect(state.snapshot).toEqual(before);
  });

  it('replays saved traces through the real adapter/core', () => {
    for (const run of traces.runs) {
      const state = new ViewerState(board02Bundle);
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
            x: expected.ball.pos.x, y: expected.ball.pos.y,
            radius: config.board.ball.r,
            vx: expected.ball.vel.x, vy: expected.ball.vel.y,
          },
          done: expected.done,
          result: expected.result ?? null,
        });
      }
    }
  });

  it.each([
    [1, 674, 'goal-04'],
    [2, 476, 'goal-02'],
  ])('shows the exact terminal for seed %i', (seed, tick, bucketId) => {
    const state = new ViewerState(board02Bundle);
    state.reset(seed);
    const terminal = state.stepTicks(2500);
    expect(terminal).toMatchObject({ seed, tick, done: true, result: { kind: 'IN_BUCKET', bucketId } });
    expect(formatTerminalResult(terminal.result)).toBe(`IN_BUCKET · ${bucketId}`);
  });
});
