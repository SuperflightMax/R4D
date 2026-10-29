# Water — independent Visual QA preparation

Status: **PREPARED_AWAITING_FROZEN_CANDIDATE**. Source/input inspection only; no visual verdict, renderer run, human acceptance or mask PASS.

Prepared 2026-10-29, starting turn `01a186fc-4717-75e0-8725-5014d72cb42e`. Role `visual-qa-r4d-p3-masks-01`; branch `codex/r4d-p3-masks-visual-qa-01`; starting HEAD `0f282b89a5d58f6613153ceb385657c8fb761b1d`, clean. First action: read-only pinned order reads in the role's E worktree. Orders read in full at `c6603f0f327350172df44687a4d4ead19e0e5e6b`: `P3-transfer-water-dark.md`, `P3-masks.md`, `ORDER.md`, `P2-P6-transfer.md` under `orders/perspective/`. Max's explicit 2026-10-29 start decision replaces the old administrative wait for P6.

## Independently inspected inputs

Actual JPG pixels viewed at original 1536×1536 resolution. File SHA256 independently matched. All three JSON blobs independently read from exact P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`; canonical UTF-8/LF SHA256 matched. JSON final newline preserved. Manifest's historical provisional status remains unchanged; current acceptance comes from the transfer order.

P1 path prefix: `experiments/p1-collider-mapping/clean-repeat-01/`.

| Input | Exact path | SHA256 |
| --- | --- | --- |
| Source | `K:\Agents\R4D\Assets\perspective\04-water-temple.jpg` | `8da65c76c110b6ba7cefe113564fe12feed4428e84e84835f033e7da31d3b80d` |
| Config | `simulation/boards/04/trial-02/config.json` | `9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c` |
| Manifest | `simulation/boards/04/trial-02/manifest.json` | `48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420` |
| Projection | `research/board04-projection.candidate-02.json` | `ee0c6e429d4e0b1da6c342174d22369cd293c3fc4b18ccd7d09a4690f71da54f` |

Config: 6 frog pins, 106 segments (92 obstacle + 14 explicit bounds), 4 buckets, one `board04-start` drop. Twenty-one painted objects map to 29 primitives: 7 pillar loops, 6 frog circles and 16 independent feet for 8 arches. Native translation `[33256,34124]`; projective floor q≈0.444799, vanishing x=768. Start source `(712,280)`. Water trial-01 is not an input.

Read settings: r16, bounce0.9, tick5ms, quantize7, gravity980, max speed2000, angle noise2°, bounce noise0.02, wallBounce1, lcg32, time0–16s. Required native commit `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, order-specified tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`; actual candidate runtime still awaits binding/verification.

## Observations and limits before a candidate

The source contains pale arch bodies with dark openings, green stone columns/frogs, bright water channels, curved side walls, and four foreground water receivers. Painted shadows and reflections are part of the source. The accepted model collapses islands, internal water, short bridges and ramps onto one continuous 2D plane. It has no shoreline, height or lintel colliders. A visible water crossing alone therefore does not establish an implementation defect.

The horizontal native gap at both recorded foot rows exceeds the ball diameter32 for every arch. Front-row gaps below are derived directly from the independently inspected projection. They are horizontal widths, not minimum Euclidean distances, swept-path clearance, a 3D height certificate, or visual evidence.

| Arch | Foot source rows y | Front-row horizontal native gap |
| --- | --- | --- |
| arch-01 / arch-02 | 381–401 | 53.094862 / 52.011293 |
| arch-03 / arch-05 | 627–649 | 56.017350 / 57.017660 |
| arch-04 | 625–647 | 54.050223 |
| arch-06 | 787–810 | 55.261396 |
| arch-07 / arch-08 | 945–970 | 54.589397 / 54.589397 |

Native feet IDs are `arch-NN-left-foot:edge-01..04` and `arch-NN-right-foot:edge-01..04`. Rear support corners and outer-wall contacts behind cascades remain inferred. Receiver triggers are conservative circles in water-color patches, not recovered basin centers or volumes. Keep these mapping/model limits separate from demonstrated mask or renderer defects.

## Candidate case matrix

All rows are **PENDING**. Object groups are a coverage inventory; a tested instance never certifies the remaining instances.

| Case | Grounded target | Required visible evidence |
| --- | --- | --- |
| W-OPEN | `arch-07` first; then actual overlaps among `arch-01..08` at far/middle/near rows | Continuous native approach, passage through opening beneath lintel, emergence; source opening remains visible while the lintel hides the appropriate part of the ball. Save before/during/after plus neighbouring ticks at the real silhouette overlap. |
| W-LEFT-FOOT | Left feet of the observed arches | Real partial ball/left-support overlap, correct front/behind order, contact and emergence. A centered opening passage cannot alone cover this row. |
| W-RIGHT-FOOT | Right feet of the observed arches | Independent partial overlap on the opposite support; no whole-ball pop, opaque closure of the opening, or erased ball outside the support. |
| W-PILLAR | `pillar-01..07`, including middle `pillar-03/04` and near `pillar-07` when reached | Side/front silhouette overlap and corner transitions; ball/shadow occlusion must follow painted body, without turning its floor shadow into a body. |
| W-FROG | `frog-01..06`, including far `frog-01` and near `frog-06` when reached | Curved body silhouette and tall ornament overlap; compare actual contact against accepted circle, separate early/late mapping contact from mask clipping. |
| W-BORDERS | `left-1..5`, `right-1..5`, receiver dividers | Actual motion beside both painted borders and curved joins. Record hidden-contact uncertainty behind cascades; no invisible-wall claim solely from a depth flag. |
| W-RECEIVERS | `receiver-01..04`; entry row1047, x intervals `[120,375]`, `[495,700]`, `[835,1045]`, `[1160,1415]` | Real approach through a gap, entry into a basin and foreground lip overlap before terminal state. Numeric WIN alone cannot prove entry or lip coverage. Unreached receivers remain uncovered. |
| W-BALL-SHADOW | Open bright floor/water, far and near rows; same actual overlaps above | At ordinary page scale, volumetric ball remains readable and its separate cast shadow stays coherent with the scene. No opaque island of painted floor shadow covering the ball. No demand for water-height/splash simulation. |
| W-CONTROLS | Same paused replay/tick for independent Art/Geometry toggles; perspective/inverse if provided | Exact same native state; Art-off leaves no mask remnants; Geometry does not change trajectory. Diagnostic enlargement supplements ordinary-scale evidence. |

Lead-supplied TQA numerical witness received during preparation: ordinary preselected seed1, `arch-07`, tick1015, neighbour states1014/1015/1016, source≈`(518.076,957.456)`; that run is LOST/t1196 and is retained. Upstream WIP path: `E:\R4D\perspective\p3-runtime\technical-qa\transfer-water-dark\water\gate-native-witnesses-01.json`. This file has not been independently read or frozen by VQA. Treat the coordinates as a capture lead only; actual Pixi movement and frames must establish overlap. They do not establish left-foot/right-foot coverage or lintel height.

## Execution and evidence contract

Before the first verdict, bind this board to its actual frozen CODE/ART commits, bundle path and manifest hash, source/config/projection hashes, native runtime proof, ball/shadow assets, and local preview URL. TQA and VQA must inspect that same frozen candidate. The preserved method reference is Jungle CODE `f1aca21e7b9ba19001e7e8762fcaf2511bf9bf74`, ART `f899a308aed156a11e2a1013292ed68c6669959d`, handoff `4603d99a5904d10924f55416e36100b2c470b534:experiments/p3-masks/builder/FROZEN_CANDIDATE.md`. Source-aligned raster redraw/masks and the separate ball/shadow method are the baseline; any substantive method change needs an explicit checkpoint. Jungle's partial report and all existing Jungle files/assets remain preserved.

Start with the first three ordinary random runs and native replays of predeclared seeds1/2. Retain every run, including failures, with run order, seed, drop, outcome, actual state/tick and frozen input identity. Further runs may target missing overlap coverage; log all attempts and their purpose. Do not select only winning seeds or move the ball/change config to stage evidence.

Watch continuous motion first. Pause at real painted silhouette overlap and capture neighbouring ticks, expanding to actual approach/occlusion/emergence where necessary. Verify the tick/status visibly rendered in each screenshot: a newer DOM value after capture cannot rescue a stale frame. Retain raw captures; exclude stale/mismatched frames from claims. Pair normal-scale Art-on evidence with the same paused native state in diagnostic views. Numerical depth changes beside an object are not overlap evidence. Each result must distinguish observation, mapping/model limitation, and implementation attribution; gaps remain gaps. No invented Max/human QA.

Own runtime: `E:\R4D\perspective\p3-runtime\visual-qa\transfer-water-dark\water`; independently verified input copies are in `inputs/`. Own transfer output stays in this board's `visual-qa/` directory. The two boards share no config/replay/evidence files. Future review route `/review/r4d/p3-masks-water/` is only planned. `server_write=false`: no upload, staging, lock, nginx, service changes or server cleanup without a fresh exact CTO token; P5 owns the next serialized window.

Resource checkpoint 2026-10-29T09:31:10Z: RAM total31.907/free16.743GiB, CPU1%/24 logical, free C16.341/D16.280/E11.942GiB. Combined initial Lead/Builder/Artist/two-QA estimate ≤4GiB RAM and ≤2GiB E is an estimate, not a reservation. This preparation uses small JSON/docs and two image reads; all six board input copies total170013 bytes. Refresh systemwide RAM/CPU/C/D/E and combined peak estimate before browser/build or other heavy work. E≤4GiB: diagnose; E≤2GiB: safe checkpoint/stop. No active wait, preview, server or candidate visual tests were started during this preparation.
