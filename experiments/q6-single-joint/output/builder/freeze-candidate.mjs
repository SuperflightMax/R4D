import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(`${dir}/${e.name}`):[`${dir}/${e.name}`]);}
const runtime=['index.html','package.json','package-lock.json','vite.config.js',...files('src'),...files('public')];
const inputs=['FROZEN_CONTRACT.json','FROZEN_CONTRACT.sha256',...files('provenance/source'),...files('art'),...files('process')];
const record=paths=>paths.sort().map(file=>{const b=fs.readFileSync(file);return {file,bytes:b.length,sha256:hash(b)};});
const manifest={candidate:'q6-c1',frozenAtUTC:new Date().toISOString(),base:'f7b563db381078f90109bbf48946841809986217',runtime:record(runtime),immutableInputs:record(inputs)};
manifest.runtimeCount=manifest.runtime.length;manifest.inputCount=manifest.immutableInputs.length;manifest.runtimeBytes=manifest.runtime.reduce((s,x)=>s+x.bytes,0);manifest.inputBytes=manifest.immutableInputs.reduce((s,x)=>s+x.bytes,0);
const file='output/builder/q6-c1-files.json';if(fs.existsSync(file))throw new Error('Candidate already frozen; do not rewrite');
fs.writeFileSync(file,JSON.stringify(manifest,null,2)+'\n');console.log(JSON.stringify({file,sha256:hash(fs.readFileSync(file)),runtimeCount:manifest.runtimeCount,inputCount:manifest.inputCount,runtimeBytes:manifest.runtimeBytes,inputBytes:manifest.inputBytes}));
