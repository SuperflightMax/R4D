"""Technical construction only. Generated colored shapes are not final character art."""
from pathlib import Path
import json, shutil, hashlib
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent
out = root / 'v1'
if out.exists():
    raise SystemExit('v1 already exists; do not overwrite an immutable construction')
out.mkdir()
(out/'parts').mkdir()
parts = []
def part(id, parent, joint, pivot, layer, shape, coverage, hidden):
    parts.append(dict(id=id,file=f'art/parts/{id}.png',parent=parent,joint=joint,pivot=pivot,layer=layer,canvas=[256,256],shape=shape,requiredCoverage=coverage,hidden=hidden))
part('torso',None,[0,0],[128,205],30,'rounded body + shoulder/hip coverage',[['roundrect',[78,42,178,230],34]],'shoulder discs radius24 at [90,70]/[166,70]; hip radius34 at [116,205]/[140,205]')
part('head','torso',[0,-155],[128,140],40,'head with neck plug',[['ellipse',[83,15,193,133]],['roundrect',[110,100,146,160],16]],'neck plug 36px wide extends 20px below pivot, under torso collar')
for side,x,armx,layers in [('Far',-12,-38,[10,11,12,13,14]),('Near',12,38,[50,51,52,53,54])]:
    part('upperArm'+side,'torso',[armx,-135],[128,48],layers[0],'capsule shoulder to elbow',[['roundrect',[104,24,152,157],24]],'full shoulder radius24 and elbow radius24; no dark internal end line')
    part('forearm'+side,'upperArm'+side,[0,85],[128,48],layers[1],'forearm with integral hand',[['roundrect',[109,29,147,150],19],['roundrect',[106,125,155,185],18]],'elbow disc radius19 under upper arm; continuous material at overlap')
    part('thigh'+side,None,[x,0],[128,48],layers[2],'capsule hip to knee',[['roundrect',[94,14,162,202],34]],'hip radius34 under torso; knee radius34 covers shin plug')
    part('shin'+side,'thigh'+side,[0,120],[128,48],layers[3],'capsule knee to ankle',[['roundrect',[102,22,154,194],26]],'knee plug radius26 beneath thigh; ankle radius26 covers boot plug')
    part('foot'+side,'shin'+side,[0,120],[90,40],layers[4],'flat sole boot facing right',[['roundrect',[65,28,155,70],12],['roundrect',[72,18,108,59],16]],'ankle plug radius18; sole y=70, ankle pivot y=40, 30px sole extent')
data=dict(version='q5-construction-v1',kind='profile articulated biped, fixed rigid parts',units='pixels at canonical scale',camera='right-facing side view; horizontal mirror allowed; no depth turns',displayHeight=360,parts=parts,motion=dict(thigh=120,shin=120,farThigh=120,farShin=120,nearReach=228.48,farReach=228.48,soleExtent=30,groundDistance=258.48,lowDepth=76.8,lowBodyX=-25.92,strideHalf=49.92,lift=38.4),colors=dict(required='#699eae',hidden='#d6a33c',allowed='#e3e9ed',axes='#da3751'),artRules='Shapes are construction envelopes, not artwork. Preserve required coverage/pivots/chain lengths; silhouette embellishment <=8px around envelope except sole must stay y=70. Internal end contours must remain open or covered. Artist may use visible intentional joint design. Canvas must remain 256x256; no part-specific resizing without recorded construction change.')
(out/'rig.json').write_text(json.dumps(data,ensure_ascii=False,indent=2),encoding='utf8')
sheet=Image.new('RGB',(1280,960),'#f4f5f3'); sd=ImageDraw.Draw(sheet)
for i,p in enumerate(parts):
    im=Image.new('RGBA',(256,256),(0,0,0,0)); d=ImageDraw.Draw(im)
    for typ,bbox,*radius in p['requiredCoverage']:
        if typ=='ellipse':d.ellipse(bbox,fill='#699eae')
        else:d.rounded_rectangle(bbox,radius=radius[0],fill='#699eae')
    im.save(out/'parts'/f"{p['id']}.png")
    x=(i%4)*320+32;y=(i//4)*320+36
    sd.text((x,y-24),p['id'],fill='#17252e')
    sd.rectangle((x,y,x+255,y+255),outline='#9cabb3',width=1)
    sheet.paste(im,(x,y),im)
    px,py=p['pivot'];sd.line((x+px-9,y+py,x+px+9,y+py),fill='#da3751',width=2);sd.line((x+px,y+py-9,x+px,y+py+9),fill='#da3751',width=2)
    sd.text((x,y+264),f"pivot {px},{py}; joint {p['joint']}",fill='#17252e')
sheet.save(out/'parts-blueprint.png')
shutil.copyfile(root.parent.parent/'q2-simple-character/src/motion.js',out/'motion-reference.js')
print(out)
