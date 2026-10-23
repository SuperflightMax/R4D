"""Read-only independent Q1 Technical QA asset/baseline verification."""
import hashlib
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[2]
manifest = json.loads((root / "assets/manifest.json").read_text(encoding="utf-8"))
parts = manifest["parts"]
by_id = {p["id"]: p for p in parts}
assert len(parts) == len(by_id) == 13
assert len({p["layer"] for p in parts}) == 13
for p in parts:
    seen = set()
    current = p
    while current["parent"] is not None:
        assert current["id"] not in seen
        seen.add(current["id"])
        current = by_id[current["parent"]]
    with Image.open(root / "assets" / p["file"]) as image:
        assert image.mode == "RGBA"
        assert list(image.size) == p["size"]
        alpha = image.getchannel("A").histogram()
        assert alpha[0] > 0 and alpha[255] > 0
        assert 0 <= p["pivot"][0] <= image.width
        assert 0 <= p["pivot"][1] <= image.height
        print(json.dumps({"id": p["id"], "size": image.size, "alpha0": alpha[0],
                          "alpha255": alpha[255], "pivot": p["pivot"],
                          "joint": p["joint"], "layer": p["layer"]}))
digest = lambda path: hashlib.sha256(path.read_bytes()).hexdigest()
baseline = root.parent / "gpt-6.1-sol/dist"
expected = {p.relative_to(baseline).as_posix(): digest(p) for p in baseline.rglob("*") if p.is_file()}
assert len(expected) == 42
for directory in [root / "public/baseline", root / "dist/baseline"]:
    actual = {p.relative_to(directory).as_posix(): digest(p) for p in directory.rglob("*") if p.is_file()}
    assert actual == expected, str(directory)
print("PASS 13 RGBA parts / pivots / unique layers / acyclic hierarchy; both 42-file baseline copies byte-identical")
