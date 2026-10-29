# c02 — полный mini02 для независимых QA

2026-10-29 00:29 UTC. Stage 2: immutable early candidate, готов к независимым TQA/VQA. Это не final/release seal и не P5 PASS. c01 и mini01 сохранены; release/server writes0, отдельный CTO token gate закрыт.

## Точные bytes и ownership

| Pin | Значение |
|---|---|
| Consumer source commit | `398b0daaaad914cc67b8390a51454d21db524e7a` |
| Branch / consumer path | `codex/r4d-p5-regenerated-builder-01` / `experiments/p5-regenerated-objects/builder/` |
| Frozen public root | `E:/R4D/perspective/p5-runtime/builder/output/previews/c02/public` |
| Frozen index | `E:/R4D/perspective/p5-runtime/builder/output/previews/c02/index.json` |
| Index bytes / SHA256 | 10707 / `f40040bb40d529b7bf1f289e661d69f7f882fddfc962e40cdc5616a59c9d9389` |
| Public inventory | 29 files / 21668434 bytes; каждый файл pinned в index |
| app.js bytes / SHA256 | 571012 / `4a003dd39212f21b7a3dd1baa82c0d0738af3a9767c6e51225b9b54f5aac325c` |
| assets/manifest.json bytes / SHA256 | 59960 / `275ade538d30119434723339487cf7d036a35bbbefe4ad6807f4dd810a6e4491` |
| Preview | `http://127.0.0.1:55185/`, PID **21340**, exec session **26545** |
| Host / startedUtc | `WIN-36E9FF9EJM0` / `2026-10-29T00:26:13.029Z` |
| Current owner | `E:/R4D/perspective/p5-runtime/builder/preview-owner.json` |

После capacity checkpoint read-only подтверждён существующий index; build/freeze/replays/QA matrices не повторялись. HTTP200 app.js и staged manifest подтвердил exact frozen bytes. Ownership проверен по owner, process command/root и localhost listener. Предыдущий own dev PID20436/session11676/root`.../site` **намеренно** остановлен после fresh guard/ownership, порт проверен свободным. Его owner сохранён в `preview-owners/c02-dev-pid20436.json`. Ожидаемый exit после Stop-Process не является runtime/policy/race failure. Чужие процессы не менялись.

QA проверяют exact bytes в собственном изолированном браузере. Frozen c01/c02 не перезаписывать; исправленный продукт получает новый candidate. Explicit public whitelist исключает raw native TS/maps/private staging; отдельная release privacy проверка остаётся обязательной.

## Artist и покрытие

Artist source **`4990463ec6eabf89aa47f58f9b59f703cbf739ba`**, prefix `experiments/p5-regenerated-objects/asset-artist/`. Exact materialization: `E:/R4D/perspective/p5-runtime/builder/handoffs/mini02/`.

| Файл | Bytes | SHA256 |
|---|---:|---|
| asset-manifest.mini-02.json | 83772 | `6055be855714bc9ad66a0e803fc392fbd8e01d94a9798536e7047c06d5d2a331` |
| BINDINGS.mini-02.json | 25937 | `8241f2b9d1c862b773a307ca352615bb634452d8950f1199b64d41540ecd24d6` |
| RECEIVER_ANCHOR_POLICY.mini-02.json | 6840 | `1ea3c31e6a1904d8219b0ca52d79a4010eee34474dc5c8132a4d131d1fa36f1a` |
| FOREGROUND_REGIONS.mini-02.json (canonical uppercase) | 10389 | `e20ad2065c723ae1bdfe2bc2f42bf3fb60f0b997c5edf0d213986f86372daa00` |

17 unique PNG / 23 texture IDs / 64 instances: floor1, body25, shadows26 (25+ball), ball1, receiver back4+front4, foreground3. Все PNG независимо проверены SHA/bytes/dimensions/alpha; 29 BINDINGS native/source и четыре hR совпали с ожиданием. Максимальный body footprint depth residual после uniform scale — 3.2958589851000752 source px. Native geometry и XY scale не подгонялись. Aliases используют общий полный SHA URL и исходные PNG bytes; это не новые image generations.

Artist normalized HEAD `a5f26a57833e8671bf031a2b21c1b9f990dd3c87` pushed/clean подтверждён Lead: lowercase authoring переименован в `FOREGROUND_AUTHORING.mini-02.json`; canonical source1536/manifest/BINDINGS/policy/PNG bytes сохранены. Frozen input остаётся source499; housekeeping не требует rebuild.

## Дельты относительно c01

Покрытие всех25pins/4receivers; Field camera включает visible alpha bounds receivers/foreground и actual geometry, не весь floor canvas. Общая камера Art/Geometry сохраняется. Actual c02 domain `[180.05741626794259,1384.1148325358852] × [300.0000000000012,1410.0959464545833]`, 11 важных static parts. В коротком observed Field receivers показаны полностью; независимая оценка ещё нужна.

Receiver policy разделяет optical opening `[628,477]` и logical anchor `[628,477+hR]`. hR четырёх receivers: 67.61658485838826 / 81.36410310994435 / 79.49910938997404 / 72.01147152317914 texture px; expected delta0. Ground anchor и footprint center оба logical. Общая policy сдвигает optical cup вверх примерно17.8source px относительно неизменных native targets. Ни seed/tick offsets, ни sink/fade, ни скрытого renderer offset нет; raw PNG неизменны. В observed875 sphere видна внутри dark aperture receiver01; художественный PASS не заявлен.

Foreground — три объявленных source1536 polygon clips **того же generated floor SHA** `24a54990c4876fc809af3efd42a711a8a47fefeef51caf3b88608017cbce6e06`: `near-ledge`, `near-serpent-left`, `near-serpent-right`. Parent=floor, mask внутри Art tree; нижний фон/openings не объявлены foreground. Contours coarse, могут резать moss/feathers; длинные side rails остаются unpartitioned. Все occlusion/rope/floor/size/basket отношения требуют actual независимой проверки.

## Самопроверка и evidence

Evidence index: `E:/R4D/perspective/p5-runtime/builder/evidence/c02-handoff/index.json`, **5205 bytes**, SHA256 **`48aaab45d8786c9d24e925fc5c4da2399cc5088c73e1ac48714f6292c687708f`**. Он pin-ит SHA/bytes/MIME 14 существующих browser-файлов и 5 snapshots отчётов/owner, плюс два HTTP byte checks. JPEG signatures проверены; reencoding не было. Summary: `evidence/c02-browser/selfcheck-summary.json`4661bytes. Screenshots получены до freeze на том же app SHA.

- Actual own IAB/Pixi/native загрузил full set25/25 и4/4 без выявленного значимого loading/control break.
- Пять сохранённых actual UI states точно совпали с **существующими** native traces: seed1696420279/t874,t875,realtime37,realtime875; seed0/t1956. Native traces заново не вычислялись. Realtime875 совпал со stepped875.
- Whole→Field и Art/Geometry сохранили state/RNG. Art off убирает sprites/clip masks, actual geometry видна.
- Полные contact/sidewall/LOST/occlusion/resize/DPR/download/timeout matrices Builder для c02 не выполнял. В frozen index Artist limitations сохранены дословно, включая прежнее «candidate has not been viewed» на момент передачи Artist. Короткая самопроверка Builder дополняет этот статус в указанном объёме; independent QA остаётся pending.

Полезные сохранённые случаи; seed selection не повторять ради удачного исхода:

| Seed | Native outcome / окно | c02 Builder |
|---|---|---|
| 0 | receiver03 / tick1956; left-2 event475 → states475/476/477 | terminal1956 проверен; contact window ждёт QA |
| 1696420279 | receiver01 / tick875; flower07 event834 → states834/835/836; bucket874/875 | 874/875 и brief realtime проверены |
| 3957814979 (TQA) | LOST / tick847 | сохранённый c01 QA case; c02 не проигрывался Builder |
| 3339315606 (VQA) | LOST / tick1709 | сохранённый c01 QA case; c02 не проигрывался Builder |

Existing native traces: `evidence/c01-replays/index.json`5430bytes/SHA`aca3ca025c5aee9a0fdf7069035ce376207029c38b99f48f0611e650b7a93c4b`; seed0 trace315344bytes/SHA`971c4b1c96f9e8aa271161fe31025cb776d7ad830dae5758cb54e01c77c8a572`; seed1696420279 trace140152bytes/SHA`04d76d90cd5425d64c625ac1cea15e5501bd009bccbc6fcad3be2e04bb6c9a14`. Все пути относительно own runtime `E:/R4D/perspective/p5-runtime/builder/`.

## Сохранённые входы и границы

P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`, config/projection/view-math и translation`[33256,34072]` неизменны; exact pins в frozen index. Native Millionko commit`5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, tree`008d16a80a26bb77d562a45218b01da09b0d9ff0`:27runtime files/82713bytes private source. Controller/physics/RNG/targets относительно c01 не правились. Collision event t → state t+1; lifecycle/bucket tick уже post-step. Pixi8.17.1/esbuild0.25.12/Node24.15.0, actual dependency lock и terms pinned в index; npm install не было.

@pixi/colord2.9.6 license supplement из exact official gitHead`5344fbf77b736f81cd33c21050021bc09bc9dd1d` включён:42installed files matched official archive, missingRuntimeLicenseFiles0. Public terms9330bytes/SHA`583c1487aefadfa1b72c181ab73a5f7a2030afb0545cf49b90ff66973faef82f`; native license grant не выдумывается.

Fresh preview guard00:26UTC: freeRAM16.167/31.907GiB, CPU system1%/aggregate2.79%, aggregateWS19.293GiB,406processes; C17.073/D16.281/E12.056GiB. Own peak0.3GiB RAM/0.05GiB E + concurrent allowance4/2GiB соблюдён. Outputs/cache/TEMP только own E/process-local. Failed turn`01a184ec-a3a3-7181-a2d5-48bc77a68872`: exact error **Selected model is at capacity. Please try a different model.** Это capacity; модель/effort/host не менялись. Нового denial не было; запрещённые исторические targets не повторялись. P2–P4/P6 и release server не затрагивались.

Следующий шаг — независимые TQA/VQA frozen c02. Локальная готовность для QA не открывает CTO release token gate.
