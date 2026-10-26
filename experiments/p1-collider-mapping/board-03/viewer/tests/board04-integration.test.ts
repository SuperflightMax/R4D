import { describe, expect, it } from 'vitest';
import traces from '../../../board-04/checks/board-04-traces.v1.json';
import config from '../../../board-04/runtime/board-04-config.v1.json';
import manifest from '../../../board-04/runtime/board-04-config.manifest.json';
import { board04Bundle } from '../src/board04-bundle';
import { formatTerminalResult } from '../src/terminal-status';
import { ViewerState } from '../src/viewer-state';

describe('exact board 04 integration', () => {
  it('exposes exact inputs and config-only geometry', () => {
    expect(board04Bundle.sourcePins).toEqual({
      imageSha256: '8da65c76c110b6ba7cefe113564fe12feed4428e84e84835f033e7da31d3b80d',
      projectionVersion: 'perspective-homography',
      configVersion: 'board-04-config.v1.json',
      configSha256: '39fbcbff7c312a88fc29d8114bbc6ce02aa3a8898b00bc6ed4495d8f2eb329b3',
      mappingSha256: 'a65a72549fd7ebd7a49c9322dcdff00d03daa9cdbbf9c1fad094dc29c80fceac',
      simCoreCommit: '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023',
    });
    expect(board04Bundle.geometry.filter((item) => item.kind === 'circle' && item.role === 'obstacle')).toHaveLength(6);
    expect(board04Bundle.geometry.filter((item) => item.kind === 'segment' && item.role === 'obstacle')).toHaveLength(60);
    expect(board04Bundle.geometry.filter((item) => item.kind === 'segment' && item.role === 'boundary')).toHaveLength(8);
    expect(board04Bundle.geometry.filter((item) => item.kind === 'circle' && item.role === 'goal')).toHaveLength(4);
    expect(board04Bundle.geometry).toHaveLength(78);
    expect(board04Bundle.geometry.find((item) => item.id === 'wall_left')).toMatchObject({ to: { x: 0, y: 1250 } });
    expect(board04Bundle.geometry.find((item) => item.id === 'goal-01')).toEqual({
      kind: 'circle', id: 'goal-01', role: 'goal',
      center: { x: 113.093989, y: 1088.003538 }, radius: 45,
    });
  });

  it('keeps the declared single-plane collapse and adds no extra colliders', () => {
    expect(manifest.planeCollapse.model).toBe('single-continuous-2d-navigation-plane');
    expect(manifest.planeCollapse.generatedExtraColliders).toBe(0);
    expect(manifest.planeCollapse.excludedGeometry).toEqual([
      'shoreline', 'water-edge', 'elevation-edge', 'bridge-edge', 'depth', 'outer-cascades',
    ]);
    expect(board04Bundle.modelNotice).toContain('single continuous 2D plane');
    expect(board04Bundle.modelNotice).toContain('front pools are goals only');
  });

  it('preserves full simulation state across view and layer toggles', () => {
    const state = new ViewerState(board04Bundle);
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
      const state = new ViewerState(board04Bundle);
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

  it('shows exact seed terminals, including honest LOST', () => {
    const seed1 = new ViewerState(board04Bundle);
    seed1.reset(1);
    const goal = seed1.stepTicks(2500);
    expect(goal).toMatchObject({ seed: 1, tick: 1016, done: true, result: { kind: 'IN_BUCKET', bucketId: 'goal-01' } });
    expect(formatTerminalResult(goal.result)).toBe('IN_BUCKET · goal-01');

    const seed2 = new ViewerState(board04Bundle);
    seed2.reset(2);
    const lost = seed2.stepTicks(2500);
    expect(lost).toMatchObject({ seed: 2, tick: 797, done: true, result: { kind: 'LOST', finalX: 482.1830021, nearMissBucketIds: [] } });
    expect(formatTerminalResult(lost.result)).toBe('LOST · finalX=482.1830021 · nearMiss=none');
  });
});
