import { mkdtemp, readFile, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const output=path.join(root,'output');
const temp=await mkdtemp(path.join(os.tmpdir(),'r4d-p0-final-series-check-'));
const boardFiles=['composite.png','integration-manifest.json','numeric-report.json','hashes.json'];
try{
  const build=spawnSync(process.execPath,[path.join(here,'build-final-series.mjs'),'--out',temp],{encoding:'utf8'});
  if(build.status!==0)throw new Error(build.stderr||build.stdout||'Final-series rebuild failed');
  for(const boardId of ['board-01','board-02','board-03','board-04']){
    for(const name of boardFiles){
      const [expected,actual]=await Promise.all([readFile(path.join(output,boardId,name)),readFile(path.join(temp,boardId,name))]);
      const equal=name.endsWith('.png')?expected.equals(actual):canonicalText(expected).equals(canonicalText(actual));
      assert(equal,`${boardId}/${name} is not reproducible; run npm run build:final-series`);
    }
    const [expectedIntegration,actualIntegration]=await Promise.all([readFile(path.join(output,'integration',`${boardId}.json`)),readFile(path.join(temp,'integration',`${boardId}.json`))]);
    assert(canonicalText(expectedIntegration).equals(canonicalText(actualIntegration)),`${boardId} factual integration manifest is stale`);
    const report=JSON.parse(actualIntegration);
    assert(report.output.sha256.length===64,`${boardId} composite hash missing`);
  }
  const [galleryA,galleryB]=await Promise.all([readFile(path.join(output,'gallery.html')),readFile(path.join(temp,'gallery.html'))]);
  assert(canonicalText(galleryA).equals(canonicalText(galleryB)),'gallery.html is not reproducible');
  const cross=spawnSync(process.execPath,[path.join(here,'check-cross-series.mjs'),'--integration-dir',path.join(temp,'integration')],{encoding:'utf8'});
  if(cross.status!==0)throw new Error(cross.stderr||cross.stdout||'Cross-series factual manifest check failed');
  console.log('PASS: four exact PNG byte reproductions; factual manifests/reports/hashes/gallery reproducible; cross-series contract passes');
}finally{await rm(temp,{recursive:true,force:true});}
function canonicalText(b){return Buffer.from(b.toString('utf8').replace(/\r\n/g,'\n'),'utf8');}
function assert(c,m){if(!c)throw new Error(m);}
