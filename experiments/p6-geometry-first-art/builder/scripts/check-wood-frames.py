"""Check the single real wood placement against native snapshots and packet anchors."""
import hashlib,json,math
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'integration-03';FRAMES=OUT/'frames'
RUNTIME=Path(r'E:\R4D\perspective\p6-runtime\builder\candidates\integration-03')
trace=json.loads((RUNTIME/'verification/seed-0.json').read_text())
adapter=json.loads((OUT/'WOOD_ADAPTER_V01.json').read_text())
wood=adapter['woodSource'];layer=adapter['layers'][1]
hit=next(e for e in trace['events'] if e['type']=='object_hit' and e.get('objectId')=='wood-01')
assert hit['tick']==571
sheet=Image.new('RGB',(1020,792),'#162b2b');d=ImageDraw.Draw(sheet)
font=ImageFont.truetype(r'C:\Windows\Fonts\arial.ttf',18)
report={'schema':'r4d.p6.actual-one-wood-frames.v1','instanceId':'wood-01','seed':0,'nativeHitEvent':hit,
        'woodRegistration':wood,'physicsAndConfigChanged':False,'extraShadowAdded':False,'frames':[]}
for i,(tick,overlay) in enumerate([(571,False),(572,False),(573,False),(571,True),(572,True),(573,True)]):
    stem=f'seed0-state{tick}-'+('overlay' if overlay else 'ordinary')
    p=FRAMES/(stem+'.jpg');rec=json.loads((FRAMES/(stem+'.json')).read_text())
    assert rec['native']==trace['states'][tick]
    r=rec['render'];assert r['geometryVisible']==overlay and r['artVisible']
    assert len(r['objectLayers'])==1
    actual=r['objectLayers'][0];assert actual['objectId']=='wood-01'
    assert actual['nativeBase']==layer['nativeBase'] and actual['nativeRadius']==layer['nativeRadius']
    assert actual['actualPosition']==layer['rect'][:2] and actual['actualDimensions']==layer['rect'][2:]
    anchor=[actual['actualPosition'][0]+625*wood['actualUniformScale'],actual['actualPosition'][1]+1032*wood['actualUniformScale']]
    assert math.dist(anchor,wood['projectedPinCenter'])<1e-9
    assert r['ball']['visualLiftPx']==0 and math.dist(r['ball']['center'],r['projectedNativeCenter'])<1e-9
    im=Image.open(p);assert im.format=='JPEG' and im.size==(1536,1536)
    x=(i%3)*340;y=(i//3)*396
    d.text((x+8,y+8),f'state{tick} · '+('overlay' if overlay else 'actual'),font=font,fill='#ecf3df')
    sheet.paste(im.crop((555,345,725,525)).resize((340,360),Image.Resampling.NEAREST),(x,y+36))
    report['frames'].append({'tick':tick,'overlay':overlay,'file':'frames/'+p.name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),
                            'nativeSnapshotMatches':True,'actualGroundAnchorMatches':True,'onlyOneWoodInstance':True,
                            'woodAboveBall':actual['aboveBall'],'inspectionCropSourcePx':[555,345,725,525]})
sheet.save(OUT/'inspection-sheet.png',optimize=False)
(OUT/'render-check.json').write_bytes((json.dumps(report,indent=2,ensure_ascii=False)+'\n').encode())
print(json.dumps({'frames':report['frames'],'anchor':wood['projectedPinCenter'],'uniformScale':wood['actualUniformScale'],
                  'ellipseMismatchPx':wood['maxSampledEllipseMismatchPx'],'visibleHeightPx':wood['visibleHeightAboveGroundPx'],
                  'draftHeightPx':wood['draftHeightAboveGroundPx']},indent=2))
