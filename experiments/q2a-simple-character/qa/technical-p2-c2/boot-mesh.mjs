import fs from 'node:fs';
import {Motion} from '../../snapshots/p2_candidate_c2/runtime/motion.js';
import {setMeasuredBind,mapPoint} from '../../snapshots/p2_candidate_c2/runtime/pose.js';
const here=new URL('.',import.meta.url),load=p=>JSON.parse(fs.readFileSync(new URL(p,here)));
setMeasuredBind(load('../../snapshots/p2_candidate_c2/runtime/art-binding.json').rig);
const m=new Motion();m.restore(load('angle-repro.json').state);const pose=m.pose(),grid=load('boot-grid.json'),result={};
const area=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
for(const side of ['near','far']){const g=grid[side],opaque=g.triangles.filter(t=>t.every(i=>g.vertices[i].alpha>128));const values=opaque.map(t=>{const base=t.map(i=>g.vertices[i].p),deformed=base.map(p=>mapPoint('foot_'+side,p,pose));return {indices:t,ratio:area(...deformed)/area(...base)}});result[side]={opaqueTriangles:opaque.length,flipped:values.filter(v=>v.ratio<0),minimumRatio:Math.min(...values.map(v=>v.ratio))};}
fs.writeFileSync(new URL('boot-mesh-result.json',here),JSON.stringify(result,null,2));console.log(result);
