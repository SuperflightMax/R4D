"""Rasterize authored source-coordinate regions, without editing the source artwork.

Only the documented exact P1 config/manifest are read. No sim/private source.
Each small output is white RGB with an antialiased alpha channel, no rescale.
"""
import hashlib
import json
import math
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent
REPO = ROOT.parents[2]
P1 = '4b47db04c7140ebf88f69b91faa0b790d46f22ec'
PREFIX = 'experiments/p1-collider-mapping/clean-repeat-01/'

def exact_json(path, expected):
    raw = subprocess.check_output(['git', '-C', str(REPO), 'show', f'{P1}:{PREFIX}{path}'])
    raw = raw.replace(b'\r\n', b'\n')
    assert hashlib.sha256(raw).hexdigest() == expected, path
    return json.loads(raw)

def main():
    config = exact_json('simulation/boards/01/trial-01/config.json',
                        'dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db')
    manifest = exact_json('simulation/boards/01/trial-01/manifest.json',
                          '7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18')
    regions = json.loads((ROOT / 'regions.json').read_text(encoding='utf8'))
    pins = {p['id']: p for p in config['board']['pins']}
    masks = ROOT / 'masks'
    masks.mkdir(exist_ok=True)
    occluders = []
    for region in regions['regions']:
        points = [p for poly in region['polygons'] for p in poly]
        x0, y0 = math.floor(min(p[0] for p in points))-2, math.floor(min(p[1] for p in points))-2
        x1, y1 = math.ceil(max(p[0] for p in points))+3, math.ceil(max(p[1] for p in points))+3
        w, h = x1-x0, y1-y0
        aa = 4
        alpha = Image.new('L', (w*aa, h*aa))
        draw = ImageDraw.Draw(alpha)
        for poly in region['polygons']:
            draw.polygon([((x-x0)*aa, (y-y0)*aa) for x,y in poly], fill=255)
        alpha = alpha.resize((w,h), Image.Resampling.LANCZOS)
        rgba = Image.new('RGBA', (w,h), (255,255,255,0))
        rgba.putalpha(alpha)
        path = f'masks/{region["id"]}.png'
        rgba.save(ROOT / path)
        item = {'id':region['id'], 'path':path, 'rectPx':[x0,y0,w,h]}
        if region['kind'] == 'pin':
            item['depthNativeY'] = pins[region['configId']]['y']
        elif 'depthLineNative' in region:
            item['depthLineNative'] = region['depthLineNative']
        else:
            item['depthNativeY'] = region['depthNativeY']
        occluders.append(item)
    contract = {
        'schema':'r4d-p3-assets-v1', 'sourceSize':[1536,1536],
        'ball':{'path':'assets/ball-v1.png','anchorPx':[626.5,624.5],'radiusPx':487.5},
        'shadow':{'path':'assets/shadow-v1.png','anchorPx':[625.5,627.5],
                  'radiusPx':554.5,'offsetRadius':[-0.45,0.5],
                  'scaleRadius':[1.15,2.6],'alpha':0.72},
        'occluders':occluders
    }
    (ROOT / 'assets.json').write_text(json.dumps(contract,indent=2)+'\n',encoding='utf8')
    paths = [ROOT/'assets.json',ROOT/'regions.json',ROOT/'prepare_masks.py',
             *sorted((ROOT/'assets').glob('*.png')),*sorted(masks.glob('*.png'))]
    hashes = {p.relative_to(ROOT).as_posix():{'bytes':p.stat().st_size,
              'sha256':hashlib.sha256(p.read_bytes()).hexdigest()} for p in paths}
    (ROOT / 'hashes.json').write_text(json.dumps(hashes,indent=2)+'\n',encoding='utf8')
    print(json.dumps({'occluders':len(occluders),'paths':hashes},indent=2))

if __name__ == '__main__':
    main()
