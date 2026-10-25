# Очередь A: фактическое состояние

Обновлено: **25 октября 2026 года**, Europe/Kyiv.

Канонический заказ: [CTO_EXPERIMENT_QUEUE_A.md](../CTO_EXPERIMENT_QUEUE_A.md). Этот файл ведёт CTO: здесь факты исполнения, ссылки и решения об остановке, без изменения обязательств заказа.

## Текущее выполнение

Макс согласовал новую очередь **Q5A → Q4A → Q2A** и позднее 24 октября прямо разрешил передать готовое задание CTO и приступить. Q5A выполняется существующей отдельной командой; Q4A и Q2A сохраняют строгую последовательность и не запускаются заранее. Хронологическая поправка к ошибочной idle-записи сохранена в [операционном состоянии проекта](PROJECT_STATE.md).

| Порядок | Опыт | Состояние | Материалы и показ |
|---|---|---|---|
| 1 | Q5A — конструкция до арта | Assembly03 frozen; узкая коррекция framing 2×, Builder self-check PASS; ожидается targeted independent personal artist re-review исправленного jump | `experiments/q5a-construction-first/LEAD_STATE.md`, `ASSEMBLY.md`, `SELF_CHECK.md`, `output/builder-framing-correction/`; прежние Asset+Concept CHANGES_REQUIRED относятся к assembly02 и сохранены; Technical/Visual QA blocked/not started, release не начат |
| 2 | Q4A — цельный образ до частей | Ожидает завершения Q5A | Предусмотрен `experiments/q4a-whole-character/`; фактической ссылки на результат пока нет |
| 3 | Q2A — свободный выбор способа | Ожидает завершения Q4A | Предусмотрен `experiments/q2a-simple-character/`; фактической ссылки на результат пока нет |

Независимые review `attempt03` завершили уже существующие сессии:
Concept Artist `01a16ffd-87e7-7cf3-a9a2-29d2cd97a7ec` и Builder
`01a16ffd-8811-7d20-b80a-6a938f50b5a5`. Новые сотрудники или дубли сессий
не создавались.

Статический art gate, assembly02 и два отрицательных motion review сохранены в истории. В assembly03 Builder исправил только общий bbox-based framing 2× по AM-A1/CM1, без изменения принятых art/construction, rig/motion, controls, высоты jump или махов. Lead повторил npm test (15120 прежних motion frames, 20618 framing assertions), build (26/26 dist-файлов) и независимый dist GPU smoke desktop/mobile: exact/recipe witnesses с соседями и полные jumps, scale2, CSS ratio1.5, min logical/GPU margins около24px. 1164 защищённых файла побайтно неизменны. Следующий шаг — адресный независимый личный re-review обоими существующими художниками по поручению CTO. Их прежние CHANGES_REQUIRED не переписаны; QA blocked/not started. Этот ход не запускает artist re-review, QA, release или Q4A/Q2A. Точные проверки и evidence — в `experiments/q5a-construction-first/LEAD_STATE.md`.

CTO по ходу заменяет сведения фактическим состоянием: активный опыт, команда, ссылки на материалы/демо, полученное качество и решение о продолжении или остановке. Появление каталога само по себе не означает начала или завершения опыта. Новый отдельный статусный сервис не требуется.

## Итог очереди

Пока отсутствует. После завершения здесь нужна ссылка на краткое сравнение Q5A/Q4A/Q2A и рабочие рекомендации с примерами. Материалы старых Q1–Q6 сохраняются отдельно и не переписываются под новые выводы.
