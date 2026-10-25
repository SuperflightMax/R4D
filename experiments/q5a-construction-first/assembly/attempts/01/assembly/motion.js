import {clamp,smooth,rot,floorAnkle} from './rig.js';
// Fixed-step critically damped motors retain both position and velocity when
// commands change. The same foot planner/body motors serve every ground pair.
export class Motor{
 constructor(p=0){this.p=p;this.v=0;}
 step(target,dt,w=11){const y=this.p-target,j=this.v+w*y,e=Math.exp(-w*dt);this.p=target+(y+j*dt)*e;this.v=(this.v-w*j*dt)*e;}
}
const initial={height:202,back:0,lean:0,fu:-24,fb:20,nu:8,nb:20};
export class Motion{
 constructor(){this.time=0;this.tick=0;this.ground='idle';this.stopTarget='idle';this.phase='ground';this.elapsed=0;this.worldX=0;this.speed=new Motor();this.m=Object.fromEntries(Object.entries(initial).map(([k,v])=>[k,new Motor(v)]));this.feet=[-12,12].map(x=>({x,start:x,goal:x,lift:0,pitch:new Motor(),swing:null,contact:true}));this.nextLeg=0;this.nextStep=.12;this.events=[];this.projections=0;this.flight=null;}
 command(name){
  const before=this.snapshot();
  if(name==='jump'){if(this.phase==='flight'||this.phase==='prepare'||this.phase==='push')return false;this.phase='prepare';this.elapsed=0;this.prepareHeight=Math.max(95,Math.min(130,this.m.height.p-24));this.events.push({tick:this.tick,event:'prepare',from:this.ground});}
  else if(name==='stop')this.ground=this.stopTarget;
  else if(['idle','low','walk'].includes(name))this.ground=name;
  else throw Error('Unknown command '+name);
  this.events.push({tick:this.tick,event:'command',name,phase:this.phase,ground:this.ground});this.lastCommandContinuity={before,after:this.snapshot()};return true;
 }
 snapshot(){return {worldX:this.worldX,speed:this.speed.p,motors:Object.fromEntries(Object.entries(this.m).map(([k,m])=>[k,[m.p,m.v]])),feet:this.feet.map(f=>[f.x,f.lift,f.pitch.p,f.pitch.v])};}
 startStep(i,goal,duration=.34,height=22){let f=this.feet[i];if(f.swing)return;f.swing={from:f.x,to:goal,time:0,duration,height};f.contact=false;this.nextLeg=1-i;this.nextStep=this.time+.48;}
 step(dt=1/120){
  this.time+=dt;this.tick++;this.elapsed+=dt;
  const flight=this.phase==='flight',walk=this.ground==='walk',low=this.ground==='low';
  if(!flight){this.speed.step(walk?68:0,dt,7);this.worldX+=this.speed.p*dt;}else this.worldX+=this.flight.vx*dt;
  if(!flight){
   for(let i=0;i<2;i++){let f=this.feet[i];if(f.swing){let s=f.swing;s.time=Math.min(s.duration,s.time+dt);let t=s.time/s.duration;f.x=s.from+(s.to-s.from)*smooth(t);f.lift=Math.sin(Math.PI*t)**2*s.height;if(s.time>=s.duration){f.x=s.to;f.lift=0;f.swing=null;f.contact=true;this.events.push({tick:this.tick,event:'plant',side:i,x:f.x});}}}
   if(this.phase==='ground'){
    if(walk&&this.time>=this.nextStep&&!this.feet.some(f=>f.swing)){let stride=24+22*smooth((this.m.height.p-105)/80);this.startStep(this.nextLeg,this.worldX+stride+(this.nextLeg?8:-8),.34,23);}
    if(!walk&&!this.feet.some(f=>f.swing)){
     let errors=this.feet.map((f,i)=>Math.abs(f.x-(this.worldX+(i?12:-12))));let i=errors[0]>errors[1]?0:1;if(errors[i]>19)this.startStep(i,this.worldX+(i?12:-12),.30,15);
    }
   }
  }
  let bob=Math.sin(this.time*2.1),gait=Math.sin(this.time*2*Math.PI/1.02),targets={height:low?100:walk?192+2*Math.cos(this.time*4*Math.PI/1.02):201+bob,back:low?-35:0,lean:low?32:walk?5:Math.sin(this.time*1.7),fu:low?48:walk?-8+23*gait:-25+1.5*bob,fb:low?65:walk?26:22+1.3*bob,nu:low?55:walk?7-23*gait:7+1.5*bob,nb:low?70:walk?26:23-1.3*bob};
  if(this.phase==='prepare'){targets={height:this.prepareHeight,back:-26,lean:28,fu:-30,fb:50,nu:-22,nb:55};if(this.elapsed>=.30&&!this.feet.some(f=>f.swing)){this.phase='push';this.elapsed=0;this.events.push({tick:this.tick,event:'push'});}}
  if(this.phase==='push'){targets={height:207,back:2,lean:3,fu:110,fb:25,nu:115,nb:30};if(this.elapsed>=.20){this.phase='flight';this.elapsed=0;let vy=clamp(this.m.height.v,340,460),duration=2*vy/1050;this.flight={vy,duration,baseY:this.m.height.p,vx:this.speed.p,feet:this.feet.map((f,i)=>({from:f.x,to:this.worldX+this.speed.p*duration+(i?16:-16)}))};this.events.push({tick:this.tick,event:'takeoff',vy,vx:this.speed.p});}}
  if(this.phase==='flight'){
   const f=this.flight,t=Math.min(this.elapsed,f.duration),q=t/f.duration,h=f.vy*t-.5*1050*t*t;
   this.m.height.p=f.baseY+h;this.m.height.v=f.vy-1050*t;
   targets={height:this.m.height.p,back:-6,lean:6+4*smooth((q-.6)/.4),fu:125-70*smooth((q-.6)/.4),fb:45,nu:130-65*smooth((q-.6)/.4),nb:50};
   this.feet.forEach((foot,i)=>{foot.contact=false;foot.swing=null;foot.x=f.feet[i].from+(f.feet[i].to-f.feet[i].from)*smooth(q);foot.lift=h+28*Math.sin(Math.PI*q)**2;});
   if(this.elapsed>=f.duration){this.phase='landing';this.elapsed=0;this.feet.forEach(foot=>{foot.contact=true;foot.lift=0;});this.speed.p=f.vx;this.events.push({tick:this.tick,event:'landing',target:this.ground});}
  }
  if(this.phase==='landing'){targets={height:Math.min(115,this.flight.baseY-25),back:-25,lean:26,fu:45,fb:65,nu:52,nb:70};if(this.elapsed>=.30){this.phase='ground';this.elapsed=0;this.nextStep=this.time+.08;this.events.push({tick:this.tick,event:'recover',target:this.ground});}}
  for(const [k,m] of Object.entries(this.m))if(k!=='height'||this.phase!=='flight')m.step(targets[k],dt,k==='height'?13:k==='back'?10:11);
  for(const f of this.feet){let pitch=this.phase==='push'?-18:this.phase==='flight'?-8:f.swing?-7:0;f.pitch.step(pitch,dt,17);}
  this.lastSpec=this.spec();return this.lastSpec;
 }
 spec(){
  let rootX=this.worldX+this.m.back.p,height=this.m.height.p,lean=clamp(this.m.lean.p,-5,35);
  const feet=this.feet.map(f=>{let pitch=f.pitch.p,pivot=pitch<0?[36,-16]:[-19,-16],off=rot(pivot,pitch);return {ankle:[f.x+pivot[0]-off[0],floorAnkle(pitch)+f.lift],pitch,contact:f.contact,anchorX:f.x+pivot[0]};});
  if(this.phase!=='flight'){
   // Contact constraint: keep planted shoes on the floor and both fixed leg
   // lengths reachable. This is a continuous anatomical reach boundary.
   let ceiling=Math.min(...feet.filter(f=>f.contact).map((f,i)=>f.ankle[1]+Math.sqrt(Math.max(0,191**2-(rootX+(i?4:-4)-f.ankle[0])**2))));
   if(height>ceiling){height=ceiling;this.projections++;}
  }
  height=Math.max(87,height);
  return {id:'runtime',root:[rootX,height],lean,feet,arms:[[clamp(this.m.fu.p,-35,140),clamp(this.m.fb.p,10,135)],[clamp(this.m.nu.p,-35,140),clamp(this.m.nb.p,10,135)]]};
 }
}
