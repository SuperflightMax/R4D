import { describe, expect, it } from 'vitest';
import { board03Bundle } from '../src/board03-bundle';
import { ViewerState } from '../src/viewer-state';

describe('exact board 03 integration', () => {
  it('exposes the accepted source pins', () => {
    expect(board03Bundle.sourcePins).toEqual({
      imageSha256: 'f5cfa2bbe8e4b49ecbc0f4c7a0cee99842b182b56ae495979153b8fc9ff86e32',
      projectionVersion: 'p0-selected-ruled-trapezoid-v0.1',
      configVersion: 'board-03-config.v1.json',
      configSha256: '69ebafc086bea82513b9107ebf272d4f6b1d552cd080810eefe893616c454c6f',
      mappingSha256: 'fc4e467b8eeced91e08e2a62ed367693ac9317675a2f33a8ab76379ac47429be',
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
});
