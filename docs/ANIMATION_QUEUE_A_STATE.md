# Очередь A: фактическое состояние

Обновлено: **25 октября 2026 года**, Europe/Kyiv.

Канонический заказ: [CTO_EXPERIMENT_QUEUE_A.md](../CTO_EXPERIMENT_QUEUE_A.md). Этот файл ведёт CTO: здесь факты исполнения, ссылки и решения об остановке, без изменения обязательств заказа.

## Текущее выполнение

Макс согласовал новую очередь **Q5A → Q4A → Q2A** и позднее 24 октября прямо разрешил передать готовое задание CTO и приступить. Q5A выполняется существующей отдельной командой; Q4A и Q2A сохраняют строгую последовательность и не запускаются заранее. Хронологическая поправка к ошибочной idle-записи сохранена в [операционном состоянии проекта](PROJECT_STATE.md).

| Порядок | Опыт | Состояние | Материалы и показ |
|---|---|---|---|
| 1 | Q5A — конструкция до арта | Q5A accepted by CTO для PoC release; ASSEMBLY03 frozen `101343caa68579aacd5e6c01b94206680c364ab7`; art/motion и Technical/Visual QA gates closed; release blocked/not published | [Release record](../experiments/q5a-construction-first/RELEASE_ASSEMBLY03.md): `BLOCKED_BY_VPS_ACCESS_PROHIBITION`; доступный показ Q5A не подтверждён; приёмка — `experiments/q5a-construction-first/CTO_ACCEPTANCE_ASSEMBLY03.md` |
| 2 | Q4A — цельный образ до частей | Не начат: Q5A ещё не доступен для просмотра | Предусмотрен `experiments/q4a-whole-character/`; фактической ссылки на результат пока нет |
| 3 | Q2A — свободный выбор способа | Не начат: ожидает Q4A; переход очереди закрыт до доступного показа Q5A | Предусмотрен `experiments/q2a-simple-character/`; фактической ссылки на результат пока нет |

Независимые review `attempt03` завершили уже существующие сессии:
Concept Artist `01a16ffd-87e7-7cf3-a9a2-29d2cd97a7ec` и Builder
`01a16ffd-8811-7d20-b80a-6a938f50b5a5`. Новые сотрудники или дубли сессий
не создавались.

Статический арт, исходные attempts, corrections и отрицательные review сохранены в истории. Art/motion gate assembly03 закрыт двумя независимыми художественными PASS. На QA base `0f032c21f555473aca7c61960a8c563d2440fc97` получены TECHNICAL_QA_PASS и VISUAL_QA_PASS для неизменного frozen production `101343c…`. CTO `cto-r4d-01` принял Q5A для PoC release без блокеров; слабый contrast служебного dark badge принят как non-blocking limitation без нового correction cycle. Формальная приёмка и известные Chrome/mobile emulation/PoC-ограничения сохранены в `CTO_ACCEPTANCE_ASSEMBLY03.md`. Production diff=none; Lead сохраняет QA/evidence/acceptance/state. Публикация Release Engineer — отдельный следующий шаг, её доступность пока не подтверждена. Q4A/Q2A не стартовали; этот ход не запускает release или новые опыты.

После отдельного production release brief CTO Release Engineer read-only проверил HEAD=локальный origin/main=`31ade6bb3109052c297e08013607ddd04eea866a` и предыдущие release reports Q1/Q5/Q6. Штатный Review release требует серверного release-каталога, переключения nginx Review root, проверки конфигурации и reload на VPS; эти действия прямо запрещены brief. Публикация остановлена до внешних изменений: **BLOCKED_BY_VPS_ACCESS_PROHIBITION**, Q5A не опубликован, доступность и delivery smoke не проверены. Production diff=none; приёмка и QA не меняются. Подробности — [RELEASE_ASSEMBLY03.md](../experiments/q5a-construction-first/RELEASE_ASSEMBLY03.md). Следующее действие CTO/Макса — определить разрешённый существующий non-VPS delivery route либо отдельно изменить полномочия. Q4A/Q2A остаются не начатыми, поскольку Q5A ещё не доступен для просмотра.

CTO по ходу заменяет сведения фактическим состоянием: активный опыт, команда, ссылки на материалы/демо, полученное качество и решение о продолжении или остановке. Появление каталога само по себе не означает начала или завершения опыта. Новый отдельный статусный сервис не требуется.

## Итог очереди

Пока отсутствует. После завершения здесь нужна ссылка на краткое сравнение Q5A/Q4A/Q2A и рабочие рекомендации с примерами. Материалы старых Q1–Q6 сохраняются отдельно и не переписываются под новые выводы.
