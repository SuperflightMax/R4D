from PIL import Image,ImageDraw
from pathlib import Path
b=Path(__file__).resolve().parent
files=[f'low-{i}.png' for i in range(6)]+[f'move-{i}.png' for i in range(6)]+[f'jump-{i}.png' for i in range(8)]
out=Image.new('RGB',(1120,1560),'#eeeeee'); draw=ImageDraw.Draw(out)
for n,f in enumerate(files):
 im=Image.open(b/f).convert('RGB').crop((400,0,680,468)).resize((224,374))
 x,y=(n%5)*224,(n//5)*390
 out.paste(im,(x,y+16));draw.text((x+8,y+2),f,fill='black')
out.save(b/'motion-contact-sheet.png')
extra=[f'low-jump-{i}.png' for i in range(7)]+['low-dark.png','idle-medium.png']
extra_out=Image.new('RGB',(1120,780),'#eeeeee'); d=ImageDraw.Draw(extra_out)
for n,f in enumerate(extra):
 im=Image.open(b/f).convert('RGB').crop((400,0,680,468)).resize((224,374))
 x,y=(n%5)*224,(n//5)*390
 extra_out.paste(im,(x,y+16));d.text((x+8,y+2),f,fill='black')
extra_out.save(b/'extra-contact-sheet.png')
before=Image.open(b.parents[1]/'assets/art-checks/q1-low-01.png').convert('RGB').crop((522,158,802,626))
after=Image.open(b/'low-5.png').convert('RGB').crop((400,0,680,468))
compare=Image.new('RGB',(560,490),'#eeeeee');cd=ImageDraw.Draw(compare)
compare.paste(before,(0,22));compare.paste(after,(280,22));cd.text((8,4),'Before pelvis repair',fill='black');cd.text((288,4),'After pelvis repair',fill='black')
compare.save(b/'pelvis-low-before-after.png')
