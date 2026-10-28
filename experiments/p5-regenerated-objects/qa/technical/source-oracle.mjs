// Independent P5 source/native preparation. No consumer code or private core source is published here.
// Run from this role's checkout: node <this-file> <new-run-name>
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ownRepo = 'E:/R4D/perspective/p5-worktrees/technical-qa';
const runtime = 'E:/R4D/perspective/p5-runtime/technical-qa';
const nativeRepo = 'D:/dev/millionko';
const coreCommit = '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023';
const coreTree = '008d16a80a26bb77d562a45218b01da09b0d9ff0';
const p1Commit = '4b47db04c7140ebf88f69b91faa0b790d46f22ec';
const p1Prefix = 'experiments/p1-collider-mapping/clean-repeat-01/';
const sourceImage = 'K:/Agents/R4D/Assets/perspective/01-jungle.jpg';
const imageHash = 'c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72';
const runName = process.argv[2];
assert.match(runName ?? '', /^source-oracle-\d{3}$/);
const runRoot = path.join(runtime, runName);
assert(!existsSync(runRoot), 'Evidence runs are append-only; choose a new run name.');
const git = (repo, ...args) => execFileSync('git', ['--no-optional-locks', '-C', repo, ...args], { maxBuffer: 16 * 1024 * 1024 });
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const gitHash = (kind, bytes) => createHash('sha1').update(`${kind} ${bytes.length}\0`).update(bytes).digest('hex');
const write = (relative, bytes) => {
  const target = path.resolve(runRoot, relative);
  assert(target.startsWith(path.resolve(runRoot) + path.sep));
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, bytes);
  return target;
};
const json = (relative, value) => write(relative, JSON.stringify(value, null, 2) + '\n');

function resourceGuard() {
  const script = `$os=Get-CimInstance Win32_OperatingSystem; $cpu=Get-CimInstance Win32_Processor; $p=Get-Process; [pscustomobject]@{utc=(Get-Date).ToUniversalTime().ToString('o'); freeRamGiB=$os.FreePhysicalMemory/1MB; totalRamGiB=$os.TotalVisibleMemorySize/1MB; cpuPercent=($cpu|Measure-Object LoadPercentage -Average).Average; processCount=$p.Count; aggregateWorkingSetGiB=($p|Measure-Object WorkingSet64 -Sum).Sum/1GB; disks=@(Get-PSDrive -Name C,D,E | ForEach-Object {[pscustomobject]@{name=$_.Name; freeGiB=$_.Free/1GB}})}|ConvertTo-Json -Depth 4 -Compress`;
  return JSON.parse(execFileSync('pwsh', ['-NoProfile', '-Command', script], { encoding: 'utf8' }));
}
const guard = resourceGuard();
const peakEstimate = { ramGiB: 0.5, eGiB: 0.05, concurrentAllowanceRamGiB: 4, concurrentAllowanceEGiB: 2 };
const eFree = guard.disks.find(d => d.name === 'E').freeGiB;
if (eFree <= 2) throw new Error('CHECKPOINT_STOP: E <= 2 GiB, no materialization.');
if (eFree <= 4) throw new Error('RESOURCE_WARN_DIAGNOSE: E <= 4 GiB, return to Lead before materialization.');
assert(guard.freeRamGiB > peakEstimate.ramGiB + peakEstimate.concurrentAllowanceRamGiB, 'Insufficient free RAM after concurrent allowance.');
assert(eFree > peakEstimate.eGiB + peakEstimate.concurrentAllowanceEGiB, 'Insufficient E allowance.');
mkdirSync(runRoot);
json('resource-before.json', { ...guard, peakEstimate });

const pins = [
  ['simulation/boards/01/trial-01/config.json', 9503, 'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db'],
  ['simulation/boards/01/trial-01/manifest.json', 11565, '7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18'],
  ['simulation/projection.mjs', 614, 'b59a0c1e6c34b417d253178457ef3580b8bea0aa89c989d1342f9376e19b9431'],
  ['viewer/src/view-math.mjs', 3050, '96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e'],
];
const commonFiles = pins.map(([relative, bytes, hash]) => {
  const buffer = git(ownRepo, 'show', `${p1Commit}:${p1Prefix}${relative}`);
  assert.equal(buffer.length, bytes, relative);
  assert.equal(sha256(buffer), hash, relative);
  write(`common/${relative}`, buffer);
  return { path: p1Prefix + relative, bytes, sha256: hash };
});

const imageBytes = readFileSync(sourceImage);
assert.equal(sha256(imageBytes), imageHash);
// Read JPEG SOF dimensions without creating a copy or altering the reference.
assert.equal(imageBytes.readUInt16BE(0), 0xffd8);
let imageDimensions;
for (let offset = 2; offset < imageBytes.length;) {
  assert.equal(imageBytes[offset++], 0xff);
  while (imageBytes[offset] === 0xff) offset++;
  const marker = imageBytes[offset++];
  if (marker === 0xd9 || marker === 0xda) break;
  const length = imageBytes.readUInt16BE(offset);
  if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
    imageDimensions = { width: imageBytes.readUInt16BE(offset + 5), height: imageBytes.readUInt16BE(offset + 3) };
    break;
  }
  offset += length;
}
assert.deepEqual(imageDimensions, { width: 1536, height: 1536 });

assert.equal(git(nativeRepo, 'rev-parse', `${coreCommit}:packages/sim-core`).toString().trim(), coreTree);
const treeText = git(nativeRepo, 'ls-tree', '-r', '-z', `${coreCommit}:packages/sim-core`).toString();
const nativeFiles = treeText.split('\0').filter(Boolean).map(entry => {
  const [, mode, blob, relative] = /^(\d+) blob ([0-9a-f]{40})\t(.+)$/.exec(entry) ?? [];
  assert(mode && blob && relative, 'Unexpected native tree entry.');
  const buffer = git(nativeRepo, 'show', `${coreCommit}:packages/sim-core/${relative}`);
  assert.equal(gitHash('blob', buffer), blob, relative);
  const file = write(`private/native-exact/${relative}`, buffer);
  assert.equal(gitHash('blob', readFileSync(file)), blob, relative);
  return { path: relative, mode, blob, bytes: buffer.length, sha256: sha256(buffer) };
});
// Independently reconstruct the complete exported Git tree, including names and modes.
function reconstructTree(files, prefix = '') {
  const entries = new Map();
  for (const file of files) {
    const remaining = file.path.slice(prefix.length);
    const slash = remaining.indexOf('/');
    const name = slash < 0 ? remaining : remaining.slice(0, slash);
    if (slash < 0) entries.set(name, { name, mode: file.mode.replace(/^0+/, ''), hash: file.blob, directory: false });
    else entries.set(name, { name, mode: '40000', directory: true });
  }
  const sorted = [...entries.values()].sort((a, b) => Buffer.compare(Buffer.from(a.name + (a.directory ? '/' : '')), Buffer.from(b.name + (b.directory ? '/' : ''))));
  const encoded = sorted.map(entry => {
    const hash = entry.directory ? reconstructTree(files.filter(f => f.path.startsWith(prefix + entry.name + '/')), prefix + entry.name + '/') : entry.hash;
    return Buffer.concat([Buffer.from(`${entry.mode} ${entry.name}\0`), Buffer.from(hash, 'hex')]);
  });
  return gitHash('tree', Buffer.concat(encoded));
}
assert.equal(reconstructTree(nativeFiles), coreTree);
json('private/native-file-inventory.json', nativeFiles);

const compilerPath = 'D:/dev/millionko/node_modules/typescript/lib/typescript.js';
const require = createRequire(import.meta.url);
const ts = require(compilerPath);
const compiler = { version: ts.version, path: compilerPath, sha256: sha256(readFileSync(compilerPath)), node: process.version };
const compiledFiles = [];
write('private/native-js/package.json', '{"type":"module"}\n');
for (const file of nativeFiles.filter(f => f.path.startsWith('src/') && f.path.endsWith('.ts'))) {
  const result = ts.transpileModule(readFileSync(path.join(runRoot, 'private/native-exact', file.path), 'utf8'), {
    fileName: file.path,
    reportDiagnostics: true,
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022, sourceMap: false, declaration: false },
  });
  assert.equal(result.diagnostics?.filter(d => d.category === ts.DiagnosticCategory.Error).length ?? 0, 0, file.path);
  const relative = file.path.replace(/\.ts$/, '.js');
  const output = Buffer.from(result.outputText);
  write(`private/native-js/${relative}`, output);
  compiledFiles.push({ path: relative, bytes: output.length, sha256: sha256(output) });
}
json('private/native-compiled-inventory.json', { compiler, files: compiledFiles });

const commonRoot = path.join(runRoot, 'common');
const config = JSON.parse(readFileSync(path.join(commonRoot, pins[0][0]), 'utf8'));
const manifest = JSON.parse(readFileSync(path.join(commonRoot, pins[1][0]), 'utf8'));
const projection = await import(pathToFileURL(path.join(commonRoot, pins[2][0])));
const viewMath = await import(pathToFileURL(path.join(commonRoot, pins[3][0])));
const native = await import(pathToFileURL(path.join(runRoot, 'private/native-js/src/index.js')));
assert.deepEqual(native.validateConfig(config), []);
assert.deepEqual([config.board.pins.length, config.board.segments.length, config.board.buckets.length, config.board.drops.length], [25, 16, 4, 1]);
assert.deepEqual(config.defaults, { tickMs: 5, quantizeDigits: 7 });
assert.deepEqual(config.physics, { gravityY: 980, maxBallSpeed: 2000, angleDeviationDeg: 2, bounceDeviation: 0.02, wallBounce: 1 });
assert.equal(config.board.ball.r, 16);
assert.deepEqual(config.rng, { algo: 'lcg32', seed: 0 });
assert.equal(manifest.coreCommit, coreCommit);
assert.equal(manifest.config.canonicalLfUtf8Sha256, commonFiles[0].sha256);
assert.deepEqual(manifest.translation.offset, [33256, 34072]);

const forward = manifest.projection.nativeToSource;
const inverse = manifest.projection.sourceToNative;
const points = [];
for (const p of [...config.board.pins, ...config.board.buckets]) {
  points.push([p.x, p.y]);
  for (let i = 0; i < 64; i++) points.push([p.x + p.r * Math.cos(i * Math.PI / 32), p.y + p.r * Math.sin(i * Math.PI / 32)]);
}
points.push(...config.board.drops.map(p => [p.x, p.y]));
for (const s of config.board.segments) points.push([s.x1, s.y1], [s.x2, s.y2]);
points.push(...manifest.projection.wholeSourceNativePolygon);
let maxRoundTripNative = 0, maxApiDifferenceSourcePx = 0, minDenominator = Infinity;
for (const p of points) {
  const source = projection.project(forward, p);
  const returned = projection.project(inverse, source);
  const viaView = viewMath.transform(forward, { x: p[0], y: p[1] });
  assert(source.every(Number.isFinite) && returned.every(Number.isFinite));
  maxRoundTripNative = Math.max(maxRoundTripNative, Math.hypot(returned[0] - p[0], returned[1] - p[1]));
  maxApiDifferenceSourcePx = Math.max(maxApiDifferenceSourcePx, Math.hypot(source[0] - viaView.x, source[1] - viaView.y));
  minDenominator = Math.min(minDenominator, forward[2][0] * p[0] + forward[2][1] * p[1] + forward[2][2]);
}
const cornerErrors = manifest.projection.wholeSourceNativePolygon.map((p, i) => {
  const source = projection.project(forward, p), expected = manifest.projection.sourceImageQuadPx[i];
  return Math.hypot(source[0] - expected[0], source[1] - expected[1]);
});
assert(maxRoundTripNative < 1e-7 && maxApiDifferenceSourcePx < 1e-9 && Math.max(...cornerErrors) < 1e-7 && minDenominator > 0);
const ballFootprints = [config.board.drops[0], ...config.board.pins, ...config.board.buckets].map(p => {
  const samples = Array.from({ length: 128 }, (_, i) => projection.project(forward, [p.x + 16 * Math.cos(i * Math.PI / 64), p.y + 16 * Math.sin(i * Math.PI / 64)]));
  const bounds = projection.bounds(samples);
  return { id: p.id, sourceCenter: projection.project(forward, [p.x, p.y]), widthPx: bounds.maxX - bounds.minX, heightPx: bounds.maxY - bounds.minY };
});
json('projection-oracle.json', { sampleCount: points.length, maxRoundTripNative, maxApiDifferenceSourcePx, cornerErrors, minDenominator, ballFootprints, note: 'Projected ground-circle footprint, not a claim about the visible sphere silhouette or artwork.' });

// Fixed upfront seeds: default plus 1,2,3. This is source-oracle sampling, not consumer/UI seed coverage.
const seeds = [0, 1, 2, 3];
const baselineConfigText = JSON.stringify(config);
function execute(seed, observe = true) {
  const cfg = structuredClone(config);
  cfg.rng.seed = seed;
  const events = [];
  let session;
  session = native.createSimRunSession(cfg, { dropId: 'board01-start', onEvent: observe ? event => events.push({ ...event, callbackStateTick: session?.state.tick ?? null }) : undefined });
  const initialWorld = JSON.stringify(session.world.cfg);
  const states = [structuredClone(session.state)];
  const maxTicks = Math.ceil(config.board.timeSecMax * 1000 / config.defaults.tickMs);
  while (!session.finished && session.state.tick < maxTicks) {
    native.stepSimRunSession(session);
    states.push(structuredClone(session.state));
  }
  if (!session.finished) {
    native.timeoutSimRunSession(session);
    states[states.length - 1] = structuredClone(session.state);
  }
  assert.equal(JSON.stringify(session.world.cfg), initialWorld, 'Native run changed config.');
  assert.deepEqual(session.world.drops.map(d => [d.id, d.x, d.y, d.angleDeg, d.speed]), config.board.drops.map(d => [d.id, d.x, d.y, d.angleDeg, d.speed]));
  const traceText = states.map(state => JSON.stringify(state)).join('\n') + '\n';
  return { states, events, traceText, traceSha256: sha256(traceText), result: session.state.result, ticks: session.state.tick };
}
const seedResults = [];
for (const seed of seeds) {
  const first = execute(seed), replay = execute(seed);
  assert.equal(first.traceSha256, replay.traceSha256, `Replay seed ${seed}`);
  assert.deepEqual(first.events, replay.events);
  write(`private/seed-${seed}/states.ndjson`, first.traceText);
  json(`private/seed-${seed}/events.json`, first.events);
  const hits = first.events.filter(e => e.type === 'object_hit');
  const contactWindows = hits.filter(e => ['pin', 'segment'].includes(e.objectKind)).map(e => ({
    event: e,
    before: first.states[e.tick],
    after: first.states[e.tick + 1],
    following: first.states[e.tick + 2] ?? null,
  }));
  json(`private/seed-${seed}/contact-windows.json`, contactWindows);
  const bucket = first.result.kind === 'IN_BUCKET' ? config.board.buckets.find(b => b.id === first.result.bucketId) : null;
  const bucketEntry = bucket ? {
    bucketId: bucket.id, radius: bucket.r,
    previousDistance: Math.hypot(first.states.at(-2).ball.pos.x - bucket.x, first.states.at(-2).ball.pos.y - bucket.y),
    finalDistance: Math.hypot(first.states.at(-1).ball.pos.x - bucket.x, first.states.at(-1).ball.pos.y - bucket.y),
  } : null;
  if (bucketEntry) assert(bucketEntry.finalDistance < bucket.r && bucketEntry.previousDistance >= bucket.r);
  seedResults.push({ seed, dropId: 'board01-start', ticks: first.ticks, result: first.result, traceSha256: first.traceSha256, replayIdentical: true,
    contactCount: hits.filter(e => ['pin', 'segment'].includes(e.objectKind)).length,
    contacts: hits.map(e => ({ eventTick: e.tick, postStepStateTick: e.objectKind === 'bucket' ? e.tick : e.tick + 1, kind: e.objectKind, id: e.objectId })), bucketEntry });
}
// One focused harness check, not a repeated broad matrix.
const observed = execute(0), unobserved = execute(0, false);
assert.equal(observed.traceSha256, unobserved.traceSha256, 'Read-only event observation changed native states.');
assert.deepEqual(native.runUntilDone(structuredClone(config), { dropId: 'board01-start' }), { result: observed.result, ticks: observed.ticks, pluginState: undefined });
assert.equal(JSON.stringify(config), baselineConfigText);
assert.equal(new Set(seedResults.map(r => r.traceSha256)).size, seeds.length, 'Seeds did not produce distinct complete states.');
// Also compare positions alone: distinct RNG fields must not fake path diversity.
const paths = seeds.map(seed => executePathHash(seed));
function executePathHash(seed) {
  const text = readFileSync(path.join(runRoot, `private/seed-${seed}/states.ndjson`), 'utf8');
  return sha256(text.trimEnd().split('\n').map(line => JSON.stringify(JSON.parse(line).ball.pos)).join('\n'));
}
assert.equal(new Set(paths).size, seeds.length, 'Ordinary seed oracle paths are identical.');
const firstRngAdvance = observed.states.findIndex((s, i, arr) => i > 0 && s.rngU32 !== arr[i - 1].rngU32);
const summary = {
  schema: 'r4d.p5.technical-source-oracle.v1', createdUtc: new Date().toISOString(), scope: 'Exact common input + independently materialized native + numeric projection; no P5 consumer/browser/art PASS',
  sourceImage: { path: sourceImage, sha256: imageHash, bytes: imageBytes.length, ...imageDimensions },
  p1Commit, commonFiles, coreCommit, coreTree, verifiedNativeFiles: nativeFiles.length, compiler,
  settings: { defaults: config.defaults, physics: config.physics, ball: config.board.ball, rng: config.rng, drop: config.board.drops[0] },
  projection: { sampleCount: points.length, maxRoundTripNative, maxApiDifferenceSourcePx, maxCornerErrorSourcePx: Math.max(...cornerErrors), minDenominator },
  seeds: seedResults.map((r, i) => ({ ...r, positionTraceSha256: paths[i] })),
  nativeSemantics: { firstRngAdvanceStateTickForSeed0: firstRngAdvance, collisionEventTick: 'pre-increment: event tick t maps to post-step state t+1', bucketEventTick: 'post-increment state tick', timeout: 'stepSimRunSession does not enforce max duration; consumer must bound ticks and invoke timeoutSimRunSession', bucket: 'strict center distance < bucket.r; ball radius is not subtracted' },
  observerInvariantSeed0: true, nativeRunUntilDoneAgreementSeed0: true,
  unverified: ['P5 consumer commit/dep pins', 'generated asset manifest/anchors/alpha/scale', 'actual browser movement and ordinary UI seeds', 'pause/step/Art/Geometry/view/replay actions', 'visible contacts/side bounces/empty-air bounces/partial occlusion', 'receiver artwork and draw order', 'frozen build/privacy/release'],
};
json('source-oracle-summary.json', summary);
const after = resourceGuard();
json('resource-after.json', { ...after, nodeMaxRSSMiB: process.resourceUsage().maxRSS / 1024, bytesWritten: nativeFiles.reduce((n, f) => n + f.bytes, 0) + compiledFiles.reduce((n, f) => n + f.bytes, 0) });
const evidenceFiles = ['source-oracle-summary.json', 'projection-oracle.json', 'resource-before.json', 'resource-after.json', 'private/native-file-inventory.json', 'private/native-compiled-inventory.json'];
json('evidence-index.json', evidenceFiles.map(relative => { const bytes = readFileSync(path.join(runRoot, relative)); return { path: relative, bytes: bytes.length, sha256: sha256(bytes) }; }));
console.log(JSON.stringify({ runRoot, summarySha256: sha256(readFileSync(path.join(runRoot, 'source-oracle-summary.json'))), seeds: seedResults.map(({ seed, ticks, result, traceSha256, contactCount }) => ({ seed, ticks, result, traceSha256, contactCount })), projection: summary.projection, nativeFiles: nativeFiles.length, compiler: compiler.version, maxRSSMiB: process.resourceUsage().maxRSS / 1024, guard, after }, null, 2));
