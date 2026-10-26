from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path

import cv2
import numpy as np


ROOT = Path(__file__).resolve().parent
MAPPING_PATH = ROOT / "mapping-v0.1.json"


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def sha256_file(path: Path) -> str:
    return sha256_bytes(path.read_bytes())


mapping = json.loads(MAPPING_PATH.read_text(encoding="utf-8"))
source_path = Path(mapping["source"]["path"])
assert sha256_file(source_path) == mapping["source"]["sha256"]
H = np.array(mapping["transform"]["forwardMatrix"], dtype=np.float64)
H_inv = np.array(mapping["transform"]["inverseMatrix"], dtype=np.float64)
assert np.max(np.abs(H @ H_inv - np.eye(3))) < 1e-9


def project(matrix: np.ndarray, point) -> np.ndarray:
    value = matrix @ np.array([point[0], point[1], 1.0], dtype=np.float64)
    assert np.isfinite(value).all() and abs(value[2]) > 1e-12
    return value[:2] / value[2]


def forward(point) -> np.ndarray:
    return project(H, point)


def inverse(point) -> np.ndarray:
    return project(H_inv, point)


def circle_points(center, radius, count=96):
    return [
        np.array(
            [
                center[0] + radius * math.cos(2 * math.pi * index / count),
                center[1] + radius * math.sin(2 * math.pi * index / count),
            ],
            dtype=np.float64,
        )
        for index in range(count + 1)
    ]


def box_vertices(obstacle):
    cx, cy = obstacle["centerFlat"]
    hx, hy = obstacle["halfExtentsFlat"]
    return [
        np.array([cx - hx, cy - hy], dtype=np.float64),
        np.array([cx + hx, cy - hy], dtype=np.float64),
        np.array([cx + hx, cy + hy], dtype=np.float64),
        np.array([cx - hx, cy + hy], dtype=np.float64),
    ]


def rectangle_value(point: np.ndarray, rectangle: dict) -> float:
    angle = math.radians(rectangle["angleDeg"])
    dx, dy = point - np.array(rectangle["centerPx"], dtype=np.float64)
    local_x = dx * math.cos(angle) + dy * math.sin(angle)
    local_y = -dx * math.sin(angle) + dy * math.cos(angle)
    return max(abs(local_x) / (rectangle["widthPx"] / 2), abs(local_y) / (rectangle["heightPx"] / 2))


flat_lattice = [[x, y] for y in list(range(0, 1151, 50)) for x in range(0, 1001, 50)]
flat_errors = []
image_errors = []
for point in flat_lattice:
    image_point = forward(point)
    flat_back = inverse(image_point)
    image_back = forward(flat_back)
    flat_errors.append(float(np.linalg.norm(flat_back - point)))
    image_errors.append(float(np.linalg.norm(image_back - image_point)))
assert max(flat_errors) <= mapping["checks"]["roundTripFlatMaxError"]
assert max(image_errors) <= mapping["checks"]["roundTripImageMaxErrorPx"]

for flat_corner, image_corner in zip(mapping["transform"]["flatQuadClockwise"], mapping["transform"]["imageQuadPxClockwise"], strict=True):
    assert np.linalg.norm(forward(flat_corner) - image_corner) <= 1e-6

ids = set()
circle_count = 0
segment_loop_count = 0
for obstacle in mapping["obstacles"]:
    assert obstacle["id"] not in ids
    ids.add(obstacle["id"])
    center = np.array(obstacle["centerFlat"], dtype=np.float64)
    assert np.linalg.norm(forward(center) - obstacle["sourceAnchorPx"]) <= mapping["checks"]["sourceAnchorMaxErrorPx"]
    if obstacle["shape"] == "circle":
        circle_count += 1
        radius = obstacle["radiusFlat"]
        assert radius <= center[0] <= 1000 - radius
        assert radius <= center[1] <= 1000 - radius
        samples = circle_points(center, radius)
    else:
        segment_loop_count += 1
        assert obstacle["shape"] == "axisAlignedSegmentLoop"
        hx, hy = obstacle["halfExtentsFlat"]
        assert hx <= center[0] <= 1000 - hx
        assert hy <= center[1] <= 1000 - hy
        vertices = box_vertices(obstacle)
        samples = []
        for edge in range(4):
            start = vertices[edge]
            end = vertices[(edge + 1) % 4]
            for index in range(mapping["diagnostics"]["segmentSamples"] + 1):
                t = index / mapping["diagnostics"]["segmentSamples"]
                samples.append(start + (end - start) * t)
    for point in samples:
        assert np.linalg.norm(inverse(forward(point)) - point) <= mapping["checks"]["roundTripFlatMaxError"]

assert len(mapping["obstacles"]) == 24
assert circle_count == 12 and segment_loop_count == 12

near_segments = sorted([[segment["from"][0], segment["to"][0]] for segment in mapping["bounds"] if segment["id"].startswith("bound-near-")])
receiver_gaps = [[near_segments[index][1], near_segments[index + 1][0]] for index in range(len(near_segments) - 1)]
assert receiver_gaps == [[20, 160], [290, 435], [570, 715], [850, 990]]

containment = {}
for goal, gap in zip(mapping["goals"], receiver_gaps, strict=True):
    center = np.array(goal["centerFlat"], dtype=np.float64)
    radius = goal["radiusFlat"]
    assert gap[0] <= center[0] <= gap[1]
    assert 1000 < center[1] - radius and center[1] + radius < 1150
    assert np.linalg.norm(forward(center) - goal["visibleDarkOpening"]["centerPx"]) <= 0.001
    values = [rectangle_value(forward(point), goal["visibleDarkOpening"]) for point in circle_points(center, radius)]
    containment[goal["id"]] = max(values)
    assert containment[goal["id"]] <= mapping["checks"]["goalContainmentMaxRectValue"]


def polyline(image, points, color, width):
    pixels = np.array([[round(point[0]), round(point[1])] for point in points], dtype=np.int32)
    cv2.polylines(image, [pixels], False, color, width, cv2.LINE_AA)


source = cv2.imread(str(source_path), cv2.IMREAD_COLOR)
assert source is not None and source.shape[:2] == (1536, 1536)
overlay = source.copy()
quad = [forward(point) for point in mapping["transform"]["flatQuadClockwise"]]
polyline(overlay, quad + [quad[0]], (255, 255, 0), 4)
apron_flat = [[0, 1000], [1000, 1000], [1000, 1150], [0, 1150]]
apron = [forward(point) for point in apron_flat]
polyline(overlay, apron + [apron[0]], (0, 128, 255), 4)
for segment in mapping["bounds"]:
    polyline(overlay, [forward(segment["from"]), forward(segment["to"])], (255, 255, 0), 4)
for obstacle in mapping["obstacles"]:
    if obstacle["shape"] == "circle":
        points = circle_points(obstacle["centerFlat"], obstacle["radiusFlat"])
    else:
        vertices = box_vertices(obstacle)
        points = vertices + [vertices[0]]
    polyline(overlay, [forward(point) for point in points], (255, 0, 255), 3)
for goal in mapping["goals"]:
    rectangle = goal["visibleDarkOpening"]
    cv2.ellipse(
        overlay,
        tuple(round(value) for value in rectangle["centerPx"]),
        (round(rectangle["widthPx"] / 2), round(rectangle["heightPx"] / 2)),
        rectangle["angleDeg"],
        0,
        360,
        (0, 215, 255),
        4,
        cv2.LINE_AA,
    )
    polyline(overlay, [forward(point) for point in circle_points(goal["centerFlat"], goal["radiusFlat"])], (0, 255, 0), 5)
cv2.circle(overlay, tuple(round(value) for value in forward(mapping["start"]["positionFlat"])), 9, (0, 255, 0), -1, cv2.LINE_AA)

flat_preview = cv2.warpPerspective(source, H_inv, (1000, 1150), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_CONSTANT, borderValue=(28, 28, 28))
cv2.line(flat_preview, (0, 1000), (999, 1000), (0, 128, 255), 4, cv2.LINE_AA)
for segment in mapping["bounds"]:
    polyline(flat_preview, [np.array(segment["from"]), np.array(segment["to"])], (255, 255, 0), 3)
for obstacle in mapping["obstacles"]:
    if obstacle["shape"] == "circle":
        cv2.circle(flat_preview, tuple(round(value) for value in obstacle["centerFlat"]), round(obstacle["radiusFlat"]), (255, 0, 255), 3, cv2.LINE_AA)
    else:
        vertices = box_vertices(obstacle)
        polyline(flat_preview, vertices + [vertices[0]], (255, 0, 255), 3)
for goal in mapping["goals"]:
    cv2.circle(flat_preview, tuple(round(value) for value in goal["centerFlat"]), round(goal["radiusFlat"]), (0, 255, 0), 4, cv2.LINE_AA)
cv2.circle(flat_preview, tuple(round(value) for value in mapping["start"]["positionFlat"]), 7, (0, 255, 0), -1, cv2.LINE_AA)

evidence_dir = ROOT / "evidence"
overlay_path = evidence_dir / "overlay.png"
flat_path = evidence_dir / "flat-preview.png"
parser = argparse.ArgumentParser()
parser.add_argument("--write-evidence", action="store_true")
args = parser.parse_args()
if args.write_evidence:
    evidence_dir.mkdir(parents=True, exist_ok=True)
    assert cv2.imwrite(str(overlay_path), overlay)
    assert cv2.imwrite(str(flat_path), flat_preview)
saved_overlay = cv2.imread(str(overlay_path), cv2.IMREAD_COLOR)
saved_flat = cv2.imread(str(flat_path), cv2.IMREAD_COLOR)
assert saved_overlay is not None and np.array_equal(saved_overlay, overlay)
assert saved_flat is not None and np.array_equal(saved_flat, flat_preview)

canonical = json.dumps(mapping, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
print(json.dumps({
    "status": "PASS",
    "schema": mapping["schema"],
    "canonicalMappingSha256": sha256_bytes(canonical),
    "sourceSha256": sha256_file(source_path),
    "overlaySha256": sha256_file(overlay_path),
    "flatPreviewSha256": sha256_file(flat_path),
    "latticePoints": len(flat_lattice),
    "obstacles": len(mapping["obstacles"]),
    "circleObstacles": circle_count,
    "segmentLoops": segment_loop_count,
    "goals": len(mapping["goals"]),
    "bounds": len(mapping["bounds"]),
    "maxFlatRoundTripError": max(flat_errors),
    "maxImageRoundTripErrorPx": max(image_errors),
    "maxGoalRectValue": containment,
}, ensure_ascii=False, indent=2))
