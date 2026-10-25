import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';import {Rig,cross,len,sub} from './rig.js';import {Motion} from './motion.js';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url))),data=read('./assets/rig-data.json'),source=read('../construction/construction.json'),rig=new Rig(data);
let maxError=0;
for(let p of source.poses){let actual=rig.solve(p.inputs);for(let [name,g] of Object.entries(actual.surfaces)){let expected=p.surfaces[name];assert.equal(g.vertices.length,expected.vertices.length,name);for(let i=0;i<g.vertices.length;i++)for(let k=0;k<2;k++)maxError=Math.max(maxError,Math.abs(g.vertices[i][k]-expected.vertices[i][k]));}}
assert(maxError<1e-8,`static port differs ${maxError}`);
const report={candidate:'Q5A-NELA-ASSEMBLY-02',static_v4_poses:19,max_vertex_error:maxError,scenarios:[],frames:0,inversions:0,max_bone_error:0,max_command_position_velocity_delta:0,max_frame_vertex_displacement:0,cloth_constraint_frames:0,max_cloth_blend:0,max_joint_flex:0,strict_self_intersections:0};
const scenarios=[[[0,'low'],[1.2,'walk'],[3,'idle'],[4,'jump']],[[0,'walk'],[1.2,'low'],[2,'jump'],[2.65,'walk'],[4.8,'jump'],[5.5,'low']],[[0,'low'],[.07,'walk'],[1.2,'idle'],[1.4,'low'],[1.48,'jump'],[2,'low']],[[0,'jump'],[.6,'walk'],[.72,'idle'],[.85,'low']],[[0,'walk'],[.3,'jump'],[.7,'walk'],[1.3,'low'],[2.4,'walk'],[3.2,'stop']],[[0,'walk'],[2,'stop'],[4,'idle'],[4.2,'low'],[4.5,'idle']]];
let seed=20261025;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/2**32;};
for(let i=0;i<8;i++){let commands=[],t=0;while(t<8.3){commands.push([t,['idle','low','walk','jump','stop'][Math.floor(random()*5)]]);t+=.07+random()*.43;}scenarios.push(commands);}
for(let [index,commands] of scenarios.entries()){
 let motion=new Motion(),at=0,phases=new Set(),previous=null,previousFeet=null;if(index===5)motion.stopTarget='low';
 for(let frame=0;frame<1080;frame++){
  while(at<commands.length&&frame/120>=commands[at][0]){let before=motion.snapshot();motion.command(commands[at++][1]);assert.deepEqual(motion.snapshot(),before,'command reset pose or velocity');}
  let spec=motion.step(),p;try{p=rig.solve(spec);}catch(e){throw Error(`scenario ${index} frame ${frame} ${motion.phase} ${JSON.stringify(spec)} ${e}`);}
  phases.add(motion.phase);report.frames++;
  if(previousFeet)motion.feet.forEach((f,i)=>{if(f.contact&&previousFeet[i].contact)assert.equal(f.x,previousFeet[i].x,'planted sole anchor slid');});previousFeet=motion.feet.map(f=>({x:f.x,contact:f.contact}));
  if(previous)for(let [name,g] of Object.entries(p.surfaces))for(let [i,v] of g.vertices.entries()){let d=len(sub(v,previous.surfaces[name].vertices[i]));if(d>report.max_frame_vertex_displacement){report.max_frame_vertex_displacement=d;report.max_displacement_case={scenario:index,frame,surface:name,vertex:i,phase:motion.phase,root:p.landmarks.pelvis,previousRoot:previous.landmarks.pelvis};}assert(d<14,`pose discontinuity ${index} ${frame} ${name} ${d}`);}previous=p;
  for(let panel of p.surfaces.pelvis_shorts.patches)if(Math.hypot(...panel.constraintOffset)>0){report.cloth_constraint_frames++;report.max_cloth_blend=Math.max(report.max_cloth_blend,Math.hypot(...panel.constraintOffset));}
  for(let side of ['far','near'])for(let name of ['arm_skin','leg_skin']){let f=p.surfaces[side+'_'+name].flex;report.max_joint_flex=Math.max(report.max_joint_flex,f);assert(f<=140.001,`range ${index} ${frame} ${side} ${name} ${f}`);}
  for(let side of ['far','near'])for(let [a,b,want] of [['hip','knee',98],['knee','ankle',94],['shoulder','elbow',68],['elbow','wrist',62]]){let error=Math.abs(len(sub(p.landmarks[side+'_'+a],p.landmarks[side+'_'+b]))-want);report.max_bone_error=Math.max(report.max_bone_error,error);assert(error<1e-7);}
  for(let op of data.draw_operations)for(let panel of rig.pieces(p,op))for(let tri of panel.triangles){let area=cross(...tri.map(i=>panel.vertices[i])),src=cross(...tri.map(i=>panel.uv[i]));if(area*src>1e-10){report.inversions++;throw Error(`flipped ${index} ${frame} ${op.surface} ${area*src}`);}}
  for(let [i,f] of spec.feet.entries())if(f.contact){let shoe=p.surfaces[(i?'near':'far')+'_shoe'];assert(Math.abs(Math.min(...shoe.vertices.map(v=>v[1])))<1e-8,'planted foot off ground');}
  for(let [name,g] of Object.entries(p.surfaces))for(let poly of g.patches?g.patches.map(q=>q.outline):g.silhouette_regions??[g.outline])for(let i=0;i<poly.length;i++)for(let j=i+2;j<poly.length;j++){if((j+1)%poly.length===i)continue;let [a,b,c,d]=[poly[i],poly[(i+1)%poly.length],poly[j],poly[(j+1)%poly.length]];if(cross(a,b,c)*cross(a,b,d)<-1e-7&&cross(c,d,a)*cross(c,d,b)<-1e-7){report.strict_self_intersections++;throw Error(`crossing ${index} ${frame} ${name}`);}}
 }
 report.scenarios.push({index,commands,phases:[...phases],events:motion.events.filter(e=>['takeoff','landing','recover'].includes(e.event)),reach_constraints:motion.projections,final:motion.ground});
}
// Flight ground-choice commands only select the eventual landing behaviour.
let first=new Motion(),second=new Motion();first.command('jump');second.command('jump');for(let i=0;i<75;i++){first.step();second.step();}assert.equal(first.phase,'flight');second.command('walk');for(let i=0;i<35;i++){let a=first.step(),b=second.step();assert.deepEqual(a,b,'ground target changed airborne trajectory');}report.airborne_target_isolation='PASS';
const hashes=read('./assets/inputs.json');for(let [p,h] of Object.entries(hashes.inputs))assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+p,import.meta.url))).digest('hex'),h);
console.log(JSON.stringify({result:'PASS',...report},null,2));
