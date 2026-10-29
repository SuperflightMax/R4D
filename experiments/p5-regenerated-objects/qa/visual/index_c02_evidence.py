"""Index original own C02 screenshots and verify the frozen public inventory."""
import datetime
import hashlib
import json
from pathlib import Path
import re
from measure_source import jpeg_size

RUNTIME = Path("E:/R4D/perspective/p5-runtime/visual-qa/evidence/c02")


def main():
    integrity_path = RUNTIME / "INTEGRITY.json"
    integrity = json.loads(integrity_path.read_bytes())
    producer = integrity["index"]
    for item in producer["inventory"]:
        data = (Path(producer["publicRoot"]) / item["path"]).read_bytes()
        if len(data) != item["bytes"] or hashlib.sha256(data).hexdigest() != item["sha256"]:
            raise ValueError("Frozen C02 changed: " + item["path"])
    integrity["finalInventoryVerifiedUtc"] = datetime.datetime.now(datetime.timezone.utc).isoformat()
    integrity_path.write_bytes((json.dumps(integrity, ensure_ascii=False, indent=2) + "\n").encode())
    files = []
    for path in sorted(RUNTIME.iterdir()):
        if not path.is_file():
            continue
        data = path.read_bytes()
        item = {"path": path.as_posix(), "bytes": len(data), "sha256": hashlib.sha256(data).hexdigest()}
        if path.suffix == ".jpg":
            item.update(mimeType="image/jpeg", renderedViewportScreenshotPx=jpeg_size(data),
                        origin="Own Codex IAB tab2 actual screenshot; unedited original returned bytes")
            match = re.search(r"seed(\d+)-t(\d+)", path.stem)
            if match:
                item.update(seed=int(match[1]), stateTick=int(match[2]), captureMode="paused/frozen")
            else:
                item["captureMode"] = "moving or terminal; see BROWSER_OWNER/FRAMES for distinct AX/screenshot ticks"
            item["framing"] = "field" if "field" in path.stem else "whole"
            item["art"] = "geometry-only" not in path.stem
            item["geometry"] = "geometry" in path.stem
            item["axEvidencePath"] = path.with_suffix(".ax.txt").as_posix()
        files.append(item)
    result = {
        "schema": "r4d.p5.vqa-evidence/1", "candidate": "frozen-c02",
        "producerIndex": {"path": "E:/R4D/perspective/p5-runtime/builder/output/previews/c02/index.json",
                          "bytes": 10707, "sha256": "f40040bb40d529b7bf1f289e661d69f7f882fddfc962e40cdc5616a59c9d9389"},
        "consumerCommit": producer["consumerCommit"], "artistManifest": producer["artistManifest"],
        "normalizedArtistHead": "a5f26a57833e8671bf031a2b21c1b9f990dd3c87",
        "receiverAnchorContract": "2c8551e45876396e4b8f5df7f6d6c93713f89e2c:experiments/p5-regenerated-objects/builder/contracts/RECEIVER_ANCHOR_POLICY.md",
        "appSha256": next(x["sha256"] for x in producer["inventory"] if x["path"] == "app.js"),
        "inputPins": producer["inputPins"],
        "start": {"id": "board01-start", "x": 33254.863169496064, "y": 33151.81331014809, "angleDeg": 90, "speed": 0},
        "browserOwner": json.loads((RUNTIME / "BROWSER_OWNER.json").read_bytes()),
        "guard": json.loads((RUNTIME / "GUARD.json").read_bytes()),
        "ordinaryNewRuns": json.loads((RUNTIME / "ORDINARY_RUNS.json").read_bytes()),
        "verdict": "C01-V01 addressed in observed receiver01/03 cases; full artistic PASS withheld for C02-V01 premature near-ledge occlusion; TQA/privacy/release separate",
        "limits": ["50 actual screenshots; 1265x712 returned screenshot pixels, no browser zoom change; CSS viewport/DPR not separately instrumented",
                   "Short realtime receiver01: AX864/screenshot867, then875/875; new starts AX37/screenshot44 and AX39/screenshot45. Moving frames are not frozen captures.",
                   "New runs all retained; paused seek used to obtain terminal and selected later windows, not a full continuous realtime video",
                   "Receiver02/04 visible entry not reached; not inferred from static placement or formula",
                   "No 1922-point oracle or seeds0-3 matrix rerun; pinned prior ordinary traces used only as navigation for new foreground views",
                   "Own browser evidence only; no Builder screenshots used as replacement. No product changes, rebuild or release writes"],
        "files": files,
    }
    path = Path(__file__).with_name("EVIDENCE_C02.json")
    path.write_bytes((json.dumps(result, ensure_ascii=False, indent=2) + "\n").encode())
    print(json.dumps({"file": str(path), "bytes": path.stat().st_size,
                      "sha256": hashlib.sha256(path.read_bytes()).hexdigest(),
                      "evidenceFiles": len(files), "screenshots": sum("mimeType" in x for x in files),
                      "evidenceBytes": sum(x["bytes"] for x in files)}, indent=2))


if __name__ == "__main__":
    main()
