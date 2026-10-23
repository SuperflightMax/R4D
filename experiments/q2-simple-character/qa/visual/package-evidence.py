from PIL import Image, ImageDraw
from pathlib import Path
root=Path('.').resolve()
galleries={
 'evidence-states':['idle-0.png','low-8.png','move-4.png','move-2.png','jump-8.png','jump-low-retarget-18.png'],
 'evidence-route1':[f'route1-{i}.png' for i in [0,3,7,10,13,14,16,17,22]],
 'evidence-route2':[f'route2-{i}.png' for i in [0,4,7,9,11,14,16,18,22]],
 'evidence-interrupt-move':[f'interrupt-move-{i}.png' for i in [0,1,2,3,4,5,6,8,12]],
 'evidence-interrupt-jump':[f'interrupt-jump-{i}.png' for i in [0,1,2,4,5,8,11,12,13]],
 'evidence-manual':[f'manual-{i}.png' for i in [0,1,2,4,5,8,10,11,13]],
 'evidence-jump':[f'jump-{i}.png' for i in [0,2,3,5,8,12,14,15,18]]
}
for name,fs in galleries.items():
 out=Image.new('RGB',(1260,565*((len(fs)+2)//3)),'#eeeeee');d=ImageDraw.Draw(out)
 for i,f in enumerate(fs):
  im=Image.open(f)
  if im.width>500:
   cx=im.width//2;im=im.crop((cx-210,0,cx+210,540))
  out.paste(im,(i%3*420,i//3*565+25));d.text((i%3*420+7,i//3*565+5),f,fill='black')
 out.save(name+'.jpg',quality=95)
keep={'idle.png','low-dark.png','low-8.png','move-4.png','jump-8.png','interrupt-move-0.png','interrupt-move-1.png','interrupt-jump-0.png','interrupt-jump-1.png'}
for f in root.glob('*.png'):
 if f.name not in keep:
  assert f.resolve().parent==root
  f.unlink()
for f in root.glob('*-sheet.jpg'):
 assert f.resolve().parent==root
 f.unlink()
