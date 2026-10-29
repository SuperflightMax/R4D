"""Diagnostic crops from actual IAB PNGs; does not modify candidate art."""
import argparse
import hashlib
import json
import math
from pathlib import Path
from PIL import Image, ImageChops, ImageDraw, ImageFont

p = argparse.ArgumentParser()
p.add_argument('--runtime', required=True)
a = p.parse_args()
rt = Path(a.runtime)
browser = rt / 'preliminary25-browser'
out = Path(__file__).parent / 'integration-04-preliminary25'
report = json.loads((out / 'check.json').read_bytes())
pins = {r['id']: r for r in report['registration']}
manifest = json.loads((rt / 'inputs/common/manifest.json').read_bytes())
frames = json.loads((browser / 'frames.json').read_bytes())
samples = {r['label']: r for r in frames + json.loads((browser / 'actual-ui.json').read_bytes())}
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 16)
small = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 12)
used = {}

def load(name):
    path = browser / (name + '.jpg')
    data = path.read_bytes()
    im = Image.open(path)
    used[name + '.jpg'] = {'sha256': hashlib.sha256(data).hexdigest(), 'bytes': len(data), 'format': im.format, 'canvas': im.size}
    return im.convert('RGB')

def source_frame(name):
    im = load(name)
    if name.startswith('frame-'):
        assert im.size == (1536, 1536)
        return im
    # This candidate's observed ordinary UI has an empty canvas margin at34/212.
    # Scan its uninterrupted top/left margins, excluding similarly colored UI text.
    px, py = 34, 212
    bg = im.getpixel((px, py))
    def same(x, y):
        return all(abs(a-b) <= 4 for a, b in zip(im.getpixel((x, y)), bg))
    left = right = px
    top = bottom = py
    while left > 0 and same(left-1, py): left -= 1
    while right+1 < im.width and same(right+1, py): right += 1
    while top > 0 and same(px, top-1): top -= 1
    while bottom+1 < im.height and same(px, bottom+1): bottom += 1
    box = (left, top, right+1, bottom+1)
    assert abs((box[2]-box[0]) - (box[3]-box[1])) <= 1, (name, box)
    # Normalize only this diagnostic's browser CSS scale to the source canvas.
    return im.crop(box).resize((1536, 1536), Image.Resampling.LANCZOS)

def text(draw, xy, value, f=font):
    draw.text(xy, value, font=f, fill=(225, 238, 232))

base = source_frame('frame-source-all25-geometry')
rim = Image.new('RGB', (1050, 1030), (16, 26, 28))
d = ImageDraw.Draw(rim)
text(d, (12, 7), 'Actual IAB source frame; cyan = true projected P1 circle. Diagnostic crops only.')
for i, pin in enumerate(report['registration']):
    cx, cy = pin['projectedCenter']
    r = pin['projectedHorizontalRadius']
    cut = base.crop((round(cx-1.55*r), round(cy-1.6*r), round(cx+1.55*r), round(cy+1.2*r)))
    cut.thumbnail((200, 174), Image.Resampling.LANCZOS)
    x, y = (i % 5)*210+5, (i // 5)*198+35
    rim.paste(cut, (x+(200-cut.width)//2, y+22))
    text(d, (x, y), pin['id'])
rim.save(out / 'all25-rims-diagnostic.png')

def contact_sheet(rows, name, ordinary=False):
    sheet = Image.new('RGB', (1040 if not ordinary else 780, 1050), (16, 26, 28))
    draw = ImageDraw.Draw(sheet)
    text(draw, (10, 6), 'Actual IAB before / contact / after; cyan = native geometry; last column = art only.' if not ordinary else 'Actual ordinary IAB side contacts: before / contact / after (CSS scale normalized).', small)
    for row, (seed, ticks, ident) in enumerate(rows):
        cx, cy = pins[ident]['projectedCenter']
        text(draw, (8, row*250+30), f'seed{seed} {ident}')
        for col, tick in enumerate(ticks):
            label = f'seed{seed}-t{tick:04}' if ordinary else f'frame-seed0-t{tick:04}'
            crop = source_frame(label).crop((round(cx-120), round(cy-150), round(cx+120), round(cy+70)))
            sheet.paste(crop, (col*260+5, row*250+55))
            text(draw, (col*260+(150 if col == 0 else 8), row*250+36), f't{tick}', small)
        if not ordinary:
            crop = source_frame(f'frame-art-only-t{ticks[1]:04}').crop((round(cx-120), round(cy-150), round(cx+120), round(cy+70)))
            sheet.paste(crop, (785, row*250+55))
            text(draw, (788, row*250+36), f't{ticks[1]} art only', small)
    sheet.save(out / name)

contact_sheet([(0,[94,95,96],'leaf-01'),(0,[441,442,443],'frog-02'),(0,[571,572,573],'wood-01'),(0,[890,891,892],'flower-02')], 'contacts-seed0-diagnostic.png')
contact_sheet([(1,[1017,1018,1019],'wood-01'),(1,[1574,1575,1576],'leaf-05'),(2,[778,779,780],'flower-02'),(2,[1115,1116,1117],'leaf-05')], 'side-contacts-seeds1-2-diagnostic.png', True)

poly = manifest['projection']['wholeSourceNativePolygon']
minx, maxx = min(p[0] for p in poly), max(p[0] for p in poly)
miny, maxy = min(p[1] for p in poly), max(p[1] for p in poly)
scale = min(1500/(maxx-minx), 1500/(maxy-miny))
edge = Image.new('RGB', (1060, 650), (16, 26, 28))
draw = ImageDraw.Draw(edge)
text(draw, (10, 6), 'Actual IAB edge/terminal: floor mask clips shadow only. Crops at native screenshot pixels.', small)
for row, tick in enumerate([1916,1956]):
    for col, (label, title) in enumerate([(f'frame-source-{"edge1916" if tick==1916 else "terminal1956"}-art-only','source art'),(f'frame-seed0-t{tick:04}','source + geometry'),(f'frame-flat-{"edge1916" if tick==1916 else "terminal1956"}-art-only','flat art')]):
        sample = samples[label]
        if col < 2:
            cx, cy = sample['metrics']['projectedNativeCenter']
        else:
            nx, ny = sample['metrics']['nativeCenter']
            cx = (1536-(maxx-minx)*scale)/2 + (nx-minx)*scale
            cy = (1536-(maxy-miny)*scale)/2 + (ny-miny)*scale
        crop = source_frame(label).crop((round(cx-170), round(cy-165), round(cx+170), round(cy+115)))
        edge.paste(crop, (col*350+5,row*310+55))
        text(draw, (col*350+8,row*310+32), f't{tick}: {title}')
edge.save(out / 'edge-mask-diagnostic.png')

originals = ['frame-source-all25-geometry.jpg', 'frame-source-edge1916-art-only.jpg',
             'frame-flat-edge1916-art-only.jpg', 'source-terminal1956-geometry-only.jpg',
             'live-seek-paused95.jpg']
for name in originals:
    raw = (browser / name).read_bytes()
    (out / name).write_bytes(raw)
    used[name] = {'sha256': hashlib.sha256(raw).hexdigest(), 'bytes': len(raw)}
evidence = {'source': 'QA own actual IAB screenshots; never Builder QA frames',
            'sourceCommit': report['sourceCommit'], 'candidateArtBytesUnmodified': True,
            'actualScreenshotFormat': 'JPEG; byte-identical captures use .jpg; derived diagnostics use PNG',
            'diagnostics': ['all25-rims-diagnostic.png','contacts-seed0-diagnostic.png','side-contacts-seeds1-2-diagnostic.png','edge-mask-diagnostic.png'],
            'operations': 'Crops, labels and diagnostic-only uniform resizing; source files retained in QA E runtime.',
            'copiedOriginalScreenshots': originals, 'screenshotInputs': used}
(out / 'screenshots.json').write_bytes((json.dumps(evidence,indent=2)+'\n').encode('utf8'))
print('Saved 4 diagnostic sheets and 5 byte-identical original IAB screenshots.')
