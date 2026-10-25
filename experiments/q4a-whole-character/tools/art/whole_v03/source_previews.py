"""Diagnostic composites of unchanged raw whole-v03 only; no parts/masks/rig."""
from pathlib import Path
import hashlib,json
import numpy as np
from PIL import Image

ROOT=Path(__file__).resolve().parents[3]
ART=ROOT/'art/whole-v03';p=ART/'raw/whole-v03.png';OUT=ART/'previews'
OUT.mkdir(exist_ok=True)
before=hashlib.sha256(p.read_bytes()).hexdigest()
im=Image.open(p).convert('RGBA');a=np.array(im)[:,:,3]
for name,color in [('light',(245,245,240,255)),('dark',(30,34,40,255))]:
    Image.alpha_composite(Image.new('RGBA',im.size,color),im).save(OUT/f'whole-v03-{name}.png')
yy,xx=np.indices(a.shape);tiles=((xx//40+yy//40)%2)
rgb=np.where(tiles[:,:,None]==0,np.array([225,228,230]),np.array([171,177,181])).astype('uint8')
checker=Image.fromarray(rgb,'RGB').convert('RGBA')
Image.alpha_composite(checker,im).save(OUT/'whole-v03-checker.png')
metrics={'rawSize':list(im.size),'rawMode':im.mode,'rawSHA256':before,
         'alphaExtrema':[int(a.min()),int(a.max())],
         'alphaBounds':{str(t):Image.fromarray((a>=t).astype('uint8')*255).getbbox() for t in [1,16,128,240,254]},
         'pixelCounts':{'alpha0':int((a==0).sum()),'alpha1to15':int(((a>=1)&(a<16)).sum()),'alpha16to239':int(((a>=16)&(a<240)).sum()),'alpha240plus':int((a>=240).sum())},
         'note':'Only unmodified whole diagnostic composites. No semantic masks/crops/parts, retouch, rig or source correction.'}
# Read-only windows distinguish the visible shoe levels; not exported parts or
# semantic segmentation. Bounds are expressed back on the full source canvas.
metrics['soleWindowDiagnostics']={}
for name,box in [('leftShoeWindow',(275,1300,555,1490)),('rightShoeWindow',(575,1300,870,1490))]:
    x0,y0,x1,y1=box;v=a[y0:y1,x0:x1]>=128
    ys,xs=np.where(v)
    metrics['soleWindowDiagnostics'][name]={'window':list(box),'lowestAlpha128Y':int(y0+ys.max()) if len(ys) else None}
(ART/'raw/whole-v03-diagnostics.json').write_text(json.dumps(metrics,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
assert hashlib.sha256(p.read_bytes()).hexdigest()==before
print(json.dumps(metrics,ensure_ascii=False))
