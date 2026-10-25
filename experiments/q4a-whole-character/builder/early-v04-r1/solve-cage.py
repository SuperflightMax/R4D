"""One v04 cage solve: fixed boundary constraints + ARAP rest-shape energy.
Positive-orientation continuation/line search; no low reduction or alternate model.
Inputs are frozen CAGE_REST and full-chain target poses, written before this runs.
"""
from pathlib import Path
import json,math,hashlib
import numpy as np

HERE=Path(__file__).resolve().parent
def load(name):return json.loads((HERE/name).read_text())
rest=load('CAGE_REST.json');targets=load('CAGE_TARGETS.json')
X=np.array(rest['vertices'],dtype=float);T=np.array(rest['triangles'],dtype=int)
pins=sorted(int(k)for k in rest['constraints']);free=[i for i in range(len(X))if i not in pins]
XX=X[T];edges=np.stack((XX[:,1]-XX[:,0],XX[:,2]-XX[:,0]),axis=2)
det=np.linalg.det(edges)
assert (det>0).all(),'Rest orientation must be positive before any solve'
inv=np.linalg.inv(edges);areas=det/2
grad=np.stack((-inv.sum(axis=1),inv[:,0,:],inv[:,1,:]),axis=1)
K=np.zeros((len(X),len(X)))
for tri,w,g in zip(T,areas,grad):
 for i in range(3):
  for j in range(3):K[tri[i],tri[j]]+=w*np.dot(g[i],g[j])
Kff=K[np.ix_(free,free)];Kfb=K[np.ix_(free,pins)]
assert len(free)>0,'Cage needs actual internal degrees of freedom'
P=np.linalg.inv(Kff)
def metrics(Y):
 YY=Y[T];E=np.stack((YY[:,1]-YY[:,0],YY[:,2]-YY[:,0]),axis=2)
 F=E@inv;D=np.linalg.det(F);S=np.linalg.svd(F,compute_uv=False)
 return F,D,S
def energy(Y):
 YY=Y[T];F=np.stack((YY[:,1]-YY[:,0],YY[:,2]-YY[:,0]),axis=2)@inv
 angles=np.arctan2(F[:,1,0]-F[:,0,1],F[:,0,0]+F[:,1,1])
 c=np.cos(angles);s=np.sin(angles);R=np.stack((c,-s,s,c),axis=1).reshape(-1,2,2)
 return float(np.sum(areas[:,None,None]*(F-R)**2)),R
def global_step(Y):
 _,R=energy(Y);rhs=np.zeros_like(Y)
 contributions=np.einsum('tij,tkj->tki',R,grad)*areas[:,None,None]
 np.add.at(rhs,T.reshape(-1),contributions.reshape(-1,2))
 result=Y.copy();result[free]=P@(rhs[free]-Kfb@Y[pins]);return result
EPS=1e-4;Y=X.copy();frames=[];failure=None
for frame in targets['frames']:
 B=np.array([frame['positions'][str(i)]for i in pins])
 # One harmonic extension of the boundary increment starts each continuation step.
 delta=B-Y[pins];Y[free]+=P@(-Kfb@delta);Y[pins]=B
 F,D,S=metrics(Y)
 if D.min()<=EPS:
  failure={'frame':frame['label'],'reason':'harmonic boundary continuation has no positive initial iterate under fixed law',
   'triangle':int(D.argmin()),'minAreaRatio':float(D.min()),'low':frame['low'],
   'triangleIndices':T[int(D.argmin())].tolist(),'sourceTriangle':X[T[int(D.argmin())]].tolist(),
   'targetTriangle':Y[T[int(D.argmin())]].tolist(),'sourceSignedArea':float(areas[int(D.argmin())]),
   'boundaryTargetPositions':frame['positions'],'failedInitialVertices':Y.tolist()};break
 iterations=0;stalled=False
 for iterations in range(120):
  currentE,_=energy(Y);candidate=global_step(Y);step=1.;accepted=False
  for line in range(30):
   trial=Y+step*(candidate-Y);F,D,S=metrics(trial)
   if D.min()>EPS and energy(trial)[0]<=currentE+1e-8:
    change=float(np.linalg.norm(trial-Y));Y=trial;accepted=True;break
   step*=.5
  if not accepted:stalled=True;break
  if change<1e-5:break
 F,D,S=metrics(Y);E,_=energy(Y)
 error=float(np.max(np.linalg.norm(Y[pins]-B,axis=1)))
 frames.append({'label':frame['label'],'low':frame['low'],'vertices':Y.tolist(),
  'minAreaRatio':float(D.min()),'minAreaTriangle':int(D.argmin()),
  'maxAreaRatio':float(D.max()),'minSingularValue':float(S.min()),
  'maxSingularValue':float(S.max()),'maxCondition':float((S[:,0]/S[:,1]).max()),
  'maxBoundaryError':error,'energy':E,'iterations':iterations+1,'lineSearchStalled':stalled})
out={'method':'one constrained ARAP cage, fixed rest energy; positive-orientation continuation and line search',
 'epsilonAreaRatio':EPS,'restSha256':hashlib.sha256((HERE/'CAGE_REST.json').read_bytes()).hexdigest(),
 'targetsSha256':hashlib.sha256((HERE/'CAGE_TARGETS.json').read_bytes()).hexdigest(),
 'noAlternateAnchors':True,'dropUnchanged':230,'frames':frames,'failure':failure,
 'result':'SOLVER_FAIL_STOP'if failure else'NUMERIC_ORIENTATION_ONLY_NOT_ART_PASS'}
(HERE/'CAGE_SOLVE.json').write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps({k:v for k,v in out.items()if k!='frames'},indent=2))
if frames:print(json.dumps({'frames':len(frames),'minimumAreaRatio':min(f['minAreaRatio']for f in frames),
 'maximumCondition':max(f['maxCondition']for f in frames),'maximumBoundaryError':max(f['maxBoundaryError']for f in frames)}))
