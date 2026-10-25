// One Q2A motion controller. New locomotion/jump data; no prior experiment code.
import {bind,poseAt,length,sub,rad,clamp,smooth,mix} from './pose.js';
const sides=['near','far'];
const spring=(x,v,target,dt,frequency=9)=>{const a=frequency*frequency*(target-x)-2*frequency*v;v+=a*dt;return [x+v*dt,v]};
const opposite=side=>side==='near'?'far':'near';
export class Motion {
 constructor(){
  this.s={time:0,x:0,vx:0,q:0,qv:0,rootY:554,rootV:0,goal:'idle',stage:'ground',stageTime:0,jump:null,walk:0,phase:0,stepClock:0,nextSide:'far',commandSerial:0,feet:{},arms:{},armV:{},contacts:{near:true,far:true}};
  for(const side of sides){const b=bind[side];this.s.feet[side]={p:b.ankle.slice(),angle:0,plan:null};this.s.arms[side]=[Math.atan2(b.elbow[0]-b.shoulder[0],b.elbow[1]-b.shoulder[1]),Math.atan2(b.wrist[0]-b.elbow[0],b.wrist[1]-b.elbow[1])];this.s.armV[side]=[0,0]}
 }
 command(action){
  const s=this.s;
  if(action==='jump'){
   if(s.stage!=='ground')return false;
   s.jump={startQ:s.q,launchVx:s.vx,startY:s.rootY,startFeet:null};s.stage='prepare';s.stageTime=0;
  }else if(['idle','low','walk'].includes(action))s.goal=action;
  else throw Error('Unknown Q2A command '+action);
  s.commandSerial++;return true;
 }
 save(){return structuredClone(this.s)}
 restore(state){this.s=structuredClone(state)}
 stepFoot(side,end,duration=.42,lift=42){const f=this.s.feet[side];f.plan={from:f.p.slice(),end,duration,elapsed:0,lift};this.s.contacts[side]=false}
 tick(dt){
  // UI uses fixed 1/120s integration; simulation also exercises this exact path.
  const s=this.s;s.time+=dt;s.stageTime+=dt;
  if(s.stage==='prepare'&&s.stageTime>=.26){s.stage='push';s.stageTime=0}
  if(s.stage==='push'&&s.stageTime>=.20){s.stage='flight';s.stageTime=0;s.jump.startY=s.rootY;s.jump.startFeet={};for(const side of sides){s.jump.startFeet[side]=s.feet[side].p.slice();s.feet[side].plan=null;s.contacts[side]=false}}
  if(s.stage==='flight'&&s.stageTime>=.72){s.stage='land';s.stageTime=0;for(const side of sides){s.feet[side].p=[bind[side].ankle[0]+s.x,bind[side].ankle[1]];s.contacts[side]=true;s.feet[side].angle=0}}
  if(s.stage==='land'&&s.stageTime>=.30){s.stage='ground';s.stageTime=0;s.jump=null}
  const walking=s.stage==='ground'&&s.goal==='walk';
  const desiredV=s.stage==='flight'?s.jump.launchVx:(s.stage==='prepare'||s.stage==='push'?s.jump.launchVx*.35:walking?115:0);
  s.vx+=(desiredV-s.vx)*(1-Math.exp(-7*dt));s.x+=s.vx*dt;
  s.walk+=(Number(walking)-s.walk)*(1-Math.exp(-7*dt));s.phase+=dt*2*Math.PI/1.04;
  let qTarget=s.goal==='low'?1:0;
  if(s.stage==='prepare')qTarget=Math.max(.70,s.jump.startQ);
  if(s.stage==='push')qTarget=0;
  if(s.stage==='flight')qTarget=.28+.16*Math.sin(Math.PI*clamp(s.stageTime/.72,0,1));
  if(s.stage==='land')qTarget=s.goal==='low'?1:.62;
  [s.q,s.qv]=spring(s.q,s.qv,qTarget,dt,8);
  if(s.q<0||s.q>1){s.q=clamp(s.q,0,1);s.qv=0}
  if(Math.abs(s.q-qTarget)<.00005&&Math.abs(s.qv)<.0001){s.q=qTarget;s.qv=0}

  if(s.stage==='flight'){
   const u=clamp(s.stageTime/.72,0,1),h=Math.sin(Math.PI*u)**2;
   for(const side of sides){const f=s.feet[side],start=s.jump.startFeet[side],end=[bind[side].ankle[0]+s.x+s.vx*(.72-s.stageTime),bind[side].ankle[1]];f.p=mix(start,end,smooth(u));f.p[1]-=185*h;f.angle=rad(-16*Math.sin(2*Math.PI*u));s.contacts[side]=false}
  }else{
   for(const side of sides){
    const f=s.feet[side];
    if(f.plan){const p=f.plan;p.elapsed=Math.min(p.duration,p.elapsed+dt);const u=p.elapsed/p.duration;f.p=mix(p.from,p.end,smooth(u));f.p[1]-=p.lift*Math.sin(Math.PI*u)**2;f.angle=rad(-12*Math.sin(2*Math.PI*u));if(u>=1){f.p=p.end.slice();f.angle=0;f.plan=null;s.contacts[side]=true}}
   }
   const active=sides.some(side=>s.feet[side].plan);
   if(!active){
    s.stepClock+=dt;
    if(walking&&s.stepClock>.08&&s.walk>.12){const side=s.nextSide;s.nextSide=opposite(side);s.stepClock=0;this.stepFoot(side,[bind[side].ankle[0]+s.x+50+s.vx*.20,bind[side].ankle[1]])}
    else if(!walking&&s.stage!=='land'&&Math.abs(s.vx)<20){
     const side=sides.find(side=>Math.abs(s.feet[side].p[0]-(bind[side].ankle[0]+s.x))>2||Math.abs(s.feet[side].p[1]-bind[side].ankle[1])>.1);
     if(side)this.stepFoot(side,[bind[side].ankle[0]+s.x,bind[side].ankle[1]],.30,24);
    }
   }
  }
  let yTarget=554+156*s.q+14*s.walk+4*Math.sin(s.time*1.7)*(1-s.q)*(1-s.walk);
  if(s.stage==='flight'){const u=clamp(s.stageTime/.72,0,1);yTarget=s.jump.startY-4*135*u*(1-u)}
  [s.rootY,s.rootV]=spring(s.rootY,s.rootV,yTarget,dt,15);
  // Respect actual reach during stepping; no bone scaling or clipped IK.
  const hipX=495+s.x-40*s.q;
  for(const side of sides){const b=bind[side],foot=s.feet[side].p,l=length(sub(b.knee,b.hip))+length(sub(b.ankle,b.knee))-.20,dx=foot[0]-(hipX+b.hip[0]-495);if(Math.abs(dx)>=l)throw Error('Foot outside actual leg reach');const minY=foot[1]-Math.sqrt(l*l-dx*dx);if(s.rootY<minY){s.rootY=minY;s.rootV=Math.max(0,s.rootV)}}
  for(const side of sides){
   const b=bind[side],sign=side==='near'?1:-1;
   let upper=Math.atan2(b.elbow[0]-b.shoulder[0],b.elbow[1]-b.shoulder[1])*(1-s.q)+rad(side==='near'?60:50)*s.q;
   let lower=Math.atan2(b.wrist[0]-b.elbow[0],b.wrist[1]-b.elbow[1])*(1-s.q)+rad(side==='near'?105:100)*s.q;
   const swing=rad(30*Math.sin(s.phase)*sign);upper=upper*(1-s.walk)+swing*s.walk;lower=lower*(1-s.walk)+(swing+rad(25))*s.walk;
   if(s.stage==='flight'){const u=clamp(s.stageTime/.72,0,1);upper=rad(65+30*Math.sin(Math.PI*u));lower=rad(115+15*Math.sin(Math.PI*u))}
   for(let i=0;i<2;i++)[s.arms[side][i],s.armV[side][i]]=spring(s.arms[side][i],s.armV[side][i],i===0?upper:lower,dt,10);
  }
 }
 pose(){const s=this.s;const p=poseAt(s.q,s.time,{pelvis:[495+s.x-40*s.q,s.rootY],feet:s.feet,arms:s.arms});p.originX=s.x;p.contacts={...s.contacts};p.stage=s.stage;p.goal=s.goal;return p}
}
