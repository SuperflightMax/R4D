// The controller delegates every physical tick and every RNG call to the pinned core.
export class Controller {
  constructor(core, baseConfig, provenance, seed) {
    this.core = core;
    this.baseConfig = structuredClone(baseConfig);
    this.provenance = structuredClone(provenance);
    this.reset(seed);
  }

  reset(seed) {
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError('Seed must be a uint32');
    this.seed = seed;
    const cfg = structuredClone(this.baseConfig);
    cfg.rng.seed = seed;
    this.events = [];
    this.session = this.core.createSimRunSession(cfg, {
      dropId: cfg.board.drops[0].id,
      onEvent: event => this.events.push(structuredClone(event)),
    });
    this.maxTicks = Math.ceil(cfg.board.timeSecMax * 1000 / cfg.defaults.tickMs);
    this.frames = [this.snapshot()];
  }

  snapshot() { return structuredClone(this.session.state); }
  get state() { return this.session.state; }
  get contacts() { return this.events.filter(e => e.type === 'object_hit'); }

  advance(count = 1) {
    if (!Number.isInteger(count) || count < 0 || count > this.maxTicks) throw new RangeError('Invalid physical tick count');
    for (let i = 0; i < count && !this.state.done; i++) {
      const before = this.events.length;
      this.core.stepSimRunSession(this.session);
      if (!this.state.done && this.state.tick >= this.maxTicks) this.core.timeoutSimRunSession(this.session);
      // A collision event is emitted inside tick N; the post-step exact frame is N+1.
      for (let j = before; j < this.events.length; j++) this.events[j].observedAtTick = this.state.tick;
      this.frames.push(this.snapshot());
    }
    return this.snapshot();
  }

  seek(tick) {
    if (!Number.isInteger(tick) || tick < 0 || tick > this.maxTicks) throw new RangeError('Invalid target tick');
    this.reset(this.seed);
    return this.advance(tick);
  }

  descriptor() {
    return {
      schema: 'r4d.p2.replay.v1', seed: this.seed,
      dropId: this.session.dropId, start: structuredClone(this.baseConfig.board.drops[0]),
      config: structuredClone(this.baseConfig), provenance: structuredClone(this.provenance),
      tick: this.state.tick, state: this.snapshot(), events: structuredClone(this.events),
    };
  }
}

export function randomSeed() {
  return crypto.getRandomValues(new Uint32Array(1))[0];
}
