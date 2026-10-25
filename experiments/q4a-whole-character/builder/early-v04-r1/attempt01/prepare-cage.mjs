import fs from'node:fs';import path from'node:path';import{fileURLToPath}from'node:url';import crypto from'node:crypto';
import earcut from'earcut';
import{poseAt,rigidPoint}from'../../app/early-v04-r1/kinematics.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const tracePath=path.join(root,'art/early-v04-r1/SHORTS_TRACE.json'),trace=read(tracePath),g=read(path.join(here,'SOURCE_GEOMETRY.json'));
const area=p=>p.reduce((v,a,i)=>{const b=p[(i+1)%p.length];return v+a[0]*b[1]-a[1]*b[0];},0)/2;
let poly=trace.boundary.map(p=>[...p]);if(area(poly)<0)poly.reverse();
// Fixed two-pixel outward AA guard, geometry only: never edits source texture/mask.
// True cuffs/waist determine semantic constraints, not rectangular texture bounds.
function offset(p,d){return p.map((b,i)=>{
 const a=p[(i+p.length-1)%p.length],c=p[(i+1)%p.length],u=[b[0]-a[0],b[1]-a[1]],v=[c[0]-b[0],c[1]-b[1]];
 const un=Math.hypot(...u),vn=Math.hypot(...v),A=[b[0]+d*u[1]/un,b[1]-d*u[0]/un],B=[b[0]+d*v[1]/vn,b[1]-d*v[0]/vn];
 const det=u[0]*v[1]-u[1]*v[0];if(Math.abs(det)<1e-9)return A;
 const t=((B[0]-A[0])*v[1]-(B[1]-A[1])*v[0])/det;return[A[0]+t*u[0],A[1]+t*u[1]];
 });}
poly=offset(poly,2);
function distanceToCurve(q,curve){let best=Infinity;for(let i=0;i<curve.length-1;i++){
 const a=curve[i],b=curve[i+1],v=[b[0]-a[0],b[1]-a[1]],t=Math.max(0,Math.min(1,((q[0]-a[0])*v[0]+(q[1]-a[1])*v[1])/(v[0]*v[0]+v[1]*v[1])));
 best=Math.min(best,Math.hypot(q[0]-a[0]-t*v[0],q[1]-a[1]-t*v[1]));}return best;}
const owner=q=>{const a=[['pelvis',trace.waistband],['nearThigh',trace.nearLegOpening],['farThigh',trace.farLegOpening]].map(([id,c])=>[id,distanceToCurve(q,c)]).sort((a,b)=>a[1]-b[1]);return a[0][1]<=3.5?a[0][0]:null;};
const vertices=poly.map(p=>[...p]),constraints={};vertices.forEach((p,i)=>{const o=owner(p);if(o)constraints[i]=o;});
const flat=earcut(poly.flat());let triangles=[];for(let i=0;i<flat.length;i+=3)triangles.push(flat.slice(i,i+3));
const orient=t=>(vertices[t[1]][0]-vertices[t[0]][0])*(vertices[t[2]][1]-vertices[t[0]][1])-(vertices[t[1]][1]-vertices[t[0]][1])*(vertices[t[2]][0]-vertices[t[0]][0]);
triangles=triangles.map(t=>orient(t)>0?t:[t[0],t[2],t[1]]);
// Conforming longest-edge refinement, one topology before targets/solve.
for(let iteration=0;iteration<10000;iteration++){
 let edge=null,max=30;for(const t of triangles)for(let j=0;j<3;j++){
  const a=t[j],b=t[(j+1)%3],d=Math.hypot(vertices[a][0]-vertices[b][0],vertices[a][1]-vertices[b][1]);if(d>max){max=d;edge=[a,b];}}
 if(!edge)break;const[a,b]=edge,m=vertices.length;vertices.push([(vertices[a][0]+vertices[b][0])/2,(vertices[a][1]+vertices[b][1])/2]);
 if(constraints[a]&&constraints[a]===constraints[b])constraints[m]=constraints[a];
 const next=[];for(const t of triangles){if(t.includes(a)&&t.includes(b)){
  const c=t.find(i=>i!==a&&i!==b);for(let q of[[a,m,c],[m,b,c]]){if(orient(q)<0)q=[q[0],q[2],q[1]];next.push(q);}
 }else next.push(t);}triangles=next;
}
const rest={sourceTrace:'art/early-v04-r1/SHORTS_TRACE.json',sourceTraceSha256:crypto.createHash('sha256').update(fs.readFileSync(tracePath)).digest('hex'),
 method:'one constrained ARAP cage, v04 only',aaGeometryGuardPx:2,guardIsNotTextureRepair:true,
 semanticTrace:trace,vertices,triangles,constraints,sourceGeometrySha256:crypto.createHash('sha256').update(fs.readFileSync(path.join(here,'SOURCE_GEOMETRY.json'))).digest('hex')};
fs.writeFileSync(path.join(here,'CAGE_REST.json'),JSON.stringify(rest,null,2)+'\n');
const frames=[];for(let i=0;i<=240;i++){
 const s=poseAt(g,i/240,0),positions={};for(const[index,o]of Object.entries(constraints)){
  const p=vertices[index];positions[index]=o==='pelvis'?[p[0]+s.root[0],p[1]+s.root[1]]:rigidPoint(p,...[s.transforms[o].sourceAnchor,s.transforms[o].targetAnchor,s.transforms[o].angle]);}
 frames.push({label:`low-${i}`,low:i/240,positions});
}
fs.writeFileSync(path.join(here,'CAGE_TARGETS.json'),JSON.stringify({drop:230,back:-110,frames},null,2)+'\n');
console.log(JSON.stringify({vertices:vertices.length,triangles:triangles.length,constraints:Object.keys(constraints).length,owners:Object.fromEntries(['pelvis','nearThigh','farThigh'].map(o=>[o,Object.values(constraints).filter(v=>v===o).length]))}));
