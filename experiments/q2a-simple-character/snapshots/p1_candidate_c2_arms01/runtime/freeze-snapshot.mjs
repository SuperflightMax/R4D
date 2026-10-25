import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const name=process.argv[2];
if(!/^[a-z0-9_]+$/.test(name||''))throw Error('Supply a lowercase snapshot name');
const target=path.join(root,'snapshots',name);
if(fs.existsSync(target))throw Error('Snapshot already exists; preservation forbids overwriting');
fs.mkdirSync(target,{recursive:true});
for(const filename of ['runtime','package.json','package-lock.json','README.md'])fs.cpSync(path.join(root,filename),path.join(target,filename),{recursive:true});
const binding=JSON.parse(fs.readFileSync(path.join(root,'runtime/art-binding.json'),'utf8'));
for(const part of Object.values(binding.parts)){
 const relative=part.url.replace(/^\//,'');const destination=path.join(target,relative);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(path.join(root,relative),destination);
}
const metadata=JSON.parse(fs.readFileSync(path.join(root,binding.sourceMetadata),'utf8'));
const rawSources=metadata.sources||[metadata.source];
for(const relative of new Set([binding.sourceMetadata,...rawSources.map(source=>path.posix.normalize(path.posix.dirname(binding.sourceMetadata)+'/'+source)),...(binding.revisionMetadata?[binding.revisionMetadata]:[])])){
 const destination=path.join(target,relative);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.copyFileSync(path.join(root,relative),destination);
}
fs.writeFileSync(path.join(target,'SNAPSHOT.md'),`# Q2A ${name}\n\nPreserved ${new Date().toISOString()}. ${binding.status}.\n\nRun from this directory: Q2A_PORT=4323 node runtime/server.mjs (PowerShell: $env:Q2A_PORT='4323'; node runtime/server.mjs).\nOpen http://127.0.0.1:4323/runtime/. PixiJS and all used PNG dependencies are included.\nNo walk/jump, no artistic or independent QA PASS. Do not overwrite this snapshot.\n`);
console.log(target);
