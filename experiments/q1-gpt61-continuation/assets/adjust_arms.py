"""Q1: geometric correction of existing generated arm sprites, no painting.
Run from D:/dev/R4D. Baseline is read-only; output belongs to Q1.
"""
from pathlib import Path
from PIL import Image
import json

BASE=Path(__file__).resolve().parent
OLD=BASE.parents[1]/'gpt-6.1-sol/assets'
m=json.loads((OLD/'manifest.json').read_text(encoding='utf-8'))
factor=.78
changes=[]
for p in m['parts']:
    if p['id'].startswith(('upperArm','forearm')):
        previous={k:p[k] for k in ['pivot','joint','size','boneLength'] if k in p}
        image=Image.open(OLD/p['file']).convert('RGBA')
        size=tuple(round(v*factor) for v in image.size)
        image.resize(size,Image.Resampling.LANCZOS).save(BASE/p['file'])
        sx,sy=size[0]/image.width,size[1]/image.height
        upper=p['id'].startswith('upperArm')
        # Shoulder origin is the physical center of the rounded sleeve cap.
        # Elbow is near center of rolled cuff, not at the edge of the PNG.
        source_pivot=[p['pivot'][0],38] if upper else p['pivot']
        p['pivot']=[round(source_pivot[0]*sx,3),round(source_pivot[1]*sy,3)]
        if upper:
            p['joint']=[-43 if p['id'].endswith('Near') else -33,-75]
            p['boneLength']=round((130-38)*sy,3)
        else:
            p['joint']=[0,round(92*(117/150 if p['id'].endswith('Near') else 119/152),3)]
            p['boneLength']=round(p['boneLength']*factor,3)
        p['size']=list(size)
        p['q1GeometricCorrection']={'scale':factor,'sourcePivot':source_pivot,'baseline':previous}
        changes.append({'id':p['id'],'before':previous,'after':{k:p[k] for k in previous}})
m['q1']={'baseline':'experiments/gpt-6.1-sol/assets','change':'physical shoulder pivot and uniform arm scale; legs unchanged'}
(BASE/'manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(changes,indent=2))

def bind_preview(manifest,folder):
    out=Image.new('RGBA',(600,720)); positions={}
    for p in manifest['parts']:
        par=positions.get(p['parent'],(290,310))
        positions[p['id']]=(par[0]+p['joint'][0],par[1]+p['joint'][1])
    for p in sorted(manifest['parts'],key=lambda p:p['layer']):
        im=Image.open(folder/p['file']); pos=positions[p['id']]
        out.alpha_composite(im,(round(pos[0]-p['pivot'][0]),round(pos[1]-p['pivot'][1])))
    return out
before=json.loads((OLD/'manifest.json').read_text(encoding='utf-8'))
compare=Image.new('RGBA',(1200,720),(213,223,209,255))
compare.alpha_composite(bind_preview(before,OLD),(0,0))
compare.alpha_composite(bind_preview(m,BASE),(600,0))
compare.save(BASE/'shoulder-bind-before-after.png')
