"""Technical extraction of generated Q2 pixels; no drawing or inpainting.
Run from checkout: python experiments/q2-simple-character/assets/prepare_parts.py
Crop/pivot/component approach follows baseline 6.1 prepare_assets.py.
"""
from pathlib import Path
from collections import deque
from PIL import Image
import numpy as np
import json

BASE = Path(__file__).resolve().parent
OUT = BASE.parent / 'public/art'
SCALE = .56
SOURCE = BASE / 'source/caretaker-parts-v1.png'
# id, crop, physical source pivot, distal source axis, parent, joint, layer,
# optional technical vertical normalization for unequal generated paired limbs.
SPECS = [
 ('torso',(530,15,830,441),(670,355),None,None,(0,0),50,1),
 ('head',(65,15,480,440),(259,390),None,'torso',(6,-177),60,1),
 ('upperArmNear',(920,55,1105,380),(1010,107),(1008,323),'torso',(-34,-136),70,1),
 ('forearmNear',(1195,55,1390,435),(1275,110),(1305,336),'upperArmNear',(-1.12,120.96),71,1),
 ('upperArmFar',(110,450,285,760),(200,500),(199,707),'torso',(7,-136),10,216/207),
 ('forearmFar',(450,455,655,790),(540,502),(574,710),'upperArmFar',(-.56,120.96),11,226/208),
 ('thighNear',(830,450,1040,780),(945,496),(945,724),None,(-15,25),40,1),
 ('shinNear',(1190,450,1370,765),(1280,495),(1280,715),'thighNear',(0,127.68),39,1),
 ('footNear',(85,835,375,1060),(166,935),None,'shinNear',(0,123.2),38,1),
 ('thighFar',(475,790,680,1074),(581,833),(581,1022),None,(15,25),20,228/189),
 ('shinFar',(850,790,1010,1074),(930,830),(930,1020),'thighFar',(0,127.68),19,220/190),
 ('footFar',(1150,846,1428,1064),(1235,935),None,'shinFar',(0,123.2),18,1),
]

def largest_component(im):
    data=np.asarray(im).copy()
    mask=data[:,:,3]>=32
    visited=np.zeros(mask.shape,dtype=bool)
    best=[]
    for y,x in zip(*np.where(mask)):
        if visited[y,x]: continue
        visited[y,x]=True
        queue=deque([(int(x),int(y))]); component=[]
        while queue:
            xx,yy=queue.popleft(); component.append((xx,yy))
            for nx,ny in ((xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)):
                if 0<=nx<im.width and 0<=ny<im.height and mask[ny,nx] and not visited[ny,nx]:
                    visited[ny,nx]=True; queue.append((nx,ny))
        if len(component)>len(best): best=component
    keep=np.zeros(mask.shape,dtype=bool)
    for x,y in best: keep[y,x]=True
    data[~keep]=0
    return Image.fromarray(data)

def main():
    OUT.joinpath('parts').mkdir(parents=True,exist_ok=True)
    atlas=Image.open(SOURCE).convert('RGBA')
    parts=[]
    for name,rect,pv,distal,parent,joint,layer,vertical in SPECS:
        im=largest_component(atlas.crop(rect))
        # Later localized torso replacement uses its own source coordinates.
        override=BASE / 'source/torso-override.json'
        if name=='torso' and override.exists():
            replacement=json.loads(override.read_text(encoding='utf-8'))
            atlas2=Image.open(BASE/replacement['file']).convert('RGBA')
            rect=tuple(replacement['crop']); pv=tuple(replacement['pivot'])
            im=largest_component(atlas2.crop(rect))
            sx,sy=replacement['scale']
            source=str(replacement['file'])
        else:
            sx,sy=SCALE,SCALE*vertical
            source='source/caretaker-parts-v1.png'
        box=im.getbbox()
        if not box: raise RuntimeError(f'No alpha pixels: {name}')
        box=(max(0,box[0]-3),max(0,box[1]-3),min(im.width,box[2]+3),min(im.height,box[3]+3))
        im=im.crop(box)
        w,h=max(1,round(im.width*sx)),max(1,round(im.height*sy))
        sx,sy=w/im.width,h/im.height
        im=im.resize((w,h),Image.Resampling.LANCZOS)
        pivot=[round((pv[0]-rect[0]-box[0])*sx,3),round((pv[1]-rect[1]-box[1])*sy,3)]
        im.save(OUT/f'parts/{name}.png')
        part=dict(id=name,file=f'art/parts/{name}.png',parent=parent,joint=list(joint),pivot=pivot,layer=layer,size=[w,h],source=source,sourceCrop=list(rect),sourcePivot=list(pv),technicalScale=[round(sx,6),round(sy,6)])
        if distal:
            part['distalJoint']=[round((distal[0]-pv[0])*sx,3),round((distal[1]-pv[1])*sy,3)]
        parts.append(part)
    manifest=dict(version=1,character='Лесной смотритель',facing='right',coordinates='+X right, +Y down; joint relative to parent pivot; null parent is fixed hip root',targetDisplayHeight=360,parts=parts)
    (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    positions={}
    def position(p):
        if p['id'] in positions: return positions[p['id']]
        par=next((a for a in parts if a['id']==p['parent']),None)
        x,y=position(par) if par else (290,400)
        positions[p['id']]=(x+p['joint'][0],y+p['joint'][1]); return positions[p['id']]
    canvas=Image.new('RGBA',(650,850))
    for p in sorted(parts,key=lambda a:a['layer']):
        x,y=position(p); im=Image.open(BASE.parent/'public'/p['file'])
        canvas.alpha_composite(im,(round(x-p['pivot'][0]),round(y-p['pivot'][1])))
    canvas.save(BASE/'bind-preview-v1.png')
    print(json.dumps(dict(parts=len(parts),manifest=str(OUT/'manifest.json'),preview=str(BASE/'bind-preview-v1.png')),ensure_ascii=False))

if __name__=='__main__': main()
