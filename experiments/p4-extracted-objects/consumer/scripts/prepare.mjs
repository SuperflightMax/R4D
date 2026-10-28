import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs/promises';

const here = path.dirname(fileURLToPath(import.meta.url));
const consumer = path.resolve(here, '..');
const repo = path.resolve(consumer, '../../..');
const runtime = process.env.P4_RUNTIME;
const source = process.env.MILLIONKO_SOURCE;
if (!runtime || !source || !path.isAbsolute(runtime) || !path.isAbsolute(source)) throw new Error('Set absolute P4_RUNTIME and MILLIONKO_SOURCE');
const free = await fs.statfs(runtime);
if (free.bavail * free.bsize <= 2 * 1024**3) throw new Error('E/runtime <=2 GiB: checkpoint and stop');
if (free.bavail * free.bsize <= 4 * 1024**3) console.warn('WARNING: runtime <=4 GiB');
const name = process.env.P4_CANDIDATE || 'integration-01';
if (!/^[a-z0-9-]+$/.test(name)) throw new Error('Invalid candidate name');
const out = path.join(runtime, 'candidates', name);
await fs.mkdir(out, {recursive:true});
const require = createRequire(path.join(runtime, 'package.json'));
const {build} = require('esbuild');
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const git = (cwd,...args)=>execFileSync('git',['-C',cwd,...args]);
const coreCommit='5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023';
if (git(source,'rev-parse','HEAD').toString().trim() !== coreCommit) throw new Error('Wrong core commit');
if (git(source,'status','--porcelain','--','packages/sim-core').length) throw new Error('Core source is dirty');
const p1='4b47db04c7140ebf88f69b91faa0b790d46f22ec';
const root='experiments/p1-collider-mapping/clean-repeat-01/';
const fixed=[
 ['config.json','simulation/boards/01/trial-01/config.json','dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db'],
 ['p1-manifest.json','simulation/boards/01/trial-01/manifest.json','7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18'],
 ['projection.json','research/board01-projection.candidate-01.json','9ca9e520f1927426a3a5ba73a5eacaf90fedffc9385e7d08d5b1e6ee644b020c']
];
await fs.mkdir(path.join(out,'input'),{recursive:true});
const binding={p1Commit:p1,coreCommit};
for (const [file,gitPath,expected] of fixed) {
 const bytes=Buffer.from(git(repo,'show',`${p1}:${root}${gitPath}`).toString('utf8').replaceAll('\r\n','\n'));
 if(hash(bytes)!==expected)throw new Error(`Input hash mismatch: ${file}`);
 await fs.writeFile(path.join(out,'input',file),bytes);
 binding[file]=expected;
}
const original=await fs.readFile(process.env.P4_SOURCE_IMAGE || 'K:\\Agents\\R4D\\Assets\\perspective\\01-jungle.jpg');
if(hash(original)!=='c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72')throw new Error('Source image hash mismatch');
await fs.writeFile(path.join(out,'input','original.jpg'),original);
await fs.writeFile(path.join(out,'input','binding.json'),JSON.stringify(binding,null,2)+'\n');

// Only these common P1 helpers are reused; no P2/P3/P5/P6 input is read.
const shared=path.join(runtime,'shared-p1');
await fs.mkdir(shared,{recursive:true});
for (const [file,gitPath] of [['adapter.mjs','simulation/adapter.mjs'],['view-math.mjs','viewer/src/view-math.mjs'],['registration.mjs','viewer/src/registration.mjs'],['geometry.mjs','viewer/src/geometry.mjs']]) {
 await fs.writeFile(path.join(shared,file),git(repo,'show',`${p1}:${root}${gitPath}`));
}
const artCommit=process.env.P4_ART_COMMIT;
const artManifest=process.env.P4_ART_MANIFEST;
let art=null;
if(artCommit && artManifest){
 const raw=git(repo,'show',`${artCommit}:${artManifest}`);
 const manifest=JSON.parse(raw);
 if(manifest.schema!=='r4d.p4.art.v1')throw new Error('Unsupported art schema');
 const artDir=path.join(out,'art');await fs.mkdir(artDir,{recursive:true});
 const items=[manifest.background,...manifest.objects.flatMap(o=>o.parts),manifest.ball,manifest.shadow].filter(Boolean);
 for(const item of items){
  const relative=item.file;
  if(!relative || path.isAbsolute(relative) || relative.split(/[\\/]/).includes('..'))throw new Error('Art file must be relative');
  const bytes=git(repo,'show',`${artCommit}:${path.posix.join(path.posix.dirname(artManifest),relative)}`);
  if(hash(bytes)!==item.sha256)throw new Error(`Art hash mismatch: ${relative}`);
  const dest=path.join(artDir,relative);await fs.mkdir(path.dirname(dest),{recursive:true});await fs.writeFile(dest,bytes);
 }
 await fs.writeFile(path.join(artDir,'manifest.json'),raw);
 art={commit:artCommit,manifestSha256:hash(raw),version:manifest.version};
}
await fs.writeFile(path.join(out,'input','art-binding.json'),JSON.stringify(art,null,2)+'\n');
const alias={'@millionko/sim-core':path.join(source,'packages/sim-core/src/index.ts'),
 '@p1/adapter':path.join(shared,'adapter.mjs'),'@p1/math':path.join(shared,'view-math.mjs'),'@p1/registration':path.join(shared,'registration.mjs'),'@p1/geometry':path.join(shared,'geometry.mjs')};
const bundle=await build({entryPoints:[path.join(consumer,'src/main.mjs')],outfile:path.join(out,'app.js'),bundle:true,metafile:true,
 format:'esm',platform:'browser',target:'es2022',minify:true,sourcemap:false,legalComments:'none',
 nodePaths:[path.join(runtime,'node_modules')],alias});
// Native audit module is process-local, outside the served artifact.
await build({stdin:{contents:"export * from '@millionko/sim-core';",resolveDir:consumer},
 outfile:path.join(runtime,'native-check.mjs'),bundle:true,format:'esm',platform:'node',minify:true,sourcemap:false,alias});
await fs.copyFile(path.join(consumer,'index.html'),path.join(out,'index.html'));
await fs.copyFile(path.join(consumer,'style.css'),path.join(out,'style.css'));
await fs.mkdir(path.join(out,'licenses'),{recursive:true});
const pixi=path.join(runtime,'node_modules','pixi.js');
const meta=JSON.parse(await fs.readFile(path.join(pixi,'package.json'),'utf8'));
if(meta.version!=='8.22.0'||meta.license!=='MIT')throw new Error('PixiJS version/license mismatch');
await fs.copyFile(path.join(pixi,'LICENSE'),path.join(out,'licenses','pixi-MIT.txt'));
// Preserve bundled third-party notices without writing the native source map/metafile.
const packages=new Set();
for(const file of Object.keys(bundle.metafile.inputs)){
 const marker=file.replaceAll('\\','/').split('node_modules/').at(-1);
 if(marker===file.replaceAll('\\','/'))continue;
 const pieces=marker.split('/');packages.add(pieces[0].startsWith('@')?pieces.slice(0,2).join('/'):pieces[0]);
}
for(const name of packages){
 const dir=path.join(runtime,'node_modules',name);
 const licenses=(await fs.readdir(dir)).filter(n=>/^(LICENSE|LICENCE|COPYING|NOTICE)([.\-_]|$)/i.test(n));
 for(const file of licenses)await fs.copyFile(path.join(dir,file),path.join(out,'licenses',name.replace('/','-')+'-'+file));
}
const files=[];
async function walk(dir){for(const d of await fs.readdir(dir,{withFileTypes:true})){const file=path.join(dir,d.name);if(d.isDirectory())await walk(file);else if(d.name!=='artifact.json')files.push({file:path.relative(out,file).replaceAll('\\','/'),sha256:hash(await fs.readFile(file))});}}
await walk(out);files.sort((a,b)=>a.file.localeCompare(b.file));
const builderDirty=Boolean(git(repo,'status','--porcelain','--','experiments/p4-extracted-objects/consumer').length);
const artifact={schema:'r4d.p4.artifact.v1',name,builderCommit:git(repo,'rev-parse','HEAD').toString().trim(),builderDirty,binding,art,pixi:{version:meta.version,license:meta.license},files};
await fs.writeFile(path.join(out,'artifact.json'),JSON.stringify(artifact,null,2)+'\n');
console.log(JSON.stringify({candidate:name,output:out,artifactSha256:hash(await fs.readFile(path.join(out,'artifact.json'))),art,pixi:artifact.pixi}));
