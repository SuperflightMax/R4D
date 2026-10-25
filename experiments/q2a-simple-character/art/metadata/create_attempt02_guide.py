"""One-off technical layout drawing, not character artwork or a rig."""
from pathlib import Path
from PIL import Image, ImageDraw
import math

root=Path(__file__).resolve().parents[1]
im=Image.new('RGB',(2048,1536),(246,247,249))
d=ImageDraw.Draw(im)
fill=(164,181,191); outline=(44,62,74)
def poly(points): d.polygon(points,fill=fill,outline=outline,width=2)
def limb(points,radii,extension):
    p0,p1,p2=points
    v=(p1[0]-p0[0],p1[1]-p0[1]);ln=math.hypot(*v);v=(v[0]/ln,v[1]/ln)
    start=(p0[0]-v[0]*extension,p0[1]-v[1]*extension)
    pts=[start,p0,p1,p2];rs=[radii[0]*.60,*radii]
    left=[];right=[]
    for i,(p,r) in enumerate(zip(pts,rs)):
        a=pts[max(0,i-1)];b=pts[min(len(pts)-1,i+1)]
        vx=b[0]-a[0];vy=b[1]-a[1];ll=math.hypot(vx,vy)
        nx=-vy/ll;ny=vx/ll
        left.append((p[0]+nx*r,p[1]+ny*r));right.append((p[0]-nx*r,p[1]-ny*r))
    poly(left+right[::-1])
    for p in points: d.ellipse((p[0]-3,p[1]-3,p[0]+3,p[1]+3),fill=(204,47,112))

# Side-profile torso and central pelvis, no complete sleeve or trouser leg.
poly([(175,170),(210,170),(212,197),(233,221),(252,265),(240,310),(227,352),(234,386),(246,415),(241,449),(225,478),(204,492),(178,486),(149,466),(143,435),(159,400),(169,367),(162,329),(151,280),(150,235),(163,207)])
# Head 118 px crown-to-chin, neck to y262 including hidden extension.
poly([(672,92),(705,94),(728,112),(728,135),(742,145),(732,154),(734,177),(719,205),(704,210),(714,231),(715,262),(675,262),(676,223),(665,195),(652,167),(653,131),(659,106)])
limb([(202,830),(248,944),(262,1050)],[35,21,15],40)
limb([(538,830),(492,944),(478,1050)],[35,21,15],40)
limb([(1100,150),(1130,310),(1150,470)],[50,28,20],55)
limb([(1440,150),(1475.583514,308.851546),(1470,470)],[50,28,20],55)
for x in (312,528):
    poly([(x-15,1184),(x+15,1184),(x+15,1208),(x+24,1227),(x+17,1253),(x+6,1265),(x-9,1260),(x-17,1239),(x-26,1231),(x-25,1215),(x-17,1212)])
for x in (1050,1420):
    poly([(x-20,1150),(x+20,1150),(x+20,1173),(x+29,1180),(x+54,1184),(x+60,1192),(x+58,1200),(x-22,1200),(x-24,1193),(x-22,1176)])
path=root/'source/attempt02_layout_guide.png'
im.save(path)
print(path)
