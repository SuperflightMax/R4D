from pathlib import Path
from PIL import Image
import hashlib, json, shutil

SOURCE = Path(r"K:\Agents\R4D\Review\HO-AF-01\C-ship-bakery\HO-AF-01_C_selected-master_from-C2-correction01_20261119T085657Z.png")
OUT = Path(r"K:\Agents\R4D\Review\HO-TP-01\assets\v001")
EXPECTED = "f6f96897290470778067ae15cba408418673f7578c38195736bee60fb822a65e"
CROPS = {"bread": (176, 535, 480, 320), "bowl": (464, 480, 384, 256)}
assert hashlib.sha256(SOURCE.read_bytes()).hexdigest() == EXPECTED
OUT.mkdir(parents=True, exist_ok=True)
original = Image.open(SOURCE).convert("RGB")
assert original.size == (1672, 941)
dest = OUT / "original_C2_exact.png"
if dest.exists():
    assert hashlib.sha256(dest.read_bytes()).hexdigest() == EXPECTED
else:
    shutil.copyfile(SOURCE, dest)
for name, (x,y,w,h) in CROPS.items():
    target = OUT / f"target_{name}_v001.png"
    zoom = OUT / f"inspect_{name}_2x_v001.png"
    if target.exists() or zoom.exists():
        raise FileExistsError(name)
    crop = original.crop((x,y,x+w,y+h))
    crop.save(target)
    crop.resize((2*w,2*h), Image.Resampling.NEAREST).save(zoom)
print(json.dumps({"source_sha256": EXPECTED, "crops_full_source_xywh": CROPS, "out": str(OUT)}))

