# Dark d03 — independent receiver-parts Visual QA

2026-10-30, Europe/Kyiv. **D01-V01_CLOSED_SCOPED_ON_D03; D02-V01_OPEN; FULL_DARK_ART_AND_P5_TRANSFER_UNVERIFIED.**

На двух сохранённых подходах старый binary pop исчез: сфера постепенно раскрывается из-за поднятого каменного борта **до entry**, остаётся видимой в exact соседних states и stable terminal hold. Whole/Field подтверждают этот переход. **D01-V01 закрыт только для seed0/receiver01/874–888 и seed3/receiver02/1254–1269.** Raised stone продолжает скрывать часть сферы; вывод не сводится к visible terminal или PNG/hash PASS.

## Exact input and evidence

Consumer `9d741f4d718a8d623ae4d1d51caa938ca4e96a66`; Artist `79da6c7616de630102994d4e087e312a12892e0f`; handoff `b61b619705ccfba9bfc30c681654d3b7b395e08e`. [EVIDENCE_D03.json](EVIDENCE_D03.json) содержит все hashes,35 own original JPEG+AX,5 actual motion intervals,13 paired old d01 frames/state refs. Runtime `E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03`. Old [REPORT_D01.md](REPORT_D01.md)/[EVIDENCE_D01.json](EVIDENCE_D01.json) и [REPORT_D02.md](REPORT_D02.md)/[EVIDENCE_D02.json](EVIDENCE_D02.json) неизменны.

| Independent verification | Pin/result |
|---|---|
| FILE_INDEX outside public | 6675bytes; `b9817e590c8db60e46a0f75b9182faea444a454706a4763227a81d7a314742ce` |
| Source manifest | 65548bytes; `709253ed3dd162c6b305bbb4f7be1925dace48d82ec0d7c14fc6e7c3449e812a` |
| Staged manifest | 44948bytes; `27fa2237249e629a97e0f265fcd1052def7edfa4a105a3518cc339647da61dd6` |
| Physical inventory | All21files/16163953bytes matched; app570889bytes/SHAba21d2d6a308acbbb4658d937f4ba942ebc6f473d7d934f3eb267c4f6c16afd8 exact d02 |
| PNG identity | All8 old PNG retained exactly; only new rim `5f00b57501ec52eb879ba6219d77034bee172c3ff580d2487581cd7406b573c1` |
| Bindings | Exact equality31 unchanged instances/11 texture entries, including all old fronts;9PNG/19IDs/39instances,12/24bodygroups |
| Support records | Exact raw Git bytes/SHA matched. Policy12328bytes/SHA558674bbeb2fbd7d26d0ac8af2dccd66c2b073b289dcd4dfc71a2b9ab8914faa; registration6095bytes/SHA3352089b61dd4eb6ff69d552de0811d038393908b9b798171a874e862add7111 |

Same accepted Dark02/trial01/P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, config `14be2a023833d266d1e333bf582af5fd5885deb445698c10ebd846ef0cc080b2`, P1 manifest `3fab422bd1f74d477d1648620c97ad6d7b8b0a55a70a1102d6e6885def564d81`. Native source `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`;LCG/5ms/r16/radii/strict-centre trigger retained. No new renderer/role/schema/rank/sorting/native/config/physics policy,oracle,export or compile. Existing target-floor supporteedd183a retained.

Full PNG is now floor base below shadow/sphere; raised cream parapet/side corners stay in separate rim-back−1; old front+1 unchanged. Recessed dark inner wall/floor stays in base. This is the supplied Dark semantic preparation; VQA made no art edits or literal Water substitution.

## Actual seed0 / receiver01

| Phase | Own normal evidence | Observation |
|---|---|---|
| Early approach874/878 | Whole [01:seed0-t874-whole-early](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/01-seed0-t874-whole-early.jpg), Field [02:seed0-t874-field-early](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/02-seed0-t874-field-early.jpg)/[03:seed0-t878-field-rim](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/03-seed0-t878-field-rim.jpg) | Sphere approaches visible raised rim; stone occludes it as it crosses the lip. |
| Reveal882/884 | Field [04:seed0-t882-field-reveal](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/04-seed0-t882-field-reveal.jpg)/[05:seed0-t884-field-reveal](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/05-seed0-t884-field-reveal.jpg), Whole [12:seed0-t882-whole-partial](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/12-seed0-t882-whole-partial.jpg) | Small lower portion then larger partial sphere below stone; reveal precedes trigger. |
| Old repro886/887/888 | [06:seed0-t886-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/06-seed0-t886-field.jpg)/[07:seed0-t887-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/07-seed0-t887-field.jpg)/[08:seed0-t888-field-entry](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/08-seed0-t888-field-entry.jpg) | Sphere already visibly present at886/887, remains at888. Old hidden887 versus new visible887 independently compared. |
| Whole/hold | [11:seed0-t887-whole](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/11-seed0-t887-whole.jpg)/[10:seed0-t888-whole-entry](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/10-seed0-t888-whole-entry.jpg), Field hold [09:seed0-t888-field-hold](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/09-seed0-t888-field-hold.jpg) | Whole agrees. Terminal +1 stays888; stable image, no sink/fade. |
| Actual short motion | [13:seed0-rim-approach-motion](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/13-seed0-rim-approach-motion.jpg)/[14:seed0-reveal-entry-motion](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/14-seed0-reveal-entry-motion.jpg) | Continue/Pause intervals874→882 and882→888 progressed through rim conceal/reveal and entry. |

## Actual seed3 / receiver02

| Phase | Own normal evidence | Observation |
|---|---|---|
| Early1254/1258 | [15:seed3-t1254-field-early](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/15-seed3-t1254-field-early.jpg)/[16:seed3-t1258-field-rim](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/16-seed3-t1258-field-rim.jpg) | Visible approach above rim, then concealment by raised cream stone. |
| Reveal1262/1264/1266 | [17:seed3-t1262-field-reveal](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/17-seed3-t1262-field-reveal.jpg)/[18:seed3-t1264-field-reveal](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/18-seed3-t1264-field-reveal.jpg)/[19:seed3-t1266-field-reveal](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/19-seed3-t1266-field-reveal.jpg), Whole [26:seed3-t1264-whole-partial](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/26-seed3-t1264-whole-partial.jpg) | Small revealed portion grows below rim before entry. |
| Old repro1267/1268/1269 | [20:seed3-t1267-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/20-seed3-t1267-field.jpg)/[21:seed3-t1268-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/21-seed3-t1268-field.jpg)/[22:seed3-t1269-field-entry](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/22-seed3-t1269-field-entry.jpg) | Sphere clearly visible before1269; no old invisible→whole-sphere terminal switch. Old hidden1268 versus new visible1268 independently compared. |
| Whole/hold | [24:seed3-t1268-whole](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/24-seed3-t1268-whole.jpg)/[25:seed3-t1269-whole-entry](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/25-seed3-t1269-whole-entry.jpg), Field hold [23:seed3-t1269-field-hold](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/23-seed3-t1269-field-hold.jpg) | Whole confirms transition; terminal +1 stays1269, no sink/fade. |
| Actual short motion | [27:seed3-rim-approach-motion](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/27-seed3-rim-approach-motion.jpg)/[28:seed3-reveal-entry-motion](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/28-seed3-reveal-entry-motion.jpg)/[29:seed3-through-entry-motion](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/29-seed3-through-entry-motion.jpg) |1254→1261,1262→1267,1267→1269. These are actual UI/Pixi runs with paused boundary evidence, not synthesized trajectories or video. |

No conspicuous new split seam/double front or displaced opening was established in checked normal Whole/Field. Raised rim remains a solid visible occluder; the early partial states are the basis for scoped closure. Complete pit volume, sphere support on recessed floor, all interior wall heights, all rim contacts and all receivers are not proven by these two trajectories.

## Registration, controls and narrow regression

Producer/Artist nominal model: p_rim=1.032p_full+[−19.048,−2],rotation0; rim capture340.56×230.136,O[628.532,452.08],L544.5,standard uniform sR and A=O+[0,hR],hR_rim=1.032hR_full. Different raw O/anchors are legitimate for these frames. Producer source-opening equality≤1e−9sourcepx is nominal registration; VQA did not independently remeasure the raw mapping or alpha contour. Actual visual checks above do not imply pixel/3D identity. Producer residual1.49..1.56sourcepx, frame uncertainty±2.25..2.36sourcepx and separate old optical±1.45..1.52sourcepx retained without combining them into a claimed total error/PASS.

Same seed3/1268 ArtOn+Geometry [30:seed3-t1268-arton-geometry-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/30-seed3-t1268-arton-geometry-field.jpg), ArtOff Field/Whole [31:seed3-t1268-artoff-geometry-field](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/31-seed3-t1268-artoff-geometry-field.jpg)/[32:seed3-t1268-artoff-geometry-whole](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/32-seed3-t1268-artoff-geometry-whole.jpg), restored Whole/Field [33:seed3-t1268-whole-restored](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/33-seed3-t1268-whole-restored.jpg)/[34:seed3-t1268-field-return](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/34-seed3-t1268-field-return.jpg): base/rim/front disappear with the rest of Art. Geometry remains and overlays Art in the enabled view. Native state/RNG stays identical. No debugger/zIndex retry or artificial sink/fade/offset/hole.

Only one pillar front case,seed2/973,[35:seed2-t973-pillar-front-regression](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d03/35-seed2-t973-pillar-front-regression.jpg), compared to old d01/d02: no significant new visible regression; no general pillar/corner PASS or repetition of old44-snapshot matrix. Floor-v3 is byte-identical and **D02-V01 cap gaps stays OPEN**; this is no floor audit or closure.

## State, camera, retained limits

All35 paused before/after UI match;70 AX native state/RNG comparisons equal accepted cached states.13 old d01 paired native windows equal. Loaded config/P1/staged manifest pins match every capture; prior76 selected native states also matched the full cached refs. Cached event files are pinned, but actual per-state event prefix is not exposed/captured by VQA AX and equality for that prefix is not claimed.

Field domain fixed across all states/modes/replays and exactly equal d02: X[68.71885635951678,1471.0818844305998],Y[249.00000000000102,1407.0875938955278]; all4 derived bound deltas0. No manual camera compensation/viewport override/zoom/crop/image edit. Original1265×712 JPEG retained. Page focus/scroll may move the scene vertically in full screenshots; pixel identity is not claimed.

Ordinary outcomes all retained:seed0 receiver01/888,seed1 receiver01/884,seed2 LOST1812,seed3 receiver02/1269. Seeds1/2 terminal AX are outcome preservation only, not new receiver/art audits. No new seeds/throws,seed sweep,win hunt,new oracle or extrapolation.

Other receivers/front-rim/rare side views, full cups, missing6bowls/4skulls/block05/06/environment and original support/corner/shadow limitations remain UNVERIFIED. **FullDarkArtPass=false;FullP5TransferPass=false.** This is the independent VQA closure of D01-V01 for the stated saved approaches; no TQA/Builder artistic verdict inherited. Old d01/d02 and Water w06/Jungle evidence preserved.

## Resources and completion

Before heavy work own HEAD15d94c63/branch/status clean verified. Fresh guard RAM8.805GiB,E8.865,C13.534,D14.602,CPU13%,aggregate7.375%,WS28.827/private16.528GiB; own peak estimate1GiBRAM/.08GiBE+reserve4GiBRAM/2GiBE passed. Post-browser RAM8.619/E8.832,C13.499,D14.596,CPU6%,aggregate5.625%,WS29.228/private16.714. Raw snapshots indexed. All own TEMP/output/cache/runtime on E. PID45612/root ownership checked before load; own tab8 closed after35captures, warnings/errors0; producer server/material untouched. Review/VPS/SSH/file:// actions/writes0,tokenGrantedfalse; no closed action or permission denial.
