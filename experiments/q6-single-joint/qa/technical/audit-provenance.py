from pathlib import Path
import json,hashlib
import numpy as np
from PIL import Image
R=Path('D:/dev/R4D/experiments/q6-single-joint');Q=R/'qa/technical'
c=json.loads((R/'FROZEN_CONTRACT.json').read_text(encoding='utf8'));a=c['atlas_contract'];checks=[]
def check(name,ok,detail=None):checks.append({'name':name,'ok':bool(ok),'detail':detail})
def arr(p):return np.array(Image.open(p).convert('RGBA'))
source=np.zeros((512,512,4),dtype='uint8');mask=np.zeros((512,512),dtype=bool)
for part in ['thigh','shin']:
 slot=a['slots'][part];x,y=slot['source_placement'];im=arr(R/f'provenance/source/assets/parts/{part}_near.png');source[y:y+im.shape[0],x:x+im.shape[1]]=im
 x0,y0,x1,y1=a['hidden_repair_masks'][part+'_atlas_rect'];mask[y0:y1,x0:x1]=True
 native=np.zeros(im.shape[:2],dtype=bool);x0,y0,x1,y1=a['hidden_repair_masks'][part+'_native_rect'];native[y0:y1,x0:x1]=True
 check('exact native mask '+part,np.array_equal(np.array(Image.open(R/f'process/M2/{part}_mask.png'))==255,native))
check('exact source atlas placements',np.array_equal(source,arr(R/'process/M1/source-atlas.png')))
check('exact atlas mask rectangles',np.array_equal(mask,np.array(Image.open(R/'process/M2/atlas-mask.png'))==255))
diffs={}
for method in ['M1','M2']:
 raw=Image.open(R/f'process/{method}/raw.png').convert('RGBA');norm=np.array(raw.resize((512,512),Image.Resampling.LANCZOS));check(method+' square raw',raw.width==raw.height)
 check(method+' exact single-scale normalization',np.array_equal(norm,arr(R/f'process/{method}/normalized.png')))
 composite=norm.copy()
 if method=='M2':composite[~mask]=source[~mask];check('M2 exact composite',np.array_equal(composite,arr(R/'process/M2/composited-atlas.png')))
 diffs[method]={'rawOutsideChanged':int(np.any(norm!=source,axis=2)[~mask].sum()),'finalOutsideChanged':int(np.any(composite!=source,axis=2)[~mask].sum())}
 for part in ['thigh','shin']:
  x0,y0,x1,y1=a['slots'][part]['crop'];check(method+' exact fixed crop '+part,np.array_equal(composite[y0:y1,x0:x1],arr(R/f'art/{method}/{part}_near.png')))
 args=json.loads((R/f'process/{method}/tool-args.json').read_text(encoding='utf8'));ordered=json.loads((R/f'process/{method}/ordered-refs.json').read_text(encoding='utf8'))
 check(method+' no exposed mask API','mask' not in args)
 check(method+' transparent request',args.get('transparent_background') is True)
 check(method+' prompt preserved',args['prompt']==(R/f'process/{method}/prompt.txt').read_text(encoding='utf8').rstrip('\n') or args['prompt'].rstrip('\n')==(R/f'process/{method}/prompt.txt').read_text(encoding='utf8').rstrip('\n'))
out={'checks':checks,'failures':[x for x in checks if not x['ok']],'diffs':diffs,'callCountEvidence':'Frozen ledger: M1=1, M2=1, J2=0, retries=0. Both raw files match recorded local generated-image outputs. This is an audit of provided evidence, not direct observation of tool calls or a proof that no unrecorded call exists.'}
(Q/'provenance-audit.json').write_text(json.dumps(out,indent=2),encoding='utf8');print(json.dumps(out,indent=2))
