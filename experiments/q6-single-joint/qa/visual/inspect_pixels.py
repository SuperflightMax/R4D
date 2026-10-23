from PIL import Image
from pathlib import Path
import json
r=Path('experiments/q6-single-joint')
rects={'thigh_near.png':(70,260,195,350),'shin_near.png':(0,0,150,100)}
results={}
for method in ['M1','M2']:
 stats={}
 for name,rect in rects.items():
  source=Image.open(r/'art/J0'/name).convert('RGBA');target=Image.open(r/'art'/method/name).convert('RGBA')
  outside=changed=missing=0;maxdelta=0
  for y in range(source.height):
   for x in range(source.width):
    a=source.getpixel((x,y));b=target.getpixel((x,y));inside=rect[0]<=x<rect[2] and rect[1]<=y<rect[3]
    if not inside:
     outside+=1
     if a!=b:changed+=1;maxdelta=max(maxdelta,max(abs(c-d) for c,d in zip(a,b)))
    elif a[3]>=128 and b[3]<128:missing+=1
  alpha=target.getchannel('A')
  stats[name]={'sourceSize':source.size,'outputSize':target.size,'outsideMaskPixels':outside,'outsideMaskChangedRGBA':changed,'outsideMaskMaxChannelDelta':maxdelta,'sourceOpaquePixelsMissingInsideMask':missing,'alphaBBox':alpha.getbbox(),'rightmostColumnAlphaGE128':sum(alpha.getpixel((target.width-1,y))>=128 for y in range(target.height))}
 results[method]=stats
(r/'qa/visual/independent-pixel-observations.json').write_text(json.dumps({'method':'Pillow original/final native RGBA compare; binary frozen native rectangles; alpha threshold128 is a diagnostic convention; missing source coverage is not automatically a visible assembled hole','results':results},indent=2),encoding='utf-8')
print(json.dumps(results))
