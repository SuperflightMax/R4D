from pathlib import Path
from PIL import Image, ImageDraw

base = Path(__file__).parent / 'output' / 'playwright'
for prefix in ['route1-', 'route2-', 'mid-']:
    files = sorted(base.glob(prefix + '*.png'))
    cols = 4
    width, height = 260, 420
    sheet = Image.new('RGB', (cols * width, ((len(files)+cols-1)//cols)*height), '#eeeeea')
    draw = ImageDraw.Draw(sheet)
    for i, file in enumerate(files):
        im = Image.open(file).convert('RGB').crop((125, 0, 455, 570))
        im.thumbnail((width, height-22))
        x,y=(i%cols)*width,(i//cols)*height
        sheet.paste(im,(x+(width-im.width)//2,y+22))
        draw.text((x+5,y+5),file.stem,fill='black')
    sheet.save(base / (prefix.rstrip('-')+'-contact.png'))

# Comparable character heights; this is an inspection sheet, not replacement art.
root=Path(__file__).parents[2]
source=Image.open(root/'assets/source/whole-original.png').convert('RGBA').crop((246,53,834,1462))
source=source.resize((150,360),Image.Resampling.LANCZOS)
screen=Image.open(base/'bind-light.png').convert('RGB').crop((648,288,800,648))
low=Image.open(base/'low-light.png').convert('RGB').crop((210,130,420,490))
comparison=Image.new('RGB',(720,430),'#d6dfd1')
comparison.paste(source,(45,50),source)
comparison.paste(screen,(285,50))
comparison.paste(low,(495,50))
d=ImageDraw.Draw(comparison)
d.text((15,15),'Exact whole (source glow retained)',fill='black')
d.text((265,15),'q4-c1 bind, actual screen',fill='black')
d.text((505,15),'q4-c1 low, actual screen',fill='black')
comparison.save(base/'source-bind-low-comparison.png')
