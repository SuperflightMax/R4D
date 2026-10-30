// Read-only review of the frozen consumer against already preserved native runs.
// Never imports a candidate bundle or rebuilds native. DOM fields stay raw JSON strings.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const [prep,target,out]=process.argv.slice(2);
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const art=read(path.join(target,'art/manifest.json'));
const config=read(path.join(prep,'inputs/config.json'));
const p1=read(path.join(prep,'inputs/manifest.json'));
assert.deepStrictEqual(read(path.join(target,'input/config.json')),config);
assert.deepStrictEqual(read(path.join(target,'input/p1-manifest.json')),p1);
for(const k of ['nativeToSource','sourceToNative'])assert.deepStrictEqual(art.p1[k],p1.projection[k]);
const refs={};
for(const seed of [0,1,2]){
  let events=[];
  refs[seed]=fs.readFileSync(path.join(prep,`runs/seed-${seed}.jsonl`),'utf8').trim().split(/\r?\n/).map(line=>{
    const r=JSON.parse(line);events=events.concat(r.events);
    return {state:{...r.state,seed,dropId:config.board.drops[0].id,tickMs:5,timeSec:r.state.tick*5/1000,status:r.state.done?'finished':'active',started:true,finished:r.state.done},events:[...events]};
  });
}
const records=[];const render=[];
const H=art.p1.nativeToSource;
for(const file of fs.readdirSync(out).filter(x=>x.endsWith('.dom.json')).sort()){
  const raw=read(path.join(out,file)),state=JSON.parse(raw.state),events=JSON.parse(raw.events),depth=JSON.parse(raw.depth);
  const ref=refs[state.seed][state.tick];
  assert.deepStrictEqual(state,ref.state,`${file}: full state`);
  assert.deepStrictEqual(events,ref.events,`${file}: ordered events`);
  const p=state.ball.pos,w=H[2][0]*p.x+H[2][1]*p.y+H[2][2];
  const center=[(H[0][0]*p.x+H[0][1]*p.y+H[0][2])/w,(H[1][0]*p.x+H[1][1]*p.y+H[1][2])/w],R=16/w;
  const a=depth.actor,b=a.rendered.body,sh=a.rendered.shadow;
  const deltas=[a.center.x-center[0],a.center.y-center[1],a.radius-R,a.bodyScale-R/100,b.position.x-center[0],b.position.y-center[1],b.scale.x-R/100,b.scale.y-R/100,a.shadowCenter.x-(center[0]-.95*R),a.shadowCenter.y-(center[1]+.86*R),sh.scale.x-1.55*R/100,sh.scale.y-.58*R/26];
  assert.ok(deltas.every(x=>Math.abs(x)<1e-10),`${file}: actor placement`);
  assert.equal(a.shadowOpacity,.65);assert.equal(sh.sourceAlpha,.65);assert.equal(sh.flatAlpha,.65);
  assert.deepStrictEqual(b.pivot,{x:128,y:128.5});assert.deepStrictEqual(sh.pivot,{x:128,y:128});
  assert.equal(b.textureAlphaMode,'premultiply-alpha-on-upload');assert.equal(sh.textureAlphaMode,'premultiply-alpha-on-upload');
  assert.ok(!(b.sourceVisible&&b.flatVisible));assert.ok(!(sh.sourceVisible&&sh.flatVisible));
  const assets=JSON.parse(raw.assets);assert.equal(assets.length,10);
  for(const a of assets){const sha=hash(fs.readFileSync(path.join(target,'art',a.file)));if(a.sha256)assert.equal(a.sha256,sha);}
  records.push({file,seed:state.seed,tick:state.tick,eventCount:events.length,state:'PASS',events:'PASS'});
  render.push({file,maxPlacementDelta:Math.max(...deltas.map(Math.abs)),fitScale:a.rendered.fitScale,viewport:a.rendered.viewport});
}
const arch=art.objects.find(x=>x.objectId==='arch-07');
const edges=config.board.segments.filter(x=>arch.nativeIds.includes(x.id));assert.equal(edges.length,8);
const anchor=[edges.reduce((s,e)=>s+e.x1,0)/8,edges.reduce((s,e)=>s+e.y1,0)/8];
assert.ok(anchor.every((x,i)=>Math.abs(x-arch.anchorNative[i])<1e-9));
assert.ok(!config.board.pins.some(x=>x.id==='arch-07'));
for(const id of ['frog-01','receiver-02']){
  const o=art.objects.find(x=>x.objectId===id),native=[...config.board.pins,...config.board.buckets].find(x=>x.id===id);
  assert.deepStrictEqual(o.anchorNative,[native.x,native.y]);
}
const cp=read(path.join(out,'same-file-1009.checkpoint.json'));
assert.equal(cp.seed,1);
assert.deepStrictEqual(cp.config,{...config,rng:{...config.rng,seed:cp.seed}});assert.deepStrictEqual(cp.state,refs[1][1009].state);assert.deepStrictEqual(cp.events,refs[1][1009].events);
const integrity=read(path.join(out,'integrity.json'));
for(const f of integrity.files)assert.equal(hash(fs.readFileSync(path.join(target,f.file))),f.sha256);
assert.equal(hash(fs.readFileSync(path.join(target,'artifact.json'))),integrity.artifactSha256);
const currentHttp=Buffer.from(await (await fetch('http://127.0.0.1:4395/artifact.json')).arrayBuffer());
assert.equal(hash(currentHttp),integrity.artifactSha256);
const summary={candidate:integrity.candidate,artifactSha256:integrity.artifactSha256,payloadRootSha256:integrity.payloadRootSha256,artworkRootSha256:integrity.artworkRootSha256,records,render,maxPlacementDelta:Math.max(...render.map(x=>x.maxPlacementDelta)),anchors:{archDerivedFromEightFootVertices:anchor,frogAndReceiverExact:true},checkpoint:'PASS',endIntegrity:{files:integrity.files.length,diskAndHttpArtifact:'PASS'},consoleWarnErrors:read(path.join(out,'console-warn-errors.json')),seekWhilePlaying:{entered:1009,firstRead:read(path.join(out,'seek-while-playing-entry.json')).inputValue,beforeClick:read(path.join(out,'seek-while-playing-before-goto.json')).inputValue,actual:JSON.parse(read(path.join(out,'39-replay-seek-while-playing.dom.json')).state).tick,pausedActual:JSON.parse(read(path.join(out,'40-replay-seek-paused.dom.json')).state).tick}};
fs.writeFileSync(path.join(out,'REVIEW_RESULTS.json'),JSON.stringify(summary,null,2)+'\n');
console.log(JSON.stringify({records:records.length,allExact:true,maxPlacementDelta:summary.maxPlacementDelta,anchors:summary.anchors,endIntegrity:summary.endIntegrity,seekWhilePlaying:summary.seekWhilePlaying}));
