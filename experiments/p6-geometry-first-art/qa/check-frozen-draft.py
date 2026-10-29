"""Check frozen P6 draft from Git bytes against independently extracted common P1."""
import argparse,hashlib,json,math,subprocess
from pathlib import Path
from PIL import Image,ImageDraw

COMMIT='bdf470e5beb468266184cc2ea0c997191d9907b3'
PREFIX='experiments/p6-geometry-first-art/builder/'
EXPECTED={
 'geometry-draft.png':'bc13aa13e2b33b0e58cd0e87b90e684c3c4adbb3576d8d9b0379e3dee1bec532',
 'registration.png':'426bec72faf21fe6ba654dca988ed1d74241b1372246d78741419b19a3d5cf4a',
 'draft-overlay.png':'a8253ebdbf70bd45a29cd2c542a48d626481352c4dc6c977b9216dd4ea12de55',
 'reference-overlay.png':'1d716e627dc5061b3544db00a5eac82125527c469cf65f22c05d9f5065e3fa7b',
 'geometry.json':'0544de7b4fcebf211b194fc63566a94b34a5b21b57fb0c56207a8c866d332d71'}
p=argparse.ArgumentParser();p.add_argument('--worktree',required=True);p.add_argument('--runtime',required=True)
a=p.parse_args();wd=Path(a.worktree);rt=Path(a.runtime);qa=wd/'experiments/p6-geometry-first-art/qa';frozen=rt/'frozen'/COMMIT
sha=lambda b:hashlib.sha256(b).hexdigest()
def git(*args):return subprocess.run(['git','-C',str(wd),*args],cwd=wd,check=True,capture_output=True).stdout
records=[]
for entry in git('ls-tree','-rz',COMMIT,PREFIX).split(b'\0'):
 if not entry:continue
 meta,raw_path=entry.split(b'\t',1);mode,kind,oid=meta.decode().split();source=raw_path.decode();assert kind=='blob' and mode=='100644'
 data=git('cat-file','blob',oid);relative=source[len(PREFIX):];target=frozen/relative
 assert '..' not in Path(relative).parts
 target.parent.mkdir(parents=True,exist_ok=True)
 if target.exists():assert target.read_bytes()==data
 else:target.write_bytes(data)
 records.append({'source':source,'git_blob':oid,'sha256':sha(data),'bytes':len(data)})
for name,expected in EXPECTED.items():assert sha((frozen/'draft-v01'/name).read_bytes())==expected
common=rt/'inputs/common'
receipt=json.loads((qa/'common-inputs.json').read_bytes())
for name in ['config.json','manifest.json','projection.mjs','view-math.mjs']:
 independent=(common/name).read_bytes();assert independent==(frozen/'inputs'/name).read_bytes(),name
 assert sha(independent)==next(x['sha256'] for x in receipt['common_inputs'] if x['name']==name)
assert (common/'CROSS_SERIES_CONCLUSION_AND_RECIPE.md').read_bytes()==(frozen/'inputs/P0-RECIPE.md').read_bytes()
cfg=json.loads((common/'config.json').read_bytes());manifest=json.loads((common/'manifest.json').read_bytes());geo=json.loads((frozen/'draft-v01/geometry.json').read_bytes())
H=manifest['projection']['nativeToSource'];I=manifest['projection']['sourceToNative']
assert geo['nativeToSource']==H and geo['sourceToNative']==I
assert geo['dimensions']==[1536,1536] and geo['acceptedP1']=='4b47db04c7140ebf88f69b91faa0b790d46f22ec'
def proj(m,p):
 x,y=p;w=m[2][0]*x+m[2][1]*y+m[2][2]
 return [(m[0][0]*x+m[0][1]*y+m[0][2])/w,(m[1][0]*x+m[1][1]*y+m[1][2])/w]
max_error=0.;max_roundtrip=0.;checked_points=0

def point(actual,native):
 global max_error,max_roundtrip,checked_points
 expected=proj(H,native);err=math.dist(actual,expected);max_error=max(max_error,err);assert err<1e-7,(actual,expected)
 max_roundtrip=max(max_roundtrip,math.dist(proj(I,actual),native));checked_points+=1
 return expected

def ring(p):return [proj(H,[p['x']+p['r']*math.cos(i*math.pi*2/128),p['y']+p['r']*math.sin(i*math.pi*2/128)]) for i in range(128)]

def check_circle(actual,p):
 assert len(actual)==128
 for i,q in enumerate(actual):point(q,[p['x']+p['r']*math.cos(i*math.pi*2/128),p['y']+p['r']*math.sin(i*math.pi*2/128)])
assert [o['id'] for o in geo['objects']]==[o['id'] for o in cfg['board']['pins']]
assert [s['id'] for s in geo['segments']]==[s['id'] for s in cfg['board']['segments']]
assert [b['id'] for b in geo['buckets']]==[b['id'] for b in cfg['board']['buckets']]
assert [d['id'] for d in geo['starts']]==[d['id'] for d in cfg['board']['drops']]
for obj,pin in zip(geo['objects'],cfg['board']['pins']):
 assert obj['native']==pin
 point(obj['center'],[pin['x'],pin['y']]);check_circle(obj['base'],pin)
for s,native in zip(geo['segments'],cfg['board']['segments']):
 for key,value in native.items():assert s[key]==value
 point(s['points'][0],[native['x1'],native['y1']]);point(s['points'][1],[native['x2'],native['y2']])
for b,native in zip(geo['buckets'],cfg['board']['buckets']):
 assert b['native']==native
 point(b['center'],[native['x'],native['y']]);check_circle(b['rim'],native)
for d,native in zip(geo['starts'],cfg['board']['drops']):
 for key,value in native.items():assert d[key]==value
 point(d['center'],[native['x'],native['y']]);check_circle(d['ballFootprint'],{**native,'r':cfg['board']['ball']['r']})
assert len(geo['floor'])==len(manifest['projection']['playableFloorNativePolygon'])==14
for actual,native in zip(geo['floor'],manifest['projection']['playableFloorNativePolygon']):point(actual,native)
images={name:Image.open(frozen/'draft-v01'/name) for name in EXPECTED if name.endswith('.png')}
for name,im in images.items():assert im.size==(1536,1536),(name,im.size)
assert images['registration.png'].mode=='RGBA'
# Raster proof: sample independent projected outlines and locate actual diagnostic colors nearby.
registration=images['registration.png'].convert('RGBA');pixels=registration.load()
def coverage(points,color):
 found=0;missing=[]
 for index,(x,y) in enumerate(points):
  hit=False
  for yy in range(max(0,round(y)-4),min(1536,round(y)+5)):
   for xx in range(max(0,round(x)-4),min(1536,round(x)+5)):
    if pixels[xx,yy][:3]==color and pixels[xx,yy][3]>0:hit=True;break
   if hit:break
  if hit:found+=1
  else:missing.append(index)
 return {'probes':len(points),'foundWithin4px':found,'missingProbeIndices':missing}
raster=[]
for pin in cfg['board']['pins']:raster.append({'kind':'pin','id':pin['id'],**coverage(ring(pin),(0,255,255))})
for bucket in cfg['board']['buckets']:raster.append({'kind':'bucket','id':bucket['id'],**coverage(ring(bucket),(85,255,136))})
for s in cfg['board']['segments']:
 samples=[proj(H,[s['x1']+(s['x2']-s['x1'])*i/32,s['y1']+(s['y2']-s['y1'])*i/32]) for i in range(33)]
 raster.append({'kind':'segment','id':s['id'],**coverage(samples,(255,85,187))})
for d in cfg['board']['drops']:raster.append({'kind':'drop','id':d['id'],**coverage(ring({**d,'r':cfg['board']['ball']['r']}),(255,215,0))})
# Independently inverse-warp the frozen raster; overlays use native config coordinates.
W,HOUT=1024,1536
all_native=manifest['projection']['playableFloorNativePolygon']+[[b['x'],b['y']] for b in cfg['board']['buckets']]+[[d['x'],d['y']] for d in cfg['board']['drops']]
lo=[min(p[i] for p in all_native)-80 for i in (0,1)];hi=[max(p[i] for p in all_native)+80 for i in (0,1)]
scale=min((W-64)/(hi[0]-lo[0]),(HOUT-64)/(hi[1]-lo[1]));ox=(W-(hi[0]-lo[0])*scale)/2-lo[0]*scale;oy=(HOUT-(hi[1]-lo[1])*scale)/2-lo[1]*scale
T=[[1/scale,0,-ox/scale],[0,1/scale,-oy/scale],[0,0,1]]
P=[[sum(H[r][k]*T[k][c] for k in range(3)) for c in range(3)] for r in range(3)]
coeff=[P[0][0]/P[2][2],P[0][1]/P[2][2],P[0][2]/P[2][2],P[1][0]/P[2][2],P[1][1]/P[2][2],P[1][2]/P[2][2],P[2][0]/P[2][2],P[2][1]/P[2][2]]
flat=images['geometry-draft.png'].convert('RGB').transform((W,HOUT),Image.Transform.PERSPECTIVE,coeff,Image.Resampling.BICUBIC,fillcolor='#bacbd1')
flatdraw=ImageDraw.Draw(flat)
def flatpoint(p):return (p[0]*scale+ox,p[1]*scale+oy)
floor=[flatpoint(p) for p in manifest['projection']['playableFloorNativePolygon']];flatdraw.line(floor+[floor[0]],fill='#00ff80',width=2)
for pin in cfg['board']['pins']:
 cx,cy=flatpoint([pin['x'],pin['y']]);r=pin['r']*scale;flatdraw.ellipse((cx-r,cy-r,cx+r,cy+r),outline='#00ffff',width=2)
for s in cfg['board']['segments']:flatdraw.line([flatpoint([s['x1'],s['y1']]),flatpoint([s['x2'],s['y2']])],fill='#ff00ff',width=2)
for b in cfg['board']['buckets']:
 cx,cy=flatpoint([b['x'],b['y']]);r=b['r']*scale;flatdraw.ellipse((cx-r,cy-r,cx+r,cy+r),outline='#ffff00',width=2)
output=qa/'draft-v01-inverse-floor.png';flat.save(output)
report={'schema':'r4d.p6.qa.frozen-draft.v1','candidateCommit':COMMIT,'scope':'draft input registration only; no imagegen result, consumer or product PASS',
 'artifacts':EXPECTED,'independentInputBytesEqual':True,'matrixValuesEqual':True,'counts':{'pins':len(geo['objects']),'segments':len(geo['segments']),'buckets':len(geo['buckets']),'drops':len(geo['starts']),'floorVertices':len(geo['floor'])},
 'checkedPoints':checked_points,'maxSourceErrorPx':max_error,'maxRoundTripNative':max_roundtrip,
 'rasterProbeRule':'exact registration color within 4 px of independently projected sample; this tests diagnostic raster registration, not art quality',
 'rasterProbes':raster,'inverseFloor':{'file':output.name,'sha256':sha(output.read_bytes()),'dimensions':[W,HOUT],'scale':scale,'offset':[ox,oy],'outputToSourceMatrix':P,'limitation':'inverse projection rectifies the floor; upright volumes distort and are not reconstructed top-down 3D'},
 'extraction':{'files':len(records),'totalBytes':sum(r['bytes'] for r in records),'manifestSha256':sha(json.dumps(records,indent=2).encode())}}
(qa/'draft-v01-check.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print(json.dumps({k:v for k,v in report.items() if k!='rasterProbes'},indent=2))
print(json.dumps({'rasterMinimumCoverage':min(r['foundWithin4px']/r['probes'] for r in raster),'rasterObjectsWithLabelOcclusion':sum(r['foundWithin4px']!=r['probes'] for r in raster)},indent=2))
