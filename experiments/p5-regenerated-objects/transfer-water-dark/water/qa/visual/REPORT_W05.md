# Water w05 — independent receiver correction Visual QA

2026-10-30, Europe/Kyiv. **W04-V01_CLOSED_SCOPED_ON_W05; FRONT_HIDE_UNVERIFIED; FULL_WATER_ART_AND_TRANSFER_UNVERIFIED.**

В сохранённом seed2/receiver02 старое резкое появление шара только на IN_BUCKET больше не воспроизводится. Шар виден на1272/1273/1274, остаётся виден на1275 и terminal hold. **W04-V01 закрыт для этого repro и проверенного подхода.** Передний объёмный борт этим не получает PASS: отдельный seed1 miss показывает передний слой сферы поверх нарисованной кромки/стенки, без доказанного partial front hide/reveal. Нового blocking sorting defect по этой паре не установил.

## Exact candidate and independent verification

Consumer `ce110a387919bbb10c467c70afce678f8b4ee4a7`, existing-floor role extension `eedd183a2652a8b9a2dce60118c0f32c8755d3b7`, Artist `9647869d6dbf672ee5922b0fc57df254b9fdbb93`. Separate successor; old [REPORT_W04.md](REPORT_W04.md) and [EVIDENCE_W04.json](EVIDENCE_W04.json) сохранены. Full metadata/hashes: [EVIDENCE_W05.json](EVIDENCE_W05.json); runtime `E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05`.

| Pin | Independently verified |
|---|---|
| FILE_INDEX | 6580 bytes; `dd5a85b7187b90197527fef5763fd31a64b16ae7e84f53a092a33674dd0031b8` |
| Physical public inventory | 22 files,12272726 bytes; all listed sizes/SHA256 matched |
| Source Artist manifest | 65234 bytes; `83961fd80bfc027e77300805bd02ecdd6e961c22e770de9bf18675a670057521` |
| Staged manifest | 46425 bytes; `7a7f55effb5c7a4d5b60c4752c14bc2fa0ca846817f94ca88e12bd165ddba965` |
| Only new PNG | rim `2f58c03e3ae6a7a4a4460f94976c3c5a4b93ca6045674df8140b9221741a3c0a` |
| Retained art | all9 previous PNG exact;10 uniquePNG,19IDs,34instances;9/21body groups,4cups |

Same accepted P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, Water04 active trial-02 config `9048b28af2923c93d8be772367beeb828f1e4513a6298af1c803379f77d3e50c`, manifest `48c4fef26fd8c94f06c278851222ef285edda54ac14e53da8908f4ee663dc420`. Startup-FAIL trial-01 не подменялся. Native source `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`. Projection/core/PRNG/physics policy retained. No fresh oracle/export/compile.

Full old back PNG now uses existing floor base rank below shadow/ball; new transparent-interior back rim is separate, old front retained. O/capture/anchors/uniform scale/hR unchanged in the supplied successor. Producer ±3texturepx uncertainty and outer edge<=1tex are not independently remeasured by VQA. Hash/manifest match alone is not an art verdict.

## Actual closure and regressions

| Case | Own evidence | Visual finding |
|---|---|---|
| Early approach seed2 | [08-seed2-t1240-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/08-seed2-t1240-field.jpg), [02-seed2-t1250-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/02-seed2-t1250-field.jpg), [09-seed2-t1256-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/09-seed2-t1256-field.jpg) | Sphere visible at1240, then concealed by actual rear wall/rim at1250/1256. This concealment is legitimate in the checked view. |
| Rear-rim reveal | [10-seed2-t1260-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/10-seed2-t1260-field.jpg), [11-seed2-t1264-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/11-seed2-t1264-field.jpg) | Small visible crescent at1260, partial sphere under back wall at1264; no old water-wide opaque disappearance at late entry. |
| Entry exact neighbors | [03-seed2-t1272-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/03-seed2-t1272-field.jpg), [04-seed2-t1273-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/04-seed2-t1273-field.jpg), [05-seed2-t1274-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/05-seed2-t1274-field.jpg), [06-seed2-t1275-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/06-seed2-t1275-field.jpg) | Sphere remains visible before and at IN_BUCKET. Old w04/14–16 exact native states at1273–1275 compare directly. |
| Stable hold / Whole | [07-seed2-t1275-hold-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/07-seed2-t1275-hold-field.jpg), [12-seed2-t1273-whole](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/12-seed2-t1273-whole.jpg), [13-seed2-t1275-whole](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/13-seed2-t1275-whole.jpg) | Terminal +1 stays1275; no sink/fade or new full-sphere appearance at capture. Whole confirms the same visibility. |
| ArtOff +Geometry1275 | [14-seed2-t1275-artoff-geometry](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/14-seed2-t1275-artoff-geometry.jpg) | Bases/rims/front removed together; native state/RNG retained. |
| Ordinary miss receiver03 | [16-seed1-t1114-receiver03-miss-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/16-seed1-t1114-receiver03-miss-field.jpg), [17-seed1-t1115-receiver03-miss-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/17-seed1-t1115-receiver03-miss-field.jpg), [18-seed1-t1116-receiver03-miss-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/18-seed1-t1116-receiver03-miss-field.jpg) | Sphere passes over painted water without capture; donefalse. Seed1 later LOST1196 retained. Painted water is not a trigger. |
| Front visual overlap | [20-seed1-t1118-front-rim-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/20-seed1-t1118-front-rim-field.jpg), [21-seed1-t1119-front-rim-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/21-seed1-t1119-front-rim-field.jpg), [22-seed1-t1120-front-rim-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/22-seed1-t1120-front-rim-field.jpg) | Fully visible sphere moves across upper front bevel, no noticeable jump. Volume boundary not established. |
| Short regressions | [23-seed1-t1019-gate-regression](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/23-seed1-t1019-gate-regression.jpg), [24-seed0-t0-field-regression](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w05/24-seed0-t0-field-regression.jpg) | No significant new gate appearance defect; full startup sphere remains visible. No general gate PASS. |

Normal Whole/Field frames show no obvious new rim seam/double front or strong new loss of shadow support in this checked scope. Realtime entry1232..1275 and missed approach1078..1133 were watched; screenshot states are bounded only (visible screenshot ticks1265 and1113). The exact neighboring screenshots carry the visual closure evidence.

## Separate front-rim paired assessment

Requested narrow case is **seed1/receiver03**. Accepted logical front-depth independently computed from config as y+r = `35213.308927377`. Between1114/1115 the Ground point crosses that proxy; on1118/1119/1120 its Y is35234.803832/35240.694641/35246.609950, already forward of the logical footprint. Own3 paused states/RNG exactly match TQA's retained same-tick snapshots; their verdict was not used as visual evidence.

Own1115→1120 shows the sphere moving from water to the upper painted bevel, remaining wholly visible. I additionally inspected the retained [TQA paused1131 frame](E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w05/screenshots/s1-motion-miss-paused.png) with pinned [snapshot](E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w05/snapshots/s1-motion-miss-paused.json) from source `17bbf8ae6e2d9e8a49e42933cfe2b4c089b8a3f3`: the full sphere visibly overlaps the opaque light front wall beside the medallion. That image is an external retained actual frame, not one of VQA's24 own captures. Its domain matches ours; screenshot scene is shifted vertically by page scroll. All external bytes/SHA and exact state are in the evidence index and runtime `front-rim-paired-review.json`.

**Observation:** no noticeable jump on own1118–1120; at1131 the sphere is fully in the foreground layer over painted solid wall. Correct partial front conceal/reveal is not demonstrated. **Interpretation:** in the flat2.5D representation it can read as a sphere already in front of the cup, consistently with the Ground proxy. These frames do not establish natural 3D support, object height or a solid front-wall mesh. I do not turn the wall overlap alone into a new established sorting defect or a full natural-volume PASS. **NOTE / FRONT_HIDE_UNVERIFIED**; an artificial hide is not implied by this trajectory. W04-V01 entry closure remains a separate scoped conclusion.

## State, framing and retained outcomes

All22 paused captures have equal adjacent before/after seed/state/RNG/view. Six w04 native windows (1250,1273,1274,1275,hold,gate1019) match exactly;3 cached TQA native miss states1114/1115/1116 also match. No new native simulation was run. The2 realtime images have bounded states, not exact image/native equality claims.

Field domain stays fixed across all24 captures: X[-10.637626390503007,1533.7323088433782], Y[249.72811384258958,1403.2984506144696]. Own derived delta vsw04: minX−0.3193260073542845,maxX+0.3362350231882374,minY0,maxY0 source px. This independently matches producer's wider-rim envelope clarification. Policy is fixed, camera was not manually shifted to compensate. Original1265×712 JPEG retained without crop/edit/zoom/viewport override.

Replay2→receiver02/1275, replay1→LOST1196 retained from own terminal AX. No new throws, seed hunt, replacement of LOST or broad entry matrix. Optional seed0 receiver02miss1244–1246 not checked. Other entries, front volume, all receivers, missing5frogs/7arch assemblies, arch07 shadow/support PARTIAL, masks/environment/long walls/near-edge sourceClip and full transfer remain UNVERIFIED. W01-V01 framing closure retained; frozen Jungle and all previous w01/w02/w04 reports/evidence unchanged. FullWaterArtPass false.

## Resources and completion

Start guard freeRAM9.219GiB,E9.165GiB,CPU6%; own estimate1GiBRAM/.09GiBE with reserve4GiBRAM/2GiBE. End-Water guard freeRAM8.903/E9.104,CPU2%; post-browser9.377/E9.076,CPU1%. Fresh guards, PID38924/root ownership and index identities preserved. Own tab5 closed after24 captures; producer processes/product/art/config not touched. Review/VPS writes0, tokenGrantedfalse.
