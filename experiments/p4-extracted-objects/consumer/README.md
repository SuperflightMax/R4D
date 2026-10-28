# P4 consumer: первая интеграционная версия

Настоящий неизменённый `@millionko/sim-core`, PixiJS **8.22.0 / MIT**.
Все числовые входы берутся exact git objects принятого P1
`4b47db04c7140ebf88f69b91faa0b790d46f22ec`, их SHA-LF проверяются при сборке.
Helpers adapter, view-math, registration и geometry также из этого P1.
Старое provisional/status-поле manifest P1 — история, а не отмена его последующей
приёмки и не подтверждение качества P4.

Никакие P2/P3/P5/P6 материалы не используются. Config и native проекция не
изменяются. Только seed меняется при обычном новом броске. Тик 5 ms; симуляция
не получает визуальный PRNG, обратную связь от UI, масштабирования или арта.

## Запуск оператором

Работать из этого каталога. Задать process-local `P4_RUNTIME` абсолютным путём
своего runtime и `MILLIONKO_SOURCE` разрешённой read-only копией private ядра.
Его HEAD обязан быть `5a6fa03f1cdb3de88a2d9c7dbe795eb8e2a7f023` без изменений sim-core.
`TEMP`, `TMP`, npm cache направить в собственный runtime. Глобальные настройки
не менять. До тяжёлого шага проверить RAM/CPU/диски; <=4 GiB на E — диагностика,
<=2 GiB — checkpoint и остановка.

1. Установить в runtime обычные зависимости:
   `npm install --prefix "$env:P4_RUNTIME" --no-audit --no-fund --save-exact pixi.js@8.22.0 esbuild@0.25.12`.
2. `node scripts/prepare.mjs` — точные входы, лицензии, minified bundle без maps.
3. `node scripts/check.mjs` — сравнение с native runUntilDone, шесть обычных
   seeds, checkpoint/seek/PRNG/events. Seeds сохраняются до проверки, не отбираются.
4. `node scripts/serve.mjs` — локальная сцена `http://127.0.0.1:4394/`.

`P4_CANDIDATE` задаёт отдельный каталог кандидата; по умолчанию `integration-01`.
`P4_PORT` меняет локальный порт. Artifact/staging, private compiled audit module,
кеш и зависимости остаются в runtime. В public Git нет native TS, maps,
private checkout path или compiled native bundle.
Для публикации передаётся только подготовленная папка `candidates/<name>`:
она содержит исполняемый minified JS, входные JSON, JPG/PNG, лицензии и hashes.
Сам public код импортирует обычный package namespace; путь задаётся только env.

Artist передаёт `P4_ART_COMMIT` и `P4_ART_MANIFEST` — exact git commit и путь
его manifest. Сборка копирует только перечисленные файлы и сверяет их SHA256.
Не запускать полный стык на непереданном или меняющемся checkout Artist.
Предложенный контракт — [ART_INTEGRATION.md](ART_INTEGRATION.md).

## Что уже работает

Один run/tick для исходной перспективы и native плоскости. Art и Geometry
независимы; geometry — фактический config, незалитые контуры поверх арта.
У выключенного арта нет невидимых масок. Random/replay, пауза, +1/+N,
seek, экспорт/импорт точного checkpoint с seed/config/version/state/PRNG/events.
При импорте ядро заново воспроизводит состояние; несоответствие отвергается
до замены текущего run. Ни один вызов не реализует свою физику.

Consumer принимает отдельные части, anchors/padding, shadow/body/foreground,
native-Y порядок и отдельные части корзины. Flat просмотр переводит тот же арт
через принятую обратную проекцию; это выпрямление пола, не реконструкция 3D.

## Текущая граница

Artist-комплект пока не передан. При его отсутствии сцена явно показывает
исходник с диагностическими контурами. Круг — только диагностика, не ball-art.
Это не подтверждение извлечения, корректности alpha/shadows/depth или полноты
комплекта. UI-экспорт/импорт пока не проверены отдельным браузерным file-flow;
native сериализация и точный roundtrip проверены.
Следующий наблюдаемый шаг: реальный малый стык с двумя типами и частью корзины,
потом сохранённый frozen candidate для независимых QA.
