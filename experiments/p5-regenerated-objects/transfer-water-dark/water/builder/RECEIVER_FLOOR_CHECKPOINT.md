# Target-bound floor — implementation checkpoint, rim pending

Lead accepted the separate post-baseline plan and authorized this minimal implementation. **Source commit `eedd183a2652a8b9a2dce60118c0f32c8755d3b7`**, same own worktree/branch/model/effort. Water and Dark source consumers updated identically; no new candidate built/frozen. Original Water w04 and Dark d01 remain immutable/live for independent QA. Receiver correction is not ready: registered rim raster has not arrived.

## Implementation and ordering contract

Only target-bound `role:floor` gains the already existing **−1e8 floor rank**. Its normal target lookup, source anchor, projected footprint width/uniform scale and texture-local groundAnchor placement are unchanged. `$source` floor placement remains the full-frame branch. Shadows retain−1e7+nativeY; back/front/body/ball retain the original native-depth formula. No new role/schema/rank/physics/sorting principle or seed/tick-specific offset.

Existing deterministic tie-break remains explicit instance-ID creation order, followed by Pixi8.17.1 stable zIndex sort. Required concrete IDs/order:

`floor` → `receiver-01-base` → `receiver-02-base` → `receiver-03-base` → `receiver-04-base` at−1e8, then shadows, then ball/other solids according to their original depths. Each base retains the corresponding receiver target/texture registration. The verifier now rejects any target-bound floor ID that sorts before or equal to any scene-floor ID. Thus collection order is irrelevant; Actor should use the IDs above with the current scene ID `floor`. No implicit new render sub-rank or rename of existing baseline instances.

New sources are prepared in both consumers for future candidates. Updating Dark source does not rebuild/change d01; its original parts/rendered bytes stay unchanged. The guard does not change manifest schema. Earlier contract/schema/targets/config/projection/controller/native/PRNG files are untouched.

## Limited local verification

Actual cached Pixi8.17.1 `Container`, `Sprite` and `sortChildren` were used headlessly, with the exact current production placement function and exact production ID-order expression loaded from source. No mock sorting formula or NativeRun execution. Source placement was compared with the previous committed receiver-back placement using the same texture/target data.

- Water:3 input permutations ×5 existing reference states0/1230/1273/1274/1275 =15 real container-order checks.
- Dark:3 permutations ×4 reference states0/886/887/888 =12 checks.
- All27 checks: scene floor before all4 bases; all bases below every supplied shadow and ball. Floor order identical across permutations and state changes.
- Every base x/y/uniform scale exactly equals its prior receiver-back placement; none uses full-frame1536/textureWidth scale.
- Existing real manifests pass numeric validation. Example-only diagnostic fixtures add4 bases but keep original opaque backs and explicitly remain `example-not-renderable`; they are not an improved art candidate.
- Invalid `a-receiver-01-base` before scene `floor` is rejected on both consumers with the intended ID-order error. No PNG/unchanged dependency re-audit was run. All4 source files pass syntax checks.
- W04 FILE_INDEX c1c983dbddaaf556c5000dc9463df262fdc38444b2826a5883a2800b78b70554 and D01 d810ae08b53a0eaf44636df0adcb2c15eb4a0195b31db383534b4ea70af2116b and every public inventory entry rehash unchanged.

This verifies actual Pixi hierarchy ordering and placement, **not browser pixels, rim registration or visual receiver success**. It uses stored SHA-verified reference states,0 new native steps/exports/oracle runs and no new browser/listener. The earlier actual baseline failure frames remain.

Evidence: `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/evidence/target-floor-implementation/CHECKPOINT.json`, **24136bytes**, SHA256 `bfed39959c3033d22febcd1e34cb41f4e2dbb731951c4496ec6a0cbd2e98793e`; EVIDENCE_INDEX.json **1575bytes**, SHA256 `cb68019ff5628bb6e59c5f12ea3f425cdac4b6a4b1bc097db3e2847092ecbc86`. Report was captured from WIP before commit; source hashes match the implementation commit above. Reusable local reader: `water/output/check-target-floor.cjs` in own runtime.

Fresh local-check guard01:14:36UTC: RAM9.602/31.907GiB,CPU1%/aggregate5.46%,WS27.830GiB/491processes,C13.830/D14.620/E9.301GiB. Own peak1RAM/.05E +4RAM/2E concurrent allowance passed. All new output/TEMP/cache inside own E runtime; no install/model/host/settings/worktree/branch/foreignPID changes, denial0. ServerWrites0/tokenGranted=false.

## Remaining input and actual comparison

Artist via Lead: unchanged full PNG as each base/interior, registered rim/back-side-wall-only PNG with alpha0 interior and no duplicate front face, same confirmed canvas/ground/optical registration; existing front and back/front depth offsets retained. Validate full pixels/provenance/registration on that new handoff.

Only then build separate immutable **w05** with exact source/art/manifest/FILE_INDEX/root/URL/PID/session. Compare real earlier receiver02 approach and1273/1274/1275/terminal hold, Whole/Field, ArtOff/Geometry, config/state/RNG and unchanged camera; do not merely hide two frames. Later Dark successor is separate. Any need for another rank/schema/substantial method requires an explicit new variant decision. No successor success may be credited to original w04/d01 baseline. [Original plan](WATER_RECEIVER_PLAN.md).

Rim input subsequently received at Artist9647869d6dbf672ee5922b0fc57df254b9fdbb93. Separate [w05 handoff](HANDOFF_W05.md) now records the assembled correction and actual narrow approach; earlier rim-pending flags are historical checkpoint status. Independent closure remains separate.
