from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parent / 'output/recheck-vq01'
font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 17)
targets = ['0_55', '0_7', '0_85', '1_05', '1_25', '1_5']
for width, height in [(390, 844), (360, 732)]:
    source = root / f'mobile{width}'
    crop = (0, 90, width, height - 130)
    tile_height = crop[3] - crop[1]
    sheet = Image.new('RGB', (width * 3, (tile_height + 30) * 2), '#ece8df')
    draw = ImageDraw.Draw(sheet)
    for index, target in enumerate(targets):
        x, y = index % 3 * width, index // 3 * (tile_height + 30)
        sheet.paste(Image.open(source / f'entry-{target}.png').convert('RGB').crop(crop), (x, y + 30))
        draw.text((x + 7, y + 5), f'live target {target.replace("_", ".")} s; 1x', font=font, fill='#182e31')
    sheet.save(root / f'entry-contact-{width}.png')
print('Created two entry contact sheets with identical crops per viewport.')
