import json
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
EVIDENCE = ROOT / 'evidence'
FRAME = (354, 320)
CONTROL = ROOT / 'reference/control.png'
PACKAGES = ('02-P/first', '02-P/refined-v5', '02-R/flower-locked')
R_FIRST = '02-R/first'
FONT = 'C:/Windows/Fonts/segoeui.ttf'


def verify_package(name):
    folder = ROOT / name
    manifest = json.loads((folder / 'manifest.json').read_text(encoding='utf-8'))
    assert manifest['frame_size_wh'] == list(FRAME)
    assert manifest['crop_source_ltrb'] == [48, 912, 402, 1232]
    layers = {}
    for key, entry in manifest['layers'].items():
        layer = Image.open(folder / entry['path']).convert('RGBA')
        x, y, right, bottom = entry['bbox_crop_ltrb']
        assert layer.size == (right - x, bottom - y)
        assert entry['position_crop_xy'] == [x, y]
        assert entry['bbox_source_ltrb'] == [x + 48, y + 912, right + 48, bottom + 912]
        px, py = entry['pivot_texture_xy']
        assert entry['pivot_crop_xy'] == [x + px, y + py]
        layers[key] = (layer, (x, y))

    def assemble(dx=0, hide_leaf=False, bronze=False):
        canvas = Image.new('RGBA', FRAME)
        for key in manifest['layer_order_back_to_front']:
            if hide_leaf and key == 'monstera':
                continue
            layer, (x, y) = layers['serpent-bronze' if bronze and key == 'serpent' else key]
            if key == 'monstera':
                x += dx
            assert 0 <= x and x + layer.width <= FRAME[0]
            assert 0 <= y and y + layer.height <= FRAME[1]
            canvas.alpha_composite(layer, (x, y))
        return canvas.convert('RGB')

    states = {'rest': assemble(), 'reveal-left14': assemble(-14),
              'leaf-hidden': assemble(hide_leaf=True), 'bronze': assemble(bronze=True)}
    for key, frame in states.items():
        with Image.open(folder / 'views' / f'{key}.png') as stored:
            assert stored.tobytes() == frame.tobytes(), (name, key)
    assemble(-7)

    head, head_xy = layers['serpent']
    bronze, bronze_xy = layers['serpent-bronze']
    assert head_xy == bronze_xy and head.size == bronze.size
    assert head.getchannel('A').tobytes() == bronze.getchannel('A').tobytes()
    rest_rgb, bronze_rgb = (np.asarray(states[key]) for key in ('rest', 'bronze'))
    changed = np.any(rest_rgb != bronze_rgb, axis=2)
    eye = np.asarray(Image.open(folder / 'masks/bronze-ring.png'))
    assert changed.any() and not (changed & (eye == 0)).any()

    observed = {}
    control = np.asarray(Image.open(CONTROL))
    for key in ('serpent', 'monstera'):
        sprite, xy = layers[key]
        full = Image.new('RGBA', FRAME)
        full.paste(sprite, xy)
        array = np.asarray(full)
        alpha = array[..., 3]
        assert np.array_equal(alpha, np.asarray(Image.open(folder / 'masks' / f'{key}.png')))
        opaque = alpha == 255
        same = np.all(array[..., :3] == control, axis=2)
        observed[key] = {'opaque_px': int(opaque.sum()), 'opaque_rgb_matching_control_px': int((same & opaque).sum())}
        if name.startswith('02-P'):
            assert not (opaque & ~same).any(), (name, key)

    result = {'recomposed_frames_match': list(states), 'verified_dx_px': [-14, -7, 0],
              'bronze_same_alpha': True, 'bronze_changed_pixels': int(changed.sum()),
              'bronze_outside_mask_px': 0, 'observed_opaque_rgb': observed}
    protect = folder / 'masks/protected-flower.png'
    if protect.is_file():
        protected = np.asarray(Image.open(protect)) != 0
        reveal = np.asarray(states['reveal-left14'])
        result['flower_changed_px_at_dx_minus14'] = int(np.count_nonzero(np.any(rest_rgb != reveal, axis=2) & protected))
        assert result['flower_changed_px_at_dx_minus14'] == 0, name
    return result


def add_text(canvas, xy, caption, size=17, fill='#dae4ee'):
    ImageDraw.Draw(canvas).text(xy, caption, font=ImageFont.truetype(FONT, size), fill=fill)


def make_contact_sheet():
    gutter, pitch = 15, FRAME[0] + 15
    row_pitch = FRAME[1] + 34
    canvas = Image.new('RGB', (3 * pitch + gutter, 3 * row_pitch + 88), '#15202a')
    add_text(canvas, (gutter, 12), 'ART-02  /  Jungle  /  354×320 px  /  1:1', 27)
    add_text(canvas, (gutter, 50), 'Одинаковая рамка. В раскрытии крупный лист сдвинут на 14 px влево.', 16, '#a5bccf')
    panels = [
        [('Оригинал', CONTROL), ('02-P / уточнённая сборка', ROOT / PACKAGES[1] / 'views/rest.png'),
         ('02-R / воссозданные слои', ROOT / PACKAGES[2] / 'views/rest.png')],
        [(f'{label} / сдвиг −14 px', ROOT / package / 'views/reveal-left14.png')
         for label, package in zip(('02-P первый', '02-P уточнённый', '02-R'), PACKAGES)],
        [(f'{label} / лист скрыт', ROOT / package / 'views/leaf-hidden.png')
         for label, package in zip(('02-P первый', '02-P уточнённый', '02-R'), PACKAGES)],
    ]
    for row, items in enumerate(panels):
        for col, (label, path) in enumerate(items):
            x, y = gutter + col * pitch, 76 + row * row_pitch
            add_text(canvas, (x, y), label)
            canvas.paste(Image.open(path).convert('RGB'), (x, y + 26))
    canvas.save(EVIDENCE / 'comparison-1to1.png')


def make_eye_sheet():
    cell_size = (220, 176)
    canvas = Image.new('RGB', (2 * cell_size[0] + 45, 2 * (cell_size[1] + 34) + 52), '#15202a')
    add_text(canvas, (15, 10), 'Правка внешнего кольца глаза  /  4×', 24)
    for row, package in enumerate(PACKAGES[1:]):
        for col, state in enumerate(('rest', 'bronze')):
            x, y = 15 + col * (cell_size[0] + 15), 49 + row * (cell_size[1] + 34)
            add_text(canvas, (x, y), f'{package[:4]} / {"исходное" if col == 0 else "бронзовая патина"}')
            frame = Image.open(ROOT / package / 'views' / f'{state}.png')
            eye = frame.crop((234, 84, 289, 128)).resize(cell_size, Image.Resampling.NEAREST)
            canvas.paste(eye, (x, y + 26))
    canvas.save(EVIDENCE / 'bronze-detail-4x.png')


def make_alpha_sheet():
    canvas = Image.new('RGB', (1461, 1135), '#15202a')
    add_text(canvas, (15, 10), 'Отдельные PNG-слои на трёх подложках  /  1:1', 26)
    backgrounds = (('белая', '#ffffff'), ('чёрная', '#000000'), ('контрастная', '#ad63a1'))
    for row, (label, color) in enumerate(backgrounds):
        for col, package in enumerate(PACKAGES[1:]):
            x, y = 15 + col * 723, 54 + row * 353
            add_text(canvas, (x, y), f'{package[:4]} / {label}')
            folder = ROOT / package
            manifest = json.loads((folder / 'manifest.json').read_text(encoding='utf-8'))
            swatch = Image.new('RGBA', (708, 320), color)
            for key in ('serpent', 'monstera', 'flower'):
                entry = manifest['layers'][key]
                layer = Image.open(folder / entry['path']).convert('RGBA')
                left, top = entry['position_crop_xy']
                if key == 'monstera':
                    left += 354
                if key == 'flower':
                    left, top = 55, 227
                swatch.alpha_composite(layer, (left, top))
            add_text(swatch, (28, 203), 'Неподвижный цветок', 14,
                     '#cfd6df' if label == 'чёрная' else '#292733')
            canvas.paste(swatch.convert('RGB'), (x, y + 26))
    canvas.save(EVIDENCE / 'alpha-boards-1to1.png')


if __name__ == '__main__':
    EVIDENCE.mkdir(exist_ok=True)
    audit = {name: verify_package(name) for name in (*PACKAGES, R_FIRST)}
    (EVIDENCE / 'assembly-audit.json').write_text(json.dumps(audit, indent=2) + '\n', encoding='utf-8')
    make_contact_sheet()
    make_eye_sheet()
    make_alpha_sheet()
    print(json.dumps(audit, indent=2))
