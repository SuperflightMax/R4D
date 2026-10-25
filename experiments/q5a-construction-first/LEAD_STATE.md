# Q5A: рабочее состояние Lead

25 октября 2026 года, Europe/Kyiv. Lead: `lead-r4d-q5a-01`.
Заказчик: CTO `cto-r4d-01`, thread `01a1653d-1c24-7991-a16b-619bc964ca40`.

Канонический заказ: [CTO_EXPERIMENT_QUEUE_A.md](../../CTO_EXPERIMENT_QUEUE_A.md), base `93194c5cab8a7be0913faa0ffa57dcc7ca9ae7a6`. Отдельный production brief CTO получен в этой сессии после onboarding. Его текущая граница — локальный Q5A candidate; внешняя публикация требует отдельного release-шага CTO. Q4A и Q2A не запускать.

## Текущее положение

**ASSEMBLY_FROZEN — AWAITING_INDEPENDENT_PERSONAL_ARTIST_MOTION_REVIEW.** Кандидат `Q5A-NELA-ASSEMBLY-02` подготовлен Builder и проверен Lead для отдельной фиксации в Git. База этого хода: `HEAD = origin/main = a7e11f8e02d9ac552caff52dcae206d8a5f95489`. Прочитаны [ASSEMBLY.md](ASSEMBLY.md) и [SELF_CHECK.md](SELF_CHECK.md). Исправления реализации Lead не выполнял, расхождений при воспроизведении не найдено. Это заморозка кандидата, **не художественный PASS движения и не независимый QA PASS**.

Три принятых SHA конструкции v4/package/validation из таблицы ниже неизменны; отдельно сверены 15 исходных текстур, 15 производных RGB, обе authored hand alpha и rig-data. Первая реальная сборка `assembly/attempts/01/` сохранена, все **30/30** файлов из snapshot совпали по SHA. Её известные дефекты и последующие существенные коррекции описаны в `assembly/attempts/01/ATTEMPT.md` и ASSEMBLY.md; архив не ремонтировался.

Из `D:\dev\R4D\experiments\q5a-construction-first` Lead лично выполнил:

- `npm test` — exit 0 / PASS: 19 static fixtures, 14 сценариев, 15120 кадров, 0 инверсий и строгих самопересечений; max coordinate error `1.1368683772161603e-13`, max bone error `8.526512829121202e-14`, изменение позы/скорости при команде 0, airborne target isolation PASS. Полный JSON совпал с сохранённым `output/self-check-tests.json`.
- `npm run build` — exit 0 / PASS, все **25/25** dist-файлов совпали побайтно с результатом Builder до повторной сборки.
- HTTP smoke `dist/` на отдельном временном localhost-порту — **25/25** файлов доступны по base route, HTTP 200, точные байты, правильный JS/PNG MIME; входная страница совпала. Временный сервер остановлен. Браузерный/художественный просмотр этим smoke не выполнялся; сохранённые browser/GPU evidence принадлежат self-check Builder.

Фиксируются viewer/новый runtime, assets, исходники проверок и сборки, dist, полезные отчёты/скриншоты output, первая сборка и два файла состояния. Ephemeral `experiments/q5a-construction-first/.playwright-cli/**`, корневая `.playwright-cli/**`, чужие work-файлы, caches и dependencies в commit не включаются. Technical/Visual QA, независимый личный artist motion review, release, Q4A/Q2A в этом ходе не запускаются. Динамическая коррекция скрытой ткани, быстрые махи рук, свет сильных сгибов и контакт во времени требуют независимого просмотра существующими Asset Artist и Concept Artist по следующему поручению CTO.

## Пройденный статический art gate

**ART_GATE_PASSED — STATIC_CANDIDATE_READY_FOR_ASSEMBLY.** После хронологической коррекции CTO поручил закрыть только art gate. Исходная база этого хода: `HEAD = origin/main = 03644152f985ecf225c06ae748100534fbe106ab`. Работа Queue A разрешена; существующая команда сохраняется, Q4A/Q2A не начаты.

Принят статический арт Нэлы `art/attempts/03/` на конструкции v4. Три точных SHA-256 независимо сверены Lead:

| Вход | SHA-256 |
|---|---|
| `construction/construction.json`, v4 | `7d06ea4636b49c718dad5e9d9f07000d09fa7e5cf105ec325abb84742bfdba26` |
| `art/package.json` | `a18bf91c3b00bd29a9246cb206d48d40c454a421136f7d88e5d35d52dc8013b0` |
| `art/validation.json` | `cc64f60aaa49fc2f9e9282130eef697402a752a346ecae1c79445a7d07066b1e` |

Оба независимых заключения получены для этой версии:

- [ART_CONCEPT_REREVIEW_ATTEMPT03.md](ART_CONCEPT_REREVIEW_ATTEMPT03.md) — `ART_CONCEPT_PASS`, AR1–AR3 закрыты для показанных статических поз.
- [ART_BUILDER_REREVIEW_ATTEMPT03.md](ART_BUILDER_REREVIEW_ATTEMPT03.md) — `ART_INTEGRATION_PASS`, статические блокеры B1/B2 не воспроизводятся.

Root package/validation побайтно совпадают с `art/attempts/03/candidate-package.json` и `candidate-validation.json`. Проверены SHA всех 15 текстур, 84 outputs, 7 evidence, четырёх генераторных источников и скриптов воспроизведения. Для интеграции обязательны **обе отдельные `silhouette_alpha_file` кистей**: загрузка только RGB или геометрической оболочки не воспроизводит принятый кандидат. Сохраняются общая source-регистрация, pivots, explicit UV/triangles и 16 draw operations.

Цепочка сохранена: v2 — gate commit `d3bdf8f1cffebe2179805eeb54a8a36faab08805`; attempt01/02 и отрицательные художественный/Builder reviews остаются доступными. B1/B2 привели к v3, блокер R1 — к v4 с отдельными `ART_V4_PASS` и `CONCEPT_V4_PASS`, затем выполнен attempt03. Архив v1: **9/9**, архив v3: **13/13** файлов совпали с manifest. Хеши прежних технических PNG v3 **60/60**, v4 **63/63** совпали. Прежние root package/validation и ART.md сохранены в `art/attempts/02/`; отвергнутый плоский вариант кожи — в `art/attempts/03/iterations/flat-fold-light/`. Источники, prompts, processing scripts и correction log сохранены; неудачи не заменены финальным результатом.

Повторные проверки Lead из `D:\dev\R4D`, без writer-режимов и pyc:

```powershell
python -B experiments/q5a-construction-first/construction/build_package.py --check
python -B experiments/q5a-construction-first/art/attempts/03/prepare_attempt03.py --check
python -B experiments/q5a-construction-first/art/attempts/03/validate_attempt03.py
```

Результаты: construction — PASS, 19 поз/15 поверхностей; reproduction — PASS, 86 файлов побайтно; validation — PASS, 76 hand/scale случаев, 162 защищённых файла. В проверенной статике 0 инверсий и строгих самопересечений; 28 предусмотренных нулевых fold-граней учитываются отдельно. Цветовые пробы запястий — 0, тканевые — максимум 0.718740/255; это локальные пробы, не доказательство идеальной живописи.

Обычный staged `git diff --check` до защиты байтов отметил `new blank line at EOF` в `ART_BUILDER_REREVIEW_ATTEMPT03.md:176` и защищённом `art/attempts/02/ART-attempt02.md:148`. Эти существующие документы не редактируются ради форматирования. После сохранения исходных CRLF повторная staged-проверка с `core.whitespace=cr-at-eol,-blank-at-eof` проходит: CR признаётся частью окончания строки, конечные пустые строки сохраняются ради идентичности evidence; остальные пробельные правила сохранены.

Проверка staged blobs выявила нормализацию CRLF→LF у части хешируемых JSON/документов. Добавлен только локальный `experiments/q5a-construction-first/.gitattributes` с `* -text`, чтобы Git сохранял байты артефактов и архивов при commit/checkout. Исходные файлы не нормализуются и не пересоздаются; после повторного staging содержимое всех Q5A blobs сверяется побайтно с проверенными рабочими файлами. Настройки остальных каталогов не меняются.

**Motion/demo, product assembly, Technical QA и Visual QA ещё не начаты.** Статический PASS не подтверждает вес, контакты во времени, промежуточные кадры, прерывания и выбор наземной цели в полёте. Свет и складки в сильном сжатии приняты художником для показанных поз; их поведение во времени требует последующего просмотра собранного движения.

## Сохранённый construction gate v2

Ниже сохранено описание состояния при фиксации v2; его формулировки «текущий» и «арт ещё не создан» относятся к тому моменту. Актуальная версия и пройденный art gate указаны выше.

**CONSTRUCTION_GATE_PASSED.** По отдельному поручению CTO Lead проверил и фиксирует конструкцию до первого чистового арта. Образ — Нэла, взрослая полевая ботаник с открытой живой анатомией, бирюзовым топом и терракотовыми шортами; [DESIGN.md](DESIGN.md) имеет статус `DESIGN_APPROVED_FOR_CONSTRUCTION`. Конструкцию изготовил Builder, замечания первой версии разобраны и исправлены в v2. Предыдущая запись об ожидании межчатовой переписки больше не описывает фактическое состояние работ. В этом интеграционном ходе межчатовых сообщений нет.

Текущий [construction/construction.json](construction/construction.json) имеет SHA-256 `70f324aa7126f7aea0eca24e42aa370b18bb48d070810f3819a5cab16116e092`: 15 материалов, 19 статических поз. Экранный рост 390 px, viewport 960×640, диагностика ×2. [CONSTRUCTION.md](CONSTRUCTION.md) содержит конструкцию, контракт исходников и причины коррекций.

Первая неудачная конструкция сохранена побайтно в [construction/attempts/v1/manifest.json](construction/attempts/v1/manifest.json), статус `REJECTED_CHANGES_REQUIRED`, JSON SHA-256 `55a78cbc0fe856eeac2fb899dcd160bdcd44c41b5a57822574a1cd49947fb965`. Lead независимо подтвердил размеры и хеши всех **9/9** файлов архива; исходные отрицательные отзывы сохранены.

Два самостоятельных положительных заключения относятся к точной v2 выше:

- [CONSTRUCTION_ART_REREVIEW_V2.md](CONSTRUCTION_ART_REREVIEW_V2.md): `ART_CONSTRUCTION_PASS`; A1/A2 исправлены, A3 принят как контракт изготовления растра.
- [CONSTRUCTION_CONCEPT_REREVIEW_V2.md](CONSTRUCTION_CONCEPT_REREVIEW_V2.md): `CONCEPT_CONSTRUCTION_PASS`; C1/C2 устранены, образ и обязательный диапазон сохранены.

Lead выполнил обе команды из корня `D:\dev\R4D`, обе завершились exit 0 / `PASS` в режиме read-only:

```powershell
python experiments/q5a-construction-first/construction/build_package.py --check
python experiments/q5a-construction-first/construction/attempts/v1/build_package.py --check
```

Проверена воспроизводимость v2 (19 поз) и v1 (17 поз), включая архив и коррекции A1/A2/A3/C2. Чистовой арт ещё не создан; статические технические схемы не являются финальным растром или доказательством качества движения. Острота складки, фильтрация, свет на шортах и непрерывность движения остаются предметами будущей проверки арта и сборки. Общий Q5A ещё не принят.

## Команда и первоначальная декомпозиция

- Concept Artist `concept-artist-r4d-q5a-01`, thread `01a16ffd-87e7-7cf3-a9a2-29d2cd97a7ec`: вместе с Asset Artist и Builder выбрать новый органический живой образ до конструкции. Вести `DESIGN.md`: характер, пропорции, одежда, силуэт, видимые плечи/бедра/локти/колени, связь дизайна с обязательными движениями. Сначала получить предложения и замечания коллег; зафиксировать согласованный образ. Позже лично посмотреть собранное движение и записать художественный вывод. До фиксации конструкции чистовой арт запрещён.
- Asset Artist `asset-artist-r4d-q5a-01`, thread `01a16ffd-8810-7bd2-a3d0-6fee241915c2`: сейчас оценить реализуемость образа совместно с Concept Artist и Builder. Подготовить `ART_CONSTRAINTS.md`: художественное устройство стыков, скрытые поверхности, согласование материала и контура, состав графических деталей, риски генерации и способы коррекции. Не генерировать чистовой арт до явного сообщения Lead о сохранённой конструкции. После этого изготовить новый сгенерированный растр под конструкцию; сохранять источники, существенные условия и исправления.
- Builder `builder-r4d-q5a-01`, thread `01a16ffd-8811-7d20-b80a-6a938f50b5a5`: сейчас вместе с художниками подготовить `CONSTRUCTION.md` и достаточные данные/схему конструкции только после согласования образа: сочленения, геометрия частей, overlaps, скрытые зоны, pivots, слои и рабочие диапазоны для idle, настоящего crouch, walk и полного jump. Не брать прежние rig/motion/кандидатов. Пока не начинать финальную сборку; техническая схема/dummy допустимы. Зафиксировать подтверждения обоих художников. Затем передать Lead пути для фиксации этапа в Git.
- Technical QA `technical-qa-r4d-q5a-01`, thread `01a16ffd-880d-7df1-bd91-df9a9f56e9b6`: подключить после self-check на конкретном commit; сейчас поручение не выдано.
- Visual QA `visual-qa-r4d-q5a-01`, thread `01a16ffd-8810-75a0-b035-b268ab2eb476`: подключить после self-check на конкретном commit; сейчас поручение не выдано.

Все рабочие документы — внутри нового каталога Q5A, на русском. Каждый пишет только назначенные ему файлы; Lead ведёт этот файл и progress state. Стандартные библиотеки и нейтральная review-обвязка допустимы, прежние персонажи, арт, rig, motion и готовая сборка — нет. Новых сотрудников, чатов, subagents, worktree и инфраструктуры не создавать. Существующие 39 dirty/untracked путей сохранять. Исторические опыты не менять. Commit/staging координирует Lead только по явно принадлежащим Q5A путям.

Поручения ссылаются также на `roles/COMMON.md`, соответствующие `roles/<role>.md` и три полностью прочитанных исследования в `docs/research/2d-raster-preparation/`; рекомендации не заменяют заказ и не вводят лимит итераций. Робот, диски и броня ради сокрытия дефекта не допускаются; осмысленные слои, скрытые продолжения и деформация допустимы. Обязательный диапазон движений не сокращать ради арта.

## Следующий шаг

Ожидается независимый личный просмотр движения `Q5A-NELA-ASSEMBLY-02` существующими Asset Artist и Concept Artist на замороженной версии после отдельной выдачи CTO. Этот ход ограничен проверками, обновлением состояния и отдельным commit/push assembly; поручения на review/QA и внешнюю публикацию не выдаются. Внешняя публикация остаётся отдельным release-шагом после CTO acceptance. Все существенные attempts/corrections сохранять; последующие художественный просмотр и обе QA-проверки должны относиться к собранному поведению и известной версии. Окончательную приёмку и решение об остановке принимает CTO.
