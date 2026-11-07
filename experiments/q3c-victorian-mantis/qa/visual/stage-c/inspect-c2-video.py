import json
import subprocess
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


root = Path(__file__).resolve().parent
source = root / 'evidence/normal/mobile360'
video = source / 'normal-speed.mp4'
ffmpeg = root.parent / '.cache/browsers/ffmpeg-1013/ffmpeg-win64.exe'
temp = root / '.tmp/video-inspection'
temp.mkdir(parents=True, exist_ok=True)
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 16)


def frame(time):
    path = temp / f'mobile360-{time:.3f}.png'
    subprocess.run([str(ffmpeg), '-hide_banner', '-loglevel', 'error', '-y', '-ss', f'{time:.3f}', '-i', str(video), '-frames:v', '1', str(path)], check=True)
    return Image.open(path).convert('RGB')


def gold_outline(img):
    pixels = img.crop((3, 90, 14, 107)).getdata()
    return sum(r > 145 and g > 115 and b < 145 for r, g, b in pixels) > 6


coarse = next(time / 10 for time in range(2, 35, 2) if gold_outline(frame(time / 10)))
first_focus = next(time for time in [coarse - 0.2 + n * 0.04 for n in range(6)] if gold_outline(frame(time)))
observations = json.loads((source / 'observations.json').read_text(encoding='utf-8-sig'))
events = {event['name']: event for event in observations['interactions']}
unfold = first_focus + (events['tap Раскрыться']['wallAfterMs'] - events['first scene input']['wallAfterMs']) / 1000


def sheet(name, timestamps, crop):
    width, height = crop[2] - crop[0], crop[3] - crop[1]
    result = Image.new('RGB', (width * 3, (height + 28) * 2), '#ece8df')
    draw = ImageDraw.Draw(result)
    for index, time in enumerate(timestamps):
        x, y = index % 3 * width, index // 3 * (height + 28)
        result.paste(frame(time).crop(crop), (x, y + 28))
        draw.text((x + 6, y + 4), f'1x clip | {time:.2f} s', font=font, fill='#18282b')
    result.save(root / 'evidence' / f'{name}.png')


legs = [first_focus + t for t in (2.82, 3.08, 3.31, 3.55, 3.77, 4.05)]
blades = [unfold + t for t in (2.43, 2.55, 2.65, 2.76, 3.10, 4.25)]
sheet('video-leg-intro-mobile360', legs, (47, 430, 294, 570))
sheet('video-sickle-overlap-mobile360', blades, (174, 296, 300, 478))
mapping = {
    'video': 'normal/mobile360/normal-speed.mp4',
    'firstVisibleStageFocusSeconds': first_focus,
    'unfoldApproxVideoSeconds': unfold,
    'method': 'gold focus outline in clip; unfold offset estimated from actual touch wall clock',
    'legSheetVideoTimestamps': legs,
    'bladeSheetVideoTimestamps': blades,
}
(root / 'evidence/video-timestamps.json').write_text(json.dumps(mapping, indent=2) + '\n', encoding='utf-8')
print(json.dumps(mapping))
