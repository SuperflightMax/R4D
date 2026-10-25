// Q2A-specific rig, written from the agreed P1 contract; logical pixels.
export const bind = {
  pelvis:[495,550], neck:[495,286], waist:[495,475],ground:900,
  near:{hip:[500,550],knee:[530,710],ankle:[550,870],shoulder:[502,330],elbow:[548,444],wrist:[562,550]},
  far:{hip:[490,550],knee:[525.583514092,708.851545554],ankle:[520,870],shoulder:[488,330],elbow:[442,444],wrist:[428,550]}
};
export function setMeasuredBind(rig){Object.assign(bind,rig)}
export const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
export const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
export const mul=(a,s)=>[a[0]*s,a[1]*s];
export const mix=(a,b,t)=>add(mul(a,1-t),mul(b,t));
export const length=a=>Math.hypot(...a);
export const rotate=(p,a)=>[p[0]*Math.cos(a)-p[1]*Math.sin(a),p[0]*Math.sin(a)+p[1]*Math.cos(a)];
export const rad=d=>d*Math.PI/180;
export const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export const smooth=v=>{v=clamp(v,0,1);return v*v*(3-2*v)};

export function kneeFor(hip,ankle,l1=Math.sqrt(26500),l2=Math.sqrt(26000)) {
  const delta=sub(ankle,hip),d=length(delta);
  if(d>l1+l2+1e-6 || d<Math.abs(l1-l2)) throw Error(`Недостижимая опора: ${d}`);
  const n=mul(delta,1/d),a=(l1*l1-l2*l2+d*d)/(2*d),h=Math.sqrt(Math.max(0,l1*l1-a*a));
  return add(add(hip,mul(n,a)),[n[1]*h,-n[0]*h]);
}

export function poseAt(q,time=0) {
  // Idle never rises above bind. Breathing fades out through the transition.
  const breath=4*Math.sin(time*1.7)*(1-q);
  const pelvis=[bind.pelvis[0]-40*q,bind.pelvis[1]+4+156*q+breath];
  const pelvicAngle=rad(10*q),chestAngle=rad(20*q);
  const waist=add(pelvis,rotate(sub(bind.waist,bind.pelvis),pelvicAngle));
  const bodyPoint=p=>{
    const lower=p[1]>=bind.waist[1];
    const baseOrigin=lower?bind.pelvis:bind.waist,baseEnd=lower?bind.waist:bind.neck;
    const delta=sub(baseEnd,baseOrigin),t=(p[1]-baseOrigin[1])/delta[1];
    const baseCenter=add(baseOrigin,mul(delta,t));
    const a=rad(10*q+10*q*smooth((bind.waist[1]+30-p[1])/75));
    const center=add(lower?pelvis:waist,rotate(sub(baseCenter,baseOrigin),lower?pelvicAngle:chestAngle));
    return add(center,rotate([p[0]-baseCenter[0],0],a));
  };
  const result={q,time,pelvis,waist,bodyPoint,pelvicAngle,chestAngle,neck:bodyPoint(bind.neck)};
  for(const side of ['far','near']) {
    const b=bind[side],hip=add(pelvis,sub(b.hip,bind.pelvis)),ankle=b.ankle.slice(),knee=kneeFor(hip,ankle,length(sub(b.knee,b.hip)),length(sub(b.ankle,b.knee)));
    const shoulder=bodyPoint(b.shoulder);
    const upper=Math.atan2(b.elbow[0]-b.shoulder[0],b.elbow[1]-b.shoulder[1])*(1-q)+rad(side==='near'?60:50)*q;
    const lower=Math.atan2(b.wrist[0]-b.elbow[0],b.wrist[1]-b.elbow[1])*(1-q)+rad(side==='near'?105:100)*q;
    const elbow=add(shoulder,mul([Math.sin(upper),Math.cos(upper)],length(sub(b.elbow,b.shoulder))));
    const wrist=add(elbow,mul([Math.sin(lower),Math.cos(lower)],length(sub(b.wrist,b.elbow))));
    result[side]={hip,knee,ankle,shoulder,elbow,wrist};
  }
  return result;
}

function angle(v){return Math.atan2(v[1],v[0])}
export function rigid(p,origin,target,a){return add(target,rotate(sub(p,origin),a))}

// Restore the better initial knee construction only; proximal C1 attachment
// remains below. The two unsuccessful C2 field variants are recorded in notes.
function initialKneePoint(p,base,current){
  const a=base.hip,b=base.knee,c=base.ankle,A=current.hip,B=current.knee,C=current.ankle;
  const ab=sub(b,a),bc=sub(c,b),la=length(ab),lb=length(bc),u=mul(ab,1/la),v=mul(bc,1/lb);
  const pa=sub(p,a),pb=sub(p,b),sa=clamp(pa[0]*u[0]+pa[1]*u[1],0,la),sb=clamp(pb[0]*v[0]+pb[1]*v[1],0,lb);
  const da=length(sub(p,add(a,mul(u,sa)))),db=length(sub(p,add(b,mul(v,sb))));
  const upper=da<=db,s=upper?pa[0]*u[0]+pa[1]*u[1]:la+pb[0]*v[0]+pb[1]*v[1];
  const n=upper?[-u[1],u[0]]:[-v[1],v[0]],normal=upper?pa[0]*n[0]+pa[1]*n[1]:pb[0]*n[0]+pb[1]*n[1];
  const w=smooth((s-la+28)/56),baseCenter=upper?add(a,mul(u,s)):add(b,mul(v,s-la));
  const ra=angle(sub(B,A))-angle(ab),rb=angle(sub(C,B))-angle(bc);
  const center=mix(rigid(baseCenter,a,A,ra),rigid(baseCenter,b,B,rb),w),normalMix=mix(rotate(n,ra),rotate(n,rb),w);
  return add(center,mul(normalMix,normal/Math.max(0.1,length(normalMix))));
}

// Continuous rotation field about the bend. The longitudinal weight is based
// on the rest axis, not a nearest-segment switch across the inner crease.
export function limbPoint(p,base,current,kind,parentAngle=0) {
  const names=kind==='arm'?['shoulder','elbow','wrist']:['hip','knee','ankle'];
  const [a,b,c]=names.map(n=>base[n]),[A,B,C]=names.map(n=>current[n]);
  const ab=sub(b,a),bc=sub(c,b);
  const ra=angle(sub(B,A))-angle(ab),rb=angle(sub(C,B))-angle(bc);
  const half=34;
  const w=smooth((p[1]-b[1]+half)/(2*half));
  let delta=rb-ra;while(delta>Math.PI)delta-=2*Math.PI;while(delta<-Math.PI)delta+=2*Math.PI;
  const bent=kind==='leg'?initialKneePoint(p,base,current):rigid(p,b,B,ra+delta*w);
  // Proximal surface gradually leaves the torso; the middle of the segment
  // reaches full bone rotation. No global scaling or changed bone lengths.
  const root=kind==='leg'?55:40,reach=kind==='leg'?70:55;
  const rootWeight=smooth((p[1]-a[1]+root)/(root+reach));
  const attached=rigid(p,a,A,parentAngle+(ra-parentAngle)*rootWeight);
  return mix(attached,bent,smooth((p[1]-a[1]-reach+12)/24));
}

export function mapPoint(id,p,pose) {
  if(id==='body') {
    const body=pose.bodyPoint(p),b=bind.near,c=pose.near;
    // Only the lower garment surface follows the outgoing thigh. Pelvic mass
    // and upper torso retain their existing anchors and shape.
    const r=angle(sub(c.knee,c.hip))-angle(sub(b.knee,b.hip));
    const weight=smooth((p[1]-bind.pelvis[1]+8)/65);
    return mix(body,rigid(p,b.hip,c.hip,r),weight*0.8);
  }
  if(id==='head') return rigid(p,bind.neck,pose.neck,pose.chestAngle*0.55);
  const side=id.endsWith('near')?'near':'far',b=bind[side],c=pose[side];
  if(id.startsWith('leg')) return limbPoint(p,b,c,'leg',pose.pelvicAngle);
  if(id.startsWith('arm')) return limbPoint(p,b,c,'arm',pose.chestAngle);
  if(id.startsWith('hand')) return rigid(p,b.wrist,c.wrist,angle(sub(c.wrist,c.elbow))-angle(sub(b.wrist,b.elbow)));
  if(id.startsWith('foot')) {
    // Lower sole is fixed. The upper boot follows the shin, on the same surface.
    const a=angle(sub(c.knee,c.ankle))-angle(sub(b.knee,b.ankle));
    // Actual boot sole is at ankle+31; its whole lower foot stays fixed.
    // Rotation eases from the instep (ankle+12) to the hidden top (ankle-32).
    const top=smooth((b.ankle[1]+12-p[1])/44);
    return rigid(p,b.ankle,c.ankle,a*top);
  }
  throw Error(`Неизвестная поверхность ${id}`);
}
