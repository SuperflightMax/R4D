# P2 Builder: Jungle, PixiJS и настоящий Millionko

Основа отдельного локального стенда. Обязательства: [общий заказ](../../../orders/perspective/ORDER.md), [P2](../../../orders/perspective/P2-free-approach.md). Методы P3–P6 не использовались. Канонический R4D-вход `df760b680f0d0264342fc8577fcc5779b80a3a15`.

## Текущая статическая сборка P2

**Delivery04 сейчас на serialization hold:** CTO window/token выдан P3,04token/serverwrite=false. Уже запущенный local packet сохранён как [obsolete03 draft](RELEASE_DRAFT_04_SERIALIZATION_HOLD_01.md), не ready/token request; raw files не перезаписаны. Frozen04 и actual TQA df309… сохраняются. До адресного explicit CTO P3-token release черезLead никаких новых baseline probes/упаковок/серверных действий; после него нужен новый coherent baseline и fresh новый intent outputID. Это не продуктовая пауза и не требует нового Max resume.

Для будущей доставки04 выполнен только [read-only preflight04-01](REVIEW_PREFLIGHT_04_01.md): coherent06:33UTC snapshot установил actual live03/all472filehashes/modes и absent04targets; draftP2card+39bytes/root-onlyinverse проверены в памяти. Финальные release intent/manifest/archive не готовились, token/serverwrites0. Sharedbaseline может измениться; после actualTQA нужны новое адресное final-local поручение и свежиеguards.

После явного resume Max [diagnosis/plan01](ANDROID_LAYOUT_AND_PLAYBACK_PLAN_01.md) и [playback source01](PLAYBACK_SOURCE_01.md) прошли review Lead. По отдельному build gate заморожен локальный [candidate04](STATIC_CANDIDATE_04.md):actualbuildHEAD08f9b9eaa6aa1063eb7fcd9cf373ddacf907725a/implementation0a80…,16files/2452021bytes/tree60d216a64c86fed4b83f4ed3802e3d1393cdda2db8776818d22710173dc2ffed.6.js modules,0.25×default/0.5×/1×, fractional clock иhistory; ownstatic/emittedboundarychecks passed, independentTQA pending.04 пока не опубликован; published03/frozenbytes сохранены. UI/DOM/WebGL/mobile/MIME unverified, touch/size/occlusion не исправлялись. Новый release intent/gate/token не выдан.

**Limited Review опубликован:** [Jungle P2](https://superflight.space/review/r4d/p2-free-approach/). [Actual delivery03](DELIVERY_03.md): root switch28 октября02:41:09 Europe/Kiev; fresh guards,472-file tree/15 frozen hashes/456 preserved oldfiles и защитные HTTP статусы проверены, server docs обновлены. Реальные authenticated200/JS MIME/browser/Pixi/UI/download/scene остаются непроверенными; P2 не закрыт, полного Technical/art PASS нет. Lead явно освободил single token после сверки evidence/postchecks/docs; после уведомления только локальная финализация. Frozen03/source e7ed… не менялся.

Заморожен [candidate-03](STATIC_CANDIDATE_03.md): source `e7ed4d068f33ee6ecda491f15dc46a6fd548ef96`, **15 files/2448161 bytes**, tree SHA256 `d9dba321de0c4c9ba3acf61297b4fe0401a8ea9f0f4069362371dbc94fc0308d`, BUILD_MANIFEST SHA256 `69a46f395278749ab44b81bcd78f0b70f6f1edf2bbd2d30ff536411d16bf5575`. Новые actual03 TQA/VQA получены: offline-инварианты подтверждены в ограниченном объёме, scanner finding закрыт; VQA — RUNTIME_VISUAL_NOT_OBSERVED. Полного Technical QA/art PASS нет. Browser/HTTP/UI/Pixi/download/visual не проверены; frozen bytes не менялись.

Выполнен exact [final release intent03/01](RELEASE_INTENT_03_FINAL_01.md) по Lead gate/single CTO token: full tree472 files/85200941 bytes, прежний catalog и17-file patch с actual03 QA metadata. Сам final intent остаётся неизменённой историей разрешённого write-set; actual guard/write/switch/postcheck receipts находятся в DELIVERY_03.md и E runtime. [Предварительный intent03](RELEASE_INTENT_03.md) и archive сохранены как история.

Новое прямое поручение Dot/Lead: candidate-03 исправляет MIME delivery в самом сборщике. Node/source файлы остаются `.mjs`; browser outputs — только `.js` для пяти ES modules. HTML/importmap и три статических import main переписываются по явному списку с проверкой единственного совпадения, без массового rename и без правок minified Pixi. `moduleEmissions` фиксирует source blob/canonical SHA и конкретную адаптацию bytes. Nginx/MIME/security не меняются; существующий mapping `.js` даёт prediction JS MIME, HTTP ещё не проверен.

В той же разрешённой build revision исправлен scanner regression: все `.js` проверяются, drive paths обнаруживаются независимо от quote/boundary, включая template/fileURI. Только точный span135846..135849 публичного Pixi URI-regex допускается при полном normalized SDK SHA256 `a073adb40aaa803fd19066c21997a09f895397e98a5555be8bd0a7c57873d4ef`, точном контексте и output path. HTTP(S) scheme delimiter классифицируется отдельно от drive prefix; никакая часть URL после scheme не пропускается. `scripts/check-browser-scan.mjs --pixi <pinned SDK bytes>` содержит контрольные примеры, изменённый/неподписанный SDK не получает exception. Полного skip файла нет.

Candidate-02 и release-intent-01 сохранены как история и не публикуются по новому token. Source03 зафиксирован до build в новый отсутствовавший каталог; exact source/check/build/tree/archive hashes приведены в handoff. Старые TQA/VQA — только baseline; нужны новые проверки exact03. Browser/HTTP VQA — после штатной limited publication и отдельного gate/token; старый launcher/file-preview не используется.

Исторический [frozen candidate-02](STATIC_CANDIDATE_02.md): source `5f40f6692dc5e7238afc961a2e0afa826cdefc9b`, 15 файлов /2448166 bytes; сохранён без изменений. Текущий handoff относится к03.

28 октября получено новое поручение CTO/Lead: самостоятельный static bundle для `/review/r4d/p2-free-approach/`, затем независимые проверки одного frozen candidate и отдельный exact release gate Lead. Исходный art по умолчанию — Jungle v2. Все ресурсы относительны route. Повторы сохраняются явным скачиванием JSON; random/replay не зависят от API. Только четыре прежние накладки остаются известным ограничением.

`scripts/build-static.mjs` использует имеющиеся Pixi8.22.0 и Rolldown1.2.15, принимает явные `--output`, `--version`, `--core-root`, `--pixi-root`, `--bundler-root`, `--source`. Output должен быть новым каталогом внутри P2 runtime на E; повторная запись кандидата запрещена. Перед сборкой требуется чистый source commit и проверяются pinned inputs/core. Настоящее неизменённое ядро компилируется отдельно в `runtime/sim-core.js`; TS, maps и локальные пути в browser tree не попадают. Приватный compiled runtime хранится только в E artifact, не в публичном Git. Pixi MIT license включается.

`BUILD_MANIFEST.json` находится вне browser tree: source commit, provenance, точные bytes/SHA256 всех файлов и tree digest. `scripts/check-static.mjs --artifact <E artifact>` проверяет exact файл-набор, относительные ресурсы, default art/config и реальные траектории уже скомпилированного ядра против прежнего pinned native baseline. Это не просмотр Pixi, не проверка download через браузер и не независимый QA.

Старый `serve.mjs` и отклонённый Windows server/browser packet не используются и не являются способом проверки. Нового сервиса/порта нет. Подтверждённый существующий маршрут просмотра frozen candidate до root switch пока не установлен; protected Review и его auth не менялись. До gate нет внешней записи. Точные artifact paths и результаты находятся в рабочем состоянии после сборки.

## История source-only handoff

Исторический статус данных: **SOURCE_READY_RUNTIME_UNVERIFIED**. Source manifest — [source-packets/jungle-art-v2/manifest.json](source-packets/jungle-art-v2/manifest.json); точные готовые PNG лежат рядом. [Описание пакета](source-packets/jungle-art-v2/README.md) содержит SHA256, bytes и перенос полей Artist v2. Этот пакет сохранён; browser manifest статического кандидата выводится из него с актуальной source provenance. Сцена не просмотрена, P2 не закрыт.

## Историческая инструкция запуска diagnostic-основы

Рабочая папка: `E:/R4D/perspective/p2-worktrees/builder/experiments/p2-free-approach/builder`. Node 24, установка пакетов и сборка не требуются. Перед разрешённым тяжёлым пакетом требуется свежий совокупный disk guard; эта инструкция его не отменяет.

```powershell
node scripts/prepare-inputs.mjs
node scripts/prepare-artist-probe.mjs
node scripts/selfcheck.mjs
node scripts/serve.mjs --port 4387 --assets E:/R4D/perspective/p2-runtime/output/builder/artist-probe-v1/manifest.json
```

Сервер слушает только `http://127.0.0.1:4387`. Для воспроизводимого точного кадра: `/?seed=1&paused=1`. Обычно старт выбирает случайный uint32 вне PRNG симулятора. Кнопка «Новый бросок» сохраняет наблюдавшийся запуск и выбирает новый seed. «Повтор» использует тот же seed и полный неизменный config. «Сохранить повтор» пишет JSON только в `E:/R4D/perspective/p2-runtime/output/builder`, не в Downloads.

Из окружения используются только существующие read-only зависимости: PixiJS 8.22.0 из принятого P1 viewer и настоящий core из `D:/dev/.codex-worktrees/r4d-p1-collider-mapping/millionko-source/lead`. Путь Pixi можно передать `--pixi-root`, ядра — `--core-root`, исходника — `--source`, manifest Artist — `--assets`. Значения не являются поручением миграции или установки. Источник проверяется SHA256, core — точным HEAD и отсутствием изменений пакета.

Приватные TS-исходники не копируются в tracked файлы, публичные файлы сцены или архив. Node 24 преобразует типы в памяти: браузер получает отдельные локальные `/private/core/*.js` модули, собственный JS сцены их импортирует. Source maps не создаются. Это локальная интеграция; публикация приватного runtime и deploy этим стендом не разрешены. Публичные файлы сами по себе не заменяют ядро и без него не имитируют движение.

## Закреплённые входы

`scripts/pins.mjs` содержит exact P1/core ревизии и SHA256. `prepare-inputs` извлекает четыре файла из Git P1 `4b47db04c7140ebf88f69b91faa0b790d46f22ec`; каждый сравнивается с точным объектом. Это config, manifest, кандидат проекции и исходная функция transform. P1 арт не копируется.

Единственное изменение экземпляра физической конфигурации — `rng.seed` выбранного запуска. Старт, 25 pins, 16 segments, 4 buckets, r16, tick5ms и параметры физики неизменны. На максимуме тиков вызывается штатный `timeoutSimRunSession`, как в native `runUntilDone`.

## Проверка

`selfcheck.mjs` использует настоящий пакет через Node, а не mock. Проверяет семена 1/2 без подбора: равенство controller/native headless, точные повторы кадров у контактов, равенство единичных и пакетных тиков, различие обычных траекторий, сохранность config и обратимость проекции. Отчёт — в runtime `selfcheck.json`. Этот скрипт не выдаёт visual PASS.

В браузере `window.p2QA`: `snapshot()`, `pause()`, `step(n)`, `seek(tick)`, `replay(seed)`, `random()`, `finish()`, `setArt(bool)`, `setGeometry(bool)`, `setZoom(1|1.5|2)`, `exportRuns()`, `save()`. Все переходы кадров пересчитываются штатным ядром от seed. Контакт native tick N соответствует post-step кадру `observedAtTick=N+1`; для bucket-событий сохраняется реальный post-step tick.

UI и API используют один controller. Пауза не интерполирует шар: показывается точное состояние выбранного тика. Контуры и путь вычисляются из actual config, рисуются выше всех накладок; скрытый арт не скрывает диагностику. Масштаб, отображение и ассеты не получают доступа к PRNG.

## Арт и ограничения

[Контракт Artist](ASSET_CONTRACT.md). Малый пакет Artist exact `fc892908d54cd06a44eb785edea4a9c5b32e3c97` подключён adapter без правок Artist worktree: четыре source-силуэта и отдельная тень; rasterball отсутствует. Исходный режим — явно помеченный диагностический круг, без художественного PASS. Малый пример ограничен четырьмя семействами до проверки бокового контакта. Радиус растрового шара следует локальному горизонтальному масштабу проекции, его опора и тень отображаются отдельно. Сортировка накладок по native-depth пока гипотеза, которую надо подтвердить собранными кадрами.

Существенные неудачи и точка продолжения — [BUILDER_STATE.md](BUILDER_STATE.md).
