import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';
import { root,runtime,site,coreCommit,coreTree } from './paths.mjs';
import { prepareSpriteV01 } from './prepare-sprite-v01.mjs';
import { prepareWoodV01 } from './prepare-wood-v01.mjs';
const require = createRequire(path.join(runtime,'deps/package.json'));
const esbuild = require('esbuild');
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
if(fs.existsSync(path.join(site,'..','freeze-inventory.json')))throw new Error('This candidate output is frozen; use the explicitly assigned next candidate path');
fs.mkdirSync(path.join(site,'native'),{recursive:true});
const coreEntry = path.join(runtime,'private',coreCommit,'sim-core/src/index.ts');
await esbuild.build({entryPoints:[coreEntry],outfile:path.join(site,'native/core.mjs'),bundle:true,format:'esm',platform:'neutral',target:'es2022',sourcemap:false,minify:true,legalComments:'none'});
await esbuild.build({entryPoints:[path.join(root,'viewer/app.mjs')],outfile:path.join(site,'app.mjs'),bundle:true,format:'esm',platform:'browser',target:'es2022',sourcemap:false,minify:false,nodePaths:[path.join(runtime,'deps/node_modules')],plugins:[{name:'private-native-module',setup(build){build.onResolve({filter:/^@millionko\/sim-core$/},()=>({path:'./native/core.mjs',external:true}));}}]});
for (const name of ['index.html','style.css']) fs.copyFileSync(path.join(root,'viewer',name),path.join(site,name));
for (const name of ['config.json','manifest.json']) fs.copyFileSync(path.join(root,'inputs',name),path.join(site,name));
fs.copyFileSync(path.join(root,'draft-v01/geometry-draft.png'),path.join(site,'geometry-draft.png'));
fs.copyFileSync(path.join(root,'draft-v01/geometry.json'),path.join(site,'geometry.json'));
const inputBytes = fs.readFileSync(path.join(root,'inputs/config.json'));
const manifestBytes = fs.readFileSync(path.join(root,'inputs/manifest.json'));
const pixiVersion=JSON.parse(fs.readFileSync(path.join(runtime,'deps/node_modules/pixi.js/package.json'))).version;
const meta={schema:'r4d.p6.consumer-build.v1',coreCommit,coreTree,coreSha256:sha(fs.readFileSync(path.join(site,'native/core.mjs'))),configSha256:sha(inputBytes),manifestSha256:sha(manifestBytes),p1Commit:'4b47db04c7140ebf88f69b91faa0b790d46f22ec',pixiVersion,esbuildVersion:esbuild.version,artStatus:'geometry draft only; no artistic PASS',artCandidate:null};
meta.consumerSha256=sha(fs.readFileSync(path.join(site,'app.mjs')));
meta.runtimeDependencyLockSha256=sha(fs.readFileSync(path.join(root,'runtime-deps/package-lock.json')));
meta.consumerSources=Object.fromEntries(['viewer/app.mjs','viewer/controller.mjs','viewer/index.html','viewer/style.css','scripts/build.mjs','scripts/prepare-sprite-v01.mjs','scripts/prepare-wood-v01.mjs','scripts/render-draft.py','scripts/paths.mjs','inputs/projection.mjs'].map(file=>[file,sha(fs.readFileSync(path.join(root,file)))]));
// Optional artist handoff: copy only a P6-local frozen candidate, no raw native sources.
const artistArg=process.argv.indexOf('--artist');
const oneWood=process.argv.includes('--wood-v01');
const spriteOnly=process.argv.includes('--sprites-v01')||oneWood;
const spherePrepared=spriteOnly?prepareSpriteV01():null;
const spritePrepared=oneWood?prepareWoodV01(spherePrepared):spherePrepared;
if(artistArg>=0||spriteOnly){
  const artistPath=spriteOnly?spritePrepared.artistPath:path.resolve(process.argv[artistArg+1]);
  const p6Root=path.resolve(root,'..')+path.sep;
  if(!spriteOnly&&!artistPath.startsWith(p6Root)) throw new Error('Artist manifest must be inside own P6 area');
  const artist=JSON.parse(fs.readFileSync(artistPath));
  if(artist.configSha256!==meta.configSha256 || artist.p1Commit!==meta.p1Commit) throw new Error('Artist candidate has different geometry pins');
  if(artist.manifestSha256&&artist.manifestSha256!==meta.manifestSha256)throw new Error('Artist projection manifest differs');
  if(spriteOnly&&artist.stage!==(oneWood?'one-wood-sphere-shadow':'sphere-shadow-only'))throw new Error('Unexpected sprite adapter stage');
  const dir=path.dirname(artistPath);
  if(artist.width!==1536||artist.height!==1536||!Array.isArray(artist.layers))throw new Error('Artist layers must declare 1536-square registration');
  const cfg=JSON.parse(inputBytes);
  const known=new Map([...cfg.board.pins,...cfg.board.buckets,...cfg.board.drops].map(p=>[p.id,p]));
  for(const layer of artist.layers){
    if(layer.objectId){
      const obj=known.get(layer.objectId);
      if(!obj)throw new Error(`Unknown art object ID ${layer.objectId}`);
      if(!layer.nativeBase||Math.hypot(layer.nativeBase[0]-obj.x,layer.nativeBase[1]-obj.y)>1e-7)throw new Error(`Art base differs from config: ${layer.objectId}`);
      if(obj.r!==undefined&&layer.nativeRadius!==obj.r)throw new Error(`Art radius differs from config: ${layer.objectId}`);
    }
  }
  for(const pin of spriteOnly?[]:cfg.board.pins){
    if(!artist.layers.some(l=>l.objectId===pin.id&&l.role==='body'))throw new Error(`Missing body for ${pin.id}`);
    const policy=artist.shadows?.[pin.id];
    if(!policy||!['baked','separate'].includes(policy.kind))throw new Error(`Missing single shadow source for ${pin.id}`);
    if(!artist.layers.some(l=>l.id===policy.layerId))throw new Error(`Shadow layer missing for ${pin.id}`);
    const separate=artist.layers.filter(l=>l.role==='ground-shadow'&&l.objectId===pin.id);
    if(separate.length!==(policy.kind==='separate'?1:0))throw new Error(`Shadow count differs for ${pin.id}`);
  }
  if(artist.ball&&(!artist.ball.center||!(artist.ball.visibleRadius>0)))throw new Error('Ball requires explicit center and visibleRadius');
  const names=new Set([...artist.layers.map(l=>l.texture),artist.ball?.texture,artist.ball?.shadow?.texture].filter(Boolean));
  for(const file of names){
    if(path.isAbsolute(file)||file.split(/[\\/]/).includes('..')||!/\.(png|webp|jpg|jpeg)$/i.test(file))throw new Error(`Unexpected art file ${file}`);
    const from=path.resolve(dir,file);const to=path.join(site,'artist',file);
    const actual=sha(fs.readFileSync(from));
    if(artist.hashes?.[file]!==actual)throw new Error(`Unfrozen art file ${file}`);
    fs.mkdirSync(path.dirname(to),{recursive:true});fs.copyFileSync(from,to);
  }
  fs.writeFileSync(path.join(site,'artist.json'),JSON.stringify(artist,null,2)+'\n');
  meta.artCandidate={id:artist.id,stage:artist.stage??'board-layers',manifestSha256:sha(fs.readFileSync(artistPath))};
  meta.artStatus=oneWood?'one actual wood-01 plus actual sphere/shadow; remaining24 diagnostic draft bodies; visual QA pending':spriteOnly?'actual sphere/shadow; frozen geometry draft background; obstacle occlusion absent; visual QA pending':'artist candidate; visual QA pending';
  if(spriteOnly){meta.spriteSource=artist.spriteSource;meta.spriteAdapterSha256=spritePrepared.adapterSha256;}
  if(oneWood)meta.woodSource=artist.woodSource;
}else if(fs.existsSync(path.join(site,'artist.json')))fs.unlinkSync(path.join(site,'artist.json'));
fs.writeFileSync(path.join(site,'build-meta.json'),JSON.stringify(meta,null,2)+'\n');
console.log(JSON.stringify({site,...meta},null,2));
