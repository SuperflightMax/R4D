"""Read the actual PNG alpha; output measurement data only, never edit art."""
import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[2]
data_bytes = (root / 'art/parts.json').read_bytes()
data = json.loads(data_bytes)
result = {'alphaThreshold': 1, 'contractSha256': hashlib.sha256(data_bytes).hexdigest(), 'feet': {}}
for side in ['near', 'far']:
    part = next(p for p in data['parts'] if p['id'] == side + 'Foot')
    file = root / 'art' / part['file']
    rgba = np.array(Image.open(file).convert('RGBA'))
    height, width = rgba.shape[:2]
    assert [width, height] == part['cropRect'][2:]
    points = []
    for x in range(width):
        ys = np.flatnonzero(rgba[:, x, 3] >= 1)
        if len(ys):
            y = int(ys[-1])
            for dx in [-0.5, 0.5]:
                points.append({'x': part['cropRect'][0] + x + dx, 'y': part['cropRect'][1] + y + 0.5})
    result['feet'][side] = {'file': part['file'], 'sha256': hashlib.sha256(file.read_bytes()).hexdigest(), 'points': points}
(Path(__file__).parent / 'sole-contours.json').write_text(json.dumps(result, indent=2) + '\n', encoding='utf-8')
garment = next(p for p in data['parts'] if p['id'] == 'pelvis')
cloth_alpha = Image.open(root / 'art' / garment['file']).convert('RGBA').getchannel('A')
(Path(__file__).parent / 'cloth-alpha.bin').write_bytes(cloth_alpha.tobytes())
print(json.dumps({'version': data['version'], 'columns': {s: len(v['points'])//2 for s,v in result['feet'].items()}}))
