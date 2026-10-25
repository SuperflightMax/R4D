// Explicit adapter from Asset's unchanged measured handoff; no image editing.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const source=process.argv[2]||'art/metadata/attempt03_initial.json';
const input=JSON.parse(fs.readFileSync(path.join(root,source),'utf8'));
const p=input.parts;
const rig={pelvis:p.body.proposed_bind_landmarks_A.pelvis,neck:p.body.proposed_bind_landmarks_A.neck,waist:p.body.proposed_bind_landmarks_A.waist,ground:p.foot_near.proposed_bind_landmarks_A.heel_contact[1]};
for(const side of ['near','far'])rig[side]={...p['leg_'+side].proposed_bind_landmarks_A,...p['arm_'+side].proposed_bind_landmarks_A};
const parts={};
for(const [id,part]of Object.entries(p))parts[id]={url:'/art/'+path.posix.normalize('metadata/'+part.png),crop:part.crop_U,offset:part.D,layer:part.layer};
const output={version:process.argv[3]||'attempt03_initial',artVersion:input.version||'attempt03_initial',sourceMetadata:source,status:input.status,scale:input.transform.s,translation:input.transform.t,rig,parts,knownDeviations:input.contract_revision_required};
fs.writeFileSync(path.join(root,'runtime/art-binding.json'),JSON.stringify(output,null,2)+'\n');
console.log('Wrote runtime/art-binding.json; source metadata and PNG unchanged.');
