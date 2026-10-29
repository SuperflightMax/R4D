# Water w01 — независимая scoped Visual QA

30 октября 2026, Europe/Kyiv. **Ранний набор содержательно просмотрен в actual Pixi/native consumer. Рекомендация — продолжать следующий mini; один открытый небольшой дефект W01-V01. Полный художественный PASS и успешный перенос Water не присваиваются.**

## Проверенный кандидат

Consumer `41349b8d8ae61ceb69e288301af7c080e2b006b5`, Artist `094301dda9a43e7b4970af9d9af20982a38fb221`. FILE_INDEX: 4851 bytes/SHA256 `b65666c1c942d71763115f05744358ef45463f0fa528a4da0e9f0b8b3d912c4e`. Все 17 перечисленных physical public files / 6771984 bytes самостоятельно сверены по размерам и SHA256; staged manifest 10228 bytes/SHA256 `bf468e44bf8bacbab8d810a1a86a57228515abc2c665397b45e8b2ea80313fe2`. UI показал соответствующие P1/Artist/native pins. Старые большие аудиты и экспорт ядра не повторялись.

Actual URL — `http://localhost:55188/`, root `E:/R4D/perspective/p5-runtime/builder/transfer-water-dark/water/output/previews/w01/public`. Перед входом listener PID38664 сопоставлен с node preview.mjs и этим root/портом. Producer process/server не менялся.

**Уточнение передачи.** Первоначальный локальный read `public/index.json` дал FileNotFoundError: Lead ошибочно указал расположение. Matching sidecar найден в `w01/index.json`, ВНЕ public: 12125 bytes/SHA256 `6b30fdf4f76d665c8d9aeb2c9d9b6d9e0398da3caa2326fa462a8ca37e7d4ce1`. Затем Lead подтвердил исправление handoff. Наблюдение и причина сохранены в `handoff-events.jsonl`; это не consumer/native/packaging defect. VQA не делала HTTP GET /index.json и не меняла frozen files.

Scope: **5 новых PNG / 7 instances** — floor, ball/ball-shadow, pillar-03/04 с obstacle-shadows. Остальные 19 object groups, четыре receivers и environment clips отсутствуют по объявленному scope. Принятый Water board04/trial-02 остаётся из [подготовки](PREPARATION.md); geometry/start/r16/core не корректировались.

## Фактический просмотр

Собственная hidden IAB вкладка, штатные Whole/Field, без zoom/viewport override. Оригинальные JPEG 1265×712 сохранены без crop/reencode; CSS/DPR отдельно не измерялись, пиксельный tolerance не заявляется. Для paused screenshots native UI state до/после совпал. Realtime кадры ограничены AX состояниями до/после и не объявляются точным snapshot одного физического тика или проверкой частоты кадров.

| Случай | Реально просмотрено | Наблюдение в данном scope |
| --- | --- | --- |
| Старт seed0 | state0 Whole/Field, Geometry; state100 Field | W01-V01; позднее шар целиком в кадре |
| pillar-03, передняя грань | seed0 states584/585/586; state586 Geometry и Whole | Контакт читается у переднего основания; явного отскока от пустого места не увидел |
| pillar-03, боковая грань | seed2 states456/457/458 и 538/539/540 | Шар остаётся видимым около бокового основания, явного провала над открытым полом не увидел |
| Actual realtime | seed0 AX620–653 / image readout633; seed2 AX499–530 / image510; новый seed1370738139 AX56–89 / image69 | Просмотрены короткие moving фрагменты; непрерывная видеозапись не выполнялась |
| Art/Geometry | seed2/state458; seed0/state586; Whole/Field на state0/586 | В этих paused случаях native state/RNG сохранились; Art off показал реальную диагностическую геометрию |
| pillar-04 | Статический вид и совместимость в Whole/Field | Отдельного контакта в полученных selected TQA windows нет; contact/occlusion UNVERIFIED |

Окна контактов выбраны из уже переданного TQA handoff, но описанные визуальные наблюдения сделаны самостоятельно. Номера collision event t соответствуют UI state t+1; изменение скорости/RNG видно на 586, 458 и 540. Числа не заменяли просмотр кадров. Частичное hide/reveal за pillar этими передними/боковыми окнами не установлено и остаётся UNVERIFIED.

![Pillar-03: фактический seed0/state586, Field, арт без контуров](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w01/07-seed0-t586-pillar03-front-field.jpg)

## Художественный вывод по раннему набору

Зелёный камень, светлые основания и вставки pillar сочетаются с новым floor. Верхние/боковые грани дают объём; шар имеет читаемый светлый объём и отличается от пола. В Field видны мягкая тень шара и затемнение у оснований, которые дают опору. Явных двойных предметов, лишнего shadow следа или сильного расхождения резкости в этих кадрах не увидел. Whole заметно уменьшает детали теней; согласованность полного набора света и всех падающих теней этим subset не подтверждена.

Пол в actual consumer узнаваем как Water; размещение двух опор выглядит согласованным с их ground footprints. Это локальная оценка регистрации, а не PASS всех контуров floor или будущих воротец/чаш. По этому проходу новая регенерация floor/ball/pillar не обоснована; полезнее добавить следующие части и проверить W01-V01.

## W01-V01 — Field подрезает верх стартового шара

**Наблюдаемый небольшой visual/framing defect.** При seed0/state0 в Whole шар виден целиком; в Field небольшая верхняя часть силуэта выходит за верхнюю рамку. На яркой воде начало шара менее ясно читается. На state100 весь шар уже входит в Field. Полное исчезновение шара или дефект native движения этим случаем не заявляются.

Repro: seed0 → Повтор → pause/state0 → Whole → Field при Art on/Geometry off. State/RNG остаются теми же. Evidence 01/02/10/11; ниже exact Whole и Field. Изменение размера картинок при просмотре документа не является частью QA.

![Whole: seed0/state0, полный стартовый шар](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w01/11-seed0-t0-whole-return.jpg)

![Field: seed0/state0, верхний край шара подрезан](E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w01/02-seed0-t0-field.jpg)

**Гипотеза причины.** Field framing опирается на geometry domain; новый bitmap sphere поднимается над ground anchor и его верхний силуэт не полностью учтён. Debug сообщает minY270 и пустые importantPartsSourcePx. Предложение для следующего mini — учитывать нужный visual envelope шарика при framing. Это не разрешение менять physical radius/start/projection. Исправление не выполнялось и не проверено.

## Запуски и ограничения

| Seed | Происхождение | Самостоятельно наблюдавшийся terminal |
| --- | --- | --- |
| 0 | Default/replay | LOST1326 |
| 2 | Replay переданного native case | IN_BUCKET receiver-02/state1275 |
| 2190599127 | Первый обычный «Новый бросок» | LOST1496; screenshot захвачен уже на terminal |
| 1370738139 | Второй обычный «Новый бросок» | LOST1139; сохранён также moving кадр |

Новые seeds не отбирались по красоте/исходу, LOST не отброшены. Вход seed2 подтверждает только actual native outcome: receiver art отсутствует, поэтому сфера на воде в terminal не считается художественным входом в чашу или новым cup-anchor defect. Поздний physical state после1275 не выдумывался. Новых native oracle/trace export не выполнялось.

Arch-07 остаётся diagnostic geometry; gate/support/lintel/opening art, все receiver front rims, длинные rails и foreground hide/reveal **UNVERIFIED**. Известное отсутствие не раздувалось в матрицу дефектов. Наблюдавшийся W01-V01 отделён от отсутствующего арта и от гипотезы причины. Dark в этом проходе не проверялся. Jungle и его прежние ограничения сохранены.

## Evidence и завершение прохода

[EVIDENCE_W01.json](EVIDENCE_W01.json): 53380 bytes/SHA256 **`eda3ef1a182bdd364c974c7c72ecc6e6a05ebe046ffda5571cc178387e20909b`**. Индекс связывает 81 own runtime file / 3165737 bytes, включая 24 оригинальных JPEG, before/after AX, frozen input metadata, guards и handoff clarification. Runtime: `E:/R4D/perspective/p5-runtime/visual-qa/transfer-water-dark/water/w01/`.

Старт на своей чистой ветке/HEAD `0b46ef5d8efd34b224cf0ad42e17bf50a800e442`. Guard перед браузером: free RAM10.662 GiB, CPU0%, aggregate CPU5.042%, working set/private26.808/27.744 GiB; C/D/E free14.547/14.648/9.691 GiB. Оценка пика1 GiB RAM /0.05 GiB E при резерве4/2 GiB. Повторный snapshot23:53:31Z: free RAM10.483 GiB, CPU3%, aggregate CPU13.75%, working set/private27.201/28.032 GiB; C/D/E14.015/14.640/9.672 GiB. Фактический собственный memory peak не инструментирован.

Собственная вкладка закрыта, producer server не остановлен. Product/art/config не менялись; новых серверов, server writes и release token нет. Следующий шаг — scoped просмотр следующего mini с исправлением W01-V01 и новым supported art; повтор полного prep/native oracle сейчас не нужен.
