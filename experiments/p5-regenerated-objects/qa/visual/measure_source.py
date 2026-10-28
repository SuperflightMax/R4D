"""Read only the exact permitted common inputs; emit source-space QA landmarks.

This is a diagnostic of the accepted homography, not a simulation or a new
collider/renderer implementation. No P5 product input is changed.
"""
import hashlib
import json
import math
from pathlib import Path
import struct
import subprocess

ROOT = Path(__file__).resolve().parents[4]
P1 = "4b47db04c7140ebf88f69b91faa0b790d46f22ec"
PREFIX = "experiments/p1-collider-mapping/clean-repeat-01/"
PINS = {
    "simulation/boards/01/trial-01/config.json": (9503, "dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db"),
    "simulation/boards/01/trial-01/manifest.json": (11565, "7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18"),
    "simulation/projection.mjs": (614, "b59a0c1e6c34b417d253178457ef3580b8bea0aa89c989d1342f9376e19b9431"),
    "viewer/src/view-math.mjs": (3050, "96f01cc2093c353ff958cb906fe0c8ae93412425d0f7a5ec7cca0f2bf9f1aa5e"),
}
JPG = Path("K:/Agents/R4D/Assets/perspective/01-jungle.jpg")
JPG_HASH = "c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def jpeg_size(data):
    if data[:2] != b"\xff\xd8":
        raise ValueError("Source is not a JPEG")
    at = 2
    while at < len(data):
        if data[at] != 255:
            raise ValueError("Unexpected JPEG marker boundary")
        while data[at] == 255:
            at += 1
        marker = data[at]
        at += 1
        size = int.from_bytes(data[at:at + 2], "big")
        if marker in (0xC0, 0xC1, 0xC2):
            height, width = struct.unpack(">HH", data[at + 3:at + 7])
            return [width, height]
        at += size
    raise ValueError("JPEG dimensions not found")


def main():
    blobs, verified = {}, []
    for path, (size, digest) in PINS.items():
        raw = subprocess.check_output(["git", "-C", str(ROOT), "cat-file", "blob", P1 + ":" + PREFIX + path])
        if len(raw) != size or sha(raw) != digest:
            raise ValueError("Common input pin mismatch: " + path)
        blobs[path] = raw
        verified.append({"commit": P1, "path": PREFIX + path, "bytes": size, "sha256": digest})
    source = JPG.read_bytes()
    if sha(source) != JPG_HASH or jpeg_size(source) != [1536, 1536]:
        raise ValueError("Jungle source pin mismatch")
    config = json.loads(blobs["simulation/boards/01/trial-01/config.json"])
    manifest = json.loads(blobs["simulation/boards/01/trial-01/manifest.json"])
    matrix = manifest["projection"]["nativeToSource"]

    def project(x, y):
        homogeneous = [sum(row[i] * (x, y, 1)[i] for i in range(3)) for row in matrix]
        return [homogeneous[0] / homogeneous[2], homogeneous[1] / homogeneous[2]]

    def landmark(item):
        x, y = item["x"], item["y"]
        radius = item.get("r", config["board"]["ball"]["r"])
        # Finite sampling of a ground circle; not the sprite's 3D silhouette.
        points = [project(x + radius * math.cos(i * math.tau / 720), y + radius * math.sin(i * math.tau / 720)) for i in range(720)]
        width = max(p[0] for p in points) - min(p[0] for p in points)
        height = max(p[1] for p in points) - min(p[1] for p in points)
        left = project(x - 16, y)
        right = project(x + 16, y)
        return {"id": item["id"], "nativeAnchor": [x, y], "nativeRadius": radius,
                "sourceAnchorPx": [round(v, 3) for v in project(x, y)],
                "projectedGroundCircleBoundsSizePxApprox": [round(width, 3), round(height, 3)],
                "ballR16HorizontalDiameterPxAtAnchor": round(abs(right[0] - left[0]), 3)}

    board = config["board"]
    families = {}
    for item in board["pins"]:
        family = item["id"].split("-")[0]
        families[family] = families.get(family, 0) + 1
    result = {
        "status": "SOURCE_PREPARATION_ONLY_NO_P5_CANDIDATE_VERDICT",
        "source": {"path": str(JPG), "bytes": len(source), "sha256": sha(source), "dimensionsPx": jpeg_size(source)},
        "verifiedCommonInputs": verified,
        "method": "Independent direct homogeneous division of the exact P1 nativeToSource matrix; 720 samples per ground circle. Rounded display only. Horizontal r16 diameter is project(x+16,y).x - project(x-16,y).x. These are source pixels, not texture/CSS pixels, sphere silhouette height, or a collision test.",
        "counts": {"pins": len(board["pins"]), "segments": len(board["segments"]), "buckets": len(board["buckets"]), "drops": len(board["drops"]), "families": families},
        "pins": [landmark(item) for item in board["pins"]],
        "drops": [landmark(item) for item in board["drops"]],
        "buckets": [landmark(item) for item in board["buckets"]],
        "floorBoundarySourcePx": [[round(v, 3) for v in project(*p)] for p in manifest["projection"]["playableFloorNativePolygon"]],
        "limitations": ["No native simulation run", "No P5 generated assets inspected", "No browser/candidate/contact/occlusion/basket QA", "Common mapping is held fixed, not endorsed as defect-free", "P0 diagnostic rows/scales are not substituted for accepted P1"]
    }
    destination = Path(__file__).with_name("SOURCE_FACTS.json")
    destination.write_bytes((json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
    print(json.dumps({"file": str(destination), "bytes": destination.stat().st_size, "sha256": sha(destination.read_bytes()), "counts": result["counts"], "drop": result["drops"], "buckets": result["buckets"], "firstPin": result["pins"][0], "lastPin": result["pins"][-1]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
