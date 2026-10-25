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

// Local two-bone deformation. Centerline blends near the joint; normals retain
// their width rather than collapsing under ordinary linear skinning.
export function limbPoint(p,base,current,kind) {
  const names=kind==='arm'?['shoulder','elbow','wrist']:['hip','knee','ankle'];
  const [a,b,c]=names.map(n=>base[n]),[A,B,C]=names.map(n=>current[n]);
  const ab=sub(b,a),bc=sub(c,b),la=length(ab),lb=length(bc),u=mul(ab,1/la),v=mul(bc,1/lb);
  const pa=sub(p,a),pb=sub(p,b),sa=clamp(pa[0]*u[0]+pa[1]*u[1],0,la),sb=clamp(pb[0]*v[0]+pb[1]*v[1],0,lb);
  const da=length(sub(p,add(a,mul(u,sa)))),db=length(sub(p,add(b,mul(v,sb))));
  const onUpper=da<=db;
  const s=onUpper?pa[0]*u[0]+pa[1]*u[1]:la+pb[0]*v[0]+pb[1]*v[1];
  const n=onUpper?[-u[1],u[0]]:[-v[1],v[0]];
  const normal=onUpper?pa[0]*n[0]+pa[1]*n[1]:pb[0]*n[0]+pb[1]*n[1];
  const w=smooth((s-la+28)/56);
  const baseCenter=onUpper?add(a,mul(u,s)):add(b,mul(v,s-la));
  const ra=angle(sub(B,A))-angle(ab),rb=angle(sub(C,B))-angle(bc);
  const center=mix(rigid(baseCenter,a,A,ra),rigid(baseCenter,b,B,rb),w);
  const normalA=rotate(n,ra),normalB=rotate(n,rb),normalMix=mix(normalA,normalB,w);
  return add(center,mul(normalMix,normal/Math.max(0.1,length(normalMix))));
}

export function mapPoint(id,p,pose) {
  if(id==='body') return pose.bodyPoint(p);
  if(id==='head') return rigid(p,bind.neck,pose.neck,pose.chestAngle*0.55);
  const side=id.endsWith('near')?'near':'far',b=bind[side],c=pose[side];
  if(id.startsWith('leg')) return limbPoint(p,b,c,'leg');
  if(id.startsWith('arm')) return limbPoint(p,b,c,'arm');
  if(id.startsWith('hand')) return rigid(p,b.wrist,c.wrist,angle(sub(c.wrist,c.elbow))-angle(sub(b.wrist,b.elbow)));
  if(id.startsWith('foot')) {
    // Lower sole is fixed. The upper boot follows the shin, on the same surface.
    const a=angle(sub(c.knee,c.ankle))-angle(sub(b.knee,b.ankle));
    return mix(p,rigid(p,b.ankle,c.ankle,a),smooth((b.ankle[1]+20-p[1])/40));
  }
  throw Error(`Неизвестная поверхность ${id}`);
}
