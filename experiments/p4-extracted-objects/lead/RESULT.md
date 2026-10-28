# R4D P4 — RESULT, рецепт и handoff

29 октября 2026, Киев. Опубликован [ограниченный прототип «Извлечённые объекты»](https://superflight.space/review/r4d/p4-extracted-objects/). Сначала проверен реальный Pixi-стык flower01/wood01/receiver01, затем подключён полный набор и исправлены замечания QA. **Это не Full Art PASS и не полная приёмка P4.**

Вход — исходный `01-jungle.jpg`, 1536², SHA256 `c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72`; принятый P1 commit `4b47db04c7140ebf88f69b91faa0b790d46f22ec`. Настоящий Millionko — core commit `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, compiled bundle SHA256 `8843446996582eaccbd9ff63d3147d74b7eca9a614d8e0df16851d1d89d46f50`. Сохранены config 25 pins/16 segments/4 buckets/1 drop, r16, tick5ms, g980, maxspeed2000, noise2°/0.02, lcg32/quantize7, P1 anchors и проекция. Арт, камера и перекрытия не меняли native state/PRNG/events; обычный random меняет seed.

Финальные привязки; файловые hashes — SHA256:

| Объект | Exact pin |
|---|---|
| Art `full-v03` | commit `b7efff1e2f519812421829808e71a0d83154926d`; manifest `276dfdfd32f1f543ce39d72fe7e360523c6ec70387d1c44dd21acd47f9fb1a6a` |
| Consumer/app | **LOCAL HELD** commit `7d2344c1a8959f73ff26af5d3aba7dd02eb0e971`; app.js `855fd997a3f02629e924031841d9e3759d7d7f4008b1d8af034505dd12f76ece` |
| Frozen target обеих QA | `p4-full-v03-candidate-03`; artifact `298649ec518a13e8070201e822108005a6b5081454452f50243d18f2fde2d542` |
| Public subset | 82 файла / 10 099 772 bytes; manifest `95d33355b9f50d77e38cfdb2279bec6ee3746e6230a1ac7e1e32d1f4ecc63241` |
| Delivered root | 645 файлов / 85 каталогов / 100 931 804 bytes; outer manifest `6ff450873c0d5c8bfd01e56f8b285b4e2b5f27f0a09f7bab6f15b731edfdfeb8`; simple-tree `6371ba2af02c14a6b5bc4a2e51708055fb3d03670af83672d9188105432e2152` |

Существующий рецепт зафиксирован без повторного исполнения. Точный повтор использует сохранённые assets/provenance: model/seed/sampler генератора не раскрыты, повтор prompt не обещает тех же пикселей.

1. **Извлечение/очистка.** Видимые RGB тел/foreground — из JPG; alpha — контуры, локальный GrabCut и ручные foreground seeds. Генерация — только скрытый пол/фон, ball/shadow. Из background удалены 25 pins, старые тени, четыре корзины; восстановлены участки под foreground. Generated plate применён только под записанными masks. Poisson NORMAL_CLONE/переход5px согласует пол с границей; RGB вне восстановления сохранены. Object shadows оценены по исходнику и чистому полу: это не точное разложение JPEG-освещения.
2. **Сборка.** 25 body +25 shadows +8 receiver rear/front +3 fixed sceneParts =61 RGBA-часть; с background/ball/shadow —64 textures. Боковые полосы включают исходную декорацию, hidden3D не строится. 29 anchors — P1; placement = source anchor − local anchor. PixiJS8.22.0 MIT: premultiply один раз, shadows под телами, body/ball сортируются по native Y основания; receiver-back до шара, receiver-front после при пересечении source billboard с областью корзины; sceneParts перед receiver-front. Native view — P1 inverse тех же source quads, Art-off снимает перекрытия.
3. **Шар.** Центр `P=project(H,native)`, radius `R=16/w`, где H — P1 nativeToSource, w — однородный знаменатель. Scale — по alpha content radius, не canvas. Shadow offsetR `[-0.95,0.86]`, half-sizeR `[1.55,0.58]`, opacity `0.65`, один ground sprite. Body/r16/anchors/core неизменны. Все65 PNG v03 равны v02; provenance restoration mask не является игровой маской.
4. **Существующий повтор.** Exact frozen03 и [RUN.md](E:/R4D/perspective/p4-runtime/builder/candidates/p4-full-v03-candidate-03/RUN.md): `serve.mjs`, process-local `P4_RUNTIME/P4_CANDIDATE/P4_PORT`, свой loopback port. Ordinary03/seed1842222754: shadow590, partial wood605, contact616, receiver02/end2421; прежний seed4: receiver04/end2088; ordinary05/LOST1323 сохранён. Сохранённый checkpoint воспроизводится импортом; same-file import и camera/view/Art invariant проверены. Здесь ничего не запускалось.

Public subset включает восемь лицензий/original-image fallback; helper, Markdown, fixtures/history/evidence/markers/restoration mask исключены. P1 `source/path` сохранён по узкой CTO disposition, raw private TS/maps не доставлялись. Доставка: отдельный inode clone, карточка4→5 и RAW root-literal switch, отдельно авторизованные при сохранённом Git HOLD.

Существенные неудачи и полезные исправления:

- Первый generated plate удалил не тот flower; приняты только подходящие локальные области, нужный crop исправлен. Full-v01 терял wood-07 cap/flower-04 petal; v02 уточнил seeds/контуры/очистку. Wood seam исправлен градиентами, исходные RGB тел сохранены.
- Candidate01 с same-file import bug не назначался QA; исправлен в02. Capture helper записал семь свежих raw кадров в старый внешний каталог: provenance зафиксирован, immutable01 не менялся, старые кадры не переименованы в новые.
- **QA02 отказала:** отрицательная rAF delta давала RangeError/остановку Play, shadow сливалась с body. В03 — rAF-only/reset при прежнем native guard и только три новых shadow display-параметра. Неудачные freezes сохранены.
- Builder push получил generic rejection неизвестной причины. Final source LOCAL HELD, retry/другого writer не было.

Независимые [TQA03](https://github.com/SuperflightMax/R4D/blob/2c4671b5ed5b04a1635c2429328cf433ac4ec35f/experiments/p4-extracted-objects/qa/technical/CANDIDATE_03_REPORT.md) и [VQA03](https://github.com/SuperflightMax/R4D/blob/eeea68cc8c53bc3462ba310410a6ffe7b088e070/experiments/p4-extracted-objects/qa/visual/FROZEN_03_REVIEW.md) проверили один artifact SHA: PASS технической дельты —8 start/resume/seek случаев,40 точных state/PRNG/events snapshots,console0; PASS shadow fix в574² и регрессии wood/frog/side/border/receiver02/04. Неизменные oracle/inputs и часть проверок02 — baseline, не заново выполненная полная QA03.

**Targeted receiver01/03, partial front-rim при capture и отдельная фаза погружения после native end не подтверждены; полной художественной приёмки/всех контактов нет.** Delivery smoke — OBSERVED_WITH_LIMITATIONS в одной IAB surface:64textures/ball-shadow/random/replay/pause-resume,console0. Incidental native receiver03 не закрывает targeted Art QA; smoke не является независимой QA.

HTTP82 —82/82 PASS bytes/SHA/MIME/cache/security. Оба doc prefixes/owner/mode/inode сохранены, own lock снят,24receipts/0failure-placeholders; roots/upload/backups retained. Final receipt `8955d1e855b9b669cff22fb14a19f106988d98d03ad5bd7351b6074a8b7b260e`; [private handoff](E:/R4D/perspective/p4-runtime/release-engineer/p4-review-execution-03/FINAL_DELIVERY_HANDOFF.private.md), commit `ddb1682ced64cc68597642479ac838b3cef1bdc7`. CTO освободил delivery window **29.10.2026 00:11:01 Киев (28.10 22:11:01 UTC)**; grant закрыт.

Последние поручения Builder/Artist/TQA/VQA/Release завершены; новых заданий нет. Builder Git HOLD сохраняется. Lead STOP: дальнейших разрешённых исполнений нет. Research slot P4 освобождает CTO отдельно после review RESULT.

Дополнительные источники собственной истории: [арт-журнал с prompt/provenance](https://github.com/SuperflightMax/R4D/blob/b7efff1e2f519812421829808e71a0d83154926d/experiments/p4-extracted-objects/artwork/RUN_RECORD.md), [контракт v03](https://github.com/SuperflightMax/R4D/blob/b7efff1e2f519812421829808e71a0d83154926d/experiments/p4-extracted-objects/artwork/full-v03/README.md), [реальный public-кадр](E:/R4D/perspective/p4-runtime/release-engineer/p4-review-execution-03/ui-current-public.png), [полная хронология Lead](STATE.md).
