from PIL import Image, ImageDraw
from pathlib import Path
p=Path('.')
for name in ['idle','low','move']:
    fs=sorted(p.glob(name+'-[0-9]*.png'),key=lambda f:int(f.stem.split('-')[-1]))
    if not fs:continue
    out=Image.new('RGB',(420*4,550*((len(fs)+3)//4)), '#eeeeee')
    d=ImageDraw.Draw(out)
    for i,f in enumerate(fs):
        out.paste(Image.open(f),(i%4*420,i//4*550+25));d.text((i%4*420+8,i//4*550+5),f.name,fill='black')
    out.save(name+'-sheet.jpg',quality=94)
