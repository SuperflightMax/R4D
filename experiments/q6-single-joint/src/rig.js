const rad=Math.PI/180;
const rotate=([x,y],angle)=>[x*Math.cos(angle)-y*Math.sin(angle),x*Math.sin(angle)+y*Math.cos(angle)];
export function transforms(contract,pose,zoom=false,source=false){
  const scale=zoom?contract.presentation.zoom_scale:contract.presentation.target_scale;
  const camera=zoom?contract.presentation.hip_screen_at_zoom:contract.presentation.hip_screen_at_target;
  const rootAngle=pose.angle*rad;
  const root={x:camera[0]+pose.x*scale,y:camera[1]+pose.y*scale,angle:rootAngle,scale};
  const hip=rotate(contract.rig.thigh.root_offset,rootAngle);
  const thigh={x:root.x+hip[0]*scale,y:root.y+hip[1]*scale,angle:rootAngle+pose.thigh*rad,scale,pivot:contract.rig.thigh.pivot,layer:contract.rig.thigh.layer};
  const offset=source?contract.diagnosis.source_diagnostic_baseline.child_offset:contract.rig.shin.child_offset;
  const knee=rotate(offset,thigh.angle);
  const shin={x:thigh.x+knee[0]*scale,y:thigh.y+knee[1]*scale,angle:thigh.angle+pose.shin*rad,scale,pivot:contract.rig.shin.pivot,layer:contract.rig.shin.layer};
  return {root,thigh,shin};
}
export function equality(records){
  const neutral=records.filter(r=>!r.source&&r.loaded);
  const reference=neutral[0];
  const mismatches=reference?neutral.filter(r=>r.pose!==reference.pose||JSON.stringify(r.transform)!==JSON.stringify(reference.transform)).map(r=>r.id):[];
  return {exact:mismatches.length===0,checked:neutral.map(r=>r.id),excluded:records.filter(r=>r.source).map(r=>r.id),mismatches,overlayExcluded:true};
}
