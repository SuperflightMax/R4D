// Q3: three independent supports; no human bones or pair-specific transition clips.
export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = t => t * t * (3 - 2 * t);
export function spring(value, velocity, target, dt, omega = 22) {
  const delta = value - target, c = velocity + omega * delta, decay = Math.exp(-omega * dt);
  return [target + (delta + c * dt) * decay, (velocity - omega * c * dt) * decay];
}
export function solveChain(x, y, a, b, bend = 1) {
  const d = clamp(Math.hypot(x, y), Math.abs(a - b) + .001, a + b - .001);
  const angle = Math.atan2(y, x);
  const first = angle - bend * Math.acos(clamp((a*a+d*d-b*b)/(2*a*d), -1, 1));
  const second = bend * (Math.PI - Math.acos(clamp((a*a+b*b-d*d)/(2*a*b), -1, 1)));
  return { first, second, distance: d, requestedDistance: Math.hypot(x, y) };
}
export class Motion {
  constructor({legs, unit = 1, lowDepth = 65, stride = 72}) {
    this.legs = legs; this.unit = unit; this.lowDepth = lowDepth; this.stride = stride; this.reset();
  }
  reset() {
    this.time=0; this.phase=0; this.travel=0; this.speed=0; this.direction=1; this.gaitBlend=0;
    this.ground='idle'; this.state='idle'; this.stateTime=0; this.jumpRequested=false;
    this.height=0; this.jumpCount=0; this.landCount=0; this.events=[]; this.pose={}; this.velocity={};
    this.target=this.sample(); this.pose={...this.target};
  }
  requestGround(state, direction=1) {
    if(!['idle','low','move'].includes(state)) throw new Error(`Unknown ground state ${state}`);
    this.ground=state; if(state==='move') this.direction=Math.sign(direction)||1;
  }
  jump() { if(['idle','low','move'].includes(this.state)) this.jumpRequested=true; }
  enter(state) { this.state=state;this.stateTime=0;this.events.push({time:this.time,state});if(this.events.length>60)this.events.shift(); }
  update(dt) { while(dt>1e-8){const step=Math.min(dt,1/120);this.tick(step);dt-=step;} }
  tick(dt) {
    this.time+=dt; this.stateTime+=dt;
    if(this.jumpRequested){this.jumpRequested=false;this.launchDepth=this.pose.bodyY;this.enter('prepare');this.jumpCount++;}
    if(this.state==='prepare'&&this.stateTime>=.28)this.enter('flight');
    if(this.state==='flight'&&this.stateTime>=.8){this.enter('land');this.landCount++;}
    if(this.state==='land'&&this.stateTime>=.32)this.enter(this.ground);
    if(['idle','low','move'].includes(this.state)&&this.state!==this.ground)this.enter(this.ground);
    // Airborne inputs select the landing behaviour; they do not switch to a ground pose in flight.
    const requested=this.ground==='move'?this.direction*this.stride/(.75*1.35):0;
    this.speed+=(requested-this.speed)*(1-Math.exp(-dt*8));
    this.travel+=this.speed*dt; this.phase=(this.phase+Math.abs(this.speed)/(this.stride/.75)*dt)%1;
    const t=this.state==='flight'?this.stateTime:0;
    this.height=this.state==='flight'?Math.max(0,400*this.unit*t-500*this.unit*t*t):0;
    this.gaitBlend+=((['idle','low','move'].includes(this.state)?1:0)-this.gaitBlend)*(1-Math.exp(-dt*10));
    this.target=this.sample();
    for(const key of Object.keys(this.target)) [this.pose[key],this.velocity[key]]=spring(this.pose[key]??this.target[key],this.velocity[key]??0,this.target[key],dt);
    for(const leg of this.legs) {
      if(['idle','low','move'].includes(this.state))this.pose[leg.id+'Lift']=this.target[leg.id+'Lift'];
      if(this.pose[leg.id+'Lift']<0){this.pose[leg.id+'Lift']=0;this.velocity[leg.id+'Lift']=0;}
    }
  }
  sample() {
    const moving=clamp(Math.abs(this.speed)/(this.stride/(.75*1.35)),0,1)*this.gaitBlend,low=this.ground==='low'?1:0;
    const p={bodyY:this.lowDepth*low+Math.sin(this.time*2.5)*1.8*this.unit,bodyAngle:Math.sin(this.time*2)*.012,sensor:Math.sin(this.time*1.6)*.08};
    for(let i=0;i<this.legs.length;i++) {
      const leg=this.legs[i],f=(this.phase+i/this.legs.length)%1,s=(f-.75)/.25;
      const dx=f<.75?this.stride*(.5-f/.75):this.stride*(-.5+smooth(s));
      p[leg.id+'X']=leg.homeX+dx*moving*this.direction+Math.sign(leg.homeX)*low*24*this.unit;
      p[leg.id+'Lift']=f<.75?0:Math.sin(Math.PI*s)*34*this.unit*moving;
    }
    if(this.state==='prepare'||this.state==='land') {
      const prepare=this.state==='prepare',t=clamp(this.stateTime/(prepare?.28:.32),0,1);
      p.bodyY=prepare?this.launchDepth+(Math.max(this.lowDepth*.75,this.launchDepth+12*this.unit)-this.launchDepth)*smooth(t):this.lowDepth*low+Math.sin(Math.PI*t)*18*this.unit;
      p.bodyAngle=0;
      for(const leg of this.legs){p[leg.id+'X']=leg.homeX+Math.sign(leg.homeX)*low*24*this.unit;p[leg.id+'Lift']=0;}
    }
    if(this.state==='flight') {
      const t=clamp(this.stateTime/.8,0,1),fold=Math.sin(Math.PI*t);
      p.bodyY=-8*this.unit; p.bodyAngle=Math.sin(t*TAU)*.025;
      for(const leg of this.legs){p[leg.id+'X']=leg.homeX*.78;p[leg.id+'Lift']=fold*46*this.unit;}
    }
    return p;
  }
  foot(leg) {
    // A shared ground plane; tuck cannot survive touchdown or penetrate the surface.
    const airborne=this.state==='flight';
    const lift=this.state==='land'?0:airborne?Math.min(this.pose[leg.id+'Lift'],this.height*.8):this.pose[leg.id+'Lift'];
    return {x:this.pose[leg.id+'X'],y:leg.homeY-this.height-lift,gap:this.height+lift};
  }
  snapshot() { return {time:this.time,state:this.state,ground:this.ground,stateTime:this.stateTime,phase:this.phase,travel:this.travel,speed:this.speed,height:this.height,pose:{...this.pose},target:{...this.target},feet:Object.fromEntries(this.legs.map(l=>[l.id,this.foot(l)])),jumpCount:this.jumpCount,landCount:this.landCount,events:[...this.events]}; }
}
// Commands use the same mechanism as manual controls, with no private animation path.
export const ROUTES={
 one:[{at:0,ground:'idle'},{at:.9,ground:'low'},{at:2.1,ground:'move'},{at:3.9,ground:'idle'},{at:4.8,jump:true}],
 two:[{at:0,ground:'move'},{at:1.3,ground:'low'},{at:2.3,jump:true},{at:2.9,ground:'move'},{at:4.3,jump:true},{at:4.9,ground:'low'}],
 midMove:[{at:0,ground:'idle'},{at:.6,ground:'low'},{at:.68,ground:'move'}],
 midJump:[{at:0,ground:'idle'},{at:.6,ground:'low'},{at:.68,jump:true}]
};

