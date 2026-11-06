import {chainIK,mix} from './motion.js';
const nearest=(a,reference)=>reference+Math.atan2(Math.sin(a-reference),Math.cos(a-reference));
export class Rig {
 constructor(parts,motion,soles={}){this.parts=parts;this.byId=Object.fromEntries(parts.map(p=>[p.id,p]));this.motion=motion;this.soles=soles;}
 solve(){
  const m=this.motion,p=m.sample(),angles={};
  for(const part of this.parts)angles[part.id]=typeof p[part.id]==='number'?p[part.id]:0;
  const world={},solutions={};
  const transform=id=>{
   if(world[id])return world[id];const part=this.byId[id];if(!part)throw new Error('Missing parent '+id);
   const parent=part.parent?transform(part.parent):{x:p.core.x,y:p.core.y,angle:0};
   const c=Math.cos(parent.angle),s=Math.sin(parent.angle),joint=part.joint;
   return world[id]={x:parent.x+joint[0]*c-joint[1]*s,y:parent.y+joint[0]*s+joint[1]*c,angle:parent.angle+(id==='core'?p.core.angle:angles[id])};
  };
  transform('core');
  for(const leg of m.legs){
   const upper=this.byId['upper'+leg.id],lower=this.byId['lower'+leg.id],foot=this.byId['foot'+leg.id];
   if(!upper||!lower||!foot)continue;
   const parent=transform(upper.parent),c=Math.cos(parent.angle),s=Math.sin(parent.angle);
   const hip={x:parent.x+upper.joint[0]*c-upper.joint[1]*s,y:parent.y+upper.joint[0]*s+upper.joint[1]*c};
   const target=m.foot(leg),a=Math.hypot(...lower.joint),b=Math.hypot(...foot.joint),axisA=Math.atan2(lower.joint[1],lower.joint[0]),axisB=Math.atan2(foot.joint[1],foot.joint[0]);
   const solved=chainIK(target.x-hip.x,target.y-hip.y,a,b,leg.bend);
   const fold={Left:[3.65,-3.35,-.4],Right:[-.51,3.35,.4],Rear:[-.1,2.95,0]}[leg.id];
   angles[upper.id]=mix(fold[0],nearest(solved.alpha-axisA-parent.angle,fold[0]),p.deploy);
   angles[lower.id]=mix(fold[1],nearest(solved.beta+axisA-axisB,fold[1]),p.deploy);
   const lowerWorld=transform(lower.id);
   angles[foot.id]=mix(fold[2],0,p.deploy)-lowerWorld.angle;
   solutions[leg.id]={...solved,hip,target,deploy:p.deploy};
  }
  for(const part of this.parts)transform(part.id);
  const gaps={};
  for(const leg of m.legs){const foot=world['foot'+leg.id];if(!foot)continue;const points=this.soles[leg.id]??[[0,leg.sole]];const y=Math.max(...points.map(([x,y])=>foot.y+x*Math.sin(foot.angle)+y*Math.cos(foot.angle)));gaps[leg.id]=leg.plane-y;}
  return {world,solutions,gaps,pose:p};
 }
}
