import fs from 'node:fs';
import {poseAt,setMeasuredBind,bind,length,sub,rad} from './pose.js';
const handoff=JSON.parse(fs.readFileSync(new URL('./art-binding.json',import.meta.url),'utf8'));
setMeasuredBind(handoff.rig);
let maxError=0;const extrema={near:{ankle:-Infinity,knee:0},far:{ankle:-Infinity,knee:0}};
for(let i=0;i<=1000;i++){
 const q=i/1000,p=poseAt(q,0);
 for(const side of ['near','far']){
  const b=bind[side],c=p[side],l1=length(sub(b.knee,b.hip)),l2=length(sub(b.ankle,b.knee));
  maxError=Math.max(maxError,Math.abs(length(sub(c.knee,c.hip))-l1),Math.abs(length(sub(c.ankle,c.knee))-l2));
  const d=length(sub(c.ankle,c.hip));
  const knee=180-Math.acos((l1*l1+l2*l2-d*d)/(2*l1*l2))/rad(1);
  const ankle=Math.atan2(c.knee[0]-c.ankle[0],c.ankle[1]-c.knee[1])/rad(1);
  extrema[side].ankle=Math.max(extrema[side].ankle,ankle);extrema[side].knee=Math.max(extrema[side].knee,knee);
 }
}
console.log(JSON.stringify({version:handoff.version,maxError,extrema,bind,low:poseAt(1,0)},null,2));
