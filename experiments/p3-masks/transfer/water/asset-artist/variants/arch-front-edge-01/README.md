# Water arch-front-edge-01 — ordinary depth-data correction

Baseline first full ART: `17dc9fcdc261562acb581dd8590096819734c807`.
Original `water/asset-artist/assets.json` remains untouched, SHA256
`e93e5cfb6fbfa3c4ca9e5c2eadbc46b628713e952fe033fa216e00598e2a849d`.
Early7-mask4eb4001/early02 and their evidence also remain available.

Reason: independent VQA and Builder observed an abrupt unmask at arch07
seed1/t1014→1015, while ordinary native movement remains continuous and
the sphere still overlaps the visible body. Artist reviewed the saved Pixi
frames and agreed the change is visible. This is a local P3 depth-data defect.

## Reproducible geometric rule

For each of the16 accepted Water arch-foot quadrilaterals use the midpoint
of its near/front edge (consecutive accepted vertices2→3) in native space,
instead of the centroid of all4 vertices. The script verifies that edge2→3
has the largest native-Y midpoint; it does not reorder/repair the polygon.
Use the original P1 translation. Left/right bodies keep depthNativeY, and
the lintel keeps depthLineNative joining the two front-edge midpoints.
This rule is independent of seed, tick, trajectory and ball radius.

| Arch | Before native Y | Front-edge native Y | Delta |
|---|---:|---:|---:|
| arch-01 |33490.838884|33517.413955|26.575072|
| arch-02 |33490.838884|33517.413955|26.575072|
| arch-03 |34096.835641|34121.751095|24.915454|
| arch-04 |34092.302634|34117.249101|24.946467|
| arch-05 |34096.835641|34121.751095|24.915454|
| arch-06 |34443.097827|34466.728714|23.630887|
| arch-07 |34755.123493|34778.551277|23.427784|
| arch-08 |34755.123493|34778.551277|23.427784|

Exact24 region before/after values are in ANCHOR_CHANGES.json and ANCHORS.csv.
All other47 occluders, sourceSize, ball and shadow metadata are identical.
All73 PNG files (71 masks + ball/shadow) are exact baseline Git bytes; input
config/projection/manifest, source JPG, native core/r16/PRNG and renderer are
unchanged. PNGs were copied, never regenerated or rewritten. No new sort.

## Bounded self-check and limits

The ordinary native seed1 was replayed read-only through the existing pinned
compiled module (`af8e6dea9ee5c46759f99ba3b68f4afa91c740b4fd2aba2d2d3f65bfa66753fa`).
Config bytes9048b28a match P1; state1014 exactly matches Builder checkpoint.
Outcome remains LOST at1196. No successful-seed selection.

EVALUATION.json estimates sphere-alpha overlap using actual states1006–1035
and the frozen projection/r16/lift0.65 with Pillow bilinear sampling:
old threshold flips at1015 with21.324% geometric alpha overlap; new threshold
flips at1021 with0.001% remaining overlap. This supports testing the data
correction. Filtering differs from Pixi and shadow coverage was not assessed
by this estimate. It is not independent QA, actual movement, or artistic PASS.

Builder comparative target: same seed1, frames1006–1018 and extend through
1020/1021/1022 to inspect the new crossing. Check ball and separate shadow,
normal scale and enlarged view; preserve bad results. Other arches/seeds
still need ordinary actual Pixi checks. The correction is not claimed universal.

Consume this directory's assets.json via its exact named Git prefix. Relative
paths are self-contained. Internal hashes cover consumer bytes; external
freeze manifest also covers this report/evaluation/table/provenance/hashes.
