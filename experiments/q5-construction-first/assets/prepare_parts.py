"""Explicit Lead-approved uniform art registration; no painting, masking, infill or rig edits."""
from pathlib import Path
import json, hashlib
from PIL import Image, ImageChops, ImageFilter

root = Path(__file__).resolve().parents[1]
rig = json.loads((root/'construction/v1/rig.json').read_text(encoding='utf-8'))
destination = root/'public/art/parts'
destination.mkdir(parents=True, exist_ok=True)
baseline_dir = root/'assets/canvas-baseline'
baseline_dir.mkdir(parents=True, exist_ok=True)
sources = {'torso':'torso', 'head':'head'}
for segment in ['upperArm','forearm','thigh','shin','foot']:
    for side in ['Near','Far']:
        sources[segment+side] = segment
measurements = []
manifest = dict(version='q5-c1-art-v1', character='Эмалевый мастер', facing='right',
    coordinates='+X right,+Y down; joint relative to parent pivot; null parent fixed hip root',
    construction='construction/v1/rig.json', constructionSHA256=hashlib.sha256((root/'construction/v1/rig.json').read_bytes()).hexdigest(),
    targetDisplayHeight=360, parts=[])
for part in rig['parts']:
    name = part['id']
    source = root/'assets/source'/f'{sources[name]}.png'
    if not source.exists():
        continue
    source_image = Image.open(source).convert('RGBA')
    original_size = list(source_image.size)
    baseline = source_image.resize((256,256), Image.Resampling.LANCZOS)
    baseline.save(baseline_dir/f'{name}.png')
    required = Image.open(root/'construction/v1/parts'/f'{name}.png').getchannel('A').point(lambda p:255 if p>=32 else 0)
    required_box = required.getbbox()
    source_box = source_image.getchannel('A').point(lambda p:255 if p>=32 else 0).getbbox()
    sx0,sy0,sx1,sy1 = source_box
    tx0,ty0,tx1,ty1 = required_box
    # One scalar, no independent x/y stretch: fit predefined coverage bbox, never infer new rig axes.
    scale = max((tx1-tx0)/(sx1-sx0), (ty1-ty0)/(sy1-sy0))
    dx = (tx0+tx1)/2 - scale*(sx0+sx1)/2
    dy = (ty0+ty1)/2 - scale*(sy0+sy1)/2
    if name.startswith('foot'):
        dy = ty1 - scale*sy1
    image = source_image.transform((256,256),Image.Transform.AFFINE,(1/scale,0,-dx/scale,0,1/scale,-dy/scale),Image.Resampling.BICUBIC)
    output = destination/f'{name}.png'
    if output.exists():
        existing = Image.open(output).convert('RGBA').tobytes()
        if existing != image.tobytes() and existing != baseline.tobytes():
            raise SystemExit(f'Refusing to overwrite different prepared part: {output}')
        if existing == baseline.tobytes():
            image.save(output)
    else:
        image.save(output)
    alpha = image.getchannel('A')
    actual = alpha.point(lambda p:255 if p>=32 else 0)
    missing = ImageChops.subtract(required,actual)
    outside = ImageChops.subtract(actual,required)
    beyond = ImageChops.subtract(actual,required.filter(ImageFilter.MaxFilter(17)))
    count = lambda mask: sum(1 for p in mask.get_flattened_data() if p)
    required_count = count(required)
    measurements.append(dict(id=name,source=f'assets/source/{sources[name]}.png',sourceSize=original_size,
        outputSize=[256,256],sourceBBox=Image.open(source).getchannel('A').getbbox(),
        outputBBox=actual.getbbox(),requiredBBox=required.getbbox(),requiredPixels=required_count,
        missingRequiredPixels=count(missing),requiredCoverage=round(1-count(missing)/required_count,6),
        outsideRequiredPixels=count(outside),outside8pxEnvelopePixels=count(beyond),
        pixelsBelowFrozenSole=count(actual.crop((0,71,256,256))) if name.startswith('foot') else None,
        baselineRequiredCoverage=round(1-count(ImageChops.subtract(required,baseline.getchannel('A').point(lambda p:255 if p>=32 else 0)))/required_count,6),
        baselineBBox=baseline.getchannel('A').point(lambda p:255 if p>=32 else 0).getbbox(),
        registration=dict(sourceThresholdBBox=source_box,targetFrozenBBox=required_box,uniformScale=scale,translateX=dx,translateY=dy,
            method='uniform bbox cover centered on frozen bbox; foot aligned to frozen sole; inverse affine bicubic'),
        operation='uniform scale + translation of generated pixels, Lead lead-normalization.md; no rig/pivot/chain changes, no painting/mask/infill',
        outputSHA256=hashlib.sha256(output.read_bytes()).hexdigest()))
    record = {key:part[key] for key in ['id','file','parent','joint','pivot','layer']}
    record.update(size=[256,256], source=f'assets/source/{sources[name]}.png',technicalScale=[scale,scale],technicalTranslation=[dx,dy],
        constructionPart=f'construction/v1/parts/{name}.png')
    manifest['parts'].append(record)
(root/'public/art/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
(root/'assets/measurements.json').write_text(json.dumps(measurements,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(dict(prepared=len(measurements),coverage=[dict(id=m['id'],coverage=m['requiredCoverage'],outside8=m['outside8pxEnvelopePixels']) for m in measurements]),ensure_ascii=False))
