"""Audit immutable whole-image v01 with a single full-frame uniform registration.
Manual support anchors are disclosed estimates, not an automated pixel-precision claim.
"""
import argparse,hashlib,json,math
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont

RAW_SHA='204e30e5b8d296afc916def97936c90c42b3524d68650e390297c8b18dd9b81e'
DRAFT_SHA='bc13aa13e2b33b0e58cd0e87b90e684c3c4adbb3576d8d9b0379e3dee1bec532'
# Frontmost solid support/floor-contact anchor read from source-coordinate detail sheets.
# Infer the solid support plane where foliage hides it; ignore cast shadows.
# Wood/frog contact uncertainty is conservatively widened to 20 source pixels.
OBSERVED=[
 ('flower-01',495,292,10),('leaf-01',770,298,10),('frog-01',1038,296,10),
 ('wood-01',603,390,15),('flower-02',892,409,10),('wood-02',1110,395,15),
 ('frog-02',445,457,10),('leaf-02',730,491,10),('leaf-03',1015,510,10),
 ('wood-03',533,582,15),('flower-03',838,596,10),('frog-03',1156,598,10),
 ('frog-04',668,688,10),('wood-04',949,690,15),('wood-05',1241,701,15),
 ('flower-04',473,769,10),('flower-05',804,794,10),('leaf-04',1089,784,10),
 ('wood-06',366,920,15),('leaf-05',608,882,10),('frog-05',943,916,10),
 ('flower-06',1180,927,10),('flower-07',451,1029,10),('wood-07',689,1030,15),('wood-08',998,1034,15)]
MOUTHS=[('receiver-01',354,1207,1238),('receiver-02',643,1227,1250),
        ('receiver-03',922,1226,1250),('receiver-04',1225,1215,1247)]
p=argparse.ArgumentParser();p.add_argument('--worktree',required=True);p.add_argument('--runtime',required=True);a=p.parse_args()
wd=Path(a.worktree);rt=Path(a.runtime);qa=wd/'experiments/p6-geometry-first-art/qa';out=qa/'whole-v01';out.mkdir(exist_ok=True)
raw=rt/'frozen/whole-board-v01/raw.png';raw_bytes=raw.read_bytes();assert hashlib.sha256(raw_bytes).hexdigest()==RAW_SHA
raw_image=Image.open(raw);assert raw_image.size==(1254,1254)
# The only candidate registration; no fitting, crop, translation or local warp.
art=raw_image.convert('RGB').resize((1536,1536),Image.Resampling.LANCZOS)
geo=json.loads((qa/'registration-landmarks.json').read_bytes());inv=json.loads((qa/'draft-v01-check.json').read_bytes())['inverseFloor']
font=ImageFont.truetype(r'C:\Windows\Fonts\arial.ttf',16)
sha=lambda b:hashlib.sha256(b).hexdigest()
by_id={p['id']:p for p in geo['landmarks']}
assert set(x[0] for x in OBSERVED)=={p['id'] for p in geo['landmarks'] if p['kind']=='pin'}
measures=[]
for id,x,y,uncertainty in OBSERVED:
 if id.startswith(('wood-','frog-')): uncertainty=20
 elif id.startswith('leaf-'): uncertainty=12
 expected=by_id[id]['sourceContour'][32]
 measures.append({'id':id,'expectedFrontSupport':expected,'observedFrontSupportEstimate':[x,y],
                  'manualUncertaintyPx':uncertainty,'deltaEstimate':[x-expected[0],y-expected[1]],
                  'deltaYInterval':[y-expected[1]-uncertainty,y-expected[1]+uncertainty]})
mouths=[]
for id,x,y,front_y in MOUTHS:
 p=by_id[id];front=p['sourceContour'][32]
 mouths.append({'id':id,'expectedCaptureCenter':p['sourceCenter'],'expectedCaptureFront':front,
                'observedOpeningCenterEstimate':[x,y],'centerUncertaintyPx':10,
                'observedDarkMouthFrontEdgeYEstimate':front_y,'frontEdgeUncertaintyPx':8,
                'captureFrontBeyondDarkMouthEstimatePx':front[1]-front_y,
                'observation':'capture ellipse overlaps the front rim; it is not wholly presented inside the visible opening'})
overlay=art.copy();d=ImageDraw.Draw(overlay)
for p in geo['landmarks']:
 ring=[tuple(q) for q in p['sourceContour']];d.line(ring+[ring[0]],fill='#00ffff' if p['kind']=='pin' else '#ff00ff',width=2)
 x,y=p['sourceCenter'];d.text((x,y+25),p['id'],font=font,anchor='mt',fill='white',stroke_width=2,stroke_fill='black')
for s in geo['segments']:d.line([tuple(q) for q in s['source']],fill='#ff00ff',width=2)
floor=[tuple(q) for q in geo['floor']];d.line(floor+[floor[0]],fill='#00ff80',width=2)
x,y=geo['start']['source'];d.ellipse((x-4,y-4,x+4,y+4),outline='yellow',width=2)
overlay.save(out/'overlay.png')
annotated=overlay.copy();ad=ImageDraw.Draw(annotated)
for m in measures:
 x,y=m['observedFrontSupportEstimate'];ex,ey=m['expectedFrontSupport'];ad.line([(x,y),(ex,ey)],fill='#ff8833',width=2);ad.line([(x-5,y),(x+5,y)],fill='#ff8833',width=2);ad.line([(x,y-5),(x,y+5)],fill='#ff8833',width=2)
annotated.save(out/'manual-support-anchors.png')
P=inv['outputToSourceMatrix'];W,H=inv['dimensions'];coeff=[P[0][0]/P[2][2],P[0][1]/P[2][2],P[0][2]/P[2][2],P[1][0]/P[2][2],P[1][1]/P[2][2],P[1][2]/P[2][2],P[2][0]/P[2][2],P[2][1]/P[2][2]]
flat=art.transform((W,H),Image.Transform.PERSPECTIVE,coeff,Image.Resampling.BICUBIC,fillcolor='#bacbd1');fd=ImageDraw.Draw(flat);scale=inv['scale'];ox,oy=inv['offset']
for p in geo['landmarks']:
 cx=p['nativeCenter'][0]*scale+ox;cy=p['nativeCenter'][1]*scale+oy;r=p['nativeRadius']*scale;fd.ellipse((cx-r,cy-r,cx+r,cy+r),outline='#00ffff' if p['kind']=='pin' else '#ff00ff',width=2)
for s in geo['segments']:fd.line([(p[0]*scale+ox,p[1]*scale+oy) for p in s['native']],fill='#ff00ff',width=2)
flat.save(out/'inverse-floor.png')
# One contact diagnostic from actual oracle state, not a consumer animation or final ball.
run=json.loads((rt/'oracle/seed-0.json').read_bytes());state=run['states'][95];M=geo['nativeToSource']
def proj(x,y):
 w=M[2][0]*x+M[2][1]*y+M[2][2]
 return [(M[0][0]*x+M[0][1]*y+M[0][2])/w,(M[1][0]*x+M[1][1]*y+M[1][2])/w]
pos=state['ball']['pos'];ball_center=proj(pos['x'],pos['y']);ball_ring=[tuple(proj(pos['x']+16*math.cos(i*math.pi/64),pos['y']+16*math.sin(i*math.pi/64))) for i in range(128)]
contact=overlay.copy();cd=ImageDraw.Draw(contact);cd.line(ball_ring+[ball_ring[0]],fill='yellow',width=3);cd.text((ball_center[0]+20,ball_center[1]-10),'native seed0 state95',font=font,fill='yellow',stroke_width=2,stroke_fill='black');contact.save(out/'native-contact-95.png')
# Preserve the detail windows used for estimates; they do not re-register the art.
landmarks=[p for p in geo['landmarks'] if p['kind']=='pin']
for sheet_index in range(3):
 group=landmarks[sheet_index*10:(sheet_index+1)*10];sheet=Image.new('RGB',(1100,540),'#222222');sd=ImageDraw.Draw(sheet)
 for i,p in enumerate(group):
  cx,cy=p['sourceCenter'];left=round(cx)-110;top=round(cy)-170;panel=art.crop((left,top,left+220,top+240));pd=ImageDraw.Draw(panel)
  for xx in range((left//20+1)*20,left+220,20):pd.line([(xx-left,0),(xx-left,239)],fill='#aaaaaa',width=1);pd.text((xx-left+1,1),str(xx),fill='black',stroke_width=1,stroke_fill='white')
  for yy in range((top//20+1)*20,top+240,20):pd.line([(0,yy-top),(219,yy-top)],fill='#aaaaaa',width=1);pd.text((1,yy-top+1),str(yy),fill='black',stroke_width=1,stroke_fill='white')
  ring=[(q[0]-left,q[1]-top) for q in p['sourceContour']];pd.line(ring+[ring[0]],fill='#00ffff',width=2)
  px=(i%5)*220;py=(i//5)*270;sheet.paste(panel,(px,py+30));sd.text((px+5,py+5),p['id'],font=font,fill='white')
 sheet.save(out/f'detail-sheet-{sheet_index+1}.png')
sheet=Image.new('RGB',(1280,260),'#222222')
for i,p in enumerate([p for p in geo['landmarks'] if p['kind']=='bucket']):
 name=p['id'];cx,cy=[round(v) for v in p['sourceCenter']];left=cx-160;top=cy-140;panel=art.crop((left,top,left+320,top+230));d=ImageDraw.Draw(panel)
 for xx in range((left//20+1)*20,left+320,20):d.line([(xx-left,0),(xx-left,229)],fill='#aaaaaa');d.text((xx-left+1,1),str(xx),fill='black',stroke_width=1,stroke_fill='white')
 for yy in range((top//20+1)*20,top+230,20):d.line([(0,yy-top),(319,yy-top)],fill='#aaaaaa');d.text((1,yy-top+1),str(yy),fill='black',stroke_width=1,stroke_fill='white')
 sheet.paste(panel,(i*320,30));ImageDraw.Draw(sheet).text((i*320+5,5),name,font=font,fill='white')
sheet.save(out/'basket-mouth-details.png')
artifacts=[{'file':file.name,'bytes':file.stat().st_size,'sha256':sha(file.read_bytes())} for file in sorted(out.glob('*.png'))]
report={'schema':'r4d.p6.qa.whole-image-v01.registration.v1','rawSha256':RAW_SHA,'rawDimensions':[1254,1254],
 'imagegenCallReportedByLead':'exec-70009f94-ad4b-47e6-a8e6-ce7e37eea12e','provenanceLimit':'raw bytes independently verified; tool edit provenance supplied by Lead',
 'draftCommit':'bdf470e5beb468266184cc2ea0c997191d9907b3','draftSha256':DRAFT_SHA,
 'registration':{'mode':'full-frame uniform only','sourceDimensions':[1536,1536],'scale':1536/1254,'crop':False,'fittedHomography':False,'translation':[0,0]},
 'pins':measures,'mouths':mouths,
 'floorObservations':[{'id':'far edge','expectedSourceY':300,'observedYBandEstimate':[190,205]}, {'id':'near floor edge','expectedSourceY':geo['floor'][6][1],'observedYBandEstimate':[1055,1080]}],
 'nativeContactDiagnostic':{'seed':0,'stateTick':95,'eventTick':94,'objectId':'leaf-01','sourceBallCenter':ball_center,'interpretation':'registration risk: native contact sits below the displaced art support; assembled consumer has not been tested'},
 'summary':{'all25ManualDeltaYIntervalsNegative':all(m['deltaYInterval'][1]<0 for m in measures),'frontSupportDriftEstimateRangePx':[min(m['deltaEstimate'][1] for m in measures),max(m['deltaEstimate'][1] for m in measures)],'mouthCountWithVisibleRimOverlap':4},
 'scope':'v01 image registration observations; no arbitrary formal gate and no consumer/art PASS','artifacts':artifacts}
(out/'registration.json').write_bytes((json.dumps(report,ensure_ascii=False,indent=2)+'\n').encode('utf8'))
rows=['| ID | Ожидаемый передний контакт x,y | Наблюдаемый x,y ≈ | Δx,Δy ≈ | Неопределённость |','|---|---|---|---|---|']
for m in measures:
 fmt=lambda p:', '.join(f'{n:.1f}' for n in p)
 rows.append(f"| {m['id']} | {fmt(m['expectedFrontSupport'])} | {fmt(m['observedFrontSupportEstimate'])} | {fmt(m['deltaEstimate'])} | ±{m['manualUncertaintyPx']} px |")
(out/'support-measurements.md').write_bytes(('\n'.join(rows)+'\n').encode('utf8'))
print(json.dumps({'rawSha256':RAW_SHA,'summary':report['summary'],'mouths':mouths,'nativeContactDiagnostic':report['nativeContactDiagnostic'],'artifacts':artifacts},indent=2))
