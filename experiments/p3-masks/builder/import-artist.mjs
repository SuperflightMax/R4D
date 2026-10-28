import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const artistRepo='E:/R4D/perspective/p3-worktrees/asset-artist';
const commit=process.argv[2];
if(!/^[0-9a-f]{40}$/.test(commit??''))throw Error('Exact Artist commit required');
const prefix='experiments/p3-masks/asset-artist/';
const output=path.resolve('E:/R4D/perspective/p3-runtime/builder/artist-'+commit.slice(0,12));
if(fs.existsSync(output))throw Error('Artist snapshot already exists; use exact saved bytes');
const read=relative=>execFileSync('git',['-C',artistRepo,'show',`${commit}:${prefix}${relative}`]);
const assetBytes=read('assets.json'),assets=JSON.parse(assetBytes);
if(assets.schema!=='r4d-p3-assets-v1')throw Error('Unexpected Artist contract');
fs.mkdirSync(output,{recursive:true});
const files=['assets.json',assets.ball.path,assets.shadow.path,...assets.occluders.map(x=>x.path)];
const hashes=[];
for(const relative of new Set(files)){
 const destination=path.resolve(output,relative);
 if(!destination.startsWith(output+path.sep))throw Error('Asset path escapes snapshot');
 const bytes=relative==='assets.json'?assetBytes:read(relative);
 fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,bytes);
 hashes.push({path:relative,bytes:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
}
fs.writeFileSync(path.join(output,'handoff.json'),JSON.stringify({commit,prefix,files:hashes},null,2)+'\n');
console.log(JSON.stringify({output,commit,files:hashes.length},null,2));
