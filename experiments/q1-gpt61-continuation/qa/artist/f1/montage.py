from pathlib import Path
from PIL import Image,ImageDraw
b=Path(__file__).resolve().parent
out=Image.new('RGB',(1120,1470),'#eeeeee');d=ImageDraw.Draw(out)
for row,mode in enumerate(['idle','move','low']):
 for col,stage in enumerate(['before','contact','compress','return']):
  im=Image.open(b/f'{mode}-{stage}.png').convert('RGB').crop((380,0,660,468))
  out.paste(im,(col*280,row*490+22));d.text((col*280+8,row*490+4),f'{mode} / {stage}',fill='black')
out.save(b/'landing-sequence.png')
