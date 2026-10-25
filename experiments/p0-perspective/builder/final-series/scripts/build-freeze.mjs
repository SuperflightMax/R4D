import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const builder = path.resolve(root, '..');
const outFlag = process.argv.indexOf('--out');
const outputFile = outFlag >= 0 ? path.resolve(process.argv[outFlag+1], 'freeze-manifest-v1.json') : path.join(root, 'freeze-manifest-v1.json');
const boardIds = ['board-01','board-02','board-03','board-04'];
const l1Hashes = JSON.parse(await readFile(path.join(builder,'l1','output','hashes-l1.json'),'utf8'));
const layouts = [];
for (const boardId of boardIds) {
  const file = path.join(root,'layouts',`${boardId}.json`);
  const bytes = await readFile(file);
  const layout = JSON.parse(bytes.toString('utf8'));
  layouts.push({boardId,file:`layouts/${boardId}.json`,sha256:hash(bytes),sourceSetId:layout.sourceSetId,p:layout.instances.map((i)=>i.p),instanceIds:layout.instances.map((i)=>i.instanceId)});
}
const freeze = {
  schema:'r4d.p0.final-series-freeze.v1',
  status:'four-layouts-frozen-before-images',
  contractV2Commit:'606737181da71457372b0f026b4d25cced68d4ee',
  frame:[1536,1536],
  quadNormalized:[[0.225,0.255],[0.775,0.255],[0.915,0.775],[0.085,0.775]],
  seams:[{q:0.255,yPx:391.68},{q:0.775,yPx:1190.4}],
  q:[0.338,0.453,0.567,0.681],
  scales:[0.939,0.978,1.018,1.058],
  baseCenterDefinition:'center of lowest visible base-contact edge beneath the object axis',
  assembly:{deterministic:true,sortKey:['q','p','instanceId'],direction:'far-to-near',perInstance:['shadow','master'],shadowAnchorScaleEqualsMaster:true,controlMarkersAllowed:false},
  layouts,
  forbiddenL1SourceHashes:{
    plate:l1Hashes.files['asset-artist/l1-components/prepared/environment-floor-plate-1536.png'],
    master:l1Hashes.files['asset-artist/l1-components/prepared/drum-master-rgba.png'],
    shadow:l1Hashes.files['asset-artist/l1-components/prepared/drum-shadow-rgba.png'],
  },
  gates:{layouts:'frozen',images:'not-created-by-this-checkpoint',boards:'not-assembled-by-this-checkpoint'}
};
await mkdir(path.dirname(outputFile),{recursive:true});
await writeFile(outputFile,`${JSON.stringify(freeze,null,2)}\n`,'utf8');
console.log(`Built four-layout freeze manifest: ${outputFile}`);
function hash(bytes){return createHash('sha256').update(bytes).digest('hex');}
