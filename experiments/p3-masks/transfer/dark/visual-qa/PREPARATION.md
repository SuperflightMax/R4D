# Dark — independent Visual QA preparation

Status: **PREPARED_AWAITING_FROZEN_CANDIDATE**. Source/input inspection only; no visual verdict, renderer run, human acceptance or mask PASS.

Prepared 2026-10-29, starting turn `01a186fc-4717-75e0-8725-5014d72cb42e`. Role `visual-qa-r4d-p3-masks-01`; branch `codex/r4d-p3-masks-visual-qa-01`; starting HEAD `0f282b89a5d58f6613153ceb385657c8fb761b1d`, clean. First action: read-only pinned order reads in the role's E worktree. Orders read in full at `c6603f0f327350172df44687a4d4ead19e0e5e6b`: `P3-transfer-water-dark.md`, `P3-masks.md`, `ORDER.md`, `P2-P6-transfer.md` under `orders/perspective/`. Max's explicit 2026-10-29 start decision replaces the old administrative wait for P6.

## Independently inspected inputs

Actual JPG pixels viewed at original 1536×1536 resolution. File SHA256 independently matched. All three JSON blobs independently read from exact P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`; canonical UTF-8/LF SHA256 matched. JSON final newline preserved. Manifest's historical provisional status remains unchanged; current acceptance comes from the transfer order.

P1 path prefix: `experiments/p1-collider-mapping/clean-repeat-01/`.

| Input | Exact path | SHA256 |
| --- | --- | --- |
| Source | `K:\Agents\R4D\Assets\perspective\02-dark-temple.jpg` | `7ceff71bd0a871fecd725527dff5522450c8e75a74eb99c107b5d8624bf8fa3a` |
| Config | `simulation/boards/02/trial-01/config.json` | `14be2a023833d266d1e333bf582af5fd5885deb445698c10ebd846ef0cc080b2` |
| Manifest | `simulation/boards/02/trial-01/manifest.json` | `3fab422bd1f74d477d1648620c97ad6d7b8b0a55a70a1102d6e6885def564d81` |
| Projection | `research/board02-projection.candidate-01.json` | `4dfa46589bb3fdfc8e2ad8ff2554737697e3ce9172c5b8d5c5583577df0c8c48` |

Config: 12 pins (6 bowl-base + 6 skull-base), 70 segments (48 obstacle + 22 explicit bounds), 4 buckets, one `board02-start` drop. Twenty-four objects retain 12 circles and 12 four-edge loops: six upright pillars and six rotated square pedestals. Native translation `[33307,33912]`; independently fitted projective floor q≈0.584603 and vanishing x≈731.123942. Start source `(768,293)`. This asymmetric camera/geometry must not inherit Water or Jungle transforms.

Read settings: r16, bounce0.9, tick5ms, quantize7, gravity980, max speed2000, angle noise2°, bounce noise0.02, wallBounce1, lcg32, time0–16s. Required native commit `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, order-specified tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`; actual candidate runtime still awaits binding/verification.

## Observations and limits before a candidate

The source has dark stone floor, red markings, pale skulls, circular bowls, upright rectangular pillars and rotated square pedestals with distinct front/side faces. Broad diagonal cast shadows lie on the floor. Both long borders have stepped stone details; the four foreground receivers have deep dark interiors and prominent pale front lips.

The accepted loops retain each pedestal's orientation; a single scalar front depth can therefore be a risk near oblique corners, but that risk is not a reproduced defect. Rear support corners are inferred. Circle footprints are smaller than the tall skull silhouettes. Elevated bowl-top foreshortening is approximate. Receiver triggers are conservative circles inscribed in dark openings, not the outer stone boxes. Preserve these mapping/registration limits and diagnose them separately from mask or renderer errors.

## Candidate case matrix

All rows are **PENDING**. Object groups are a coverage inventory; a tested instance never certifies the remaining instances.

| Case | Grounded target | Required visible evidence |
| --- | --- | --- |
| D-OBLIQUE-CORNER | `block-01..06`; especially central `block-04` and low `block-05/06` when reached | Continuous native movement into actual ball/silhouette overlap near an oblique corner, then out again. Correct local order across the adjoining front/side faces; no full-ball pop at a scalar depth transition. Save before/during/after and neighbouring ticks. |
| D-FRONT | Front faces/bases of `block-01..06`, `pillar-01..06` | Correct partial visibility during approach from behind and emergence in front, grounded in painted contour rather than only footprint/y values. Distinguish accepted contact misregistration from mask clipping. |
| D-SIDE | Both lateral faces of the observed blocks/pillars | Real side overlap on both sides; no mask flap over free floor, missing strip, clipping outside the body or abrupt switch at a corner. Opposite sides need their own coverage. |
| D-UPRIGHT | Far `pillar-01`, middle `pillar-02/03`, low `pillar-04..06` when reached | Tall narrow silhouettes, cap/base transitions and front corners remain stable as ball size changes with projection. |
| D-CURVED | `bowl-base-01..06`, `skull-base-01..06` | Curved bowl rims and tall skull contours hide only the appropriate ball/shadow portions. Do not infer physical entry into skull/bowl cavities from decorative dark pixels. |
| D-BORDERS | `left-1..9`, `right-1..9`, receiver dividers | Actual runs along both painted walls and stepped joins; inspect before/contact/after. Preserve the independently fitted off-center camera. |
| D-RECEIVERS | `receiver-01..04`; entry row1121, x intervals `[180,366]`, `[488,709]`, `[835,1067]`, `[1171,1384]` | Actual gap approach, entry into the dark opening, and correct foreground lip occlusion before terminal state. Numeric WIN is insufficient. Unreached receivers remain uncovered. |
| D-BALL-SHADOW | Open dark floor, pale/red details, far/near rows and actual overlaps above | At ordinary page scale, ball volume/light remains readable and a separate cast shadow stays coherent. Floor shadows baked into the source must not become opaque body masks that erase the ball outside an obstacle. |
| D-CONTROLS | Same paused replay/tick for independent Art/Geometry toggles; perspective/inverse if provided | Exact same native state; Art-off leaves no mask remnants; Geometry does not change trajectory. Enlarged corner diagnostics supplement ordinary-scale evidence. |

Concrete contact anchors from the inspected source support loops: `block-04` vertices `(736,766),(778,790),(738,832),(687,800)`; `block-05` `(391,1035),(442,1062),(400,1090),(346,1061)`; `block-06` `(1045,1037),(1099,1063),(1052,1091),(995,1063)`. These are support-footprint anchors, not complete painted silhouettes. Native IDs preserve `block-NN:edge-01..04` and `pillar-NN:edge-01..04`. Actual overlap ticks must come from candidate movement; no Dark run or frame has been observed yet.

## Execution and evidence contract

Before the first verdict, bind this board to its actual frozen CODE/ART commits, bundle path and manifest hash, source/config/projection hashes, native runtime proof, ball/shadow assets, and local preview URL. TQA and VQA must inspect that same frozen candidate. The preserved method reference is Jungle CODE `f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74`, ART `f899a308aed156a11e2a1013292ed68c6669959d`, handoff `4603d99a5904d10924f55416e36100b2c470b534:experiments/p3-masks/builder/FROZEN_CANDIDATE.md`. Source-aligned raster redraw/masks and the separate ball/shadow method are the baseline; any substantive method change needs an explicit checkpoint. Jungle's partial report and all existing Jungle files/assets remain preserved.

Start with the first three ordinary random runs and native replays of predeclared seeds1/2. Retain every run, including failures, with run order, seed, drop, outcome, actual state/tick and frozen input identity. Further runs may target missing overlap coverage; log all attempts and their purpose. Do not select only winning seeds or move the ball/change config to stage evidence.

Watch continuous motion first. Pause at real painted silhouette overlap and capture neighbouring ticks, expanding to actual approach/occlusion/emergence where necessary. Verify the tick/status visibly rendered in each screenshot: a newer DOM value after capture cannot rescue a stale frame. Retain raw captures; exclude stale/mismatched frames from claims. Pair normal-scale Art-on evidence with the same paused native state in diagnostic views. Numerical depth changes beside an object are not overlap evidence. Each result must distinguish observation, mapping/model limitation, and implementation attribution; gaps remain gaps. No invented Max/human QA. Dark's verdict remains independent of Water's result.

Own runtime: `E:\R4D\perspective\p3-runtime\visual-qa\transfer-water-dark\dark`; independently verified input copies are in `inputs/`. Own transfer output stays in this board's `visual-qa/` directory. The two boards share no config/replay/evidence files. Future review route `/review/r4d/p3-masks-dark/` is only planned. `server_write=false`: no upload, staging, lock, nginx, service changes or server cleanup without a fresh exact CTO token; P5 owns the next serialized window.

Resource checkpoint 2026-10-29T09:31:10Z: RAM total31.907/free16.743GiB, CPU1%/24 logical, free C16.341/D16.280/E11.942GiB. Combined initial Lead/Builder/Artist/two-QA estimate ≤4GiB RAM and ≤2GiB E is an estimate, not a reservation. This preparation uses small JSON/docs and two image reads; all six board input copies total170013 bytes. Refresh systemwide RAM/CPU/C/D/E and combined peak estimate before browser/build or other heavy work. E≤4GiB: diagnose; E≤2GiB: safe checkpoint/stop. No active wait, preview, server or candidate visual tests were started during this preparation.
