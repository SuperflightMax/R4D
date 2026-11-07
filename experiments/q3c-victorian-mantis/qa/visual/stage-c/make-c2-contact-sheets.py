import json
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


root = Path(__file__).resolve().parent / 'evidence'
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 16)


def sheet(size, name, shots, crop):
    source = root / 'normal' / size
    observations = json.loads((source / 'observations.json').read_text(encoding='utf-8-sig'))
    by_name = {shot['name']: shot for shot in observations['shots']}
    tile_width, tile_height = crop[2] - crop[0], crop[3] - crop[1]
    columns = 3
    rows = (len(shots) + columns - 1) // columns
    result = Image.new('RGB', (tile_width * columns, (tile_height + 29) * rows), '#ece8df')
    draw = ImageDraw.Draw(result)
    for index, shot_name in enumerate(shots):
        x, y = (index % columns) * tile_width, (index // columns) * (tile_height + 29)
        shot = by_name[shot_name]
        start, end = shot['frameTimeBracket']
        frame = Image.open(source / f'{shot_name}.png').convert('RGB').crop(crop)
        result.paste(frame, (x, y + 29))
        draw.text((x + 6, y + 5), f'{shot_name} | {start:.2f}-{end:.2f} s', font=font, fill='#16282b')
    result.save(root / f'{name}-{size}.png')


intro = ['leg-intro-1', 'leg-intro-2', 'leg-intro-3', 'leg-plant', 'eye-hatch-intro', 'K0-capsule']
transform = ['K0-capsule', 'K1', 'K2', 'K3', 'K4', 'K5-mantis']
idles = ['K0-capsule', 'capsule-idle-a', 'capsule-idle-b', 'K5-mantis', 'mantis-idle-a', 'mantis-idle-b']
sheet('desktop', 'intro', intro, (430, 551, 945, 801))
sheet('mobile360', 'intro', intro, (47, 430, 294, 570))
sheet('desktop', 'transform', transform, (430, 260, 945, 801))
sheet('mobile360', 'transform', transform, (47, 295, 294, 570))
sheet('desktop', 'idles', idles, (430, 260, 945, 801))
