from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import subprocess

root = Path(__file__).resolve().parent
out = root / 'output/playwright'
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 17)

def sheet(name, paths, crop, columns=3):
    width, height = crop[2] - crop[0], crop[3] - crop[1]
    result = Image.new('RGB', (width * columns, (height + 32) * ((len(paths) + columns - 1) // columns)), '#ece8df')
    draw = ImageDraw.Draw(result)
    for index, (path, label) in enumerate(paths):
        x, y = (index % columns) * width, (index // columns) * (height + 32)
        result.paste(Image.open(path).convert('RGB').crop(crop), (x, y + 32))
        draw.text((x + 8, y + 6), label, font=font, fill='#182e31')
    result.save(out / name)

sheet('leg-opening-contact.png', [(out / 'desktop' / f'live-{t}.png', f'live target {t.replace("_", ".")} s; 1x') for t in ['2_7', '3_05', '3_3', '3_65', '4_1', '4_65']], (490, 390, 960, 775))
sheet('eye-and-idle-contact.png', [(out / 'desktop' / f'live-{t}.png', f'live target {t.replace("_", ".")} s; 1x') for t in ['4_65', '4_95', '5_3', '6_2', '8_2', '10_2']], (540, 380, 910, 755))

ffmpeg = root / '.cache/browsers/ffmpeg-1013/ffmpeg-win64.exe'
frames = root / '.tmp/video-frames'
frames.mkdir(parents=True, exist_ok=True)
paths = []
for index, time in enumerate([3.4, 3.6, 3.8, 4.0, 4.2, 4.4, 4.6, 4.8, 5.0]):
    path = frames / f'legs-{index:02}.png'
    subprocess.run([str(ffmpeg), '-hide_banner', '-loglevel', 'error', '-y', '-ss', str(time), '-i', str(out / 'desktop/normal-speed.mp4'), '-frames:v', '1', str(path)], check=True)
    paths.append((path, f'original video {time:.1f} s; 25 fps / 1x'))
sheet('video-legs-contact.png', paths, (490, 390, 960, 775))

print('Created three analytical contact sheets; crops use identical coordinates within each sheet.')
