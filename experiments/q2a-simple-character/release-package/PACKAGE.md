# Q2A — локальный release package

25 октября 2026 года. Builder `builder-r4d-q2a-01`.
**PACKAGE_READY_FOR_INDEPENDENT_CHECK.** Упаковка принятого PoC с ограничениями;
публикация/VPS не выполнялись. Отдельный package-QA назначает Lead.

## Exact источник и состав

- Accepted source: `3c27b07d489f68b3d7d8b4c8beabd35c51402fd4`.
- Snapshot: `experiments/q2a-simple-character/snapshots/p2_candidate_c2/`.
- Tree: `0c60f912f11cae1ce5e5cf99a6a8ce8fafc70bc4`.
- Независимые QA accepted candidate: `d81c4bd1a31d3b23cedacf936f290fbef251090b`.
- Прочитаны `CTO_ACCEPTANCE_P2_C2.md`, `QA_GATE.md` и прямой packaging brief.

Публичное дерево: `route-tree/review/r4d/q2a-simple-character/`.
Оно предназначено ровно для `/review/r4d/q2a-simple-character/`.
**18 файлов, 1 179 499 байт**, включая:

| Группа | Файлов |
|---|---:|
| index.html с canonical controls и краткими ограничениями | 1 |
| runtime main.js, motion.js, pose.js, style.css, art-binding.json | 5 |
| PixiJS и MIT license | 2 |
| Принятые PNG частей | 10 |

Все исходные байты прочитаны непосредственно из accepted Git objects,
не из потенциально меняющегося working tree. Сборка, npm install, генерация,
изменение motion/rig/PNG или принятых snapshots не выполнялись.

## Provenance и разрешённые адаптации

`provenance.json` находится **вне публичного route tree**. Для каждого
публичного файла записаны путь, SHA256, bytes и source commit/path/blob,
а для преобразований — причина. SHA256 exact manifest:

`61691306ebe4adb5c043dd0abfc4ceebb333f9984f4032c1692d8cba85aafca5`

14 файлов — точные Git blobs: motion.js, pose.js, CSS, license и все10PNG.
Четыре явные адаптации:

1. `index.html`: route-relative ссылки; исключены debug-only изоляция
   поверхностей и переключатель скелетных ориентиров. Canonical кнопки,
   pause/history, light/dark сохранены. После viewer добавлено краткое
   честное описание принятия PoC, source/tree и ограничений.
2. `main.js`: module-relative адрес binding; принятый статус вместо прежнего
   ожидания художественного просмотра; удалены только соответствующие debug
   DOM-зависимости, skeleton overlay и `window.q2a` observer. Все поверхности
   видны как в принятом default. Команды, history, camera/ticker, генерация
   mesh и render formulas не изменены.
3. `art-binding.json`: только route-relative PNG URL и исключение неиспользуемых
   частных provenance/diagnostic полей. Version, scale, translation, вся rig,
   crop/offset/layer каждой части сохранены и проверены deep comparison.
4. `pixi.min.js`: удалена только завершающая sourceMappingURL-директива,
   38 байт. Исполняемый код библиотеки не менялся, source map не включён.

В публичном дереве нет raw/prompts, QA logs/screenshots, rejected attempts,
source maps, server-side scripts, локальных путей, private metadata либо
диагностических страниц/экспортов. Строгий allowlist содержит только18 файлов.
Включены только необходимые численные runtime-данные и browser assets.
Подготовка/preview/verification scripts, manifest и evidence лежат вне route.

Lead отдельно добавил `.gitattributes` для `release-package/route-tree/** -text`
ради сохранения exact публичных байтов при Git-доставке. Builder этот файл
не менял, commit/push не выполнял.

## Точный локальный просмотр

Из `experiments/q2a-simple-character/release-package/`:

```powershell
node preview-server.mjs
```

**http://127.0.0.1:4340/review/r4d/q2a-simple-character/**

Сервер оставлен работающим для package-QA/передачи: PID104852, exec85058.
Привязка127.0.0.1. Нужен только Node.js; npm ci, сборка и сеть не нужны.
`Q2A_PACKAGE_PORT` позволяет выбрать другой свободный порт, не меняя route.
Серверы accepted4333, baseline4330 и P14327 не затрагивались.

Повторная проверка неизменного пакета при работающем4340:

```powershell
node verify-package.mjs
```

`prepare-package.mjs` — сохранённая процедура копирования/адаптаций;
она намеренно отказывается перезаписывать уже готовое route tree.

## Самопроверка Builder exact route

- 18/18 локальных файлов сверены с manifest, bytes/SHA256 и их исходными
  Git blobs; 18/18 HTTP ответов совпали с manifest побайтно.
- Численные rig/part параметры совпадают с accepted source; source tree
  повторно сверен с заданным Git tree. Публичный список файлов точен.
- Семь probes частных/исключённых ресурсов получили404: server/check/debug
  страницы, source map, raw, art metadata и provenance. Из публичного текста
  исключены sourceMappingURL, local paths и отладочные DOM/API.
- Во встроенном браузере полный route загружен, PoC-статус и команда walk
  проверены. Основная воспроизводимая UI-проверка — собственная изолированная
  Playwright-сессия `q2a-package-builder`, без личного Chrome и чужих вкладок.
- Desktop1440×1000: idle→low→walk→idle→jump→idle; walk→low→jump,
  выборwalk в flight, новыйjump после посадки, выборlow в flight и итогlow.
  Canonical controls работают без debug API.
- Mobile390×844 на тёмном фоне: прерывание idle→low запросомwalk через80ms
  и jump через260ms; low выбран при явно показанномflight. Pause сохраняет
  время через220ms; history возвращает ранее записанный кадр, новая команда
  idle продолжает из него и завершается в наземной стойке.
- Light/dark, фигура/стопы, раскрытое описание с source/tree просмотрены;
  горизонтальныйoverflow=false, длинные IDs переносятся. На mobile возможна
  обычная вертикальная прокрутка под viewer.
- Browser console errors/warnings0; внешних HTTP(S) resource requests в
  наблюдаемой странице0. Все наблюдаемые HTTP(S) ресурсы относятся к полному
  `/review/r4d/q2a-simple-character/`, root-абсолютных загрузок `/runtime/`
  или `/art/` нет. Полный аудит дочерних worker targets не выполнялся.

Локальные evidence: `evidence/route-desktop-low.png`,
`route-mobile-dark-flight.png`, `route-mobile-about-full.png`;
CLI logs — в `.playwright-cli/`. Они не входят в route tree и не являются
независимым QA. Публичные байты и manifest после выдачи Lead под QA не менялись.

## Принятые ограничения и граница результата

Сохранены особенности accepted PoC: 49,201185° у дальней стопы на toe-contact,
61,257567° у свободной дальней стопы (иной статус контакта; от measured bind
59,542637°), глубокий контур колена, линия шорт/плотные складки, локальная
жёсткость плеча, перекрытие дальней стороны и субпиксельное пересечение
свободной стопы. Упаковка не исправляет и не скрывает их. Эти числа относятся
к воспроизведённым QA-случаям и не заявлены универсальными максимумами.

Реальный телефон/touch, все моменты команд, каждый кадр и широкая повторяемость
метода не доказаны. Локальная HTTP-проверка не подтверждает публичную доставку,
TLS/auth или post-auth просмотр Review. Пакет готов к отдельной независимой
проверке и решению CTO о серверной доставке; опубликованным Q2A не объявляется.
