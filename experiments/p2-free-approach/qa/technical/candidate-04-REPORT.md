# Candidate-04 — независимая ограниченная playback QA

28 октября 2026, Europe/Kyiv. `technical-qa-r4d-p2-free-01`; actual turn `01a1812a-54aa-75c3-a71f-bb8ac8c34437`. Начальный HEAD `d2e51e4d879c32e96256187922ea714c945f44e4`, своя ветка `codex/r4d-p2-free-technical-qa-01`, status был чистым.

**Вывод: проверенные offline-инварианты candidate-04 подтверждены; новых code blockers в этой области не найдено.** Непосредственно исполнены frozen playback clock/controller/core, независимо проверены clock boundaries, replay/state parity и сохранение presentation history. Это новый вывод04, не перенесённый PASS03 и не Builder selfcheck. **UI/Pixi/WebGL, фактический wall-time, DOM download, Android и scene/art PASS отсутствуют.** Candidate04 ещё не опубликован; опубликованный URL03 не использовался как target04. Решение о limited Review release остаётся Lead/CTO.

## Exact bytes и provenance

- Candidate: `p2-jungle-static-candidate-04`.
- Implementation source: `0a80b0b63c688b6f77b8f710576adf2ea5c263c1`.
- **Фактический build HEAD:** `08f9b9eaa6aa1063eb7fcd9cf373ddacf907725a`. Восемь относящихся code/build/scanner blobs сопоставлены с implementation commit: код одинаков, после реализации менялись bookkeeping-документы.
- Artifact: `E:\R4D\perspective\p2-runtime\output\p2-jungle-static-candidate-04`, browser tree `bundle/review/r4d/p2-free-approach`.
- Сверены **16 файлов / 2 452 021 bytes**: полное фактическое множество, отсутствие symlink/лишних файлов, каждый размер/SHA-256 до и после исполнения.
- Tree SHA-256: `60d216a64c86fed4b83f4ed3802e3d1393cdda2db8776818d22710173dc2ffed`, правило `SHA256(JSON.stringify(sorted per-file records)+LF)`.
- BUILD_MANIFEST SHA-256: `60f79d1bdad8d3737376952043013394bb3098de6b15200fc5c352dd875dd1f7`.

Собственный исполняемый QA: [candidate-04-offline.mjs](candidate-04-offline.mjs); обязательные CLI args для artifact/baseline/evidence/resources/output/core/SDK, без зашитых private operator paths. Новый evidence: `E:\R4D\perspective\p2-runtime\output\technical-qa\candidate-04-offline-01\EVIDENCE.json`, **249046 bytes**, SHA-256 **`3e216f15232893321bda29f1fa40a47a8dafaf0e51179e41777e22958b0b3410`**, запись `2026-10-28T06:30:44.454Z`.

Все пять source→output emissions сверены по точным source Git blobs, canonical-LF hashes и конкретным replacements. В main адаптируются четыре импорта, включая новый clock; в HTML — entry/importmap. Controller, clock и view-math копируются в `.js` без иной правки. Actual main/source receipts относятся к build08, не ошибочно к старому03 или только к implementation0a.

## Scope03→04, зависимости и defaults

Baseline03 принят только после проверки собственного evidence SHA-256 `0a34ca7223d7b85fa9150ab94600592f4edc83d8d68fd78ce12bfdfcfaa85a41` и всех baseline files. **11 файлов совпали побайтно:** config, accepted manifest, view-math, controller, compiled core, Pixi, license, JPG, два PNG и CSS. В art manifest изменены только candidate и consumer Git blob нового main; metadata — candidate/sourceCommit. Новый browser file — playback-clock.js; index/main изменены по playback scope.

Core compiled SHA-256 **`dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7`** неизменён; доступный native checkout имеет HEAD `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023` и чистую область пакета. Config SHA-256 **`dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db`**, H/domains, r16, PNG/их metadata и четыре occluders сохранены. Gesture/size/height/occlusion fixes не внедрялись; render отличается в отображении статуса скорости, не в геометрии/арте. Полный native-аудит прежних11087 состояний не повторялся.

Все **шесть `.js` ESM** разобраны и весь actual main/importmap graph успешно связан без исполнения DOM/Pixi. 15 записанных HTML/module/resource/asset ссылок route-relative, цели существуют внутри `/review/r4d/p2-free-approach/`; внешних/root-absolute обязательных зависимостей не найдено. App JSON fetch — GET без options, обязательного POST/API нет. Save по source формирует Blob/download JSON; реальный download не наблюдался. Pixi8.22 и MIT license совпали с сохранённым SDK; SDK SHA-256 **`a073adb40aaa803fd19066c21997a09f895397e98a5555be8bd0a7c57873d4ef`**.

Privacy scan независимо выполнен для **13 текстовых файлов**, включая новый clock.js и все шесть JS. Результат совпал с per-file receipt; TS/maps/private/local references не найдены. Осталось одно точное исключение Pixi `[135846,135849)` при прежних bytes/hash/context/output path. Положительные template-drive/file-URI/private-source/map controls обнаружены, обычный HTTPS не принят за drive; изменённый SDK исключение не получает. Builder check-playback/check-static/selfcheck/build не запускались как QA.

HTML содержит только rates0.25/0.5/1, **selected default0.25**. `main:28` передаёт численное значение select в frozen Clock; `209–216` связывает onchange/setPlaybackRate/record; `225–233` — visibility/consume/reset при terminal. Старая accumulator-ветка удалена, второго умножения через ticker.speed в app нет. Эти проверки source wiring не являются нажатием DOM-контролов.

## Clock: независимый oracle

Исполнен **actual frozen `src/playback-clock.js`**, а не скопированная функция и не Builder checker. Ожидания получены отдельным BigInt ledger: накопленный общий кредит в единицах1/16ms и отдельно потраченные тики. Это не переписанная remainder-формула модуля; quarter-ms входы дают точные целочисленные границы без подгонки floating epsilon.

**10 сценариев / 71 действие:** три threshold и три uneven-frame сценария для0.25/0.5/1; mixed rate changes с сохранением fractional carry и без advance; reset с discard fraction/ровно следующего delta; suspended hidden→visible без backlog; remainingTicks cap/terminal reset. Подтверждены ожидаемые ticks и каждый промежуточный rate/remainder/suspended/discard snapshot. Смена rate сохраняет заработанную долю времени; reset/изменение suspension намеренно обнуляет её и пропускает следующий presentation delta согласно объявленной policy. Повтор того же suspended значения сам по себе не сбрасывает clock.

**17 недопустимых входов** отклонены: duration0/Infinity/строка, неподдерживаемые и строковые rates, отрицательный/NaN/Infinity delta, отрицательный/дробный/небезопасный remaining, строковый suspended и overflow конечных budget inputs. Отдельно проверены неизменность clock после ошибочных вызовов и независимость возвращаемого snapshot. Это API/model-проверки; настоящая приостановка browser tab не исполнялась.

## Физические состояния, события и replay

Исполнены frozen core/controller04. Для seed **1** и сохранённого обычного seed **490822599** проведены **шесть rate-window случаев** (два seed × три rate). При одинаковом физическом тике **94/95/96/105/250** совпали полные SimState, rngU32 и события. Состояния94/95/96 сверены с hash-verified03 checkpoints;105/250 — с короткой reference-веткой неизменного core/controller. Rate change не двигает state; manual seek94 +1 возвращает95, затем +10 возвращает105. Эти действия не зависят от скорости подачи тиков.

Дополнительно по одному **новому mixed-rate scheduler пути до terminal** на каждый seed: uneven delta меняются и rate переключается во время исполнения. Наблюдения:

| Seed | Terminal | Исход | SHA-256 всех native frames |
| --- | ---: | --- | --- |
| 1 | 1735 | LOST | `76dbe2227e8e7ed57842e8141b43be37ce728e6160fee11d5ca80a10ef89b376` |
| 490822599 | 2172 | LOST | `38b4ad4296ee9d7925d5af3ee5de323ecd3bf274290e79d67f0d69ac753fcf08` |

Каждый path hash, конечное состояние и полные события совпали с собственным03 baseline, ранее независимо связанным с native core. Это проверка нового clock→controller стыка, **не повторная3909-step pairwise native/compiled матрица**. Сохранён исходный контакт leaf-01, event94/post-step frame95. Terminal больше не продвигается, budget сбрасывается. `IN_BUCKET` не наблюдался; seed не отбирались ради успеха. Node synthetic input deltas не выданы за реальные wall-seconds.

Descriptor несёт новый candidate04/build08 provenance, исходный полный config, seed и start/drop. Presentation не добавлена в physical config или его hash; core/PRNG не получают rate. Reference/controller — из artifact04, а не собственная пересборка.

## Presentation history и rewind

Отдельно исполнен frozen `mergeObservation` с двумя наборами реальных физических checkpoints и сконструированными presentation histories. При rewind с250 на94 сохранены physical tick/state250 и **последняя** presentation.atTick94 с полной последовательностью history, включая ранние0.25/0.5, seek назад и rate1. Inspected ticks сохранили обе точки, а история осталась в порядке sequence, не отсортирована по убывающим после seek физическим тикам. При более позднем terminal checkpoint обновились physical поля, сохранилась расширенная новая history. Входные записи не мутировали; JSON roundtrip не превратил history в одну текущую rate и не изменил config/seed/provenance.

По source `main:175–186` record сначала дописывает sequence/reason/atTick/rate/paused/hidden/view settings, затем клонирует history в presentation и вызывает merge. Start сохраняет superseded run и создаёт новую history/sequence для нового run id; manual step/seek, focus pause, rate-change и visibility события записываются отдельно. Это source-review плюс pure merge JSON-модель; фактические record()/save()/DOM callbacks браузера не вызывались. Полный контекст экспортируемых объектов проверен в указанной Node-модели, UI download остаётся отдельной непроверенной областью.

## Preflight: обычный exit1 и новый ресурсный receipt

Первый read-only exec **`exec-85534e35-9e42-4354-8f75-bfbbf6d181a4`** завершился exit1 после успешных Git/resource outputs. Точная причина: `Get-Process node,python,chrome,msedge -ErrorAction SilentlyContinue` получил **`NoProcessFoundForGivenName,Microsoft.PowerShell.Commands.GetProcessCommand`** для отсутствующего **msedge**. SilentlyContinue скрыл сообщение, но оставил `$?=false`. Узкий контрольный вызов воспроизвёл этот ErrorId/Target; обычный `Get-Process | Where-Object ...` завершился exit0. **Policy denial не было**, другой actor/runner для обхода не использовался. QA не объявлялась запрещённой по одному failed-status.

Перед Node снят новый host-wide RAM/CPU/C/D/E snapshot при общей конкурентной области Millionko/P3, без чтения command lines/секретов и без атрибуции/остановки чужих PID. Свободно **RAM11.824 GiB**, CPU1%, C8.044/D16.322/E38.820 GiB. Плановый общий C-пик1.525 GiB сохранён; собственный peak RAM256MiB/E-output16MiB, один Node worker, серверов/браузера нет. Известного исчерпывающего пика нет; правила4/2 соблюдены, reserve10 не применялся. TEMP/TMP только process-local E, Node compile cache отключён.

Receipt: `E:\R4D\perspective\p2-runtime\output\technical-qa\candidate-04-offline-01\RESOURCE_PREFLIGHT.json`, **1369 bytes**, SHA-256 **`1842382793b521906c3655afd0103777ad16d4580d70eaf9f55bf323dde47903`**. Там сохранены original ordinary error/correction и свежие ресурсы. Прогон завершился exit0; своих активных Node/exec/server процессов не оставлено. Actual peak CPU/RAM не заявлен измеренным — это preflight и плановый бюджет.

## Непроверенное и следующий допуск

Нет target/auth-факта для actual04 HTTP/Pixi/DOM. Не открывались ни browser, ни login-only03; headers/MIME/CSP/ресурсные requests, canvas/render errors, реальные rate-control/visibility/pause/replay/seek clicks, wall timing, download DOM и Android-жесты не проверены. Модель clock не подменяет это наблюдение. Gesture/ball-size/height/occlusion вопросы прежнего разбора не закрыты; четыре накладки/остальные21, ограда/бортики остаются прежней границей. Full Technical/Art/P2 closure отсутствуют.

Frozen browser tree/manifest, старые03/02 reports/evidence и raw assets сохранены. Build/install/release/token/server writes/новые порты/люди/worktrees/устройства не выполнялись; старые rejected Windows/file действия не повторялись. Ожидание публикации/авторизации не поддерживается. Следующая браузерная QA — только по адресному допуску exact опубликованного04 и подтверждённому допустимому просмотру.

Повторяемый public пример: `<NODE_24> --experimental-vm-modules experiments/p2-free-approach/qa/technical/candidate-04-offline.mjs --artifact "<CANDIDATE_04>" --baseline-artifact "<CANDIDATE_03>" --baseline-evidence "<OWN_QA03_EVIDENCE>" --output "<NEW_E_RUNTIME_OUTPUT>" --resources "<FRESH_RESOURCE_RECEIPT>" --core-root "<PINNED_CORE_CHECKOUT>" --pixi-root "<EXISTING_PIXI_PACKAGE>"`. Старые evidence не перезаписывать; перед Node свежий scope/peak guard, process-local E temp/cache.
