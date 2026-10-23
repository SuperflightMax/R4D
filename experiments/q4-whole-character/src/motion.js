// Q4 adapts Q2 shared springs/IK. Art and measured bind come from the exact whole image.
export const TAU=Math.PI*2;
const MOVE_SPEED=104/(.82*.6);
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
const smooth=t=>t*t*(3-2*t);
const angularKeys=new Set(['pelvis','torso','head','upperArmNear','forearmNear','upperArmFar','forearmFar','footAngleNear','footAngleFar']);
export function spring(value,velocity,target,dt,omega=23,angular=false){
 const delta=angular?-Math.atan2(Math.sin(target-value),Math.cos(target-value)):value-target;
 const c=velocity+omega*delta,decay=Math.exp(-omega*dt);
 return [value+((delta+c*dt)*decay-delta),(velocity-omega*c*dt)*decay];
}
export function legIK(x,y,a,b){
 const d=clamp(Math.hypot(x,y),Math.abs(a-b)+.01,a+b-.01);
 const knee=Math.PI-Math.acos(clamp((a*a+b*b-d*d)/(2*a*b),-1,1));
 const hip=Math.atan2(-x,y)-Math.acos(clamp((a*a+d*d-b*b)/(2*a*d),-1,1));
 return [hip,knee,-hip-knee];
}
export class Motion{
 constructor(lengths={thigh:125,shin:125}){this.lengths=lengths;this.unit=(lengths.thigh+lengths.shin)/250;this.reset();}
 reset(){this.time=0;this.phase=0;this.travel=0;this.speed=0;this.move=0;this.ground='idle';this.state='idle';this.stateTime=0;this.height=0;this.fallHeight=0;this.verticalSpeed=0;this.jumpRequested=false;this.jumpCount=0;this.landCount=0;this.contacts={Near:null,Far:null};this.contactEvent=null;this.pose={};this.velocity={};this.events=[];this.launchDepth=0;this.launchX=0;this.target=this.sample();this.pose={...this.target};this.constrainGroundReach();this.solveLegs();}
 requestGround(state,direction=1){if(!['idle','low','move'].includes(state))throw new Error(`Unknown ground state ${state}`);this.ground=state;this.move=state==='move'?Math.sign(direction)||1:0;}
 setMove(direction){this.requestGround(direction?'move':'idle',direction);}
 jump(){if(['idle','low','move'].includes(this.state))this.jumpRequested=true;}
 enter(state){this.state=state;this.stateTime=0;this.events.push({time:this.time,state});if(this.events.length>40)this.events.shift();}
 update(dt){while(dt>1e-8){const step=Math.min(dt,1/120);this.tick(step);dt-=step;}}
 tick(dt){
  this.time+=dt;this.stateTime+=dt;
  this.speed+=(this.move*MOVE_SPEED*this.unit-this.speed)*(1-Math.exp(-dt*7));this.travel+=this.speed*dt;
  this.phase=(this.phase+Math.abs(this.speed)/(MOVE_SPEED*this.unit)*dt/.82)%1;
  if(this.jumpRequested){this.jumpRequested=false;this.contacts={Near:null,Far:null};this.contactEvent=null;this.launchDepth=this.pose.rootY;this.launchX=this.pose.bodyX;this.enter('prepare');this.jumpCount++;}
  if(this.state==='prepare'&&this.stateTime>=.22){this.enter('flight');this.verticalSpeed=480*this.unit;}
  if(this.state==='flight'){this.verticalSpeed-=1120*this.unit*dt;this.fallHeight+=this.verticalSpeed*dt;this.height=Math.max(0,this.fallHeight);}
  if(this.state==='land'&&this.stateTime>=.28)this.enter(this.ground);
  if(['idle','low','move'].includes(this.state)&&this.state!==this.ground)this.enter(this.ground);
  this.target=this.sample();
  for(const key of Object.keys(this.target))[this.pose[key],this.velocity[key]]=spring(this.pose[key]??this.target[key],this.velocity[key]??0,this.target[key],dt,23,angularKeys.has(key));
  this.constrainGroundReach();this.solveLegs();
  if((this.state==='flight'&&this.verticalSpeed<0)||this.state==='land')this.resolveContact();
 }
 soleExtent(side,angle){const points=this.lengths['sole'+side];return points?.length?Math.max(...points.map(([x,y])=>x*Math.sin(angle)+y*Math.cos(angle))):0;}
 soleGap(side){const p=this.pose,{a,b,axisA,axisB,reach}=this.dimensions(side);const ankleY=p.rootY+a*Math.cos(p['thigh'+side]+axisA)+b*Math.cos(p['thigh'+side]+p['shin'+side]+axisB);return reach+this.soleExtent(side,0)-ankleY-this.soleExtent(side,p['footAngle'+side]);}
 resolveContact(){
  const before={Near:this.soleGap('Near'),Far:this.soleGap('Far')};
  for(const side of ['Near','Far']){
   if(!this.contacts[side]&&before[side]<=.05)this.contacts[side]={x:this.pose['footX'+side],time:this.time};
   if(this.contacts[side]){
    this.pose['footX'+side]=this.contacts[side].x;
    this.pose['footY'+side]=this.dimensions(side).reach+this.soleExtent(side,0)-this.soleExtent(side,this.pose['footAngle'+side]);
    this.velocity['footX'+side]=0;this.velocity['footY'+side]=0;
   }
  }
  this.solveLegs();
  if(this.state==='flight'&&(this.contacts.Near||this.contacts.Far)){
   this.height=0;this.fallHeight=0;this.verticalSpeed=0;this.enter('land');this.landCount++;
   this.contactEvent={time:this.time,beforeGap:before,gap:{Near:this.soleGap('Near'),Far:this.soleGap('Far')}};
  }
 }
 dimensions(side){return {a:this.lengths[side==='Near'?'thigh':'farThigh']??this.lengths.thigh,b:this.lengths[side==='Near'?'shin':'farShin']??this.lengths.shin,reach:this.lengths[side==='Near'?'nearReach':'farReach']??(this.lengths[side==='Near'?'thigh':'farThigh']??this.lengths.thigh)+(this.lengths[side==='Near'?'shin':'farShin']??this.lengths.shin)-12*this.unit,axisA:this.lengths[side==='Near'?'nearAxisA':'farAxisA']??0,axisB:this.lengths[side==='Near'?'nearAxisB':'farAxisB']??0};}
 constrainGroundReach(){
  if(!['idle','low','move','prepare'].includes(this.state))return;
  // One geometric rule for the measured source stance: lower the pelvis when an
  // actual foot target would exceed the chain, rather than shrinking the stride.
  let minimum=-Infinity;for(const side of ['Near','Far']){const {a,b}=this.dimensions(side),x=this.pose['footX'+side]-this.pose.bodyX;const vertical=Math.sqrt(Math.max(0,(a+b-.01)**2-x*x));minimum=Math.max(minimum,this.pose['footY'+side]-vertical);}
  this.pose.rootY=Math.max(this.pose.rootY,minimum);
 }
 solveLegs(){for(const side of ['Near','Far']){const {a,b,axisA,axisB}=this.dimensions(side);const [hip,knee]=legIK(this.pose['footX'+side]-this.pose.bodyX,this.pose['footY'+side]-this.pose.rootY,a,b);this.pose['thigh'+side]=hip-axisA;this.pose['shin'+side]=knee+axisA-axisB;this.pose['foot'+side]=this.pose['footAngle'+side]-this.pose['thigh'+side]-this.pose['shin'+side];}}
 sample(){
  const u=this.unit;
  const p={rootY:0,bodyX:0,pelvis:0,torso:0,head:0,upperArmNear:.08,forearmNear:-.14,upperArmFar:-.08,forearmFar:-.18};
  const moving=clamp(Math.abs(this.speed)/(MOVE_SPEED*this.unit),0,1),breath=Math.sin(this.time*2.6),low=this.ground==='low'?1:0;
  p.rootY=(80*low+breath*1.5+Math.cos(this.phase*TAU*2)*3*moving)*u;p.bodyX=-27*low*u;
  p.torso=.025+.24*low+moving*.045+breath*.009;p.head=-p.torso*.7;
  for(const [side,offset]of [['Near',0],['Far',.5]]){
   const {reach}=this.dimensions(side),f=(this.phase+offset)%1,swing=(f-.6)/.4;
   p['footX'+side]=(this.lengths['homeX'+side]??0)+moving*(f<.6?(52-104*f/.6)*u:(-52+104*smooth(swing))*u);
   p['footY'+side]=reach-(f<.6?0:Math.sin(swing*Math.PI)*40*moving*u);p['footAngle'+side]=0;
  }
  const arm=Math.sin(this.phase*TAU)*.55*moving;
  p.upperArmNear=.09+arm-.48*low;p.upperArmFar=-.07-arm-.42*low;
  p.forearmNear=-.18-Math.max(0,-arm)*.6-.5*low;p.forearmFar=-.18-Math.max(0,arm)*.6-.45*low;
  if(this.state==='prepare'||this.state==='land'){
   const preparing=this.state==='prepare',t=clamp(this.stateTime/(preparing?.22:.28),0,1);
   p.rootY=preparing?this.launchDepth+(Math.max(34*u,this.launchDepth+12*u)-this.launchDepth)*smooth(t):(80*low+Math.sin(t*Math.PI)*(low?18:34))*u;
   p.bodyX=preparing?this.launchX:-27*low*u;
   for(const side of ['Near','Far']){p['footX'+side]=!preparing&&this.contacts[side]?this.contacts[side].x:(this.lengths['homeX'+side]??0);p['footY'+side]=this.dimensions(side).reach+(!preparing&&!this.contacts[side]?2*u:0);}
   p.torso=.12+.16*low;p.head=-.08;p.upperArmNear=.3;p.upperArmFar=.24;
  }
  if(this.state==='flight'){
   const ascent=clamp(this.verticalSpeed/(480*u),-1,1);p.rootY=-this.fallHeight;p.bodyX=0;p.torso=.06;p.head=-.04;
   const approach=this.verticalSpeed<0?smooth(clamp(-this.verticalSpeed/(180*u),0,1))*smooth(clamp(1-this.height/(100*u),0,1)):0;
   for(const side of ['Near','Far']){const {a,b,reach}=this.dimensions(side);const hip=side==='Near'?-.5-ascent*.14:.14,knee=side==='Near'?.9:.62;p['footX'+side]=(-a*Math.sin(hip)-b*Math.sin(hip+knee))*(1-approach)+(this.lengths['homeX'+side]??0)*approach;p['footY'+side]=p.rootY+(a*Math.cos(hip)+b*Math.cos(hip+knee))*(1-approach)+reach*approach;p['footAngle'+side]=.12*(1-approach);}
   p.upperArmNear=-.72;p.upperArmFar=-.54;p.forearmNear=-.46;p.forearmFar=-.35;
  }
  return p;
 }
 snapshot(){return {time:this.time,state:this.state,ground:this.ground,stateTime:this.stateTime,phase:this.phase,speed:this.speed,height:this.height,move:this.move,pose:{...this.pose},target:{...this.target},jumpCount:this.jumpCount,landCount:this.landCount,soleGap:{Near:this.soleGap('Near'),Far:this.soleGap('Far')},contacts:structuredClone(this.contacts),contactEvent:structuredClone(this.contactEvent),events:[...this.events]};}
}
export const ROUTES={
 one:[{at:0,ground:'idle'},{at:.8,ground:'low'},{at:2,ground:'move'},{at:3.5,ground:'idle'},{at:4.3,jump:true}],
 two:[{at:0,ground:'move'},{at:1.1,ground:'low'},{at:2.1,jump:true},{at:2.6,ground:'move'},{at:4,jump:true},{at:4.5,ground:'low'}],
 midMove:[{at:0,ground:'idle'},{at:.6,ground:'low'},{at:.66,ground:'move'}],
 midJump:[{at:0,ground:'idle'},{at:.6,ground:'low'},{at:.66,jump:true}]
};
