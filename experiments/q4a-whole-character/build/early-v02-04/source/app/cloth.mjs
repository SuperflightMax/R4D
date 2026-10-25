const smooth = (a, b, x) => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t*t*(3-2*t);
};
function rigid(point, from, to, rest, pose) {
  const a=rest[from], b=rest[to], A=pose[from], B=pose[to];
  const angle=Math.atan2(B.y-A.y,B.x-A.x)-Math.atan2(b.y-a.y,b.x-a.x);
  const x=point.x-a.x,y=point.y-a.y;
  return {x:A.x+x*Math.cos(angle)-y*Math.sin(angle),y:A.y+x*Math.sin(angle)+y*Math.cos(angle)};
}

// Agreed source-space zones in art/early-v02-02/CONTOURS.md.
// One original garment surface, no extra overlay or pose-specific texture.
export function clothPoint(point, rest, pose, side = null) {
  const torsoWeight=1-smooth(615,665,point.y);
  const thighWeight=smooth(side==='far'?615:660,755,point.y);
  const farFraction=side ? (side==='far' ? 1 : 0) : smooth(590,608,point.x);
  const pelvisWeight=1-torsoWeight-thighWeight;
  const torso=rigid(point,'pelvis','neck',rest,pose);
  const near=rigid(point,'nearHip','nearKnee',rest,pose);
  const far=rigid(point,'farHip','farKnee',rest,pose);
  const pelvis={x:point.x+pose.pelvis.x-rest.pelvis.x,y:point.y+pose.pelvis.y-rest.pelvis.y};
  return {
    x:torso.x*torsoWeight+pelvis.x*pelvisWeight+near.x*thighWeight*(1-farFraction)+far.x*thighWeight*farFraction,
    y:torso.y*torsoWeight+pelvis.y*pelvisWeight+near.y*thighWeight*(1-farFraction)+far.y*thighWeight*farFraction,
  };
}

export function clothGeometry(crop, region = null) {
  const [x,y,w,h]=crop;
  const start=region?.[0] ?? x, stop=region?.[1] ?? x+w;
  const cols=Math.ceil((stop-start)/8), rows=Math.ceil(h/8);
  const vertices=[],uvs=[],indices=[],source=[];
  for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++){
    const u=(start-x+(stop-start)*i/cols)/w,v=j/rows;
    const point={x:x+u*w,y:y+v*h}; source.push(point);
    vertices.push(point.x,point.y);uvs.push(u,v);
  }
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
    const a=j*(cols+1)+i,b=a+1,c=a+cols+1,d=c+1;
    indices.push(a,b,c,b,d,c);
  }
  return {vertices:new Float32Array(vertices),uvs:new Float32Array(uvs),indices:new Uint32Array(indices),source};
}
