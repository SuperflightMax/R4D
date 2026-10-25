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
const port=Number(process.argv[3]||4323);
fs.writeFileSync(path.join(target,'README.md'),`# Q2A ${name}\n\nP2 full-motion; pending personal reviews and CTO gate. No independent QA or release approval.\n\nFrom this snapshot directory, Node.js only (PowerShell):\n\n$env:Q2A_PORT='${port}'\nnode runtime/server.mjs\n\nhttp://127.0.0.1:${port}/runtime/\n\nVendor, PNG, metadata and raw sources included; npm ci/build/network not needed.\nIdle, low, walk, jump; landing selection in flight; pause and history scrub.\n`);
fs.writeFileSync(path.join(target,'SNAPSHOT.md'),`# Q2A ${name}\n\nPreserved ${new Date().toISOString()}. ${binding.status}.\n\nFrom this snapshot directory (PowerShell):\n\n$env:Q2A_PORT='${port}'\nnode runtime/server.mjs\n\nOpen http://127.0.0.1:${port}/runtime/. PixiJS, all used PNG dependencies, metadata and raw sources are included; npm ci/build/network not needed.\nNamed baseline/candidate, no artistic or independent QA PASS. Do not overwrite this snapshot.\n`);
console.log(target);
