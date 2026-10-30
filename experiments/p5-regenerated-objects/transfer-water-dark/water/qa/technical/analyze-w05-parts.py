"""Read selected PNG alpha/RGB and existing traces. No rendering/core/art edits."""
import json, math
from pathlib import Path
from PIL import Image

base = Path('E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water')
public = Path('E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/output/previews/w05/public')
manifest = json.loads((public/'assets/manifest.json').read_text())
targets = {x['id']: x for x in json.loads((public/'data/targets.json').read_text())['objects']}
matrix = json.loads((public/'data/p1-manifest.json').read_text())['projection']['nativeToSource']
textures = {x['id']: x for x in manifest['textures']}
images = {x['id']: Image.open(public/'assets'/x['file']).convert('RGBA') for x in manifest['textures']}
ball = textures['ball-v1']
samples = [(x, y) for y in range(100, 1147, 40) for x in range(99, 1151, 40)
           if images['ball-v1'].getpixel((x, y))[3] >= 128]

def project(x, y):
    d = matrix[2][0]*x + matrix[2][1]*y + matrix[2][2]
    return [(matrix[0][0]*x+matrix[0][1]*y+matrix[0][2])/d,
            (matrix[1][0]*x+matrix[1][1]*y+matrix[1][2])/d]

def pixel(image, xy):
    x, y = map(math.floor, xy)
    return list(image.getpixel((x, y))) if 0 <= x < image.width and 0 <= y < image.height else [0, 0, 0, 0]

def inspect(seed, tick, specs):
    states = [json.loads(s) for s in (base/f'input-oracle-001/private/seed-{seed}/states.ndjson').read_text().splitlines()]
    state = states[tick]; p = state['ball']['pos']; q = project(p['x'], p['y'])
    ring = [project(p['x']+16*math.cos(i*math.pi/64), p['y']+16*math.sin(i*math.pi/64)) for i in range(128)]
    bs = (max(x[0] for x in ring)-min(x[0] for x in ring))/ball['footprintPx']['width']
    origin = [q[i]-ball['groundAnchorPx'][i]*bs for i in range(2)]
    visual = [origin[i]+ball['sphereVisualCenterPx'][i]*bs for i in range(2)]
    parts = []
    for spec in specs:
        t = targets[spec['targetId']]; tex = textures[spec['textureId']]; image = images[spec['textureId']]
        scale = t['sourcePx']['footprintWidth']/tex['footprintPx']['width']
        pos = [t['sourcePx']['anchor'][i]-tex['groundAnchorPx'][i]*scale for i in range(2)]
        local = [(visual[i]-pos[i])/scale for i in range(2)]
        alphas = [pixel(image, [(origin[0]+x*bs-pos[0])/scale, (origin[1]+y*bs-pos[1])/scale])[3] for x, y in samples]
        depth = t['native']['anchor'][1]+t['native']['depthRadius']*spec['depthOffsetRadii']
        parts.append({'id': spec['id'], 'offset': spec['depthOffsetRadii'], 'calculatedDepth': depth,
                      'aboveBallByDepth': depth > p['y'], 'ballVisualCenterTexturePx': local,
                      'centerRGBA': pixel(image, local), 'coreSamplesAlpha255': sum(a == 255 for a in alphas),
                      'coreSamplesAlpha16OrMore': sum(a >= 16 for a in alphas),
                      'sampleAlphaMin': min(alphas), 'sampleAlphaMax': max(alphas),
                      'sampleAlphaMean': sum(alphas)/len(alphas),
                      'coreSamplesTotal': len(samples)})
    return {'seed': seed, 'tick': tick, 'nativeY': p['y'], 'sourceGround': q,
            'sourceSphereVisualCenter': visual, 'done': state['done'], 'parts': parts}

receiver = [i for i in manifest['instances'] if i['role'] in ['receiver-back', 'receiver-front']]
out = {'method':'Selected cached entry and non-win trajectories; exact new rim/front alpha, old floor base below ball by existing floor rank; no native runs or art edits', 'receiver': [inspect(seed, tick, receiver) for seed, ticks in [(2,[1250,1260,1266,1272,1273,1274,1275]),(1,[1114,1115,1116,1131]),(0,[1244,1245,1246])] for tick in ticks]}
(base/'w05/part-alpha-depth-analysis.json').write_text(json.dumps(out,indent=2)+'\n')
front = [i for i in manifest['instances'] if i['id'] == 'receiver-03-front']
front_scan = [inspect(1, tick, front) for tick in range(1114, 1133)]
(base/'w05/front-overlap-scan.json').write_text(json.dumps(front_scan,indent=2)+'\n')
print(json.dumps([{'seed':x['seed'],'tick':x['tick'],'parts':[p for p in x['parts'] if p['coreSamplesAlpha16OrMore']>0]} for x in out['receiver']],indent=2))
