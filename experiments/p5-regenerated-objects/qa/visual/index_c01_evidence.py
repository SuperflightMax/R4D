"""Inventory already captured own browser evidence; never drive or alter c01."""
from pathlib import Path
import datetime
import hashlib
import json
import re
import struct
from measure_source import jpeg_size

RUNTIME = Path("E:/R4D/perspective/p5-runtime/visual-qa/evidence/c01")


def main():
    integrity = json.loads((RUNTIME / "INTEGRITY.json").read_bytes())
    for item in integrity["inventory"]:
        data = (Path(integrity["publicRoot"]) / item["path"]).read_bytes()
        if len(data) != item["bytes"] or hashlib.sha256(data).hexdigest() != item["sha256"]:
            raise ValueError("c01 changed: " + item["path"])
    files = []
    for path in sorted(RUNTIME.iterdir()):
        if not path.is_file():
            continue
        raw = path.read_bytes()
        item = {"path": path.as_posix(), "bytes": len(raw), "sha256": hashlib.sha256(raw).hexdigest()}
        if path.suffix in (".png", ".jpg"):
            if raw[:2] == b"\xff\xd8":
                item["mimeType"] = "image/jpeg"
                item["renderedViewportScreenshotPx"] = jpeg_size(raw)
            elif raw[:8] == b"\x89PNG\r\n\x1a\n":
                item["mimeType"] = "image/png"
                item["renderedViewportScreenshotPx"] = list(struct.unpack(">II", raw[16:24]))
            else:
                raise ValueError("Unknown screenshot format: " + path.name)
            item["origin"] = "Own Codex IAB tab 1 actual screenshot, original returned bytes, unedited"
            match = re.search(r"seed(\d+)-t(\d+)", path.stem)
            if match:
                item.update(seed=int(match[1]), stateTick=int(match[2]))
            if path.stem.startswith("own-ordinary-start"):
                item.update(seed=3339315606, screenshotVisibleTick=44, preScreenshotAxTick=34, realtime=True)
            elif path.stem.startswith("own-ordinary-realtime-later"):
                item.update(seed=3339315606, stateTick=1709, realtimeTerminal=True)
            elif "terminal-hold" in path.stem:
                item.update(seed=1696420279, stateTick=875)
            elif path.stem.startswith("initial-"):
                item.update(seed=0, stateTick=0)
            item["framing"] = "field" if "field" in path.stem else "whole"
            item["art"] = "geometry-only" not in path.stem
            item["geometry"] = "geometry" in path.stem
            paired = path.with_suffix(".ax.txt")
            if paired.exists():
                item["axEvidencePath"] = paired.as_posix()
        files.append(item)
    result = {
        "schema": "r4d.p5.vqa-evidence/1", "candidate": "c01",
        "assembledUtc": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        "handoffCommit": "a259c8bcbf4f3b242a1f2001f06d14a0e89a6d4d",
        "consumerCommit": integrity["consumerCommit"], "artistCommit": integrity["artistCommit"],
        "appSha256": next(x["sha256"] for x in integrity["inventory"] if x["path"] == "app.js"),
        "stagedManifestSha256": next(x["sha256"] for x in integrity["inventory"] if x["path"] == "assets/manifest.json"),
        "acceptedInputPins": integrity["inputPins"],
        "start": {"id": "board01-start", "x": 33254.863169496064, "y": 33151.81331014809, "angleDeg": 90, "speed": 0},
        "browser": json.loads((RUNTIME / "BROWSER_OWNER.json").read_bytes()),
        "viewport": "Unedited 1265x712 browser screenshot pixels. No browser zoom changed. CSS viewport and DPR not separately instrumented; no subpixel visual precision claimed.",
        "guard": {"observedUtc": "2026-10-28T22:57:16.2665442Z", "systemRamGiB": 31.907, "freeRamGiB": 15.890,
                  "systemCpuPct": 3, "aggregateProcessCpuPct": 3.417, "aggregateWorkingSetGiB": 20.203,
                  "aggregatePrivateGiB": 19.124, "processCount": 444,
                  "diskFreeGiB": {"C": 16.921, "D": 16.282, "E": 12.134}},
        "ownOrdinaryReplay": json.loads((RUNTIME / "OWN_REPLAY.json").read_bytes()),
        "navigation": "Builder c01 replay index aca3ca025c5aee9a0fdf7069035ce376207029c38b99f48f0611e650b7a93c4b used only to locate events in already ordinary seeds. Displayed evidence is from own actual browser. No P2-P4/P6 results read.",
        "limits": ["Early 4/25 pins, 1/4 receivers; no final/artistic/technical/release PASS",
                   "All screenshots returned by getScreenshot were JPEG bytes despite original .png filenames. Bytes and names retained to preserve previously embedded links; actual MIME/dimensions recorded here. No transcode/edit.",
                   "Expanded debug captures can have different scroll. The consistent contact captures have debug collapsed.",
                   "Realtime first screenshot tick44 differs from pre-screenshot AX tick34; separately recorded, not a frozen frame.",
                   "These metadata checks do not replace visible assessment or independent TQA"],
        "files": files,
    }
    out = Path(__file__).with_name("EVIDENCE_C01.json")
    out.write_bytes((json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode("utf-8"))
    print(json.dumps({"file": str(out), "sha256": hashlib.sha256(out.read_bytes()).hexdigest(),
                      "bytes": out.stat().st_size, "screenshots": sum("mimeType" in x for x in files),
                      "evidenceFiles": len(files), "evidenceBytes": sum(x["bytes"] for x in files)}, indent=2))


if __name__ == "__main__":
    main()
