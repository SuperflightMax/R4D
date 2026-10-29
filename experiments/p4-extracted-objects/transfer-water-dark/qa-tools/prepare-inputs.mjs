import {execFileSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';

const [coordArg,oldOracleArg,runtimeArg]=process.argv.slice(2);
if(![coordArg,oldOracleArg,runtimeArg].every(Boolean))throw Error('Usage: node prepare-inputs.mjs <common-inputs-json> <existing-own-jungle-oracle> <own-transfer-runtime>');
const cwd=process.cwd(),coordPath=resolve(coordArg),oldOracle=resolve(oldOracleArg),runtime=resolve(runtimeArg);
const descriptorBytes=readFileSync(coordPath),d=JSON.parse(descriptorBytes);
const sha=b=>createHash('sha256').update(b).digest('hex');
const git=(...args)=>execFileSync('git',['-C',d.readOnlyGitObjectSource,...args],{cwd});
const put=(p,b)=>{mkdirSync(resolve(p,'..'),{recursive:true});writeFileSync(p,b);};
const oldInputs=JSON.parse(readFileSync(join(oldOracle,'input-verification.json')));
assert.equal(oldInputs.nativeCommit,d.native.sourceCommit);
for(const f of oldInputs.nativeFiles)assert.equal(sha(readFileSync(join(oldOracle,'native',f.path))),f.sha256);
const canonPath='orders/perspective/P4-transfer-water-dark.md';
assert.equal(git('rev-parse',`${d.canonicalRevision}:${canonPath}`).toString().trim(),'0db67e8c3c841ede323a809789f5146ca4f77f11');
for(const board of d.boards){
  const name=board.board==='04'?'water':'dark',out=join(runtime,name);
  const objects=[];
  for(const [key,file] of [['config','config.json'],['manifest','manifest.json']]){
    const bytes=git('show',`${d.acceptedP1Revision}:${board[key+'Path']}`);
    assert.equal(bytes.length,board[key+'Bytes']);assert.equal(sha(bytes),board[key+'Sha256']);
    put(join(out,'inputs',file),bytes);
    objects.push({file,gitPath:board[key+'Path'],gitBlob:git('rev-parse',`${d.acceptedP1Revision}:${board[key+'Path']}`).toString().trim(),bytes:bytes.length,sha256:sha(bytes)});
  }
  const math=git('show',`${d.commonViewMath.revision}:${d.commonViewMath.path}`);
  assert.equal(math.length,d.commonViewMath.bytes);assert.equal(sha(math),d.commonViewMath.sha256);
  put(join(out,'inputs','view-math.mjs'),math);
  const jpg=readFileSync(board.image);assert.equal(jpg.length,board.imageBytes);assert.equal(sha(jpg),board.imageSha256);
  const report={schema:'r4d.p4.transfer.qa.inputs.v1',board:name,boardId:board.board,activeTrial:board.activeTrial,acceptedP1Revision:d.acceptedP1Revision,canon:{commit:d.canonicalRevision,path:canonPath,blob:'0db67e8c3c841ede323a809789f5146ca4f77f11'},coordinationDescriptorSha256:sha(descriptorBytes),objects,viewMath:{revision:d.commonViewMath.revision,path:d.commonViewMath.path,bytes:math.length,sha256:sha(math)},sourceImage:{name:board.image.split(/[\\/]/).at(-1),bytes:jpg.length,sha256:sha(jpg)},native:{commit:d.native.sourceCommit,declaredPackageTree:d.native.packageTree,verifiedOwnSourceFiles:oldInputs.nativeFiles.length,sourceHashesReference:'Jungle input-verification.json',packageTreeReconstructed:false,newCheckout:false,rebuild:false},scope:'binding/startup preparation; not consumer/Art QA'};
  const reportBytes=Buffer.from(JSON.stringify(report,null,2)+'\n');put(join(out,'INPUTS.json'),reportBytes);
  const cfg=JSON.parse(readFileSync(join(out,'inputs/config.json'))),m=JSON.parse(readFileSync(join(out,'inputs/manifest.json')));
  console.log(JSON.stringify({board:name,path:join(out,'INPUTS.json'),sha256:sha(reportBytes),configCounts:{pins:cfg.board.pins.length,segments:cfg.board.segments.length,buckets:cfg.board.buckets.length,drops:cfg.board.drops.length},manifestKeys:Object.keys(m),translation:m.translation,settings:{defaults:cfg.defaults,physics:cfg.physics,rng:cfg.rng,ball:cfg.board.ball,drops:cfg.board.drops},idMapping:m.idMapping}));
}
