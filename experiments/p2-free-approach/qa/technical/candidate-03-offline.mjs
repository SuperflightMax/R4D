// Independent candidate-03 delta audit. No Builder build/selfcheck/serve or browser.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, readdirSync, statfsSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { SourceTextModule } from 'node:vm';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const argument = name => {
  const index = process.argv.indexOf(name), value = index >= 0 ? process.argv[index + 1] : undefined;
  assert.ok(value && !value.startsWith('--'), `Required argument ${name}`);
  return path.resolve(value);
};
const artifact = argument('--artifact'), baselineArtifact = argument('--baseline-artifact');
const baselineEvidence = argument('--baseline-evidence'), output = argument('--output');
const coreRoot = argument('--core-root'), pixiRoot = argument('--pixi-root');
for (const dir of [artifact, baselineArtifact, baselineEvidence, output]) assert.ok(dir.replaceAll('\\', '/').toLowerCase().startsWith('e:/r4d/perspective/p2-runtime/'));
assert.ok(![artifact, baselineArtifact].some(dir => output === dir || output.startsWith(dir + path.sep)));
assert.ok(!existsSync(path.join(output, 'EVIDENCE.json')), 'Choose a new output; preserve prior evidence');
const sourceCommit = 'e7ed4d068f33ee6ecda491f15dc46a6fd548ef96';
const sha256 = bytes => createHash('sha256').update(bytes).digest('hex');
const lf = bytes => Buffer.from(bytes.toString('utf8').replaceAll('\r\n', '\n'));
const git = (args, cwd = process.cwd()) => execFileSync('git', args, { cwd, maxBuffer: 8 * 1024 * 1024 });
const source = file => git(['show', `${sourceCommit}:experiments/p2-free-approach/builder/${file}`]);
const disks = ['C:/', 'D:/', 'E:/'].map(drive => {
  const space = statfsSync(drive);
  return { drive, freeBytes: space.bavail * space.bsize, freeGiB: space.bavail * space.bsize / 2 ** 30 };
});
assert.ok(disks.every(d => d.freeGiB > 4), 'Reassess warning/diagnostic thresholds before this packet');
const manifestBytes = readFileSync(path.join(artifact, 'BUILD_MANIFEST.json'));
assert.equal(sha256(manifestBytes), '69a46f395278749ab44b81bcd78f0b70f6f1edf2bbd2d30ff536411d16bf5575');
const manifest = JSON.parse(manifestBytes);
assert.equal(manifest.candidate, 'p2-jungle-static-candidate-03');
assert.equal(manifest.sourceCommit, sourceCommit);
assert.equal(manifest.route, '/review/r4d/p2-free-approach/');
const root = path.join(artifact, 'bundle/review/r4d/p2-free-approach');
const oldRoot = path.join(baselineArtifact, 'bundle/review/r4d/p2-free-approach');
const read = file => readFileSync(path.join(root, file));
const oldRead = file => readFileSync(path.join(oldRoot, file));
const text = file => read(file).toString('utf8');
const walk = (dir, prefix = '') => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  assert.ok(!entry.isSymbolicLink(), 'Unexpected symlink');
  return entry.isDirectory() ? walk(path.join(dir, entry.name), prefix + entry.name + '/') : [prefix + entry.name];
}).sort();
const files = walk(root);
assert.deepEqual(files, manifest.files.map(f => f.path));
const records = files.map(file => {
  const bytes = read(file);
  return { path: file, bytes: bytes.length, sha256: sha256(bytes), kind: file === 'runtime/sim-core.js' ? 'authorized-private-compiled-runtime' : 'public-scene-or-asset' };
});
assert.deepEqual(records, manifest.files);
assert.equal(files.length, 15);
assert.equal(records.reduce((sum, f) => sum + f.bytes, 0), 2448161);
assert.equal(sha256(JSON.stringify(records) + '\n'), 'd9dba321de0c4c9ba3acf61297b4fe0401a8ea9f0f4069362371dbc94fc0308d');
const oldEvidenceBytes = readFileSync(baselineEvidence);
assert.equal(sha256(oldEvidenceBytes), '67f871ade76fa912ae5cfd41ab8199eb8cb64f188e6c684b6cbdaf15007374c6');
const oldEvidence = JSON.parse(oldEvidenceBytes);
for (const file of oldEvidence.files) assert.equal(sha256(oldRead(file.path)), file.sha256, `Baseline bytes changed: ${file.path}`);

const expectedEmissions = [
  ['index.html', 'index.html', [['"pixi.js":"./vendor/pixi.mjs"', '"pixi.js":"./vendor/pixi.js"'], ['src="./src/main.mjs"', 'src="./src/main.js"']]],
  ['src/main.mjs', 'src/main.js', [["from '../runtime/sim-core.mjs'", "from '../runtime/sim-core.js'"], ["from './controller.mjs'", "from './controller.js'"], ["from '../inputs/view-math.mjs'", "from '../inputs/view-math.js'"]]],
  ['src/controller.mjs', 'src/controller.js', []], ['inputs/view-math.mjs', 'inputs/view-math.js', []],
];
assert.equal(manifest.moduleEmissions.length, expectedEmissions.length);
const emissions = expectedEmissions.map(([input, emitted, changes], index) => {
  const declared = manifest.moduleEmissions[index], bytes = source(input);
  assert.deepEqual([declared.source, declared.output, declared.references], [input, emitted, changes]);
  assert.equal(declared.sourceGitBlob, git(['rev-parse', `${sourceCommit}:experiments/p2-free-approach/builder/${input}`]).toString().trim());
  assert.equal(declared.sourceCanonicalLfSha256, sha256(lf(bytes)));
  let expected = lf(bytes).toString();
  for (const [before, after] of changes) {
    assert.equal(expected.split(before).length, 2, 'Expected one exact adaptation');
    expected = expected.replace(before, after);
  }
  assert.equal(text(emitted), expected, `Undeclared adapted-output difference: ${emitted}`);
  return { ...declared, actualSha256: sha256(read(emitted)) };
});
const unchangedMap = [
  ['inputs/config.json', 'inputs/config.json'], ['inputs/manifest.json', 'inputs/manifest.json'],
  ['inputs/view-math.js', 'inputs/view-math.mjs'], ['src/controller.js', 'src/controller.mjs'],
  ['runtime/sim-core.js', 'runtime/sim-core.mjs'], ['vendor/pixi.js', 'vendor/pixi.mjs'],
  ['vendor/PIXI-LICENSE.txt', 'vendor/PIXI-LICENSE.txt'], ['source/01-jungle.jpg', 'source/01-jungle.jpg'],
  ['assets/files/ball-v2.png', 'assets/files/ball-v2.png'], ['assets/files/shadow-native-disc-v1.png', 'assets/files/shadow-native-disc-v1.png'],
  ['style.css', 'style.css'],
];
for (const [current, previous] of unchangedMap) assert.ok(read(current).equals(oldRead(previous)), current);
const oldArt = JSON.parse(oldRead('assets/manifest.json')), art = JSON.parse(text('assets/manifest.json'));
oldArt.provenance.candidate = manifest.candidate;
assert.deepEqual(art, oldArt);
const oldMetadata = JSON.parse(oldRead('metadata.json')), metadata = JSON.parse(text('metadata.json'));
oldMetadata.candidate = manifest.candidate; oldMetadata.sourceCommit = sourceCommit;
assert.deepEqual(metadata, oldMetadata);
const config = JSON.parse(text('inputs/config.json')), accepted = JSON.parse(text('inputs/manifest.json'));
const p1 = '4b47db04c7140ebf88f69b91faa0b790d46f22ec:experiments/p1-collider-mapping/clean-repeat-01/';
assert.ok(read('inputs/config.json').equals(git(['show', p1 + 'simulation/boards/01/trial-01/config.json'])));
const acceptedExpected = JSON.parse(git(['show', p1 + 'simulation/boards/01/trial-01/manifest.json']));
acceptedExpected.source = { sha256: metadata.sourceSha256, width: 1536, height: 1536, readOnly: true, url: 'source/01-jungle.jpg' };
assert.deepEqual(accepted, acceptedExpected);
assert.equal(sha256(lf(git(['show', p1 + 'research/board01-projection.candidate-01.json']))), metadata.projectionSha256);
assert.equal(sha256(read('runtime/sim-core.js')), metadata.compiledCoreSha256);
assert.equal(sha256(read('source/01-jungle.jpg')), metadata.sourceSha256);
const coreCommit = '5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023';
assert.equal(git(['rev-parse', 'HEAD'], coreRoot).toString().trim(), coreCommit);
assert.equal(git(['rev-parse', `${coreCommit}:packages/sim-core`], coreRoot).toString().trim(), '008d16a80a26bb77d562a45218b01da09b0d9ff0');
assert.equal(git(['--no-optional-locks', 'status', '--porcelain=v1', '--', 'packages/sim-core'], coreRoot).length, 0);
assert.equal(JSON.parse(readFileSync(path.join(pixiRoot, 'package.json'))).version, '8.22.0');
assert.ok(read('vendor/PIXI-LICENSE.txt').equals(readFileSync(path.join(pixiRoot, 'LICENSE'))));
assert.equal(text('vendor/pixi.js'), readFileSync(path.join(pixiRoot, 'dist/pixi.min.mjs'), 'utf8').replace(/^\/\/[#@]\s*sourceMappingURL=.*$/gm, ''));

const html = text('index.html'), main = text('src/main.js'), controllerText = text('src/controller.js');
const imports = JSON.parse(html.match(/<script type="importmap">([\s\S]*?)<\/script>/)[1]).imports;
assert.deepEqual(imports, { 'pixi.js': './vendor/pixi.js' });
const route = new URL('https://offline.invalid/review/r4d/p2-free-approach/');
const refs = [];
const resolve = (from, ref, kind) => {
  assert.ok(!/^(?:[a-z][\w+.-]*:|\/|\\)/i.test(ref), `Non-relative reference ${ref}`);
  const url = new URL(ref, new URL(from, route)); assert.ok(url.href.startsWith(route.href));
  const target = decodeURIComponent(url.pathname.slice(route.pathname.length)); assert.ok(files.includes(target), target);
  refs.push({ from, ref, target, kind }); return target;
};
for (const m of html.matchAll(/(?:src|href)="([^"]+)"/g)) resolve('index.html', m[1], 'html');
for (const ref of Object.values(imports)) resolve('index.html', ref, 'importmap');
const moduleFiles = files.filter(file => /\.(?:js|mjs)$/.test(file));
assert.equal(moduleFiles.length, 5); assert.ok(moduleFiles.every(file => file.endsWith('.js')));
const modules = new Map(moduleFiles.map(file => [file, new SourceTextModule(text(file), { identifier: file })]));
for (const [file, module] of modules) for (const specifier of module.dependencySpecifiers) {
  if (specifier in imports) resolve('index.html', imports[specifier], 'bare-importmap');
  else resolve(file, specifier, 'module');
}
// Link the complete actual ESM graph without evaluating Pixi/DOM code.
await modules.get('src/main.js').link((specifier, referencing) => {
  const resolved = specifier in imports
    ? new URL(imports[specifier], route)
    : new URL(specifier, new URL(referencing.identifier, route));
  const target = resolved.pathname.slice(route.pathname.length);
  assert.ok(modules.has(target), target); return modules.get(target);
});
assert.ok([...modules.values()].every(module => module.status === 'linked'));
for (const m of main.matchAll(/resource\('([^']+)'\)/g)) resolve('index.html', m[1], 'resource');
for (const item of [art.ball, art.shadow]) resolve('index.html', 'assets/files/' + item.file, 'art');
resolve('index.html', accepted.source.url, 'source-metadata');
assert.ok(!/\.mjs\b/.test(html));
assert.ok(!/\b(?:XMLHttpRequest|WebSocket|EventSource|sendBeacon)\b|method\s*:\s*['"](?:POST|PUT|PATCH|DELETE)['"]|\/api\//.test(main + controllerText + html));
assert.equal([...main.matchAll(/\bfetch\s*\(/g)].length, 1);
assert.ok(main.includes('await fetch(url)') && main.includes('URL.createObjectURL(new Blob(') && main.includes('link.download = filename'));

const scannerSource = source('scripts/scan-browser-text.mjs');
const { scanBrowserText, PINNED_PIXI_SHA256 } = await import('data:text/javascript;base64,' + scannerSource.toString('base64'));
assert.equal(PINNED_PIXI_SHA256, sha256(read('vendor/pixi.js')));
const textFiles = files.filter(file => /\.(?:js|mjs|json|html|css|txt)$/.test(file));
assert.deepEqual(manifest.privacyScan.files.map(f => f.path), textFiles);
const privacy = textFiles.map(file => ({ path: file, ...scanBrowserText(file, read(file)) }));
assert.deepEqual(privacy, manifest.privacyScan.files);
assert.ok(privacy.every(file => file.violations.length === 0));
assert.deepEqual(privacy.filter(file => file.exceptions.length).map(file => [file.path, file.exceptions]), [['vendor/pixi.js', [{ kind: 'pinned-pixi-uri-regex', start: 135846, end: 135849 }]]]);
assert.ok(moduleFiles.every(file => privacy.some(record => record.path === file)));
assert.ok(!files.some(file => /\.(?:ts|tsx|map|py|ps1|sh)$/.test(file)));
const controls = [
  ['template-drive', 'const p=`E:/example-private/core.ts`;'],
  ['file-URI', '{"path":"file:///E:/example-private/core.ts"}'],
  ['quoted-drive', 'const p="E:/example-private/core.ts";'],
  ['no-boundary', 'const p="prefixE:/example-private/core.ts";'],
  ['other-drive-backslash', String.raw`const p="Z:\\example-private\\core.ts";`],
  ['lowercase-drive', 'd:/example-private/core.ts'],
  ['drive-in-HTTPS-query', 'https://example.invalid/?path=E:/example-private/core.ts'],
  ['private-checkout', 'millionko-source/lead'], ['private-source', 'packages/sim-core/src/Sim.ts'],
  ['source-map', '//# sourceMappingURL=private.map'],
].map(([name, sample]) => {
  const result = scanBrowserText('src/probe.js', Buffer.from(sample)); assert.ok(result.violations.length > 0, name);
  return { name, violations: result.violations };
});
for (const sample of ['https://example.invalid/docs', 'http://example.invalid/', 'const p="./assets/ball.png";']) assert.equal(scanBrowserText('src/probe.js', Buffer.from(sample)).violations.length, 0);
const pixi = read('vendor/pixi.js');
for (const [name, file, bytes] of [
  ['SDK whitespace tamper', 'vendor/pixi.js', Buffer.concat([pixi, Buffer.from('\n')])],
  ['SDK genuine path append', 'vendor/pixi.js', Buffer.concat([pixi, Buffer.from('\nconst p=`E:/example-private/core.ts`;')])],
  ['same bytes wrong path', 'src/copied-sdk.js', pixi],
]) {
  const result = scanBrowserText(file, bytes); assert.equal(result.exceptions.length, 0, name);
  assert.ok(result.violations.some(v => v.kind === 'absolute-drive-path'), name);
  if (file === 'vendor/pixi.js') assert.ok(result.violations.some(v => v.kind === 'pinned-sdk-integrity-mismatch'), name);
  controls.push({ name, violations: result.violations });
}

const compiled = await import(pathToFileURL(path.join(root, 'runtime/sim-core.js')).href);
const { Controller } = await import(pathToFileURL(path.join(root, 'src/controller.js')).href);
const { transform } = await import(pathToFileURL(path.join(root, 'inputs/view-math.js')).href);
let projectionError = 0;
for (const [x, y] of accepted.projection.wholeSourceNativePolygon) {
  const back = transform(accepted.projection.sourceToNative, transform(accepted.projection.nativeToSource, { x, y }));
  projectionError = Math.max(projectionError, Math.abs(back.x - x), Math.abs(back.y - y));
}
assert.ok(projectionError < 1e-7);
const provenance = { ...metadata, projection: accepted.projection, source: accepted.source };
const runs = [];
for (const seed of [1, 490822599]) {
  const baseline = oldEvidence.compiledRuntime.runs.find(run => run.seed === seed); assert.ok(baseline);
  const sim = new Controller(compiled, config, provenance, seed); sim.advance(sim.maxTicks);
  const frames = structuredClone(sim.frames), final = sim.snapshot(), events = structuredClone(sim.events);
  assert.equal(sha256(JSON.stringify(frames)), baseline.trajectorySha256);
  assert.deepEqual(final, baseline.final); assert.deepEqual(events, baseline.descriptor.events);
  const descriptor = sim.descriptor(); assert.deepEqual(descriptor.provenance, provenance);
  const replay = new Controller(compiled, descriptor.config, descriptor.provenance, descriptor.seed);
  while (!replay.state.done) replay.advance(10);
  assert.deepEqual(replay.frames, frames); assert.deepEqual(replay.events, events);
  const contactTick = sim.contacts[0].observedAtTick;
  const checkpoints = [];
  for (const tick of [0, contactTick - 1, contactTick, contactTick + 1, final.tick]) {
    sim.seek(tick); assert.deepEqual(sim.snapshot(), frames[tick]);
    checkpoints.push({ tick, state: sim.snapshot() });
    if (tick < final.tick) { sim.advance(1); assert.deepEqual(sim.snapshot(), frames[tick + 1]); }
  }
  runs.push({ seed, states: frames.length, final, trajectorySha256: sha256(JSON.stringify(frames)), contacts: events.filter(event => event.type === 'object_hit').length, checkpoints, descriptor });
}
assert.notEqual(runs[0].trajectorySha256, runs[1].trajectorySha256);
for (const file of records) assert.equal(sha256(read(file.path)), file.sha256);
assert.equal(sha256(readFileSync(baselineEvidence)), '67f871ade76fa912ae5cfd41ab8199eb8cb64f188e6c684b6cbdaf15007374c6');
const evidence = {
  schema: 'r4d.p2.technical-qa.offline.v2', candidate: manifest.candidate, sourceCommit, recordedAtUtc: new Date().toISOString(),
  manifestSha256: sha256(manifestBytes), treeSha256: manifest.treeSha256, files: records, emissions, unchangedMap,
  baselineEvidenceSha256: sha256(oldEvidenceBytes), provenance: { coreCommit, coreTree: manifest.core.sourceTree, compiledCoreSha256: metadata.compiledCoreSha256, configSha256: metadata.configSha256, projectionSha256: metadata.projectionSha256, pixiSha256: metadata.pixiSha256, projectionRoundtripError: projectionError },
  moduleGraph: { files: moduleFiles, allLinkedWithoutEvaluation: true, refs }, privacy, scannerControls: controls, scannerSourceSha256: sha256(scannerSource),
  newExecution: { scope: 'Direct import of actual .js compiled core/controller/view-math; state trajectories/events compared with hash-verified independently executed candidate-02 baseline. No repeat of the full six-seed native matrix.', runs },
  static: { artMode: art.mode, occluders: art.occluders.map(o => o.id), getOnlyAppFetch: true, saveBlobDownloadSourceOnly: true },
  disks, diskPlanning: { CPeakGiBRetained: 1.525, EOwnOutputsUpperBoundMiB: 8, processLocalTempOnly: true },
  browserExecuted: false, httpMimeVerified: false, uiPass: false, scenePass: false, fullTechnicalPass: false,
  limitations: ['No authorized HTTP(S) target03/post-auth session; actual served bytes, MIME and network loading unverified', 'No Pixi/WebGL/render/UI/download-DOM execution', 'Four occluders only; no new art/contact/basket acceptance', 'No IN_BUCKET in the two new executed runs'],
};
mkdirSync(output, { recursive: true });
writeFileSync(path.join(output, 'EVIDENCE.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify({ candidate: evidence.candidate, manifestSha256: evidence.manifestSha256, treeSha256: evidence.treeSha256, files: files.length, bytes: manifest.totalBytes, moduleEmissions: emissions.length, linkedJsModules: moduleFiles.length, privacyTextFiles: privacy.length, scannerControls: controls.length, statesComparedToOwnBaseline: runs.reduce((sum, run) => sum + run.states, 0), runs: runs.map(({ seed, final, contacts }) => ({ seed, tick: final.tick, result: final.result.kind, contacts })), evidencePath: path.join(output, 'EVIDENCE.json'), browserExecuted: false, fullTechnicalPass: false }, null, 2));
