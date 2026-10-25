"""Unmodified correction02 raw: diagnostics only, no masks/parts/rig."""
from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[3];ART=ROOT/'art/whole-v03'
p=ART/'raw/whole-v03-correction02.png';OUT=ART/'previews';OUT.mkdir(exist_ok=True)
before=hashlib.sha256(p.read_bytes()).hexdigest();im=Image.open(p).convert('RGBA');a=np.array(im)[:,:,3]
for name,color in [('light',(245,245,240,255)),('dark',(30,34,40,255))]:
 Image.alpha_composite(Image.new('RGBA',im.size,color),im).save(OUT/f'whole-v03-correction02-{name}.png')
yy,xx=np.indices(a.shape);tiles=(xx//40+yy//40)%2
rgb=np.where(tiles[:,:,None]==0,np.array([225,228,230]),np.array([171,177,181])).astype('uint8')
Image.alpha_composite(Image.fromarray(rgb,'RGB').convert('RGBA'),im).save(OUT/'whole-v03-correction02-checker.png')
metrics={'rawSize':list(im.size),'rawMode':im.mode,'rawSHA256':before,
 'alphaExtrema':[int(a.min()),int(a.max())],
 'alphaBounds':{str(t):Image.fromarray((a>=t).astype('uint8')*255).getbbox() for t in [1,16,128,240,250,254]},
 'pixelCounts':{'alpha0':int((a==0).sum()),'alpha1to15':int(((a>0)&(a<16)).sum()),'alpha16to239':int(((a>=16)&(a<240)).sum()),'alpha240plus':int((a>=240).sum())},
 'soleWindowDiagnostics':{},'scope':'Read-only alpha/whole composites; no semantic masks/crops/parts.'}
for name,box in [('leftShoeWindow',(200,1250,495,1470)),('rightShoeWindow',(600,1250,900,1470))]:
 x0,y0,x1,y1=box;row={'window':list(box)}
 for threshold in [128,250]:
  ys,xs=np.where(a[y0:y1,x0:x1]>=threshold)
  row[f'lowestAlpha{threshold}Y']=int(y0+ys.max()) if len(ys) else None
 metrics['soleWindowDiagnostics'][name]=row
(ART/'raw/whole-v03-correction02-diagnostics.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert hashlib.sha256(p.read_bytes()).hexdigest()==before
print(json.dumps(metrics,ensure_ascii=False))
