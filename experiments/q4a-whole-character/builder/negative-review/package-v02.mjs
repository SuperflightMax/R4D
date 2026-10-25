// One editorial-only successor. Every data/art/report/CSS byte comes from immutable v01.
import fs from'node:fs/promises';import path from'node:path';import crypto from'node:crypto';import{fileURLToPath}from'node:url';import{build}from'esbuild';
const here=path.dirname(fileURLToPath(import.meta.url)),q=path.resolve(here,'../..'),oldRoot=path.join(q,'build/negative-review-v01'),newRoot=path.join(q,'build/negative-review-v02'),stage=path.join(here,'editorial-v02/stage-verified');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
for(const p of[newRoot,stage]){try{await fs.access(p);throw new Error(`Refuse overwrite: ${p}`);}catch(e){if(e.code!=='ENOENT')throw e;}}
const oldTree=await read(path.join(here,'SNAPSHOT_TREE_SHA256_V01.json'));
for(const[p,sha]of Object.entries(oldTree.files))if(hash(await fs.readFile(path.join(oldRoot,p)))!==sha)throw new Error(`v01 changed: ${p}`);
await fs.cp(oldRoot,stage,{recursive:true,errorOnExist:true,force:false});
const route='review/r4d/q4a-whole-character',leaf=path.join(stage,route),oldLeaf=path.join(oldRoot,route),app=path.join(q,'app/negative-review');
await fs.copyFile(path.join(app,'index.html'),path.join(leaf,'index.html'));
await build({entryPoints:[path.join(app,'viewer.mjs')],outfile:path.join(leaf,'viewer.js'),bundle:true,minify:true,format:'esm',target:['es2022'],charset:'utf8',legalComments:'eof'});
const source=await read(path.join(oldLeaf,'source-manifest.json'));source.version='negative-review-v02';
for(const item of source.entries){
 if(item.destination==='index.html'){item.originSha256=hash(await fs.readFile(path.join(app,'index.html')));item.outputSha256=hash(await fs.readFile(path.join(leaf,'index.html')));}
 if(item.destination==='viewer.js'){item.originSha256=hash(await fs.readFile(path.join(app,'viewer.mjs')));item.outputSha256=hash(await fs.readFile(path.join(leaf,'viewer.js')));}
}
await fs.writeFile(path.join(leaf,'source-manifest.json'),JSON.stringify(source,null,2)+'\n');
const manifest=await read(path.join(oldLeaf,'build-manifest.json'));manifest.version='negative-review-v02';
for(const name of Object.keys(manifest.files)){const bytes=await fs.readFile(path.join(leaf,name));manifest.files[name]={sha256:hash(bytes),bytes:bytes.length};}
manifest.sourceManifestSha256=hash(await fs.readFile(path.join(leaf,'source-manifest.json')));
await fs.writeFile(path.join(leaf,'build-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
const summary=await read(path.join(oldRoot,'SNAPSHOT.json'));summary.version='negative-review-v02';summary.buildManifestSha256=hash(await fs.readFile(path.join(leaf,'build-manifest.json')));summary.sourceManifestSha256=manifest.sourceManifestSha256;
await fs.writeFile(path.join(stage,'SNAPSHOT.json'),JSON.stringify(summary,null,2)+'\n');
const allowed=new Set(['SNAPSHOT.json',`${route}/index.html`,`${route}/viewer.js`,`${route}/source-manifest.json`,`${route}/build-manifest.json`]),changed=[],unchanged=[];
for(const[p,sha]of Object.entries(oldTree.files)){const sha2=hash(await fs.readFile(path.join(stage,p))),name=p.replaceAll('\\','/');if(sha!==sha2){if(!allowed.has(name))throw new Error(`Non-editorial change: ${p}`);changed.push(name);}else unchanged.push(name);}
const oldCode=await fs.readFile(path.join(here,'editorial-v02/v01-source/app/negative-review/viewer.mjs'),'utf8'),newCode=await fs.readFile(path.join(app,'viewer.mjs'),'utf8');
if(newCode!==oldCode.replace('${data.version}','${manifest.version}'))throw new Error('Viewer logic changed beyond version-display metadata');
await fs.cp(stage,newRoot,{recursive:true,errorOnExist:true,force:false});
for(const[p,sha]of Object.entries(oldTree.files))if(hash(await fs.readFile(path.join(oldRoot,p)))!==sha)throw new Error('v01 modified');
const diff={version:'negative-review-v02',kind:'editorial-only',changedFiles:changed,unchangedFiles:unchanged,
 changes:['Header: Локальный просмотр · v01 → Просмотр свидетельств · v02','Footer: R4D · Q4A · Просмотр свидетельств · v02','Conclusion: remove time-dependent pending acceptance/release sentence; show stable negative/partial research statement','Version details: read snapshot label from source-manifest.version; saved data remains byte-identical'],
 controlsAndRenderingLogicUnchanged:true,allDataAssetsReportsCSSByteIdentical:true,v01All37FilesUnchanged:true,
 dataProjectionVersionRetained:'negative-review-v01 identifies unchanged frozen dataset; current snapshot UI uses manifest v02',
 buildManifestSha256:summary.buildManifestSha256,sourceManifestSha256:summary.sourceManifestSha256};
await fs.writeFile(path.join(here,'editorial-v02/CONTENT_DIFF.json'),JSON.stringify(diff,null,2)+'\n');
console.log(JSON.stringify({...diff,path:newRoot},null,2));
