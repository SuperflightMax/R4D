import argparse
from pathlib import Path
from time import perf_counter

import cv2
import numpy as np
from PIL import Image

from build_layers import (CONTROL, P_EYE_INNER, P_EYE_OUTER, P_LEAF, P_LEAF_HOLES,
                          P_SERPENT, ROOT, SIZE, composite, exact_foreground, mask,
                          repair_p, save_package, split_fixed_flower)


FLOWER = [(99, 128), (107, 115), (114, 110), (110, 106), (101, 94),
          (113, 94), (123, 100), (127, 91), (132, 81), (137, 88), (137, 108),
          (146, 103), (158, 102), (152, 114), (143, 117), (142, 124),
          (139, 134), (131, 144), (126, 141), (124, 129), (117, 126)]


def refine_coverage(rgb, guide, protected):
    """Use observed color to resolve the uncertain contour and the open slits."""
    guessed = np.uint8(guide >= 128)
    inside = cv2.distanceTransform(guessed, cv2.DIST_L2, 5)
    outside = cv2.distanceTransform(1 - guessed, cv2.DIST_L2, 5)
    y, x = np.indices(guide.shape)
    red, green, blue = np.moveaxis(rgb.astype(np.int16), -1, 0)
    air = (blue - green >= -1) & (blue - red >= 6) & (blue >= 90) & (x < 126) & (y >= 147)
    rust = (red - green >= 12) & (x > 128)
    labels = np.where(guessed, cv2.GC_PR_FGD, cv2.GC_PR_BGD).astype(np.uint8)
    labels[(outside > 2.5) | air | (rust & (inside < 2))] = cv2.GC_BGD
    labels[(inside > 3.2) & ~air & ~rust] = cv2.GC_FGD
    labels[protected] = cv2.GC_BGD
    cv2.grabCut(rgb, labels, None, np.zeros((1, 65), np.float64), np.zeros((1, 65), np.float64),
                5, cv2.GC_INIT_WITH_MASK)
    foreground = np.uint8((labels == cv2.GC_FGD) | (labels == cv2.GC_PR_FGD))
    count, components, stats, _ = cv2.connectedComponentsWithStats(foreground)
    if count < 2:
        raise ValueError('No leaf component remains')
    foreground = np.uint8(components == (1 + stats[1:, cv2.CC_STAT_AREA].argmax()))
    edge = cv2.GaussianBlur(foreground.astype(np.float32), (3, 3), 0.44)
    edge[edge > 0.93] = 1
    edge[air & (blue - green > 6)] = 0
    edge[protected] = 0
    return foreground, np.rint(edge * 255).astype(np.uint8)


def inferred_atmosphere(rgb, valid):
    # Interpolate only actual unobstructed mist and slit pixels, avoiding green edges.
    valid = valid.astype(np.float32)
    weighted = rgb.astype(np.float32) * valid[..., None]
    nearby = cv2.GaussianBlur(valid, (0, 0), 11)
    broad = cv2.GaussianBlur(valid, (0, 0), 26)
    fine_color = cv2.GaussianBlur(weighted, (0, 0), 11) / np.maximum(nearby[..., None], 1e-6)
    coarse_color = cv2.GaussianBlur(weighted, (0, 0), 26) / np.maximum(broad[..., None], 1e-6)
    blend = np.clip((nearby - 0.015) / 0.15, 0, 1)[..., None]
    return fine_color * blend + coarse_color * (1 - blend)


def refine_plate(source, guide, leaf, head, protected, patch):
    rgb = np.asarray(source)
    r, g, b = np.moveaxis(rgb.astype(np.int16), -1, 0)
    y, x = np.indices(leaf.shape)
    usable_air = (b - g >= 5) & (b >= 92) & (x < 138) & (y >= 141) & (leaf == 0)
    atmosphere = inferred_atmosphere(rgb, usable_air)
    post_edge = np.interp(y, [138, 158, 185, 214, 251, 273, 307], [143, 130, 119, 114, 115, 121, 125])
    if patch is None:
        local = np.asarray(repair_p(source, np.uint8(np.abs(x - 105) < 95) * 255, head))
    else:
        painted = np.asarray(Image.open(patch).convert('RGB').resize(SIZE, Image.Resampling.LANCZOS))
        patch_edge = np.interp(y, [140, 160, 185, 215, 250, 280, 315], [133, 130, 128, 126, 127, 131, 132])
        drift = patch_edge - post_edge
        local = cv2.remap(painted, (x + drift).astype(np.float32), y.astype(np.float32), cv2.INTER_LINEAR)
        # Retain some soft depth texture without taking the generator's shift of the scenery.
        airy = cv2.remap(painted, np.minimum(x, 116).astype(np.float32), y.astype(np.float32), cv2.INTER_LINEAR).astype(np.float32)
        texture = airy - cv2.GaussianBlur(airy, (0, 0), 13)
        atmosphere += np.clip(texture, -20, 20) * 0.78
    plane = np.clip((x - post_edge + 7) / 12, 0, 1)[..., None]
    filled = atmosphere * (1 - plane) + local * plane

    # Close the slit-shaped green residues as well as the old/new contour. The
    # convex envelope is only a restoration region, never the visible leaf alpha.
    old_green = (guide > 16) & (g - r > 5) & (g - b > 11) & (x < 146)
    seed = np.uint8((leaf != 0) | old_green)
    envelope = np.zeros_like(seed)
    cv2.fillConvexPoly(envelope, cv2.convexHull(cv2.findNonZero(seed)), 1)
    distance = cv2.distanceTransform(1 - envelope, cv2.DIST_L2, 5)
    weight = np.clip((6.5 - distance) / 4.5, 0, 1)
    # Keep clearly observed distant pixels where they already match the inferred plane.
    clean_air = usable_air & (x < post_edge - 9) & (np.max(np.abs(rgb - filled), axis=2) < 27)
    weight[clean_air] *= 0.28
    # Preserve the separate upper foliage without a hard horizontal seam.
    upper_leaf_edge = np.interp(x, [0, 18, 40, 64, 84, 102, 124],
                                [169, 159, 151, 147, 145, 143, 136])
    transition = np.clip((y - upper_leaf_edge + 1) / 6, 0, 1)
    above = (x < 124) & (y < 175) & (guide < 8)
    weight[above] *= transition[above]
    weight[protected] = 0
    plate = np.clip(np.rint(rgb * (1 - weight[..., None]) + filled * weight[..., None]), 0, 255).astype(np.uint8)
    plate = cv2.inpaint(plate, np.uint8(head > 3) * 255, 4, cv2.INPAINT_TELEA)
    return Image.fromarray(plate), np.rint(weight * 255).astype(np.uint8)


def recover_edge(source, plate, alpha):
    """Preserve opaque RGB and remove known background spill from mixed edge samples."""
    s, b = (np.asarray(im, dtype=np.float32) for im in (source, plate))
    opacity = alpha[..., None].astype(np.float32) / 255
    reconstructed = b + (s - b) / np.maximum(opacity, 0.28)
    # Very low-alpha pixels have unreliable unmixing. Use the adjacent leaf pigment.
    solid = np.uint8(alpha >= 242)
    mass = cv2.GaussianBlur(solid.astype(np.float32), (0, 0), 1.6)[..., None]
    color = cv2.GaussianBlur(s * solid[..., None], (0, 0), 1.6) / np.maximum(mass, 1e-6)
    near_edge = np.clip((0.69 - opacity) / 0.55, 0, 1) * (mass > 0.005)
    reconstructed = reconstructed * (1 - near_edge) + color * near_edge
    result = np.clip(np.rint(reconstructed), 0, 255).astype(np.uint8)
    result[alpha == 0] = 0
    return Image.fromarray(np.dstack((result, alpha)))


def build_refinement(version, patch, lock_flower):
    source = Image.open(CONTROL).convert('RGB')
    guide = mask(P_LEAF, P_LEAF_HOLES)
    head_mask = mask(P_SERPENT)
    head_mask[head_mask < 4] = 0
    protected = mask(FLOWER) >= 95
    leaf_binary, alpha = refine_coverage(np.asarray(source), guide, protected)
    base, repair_mask = refine_plate(source, guide, leaf_binary, head_mask, protected, patch)
    if lock_flower:
        base, flower_coverage, protected = split_fixed_flower(base, FLOWER)
    head = exact_foreground(source, base, head_mask)
    assembled_head = composite(base, head)
    leaf = recover_edge(source, assembled_head.convert('RGB'), alpha)
    flower = (exact_foreground(source, composite(assembled_head, leaf).convert('RGB'), flower_coverage)
              if lock_flower else None)
    eye = mask(P_EYE_OUTER, [P_EYE_INNER])
    local_source = (f'Hidden timber reconstructed from {patch.name}; only used inside the repair mask.'
                    if patch else 'Hidden timber reconstructed from original dark timber samples.')
    save_package('02-P', version, base, head, leaf, eye, {
        'base': f'Original RGB outside expanded local repair. Mist interpolated from real visible mist and slits. {local_source} Hidden stationary head repaired with local inpainting.',
        'serpent': 'Original RGB and antialiased contour, mixed edge solved against local plate.',
        'monstera': 'Original RGB in opaque areas. Hand contour refined by GrabCut; background spill removed from semitransparent edges.',
        'bronze': 'Procedural patina and tint on the traced ring only. Shape and alpha unchanged.',
        'flower': 'Stationary original RGB in opaque petals, local occlusion repair behind the separate cutout.',
    }, {'serpent': (177, 39), 'monstera': (127, 148), 'flower': (128, 116)}, flower=flower, details={
        'flower': 'Separate foreground occluder in both motion states.' if lock_flower else 'Protected in the plate and held in position.',
        'shadow': 'Original contact shadow under the stationary head retained on the plate.',
        'repair': 'Local widened mask and protected negative space. No copies from 02-R.',
    })
    masks = ROOT / '02-P' / version / 'masks'
    Image.fromarray(repair_mask).save(masks / 'expanded-background-repair.png')
    Image.fromarray(guide).save(masks / 'original-leaf-guide.png')
    Image.fromarray(np.uint8(protected) * 255).save(masks / 'protected-flower.png')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--version', default='refined')
    parser.add_argument('--patch', type=Path)
    parser.add_argument('--lock-flower', action='store_true')
    args = parser.parse_args()
    start = perf_counter()
    build_refinement(args.version, args.patch, args.lock_flower)
    print(f'Local processing: {perf_counter() - start:.3f} s')
