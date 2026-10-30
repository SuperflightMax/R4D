"""Read-only RGB support for the visually identified near-floor bevel band."""
import json
from pathlib import Path
from statistics import median
from PIL import Image

public = Path('E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/dark/output/previews/d02/public')
root = Path('E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/dark/d02')
manifest = json.loads((public/'assets/manifest.json').read_text())
floor = next(t for t in manifest['textures'] if t['id'] == 'floor-v3')
im = Image.open(public/'assets'/floor['file']).convert('RGB')
rows = []
for y in range(906, 924):
    a = [sum(im.getpixel((x, y)))/3 for x in range(200, 1051, 5)]
    b = [sum(im.getpixel((x, y-1)))/3 for x in range(200, 1051, 5)]
    rows.append({'textureY': y, 'medianRgbMean': median(a), 'medianRowDelta': median([v-b[i] for i, v in enumerate(a)])})
scale = 1536/im.width
out = {'method': 'Independent source PNG visual identification + RGB row queries + actual Whole/Field geometry overlay. Manual upper bevel band, not an exact geometric plane inferred from RGB.',
       'pngSha256': floor['sha256'], 'textureSize': list(im.size), 'uniformScale': scale,
       'acceptedNearSourceY': 1121, 'visualUpperBevelBandTextureY': [912, 918],
       'visualUpperBevelBandSourceY': [912*scale, 918*scale],
       'nominalBandMidSourceY': 915*scale, 'nominalBandMidResidualSourcePx': 915*scale-1121,
       'uncertaintySourcePx': 3*scale, 'rows': rows,
       'actualEvidence': ['s0-start-whole-geometry.png', 's0-start-field-geometry.png', 's0-start-field-art.png'],
       'verdict': 'Known large lower-edge drift corrected in this scope; target lies inside the identifiable bevel band. No subpixel claim or full-floor geometry PASS.'}
(root/'floor-edge-independent.json').write_text(json.dumps(out, indent=2)+'\n')
print(json.dumps({k: v for k, v in out.items() if k != 'rows'}, indent=2))
