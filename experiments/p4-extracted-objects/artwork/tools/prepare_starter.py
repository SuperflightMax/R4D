"""Prepare the three-object P4 integration sample from original source pixels.

Only crop/alpha selection, local restoration compositing and file registration
are deterministic here. Restoration images come from recorded image_gen calls.
No simulation, collider or projection is changed.
"""
import hashlib
import json
import os
from pathlib import Path
import shutil
import subprocess

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
RUNTIME = Path(os.environ.get("P4_ASSET_RUNTIME", r"E:\R4D\perspective\p4-runtime\asset-artist"))
SOURCE = Path(r"K:\Agents\R4D\Assets\perspective\01-jungle.jpg")
SOURCE_SHA = "c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72"
P1_COMMIT = "4b47db04c7140ebf88f69b91faa0b790d46f22ec"
P1_ROOT = "experiments/p1-collider-mapping/clean-repeat-01/"
INPUTS = {
    "config.json": (P1_ROOT + "simulation/boards/01/trial-01/config.json", "dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db"),
    "p1-manifest.json": (P1_ROOT + "simulation/boards/01/trial-01/manifest.json", "7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18"),
    "projection.json": (P1_ROOT + "research/board01-projection.candidate-01.json", "9ca9e520f1927426a3a5ba73a5eacaf90fedffc9385e7d08d5b1e6ee644b020c"),
}
RAW = [
    ("restoration-full-v01-partly-rejected.png", "exec-abfe4df0-c057-4f73-af0b-c6002170d95a.png"),
    ("restoration-flower-local-v02.png", "exec-1c2f7c02-bef4-4c94-a1ad-feaf0912c7f5.png"),
]

# Source-space outlines selected by the artist after viewing the original crops.
# Their interiors retain the source RGB bytes; the outline defines new alpha.
OUTLINES = {
    "flower-01": [(484,374),(488,365),(490,351),(497,344),(498,339),(510,333),(523,333),(529,336),(540,333),(550,337),(553,344),(561,348),(565,359),(563,368),(567,377),(565,389),(558,397),(548,401),(534,404),(515,403),(498,398),(488,390)],
    "wood-01": [(596,473),(599,462),(598,444),(600,435),(600,422),(606,416),(616,411),(631,410),(645,412),(654,417),(657,426),(656,439),(658,452),(656,471),(660,480),(656,489),(645,494),(627,496),(611,491),(600,486)],
    "receiver-01": [(203,1227),(210,1213),(223,1201),(244,1188),(274,1178),(306,1172),(341,1171),(374,1176),(406,1183),(437,1194),(464,1207),(481,1224),(488,1244),(486,1260),(477,1279),(467,1305),(460,1338),(445,1366),(423,1389),(397,1405),(377,1413),(369,1426),(356,1432),(345,1427),(337,1422),(329,1426),(313,1426),(302,1419),(290,1424),(280,1415),(270,1399),(257,1387),(244,1363),(232,1337),(224,1309),(216,1274),(207,1257),(201,1240)],
}
SHADOWS = {
    "flower-01": [(491,374),(510,388),(549,397),(545,407),(522,413),(493,416),(474,410),(470,400),(479,386)],
    "wood-01": [(599,465),(619,483),(653,490),(636,507),(611,521),(585,524),(567,516),(570,503),(583,482)],
}
FRONT_BOUNDARY = [(198,1225),(222,1239),(245,1254),(274,1265),(306,1273),(339,1278),(373,1276),(407,1270),(437,1259),(463,1246),(489,1228),(510,1460),(185,1460)]


def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def write_json(path, data):
    Path(path).write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")


def polygon(points, feather=0, scale=4):
    mask = Image.new("L", (1536 * scale, 1536 * scale))
    ImageDraw.Draw(mask).polygon([(round(x * scale), round(y * scale)) for x, y in points], fill=255)
    mask = mask.resize((1536, 1536), Image.Resampling.LANCZOS)
    return mask.filter(ImageFilter.GaussianBlur(feather)) if feather else mask


def transform(matrix, p):
    q = np.asarray(matrix) @ np.array([*p, 1.0])
    return [float(q[0] / q[2]), float(q[1] / q[2])]


def rect_json(box):
    return dict(zip(("x", "y", "width", "height"), (box[0], box[1], box[2] - box[0], box[3] - box[1])))


def source_part(source, mask, box, path):
    rgb = source.crop(box).convert("RGBA")
    rgb.putalpha(mask.crop(box))
    rgb.save(path)
    a = np.array(rgb)
    original = np.array(source.crop(box))
    # This checks extraction provenance, not artistic quality.
    assert np.array_equal(a[:, :, :3], original)
    return rgb


def main():
    assert sha(SOURCE) == SOURCE_SHA
    assert shutil.disk_usage(RUNTIME).free > 2 * 1024**3, "E <= 2 GiB: checkpoint and stop"
    for d in (RUNTIME / "inputs", RUNTIME / "raw", RUNTIME / "output", ROOT / "starter-v01"):
        d.mkdir(parents=True, exist_ok=True)
    data = {}
    for name, (path, expected) in INPUTS.items():
        b = subprocess.check_output(["git", "show", P1_COMMIT + ":" + path])
        assert hashlib.sha256(b.replace(b"\r\n", b"\n")).hexdigest() == expected
        (RUNTIME / "inputs" / name).write_bytes(b)
        data[name] = json.loads(b)
    raw_records = []
    for name, original in RAW:
        src = Path(r"C:\Users\user\.codex\generated_images\01a1818a-efc0-7fd1-bf77-caedc7b51442") / original
        dst = RUNTIME / "raw" / name
        shutil.copy2(src, dst)
        assert src.stat().st_size == dst.stat().st_size and sha(src) == sha(dst)
        raw_records.append({"name": name, "toolOutput": original, "bytes": dst.stat().st_size, "sha256": sha(dst), "sizePx": list(Image.open(dst).size), "originalRetained": True})
    write_json(RUNTIME / "raw" / "copy-manifest.json", raw_records)

    source = Image.open(SOURCE).convert("RGB")
    assert source.size == (1536, 1536)
    full_restore = Image.open(RUNTIME / "raw" / RAW[0][0]).convert("RGB").resize(source.size, Image.Resampling.LANCZOS)
    flower_restore = Image.open(RUNTIME / "raw" / RAW[1][0]).convert("RGB").resize((168, 168), Image.Resampling.LANCZOS)
    flower_canvas = source.copy()
    flower_canvas.paste(flower_restore, (440, 300))
    masks = {k: polygon(v) for k, v in OUTLINES.items()}
    background = source.copy()
    edit_masks = {}
    for object_id in OUTLINES:
        removal = np.array(masks[object_id])
        if object_id in SHADOWS:
            removal = np.maximum(removal, np.array(polygon(SHADOWS[object_id])))
        removal = cv2.dilate(removal, np.ones((9, 9), np.uint8))
        edit_mask = Image.fromarray(removal).filter(ImageFilter.GaussianBlur(2))
        edit_masks[object_id] = edit_mask
        background = Image.composite(flower_canvas if object_id == "flower-01" else full_restore, background, edit_mask)
    out = ROOT / "starter-v01"
    background.save(out / "background.png")
    union_mask = Image.fromarray(np.maximum.reduce([np.array(m) for m in edit_masks.values()]))
    union_mask.save(out / "restoration-regions.png")
    # All pixels outside the explicitly recorded patch support stay source exact.
    outside = np.array(union_mask) == 0
    assert np.array_equal(np.array(background)[outside], np.array(source)[outside])

    p1 = data["p1-manifest.json"]
    cfg = data["config.json"]["board"]
    natives = {x["id"]: [x["x"], x["y"]] for k in ("pins", "buckets") for x in cfg[k]}
    observations = {x["id"]: x for k in ("obstacles", "goals") for x in data["projection.json"][k]}
    boxes = {"flower-01": (462, 324, 576, 427), "wood-01": (554, 400, 672, 535), "receiver-01": (188, 1163, 509, 1443)}
    objects = []
    front_selection = polygon(FRONT_BOUNDARY)
    preview = background.convert("RGBA")
    for object_id, box in boxes.items():
        anchor = observations[object_id]["sourceCenterPx"]
        native = natives[object_id]
        inverse_native = transform(p1["projection"]["sourceToNative"], anchor)
        assert max(abs(a - b) for a, b in zip(native, inverse_native)) < 1e-6
        obj = {"objectId": object_id, "nativeKind": "bucket" if object_id.startswith("receiver") else "pin", "anchorSourcePx": anchor, "anchorLocalPx": [anchor[0] - box[0], anchor[1] - box[1]], "anchorNative": native, "anchorResearch": [native[0] - p1["translation"]["offset"][0], native[1] - p1["translation"]["offset"][1]], "sourceRectPx": rect_json(box), "parts": []}

        def add_part(role, image, provenance, depth):
            name = object_id + "-" + role + ".png"
            image.save(out / name)
            obj["parts"].append({"partId": object_id + ":" + role, "file": name, "sha256": sha(out / name), "sizePx": list(image.size), "sourceRectPx": rect_json(box), "anchorLocalPx": obj["anchorLocalPx"], "role": role, "depth": depth, "alpha": "straight", "provenance": provenance})
            preview.alpha_composite(image, (box[0], box[1]))

        if object_id in SHADOWS:
            # Recover one approximate shadow layer from original luminance against
            # restored floor. No duplicate baked shadow remains on the background.
            area = np.array(polygon(SHADOWS[object_id], feather=1.1), dtype=float) / 255
            area *= 1 - np.array(masks[object_id], dtype=float) / 255
            s = np.array(source, dtype=float).mean(2)
            b = np.array(background, dtype=float).mean(2)
            opacity = np.clip((b - s) / np.maximum(b - 36, 1), 0, 0.58) * area
            shadow = Image.new("RGBA", source.size, (36, 39, 22, 0))
            shadow.putalpha(Image.fromarray(np.uint8(opacity * 255)).filter(ImageFilter.GaussianBlur(0.6)))
            add_part("ground-shadow", shadow.crop(box), {"kind": "restored", "method": "source-shadow luminance recovery against local restored floor; dark olive tint; original shape, approximate alpha", "source": "01-jungle.jpg", "limitations": "floor texture and restoration estimates can affect edge opacity"}, {"layer": "ground", "sortNativeY": native[1]})

        if object_id == "receiver-01":
            a = np.array(masks[object_id], dtype=np.uint16)
            f = np.array(front_selection) >= 128
            # Exclusive ownership at the internal seam preserves exact reunion.
            front_alpha = np.uint8(np.where(f, a, 0))
            back_alpha = np.uint8(a - front_alpha)
            for role, alpha, layer in (("body", back_alpha, "receiver-back"), ("foreground", front_alpha, "receiver-front")):
                part = source_part(source, Image.fromarray(alpha), box, RUNTIME / "output" / (object_id + "-" + role + ".png"))
                add_part(role, part, {"kind": "extracted", "method": "original RGB with artist-selected alpha silhouette and opening boundary; no generative replacement"}, {"layer": layer, "sortNativeY": native[1], "occlusion": "back before ball; front after ball while it overlaps this receiver opening; retain the shared source anchor"})
        else:
            body = source_part(source, masks[object_id], box, RUNTIME / "output" / (object_id + "-body.png"))
            add_part("body", body, {"kind": "extracted", "method": "original RGB with artist-selected antialiased silhouette; no recolor, warp or regenerated object pixels"}, {"layer": "body", "sortNativeY": native[1], "occlusion": "compare ball ground native Y with this base anchor; partial overlap uses sprite alpha"})
        objects.append(obj)

    manifest = {"schema": "r4d.p4.artwork.v1", "version": "p4-starter-v01", "status": "small integration sample; consumer seam NOT YET VERIFIED; not full art or QA PASS", "source": {"canvasPx": [1536, 1536], "sha256": SOURCE_SHA, "name": "01-jungle.jpg"}, "p1": {"commit": P1_COMMIT, "configShaLf": INPUTS["config.json"][1], "manifestShaLf": INPUTS["p1-manifest.json"][1], "projectionShaLf": INPUTS["projection.json"][1], "translationOffset": p1["translation"]["offset"], "nativeToSource": p1["projection"]["nativeToSource"], "sourceToNative": p1["projection"]["sourceToNative"]}, "registration": {"sourceRectConvention": "integer x,y,width,height; PNG at sourceRect origin when untransformed", "anchorRule": "anchorLocalPx = anchorSourcePx - sourceRect.xy; native = research + P1 translation; no extra scaling or relocation", "alpha": "PNG RGBA straight/unassociated; let Pixi upload premultiply once; do not premultiply bytes again", "shadows": "ground-shadow parts once, below bodies and ball; selected baked originals removed from background; 23 other obstacles remain baked in this starter", "scope": "flower-01, wood-01 and left basket only; complete config stays active; not an extraction claim for the other objects"}, "background": {"file": "background.png", "sha256": sha(out / "background.png"), "sourceRectPx": {"x": 0, "y": 0, "width": 1536, "height": 1536}, "provenance": {"kind": "source-with-local-restoration", "regionMask": "restoration-regions.png", "regionMaskSha256": sha(out / "restoration-regions.png"), "restoredIds": list(OUTLINES), "outsideMask": "byte-identical RGB to decoded source", "method": "two image_gen restorations composited only under removal masks"}}, "objects": objects, "remaining": ["consumer PNG alpha/registration/depth seam needs real PixiJS confirmation before full slicing", "shadow alpha is approximate and needs normal-scale assembled review", "basket fine foliage/rope outline needs assembled review", "hidden back surfaces are not regenerated in this starter", "ball and separate ball-shadow not included yet", "23 pins, remaining receivers and rail foreground still baked into starter background"]}
    write_json(out / "manifest.json", manifest)
    write_json(out / "provenance.json", {"sourcePixelExtraction": "All body/foreground RGB bytes equal the decoded source at their sourceRect. Artist-specified antialiased alpha, no human retouch by Max.", "restorationRaw": raw_records, "selection": {"outlinesSourcePx": OUTLINES, "shadowRegionsSourcePx": SHADOWS, "basketFrontBoundarySourcePx": FRONT_BOUNDARY}, "retainedError": "full-frame v01 chose flower-02 instead of flower-01; only wood-01 and receiver-01 local portions used; flower-01 fixed with local v02 crop", "generatedPixels": "background restoration only; no generated obstacle RGB", "prompts": "See ../RUN_RECORD.md for exact image_gen prompts and decisions."})
    preview.save(RUNTIME / "output" / "starter-v01-reassembled.png")
    # A compact visual handoff, not a simulation/QA proof.
    sheet = Image.new("RGB", (1024, 768), (225, 230, 224))
    sheet.paste(background.resize((768, 768)), (0, 0))
    draw = ImageDraw.Draw(sheet)
    draw.text((780, 12), "P4 starter v01", fill=(20, 30, 20))
    draw.text((780, 32), "SOURCE PIXEL CUTOUTS", fill=(20, 30, 20))
    for index, obj in enumerate(objects):
        box = boxes[obj["objectId"]]
        sample = Image.new("RGBA", (box[2] - box[0], box[3] - box[1]))
        for part in obj["parts"]:
            sample = Image.alpha_composite(sample, Image.open(out / part["file"]))
        sample.thumbnail((236, 260))
        pos = (778, 80 + index * 185)
        sheet.paste(sample, pos, sample)
        draw.text((780, pos[1] - 18), obj["objectId"], fill=(20, 30, 20))
    sheet.save(out / "handoff-preview.png")
    write_json(out / "file-hashes.json", {p.name: {"sha256": sha(p), "bytes": p.stat().st_size} for p in sorted(out.iterdir()) if p.is_file() and p.name != "file-hashes.json"})
    print(json.dumps({"output": str(out), "manifestSha256": sha(out / "manifest.json"), "objects": len(objects), "parts": sum(len(o["parts"]) for o in objects), "backgroundRestoredIds": list(OUTLINES), "outsideRegionsSourceExact": True, "bodyRgbSourceExact": True, "status": manifest["status"]}))


if __name__ == "__main__":
    main()
