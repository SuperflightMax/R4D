// Independent, bounded offline audit. Does not run Builder prepare/build/serve/selfcheck.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statfsSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { registerHooks } from 'node:module';
import { SourceTextModule } from 'node:vm';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const argument = name => process.argv[process.argv.indexOf(name) + 1];
assert.ok(process.argv.includes('--artifact') && process.argv.includes('--output'));
const artifact = path.resolve(argument('--artifact'));
const output = path.resolve(argument('--output'));
const runtimeRoot = 'E:/R4D/perspective/p2-runtime/';
for (const dir of [artifact, output]) assert.ok(dir.replaceAll('\\', '/').toLowerCase().startsWith(runtimeRoot.toLowerCase()));
assert.notEqual(artifact, output);
assert.ok(!output.startsWith(artifact + path.sep));
assert.ok(!existsSync(path.join(output, 'EVIDENCE.json')), 'Preserve prior evidence; choose a new output directory');
const repo = process.cwd();
const sourceCommit = '5f40f6692dc5e7238afc961a2e0afa826cdefc9b';
const coreCommit = '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023';
const p1 = '4b47db04c7140ebf88f69b91faa0b790d46f22ec:experiments/p1-collider-mapping/clean-repeat-01/';
const coreRoot = 'D:/dev/.codex-worktrees/r4d-p1-collider-mapping/millionko-source/lead';
const pixiRoot = 'D:/dev/.codex-worktrees/r4d-p1-clean-repeat-01/lead/experiments/p1-collider-mapping/clean-repeat-01/viewer/node_modules/pixi.js';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const lf = bytes => Buffer.from(bytes.toString('utf8').replaceAll('\r\n', '\n'));
const git = (args, cwd = repo) => execFileSync('git', args, { cwd, maxBuffer: 16 * 1024 * 1024 });
const source = relative => git(['show', `${sourceCommit}:experiments/p2-free-approach/builder/${relative}`]);
const treeFiles = (root, prefix = '') => readdirSync(root, { withFileTypes: true }).flatMap(entry => {
  assert.ok(!entry.isSymbolicLink(), `Unexpected symlink ${prefix + entry.name}`);
  return entry.isDirectory() ? treeFiles(path.join(root, entry.name), prefix + entry.name + '/') : [prefix + entry.name];
}).sort();
const disks = ['C:/', 'D:/', 'E:/'].map(drive => {
  const state = statfsSync(drive);
  return { drive, freeBytes: state.bavail * state.bsize, freeGiB: state.bavail * state.bsize / 2 ** 30 };
});
// Only small in-memory comparisons and <=8 MiB of E evidence are planned.
assert.ok(disks.every(d => d.freeGiB > 4), 'Reassess <=4 GiB under current disk policy');
const manifestBytes = readFileSync(path.join(artifact, 'BUILD_MANIFEST.json'));
assert.equal(hash(manifestBytes), '6cf78e7b64625828929cd5905afe033570579f8e2950c103c757d53016a49aa0');
const manifest = JSON.parse(manifestBytes);
assert.equal(manifest.sourceCommit, sourceCommit);
assert.equal(manifest.candidate, 'p2-jungle-static-candidate-02');
assert.equal(manifest.route, '/review/r4d/p2-free-approach/');
const root = path.join(artifact, 'bundle/review/r4d/p2-free-approach');
const read = file => readFileSync(path.join(root, file));
const text = file => read(file).toString('utf8');
const files = treeFiles(root);
assert.deepEqual(files, manifest.files.map(file => file.path));
const records = files.map(file => {
  assert.ok(!file.split('/').some(part => part === '..'));
  const bytes = read(file);
  return { path: file, bytes: bytes.length, sha256: hash(bytes), kind: file === 'runtime/sim-core.mjs' ? 'authorized-private-compiled-runtime' : 'public-scene-or-asset' };
});
assert.deepEqual(records, manifest.files);
assert.equal(records.length, 15);
assert.equal(records.reduce((sum, file) => sum + file.bytes, 0), 2448166);
assert.equal(hash(JSON.stringify(records) + '\n'), '5bc6fd3b7f99e20fe98e3f98d972371538beee767abebc905fa595af55205b4d');

const copied = ['index.html', 'style.css', 'src/main.mjs', 'src/controller.mjs', 'inputs/config.json', 'inputs/view-math.mjs'];
for (const file of copied) assert.ok(lf(read(file)).equals(lf(source(file))), `Source/build content differs: ${file}`);
assert.ok(read('inputs/config.json').equals(git(['show', p1 + 'simulation/boards/01/trial-01/config.json'])));
assert.ok(read('inputs/view-math.mjs').equals(git(['show', p1 + 'viewer/src/view-math.mjs'])));
const accepted = JSON.parse(text('inputs/manifest.json'));
const expectedAccepted = JSON.parse(git(['show', p1 + 'simulation/boards/01/trial-01/manifest.json']));
expectedAccepted.source = { sha256: manifest.sourceInputs.sourceSha256, width: 1536, height: 1536, readOnly: true, url: 'source/01-jungle.jpg' };
assert.deepEqual(accepted, expectedAccepted, 'Accepted manifest changed beyond source path sanitization');
const projectionBytes = git(['show', p1 + 'research/board01-projection.candidate-01.json']);
assert.equal(hash(lf(projectionBytes)), manifest.sourceInputs.projectionSha256);
const projection = JSON.parse(projectionBytes);
const config = JSON.parse(text('inputs/config.json'));
const metadata = JSON.parse(text('metadata.json'));
assert.equal(hash(read('inputs/config.json')), metadata.configSha256);
assert.equal(hash(read('source/01-jungle.jpg')), metadata.sourceSha256);
assert.equal(hash(read('runtime/sim-core.mjs')), metadata.compiledCoreSha256);
assert.equal(metadata.coreCommit, coreCommit);
assert.equal(metadata.sourceCommit, sourceCommit);
assert.equal(metadata.projectionSha256, hash(lf(projectionBytes)));
assert.equal(config.rng.algo, 'lcg32');
assert.deepEqual([config.board.pins.length, config.board.segments.length, config.board.buckets.length, config.board.drops.length], [25, 16, 4, 1]);
assert.deepEqual([config.board.ball.r, config.defaults.tickMs, config.physics.gravityY, config.physics.maxBallSpeed, config.physics.angleDeviationDeg, config.physics.bounceDeviation], [16, 5, 980, 2000, 2, .02]);
const art = JSON.parse(text('assets/manifest.json'));
const originalArtBytes = source('source-packets/jungle-art-v2/manifest.json');
const originalArt = JSON.parse(originalArtBytes);
assert.equal(art.provenance.sourcePacketSha256, hash(originalArtBytes));
assert.deepEqual(art.ball, originalArt.ball);
assert.deepEqual(art.shadow, originalArt.shadow);
assert.deepEqual(art.occluders, originalArt.occluders);
assert.equal(art.provenance.consumerGitBlob, git(['rev-parse', `${sourceCommit}:experiments/p2-free-approach/builder/src/main.mjs`]).toString().trim());
for (const asset of [art.ball, art.shadow]) {
  assert.equal(hash(read('assets/files/' + asset.file)), asset.sha256);
  assert.ok(read('assets/files/' + asset.file).equals(source('source-packets/jungle-art-v2/' + asset.file)));
}
const pixiPackage = JSON.parse(readFileSync(path.join(pixiRoot, 'package.json')));
assert.equal(pixiPackage.version, '8.22.0');
assert.equal(pixiPackage.license, 'MIT');
assert.ok(read('vendor/PIXI-LICENSE.txt').equals(readFileSync(path.join(pixiRoot, 'LICENSE'))));
const pixiExpected = readFileSync(path.join(pixiRoot, 'dist/pixi.min.mjs'), 'utf8').replace(/^\/\/[#@]\s*sourceMappingURL=.*$/gm, '');
assert.equal(text('vendor/pixi.mjs'), pixiExpected);

const main = text('src/main.mjs'), controllerText = text('src/controller.mjs'), html = text('index.html');
const route = new URL('https://offline.invalid/review/r4d/p2-free-approach/');
const references = [];
const addRef = (from, ref, kind) => {
  assert.ok(!/^(?:[a-z][\w+.-]*:|\/|\\)/i.test(ref), `Non-relative ${kind}: ${ref}`);
  const url = new URL(ref, new URL(from, route));
  assert.ok(url.href.startsWith(route.href));
  const file = decodeURIComponent(url.pathname.slice(route.pathname.length));
  assert.ok(files.includes(file), `Missing ${file}`);
  references.push({ from, ref, kind, target: file });
};
for (const match of html.matchAll(/(?:src|href)="([^"]+)"/g)) addRef('index.html', match[1], 'html');
const importMap = JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
for (const ref of Object.values(importMap)) addRef('index.html', ref, 'importmap');
for (const file of ['src/main.mjs', 'src/controller.mjs', 'inputs/view-math.mjs', 'runtime/sim-core.mjs', 'vendor/pixi.mjs']) {
  const parsedModule = new SourceTextModule(text(file), { identifier: file });
  for (const specifier of parsedModule.dependencySpecifiers) {
    if (specifier === 'pixi.js') assert.equal(importMap['pixi.js'], './vendor/pixi.mjs');
    else addRef(file, specifier, 'module');
  }
}
for (const match of main.matchAll(/resource\('([^']+)'\)/g)) addRef('index.html', match[1], 'resource');
for (const asset of [art.ball, art.shadow]) addRef('index.html', 'assets/files/' + asset.file, 'art');
addRef('index.html', accepted.source.url, 'source-metadata');
assert.ok(!/\b(?:XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b|method\s*:\s*['"](?:POST|PUT|PATCH|DELETE)['"]|\/api\//.test(main + controllerText + html));
assert.equal([...main.matchAll(/\bfetch\s*\(/g)].length, 1);
assert.ok(main.includes('await fetch(url)'));
assert.ok(main.includes('URL.createObjectURL(new Blob(') && main.includes('link.download = filename'));

const safetyFindings = [];
for (const file of files.filter(file => /\.(?:mjs|json|html|css|txt)$/.test(file))) {
  const content = text(file);
  for (const [name, pattern] of [
    ['source-map', /sourceMappingURL|sourceURL\s*=/i],
    ['private-source', /millionko-source|packages[\\/]sim-core[\\/]src/i],
    ['windows-literal', /(?:file:\/\/\/[A-Z]:[\\/]|["'`][A-Z]:[\\/][A-Za-z0-9_.-])/i],
    ['posix-local', /(?:["'`])\/(?:Users|home|mnt|tmp|private|var\/tmp)\//i],
  ]) if (pattern.test(content)) safetyFindings.push({ file, name });
}
assert.deepEqual(safetyFindings, []);
assert.ok(!files.some(file => /\.(?:ts|tsx|map|py|ps1|sh)$/.test(file)));
const oldScanner = /sourceMappingURL|millionko-source|packages[\\/]sim-core[\\/]src|[CDEK]:[\\/]/i;
const newScanner = /sourceMappingURL|millionko-source|packages[\\/]sim-core[\\/]src|(?:^|["'\s])[A-Z]:[\\/]/im;
const pixi = text('vendor/pixi.mjs');
const falsePositive = oldScanner.exec(pixi);
assert.ok(falsePositive && !newScanner.test(pixi));
const scannerControls = [
  ['quoted-windows', 'const p="E:/example-private/core.ts";'],
  ['template-windows', 'const p=`E:/example-private/core.ts`;'],
  ['file-url', '{"url":"file:///E:/example-private/core.ts"}'],
  ['private-source', 'packages/sim-core/src/Sim.ts'],
  ['source-map', '//# sourceMappingURL=core.mjs.map'],
].map(([name, sample]) => ({ name, oldDetected: oldScanner.test(sample), newDetected: newScanner.test(sample) }));

const { transform } = await import(pathToFileURL(path.join(root, 'inputs/view-math.mjs')).href);
const tolerance = 1e-7;
let maxProjectionError = 0;
for (const point of [...accepted.projection.wholeSourceNativePolygon, ...accepted.projection.playableFloorNativePolygon,
  ...config.board.pins.map(p => [p.x, p.y]), ...config.board.buckets.map(p => [p.x, p.y]), ...config.board.drops.map(p => [p.x, p.y])]) {
  const original = { x: point[0], y: point[1] };
  const image = transform(accepted.projection.nativeToSource, original);
  const back = transform(accepted.projection.sourceToNative, image);
  maxProjectionError = Math.max(maxProjectionError, Math.abs(back.x - original.x), Math.abs(back.y - original.y));
  const research = transform(projection.transform.forward, { x: original.x - 33256, y: original.y - 34072 });
  assert.ok(Math.max(Math.abs(image.x - research.x), Math.abs(image.y - research.y)) < tolerance);
}
assert.ok(maxProjectionError < tolerance);

assert.equal(git(['rev-parse', 'HEAD'], coreRoot).toString().trim(), coreCommit);
assert.equal(git(['rev-parse', `${coreCommit}:packages/sim-core`], coreRoot).toString().trim(), '008d16a80a26bb77d562a45218b01da09b0d9ff0');
assert.equal(git(['--no-optional-locks', 'status', '--porcelain=v1', '--', 'packages/sim-core'], coreRoot).length, 0);
const coreFiles = git(['ls-tree', '-r', '--name-only', coreCommit, '--', 'packages/sim-core/src'], coreRoot).toString().trim().split('\n');
for (const file of coreFiles) assert.ok(lf(readFileSync(path.join(coreRoot, file))).equals(lf(git(['show', `${coreCommit}:${file}`], coreRoot))), file);
const corePrefix = pathToFileURL(path.join(coreRoot, 'packages/sim-core/src') + path.sep).href;
// Reference source executes in memory with Node 24's type stripping; nothing is compiled to disk.
registerHooks({ resolve(specifier, context, nextResolve) {
  if (context.parentURL?.startsWith(corePrefix) && /^\.\.?\/.+\.js$/.test(specifier)) {
    return { url: new URL(specifier.replace(/\.js$/, '.ts'), context.parentURL).href, shortCircuit: true };
  }
  return nextResolve(specifier, context);
} });
const native = await import(pathToFileURL(path.join(coreRoot, 'packages/sim-core/src/index.ts')).href);
const compiled = await import(pathToFileURL(path.join(root, 'runtime/sim-core.mjs')).href);
const { Controller, randomSeed } = await import(pathToFileURL(path.join(root, 'src/controller.mjs')).href);
const seeds = [1, 2, 3, randomSeed(), randomSeed(), randomSeed()];
const provenance = { ...metadata, projection: accepted.projection, source: accepted.source };
const runs = [];
for (const [index, seed] of seeds.entries()) {
  const sim = new Controller(compiled, config, provenance, seed);
  const cfg = structuredClone(config); cfg.rng.seed = seed;
  const nativeEvents = [];
  const reference = native.createSimRunSession(cfg, { dropId: cfg.board.drops[0].id, onEvent: event => nativeEvents.push(structuredClone(event)) });
  assert.deepEqual(sim.snapshot(), reference.state);
  while (!sim.state.done && sim.state.tick < sim.maxTicks) {
    native.stepSimRunSession(reference);
    if (!reference.state.done && reference.state.tick >= sim.maxTicks) native.timeoutSimRunSession(reference);
    sim.advance(1);
    assert.deepEqual(sim.snapshot(), reference.state, `Compiled/native state differs seed=${seed} tick=${sim.state.tick}`);
  }
  assert.deepEqual(sim.events.map(({ observedAtTick, ...event }) => event), nativeEvents);
  const frames = structuredClone(sim.frames);
  const end = sim.snapshot();
  const contacts = structuredClone(sim.contacts);
  const descriptor = sim.descriptor();
  assert.deepEqual(descriptor.provenance, provenance);
  assert.equal(descriptor.seed, seed);
  assert.deepEqual(descriptor.config, config);
  const fullReplay = new Controller(compiled, descriptor.config, descriptor.provenance, descriptor.seed);
  fullReplay.advance(fullReplay.maxTicks);
  assert.deepEqual(fullReplay.snapshot(), end);
  assert.deepEqual(fullReplay.frames, frames);
  assert.deepEqual(fullReplay.events, sim.events);
  const chunked = new Controller(compiled, config, provenance, seed);
  while (!chunked.state.done) chunked.advance(10);
  assert.deepEqual(chunked.snapshot(), end);
  assert.deepEqual(chunked.frames, frames);
  const hitTick = contacts[0]?.observedAtTick;
  const inspected = [...new Set([0, 1, 94, 95, 96, end.tick, ...(hitTick ? [hitTick - 1, hitTick, hitTick + 1] : [])])].filter(tick => tick >= 0 && tick <= end.tick);
  for (const tick of inspected) {
    sim.seek(tick); assert.deepEqual(sim.snapshot(), frames[tick]);
    if (tick < end.tick) { sim.advance(1); assert.deepEqual(sim.snapshot(), frames[tick + 1]); }
  }
  sim.seek(end.tick);
  const before = sim.snapshot(); sim.advance(0); sim.advance(1); assert.deepEqual(sim.snapshot(), before);
  const detached = sim.snapshot(); detached.ball.pos.x = 0; assert.deepEqual(sim.snapshot(), before);
  runs.push({ seed, origin: index < 3 ? 'preselected 1/2/3, no selection by outcome' : 'three consecutive frozen randomSeed() calls in Node; UI not exercised', ticksCompared: frames.length, result: end.result, final: end, trajectorySha256: hash(JSON.stringify(frames)), contacts: contacts.length, firstContact: contacts[0], lastContact: contacts.at(-1), inspectedTicks: inspected, descriptor });
}
assert.ok(new Set(runs.map(run => run.trajectorySha256)).size > 1);
assert.deepEqual(JSON.parse(text('inputs/config.json')), config);
// Re-read immutable bytes after execution; no candidate edits are tolerated.
for (const record of records) assert.equal(hash(read(record.path)), record.sha256);
const report = {
  schema: 'r4d.p2.technical-qa.offline.v1', recordedAtUtc: new Date().toISOString(), independentQA: true,
  candidate: manifest.candidate, sourceCommit, manifestSha256: hash(manifestBytes), treeSha256: manifest.treeSha256,
  files: records, disks, expectedAdditionalDiskBytes: { C: 1.525 * 2 ** 30, D: 0, E: 8 * 1024 * 1024 }, diskBudgetNote: 'C retains the coordinated 1.525 GiB planning estimate; this runner writes only small E evidence and disables Node compile cache', references,
  evidenceScope: 'Exact frozen files plus direct compiled controller/native-core state execution; no UI/browser/HTTP/Pixi execution',
  provenance: { copiedSourceFiles: copied, coreSourceFilesVerified: coreFiles.length, compiledCoreSha256: metadata.compiledCoreSha256, coreTree: manifest.core.sourceTree, pixiVersion: pixiPackage.version, pixiPackageAndLicenseMatch: true, projectionTolerance: tolerance, maxProjectionRoundtripError: maxProjectionError },
  scanner: { falsePositiveMatch: falsePositive[0], context: pixi.slice(Math.max(0, falsePositive.index - 80), falsePositive.index + 100), controls: scannerControls, conclusion: 'Actual Pixi URI-regex false positive confirmed; global boundary change also misses genuine template-literal and file-URL drive paths' },
  static: { exactFileSetAndHashes: true, noPrivateSourceMapsOrLocalPathLiteralsFound: true, relativeReferencesResolvedOffline: references.length, appFetchDefaultGETOnly: true, downloadJSONSourcePresentOnly: true, occluders: art.occluders.map(o => o.id) },
  compiledRuntime: { seeds, totalStatesComparedToPinnedNative: runs.reduce((sum, run) => sum + run.ticksCompared, 0), runs },
  browserExecuted: false, uiPass: false, scenePass: false, overallPass: false,
  unverified: ['Authorized HTTP(S) preview and bytes served by Review', 'Real resource requests/status/CSP/MIME/import-map/WebGL/Pixi initialization', 'DOM random/replay/pause/tick controls, Art/Geometry/zoom and visible mask behavior', 'Browser JSON download and observed-run persistence through UI', 'Assembled contacts/occlusion/shadows/basket appearance and ordinary user random throws'],
};
mkdirSync(output, { recursive: true });
writeFileSync(path.join(output, 'EVIDENCE.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ candidate: report.candidate, manifestSha256: report.manifestSha256, treeSha256: report.treeSha256, fileCount: records.length, totalBytes: manifest.totalBytes, statesCompared: report.compiledRuntime.totalStatesComparedToPinnedNative, projectionError: maxProjectionError, runs: runs.map(({ seed, ticksCompared, result, contacts }) => ({ seed, ticksCompared, result, contacts })), scannerControls, evidence: path.join(output, 'EVIDENCE.json'), browserExecuted: false, overallPass: false }, null, 2));
