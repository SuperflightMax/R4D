import { describe, expect, it } from 'vitest';
import { formatTerminalResult } from '../src/terminal-status';

describe('terminal diagnostics', () => {
  it('shows the bucket outcome as a readable kind and goal id', () => {
    expect(formatTerminalResult({ kind: 'IN_BUCKET', bucketId: 'goal-03' }))
      .toBe('IN_BUCKET · goal-03');
  });

  it.each([
    [{ kind: 'LOST', finalX: 123.5, nearMissBucketIds: ['goal-02', 'goal-03'] }, 'LOST · finalX=123.5 · nearMiss=goal-02,goal-03'],
    [{ kind: 'INVALID_TOO_SHORT', elapsedSec: 0.4, minSec: 1 }, 'INVALID_TOO_SHORT · elapsed=0.4s · min=1s'],
    [{ kind: 'INVALID_TIMEOUT', elapsedSec: 12, maxSec: 12 }, 'INVALID_TIMEOUT · elapsed=12s · max=12s'],
    [{ kind: 'INVALID_ERROR', message: 'bad state' }, 'INVALID_ERROR · bad state'],
  ])('shows key fields for %s', (result, expected) => {
    expect(formatTerminalResult(result)).toBe(expected);
  });

  it('keeps an unknown structured result inspectable', () => {
    expect(formatTerminalResult({ kind: 'FUTURE_RESULT', code: 7 }))
      .toBe('DONE · {"kind":"FUTURE_RESULT","code":7}');
  });
});
