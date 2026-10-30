# W04 — receiver target/depth mapping follow-up

Read-only source/frozen-input verification requested by Lead after W04-B01. **No missing offset/radius mapping found.** W04 remains immutable for both independent QAs; no renderer, art, native, trigger or RNG changes and no new candidate.

Accepted config and frozen targets agree for receiver02: centerY35187.089912187264, radius=depthRadius30.637312276520895. Frozen manifest retains receiver-back offset−1 and receiver-front+1. Source `src/app.mjs` line72 resolves exact targetId, line77 takes binding.native.anchor[1], line78 binding.native.depthRadius, line82 computes depthY+depthRadius*depthOffsetRadii. These receivers have no sourceClip container wrapper: layer is their sprite. Art sortableChildren is enabled at line31. The frozen bundle contains the same formula, and app SHA matches the already pinned570867bytes/0571bbdaa541fa8d5ad617c686118d69b4ba7dacca746652dc99f8489cc248c2.

The resulting back depth **35156.45259991074 is center−radius**, not centerY. Front depth is35217.727224463786. All4 receiver config/target centers/radii were checked; direct assignment uses native units throughout.

| Native state | Ball nativeY / ball depth | Relative to computed back depth |
|---|---|---|
| 1273 | 35149.985518 | Behind back sprite |
| 1274 | 35154.3192034 | Behind back sprite |
| 1275 | 35158.6773888 | In front of back sprite |

This crossing coincides with saved actual absence at1273/1274 and visible sphere at1275. It does not establish that the existing part-depth/art baseline gives acceptable entry occlusion. **W04-B01 remains OPEN for independent technical/visual analysis.** No direct Pixi runtime layer-property probe was performed in this follow-up; claims here concern exact frozen inputs, source/bundle mapping and the previously captured frames. No replacement art/depth offsets or hidden per-state fixes were introduced.

Detailed numeric evidence: `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/evidence/w04-depth-mapping/VERIFICATION.json`, **4272bytes**, SHA256 `38dd15e6a3835a2d8f37c7853f74230999c41275cc974fdc3853f919bb8c8f9e`. Includes4 receivers, both part depths and3 existing state comparisons. No new browser/native/oracle run. [W04 handoff](HANDOFF_W04.md) and all roots/listeners/evidence remain preserved. ServerWrites0/tokenGranted=false.
