"""Compare captured browser frames with the exact artist delivery."""

import json
import math
from pathlib import Path

import numpy as np
from PIL import Image

assembly = json.loads(Path("assembly.json").read_text(encoding="utf-8"))
evidence = Path("output/playwright") / assembly["version"]
capture = json.loads((evidence / "capture.txt").read_text(encoding="utf-8-sig").splitlines()[1])
x, y = (math.floor(capture["frame"][axis] + 0.5) for axis in ("x", "y"))


def rgb(path, box=None):
    with Image.open(path) as image:
        frame = image.crop(box) if box else image
        return np.asarray(frame.convert("RGB"), dtype=np.int16)


def screen(name, panel):
    left = x + 366 * panel
    return rgb(evidence / f"{name}.png", (left, y, left + 354, y + 320))


def diff(name, first, second):
    delta = np.abs(first - second)
    changed = np.any(delta != 0, axis=2)
    print(f"{name}: {np.count_nonzero(changed)} px, max {delta.max()}, mean {delta.mean():.5f}")
    return changed, int(delta.max())


assert np.array_equal(
    screen("01-assembled", 0), rgb(Path("../artwork") / assembly["reference"])
), "Изменился исходник"
for panel, (method, path) in enumerate(assembly["methods"].items(), start=1):
    folder = (Path("../artwork") / path).parent
    rest = screen("01-assembled", panel)
    shifted = screen(f"03-{method}-reveal", panel)
    hidden = screen(f"03-{method}-leaf-hidden", panel)
    bronze = screen("06-eye-after", panel)
    for state, frame in [
        ("rest", rest), ("reveal-left14", shifted), ("leaf-hidden", hidden), ("bronze", bronze)
    ]:
        _, peak = diff(f"{method} Pixi/artist {state}", frame, rgb(folder / "views" / f"{state}.png"))
        assert peak <= 1, (method, state, peak)

    protected = np.asarray(Image.open(folder / "masks/protected-flower.png").convert("L")) != 0
    shift_diff, _ = diff(f"{method} shift/rest", shifted, rest)
    hide_diff, _ = diff(f"{method} hide/rest", hidden, rest)
    assert np.any(shift_diff) and np.any(hide_diff)
    assert not np.any((shift_diff | hide_diff) & protected), method
    print(f"{method} stationary protected flower pixels: {protected.sum()}")

    eye_mask = np.asarray(Image.open(folder / "masks/bronze-ring.png").convert("L")) != 0
    edit_diff, _ = diff(f"{method} bronze/rest", bronze, rest)
    assert np.any(edit_diff) and not np.any(edit_diff & ~eye_mask), method
    assert np.array_equal(screen(f"04-{method}-base", panel), rgb(folder / "layers/base.png")), method
    other = 3 - panel
    for change in ("reveal", "leaf-hidden"):
        assert np.array_equal(screen(f"03-{method}-{change}", other), screen("01-assembled", other))
    print(f"{method} isolated base exact; other branch unchanged; eye only within mask")
