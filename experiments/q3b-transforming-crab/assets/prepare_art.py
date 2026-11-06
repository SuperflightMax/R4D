"""Technical normalization of generated raster parts, without painting/inpainting.
Uniform affine transform maps measured physical pivots to the declared game scale.
Artwork sources and prompts remain untouched. Run from the repository root.
"""
from pathlib import Path
from PIL import Image
import json,math

BASE=Path(__file__).resolve().parent
OUT=BASE.parent/'public/art'
OUT.mkdir(exist_ok=True,parents=True)
SPECS={
 'core':dict(pivot=[915,630],width=190),
 'shellLeft':dict(pivot=[250,800],width=110),
 'boom':dict(pivot=[354,365],distal=[1920,385],length=70),
 'forearm':dict(pivot=[350,365],distal=[1888,365],length=65),
 'palm':dict(pivot=[260,500],width=50,childPivot=[987,261]),
 'jaw':dict(pivot=[350,435],width=29),
 'shellRight':dict(pivot=[1260,800],width=110),
 'upper':dict(pivot=[405,365],distal=[1798,375],length=90),
 'lower':dict(pivot=[344,364],distal=[1910,374],length=105),
 'foot':dict(pivot=[1160,315],width=46),
 'mastLink':dict(pivot=[390,365],distal=[1775,365],length=40),
 'optic':dict(pivot=[592,1045],width=32),
}

def normalize(name,spec):
 im=Image.open(BASE/'source'/f'{name}-v1.png').convert('RGBA')
 core=im.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
 x0,y0,x1,y1=core;px,py=spec['pivot']
 if 'distal'in spec:
  dx,dy=spec['distal'][0]-px,spec['distal'][1]-py
  dist=math.hypot(dx,dy);scale=spec['length']/dist;co,si=dx/dist,dy/dist
 else:scale=spec['width']/(x1-x0);co,si=1.,0.
 rect=[max(0,x0-6),max(0,y0-6),min(im.width,x1+6),min(im.height,y1+6)]
 def forward(x,y):return [scale*(co*(x-px)+si*(y-py)),scale*(-si*(x-px)+co*(y-py))]
 points=[forward(x,y) for x in (rect[0],rect[2]) for y in (rect[1],rect[3])]
 left=math.floor(min(p[0] for p in points))-2;right=math.ceil(max(p[0] for p in points))+2
 top=math.floor(min(p[1] for p in points))-2;bottom=math.ceil(max(p[1] for p in points))+2
 ss=4;inv=(co/scale/ss,-si/scale/ss,px+(co*left-si*top)/scale,
            si/scale/ss,co/scale/ss,py+(si*left+co*top)/scale)
 out=im.transform(((right-left)*ss,(bottom-top)*ss),Image.Transform.AFFINE,inv,Image.Resampling.BICUBIC)
 out=out.resize((right-left,bottom-top),Image.Resampling.LANCZOS)
 out.save(OUT/f'{name}.png')
 bounds=out.getchannel('A').point(lambda a:255 if a>=128 else 0).getbbox()
 record=dict(file=f'art/{name}.png',pivot=[-left,-top],size=list(out.size),opaqueBounds=list(bounds),
   source=f'assets/source/{name}-v1.png',sourcePivot=spec['pivot'],sourceCore=list(core),sourceRectangle=rect,
   uniformScale=scale,rotationDegrees=-math.degrees(math.atan2(si,co)))
 if 'length'in spec:record['distalJoint']=[spec['length'],0]
 if 'childPivot'in spec:record['childJoint']=[round(v,4) for v in forward(*spec['childPivot'])]
 if name=='foot':record['soleOffset']=bounds[3]-record['pivot'][1]
 return record

records={k:normalize(k,s) for k,s in SPECS.items()}
parts=[]
def add(id,texture,parent,joint,layer):
 r=records[texture]
 parts.append(dict(id=id,file=r['file'],parent=parent,joint=joint,pivot=r['pivot'],layer=layer,size=r['size']))
add('core','core',None,[0,0],30)
add('shellLeft','shellLeft','core',[-68,-42],55)
add('shellRight','shellRight','core',[68,-42],56)
for side,mount,layers in [('Rear',[0,-20],[5,6,7]),('Left',[-60,-5],[20,22,23]),('Right',[60,-5],[21,24,25])]:
 add('upper'+side,'upper','core',mount,layers[0])
 add('lower'+side,'lower','upper'+side,[90,0],layers[1])
 add('foot'+side,'foot','lower'+side,[105,0],layers[2])
for side,mount,start in [('Left',[-58,-35],40),('Right',[58,-35],44)]:
 add('boom'+side,'boom','core',mount,start)
 add('forearm'+side,'forearm','boom'+side,[70,0],start+1)
 add('palm'+side,'palm','forearm'+side,[65,0],start+2)
 add('jaw'+side,'jaw','palm'+side,records['palm']['childJoint'],start+3)
add('mastLower','mastLink','core',[0,-62],31)
add('mastUpper','mastLink','mastLower',[40,0],32)
add('optic','optic','mastUpper',[40,0],33)
manifest=dict(version=1,artRevision='q3b-full-art-v2',assemblyRevision='q3b-pack-v1',phase='packing-refinement',complete=True,
 character='Фонарный механик',coordinates='+X right, +Y down; joint relative to parent pivot',parts=parts,
 geometry=dict(upperLength=90,lowerLength=105,boomLength=70,forearmLength=65,mastLength=40,footSoleOffset=records['foot']['soleOffset']),preparation=records)
(OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
(BASE/'measurements-full-v1.json').write_text(json.dumps(records,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps({k:dict(size=r['size'],pivot=r['pivot'],childJoint=r.get('childJoint'),opaqueBounds=r['opaqueBounds']) for k,r in records.items()},indent=2))
