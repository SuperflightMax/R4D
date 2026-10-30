# Dark d02 — independent floor-only Visual QA

2026-10-30, Europe/Kyiv. **FLOOR_PARTIAL_IMPROVEMENT; D02-V01_OPEN; D01-V01_OPEN; FULL_DARK_ART_AND_TRANSFER_UNVERIFIED.**

Нижняя верхняя кромка пола в actual paired d01/d02 видах приблизилась к принятой границе; верхняя поверхность, материалы actors и их опора сохранили согласованность в проверенных кадрах. Полный floor PASS не даю: под новой кромкой в трёх промежутках между чашами появились тёмные щели, визуальная непрерывность стыка нарушена. Это самостоятельный художественный вывод по сборке, не вывод из PNG/hash PASS.

## Exact candidate and independent checks

Consumer `ce110a387919bbb10c467c70afce678f8b4ee4a7`, floor-role extension `eedd183a2652a8b9a2dce60118c0f32c8755d3b7`, Artist `9647869d6dbf672ee5922b0fc57df254b9fdbb93`. Original d01 report/evidence сохранены: [REPORT_D01.md](REPORT_D01.md), [EVIDENCE_D01.json](EVIDENCE_D01.json). All evidence hashes, paired old JPEG/AX pins and native equality checks: [EVIDENCE_D02.json](EVIDENCE_D02.json); runtime `E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d02`.

| Pin | Independently verified |
|---|---|
| FILE_INDEX | 5821 bytes; `0fcf214387311490744ff1630052eda287b48841b6404c5896eec071359a6c0c` |
| Physical public inventory | 20 files,15425644 bytes; all listed bytes/SHA256 matched |
| Artist source manifest | 49103 bytes; `5bad898c270432928a403def12ffbca826a94d76cb83b395708bdf12588e8545` |
| Staged manifest | 34767 bytes; `18578c9568b1198e8dc4d3453ba2d8f30e44a232ed0b8042aabbeb4ba1a5ffb2` |
| Only new PNG | floor-v3 `f9474768fe208f8dc4f26fd97714b862ab37f23f23125a2d17778f920233c472` |
| Removed floor-v2 | `99b5afe65b62abbbaaf76a782ed7c82a98e4b4a143db230371bb358df5cc8c74` |
| Retained actors | 34 nonfloor instances and14 nonfloor texture descriptors exactly equal to d01;8 uniquePNG,15IDs,35instances |

Same accepted P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, Dark02 trial-01 config `14be2a023833d266d1e333bf582af5fd5885deb445698c10ebd846ef0cc080b2`, manifest `3fab422bd1f74d477d1648620c97ad6d7b8b0a55a70a1102d6e6885def564d81`. Same native source `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, package tree `008d16a80a26bb77d562a45218b01da09b0d9ff0`. No fresh export/oracle. Floor-role extension introduces no Dark target-bound bases; existing receiver part depths are retained.

## Actual paired visual result

| Scope | Own actual evidence | Verdict |
|---|---|---|
| Whole normal seed0/840 | [01-seed0-t840-whole-paired](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d02/01-seed0-t840-whole-paired.jpg) paired with old d01/01 | New lower ledge and dark slots are visible at normal scale. Upper composition remains coherent. |
| Field normal seed2/972 | [02-seed2-t972-field-paired](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d02/02-seed2-t972-field-paired.jpg) paired with old d01/16 | Upper floor/actor contact reads consistently; new thin cap leaves three dark joins below it. |
| Field +Geometry seed2/972 | [03-seed2-t972-geometry-paired](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d02/03-seed2-t972-geometry-paired.jpg) paired with old d01/20 | New edge is near accepted lower line. Overlay does not establish exact 3D, correct vertical face or complete floor registration. |
| Pillar02 front seed2/973 | [04-seed2-t973-front-regression](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d02/04-seed2-t973-front-regression.jpg) paired with d01/17 | No significant new visible popping/empty-floor contact in this frame. |
| Pillar02 corner seed2/368 | [05-seed2-t368-corner-regression](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/dark/d02/05-seed2-t368-corner-regression.jpg) paired with d01/14 | Small partial reveal stays consistent; no new visible regression in this case. |

**D02-V01 OPEN — lower floor/cup join.** Под новой светлой кромкой, между чашами01/02,02/03,03/04, видны тёмные провалы. В d01 эти промежутки поддерживались продолжающимся каменным полем; в d02 тонкая верхняя полоска выглядит отделённой от нижней вертикальной поверхности. Наблюдение воспроизводится Whole и Field с ArtOn, без diagnostic overlay. Для правки нужен согласованный рисунок cap/bevel/vertical face в этих стыках. Неполная нарисованная грань или overlap — гипотеза; alpha, sorting или geometry cause этим просмотром не доказаны. Принятую геометрию и actors под рисунок менять не следует.

Actor estimate sourceY1120.766±3.675 сохранён как producer measurement; VQA его численно не перемерял. Собственный вывод об улучшении положения опирается на actual paired сцену с overlay. Это частичное улучшение известного1260vs1121 displacement; закрытия всей регистрации пола нет из-за D02-V01 и непроверенной точной грани.

## State, camera and limits

Все5 paired cases имеют exact seed/native state/RNG equality с сохранённым d01. Все5 paused before/after UI равны. Field domain d01=d02: X[68.71885635951678,1471.0818844305998], Y[249.00000000000102,1407.0875938955278], delta по всем4 границам0. Переходы режима не меняли domain; ручных offsets, zoom или viewport override не было. JPEG1265×712 исходные, не редактировались. Фокус/scroll страницы может сдвигать сцену внутри screenshot; pixel identity не заявлена.

**D01-V01 остаётся OPEN.** Receiver entries/holds в d02 не гонялись; исторические d01 receiver01 seed0/886–888 и receiver02 seed3/1267–1269 не получают нового verdict от floor-only QA. Pillar regression ограничен3 указанными states, общего corner/front/side sorting PASS нет. Missing families, sourceClip masks, environment/long walls/near edge и полный transfer остаются UNVERIFIED. Новых throws, trajectory selection или terminal replay этого этапа не было; d01 seed outcomes сохранены отдельно.

## Resources and completion

Fresh guard перед batch: freeRAM9.219GiB, E9.165GiB; перед Dark freeRAM8.903/E9.104; post-browser freeRAM9.377/E9.076, CPU1%. Стартовая оценка1GiBRAM/.09GiBE с резервом4GiBRAM/2GiBE прошла; guard snapshots включены в индекс. Все heavy browser действия выполнялись последовательно. Producer PID48448/root ownership проверены перед загрузкой. Своя вкладка6 закрыта после5 captures, producer server не трогался. Art/config/product/native не менялись, Review/VPS writes0, tokenGrantedfalse. Frozen Jungle и старые Water/Dark artifacts неизменны.

Следующий narrow floor successor должен сохранить нынешнюю кромку у принятой границы и устранить видимый стык D02-V01. Отдельный receiver successor нужен для D01-V01. Full Dark art/transfer PASS false.
