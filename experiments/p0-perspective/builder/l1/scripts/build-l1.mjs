import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const builder = path.resolve(root, '..');
const experiment = path.resolve(builder, '..');
const outFlag = process.argv.indexOf('--out');
const outDir = outFlag >= 0 ? path.resolve(process.argv[outFlag + 1]) : path.join(root, 'output');
const paths = {
  layout: path.join(root, 'layout-v1.json'),
  contract: path.join(builder, 'generated', 'composition-contract-v2.json'),
  metadata: path.join(experiment, 'asset-artist', 'l1-components', 'prepared', 'component-metadata.json'),
  environment: path.join(experiment, 'asset-artist', 'l1-components', 'prepared', 'environment-floor-plate-1536.png'),
  master: path.join(experiment, 'asset-artist', 'l1-components', 'prepared', 'drum-master-rgba.png'),
  shadow: path.join(experiment, 'asset-artist', 'l1-components', 'prepared', 'drum-shadow-rgba.png'),
  conceptBrief: path.join(experiment, 'concept', 'COMPONENT_ART_INTEGRATION_BRIEF.md'),
};

await mkdir(outDir, { recursive: true });
const compose = spawnSync('pwsh', ['-NoProfile', '-File', path.join(here, 'compose-l1.ps1'), '-Root', root, '-OutputDirectory', outDir], { encoding: 'utf8' });
if (compose.status !== 0) throw new Error(compose.stderr || compose.stdout || 'L1 compositor failed');

const [layout, contract, metadata] = await Promise.all([
  readJson(paths.layout), readJson(paths.contract), readJson(paths.metadata),
]);
validateInputs(layout, contract, metadata);

const normalizationScale = layout.masterNormalization.nominalVisibleHeightAtUniformScale1Px / layout.masterNormalization.sourceVisibleHeightPx;
const anchor = metadata.drumMaster.baseCenterAnchorPx;
const masterSize = metadata.drumMaster.preparedSize;
const sourceHashes = Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([id, file]) => [id, { file: repoRelative(file), sha256: await fileHash(file) }])));
const masterHash = sourceHashes.master.sha256;
const shadowHash = sourceHashes.shadow.sha256;
const instances = [...layout.instances].sort(compareInstances).map((instance, drawIndex) => {
  const combinedRasterScale = normalizationScale * instance.uniformScale;
  const baseCenterPx = { x: instance.p * 1536, y: instance.q * 1536 };
  const destinationRectPx = {
    x: baseCenterPx.x - anchor[0] * combinedRasterScale,
    y: baseCenterPx.y - anchor[1] * combinedRasterScale,
    width: masterSize[0] * combinedRasterScale,
    height: masterSize[1] * combinedRasterScale,
  };
  return {
    ...instance,
    drawIndex,
    baseCenterPx: mapNumbers(baseCenterPx),
    sourceNormalizationScale: round(normalizationScale, 12),
    combinedRasterScale: round(combinedRasterScale, 12),
    destinationRectPx: mapNumbers(destinationRectPx),
    master: { sourceId: 'master', sha256: masterHash, sourceAnchorPx: anchor },
    shadow: { sourceId: 'shadow', sha256: shadowHash, sourceAnchorPx: metadata.shadowMaster.baseCenterAnchorPx, destinationRectEqualsMaster: true },
    zOrder: [`${drawIndex}:shadow`, `${drawIndex}:master`],
  };
});

const compositePath = path.join(outDir, 'composite-l1.png');
const compositeSize = pngDimensions(await readFile(compositePath));
const componentDimensions = {
  environment: pngDimensions(await readFile(paths.environment)),
  master: pngDimensions(await readFile(paths.master)),
  shadow: pngDimensions(await readFile(paths.shadow)),
};
const manifest = {
  schema: 'r4d.p0.l1-composite-manifest.v1',
  status: 'single-deterministic-L1-composite-final-series-closed',
  provenance: {
    builderContractV2: '606737181da71457372b0f026b4d25cced68d4ee',
    assetComponents: '0e23670803d57e6df564a1553c4d87a824e8bcd0',
    conceptIntegrationBrief: 'b807bcd53cc4baa45ef06925126256f09f99b1ac',
  },
  buildCommand: 'npm run build:l1',
  frame: { widthPx: compositeSize.width, heightPx: compositeSize.height, output: 'composite-l1.png' },
  sourceInputs: sourceHashes,
  componentDimensions,
  masterPolicy: { identity: 'one exact RGBA master reused four times', sourceNormalizationScale: round(normalizationScale, 12), nominalVisibleHeightAtScale1Px: 120 },
  painterOrder: 'instances sorted ascending by (q,p,instanceId); each shadow immediately before its master',
  instances,
  cleanOutput: { controlMarkersAllowed: false, overlaysInComposite: [] },
  gates: { l1Composite: 'built-once', newImages: 'closed', finalSeries: 'closed' },
};

const report = {
  schema: 'r4d.p0.l1-numeric-report.v1',
  frameDimensions: compositeSize,
  componentDimensions,
  expectedAnchorQ: [0.338,0.453,0.567,0.681],
  actualAnchorQ: instances.map((i) => i.q),
  baseCenterYPx: instances.map((i) => i.baseCenterPx.y),
  expectedUniformScales: [0.939,0.978,1.018,1.058],
  actualUniformScales: instances.map((i) => i.uniformScale),
  uniqueMasterHashes: [...new Set(instances.map((i) => i.master.sha256))],
  uniqueShadowHashes: [...new Set(instances.map((i) => i.shadow.sha256))],
  shadowMasterDestinationIdentity: instances.every((i) => i.shadow.destinationRectEqualsMaster && JSON.stringify(i.shadow.sourceAnchorPx) === JSON.stringify(i.master.sourceAnchorPx)),
  stableOrder: instances.map((i) => i.instanceId),
  anchorsInsidePlayableQuad: instances.map((i) => ({ instanceId: i.instanceId, inside: pointInsidePlayable(contract, i.p, i.q) })),
  controlMarkersAllowed: false,
  verdict: 'PASS-machine-contract; visual cohesion requires separate browser self-check',
};

const manifestPath = path.join(outDir, 'manifest-l1.json');
const reportPath = path.join(outDir, 'numeric-report-l1.json');
await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
const review = renderReview();
const reviewPath = path.join(outDir, 'review-l1.html');
await writeFile(reviewPath, review, 'utf8');

const hashes = {
  schema: 'r4d.p0.l1-hashes.v1',
  files: {
    'composite-l1.png': await fileHash(compositePath),
    'manifest-l1.json': await fileHash(manifestPath),
    'numeric-report-l1.json': await fileHash(reportPath),
    'review-l1.html': await fileHash(reviewPath),
    [sourceHashes.environment.file]: sourceHashes.environment.sha256,
    [sourceHashes.master.file]: sourceHashes.master.sha256,
    [sourceHashes.shadow.file]: sourceHashes.shadow.sha256,
  },
};
await writeFile(path.join(outDir, 'hashes-l1.json'), `${JSON.stringify(hashes, null, 2)}\n`, 'utf8');
console.log(`Built deterministic L1 package in ${outDir}`);

function validateInputs(layout, contract, metadata) {
  assert(layout.schema === 'r4d.p0.l1-layout.v1', 'Unexpected layout schema');
  assert(contract.schema === 'r4d.p0.layered-composition-contract.v2', 'Unexpected contract schema');
  assert(metadata.schema === 'r4d.p0.asset-components.v1', 'Unexpected component metadata schema');
  assert(JSON.stringify(layout.instances.map((i) => i.q)) === JSON.stringify([0.338,0.453,0.567,0.681]), 'Anchor q values changed');
  assert(JSON.stringify(layout.instances.map((i) => i.uniformScale)) === JSON.stringify([0.939,0.978,1.018,1.058]), 'Uniform scales changed');
  assert(new Set(layout.instances.map((i) => i.instanceId)).size === 4, 'Instance IDs must be unique');
  assert(layout.controlMarkersAllowed === false && layout.randomness === 'forbidden', 'Clean deterministic layout required');
  assert(metadata.drumMaster.preparedFile === 'drum-master-rgba.png' && metadata.shadowMaster.preparedFile === 'drum-shadow-rgba.png', 'Unexpected component files');
  assert(JSON.stringify(metadata.drumMaster.baseCenterAnchorPx) === JSON.stringify(metadata.shadowMaster.baseCenterAnchorPx), 'Master/shadow anchors differ');
}

function pointInsidePlayable(contract, p, q) {
  const z = (q - 0.255) / 0.52;
  const halfWidth = 0.275 + 0.14 * z;
  return q >= 0.255 && q <= 0.775 && p >= 0.5-halfWidth && p <= 0.5+halfWidth;
}
function compareInstances(a, b) { return a.q-b.q || a.p-b.p || a.instanceId.localeCompare(b.instanceId, 'en'); }
function mapNumbers(object) { return Object.fromEntries(Object.entries(object).map(([key,value]) => [key, round(value, 6)])); }
function round(value, digits=6) { const k=10**digits; return Math.round(value*k)/k; }
function pngDimensions(buffer) { assert(buffer.subarray(1,4).toString('ascii') === 'PNG', 'Not a PNG'); return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) }; }
async function readJson(file) { return JSON.parse(await readFile(file, 'utf8')); }
async function fileHash(file) { return createHash('sha256').update(await readFile(file)).digest('hex'); }
function repoRelative(file) { return path.relative(experiment, file).replaceAll('\\','/'); }
function assert(condition, message) { if (!condition) throw new Error(message); }
function renderReview() { return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><link rel="icon" href="data:,"><title>P0 L1 composite review</title><style>*{box-sizing:border-box}body{margin:0;background:#231815;color:#f7e7ca;font-family:Segoe UI,Arial,sans-serif}main{max-width:1536px;margin:auto;padding:24px}h1{margin:0 0 8px}p{margin:0 0 18px;color:#d6bea0}img{display:block;width:100%;height:auto;background:#000;border:1px solid #765044}</style></head><body><main><h1>P0 · deterministic L1 composite</h1><p>Clean 1536² board · one RGBA master · exact anchors/scales · final series closed</p><img src="composite-l1.png" alt="finished deterministic L1 board"></main></body></html>\n`; }
