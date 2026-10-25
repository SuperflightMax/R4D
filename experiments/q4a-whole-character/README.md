# Q4A — цельный образ до частей

Канонический заказ: [Queue A](../../CTO_EXPERIMENT_QUEUE_A.md), общие условия и секция Q4A. [Команда и состояние](TEAM.md), [договор до генерации](AGREEMENT.md).

**Текущий результат — EARLY_V02_04_GARMENT_FAIL.** Три естественные панели имеют положительные единые матрицы, но в прежнем deep low одежда сжимается и отходит от ягодицы/верхнего бедра. Покрытие тела/B и условный repair не открыты, полного кандидата нет. [Итог и передача CTO](CORRECTION_04.md#итог-early_v02_04_garment_fail). История: [boundary-тест03](CORRECTION_03.md#этап-a-fail-дальнейшие-этапы-не-начаты), [коррекция02](CORRECTION_02.md#итог-early_v02_02_gate_fail), [первая попытка](HANDOFF.md).

## Открыть раннюю попытку

Из этого каталога: `npm ci --no-audit --no-fund`, затем `npm run dev`.
Текущий garment-only after04: <http://127.0.0.1:4194/early-v02-04/index.html>, пакет `build/early-v02-04/`. Есть neutral↔deep low, шаг/пауза/замедление, два фона и фиксированное 3× увеличение одежды; тело02 неизменно.
Геометрический тест03 (только ткань/source→target): <http://127.0.0.1:4194/early-v02-03/index.html>, пакет `build/early-v02-03/`.
Сохранённая художественная попытка02: <http://127.0.0.1:4194/early-v02-02/index.html>.
Первая попытка01: <http://127.0.0.1:4194/early-v02-01/index.html>.
Пакеты01/02 на диске: `build/early-v02-02/` и `build/early-v02-01/`. Оба содержат собственные арт и код и остаются неизменными.

«Исходная раскладка» показывает извлечённые части в исходных координатах; «Покой» — попытку общей опоры; «Присед» — глубокий low. Есть пауза, шаг, замедление, светлый/тёмный фон и ориентиры. Ходьба/прыжок в этом тесте закрыты. [Подробности запуска](builder/RUN.md).

## Источники и результат

- [Цельный v01](art/source/whole-v01.png), [просмотр v01](concept/WHOLE_V01_REVIEW.md).
- [Цельный v02](art/source/whole-v02.png) — разрешённый CTO edit v01, [условия и эффект](art/source/whole-v02-notes.md), [Concept review](concept/WHOLE_V02_REVIEW.md), [Builder review](builder/WHOLE_V02_REVIEW.md).
- [Ранние части и происхождение](art/early/README.md): извлечённые пиксели, маски и локальные восстановления сохранены отдельно. Персонаж, арт, риг и код созданы заново; прежние кандидаты не использованы.
- [Результат Builder](builder/early-v02-01/RESULT.md), [личный просмотр Concept](concept/EARLY_V02_01_REVIEW.md), [личный просмотр Asset](art/early/MOTION_REVIEW.md).
- Коррекция 02: [владение контурами и происхождение](art/early-v02-02/README.md), [Builder](builder/early-v02-02/RESULT.md), [Concept rereview](concept/EARLY_V02_02_REVIEW.md), [Asset rereview](art/early-v02-02/MOTION_REVIEW.md).
- Этап A коррекции 03: [трассировка Asset](art/early-v02-03/TRACE.md), [согласованная геометрия Builder](builder/early-v02-03/GEOMETRY_AGREEMENT.md), [аудит](builder/early-v02-03/STAGE_A.json), [внутренний пример инверсии](builder/early-v02-03/INTERNAL_WITNESS.json). Это геометрическая проверка, не новая художественная анимационная попытка.
- Garment04: [договор панелей](art/early-v02-04/PANELS.md), [материал/coverage/RGBA](art/early-v02-04/SELF_CHECK.md), [Builder](builder/early-v02-04/RESULT.md), [Concept](concept/EARLY_V02_04_REVIEW.md), [Asset](art/early-v02-04/MOTION_REVIEW.md).

`npm run check` содержит шесть проверок общего механизма/опоры. Для04 повторены `node builder/early-v02-04/check-matrices.mjs`, `node builder/early-v02-04/check-material.mjs`, `npm run build` — успешно. Они не подтверждают художественное качество: garment gate04 FAIL. Независимые Technical QA и Visual QA пока подготовили планы, полный кандидат им не выдавался.
