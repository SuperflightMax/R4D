// Runtime staging only: byte copies; no decoding, cropping or art processing.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const root=process.cwd();
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const contractBytes=fs.readFileSync(path.join(root,'FROZEN_CONTRACT.json'));
if(hash(contractBytes)!=='e1dbd83ca86f2c723c5ec51fc97fb85aa06236c88c628c728893005ca284380a')throw new Error('Frozen contract changed');
const contract=JSON.parse(contractBytes);
const sourceOnly=process.argv.includes('--source-only');
let artManifest;
if(!sourceOnly){
 const raw=fs.readFileSync(path.join(root,'process/M2/art-output-manifest.json'));
 if(hash(raw)!=='78bffb5f7311affdb5d6eaee7cc6c05bc44c756f845f84bb0e1692740d89f726')throw new Error('Artist manifest changed');
 artManifest=JSON.parse(raw);
 for(const [file,expected] of Object.entries(artManifest)){
  const bytes=fs.readFileSync(path.join(root,file));
  if(hash(bytes)!==expected.sha256)throw new Error(`Artist hash mismatch ${file}`);
  if(bytes.toString('hex',0,8)!=='89504e470d0a1a0a'||bytes.readUInt32BE(16)!==expected.size[0]||bytes.readUInt32BE(20)!==expected.size[1])throw new Error(`PNG size mismatch ${file}`);
 }
}
const variants={};
for(const id of sourceOnly?['J0']:['J0','J1','J2','M1','M2']){
  const dir=sourceOnly?'provenance/source/assets/parts':`art/${id}`;
  const files=fs.readdirSync(path.join(root,dir));
  const entry={};
  for(const part of ['thigh','shin',...(id==='J2'?['overlay']:[])]){
    const matches=files.filter(f=>f.endsWith('.png')&&(part==='overlay'?/overlay|kneepad|pad/i.test(f):f.toLowerCase().includes(part)));
    if(matches.length!==1)throw new Error(`Need exactly one ${id}/${part}: ${matches}`);
    const source=`${dir}/${matches[0]}`,bytes=fs.readFileSync(path.join(root,source));
    if(id==='J0'&&hash(bytes)!==contract.source.sha256[`assets/parts/${part}_near.png`])throw new Error('J0 must equal original');
    const file=`art/${id}/${matches[0]}`;fs.mkdirSync(path.join(root,'public',`art/${id}`),{recursive:true});fs.writeFileSync(path.join(root,'public',file),bytes);
    entry[part]={file,source,sha256:hash(bytes),bytes:bytes.length};
  }
  variants[id]=entry;
}
const notes={J0:'Исходные замкнутые тёмные торцы.',J1:'M2: торцы заменены тканью; бедро укоротилось, покрытие потеряно.',J2:'Точная подложка J1; узкая наклонная накладка из master, полнота покрытия не гарантирована.',M1:'Неудачный открытый край: полые торцы, дрейф, обрезание бедра.',M2:'Raw: 71 437 изменённых RGBA вне масок; final: 0 после композиции агента. Потеря покрытия внутри масок сохранена.'};
for(const [id,entry] of Object.entries(variants))entry.note=notes[id];
if(!sourceOnly)for(const part of ['thigh','shin']){
 if(variants.J1[part].sha256!==variants.M2[part].sha256||variants.J2[part].sha256!==variants.J1[part].sha256)throw new Error('J1=M2=J2 underlay violated');
}
const manifest={schema:'q6-runtime-inputs-v1',stage:sourceOnly?'scaffold-source-only':'candidate',contractSHA256:hash(contractBytes),artistManifestSHA256:sourceOnly?null:'78bffb5f7311affdb5d6eaee7cc6c05bc44c756f845f84bb0e1692740d89f726',variants};
fs.mkdirSync(path.join(root,'public/art'),{recursive:true});fs.writeFileSync(path.join(root,'public/art/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify(manifest,null,2));
