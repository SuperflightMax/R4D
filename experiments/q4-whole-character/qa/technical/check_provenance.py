"""Read-only pixel audit of the frozen Q4 inputs; writes only its own JSON."""
from pathlib import Path
import hashlib
import json
import numpy as np
from PIL import Image

root = Path(__file__).resolve().parents[2]
def rgba(path):
    return np.asarray(Image.open(path).convert('RGBA'))
def read_json(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))

source_path = root / 'assets/source/whole-original.png'
source = rgba(source_path)
edit = rgba(root / 'assets/source/torso-local-fill.png')
source_sha = hashlib.sha256(source_path.read_bytes()).hexdigest()
manifest = read_json(root / 'public/art/manifest.json')
plan = read_json(root / 'assets/parts-plan.json')
plans = {p['id']: p for p in plan['parts']}
results = []
for part in manifest['parts']:
    pixels = rgba(root / 'public' / part['file'])
    x, y, w, h = part['sourceCrop']
    sm = rgba(root / part['sourceMask'])[y:y+h, x:x+w, 3] > 0
    hm = rgba(root / part['hiddenMask'])[y:y+h, x:x+w, 3] > 0
    gm = rgba(root / part['generativeMask'])[y:y+h, x:x+w, 3] > 0
    original = source[y:y+h, x:x+w]
    local_edit = edit[y:y+h, x:x+w]
    clone = hm & ~gm
    yy, xx = np.indices((h, w))
    gx, gy = xx + x, yy + y
    reconstructed = np.zeros_like(pixels)
    done = sm | gm
    reconstructed[sm] = original[sm]
    reconstructed[gm] = local_edit[gm]
    for f in plans[part['id']]['fills']:
        cx, cy, rx, ry, sx, sy, sw, sh = f
        dx, dy = (gx-cx)/rx, (gy-cy)/ry
        chosen = (dx*dx+dy*dy <= 1) & ~done
        source_x = (sx+(dx+1)*.5*(sw-1)).astype(int)
        source_y = (sy+(dy+1)*.5*(sh-1)).astype(int)
        reconstructed[chosen] = source[source_y[chosen], source_x[chosen]]
        done |= chosen
    result = {
        'id': part['id'], 'sourceHashMatches': part['sourceSha256'] == source_sha,
        'sizeMatches': list(pixels.shape[:2][::-1]) == part['size'],
        'sourcePixels': int(sm.sum()), 'clonePixels': int(clone.sum()),
        'generativePixels': int(gm.sum()),
        'sourceRgbaMismatches': int(np.any(pixels[sm] != original[sm], axis=-1).sum()),
        'generativeRgbaMismatches': int(np.any(pixels[gm] != local_edit[gm], axis=-1).sum()),
        'reconstructionRgbaMismatches': int(np.any(pixels != reconstructed, axis=-1).sum()),
        'undeclaredVisiblePixels': int(((pixels[:,:,3] > 0) & ~(sm|hm)).sum()),
        'maskOverlap': int((sm & hm).sum()),
        'countsMatch': [int(sm.sum()), int(clone.sum()), int(gm.sum())] == [part['exactSourcePixels'],part['clonedHiddenPixels'],part['generatedHiddenPixels']],
    }
    results.append(result)
report = {'sourceSha256': source_sha, 'parts': results,
          'method': 'Independent RGBA comparison and reconstruction from declared masks and clone samples; no extraction script rerun and no product writes.'}
(Path(__file__).parent / 'provenance-result.json').write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps(report, ensure_ascii=False, indent=2))
