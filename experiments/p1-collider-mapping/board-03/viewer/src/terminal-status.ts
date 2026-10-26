type TerminalResult = Readonly<Record<string, unknown>>;

function field(result: TerminalResult, key: string): string {
  const value = result[key];
  return value === undefined ? '?' : String(value);
}

function listField(result: TerminalResult, key: string): string {
  const value = result[key];
  return Array.isArray(value) ? (value.length > 0 ? value.join(',') : 'none') : field(result, key);
}

export function formatTerminalResult(result: unknown): string {
  if (!result || typeof result !== 'object' || Array.isArray(result)) {
    return `DONE · result=${String(result)}`;
  }

  const terminal = result as TerminalResult;
  switch (terminal.kind) {
    case 'IN_BUCKET':
      return `IN_BUCKET · ${field(terminal, 'bucketId')}`;
    case 'LOST':
      return `LOST · finalX=${field(terminal, 'finalX')} · nearMiss=${listField(terminal, 'nearMissBucketIds')}`;
    case 'INVALID_TOO_SHORT':
      return `INVALID_TOO_SHORT · elapsed=${field(terminal, 'elapsedSec')}s · min=${field(terminal, 'minSec')}s`;
    case 'INVALID_TIMEOUT':
      return `INVALID_TIMEOUT · elapsed=${field(terminal, 'elapsedSec')}s · max=${field(terminal, 'maxSec')}s`;
    case 'INVALID_ERROR':
      return `INVALID_ERROR · ${field(terminal, 'message')}`;
    default:
      return `DONE · ${JSON.stringify(terminal)}`;
  }
}
