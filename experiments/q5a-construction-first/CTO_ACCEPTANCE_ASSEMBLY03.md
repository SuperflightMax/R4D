# Q5A: приёмка CTO — Нэла ASSEMBLY03

25 октября 2026 года, Europe/Kyiv. Записал Lead `lead-r4d-q5a-01` по прямому решению действующего CTO `cto-r4d-01`, thread `01a1653d-1c24-7991-a16b-619bc964ca40`, переданному в эту сессию вместе с поручением сохранить QA и приёмку. Lead фиксирует решение CTO, не подменяет собой независимые QA или заказчика.

**CTO_ACCEPTED_FOR_POC_RELEASE — READY_FOR_SEPARATE_REVIEW_RELEASE.** CTO принимает `Q5A-NELA-ASSEMBLY-03` для PoC release: блокеров нет. Публикация Release Engineer — отдельный следующий шаг; в этом ходе она не начиналась. Q4A и Q2A не стартовали.

Канонический заказ остаётся [CTO_EXPERIMENT_QUEUE_A.md](../../CTO_EXPERIMENT_QUEUE_A.md); эта запись фиксирует приёмку конкретного Q5A, не изменяет обязательства и не объявляет завершённой всю очередь A.

## Точная версия и подтверждения

| Материал | Exact commit / результат |
|---|---|
| Frozen production, `Q5A-NELA-ASSEMBLY-03` | `101343caa68579aacd5e6c01b94206680c364ab7` |
| QA base, `HEAD = origin/main` при независимых проверках | `0f032c21f555473aca7c61960a8c563d2440fc97` |
| [Technical QA](TECHNICAL_QA_ASSEMBLY03.md), `technical-qa-r4d-q5a-01` | **TECHNICAL_QA_PASS** |
| [Visual QA](VISUAL_QA_ASSEMBLY03.md), `visual-qa-r4d-q5a-01` | **VISUAL_QA_PASS** |
| [Asset Artist re-review](ARTIST_MOTION_REREVIEW_ASSEMBLY03.md) | **ARTIST_MOTION_PASS**, AM-A1 закрыт |
| [Concept Artist re-review](CONCEPT_MOTION_REREVIEW_ASSEMBLY03.md) | **CONCEPT_MOTION_PASS**, CM1 закрыт |

Production между frozen commit и QA base не менялся; при сохранении приёмки Lead также подтвердил production diff=none. Исторические CHANGES_REQUIRED, первая сборка и существенные corrections/evidence сохраняются без ретроспективного редактирования.

Принятые входы SHA-256:

- Construction v4: `7d06ea4636b49c718dad5e9d9f07000d09fa7e5cf105ec325abb84742bfdba26`.
- Art package attempt03: `a18bf91c3b00bd29a9246cb206d48d40c454a421136f7d88e5d35d52dc8013b0`.
- Art validation: `cc64f60aaa49fc2f9e9282130eef697402a752a346ecae1c79445a7d07066b1e`.

## Решение и принятое ограничение

CTO принимает оба независимых QA PASS и завершает текущие QA gates. Единственное визуальное замечание **VQ03-UI1** — слабый contrast служебного dark badge «Можно управлять» (в отчёте также отмечены вторичные подписи) — принято CTO как **non-blocking limitation без нового correction cycle**. Основные команды и персонаж читаются; это ограничение служебного оформления не отменяет обязательства показа самого персонажа. Отчёт Visual QA и его evidence остаются исходными, production ради записи приёмки не исправляется.

QA evidence: [Technical](output/technical-qa-assembly03/), [Visual](output/visual-qa-assembly03/). Техническая проверка включает исходные 15120 motion frames, 20618 framing assertions, дополнительные независимые сценарии, маски GPU, frozen/reproduced dist и archive01. Визуальная проверка включает обе обязательные последовательности, прерывания, полный jump, опору, whole-body 1×/2× и регрессии. Это результаты соответствующих специалистов; Lead не выдаёт их за заново выполненную им QA-программу.

## Известные границы результата

- Проверены Chrome и mobile emulation; физические мобильные устройства, другие browser engines и все GPU не проверены. Это не обещание широкой совместимости.
- PoC — один новый органический персонаж с собственными rig/motion и интерактивной демонстрацией, а не универсальная система подготовки/авторига или законченный игровой продукт.
- Проверены конечные наборы команд и кадров. Все возможные непрерывные последовательности не доказаны; строгое пересечение не охватывает все касания/коллинеарность.
- При 2× линия пола в верхней части полёта может выйти из кадра; весь персонаж остаётся доступен. Это следствие кадрирования принято художниками и QA.
- Старый вспомогательный `assembly/dist-smoke.js` относится к ASSEMBLY02. Актуальные доказательства ASSEMBLY03 находятся в QA/correction evidence; он не служит текущим smoke oracle.

## Передача на отдельный release

Кандидат готов для отдельной публикации Release Engineer в существующем Review по маршруту `/review/r4d/q5a-construction-first/`. Способ локального запуска и `dist/` описаны в [ASSEMBLY.md](ASSEMBLY.md). Публичная доступность ещё не подтверждена; этот acceptance commit её не создаёт. Не обновлять старые Q1–Q6 и их адреса. Следующую выдачу и переход по очереди определяет CTO; Q4A/Q2A этим документом не запускаются.
