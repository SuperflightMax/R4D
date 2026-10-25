# Q4A — цельный образ до частей

Канонический заказ: [Queue A](../../CTO_EXPERIMENT_QUEUE_A.md), общие условия и секция Q4A. [Команда и состояние](TEAM.md), [договор до генерации](AGREEMENT.md).

**Текущая попытка — whole-v04: SOURCE_POSE_FAIL.** P с исправленным [единым pose-guide](builder/whole-v04/pose-guide.png) опубликован `5aa3b2d`; G выполнен одним whole-вызовом и тремя личными reviews. Near upper-arm ещё перекрывает майку (alpha253–254), плотные подошвы расходятся на5–7px при допуске4. [Точный gate, raw-проверка и передача CTO](WHOLE_V04.md#g-завершён-source_pose_fail-по-пунктам2-и3). Accepted whole нет; v05 автоматически не запускается, нарезка/rig/full parts/motion/QA/release/Q2A закрыты.

Последний source — whole-v03 correction02: identity/art/fitted shorts/ракурс приняты, но верхняя ближняя рука перекрывает майку, плотные подошвы различаются на15 px. [SOURCE_POSE_FAIL](WHOLE_V03.md#correction02-source_pose_fail-gate-завершён), опубликован `182a3e9`; все прежние материалы frozen.

Семейство v02 3-panel/single-affine закрыто по решению CTO после [read-only FAIL05](HANDOFF_05.md); [brief05](CORRECTION_05.md) остаётся неизменным входом анализа. Whole-v03 — новый цельный source в той же Q4A, без переноса старых частей/рига.

История: [garment04](CORRECTION_04.md#итог-early_v02_04_garment_fail), [boundary-тест03](CORRECTION_03.md#этап-a-fail-дальнейшие-этапы-не-начаты), [коррекция02](CORRECTION_02.md#итог-early_v02_02_gate_fail), [первая попытка](HANDOFF.md).

## Открыть раннюю попытку

Последний статический [raw-v04](art/whole-v04/raw/whole-v04.png) на [светлом](art/whole-v04/previews/whole-v04-light.png), [тёмном](art/whole-v04/previews/whole-v04-dark.png), [checker-фоне](art/whole-v04/previews/whole-v04-checker.png). Это непринятый исходник, не новое анимационное демо. Сохранены [raw-v03 correction02](art/whole-v03/raw/whole-v03-correction02.png) и первый [raw-v03](art/whole-v03/raw/whole-v03.png); correction01-изображение не получено.

Из этого каталога: `npm ci --no-audit --no-fund`, затем `npm run dev`.
Нового renderer/build05 нет: этап A read-only остановлен до изготовления. Последний сохранённый garment-only after04: <http://127.0.0.1:4194/early-v02-04/index.html>, пакет `build/early-v02-04/`. Есть neutral↔deep low, шаг/пауза/замедление, два фона и фиксированное 3× увеличение одежды; тело02 неизменно.
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
- Read-only05: [сверка Asset](art/early-v02-05/AGREEMENT.md), [Builder](builder/early-v02-05/RESULT.md), [все 15 samples/точный gap](builder/early-v02-05/ANALYSIS.json), [входные hashes](builder/early-v02-05/INPUT_SHA256.json). Художественного after05 нет.
- Whole-v03: [общий PREGEN/source status](WHOLE_V03.md), личные [Concept](concept/whole-v03/SOURCE_REVIEW.md), [Asset](art/whole-v03/SOURCE_REVIEW.md), [Builder](builder/whole-v03/SOURCE_REVIEW.md); [условия недоступной correction01](art/whole-v03/raw/whole-v03-correction01-conditions.md).
- Correction02: [условия/raw provenance](art/whole-v03/raw/whole-v03-correction02-conditions.md), личные [Concept](concept/whole-v03/SOURCE_REVIEW_CORRECTION02.md), [Asset](art/whole-v03/SOURCE_REVIEW_CORRECTION02.md), [Builder](builder/whole-v03/SOURCE_REVIEW_CORRECTION02.md). Единогласный source pose FAIL; новый fitted garment принят только статически.
- Whole-v04: [P→G и итог](WHOLE_V04.md), [условия двух references/raw](art/whole-v04/raw/whole-v04-conditions.md), личные [Concept](concept/whole-v04/SOURCE_REVIEW.md)/[Asset](art/whole-v04/SOURCE_REVIEW.md)/[Builder](builder/whole-v04/SOURCE_REVIEW.md), [реальная alpha/sole проверка](builder/whole-v04/source/RAW_CHECK.json). Guide принят, новый source FAIL; движения нет.

`npm run check` содержит шесть проверок общего механизма/опоры. Для04 повторены `node builder/early-v02-04/check-matrices.mjs`, `node builder/early-v02-04/check-material.mjs`, `npm run build` — успешно. Они не подтверждают художественное качество: garment gate04 FAIL. Независимые Technical QA и Visual QA пока подготовили планы, полный кандидат им не выдавался.
