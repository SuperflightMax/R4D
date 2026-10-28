// Session management only. All motion, collision, quantization and PRNG are native.
export function createReplay(core, adapter, binding) {
  let seed = adapter.config.rng.seed;
  let run = adapter.createRun(seed);
  const maxTicks = Math.ceil(adapter.config.board.timeSecMax * 1000 / adapter.config.defaults.tickMs);
  function restart(value) {
    run = adapter.createRun(value);
    seed = value;
    return run.snapshot();
  }
  function seek(tick) {
    if (!Number.isInteger(tick) || tick < 0 || tick > maxTicks) throw new RangeError(`tick: 0..${maxTicks}`);
    run = adapter.createRun(seed);
    return run.stepTicks(tick);
  }
  function checkpoint(art = null) {
    const config = core.cloneConfig(adapter.config);
    config.rng.seed = seed;
    return {schema:'r4d.p4.checkpoint.v1', binding, art, seed, config,
      state:run.snapshot(), events:run.events()};
  }
  function restore(value) {
    if (value.schema !== 'r4d.p4.checkpoint.v1'
      || JSON.stringify(value.binding) !== JSON.stringify(binding)) throw new Error('Несовместимая версия входа');
    const expected = core.cloneConfig(adapter.config);
    expected.rng.seed = value.seed;
    if (JSON.stringify(value.config) !== JSON.stringify(expected)) throw new Error('Config изменён');
    const candidate = adapter.createRun(value.seed);
    const state = candidate.stepTicks(value.state.tick);
    if (JSON.stringify(state) !== JSON.stringify(value.state)
      || JSON.stringify(candidate.events()) !== JSON.stringify(value.events)) throw new Error('Checkpoint не воспроизводится');
    seed = value.seed;
    run = candidate;
    return state;
  }
  return {get seed(){return seed;}, maxTicks, restart, seek, checkpoint, restore,
    snapshot:()=>run.snapshot(), events:()=>run.events(), stepTicks:n=>run.stepTicks(n)};
}
