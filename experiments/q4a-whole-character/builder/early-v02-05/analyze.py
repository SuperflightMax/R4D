"""The single authorized read-only A05. Writes numbers only in builder/05.
Never writes art, masks, app, renderer, builds or any previous evidence.
"""
from pathlib import Path
import json,math,hashlib
import numpy as np
from PIL import Image

HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[1]
FROZEN=ROOT/'build/early-v02-04'
EPSILON=1e-4
FIXED={'nearFlap':[[522,592],[446,751],[592,757]],'farFlap':[[598,603],[596,765],[638,754]]}
def read(p):return json.loads(p.read_text(encoding='utf-8'))
parts=read(FROZEN/'art/parts.json')
design=read(FROZEN/'art/early-v02-04/PANELS.json')
trace=read(FROZEN/'art/early-v02-03/CLOTH_TRACE.json')
samples=read(ROOT/'build/early-v02-02/measurements.json')['after']
rest={k:np.array(v,dtype=float)for k,v in parts['jointPoints'].items()}
ids=['farFlap','nearFlap','waistSeat']
input_paths=[ROOT/'CORRECTION_05.md',ROOT/'art/early-v02-05/AGREEMENT.md',FROZEN/'art/parts.json',
 FROZEN/'art/early-v02-04/PANELS.json',ROOT/'build/early-v02-02/measurements.json']
materials={}
for id in ids:
 part=next(p for p in parts['parts']if p['id']==id)
 rgba=np.asarray(Image.open(FROZEN/'art'/part['file']).convert('RGBA'))
 visible=np.asarray(Image.open(FROZEN/'art'/part['visibleMask']).convert('L'))
 hidden=np.asarray(Image.open(FROZEN/'art'/part['hiddenMask']).convert('L'))
 yy,xx=np.where(rgba[:,:,3]>0);oy,ox=np.where(rgba[:,:,3]>=128)
 materials[id]={'part':part,'rgba':rgba,'visible':visible,'hidden':hidden,
  'points':np.column_stack((xx+part['cropRect'][0]+.5,yy+part['cropRect'][1]+.5)),
  'opaque':np.column_stack((ox+part['cropRect'][0]+.5,oy+part['cropRect'][1]+.5))}
 input_paths.extend([FROZEN/'art'/part['file'],FROZEN/'art'/part['visibleMask'],FROZEN/'art'/part['hiddenMask']])
hashes={str(p.relative_to(ROOT)):hashlib.sha256(p.read_bytes()).hexdigest()for p in input_paths}

def rigid_thigh(q,side,pose):
 a,b=rest[side+'Hip'],rest[side+'Knee'];A,B=pose[side+'Hip'],pose[side+'Knee']
 t=math.atan2(B[1]-A[1],B[0]-A[0])-math.atan2(b[1]-a[1],b[0]-a[0])
 return A+np.array([[math.cos(t),-math.sin(t)],[math.sin(t),math.cos(t)]])@(np.array(q)-a)
def matrices(pose):
 delta=pose['pelvis']-rest['pelvis'];out={'waistSeat':np.array([[1,0,delta[0]],[0,1,delta[1]]],dtype=float)}
 targets={}
 for id,src in FIXED.items():
  side='near'if id=='nearFlap'else'far'
  target=np.array([np.array(src[0])+delta,rigid_thigh(src[1],side,pose),rigid_thigh(src[2],side,pose)])
  out[id]=np.linalg.solve(np.array([[*p,1]for p in src],dtype=float),target).T;targets[id]=target
 return out,targets
def transform(m,q):return m[:,:2]@np.array(q)+m[:,2]
def inverse(m):
 inv=np.linalg.inv(m[:,:2]);return np.column_stack((inv,-inv@m[:,2]))
def source_lookup(id,q):
 mat=materials[id];part=mat['part'];x,y=math.floor(q[0]),math.floor(q[1]);lx,ly=x-part['cropRect'][0],y-part['cropRect'][1]
 h,w=mat['rgba'].shape[:2]
 alpha=int(mat['rgba'][ly,lx,3])if 0<=lx<w and 0<=ly<h else 0
 xa,xb=max(0,lx-1),min(w,lx+2);ya,yb=max(0,ly-1),min(h,ly+2)
 around=int(mat['rgba'][ya:yb,xa:xb,3].max())if xa<xb and ya<yb else 0
 sh,sw=mat['visible'].shape
 return{'sourceGlobal':np.array(q).tolist(),'sourceLocal':(np.array(q)-part['cropRect'][:2]).tolist(),
  'insideCrop':0<=lx<w and 0<=ly<h,'combinedAlpha':alpha,'linearFilterConservative3x3AlphaMax':around,
  'visibleMask':int(mat['visible'][y,x])if 0<=x<sw and 0<=y<sh else 0,
  'hiddenMask':int(mat['hidden'][y,x])if 0<=x<sw and 0<=y<sh else 0}
def lookup_all(target,inverses):
 return{id:source_lookup(id,transform(inverses[id],target))for id in ids}
def definitely_empty(target,inverses):
 return all(r['linearFilterConservative3x3AlphaMax']==0 for r in lookup_all(target,inverses).values())
def nearest_source(id,q):
 pts=materials[id]['opaque'];i=int(np.argmin(np.sum((pts-q)**2,axis=1)))
 return pts[i],float(np.linalg.norm(pts[i]-q))
def clearance(target,ms,inverses):
 rows={};minimum=float('inf')
 for id in ids:
  local=transform(inverses[id],target);pts=materials[id]['points']
  i=int(np.argmin(np.sum((pts-local)**2,axis=1)));distance=float(np.linalg.norm(pts[i]-local))
  sigma=float(np.linalg.svd(ms[id][:,:2],compute_uv=False).min())
  bound=max(0,distance-math.sqrt(.5))*sigma;minimum=min(minimum,bound)
  rows[id]={'nearestExistingNonzeroPixelCenterSource':pts[i].tolist(),'sourceCenterDistance':distance,
   'minSingularValue':sigma,'targetEmptyRadiusLowerBound':bound}
 return minimum,rows
def densify(curve):
 result=[]
 for i,(a,b)in enumerate(zip(curve,curve[1:])):
  a=np.array(a,dtype=float);b=np.array(b,dtype=float);n=max(1,math.ceil(np.linalg.norm(b-a)))
  for j in range(n):result.append((i,j/n,a+(b-a)*j/n))
 result.append((len(curve)-2,1.,np.array(curve[-1],dtype=float)));return result
def polygon_area(poly):
 return .5*sum(a[0]*b[1]-a[1]*b[0]for a,b in zip(poly,poly[1:]+poly[:1]))

output={'scope':'READ_ONLY_A05_SINGLE_FIXED_MODEL','epsilon':EPSILON,'anchors':FIXED,'inputSha256':hashes,
 'conventions':{'sourceCoordinates':'x right/y down, original pixels','sourcePixelFootprint':'unit cell, center (x+0.5,y+0.5)',
 'inverseLookup':'all three actual combined PNGs plus separate visible/hidden masks; conservative 3x3 texture-filter neighbourhood',
 'curveProbeStepSourcePxMax':1,'gapPathSteps':32,'coverageProof':'empty open disk bounded by nearest nonzero pixel cells and min singular value; not delta>12'},
 'rows':[],'minimumDeterminant':None,'maximumHemError':0,'firstProvenGap':None}
all_matrices=[];minimum=float('inf');minloc=None;maxhem=0
# First pass is the one fixed determinant/hem check; never tries other anchors.
for sample in samples:
 pose={k:np.array([p['x'],p['y']],dtype=float)for k,p in sample['state']['pose'].items()}
 ms,targets=matrices(pose);row={'sample':sample['label'],'matrices':{},'hemExact':{},'contours':{}}
 for id,m in ms.items():
  det=float(np.linalg.det(m[:,:2]));row['matrices'][id]={'matrix':m.tolist(),'determinant':det}
  if det<minimum:minimum=det;minloc={'sample':sample['label'],'panel':id}
  if id in FIXED:
   errors=[float(np.linalg.norm(transform(m,q)-target))for q,target in zip(FIXED[id],targets[id])]
   maxhem=max(maxhem,*errors[1:]);row['hemExact'][id]={'BError':errors[1],'CError':errors[2],'AError':errors[0]}
   boundary=next(p for p in design['panels']if p['id']==id)['agreementBoundary']
   target=[transform(m,q).tolist()for q in boundary]
   row['contours'][id]={'sourceSignedArea':polygon_area(boundary),'targetSignedArea':polygon_area(target),'targetBoundary':target}
  all_matrices.append(det)
 output['rows'].append(row)
output.update(minimumDeterminant=minimum,minimumLocation=minloc,maximumHemError=maxhem)
if minimum<=EPSILON:
 output.update(result='FAIL_STOP',reason='fixed affine determinant does not exceed epsilon',BStarted=False)
else:
 for row,sample in zip(output['rows'],samples):
  pose={k:np.array([p['x'],p['y']],dtype=float)for k,p in sample['state']['pose'].items()}
  ms,_=matrices(pose);inverses={id:inverse(m)for id,m in ms.items()};delta=pose['pelvis']-rest['pelvis']
  row['attachment']={};row['provenGap']=None
  curve=design['proposedHiddenAttachmentCut']
  for id,subcurve in [('nearFlap',curve[:10]),('farFlap',curve[9:])]:
   details=[]
   for segment,t,q in densify(subcurve):
    R=q+delta;F=transform(ms[id],q)
    details.append({'segment':segment,'t':t,'source':q.tolist(),'rootTarget':R.tolist(),'flapTarget':F.tolist(),
     'delta':(F-R).tolist(),'rootTargetLookup':lookup_all(R,inverses),
     'flapTargetHigherLayerLookup':{upper:source_lookup(upper,transform(inverses[upper],F))for upper in(['waistSeat']if id=='nearFlap'else['nearFlap','waistSeat'])}})
    if row['provenGap'] is not None:continue
    # Actual neighbouring source material on BOTH seam pieces, not just a virtual curve point.
    S,ds=nearest_source('waistSeat',q);P,dp=nearest_source(id,q)
    if ds>2 or dp>2:continue
    start=transform(ms['waistSeat'],S);end=transform(ms[id],P)
    empty=[]
    for j in range(1,32):
     point=start+(end-start)*j/32
     if definitely_empty(point,inverses):empty.append((j,point))
    if not empty:continue
    # Measure the middle of the longest consecutive empty interval once.
    runs=[];run=[]
    for item in empty:
     if run and item[0]!=run[-1][0]+1:runs.append(run);run=[]
     run.append(item)
    if run:runs.append(run)
    run=max(runs,key=len);j,target=run[len(run)//2];radius,distances=clearance(target,ms,inverses)
    if radius<=1:continue # AA/pixel-boundary uncertainty is NOT used as a FAIL.
    witness={'sample':sample['label'],'panel':id,'attachmentSource':q.tolist(),'segment':segment,'t':t,
     'seatActualSourcePixelCenter':S.tolist(),'flapActualSourcePixelCenter':P.tolist(),'sourcePairDistance':float(np.linalg.norm(S-P)),
     'seatSourceEvidence':source_lookup('waistSeat',S),'flapSourceEvidence':source_lookup(id,P),
     'seatTarget':start.tolist(),'flapTarget':end.tolist(),'gapPoint':target.tolist(),
     'emptyPathFractions':[run[0][0]/32,run[-1][0]/32],
     'allExistingMaterialInverseLookup':lookup_all(target,inverses),'clearance':distances,
     'emptyDiskRadiusLowerBoundTargetPx':radius,'emptyDiskRadiusLowerBoundAt420px':radius*420/parts['figureBounds'][3]}
    row['provenGap']=witness
    if output['firstProvenGap']is None:output['firstProvenGap']=witness
   row['attachment'][id]={'curve':subcurve,'probes':details,
    'maxRootDisplacement':max(float(np.linalg.norm(d['delta']))for d in details)}
  nearback=trace['curves']['near_back_side']['points']
  row['nearRearContour']=[{'source':q,'affine':transform(ms['nearFlap'],q).tolist(),
   'rigidThighReference':rigid_thigh(q,'near',pose).tolist()}for q in nearback]
  seam=[]
  for segment,t,q in densify(design['nearFarCurve']['points']):
   N=transform(ms['nearFlap'],q);F=transform(ms['farFlap'],q)
   seam.append({'segment':segment,'t':t,'source':q.tolist(),'near':N.tolist(),'far':F.tolist(),'separation':float(np.linalg.norm(N-F)),
    'farTargetNearOccluder':source_lookup('nearFlap',transform(inverses['nearFlap'],F)),
    'nearTargetFarMaterial':source_lookup('farFlap',transform(inverses['farFlap'],N))})
  row['farNearSeam']=seam
 output.update(result='FAIL_STOP'if output['firstProvenGap']else'A_NO_ANALYTIC_IMPOSSIBILITY_PROVEN',
  reason='existing transformed material leaves an open gap at the paired upper seam'if output['firstProvenGap']else'no decisive gap witness under this conservative read-only test',BStarted=False)
output['inheritedInvariants']=read(ROOT/'build/early-v02-02/measurements.json')['invariants']
output['inputHashesUnchangedAfterRead']=all(hashlib.sha256((ROOT/p).read_bytes()).hexdigest()==h for p,h in hashes.items())
(HERE/'ANALYSIS.json').write_text(json.dumps(output,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'result':output['result'],'minimumDeterminant':minimum,'minimumLocation':minloc,'maximumHemError':maxhem,
 'firstProvenGap':output['firstProvenGap'],'inputHashesUnchangedAfterRead':output['inputHashesUnchangedAfterRead']},indent=2))
