import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {stripTypeScriptTypes} from 'node:module';
import {createHash} from 'node:crypto';

const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../../..');
const runtime='E:/R4D/perspective/p3-runtime/builder';
const output=path.resolve(process.argv[2]||path.join(runtime,'checkpoint-01'));
if(!output.startsWith(path.resolve(runtime)+path.sep))throw Error('Build output must be inside own runtime');
if(fs.existsSync(output))throw Error('Use a fresh output directory to preserve frozen bytes');
const p1deps='D:/dev/.codex-worktrees/r4d-p1-clean-repeat-01/lead/experiments/p1-collider-mapping/clean-repeat-01/viewer/node_modules';
const coreRepo='D:/dev/.codex-worktrees/r4d-p1-collider-mapping/millionko-source/lead';
const coreCommit='5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023';
const sha=b=>createHash('sha256').update(b).digest('hex');
const sourceCommit=execFileSync('git',['-C',repo,'rev-parse','HEAD'],{encoding:'utf8'}).trim();
if(execFileSync('git',['-C',repo,'status','--porcelain=v1','--','experiments/p3-masks/builder'],{encoding:'utf8'}).trim())throw Error('Commit Builder source before freezing');
const {rolldown}=await import(pathToFileURL(path.join(p1deps,'rolldown/dist/index.mjs')));
const rolldownVersion=JSON.parse(fs.readFileSync(path.join(p1deps,'rolldown/package.json'),'utf8')).version;
const pixiVersion=JSON.parse(fs.readFileSync(path.join(p1deps,'pixi.js/package.json'),'utf8')).version;
if(pixiVersion!=='8.22.0')throw Error('Pinned PixiJS version unavailable');
const nativeInputBlobs=new Set();
const plugin={
 name:'exact-native-core',
 resolveId(id,importer){
  if(id==='native-entry')return '\0native-entry';
  if(importer==='\0native-entry' && id.startsWith('./'))return '\0native/'+id.slice(2).replace(/\.js$/,'.ts');
  if(importer?.startsWith('\0native/') && id.startsWith('.'))return '\0native/'+path.posix.normalize(path.posix.join(path.posix.dirname(importer.slice(8)),id)).replace(/\.js$/,'.ts');
 },
 load(id){
  if(id==='\0native-entry')return 'export {createSimRunSession,stepSimRunSession,timeoutSimRunSession} from "./Sim.js";';
  if(id.startsWith('\0native/')){
   const file='packages/sim-core/src/'+id.slice(8);
   const exactBytes=execFileSync('git',['-C',coreRepo,'show',`${coreCommit}:${file}`]);
   nativeInputBlobs.add(createHash('sha1').update(Buffer.from(`blob ${exactBytes.length}\0`)).update(exactBytes).digest('hex'));
   const ts=exactBytes.toString('utf8');
   return stripTypeScriptTypes(ts,{mode:'transform',sourceMap:false});
  }
 }
};
fs.mkdirSync(output,{recursive:true});
const native=await rolldown({input:'native-entry',plugins:[plugin]});
await native.write({file:path.join(output,'native-core.js'),format:'esm',minify:true,sourcemap:false});
await native.close();
for(const name of ['index.html','app.js','run-model.js','style.css'])fs.copyFileSync(path.join(here,'src',name),path.join(output,name));
fs.mkdirSync(path.join(output,'data'));
for(const name of ['config.json','manifest.json','projection.json'])fs.copyFileSync(path.join(here,'inputs',name),path.join(output,'data',name));
fs.copyFileSync(path.join(here,'inputs/view-math.mjs'),path.join(output,'view-math.js'));
fs.mkdirSync(path.join(output,'vendor'));
const pixi=fs.readFileSync(path.join(p1deps,'pixi.js/dist/pixi.min.mjs'),'utf8').replace(/\/\/# sourceMappingURL=.*$/gm,'');
fs.writeFileSync(path.join(output,'vendor/pixi.js'),pixi);
fs.copyFileSync(path.join(p1deps,'pixi.js/LICENSE'),path.join(output,'vendor/PIXI-LICENSE.txt'));
const jungle=fs.readFileSync('K:/Agents/R4D/Assets/perspective/01-jungle.jpg');
if(sha(jungle)!=='c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72')throw Error('Jungle mismatch');
fs.mkdirSync(path.join(output,'assets'));
fs.writeFileSync(path.join(output,'assets/jungle.jpg'),jungle);
let artistSource=null;
if(process.env.P3_ARTIST_ASSETS){
 const artistAssets=path.resolve(process.env.P3_ARTIST_ASSETS);
 const assets=JSON.parse(fs.readFileSync(path.join(artistAssets,'assets.json'),'utf8'));
 fs.cpSync(artistAssets,path.join(output,'assets/artist'),{recursive:true});
 artistSource={commit:JSON.parse(fs.readFileSync(path.join(artistAssets,'handoff.json'),'utf8')).commit,contract:assets.schema};
}else{
 fs.mkdirSync(path.join(output,'assets/artist'));
 fs.writeFileSync(path.join(output,'assets/artist/assets.json'),JSON.stringify({schema:'r4d-p3-assets-v1',sourceSize:[1536,1536],occluders:[],status:'diagnostic: Artist handoff pending'},null,2));
}
const nativeProvenance={coreCommit,sourceTreeGitOid:execFileSync('git',['-C',coreRepo,'rev-parse',`${coreCommit}:packages/sim-core/src`],{encoding:'utf8'}).trim(),readMode:'exact Git objects; no source edits',inputGitBlobOids:[...nativeInputBlobs].sort(),nodeVersion:process.versions.node,typescriptTransform:'node:module stripTypeScriptTypes transform; sourceMap=false',bundler:`rolldown ${rolldownVersion}`,minify:true,compiledSha256:sha(fs.readFileSync(path.join(output,'native-core.js')))};
const meta={schema:'r4d-p3-build-v1',sourceCommit,coreCommit,nativeProvenance,p1Commit:'4b47db04c7140ebf88f69b91faa0b790d46f22ec',pixi:pixiVersion,artistSource,configSha256:sha(fs.readFileSync(path.join(output,'data/config.json'))),projectionSha256:sha(fs.readFileSync(path.join(output,'data/projection.json'))),builtAt:new Date().toISOString()};
fs.writeFileSync(path.join(output,'build.json'),JSON.stringify(meta,null,2)+'\n');
const catalog=JSON.parse(fs.readFileSync(path.join(here,'replay-catalog.json'),'utf8'));
const {makeRun,checkpoint}=await import(pathToFileURL(path.join(output,'run-model.js')));
fs.mkdirSync(path.join(output,'replays'));
const replayIndex={runs:[],frames:[]};
const runsBySeed=new Map();
for(const record of catalog.runs){
 const config=JSON.parse(fs.readFileSync(path.join(output,'data/config.json'),'utf8'));
 const run=makeRun(config,record.seed);runsBySeed.set(record.seed,run);
 const relative=`replays/seed-${record.seed}-tick-${run.lastTick}.json`;
 fs.writeFileSync(path.join(output,relative),JSON.stringify(checkpoint(run,run.lastTick,meta),null,2)+'\n');
 replayIndex.runs.push({...record,lastTick:run.lastTick,result:run.result,path:relative});
}
for(const record of catalog.frames){
 const run=runsBySeed.get(record.seed);
 const relative=`replays/seed-${record.seed}-tick-${record.tick}.json`;
 fs.writeFileSync(path.join(output,relative),JSON.stringify(checkpoint(run,record.tick,meta),null,2)+'\n');
 replayIndex.frames.push({...record,path:relative});
}
fs.writeFileSync(path.join(output,'replays/index.json'),JSON.stringify(replayIndex,null,2)+'\n');
const files=[];
function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,entry.name);if(entry.isDirectory())visit(full);else{const bytes=fs.readFileSync(full);files.push({path:path.relative(output,full).replaceAll('\\','/'),bytes:bytes.length,sha256:sha(bytes)});}}}
visit(output);files.sort((a,b)=>a.path.localeCompare(b.path));
fs.writeFileSync(path.join(output,'file-manifest.json'),JSON.stringify({schema:'r4d-p3-files-v1',sourceCommit,files},null,2)+'\n');
console.log(JSON.stringify({output,sourceCommit,files:files.length,totalBytes:files.reduce((n,f)=>n+f.bytes,0),manifestSha256:sha(fs.readFileSync(path.join(output,'file-manifest.json')))},null,2));
