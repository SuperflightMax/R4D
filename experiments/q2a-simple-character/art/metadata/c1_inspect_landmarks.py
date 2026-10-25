"""Diagnostic loupe only: enlarged copies with marks; production PNGs untouched."""
from pathlib import Path
from PIL import Image,ImageDraw
import json
root=Path(__file__).resolve().parents[1]
m=json.loads((root/'metadata/attempt03_initial.json').read_text(encoding='utf-8'))
sheet=Image.new('RGB',(1500,1150),(238,238,232));d=ImageDraw.Draw(sheet)
items=[('body',10,30,3),('head',450,30,3),('arm_near',450,530,2),('hand_near',820,30,4),('hand_far',1150,30,4)]
for name,x,y,z in items:
 p=m['parts'][name];im=Image.open(root/'metadata'/p['png']).convert('RGBA')
 bg=Image.new('RGBA',im.size,(238,238,232,255));bg.alpha_composite(im)
 enlarged=bg.convert('RGB').resize((im.width*z,im.height*z),Image.Resampling.NEAREST)
 sheet.paste(enlarged,(x,y));d.text((x,y-17),name+' (diagnostic zoom only)',fill=(20,20,20))
 for k,v in p['landmarks_PNG'].items():
  xx=x+v[0]*z;yy=y+v[1]*z
  d.line((xx-9,yy,xx+9,yy),fill=(190,10,170),width=2);d.line((xx,yy-9,xx,yy+9),fill=(190,10,170),width=2)
  d.text((xx+10,yy-15),k,fill=(150,0,110))
sheet.save(root/'metadata/c1_landmark_loupe.png')
