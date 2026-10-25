import{readFile,writeFile}from'node:fs/promises';
import{garmentMatrix,applyMatrix,rigidThighPoint,PANEL_EPSILON,PANEL_ANCHORS}from'../../app/panel-transform.mjs';
import{Motion,STEP}from'../../app/motion.mjs';
const read=async p=>JSON.parse(await readFile(new URL(p,import.meta.url)));
const data=await read('../../build/early-v02-02/art/parts.json');
const samples=await read('../../build/early-v02-02/measurements.json');
const rest=Object.fromEntries(Object.entries(data.jointPoints).map(([k,v])=>[k,{x:v[0],y:v[1]}]));
const ids=['farFlap','nearFlap','waistSeat'];
const alpha=await read('../../build/early-v02-02/sole-contours.json');
const point=p=>({x:p[0],y:p[1]});
const motion=new Motion(rest,data.figureBounds[3],{early:true,groundY:data.groundY,
 contacts:Object.fromEntries(Object.entries(data.contacts).map(([s,c])=>[s,{heel:point(c.heel),toe:point(c.toe)}])),
 soleContours:Object.fromEntries(Object.entries(alpha.feet).map(([s,f])=>[s,f.points]))});
const actual=[motion.snapshot()];
for(const target of['low','idle']){motion.command(target);for(let i=1;i<=120;i++){motion.advance(STEP);if([3,6,9,15,30,60,120].includes(i))actual.push(motion.snapshot());}}
let maxBodyPoseDifference=0;
for(let i=0;i<actual.length;i++)for(const[k,p]of Object.entries(samples.after[i].state.pose)){
 const a=actual[i].pose[k];maxBodyPoseDifference=Math.max(maxBodyPoseDifference,Math.hypot(a.x-p.x,a.y-p.y));
}
const identity=Object.fromEntries(ids.map(id=>[id,garmentMatrix(id,rest,rest)]));
const rows=samples.after.map(row=>({sample:row.label,panels:Object.fromEntries(ids.map(id=>[id,garmentMatrix(id,rest,row.state.pose)]))}));
for(let i=0;i<rows.length;i++){
 const p={x:447,y:755};const mapped=applyMatrix(rows[i].panels.nearFlap,p);
 const control=rigidThighPoint(p,'near',rest,samples.after[i].state.pose);
 rows[i].nearRearHemControlOnly={source:p,affineTarget:mapped,rigidThighReference:control,
  distance:Math.hypot(mapped.x-control.x,mapped.y-control.y),notAnAdditionalConstraint:true};
}
let minimum=Infinity,minimumLocation=null,maximumAnchorError=0;
for(const row of rows)for(const[id,m]of Object.entries(row.panels)){
 if(m.determinant<minimum){minimum=m.determinant;minimumLocation={panel:id,sample:row.sample,relativeArea:m.determinant};}
 if(m.sourceAnchors)for(let i=0;i<3;i++){
  const p=applyMatrix(m,m.sourceAnchors[i]),q=m.targetAnchors[i];
  maximumAnchorError=Math.max(maximumAnchorError,Math.hypot(p.x-q.x,p.y-q.y));
 }
}
const result={scope:'garment matrices only; visual seams not tested',model:'2 root + 1 hem, one affine per flap',
 epsilon:PANEL_EPSILON,anchors:PANEL_ANCHORS,minimumDeterminant:minimum,minimumLocation,maximumAnchorError,
 determinantPass:minimum>PANEL_EPSILON,maxBodyPoseDifference,identity,rows,inheritedPoseInvariants:samples.invariants};
await writeFile(new URL('./MATRICES.json',import.meta.url),JSON.stringify(result,null,2)+'\n');
await writeFile(new URL('./FIXTURES.json',import.meta.url),JSON.stringify({rest,samples:samples.after.map(r=>({label:r.label,state:r.state}))})+'\n');
console.log(JSON.stringify({minimumDeterminant:minimum,minimumLocation,maximumAnchorError,maxBodyPoseDifference,determinantPass:result.determinantPass},null,2));
if(!result.determinantPass||maxBodyPoseDifference>1e-9)process.exitCode=1;
