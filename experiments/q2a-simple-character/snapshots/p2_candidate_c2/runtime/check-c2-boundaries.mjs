import fs from 'node:fs';
import {Motion} from './motion.js';
import * as next from './pose.js';
import * as previous from '../snapshots/p2_motion_c1_contactfix01/runtime/pose.js';
const rig=JSON.parse(fs.readFileSync(new URL('./art-binding.json',import.meta.url),'utf8')).rig;
next.setMeasuredBind(rig);previous.setMeasuredBind(rig);
const m=new Motion();m.command('walk');for(let i=0;i<360;i++)m.tick(1/120);
const rows=[];
for(const phase of ['walk','flight']){
 if(phase==='flight'){m.command('jump');while(!(m.s.stage==='flight'&&m.s.stageTime>.35))m.tick(1/120)}
 const pose=m.pose();
 for(const [id,p] of [['leg_near',[515,585]],['leg_far',[475,585]]]){
  const before=next.length(next.sub(previous.mapPoint('body',p,pose),previous.mapPoint(id,p,pose)));
  const after=next.length(next.sub(next.mapPoint('body',p,pose),next.mapPoint(id,p,pose)));
  rows.push({phase,id,point:p,before,after});
 }
 for(const p of [[502,337],[478,381],[541,372]])rows.push({phase,armPoint:p,old:previous.mapPoint('arm_near',p,pose),new:next.mapPoint('arm_near',p,pose)});
}
console.log(JSON.stringify(rows,null,2));
