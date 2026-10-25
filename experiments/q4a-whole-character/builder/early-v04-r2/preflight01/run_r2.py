"""Entry point. --synthetic never loads R1 numeric inputs.
--actual requires a later Lead authorization bound to the published hashes,
and an exclusive one-run sentinel. No automatic retries, including code bugs.
"""
import os
os.environ['OPENBLAS_NUM_THREADS']='1'
os.environ['OMP_NUM_THREADS']='1'
import argparse,json,hashlib,sys,time,platform
sys.dont_write_bytecode=True
from pathlib import Path
import numpy as np
from positive_solver import Cage,Stop

HERE=Path(__file__).resolve().parent
QROOT=HERE.parents[1]
sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
def read(p):return json.loads(p.read_text(encoding='utf-8'))
def write(p,value):p.write_text(json.dumps(value,indent=2,allow_nan=False)+'\n',encoding='utf-8')

def synthetic():
 config=read(HERE/'CONFIG.json');out=HERE/'synthetic';out.mkdir(exist_ok=True)
 vertices=[[x*2.5,y*2.5]for y in range(5)for x in range(5)];triangles=[];constraints={}
 for y in range(4):
  for x in range(4):
   i=y*5+x;triangles.extend([[i,i+1,i+6],[i,i+6,i+5]])
 for i,(x,y)in enumerate(vertices):
  if x in[0,10]or y in[0,10]:constraints[str(i)]='synthetic_boundary'
 rest={'vertices':vertices,'triangles':triangles,'constraints':constraints};events=[];model=Cage(rest,config,events.append)
 X=model.X;tests={};E,g,info=model.evaluate(X,.1);tests['identityEnergy']=E;tests['identityGradientMax']=float(abs(g).max())
 angle=.27;R=np.array([[np.cos(angle),-np.sin(angle)],[np.sin(angle),np.cos(angle)]]);rigid=X@R.T+np.array([1.,-2.])
 tests['rigidMotionEnergy']=model.evaluate(rigid,.1)[0]
 Y=X.copy();Y[12]+=[.13,-.09];Y[7]+=[-.05,.07];E,g,_=model.evaluate(Y,.1);diff=[]
 for vertex,axis in[(12,0),(12,1),(7,0),(7,1),(18,0)]:
  plus=Y.copy();minus=Y.copy();plus[vertex,axis]+=1e-5;minus[vertex,axis]-=1e-5
  finite=(model.evaluate(plus,.1,False)[0]-model.evaluate(minus,.1,False)[0])/2e-5
  analytic=float(g[list(model.free).index(vertex),axis]);diff.append({'vertex':vertex,'axis':axis,'analytic':analytic,'finiteDifference':finite,'absoluteError':abs(analytic-finite)})
 tests['gradientChecks']=diff
 F=model.deformation(Y);U,_,V=np.linalg.svd(F);polar=U@V
 direct=float(np.sum(model.area[:,None,None]*(F-polar)**2))
 tests['arapDefinitionAgreementError']=abs(model.evaluate(Y,0,False)[0]-direct)
 flipped=X.copy();flipped[12]=[20,20];tests['nonpositiveTrialRejected']=not np.isfinite(model.evaluate(flipped,.1,False)[0])
 frames=[]
 for i,(angle,t)in enumerate([(0,[.4,-.2]),(.2,[.5,.5]),(.35,[1.,2.]),(np.pi/2,[10.,0.])]):
  R=np.array([[np.cos(angle),-np.sin(angle)],[np.sin(angle),np.cos(angle)]]);target=X@R.T+np.array(t)
  frames.append({'label':f'synthetic-{i}','low':i/3,'positions':{str(k):target[int(k)].tolist()for k in constraints}})
 stopped=None
 try:model.run(frames)
 except Stop as e:stopped={'reason':e.reason,'witness':e.witness}
 tests['syntheticContinuationStop']=stopped;tests['outputsCompleted']=len(model.outputs)
 tests['allPinsExact']=all(f['pinErrorPx']<=config['pinTolerancePx']for f in model.outputs)
 tests['allAcceptedOutputsWithinDistortionGate']=all(model.distortion_reason(f)is None for f in model.outputs)
 tests['adaptiveHomotopyExercised']=any(e['kind']=='homotopy_rejected'for e in events)
 fail_events=[];fail_model=Cage(rest,config,fail_events.append)
 reflected=X.copy();reflected[:,0]=10-reflected[:,0]
 impossible=[{'label':'synthetic-reflected-boundary','low':1.,'positions':{str(k):reflected[int(k)].tolist()for k in constraints}}]
 try:
  fail_model.run(impossible);tests['syntheticImpossibleBoundaryStopped']=False
 except Stop as failure:
  tests['syntheticImpossibleBoundaryStopped']=True
  tests['syntheticExpectedFailure']={'termination':failure.reason,'candidateReason':failure.witness.get('reason'),
   'iterations':fail_model.iterations,'acceptedSubsteps':fail_model.accepted}
 tests['noActualInputsLoaded']=True
 tests['pass']=tests['identityEnergy']<1e-12 and tests['identityGradientMax']<1e-10 and tests['rigidMotionEnergy']<1e-10 and max(v['absoluteError']for v in diff)<1e-6 and tests['arapDefinitionAgreementError']<1e-12 and tests['nonpositiveTrialRejected']and stopped is None and len(model.outputs)==4 and tests['allPinsExact']and tests['allAcceptedOutputsWithinDistortionGate']and tests['adaptiveHomotopyExercised']and tests['syntheticImpossibleBoundaryStopped']
 write(out/'SYNTHETIC_CHECK.json',tests);write(out/'SYNTHETIC_OUTPUTS.json',model.outputs)
 with(out/'SYNTHETIC_JOURNAL.jsonl').open('w',encoding='utf-8')as f:
  for event in events:f.write(json.dumps(event,allow_nan=False)+'\n')
 with(out/'SYNTHETIC_EXPECTED_FAIL_JOURNAL.jsonl').open('w',encoding='utf-8')as f:
  for event in fail_events:f.write(json.dumps(event,allow_nan=False)+'\n')
 print(json.dumps(tests,indent=2));return 0 if tests['pass']else 1

def actual():
 # This file must not exist until an explicit later start from Lead.
 auth_path=HERE/'AUTHORIZED_START.json'
 if not auth_path.exists():raise SystemExit('ACTUAL DISABLED: no separate Lead start authorization.')
 auth=read(auth_path);manifest_path=HERE/'R2_HASHES.json';manifest=read(manifest_path)
 if auth.get('startFromLead')is not True or auth.get('approvedManifestSha256')!=sha(manifest_path):raise SystemExit('Start does not match published manifest.')
 for name,value in manifest['sha256'].items():
  if sha(QROOT/name)!=value:raise SystemExit(f'INPUT/CODE MISMATCH BEFORE RUN: {name}')
 sentinel=HERE/'ACTUAL_RUN_STARTED.json'
 with sentinel.open('x',encoding='utf-8')as f:json.dump({'manifestSHA256':sha(manifest_path),'authorization':auth,'repeatForbidden':True},f,indent=2)
 config=read(HERE/'CONFIG.json');r1=HERE.parent/'early-v04-r1';rest=read(r1/'CAGE_REST.json');targets=read(r1/'CAGE_TARGETS.json')
 if len(targets['frames'])!=241 or targets['drop']!=230 or targets['back']!=-110:raise SystemExit('Frozen target contract mismatch; run consumed, audit required.')
 log_path=HERE/'R2_JOURNAL.jsonl';start=time.monotonic();model=None;failure=None;exception=None
 with log_path.open('w',encoding='utf-8')as stream:
  def log(event):stream.write(json.dumps(event,allow_nan=False)+'\n');stream.flush()
  log({'kind':'run_start','manifestSHA256':sha(manifest_path),'python':platform.python_version(),'numpy':np.__version__,'threadLimit':1})
  try:
   model=Cage(rest,config,log);model.run(targets['frames'])
  except Stop as e:
   if model is not None and hasattr(model,'lastAcceptedVertices'):
    e.witness.setdefault('lastAcceptedVertices',model.lastAcceptedVertices.tolist())
    e.witness.setdefault('lastAcceptedPinPositions',model.lastAcceptedVertices[model.pins].tolist())
    e.witness.setdefault('lastCompletedOutput',model.lastCompletedOutput)
    e.witness.setdefault('lastAcceptedHomotopyFraction',model.lastAcceptedHomotopyFraction)
   failure={'termination':e.reason,'witness':e.witness}
   log({'kind':'run_stop','termination':e.reason,'witnessWithoutVertices':{k:v for k,v in e.witness.items()if k not in['vertices','lastAcceptedVertices']}})
  except BaseException as e:
   exception={'type':type(e).__name__,'message':str(e),'policy':'NO RETRY: implementation audit and direct CTO decision required'}
   log({'kind':'implementation_exception',**exception})
 rows=model.outputs if model else[]
 passed=failure is None and exception is None and len(rows)==241
 result={'result':'R2_NUMERIC_PASS_ONLY_NOT_ART'if passed else'R2_FAIL_STOP',
  'manifestSHA256':sha(manifest_path),'actualRuns':1,'elapsedSeconds':time.monotonic()-start,
  'outputsCompleted':len(rows),'requiredOutputs':241,'fullDrop230Reached':passed,
  'acceptedHomotopySubsteps':model.accepted if model else 0,'iterations':model.iterations if model else 0,
  'failure':failure,'implementationException':exception,'outputs':rows,
  'afterOrRepairStarted':False,'retuningOrRetryPermitted':False}
 write(HERE/'R2_RESULT.json',result)
 if failure:write(HERE/'R2_FAILURE.json',failure)
 unchanged=all(sha(QROOT/name)==v for name,v in manifest['sha256'].items());write(HERE/'POST_RUN_HASH_CHECK.json',{'allPublishedInputsUnchanged':unchanged,'manifestSHA256':sha(manifest_path)})
 print(json.dumps({k:v for k,v in result.items()if k not in['outputs','failure']},indent=2));return 0 if passed and unchanged else 1

if __name__=='__main__':
 parser=argparse.ArgumentParser();parser.add_argument('--synthetic',action='store_true');parser.add_argument('--actual',action='store_true');args=parser.parse_args()
 if args.synthetic and not args.actual:sys.exit(synthetic())
 if args.actual and not args.synthetic:sys.exit(actual())
 parser.error('Choose --synthetic OR --actual. Actual requires separate published-contract start.')
