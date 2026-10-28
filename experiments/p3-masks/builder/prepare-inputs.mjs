import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(here,'../../..');
const inputDir=path.join(here,'inputs');
fs.mkdirSync(inputDir,{recursive:true});
const rev='4b47db04c7140ebf88f69b91faa0b790d46f22ec';
const prefix='experiments/p1-collider-mapping/clean-repeat-01/';
const files=[
 ['config.json','simulation/boards/01/trial-01/config.json','dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db'],
 ['manifest.json','simulation/boards/01/trial-01/manifest.json','7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18'],
 ['projection.json','research/board01-projection.candidate-01.json','9ca9e520f1927426a3a5ba73a5eacaf90fedffc9385e7d08d5b1e6ee644b020c'],
 ['view-math.mjs','viewer/src/view-math.mjs',null],
];
for(const [name,source,expected] of files){
 const bytes=execFileSync('git',['-C',repo,'show',`${rev}:${prefix}${source}`]);
 const sha256=createHash('sha256').update(bytes).digest('hex');
 if(expected && sha256!==expected)throw Error(`${name}: ${sha256} != ${expected}`);
 fs.writeFileSync(path.join(inputDir,name),bytes);
 console.log(JSON.stringify({name,sha256,bytes:bytes.length}));
}
