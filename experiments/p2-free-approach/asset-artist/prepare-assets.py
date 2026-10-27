"""Light public-input extraction and independent procedural shadow creation.

Run from this artist's E worktree. Does not edit an existing image, launch a
browser, read private sim-core, or call imagegen. Standard library only.
"""
import datetime
import hashlib
import json
import math
import pathlib
import struct
import subprocess
import zlib

ROOT = pathlib.Path(__file__).resolve().parent
WORKTREE = ROOT.parents[2]
P1 = "4b47db04c7140ebf88f69b91faa0b790d46f22ec"
SUBTREE = "experiments/p1-collider-mapping/clean-repeat-01"
SOURCE = pathlib.Path(r"K:\Agents\R4D\Assets\perspective\01-jungle.jpg")
EXPECTED_SOURCE = "c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72"


def git_blob(path):
    return subprocess.check_output(["git", "show", f"{P1}:{SUBTREE}/{path}"], cwd=WORKTREE)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def write_json(name, value):
    (ROOT / name).write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def project(matrix, x, y):
    w = matrix[2][0] * x + matrix[2][1] * y + matrix[2][2]
    return [(matrix[0][0] * x + matrix[0][1] * y + matrix[0][2]) / w,
            (matrix[1][0] * x + matrix[1][1] * y + matrix[1][2]) / w]


def local_parameters(matrix, x, y, radius=16):
    w = matrix[2][0] * x + matrix[2][1] * y + matrix[2][2]
    sy_num = matrix[1][0] * x + matrix[1][1] * y + matrix[1][2]
    dx_scale = 1 / w
    dy_scale = (matrix[1][1] * w - sy_num * matrix[2][1]) / w**2
    k = dy_scale / dx_scale
    assert 0 < k < 1
    return {"sourcePxPerNativeX": dx_scale, "sourcePxPerNativeY": dy_scale,
            "floorForeshorteningK": k, "ballRadiusSourcePx": radius * dx_scale,
            "proposedSphereCenterLiftSourcePx": radius * dx_scale * math.sqrt(1 - k*k)}


def shadow_png():
    """A NEW alpha-gradient disc in native-plane texture space, not a source edit."""
    width = height = 128
    rows = bytearray()
    for y in range(height):
        rows.append(0)
        for x in range(width):
            t = math.hypot(x + 0.5 - 64, y + 0.5 - 64) / 48
            profile = max(0, 1 - t*t)**2 if t < 1 else 0
            rows.extend((35, 36, 20, round(255 * 0.30 * profile)))

    def chunk(kind, data):
        return struct.pack(">I", len(data)) + kind + data + struct.pack(">I", zlib.crc32(kind + data) & 0xffffffff)

    return (b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0))
            + chunk(b"IDAT", zlib.compress(bytes(rows), 9)) + chunk(b"IEND", b""))


def main():
    assert pathlib.Path.cwd().resolve() == WORKTREE
    head = subprocess.check_output(["git", "rev-parse", "HEAD"], cwd=WORKTREE, text=True).strip()
    config_bytes = git_blob("simulation/boards/01/trial-01/config.json").replace(b"\r\n", b"\n")
    manifest_bytes = git_blob("simulation/boards/01/trial-01/manifest.json").replace(b"\r\n", b"\n")
    projection_bytes = git_blob("research/board01-projection.candidate-01.json").replace(b"\r\n", b"\n")
    assert digest(config_bytes) == "dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db"
    assert digest(projection_bytes) == "9ca9e520f1927426a3a5ba73a5eacaf90fedffc9385e7d08d5b1e6ee644b020c"
    assert digest(SOURCE.read_bytes()) == EXPECTED_SOURCE
    config = json.loads(config_bytes)
    manifest = json.loads(manifest_bytes)
    projection = json.loads(projection_bytes)
    matrix = manifest["projection"]["nativeToSource"]
    observed = {obj["id"]: obj for obj in projection["obstacles"]}
    points = []
    for pin in config["board"]["pins"]:
        item = observed[pin["id"]]
        source_center = project(matrix, pin["x"], pin["y"])
        assert math.dist(source_center, item["sourceCenterPx"]) < 1e-8
        points.append({"pinId": pin["id"], "nativeCenter": [pin["x"], pin["y"]],
                       "nativeRadius": pin["r"], "sourceCenterPx": source_center,
                       "observedFrontContactPx": item["observedFrontContactPx"],
                       "localScale": local_parameters(matrix, pin["x"], pin["y"]),
                       "occlusionStatus": "initial-probe" if pin["id"] in {"flower-01", "leaf-01", "frog-01", "wood-01"} else "not-prepared"})
    shadow = shadow_png()
    (ROOT / "shadow-native-disc-v1.png").write_bytes(shadow)
    probes = json.loads((ROOT / "occlusion-probes-v1.json").read_text(encoding="utf-8"))
    pins_by_id = {p["id"]: p for p in config["board"]["pins"]}
    occluders = []
    for probe in probes["probes"]:
        pin = pins_by_id[probe["pinId"]]
        poly = probe["sourcePolygonPx"]
        x0, y0 = min(p[0] for p in poly), min(p[1] for p in poly)
        x1, y1 = max(p[0] for p in poly), max(p[1] for p in poly)
        occluders.append({"id": pin["id"], "file": "01-jungle.jpg", "fileRole": "unchanged source image; bind Builder's existing authorized source path",
                          "sourceRect": [x0, y0, x1-x0, y1-y0], "depthNativeY": pin["y"],
                          "baseAnchorSourcePx": project(matrix, pin["x"], pin["y"]),
                          "observedFrontContactPx": probe["observedFrontContactPx"],
                          "polygonSourcePx": poly, "polygonRectLocalPx": [[x-x0, y-y0] for x, y in poly],
                          "edgeStatus": "coarse hand-authored probe; no motion acceptance", "contourUncertaintyPx": 5})
    write_json("occluders-v1.json", {"schema": "r4d.p2.artist.builder-occluders.v1",
        "sourceSha256": EXPECTED_SOURCE, "sourceSizePx": [1536, 1536], "acceptedP1Commit": P1,
        "sourceIsUnchanged": True, "occluders": occluders,
        "rasterization": "clip unchanged source texture to polygon; no source-image modification; keep sourceRect aligned exactly",
        "depthRule": "initial Builder single-depth contract; check side-contact switches in real assembled ticks",
        "motionReviewed": False})
    write_json("asset-contract-v1.json", {
        "schema": "r4d.p2.artist.asset-contract.v1", "staffId": "asset-artist-r4d-p2-free-01",
        "status": "proposed early assembled-example contract; motion unverified; generated ball absent",
        "source": {"path": str(SOURCE), "sha256": EXPECTED_SOURCE, "sizePx": [1536, 1536], "unchanged": True},
        "acceptedP1": {"commit": P1, "subtree": SUBTREE, "configCanonicalLfSha256": digest(config_bytes),
                       "manifestCanonicalLfSha256": digest(manifest_bytes), "projectionCanonicalLfSha256": digest(projection_bytes)},
        "projection": manifest["projection"],
        "ball": {"assetPath": None, "toolInvocationPerformed": False, "physicalRadiusNative": 16,
                 "appearance": "satin honey-gold sphere; upper-right warm light; lower-left olive-brown shade",
                 "display": "uniform screen-space circle; radius=16/w; proposed floor-contact lift derived from local Jacobian",
                 "alphaBoundsPx": None, "rawSha256": None},
        "light": {"observation": "bright upper-right surfaces; cast shadows down-left", "physicalReconstructionClaimed": False},
        "shadow": {"assetPath": "shadow-native-disc-v1.png", "sha256": digest(shadow), "sizePx": [128, 128],
                   "provenance": "new procedural alpha gradient from standard-library prepare-assets.py, no input image edits",
                   "anchorPx": [64, 64], "textureRadiusPx": 48, "nativeRadius": 18.4, "nativeOffset": [-8, 14],
                   "maxAlpha": 0.30, "rgb": [35, 36, 20], "mapping": "floor plane through accepted H", "blend": "normal"},
        "occlusion": {"probesPath": "occlusion-probes-v1.json", "builderManifestPath": "occluders-v1.json", "kind": "unchanged source texture clipped by authored source silhouettes; initial Builder depthNativeY contract",
                      "nativeConfigChanged": False, "artToggleDisablesMasks": True, "diagnosticsMasked": False,
                      "unprepared": ["other 21 obstacles", "railings", "basket front rims"]},
        "pins": points,
        "dropScale": local_parameters(matrix, config["board"]["drops"][0]["x"], config["board"]["drops"][0]["y"]),
        "basketScales": [{"id": p["id"], **local_parameters(matrix, p["x"], p["y"])} for p in config["board"]["buckets"]],
        "validation": {"sourceHashMatched": True, "configHashMatched": True, "projectionHashMatched": True,
                       "all25ProjectedCentersMatchAcceptedResearch": True, "assembledMotionReviewed": False}
    })
    utc = datetime.datetime.now(datetime.timezone.utc).isoformat()
    # Preserve the already observed STOP. Lead closed generation and requested no
    # repeated disk-guard loop; this script does not perform a new disk probe.
    free_bytes = {"C": 12251185152, "D": 17520750592, "E": 52465524736}
    free = {drive: value / (1024**3) for drive, value in free_bytes.items()}
    peak_c = 1.525
    guard_pass = free["C"] - peak_c >= 10
    write_json("generation-packet-v1.json", {
        "schema": "r4d.p2.artist.generation-packet.v1", "recordedAtUtc": utc,
        "intent": "one own transparent raster ball; no source-scene modification",
        "promptPath": "prompts/ball-v1.txt", "promptSha256": digest((ROOT / "prompts/ball-v1.txt").read_bytes()),
        "tool": "built-in image_gen.imagegen", "transparentBackground": True,
        "referenceImages": [], "requestedOutputCount": 1, "toolInvocationPerformed": False,
        "rawPaths": [], "toolIds": [], "modelAndSeed": "not exposed; not guessed",
        "finalManagedCopyDestination": "E:/CodexGeneratedImages/projects/r4d/2026-10-27/p2-asset-artist-free-01/ball-v1/",
        "projectDestination": "experiments/p2-free-approach/asset-artist/ball-v1.png",
        "heavyRuntimeRoot": "E:/R4D/perspective/p2-runtime/asset-artist/",
        "diskGuard": {"observedFreeGiB": free, "observedFreeBytes": free_bytes,
                      "measurementSource": "earlier stage-2 read-only preflight; C/E latest observation, D initial observation; not a fresh generation guard",
                      "newDiskMeasurementPerformedByThisScript": False, "reserveGiB": 10, "combinedCPeakGiB": peak_c,
                      "basisGiB": {"P2HistorySQLite": 1.25, "UGHWithMargin": .11, "coordinationWithMargin": .055, "managedImageWithMargin": .11},
                      "concurrentScope": "Lead-provided current bounded scope; do not lower history budget",
                      "minimumCFreeGiB": 11.525, "afterCombinedCPeakGiB": free["C"]-peak_c,
                      "missingCHeadroomGiB": max(0, 11.525-free["C"]),
                      "decision": "STOP_GENERATION_PACKET",
                      "leadClosedGeneration": True},
        "invocationAllowedByThisRecordAlone": False,
        "preservation": "No global TEMP/TMP/CODEX_HOME changes, no cleanup, no active image migration. Initial managed C write counted. Copy only at checkpoint with bytes/hash/timestamps/attributes and manifest; keep active C originals.",
        "generationAvailable": False, "whyNoFinishedBall": "No invocation; generation requires a fresh passing guard and known current combined scope."
    })
    radii = [p["localScale"]["ballRadiusSourcePx"] for p in points]
    print(json.dumps({"headAtPreparation": head, "pinCount": len(points), "ballDiameterAtPinsPx": [2*min(radii), 2*max(radii)],
                      "shadowBytes": len(shadow), "shadowSha256": digest(shadow), "CFreeGiB": free["C"], "CGapGiB": max(0, 11.525-free["C"]),
                      "generationCalled": False}, ensure_ascii=False))


if __name__ == "__main__":
    main()
