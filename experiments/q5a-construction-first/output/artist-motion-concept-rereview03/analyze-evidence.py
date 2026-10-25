import json
from pathlib import Path
from PIL import Image, ImageDraw

BASE = Path(__file__).resolve().parent

def read(name):
    return json.loads((BASE / name).read_text(encoding='utf-8-sig'))

result = {'candidate': 'Q5A-NELA-ASSEMBLY-03', 'base': '101343caa68579aacd5e6c01b94206680c364ab7', 'devices': {}}
for device in ['desktop', 'mobile']:
    witness = read(f'{device}-witness.json')
    old = json.loads((BASE.parent / 'artist-motion-concept' / f'repro-{device}.json').read_text(encoding='utf-8-sig'))
    exact = [r for r in witness['rows'] if r['tick'] == witness['expectedWitness']]
    two = next(r for r in exact if r['label'] == '2x-light')
    one = next(r for r in exact if r['label'] == '1x-light')
    deltas = [abs(v - two['landmarks'][k][i]) for k, values in old['state']['pose'].items() for i, v in enumerate(values)]
    step = read(f'{device}-step.json')
    realtime = read(f'{device}-realtime.json')
    runs = []
    for run in step['runs']:
        rows = run['rows']
        ys = [r['framing']['origin'][1] for r in rows]
        runs.append({'start': run['state'], 'sampleCount': len(rows), 'visualCaptures': len(run['captures']),
                     'phases': sorted(set(r['phase'] for r in rows)),
                     'minimumMargin': min(v for r in rows for v in r['framing']['margins'].values()),
                     'scales': sorted(set(r['framing']['scale'] for r in rows)),
                     'originYRange': [min(ys), max(ys)],
                     'maximumOriginYDeltaPer1Over60': max(abs(a-b) for a,b in zip(ys,ys[1:])),
                     'endPhase': rows[-1]['phase'], 'endTarget': rows[-1]['target']})
    result['devices'][device] = {'environment': witness['environment'], 'initialTick': witness['initialTick'],
        'seed': witness['seed'], 'witnessTick': two['tick'], 'witnessTime': two['t'],
        'witnessElapsed': two['elapsed'], 'oldWitnessTick': old['state']['tick'],
        'landmarkCount': len(two['landmarks']), 'oldNewMaximumLandmarkDelta': max(deltas),
        'allWitnessControlModesSamePose': all(r['landmarks'] == two['landmarks'] for r in exact),
        'twoXMargins': two['framing']['margins'], 'twoXScale': two['framing']['scale'],
        'cssMagnificationOverOneX': (two['canvas']['width']/two['framing']['width']*two['framing']['scale']) / (one['canvas']['width']/one['framing']['width']*one['framing']['scale']),
        'witnessNeighbors': [r['tick'] for r in witness['rows'] if r['label'] == '2x-light'],
        'stepRuns': runs,
        'realtimeRuns': [{'start': r['state'], 'captureCount': len(r['rows']), 'phases': sorted(set(x['phase'] for x in r['rows'])),
                          'minimumMargin': min(v for x in r['rows'] for v in x['framing']['margins'].values())} for r in realtime['runs']]}
    neighbors = [r for r in witness['rows'] if r['label'] == '2x-light']
    sheet = Image.new('RGB', (1680, 1100), '#e8eeee')
    draw = ImageDraw.Draw(sheet)
    for n, row in enumerate(neighbors):
        im = Image.open(BASE / row['file']).convert('RGB')
        im.thumbnail((410, 510))
        x, y = (n%4)*420, (n//4)*550
        draw.text((x+5, y+5), row['file'], fill='#173737')
        sheet.paste(im, (x+(420-im.width)//2, y+30))
    sheet.save(BASE / f'{device}-witness-neighbors-sheet.jpg', quality=93)

(BASE/'observations.json').write_text(json.dumps(result, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
print(json.dumps(result, ensure_ascii=True))
