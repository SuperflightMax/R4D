// EARLY_V02_04: one transform per whole garment object; no vertex/cell mapping.
export const PANEL_EPSILON=1e-4;
export const PANEL_ANCHORS={
 nearFlap:[[452,613],[598,615],[592,757]],
 farFlap:[[598,615],[625,626],[634,758]],
};
export const applyMatrix=(m,p)=>({x:m.a*p.x+m.c*p.y+m.tx,y:m.b*p.x+m.d*p.y+m.ty});
const point=p=>({x:p[0],y:p[1]});
function thigh(p,side,rest,pose){
 const a=rest[`${side}Hip`],b=rest[`${side}Knee`],A=pose[`${side}Hip`],B=pose[`${side}Knee`];
 const angle=Math.atan2(B.y-A.y,B.x-A.x)-Math.atan2(b.y-a.y,b.x-a.x);
 const x=p.x-a.x,y=p.y-a.y;
 return{x:A.x+x*Math.cos(angle)-y*Math.sin(angle),y:A.y+x*Math.sin(angle)+y*Math.cos(angle)};
}
export{thigh as rigidThighPoint};
export function garmentMatrix(id,rest,pose){
 const dx=pose.pelvis.x-rest.pelvis.x,dy=pose.pelvis.y-rest.pelvis.y;
 if(id==='waistSeat')return{a:1,b:0,c:0,d:1,tx:dx,ty:dy,determinant:1};
 const anchors=PANEL_ANCHORS[id];
 if(!anchors)throw new Error(`Unknown agreed garment panel ${id}`);
 const [A,B,C]=anchors.map(point),side=id==='nearFlap'?'near':'far';
 const targets=[{x:A.x+dx,y:A.y+dy},{x:B.x+dx,y:B.y+dy},thigh(C,side,rest,pose)];
 const u={x:B.x-A.x,y:B.y-A.y},v={x:C.x-A.x,y:C.y-A.y};
 const U={x:targets[1].x-targets[0].x,y:targets[1].y-targets[0].y};
 const V={x:targets[2].x-targets[0].x,y:targets[2].y-targets[0].y};
 const sourceDet=u.x*v.y-u.y*v.x;
 if(Math.abs(sourceDet)<1e-9)throw new Error(`Collinear agreed anchors: ${id}`);
 const a=(U.x*v.y-V.x*u.y)/sourceDet,c=(V.x*u.x-U.x*v.x)/sourceDet;
 const b=(U.y*v.y-V.y*u.y)/sourceDet,d=(V.y*u.x-U.y*v.x)/sourceDet;
 return{a,b,c,d,tx:targets[0].x-a*A.x-c*A.y,ty:targets[0].y-b*A.x-d*A.y,
  determinant:a*d-b*c,sourceAnchors:[A,B,C],targetAnchors:targets};
}
