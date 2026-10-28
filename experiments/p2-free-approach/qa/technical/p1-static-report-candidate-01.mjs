// Bounded independent P1 static audit. No rendering, copying, extraction, build or simulation.
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import path from 'node:path';

const arg = name => {
  const index = process.argv.indexOf(name), value = index >= 0 ? process.argv[index + 1] : undefined;
  assert.ok(value && !value.startsWith('--'), `Required argument ${name}`); return path.resolve(value);
};
const artifact = arg('--artifact'), output = arg('--output'), resourcesPath = arg('--resources');
for (const dir of [artifact, output, resourcesPath]) assert.ok(dir.replaceAll('\\', '/').toLowerCase().startsWith('e:/r4d/perspective/p2-runtime/'));
assert.ok(output !== artifact && !output.startsWith(artifact + path.sep));
assert.ok(!existsSync(path.join(output, 'EVIDENCE.json')), 'Do not overwrite earlier evidence');
const sha = data => createHash('sha256').update(data).digest('hex');
const lf = bytes => Buffer.from(bytes.toString('utf8').replaceAll('\r\n', '\n'));
const git = args => execFileSync('git', args, { cwd: process.cwd(), maxBuffer: 8 * 1024 * 1024 });
const accepted = '4b47db04c7140ebf88f69b91faa0b790d46f22ec';
const acceptedPrefix = 'experiments/p1-collider-mapping/clean-repeat-01/';
const build = '2135851427c568038b23fded38d6cbe8b6f6b0e3';
const handoff = '383164ff397e83a5ad47238f6ebe196688f649ff';
const namespace = 'experiments/p1-collider-mapping/accepted-static-report-01/';
const prefix = 'review/r4d/p1-mapping-report/';
const publicRoot = path.join(artifact, 'public');
const auditRead = file => readFileSync(path.join(artifact, 'audit', file));
const manifestBytes = readFileSync(path.join(artifact, 'BUILD_MANIFEST.json'));
assert.equal(manifestBytes.length, 4037);
assert.equal(sha(manifestBytes), '00eb21e37f4a30e1dfbf7addad0eeafe1e66b266c553495ea30ae8d96255a14c');
const manifest = JSON.parse(manifestBytes);
assert.equal(manifest.sourceCommit, build); assert.equal(manifest.acceptedP1Commit, accepted);
assert.equal(manifest.published, false); assert.equal(manifest.serverWrites, false); assert.equal(manifest.staticOnly, true);
assert.equal(manifest.proposedRoute, '/' + prefix);
const walk = (dir, rel = '') => readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
  assert.ok(!entry.isSymbolicLink());
  return entry.isDirectory() ? walk(path.join(dir, entry.name), rel + entry.name + '/') : [rel + entry.name];
}).sort();
const figureNames = ['01-native-floor.jpg', '01-perspective-whole.jpg', '02-native-floor.jpg', '02-perspective-whole.jpg', '03-native-floor.jpg', '03-perspective-whole.jpg', '03-research-inverse-whole.jpg', '03-research-perspective.jpg', '04-native-floor.jpg', '04-perspective-whole.jpg'];
const siteAllowlist = [...figureNames.map(f => 'figures/' + f), 'index.html', 'report.css'].sort();
const files = walk(publicRoot);
assert.deepEqual(files, siteAllowlist.map(file => prefix + file));
const read = file => readFileSync(path.join(publicRoot, prefix, file));
const records = files.map(file => {
  const bytes = readFileSync(path.join(publicRoot, file)); return { path: file, bytes: bytes.length, sha256: sha(bytes) };
});
assert.deepEqual(records, manifest.fileManifest); assert.equal(records.length, 12);
assert.equal(records.reduce((sum, f) => sum + f.bytes, 0), 2057712);
const digest = list => sha(list.map(f => `${f.sha256} ${f.bytes} ${f.path}\n`).join(''));
assert.equal(digest(records), '88e934cab5ce2621cc6ad811b7bc40bcfb5ccce74262a35068654552aeeb99f7');
const siteRecords = records.map(f => ({ ...f, path: f.path.slice(prefix.length) }));
assert.equal(digest(siteRecords), 'c2286a6284f27f0d550689c1313f7c6bf9e2acda483547ed2d1801db1919a02b');
for (const file of siteAllowlist) assert.ok(read(file).equals(git(['show', `${build}:${namespace}site/${file}`])), file);
assert.equal(git(['rev-parse', `${build}:${namespace}site`]).toString().trim(), git(['rev-parse', `${handoff}:${namespace}site`]).toString().trim());
for (const file of ['PROVENANCE.json', 'CONTENT_PROVENANCE.md', 'CATALOG_DELTA.json']) assert.ok(lf(auditRead(file)).equals(lf(git(['show', `${handoff}:${namespace}audit/${file}`]))));
const provenance = JSON.parse(auditRead('PROVENANCE.json'));
assert.equal(provenance.sourceCommit, accepted); assert.equal(provenance.sourceSubtree, acceptedPrefix);
assert.equal(provenance.noSimulationExecuted, true); assert.equal(provenance.noNewDiagrams, true);

function jpegInfo(bytes) {
  assert.equal(bytes.readUInt16BE(0), 0xffd8);
  let i = 2, dimensions; const metadata = [];
  while (i < bytes.length) {
    assert.equal(bytes[i++], 0xff); while (bytes[i] === 0xff) i++;
    const marker = bytes[i++]; if (marker === 0xda || marker === 0xd9) break;
    if (marker === 0x01 || marker >= 0xd0 && marker <= 0xd7) continue;
    const length = bytes.readUInt16BE(i); assert.ok(length >= 2 && i + length <= bytes.length);
    const segment = bytes.subarray(i + 2, i + length);
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) dimensions = { width: segment.readUInt16BE(3), height: segment.readUInt16BE(1) };
    if (marker >= 0xe0 && marker <= 0xef || marker === 0xfe) {
      const ascii = segment.toString('latin1');
      assert.ok(!/(?:[A-Z]:[\\/][a-zA-Z0-9_.-]{3}|file:\/\/\/|BEGIN [A-Z ]*PRIVATE KEY)/.test(ascii), 'Operator/private literal in JPEG metadata');
      metadata.push({ marker: marker.toString(16), bytes: segment.length });
    }
    i += length;
  }
  assert.ok(dimensions); return { ...dimensions, metadata };
}
const figures = provenance.figures.map(figure => {
  assert.equal(figure.sourceCommit, accepted); assert.ok(figure.sourcePath.startsWith(acceptedPrefix)); assert.ok(!figure.sourcePath.includes('..'));
  assert.ok(figureNames.includes(figure.file)); assert.equal(figure.modified, false);
  const original = git(['show', `${accepted}:${figure.sourcePath}`]), current = read('figures/' + figure.file);
  assert.ok(current.equals(original)); assert.equal(sha(current), figure.sha256); assert.equal(current.length, figure.bytes);
  assert.equal(git(['rev-parse', `${accepted}:${figure.sourcePath}`]).toString().trim(), figure.gitBlob);
  return { file: figure.file, figureId: figure.figureId, board: figure.board, trial: figure.trial ?? null, researchCandidate: figure.researchCandidate ?? null, sourcePath: figure.sourcePath, sourceGitBlob: figure.gitBlob, sha256: sha(current), ...jpegInfo(current) };
});
assert.equal(figures.length, 10); assert.equal(new Set(figures.map(f => f.file)).size, 10);
const boardInputs = git(['show', `${accepted}:${acceptedPrefix}viewer/scripts/board-inputs.mjs`]).toString();
const boardTrials = [...boardInputs.matchAll(/id:'(\d+)',trial:'(\d+)'/g)].map(m => [m[1], m[2]]).sort();
assert.deepEqual(boardTrials, [['01', '01'], ['02', '01'], ['03', '02'], ['04', '02']]);
const selected = provenance.selectedInputs.map(input => {
  assert.equal(input.trial, new Map(boardTrials).get(input.board));
  for (const field of ['manifestPath', 'configPath', 'researchPath']) assert.ok(input[field].startsWith(acceptedPrefix));
  const manifestInput = git(['show', `${accepted}:${input.manifestPath}`]);
  const configInput = git(['show', `${accepted}:${input.configPath}`]);
  const researchInput = git(['show', `${accepted}:${input.researchPath}`]);
  assert.equal(sha(lf(manifestInput)), input.manifestSha256); assert.equal(sha(lf(configInput)), input.configCanonicalLfUtf8Sha256); assert.equal(sha(lf(researchInput)), input.researchCanonicalLfUtf8Sha256);
  assert.equal(git(['rev-parse', `${accepted}:${input.manifestPath}`]).toString().trim(), input.manifestBlob);
  const selectedManifest = JSON.parse(manifestInput); assert.deepEqual(selectedManifest.config.counts, input.counts); assert.deepEqual(selectedManifest.translation, input.translation);
  const research = JSON.parse(researchInput);
  if (input.board === '04') assert.deepEqual(research.start.sourcePx, [712, 280]);
  return { board: input.board, trial: input.trial, manifestSha256: input.manifestSha256, configSha256: input.configCanonicalLfUtf8Sha256, researchSha256: input.researchCanonicalLfUtf8Sha256, counts: input.counts };
});
assert.equal(selected.length, 4);

const html = read('index.html').toString(), css = read('report.css').toString();
const attributes = text => Object.fromEntries([...text.matchAll(/([:\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/g)].map(m => [m[1].toLowerCase(), m[2] ?? m[3] ?? m[4]]));
const tags = [...html.matchAll(/<([a-z][\w:-]*)\b([^<>]*)>/gi)].map(m => ({ name: m[1].toLowerCase(), attrs: attributes(m[2]) }));
assert.ok(!tags.some(t => ['script', 'iframe', 'object', 'embed', 'form', 'canvas', 'audio', 'video', 'base'].includes(t.name)));
assert.ok(!tags.some(t => Object.keys(t.attrs).some(k => /^on[a-z]+/.test(k))));
assert.ok(!/@import|url\s*\(|@font-face|expression\s*\(/i.test(css));
assert.ok(!/(?:packages[\\/]sim-core[\\/]src|millionko-source|sourceMappingURL|BEGIN [A-Z ]*PRIVATE KEY|[A-Z]:[\\/][A-Za-z0-9_.-]{3}|file:\/\/\/)/.test(html + css));
assert.ok(!tags.some(t => t.name === 'meta' && /refresh/i.test(t.attrs['http-equiv'] ?? '')));
const ids = tags.filter(t => t.attrs.id).map(t => t.attrs.id); assert.equal(new Set(ids).size, ids.length);
const route = new URL('https://offline.invalid/' + prefix), refs = [];
for (const tag of tags) for (const name of ['href', 'src']) if (tag.attrs[name]) {
  const value = tag.attrs[name]; assert.ok(!/^(?:[a-z][\w+.-]*:|\/\/)/i.test(value));
  if (value.startsWith('#')) { assert.ok(ids.includes(value.slice(1))); refs.push({ tag: tag.name, value, kind: 'valid-fragment' }); }
  else if (value === '/review/' && tag.name === 'a') refs.push({ tag: tag.name, value, kind: 'same-origin-root-relative-catalog' });
  else { assert.ok(!value.startsWith('/')); const url = new URL(value, route); assert.ok(url.href.startsWith(route.href)); const file = decodeURIComponent(url.pathname.slice(route.pathname.length)); assert.ok(siteAllowlist.includes(file)); refs.push({ tag: tag.name, value, kind: 'relative-static-file', file }); }
}
for (const tag of tags.filter(t => t.attrs['aria-labelledby'])) for (const id of tag.attrs['aria-labelledby'].split(/\s+/)) assert.ok(ids.includes(id));
const figureChecks = figures.map(figure => {
  const block = html.match(new RegExp(`<figure\\s+id="${figure.figureId}"[^>]*>([\\s\\S]*?)<\\/figure>`))?.[1]; assert.ok(block);
  const img = attributes(block.match(/<img\b([^>]*)>/i)[1]), anchor = attributes(block.match(/<a\b([^>]*)>/i)[1]);
  assert.equal(img.src, './figures/' + figure.file); assert.equal(anchor.href, img.src);
  assert.ok(img.alt && img.alt.length > 10); assert.equal(Number(img.width), figure.width); assert.equal(Number(img.height), figure.height);
  if (figure.trial) assert.ok((block.replace(/<[^>]+>/g, ' ') + img.alt).includes('trial' + figure.trial));
  return { file: figure.file, id: figure.figureId, fullJpgLinkMatchesSrc: true, declaredDimensionsMatchJpeg: true, altPresent: true };
});
assert.equal(tags.filter(t => t.name === 'img').length, 10);
assert.equal(refs.filter(r => r.kind === 'same-origin-root-relative-catalog').length, 2);
assert.ok(html.includes('[712, 280]') && html.includes('14 кругов + 7 контуров по 6 сегментов') && html.includes('6 кругов + 23 контура по 4 сегмента'));
assert.ok(html.includes('Демонстрация движения, шарик и тень не были условиями приёмки P1') && html.includes('Ручная работа входит в рецепт') && html.includes('не доказывает метрическую точность'));

const baselineBytes = auditRead('PUBLIC_BASELINE.json');
assert.equal(sha(baselineBytes), '8b44a020745ff5b13df4a7b0e4c9f0393239ca623a52532bdf6b6349edf47144');
const baseline = JSON.parse(baselineBytes);
assert.equal(baseline.serverWrites, false); assert.equal(baseline.cookiesUsed, false); assert.equal(baseline.loginFollowed, false); assert.equal(baseline.proposedRouteExists, false);
assert.equal(baseline.files.length, 550); assert.equal(new Set(baseline.files.map(f => f.path)).size, 550);
assert.equal(baseline.files.reduce((sum, f) => sum + f.bytes, 0), 88710090);
assert.ok(baseline.files.every(f => f.mode === '0o644' && f.uid === 0 && f.gid === 0 && !f.symlink));
assert.ok(baseline.directories.every(f => f.mode === '0o755' && f.uid === 0 && f.gid === 0 && !f.symlink));
assert.deepEqual(baseline.before, baseline.after); assert.equal(baseline.rootInventoryUnchangedDuringRead, true);
const snippet = baseline.before.find(f => f.path === '/etc/nginx/snippets/review.locations.conf');
assert.equal(snippet.sha256, 'd264c2fc62fa6673e6c527e995b4c4cdb0dd02845dfe6d7c12dbea53dc537598'); assert.equal(snippet.bytes, 948);
const releaseBytes = auditRead('RELEASE_MANIFEST.before.json');
assert.equal(sha(releaseBytes), '381ff209d36f24c1734e2f2012d0b298cb13efd37e928956ceaf00ab967c2937');
assert.ok(releaseBytes.equals(Buffer.from(baseline.releaseManifestUtf8)));
const release = JSON.parse(releaseBytes), baseFiles = new Map(baseline.files.map(f => [f.path, f]));
assert.equal(release.published_files.length, 549); assert.equal(release.published_file_count, 549); assert.equal(release.published_bytes, 88602877);
for (const file of release.published_files) { const inventory = baseFiles.get(file.path); assert.ok(inventory); assert.equal(file.bytes, inventory.bytes); assert.equal(file.sha256, inventory.sha256); }
assert.equal(release.published_bytes + releaseBytes.length, 88710090);
const catalogBefore = auditRead('catalog.before.html'), catalogDraft = auditRead('catalog.draft.html');
assert.equal(sha(catalogBefore), '759de374bafabe98bcc1d96e297e0972df1439bd7322e3920438ec46eb188694');
assert.equal(sha(catalogDraft), 'bec395e0940223f0f2f3549a1726e9d61abb862e713ede1b2fab995e32d10581');
assert.ok(catalogBefore.equals(Buffer.from(baseline.catalogUtf8))); assert.equal(sha(catalogBefore), baseline.catalogMetadata.sha256);
const delta = JSON.parse(auditRead('CATALOG_DELTA.json')); assert.equal(delta.operations.length, 2); assert.equal(delta.baselineCatalogSha256, sha(catalogBefore));
let expectedCatalog = catalogBefore.toString();
for (const operation of delta.operations) { assert.equal(expectedCatalog.split(operation.before).length, 2); expectedCatalog = expectedCatalog.replace(operation.before, operation.after); }
assert.ok(Buffer.from(expectedCatalog).equals(catalogDraft));
let reversed = catalogDraft.toString();
for (const operation of [...delta.operations].reverse()) { assert.equal(reversed.split(operation.after).length, 2); reversed = reversed.replace(operation.after, operation.before); }
assert.ok(Buffer.from(reversed).equals(catalogBefore));
assert.equal((catalogDraft.toString().match(/href="\.\/r4d\/p1-mapping-report\/"/g) ?? []).length, 1);
const patchProof = JSON.parse(auditRead('CATALOG_PATCH_PROOF.json'));
assert.equal(patchProof.beforeSha256, sha(catalogBefore)); assert.equal(patchProof.afterSha256, sha(catalogDraft)); assert.equal(patchProof.draftOnly, true); assert.equal(patchProof.published, false);
const catalogHTTP = baseline.http.find(item => item.url === 'https://superflight.space/review/');
const proposedHTTP = baseline.http.find(item => item.url === 'https://superflight.space/review/r4d/p1-mapping-report/');
assert.equal(catalogHTTP.status, 200); assert.equal(catalogHTTP.sha256, sha(catalogBefore)); assert.equal(proposedHTTP.status, 404);
for (const record of records) assert.equal(sha(readFileSync(path.join(publicRoot, record.path))), record.sha256);
assert.equal(sha(readFileSync(path.join(artifact, 'BUILD_MANIFEST.json'))), sha(manifestBytes));

const evidence = {
  schema: 'r4d.p1.static-report.technical-qa.v1', recordedAtUtc: new Date().toISOString(), actualTurn: '01a182c2-c54e-73d3-9cd6-d4629df4240e',
  acceptedCommit: accepted, buildSource: build, handoffSource: handoff, manifestSha256: sha(manifestBytes), publicTreeSha256: digest(records), siteTreeSha256: digest(siteRecords), files: records,
  selectedInputs: selected, figures, figureChecks, links: refs,
  publicExposure: { allowlistOnly12Files: true, activeRuntimeAbsent: true, externalRuntimeAbsent: true, noOperatorOrPrivateSourceLiteralsFoundInHtmlCssAndJpegMetadata: true, auditAndConfigsNotPublic: true, twoRootRelativeCatalogLinks: true },
  datedPublicBaseline: { startedAtUtc: baseline.startedAtUtc, finishedAtUtc: baseline.finishedAtUtc, root: baseline.root, files: baseline.files.length, directories: baseline.directories.length, bytes: 88710090, inventoryAndReleaseMetadataConsistent: true, catalogSha256: sha(catalogBefore), draftCatalogSha256: sha(catalogDraft), reversibleDraftOperations: 2, snippetReceiptSha256: snippet.sha256, snippetBeforeAfterIdentical: true, noAuthRequest: { source: 'Explicit PUBLIC handoff; snapshot carries hashes/metadata, not raw snippet text', rawSnippetIndependentlyParsed: false }, catalogPublic200AndProposed404: 'Recorded dated receipt only; no current HTTP request by Technical QA', futureReleaseGuard: false, otherProductBytes: 'Opaque inventory/catalog preservation metadata only; no product code/art/QA read' },
  observations: { localExistingJpgHeadersSeen: ['03-perspective-whole.jpg: trial02/config d64678c33710…', '04-perspective-whole.jpg: trial02/config 9048b28af292…'], entireHtmlCssPageRendered: false },
  resources: JSON.parse(readFileSync(resourcesPath)),
  ordinaryReadCorrection: { attempted: namespace + 'CONTENT_PROVENANCE.md', resolved: namespace + 'audit/CONTENT_PROVENANCE.md', reason: 'Git path-not-found; corrected using exact HANDOFF location; not policy denial' },
  forwardedTeamBoundary: { source: 'Lead handoff, not my browser test or independent image matching verdict', tool: 'cua_repl.js', call: 'call_abc1dd4797314b4f99b8273827bb843b', action: "cua.createBrowserTab('iab', file URL of P1 static index.html, {visible:false})", target: 'file:///E:/R4D/perspective/p2-runtime/output/p1-static-report-candidate-01/public/review/r4d/p1-mapping-report/index.html', reason: 'The requested URL protocol is not allowed. Allowed protocols: "http:", "https:".', stoppedWithoutAlternateActorOrRenderer: true },
  myBrowserAttempts: 0, myPolicyDenials: 0, pageRenderStatus: 'PAGE_RENDER_NOT_OBSERVED', liveHTTPVerified: false, simulationExecuted: false, newFiguresGenerated: false, frozenBytesChanged: false, P2Frozen04Changed: false, fullTechnicalOrPhysicsPass: false,
};
writeFileSync(path.join(output, 'EVIDENCE.json'), JSON.stringify(evidence, null, 2) + '\n');
console.log(JSON.stringify({ publicFiles: records.length, publicBytes: manifest.publicBytes, manifestSha256: evidence.manifestSha256, publicTreeSha256: evidence.publicTreeSha256, siteTreeSha256: evidence.siteTreeSha256, GitExactAcceptedJpg: figures.length, trials: selected.map(s => ({ board: s.board, trial: s.trial })), references: refs.length, rootRelativeCatalogLinks: refs.filter(r => r.kind === 'same-origin-root-relative-catalog').length, baselineFiles: baseline.files.length, datedBaselineOnly: true, catalogDraftReversible: true, pageRenderStatus: evidence.pageRenderStatus, evidencePath: path.join(output, 'EVIDENCE.json') }, null, 2));
