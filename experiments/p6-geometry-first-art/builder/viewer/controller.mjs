// Native core is injected so the browser and headless checks use the same controller.
export class RunController {
  constructor(core, config, meta, configSourceText) {
    this.core = core;
    this.baseConfig = structuredClone(config);
    this.meta = structuredClone(meta);
    this.configSourceText = configSourceText;
    this.reset(config.rng.seed);
  }
  reset(seed) {
    if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff) throw new Error('Seed must be uint32');
    this.seed = seed;
    this.events = [];
    this.eventStateTicks = [];
    this.states = [];
    this.paused = true;
    const cfg = structuredClone(this.baseConfig);
    cfg.rng.seed = seed;
    this.session = this.core.createSimRunSession(cfg, {
      dropId: cfg.board.drops[0].id,
      onEvent: e => this.events.push(structuredClone(e)),
    });
    this.eventStateTicks = this.events.map(() => 0);
    this.states.push(this.snapshot());
    return this.snapshot();
  }
  snapshot() { return structuredClone(this.session.state); }
  advance(count = 1) {
    if (!Number.isInteger(count) || count < 0 || count > 10000) throw new Error('Invalid tick count');
    const maxTicks = Math.ceil(this.baseConfig.board.timeSecMax * 1000 / this.baseConfig.defaults.tickMs);
    for (let i = 0; i < count && !this.session.state.done; i++) {
      const firstEvent = this.events.length;
      if (this.session.state.tick >= maxTicks) this.core.timeoutSimRunSession(this.session);
      else {
        this.core.stepSimRunSession(this.session);
        if (!this.session.state.done && this.session.state.tick >= maxTicks) this.core.timeoutSimRunSession(this.session);
      }
      for (let j=firstEvent;j<this.events.length;j++) this.eventStateTicks[j] = this.session.state.tick;
      this.states.push(this.snapshot());
    }
    if (this.session.state.done) this.paused = true;
    return this.snapshot();
  }
  seek(tick) {
    if (!Number.isInteger(tick) || tick < 0 || tick > 10000) throw new Error('Invalid tick');
    const seed = this.seed;
    this.reset(seed);
    this.advance(tick);
    this.paused = true;
    return this.snapshot();
  }
  exportReplay() {
    return {
      schema: 'r4d.p6.replay.v1', seed: this.seed, tick: this.session.state.tick,
      config: structuredClone(this.session.cfg),
      originalConfigUtf8: this.configSourceText,
      dropId: this.baseConfig.board.drops[0].id, start: structuredClone(this.baseConfig.board.drops[0]),
      configSha256: this.meta.configSha256, manifestSha256: this.meta.manifestSha256,
      p1Commit: this.meta.p1Commit, coreCommit: this.meta.coreCommit, coreTree: this.meta.coreTree,
      coreSha256: this.meta.coreSha256, artCandidate: this.meta.artCandidate,
      consumerSha256: this.meta.consumerSha256,
      state: this.snapshot(), events: structuredClone(this.events), eventStateTicks: [...this.eventStateTicks],
    };
  }
  importReplay(replay) {
    for (const key of ['configSha256','manifestSha256','p1Commit','coreCommit','coreTree','coreSha256']) {
      if (replay[key] !== this.meta[key]) throw new Error(`Replay pin differs: ${key}`);
    }
    const expected = structuredClone(this.baseConfig);
    if (replay.originalConfigUtf8 !== this.configSourceText || replay.dropId !== this.baseConfig.board.drops[0].id || JSON.stringify(replay.start)!==JSON.stringify(this.baseConfig.board.drops[0])) throw new Error('Replay original config/start differs');
    expected.rng.seed = replay.seed;
    if (JSON.stringify(replay.config) !== JSON.stringify(expected)) throw new Error('Replay config differs beyond seed');
    this.reset(replay.seed);
    this.seek(replay.tick);
    if (JSON.stringify(this.snapshot()) !== JSON.stringify(replay.state)) throw new Error('Replay state differs from native calculation');
    return this.snapshot();
  }
}
