import {readFile,writeFile} from 'node:fs/promises';
import {clothGeometry,clothPoint} from '../../app/cloth.mjs';
const data=JSON.parse(await readFile(new URL('../../art/parts.json',import.meta.url)));
const measures=JSON.parse(await readFile(new URL('./measurements.json',import.meta.url)));
const alpha=await readFile(new URL('./cloth-alpha.bin',import.meta.url));
const rest=Object.fromEntries(Object.entries(data.jointPoints).map(([k,p])=>[k,{x:p[0],y:p[1]}]));
const crop=data.parts.find(p=>p.id==='pelvis').cropRect;
const rows=[];
for(const side of ['near','far']){
  const geometry=clothGeometry(crop,side==='near'?[crop[0],520]:[520,crop[0]+crop[2]]);
  for(const row of measures.after){
    const points=geometry.source.map(p=>clothPoint(p,rest,row.state.pose,side));
    const inverted=[];
    for(let i=0;i<geometry.indices.length;i+=3){
      const ids=[geometry.indices[i],geometry.indices[i+1],geometry.indices[i+2]];
      const [a,b,c]=ids.map(i=>points[i]);
      const area=(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
      const x=Math.floor(ids.reduce((s,i)=>s+geometry.source[i].x,0)/3-crop[0]);
      const y=Math.floor(ids.reduce((s,i)=>s+geometry.source[i].y,0)/3-crop[1]);
      if(area<=0&&alpha[y*crop[2]+x]>=128)inverted.push({sourceCentroid:[x+crop[0],y+crop[1]],signedDoubleArea:area});
    }
    rows.push({side,pose:row.label,opaqueSourceTrianglesWithNegativeArea:inverted.length,inverted});
  }
}
await writeFile(new URL('./cloth-audit.json',import.meta.url),JSON.stringify({seamX:520,alphaThreshold:128,
  note:'Opaque at source centroid; this is not a proof of on-screen visibility after normal layer occlusion',rows},null,2)+'\n');
console.log(JSON.stringify(rows.filter(r=>r.pose==='down-120').map(({inverted,...r})=>r)));
