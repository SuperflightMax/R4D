# Очередь A: фактическое состояние

Обновлено: **25 октября 2026 года**, Europe/Kyiv.

Канонический заказ: [CTO_EXPERIMENT_QUEUE_A.md](../CTO_EXPERIMENT_QUEUE_A.md). Этот файл ведёт CTO: здесь факты исполнения, ссылки и решения об остановке, без изменения обязательств заказа.

## Текущее выполнение

**Q2A_PUBLISHED_QUEUE_A_COMPLETE_IDLE.** Q5A принят и опубликован.
Q4A закрыт как отрицательный/частичный исследовательский результат; его viewer
опубликован десятой карточкой Review, полноценная анимация и художественный
PASS не заявляются. Более поздний прямой handoff Макса через Дот поручил
продолжить уже согласованную последовательную Queue A следующим пунктом Q2A.
Новая команда создана, самостоятельно выбрала метод и прошла отдельный CTO
production gate. Exact P1 `p1_candidate_c2_arms01` из commit `6d5c6b5…`
принят CTO с явно сохранёнными ограничениями. Full-motion frozen
`p2_candidate_c2` из commit `3c27b07…` принят CTO как завершённый PoC с
ограничениями после двух независимых QA PASS из `d81c4bd…`.
Подготовлен и локально проверен exact Review package: 18 публичных файлов,
1 179 499 байт. По последующему прямому delivery brief CTO exact пакет
опубликован одиннадцатой карточкой Review без пересборки или редактирования.
Новая коррекция не открыта; после выпуска Queue A — idle, без Q7,
новых проверок, найма или публикаций.
Актуальная граница — в [операционном состоянии проекта](PROJECT_STATE.md).

| Порядок | Опыт | Состояние | Материалы и показ |
|---|---|---|---|
| 1 | Q5A — конструкция до арта | Accepted by CTO; ASSEMBLY03 frozen `101343caa68579aacd5e6c01b94206680c364ab7`; опубликован в существующем Review; серверная доставка и auth-барьер подтверждены | [Открыть Q5A](https://superflight.space/review/r4d/q5a-construction-first/), [release record](../experiments/q5a-construction-first/RELEASE_ASSEMBLY03.md): `PUBLISHED_DELIVERY_VERIFIED_WITH_AUTH_LIMITATION`; post-auth public canvas не проверен, обычный вход SuperFlight сохранён |
| 2 | Q4A — цельный образ до частей | **RESEARCH_CLOSED_NEGATIVE_PARTIAL**; evidence viewer `negative-review-v02` принят CTO и опубликован из exact commit `47b637ba77681cc17ccf23757396073047430c37` | [Открыть Q4A](https://superflight.space/review/r4d/q4a-whole-character/), [приёмка](../experiments/q4a-whole-character/ACCEPTANCE_NEGATIVE_REVIEW_V02.md), [release record](../experiments/q4a-whole-character/RELEASE_NEGATIVE_REVIEW_V02.md); 26 сохранённых состояний, rejected отдельно; полного движения нет |
| 3 | Q2A — свободный выбор способа | **Q2A_PUBLISHED_QUEUE_A_COMPLETE_IDLE**; P2 C2 `3c27b07…` принят как завершённый PoC с ограничениями; exact package опубликован из `66baa7c80dbe55bf28746d4c2a36af6a1deca28d` | [Открыть Q2A](https://superflight.space/review/r4d/q2a-simple-character/), [приёмка](../experiments/q2a-simple-character/CTO_ACCEPTANCE_P2_C2.md), [release record](../experiments/q2a-simple-character/RELEASE_P2_C2.md); 18 exact файлов/1 179 499 байт; post-auth canvas не проверен |

Независимые review `attempt03` завершили уже существующие сессии:
Concept Artist `01a16ffd-87e7-7cf3-a9a2-29d2cd97a7ec` и Builder
`01a16ffd-8811-7d20-b80a-6a938f50b5a5`. Новые сотрудники или дубли сессий
не создавались.

Статический арт, исходные attempts, corrections и отрицательные review Q5A сохранены в истории. Art/motion gate assembly03 закрыт двумя независимыми художественными PASS. На QA base `0f032c21f555473aca7c61960a8c563d2440fc97` получены TECHNICAL_QA_PASS и VISUAL_QA_PASS для неизменного frozen production `101343c…`. CTO `cto-r4d-01` принял Q5A для PoC release без блокеров; слабый contrast служебного dark badge принят как non-blocking limitation без нового correction cycle. Формальная приёмка и известные Chrome/mobile emulation/PoC-ограничения сохранены в `CTO_ACCEPTANCE_ASSEMBLY03.md`. Production diff=none; приёмка и QA не менялись. На момент отдельной публикации Q5A Q4A/Q2A ещё не стартовали.

Первый release brief привёл к остановке **BLOCKED_BY_VPS_ACCESS_PROHIBITION** до внешних изменений; этот факт сохранён в [release record](../experiments/q5a-construction-first/RELEASE_ASSEMBLY03.md). Затем CTO передал прямое исправление и разрешение Макса на штатный VPS Review release. 25 октября 2026, 12:22:46 Europe/Kyiv, активирован immutable release `31ade6bb3109052c297e08013607ddd04eea866a`: все 26 Q5A dist-файлов точны относительно frozen/acceptance Git bytes, без пересборки. Все 333 прежних browser-файла кроме каталога сохранены побайтно; в каталоге только новая карточка и счётчик 8→9. Инвентаризация подтвердила оба первых модельных PoC и Q1–Q6 в Review; других готовых непоказанных результатов в этом объёме не найдено. Проверены локальные desktop/mobile exact bytes, все 360 файлов по HTTP, серверное дерево до/после и 39 публичных HTTPS/auth checks. Post-auth public canvas не проверен из-за отсутствия сессии; по прямому уточнению CTO личный Chrome не использовался, выпуск завершён с этим ограничением без отката.

После выпуска Макс отдельно подтвердил доверие handoff Dot; принесённое им
поручение продолжить Queue A стало достаточным основанием для старта Q4A.
Новая команда: Lead `01a17267-066d-7452-ad26-8741378ebfad`, Concept Artist
`01a17267-0692-7772-ae0b-929d7437dc7c`, Asset Artist
`01a17267-0689-7461-bfb7-2096d42cc29c`, Builder
`01a17267-0687-7d71-b468-b1ddf026321b`, Technical QA
`01a17267-0686-7503-8865-777443486168`, Visual QA
`01a17267-066f-75d0-8cce-7b5031fb671c`. Все — новые независимые сотрудники
Q4A, GPT-6.1 Sol / medium, local, cwd `D:\dev\R4D`.

25 октября 2026, 19:01:34 Europe/Kyiv, Release Engineer активировал immutable Review release `47b637ba77681cc17ccf23757396073047430c37`. Все 36 route-tree файлов `negative-review-v02` совпали с accepted Git objects; 35 записей build manifest, source manifest и snapshot сверены, viewer не пересобирался и не редактировался. Из прежних 360 browser-файлов 359 сохранены побайтно; только в каталоге добавлена честная карточка Q4A и счётчик 9→10. Проверены 396 файлов по локальному HTTP, серверное дерево до/после, desktop1440×1000/mobile390×844 controls/play-stop-low25/rejected/light-dark; внешних запросов/errors/overflow нет. Обычная публичная авторизация и защитные headers сохранены. Post-auth canvas не проверен, личный Chrome не использован — это явно разрешённое CTO ограничение доставки, не новый QA PASS. Подробности, hashes и rollback — в [release record](../experiments/q4a-whole-character/RELEASE_NEGATIVE_REVIEW_V02.md). Q2A и дальнейшие corrections не запускались; после выпуска R4D idle.

После выпуска получен более поздний прямой handoff Макса через Дот продолжить
каноническую Queue A пунктом Q2A. Staff Director выдал новую независимую
команду: Lead `01a173ea-2ed7-75e1-aaf9-c7bfe2452662`, Concept Artist
`01a173ea-2ea3-79d2-b464-30aead2ea96f`, Asset Artist
`01a173ea-2ed0-7e23-b4f3-b240f83957df`, Builder
`01a173ea-2ed4-72f2-aebc-7682fbedf2de`, Technical QA
`01a173ea-2ed3-7350-b592-8cf8f5d379c1`, Visual QA
`01a173ea-2ed6-76b3-b544-30af5042acaf`. Все — `gpt-6.1-sol` / medium,
local, cwd `D:\dev\R4D`, без worktree и истории прежних команд. Lead получил
preparation brief: совместно с Concept/Asset/Builder выбрать метод и подготовить
один production plan. QA остаются ready; производство и публикация не открыты.

Команда сохранила единый `PREPARATION_PLAN.md` в commit
`b0f586d6a256ae3ef0c84e0e86727d07716e9ef8`; Concept, Asset и Builder отдельно
подтвердили точность сведённого текста. CTO принял route без существенных
замечаний и открыл только P1_FIRST_SLICE. Production brief передан существующему
Lead: до чистового арта согласовать образ/части/скрытые зоны и диапазон, затем
создать новый цельный растровый комплект и runnable idle↔low slice, провести
личные motion reviews художников и вернуть frozen P1 на следующий gate.
Technical/Visual QA и release пока не открыты.

CTO лично проверил exact frozen P1 на светлом/тёмном фоне, в idle, 50/75% и
глубоком low, включая изолированную ближнюю ногу. Остаточные колено, ткань,
плечо и ограниченная видимость дальней опоры записаны в
`CTO_P1_DECISION.md`. Отдельная слепая коррекция колена не назначена: две
проверенные геометрические гипотезы дали регресс, а новой установленной причины
до walk/jump нет. P1 принят как содержательный срез, и существующему Lead
открыт P2_FULL_MOTION. Независимые QA и release по-прежнему закрыты до
следующего gate; готовый принятый Q2A должен быть опубликован в Review по
прямому разрешению Макса.

25 октября 2026, 22:51:58 Europe/Kyiv, Release Engineer выполнил прямой Q2A delivery brief: активирован immutable root `/srv/superflight-review/releases/66baa7c80dbe55bf28746d4c2a36af6a1deca28d`. Фактическая прежняя live-основа Q4A содержала 396 browser-файлов; 395 сохранены побайтно, в каталоге только новая карточка и счётчик 10→11. Добавлены 18 exact файлов принятого package (public tree `e2e60f6d3b714ef0d0409f1de36f6a870ac17bc8`); всего414 файлов/42270006 bytes. Package/production diff=none. Серверные paths/hash/size/права/no-symlinks сверены до/после, все414 файлов совпали по локальному HTTP; desktop1440×1000/mobile390×844 controls/обе последовательности/flight targets/pause/history/light-dark прошли без errors/failed/external/overflow. Обычная публичная auth-граница сохранена; post-auth canvas не проверен, личный Chrome не использовался по brief. Полные hashes, ограничения и свежий rollback — в [RELEASE_P2_C2.md](../experiments/q2a-simple-character/RELEASE_P2_C2.md). После выпуска **Q2A_PUBLISHED_QUEUE_A_COMPLETE_IDLE**; Q7, corrections, новые проверки/публикации/найм не запускаются.

CTO по ходу заменяет сведения фактическим состоянием: активный опыт, команда, ссылки на материалы/демо, полученное качество и решение о продолжении или остановке. Появление каталога само по себе не означает начала или завершения опыта. Новый отдельный статусный сервис не требуется.

## Итог очереди

Все три результата Queue A опубликованы; отдельный сравнительный вывод CTO
этим delivery не создавался. Q5A принят и опубликован,
Q4A закрыт negative/partial и опубликован как evidence viewer; Q2A принят CTO
как завершённый PoC с ограничениями. Оба независимых QA дали PASS без
блокеров в проверенном объёме. CTO принял дополнительные 49,201185° при
toe-contact и 61,257567° свободной стопы, особенности колена/шорт/плеча и
агентскую границу; художественное совершенство и универсальность не заявлены.
Новая correction-итерация не открыта: нет нового доказанного адресного
механизма, прежние слепые попытки регрессировали.

Существующая команда подготовила browser-safe пакет для
`/review/r4d/q2a-simple-character/`, 18 файлов и 1 179 499 байт.
SHA256 provenance: `61691306ebe4adb5c043dd0abfc4ceebb333f9984f4032c1692d8cba85aafca5`.
Независимый локальный package-QA прошёл; source snapshot не изменён,
частные материалы вне публичного дерева. Отдельный CTO delivery brief
выполнен: Q2A опубликован и проверен в указанных release record границах.
**Q2A_PUBLISHED_QUEUE_A_COMPLETE_IDLE.** Материалы Q1–Q6, Q5A, frozen Q4A
и принятый Q2A сохранены; новые задачи не запускаются.
