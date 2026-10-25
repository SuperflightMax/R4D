import {boundaryPanel,polygonPanel} from '../../app/boundary-cloth.mjs';
const join=(a,b)=>[...a,...b.slice(1)];
const points=(trace,key)=>trace.curves[key].points;
const point=p=>({x:p[0],y:p[1]});

// This adapter uses only the named, explicitly accepted curves in CLOTH_TRACE.
// Uses the final simple panel boundary, including the original fold lips.
export function tracedGeometry(trace,crop){
  if(trace.anchors.nearHem.owner!=='near'||trace.anchors.nearHem.point.join(',')!=='592,757')throw new Error('Locked nearHem ownership changed');
  const separation=points(trace,'panel_separation_proposal');
  const frontLip=points(trace,'near_front_fold_lip');
  const backLip=points(trace,'near_back_fold_lip');
  const skinHem=points(trace,'near_hem_skin_boundary');
  const waistNear=join(points(trace,'waist_back_visible'),points(trace,'waist_occluded'));
  const nearHem=[...backLip,...skinHem,...frontLip.slice(1)];
  const near=boundaryPanel({side:'near',waist:waistNear,left:points(trace,'near_back_side'),hem:nearHem,right:separation},crop);
  near.id='near-main';
  const far=boundaryPanel({side:'far',waist:points(trace,'waist_front_visible'),left:separation,
    hem:[trace.anchors.nearHem.point,...points(trace,'far_hem')],right:points(trace,'far_front_side')},crop);
  far.id='far-main';
  return [near,far];
}
