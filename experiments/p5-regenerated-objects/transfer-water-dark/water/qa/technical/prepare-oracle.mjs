// Independent QA only. Imports the previously verified own private native runtime.
// node <this-file> water|dark input-oracle-NNN
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const [boardName, runName] = process.argv.slice(2);
assert(['water', 'dark'].includes(boardName));
assert.match(runName ?? '', /^input-oracle-\d{3}$/);
const roleRuntime = 'E:/R4D/perspective/p5-runtime/technical-qa';
const root = path.join(roleRuntime, 'transfer-water-dark', boardName, runName);
assert(!existsSync(root), 'Append-only evidence: choose a new run name.');
const hash = b => createHash('sha256').update(b).digest('hex');
const commonPath = 'E:/R4D/perspective/coordination/p4-p5-transfer-common-inputs-2026-10-29.json';
const commonBytes = readFileSync(commonPath), common = JSON.parse(commonBytes);
assert.equal(common.canonicalRevision, 'b1382dd4c230815a019e52e2ec4617ef705661d5');
assert.equal(common.acceptedP1Revision, '4b47db04c7140ebf88f69b91faa0b790d46f22ec');
assert.equal(common.native.sourceCommit, '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023');
assert.equal(common.native.packageTree, '008d16a80a26bb77d562a45218b01da09b0d9ff0');
const board = common.boards.find(b => b.name.toLowerCase() === boardName);
assert.equal(board.activeTrial, boardName === 'water' ? 'trial-02' : 'trial-01');
const guard = () => JSON.parse(execFileSync('pwsh', ['-NoProfile', '-Command', `$o=Get-CimInstance Win32_OperatingSystem; $p=Get-Process; [pscustomobject]@{utc=(Get-Date).ToUniversalTime().ToString('o');computer=$env:COMPUTERNAME;freeRamGiB=$o.FreePhysicalMemory/1MB;totalRamGiB=$o.TotalVisibleMemorySize/1MB;cpuPercent=(Get-CimInstance Win32_Processor|Measure-Object LoadPercentage -Average).Average;aggregateWorkingSetGiB=($p|Measure-Object WorkingSet64 -Sum).Sum/1GB;processCount=$p.Count;disks=@(Get-PSDrive C,D,E|ForEach-Object{[pscustomobject]@{name=$_.Name;freeGiB=$_.Free/1GB}})}|ConvertTo-Json -Depth 4 -Compress`], { encoding: 'utf8' }));
const before = guard(), estimate = { ramGiB: 0.25, eGiB: 0.03, allowanceRamGiB: 4, allowanceEGiB: 2 };
assert.equal(before.computer, 'WIN-36E9FF9EJM0');
const freeE = before.disks.find(d => d.name === 'E').freeGiB;
assert(freeE > 4, freeE <= 2 ? 'CHECKPOINT_STOP E<=2GiB' : 'WARN/DIAGNOSE E<=4GiB');
assert(before.freeRamGiB > estimate.ramGiB + estimate.allowanceRamGiB);
assert(freeE > estimate.eGiB + estimate.allowanceEGiB);
const write = (rel, bytes) => { const p = path.resolve(root, rel); assert(p.startsWith(path.resolve(root) + path.sep)); mkdirSync(path.dirname(p), { recursive: true }); writeFileSync(p, bytes); };
const json = (rel, value) => write(rel, JSON.stringify(value, null, 2) + '\n');
mkdirSync(root, { recursive: true });
json('resource-before.json', { ...before, estimate });
json('declaration.json', { board: boardName, seeds: [0, 1, 2, 3], runsPerSeed: 'first + exact replay', maxSeconds: 16, createdUtc: new Date().toISOString(), seedSelection: 'declared upfront; no rejection or win search' });
mkdirSync(path.join(root, 'tmp'));
process.env.TEMP = process.env.TMP = path.join(root, 'tmp');
try {
  const git = (...args) => execFileSync('git', ['--no-optional-locks', '-C', common.readOnlyGitObjectSource, ...args], { maxBuffer: 1024 * 1024 });
  const pins = [];
  for (const [type, source, size, sha] of [
    ['config', board.configPath, board.configBytes, board.configSha256],
    ['manifest', board.manifestPath, board.manifestBytes, board.manifestSha256],
    ['view-math', common.commonViewMath.path, common.commonViewMath.bytes, common.commonViewMath.sha256],
  ]) {
    const b = git('show', `${common.acceptedP1Revision}:${source}`);
    assert.equal(b.length, size, source); assert.equal(hash(b), sha, source);
    const rel = `common/${type}.${type === 'view-math' ? 'mjs' : 'json'}`; write(rel, b);
    pins.push({ source, path: rel, bytes: size, sha256: sha });
  }
  write('common/transfer-inputs.json', commonBytes);
  const image = readFileSync(board.image); assert.equal(image.length, board.imageBytes); assert.equal(hash(image), board.imageSha256);
  assert.equal(image.readUInt16BE(0), 0xffd8);
  let dimensions;
  for (let i = 2; i < image.length;) {
    assert.equal(image[i++], 0xff); while (image[i] === 0xff) i++;
    const marker = image[i++]; if (marker === 0xd9 || marker === 0xda) break;
    const len = image.readUInt16BE(i);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) { dimensions = { width: image.readUInt16BE(i + 5), height: image.readUInt16BE(i + 3) }; break; }
    i += len;
  }
  assert.deepEqual(dimensions, { width: 1536, height: 1536 });
  const config = JSON.parse(readFileSync(path.join(root, 'common/config.json'))), manifest = JSON.parse(readFileSync(path.join(root, 'common/manifest.json')));
  assert.equal(manifest.coreCommit, common.native.sourceCommit);
  assert.equal(manifest.config.canonicalLfUtf8Sha256, board.configSha256);
  assert.equal(manifest.source.sha256, board.imageSha256);
  assert.deepEqual(config.defaults, { tickMs: 5, quantizeDigits: 7 });
  assert.deepEqual(config.physics, { gravityY: 980, maxBallSpeed: 2000, angleDeviationDeg: 2, bounceDeviation: 0.02, wallBounce: 1 });
  assert.deepEqual(config.rng, { algo: 'lcg32', seed: 0 }); assert.equal(config.board.ball.r, 16);
  assert.equal(config.board.timeSecMax, 16); assert.equal(config.board.drops.length, 1);
  const cached = path.join(roleRuntime, 'source-oracle-001/private');
  const inventoryBytes = readFileSync(path.join(cached, 'native-compiled-inventory.json')), inventory = JSON.parse(inventoryBytes);
  // Verify cached executable bytes only. Do not export sources or recompile.
  for (const f of inventory.files) { const b = readFileSync(path.join(cached, 'native-js', f.path)); assert.equal(b.length, f.bytes); assert.equal(hash(b), f.sha256, f.path); }
  const native = await import(pathToFileURL(path.join(cached, 'native-js/src/index.js')));
  const validationErrors = native.validateConfig(config); json('validation.json', validationErrors); assert.deepEqual(validationErrors, []);
  const view = await import(pathToFileURL(path.join(root, 'common/view-math.mjs')));
  const project = (m, p) => { const d = m[2][0] * p[0] + m[2][1] * p[1] + m[2][2]; assert(Math.abs(d) > 1e-12); return [(m[0][0] * p[0] + m[0][1] * p[1] + m[0][2]) / d, (m[1][0] * p[0] + m[1][1] * p[1] + m[1][2]) / d]; };
  const fwd = manifest.projection.nativeToSource, inv = manifest.projection.sourceToNative;
  const points = [...config.board.pins, ...config.board.buckets, ...config.board.drops].map(p => [p.x, p.y]);
  for (const s of config.board.segments) points.push([s.x1, s.y1], [s.x2, s.y2]);
  points.push(...manifest.projection.wholeSourceNativePolygon);
  let maxRoundTripNative = 0, maxViewDifferencePx = 0;
  for (const p of points) {
    const q = project(fwd, p), back = project(inv, q), api = view.transform(fwd, { x: p[0], y: p[1] });
    assert([...q, ...back, api.x, api.y].every(Number.isFinite));
    maxRoundTripNative = Math.max(maxRoundTripNative, Math.hypot(back[0] - p[0], back[1] - p[1]));
    maxViewDifferencePx = Math.max(maxViewDifferencePx, Math.hypot(api.x - q[0], api.y - q[1]));
  }
  const cornerErrors = manifest.projection.wholeSourceNativePolygon.map((p, i) => Math.hypot(...project(fwd, p).map((n, j) => n - manifest.projection.sourceImageQuadPx[i][j])));
  assert(maxRoundTripNative < 1e-7 && maxViewDifferencePx < 1e-9 && Math.max(...cornerErrors) < 1e-7);
  const actual = { drop: config.board.drops, pin: config.board.pins, segment: config.board.segments, bucket: config.board.buckets };
  const mapped = manifest.idMapping.flatMap(m => m.nativeIds.map(id => { const kind = m.nativeKind === 'segments' ? 'segment' : m.nativeKind; assert(actual[kind]?.some(o => o.id === id), `Missing mapping ${id}`); return `${kind}:${id}`; }));
  const expected = Object.entries(actual).flatMap(([k, a]) => a.map(o => `${k}:${o.id}`));
  assert.equal(new Set(mapped).size, mapped.length); assert.deepEqual([...mapped].sort(), expected.sort());
  const ballFootprints = [...config.board.drops, ...config.board.buckets].map(o => {
    const samples = Array.from({ length: 16 }, (_, i) => project(fwd, [o.x + 16 * Math.cos(i * Math.PI / 8), o.y + 16 * Math.sin(i * Math.PI / 8)]));
    return { id: o.id, sourceCenter: project(fwd, [o.x, o.y]), widthPx: Math.max(...samples.map(p => p[0])) - Math.min(...samples.map(p => p[0])), heightPx: Math.max(...samples.map(p => p[1])) - Math.min(...samples.map(p => p[1])) };
  });
  const projection = { sampleCount: points.length, maxRoundTripNative, maxViewDifferencePx, cornerErrors, mappedNativePrimitives: mapped.length, ballFootprints, scope: 'numeric ground projection and sampled ground-circle target footprints; not a visible sphere or mask check' };
  json('projection.json', projection);
  const baseline = JSON.stringify(config);
  function execute(seed) {
    const cfg = structuredClone(config); cfg.rng.seed = seed;
    const events = [], session = native.createSimRunSession(cfg, { dropId: cfg.board.drops[0].id, onEvent: e => events.push(structuredClone(e)) });
    const world = JSON.stringify(session.world.cfg), states = [structuredClone(session.state)];
    const maxTicks = Math.ceil(cfg.board.timeSecMax * 1000 / cfg.defaults.tickMs);
    while (!session.finished && session.state.tick < maxTicks) { native.stepSimRunSession(session); states.push(structuredClone(session.state)); }
    if (!session.finished) { native.timeoutSimRunSession(session); states[states.length - 1] = structuredClone(session.state); }
    assert.equal(JSON.stringify(session.world.cfg), world);
    assert.deepEqual(session.world.drops.map(d => [d.id, d.x, d.y, d.angleDeg, d.speed]), config.board.drops.map(d => [d.id, d.x, d.y, d.angleDeg, d.speed]));
    const trace = states.map(s => JSON.stringify(s)).join('\n') + '\n';
    return { states, events, trace, traceSha256: hash(trace), result: session.state.result };
  }
  const seeds = [];
  for (const seed of [0, 1, 2, 3]) {
    const first = execute(seed), replay = execute(seed);
    assert.equal(first.traceSha256, replay.traceSha256); assert.deepEqual(first.events, replay.events);
    write(`private/seed-${seed}/states.ndjson`, first.trace); json(`private/seed-${seed}/events.json`, first.events);
    const contacts = first.events.filter(e => e.type === 'object_hit' && ['pin', 'segment', 'wall'].includes(e.objectKind));
    json(`private/seed-${seed}/contact-windows.json`, contacts.map(e => ({ event: e, stateTicks: [e.tick, e.tick + 1, e.tick + 2], states: [first.states[e.tick], first.states[e.tick + 1], first.states[e.tick + 2] ?? null] })));
    const receiverApproaches = config.board.buckets.map(b => {
      let nearest = 0, distance = Infinity;
      first.states.forEach((s, i) => { const d = Math.hypot(s.ball.pos.x - b.x, s.ball.pos.y - b.y); if (d < distance) { distance = d; nearest = i; } });
      return { id: b.id, r: b.r, minCenterDistance: distance, stateTick: nearest, sourceCenter: project(fwd, [first.states[nearest].ball.pos.x, first.states[nearest].ball.pos.y]), stateTicks: [Math.max(0, nearest - 1), nearest, Math.min(first.states.length - 1, nearest + 1)], triggerReached: distance < b.r };
    });
    if (first.result.kind === 'IN_BUCKET') {
      const b = config.board.buckets.find(b => b.id === first.result.bucketId);
      const d = s => Math.hypot(s.ball.pos.x - b.x, s.ball.pos.y - b.y);
      assert(d(first.states.at(-1)) < b.r && d(first.states.at(-2)) >= b.r);
    }
    const positionTraceSha256 = hash(first.states.map(s => JSON.stringify(s.ball.pos)).join('\n'));
    seeds.push({ seed, ticks: first.states.at(-1).tick, result: first.result, traceSha256: first.traceSha256, positionTraceSha256, replayIdentical: true, initialState: first.states[0], firstRngChangeTick: first.states.findIndex((s, i, a) => i > 0 && s.rngU32 !== a[i - 1].rngU32), contacts: contacts.map(e => ({ id: e.objectId, kind: e.objectKind, eventTick: e.tick, postStepStateTick: e.tick + 1 })), receiverApproaches });
  }
  assert.equal(new Set(seeds.map(s => s.positionTraceSha256)).size, 4); assert.equal(JSON.stringify(config), baseline);
  const summary = { schema: 'r4d.p5.transfer.technical-input-oracle.v1', createdUtc: new Date().toISOString(), board: boardName, trial: board.activeTrial, scope: 'input + genuine native runs + numeric mapping only; visual/browser/art unverified', canonicalRevision: common.canonicalRevision, acceptedP1Revision: common.acceptedP1Revision, commonInputs: { path: commonPath, bytes: commonBytes.length, sha256: hash(commonBytes) }, pins, sourceImage: { path: board.image, bytes: image.length, sha256: hash(image), ...dimensions }, native: { ...common.native, cachedEntry: path.join(cached, 'native-js/src/index.js'), inventorySha256: hash(inventoryBytes), verifiedCachedRuntimeFiles: inventory.files.length, compiler: inventory.compiler }, settings: { defaults: config.defaults, physics: config.physics, ball: config.board.ball, rng: config.rng, drops: config.board.drops, timeSecMax: config.board.timeSecMax }, counts: manifest.config.counts, projection, seeds, semantics: { collisionTicks: 'preincrement event t -> poststep state t+1', bucketTrigger: 'strict center distance < bucket.r; no radius erosion, height or sink', timeout: 'explicit bounded stepping + native timeoutSimRunSession at timeSecMax', water: manifest.planeCollapse ?? null }, serverWrites: 0, tokenGranted: false };
  json('summary.json', summary);
  json('resource-after.json', { ...guard(), maxRSSMiB: process.resourceUsage().maxRSS / 1024 });
  const files = [];
  function collect(dir = '') { for (const entry of readdirSync(path.join(root, dir), { withFileTypes: true })) { const rel = path.posix.join(dir, entry.name); if (entry.isDirectory()) collect(rel); else { const b = readFileSync(path.join(root, rel)); files.push({ path: rel, bytes: b.length, sha256: hash(b) }); } } }
  collect(); json('evidence-index.json', files);
  console.log(JSON.stringify({ root, summarySha256: hash(readFileSync(path.join(root, 'summary.json'))), projection, seeds: seeds.map(s => ({ seed: s.seed, ticks: s.ticks, result: s.result, contactCount: s.contacts.length })), maxRSSMiB: process.resourceUsage().maxRSS / 1024 }, null, 2));
} catch (e) { json('FAILURE.json', { utc: new Date().toISOString(), message: e.message, stack: e.stack, classification: 'not yet diagnosed; all partial artifacts preserved' }); throw e; }
