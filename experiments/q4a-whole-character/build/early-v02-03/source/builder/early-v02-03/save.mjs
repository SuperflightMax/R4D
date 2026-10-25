import{build}from'esbuild';
import{access,mkdir,copyFile,cp,readFile,writeFile}from'node:fs/promises';
import{fileURLToPath}from'node:url';
import{createHash}from'node:crypto';
import path from'node:path';
const root=fileURLToPath(new URL('../../',import.meta.url));
const out=path.join(root,'build/early-v02-03');
try{await access(out);throw new Error('Stage A immutable snapshot already exists');}catch(e){if(e.code!=='ENOENT')throw e;}
await mkdir(out,{recursive:true});
await build({entryPoints:[path.join(root,'app/topology-main.mjs')],bundle:true,format:'esm',outfile:path.join(out,'main.js'),sourcemap:true});
await copyFile(path.join(root,'app/topology.html'),path.join(out,'index.html'));
await copyFile(path.join(root,'app/style.css'),path.join(out,'style.css'));
for(const file of['stage-a-input.json','STAGE_A.json','source-geometry.json','coverage.png','coverage-owners.json','GEOMETRY_AGREEMENT.md','RESULT.md'])
  await copyFile(new URL(`./${file}`,import.meta.url),path.join(out,file));
const input=JSON.parse(await readFile(new URL('./stage-a-input.json',import.meta.url)));
const texture=`art/${input.source.file}`;
await mkdir(path.dirname(path.join(out,texture)),{recursive:true});
await copyFile(path.join(root,'build/early-v02-02',texture),path.join(out,texture));
await cp(path.join(root,'art/early-v02-03'),path.join(out,'art/early-v02-03'),{recursive:true});
await cp(path.join(root,'app'),path.join(out,'source/app'),{recursive:true});
await cp(new URL('./',import.meta.url),path.join(out,'source/builder/early-v02-03'),{recursive:true});
const hashes={};
for(const file of['main.js','stage-a-input.json','STAGE_A.json','source-geometry.json','art/early-v02-03/CLOTH_TRACE.json',texture])
  hashes[file]=createHash('sha256').update(await readFile(path.join(out,file))).digest('hex');
await writeFile(path.join(out,'STAGE_A_SNAPSHOT.json'),JSON.stringify({scope:'A only; no B/repair/full candidate',result:input.report.result,files:hashes},null,2)+'\n');
console.log(out);
