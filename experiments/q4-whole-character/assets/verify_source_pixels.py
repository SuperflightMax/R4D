"""Read-only pixel comparison; never edits image data."""
import hashlib
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
manifest = json.loads((root / 'public/art/manifest.json').read_text(encoding='utf-8-sig'))
source_path = root / 'assets/source/whole-original.png'
source = Image.open(source_path).convert('RGBA')
digest = hashlib.sha256(source_path.read_bytes()).hexdigest()
result = {'whole_sha256': digest, 'parts': []}
for p in manifest['parts']:
    part = Image.open(root / 'public' / p['file']).convert('RGBA')
    mask = Image.open(root / p['sourceMask']).convert('RGBA')
    x0, y0, width, height = p['sourceCrop']
    mismatch = count = 0
    for y in range(y0, y0 + height):
        for x in range(x0, x0 + width):
            if mask.getpixel((x, y))[3]:
                count += 1
                mismatch += source.getpixel((x, y)) != part.getpixel((x - x0, y - y0))
    result['parts'].append({'id': p['id'], 'source_pixels': count, 'rgba_mismatches': mismatch,
                            'expected_count_matches': count == p['exactSourcePixels'],
                            'png_sha256': hashlib.sha256((root / 'public' / p['file']).read_bytes()).hexdigest()})
result['all_preserved'] = (digest == manifest['parts'][0]['sourceSha256'] and
                           all(p['rgba_mismatches'] == 0 and p['expected_count_matches'] for p in result['parts']))
(root / 'assets/source-pixel-check.json').write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
print(json.dumps(result, ensure_ascii=False))
if not result['all_preserved']:
    raise SystemExit(1)
