import {readFile,writeFile}from'node:fs/promises';
import {createHash}from'node:crypto';
import {tracedGeometry}from'./geometry.mjs';
import {materialMeshes,materialPose,signedArea2,boundaryAudit,boundaryPose}from'../../app/boundary-cloth.mjs';
const read=async p=>JSON.parse(await readFile(new URL(p,import.meta.url)));
const raw=await readFile(new URL('../../art/early-v02-03/CLOTH_TRACE.json',import.meta.url));
const trace=JSON.parse(raw),source=await read('./source-cells.json');
const before=await read('../../build/early-v02-02/art/parts.json');
const samples=await read('../../build/early-v02-02/measurements.json');
const rest=Object.fromEntries(Object.entries(before.jointPoints).map(([k,p])=>[k,{x:p[0],y:p[1]}]));
const faces=tracedGeometry(trace,source.cropRect);
const {meshes,coverage}=materialMeshes(faces,source.cropRect,source.cells);
const rows=[];let firstFailure=null;
for(const row of samples.after){
  for(const side of['near','far']){
    const mesh=meshes[side],posed=materialPose(mesh,rest,row.state.pose);
    const counts={alpha1:0,alpha16:0,alpha128:0,visibleV02:0};let minimumArea=Infinity,first=null;
    for(let i=0;i<mesh.indices.length;i+=3){
      const ids=Array.from(mesh.indices.slice(i,i+3)),area=signedArea2(...ids.map(i=>posed[i]));
      minimumArea=Math.min(minimumArea,area);
      if(area<=0){
        const cell=mesh.cells[Math.floor(i/6)];counts.alpha1++;
        if(cell.alpha>=16)counts.alpha16++;if(cell.alpha>=128)counts.alpha128++;
        if(cell.visibleAlpha>0)counts.visibleV02++;
        if(!first)first={sourceCell:[cell.x+source.cropRect[0],cell.y+source.cropRect[1]],alpha:cell.alpha,
          visibleV02Alpha:cell.visibleAlpha,source:ids.map(i=>mesh.source[i]),target:ids.map(i=>posed[i]),signedArea2:area,
          mapping:ids.map(i=>{const m=mesh.mapping[i];return{face:mesh.faces[m.face].id,sourceVertexIndices:m.ids,
            barycentric:m.weights,extrapolated:!m.inside,distanceSquared:m.distance2};})};
      }
    }
    const boundaryFailures=mesh.faces.flatMap(face=>boundaryAudit(face,boundaryPose(face,rest,row.state.pose))
      .filter(t=>t.inverted).map(t=>({face:face.id,...t,source:t.indices.map(i=>face.source[i])})));
    const result={pose:row.label,side,sourceOpaqueCells:mesh.cells.length,invertedCellTriangles:counts,minimumArea,first,boundaryFailures};
    rows.push(result);
    if(!firstFailure&&first)firstFailure={pose:row.label,side,...first};
  }
}
const report={stage:'A_ONLY',traceSha256:createHash('sha256').update(raw).digest('hex'),materialSha256:source.sha256,
  method:'traced-boundary triangulation; boundary arc-length binding; piecewise-affine exhaustive alpha-cell mapping',
  sourceCoverage:coverage,hiddenOverlapAppliedPixels:0,parameterTrialsAfterThisGate:0,
  inheritedPoseInvariants:samples.invariants,result:firstFailure?'FAIL':'PASS',firstFailure,rows};
const input={trace,source,rest,samples:samples.after.map(r=>({label:r.label,pose:r.state.pose})),
  inheritedPoseInvariants:samples.invariants,report};
await writeFile(new URL('./STAGE_A.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
await writeFile(new URL('./stage-a-input.json',import.meta.url),JSON.stringify(input)+'\n');
await writeFile(new URL('./coverage-owners.json',import.meta.url),JSON.stringify({crop:source.cropRect,
  near:meshes.near.cells.map(c=>[c.x,c.y,c.alpha]),far:meshes.far.cells.map(c=>[c.x,c.y,c.alpha])})+'\n');
await writeFile(new URL('./source-geometry.json',import.meta.url),JSON.stringify(faces.map(f=>({id:f.id,side:f.side,
  boundary:f.boundary,indices:Array.from(f.indices)})),null,2)+'\n');
console.log(JSON.stringify({result:report.result,coverage,firstFailure,low:rows.filter(r=>r.pose==='down-120')
  .map(r=>({side:r.side,inversions:r.invertedCellTriangles,boundaryInversions:r.boundaryFailures.length}))},null,2));
