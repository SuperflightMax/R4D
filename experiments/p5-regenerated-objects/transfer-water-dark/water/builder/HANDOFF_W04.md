# Water w04 — mini03 whole-gate baseline for independent QA

30 октября 2026, Europe/Kyiv. Frozen local candidate; Producer narrow actual check complete. **PARTIAL, independent QA pending, W04-B01 OPEN.** No FullArt/contact/occlusion/order PASS. ServerWrites0/tokenGranted=false. Jungle remains unchanged.

## Exact candidate

- Consumer `48763f47d1e21e32334df3427209181a5a6114de`; renderer byte-identical w02. This commit adds a required Artist provenance guard to both board build scripts, without renderer/native changes.
- Artist `541085603e01e23b076fe33ff3c9991822c0bce2`.
- Source `experiments/p5-regenerated-objects/transfer-water-dark/water/asset-artist/asset-manifest.mini-03.json`: **44339 bytes**, SHA256 `50dceb14be6f71a429231a89c44c67d75198e1c9dd9d425c6e8c1747f251803f`.
- Staged `assets/manifest.json`: **30754 bytes**, SHA256 `e982264b077f4b55ebc0b3f53f4bceffbdb96cc1cd383eefd5831dfab1baf6d5`.
- Root `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/output/previews/w04/public`.
- `../FILE_INDEX.json`: **6632 bytes**, SHA256 `c1c983dbddaaf556c5000dc9463df262fdc38444b2826a5883a2800b78b70554`.
- `../index.json`: **14353 bytes**, SHA256 `e6cc30c5cc6a6489dbbda931a63e3849448acb4697e7123631c8e47eb5db95b2`.
- 21 public files /11823570 bytes. `app.js` **570867 bytes**, SHA256 `0571bbdaa541fa8d5ad617c686118d69b4ba7dacca746652dc99f8489cc248c2`, identical to w02/w03. All frozen inventory bytes checked.
- URL **http://127.0.0.1:55192/**; PID **37932**, exec session **37240**, started `2026-10-30T00:19:40.551Z`. Own process/root/port checked. Current owner `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/preview-owner.json`. Localhost only; leave live for QA.

Source handoffs are raw Git bytes in own runtime `water/handoffs/mini02` and `mini03`. Mini02 Artist4395f6f2c7eff096e6da283f5f78fd45a4346aad source40316bytes/SHA6948fdd7fccc60612183a2a8f9d6ce88f78ecd137931297c8fca556b3c19169a was built, but not separately frozen before the mini03 superset arrived. All14 mini02 texture entries and27 instances are structurally identical in mini03; its old5PNG/metadata are unchanged from mini01.

## Coverage and registration

9 unique unchanged generated PNG /15 texture IDs /30 instances: generated floor, ball/ball shadow, all7 pillars with shadows, frog01 with shadow,4 receiver back/front pairs, whole arch07 and2 separately bound foot shadows. **9/21 art obstacle groups**; missing5 frogs,7 arches and environment foreground clips. SourceClip count0. Texture aliases reuse PNG bytes, not new generations.

Accepted P1 Water04/trial02 only: commit4b47db04c7140ebf88f69b91faa0b790d46f22ec; config SHA9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c, manifest48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420. Start/projection/translation/native core/r16/tick5ms/physics/RNG and2D plane collapse unchanged. Geometry6pins/106segments/4buckets; arch assembly registers8 existing foot edges and adds no lintel/height collider. No Jungle art/offset substitution, XYwarp, image trim or per-state correction.

Mini03 body bindings9/9 match exact target native/source anchors. Whole arch07 PNG1388×1133,1176242bytes/SHA `b8de40ba0fc1a0dfa7d47a7840042c482416667705cfd5ddbcbc2942c63af2c3`. `ARCH_BASELINE.mini-03.json`1404bytes/SHA2ff4fc0cd92d391407f23b2e6604c1df16b85595c342a67b6d2fe628f9140192. Authored footprint1257×190 against target123×25, uniform scale0.09785202863961855, rendered depth18.591885441527523, **residual−6.4081145584735 sourcepx**. Ground anchor[693,925] is provisional hidden-rear-plane inference, uncertainty±2.9355608591885565sourcepx. This original whole-sprite center-depth baseline is preserved before improved parts or any substantial sorting/preparation variant. Unregistered left/right/lintel edits are not selected. Support-shadow depth residuals−14.04924615185363/−13.695996027718506sourcepx are retained; visual adequacy unverified.

New receiver policy independently checked on all8 back/front instances. New sphere L523texturepx, optical O[627,500], aperture capture proxy230×120; logical A=[O.x,O.y+hR], hR=L*sB/sR, groundAnchor=footprint.center=A. New cup shifts−18.66714730734409/−18.644206160564494/−18.629922880002002/−18.651484968023954sourcepx. All anchor errors≤1e−9texturepx; native/source targets and back/front registration match. These are new-art/projection measurements; not Jungle17.8. Proxy and optical uncertainty remain declared; passing arithmetic does not prove visual entry.

Framing correction from w02 remains in the identical renderer. Actual w04 fixed Field bounds X−10.318300383148722..1533.39607382019, Y249.72811384258958..1403.2984506144696 include new receiver alpha and initial ball alpha>0. Initialized at accepted drop once, fixed across ticks/views/seeds. No camera follow or world displacement. Full start sphere observed in Field/Whole; independent W01-V01 closure is now CLOSED on w02 by VQA commit9cd09281e27404a526fe25b387a23d34467024d5. This does not close W04-B01 or establish Full Water artistic PASS.

## Actual checks and open observation

Own hidden IAB tab6 closed after30 paused snapshots /20 unique seed-tick pairs, plus1 moving AX state. All31 states/RNG match exact existing TechnicalQA input-oracle-001 traces after reference hash verification. No new oracle, seed search or full QA run. Screenshots are original JPEG bytes, no re-encoding.

- Seed0: startup Field/Whole, Art+Geometry/Art-only, frog01 states105/106/107 and Geometry107.
- Seed1: start0; arch07 states998,1008,1009,1012,1013,1014,1018,1019,1020,1021,1031. Actual original contacts: event1012 right-foot:edge-04 → state1013, event1018 left-foot:edge-02 → state1019. Both adjacent triples retained. Art+Geometry1013/1019, Geometry-only1019 and Whole1019 preserve state/RNG. Native real-time from998: AX1035, paused1088; moving screenshot and AX are not atomic, so no exact screenshot-tick claim.
- Seed2: receiver02 actual1273/1274/1275, IN_BUCKET receiver02 at1275. After `+1`, exact state1275 remains; terminal Art+Geometry/Geometry-only preserve it. No artificial state1276, sinking/fade or forced successful path.

**W04-B01 OPEN:** sphere is absent in actual receiver02 frames1273/1274, visible in basin at1275. Existing back-depth35156.45259991074 is crossed between ball nativeY35154.3192034 at1274 and35158.6773888 at1275 (1273:35149.985518). This supplies a concrete visibility-transition case to VQA; receiver entry/occlusion is not accepted. Original pictures: `water/evidence/w04-browser/seed2-receiver02-{1273,1274,1275}.jpg`. Preserve baseline before changing part registration/occlusion. No geometry/native/tick/seed correction to hide it.

Ordinary input-oracle reference outcomes retained, including unfavorable ones; these four full runs were not repeated by Builder on w04:

| Seed | Existing reference terminal |
|---|---|
| 0 | LOST1326 |
| 1 | LOST1196 |
| 2 | IN_BUCKET receiver02/1275; actual w04 terminal also checked |
| 3 | LOST589 |

## Evidence and history

Evidence root `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/evidence/w04-handoff`:

- `EVIDENCE_INDEX.json`: **34076 bytes**, SHA256 `b340633871d49f60cd681df68e2281dfd48eaf73e889172ae415cad63db538b9`;123 browser files +8 report/build/owner/pin snapshots, exact localhost HTTP app/manifest/config bytes checked.
- `selfcheck-summary.json`: **26359 bytes**, SHA256 `351fa8d8d00d9a2fc9bf3d304751a730b94cf23dd0e50c5eecbc928fa2bc7c9a`.
- Source inputs/supporting pins, receiver calculations, arch registration and evidence reader copied without publishing private native TS/maps.

W03 was frozen before Builder found its packaging sidecar used incompatible key names: Artist commit/path became null though source/staged hashes and selected PNG were correct. It remains immutable at `water/output/previews/w03`, FILE_INDEX4724bytes/SHAd6a62bb0a335cd4271c45fe91d99894932d24518960da32e398dc56c7535f779; URL55191/PID10852/session58420, archived owner `water/preview-owners/w03-pid10852.json`. W04 changes only `data/preview-input.json` from w03; all20 other public files, app and PNG are identical. Provenance guard48763f4 requires valid commit/path/bytes/SHA before staging; both build-script syntax checks and actual accepted w04 build passed. Original wrong sidecar preserved outside public root.

W01 URL55188/PID38664/session80589 and W02 URL55190/PID17036/session64255 remain live/unchanged. W02 owner now archived `water/preview-owners/w02-pid17036.json`; old links use this exact snapshot. W00/D00 unchanged. All w01–w04 public inventories rehashed successfully. No foreign PID or listener stopped.

Build resource guard00:19:25UTC: RAM10.766/31.907GiB, CPU5%/aggregate8.42%, aggregateWS25.881GiB/474processes,C14.858/D14.640/E9.595GiB; own peak2RAM/.3E +4RAM/2E concurrent allowance, allowed. Prior browser guard00:17:54 RAM10.710,CPU2%/aggregate6.38%,E9.598. All new source/runtime/TEMP/cache/output own E, cached native read-only; no install/rematerialization, host/model/effort/settings/worktree/branch changes, denial0 or server/release action.

Next: independent TQA/VQA of exact w04, evaluate W04-B01 and whole arch baseline before improved parts; continue missing Water groups/environment and Dark art integration when handed over. Dark remains the preserved d00 native scaffold. Public delivery gate closed.

Follow-up: [DEPTH_MAPPING_W04.md](DEPTH_MAPPING_W04.md) records the checked source/frozen-bundle mapping: back35156.4526 equals center35187.0899 minus radius30.6373. Existing offset−1 is applied; no mapping omission found. W04-B01 remains open for both dispatched independent QAs. W04 and its evidence were not changed. W02 independent closure report: [9cd09281e27404a526fe25b387a23d34467024d5](E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/handoffs/vqa-w02-closure-001/REPORT_W02_CLOSURE.md). Original Producer evidence predates that closure.

Current successor w05: [HANDOFF_W05.md](HANDOFF_W05.md), separately reported. Original root/evidence remains immutable/live; exact owner archived at E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/preview-owners/w04-pid37932.json. Current water/preview-owner.json belongs to w05. No successor success credited to this baseline.
