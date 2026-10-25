from pathlib import Path
from PIL import Image
import json, math
here=Path(__file__).parent
snap=here.parent.parent/'snapshots/p2_candidate_c2'
m=json.loads((snap/'runtime/art-binding.json').read_text())
result={}
for side in ('near','far'):
 p=m['parts']['foot_'+side]; im=Image.open(snap/p['url'].lstrip('/')).convert('RGBA'); w,h=im.size
 nx=math.ceil(w/(12*m['scale']))+1;ny=math.ceil(h/(12*m['scale']))+1
 vertices=[]
 for y in range(ny):
  for x in range(nx):
   lx=x*w/(nx-1);ly=y*h/(ny-1)
   vertices.append({'p':[(lx+p['crop'][0]-m['translation'][0])/m['scale']-p['offset'][0],(ly+p['crop'][1]-m['translation'][1])/m['scale']-p['offset'][1]],'alpha':im.getpixel((min(w-1,int(lx)),min(h-1,int(ly))))[3]})
 tris=[]
 for y in range(ny-1):
  for x in range(nx-1):
   i=y*nx+x;tris.extend([[i,i+1,i+nx],[i+1,i+nx+1,i+nx]])
 result[side]={'vertices':vertices,'triangles':tris}
(here/'boot-grid.json').write_text(json.dumps(result))
