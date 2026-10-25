import fs from 'node:fs';
const base='http://127.0.0.1:4340/review/r4d/q2a-simple-character/';
const paths=['provenance.json','preview-server.mjs','runtime/server.mjs','runtime/vendor/pixi.min.js.map','art/source/attempt03_raw.png','art/source/c1_arms01_raw.png','qa/technical-p2-c2/browser-observations.json'];
const results=[];
for(const path of paths){const r=await fetch(base+path);results.push({path,status:r.status});await r.arrayBuffer();}
fs.writeFileSync(new URL('private-paths.json',import.meta.url),JSON.stringify(results,null,2));console.log(results);
process.exitCode=results.some(x=>x.status!==404)?1:0;
