"""Whole-v04 read-only composites and alpha diagnostics; no parts/masks/rig."""
from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image
ROOT=Path(__file__).resolve().parents[3]
ART=ROOT/'art/whole-v04';p=ART/'raw/whole-v04.png'
OUT=ART/'previews';OUT.mkdir(exist_ok=True)
sha=hashlib.sha256(p.read_bytes()).hexdigest()
im=Image.open(p).convert('RGBA');a=np.array(im)[:,:,3]
for name,color in [('light',(245,245,240,255)),('dark',(30,34,40,255))]:
 Image.alpha_composite(Image.new('RGBA',im.size,color),im).save(OUT/f'whole-v04-{name}.png')
yy,xx=np.indices(a.shape)
rgb=np.where(((xx//40+yy//40)%2)[:,:,None]==0,[225,228,230],[171,177,181]).astype('uint8')
Image.alpha_composite(Image.fromarray(rgb,'RGB').convert('RGBA'),im).save(OUT/'whole-v04-checker.png')
m={'rawSize':list(im.size),'rawMode':im.mode,'rawSHA256':sha,'alphaExtrema':[int(a.min()),int(a.max())],
 'pixelCounts':{'alpha0':int((a==0).sum()),'alpha1to15':int(((a>0)&(a<16)).sum()),'alpha16to239':int(((a>=16)&(a<240)).sum()),'alpha240plus':int((a>=240).sum())},
 'soleWindowDiagnostics':{},'scope':'Whole alpha/composites only; Builder owns definitive gap/sole gate.'}
for name,box in [('screenLeft',(150,1250,500,1500)),('screenRight',(590,1250,960,1500))]:
 x0,y0,x1,y1=box;row={'window':list(box)}
 for t in [128,250]:
  ys,xs=np.where(a[y0:y1,x0:x1]>=t)
  row[f'lowestAlpha{t}Y']=int(y0+ys.max()) if len(ys) else None
 m['soleWindowDiagnostics'][name]=row
(ART/'raw/whole-v04-diagnostics.json').write_text(json.dumps(m,indent=2)+'\n',encoding='utf-8')
assert hashlib.sha256(p.read_bytes()).hexdigest()==sha
print(json.dumps(m))
