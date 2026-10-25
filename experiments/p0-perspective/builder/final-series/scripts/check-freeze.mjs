import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const builder=path.resolve(root,'..');
const temp=await mkdtemp(path.join(os.tmpdir(),'r4d-p0-series-freeze-'));
const expectedQ=[0.338,0.453,0.567,0.681];
const expectedScales=[0.939,0.978,1.018,1.058];
try{
  const build=spawnSync(process.execPath,[path.join(here,'build-freeze.mjs'),'--out',temp],{encoding:'utf8'});
  if(build.status!==0)throw new Error(build.stderr||build.stdout||'Freeze build failed');
  const [checked,rebuilt]=await Promise.all([readFile(path.join(root,'freeze-manifest-v1.json')),readFile(path.join(temp,'freeze-manifest-v1.json'))]);
  assert(canonical(checked).equals(canonical(rebuilt)),'freeze-manifest-v1.json is stale');
  const freeze=JSON.parse(rebuilt.toString('utf8'));
  assert(freeze.layouts.length===4,'Exactly four layouts required');
  assert(new Set(freeze.layouts.map((l)=>JSON.stringify(l.p))).size===4,'p-layouts must be distinct');
  assert(new Set(freeze.layouts.flatMap((l)=>l.instanceIds)).size===16,'All 16 instanceIds must be unique');
  assert(new Set(freeze.layouts.map((l)=>l.sourceSetId)).size===4,'Source-set slots must be distinct');
  assert(JSON.stringify(freeze.q)===JSON.stringify(expectedQ)&&JSON.stringify(freeze.scales)===JSON.stringify(expectedScales),'Shared q/scales changed');
  assert(freeze.assembly.deterministic===true&&freeze.assembly.controlMarkersAllowed===false,'Assembly must remain deterministic and marker-free');
  for(const summary of freeze.layouts){
    const layout=JSON.parse(await readFile(path.join(root,summary.file),'utf8'));
    assert(layout.status==='frozen-before-images','Layout status changed');
    assert(JSON.stringify(layout.frame)===JSON.stringify([1536,1536]),'Frame changed');
    assert(JSON.stringify(layout.instances.map((i)=>i.q))===JSON.stringify(expectedQ),'Layout q changed');
    assert(JSON.stringify(layout.instances.map((i)=>i.uniformScale))===JSON.stringify(expectedScales),'Layout scale changed');
    assert(layout.instances.every((i)=>insideQuad(i.p,i.q)),'Anchor outside playable quad');
    assert(layout.controlMarkersAllowed===false&&layout.assembly==='deterministic-layered-composition-v2','Layout integration invariant changed');
  }
  console.log('PASS: 4 frozen distinct layouts; 16 unique IDs; anchors inside quad; exact frame/q/scales; deterministic marker-free assembly');
}finally{await rm(temp,{recursive:true,force:true});}
function insideQuad(p,q){const z=(q-.255)/.52;const h=.275+.14*z;return q>=.255&&q<=.775&&p>=.5-h&&p<=.5+h;}
function canonical(b){return Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'),'utf8');}
function assert(c,m){if(!c)throw new Error(m);}
