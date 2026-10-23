from PIL import Image, ImageDraw
from pathlib import Path
for name in ['route1','route2','interrupt-move','interrupt-jump','manual']:
 fs=sorted(Path('.').glob(name+'-[0-9]*.png'),key=lambda f:int(f.stem.split('-')[-1]))
 if not fs:continue
 out=Image.new('RGB',(420*4,565*((len(fs)+3)//4)),'#eeeeee');d=ImageDraw.Draw(out)
 for i,f in enumerate(fs):
  im=Image.open(f); cx=im.width//2; im=im.crop((cx-210,0,cx+210,540))
  out.paste(im,(i%4*420,i//4*565+25));d.text((i%4*420+8,i//4*565+5),f.name,fill='black')
 out.save(name+'-sheet.jpg',quality=94)
