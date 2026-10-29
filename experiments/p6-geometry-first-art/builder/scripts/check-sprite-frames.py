"""Check actual browser-rendered properties/snapshots; compose inspection crops only."""
import hashlib
import json
import math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'integration-02'
FRAMES=OUT/'frames'
RUNTIME=Path(r'E:\R4D\perspective\p6-runtime\builder\candidates\integration-02')
native=json.loads((RUNTIME/'verification/seed-0.json').read_text())['states']
matrix=json.loads((ROOT/'inputs/manifest.json').read_text())['projection']['nativeToSource']
def project(x,y):
    w=matrix[2][0]*x+matrix[2][1]*y+matrix[2][2]
    return [(matrix[0][0]*x+matrix[0][1]*y+matrix[0][2])/w,(matrix[1][0]*x+matrix[1][1]*y+matrix[1][2])/w]
specs=[
    (0,'far',(670,240,890,420),'state0 · дальний старт'),
    (94,'contact-before',(670,290,890,470),'state94 · до контакта'),
    (95,'contact-after',(670,290,890,470),'state95 · hit event94'),
    (96,'contact-next',(670,290,890,470),'state96 · следующий тик'),
    (1916,'near',(710,1030,930,1210),'state1916 · ближняя кромка'),
    (1956,'receiver-03',(815,1180,1035,1360),'state1956 · receiver-03'),
]
report={'schema':'r4d.p6.actual-sprite-frames.v1','seed':0,'visualLiftCorrection':False,
        'alphaSuppression':False,'boardStatus':'frozen geometry draft; no obstacle occlusion layers',
        'capture':'actual in-app-browser screenshot of PixiJS frame mode, JPEG1536x1536; no post-edit of full frames',
        'frames':[]}
sheet=Image.new('RGB',(1320,792),'#162b2b');d=ImageDraw.Draw(sheet)
font=ImageFont.truetype(r'C:\Windows\Fonts\arial.ttf',19)
for i,(tick,label,rect,title) in enumerate(specs):
    stem=f'seed0-state{tick:04d}-{label}'
    frame=FRAMES/(stem+'.jpg');record=json.loads((FRAMES/(stem+'.json')).read_text())
    assert record['native']==native[tick], f'Browser/native state mismatch {tick}'
    r=record['render'];b=r['ball'];s=r['shadow'];p=record['native']['ball']['pos']
    ground=project(p['x'],p['y']);a=project(p['x']-16,p['y']);z=project(p['x']+16,p['y'])
    radius=math.dist(a,z)/2
    assert b['visualLiftPx']==0 and math.dist(b['center'],ground)<1e-8
    assert abs(b['visibleRadius']-radius)<1e-8
    assert max(abs(v-radius/428) for v in b['scale'])<1e-10
    assert b['textureCanvas']==[1254,1254] and b['opacity']==1
    assert s['textureCanvas']==[1774,887] and s['meshScale']==[1,1]
    assert s['radiusNative']==[22,22] and s['offsetNative']==[-6,10] and s['opacity']==.42
    expected=project(p['x']-6-885.5*22/312,p['y']+10-442*22/312)
    vertex_error=math.dist(s['firstGroundVertexSource'],expected)
    assert vertex_error<.00015
    assert r['artVisible'] and not r['geometryVisible'] and r['view']=='source'
    image=Image.open(frame);assert image.size==(1536,1536) and image.format=='JPEG'
    digest=hashlib.sha256(frame.read_bytes()).hexdigest()
    # Original screenshot bytes stay untouched. The separate sheet is a labelled 2x crop.
    x=(i%3)*440;y=(i//3)*396
    d.text((x+10,y+8),title,font=font,fill='#ecf3df')
    sheet.paste(image.crop(rect).resize((440,360),Image.Resampling.NEAREST),(x,y+36))
    report['frames'].append({'tick':tick,'image':str(frame.relative_to(OUT)).replace('\\','/'),
        'sha256':digest,'dimensions':list(image.size),'format':image.format,
        'nativeSnapshotEqualsOwnNative':True,'sphereCenterEqualsProjection':True,
        'visualLiftPx':b['visualLiftPx'],'projectedRadiusPx':radius,
        'shadowFirstVertexErrorPx':vertex_error,'inspectionCropSourcePx':list(rect),
        'url':f'http://127.0.0.1:41767/?frame=1&seed=0&tick={tick}'})
sheet.save(OUT/'inspection-sheet.png',optimize=False)
(OUT/'render-check.json').write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps(report,indent=2,ensure_ascii=False))
