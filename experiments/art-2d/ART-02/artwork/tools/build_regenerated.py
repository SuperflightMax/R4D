import argparse
from time import perf_counter

import cv2
import numpy as np
from PIL import Image

from build_layers import ROOT, SIZE, composite, exact_foreground, mask, save_package, split_fixed_flower


RAW = ROOT / '02-R/raw'
HEAD_BOX = (145, 32, 313, 163)
LEAF_BOX = (19, 137, 169, 303)
EYE_OUTER = [(867, 551), (875, 523), (896, 498), (923, 483), (956, 475),
             (994, 478), (1027, 493), (1054, 519), (1075, 548), (1088, 586),
             (1091, 620), (1080, 652), (1059, 674), (1029, 690), (995, 694),
             (963, 687), (929, 668), (901, 641), (881, 610), (869, 577)]
EYE_INNER = [(923, 553), (935, 536), (959, 525), (985, 524), (1008, 534),
             (1028, 553), (1041, 578), (1044, 601), (1036, 619), (1021, 632),
             (997, 639), (972, 633), (950, 620), (932, 598), (923, 574)]
FLOWER = [(93, 134), (99, 122), (107, 117), (107, 111), (102, 102),
          (103, 94), (111, 94), (121, 101), (123, 91), (129, 84),
          (133, 80), (138, 89), (139, 101), (149, 97), (156, 100),
          (162, 105), (153, 113), (145, 115), (141, 120), (141, 128),
          (137, 140), (131, 148), (126, 142), (124, 132), (118, 127),
          (110, 128), (101, 131)]


def register_sprite(path, target):
    raw = np.array(Image.open(path).convert('RGBA'))
    alpha = raw[..., 3]
    count, labels, stats, _ = cv2.connectedComponentsWithStats(np.uint8(alpha >= 96))
    if count < 2:
        raise ValueError(f'Missing foreground: {path}')
    component = labels == (1 + stats[1:, cv2.CC_STAT_AREA].argmax())
    edge = cv2.dilate(np.uint8(component), np.ones((7, 7), np.uint8)) != 0
    alpha = np.clip(np.rint((alpha.astype(np.float32) - 13) * 255 / 235), 0, 255).astype(np.uint8)
    alpha[~edge] = 0
    raw[..., 3] = alpha
    raw[alpha == 0, :3] = 0
    clean = Image.fromarray(raw)
    source = clean.getchannel('A').getbbox()
    width, height = target[2] - target[0], target[3] - target[1]
    resized = clean.crop(source).resize((width, height), Image.Resampling.LANCZOS)
    result = Image.new('RGBA', SIZE)
    result.paste(resized, target[:2])
    return result, source


def register_eye(source):
    width, height = HEAD_BOX[2] - HEAD_BOX[0], HEAD_BOX[3] - HEAD_BOX[1]
    sx, sy = width / (source[2] - source[0]), height / (source[3] - source[1])
    outer, inner = ([(HEAD_BOX[0] + (x - source[0]) * sx, HEAD_BOX[1] + (y - source[1]) * sy)
                     for x, y in points] for points in (EYE_OUTER, EYE_INNER))
    return mask(outer, [inner])


def contact_shadow():
    alpha = np.zeros((SIZE[1], SIZE[0]), dtype=np.uint8)
    cv2.ellipse(alpha, (260, 151), (52, 8), 13, 0, 360, 86, -1, cv2.LINE_AA)
    cv2.ellipse(alpha, (183, 129), (24, 8), 13, 0, 360, 52, -1, cv2.LINE_AA)
    alpha = cv2.GaussianBlur(alpha, (0, 0), sigmaX=4, sigmaY=3)
    rgba = np.empty((*alpha.shape, 4), dtype=np.uint8)
    rgba[..., :3] = (32, 21, 12)
    rgba[..., 3] = alpha
    return Image.fromarray(rgba)


def build_r(version, lock_flower):
    base = Image.open(RAW / 'background.png').convert('RGB').resize(SIZE, Image.Resampling.LANCZOS)
    head, head_source = register_sprite(RAW / 'serpent.png', HEAD_BOX)
    leaf, leaf_source = register_sprite(RAW / 'monstera.png', LEAF_BOX)
    eye = register_eye(head_source)
    shadow = contact_shadow()
    flower = None
    if lock_flower:
        base_with_flower = base
        base, coverage, protected = split_fixed_flower(base, FLOWER)
        rest_behind_flower = composite(composite(composite(base, shadow), head), leaf).convert('RGB')
        flower = exact_foreground(base_with_flower, rest_behind_flower, coverage)
    save_package('02-R', version, base, head, leaf, eye, {
        'base': 'Built-in image_gen, raw/background.png. Full frame newly painted, resized to fixed crop. Red flower and wood/distant depth painted in this plate.',
        'serpent': 'Built-in image_gen, raw/serpent.png. Generator alpha normalized and low-alpha haze removed around principal component; registered to shared crop.',
        'monstera': 'Built-in image_gen, raw/monstera.png. Generator alpha and actual perforations preserved after normalization and registration.',
        'bronze': 'Deterministic tint of the outer eye ring of the generated head. The inner eye, silhouette and neighboring paint are unchanged.',
        'contact-shadow': 'Independent soft contact shadow placed on wood and stone under the generated head.',
        'flower': 'Stationary generated flower extracted from raw/background.png after registration.',
    }, {'serpent': (177, 39), 'monstera': (127, 148), 'flower': (129, 116)}, shadow=shadow, flower=flower, details={
        'registration': {'head_raw_bbox_ltrb': head_source, 'head_target_ltrb': HEAD_BOX,
                         'leaf_raw_bbox_ltrb': leaf_source, 'leaf_target_ltrb': LEAF_BOX,
                         'base_raw_size_wh': [1319, 1192]},
        'original_pixels': 'No source Jungle pixels copied into the art layers.',
        'flower': ('Separate generated foreground occluder.' if lock_flower else
                   'Painted into the clean generated background and stationary when the leaf moves.'),
    })
    if lock_flower:
        Image.fromarray(np.uint8(protected) * 255).save(ROOT / '02-R' / version / 'masks/protected-flower.png')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--version', default='first')
    parser.add_argument('--lock-flower', action='store_true')
    args = parser.parse_args()
    started = perf_counter()
    build_r(args.version, args.lock_flower)
    print(f'Local processing: {perf_counter() - started:.3f} s')
