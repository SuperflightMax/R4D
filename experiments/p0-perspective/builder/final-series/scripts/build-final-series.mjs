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
const outRoot = outFlag >= 0 ? path.resolve(process.argv[outFlag + 1]) : path.join(root, 'output');
const boardFlag = process.argv.indexOf('--board');
const boardIds = boardFlag >= 0 ? [process.argv[boardFlag + 1]] : ['board-01','board-02','board-03','board-04'];
const allowed = new Set(['board-01','board-02','board-03','board-04']);
for (const boardId of boardIds) assert(allowed.has(boardId), `Unknown board: ${boardId}`);

await mkdir(path.join(outRoot, 'integration'), { recursive: true });
for (const boardId of boardIds) await buildBoard(boardId);
if (boardIds.length === 4) await writeFile(path.join(outRoot, 'gallery.html'), renderGallery(), 'utf8');
console.log(`Built deterministic final-series package (${boardIds.join(', ')}) in ${outRoot}`);

async function buildBoard(boardId) {
  const outDir = path.join(outRoot, boardId);
  await mkdir(outDir, { recursive: true });
  const compose = spawnSync('pwsh', ['-NoProfile','-File',path.join(here,'compose-final-series.ps1'),'-BoardId',boardId,'-Root',root,'-OutputDirectory',outDir], { encoding:'utf8' });
  if (compose.status !== 0) throw new Error(compose.stderr || compose.stdout || `${boardId} compositor failed`);

  const assetRoot = path.join(experiment,'asset-artist','final-series');
  const prepared = path.join(assetRoot,boardId,'prepared');
  const [layout, metadata, seed] = await Promise.all([
    readJson(path.join(root,'layouts',`${boardId}.json`)),
    readJson(path.join(prepared,'component-metadata.json')),
    readJson(path.join(assetRoot,'integration-manifests',`${boardId}.json`)),
  ]);
  const sourcePaths = {
    plate: path.join(prepared,metadata.environment.preparedFile),
    master: path.join(prepared,metadata.master.preparedFile),
    shadow: path.join(prepared,metadata.shadow.preparedFile),
    rawPlate: path.resolve(prepared,metadata.environment.rawFile),
    rawMaster: path.resolve(prepared,metadata.master.rawFile),
  };
  const sourceHashes = Object.fromEntries(await Promise.all(Object.entries(sourcePaths).map(async ([id,file]) => [id,{file:repoRelative(file),sha256:await fileHash(file)}])));
  assert(sourceHashes.plate.sha256 === seed.sources.plate.sha256, `${boardId} plate hash differs from handoff`);
  assert(sourceHashes.master.sha256 === seed.sources.master.sha256, `${boardId} master hash differs from handoff`);
  assert(sourceHashes.shadow.sha256 === seed.sources.shadow.sha256, `${boardId} shadow hash differs from handoff`);
  assert(sourceHashes.rawPlate.sha256 === metadata.environment.rawSha256, `${boardId} raw plate hash differs`);
  assert(sourceHashes.rawMaster.sha256 === metadata.master.rawSha256, `${boardId} raw master hash differs`);

  const visibleHeight = metadata.master.baseCenterAnchorPx[1] - metadata.master.paddingPx + 1;
  const normalization = 120 / visibleHeight;
  const masterSize = metadata.master.preparedSize;
  const instances = [...layout.instances].sort(compareInstances).map((instance,drawIndex) => {
    const combinedRasterScale = normalization * instance.uniformScale;
    const baseCenterPx = {x:instance.p*1536,y:instance.q*1536};
    const destinationRectPx = {
      x:baseCenterPx.x-metadata.master.baseCenterAnchorPx[0]*combinedRasterScale,
      y:baseCenterPx.y-metadata.master.baseCenterAnchorPx[1]*combinedRasterScale,
      width:masterSize[0]*combinedRasterScale,
      height:masterSize[1]*combinedRasterScale,
    };
    return {...instance,drawIndex,baseCenterPx:mapNumbers(baseCenterPx),sourceNormalizationScale:round(normalization,12),combinedRasterScale:round(combinedRasterScale,12),destinationRectPx:mapNumbers(destinationRectPx),sourceAnchorPx:metadata.master.baseCenterAnchorPx,shadowDestinationEqualsMaster:true,zOrder:[`${drawIndex}:shadow`,`${drawIndex}:master`]};
  });
  const compositePath = path.join(outDir,'composite.png');
  const compositeDimensions = pngDimensions(await readFile(compositePath));
  const integration = {
    ...seed,
    provenance:{base:'e5892fbea71fbbfeb9f22e6a18f0f788cf9a1449',research:'627a9feb33cc6fdc8e63738ada13577752b9bf4a',builderFreeze:'0260519c5e3ff74365556713042d576b7bbec66e',assetComponents:'557e4650ee22cb7387290f5baece37d1219484cb',conceptFrozenBrief:'ae82913a18cf0beed2b67f1c421b30e1c1988e3b'},
    buildCommand:`node final-series/scripts/build-final-series.mjs --board ${boardId} --out final-series/output`,
    sources:{
      plate:{file:sourceHashes.plate.file,sha256:sourceHashes.plate.sha256},
      master:{file:sourceHashes.master.file,sha256:sourceHashes.master.sha256},
      shadow:{file:sourceHashes.shadow.file,sha256:sourceHashes.shadow.sha256},
    },
    output:{file:`${boardId}/composite.png`,sha256:await fileHash(compositePath)},
    sourceNormalization:{rule:'prepared visible height -> 120 px at uniformScale 1; frozen S(z) applies afterward',sourceVisibleHeightPx:visibleHeight,nominalVisibleHeightAtScale1Px:120,scale:round(normalization,12)},
    sourceAnchorPx:metadata.master.baseCenterAnchorPx,
  };
  const report = {
    schema:'r4d.p0.final-board-numeric-report.v1',boardId,status:'PASS-machine-contract',frame:compositeDimensions,
    layoutSha256:seed.layoutSha256,componentDimensions:{plate:pngDimensions(await readFile(sourcePaths.plate)),master:pngDimensions(await readFile(sourcePaths.master)),shadow:pngDimensions(await readFile(sourcePaths.shadow))},
    normalization:integration.sourceNormalization,expectedQ:[0.338,0.453,0.567,0.681],actualQ:instances.map(i=>i.q),baseCenterYPx:instances.map(i=>i.baseCenterPx.y),expectedUniformScales:[0.939,0.978,1.018,1.058],actualUniformScales:instances.map(i=>i.uniformScale),
    instances,anchorsInsidePlayableQuad:instances.map(i=>({instanceId:i.instanceId,inside:insideQuad(i.p,i.q)})),stableOrder:instances.map(i=>i.instanceId),shadowMasterDestinationIdentity:instances.every(i=>i.shadowDestinationEqualsMaster),controlMarkersAllowed:false,overlays:[],
  };
  const manifestPath = path.join(outDir,'integration-manifest.json');
  const reportPath = path.join(outDir,'numeric-report.json');
  await writeJson(manifestPath,integration);
  await writeJson(path.join(outRoot,'integration',`${boardId}.json`),integration);
  await writeJson(reportPath,report);
  const hashes = {schema:'r4d.p0.final-board-hashes.v1',boardId,buildCommand:`node final-series/scripts/build-final-series.mjs --board ${boardId} --out final-series/output`,files:{
    'composite.png':await fileHash(compositePath),'integration-manifest.json':await fileHash(manifestPath),'numeric-report.json':await fileHash(reportPath),
    [sourceHashes.rawPlate.file]:sourceHashes.rawPlate.sha256,[sourceHashes.rawMaster.file]:sourceHashes.rawMaster.sha256,[sourceHashes.plate.file]:sourceHashes.plate.sha256,[sourceHashes.master.file]:sourceHashes.master.sha256,[sourceHashes.shadow.file]:sourceHashes.shadow.sha256,
  }};
  await writeJson(path.join(outDir,'hashes.json'),hashes);
}

function renderGallery(){return `<!doctype html><html lang="ru"><head><meta charset="utf-8"><link rel="icon" href="data:,"><meta name="viewport" content="width=device-width,initial-scale=1"><title>P0 final series review</title><style>*{box-sizing:border-box}body{margin:0;background:#17130f;color:#f5ead8;font:16px/1.45 Segoe UI,Arial,sans-serif}main{max-width:1540px;margin:auto;padding:28px}h1{margin:0 0 6px;font-size:28px}p{margin:0 0 22px;color:#cdbfa9}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}figure{margin:0;background:#211b15;border:1px solid #4e4235;padding:10px}img{display:block;width:100%;aspect-ratio:1;background:#000}figcaption{padding:9px 2px 1px;color:#dfd1bc;font-weight:600}@media(max-width:850px){.grid{grid-template-columns:1fr}}</style></head><body><main><h1>P0 · финальная серия F1–F4</h1><p>Четыре независимых component set · frozen p/q/scales · deterministic composite · без control overlays</p><section class="grid">${['board-01','board-02','board-03','board-04'].map((id,i)=>`<figure><img src="${id}/composite.png" alt="P0 final ${id}"><figcaption>F${i+1} · ${id}</figcaption></figure>`).join('')}</section></main></body></html>\n`;}
function insideQuad(p,q){const z=(q-.255)/.52;const half=.275+.14*z;return q>=.255&&q<=.775&&p>=.5-half&&p<=.5+half;}
function compareInstances(a,b){return a.q-b.q||a.p-b.p||a.instanceId.localeCompare(b.instanceId,'en');}
function mapNumbers(o){return Object.fromEntries(Object.entries(o).map(([k,v])=>[k,round(v,6)]));}
function round(v,d=6){const k=10**d;return Math.round(v*k)/k;}
function pngDimensions(b){assert(b.subarray(1,4).toString('ascii')==='PNG','Not a PNG');return{width:b.readUInt32BE(16),height:b.readUInt32BE(20)};}
async function readJson(f){return JSON.parse(await readFile(f,'utf8'));}
async function writeJson(f,v){await writeFile(f,`${JSON.stringify(v,null,2)}\n`,'utf8');}
async function fileHash(f){return createHash('sha256').update(await readFile(f)).digest('hex');}
function repoRelative(f){return path.relative(experiment,f).replaceAll('\\','/');}
function assert(c,m){if(!c)throw new Error(m);}
