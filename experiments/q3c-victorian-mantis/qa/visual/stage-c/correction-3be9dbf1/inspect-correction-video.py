import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parent
FFMPEG = ROOT.parents[1] / '.cache/browsers/ffmpeg-1013/ffmpeg-win64.exe'
TEMP = ROOT / '.tmp/video-frames'
FONT = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 15)
SIZES = {
    'mobile360': ((46, 414, 298, 562), (134, 291, 295, 438), (3, 102, 9, 125)),
    'mobile390': ((54, 500, 326, 676), (141, 361, 321, 551), (3, 102, 9, 125)),
    'desktop': ((420, 495, 945, 796), (613, 255, 935, 535), (50, 122, 56, 146)),
}


def frame(source, time):
    cache = TEMP / source.parents[3].name / source.parents[1].name / source.parent.name
    cache.mkdir(parents=True, exist_ok=True)
    path = cache / f'{time:.2f}.png'
    if not path.exists():
        subprocess.run(
            [str(FFMPEG), '-hide_banner', '-loglevel', 'error', '-ss', f'{time:.2f}',
             '-i', str(source), '-frames:v', '1', str(path)], check=True
        )
    return Image.open(path).convert('RGB')


def first_focus(source, crop):
    def outline(time):
        pixels = frame(source, time).crop(crop).get_flattened_data()
        return sum(r > 144 and g > 109 and b < 135 for r, g, b in pixels) > 6

    coarse = next(tick for tick in range(0, 101, 5) if outline(tick / 25))
    return next(tick for tick in range(max(0, coarse - 4), coarse + 1) if outline(tick / 25)) / 25


def montage(name, rows, crop, scale=1):
    width = round((crop[2] - crop[0]) * scale)
    height = round((crop[3] - crop[1]) * scale)
    result = Image.new('RGB', (width * max(len(entries) for _, entries in rows), (height + 24) * len(rows)), '#e5dfd0')
    draw = ImageDraw.Draw(result)
    for row, (label, entries) in enumerate(rows):
        for column, (source, time) in enumerate(entries):
            x, y = column * width, row * (height + 24)
            cut = frame(source, time).crop(crop)
            if scale != 1:
                cut = cut.resize((width, height), Image.Resampling.LANCZOS)
            result.paste(cut, (x, y + 24))
            draw.text((x + 4, y + 3), f'{label} | {time:.2f} s', font=FONT, fill='#18282b')
    result.save(ROOT / 'evidence' / name)


mapping = {}
for size, (leg_crop, chest_crop, focus_crop) in SIZES.items():
    rows = {}
    mapping[size] = {}
    for label, evidence in [('54d683f5', ROOT.parent / 'evidence'), ('3be9dbf1', ROOT / 'evidence')]:
        source = evidence / 'normal' / size / 'normal-speed.mp4'
        observed = json.loads(source.with_name('observations.json').read_text(encoding='utf-8-sig'))
        first, unfold, restart, _ = observed['interactions']
        first_video = first_focus(source, focus_crop)
        unfold_video = first_video + (unfold['wallAfterMs'] - first['wallAfterMs']) / 1000
        restart_video = first_video + (restart['wallAfterMs'] - first['wallAfterMs']) / 1000
        legs = [round(first_video + time, 2) for time in (2.54, 2.82, 3.08, 3.31, 3.55, 3.77, 4.05, 4.26)]
        chest = [round(unfold_video + time, 2) for time in (2.75, 2.98, 3.10, 3.32, 3.55, 3.8, 4.08, 4.32)]
        mapping[size][label] = {
            'video': str(source.relative_to(evidence)).replace('\\', '/'),
            'firstVisibleStageFocusSeconds': first_video,
            'unfoldApproxVideoSeconds': round(unfold_video, 3),
            'restartApproxVideoSeconds': round(restart_video, 3),
            'legSheetVideoTimestamps': legs,
            'chestSheetVideoTimestamps': chest,
        }
        rows[label] = (source, legs, chest)
    for title, crop, index in [('leg-intro', leg_crop, 1), ('chest-k4-k5', chest_crop, 2)]:
        if title == 'leg-intro' and size == 'desktop':
            continue
        montage(
            f'compare-{title}-{size}.png',
            [(label, [(data[0], t) for t in data[index][start:start + 4]])
             for start in (0, 4) for label, data in rows.items()],
            crop, .75 if size == 'desktop' else 1,
        )

    if size == 'mobile360':
        correction = mapping[size]['3be9dbf1']
        start = correction['firstVisibleStageFocusSeconds']
        loading = [round(round((start + t) * 25) / 25, 2)
                   for t in (2.60, 2.84, 3.12, 3.36, 3.55, 3.74, 4.02, 4.30)]
        source = rows['3be9dbf1'][0]
        montage(
            'loading-and-foot-slide-mobile360.png',
            [('3be9dbf1', [(source, time) for time in loading[index:index + 4]])
             for index in (0, 4)],
            leg_crop,
        )
        correction['loadingSheetVideoTimestamps'] = loading

control = ROOT / 'evidence/uninterrupted/desktop/normal-speed.mp4'
control_obs = json.loads(control.with_name('observations.json').read_text(encoding='utf-8-sig'))
control_focus = first_focus(control, SIZES['desktop'][2])
control_times = [round(round((control_focus + t) * 25) / 25, 2)
                 for t in (2.60, 2.84, 3.12, 3.36, 3.55, 3.74, 4.02, 4.30)]
montage(
    'loading-and-foot-slide-desktop.png',
    [('Контроль 1×', [(control, time) for time in control_times[index:index + 4]])
     for index in (0, 4)],
    SIZES['desktop'][0], .65,
)

(ROOT / 'evidence/video-timestamps.json').write_text(json.dumps({
    'method': '25 fps recordings. First visible focus is detected from the gold outline. '
              'Transform and restart offsets use observed user-input wall time. '
              'Sheet labels are clip seek timestamps; the first decoded frame may be up to 40 ms later.',
    'viewports': mapping,
    'uninterruptedDesktop': {
        'video': 'uninterrupted/desktop/normal-speed.mp4',
        'firstVisibleStageFocusSeconds': control_focus,
        'unfoldApproxVideoSeconds': round(control_focus + (control_obs['events']['unfoldMs'] - control_obs['events']['firstInputMs']) / 1000, 3),
        'loadingSheetVideoTimestamps': control_times,
    },
}, indent=2) + '\n', encoding='utf-8')
