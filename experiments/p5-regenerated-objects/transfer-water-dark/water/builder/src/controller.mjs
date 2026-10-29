import { createSimRunSession, stepSimRunSession, timeoutSimRunSession } from '@millionko/sim-core';

// Only this module advances native state. Rendering receives detached snapshots.
export class NativeRun {
  constructor(baseline, pins) {
    this.baseline = structuredClone(baseline);
    this.pins = structuredClone(pins);
    this.runs = [];
    this.reset(0);
  }

  reset(seed, { record = true } = {}) {
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError('seed must be uint32');
    this.seed = seed;
    const config = structuredClone(this.baseline);
    config.rng.seed = seed;
    this.events = [];
    this.session = createSimRunSession(config, {
      dropId: config.board.drops[0].id,
      onEvent: event => this.events.push({ ...structuredClone(event), stateTick: event.type === 'object_hit' ? event.tick + 1 : event.tick }),
    });
    this.maxTicks = Math.ceil(config.board.timeSecMax * 1000 / config.defaults.tickMs);
    if (record) this.runs.push({ seed, startedUtc: new Date().toISOString(), dropId: this.session.dropId, pins: this.pins });
    return this.snapshot();
  }

  step(count = 1) {
    if (!Number.isInteger(count) || count < 0) throw new RangeError('step count must be a non-negative integer');
    for (let i = 0; i < count && !this.session.state.done; i++) {
      stepSimRunSession(this.session);
      // The exact native step API intentionally leaves timeSecMax to its caller.
      // Match native runUntilDone's timeout contract without changing the core.
      if (!this.session.state.done && this.session.state.tick >= this.maxTicks) timeoutSimRunSession(this.session);
    }
    const latest = this.runs.at(-1);
    if (latest?.seed === this.seed) {
      latest.lastTick = this.session.state.tick;
      if (this.session.state.done) latest.result = structuredClone(this.session.state.result);
    }
    return this.snapshot();
  }

  seek(tick) {
    if (!Number.isInteger(tick) || tick < 0 || tick > this.maxTicks) throw new RangeError('invalid physical tick');
    const seed = this.seed;
    this.reset(seed, { record: false });
    return this.step(tick);
  }

  snapshot() { return structuredClone(this.session.state); }
  config() { return structuredClone(this.session.cfg); }
  replayRecord() {
    return { schema: 'r4d.p5.replay/1', seed: this.seed, drop: structuredClone(this.session.cfg.board.drops[0]),
      config: this.config(), pins: this.pins, state: this.snapshot(), events: structuredClone(this.events),
      ordinaryRuns: structuredClone(this.runs), tickEventRule: 'collision object_hit tick t -> resulting state tick t+1; other lifecycle events use their actual state tick' };
  }
}
