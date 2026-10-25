import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const root=fileURLToPath(new URL('.',import.meta.url));
const publicRoot=path.join(root,'route-tree');
const manifestBytes=fs.readFileSync(path.join(root,'provenance.json'));
const manifest=JSON.parse(manifestBytes);
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const gitBlob=entry=>execFileSync('git',['show',`${entry.source.commit}:${entry.source.path}`],{cwd:root,maxBuffer:4*1024*1024});
const visit=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?visit(path.join(dir,e.name)):[path.relative(publicRoot,path.join(dir,e.name)).replaceAll('\\','/')]);
const disk=visit(publicRoot).sort(),listed=manifest.files.map(f=>f.path).sort();
if(JSON.stringify(disk)!==JSON.stringify(listed))throw Error('Unexpected or missing public file');
let total=0;
for(const entry of manifest.files){
 const bytes=fs.readFileSync(path.join(publicRoot,entry.path));total+=bytes.length;
 if(bytes.length!==entry.bytes||sha(bytes)!==entry.sha256)throw Error('Manifest mismatch '+entry.path);
 const original=gitBlob(entry);if(sha(original)!==entry.source.sha256)throw Error('Source mismatch');
 if(entry.mode==='exact_git_blob'&&!bytes.equals(original))throw Error('Nonidentical copy '+entry.path);
 const response=await fetch(`http://127.0.0.1:4340/${entry.path}`);
 if(response.status!==200||sha(Buffer.from(await response.arrayBuffer()))!==entry.sha256)throw Error('HTTP mismatch '+entry.path);
}
if(total!==manifest.totalBytes)throw Error('Total mismatch');
const bindingEntry=manifest.files.find(f=>f.path.endsWith('/runtime/art-binding.json'));
const binding=JSON.parse(fs.readFileSync(path.join(publicRoot,bindingEntry.path)));
const originalBinding=JSON.parse(gitBlob(bindingEntry));
for(const key of ['version','scale','translation','rig'])if(JSON.stringify(binding[key])!==JSON.stringify(originalBinding[key]))throw Error('Changed runtime data '+key);
for(const [id,part] of Object.entries(binding.parts))for(const key of ['crop','offset','layer'])if(JSON.stringify(part[key])!==JSON.stringify(originalBinding.parts[id][key]))throw Error('Changed part '+id+' '+key);
const denied=['runtime/server.mjs','runtime/check-full-motion.mjs','runtime/c1-comparison.html','runtime/vendor/pixi.min.js.map','art/source/attempt03_raw.png','art/metadata/c1_arms01.json','provenance.json'];
for(const filename of denied){const response=await fetch('http://127.0.0.1:4340'+manifest.route+filename);if(response.status!==404)throw Error('Nonpublic resource exposed '+filename)}
for(const entry of manifest.files.filter(f=>/\.(js|json|html|css|txt)$/.test(f.path))){const text=fs.readFileSync(path.join(publicRoot,entry.path),'utf8');if(/sourceMappingURL=|D:\\dev|C:\\Users|\/Users\/|window\.q2a|id="surface"|id="guides"/.test(text))throw Error('Private/debug residue '+entry.path)}
console.log(JSON.stringify({publicFiles:disk.length,bytes:total,httpExactFiles:listed.length,excludedResources404:denied.length,rigAndPartNumbersUnchanged:true,manifestSha256:sha(manifestBytes)},null,2));
