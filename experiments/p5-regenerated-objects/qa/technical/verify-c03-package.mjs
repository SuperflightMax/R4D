// C03 delta-only verification. No rebuild, PNG remeasurement, native execution or producer writes.
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import path from 'node:path';
const repo='E:/R4D/perspective/p5-worktrees/technical-qa';
const root='E:/R4D/perspective/p5-runtime/builder/output/previews/c03';
const old='E:/R4D/perspective/p5-runtime/builder/output/previews/c02';
const out='E:/R4D/perspective/p5-runtime/technical-qa/c03';
const consumer='af23e124cf5bd1d9de884082ffbc993448217112',artist='a5ec68fb2ed6aeacd8c66bc575166567bd0c3966';
const prefix='experiments/p5-regenerated-objects/asset-artist/';
const hash=b=>createHash('sha256').update(b).digest('hex');
const git=spec=>execFileSync('git',['--no-optional-locks','-C',repo,'show',spec],{maxBuffer:1024*1024});
const save=(name,value)=>writeFileSync(path.join(out,name),JSON.stringify(value,null,2)+'\n',{flag:'wx'});
mkdirSync(out,{recursive:true});assert(!existsSync(path.join(out,'package-verification.json')));
const bytes=readFileSync(path.join(root,'index.json'));assert.equal(bytes.length,11618);assert.equal(hash(bytes),'17838d163e6c710cad513a68b5cd5ba5c6543a708761b96e7ee62fa362c2ef2d');
const index=JSON.parse(bytes),oldIndex=JSON.parse(readFileSync(path.join(old,'index.json')));
assert.equal(index.consumerCommit,consumer);assert.equal(index.inventory.length,29);assert.equal(index.inventoryBytes,21675411);
assert.equal(index.inventory.reduce((n,f)=>n+f.bytes,0),index.inventoryBytes);
const owner=JSON.parse(readFileSync('E:/R4D/perspective/p5-runtime/builder/preview-owner.json'));
assert.equal(owner.pid,12500);assert.equal(owner.execSessionId,67163);assert.equal(owner.candidate,'c03');assert.equal(owner.indexSha256,hash(bytes));assert.equal(path.resolve(owner.root),path.resolve(root,'public'));
const files=[];
for(const f of index.inventory){
 assert(!f.path.includes('..')&&!path.isAbsolute(f.path));const b=readFileSync(path.join(root,'public',f.path));assert.equal(b.length,f.bytes);assert.equal(hash(b),f.sha256);
 const response=await fetch(new URL(f.path,owner.url),{cache:'no-store'});assert.equal(response.status,200);const served=Buffer.from(await response.arrayBuffer());assert.equal(served.length,f.bytes);assert.equal(hash(served),f.sha256);
 files.push({...f,httpMatched:true,localMatched:true});
}
const inventoryDelta=files.filter(f=>oldIndex.inventory.find(o=>o.path===f.path)?.sha256!==f.sha256).map(f=>f.path).sort();
assert.deepEqual(inventoryDelta,['assets/manifest.json','data/preview-input.json']);
for(const file of ['app.mjs','controller.mjs','framing.mjs','p1-projection.mjs','p1-view-math.mjs'])assert.deepEqual(git(`${consumer}:experiments/p5-regenerated-objects/builder/src/${file}`),git(`398b0daaaad914cc67b8390a51454d21db524e7a:experiments/p5-regenerated-objects/builder/src/${file}`));
const sourceBytes=git(`${artist}:${prefix}asset-manifest.mini-03.json`);assert.equal(sourceBytes.length,89838);assert.equal(hash(sourceBytes),'a083143b199f78cefe2725907b91385145cb9c29067ad319dd862974a13714a0');
const source=JSON.parse(sourceBytes),staged=JSON.parse(readFileSync(path.join(root,'public/assets/manifest.json')));
const sourceOld=JSON.parse(git(`4990463ec6eabf89aa47f58f9b59f703cbf739ba:${prefix}asset-manifest.mini-02.json`));
const a=structuredClone(source),b=structuredClone(sourceOld);delete a.instances.find(i=>i.id==='near-ledge').sourceClipPx;delete b.instances.find(i=>i.id==='near-ledge').sourceClipPx;assert.deepEqual(a,b,'Unexpected semantic change beyond near-ledge.sourceClipPx');
const normalized=structuredClone(source);for(const t of normalized.textures){const target=staged.textures.find(o=>o.id===t.id);assert(target);t.file=target.file;t.provenanceSha256=hash(JSON.stringify(t.provenance));delete t.provenance;}normalized.schema='r4d.p5.render-assets/1';assert.deepEqual(normalized,staged);
for(const support of index.artistManifest.supporting){const data=git(`${support.commit}:${support.path}`);assert.equal(data.length,support.bytes);assert.equal(hash(data),support.sha256);}
const regions=JSON.parse(git(`${artist}:${prefix}FOREGROUND_REGIONS.mini-03.json`));assert.equal(regions.length,3);
const clip=source.instances.find(i=>i.id==='near-ledge').sourceClipPx,oldClip=sourceOld.instances.find(i=>i.id==='near-ledge').sourceClipPx;
assert.deepEqual(clip,regions.find(r=>r.id==='near-ledge').sourceClipPx);
const delta=JSON.parse(git(`${artist}:${prefix}DELTA_MINI_03.json`));assert.deepEqual(delta.newSourcePolygonPx,clip.polygon);assert.deepEqual(delta.oldSourcePolygonPx,oldClip.polygon);
assert.equal(delta.newTexturePolygonPx.length,clip.polygon.length);for(let i=0;i<clip.polygon.length;i++)for(let j=0;j<2;j++)assert(Math.abs(clip.polygon[i][j]-delta.newTexturePolygonPx[i][j]*1536/1254)<1e-10);
assert.equal(new Set(source.textures.map(t=>t.sha256)).size,17);assert.equal(source.textures.length,23);assert.equal(source.instances.length,64);
const baselineAx='E:/R4D/perspective/p5-runtime/visual-qa/evidence/c01/own-ordinary-terminal.ax.txt';const ax=readFileSync(baselineAx);assert.equal(hash(ax),'6c25a8926823f3adbeda6d7e9c33fe54424651555c00b22fee3932b5464166ee');
const match=ax.toString().match(/37 text (\{[\s\S]*?\n\})\n\s*38 text/);assert(match);const saved333=JSON.parse(match[1]);assert.equal(saved333.tick,1709);assert.equal(saved333.result.kind,'LOST');
save('saved333-terminal-baseline.json',{seed:3339315606,state:saved333,sourcePath:baselineAx,sourceBytes:ax.length,sourceSha256:hash(ax),sourceIndex:'c662b0badfb5e44fb5ab6a55a8152f1570d18f0f:experiments/p5-regenerated-objects/qa/visual/EVIDENCE_C01.json',scope:'Previously observed native terminal only; no full independent per-tick trace for this seed'});
save('producer-index.json',index);save('producer-owner.json',owner);
const result={createdUtc:new Date().toISOString(),consumerCommit:consumer,artistCommit:artist,root:path.join(root,'public'),url:owner.url,pid:owner.pid,session:owner.execSessionId,index:{bytes:bytes.length,sha256:hash(bytes)},files,inventoryBytes:index.inventoryBytes,inventoryDelta,onlySemanticManifestDelta:'near-ledge.sourceClipPx',all17PngUnchanged:true,consumerCodeUnchanged:true,oldBounds:delta.oldBoundsSourcePx,newBounds:delta.newBoundsSourcePx,oldArea:delta.oldPolygonAreaSourcePx2,newArea:delta.newPolygonAreaSourcePx2,textureToSourceConversionMatched:true,sourceManifest:{bytes:sourceBytes.length,sha256:hash(sourceBytes)},scope:'Identity/data-delta only; actual visibility and motion verified separately'};
save('package-verification.json',result);const r=readFileSync(path.join(out,'package-verification.json'));console.log(JSON.stringify({bytes:r.length,sha256:hash(r),inventoryDelta,sourceDelta:result.onlySemanticManifestDelta,newBounds:result.newBounds,owner},null,2));
