"""Normalize the locally generated pelvis replacement; no painted pixels."""
from PIL import Image
from pathlib import Path
import json
BASE=Path(__file__).resolve().parent
im=Image.open(BASE/'repair-source/pelvis-generated-v1.png').convert('RGBA')
alpha=im.getchannel('A').point(lambda a:0 if a<24 else a)
im.putalpha(alpha)
box=alpha.getbbox()
crop=im.crop(box)
# Preserve the runtime canvas and existing physical attachment point.
# This normalizes generator composition; torso/legs and skeleton are unchanged.
part=Image.new('RGBA',(132,116))
part.alpha_composite(crop.resize((128,112),Image.Resampling.LANCZOS),(2,2))
part.save(BASE/'parts/pelvis-repair-v1.png')
m=json.loads((BASE/'manifest.json').read_text(encoding='utf-8'))
p=next(p for p in m['parts'] if p['id']=='pelvis')
p['file']='parts/pelvis-repair-v1.png'
p['q1Repair']={'generatedSource':'repair-source/pelvis-generated-v1.png','crop':list(box),'normalizedContent':[128,112],'canvas':[132,116],'origin':[2,2],'oldFile':'parts/pelvis.png','geometryUnchanged':True}
(BASE/'manifest.json').write_text(json.dumps(m,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(p['q1Repair'])
