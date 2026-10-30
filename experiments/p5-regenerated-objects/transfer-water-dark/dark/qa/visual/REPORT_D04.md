# Dark d04 — independent floor-join Visual QA

2026-10-30, Europe/Kyiv. **D04_FLOOR_PAIRED_QA_COMPLETE; D02-V01_OPEN; D03_RECEIVER_CLOSURE_PRESERVED_SEPARATELY; FULL_DARK_ART_AND_P5_TRANSFER_UNVERIFIED.**

**D02-V01 не закрыт.** В actual normal Whole seed0/840 и Field seed2/972 под светлой near cap по-прежнему читаются три тёмных провала между cups01/02,02/03,03/04. Новая нижняя basalt facing видна и читается вертикально, но непрерывного соединения непосредственно под cap в трёх целевых местах не установлено. Причину alpha/sort/geometry/native не приписываю. Это остаток прежнего visual finding, не новый дубликат дефекта.

## Exact input and independent verification

Consumer d190ef3f0d4a0f997048ca511d7d70c9fc07181d; Artist 3de95fb4ca886202c9a21823a9dc843952181060; handoff c6f68a4774e3a4a7c0c4dafa46512d625bab9b96. [EVIDENCE_D04.json](EVIDENCE_D04.json) содержит все file hashes,9 original JPEG+AX, 5 paired d02 states, 18 native state/RNG checks. Runtime: E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d04.

| Independent check | Pin/result |
|---|---|
| FILE_INDEX outside public | 7000bytes; c514e5cf9e0bda619cad89a166e115ab8b88ed3379b5380bbc54ed8f03e06b25 |
| Source manifest | 50189bytes;75d9c4f5c3a72cc6d990c9651985004e8f16e7b695cca5284330d9f7fa65dc08 |
| Staged manifest | 35533bytes;6d2e7eef6e3b39dfa8ce212f82b8f2da42ae14eedba4dc55eef9504baec89156 |
| Public inventory | All 20 files/15548848bytes verified.8 PNG / 15 texture IDs / 35 instances;12/24 body groups |
| App | 570889bytes;ba21d2d6a308acbbb4658d937f4ba942ebc6f473d7d934f3eb267c4f6c16afd8, exact d02/d03 |
| Only new PNG | floor-v4,2757561bytes;c0367aea62de74f187c37a3cf8fb10067b9cbe5b2177939c86ae3f76a0e0421d |
| Retained actors | Exact object equality34 nonfloor instances/14 descriptors;all 7 actor PNG hashes retained. Receiver full/front policy unchanged from d02 |
| Separation | D03 rim PNG 5f00b575… absent by design; no d03+d04 combined manifest |
| Producer support | Source/staged/support raw bytes verified and frozen in own runtime. Opaque alpha/RGB probes/boundary estimate are metadata, not actual join closure |

Accepted Dark02/trial01/P1 4b47db04c7140ebf88f69b91faa0b790d46f22ec; config 14be2a023833d266d1e333bf582af5fd5885deb445698c10ebd846ef0cc080b2; P1 manifest 3fab422bd1f74d477d1648620c97ad6d7b8b0a55a70a1102d6e6885def564d81. Native source 5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023/tree 008d16a80a26bb77d562a45218b01da09b0d9ff0 retained. Original Dark JPG remains read-only, SHA 7ceff71bd0a871fecd725527dff5522450c8e75a74eb99c107b5d8624bf8fa3a.

## Actual normal Whole and Field — three joins individually

Whole: [d04 seed0/840 normal](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d04/01-seed0-t840-normal-whole-paired.jpg) versus [frozen d02 seed0/840](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d02/01-seed0-t840-whole-paired.jpg). Field: [d04 seed2/972 normal](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d04/03-seed2-t972-normal-field-paired.jpg) versus [frozen d02 seed2/972](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d02/02-seed2-t972-field-paired.jpg). These are original 1265×712JPEG, viewed normally without crop, zoom or viewport changes. Paired seed/native state/RNG/framing/art settings match exactly; no pixel-identity or identical page-scroll claim.

| Target place | Independent actual observation in normal Whole840 and Field972 | Verdict |
|---|---|---|
| Cups01/02 | Dark wedge/slot directly below light cap between opposing cup side walls remains. Continuous vertical stone connection is not readable across this place. | OPEN |
| Cups02/03 | Central near-black recess under cap remains. New lower masonry does not establish a continuous cap-to-facing-to-cup join here. | OPEN |
| Cups03/04 | Right dark wedge under cap remains between adjacent cup walls. It is visible in both normal framings. | OPEN |

The three target places sit visibly inside the canvas; Field does not hide them at its lower boundary. Whole also shows the lower front facing and cup supports. Light cap/bevel and lower basalt face can be read, but they do not establish closure of the three target breaks. No conspicuous new horizontal paving strip beyond the near edge or new floating cup/support/opening shift was observed in these checked views.

Art+Geometry repeats: [Whole840](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d04/02-seed0-t840-geometry-whole.jpg) and [Field972](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d04/04-seed2-t972-geometry-field-paired.jpg). Geometry stays above art; accepted near boundary and four opening markers remain visible. Openings/receiver placement policy retain exact d02 input bindings. Full opening/silhouette/light/3D-cup PASS is not claimed.

Producer boundary estimate915±3texture px maps to1120.7655502392345±3.6746411483source px versus accepted1121. This is a frozen producer measurement and supports the placement discussion; it does not supersede the actual three-slot observation or prove full floor registration.

## Narrow regression and control checks

| Actual view | Evidence | Result |
|---|---|---|
| Field seed2/973 front | [d04 front973](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d04/05-seed2-t973-front-regression.jpg) | No significant new visual defect observed versus saved d02 front973. Snapshot only; no expanded contact matrix. |
| Field seed2/368 corner | [d04 corner368](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d04/06-seed2-t368-corner-regression.jpg) | No significant new visual defect observed versus saved d02 corner368. Snapshot only. |
| Field seed2/972 ArtOff+Geometry | [ArtOff Field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d04/07-seed2-t972-artoff-geometry-field.jpg) | Floor and actors disappear; native Geometry remains visible. State/RNG unchanged. |
| Whole seed2/972 ArtOff+Geometry | [ArtOff Whole](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d04/08-seed2-t972-artoff-geometry-whole.jpg) | Same art removal and geometry control; whole boundary visible. |
| Restored normal Field seed2/972 | [restored Field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d04/09-seed2-t972-restored-normal-field.jpg) | Native state/RNG/domain/art/geometry/framing exact to first normal Field972; three dark target slots remain readable. |

## Native preservation and fixed Field

All 9 captures paused, each with before/screenshot/after AX. All 18 native state/RNG snapshots equal the corresponding accepted cached seed0 or2 native state. Five complete paired UI settings/state/RNG cases equal frozen d02:Whole840,Field972normal,Field972Geometry,front973,corner368. No fresh oracle,export,compile,new seed/new throw or receiver entry audit. Only one UI +1 step972→973; no realtime motion claim.

Field domain is exact d02 and fixed across all 18 AX snapshots:

| Coordinate | Actual source px | Delta versus d02 |
|---|---:|---:|
| minX |68.71885635951678|0|
| maxX |1471.0818844305998|0|
| minY |249.00000000000102|0|
| maxY |1407.0875938955278|0|

Four cached traces/events remain hashed references:seed0 → receiver01/888,seed1 → receiver01/884,seed2 → LOST1812,seed3 → receiver02/1269. These are accepted baseline outcomes, not new d04 terminal UI attestations. Per-state event prefixes are not exposed by UI and are not claimed verified; event t→native state t+1 rule retained.

## Variant separation — no combined Dark verdict

| Variant | Receiver D01-V01 | Floor D02-V01 |
|---|---|---|
| d03,consumer9d741f4d…,QA commitc0770683bea326b53b248326ea5b04c18ad58f7a | CLOSED SCOPED for saved seed0/receiver01 and seed3/receiver02 approaches only; [REPORT_D03.md](REPORT_D03.md)/[EVIDENCE_D03.json](EVIDENCE_D03.json) preserved | OPEN; floor unchanged |
| d04,consumerd190ef3f… | Original d02 full/back/front receivers retained; D01-V01 INHERITED OPEN by design. No entry repeat and no claim of regression against d03 | OPEN after this actual paired floor-only QA |
| Combined d03+d04 | No combined manifest supplied or assembled by VQA | No combined/full Dark PASS |

Other receiver approaches, front-rim/rare views, complete3D cups, missing families/environment, untested contacts/light/contours/support remain UNVERIFIED. FullDarkArtPass=false;fullP5TransferPass=false. D03 closure is neither broadened nor revoked by this floor-only counterfactual.

## Evidence, resource and scope receipt

Own runtime frozen snapshot:49 files / 1374184 bytes, 9 unedited JPEG. All source report links resolve; file paths/size/SHA are in EVIDENCE. Own tab9 closed; console warning/error count0;producer server untouched. One bookkeeping API call used a nonexistent getConsoleLogs method, failed before logs/close; documentation refreshed and supported dev.logs used. Captures 08/09 had already been saved; independently inspected original files and native AX validated. No permission denial.

Fresh guard before work:freeRAM8.579GiB,CPU2%,aggregate processCPU7.667%,WS29.142GiB/private16.712GiB;C13.495/D14.596/E8.805GiB. Estimate1GiBRAM/.04GiBE plus reserves4GiBRAM/2GiBE passed. Post guard:freeRAM8.409GiB,CPU4%,aggregate non-Idle processCPU3.708%,WS29.672/private30.582GiB;C13.481/D14.595/E8.789GiB. Aggregate CPU sampling correction is recorded in own post-guard JSON; no settings or foreign processes changed.

Source writes limited to REPORT_D04.md,EVIDENCE_D04.json,STATE.md,EVENTS.jsonl in own Dark Visual QA directory. All earlier Water/Dark reports/evidence,original JPG,producer/product/art/config/native files unchanged. No Review/VPS/SSH/security/settings/model/effort/host changes;Review/VPS writes0/tokenfalse. D03 was committed/pushed separately before this d04 task; Water w06 is frozen and was not retested.
