"""Render the machine-projected P1 primitives. No hand-authored object positions."""
import hashlib
import json
import math
import argparse
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'draft-v01'
parser=argparse.ArgumentParser()
parser.add_argument('--omit-body')
parser.add_argument('--output')
args=parser.parse_args()
if args.omit_body and not args.output:parser.error('An omitted-body variant requires its own output')
data = json.loads((OUT / 'geometry.json').read_text())
if args.omit_body and args.omit_body not in [o['id'] for o in data['objects']]:parser.error('Unknown accepted object ID')
SIZE = 1536
S = 2
def pts(poly): return [(round(x*S), round(y*S)) for x,y in poly]
def polygon(draw, poly, fill, outline=None, width=1):
    draw.polygon(pts(poly),fill=fill)
    if outline: draw.line(pts(poly+[poly[0]]),fill=outline,width=width*S,joint='curve')

im = Image.new('RGB',(SIZE*S,SIZE*S),'#b7cbd1')
d = ImageDraw.Draw(im)
# A uniform surrounding environment makes the accepted playable polygon unambiguous.
floor=data['floor']
polygon(d,[(x,y+35) for x,y in floor],'#777d72')
polygon(d,floor,'#d8d3bb','#697267',2)
# Ground grid is projected from native coordinates, clipped to the exact floor polygon.
grid=Image.new('RGBA',im.size);g=ImageDraw.Draw(grid)
M=data['nativeToSource']
def project(x,y):
    w=M[2][0]*x+M[2][1]*y+M[2][2]
    return ((M[0][0]*x+M[0][1]*y+M[0][2])/w,(M[1][0]*x+M[1][1]*y+M[1][2])/w)
for x in range(32600,34001,140):g.line(pts([project(x,33000),project(x,34750)]),fill='#a9ac9970',width=S)
for y in range(33100,34751,140):g.line(pts([project(32500,y),project(34000,y)]),fill='#a9ac9970',width=S)
clip=Image.new('L',im.size);ImageDraw.Draw(clip).polygon(pts(floor),fill=255)
im.paste(grid,(0,0),Image.composite(grid.getchannel('A'),Image.new('L',im.size),clip));d=ImageDraw.Draw(im)
# Parallel decorative shadows; the accepted base ellipses remain separately registered.
sh=Image.new('RGBA',im.size);sd=ImageDraw.Draw(sh)
for obj in data['objects']:
    polygon(sd,[(x+obj['heightPx']*.38,y+obj['heightPx']*.35) for x,y in obj['base']],(37,48,34,80))
im=Image.alpha_composite(im.convert('RGBA'),sh.filter(ImageFilter.GaussianBlur(5*S)))
d=ImageDraw.Draw(im)
for seg in data['segments']:
    a,b=seg['points']; top=[(a[0],a[1]-20),(b[0],b[1]-20)]
    polygon(d,[a,b,top[1],top[0]],'#969d8a','#5c685d',1)
    d.line(pts(top),fill='#d1d6bf',width=5*S)

palette={'flower':('#9b766b','#e2b2a2'),'leaf':('#5f8a87','#abd6c4'),'frog':('#6f8860','#bdd19a'),'wood':('#94754f','#cfb785')}
for obj in sorted(data['objects'],key=lambda o:(o['native']['y'],o['native']['x'],o['id'])):
    if obj['id']==args.omit_body:continue
    side,top=palette[obj['family']]
    base,cap=obj['base'],obj['top']
    polygon(d,base,'#647263','#435a4c',2)
    # Front half of exact base and corresponding lifted cap define the illustrative side.
    polygon(d,cap[:65]+list(reversed(base[:65])),side,'#455548',1)
    polygon(d,cap,top,'#455548',2)
    # Small neutral cap inset communicates shape, without artistic silhouettes.
    cx,cy=obj['center'];cy-=obj['heightPx']
    inset=[(cx+(x-cx)*.72,cy+(y-cy)*.72) for x,y in cap]
    d.line(pts(inset+[inset[0]]),fill='#ffffff60',width=2*S)

for b in data['buckets']:
    rim=b['rim'];bottom=[(b['center'][0]+(x-b['center'][0])*.8,y+80) for x,y in rim]
    polygon(d,rim[:65]+list(reversed(bottom[:65])),'#8d7654','#52604e',2)
    polygon(d,rim,'#3c4a40','#d3c49d',7)
for start in data['starts']:
    cx,cy=start['center']
    # Deliberately geometric launcher aperture; no fabricated extra drops.
    polygon(d,[(cx-30,cy-25),(cx+30,cy-25),(cx+30,cy+6),(cx-30,cy+6)],'#b5c0b4','#53665e',2)
    d.line(pts([(cx-20,cy),(cx+20,cy)]),fill='#334e48',width=6*S)

draft=im.convert('RGB').resize((SIZE,SIZE),Image.Resampling.LANCZOS)
if args.output:
    target=Path(args.output).resolve()
    allowed=Path(r'E:\R4D\perspective\p6-runtime\builder\candidates\integration-03').resolve()
    if allowed not in target.parents:raise ValueError('Variant output must stay in own integration-03 runtime')
    target.parent.mkdir(parents=True,exist_ok=True)
    draft.save(target,optimize=False)
    print(json.dumps({'file':str(target),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'omittedBody':args.omit_body,'retainedShadow':'original single baked draft shadow'}))
    sys.exit(0)
draft.save(OUT/'geometry-draft.png',optimize=False)
registration=Image.new('RGBA',(SIZE,SIZE));rd=ImageDraw.Draw(registration)
font=ImageFont.truetype(r'C:\Windows\Fonts\arial.ttf',16)
def line(poly,color,width=2,closed=False):rd.line(poly+([poly[0]] if closed else []),fill=color,width=width,joint='curve')
for obj in data['objects']:
    line([tuple(p) for p in obj['base']], '#00ffff',3,True)
    cx,cy=obj['center'];rd.line([(cx-5,cy),(cx+5,cy)],fill='#ffffff',width=2);rd.line([(cx,cy-5),(cx,cy+5)],fill='#ffffff',width=2)
    rd.text((cx,cy+12),obj['id'],font=font,anchor='mt',fill='#ffff00',stroke_width=2,stroke_fill='#102024')
for seg in data['segments']:line([tuple(p) for p in seg['points']],'#ff55bb',3)
for b in data['buckets']:
    line([tuple(p) for p in b['rim']],'#55ff88',3,True)
    rd.text(tuple(b['center']),b['id'],font=font,anchor='mm',fill='#ffffff',stroke_width=2,stroke_fill='#102024')
for start in data['starts']:
    line([tuple(p) for p in start['ballFootprint']],'#ffd700',3,True)
    rd.text((start['center'][0],start['center'][1]-40),start['id'],font=font,anchor='mm',fill='#ffd700',stroke_width=2,stroke_fill='#102024')
registration.save(OUT/'registration.png',optimize=False)
Image.alpha_composite(draft.convert('RGBA'),registration).convert('RGB').save(OUT/'draft-overlay.png',optimize=False)
reference=Image.open(r'K:\Agents\R4D\Assets\perspective\01-jungle.jpg').convert('RGBA')
Image.alpha_composite(reference,registration).convert('RGB').save(OUT/'reference-overlay.png',optimize=False)
report={'schema':'r4d.p6.draft-artifacts.v1','dimensions':[SIZE,SIZE], 'artifacts':[]}
for name in ['geometry.json','geometry-draft.png','registration.png','draft-overlay.png','reference-overlay.png']:
    raw=(OUT/name).read_bytes();report['artifacts'].append({'file':name,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest()})
(OUT/'hashes.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,indent=2))
