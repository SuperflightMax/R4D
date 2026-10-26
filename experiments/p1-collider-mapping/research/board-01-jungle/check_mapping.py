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


def project(matrix: np.ndarray, point: list[float] | tuple[float, float]) -> np.ndarray:
    value = matrix @ np.array([point[0], point[1], 1.0], dtype=np.float64)
    assert np.isfinite(value).all() and abs(value[2]) > 1e-12
    return value[:2] / value[2]


def forward(point: list[float] | tuple[float, float]) -> np.ndarray:
    return project(H, point)


def inverse(point: list[float] | tuple[float, float] | np.ndarray) -> np.ndarray:
    return project(H_inv, point)


def ellipse_value(point: np.ndarray, ellipse: dict) -> float:
    angle = math.radians(ellipse["majorAxisAngleDeg"])
    dx, dy = point - np.array(ellipse["centerPx"], dtype=np.float64)
    major = dx * math.cos(angle) + dy * math.sin(angle)
    minor = -dx * math.sin(angle) + dy * math.cos(angle)
    return (major / (ellipse["majorDiameterPx"] / 2)) ** 2 + (
        minor / (ellipse["minorDiameterPx"] / 2)
    ) ** 2


def circle_points(center: list[float], radius: float, count: int = 96) -> list[np.ndarray]:
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


flat_lattice = [
    [x, y]
    for y in list(range(0, 1151, 50)) + [1180]
    for x in range(0, 1001, 50)
]
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

for flat_corner, image_corner in zip(
    mapping["transform"]["flatQuadClockwise"],
    mapping["transform"]["imageQuadPxClockwise"],
    strict=True,
):
    assert np.linalg.norm(forward(flat_corner) - image_corner) <= 1e-6

ids: set[str] = set()
for obstacle in mapping["obstacles"]:
    assert obstacle["id"] not in ids
    ids.add(obstacle["id"])
    assert obstacle["shape"] == "circle" and obstacle["radiusFlat"] > 0
    center = np.array(obstacle["centerFlat"], dtype=np.float64)
    radius = float(obstacle["radiusFlat"])
    assert radius <= center[0] <= 1000 - radius
    assert radius <= center[1] <= 1000 - radius
    assert np.linalg.norm(forward(center) - obstacle["sourceAnchorPx"]) <= mapping["checks"][
        "sourceAnchorMaxErrorPx"
    ]
    for point in circle_points(obstacle["centerFlat"], radius):
        assert np.linalg.norm(inverse(forward(point)) - point) <= mapping["checks"][
            "roundTripFlatMaxError"
        ]

assert len(mapping["obstacles"]) == 25
assert 0 <= mapping["start"]["positionFlat"][0] <= 1000
assert 0 <= mapping["start"]["positionFlat"][1] <= 1000

near_segments = sorted(
    [
        [segment["from"][0], segment["to"][0]]
        for segment in mapping["bounds"]
        if segment["id"].startswith("bound-near-")
    ]
)
receiver_gaps = [
    [near_segments[index][1], near_segments[index + 1][0]]
    for index in range(len(near_segments) - 1)
]
assert receiver_gaps == [[60, 200], [320, 460], [560, 700], [815, 955]]

containment: dict[str, float] = {}
for goal, gap in zip(mapping["goals"], receiver_gaps, strict=True):
    assert goal["shape"] == "bucketCircle"
    center = np.array(goal["centerFlat"], dtype=np.float64)
    radius = float(goal["radiusFlat"])
    assert gap[0] <= center[0] <= gap[1]
    assert 1000 < center[1] - radius and center[1] + radius < 1180
    assert np.linalg.norm(forward(center) - goal["visibleDarkOpening"]["centerPx"]) <= 0.001
    values = [
        ellipse_value(forward(point), goal["visibleDarkOpening"])
        for point in circle_points(goal["centerFlat"], radius)
    ]
    containment[goal["id"]] = max(values)
    assert containment[goal["id"]] <= mapping["checks"]["goalContainmentMaxEllipseValue"]


def polyline(image: np.ndarray, points: list[np.ndarray], color: tuple[int, int, int], width: int) -> None:
    pixels = np.array([[round(point[0]), round(point[1])] for point in points], dtype=np.int32)
    cv2.polylines(image, [pixels], False, color, width, cv2.LINE_AA)


source = cv2.imread(str(source_path), cv2.IMREAD_COLOR)
assert source is not None and source.shape[:2] == (1536, 1536)
overlay = source.copy()

quad = [forward(point) for point in mapping["transform"]["flatQuadClockwise"]]
polyline(overlay, quad + [quad[0]], (255, 255, 0), 4)
apron_flat = [[0, 1000], [1000, 1000], [1000, 1180], [0, 1180]]
apron = [forward(point) for point in apron_flat]
polyline(overlay, apron + [apron[0]], (0, 128, 255), 4)

for segment in mapping["bounds"]:
    polyline(overlay, [forward(segment["from"]), forward(segment["to"])], (255, 255, 0), 4)

for obstacle in mapping["obstacles"]:
    polyline(
        overlay,
        [forward(point) for point in circle_points(obstacle["centerFlat"], obstacle["radiusFlat"])],
        (255, 0, 255),
        3,
    )

for goal in mapping["goals"]:
    ellipse = goal["visibleDarkOpening"]
    cv2.ellipse(
        overlay,
        tuple(round(value) for value in ellipse["centerPx"]),
        (round(ellipse["majorDiameterPx"] / 2), round(ellipse["minorDiameterPx"] / 2)),
        ellipse["majorAxisAngleDeg"],
        0,
        360,
        (0, 215, 255),
        4,
        cv2.LINE_AA,
    )
    polyline(
        overlay,
        [forward(point) for point in circle_points(goal["centerFlat"], goal["radiusFlat"])],
        (0, 255, 0),
        5,
    )

start_px = tuple(round(value) for value in forward(mapping["start"]["positionFlat"]))
cv2.circle(overlay, start_px, 9, (0, 255, 0), -1, cv2.LINE_AA)

flat_preview = cv2.warpPerspective(
    source,
    H_inv,
    (1000, 1180),
    flags=cv2.INTER_LINEAR,
    borderMode=cv2.BORDER_CONSTANT,
    borderValue=(28, 28, 28),
)
cv2.line(flat_preview, (0, 1000), (999, 1000), (0, 128, 255), 4, cv2.LINE_AA)
for segment in mapping["bounds"]:
    polyline(
        flat_preview,
        [np.array(segment["from"]), np.array(segment["to"])],
        (255, 255, 0),
        3,
    )
for obstacle in mapping["obstacles"]:
    cv2.circle(
        flat_preview,
        tuple(round(value) for value in obstacle["centerFlat"]),
        round(obstacle["radiusFlat"]),
        (255, 0, 255),
        3,
        cv2.LINE_AA,
    )
for goal in mapping["goals"]:
    cv2.circle(
        flat_preview,
        tuple(round(value) for value in goal["centerFlat"]),
        round(goal["radiusFlat"]),
        (0, 255, 0),
        4,
        cv2.LINE_AA,
    )
cv2.circle(
    flat_preview,
    tuple(round(value) for value in mapping["start"]["positionFlat"]),
    7,
    (0, 255, 0),
    -1,
    cv2.LINE_AA,
)

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
print(
    json.dumps(
        {
            "status": "PASS",
            "schema": mapping["schema"],
            "canonicalMappingSha256": sha256_bytes(canonical),
            "sourceSha256": sha256_file(source_path),
            "overlaySha256": sha256_file(overlay_path),
            "flatPreviewSha256": sha256_file(flat_path),
            "latticePoints": len(flat_lattice),
            "obstacles": len(mapping["obstacles"]),
            "goals": len(mapping["goals"]),
            "bounds": len(mapping["bounds"]),
            "maxFlatRoundTripError": max(flat_errors),
            "maxImageRoundTripErrorPx": max(image_errors),
            "maxGoalEllipseValue": containment,
        },
        ensure_ascii=False,
        indent=2,
    )
)
