# Очередь A: фактическое состояние

Обновлено: **25 октября 2026 года**, Europe/Kyiv.

Канонический заказ: [CTO_EXPERIMENT_QUEUE_A.md](../CTO_EXPERIMENT_QUEUE_A.md). Этот файл ведёт CTO: здесь факты исполнения, ссылки и решения об остановке, без изменения обязательств заказа.

## Текущее выполнение

Макс согласовал новую очередь **Q5A → Q4A → Q2A** и позднее 24 октября прямо разрешил передать готовое задание CTO и приступить. Q5A выполняется существующей отдельной командой; Q4A и Q2A сохраняют строгую последовательность и не запускаются заранее. Хронологическая поправка к ошибочной idle-записи сохранена в [операционном состоянии проекта](PROJECT_STATE.md).

| Порядок | Опыт | Состояние | Материалы и показ |
|---|---|---|---|
| 1 | Q5A — конструкция до арта | Assembly03 frozen на `101343caa68579aacd5e6c01b94206680c364ab7`; Asset+Concept targeted re-review PASS, art/motion gate closed; ready for independent Technical QA and Visual QA | `experiments/q5a-construction-first/LEAD_STATE.md`, `ARTIST_MOTION_REREVIEW_ASSEMBLY03.md`, `CONCEPT_MOTION_REREVIEW_ASSEMBLY03.md`, `output/artist-motion-asset-rereview03/`, `output/artist-motion-concept-rereview03/`; QA ещё not started, release не начат |
| 2 | Q4A — цельный образ до частей | Ожидает завершения Q5A | Предусмотрен `experiments/q4a-whole-character/`; фактической ссылки на результат пока нет |
| 3 | Q2A — свободный выбор способа | Ожидает завершения Q4A | Предусмотрен `experiments/q2a-simple-character/`; фактической ссылки на результат пока нет |

Независимые review `attempt03` завершили уже существующие сессии:
Concept Artist `01a16ffd-87e7-7cf3-a9a2-29d2cd97a7ec` и Builder
`01a16ffd-8811-7d20-b80a-6a938f50b5a5`. Новые сотрудники или дубли сессий
не создавались.

Статический art gate, assembly02 и отрицательные motion review сохранены в истории. В assembly03 исправлен только общий bbox-based framing 2×; техническая заморозка и проверки Lead завершены ранее. Затем оба существующих художника независимо лично повторно просмотрели исправленный jump: ARTIST_MOTION_PASS и CONCEPT_MOTION_PASS, AM-A1/CM1 закрыты для exact frozen `101343c…`. Lead проверил новые отчёты/ссылки/witnesses/cleanup и побайтную сохранность всех1299 прежних Q5A-файлов. Исторические CHANGES_REQUIRED и evidence не переписаны; production не изменён. Art/motion gate closed, кандидат готов к независимым Technical QA и Visual QA по следующей выдаче CTO; QA ещё not started. Текущий ход сохраняет PASS/evidence/state, не запускает QA, release или Q4A/Q2A. Точные проверки и evidence — в `experiments/q5a-construction-first/LEAD_STATE.md`.

CTO по ходу заменяет сведения фактическим состоянием: активный опыт, команда, ссылки на материалы/демо, полученное качество и решение о продолжении или остановке. Появление каталога само по себе не означает начала или завершения опыта. Новый отдельный статусный сервис не требуется.

## Итог очереди

Пока отсутствует. После завершения здесь нужна ссылка на краткое сравнение Q5A/Q4A/Q2A и рабочие рекомендации с примерами. Материалы старых Q1–Q6 сохраняются отдельно и не переписываются под новые выводы.
