import{readFile,writeFile}from'node:fs/promises';
import{createHash}from'node:crypto';
import{fileURLToPath}from'node:url';
import path from'node:path';
import{PANEL_ANCHORS}from'../../app/panel-transform.mjs';
const root=fileURLToPath(new URL('../../',import.meta.url));
const read=async p=>JSON.parse(await readFile(path.join(root,p)));
const hash=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
const data=await read('art/parts.json'),before=await read('build/early-v02-02/art/parts.json');
const ids=['waistSeat','nearFlap','farFlap'];
for(const id of ids)if(data.parts.filter(p=>p.id===id).length!==1)throw new Error(`Garment04 not ready: ${id}`);
if(data.parts.some(p=>p.id==='pelvis'))throw new Error('Old garment still present');
const rows=[];
const anchorErrors=[];
for(const id of['nearFlap','farFlap']){
 const actual=data.parts.find(p=>p.id===id).garmentPanel?.anchors?.map(a=>a.source);
 if(JSON.stringify(actual)!==JSON.stringify(PANEL_ANCHORS[id]))anchorErrors.push({panel:id,agreed:PANEL_ANCHORS[id],actual});
}
for(const old of before.parts.filter(p=>p.id!=='pelvis')){
 const current=data.parts.find(p=>p.id===old.id);if(!current)throw new Error(`Missing unchanged body ${old.id}`);
 const originalHash=await hash(path.join(root,'build/early-v02-02/art',old.file));
 const currentHash=await hash(path.join(root,'art',current.file));
 const metadataEqual=['from','to','z'].every(k=>old[k]===current[k])&&JSON.stringify(old.cropRect)===JSON.stringify(current.cropRect);
 rows.push({id:old.id,originalHash,currentHash,bytesEqual:originalHash===currentHash,metadataEqual});
}
const result={version:data.version,bodyUnchanged:rows.every(r=>r.bytesEqual&&r.metadataEqual),anchorErrors,rows,
 garment:await Promise.all(data.parts.filter(p=>ids.includes(p.id)).map(async p=>({id:p.id,file:p.file,crop:p.cropRect,sha256:await hash(path.join(root,'art',p.file))}))),
 note:'Source-neutral RGBA/visible ownership and transformed seam quality are separate checks'};
await writeFile(new URL('./MATERIAL.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({version:data.version,bodyUnchanged:result.bodyUnchanged,anchorErrors,panels:result.garment},null,2));
if(!result.bodyUnchanged||anchorErrors.length)process.exitCode=1;
