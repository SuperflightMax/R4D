// New Nela runtime solver. Equations implement accepted Q5A v4 construction,
// not a rig/motion from any historical experiment. Units: target screen pixels.
export const add=(a,b)=>[a[0]+b[0],a[1]+b[1]], sub=(a,b)=>[a[0]-b[0],a[1]-b[1]], mul=(a,s)=>[a[0]*s,a[1]*s];
export const len=a=>Math.hypot(...a), unit=a=>mul(a,1/Math.max(1e-12,len(a))), mix=(a,b,t)=>add(mul(a,1-t),mul(b,t));
export const clamp=(x,a,b)=>Math.max(a,Math.min(b,x)), smooth=t=>(t=clamp(t,0,1),t*t*(3-2*t));
export const rad=d=>d*Math.PI/180, rot=(p,d)=>[p[0]*Math.cos(rad(d))-p[1]*Math.sin(rad(d)),p[0]*Math.sin(rad(d))+p[1]*Math.cos(rad(d))];
export const cross=(a,b,c)=>(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);
const quad=(a,c,b,t)=>add(add(mul(a,(1-t)**2),mul(c,2*(1-t)*t)),mul(b,t*t));
const cubic=(a,b,c,d,n)=>Array.from({length:n+1},(_,i)=>{let t=i/n;return add(add(mul(a,(1-t)**3),mul(b,3*(1-t)**2*t)),add(mul(c,3*(1-t)*t*t),mul(d,t**3)));});
const ARM=[[0,15],[.18,15],[.45,13],[.78,10],[1,9],[1.22,11],[1.55,9],[1.85,6.5],[2,6]];
const LEG=[[0,25],[.22,26],[.5,23],[.8,17],[1,14],[1.22,18],[1.5,18],[1.82,11],[2,8]];
const SHOE=[[-19,-16],[-20,-5],[-10,5],[0,9],[16,-4],[37,-7],[40,-12],[36,-16]];
const tip=(p,l,d)=>add(p,[l*Math.sin(rad(d)),-l*Math.cos(rad(d))]);
export function knee(hip,ankle){let v=sub(ankle,hip),d=len(v);if(d>=192||d<=4)throw Error(`IK unreachable ${d}`);let u=unit(v),a=(98**2-94**2+d*d)/(2*d),h=Math.sqrt(Math.max(0,98**2-a*a));return add(hip,[u[0]*a-u[1]*h,u[1]*a+u[0]*h]);}
const flex=(a,j,b)=>180-Math.acos(clamp(unit(sub(a,j)).reduce((s,x,i)=>s+x*unit(sub(b,j))[i],0),-1,1))*180/Math.PI;
function ribbon(a,j,b,stations,frame=null){
 const u=unit(sub(j,a)),v=unit(sub(b,j)),theta=flex(a,j,b),inner=u[0]*v[1]-u[1]*v[0]>0?0:1;
 const rows=stations.map(([t,w])=>{let c=t<=1?mix(a,j,t):mix(j,b,t-1),tan=t<.82?u:t>1.18?v:unit(mix(u,v,(t-.82)/.36));if(t===1)tan=unit(add(u,v));let n=[-tan[1],tan[0]],bend=Math.max(0,1-Math.abs(t-1)/.22)*Math.min(theta/140,1),root=.35*Math.max(0,(.45-t)/.45);
  return [1,-1].map((sign,k)=>{let width=w*(k===inner?1+(1/Math.max(.34,Math.cos(rad(theta/2)))-1)*bend:1),p=add(c,mul(n,sign*width));
   if(frame&&root){let ru=[Math.sin(rad(frame[0])),-Math.cos(rad(frame[0]))],rn=[-ru[1],ru[0]],cc=add(a,rot(mul(ru,len(sub(j,a))*t),-frame[1])),cp=add(cc,rot(mul(rn,sign*w),-frame[1]));p=add(mix(c,cc,root),mul(unit(sub(mix(p,cp,root),mix(c,cc,root))),w));}return p;});});
 const collapse=smooth((theta-70)/20),fold=rows[4][inner];for(let i=3;i<=5;i++)rows[i][inner]=mix(rows[i][inner],fold,collapse);
 if(stations===LEG){let [h0,h1]=rows[2],hi=rows[2][inner],outside=unit(sub(hi,rows[2][1-inner]));for(let i=5;i<8;i++){let p=rows[i][inner],q=rows[i+1][inner];if(cross(p,q,h0)*cross(p,q,h1)<-1e-7&&cross(h0,h1,p)*cross(h0,h1,q)<-1e-7){let d=sub(p,hi).reduce((s,x,k)=>s+x*outside[k],0);rows[i][inner]=add(p,mul(outside,Math.max(0,.35-d)));}}}
 let vertices=rows.flat(),outer=1-inner,[oa,om,ob]=[3,4,5].map(i=>2*i+outer),control=sub(mul(vertices[om],2),mul(add(vertices[oa],vertices[ob]),.5)),arc=[];
 for(let k=0;k<=8;k++){let index=({0:oa,4:om,8:ob})[k];if(index===undefined){index=vertices.length;vertices.push(quad(vertices[oa],control,vertices[ob],k/8));}arc.push(index);}
 let chains=[0,1].map(side=>rows.map((_,i)=>2*i+side));chains[outer].splice(chains[outer].indexOf(oa),3,...arc);
 const fid=8+inner,centre=vertices[fid],radius=stations===LEG?8:6,t0=add(centre,mul(u,-radius)),t1=add(centre,mul(v,radius)),fillet=[];
 for(let k=0;k<=8;k++){fillet.push(vertices.length);vertices.push(quad(t0,centre,t1,k/8));}
 let cap=[];if(frame){let offset=rot([-8,8],-frame[1]),normal=unit(sub(rows[0][0],rows[0][1])),fwd=[normal[1],-normal[0]],along=offset.reduce((s,x,k)=>s+x*fwd[k],0);if(along>-8)offset=add(offset,mul(fwd,-along-8));cap=cubic(rows[0][1],add(rows[0][1],offset),add(rows[0][0],offset),rows[0][0],8).slice(1,-1);vertices.push(...cap);}
 let outline=[...chains[0].map(i=>vertices[i]),...chains[1].toReversed().map(i=>vertices[i]),...cap];
 return {vertices,outline,silhouette_regions:[outline,[centre,...fillet.map(i=>vertices[i])]],root_outline:[...rows.slice(0,3).map(r=>r[0]),...rows.slice(0,3).toReversed().map(r=>r[1]),...cap],limb_outline:[...chains[0].filter(i=>![0,2].includes(i)).map(i=>vertices[i]),...chains[1].toReversed().filter(i=>![1,3].includes(i)).map(i=>vertices[i])],visible_outline:[...chains[0].filter(i=>![0,2].includes(i)).map(i=>vertices[i]),...chains[1].toReversed().filter(i=>![1,3].includes(i)).map(i=>vertices[i])],flex:theta};
}
const polygon=outline=>({vertices:outline,outline});
function rowsMesh(rows){return {vertices:rows.flat(),outline:[...rows.map(r=>r[0]),...rows.toReversed().map(r=>r[1])]};}
export function staticFoot(ankle,contact){let pivot=contact==='heel'?[-19,-16]:contact==='toe'?[36,-16]:[0,-16],pitch=({heel:12,toe:-20,air:-8})[contact]??0,shift=[ankle[0],contact==='air'?ankle[1]:16],origin=add(shift,sub(pivot,rot(pivot,pitch)));return {origin,pitch,vertices:SHOE.map(p=>add(origin,rot(p,pitch)))};}
export const floorAnkle=pitch=>-Math.min(...SHOE.map(p=>rot(p,pitch)[1]));
export class Rig{
 constructor(data){this.data=data;this.bind=data.bind;this.meta=Object.fromEntries(data.surfaces.map(s=>[s.id,s]));}
 solve(spec){
  const root=spec.root,lean=spec.lean,tp=p=>add(root,rot(p,-lean)),j={pelvis:root,chest:tp([0,90]),neck:tp([0,138]),head:tp([5,158])},g={};
  for(const [i,side] of ['far','near'].entries()){
   let hip=add(root,rot([i?4:-4,0],-lean*.25)),foot=spec.feet?{origin:spec.feet[i].ankle,pitch:spec.feet[i].pitch,vertices:SHOE.map(p=>add(spec.feet[i].ankle,rot(p,spec.feet[i].pitch)))}:staticFoot(spec.ankles[i],spec.contact[i]);
   let k=knee(hip,foot.origin),shoulder=tp([i?6:-6,124]),[upper,bend]=spec.arms[i],elbow=tip(shoulder,68,upper),wrist=tip(elbow,62,upper+bend);
   for(let [key,p] of Object.entries({hip,knee:k,ankle:foot.origin,shoulder,elbow,wrist}))j[side+'_'+key]=p;
   let leg=ribbon(hip,k,foot.origin,LEG),arm=ribbon(shoulder,elbow,wrist,ARM,[i?8:-24,lean]);g[side+'_leg_skin']=leg;g[side+'_arm_skin']=arm;
   let anterior=mix(leg.vertices[2],leg.vertices[4],(.28-.22)/(.5-.22)),posterior=mix(leg.vertices[3],leg.vertices[5],(.28-.22)/(.5-.22));
   g[side+'_shorts_leg']=polygon([leg.vertices[0],leg.vertices[2],anterior,leg.vertices[4],leg.vertices[5],posterior]);g[side+'_shoe']=polygon(foot.vertices);
   let angle=upper+bend+5,direction=[Math.sin(rad(angle)),-Math.cos(rad(angle))],sign=i?1:-1,normal=[-direction[1]*sign,direction[0]*sign],local=this.bind.surfaces[side+'_hand'].anatomical_local_outline;
   g[side+'_hand']=polygon(local.map(p=>add(wrist,add(mul(direction,p[0]),mul(normal,p[1])))));
  }
  let lift=clamp(spec.arms[1][0]/140,0,1),local=[[-21,12],[-23,63],[-30,99],[-27,119],[-17,130],[-12,140],[9,140],[15,134],[8-2*lift,120+4*lift],[11,108+6*lift],[29,97+2*lift],[30,93],[24,62],[20,12]],left=local.slice(0,6),right=local.slice(6).toReversed(),at=(chain,y)=>{for(let i=0;i<chain.length-1;i++){let a=chain[i],b=chain[i+1];if(a[1]<=y&&y<=b[1])return [a[0]+(b[0]-a[0])*(y-a[1])/(b[1]-a[1]),y];}throw Error('torso row');};
  g.torso_top=rowsMesh(Array.from({length:65},(_,i)=>{let y=12+2*i;return [left,right].map(chain=>add(root,rot(at(chain,y),-lean*(.25+.75*clamp((y-12)/87,0,1)))));}));
  let patches=[];for(let side of ['far','near']){let hip=j[side+'_hip'],d=unit(sub(j[side+'_knee'],hip)),leg=g[side+'_leg_skin'],posterior=mix(leg.vertices[3],leg.vertices[5],(.28-.22)/(.5-.22)),anterior=mix(leg.vertices[2],leg.vertices[4],(.28-.22)/(.5-.22)),waist=add(root,rot([-19,24],-lean*.25)),front=add(root,rot([18,36],-lean*.25)),rear=cubic(waist,add(waist,rot([-5,-15],-lean*.25)),add(posterior,mul(d,-18)),posterior,16);patches.push(rowsMesh(rear.map((p,k)=>[p,mix(front,anterior,k/16)])));}
  g.pelvis_shorts={vertices:patches.flatMap(p=>p.vertices),patches,outline:patches[1].outline};
  g.neck_skin=polygon([[-12,125],[-11,151],[10,151],[12,125]].map(tp));
  g.head_face=polygon([[-19,-21],[-23,-5],[-22,16],[-12,29],[5,30],[20,22],[23,5],[29,0],[24,-5],[21,-17],[8,-29],[-9,-29]].map(p=>add(j.head,rot(p,-lean*.2))));
  g.hair=polygon([[-23,-11],[-26,7],[-21,24],[-10,32],[7,32],[22,23],[19,15],[4,20],[-7,11],[-14,-5]].map(p=>add(j.head,rot(p,-lean*.2))));
  return {surfaces:g,landmarks:j,spec};
 }
 pieces(pose,op){let name=op.surface,g=pose.surfaces[name],b=this.bind.surfaces[name];if(g.patches)return g.patches.map((p,i)=>({vertices:p.vertices,uv:b.patches[i].uv,triangles:b.patches[i].triangles}));let triangles=b.triangles;
  if(name.includes('arm_skin')&&op.fragment!=='all'){let ids=new Set([0,1,2,3,4,5,...b.cap_vertex_ids]);triangles=triangles.filter(t=>t.every(i=>ids.has(i))===(op.fragment==='root'));}
  if(name.includes('leg_skin'))triangles=triangles.filter(t=>Math.min(...t)>=4);return [{vertices:g.vertices,uv:b.uv,triangles}];
 }
}
