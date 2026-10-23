"""Independent read-only reconstruction of declared Q5 art transforms."""
from pathlib import Path
import hashlib, json
from PIL import Image, ImageChops, ImageFilter

root = Path(__file__).resolve().parents[2]
rig = json.loads((root/'construction/v1/rig.json').read_text('utf-8'))
manifest = json.loads((root/'public/art/manifest.json').read_text('utf-8'))
declared = {p['id']:p for p in json.loads((root/'assets/measurements.json').read_text('utf-8'))}
records=[]
for p in rig['parts']:
    a=next(a for a in manifest['parts'] if a['id']==p['id'])
    geometry={k:a[k]==p[k] for k in ['id','parent','joint','pivot','layer']}
    source=Image.open(root/a['source']).convert('RGBA')
    dest=Image.open(root/'public'/a['file']).convert('RGBA')
    sx,sy=a['technicalScale']; dx,dy=a['technicalTranslation']
    reconstructed=source.transform((256,256),Image.Transform.AFFINE,(1/sx,0,-dx/sx,0,1/sy,-dy/sy),Image.Resampling.BICUBIC)
    mismatches=sum(x!=y for x,y in zip(dest.getdata(),reconstructed.getdata()))
    required=Image.open(root/'construction/v1/parts'/f"{p['id']}.png").getchannel('A').point(lambda v:255 if v>=32 else 0)
    actual=dest.getchannel('A').point(lambda v:255 if v>=32 else 0)
    count=lambda m:sum(v!=0 for v in m.getdata())
    missing=count(ImageChops.subtract(required,actual))
    beyond=count(ImageChops.subtract(actual,required.filter(ImageFilter.MaxFilter(17))))
    baseline=source.resize((256,256),Image.Resampling.LANCZOS)
    baseline_saved=Image.open(root/'assets/canvas-baseline'/f"{p['id']}.png").convert('RGBA')
    baseline_mismatch=sum(x!=y for x,y in zip(baseline.getdata(),baseline_saved.getdata()))
    coverage=round(1-missing/count(required),6)
    sole=None
    if p['id'].startswith('foot'):
        alpha=dest.getchannel('A'); pts=[]
        for x in range(256):
            for y in range(255,-1,-1):
                if alpha.getpixel((x,y))>=128:
                    pts.append((x+.5-p['pivot'][0],y+1-p['pivot'][1]));break
        sole=max(y for x,y in pts)
    records.append(dict(id=p['id'],geometryMatch=geometry,canvasMatch=dest.size==(256,256),uniformScale=sx==sy,reconstructionDifferentPixels=mismatches,baselineDifferentPixels=baseline_mismatch,requiredCoverage=coverage,declaredCoverageMatch=coverage==declared[p['id']]['requiredCoverage'],missingRequiredPixels=missing,outside8pxEnvelope=beyond,measuredSoleExtent=sole))
generations=json.loads((root/'assets/generation.json').read_text('utf-8'))
inputs=[]
for g in generations:
    original=Path(g['originalToolPath']); local=root/g['sourceFile']
    sha=lambda p:hashlib.sha256(p.read_bytes()).hexdigest()
    inputs.append(dict(id=g['id'],geometryReference=g['geometryReference'],geometryExists=(root/g['geometryReference']).exists(),promptExists=(root/g['promptFile']).exists(),toolSourceMatches=original.exists() and sha(original)==sha(local),styleReference=g['styleReference']))
result=dict(parts=records,generationInputs=inputs,rigSHA256=hashlib.sha256((root/'construction/v1/rig.json').read_bytes()).hexdigest(),manifestRigSHA256=manifest['constructionSHA256'])
(Path(__file__).parent/'coupling-result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
print(json.dumps(dict(parts=len(records),reconstructed=sum(r['reconstructionDifferentPixels']==0 for r in records),baselineMatched=sum(r['baselineDifferentPixels']==0 for r in records),geometryMatched=sum(all(r['geometryMatch'].values()) for r in records),generationInputs=len(inputs),toolSourcesMatched=sum(g['toolSourceMatches'] for g in inputs)),ensure_ascii=False))
