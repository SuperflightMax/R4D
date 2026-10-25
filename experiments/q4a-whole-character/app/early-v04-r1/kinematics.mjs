// New v04-only kinematics. No inherited rig, pose data, anchors or motion system.
export const add=(a,b)=>[a[0]+b[0],a[1]+b[1]];
export const sub=(a,b)=>[a[0]-b[0],a[1]-b[1]];
export const length=a=>Math.hypot(...a);
export function rotate(p,angle){const c=Math.cos(angle),s=Math.sin(angle);return[c*p[0]-s*p[1],s*p[0]+c*p[1]];}
export function rigidPoint(p,sourceAnchor,targetAnchor,angle){return add(targetAnchor,rotate(sub(p,sourceAnchor),angle));}
export function ik(hip,ankle,thigh,shin){
 const d=length(sub(ankle,hip));
 if(d>thigh+shin+1e-7||d<Math.abs(thigh-shin)-1e-7)throw new Error(`Unreachable full chain: d=${d}, lengths=${thigh}/${shin}`);
 const e=sub(ankle,hip).map(v=>v/d),a=(thigh*thigh-shin*shin+d*d)/(2*d);
 const h=Math.sqrt(Math.max(0,thigh*thigh-a*a));
 // Right-facing anatomical knee branch, fixed for the entire path.
 return[hip[0]+a*e[0]+h*e[1],hip[1]+a*e[1]-h*e[0]];
}
export function angleBetweenSegments(a,b,A,B){return Math.atan2(B[1]-A[1],B[0]-A[0])-Math.atan2(b[1]-a[1],b[0]-a[0]);}
export function poseAt(g,low=0,swingDegrees=0){
 if(low<0||low>1||Math.abs(swingDegrees)>25+1e-8)throw new Error('Outside agreed R1 range');
 const root=[g.low.back*low,g.low.drop*low],pose={pelvis:add(g.joints.pelvis,root)},transforms={};
 for(const side of['near','far']){
  const restHip=g.joints[side+'Hip'],restKnee=g.joints[side+'Knee'],restAnkle=g.joints[side+'Ankle'];
  const hip=add(restHip,root),ankle=[restAnkle[0],g.floor-g.soles[side].denseBottomCellEdgeRelativeToAnkle];
  const knee=ik(hip,ankle,g.lengths[side].thigh,g.lengths[side].shin);
  Object.assign(pose,{[side+'Hip']:hip,[side+'Knee']:knee,[side+'Ankle']:ankle});
  transforms[side+'Thigh']={sourceAnchor:restHip,targetAnchor:hip,angle:angleBetweenSegments(restHip,restKnee,hip,knee)};
  transforms[side+'Shin']={sourceAnchor:restKnee,targetAnchor:knee,angle:angleBetweenSegments(restKnee,restAnkle,knee,ankle)};
  // Foot has only the ankle transform. Target ankle came from the full IK chain.
  transforms[side+'Shoe']={sourceAnchor:restAnkle,targetAnchor:ankle,angle:0};
 }
 const shoulder=add(g.joints.nearShoulder,root);
 transforms.nearArm={sourceAnchor:g.joints.nearShoulder,targetAnchor:shoulder,angle:swingDegrees*Math.PI/180};
 pose.nearShoulder=shoulder;
 pose.nearElbow=rigidPoint(g.joints.nearElbow,g.joints.nearShoulder,shoulder,transforms.nearArm.angle);
 pose.nearWrist=rigidPoint(g.joints.nearWrist,g.joints.nearShoulder,shoulder,transforms.nearArm.angle);
 return{low,swingDegrees,root,pose,transforms};
}
