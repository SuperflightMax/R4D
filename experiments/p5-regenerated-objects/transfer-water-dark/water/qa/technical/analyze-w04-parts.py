"""Read selected PNG alpha/RGB and existing traces. No rendering/core/art edits."""
import json, math
from pathlib import Path
from PIL import Image

base = Path('E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water')
public = Path('E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/output/previews/w04/public')
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
gate = [i for i in manifest['instances'] if i['id'] == 'arch-07-whole-baseline']
out = {'method': 'Read-only alpha/RGB query of frozen PNG using accepted source registration and cached native states. Depths calculated from exact consumer formula, not direct Pixi zIndex measurement. Sampled alpha is diagnostic, actual screenshots remain visual evidence.',
       'receiver': [inspect(2, tick, receiver) for tick in [1272, 1273, 1274, 1275]],
       'arch': [inspect(1, tick, gate) for tick in [998, 1008, 1009, 1012, 1013, 1014, 1015, 1016, 1018, 1019, 1020, 1021, 1031]]}
(base/'w04/part-alpha-depth-analysis.json').write_text(json.dumps(out, indent=2)+'\n')
print(json.dumps({'receiver': [{**{k:v for k,v in r.items() if k != 'parts'}, 'parts': [p for p in r['parts'] if p['id'].startswith('receiver-02')]} for r in out['receiver']], 'arch': out['arch']}, indent=2))
