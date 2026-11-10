import argparse
import json
from pathlib import Path
from time import perf_counter

import cv2
import numpy as np
from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
CROP = (48, 912, 402, 1232)
SIZE = (354, 320)
SOURCE = Path('K:/Agents/R4D/Assets/perspective/01-jungle.jpg')
CONTROL = ROOT / 'reference/control.png'
SOURCE_SHA256 = 'c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72'
DEMO_SHIFT = (-14, 0)

# Contours traced in crop coordinates. The indentations are visible openings.
P_LEAF = [
    (130, 143), (139, 138), (150, 140), (158, 148), (164, 157),
    (170, 168), (172, 180), (166, 172), (153, 166), (142, 165),
    (131, 166), (131, 169), (144, 171), (158, 178), (168, 187),
    (171, 199), (167, 211), (161, 222), (150, 228), (149, 217),
    (145, 207), (139, 199), (132, 193), (121, 185), (117, 186),
    (120, 191), (132, 204), (140, 217), (143, 230), (137, 244),
    (128, 254), (114, 264), (115, 248), (113, 232), (107, 217),
    (100, 208), (96, 208), (96, 211), (102, 224), (107, 245),
    (107, 264), (100, 275), (88, 284), (78, 290), (71, 302),
    (65, 295), (59, 286), (59, 274), (56, 263), (54, 274),
    (50, 267), (49, 256), (51, 245), (55, 235), (62, 224),
    (65, 216), (58, 220), (50, 231), (44, 242), (40, 255),
    (35, 251), (31, 239), (31, 225), (37, 213), (47, 203),
    (61, 193), (64, 188), (56, 190), (46, 198), (34, 207),
    (24, 220), (20, 224), (19, 211), (21, 200), (25, 190),
    (33, 181), (44, 175), (57, 170), (71, 167), (77, 164),
    (70, 162), (58, 164), (43, 170), (26, 182), (28, 173),
    (36, 163), (48, 157), (63, 153), (76, 151), (88, 153),
    (99, 158), (105, 159), (114, 154), (122, 146),
]
P_LEAF_HOLES = [
    [(69, 188), (71, 185), (74, 185), (76, 188), (74, 193), (71, 196), (69, 194)],
    [(81, 179), (83, 177), (86, 178), (86, 181), (83, 183), (81, 182)],
    [(72, 212), (74, 209), (77, 209), (77, 213), (74, 216), (72, 215)],
    [(103, 194), (106, 192), (109, 194), (110, 198), (107, 198), (104, 197)],
]
P_SERPENT = [
    (168, 37), (174, 32), (182, 33), (189, 40), (191, 54),
    (199, 63), (210, 68), (222, 69), (237, 70), (254, 73),
    (269, 76), (281, 81), (291, 91), (297, 102), (304, 112),
    (309, 121), (311, 131), (308, 141), (303, 149), (295, 156),
    (286, 160), (275, 161), (264, 158), (253, 155), (241, 148),
    (229, 142), (215, 138), (204, 135), (194, 135), (181, 131),
    (170, 126), (160, 122), (153, 116), (154, 111), (164, 109),
    (158, 104), (151, 97), (149, 90), (146, 81), (145, 71),
    (144, 62), (146, 59), (153, 64), (161, 71), (169, 76),
    (169, 69), (166, 59), (165, 49),
]
P_EYE_OUTER = [
    (245, 97), (249, 93), (254, 90), (260, 90), (267, 93),
    (273, 99), (277, 106), (278, 113), (275, 118), (270, 121),
    (263, 122), (256, 119), (251, 115), (247, 109), (245, 104),
]
P_EYE_INNER = [
    (252, 99), (255, 97), (259, 97), (264, 100), (269, 105),
    (270, 110), (267, 114), (263, 115), (258, 113), (254, 109),
    (252, 105),
]


def mask(points, holes=(), size=SIZE):
    scale = 4
    image = Image.new('L', (size[0] * scale, size[1] * scale))
    draw = ImageDraw.Draw(image)
    draw.polygon([(round(x * scale), round(y * scale)) for x, y in points], fill=255)
    for hole in holes:
        draw.polygon([(round(x * scale), round(y * scale)) for x, y in hole], fill=0)
    return np.asarray(image.resize(size, Image.Resampling.LANCZOS)).copy()


def composite(base, sprite, offset=(0, 0)):
    result = base.copy().convert('RGBA')
    result.alpha_composite(sprite, dest=offset)
    return result


def exact_foreground(source, background, coverage):
    """Solve foreground RGB so the antialiased composite recreates the source."""
    s, b = (np.asarray(im, dtype=np.float32) for im in (source, background))
    min_alpha = np.where(s > b, (s - b) / np.maximum(255 - b, 1), (b - s) / np.maximum(b, 1))
    alpha = np.maximum(coverage, np.ceil(min_alpha.max(axis=2) * 255)).astype(np.uint8)
    alpha[coverage == 0] = 0
    t = alpha[..., None].astype(np.float32) / 255
    foreground = np.clip(np.rint(b + (s - b) / np.maximum(t, 1 / 255)), 0, 255).astype(np.uint8)
    foreground[alpha == 0] = 0
    return Image.fromarray(np.dstack((foreground, alpha)))


def split_fixed_flower(plate, contour):
    coverage = mask(contour)
    protected = coverage >= 95
    coverage[protected] = 255
    coverage[coverage < 4] = 0
    clean = Image.fromarray(cv2.inpaint(np.asarray(plate.convert('RGB')), np.uint8(coverage > 0) * 255,
                                         3, cv2.INPAINT_TELEA))
    return clean, coverage, protected


def repair_p(source, leaf_alpha, head_alpha):
    """Extend observed planes into occlusion, sampling only the original RGB."""
    rgb = np.asarray(source)
    original = np.asarray(Image.open(SOURCE).convert('RGB'))
    y, x = np.indices((SIZE[1], SIZE[0]), dtype=np.float32)
    # The sloping edge of the hidden post is inferred from the exposed upper/lower wood.
    post_edge = np.interp(y, [133, 161, 186, 216, 251, 278, 310], [150, 151, 146, 140, 132, 126, 124])
    # Borrow the distant atmosphere from the unobstructed area directly to the left.
    air = cv2.remap(original, (12 + 0.28 * x + 1.2 * np.sin(y / 18)).astype(np.float32),
                    y + CROP[1], cv2.INTER_LINEAR).astype(np.float32)
    # Borrow continuous dark timber texture from the exposed side of the same post.
    timber_x = 173 + 0.42 * (x - post_edge) + 2.2 * np.sin(y / 21)
    timber_y = np.minimum(302, y + 47 + 2.5 * np.sin(y / 15))
    wood = cv2.remap(rgb, timber_x.astype(np.float32), timber_y.astype(np.float32), cv2.INTER_LINEAR).astype(np.float32)
    wood = wood * np.array([0.79, 0.76, 0.72])
    edge = np.clip((x - post_edge + 3) / 7, 0, 1)[..., None]
    plate = rgb.copy()
    restored_leaf = np.clip(np.rint(air * (1 - edge) + wood * edge), 0, 255).astype(np.uint8)
    leaf_area = leaf_alpha > 3
    plate[leaf_area] = restored_leaf[leaf_area]
    # This region remains behind the stationary finial. It has no second copy of the head.
    head_area = np.uint8(head_alpha > 3) * 255
    plate = cv2.inpaint(plate, head_area, 4, cv2.INPAINT_TELEA)
    return Image.fromarray(plate)


def edit_eye(head, eye_mask):
    rgba = np.asarray(head).copy()
    rgb = rgba[..., :3].astype(np.float32)
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)
    y, x = np.indices(lum.shape, dtype=np.float32)
    texture = 0.5 + 0.5 * np.sin(0.55 * x + 0.82 * y + 1.1 * np.sin(y * 0.72))
    patina = (0.12 + 0.35 * texture) * np.clip((164 - lum) / 101, 0, 1)
    bronze = lum[..., None] * np.array([1.04, 0.76, 0.48]) + np.array([10, 7, 7])
    verdigris = lum[..., None] * np.array([0.44, 0.82, 0.71]) + np.array([8, 17, 15])
    tint = bronze * (1 - patina[..., None]) + verdigris * patina[..., None]
    weight = eye_mask[..., None].astype(np.float32) / 255
    rgba[..., :3] = np.clip(np.rint(rgb * (1 - weight) + tint * weight), 0, 255).astype(np.uint8)
    return Image.fromarray(rgba)


def save_layer(out, name, layer, pivot, source, bbox=None):
    bbox = bbox or layer.getchannel('A').getbbox()
    if bbox is None:
        raise ValueError(f'Empty layer: {name}')
    layer.crop(bbox).save(out / 'layers' / f'{name}.png')
    return {
        'path': f'layers/{name}.png',
        'bbox_crop_ltrb': bbox,
        'bbox_source_ltrb': [bbox[0] + CROP[0], bbox[1] + CROP[1], bbox[2] + CROP[0], bbox[3] + CROP[1]],
        'position_crop_xy': bbox[:2],
        'pivot_crop_xy': pivot,
        'pivot_texture_xy': [pivot[0] - bbox[0], pivot[1] - bbox[1]],
        'origin': source,
    }


def sample_difference(first, second):
    a, b = (np.asarray(im.convert('RGB'), dtype=np.int16) for im in (first, second))
    delta = np.abs(a - b)
    return {'pixels': int(np.count_nonzero(delta.max(axis=2))),
            'mean_abs_rgb': round(float(delta.mean()), 4), 'max_channel_delta': int(delta.max())}


def save_package(method, version, base, head, leaf, eye, origins, pivots, shadow=None, flower=None, details=None):
    out = ROOT / method / version
    for sub in ('layers', 'masks', 'views'):
        (out / sub).mkdir(parents=True, exist_ok=True)
    bronze = edit_eye(head, eye)
    layers = {'base': save_layer(out, 'base', base.convert('RGBA'), (0, 0), origins['base'])}
    if shadow is not None:
        layers['contact-shadow'] = save_layer(out, 'contact-shadow', shadow, pivots['serpent'], origins['contact-shadow'])
    layers['serpent'] = save_layer(out, 'serpent', head, pivots['serpent'], origins['serpent'])
    layers['monstera'] = save_layer(out, 'monstera', leaf, pivots['monstera'], origins['monstera'])
    if flower is not None:
        layers['flower'] = save_layer(out, 'flower', flower, pivots['flower'], origins['flower'])
    bronze_layer = save_layer(out, 'serpent-bronze', bronze, pivots['serpent'], origins['bronze'], layers['serpent']['bbox_crop_ltrb'])
    layers['serpent-bronze'] = bronze_layer
    for name, layer in [('serpent', head), ('monstera', leaf)]:
        layer.getchannel('A').save(out / 'masks' / f'{name}.png')
    Image.fromarray(eye).save(out / 'masks' / 'bronze-ring.png')
    stationary = composite(base, shadow) if shadow is not None else base
    stationary = composite(stationary, head)
    rest = composite(stationary, leaf)
    reveal = composite(stationary, leaf, DEMO_SHIFT)
    edited = composite(composite(composite(base, shadow) if shadow is not None else base, bronze), leaf)
    if flower is not None:
        stationary, rest, reveal, edited = (composite(frame, flower) for frame in (stationary, rest, reveal, edited))
    for name, frame in [('rest', rest), ('reveal-left14', reveal), ('leaf-hidden', stationary), ('bronze', edited)]:
        frame.convert('RGB').save(out / 'views' / f'{name}.png')
    for label, color in [('white', '#ffffff'), ('black', '#141418'), ('contrast', '#ad63a1')]:
        swatches = Image.new('RGB', (SIZE[0] * 2, SIZE[1]), color)
        swatches.paste(composite(Image.new('RGB', SIZE, color), head).convert('RGB'), (0, 0))
        swatches.paste(composite(Image.new('RGB', SIZE, color), leaf).convert('RGB'), (SIZE[0], 0))
        swatches.save(out / 'views' / f'alpha-{label}.png')
    leaf_alpha = np.asarray(leaf.getchannel('A'))
    shifted = Image.new('L', SIZE)
    shifted.paste(leaf.getchannel('A'), DEMO_SHIFT)
    open_strip = (leaf_alpha >= 128) & (np.asarray(shifted) < 128)
    change = np.max(np.abs(np.asarray(rest, dtype=np.int16) - np.asarray(edited, dtype=np.int16)), axis=2) > 0
    metrics = {
        'rest_against_control': sample_difference(rest, Image.open(CONTROL)),
        'reveal_against_rest': sample_difference(reveal, rest),
        'revealed_leaf_pixels_at_alpha_128': int(open_strip.sum()),
        'bronze_changed_pixels': int(change.sum()),
        'bronze_changed_outside_mask': int(np.count_nonzero(change & (eye == 0))),
    }
    if np.any(change & (eye == 0)):
        raise ValueError('Bronze edit escapes the ring mask')
    data = {
        'schema': 1, 'method': method, 'version': version, 'frame_size_wh': SIZE,
        'crop_source_ltrb': CROP, 'coordinates': 'LTRB exclusive, x right, y down, source scale 1:1',
        'source': {'path': SOURCE.as_posix(), 'sha256': SOURCE_SHA256, 'crop': '../../reference/control.png'},
        'master': 'views/rest.png',
        'layer_order_back_to_front': [name for name in layers if name != 'serpent-bronze'],
        'layers': layers,
        'states': {'initial': {}, 'reveal': {'monstera_delta_xy': DEMO_SHIFT},
                   'bronze': {'replace_layer': {'serpent': 'serpent-bronze'}}},
        'motion': {'layer': 'monstera', 'axis': 'x', 'demonstrated_dx': [-14, 0],
                   'theoretical_left_clip_dx': -layers['monstera']['bbox_crop_ltrb'][0]},
        'metrics': metrics,
        'notes': details or {},
    }
    (out / 'manifest.json').write_text(json.dumps(data, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print(json.dumps(metrics, ensure_ascii=False))


def build_p(version):
    source = Image.open(CONTROL).convert('RGB')
    leaf_alpha = mask(P_LEAF, P_LEAF_HOLES)
    head_alpha = mask(P_SERPENT)
    leaf_alpha[leaf_alpha < 4] = 0
    head_alpha[head_alpha < 4] = 0
    base = repair_p(source, leaf_alpha, head_alpha)
    head = exact_foreground(source, base, head_alpha)
    leaf = exact_foreground(source, composite(base, head).convert('RGB'), leaf_alpha)
    eye = mask(P_EYE_OUTER, [P_EYE_INNER])
    save_package('02-P', version, base, head, leaf, eye, {
        'base': 'Original control RGB outside mattes. Occlusions repaired deterministically using original timber and distant texture samples and local Telea behind the fixed head.',
        'serpent': 'Original RGB and hand-traced antialiased mask. Edge foreground solved against reconstructed plate.',
        'monstera': 'Original RGB and hand-traced antialiased mask with traced slits and holes.',
        'bronze': 'Deterministic color transform restricted to manually traced outer eye ring, preserving the inner eye and alpha.',
    }, {'serpent': (177, 39), 'monstera': (127, 148)}, details={
        'flower': 'Red flower remains fixed on the original backplate.',
        'shadow': 'Original stationary contact shading is retained where visible on the plate. No independent new shadow in this version.',
        'repair': 'Only the chosen disocclusion experiment is assessed. Hidden geometry is an inferred reconstruction.',
    })


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--version', default='first')
    args = parser.parse_args()
    started = perf_counter()
    build_p(args.version)
    print(f'Local processing: {perf_counter() - started:.3f} s')
