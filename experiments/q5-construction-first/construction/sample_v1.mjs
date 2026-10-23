import {Motion,ROUTES} from './v1/motion-reference.js';
import fs from 'node:fs';
const dims={thigh:120,shin:120,farThigh:120,farShin:120,nearReach:228.48,farReach:228.48,soleNear:[[-25,30],[65,30]],soleFar:[[-25,30],[65,30]]};
const poses=[],ranges={};
function observe(m){for(const [k,v]of Object.entries(m.pose)){const r=ranges[k]??[Infinity,-Infinity];ranges[k]=[Math.min(r[0],v),Math.max(r[1],v)];}}
for(const [name,route] of Object.entries(ROUTES)){
 const m=new Motion(dims);let index=0;
 for(let i=0;i<960;i++){
  while(index<route.length&&route[index].at<=m.time+1e-8){const e=route[index++];if(e.ground)m.requestGround(e.ground);if(e.jump)m.jump();}
  m.update(1/120);observe(m);
  if(name==='one'&&[0,120,285,555,575,625].includes(i)||name.startsWith('mid')&&[79,92,115].includes(i))poses.push({name:`${name}-${i}`,state:m.state,time:m.time,pose:{...m.pose}});
 }
}
fs.writeFileSync(new URL('./v1/poses.json',import.meta.url),JSON.stringify({dims,ranges,poses},null,2));
console.log(JSON.stringify({ranges,poses:poses.map(x=>({name:x.name,state:x.state}))},null,2));
