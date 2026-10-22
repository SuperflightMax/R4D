"""Technical extraction only: generated pixels, crop/alpha cleanup/rotate/scale.
No character pixels are painted or synthesized by this script.
Run from D:/dev/R4D: python experiments/gpt-6.1-sol/assets/prepare_assets.py
"""
from pathlib import Path
from collections import deque
from PIL import Image
import math
import json

BASE = Path(__file__).resolve().parent
src = Image.open(BASE / 'source/atlas-v1.png').convert('RGBA')
# id, crop, source pivot, source next joint (normalizes hanging limbs), parent,
# joint relative to parent pivot, drawing layer. Positions chosen visually.
specs = [
 ('pelvis',(675,90,930,305),(805,175),None,None,(0,0),48),
 ('torso',(400,10,655,309),(537,279),None,'pelvis',(0,-28),50),
 ('head',(25,8,350,306),(204,276),None,'torso',(-9,-137),60),
 ('upperArmNear',(116,310,261,590),(194,357),(187,540),'torso',(-39,-126),70),
 ('forearmNear',(410,309,580,618),(450,348),(493,477),'upperArmNear',(0,102.48),71),
 ('upperArmFar',(694,310,863,590),(770,357),(800,546),'torso',(-5,-126),10),
 ('forearmFar',(995,313,1160,641),(1045,357),(1083,493),'upperArmFar',(0,107.16),11),
 ('thighNear',(112,596,281,905),(198,641),(207,838),'pelvis',(-21,29),45),
 ('shinNear',(427,614,579,899),(504,658),(508,849),'thighNear',(0,110.43),44),
 ('footNear',(681,690,935,910),(753,749),None,'shinNear',(0,106.98),43),
 ('thighFar',(109,907,279,1218),(198,945),(208,1144),'pelvis',(16,27),20),
 ('shinFar',(426,908,578,1206),(504,945),(507,1146),'thighFar',(0,111.58),19),
 ('footFar',(686,991,943,1221),(757,1045),None,'shinFar',(0,112.57),18),
]

def extract(rect):
    im=src.crop(rect)
    a=im.getchannel('A')
    # Remove near-transparent generation dust; retain the main alpha component.
    mask=a.point(lambda v:255 if v>16 else 0)
    pix=mask.load(); w,h=im.size; seen=set(); largest=[]
    for y in range(h):
        for x in range(w):
            if not pix[x,y] or (x,y) in seen: continue
            todo=deque([(x,y)]); seen.add((x,y)); component=[]
            while todo:
                p=todo.popleft(); component.append(p)
                for q in [(p[0]-1,p[1]),(p[0]+1,p[1]),(p[0],p[1]-1),(p[0],p[1]+1)]:
                    if 0<=q[0]<w and 0<=q[1]<h and q not in seen and pix[q]:
                        seen.add(q); todo.append(q)
            if len(component)>len(largest): largest=component
    keep=Image.new('L',im.size); kp=keep.load(); ap=a.load()
    for x,y in largest: kp[x,y]=ap[x,y]
    im.putalpha(keep)
    return im

parts=[]
for name,rect,pivot,end,parent,joint,layer in specs:
    im=extract(rect)
    p=(pivot[0]-rect[0],pivot[1]-rect[1])
    # Put pivot at canvas center before rotation; enough room for every sprite.
    pad=Image.new('RGBA',(1024,1024)); origin=(512-p[0],512-p[1])
    pad.alpha_composite(im,origin)
    angle=0
    length=None
    if end:
        dx,dy=end[0]-pivot[0],end[1]-pivot[1]
        angle=-math.degrees(math.atan2(dx,dy))
        length=math.hypot(dx,dy)*.56
        pad=pad.rotate(angle,resample=Image.Resampling.BICUBIC,center=(512,512))
    box=pad.getbbox()
    pad=pad.crop((box[0]-4,box[1]-4,box[2]+4,box[3]+4))
    outsize=(round(pad.width*.56),round(pad.height*.56))
    out=pad.resize(outsize,Image.Resampling.LANCZOS)
    pv=[round((512-box[0]+4)*out.width/pad.width,3),round((512-box[1]+4)*out.height/pad.height,3)]
    out.save(BASE/f'parts/{name}.png')
    part={'id':name,'file':f'parts/{name}.png','parent':parent,'pivot':pv,'joint':list(joint),'layer':layer,'size':list(out.size),'sourceCrop':list(rect),'sourcePivot':list(pivot),'technicalRotationDeg':round(angle,4),'scale':.56}
    if length: part['boneLength']=round(length,3)
    parts.append(part)

manifest={'version':1,'character':'Рыжая курьерша','facing':'right','coordinates':'+X right, +Y down; neutral limb angle 0 points down; joints are relative to parent pivot','canvas':{'width':600,'height':720},'root':{'x':290,'y':310},'bindHeight':650,'parts':parts,'source':'source/atlas-v1.png','sourceReference':'source/character-v1.png'}
(BASE/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
# Deterministic reference assembly, not used as a runtime sprite.
assembly=Image.new('RGBA',(600,720)); positions={}
for p in parts:
    par=positions.get(p['parent'],(290,310))
    positions[p['id']]=(par[0]+p['joint'][0],par[1]+p['joint'][1])
for p in sorted(parts,key=lambda p:p['layer']):
    im=Image.open(BASE/p['file']); pos=positions[p['id']]
    assembly.alpha_composite(im,(round(pos[0]-p['pivot'][0]),round(pos[1]-p['pivot'][1])))
assembly.save(BASE/'bind-assembly.png')
print(json.dumps({'parts':len(parts),'size':assembly.size,'files':[p['file'] for p in parts]},ensure_ascii=False))
