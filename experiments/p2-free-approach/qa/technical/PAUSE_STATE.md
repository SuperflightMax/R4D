# Technical QA — checkpoint pause/resume

28 октября 2026. `technical-qa-r4d-p2-free-01`.

**RESUMED_SCOPE_COMPLETE.** После явного resume Max от `2026-10-28 05:36 UTC` и завершённого [source/data-разбора03](candidate-03-ANDROID_SOURCE_DIAGNOSIS-01.md) получен отдельный exact handoff candidate-04. Его независимая bounded offline QA выполнена: [verdict04](candidate-04-REPORT.md). Фактический build HEAD `08f9b9eaa6aa1063eb7fcd9cf373ddacf907725a`, tree `60d216a64c86fed4b83f4ed3802e3d1393cdda2db8776818d22710173dc2ffed`; frozen bytes не менялись. Node clock/model прошёл, UI/Pixi/wall-time/download/Android/art не наблюдались. Browser не открывался; нового target/auth04 нет, опубликованный03 не является target04.

История: прямая команда Max от `2026-10-28 00:46 UTC` была применена как PAUSED_SAFE; её checkpoint `36601e05388aa0dcf352f63adf7dbca30ec48659` сохранён в Git. Заказ не отменялся; прежние stage2, release, слоты и token сами по себе паузу не снимали.

- Worktree: `E:\R4D\perspective\p2-worktrees\technical-qa`.
- Ветка: `codex/r4d-p2-free-technical-qa-01`.
- Последний завершённый рабочий commit до pause checkpoint: `f7b4da7f8ca5bf9943c9cbba607ca44505c6f11a`, отправлен в remote.
- До записи checkpoint status чистый; незакоммиченного продуктового WIP нет. Текущий checkpoint commit определяется HEAD этой ветки и сообщается в PAUSED_SAFE ACK.

## Сохранённое состояние

Frozen candidate-03: source `e7ed4d068f33ee6ecda491f15dc46a6fd548ef96`, tree `d9dba321de0c4c9ba3acf61297b4fe0401a8ea9f0f4069362371dbc94fc0308d`. Artifact: `E:\R4D\perspective\p2-runtime\output\p2-jungle-static-candidate-03`. Не менялся и не пересобирался.

- [candidate-03-REPORT.md](candidate-03-REPORT.md): ограниченная независимая offline-проверка; исправление сканера подтверждено, UI/Pixi/scene PASS отсутствуют.
- [candidate-03-ACCESS-01.md](candidate-03-ACCESS-01.md): после штатной публикации одна обычная HTTPS-навигация привела на `https://superflight.space/login?next=review`, title «Вход · SuperFlight», конечный HTTP200, redirectCount1. Post-auth/UI/MIME/download не проверены.
- Новые evidence: `E:\R4D\perspective\p2-runtime\output\technical-qa\candidate-03-offline-01\EVIDENCE.json` и `E:\R4D\perspective\p2-runtime\output\technical-qa\candidate-03-access-01\EVIDENCE.json`. Старые candidate-02 evidence, immutable/raw assets и frozen trees сохранены.

## Своя нагрузка и атомарные операции

На получение pause уже выполняющихся atomic операций не было. Свой Node audit ранее завершился exit0. Серверы никогда не запускались; активных собственных exec-сессий нет. Созданная для access-check IAB-вкладка id1 уже закрыта; последнее подтверждение inventory своего IAB id2 — пустой список. Чужие PID, вкладки и процессы не затрагивались, поиск/уборка неизвестной нагрузки не выполнялись. Release/root switch/reload/rollback не выполняются. Этот короткий commit/push — только разрешённый checkpoint.

## Точная точка продолжения

Candidate04 offline-прогон завершён exit0; новых offline code blockers не найдено. Свои активные процессы/серверы/вкладки не оставлены; после report/commit/push остановиться без active ожидания. Новый evidence `E:\R4D\perspective\p2-runtime\output\technical-qa\candidate-04-offline-01\EVIDENCE.json`, SHA `3e216f15232893321bda29f1fa40a47a8dafaf0e51179e41777e22958b0b3410`; resource/error receipt сохранён рядом. Первая preflight exit1 была обычным отсутствующим msedge, не policy denial; исправлен только способ перечисления процессов. Следующее действие — адресный допуск к exact опубликованному04 с новым подтверждённым фактом допустимого browser-просмотра. Старый login-only03 и denied launcher/file/security действия не повторять; credentials/secretconfigs/allowlists не читать, новые серверы/порты/устройства не использовать. Physics/core/geometry/radius/арт не менялись, Review server writes0, token не получался, P2 не закрыт, другие проекты/слоты не открыты.
