"""Read exact accepted P1 inputs; create inspection copies only in role runtime."""
import hashlib
import json
from pathlib import Path
import subprocess

from PIL import Image, ImageDraw, ImageFont

REPO = Path(__file__).resolve().parents[4]
RUNTIME = Path("E:/R4D/perspective/p4-runtime/visual-qa/input-review-01")
SOURCE = Path("K:/Agents/R4D/Assets/perspective/01-jungle.jpg")
P1 = "4b47db04c7140ebf88f69b91faa0b790d46f22ec"
P0 = "ee4d8e5c7dbb3b6618d58d6dacb0caf9b73dfb1b"
ROOT = "experiments/p1-collider-mapping/clean-repeat-01/"
EXPECTED = {
    "simulation/boards/01/trial-01/config.json": "dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db",
    "simulation/boards/01/trial-01/manifest.json": "7784dc0a215d0e472cf06a4eee03793592727cf0fa9a1fa0e0c78e5f1d17da18",
    "research/board01-projection.candidate-01.json": "9ca9e520f1927426a3a5ba73a5eacaf90fedffc9385e7d08d5b1e6ee644b020c",
}
SOURCE_SHA = "c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72"


def sha(data):
    return hashlib.sha256(data).hexdigest()


def blob(commit, path):
    return subprocess.check_output(["git", "-C", str(REPO), "show", f"{commit}:{path}"])


def main():
    RUNTIME.mkdir(parents=True, exist_ok=True)
    source_bytes = SOURCE.read_bytes()
    if sha(source_bytes) != SOURCE_SHA:
        raise ValueError("Source SHA mismatch")
    board = Image.open(SOURCE).convert("RGB")
    if board.size != (1536, 1536):
        raise ValueError("Source dimensions mismatch")
    records = [{"kind": "source", "file": "01-jungle.jpg", "sha256": SOURCE_SHA, "sizePx": list(board.size)}]
    parsed = {}
    for path, expected in EXPECTED.items():
        raw = blob(P1, ROOT + path)
        digest = sha(raw.replace(b"\r\n", b"\n"))
        if digest != expected:
            raise ValueError(f"P1 SHA mismatch: {path}")
        target = RUNTIME / Path(path).name
        target.write_bytes(raw)
        parsed[path] = json.loads(raw)
        records.append({"kind": "p1", "commit": P1, "path": ROOT + path, "shaLF": digest})
    paths = [
        "research/evidence/board01-source-candidate.jpg",
        "research/evidence/board01-inverse-whole-source.jpg",
        "viewer/src/view-math.mjs",
    ]
    for path in paths:
        raw = blob(P1, ROOT + path)
        (RUNTIME / Path(path).name).write_bytes(raw)
        records.append({"kind": "p1", "commit": P1, "path": ROOT + path, "sha256": sha(raw)})
    recipe_path = "experiments/p0-perspective/research/CROSS_SERIES_CONCLUSION_AND_RECIPE.md"
    raw = blob(P0, recipe_path)
    (RUNTIME / "P0-RECIPE.md").write_bytes(raw)
    records.append({"kind": "p0", "commit": P0, "path": recipe_path, "sha256": sha(raw)})
    # Source pixels remain at 1:1. Padding and labels are inspection aids.
    rois = [
        ("A flower-01: petals, moss, shadow", (420, 315, 600, 450)),
        ("B wood-01: top, base, cast shadow", (530, 390, 690, 550)),
        ("C leaf-02: tips, base, shadow", (635, 485, 810, 625)),
        ("D left rail: curve and vegetation", (265, 430, 475, 760)),
        ("E receiver-01: platform / rear / front", (150, 1070, 530, 1460)),
        ("F near seam and receiver-02", (490, 1010, 925, 1410)),
    ]
    font = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 18)
    small = ImageFont.truetype("C:/Windows/Fonts/arial.ttf", 14)
    sheet = Image.new("RGB", (1440, 940), "#20252b")
    draw = ImageDraw.Draw(sheet)
    for i, (label, rect) in enumerate(rois):
        x, y = (i % 3) * 480, (i // 3) * 470
        draw.text((x + 12, y + 8), label, fill="white", font=font)
        draw.text((x + 12, y + 34), f"sourceRect xyxy={rect}; 1 source px = 1 image px", fill="#b9c4cc", font=small)
        crop = board.crop(rect)
        sheet.paste(crop, (x + 12, y + 60))
    output = RUNTIME / "source-risk-crops-1to1.png"
    sheet.save(output)
    records.append({"kind": "inspection-crops", "file": output.name, "sha256": sha(output.read_bytes()),
                    "rois": [{"label": label, "sourceRectXyxyPx": list(rect)} for label, rect in rois], "pixelScale": 1})
    (RUNTIME / "input-review-index.json").write_text(json.dumps({"records": records}, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    projection = parsed["research/board01-projection.candidate-01.json"]
    print(json.dumps({"runtime": str(RUNTIME), "records": len(records),
                      "firstStitch": [{k: item[k] for k in ("id", "sourceCenterPx", "observedFrontContactPx")}
                                      for item in projection["obstacles"] if item["id"] in ("flower-01", "wood-01")],
                      "goals": [{k: item[k] for k in ("id", "sourceCenterPx")} for item in projection["goals"]]}, ensure_ascii=False))


if __name__ == "__main__":
    main()
