# Q5A-NELA-ASSEMBLY-03 — коррекция framing 2×

25 октября2026, Europe/Kyiv. **BUILDER_CORRECTION_SELF_CHECK_COMPLETE.** Узкий CM1/AM-A1; художественный PASS не объявляется. Frozen02 — f86e1dccb2748b901d1e2480669347c71de464ae; текущая база и оба неизменённых review —651580dbbf764879dad5f413b3272ff4cde19557.

## Что исправлено и проверено

Прежняя проверка02 не измеряла bounding box каждого flight кадра и пропустила обрезание apex. Новый общий fit использует весь material bbox, padding24px и допустимый camera origin; 1× оставлен прежним. Ни motion.js, ни rig.js, принятый арт/конструкция, controls или source reviewer evidence не изменялись. На exact свидетелях старая формула воспроизводимо даёт отрицательный верхний отступ, новая — положительный.

`npm test` — PASS: все прежние15120 кадров/14 сценариев без изменения motion; дополнительно20618 framing checks с1×/2×. Минимальные logical margins:1×11.5107px,2×24px (допуск floating point); min/max scale2.0/2.0. CSS scale ratio2×:1×=1.5. Есть весь prepare/push/flight/landing/recovery из idle/low/walk и соседние±3 кадра точных свидетелей. `npm run build` — PASS, в dist включён framing.js, accepted SHA/derived resource hashes проверены.

Собственные текущие команды и измерения сохранены только в [output/builder-framing-correction/](output/builder-framing-correction/): `npm-test.log/json`, `build.log`, browser driver/config/logs, новые screenshots и итоговые browser JSON. Старые output/self-check и artist-motion-* не перезаписывались.

Браузерный regression независимо проецирует каждый material vertex по фактическим WebGL uniform origin/scale/camera, проверяет canvas margins и CSS-увеличение. Источник bbox не берётся из нового framing-report как единственное доказательство. Воспроизводятся Concept start9/10+120substeps (129/130), Asset desktop350 с полным сравнением landmarks, их соседи и mobile recipe2824; переключение1×/2×/фонов/diagnostics не меняет pose. На старом Mobile Asset realtime не сохранены все начальные моторы/тики команд; его paused recipe/phase воспроизведены, абсолютная историческая world-поза не выдумывается. Точные desktop и Concept landmarks сверены отдельно.

Фактический браузерный итог — `browser-regression.json`: **BROWSER_FRAMING_PASS**,5 групп точных/recipe witnesses,2484 отрисованных substeps в12 полных jump sweeps (3 origins×2 масштаба×2 viewport),4 realtime маршрута A/B,0 page errors. WebGL Float32 minimum2× margin **23.9999408283px**; minimum CSS margin short desktop **11.3905969165px**, mobile **6.8249831730px**. Во всех измерениях scale2 и ratio **1.5**, samePose=true; Concept129/130 и Asset350 landmark error0.

`dist-smoke.json` — **DIST_FRAMING_PASS**,28 фактических canvas checks на соседях126…132, desktop/mobile,1×/2×, light и dark+diagnostics; min2× margin23.9999846605px. Dist обслуживался тем же собственным5189 после остановки source server. Новые screenshots содержат целые волосы/кисти/обувь на верхней точке; лично просмотрены desktop CM1 light/diagnostics и mobile CM1/AM-A1 diagnostics. Отзывы художников не обновляются этим результатом.

Точные команды correction выполнялись из Q5A: `npm test` и `npm run build` с redirect только в новую correction directory. Браузер: `$env:PORT='5189'; node assembly/server.mjs`, а CLI из `output/builder-framing-correction`: `npx --yes --package @playwright/cli playwright-cli -s=q5a-builder-framing-5189 open http://127.0.0.1:5189/review/r4d/q5a-construction-first/ --config=cli.config.json`, затем `run-code --filename=browser-regression.js` с тем же prefix. После source server stop: `node assembly/server.mjs --dist` с PORT5189, затем `run-code --filename=dist-smoke.js`.

Для zero-tick повторяемости test driver удерживает только первый requestAnimationFrame до штатной паузы, затем восстанавливает реальный scheduler. Ошибка первого harness `undefined.push` устранена сохранением/обнулением массива callbacks вместо delete; ожидания используют polling50мс. Это изменение только test driver, не production и не ослабление bbox assertions. Моторы/pose вручную не подменяются. Обе основные последовательности затем отдельно выполняются настоящими UI-командами и обычным requestAnimationFrame. Проверены короткий desktop1280×720 и отдельный mobile390×844/touch/DPR3 context; light/dark,1×/2×,без/с bones+mesh. Это Chrome emulation, не физический телефон. Служебные старые .playwright-cli не затрагиваются; outputDir CLI направлен в новую correction directory.

Допуск browser GPU margins учитывает округление uniform доFloat32, а геометрический padding оставляет запас для anti-aliasing/диагностических штрихов. Целый силуэт проверяется внутри canvas; при открытии настроек страницу можно прокручивать, семантика controls/scroll не менялась. Динамическое кадрирование может увести линию земли за2× canvas в полёте; оно не меняет самого движения.

Собственный browser и сервер5189 остановлены. QA, художнический повторный review, release, Q4A/Q2A и commit/push не запускались. Ниже оставлена историческая запись self-check02; она не заменяет новые CM1/AM-A1 результаты.

---

# Q5A-NELA-ASSEMBLY-02 — собственная проверка Builder

25 октября2026, Europe/Kyiv. **BUILDER_SELF_CHECK_COMPLETE / AWAITING_PERSONAL_ARTIST_MOTION_REVIEW.** Это проверка исполнителя, не независимый Technical/Visual QA и не художественный PASS.

## Числовая проверка и build

Из каталога Q5A выполнены `npm test`, `npm run assets`, `npm run build`. Зависимости продукта не устанавливаются. Итоговый полный прогон — [output/self-check-tests.json](output/self-check-tests.json):

| Проверка | Результат |
|---|---|
| Exact accepted inputs | Все3 SHA из ASSEMBLY.md совпали; исходные15 PNG проверены по package |
| JS rig против v4 | 19/19 поз, max coordinate error1.1368683772161603e-13 |
| Динамика | 14 сценариев ×1080 fixed steps = **15120 кадров** |
| Запросы | Основные обе последовательности, idle↔low, starts/stops walk, jump из idle/low/walk, ранние interruptions и8 seeded случайных серий с интервалами70–500мс |
| Reset при команде | Положение/скорости всех моторов и стоп **численно неизменны** в момент запроса |
| Кости | Max ошибка длины8.53e-14; IK решается во всех кадрах |
| Опора | Planted sole anchors не скользят; низ опорной обуви y=0 |
| Грани/контуры | **0 inversions /0 strict self-intersections** во всех15120 кадрах |
| Диапазон | Максимальный сгиб139.5527°; диапазон140° не урезан; reach clamp не потребовался |
| Цель в воздухе | Две одинаковые симуляции с разными ground commands дают **одинаковую текущую воздушную позу/траекторию** |
| Динамическая ткань |12 активаций, max shift скрытой точки талии2.1303px; topology/UV постоянны |
| Скорость движения | Max межкадровое смещение вершины12.942px при1/120с, near_hand в быстрой смене jump/prepare/push; команды не телепортируют позу, но махи могут быть энергичными |

Все контуры проверены по строгому пересечению непоследовательных рёбер; касания/коллинеарность этим критерием не оцениваются. Длина/anchor/face checks выполняются на каждом шаге. Static19 fixture сохраняет исходную разрешённую нулевую fold topology; runtime нулевые грани пропускает, а не удаляет их из данных. Проверка воспроизводима с seed20261025. Это конечный набор траекторий, не доказательство всех возможных непрерывных вводов.

Build проверяет3 исходных SHA и хеши производных RGB/двух alpha/rig-data, копирует только нужные браузеру файлы в `dist/`. Браузерный smoke test именно `dist/` — [output/dist-smoke.log](output/dist-smoke.log): низкая поза rootY100.0032, flight, последующий walk,2 маски,0 WebGL errors/инверсий. Архив первой попытки отдельно загрузился как ASSEMBLY-01.

## Реальный браузер

Встроенный браузер не инициализировался (`failed to write kernel assets`). Использован отдельный изолированный Chrome агента через [Playwright skill](C:/Users/user/.codex/skills/playwright/SKILL.md), личные вкладки пользователя не затрагивались. Основной viewport1280×900, мобильный390×844; первая попытка была также открыта при1280×720.

```powershell
npx --yes --package @playwright/cli playwright-cli -s=q5a-builder open http://127.0.0.1:5185/review/r4d/q5a-construction-first/ --browser=chrome
npx --yes --package @playwright/cli playwright-cli -s=q5a-builder run-code --filename=assembly/browser-check.js
npx --yes --package @playwright/cli playwright-cli -s=q5a-builder run-code --filename=assembly/browser-gpu-check.js
```

Первый сценарий использует настоящие кнопки/списки/checkbox браузера и фиксированное продвижение того же контроллера, чтобы остановить промежуточный кадр. Второй дополнительно проверяет обычный requestAnimationFrame с реальными ожиданиями и командами; он не подменяет время только расчётом в Node.

- [output/browser-self-check.json](output/browser-self-check.json): **BROWSER_SELF_CHECK_PASS**,20 сохранённых состояний,0 page errors,0 горизонтального overflow mobile; «Кадр +» даёт ровно2 tick. Выбранный stop target low сохраняется. Светлый/тёмный фон, mesh/bones и2× переключаются.
- [output/gpu-realtime-check.json](output/gpu-realtime-check.json): **GPU_AND_REALTIME_PASS**. В38 статических парах поза/кисть framebuffer с принятой authored alpha отличается от временно отключённой маски на4–9 пикселей. Это подтверждает реальное вычитание в GPU, а не только наличие имён в package. После теста исходные маски/слои возвращены. Обычное время продвинуло симуляцию2620→3057 tick, завершилось ground/low,0 WebGL errors.
- [output/playwright/](output/playwright/) — кадры idle→low, low→walk, prepare/push/flight/prelanding/landing, early interruptions, dark diagnostics,2× и mobile. Есть полные страницы desktop/mobile.

Точные команды smoke test dist: на отдельном временном сервере `$env:PORT='5186'; node assembly/server.mjs --dist`, затем `playwright-cli -s=q5a-builder run-code --filename=assembly/dist-smoke.js` через тот же npx. В конце временный dist-сервер и браузер агента закрыты; source dev-сервер5185 также остановлен по указанию CTO.

## Личный просмотр исполнителя

Просмотрены целиком20 browser captures и отдельные промежуточные/2× виды. Низкая поза заметно отличается от стойки; плечо/таз перемещаются с корпусом, локоть/колено меняют конфигурацию. В walk видны неподвижная относительно пола опора и поднимаемая стопа; разметка пола позволяет отличить перенос тела от скольжения. Прыжок имеет подготовку, отталкивание носком, отчётливый просвет до пола, возвращение к опоре и поглощение посадки. Ранние walk/jump запросы не возвращают персонажа в bind.

На просмотренных кадрах нет крупных разрывов тела, прямоугольного восстановления кисти или механической накладки. Источник света/рисунок кожи на сильном сгибе упрощается, руки иногда перекрываются в профиль; особенно в быстром повторном прыжке мах энергичный. Именно движение, контакт и эти места должны лично оценить оба художника. GPU anti-aliasing отличается от CPU/Pillow preview; полный попиксельный CPU/GPU матч и аппаратный mobile не заявляются. Непрозрачный фон сам по себе не использован как доказательство отсутствия любых alpha-дыр: отдельная GPU-проверка относится к маскам кистей, геометрические тесты — к сеткам, общий вид — к просмотренным кадрам.

## История и сохранность

Первая реальная сборка и её дефект сохранены в [assembly/attempts/01/ATTEMPT.md](assembly/attempts/01/ATTEMPT.md). Существенные коррекции «мешало→изменено→результат» описаны в ASSEMBLY.md; прежние плохие состояния доступны в архивном viewer. Неудачный выбор browser label и кодировка тестового файла исправлены в обвязке проверки, кандидат из-за них не менялся. Первая favicon404 устранена локальным data favicon.

Принятые art/construction/reviews остаются на base без правок; правки только внутри `experiments/q5a-construction-first/**`, новые viewer/assembly/assets/dist/output/docs. Чужие work/JOURNAL.md, work/agents/cto-r4d-01.md, work/REVIEW_HANDOFF.md, корневая .playwright-cli/ и work/q3-local/q4-local/requests не редактировались и не очищались. Сотрудники/чаты, QA, Q4A/Q2A, imagegen, credentials, VPS/release, commit/push не запускались. Дальше — обязательный личный просмотр Asset Artist/Concept Artist по решению CTO.
