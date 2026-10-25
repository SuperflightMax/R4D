from pathlib import Path
from collections import deque
import json
import sys
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
attempt=sys.argv[1] if len(sys.argv)>1 else 'attempt01'
im = Image.open(root / f'source/{attempt}_raw.png').convert('RGBA')
a = np.asarray(im)
mask = a[:,:,3] > 127
seen = np.zeros(mask.shape, dtype=bool)
components = []
for y, x in zip(*np.where(mask)):
    if seen[y,x]:
        continue
    seen[y,x] = True
    q = deque([(int(x),int(y))])
    count = 0
    x0=x1=int(x); y0=y1=int(y)
    while q:
        xx,yy=q.popleft(); count+=1
        x0=min(x0,xx);x1=max(x1,xx);y0=min(y0,yy);y1=max(y1,yy)
        for nx,ny in ((xx-1,yy),(xx+1,yy),(xx,yy-1),(xx,yy+1)):
            if 0<=nx<mask.shape[1] and 0<=ny<mask.shape[0] and mask[ny,nx] and not seen[ny,nx]:
                seen[ny,nx]=True;q.append((nx,ny))
    if count>500:
        components.append({'bbox_raw':[x0,y0,x1-x0+1,y1-y0+1], 'opaque_pixels':count})
red=(a[:,:,0]>180)&(a[:,:,1]<65)&(a[:,:,2]<65)
result={'raw_size':list(im.size),'mode':im.mode,'alpha_extrema':list(im.getchannel('A').getextrema()),'components_alpha_gt127':components,'red_pixels_alpha_positive':int((red&(a[:,:,3]>0)).sum()),'red_pixels_alpha_gt127':int((red&(a[:,:,3]>127)).sum()),'red_pixels_alpha_255':int((red&(a[:,:,3]==255)).sum())}
out=root/f'metadata/{attempt}_inspection.json'
out.write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
