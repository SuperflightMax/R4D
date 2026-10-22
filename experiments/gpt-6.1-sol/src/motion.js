export const TAU = Math.PI * 2;
const MOVE_SPEED = 104 / (.82 * .6);
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const smooth = t => t * t * (3 - 2 * t);
const angleDelta = (a, b) => Math.atan2(Math.sin(b-a), Math.cos(b-a));

// A critically damped spring retains position AND velocity when its target changes.
// All states use this same filter. No table of pair-specific transitions exists.
export function spring(value, velocity, target, dt, omega = 23, angular = false) {
  const delta = angular ? -angleDelta(value, target) : value - target;
  const decay = Math.exp(-omega * dt);
  const c = velocity + omega * delta;
  return [target + (delta + c * dt) * decay, (velocity - omega * c * dt) * decay];
}

export function legIK(x, y, a, b) {
  const d = clamp(Math.hypot(x, y), Math.abs(a-b)+.01, a+b-.01);
  const knee = Math.PI - Math.acos(clamp((a*a+b*b-d*d)/(2*a*b), -1, 1));
  const hip = Math.atan2(-x, y) - Math.acos(clamp((a*a+d*d-b*b)/(2*a*d), -1, 1));
  return [hip, knee, -hip-knee];
}

export class Motion {
  constructor(lengths = { thigh: 125, shin: 125 }) { this.lengths = lengths; this.reset(); }
  reset() {
    this.time=0; this.phase=0; this.travel=0; this.speed=0; this.move=0;
    this.state='idle'; this.stateTime=0; this.jumpRequested=false;
    this.height=0; this.verticalSpeed=0; this.jumpCount=0; this.landCount=0;
    this.pose={}; this.velocity={}; this.events=[];
    this.target=this.sample(); this.pose={...this.target};
  }
  setMove(direction) { this.move=Math.sign(direction); }
  jump() { if (this.state==='idle'||this.state==='move') this.jumpRequested=true; }
  enter(state) { this.state=state; this.stateTime=0; this.events.push({time:this.time,state}); if(this.events.length>30)this.events.shift(); }
  update(dt) {
    // Fixed substeps make physics and spring behavior independent of rendering FPS.
    while (dt>1e-8) { const step=Math.min(dt,1/120); this.tick(step); dt-=step; }
  }
  tick(dt) {
    this.time+=dt; this.stateTime+=dt;
    const desired=this.move*MOVE_SPEED;
    this.speed+=(desired-this.speed)*(1-Math.exp(-dt*7));
    this.travel+=this.speed*dt;
    this.phase=(this.phase+Math.abs(this.speed)/MOVE_SPEED*dt/.82)%1;
    if(this.jumpRequested) { this.jumpRequested=false; this.enter('prepare'); this.jumpCount++; }
    if(this.state==='prepare'&&this.stateTime>=.19) { this.enter('flight'); this.verticalSpeed=480; }
    if(this.state==='flight') {
      this.verticalSpeed-=1120*dt; this.height+=this.verticalSpeed*dt;
      if(this.height<=0&&this.verticalSpeed<0) { this.height=0; this.verticalSpeed=0; this.enter('land'); this.landCount++; }
    }
    if(this.state==='land'&&this.stateTime>=.24) this.enter(this.move?'move':'idle');
    if((this.state==='idle'||this.state==='move')&&this.state!==(this.move?'move':'idle')) this.enter(this.move?'move':'idle');
    this.target=this.sample();
    for(const key of Object.keys(this.target)) {
      [this.pose[key],this.velocity[key]]=spring(this.pose[key]??this.target[key],this.velocity[key]??0,this.target[key],dt, key==='rootY'?26:23,!['rootY','bodyX'].includes(key));
    }
  }
  sample() {
    const p={rootY:0,bodyX:0,pelvis:0,torso:0,head:0,upperArmNear:.08,forearmNear:-.14,upperArmFar:-.08,forearmFar:-.18,thighNear:0,shinNear:0,footNear:0,thighFar:0,shinFar:0,footFar:0};
    const moving=clamp(Math.abs(this.speed)/MOVE_SPEED,0,1);
    const breath=Math.sin(this.time*2.6);
    p.rootY=breath*1.5+Math.cos(this.phase*TAU*2)*3*moving; p.torso=-.025+breath*.009; p.head=-p.torso*.7;
    for(const [side,offset] of [['Near',0],['Far',.5]]) {
      const a=this.lengths[side==='Near'?'thigh':'farThigh']??this.lengths.thigh;
      const b=this.lengths[side==='Near'?'shin':'farShin']??this.lengths.shin;
      const reach=this.lengths[side==='Near'?'nearReach':'farReach']??a+b-12;
      const f=(this.phase+offset)%1;
      const stance=f<.6;
      const swing=(f-.6)/.4;
      const x=moving*(stance?52-104*f/.6:-52+104*smooth(swing));
      const lift=stance?0:Math.sin(swing*Math.PI)*40*moving;
      const angles=legIK(x,reach-lift-p.rootY,a,b);
      [p['thigh'+side],p['shin'+side],p['foot'+side]]=angles;
    }
    const arm=Math.sin(this.phase*TAU)*.55*moving;
    p.upperArmNear=.09+arm; p.upperArmFar=-.07-arm;
    p.forearmNear=-.18-Math.max(0,-arm)*.6; p.forearmFar=-.18-Math.max(0,arm)*.6;
    p.torso-=moving*.045;
    if(this.state==='prepare'||this.state==='land') {
      const t=this.stateTime/(this.state==='prepare'?.19:.24);
      const crouch=this.state==='prepare'?smooth(clamp(t,0,1)):Math.sin(clamp(t,0,1)*Math.PI);
      p.rootY+=crouch*34;
      for(const side of ['Near','Far']) {
        const a=this.lengths[side==='Near'?'thigh':'farThigh']??this.lengths.thigh;
        const b=this.lengths[side==='Near'?'shin':'farShin']??this.lengths.shin;
        const reach=this.lengths[side==='Near'?'nearReach':'farReach']??a+b-12;
        [p['thigh'+side],p['shin'+side],p['foot'+side]]=legIK(6,reach-p.rootY,a,b);
      }
      p.torso=-.13*crouch; p.head=.08*crouch;
      p.upperArmNear=.32*crouch; p.upperArmFar=.28*crouch;
    }
    if(this.state==='flight') {
      const ascent=clamp(this.verticalSpeed/480,-1,1);
      p.rootY=-this.height; p.torso=-.06; p.head=.04;
      p.thighNear=-.5-ascent*.14; p.shinNear=.9; p.footNear=-.22;
      p.thighFar=.14; p.shinFar=.62; p.footFar=-.28;
      p.upperArmNear=-.72; p.upperArmFar=-.54; p.forearmNear=-.46; p.forearmFar=-.35;
    }
    return p;
  }
  snapshot() { return {time:this.time,state:this.state,stateTime:this.stateTime,phase:this.phase,speed:this.speed,height:this.height,move:this.move,pose:{...this.pose},target:{...this.target},jumpCount:this.jumpCount,landCount:this.landCount,events:[...this.events]}; }
}

export const SCENARIO = [{at:0,move:0},{at:.55,move:1},{at:1.32,jump:true},{at:1.75,move:0},{at:2.95,jump:true},{at:3.25,move:1},{at:4.65,move:0}];
