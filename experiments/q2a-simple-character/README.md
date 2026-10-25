# Q2A: полный motion P2

**Q2A_ACCEPTED_RELEASE_PACKAGE_READY.** CTO принял C2 как завершённый PoC
с ограничениями после независимых Technical/Visual QA PASS.
[Приёмка](CTO_ACCEPTANCE_P2_C2.md), [QA gate](QA_GATE.md).

Проверенный пакет для `/review/r4d/q2a-simple-character/`:
`release-package/route-tree/review/r4d/q2a-simple-character/` —
18 публичных файлов, 1 179 499 байт. [Состав и provenance](release-package/PACKAGE.md),
[независимый package-QA](RELEASE_PACKAGE_TECHNICAL_QA.md),
[состояние передачи](RELEASE_PACKAGE_STATE.md).
Локальный exact route: http://127.0.0.1:4340/review/r4d/q2a-simple-character/.
Для повторного просмотра из `release-package/`: `node preview-server.mjs`;
уже работающий 4340 повторно не запускать.

SHA256 `release-package/provenance.json`:
`61691306ebe4adb5c043dd0abfc4ceebb333f9984f4032c1692d8cba85aafca5`.
Публично передаётся только route tree; manifest, scripts, QA и raw остаются
вне него. Упаковка не меняет motion/pose/PNG/численную rig принятого кандидата.
**Q2A пока не опубликован; следующий шаг — CTO delivery gate, VPS не запускался.**

**Текущий frozen: `snapshots/p2_candidate_c2/`.**
**http://127.0.0.1:4333/runtime/**

Из каталога этого snapshot, нужен только Node.js:

```powershell
$env:Q2A_PORT='4333'
node runtime/server.mjs
```

Vendor, raw, metadata и PNG включены; npm ci, сборка и внешняя сеть для
показа не нужны. Свободные команды idle/low/walk/jump, выбор наземной цели
в полёте, пауза и история последних 30 секунд. Новая команда после выбора
кадра продолжает из него. Камера и метки земли позволяют смотреть опору.

Оба итоговых личных review и независимые QA завершены. Кандидат принят CTO;
новые исправления не открыты. Причины и ограничения —
[P2_C1_NOTES.md](P2_C1_NOTES.md), [P2_C2_NOTES.md](P2_C2_NOTES.md),
[P2_BUILDER_SELF_CHECK.md](P2_BUILDER_SELF_CHECK.md).

## Реально оставленные серверы

Все три URL проверены, HTTP 200; серверы привязаны только к localhost.

| Версия | URL |
|---|---|
| Финальный P2 C2 | http://127.0.0.1:4333/runtime/ |
| Неизменный P2 baseline | http://127.0.0.1:4330/runtime/ |
| Принятый с ограничениями P1 | http://127.0.0.1:4327/runtime/ |

Рабочий 4322, первый P1-сервер 4323 и промежуточные 4331/4332 остановлены
после проверки принадлежности процессов Builder. Ранее остановлены 4324–4326.
Snapshots, кадры, raw, PNG и логи сохранены; frozen 4333 не переписывался.

## История

P2 baseline: `snapshots/p2_full_motion_baseline01/`.
Motion-only C1: `snapshots/p2_motion_c1/`; отдельный recovery-fix:
`snapshots/p2_motion_c1_contactfix01/`. Их серверы остановлены.
P1: `snapshots/p1_candidate_c2_arms01/`, первый вариант:
`snapshots/attempt03_initial/`; проверки — [BUILDER_SELF_CHECK.md](BUILDER_SELF_CHECK.md).
Статические сравнения сохранены в `runtime/c1-comparison.html` и
`output/playwright/`, но остановленный рабочий 4322 их сейчас не обслуживает.

Commit/push координирует Lead. Команда ждёт CTO delivery brief;
новая коррекция и VPS этим шагом не открыты.
