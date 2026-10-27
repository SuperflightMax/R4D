# P2 candidate-02 — независимая техническая проверка

28 октября 2026, Europe/Kyiv. Автор: `technical-qa-r4d-p2-free-01`.

**Ограниченный offline-вывод:** состав, закреплённые входы и исполнение compiled controller проверены. **Полного Technical QA PASS, UI/Pixi/scene PASS нет.** Найдено замечание к build-сканеру; доступ к реальному HTTP(S) просмотру остаётся отдельным ограничением. Frozen artifact не изменялся и не пересобирался; разрешение публикации этим отчётом не выдаётся.

## Проверенная версия

- Candidate: `p2-jungle-static-candidate-02`.
- Source: `5f40f6692dc5e7238afc961a2e0afa826cdefc9b`; адресная передача Builder `314c1c82f12f33a19550129a2f508da7dcab27bf` использована как указатель, не как независимое доказательство.
- Artifact: `E:\R4D\perspective\p2-runtime\output\p2-jungle-static-candidate-02`; browser tree — `bundle/review/r4d/p2-free-approach`.
- `BUILD_MANIFEST.json` SHA-256: `6cf78e7b64625828929cd5905afe033570579f8e2950c103c757d53016a49aa0`.
- Фактически сверены **15 файлов / 2 448 166 bytes**, полное множество без дополнительных файлов и symlink, каждый размер и SHA-256.
- Tree SHA-256: `5bc6fd3b7f99e20fe98e3f98d972371538beee767abebc905fa595af55205b4d`, правило `SHA256(JSON.stringify(sorted per-file records)+LF)`.

Собственный runner: [candidate-02-offline.mjs](candidate-02-offline.mjs). Собственные данные: `E:\R4D\perspective\p2-runtime\output\technical-qa\candidate-02-offline-01\EVIDENCE.json`, 181105 bytes, SHA-256 `67f871ade76fa912ae5cfd41ab8199eb8cb64f188e6c684b6cbdaf15007374c6`. Время записи `2026-10-27T23:42:57.527Z` (28 октября по местному времени). Там сохранены все seed, полные условия/descriptor с конечным состоянием, события, номера проверенных тиков, хеши траекторий и проверки сканера.

## Что подтверждено непосредственно

**Source/build/provenance.** Шесть копируемых текстовых файлов, включая HTML, CSS, main/controller и view-math, сверены с exact source через `git show`; config дополнительно совпал с Git-объектом принятого P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec` побайтно. Config SHA-256 `dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db`. Frozen `inputs/manifest.json` отличается от принятого manifest только заменой локального source JPG path на относительный URL; все матрицы, domains и прочие поля сохранены. Projection JSON на P1 имеет SHA-256 `9ca9e520f1927426a3a5ba73a5eacaf90fedffc9385e7d08d5b1e6ee644b020c`; raw projection JSON в browser tree не требуется — приложение использует численно совпадающие матрицы manifest. Прямое преобразование сопоставлено с research H и переносом `(33256,34072)`; максимальная ошибка обратного преобразования `7.28e-12` native units при заранее выбранном допуске `1e-7`.

JPG SHA-256 `c8f9e4245c1de8c2086e615bc75dc10aea59b76b614d6e106593e07262e24f72`. Ball/shadow PNG совпали с exact source packet и его хешами; их параметры и четыре occluder совпали со source manifest. Pixi 8.22.0 совпал с доступным установленным пакетом после объявленного удаления sourceMappingURL; MIT license совпала побайтно и присутствует в tree.

**Core.** Compiled SHA-256 `dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7`. Read-only native checkout имеет HEAD `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, tree пакета `008d16a80a26bb77d562a45218b01da09b0d9ff0`, чистую область пакета; все 26 source-файлов сопоставлены с Git-объектами с нормализацией CRLF→LF. Native reference исполнялся только в памяти средствами Node 24; private TS и карты не копировались. Сборка не воспроизводилась: связь compiled runtime с pinned core подкреплена build recipe/receipt и описанным ниже дифференциальным исполнением, не заявлена как доказательство эквивалентности для любых входов.

**Статические зависимости.** 14 HTML/module/importmap/resource/art/source-metadata ссылок разрешились в существующие route-relative файлы внутри `/review/r4d/p2-free-approach/`. Модули разобраны штатным ES-module parser, а не поиском слова `from`. У собственного app-кода один `fetch(url)` без options: четыре JSON загружаются GET; обязательные POST/API, внешние/root-absolute зависимости не найдены. CSS также не содержит внешней загрузки. Save по коду формирует Blob JSON и download link; это ещё не проверка браузерного скачивания. В tree не найдены private TS/maps, source-map directives, private source references и проверенные формы локальных путей; содержимое повторно захешировано после исполнения.

## Новое исполнение замороженного compiled runtime

Использованы заранее выбранные seed `1,2,3` и три последовательных вызова frozen `randomSeed()` в Node. Ни один результат не отброшен; пользовательская кнопка random здесь не нажималась. На каждом тике состояния compiled controller строго сравнивались с новым штатным native session на той же конфигурации и seed: включая pos/vel, rngU32, nearMiss, done/result. События также совпали после удаления только добавленного controller поля `observedAtTick`.

| Seed | Последний тик | Контактов | Исход |
| --- | ---: | ---: | --- |
| 1 | 1735 | 14 | LOST |
| 2 | 1290 | 11 | LOST |
| 3 | 2887 | 30 | LOST |
| 490822599 | 2172 | 25 | LOST |
| 1350697865 | 2201 | 20 | LOST |
| 4250859101 | 796 | 6 | LOST |

Всего сопоставлены **11 087 состояний**, включая начальные. Все шесть траекторий различаются. Полный повтор из сохранённых descriptor, продвижение по одному и пачками по 10 тиков дают одинаковые кадры/исходы. Seek на 0/1/94/95/96 и terminal tick, затем +1, возвращает точное сохранённое состояние. `advance(0)`, продвижение после done и изменение копии snapshot не меняют исходное состояние. Первый реальный контакт во всех шести — `leaf-01`: событие tick94, точный post-step кадр tick95. По коду Art/Geometry вызывают render, а не физический шаг; их действительное поведение и пауза в браузере остаются непроверенными.

`IN_BUCKET` в этой ограниченной выборке **не наблюдался**. Все LOST совпали с принятым native входом, поэтому это не найденная подмена controller/ядра и не доказательство невозможности попадания. Успешный пример и визуальный вход в корзину не подтверждены; геометрия ради результата не менялась.

## Связанное замечание к коду сканера

**[P2] Сужение сканера ослабляет обнаружение настоящих локальных путей.** В `builder/scripts/build-static.mjs:80` на source `5f40f669…` замена общей проверки на `(?:^|["'\s])[A-Z]:[\\/]` действует на все текстовые файлы. Независимо подтверждён исходный false positive: старый `[CDEK]:[\\/]` ошибочно видит `e:\` внутри стандартного Pixi regex `/^file:\/\/\//`. Первый build-01 stderr сохранён; его прочитанная причина — именно `vendor/pixi.mjs`, также есть отдельное предупреждение об устаревшем `legalComments`.

Однако новая граница пропускает как минимум `const p=\`E:/example-private/core.ts\`;` и `{"url":"file:///E:/example-private/core.ts"}`. Старый сканер обнаруживал оба; новый — нет. Обычная строка `"E:/…"`, private source и source-map controls по-прежнему обнаруживаются. Следовательно, выполнена общая смена эвристики, а не исключение только доказанного Pixi false positive. Это дефект защиты будущих сборок; **фактической утечки в проверенных bytes candidate-02 не обнаружено**. Candidate не исправлялся. Lead/CTO получает замечание вместе с остальным выводом; не смешивать его с блокировкой доступа к просмотру.

## Непроверенное и границы результата

Подтверждённого HTTP(S) preview для exact bytes нет. По передаче Lead `/review/` в IAB приводит к login redirect, авторизованной сессии нет; file-preview уже отклонён инструментом как недопустимый протокол. Эти действия не повторялись; новый сервис/порт/launcher, иной actor для обхода, извлечение credentials и изменение auth не использовались. Собственного нового policy rejection не было.

Не проверены реально отданные Review bytes, HTTP/CSP/MIME/importmap/resource status, WebGL/Pixi initialization, ошибки работающей UI, DOM-кнопки random/replay/pause/ticks, скачивание JSON, независимость Art/Geometry/zoom на живой сцене и видимость диагностики сквозь маски. Чтение кода и Node-сравнение этого не заменяют. Реальные видимые контакты, частичные перекрытия, тени и художественная цельность не оценивались. Четыре имеющиеся накладки — `flower-01`, `leaf-01`, `frog-01`, `wood-01`; ещё 21 препятствие, ограда и бортики корзин не покрыты. Это известная граница самого результата, а не новый запрос полной будущей матрицы.

Первый запуск собственного QA-runner остановился на ошибке его regex-извлечения импортов из minified Pixi. Экстрактор заменён на Node `SourceTextModule`; последующее исполнение завершилось exit0. Это ошибка проверочного сценария, не дефект candidate. Builder selfcheck/prepare/build/serve не запускались и чужой STATIC_CHECK не использован как PASS.

Перед исполнением свежий замер: C7.882 / D16.307 / E37.567 GiB. Сохранена совокупная плановая оценка C1.525 GiB; новые собственные outputs запланированы не более 8 MiB на E, Node compile cache отключён, TEMP/TMP заданы только процессу на E. Пороги >4/<=4/<=2 GiB соблюдены, прежний резерв10 не применялся. Собственные фоновые процессы не оставлены; evidence сохранён.

Повтор аудита выполняется из своего E-worktree имеющимся Node 24: `D:/nodejs/node.exe --experimental-vm-modules experiments/p2-free-approach/qa/technical/candidate-02-offline.mjs --artifact E:/R4D/perspective/p2-runtime/output/p2-jungle-static-candidate-02 --output E:/R4D/perspective/p2-runtime/output/technical-qa/<новый-каталог>`, с process-local TEMP/TMP на E и отключённым compile cache. Предыдущий EVIDENCE не перезаписывать. Для точного воспроизведения уже наблюдавшихся бросков использовать seed/descriptor из сохранённого EVIDENCE; их replay проверен в этом проходе. Сейчас дополнительные прогоны и ожидание preview не выполняются.
