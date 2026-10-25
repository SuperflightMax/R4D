"""Read-only audit of actual foot alpha and cloth mesh source coverage."""
import json
import math
from pathlib import Path
import numpy as np
from PIL import Image

here=Path(__file__).resolve().parent
root=here.parents[1]
saved=root/'build/early-v02-02'
base=saved if (saved/'AFTER.json').exists() else root
data=json.loads((base/'art/parts.json').read_text(encoding='utf-8'))
report=json.loads((here/'measurements.json').read_text(encoding='utf-8'))
scale=420/data['figureBounds'][3]
output={'sourcePixelsToDisplayPixels':scale,'solverThreshold':report['alphaThreshold'],'input':'immutable' if base==saved else 'working','poses':{}}
for row in report['after']:
    pose=row['state']['pose']
    feet={}
    for side in ['near','far']:
        part=next(p for p in data['parts'] if p['id']==side+'Foot')
        alpha=np.asarray(Image.open(base/'art'/part['file']).convert('RGBA'))[:,:,3]
        a,b=data['jointPoints'][part['from']],data['jointPoints'][part['to']]
        A,B=pose[part['from']],pose[part['to']]
        angle=math.atan2(B['y']-A['y'],B['x']-A['x'])-math.atan2(b[1]-a[1],b[0]-a[0])
        thresholds={}
        for threshold in [1,16,128]:
            yy,xx=np.where(alpha>=threshold)
            x=xx+part['cropRect'][0]-a[0]
            y=yy+part['cropRect'][1]-a[1]
            # Same conservative pixel-cell footprint as runtime.
            maximum=float((A['y']+x*math.sin(angle)+y*math.cos(angle)).max()) + .5*(abs(math.sin(angle))+abs(math.cos(angle)))
            gap=data['groundY']-maximum
            thresholds[str(threshold)]={'maxContourY':maximum,'groundGapSourcePx':gap,'penetrationDisplayPx':max(0,-gap)*scale,'gapDisplayPx':max(0,gap)*scale}
        feet[side]=thresholds
    output['poses'][row['label']]=feet
max_penetration=max(v['penetrationDisplayPx'] for feet in output['poses'].values() for thresholds in feet.values() for v in thresholds.values())
output['maxPenetrationDisplayPxAllThresholds']=max_penetration
(here/'pixel-support.json').write_text(json.dumps(output,indent=2)+'\n',encoding='utf-8')
print(json.dumps({'thresholds':[1,16,128],'scale':scale,'maxPenetrationDisplayPxAllThresholds':max_penetration,'neutral':output['poses']['neutral']},indent=2))
