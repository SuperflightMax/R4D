import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
EVIDENCE = ROOT / 'evidence'
BEFORE = ROOT.parent / 'correction-3be9dbf1/evidence'
TEMP = ROOT / '.tmp/frames'
FFMPEG = ROOT.parents[1] / '.cache/browsers/ffmpeg-1013/ffmpeg-win64.exe'
FONT = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 15)
SIZES = {
    'desktop': ((410, 481, 960, 798), (595, 255, 945, 548), (50, 122, 56, 146), .58),
    'mobile390': ((46, 478, 330, 659), (134, 365, 325, 553), (3, 102, 9, 125), 1),
    'mobile360': ((39, 400, 302, 568), (126, 288, 299, 440), (3, 102, 9, 125), 1),
}
OVERVIEW = {
    'desktop': ((410, 267, 950, 810), .46),
    'mobile390': ((51, 367, 318, 655), .95),
    'mobile360': ((48, 296, 298, 564), 1),
}


def read(path):
    return json.loads(path.read_text(encoding='utf-8-sig'))


def at(time):
    return round(round(time * 25) / 25, 2)


def frame(source, time):
    route = source.parent.relative_to(ROOT.parent)
    cache = TEMP / route
    cache.mkdir(parents=True, exist_ok=True)
    path = cache / f'{time:.2f}.png'
    if not path.exists():
        subprocess.run([str(FFMPEG), '-hide_banner', '-loglevel', 'error',
                        '-ss', f'{time:.2f}', '-i', str(source), '-frames:v', '1', str(path)], check=True)
    return Image.open(path).convert('RGB')


def focus_onset(source, crop):
    def outline(tick):
        pixels = frame(source, tick / 25).crop(crop).get_flattened_data()
        return sum(r > 144 and g > 109 and b < 135 for r, g, b in pixels) > 6

    coarse = next(tick for tick in range(0, 101, 5) if outline(tick))
    return next(tick for tick in range(max(0, coarse - 4), coarse + 1) if outline(tick)) / 25


def sheet(path, rows, crop, scale=1):
    width = round((crop[2] - crop[0]) * scale)
    height = round((crop[3] - crop[1]) * scale)
    cols = max(len(items) for _, items in rows)
    result = Image.new('RGB', (width * cols, (height + 24) * len(rows)), '#e5dfd0')
    draw = ImageDraw.Draw(result)
    for row, (label, items) in enumerate(rows):
        for col, (source, time) in enumerate(items):
            x, y = col * width, row * (height + 24)
            cut = frame(source, time).crop(crop)
            if scale != 1:
                cut = cut.resize((width, height), Image.Resampling.LANCZOS)
            result.paste(cut, (x, y + 24))
            name = label[col] if isinstance(label, tuple) else label
            draw.text((x + 4, y + 3), f'{name} | {time:.2f} s', font=FONT, fill='#18282b')
    result.save(path)


def paired(path, before, after, times_before, times_after, crop, scale):
    rows = []
    for start in range(0, len(times_after), 4):
        rows.append(('3be9dbf1', [(before, t) for t in times_before[start:start + 4]]))
        rows.append(('bffca723', [(after, t) for t in times_after[start:start + 4]]))
    sheet(path, rows, crop, scale)


def event_times(source, crop):
    focus = focus_onset(source, crop)
    obs = read(source.with_name('observations.json'))
    start = obs['events']['firstInputMs']
    return {name.removesuffix('Ms'): at(focus + (value - start) / 1000) for name, value in obs['events'].items()}


def overview_rows(source, events, reduced=False):
    first, unfold, mantis = (events[key] for key in ('firstInput', 'unfold', 'mantis'))
    if reduced:
        phases = (
            ('K0', events['capsule'] + .20), ('K2', unfold + 1.72),
            ('K5', mantis + .32), ('Маячок повторно', events['repeat'] + .16),
        )
    else:
        phases = (
            ('Удар', first + 1.56), ('Выход глаза', first + 5.40),
            ('K0', events['capsule'] + .20), ('K0 idle', events['capsule'] + 5.84),
            ('K1', unfold + .86), ('K2', unfold + 1.72),
            ('K3', unfold + 2.52), ('K4', unfold + 3.24),
            ('K5', mantis + .24), ('K5 idle', mantis + 5.52),
            ('Ожидание', events['restart'] + .32), ('Маячок повторно', events['repeat'] + .16),
        )
    return [(tuple(name for name, _ in phases[i:i + 4]), [(source, at(t)) for _, t in phases[i:i + 4]])
            for i in range(0, len(phases), 4)]


def main():
    old = read(BEFORE / 'video-timestamps.json')
    mapping = {}
    for size, (leg_crop, chest_crop, focus_crop, scale) in SIZES.items():
        after = EVIDENCE / 'normal' / size / 'normal-speed.mp4'
        reduced = EVIDENCE / 'reduced' / size / 'reduced-preference.mp4'
        before = (BEFORE / 'uninterrupted/desktop/normal-speed.mp4' if size == 'desktop'
                  else BEFORE / 'normal' / size / 'normal-speed.mp4')
        old_timing = (old['uninterruptedDesktop'] if size == 'desktop'
                      else old['viewports'][size]['3be9dbf1'])
        old_focus = old_timing['firstVisibleStageFocusSeconds']
        old_unfold = old_timing['unfoldApproxVideoSeconds']
        new = event_times(after, focus_crop)
        reduced_times = event_times(reduced, focus_crop)
        # Keep times aligned to input. The old mobile captures include screenshot calls.
        leg_offsets = (2.60, 2.84, 3.12, 3.36, 3.55, 3.74, 4.02, 4.30, 4.46, 4.64, 4.80, 5.02)
        chest_offsets = (2.75, 2.98, 3.10, 3.32, 3.55, 3.80, 4.08, 4.40)
        old_legs = [at(old_focus + t) for t in leg_offsets]
        new_legs = [at(new['firstInput'] + t) for t in leg_offsets]
        old_chest = [at(old_unfold + t) for t in chest_offsets]
        new_chest = [at(new['unfold'] + t) for t in chest_offsets]
        paired(EVIDENCE / f'compare-landing-{size}.png', before, after,
               old_legs, new_legs, leg_crop, scale)
        paired(EVIDENCE / f'compare-chest-{size}.png', before, after,
               old_chest, new_chest, chest_crop, .78 if size == 'desktop' else 1)
        overview_crop, overview_scale = OVERVIEW[size]
        overview = EVIDENCE if size == 'mobile360' else ROOT / '.tmp'
        sheet(overview / f'journey-{size}.png',
              overview_rows(after, new) + overview_rows(reduced, reduced_times, True),
              overview_crop, overview_scale)
        contact_times = [at(new['firstInput'] + t) for t in (3.76, 3.88, 4, 4.12, 4.24, 4.36, 4.48, 4.60)]
        if size == 'mobile360':
            sheet(EVIDENCE / 'contact-detail-mobile360.png',
                  [('1x', [(after, t) for t in contact_times[i:i + 4]]) for i in (0, 4)], leg_crop, scale)
            frame(after, at(new['mantis'] + .64)).save(EVIDENCE / 'normal-k5-full-mobile360.png')
        mapping[size] = {
            'previousRecording': before.relative_to(ROOT.parent).as_posix(),
            'previousLandingSheetSeconds': old_legs, 'previousChestSheetSeconds': old_chest,
            'normalUiEventSecondsApprox': new, 'reducedUiEventSecondsApprox': reduced_times,
            'landingSheetSeconds': new_legs, 'chestSheetSeconds': new_chest,
            'contactDetailSeconds': contact_times,
        }
    (EVIDENCE / 'video-timestamps.json').write_text(json.dumps({
        'method': '25 fps source seek timestamps on 40 ms grid; UI events align by first gold focus outline and recorded input wall clock. Events marked approximate.',
        'viewports': mapping,
    }, indent=2) + '\n', encoding='utf-8')


if __name__ == '__main__':
    main()
