// One mutable pose object, one clock; all panels observe this same state.
export class Motion {
  constructor(contract) {
    this.targets=Object.fromEntries(contract.motion.pose_matrix.map(p=>[p.id,{x:p.root[0],y:p.root[1],angle:p.root[2],thigh:p.thigh_deg,shin:p.shin_relative_deg}]));
    this.duration=.38; this.pose={}; this.reset();
  }
  reset(){this.time=0;this.selected='bind';this.requested='bind';this.playing=false;this.elapsed=this.duration;Object.assign(this.pose,this.targets.bind);this.from={...this.pose};this.to={...this.pose};}
  retarget(id){if(!this.targets[id])throw new Error(`Unknown pose ${id}`);this.from={...this.pose};this.to={...this.targets[id]};this.requested=id;this.elapsed=0;}
  request(id){this.selected=id;this.retarget(id);}
  get fraction(){return Math.min(1,this.elapsed/this.duration);}
  advance(dt){
    if(!Number.isFinite(dt)||dt<0)throw new Error('Invalid dt');
    this.time+=dt;
    let rest=dt;
    while(rest>0){
      if(this.elapsed>=this.duration){
        if(!this.playing||this.selected==='bind')break;
        this.retarget(this.requested==='bind'?this.selected:'bind');
      }
      const step=Math.min(rest,this.duration-this.elapsed);
      this.elapsed=Math.min(this.duration,this.elapsed+step);rest-=step;
      const t=this.fraction,s=t*t*(3-2*t);
      for(const key of Object.keys(this.pose))this.pose[key]=this.from[key]+(this.to[key]-this.from[key])*s;
    }
  }
  snapshot(){return {clock:this.time,selected:this.selected,requested:this.requested,fraction:this.fraction,smoothstep:this.fraction**2*(3-2*this.fraction),playing:this.playing,pose:{...this.pose}};}
}
