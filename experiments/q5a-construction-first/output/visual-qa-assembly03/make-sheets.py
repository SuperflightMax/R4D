from PIL import Image,ImageDraw
from pathlib import Path
import json
root=Path(__file__).parent
for prefix in ['A','B','C','J','M','F','R','W','P']:
    files=sorted(root.glob(prefix+'-*.png'))
    for start in range(0,len(files),20):
        group=files[start:start+20]
        sheet=Image.new('RGB',(1200,350*((len(group)+4)//5)), '#ffffff');d=ImageDraw.Draw(sheet)
        for i,p in enumerate(group):
            im=Image.open(p).convert('RGB')
            # Stage captures retain originals; centered crop only for sheet navigation.
            if im.width>700:
                im=im.crop((int(im.width*.29),0,int(im.width*.77),im.height))
            im.thumbnail((236,322))
            x=(i%5)*240;y=(i//5)*350
            sheet.paste(im,(x+(240-im.width)//2,y+23));d.text((x+5,y+3),p.stem,fill='#111111')
        sheet.save(root/f'{prefix}-sheet-{start//20+1}.jpg',quality=92)
