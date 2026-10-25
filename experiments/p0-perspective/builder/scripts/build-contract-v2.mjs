import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const experiment = path.resolve(root, '..');
const modelPath = path.join(experiment, 'research', 'perspective-model-v0.1.json');
const outFlag = process.argv.indexOf('--out');
const outDir = outFlag >= 0 ? path.resolve(process.argv[outFlag + 1]) : path.join(root, 'generated');

const modelText = await readFile(modelPath, 'utf8');
const model = JSON.parse(modelText);
assert(model.schema === 'r4d.p0.perspective-model.v0.1', `Unexpected Research schema: ${model.schema}`);

const frame = { widthPx: 1536, heightPx: 1536, channels: ['R', 'G', 'B', 'A'] };
const anchorQ = [0.338, 0.453, 0.567, 0.681];
const scales = [0.939, 0.978, 1.018, 1.058];
const anchorIds = ['row-far', 'row-mid-far', 'row-mid-near', 'row-near'];
const anchors = anchorQ.map((q, index) => ({
  id: anchorIds[index],
  baseCenterNormalized: { p: null, q },
  baseCenterYPx: exactProduct(q, frame.heightPx),
  uniformScale: scales[index],
  horizontalPlacementStatus: 'deferred-until-L1-real-asset-components',
}));

const quadNormalized = model.selectedModel.fieldQuadNormalizedClockwise;
const quadPx = quadNormalized.map(([p, q]) => [exactProduct(p, frame.widthPx), exactProduct(q, frame.heightPx)]);
const seams = [
  {
    id: 'far-architecture-to-playable',
    q: model.frame.zonesNormalizedY.gamePlane[0],
    yPx: exactProduct(model.frame.zonesNormalizedY.gamePlane[0], frame.heightPx),
    fromNormalized: quadNormalized[0],
    toNormalized: quadNormalized[1],
    fromPx: quadPx[0],
    toPx: quadPx[1],
  },
  {
    id: 'near-playable-to-foreground',
    q: model.frame.zonesNormalizedY.gamePlane[1],
    yPx: exactProduct(model.frame.zonesNormalizedY.gamePlane[1], frame.heightPx),
    fromNormalized: quadNormalized[3],
    toNormalized: quadNormalized[2],
    fromPx: quadPx[3],
    toPx: quadPx[2],
  },
];

const contract = {
  schema: 'r4d.p0.layered-composition-contract.v2',
  status: 'contract-only-L1-and-final-series-closed',
  source: {
    baseCommit: 'e5892fbea71fbbfeb9f22e6a18f0f788cf9a1449',
    researchCommit: '627a9feb33cc6fdc8e63738ada13577752b9bf4a',
    conceptCommit: 'd38139573648f097bd04e1c833ffff9be467ff71',
    visualQaRubricCommit: '21150e583311e8688146a27fa48aaa8c41c8aaa8',
    builderV1Commit: '91716e4c488bdb118fc04c03dab7794f4dad6cbe',
    builderEolFixCommit: '0cc217d120597e1ec9f26cb2caa79e54d59386ba',
    researchModelSchema: model.schema,
    researchModelSha256: sha256(Buffer.from(modelText)),
  },
  frame,
  playablePlane: {
    coordinateConvention: 'normalized p=x/width, q=y/height; origin top-left',
    quadOrder: ['far-left', 'far-right', 'near-right', 'near-left'],
    quadNormalized,
    quadPx,
    seams,
    qToPixelY: { formula: 'yPx=q*1536', rounding: 'none; retain exact decimal product' },
  },
  repeatedVolumeFamily: {
    master: {
      count: 1,
      assetId: 'asset-rgba-master-assigned-by-Asset-before-L1',
      format: 'RGBA',
      requiredChannels: ['R', 'G', 'B', 'A'],
      status: 'not-yet-supplied; no placeholder permitted',
      reuseRule: 'all four instances reference the same master bytes',
    },
    anchors,
    scalingRule: 'uniform: scaleX=scaleY=uniformScale; no per-axis stretch and no per-instance master',
  },
  deterministicComposition: {
    randomness: 'forbidden',
    stableSortKeyAscending: ['baseCenter.q', 'baseCenter.p', 'instanceId'],
    painterDirection: 'far-to-near',
    layerOrder: [
      { order: 0, id: 'background-architecture' },
      { order: 100, id: 'playable-floor' },
      { order: 200, id: 'instances-back-to-front', perInstanceOrder: ['contact-shadow', 'rgba-master'] },
      { order: 300, id: 'foreground-architecture' },
    ],
    occlusionRule: 'each farther instance pair is fully drawn before the next nearer pair; foreground architecture draws after all instances',
    tieBreakRule: 'p must be fixed by L1 contract before build; then instanceId ascending is final stable tie-breaker',
  },
  contactShadows: {
    masterPolicy: 'one deterministic shadow recipe for the family',
    placement: 'shadow base-center equals its instance base-center anchor',
    scaling: 'shadow scaleX=shadow scaleY=the same instance uniformScale',
    zOrder: 'immediately before the corresponding rgba-master in the same sorted instance pair',
    independentOffsetOrScale: 'forbidden',
  },
  cleanOutput: {
    controlMarkersAllowed: false,
    forbiddenVisibleElements: ['control points', 'anchor dots', 'perspective grid', 'center axis', 'row labels', 'debug text', 'colored guide zones', 'wireframe guides'],
    technicalTemplatesAreInputsOnly: true,
  },
  tolerances: model.tolerances,
  gates: {
    current: 'contract-v2-only',
    l1Composite: 'closed-until-real-Asset-components',
    newImages: 'closed',
    finalSeries: 'closed',
  },
};

await mkdir(outDir, { recursive: true });
await writeFile(path.join(outDir, 'composition-contract-v2.json'), `${JSON.stringify(contract, null, 2)}\n`, 'utf8');
console.log(`Built deterministic composition contract v2 in ${outDir}`);

function exactProduct(a, b) { return Number((a * b).toFixed(6)); }
function sha256(buffer) { return createHash('sha256').update(buffer).digest('hex'); }
function assert(condition, message) { if (!condition) throw new Error(message); }
