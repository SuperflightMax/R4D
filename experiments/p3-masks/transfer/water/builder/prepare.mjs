import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash,randomBytes} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url));
const repo=execFileSync('git',['-C',here,'rev-parse','--show-toplevel'],{encoding:'utf8'}).trim();
const spec=JSON.parse(fs.readFileSync(path.join(here,'transfer.json'),'utf8'));
const read=(rev,p)=>execFileSync('git',['-C',repo,'show',`${rev}:${p}`]);
const sha=b=>createHash('sha256').update(b).digest('hex');
const base=`${spec.p1Prefix}simulation/boards/${spec.p1Board}/trial-${spec.trial}/`;
fs.mkdirSync(path.join(here,'inputs'),{recursive:true});
const records=[['config.json',base+'config.json',spec.configSha256],['manifest.json',base+'manifest.json',spec.manifestSha256],['projection.json',`${spec.p1Prefix}research/board${spec.p1Board}-projection.candidate-${spec.projectionCandidate}.json`,spec.projectionSha256],['view-math.mjs',spec.p1Prefix+'viewer/src/view-math.mjs',null]];
for(const [name,source,expected]of records){const bytes=read(spec.p1Commit,source);if(expected&&sha(bytes)!==expected)throw Error(`Input mismatch: ${source}`);fs.writeFileSync(path.join(here,'inputs',name),bytes);console.log(JSON.stringify({board:spec.board,path:source,sha256:sha(bytes)}));}
fs.mkdirSync(path.join(here,'src'),{recursive:true});
for(const name of ['app.js','run-model.js','index.html','style.css']){
 const destination=path.join(here,'src',name);if(fs.existsSync(destination))throw Error('Do not overwrite adapted source: '+name);
 let text=read(spec.baselineCode,'experiments/p3-masks/builder/src/'+name).toString('utf8');
 if(name==='app.js')text=text.replace("'./assets/jungle.jpg'","'./assets/source.jpg'").replace('`p3-seed-${run.seed}-tick-${tick}.json`','`p3-${build.board}-seed-${run.seed}-tick-${tick}.json`');
 if(name==='run-model.js')text=text.replace("return {schema:'r4d-p3-checkpoint-v1',coreCommit:","return {schema:'r4d-p3-checkpoint-v1',boardId:build.board,coreCommit:").replace("if(data.schema!=='r4d-p3-checkpoint-v1'||", "if(data.boardId!==build.board||data.schema!=='r4d-p3-checkpoint-v1'||");
 if(name==='index.html')text=text.replaceAll('Jungle',spec.label);
 fs.writeFileSync(destination,text);
}
const catalog={runs:[{seed:0,label:'Исходный seed'},{seed:1,label:'Общий заранее заданный seed 1'},{seed:2,label:'Общий заранее заданный seed 2'},{seed:randomBytes(4).readUInt32LE(),label:'Обычный случайный запуск 1'},{seed:randomBytes(4).readUInt32LE(),label:'Обычный случайный запуск 2'}],frames:[]};
fs.writeFileSync(path.join(here,'replay-catalog.json'),JSON.stringify(catalog,null,2)+'\n');
console.log(JSON.stringify({board:spec.board,declaredSeeds:catalog.runs.map(r=>r.seed),consumerBaseline:spec.baselineCode,depthAlgorithm:'unchanged scalar/line',movementChecked:false}));
