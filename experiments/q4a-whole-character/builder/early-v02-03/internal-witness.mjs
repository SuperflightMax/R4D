import{readFile,writeFile}from'node:fs/promises';
import{materialMeshes,materialPose,signedArea2,boundaryPose,boundaryAudit}from'../../build/early-v02-03/source/app/boundary-cloth.mjs';
const read=async p=>JSON.parse(await readFile(new URL(p,import.meta.url)));
const input=await read('../../build/early-v02-03/stage-a-input.json');
const saved=await read('../../build/early-v02-03/source-geometry.json');
const faces=saved.map(f=>({...f,source:f.boundary.map(v=>v.source),indices:new Uint32Array(f.indices)}));
const{meshes}=materialMeshes(faces,input.source.cropRect,input.source.cells);
let witness=null,faceWitness=null,identityMinimum=Infinity,identityInversions=0;
for(const mesh of Object.values(meshes)){
 const p=materialPose(mesh,input.rest,input.rest);
 for(let i=0;i<mesh.indices.length;i+=3){
  const a=signedArea2(...Array.from(mesh.indices.slice(i,i+3)).map(i=>p[i]));
  identityMinimum=Math.min(identityMinimum,a);if(a<=0)identityInversions++;
 }
}
for(const row of input.samples){
 for(const side of['near','far']){
  const m=meshes[side],p=materialPose(m,input.rest,row.pose);
  for(let i=0;!witness&&i<m.indices.length;i+=3){
   const ids=Array.from(m.indices.slice(i,i+3)),cell=m.cells[Math.floor(i/6)];
   const area=signedArea2(...ids.map(i=>p[i]));
   if(area<=0&&cell.alpha>=128&&cell.visibleAlpha>=128&&ids.every(i=>m.mapping[i].inside)){
    witness={pose:row.label,side,sourceCell:[cell.x+input.source.cropRect[0],cell.y+input.source.cropRect[1]],
     alpha:cell.alpha,visibleV02Alpha:cell.visibleAlpha,source:ids.map(i=>m.source[i]),target:ids.map(i=>p[i]),
     sourceSignedArea2:signedArea2(...ids.map(i=>m.source[i])),targetSignedArea2:area,
     mapping:ids.map(i=>({face:m.faces[m.mapping[i].face].id,sourceVertexIndices:m.mapping[i].ids,
      barycentric:m.mapping[i].weights,extrapolated:!m.mapping[i].inside}))};
   }
  }
  if(!faceWitness)for(const f of m.faces){
   const posed=boundaryPose(f,input.rest,row.pose);
   const first=boundaryAudit(f,posed).find(t=>t.inverted);
   if(first){faceWitness={pose:row.label,side,face:f.id,...first,source:first.indices.map(i=>f.source[i]),
    target:first.indices.map(i=>posed[i])};break;}
  }
 }
}
const output={readOnlyFrozenStageA:true,parameterChanges:0,sourceIdentity:{testedCellTriangles:input.source.cells.length*2,
 minimumSignedArea2:identityMinimum,inversions:identityInversions},fullyInternalVisibleCell:witness,boundaryFace:faceWitness};
await writeFile(new URL('./INTERNAL_WITNESS.json',import.meta.url),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
