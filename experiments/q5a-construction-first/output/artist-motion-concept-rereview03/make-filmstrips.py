from pathlib import Path
from PIL import Image,ImageDraw
import sys,json
root=Path(__file__).resolve().parent
for name in sys.argv[1:]:
    data=json.loads((root/name).read_text(encoding='utf-8-sig'))
    for run in data.get('runs',[]):
        source=run.get('captures',run['rows'])
        if 'captures' in run:
            groups={mode:[r for r in source if r['mode']==mode] for mode in ['light','dark','dark-diagnostic','light-diagnostic']}
        else:groups={'realtime':source}
        for mode,rows in groups.items():
            for offset in range(0,len(rows),8):
                part=rows[offset:offset+8];sheet=Image.new('RGB',(1680,1100),'#e8ecec');draw=ImageDraw.Draw(sheet)
                for i,row in enumerate(part):
                    im=Image.open(root/row['file']).convert('RGB');im.thumbnail((410,515))
                    x=(i%4)*420;y=(i//4)*550
                    sheet.paste(im,(x+(420-im.width)//2,y+30))
                    draw.text((x+5,y+5),row['file'].replace(data['device']+'-',''),fill='#102629')
                out=f"{data['device']}-{run['state']}-{mode}-sheet-{offset//8+1}.jpg"
                sheet.save(root/out,quality=94)
    print(name,'collated')
