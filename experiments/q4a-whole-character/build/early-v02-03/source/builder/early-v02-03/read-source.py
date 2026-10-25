"""Read frozen material only; output exhaustive alpha-cell input for Stage A."""
from pathlib import Path
from PIL import Image
import json,hashlib
here=Path(__file__).resolve().parent
root=here.parents[1]
before=root/'build/early-v02-02'
parts=json.loads((before/'art/parts.json').read_text())
p=next(p for p in parts['parts'] if p['id']=='pelvis')
file=before/'art'/p['file']
im=Image.open(file).convert('RGBA')
visible=Image.open(before/'art/early-v02-02/extracted/pelvis.png').convert('RGBA')
assert im.size==visible.size
alpha=im.getchannel('A');v=visible.getchannel('A')
cells=[[x,y,alpha.getpixel((x,y)),v.getpixel((x,y))]for y in range(im.height)for x in range(im.width)if alpha.getpixel((x,y))>0]
result={'file':p['file'],'cropRect':p['cropRect'],'sha256':hashlib.sha256(file.read_bytes()).hexdigest(),'cells':cells}
(here/'source-cells.json').write_text(json.dumps(result,separators=(',',':'))+'\n')
print(json.dumps({'nonzeroAlphaCells':len(cells),'crop':p['cropRect']}))
