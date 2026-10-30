# P5 Water + Dark — первый материальный checkpoint

2026-10-30 00:08:48 UTC. Около первого active hour после START. Работа продолжается. Фактическая выдача, первые completed actions и pins — в [DISPATCH.json](DISPATCH.json); подробные новые frozen/QA refs — в [CHECKPOINT_001.json](CHECKPOINT_001.json).

## Water: что реально получено

Новые собственные assets уже работают в настоящем Pixi/Millionko consumer. Frozen w01: source 41349b8d8ae61ceb69e288301af7c080e2b006b5, Artist 094301dda9a43e7b4970af9d9af20982a38fb221. 5 unique PNG / 7 instances: floor, ball/ball-shadow, pillar-03/04 с obstacle-shadows. URL http://localhost:55188/, producer PID 38664 / session 80589; FILE_INDEX 4851 bytes, SHA256 b65666c1c942d71763115f05744358ef45463f0fa528a4da0e9f0b8b3d912c4e. Lead проверил exact manifest/index bytes; оба QA независимо проверили frozen набор.

TQA b16653cfecc5ecd8f94cf41fbe2d5c0f353dba76: 40 actual browser snapshots совпали с собственным oracle по state/RNG/config/events. Проверены реальные UI pause/step/seek/replay/view toggles; сохранены все seed 0–3: LOST1326, LOST1196, IN_BUCKET receiver-02/1275, LOST589. Просмотрены actual motion и точные состояния pillar-03 front (585/586/587) и side (457/458/459). Нового дефекта в этом subset не найдено. Native не экспортировался и Jungle matrix не повторялась.

VQA a67aec7bfe2a3a95c127b6ede7a2f4a3c9637589: собственный actual Whole/Field, motion и контакты. Материалы/объём early floor/ball/pillar сочетаются, в Field читаются ball/object shadows, явных двойных предметов или отскока от пустого места в просмотренном subset не увидел. Два обычных новых броска сохранены без отбора: 2190599127 → LOST1496; 1370738139 → LOST1139.

Представительный paused frame TQA: E:/R4D/perspective/p5-runtime/technical-qa/transfer-water-dark/water/w01/screenshots/s0-t583-front-silhouette.png. Полные exact frames и hashes остаются в собственных QA runtime и pinned evidence indexes.

## Выявленное исправление и следующий набор

W01-V01: Field на seed 0/state 0 обрезает верх нового ball; Whole показывает весь ball. Builder воспроизвёл причину: Field minY270 против authored ball alpha top249.72811384258958. Framing-only successor w02 source f06ed5d7f87dc3e51323881d3ce8380ead65ea18 включает measured ball bounds на accepted drop в постоянный Field domain. Native/config/RNG не меняются; из 17 public files изменён только app.js. W01 сохранён.

W02 URL http://localhost:55190/, PID 17036 / session 64255; FILE_INDEX 4851 bytes/SHA256 1a8945190e064be5fedfaa80c30a1aa9f24db048d2bef407546c53246697cdcb. Lead проверил physical index; independent VQA closure отправлена, пока OPEN.

Art mini02 4395f6f2c7eff096e6da283f5f78fd45a4346aad уже передан Builder: 8 unique PNG / 14 texture IDs / 27 instances, все 7 pillars, frog-01 и 4 receiver back/front. Manifest 40316 bytes/SHA256 6948fdd7fccc60612183a2a8f9d6ce88f78ecd137931297c8fca556b3c19169a проверен Lead по physical bytes. Новая cup policy рассчитана из нового ball/receiver/Water projection (около −18.63…−18.67 source px), не взята числом из Jungle. Следующий freeze w03 и его actual art QA ещё впереди.

Arch-07 доступен native движению: seed 1, states 998–1031, внутренние касания event 1012/1018. Полного rendered gate пока нет: первая генерация имела широкие posts, edits частей изменили canvas и требуют регистрации. Actor сохраняет попытки и готовит ограниченный whole-gate baseline; незарегистрированные edits не выдаёт за selected. Foreground/long rails/raised plants остаются в работе.

**Full Water/P5 PASS=false.** W01 не проверяет отсутствующие 19 object groups, четыре receiver art и environment clips; behind hiding pillar-03, contact pillar-04 и будущий mask-specific bypass UNVERIFIED. Численные gate/receiver случаи не заменяют художественный проход.

## Dark и общий ввод

Оба accepted inputs закреплены на P1 4b47db04c7140ebf88f69b91faa0b790d46f22ec. Water 04/trial-02; исторический trial-01 FAIL не использовался. Dark 02/trial-01. Independent oracle 761e6087c902fe5ea941b90b5ce4d72383a0d755: полные run/replay seeds 0–3 совпали на обеих досках; Water 33 и Dark 28 case windows сохранены, common input blocker не найден. Dark outcomes: receiver-01/888, receiver-01/884, LOST1812, receiver-02/1269.

Dark diagnostic d00 работает на localhost:55187, PID 37032/session 18796, source 62c58d0c6a5a8c6c51d83084158c65721000b19e; это ещё не новый полный Dark art. Первый собственный generated Dark floor 2983206 bytes/SHA256 192c158305df1144af52df75fd150e832cfe5eeac70505380c2f2c320ee73908 сохранён и отклонён из selected: внизу остались front panels receivers. Нижняя зона исправляется, новый Dark набор и его независимый actual QA предстоят.

Исходный P5 sprite/parts/floor-clip способ сохранён. Опубликованного substantial variant нет; параметры новых assets, измерения и framing correction отделены от смены алгоритма. Accepted 2D collapse, отсутствие lintel/height physics и строгие center triggers сохраняются.

## Время, ресурсы и продолжение

После первого материала сохраняется общий ориентир 8–12 active hours на обе доски; около 1 active hour использовано, ориентировочно 7–11 остаётся. Входы/native больше не являются открытым blocker; основная неопределённость — регистрация gate parts, точные foreground contours и Dark art. Это guide, не автоматический cutoff; оценка обновляется после rendered gate и первого Dark mini.

Guard 00:00:36 UTC: C/D/E free 13.981/14.640/9.649 GiB, RAM free 10.083 GiB, CPU 5%, aggregate working set 27.377 GiB. Lead docs/git estimate RAM 0.25/E 0.01 GiB + allowance 4 GiB RAM/2 GiB E выдержаны. Роли выполняют собственные fresh guards до heavy; source/rejected/Jungle не удаляются, чужие процессы не трогаются.

Приоритеты: narrow VQA closure w02; w03 с receiver-02 actual approach/entry/front rim; gate07 whole baseline и parts с соседними exact states; foreground/rails/plants; новый Dark art и отдельные TQA/VQA; затем локальный пакет. Release пока idle. TokenGranted=false, Review/VPS writes 0; будущая публикация требует отдельного конкретного CTO token.

Операционная correction: Lead ошибочно назвал metadata sidecar public/index.json. Правильный .../w01/index.json лежит рядом с public, bytes/SHA совпали. Обоим QA передано уточнение; frozen файлы не менялись, product/packaging finding снят. Прежние denial/STOP границы действуют, обходы не выполнялись.
