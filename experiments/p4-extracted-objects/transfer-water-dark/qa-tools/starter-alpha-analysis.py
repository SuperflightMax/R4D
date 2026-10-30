"""Static pixel analysis of frozen PNGs at independently observed live poses.
Does not edit images or infer occlusion from crop rectangles. Fraction estimates
use 0.25 source-pixel sampling and bilinear alpha; screenshots remain primary UI evidence.
"""
import json
import sys
from pathlib import Path
import numpy as np
from PIL import Image

target, out = map(Path, sys.argv[1:])
art = json.loads((target / 'art/manifest.json').read_text())
source = np.asarray(Image.open(target / 'input/original.jpg').convert('RGB'))
parts = [p for o in art['objects'] for p in o['parts']]
pixels = {}
provenance = []
for p in parts:
    im = Image.open(target / 'art' / p['file'])
    a = np.asarray(im)
    assert im.mode == 'RGBA'
    pixels[p['partId']] = a[:, :, 3].astype(float) / 255
    if p['provenance']['kind'] == 'extracted':
        r = p['sourceRectPx']
        src = source[r['y']:r['y']+r['height'], r['x']:r['x']+r['width']]
        mask = a[:, :, 3] > 0
        mismatches = np.count_nonzero(np.any(a[:, :, :3] != src, axis=2) & mask)
        assert mismatches == 0
        provenance.append(dict(file=p['file'],nonzeroAlphaPixels=int(mask.sum()),rgbMismatches=int(mismatches),partialAlphaPixels=int(((a[:,:,3]>0)&(a[:,:,3]<255)).sum())))

body = np.asarray(Image.open(target / 'art/ball-body.png'))[:, :, 3].astype(float) / 255
def sample(im, x, y):
    """Coordinates in texel-index convention; outside is transparent."""
    ix, iy = np.floor(x).astype(int), np.floor(y).astype(int)
    fx, fy = x-ix, y-iy
    v = np.zeros_like(x, dtype=float)
    for dx, dy, weight in [(0,0,(1-fx)*(1-fy)),(1,0,fx*(1-fy)),(0,1,(1-fx)*fy),(1,1,fx*fy)]:
        valid = (ix+dx>=0)&(iy+dy>=0)&(ix+dx<im.shape[1])&(iy+dy<im.shape[0])
        v[valid] += im[iy[valid]+dy, ix[valid]+dx]*weight[valid]
    return v

def overlap(name, ids):
    raw = json.loads((out / (name+'.dom.json')).read_text())
    state, depth = json.loads(raw['state']), json.loads(raw['depth'])
    actor = depth['actor']
    cx, cy, scale = actor['center']['x'], actor['center']['y'], actor['bodyScale']
    xx, yy = np.meshgrid(np.arange(cx-128*scale,cx+128*scale,.25),np.arange(cy-128.5*scale,cy+127.5*scale,.25))
    ba = sample(body,(xx-cx)/scale+128-.5,(yy-cy)/scale+128.5-.5)
    cover = np.zeros_like(ba)
    for part in parts:
        if part['partId'] not in ids:
            continue
        r=part['sourceRectPx']
        pa=sample(pixels[part['partId']],xx-r['x']-.5,yy-r['y']-.5)
        cover=1-(1-cover)*(1-pa)
    mask=ba>=16/255
    union=int(np.count_nonzero(mask&(cover>=16/255)))
    fraction=float(np.sum(ba*cover)/np.sum(ba))
    front=ids[0].startswith('receiver') or state['ball']['pos']['y']<art['objects'][0]['anchorNative'][1]
    return dict(record=name,tick=state['tick'],sourceCenter=[cx,cy],radius=actor['radius'],silhouetteOverlapSamples=union,alphaWeightedOverlapFraction=fraction,partsAheadOfBall=front,estimatedHiddenFraction=fraction if front else 0)

arch_ids=['arch-07:left-support','arch-07:right-support','arch-07:lintel']
rows=[overlap('04-arch-1005',arch_ids)]
rows += [overlap('05-arch-'+str(t),arch_ids) for t in [1008,1009,1013,1014,1015,1020,1021]]
rows += [overlap(n,['receiver-02:front']) for n in ['28-receiver-1273-zoom','29-receiver-1274-zoom','30-receiver-1275-zoom']]
opening={p:float(pixels[p][953-840,514-402]) for p in arch_ids}
assert all(x==0 for x in opening.values())
result=dict(method='0.25 source px bilinear alpha; actual observed actor center/scale; threshold16 for overlap count; weighted fraction is estimate, not renderer readback',extractedOriginalRgb=provenance,openingAtSource514_953=opening,poses=rows)
(out/'ALPHA_RESULTS.json').write_text(json.dumps(result,indent=2)+'\n')
print(json.dumps(result,indent=2))
