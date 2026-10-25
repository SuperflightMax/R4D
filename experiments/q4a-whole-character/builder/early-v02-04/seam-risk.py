"""Read-only agreement check of the CHOSEN 2-root/1-hem model at deep low.
No masks, renderer, material manufacturing or alternate anchor trials.
"""
from pathlib import Path
import json,math
import numpy as np

here=Path(__file__).resolve().parent
root=here.parents[1]
proposal=json.loads((root/'art/early-v02-04/PANELS.json').read_text())
parts=json.loads((root/'build/early-v02-02/art/parts.json').read_text())
samples=json.loads((root/'build/early-v02-02/measurements.json').read_text())
rest={k:np.array(v,dtype=float)for k,v in parts['jointPoints'].items()}
pose={k:np.array([v['x'],v['y']])for k,v in next(r for r in samples['after']if r['label']=='down-120')['state']['pose'].items()}
delta=pose['pelvis']-rest['pelvis']
def thigh(p,side):
 a,b=rest[side+'Hip'],rest[side+'Knee'];A,B=pose[side+'Hip'],pose[side+'Knee']
 t=math.atan2(*(B-A)[::-1])-math.atan2(*(b-a)[::-1])
 c,s=math.cos(t),math.sin(t)
 return A+np.array([[c,-s],[s,c]])@(np.array(p)-a)
def inside(p,poly):
 x,y=p;result=False
 for a,b in zip(poly,poly[1:]+poly[:1]):
  if ((a[1]>y)!=(b[1]>y))and x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0]:result=not result
 return result
anchors={'near':[[452,613],[598,615],[592,757]],'far':[[598,615],[625,626],[634,758]]}
cut=proposal['proposedHiddenAttachmentCut'];waist=proposal['waistCurve'];rows={}
for side,src in anchors.items():
 targets=np.array([np.array(src[0])+delta,np.array(src[1])+delta,thigh(src[2],side)])
 matrix=np.linalg.solve(np.array([[*p,1]for p in src],dtype=float),targets).T
 lineA,lineB=np.array(src[0]),np.array(src[1]);direction=lineB-lineA
 entries=[]
 for q in cut:
  # near/far membership comes from the shared attachment endpoint, not a panel x-mask.
  if side=='near' and cut.index(q)>9:continue
  if side=='far' and cut.index(q)<9:continue
  target=matrix@np.array([*q,1]);root_target=np.array(q)+delta
  signed_distance=np.cross(direction,np.array(q)-lineA)/np.linalg.norm(direction)
  entries.append({'source':q,'target':target.tolist(),'rootTarget':root_target.tolist(),
   'deltaFromRoot':(target-root_target).tolist(),'distanceFromFixedAnchorLine':float(signed_distance)})
 rows[side]={'chosenSourceAnchors':src,'targetAnchors':targets.tolist(),'matrix2x3':matrix.tolist(),
  'determinantDeepLow':float(np.linalg.det(matrix[:,:2])),
  'attachmentCurve':entries,'maxAttachmentDisplacementPx':max(float(np.linalg.norm(e['deltaFromRoot']))for e in entries)}
result={'scope':'agreement-only deep-low seam risk; no construction or full determinant gate',
 'model':'one affine per flap, exactly 2 root anchors + 1 thigh hem anchor; no alternative tried',
 'availableMaterialStrip':proposal['hiddenMargins'][0],
 'observedLimit':'two anchors fix their straight line, not the whole traced curved attachment',
 'panels':rows,'actualAlphaOcclusionMeasured':False}
(here/'SEAM_RISK.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps({s:{'detDeepLow':r['determinantDeepLow'],'maxAttachmentDisplacementPx':r['maxAttachmentDisplacementPx']}for s,r in rows.items()},indent=2))
