export type SimResult = Readonly<Record<string, unknown>>;
export type SimEvent = Readonly<Record<string, unknown>>;

export type Board03Snapshot = Readonly<{
  seed: number;
  tick: number;
  rngU32: number;
  ball: Readonly<{
    pos: Readonly<{ x: number; y: number }>;
    vel: Readonly<{ x: number; y: number }>;
  }>;
  done: boolean;
  result?: SimResult;
}>;

type MutableConfig = {
  defaults: { tickMs: number; quantizeDigits: number };
  board: {
    width: number;
    height: number;
    ball: { id: string; r: number; bounce: number };
    drops: Array<Record<string, unknown>>;
    pins: Array<Record<string, unknown>>;
    segments: Array<Record<string, unknown>>;
    buckets: Array<Record<string, unknown>>;
    [key: string]: unknown;
  };
  physics: {
    gravityY: number;
    maxBallSpeed: number;
    angleDeviationDeg: number;
    bounceDeviation: number;
    wallBounce: number;
  };
  rng: { algo: 'lcg32'; seed: number };
};

type SimState = {
  tick: number;
  rngU32: number;
  ball: {
    pos: { x: number; y: number };
    vel: { x: number; y: number };
  };
  done: boolean;
  result?: Record<string, unknown>;
};

type SimSession = {
  state: SimState;
};

export type SimCorePublicApi = {
  assertValidConfig(config: MutableConfig): void;
  createSimRunSession(
    config: MutableConfig,
    options?: { dropId?: string; onEvent?: (event: Record<string, unknown>) => void }
  ): SimSession;
  stepSimRunSession(session: SimSession): {
    done: boolean;
    ticks: number;
    result?: Record<string, unknown>;
  };
};

export type Board03Run = Readonly<{
  seed: number;
  tickMs: number;
  snapshot(): Board03Snapshot;
  events(): readonly SimEvent[];
  stepTicks(count: number): Board03Snapshot;
}>;

export type Board03Adapter = Readonly<{
  tickMs: number;
  createRun(seed: number): Board03Run;
}>;

function clone<T>(value: T): T
{
  return structuredClone(value);
}
function deepFreeze<T>(value: T): Readonly<T>
{
  if (value && typeof value === 'object' && !Object.isFrozen(value))
  {
    Object.freeze(value);
    for (const child of Object.values(value as Record<string, unknown>))
    {
      deepFreeze(child);
    }
  }
  return value;
}

function normalizeSeed(seed: number): number
{
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
  {
    throw new RangeError(`seed must be a uint32, received ${seed}`);
  }
  return seed >>> 0;
}

function assertSliceInvariants(config: MutableConfig): void
{
  if (config.rng.algo !== 'lcg32')
  {
    throw new Error("board 03 requires Millionko's lcg32 PRNG");
  }
  if (config.physics.angleDeviationDeg <= 0 || config.physics.bounceDeviation <= 0)
  {
    throw new Error('board 03 requires non-zero angle and bounce deviations');
  }
  if (config.board.drops.length !== 1)
  {
    throw new Error('board 03 vertical slice requires exactly one enabled start');
  }
  if (config.board.pins.length + config.board.segments.length === 0)
  {
    throw new Error('board 03 requires collision primitives');
  }
  if (config.board.buckets.length === 0)
  {
    throw new Error('board 03 requires at least one goal bucket');
  }
}

function snapshot(seed: number, state: SimState): Board03Snapshot
{
  const value: {
    seed: number;
    tick: number;
    rngU32: number;
    ball: { pos: { x: number; y: number }; vel: { x: number; y: number } };
    done: boolean;
    result?: Record<string, unknown>;
  } = {
    seed,
    tick: state.tick,
    rngU32: state.rngU32 >>> 0,
    ball: {
      pos: { x: state.ball.pos.x, y: state.ball.pos.y },
      vel: { x: state.ball.vel.x, y: state.ball.vel.y }
    },
    done: state.done
  };
  if (state.result)
  {
    value.result = clone(state.result);
  }
  return deepFreeze(value);
}

export function createBoard03Adapter(
  core: SimCorePublicApi,
  authoredConfig: MutableConfig
): Board03Adapter
{
  const baseline = clone(authoredConfig);
  core.assertValidConfig(baseline);
  assertSliceInvariants(baseline);

  return Object.freeze({
    tickMs: baseline.defaults.tickMs,
    createRun(seedInput: number): Board03Run
    {
      const seed = normalizeSeed(seedInput);
      const config = clone(baseline);
      config.rng.seed = seed;
      const capturedEvents: Record<string, unknown>[] = [];
      const session = core.createSimRunSession(config, {
        onEvent: (event) => capturedEvents.push(clone(event))
      });

      return Object.freeze({
        seed,
        tickMs: config.defaults.tickMs,
        snapshot: () => snapshot(seed, session.state),
        events: () => deepFreeze(clone(capturedEvents)),
        stepTicks(count: number): Board03Snapshot
        {
          if (!Number.isInteger(count) || count < 0)
          {
            throw new RangeError(`tick count must be a non-negative integer, received ${count}`);
          }
          for (let index = 0; index < count && !session.state.done; index += 1)
          {
            core.stepSimRunSession(session);
          }
          return snapshot(seed, session.state);
        }
      });
    }
  });
}
