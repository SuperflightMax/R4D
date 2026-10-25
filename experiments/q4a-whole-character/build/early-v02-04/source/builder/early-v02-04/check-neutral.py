"""Read-only exact source-neutral RGBA audit of the three actual panels."""
from pathlib import Path
from PIL import Image
import numpy as np
import json,hashlib
here=Path(__file__).resolve().parent;root=here.parents[1]
data=json.loads((root/'art/parts.json').read_text())
ref=np.array(Image.open(root/'art/early-v02-04/previews/garment-reference.png').convert('RGBA'))
height,width=ref.shape[:2]
def compose(field):
 canvas=Image.new('RGBA',(width,height))
 for id in ['farFlap','nearFlap','waistSeat']:
  p=next(p for p in data['parts']if p['id']==id)
  panel=Image.open(root/'art'/p[field]).convert('RGBA')
  canvas.alpha_composite(panel,tuple(p['cropRect'][:2]))
 return np.array(canvas)
def compare(actual):
 diff=np.abs(actual.astype(np.int16)-ref.astype(np.int16));mask=np.any(diff!=0,axis=2)
 ys,xs=np.where(mask)
 return{'differentPixels':int(mask.sum()),'maxChannelDifference':diff.max(axis=(0,1)).tolist(),
  'first':None if not len(xs) else {'xy':[int(xs[0]),int(ys[0])],'expected':ref[ys[0],xs[0]].tolist(),'actual':actual[ys[0],xs[0]].tolist()}}
owners=np.zeros((height,width),dtype=np.uint8)
for id in ['farFlap','nearFlap','waistSeat']:
 p=next(p for p in data['parts']if p['id']==id);a=np.array(Image.open(root/'art'/p['visibleFile']).convert('RGBA'))[:,:,3]
 x,y,w,h=p['cropRect'];owners[y:y+h,x:x+w]+=(a>0).astype(np.uint8)
semantic=ref[:,:,3]>0
result={'scope':'identity source-neutral, exact RGBA; ordinary source-over in agreed far/near/seat order',
 'visibleOwnership':{'referenceCells':int(semantic.sum()),'unassigned':int(np.sum(semantic&(owners==0))),
  'duplicateVisibleOwner':int(np.sum(semantic&(owners>1))),'extraVisibleOutsideReference':int(np.sum((~semantic)&(owners>0)))},
 'referenceShape':[width,height],'referenceSha256':hashlib.sha256((root/'art/early-v02-04/previews/garment-reference.png').read_bytes()).hexdigest(),
 'visibleOnly':compare(compose('visibleFile')),'withActualHidden':compare(compose('file'))}
(here/'NEUTRAL_RGBA.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
