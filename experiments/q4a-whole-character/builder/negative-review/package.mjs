// Viewer packaging only: exact frozen bytes and selected saved arrays; no solver imports.
import fs from'node:fs/promises';import path from'node:path';import crypto from'node:crypto';import{fileURLToPath}from'node:url';import{createRequire}from'node:module';
import{build}from'esbuild';
const here=path.dirname(fileURLToPath(import.meta.url)),q=path.resolve(here,'../..'),repo=path.resolve(q,'../..');
const require=createRequire(import.meta.url),sharp=require('C:/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const mode=process.argv.includes('--freeze')?'freeze':'preview',snapshot=path.join(q,'build/negative-review-v01'),outRoot=mode==='freeze'?snapshot:path.join(here,'preview');
if(mode==='freeze'){try{await fs.access(snapshot);throw new Error('Immutable snapshot already exists; do not overwrite.');}catch(e){if(e.code!=='ENOENT')throw e;}}
const route='review/r4d/q4a-whole-character',out=path.join(outRoot,route),entries=[];
await fs.mkdir(out,{recursive:true});
const hash=b=>crypto.createHash('sha256').update(b).digest('hex'),read=async p=>JSON.parse(await fs.readFile(p,'utf8'));
const relative=p=>path.relative(repo,p).replaceAll('\\','/');
async function save(name,bytes){const p=path.join(out,name);await fs.mkdir(path.dirname(p),{recursive:true});await fs.writeFile(p,bytes);return hash(bytes);}
async function copy(origin,destination,expected){const bytes=await fs.readFile(origin),sha=hash(bytes);if(expected&&sha!==expected)throw new Error(`Origin hash changed: ${origin}`);await save(destination,bytes);entries.push({destination,origin:relative(origin),originSha256:sha,outputSha256:sha,transformation:'exact byte copy'});return sha;}
async function derived(name,bytes,origins,transformation){const sha=await save(name,bytes);entries.push({destination:name,origins,outputSha256:sha,transformation});}
const r1=path.join(q,'builder/early-v04-r1'),r2=path.join(q,'builder/early-v04-r2');
// Confirm the published R2 frozen manifest without executing any numeric code.
const approved=await read(path.join(r2,'R2_HASHES.json'));
for(const[name,sha]of Object.entries(approved.sha256)){if(hash(await fs.readFile(path.join(q,name)))!==sha)throw new Error(`Frozen research file changed: ${name}`);}
const catalogPath=path.join(q,'art/negative-review/SOURCE_CATALOG.json'),catalog=await read(catalogPath);
if(hash(await fs.readFile(catalogPath))!=='5063b713e700026d113b4e710e34cbb1cab0c28617e4901b07327eb5a6d75001')throw new Error('Frozen source catalog changed');
if(catalog.sources.length!==5)throw new Error('Expected five actual whole sources');
await copy(catalogPath,'data/source-catalog.json');
const wholes=[];
const humanStatus={
 'whole-v01':'v01: исходная поза не принята; готовность к полной нарезке не подтверждена. Личный обзор художника, без общей приёмки анимации.',
 'whole-v02':'v02: частично полезная правка, но условия подготовки полностью не выполнены. Личный обзор художника, без общей приёмки анимации.',
 'whole-v03':'v03: проверка исходной позы не пройдена — верхняя рука перекрывает майку, подошвы на разных уровнях.',
 'whole-v03-correction02':'v03, correction02: облегающие спортивные шорты приняты как образ, но исходная поза не прошла проверку. Рука перекрывает майку, разница подошв15px.',
 'whole-v04':'v04: исходная поза не прошла проверку. CTO разрешил отдельно проверить подготовку частей; это не означало приёмку исходной позы.'};
for(const item of catalog.sources){
 const origin=path.join(repo,item.originPath),asset=`assets/${item.id}.png`;
 await copy(origin,asset,item.sha256);const bytes=await fs.readFile(origin);
 const cuts=[['shoulder',[280,200,580,420]],['hip',[260,560,520,470]]];
 const assets={};
 for(const[name,[left,top,width,height]]of cuts){const dest=`assets/${item.id}-${name}.png`,png=await sharp(bytes).extract({left,top,width,height}).png().toBuffer();await derived(dest,png,[{origin:item.originPath,sha256:item.sha256}],`deterministic rectangular source crop [${left},${top},${width},${height}], no paint/mask/repair`);assets[name]=dest;}
 const review=`reports/${item.id}-source-review.md`;await copy(path.join(repo,item.reviewPath),review,item.reviewSHA256);
 wholes.push({id:item.id,label:item.nameRu.replace('pose guide','ориентиром позы'),asset,shoulderAsset:assets.shoulder,hipAsset:assets.hip,status:humanStatus[item.id],catalogStatus:`${item.statusRu} ${item.noteRu}`,shoulderNote:item.id==='whole-v04'?'Ближняя верхняя рука перекрывает майку ниже естественного крепления плеча; исходная поза не принята.':'Статическое увеличение выбранного рисунка. Оценка исходной позы указана над изображением.',origin:item.originPath,sha256:item.sha256,review,statusScope:item.statusScope});
}
const restPath=path.join(r1,'CAGE_REST.json'),resultPath=path.join(r2,'R2_RESULT.json'),failurePath=path.join(r2,'R2_FAILURE.json');
const rest=await read(restPath),result=await read(resultPath),failure=await read(failurePath);
if(result.result!=='R2_FAIL_STOP'||result.actualRuns!==1||result.outputs.length!==26||result.outputs.some((f,i)=>f.label!==`low-${i}`))throw new Error('Unexpected frozen R2 result');
const inputGeometry=await read(path.join(r1,'SOURCE_GEOMETRY.json'));
if(inputGeometry.low.drop!==230)throw new Error('Changed full range');
const evidence={version:'negative-review-v01',sourceCommit:'62a3b8cfd9599cc5d71e6433784c3661c5527a5f',wholes,
 rest:{vertices:rest.vertices,triangles:rest.triangles,constraints:rest.constraints},
 accepted:result.outputs.map(({label,low,vertices,minSingularValue,maxCondition,pinErrorPx})=>({label,low,vertices,minSingularValue,maxCondition,pinErrorPx})),
 rejected:{vertices:failure.witness.vertices,indices:failure.witness.indices,metrics:failure.witness.metrics,meta:failure.witness.meta,sourceTriangle:failure.witness.sourceTriangle},
 blockedCorrection01:{status:'OUTPUT_BLOCKED_NO_RAW',hasImage:false},interpolation:false};
await derived('data/evidence.json',Buffer.from(JSON.stringify(evidence)),await Promise.all([restPath,resultPath,failurePath,catalogPath].map(async p=>({origin:relative(p),sha256:hash(await fs.readFile(p))}))),
 'lossless JSON projection of saved rest and 26 exact outputs; selected rejected candidate kept separately; no optimization, interpolation, new poses or vertex rounding');
await copy(path.join(r1,'inputs03/materials/hip_shorts.png'),'assets/hip-texture.png');
for(const[origin,dest]of[[path.join(r1,'CAGE_FAILURE.png'),'assets/r1-witness.png'],[path.join(r2,'R2_WITNESS.png'),'assets/r2-witness.png'],[path.join(r1,'GEOMETRY_FEASIBILITY.png'),'assets/leg-chain-feasibility.png'],[path.join(r1,'RESULT.md'),'reports/r1-result.md'],[path.join(r2,'RESULT.md'),'reports/r2-result.md'],[path.join(r2,'EXECUTION_CAPTURE_AUDIT.md'),'reports/capture-audit.md'],[path.join(q,'CTO_STOP_DECISION.md'),'reports/cto-stop.md'],[path.join(q,'CLOSURE.md'),'reports/closure.md']])await copy(origin,dest);
for(const name of['index.html','viewer.css'])await copy(path.join(q,'app/negative-review',name),name);
const appPath=path.join(q,'app/negative-review/viewer.mjs');
await build({entryPoints:[appPath],outfile:path.join(out,'viewer.js'),bundle:true,minify:true,format:'esm',target:['es2022'],charset:'utf8',legalComments:'eof'});
entries.push({destination:'viewer.js',origin:relative(appPath),originSha256:hash(await fs.readFile(appPath)),outputSha256:hash(await fs.readFile(path.join(out,'viewer.js'))),transformation:'esbuild bundle, pixi.js8.14.3 local dependency; no solver/runtime-motion imports'});
const provenance={version:'negative-review-v01',sourcePackageCommit:evidence.sourceCommit,researchManifestSha256:hash(await fs.readFile(path.join(r2,'R2_HASHES.json'))),route:`/${route}/`,scope:'frozen evidence viewer, no solve/art/repair/full character motion',entries};
await save('source-manifest.json',JSON.stringify(provenance,null,2)+'\n');
async function list(dir){const result=[];for(const e of await fs.readdir(dir,{withFileTypes:true})){const p=path.join(dir,e.name);if(e.isDirectory())result.push(...await list(p));else result.push(p);}return result;}
const files={};for(const p of(await list(out)).sort()){const name=path.relative(out,p).replaceAll('\\','/');if(name!=='build-manifest.json')files[name]={sha256:hash(await fs.readFile(p)),bytes:(await fs.stat(p)).size};}
const buildManifest={version:'negative-review-v01',route:`/${route}/`,selfHashExcluded:true,sourceManifestSha256:files['source-manifest.json'].sha256,files};
await save('build-manifest.json',JSON.stringify(buildManifest,null,2)+'\n');
const summary={version:'negative-review-v01',mode,route:`/${route}/`,entry:`${route}/index.html`,buildManifestSha256:hash(await fs.readFile(path.join(out,'build-manifest.json'))),sourceManifestSha256:files['source-manifest.json'].sha256,acceptedOutputs:26,rejectedIsSeparate:true,interpolation:false,sourceWholeCount:5,files:Object.keys(files).length};
await fs.writeFile(path.join(outRoot,'SNAPSHOT.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({...summary,path:outRoot},null,2));
