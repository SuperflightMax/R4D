from pathlib import Path
import json, math
from PIL import Image,ImageDraw
p=Path(__file__).parent/'v1'
data=json.loads((p/'rig.json').read_text(encoding='utf8'))
poses=json.loads((p/'poses.json').read_text())['poses']
parts=data['parts']; lookup={x['id']:x for x in parts}
sheet=Image.new('RGB',(1600,1800),'#f4f5f3');d=ImageDraw.Draw(sheet)
for i,s in enumerate(poses):
    pose=s['pose'];world={}
    def transform(id):
        if id in world:return world[id]
        part=lookup[id];parent=transform(part['parent']) if part['parent'] else (0,0,0)
        x,y=part['joint'];c=math.cos(parent[2]);sn=math.sin(parent[2])
        world[id]=(parent[0]+x*c-y*sn,parent[1]+x*sn+y*c,parent[2]+pose.get(id,0))
        return world[id]
    cx=(i%4)*400+200;cy=(i//4)*600+320
    d.text((cx-180,cy-300),f"{s['name']} / {s['state']}",fill='#17252e')
    d.line((cx-190,cy+258*.65,cx+190,cy+258*.65),fill='#7c8d94',width=2)
    for part in sorted(parts,key=lambda x:x['layer']):
        x,y,a=transform(part['id']);x+=pose['bodyX'];y+=pose['rootY']
        im=Image.open(p/'parts'/f"{part['id']}.png")
        # Rotate around physical pivot on a generous local canvas, then composite.
        canvas=Image.new('RGBA',(800,800));canvas.paste(im,(400-part['pivot'][0],400-part['pivot'][1]),im)
        canvas=canvas.rotate(-a*180/math.pi,resample=Image.Resampling.BICUBIC,center=(400,400))
        canvas=canvas.resize((520,520),Image.Resampling.LANCZOS)
        sheet.paste(canvas,(round(cx+x*.65-260),round(cy+y*.65-260)),canvas)
        px=cx+x*.65;py=cy+y*.65;d.ellipse((px-2,py-2,px+2,py+2),fill='#da3751')
sheet.save(p/'pose-blueprint.png')
# Distinguish required shape from hidden joint overlap in a separate annotated sheet.
annot=Image.open(p/'parts-blueprint.png');ad=ImageDraw.Draw(annot)
for i,part in enumerate(parts):
    x=(i%4)*320+32;y=(i//4)*320+36;px,py=part['pivot']
    radius=34 if part['id'].startswith('thigh') else 26 if part['id'].startswith('shin') else 24 if part['id'].startswith('upperArm') else 19 if part['id'].startswith('forearm') else 18 if part['id'].startswith('foot') else 16
    ad.ellipse((x+px-radius,y+py-radius,x+px+radius,y+py+radius),outline='#d68e20',width=3)
annot.save(p/'overlap-blueprint.png')
