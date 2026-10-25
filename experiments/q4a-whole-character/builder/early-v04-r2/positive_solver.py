"""R2 single fixed hypothesis, independent of actual-input loading.
Source-area ARAP + mu*(det(F)-1-log(det(F))) and positive continuation.
No harmonic extension of free vertices; no alternate topology or target.
"""
import json,math
from pathlib import Path
import numpy as np

class Stop(Exception):
 def __init__(self,reason,witness=None):
  super().__init__(reason);self.reason=reason;self.witness=witness or {}

class Cage:
 def __init__(self,rest,config,log=lambda x:None):
  self.c=config;self.log=log;self.X=np.array(rest['vertices'],dtype=float)
  self.T=np.array(rest['triangles'],dtype=int)
  self.pins=np.array(sorted(int(k)for k in rest['constraints']),dtype=int)
  self.free=np.array([i for i in range(len(self.X))if i not in set(self.pins)],dtype=int)
  self.owners=rest['constraints'];self.iterations=0;self.accepted=0;self.outputs=[]
  XX=self.X[self.T];D=np.stack((XX[:,1]-XX[:,0],XX[:,2]-XX[:,0]),axis=2)
  determinant=np.linalg.det(D)
  if not np.isfinite(determinant).all()or np.any(determinant<=0):raise Stop('INVALID_FROZEN_REST')
  self.area=determinant/2;self.inv=np.linalg.inv(D)
  self.grad=np.stack((-self.inv.sum(axis=1),self.inv[:,0,:],self.inv[:,1,:]),axis=1)
  K=np.zeros((len(self.X),len(self.X)))
  for tri,w,g in zip(self.T,self.area,self.grad):
   for i in range(3):
    for j in range(3):K[tri[i],tri[j]]+=w*np.dot(g[i],g[j])
  # Fixed rest-energy SPD preconditioner only; never used to extend moving pins.
  self.P=np.linalg.inv(2*K[np.ix_(self.free,self.free)])
  if not np.isfinite(self.P).all():raise Stop('INVALID_FIXED_PRECONDITIONER')

 def deformation(self,Y):
  YY=Y[self.T];return np.stack((YY[:,1]-YY[:,0],YY[:,2]-YY[:,0]),axis=2)@self.inv

 def metrics(self,Y):
  F=self.deformation(Y);d=np.linalg.det(F);sv=np.linalg.svd(F,compute_uv=False)
  return {'minAreaRatio':float(d.min()),'minAreaTriangle':int(d.argmin()),
   'maxAreaRatio':float(d.max()),'minSingularValue':float(sv.min()),
   'maxSingularValue':float(sv.max()),'maxCondition':float(np.max(sv[:,0]/np.maximum(sv[:,1],1e-300))),
   'maxAreaTriangle':int(d.argmax()),'maxSingularTriangle':int(np.argmax(sv[:,0])),
   'minSingularTriangle':int(np.argmin(sv[:,1])),
   'maxConditionTriangle':int(np.argmax(sv[:,0]/np.maximum(sv[:,1],1e-300)))}

 def evaluate(self,Y,mu,gradient=True):
  F=self.deformation(Y);d=np.linalg.det(F)
  if not np.isfinite(F).all()or not np.isfinite(d).all()or np.any(d<=self.c['orientationRatioStrictMin']):
   return math.inf,None,{'finite':False,'minAreaRatio':float(d.min())if np.isfinite(d).all()else None}
  angle=np.arctan2(F[:,1,0]-F[:,0,1],F[:,0,0]+F[:,1,1]);cs=np.cos(angle);sn=np.sin(angle)
  R=np.stack((cs,-sn,sn,cs),axis=1).reshape(-1,2,2)
  arap=float(np.sum(self.area[:,None,None]*(F-R)**2))
  barrier=float(np.sum(self.area*(d-1-np.log(d))))
  info={'finite':True,'arapEnergy':arap,'barrierUnweighted':barrier,'mu':mu,'objective':arap+mu*barrier,
   'minAreaRatio':float(d.min()),'maxAreaRatio':float(d.max())}
  if not gradient:return info['objective'],None,info
  # d/dF(det-1-log det) = (det-1)*F^{-T}.
  G=2*(F-R)+mu*(d-1)[:,None,None]*np.swapaxes(np.linalg.inv(F),1,2)
  contributions=np.einsum('tij,tkj->tki',G,self.grad)*self.area[:,None,None]
  full=np.zeros_like(Y);np.add.at(full,self.T.reshape(-1),contributions.reshape(-1,2))
  return info['objective'],full[self.free],info

 def precondition(self,g):return self.P@g

 def distortion_reason(self,m):
  c=self.c
  for fail,test in [
   ('ORIENTATION',m['minAreaRatio']<=c['orientationRatioStrictMin']),
   ('AREA_COLLAPSE',m['minAreaRatio']<c['acceptedMinAreaRatio']),
   ('AREA_EXPANSION',m['maxAreaRatio']>c['acceptedMaxAreaRatio']),
   ('SINGULAR_COMPRESSION',m['minSingularValue']<c['acceptedMinSingularValue']),
   ('EXCESSIVE_STRETCH',m['maxSingularValue']>c['acceptedMaxSingularValue']),
   ('CONDITION',m['maxCondition']>c['acceptedMaxCondition'])]:
   if test:return fail
  return None

 def witness(self,Y,kind,meta=None):
  m=self.metrics(Y);i=m['maxConditionTriangle']if kind=='CONDITION'else m['minAreaTriangle']
  if kind=='SINGULAR_COMPRESSION':i=m['minSingularTriangle']
  if kind=='AREA_EXPANSION':i=m['maxAreaTriangle']
  if kind=='EXCESSIVE_STRETCH':i=m['maxSingularTriangle']
  tri=self.T[i];return {'reason':kind,'metrics':m,'triangle':int(i),'indices':tri.tolist(),
   'sourceTriangle':self.X[tri].tolist(),'targetTriangle':Y[tri].tolist(),
   'sourceSignedArea':float(self.area[i]),
   'owners':[self.owners.get(str(int(k)),'free')for k in tri],
   'vertices':Y.tolist(),'meta':meta or {}}

 def minimize(self,seed,B,context):
  Y=seed.copy();Y[self.pins]=B
  if self.metrics(Y)['minAreaRatio']<=self.c['orientationRatioStrictMin']:
   return None,self.witness(Y,'SEED_NOT_POSITIVE',context)
  for mu in self.c['barrierMuSchedule']:
   memory=[];stalls=0;converged=False
   for k in range(self.c['maximumIterationsPerBarrierStage']):
    if self.iterations>=self.c['maximumTotalIterations']:raise Stop('TOTAL_ITERATION_BUDGET',self.witness(Y,'TOTAL_ITERATION_BUDGET',context))
    self.iterations+=1
    E,g,info=self.evaluate(Y,mu);pg=self.precondition(g)
    residual=float(np.max(np.linalg.norm(pg,axis=1)))
    base={**context,'mu':mu,'stageIteration':k,'totalIteration':self.iterations,
     **info,**self.metrics(Y),'preconditionedGradientMaxPx':residual,
     'pinErrorPx':float(np.max(np.linalg.norm(Y[self.pins]-B,axis=1)))}
    if residual<=self.c['preconditionedGradientTolerancePx']:
     self.log({'kind':'optimizer_converged',**base});converged=True;break
    q=g.copy();alphas=[]
    for ds,dg,rho in reversed(memory):
     alpha=rho*float(np.sum(ds*q));alphas.append(alpha);q-=alpha*dg
    z=self.precondition(q)
    for (ds,dg,rho),alpha in zip(memory,reversed(alphas)):
     z+=ds*(alpha-rho*float(np.sum(dg*z)))
    direction=-z;dot=float(np.sum(g*direction));fallback=False
    if not np.isfinite(direction).all()or dot>=0:
     direction=-pg;dot=float(np.sum(g*direction));memory=[];fallback=True
    longest=float(np.max(np.linalg.norm(direction,axis=1)))
    if not np.isfinite(longest)or longest==0:return None,self.witness(Y,'NO_DESCENT_DIRECTION',context)
    direction*=min(1.,self.c['trustMaxFreeVertexDisplacementPx']/longest)
    dot=float(np.sum(g*direction));step=1.;accepted=False;rejected=0;worst_trial_ratio=math.inf
    for line in range(self.c['maximumLineSearchTrials']):
     trial=Y.copy();trial[self.free]+=step*direction;trial[self.pins]=B
     e,_,tinfo=self.evaluate(trial,mu,False)
     if np.isfinite(e)and e<=E+self.c['armijoC1']*step*dot:
      accepted=True;break
     if tinfo.get('minAreaRatio')is not None:worst_trial_ratio=min(worst_trial_ratio,tinfo['minAreaRatio'])
     rejected+=1;step*=self.c['lineSearchShrinkFactor']
    if not accepted:
     self.log({'kind':'line_search_fail',**base,'rejectedTrials':rejected,'worstRejectedRatio':worst_trial_ratio if np.isfinite(worst_trial_ratio)else None})
     return None,self.witness(Y,'LINE_SEARCH_STALL',context)
    newE,newg,newinfo=self.evaluate(trial,mu);ds=trial[self.free]-Y[self.free];dg=newg-g;curvature=float(np.sum(ds*dg))
    if curvature>self.c['lbfgsCurvatureRelativeMin']*float(np.linalg.norm(ds)*np.linalg.norm(dg))and curvature>0:
     memory.append((ds.copy(),dg.copy(),1/curvature));memory=memory[-self.c['lbfgsMemory']:]
    relative=(E-newE)/max(1.,abs(E));stalls=stalls+1 if relative<=self.c['stallRelativeEnergyDecrease']else 0
    Y=trial
    self.log({'kind':'optimizer_iteration',**base,'acceptedObjective':newE,
     'acceptedMetrics':self.metrics(Y),'acceptedStep':step,'rejectedLineTrials':rejected,
     'worstRejectedRatio':worst_trial_ratio if np.isfinite(worst_trial_ratio)else None,
     'fallbackPreconditionedDescent':fallback,'relativeEnergyDecrease':relative,'stallCount':stalls})
    if stalls>=self.c['stallConsecutiveIterations']:
     if float(np.max(np.linalg.norm(self.precondition(newg),axis=1)))<=self.c['preconditionedGradientTolerancePx']:
      converged=True;break
     return None,self.witness(Y,'ENERGY_STALL',context)
   if not converged:return None,self.witness(Y,'STAGE_ITERATION_LIMIT',context)
   self.log({'kind':'barrier_stage_complete',**context,'mu':mu,**self.metrics(Y),
    **self.evaluate(Y,mu,False)[2]})
  m=self.metrics(Y);bad=self.distortion_reason(m)
  if bad:return None,self.witness(Y,bad,context)
  pin_error=float(np.max(np.linalg.norm(Y[self.pins]-B,axis=1)))
  if pin_error>self.c['pinTolerancePx']:return None,self.witness(Y,'PIN_ERROR',context)
  return Y,{'metrics':m,'pinErrorPx':pin_error,'energies':self.evaluate(Y,self.c['barrierMuSchedule'][-1],False)[2]}

 def run(self,frames):
  Y=self.X.copy();previousB=self.X[self.pins].copy();last_witness={};last_output=None
  self.lastAcceptedVertices=Y.copy();self.lastCompletedOutput=None;self.lastAcceptedHomotopyFraction=0.
  self.currentOutputIndex=None;self.currentOutputLabel=None
  self.log({'kind':'source_seed','metrics':self.metrics(Y),'sourcePinsExact':True})
  for index,frame in enumerate(frames):
   # Evidence fraction is local to THIS output interval, whose lambda=0 state
   # is the preceding exact output (or source rest for low0).
   self.currentOutputIndex=index;self.currentOutputLabel=frame['label']
   self.lastAcceptedHomotopyFraction=0.
   targetB=np.array([frame['positions'][str(int(i))]for i in self.pins]);originB=previousB.copy()
   progress=0.;step=self.c['homotopyInitialStep'];attempts=0;accepted_output=0
   while progress<1.:
    attempts+=1
    if attempts>self.c['maximumAttemptsPerOutput']:raise Stop('OUTPUT_ATTEMPT_LIMIT',self.witness(Y,'OUTPUT_ATTEMPT_LIMIT',{'outputIndex':index,'label':frame['label'],'homotopyFraction':progress}))
    if accepted_output>=self.c['maximumAcceptedSubstepsPerOutput']:raise Stop('OUTPUT_SUBSTEP_LIMIT',self.witness(Y,'OUTPUT_SUBSTEP_LIMIT',{'outputIndex':index,'label':frame['label'],'homotopyFraction':progress}))
    if self.accepted>=self.c['maximumAcceptedSubstepsTotal']:raise Stop('GLOBAL_SUBSTEP_LIMIT',self.witness(Y,'GLOBAL_SUBSTEP_LIMIT',{'outputIndex':index,'label':frame['label'],'homotopyFraction':progress}))
    advance=min(step,1.-progress);end=progress+advance
    B=originB+(targetB-originB)*end
    # Endpoint array is assigned verbatim, avoiding accumulated interpolation drift.
    if end>=1.:end=1.;B=targetB.copy()
    ctx={'outputIndex':index,'label':frame['label'],'low':frame['low'],
     'homotopyFrom':progress,'homotopyTo':end,'homotopyStep':advance,'attempt':attempts,
     'acceptedSubstepsForOutput':accepted_output,'acceptedSubstepsTotal':self.accepted}
    seed=Y.copy();candidate,detail=self.minimize(seed,B,ctx)
    if candidate is None:
     last_witness=detail
     self.log({'kind':'homotopy_rejected',**ctx,'reason':detail['reason'],'metrics':detail.get('metrics')})
     step=advance*self.c['homotopyRejectedShrinkFactor']
     if step<self.c['minimumHomotopyStep']:
      detail['lastAcceptedVertices']=Y.tolist();detail['lastAcceptedHomotopyFraction']=progress
      detail['lastCompletedOutput']=last_output
      raise Stop('MINIMUM_HOMOTOPY_STEP',detail)
     continue
    Y=candidate;progress=end;self.accepted+=1;accepted_output+=1
    self.lastAcceptedVertices=Y.copy();self.lastAcceptedHomotopyFraction=progress
    self.log({'kind':'homotopy_accepted',**ctx,**detail,'acceptedSubstepsTotal':self.accepted})
    step=min(1.-progress,advance*self.c['homotopyAcceptedGrowthFactor'])
   metrics=self.metrics(Y);pin_error=float(np.max(np.linalg.norm(Y[self.pins]-targetB,axis=1)))
   if pin_error>self.c['pinTolerancePx']:raise Stop('OUTPUT_PIN_ERROR',self.witness(Y,'PIN_ERROR',{'outputIndex':index}))
   row={'label':frame['label'],'low':frame['low'],'vertices':Y.tolist(),**metrics,
    'pinErrorPx':pin_error,'attempts':attempts,'acceptedSubsteps':accepted_output,
    'iterationsTotal':self.iterations,**self.evaluate(Y,self.c['barrierMuSchedule'][-1],False)[2]}
   self.outputs.append(row);last_output={'index':index,'label':frame['label'],'low':frame['low']}
   self.lastCompletedOutput=last_output
   self.log({'kind':'output_accepted',**{k:v for k,v in row.items()if k!='vertices'},'outputIndex':index})
   previousB=targetB
  return self.outputs

 def evidence_state(self):
  """Authoritative diagnostic snapshot; does not mutate numeric solver state."""
  if not hasattr(self,'lastAcceptedVertices'):return None
  return {'currentOutputIndex':self.currentOutputIndex,'currentOutputLabel':self.currentOutputLabel,
   'lastAcceptedHomotopyFraction':self.lastAcceptedHomotopyFraction,
   'fractionScope':'current output interval; zero denotes previous output/source seed',
   'lastCompletedOutput':dict(self.lastCompletedOutput)if self.lastCompletedOutput else None,
   'lastAcceptedVertices':self.lastAcceptedVertices.tolist(),
   'lastAcceptedPinPositions':self.lastAcceptedVertices[self.pins].tolist()}
