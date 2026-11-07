import json
from pathlib import Path
from runpy import run_path


ROOT = Path(__file__).resolve().parent
BEFORE = ROOT.parent / 'correction-bffca723'
prior = run_path(str(BEFORE / 'inspect-recordings.py'))
prior['frame'].__globals__['TEMP'] = ROOT / '.tmp/frames'
old_times = prior['read'](BEFORE / 'evidence/video-timestamps.json')
windows = (
    (2.88, 2.92, 2.96, 3.00),
    (3.12, 3.16, 3.20, 3.24),
    (3.32, 3.44, 3.56, 3.72),
    (3.84, 4.08, 4.24, 4.52),
)
mapping = {}
for size in ('desktop', 'mobile360'):
    crop, _, focus_crop, scale = prior['SIZES'][size]
    before = BEFORE / 'evidence/normal' / size / 'normal-speed.mp4'
    after = ROOT / 'evidence' / size / 'normal-speed.mp4'
    before_start = old_times['viewports'][size]['normalUiEventSecondsApprox']['firstInput']
    after_start = prior['focus_onset'](after, focus_crop)
    timeline = {'bffca723': [], 'af9a1baa': []}
    rows = []
    for window in windows:
        for label, source, start in (('bffca723', before, before_start), ('af9a1baa', after, after_start)):
            times = [prior['at'](start + elapsed) for elapsed in window]
            timeline[label].append(times)
            rows.append((label, [(source, time) for time in times]))
    prior['sheet'](ROOT / 'evidence' / f'compare-rollout-{size}.png', rows, crop, scale)
    mapping[size] = {'firstFocusBefore': before_start, 'firstFocusAfter': after_start, 'sheetRowsSeconds': timeline}

(ROOT / 'evidence/video-timestamps.json').write_text(json.dumps({
    'method': '25 fps video seek timestamps aligned to the first visible gold focus outline. No screenshots or hooks during capture.',
    'viewports': mapping,
}, indent=2) + '\n', encoding='utf-8')
