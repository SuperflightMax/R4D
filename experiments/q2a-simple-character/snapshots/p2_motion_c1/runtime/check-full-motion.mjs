import fs from 'node:fs';
import {Motion} from './motion.js';
import {setMeasuredBind,bind,length,sub,rad,add,rotate} from './pose.js';
setMeasuredBind(JSON.parse(fs.readFileSync(new URL('./art-binding.json',import.meta.url),'utf8')).rig);
let frames=0,maxLengthError=0,maxContactDrift=0,maxCommandJump=0,maxAnkle=0,ankleCase=null,maxFloorPenetration=0;
const supportTypes=new Set();
const phases=new Set();
function sample(m,previous){
 const p=m.pose();frames++;phases.add(m.s.stage);
 for(const side of ['near','far']){
  const b=bind[side],c=p[side];
  for(const [a,z]of[['hip','knee'],['knee','ankle'],['shoulder','elbow'],['elbow','wrist']])maxLengthError=Math.max(maxLengthError,Math.abs(length(sub(c[z],c[a]))-length(sub(b[z],b[a]))));
  const foot=m.s.feet[side];
  for(const name of ['heel','toe'])if(b[name]){const point=add(foot.p,rotate(sub(b[name],b.ankle),foot.angle));maxFloorPenetration=Math.max(maxFloorPenetration,point[1]-bind.ground)}
  if(m.s.contacts[side]){
   const type=foot.support||'flat',base=type==='flat'?b.ankle:b[type],point=add(foot.p,rotate(sub(base,b.ankle),foot.angle));supportTypes.add(type);
   const floor=type==='flat'?b.ankle[1]:bind.ground;
   if(Math.abs(point[1]-floor)>1e-7)throw Error('Declared support above/below floor');
   if(previous?.contacts[side]&&(previous.feet[side].support||'flat')===type){const prior=previous.feet[side],oldPoint=add(prior.p,rotate(sub(base,b.ankle),prior.angle));maxContactDrift=Math.max(maxContactDrift,length(sub(point,oldPoint)))}
   const ankle=Math.atan2(c.knee[0]-c.ankle[0],c.ankle[1]-c.knee[1])/rad(1)-foot.angle/rad(1);
   if(ankle>maxAnkle){maxAnkle=ankle;ankleCase={side,time:m.s.time,stage:m.s.stage,stageTime:m.s.stageTime,goal:m.s.goal,q:m.s.q,pelvis:p.pelvis,knee:c.knee,ankle:c.ankle}}
  }
 }
 if(!Number.isFinite(p.pelvis[0]+p.pelvis[1]))throw Error('Nonfinite pose');
}
function command(m,name){const a=m.pose();m.command(name);const b=m.pose();for(const side of ['near','far'])for(const k of ['hip','knee','ankle','shoulder','elbow','wrist'])maxCommandJump=Math.max(maxCommandJump,length(sub(a[side][k],b[side][k])))}
function advance(m,seconds){for(let i=0;i<Math.round(seconds*120);i++){const previous=m.save();m.tick(1/120);sample(m,previous)}}
for(const gap of [.11,.27,.65,1.4]){
 const m=new Motion();
 for(const action of ['idle','low','walk','idle','jump','idle']){command(m,action);advance(m,action==='jump'?1.6:gap)}
 for(const action of ['walk','low','jump','walk','jump','low']){command(m,action);advance(m,action==='jump'?.62:gap)}
 advance(m,3);
}
for(const delay of [.04,.16,.38,.72])for(const interrupt of ['walk','jump']){
 const m=new Motion();command(m,'low');advance(m,delay);command(m,interrupt);advance(m,2.5);
 const state=m.save(),pose=m.pose();m.restore(state);if(length(sub(m.pose().pelvis,pose.pelvis))!==0)throw Error('History restore changes pose');
}
const stress=new Motion();let seed=2049;
for(let i=0;i<14000;i++){if(i%71===0){seed=(Math.imul(seed,1664525)+1013904223)>>>0;command(stress,['idle','low','walk','jump'][seed%4])}const prev=stress.save();stress.tick(1/120);sample(stress,prev)}
if(maxLengthError>1e-7||maxContactDrift>1e-7||maxCommandJump>1e-7)throw Error('Motion invariant failed');
console.log(JSON.stringify({frames,phases:[...phases],supportTypes:[...supportTypes],maxLengthError,maxContactDrift,maxCommandJump,maxFloorPenetration,maxContactAnkleDorsi:maxAnkle,ankleCase},null,2));
