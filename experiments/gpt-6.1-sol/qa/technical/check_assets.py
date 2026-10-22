"""Independent Technical QA: PNG channels and manifest hierarchy (read-only)."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[2]
manifest = json.loads((root / "assets/manifest.json").read_text(encoding="utf-8"))
parts = manifest["parts"]
by_id = {part["id"]: part for part in parts}
assert len(by_id) == len(parts) == 13
assert len({part["layer"] for part in parts}) == len(parts)
for part in parts:
    seen = set()
    current = part
    while current["parent"] is not None:
        assert current["id"] not in seen, "cycle"
        seen.add(current["id"])
        current = by_id[current["parent"]]
    with Image.open(root / "assets" / part["file"]) as image:
        assert image.mode == "RGBA", (part["id"], image.mode)
        assert list(image.size) == part["size"]
        histogram = image.getchannel("A").histogram()
        assert histogram[0] > 0 and histogram[255] > 0
        assert 0 <= part["pivot"][0] <= image.width
        assert 0 <= part["pivot"][1] <= image.height
        print(json.dumps({"id": part["id"], "mode": image.mode,
              "size": image.size, "transparent": histogram[0],
              "partial_alpha": sum(histogram[1:255]), "opaque": histogram[255],
              "parent": part["parent"], "layer": part["layer"]}, ensure_ascii=False))
print("PASS: 13 RGBA parts; nonempty alpha; dimensions/pivots; acyclic hierarchy; unique layers")
