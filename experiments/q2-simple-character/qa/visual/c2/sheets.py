from PIL import Image,ImageDraw
from pathlib import Path
p=Path('c2')
groups={
 'states':['idle','low-mid','low-transition','low','move-a','move-b'],
 'jump':['prepare','flight-early','flight','flight-late','land-first','land-mid','land-low'],
 'interruptions':['interrupt-move-before','interrupt-move-request','interrupt-move-early','interrupt-move-middle','interrupt-move-late','interrupt-move-end','interrupt-jump-before','interrupt-jump-request','interrupt-jump-early','interrupt-jump-middle','interrupt-jump-late','interrupt-jump-end']}
for name,fs in groups.items():
 out=Image.new('RGB',(1260,565*((len(fs)+2)//3)),'#eeeeee');d=ImageDraw.Draw(out)
 for i,f in enumerate(fs):
  im=Image.open(p/(f+'.png'));cx=im.width//2
  out.paste(im.crop((cx-210,0,cx+210,540)),(i%3*420,i//3*565+25))
  d.text((i%3*420+7,i//3*565+5),f,fill='black')
 out.save(p/(name+'.jpg'),quality=95)
