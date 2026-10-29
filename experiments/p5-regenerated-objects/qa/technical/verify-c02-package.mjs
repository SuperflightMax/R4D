// Independent frozen C02 package/policy check; no build and no writes to producer paths.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const repo='E:/R4D/perspective/p5-worktrees/technical-qa';
const root='E:/R4D/perspective/p5-runtime/builder/output/previews/c02';
const out='E:/R4D/perspective/p5-runtime/technical-qa/c02';
const commit='398b0daaaad914cc67b8390a51454d21db524e7a';
const artistCommit='4990463ec6eabf89aa47f58f9b59f703cbf739ba';
const artistPrefix='experiments/p5-regenerated-objects/asset-artist/';
const hash=b=>createHash('sha256').update(b).digest('hex');
const git=spec=>execFileSync('git',['--no-optional-locks','-C',repo,'show',spec],{maxBuffer:5*1024*1024});
const save=(name,value)=>writeFileSync(path.join(out,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
mkdirSync(out,{recursive:true});
assert(!existsSync(path.join(out,'package-verification.json')),'Append-only evidence exists');
const ib=readFileSync(path.join(root,'index.json'));
assert.equal(ib.length,10707); assert.equal(hash(ib),'f40040bb40d529b7bf1f289e661d69f7f882fddfc962e40cdc5616a59c9d9389');
const index=JSON.parse(ib);
assert.equal(index.consumerCommit,commit);assert.equal(index.inventory.length,29);assert.equal(index.inventory.reduce((s,f)=>s+f.bytes,0),21668434);
const owner=JSON.parse(readFileSync('E:/R4D/perspective/p5-runtime/builder/preview-owner.json'));
assert.equal(owner.pid,21340);assert.equal(owner.execSessionId,26545);assert.equal(owner.candidate,'c02');assert.equal(owner.indexSha256,hash(ib));
assert.equal(path.resolve(owner.root),path.resolve(root,'public'));
const files=[];
for(const f of index.inventory){
  assert(!f.path.includes('..')&&!path.isAbsolute(f.path));
  const bytes=readFileSync(path.join(root,'public',f.path));assert.equal(bytes.length,f.bytes,f.path);assert.equal(hash(bytes),f.sha256,f.path);
  const response=await fetch(new URL(f.path,owner.url),{cache:'no-store'});assert.equal(response.status,200,f.path);
  const served=Buffer.from(await response.arrayBuffer());assert.equal(served.length,f.bytes);assert.equal(hash(served),f.sha256,`served ${f.path}`);
  files.push({...f,localMatched:true,httpMatched:true});
}
assert.equal(files.find(f=>f.path==='app.js').sha256,'4a003dd39212f21b7a3dd1baa82c0d0738af3a9767c6e51225b9b54f5aac325c');
const sourceBytes=git(`${artistCommit}:${artistPrefix}asset-manifest.mini-02.json`);
assert.equal(sourceBytes.length,83772);assert.equal(hash(sourceBytes),'6055be855714bc9ad66a0e803fc392fbd8e01d94a9798536e7047c06d5d2a331');
const source=JSON.parse(sourceBytes), staged=JSON.parse(readFileSync(path.join(root,'public/assets/manifest.json')));
assert.equal(source.textures.length,23);assert.equal(source.instances.length,64);assert.equal(new Set(source.textures.map(t=>t.sha256)).size,17);
const normalized=structuredClone(source);
for(const texture of normalized.textures){
  const target=staged.textures.find(t=>t.id===texture.id);assert(target);
  texture.file=target.file;texture.provenanceSha256=hash(JSON.stringify(texture.provenance));delete texture.provenance;
}
normalized.schema='r4d.p5.render-assets/1';assert.deepEqual(normalized,staged,'Whole source-to-staged mapping');
for(const support of index.artistManifest.supporting){
  const bytes=git(`${artistCommit}:${support.path}`);assert.equal(bytes.length,support.bytes);assert.equal(hash(bytes),support.sha256);
  assert.deepEqual(bytes,git(`a5f26a57833e8671bf031a2b21c1b9f990dd3c87:${support.path}`),'Normalized supporting source changed');
}
assert.deepEqual(sourceBytes,git(`a5f26a57833e8671bf031a2b21c1b9f990dd3c87:${artistPrefix}asset-manifest.mini-02.json`));
const configBytes=readFileSync(path.join(root,'public/data/config.json'));
const p1Bytes=readFileSync(path.join(root,'public/data/p1-manifest.json'));
assert.equal(hash(configBytes),'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db');
assert.equal(hash(p1Bytes),'7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18');
assert.equal(hash(readFileSync('K:/Agents/R4D/Assets/perspective/01-jungle.jpg')),'c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72');
const controller=git(`${commit}:experiments/p5-regenerated-objects/builder/src/controller.mjs`);
assert.deepEqual(controller,git('0c611039246904443128b9d12084af2c5a0ae6e6:experiments/p5-regenerated-objects/builder/src/controller.mjs'));
assert.deepEqual(readFileSync(path.join(root,'public/data/dependency-lock.json')),git(`${commit}:experiments/p5-regenerated-objects/builder/DEPENDENCIES.lock.json`));
const config=JSON.parse(configBytes),p1=JSON.parse(p1Bytes);
const pins=source.instances.filter(i=>i.role==='body');
assert.deepEqual(pins.map(i=>i.targetId).sort(),config.board.pins.map(p=>p.id).sort());
assert.deepEqual(source.instances.filter(i=>i.role==='receiver-back').map(i=>i.targetId).sort(),config.board.buckets.map(p=>p.id).sort());
const project=(x,y)=>{const m=p1.projection.nativeToSource,w=m[2][0]*x+m[2][1]*y+m[2][2];return[(m[0][0]*x+m[0][1]*y+m[0][2])/w,(m[1][0]*x+m[1][1]*y+m[1][2])/w]};
const width=(p,r)=>{const pts=Array.from({length:128},(_,i)=>project(p.x+r*Math.cos(i*Math.PI/64),p.y+r*Math.sin(i*Math.PI/64)));return Math.max(...pts.map(p=>p[0]))-Math.min(...pts.map(p=>p[0]))};
const ball=source.textures.find(t=>t.id==='ball-v1');const L=ball.groundAnchorPx[1]-(ball.alpha.visibleBounds[1]+ball.alpha.visibleBounds[3]/2);
const policy=JSON.parse(git(`${artistCommit}:${artistPrefix}RECEIVER_ANCHOR_POLICY.mini-02.json`));
const receivers=config.board.buckets.map(bucket=>{
  const backSpec=source.instances.find(i=>i.role==='receiver-back'&&i.targetId===bucket.id),frontSpec=source.instances.find(i=>i.role==='receiver-front'&&i.targetId===bucket.id);
  const back=source.textures.find(t=>t.id===backSpec.textureId),front=source.textures.find(t=>t.id===frontSpec.textureId);
  const sr=width(bucket,bucket.r)/back.footprintPx.width,sb=width(bucket,config.board.ball.r)/ball.footprintPx.width;
  const hr=L*sb/sr,expected=[628,477+hr],row=policy.rows.find(r=>r.targetId===bucket.id);
  for(const texture of [back,front]){
    assert(Math.abs(texture.groundAnchorPx[1]-expected[1])<1e-10);assert.equal(texture.groundAnchorPx[0],628);
    assert.deepEqual(texture.footprintPx.center,texture.groundAnchorPx);assert.deepEqual(texture.opticalOpeningPointPx,[628,477]);
    assert.equal(texture.alias.rawPixelsChanged,false);assert.equal(texture.alias.newGeneration,false);
  }
  assert(Math.abs(row.hRTexturePx-hr)<1e-10);
  return{id:bucket.id,logicalNative:[bucket.x,bucket.y],logicalSource:project(bucket.x,bucket.y),computedHR:hr,logicalTextureAnchor:expected,visualShiftSourceY:-hr*sr,backFrontMatched:true};
});
const regions=JSON.parse(git(`${artistCommit}:${artistPrefix}FOREGROUND_REGIONS.mini-02.json`));
const clips=source.instances.filter(i=>i.sourceClipPx);assert.equal(clips.length,3);
for(const clip of clips){
  assert.equal(clip.role,'foreground');assert.equal(clip.targetId,'$source');assert.equal(clip.parentId,'floor');assert.equal(clip.textureId,'floor-v1');
  assert.deepEqual(clip.sourceClipPx,regions.find(r=>r.id===clip.id).sourceClipPx);
  assert.equal(clip.sourceClipPx.coordinateSpace,'source1536');
  assert(clip.sourceClipPx.polygon.every(p=>p.length===2&&p.every(n=>Number.isFinite(n)&&n>=0&&n<=1536)));
}
save('producer-index.json',index);save('producer-owner.json',owner);
save('policy-verification.json',{receivers,clipIds:clips.map(c=>c.id),maskTreeDeclared:'3 masked foreground children, sprite+mask under Art; geometry separate later sibling',controllerUnchanged:true,scope:'Declared inputs/policy only; runtime and visual observations separate'});
const result={createdUtc:new Date().toISOString(),consumerCommit:commit,artistCommit,root:path.join(root,'public'),url:owner.url,ownerPid:owner.pid,ownerSession:owner.execSessionId,
 index:{bytes:ib.length,sha256:hash(ib)},files,inventoryBytes:index.inventoryBytes,sourceManifest:{bytes:sourceBytes.length,sha256:hash(sourceBytes)},sourceToStagedAllMetadataMatched:true,
 textureIds:23,uniquePng:17,instances:64,pinBodies:25,receivers:4,foregroundParts:3,controllerUnchanged:true,scope:'Package/pins/anchor-policy, not actual runtime/art PASS'};
save('package-verification.json',result);console.log(JSON.stringify({output:path.join(out,'package-verification.json'),bytes:readFileSync(path.join(out,'package-verification.json')).length,sha256:hash(readFileSync(path.join(out,'package-verification.json'))),receivers,files:files.length},null,2));
