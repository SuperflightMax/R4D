import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const here=path.dirname(fileURLToPath(import.meta.url)),spec=JSON.parse(fs.readFileSync(path.join(here,'transfer.json'),'utf8'));
const repo=execFileSync('git',['-C',here,'rev-parse','--show-toplevel'],{encoding:'utf8'}).trim();
const commit=process.argv[2];if(!/^[0-9a-f]{40}$/.test(commit??''))throw Error('Exact Artist commit required');
const variant=process.argv[3]??null;if(variant&&!/^[a-z][a-z0-9-]{0,63}$/.test(variant))throw Error('Named Artist variant required');
const artistPrefix=spec.artistPrefix+(variant?`variants/${variant}/`:'');
const output=path.resolve(spec.runtime,'artist-'+commit.slice(0,12)+(variant?'-'+variant:''));if(fs.existsSync(output))throw Error('Preserve existing Artist snapshot');
const read=relative=>execFileSync('git',['-C',repo,'show',`${commit}:${artistPrefix}${relative}`]);
const bytes=read('assets.json'),assets=JSON.parse(bytes);if(assets.schema!=='r4d-p3-assets-v1'||JSON.stringify(assets.sourceSize)!=='[1536,1536]')throw Error('Artist contract differs');
const paths=['assets.json',assets.ball.path,assets.shadow.path,...assets.occluders.map(o=>o.path)],files=[];
fs.mkdirSync(output,{recursive:true});
for(const relative of new Set(paths)){const destination=path.resolve(output,relative);if(!destination.startsWith(output+path.sep))throw Error('Artist path escapes snapshot');const data=relative==='assets.json'?bytes:read(relative);fs.mkdirSync(path.dirname(destination),{recursive:true});fs.writeFileSync(destination,data);files.push({path:relative,bytes:data.length,sha256:createHash('sha256').update(data).digest('hex')});}
fs.writeFileSync(path.join(output,'handoff.json'),JSON.stringify({board:spec.board,commit,prefix:artistPrefix,variant,files},null,2)+'\n');
console.log(JSON.stringify({board:spec.board,output,commit,prefix:artistPrefix,variant,files:files.length,assetsSha256:files.find(f=>f.path==='assets.json').sha256}));
