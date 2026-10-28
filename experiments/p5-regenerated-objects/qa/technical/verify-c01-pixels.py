"""Independent read-only PNG metrics for C01; no edits, trimming or image output."""
import hashlib
import json
from pathlib import Path
from PIL import Image, __version__ as pillow_version

root = Path('E:/R4D/perspective/p5-runtime/builder/output/previews/c01/public')
out = Path('E:/R4D/perspective/p5-runtime/technical-qa/c01/pixel-verification.json')
assert not out.exists(), 'Append-only evidence already exists'
manifest = json.loads((root / 'assets/manifest.json').read_bytes())

def bounds(box):
    if box is None:
        return [0, 0, 0, 0]
    x0, y0, x1, y1 = box
    return [x0, y0, x1 - x0, y1 - y0]

results = []
for texture in manifest['textures']:
    file = root / 'assets' / texture['file']
    buffer = file.read_bytes()
    assert len(buffer) == texture['bytes']
    assert hashlib.sha256(buffer).hexdigest() == texture['sha256']
    with Image.open(file) as image:
        assert list(image.size) == texture['sizePx']
        alpha = image.convert('RGBA').getchannel('A')
        measured = {
            'bounds': bounds(alpha.getbbox()),
            'visibleBounds': bounds(alpha.point(lambda value: 255 if value >= 16 else 0).getbbox()),
            'minAlpha': alpha.getextrema()[0],
            'maxAlpha': alpha.getextrema()[1],
        }
        for field in ['bounds', 'visibleBounds', 'maxAlpha']:
            assert measured[field] == texture['alpha'][field], (texture['id'], field)
        results.append({'id': texture['id'], 'sizePx': list(image.size), 'mode': image.mode, **measured})

result = {'scope': 'Exact image sizes/alpha bounds only; not visual grounding/occlusion PASS',
          'pillow': pillow_version, 'textureCount': len(results), 'textures': results}
buffer = (json.dumps(result, indent=2) + '\n').encode()
out.write_bytes(buffer)
print(json.dumps({'path': str(out), 'bytes': len(buffer), 'sha256': hashlib.sha256(buffer).hexdigest(),
                  'texturesVerified': len(results), 'pillow': pillow_version}))
