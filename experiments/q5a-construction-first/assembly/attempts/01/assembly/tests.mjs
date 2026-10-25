import assert from 'node:assert/strict';import fs from 'node:fs';import {createHash} from 'node:crypto';import {Rig,cross,len,sub} from './rig.js';import {Motion} from './motion.js';
const read=p=>JSON.parse(fs.readFileSync(new URL(p,import.meta.url))),data=read('./assets/rig-data.json'),source=read('../construction/construction.json'),rig=new Rig(data);
let maxError=0;
for(let p of source.poses){let actual=rig.solve(p.inputs);for(let [name,g] of Object.entries(actual.surfaces)){let expected=p.surfaces[name];assert.equal(g.vertices.length,expected.vertices.length,name);for(let i=0;i<g.vertices.length;i++)for(let k=0;k<2;k++)maxError=Math.max(maxError,Math.abs(g.vertices[i][k]-expected.vertices[i][k]));}}
assert(maxError<1e-8,`static port differs ${maxError}`);
const report={candidate:'Q5A-NELA-ASSEMBLY-01',static_v4_poses:19,max_vertex_error:maxError,scenarios:[],frames:0,inversions:0,max_bone_error:0,max_command_position_velocity_delta:0};
const scenarios=[[[0,'low'],[1.2,'walk'],[3,'idle'],[4,'jump']],[[0,'walk'],[1.2,'low'],[2,'jump'],[2.65,'walk'],[4.8,'jump'],[5.5,'low']],[[0,'low'],[.07,'walk'],[1.2,'idle'],[1.4,'low'],[1.48,'jump'],[2,'low']],[[0,'jump'],[.6,'walk'],[.72,'idle'],[.85,'low']],[[0,'walk'],[.3,'jump'],[.7,'walk'],[1.3,'low'],[2.4,'walk'],[3.2,'stop']]];
for(let [index,commands] of scenarios.entries()){
 let motion=new Motion(),at=0,phases=new Set();
 for(let frame=0;frame<1080;frame++){
  while(at<commands.length&&frame/120>=commands[at][0]){let before=motion.snapshot();motion.command(commands[at++][1]);assert.deepEqual(motion.snapshot(),before,'command reset pose or velocity');}
  let spec=motion.step(),p;try{p=rig.solve(spec);}catch(e){throw Error(`scenario ${index} frame ${frame} ${motion.phase} ${JSON.stringify(spec)} ${e}`);}
  phases.add(motion.phase);report.frames++;
  for(let side of ['far','near'])for(let [a,b,want] of [['hip','knee',98],['knee','ankle',94],['shoulder','elbow',68],['elbow','wrist',62]]){let error=Math.abs(len(sub(p.landmarks[side+'_'+a],p.landmarks[side+'_'+b]))-want);report.max_bone_error=Math.max(report.max_bone_error,error);assert(error<1e-7);}
  for(let op of data.draw_operations)for(let panel of rig.pieces(p,op))for(let tri of panel.triangles){let area=cross(...tri.map(i=>panel.vertices[i])),src=cross(...tri.map(i=>panel.uv[i]));if(area*src>1e-10){report.inversions++;throw Error(`flipped ${index} ${frame} ${op.surface} ${area*src}`);}}
  for(let [i,f] of spec.feet.entries())if(f.contact){let shoe=p.surfaces[(i?'near':'far')+'_shoe'];assert(Math.abs(Math.min(...shoe.vertices.map(v=>v[1])))<1e-8,'planted foot off ground');}
 }
 report.scenarios.push({index,commands,phases:[...phases],events:motion.events.filter(e=>['takeoff','landing','recover'].includes(e.event)),reach_constraints:motion.projections,final:motion.ground});
}
const hashes=read('./assets/inputs.json');for(let [p,h] of Object.entries(hashes.inputs))assert.equal(createHash('sha256').update(fs.readFileSync(new URL('../'+p,import.meta.url))).digest('hex'),h);
console.log(JSON.stringify({result:'PASS',...report},null,2));
