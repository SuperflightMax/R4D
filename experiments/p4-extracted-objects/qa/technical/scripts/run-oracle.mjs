import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { registerHooks } from 'node:module';

const runtime = resolve(process.argv[2] ?? '');
if (!process.argv[2]) throw Error('Usage: node run-oracle.mjs <prepared-runtime-dir>');
const inputReport = JSON.parse(readFileSync(join(runtime, 'input-verification.json')));
const fileSha = bytes => createHash('sha256').update(bytes).digest('hex');
for (const record of inputReport.records) assert.equal(fileSha(readFileSync(join(runtime,'inputs',record.name))),record.sha256);
for (const record of inputReport.nativeFiles) assert.equal(fileSha(readFileSync(join(runtime,'native',record.path))),record.sha256);
const native = join(runtime, 'native', 'packages', 'sim-core', 'src');
const nativeUrl = pathToFileURL(native + '/').href;
// Module resolution only. Native TS bytes are executed unchanged by Node's type stripping.
registerHooks({ resolve(specifier, context, next) {
  if (context.parentURL?.startsWith(nativeUrl) && specifier.startsWith('.') && specifier.endsWith('.js')) {
    return next(specifier.slice(0, -3) + '.ts', context);
  }
  return next(specifier, context);
} });
const { createSimRunSession, stepSimRunSession, timeoutSimRunSession, runUntilDone } = await import(pathToFileURL(join(native, 'Sim.ts')).href);
const { buildWorld } = await import(pathToFileURL(join(native, 'runtime', 'buildWorld.ts')).href);
const { PrngLcg32 } = await import(pathToFileURL(join(native, 'PrngLcg32.ts')).href);
const { validateConfig } = await import(pathToFileURL(join(native, 'validate', 'validateConfig.ts')).href);
const { transform } = await import(pathToFileURL(join(runtime, 'inputs', 'view-math.mjs')).href);
const cfg = JSON.parse(readFileSync(join(runtime, 'inputs', 'config.json')));
const manifest = JSON.parse(readFileSync(join(runtime, 'inputs', 'manifest.json')));
const projection = JSON.parse(readFileSync(join(runtime, 'inputs', 'projection.json')));
const sha = value => createHash('sha256').update(typeof value === 'string' ? value : JSON.stringify(value)).digest('hex');
const clone = x => structuredClone(x);
const equal = (a, b) => assert.deepEqual(a, b);
const writeJson = (name, data) => writeFileSync(join(runtime, name), JSON.stringify(data, null, 2) + '\n');
const checks = [];
function check(name, fn) { const result = fn(); checks.push({ name, status: 'PASS', ...(result ?? {}) }); }

check('exact-config-and-native-validation', () => {
  equal(validateConfig(cfg), []);
  equal([cfg.board.pins.length, cfg.board.segments.length, cfg.board.buckets.length, cfg.board.drops.length], [25, 16, 4, 1]);
  equal(cfg.defaults, { tickMs: 5, quantizeDigits: 7 });
  equal(cfg.physics, { gravityY: 980, maxBallSpeed: 2000, angleDeviationDeg: 2, bounceDeviation: 0.02, wallBounce: 1 });
  equal(cfg.rng, { algo: 'lcg32', seed: 0 });
  equal(cfg.board.ball, { id: 'board01-ball', r: 16, bounce: 0.9 });
  equal([cfg.board.timeSecMin, cfg.board.timeSecMax], [0, 16]);
  assert.equal(manifest.coreCommit, inputReport.nativeCommit);
});
check('projection-and-native-translation', () => {
  let maxNativeRoundTrip = 0, maxSourceDifference = 0;
  const [ox, oy] = manifest.translation.offset;
  const points = [cfg.board.drops[0], ...cfg.board.pins, ...cfg.board.buckets, ...cfg.board.segments.flatMap(s => [{ x:s.x1,y:s.y1 },{ x:s.x2,y:s.y2 }])];
  for (const p of points) {
    const source = transform(manifest.projection.nativeToSource, p);
    const back = transform(manifest.projection.sourceToNative, source);
    maxNativeRoundTrip = Math.max(maxNativeRoundTrip, Math.hypot(back.x-p.x, back.y-p.y));
    const fromResearch = transform(projection.transform.forward, { x:p.x-ox, y:p.y-oy });
    maxSourceDifference = Math.max(maxSourceDifference, Math.hypot(source.x-fromResearch.x, source.y-fromResearch.y));
  }
  assert(maxNativeRoundTrip < 1e-8); assert(maxSourceDifference < 1e-8);
  for (const obstacle of projection.obstacles) {
    const pin = cfg.board.pins.find(p => p.id === obstacle.id);
    assert(pin); assert(Math.abs(pin.x - (obstacle.centerFlat[0]+ox)) < 1e-9); assert(Math.abs(pin.y - (obstacle.centerFlat[1]+oy)) < 1e-9);
    assert.equal(pin.r, obstacle.radiusFlat);
  }
  for (const goal of projection.goals) {
    const b = cfg.board.buckets.find(b => b.id === goal.id); assert(b);
    assert(Math.abs(b.x-(goal.centerFlat[0]+ox))<1e-9); assert(Math.abs(b.y-(goal.centerFlat[1]+oy))<1e-9); assert.equal(b.r,goal.radiusFlat);
  }
  return { points: points.length, maxNativeRoundTrip, maxSourceDifference };
});

// Fixed before executing; no discarded seeds or outcome-based reruns.
const seeds = [1,2,3,4,5,6,7,8];
const maxTicks = Math.ceil(cfg.board.timeSecMax * 1000 / cfg.defaults.tickMs);
function run(seed, restore, chunked = false) {
  const config = clone(cfg); config.rng.seed = seed;
  const events = [];
  const session = createSimRunSession(config, { onEvent: e => events.push(clone(e)) });
  if (restore) { Object.assign(session.state, clone(restore)); events.length=0; }
  const frames = [{ state:clone(session.state), events: restore ? [] : events.splice(0) }];
  const chunks = chunked ? [1,7,2,19,4,41] : [1];
  let chunk = 0;
  while (!session.state.done && session.state.tick < maxTicks) {
    const n = chunks[(chunk++) % chunks.length];
    for (let i = 0; i < n && !session.state.done && session.state.tick < maxTicks; i++) {
      stepSimRunSession(session);
      frames.push({ state:clone(session.state), events:events.splice(0) });
    }
  }
  if (!session.state.done) {
    timeoutSimRunSession(session);
    frames[frames.length-1] = { state:clone(session.state), events:[...frames.at(-1).events,...events.splice(0)] };
  }
  return { frames, config, session };
}
const summaries = [], windows = [], replayRecords = [];
mkdirSync(join(runtime, 'runs'), { recursive:true });
for (const seed of seeds) {
  const primary = run(seed), replay = run(seed), chunked = run(seed, undefined, true);
  equal(replay.frames, primary.frames); equal(chunked.frames, primary.frames);
  const final = primary.frames.at(-1).state;
  const nativeResult = runUntilDone(clone(primary.config));
  equal(nativeResult.result, final.result); equal(nativeResult.ticks, final.tick);
  const hits = primary.frames.flatMap(f => f.events.filter(e=>e.type==='object_hit'));
  const contacts = hits.filter(e=>e.objectKind!=='bucket');
  const targets = [...new Set([0,1,50,100,Math.floor(final.tick/2),Math.max(0,final.tick-1),final.tick,...contacts.slice(0,3).flatMap(h=>[h.tick,h.tick+1,h.tick+2])])].filter(t=>t<=final.tick).sort((a,b)=>a-b);
  for (const tick of targets.filter(t=>t>0 && t<final.tick).slice(0,6)) {
    const checkpoint = primary.frames[tick].state;
    const continued = run(seed, JSON.parse(JSON.stringify(checkpoint)));
    // run_started/ball_spawned belong to construction; exclude them from restored-session event comparison.
    equal(continued.frames.slice(1), primary.frames.slice(tick+1));
  }
  for (let i=0; i<primary.frames.length; i++) {
    const {state,events}=primary.frames[i];
    assert.equal(state.tick,i);
    for (const n of [state.ball.pos.x,state.ball.pos.y,state.ball.vel.x,state.ball.vel.y]) assert(Number.isFinite(n));
    for (const e of events.filter(e=>e.type==='object_hit' && e.objectKind!=='bucket')) assert.equal(e.tick,state.tick-1);
    if (i) {
      const prng=new PrngLcg32(primary.frames[i-1].state.rngU32);
      for (const hit of events.filter(e=>e.type==='object_hit' && e.objectKind!=='bucket')) { prng.nextU32(); prng.nextU32(); }
      assert.equal(state.rngU32,prng.state.u32);
    }
  }
  const snapshot = clone(final); stepSimRunSession(primary.session); equal(primary.session.state,snapshot);
  const jsonl = primary.frames.map(f=>JSON.stringify(f)).join('\n')+'\n';
  writeFileSync(join(runtime,'runs',`seed-${seed}.jsonl`),jsonl);
  const contactWindows = contacts.map(h=>({seed,objectId:h.objectId,objectKind:h.objectKind,eventTick:h.tick,beforeStateTick:h.tick,afterStateTick:h.tick+1,followingStateTick:Math.min(final.tick,h.tick+2)}));
  windows.push(...contactWindows);
  const checkpoints = targets.map(tick=>({state:primary.frames[tick].state,sha256:sha(primary.frames[tick].state)}));
  const bucketEntries=primary.frames.flatMap(f=>f.events.filter(e=>e.type==='bucket_entered'));
  if (final.result.kind==='IN_BUCKET') { assert.equal(bucketEntries.length,1); assert.equal(bucketEntries[0].tick,final.tick); assert.equal(bucketEntries[0].bucketId,final.result.bucketId); }
  const summary = {seed,finalTick:final.tick,result:final.result,finalState:final,contactCount:contacts.length,contactObjects:[...new Set(contacts.map(e=>e.objectId))],bucketEntries,trajectorySha256:sha(jsonl),physicalTraceSha256:sha(primary.frames.map(f=>f.state.ball)),checkpoints};
  summaries.push(summary);
  replayRecords.push({ schema:'r4d.p4.technical-qa.replay.v1', seed,dropId:primary.session.dropId,config:primary.config,configSha256:sha(primary.config),coreCommit:inputReport.nativeCommit,p1Commit:inputReport.p1Commit,sourceSha256:inputReport.source.sha256,projectionShaLf:inputReport.records.find(r=>r.name==='projection.json').shaLf,checkpoint:checkpoints[Math.floor(checkpoints.length/2)] });
}
check('fixed-seeds-replay-chunks-checkpoint-restoration-and-native-headless',()=>({seeds,results:summaries.map(s=>({seed:s.seed,tick:s.finalTick,result:s.result})),exactReplay:true}));
check('different-seeds-change-physical-trajectory',()=>{
  // Exclude rngU32 itself: differing RNG metadata alone is not trajectory diversity.
  const traces = summaries.map(s=>s.physicalTraceSha256);
  assert(new Set(traces).size>1);
  return {distinctPhysicalTraces:new Set(traces).size,seeds:seeds.length};
});
check('native-world-defaults',()=>{
  const world=buildWorld(clone(cfg));
  assert([...world.pins,...world.segments,...world.buckets,...world.drops].every(o=>o.enabled && o.visible));
  return {enabledAndVisibleObjects:world.pins.length+world.segments.length+world.buckets.length+world.drops.length};
});
check('diagnostic-bucket-and-open-bottom-states-not-ordinary-runs',()=>{
  // Inject controlled state into the unchanged native world; never include these in ordinary-run evidence.
  const samples=[];
  function oneStep(label,x,y) {
    const session=createSimRunSession(clone(cfg));
    session.state.ball={pos:{x,y},vel:{x:0,y:-cfg.physics.gravityY*cfg.defaults.tickMs/1000}};
    session.state.tick=42;
    stepSimRunSession(session);
    samples.push({label,state:clone(session.state)});
    return session.state;
  }
  for (const b of cfg.board.buckets) {
    const inside=oneStep(`${b.id}-one-unit-inside`,b.x+b.r-1,b.y);
    equal(inside.result,{kind:'IN_BUCKET',bucketId:b.id});
    assert.equal(inside.tick,43);
    assert.equal(inside.rngU32,0);
    const outside=oneStep(`${b.id}-outside`,b.x+b.r+0.01,b.y);
    assert.equal(outside.done,false);
  }
  const stillVisible=oneStep('bottom-ball-not-wholly-below',cfg.board.drops[0].x,cfg.board.height+cfg.board.ball.r-0.01);
  assert.equal(stillVisible.done,false);
  const gone=oneStep('bottom-ball-wholly-below',cfg.board.drops[0].x,cfg.board.height+cfg.board.ball.r+0.01);
  assert.equal(gone.result.kind,'LOST');
  writeJson('diagnostic-terminal-states.json',samples);
  return {samples:samples.length,bucketRule:'center distance < bucket.r, not bucket.r - ball.r',bottomRule:'ball.pos.y - ball.r > board.height'};
});
writeJson('ordinary-runs.json',summaries);
writeJson('contact-windows.json',windows);
writeJson('replay-records.json',replayRecords);
const observationGroups=[
  {label:'first-pin-contact',seed:1,ticks:[94,95,96]},
  {label:'first-side-contact',seed:1,ticks:[527,528,529]},
  {label:'ordinary-bucket-entry',seed:4,ticks:[2086,2087,2088]},
  {label:'ordinary-open-bottom-loss',seed:1,ticks:[1733,1734,1735]},
].map(group=>{
  const frames=readFileSync(join(runtime,'runs',`seed-${group.seed}.jsonl`),'utf8').trim().split('\n').map(line=>JSON.parse(line));
  return {...group,frames:group.ticks.map(tick=>frames[tick])};
});
writeJson('observation-checkpoints.json',observationGroups);
writeJson('oracle-checks.json',{schema:'r4d.p4.technical-qa.oracle.v1',scope:'input/native oracle preparation only; no P4 candidate tested',node:process.version,inputVersions:{p1Commit:inputReport.p1Commit,coreCommit:inputReport.nativeCommit},checks});
console.log(JSON.stringify({checks:checks.map(c=>({name:c.name,status:c.status})),runs:summaries.map(s=>({seed:s.seed,finalTick:s.finalTick,result:s.result,contacts:s.contactCount})),contactWindows:windows.length}));
