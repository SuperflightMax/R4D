// Independent QA of immutable candidate-04. No Builder checker/build, browser or native re-audit.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { SourceTextModule } from 'node:vm';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const arg = name => {
  const i = process.argv.indexOf(name), value = i >= 0 ? process.argv[i + 1] : undefined;
  assert.ok(value && !value.startsWith('--'), `Required argument ${name}`); return path.resolve(value);
};
const artifact = arg('--artifact'), baselineArtifact = arg('--baseline-artifact');
const baselineEvidence = arg('--baseline-evidence'), output = arg('--output');
const coreRoot = arg('--core-root'), pixiRoot = arg('--pixi-root'), resourcePath = arg('--resources');
for (const dir of [artifact, baselineArtifact, baselineEvidence, output, resourcePath]) assert.ok(dir.replaceAll('\\', '/').toLowerCase().startsWith('e:/r4d/perspective/p2-runtime/'));
assert.ok(![artifact, baselineArtifact].some(dir => output === dir || output.startsWith(dir + path.sep)));
assert.ok(!existsSync(path.join(output, 'EVIDENCE.json')), 'Preserve earlier evidence');
const sha = bytes => createHash('sha256').update(bytes).digest('hex');
const lf = bytes => Buffer.from(bytes.toString('utf8').replaceAll('\r\n', '\n'));
const buildCommit = '08f9b9eaa6aa1063eb7fcd9cf373ddacf907725a';
const implementationCommit = '0a80b0b63c688b6f77b8f710576adf2ea5c263c1';
const git = (args, cwd = process.cwd()) => execFileSync('git', args, { cwd, maxBuffer: 8 * 1024 * 1024 });
const source = file => git(['show', `${buildCommit}:experiments/p2-free-approach/builder/${file}`]);
const root = path.join(artifact, 'bundle/review/r4d/p2-free-approach');
const previousRoot = path.join(baselineArtifact, 'bundle/review/r4d/p2-free-approach');
const read = file => readFileSync(path.join(root, file)), oldRead = file => readFileSync(path.join(previousRoot, file));
const text = file => read(file).toString('utf8');
const manifestBytes = readFileSync(path.join(artifact, 'BUILD_MANIFEST.json'));
assert.equal(sha(manifestBytes), '60f79d1bdad8d3737376952043013394bb3098de6b15200fc5c352dd875dd1f7');
const manifest = JSON.parse(manifestBytes);
assert.equal(manifest.sourceCommit, buildCommit); assert.equal(manifest.candidate, 'p2-jungle-static-candidate-04');
const walk = (dir, prefix = '') => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  assert.ok(!entry.isSymbolicLink()); return entry.isDirectory() ? walk(path.join(dir, entry.name), prefix + entry.name + '/') : [prefix + entry.name];
}).sort();
const files = walk(root);
const records = files.map(file => ({ path: file, bytes: read(file).length, sha256: sha(read(file)), kind: file === 'runtime/sim-core.js' ? 'authorized-private-compiled-runtime' : 'public-scene-or-asset' }));
assert.deepEqual(records, manifest.files); assert.equal(files.length, 16);
assert.equal(records.reduce((sum, f) => sum + f.bytes, 0), 2452021);
assert.equal(sha(JSON.stringify(records) + '\n'), '60d216a64c86fed4b83f4ed3802e3d1393cdda2db8776818d22710173dc2ffed');
const baselineBytes = readFileSync(baselineEvidence);
assert.equal(sha(baselineBytes), '0a34ca7223d7b85fa9150ab94600592f4edc83d8d68fd78ce12bfdfcfaa85a41');
const baseline = JSON.parse(baselineBytes);
for (const file of baseline.files) assert.equal(sha(oldRead(file.path)), file.sha256);
const unchanged = ['inputs/config.json', 'inputs/manifest.json', 'inputs/view-math.js', 'src/controller.js', 'runtime/sim-core.js', 'vendor/pixi.js', 'vendor/PIXI-LICENSE.txt', 'source/01-jungle.jpg', 'assets/files/ball-v2.png', 'assets/files/shadow-native-disc-v1.png', 'style.css'];
for (const file of unchanged) assert.ok(read(file).equals(oldRead(file)), file);
const art = JSON.parse(text('assets/manifest.json')), previousArt = JSON.parse(oldRead('assets/manifest.json'));
previousArt.provenance.candidate = manifest.candidate;
previousArt.provenance.consumerGitBlob = git(['rev-parse', `${buildCommit}:experiments/p2-free-approach/builder/src/main.mjs`]).toString().trim();
assert.deepEqual(art, previousArt);
const metadata = JSON.parse(text('metadata.json')), previousMetadata = JSON.parse(oldRead('metadata.json'));
previousMetadata.candidate = manifest.candidate; previousMetadata.sourceCommit = buildCommit; assert.deepEqual(metadata, previousMetadata);
const codeFiles = ['index.html', 'style.css', 'src/main.mjs', 'src/controller.mjs', 'src/playback-clock.mjs', 'inputs/view-math.mjs', 'scripts/build-static.mjs', 'scripts/scan-browser-text.mjs'];
const implementationBlobs = codeFiles.map(file => {
  const suffix = `:experiments/p2-free-approach/builder/${file}`;
  const implemented = git(['rev-parse', implementationCommit + suffix]).toString().trim();
  const built = git(['rev-parse', buildCommit + suffix]).toString().trim(); assert.equal(built, implemented);
  return { file, gitBlob: built };
});
const expectedEmissions = [
  ['index.html', 'index.html', [['"pixi.js":"./vendor/pixi.mjs"', '"pixi.js":"./vendor/pixi.js"'], ['src="./src/main.mjs"', 'src="./src/main.js"']]],
  ['src/main.mjs', 'src/main.js', [["from '../runtime/sim-core.mjs'", "from '../runtime/sim-core.js'"], ["from './controller.mjs'", "from './controller.js'"], ["from './playback-clock.mjs'", "from './playback-clock.js'"], ["from '../inputs/view-math.mjs'", "from '../inputs/view-math.js'"]]],
  ['src/controller.mjs', 'src/controller.js', []], ['src/playback-clock.mjs', 'src/playback-clock.js', []], ['inputs/view-math.mjs', 'inputs/view-math.js', []],
];
assert.equal(manifest.moduleEmissions.length, 5);
for (const [index, [input, emitted, changes]] of expectedEmissions.entries()) {
  const receipt = manifest.moduleEmissions[index], bytes = source(input);
  assert.deepEqual([receipt.source, receipt.output, receipt.references], [input, emitted, changes]);
  assert.equal(receipt.sourceGitBlob, git(['rev-parse', `${buildCommit}:experiments/p2-free-approach/builder/${input}`]).toString().trim());
  assert.equal(receipt.sourceCanonicalLfSha256, sha(lf(bytes)));
  let adapted = lf(bytes).toString();
  for (const [before, after] of changes) { assert.equal(adapted.split(before).length, 2); adapted = adapted.replace(before, after); }
  assert.equal(text(emitted), adapted);
}
const cfg = JSON.parse(text('inputs/config.json')), accepted = JSON.parse(text('inputs/manifest.json'));
assert.equal(sha(read('inputs/config.json')), 'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db');
assert.equal(cfg.board.ball.r, 16); assert.equal(cfg.defaults.tickMs, 5);
assert.equal(sha(read('runtime/sim-core.js')), 'dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7');
assert.equal(git(['rev-parse', 'HEAD'], coreRoot).toString().trim(), '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023');
assert.equal(git(['--no-optional-locks', 'status', '--porcelain=v1', '--', 'packages/sim-core'], coreRoot).length, 0);
assert.equal(JSON.parse(readFileSync(path.join(pixiRoot, 'package.json'))).version, '8.22.0');
assert.ok(read('vendor/PIXI-LICENSE.txt').equals(readFileSync(path.join(pixiRoot, 'LICENSE'))));

const html = text('index.html'), main = text('src/main.js');
const rateSelect = html.match(/<select id="playback-rate">([\s\S]*?)<\/select>/)[1];
assert.deepEqual([...rateSelect.matchAll(/<option value="([^"]+)"([^>]*)>/g)].map(m => ({ value: Number(m[1]), selected: /\bselected\b/.test(m[2]) })), [{ value: .25, selected: true }, { value: .5, selected: false }, { value: 1, selected: false }]);
for (const required of ["new PlaybackClock(config.defaults.tickMs, Number($('playback-rate').value))", "$('playback-rate').onchange = () => setPlaybackRate(Number($('playback-rate').value))", "record('rate-change')", 'clock.consume(ticker.deltaMS, sim.maxTicks - sim.state.tick)', 'if (sim.state.done) clock.reset()', 'clock.setSuspended(document.hidden)', "document.addEventListener('visibilitychange'", 'history: structuredClone(presentationHistory)', 'presentation: presentation()', 'mergeObservation(previous, item)', "record('seek', { requestedTick: tick })", "record('manual-step', { requestedTicks: count })"]) assert.ok(main.includes(required), required);
assert.ok(!/ticker\.speed\s*=|accumulator\s*\+=|\b(?:XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b|method\s*:\s*['"]POST['"]|\/api\//.test(main));
assert.ok(main.includes('await fetch(url)') && main.includes('URL.createObjectURL(new Blob(') && main.includes('link.download = filename'));
const route = new URL('https://offline.invalid/review/r4d/p2-free-approach/');
const imports = JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
assert.deepEqual(imports, { 'pixi.js': './vendor/pixi.js' });
const refs = [];
function ref(from, value, kind) {
  assert.ok(!/^(?:[a-z][\w+.-]*:|\/|\\)/i.test(value));
  const url = new URL(value, new URL(from, route)); assert.ok(url.href.startsWith(route.href));
  const target = url.pathname.slice(route.pathname.length); assert.ok(files.includes(target)); refs.push({ from, value, target, kind }); return target;
}
for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) ref('index.html', m[1], 'html');
for (const value of Object.values(imports)) ref('index.html', value, 'importmap');
const modules = new Map(files.filter(f => /\.js$/.test(f)).map(f => [f, new SourceTextModule(text(f), { identifier: f })]));
assert.equal(modules.size, 6); assert.ok(!files.some(f => /\.(?:mjs|ts|tsx|map)$/.test(f)));
for (const [file, module] of modules) for (const specifier of module.dependencySpecifiers) ref(specifier in imports ? 'index.html' : file, imports[specifier] ?? specifier, 'module');
await modules.get('src/main.js').link((specifier, from) => modules.get(new URL(imports[specifier] ?? specifier, specifier in imports ? route : new URL(from.identifier, route)).pathname.slice(route.pathname.length)));
assert.ok([...modules.values()].every(module => module.status === 'linked'));
for (const m of main.matchAll(/resource\('([^']+)'\)/g)) ref('index.html', m[1], 'resource');
for (const a of [art.ball, art.shadow]) ref('index.html', 'assets/files/' + a.file, 'asset');
const scanner = await import('data:text/javascript;base64,' + source('scripts/scan-browser-text.mjs').toString('base64'));
const textFiles = files.filter(f => /\.(?:js|json|html|css|txt)$/.test(f));
const privacy = textFiles.map(file => ({ path: file, ...scanner.scanBrowserText(file, read(file)) }));
assert.deepEqual(privacy, manifest.privacyScan.files); assert.equal(privacy.length, 13);
assert.ok(privacy.every(result => !result.violations.length));
assert.deepEqual(privacy.filter(result => result.exceptions.length).map(r => [r.path, r.exceptions]), [['vendor/pixi.js', [{ kind: 'pinned-pixi-uri-regex', start: 135846, end: 135849 }]]]);
for (const sample of ['const p=`E:/example-private/core.ts`;', 'file:///E:/example-private/core.ts', 'packages/sim-core/src/Sim.ts', '//# sourceMappingURL=private.map']) assert.ok(scanner.scanBrowserText('src/probe.js', Buffer.from(sample)).violations.length);
assert.equal(scanner.scanBrowserText('src/probe.js', Buffer.from('https://example.invalid/docs')).violations.length, 0);
assert.equal(scanner.scanBrowserText('vendor/pixi.js', Buffer.concat([read('vendor/pixi.js'), Buffer.from('\n')])).exceptions.length, 0);

const { PlaybackClock, mergeObservation, PLAYBACK_RATES, DEFAULT_PLAYBACK_RATE } = await import(pathToFileURL(path.join(root, 'src/playback-clock.js')).href);
const { Controller } = await import(pathToFileURL(path.join(root, 'src/controller.js')).href);
const core = await import(pathToFileURL(path.join(root, 'runtime/sim-core.js')).href);
assert.deepEqual(PLAYBACK_RATES, [.25, .5, 1]); assert.equal(DEFAULT_PLAYBACK_RATE, .25);
assert.equal(new PlaybackClock(5).rate, .25);

// Independent integer-credit ledger: units = 1/16 ms. It retains total earned
// credit and a separate count of spent ticks, rather than copying clock remainder math.
const oracleCases = [];
function oracleScenario(name, initialRate, actions) {
  const clock = new PlaybackClock(5, initialRate);
  let credit = 0n, spent = 0n, rate = initialRate, suspended = false, discard = true;
  const trace = [];
  const resetLedger = () => { credit = 0n; spent = 0n; discard = true; };
  for (const action of actions) {
    let expected, actual;
    if (action.type === 'rate') { rate = action.value; clock.setRate(rate); }
    if (action.type === 'reset') { resetLedger(); clock.reset(); }
    if (action.type === 'hidden') { if (suspended !== action.value) { suspended = action.value; resetLedger(); } clock.setSuspended(action.value); }
    if (action.type === 'consume') {
      const remaining = action.remaining ?? 1000;
      if (remaining === 0) { resetLedger(); expected = 0; }
      else if (suspended) expected = 0;
      else if (discard) { discard = false; expected = 0; }
      else {
        assert.ok(Number.isInteger(action.delta * 4));
        credit += BigInt(action.delta * 4) * BigInt(rate * 4);
        const totalEntitled = credit / 80n;
        const owed = totalEntitled - spent;
        expected = Number(owed > BigInt(remaining) ? BigInt(remaining) : owed);
        spent += BigInt(expected);
        if (owed >= BigInt(remaining)) { credit = 0n; spent = 0n; }
      }
      actual = clock.consume(action.delta, remaining); assert.equal(actual, expected, name);
    }
    const snapshot = clock.snapshot();
    assert.deepEqual({ rate: snapshot.rate, suspended: snapshot.suspended, discard: snapshot.discardNextDelta, remainder: snapshot.remainderSimMs }, { rate, suspended, discard, remainder: Number(credit - spent * 80n) / 16 }, name);
    trace.push({ action, expectedTicks: expected, actualTicks: actual, snapshot });
  }
  oracleCases.push({ name, trace });
}
const consume = (delta, remaining) => ({ type: 'consume', delta, ...(remaining === undefined ? {} : { remaining }) });
for (const rate of [.25, .5, 1]) {
  oracleScenario(`threshold-${rate}`, rate, [consume(999), consume(5 / rate - .25), consume(.25), consume(10 / rate)]);
  oracleScenario(`uneven-${rate}`, rate, [consume(0), ...[.25, 1.75, 7.5, 3.25, 22.5, 16.75, 0, 31.25, 9.5].map(delta => consume(delta))]);
}
oracleScenario('mixed-rate-carry-no-advance', .25, [consume(0), consume(8), { type: 'rate', value: .5 }, consume(6), consume(5), { type: 'rate', value: 1 }, consume(2.5), { type: 'rate', value: .25 }]);
oracleScenario('reset-discards-fraction-and-one-delta', .25, [consume(0), consume(10), { type: 'reset' }, consume(100), consume(20), consume(0)]);
oracleScenario('hidden-visible-no-backlog', .25, [consume(0), consume(12), { type: 'hidden', value: true }, consume(1000), { type: 'hidden', value: true }, { type: 'rate', value: 1 }, consume(1000), { type: 'hidden', value: false }, consume(1000), consume(5)]);
oracleScenario('remaining-terminal-budget', .25, [consume(0), consume(200, 2), consume(0, 0), consume(20, 8), consume(20, 8)]);
const invalidCases = [];
for (const [name, callback] of [
  ['tick-zero', () => new PlaybackClock(0)], ['tick-infinite', () => new PlaybackClock(Infinity)], ['tick-string', () => new PlaybackClock('5')],
  ...[0, 2, .125, '0.25', NaN].map(rate => [`invalid-rate-${String(rate)}`, () => new PlaybackClock(5).setRate(rate)]),
  ...[-1, NaN, Infinity].map(delta => [`invalid-delta-${String(delta)}`, () => new PlaybackClock(5).consume(delta, 10)]),
  ...[-1, .5, Infinity, Number.MAX_SAFE_INTEGER + 1].map(remaining => [`invalid-remaining-${String(remaining)}`, () => new PlaybackClock(5).consume(5, remaining)]),
  ['suspension-string', () => new PlaybackClock(5).setSuspended('true')],
]) { assert.throws(callback); invalidCases.push(name); }
const overflow = new PlaybackClock(1e308, 1); overflow.consume(0, 100); overflow.consume(8e307, 100);
const beforeOverflow = overflow.snapshot(); assert.throws(() => overflow.consume(1.5e308, 100), RangeError); assert.deepEqual(overflow.snapshot(), beforeOverflow); invalidCases.push('finite-input-budget-overflow');
const detachedClock = new PlaybackClock(5); const detachedSnapshot = detachedClock.snapshot(); detachedSnapshot.rate = 1; assert.equal(detachedClock.rate, .25);
const invalidAtomic = new PlaybackClock(5); invalidAtomic.consume(0, 10); invalidAtomic.consume(8, 10);
const beforeInvalid = invalidAtomic.snapshot(); assert.throws(() => invalidAtomic.setRate(2)); assert.throws(() => invalidAtomic.consume(-1, 10)); assert.throws(() => invalidAtomic.setSuspended('true')); assert.deepEqual(invalidAtomic.snapshot(), beforeInvalid);

const provenance = { ...metadata, projection: accepted.projection, source: accepted.source };
const rateWindows = [], mixedRuns = [], mergeCases = [];
const withoutPresentation = object => { const copy = structuredClone(object); delete copy.presentation; return copy; };
for (const seed of [1, 490822599]) {
  const oldRun = baseline.newExecution.runs.find(run => run.seed === seed); assert.ok(oldRun);
  const reference = new Controller(core, cfg, provenance, seed); reference.advance(250);
  const referenceFrames = structuredClone(reference.frames);
  const referenceEvents = structuredClone(reference.events);
  for (const point of oldRun.checkpoints.filter(p => p.tick <= 250)) assert.deepEqual(referenceFrames[point.tick], point.state);
  for (const rate of [.25, .5, 1]) {
    const sim = new Controller(core, cfg, provenance, seed), clock = new PlaybackClock(5, rate);
    const initial = sim.snapshot(); clock.consume(123, sim.maxTicks); clock.setRate(rate); assert.deepEqual(sim.snapshot(), initial);
    const checkpoints = [];
    for (let target = 1; target <= 250; target++) {
      const ticks = clock.consume(5 / rate, sim.maxTicks - sim.state.tick); assert.equal(ticks, 1); sim.advance(ticks);
      if ([94, 95, 96, 105, 250].includes(target)) { assert.deepEqual(sim.snapshot(), referenceFrames[target]); assert.deepEqual(sim.events, referenceEvents.filter(event => (event.observedAtTick ?? event.tick ?? 0) <= target)); checkpoints.push({ tick: target, state: sim.snapshot(), events: structuredClone(sim.events), clock: clock.snapshot() }); }
    }
    const beforeRate = sim.snapshot(); clock.setRate(rate === 1 ? .25 : 1); assert.deepEqual(sim.snapshot(), beforeRate);
    clock.reset(); sim.seek(94); sim.advance(1); assert.deepEqual(sim.snapshot(), referenceFrames[95]);
    sim.advance(10); assert.deepEqual(sim.snapshot(), referenceFrames[105]);
    rateWindows.push({ seed, rate, checkpoints, physicalStateUnchangedOnRateChange: true, manualSeekStepExact: true });
  }
  // One complete mixed-rate scheduler path per seed reaches terminal. This is
  // new-clock integration; no per-tick native reference or six-seed audit runs.
  const sim = new Controller(core, cfg, provenance, seed), clock = new PlaybackClock(5, .25);
  const deltas = [.25, 11.75, 27.5, 3.25, 16.75, 22.25, 8.5], history = [];
  let frame = 0, phase = 0, suppliedMs = 0;
  while (!sim.state.done && frame < 20000) {
    const nextPhase = sim.state.tick >= 750 ? 3 : sim.state.tick >= 500 ? 2 : sim.state.tick >= 95 ? 1 : 0;
    if (phase !== nextPhase) { phase = nextPhase; clock.setRate([.25, .5, 1, .25][phase]); history.push({ sequence: history.length + 1, reason: 'rate-change', atTick: sim.state.tick, rate: clock.rate }); }
    const delta = deltas[frame++ % deltas.length]; suppliedMs += delta;
    const ticks = clock.consume(delta, sim.maxTicks - sim.state.tick); if (ticks) sim.advance(ticks);
  }
  assert.ok(sim.state.done); assert.deepEqual(sim.snapshot(), oldRun.final);
  assert.equal(sha(JSON.stringify(sim.frames)), oldRun.trajectorySha256); assert.deepEqual(sim.events, oldRun.descriptor.events);
  clock.reset(); const terminal = sim.snapshot(); clock.setRate(.5); assert.equal(clock.consume(100, 0), 0); assert.deepEqual(sim.snapshot(), terminal);
  const descriptor = sim.descriptor(); assert.deepEqual(descriptor.config, cfg); assert.deepEqual(descriptor.provenance, provenance); assert.equal(descriptor.seed, seed);
  assert.ok(!('presentation' in descriptor.config) && !('playbackRate' in descriptor.config));
  mixedRuns.push({ seed, result: terminal.result, terminalTick: terminal.tick, frames: sim.frames.length, syntheticDeltaFrames: frame, suppliedSyntheticMs: suppliedMs, rateHistory: history, trajectorySha256: sha(JSON.stringify(sim.frames)), descriptor, terminalClock: clock.snapshot() });

  const configBefore = structuredClone(cfg);
  const event1 = { sequence: 1, reason: 'start', atTick: 0, rate: .25 };
  const event2 = { sequence: 2, reason: 'rate-change', atTick: 95, rate: .5 };
  const event3 = { sequence: 3, reason: 'seek', atTick: 94, rate: .5 };
  const event4 = { sequence: 4, reason: 'rate-change', atTick: 94, rate: 1 };
  const laterPhysical = { id: `run-${seed}`, ...reference.descriptor(), presentation: { atTick: 250, history: [event1, event2], clock: { rate: .5 } } };
  const rewindController = new Controller(core, cfg, provenance, seed); rewindController.seek(94);
  const rewind = { id: `run-${seed}`, ...rewindController.descriptor(), presentation: { atTick: 94, history: [event1, event2, event3, event4], clock: { rate: 1 } } };
  const first = mergeObservation(undefined, laterPhysical); const firstBefore = structuredClone(first), rewindBefore = structuredClone(rewind);
  const merged = mergeObservation(first, rewind);
  assert.equal(merged.tick, 250); assert.deepEqual(merged.state, referenceFrames[250]);
  assert.equal(merged.presentation.atTick, 94); assert.deepEqual(merged.presentation.history, [event1, event2, event3, event4]);
  assert.deepEqual(merged.inspectedTicks, [250, 94]); assert.deepEqual(first, firstBefore); assert.deepEqual(rewind, rewindBefore);
  const event5 = { sequence: 5, reason: 'completed', atTick: terminal.tick, rate: .25 };
  const complete = { id: `run-${seed}`, ...descriptor, presentation: { atTick: terminal.tick, history: [...merged.presentation.history, event5], clock: { rate: .25 } } };
  const advanced = mergeObservation(merged, complete); assert.equal(advanced.tick, terminal.tick); assert.deepEqual(advanced.state, terminal);
  const saved = JSON.parse(JSON.stringify({ schema: 'r4d.p2.checkpoint.v1', observations: [advanced] }));
  assert.deepEqual(saved.observations[0].presentation.history.map(event => event.rate), [.25, .5, .5, 1, .25]);
  assert.deepEqual(saved.observations[0].config, cfg); assert.deepEqual(saved.observations[0].provenance, provenance);
  assert.deepEqual(cfg, configBefore); assert.deepEqual(withoutPresentation(advanced).state, terminal);
  mergeCases.push({ seed, rewindMerged: merged, laterCheckpointMerged: advanced, JSONRoundtripPreservesHistory: true });
}
for (const file of records) assert.equal(sha(read(file.path)), file.sha256);
assert.equal(sha(readFileSync(baselineEvidence)), '0a34ca7223d7b85fa9150ab94600592f4edc83d8d68fd78ce12bfdfcfaa85a41');
const resources = JSON.parse(readFileSync(resourcePath));
const evidence = { schema: 'r4d.p2.technical-qa.offline.v3', recordedAtUtc: new Date().toISOString(), candidate: manifest.candidate, buildCommit, implementationCommit, manifestSha256: sha(manifestBytes), treeSha256: manifest.treeSha256, files: records, unchangedFrom03: unchanged, implementationBlobs, emissionsVerified: manifest.moduleEmissions, moduleGraph: { modules: [...modules.keys()], allLinkedWithoutEvaluation: true, refs }, privacy, defaultRateSourceBindingVerified: true, oracle: { representation: 'Independent BigInt 1/16-ms cumulative-credit ledger with separately spent tick count', cases: oracleCases, invalidCases }, rateWindows, mixedRuns, mergeCases, resources, browserExecuted: false, actualWallTimingVerified: false, actualDOMDownloadVerified: false, AndroidPass: false, artPass: false, fullTechnicalPass: false, limitations: ['Candidate04 has no published authorized target; published route is still candidate03', 'Source wiring and Node model do not execute DOM, Pixi rendering, visibility events or actual wall timing', 'No gesture/size/height/occlusion changes; four-object coverage retained', 'No IN_BUCKET in the two mixed terminal paths'] };
writeFileSync(path.join(output, 'EVIDENCE.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify({ candidate: evidence.candidate, manifestSha256: evidence.manifestSha256, treeSha256: evidence.treeSha256, fileCount: files.length, bytes: manifest.totalBytes, linkedJS: modules.size, privacyTextFiles: privacy.length, clockOracleScenarios: oracleCases.length, oracleActions: oracleCases.reduce((n, c) => n + c.trace.length, 0), invalidInputCases: invalidCases.length, rateWindows: rateWindows.length, mixedRuns: mixedRuns.map(run => ({ seed: run.seed, terminalTick: run.terminalTick, result: run.result.kind, syntheticFrames: run.syntheticDeltaFrames })), mergeScenarios: mergeCases.length, evidencePath: path.join(output, 'EVIDENCE.json'), fullTechnicalPass: false, browserExecuted: false }, null, 2));
