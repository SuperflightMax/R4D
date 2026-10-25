import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const binding=JSON.parse(fs.readFileSync(path.join(root,'snapshots/attempt03_runtime_c1/runtime/art-binding.json'),'utf8'));
const revisionPath='art/metadata/c1_landmark_revision.json';
const revision=JSON.parse(fs.readFileSync(path.join(root,revisionPath),'utf8'));
for(const side of ['near','far']){
 const id='hand_'+side,r=revision[id];
 if(JSON.stringify(binding.parts[id].offset)!==JSON.stringify(r.old_D))throw Error('Unexpected prior hand binding');
 binding.parts[id].offset=r.proposed_D;
}
binding.version='attempt03_runtime_c1_wrist';
binding.revisionMetadata=revisionPath;
binding.landmarkCorrection='Both hand wrist landmarks +8 raw Y, world wrists unchanged; identical PNG and runtime C1 deformation.';
fs.writeFileSync(path.join(root,'runtime/art-binding.json'),JSON.stringify(binding,null,2)+'\n');
console.log('Wrist revision applied to new runtime binding only.');
