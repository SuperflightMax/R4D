// Character-specific Q3B runtime. One dispatcher drives manual input and the automatic show.
export const TAU=Math.PI*2;
export const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
export const mix=(a,b,t)=>a+(b-a)*t;
export const smooth=t=>{t=clamp(t);return t*t*t*(t*(t*6-15)+10);};
export const ramp=(x,a,b)=>smooth((x-a)/(b-a));
export function spring(x,v,target,dt,w=5){const d=x-target,c=v+w*d,e=Math.exp(-w*dt);return[target+(d+c*dt)*e,(v-w*c*dt)*e];}
export function chainIK(x,y,a,b,bend){const requested=Math.hypot(x,y),d=clamp(requested,Math.abs(a-b)+.001,a+b-.001);const q=Math.atan2(y,x);const alpha=q-bend*Math.acos(clamp((a*a+d*d-b*b)/(2*a*d),-1,1));const beta=bend*(Math.PI-Math.acos(clamp((a*a+b*b-d*d)/(2*a*b),-1,1)));return {alpha,beta,requested,d};}
export const FORMS={module:0,crab:1,work:2};
export const SHOW=[
 {at:0,type:'form',value:'module'},{at:1.1,type:'form',value:'crab'},
 {at:5.7,type:'move',value:1},{at:8.8,type:'stop'},{at:10,type:'form',value:'work'},
 {at:16.1,type:'form',value:'crab'},{at:19.6,type:'low'},
 {at:21.9,type:'jump'},{at:23.4,type:'move',value:-1},{at:26.1,type:'stop'},
 {at:27.2,type:'form',value:'module'},{at:31.4,type:'form',value:'crab'}
];
export class Motion {
 constructor(){this.reset();}
 reset(){
  this.time=0;this.u=0;this.uv=0;this.form='module';this.action='idle';this.direction=1;
  this.x=0;this.speed=0;this.low=0;this.lowV=0;this.height=0;this.jump='ground';this.jumpTime=0;this.pendingJump=false;
  this.jumpCount=0;this.landCount=0;this.stepClock=0;this.stepIndex=0;this.events=[];this.auto=null;
  this.legs=[{id:'Left',home:-160,plane:0,sole:18,a:90,b:105,bend:-1},{id:'Right',home:160,plane:0,sole:18,a:90,b:105,bend:1},{id:'Rear',home:20,plane:-16,sole:18,a:90,b:105,bend:1}];
  this.feet=Object.fromEntries(this.legs.map(l=>[l.id,{x:l.home,lift:0,swing:null}]));
 }
 setGeometry(legs){for(const l of legs)Object.assign(this.legs.find(x=>x.id===l.id),l);}
 event(type,data={}){this.events.push({time:this.time,type,...data});if(this.events.length>100)this.events.shift();}
 dispatch(command,source='manual'){
  if(source==='manual')this.auto=null;
  const {type,value}=command;
  if(type==='form'){
   if(!(value in FORMS))throw new Error('Unknown form '+value);
   this.form=value;this.action='idle';this.pendingJump=false;
  }else if(type==='move'){
   this.form='crab';this.action='move';this.direction=Math.sign(value)||1;this.pendingJump=false;
  }else if(type==='low'){
   this.form='crab';this.action='low';this.pendingJump=false;
  }else if(type==='jump'){
   if(this.jump==='ground'){this.form='crab';this.pendingJump=true;if(this.action==='low')this.action='idle';}
  }else if(type==='stop'){
   this.action='idle';this.pendingJump=false;
  }else throw new Error('Unknown command '+type);
  this.event(type,{value,source});
 }
 startShow(){this.auto={start:this.time,cursor:0};this.event('show');}
 update(dt){while(dt>1e-9){const h=Math.min(dt,1/120);this.tick(h);dt-=h;}}
 tick(dt){
  this.time+=dt;
  if(this.auto){while(this.auto&&this.auto.cursor<SHOW.length&&SHOW[this.auto.cursor].at<=this.time-this.auto.start){const e=SHOW[this.auto.cursor++];this.dispatch(e,'auto');}if(this.auto&&this.time-this.auto.start>36)this.auto=null;}
  const grounded=this.jump==='ground',inCrab=Math.abs(this.u-1)<.025;
  const walking=this.action==='move'&&this.form==='crab'&&inCrab&&grounded&&!this.pendingJump;
  const targetSpeed=walking?this.direction*78:(this.jump==='flight'&&this.action==='move'?this.direction*78:0);
  this.speed+=(targetSpeed-this.speed)*(1-Math.exp(-dt*(targetSpeed?3.4:5)));
  this.x+=this.speed*dt;
  // A moving body brakes on its existing contacts before it can fold; active jumps finish first.
  const formGoal=!grounded?1:Math.abs(this.speed)>3?1:FORMS[this.form];
  [this.u,this.uv]=spring(this.u,this.uv,formGoal,dt,3.8);
  [this.low,this.lowV]=spring(this.low,this.lowV,this.action==='low'&&inCrab&&grounded?1:0,dt,9);
  this.stepClock+=dt;
  const stepAllowed=grounded&&this.u>.92&&!this.pendingJump;
  for(const l of this.legs){const f=this.feet[l.id];if(f.swing){f.swing.t+=dt;const t=clamp(f.swing.t/.34);f.x=mix(f.swing.start,f.swing.end,smooth(t));f.lift=Math.sin(Math.PI*t)**2*30;if(t>=1){f.x=f.swing.end;f.lift=0;f.swing=null;}}}
  if(stepAllowed&&this.stepClock>=.46&&!Object.values(this.feet).some(f=>f.swing)){
   const l=this.legs[this.stepIndex++%3],f=this.feet[l.id],home=this.home(l),end=this.x+home+this.speed*.36;
   if(Math.abs(end-f.x)>7){f.swing={start:f.x,end,t:0};this.stepClock=0;}
  }
  if(this.pendingJump&&grounded&&inCrab&&Math.abs(this.uv)<.12&&!Object.values(this.feet).some(f=>f.swing)){
   this.pendingJump=false;this.jump='prepare';this.jumpTime=0;this.jumpCount++;this.event('prepare');
   this.flightFeet=Object.fromEntries(this.legs.map(l=>[l.id,this.feet[l.id].x-this.x]));
  }
  if(this.jump!=='ground'){
   this.jumpTime+=dt;
   if(this.jump==='prepare'&&this.jumpTime>=.3){this.jump='flight';this.jumpTime=0;this.event('flight');}
   if(this.jump==='flight'){
    this.height=Math.max(0,440*this.jumpTime-550*this.jumpTime*this.jumpTime);
    if(this.jumpTime>=.8){this.height=0;this.jump='land';this.jumpTime=0;this.landCount++;for(const l of this.legs){this.feet[l.id].x=this.x+this.flightFeet[l.id];this.feet[l.id].lift=0;}this.event('land');}
   }else if(this.jump==='land'&&this.jumpTime>=.34){this.jump='ground';this.jumpTime=0;this.event('ground');}
  }
 }
 home(l){const work=ramp(this.u,1,1.3);return l.home+Math.sign(l.home)*(30*work+18*this.low);}
 sample(){
  const u=this.u,d=ramp(u,.1,.52),rise=ramp(u,.38,.94),brace=ramp(u,1,1.3),open=ramp(u,1.18,1.64),arms=ramp(u,1.52,1.98),mast=ramp(u,1.66,2);
  const alive=ramp(u,.4,.95),breathe=Math.sin(this.time*2.1),workBeat=Math.sin(this.time*1.7);
  let bodyY=-(this.coreBottom??25)-(165-(this.coreBottom??25))*rise+40*brace+42*this.low+alive*(breathe*1.6+Math.sin(this.time*3.9)*.35);
  if(this.jump==='prepare')bodyY+=23*smooth(this.jumpTime/.3);
  if(this.jump==='land')bodyY+=19*Math.sin(Math.PI*clamp(this.jumpTime/.34));
  bodyY-=this.height;
  const p={core:{x:this.x,y:bodyY,angle:alive*(Math.sin(this.time*1.6)*.009+this.speed*.00022)},
   shellLeft:-.24*ramp(u,.02,.25)-1.27*open,shellRight:.24*ramp(u,.02,.25)+1.27*open,
   boomLeft:mix(-.2,-2.45,arms),forearmLeft:mix(3.35,1.52,arms),palmLeft:mix(-3.15,.70,arms),jawLeft:mix(.04,-.28,arms)-arms*(.14+.12*workBeat),
   boomRight:mix(Math.PI+.2,-.69,arms),forearmRight:mix(-3.35,-1.52,arms),palmRight:mix(3.15,-.70,arms),jawRight:mix(.04,-.28,arms)-arms*(.14-.12*workBeat),
   mastLower:mix(.05,-.8,ramp(u,.6,.96))-mast*.70,mastUpper:mix(3.02,-1.8,ramp(u,.6,.96))+mast*1.60,optic:mix(-3.07,2.6,ramp(u,.6,.96))-mast*.4,
   deploy:d,work:brace,armOpen:arms,bodyY};
  // Small coordinated manipulator/optic motion preserves connection and the shared workspace.
  p.boomLeft+=arms*.025*workBeat;p.boomRight-=arms*.025*workBeat;
  p.mastUpper+=alive*.045*Math.sin(this.time*1.2);p.optic+=alive*.055*Math.sin(this.time*1.2+.6);
  return p;
 }
 foot(l){
  const f=this.feet[l.id];let x=f.x,y=l.plane-l.sole-f.lift;
  if(this.jump==='flight'){
   const t=clamp(this.jumpTime/.8),tuck=Math.sin(Math.PI*t)**2;
   x=this.x+this.flightFeet[l.id]*(1-.1*tuck);
   y=l.plane-l.sole-this.height-Math.min(this.height*.65,tuck*34);
  }
  return{x,y};
 }
 snapshot(){return {time:this.time,u:this.u,uv:this.uv,form:this.form,action:this.action,x:this.x,speed:this.speed,low:this.low,height:this.height,jump:this.jump,jumpTime:this.jumpTime,pendingJump:this.pendingJump,jumpCount:this.jumpCount,landCount:this.landCount,auto:this.auto?{...this.auto}:null,feet:structuredClone(this.feet),pose:this.sample(),events:[...this.events]};}
}

