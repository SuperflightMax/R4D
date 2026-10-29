# C03 — адресная коррекция C02-V01

2026-10-29 01:07 UTC. Immutable successor готов для независимых адресных TQA/VQA и Release local delta audit. Producer самопроверка завершена; independent PASS/P5 PASS/release не заявлены. CTO token gate закрыт, release/server writes0. Listener сохраняется до завершения адресных проходов по указанию Lead.

## Frozen pins

| Pin | Значение |
|---|---|
| Consumer commit при build/freeze | `af23e124cf5bd1d9de884082ffbc993448217112` |
| Product code | Побайтно прежний C02 source `398b0daaaad914cc67b8390a51454d21db524e7a`; новый код не требовался |
| Branch / path | `codex/r4d-p5-regenerated-builder-01` / `experiments/p5-regenerated-objects/builder/` |
| Public root | `E:/R4D/perspective/p5-runtime/builder/output/previews/c03/public` |
| Index | `E:/R4D/perspective/p5-runtime/builder/output/previews/c03/index.json` |
| Index bytes / SHA256 | 11618 / `17838d163e6c710cad513a68b5cd5ba5c6543a708761b96e7ee62fa362c2ef2d` |
| Public inventory | 29 files / 21675411 bytes; все file hashes/bytes внутри index |
| app.js bytes / SHA256 | 571012 / `4a003dd39212f21b7a3dd1baa82c0d0738af3a9767c6e51225b9b54f5aac325c` — exact C02 bundle |
| Staged manifest bytes / SHA256 | 66026 / `13f443587180095cb701564ee7cdd24a3e1e062932cc075a3cb1de37e056ef91` |
| Preview | `http://127.0.0.1:55185/`, PID **12500**, exec session **67163** |
| Host / startedUtc | `WIN-36E9FF9EJM0` / `2026-10-29T00:58:57.355Z` |
| Current owner | `E:/R4D/perspective/p5-runtime/builder/preview-owner.json` |

Проверены все29 frozen files; HTTP200 app/manifest дали exact pinned bytes. От C02 изменились только `assets/manifest.json` и `data/preview-input.json`; остальные27 public files побайтно прежние. C01/C02 каталоги не перезаписывались, их index hashes сохранены. Explicit freeze whitelist исключает raw native TS/maps/private staging.

Own C02 PID21340/session26545 намеренно остановлен после completed обеих QA, fresh resource/owner/process/root/port checks; свободный порт подтверждён до запуска C03. Старый owner сохранён в `preview-owners/c02-frozen-pid21340.json`. Ожидаемый forced-stop exit не runtime/policy/race. Чужие PID не менялись. Own IAB browser2/tab3 закрыта, listener12500 остаётся для QA/Release.

## Exact Artist delta

Источник: `a5ec68fb2ed6aeacd8c66bc575166567bd0c3966:experiments/p5-regenerated-objects/asset-artist/HANDOFF_MINI_03.md`. Handoff и полный DELTA прочитаны; исходные JSON materialized exact Git bytes в `E:/R4D/perspective/p5-runtime/builder/handoffs/mini03/`.

| Файл | Bytes | SHA256 |
|---|---:|---|
| asset-manifest.mini-03.json | 89838 | `a083143b199f78cefe2725907b91385145cb9c29067ad319dd862974a13714a0` |
| FOREGROUND_REGIONS.mini-03.json | 15922 | `118abd360f963b6088dab47f23c56554e9d4b31ef718d91345954fa3cc97e870` |
| DELTA_MINI_03.json | 12713 | `0dbab3cffcc65ced429fccf0993533e43038541c0b6370559729fec6a493de3a` |
| NEAR_LEDGE_AUTHORING.mini-03.json | 1763 | `b7b5c921b7c1aed87651e8ad9f8b3298218dfa84f599c9aeb563b3b9b7f128f0` |

Deep semantic equality после исключения **только `near-ledge.sourceClipPx`** подтверждена самостоятельно. Новый polygon55points идёт по верхнему шву и нижнему структурному краю всей stone fascia; исключает open paving на обоих крыльях и над центром, восстанавливает левую stone face. Bounds source1536: прежние `[330.7177033492823,1054.622009569378,930.9090909090908,121.26315789473688]`, новые `[330.7177033492823,1099.9425837320575,930.9090909090908,75.9425837320573]`. Ручная неопределённость около±3texturepx; plant tops выше seam остаются в floor layer. Seed/tick exceptions нет.

Все17 PNG из existing `selected/mini-set-02` SHA/bytes неизменны; pixel metadata принял тот же Builder verifier. Counts прежние23textures/64instances,25pins/4receivers/3foreground. Bindings, receiver policy, оба serpent clips, native/config/projection/controller/deps неизменны. Inherited BINDINGS/policy exact source499 и их pins сохранены в `handoff-pin.json` и frozen index. Новые bitmap не генерировались, pixels не правились; staging копирует exact verified bytes.

## Узкая actual самопроверка

Оба C02 отчёта прочитаны полностью: TQA `a3fac041969bcc287ae5fbb0c25a53a71034d4ea:experiments/p5-regenerated-objects/qa/technical/REPORT_C02.md`; VQA `c662b0badfb5e44fb5ab6a55a8152f1570d18f0f:experiments/p5-regenerated-objects/qa/visual/REPORT_C02.md`. Они независимо локализовали false occlusion в near-ledge; native оставался правильным.

В собственной hidden IAB выполнены только UI replay/seek/+1 и Art/Geometry. Новые seeds не искались; full QA/common oracle/realtime matrices не повторялись.

| Case | Actual paused states | Наблюдение Builder |
|---|---|---|
|4210403976|674,675,676,677,680; terminal757|Сфера видна над open paving, прежнего полного false hide в этом окне нет. LOST757 сохранён.|
|4210403976 controls|676 art, art+geometry, geometry-only|State/RNG совпали, Art off убирает sprites/masks; diagnostic circle доступен.|
|0 near-ledge|1919,1930,1937,1945|Сохранён visible→hidden переход за центральной stone fascia в этих выборочных кадрах.|
|1696420279|852,854,856; receiver01/875|Подход к исправленному краю и terminal875 сохранены; sphere видна внутри aperture.|
|3339315606 left head/ledge|1590,1600,1610,1620|В этих выборочных кадрах крупного layer jump не выявлено; head clip не менялся.|

![Actual C03: sphere visible над открытым полом, seed4210403976 tick676](E:/R4D/perspective/p5-runtime/builder/evidence/c03-browser/seed4210403976-t676-field-art.jpg)

21 saved actual snapshots /18unique seed-tick pairs. **17 snapshots** точно совпали с existing hash-pinned native traces0/1696420279/4210403976 без пересчёта ядра. Для четырёх333 snapshots предыдущий VQA AX содержит только seed/tick при collapsed diagnostics: совпали UI metadata; полного state/native comparison для них не заявлено. Их actual native JSON сохранён. Numeric identity не заменяет художественную оценку.

Evidence index `E:/R4D/perspective/p5-runtime/builder/evidence/c03-handoff/index.json`: **17143bytes**, SHA256 **`8c3b4b0768ce675d0fab16b8978b8fda07aa0c737168132bdb6d73fdefb1176b`**. Он содержит SHA/bytes/MIME65browser files,6report/owner/reader snapshots и HTTP pins. Все71 evidence files reverified; JPEG originals без reencoding. Summary `evidence/c03-browser/selfcheck-summary.json`:10599bytes/SHA`67a09687ad21dce88f24d9c8d0e4279c883e809b7af1e009be6b9aa6190387ac`.

## Code/input identity и границы

| Неизменённый consumer файл | Bytes | SHA256 |
|---|---:|---|
| src/app.mjs |12452|`15c47da9f5bae7d48a85a206e5b1253f56bed674f42d55e7d65e79cc84428d56`|
| src/controller.mjs |2686|`66dc6aa62f66ec4879c5af93ddb8768dbbca45c4b4e3bbbc8220a452bc1fd857`|
| src/framing.mjs |1117|`b17164ee5fe2abf177149039391bbb0a1680974845328b0b624b365657ab29b6`|
| scripts/build.mjs |6383|`118c73f837b6ee7b25c1bfd6265a6c3ac75325971edaee52ec4abddf74b7c320`|
| scripts/freeze-preview.mjs |3520|`f5d1edf2026fb280f5b9cfbeab4f8f213a74b9e8069c2fcd2894d2350dd9c05a`|

Reused verified native private inputs commit`5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`/tree`008d16a80a26bb77d562a45218b01da09b0d9ff0`, accepted P1`4b47db04c7140ebf88f69b91faa0b790d46f22ec` и existing dependency lock/terms. Их public hashes unchanged относительно C02. `build.mjs --manifest .../handoffs/mini03/manifest.json`, затем `freeze-preview.mjs c03`; npm install/native rematerialization/common oracle не выполнялись.

Fresh build guard00:57:45UTC: freeRAM15.997/31.907GiB, CPU2%system/2.58%aggregate,WS19.495GiB/404processes; C16.290/D16.281/E12.021GiB. Own peak2GiB RAM/.3GiB E + concurrent allowance4/2GiB соблюдён. Fresh browser guard00:58:51: RAM15.913GiB,CPU3%/aggregate1.54%,WS19.404GiB/394processes; C16.289/D16.281/E12.001GiB. E01:06free11.985GiB. Все outputs/cache/TEMP own E/process-local, model/effort/host/settings неизменны.

Обычные tooling ошибки: option `field` не найден — выбран видимый label `Игровое поле`; postprocessor ожидал expanded state в чужом VQA AX, но diagnostics collapsed — reader исправлен до metadata-only comparison. Это не runtime/denial, product и UI проверки не повторялись. Начальная гипотеза reader о line endings не подтвердилась. Нового denial нет; исторические запрещённые targets/обходы не использовались.

Остаются independent C03 delta QA, ручная точность plant/moss boundaries, receiver02/04 entry, длинные rails и редкие overlaps; timeout/download/resize/DPR и release/privacy/package приёмка вне этой самопроверки. Предыдущие C02 findings закрывает назначенная независимая QA. C01/C02/C03 frozen roots сохраняются, server writes0 и CTO token gate закрыт.
