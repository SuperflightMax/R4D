import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const freeze=JSON.parse(await readFile(path.join(root,'freeze-manifest-v1.json'),'utf8'));
const selfTest=process.argv.includes('--self-test');
const dirFlag=process.argv.indexOf('--integration-dir');
const layoutCache={};
for(const item of freeze.layouts)layoutCache[item.file]=await readFile(path.join(root,item.file),'utf8');

if(selfTest){
  const valid=freeze.layouts.map((layout,index)=>syntheticManifest(layout,index));
  validateSeries(valid);
  mustReject(()=>validateSeries(valid.map((m,i)=>i===3?{...m,sources:{...m.sources,master:{sha256:valid[0].sources.master.sha256}}}:m)),'duplicate master');
  mustReject(()=>validateSeries(valid.map((m,i)=>i===0?{...m,sources:{...m.sources,plate:{sha256:freeze.forbiddenL1SourceHashes.plate}}}:m)),'L1 reuse');
  mustReject(()=>validateSeries(valid.map((m,i)=>i===1?{...m,instances:m.instances.map((x,j)=>j===0?{...x,q:.339}:x)}:m)),'anchor drift');
  console.log('PASS: cross-series checker self-test accepts exact four-board contract and rejects duplicate source, L1 reuse and invariant drift');
}else{
  assert(dirFlag>=0&&process.argv[dirFlag+1],'Use --integration-dir <directory> or --self-test');
  const dir=path.resolve(process.argv[dirFlag+1]);
  const manifests=[];
  for(const layout of freeze.layouts)manifests.push(JSON.parse(await readFile(path.join(dir,`${layout.boardId}.json`),'utf8')));
  validateSeries(manifests);
  console.log('PASS: four independent board integration manifests satisfy frozen cross-series contract');
}

function validateSeries(manifests){
  assert(manifests.length===4,'Exactly four board manifests required');
  const byId=new Map(manifests.map((m)=>[m.boardId,m]));
  assert(byId.size===4,'Board IDs must be unique');
  const roleHashes={plate:[],master:[],shadow:[]};
  const tuples=[];
  for(const frozen of freeze.layouts){
    const manifest=byId.get(frozen.boardId);assert(manifest,`Missing ${frozen.boardId}`);
    const layout=JSON.parse(requireLayout(frozen.file));
    assert(manifest.schema==='r4d.p0.final-board-integration.v1','Unexpected integration schema');
    assert(manifest.layoutSha256===frozen.sha256,`${frozen.boardId}: layout hash changed after images`);
    assert(JSON.stringify(manifest.frame)===JSON.stringify([1536,1536]),`${frozen.boardId}: frame changed`);
    assert(JSON.stringify(manifest.playablePlane.quadNormalized)===JSON.stringify(freeze.quadNormalized),`${frozen.boardId}: quad changed`);
    assert(JSON.stringify(manifest.playablePlane.seams)===JSON.stringify(freeze.seams),`${frozen.boardId}: seams changed`);
    assert(JSON.stringify(manifest.instances)===JSON.stringify(layout.instances),`${frozen.boardId}: p/q/scales/IDs changed`);
    assert(manifest.baseCenterDefinition===freeze.baseCenterDefinition,`${frozen.boardId}: base-center definition changed`);
    assert(manifest.deterministicAssembly===true,`${frozen.boardId}: assembly is not deterministic`);
    assert(JSON.stringify(manifest.sortKey)===JSON.stringify(['q','p','instanceId'])&&manifest.painterDirection==='far-to-near',`${frozen.boardId}: z-order changed`);
    assert(manifest.shadowRule==='same-anchor-destination-scale;draw-before-master',`${frozen.boardId}: shadow rule changed`);
    assert(manifest.controlMarkersAllowed===false&&Array.isArray(manifest.overlays)&&manifest.overlays.length===0,`${frozen.boardId}: control overlay present`);
    for(const role of Object.keys(roleHashes)){
      const value=manifest.sources?.[role]?.sha256;assert(/^[0-9a-f]{64}$/.test(value),`${frozen.boardId}: invalid ${role} hash`);
      assert(!Object.values(freeze.forbiddenL1SourceHashes).includes(value),`${frozen.boardId}: L1 ${role} source reused`);
      roleHashes[role].push(value);
    }
    tuples.push(`${roleHashes.plate.at(-1)}:${roleHashes.master.at(-1)}:${roleHashes.shadow.at(-1)}`);
  }
  for(const [role,hashes] of Object.entries(roleHashes))assert(new Set(hashes).size===4,`Four distinct ${role} hashes required`);
  assert(new Set(roleHashes.plate.concat(roleHashes.master,roleHashes.shadow)).size===12,'All twelve component source hashes must be distinct');
  assert(new Set(tuples).size===4,'Four distinct plate/master/shadow sets required');
}

function syntheticManifest(frozen,index){
  const layout=JSON.parse(requireLayout(frozen.file));
  const hex=(n)=>n.toString(16).padStart(64,String(index+1));
  return{schema:'r4d.p0.final-board-integration.v1',boardId:frozen.boardId,layoutSha256:frozen.sha256,frame:[1536,1536],playablePlane:{quadNormalized:freeze.quadNormalized,seams:freeze.seams},sources:{plate:{sha256:hex(100+index)},master:{sha256:hex(200+index)},shadow:{sha256:hex(300+index)}},instances:layout.instances,baseCenterDefinition:freeze.baseCenterDefinition,deterministicAssembly:true,sortKey:['q','p','instanceId'],painterDirection:'far-to-near',shadowRule:'same-anchor-destination-scale;draw-before-master',controlMarkersAllowed:false,overlays:[]};
}
function requireLayout(relative){return layoutCache[relative]??(()=>{throw new Error(`Unknown frozen layout: ${relative}`)})();}
function mustReject(fn,label){let rejected=false;try{fn();}catch{rejected=true;}assert(rejected,`Self-test did not reject ${label}`);}
function assert(c,m){if(!c)throw new Error(m);}
