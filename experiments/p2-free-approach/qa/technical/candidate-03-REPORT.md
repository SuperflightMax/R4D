# P2 candidate-03 — новый ограниченный технический вывод

28 октября 2026, Europe/Kyiv. `technical-qa-r4d-p2-free-01`; turn `01a17fe3-6f9c-73d0-a462-f6b2cf137f95`.

**Offline-инварианты candidate-03 подтверждены в описанном объёме; новых code blockers в этой области не обнаружено. Замечание к сканеру candidate-02 закрыто. Полный Technical QA PASS, UI/Pixi/scene/art PASS не выдаются.** Решение об ограниченной штатной Review-публикации остаётся Lead; фактические HTTP/MIME/сцена требуют последующего отдельного наблюдения. Отчёт candidate-02 использован только как проверяемый baseline совпадающих bytes и траекторий.

## Exact artifact и собственное evidence

- Candidate: `p2-jungle-static-candidate-03`; source `e7ed4d068f33ee6ecda491f15dc46a6fd548ef96`.
- Artifact: `E:\R4D\perspective\p2-runtime\output\p2-jungle-static-candidate-03`; tree `bundle/review/r4d/p2-free-approach`.
- Фактически сверены **15 файлов / 2 448 161 bytes**, полный набор без дополнительных файлов и symlink, каждый размер/SHA-256 до и после исполнения.
- `BUILD_MANIFEST.json` SHA-256: `69a46f395278749ab44b81bcd78f0b70f6f1edf2bbd2d30ff536411d16bf5575`.
- Tree SHA-256: `d9dba321de0c4c9ba3acf61297b4fe0401a8ea9f0f4069362371dbc94fc0308d`, правило `SHA256(JSON.stringify(sorted per-file records)+LF)`.
- Свой runner: [candidate-03-offline.mjs](candidate-03-offline.mjs). Свои новые данные: `E:\R4D\perspective\p2-runtime\output\technical-qa\candidate-03-offline-01\EVIDENCE.json`, **76503 bytes**, SHA-256 `0a34ca7223d7b85fa9150ab94600592f4edc83d8d68fd78ce12bfdfcfaa85a41`, запись `2026-10-28T00:25:29.227Z`.

В evidence записаны собственные records всех файлов, source/output emissions, граф ссылок, результат privacy scan и controls, seed/descriptor/events/состояния contact checkpoints новых запусков. Прежний EVIDENCE `67f871ade76fa912ae5cfd41ab8199eb8cb64f188e6c684b6cbdaf15007374c6` и все 15 baseline-файлов candidate-02 заново проверены по хешам; они не переписывались. Frozen candidate-03 не изменялся и не пересобирался.

## Source → адаптированные browser bytes

Независимо сопоставлены все четыре `moduleEmissions`: source Git blob из exact `git show`, canonical-LF source SHA-256, declared references и фактические output bytes. Каждая разрешённая замена встречается ровно один раз. В HTML изменены только importmap `pixi.mjs` → `pixi.js` и entry `main.mjs` → `main.js`; в main — только три суффикса импортов core/controller/view-math. Недекларированных изменений этих файлов не найдено. Controller и view-math перенесены под `.js` без изменения bytes. Consumer Git blob в asset metadata относится к исходному main.mjs; соответствие адаптированному main.js подтверждено через emissions.

Ещё 11 пар current/baseline совпали побайтно с учётом переименования: config, accepted manifest, view-math, controller, compiled core, Pixi, license, JPG, два PNG и CSS. Asset manifest отличается от candidate-02 только provenance.candidate; metadata — только candidate/sourceCommit. Это проверенные различия, а не перенос старого PASS.

Config повторно совпал с принятым P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec` побайтно: SHA-256 `dd5c519cd6d4b7295118e0a3a1063efed424a0ce739450bd5153c6a9941982db`. Accepted manifest сохраняет все исходные поля, матрицы и domains, кроме объявленной замены локального JPG path на относительный source URL. Projection hash снова подтверждён по точному Git-объекту: `9ca9e520f1927426a3a5ba73a5eacaf90fedffc9385e7d08d5b1e6ee644b020c`; новая `.js`-функция transform дала roundtrip error `3.64e-12` на углах whole-source native domain при допуске `1e-7`.

Core `.js` SHA-256 остался `dbb01f3276fca9df7bacd69ecfb1e3737e74f6bd606b67041ec6ba5ca092c2a7`. У read-only native checkout повторно подтверждены commit `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023`, package tree `008d16a80a26bb77d562a45218b01da09b0d9ff0` и чистая область пакета. Полная шестисидовая native-матрица не повторялась: executable/config hashes не изменились. Pixi 8.22.0 и MIT license вновь совпали с существующим установленным SDK; JPG/ball/shadow hashes и все параметры арта сохранены.

## `.js`, граф модулей и GET-only исходник

Все **пять** browser modules имеют `.js`: main, controller, view-math, core и Pixi. Каждый разобран стандартным ES-module parser; весь граф main → imports/importmap успешно связан с проверкой требуемых экспортов **без исполнения Pixi/DOM**. Дополнительно реально импортированы frozen `.js` core/controller/view-math в Node 24 и исполнены физические сценарии ниже. Это подтверждает parse/link и указанное Node-исполнение, не WebGL или HTTP MIME.

Все 15 записанных HTML/import/importmap/resource/art/source-metadata ссылок разрешились в существующие файлы внутри `/review/r4d/p2-free-approach/`. Активные ссылки на `.mjs`, внешние/root-absolute зависимости не найдены; source/provenance имена `.mjs` в metadata не являются browser imports. App fetch остался единственным `fetch(url)` без options для JSON GET; обязательных POST/API, WebSocket/XHR/EventSource/sendBeacon в app-коде не найдено. Export по неизменённому исходнику формирует Blob/download JSON с сохранёнными условиями и provenance; настоящие DOM-click/download и сетевой GET ещё не наблюдались.

## Исправленный privacy scanner

Прочитан exact `scripts/scan-browser-text.mjs` через `git show`; его чистая функция вызвана собственным runner, без запуска Builder check/build/selfcheck. Независимо сверено включение **всех 12 текстовых файлов**, в том числе пяти `.js`, в manifest privacy scan. В фактических bytes нарушения не найдены; TS/maps отсутствуют. Единственное SDK-исключение — `[135846,135849)` внутри `vendor/pixi.js`, одновременно с точным окружающим контекстом и SHA-256 `a073adb40aaa803fd19066c21997a09f895397e98a5555be8bd0a7c57873d4ef`.

Собственные проверки: 10 положительных случаев реальных запрещённых ссылок (template literal, file URI, обычная строка, отсутствие границы, иной drive/backslash, lowercase drive, drive внутри HTTPS query, private checkout/source, source map), три отрицательных случая обычных HTTP(S)/относительного пути и три проверки SDK tamper/переноса. Всё соответствует ожиданию. Даже добавление одного LF в SDK снимает исключение и даёт integrity mismatch; добавленный реальный путь обнаруживается; те же SDK bytes под другим output path исключения не получают. Старые templateLiteral/fileURI пропуски candidate-02 не воспроизводятся. HTTP(S) delimiter классифицируется отдельно, но реальные пути дальше в URL продолжают сканироваться.

## Новое исполнение состояния, replay и тиков

Выбраны seed **1** и **490822599**: первый предзаданный и один ранее сохранённый обычный случайный seed. Новых seed ради успеха не подбиралось. Новый Controller из frozen `.js` с config/provenance candidate-03 исполнен до штатного terminal; SHA-256 всех кадров, полные конечные состояния и все события совпали с собственным hash-verified baseline, ранее независимо сопоставленным с native core. Повтор из новых descriptor с пачками по 10 тиков дал те же кадры/события; seek на 0, 94, 95, 96 и terminal, затем +1, дал точные состояния. В новом evidence сохранены сами checkpoints, а не только их номера.

Сопоставлены **3909 состояний**: seed1 — LOST tick1735, 14 контактов; seed490822599 — LOST tick2172, 25 контактов. Первый контакт — leaf-01, post-step frame95. Траектории различаются; новый descriptor несёт provenance candidate-03. `IN_BUCKET` в этих двух запусках не наблюдался; успешный вход в корзину по этому проходу не подтверждается. Двухпутевой delta-run соразмерен изменению расширений/ссылок при неизменных core/config/controller bytes.

## Что осталось непроверенным

У exact candidate-03 сейчас нет допустимого HTTP(S) target и подтверждённой post-auth сессии. Фактически отданные Review bytes, Content-Type JavaScript, CSP/MIME/importmap/resource loading, WebGL/Pixi initialization и ошибки живого UI не наблюдались. Смена расширения `.js` подтверждена; успешный HTTP MIME этим не объявляется.

Не проверены browser random/replay/pause/+ticks/Art/Geometry/zoom, JSON download DOM, диагностические маски на кадре, видимые контакты/частичные перекрытия/тени/сцена и корзина. У арта сохранены только четыре occluder (`flower-01`, `leaf-01`, `frog-01`, `wood-01`); остальные 21 препятствие, ограда и бортики корзин не покрыты. Это известная продуктовая граница ограниченного результата. Новых defects в доступной offline-области нет; неустановленный browser scope не записан как дефект кода или PASS.

Ни старый Windows composite/serve/browser, ни отклонённый file-preview не повторялись. Новый сервер/порт, пересборка, доступ к credentials/secretconfigs/allowlists и изменение permissions не выполнялись. Своего нового policy rejection нет. Публикация не выполнялась.

Перед новым Node-пакетом свой свежий замер: C7.723 / D16.305 / E31.520 GiB; сохранена плановая оценка C1.525 GiB, свои E outputs ограничены 8 MiB. TEMP/TMP только process-local на E, Node compile cache отключён. Прежний резерв10GiB не применялся. Процесс завершился exit0, собственных фоновых процессов нет. Пути core/SDK заданы только обязательными CLI-аргументами; public source не содержит их операторских значений.

Пример повторения из своего E-worktree: `<NODE_24> --experimental-vm-modules experiments/p2-free-approach/qa/technical/candidate-03-offline.mjs --artifact "<CANDIDATE_03_ARTIFACT>" --baseline-artifact "<CANDIDATE_02_ARTIFACT>" --baseline-evidence "<PRESERVED_QA_02_EVIDENCE>" --output "<NEW_E_RUNTIME_QA_OUTPUT>" --core-root "<PINNED_MILLIONKO_CHECKOUT>" --pixi-root "<EXISTING_PIXI_PACKAGE>"`. Использовать process-local E temp и отключённый compile cache, не перезаписывать evidence. Этот проход закончен без активного ожидания preview.
