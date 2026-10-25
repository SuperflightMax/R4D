import { cp, access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root=fileURLToPath(new URL('../../',import.meta.url));
const out=path.join(root,'build/early-v02-02');
try {await access(out);throw new Error('Immutable after already exists; never overwrite');}
catch(e){if(e.code!=='ENOENT')throw e;}
const raw=await readFile(path.join(root,'art/parts.json'));
const data=JSON.parse(raw);
if(!data.parts.every(p=>p.file.startsWith('early-v02-02/')))throw new Error('Correction 02 input not ready');
const measures=JSON.parse(await readFile(new URL('./measurements.json',import.meta.url)));
if(createHash('sha256').update(raw).digest('hex')!==measures.contractSha256)throw new Error('Measurements differ from current input');
await mkdir(out,{recursive:true});
await cp(path.join(root,'build/site'),out,{recursive:true});
await cp(path.join(root,'app'),path.join(out,'source/app'),{recursive:true});
await cp(new URL('./measurements.json',import.meta.url),path.join(out,'measurements.json'));
await cp(new URL('./sole-contours.json',import.meta.url),path.join(out,'sole-contours.json'));
const hash=async p=>createHash('sha256').update(await readFile(p)).digest('hex');
const files=['art/parts.json',`art/${data.source}`,...data.parts.map(p=>`art/${p.file}`),'app/main.mjs','app/motion.mjs','app/support.mjs','app/cloth.mjs'];
const hashes=Object.fromEntries(await Promise.all(files.map(async f=>[f,await hash(path.join(root,f))])));
if(await hash(path.join(out,'art/parts.json'))!==measures.contractSha256)throw new Error('Built snapshot has another contract; do not publish');
await writeFile(path.join(out,'AFTER.json'),JSON.stringify({version:data.version,scope:'EARLY_V02_02 neutral/low only',files:hashes},null,2)+'\n');
console.log(out);
