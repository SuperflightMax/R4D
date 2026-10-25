// Camera-only fit. All material vertices conservatively bound the visible
// silhouette, including hair, hands, shoes and hidden continuations.
export function framing(pose,camera,requestedZoom=1){
 const vertices=Object.values(pose.surfaces).flatMap(g=>g.vertices);
 const bounds={minX:Infinity,minY:Infinity,maxX:-Infinity,maxY:-Infinity};
 for(const [x,y] of vertices){bounds.minX=Math.min(bounds.minX,x);bounds.maxX=Math.max(bounds.maxX,x);bounds.minY=Math.min(bounds.minY,y);bounds.maxY=Math.max(bounds.maxY,y);}
 const large=requestedZoom===2,width=large?1280:960,height=large?960:640,padding=large?24:0;
 let scale=large?Math.min(2,(width-2*padding)/Math.max(1e-9,bounds.maxX-bounds.minX),(height-2*padding)/Math.max(1e-9,bounds.maxY-bounds.minY)):1;
 let origin=[width/2,large?900:560];
 if(large){
  const inside=(value,low,high)=>Math.max(low,Math.min(high,value));
  origin[0]=inside(origin[0],padding-(bounds.minX-camera)*scale,width-padding-(bounds.maxX-camera)*scale);
  origin[1]=inside(origin[1],padding+bounds.maxY*scale,height-padding+bounds.minY*scale);
 }
 const margins={left:origin[0]+(bounds.minX-camera)*scale,right:width-origin[0]-(bounds.maxX-camera)*scale,top:origin[1]-bounds.maxY*scale,bottom:height-origin[1]+bounds.minY*scale};
 return {width,height,scale,origin,bounds,margins,requestedZoom,padding};
}
