import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const raw='E:/R4D/perspective/p3-runtime/technical-qa/transfer-water-dark/dark/full-method-03';
const dest='E:/R4D/perspective/p3-worktrees/technical-qa/experiments/p3-masks/transfer/dark/technical-qa/evidence/full-method-03';
const sha=b=>createHash('sha256').update(b).digest('hex');
const read=p=>JSON.parse(fs.readFileSync(path.join(raw,p),'utf8').replace(/^\uFEFF/,''));
const write=(p,v)=>fs.writeFileSync(path.join(dest,p),JSON.stringify(v,null,2)+'\n');
fs.mkdirSync(path.join(dest,'frames'),{recursive:true});fs.mkdirSync(path.join(dest,'checkpoints'),{recursive:true});
const files=[];
function entry(relative){const b=fs.readFileSync(path.join(dest,relative));files.push({path:relative,bytes:b.length,sha256:sha(b)});}
for(const name of ['package-verification.json','catalog-oracle-verification.json','browser-oracle-verification.json','resource-postflight.json']){write(name,read(name));entry(name);}
const frames=['final-side02-t366','side02-t364','side02-t368-adjacent','side02-t366-geometry','corner04-t839','corner04-t840-adjacent','corner04-t841-adjacent','corner04-t844','receiver01-visible-t860','receiver01-visible-t880','receiver01-visible-t887','receiver01-visible-t888','lost-corner04-t896-geometry','ordinary-01-terminal','ordinary-02-terminal','ordinary-03-terminal','controls-art-off-geometry-off','controls-art-off-geometry-on','controls-art-on-geometry-on','controls-flat-floor-200-before-pan','negative-board-rejected','imported-own-dark','ordinary-03-replay-terminal'];
const frameCases=[];
for(const name of frames){const row=read('browser/'+name+'.json'),p='frames/'+name+'.jpg';fs.copyFileSync(path.join(raw,'browser',name+'.jpg'),path.join(dest,p));entry(p);frameCases.push({path:p,raw:'browser/'+name+'.json',seed:row.checkpoint.seed,tick:row.checkpoint.tick,controls:row.controls});}
const checkpoints=[];
for(const [name,source]of [['ordinary-01-terminal','ordinary-01-terminal'],['ordinary-02-terminal','ordinary-02-terminal'],['ordinary-03-terminal','ordinary-03-terminal'],['seed0-pillar02-t366','final-side02-t366'],['seed0-pillar04-t840','corner04-t840-adjacent'],['seed0-receiver01-t888','receiver01-visible-t888'],['seed2-pillar04-t896','lost-corner04-t896-geometry']]){const cp=read('browser/'+source+'.json').checkpoint,p='checkpoints/'+name+'.json';write(p,cp);entry(p);checkpoints.push({path:p,source:'browser/'+source+'.json',kind:'exact public browser snapshot checkpoint',seed:cp.seed,tick:cp.tick});}
const downloaded='checkpoints/ordinary-03-downloaded.json';fs.copyFileSync(path.join(raw,'browser/exported-dark.json'),path.join(dest,downloaded));entry(downloaded);checkpoints.push({path:downloaded,source:'browser/exported-dark.json',kind:'actual browser download, bytes unchanged',seed:3061636154,tick:87});
const timings=read('browser/resource-timing.json'),consoleEntries=read('browser/console.json'),network=read('browser/network.json');
assert.equal(timings.length,12);assert.ok(timings.every(r=>r.responseStatus===200));assert.equal(consoleEntries.length,0);assert.equal(network.events.length,0);
write('browser-observability.json',{utc:new Date().toISOString(),consoleWarnErrorEntries:consoleEntries,resourceTiming:timings,cdpNetwork:{events:network.events.length,truncated:network.truncated,hasMore:network.hasMore},completeBrowserNetworkCoverage:false,explanation:'The IAB root exposed 12 resource timing records with status 200 and no image records; CDP Network exposed no records for two fresh reloads. All 88 payload bodies and MIME types were separately checked over HTTP; browser loaded 60 masks. Do not infer complete browser network coverage from the empty CDP stream.',tabCleanup:read('browser/tab-cleanup.json')});entry('browser-observability.json');
const rawFiles=[];
function visit(dir){for(const x of fs.readdirSync(dir,{withFileTypes:true})){const full=path.join(dir,x.name);if(x.isDirectory())visit(full);else{const b=fs.readFileSync(full);rawFiles.push({path:path.relative(raw,full).replaceAll('\\','/'),bytes:b.length,sha256:sha(b)});}}}visit(raw);rawFiles.sort((a,b)=>a.path.localeCompare(b.path));
write('raw-index.json',{root:raw,files:rawFiles,totalBytes:rawFiles.reduce((n,f)=>n+f.bytes,0)});entry('raw-index.json');
const catalog=read('catalog-oracle-verification.json'),browser=read('browser-oracle-verification.json');
assert.equal(browser.samples.length,66);assert.equal(catalog.runs.length+browser.ordinary.length,8);
write('index.json',{candidate:'dark-full-method-03',qaBaselineHead:'fe09f8e37cff8352dbe629e28bd3e4e2c0e019aa',sourceCommit:'c73d6128970b2b022d5313b08c34cafdec9a1bc3',artistCommit:'17dc9fcdc261562acb581dd8590096819734c807',frozenManifestSha256:'b3923f4ccab57a8361a9dc8f64de73fcee9b70fb38c87aac5e9623fbc62d0307',utc:new Date().toISOString(),nativeRuns:8,nativeStates:catalog.runs.concat(browser.ordinary).reduce((n,r)=>n+r.ticksCompared,0),browserCheckpointSamples:browser.samples.length,publicSnapshotRows:65,actualDownloadedCheckpoints:1,frames:frameCases,checkpoints,files});
console.log(JSON.stringify({frames:frames.length,checkpoints:checkpoints.length,browserCheckpointSamples:browser.samples.length,nativeStates:catalog.runs.concat(browser.ordinary).reduce((n,r)=>n+r.ticksCompared,0),rawFiles:rawFiles.length,rawBytes:rawFiles.reduce((n,f)=>n+f.bytes,0),curatedBytes:files.reduce((n,f)=>n+f.bytes,0)},null,2));
