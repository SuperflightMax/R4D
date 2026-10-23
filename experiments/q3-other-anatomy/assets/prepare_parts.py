"""Deterministic crop, axis alignment and uniform scale of generated pixels only.
No painting, inpainting, replacement contours or synthesized artwork.
Run from repository root. Artistic sources and measured source axes stay intact.
"""
from pathlib import Path
from PIL import Image
import json, math

BASE = Path(__file__).resolve().parent
OUT = BASE.parent / 'public/art'
OUT.mkdir(parents=True, exist_ok=True)
MEASURED = {
    'body': dict(pivot=[820,470], width=260),
    'upper': dict(pivot=[314,339], distal=[1952,369], length=100),
    'lower': dict(pivot=[318,351], distal=[1994,372], length=120),
    'foot': dict(pivot=[950,185], width=66),
    'sensor': dict(pivot=[520,1320], height=72),
}

def prepare(name, spec):
    im = Image.open(BASE/'source'/f'{name}-v1.png').convert('RGBA')
    # Ignore near-transparent generated edge noise for geometry measurement only.
    # Retain original alpha inside the selected rectangle, including sensor glow.
    core = im.getchannel('A').point(lambda a: 255 if a>=128 else 0).getbbox()
    x0,y0,x1,y1 = core
    px,py = spec['pivot']
    if 'distal' in spec:
        dx,dy = spec['distal'][0]-px, spec['distal'][1]-py
        scale = spec['length']/math.hypot(dx,dy)
        co,si = dx/math.hypot(dx,dy),dy/math.hypot(dx,dy)
    else:
        scale = spec.get('width',0)/(x1-x0) if 'width' in spec else spec['height']/(y1-y0)
        co,si = 1.,0.
    # Keep a small source margin, larger for the intentionally luminous sensor.
    margin = 90 if name=='sensor' else 6
    rect = [max(0,x0-margin),max(0,y0-margin),min(im.width,x1+margin),min(im.height,y1+margin)]
    def forward(x,y):
        return (scale*(co*(x-px)+si*(y-py)),scale*(-si*(x-px)+co*(y-py)))
    corners=[forward(x,y) for x in (rect[0],rect[2]) for y in (rect[1],rect[3])]
    left=math.floor(min(a[0] for a in corners))-2
    top=math.floor(min(a[1] for a in corners))-2
    right=math.ceil(max(a[0] for a in corners))+2
    bottom=math.ceil(max(a[1] for a in corners))+2
    # Supersampled affine keeps uniform geometry and original painted contours.
    ss=4
    inv=(co/scale/ss,-si/scale/ss,px+(co*left-si*top)/scale,
         si/scale/ss,co/scale/ss,py+(si*left+co*top)/scale)
    image=im.transform(((right-left)*ss,(bottom-top)*ss),Image.Transform.AFFINE,inv,Image.Resampling.BICUBIC)
    image=image.resize((right-left,bottom-top),Image.Resampling.LANCZOS)
    image.save(OUT/f'{name}.png')
    pivot=[-left,-top]
    opaque=image.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
    record=dict(id=name,file=f'art/{name}.png',pivot=pivot,size=list(image.size),
                source=f'assets/source/{name}-v1.png',sourcePivot=spec['pivot'],
                sourceCore=list(core),sourceRectangle=rect,uniformScale=scale,
                axisRotationDegrees=-math.degrees(math.atan2(si,co)),opaqueBounds=list(opaque))
    if 'length' in spec:record['distalJoint']=[spec['length'],0]
    if name=='foot':record['soleOffset']=opaque[3]-1-pivot[1]
    return record

records={k:prepare(k,v) for k,v in MEASURED.items()}
parts=[]
def add(id, texture, parent, joint, layer):
    r=records[texture]
    parts.append(dict(id=id,file=r['file'],parent=parent,joint=joint,pivot=r['pivot'],layer=layer,size=r['size'],
                      **({'distalJoint':r['distalJoint']} if 'distalJoint'in r else {})))
add('body','body',None,[0,0],30)
add('sensor','sensor','body',[0,-50],35)
for side,mount,layers in [('Rear',[0,-5],[5,6,7]),('Left',[-70,25],[20,40,41]),('Right',[70,25],[21,42,43])]:
    add('upper'+side,'upper','body',mount,layers[0])
    add('lower'+side,'lower','upper'+side,[100,0],layers[1])
    add('foot'+side,'foot','lower'+side,[120,0],layers[2])
manifest=dict(version=1,artRevision='q3-c1-art-v1',character='Фонарный краб',
              coordinates='+X right, +Y down; joints relative to parent pivot; rigid +X links',
              parts=parts,geometry=dict(upperLength=100,lowerLength=120,footSoleOffset=records['foot']['soleOffset']),
              preparation=records)
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(BASE/'measurements.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(dict(records=records,parts=len(parts)),ensure_ascii=False,indent=2))
