import{access,cp,readFile,writeFile,mkdir}from'node:fs/promises';
import{createHash}from'node:crypto';
import{fileURLToPath}from'node:url';
import path from'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url)),out=path.join(root,'build/early-v02-04');
try{await access(out);throw new Error('Immutable garment04 already exists');}catch(e){if(e.code!=='ENOENT')throw e;}
const data=JSON.parse(await readFile(path.join(root,'art/parts.json')));
for(const id of['waistSeat','nearFlap','farFlap'])if(data.parts.filter(p=>p.id===id).length!==1)throw new Error(`Actual panel missing: ${id}`);
const body=JSON.parse(await readFile(new URL('./MATERIAL.json',import.meta.url)));
if(!body.bodyUnchanged||body.anchorErrors?.length)throw new Error('Body02 context or agreed anchor metadata differs');
await mkdir(out,{recursive:true});await cp(path.join(root,'build/site'),out,{recursive:true});
await cp(path.join(root,'app'),path.join(out,'source/app'),{recursive:true});
await cp(new URL('./',import.meta.url),path.join(out,'source/builder/early-v02-04'),{recursive:true});
const files=['art/parts.json',...data.parts.map(p=>`art/${p.file}`),'main.js'];
const hashes={};for(const f of files)hashes[f]=createHash('sha256').update(await readFile(path.join(out,f))).digest('hex');
for(const f of['MATRICES.json','MATERIAL.json','FIXTURES.json','AGREEMENT.md','NEUTRAL_RGBA.json'])await cp(new URL(`./${f}`,import.meta.url),path.join(out,f));
await writeFile(path.join(out,'GARMENT04.json'),JSON.stringify({version:data.version,scope:'3 whole panels; garment only; unchanged body02; no B',files:hashes},null,2)+'\n');
console.log(out);
