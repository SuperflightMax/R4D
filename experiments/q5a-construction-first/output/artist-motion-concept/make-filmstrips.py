from pathlib import Path
from PIL import Image,ImageDraw
import sys
root=Path(__file__).resolve().parent
for prefix in sys.argv[1:]:
    files=sorted(root.glob(prefix+'-[0-9][0-9][0-9].png'))
    for offset in range(0,len(files),12):
        subset=files[offset:offset+12]
        sheet=Image.new('RGB',(1800,2100),'#e8ecec'); draw=ImageDraw.Draw(sheet)
        for i,p in enumerate(subset):
            im=Image.open(p).convert('RGB')
            # Viewer crop only: central scene, all vertical pixels; no asset/pose edits.
            w,h=im.size
            left=max(0,(w-600)//2);im=im.crop((left,0,min(w,left+600),h))
            im.thumbnail((590,665))
            x=(i%3)*600;y=(i//3)*525
            if im.height>490:im=im.resize((round(im.width*490/im.height),490))
            sheet.paste(im,(x+(600-im.width)//2,y+28))
            draw.text((x+12,y+8),p.name,fill='#122629')
        path=root/(prefix+'-filmstrip-'+str(offset//12+1)+'.jpg');sheet.save(path,quality=94)
    print(prefix,len(files),'frames')
