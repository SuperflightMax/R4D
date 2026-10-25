"""Read-only support audit of the saved first assembly; never edits art."""
import json
import math
from pathlib import Path
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[1]
saved = root / 'build' / 'early-v02-01'
data = json.loads((saved / 'art' / 'parts.json').read_text(encoding='utf-8'))
report = json.loads((saved / 'measurements.json').read_text(encoding='utf-8'))
joints = data['jointPoints']
ground = data['groundY']
results = {}
for mode in ['neutral', 'low']:
    pose = report[mode]['pose']
    rows = {}
    for side in ['near', 'far']:
        part = next(p for p in data['parts'] if p['id'] == side + 'Foot')
        alpha = np.asarray(Image.open(saved / 'art' / part['file']).convert('RGBA'))[:, :, 3]
        yy, xx = np.where(alpha >= 128)
        a, b = joints[part['from']], joints[part['to']]
        A, B = pose[part['from']], pose[part['to']]
        angle = math.atan2(B['y']-A['y'], B['x']-A['x']) - math.atan2(b[1]-a[1], b[0]-a[0])
        x = xx + part['cropRect'][0] - a[0]
        y = yy + part['cropRect'][1] - a[1]
        transformed_y = A['y'] + x*math.sin(angle) + y*math.cos(angle)
        deepest = float(transformed_y.max())
        rows[side] = {
            'angleDegrees': math.degrees(angle),
            'maxOpaqueY': deepest,
            'pixelsBelowGround': deepest-ground,
            'displayPixelsBelowGroundAt420px': (deepest-ground)*420/data['figureBounds'][3],
            'opaquePixelsBelowPlaneByMoreThan1px': int(np.sum(transformed_y > ground+1)),
        }
    results[mode] = rows
destination = root / 'builder' / 'early-v02-01' / 'pixel-support.json'
destination.write_text(json.dumps(results, indent=2) + '\n', encoding='utf-8')
print(json.dumps(results, indent=2))
