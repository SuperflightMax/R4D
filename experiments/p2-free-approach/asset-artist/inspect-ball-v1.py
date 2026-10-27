"""Read-only raster measurements; saves JSON, never edits image pixels."""
import hashlib
import json
import math
import pathlib
import statistics
import sys
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parent


def bbox(points):
    return [min(p[0] for p in points), min(p[1] for p in points),
            max(p[0] for p in points) + 1, max(p[1] for p in points) + 1]


def main():
    path = ROOT / (sys.argv[1] if len(sys.argv) > 1 else "ball-v1.png")
    assert path.parent == ROOT and path.suffix == ".png"
    image = Image.open(path)
    assert image.mode == "RGBA" and image.format == "PNG"
    width, height = image.size
    pixels = list(image.get_flattened_data())
    thresholds = (1, 16, 128, 250, 254, 255)
    selected = {threshold: [] for threshold in thresholds}
    alpha_zero = alpha_partial = alpha_full = 0
    for i, (_, _, _, alpha) in enumerate(pixels):
        if alpha == 0:
            alpha_zero += 1
        elif alpha == 255:
            alpha_full += 1
        else:
            alpha_partial += 1
        if alpha:
            point = (i % width, i // width)
            for threshold in thresholds:
                if alpha >= threshold:
                    selected[threshold].append(point)
    bounds = {str(t): bbox(selected[t]) for t in thresholds}
    x0, y0, x1, y1 = bounds["128"]
    center = [(x0 + x1) / 2, (y0 + y1) / 2]
    diameter = ((x1-x0) + (y1-y0)) / 2
    radius = diameter / 2
    row_ends = {}
    for x, y in selected[128]:
        if y not in row_ends:
            row_ends[y] = [x, x]
        else:
            row_ends[y][1] = x
    boundary_distances = [math.hypot(x + .5 - center[0], y + .5 - center[1])
                          for y, ends in row_ends.items() for x in ends]
    residuals = sorted(abs(d - radius) for d in boundary_distances)
    quadrants = {name: [] for name in ("upperLeft", "upperRight", "lowerLeft", "lowerRight")}
    central_disc_opaque = []
    outside_disc_alpha = []
    outside_disc_significant_count = 0
    for i, (_, _, _, alpha) in enumerate(pixels):
        dx, dy = (i % width + .5-center[0])/radius, (i // width + .5-center[1])/radius
        if dx*dx+dy*dy > 1.05**2:
            outside_disc_alpha.append(alpha)
            if alpha >= 16:
                outside_disc_significant_count += 1
    for y in range(max(0, y0), min(height, y1)):
        for x in range(max(0, x0), min(width, x1)):
            dx, dy = (x+.5-center[0])/radius, (y+.5-center[1])/radius
            r2 = dx*dx+dy*dy
            r, g, b, alpha = pixels[y*width+x]
            if r2 < .80**2:
                central_disc_opaque.append(alpha)
            if .15**2 < r2 < .75**2 and alpha >= 250:
                key = ("upper" if dy < 0 else "lower") + ("Right" if dx >= 0 else "Left")
                quadrants[key].append(.2126*r+.7152*g+.0722*b)
    border = [pixels[x][3] for x in range(width)] + [pixels[(height-1)*width+x][3] for x in range(width)]
    border += [pixels[y*width][3] for y in range(height)] + [pixels[y*width+width-1][3] for y in range(height)]
    metrics = {
        "schema": "r4d.p2.artist.ball-raster-metrics.v1",
        "assetPath": path.name, "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
        "bytes": path.stat().st_size, "format": "PNG", "mode": "RGBA", "canvasPx": [width, height],
        "coordinateConvention": "bounds [left,top,right,bottom] right/bottom exclusive; pixel centers at x+0.5/y+0.5",
        "alpha": {"range": [0, 255], "fullyTransparentPixelCount": alpha_zero,
                  "partiallyTransparentPixelCount": alpha_partial, "fullyOpaquePixelCount": alpha_full,
                  "canvasBorderAllTransparent": max(border) == 0, "boundsByMinimumAlpha": bounds,
                  "inner80PercentRadiusMinimumAlpha": min(central_disc_opaque),
                  "outside105PercentRadiusMaximumAlpha": max(outside_disc_alpha),
                  "outside105PercentRadiusPixelsAtLeastAlpha16": outside_disc_significant_count},
        "usableDisc": {"minimumAlphaForSizing": 128, "centerPx": center,
                       "diameterPx": diameter, "widthPx": x1-x0, "heightPx": y1-y0,
                       "canvasAnchorNormalized": [center[0]/width, center[1]/height],
                       "displayScaleRule": "screen pixels per texture pixel = (2*16/wProjection)/diameterPx; uniform XY",
                       "sphereCenterAnchor": True,
                       "alphaBoundaryVsCircleAbsResidualPx": {"median": statistics.median(residuals),
                           "p95": residuals[int(.95*(len(residuals)-1))], "maximum": max(residuals)}},
        "lightMeasurement": {"region": "alpha>=250 annulus radius .15 to .75 of usable disc",
                             "meanRec709EncodedRGBLumaByQuadrant": {k:statistics.mean(v) for k,v in quadrants.items()},
                             "physicalRadianceClaimed": False},
        "pixelProcessingPerformed": False, "rawAndUsablePNGIdentical": True,
        "runtimeOrMotionReviewed": False
    }
    path.with_suffix(".metrics.json").write_text(json.dumps(metrics, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(metrics, ensure_ascii=False))


if __name__ == "__main__":
    main()
