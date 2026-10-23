from PIL import Image, ImageDraw, ImageFont
from pathlib import Path
p=Path('experiments/q6-single-joint/qa/visual/output/playwright')
f=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',16)
poses=['bind','extreme_extension','extreme_flexion','step_overlap','jump_phase']
for mode,n in [('joint',3),('method',2)]:
 rows=[]
 for i,pose in enumerate(poses):
  theme='light' if i%2 else 'dark';im=Image.open(p/f'mobile-{mode}-target-{theme}-{pose}.png').convert('RGB');bg=(232,227,217) if theme=='light' else (32,37,45)
  spans=[];start=None
  for y in range(im.height):
   ok=im.getpixel((2,y))==bg
   if ok and start is None:start=y
   if not ok and start is not None:
    if y-start>400:spans.append((start,y))
    start=None
  if start is not None and im.height-start>400:spans.append((start,im.height))
  full=max(b-a for a,b in spans);scale=full/660
  row=Image.new('RGB',(im.width*n,240),'#f4f1eb');d=ImageDraw.Draw(row)
  d.text((5,4),f'{mode} mobile | {pose} | native crops. First source capture top clipped; knee retained.',font=f,fill='black')
  for j,(a,b) in enumerate(spans[:n]):
   missing=full-(b-a) if a==0 else 0
   cy=(304 if pose!='jump_phase' else 220)*scale
   top=max(a,int(a+cy-100-missing));row.paste(im.crop((0,top,im.width,top+205)),(j*im.width,35))
  rows.append(row)
 sheet=Image.new('RGB',(rows[0].width,240*len(rows)),'white')
 for i,row in enumerate(rows):sheet.paste(row,(0,240*i))
 sheet.save(p/f'sheet-mobile-{mode}.jpg',quality=95)
# paused intermediate frames; native knee strips, same framing per J panel
names=['joint-intermediate-1.png','joint-intermediate-2.png','joint-intermediate-3.png','method-intermediate.png']
rows=[]
for name in names:
 im=Image.open(p/name).convert('RGB');row=Image.new('RGB',(im.width,295),'#f4f1eb');ImageDraw.Draw(row).text((5,4),name+' | same-Motion diagnostic; native crop',font=f,fill='black');row.paste(im.crop((0,190,im.width,450)),(0,35));rows.append(row)
s=Image.new('RGB',(rows[0].width,sum(r.height for r in rows)),'white');y=0
for r in rows:s.paste(r,(0,y));y+=r.height
s.save(p/'sheet-intermediates.jpg',quality=95)
