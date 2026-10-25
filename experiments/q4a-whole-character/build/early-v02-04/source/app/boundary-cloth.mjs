import earcut from 'earcut';

const point=p=>Array.isArray(p)?{x:p[0],y:p[1]}:p;
export const signedArea2=(a,b,c)=>(b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x);
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
const same=(a,b)=>distance(a,b)<1e-7;

function curveSamples(values, label) {
  if(!values||values.length<2)throw new Error(`Missing traced boundary: ${label}`);
  const points=values.map(point), lengths=[0];
  for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+distance(points[i-1],points[i]));
  const total=lengths.at(-1);
  if(total<=0)throw new Error(`Zero boundary length: ${label}`);
  return points.map((p,i)=>({source:p,parameter:lengths[i]/total,role:label}));
}

// Direct triangulation of the traced source polygon. There is no rectangular
// x-split, fitted grid or free blend-weight field. All interior mappings are
// piecewise affine from the actual boundary vertices.
export function boundaryPanel(panel,crop) {
  const curves=Object.fromEntries(['waist','left','hem','right'].map(k=>[k,curveSamples(panel[k],k)]));
  const {waist,left,hem,right}=curves;
  for(const [a,b,name]of[[waist[0],left[0],'top-left'],[waist.at(-1),right[0],'top-right'],
    [hem[0],left.at(-1),'bottom-left'],[hem.at(-1),right.at(-1),'bottom-right']]) {
    if(!same(a.source,b.source))throw new Error(`Traced corners disagree: ${panel.side}/${name}`);
  }
  const boundary=[...waist,...right.slice(1),...hem.slice(0,-1).reverse(),...left.slice(1,-1).reverse()];
  return polygonPanel(panel.side,boundary,crop);
}

export function polygonPanel(side,boundary,crop){
  const flat=boundary.flatMap(v=>[v.source.x,v.source.y]);
  const indices=earcut(flat);
  if(!indices.length)throw new Error(`Cannot triangulate traced panel ${side}`);
  for(let i=0;i<indices.length;i+=3){
    const a=boundary[indices[i]].source,b=boundary[indices[i+1]].source,c=boundary[indices[i+2]].source;
    if(signedArea2(a,b,c)<0)[indices[i+1],indices[i+2]]=[indices[i+2],indices[i+1]];
    if(Math.abs(signedArea2(a,b,c))<1e-8)throw new Error('Degenerate source triangle');
  }
  const [x,y,w,h]=crop;
  return {side,boundary,source:boundary.map(v=>v.source),
    vertices:new Float32Array(flat),uvs:new Float32Array(boundary.flatMap(v=>[(v.source.x-x)/w,(v.source.y-y)/h])),
    indices:new Uint32Array(indices)};
}

function rigid(p,from,to,rest,pose){
  const a=rest[from],b=rest[to],A=pose[from],B=pose[to];
  const angle=Math.atan2(B.y-A.y,B.x-A.x)-Math.atan2(b.y-a.y,b.x-a.x);
  const x=p.x-a.x,y=p.y-a.y;
  return{x:A.x+x*Math.cos(angle)-y*Math.sin(angle),y:A.y+x*Math.sin(angle)+y*Math.cos(angle)};
}

export function boundaryPose(geometry,rest,pose){
  return geometry.boundary.map(vertex=>{
    const p=vertex.source;
    const upper=rigid(p,'pelvis','neck',rest,pose);
    const lower=rigid(p,`${geometry.side}Hip`,`${geometry.side}Knee`,rest,pose);
    const t=vertex.role==='waist'?0:vertex.role==='hem'?1:vertex.parameter;
    // Side boundaries use only their measured normalized arc position.
    // No parameter sweep, pose-specific branch or adjustable weight interval.
    return{x:upper.x+(lower.x-upper.x)*t,y:upper.y+(lower.y-upper.y)*t};
  });
}

export function boundaryAudit(geometry,posed){
  const rows=[];
  for(let i=0;i<geometry.indices.length;i+=3){
    const ids=Array.from(geometry.indices.slice(i,i+3));
    const sourceArea2=signedArea2(...ids.map(i=>geometry.source[i]));
    const area2=signedArea2(...ids.map(i=>posed[i]));
    rows.push({triangle:i/3,indices:ids,sourceArea2,area2,jacobian:area2/sourceArea2,inverted:area2<=0});
  }
  return rows;
}

function barycentric(p,a,b,c){
  const den=signedArea2(a,b,c);
  const w1=((p.x-a.x)*(c.y-a.y)-(p.y-a.y)*(c.x-a.x))/den;
  const w2=((b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x))/den;
  return[1-w1-w2,w1,w2];
}
function edgeDistance2(p,a,b){
  const x=b.x-a.x,y=b.y-a.y,den=x*x+y*y;
  const t=den?Math.max(0,Math.min(1,((p.x-a.x)*x+(p.y-a.y)*y)/den)):0;
  return(p.x-a.x-t*x)**2+(p.y-a.y-t*y)**2;
}
function locate(p,faces){
  let best=null;
  for(let f=0;f<faces.length;f++){
    const g=faces[f];
    for(let i=0;i<g.indices.length;i+=3){
      const ids=Array.from(g.indices.slice(i,i+3)),[a,b,c]=ids.map(i=>g.source[i]);
      const weights=barycentric(p,a,b,c),inside=weights.every(w=>w>=-1e-9);
      const distance2=inside?0:Math.min(edgeDistance2(p,a,b),edgeDistance2(p,b,c),edgeDistance2(p,c,a));
      if(!best||distance2<best.distance2-1e-12)best={face:f,ids,weights,distance2,inside};
      if(inside)return best;
    }
  }
  return best;
}

// Exhaustive source-cell coverage: every NONZERO-alpha pixel is assigned once.
// Traced visible curves are approximate (Asset says ±3/8 px); their existing
// alpha fringe is mapped by the nearest traced affine face, never discarded.
export function materialMeshes(faces,crop,cells){
  const groups={near:faces.filter(f=>f.side==='near'),far:faces.filter(f=>f.side==='far')};
  const meshes=Object.fromEntries(Object.entries(groups).map(([side,group])=>[side,
    {side,faces:group,source:[],mapping:[],indices:[],cells:[],keys:new Map()}]));
  const coverage={nonzero:cells.length,near:0,far:0,rawBoundaryOverlap:0,outsideTraceButIncluded:0,
    outsideTraceVisibleSource:0,visibleSource:0,unassigned:0,duplicateVisibleOwner:0};
  for(const cell of cells){
    const [x,y,alpha,visibleAlpha]=cell,p={x:crop[0]+x+0.5,y:crop[1]+y+0.5};
    const n=locate(p,groups.near),f=locate(p,groups.far);
    if(n.inside&&f.inside)coverage.rawBoundaryOverlap++;
    const owner=n.inside?'near':f.inside?'far':n.distance2<=f.distance2?'near':'far';
    if(!n.inside&&!f.inside){coverage.outsideTraceButIncluded++;if(visibleAlpha)coverage.outsideTraceVisibleSource++;}
    if(visibleAlpha)coverage.visibleSource++;
    coverage[owner]++;
    const m=meshes[owner];m.cells.push({x,y,alpha,visibleAlpha});
    const ids=[];
    for(const [dx,dy]of[[0,0],[1,0],[0,1],[1,1]]){
      const key=`${x+dx},${y+dy}`;
      if(!m.keys.has(key)){
        const q={x:crop[0]+x+dx,y:crop[1]+y+dy};
        m.keys.set(key,m.source.length);m.source.push(q);m.mapping.push(locate(q,m.faces));
      }
      ids.push(m.keys.get(key));
    }
    m.indices.push(ids[0],ids[1],ids[2],ids[1],ids[3],ids[2]);
  }
  for(const m of Object.values(meshes)){
    delete m.keys;
    m.vertices=new Float32Array(m.source.flatMap(p=>[p.x,p.y]));
    m.uvs=new Float32Array(m.source.flatMap(p=>[(p.x-crop[0])/crop[2],(p.y-crop[1])/crop[3]]));
    m.indices=new Uint32Array(m.indices);
  }
  return{meshes,coverage};
}

export function materialPose(mesh,rest,pose){
  const positions=mesh.faces.map(f=>boundaryPose(f,rest,pose));
  return mesh.mapping.map(m=>({
    x:m.ids.reduce((s,i,j)=>s+positions[m.face][i].x*m.weights[j],0),
    y:m.ids.reduce((s,i,j)=>s+positions[m.face][i].y*m.weights[j],0),
  }));
}
